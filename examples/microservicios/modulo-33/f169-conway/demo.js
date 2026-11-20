// Módulo 29 · F169 · Ejecuta: node f169-conway/demo.js
// Mismo código, dos organizaciones: ¿cuántos equipos hay que coordinar por cada funcionalidad?
import { rmSync } from 'node:fs';
import { analizar, leerHistorial, POR_CAPAS, POR_FLUJO } from './conway.js';
import { crearRepoDeEjemplo } from './repo.js';

const dir = crearRepoDeEjemplo();
const commits = leerHistorial(dir);
for (const [nombre, reglas] of [['por capas', POR_CAPAS], ['por flujo', POR_FLUJO]]) {
  const r = analizar(commits, reglas);
  console.log(`Organización ${nombre}: ${r.cruzados}/${r.commits} funcionalidades cruzan equipos (${r.porcentajeCruzados} %) · traspasos: ${r.traspasos}`);
  for (const [par, veces] of Object.entries(r.pares)) console.log(`   ${par}: ${veces} funcionalidades juntas`);
}
rmSync(dir, { recursive: true, force: true });
