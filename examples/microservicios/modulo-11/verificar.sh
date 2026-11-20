#!/usr/bin/env bash
# Módulo 7 · Spring Cloud e infraestructura (modulo-11)
# 1) Ejecuta las 5 demostraciones de jdk/ (solo JDK 25, sin dependencias).
# 2) Levanta Consul 2.1.0 con Docker Compose, registra el catálogo de f052-consul y lo busca en Consul.
# 3) Ejecuta los tests Spring Boot 4.1.3 + Spring Cloud 2025.1.4 de F052–F056 con el Maven Wrapper.
# Uso: ./verificar.sh            (requiere JDK 25, Docker con Compose v5 y curl)
#      ./verificar.sh --solo-jdk (solo el paso 1: no necesita Docker ni Maven Central)
set -u -o pipefail
cd "$(dirname "$0")"
java -version 2>&1 | grep -v Picked | head -1
fallos=0
rm -rf logs; mkdir -p logs          # todo lo que haga falta para diagnosticar queda en modulo-11/logs/
echo "== 1. Demostraciones con JDK puro"
for demo in Registro MiniGateway ConfigCentral Balanceador Bff; do
  echo "-- jdk/$demo.java"
  java -Dstdout.encoding=UTF-8 "jdk/$demo.java" 2>&1 | grep -v '^Picked up' | tee "logs/jdk-$demo.log" || fallos=$((fallos + 1))
done
if [ "${1:-}" != "--solo-jdk" ]; then
  echo "== 2. Consul con Docker Compose (logs en logs/)"
  docker compose version
  if docker compose up -d --wait; then
    ./mvnw -q -f f052-consul/pom.xml package -DskipTests
    # Consul corre en un contenedor: para llegar a /actuator/health de tu máquina usa host.docker.internal.
    java -jar f052-consul/target/f052-consul-1.0.0.jar --spring.cloud.consul.discovery.prefer-ip-address=false \
      --spring.cloud.consul.discovery.hostname=host.docker.internal > logs/consul-app.log 2>&1 &
    pid=$!
    registrado=no
    for _ in $(seq 1 90); do
      sleep 1
      kill -0 "$pid" 2>/dev/null || { echo "la app terminó sola (ver logs/consul-app.log)"; break; }
      if curl -fsS 'localhost:8500/v1/health/service/catalogo?passing=true' | grep -qE '"Service": *"catalogo"'; then
        registrado=si; break
      fi
    done
    # Evidencia para diagnosticar: registro, chequeos con su Output (el error HTTP que vio Consul) y logs.
    curl -sS 'localhost:8500/v1/agent/services' > logs/consul-servicios.json 2>&1
    curl -sS 'localhost:8500/v1/health/checks/catalogo' > logs/consul-chequeos.json 2>&1
    curl -sS 'localhost:8081/actuator/health' > logs/consul-app-health.json 2>&1   # ¿responde desde tu máquina?
    docker compose logs consul > logs/consul-contenedor.log 2>&1
    kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null
    if [ "$registrado" = si ]; then echo "OK: catalogo registrado y sano en Consul"; else
      echo "FALLA: catalogo no apareció sano en Consul en 90 s. Chequeos según Consul:"
      cat logs/consul-chequeos.json; echo
      echo "Últimas líneas de logs/consul-app.log:"; tail -20 logs/consul-app.log
      fallos=$((fallos + 1)); fi
    docker compose down
  else
    docker compose logs > logs/compose.log 2>&1
    echo "FALLA: Consul no quedó healthy (logs/compose.log)"; fallos=$((fallos + 1))
  fi
  echo "== 3. Tests Spring Boot + Spring Cloud (F052–F056)"
  ./mvnw -q test > logs/maven-test.log 2>&1 || { fallos=$((fallos + 1)); grep -E "ERROR|FAIL|Tests run:.*Fail" logs/maven-test.log | head -40; }
  # Informes de surefire (con la traza completa de cada test) copiados a logs/
  for d in f05*/target/surefire-reports; do [ -d "$d" ] && cp -r "$d" "logs/${d%%/*}-surefire"; done
fi
if [ "$fallos" -eq 0 ] && [ "${1:-}" = "--solo-jdk" ]; then
  echo "RESULTADO: OK · Módulo 7 (Spring Cloud e infraestructura) · parte JDK verificada (falta ./verificar.sh completo)"
elif [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 7 (Spring Cloud e infraestructura) verificado"
else
  echo "RESULTADO: FALLA · $fallos bloque(s) fallaron: busca arriba FALLA o el primer [ERROR] de Maven"
  exit 1
fi
