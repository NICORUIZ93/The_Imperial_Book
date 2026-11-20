// Test de tienda.js con el corredor de tests que trae Node (node:test). Mismos casos que TiendaTest.java.
// Ejecuta (desde la carpeta node/):  node --test tienda.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotal, total, envio } from './tienda.js';

const carrito = [
  { nombre: 'Cuaderno', precio: 6000, cantidad: 3 },
  { nombre: 'Lápiz', precio: 1500, cantidad: 4 },
  { nombre: 'Mochila', precio: 32000, cantidad: 1 },
];

test('subtotal de 3 cuadernos', () => assert.equal(subtotal(carrito[0]), 18000));
test('total del carrito', () => assert.equal(total(carrito), 56000));
test('carrito vacío suma 0', () => assert.equal(total([]), 0));
test('envío gratis desde 50000', () => assert.equal(envio(50000), 'gratis'));
test('envío con costo bajo 50000', () => assert.equal(envio(49999), '5000'));
