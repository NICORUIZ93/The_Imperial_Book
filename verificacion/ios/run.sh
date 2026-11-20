#!/usr/bin/env bash
# Kit de verificación iOS (specs/019). Se ejecuta en macOS con Xcode; no necesita simulador.
#
#   bash verificacion/ios/run.sh            # extrae y verifica todas las unidades
#   bash verificacion/ios/run.sh m05        # solo las unidades cuyo nombre contiene «m05»
#   SIN_EXTRAER=1 bash .../run.sh           # reutiliza build/ tal como está
#   TIMEOUT_UNIDAD=900 bash .../run.sh      # segundos por unidad (por defecto 600)
#
# Cada unidad de build/ trae un pasos.sh: los comandos de la lección (SwiftPM, swiftc) o un typecheck
# para el SDK de iOS Simulator (SwiftUI/UIKit), que no requiere runtime de simulador.
# Escribe resultados.tsv (curso, archivo:línea, PASS|FAIL|SKIP, detalle) y logs/<unidad>.log.
# Todas las rutas son relativas al propio kit: se puede copiar junto al repo a cualquier carpeta.

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="$KIT/build"
LOGS="$KIT/logs"
TSV="$KIT/resultados.tsv"
CURSO="ios"
FILTRO="${1:-}"
TIMEOUT_UNIDAD="${TIMEOUT_UNIDAD:-600}"

# Ajustes de un proyecto App nuevo de Xcode 26: Swift 5, Approachable Concurrency y aislamiento
# por defecto MainActor (las lecciones dependen de ello, p. ej. `nonisolated final class`).
# Se pueden sustituir exportando IOS_SWIFT_FLAGS antes de ejecutar.
IOS_SWIFT_FLAGS="${IOS_SWIFT_FLAGS--swift-version 5 -default-isolation MainActor \
-enable-upcoming-feature DisableOutwardActorInference \
-enable-upcoming-feature GlobalActorIsolatedTypesUsability \
-enable-upcoming-feature InferIsolatedConformances \
-enable-upcoming-feature InferSendableFromCaptures \
-enable-upcoming-feature NonisolatedNonsendingByDefault}"

set -m  # cada unidad en su propio grupo de procesos, para poder cortarla entera por timeout

if [ "$(uname -s)" != "Darwin" ]; then
  echo "run.sh: este kit necesita macOS con Xcode (xcrun, swift)." >&2
  exit 2
fi
command -v xcrun >/dev/null || { echo "run.sh: falta xcrun (instala Xcode)." >&2; exit 2; }

if [ -z "${SIN_EXTRAER:-}" ]; then
  python3 "$KIT/extraer.py" || echo "run.sh: extraer.py reportó errores de extracción (quedan como FAIL)." >&2
fi
[ -f "$BUILD/_unidades.txt" ] || { echo "run.sh: no hay build/; ejecuta python3 extraer.py" >&2; exit 2; }

mkdir -p "$LOGS"

# ----------------------------------------------------------------------------- entorno
ENTORNO="$LOGS/_entorno.log"
{
  echo "== $(date '+%Y-%m-%d %H:%M:%S')"
  sw_vers 2>/dev/null
  uname -m
  xcodebuild -version 2>&1
  swift --version 2>&1
  echo "SDK iphonesimulator: $(xcrun --sdk iphonesimulator --show-sdk-path 2>&1)"
  echo "SDK macosx: $(xcrun --sdk macosx --show-sdk-path 2>&1)"
  echo "IOS_SWIFT_FLAGS: $IOS_SWIFT_FLAGS"
} > "$ENTORNO" 2>&1

prueba_entorno() {
  local dir
  dir=$(mktemp -d)
  cat > "$dir/Prueba.swift" <<'EOF'
import SwiftUI
import Observation

@Observable final class Modelo { var n = 0 }
struct Vista: View {
    @State private var m = Modelo()
    var body: some View { Text("\(m.n)") }
}
#Preview { Vista() }
EOF
  # shellcheck disable=SC2086
  xcrun -sdk iphonesimulator swiftc -typecheck -target arm64-apple-ios26.0-simulator -parse-as-library \
    $1 "$dir/Prueba.swift" >> "$ENTORNO" 2>&1
  local s=$?
  rm -rf "$dir"
  return $s
}
if prueba_entorno "$IOS_SWIFT_FLAGS"; then
  echo "entorno: typecheck iOS con IOS_SWIFT_FLAGS: ok" >> "$ENTORNO"
elif prueba_entorno ""; then
  echo "AVISO: el compilador rechaza IOS_SWIFT_FLAGS; se verifica sin ellos (ver $ENTORNO)" | tee -a "$ENTORNO" >&2
  IOS_SWIFT_FLAGS=""
else
  echo "AVISO: ni un archivo SwiftUI mínimo compila para iphonesimulator: revisa $ENTORNO" | tee -a "$ENTORNO" >&2
fi
export KIT IOS_SWIFT_FLAGS

# ----------------------------------------------------------------------------- utilidades
con_timeout() {  # $1 segundos; el resto, el comando. Deja $TRABAJO/.timeout si hubo que cortarlo
  local segundos="$1" pid vigia s=0
  shift
  "$@" &
  pid=$!
  ( durmiente=""
    trap 'kill "$durmiente" 2>/dev/null; exit 0' TERM
    sleep "$segundos" & durmiente=$!
    wait "$durmiente"
    touch "$TRABAJO/.timeout"
    kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null
    sleep 5
    kill -KILL -"$pid" 2>/dev/null ) 2>/dev/null &
  vigia=$!
  disown "$vigia" 2>/dev/null  # sin avisos de control de trabajos en el log
  wait "$pid" || s=$?
  kill -TERM "$vigia" 2>/dev/null
  return "$s"
}

detalle() {  # $1 log, $2 estado; busca solo en la salida, no en la cabecera del log
  local log estado="$2" d
  log=$(mktemp)
  # solo la salida, sin códigos de color ANSI
  sed -n '/^== salida$/,$p' "$1" | sed $'s/\x1b\\[[0-9;]*[mK]//g' > "$log"
  if [ "$estado" = PASS ]; then
    d=$(grep -m1 '^OK-KIT:' "$log" | sed 's/^OK-KIT: //')
    [ -n "$d" ] || d="ok"
  else
    d=$(grep -m1 -E '^TIMEOUT:' "$log")
    [ -n "$d" ] || d=$(grep -E 'error:|Fatal error|FALLO-KIT:|No such file|command not found' "$log" \
      | grep -v -E 'SwiftCompile normal|emit-module command failed|error: Build failed|^[[:space:]]*\|' | head -1)
    [ -n "$d" ] || d=$(grep -v -e '^[[:space:]]*$' -e '^== ' "$log" | tail -1)
  fi
  rm -f "$log"
  printf '%s' "$d" | sed -e "s#$BUILD/##g" -e 's/\t/ /g' -e 's/^[[:space:]]*//' | cut -c1-300
}

# ----------------------------------------------------------------------------- unidades
printf 'curso\tarchivo:línea\testado\tdetalle\n' > "$TSV"
pass=0; fail=0
while IFS= read -r unidad; do
  [ -n "$unidad" ] || continue
  case "$unidad" in *"$FILTRO"*) ;; *) continue ;; esac
  UNIDAD="$BUILD/$unidad"
  TRABAJO="$UNIDAD/trabajo"
  log="$LOGS/$unidad.log"
  rm -rf "$TRABAJO" && mkdir -p "$TRABAJO"
  export UNIDAD TRABAJO
  {
    echo "== unidad $unidad"
    cat "$UNIDAD/origen.txt"
    echo "== pasos"
    cat "$UNIDAD/pasos.sh"
    echo "== salida"
  } > "$log"
  con_timeout "$TIMEOUT_UNIDAD" bash -c 'cd "$TRABAJO" && source "$KIT/lib.sh" && source "$UNIDAD/pasos.sh"' >> "$log" 2>&1
  s=$?
  [ -f "$TRABAJO/.timeout" ] && echo "TIMEOUT: la unidad superó ${TIMEOUT_UNIDAD}s" >> "$log"
  if [ "$s" -eq 0 ]; then estado=PASS; pass=$((pass + 1)); else estado=FAIL; fail=$((fail + 1)); fi
  echo "== estado $estado ($s)" >> "$log"
  d=$(detalle "$log" "$estado")
  case "$unidad" in *--fallo-*) d="fallo deliberado: $d" ;; esac
  printf '%-58s %s\n' "$unidad" "$estado"
  # una fila por bloque de la lección usado en la unidad
  grep "^$CURSO/" "$UNIDAD/origen.txt" | cut -f1 | awk '!visto[$0]++' | while IFS= read -r ref; do
    printf '%s\t%s\t%s\t[%s] %s\n' "$CURSO" "$ref" "$estado" "$unidad" "$d" >> "$TSV"
  done
done < "$BUILD/_unidades.txt"

# bloques SKIP (con motivo) y errores de extracción
if [ -z "$FILTRO" ]; then
  cat "$BUILD/_skips.tsv" >> "$TSV"
fi
skips=$(grep -c "	SKIP	" "$TSV")
filas_fail=$(grep -c "	FAIL	" "$TSV")
echo
echo "unidades: $pass PASS, $fail FAIL · filas FAIL: $filas_fail · bloques SKIP: $skips"
echo "resultados: $TSV · logs: $LOGS/"
[ "$filas_fail" -eq 0 ]
