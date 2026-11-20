// Módulo 19 · F122 · ERROR COMÚN: un «timeout» con Promise.race no cancela nada. Tu código sigue adelante, pero la
// petición sigue viva: ocupa un socket y memoria, y el proceso no puede terminar hasta que acaba.
// Requisitos: infraestructura arriba. Ejecuta: node f122-timeouts/error-comun.js
import { lento, sanar, INVENTARIO_URL } from '../comun/toxiproxy.js';

await sanar();
await lento('inventario', 1500);
const inicio = performance.now();
const ms = () => `${Math.round(performance.now() - inicio)} ms`;

console.log('== MAL: Promise.race([fetch, temporizador])');
const peticion = fetch(`${INVENTARIO_URL}/stock/7`).then((r) => r.json());
peticion.then(() => console.log(`   ${ms()}: …la petición «cancelada» termina ahora: estuvo viva todo este tiempo`));
const vence = new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('timeout')), 300));
await Promise.race([peticion, vence]).catch((e) => console.log(`   ${ms()}: tu código recibe "${e.message}" y sigue…`));
await peticion;

console.log('== BIEN: AbortSignal.timeout(300) cancela la petición de verdad');
const inicio2 = performance.now();
let cerrada = 'no';
await fetch(`${INVENTARIO_URL}/stock/7`, { signal: AbortSignal.timeout(300) })
  .catch((e) => { cerrada = `${e.name} a los ${Math.round(performance.now() - inicio2)} ms y el socket se cierra`; });
console.log(`   ${cerrada}`);
await sanar();
