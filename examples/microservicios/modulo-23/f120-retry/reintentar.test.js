// Módulo 19 · F120 · Tests de los reintentos (sin red). Ejecuta: node --test f120-retry/reintentar.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ErrorNoReintentable, esperaMs, reintentar } from './reintentar.js';

const rapido = { baseMs: 1, maxMs: 4 };

test('reintenta hasta que la función tiene éxito', async () => {
  const vistos = [];
  const resultado = await reintentar(async (intento) => {
    vistos.push(intento);
    if (intento < 3) throw new Error('503');
    return 'ok';
  }, { ...rapido, intentos: 5 });
  assert.equal(resultado, 'ok');
  assert.deepEqual(vistos, [1, 2, 3]);
});

test('se rinde tras `intentos` y lanza el último error', async () => {
  let llamadas = 0;
  await assert.rejects(reintentar(async () => { llamadas += 1; throw new Error(`fallo ${llamadas}`); }, { ...rapido, intentos: 3 }), /fallo 3/);
  assert.equal(llamadas, 3);
});

test('no reintenta un error no reintentable (4xx)', async () => {
  let llamadas = 0;
  await assert.rejects(reintentar(async () => { llamadas += 1; throw new ErrorNoReintentable('HTTP 400'); }, rapido), ErrorNoReintentable);
  assert.equal(llamadas, 1);
});

test('la espera crece de forma exponencial con tope, y el jitter completo queda entre 0 y ese tope', () => {
  const sin = [1, 2, 3, 4, 5, 6, 7].map((i) => esperaMs(i, { baseMs: 100, maxMs: 2000, jitter: 'ninguno' }));
  assert.deepEqual(sin, [100, 200, 400, 800, 1600, 2000, 2000]);
  for (let i = 1; i <= 7; i += 1) {
    for (let k = 0; k < 200; k += 1) {
      const espera = esperaMs(i, { baseMs: 100, maxMs: 2000, jitter: 'completo' });
      assert.ok(espera >= 0 && espera <= sin[i - 1], `intento ${i}: ${espera}`);
    }
  }
  assert.equal(esperaMs(3, { baseMs: 100, jitter: 'igual', aleatorio: () => 0 }), 200); // mitad fija de 400
});

test('respeta Retry-After (error.retryAfterMs) por encima del backoff', async () => {
  const esperas = [];
  await reintentar(async (intento) => {
    if (intento === 1) throw Object.assign(new Error('HTTP 503'), { retryAfterMs: 30 });
    return 'ok';
  }, { baseMs: 1000, alReintentar: ({ espera }) => esperas.push(espera) });
  assert.deepEqual(esperas, [30]);
});

test('una señal abortada corta la espera entre reintentos', async () => {
  const control = new AbortController();
  setTimeout(() => control.abort(), 20);
  const inicio = performance.now();
  await assert.rejects(reintentar(async () => { throw new Error('503'); }, { baseMs: 5000, jitter: 'ninguno', signal: control.signal }), { name: 'AbortError' });
  assert.ok(performance.now() - inicio < 1000);
});
