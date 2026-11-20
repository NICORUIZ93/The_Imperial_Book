// Módulo 27 · JWT ES256 mínimo con node:crypto (sin dependencias), para que veas cada comprobación.
// En producción usa una librería mantenida (jose 6 o jsonwebtoken 9, Módulo 20); aquí todo es visible.
import { createSign, createVerify, generateKeyPairSync, randomUUID } from 'node:crypto';

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

export function nuevasClaves() {
  return generateKeyPairSync('ec', { namedCurve: 'P-256' });
}

/** Firma un JWT ES256. `claims` ya trae iss, sub, aud, scope…; aquí se añaden iat, exp y jti. */
export function firmar(claims, privateKey, { kid = 'sts-1', vidaSegundos = 60, ahora = Math.floor(Date.now() / 1000) } = {}) {
  const cabecera = { alg: 'ES256', typ: 'JWT', kid };
  const payload = { ...claims, iat: ahora, exp: ahora + vidaSegundos, jti: randomUUID() };
  const datos = `${b64(cabecera)}.${b64(payload)}`;
  const firma = createSign('SHA256').update(datos).sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });
  return `${datos}.${firma.toString('base64url')}`;
}

export class TokenInvalido extends Error {}

/** Verifica firma, algoritmo, emisor, audiencia y caducidad. Devuelve el payload o lanza TokenInvalido. */
export function verificar(token, publicKey, { iss, aud, ahora = Math.floor(Date.now() / 1000) }) {
  const partes = String(token ?? '').split('.');
  if (partes.length !== 3) throw new TokenInvalido('formato');
  const [c, p, f] = partes;
  let cabecera, payload;
  try {
    cabecera = JSON.parse(Buffer.from(c, 'base64url'));
    payload = JSON.parse(Buffer.from(p, 'base64url'));
  } catch {
    throw new TokenInvalido('formato');
  }
  if (cabecera.alg !== 'ES256') throw new TokenInvalido(`alg ${cabecera.alg} no permitido`);
  const ok = createVerify('SHA256').update(`${c}.${p}`).verify({ key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(f, 'base64url'));
  if (!ok) throw new TokenInvalido('firma');
  if (payload.iss !== iss) throw new TokenInvalido(`iss=${payload.iss}`);
  const auds = [].concat(payload.aud ?? []);
  if (!auds.includes(aud)) throw new TokenInvalido(`aud=${auds.join(',')}`);
  if (typeof payload.exp !== 'number' || payload.exp <= ahora) throw new TokenInvalido('caducado');
  return payload;
}

/** Lee el payload SIN verificar: solo para mostrarlo en pantalla, nunca para autorizar. */
export function leerSinVerificar(token) {
  return JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url'));
}
