// Módulo 25 · F156 · Ejecuta (PostgreSQL arriba): node f156-2pc/demo.js
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, saldos, transferir } from './coordinador.js';

const pool = crearPool();
await prepararEsquema(pool);
console.log(`T1 (300):  ${await transferir(pool, { gid: 'f156-t1', monto: 300 })} → ${JSON.stringify(await saldos(pool))}`);
console.log(`T2 (5000): ${await transferir(pool, { gid: 'f156-t2', monto: 5000 })} → ${JSON.stringify(await saldos(pool))}`);
console.log(`T3 (200):  ${await transferir(pool, { gid: 'f156-t3', monto: 200 }, { caerTrasPreparar: true })}`);

const { rows } = await pool.query("SELECT gid FROM pg_prepared_xacts WHERE gid LIKE 'f156-%' ORDER BY gid");
console.log(`en duda (pg_prepared_xacts): ${rows.map((r) => r.gid).join(', ')}`);
console.log(`leer sí se puede (valor anterior): ${JSON.stringify(await saldos(pool))}`);

// Otro pedido quiere cobrarle a ana mientras T3 sigue en duda: su fila está bloqueada por la transacción preparada.
const c = await pool.connect();
try {
  await c.query("SET lock_timeout = '1s'");
  await c.query("UPDATE f156_banco_a SET saldo = saldo - 10 WHERE cuenta = 'ana'");
} catch (error) {
  console.log(`otro cobro a ana: ${error.message}`);
} finally { c.release(); }

// Recuperación: alguien (el coordinador al volver, o una persona) decide. Aquí se confirma.
for (const { gid } of rows) await pool.query(`COMMIT PREPARED '${gid}'`);
console.log(`tras COMMIT PREPARED: ${JSON.stringify(await saldos(pool))}`);
await pool.end();
