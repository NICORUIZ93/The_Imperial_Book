// Módulo 15 · F104 · Connection pooling con pg 8.23.1: un grupo de conexiones abiertas que se prestan y se devuelven.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1. PostgreSQL 18.7 con Docker Compose.
import pg from 'pg';
import { pgUrl } from '../config.js';

export function crearPool(opciones = {}) {
  const pool = new pg.Pool({
    connectionString: pgUrl('f104'),
    max: 5, // máximo de conexiones abiertas a la vez (por defecto 10)
    idleTimeoutMillis: 10000, // cierra las que lleven 10 s sin uso
    connectionTimeoutMillis: 2000, // si en 2 s nadie devuelve una conexión, error (por defecto espera para siempre)
    ...opciones,
  });
  // Una conexión ociosa puede romperse (reinicio de la base, red): sin este manejador, el evento 'error' tumba el proceso.
  pool.on('error', (error) => console.error('Conexión ociosa perdida:', error.message));
  return pool;
}

// Lanza `consultas` consultas de 100 ms a la vez y mide cuánto tarda el lote y cuántas llegaron a hacer fila.
export async function medir(max, consultas = 20) {
  const pool = crearPool({ max });
  let enFila = 0;
  const inicio = performance.now();
  const lote = Array.from({ length: consultas }, () => pool.query('SELECT pg_sleep(0.1)'));
  enFila = pool.waitingCount; // peticiones esperando a que se libere una conexión
  await Promise.all(lote);
  const ms = performance.now() - inicio;
  const abiertas = pool.totalCount;
  await pool.end();
  return { max, ms, enFila, abiertas };
}
