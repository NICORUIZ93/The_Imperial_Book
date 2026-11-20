#!/usr/bin/env bash
# Módulo 32 · F184 · ERROR COMÚN: lanzar toda la carga con UNA sola API key. El gateway (50 peticiones/s por cliente)
# rechaza con 429 y Gatling mide el limitador, no el sistema. Ejecuta: ./f184-carga-gatling/error-comun.sh
cd "$(dirname "$0")/.." || exit 1
node f184-carga-gatling/arrancar-sistema.js & pid=$!
sleep 1
npx gatling run --sources-folder f184-carga-gatling/src --results-folder logs/gatling --non-interactive \
  --simulation reservas tasa=60 segundos=20 claves=1 2>&1 | sed -n '/Global Information/,$p' | grep -E "request count|found 429|percentage of failed"
kill "$pid"
