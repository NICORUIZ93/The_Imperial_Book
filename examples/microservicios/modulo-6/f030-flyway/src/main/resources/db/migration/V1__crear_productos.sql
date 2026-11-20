-- V1: esquema inicial. Una vez aplicada en cualquier entorno, NUNCA se edita.
CREATE TABLE productos (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku     VARCHAR(20)    NOT NULL UNIQUE,
    nombre  VARCHAR(80)    NOT NULL,
    precio  NUMERIC(12, 2) NOT NULL CHECK (precio > 0)
);

INSERT INTO productos (sku, nombre, precio) VALUES
    ('CAF-1', 'Café de Huila 500 g', 32000),
    ('TAZ-3', 'Taza de cerámica', 18000);
