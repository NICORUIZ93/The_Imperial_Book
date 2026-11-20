// Test del programa: comprueba que las instrucciones dan el resultado esperado.
// Ejecuta: node --test programa/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotal, alcanzaElDinero } from './receta.js';

test('suma los precios de la lista', () => {
  assert.equal(calcularTotal([{ precio: 4500 }, { precio: 12000 }, { precio: 3500 }]), 20000);
});

test('una lista vacía cuesta 0', () => {
  assert.equal(calcularTotal([]), 0);
});

test('alcanza cuando el total es igual al dinero', () => {
  assert.equal(alcanzaElDinero(20000, 20000), true);
  assert.equal(alcanzaElDinero(20001, 20000), false);
});
