// Módulo 30 · F174 · Tests con servidores HTTP reales. Ejecuta: node --test f174-sobre-descomposicion/nano.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearNanoservicios, granularidad, p50, totalEnProceso } from './nano.js';

const pedido = { id: 'P-1', lineas: [{ sku: 'TEC-1', precio: 120000, cantidad: 1 }, { sku: 'MOU-1', precio: 45000, cantidad: 2 }] };

test('el cálculo en proceso da el total esperado', () => {
  // subtotal 210000 · descuento 21000 · IVA 35910 · envío 0 → 224910
  assert.equal(totalEnProceso(pedido).total, 224910);
});

test('los nanoservicios dan el mismo total con 4 llamadas HTTP por pedido', async () => {
  const nano = await crearNanoservicios();
  assert.equal((await nano.total(pedido)).total, 224910);
  assert.equal(nano.llamadas, 4);
  await nano.cerrar();
});

test('la red cuesta: los nanoservicios son al menos 10 veces más lentos', async () => {
  const nano = await crearNanoservicios();
  const local = await p50(async () => totalEnProceso(pedido), 50);
  const remoto = await p50(() => nano.total(pedido), 50);
  await nano.cerrar();
  assert.ok(remoto > local * 10, `local ${local} ms, remoto ${remoto} ms`);
});

test('granularidad: servicios que siempre cambian juntos son candidatos a fusionar', () => {
  const g = granularidad({ servicios: ['a', 'b', 'c'], desarrolladores: 2, cambios: [['a', 'b'], ['a', 'b'], ['c']] });
  assert.deepEqual(g, { serviciosPorPersona: 1.5, cambiosMultiServicio: '67 %', fusionar: ['a+b'] });
});
