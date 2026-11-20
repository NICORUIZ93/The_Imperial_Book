// Módulo 32 · F183 · test con Redis de verdad: tres «réplicas» comparten el cubo. Necesita REDIS_URL.
// REDIS_URL=redis://localhost:6379 node --test f183-gateway-rate-limit/limitador-redis.infra.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Redis } from 'ioredis';
import { LimitadorRedis } from './limitador.js';

test('LimitadorRedis: 3 réplicas aceptan en total la capacidad del cubo (10 de 30)', { skip: !process.env.REDIS_URL && 'sin REDIS_URL' }, async () => {
  const clientes = [1, 2, 3].map(() => new Redis(process.env.REDIS_URL));
  try {
    await clientes[0].del('test-infra:web');
    const replicas = clientes.map((redis) => new LimitadorRedis({ redis, tasa: 0.1, capacidad: 10, prefijo: 'test-infra:' }));
    const decisiones = await Promise.all(Array.from({ length: 30 }, (_, i) => replicas[i % 3].permitir('web')));
    assert.equal(decisiones.filter((d) => d.permitido).length, 10);
    assert.ok(await clientes[0].pttl('test-infra:web') > 0, 'la clave caduca sola');
  } finally { await Promise.all(clientes.map((c) => c.quit())); }
});
