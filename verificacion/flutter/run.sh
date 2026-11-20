#!/usr/bin/env bash
# Verificación Flutter/Dart en macOS (specs/015).
#
# Uso (desde cualquier carpeta):
#   bash verificacion/flutter/run.sh            # todas las unidades
#   bash verificacion/flutter/run.sh m04        # solo unidades cuyo nombre contiene «m04» (regex)
#
# Variables opcionales:
#   TIMEOUT_UNIDAD=900   segundos máximos por unidad (create + pub + analyze + test)
#   TIMEOUT_PASO=600     segundos máximos por paso (p. ej. build_runner)
#   NO_EXTRAER=1         no regenerar build/ con extraer.py
#   BUILD_WEB=1          además compila el laboratorio con `flutter build web`
#
# Por unidad: create -> copiar archivos de la lección -> pub add/get -> (build_runner, gen-l10n)
# -> analyze --no-fatal-infos -> test (si hay) -> dart run y salida prometida (si la hay).
# Escribe resultados.tsv (curso, archivo:línea, PASS|FAIL|SKIP, detalle) y logs/<unidad>.log.
# No se detiene ante fallos. Compatible con el bash 3.2 de macOS.

set -u -o pipefail

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="$KIT/build"
LOGS="$KIT/logs"
RES="$KIT/resultados.tsv"
FILTRO="${1:-}"
TIMEOUT_UNIDAD="${TIMEOUT_UNIDAD:-900}"
TIMEOUT_PASO="${TIMEOUT_PASO:-600}"
TAB=$'\t'

for herramienta in flutter dart python3 perl pkill mktemp; do
  if ! command -v "$herramienta" >/dev/null 2>&1; then
    echo "Falta '$herramienta' en el PATH." >&2
    exit 2
  fi
done

mkdir -p "$LOGS"
rm -f "$LOGS"/*.log

if [ -z "${NO_EXTRAER:-}" ] || [ ! -f "$BUILD/unidades.txt" ]; then
  python3 "$KIT/extraer.py" | tee "$LOGS/extraer.txt" || { echo "extraer.py falló" >&2; exit 2; }
fi

echo "== Versiones (antes de todo) =="
{ flutter --version; dart --version; } 2>&1 | tee "$LOGS/flutter-version.txt"
FLUTTER_VER="$(flutter --version 2>/dev/null | head -1)"

# Caché de pub compartida por todas las unidades (la de siempre, ~/.pub-cache, salvo que
# PUB_CACHE diga otra). Cada `pub get` intenta primero --offline y solo descarga lo que falte.
export PUB_CACHE="${PUB_CACHE:-$HOME/.pub-cache}"
export FLUTTER_SUPPRESS_ANALYTICS=true
export CI=true
flutter config --no-analytics >/dev/null 2>&1 || true
dart --disable-analytics >/dev/null 2>&1 || true

printf 'curso\tarchivo:línea\testado\tdetalle\n' > "$RES"

# limite SEGUNDOS cmd...  -> ejecuta el comando en su propio grupo de procesos, sin stdin, y lo
# mata (TERM y luego KILL a todo el grupo) al vencer el plazo; devuelve 124 en ese caso.
# El vigía es un proceso aparte: no depende de que el comando colaborador termine ni de señales
# entregadas a un proceso bloqueado en waitpid.
limite() {
  local seg="$1"; shift
  local marca
  marca="$(mktemp "${TMPDIR:-/tmp}/limite.XXXXXX")"
  rm -f "$marca"
  perl -e 'setpgrp(0, 0); exec @ARGV or exit 127;' "$@" </dev/null &
  local pid=$!
  (
    sleep "$seg"
    if kill -0 "$pid" 2>/dev/null; then
      : >"$marca"
      kill -TERM -"$pid" 2>/dev/null
      sleep 5
      kill -KILL -"$pid" 2>/dev/null
    fi
  ) </dev/null >/dev/null 2>&1 &
  local vigia=$!
  wait "$pid"
  local rc=$?
  pkill -P "$vigia" 2>/dev/null
  kill "$vigia" 2>/dev/null
  wait "$vigia" 2>/dev/null
  if [ -f "$marca" ]; then
    rm -f "$marca"
    rc=124
  fi
  return "$rc"
}

# paso NOMBRE cmd...  (usa PROY, LOG, DEADLINE; deja la salida del paso en $PASO_LOG)
# Cada paso tiene su propio límite: TIMEOUT_PASO o lo que quede de la unidad, lo que sea menor.
paso() {
  local nombre="$1"; shift
  local resta=$(( DEADLINE - SECONDS ))
  [ "$resta" -gt "$TIMEOUT_PASO" ] && resta="$TIMEOUT_PASO"
  [ "$resta" -lt 5 ] && resta=5
  PASO_LOG="$UDIR/_paso-$nombre.log"
  printf '%s ' "$nombre" >&2   # progreso en consola: en qué paso va la unidad
  echo "### [$nombre] (límite ${resta}s) \$ $*" >>"$LOG"   # visible en el log mientras corre
  ( cd "$PROY" && limite "$resta" "$@" ) >"$PASO_LOG" 2>&1 </dev/null
  local rc=$?
  [ "$rc" -eq 124 ] && echo "TIMEOUT tras ${resta}s" >>"$PASO_LOG"
  { cat "$PASO_LOG"; echo "### rc=$rc"; echo; } >>"$LOG"
  return "$rc"
}

# resumen de un log de paso fallido, en una línea
resumen() {
  local f="$1" s
  if grep -q '^TIMEOUT tras' "$f"; then grep -m1 '^TIMEOUT tras' "$f"; return; fi
  s="$(grep -E '^[[:space:]]*(error|warning)[[:space:]]+(-|•)' "$f" | head -3 | sed -E 's/^[[:space:]]+//' | tr '\n' '|')"
  [ -z "$s" ] && s="$(grep -E 'Expected:|Actual:|Error:|Exception|FAILED|Could not|Because |not found|No such' "$f" | head -3 | sed -E 's/^[[:space:]]+//' | tr '\n' '|')"
  [ -z "$s" ] && s="$(grep -v '^[[:space:]]*$' "$f" | tail -2 | tr '\n' '|')"
  printf '%s' "$s" | tr '\t' ' ' | cut -c1-400
}

# escribe una fila por cada bloque de origen.txt
filas() {
  local estado="$1" detalle="$2" o ruta curso arch
  while IFS="$TAB" read -r o ruta; do
    [ -z "$o" ] && continue
    curso="${o%%/*}"; arch="${o#*/}"
    [ "$curso" = "examples" ] && curso="laboratorio"
    printf '%s\t%s\t%s\t%s\n' "$curso" "$arch" "$estado" "$detalle [$UNIDAD]" >>"$RES"
  done <"$UDIR/origen.txt"
}

# ¿Aparecen las líneas de esperado.txt, en orden, en la salida?
salida_coincide() {
  python3 - "$1" "$2" <<'PY'
import sys
esperado = [l.strip() for l in open(sys.argv[1], encoding="utf-8") if l.strip()]
salida = [l.strip() for l in open(sys.argv[2], encoding="utf-8", errors="replace")]
i = 0
for l in salida:
    if i < len(esperado) and esperado[i] in l:
        i += 1
if i < len(esperado):
    print("falta en la salida: " + esperado[i])
    sys.exit(1)
PY
}

agrega_generate() {
  python3 - "$1" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
if not re.search(r"^\s+generate:\s*true", s, re.M):
    if re.search(r"^flutter:\s*$", s, re.M):
        s = re.sub(r"^flutter:\s*$", "flutter:\n  generate: true", s, count=1, flags=re.M)
    else:
        s += "\nflutter:\n  generate: true\n"
open(p, "w", encoding="utf-8").write(s)
PY
}

procesar() {
  UDIR="$1"
  UNIDAD="$(basename "$UDIR")"
  LOG="$LOGS/$UNIDAD.log"
  DEADLINE=$(( SECONDS + TIMEOUT_UNIDAD ))
  CURSO="" TIPO="flutter" PLANTILLA="app" PROYECTO="" EJECUTAR="" ESPERA_FALLO="" PATRON_FALLO=""
  GENERATE="" BUILD_RUNNER="" COMPLETO="" NOTA="" ARGS_TEST=""
  # shellcheck disable=SC1091
  . "$UDIR/unidad.env"
  : >"$LOG"
  echo "# unidad $UNIDAD ($TIPO/$PLANTILLA, paquete $PROYECTO) — $FLUTTER_VER" >>"$LOG"
  [ -n "$NOTA" ] && echo "# nota: $NOTA" >>"$LOG"
  cat "$UDIR/origen.txt" >>"$LOG"

  local trabajo="$UDIR/proyecto" herr="flutter" notas="" estado="" detalle=""
  [ "$TIPO" = "dart" ] && herr="dart"
  rm -rf "$trabajo"; mkdir -p "$trabajo"
  PROY="$trabajo"

  # 1. Proyecto base
  if [ -n "$COMPLETO" ]; then
    mkdir -p "$trabajo/$PROYECTO"
    cp -R "$UDIR/archivos/." "$trabajo/$PROYECTO/"
  elif [ "$TIPO" = "dart" ]; then
    if ! paso create dart create --no-pub -t "$PLANTILLA" "$PROYECTO"; then
      filas FAIL "dart create -t $PLANTILLA falló: $(resumen "$PASO_LOG")"; return
    fi
  elif [ "$PLANTILLA" = "app" ]; then
    if ! paso create flutter create --no-pub --empty --project-name "$PROYECTO" "$PROYECTO"; then
      filas FAIL "flutter create falló: $(resumen "$PASO_LOG")"; return
    fi
  else
    if ! paso create flutter create --no-pub -t "$PLANTILLA" --project-name "$PROYECTO" "$PROYECTO"; then
      filas FAIL "flutter create -t $PLANTILLA falló: $(resumen "$PASO_LOG")"; return
    fi
  fi
  PROY="$trabajo/$PROYECTO"
  if [ -z "$COMPLETO" ]; then
    # La prueba de ejemplo de la plantilla prueba código de la plantilla, no de la lección.
    if [ "$TIPO" = "flutter" ] && [ -f "$PROY/test/widget_test.dart" ] \
        && [ ! -f "$UDIR/archivos/test/widget_test.dart" ]; then
      rm -f "$PROY/test/widget_test.dart"
      echo "# se quitó test/widget_test.dart de la plantilla" >>"$LOG"
    fi
    cp -R "$UDIR/archivos/." "$PROY/"
  fi
  [ -n "$GENERATE" ] && agrega_generate "$PROY/pubspec.yaml"

  # 2. Dependencias: las que la lección añade con `pub add`, luego las implícitas (se anotan).
  local lista linea
  for lista in dependencias implicitas; do
    [ -s "$UDIR/$lista.txt" ] || continue
    while IFS= read -r linea || [ -n "$linea" ]; do
      [ -z "$linea" ] && continue
      local args=()
      IFS="$TAB" read -r -a args <<<"$linea"
      if ! paso pub_add "$herr" pub add --offline "${args[@]}"; then
        if ! paso pub_add "$herr" pub add "${args[@]}"; then
          filas FAIL "pub add ${args[*]} falló: $(resumen "$PASO_LOG")"; return
        fi
      fi
      [ "$lista" = implicitas ] && notas="$notas; dependencia implícita ${args[*]} (la lección no la añade)"
    done <"$UDIR/$lista.txt"
  done

  if ! paso pub_get "$herr" pub get --offline; then
    if ! paso pub_get "$herr" pub get; then
      filas FAIL "pub get falló: $(resumen "$PASO_LOG")"; return
    fi
  fi

  # 3. Generación de código
  if [ -n "$BUILD_RUNNER" ]; then
    if ! paso build_runner dart run build_runner build --delete-conflicting-outputs; then
      filas FAIL "build_runner falló: $(resumen "$PASO_LOG")"; return
    fi
  fi
  if [ "$TIPO" = "flutter" ] && [ -f "$PROY/l10n.yaml" ]; then
    if ! paso gen_l10n flutter gen-l10n; then
      filas FAIL "flutter gen-l10n falló: $(resumen "$PASO_LOG")"; return
    fi
  fi

  # 4. Análisis estático
  local rc
  if [ "$herr" = "flutter" ]; then
    paso analyze flutter analyze --no-fatal-infos; rc=$?
  else
    # `dart analyze` no acepta --no-fatal-infos: los infos ya no son fatales por defecto.
    paso analyze dart analyze; rc=$?
  fi
  if [ "$ESPERA_FALLO" = "analyze" ]; then
    if [ "$rc" -ne 0 ] && grep -Eq "$PATRON_FALLO" "$PASO_LOG"; then
      filas PASS "fallo deliberado reproducido en analyze: $(resumen "$PASO_LOG")"
    elif [ "$rc" -ne 0 ]; then
      filas FAIL "analyze falló pero sin el error prometido (/$PATRON_FALLO/): $(resumen "$PASO_LOG")"
    else
      filas FAIL "el fallo deliberado no se produjo: analyze pasó"
    fi
    return
  fi
  if [ "$rc" -ne 0 ]; then
    filas FAIL "analyze: $(resumen "$PASO_LOG")$notas"; return
  fi

  # 5. Pruebas (test/ en la VM local; integration_test/ necesita dispositivo y solo se analiza)
  local hay_tests=""
  if [ -d "$PROY/test" ] && [ -n "$(find "$PROY/test" -name '*_test.dart' -print -quit)" ]; then
    hay_tests=1
    # ARGS_TEST: opciones que la lección pasa a `flutter test` (p. ej. --dart-define-from-file).
    local args_test=()
    [ -n "$ARGS_TEST" ] && IFS="$TAB" read -r -a args_test <<<"$ARGS_TEST"
    if [ "$herr" = "flutter" ]; then
      paso test flutter test ${args_test[@]+"${args_test[@]}"}; rc=$?
    else
      paso test dart test ${args_test[@]+"${args_test[@]}"}; rc=$?
    fi
    if [ "$ESPERA_FALLO" = "test" ]; then
      if [ "$rc" -ne 0 ] && grep -Eq "$PATRON_FALLO" "$PASO_LOG"; then
        filas PASS "fallo deliberado reproducido en test: $(resumen "$PASO_LOG")"
      elif [ "$rc" -ne 0 ]; then
        filas FAIL "test falló pero sin el error prometido (/$PATRON_FALLO/): $(resumen "$PASO_LOG")"
      else
        filas FAIL "el fallo deliberado no se produjo: las pruebas pasaron"
      fi
      return
    fi
    if [ "$rc" -ne 0 ]; then
      filas FAIL "test: $(resumen "$PASO_LOG")$notas"; return
    fi
  elif [ "$ESPERA_FALLO" = "test" ]; then
    filas FAIL "se esperaba un fallo en test pero la unidad no tiene pruebas"; return
  fi

  # 6. Ejecución con salida prometida
  local ejecutado=""
  if [ -n "$EJECUTAR" ] && [ -f "$PROY/$EJECUTAR" ]; then
    paso run dart run "$EJECUTAR"; rc=$?
    if [ "$rc" -ne 0 ]; then
      filas FAIL "dart run $EJECUTAR: $(resumen "$PASO_LOG")$notas"; return
    fi
    if [ -f "$UDIR/esperado.txt" ]; then
      local dif
      if ! dif="$(salida_coincide "$UDIR/esperado.txt" "$PASO_LOG")"; then
        filas FAIL "dart run $EJECUTAR: $dif$notas"; return
      fi
    fi
    ejecutado=", dart run con la salida prometida"
  fi

  # 7. Build web opcional del laboratorio
  if [ -n "$COMPLETO" ] && [ -n "${BUILD_WEB:-}" ]; then
    paso create_web flutter create --no-pub --platforms=web . >/dev/null 2>&1 || true
    if ! paso build_web flutter build web; then
      filas FAIL "flutter build web: $(resumen "$PASO_LOG")"; return
    fi
    ejecutado="$ejecutado, flutter build web"
  fi

  detalle="analyze sin errores"
  [ -n "$hay_tests" ] && detalle="$detalle, flutter/dart test pasa"
  filas PASS "$detalle$ejecutado$notas"
}

total=0
while IFS= read -r unidad; do
  [ -z "$unidad" ] && continue
  if [ -n "$FILTRO" ] && ! printf '%s' "$unidad" | grep -Eq "$FILTRO"; then
    continue
  fi
  total=$(( total + 1 ))
  inicio=$SECONDS
  printf '[%3d] %-60s ' "$total" "$unidad"
  procesar "$BUILD/$unidad"
  ultimo="$(tail -1 "$RES" | cut -f3)"
  echo "$ultimo ($(( SECONDS - inicio ))s)"
done <"$BUILD/unidades.txt"

# Bloques omitidos (fragmentos, extractos y fallos no automatizables) con su motivo.
if [ -z "$FILTRO" ]; then
  cat "$BUILD/omitidos.tsv" >>"$RES"
fi

echo
echo "== Resumen ($FLUTTER_VER) =="
for e in PASS FAIL SKIP; do
  printf '%s\t%s filas\n' "$e" "$(grep -c "${TAB}${e}${TAB}" "$RES")"
done
echo "Resultados: $RES"
echo "Logs:       $LOGS/"
if grep -q "${TAB}FAIL${TAB}" "$RES"; then
  exit 1
fi
exit 0
