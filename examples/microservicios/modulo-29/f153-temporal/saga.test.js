// Módulo 25 · F153 · Tests de la lógica de compensación (sin servidor). Ejecuta: node --test f153-temporal/saga.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ejecutarSaga } from './saga.js';

const registro = [];
const paso = (nombre, { falla = false, deshacerFalla = false } = {}) => ({
  nombre,
  hacer: async () => { if (falla) throw new Error(`${nombre} falló`); registro.push(`+${nombre}`); },
  deshacer: async () => { if (deshacerFalla) throw new Error('timeout'); registro.push(`-${nombre}`); },
});

test('todo bien: COMPLETADA y sin compensaciones', async () => {
  registro.length = 0;
  const r = await ejecutarSaga([paso('a'), paso('b'), paso('c')]);
  assert.equal(r.estado, 'COMPLETADA');
  assert.deepEqual(registro, ['+a', '+b', '+c']);
});

test('falla el tercer paso: se compensan los dos anteriores en orden inverso', async () => {
  registro.length = 0;
  const r = await ejecutarSaga([paso('a'), paso('b'), paso('c', { falla: true })]);
  assert.equal(r.estado, 'COMPENSADA');
  assert.equal(r.fallo, 'c: c falló');
  assert.deepEqual(registro, ['+a', '+b', '-b', '-a']);
});

test('el paso que falla NO se compensa (no llegó a hacerse)', async () => {
  registro.length = 0;
  await ejecutarSaga([paso('a', { falla: true })]);
  assert.deepEqual(registro, []);
});

test('una compensación que falla no impide las demás y queda reportada', async () => {
  registro.length = 0;
  const r = await ejecutarSaga([paso('a'), paso('b', { deshacerFalla: true }), paso('c', { falla: true })]);
  assert.deepEqual(r.compensadas, ['a']);
  assert.deepEqual(r.sinCompensar, ['b: timeout']);
});

test('con ActivityFailure, el motivo se toma de cause', async () => {
  const fallo = Object.assign(new Error('Activity task failed'), { cause: new Error('tarjeta rechazada') });
  const r = await ejecutarSaga([{ nombre: 'cobrar', hacer: async () => { throw fallo; } }]);
  assert.equal(r.fallo, 'cobrar: tarjeta rechazada');
});
