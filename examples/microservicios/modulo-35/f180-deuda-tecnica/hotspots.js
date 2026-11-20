// Módulo 31 · F180 · Hotspots de deuda técnica: archivos que cambian MUCHO (git log) y son COMPLEJOS (indentación).
// Idea de «Your Code as a Crime Scene» (Adam Tornhill): la deuda que cobra intereses es la que tocas a menudo.
// Uso: node f180-deuda-tecnica/hotspots.js [repo]   (sin argumento, genera el repositorio de ejemplo)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generarRepo } from './generar-repo.js';

// Complejidad por indentación: suma de niveles (2 espacios = 1 nivel) de las líneas no vacías. Barata y agnóstica del lenguaje.
export const complejidad = (texto) => texto.split('\n').filter((l) => l.trim())
  .reduce((s, l) => s + Math.floor(l.match(/^ */)[0].length / 2), 0);

export function analizar(repo) {
  const log = execFileSync('git', ['-C', repo, 'log', '--format=--%h', '--numstat'], { encoding: 'utf8' });
  const revisiones = new Map();
  const juntos = new Map(); // acoplamiento temporal: pares de archivos que cambian en el mismo commit
  for (const commit of log.split('--').slice(1)) {
    const archivos = commit.split('\n').slice(1).filter(Boolean).map((l) => l.split('\t')[2]);
    for (const a of archivos) revisiones.set(a, (revisiones.get(a) ?? 0) + 1);
    for (const a of archivos) for (const b of archivos) if (a < b) juntos.set(`${a}+${b}`, (juntos.get(`${a}+${b}`) ?? 0) + 1);
  }
  const filas = [...revisiones].map(([archivo, rev]) => {
    const cx = complejidad(readFileSync(join(repo, archivo), 'utf8'));
    return { archivo, revisiones: rev, complejidad: cx, puntuacion: rev * cx };
  }).sort((a, b) => b.puntuacion - a.puntuacion);
  const acoplamiento = (a, b) => { const k = a < b ? `${a}+${b}` : `${b}+${a}`;
    return (juntos.get(k) ?? 0) / Math.min(revisiones.get(a), revisiones.get(b)); };
  return { filas, acoplamiento };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { filas, acoplamiento } = analizar(process.argv[2] ?? generarRepo());
  console.log('archivo               revisiones  complejidad  puntuación');
  for (const f of filas) console.log(`${f.archivo.padEnd(20)} ${String(f.revisiones).padStart(11)} ${String(f.complejidad).padStart(12)} ${String(f.puntuacion).padStart(11)}`);
  console.log(`acoplamiento temporal facturacion.js <-> pedidos.js: ${(acoplamiento('facturacion.js', 'pedidos.js') * 100).toFixed(0)} % de los commits de pedidos.js`);
}
