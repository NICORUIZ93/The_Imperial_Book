-- M4 T2 · Deja cuatro envíos con su evento pendiente (E-1 a E-4) para repetir los ejercicios.
TRUNCATE outbox, envios RESTART IDENTITY;
INSERT INTO envios (id, cliente_id, peso_kg, zona)
SELECT 'E-' || n, 'CL-9', 2.5, 'Z03' FROM generate_series(1, 4) AS n;
INSERT INTO outbox (agregado_id, tipo, payload)
SELECT 'E-' || n, 'EnvioCreado',
       jsonb_build_object('version', 1, 'envioId', 'E-' || n, 'clienteId', 'CL-9', 'zona', 'Z03', 'pesoKg', 2.5)
FROM generate_series(1, 4) AS n;
