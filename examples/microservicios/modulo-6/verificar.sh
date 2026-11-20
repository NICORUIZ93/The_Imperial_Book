#!/usr/bin/env bash
# Módulo 2 · APIs REST y persistencia (modulo-6)
# Levanta PostgreSQL 18.7 y MySQL 9.7.4 con Docker Compose, ejecuta los tests de las
# 8 carpetas (F025–F031) con el Maven Wrapper y apaga los contenedores.
# Uso: ./verificar.sh            (requiere JDK 25 LTS y Docker con Compose v2)
set -u
cd "$(dirname "$0")"
java -version 2>&1 | head -1
docker compose version
docker compose up -d --wait || { echo "RESULTADO: FALLA · las bases no quedaron healthy (docker compose logs)"; exit 1; }
if ./mvnw -q test; then
  resultado=0
  echo "RESULTADO: OK · Módulo 2 (APIs REST y persistencia) verificado"
else
  resultado=1
  echo "RESULTADO: FALLA · busca arriba el primer [ERROR] y el test marcado con FAILURE"
fi
docker compose down
exit $resultado
