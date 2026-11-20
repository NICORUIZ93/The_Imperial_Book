// Módulo 27 · F162 · tests: node --test f162-token-exchange/token-exchange.test.js  (requiere ./pki/generar.sh)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { X509Certificate } from 'node:crypto';
import { nuevasClaves, firmar, leerSinVerificar } from '../comun/jwt.js';
import { credenciales, huellaDePem } from '../comun/pki.js';
import { canjear, GRANT, ACCESS_TOKEN, ISS_IDP } from './sts.js';
import { validarPeticion, cadena } from './despues.js';

const TD = 'spiffe://cluster.local/ns/tienda/sa';
const clavesIdp = nuevasClaves();
const clavesSts = nuevasClaves();
const der = (n) => new X509Certificate(credenciales(n).cert).raw;
const ctx = (n) => ({ clienteSpiffe: `${TD}/${n}`, clienteDer: der(n), clavesIdp, clavesSts });
const pide = (subject_token, audience, scope) => ({ grant_type: GRANT, subject_token, subject_token_type: ACCESS_TOKEN, audience, scope });
const deAna = firmar({ iss: ISS_IDP, sub: 'ana', aud: 'pedidos', may_act: { sub: `${TD}/pedidos` } }, clavesIdp.privateKey);

test('el canje produce un token de un solo destino, scope mínimo, 60 s, act y cnf', () => {
  const r = canjear(pide(deAna, 'pagos', 'pagos:cobrar pagos:reembolsar'), ctx('pedidos'));
  assert.equal(r.status, 200);
  assert.equal(r.body.issued_token_type, ACCESS_TOKEN);
  const t = leerSinVerificar(r.body.access_token);
  assert.deepEqual([t.sub, t.aud, t.scope, t.exp - t.iat], ['ana', 'pagos', 'pagos:cobrar', 60]);
  assert.equal(t.act.sub, `${TD}/pedidos`);
  assert.equal(t.cnf['x5t#S256'], huellaDePem(credenciales('pedidos').cert));
});

test('el STS rechaza: audiencia no permitida, token ajeno y may_act', () => {
  assert.equal(canjear(pide(deAna, 'inventario', 'inventario:leer'), ctx('pedidos')).body.error, 'invalid_target');
  assert.equal(canjear(pide(deAna, 'pagos', 'pagos:cobrar'), ctx('catalogo')).body.error, 'invalid_grant');
  const paraCatalogo = firmar({ iss: ISS_IDP, sub: 'ana', aud: 'catalogo', may_act: { sub: `${TD}/pedidos` } }, clavesIdp.privateKey);
  const r = canjear(pide(paraCatalogo, 'pagos', 'pagos:cobrar'), ctx('catalogo'));
  assert.equal(r.body.error, 'invalid_grant');
  assert.match(r.body.error_description, /may_act/);
  assert.equal(canjear(pide(deAna, 'pagos', 'pagos:borrar'), ctx('pedidos')).body.error, 'invalid_scope');
});

test('pagos acepta el token solo con el certificado al que se ligó (RFC 8705)', () => {
  const token = canjear(pide(deAna, 'pagos', 'pagos:cobrar'), ctx('pedidos')).body.access_token;
  const base = { token, clavesSts, aud: 'pagos', scope: 'pagos:cobrar', actores: [`${TD}/pedidos`] };
  assert.equal(validarPeticion({ ...base, peer: { raw: der('pedidos') } }).status, 200);
  assert.equal(validarPeticion({ ...base, peer: { raw: der('catalogo'), subjectaltname: `URI:${TD}/catalogo` } }).status, 401);
});

test('el segundo salto anida act: antifraude ve la cadena pagos ← pedidos', () => {
  const t1 = canjear(pide(deAna, 'pagos', 'pagos:cobrar'), ctx('pedidos')).body.access_token;
  const r = canjear(pide(t1, 'antifraude', 'antifraude:evaluar'), ctx('pagos'));
  assert.equal(r.status, 200);
  const t2 = leerSinVerificar(r.body.access_token);
  assert.equal(cadena(t2.act), 'pagos ← pedidos');
  assert.equal(t2.sub, 'ana');
});
