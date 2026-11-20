// Módulo 25 · F154 · Ejecuta (PostgreSQL arriba): node f154-idempotencia/demo.js
// Simula las entregas que hace Kafka «al menos una vez»: duplicados por reintento del productor y por rebalanceo.
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, procesarUnaVez, sumarPuntos } from './idempotencia.js';

const pool = crearPool();
await prepararEsquema(pool);
const entregas = [
  { offset: 0, evento: { id: 'C-1', cliente: 'ana', puntos: 10 } },
  { offset: 1, evento: { id: 'C-1', cliente: 'ana', puntos: 10 } }, // reintento del productor: otro offset, mismo evento
  { offset: 2, evento: { id: 'C-2', cliente: 'ana', puntos: 5 } },
  { offset: 2, evento: { id: 'C-2', cliente: 'ana', puntos: 5 } }, // rebalanceo antes del commit: mismo offset otra vez
];
for (const { offset, evento } of entregas) {
  console.log(`offset ${offset} ${evento.id} → ${await procesarUnaVez(pool, 'fidelidad', evento, sumarPuntos)}`);
}
// Cinco copias de C-3 A LA VEZ (cinco consumidores tras un rebalanceo): la clave primaria deja pasar una.
const r = await Promise.all(Array.from({ length: 5 }, () => procesarUnaVez(pool, 'fidelidad', { id: 'C-3', cliente: 'ana', puntos: 1 }, sumarPuntos)));
console.log(`C-3 en paralelo ×5 → ${r.filter((x) => x === 'procesado').length} procesado, ${r.filter((x) => x === 'duplicado').length} duplicados`);
const { rows: [ana] } = await pool.query("SELECT puntos FROM f154_puntos WHERE cliente = 'ana'");
console.log(`puntos de ana = ${ana.puntos} (10 + 5 + 1)`);
await pool.end();
