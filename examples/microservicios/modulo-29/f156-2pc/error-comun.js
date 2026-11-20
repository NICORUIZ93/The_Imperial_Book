// Módulo 25 · F156 · Error común: tratar una transacción PREPARADA como una normal.
// Tras PREPARE TRANSACTION la conexión ya no tiene transacción: un ROLLBACK ahí no deshace nada,
// y cerrar la conexión (o reiniciar el proceso) tampoco. Ejecuta: node f156-2pc/error-comun.js
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, saldos } from './coordinador.js';

let pool = crearPool();
await prepararEsquema(pool);
const c = await pool.connect();
c.on('notice', (n) => console.log(`aviso de PostgreSQL: ${n.severity}: ${n.message}`));
await c.query('BEGIN');
await c.query("UPDATE f156_banco_a SET saldo = saldo - 100 WHERE cuenta = 'ana'");
await c.query("PREPARE TRANSACTION 'f156-olvidada'");
await c.query('ROLLBACK'); // ✘ no hay transacción en curso en esta conexión
c.release();
await pool.end(); // ✘ «se cae el proceso»: la transacción preparada sigue viva en el servidor

pool = crearPool();
const { rows: [x] } = await pool.query("SELECT gid, owner, database FROM pg_prepared_xacts WHERE gid = 'f156-olvidada'");
console.log(`MAL  → sigue en pg_prepared_xacts tras cerrar el pool: ${JSON.stringify(x)}`);
await pool.query("ROLLBACK PREPARED 'f156-olvidada'"); // ✔ la única forma de deshacerla (o COMMIT PREPARED para confirmarla)
console.log(`BIEN → ROLLBACK PREPARED: ${JSON.stringify(await saldos(pool))}`);
await pool.end();
