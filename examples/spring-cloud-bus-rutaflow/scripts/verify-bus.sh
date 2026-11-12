#!/usr/bin/env bash
set -euo pipefail

instance_a="${INSTANCE_A_URL:-http://localhost:8081}"
instance_b="${INSTANCE_B_URL:-http://localhost:8082}"
new_limit="${NEW_LIMIT:-9}"

before_a="$(curl -fsS "${instance_a}/config")"
before_b="$(curl -fsS "${instance_b}/config")"
printf 'Antes A: %s\nAntes B: %s\n' "$before_a" "$before_b"
[[ "$before_a" == *'"maxPedidos":3'* ]]
[[ "$before_b" == *'"maxPedidos":3'* ]]

curl -fsS -X POST "${instance_a}/actuator/busenv" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"ruta.max-pedidos\",\"value\":\"${new_limit}\"}" >/dev/null

# busenv distributes the temporary property; busrefresh clears the scoped bean
# cache so each instance reads the updated Environment value.
curl -fsS -X POST "${instance_a}/actuator/busrefresh" >/dev/null

for attempt in $(seq 1 40); do
  after_a="$(curl -fsS "${instance_a}/config")"
  after_b="$(curl -fsS "${instance_b}/config")"
  if [[ "$after_a" == *"\"maxPedidos\":${new_limit}"* && "$after_b" == *"\"maxPedidos\":${new_limit}"* ]]; then
    printf 'Después A: %s\nDespués B: %s\nBus actualizó las dos instancias.\n' "$after_a" "$after_b"
    exit 0
  fi
  sleep 0.25
done

printf 'No se propagó el valor. Última lectura A=%s B=%s\n' "$after_a" "$after_b" >&2
exit 1
