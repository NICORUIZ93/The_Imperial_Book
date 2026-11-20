// Módulo 20 · F126 · Tests de cabeceras de seguridad y CORS. Ejecuta: node --test f126-helmet-cors/cabeceras.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { crearApp } from './despues.js';

let servidor; let url;
before(async () => {
  servidor = crearApp({ origenes: ['https://tienda.example', 'https://admin.tienda.example'] }).listen(0);
  await once(servidor, 'listening');
  url = `http://127.0.0.1:${servidor.address().port}/api/perfil`;
});
after(() => servidor.close());

test('Helmet añade las cabeceras de seguridad y quita X-Powered-By', async () => {
  const c = (await fetch(url)).headers;
  assert.equal(c.get('x-powered-by'), null);
  assert.equal(c.get('x-content-type-options'), 'nosniff');
  assert.equal(c.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(c.get('strict-transport-security'), 'max-age=31536000; includeSubDomains');
  assert.equal(c.get('content-security-policy'), "default-src 'none';frame-ancestors 'none'");
  assert.equal(c.get('referrer-policy'), 'no-referrer');
});

test('un origen de la lista recibe Allow-Origin con SU origen y Vary: Origin', async () => {
  const c = (await fetch(url, { headers: { origin: 'https://admin.tienda.example' } })).headers;
  assert.equal(c.get('access-control-allow-origin'), 'https://admin.tienda.example');
  assert.equal(c.get('access-control-allow-credentials'), 'true');
  assert.match(c.get('vary'), /Origin/);
});

test('un origen fuera de la lista no recibe ninguna cabecera CORS', async () => {
  for (const origen of ['https://sitio-malo.example', 'https://tienda.example.sitio-malo.example', 'http://tienda.example', 'null']) {
    const c = (await fetch(url, { headers: { origin: origen } })).headers;
    assert.equal(c.get('access-control-allow-origin'), null, origen);
    assert.equal(c.get('access-control-allow-credentials'), null, origen);
  }
});

test('el preflight responde 204 con métodos, cabeceras permitidas y max-age', async () => {
  const r = await fetch(url, { method: 'OPTIONS', headers: { origin: 'https://tienda.example', 'access-control-request-method': 'DELETE' } });
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('access-control-allow-methods'), 'GET,POST,PUT,DELETE');
  assert.equal(r.headers.get('access-control-allow-headers'), 'Content-Type,Authorization');
  assert.equal(r.headers.get('access-control-max-age'), '600');
});
