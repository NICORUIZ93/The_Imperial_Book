# Motor de pasos del kit cloud-devops; lo cargan los build/**/pasos.sh (bash 3.2 compatible).
# Variables que define run.sh: KIT_DIR, UNIDAD (carpeta de build de la unidad), TRABAJO (carpeta vacía
# donde arranca la lección) y __EST (estado privado del kit para esta unidad).

__inicio() {
  mkdir -p "$__EST/diferidos"
  echo "$TRABAJO" > "$__EST/cwd"
  : > "$__EST/vars.sh"
  : > "$__EST/pids"
  rm -f "$__EST/resultado"
  echo "::inicio $(head -1 "$UNIDAD/origen.txt") · $(sed -n 2p "$UNIDAD/origen.txt")"
}

__falla() {
  printf 'FAIL\tbloque línea %s: %s\n' "$1" "$2" > "$__EST/resultado"
  echo "::FAIL línea $1: $2"
  exit 1
}

# __archivo NOMBRE_EN_ARCHIVOS RUTA_EN_LA_LECCION [CARPETA_DE_«dentro de»]
__archivo() {
  local nom=$1 rel=$2 dentro=${3:-} cwd base dest
  cwd=$(cat "$__EST/cwd")
  base=$(basename "$cwd")
  # «Crea `ejemplo/x.js`» estando ya dentro de `ejemplo/`: la ruta es relativa a la carpeta del ejemplo.
  case "$rel" in
    "$base"/*) [ -e "$cwd/${rel%%/*}" ] || rel=${rel#"$base"/} ;;
  esac
  dest="$cwd/$rel"
  if [ -n "$dentro" ] && [ "$base" != "$dentro" ] && [ -d "$cwd/$dentro" ]; then
    dest="$cwd/$dentro/$rel"
  fi
  mkdir -p "$(dirname "$dest")" && cp "$UNIDAD/archivos/$nom" "$dest" || __falla "-" "no se pudo crear $rel"
  echo "::archivo ${dest#"$TRABAJO"/}"
}

# Bloques «Practícalo tú» con «# archivo: x.sh» que otro bloque invoca: se colocan al invocarlos.
__diferido() {
  cp "$UNIDAD/archivos/$1" "$__EST/diferidos/$2"
  echo "::archivo $2 preparado (se coloca cuando un bloque lo invoque con bash/sh)"
}

# __bloque ID LINEA normal|fallo
__bloque() {
  local id=$1 linea=$2 modo=$3 sal rc
  sal="$__EST/salida-$id.log"
  echo "::bloque $id · línea $linea · $modo · carpeta $(sed "s|^$TRABAJO|.|" "$__EST/cwd")"
  bash "$KIT_DIR/lib/ejecutar-bloque.sh" "$UNIDAD/bloques/$id.sh" "$__EST" < /dev/null > "$sal" 2>&1
  rc=$?
  cat "$sal"
  [ -s "$sal" ] && [ -n "$(tail -c1 "$sal")" ] && echo
  echo "::fin bloque $id rc=$rc"
  if [ "$modo" = fallo ]; then
    if [ "$rc" -ne 0 ]; then
      echo "::fallo deliberado confirmado (rc=$rc)"
      echo "$linea" >> "$__EST/fallos-ok"
      return 0
    fi
    if [ -s "$UNIDAD/bloques/$id.esperado" ] && grep -qF -f "$UNIDAD/bloques/$id.esperado" "$sal"; then
      echo "::fallo deliberado confirmado (apareció el error que promete la lección)"
      echo "$linea" >> "$__EST/fallos-ok"
      return 0
    fi
    __falla "$linea" "la lección promete un fallo deliberado y el bloque terminó bien"
  fi
  [ "$rc" -eq 0 ] && return 0
  __falla "$linea" "rc=$rc: $(grep -v '^[[:space:]]*$' "$sal" | tail -1 | tr '\t' ' ' | cut -c1-220)"
}

__fin() {
  printf 'PASS\t\n' > "$__EST/resultado"
  exit 0
}
