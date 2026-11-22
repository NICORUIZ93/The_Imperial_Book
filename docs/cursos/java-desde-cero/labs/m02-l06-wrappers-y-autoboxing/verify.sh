#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/WrappersDemo.java
OUT="$(java -cp out WrappersDemo)"
echo "$OUT" | grep -q "10"
echo "$OUT" | grep -q "42"
echo "$OUT" | grep -q "2"
echo "RESULTADO: OK"
