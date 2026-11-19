#!/usr/bin/env bash
# Kit de verificación Cloud/DevOps (specs/015) — se ejecuta en el Mac del dueño (macOS, Docker Desktop).
#
#   cd ~/Downloads/imperial-verificacion/repo/verificacion/cloud-devops && ./run.sh
#   ./run.sh cloud/modulo-3          # solo las unidades cuyo origen contiene ese texto (expresión de grep -E)
#
# Variables opcionales:
#   INSTALAR=0          no instala floci-cli si falta (por defecto: fórmula de Homebrew o script oficial)
#   (gcloud y az, si no están instalados, corren desde sus imágenes oficiales con docker run; nada pide entrada)
#   LIMITE_INSTALACION=N  segundos máximos por cada brew install (por defecto 600)
#   INSTALAR_EXTRA=1    instala con Homebrew otras herramientas que pida una lección (helm, psql, redis…)
#   TIMEOUT_TEMA=N      segundos por unidad (por defecto 900; 1500 con kind/Terraform)
#   MANTENER_FLOCI=1    no detiene al final los contenedores de Floci que levantó el kit
#
# Qué hace: regenera build/ con extraer.py, levanta Floci con el docker-compose.yml de la raíz del repo
# una sola vez, ejecuta cada unidad (tema/laboratorio) en su propia carpeta con timeout, limpia lo que la
# unidad creó (procesos, contenedores, redes, volúmenes; clústeres kind al cerrar cada módulo) y sigue
# aunque haya fallos. Escribe resultados.tsv (curso, archivo:línea, PASS|FAIL|SKIP, detalle) y logs/.
# Aislamiento: HOME, KUBECONFIG, config de Docker/AWS/gcloud/az/git y paquetes pip/npm viven en estado/;
# no se modifican ~/.aws, ~/.kube, ~/.docker ni el Python del sistema.

set -u
KIT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$KIT_DIR/../.." && pwd)"
COMPOSE_RAIZ_ARCHIVO="$REPO_DIR/docker-compose.yml"
FILTRO="${1:-}"
INSTALAR="${INSTALAR:-1}"
INSTALAR_EXTRA="${INSTALAR_EXTRA:-0}"
RESULTADOS="$KIT_DIR/resultados.tsv"
LOGS="$KIT_DIR/logs"
EJEC="$KIT_DIR/ejecucion"
ESTADO="$KIT_DIR/estado"
REAL_HOME="$HOME"
cd "$KIT_DIR" || exit 1

aviso() { printf '%s\n' "[kit] $*" >&2; }
una_linea() { tr '\t\n' '  ' | sed 's/  */ /g' | cut -c1-400; }

# ------------------------------------------------------------------ requisitos
if ! docker info > /dev/null 2>&1; then
  aviso "Docker no responde. Abre Docker Desktop y vuelve a ejecutar ./run.sh"
  exit 1
fi
command -v python3 > /dev/null || { aviso "falta python3"; exit 1; }
DOCKER_HOST_REAL="${DOCKER_HOST:-$(docker context inspect --format '{{.Endpoints.docker.Host}}' 2>/dev/null)}"
[ -n "$DOCKER_HOST_REAL" ] || DOCKER_HOST_REAL="unix:///var/run/docker.sock"

python3 "$KIT_DIR/extraer.py" || { aviso "extraer.py falló"; exit 1; }

# Ninguna instalación puede quedarse esperando: stdin cerrado, sin preguntas y con límite de tiempo.
con_limite() { # con_limite SEGUNDOS COMANDO... — corta todo el grupo de procesos si se pasa
  local t=$1 p w rc
  shift
  set -m
  "$@" < /dev/null &
  p=$!
  ( sleep "$t"; kill -0 "$p" 2>/dev/null || exit 0; echo "[kit] límite de ${t}s: se corta «$*»" >&2
    kill -s TERM -- "-$p" 2>/dev/null; sleep 5; kill -s KILL -- "-$p" 2>/dev/null ) &
  w=$!
  set +m
  wait "$p"; rc=$?
  kill -s TERM -- "-$w" > /dev/null 2>&1; wait "$w" 2>/dev/null
  return $rc
}
export NONINTERACTIVE=1 HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_ENV_HINTS=1 CLOUDSDK_CORE_DISABLE_PROMPTS=1
brew_instalar() { # brew_instalar FORMULA — solo fórmulas (un cask puede pedir contraseña)
  command -v brew > /dev/null || return 1
  aviso "brew install $* (máx. ${LIMITE_INSTALACION:-600}s; log en logs/)"
  con_limite "${LIMITE_INSTALACION:-600}" brew install "$@" > "$LOGS/brew-$(echo "$1" | tr '/' '_').log" 2>&1
}

rm -rf "$LOGS" "$EJEC"
mkdir -p "$LOGS" "$EJEC" "$ESTADO/bin"
PATH="$ESTADO/bin:$PATH"
rm -f "$ESTADO/bin/gcloud" "$ESTADO/bin/az"

# CLI en Docker: imagen oficial, sin instalador. «localhost» de la lección se traduce a host.docker.internal
# (el emulador corre en el Mac) y la carpeta actual se monta en la misma ruta.
cli_en_docker() { # cli_en_docker NOMBRE IMAGEN PATRON_DE_VARIABLES VAR_DE_CONFIG SUBCARPETA
  cat > "$ESTADO/bin/$1" <<EOF
#!/usr/bin/env bash
# $1 del kit cloud-devops: imagen oficial $2 con docker run (generado por run.sh).
loc() { printf '%s' "\$1" | sed -e 's#localhost#host.docker.internal#g' -e 's#127\\.0\\.0\\.1#host.docker.internal#g'; }
args=()
for a in "\$@"; do args+=("\$(loc "\$a")"); done
envs=(-e "$4=/kit-config/$5")
while IFS='=' read -r k v; do
  case "\$k" in $4) ;; $3) envs+=(-e "\$k=\$(loc "\$v")") ;; esac
done < <(env)
mkdir -p "\$HOME/.config/$5"
exec docker run --rm -i "\${envs[@]}" -v "\$HOME/.config:/kit-config" -v "\$PWD:\$PWD" -w "\$PWD" \\
  --add-host host.docker.internal:host-gateway "$2" $1 "\${args[@]}"
EOF
  chmod +x "$ESTADO/bin/$1"
}
IMG_GCLOUD="${IMG_GCLOUD:-gcr.io/google.com/cloudsdktool/google-cloud-cli:slim}"
IMG_AZ="${IMG_AZ:-mcr.microsoft.com/azure-cli}"
if ! command -v gcloud > /dev/null; then
  aviso "gcloud: docker pull $IMG_GCLOUD (máx. 900s)"
  if con_limite 900 docker pull "$IMG_GCLOUD" > "$LOGS/pull-gcloud.log" 2>&1; then
    cli_en_docker gcloud "$IMG_GCLOUD" 'CLOUDSDK_*|PUBSUB_*|STORAGE_EMULATOR_HOST|GOOGLE_*' CLOUDSDK_CONFIG gcloud
  else aviso "no se pudo descargar $IMG_GCLOUD: las unidades con gcloud quedarán en SKIP"; fi
fi
if ! command -v az > /dev/null; then
  aviso "az: docker pull $IMG_AZ (máx. 900s)"
  if con_limite 900 docker pull "$IMG_AZ" > "$LOGS/pull-az.log" 2>&1; then
    cli_en_docker az "$IMG_AZ" 'AZURE_*' AZURE_CONFIG_DIR azure
  else aviso "no se pudo descargar $IMG_AZ: las unidades con az quedarán en SKIP"; fi
fi
if [ "$INSTALAR" = 1 ] && ! command -v floci > /dev/null; then
  # Instalación oficial (github.com/floci-io/floci-cli): fórmula de Homebrew o el script de floci.io.
  brew_instalar floci-io/floci/floci || { aviso "instalando floci-cli con https://floci.io/install.sh (máx. 300s)"
    con_limite 300 sh -c 'curl -fsSL https://floci.io/install.sh | sh' > "$LOGS/floci-install.log" 2>&1; }
  for d in "$REAL_HOME/.floci/bin" "$REAL_HOME/.local/bin" /usr/local/bin /opt/homebrew/bin; do
    [ -x "$d/floci" ] && PATH="$PATH:$d"
  done
fi

# ------------------------------------------------------------------ entorno aislado
H="$ESTADO/home"
mkdir -p "$H/.kube" "$ESTADO/docker" "$ESTADO/npm-global" "$ESTADO/tf-cache"
# Docker: mismo daemon, configuración propia (los docker login del kit no tocan ~/.docker ni el llavero).
PLUGINS='"/Applications/Docker.app/Contents/Resources/cli-plugins", "/usr/local/lib/docker/cli-plugins", "/opt/homebrew/lib/docker/cli-plugins"'
[ -d "$REAL_HOME/.docker/cli-plugins" ] && PLUGINS="\"$REAL_HOME/.docker/cli-plugins\", $PLUGINS"
printf '{ "auths": {}, "cliPluginsExtraDirs": [ %s ] }\n' "$PLUGINS" > "$ESTADO/docker/config.json"
[ -d "$ESTADO/venv" ] || python3 -m venv "$ESTADO/venv" > /dev/null 2>&1 < /dev/null || aviso "no se pudo crear el venv"
cat > "$H/.gitconfig" <<'EOF'
[user]
	name = Verificacion Kit
	email = kit@example.invalid
[init]
	defaultBranch = main
[advice]
	detachedHead = false
EOF

entorno_unidad() { # exporta el entorno que hereda pasos.sh
  export HOME="$H"
  export DOCKER_CONFIG="$ESTADO/docker" DOCKER_HOST="$DOCKER_HOST_REAL"
  export KUBECONFIG="$H/.kube/config"
  export MINIKUBE_HOME="$H/.minikube"
  # Floci ya iniciado y `eval $(floci env)` cargado, como asumen las lecciones desde el Módulo 1.
  export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1 AWS_REGION=us-east-1
  export AWS_ENDPOINT_URL=http://localhost:4566 AWS_PAGER=""
  export CLOUDSDK_CORE_DISABLE_PROMPTS=1 CLOUDSDK_CORE_PROJECT=floci-local CLOUDSDK_AUTH_ACCESS_TOKEN=floci
  export AZURE_CORE_COLLECT_TELEMETRY=no
  export NPM_CONFIG_PREFIX="$ESTADO/npm-global" NPM_CONFIG_UPDATE_NOTIFIER=false NPM_CONFIG_FUND=false
  export PIP_DISABLE_PIP_VERSION_CHECK=1 TF_PLUGIN_CACHE_DIR="$ESTADO/tf-cache" CHECKPOINT_DISABLE=1
  export VIRTUAL_ENV="$ESTADO/venv"
  export PATH="$ESTADO/venv/bin:$ESTADO/npm-global/bin:$ESTADO/bin:$PATH"
  export TERM=dumb NO_COLOR=1
}

# ------------------------------------------------------------------ Floci
dc() { docker compose -f "$COMPOSE_RAIZ_ARCHIVO" "$@"; }
corriendo() { [ -n "$(docker ps -q -f "name=^$1\$")" ]; }
esperar_puerto() { # esperar_puerto PUERTO SEGUNDOS
  local i=0
  while [ "$i" -lt "$2" ]; do
    [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$1/" 2>/dev/null)" != "000" ] && return 0
    sleep 1; i=$((i + 1))
  done
  return 1
}
PREVIOS_FLOCI=""
for c in floci-aws floci-azure floci-gcp floci-stackport floci; do corriendo "$c" && PREVIOS_FLOCI="$PREVIOS_FLOCI $c"; done
floci_cli_parar() { # libera el 4566 si el contenedor de floci-cli está corriendo (no lo borra)
  corriendo floci || return 0
  (export HOME="$H"; floci stop > /dev/null 2>&1) || docker stop floci > /dev/null 2>&1
}
compose_arriba() { # compose_arriba SERVICIOS...
  local s c faltan=""
  for s in "$@"; do
    case $s in aws-local) c=floci-aws ;; azure-local) c=floci-azure ;; gcp-local) c=floci-gcp ;; *) c=floci-$s ;; esac
    corriendo "$c" || faltan="$faltan $s"
  done
  [ -z "$faltan" ] && return 0
  con_limite 900 docker compose -f "$COMPOSE_RAIZ_ARCHIVO" up -d $faltan >> "$LOGS/floci-compose.log" 2>&1
  case " $faltan " in *" aws-local "*) esperar_puerto 4566 "${ESPERA_FLOCI:-90}" || aviso "Floci AWS no respondió en 4566" ;; esac
  case " $faltan " in *" azure-local "*) esperar_puerto 4577 "${ESPERA_FLOCI:-90}" || aviso "Floci Azure no respondió en 4577" ;; esac
  case " $faltan " in *" gcp-local "*) esperar_puerto 4588 "${ESPERA_FLOCI:-90}" || aviso "Floci GCP no respondió en 4588" ;; esac
}
aviso "levantando Floci con $COMPOSE_RAIZ_ARCHIVO"
floci_cli_parar
compose_arriba aws-local azure-local gcp-local

preparar_floci() { # según meta FLOCI de la unidad
  local propio_start=0
  grep -qE '(^|[[:space:];&|])floci[[:space:]]+start' "$UNIDAD"/bloques/*.sh 2>/dev/null && propio_start=1
  [ "$USA_AZ" = 1 ] && compose_arriba azure-local
  [ "$USA_GCP" = 1 ] && compose_arriba gcp-local
  case "$FLOCI" in
    compose)
      floci_cli_parar
      compose_arriba aws-local
      ;;
    cli) # el módulo usa floci-cli (`floci start`): libera el 4566 del compose
      corriendo floci-aws && dc stop aws-local stackport >> "$LOGS/floci-compose.log" 2>&1
      if [ "$propio_start" = 1 ]; then
        # La lección arranca Floci desde una carpeta nueva: se le da el arranque limpio que espera.
        corriendo floci && (export HOME="$H"; floci stop > /dev/null 2>&1)
      elif ! corriendo floci; then
        (export HOME="$H"; con_limite 600 floci start > "$LOGS/floci-cli-start.log" 2>&1) || aviso "floci start falló (ver logs/floci-cli-start.log)"
      fi
      ;;
    propio) # la lección arranca su propio Floci en el 4566
      floci_cli_parar
      corriendo floci-aws && dc stop aws-local stackport >> "$LOGS/floci-compose.log" 2>&1
      ;;
  esac
}

# ------------------------------------------------------------------ herramientas por unidad
formula_de() {
  case $1 in
    tofu) echo opentofu ;; psql) echo libpq ;; redis-cli) echo redis ;; valkey-cli) echo valkey ;;
    promtool) echo prometheus ;; amtool) echo alertmanager ;; envsubst) echo gettext ;;
    java) echo openjdk ;; mvn) echo maven ;; vault) echo hashicorp/tap/vault ;; packer) echo hashicorp/tap/packer ;;
    bun) echo oven-sh/bun/bun ;; kubectl-argo-rollouts) echo argoproj/tap/kubectl-argo-rollouts ;;
    pytest|checkov) echo "pip:$1" ;; python|pip|pip3) echo "venv" ;;
    *) echo "$1" ;;
  esac
}
herramienta_lista() {
  command -v "$1" > /dev/null 2>&1 && return 0
  case $1 in psql) [ -x /opt/homebrew/opt/libpq/bin/psql ] && PATH="$PATH:/opt/homebrew/opt/libpq/bin" && return 0 ;; esac
  return 1
}
faltantes() {
  local t f falta=""
  for t in $HERRAMIENTAS; do
    herramienta_lista "$t" && continue
    if [ "$INSTALAR_EXTRA" = 1 ]; then
      f=$(formula_de "$t")
      case $f in
        venv) ;;
        pip:*) con_limite 600 "$ESTADO/venv/bin/pip" install -q "${f#pip:}" >> "$LOGS/pip-extra.log" 2>&1 ;;
        *) brew_instalar "$f" ;;
      esac
      herramienta_lista "$t" && continue
    fi
    falta="$falta $t"
  done
  echo "$falta" | sed 's/^ //'
}

# ------------------------------------------------------------------ limpieza
KIND_INICIAL="$(kind get clusters 2>/dev/null | tr '\n' ' ')"
foto_docker() {
  docker ps -aq --no-trunc | sort > "$1.ctr"
  docker network ls -q --no-trunc | sort > "$1.net"
  docker volume ls -q | sort > "$1.vol"
}
limpiar_docker() { # limpiar_docker FOTO_ANTES — borra solo lo que creó la unidad
  local id nombre
  for id in $(docker ps -aq --no-trunc | sort | comm -13 "$1.ctr" -); do
    nombre=$(docker inspect -f '{{.Name}}' "$id" 2>/dev/null | sed 's|^/||')
    case "$nombre" in floci|floci-aws|floci-azure|floci-gcp|floci-stackport) continue ;; esac
    # nodos de kind/minikube: se conservan hasta cerrar el módulo (temas siguientes usan el clúster)
    docker inspect -f '{{index .Config.Labels "io.x-k8s.kind.cluster"}}{{index .Config.Labels "name.minikube.sigs.k8s.io"}}' "$id" 2>/dev/null | grep -q . && continue
    docker rm -f -v "$id" > /dev/null 2>&1
  done
  for id in $(docker network ls -q --no-trunc | sort | comm -13 "$1.net" -); do
    nombre=$(docker network inspect -f '{{.Name}}' "$id" 2>/dev/null)
    case "$nombre" in kind|minikube|academia_cloud_local_default) continue ;; esac
    docker network rm "$id" > /dev/null 2>&1
  done
  for id in $(docker volume ls -q | sort | comm -13 "$1.vol" -); do
    docker volume rm "$id" > /dev/null 2>&1
  done
}
cerrar_modulo() {
  local c
  for c in $(kind get clusters 2>/dev/null); do
    case " $KIND_INICIAL " in *" $c "*) continue ;; esac
    aviso "kind delete cluster --name $c"
    (export KUBECONFIG="$H/.kube/config"; kind delete cluster --name "$c" > /dev/null 2>&1)
  done
  if command -v minikube > /dev/null && [ -d "$H/.minikube" ]; then
    (export HOME="$H" MINIKUBE_HOME="$H/.minikube"; minikube delete --all > /dev/null 2>&1)
  fi
}
asegurar_cluster() { # unidades con kubectl que no crean su clúster: usan el del módulo o uno del kit
  grep -qE 'kind[[:space:]]+create[[:space:]]+cluster|minikube[[:space:]]+start' "$UNIDAD"/bloques/*.sh 2>/dev/null && return 0
  (export KUBECONFIG="$H/.kube/config"; kubectl config current-context > /dev/null 2>&1) && return 0
  grep -qE '(^|[[:space:];&|(])kubectl[[:space:]]' "$UNIDAD"/bloques/*.sh 2>/dev/null || return 0
  aviso "kind create cluster --name academia-kit (la unidad usa kubectl sin crear clúster)"
  (export KUBECONFIG="$H/.kube/config"; con_limite 600 kind create cluster --name academia-kit --wait 120s > "$LOGS/kind-academia-kit.log" 2>&1)
  NOTA_EXTRA="clúster kind «academia-kit» creado por el kit"
}

# ------------------------------------------------------------------ ejecución con timeout
ejecutar_unidad() { # ejecuta pasos.sh en su propio grupo de procesos, con límite de tiempo
  local t=$1 log=$2 pid w rc
  set -m
  ( entorno_unidad; cd "$TRABAJO" && exec bash "$UNIDAD/pasos.sh" ) > "$log" 2>&1 < /dev/null &
  pid=$!
  ( sleep "$t"; kill -0 "$pid" 2>/dev/null || exit 0; echo si > "$__EST/timeout"
    kill -s TERM -- "-$pid" 2>/dev/null; sleep 10; kill -s KILL -- "-$pid" 2>/dev/null ) > /dev/null 2>&1 &
  w=$!
  set +m
  wait "$pid"; rc=$?
  kill -s TERM -- "-$w" > /dev/null 2>&1; wait "$w" 2>/dev/null
  # procesos que la lección dejó en segundo plano (servidores, port-forward…)
  kill -s TERM -- "-$pid" 2>/dev/null; sleep 1; kill -s KILL -- "-$pid" 2>/dev/null
  if [ -s "$__EST/pids" ]; then xargs kill -9 < "$__EST/pids" > /dev/null 2>&1; fi
  return $rc
}

fragmentos_faltantes() { # fragmentos de «Resultado esperado» que no aparecen en la salida
  local f falt="" n=0 vistos=0
  [ -s "$UNIDAD/fragmentos.txt" ] || return 0
  tr -s ' \t' '  ' < "$1" > "$1.norm"   # «✓  responde 200» y «✓ responde 200» cuentan igual
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    n=$((n + 1))
    f=$(printf '%s' "$f" | tr -s ' ')
    if grep -qF -- "$f" "$1.norm"; then vistos=$((vistos + 1)); else falt="$falt «$f»"; fi
  done < "$UNIDAD/fragmentos.txt"
  rm -f "$1.norm"
  [ -n "$falt" ] && echo "revisar a mano: $vistos/$n fragmentos del resultado esperado aparecen; faltan$falt"
}

# ------------------------------------------------------------------ bucle principal
printf 'curso\tarchivo:línea\testado\tdetalle\n' > "$RESULTADOS"
registrar() { printf '%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$(printf '%s' "$4" | una_linea)" >> "$RESULTADOS"; }

MODULO_ACTUAL=""
PREV_TRABAJO=""
N=0
while IFS="$(printf '\t')" read -r curso modulo unidad origen floci plan motivo; do
  [ "$curso" = curso ] && continue
  if [ -n "$FILTRO" ] && ! printf '%s\n' "$origen $curso/$modulo/$unidad" | grep -qE -- "$FILTRO"; then continue; fi
  N=$((N + 1))
  UNIDAD="$KIT_DIR/build/$curso/$modulo/$unidad"
  ARCHIVO_LINEA="${origen#*/}"
  if [ "$curso/$modulo" != "$MODULO_ACTUAL" ]; then
    [ -n "$MODULO_ACTUAL" ] && cerrar_modulo
    MODULO_ACTUAL="$curso/$modulo"
    PREV_TRABAJO=""
    rm -rf "$H/.kube/config"
  fi
  # shellcheck disable=SC1091
  . "$UNIDAD/meta.sh"
  printf '[%3d] %-34s ' "$N" "$curso/$modulo/$unidad"
  if [ -n "$SKIP" ]; then
    registrar "$curso" "$ARCHIVO_LINEA" SKIP "$SKIP"
    echo "SKIP  $(printf '%s' "$SKIP" | cut -c1-70)"
    continue
  fi
  FALTAN="$(faltantes)"
  if [ -n "$FALTAN" ]; then
    registrar "$curso" "$ARCHIVO_LINEA" SKIP "falta en el Mac: $FALTAN (instálalo o usa INSTALAR_EXTRA=1)"
    echo "SKIP  falta: $FALTAN"
    continue
  fi
  BASE="$EJEC/$curso/$modulo/$unidad"
  TRABAJO="$BASE/trabajo"
  __EST="$BASE/estado"
  mkdir -p "$TRABAJO" "$__EST" "$(dirname "$LOGS/$curso/$modulo/x")"
  NOTA_EXTRA=""
  if [ "$DEPENDE" = 1 ] && [ -n "$PREV_TRABAJO" ] && [ -d "$PREV_TRABAJO" ]; then
    cp -R "$PREV_TRABAJO/." "$TRABAJO/" 2>/dev/null
    NOTA_EXTRA="parte de la carpeta del tema anterior (la lección lo pide como prerrequisito)"
  fi
  [ "$COMPOSE_RAIZ" = 1 ] && [ ! -e "$TRABAJO/docker-compose.yml" ] && ln -s "$COMPOSE_RAIZ_ARCHIVO" "$TRABAJO/docker-compose.yml"
  preparar_floci
  [ "$KUBE" = 1 ] && asegurar_cluster
  foto_docker "$__EST/antes"
  LOG="$LOGS/$curso/$modulo/$unidad.log"
  T="${TIMEOUT_TEMA:-$TIMEOUT}"
  export KIT_DIR UNIDAD TRABAJO __EST
  INICIO=$(date +%s)
  ejecutar_unidad "$T" "$LOG"
  RC=$?
  DUR=$(( $(date +%s) - INICIO ))
  limpiar_docker "$__EST/antes"
  corriendo floci-stackport && case " $PREVIOS_FLOCI " in *" floci-stackport "*) ;; *) docker stop floci-stackport > /dev/null 2>&1 ;; esac
  DET=""
  if [ -f "$__EST/timeout" ]; then
    EST_R=FAIL; DET="timeout de ${T}s; último paso: $(grep '^::bloque' "$LOG" | tail -1 | sed 's/^:://')"
  elif [ -f "$__EST/resultado" ]; then
    EST_R=$(cut -f1 "$__EST/resultado"); DET=$(cut -f2- "$__EST/resultado")
  else
    EST_R=FAIL; DET="pasos.sh terminó sin resultado (rc=$RC): $(grep -v '^[[:space:]]*$' "$LOG" | tail -1)"
  fi
  if [ "$EST_R" = PASS ]; then
    [ -s "$__EST/fallos-ok" ] && DET="fallo deliberado confirmado en línea(s) $(tr '\n' ' ' < "$__EST/fallos-ok")"
    [ -n "$PARCIAL" ] && DET="$DET · $PARCIAL"
    FR="$(fragmentos_faltantes "$LOG")"
    [ -n "$FR" ] && DET="$DET · $FR"
  fi
  [ -n "$NOTA_EXTRA" ] && DET="$DET · $NOTA_EXTRA"
  [ -n "$NOTAS" ] && DET="$DET · kit: $NOTAS"
  DET="$(printf '%s' "$DET · ${DUR}s · log: logs/$curso/$modulo/$unidad.log" | sed 's/^ · //')"
  registrar "$curso" "$ARCHIVO_LINEA" "$EST_R" "$DET"
  if [ "$EST_R" = FAIL ]; then echo "FAIL  (${DUR}s) $(printf '%s' "$DET" | cut -c1-90)"; else echo "PASS  (${DUR}s)"; fi
  PREV_TRABAJO="$TRABAJO"
done < "$KIT_DIR/build/indice.tsv"
[ -n "$MODULO_ACTUAL" ] && cerrar_modulo

# ------------------------------------------------------------------ cierre
if [ "${MANTENER_FLOCI:-0}" != 1 ]; then
  case " $PREVIOS_FLOCI " in *" floci "*) floci_cli_parar; docker start floci > /dev/null 2>&1 ;; *) floci_cli_parar ;; esac
  for s in aws-local:floci-aws azure-local:floci-azure gcp-local:floci-gcp stackport:floci-stackport; do
    case " $PREVIOS_FLOCI " in *" ${s#*:} "*) dc up -d "${s%%:*}" > /dev/null 2>&1 ;; *) dc stop "${s%%:*}" > /dev/null 2>&1 ;; esac
  done
fi
P=$(grep -c "	PASS	" "$RESULTADOS"); F=$(grep -c "	FAIL	" "$RESULTADOS"); S=$(grep -c "	SKIP	" "$RESULTADOS")
aviso "listo: PASS=$P FAIL=$F SKIP=$S → $RESULTADOS (logs en $LOGS)"
[ "$F" -eq 0 ]
