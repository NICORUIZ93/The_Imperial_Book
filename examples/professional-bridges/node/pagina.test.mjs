import test from 'node:test';
import assert from 'node:assert/strict';
import { pagina } from './pagina.mjs';
const rows = [1, 2, 3, 4, 5].map(id => ({ id }));
test('recorre sin repetir y termina', () => {
  const first = pagina(rows);
  const second = pagina(rows, first.next);
  assert.deepEqual(first.items.map(x => x.id), [1, 2]);
  assert.deepEqual(second.items.map(x => x.id), [3, 4]);
  assert.equal(pagina(rows, second.next).next, null);
});
test('rechaza límites y cursor inválidos', () => {
  assert.throws(() => pagina(rows, 0, 1000), RangeError);
  assert.throws(() => pagina(rows, -1, 2), RangeError);
});
