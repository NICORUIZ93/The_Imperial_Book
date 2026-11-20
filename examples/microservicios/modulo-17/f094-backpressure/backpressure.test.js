// Verificación F094: node --test f094-backpressure/backpressure.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finished } from 'node:stream/promises';
import { destinoLento, escribirSinRespetar, escribirRespetando, conPipeline } from './backpressure.js';

test('ignorar write() deja crecer el buffer hasta todo el lote', async () => {
  const destino = destinoLento();
  assert.equal(escribirSinRespetar(destino, 500), 500);
  await finished(destino);
});

test("esperar 'drain' mantiene el buffer en el highWaterMark (16)", async () => {
  const recibidos = [];
  const destino = destinoLento(recibidos);
  const { maxEnBuffer, pausas } = await escribirRespetando(destino, 500);
  await finished(destino);
  assert.ok(maxEnBuffer <= 16, `máximo ${maxEnBuffer}`);
  assert.ok(pausas > 0);
  assert.equal(recibidos.length, 500);
});

test('pipeline entrega todo en orden y transformado', async () => {
  const recibidos = [];
  assert.equal(await conPipeline(100, recibidos), 100);
  assert.deepEqual(recibidos.slice(0, 3), [0, 2, 4]);
});
