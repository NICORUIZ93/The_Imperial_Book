// Módulo 19 · F123 · Tests de las estrategias de fallback con un inventario falso local (sin infraestructura).
// Ejecuta: node --test f123-fallbacks/catalogo.test.js
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { crearCatalogo } from './catalogo.js';

let inventario; let caido = false; let servidor; let url; let partes;
before(async () => {
  inventario = http.createServer((req, res) => {
    if (caido) return req.socket.destroy(); // corta la conexión: como un servicio que se cae
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ sku: req.url.split('/').pop(), stock: 12 }));
  }).listen(0);
  await once(inventario, 'listening');
});
beforeEach(async () => {
  caido = false;
  partes = crearCatalogo({ urlInventario: `http://127.0.0.1:${inventario.address().port}`, edadMaximaMs: 150, log: () => {} });
  servidor = partes.app.listen(0);
  await once(servidor, 'listening');
  url = `http://127.0.0.1:${servidor.address().port}`;
});
const cerrar = () => { servidor.close(); servidor.closeAllConnections(); partes.circuito.shutdown(); };
after(() => { inventario.close(); inventario.closeAllConnections(); });
const get = (ruta) => fetch(`${url}${ruta}`).then(async (r) => ({ status: r.status, warning: r.headers.get('warning'), cuerpo: await r.json() }));

test('sano: responde con el dato del inventario, sin marcar degradación', async () => {
  const r = await get('/catalogo/7');
  assert.deepEqual(r.cuerpo, { sku: '7', nombre: 'Teclado', stock: 12, fuente: 'inventario', degradado: false });
  assert.equal(r.warning, null);
  cerrar();
});

test('caído con caché reciente: último valor bueno, marcado como degradado', async () => {
  await get('/catalogo/7');
  caido = true;
  const r = await get('/catalogo/7');
  assert.equal(r.status, 200);
  assert.equal(r.cuerpo.fuente, 'cache');
  assert.equal(r.cuerpo.stock, 12);
  assert.equal(r.cuerpo.degradado, true);
  assert.match(r.warning, /degradada/);
  cerrar();
});

test('caído sin caché (o caché vieja): valor por defecto con stock null, nunca 0', async () => {
  caido = true;
  const nunca = await get('/catalogo/9');
  assert.deepEqual([nunca.cuerpo.fuente, nunca.cuerpo.stock, nunca.cuerpo.degradado], ['defecto', null, true]);
  caido = false; await get('/catalogo/7'); caido = true;
  await new Promise((ok) => setTimeout(ok, 200)); // supera edadMaximaMs (150)
  assert.equal((await get('/catalogo/7')).cuerpo.fuente, 'defecto');
  cerrar();
});

test('la compra no tiene fallback: 503 con Retry-After', async () => {
  caido = true;
  const r = await fetch(`${url}/compras`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"sku":"7"}' });
  assert.equal(r.status, 503);
  assert.equal(r.headers.get('retry-after'), '5');
  cerrar();
});

test('cada fallback queda contado en /metricas', async () => {
  await get('/catalogo/7'); caido = true; await get('/catalogo/7'); await get('/catalogo/9');
  const { cuerpo } = await get('/metricas');
  assert.deepEqual([cuerpo.inventario, cuerpo.cache, cuerpo.defecto], [1, 1, 1]);
  cerrar();
});
