// Módulo 19 · F121 · ANTI-PATRÓN: limitar en la memoria de cada instancia. Con N instancias el límite real es N veces mayor.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0 y rate-limiter-flexible 11.5.0. Ejecuta: node f121-rate-limiting/anti-patron.js
import express from 'express';
import { once } from 'node:events';
import { RateLimiterMemory } from 'rate-limiter-flexible';

async function instanciaConLimiteEnMemoria(puerto) {
  const limitador = new RateLimiterMemory({ points: 5, duration: 10 }); // un contador POR PROCESO
  const app = express();
  app.use((req, res, next) => limitador.consume(req.get('x-api-key')).then(() => next(), () => res.status(429).end()));
  app.get('/api/ofertas', (_req, res) => res.json({ instancia: puerto }));
  const servidor = app.listen(puerto);
  await once(servidor, 'listening');
  return servidor;
}
const servidores = [await instanciaConLimiteEnMemoria(3521), await instanciaConLimiteEnMemoria(3621), await instanciaConLimiteEnMemoria(3721)];
const codigos = [];
for (let i = 0; i < 18; i += 1) { // el balanceador reparte por turnos entre las 3 instancias
  const r = await fetch(`http://127.0.0.1:${[3521, 3621, 3721][i % 3]}/api/ofertas`, { headers: { 'x-api-key': 'ana' } });
  codigos.push(r.status);
}
const aceptadas = codigos.filter((c) => c === 200).length;
console.log(`límite declarado: 5 cada 10 s · 3 instancias · 18 peticiones -> ${aceptadas} aceptadas, ${18 - aceptadas} rechazadas`);
for (const s of servidores) { s.close(); s.closeAllConnections(); }
