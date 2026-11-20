-- M5 T1 · Un esquema y un rol por servicio en la misma instancia de PostgreSQL.
-- Se puede ejecutar varias veces.
DROP SCHEMA IF EXISTS envios, facturacion CASCADE;
DROP ROLE IF EXISTS svc_envios;
DROP ROLE IF EXISTS svc_facturacion;

CREATE ROLE svc_envios NOLOGIN;
CREATE ROLE svc_facturacion NOLOGIN;

CREATE SCHEMA envios AUTHORIZATION svc_envios;
CREATE SCHEMA facturacion AUTHORIZATION svc_facturacion;

SET ROLE svc_envios;
CREATE TABLE envios.envios (
  id         text PRIMARY KEY,
  cliente_id text NOT NULL,
  zona       text NOT NULL,
  estado     text NOT NULL
);
INSERT INTO envios.envios VALUES ('E-1', 'CL-9', 'Z03', 'ENTREGADO'), ('E-2', 'CL-9', 'Z01', 'EN_TRANSITO');
RESET ROLE;

SET ROLE svc_facturacion;
CREATE TABLE facturacion.cargos (
  envio_id  text PRIMARY KEY,
  total_cop bigint NOT NULL
);
INSERT INTO facturacion.cargos VALUES ('E-1', 8126), ('E-2', 4980);
RESET ROLE;
