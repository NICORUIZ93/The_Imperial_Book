#!/usr/bin/env bash
# Módulo 24 · Gobernanza arquitectónica (modulo-28, fichas F148–F151).
# Sin Docker: npm ci, 21 tests de node --test y los scripts de cada ficha (lint e índice de ADRs, vistas C4 generadas,
# informe ATAM, fitness functions sobre dos versiones reales del servicio).
# Con --compose: además levanta dos versiones del servicio y Prometheus v3.15.1, genera 2 minutos de carga y evalúa
# las fitness functions con PromQL (v1 debe pasar y v2 suspender). Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh [--compose]. Requiere Node.js 26.13.1 LTS y npm; bash 3.2 de macOS sirve. Logs en logs/.
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1
fallos=""; omitidos=0
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
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

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac

echo "== Dependencias (prom-client 15.1.3)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Tests (node --test, 21 en total)"
node --test --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test (busca ✖ arriba)"

echo "== F148 · ADRs"
guion "F148 lint de los ADRs de ejemplo" "node f148-adrs/adr.js f148-adrs/docs/adr lint" '✔ 3 ADRs sin problemas'
guion "F148 índice" "node f148-adrs/adr.js f148-adrs/docs/adr indice" '| Reemplazado por ADR-0003 | 2026-11-05 |'
guion "F148 error común (registro de una línea)" "node f148-adrs/adr.js f148-adrs/error-comun lint" '0 opciones en la tabla' '5 problemas en 1 ADRs'
tmp=$(mktemp -d)
guion "F148 ciclo nuevo → reemplazar → índice" "node f148-adrs/adr.js ${tmp} nuevo 'Usamos PostgreSQL para pedidos' && node f148-adrs/adr.js ${tmp} reemplazar 1 'Usamos PostgreSQL con réplicas de lectura' && node f148-adrs/adr.js ${tmp} indice" \
  'creado 0001-usamos-postgresql-para-pedidos.md' 'creado 0002-usamos-postgresql-con-replicas-de-lectura.md' '| Reemplazado por ADR-0002 |'
rm -rf "$tmp"

echo "== F149 · Modelo C4"
guion "F149 validar el modelo" "node f149-c4/c4.js f149-c4/modelo.json validar" '✔ modelo «Tienda en línea»: 2 personas, 2 sistemas externos, 7 contenedores, 10 relaciones'
guion "F149 vista de contexto" "node f149-c4/c4.js f149-c4/modelo.json contexto" 'cliente -- "Compra en<br/>[HTTPS]" --> tienda'
guion "F149 vista de contenedores" "node f149-c4/c4.js f149-c4/modelo.json contenedores" 'subgraph tienda["Tienda [Sistema de software]"]'
guion "F149 error común (diagrama de pizarra)" "node f149-c4/c4.js f149-c4/error-comun.json validar" 'mezcla niveles' '5 problemas'

echo "== F150 · ATAM ligero"
guion "F150 informe" "node f150-atam/atam.js f150-atam/atam.json" 'Prioridad: R1(A,A) > C1(A,M) > D1(A,M) > O1(M,M) > M1(M,B)' '▲ Consistencia de los cobros: 1 riesgo(s)'
guion "F150 error común (escenarios vagos)" "node f150-atam/atam.js f150-atam/error-comun.json" 'la medida «rápido» no tiene un número' '5 problemas'

echo "== F151 · Fitness functions en producción"
guion "F151 simulación v1 sana / v2 degradada" "node f151-fitness/simulacion.js" \
  'APTA: la arquitectura sigue cumpliendo' '✘ FF1 latencia p99 de /pedidos             367 ms' '✘ FF3 dependencias síncronas de pedidos         2' 'NO APTA'
guion "F151 error común (media frente a p99)" "node f151-fitness/error-comun.js" '✔ «pasa»' 'BIEN p99 de latencia:   367 ms -> ✘ suspende'

if [ "${1:-}" = "--compose" ]; then
  if ! command -v docker > /dev/null 2>&1 || ! docker info > /dev/null 2>&1; then
    omite "F151 con Prometheus: no hay Docker en marcha"
  else
    compose=si
    echo "== F151 · Prometheus v3.15.1 + dos versiones del servicio (docker compose up -d --wait)"
    if docker compose up -d --wait > logs/compose-up.log 2>&1; then echo "✔ contenedores arriba"; else tail -20 logs/compose-up.log; falla "docker compose up (mira logs/compose-up.log)"; fi
    echo "   2 minutos de carga para que rate(...[5m]) tenga datos…"
    node f151-fitness/carga.js 2 > logs/carga.log 2>&1 || falla "carga.js"
    tail -1 logs/carga.log
    node f151-fitness/fitness.js --prometheus http://127.0.0.1:19090 --job pedidos-v1 > logs/fitness-v1.log 2>&1; rc1=$?
    node f151-fitness/fitness.js --prometheus http://127.0.0.1:19090 --job pedidos-v2 > logs/fitness-v2.log 2>&1; rc2=$?
    cat logs/fitness-v1.log logs/fitness-v2.log
    [ $rc1 -eq 0 ] && echo "✔ v1 cumple las fitness functions en Prometheus" || falla "v1 debía cumplir (mira logs/fitness-v1.log)"
    [ $rc2 -eq 1 ] && grep -q '✘ FF3' logs/fitness-v2.log && echo "✔ v2 suspende en Prometheus (código 1)" || falla "v2 debía suspender con código 1 (mira logs/fitness-v2.log)"
  fi
else
  omite "F151 con Prometheus (docker-compose.yml): usa --compose"
fi

limpiar; compose=no
if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 24 (Gobernanza arquitectónica) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
