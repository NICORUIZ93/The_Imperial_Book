#!/usr/bin/env bash
# Módulo 14 · APIs REST con Express y NestJS (modulo-18, fichas F096–F100).
# Instala las dependencias fijadas (npm ci), compila los proyectos NestJS con TypeScript 6.0.3, ejecuta los
# 26 tests de node --test, arranca cada API y comprueba sus respuestas con curl. Si algo falla, sigue y lo
# reporta todo al final.
# Uso: ./verificar.sh     (requiere Node.js 26.13.1 LTS, npm y curl; bash 3.2 de macOS sirve)
set -u
cd "$(dirname "$0")"
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1   # toda la salida queda también en logs/verificar.log
fallos=""
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
pids=""
limpiar() { for p in $pids; do kill "$p" 2>/dev/null; done; }
trap limpiar EXIT

arrancar() { # arrancar puerto comando...  → lanza la API y espera a que acepte conexiones (máx. 10 s)
  local puerto="$1"; shift
  PORT="$puerto" "$@" > "logs/api-$puerto.log" 2>&1 &
  pids="$pids $!"
  local i=0
  while [ $i -lt 50 ]; do
    curl -s -o /dev/null "http://localhost:$puerto/" && return 0
    sleep 0.2; i=$((i + 1))
  done
  falla "la API del puerto $puerto no arrancó (mira logs/api-$puerto.log)"
  return 1
}

comprobar() { # comprobar "descripción" "texto esperado" curl-args...
  local desc="$1" texto="$2"; shift 2
  local salida; salida=$(curl -s -w ' [%{http_code}]' "$@" 2>&1)
  if printf '%s' "$salida" | grep -qF -- "$texto"; then echo "✔ $desc"; else echo "  obtenido: $salida"; falla "$desc: se esperaba «${texto}»"; fi
}

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos de error pueden cambiar." ;; esac

echo "== Dependencias (npm ci: express 5.3.0, NestJS 12.5.1, zod 4.6.7, class-validator 0.15.1, @nestjs/swagger 12.1.2)"
npm ci --no-audit --no-fund --silent || falla "npm ci"

echo "== Compilación NestJS (tsc 6.0.3 → dist/)"
rm -rf dist
npx tsc -p tsconfig.json && echo "✔ tsc sin errores" || falla "tsc -p tsconfig.json"

echo "== Tests (node --test: JavaScript de f096 y f098; TypeScript compilado en dist/)"
node --test --test-concurrency=1 --test-reporter=spec 'f096-express/*.test.js' 'f098-validacion/*.test.js' 'dist/**/*.test.js' || falla "node --test (busca ✖ arriba)"

echo "== F096 · Express"
if arrancar 3096 node f096-express/app.js; then
  comprobar "GET /productos/1 → 200"          '{"id":"1","nombre":"Teclado","precio":120000} [200]' localhost:3096/productos/1
  comprobar "GET /productos/99 → 404 problem" '"detail":"No existe el producto 99"'                  localhost:3096/productos/99
  comprobar "POST sin rol → 403"              '[403]' -X POST localhost:3096/productos -H 'content-type: application/json' -d '{"nombre":"Mouse","precio":50000}'
fi
echo "== F097 · NestJS: módulo, controller, provider, interceptor, guard"
if arrancar 3097 node dist/f097-nestjs/src/main.js; then
  comprobar "GET /pedidos/1 → { datos }"      '{"datos":{"id":1,"cliente":"Ana","total":120000}} [200]' localhost:3097/pedidos/1
  comprobar "guard: POST sin rol → 403"       '"message":"Forbidden resource"' -X POST localhost:3097/pedidos -H 'content-type: application/json' -d '{"cliente":"Luis","total":5000}'
fi
echo "== F098 · Validación con Zod y con class-validator"
if arrancar 3098 node f098-validacion/zod-express.js; then
  comprobar "Zod: 400 por campo"              '"desconocidos":["rol"]} [400]' -X POST localhost:3098/clientes -H 'content-type: application/json' -d '{"nombre":"A","email":"x","edad":15,"rol":"admin"}'
fi
if arrancar 3198 node dist/f098-validacion/src/main.js; then
  comprobar "class-validator: 400"            '"property rol should not exist"' -X POST localhost:3198/clientes -H 'content-type: application/json' -d '{"nombre":"A","email":"x","edad":15,"rol":"admin"}'
fi
echo "== F099 · DTOs"
if arrancar 3099 node dist/f099-dtos/src/main.js; then
  comprobar "DTO de salida sin passwordHash"  '{"id":1,"nombre":"Ana","email":"ana@correo.co","miembroDesde":"2026-11-19"} [201]' -X POST localhost:3099/usuarios -H 'content-type: application/json' -d '{"nombre":"Ana","email":"ana@correo.co","password":"una-clave-larga"}'
fi
echo "== F100 · OpenAPI/Swagger"
if arrancar 3100 node dist/f100-openapi/src/main.js; then
  comprobar "/docs-json es OpenAPI 3"          '"openapi":"3.0.0"' localhost:3100/docs-json
  comprobar "Swagger UI en /docs"              '[200]' -o /dev/null localhost:3100/docs
fi
limpiar; pids=""

if [ -z "$fallos" ]; then
  echo "RESULTADO: OK · Módulo 14 (APIs REST con Express y NestJS) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
