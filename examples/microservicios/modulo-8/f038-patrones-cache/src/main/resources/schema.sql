DROP TABLE IF EXISTS producto;
CREATE TABLE producto (id BIGINT PRIMARY KEY, nombre TEXT NOT NULL, precio INT NOT NULL);
INSERT INTO producto VALUES (1, 'Teclado', 100), (2, 'Ratón', 50);
