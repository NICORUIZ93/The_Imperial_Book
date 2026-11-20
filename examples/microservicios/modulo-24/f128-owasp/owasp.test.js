// Módulo 20 · F128 · Un test por categoría corregida. Ejecuta: node --test f128-owasp/owasp.test.js
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { caido } from './comun.js';
import { crearApp } from './despues.js';

let servidor; let base; const registros = []; const descargas = [];
before(async () => {
  const descargar = async (url) => { descargas.push(String(url)); return new Response('imagen'); };
  servidor = crearApp({ log: (linea) => registros.push(JSON.parse(linea)), descargar }).listen(0);
  await once(servidor, 'listening');
  base = `http://127.0.0.1:${servidor.address().port}`;
});
beforeEach(() => { registros.length = 0; descargas.length = 0; caido.valor = false; });
after(() => servidor.close());
const comoAna = { headers: { authorization: 'Bearer token-ana' } };

test('A01: Ana ve su factura y recibe 404 con la de Luis (y queda registrado)', async () => {
  assert.equal((await fetch(`${base}/facturas/1`, comoAna)).status, 200);
  const ajena = await fetch(`${base}/facturas/2`, comoAna);
  assert.equal(ajena.status, 404);
  assert.deepEqual(await ajena.json(), { error: 'no existe' });
  assert.equal(registros[0].tipo, 'acceso_denegado');
  assert.equal(registros[0].recurso, 'factura:2');
});

test('A01 (SSRF): solo se descarga de hosts permitidos por https', async () => {
  const destinos = ['http://127.0.0.1:9000/credenciales', 'http://169.254.169.254/latest/meta-data/', 'https://sitio-malo.example/x', 'http://imagenes.tienda.example/a.png', 'file:///etc/passwd', 'no-es-una-url'];
  for (const destino of destinos) {
    assert.equal((await fetch(`${base}/vista-previa?url=${encodeURIComponent(destino)}`, comoAna)).status, 400, destino);
  }
  assert.deepEqual(descargas, [], 'ninguna de esas URL llega a descargarse');
  assert.equal((await fetch(`${base}/vista-previa?url=${encodeURIComponent('https://imagenes.tienda.example/a.png')}`, comoAna)).status, 200);
  assert.deepEqual(descargas, ['https://imagenes.tienda.example/a.png']);
});

test('A02: un error inesperado no filtra el mensaje interno ni la pila', async () => {
  const r = await fetch(`${base}/fallo`);
  const texto = await r.text();
  assert.equal(r.status, 500);
  assert.doesNotMatch(texto, /postgres|Cl4ve|at file/);
  assert.equal(r.headers.get('x-powered-by'), null);
  assert.equal(JSON.parse(texto).incidente, registros[0].incidente, 'el id del cliente permite encontrar el detalle en el log');
  assert.match(registros[0].detalle, /postgres/);
});

test('A10: si el servicio de permisos falla, se niega (503), no se concede', async () => {
  caido.valor = true;
  assert.equal((await fetch(`${base}/exportar`, { method: 'POST', ...comoAna })).status, 503);
  assert.equal(registros[0].tipo, 'permisos_no_disponibles');
  caido.valor = false;
  assert.equal((await fetch(`${base}/exportar`, { method: 'POST', ...comoAna })).status, 403);
});

test('A09: cada acceso denegado deja un evento con usuario, ruta e ip', async () => {
  await fetch(`${base}/admin`, comoAna);
  assert.deepEqual(Object.keys(registros[0]), ['tipo', 'usuario', 'ruta', 'ip']);
  assert.deepEqual([registros[0].tipo, registros[0].usuario, registros[0].ruta], ['acceso_denegado', 'ana', '/admin']);
});
