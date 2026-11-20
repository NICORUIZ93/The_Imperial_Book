// Módulo 25 · F152 · Tests contra PostgreSQL real. Ejecuta: node --test f152-outbox/outbox.test.js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { crearPedido, prepararEsquema, publicarPendientes } from './outbox.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const contar = async (tabla) => (await pool.query(`SELECT count(*)::int AS n FROM ${tabla}`)).rows[0].n;

test('el pedido y su evento se guardan juntos', async () => {
  await crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 100 });
  assert.equal(await contar('f152_pedidos'), 1);
  assert.equal(await contar('f152_outbox'), 1);
});

test('si el pedido falla, el evento tampoco queda (misma transacción)', async () => {
  await assert.rejects(crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 0 }), /check constraint/);
  assert.equal(await contar('f152_outbox'), 0);
});

test('si publicar falla, la fila sigue pendiente y se publica en el siguiente intento', async () => {
  await crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 100 });
  await assert.rejects(publicarPendientes(pool, async () => { throw new Error('broker caído'); }));
  const recibidos = [];
  assert.equal(await publicarPendientes(pool, async (m) => recibidos.push(m.key)), 1);
  assert.deepEqual(recibidos, ['P-1']);
});

test('dos relays a la vez no publican la misma fila (FOR UPDATE SKIP LOCKED)', async () => {
  for (let i = 1; i <= 20; i++) await crearPedido(pool, { id: `P-${i}`, cliente: 'ana', total: i });
  const vistos = [];
  const lento = async (m) => { vistos.push(m.key); await new Promise((r) => setTimeout(r, 5)); };
  const [a, b] = await Promise.all([publicarPendientes(pool, lento, { lote: 10 }), publicarPendientes(pool, lento, { lote: 10 })]);
  assert.equal(a + b, 20);
  assert.equal(new Set(vistos).size, 20);
});

test('el conector de Debezium usa pgoutput, la tabla outbox y el EventRouter', async () => {
  const { config } = JSON.parse(await readFile(new URL('./debezium/conector-outbox.json', import.meta.url), 'utf8'));
  assert.equal(config['connector.class'], 'io.debezium.connector.postgresql.PostgresConnector');
  assert.equal(config['plugin.name'], 'pgoutput'); // el valor por defecto es decoderbufs, que la imagen oficial de postgres no trae
  assert.equal(config['table.include.list'], 'public.f152_outbox');
  assert.equal(config['transforms.outbox.type'], 'io.debezium.transforms.outbox.EventRouter');
});
