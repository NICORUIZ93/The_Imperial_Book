// Módulo 13 · F092 · perf_hooks: medir duración, retraso del Event Loop y uso del Event Loop.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node f092-perf/medir.js
import { performance, monitorEventLoopDelay, PerformanceObserver } from 'node:perf_hooks';

// Trabajo de CPU de ejemplo: ordenar un arreglo grande.
export function ordenarAleatorios(n) {
  const datos = Array.from({ length: n }, (_, i) => (i * 7919) % n);
  return datos.sort((a, b) => a - b).length;
}

// 1. mark + measure: cronómetro con nombre que aparece también en los perfiles (--cpu-prof, clinic).
export function medirConMarcas(n) {
  performance.mark('ordenar:inicio');
  ordenarAleatorios(n);
  performance.mark('ordenar:fin');
  const medida = performance.measure('ordenar', 'ordenar:inicio', 'ordenar:fin');
  performance.clearMarks();
  performance.clearMeasures();
  return medida.duration; // milisegundos con decimales
}

// 2. monitorEventLoopDelay: histograma de cuánto se retrasa el Event Loop (en nanosegundos).
// 3. eventLoopUtilization: fracción del tiempo que el loop estuvo ocupado (0 = ocioso, 1 = saturado).
export async function retrasoDelLoop(msDeBloqueo) {
  const h = monitorEventLoopDelay({ resolution: 10 });
  h.enable();
  const elu0 = performance.eventLoopUtilization();
  await new Promise((r) => setTimeout(r, 50));
  const fin = Date.now() + msDeBloqueo;
  while (Date.now() < fin); // bloqueo artificial
  await new Promise((r) => setTimeout(r, 50));
  h.disable();
  const elu = performance.eventLoopUtilization(elu0);
  return { maxMs: h.max / 1e6, p99Ms: h.percentile(99) / 1e6, utilizacion: elu.utilization };
}

// 4. timerify + PerformanceObserver: mide cada llamada a una función sin tocar su código.
export async function llamadasMedidas() {
  const duraciones = [];
  const obs = new PerformanceObserver((lista) => lista.getEntries().forEach((e) => duraciones.push(e.duration)));
  obs.observe({ entryTypes: ['function'] });
  const ordenarMedido = performance.timerify(ordenarAleatorios);
  ordenarMedido(10_000);
  ordenarMedido(100_000);
  await new Promise((r) => setImmediate(r)); // las entradas se entregan de forma asíncrona
  obs.disconnect();
  return duraciones;
}

if (import.meta.main) {
  console.log(`ordenar 1 000 000 números: ${medirConMarcas(1_000_000).toFixed(0)} ms`);
  const sano = await retrasoDelLoop(0);
  const bloqueado = await retrasoDelLoop(200);
  console.log(`loop sano:     max ${sano.maxMs.toFixed(0)} ms · p99 ${sano.p99Ms.toFixed(0)} ms · ocupado ${(sano.utilizacion * 100).toFixed(0)} %`);
  console.log(`loop bloqueado: max ${bloqueado.maxMs.toFixed(0)} ms · p99 ${bloqueado.p99Ms.toFixed(0)} ms · ocupado ${(bloqueado.utilizacion * 100).toFixed(0)} %`);
  console.log(`timerify: ${(await llamadasMedidas()).length} llamadas medidas`);
}
