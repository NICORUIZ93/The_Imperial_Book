// Módulo 27 · F163 · el rol de Vault «pedidos», igual que en vault/configurar.sh (documentación del motor database).
export const ROL_PEDIDOS = {
  db_name: 'tienda',
  creation_statements: `CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO "{{name}}"`,
  revocation_statements: `REVOKE ALL ON ALL TABLES IN SCHEMA public FROM "{{name}}"; DROP ROLE IF EXISTS "{{name}}"`,
  default_ttl: '1h',
  max_ttl: '24h',
};
