-- M4 T2 · Esquema del servicio Envíos con su tabla outbox.
-- Se puede ejecutar varias veces: borra y vuelve a crear las tablas del laboratorio.
DROP TABLE IF EXISTS outbox, envios CASCADE;

CREATE TABLE envios (
  id         text PRIMARY KEY,
  cliente_id text NOT NULL,
  peso_kg    numeric(8,2) NOT NULL CHECK (peso_kg > 0),
  zona       text NOT NULL,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outbox (
  id            bigserial PRIMARY KEY,          -- orden de inserción dentro de esta base
  evento_id     uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  agregado_id   text NOT NULL,
  tipo          text NOT NULL,
  payload       jsonb NOT NULL,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  publicado_en  timestamptz                      -- NULL = pendiente de publicar
);

-- El relay solo busca pendientes: índice parcial pequeño aunque la tabla crezca.
CREATE INDEX outbox_pendientes ON outbox (id) WHERE publicado_en IS NULL;
