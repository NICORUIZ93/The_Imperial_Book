-- F046 · Database-per-service: una base de datos y un usuario por servicio en la misma instancia de PostgreSQL.
-- Docker Compose lo ejecuta al crear el contenedor (docker-entrypoint-initdb.d). También: psql -f este-archivo
DROP DATABASE IF EXISTS envios_db;
DROP DATABASE IF EXISTS facturacion_db;
DROP ROLE IF EXISTS svc_envios;
DROP ROLE IF EXISTS svc_facturacion;

CREATE ROLE svc_envios LOGIN PASSWORD 'envios';
CREATE ROLE svc_facturacion LOGIN PASSWORD 'facturacion';

-- Cada base pertenece a su servicio; nadie más puede ni siquiera conectarse.
CREATE DATABASE envios_db OWNER svc_envios;
CREATE DATABASE facturacion_db OWNER svc_facturacion;
REVOKE CONNECT ON DATABASE envios_db FROM PUBLIC;
REVOKE CONNECT ON DATABASE facturacion_db FROM PUBLIC;

\connect envios_db svc_envios
CREATE TABLE envios (
  id         text PRIMARY KEY,
  cliente_id text NOT NULL,
  estado     text NOT NULL
);
INSERT INTO envios VALUES ('E-1', 'CL-9', 'ENTREGADO'), ('E-2', 'CL-9', 'EN_TRANSITO');

\connect facturacion_db svc_facturacion
CREATE TABLE cargos (
  envio_id  text PRIMARY KEY,
  total_cop bigint NOT NULL
);
-- Copia local de lo que Facturación necesita saber de Envíos, alimentada por eventos (Módulo 6).
CREATE TABLE envios_conocidos (
  envio_id text PRIMARY KEY,
  estado   text NOT NULL
);
INSERT INTO cargos VALUES ('E-1', 8126), ('E-2', 4980);
INSERT INTO envios_conocidos VALUES ('E-1', 'ENTREGADO'), ('E-2', 'EN_TRANSITO');
