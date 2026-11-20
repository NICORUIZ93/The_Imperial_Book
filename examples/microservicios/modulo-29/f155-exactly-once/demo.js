// Módulo 25 · F155 · Ejecuta (PostgreSQL arriba): node f155-exactly-once/demo.js
// Cinco depósitos de 100 a la cuenta A. El proceso muere en el offset 2 y vuelve a arrancar.
import { crearPool } from '../comun/pg.js';
import { consumir, depositar, prepararEsquema } from './offsets-en-bd.js';

const pool = crearPool();
await prepararEsquema(pool);
const particion = [0, 1, 2, 3, 4].map((offset) => ({ offset, valor: { cuenta: 'A', monto: 100 } }));
const pos = { consumidor: 'saldos', topic: 'f155.depositos', particion: 0 };

await consumir(pool, pos, particion, depositar, { morirEn: 2 }).catch((e) => console.log(`1.ª ejecución: ${e.message}`));
const saldo = async () => (await pool.query("SELECT saldo FROM f155_saldos WHERE cuenta = 'A'")).rows[0].saldo;
console.log(`tras la caída: saldo = ${await saldo()}`);
const desde = await consumir(pool, pos, particion, depositar);
console.log(`2.ª ejecución: retoma desde el offset ${desde}`);
console.log(`saldo final = ${await saldo()} (5 × 100, ni uno más ni uno menos)`);
await pool.end();
