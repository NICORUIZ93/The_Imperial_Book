#!/usr/bin/env bash
# F048 · Cómo se ve un mensaje Protocol Buffers en el cable, y qué pasa si cambias los números de campo.
# Busca protoc en este orden, sin depender de paquetes globales de Python:
#   1. `protoc` en el PATH (por ejemplo, `brew install protobuf`).
#   2. El protoc que descargó el build de Gradle de f048-grpc (plugin com.google.protobuf) en ~/.gradle.
#   3. Un entorno virtual propio en protobuf/.venv con grpcio-tools 1.84.1 (tiene ruedas para Python 3.10 a 3.15).
set -euo pipefail
cd "$(dirname "$0")/.."
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

buscar_protoc_de_gradle() {
  local so arq
  case "$(uname -s)" in Darwin) so=osx ;; Linux) so=linux ;; *) return 1 ;; esac
  case "$(uname -m)" in arm64|aarch64) arq=aarch_64 ;; x86_64|amd64) arq=x86_64 ;; *) return 1 ;; esac
  # protobuf-java 4.36.2 (BOM de Spring Boot 4.1.3) -> com.google.protobuf:protoc:4.36.2:exe:<so>-<arq>
  # La caché de Gradle guarda cada archivo en una carpeta con su hash: se busca por nombre
  local cache="${GRADLE_USER_HOME:-${HOME}/.gradle}/caches/modules-2/files-2.1/com.google.protobuf/protoc/4.36.2"
  [ -d "$cache" ] || return 1
  local exe
  exe=$(find "$cache" -name "protoc-4.36.2-${so}-${arq}.exe" | head -1)
  [ -n "$exe" ] || return 1
  cp "$exe" "$TMP/protoc" && chmod +x "$TMP/protoc"   # se copia para darle permiso de ejecución sin tocar la caché
  echo "$TMP/protoc"
}

if command -v protoc >/dev/null; then
  PROTOC=(protoc)
elif P=$(buscar_protoc_de_gradle); then
  PROTOC=("$P")
else
  VENV=protobuf/.venv
  if [ ! -x "$VENV/bin/python" ]; then
    echo "== Creando $VENV con grpcio-tools 1.84.1 (solo la primera vez)"
    python3 -m venv "$VENV"
    "$VENV/bin/python" -m pip install -q grpcio-tools==1.84.1
  fi
  PROTOC=("$VENV/bin/python" -m grpc_tools.protoc)
fi
echo "== protoc: $("${PROTOC[@]}" --version)"

MSG='sku: "CAFE"
disponibles: 12'
BIN="$TMP/existencia.bin"
echo "$MSG" | "${PROTOC[@]}" -I src/main/proto --encode=academia.inventario.v1.Existencia src/main/proto/inventario.proto > "$BIN"
echo "== Bytes en el cable ($(wc -c < "$BIN" | tr -d ' ') bytes):"
od -An -tx1 "$BIN"
echo "== El mismo dato en JSON ($(printf '{"sku":"CAFE","disponibles":12}' | wc -c | tr -d ' ') bytes):"
echo '{"sku":"CAFE","disponibles":12}'
echo "== Leído con el contrato correcto:"
"${PROTOC[@]}" -I src/main/proto --decode=academia.inventario.v1.Existencia src/main/proto/inventario.proto < "$BIN"
echo "== Leído con el contrato v2 (números cambiados): sku y disponibles quedan vacíos, todo va a campos desconocidos"
"${PROTOC[@]}" -I protobuf --decode=academia.inventario.v1.Existencia protobuf/inventario-v2-roto.proto < "$BIN"
