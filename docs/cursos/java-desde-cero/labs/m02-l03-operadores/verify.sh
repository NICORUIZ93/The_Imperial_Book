#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/OperadoresDemo.java
OUT="$(java -cp out OperadoresDemo)"
printf "%s" "$OUT" | grep -q "13"
printf "%s" "$OUT" | grep -q "true"
printf "%s" "$OUT" | grep -q "2"
echo "RESULTADO: OK"
