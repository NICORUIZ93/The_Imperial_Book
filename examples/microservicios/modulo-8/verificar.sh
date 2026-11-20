#!/usr/bin/env bash
# Módulo 4 · Caching y rendimiento (modulo-8)
# 1) Levanta 4 Redis 8.10.2 y PostgreSQL 18.7 con Docker Compose.
# 2) Ejecuta los 9 tests de los simuladores en Python (solo biblioteca estándar, Python 3.10+).
# 3) Ejecuta los tests Spring Boot 4.1.3 de F037–F040 con el Maven Wrapper (JDK 25).
# 4) Apaga los contenedores.
# Uso: ./verificar.sh          (requiere Docker con Compose v2, JDK 25 y python3)
set -u
cd "$(dirname "$0")"
java -version 2>&1 | head -1
python3 --version
docker compose version
docker compose up -d --wait || { echo "RESULTADO: FALLA · los contenedores no quedaron healthy (docker compose logs)"; exit 1; }
fallos=0
echo "== Simuladores (Python + Redis real)"
(cd simuladores && python3 -m unittest -v test_simuladores) || fallos=$((fallos + 1))
echo "== Proyectos Spring Boot (F037–F040)"
./mvnw -q test || fallos=$((fallos + 1))
docker compose down
if [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 4 (Caching y rendimiento) verificado"
else
  echo "RESULTADO: FALLA · busca arriba el primer FAIL de Python o el primer [ERROR] de Maven"
  exit 1
fi
