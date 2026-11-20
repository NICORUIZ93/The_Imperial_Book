#!/usr/bin/env bash
# Módulo 0.3 · Ejecuta los tests de Java y de Node.js y muestra el resultado.
# Uso: ./verificar.sh   (requiere JDK 25 LTS y Node.js 26.13.1 LTS; funciona desde JDK 22 y Node 22)
set -u
cd "$(dirname "$0")"
fallos=0
echo "== Java ($(java -version 2>&1 | head -1))"
(cd java && java TiendaTest.java && java DiferenciasTest.java) || fallos=$((fallos + 1))
echo "== Node.js ($(node --version))"
(cd node && node --test --test-reporter=spec) || fallos=$((fallos + 1))
if [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 0.3 (Java y Node.js lado a lado) verificado"
else
  echo "RESULTADO: FALLA · revisa la sección marcada con ✖ arriba"
  exit 1
fi
