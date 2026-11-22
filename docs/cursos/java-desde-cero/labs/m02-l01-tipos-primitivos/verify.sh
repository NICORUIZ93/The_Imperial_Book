#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/TiposDemo.java
OUT="$(java -cp out TiposDemo)"
echo "$OUT" | grep -q "edad=30"
echo "$OUT" | grep -q "poblacion=8000000000"
echo "$OUT" | grep -q "activo=true"
echo "$OUT" | grep -q "inicial=J"
echo "RESULTADO: OK"
