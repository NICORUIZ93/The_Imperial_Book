// Módulo 27 · F162 · STS (Security Token Service) mínimo con Token Exchange RFC 8693 + tokens ligados a certificado (RFC 8705).
//   - El cliente se autentica con mTLS: su identidad es la URI SPIFFE del certificado (sin secretos compartidos).
//   - Canjea subject_token (token del usuario) por uno nuevo: aud = un solo destino, scope mínimo, vida 60 s.
//   - Delegación: el token nuevo lleva act.sub = quien canjea; si el subject_token ya traía act, se anida (cadena).
//   - may_act: si el subject_token lo trae, solo ese actor puede canjearlo.
//   - cnf["x5t#S256"]: huella del certificado del que canjea; el destino exige ver ESE certificado en la conexión.
import https from 'node:https';
import { credenciales, spiffeDe, huellaX5tS256 } from '../comun/pki.js';
import { firmar, verificar, leerSinVerificar, TokenInvalido } from '../comun/jwt.js';
import { responder } from '../comun/cliente.js';

export const GRANT = 'urn:ietf:params:oauth:grant-type:token-exchange';
export const ACCESS_TOKEN = 'urn:ietf:params:oauth:token-type:access_token';
export const ISS_IDP = 'https://idp.tienda.local';
export const ISS_STS = 'https://sts.tienda.local';
const TD = 'spiffe://cluster.local/ns/tienda/sa';
const nombre = (spiffe) => spiffe?.split('/').pop();

// Política del STS: quién puede pedir qué audiencia y con qué scopes como máximo. Lo que no está, se niega.
export const POLITICA = {
  [`${TD}/pedidos`]: { pagos: ['pagos:cobrar'] },
  [`${TD}/pagos`]: { antifraude: ['antifraude:evaluar'] },
};

function leerFormulario(req) {
  return new Promise((resolve) => {
    let t = '';
    req.setEncoding('utf8');
    req.on('data', (c) => (t += c));
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(t))));
  });
}

/** Lógica pura del canje (sin HTTP) para poder probarla: devuelve { status, body }. */
export function canjear(params, { clienteSpiffe, clienteDer, clavesIdp, clavesSts, politica = POLITICA, ahora }) {
  const error = (status, e, desc) => ({ status, body: { error: e, error_description: desc } });
  if (!clienteSpiffe) return error(401, 'invalid_client', 'se exige certificado de cliente de la malla');
  if (params.grant_type !== GRANT) return error(400, 'unsupported_grant_type', params.grant_type);
  if (!params.subject_token || params.subject_token_type !== ACCESS_TOKEN) return error(400, 'invalid_request', 'subject_token y subject_token_type=access_token son obligatorios');
  let sujeto;
  try {
    // El subject_token puede venir del IdP (primer salto) o del propio STS (saltos siguientes).
    // El iss sin verificar solo elige la clave; después se verifica TODO (firma, iss, aud, exp) con esa clave.
    const delSts = leerSinVerificar(params.subject_token).iss === ISS_STS;
    sujeto = verificar(params.subject_token, (delSts ? clavesSts : clavesIdp).publicKey,
      { iss: delSts ? ISS_STS : ISS_IDP, aud: nombre(clienteSpiffe), ahora });
  } catch (e) {
    return error(400, 'invalid_grant', `subject_token no válido para ${nombre(clienteSpiffe)}: ${e.message}`);
  }
  if (sujeto.may_act && sujeto.may_act.sub !== clienteSpiffe) return error(400, 'invalid_grant', `may_act no permite a ${nombre(clienteSpiffe)}`);
  const permitido = politica[clienteSpiffe]?.[params.audience];
  if (!permitido) return error(400, 'invalid_target', `${nombre(clienteSpiffe)} no puede pedir audience=${params.audience}`);
  const pedidos = (params.scope ?? '').split(' ').filter(Boolean);
  const scopes = pedidos.filter((s) => permitido.includes(s));
  if (scopes.length === 0) return error(400, 'invalid_scope', `ninguno de [${pedidos.join(' ')}] está permitido`);
  const act = sujeto.act ? { sub: clienteSpiffe, act: sujeto.act } : { sub: clienteSpiffe }; // cadena de delegación
  const token = firmar({
    iss: ISS_STS, sub: sujeto.sub, aud: params.audience, scope: scopes.join(' '), act,
    cnf: { 'x5t#S256': huellaX5tS256(clienteDer) },
  }, clavesSts.privateKey, { vidaSegundos: 60, ahora });
  return { status: 200, body: { access_token: token, issued_token_type: ACCESS_TOKEN, token_type: 'Bearer', expires_in: 60, scope: scopes.join(' ') } };
}

export function crearSts({ clavesIdp, clavesSts, politica }) {
  const { cert, key, ca } = credenciales('sts');
  return https.createServer({ cert, key, ca, requestCert: true, rejectUnauthorized: true }, async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/token') return responder(res, 404, { error: 'no existe' });
    const peer = req.socket.getPeerCertificate();
    const r = canjear(await leerFormulario(req), { clienteSpiffe: spiffeDe(peer), clienteDer: peer.raw, clavesIdp, clavesSts, politica });
    responder(res, r.status, r.body, { 'cache-control': 'no-store' });
  });
}

export { TokenInvalido };
