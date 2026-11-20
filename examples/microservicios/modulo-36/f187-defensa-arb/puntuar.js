// Módulo 32 · F187 · Hoja de puntuación del Comité de Arquitectura (Architecture Review Board), ejecutable.
// Aprueba con media ponderada >= 2.8 Y ningún criterio en 1 (rúbrica 7.2 de docs/microservicios/07-plantillas.md).
// Uso: node f187-defensa-arb/puntuar.js f187-defensa-arb/evaluacion-ejemplo.json
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const rubrica = JSON.parse(readFileSync(new URL('./rubrica.json', import.meta.url)));

export function puntuar(notas) {
  const filas = rubrica.criterios.map((c) => {
    const nota = notas[c.id];
    if (![1, 2, 3, 4].includes(nota)) throw new Error(`criterio ${c.id} (${c.nombre}): nota ${nota} fuera de 1-4`);
    return { ...c, nota, ponderado: c.peso * nota };
  });
  const total = Math.round(filas.reduce((s, f) => s + f.ponderado, 0) * 100) / 100;
  const enUno = filas.filter((f) => f.nota === rubrica.aprueba.ningunCriterioEn).map((f) => f.nombre);
  const aprueba = total >= rubrica.aprueba.mediaMinima && enUno.length === 0;
  return { filas, total, enUno, aprueba };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ev = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const r = puntuar(ev.notas);
  console.log(`Estudiante: ${ev.estudiante} · ${ev.fecha} · evaluadores: ${ev.evaluadores.join(', ')}`);
  for (const f of r.filas) console.log(`${String(f.id)} ${f.nombre.padEnd(31)} ${f.peso.toFixed(2)}   ${f.nota}   ${f.ponderado.toFixed(2)}`);
  console.log(`Total: ${r.total.toFixed(2)} (aprueba con >= 2.80 y ningún 1)`);
  console.log(r.aprueba ? 'Recomendación: APROBADO'
    : `Recomendación: REPETIR DEFENSA · ${r.total < 2.8 ? `media ${r.total.toFixed(2)} < 2.80` : ''}${r.enUno.length ? `criterio en 1: ${r.enUno.join(', ')}` : ''}`);
}
