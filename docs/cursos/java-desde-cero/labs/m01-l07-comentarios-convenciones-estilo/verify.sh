#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/CalculadoraImpuestos.java
OUT="$(java -cp out CalculadoraImpuestos)"
[[ "$OUT" == "119.0" || "$OUT" == "119" ]] || { echo "FALLA: $OUT"; exit 1; }
grep -q "TASA_IVA" src/CalculadoraImpuestos.java || { echo "FALLA: falta constante UPPER_SNAKE_CASE"; exit 1; }
grep -q "/\*\*" src/CalculadoraImpuestos.java || { echo "FALLA: falta Javadoc/comentario"; exit 1; }
echo "RESULTADO: OK"
