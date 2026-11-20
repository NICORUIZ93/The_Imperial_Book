// Módulo 19 · F119 · Simulación del fallo: Toxiproxy «tumba» el inventario y el circuito se abre, rechaza y se recupera.
// Requisitos: infraestructura arriba (docker compose up -d --wait). Ejecuta: node f119-circuit-breaker/simulacion.js
import assert from 'node:assert/strict';
import { apagar, encender, sanar, dormir, control, INVENTARIO_URL } from '../comun/toxiproxy.js';
import { crearCircuitoDeInventario, estadoDe } from './cliente-inventario.js';

await sanar();
await control('/reiniciar', 'POST');
const circuito = crearCircuitoDeInventario(INVENTARIO_URL);
const cambios = []; // los eventos llegan durante la llamada: los mostramos justo después de su línea
circuito.on('open', () => cambios.push('ABIERTO'));
circuito.on('halfOpen', () => console.log('   -> pasó resetTimeout: el circuito pasa a SEMIABIERTO (deja pasar una llamada de prueba)'));
circuito.on('close', () => cambios.push('CERRADO'));

let n = 0;
async function llamar() {
  n += 1;
  const antes = estadoDe(circuito);
  const inicio = performance.now();
  let resultado;
  try {
    resultado = `OK ${JSON.stringify(await circuito.fire('7'))}`;
  } catch (error) {
    resultado = error.code === 'EOPENBREAKER' ? 'RECHAZADA (EOPENBREAKER), sin tocar la red' : `FALLO ${error.cause?.code ?? error.name}`;
  }
  console.log(`llamada ${n} [${antes}] ${resultado} (${Math.round(performance.now() - inicio)} ms)`);
  while (cambios.length) console.log(`   -> el circuito pasa a ${cambios.shift()}`);
}

console.log('== 1. Inventario sano');
await llamar(); await llamar();
console.log('== 2. Fallo inyectado: Toxiproxy apaga el proxy "inventario" (conexión rechazada)');
await apagar('inventario');
for (let i = 0; i < 6; i += 1) await llamar();
const trasElFallo = (await control('/contador')).consultas;
console.log(`   el inventario recibió ${trasElFallo} consultas en total: las rechazadas no llegaron a la red`);
console.log('== 3. El inventario vuelve; esperamos resetTimeout (1 s)');
await encender('inventario');
await dormir(1100);
await llamar(); await llamar();

assert.equal(trasElFallo, 2);
assert.equal(estadoDe(circuito), 'CERRADO');
assert.equal(circuito.stats.rejects, 3);
console.log(`estadísticas: fires=${circuito.stats.fires} successes=${circuito.stats.successes} failures=${circuito.stats.failures} rejects=${circuito.stats.rejects}`);
console.log('OK: el circuito se abrió, rechazó sin tocar la red y se cerró al recuperarse el inventario');
circuito.shutdown();
