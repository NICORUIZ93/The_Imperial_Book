// Módulo 23 · F145 · Revisa un workflow de GitHub Actions contra 6 reglas de seguridad y reproducibilidad.
// Requisitos: Node.js 26.13.1 LTS y yaml 2.9.1. Uso: node f145-github-actions/validar.js f145-github-actions/ci.yml
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export function validar(texto) {
  const wf = parse(texto);
  const jobs = Object.entries(wf.jobs ?? {});
  const pasos = jobs.flatMap(([, j]) => j.steps ?? []);
  const reglas = [
    ['acciones fijadas por SHA de 40 caracteres', pasos.filter((p) => p.uses).every((p) => /@[0-9a-f]{40}$/.test(p.uses))],
    ['permissions explícitos (contents: read por defecto)', wf.permissions?.contents === 'read'],
    ['timeout-minutes en cada job', jobs.every(([, j]) => Number.isInteger(j['timeout-minutes']))],
    ['concurrency para cancelar ejecuciones viejas', Boolean(wf.concurrency?.group)],
    ['versión de Node exacta (no latest ni solo la mayor)', pasos.filter((p) => p.with?.['node-version'] != null).every((p) => /^\d+\.\d+\.\d+$/.test(String(p.with['node-version'])))],
    ['sin ${{ secrets.* }} ni ${{ github.* }} dentro de run: (inyección)', pasos.every((p) => !/\$\{\{\s*(secrets|github)\./.test(p.run ?? ''))],
  ];
  return reglas.map(([regla, ok]) => ({ regla, ok }));
}

if (import.meta.main) {
  for (const archivo of process.argv.slice(2)) {
    const r = validar(readFileSync(archivo, 'utf8'));
    console.log(`== ${archivo}`);
    for (const { regla, ok } of r) console.log(`   ${ok ? '✔' : '✘'} ${regla}`);
  }
}
