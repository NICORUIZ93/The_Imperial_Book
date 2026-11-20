// Módulo 31 · F180 · Crea un repositorio Git de ejemplo (el monolito «Tienda») con un historial fijo: mismas fechas,
// mismos autores y mismos archivos en cualquier máquina. Devuelve la ruta. Uso: node f180-deuda-tecnica/generar-repo.js [dir]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Código con N niveles de anidamiento: la «complejidad por indentación» crece con lo anidado que está.
const anidado = (nombre, niveles, lineas, version) => {
  let s = `// ${nombre} v${version}\nexport function ${nombre.replace(/\W/g, '')}(p) {\n`;
  for (let i = 0; i < lineas; i++) {
    const n = 1 + (i % niveles);
    s += '  '.repeat(n) + (n < niveles ? `if (p.c${i}) {` : `p.t += ${i};`) + '\n';
  }
  return s + '}\n';
};
// [archivo, niveles de anidamiento, líneas, en cuántos commits cambia]
const ARCHIVOS = [
  ['facturacion.js', 6, 120, 18],
  ['pedidos.js', 4, 80, 9],
  ['reportes-legado.js', 9, 200, 0],
  ['clientes.js', 2, 40, 4],
  ['utilidades.js', 2, 30, 2],
];

export function generarRepo(dir = mkdtempSync(join(tmpdir(), 'tienda-'))) {
  const git = (...a) => execFileSync('git', a, { cwd: dir, env: { ...process.env, GIT_AUTHOR_DATE: fecha, GIT_COMMITTER_DATE: fecha } });
  let fecha = '2026-01-05T10:00:00Z';
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'equipo@tienda.local'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Equipo Tienda'], { cwd: dir });
  for (const [f, niv, lin] of ARCHIVOS) writeFileSync(join(dir, f), anidado(f, niv, lin, 0));
  git('add', '.'); git('commit', '-q', '-m', 'monolito inicial');
  for (let c = 1; c <= 18; c++) {
    fecha = `2026-${String(1 + Math.floor(c / 2)).padStart(2, '0')}-${String(10 + (c % 2) * 10)}T10:00:00Z`;
    for (const [f, niv, lin, cambios] of ARCHIVOS) if (c <= cambios) writeFileSync(join(dir, f), anidado(f, niv, lin + c, c));
    git('add', '.'); git('commit', '-q', '-m', `cambio ${c}`);
  }
  return dir;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) console.log(generarRepo(process.argv[2]));
