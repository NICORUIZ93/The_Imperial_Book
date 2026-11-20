// Módulo 27 · F164 · DESPUÉS (seguro): un «sidecar» por servicio, como el Envoy de Istio (o el proxy de Linkerd):
//   - la app escucha SOLO en un socket local del pod (aquí, un socket Unix): no hay puerto de la app en la red;
//   - el sidecar es el único punto de entrada: mTLS estricto, identidad SPIFFE del certificado;
//   - la política (politica.json) se aplica en el DESTINO y deniega por defecto;
//   - capa 'L7' (sidecar o waypoint) ve método y ruta; capa 'L4' (ztunnel de Istio ambient) solo ve identidad y puerto:
//     una regla ALLOW con métodos o rutas NUNCA coincide en L4 (así lo documenta Istio), y se deniega.
import http from 'node:http';
import https from 'node:https';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { credenciales, spiffeDe } from '../comun/pki.js';
import { escuchar, responder } from '../comun/cliente.js';
import { crearInventario } from './app.js';

export const POLITICA = JSON.parse(readFileSync(new URL('./politica.json', import.meta.url)));

/** Evalúa la política: true si alguna regla ALLOW coincide. En L4 las reglas con métodos/rutas no coinciden nunca. */
export function permitido(politica, { identidad, metodo, ruta, capa = 'L7' }) {
  return politica.reglas.some((r) => {
    if (!r.de.includes(identidad)) return false;
    const tieneL7 = Boolean(r.a?.metodos || r.a?.rutas);
    if (tieneL7 && capa === 'L4') return false;
    return (!r.a?.metodos || r.a.metodos.includes(metodo)) && (!r.a?.rutas || r.a.rutas.includes(ruta));
  });
}

export async function arrancarDespues({ politica = POLITICA, capa = 'L7' } = {}) {
  const socket = join(mkdtempSync(join(tmpdir(), 'pod-inventario-')), 'app.sock');
  const app = crearInventario();
  await new Promise((r) => app.listen(socket, r)); // ✔ solo dentro del «pod»
  const { cert, key, ca } = credenciales('inventario');
  const sidecar = https.createServer({ cert, key, ca, requestCert: true, rejectUnauthorized: true }, (req, res) => {
    const identidad = spiffeDe(req.socket.getPeerCertificate());
    if (!permitido(politica, { identidad, metodo: req.method, ruta: req.url, capa })) {
      if (capa === 'L4') return req.socket.destroy(); // ztunnel deniega cortando la conexión
      return responder(res, 403, { error: 'RBAC: access denied', identidad });
    }
    const p = http.request({ socketPath: socket, path: req.url, method: req.method, headers: req.headers }, (r) => {
      res.writeHead(r.statusCode, r.headers); r.pipe(res);
    });
    req.pipe(p);
  });
  const sc = await escuchar(sidecar);
  return { sidecar: sc, socket, cerrar: async () => { await sc.cerrar(); await new Promise((r) => app.close(r)); } };
}
