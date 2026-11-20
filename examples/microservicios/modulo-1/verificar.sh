#!/usr/bin/env bash
# Módulo 0.2 · Ejecuta todos los tests del laboratorio y muestra el resultado.
# Uso: ./verificar.sh   (requiere Node.js 26.13.1 LTS; funciona desde Node 22)
set -u
cd "$(dirname "$0")"
echo "Node.js $(node --version)"
if node --test --test-reporter=spec; then
  echo "RESULTADO: OK · Módulo 0.2 (lógica y pensamiento computacional) verificado"
else
  echo "RESULTADO: FALLA · revisa el test marcado con ✖ arriba"
  exit 1
fi
