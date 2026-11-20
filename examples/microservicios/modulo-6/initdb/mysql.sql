-- MYSQL_DATABASE ya creó f031 y dio permisos a "tienda" sobre ella.
-- Base extra para practicar a mano en el mini-laboratorio de F031.
CREATE DATABASE IF NOT EXISTS practica CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON practica.* TO 'tienda'@'%';
