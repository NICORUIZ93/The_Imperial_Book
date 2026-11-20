// Módulo 32 · F183 · API Gateway del proyecto: autentica la API key, aplica rate limiting por cliente y reenvía al
// servicio de reservas. Respuesta al superar el límite: 429 + Retry-After (segundos, RFC 9110) + X-RateLimit-Remaining.
// Ejecuta: RESERVAS_URL=http://localhost:8081 [REDIS_URL=redis://localhost:6379] node f183-gateway-rate-limit/gateway.js
import { pathToFileURL } from 'node:url';
import { http, json } from '../comun/http.js';
import { LimitadorMemoria, LimitadorRedis } from './limitador.js';

export const CLIENTES = { 'clave-web': 'web', 'clave-movil': 'movil', 'clave-socio': 'socio' };

export function crearGateway({ reservasUrl, limitador, clientes = CLIENTES }) {
  const destino = new URL(reservasUrl);
  return http.createServer(async (req, res) => {
    if (req.url === '/salud') return json(res, 200, { estado: 'UP' });
    const cliente = clientes[req.headers['x-api-key']];
    if (!cliente) return json(res, 401, { error: 'falta X-Api-Key o no es válida' });
    let decision;
    try { decision = await limitador.permitir(cliente); }
    catch { decision = { permitido: true, restantes: -1 }; } // Redis caído: se deja pasar (fail-open) y se alerta
    if (!decision.permitido) {
      return json(res, 429, { error: `límite de peticiones superado para «${cliente}»` },
        { 'retry-after': String(Math.max(1, Math.ceil(decision.reintentarEnMs / 1000))), 'x-ratelimit-remaining': '0' });
    }
    if (!req.url.startsWith('/reservas')) return json(res, 404, { error: 'ruta no publicada en el gateway' });
    const salida = http.request({ host: destino.hostname, port: destino.port, method: req.method, path: req.url,
      headers: { ...req.headers, 'x-cliente': cliente }, timeout: 3_000 }, (r) => {
      res.writeHead(r.statusCode, { ...r.headers, 'x-ratelimit-remaining': String(decision.restantes) }); r.pipe(res);
    });
    salida.on('timeout', () => salida.destroy(new Error('timeout de 3 s')));
    salida.on('error', (e) => { if (!res.headersSent) json(res, 502, { error: `reservas: ${e.message}` }); });
    req.pipe(salida);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opciones = { tasa: Number(process.env.TASA ?? 20), capacidad: Number(process.env.CAPACIDAD ?? 40) };
  let limitador = new LimitadorMemoria(opciones);
  if (process.env.REDIS_URL) { const { Redis } = await import('ioredis'); limitador = new LimitadorRedis({ redis: new Redis(process.env.REDIS_URL), ...opciones }); }
  const g = crearGateway({ reservasUrl: process.env.RESERVAS_URL ?? 'http://localhost:8081', limitador });
  g.listen(Number(process.env.PORT ?? 8080), () => console.log(`gateway en :${g.address().port} · ${limitador.constructor.name} ${opciones.tasa}/s, ráfaga ${opciones.capacidad}`));
}
