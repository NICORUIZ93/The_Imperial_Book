// Módulo 25 · Pool de PostgreSQL (pg 8.23.1) compartido por las fichas F152, F154, F155 y F156.
import pg from 'pg';
import { PG_URL } from './config.js';

export function crearPool(url = PG_URL) {
  return new pg.Pool({ connectionString: url, max: 10 });
}

// Ejecuta fn(cliente) dentro de BEGIN … COMMIT; si fn lanza, ROLLBACK y relanza el error.
export async function enTransaccion(pool, fn) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await fn(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    cliente.release();
  }
}
