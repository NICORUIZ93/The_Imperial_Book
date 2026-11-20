-- M5 T1 · Réplica del lado de Facturación: solo las columnas que necesita, alimentada por eventos de Envíos.
SET ROLE svc_facturacion;
CREATE TABLE IF NOT EXISTS facturacion.envios_replica (
  envio_id text PRIMARY KEY,
  estado   text NOT NULL,
  version  int  NOT NULL
);
-- Lo que haría el consumidor de EnvioEntregado v1 (con su inbox, M4 T4):
INSERT INTO facturacion.envios_replica VALUES ('E-1', 'ENTREGADO', 4), ('E-2', 'EN_TRANSITO', 2)
ON CONFLICT (envio_id) DO UPDATE SET estado = EXCLUDED.estado, version = EXCLUDED.version
WHERE facturacion.envios_replica.version < EXCLUDED.version;
-- Consulta local: cargos de envíos entregados, sin tocar el esquema de Envíos.
SELECT c.envio_id, c.total_cop, r.estado
FROM facturacion.cargos c JOIN facturacion.envios_replica r USING (envio_id)
WHERE r.estado = 'ENTREGADO';
RESET ROLE;
