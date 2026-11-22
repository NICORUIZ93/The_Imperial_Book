#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/StringLab.java
OUT="$(java -cp out StringLab)"
echo "$OUT" | grep -q "hola mundo"
echo "$OUT" | grep -q "true"
echo "$OUT" | grep -q "false"
echo "$OUT" | grep -q "hola-java-21"
echo "RESULTADO: OK"
