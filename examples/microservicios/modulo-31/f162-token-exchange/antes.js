// Módulo 27 · F162 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// pedidos reenvía a pagos el token del usuario tal cual (passthrough). El token tiene aud amplia
// (pedidos, pagos, inventario), vida de 1 h y es «al portador»: quien lo tenga, lo usa.
// pagos solo comprueba firma, emisor, audiencia y scope. Un token robado de un log sirve desde cualquier sitio.
import http from 'node:http';
import { verificar } from '../comun/jwt.js';
import { responder } from '../comun/cliente.js';
import { ISS_IDP } from './sts.js';

export function crearPagosAntes({ clavesIdp }) {
  return http.createServer((req, res) => {
    const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
    try {
      const t = verificar(token, clavesIdp.publicKey, { iss: ISS_IDP, aud: 'pagos' });
      if (!String(t.scope).split(' ').includes('pagos:cobrar')) return responder(res, 403, { error: 'insufficient_scope' });
      responder(res, 200, { cobrado: true, sub: t.sub });
    } catch (e) {
      responder(res, 401, { error: 'invalid_token', detalle: e.message });
    }
  });
}
