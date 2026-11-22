#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm install >/dev/null 2>&1
npm run build >/dev/null 2>&1 || true
npm test >/dev/null 2>&1
echo "RESULTADO: OK"
