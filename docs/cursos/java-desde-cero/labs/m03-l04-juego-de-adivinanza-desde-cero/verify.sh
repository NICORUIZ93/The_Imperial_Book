#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/Adivinanza.java
OUT="$(java -cp out Adivinanza)"
[ "$(echo "$OUT" | sed -n '1p')" = "muy bajo" ]
[ "$(echo "$OUT" | sed -n '2p')" = "muy alto" ]
[ "$(echo "$OUT" | sed -n '3p')" = "correcto" ]
echo "RESULTADO: OK"
