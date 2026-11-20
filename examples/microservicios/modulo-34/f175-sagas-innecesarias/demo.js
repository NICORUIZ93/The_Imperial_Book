// Módulo 30 · F175 · Ejecuta (con PostgreSQL arriba): node f175-sagas-innecesarias/demo.js
// beto está bloqueado: el tercer paso (sumar puntos) falla siempre. ¿Qué queda en la base de datos?
import { comprarConSaga, comprarConTransaccion, crearPool, estado, preparar } from './tienda.js';

const pool = crearPool();
const pedido = { id: 'P-1', sku: 'TEC-1', cantidad: 2, cliente: 'beto' };
const fmt = (e) => `stock=${e.stock} · pedidos=${JSON.stringify(e.pedidos)}`;

await preparar(pool);
await comprarConTransaccion(pool, pedido).catch(async (e) => console.log(`Transacción: falla «${e.message}» → ${fmt(await estado(pool))}`));

await preparar(pool);
await comprarConSaga(pool, pedido, {
  observar: async () => console.log(`Saga, a mitad (lo que ve otro usuario): ${fmt(await estado(pool))}`),
}).catch(async (e) => console.log(`Saga: falla «${e.message}» y compensa → ${fmt(await estado(pool))}`));

await preparar(pool);
await comprarConSaga(pool, pedido, { fallarCompensacion: true })
  .catch(async (e) => console.log(`Saga con caída al compensar («${e.message}») → ${fmt(await estado(pool))}`));
await pool.end();
