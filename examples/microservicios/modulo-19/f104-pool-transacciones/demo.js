// Ejecuta: node f104-pool-transacciones/demo.js   (desde examples/microservicios/modulo-19)
import { crearPool, medir } from './pool.js';
import { preparar, saldos, transferir } from './cuentas.js';

console.log('— Pool: 20 consultas de 100 ms a la vez —');
for (const max of [1, 5, 20]) {
  const { ms, enFila, abiertas } = await medir(max);
  console.log(`max=${String(max).padEnd(2)} → ${Math.round(ms / 100) * 100} ms aprox. · en fila al empezar: ${enFila} · conexiones abiertas: ${abiertas}`);
}

console.log('— Transacciones —');
const pool = crearPool();
await preparar(pool);
console.log('Inicio:', await saldos(pool));

await transferir(pool, 'ana', 'luis', 30);
console.log('Ana → Luis 30 (COMMIT):', await saldos(pool));

try {
  await transferir(pool, 'ana', 'luis', 500); // Ana no tiene 500: CHECK (saldo >= 0) falla
} catch (error) {
  console.log('Ana → Luis 500:', error.message);
}
try {
  await transferir(pool, 'ana', 'eva', 10); // Eva no existe: ya se había descontado a Ana
} catch (error) {
  console.log('Ana → Eva 10:', error.message);
}
console.log('Tras los dos ROLLBACK:', await saldos(pool));
console.log(`Pool: total=${pool.totalCount} libres=${pool.idleCount} en fila=${pool.waitingCount}`);
await pool.end();
