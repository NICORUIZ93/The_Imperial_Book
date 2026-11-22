#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm install >/dev/null
npm test >/dev/null
echo "RESULTADO: OK"
