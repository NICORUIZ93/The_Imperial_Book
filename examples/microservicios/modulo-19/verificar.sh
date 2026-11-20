#!/usr/bin/env bash
# Módulo 15 · Persistencia (modulo-19, fichas F101–F104).
# Instala las dependencias fijadas (npm ci), genera el cliente de Prisma, ejecuta los tests de node --test y los
# programas de cada ficha comparando su salida. Si algo falla, SIGUE con lo demás y lo reporta todo al final.
# Cada bloque guarda su salida completa en logs/NN-nombre.log.
# Uso: ./verificar.sh --compose   levanta MongoDB 9.0.8 y PostgreSQL 18.7 con Docker Compose, verifica todo y los apaga
#      ./verificar.sh             usa las bases que ya estén arriba (PG_HOST, PG_PORT, MONGO_URL); lo que no
#                                 tenga base disponible se omite y se avisa
# Requiere Node.js 26.13.1 LTS y npm; con --compose, Docker con Compose v5. bash 3.2 de macOS sirve.
set -u
cd "$(dirname "$0")"
mkdir -p logs
rm -f logs/*.log
fallos=""
omitidos=0
n=0
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }

# paso "descripción" "texto que debe aparecer (o vacío)" comando...  → ejecuta, guarda el log y comprueba
paso() {
  local desc="$1" texto="$2"; shift 2
  n=$((n + 1))
  local log; log="logs/$(printf '%02d' "$n")-$(printf '%s' "$desc" | LC_ALL=C tr ' /:·' '-----' | LC_ALL=C tr -cd 'A-Za-z0-9._-' | cut -c1-40).log"
  "$@" > "$log" 2>&1; local rc=$?
  if [ $rc -ne 0 ]; then tail -n 15 "$log"; falla "$desc (código $rc, ver $log)"; return 1; fi
  if [ -n "$texto" ] && ! grep -qF -- "$texto" "$log"; then tail -n 15 "$log"; falla "$desc: no aparece «$texto» (ver $log)"; return 1; fi
  echo "✔ $desc"
}
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }

echo "== Node.js $(node --version) · npm $(npm --version)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos de error pueden cambiar." ;; esac

compose=0
if [ "${1:-}" = "--compose" ]; then
  compose=1
  export EXIGIR_INFRA=1
  echo "== Docker Compose: MongoDB 9.0.8 (27019) y PostgreSQL 18.7 (5519)"
  docker compose version
  paso "docker compose up -d --wait" "" docker compose up -d --wait
fi

echo "== Dependencias (npm ci: mongoose 9.12.2, prisma 7.10.1, sequelize 6.37.8, pg 8.23.1, express 5.3.0)"
paso "npm ci" "" npm ci --no-audit --no-fund

# ¿Qué bases responden? (en modo --compose, que no respondan es un fallo)
hay_pg=0; hay_mongo=0
node --input-type=module -e "import pg from 'pg'; import { pgUrl } from './config.js'; const c = new pg.Client({ connectionString: pgUrl('inventario_db', 'inventario_app', 'inventario'), connectionTimeoutMillis: 3000 }); await c.connect(); await c.end();" > logs/00-postgres.log 2>&1 && hay_pg=1
node --input-type=module -e "import mongoose from 'mongoose'; import { MONGO_URL } from './config.js'; await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 3000 }); await mongoose.disconnect();" > logs/00-mongo.log 2>&1 && hay_mongo=1
echo "== PostgreSQL disponible: $hay_pg · MongoDB disponible: $hay_mongo"
if [ $compose -eq 1 ]; then
  [ $hay_pg -eq 1 ] || falla "PostgreSQL no responde en el puerto del laboratorio (ver logs/00-postgres.log)"
  [ $hay_mongo -eq 1 ] || falla "MongoDB no responde en el puerto del laboratorio (ver logs/00-mongo.log)"
fi

echo "== F101 · MongoDB + Mongoose"
paso "F101 validación del esquema (sin base)" "pass 4" node --test --test-reporter=spec f101-mongoose/modelo.test.js
paso "F101 error común: buffering y URL equivocada" "MongooseServerSelectionError" node f101-mongoose/error-buffering.js
if [ $hay_mongo -eq 1 ]; then
  paso "F101 repositorio contra MongoDB" "pass 4" node --test --test-reporter=spec f101-mongoose/repositorio.test.js
  paso "F101 demo" "MongoServerError 11000" node f101-mongoose/demo.js
else omite "F101 con MongoDB (usa --compose)"; fi

echo "== F102 · PostgreSQL + Prisma/Sequelize"
if [ $hay_pg -eq 1 ]; then
  paso "F102 Sequelize: tests" "pass 3" node --test --test-reporter=spec f102-prisma-sequelize/sequelize.test.js
  paso "F102 Sequelize: demo" "Total vendido: 170000" node f102-prisma-sequelize/sequelize-demo.js
  paso "F102 N+1 frente a include" "include: 1 consulta" node f102-prisma-sequelize/n-mas-1.js
  if paso "F102 prisma generate" "" npm run generate; then
    paso "F102 Prisma: tests" "pass 3" node --import tsx --test --test-reporter=spec f102-prisma-sequelize/prisma.test.ts
    paso "F102 Prisma: demo" "Total vendido: 170000" node --import tsx f102-prisma-sequelize/prisma-demo.ts
  fi
else omite "F102 (necesita PostgreSQL; usa --compose)"; fi

echo "== F103 · Database-per-service"
if [ $hay_pg -eq 1 ]; then
  paso "F103 tests de aislamiento" "pass 4" node --test --test-reporter=spec f103-database-per-service/aislamiento.test.js
  paso "F103 demo: el usuario ajeno no entra" 'permission denied for database "inventario_db"' node f103-database-per-service/demo.js
  paso "F103 error común: JOIN entre bases" "cross-database references are not implemented" node f103-database-per-service/error-join.js
else omite "F103 (necesita PostgreSQL; usa --compose)"; fi

echo "== F104 · Connection pooling y transacciones"
if [ $hay_pg -eq 1 ]; then
  paso "F104 tests de pool y transacciones" "pass 5" node --test --test-reporter=spec f104-pool-transacciones/pool.test.js
  paso "F104 demo" "Tras los dos ROLLBACK: { ana: 70, luis: 80 }" node f104-pool-transacciones/demo.js
  paso "F104 error común: fuga de conexiones" "timeout exceeded when trying to connect" node f104-pool-transacciones/fuga.js
  paso "F104 anti-patrón: transacción con pool.query" "pool.query (MAL): petición 1 rejected · petición 2 fulfilled · saldos { ana: 100, luis: 50 }" node f104-pool-transacciones/anti-patron.js
else omite "F104 (necesita PostgreSQL; usa --compose)"; fi

if [ $compose -eq 1 ]; then
  docker compose logs > logs/99-docker-compose.log 2>&1
  docker compose down > /dev/null 2>&1
fi

if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: $omitidos bloques omitidos por falta de infraestructura; ejecuta ./verificar.sh --compose para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 15 (Persistencia) verificado · logs en logs/"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA · revisa los archivos de logs/"
  exit 1
fi
