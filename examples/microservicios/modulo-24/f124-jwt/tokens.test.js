// Módulo 20 · F124 · Tests de emisión y verificación de JWT. Ejecuta: node --test f124-jwt/tokens.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import { AUDIENCIA, EMISOR, emitir, generarClaves, verificar } from './tokens.js';
import { crearApp } from './despues.js';

const claves = generarClaves('k1');
const publicas = new Map([['k1', claves.publicKey]]);
const ana = { id: 'u1', rol: 'cliente' };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

test('un token recién emitido se verifica y trae sub, rol, iss, aud, exp y jti', async () => {
  const payload = await verificar(emitir(claves, ana), publicas);
  assert.equal(payload.sub, 'u1');
  assert.equal(payload.rol, 'cliente');
  assert.equal(payload.iss, EMISOR);
  assert.equal(payload.aud, AUDIENCIA);
  assert.equal(payload.exp - payload.iat, 900);
  assert.match(payload.jti, /^[0-9a-f-]{36}$/);
});

test('rechaza un token con alg none', async () => {
  const falso = `${b64({ alg: 'none', typ: 'JWT', kid: 'k1' })}.${b64({ sub: 'u1', rol: 'admin', iss: EMISOR, aud: AUDIENCIA })}.`;
  await assert.rejects(verificar(falso, publicas), { name: 'JsonWebTokenError' });
});

test('rechaza un payload manipulado (la firma ya no coincide)', async () => {
  const [cabecera, , firma] = emitir(claves, ana).split('.');
  const manipulado = `${cabecera}.${b64({ sub: 'u1', rol: 'admin', iss: EMISOR, aud: AUDIENCIA, exp: 9999999999 })}.${firma}`;
  await assert.rejects(verificar(manipulado, publicas), { name: 'JsonWebTokenError', message: 'invalid signature' });
});

test('rechaza un token caducado', async () => {
  await assert.rejects(verificar(emitir(claves, ana, { expiraEn: -10 }), publicas), { name: 'TokenExpiredError' });
});

test('rechaza un token firmado con HS256 usando la clave pública como secreto (confusión de algoritmos)', async () => {
  const pem = claves.publicKey.export({ type: 'spki', format: 'pem' });
  const confuso = jwt.sign({ sub: 'u1', rol: 'admin' }, pem, { algorithm: 'HS256', keyid: 'k1', issuer: EMISOR, audience: AUDIENCIA });
  await assert.rejects(verificar(confuso, publicas), { name: 'JsonWebTokenError', message: 'invalid algorithm' });
});

test('rechaza otra audiencia, otro emisor y un kid desconocido', async () => {
  const firmar = (opciones) => jwt.sign({ rol: 'cliente' }, claves.privateKey, { algorithm: 'ES256', keyid: 'k1', issuer: EMISOR, audience: AUDIENCIA, ...opciones });
  await assert.rejects(verificar(firmar({ audience: 'api-pagos' }), publicas), /jwt audience invalid/);
  await assert.rejects(verificar(firmar({ issuer: 'https://otro.example' }), publicas), /jwt issuer invalid/);
  await assert.rejects(verificar(firmar({ keyid: 'k9' }), publicas), /kid desconocido: k9/);
});

test('API: sin token 401, cliente en ruta de admin 403, y el JWKS publica solo la parte pública', async () => {
  const servidor = crearApp(claves).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const sinToken = await fetch(`${base}/admin/ventas`);
  assert.equal(sinToken.status, 401);
  assert.equal(sinToken.headers.get('www-authenticate'), 'Bearer');
  const { token } = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"usuario":"ana","clave":"ana123"}' }).then((r) => r.json());
  assert.equal((await fetch(`${base}/admin/ventas`, { headers: { authorization: `Bearer ${token}` } })).status, 403);
  assert.deepEqual(await fetch(`${base}/mi-perfil`, { headers: { authorization: `Bearer ${token}` } }).then((r) => r.json()), { id: 'u1', rol: 'cliente' });
  const jwks = await fetch(`${base}/.well-known/jwks.json`).then((r) => r.json());
  assert.deepEqual(Object.keys(jwks.keys[0]).sort(), ['alg', 'crv', 'kid', 'kty', 'use', 'x', 'y']); // sin «d» (la privada)
  servidor.close();
});
