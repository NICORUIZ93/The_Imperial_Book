// Tests del algoritmo de cambio: casos normales, bordes y el caso donde el patrón "voraz" falla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularVuelto, darCambio, contarPiezas } from './cambio.js';

test('el vuelto es lo pagado menos el precio', () => {
  assert.equal(calcularVuelto(13700, 50000), 36300);
});

test('si pagan de menos, es un error', () => {
  assert.throws(() => calcularVuelto(13700, 10000), /Faltan 3700/);
});

test('36300 se entrega con 6 piezas', () => {
  const cambio = darCambio(36300);
  assert.deepEqual(cambio, { 20000: 1, 10000: 1, 5000: 1, 1000: 1, 200: 1, 100: 1 });
  assert.equal(contarPiezas(cambio), 6);
});

test('vuelto 0 no entrega piezas', () => {
  assert.deepEqual(darCambio(0), {});
});

test('la abstracción sirve con otras piezas (centavos de dólar)', () => {
  assert.deepEqual(darCambio(68, [25, 10, 5, 1]), { 25: 2, 10: 1, 5: 1, 1: 3 });
});

test('el patrón voraz no siempre da el mínimo: con piezas 1, 3 y 4, para 6 da 3 piezas y lo óptimo es 2', () => {
  assert.equal(contarPiezas(darCambio(6, [1, 3, 4])), 3); // 4 + 1 + 1; lo óptimo sería 3 + 3
});
