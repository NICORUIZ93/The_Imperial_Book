// Módulo 25 · F154 · Consumidor idempotente: la marca «ya procesado» y el efecto van en la MISMA transacción.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7.
import { enTransaccion } from '../comun/pg.js';

export async function prepararEsquema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS f154_procesados (
      consumidor text NOT NULL,          -- cada grupo de consumidores lleva su propia cuenta
      evento_id  text NOT NULL,          -- id de NEGOCIO del evento (no el offset de Kafka)
      procesado_en timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (consumidor, evento_id)
    );
    CREATE TABLE IF NOT EXISTS f154_puntos (cliente text PRIMARY KEY, puntos integer NOT NULL);
    TRUNCATE f154_procesados, f154_puntos;`);
}

// Devuelve 'procesado' o 'duplicado'. Si efecto() lanza, se deshace también la marca y el reintento procesará.
export function procesarUnaVez(pool, consumidor, evento, efecto) {
  return enTransaccion(pool, async (tx) => {
    // ON CONFLICT DO NOTHING: si otra transacción insertó la misma clave, esta espera a que termine y luego no inserta.
    const { rowCount } = await tx.query(
      'INSERT INTO f154_procesados (consumidor, evento_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [consumidor, evento.id],
    );
    if (rowCount === 0) return 'duplicado';
    await efecto(tx, evento);
    return 'procesado';
  });
}

// Efecto de ejemplo: sumar puntos de fidelidad (NO es idempotente por sí solo: sumar dos veces da el doble).
export async function sumarPuntos(tx, { cliente, puntos }) {
  await tx.query(
    `INSERT INTO f154_puntos (cliente, puntos) VALUES ($1, $2)
     ON CONFLICT (cliente) DO UPDATE SET puntos = f154_puntos.puntos + EXCLUDED.puntos`,
    [cliente, puntos],
  );
}
