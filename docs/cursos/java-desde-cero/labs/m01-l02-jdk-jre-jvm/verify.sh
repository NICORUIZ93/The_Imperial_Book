#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
mkdir -p out
javac -d out src/HolaComponentes.java
OUT="$(java -cp out HolaComponentes)"
EXPECTED="JDK compila, JVM ejecuta"
if [[ "$OUT" != "$EXPECTED" ]]; then
  echo "FALLA: salida inesperada: $OUT" >&2
  exit 1
fi
command -v javac >/dev/null || { echo "FALLA: javac no está en PATH"; exit 1; }
command -v java >/dev/null || { echo "FALLA: java no está en PATH"; exit 1; }
echo "RESULTADO: OK"
