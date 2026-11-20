// Módulo 27 · F164 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Seguridad de PERÍMETRO: un gateway en el borde aplica la política, y dentro de la red todo se confía.
// inventario escucha en un puerto TCP de la red interna, así que cualquier servicio de dentro (o un pod
// comprometido) puede llamarlo directamente y saltarse el gateway.
import http from 'node:http';
import { escuchar, responder } from '../comun/cliente.js';
import { crearInventario } from './app.js';

export async function arrancarAntes() {
  const app = await escuchar(crearInventario()); // ✘ puerto TCP alcanzable desde toda la red interna
  const gateway = http.createServer((req, res) => {
    // El gateway del borde solo deja pasar GET /stock desde fuera.
    if (!(req.method === 'GET' && req.url === '/stock')) return responder(res, 403, { error: 'gateway: prohibido' });
    const p = http.request({ host: '127.0.0.1', port: app.puerto, path: req.url, method: req.method, headers: req.headers }, (r) => {
      res.writeHead(r.statusCode, r.headers); r.pipe(res);
    });
    req.pipe(p);
  });
  const gw = await escuchar(gateway);
  return { app, gw, cerrar: async () => { await gw.cerrar(); await app.cerrar(); } };
}
