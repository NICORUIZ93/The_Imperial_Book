// ERROR COMÚN F104: olvidar client.release(). Ejecuta: node f104-pool-transacciones/fuga.js
import { crearPool } from './pool.js';

const pool = crearPool({ max: 3, connectionTimeoutMillis: 1000 });

async function contarSinDevolver() {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT 1 AS n');
  return rows[0].n; // falta client.release(): la conexión queda «prestada» para siempre
}

for (let peticion = 1; peticion <= 4; peticion++) {
  try {
    await contarSinDevolver();
    console.log(`petición ${peticion}: ok · total=${pool.totalCount} libres=${pool.idleCount} en fila=${pool.waitingCount}`);
  } catch (error) {
    console.log(`petición ${peticion}: ${error.name}: ${error.message} · total=${pool.totalCount} libres=${pool.idleCount}`);
  }
}
process.exit(0); // pool.end() esperaría para siempre a las 3 conexiones que nunca se devolvieron
