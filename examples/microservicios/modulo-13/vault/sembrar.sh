#!/usr/bin/env bash
# F068 · Guarda el secreto de pagos en Vault, crea la política de solo lectura y emite un token
# con esa política (válido 1 h). Imprime SOLO el token, para usarlo así:
#   export VAULT_TOKEN=$(./vault/sembrar.sh)
set -euo pipefail
cd "$(dirname "$0")/.."
v() { docker compose exec -T -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN=root-solo-dev vault vault "$@"; }
v kv put secret/f068-pagos tienda.pagos.api-key=clave-de-pagos-desde-vault >/dev/null
v policy write f068-pagos - < vault/f068-pagos.hcl >/dev/null
v token create -policy=f068-pagos -ttl=1h -field=token
