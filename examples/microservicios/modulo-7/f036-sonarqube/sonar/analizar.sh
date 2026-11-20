#!/usr/bin/env bash
# F036 · Analiza f036-sonarqube con el SonarQube de ../docker-compose.yml y comprueba el resultado.
# Uso (desde examples/microservicios/modulo-7):  docker compose up -d sonarqube && f036-sonarqube/sonar/analizar.sh
# Requisitos: curl, python3, JDK 25. Idempotente: si la clave de admin ya cambió, la reutiliza.
set -euo pipefail
cd "$(dirname "$0")/.."
URL="${SONAR_URL:-http://localhost:9000}"
CLAVE_NUEVA="Laboratorio-2026!"

echo "1/5 Esperando a que SonarQube responda status=UP..."
for _ in $(seq 1 90); do
  estado=$(curl -s "$URL/api/system/status" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("status",""))' 2>/dev/null || true)
  [ "$estado" = "UP" ] && break
  sleep 2
done
[ "$estado" = "UP" ] || { echo "SonarQube no llegó a UP (estado: '$estado'). Mira: docker compose logs sonarqube"; exit 1; }

echo "2/5 Cambiando la clave inicial admin/admin (obligatorio en el primer uso)..."
curl -s -o /dev/null -u admin:admin -X POST "$URL/api/users/change_password" \
  --data-urlencode "login=admin" --data-urlencode "previousPassword=admin" --data-urlencode "password=$CLAVE_NUEVA" || true

echo "3/5 Generando un token de análisis..."
TOKEN=$(curl -s -u "admin:$CLAVE_NUEVA" -X POST "$URL/api/user_tokens/generate" \
  --data-urlencode "name=laboratorio-$(date +%s)" | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')

echo "4/5 Tests + cobertura + análisis (el build espera al Quality Gate)..."
../gradlew -q check sonar -Dsonar.token="$TOKEN" -Dsonar.host.url="$URL"

echo "5/5 Comprobando por API..."
curl -s -u "$TOKEN:" "$URL/api/qualitygates/project_status?projectKey=f036-sonarqube" | python3 -c '
import sys, json
estado = json.load(sys.stdin)["projectStatus"]["status"]
print("Quality Gate:", estado)
sys.exit(0 if estado == "OK" else 1)'
curl -s -u "$TOKEN:" "$URL/api/measures/component?component=f036-sonarqube&metricKeys=coverage,bugs,vulnerabilities,code_smells" | python3 -c '
import sys, json
medidas = {m["metric"]: m["value"] for m in json.load(sys.stdin)["component"]["measures"]}
print("Medidas:", ", ".join(f"{k}={medidas[k]}" for k in sorted(medidas)))
assert float(medidas["coverage"]) > 0, "SonarQube no importó la cobertura de JaCoCo"'
echo "RESULTADO SONAR: OK"
