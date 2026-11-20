// Módulo 22 · F136 · Demo: RabbitMQ (at-least-once) entrega dos veces el pedido P-1; el cobro se hace UNA vez.
// Ejecuta (con Redis arriba):  node f136-dedup-redis/demo.js
import { createClient } from 'redis';
import { REDIS_URL } from '../comun/config.js';
import { procesarUnaVez } from './dedup.js';

const redis = await createClient({ url: REDIS_URL }).connect();
await redis.del(['dedup:facturacion:P-1', 'dedup:facturacion:P-2']);
const cobros = [];
const cobrar = (id, total) => async () => { cobros.push(id); return `cobrados ${total}`; };

// Entregas tal como podrían llegar: P-1 se reentrega porque el ack anterior se perdió en la red.
for (const [id, total] of [['P-1', 100], ['P-2', 50], ['P-1', 100]]) {
  const r = await procesarUnaVez(redis, { consumidor: 'facturacion', messageId: id }, cobrar(id, total));
  console.log(`${id} → ${r.estado}${r.resultado ? ` (${r.resultado})` : ''}`);
}
console.log(`cobros reales: ${cobros.join(', ')}`);
console.log(`TTL de dedup:facturacion:P-1 = ${await redis.ttl('dedup:facturacion:P-1')} s · valor = ${await redis.get('dedup:facturacion:P-1')}`);
await redis.close();
