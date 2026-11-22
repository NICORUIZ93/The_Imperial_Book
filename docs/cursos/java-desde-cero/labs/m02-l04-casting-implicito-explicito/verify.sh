#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/CastingDemo.java
OUT="$(java -cp out CastingDemo)"
echo "$OUT" | grep -q "10.0"
echo "$OUT" | grep -q "^9$"
echo "RESULTADO: OK"
