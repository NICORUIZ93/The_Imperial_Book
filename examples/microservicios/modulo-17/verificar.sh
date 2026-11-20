#!/usr/bin/env bash
# Módulo 13 · JavaScript/TypeScript moderno y Node.js esencial (modulo-17, fichas F089–F095).
# Instala las dependencias fijadas (npm ci), comprueba los tipos con TypeScript 6.0.3, ejecuta los 24 tests de
# node --test y los programas de cada ficha comparando su salida. Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh            (requiere Node.js 26.13.1 LTS y npm; bash 3.2 de macOS sirve)
#      ./verificar.sh --clinic   (además perfila f092-perf/servidor-lento.js con clinic doctor 13.0.0 vía npx)
set -u
cd "$(dirname "$0")"
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
fallos=""
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
espera() { # espera "descripción" "texto que debe aparecer" comando...
  local desc="$1" texto="$2"; shift 2
  local salida; salida=$("$@" 2>&1); local rc=$?
  if [ $rc -ne 0 ]; then echo "$salida"; falla "$desc (código $rc)"; return; fi
  if printf '%s' "$salida" | grep -qF -- "$texto"; then echo "✔ $desc"; else echo "$salida"; falla "$desc: no aparece «${texto}»"; fi
}

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos de error pueden cambiar." ;; esac

echo "== Dependencias (npm ci: typescript 6.0.3, @types/node 26.6.6)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== F090 · tsc --noEmit en modo strict"
npx tsc -p f090-typescript && echo "✔ tsc sin errores" || falla "tsc -p f090-typescript"

echo "== Tests (node --test)"
node --test --test-concurrency=1 --test-reporter=spec || falla "node --test (busca ✖ arriba)"

echo "== Programas de cada ficha"
espera "F089 Promise.all en paralelo"         "En paralelo: [ 'Ana', 'Luis', 'Ana' ] 100 ms aprox." node f089-es6/demo.js
espera "F090 Node ejecuta TypeScript"          "Valor del inventario: 360000"                        node f090-typescript/src/demo.ts
espera "F091 orden del Event Loop"             "6 setTimeout 0 (macrotask, fase timers)"             node f091-event-loop/orden.js
espera "F091 bloqueo: el health check expira"  "salud: TimeoutError"                                 node f091-event-loop/bloqueo.js
espera "F092 perf_hooks"                        "timerify: 2 llamadas medidas"                        node f092-perf/medir.js
rm -rf perfiles
espera "F092 node --cpu-prof"                   "200 peticiones en"                                   node --cpu-prof --cpu-prof-dir=perfiles f092-perf/servidor-lento.js
perfil=$(ls perfiles/*.cpuprofile 2>/dev/null | head -1)
if [ -n "$perfil" ]; then espera "F092 resumen del perfil" " %  " node f092-perf/resumir-perfil.js "$perfil"; else falla "F092 no se generó el .cpuprofile"; fi
espera "F093 worker y proceso hijo"            "worker thread   fib(36) = 14930352"                  node f093-workers/comparar.js
espera "F094 backpressure"                      "1000 trozos entregados"                              node f094-backpressure/backpressure.js

if [ "${1:-}" = "--clinic" ]; then
  echo "== F092 · clinic doctor 13.0.0 (NO_INSIGHT=1 evita la pregunta de telemetría)"
  rm -rf .clinic
  NO_INSIGHT=1 npx -y clinic@13.0.0 doctor --no-open -- node f092-perf/servidor-lento.js || falla "clinic doctor"
  ls .clinic/*.clinic-doctor.html >/dev/null 2>&1 && echo "✔ informe HTML en .clinic/" || falla "clinic doctor no generó el HTML"
fi

if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 13 (JavaScript/TypeScript moderno y Node.js esencial) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
