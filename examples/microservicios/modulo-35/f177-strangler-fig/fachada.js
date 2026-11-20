// Módulo 31 · F177 · Fachada Strangler Fig: un proxy delante del monolito que desvía, ruta a ruta y por porcentaje
// de clientes, el tráfico hacia los servicios nuevos. Todo lo que no está en la tabla sigue yendo al monolito.
// Versiones: Node.js 26.13.1 LTS, sin dependencias (node:http).
import { http } from '../comun/http.js';

// Hash FNV-1a de 32 bits: el mismo cliente cae siempre en el mismo «cubo» de 0 a 99 (asignación pegajosa).
export function cubo(clave) {
  let h = 0x811c9dc5;
  for (const c of Buffer.from(String(clave))) { h ^= c; h = Math.imul(h, 0x01000193) >>> 0; }
  return h % 100;
}

// ¿La ruta pertenece al prefijo? Solo si coincide entera o le sigue «/» o «?»: /api/pedidos-antiguos NO es /api/pedidos.
export function coincide(ruta, prefijo) {
  return ruta === prefijo || ruta.startsWith(prefijo + '/') || ruta.startsWith(prefijo + '?');
}

// Decide el destino: la regla más específica (prefijo más largo) que coincide y cuyo porcentaje incluye al cliente.
export function elegirDestino(metodo, ruta, rutas, claveCliente) {
  const candidatas = rutas
    .filter((r) => coincide(ruta, r.prefijo) && (!r.metodos || r.metodos.includes(metodo)))
    .sort((a, b) => b.prefijo.length - a.prefijo.length);
  const regla = candidatas[0];
  if (regla && cubo(claveCliente ?? 'anonimo') < (regla.porcentaje ?? 100)) return regla.destino;
  return 'monolito';
}

// Proxy: reenvía método, ruta, cabeceras y cuerpo tal cual (en streaming) y devuelve la respuesta del destino.
export function crearFachada({ rutas, destinos }) {
  return http.createServer((req, res) => {
    const destino = elegirDestino(req.method, req.url, rutas, req.headers['x-cliente-id']);
    const base = new URL(destinos[destino]);
    const salida = http.request(
      { host: base.hostname, port: base.port, method: req.method, path: req.url, headers: { ...req.headers, 'x-via-fachada': '1' } },
      (r) => { res.writeHead(r.statusCode, { ...r.headers, 'x-servido-por': r.headers['x-servido-por'] ?? destino }); r.pipe(res); },
    );
    salida.on('error', (e) => { res.writeHead(502, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: `${destino}: ${e.message}` })); });
    req.pipe(salida);
  });
}
