-- Módulo 15 (modulo-19) · Se ejecuta UNA vez, como el superusuario «tienda», al crear el contenedor de PostgreSQL.
-- F102 y F104 usan una base propia cada una; F103 crea DOS bases con DOS usuarios que no pueden cruzarse.
CREATE DATABASE f102;
CREATE DATABASE f104;

CREATE ROLE pedidos_app    LOGIN PASSWORD 'pedidos';
CREATE ROLE inventario_app LOGIN PASSWORD 'inventario';
CREATE DATABASE pedidos_db    OWNER pedidos_app;
CREATE DATABASE inventario_db OWNER inventario_app;
-- Por defecto cualquier rol puede conectarse a cualquier base (privilegio CONNECT de PUBLIC). Lo quitamos:
REVOKE CONNECT ON DATABASE pedidos_db    FROM PUBLIC;
REVOKE CONNECT ON DATABASE inventario_db FROM PUBLIC;
