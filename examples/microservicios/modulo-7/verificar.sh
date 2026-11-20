#!/usr/bin/env bash
# Módulo 3 · Testing y calidad (modulo-7)
# 1) ./mvnw test: JUnit + Mockito + MockMvc (F032), Testcontainers con PostgreSQL 18.7 (F033),
#    Pact consumidor -> proveedor desde carpeta (F034), ArchUnit (F035) y la regla de negocio de F036.
# 2) Pact Broker 2.124.0: publica el contrato, el proveedor lo verifica desde el broker y publica el
#    resultado, y can-i-deploy responde "Computer says yes".
# 3) SonarQube Community Build 26.11: análisis con cobertura de JaCoCo y Quality Gate.
# Uso: ./verificar.sh            todo (≈ 5–8 min la primera vez: descarga imágenes y dependencias)
#      ./verificar.sh --rapido   solo el paso 1 (necesita Docker para Testcontainers)
# Requisitos: JDK 25, Docker con Compose v2 (Docker Desktop: 4 GB de RAM o más), curl y python3.
set -u
cd "$(dirname "$0")"
java -version 2>&1 | head -1
docker compose version
fallos=0

echo "== 1/3 Tests de las 5 fichas"
./mvnw -q test || fallos=$((fallos + 1))

if [ "${1:-}" != "--rapido" ]; then
  echo "== 2/3 Pact Broker"
  if docker compose up -d --wait pact-broker; then
    ./mvnw -q -pl f034-pact-consumidor pact:publish || fallos=$((fallos + 1))
    ./mvnw -q -pl f034-pact-proveedor test -Dtest=ContratoDesdeBrokerManual \
      -Dpact.verifier.publishResults=true || fallos=$((fallos + 1))
    ./mvnw -q -pl f034-pact-consumidor pact:can-i-deploy -Dpacticipant=tienda-web \
      -DpacticipantVersion=1.0.0 || fallos=$((fallos + 1))
  else
    echo "El Pact Broker no quedó healthy: docker compose logs pact-broker"; fallos=$((fallos + 1))
  fi
  echo "== 3/3 SonarQube"
  docker compose up -d sonarqube && f036-sonarqube/sonar/analizar.sh || fallos=$((fallos + 1))
  docker compose down
fi

if [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 3 (Testing y calidad) verificado"
else
  echo "RESULTADO: FALLA ($fallos pasos) · busca arriba el primer [ERROR] o FAILED"
  exit 1
fi
