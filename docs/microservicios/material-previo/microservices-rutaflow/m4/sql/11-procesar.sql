-- M4 T4 · Consumidor idempotente: registra el evento en inbox y aplica el efecto en la MISMA transacción.
-- Si el evento ya estaba en inbox, el INSERT no devuelve filas y el efecto no se aplica.
-- Uso: psql -v evento=<uuid> -v envio=E-1 -f sql/11-procesar.sql
BEGIN;
WITH nuevo AS (
  INSERT INTO inbox (consumidor, evento_id) VALUES ('notificaciones', :'evento')
  ON CONFLICT DO NOTHING
  RETURNING evento_id
)
INSERT INTO notificaciones (envio_id, texto)
SELECT :'envio', 'Tu envio ' || :'envio' || ' fue creado' FROM nuevo;
COMMIT;
