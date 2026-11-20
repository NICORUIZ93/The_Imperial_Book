// Módulo 31 · F179 · Métricas de éxito de una migración: las cinco métricas DORA (dora.dev, guía de enero de 2026) y la
// «puerta de avance» que decide si el Strangler Fig sube el porcentaje de tráfico del servicio nuevo.
// Ejecuta: node f179-metricas-exito/metricas.js
import { pathToFileURL } from 'node:url';
import { antes, despues } from './datos.js';

const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

export function dora(despliegues, dias = 90) {
  const normales = despliegues.filter((d) => !d.rework);
  const fallidos = normales.filter((d) => d.fallo);
  return {
    frecuenciaPorSemana: despliegues.length / (dias / 7),                                   // throughput
    leadTimeHoras: mediana(despliegues.map((d) => (d.despliegue - d.commit) / 3_600_000)),   // throughput (mediana)
    recuperacionMin: fallidos.length ? mediana(fallidos.map((d) => d.recuperacionMin)) : 0,  // throughput
    tasaFallo: fallidos.length / normales.length,                                            // inestabilidad
    tasaRework: despliegues.filter((d) => d.rework).length / despliegues.length,             // inestabilidad
  };
}

// Puerta de avance: el servicio nuevo solo recibe más tráfico si NO es peor que el monolito en lo que nota el usuario.
export function puertaDeAvance({ base, nuevo, diferenciasSombra }, umbrales = { errorPp: 0.1, p99Factor: 1.1, sombra: 0.001 }) {
  const motivos = [];
  if (nuevo.errores - base.errores > umbrales.errorPp) motivos.push(`errores ${nuevo.errores} % > ${base.errores} % + ${umbrales.errorPp} pp`);
  if (nuevo.p99 > base.p99 * umbrales.p99Factor) motivos.push(`p99 ${nuevo.p99} ms > ${(base.p99 * umbrales.p99Factor).toFixed(0)} ms`);
  if (diferenciasSombra > umbrales.sombra) motivos.push(`tráfico en sombra con ${(diferenciasSombra * 100).toFixed(2)} % de respuestas distintas`);
  return { avanzar: motivos.length === 0, motivos };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = dora(antes); const d = dora(despues);
  const fila = (n, x, y, f) => console.log(`${n.padEnd(30)} ${f(x).padStart(10)} ${f(y).padStart(10)}`);
  console.log(`${'métrica DORA (90 días)'.padEnd(30)} ${'monolito'.padStart(10)} ${'pedidos'.padStart(10)}`);
  fila('despliegues por semana', a.frecuenciaPorSemana, d.frecuenciaPorSemana, (v) => v.toFixed(1));
  fila('lead time de cambio (h, med.)', a.leadTimeHoras, d.leadTimeHoras, (v) => v.toFixed(1));
  fila('recuperación (min, mediana)', a.recuperacionMin, d.recuperacionMin, (v) => v.toFixed(0));
  fila('tasa de fallo de cambios', a.tasaFallo, d.tasaFallo, (v) => `${(v * 100).toFixed(1)} %`);
  fila('tasa de rework', a.tasaRework, d.tasaRework, (v) => `${(v * 100).toFixed(1)} %`);
  const base = { errores: 0.40, p99: 420 };
  for (const [fase, nuevo, sombra] of [['10 % -> 50 %', { errores: 0.35, p99: 380 }, 0.0004], ['50 % -> 100 %', { errores: 0.62, p99: 510 }, 0.0004]]) {
    const r = puertaDeAvance({ base, nuevo, diferenciasSombra: sombra });
    console.log(`puerta ${fase}: ${r.avanzar ? 'AVANZAR' : 'NO AVANZAR'}${r.motivos.length ? ' · ' + r.motivos.join(' · ') : ''}`);
  }
}
