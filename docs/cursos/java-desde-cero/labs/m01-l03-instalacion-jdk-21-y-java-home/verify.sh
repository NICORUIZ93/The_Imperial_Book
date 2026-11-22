#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v java >/dev/null || { echo "FALLA: java no está en PATH"; exit 1; }
command -v javac >/dev/null || { echo "FALLA: javac no está en PATH"; exit 1; }
mkdir -p out
javac -d out src/CheckJava.java
OUT="$(java -cp out CheckJava)"
echo "$OUT" | grep -q "JAVA_VERSION=" || { echo "FALLA: no reporta versión"; exit 1; }
echo "$OUT" | grep -q "JAVA_HOME=OK" || { echo "FALLA: java.home vacío"; exit 1; }
echo "RESULTADO: OK"
