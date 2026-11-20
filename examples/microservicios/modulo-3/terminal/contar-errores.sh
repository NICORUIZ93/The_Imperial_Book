#!/usr/bin/env bash
# Módulo 0.4 · Terminal: cuenta las líneas ERROR de un log y muestra cuáles son.
# Requisitos: bash 3.2+ (el de macOS sirve) y grep. Sin otras dependencias.
# Uso: ./contar-errores.sh datos/app.log
set -euo pipefail
ARCHIVO="${1:?Uso: $0 ARCHIVO_DE_LOG}"     # ${1:?...} = si falta el argumento, error con este mensaje
if [ ! -f "$ARCHIVO" ]; then
  echo "No existe el archivo: $ARCHIVO" >&2  # >&2 = escribir en la salida de errores
  exit 2                                     # código de salida distinto de 0 = algo falló
fi
TOTAL=$(grep -c "ERROR" "$ARCHIVO" || true) # $( ) = guarda la salida de un comando en una variable
echo "Errores encontrados: $TOTAL"
grep "ERROR" "$ARCHIVO" | cut -c21- || true  # tubería |: la salida de grep entra a cut (quita la fecha)
