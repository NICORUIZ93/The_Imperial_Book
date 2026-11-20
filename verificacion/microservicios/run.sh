#!/bin/bash
# Verifica en el Mac del dueño los laboratorios de «Microservicios de Cero a Maestro» (specs/018, M2).
# Ejecuta examples/microservicios/modulo-N/verificar.sh (con --compose si el módulo trae docker-compose.yml)
# y escribe resultados.tsv: curso, laboratorio, PASS|FAIL, detalle. Uso: bash run.sh [patrón glob, p. ej. "modulo-6" o "modulo-1*"]
set -u
KIT="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$KIT/../.." && pwd)"
FILTRO="${1:-}"; LIMITE="${LIMITE_LAB:-2400}"
mkdir -p "$KIT/logs"; : > "$KIT/resultados.tsv"
con_limite() { local s=$1; shift; ( "$@" </dev/null & p=$!; ( sleep "$s"; kill -TERM -$p 2>/dev/null; kill -9 $p 2>/dev/null ) & v=$!; wait $p; r=$?; kill $v 2>/dev/null; exit $r ); }
for n in $(ls -d "$ROOT"/examples/microservicios/modulo-* | sed 's/.*modulo-//' | sort -n); do
  dir="$ROOT/examples/microservicios/modulo-$n"
  lab=$(basename "$dir"); [ -n "$FILTRO" ] && case "$lab" in $FILTRO) ;; *) continue ;; esac
  [ -x "$dir/verificar.sh" ] || chmod +x "$dir/verificar.sh" 2>/dev/null
  args=(); [ -f "$dir/docker-compose.yml" ] && grep -q -- "--compose" "$dir/verificar.sh" && args=(--compose)
  printf '[%s] %-12s ' "$(date +%H:%M:%S)" "$lab"
  inicio=$(date +%s)
  (cd "$dir" && con_limite "$LIMITE" bash ./verificar.sh ${args[@]+"${args[@]}"}) > "$KIT/logs/$lab.log" 2>&1; rc=$?
  seg=$(( $(date +%s) - inicio ))
  if [ $rc -eq 0 ] && grep -q "RESULTADO: OK" "$KIT/logs/$lab.log"; then estado=PASS; detalle="ok (${seg}s)"
  else estado=FAIL; detalle="rc=$rc (${seg}s): $(grep -m1 -iE 'error|fail|✘' "$KIT/logs/$lab.log" | cut -c1-200)"; fi
  echo "$estado $detalle"
  printf 'microservices\t%s\t%s\t%s\n' "$lab" "$estado" "$detalle" >> "$KIT/resultados.tsv"
  (cd "$dir" && [ -f docker-compose.yml ] && docker compose down -v >/dev/null 2>&1) || true
done
echo "== $(cut -f3 "$KIT/resultados.tsv" | sort | uniq -c | tr '\n' ' ')"
