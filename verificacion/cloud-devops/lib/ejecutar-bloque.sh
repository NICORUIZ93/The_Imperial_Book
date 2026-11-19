# Ejecuta un bloque de terminal de la lección como lo haría el estudiante en la misma terminal:
# recupera la carpeta actual y las variables/funciones de los bloques anteriores, corre el bloque con
# `set -eo pipefail` y guarda el estado resultante para el bloque siguiente.
# Uso: bash ejecutar-bloque.sh BLOQUE.sh CARPETA_DE_ESTADO   (bash 3.2 compatible)

__BLOQUE=$1
__EST=$2
__RESERVADAS=" BASH BASHOPTS BASHPID BASH_ALIASES BASH_ARGC BASH_ARGV BASH_ARGV0 BASH_CMDS BASH_COMMAND \
BASH_EXECUTION_STRING BASH_LINENO BASH_REMATCH BASH_SOURCE BASH_SUBSHELL BASH_VERSINFO BASH_VERSION \
COLUMNS COMP_WORDBREAKS DIRSTACK EPOCHREALTIME EPOCHSECONDS EUID FUNCNAME GROUPS HISTCMD HOSTNAME \
HOSTTYPE IFS LINENO LINES MACHTYPE MAILCHECK OLDPWD OPTARG OPTERR OPTIND OSTYPE PIPESTATUS PPID PS1 PS2 \
PS4 PWD RANDOM SECONDS SHELLOPTS SHLVL SRANDOM UID _ "

__guardar_estado() {
  local __v __f
  {
    for __v in $(compgen -v); do
      case "$__v" in __*) continue ;; esac
      case "$__RESERVADAS" in *" $__v "*) continue ;; esac
      declare -p "$__v" 2>/dev/null
    done
    for __f in $(compgen -A function); do
      case "$__f" in __*|bash|sh|cd) continue ;; esac
      declare -f "$__f"
    done
  } > "$__EST/vars.sh.tmp" 2>/dev/null && mv "$__EST/vars.sh.tmp" "$__EST/vars.sh"
  pwd > "$__EST/cwd"
  jobs -p >> "$__EST/pids" 2>/dev/null
}

# Coloca el script de un «Practícalo tú» (# archivo: x.sh) cuando la lección lo invoca y aún no existe.
__colocar() {
  local a
  for a in "$@"; do
    case "$a" in -*) continue ;; esac
    if [ ! -e "$a" ] && [ -f "$__EST/diferidos/$(basename "$a")" ]; then
      mkdir -p "$(dirname "$a")"
      cp "$__EST/diferidos/$(basename "$a")" "$a"
      echo "[kit] colocado $a desde el bloque «Practícalo tú» de la lección" >&2
    fi
    break
  done
}
bash() { __colocar "$@"; command bash "$@"; }
# «Para volver, entra a `x`» cuando el bloque anterior ya dejó la terminal dentro de `x`.
cd() {
  if [ "$#" -eq 1 ] && [ -n "$1" ] && [ ! -d "$1" ] && [ "$(basename "$PWD")" = "${1%/}" ]; then
    echo "[kit] ya estás en ${1%/}; cd se omite" >&2
    return 0
  fi
  builtin cd "$@"
}
sh() { __colocar "$@"; command sh "$@"; }

[ -s "$__EST/vars.sh" ] && . "$__EST/vars.sh"
cd "$(cat "$__EST/cwd")" || { echo "[kit] no existe la carpeta de trabajo" >&2; exit 97; }

set -eo pipefail
. "$__BLOQUE"
set +eu +o pipefail
__guardar_estado
exit 0
