#!/usr/bin/env bash
# Módulo 29 · Team Topologies y organización (modulo-33, fichas F169–F172).
# No usa infraestructura: Node.js 26.13.1 LTS y Git. --compose se acepta por uniformidad con los demás módulos
# (no hay docker-compose.yml que levantar). Si algo falla, sigue y lo reporta al final.
# Uso: ./verificar.sh [--compose]   (bash 3.2 de macOS sirve)
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
rm -f logs/*.log
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
modo="${1:-}"
fallos=""
omitidos=0
falla() { fallos="${fallos}\n  ✘ $1"; echo "✘ $1"; }
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }

# paso "descripción" "texto que debe aparecer (o vacío)" comando...  → ejecuta, guarda el log y comprueba
n=0
paso() {
  local desc="$1" texto="$2"; shift 2
  n=$((n + 1))
  local log; log="logs/$(printf '%02d' "$n")-$(printf '%s' "$desc" | LC_ALL=C tr ' /:·' '-----' | LC_ALL=C tr -cd 'A-Za-z0-9._-' | cut -c1-40).log"
  "$@" > "$log" 2>&1; local rc=$?
  if [ $rc -ne 0 ]; then tail -n 15 "$log"; falla "${desc} (código ${rc}, ver ${log})"; return 1; fi
  if [ -n "$texto" ] && ! grep -qF -- "$texto" "$log"; then tail -n 15 "$log"; falla "${desc}: no aparece «${texto}» (ver ${log})"; return 1; fi
  echo "✔ ${desc}"
}

if ! command -v node > /dev/null 2>&1; then
  echo "✘ No encuentro node. Instala Node.js 26.13.1 LTS (https://nodejs.org) y vuelve a ejecutar."
  echo "RESULTADO: FALLA · falta Node.js"
  exit 1
fi
echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac
if [ "$modo" = "--compose" ]; then
  echo "== --compose: este módulo no usa infraestructura (no hay docker-compose.yml); se ejecuta todo igual."
fi

echo "== Dependencias (npm ci: este laboratorio no tiene dependencias de npm)"
paso "npm ci" "" npm ci --no-audit --no-fund

echo "== F169 · Ley de Conway"
if command -v git > /dev/null 2>&1; then
  echo "   $(git --version)"
  paso "F169 tests (Git real)" "pass 4" node --test --test-force-exit --test-reporter=spec f169-conway/conway.test.js
  paso "F169 demo" "Organización por flujo: 0/6 funcionalidades cruzan equipos (0 %) · traspasos: 0" node f169-conway/demo.js
else
  omite "F169 tests y demo (no encuentro git; instálalo con «xcode-select --install» en macOS)"
fi
paso "F169 error común: solo organigrama" "MAL  → solo organigrama: 3/3 cambios cruzan equipos" node f169-conway/error-comun.js

echo "== F170 · Stream-aligned, Platform, Enabling teams"
paso "F170 tests" "pass 4" node --test --test-force-exit --test-reporter=spec f170-topologias/topologia.test.js
paso "F170 demo" "Topología corregida: 0 avisos" node f170-topologias/demo.js
paso "F170 error común: plataforma por tickets" "MAL  → «plataforma» por tickets, 20 equipos: espera media 5.5 días, la peor 10" node f170-topologias/error-comun.js

echo "== F171 · Carga cognitiva"
paso "F171 tests" "pass 4" node --test --test-force-exit --test-reporter=spec f171-carga-cognitiva/carga.test.js
paso "F171 demo" "Después (checkout-pagos): 0 avisos · encuesta 3.8/5" node f171-carga-cognitiva/demo.js
paso "F171 error común: contar servicios" "facturacion=5 avisos (encuesta 2.3)" node f171-carga-cognitiva/error-comun.js

echo "== F172 · Dimensionamiento de equipos"
paso "F172 tests" "pass 5" node --test --test-force-exit --test-reporter=spec f172-dimensionamiento/tamano.test.js
paso "F172 demo" "24 personas en un grupo: 276 canales · en equipos 8+8+8: 84 internos + 2 interfaces entre equipos" node f172-dimensionamiento/demo.js
paso "F172 error común: más gente al mismo equipo" "MAL  → 12 personas en un equipo: 66 canales (+45)" node f172-dimensionamiento/error-comun.js

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos por falta de herramientas; instálalas y repite."; fi
  echo "RESULTADO: OK · Módulo 29 (Team Topologies y organización) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
