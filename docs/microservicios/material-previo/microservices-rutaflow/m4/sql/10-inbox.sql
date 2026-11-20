-- M4 T4 · Base del consumidor Notificaciones: tabla inbox y efecto (notificaciones enviadas).
DROP TABLE IF EXISTS inbox, notificaciones CASCADE;

CREATE TABLE inbox (
  consumidor   text NOT NULL,
  evento_id    uuid NOT NULL,
  procesado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (consumidor, evento_id)      -- un mismo evento, una vez por consumidor
);

CREATE TABLE notificaciones (
  id        bigserial PRIMARY KEY,
  envio_id  text NOT NULL,
  texto     text NOT NULL
);
