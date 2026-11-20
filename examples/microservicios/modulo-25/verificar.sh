#!/usr/bin/env bash
# Módulo 21 · Observabilidad (modulo-25, fichas F130–F134).
# Sin argumentos: npm ci, los tests que no necesitan infraestructura y cada demo con su salida comprobada.
# Con --compose levanta Jaeger, RabbitMQ, Kafka, Loki, Prometheus y Grafana con Docker Compose y comprueba además
# que las trazas llegan a Jaeger, los mensajes propagan traceparent por RabbitMQ y Kafka, los logs llegan a Loki y
# Prometheus raspa /metrics. Con --externo usa brokers que YA estén arriba (AMQP_URL, KAFKA_BROKERS) y omite,
# avisando, los que no respondan. Si algo falla, sigue y lo reporta todo al final.
# Uso: ./verificar.sh [--compose | --externo]   (Node.js 26.13.1 LTS, npm y curl; bash 3.2 de macOS sirve)
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
rm -f logs/*.log
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
modo="${1:-}"
fallos=""
omitidos=0
falla() { fallos="${fallos}\n  ✘ $1"; echo "✘ $1"; }
pids=""
limpiar() { for p in $pids; do kill "$p" 2>/dev/null; done; }
trap limpiar EXIT

# paso "descripción" "texto que debe aparecer (o vacío)" comando...  → ejecuta, guarda el log y comprueba
n=0
paso() {
  local desc="$1" texto="$2"; shift 2
  n=$((n + 1))
  local log; log="logs/$(printf '%02d' "$n")-$(printf '%s' "$desc" | LC_ALL=C tr ' /:·' '-----' | LC_ALL=C tr -cd 'A-Za-z0-9._-' | cut -c1-40).log"
  "$@" > "$log" 2>&1; local rc=$?
  if [ $rc -ne 0 ]; then tail -n 15 "$log"; falla "${desc} (código ${rc}, ver ${log})"; return 1; fi
  if [ -n "$texto" ] && ! grep -qF -- "$texto" "$log"; then tail -n 15 "$log"; falla "${desc}: no aparece «${texto}» (ver ${log})"; return 1; fi
  echo "✔ ${desc}"
}
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }
esperar_url() { # esperar_url url segundos → 0 cuando responde 2xx
  local i=0
  while [ $i -lt "$2" ]; do curl -sf -o /dev/null "$1" && return 0; sleep 1; i=$((i + 1)); done
  return 1
}
responde() { # responde host puerto → 0 si acepta conexiones TCP
  node -e "require('node:net').connect($2,'$1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"
}
esperar_puerto() { # esperar_puerto puerto segundos
  local i=0
  while [ $i -lt "$2" ]; do responde 127.0.0.1 "$1" && return 0; sleep 1; i=$((i + 1)); done
  return 1
}

if ! command -v node > /dev/null 2>&1; then
  echo "✘ No encuentro node. Instala Node.js 26.13.1 LTS (https://nodejs.org) y vuelve a ejecutar."
  echo "RESULTADO: FALLA · falta Node.js"
  exit 1
fi
echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac

if [ "$modo" = "--compose" ]; then
  export EXIGIR_INFRA=1
  if command -v docker > /dev/null 2>&1; then
    echo "== Docker Compose: Jaeger 2.22.0, RabbitMQ 4.4.1, Kafka 4.4.0, Loki 3.7.9, Prometheus 3.15.1, Grafana 13.2.4"
    docker compose version
    paso "docker compose up -d --wait" "" docker compose up -d --wait
  else
    falla "--compose pide Docker y no encuentro el comando docker (instala Docker Desktop)"
  fi
  command -v curl > /dev/null 2>&1 || falla "--compose usa curl para consultar Jaeger, Loki y Prometheus y no lo encuentro"
fi

echo "== Dependencias (npm ci: @opentelemetry/sdk-node 0.301.2, pino 10.4.0, winston 3.19.0, @prometheus-io/client 0.16.1…)"
paso "npm ci" "" npm ci --no-audit --no-fund

echo "== F130 · OpenTelemetry para Node"
paso "F130 traza pedidos→inventario y OTLP" "pass 2" node --test --test-reporter=spec f130-opentelemetry/traza.test.js
paso "F130 error común: procesador estilo 2.x (silencioso)" "spans exportados: 0" node f130-opentelemetry/error-comun.js
paso "F130 error común con OTEL_LOG_LEVEL=error" "Cannot read properties of undefined (reading 'export')" env OTEL_LOG_LEVEL=error node f130-opentelemetry/error-comun.js

echo "== F131 · Propagación de traceparent en AMQP/Kafka"
paso "F131 tests de propagación (sin broker)" "pass 5" node --import ./f131-traceparent/trazas.js --test --test-reporter=spec f131-traceparent/propagacion.test.js
paso "F131 error común: cabeceras Buffer de Kafka" "¿es la del productor? true" env OTEL_SERVICE_NAME=demo node --import ./f131-traceparent/trazas.js f131-traceparent/error-comun.js

echo "== F132 · Pino/Winston"
paso "F132 tests de los loggers" "pass 5" node --import ./f131-traceparent/trazas.js --test --test-reporter=spec f132-pino-winston/loggers.test.js
paso "F132 demo" '"tarjeta":{"numero":"[OCULTO]","marca":"visa"}' env OTEL_SERVICE_NAME=pedidos node --import ./f131-traceparent/trazas.js f132-pino-winston/demo.js
paso "F132 error común: orden de argumentos" '{"level":30,"servicio":"pedidos","msg":"pedido creado"}' node f132-pino-winston/error-comun.js

echo "== F133 · Grafana Loki"
paso "F133 tests con Loki falso" "pass 3" node --test --test-reporter=spec f133-loki/loki.test.js
paso "F133 error común: id como etiqueta" "pedidoId} → 1000 streams" node f133-loki/error-comun.js

echo "== F134 · Prometheus client"
paso "F134 tests de /metrics" "pass 4" node --test --test-reporter=spec f134-prometheus/metricas.test.js
paso "F134 error común: cardinalidad y doble registro" "has already been registered" node f134-prometheus/error-comun.js

# ---------- Con infraestructura ----------
if [ "$modo" = "--compose" ] || [ "$modo" = "--externo" ]; then
  amqp_host=$(node --input-type=module -e "import { AMQP_URL } from './comun/config.js'; const u = new URL(AMQP_URL); console.log(u.hostname + ' ' + (u.port || 5672))")
  kafka_host=$(node --input-type=module -e "import { KAFKA_BROKERS } from './comun/config.js'; console.log(KAFKA_BROKERS[0].replace(':', ' '))")
  echo "== F131 con brokers reales"
  if responde $amqp_host || [ "$modo" = "--compose" ]; then
    paso "F131 RabbitMQ: CONSUMER hijo del PRODUCER" "pass 1" env BROKER=rabbit node --test --test-reporter=spec f131-traceparent/broker.infra.js
  else omite "F131 RabbitMQ (no responde ${amqp_host})"; fi
  if responde $kafka_host || [ "$modo" = "--compose" ]; then
    paso "F131 Kafka: CONSUMER hijo del PRODUCER" "pass 1" env BROKER=kafka node --test --test-reporter=spec f131-traceparent/broker.infra.js
  else omite "F131 Kafka (no responde ${kafka_host})"; fi
fi

if [ "$modo" = "--compose" ]; then
  echo "== F130 · trazas en Jaeger"
  if esperar_url "http://localhost:16686/" 60; then
    OTEL_SERVICE_NAME=inventario TRAZAS=otlp node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/inventario.js > logs/f130-inventario.log 2>&1 &
    pids="$pids $!"
    OTEL_SERVICE_NAME=pedidos TRAZAS=otlp node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/pedidos.js > logs/f130-pedidos.log 2>&1 &
    pids="$pids $!"
    if esperar_puerto 3131 20 && esperar_puerto 3130 20; then
      curl -s -X POST localhost:3130/pedidos/TEC-1 > logs/f130-respuesta.log 2>&1
      i=0; ok=0
      while [ $i -lt 30 ]; do # el BatchSpanProcessor envía cada 5 s
        # Jaeger 2: la API de consulta estable es /api/v3/services; /api/services (la interna de la UI) puede dar 404.
        { curl -s "http://localhost:16686/api/v3/services"; echo; curl -s "http://localhost:16686/api/services"; } > logs/f130-jaeger-servicios.log 2>&1
        if grep -q '"pedidos"' logs/f130-jaeger-servicios.log && grep -q '"inventario"' logs/f130-jaeger-servicios.log; then ok=1; break; fi
        sleep 2; i=$((i + 1))
      done
      if [ $ok -eq 1 ]; then echo "✔ F130 Jaeger ve los servicios pedidos e inventario"; else falla "F130: Jaeger no lista pedidos e inventario (ver logs/f130-jaeger-servicios.log)"; fi
    else falla "F130: pedidos o inventario no arrancaron (ver logs/f130-*.log)"; fi
  else falla "F130: la UI de Jaeger no respondió en :16686"; fi

  echo "== F133 · logs en Loki"
  if esperar_url "http://localhost:3100/ready" 90; then
    paso "F133 demo: Pino → Loki" "enviadas a Loki: 7 · perdidas: 0" node f133-loki/demo.js
    sleep 2
    curl -s -G "http://localhost:3100/loki/api/v1/query_range" --data-urlencode 'query={servicio="pedidos"} | json | level="error"' --data-urlencode 'limit=10' > logs/f133-logql.log 2>&1
    if grep -q 'cobro rechazado' logs/f133-logql.log; then echo "✔ F133 LogQL encuentra el error en Loki"; else falla "F133: LogQL no devolvió «cobro rechazado» (ver logs/f133-logql.log)"; fi
  else falla "F133: Loki no respondió /ready en :3100"; fi

  echo "== F134 · Prometheus raspa /metrics"
  node f134-prometheus/servidor.js > logs/f134-servidor.log 2>&1 &
  pids="$pids $!"
  if esperar_url "http://localhost:9464/metrics" 20; then
    for i in 1 2 3 4 5; do curl -s -o /dev/null "localhost:9464/pedidos/${i}"; done
    i=0; ok=0
    while [ $i -lt 30 ]; do
      curl -s -G "http://localhost:9090/api/v1/query" --data-urlencode 'query=sum(http_peticiones_total{job="f134-pedidos"})' > logs/f134-promql.log 2>&1
      if grep -q '"5"\]' logs/f134-promql.log; then ok=1; break; fi
      sleep 2; i=$((i + 1))
    done
    if [ $ok -eq 1 ]; then echo "✔ F134 PromQL: sum(http_peticiones_total) = 5"; else falla "F134: Prometheus no devolvió 5 peticiones (ver logs/f134-promql.log)"; fi
  else falla "F134: el servidor de métricas no arrancó (ver logs/f134-servidor.log)"; fi

  if command -v docker > /dev/null 2>&1; then
    docker compose logs > logs/99-docker-compose.log 2>&1
    docker compose down -v > /dev/null 2>&1
  fi
fi

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 21 (Observabilidad) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
