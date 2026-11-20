-- M4 T2 · Fallo deliberado: el INSERT del outbox falla dentro de la transacción.
-- Sin ON_ERROR_STOP, psql sigue ejecutando y COMMIT termina en ROLLBACK: tampoco queda el envío.
BEGIN;
INSERT INTO envios (id, cliente_id, peso_kg, zona) VALUES ('E-9', 'CL-9', 1, 'Z03');
INSERT INTO outbox (agregado_id, tipo, payload) VALUES ('E-9', 'EnvioCreado', '{"version":'::jsonb);
COMMIT;
SELECT count(*) AS envios_e9 FROM envios WHERE id = 'E-9';
