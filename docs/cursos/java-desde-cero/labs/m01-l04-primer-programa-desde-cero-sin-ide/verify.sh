#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/HolaRuta.java
OUT1="$(java -cp out HolaRuta)"
OUT2="$(java -cp out HolaRuta Ada)"
[[ "$OUT1" == "Hola, mundo!" ]] || { echo "FALLA: $OUT1"; exit 1; }
[[ "$OUT2" == "Hola, Ada!" ]] || { echo "FALLA: $OUT2"; exit 1; }
echo "RESULTADO: OK"
