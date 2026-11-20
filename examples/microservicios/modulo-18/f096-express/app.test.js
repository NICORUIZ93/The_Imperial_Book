// Verificación F096: node --test f096-express/app.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from './app.js';

let servidor, base;
const logs = [];
before(async () => {
  servidor = crearApp({ log: (l) => logs.push(l) }).listen(0);
  await new Promise((r) => servidor.once('listening', r));
  base = `http://localhost:${servidor.address().port}`;
});
after(() => servidor.close());

const json = (cuerpo, cabeceras = {}) => ({ method: 'POST', headers: { 'content-type': 'application/json', ...cabeceras }, body: cuerpo });

test('routing con parámetros y query string', async () => {
  const uno = await fetch(`${base}/productos/1`);
  assert.equal(uno.status, 200);
  assert.deepEqual(await uno.json(), { id: '1', nombre: 'Teclado', precio: 120000 });
  assert.equal((await (await fetch(`${base}/productos?max=0`)).json()).length, 0);
});

test('el middleware propaga x-request-id y registra cada petición', async () => {
  const r = await fetch(`${base}/salud`, { headers: { 'x-request-id': 'abc-123' } });
  assert.equal(r.headers.get('x-request-id'), 'abc-123');
  assert.ok(logs.some((l) => /^GET \/salud 200 \d+ms$/.test(l)), logs.join('\n'));
});

test('middleware de ruta: POST sin rol admin → 403 problem+json', async () => {
  const r = await fetch(`${base}/productos`, json('{"nombre":"Mouse","precio":50000}'));
  assert.equal(r.status, 403);
  assert.match(r.headers.get('content-type'), /application\/problem\+json/);
  assert.equal((await r.json()).detail, 'Se necesita el rol admin');
});

test('POST con rol admin → 201 con Location', async () => {
  const r = await fetch(`${base}/productos`, json('{"nombre":"Mouse","precio":50000}', { 'x-rol': 'admin' }));
  assert.equal(r.status, 201);
  assert.equal(r.headers.get('location'), '/productos/2');
});

test('error lanzado en un handler async llega al manejador de errores (404)', async () => {
  const r = await fetch(`${base}/productos/99`);
  assert.equal(r.status, 404);
  assert.equal((await r.json()).detail, 'No existe el producto 99');
});

test('JSON roto → 400 de express.json(); ruta desconocida → 404', async () => {
  assert.equal((await fetch(`${base}/productos`, json('{roto', { 'x-rol': 'admin' }))).status, 400);
  assert.equal((await fetch(`${base}/nada`)).status, 404);
});
