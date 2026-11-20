// Módulo 25 · F156 · Tests contra PostgreSQL real (max_prepared_transactions > 0). Ejecuta: node --test f156-2pc/dospc.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, saldos, transferir } from './coordinador.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const enDuda = async () => (await pool.query("SELECT gid FROM pg_prepared_xacts WHERE gid LIKE 'f156-%' ORDER BY gid")).rows.map((r) => r.gid);

test('los dos votan sí: se confirma en los dos', async () => {
  assert.equal(await transferir(pool, { gid: 'f156-a', monto: 300 }), 'confirmada');
  assert.deepEqual(await saldos(pool), { ana: 700, luis: 300 });
});

test('uno vota no: no cambia nada en ninguno', async () => {
  assert.match(await transferir(pool, { gid: 'f156-b', monto: 5000 }), /^abortada/);
  assert.deepEqual(await saldos(pool), { ana: 1000, luis: 0 });
  assert.deepEqual(await enDuda(), []);
});

test('coordinador caído tras preparar: quedan en duda y bloquean la fila', async () => {
  await transferir(pool, { gid: 'f156-c', monto: 200 }, { caerTrasPreparar: true });
  assert.deepEqual(await enDuda(), ['f156-c-a', 'f156-c-b']);
  const c = await pool.connect();
  await c.query("SET lock_timeout = '300ms'");
  await assert.rejects(c.query("UPDATE f156_banco_a SET saldo = 0 WHERE cuenta = 'ana'"), /lock timeout/);
  c.release();
  for (const gid of await enDuda()) await pool.query(`COMMIT PREPARED '${gid}'`);
  assert.deepEqual(await saldos(pool), { ana: 800, luis: 200 });
});
