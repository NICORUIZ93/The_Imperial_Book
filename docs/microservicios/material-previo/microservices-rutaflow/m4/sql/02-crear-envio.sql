-- M4 T2 · Crear un envío y su evento EnvioCreado en la MISMA transacción.
-- Uso: psql -v envio=E-1 -v peso=2.5 -f sql/02-crear-envio.sql
BEGIN;
INSERT INTO envios (id, cliente_id, peso_kg, zona) VALUES (:'envio', 'CL-9', :peso, 'Z03');
INSERT INTO outbox (agregado_id, tipo, payload)
VALUES (:'envio', 'EnvioCreado',
        jsonb_build_object('version', 1, 'envioId', :'envio', 'clienteId', 'CL-9', 'zona', 'Z03', 'pesoKg', :peso));
COMMIT;
