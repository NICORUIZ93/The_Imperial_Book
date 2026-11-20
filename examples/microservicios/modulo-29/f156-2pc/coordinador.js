// Módulo 25 · F156 · Two-Phase Commit con PREPARE TRANSACTION de PostgreSQL (para entender por qué NO usarlo entre servicios).
// Dos participantes: «banco A» y «banco B» (aquí, dos conexiones a dos tablas; en la vida real, dos bases distintas).
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7 con max_prepared_transactions > 0 (por defecto es 0).

export async function prepararEsquema(pool) {
  const { rows } = await pool.query('SELECT gid FROM pg_prepared_xacts WHERE gid LIKE $1', ['f156-%']);
  for (const { gid } of rows) await pool.query(`ROLLBACK PREPARED '${gid}'`); // limpia restos de ejecuciones anteriores
  await pool.query(`
    CREATE TABLE IF NOT EXISTS f156_banco_a (cuenta text PRIMARY KEY, saldo integer NOT NULL CHECK (saldo >= 0));
    CREATE TABLE IF NOT EXISTS f156_banco_b (cuenta text PRIMARY KEY, saldo integer NOT NULL CHECK (saldo >= 0));
    TRUNCATE f156_banco_a, f156_banco_b;
    INSERT INTO f156_banco_a VALUES ('ana', 1000);
    INSERT INTO f156_banco_b VALUES ('luis', 0);`);
}

// Coordinador: fase 1 (preparar = votar) en los dos participantes; fase 2 (confirmar) solo si los dos votaron sí.
export async function transferir(pool, { gid, monto }, { caerTrasPreparar = false } = {}) {
  const [a, b] = [await pool.connect(), await pool.connect()];
  const preparados = [];
  try {
    // FASE 1 · cada participante hace su parte y la deja PREPARADA: escrita en disco, con los bloqueos tomados.
    await a.query('BEGIN');
    await a.query("UPDATE f156_banco_a SET saldo = saldo - $1 WHERE cuenta = 'ana'", [monto]);
    await a.query(`PREPARE TRANSACTION '${gid}-a'`);
    preparados.push(`${gid}-a`);
    await b.query('BEGIN');
    await b.query("UPDATE f156_banco_b SET saldo = saldo + $1 WHERE cuenta = 'luis'", [monto]);
    await b.query(`PREPARE TRANSACTION '${gid}-b'`);
    preparados.push(`${gid}-b`);
  } catch (error) {
    // Alguien votó NO: se deshace lo preparado y lo que quedó a medias.
    await a.query('ROLLBACK').catch(() => {});
    await b.query('ROLLBACK').catch(() => {});
    for (const p of preparados) await pool.query(`ROLLBACK PREPARED '${p}'`);
    a.release(); b.release();
    return `abortada: ${error.message}`;
  }
  a.release(); b.release();
  if (caerTrasPreparar) return 'coordinador caído entre la fase 1 y la fase 2';
  // FASE 2 · la decisión es definitiva; cualquier conexión puede ejecutarla, incluso tras reiniciar.
  for (const p of preparados) await pool.query(`COMMIT PREPARED '${p}'`);
  return 'confirmada';
}

export async function saldos(pool) {
  const { rows } = await pool.query(`SELECT (SELECT saldo FROM f156_banco_a WHERE cuenta = 'ana') AS ana,
                                            (SELECT saldo FROM f156_banco_b WHERE cuenta = 'luis') AS luis`);
  return rows[0];
}
