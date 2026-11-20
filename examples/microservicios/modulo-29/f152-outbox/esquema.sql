-- Módulo 25 · F152 · Tablas del servicio de pedidos con su outbox (PostgreSQL 18.7; probado también en 16).
-- Las columnas de outbox son las que espera por defecto el Outbox Event Router de Debezium 3.7.
CREATE TABLE IF NOT EXISTS f152_pedidos (
  id      text PRIMARY KEY,
  cliente text NOT NULL,
  total   integer NOT NULL CHECK (total > 0)
);
CREATE TABLE IF NOT EXISTS f152_outbox (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregatetype varchar(255) NOT NULL,   -- decide el topic: outbox.event.<aggregatetype>
  aggregateid   varchar(255) NOT NULL,   -- clave del mensaje en Kafka (orden por pedido)
  type          varchar(255) NOT NULL,   -- tipo de evento: PedidoCreado
  payload       jsonb,
  creado_en     timestamptz NOT NULL DEFAULT clock_timestamp(),
  publicado_en  timestamptz              -- solo lo usa el relay por sondeo; Debezium lo ignora
);
