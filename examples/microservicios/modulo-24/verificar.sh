#!/usr/bin/env bash
# Módulo 20 · Seguridad en Node.js (modulo-24, fichas F124–F129).
# Instala las dependencias fijadas (npm ci), ejecuta los 34 tests de node --test y, por cada ficha, el ataque contra
# la versión «antes» (vulnerable) y «después» (segura), comprobando que la primera cae y la segunda resiste.
# Con --compose levanta además MongoDB 9.0.8, Floci (AWS), Floci-Az (Azure) y Vault 2.2.0, y ejecuta lo que los
# necesita: el ataque NoSQL real y los tres gestores de secretos. Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh             (sin Docker: omite los bloques que necesitan infraestructura y lo avisa)
#      ./verificar.sh --compose   (todo; requiere Docker con Compose v5)
# Requiere Node.js 26.13.1 LTS, npm y curl; bash 3.2 de macOS sirve. Los logs quedan en logs/.
set -u
cd "$(dirname "$0")"
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
fallos=""; omitidos=0
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }
pids=""; compose=no
limpiar() { for p in $pids; do kill "$p" 2>/dev/null; done; if [ "$compose" = si ]; then docker compose down -v > logs/compose-down.log 2>&1; fi; }
trap limpiar EXIT

guion() { # guion "descripción" archivo.js "texto esperado" ["otro texto esperado"…]
  local desc="$1" archivo="$2"; shift 2
  local registro="logs/$(echo "$archivo" | tr '/' '-').log"
  node "$archivo" > "$registro" 2>&1
  local rc=$? ok=si texto
  cat "$registro"
  [ $rc -eq 0 ] || ok=no
  for texto in "$@"; do grep -qF -- "$texto" "$registro" || { ok=no; echo "  falta: «$texto»"; }; done
  if [ "$ok" = si ]; then echo "✔ $desc"; else falla "$desc (mira $registro)"; fi
}
comprobar() { # comprobar "descripción" "texto esperado" curl-args...
  local desc="$1" texto="$2"; shift 2
  local salida; salida=$(curl -s -w ' [%{http_code}]' "$@" 2>&1)
  if printf '%s' "$salida" | grep -qF -- "$texto"; then echo "✔ $desc"; else echo "  obtenido: $salida"; falla "$desc: se esperaba «$texto»"; fi
}
esperar() { # esperar url descripción  → hasta 60 s
  local i=0
  while [ $i -lt 120 ]; do curl -s -o /dev/null "$1" && return 0; sleep 0.5; i=$((i + 1)); done
  falla "$2 no respondió en 60 s"; return 1
}

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac

echo "== Dependencias (npm ci: jsonwebtoken 9.0.3, passport 0.7.0, helmet 8.3.0, cors 2.8.6, mongodb 7.9.1, zod 4.6.7, SDK de AWS y Azure, node-vault 0.13.0)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Tests sin infraestructura (node --test, 34 en total)"
node --test --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test (busca ✖ arriba)"

echo "== F124 · JWT con jsonwebtoken"
guion "antes cae, después resiste" f124-jwt/ataque.js \
  'token falsificado (alg none, admin)  -> 200 {"ventasDelMes":184500000}' \
  'token falsificado (alg none, admin)  -> 401 {"error":"token inválido"}' 'encontrado: "secreto"' '-> 900 s'
guion "error común (payload legible)" f124-jwt/error-comun.js '"tarjeta":"4111 1111 1111 1111"'

echo "== F125 · Passport.js"
guion "antes cae, después resiste" f125-passport/ataque.js \
  'x-usuario: root (sin clave)      -> 200 {"pedidos":[1,2]}' 'Ana (cliente) borra un usuario   -> 200 {"borrado":"u2"}' \
  'x-usuario: root (sin clave)      -> 401 Unauthorized'     'Ana (cliente) borra un usuario   -> 403 {"error":"no tienes permiso"}'
guion "error común (session: false)" f125-passport/error-comun.js 'Login sessions require session support' 'POST /bien/login -> 200'

echo "== F126 · Helmet, CORS"
guion "antes cae, después resiste" f126-helmet-cors/ataque.js \
  'Allow-Origin: https://sitio-malo.example  · el navegador ENTREGA' 'Allow-Origin: (no está)                   · el navegador BLOQUEA' \
  'x-powered-by: Express' 'x-content-type-options: nosniff'
guion "error común (CORS no bloquea)" f126-helmet-cors/error-comun.js '-> 200 {"nombre":"Ana","saldo":250000}'
guion "anti-patrón (origen a medias)" f126-helmet-cors/anti-patron.js 'Set.has() (igualdad exacta)  acepta: (ninguno)'

echo "== F127 · Prevención de inyecciones NoSQL (parte sin base de datos)"
guion "error común (lista negra)" f127-nosql/error-comun.js 'rechazada: clave'

echo "== F128 · OWASP Top 10"
guion "antes cae, después resiste" f128-owasp/ataque.js \
  '-> 200 {"id":2,"de":"luis","total":990000}' '-> 200 {"claveDeAcceso":"AKIA-INTERNA-NO-PUBLICAR"}' '-> 200 {"exportadas":2}' '-> 0 (nadie se entera' \
  '-> 404 {"error":"no existe"}' '-> 400 {"error":"destino no permitido"}' '-> 503 {"error":"no se pudo comprobar el permiso' '-> 2 (p. ej.'

echo "== F129 · Secretos (parte sin infraestructura: proveedor en memoria)"
guion "antes filtra, después no" f129-secretos/ataque.js \
  'GET /debug/config                            200 y la respuesta contiene la clave: SÍ' 'GET /pedidos tras rotar la clave             500' \
  'GET /debug/config                            404' 'GET /pedidos tras rotar la clave             200'
guion "error común (secreto para siempre)" f129-secretos/error-comun.js 'petición 2 después · MAL: FALLA' 'BIEN: OK'

if [ "${1:-}" = "--compose" ]; then
  compose=si
  echo "== Infraestructura (docker compose up -d --wait: MongoDB 9.0.8, Floci 2.2.0, Floci-Az 0.14.0, Vault 2.2.0)"
  if docker compose up -d --wait > logs/compose-up.log 2>&1; then echo "✔ contenedores arriba"; else tail -20 logs/compose-up.log; falla "docker compose up (mira logs/compose-up.log)"; fi
  esperar http://127.0.0.1:4566/_localstack/health "Floci (AWS)"
  esperar http://127.0.0.1:4577/ "Floci-Az (Azure)"
  esperar http://127.0.0.1:8200/v1/sys/health "Vault"

  echo "== F127 · Inyección NoSQL contra MongoDB"
  guion "antes cae, después resiste" f127-nosql/ataque.js \
    '{"usuario":"root","clave":{"$ne":null}}     -> 200 {"bienvenido":"root","rol":"admin"}' \
    '{"usuario":"root","clave":{"$ne":null}}     -> 400'
  node --test --test-reporter=spec f127-nosql/nosql.integracion.js || falla "f127-nosql/nosql.integracion.js"

  echo "== F129 · Secretos en AWS Secrets Manager, Vault y Azure Key Vault"
  guion "sembrar el secreto en los tres" f129-secretos/sembrar.js 'secreto tienda/bd guardado'
  node --test --test-concurrency=1 --test-reporter=spec f129-secretos/secretos.integracion.js || falla "f129-secretos/secretos.integracion.js"
  node f129-secretos/sembrar.js > /dev/null 2>&1 # deja la clave inicial tras las rotaciones del test
  for proveedor in aws vault azure; do
    SECRETOS=$proveedor AWS_ENDPOINT_URL=http://127.0.0.1:4566 VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root \
      AZURE_KEYVAULT_URL=http://127.0.0.1:4577/devstoreaccount1-keyvault AZURE_EMULADOR=si \
      node f129-secretos/despues.js > "logs/api-3229-$proveedor.log" 2>&1 &
    pid=$!; pids="$pids $pid"
    if esperar http://127.0.0.1:3229/salud/secretos "despues.js con SECRETOS=$proveedor"; then
      comprobar "$proveedor: /pedidos usa la clave del gestor" '[{"pedido":1,"total":120000}] [200]' http://127.0.0.1:3229/pedidos
      comprobar "$proveedor: /salud/secretos sin valores"      "\"proveedor\":\"$proveedor\""        http://127.0.0.1:3229/salud/secretos
    fi
    if grep -q 'Cl4ve' "logs/api-3229-$proveedor.log"; then falla "$proveedor: la clave aparece en el log"; else echo "✔ $proveedor: la clave no aparece en el log"; fi
    kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null
  done
else
  omite "F127 contra MongoDB (ataque.js y nosql.integracion.js): usa --compose"
  omite "F129 contra Floci, Floci-Az y Vault (sembrar.js, secretos.integracion.js y despues.js): usa --compose"
fi

limpiar; pids=""; compose=no
if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: $omitidos bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 20 (Seguridad en Node.js) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
