#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/PatternDemo.java
OUT="$(java -cp out PatternDemo)"
[ "$(echo "$OUT" | sed -n '1p')" = "str:4" ]
[ "$(echo "$OUT" | sed -n '2p')" = "int:42" ]
[ "$(echo "$OUT" | sed -n '3p')" = "otro" ]
echo "RESULTADO: OK"
