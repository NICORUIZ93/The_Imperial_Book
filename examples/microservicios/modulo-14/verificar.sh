#!/usr/bin/env bash
# Módulo 10 · Observabilidad (modulo-14)
# 1) Demostraciones con JDK puro (jdk/) y el validador del dashboard (Python 3).
# 2) Prometheus v3.15.1, Grafana 13.2.4, Jaeger 2.22.0 y Zipkin 3.6.1 con Docker Compose:
#    tests de reglas con promtool, dashboard aprovisionado, spans en Zipkin, f070 raspado por
#    Prometheus y f071 (pedidos -> inventario) visible en Jaeger.
# 3) Tests Spring Boot 4.1.3 de F070, F071 (OpenTelemetry y Brave/Zipkin) y F072.
# Uso: ./verificar.sh            (JDK 25, Python 3, Docker con Compose v5, curl)
#      ./verificar.sh --solo-jdk (solo el paso 1)
set -u -o pipefail
cd "$(dirname "$0")"
java -version 2>&1 | grep -v Picked | head -1
fallos=0
falla() { echo "FALLA: $1"; fallos=$((fallos + 1)); }
espera() { # $1 URL, $2 segundos
  for _ in $(seq 1 "$2"); do curl -fsS -o /dev/null "$1" 2>/dev/null && return 0; sleep 1; done; return 1; }

echo "== 1. Demostraciones con JDK puro"
for demo in MetricasPrometheus TrazasW3C LogsEstructurados PercentilP99; do
  echo "-- jdk/$demo.java"
  java -Dstdout.encoding=UTF-8 "jdk/$demo.java" 2>&1 | grep -v '^Picked up' || falla "jdk/$demo.java"
done
echo "-- grafana/validar_dashboard.py (antes debe fallar, después pasar)"
python3 grafana/validar_dashboard.py grafana/antes/promedios.json > /dev/null; [ $? -eq 1 ] || falla "validador: antes"
python3 grafana/validar_dashboard.py grafana/dashboards/pedidos-red.json || falla "validador: dashboard"

if [ "${1:-}" != "--solo-jdk" ]; then
  echo "== 2. Prometheus, Grafana, Jaeger y Zipkin con Docker Compose"
  docker compose version
  if docker compose up -d --wait; then
    echo "-- promtool test rules (F074)"
    docker run --rm -v "$PWD/prometheus":/p -w /p --entrypoint promtool prom/prometheus:v3.15.1 \
      test rules reglas_test.yml || falla "promtool test rules"

    echo "-- Grafana: fuente de datos y dashboard aprovisionados (F073)"
    curl -fsS -u admin:admin-solo-dev localhost:3000/api/dashboards/uid/tienda-pedidos-red | grep -q '"uid":"tienda-pedidos-red"' \
      && echo "OK: dashboard tienda-pedidos-red cargado" || falla "dashboard no aprovisionado"
    curl -fsS -u admin:admin-solo-dev localhost:3000/api/datasources/uid/prometheus/health | grep -q '"status":"OK"' \
      && echo "OK: Grafana llega a Prometheus" || falla "fuente de datos Prometheus"

    echo "-- Zipkin recibe los spans de jdk/TrazasW3C.java (F071)"
    espera localhost:9411/health 60 || falla "Zipkin no responde"
    ZIPKIN_URL=http://localhost:9411 java jdk/TrazasW3C.java 2>&1 | grep -E "POST|OK|FALLA" || falla "spans a Zipkin"

    echo "-- F070 raspado por Prometheus"
    ./mvnw -q -f f070-micrometer-prometheus/pom.xml package -DskipTests && {
      java -jar f070-micrometer-prometheus/target/f070-micrometer-prometheus-1.0.0.jar > target-f070.log 2>&1 & pid=$!
      espera localhost:8080/actuator/health 60 || falla "f070 no arrancó (target-f070.log)"
      ./carga.sh 20 5
      sleep 10
      up=$(curl -fsS 'localhost:9090/api/v1/query?query=up%7Bjob%3D%22f070-pedidos%22%7D' | grep -o '"value":\[[^]]*\]')
      p99=$(curl -fsS 'localhost:9090/api/v1/query?query=job:http_server_requests_seconds:p99_5m' | grep -o '"value":\[[^]]*\]')
      echo "up{job=\"f070-pedidos\"} $up · p99_5m $p99"
      echo "$up" | grep -q '"1"\]' || falla "Prometheus no raspa f070"
      [ -n "$p99" ] || falla "la regla de grabación p99 no tiene datos"
      kill "$pid"; wait "$pid" 2>/dev/null; rm -f target-f070.log
    } || falla "empaquetar F070"

    echo "-- F071 pedidos -> inventario en Jaeger (OpenTelemetry por OTLP)"
    ./mvnw -q -f f071-tracing/pom.xml package -DskipTests && {
      jar=f071-tracing/target/f071-tracing-1.0.0.jar
      java -jar "$jar" --spring.application.name=inventario --server.port=8082 > target-inv.log 2>&1 & p1=$!
      java -jar "$jar" > target-ped.log 2>&1 & p2=$!
      espera localhost:8082/actuator/health 60 && espera localhost:8081/actuator/health 60 || falla "f071 no arrancó"
      curl -fsS localhost:8081/pedidos/P-7; echo
      servicios=""
      for _ in $(seq 1 30); do
        servicios=$(curl -fsS localhost:16686/api/services 2>/dev/null)
        echo "$servicios" | grep -q pedidos && echo "$servicios" | grep -q inventario && break
        sleep 1
      done
      echo "servicios en Jaeger: $servicios"
      echo "$servicios" | grep -q inventario || falla "Jaeger no recibió las trazas de f071"
      grep -m1 "consultando pedido" target-ped.log
      kill "$p1" "$p2"; wait "$p1" "$p2" 2>/dev/null; rm -f target-inv.log target-ped.log
    } || falla "empaquetar F071"

    echo "== 3. Tests Spring Boot 4.1.3 (F070, F071 otel y zipkin, F072)"
    ./mvnw -q test || falla "tests Maven"
    ./mvnw -q -f f071-tracing/pom.xml -Pzipkin test || falla "tests F071 con Brave/Zipkin"
    docker compose down
  else
    falla "la infraestructura no quedó lista (docker compose logs)"
  fi
fi

if [ "$fallos" -eq 0 ] && [ "${1:-}" = "--solo-jdk" ]; then
  echo "RESULTADO: OK · Módulo 10 (Observabilidad) · parte JDK verificada (falta ./verificar.sh completo)"
elif [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 10 (Observabilidad) verificado"
else
  echo "RESULTADO: FALLA · $fallos bloque(s) fallaron: busca arriba FALLA o el primer [ERROR] de Maven"
  exit 1
fi
