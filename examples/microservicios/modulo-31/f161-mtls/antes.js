// Módulo 27 · F161 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// «pagos» confía en la red interna: HTTP plano y la identidad del llamante sale de una cabecera
// (x-servicio) que cualquiera puede escribir. Es lo que pasa con mTLS en PERMISSIVE y sin autorización.
// Ejecuta: node f161-mtls/antes.js   (http://127.0.0.1:3161)
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { escuchar, responder } from '../comun/cliente.js';

export function crearPagosAntes() {
  return http.createServer((req, res) => {
    const quien = req.headers['x-servicio'] ?? 'anónimo'; // ✘ identidad declarada, no demostrada
    if (req.method === 'POST' && req.url === '/cobros') {
      if (quien !== 'pedidos') return responder(res, 403, { error: 'solo pedidos cobra', quien });
      return responder(res, 200, { cobrado: true, quien });
    }
    responder(res, 404, { error: 'no existe' });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { puerto } = await escuchar(crearPagosAntes(), 3161);
  console.log(`pagos ANTES en http://127.0.0.1:${puerto} (identidad por cabecera x-servicio)`);
}
