#!/usr/bin/env bash
# Módulo 32 · Proyecto final y Comité de Arquitectura (modulo-36, fichas F181–F187).
# 1) Pista Node.js: npm ci, tests de node --test (Gatling incluido si hay Java) y los scripts de las siete fichas.
# 2) Redis real para el limitador (REDIS_URL, o Docker Compose con --compose, o un redis-server local en :16379).
# 3) Gatling a 60 reservas/s: sin límite del proveedor (SLO en verde) y con la restricción sobrevenida (20/s).
# 4) Temporal real (si hay TEMPORAL_ADDRESS o el CLI `temporal`) y pista Spring Boot (jdk/ siempre; Maven con --compose).
# Si algo falla o falta una herramienta, lo dice y sigue. Uso: ./verificar.sh [--compose]. bash 3.2 de macOS sirve.
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1
fallos=""; omitidos=0; pids=""
falla() { fallos="${fallos}\n  ✘ $1"; echo "✘ $1"; }
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }
limpiar() { for p in ${pids}; do kill "${p}" 2>/dev/null; done; }
trap limpiar EXIT

guion() { # guion "descripción" "comando" "texto esperado"…  (el código de salida del comando no cuenta)
  local desc="$1" cmd="$2"; shift 2
  local registro
  registro="logs/$(echo "$desc" | tr -c 'a-zA-Z0-9\n' '-' | tr -s '-').log"
  bash -c "$cmd" > "$registro" 2>&1
  local ok=si texto
  grep -v '^Picked up' "$registro"
  for texto in "$@"; do grep -qF -- "$texto" "$registro" || { ok=no; echo "  falta: «${texto}»"; }; done
  if [ "$ok" = si ]; then echo "✔ ${desc}"; else falla "${desc} (mira ${registro})"; fi
}

if ! command -v node > /dev/null 2>&1; then
  echo "ERROR: falta Node.js 26.13.1 LTS (https://nodejs.org)."; echo "RESULTADO: FALLA"; exit 1
fi
echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac
hay_java=no
if command -v java > /dev/null 2>&1; then hay_java=si; java -version 2>&1 | grep -v '^Picked' | head -1
else echo "AVISO: falta Java (JDK 25: https://adoptium.net). Se omiten Gatling y la pista Spring Boot."; fi

echo "== 1. Pista Node.js"
npm ci --no-audit --no-fund --silent || falla "npm ci"
node --test --test-concurrency=1 --test-reporter=spec 'f18*/*.test.js' || falla "node --test (busca ✖ arriba)"
guion "F181 demo" "node f181-sistema-reservas/demo.js" 'pago aprobado                             POST 202 /reservas/R-a1 -> CONFIRMADA' 'falla la confirmación                     POST 202 /reservas/R-c3 -> CANCELADA (el organizador canceló el evento)' 'proveedor: 3 cobros, 1 reembolso(s) · plazas libres: 0'
guion "F181 error común (sin Idempotency-Key)" "node f181-sistema-reservas/error-comun.js" 'sin Idempotency-Key: reservas R-1, R-2 · cobros al cliente: 2' 'con Idempotency-Key: reservas R-compra-77 · cobros al cliente: 1'
guion "F182 error común (red en el workflow)" "node f182-saga-temporal/error-comun.js" "importing the following disallowed modules:" "'@temporalio/activity'"
guion "F183 error común (limitador en memoria)" "node f183-gateway-rate-limit/error-comun.js" '3 réplicas con LimitadorMemoria: 30 de 100 aceptadas (contrato: 10)'
guion "F185 antes" "node f185-restriccion-sobrevenida/antes.js" 'reservas recibidas (HTTP 202):   300 de 300' 'respondidas con 429:'
guion "F185 después" "node f185-restriccion-sobrevenida/despues.js" 'CONFIRMADAS / CANCELADAS:        300 / 0 (0.0 % de ventas perdidas)' 'respondidas con 429: 0'
guion "F185 error común (reintentos sin backoff)" "node f185-restriccion-sobrevenida/error-comun.js" 'ERROR · 10 intentos inmediatos, sin backoff:'
guion "F186 ADR del proyecto" "node f186-adr/validar-adr.js f186-adr/adr/*.md" '✔ f186-adr/adr/0001-saga-de-reservas-con-temporal.md' '✔ f186-adr/adr/0002-cobro-asincrono-por-limite-del-proveedor.md'
guion "F186 error común (ADR sin números ni alternativas)" "node f186-adr/validar-adr.js f186-adr/adr-mal.md" '✘ f186-adr/adr-mal.md: falta título'
guion "F187 hoja de puntuación" "node f187-defensa-arb/puntuar.js f187-defensa-arb/evaluacion-ejemplo.json" 'Total: 3.30' 'Recomendación: APROBADO'
guion "F187 error común (media alta con un 1)" "node f187-defensa-arb/puntuar.js f187-defensa-arb/evaluacion-con-un-1.json" 'Total: 3.70' 'REPETIR DEFENSA · criterio en 1: Seguridad'
guion "F187 entregables" "node f187-defensa-arb/entregables.js" 'listo para la defensa'
guion "Costo (FinOps)" "node costo.js" '| **TOTAL** | **196.79** |'

echo "== 2. Redis real para el limitador"
redis_url="${REDIS_URL:-}"
if [ -z "${redis_url}" ] && [ "${1:-}" = "--compose" ]; then
  if command -v docker > /dev/null 2>&1 && docker compose up -d --wait > logs/compose.log 2>&1; then redis_url="redis://localhost:6379"
  else falla "docker compose up (mira logs/compose.log; ¿Docker Desktop arrancado?)"; fi
fi
if [ -z "${redis_url}" ] && command -v redis-server > /dev/null 2>&1; then
  redis-server --port 16379 --save '' --appendonly no > logs/redis.log 2>&1 & pids="${pids} $!"; sleep 1
  redis_url="redis://127.0.0.1:16379"
fi
if [ -n "${redis_url}" ]; then
  echo "REDIS_URL=${redis_url}"
  REDIS_URL="${redis_url}" node --test --test-reporter=spec f183-gateway-rate-limit/limitador-redis.infra.js || falla "limitador-redis.infra.js"
  guion "F183 error común con Redis" "REDIS_URL=${redis_url} node f183-gateway-rate-limit/error-comun.js" '3 réplicas con LimitadorRedis:   10 de 100 aceptadas (contrato: 10)'
else
  omite "Redis: ni REDIS_URL, ni --compose, ni redis-server (https://redis.io/downloads/)"
fi

echo "== 3. Gatling a 60 reservas/s"
if [ "${hay_java}" = si ]; then
  for limite in sin 20; do
    if [ "${limite}" = sin ]; then PORT=18080 node f184-carga-gatling/arrancar-sistema.js > "logs/sistema-${limite}.log" 2>&1 &
    else LIMITE_RPS=20 PORT=18080 node f184-carga-gatling/arrancar-sistema.js > "logs/sistema-${limite}.log" 2>&1 & fi
    sistema=$!; pids="${pids} ${sistema}"; sleep 1
    npx gatling run --sources-folder f184-carga-gatling/src --results-folder logs/gatling --non-interactive --simulation reservas \
      url=http://127.0.0.1:18080 tasa=60 segundos=20 > "logs/gatling-${limite}.log" 2>&1
    sleep 2; kill "${sistema}" 2>/dev/null; wait "${sistema}" 2>/dev/null
    sed -n '/Global Information/,/Response Time Distribution/p' "logs/gatling-${limite}.log"; grep -E '^Global:' "logs/gatling-${limite}.log"; cat "logs/sistema-${limite}.log"
    if grep -qF 'percentage of failed events is less than 1.0 : true' "logs/gatling-${limite}.log"; then echo "✔ Gatling, proveedor ${limite} límite: SLO de la API en verde"
    else falla "Gatling, proveedor ${limite} límite (mira logs/gatling-${limite}.log)"; fi
  done
  grep -q ' CANCELADA ' logs/sistema-20.log && echo "✔ con la restricción, Gatling sigue en verde pero el resumen muestra reservas CANCELADAS (F185)"
else
  omite "Gatling (falta Java)"
fi

echo "== 4. Temporal real y pista Spring Boot"
if [ -n "${TEMPORAL_ADDRESS:-}" ] || command -v temporal > /dev/null 2>&1; then
  node --test --test-reporter=spec f182-saga-temporal/temporal.infra.js || falla "temporal.infra.js (¿temporal server start-dev en marcha o descarga bloqueada?)"
else
  omite "Temporal real: define TEMPORAL_ADDRESS o instala el CLI (brew install temporal) y ejecuta node --test f182-saga-temporal/temporal.infra.js"
fi
if [ "${hay_java}" = si ]; then
  guion "Spring jdk/SagaReserva" "java -Dstdout.encoding=UTF-8 spring/jdk/SagaReserva.java" 'R-3 CANCELADA (el organizador canceló el evento) compensadas=[reembolsar, liberarPlaza]'
  guion "Spring jdk/CuboDeFichas" "java -Dstdout.encoding=UTF-8 spring/jdk/CuboDeFichas.java" 'ráfaga en t=0 s: 10 de 11 aceptadas'
  if [ "${1:-}" = "--compose" ]; then
    (cd spring && ./mvnw -q test) > logs/maven-test.log 2>&1 || { falla "Maven: tests de spring/ (mira logs/maven-test.log)"; grep -E "ERROR|FAIL" logs/maven-test.log | head -20; }
  else
    omite "tests Maven de spring/ (necesitan Maven Central: ./verificar.sh --compose)"
  fi
fi
if [ "${1:-}" = "--compose" ] && command -v docker > /dev/null 2>&1; then docker compose down -v > /dev/null 2>&1; fi

if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 32 (Proyecto final y Comité de Arquitectura) verificado (${omitidos} bloque(s) omitidos)"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
