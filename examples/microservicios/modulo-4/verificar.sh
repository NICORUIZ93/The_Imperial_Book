#!/usr/bin/env bash
# Módulo 0.5 · Ejecuta los tests de los «Hola Mundo» (Java y Node.js) y la práctica de Docker básico.
# Uso: ./verificar.sh            -> tests de Java, Node.js y Docker básico (imagen ubuntu:24.04)
#      ./verificar.sh --compose  -> además construye y prueba docker-compose.yml (descarga
#                                   eclipse-temurin:25-jdk y node:26-alpine la primera vez)
# Requisitos: JDK 25 LTS, Node.js 26.13.1 LTS, Docker Engine 29 con Compose v5.
set -u
cd "$(dirname "$0")"
fallos=0
comprobar() { if [ "$2" = "$3" ]; then echo "✔ $1"; else echo "✖ $1 (esperado '$2', obtenido '$3')"; fallos=$((fallos + 1)); fi; }

echo "== Java ($(java -version 2>&1 | grep -m1 version))"
(cd java && java HolaServidorTest.java) || fallos=$((fallos + 1))
echo "== Node.js ($(node --version))"
(cd node && node --test --test-reporter=spec) || fallos=$((fallos + 1))

echo "== Docker básico ($(docker --version))"
if docker build -q -t hola-docker:1 docker-basico > /dev/null; then
  salida="$(docker run --rm hola-docker:1)"
  comprobar "el contenedor saluda" "Hola Mundo desde Docker" "$(echo "$salida" | sed -n 1p)"
  comprobar "dentro hay Ubuntu 24.04" "Ubuntu 24.04" "$(echo "$salida" | sed -n 2p | grep -o 'Ubuntu 24.04')"
  comprobar "-e cambia la variable de entorno" "Mensaje recibido por variable de entorno: hola" "$(docker run --rm -e MENSAJE=hola hola-docker:1 | tail -1)"
else
  echo "✖ no se pudo construir docker-basico (¿está Docker encendido?)"; fallos=$((fallos + 1))
fi

if [ "${1:-}" = "--compose" ]; then
  echo "== Docker Compose ($(docker compose version))"
  docker compose up --build -d --wait || fallos=$((fallos + 1))
  sleep 2
  comprobar "hola-java responde" "Hola Mundo desde Java" "$(curl -s localhost:8080/hola)"
  comprobar "hola-node responde" "Hola Mundo desde Node.js" "$(curl -s localhost:3000/hola)"
  docker compose down
fi

if [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 0.5 (Hola Mundo en Java y Node.js + Docker básico) verificado"
else
  echo "RESULTADO: FALLA · $fallos comprobación(es) con ✖ arriba"
  exit 1
fi
