-- M4 T3 · Transaction log tailing con decodificación lógica de PostgreSQL.
-- Requiere wal_level=logical (ver el tema). test_decoding es el plugin de ejemplo que trae PostgreSQL.
\set QUIET on
SELECT 'slot creado: ' || slot_name AS paso
FROM pg_create_logical_replication_slot('rutaflow_outbox', 'test_decoding');
\set QUIET off
