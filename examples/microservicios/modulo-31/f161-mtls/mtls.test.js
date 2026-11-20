// Módulo 27 · F161 · tests: node --test f161-mtls/mtls.test.js  (requiere ./pki/generar.sh)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { crearPagosAntes } from './antes.js';
import { crearPagosDespues, autorizar } from './despues.js';
import { credenciales, DIR_CERTS } from '../comun/pki.js';
import { escuchar, llamar } from '../comun/cliente.js';

let antes, despues;
const cobrar = (url, opts) => llamar(url, { metodo: 'POST', cuerpo: { importe: 10 }, ...opts });
before(async () => { antes = await escuchar(crearPagosAntes()); despues = await escuchar(crearPagosDespues()); });
after(async () => { await antes.cerrar(); await despues.cerrar(); });

test('ANTES: cualquiera que escriba la cabecera x-servicio cobra (vulnerable)', async () => {
  const r = await cobrar(`http://127.0.0.1:${antes.puerto}/cobros`, { cabeceras: { 'x-servicio': 'pedidos' } });
  assert.equal(r.status, 200);
});

test('DESPUÉS: sin certificado de cliente no hay conexión', async () => {
  const ca = readFileSync(join(DIR_CERTS, 'ca.crt'));
  const r = await cobrar(`https://127.0.0.1:${despues.puerto}/cobros`, { cabeceras: { 'x-servicio': 'pedidos' }, tls: { ca } });
  assert.ok(r.error, `esperaba un error de TLS y llegó ${r.status}`);
});

test('DESPUÉS: un certificado autofirmado (fuera de la CA) no conecta', async () => {
  const tls = { cert: readFileSync(join(DIR_CERTS, 'intruso.crt')), key: readFileSync(join(DIR_CERTS, 'intruso.key')), ca: readFileSync(join(DIR_CERTS, 'ca.crt')) };
  const r = await cobrar(`https://127.0.0.1:${despues.puerto}/cobros`, { tls });
  assert.ok(r.error);
});

test('DESPUÉS: catalogo con certificado válido recibe 403 aunque finja la cabecera', async () => {
  const r = await cobrar(`https://127.0.0.1:${despues.puerto}/cobros`, { cabeceras: { 'x-servicio': 'pedidos' }, tls: credenciales('catalogo') });
  assert.equal(r.status, 403);
  assert.equal(r.body.identidad, 'spiffe://cluster.local/ns/tienda/sa/catalogo');
});

test('DESPUÉS: pedidos cobra y la identidad viene del certificado', async () => {
  const r = await cobrar(`https://127.0.0.1:${despues.puerto}/cobros`, { tls: credenciales('pedidos') });
  assert.equal(r.status, 200);
  assert.equal(r.body.identidad, 'spiffe://cluster.local/ns/tienda/sa/pedidos');
});

test('autorizar() deniega por defecto lo que no tiene regla', () => {
  const pedidos = 'spiffe://cluster.local/ns/tienda/sa/pedidos';
  assert.equal(autorizar(pedidos, 'POST', '/cobros'), true);
  assert.equal(autorizar(pedidos, 'DELETE', '/cobros'), false);
  assert.equal(autorizar(null, 'POST', '/cobros'), false);
});
