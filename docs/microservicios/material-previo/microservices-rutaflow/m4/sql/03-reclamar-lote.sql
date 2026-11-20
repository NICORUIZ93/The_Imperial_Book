-- M4 T2 · Polling publisher: reclama hasta 2 mensajes pendientes sin esperar a otro relay.
-- La transacción queda abierta :espera segundos para simular el envío al broker.
-- Uso: psql -v relay=A -v espera=3 -f sql/03-reclamar-lote.sql
--      psql -v relay=B -v espera=0 -v bloqueo= -f sql/03-reclamar-lote.sql   (fallo: sin SKIP LOCKED)
\if :{?bloqueo}
\else
  \set bloqueo 'SKIP LOCKED'
\endif
\set QUIET on
BEGIN;
-- FOR UPDATE bloquea las filas elegidas; SKIP LOCKED salta las que otro relay ya bloqueó.
SELECT coalesce(string_agg(id::text, ',' ORDER BY id), '') AS ids
FROM (SELECT id FROM outbox
      WHERE publicado_en IS NULL
      ORDER BY id
      LIMIT 2
      FOR UPDATE :bloqueo) AS lote
\gset
\echo relay :relay reclamo ids=[:ids] a las `date +%T`
\o /dev/null
SELECT pg_sleep(:espera);
\o
-- Se marca como publicado SOLO después de que el broker confirmó (aquí, después de la espera).
UPDATE outbox SET publicado_en = now()
WHERE id = ANY (string_to_array(:'ids', ',')::bigint[]);
COMMIT;
\echo relay :relay confirmo ids=[:ids] a las `date +%T`
