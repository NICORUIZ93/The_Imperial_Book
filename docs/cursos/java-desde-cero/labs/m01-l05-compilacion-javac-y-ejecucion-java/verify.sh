#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -rf out && mkdir -p out
javac -d out src/Saludo.java src/Main.java
test -f out/Main.class && test -f out/Saludo.class || { echo "FALLA: faltan .class"; exit 1; }
OUT="$(java -cp out Main)"
[[ "$OUT" == "compilado y ejecutado" ]] || { echo "FALLA: $OUT"; exit 1; }
echo "RESULTADO: OK"
