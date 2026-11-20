// Módulo 30 · F176 · Ejecuta: node f176-fitness-functions/demo.js
// Pasa las fitness functions 1 y 2 sobre los dos proyectos de ejemplo y termina con código 1 si alguno falla
// (como lo haría en el pipeline de CI).
import { join } from 'node:path';
import { ciclosEntreServicios, grafoDeImportaciones, sinInternosAjenos } from './fitness.js';

let fallos = 0;
for (const proyecto of ['ejemplo-ok', 'ejemplo-roto']) {
  const grafo = grafoDeImportaciones(join(import.meta.dirname, proyecto));
  const internos = sinInternosAjenos(grafo);
  const ciclos = ciclosEntreServicios(grafo);
  console.log(`${proyecto}: FF1 internos ajenos=${internos.length} · FF2 ciclos=${ciclos.length}`);
  for (const v of [...internos, ...ciclos.map((c) => `ciclo ${c}`)]) console.log(`   ✘ ${v}`);
  fallos += internos.length + ciclos.length;
}
console.log(fallos ? `${fallos} violaciones: el build se detiene` : 'arquitectura en forma');
process.exitCode = fallos ? 1 : 0;
