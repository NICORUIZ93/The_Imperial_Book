import test from 'node:test';
import assert from 'node:assert/strict';
import { saludo } from '../src/index.ts';

test('saludo retorna mensaje esperado', () => {
  assert.equal(saludo('estudiante'), 'Hola, estudiante. Proyecto Node listo.');
});
