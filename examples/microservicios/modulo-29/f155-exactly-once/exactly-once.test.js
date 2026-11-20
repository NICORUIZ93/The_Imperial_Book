// Módulo 25 · F155 · Tests contra PostgreSQL real. Ejecuta: node --test f155-exactly-once/exactly-once.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { consumir, depositar, leerOffset, prepararEsquema } from './offsets-en-bd.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const pos = { consumidor: 'saldos', topic: 't', particion: 0 };
const particion = [0, 1, 2, 3, 4].map((offset) => ({ offset, valor: { cuenta: 'A', monto: 100 } }));
const saldo = async () => Number((await pool.query("SELECT saldo FROM f155_saldos WHERE cuenta = 'A'")).rows[0]?.saldo ?? 0);

test('sin fallos: 5 depósitos y el offset queda en 5', async () => {
  await consumir(pool, pos, particion, depositar);
  assert.equal(await saldo(), 500);
  assert.equal(await leerOffset(pool, pos), 5);
});

test('muere en el offset 2 antes del commit: al reiniciar retoma en 2 y el saldo es exacto', async () => {
  await assert.rejects(consumir(pool, pos, particion, depositar, { morirEn: 2 }), /offset 2/);
  assert.equal(await saldo(), 200);
  assert.equal(await consumir(pool, pos, particion, depositar), 2);
  assert.equal(await saldo(), 500);
});

test('volver a entregar la partición entera no cambia nada (todo está por debajo del offset)', async () => {
  await consumir(pool, pos, particion, depositar);
  await consumir(pool, pos, particion, depositar);
  assert.equal(await saldo(), 500);
});
