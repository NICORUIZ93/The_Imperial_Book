// Módulo 26 · F157 · Tests sin infraestructura (avsc 5.7.9). Ejecuta: node --test f157-kafka-schema/schema.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { codificar, decodificar } from './formato.js';
import { compatible, tipos } from './esquemas.js';

test('campo nuevo con default: compatible en los dos sentidos (FULL)', () => {
  assert.equal(compatible('FULL', tipos.v2, tipos.v1), true);
});

test('campo nuevo sin default: rompe BACKWARD (consumidores nuevos no leen datos viejos)', () => {
  assert.equal(compatible('BACKWARD', tipos.v2SinDefault, tipos.v1), false);
  assert.equal(compatible('FORWARD', tipos.v2SinDefault, tipos.v1), true);
});

test('quitar un campo sin default: rompe FORWARD (consumidores viejos no leen datos nuevos)', () => {
  assert.equal(compatible('BACKWARD', tipos.v3SinTotal, tipos.v1), true);
  assert.equal(compatible('FORWARD', tipos.v3SinTotal, tipos.v1), false);
});

test('formato de cable: magic byte 0 y el id en big-endian', () => {
  const b = codificar(258, tipos.v1, { id: 'P-1', total: 1 });
  assert.deepEqual([...b.subarray(0, 5)], [0, 0, 0, 1, 2]);
});

test('ida y vuelta con resolución: escrito con v1, leído con v2', () => {
  const b = codificar(1, tipos.v1, { id: 'P-1', total: 5 });
  assert.deepEqual({ ...decodificar(b, () => tipos.v1, tipos.v2) }, { id: 'P-1', total: 5, moneda: 'COP' });
});
