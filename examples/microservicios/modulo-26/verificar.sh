#!/usr/bin/env bash
# Módulo 22 · Mensajería y patrones de datos (modulo-26, fichas F135–F141).
# Sin argumentos: npm ci, tsc y todo lo que no necesita infraestructura (F137, F138, F140, F141 y F139 en memoria);
#   F135 (RabbitMQ), F136 (Redis) y F139 con MongoDB se ejecutan si su servicio responde y, si no, se OMITEN avisando.
# Con --compose levanta RabbitMQ 4.4.1, Redis 8.10.2 y MongoDB 9.0.8 con Docker Compose y lo exige todo.
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
responde() { # responde url puerto-por-defecto → 0 si acepta conexiones TCP
  node -e "const u=new URL(process.argv[1]);require('node:net').connect(Number(u.port||process.argv[2]),u.hostname).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" "$1" "$2"
}
url() { node --input-type=module -e "import * as c from './comun/config.js'; console.log(c['$1'])"; }

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
    echo "== Docker Compose: RabbitMQ 4.4.1, Redis 8.10.2, MongoDB 9.0.8"
    docker compose version
    paso "docker compose up -d --wait" "" docker compose up -d --wait
  else
    falla "--compose pide Docker y no encuentro el comando docker (instala Docker Desktop)"
  fi
fi

echo "== Dependencias y compilación (npm ci; tsc 6.0.3 para F137 y F141)"
paso "npm ci" "" npm ci --no-audit --no-fund
paso "tsc (NestJS 12.5.1 y @nestjs/cqrs 12.1.3)" "" npx tsc -p tsconfig.json

AMQP_URL_ACTUAL=$(url AMQP_URL); REDIS_URL_ACTUAL=$(url REDIS_URL); MONGO_URL_ACTUAL=$(url MONGO_URL)
hay() { [ "$modo" = "--compose" ] || responde "$1" "$2"; }

echo "== F135 · RabbitMQ: publisher confirms, consumer acknowledgments"
if hay "$AMQP_URL_ACTUAL" 5672; then
  paso "F135 tests (RabbitMQ real)" "pass 5" node --test --test-reporter=spec f135-rabbitmq-confirms/confirms.test.js
  paso "F135 demo" "P-4 no llegó a ninguna cola (312 NO_ROUTE)" node f135-rabbitmq-confirms/demo.js
  paso "F135 error común: ack olvidado con prefetch" "recibidos por el consumidor: 5 · listos en la cola: 5" node f135-rabbitmq-confirms/error-comun.js
else omite "F135 (RabbitMQ no responde en ${AMQP_URL_ACTUAL}; usa --compose)"; fi

echo "== F136 · Deduplicación con Redis"
if hay "$REDIS_URL_ACTUAL" 6379; then
  paso "F136 tests (Redis real)" "pass 5" node --test --test-reporter=spec f136-dedup-redis/dedup.test.js
  paso "F136 demo" "cobros reales: P-1, P-2" node f136-dedup-redis/demo.js
  paso "F136 error común: GET + SET" "SET NX:    5 copias simultáneas de P-1 → 1 cobro" node f136-dedup-redis/error-comun.js
else omite "F136 (Redis no responde en ${REDIS_URL_ACTUAL}; usa --compose)"; fi

echo "== F137 · Sagas con NestJS CQRS"
paso "F137 tests de la saga" "pass 4" node --test --test-reporter=spec dist/f137-sagas-nestjs/src/saga.test.js
paso "F137 demo" "stock TEC-1: 3 · reservas: P-1" node dist/f137-sagas-nestjs/src/main.js
paso "F137 error común: la saga que lanza muere" "sagaErrorStrategy=complete    → confirmados: [P-1]" env NO_COLOR=1 node dist/f137-sagas-nestjs/src/error-comun.js

echo "== F138 · Compensaciones idempotentes"
paso "F138 tests" "pass 6" node --test --test-reporter=spec f138-compensaciones/compensaciones.test.js
paso "F138 demo" "saldo final de ana = 1000" node f138-compensaciones/demo.js
paso "F138 error común: delta + id nuevo" "saldo de ana = 1600" node f138-compensaciones/error-comun.js

echo "== F139 · Event Sourcing con MongoDB"
paso "F139 demo en memoria" "versión 4 → estado CONFIRMADO, 2 líneas, total 285000" env ALMACEN=memoria node f139-event-sourcing/demo.js
paso "F139 error común: sin versión esperada" "pedido CONFIRMADO: no admite líneas" node f139-event-sourcing/error-comun.js
if hay "$MONGO_URL_ACTUAL" 27017; then
  paso "F139 tests (memoria + MongoDB real)" "pass 9" node --test --test-reporter=spec f139-event-sourcing/almacen.test.js
  paso "F139 demo con MongoDB" "versión 4 → estado CONFIRMADO, 2 líneas, total 285000" node f139-event-sourcing/demo.js
else
  paso "F139 tests (solo memoria)" "pass 5" node --test --test-reporter=spec f139-event-sourcing/almacen.test.js
  omite "F139 con MongoDB (no responde en ${MONGO_URL_ACTUAL}; usa --compose)"
fi

echo "== F140 · Proyecciones materializadas"
paso "F140 tests" "pass 5" node --test --test-reporter=spec f140-proyecciones/proyeccion.test.js
paso "F140 demo en memoria" "reconstruir desde 0 → aplicados: 9" env ALMACEN=memoria node f140-proyecciones/demo.js
paso "F140 error común: checkpoint fuera de la transacción" "total de P-1 = 250 (debía ser 150)" node f140-proyecciones/error-comun.js
if hay "$MONGO_URL_ACTUAL" 27017; then
  paso "F140 demo con MongoDB" "reconstruir desde 0 → aplicados: 9" node f140-proyecciones/demo.js
fi

echo "== F141 · CQRS"
paso "F141 tests" "pass 5" node --test --test-reporter=spec dist/f141-cqrs/src/cqrs.test.js
paso "F141 demo" "con versionMinima=2: {\"id\":\"TEC-1\",\"nombre\":\"Teclado\",\"precio\":99000" node dist/f141-cqrs/src/main.js
paso "F141 error común: leer sin versión" "MAL  → guardé 140 y la pantalla muestra 100" node dist/f141-cqrs/src/error-comun.js

if [ "$modo" = "--compose" ] && command -v docker > /dev/null 2>&1; then
  docker compose logs > logs/99-docker-compose.log 2>&1
  docker compose down -v > /dev/null 2>&1
fi

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 22 (Mensajería y patrones de datos) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
