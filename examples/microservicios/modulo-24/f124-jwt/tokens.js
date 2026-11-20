// Módulo 20 · F124 · JWT con jsonwebtoken: emitir y verificar tokens firmados con clave asimétrica (ES256).
// Requisitos: Node.js 26.13.1 LTS y jsonwebtoken 9.0.3 (package.json del laboratorio).
import jwt from 'jsonwebtoken';
import { generateKeyPairSync, randomUUID } from 'node:crypto';

export const EMISOR = 'https://auth.tienda.example';
export const AUDIENCIA = 'api-pedidos';

/** Par de claves EC P-256. En producción la privada vive en un gestor de secretos (ficha «Secretos»), no en el código. */
export function generarClaves(kid = `clave-${new Date().toISOString().slice(0, 10)}`) {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  return { kid, privateKey, publicKey };
}

/** Emite un token de acceso CORTO (15 min por defecto). Solo datos no sensibles: el payload se puede leer. */
export function emitir(claves, usuario, { expiraEn = '15m' } = {}) {
  return jwt.sign({ rol: usuario.rol }, claves.privateKey, {
    algorithm: 'ES256',   // firma asimétrica: quien verifica no puede emitir
    keyid: claves.kid,    // cabecera kid: permite rotar claves
    subject: usuario.id,  // sub
    issuer: EMISOR,       // iss
    audience: AUDIENCIA,  // aud
    expiresIn: expiraEn,  // exp
    jwtid: randomUUID(),  // jti: identificador único (para revocar)
  });
}

/**
 * Verifica firma, algoritmo, emisor, audiencia y caducidad. `clavesPublicas` es un Map kid -> clave pública.
 * Lanza JsonWebTokenError / TokenExpiredError si algo no cuadra.
 */
export function verificar(token, clavesPublicas) {
  const elegirClave = (cabecera, listo) => {
    const clave = clavesPublicas.get(cabecera.kid);
    listo(clave ? null : new jwt.JsonWebTokenError(`kid desconocido: ${cabecera.kid}`), clave);
  };
  return new Promise((ok, falla) => {
    jwt.verify(token, elegirClave, {
      algorithms: ['ES256'], // lista blanca: nunca aceptes «el algoritmo que diga el token»
      issuer: EMISOR,
      audience: AUDIENCIA,
      clockTolerance: 5,     // segundos de margen por relojes desajustados
    }, (error, payload) => (error ? falla(error) : ok(payload)));
  });
}

/** Middleware Express: exige `Authorization: Bearer <token>` válido y deja el payload en req.usuario. */
export function autenticar(clavesPublicas) {
  return async (req, res, next) => {
    const [esquema, token] = (req.get('authorization') ?? '').split(' ');
    if (esquema !== 'Bearer' || !token) {
      return res.status(401).set('WWW-Authenticate', 'Bearer').json({ error: 'falta el token' });
    }
    try {
      req.usuario = await verificar(token, clavesPublicas);
      next();
    } catch (error) {
      const motivo = error.name === 'TokenExpiredError' ? 'token caducado' : 'token inválido';
      res.status(401).set('WWW-Authenticate', `Bearer error="invalid_token", error_description="${motivo}"`).json({ error: motivo });
    }
  };
}
