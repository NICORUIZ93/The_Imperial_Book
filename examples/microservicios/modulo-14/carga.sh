#!/usr/bin/env bash
# F070/F074 · Genera tráfico contra f070-pedidos (:8080). Uso: ./carga.sh [segundos] [porcentaje-lento]
# Con 5 % de peticiones lentas (600 ms) el p99 supera 500 ms y la alerta pasa a pending y luego a firing.
set -u
dur="${1:-60}"; lento="${2:-0}"
fin=$(( $(date +%s) + dur ))
i=0
while [ "$(date +%s)" -lt "$fin" ]; do
  i=$((i + 1))
  if [ $((i % 100)) -lt "$lento" ]; then q="?lento=true"; else q=""; fi
  curl -s -o /dev/null "localhost:8080/pedidos/$i$q" &
  [ $((i % 10)) -eq 0 ] && curl -s -o /dev/null -X POST "localhost:8080/pedidos?canal=web"
  sleep 0.05
done
wait
echo "$i peticiones en $dur s (${lento} % lentas)"
