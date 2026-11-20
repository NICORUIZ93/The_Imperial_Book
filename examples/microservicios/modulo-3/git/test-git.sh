#!/usr/bin/env bash
# Test del laboratorio de Git: ejecuta practica.sh en una carpeta temporal y comprueba el resultado.
set -euo pipefail
cd "$(dirname "$0")"
DIR="$(mktemp -d /tmp/test-git.XXXX)"
./practica.sh "$DIR" > /dev/null
fallos=0
comprobar() { if [ "$2" = "$3" ]; then echo "✔ $1"; else echo "✖ $1 (esperado '$2', obtenido '$3')"; fallos=$((fallos + 1)); fi; }
comprobar "hay 2 commits en main" "2" "$(git -C "$DIR" rev-list --count main)"
comprobar "el último commit es 'Agrega saludo'" "Agrega saludo" "$(git -C "$DIR" log -1 --format=%s)"
comprobar "existe la rama saludo" "saludo" "$(git -C "$DIR" branch --list saludo --format='%(refname:short)')"
comprobar "no quedan cambios sin confirmar" "" "$(git -C "$DIR" status --porcelain)"
[ "$fallos" -eq 0 ] && echo "Git: todos los tests pasaron" || { echo "Git: $fallos test(s) fallaron"; exit 1; }
