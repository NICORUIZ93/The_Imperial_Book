#!/usr/bin/env bash
# Módulo 26 · Mensajería avanzada y event-driven (modulo-30, fichas F157–F160).
# Sin argumentos: npm ci, lo que no necesita infraestructura (F157 Avro, F160) y, si responden, F158 (RabbitMQ) y
#   F159 (NATS); Kafka y Schema Registry se OMITEN avisando.
# Con --compose levanta Kafka 4.4.0, Schema Registry 8.4.1, RabbitMQ 4.4.1 y NATS 2.15.3 y lo exige todo.
# Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh [--compose]   (Node.js 26.13.1 LTS y npm; bash 3.2 de macOS sirve)
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
rm -f logs/*.log
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
modo="${1:-}"
fallos=""
omitidos=0
falla() { fallos="${fallos}\n  ✘ $1"; echo "✘ $1"; }
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }

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
responde() { # responde host puerto → 0 si acepta conexiones TCP
  node -e "require('node:net').connect(Number(process.argv[2]),process.argv[1]).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" "$1" "$2"
}

if ! command -v node > /dev/null 2>&1; then
  echo "✘ No encuentro node. Instala Node.js 26.13.1 LTS (https://nodejs.org) y vuelve a ejecutar."
  echo "RESULTADO: FALLA · falta Node.js"
  exit 1
fi
echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac

if [ "$modo" = "--compose" ]; then
  if command -v docker > /dev/null 2>&1; then
    echo "== Docker Compose: Kafka 4.4.0, Schema Registry 8.4.1, RabbitMQ 4.4.1, NATS 2.15.3"
    docker compose version
    paso "docker compose up -d --wait" "" docker compose up -d --wait
  else
    falla "--compose pide Docker y no encuentro el comando docker (instala Docker Desktop)"
  fi
fi
hay() { [ "$modo" = "--compose" ] || responde "$1" "$2"; }

echo "== Dependencias (npm ci con package-lock.json)"
paso "npm ci" "" npm ci --no-audit --no-fund

echo "== F157 · Kafka profundo: transacciones, EOS, Schema Registry"
paso "F157 tests de compatibilidad y formato" "pass 5" node --test --test-force-exit --test-reporter=spec f157-kafka-schema/schema.test.js
paso "F157 demo" "consumidor v2 lee un mensaje v1: {\"id\":\"P-1\",\"total\":120000,\"moneda\":\"COP\"}" node f157-kafka-schema/demo.js
paso "F157 error común: campo sin default" "no matching field for default-less" node f157-kafka-schema/error-comun.js
if [ "$modo" = "--compose" ]; then
  paso "F157 Schema Registry real" "pass 2" node --test --test-force-exit --test-reporter=spec f157-kafka-schema/registry.infra.js
  paso "F157 transacciones y fencing" "read_committed → f157.auditoria:P-1, f157.pedidos:P-1" node f157-kafka-schema/transacciones.js
else omite "F157 con Kafka y Schema Registry (solo con --compose)"; fi

echo "== F158 · RabbitMQ avanzado"
if hay localhost 5672; then
  paso "F158 tests (RabbitMQ real)" "pass 4" node --test --test-force-exit --test-reporter=spec f158-rabbitmq/rabbitmq.test.js
  paso "F158 demo" "en la DLQ: 2" node f158-rabbitmq/demo.js
  paso "F158 error común: requeue sin límite" "MAL  → 1 mensaje venenoso, más de 100 entregas en 1 s" node f158-rabbitmq/error-comun.js
else omite "F158 (RabbitMQ no responde en localhost:5672; usa --compose)"; fi

echo "== F159 · NATS"
if hay localhost 4222; then
  paso "F159 tests (NATS JetStream real)" "pass 5" node --test --test-force-exit --test-reporter=spec f159-nats/nats.test.js
  paso "F159 demo" "reservas: intentos 1 y 2 · stock final = 1" node f159-nats/demo.js
  paso "F159 error común: publish sin msgID" "MAL  → sin msgID:  2 mensajes para un solo pedido" node f159-nats/error-comun.js
else omite "F159 (NATS no responde en localhost:4222; usa --compose)"; fi

echo "== F160 · Event Notification vs Event-Carried State Transfer"
paso "F160 tests" "pass 4" node --test --test-force-exit --test-reporter=spec f160-ecst/ecst.test.js
paso "F160 demo" "catálogo caído → ECST:         precio=140" node f160-ecst/demo.js
paso "F160 error común: réplica sin versión" "MAL  → sin versión: precio = 120" node f160-ecst/error-comun.js

if [ "$modo" = "--compose" ] && command -v docker > /dev/null 2>&1; then
  docker compose logs > logs/99-docker-compose.log 2>&1
  docker compose down -v > /dev/null 2>&1
fi

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 26 (Mensajería avanzada y event-driven) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
