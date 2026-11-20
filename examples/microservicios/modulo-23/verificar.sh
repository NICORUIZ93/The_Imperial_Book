#!/usr/bin/env bash
# Módulo 19 · Resiliencia en Node.js (modulo-23, fichas F119–F123).
# Instala las dependencias fijadas (npm ci), comprueba tipos con TypeScript 6.0.3, levanta la infraestructura
# (inventario + Redis + Toxiproxy), ejecuta los 25 tests de node --test, las simulaciones de fallo de cada ficha y
# los scripts de error común, y prueba el servicio de F119 con curl mientras Toxiproxy tumba el inventario.
# Si algo falla, sigue y lo reporta todo al final. Los logs quedan en logs/.
# Uso: ./verificar.sh --compose     (infraestructura con Docker Compose; es lo que usa el curso)
#      ./verificar.sh               (Docker si hay daemon; si no, toxiproxy-server 2.13.0 y redis-server del PATH)
# Requiere Node.js 26.13.1 LTS, npm y curl; bash 3.2 de macOS sirve.
set -u
cd "$(dirname "$0")"
if [ "${1:-}" = "--compose" ]; then MODO=docker; export MODO; fi
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
fallos=""
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
pids=""
limpiar() { for p in $pids; do kill "$p" 2>/dev/null; done; ./infra.sh down > logs/infra-down.log 2>&1; }
trap limpiar EXIT

guion() { # guion "descripción" "texto esperado" archivo.js  → ejecuta el script, guarda su log y busca el texto
  local desc="$1" texto="$2" archivo="$3"
  local registro="logs/$(echo "$archivo" | tr '/' '-').log"
  node "$archivo" > "$registro" 2>&1
  local rc=$?
  cat "$registro"
  if [ $rc -eq 0 ] && grep -qF -- "$texto" "$registro"; then echo "✔ $desc"; else falla "$desc: se esperaba «${texto}» (mira $registro)"; fi
}
comprobar() { # comprobar "descripción" "texto esperado" curl-args...
  local desc="$1" texto="$2"; shift 2
  local salida; salida=$(curl -s -w ' [%{http_code}]' "$@" 2>&1)
  if printf '%s' "$salida" | grep -qF -- "$texto"; then echo "✔ $desc"; else echo "  obtenido: $salida"; falla "$desc: se esperaba «${texto}»"; fi
}

echo "== Node.js $(node --version) · npm $(npm --version) · infraestructura en modo $(./infra.sh modo)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac

echo "== Dependencias (npm ci: opossum 10.0.0, cockatiel 4.0.0, redis 6.3.1, rate-limiter-flexible 11.5.0, express 5.3.0)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Tipos (tsc 6.0.3 --noEmit sobre cockatiel.ts)"
npx tsc -p tsconfig.json && echo "✔ tsc sin errores" || falla "tsc -p tsconfig.json"

echo "== Infraestructura (inventario :9000, Toxiproxy :8474 con proxies :21212 y :26379, Redis)"
if ./infra.sh up > logs/infra-up.log 2>&1; then echo "✔ infraestructura arriba"; else cat logs/infra-up.log; falla "./infra.sh up (mira logs/infra-up.log)"; fi
comprobar "inventario a través de Toxiproxy" '{"sku":"7","stock":12} [200]' http://127.0.0.1:21212/stock/7

echo "== Tests (node --test, 25 en total)"
node --test --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test (busca ✖ arriba)"

echo "== F119 · Circuit Breaker con opossum o cockatiel"
guion "simulación opossum"   "OK: el circuito se abrió"                     f119-circuit-breaker/simulacion.js
guion "simulación cockatiel" "OK: cockatiel abrió con 3 fallos seguidos"    f119-circuit-breaker/cockatiel.ts
guion "error común (errorFilter)" "failures=0 abierto=false"                f119-circuit-breaker/error-comun.js
PORT=3119 node f119-circuit-breaker/servicio.js > logs/api-3119.log 2>&1 &
pids="$pids $!"
i=0; while [ $i -lt 50 ]; do curl -s -o /dev/null http://127.0.0.1:3119/circuito && break; sleep 0.2; i=$((i + 1)); done
comprobar "servicio sano → 200"            '{"sku":"7","stock":12} [200]' http://127.0.0.1:3119/pedidos/stock/7
./simular-fallo.sh caido > /dev/null || falla "simular-fallo.sh caido"
for n in 1 2 3; do curl -s -o /dev/null http://127.0.0.1:3119/pedidos/stock/7; done
comprobar "circuito abierto → 503"         '"circuito":"ABIERTO"} [503]'  http://127.0.0.1:3119/pedidos/stock/7
./simular-fallo.sh sano > /dev/null || falla "simular-fallo.sh sano"
sleep 1.2
comprobar "se recupera → 200"              '{"sku":"7","stock":12} [200]' http://127.0.0.1:3119/pedidos/stock/7

echo "== F120 · Retry con jitter"
guion "simulación"                 "OK: el reintento absorbió el fallo pasajero" f120-retry/simulacion.js
guion "cockatiel retry"            'OK {"sku":"7","stock":12}'                   f120-retry/con-cockatiel.js
guion "error común (POST duplicado)" "3 POST recibidos, 1 reservas creadas"      f120-retry/error-comun.js

echo "== F121 · Rate Limiting con Redis"
guion "simulación"                 "OK: el límite se comparte entre instancias" f121-rate-limiting/simulacion.js
guion "error común (INCR sin EXPIRE)" "TTL=-1"                                   f121-rate-limiting/error-comun.js
guion "anti-patrón (límite en memoria)" "15 aceptadas, 3 rechazadas"             f121-rate-limiting/anti-patron.js

echo "== F122 · Timeouts"
guion "simulación"                 "OK: con timeout la espera está acotada"      f122-timeouts/simulacion.js
guion "error común (Promise.race)" "estuvo viva todo este tiempo"               f122-timeouts/error-comun.js

echo "== F123 · Fallback strategies"
guion "simulación"                 "OK: lectura degradada con caché"             f123-fallbacks/simulacion.js
guion "error común (fallback 0)"   "Disponibilidad por confirmar"                f123-fallbacks/error-comun.js

limpiar; pids=""
if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 19 (Resiliencia en Node.js) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
