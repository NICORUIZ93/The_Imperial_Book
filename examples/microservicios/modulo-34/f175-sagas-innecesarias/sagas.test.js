// Módulo 30 · F175 · Tests con PostgreSQL real. Ejecuta: node --test f175-sagas-innecesarias/sagas.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { comprarConSaga, comprarConTransaccion, compensar, crearPool, estado, preparar } from './tienda.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => preparar(pool));
const pedido = (cliente) => ({ id: 'P-1', sku: 'TEC-1', cantidad: 2, cliente });

test('transacción: si el último paso falla, no queda NADA (ni stock reservado ni pedido)', async () => {
  await assert.rejects(comprarConTransaccion(pool, pedido('beto')), /cliente beto bloqueado/);
  assert.deepEqual(await estado(pool), { stock: 10, pedidos: {} });
});

test('transacción: el camino feliz confirma los tres cambios a la vez', async () => {
  await comprarConTransaccion(pool, pedido('ana'));
  assert.deepEqual(await estado(pool), { stock: 8, pedidos: { confirmado: 1 } });
});

test('saga: otro usuario ve el estado intermedio y queda un pedido cancelado', async () => {
  let intermedio;
  await assert.rejects(comprarConSaga(pool, pedido('beto'), { observar: async () => { intermedio = await estado(pool); } }));
  assert.deepEqual(intermedio, { stock: 8, pedidos: { pendiente: 1 } });
  assert.deepEqual(await estado(pool), { stock: 10, pedidos: { cancelado: 1 } });
});

test('saga: si el proceso muere al compensar, el stock queda perdido', async () => {
  await assert.rejects(comprarConSaga(pool, pedido('beto'), { fallarCompensacion: true }));
  assert.deepEqual(await estado(pool), { stock: 8, pedidos: { cancelado: 1 } });
});

test('compensación idempotente: repetirla no devuelve el stock dos veces', async () => {
  await assert.rejects(comprarConSaga(pool, pedido('beto')));
  await compensar(pool, pedido('beto')); // reintento tras un timeout
  assert.equal((await estado(pool)).stock, 10);
});
