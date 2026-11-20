// Módulo 19 · F120 · Simulación del fallo: (A) un fallo pasajero que el reintento absorbe y (B) la «tormenta de
// reintentos» de 200 clientes con y sin jitter. Requisitos: infraestructura arriba.
// Ejecuta: node f120-retry/simulacion.js
import assert from 'node:assert/strict';
import { apagar, encender, sanar, INVENTARIO_URL } from '../comun/toxiproxy.js';
import { esperaMs, getConReintentos } from './reintentar.js';

// Generador pseudoaleatorio con semilla (mulberry32): la simulación B da siempre los mismos números.
function conSemilla(semilla) {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

console.log('== A. Fallo pasajero: Toxiproxy apaga el inventario 350 ms');
await sanar();
await apagar('inventario');
setTimeout(() => encender('inventario'), 350);
const inicio = performance.now();
const t = () => `t=${String(Math.round(performance.now() - inicio)).padStart(4)} ms`;
let intentosHechos = 0;
const stock = await getConReintentos(`${INVENTARIO_URL}/stock/7`, {
  intentos: 5, baseMs: 100, jitter: 'completo', aleatorio: conSemilla(7),
  alReintentar: ({ intento, espera, error }) => {
    intentosHechos = intento;
    console.log(`   ${t()} intento ${intento}: ${error.cause?.code ?? error.message} -> espero ${espera} ms (tope ${Math.min(5000, 100 * 2 ** (intento - 1))})`);
  },
});
console.log(`   ${t()} intento ${intentosHechos + 1}: OK ${JSON.stringify(stock)}`);
assert.deepEqual(stock, { sku: '7', stock: 12 });

console.log('== B. Tormenta: 200 clientes fallan a la vez en t=0 y reintentan 3 veces (base 1000 ms)');
function tormenta(jitter) {
  const aleatorio = conSemilla(2026);
  const porCubeta = new Map(); // cubeta de 100 ms -> peticiones que llegan en ella
  for (let cliente = 0; cliente < 200; cliente += 1) {
    let instante = 0;
    for (let intento = 1; intento <= 3; intento += 1) {
      instante += esperaMs(intento, { baseMs: 1000, maxMs: 4000, jitter, aleatorio });
      const cubeta = Math.floor(instante / 100) * 100;
      porCubeta.set(cubeta, (porCubeta.get(cubeta) ?? 0) + 1);
    }
  }
  const pico = Math.max(...porCubeta.values());
  const primeras = [...porCubeta.entries()].sort((a, b) => a[0] - b[0]).slice(0, 6).map(([c, n]) => `${c}ms:${n}`).join(' ');
  console.log(`   jitter=${jitter.padEnd(8)} pico=${String(pico).padStart(3)} peticiones en la misma décima de segundo · repartidas en ${String(porCubeta.size).padStart(2)} décimas · ${primeras}…`);
  return pico;
}
const picoSin = tormenta('ninguno');
const picoCon = tormenta('completo');
assert.equal(picoSin, 200);
assert.ok(picoCon < 60);
console.log(`OK: el reintento absorbió el fallo pasajero y el jitter bajó el pico de ${picoSin} a ${picoCon} peticiones simultáneas`);
