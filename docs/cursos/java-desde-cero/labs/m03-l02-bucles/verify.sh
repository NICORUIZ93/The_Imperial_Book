#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/BuclesDemo.java
OUT="$(java -cp out BuclesDemo)"
[ "$(echo "$OUT" | sed -n '1p')" = "15" ]
[ "$(echo "$OUT" | sed -n '2p')" = "15" ]
[ "$(echo "$OUT" | sed -n '3p')" = "15" ]
echo "RESULTADO: OK"
