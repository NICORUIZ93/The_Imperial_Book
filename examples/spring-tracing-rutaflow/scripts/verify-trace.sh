#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root_dir"
deliveries_port="${DELIVERIES_PORT:-18081}"
inventory_port="${INVENTORY_PORT:-18082}"

./mvnw -q clean package -DskipTests
if command -v docker >/dev/null 2>&1; then
  compose=(docker compose)
elif command -v podman >/dev/null 2>&1; then
  compose=(podman compose)
else
  echo 'Instala Docker Compose o Podman Compose.' >&2
  exit 1
fi
"${compose[@]}" up -d
delivery_pid=""
inventory_pid=""
cleanup() {
  [[ -z "$delivery_pid" ]] || kill "$delivery_pid" 2>/dev/null || true
  [[ -z "$inventory_pid" ]] || kill "$inventory_pid" 2>/dev/null || true
  "${compose[@]}" down
}
trap cleanup EXIT

jaeger_ready=false
for attempt in $(seq 1 30); do
  if curl -fsS http://localhost:16686/ >/dev/null 2>&1; then
    jaeger_ready=true
    break
  fi
  sleep 1
done
[[ "$jaeger_ready" == true ]] || { echo 'Jaeger no inició en http://localhost:16686' >&2; exit 1; }
java -jar target/spring-tracing-rutaflow-0.1.0.jar \
  --spring.application.name=entregas --rutaflow.role=delivery \
  --server.port="$deliveries_port" --rutaflow.inventory-url="http://localhost:$inventory_port" \
  > /tmp/rutaflow-tracing-entregas.log 2>&1 &
delivery_pid=$!
java -jar target/spring-tracing-rutaflow-0.1.0.jar \
  --spring.application.name=inventario --rutaflow.role=inventory \
  --server.port="$inventory_port" --rutaflow.inventory-url="http://localhost:$inventory_port" \
  > /tmp/rutaflow-tracing-inventario.log 2>&1 &
inventory_pid=$!

ready=false
for attempt in $(seq 1 60); do
  if curl -fsS "http://localhost:$deliveries_port/actuator/health" >/dev/null 2>&1 && \
     curl -fsS "http://localhost:$inventory_port/actuator/health" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
[[ "$ready" == true ]] || { echo 'Los dos servicios no iniciaron; revisa /tmp/rutaflow-tracing-*.log' >&2; exit 1; }

response="$(curl -fsS "http://localhost:$deliveries_port/deliveries/RF-314")"
printf 'Respuesta del flujo: %s\n' "$response"
[[ "$response" == *'Inventario reservado para RF-314'* ]]

read -r start_time end_time < <(python3 - <<'PY'
from datetime import datetime, timedelta, timezone

now = datetime.now(timezone.utc)
print((now - timedelta(minutes=2)).isoformat().replace("+00:00", "Z"), now.isoformat().replace("+00:00", "Z"))
PY
)

for attempt in $(seq 1 30); do
  traces="$(curl -fsSG http://localhost:16686/api/v3/trace-summaries \
    --data-urlencode 'query.service_name=entregas' \
    --data-urlencode "query.start_time_min=${start_time}" \
    --data-urlencode "query.start_time_max=${end_time}" 2>/dev/null || true)"
  if TRACE_JSON="$traces" python3 - <<'PY'
import json
import os

try:
    payload = json.loads(os.environ["TRACE_JSON"])
except json.JSONDecodeError:
    raise SystemExit(1)

for trace in payload.get("summaries", []):
    names = {service.get("name") for service in trace.get("services", [])}
    if {"entregas", "inventario"}.issubset(names):
        print(f"Trace ID: {trace['traceId']}")
        print(f"Servicios en la misma traza: {', '.join(sorted(names))}")
        raise SystemExit(0)
raise SystemExit(1)
PY
  then
    exit 0
  fi
  sleep 1
done

echo 'No apareció una traza compartida entre entregas e inventario.' >&2
echo 'Revisa los logs de aplicación y el estado de Jaeger.' >&2
exit 1
