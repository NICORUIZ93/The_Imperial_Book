// Verificación F101 (parte 1, SIN base de datos): node --test f101-mongoose/modelo.test.js
// La validación de Mongoose ocurre en tu proceso, antes de hablar con MongoDB: por eso estos tests no necesitan Docker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Producto } from './modelo.js';

// validate() devuelve una promesa que se rechaza con ValidationError; aquí la convertimos en «el error o undefined».
const errorDe = (documento) => documento.validate().then(() => undefined, (error) => error);

const valido = { sku: ' tec-001 ', nombre: 'Teclado', precio: 120000, proveedor: { nombre: 'Andina' } };

test('un producto válido pasa la validación y recibe valores por defecto', async () => {
  const p = new Producto(valido);
  assert.equal(await errorDe(p), undefined);
  assert.equal(p.sku, 'TEC-001'); // trim + uppercase
  assert.equal(p.stock, 0);
  assert.deepEqual(p.etiquetas.toObject(), []);
  assert.equal(p.proveedor.pais, 'CO');
  assert.equal(p.agotado, true); // virtual
});

test('los errores de validación llegan agrupados por campo', async () => {
  const error = await errorDe(new Producto({ nombre: 'TV', precio: -1 }));
  assert.equal(error.name, 'ValidationError');
  assert.deepEqual(Object.keys(error.errors).sort(), ['nombre', 'precio', 'proveedor.nombre', 'sku']);
  assert.equal(error.errors.precio.message, 'El precio no puede ser negativo');
  assert.equal(error.errors.nombre.kind, 'minlength');
});

test('un texto donde va un número produce un CastError', async () => {
  const error = await errorDe(new Producto({ ...valido, precio: 'gratis' }));
  assert.equal(error.errors.precio.name, 'CastError');
});

test("strict: 'throw' rechaza campos que no están en el esquema", () => {
  assert.throws(() => new Producto({ ...valido, esAdmin: true }), { name: 'StrictModeError' });
});
