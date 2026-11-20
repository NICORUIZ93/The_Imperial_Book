#!/usr/bin/env bash
# Módulo 6 · Comunicación entre servicios (modulo-10)
# Levanta RabbitMQ 4.4.1 y Kafka 4.4.0 (F050), ejecuta los tests de las 5 fichas (F047–F051) con el
# Maven Wrapper (-fae: un proyecto que falla no impide probar los demás), comprueba el contrato Protocol
# Buffers de F048 y apaga los contenedores.
# Uso: ./verificar.sh     (requiere JDK 25 LTS, Docker con Compose v2 y python3; protoc se busca solo)
set -u
cd "$(dirname "$0")"
java -version 2>&1 | head -1
docker compose version
docker compose up -d --wait || { echo "RESULTADO: FALLA · los brokers no quedaron healthy (docker compose logs)"; exit 1; }
resultado=0
if ./mvnw -q -fae test; then
  echo "OK · tests de F047–F051 en verde"
else
  resultado=1
  echo "FALLA · busca arriba el primer [ERROR] y el test marcado con FAILURE"
fi
# F048: el mensaje de ejemplo ocupa 8 bytes y el contrato v2 «roto» pierde los campos en silencio.
salida=$(./f048-grpc/protobuf/demo-binario.sh 2>&1) || { resultado=1; echo "$salida"; }
echo "$salida" | grep -q "Bytes en el cable (8 bytes)" || { resultado=1; echo "FALLA · demo-binario.sh"; }
docker compose down
if [ $resultado -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 6 (Comunicación entre servicios) verificado"
else
  echo "RESULTADO: FALLA"
fi
exit $resultado
