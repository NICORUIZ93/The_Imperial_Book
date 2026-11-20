#!/usr/bin/env bash
# Módulo 28 · FinOps y costo de arquitectura (modulo-32, fichas F165–F168).
# Sin dependencias ni Docker: npm ci (lockfile vacío), 18 tests de node --test --test-force-exit y los scripts de las cuatro fichas con
# los precios oficiales de comun/precios.js. Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh [--compose]. Requiere Node.js 26.13.1 LTS y npm; bash 3.2 de macOS sirve. Logs en logs/.
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

echo "== Dependencias (ninguna: solo node:*)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Tests (node --test, 18 en total)"
node --test --test-force-exit --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test --test-force-exit (busca ✖ arriba)"

echo "== F165 · Modelo de costo cloud"
guion "F165 monolito" "node f165-modelo-costo/modelo.js f165-modelo-costo/monolito.json" 'TOTAL                      108.86 USD' 'costo unitario: 0.0363 USD por cada 1000 pedidos'
guion "F165 microservicios" "node f165-modelo-costo/modelo.js f165-modelo-costo/microservicios.json" 'TOTAL                      398.14 USD' 'costo unitario: 0.1327 USD por cada 1000 pedidos'
guion "F165 error común (solo cómputo)" "node f165-modelo-costo/error-comun.js" 'infravaloración:            127.84 USD/mes (32.1 % de la factura)'

echo "== F166 · Right-sizing"
guion "F166 recomendación" "node f166-right-sizing/rightsizing.js" 'TOTAL al mes: 198.36 USD -> 78.84 USD · ahorro 119.52 USD (60.3 %)' 'pagos            2  0.25 vCPU/512 MiB'
guion "F166 error común (memoria por la media)" "node f166-right-sizing/error-comun.js" '343 minutos de 10080 por encima (OOMKilled)' '0 minutos de 10080 por encima (sin reinicios)'

echo "== F167 · Break-even Serverless vs Contenedores"
guion "F167 tabla" "node f167-break-even/breakeven.js" 'break-even: 30,033,610 peticiones/mes (11.4 peticiones/s de media)' '1e+9  1,200.00 USD    360.40 USD (20)   Fargate'
guion "F167 error común (tiempo de espera)" "node f167-break-even/error-comun.js" 'break-even 10,200,092 pet/mes'

echo "== F168 · Observability tax"
guion "F168 dos escenarios" "node f168-observability-tax/observabilidad.js" 'TOTAL                   13,212.94 USD' 'TOTAL                      149.95 USD  -> 38 %'
guion "F168 error común (user_id como etiqueta)" "node f168-observability-tax/error-comun.js" '140,400,000 series en Prometheus'

if [ "${1:-}" = "--compose" ]; then
  omite "este módulo no usa Docker Compose: todo se calcula con los precios de comun/precios.js"
fi

if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 28 (FinOps y costo de arquitectura) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
