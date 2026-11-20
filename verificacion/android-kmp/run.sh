#!/usr/bin/env bash
# Kit android-kmp (specs/019): compila y prueba en macOS el código Kotlin/Gradle de
#   web/public/content/android/*.md, web/public/content/kotlin-multiplatform/*.md
# y de los laboratorios de examples/ que citan esos cursos.
#
# Uso:  bash run.sh                 # todo
#       SOLO='kmp-m0[0-2]' bash run.sh   # solo las unidades cuyo id cumple la regex
#       SONDA=1 bash run.sh         # repite la sonda JDK 27 + Gradle 9.8 frente a JDK 25 + Gradle 9.7
# Decisión vigente (sonda de specs/019, 2026-11-18): KMP, Android y Kotlin/JVM con JDK 25 + Gradle 9.7.
# Ningún paso lee de la terminal (stdin es /dev/null) y todo comando externo lleva timeout.
# Variables opcionales: JDK21/JDK25/JDK26/JDK27 (rutas JAVA_HOME si no se detectan solas), TIMEOUT (s por unidad, 1500), GRADLE_USER_HOME (caché compartida,
#   ~/.gradle por defecto), ANDROID_HOME, CONSERVAR=1 (no borra build/trabajo de las unidades PASS),
#   SIN_RED=1 (no resuelve versiones en Maven: usa las por defecto del extractor).
#
# Escribe resultados.tsv (curso, archivo:línea, PASS|FAIL|SKIP, detalle) y logs/<unidad>.log.
# No se detiene ante fallos. Compatible con el bash 3.2 de macOS.
set -u -o pipefail

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$KIT"
LOGS="$KIT/logs"
TRABAJO="$KIT/build/trabajo"
WRAPPERS="$KIT/build/wrappers"
ESTADO="$KIT/build/estado"
RES="$KIT/resultados.tsv"
TIMEOUT="${TIMEOUT:-1500}"
SOLO="${SOLO:-}"
SONDA="${SONDA:-0}"
exec </dev/null
export GRADLE_USER_HOME="${GRADLE_USER_HOME:-$HOME/.gradle}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

mkdir -p "$LOGS" "$TRABAJO" "$WRAPPERS" "$ESTADO"
rm -f "$ESTADO"/* 2>/dev/null || true
: > "$RES"

con_timeout() { # segundos comando... (mata el grupo de procesos al vencer; código 124)
  local t="$1"; shift
  perl -e '
    my $t = shift; my $pid = fork();
    if ($pid == 0) { setpgrp(0, 0); exec @ARGV; exit 127; }
    local $SIG{ALRM} = sub { kill "TERM", -$pid; sleep 5; kill "KILL", -$pid; exit 124; };
    alarm $t; waitpid($pid, 0); exit($? >> 8);' "$t" "$@"
}

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

fila() { # curso origen estado detalle
  local det
  det="$(printf '%s' "$4" | tr '\t\r\n' '   ' | cut -c1-900)"
  printf '%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$det" >> "$RES"
}

# ---------------------------------------------------------------- JDKs
version_java() { con_timeout 20 "$1/bin/java" -version 2>&1 | grep -m1 ' version "' | sed -E 's/.*version "([0-9]+).*/\1/'; }

jdk_home() { # $1 = versión mayor (21, 25, 26, 27)
  local v="$1" h c
  h="$(con_timeout 20 /usr/libexec/java_home -v "$v" 2>/dev/null || true)"
  if [[ -n "$h" && -x "$h/bin/java" && "$(version_java "$h")" == "$v" ]]; then echo "$h"; return 0; fi
  for c in "$(con_timeout 30 brew --prefix "openjdk@$v" 2>/dev/null)/libexec/openjdk.jdk/Contents/Home" \
           "$HOME"/Library/Java/JavaVirtualMachines/*/Contents/Home \
           /Library/Java/JavaVirtualMachines/*/Contents/Home \
           "$(con_timeout 30 brew --prefix openjdk 2>/dev/null)/libexec/openjdk.jdk/Contents/Home"; do
    if [[ -x "$c/bin/java" && "$(version_java "$c")" == "$v" ]]; then echo "$c"; return 0; fi
  done
  return 1
}

JDK21="${JDK21:-$(jdk_home 21 || true)}"
JDK25="${JDK25:-$(jdk_home 25 || true)}"
JDK26="${JDK26:-$(jdk_home 26 || true)}"
JDK27="${JDK27:-$(jdk_home 27 || true)}"
JDKS_CSV=""
for j in "$JDK21" "$JDK25" "$JDK26" "$JDK27"; do [[ -n "$j" ]] && JDKS_CSV="${JDKS_CSV:+$JDKS_CSV,}$j"; done
log "JDK 21: ${JDK21:-no encontrado}"; log "JDK 25: ${JDK25:-no encontrado}"
log "JDK 26: ${JDK26:-no encontrado}"; log "JDK 27: ${JDK27:-no encontrado}"
GRADLE_SISTEMA="$(command -v gradle || true)"
[[ -z "$GRADLE_SISTEMA" ]] && log "AVISO: no hay 'gradle' en el PATH (brew install gradle); no se pueden generar wrappers"

# ---------------------------------------------------------------- iOS
IOS_SDK=0; IOS_RUNTIME=0
if con_timeout 60 xcrun --sdk iphonesimulator --show-sdk-path >/dev/null 2>&1; then IOS_SDK=1; fi
if con_timeout 60 xcrun simctl list runtimes 2>/dev/null | grep -q '^iOS'; then IOS_RUNTIME=1; fi
log "iOS: SDK del simulador=$IOS_SDK, runtime de simulador=$IOS_RUNTIME"

# ---------------------------------------------------------------- extractor
log "extrayendo unidades de las lecciones"
if [[ "${SIN_RED:-0}" == "1" ]]; then
  con_timeout 120 python3 "$KIT/extraer.py" > "$LOGS/extraer.log" 2>&1 || { log "el extractor falló (ver logs/extraer.log)"; cat "$LOGS/extraer.log"; exit 1; }
else
  con_timeout 600 python3 "$KIT/extraer.py" --resolver > "$LOGS/extraer.log" 2>&1 || { log "el extractor falló (ver logs/extraer.log)"; cat "$LOGS/extraer.log"; exit 1; }
fi
cat "$LOGS/extraer.log"
# shellcheck disable=SC1091
. "$KIT/build/versiones.env"

# ---------------------------------------------------------------- Android SDK
SDKMANAGER=""
for c in "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "$(command -v sdkmanager || true)"; do
  [[ -n "$c" && -x "$c" ]] && { SDKMANAGER="$c"; break; }
done
for api in $(grep -rhoE 'compileSdk *= *[0-9]+' "$KIT/build/unidades" 2>/dev/null | grep -oE '[0-9]+' | sort -u); do
  if [[ ! -d "$ANDROID_HOME/platforms/android-$api" ]]; then
    if [[ -n "$SDKMANAGER" ]]; then
      log "instalando platforms;android-$api"
      yes | JAVA_HOME="${JDK25:-$JDK21}" con_timeout 900 "$SDKMANAGER" --sdk_root="$ANDROID_HOME" "platforms;android-$api" > "$LOGS/sdkmanager-$api.log" 2>&1 || log "AVISO: no se pudo instalar android-$api"
    else
      log "AVISO: falta platforms;android-$api y no hay sdkmanager"
    fi
  fi
done
if [[ -n "$SDKMANAGER" ]]; then
  yes | JAVA_HOME="${JDK25:-$JDK21}" con_timeout 300 "$SDKMANAGER" --sdk_root="$ANDROID_HOME" --licenses > "$LOGS/sdkmanager-licencias.log" 2>&1 || true
fi

# ---------------------------------------------------------------- utilidades

plantilla_wrapper() { # gradlew + gradle-wrapper.jar que ya existen en el repositorio (no dependen de la versión)
  local p
  for p in "$KIT"/../../examples/*/gradle/wrapper/gradle-wrapper.jar; do
    [[ -f "$p" && -f "$(dirname "$(dirname "$(dirname "$p")")")/gradlew" ]] && { dirname "$(dirname "$(dirname "$p")")"; return 0; }
  done
  return 1
}

wrapper_para() { # versión de Gradle -> directorio con gradlew (sin preguntar nada y con timeout)
  local v="$1" d="$WRAPPERS/$1" src
  if [[ ! -x "$d/gradlew" ]]; then
    rm -rf "$d"; mkdir -p "$d/gradle/wrapper"
    if src="$(plantilla_wrapper)"; then
      cp "$src/gradlew" "$d/gradlew"; chmod +x "$d/gradlew"
      cp "$src/gradle/wrapper/gradle-wrapper.jar" "$d/gradle/wrapper/"
      echo "wrapper $v a partir de $src" > "$LOGS/wrapper-$v.log"
    else
      [[ -z "$GRADLE_SISTEMA" ]] && return 1
      : > "$d/settings.gradle.kts"
      if ! ( cd "$d" && JAVA_HOME="${JDK25:-$JDK21}" con_timeout 300 "$GRADLE_SISTEMA" wrapper --gradle-version "$v" \
              --distribution-type bin --no-daemon --console=plain ) > "$LOGS/wrapper-$v.log" 2>&1; then
        rm -rf "$d"; return 1
      fi
    fi
    # el .properties se escribe siempre aquí: versión pedida, sin checksum de otra versión
    printf '%s\n' "distributionBase=GRADLE_USER_HOME" "distributionPath=wrapper/dists" \
      "distributionUrl=https\://services.gradle.org/distributions/gradle-$v-bin.zip" \
      "networkTimeout=60000" "validateDistributionUrl=true" "zipStoreBase=GRADLE_USER_HOME" "zipStorePath=wrapper/dists" \
      > "$d/gradle/wrapper/gradle-wrapper.properties"
  fi
  echo "$d"
}

errores_log() { # resumen de los errores de un log de Gradle
  grep -E '^e: |^> |error:|FAILED|Exception|What went wrong|not found|Could not|Unresolved|expected' "$1" 2>/dev/null \
    | grep -vE 'BUILD FAILED in|Run with --|Get more help|^> Task .* (UP-TO-DATE|NO-SOURCE|SKIPPED|FROM-CACHE)$|^> Task [^ ]+$' \
    | sed -E 's#file:///[^ ]*/build/trabajo/[^/]+/##; s#/[^ ]*/build/trabajo/[^/]+/##' | awk '!v[$0]++' | head -8 | tr '\n' ' '
}

mensaje_en_log() { # mensaje log -> 0 si (casi) todas sus palabras aparecen juntas en el log
  python3 - "$1" "$2" <<'PY'
import re, sys
msg, ruta = sys.argv[1], sys.argv[2]
log = open(ruta, encoding="utf-8", errors="replace").read().lower().split("\n")
vacias = {"the", "and", "for", "with", "was", "but", "que", "con", "del", "los", "las", "una", "has", "not", "is"}
pal = {w for w in re.findall(r"[a-záéíóúñ_]{3,}", msg.lower()) if w not in vacias}
if not pal:
    sys.exit(0)
for i in range(len(log)):
    v = " ".join(log[i:i + 4])
    if sum(1 for w in pal if w in v) / len(pal) >= 0.8:
        sys.exit(0)
sys.exit(1)
PY
}

CAUSA_AJENA='Task .* not found in|Could not resolve|Could not find [a-z]|Plugin \[id|Could not GET|Could not download|Unable to find a matching configuration|SDK location not found|No matching toolchains|Cannot find a Java installation|failed to find target with hash string'

# ejecutar_gradle dir_unidad gradle_ver jdk_home nombre tareas -> deja el log en $LOGS/nombre.log; devuelve el código
ejecutar_gradle() {
  local u="$1" gv="$2" jh="$3" nombre="$4" tareas="$5" pre="${6:-}" t="${7:-$TIMEOUT}"
  local logf="$LOGS/$nombre.log" w dest rc
  : > "$logf"
  if [[ -z "$jh" ]]; then echo "JDK no encontrado" >> "$logf"; return 91; fi
  if ! w="$(wrapper_para "$gv")"; then echo "no se pudo generar el wrapper de Gradle $gv (ver logs/wrapper-$gv.log)" >> "$logf"; return 90; fi
  dest="$TRABAJO/$nombre"
  rm -rf "$dest"; mkdir -p "$dest/gradle"
  cp -R "$u/proyecto/." "$dest/"
  cp "$w/gradlew" "$dest/"; cp -R "$w/gradle/wrapper" "$dest/gradle/"
  printf 'sdk.dir=%s\n' "$ANDROID_HOME" > "$dest/local.properties"
  local args=(--console=plain --continue --build-cache --parallel "-Dorg.gradle.java.home=$jh"
              "-Dorg.gradle.daemon.idletimeout=600000"
              "-Porg.gradle.java.installations.paths=$JDKS_CSV" "-Porg.gradle.java.installations.auto-download=false")
  {
    echo "### unidad: $(basename "$u")  gradle: $gv  jdk: $jh"
    echo "### tareas: $tareas"
  } >> "$logf"
  if [[ -n "$pre" ]]; then
    echo "### fase previa: $pre" >> "$logf"
    # shellcheck disable=SC2086
    ( cd "$dest" && JAVA_HOME="$jh" con_timeout "$t" ./gradlew "${args[@]}" $pre ) >> "$logf" 2>&1
    rc=$?
    if [[ $rc -ne 0 ]]; then echo "### la fase previa falló ($rc)" >> "$logf"; return 92; fi
    [[ -d "$u/mutacion" ]] && cp -R "$u/mutacion/." "$dest/"
    echo "### mutación aplicada" >> "$logf"
  fi
  # shellcheck disable=SC2086
  ( cd "$dest" && JAVA_HOME="$jh" con_timeout "$t" ./gradlew "${args[@]}" $tareas ) >> "$logf" 2>&1
  return $?
}

# ---------------------------------------------------------------- sonda KMP (duda abierta del curso)
KMP_JDK="$JDK25"; KMP_GRADLE="${GRADLE_LECCION:-9.7.0}"; KMP_NOTA="JDK 25 + Gradle $KMP_GRADLE (decisión de la sonda de specs/019)"
SONDA_U="$KIT/build/unidades/kmp-m00-academia"
if [[ "$SONDA" == "1" && -d "$SONDA_U" ]]; then
  # shellcheck disable=SC1091
  . "$SONDA_U/unidad.env"
  KMP_GRADLE="9.8.0"
  log "sonda: Kotlin $KOTLIN con JDK 27 + Gradle $KMP_GRADLE"
  ejecutar_gradle "$SONDA_U" "$KMP_GRADLE" "$JDK27" "sonda-jdk27-gradle$KMP_GRADLE" "$TAREAS"; rcA=$?
  log "sonda: Kotlin $KOTLIN con JDK 25 + Gradle 9.7.0"
  ejecutar_gradle "$SONDA_U" "9.7.0" "$JDK25" "sonda-jdk25-gradle9.7.0" "$TAREAS"; rcB=$?
  avisoA="$(grep -iE 'warning:.*(jvm|target|jdk|bytecode)|w: .*(JVM|target|JDK)' "$LOGS/sonda-jdk27-gradle$KMP_GRADLE.log" | head -2 | tr '\n' ' ')"
  if [[ $rcA -eq 0 ]]; then
    fila kotlin-multiplatform "$ORIGEN" PASS "[sonda] Kotlin $KOTLIN funciona con JDK 27 + Gradle $KMP_GRADLE (tareas: $TAREAS). ${avisoA:+Avisos: $avisoA}"
    if [[ $rcB -eq 0 ]]; then
      fila kotlin-multiplatform "$ORIGEN" PASS "[sonda] también funciona con JDK 25 + Gradle 9.7.0; no hace falta bajar de versión"
      SONDA_TXT="Kotlin $KOTLIN funciona con JDK 27 + Gradle $KMP_GRADLE y con JDK 25 + Gradle 9.7.0: no hace falta bajar."
    else
      fila kotlin-multiplatform "$ORIGEN" SKIP "[sonda] la alternativa JDK 25 + Gradle 9.7.0 falló (código $rcB: $(errores_log "$LOGS/sonda-jdk25-gradle9.7.0.log")); no afecta a la lección, que usa JDK 27 + Gradle $KMP_GRADLE"
      SONDA_TXT="Kotlin $KOTLIN funciona con JDK 27 + Gradle $KMP_GRADLE; la alternativa JDK 25 + Gradle 9.7.0 falló."
    fi
  else
    fila kotlin-multiplatform "$ORIGEN" FAIL "[sonda] Kotlin $KOTLIN NO funciona con JDK 27 + Gradle $KMP_GRADLE (código $rcA): $(errores_log "$LOGS/sonda-jdk27-gradle$KMP_GRADLE.log")"
    if [[ $rcB -eq 0 ]]; then
      fila kotlin-multiplatform "$ORIGEN" PASS "[sonda] con JDK 25 + Gradle 9.7.0 sí funciona: hay que bajar la lección a JDK 25 + Gradle 9.7"
      KMP_JDK="$JDK25"; KMP_GRADLE="9.7.0"; KMP_NOTA="JDK 25 + Gradle 9.7.0 (la sonda descartó JDK 27 + Gradle ${GRADLE_LECCION:-9.8.0})"
      SONDA_TXT="Kotlin $KOTLIN falla con JDK 27 + Gradle ${GRADLE_LECCION:-9.8.0} y funciona con JDK 25 + Gradle 9.7.0: hay que bajar a JDK 25 + Gradle 9.7."
    else
      fila kotlin-multiplatform "$ORIGEN" FAIL "[sonda] tampoco funciona con JDK 25 + Gradle 9.7.0 (código $rcB): $(errores_log "$LOGS/sonda-jdk25-gradle9.7.0.log")"
      SONDA_TXT="Kotlin $KOTLIN falla con ambas combinaciones; revisar logs/sonda-*.log."
    fi
  fi
  printf '%s\n' "$SONDA_TXT" > "$KIT/sonda-kmp.txt"
  log "sonda: $SONDA_TXT"
  rm -rf "$TRABAJO"/sonda-*
  KMP_JDK="$JDK25"; KMP_GRADLE="${GRADLE_LECCION:-9.7.0}"; KMP_NOTA="JDK 25 + Gradle $KMP_GRADLE (decisión de la sonda de specs/019)"
fi
log "KMP y Kotlin/JVM se verifican con $KMP_NOTA"

# ---------------------------------------------------------------- unidades
TOTAL=0; NPASS=0; NFAIL=0; NSKIP=0
# primero las unidades base y después las variantes de fallo deliberado (dependen de su base)
LISTA="$( (ls -1 "$KIT/build/unidades" | grep -v -- '--'; ls -1 "$KIT/build/unidades" | grep -- '--') )"
if [[ -n "$SOLO" ]]; then LISTA="$(printf '%s\n' $LISTA | grep -E -- "$SOLO" || true)"; fi
NUNIDADES=$(printf '%s\n' $LISTA | grep -c . || true)
for uid in $LISTA; do
  udir="$KIT/build/unidades/$uid"
  if [[ -n "$SOLO" ]] && ! [[ "$uid" =~ $SOLO ]]; then continue; fi
  # limpia variables de la unidad anterior
  UNIDAD=""; CURSO=""; ORIGEN=""; PLATAFORMA=""; TAREAS=""; TAREAS_IOS_TEST=""; TAREAS_IOS_LINK=""; IOS=0
  ESPERA=pass; MENSAJE=""; SALIDA=""; PADRE=""; GRADLE=kmp; JDK=kmp; NOTAS=""; SINTETIZADO=no; PRE_TAREAS=""
  # shellcheck disable=SC1090
  . "$udir/unidad.env"
  TOTAL=$((TOTAL + 1))
  if [[ -n "$PADRE" ]]; then
    ep="$(cat "$ESTADO/$PADRE" 2>/dev/null || echo desconocido)"
    if [[ "$ep" != "PASS" ]]; then
      fila "$CURSO" "$ORIGEN" SKIP "[$UNIDAD] fallo deliberado no comprobable: la unidad base $PADRE terminó en $ep"
      printf '[%3d/%d] %s SKIP (base %s)\n' "$TOTAL" "$NUNIDADES" "$UNIDAD" "$ep"
      echo SKIP > "$ESTADO/$UNIDAD"; NSKIP=$((NSKIP + 1)); continue
    fi
  fi
  gv="$GRADLE"; [[ "$gv" == "kmp" ]] && gv="$KMP_GRADLE"
  case "$JDK" in
    kmp) jh="$KMP_JDK" ;; 21) jh="${JDK21:-$JDK25}" ;; 25) jh="$JDK25" ;; 26) jh="$JDK26" ;; 27) jh="$JDK27" ;; *) jh="$KMP_JDK" ;;
  esac
  tareas="$TAREAS"; nota_ios=""; t="$TIMEOUT"
  if [[ "$IOS" == "1" ]]; then
    t=$((TIMEOUT + 900))
    if [[ $IOS_RUNTIME -eq 1 ]]; then tareas="$tareas $TAREAS_IOS_TEST"; nota_ios="iOS: pruebas en simulador"
    elif [[ $IOS_SDK -eq 1 ]]; then tareas="$tareas $TAREAS_IOS_LINK"; nota_ios="iOS: solo compilación (sin runtime de simulador)"
    else nota_ios="iOS no verificado: falta Xcode"; fi
  fi
  printf '[%3d/%d] %s ... ' "$TOTAL" "$NUNIDADES" "$UNIDAD"
  t0=$SECONDS
  ejecutar_gradle "$udir" "$gv" "$jh" "$UNIDAD" "$tareas" "$PRE_TAREAS" "$t"; rc=$?
  logf="$LOGS/$UNIDAD.log"
  extra="gradle $gv, JDK $( [[ -n "$jh" ]] && version_java "$jh" ); ${nota_ios:+$nota_ios; }${NOTAS:+$NOTAS; }$( [[ "$SINTETIZADO" == "sí" ]] && echo 'con piezas sintetizadas por el kit (ver origen.txt)' )"
  estado=FAIL; det=""
  if [[ "$ESPERA" == "pass" ]]; then
    if [[ $rc -eq 0 ]]; then
      if [[ -n "$SALIDA" ]] && ! grep -qF -- "$SALIDA" "$logf"; then
        det="compila pero la salida esperada «$SALIDA» no aparece"
      else
        estado=PASS; det="tareas OK: $tareas${SALIDA:+; salida «$SALIDA» comprobada}"
      fi
    elif [[ $rc -eq 124 ]]; then det="timeout de ${t}s"
    elif [[ $rc -ge 90 && $rc -le 92 ]]; then det="$(tail -1 "$logf")"
    else det="código $rc: $(errores_log "$logf")"; fi
  else
    if [[ $rc -eq 0 ]]; then
      det="el fallo deliberado prometido NO ocurre: las tareas terminan bien ($tareas)"
    elif [[ $rc -eq 124 ]]; then
      if [[ "$NOTAS" =~ indefinid|timeout ]]; then estado=PASS; det="se queda esperando como promete (timeout)"; else det="timeout de ${t}s en lugar del fallo prometido"; fi
    elif [[ $rc -ge 90 ]]; then det="$(tail -1 "$logf")"
    elif grep -qE "$CAUSA_AJENA" "$logf"; then
      det="falla, pero por otra causa (configuración/dependencias/tarea inexistente): $(errores_log "$logf")"
    elif [[ -n "$MENSAJE" ]] && ! mensaje_en_log "$MENSAJE" "$logf"; then
      det="falla como se promete, pero el mensaje prometido «$MENSAJE» no aparece en el log; real: $(errores_log "$logf")"
    else
      estado=PASS; det="falla como promete la lección${MENSAJE:+ (mensaje «$MENSAJE» encontrado)}: $(errores_log "$logf" | cut -c1-300)"
    fi
  fi
  fila "$CURSO" "$ORIGEN" "$estado" "[$UNIDAD] $det; $extra"
  echo "$estado" > "$ESTADO/$UNIDAD"
  if [[ "$estado" == "PASS" ]]; then NPASS=$((NPASS + 1)); [[ "${CONSERVAR:-0}" == "1" ]] || rm -rf "$TRABAJO/$UNIDAD"
  else NFAIL=$((NFAIL + 1)); fi
  printf '%s (%ss)\n' "$estado" "$((SECONDS - t0))"
done

# ---------------------------------------------------------------- SKIP del extractor
if [[ -z "$SOLO" ]]; then
  cat "$KIT/build/omitidos.tsv" >> "$RES"
  NSKIP=$((NSKIP + $(grep -c . "$KIT/build/omitidos.tsv")))
fi

for d in "$WRAPPERS"/*/; do [[ -x "$d/gradlew" ]] && ( cd "$d" && JAVA_HOME="${JDK25:-$JDK21}" con_timeout 60 ./gradlew --stop >/dev/null 2>&1 || true ); done

{
  echo "unidades ejecutadas: $TOTAL (PASS $NPASS, FAIL $NFAIL)"
  echo "SKIP totales (con motivo): $NSKIP"
  [[ -f "$KIT/sonda-kmp.txt" ]] && echo "sonda KMP: $(cat "$KIT/sonda-kmp.txt")"
  echo "resultados: $RES"
} | tee "$KIT/resumen.txt"
[[ $NFAIL -eq 0 ]]
