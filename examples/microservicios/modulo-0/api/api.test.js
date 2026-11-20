// Test del contrato de la API: si alguien cambia el "menú" sin avisar, este test falla.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearApi } from './api.js';

let servidor;
let base;

before(async () => {
  servidor = crearApi().listen(0);
  await new Promise((listo) => servidor.once('listening', listo));
  base = `http://localhost:${servidor.address().port}`;
});
after(() => servidor.close());

test('GET /api/menu devuelve 3 platos en JSON', async () => {
  const r = await fetch(`${base}/api/menu`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /application\/json/);
  const platos = await r.json();
  assert.equal(platos.length, 3);
  assert.deepEqual(Object.keys(platos[0]), ['id', 'nombre', 'precio']);
});

test('GET /api/menu/99 responde 404', async () => {
  const r = await fetch(`${base}/api/menu/99`);
  assert.equal(r.status, 404);
});

test('POST /api/pedidos calcula el total y responde 201', async () => {
  const r = await fetch(`${base}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platoId: 2, cantidad: 3 }),
  });
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { plato: 'Empanada', cantidad: 3, total: 9000 });
});

test('POST /api/pedidos con cantidad inválida responde 400', async () => {
  const r = await fetch(`${base}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platoId: 2, cantidad: 0 }),
  });
  assert.equal(r.status, 400);
});
