// Verificación F089: node --test f089-es6/pedidos.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotal, buscarCliente, nombresEnSerie, nombresEnParalelo, informe, conCiudad } from './pedidos.js';

test('destructuring con valor por defecto calcula el total con IVA', () => {
  assert.equal(calcularTotal({ items: [{ precio: 10000, cantidad: 2 }, { precio: 5000, cantidad: 1 }], descuento: 0.1 }), 26775);
  assert.equal(calcularTotal({ items: [{ precio: 100, cantidad: 1 }] }), 119); // descuento = 0 por defecto
});

test('una promesa rechazada se captura con assert.rejects (o try/catch)', async () => {
  await assert.rejects(buscarCliente('zz', 1), { message: 'Cliente zz no existe' });
});

test('Promise.all en paralelo tarda como la llamada más lenta, no como la suma', async () => {
  let t = performance.now();
  assert.deepEqual(await nombresEnSerie(['c1', 'c2', 'c1']), ['Ana', 'Luis', 'Ana']);
  const serie = performance.now() - t;
  t = performance.now();
  assert.deepEqual(await nombresEnParalelo(['c1', 'c2', 'c1']), ['Ana', 'Luis', 'Ana']);
  const paralelo = performance.now() - t;
  assert.ok(serie >= 290, `en serie tardó ${serie} ms`);
  assert.ok(paralelo < serie - 100, `en paralelo tardó ${paralelo} ms y en serie ${serie} ms`);
});

test('Promise.allSettled informa cada resultado sin rechazarse', async () => {
  assert.deepEqual(await informe(['c1', 'zz']), ['c1: Ana', 'zz: ERROR Cliente zz no existe']);
});

test('rest y spread copian sin mutar el original', () => {
  const original = { id: 'c1', nombre: 'Ana', ciudad: 'Bogotá' };
  const copia = conCiudad(original, 'Cali');
  assert.deepEqual(copia, { id: 'c1', nombre: 'Ana', ciudad: 'Cali' });
  assert.equal(original.ciudad, 'Bogotá');
});
