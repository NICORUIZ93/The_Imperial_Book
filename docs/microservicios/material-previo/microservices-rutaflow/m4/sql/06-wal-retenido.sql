-- M4 T3 · Cuánto WAL retiene el slot y cuánto falta por confirmar.
-- restart_lsn: desde dónde debe conservarse el WAL. confirmed_flush_lsn: hasta dónde confirmó el consumidor.
SELECT slot_name, active,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS wal_retenido,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) AS sin_confirmar
FROM pg_replication_slots;
