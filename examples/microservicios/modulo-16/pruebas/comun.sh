# Funciones compartidas por las pruebas del Módulo 12. Compatible con bash 3.2 (macOS): sin arrays ni «timeout».
# Se carga con:  . "$(dirname "$0")/comun.sh"
CLUSTER=academia-m12
K="kubectl --context kind-$CLUSTER"

ok() { echo "   ✔ $*"; }
mal() { echo "   ✘ $*"; return 1; }

# esperar SEGUNDOS "descripción" comando args...  -> repite el comando cada 2 s hasta que salga con 0
esperar() {
  limite=$((SECONDS + $1))
  descripcion=$2
  shift 2
  while [ "$SECONDS" -lt "$limite" ]; do
    if "$@" >/dev/null 2>&1; then
      ok "$descripcion"
      return 0
    fi
    sleep 2
  done
  mal "$descripcion (no ocurrió en el tiempo esperado)"
}

# contiene "texto" comando args...  -> el comando imprime algo que contiene el texto
contiene() {
  esperado=$1
  shift
  salida=$("$@" 2>&1)
  # JSON y YAML se comparan sin espacios: {"a": 1} y {"a":1} cuentan igual
  compacta=$(printf '%s' "$salida" | tr -d ' \t')
  buscado=$(printf '%s' "$esperado" | tr -d ' \t')
  case "$compacta" in
    *"$buscado"*) ok "contiene «${esperado}»"; return 0 ;;
    *) echo "$salida" | head -20; mal "no contiene «${esperado}»" ;;
  esac
}

# Cuántos endpoints LISTOS tiene un Service (EndpointSlices; Endpoints v1 está obsoleto desde Kubernetes 1.33).
endpoints_listos() {   # endpoints_listos namespace servicio
  $K -n "$1" get endpointslices -l "kubernetes.io/service-name=$2" \
    -o jsonpath='{range .items[*].endpoints[*]}{.conditions.ready}{"\n"}{end}' | grep -c true
}

# hay_endpoints namespace servicio N  -> exactamente N endpoints listos
hay_endpoints() {
  [ "$(endpoints_listos "$1" "$2")" -eq "$3" ]
}

# jsonpath_es namespace recurso jsonpath valor  -> el campo tiene exactamente ese valor
jsonpath_es() {
  [ "$($K -n "$1" get $2 -o jsonpath="$3")" = "$4" ]
}

# jsonpath_mayor namespace recurso jsonpath N  -> el campo (numérico) es mayor que N
jsonpath_mayor() {
  v=$($K -n "$1" get $2 -o jsonpath="$3")
  [ -n "$v" ] && [ "$v" -gt "$4" ]
}

# responde_con url texto  -> GET url contiene el texto
responde_con() {
  curl -s "$1" | tr -d ' \t' | grep -qF "$(printf '%s' "$2" | tr -d ' \t')"
}
