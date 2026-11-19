# shellcheck shell=bash
# Funciones que usan los pasos.sh generados por extraer.py. Las carga run.sh (bash 3.2 de macOS).
# Variables que run.sh exporta: KIT, UNIDAD (build/<unidad>), TRABAJO (copia de trabajo vacía),
# IOS_SWIFT_FLAGS (ajustes de un proyecto nuevo de Xcode 26; ver run.sh).

# Copia los archivos que la lección manda crear, en sus rutas, a la carpeta de trabajo.
copiar_archivos() {
  cp -R "$UNIDAD/archivos/." "$TRABAJO/"
}

# Comprueba que la salida ($1) contiene, seguidas, las líneas que la lección promete (esperado.txt).
contiene_salida() {
  local esperado="$UNIDAD/esperado.txt"
  [ -f "$esperado" ] || return 0
  if perl -e 'local $/; open my $a, "<", $ARGV[0] or exit 2; my $e = <$a>; open my $b, "<", $ARGV[1] or exit 2;
              my $s = <$b>; $s =~ s/\r//g; exit(index($s, $e) >= 0 ? 0 : 1)' "$esperado" "$1"; then
    return 0
  fi
  echo "FALLO-KIT: la salida no contiene lo que promete la lección:"
  sed 's/^/  esperado| /' "$esperado"
  return 1
}

# «swift run» de la lección: compila, ejecuta y compara con esperado.txt.
swift_run() {
  local s=0
  swift build || return $?
  swift run --skip-build > "$TRABAJO/.salida_run" 2>&1 || s=$?
  cat "$TRABAJO/.salida_run"
  [ "$s" -eq 0 ] || return "$s"
  contiene_salida "$TRABAJO/.salida_run"
}

swift_run_sin_comparar() {
  swift build || return $?
  swift run --skip-build
}

# Fallo deliberado: PASS solo si el comando FALLA y su salida contiene el patrón (regex extendida).
espera_fallo() {
  local patron="$1" out s=0
  shift
  out=$("$@" 2>&1) || s=$?
  printf '%s\n' "$out"
  if [ "$s" -eq 0 ]; then
    echo "FALLO-KIT: se esperaba un fallo con /$patron/ y terminó sin error"
    return 1
  fi
  if printf '%s\n' "$out" | grep -Eq -- "$patron"; then
    echo "OK-KIT: falló como promete la lección: $(printf '%s\n' "$out" | grep -E -m1 -- "$patron")"
    return 0
  fi
  echo "FALLO-KIT: falló, pero sin el error prometido /$patron/"
  return 1
}

# Fallo deliberado de comportamiento: el programa corre, pero su salida NO debe contener el patrón.
espera_salida_sin() {
  local patron="$1" out s=0
  shift
  out=$("$@" 2>&1) || s=$?
  printf '%s\n' "$out"
  if [ "$s" -ne 0 ]; then
    echo "FALLO-KIT: el programa modificado no terminó bien (estado $s)"
    return 1
  fi
  if printf '%s\n' "$out" | grep -Eq -- "$patron"; then
    echo "FALLO-KIT: la salida aún contiene /$patron/; la lección promete que desaparece"
    return 1
  fi
  echo "OK-KIT: sin /$patron/, como promete la lección"
}

_ios_archivos() {  # lista los .swift de una carpeta, uno por línea
  find "$1" -name '*.swift' -type f | LC_ALL=C sort
}

# Typecheck de un target de app (o de extensión) para el SDK de iOS Simulator; no necesita simulador.
# $1 versión de iOS, $2 nombre del módulo, $3 1 si es extensión de app.
ios_typecheck() {
  local version="$1" modulo="$2" extension="$3" f
  local archivos=() extra=()
  while IFS= read -r f; do archivos+=("$f"); done < <(_ios_archivos "$UNIDAD/archivos")
  [ "$extension" = 1 ] && extra+=(-application-extension)
  echo "+ swiftc -typecheck -target arm64-apple-ios${version}-simulator -module-name $modulo $IOS_SWIFT_FLAGS"
  # shellcheck disable=SC2086
  xcrun -sdk iphonesimulator swiftc -typecheck -target "arm64-apple-ios${version}-simulator" \
    -module-name "$modulo" -parse-as-library $IOS_SWIFT_FLAGS ${extra[@]+"${extra[@]}"} "${archivos[@]}"
}

# Target de app + target de pruebas (@testable import): emite el módulo de la app y revisa las pruebas.
ios_typecheck_tests() {
  local version="$1" modulo="$2" f plataforma toolchain
  local app=() pruebas=() plugins=()
  plataforma=$(xcrun --sdk iphonesimulator --show-sdk-platform-path)
  toolchain=$(dirname "$(dirname "$(xcrun -f swiftc)")")
  [ -d "$toolchain/lib/swift/host/plugins/testing" ] && plugins+=(-plugin-path "$toolchain/lib/swift/host/plugins/testing")
  while IFS= read -r f; do app+=("$f"); done < <(_ios_archivos "$UNIDAD/archivos")
  while IFS= read -r f; do pruebas+=("$f"); done < <(_ios_archivos "$UNIDAD/tests")
  mkdir -p "$TRABAJO/modulos"
  echo "+ swiftc -emit-module -enable-testing ($modulo) y -typecheck de ${modulo}Tests"
  # shellcheck disable=SC2086
  xcrun -sdk iphonesimulator swiftc -emit-module -enable-testing -target "arm64-apple-ios${version}-simulator" \
    -module-name "$modulo" -parse-as-library $IOS_SWIFT_FLAGS \
    -emit-module-path "$TRABAJO/modulos/$modulo.swiftmodule" "${app[@]}" || return $?
  # shellcheck disable=SC2086
  xcrun -sdk iphonesimulator swiftc -typecheck -target "arm64-apple-ios${version}-simulator" \
    -module-name "${modulo}Tests" -parse-as-library $IOS_SWIFT_FLAGS -I "$TRABAJO/modulos" \
    -F "$plataforma/Developer/Library/Frameworks" -I "$plataforma/Developer/usr/lib" \
    ${plugins[@]+"${plugins[@]}"} "${pruebas[@]}"
}

# Bloque de teoría en Swift puro: typecheck como script de macOS.
macos_script_typecheck() {
  echo "+ swiftc -typecheck $1 (macOS)"
  xcrun swiftc -typecheck "$UNIDAD/archivos/$1"
}
