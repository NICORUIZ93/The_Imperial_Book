#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/ControlFlow.java
OUT="$(java -cp out ControlFlow)"
echo "$OUT" | grep -q "negativo"
echo "$OUT" | grep -q "cero"
echo "$OUT" | grep -q "positivo"
echo "$OUT" | grep -q "lunes"
echo "$OUT" | grep -q "otro"
echo "RESULTADO: OK"
