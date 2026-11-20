// Módulo 25 · F155 · Error común: creer que «exactly-once» cubre efectos externos (correo, HTTP, otra BD).
// El correo sale ANTES del commit; si el proceso muere antes de confirmar, el reintento lo envía otra vez.
// Ejecuta: node f155-exactly-once/error-comun.js
import { crearPool } from '../comun/pg.js';
import { consumir, depositar, prepararEsquema } from './offsets-en-bd.js';

const pool = crearPool();
await prepararEsquema(pool);
const correos = [];
const particion = [{ offset: 0, valor: { cuenta: 'A', monto: 100 } }];
const pos = { consumidor: 'saldos', topic: 'f155.depositos', particion: 0 };
const depositarYAvisar = async (tx, valor) => {
  await depositar(tx, valor);
  correos.push(`Recibiste ${valor.monto} en ${valor.cuenta}`); // efecto externo: no se puede deshacer con ROLLBACK
};
await consumir(pool, pos, particion, depositarYAvisar, { morirEn: 0 }).catch(() => {});
await consumir(pool, pos, particion, depositarYAvisar);
const { rows: [a] } = await pool.query("SELECT saldo FROM f155_saldos WHERE cuenta = 'A'");
console.log(`saldo = ${a.saldo} (exacto) · correos enviados = ${correos.length} (duplicado)`);
await pool.end();
