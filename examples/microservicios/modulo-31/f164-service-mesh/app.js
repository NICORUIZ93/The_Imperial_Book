// Módulo 27 · F164 · la aplicación «inventario», idéntica antes y después: NO sabe nada de seguridad.
// Tiene un endpoint administrativo peligroso (POST /admin/ajustes) que nadie debería alcanzar desde la red.
import http from 'node:http';
import { responder } from '../comun/cliente.js';

export function crearInventario() {
  let stock = 10;
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/stock') return responder(res, 200, { stock });
    if (req.method === 'POST' && req.url === '/reservas') { stock -= 1; return responder(res, 200, { reservado: true, stock }); }
    if (req.method === 'POST' && req.url === '/admin/ajustes') { stock = 0; return responder(res, 200, { ajustado: true, stock }); }
    responder(res, 404, { error: 'no existe' });
  });
}
