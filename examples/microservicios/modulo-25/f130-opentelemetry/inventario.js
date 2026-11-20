// Módulo 21 · F130 · Servicio «inventario»: GET /stock/:sku. Ni una línea de OpenTelemetry: lo instrumenta telemetria.js.
// Ejecuta: OTEL_SERVICE_NAME=inventario node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/inventario.js
import http from 'node:http';

const STOCK = { 'TEC-1': 12, 'MOU-1': 0 };
const puerto = Number(process.env.PORT ?? 3131);

http.createServer((req, res) => {
  const sku = req.url.split('/')[2];
  const cuerpo = sku in STOCK ? { sku, disponibles: STOCK[sku] } : { error: 'no existe' };
  res.writeHead(sku in STOCK ? 200 : 404, { 'content-type': 'application/json' });
  res.end(JSON.stringify(cuerpo));
}).listen(puerto, () => console.log(`inventario escuchando en ${puerto}`));
