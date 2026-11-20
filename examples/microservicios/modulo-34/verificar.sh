#!/usr/bin/env bash
# Módulo 30 · Anti-patrones y cuándo NO usar microservicios (modulo-34, fichas F173–F176).
# Sin argumentos: npm ci, F173, F174 y F176 (no necesitan infraestructura) y F175 si PostgreSQL responde en
#   localhost:5432; si no, la OMITE avisando.
# Con --compose levanta PostgreSQL 18.7 con docker-compose.yml y lo exige todo.
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
# paso_falla: igual que paso, pero el comando DEBE terminar con código distinto de 0 (una fitness function que rompe el build).
paso_falla() {
  local desc="$1" texto="$2"; shift 2
  n=$((n + 1))
  local log; log="logs/$(printf '%02d' "$n")-$(printf '%s' "$desc" | LC_ALL=C tr ' /:·' '-----' | LC_ALL=C tr -cd 'A-Za-z0-9._-' | cut -c1-40).log"
  "$@" > "$log" 2>&1; local rc=$?
  if [ $rc -eq 0 ]; then falla "${desc}: debía terminar con error y terminó con 0 (ver ${log})"; return 1; fi
  if [ -n "$texto" ] && ! grep -qF -- "$texto" "$log"; then tail -n 15 "$log"; falla "${desc}: no aparece «${texto}» (ver ${log})"; return 1; fi
  echo "✔ ${desc} (código ${rc}, como se esperaba)"
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
    echo "== Docker Compose: PostgreSQL 18.7"
    docker compose version
    paso "docker compose up -d --wait" "" docker compose up -d --wait
  else
    falla "--compose pide Docker y no encuentro el comando docker (instala Docker Desktop)"
  fi
fi
hay() { [ "$modo" = "--compose" ] || responde "$1" "$2"; }

echo "== Dependencias (npm ci con package-lock.json: pg 8.23.1)"
paso "npm ci" "" npm ci --no-audit --no-fund

echo "== F173 · Monolito distribuido"
paso "F173 tests (servidores HTTP reales)" "pass 5" node --test --test-reporter=spec f173-monolito-distribuido/monolito.test.js
paso "F173 demo" "2. Cae impuestos (a 2 saltos)  → error: pedidos: precios: /impuestos/TEC-1 → ECONNREFUSED" node f173-monolito-distribuido/demo.js
paso "F173 error común: DTO compartido" "MAL  → precios v2 + pedidos v1: {\"sku\":\"TEC-1\",\"cantidad\":2,\"total\":null}" node f173-monolito-distribuido/error-comun.js

echo "== F174 · Sobre-descomposición"
paso "F174 tests" "pass 4" node --test --test-reporter=spec f174-sobre-descomposicion/nano.test.js
paso "F174 demo" "nanoservicios total=224910 (4 llamadas HTTP)" node f174-sobre-descomposicion/demo.js
paso "F174 error común: un servicio por entidad" "MAL  → un servicio por entidad: 100 % de los cambios tocan varios servicios" node f174-sobre-descomposicion/error-comun.js

echo "== F175 · Sagas innecesarias"
if hay localhost 5432; then
  paso "F175 tests (PostgreSQL real)" "pass 5" node --test --test-reporter=spec f175-sagas-innecesarias/sagas.test.js
  paso "F175 demo" "Transacción: falla «cliente beto bloqueado» → stock=10 · pedidos={}" node f175-sagas-innecesarias/demo.js
  paso "F175 error común: compensación repetida" "MAL  → compensación repetida  : stock = 12 (había 10)" node f175-sagas-innecesarias/error-comun.js
else omite "F175 (PostgreSQL no responde en localhost:5432; usa --compose)"; fi

echo "== F176 · Fitness functions"
paso "F176 tests" "pass 4" node --test --test-reporter=spec f176-fitness-functions/fitness.test.js
paso_falla "F176 demo: el build se detiene con ejemplo-roto" "4 violaciones: el build se detiene" node f176-fitness-functions/demo.js
paso "F176 error común: regex ingenua" "MAL  → regex ingenua: 2 violaciones · no ve: servicios/envios/index.js" node f176-fitness-functions/error-comun.js

if [ "$modo" = "--compose" ] && command -v docker > /dev/null 2>&1; then
  docker compose logs > logs/99-docker-compose.log 2>&1
  docker compose down -v > /dev/null 2>&1
fi

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 30 (Anti-patrones y cuándo NO usar microservicios) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
