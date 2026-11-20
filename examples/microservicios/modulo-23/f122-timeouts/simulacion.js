// Módulo 19 · F122 · Simulación del fallo: Toxiproxy vuelve LENTO al inventario (latencia) y luego lo deja COLGADO
// (acepta la conexión y no responde). Requisitos: infraestructura arriba. Ejecuta: node f122-timeouts/simulacion.js
import assert from 'node:assert/strict';
import { cuelga, lento, sanar, dormir, control, INVENTARIO_URL } from '../comun/toxiproxy.js';
import { arrancarCadena } from './cadena.js';
import { fetchConTimeout } from './con-timeout.js';

const ms = (inicio) => Math.round(performance.now() - inicio);
const URL_STOCK = `${INVENTARIO_URL}/stock/7`;

console.log('== A. Fallo inyectado: latencia de 2000 ms (toxic "latency")');
await sanar();
await lento('inventario', 2000);
let inicio = performance.now();
await fetch(URL_STOCK).then((r) => r.json());
const sinLimite = ms(inicio);
console.log(`   sin timeout:          OK tras ${sinLimite} ms (tu petición, su memoria y su conexión, ocupadas todo ese tiempo)`);
inicio = performance.now();
const errorA = await fetchConTimeout(URL_STOCK, { timeoutMs: 500 }).catch((e) => e);
const conLimite = ms(inicio);
console.log(`   con timeout de 500 ms: ${errorA.name} tras ${conLimite} ms`);

console.log('== B. Fallo inyectado: conexión colgada (toxic "timeout" con timeout=0)');
await sanar();
await cuelga('inventario');
inicio = performance.now();
const control3s = new AbortController();
const colgada = fetch(URL_STOCK, { signal: control3s.signal }).then(() => 'respondió', () => 'cancelada por el script');
const vigilante = dormir(3000).then(() => 'sigue esperando');
console.log(`   sin timeout:          a los 3000 ms ${await Promise.race([colgada, vigilante])} (fetch esperaría hasta 300 000 ms)`);
control3s.abort();
inicio = performance.now();
const errorB = await fetchConTimeout(URL_STOCK, { timeoutMs: 500 }).catch((e) => e);
console.log(`   con timeout de 500 ms: ${errorB.name} tras ${ms(inicio)} ms`);

console.log('== C. Presupuesto en cadena: el bff tiene 1000 ms y el inventario tarda 1500 ms');
await sanar();
await lento('inventario', 1500);
for (const propagar of [false, true]) {
  console.log(`   -- ${propagar ? 'CON' : 'SIN'} propagar el presupuesto`);
  const cadena = await arrancarCadena({ propagar });
  inicio = performance.now();
  const r = await fetch('http://127.0.0.1:3122/resumen/7');
  console.log(`   [usuario] recibió ${r.status} a los ${ms(inicio)} ms`);
  await dormir(1000); // deja ver qué hace pedidos después de que el bff se rindió
  cadena.cerrar();
}
await sanar();

assert.ok(sinLimite >= 2000);
assert.equal(errorA.name, 'TimeoutError');
assert.ok(conLimite >= 480 && conLimite < 900);
assert.equal(errorB.name, 'TimeoutError');
console.log('OK: con timeout la espera está acotada; con presupuesto propagado nadie trabaja para una respuesta que ya no se espera');
