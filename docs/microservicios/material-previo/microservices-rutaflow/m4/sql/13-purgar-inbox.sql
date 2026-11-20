-- M4 T4 · Purga del inbox: borra registros más viejos que :dias días.
-- La ventana debe superar el tiempo máximo en que el broker o el relay pueden reentregar un evento.
-- Uso: psql -v dias=14 -f sql/13-purgar-inbox.sql
DELETE FROM inbox WHERE procesado_en < now() - make_interval(days => :dias);
