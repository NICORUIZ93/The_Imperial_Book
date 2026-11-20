// Verificación F101 (parte 2, CON MongoDB): node --test f101-mongoose/repositorio.test.js
// Necesita `docker compose up -d --wait`. Si MongoDB no responde, los tests se marcan como omitidos (skip);
// con EXIGIR_INFRA=1 (lo pone ./verificar.sh --compose) la falta de MongoDB es un fallo.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MONGO_URL } from '../config.js';
import { Producto } from './modelo.js';
import { crear, porEtiqueta, descontarStock, vaciar } from './repositorio.js';

let disponible = true;
before(async () => {
  try {
    // Base aparte para no pisar los datos de la demo.
    await mongoose.connect(MONGO_URL, { dbName: 'tienda_test', serverSelectionTimeoutMS: 2000 });
    await Producto.init();
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`MongoDB no disponible (${error.name}): tests omitidos`);
  }
});
beforeEach(async () => { if (disponible) await vaciar(); });
after(() => mongoose.disconnect());

const teclado = { sku: 'tec-001', nombre: 'Teclado', precio: 120000, stock: 3, etiquetas: ['oficina'], proveedor: { nombre: 'Andina' } };

test('crear guarda el documento con _id y fechas', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  const p = await crear(teclado);
  assert.ok(mongoose.isValidObjectId(p._id));
  assert.ok(p.createdAt instanceof Date);
  assert.equal(await Producto.countDocuments(), 1);
});

test('porEtiqueta filtra, ordena por precio y proyecta solo tres campos', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  await crear(teclado);
  await crear({ ...teclado, sku: 'mou-001', nombre: 'Mouse', precio: 50000 });
  await crear({ ...teclado, sku: 'sil-001', nombre: 'Silla', precio: 800000 });
  assert.deepEqual(await porEtiqueta('oficina', 200000), [
    { sku: 'MOU-001', nombre: 'Mouse', precio: 50000 },
    { sku: 'TEC-001', nombre: 'Teclado', precio: 120000 },
  ]);
});

test('el índice único rechaza un sku repetido con el código 11000', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  await crear(teclado);
  await assert.rejects(crear(teclado), { code: 11000 });
});

test('descontarStock es atómico: 5 compras simultáneas de 1 unidad con stock 3 → solo 3 lo logran', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  await crear(teclado);
  const resultados = await Promise.all([1, 2, 3, 4, 5].map(() => descontarStock('TEC-001', 1)));
  assert.equal(resultados.filter((r) => r !== null).length, 3);
  assert.equal((await Producto.findOne({ sku: 'TEC-001' }).lean()).stock, 0);
});
