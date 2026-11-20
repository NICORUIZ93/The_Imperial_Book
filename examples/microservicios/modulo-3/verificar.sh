#!/usr/bin/env bash
# Módulo 0.4 · Ejecuta los tests de Git, terminal, HTTP, JSON, YAML y variables de entorno.
# Uso: ./verificar.sh   (requiere Git 2.28 o posterior, Node.js 26.13.1 LTS, JDK 25 LTS y npm para instalar yaml)
set -u
cd "$(dirname "$0")"
fallos=0
echo "== Git ($(git --version))";      ./git/test-git.sh || fallos=$((fallos + 1))
echo "== Terminal ($(bash --version | head -1))"; ./terminal/test-terminal.sh || fallos=$((fallos + 1))
echo "== Dependencias de Node (yaml)"; npm install --no-audit --no-fund --silent || fallos=$((fallos + 1))
echo "== Node.js $(node --version): HTTP, JSON, YAML, variables de entorno"
node --test --test-reporter=spec || fallos=$((fallos + 1))
echo "== Java: variables de entorno"
(cd env && java ConfigTest.java) || fallos=$((fallos + 1))
if [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 0.4 (Git, terminal, HTTP, JSON, YAML, entorno) verificado"
else
  echo "RESULTADO: FALLA · $fallos bloque(s) con ✖ arriba"
  exit 1
fi
