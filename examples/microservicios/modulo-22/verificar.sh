#!/usr/bin/env bash
# Módulo 18 · Comunicación (modulo-22, fichas F113–F118).
# Sin argumentos: npm ci, tests sin infraestructura (REST, gRPC, GraphQL, sobre de eventos, sync vs async) y
# cada demo con su salida comprobada. Con --compose levanta Kafka 4.4.0, RabbitMQ 4.4.1 y NATS 2.15.3 con
# Docker Compose y ejecuta además los tests y demos de F116 y F117. Con --externo usa brokers que YA estén
# arriba (KAFKA_BROKERS, AMQP_URL, NATS_URL) y omite, avisando, los que no respondan.
# Si algo falla, sigue y lo reporta todo al final.
# Uso: ./verificar.sh [--compose | --externo]   (Node.js 26.13.1 LTS, npm y curl; bash 3.2 de macOS sirve)
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
modo="${1:-}"
fallos=""
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
pids=""
limpiar() { for p in $pids; do kill "$p" 2>/dev/null; done; }
trap limpiar EXIT

esperar_puerto() { # esperar_puerto puerto → espera hasta 10 s a que acepte conexiones TCP
  local i=0
  while [ $i -lt 50 ]; do
    node -e "require('node:net').connect($1,'127.0.0.1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" && return 0
    sleep 0.2; i=$((i + 1))
  done
  return 1
}
arrancar() { # arrancar puerto nombre comando...
  local puerto="$1" nombre="$2"; shift 2
  "$@" > "logs/$nombre.log" 2>&1 &
  pids="$pids $!"
  esperar_puerto "$puerto" || { falla "$nombre no arrancó en el puerto $puerto (mira logs/$nombre.log)"; return 1; }
}
contiene() { # contiene "descripción" "texto esperado" archivo
  if grep -qF -- "$2" "$3"; then echo "✔ $1"; else echo "  no aparece «$2» en $3"; falla "$1"; fi
}
demo() { # demo nombre comando... → ejecuta y guarda la salida en logs/nombre.log
  local nombre="$1"; shift
  "$@" > "logs/$nombre.log" 2>&1 || true
}

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos de error pueden cambiar." ;; esac

echo "== Dependencias (npm ci: axios 1.21.1, @grpc/grpc-js 1.14.7, @apollo/server 5.5.2, kafkajs 2.2.4, amqplib 2.4.0, @nats-io/transport-node 3.5.0)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Tests sin infraestructura (node --test)"
node --test --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test (busca ✖ arriba)"

echo "== F113 · REST con Axios/Fetch"
if PORT=3113 arrancar 3113 f113-inventario node f113-rest/servicio-inventario.js; then
  demo f113-main node f113-rest/main.js
  contiene "fetch: 200"                 'fetch TEC-1  → 12 disponibles' logs/f113-main.log
  contiene "fetch: timeout"             'fetch LENTO  → TIEMPO_AGOTADO: inventario no respondió en 500 ms' logs/f113-main.log
  contiene "axios: 503 → NO_DISPONIBLE" 'axios ROTO   → NO_DISPONIBLE: inventario respondió 503' logs/f113-main.log
  contiene "axios: servicio apagado"    'apagado      → NO_DISPONIBLE: no se pudo conectar con inventario: ECONNREFUSED' logs/f113-main.log
  demo f113-error-comun node f113-rest/error-comun.js
  contiene "error común: fetch no lanza con 503" 'disponibles: undefined' logs/f113-error-comun.log
fi
echo "== F114 · gRPC con @grpc/grpc-js"
if PORT=50114 arrancar 50114 f114-servidor node f114-grpc/servidor.js; then
  demo f114-cliente node f114-grpc/cliente.js
  contiene "unaria"            "unaria   → { sku: 'TEC-1', disponibles: 12, bodegaOrigen: 'BOG-1' }" logs/f114-cliente.log
  contiene "streaming"         'stream   → 10' logs/f114-cliente.log
  contiene "NOT_FOUND"         'NO-HAY   → code=5 (NOT_FOUND) details="No existe el SKU NO-HAY"' logs/f114-cliente.log
  contiene "DEADLINE_EXCEEDED" 'LENTO    → code=4 (DEADLINE_EXCEEDED)' logs/f114-cliente.log
fi
echo "== F115 · GraphQL con Apollo Server"
if PORT=4115 arrancar 4115 f115-graphql node f115-graphql/main.js; then
  curl -s -w ' [%{http_code}]\n' localhost:4115/ -H 'content-type: application/json' \
    -d '{"query":"{ pedido(id: \"P-1\") { id total cliente { nombre } } }"}' > logs/f115-consulta.log 2>&1
  contiene "consulta con campos anidados" '{"data":{"pedido":{"id":"P-1","total":240000,"cliente":{"nombre":"Ana"}}}}' logs/f115-consulta.log
  curl -s -w ' [%{http_code}]\n' localhost:4115/ -H 'content-type: application/json' \
    -d '{"query":"{ pedido(id: \"P-1\") { nombre } }"}' > logs/f115-invalida.log 2>&1
  contiene "consulta inválida → 400" 'Cannot query field \"nombre\" on type \"Pedido\".' logs/f115-invalida.log
fi
demo f115-n-mas-1 node f115-graphql/n-mas-1.js
contiene "N+1 medido"   'ingenuo    → 3 pedidos · llamadas a pedidos: 1 · llamadas a clientes: 3' logs/f115-n-mas-1.log
contiene "DataLoader"   'DataLoader → 3 pedidos · llamadas a pedidos: 1 · llamadas a clientes: 1' logs/f115-n-mas-1.log
echo "== F118 · Sync vs async"
demo f118-comparar node f118-sync-async/comparar.js
contiene "síncrono suma latencias"          'síncrono  P-1 → 201 en ~250 ms' logs/f118-comparar.log
contiene "síncrono falla con la dependencia" 'síncrono  P-3 → 503 en ~250 ms (notificaciones respondió 503)' logs/f118-comparar.log
contiene "asíncrono sigue aceptando"        'asíncrono P-4 → 201 en ~50 ms' logs/f118-comparar.log
contiene "la cola se vacía al volver"       'notificaciones enviadas en total: 3' logs/f118-comparar.log
limpiar; pids=""

# ---------- Brokers (F116 y F117) ----------
vivo() { node -e "require('node:net').connect($2,'$1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" 2>/dev/null; }
con_kafka=no; con_rabbit=no; con_nats=no
if [ "$modo" = "--compose" ]; then
  echo "== docker compose up -d --wait (Kafka 4.4.0, RabbitMQ 4.4.1, NATS 2.15.3)"
  docker compose version
  if docker compose up -d --wait; then con_kafka=si; con_rabbit=si; con_nats=si
  else docker compose logs > logs/compose.log 2>&1; falla "los brokers no quedaron healthy (logs/compose.log)"; fi
elif [ "$modo" = "--externo" ]; then
  echo "== Brokers externos"
  vivo localhost 9092 && con_kafka=si  || echo "AVISO: Kafka no responde en localhost:9092 → se omite"
  vivo localhost 5672 && con_rabbit=si || echo "AVISO: RabbitMQ no responde en localhost:5672 → se omite"
  vivo localhost 4222 && con_nats=si   || echo "AVISO: NATS no responde en localhost:4222 → se omite"
else
  echo "== F116 (Kafka, RabbitMQ) y F117 (NATS): necesitan brokers → ./verificar.sh --compose"
fi

if [ "$con_kafka" = si ]; then
  echo "== F116 · KafkaJS contra Kafka"
  node --test --test-reporter=spec f116-kafka-rabbit/kafka.infra.js || falla "kafka.infra.js"
  demo f116-kafka-productor node f116-kafka-rabbit/kafka-productor.js
  contiene "productor: 4 eventos" 'pedidos.eventos ← pedido.enviado' logs/f116-kafka-productor.log
  GRUPO="verificar-$$" node f116-kafka-rabbit/kafka-consumidor.js > logs/f116-kafka-consumidor.log 2>&1 &
  k=$!; i=0
  while [ $i -lt 150 ] && [ "$(grep -c 'procesado' logs/f116-kafka-consumidor.log)" -lt 4 ]; do sleep 0.2; i=$((i + 1)); done
  kill "$k" 2>/dev/null
  contiene "consumidor: recibe los eventos del topic" 'pedido.enviado → procesado' logs/f116-kafka-consumidor.log
fi
if [ "$con_rabbit" = si ]; then
  echo "== F116 · amqplib contra RabbitMQ"
  node --test --test-reporter=spec f116-kafka-rabbit/rabbit.infra.js || falla "rabbit.infra.js"
  node f116-kafka-rabbit/rabbit-consumidor.js > logs/f116-rabbit-consumidor.log 2>&1 &
  r=$!; i=0
  while [ $i -lt 50 ] && ! grep -q 'esperando mensajes' logs/f116-rabbit-consumidor.log; do sleep 0.2; i=$((i + 1)); done
  demo f116-rabbit-publicador node f116-kafka-rabbit/rabbit-publicador.js
  sleep 1; kill "$r" 2>/dev/null
  contiene "publicador: confirmado por el broker" 'pedidos.eventos ← pedido.creado (P-2) confirmado por el broker' logs/f116-rabbit-publicador.log
  contiene "consumidor: solo pedido.creado"       'facturacion ← pedido.creado (P-2)' logs/f116-rabbit-consumidor.log
  if grep -q 'pedido.pagado' logs/f116-rabbit-consumidor.log; then falla "la cola de facturación recibió pedido.pagado"; else echo "✔ el exchange no enruta pedido.pagado a facturación"; fi
  demo f116-error-comun node f116-kafka-rabbit/error-comun.js
  contiene "error común: PRECONDITION_FAILED" "inequivalent arg 'type' for exchange 'demo.error-comun'" logs/f116-error-comun.log
fi
if [ "$con_nats" = si ]; then
  echo "== F117 · NATS"
  node --test --test-reporter=spec f117-nats/nats.infra.js || falla "nats.infra.js"
  demo f117-demo node f117-nats/demo.js
  contiene "pub/sub con comodín"   'auditoria   ← pedidos.cancelado {"pedidoId":"P-2"}' logs/f117-demo.log
  contiene "petición/respuesta"    'respuesta   ← {"sku":"TEC-1","disponibles":12}' logs/f117-demo.log
  contiene "sin oyentes"           "pagos.cobrar → RequestError: no responders: 'pagos.cobrar'" logs/f117-demo.log
  n=$(grep -c '^facturacion-' logs/f117-demo.log)
  if [ "$n" = 4 ]; then echo "✔ grupo de cola: 4 pedidos, 4 entregas"; else falla "grupo de cola: se esperaban 4 entregas y hubo $n"; fi
fi
if [ "$modo" = "--compose" ]; then
  docker compose logs > logs/compose.log 2>&1
  docker compose down -v
fi

if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 18 (Comunicación) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
