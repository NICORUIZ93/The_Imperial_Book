#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mvn -q -pl domain,app -am test
echo "RESULTADO: OK"
