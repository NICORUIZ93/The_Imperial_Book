-- M4 T4 · Fallo deliberado: aplica el efecto y registra el inbox en transacciones separadas.
-- Con -v caer=1 el script se detiene entre las dos, como un proceso que muere.
-- Uso: psql -v evento=<uuid> -v envio=E-1 [-v caer=1] -f sql/12-procesar-mal.sql
\set ON_ERROR_STOP on
SELECT count(*) > 0 AS ya_procesado FROM inbox WHERE consumidor = 'notificaciones' AND evento_id = :'evento' \gset
\if :ya_procesado
  \echo evento :evento ya procesado: se ignora
  \quit
\endif
INSERT INTO notificaciones (envio_id, texto) VALUES (:'envio', 'Tu envio ' || :'envio' || ' fue creado');
\if :{?caer}
  \echo el proceso murio despues del efecto y antes de registrar el inbox
  \quit
\endif
INSERT INTO inbox (consumidor, evento_id) VALUES ('notificaciones', :'evento');
