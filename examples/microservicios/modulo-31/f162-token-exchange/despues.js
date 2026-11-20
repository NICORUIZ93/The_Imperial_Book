// Módulo 27 · F162 · DESPUÉS (seguro). pagos (y antifraude) como servidores de recursos Zero-Trust:
//   1. mTLS estricto (la conexión dice QUÉ servicio llama).
//   2. El token lo emitió el STS para ESTE destino (aud), con el scope exacto y caducidad de 60 s.
//   3. El actor actual (act.sub, el más externo) está autorizado a actuar aquí.
//   4. Prueba de posesión RFC 8705: cnf["x5t#S256"] == huella del certificado de la conexión.
//      Un token robado no sirve sin la clave privada del servicio al que se emitió.
import https from 'node:https';
import { credenciales, spiffeDe, huellaX5tS256 } from '../comun/pki.js';
import { verificar } from '../comun/jwt.js';
import { responder } from '../comun/cliente.js';
import { ISS_STS } from './sts.js';

const TD = 'spiffe://cluster.local/ns/tienda/sa';

/** Cadena de delegación legible: «pagos ← pedidos» (actor actual primero). */
export function cadena(act) {
  const nombres = [];
  for (let a = act; a; a = a.act) nombres.push(a.sub.split('/').pop());
  return nombres.join(' ← ');
}

export function validarPeticion({ token, peer, clavesSts, aud, scope, actores }) {
  const t = verificar(token, clavesSts.publicKey, { iss: ISS_STS, aud });
  if (!String(t.scope).split(' ').includes(scope)) return { status: 403, body: { error: 'insufficient_scope' } };
  if (!actores.includes(t.act?.sub)) return { status: 403, body: { error: 'actor no autorizado', act: t.act?.sub ?? null } };
  const huella = huellaX5tS256(peer.raw);
  if (t.cnf?.['x5t#S256'] !== huella) {
    return { status: 401, body: { error: 'invalid_token', detalle: `cnf no coincide con el certificado de ${spiffeDe(peer)?.split('/').pop()}` } };
  }
  return { status: 200, t };
}

function servidorDeRecursos(nombre, { clavesSts, aud, scope, actores, alAceptar }) {
  const { cert, key, ca } = credenciales(nombre);
  return https.createServer({ cert, key, ca, requestCert: true, rejectUnauthorized: true }, async (req, res) => {
    const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
    try {
      const r = validarPeticion({ token, peer: req.socket.getPeerCertificate(), clavesSts, aud, scope, actores });
      if (r.status !== 200) return responder(res, r.status, r.body);
      responder(res, 200, await alAceptar(r.t, token));
    } catch (e) {
      responder(res, 401, { error: 'invalid_token', detalle: e.message });
    }
  });
}

/** pagos: acepta tokens del STS con aud=pagos, scope pagos:cobrar y actor pedidos. */
export function crearPagosDespues({ clavesSts, alCobrar = async (t) => ({ cobrado: true, sub: t.sub, cadena: cadena(t.act) }) }) {
  return servidorDeRecursos('pagos', { clavesSts, aud: 'pagos', scope: 'pagos:cobrar', actores: [`${TD}/pedidos`], alAceptar: alCobrar });
}

/** antifraude: acepta tokens con aud=antifraude y actor pagos (cadena pagos ← pedidos). */
export function crearAntifraude({ clavesSts }) {
  return servidorDeRecursos('antifraude', {
    clavesSts, aud: 'antifraude', scope: 'antifraude:evaluar', actores: [`${TD}/pagos`],
    alAceptar: async (t) => ({ riesgo: 'bajo', sub: t.sub, cadena: cadena(t.act) }),
  });
}
