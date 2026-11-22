#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm install >/dev/null
npm run build >/dev/null
OUT="$(npm start --silent)"
EXPECTED="Hola, estudiante. Proyecto Node listo."
[[ "$OUT" == "$EXPECTED" ]] || { echo "FALLA: salida inesperada: $OUT"; exit 1; }
npm test >/dev/null 2>&1
echo "RESULTADO: OK"
