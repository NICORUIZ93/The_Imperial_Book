// Módulo 19 · F121 · ERROR COMÚN: INCR y EXPIRE en dos comandos separados. Si el proceso muere (o la red falla)
// entre los dos, la clave queda SIN caducidad y ese cliente se queda bloqueado para siempre.
// Requisitos: Redis del laboratorio arriba. Ejecuta: node f121-rate-limiting/error-comun.js
import { conectarRedis, ventanaFija } from './limitadores.js';

const redis = await conectarRedis(process.env.REDIS_URL ?? 'redis://127.0.0.1:26379');
const cliente = `ana-${Date.now()}`;

console.log('== MAL: dos comandos (INCR … y luego EXPIRE)');
const clave = `mal:${cliente}`;
const actual = await redis.incr(clave);
if (actual === 1) {
  // Aquí «muere» el proceso (despliegue, OOM, corte de red): el EXPIRE nunca llega a Redis.
  // await redis.expire(clave, 10);
}
for (let i = 0; i < 5; i += 1) await redis.incr(clave); // el cliente agota su límite de 5
console.log(`   contador=${await redis.get(clave)} TTL=${await redis.ttl(clave)}   <- TTL -1: nunca caduca, 429 para siempre`);

console.log('== BIEN: INCR + PEXPIRE dentro de un script Lua (atómico)');
for (let i = 0; i < 6; i += 1) await ventanaFija(redis, cliente, { limite: 5, ventanaMs: 10_000 });
console.log(`   contador=${await redis.get(`vf:${cliente}`)} TTL=${await redis.ttl(`vf:${cliente}`)}   <- caduca sola al terminar la ventana`);

await redis.del(clave);
await redis.destroy();
