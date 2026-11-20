// Módulo 32 · F183 · ERROR COMÚN: limitador en memoria con 3 réplicas del gateway detrás de un balanceador.
// Cada réplica tiene su propio cubo: el cliente consigue 3 veces el límite contratado.
// Ejecuta: node f183-gateway-rate-limit/error-comun.js            (solo memoria)
//          REDIS_URL=redis://localhost:6379 node f183-gateway-rate-limit/error-comun.js   (compara con Redis)
import { LimitadorMemoria, LimitadorRedis } from './limitador.js';

async function rafaga(replicas, peticiones = 100) { // reparto round-robin, como un balanceador
  let aceptadas = 0;
  for (let i = 0; i < peticiones; i++) if ((await replicas[i % replicas.length].permitir('web')).permitido) aceptadas++;
  return aceptadas;
}
const opciones = { tasa: 1, capacidad: 10 }; // contrato: ráfaga de 10 peticiones
const memoria = [1, 2, 3].map(() => new LimitadorMemoria(opciones));
console.log(`3 réplicas con LimitadorMemoria: ${await rafaga(memoria)} de 100 aceptadas (contrato: 10)`);
if (process.env.REDIS_URL) {
  const { Redis } = await import('ioredis');
  const clientes = [1, 2, 3].map(() => new Redis(process.env.REDIS_URL));
  await clientes[0].del('error-comun:web');
  const compartido = clientes.map((redis) => new LimitadorRedis({ redis, ...opciones, prefijo: 'error-comun:' }));
  console.log(`3 réplicas con LimitadorRedis:   ${await rafaga(compartido)} de 100 aceptadas (contrato: 10)`);
  await Promise.all(clientes.map((c) => c.quit()));
} else {
  console.log('(sin REDIS_URL: se omite la comparación con LimitadorRedis)');
}
