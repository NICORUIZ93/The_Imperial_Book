-- M5 T1 · Fallo deliberado: Facturación intenta unir sus cargos con la tabla de Envíos.
SET ROLE svc_facturacion;
SELECT c.envio_id, c.total_cop, e.estado
FROM facturacion.cargos c JOIN envios.envios e ON e.id = c.envio_id;
RESET ROLE;
