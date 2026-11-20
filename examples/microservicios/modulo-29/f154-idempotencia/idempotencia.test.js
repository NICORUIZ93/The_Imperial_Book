// Módulo 25 · F154 · Tests contra PostgreSQL real. Ejecuta: node --test f154-idempotencia/idempotencia.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, procesarUnaVez, sumarPuntos } from './idempotencia.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const puntos = async () => (await pool.query("SELECT puntos FROM f154_puntos WHERE cliente = 'ana'")).rows[0]?.puntos ?? 0;
const ev = { id: 'C-1', cliente: 'ana', puntos: 10 };

test('el mismo evento dos veces suma una sola vez', async () => {
  assert.equal(await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos), 'procesado');
  assert.equal(await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos), 'duplicado');
  assert.equal(await puntos(), 10);
});

test('cinco copias en paralelo: una procesada y cuatro duplicadas', async () => {
  const r = await Promise.all(Array.from({ length: 5 }, () => procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos)));
  assert.equal(r.filter((x) => x === 'procesado').length, 1);
  assert.equal(await puntos(), 10);
});

test('si el efecto falla, la marca se deshace y el reintento sí procesa', async () => {
  await assert.rejects(procesarUnaVez(pool, 'fidelidad', ev, async () => { throw new Error('BD de puntos caída'); }));
  assert.equal(await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos), 'procesado');
  assert.equal(await puntos(), 10);
});

test('otro grupo de consumidores procesa el mismo evento por su cuenta', async () => {
  await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos);
  assert.equal(await procesarUnaVez(pool, 'auditoria', ev, async () => {}), 'procesado');
});
