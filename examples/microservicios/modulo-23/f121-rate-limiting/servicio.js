// Módulo 19 · F121 · API Express 5.3.0 con rate limiting compartido en Redis (rate-limiter-flexible 11.5.0).
// Requisitos: Node.js 26.13.1 LTS, redis 6.3.1 y Redis arriba. Ejecuta: PORT=3121 node f121-rate-limiting/servicio.js
// Variables: LIMITE (5), VENTANA_S (10), SI_REDIS_FALLA = memoria | abrir | cerrar (memoria por defecto).
import express from 'express';
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { conectarRedis } from './limitadores.js';

export async function crearApp({
  redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:26379',
  limite = Number(process.env.LIMITE ?? 5),
  ventanaS = Number(process.env.VENTANA_S ?? 10),
  siRedisFalla = process.env.SI_REDIS_FALLA ?? 'memoria',
  instancia = process.env.PORT ?? 'test',
} = {}) {
  const redis = await conectarRedis(redisUrl);
  const limitador = new RateLimiterRedis({
    storeClient: redis,
    useRedisPackage: true,   // el cliente es node-redis (no ioredis)
    keyPrefix: 'rl',
    points: limite,          // peticiones permitidas…
    duration: ventanaS,      // …por ventana de N segundos, por cliente
    // «Seguro»: si Redis falla, cada instancia limita en memoria con el mismo límite (peor, pero sigue protegiendo).
    insuranceLimiter: siRedisFalla === 'memoria' ? new RateLimiterMemory({ points: limite, duration: ventanaS }) : undefined,
  });

  const app = express();
  app.set('trust proxy', 1); // detrás de UN proxy o balanceador: req.ip sale de X-Forwarded-For

  app.use(async (req, res, next) => {
    const cliente = req.get('x-api-key') ?? req.ip; // limita por credencial; la IP es el último recurso
    try {
      const r = await limitador.consume(cliente);
      res.set({ 'RateLimit-Limit': limite, 'RateLimit-Remaining': r.remainingPoints, 'RateLimit-Reset': Math.ceil(r.msBeforeNext / 1000) });
      next();
    } catch (rechazo) {
      if (rechazo instanceof RateLimiterRes) { // límite superado: 429 y cuándo volver
        res.set({ 'RateLimit-Limit': limite, 'RateLimit-Remaining': 0, 'Retry-After': Math.ceil(rechazo.msBeforeNext / 1000) });
        return res.status(429).json({ error: 'demasiadas peticiones', reintentaEnSegundos: Math.ceil(rechazo.msBeforeNext / 1000) });
      }
      // Redis falló y no hay seguro: hay que DECIDIR. Abrir = dejar pasar (disponibilidad). Cerrar = 503 (protección).
      console.log(`[limitador] Redis no responde (${rechazo.message}) -> ${siRedisFalla}`);
      if (siRedisFalla === 'abrir') { res.set('X-RateLimit-Estado', 'sin-limite'); return next(); }
      res.status(503).json({ error: 'limitador no disponible' });
    }
  });

  app.get('/api/ofertas', (_req, res) => res.json({ ofertas: ['teclado', 'mouse'], instancia }));
  return { app, redis };
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3121);
  const { app } = await crearApp();
  app.listen(puerto, () => console.log(`ofertas (F121) en :${puerto}`));
}
