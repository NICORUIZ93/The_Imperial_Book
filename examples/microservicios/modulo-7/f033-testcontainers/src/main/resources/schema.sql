CREATE TABLE IF NOT EXISTS cliente (
    email   TEXT PRIMARY KEY,
    nombre  TEXT NOT NULL,
    visitas INT  NOT NULL DEFAULT 1
);
