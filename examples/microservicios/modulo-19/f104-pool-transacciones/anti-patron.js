// ANTI-PATRÓN F104: «transacción» con pool.query(). Ejecuta: node f104-pool-transacciones/anti-patron.js
// Dos peticiones a la vez: la 1 debe fallar (Eva no existe) y la 2 debe mover 20 de Luis a Ana.
import { crearPool } from './pool.js';
import { preparar, saldos, transferir, transferirMal } from './cuentas.js';

for (const [nombre, fn] of [['pool.query (MAL)', transferirMal], ['client del pool (BIEN)', transferir]]) {
  const pool = crearPool({ max: 1 }); // una sola conexión: el caso más simple para ver el problema
  await preparar(pool);
  const [r1, r2] = await Promise.allSettled([fn(pool, 'ana', 'eva', 10), fn(pool, 'luis', 'ana', 20)]);
  console.log(`${nombre}: petición 1 ${r1.status} · petición 2 ${r2.status} · saldos`, await saldos(pool));
  await pool.end();
}
