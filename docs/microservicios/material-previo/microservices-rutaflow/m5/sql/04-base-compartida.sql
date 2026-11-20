-- M5 T1 · Antipatrón: base compartida. Facturación recibe permiso de lectura sobre Envíos...
GRANT USAGE ON SCHEMA envios TO svc_facturacion;
GRANT SELECT ON envios.envios TO svc_facturacion;

SET ROLE svc_facturacion;
SELECT c.envio_id, c.total_cop, e.estado
FROM facturacion.cargos c JOIN envios.envios e ON e.id = c.envio_id ORDER BY 1;
RESET ROLE;

-- ...y Envíos hace un cambio interno legítimo en su propia tabla:
SET ROLE svc_envios;
ALTER TABLE envios.envios RENAME COLUMN estado TO estado_logistico;
RESET ROLE;

-- La misma consulta de Facturación, sin que nadie la haya tocado:
SET ROLE svc_facturacion;
SELECT c.envio_id, c.total_cop, e.estado
FROM facturacion.cargos c JOIN envios.envios e ON e.id = c.envio_id ORDER BY 1;
RESET ROLE;
