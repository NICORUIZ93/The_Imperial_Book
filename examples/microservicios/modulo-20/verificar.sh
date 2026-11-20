#!/usr/bin/env bash
# Módulo 16 · Testing (modulo-20, fichas F105–F108).
# Instala las dependencias fijadas (npm ci), comprueba los tipos, ejecuta los tests de Jest (unitarios, Supertest,
# contrato Pact de consumidor y proveedor, Testcontainers) y los errores comunes de cada ficha, que DEBEN fallar con
# su mensaje. Si algo falla, SIGUE con lo demás y lo reporta todo al final. Cada bloque guarda su salida en logs/.
# Uso: ./verificar.sh --compose   además levanta el Pact Broker (http://localhost:9220), publica el contrato, verifica
#                                 al proveedor desde el broker y pregunta can-i-deploy; exige Docker para Testcontainers
#      ./verificar.sh             sin broker; Testcontainers solo si Docker responde (si no, se omite y se avisa)
# Requiere Node.js 26.13.1 LTS y npm; Docker con Compose v5 para --compose. bash 3.2 de macOS sirve.
set -u
cd "$(dirname "$0")"
mkdir -p logs
rm -f logs/*.log
fallos=""
omitidos=0
n=0
BROKER="http://localhost:9220"
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
archivo_log() { n=$((n + 1)); log="logs/$(printf '%02d' "$n")-$(printf '%s' "$1" | LC_ALL=C tr ' /:·' '-----' | LC_ALL=C tr -cd 'A-Za-z0-9._-' | cut -c1-40).log"; }

# paso "descripción" "texto que debe aparecer (o vacío)" comando...  → debe terminar con código 0
paso() {
  local desc="$1" texto="$2"; shift 2
  archivo_log "$desc"
  "$@" > "$log" 2>&1; local rc=$?
  if [ $rc -ne 0 ]; then tail -n 15 "$log" | cut -c1-300; falla "$desc (código $rc, ver $log)"; return 1; fi
  if [ -n "$texto" ] && ! grep -qF -- "$texto" "$log"; then tail -n 15 "$log" | cut -c1-300; falla "$desc: no aparece «${texto}» (ver $log)"; return 1; fi
  echo "✔ $desc"
}
# debe_fallar "descripción" "mensaje esperado" comando...  → el error común: debe terminar con código ≠ 0 y ese mensaje
debe_fallar() {
  local desc="$1" texto="$2"; shift 2
  archivo_log "$desc"
  "$@" > "$log" 2>&1; local rc=$?
  if [ $rc -eq 0 ]; then falla "$desc: debía fallar y terminó con código 0 (ver $log)"; return 1; fi
  if ! grep -qF -- "$texto" "$log"; then tail -n 15 "$log" | cut -c1-300; falla "$desc: falló, pero sin el mensaje «${texto}» (ver $log)"; return 1; fi
  echo "✔ $desc (falla como se esperaba)"
}
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos de error pueden cambiar." ;; esac

compose=0
if [ "${1:-}" = "--compose" ]; then
  compose=1
  echo "== Docker Compose: Pact Broker 2.124.0 en $BROKER"
  docker compose version
  paso "docker compose up -d --wait" "" docker compose up -d --wait
fi

echo "== Dependencias (npm ci: jest 30.5.2, ts-jest 29.4.15, supertest 7.3.2, @pact-foundation/pact 17.1.4, testcontainers 12.2.2)"
paso "npm ci" "" npm ci --no-audit --no-fund
paso "tsc --noEmit (TypeScript 6.0.3 en modo strict)" "" npx tsc --noEmit -p tsconfig.json

echo "== F105 · Jest  y  F106 · Supertest"
paso "F105 + F106: 24 tests unitarios" "Tests:       24 passed, 24 total" npx jest --selectProjects unit
paso "F105 cobertura por encima del umbral" "All files" npx jest --selectProjects unit --coverage
debe_fallar "F105 error común: aserción sin await" "JestAssertionError" npx jest sin-await --selectProjects errores
debe_fallar "F105 error común: falso verde" "Expected one assertion to be called but received zero assertion calls." npx jest falso-verde --selectProjects errores
debe_fallar "F106 error común: la app abre el puerto" "listen EADDRINUSE: address already in use" npx jest puerto- --selectProjects errores --forceExit

echo "== F107 · Contract Testing con Pact"
rm -rf f107-pact/pacts
if paso "F107 consumidor: genera el contrato" "Tests:       2 passed, 2 total" npx jest --selectProjects pact-consumidor; then
  paso "F107 el contrato existe y es V4" '"version": "4.0"' cat f107-pact/pacts/pedidos-inventario.json
  paso "F107 proveedor: cumple el contrato (archivo)" "Tests:       1 passed, 1 total" npx jest --selectProjects pact-proveedor
  debe_fallar "F107 error común: el proveedor renombra un campo" "Actual map is missing the following keys: disponible" env CAMPO_STOCK=cantidad npx jest --selectProjects pact-proveedor
  if [ $compose -eq 1 ]; then
    paso "F107 publica el contrato en el broker" "" npx pact broker publish f107-pact/pacts --consumer-app-version 1.0.0 --branch main --broker-base-url "$BROKER"
    paso "F107 proveedor: verifica desde el broker y publica el resultado" "Tests:       1 passed, 1 total" env PACT_BROKER_URL="$BROKER" VERSION_PROVEEDOR=1.0.0 npx jest --selectProjects pact-proveedor
    paso "F107 can-i-deploy pedidos 1.0.0 + inventario 1.0.0" "" npx pact broker can-i-deploy --pacticipant pedidos --version 1.0.0 --pacticipant inventario --version 1.0.0 --broker-base-url "$BROKER"
  else omite "F107 con Pact Broker (usa --compose)"; fi
fi

echo "== F108 · Testcontainers para Node"
if docker info > logs/00-docker-info.log 2>&1; then
  paso "F108 repositorio contra PostgreSQL en contenedor" "Tests:       6 passed, 6 total" npx jest --selectProjects contenedores
elif [ $compose -eq 1 ]; then
  falla "F108: Docker no responde (ver logs/00-docker-info.log)"
else omite "F108 Testcontainers (Docker no responde)"; fi

if [ $compose -eq 1 ]; then
  docker compose logs > logs/99-docker-compose.log 2>&1
  docker compose down > /dev/null 2>&1
fi

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: $omitidos bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 16 (Testing) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
