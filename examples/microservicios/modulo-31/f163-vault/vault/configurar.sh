#!/usr/bin/env bash
# Módulo 27 · F163 · configura el motor database del Vault REAL del docker-compose.yml (hashicorp/vault:2.2.0, modo dev)
# contra postgres:18.7. Comandos de https://developer.hashicorp.com/vault/docs/secrets/databases/postgresql
# Uso (desde examples/microservicios/modulo-31): docker compose up -d --wait && ./f163-vault/vault/configurar.sh
set -eu
v() { docker compose exec -T -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN=root vault vault "$@"; }
v secrets enable database || true   # si ya estaba habilitado, sigue
v write database/config/tienda \
  plugin_name=postgresql-database-plugin \
  connection_url='postgresql://{{username}}:{{password}}@postgres:5432/tienda?sslmode=disable' \
  allowed_roles=pedidos \
  username=vault_admin password=solo-dev-vault
v write database/roles/pedidos \
  db_name=tienda \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  revocation_statements="REVOKE ALL ON ALL TABLES IN SCHEMA public FROM \"{{name}}\"; DROP ROLE IF EXISTS \"{{name}}\";" \
  default_ttl=1h max_ttl=24h
v read database/creds/pedidos
