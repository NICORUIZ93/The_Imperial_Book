// Tests de la lógica del cine: cada regla tiene un caso que la confirma y uno en el borde.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { puedeEntrar, precioBoleto, cobrarFila } from './cine.js';

test('sin boleto nadie entra, aunque sea adulto', () => {
  assert.equal(puedeEntrar(30, false, false), false);
});

test('un menor entra solo si va con un adulto', () => {
  assert.equal(puedeEntrar(15, true, false), false);
  assert.equal(puedeEntrar(15, true, true), true);
});

test('los bordes de edad caen en la tarifa correcta', () => {
  assert.equal(precioBoleto(11), 8000);
  assert.equal(precioBoleto(12), 12000);
  assert.equal(precioBoleto(59), 12000);
  assert.equal(precioBoleto(60), 7000);
});

test('la fila suma el precio de cada persona', () => {
  assert.equal(cobrarFila([8, 25, 67, 15]), 39000);
  assert.equal(cobrarFila([]), 0);
});

test('una edad negativa es un error, no un precio', () => {
  assert.throws(() => precioBoleto(-1), /negativa/);
});
