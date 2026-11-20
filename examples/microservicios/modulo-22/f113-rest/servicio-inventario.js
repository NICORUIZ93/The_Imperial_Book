// Módulo 18 · F113 · Servicio «inventario»: el servidor REST al que llaman los clientes de esta ficha.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). Ejecuta: node f113-rest/servicio-inventario.js
import { createServer } from 'node:http';
import { setTimeout as dormir } from 'node:timers/promises';

const EXISTENCIAS = { 'TEC-1': 12, 'MOU-2': 0 };

export function crearInventario() {
  return createServer(async (req, res) => {
    const json = (status, cuerpo) => res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(cuerpo));
    const m = /^\/existencias\/([\w-]+)$/.exec(req.url);
    if (req.method !== 'GET' || !m) return json(404, { detalle: `No existe ${req.method} ${req.url}` });
    const sku = m[1];
    if (sku === 'LENTO') await dormir(1500); // simula un servicio saturado
    if (sku === 'ROTO') return json(503, { detalle: 'Inventario en mantenimiento' });
    if (!(sku in EXISTENCIAS) && sku !== 'LENTO') return json(404, { detalle: `No existe el SKU ${sku}` });
    // Devuelve también el id de correlación que mandó el cliente: así se sigue una petición entre servicios.
    json(200, { sku, disponibles: EXISTENCIAS[sku] ?? 1, requestId: req.headers['x-request-id'] ?? null });
  });
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3113);
  crearInventario().listen(puerto, () => console.log(`inventario escuchando en http://localhost:${puerto}`));
}
