// Módulo 27 · F161 · DESPUÉS (seguro). Lo que hace el sidecar de Istio/Linkerd, escrito a mano en Node:
//   1. mTLS ESTRICTO: sin certificado firmado por la CA de la malla no hay conexión (requestCert + rejectUnauthorized).
//   2. La identidad es la URI SPIFFE del certificado verificado; las cabeceras no cuentan.
//   3. Autorización por identidad, denegar por defecto: solo pedidos puede POST /cobros
//      (el equivalente de una AuthorizationPolicy de Istio o de una MeshTLSAuthentication de Linkerd).
// Ejecuta: ./pki/generar.sh && node f161-mtls/despues.js   (https://127.0.0.1:4161)
import https from 'node:https';
import { pathToFileURL } from 'node:url';
import { credenciales, spiffeDe } from '../comun/pki.js';
import { escuchar, responder } from '../comun/cliente.js';

const TD = 'spiffe://cluster.local/ns/tienda/sa';
// Reglas: método + ruta -> identidades permitidas. Lo que no está aquí, se deniega.
export const REGLAS = [{ metodo: 'POST', ruta: '/cobros', permitidos: [`${TD}/pedidos`] }];

export function autorizar(identidad, metodo, ruta, reglas = REGLAS) {
  const regla = reglas.find((r) => r.metodo === metodo && r.ruta === ruta);
  return Boolean(regla && identidad && regla.permitidos.includes(identidad));
}

export function crearPagosDespues({ reglas = REGLAS } = {}) {
  const { cert, key, ca } = credenciales('pagos');
  return https.createServer({
    cert, key, ca,
    requestCert: true,          // pide certificado al cliente…
    rejectUnauthorized: true,   // …y corta el handshake si no lo trae o no lo firmó la CA
    minVersion: 'TLSv1.3',
  }, (req, res) => {
    const identidad = spiffeDe(req.socket.getPeerCertificate()); // la cabecera x-servicio se ignora
    if (!autorizar(identidad, req.method, req.url, reglas)) {
      return responder(res, 403, { error: 'RBAC: access denied', identidad });
    }
    responder(res, 200, { cobrado: true, identidad });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { puerto } = await escuchar(crearPagosDespues(), 4161);
  console.log(`pagos DESPUÉS en https://127.0.0.1:${puerto} (mTLS estricto + autorización por identidad SPIFFE)`);
}
