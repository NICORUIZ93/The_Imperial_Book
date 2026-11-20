-- M4 T3 · Genera WAL: 10 000 envíos con su evento, en una transacción.
BEGIN;
INSERT INTO envios (id, cliente_id, peso_kg, zona)
SELECT 'C-' || n, 'CL-9', 1, 'Z03' FROM generate_series(1, 10000) AS n;
INSERT INTO outbox (agregado_id, tipo, payload)
SELECT 'C-' || n, 'EnvioCreado', jsonb_build_object('version', 1, 'envioId', 'C-' || n)
FROM generate_series(1, 10000) AS n;
COMMIT;
