// Módulo 31 · F177 · El servicio nuevo «pedidos»: solo sabe de pedidos (la primera funcionalidad estrangulada).
import { http, json, leerCuerpo } from '../comun/http.js';

export function crearPedidosNuevo() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let m;
    if (req.method === 'GET' && (m = url.pathname.match(/^\/api\/pedidos\/([\w-]+)$/))) {
      return json(res, 200, { id: m[1], estado: 'FACTURADO', origen: 'pedidos-nuevo' }, { 'x-servido-por': 'pedidos-nuevo' });
    }
    if (req.method === 'POST' && url.pathname === '/api/pedidos') {
      const cuerpo = JSON.parse(await leerCuerpo(req));
      return json(res, 201, { ...cuerpo, origen: 'pedidos-nuevo' }, { 'x-servido-por': 'pedidos-nuevo' });
    }
    json(res, 404, { error: `pedidos-nuevo no conoce ${req.method} ${url.pathname}` }, { 'x-servido-por': 'pedidos-nuevo' });
  });
}
