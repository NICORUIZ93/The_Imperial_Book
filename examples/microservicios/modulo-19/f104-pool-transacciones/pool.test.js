// Verificación F104: node --test f104-pool-transacciones/pool.test.js   (necesita PostgreSQL)
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearPool, medir } from './pool.js';
import { preparar, saldos, transferir } from './cuentas.js';

let pool;
let disponible = true;
before(async () => {
  pool = crearPool();
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`PostgreSQL no disponible (${error.code ?? error.name}): tests omitidos`);
  }
});
beforeEach(async () => { if (disponible) await preparar(pool); });
after(() => pool.end());

test('con max=5, 20 consultas de 100 ms tardan unas 4 tandas y nunca hay más de 5 conexiones', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const { ms, enFila, abiertas } = await medir(5);
  assert.equal(abiertas, 5);
  assert.equal(enFila, 15);
  assert.ok(ms >= 380 && ms < 1500, `tardó ${ms} ms`);
});

test('una transferencia válida hace COMMIT de los dos UPDATE', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await transferir(pool, 'ana', 'luis', 30);
  assert.deepEqual(await saldos(pool), { ana: 70, luis: 80 });
});

test('si el saldo quedaría negativo, ROLLBACK deja todo como estaba', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await assert.rejects(transferir(pool, 'ana', 'luis', 500), { code: '23514' }); // check_violation
  assert.deepEqual(await saldos(pool), { ana: 100, luis: 50 });
});

test('si falla el segundo paso, el primero también se deshace', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await assert.rejects(transferir(pool, 'ana', 'eva', 10), { message: 'La cuenta eva no existe' });
  assert.deepEqual(await saldos(pool), { ana: 100, luis: 50 });
});

test('después de 50 transferencias (la mitad fallidas) no queda ninguna conexión prestada', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const lote = Array.from({ length: 50 }, (_, i) => transferir(pool, 'ana', i % 2 ? 'luis' : 'eva', 1));
  const resultados = await Promise.allSettled(lote);
  assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 25);
  assert.deepEqual(await saldos(pool), { ana: 75, luis: 75 });
  assert.equal(pool.idleCount, pool.totalCount); // todas devueltas
  assert.equal(pool.waitingCount, 0);
});
