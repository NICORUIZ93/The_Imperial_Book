// Test de JSON: ida y vuelta, errores de sintaxis y lo que JSON no puede representar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerPedido, escribirPedido } from './json.js';

test('parse convierte texto en objeto con sus tipos', () => {
  const { ok, datos } = leerPedido('{"cantidad":2,"pagado":false,"nota":null,"items":[]}');
  assert.equal(ok, true);
  assert.equal(typeof datos.cantidad, 'number');
  assert.equal(datos.pagado, false);
  assert.equal(datos.nota, null);
  assert.ok(Array.isArray(datos.items));
});

test('ida y vuelta: stringify y luego parse devuelve lo mismo', () => {
  const original = { cliente: 'Ana', items: [{ plato: 'Arepa', cantidad: 2 }] };
  assert.deepEqual(leerPedido(escribirPedido(original)).datos, original);
});

test('comillas simples o coma final -> error de sintaxis', () => {
  assert.equal(leerPedido("{'cliente':'Ana'}").ok, false);
  assert.equal(leerPedido('{"cliente":"Ana",}').ok, false);
});

test('JSON no guarda undefined ni funciones, y convierte fechas en texto', () => {
  const texto = JSON.stringify({ a: undefined, f() {}, fecha: new Date('2026-11-19T00:00:00Z') });
  assert.equal(texto, '{"fecha":"2026-11-19T00:00:00.000Z"}');
});
