// Módulo 22 · F136 · Deduplicación con Redis: procesar cada mensaje UNA vez aunque llegue varias (at-least-once).
// Requisitos: Node.js 26.13.1 LTS, redis (node-redis) 6.3.1, Redis 8.10.2.
//
// Clave dedup:<consumidor>:<messageId> con dos estados:
//   «en-curso» (TTL corto)  → alguien lo está procesando ahora; si muere, la clave caduca y otro puede reintentar
//   «hecho»    (TTL largo)  → ya se procesó: cualquier copia posterior se descarta
// SET ... NX es ATÓMICO: de N consumidores que lo intentan a la vez, exactamente uno gana.
export class EnCursoEnOtroLado extends Error {}

export async function procesarUnaVez(redis, { consumidor, messageId }, trabajo,
  { ttlEnCursoSeg = 30, ttlHechoSeg = 7 * 24 * 3600 } = {}) {
  const clave = `dedup:${consumidor}:${messageId}`;
  // SET clave en-curso NX EX 30 → 'OK' si no existía; null si ya existía (otra copia llegó antes).
  const gane = await redis.set(clave, 'en-curso', { condition: 'NX', expiration: { type: 'EX', value: ttlEnCursoSeg } });
  if (gane === null) {
    const estado = await redis.get(clave);
    if (estado === 'hecho') return { estado: 'duplicado' };
    throw new EnCursoEnOtroLado(`${messageId} se está procesando en otro consumidor`); // → nack con requeue
  }
  try {
    const resultado = await trabajo();
    await redis.set(clave, 'hecho', { expiration: { type: 'EX', value: ttlHechoSeg } }); // la ventana de deduplicación
    return { estado: 'procesado', resultado };
  } catch (error) {
    await redis.del(clave); // falló: libera la clave para que la reentrega lo intente de nuevo
    throw error;
  }
}
