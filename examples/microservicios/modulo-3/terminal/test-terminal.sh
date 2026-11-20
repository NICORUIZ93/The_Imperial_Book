#!/usr/bin/env bash
# Test del laboratorio de terminal: comprueba salida y códigos de salida de contar-errores.sh.
set -uo pipefail
cd "$(dirname "$0")"
fallos=0
comprobar() { if [ "$2" = "$3" ]; then echo "✔ $1"; else echo "✖ $1 (esperado '$2', obtenido '$3')"; fallos=$((fallos + 1)); fi; }
comprobar "cuenta 2 errores" "Errores encontrados: 2" "$(./contar-errores.sh datos/app.log | head -1)"
./contar-errores.sh datos/app.log > /dev/null; comprobar "termina con código 0 si todo va bien" "0" "$?"
./contar-errores.sh no-existe.log 2> /dev/null; comprobar "termina con código 2 si falta el archivo" "2" "$?"
comprobar "la tubería grep | wc -l da lo mismo" "2" "$(grep ERROR datos/app.log | wc -l | tr -d ' ')"
[ "$fallos" -eq 0 ] && echo "Terminal: todos los tests pasaron" || { echo "Terminal: $fallos test(s) fallaron"; exit 1; }
