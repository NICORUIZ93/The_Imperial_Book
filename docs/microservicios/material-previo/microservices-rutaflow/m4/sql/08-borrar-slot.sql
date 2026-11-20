-- M4 T3 · Un slot sin consumidor retiene WAL sin límite (salvo max_slot_wal_keep_size). Bórralo al terminar.
SELECT pg_drop_replication_slot('rutaflow_outbox');
