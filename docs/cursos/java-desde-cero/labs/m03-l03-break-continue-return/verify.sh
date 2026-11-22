#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/BreakContinue.java
OUT="$(java -cp out BreakContinue)"
[ "$(echo "$OUT" | sed -n '1p')" = "2" ]
[ "$(echo "$OUT" | sed -n '2p')" = "9" ]
echo "RESULTADO: OK"
