// Módulo 31 · F177 · ERROR COMÚN: enrutar con ruta.startsWith(prefijo) sin respetar el límite del segmento.
// /api/pedidos-antiguos «empieza por» /api/pedidos y acaba en el servicio nuevo, que no lo conoce: 404 en producción.
// Ejecuta: node f177-strangler-fig/error-comun.js
import { cerrar, escuchar, pedir, http } from '../comun/http.js';
import { crearMonolito } from './monolito.js';
import { crearPedidosNuevo } from './pedidos-nuevo.js';

const mono = crearMonolito();
const nuevo = crearPedidosNuevo();
const destinos = { monolito: await escuchar(mono), pedidos: await escuchar(nuevo) };

// La fachada «ingenua»: misma idea que fachada.js, pero con startsWith a secas.
const ingenua = http.createServer((req, res) => {
  const destino = req.url.startsWith('/api/pedidos') ? 'pedidos' : 'monolito';
  const base = new URL(destinos[destino]);
  const salida = http.request({ host: base.hostname, port: base.port, method: req.method, path: req.url, headers: req.headers },
    (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  req.pipe(salida);
});
const url = await escuchar(ingenua);
const r = await pedir(url + '/api/pedidos-antiguos');
console.log(`GET /api/pedidos-antiguos -> ${r.estado} servido por ${r.servidoPor}: ${JSON.stringify(r.cuerpo)}`);
await Promise.all([cerrar(ingenua), cerrar(mono), cerrar(nuevo)]);
