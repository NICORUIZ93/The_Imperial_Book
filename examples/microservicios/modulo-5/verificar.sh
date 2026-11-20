#!/usr/bin/env bash
# Módulo 1 · Java moderno y Spring Boot esencial (modulo-5)
# Ejecuta los tests de las 8 fichas con el Gradle Wrapper.
# Uso: ./verificar.sh            -> tests en la JVM (JDK 25 LTS)
#      ./verificar.sh --docker   -> además CRaC (checkpoint/restore) y binario nativo en Docker
set -u
cd "$(dirname "$0")"
java -version 2>&1 | head -1
if ./gradlew -q test; then
  echo "OK · tests de F017–F024 en verde"
else
  echo "RESULTADO: FALLA · busca arriba «What went wrong» y abre el informe de tests que indica"
  exit 1
fi
if [ "${1:-}" = "--docker" ]; then
  set -e
  ./gradlew -q :f023-crac:bootJar
  rm -rf f023-crac/build/crac
  docker compose --profile crac build crac-checkpoint
  docker compose --profile crac run --rm crac-checkpoint || true   # termina al crear el checkpoint
  test -n "$(ls -A f023-crac/build/crac)" || { echo "RESULTADO: FALLA · no se creó el checkpoint"; exit 1; }
  docker compose --profile crac up -d crac-restore
  sleep 3
  curl -fsS localhost:8080/hola; echo
  docker compose --profile crac down
  docker compose --profile native run --rm native-build
  docker compose --profile native up -d native-run
  sleep 2
  curl -fsS "localhost:8081/impuesto?base=100000"; echo
  docker compose --profile native down
fi
echo "RESULTADO: OK · Módulo 1 (Java moderno y Spring Boot esencial) verificado"
