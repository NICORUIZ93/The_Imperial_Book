#!/usr/bin/env bash
# Módulo 27 · Seguridad Zero-Trust (modulo-31, fichas F161–F164).
# Sin Docker: npm ci, PKI de la malla con openssl, 18 tests de node --test --test-force-exit y los ataques ANTES/DESPUÉS de cada ficha.
# Con PGURL=postgres://… además ejecuta el SQL de Vault contra un PostgreSQL real (test y error común de F163).
# Con --compose: levanta hashicorp/vault:2.2.0 + postgres:18.7, configura el motor database y prueba una credencial
# dinámica REAL (login, revocación, login rechazado). Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh [--compose]. Requiere Node.js 26.13.1 LTS, npm y openssl; bash 3.2 de macOS sirve. Logs en logs/.
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1
fallos=""; omitidos=0
falla() { fallos="${fallos}\n  ✘ $1"; echo "✘ $1"; }
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }
compose=no
limpiar() { if [ "$compose" = si ]; then docker compose down -v > logs/compose-down.log 2>&1; fi; }
trap limpiar EXIT

guion() { # guion "descripción" "comando" "texto esperado"…  (el código de salida del comando no cuenta)
  local desc="$1" cmd="$2"; shift 2
  local registro
  registro="logs/$(echo "$desc" | tr -c 'a-zA-Z0-9\n' '-' | tr -s '-').log"
  bash -c "$cmd" > "$registro" 2>&1
  local ok=si texto
  cat "$registro"
  for texto in "$@"; do grep -qF -- "$texto" "$registro" || { ok=no; echo "  falta: «${texto}»"; }; done
  if [ "$ok" = si ]; then echo "✔ ${desc}"; else falla "${desc} (mira ${registro})"; fi
}

echo "== Node.js $(node --version) · npm $(npm --version) · $(openssl version 2>/dev/null || echo 'sin openssl')"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac

echo "== Dependencias (pg 8.23.1)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== PKI de la malla (CA + certificados SPIFFE de 1 día)"
if command -v openssl > /dev/null 2>&1; then
  ./pki/generar.sh || falla "pki/generar.sh"
else
  falla "falta openssl: instálalo (macOS lo trae; Linux: apt-get install openssl). Sin PKI fallarán F161, F162 y F164"
fi

echo "== Tests (node --test, 18 en total; el de PostgreSQL real solo con PGURL)"
node --test --test-force-exit --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test --test-force-exit (busca ✖ arriba)"

echo "== F161 · mTLS con Istio/Linkerd"
guion "F161 ataque antes-despues" "node f161-mtls/ataque.js" \
  '   ANTES   -> 200 {"cobrado":true,"quien":"pedidos"}' \
  'DESPUÉS -> rechazado en la conexión (ERR_SSL_TLSV13_ALERT_CERTIFICATE_REQUIRED)' \
  'DESPUÉS -> 403 {"error":"RBAC: access denied","identidad":"spiffe://cluster.local/ns/tienda/sa/catalogo"}' \
  'DESPUÉS -> 200 {"cobrado":true,"identidad":"spiffe://cluster.local/ns/tienda/sa/pedidos"}'
guion "F161 error común (SAN)" "node f161-mtls/error-comun.js" 'ERR_TLS_CERT_ALTNAME_INVALID' '200 {"ok":true}'

echo "== F162 · Token Exchange (RFC 8693)"
guion "F162 ataque antes-despues" "node f162-token-exchange/ataque.js" \
  'catalogo -> pagos con el MISMO token robado   : 200' \
  'act=pedidos cnf.x5t#S256=' \
  '"cadena":"pagos ← pedidos"' \
  'cnf no coincide con el certificado de catalogo' \
  'invalid_target: catalogo no puede pedir audience=pagos'
guion "F162 error común (aud)" "node f162-token-exchange/error-comun.js" '401 {"error":"invalid_token","detalle":"aud=pagos"}'

echo "== F163 · Vault (secretos dinámicos)"
guion "F163 ataque antes-despues" "node f163-vault/ataque.js" \
  '30 días después                    -> login ACEPTADO como tienda' \
  'una hora después (lease caducado)   -> login rechazado · rol borrado: true' \
  'leases vivos: 0'
if [ -n "${PGURL:-}" ]; then
  guion "F163 error común (PostgreSQL real)" "node f163-vault/error-comun.js" 'password authentication failed for user'
elif [ "${1:-}" != "--compose" ]; then   # con --compose lo cubre el bloque F163 de más abajo
  omite "F163 error común con PostgreSQL real: define PGURL o usa --compose"
fi

echo "== F164 · Service Mesh"
guion "F164 ataque antes-despues" "node f164-service-mesh/ataque.js" \
  'inventario directo POST /admin/ajustes: 200 {"ajustado":true,"stock":0}' \
  'catalogo -> sidecar  POST /admin/ajustes        : 403' \
  'pedidos  -> sidecar  POST /reservas             : 200' \
  'inventario directo (puerto de antes): rechazado en la conexión (ECONNREFUSED)'
guion "F164 error común (L7 sin waypoint)" "node f164-service-mesh/error-comun.js" 'rechazado en la conexión' '200 {"stock":10}'

if [ "${1:-}" = "--compose" ]; then
  if ! command -v docker > /dev/null 2>&1 || ! docker info > /dev/null 2>&1; then
    omite "F163 con Vault y PostgreSQL reales: no hay Docker en marcha"
  else
    compose=si
    echo "== F163 · hashicorp/vault:2.2.0 + postgres:18.7 (docker compose up -d --wait)"
    if docker compose up -d --wait > logs/compose-up.log 2>&1; then echo "✔ contenedores arriba"; else tail -20 logs/compose-up.log; falla "docker compose up (mira logs/compose-up.log)"; fi
    guion "F163 configurar Vault real" "./f163-vault/vault/configurar.sh" 'lease_id' 'database/creds/pedidos/'
    guion "F163 credencial dinámica real" "node f163-vault/real.js" 'login con la credencial dinámica  -> {"ok":true}' 'login tras revocar el lease        -> {"ok":false'
    guion "F163 error común con PostgreSQL 18.7" "PGURL=postgres://vault_admin:solo-dev-vault@127.0.0.1:15432/tienda node f163-vault/error-comun.js" 'password authentication failed for user'
  fi
else
  omite "F163 con Vault y PostgreSQL reales (docker-compose.yml): usa --compose"
fi
echo "(La malla real con kind e Istio es aparte: ./f161-mtls/k8s/probar-istio.sh; ver README.)"

limpiar; compose=no
if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 27 (Seguridad Zero-Trust) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
