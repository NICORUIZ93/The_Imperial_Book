// Módulo 19 · Servicio «inventario»: la dependencia a la que le vamos a provocar fallos.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). Ejecuta: node comun/inventario.js [puerto]
import http from 'node:http';

const STOCK = { 7: 12, 8: 0, 9: 3 };
const estado = { consultas: 0, intentosDeReserva: 0, reservasCreadas: 0 };
const porClave = new Map(); // Idempotency-Key -> reserva ya creada

function responder(res, status, cuerpo) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(cuerpo));
}

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://inventario');
  const stock = url.pathname.match(/^\/stock\/(\w+)$/);
  if (req.method === 'GET' && stock) {
    estado.consultas += 1;
    const sku = stock[1];
    if (!(sku in STOCK)) return responder(res, 404, { error: `sku ${sku} desconocido` });
    return responder(res, 200, { sku, stock: STOCK[sku] });
  }
  if (req.method === 'POST' && url.pathname === '/reservas') {
    estado.intentosDeReserva += 1;
    const clave = req.headers['idempotency-key'];
    if (clave && porClave.has(clave)) return responder(res, 200, porClave.get(clave)); // repetida: misma respuesta
    estado.reservasCreadas += 1;
    const reserva = { reserva: estado.reservasCreadas };
    if (clave) porClave.set(clave, reserva);
    return responder(res, 201, reserva);
  }
  // Rutas de control del laboratorio: úsalas directo en el puerto 9000 (sin pasar por Toxiproxy).
  if (req.method === 'GET' && url.pathname === '/contador') return responder(res, 200, estado);
  if (req.method === 'POST' && url.pathname === '/reiniciar') {
    estado.consultas = 0; estado.intentosDeReserva = 0; estado.reservasCreadas = 0; porClave.clear();
    return responder(res, 200, estado);
  }
  if (url.pathname === '/salud') return responder(res, 200, { estado: 'ok' });
  responder(res, 404, { error: 'ruta desconocida' });
});

const puerto = Number(process.argv[2] ?? process.env.PORT ?? 9000);
servidor.listen(puerto, () => console.log(`inventario escuchando en :${puerto}`));
process.on('SIGTERM', () => servidor.close(() => process.exit(0)));
