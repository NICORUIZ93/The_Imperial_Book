#!/usr/bin/env bash
# Módulo 17 · Introducción a microservicios en Node (modulo-21, fichas F109–F112).
# Sin argumentos: npm ci, tsc --noEmit (TypeScript 6.0.3), los tests (los de Consul usan el doble en memoria
# comun/consul-de-prueba.js) y las demos de F109 y F110. Con --compose levanta Consul 2.1.0 con Docker Compose
# y repite los tests y los laboratorios de F111 y F112 contra el Consul REAL. Con --externo usa un Consul que
# ya esté arriba en CONSUL_HTTP_ADDR (por defecto 127.0.0.1:8500).
# Si algo falla, sigue y lo reporta todo al final.
# Uso: ./verificar.sh [--compose | --externo]   (Node.js 26.13.1 LTS, npm, curl y jq; bash 3.2 de macOS sirve)
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
modo="${1:-}"
fallos=""
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
pids=""
limpiar() { for p in $pids; do kill "$p" 2>/dev/null; done; }
trap limpiar EXIT

esperar_texto() { # esperar_texto "texto" archivo → espera hasta 10 s a que aparezca
  local i=0
  while [ $i -lt 50 ]; do grep -qF -- "$1" "$2" 2>/dev/null && return 0; sleep 0.2; i=$((i + 1)); done
  return 1
}
contiene() { # contiene "descripción" "texto esperado" archivo
  if grep -qF -- "$2" "$3"; then echo "✔ $1"; else echo "  no aparece «$2» en $3"; falla "$1"; fi
}
igual_json() { # igual_json "descripción" 'json esperado' 'json obtenido' → compara con jq (ignora espacios y orden de claves)
  if [ "$(printf '%s' "$3" | jq -cS . 2>/dev/null)" = "$(printf '%s' "$2" | jq -cS .)" ]; then echo "✔ $1"; else echo "  obtenido: $3"; falla "$1"; fi
}

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos de error pueden cambiar." ;; esac

echo "== Dependencias (npm ci: dotenv 18.0.10, consul 2.0.1, typescript 6.0.3)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Tipos (tsc --noEmit con TypeScript 6.0.3)"
npx tsc -p tsconfig.json && echo "✔ tsc sin errores" || falla "tsc -p tsconfig.json"

echo "== Tests (node --test; Consul = doble en memoria)"
node --test --test-concurrency=1 --test-reporter=spec 'f109-estructura/test/*.test.ts' 'f110-dotenv/*.test.js' 'f111-consul/*.test.js' 'f112-config-central/*.test.js' || falla "node --test (busca ✖ arriba)"

echo "== F109 · Estructura de carpetas escalable"
node f109-estructura/herramientas/revisar-capas.ts > logs/f109-capas.log 2>&1 || falla "revisar-capas.ts encontró violaciones"
contiene "regla de dependencias" '✔ 0 violaciones' logs/f109-capas.log
PORT=3109 node f109-estructura/src/main.ts > logs/f109-main.log 2>&1 &
pids="$pids $!"
if esperar_texto 'escuchando' logs/f109-main.log; then
  r=$(curl -s -X POST localhost:3109/pedidos -H 'content-type: application/json' -d '{"cliente":"Ana","lineas":[{"producto":"Teclado","cantidad":2,"precioUnitario":120000}]}')
  igual_json "POST /pedidos → pedido creado" '{"id":"P-1","cliente":"Ana","lineas":[{"producto":"Teclado","cantidad":2,"precioUnitario":120000}],"total":240000,"estado":"CREADO"}' "$r"
  r=$(curl -s -X POST localhost:3109/pedidos -H 'content-type: application/json' -d '{"cliente":"Ana","lineas":[]}')
  igual_json "regla de dominio → 422" '{"codigo":"SIN_LINEAS","detalle":"El pedido necesita al menos una línea"}' "$r"
else falla "f109 no arrancó (logs/f109-main.log)"; fi
limpiar; pids=""

echo "== F110 · dotenv"
creado=no
if [ ! -f f110-dotenv/.env ]; then cp f110-dotenv/.env.example f110-dotenv/.env; creado=si; fi
node f110-dotenv/main.js > logs/f110-main.log 2>&1 || falla "f110-dotenv/main.js"
contiene "carga .env y oculta el secreto" '"DATABASE_URL": "***"' logs/f110-main.log
PORT=8080 node f110-dotenv/main.js > logs/f110-entorno.log 2>&1
contiene "el entorno le gana a .env" '"PORT": 8080' logs/f110-entorno.log
node f110-dotenv/error-comun.js > logs/f110-error-comun.log 2>&1
contiene "error común: import antes de dotenv" 'PAGOS_URL al importar el cliente: undefined' logs/f110-error-comun.log
if [ "$creado" = si ]; then   # solo si el .env lo creó este guion: no se toca el tuyo
  rm -f f110-dotenv/.env
  env -u DATABASE_URL -u PAGOS_URL node f110-dotenv/main.js > logs/f110-sin-env.log 2>&1
  contiene "sin .env: falla al arrancar" 'DATABASE_URL es obligatoria y no está definida' logs/f110-sin-env.log
fi

# ---------- Consul real (F111 y F112) ----------
con_consul=no
if [ "$modo" = "--compose" ]; then
  echo "== docker compose up -d --wait (Consul 2.1.0)"
  docker compose version
  if docker compose up -d --wait; then con_consul=si
  else docker compose logs > logs/compose.log 2>&1; falla "Consul no quedó healthy (logs/compose.log)"; fi
elif [ "$modo" = "--externo" ]; then
  if curl -s -o /dev/null "http://${CONSUL_HTTP_ADDR:-127.0.0.1:8500}/v1/status/leader" || curl -s -o /dev/null "http://${CONSUL_HTTP_ADDR:-127.0.0.1:8500}/v1/kv/x"; then con_consul=si
  else falla "no hay Consul en ${CONSUL_HTTP_ADDR:-127.0.0.1:8500}"; fi
else
  echo "== F111 y F112 contra el Consul REAL: ./verificar.sh --compose"
fi

if [ "$con_consul" = si ]; then
  echo "== Tests de F111 y F112 contra Consul (CONSUL_REAL=1)"
  CONSUL_REAL=1 node --test --test-concurrency=1 --test-reporter=spec 'f111-consul/*.test.js' 'f112-config-central/*.test.js' || falla "tests con CONSUL_REAL=1"

  echo "== F111 · Service Discovery con Consul"
  PORT=3111 node f111-consul/servicio-catalogo.js > logs/f111-catalogo-3111.log 2>&1 & a=$!
  PORT=3112 node f111-consul/servicio-catalogo.js > logs/f111-catalogo-3112.log 2>&1 & b=$!
  pids="$pids $a $b"
  esperar_texto 'registrado' logs/f111-catalogo-3111.log && esperar_texto 'registrado' logs/f111-catalogo-3112.log || falla "las instancias de catálogo no se registraron"
  node f111-consul/cliente.js > logs/f111-cliente.log 2>&1 || falla "f111-consul/cliente.js"
  contiene "round-robin: instancia 3111" 'atendida por catalogo-3111' logs/f111-cliente.log
  contiene "round-robin: instancia 3112" 'atendida por catalogo-3112' logs/f111-cliente.log
  kill -9 "$a" 2>/dev/null; sleep 5   # muere sin avisar: el TTL de 3 s vence
  node f111-consul/cliente.js > logs/f111-cliente-tras-caida.log 2>&1 || falla "cliente tras la caída"
  if grep -q 'catalogo-3111' logs/f111-cliente-tras-caida.log; then falla "Consul sigue ofreciendo la instancia caída"; else echo "✔ la instancia caída deja de ofrecerse al vencer el TTL"; fi
  kill -TERM "$b" 2>/dev/null; sleep 1
  curl -s -X PUT "http://${CONSUL_HTTP_ADDR:-127.0.0.1:8500}/v1/agent/service/deregister/catalogo-3111" > /dev/null
  node f111-consul/cliente.js > logs/f111-cliente-sin-instancias.log 2>&1
  contiene "sin instancias sanas" 'No hay instancias sanas de "catalogo" en Consul' logs/f111-cliente-sin-instancias.log

  echo "== F112 · Configuración centralizada"
  node f112-config-central/sembrar.js > logs/f112-sembrar.log 2>&1 || falla "sembrar.js"
  PORT=3120 node f112-config-central/servicio.js > logs/f112-servicio.log 2>&1 &
  pids="$pids $!"
  if esperar_texto 'escuchando' logs/f112-servicio.log; then
    igual_json "configuración inicial desde Consul" '{"pagos.timeoutMs":1500,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}' "$(curl -s localhost:3120/config)"
    node f112-config-central/sembrar.js pagos.timeoutMs 800 >> logs/f112-sembrar.log 2>&1
    esperar_texto 'recargada en caliente [pagos.timeoutMs]' logs/f112-servicio.log || falla "no hubo recarga en caliente"
    igual_json "recarga en caliente sin reiniciar" '{"pagos.timeoutMs":800,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}' "$(curl -s localhost:3120/config)"
    node f112-config-central/sembrar.js pagos.timeoutMs rapido >> logs/f112-sembrar.log 2>&1
    esperar_texto 'valor rechazado' logs/f112-servicio.log || falla "no rechazó el valor inválido"
    igual_json "valor inválido: conserva el anterior" '{"pagos.timeoutMs":800,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}' "$(curl -s localhost:3120/config)"
  else falla "f112 no arrancó (logs/f112-servicio.log)"; fi
  limpiar; pids=""
fi
if [ "$modo" = "--compose" ]; then
  docker compose logs > logs/compose.log 2>&1
  docker compose down -v
fi

if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 17 (Introducción a microservicios en Node) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
