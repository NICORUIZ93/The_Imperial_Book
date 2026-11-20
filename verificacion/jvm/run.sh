#!/usr/bin/env bash
# Kit JVM (specs/019): ejecuta en macOS las unidades que genera extraer.py y los laboratorios
# Maven/Gradle de examples/. Compatible con el bash 3.2 de macOS. No se detiene ante un fallo.
#
# Uso (desde cualquier carpeta):
#   bash verificacion/jvm/run.sh
# Variables opcionales:
#   FILTRO='java/modulo-5|spring-ddd'   solo ejecuta unidades cuyo id/origen/curso coincide (regex de grep -E)
#   SOLO=lecciones|labs                 limita a lecciones (incluye extractos y fallos) o a laboratorios
#   SIN_RED=1                           marca SKIP todo lo que necesita Maven/Gradle (para depurar sin internet)
#   LABS_GRADLE=0                       no corre la variante Gradle de los laboratorios
#   TIMEOUT_LECCION=300 TIMEOUT_MAVEN=900 TIMEOUT_LAB=1800   segundos por unidad
#   JDK21_HOME JDK25_HOME JDK26_HOME JDK27_HOME             fuerzan el JAVA_HOME de cada versión
#   JDKS='21 25 26 27'                  versiones a buscar
set -u

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$KIT/../.." && pwd)"
BUILD="$KIT/build"
LOGS="$KIT/logs"
TRABAJO="$KIT/trabajo"
RES="$KIT/resultados.tsv"
TIMEOUT_LECCION="${TIMEOUT_LECCION:-300}"
TIMEOUT_MAVEN="${TIMEOUT_MAVEN:-900}"
TIMEOUT_LAB="${TIMEOUT_LAB:-1800}"
FILTRO="${FILTRO:-}"
SOLO="${SOLO:-}"
SIN_RED="${SIN_RED:-0}"
LABS_GRADLE="${LABS_GRADLE:-1}"
JDKS="${JDKS:-21 25 26 27}"
PY="${PYTHON:-python3}"

trap 'echo; echo "Interrumpido."; exit 130' INT TERM

command -v "$PY" >/dev/null 2>&1 || { echo "Falta python3 (instala las Command Line Tools de Xcode)."; exit 2; }

# ---------------------------------------------------------------- JDKs
version_mayor() {  # $1 = JAVA_HOME
  "$1/bin/java" -XshowSettings:properties -version 2>&1 | sed -n 's/^ *java\.specification\.version = //p' | head -1
}

buscar_jdk() {  # $1 = versión → imprime JAVA_HOME o nada
  local n="$1" h="" cand
  eval "h=\${JDK${n}_HOME:-}"
  if [ -n "$h" ] && [ -x "$h/bin/java" ]; then echo "$h"; return; fi
  if command -v brew >/dev/null 2>&1; then
    cand="$(brew --prefix "openjdk@$n" 2>/dev/null)/libexec/openjdk.jdk/Contents/Home"
    if [ -x "$cand/bin/java" ] && [ "$(version_mayor "$cand")" = "$n" ]; then echo "$cand"; return; fi
  fi
  if [ -x /usr/libexec/java_home ]; then
    cand="$(/usr/libexec/java_home -v "$n" 2>/dev/null || true)"
    if [ -n "$cand" ] && [ -x "$cand/bin/java" ] && [ "$(version_mayor "$cand")" = "$n" ]; then echo "$cand"; return; fi
  fi
  for cand in "$HOME/Library/Java/JavaVirtualMachines"/*"$n"*/Contents/Home /Library/Java/JavaVirtualMachines/*"$n"*/Contents/Home \
              /usr/lib/jvm/java-"$n"-* /usr/lib/jvm/jdk-"$n"*; do
    if [ -x "$cand/bin/java" ] && [ "$(version_mayor "$cand")" = "$n" ]; then echo "$cand"; return; fi
  done
}

DISPONIBLES=""
RUTAS_JDK=""
for v in $JDKS; do
  h="$(buscar_jdk "$v")"
  if [ -n "$h" ]; then
    eval "JH_$v=\"\$h\""
    DISPONIBLES="$DISPONIBLES $v"
    RUTAS_JDK="${RUTAS_JDK:+$RUTAS_JDK,}$h"
    echo "JDK $v: $h"
  else
    echo "JDK $v: no encontrado"
  fi
done

elegir_jdk() {  # $1 = versión pedida → JAVA_HOME de la menor disponible >= pedida (preview exige la exacta)
  local pedida="$1" v h
  for v in $DISPONIBLES; do
    if [ "$v" -ge "$pedida" ]; then eval "h=\$JH_$v"; echo "$h"; return; fi
  done
}

# ---------------------------------------------------------------- preparación
if [ "${NO_EXTRAER:-0}" != 1 ]; then
  "$PY" "$KIT/extraer.py" || { echo "extraer.py falló"; exit 2; }
fi
[ -f "$BUILD/unidades.tsv" ] || { echo "No existe $BUILD/unidades.tsv"; exit 2; }

rm -rf "$KIT/trabajo" "$KIT/logs"
mkdir -p "$TRABAJO" "$LOGS"
printf 'curso\tarchivo:línea\tresultado\tdetalle\n' > "$RES"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "Docker: disponible (Testcontainers podrá usarlo)"
else
  echo "Aviso: Docker no responde; las pruebas con Testcontainers fallarán."
fi
command -v mvn >/dev/null 2>&1 || echo "Aviso: no se encontró mvn en el PATH."
command -v gradle >/dev/null 2>&1 || echo "Aviso: no se encontró gradle en el PATH."

export MAVEN_ARGS="${MAVEN_ARGS:--B -ntp}"
export TERM=dumb
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
export LANG="${LANG:-en_US.UTF-8}"
# Mensajes de la JVM en inglés para comparar con las lecciones aunque macOS esté en español.
export JDK_JAVA_OPTIONS="${JDK_JAVA_OPTIONS:--Duser.language=en -Duser.country=US -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8}"
export GRADLE_OPTS="${GRADLE_OPTS:--Dorg.gradle.java.installations.paths=$RUTAS_JDK -Dorg.gradle.java.installations.auto-detect=true}"
PATH_BASE="$PATH"

N_PASS=0; N_FAIL=0; N_SKIP=0

registrar() {  # curso origen resultado detalle
  local det
  det="$(printf '%s' "$4" | tr '\t\n' '  ' | cut -c1-600)"
  printf '%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$det" >> "$RES"
  case "$3" in PASS) N_PASS=$((N_PASS+1));; FAIL) N_FAIL=$((N_FAIL+1));; *) N_SKIP=$((N_SKIP+1));; esac
  printf '%-4s %-55s %s\n' "$3" "$2" "$(printf '%s' "$det" | cut -c1-110)"
}

ultimo_error() {  # log → resumen de la causa
  local r
  r="$(grep -E 'ERROR|FAILED|FAILURE|error:|Exception|Could not|TIMEOUT|cannot find symbol|BUILD FAILED|Failed' "$1" 2>/dev/null \
    | grep -v -E '^\[INFO\]|Picked up|^NOTE:' | head -3 | tr '\n' ' ' | cut -c1-400)"
  [ -n "$r" ] || r="$(grep -v -E '^#|^$|Picked up|^NOTE:' "$1" | tail -2 | tr '\n' ' ' | cut -c1-400)"
  printf '%s' "$r"
}

coincide() {  # id origen curso
  [ -z "$FILTRO" ] && return 0
  printf '%s %s %s\n' "$1" "$2" "$3" | grep -Eq -- "$FILTRO"
}

# ---------------------------------------------------------------- bucle principal
while IFS="$(printf '\t')" read -r id curso origen jdk tipo ws kinds dir skip lab cmd <&3; do
  [ "$id" = "id" ] && continue
  U="$BUILD/$dir"

  # Las lecciones comparten un espacio de trabajo por curso: siempre se copian sus archivos para conservar el estado.
  if [ "$tipo" = leccion ] || [ "$tipo" = fallo ]; then
    W="$TRABAJO/$ws"
    if [ ! -d "$W" ]; then
      mkdir -p "$W"
      ln -s "$REPO/examples" "$W/examples"
    fi
    [ -d "$U/archivos" ] && cp -R "$U/archivos/." "$W/"
  fi

  coincide "$id" "$origen" "$curso" || continue
  if [ "$SOLO" = labs ] && [ "$tipo" != lab ]; then continue; fi
  if [ "$SOLO" = lecciones ] && [ "$tipo" = lab ]; then continue; fi

  if [ "$skip" != "-" ]; then registrar "$curso" "$origen" SKIP "[$id] $skip"; continue; fi

  if [ "$tipo" = extracto ]; then
    r="$("$PY" "$KIT/extraer.py" --comparar "$U" /dev/null)"
    registrar "$curso" "$origen" "${r%%	*}" "[$id] ${r#*	}"
    continue
  fi

  if [ "$tipo" = lab ] && [ "$LABS_GRADLE" = 0 ] && [ "$kinds" = gradle ]; then
    registrar "$curso" "$origen" SKIP "[$id] variante Gradle desactivada (LABS_GRADLE=0)"; continue
  fi
  case "$kinds" in *maven*|*gradle*|script)
    if [ "$SIN_RED" = 1 ]; then registrar "$curso" "$origen" SKIP "[$id] necesita Maven/Gradle con red (SIN_RED=1)"; continue; fi;;
  esac

  JH="$(elegir_jdk "$jdk")"
  if [ -z "$JH" ]; then registrar "$curso" "$origen" SKIP "[$id] JDK $jdk no disponible en este equipo"; continue; fi
  if grep -q -- '--enable-preview' "$U/pasos.sh" 2>/dev/null; then
    eval "JH=\${JH_$jdk:-}"
    if [ -z "$JH" ]; then registrar "$curso" "$origen" SKIP "[$id] preview: requiere exactamente JDK $jdk"; continue; fi
  fi
  export JAVA_HOME="$JH"
  export PATH="$JH/bin:$PATH_BASE"
  LOG="$LOGS/$id.log"
  {
    echo "# unidad: $id"
    echo "# origen: $origen"
    echo "# JAVA_HOME: $JH"
    echo "# $(date '+%Y-%m-%d %H:%M:%S')"
  } > "$LOG"

  if [ "$tipo" = lab ]; then
    D="$REPO/$lab"
    extra=""
    case "$cmd" in *gradle*) extra=" --console=plain -Porg.gradle.java.installations.paths=$RUTAS_JDK";; esac
    echo "# comando: (cd $lab && $cmd$extra)" >> "$LOG"
    "$PY" "$KIT/extraer.py" --ejecutar "$TIMEOUT_LAB" "$LOG" "$D" -- bash -c "$cmd$extra"
    rc=$?
    if [ "$rc" = 0 ]; then
      registrar "$curso" "$origen" PASS "[$id] $cmd (JDK $jdk)"
    elif [ "$rc" = 124 ]; then
      registrar "$curso" "$origen" FAIL "[$id] timeout ${TIMEOUT_LAB}s en $cmd"
    else
      registrar "$curso" "$origen" FAIL "[$id] $cmd terminó con $rc: $(ultimo_error "$LOG")"
    fi
    continue
  fi

  T="$TIMEOUT_LECCION"
  case "$kinds" in *maven*|*gradle*) T="$TIMEOUT_MAVEN";; esac
  mkdir -p "$LOGS/$id.srv"
  export PASOS_RC="$LOGS/$id.rc" SRVDIR="$LOGS/$id.srv"
  "$PY" "$KIT/extraer.py" --ejecutar "$T" "$LOG" "$W" -- bash "$U/pasos.sh"
  rc=$?
  if [ "$rc" = 124 ]; then
    registrar "$curso" "$origen" FAIL "[$id] timeout ${T}s (log: logs/$id.log)"
    continue
  fi
  flag=""
  [ "$tipo" = fallo ] && flag="--fallo"
  r="$(PASOS_RC_FILE="$LOGS/$id.rc" "$PY" "$KIT/extraer.py" --comparar "$U" "$LOG" $flag)"
  registrar "$curso" "$origen" "${r%%	*}" "[$id] ${r#*	}"
done 3< "$BUILD/unidades.tsv"

echo
echo "PASS=$N_PASS FAIL=$N_FAIL SKIP=$N_SKIP → $RES (logs en $LOGS)"
