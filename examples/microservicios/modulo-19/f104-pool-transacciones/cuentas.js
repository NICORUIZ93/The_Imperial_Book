// Módulo 15 · F104 · Transacciones con pg: BEGIN … COMMIT / ROLLBACK sobre UNA conexión prestada del pool.

export async function preparar(pool) {
  await pool.query(`
    DROP TABLE IF EXISTS cuentas;
    CREATE TABLE cuentas (id TEXT PRIMARY KEY, saldo INTEGER NOT NULL CHECK (saldo >= 0));
    INSERT INTO cuentas VALUES ('ana', 100), ('luis', 50);
  `);
}

export async function saldos(pool) {
  const { rows } = await pool.query('SELECT id, saldo FROM cuentas ORDER BY id');
  return Object.fromEntries(rows.map((f) => [f.id, f.saldo]));
}

// BIEN: pedimos UNA conexión (client) y todas las sentencias de la transacción viajan por ella.
export async function transferir(pool, origen, destino, monto) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, origen]);
    const abono = await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, destino]);
    if (abono.rowCount === 0) throw new Error(`La cuenta ${destino} no existe`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK'); // deshace TODO lo hecho desde BEGIN
    throw error;
  } finally {
    client.release(); // SIEMPRE devuelve la conexión, haya ido bien o mal
  }
}

// MAL (anti-patrón): pool.query() toma una conexión cualquiera para CADA sentencia.
// BEGIN, los UPDATE y el COMMIT/ROLLBACK pueden mezclarse con los de otra petición.
export async function transferirMal(pool, origen, destino, monto) {
  try {
    await pool.query('BEGIN');
    await pool.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, origen]);
    const abono = await pool.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, destino]);
    if (abono.rowCount === 0) throw new Error(`La cuenta ${destino} no existe`);
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}
