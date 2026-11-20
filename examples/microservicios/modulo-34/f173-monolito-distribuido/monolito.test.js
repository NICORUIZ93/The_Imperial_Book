// Módulo 30 · F173 · Tests con servidores HTTP reales. Ejecuta: node --test f173-monolito-distribuido/monolito.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { obtener } from '../comun/http.js';
import { crearSistema, diagnosticar, disponibilidadCompuesta } from './sistema.js';

const ruta = '/pedidos/simular?sku=TEC-1&cantidad=2';

test('con los 4 servicios arriba el pedido se calcula', async () => {
  const s = await crearSistema();
  assert.deepEqual(await obtener(s.pedidos.url + ruta), { sku: 'TEC-1', cantidad: 2, total: 238 });
  await s.cerrar();
});

test('la caída de un servicio a dos saltos tumba a pedidos (fallo en cascada)', async () => {
  const s = await crearSistema();
  await s.impuestos.cerrar();
  await assert.rejects(obtener(s.pedidos.url + ruta), /precios: \/impuestos\/TEC-1 → ECONNREFUSED/);
  await s.cerrar();
});

test('renombrar un campo en precios rompe en silencio a pedidos (despliegue en bloque)', async () => {
  const s = await crearSistema({ versionPrecios: 2 });
  assert.equal((await obtener(s.pedidos.url + ruta)).total, null);
  await s.cerrar();
});

test('la disponibilidad en cadena es el producto', () => {
  assert.equal(disponibilidadCompuesta([0.99, 0.99]).toFixed(4), '0.9801');
});

test('el diagnóstico distingue monolito distribuido de servicios independientes', () => {
  const malo = diagnosticar({ servicios: [{ nombre: 'a', bd: 'x', llama: ['b'] }, { nombre: 'b', bd: 'x', llama: [] }], despliegues: [['a', 'b']] });
  assert.equal(malo.veredicto, 'monolito distribuido');
  const bueno = diagnosticar({ servicios: [{ nombre: 'a', bd: 'a', llama: [] }, { nombre: 'b', bd: 'b', llama: [] }], despliegues: [['a'], ['b']] });
  assert.deepEqual(bueno, { sintomas: [], veredicto: 'servicios independientes' });
});
