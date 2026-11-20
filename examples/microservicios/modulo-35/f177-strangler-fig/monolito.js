// Módulo 31 · F177 · El monolito «Tienda» (legado): pedidos, clientes y un informe antiguo de pedidos.
// En un caso real es tu aplicación de años; aquí es lo mínimo para ver el enrutamiento de la fachada.
import { http, json, leerCuerpo } from '../comun/http.js';

export function crearMonolito() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let m;
    if (req.method === 'GET' && (m = url.pathname.match(/^\/api\/pedidos\/([\w-]+)$/))) {
      return json(res, 200, { id: m[1], estado: 'F', origen: 'monolito' }, { 'x-servido-por': 'monolito' });
    }
    if (req.method === 'POST' && url.pathname === '/api/pedidos') {
      const cuerpo = JSON.parse(await leerCuerpo(req));
      return json(res, 201, { ...cuerpo, origen: 'monolito' }, { 'x-servido-por': 'monolito' });
    }
    if (req.method === 'GET' && (m = url.pathname.match(/^\/api\/clientes\/([\w-]+)$/))) {
      return json(res, 200, { id: m[1], nombre: 'Ana', origen: 'monolito' }, { 'x-servido-por': 'monolito' });
    }
    if (req.method === 'GET' && url.pathname === '/api/pedidos-antiguos') {
      return json(res, 200, { informe: 'pedidos 2019-2024', origen: 'monolito' }, { 'x-servido-por': 'monolito' });
    }
    json(res, 404, { error: `el monolito no conoce ${req.method} ${url.pathname}` }, { 'x-servido-por': 'monolito' });
  });
}
