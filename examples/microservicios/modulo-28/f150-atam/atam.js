// Módulo 24 · F150 · ATAM ligero: árbol de utilidad, prioridades y temas de riesgo a partir de un JSON revisable en PR.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). Uso: node f150-atam/atam.js f150-atam/atam.json
import { readFileSync } from 'node:fs';

const PESO = { A: 3, M: 2, B: 1 };
const PARTES = ['fuente', 'estimulo', 'artefacto', 'entorno', 'respuesta', 'medida'];

export function validar(a) {
  const problemas = [];
  const objetivos = new Set(a.objetivosDeNegocio.map((o) => o.id));
  for (const e of a.escenarios) {
    for (const p of PARTES) if (!e[p]) problemas.push(`${e.id}: falta «${p}»`);
    if (e.medida && !/\d/.test(e.medida)) problemas.push(`${e.id}: la medida «${e.medida}» no tiene un número (no se puede comprobar)`);
    if (!objetivos.has(e.objetivo)) problemas.push(`${e.id}: no se relaciona con ningún objetivo de negocio`);
    if (!PESO[e.importancia] || !PESO[e.dificultad]) problemas.push(`${e.id}: importancia y dificultad deben ser A, M o B`);
  }
  return problemas;
}

/** Orden ATAM: primero (A,A), luego (A,M)… La importancia la da el negocio; la dificultad, el arquitecto. */
export const priorizar = (escenarios) => [...escenarios].sort((x, y) => PESO[y.importancia] - PESO[x.importancia] || PESO[y.dificultad] - PESO[x.dificultad] || x.id.localeCompare(y.id));

export function analizar(a) {
  const analizados = new Set(a.enfoques.flatMap((e) => e.escenarios));
  const sinAnalizar = priorizar(a.escenarios).filter((e) => e.importancia === 'A' && !analizados.has(e.id)).map((e) => e.id);
  const temas = new Map();
  for (const enfoque of a.enfoques) {
    for (const r of enfoque.riesgos) {
      const escenarios = [...r.texto.matchAll(/\(([A-Z]\d(?:, [A-Z]\d)*)\)/g)].flatMap((m) => m[1].split(', '));
      const objetivosAfectados = escenarios.map((id) => a.escenarios.find((e) => e.id === id)?.objetivo).filter(Boolean);
      const t = temas.get(r.tema) ?? { riesgos: 0, objetivos: new Set() };
      t.riesgos += 1;
      objetivosAfectados.forEach((o) => t.objetivos.add(o));
      temas.set(r.tema, t);
    }
  }
  return { sinAnalizar, temas };
}

export function informe(a) {
  const lineas = [`ATAM ligero · ${a.sistema}`, '', 'Árbol de utilidad (importancia, dificultad):'];
  const porAtributo = Map.groupBy(a.escenarios, (e) => e.atributo);
  for (const [atributo, escenarios] of porAtributo) {
    lineas.push(`  ${atributo}`);
    for (const e of escenarios) lineas.push(`    └ ${e.refinamiento}: (${e.importancia},${e.dificultad}) ${e.id} · ${e.estimulo} → ${e.medida}`);
  }
  lineas.push('', `Prioridad: ${priorizar(a.escenarios).map((e) => `${e.id}(${e.importancia},${e.dificultad})`).join(' > ')}`);
  const { sinAnalizar, temas } = analizar(a);
  lineas.push('', 'Puntos de sensibilidad:', ...a.enfoques.flatMap((e) => e.sensibilidad.map((s) => `  · ${e.id}: ${s}`)));
  lineas.push('', 'Trade-offs:', ...a.enfoques.flatMap((e) => e.tradeoffs.map((t) => `  · ${e.id}: ${t}`)));
  lineas.push('', 'Riesgos:', ...a.enfoques.flatMap((e) => e.riesgos.map((r) => `  ✘ ${e.id}: ${r.texto}`)));
  lineas.push('', 'No riesgos:', ...a.enfoques.flatMap((e) => e.noRiesgos.map((r) => `  ✔ ${e.id}: ${r}`)));
  lineas.push('', 'Temas de riesgo (para la dirección):');
  for (const [tema, t] of temas) lineas.push(`  ▲ ${tema}: ${t.riesgos} riesgo(s) · amenaza ${[...t.objetivos].map((o) => `${o} «${a.objetivosDeNegocio.find((x) => x.id === o).texto}»`).join(', ')}`);
  lineas.push('', sinAnalizar.length ? `Escenarios de importancia A sin analizar: ${sinAnalizar.join(', ')}` : 'Todos los escenarios de importancia A están analizados');
  return lineas.join('\n');
}

if (import.meta.main) {
  const a = JSON.parse(readFileSync(process.argv[2] ?? 'f150-atam/atam.json', 'utf8'));
  const problemas = validar(a);
  if (problemas.length) { for (const p of problemas) console.log(`✘ ${p}`); console.log(`${problemas.length} problemas: corrige los escenarios antes de analizar`); process.exitCode = 1; }
  else console.log(informe(a));
}
