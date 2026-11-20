#!/usr/bin/env bash
# Módulo 31 · Migración desde monolito real (modulo-35, fichas F177–F180).
# Sin dependencias ni Docker: npm ci (lockfile vacío), 17 tests de node --test --test-force-exit y los scripts de las cuatro fichas.
# F180 necesita git (genera un repositorio de ejemplo en un directorio temporal). Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh [--compose]. Requiere Node.js 26.13.1 LTS, npm y git; bash 3.2 de macOS sirve. Logs en logs/.
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1
fallos=""; omitidos=0
falla() { fallos="${fallos}\n  ✘ $1"; echo "✘ $1"; }
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }

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

if ! command -v node > /dev/null 2>&1; then
  echo "ERROR: falta Node.js 26.13.1 LTS (https://nodejs.org)."; echo "RESULTADO: FALLA"; exit 1
fi
echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac
hay_git=si
command -v git > /dev/null 2>&1 || { hay_git=no; echo "AVISO: falta git (https://git-scm.com/downloads): F180 se omite."; }

echo "== Dependencias (ninguna: solo node:*)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Tests (node --test)"
if [ "$hay_git" = si ]; then
  node --test --test-force-exit --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test --test-force-exit (busca ✖ arriba)"
else
  node --test --test-force-exit --test-concurrency=1 --test-reporter=spec 'f17*/*.test.js' || falla "node --test --test-force-exit (busca ✖ arriba)"
  omite "f180-deuda-tecnica/deuda.test.js (sin git)"
fi

echo "== F177 · Strangler Fig"
guion "F177 demo" "node f177-strangler-fig/demo.js" 'GET  /api/pedidos/P-7       -> 200 servido por pedidos-nuevo' 'GET  /api/pedidos-antiguos  -> 200 servido por monolito' 'fase 1 (10 %): 104 de 1000 clientes'
guion "F177 error común (startsWith)" "node f177-strangler-fig/error-comun.js" 'GET /api/pedidos-antiguos -> 404 servido por pedidos-nuevo'

echo "== F178 · Coexistencia monolito + servicios"
guion "F178 demo" "node f178-coexistencia/demo.js" 'cambios aplicados: 5' 'conciliación: 2 pedidos revisados, 0 diferencias' 'P-1.totalCentimos: monolito=12050 servicio=12000'
guion "F178 error común (doble escritura)" "node f178-coexistencia/error-comun.js" 'conciliación: 3 revisados, 1 diferencia(s): P-2: falta en el servicio nuevo'

echo "== F179 · Métricas de éxito"
guion "F179 DORA y puerta de avance" "node f179-metricas-exito/metricas.js" 'lead time de cambio (h, med.)       295.3       20.6' 'puerta 50 % -> 100 %: NO AVANZAR'
guion "F179 error común (vanidad)" "node f179-metricas-exito/error-comun.js" 'lead time 300 -> 520 h (+73 %) => EMPEORA'

echo "== F180 · Deuda técnica"
if [ "$hay_git" = si ]; then
  guion "F180 hotspots" "node f180-deuda-tecnica/hotspots.js" 'facturacion.js                19          483        9177' 'acoplamiento temporal facturacion.js <-> pedidos.js: 100 %'
  guion "F180 registro" "node f180-deuda-tecnica/registro-deuda.js" 'interés total: 70.5 h/mes'
  guion "F180 decisión (no usar microservicios)" "node f180-deuda-tecnica/decision.js" 'DECISIÓN: NO usar microservicios'
  guion "F180 error común (el más feo)" "node f180-deuda-tecnica/error-comun.js" 'por «más feo»: reportes-legado.js (complejidad 993, 0 cambios'
else
  omite "scripts de F180 (sin git)"
fi

if [ "${1:-}" = "--compose" ]; then
  omite "este módulo no usa Docker Compose: SQLite va embebido en Node (node:sqlite) y los servidores HTTP son node:http"
fi

if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 31 (Migración desde monolito real) verificado (${omitidos} bloque(s) omitidos)"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
