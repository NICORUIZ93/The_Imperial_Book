-- PostgreSQL 18: identity estándar SQL, TIMESTAMPTZ y collation sensible a mayúsculas y tildes.
CREATE TABLE productos (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku         VARCHAR(20) NOT NULL UNIQUE,
    nombre      VARCHAR(80) NOT NULL,
    stock       INTEGER     NOT NULL DEFAULT 0,
    actualizado TIMESTAMPTZ NOT NULL DEFAULT now()
);
