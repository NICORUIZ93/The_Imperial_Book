// Módulo 25 · F152 · Outbox Pattern: el pedido y su evento se guardan en la MISMA transacción local.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7 (docker-compose.yml).
import { readFile } from 'node:fs/promises';
import { enTransaccion } from '../comun/pg.js';

export async function prepararEsquema(pool) {
  await pool.query(await readFile(new URL('./esquema.sql', import.meta.url), 'utf8'));
  await pool.query('TRUNCATE f152_pedidos, f152_outbox');
}

// Caso de uso: crear un pedido. O se guardan las dos filas o ninguna (atomicidad de PostgreSQL).
export function crearPedido(pool, { id, cliente, total }) {
  return enTransaccion(pool, async (tx) => {
    await tx.query('INSERT INTO f152_pedidos (id, cliente, total) VALUES ($1, $2, $3)', [id, cliente, total]);
    await tx.query(
      `INSERT INTO f152_outbox (aggregatetype, aggregateid, type, payload)
       VALUES ('pedido', $1, 'PedidoCreado', $2)`,
      [id, { pedidoId: id, cliente, total }],
    );
  });
}

// Relay por sondeo (la alternativa sin Debezium): toma un lote, lo publica y lo marca, todo en una transacción.
// FOR UPDATE SKIP LOCKED deja que varias réplicas del relay trabajen a la vez sin tomar las mismas filas.
export function publicarPendientes(pool, publicar, { lote = 100 } = {}) {
  return enTransaccion(pool, async (tx) => {
    const { rows } = await tx.query(
      `SELECT id, aggregatetype, aggregateid, type, payload FROM f152_outbox
       WHERE publicado_en IS NULL ORDER BY creado_en LIMIT $1 FOR UPDATE SKIP LOCKED`,
      [lote],
    );
    for (const fila of rows) {
      // Si publicar() lanza, el ROLLBACK deja la fila pendiente y se reintenta en la próxima vuelta.
      await publicar({ topic: `outbox.event.${fila.aggregatetype}`, key: fila.aggregateid, id: fila.id, type: fila.type, payload: fila.payload });
      await tx.query('UPDATE f152_outbox SET publicado_en = clock_timestamp() WHERE id = $1', [fila.id]);
    }
    return rows.length;
  });
}
