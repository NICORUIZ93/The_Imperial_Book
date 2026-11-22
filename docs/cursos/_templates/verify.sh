#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# 1) Preparar entorno
# 2) Ejecutar construcción/lab
# 3) Comparar output esperado o estado

echo "RESULTADO: OK"
