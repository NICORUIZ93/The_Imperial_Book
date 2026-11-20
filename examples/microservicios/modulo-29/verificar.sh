#!/usr/bin/env bash
# Módulo 25 · Consistencia distribuida (modulo-29, fichas F152–F156).
# Sin argumentos: npm ci, los tests sin infraestructura (F153 saga y empaquetado) y, si PostgreSQL responde,
#   F152, F154, F155 y F156; Kafka, Debezium y Temporal se OMITEN avisando.
# Con --compose levanta PostgreSQL 18.7, Kafka 4.4.0 y Debezium 3.7 con Docker Compose, arranca el servidor de
#   desarrollo de Temporal (lo descarga el SDK) y lo exige todo.
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
    echo "== Docker Compose: PostgreSQL 18.7, Kafka 4.4.0, Debezium 3.7"
    docker compose version
    paso "docker compose up -d --wait" "" docker compose up -d --wait
  else
    falla "--compose pide Docker y no encuentro el comando docker (instala Docker Desktop)"
  fi
fi
hay() { [ "$modo" = "--compose" ] || responde "$1" "$2"; }

echo "== Dependencias (npm ci con package-lock.json)"
paso "npm ci" "" npm ci --no-audit --no-fund

echo "== F152 · Outbox Pattern + CDC con Debezium"
if hay localhost 5432; then
  paso "F152 tests (PostgreSQL real)" "pass 5" node --test --test-force-exit --test-reporter=spec f152-outbox/outbox.test.js
  paso "F152 demo" "relay: 2 publicados · segunda vuelta: 0 pendientes" node f152-outbox/demo.js
  paso "F152 WAL decodificado" "table public.f152_outbox: INSERT:" node f152-outbox/cdc-wal.js
  paso "F152 error común: dual write" "MAL  → pedidos en la BD: 1 · eventos publicados: 0" node f152-outbox/error-comun.js
else omite "F152 (PostgreSQL no responde en localhost:5432; usa --compose)"; fi
if [ "$modo" = "--compose" ]; then
  paso "F152 Debezium → Kafka" "pass 1" node --test --test-force-exit --test-reporter=spec f152-outbox/debezium.infra.js
else omite "F152 con Debezium y Kafka (solo con --compose)"; fi

echo "== F153 · Sagas orquestadas con Temporal.io"
paso "F153 tests de la saga" "pass 5" node --test --test-force-exit --test-reporter=spec f153-temporal/saga.test.js
paso "F153 error común: E/S en el workflow" "UnhandledSchemeError: Reading from \"node:fs\"" node f153-temporal/error-comun.js
if [ "$modo" = "--compose" ] || [ -n "${TEMPORAL_ADDRESS:-}" ]; then
  paso "F153 tests con servidor Temporal" "pass 3" node --test --test-force-exit --test-reporter=spec f153-temporal/temporal.infra.js
else omite "F153 con servidor Temporal (usa --compose o TEMPORAL_ADDRESS=host:7233)"; fi

echo "== F154 · Idempotencia real en consumidores Kafka"
paso "F154 error común: deduplicar por offset" "MAL  → clave partición+offset: puntos = 20" node f154-idempotencia/error-comun.js
if hay localhost 5432; then
  paso "F154 tests (PostgreSQL real)" "pass 4" node --test --test-force-exit --test-reporter=spec f154-idempotencia/idempotencia.test.js
  paso "F154 demo" "C-3 en paralelo ×5 → 1 procesado, 4 duplicados" node f154-idempotencia/demo.js
else omite "F154 (PostgreSQL no responde en localhost:5432; usa --compose)"; fi
if [ "$modo" = "--compose" ]; then
  paso "F154 consumidor Kafka" "puntos de ana = 10" node f154-idempotencia/consumidor-kafka.js
else omite "F154 con Kafka (solo con --compose)"; fi

echo "== F155 · Exactly-once semantics en la práctica"
if hay localhost 5432; then
  paso "F155 tests (PostgreSQL real)" "pass 3" node --test --test-force-exit --test-reporter=spec f155-exactly-once/exactly-once.test.js
  paso "F155 demo" "saldo final = 500" node f155-exactly-once/demo.js
  paso "F155 error común: efecto externo" "correos enviados = 2 (duplicado)" node f155-exactly-once/error-comun.js
else omite "F155 (PostgreSQL no responde en localhost:5432; usa --compose)"; fi
if [ "$modo" = "--compose" ]; then
  paso "F155 transacciones de Kafka" "read_committed   → PAGO-1, PAGO-2, PAGO-3" node f155-exactly-once/eos-kafka.js
else omite "F155 con Kafka (solo con --compose)"; fi

echo "== F156 · Two-Phase Commit: por qué no usar"
if hay localhost 5432; then
  paso "F156 tests (PostgreSQL real)" "pass 3" node --test --test-force-exit --test-reporter=spec f156-2pc/dospc.test.js
  paso "F156 demo" "otro cobro a ana: canceling statement due to lock timeout" node f156-2pc/demo.js
  paso "F156 error común: ROLLBACK tras PREPARE" "WARNING: there is no transaction in progress" node f156-2pc/error-comun.js
else omite "F156 (PostgreSQL no responde en localhost:5432; usa --compose)"; fi

if [ "$modo" = "--compose" ] && command -v docker > /dev/null 2>&1; then
  docker compose logs > logs/99-docker-compose.log 2>&1
  docker compose down -v > /dev/null 2>&1
fi

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 25 (Consistencia distribuida) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
