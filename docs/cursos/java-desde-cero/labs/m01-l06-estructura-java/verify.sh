#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -rf out && mkdir -p out
javac -d out src/com/academia/app/util/Saludador.java src/com/academia/app/Main.java
OUT="$(java -cp out com.academia.app.Main)"
[[ "$OUT" == "Hola desde Academia" ]] || { echo "FALLA: $OUT"; exit 1; }
echo "RESULTADO: OK"
