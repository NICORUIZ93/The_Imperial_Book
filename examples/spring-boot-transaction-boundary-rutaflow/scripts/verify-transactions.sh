#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
./mvnw -q clean test
cat target/surefire-reports/academia.rutaflow.transacciones.FronteraTransaccionalTest.txt
