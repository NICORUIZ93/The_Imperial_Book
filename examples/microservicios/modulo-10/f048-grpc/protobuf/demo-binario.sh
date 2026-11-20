#!/usr/bin/env bash
# F048 · Cómo se ve un mensaje Protocol Buffers en el cable, y qué pasa si cambias los números de campo.
# Requiere protoc (brew install protobuf) o Python con grpcio-tools (pip install grpcio-tools==1.84.1).
set -euo pipefail
cd "$(dirname "$0")/.."
if command -v protoc >/dev/null; then PROTOC=(protoc); else PROTOC=(python3 -m grpc_tools.protoc); fi
MSG='sku: "CAFE"
disponibles: 12'
BIN=$(mktemp)
echo "$MSG" | "${PROTOC[@]}" -I src/main/proto --encode=academia.inventario.v1.Existencia src/main/proto/inventario.proto > "$BIN"
echo "== Bytes en el cable ($(wc -c < "$BIN" | tr -d ' ') bytes):"
od -An -tx1 "$BIN"
echo "== El mismo dato en JSON ($(printf '{"sku":"CAFE","disponibles":12}' | wc -c | tr -d ' ') bytes):"
echo '{"sku":"CAFE","disponibles":12}'
echo "== Leído con el contrato correcto:"
"${PROTOC[@]}" -I src/main/proto --decode=academia.inventario.v1.Existencia src/main/proto/inventario.proto < "$BIN"
echo "== Leído con el contrato v2 (números cambiados): sku y disponibles quedan vacíos, todo va a campos desconocidos"
"${PROTOC[@]}" -I protobuf --decode=academia.inventario.v1.Existencia protobuf/inventario-v2-roto.proto < "$BIN"
rm -f "$BIN"
