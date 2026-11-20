#!/usr/bin/env bash
# F082 · Test de Docker Compose: nginx -> catalogo (healthy) con variables y secreto.
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
docker compose up -d --build --wait || fallos=$((fallos + 1))
docker compose ps
contiene "healthy" docker compose ps catalogo || fallos=$((fallos + 1))
contiene '"mensaje":"Hola desde Docker Compose"' curl -s http://localhost:8088/api/info || fallos=$((fallos + 1))
contiene '"claveApiConfigurada":true' curl -s http://localhost:8088/api/info || fallos=$((fallos + 1))
# El catálogo NO publica puertos: solo se llega por nginx.
if curl -s -m 2 http://localhost:8080/api/info >/dev/null 2>&1; then
  echo "   (aviso: algo responde en :8080 del host; no debería ser el catálogo de Compose)"
fi
docker compose down
[ "$fallos" -eq 0 ]
