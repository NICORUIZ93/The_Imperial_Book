// Verificación F091: node --test f091-event-loop/orden.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ordenDeEjecucion, retrasoDeUnTimer } from './orden.js';

test('síncrono → nextTick → microtasks → check → timers', async () => {
  const orden = (await ordenDeEjecucion()).map((linea) => linea.split(' ')[0]);
  assert.deepEqual(orden, ['1', '1b', '2', '3', '4', '5', '5b', '6']);
});

test('un bucle síncrono de 200 ms retrasa un setTimeout de 10 ms', async () => {
  const libre = await retrasoDeUnTimer(0);
  const bloqueado = await retrasoDeUnTimer(200);
  assert.ok(bloqueado >= 200, `bloqueado: ${bloqueado} ms`);
  assert.ok(bloqueado > libre, `libre: ${libre} ms, bloqueado: ${bloqueado} ms`);
});
