import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptar } from './contrato.mjs';
test('v1 y v2 conservan unidades y significado', () => {
  assert.deepEqual(adaptar({ version: 1, distanciaMetros: 1200 }),
    adaptar({ version: 2, distanciaMetros: 1200 }));
});
test('no adivina valores ni versiones', () => {
  assert.throws(() => adaptar({ version: 3, distanciaMetros: 1200 }));
  assert.throws(() => adaptar({ version: 1, distanciaMetros: '1.2 km' }));
  assert.throws(() => adaptar({ version: 2, distanciaMetros: 0 }));
});
