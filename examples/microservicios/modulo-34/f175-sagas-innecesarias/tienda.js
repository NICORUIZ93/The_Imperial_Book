// Módulo 30 · F175 · Sagas innecesarias: stock, pedido y puntos de fidelidad viven en el MISMO servicio y la MISMA
// base de datos. Lo comparamos hecho con una transacción local (BEGIN … COMMIT) y con una saga con compensaciones.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1 y PostgreSQL (18.7 en docker-compose.yml; sirve 14 o posterior).
import pg from 'pg';
import { PG_URL } from '../comun/config.js';

export const crearPool = (url = PG_URL) => new pg.Pool({ connectionString: url, max: 5 });

export async function preparar(pool) {
  await pool.query(`
    DROP TABLE IF EXISTS f175_pedidos, f175_stock, f175_clientes;
    CREATE TABLE f175_stock (sku text PRIMARY KEY, disponible int NOT NULL CHECK (disponible >= 0));
    CREATE TABLE f175_pedidos (id text PRIMARY KEY, sku text NOT NULL, cantidad int NOT NULL, estado text NOT NULL);
    CREATE TABLE f175_clientes (id text PRIMARY KEY, puntos int NOT NULL DEFAULT 0, bloqueado boolean NOT NULL DEFAULT false);
    INSERT INTO f175_stock VALUES ('TEC-1', 10);
    INSERT INTO f175_clientes (id, bloqueado) VALUES ('ana', false), ('beto', true);`);
}

export async function estado(pool) {
  const { rows: [s] } = await pool.query("SELECT disponible FROM f175_stock WHERE sku = 'TEC-1'");
  const { rows } = await pool.query('SELECT estado, count(*)::int AS n FROM f175_pedidos GROUP BY estado ORDER BY estado');
  return { stock: s.disponible, pedidos: Object.fromEntries(rows.map((r) => [r.estado, r.n])) };
}

// Los tres pasos, escritos para recibir cualquier cliente SQL (una conexión dentro de una transacción o el pool).
async function reservarStock(db, { sku, cantidad }) {
  const r = await db.query('UPDATE f175_stock SET disponible = disponible - $2 WHERE sku = $1 AND disponible >= $2', [sku, cantidad]);
  if (r.rowCount === 0) throw new Error('sin stock');
}
async function crearPedido(db, { id, sku, cantidad }, estadoInicial) {
  await db.query('INSERT INTO f175_pedidos VALUES ($1, $2, $3, $4)', [id, sku, cantidad, estadoInicial]);
}
async function sumarPuntos(db, { cliente, cantidad }) {
  const r = await db.query('UPDATE f175_clientes SET puntos = puntos + $2 WHERE id = $1 AND NOT bloqueado', [cliente, cantidad * 10]);
  if (r.rowCount === 0) throw new Error(`cliente ${cliente} bloqueado`);
}

// OPCIÓN A · Transacción local: todo o nada, sin estados intermedios visibles y sin código de compensación.
export async function comprarConTransaccion(pool, pedido) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await reservarStock(c, pedido);
    await crearPedido(c, pedido, 'confirmado');
    await sumarPuntos(c, pedido);
    await c.query('COMMIT');
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally {
    c.release();
  }
}

// OPCIÓN B · Saga: cada paso confirma por separado; si uno falla, se compensan los anteriores en orden inverso.
// `observar` se llama entre pasos (para ver lo que vería otro usuario); `fallarCompensacion` simula una caída a mitad.
export async function comprarConSaga(pool, pedido, { observar = async () => {}, fallarCompensacion = false } = {}) {
  await reservarStock(pool, pedido);
  await crearPedido(pool, pedido, 'pendiente');
  await observar();
  try {
    await sumarPuntos(pool, pedido);
    await pool.query("UPDATE f175_pedidos SET estado = 'confirmado' WHERE id = $1", [pedido.id]);
  } catch (error) {
    await compensar(pool, pedido, { fallarCompensacion });
    throw error;
  }
}

// Compensación idempotente: solo libera el stock si ESTA llamada movió el pedido de «pendiente» a «cancelado».
export async function compensar(pool, pedido, { fallarCompensacion = false, idempotente = true } = {}) {
  const r = idempotente
    ? await pool.query("UPDATE f175_pedidos SET estado = 'cancelado' WHERE id = $1 AND estado = 'pendiente'", [pedido.id])
    : await pool.query("UPDATE f175_pedidos SET estado = 'cancelado' WHERE id = $1", [pedido.id]);
  if (fallarCompensacion) throw new Error('el proceso murió antes de liberar el stock');
  if (r.rowCount === 1)
    await pool.query('UPDATE f175_stock SET disponible = disponible + $2 WHERE sku = $1', [pedido.sku, pedido.cantidad]);
}
