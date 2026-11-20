// Módulo 23 · F142 · Reproduce SIN Docker lo que hacen las etapas «deps» y «build» y mide lo que ahorra separarlas.
// Copia package.json y package-lock.json a dos carpetas temporales y ejecuta en cada una el mismo npm ci del Dockerfile.
// Requisitos: Node.js 26.13.1 LTS y npm. Ejecuta: node f142-dockerfile/etapas.js
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function tamano(ruta) { // bytes de una carpeta, recorriéndola entera
  let total = 0;
  for (const e of readdirSync(ruta, { withFileTypes: true })) {
    const p = join(ruta, e.name);
    total += e.isDirectory() ? tamano(p) : statSync(p).size;
  }
  return total;
}
const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const paquetes = (nm) => readdirSync(nm).flatMap((n) => (n.startsWith('@') ? readdirSync(join(nm, n)) : n.startsWith('.') ? [] : [n])).length;

function etapa(nombre, argumentos) {
  const dir = mkdtempSync(join(tmpdir(), `etapa-${nombre}-`));
  for (const f of ['package.json', 'package-lock.json']) cpSync(f, join(dir, f));
  execFileSync('npm', ['ci', ...argumentos, '--no-audit', '--no-fund', '--prefer-offline', '--silent'], { cwd: dir, stdio: 'inherit' });
  const nm = join(dir, 'node_modules');
  const res = { nombre, bytes: tamano(nm), paquetes: paquetes(nm), typescript: readdirSync(nm).includes('typescript') };
  rmSync(dir, { recursive: true, force: true });
  return res;
}

const build = etapa('build', []);
const deps = etapa('deps', ['--omit=dev']);
for (const e of [build, deps]) {
  console.log(`etapa ${e.nombre.padEnd(5)} node_modules: ${mb(e.bytes).padStart(8)} · ${String(e.paquetes).padStart(2)} paquetes · typescript dentro: ${e.typescript ? 'sí' : 'no'}`);
}
console.log(`la imagen final copia solo «deps»: ${mb(build.bytes - deps.bytes)} menos (${Math.round(100 * (1 - deps.bytes / build.bytes))} %)`);
