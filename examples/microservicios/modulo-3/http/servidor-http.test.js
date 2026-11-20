// Test de HTTP: cada caso comprueba un código de estado o una cabecera.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from './servidor-http.js';

let servidor;
let base;
before(async () => {
  servidor = crearServidor().listen(0);
  await new Promise((listo) => servidor.once('listening', listo));
  base = `http://localhost:${servidor.address().port}`;
});
after(() => servidor.close());

test('GET /saludo -> 200 con cabecera propia', async () => {
  const r = await fetch(`${base}/saludo`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('x-curso'), 'microservicios');
  assert.equal(await r.text(), 'Hola\n');
});

test('la cabecera Accept-Language cambia la respuesta', async () => {
  const r = await fetch(`${base}/saludo`, { headers: { 'Accept-Language': 'en-US' } });
  assert.equal(await r.text(), 'Hello\n');
});

test('DELETE /saludo -> 405 con cabecera Allow', async () => {
  const r = await fetch(`${base}/saludo`, { method: 'DELETE' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'GET');
});

test('POST /eco con JSON -> 201 y devuelve lo recibido', async () => {
  const r = await fetch(`${base}/eco`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"nombre":"Ana"}',
  });
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { recibido: { nombre: 'Ana' } });
});

test('POST /eco sin Content-Type JSON -> 415', async () => {
  const r = await fetch(`${base}/eco`, { method: 'POST', body: 'nombre=Ana' });
  assert.equal(r.status, 415);
});

test('ruta inexistente -> 404', async () => {
  assert.equal((await fetch(`${base}/no-existe`)).status, 404);
});
