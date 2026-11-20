// Módulo 20 · F125 · Tests de la API protegida con Passport.js. Ejecuta: node --test f125-passport/passport.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { crearApp } from './despues.js';

const secreto = randomBytes(32).toString('hex');
let servidor; let base;
before(async () => { servidor = crearApp({ secreto }).listen(0); await once(servidor, 'listening'); base = `http://127.0.0.1:${servidor.address().port}`; });
after(() => servidor.close());
const json = { 'content-type': 'application/json' };
const login = (usuario, clave) => fetch(`${base}/login`, { method: 'POST', headers: json, body: JSON.stringify({ usuario, clave }) });
const tokenDe = async (usuario, clave) => (await (await login(usuario, clave)).json()).token;

test('login correcto devuelve un JWT de 15 minutos con sub e iss', async () => {
  const payload = jwt.verify(await tokenDe('ana', 'ana123'), secreto, { algorithms: ['HS256'] });
  assert.equal(payload.sub, 'u1');
  assert.equal(payload.iss, 'pedidos');
  assert.equal(payload.exp - payload.iat, 900);
});

test('usuario inexistente y clave incorrecta responden EXACTAMENTE igual (no se pueden enumerar usuarios)', async () => {
  const [noExiste, claveMala] = [await login('zzz', 'x'), await login('root', 'x')];
  assert.equal(noExiste.status, 401);
  assert.equal(claveMala.status, 401);
  assert.equal(await noExiste.text(), await claveMala.text());
});

test('la cabecera x-usuario ya no identifica a nadie: sin token 401', async () => {
  assert.equal((await fetch(`${base}/mis-pedidos`, { headers: { 'x-usuario': 'root' } })).status, 401);
});

test('con token válido entra a sus pedidos', async () => {
  const r = await fetch(`${base}/mis-pedidos`, { headers: { authorization: `Bearer ${await tokenDe('ana', 'ana123')}` } });
  assert.deepEqual(await r.json(), { pedidos: [1, 2], de: 'u1' });
});

test('autorización: un cliente recibe 403 en la ruta de admin y un admin 200', async () => {
  const borrar = async (token) => (await fetch(`${base}/admin/usuarios/u9`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })).status;
  assert.equal(await borrar(await tokenDe('ana', 'ana123')), 403);
  assert.equal(await borrar(await tokenDe('root', 'S3gura!2026')), 200);
});

test('un token firmado con otro secreto o que dice rol admin en el payload no sirve', async () => {
  const otroSecreto = jwt.sign({ rol: 'admin' }, 'x'.repeat(32), { subject: 'u2', issuer: 'pedidos' });
  assert.equal((await fetch(`${base}/mis-pedidos`, { headers: { authorization: `Bearer ${otroSecreto}` } })).status, 401);
  const rolFalso = jwt.sign({ rol: 'admin' }, secreto, { subject: 'u1', issuer: 'pedidos', expiresIn: '5m' }); // aun firmado bien…
  const r = await fetch(`${base}/admin/usuarios/u9`, { method: 'DELETE', headers: { authorization: `Bearer ${rolFalso}` } });
  assert.equal(r.status, 403, '…el rol se lee del servidor, no del token');
});

test('arrancar sin un secreto largo falla de inmediato', () => {
  assert.throws(() => crearApp({ secreto: 'corto' }), /al menos 32 caracteres/);
});
