-- F046 · Lo correcto: Facturación responde con SUS datos (cargos + copia local alimentada por eventos).
-- Ejecuta: psql "postgresql://svc_facturacion:facturacion@localhost:5432/facturacion_db" -f este-archivo
SELECT c.envio_id, c.total_cop, e.estado
FROM cargos c JOIN envios_conocidos e USING (envio_id)
ORDER BY c.envio_id;
