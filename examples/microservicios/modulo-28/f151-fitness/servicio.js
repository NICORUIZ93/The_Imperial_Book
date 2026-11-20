// Módulo 24 · F151 · Servicio «pedidos» instrumentado con prom-client: latencia (histograma), respuestas por código y
// llamadas a otros servicios. Las variables de entorno simulan una versión degradada de forma DETERMINISTA (por id).
// Requisitos: Node.js 26.13.1 LTS y prom-client 15.1.3. Ejecuta: node f151-fitness/servicio.js   (:3151)
//   PCT_LENTAS=2 LENTA_MS=450 TASA_ERROR=0.01 DEPENDENCIAS=inventario,pagos node f151-fitness/servicio.js
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import client from 'prom-client';

const PCT_LENTAS = Number(process.env.PCT_LENTAS ?? 0);        // % de pedidos que tardan LENTA_MS
const LENTA_MS = Number(process.env.LENTA_MS ?? 450);
const TASA_ERROR = Number(process.env.TASA_ERROR ?? 0);        // fracción de pedidos que fallan con 500
const DEPENDENCIAS = (process.env.DEPENDENCIAS ?? 'inventario').split(',').filter(Boolean); // a quién llama en síncrono

const registro = new client.Registry();
const duracion = new client.Histogram({
  name: 'http_request_duration_seconds', help: 'Duración de las peticiones HTTP', labelNames: ['ruta'],
  buckets: [0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2], registers: [registro],
});
const peticiones = new client.Counter({ name: 'http_requests_total', help: 'Peticiones HTTP por código', labelNames: ['ruta', 'codigo'], registers: [registro] });
const llamadas = new client.Counter({ name: 'dependencias_llamadas_total', help: 'Llamadas síncronas a otros servicios', labelNames: ['destino'], registers: [registro] });

const cubeta = (id, sal) => Number.parseInt(createHash('sha256').update(sal + id).digest('hex').slice(0, 8), 16) % 10000;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export function crearServidor() {
  return createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.writeHead(200, { 'content-type': registro.contentType }).end(await registro.metrics());
      return;
    }
    const m = req.url.match(/^\/pedidos\/([\w-]+)$/);
    if (!m) { res.writeHead(404).end(); return; }
    const fin = duracion.startTimer({ ruta: '/pedidos' });
    const lenta = cubeta(m[1], 'lenta') < PCT_LENTAS * 100;
    await esperar(lenta ? LENTA_MS : 10);
    for (const d of DEPENDENCIAS) llamadas.inc({ destino: d }); // aquí iría el fetch real al servicio d
    const codigo = cubeta(m[1], 'error') < TASA_ERROR * 10000 ? 500 : 200;
    res.writeHead(codigo, { 'content-type': 'application/json' }).end(JSON.stringify({ id: m[1], codigo }));
    peticiones.inc({ ruta: '/pedidos', codigo: String(codigo) });
    fin();
  });
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3151);
  crearServidor().listen(puerto, () => console.log(JSON.stringify({ msg: 'escuchando', puerto, PCT_LENTAS, LENTA_MS, TASA_ERROR, DEPENDENCIAS })));
}
