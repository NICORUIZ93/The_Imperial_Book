// Verificación F092: node --test f092-perf/medir.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medirConMarcas, retrasoDelLoop, llamadasMedidas } from './medir.js';

test('performance.measure devuelve una duración positiva en milisegundos', () => {
  const ms = medirConMarcas(100_000);
  assert.ok(ms > 0 && ms < 5000, `duración ${ms}`);
});

test('monitorEventLoopDelay detecta un bloqueo de 200 ms', async () => {
  const sano = await retrasoDelLoop(0);
  const bloqueado = await retrasoDelLoop(200);
  assert.ok(bloqueado.maxMs >= 180, `bloqueado: ${bloqueado.maxMs} ms`);
  assert.ok(bloqueado.maxMs > sano.maxMs, `sano: ${sano.maxMs} ms`);
  assert.ok(bloqueado.utilizacion > sano.utilizacion);
});

test('timerify mide cada llamada a la función', async () => {
  assert.equal((await llamadasMedidas()).length, 2);
});

test('resumir-perfil ordena las funciones por tiempo propio', async () => {
  const { topFunciones } = await import('./resumir-perfil.js');
  const perfil = {
    nodes: [
      { id: 1, callFrame: { functionName: '(root)', url: '', lineNumber: -1 } },
      { id: 2, callFrame: { functionName: 'hashCaro', url: 'file:///x/servidor-lento.js', lineNumber: 9 } },
    ],
    samples: [2, 2, 2, 1],
  };
  assert.deepEqual(topFunciones(perfil, 1), [{ funcion: 'hashCaro servidor-lento.js:10', porcentaje: 75 }]);
});
