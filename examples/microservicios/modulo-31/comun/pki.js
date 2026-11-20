// Módulo 27 · utilidades comunes: leer la PKI de pki/certs y sacar la identidad SPIFFE de un certificado.
// Node.js 26.13.1 LTS, sin dependencias (node:fs, node:crypto, node:path).
import { readFileSync, existsSync } from 'node:fs';
import { X509Certificate, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const DIR_CERTS = process.env.CERTS ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'pki', 'certs');

/** Devuelve { cert, key, ca } en PEM para el servicio pedido. Falla con un mensaje claro si no hay PKI. */
export function credenciales(nombre) {
  const ruta = (f) => join(DIR_CERTS, f);
  if (!existsSync(ruta('ca.crt'))) {
    throw new Error(`no hay PKI en ${DIR_CERTS}: ejecuta primero ./pki/generar.sh`);
  }
  return { cert: readFileSync(ruta(`${nombre}.crt`)), key: readFileSync(ruta(`${nombre}.key`)), ca: readFileSync(ruta('ca.crt')) };
}

/** Identidad SPIFFE del certificado (URI del SAN), p. ej. spiffe://cluster.local/ns/tienda/sa/pedidos. */
export function spiffeDe(certificado) {
  // getPeerCertificate() da subjectaltname como texto: 'URI:spiffe://..., DNS:localhost'
  const san = certificado?.subjectaltname ?? '';
  const uri = san.split(', ').find((s) => s.startsWith('URI:spiffe://'));
  return uri ? uri.slice(4) : null;
}

/** Huella RFC 8705 §3.1: base64url(SHA-256(DER del certificado)) -> claim cnf["x5t#S256"]. */
export function huellaX5tS256(certificadoDer) {
  return createHash('sha256').update(certificadoDer).digest('base64url');
}

/** Huella de un PEM (para el STS, que conoce el certificado del cliente por la conexión mTLS). */
export function huellaDePem(pem) {
  return huellaX5tS256(new X509Certificate(pem).raw);
}
