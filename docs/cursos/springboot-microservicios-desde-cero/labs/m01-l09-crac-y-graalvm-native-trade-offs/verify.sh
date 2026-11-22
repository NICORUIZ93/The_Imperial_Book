#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
./measure-startup.sh >/tmp/m01l09.measure
grep -q "startup_ms=" /tmp/m01l09.measure
grep -q "CRaC" README.md
grep -q "GraalVM" README.md
grep -q "Cuándo NO usar" README.md
echo "RESULTADO: OK"
