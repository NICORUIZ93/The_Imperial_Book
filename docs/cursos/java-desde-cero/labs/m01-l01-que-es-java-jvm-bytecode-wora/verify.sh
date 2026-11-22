#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/HolaJvm.java
OUT="$(java -cp out HolaJvm)"
[[ "$OUT" == "Hola JVM" ]] || { echo "FALLA: salida inesperada: $OUT"; exit 1; }
javap -c -classpath out HolaJvm | grep -q "println" || { echo "FALLA: bytecode no contiene println"; exit 1; }
test -f out/HolaJvm.class || { echo "FALLA: no se generó .class"; exit 1; }
echo "RESULTADO: OK"
