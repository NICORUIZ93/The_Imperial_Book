-- M4 T3 · Lee los cambios del slot que tocan la tabla outbox.
-- Sin variables: peek (mira sin avanzar el slot). Con -v consumir=1: get (consume y avanza el slot).
\if :{?consumir}
SELECT lsn, xid, data
FROM pg_logical_slot_get_changes('rutaflow_outbox', NULL, NULL)
WHERE data LIKE 'table public.outbox:%';
\else
SELECT lsn, xid, data
FROM pg_logical_slot_peek_changes('rutaflow_outbox', NULL, NULL)
WHERE data LIKE 'table public.outbox:%';
\endif
