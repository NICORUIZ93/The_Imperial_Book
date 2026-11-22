#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/ScopeDemo.java
OUT="$(java -cp out ScopeDemo)"
echo "$OUT" | grep -q "caro"
echo "$OUT" | grep -q "119.0"
echo "RESULTADO: OK"
