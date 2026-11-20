-- F046 · Fallo deliberado 2: un JOIN que cruza bases de datos no existe en PostgreSQL.
-- Ejecuta: psql "postgresql://svc_facturacion:facturacion@localhost:5432/facturacion_db" -f este-archivo
SELECT c.envio_id, c.total_cop, e.estado
FROM cargos c JOIN envios_db.public.envios e ON e.id = c.envio_id;
