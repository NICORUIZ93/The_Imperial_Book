#!/usr/bin/env bash
# F060 · Experimento de caos con Toxiproxy contra el BFF de producto (f060-caos) en localhost:8080.
# Antes: docker compose up -d --wait   y   (cd f060-caos && ../gradlew bootRun)
# Hipótesis: con +600 ms de latencia en el inventario, el p95 de /productos/7 sigue < 300 ms y no hay 5xx.
# Uso: caos/experimento.sh [latencia_ms] [p95_maximo_ms]
set -euo pipefail
API=${TOXIPROXY_API:-http://localhost:8474}
URL=${URL:-http://localhost:8080/productos/7}
LATENCIA=${1:-600}
P95_MAX=${2:-300}
N=20

medir() {   # imprime "p95_ms errores degradadas"
  local tiempos=() errores=0 degradadas=0 salida codigo ms
  for _ in $(seq 1 "$N"); do
    salida=$(curl -s -w '\n%{http_code} %{time_total}' --max-time 5 "$URL" || echo $'\n000 5')
    codigo=$(tail -1 <<<"$salida" | cut -d' ' -f1)
    ms=$(tail -1 <<<"$salida" | awk '{printf "%d", $2 * 1000}')
    tiempos+=("$ms")
    [ "$codigo" -ge 500 ] || [ "$codigo" = 000 ] && errores=$((errores + 1))
    grep -qE '"degradado": *true' <<<"$salida" && degradadas=$((degradadas + 1))
  done
  local p95
  p95=$(printf '%s\n' "${tiempos[@]}" | sort -n | awk -v n="$N" '{v[NR]=$1} END {i=int(0.95*n+0.999); print v[i]}')
  echo "$p95 $errores $degradadas"
}

revertir() { curl -fsS -X DELETE "$API/proxies/inventario/toxics/caos" > /dev/null 2>&1 || true; }
trap revertir EXIT INT TERM        # condición de aborto: pase lo que pase, el fallo se retira

medir > /dev/null                   # calentamiento
read -r p95 err deg < <(medir); echo "1. estado estable:  p95=${p95} ms errores=${err} degradadas=${deg}/${N}"
echo "2. hipótesis: con +${LATENCIA} ms en inventario, p95 < ${P95_MAX} ms y 0 errores"
curl -fsS -X POST "$API/proxies/inventario/toxics" -H 'Content-Type: application/json' \
  -d "{\"name\":\"caos\",\"type\":\"latency\",\"stream\":\"downstream\",\"toxicity\":1.0,\"attributes\":{\"latency\":${LATENCIA}}}" > /dev/null
echo "3. inyectado: latency ${LATENCIA} ms en el proxy inventario (radio: solo ese proxy)"
read -r p95 err deg < <(medir); echo "4. con el fallo:    p95=${p95} ms errores=${err} degradadas=${deg}/${N}"
revertir
read -r p95b errb degb < <(medir); echo "5. tras revertir:   p95=${p95b} ms errores=${errb} degradadas=${degb}/${N}"
if [ "$p95" -lt "$P95_MAX" ] && [ "$err" -eq 0 ]; then
  echo "6. hipótesis CONFIRMADA"
else
  echo "6. hipótesis REFUTADA: hay una debilidad que corregir"; exit 1
fi
