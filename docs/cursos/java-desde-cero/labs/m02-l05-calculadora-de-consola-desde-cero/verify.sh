#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/Calculadora.java
[[ "$(java -cp out Calculadora sumar 2 3)" == "5" ]] || exit 1
[[ "$(java -cp out Calculadora restar 5 2)" == "3" ]] || exit 1
[[ "$(java -cp out Calculadora mult 4 3)" == "12" ]] || exit 1
[[ "$(java -cp out Calculadora div 8 2)" == "4" ]] || exit 1
echo "RESULTADO: OK"
