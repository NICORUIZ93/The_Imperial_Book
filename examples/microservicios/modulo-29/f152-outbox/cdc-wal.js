// Módulo 25 · F152 · Lo que lee Debezium: el WAL de PostgreSQL decodificado (replicación lógica).
// Usa el plugin test_decoding (texto legible) en lugar de pgoutput (binario, el que usa Debezium).
// Requisitos: PostgreSQL con wal_level=logical (docker-compose.yml lo arranca así). Ejecuta: node f152-outbox/cdc-wal.js
import { crearPool } from '../comun/pg.js';
import { crearPedido, prepararEsquema } from './outbox.js';

const pool = crearPool();
await prepararEsquema(pool);
const slot = 'f152_demo';
await pool.query('SELECT pg_drop_replication_slot($1) FROM pg_replication_slots WHERE slot_name = $1', [slot]);
await pool.query("SELECT pg_create_logical_replication_slot($1, 'test_decoding')", [slot]);

await crearPedido(pool, { id: 'P-7', cliente: 'ana', total: 99000 });

// Cada transacción confirmada aparece completa entre BEGIN y COMMIT, en orden de commit.
const { rows } = await pool.query('SELECT data FROM pg_logical_slot_get_changes($1, NULL, NULL)', [slot]);
for (const { data } of rows) console.log(data.replace(/id\[uuid\]:'[0-9a-f-]+'/, "id[uuid]:'…'").replace(/creado_en\[timestamp with time zone\]:'[^']+'/, "creado_en[…]:'…'"));
await pool.query('SELECT pg_drop_replication_slot($1)', [slot]); // un slot olvidado retiene WAL y llena el disco
await pool.end();
