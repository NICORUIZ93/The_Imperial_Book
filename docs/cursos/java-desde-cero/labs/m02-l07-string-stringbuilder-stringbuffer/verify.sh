#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/StringDemo.java
OUT="$(java -cp out StringDemo)"
echo "$OUT" | grep -q "hola mundo"
echo "$OUT" | grep -q "java-21"
echo "$OUT" | grep -q "seguro"
echo "RESULTADO: OK"
