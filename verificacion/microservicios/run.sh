#!/bin/bash
# Verifica en el Mac del dueño los laboratorios de «Microservicios de Cero a Maestro» (specs/018, M2).
# Ejecuta examples/microservicios/modulo-N/verificar.sh (con --compose si el módulo trae docker-compose.yml)
# y escribe resultados.tsv: curso, laboratorio, PASS|FAIL, detalle. Uso: bash run.sh [patrón glob, p. ej. "modulo-6" o "modulo-1*"]
set -u
KIT="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$KIT/../.." && pwd)"
FILTRO="${1:-}"; LIMITE="${LIMITE_LAB:-2400}"; ok=0; mala=0
mkdir -p "$KIT/logs"; touch "$KIT/resultados.tsv"
# Un barrido filtrado no borra el registro de los módulos que no corrió: reemplaza solo la fila del
# laboratorio que acaba de ejecutar.
registra() { local lab=$1 estado=$2 detalle=$3 tmp="$KIT/.resultados.tmp"
  { grep -v "^microservices	$lab	" "$KIT/resultados.tsv" || true; printf 'microservices\t%s\t%s\t%s\n' "$lab" "$estado" "$detalle"; } > "$tmp"
  mv "$tmp" "$KIT/resultados.tsv"; }
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
  if [ $rc -eq 0 ] && grep -qa "RESULTADO: OK" "$KIT/logs/$lab.log"; then estado=PASS; detalle="ok (${seg}s)"
  else
    estado=FAIL
    motivo=$(grep -a "RESULTADO" "$KIT/logs/$lab.log" | tail -1)
    [ -n "$motivo" ] || motivo=$(grep -a -m1 -iE 'error|fail|✘' "$KIT/logs/$lab.log" | cut -c1-200)
    detalle="rc=$rc (${seg}s): $motivo"
  fi
  registra "$lab" "$estado" "$detalle"
  echo "$estado $detalle"; case $estado in PASS) ok=$((ok+1));; *) mala=$((mala+1));; esac
  (cd "$dir" && [ -f docker-compose.yml ] && docker compose down -v >/dev/null 2>&1) || true
done
echo "== esta corrida: $ok PASS / $mala FAIL · registro ($(wc -l < "$KIT/resultados.tsv" | tr -d ' ') filas): $(cut -f3 "$KIT/resultados.tsv" | sort | uniq -c | tr '\n' ' ')"
