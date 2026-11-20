// Módulo 25 · F155 · «Exactly-once» efectivo fuera de Kafka: el resultado y el offset se guardan en la MISMA transacción.
// Al reiniciar, el consumidor lee el offset de la BD (no el del grupo de Kafka) y sigue desde ahí.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7.
import { enTransaccion } from '../comun/pg.js';

export async function prepararEsquema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS f155_offsets (
      consumidor text, topic text, particion int, siguiente bigint NOT NULL,
      PRIMARY KEY (consumidor, topic, particion));
    CREATE TABLE IF NOT EXISTS f155_saldos (cuenta text PRIMARY KEY, saldo bigint NOT NULL);
    TRUNCATE f155_offsets, f155_saldos;`);
}

export async function leerOffset(pool, { consumidor, topic, particion }) {
  const { rows } = await pool.query(
    'SELECT siguiente FROM f155_offsets WHERE consumidor = $1 AND topic = $2 AND particion = $3', [consumidor, topic, particion]);
  return rows.length ? Number(rows[0].siguiente) : 0;
}

export async function depositar(tx, { cuenta, monto }) {
  await tx.query(
    `INSERT INTO f155_saldos VALUES ($1, $2) ON CONFLICT (cuenta) DO UPDATE SET saldo = f155_saldos.saldo + EXCLUDED.saldo`,
    [cuenta, monto]);
}

// BIEN: efecto + offset en una transacción. Un fallo en cualquier punto deshace las dos cosas.
export function procesarMensaje(pool, pos, { offset, valor }, aplicar, { fallarAntesDelCommit = false } = {}) {
  return enTransaccion(pool, async (tx) => {
    await aplicar(tx, valor);
    await tx.query(
      `INSERT INTO f155_offsets VALUES ($1, $2, $3, $4)
       ON CONFLICT (consumidor, topic, particion) DO UPDATE SET siguiente = EXCLUDED.siguiente`,
      [pos.consumidor, pos.topic, pos.particion, offset + 1]);
    if (fallarAntesDelCommit) throw new Error(`proceso muerto en el offset ${offset}`);
  });
}

// Consume una partición (array de mensajes, como los devolvería Kafka) desde el offset guardado.
export async function consumir(pool, pos, particion, aplicar, { morirEn } = {}) {
  const desde = await leerOffset(pool, pos);
  for (const mensaje of particion.slice(desde)) {
    await procesarMensaje(pool, pos, mensaje, aplicar, { fallarAntesDelCommit: mensaje.offset === morirEn });
  }
  return desde;
}
