#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MODE="${1:-tests}"
if [[ "$MODE" != "tests" && "$MODE" != "--e2e" ]]; then
  echo "Uso: ./verify.sh [--e2e]" >&2
  exit 2
fi

printf '%s\n' '==> Ejecutando pruebas en Maven/JDK del contenedor'
docker compose --profile tools run --rm build

if [[ "$MODE" == "--e2e" ]]; then
  base_url="${BASE_URL:-http://localhost:8080}"
  ready=0
  for _ in $(seq 1 40); do
    if curl --silent --show-error --fail "$base_url/api/v1/productos" >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 2
  done
  if [[ "$ready" -ne 1 ]]; then
    echo "ERROR: la API no respondió en $base_url; ejecuta primero docker compose up --build --wait" >&2
    exit 1
  fi

  nombre="producto-verificacion-$(date +%s)"
  response_file="$(mktemp)"
  invalid_file="$(mktemp)"
  trap 'rm -f "$response_file" "$invalid_file"' EXIT

  status="$(curl --silent --show-error --output "$response_file" --write-out '%{http_code}' \
    -H 'Content-Type: application/json' \
    -d "{\"nombre\":\"$nombre\",\"precio\":12.50}" \
    "$base_url/api/v1/productos")"
  [[ "$status" == "201" ]] || { echo "ERROR: se esperaba HTTP 201, llegó $status" >&2; cat "$response_file" >&2; exit 1; }
  grep -q "\"nombre\":\"$nombre\"" "$response_file" || { echo "ERROR: el POST no devolvió el producto creado" >&2; cat "$response_file" >&2; exit 1; }

  status="$(curl --silent --show-error --output "$invalid_file" --write-out '%{http_code}' \
    -H 'Content-Type: application/json' \
    -d '{"nombre":"   ","precio":0}' \
    "$base_url/api/v1/productos")"
  [[ "$status" == "400" ]] || { echo "ERROR: se esperaba HTTP 400 para request inválido, llegó $status" >&2; cat "$invalid_file" >&2; exit 1; }

  printf 'OK · POST creó %s y la validación rechazó el request inválido (HTTP 400)\n' "$nombre"
  echo 'RESULTADO: OK · pruebas y smoke test HTTP'
else
  echo 'RESULTADO: OK · pruebas Maven (la ejecución solo se confirma cuando este script finaliza con código 0)'
fi
