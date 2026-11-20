// Módulo 22 · F136 · Error común: comprobar con GET y marcar con SET en dos pasos. Entre uno y otro hay un hueco:
// las copias que llegan a la vez ven «no existe» y TODAS procesan. Además, marcar ANTES del trabajo sin
// borrar al fallar perdería el mensaje si el proceso muere a mitad.
// Ejecuta (con Redis arriba):  node f136-dedup-redis/error-comun.js
import { createClient } from 'redis';
import { REDIS_URL } from '../comun/config.js';

export async function procesarUnaVezMal(redis, { consumidor, messageId }, trabajo) {
  const clave = `dedup:${consumidor}:${messageId}`;
  if (await redis.get(clave)) return { estado: 'duplicado' };   // 1) ¿ya está?
  await trabajo();                                              // 2) proceso…
  await redis.set(clave, 'hecho', { expiration: { type: 'EX', value: 3600 } }); // 3) …y marco. Demasiado tarde.
  return { estado: 'procesado' };
}

if (import.meta.main) {
  const redis = await createClient({ url: REDIS_URL }).connect();
  await redis.del('dedup:facturacion:P-1');
  let cobros = 0;
  // 5 copias del mismo mensaje llegan a la vez (5 réplicas del consumidor tras una reentrega masiva).
  await Promise.all(Array.from({ length: 5 }, () => procesarUnaVezMal(redis, { consumidor: 'facturacion', messageId: 'P-1' }, async () => { cobros++; })));
  console.log(`GET + SET: 5 copias simultáneas de P-1 → ${cobros} cobros`);
  await redis.del('dedup:facturacion:P-1');
  const { procesarUnaVez } = await import('./dedup.js');
  cobros = 0;
  await Promise.allSettled(Array.from({ length: 5 }, () => procesarUnaVez(redis, { consumidor: 'facturacion', messageId: 'P-1' }, async () => { cobros++; })));
  console.log(`SET NX:    5 copias simultáneas de P-1 → ${cobros} cobro`);
  await redis.close();
}
