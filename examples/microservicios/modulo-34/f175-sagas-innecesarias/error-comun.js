// Módulo 30 · F175 · Error común: compensación no idempotente. El orquestador no recibe respuesta (timeout) y la
// reintenta: el stock se libera dos veces y aparecen unidades que no existen. Ejecuta: node f175-sagas-innecesarias/error-comun.js
import { comprarConSaga, compensar, crearPool, estado, preparar } from './tienda.js';

const pool = crearPool();
const pedido = { id: 'P-1', sku: 'TEC-1', cantidad: 2, cliente: 'beto' };
for (const idempotente of [false, true]) {
  await preparar(pool);
  await comprarConSaga(pool, pedido).catch(() => {}); // falla en «sumar puntos» y compensa una vez
  await compensar(pool, pedido, { idempotente }); // el reintento
  const { stock } = await estado(pool);
  console.log(`${idempotente ? 'BIEN → compensación idempotente' : 'MAL  → compensación repetida  '}: stock = ${stock} (había 10)`);
}
await pool.end();
