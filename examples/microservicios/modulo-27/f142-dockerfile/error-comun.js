// Módulo 23 · F142 · ERROR COMÚN: una dependencia de ejecución declarada en devDependencies.
// En tu máquina funciona (npm install trae todo); en la imagen, la etapa «deps» usa --omit=dev y el contenedor muere al
// arrancar. Este script reproduce las dos etapas sin Docker. Requisitos: haber ejecutado npm run build.
// Ejecuta: node f142-dockerfile/error-comun.js
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function imagenSimulada(moverExpressADev) {
  const dir = mkdtempSync(join(tmpdir(), 'imagen-'));
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  if (moverExpressADev) { pkg.devDependencies.express = pkg.dependencies.express; delete pkg.dependencies.express; }
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  cpSync('package-lock.json', join(dir, 'package-lock.json'));
  // npm ci exige que package.json y el lockfile coincidan: usamos «npm install --omit=dev» solo para esta demostración.
  execFileSync('npm', ['install', '--omit=dev', '--no-audit', '--no-fund', '--prefer-offline', '--silent'], { cwd: dir });
  cpSync('dist', join(dir, 'dist'), { recursive: true });
  const r = spawnSync('node', ['dist/servidor.js'], { cwd: dir, env: { ...process.env, PORT: '0' }, timeout: 1500, encoding: 'utf8' });
  rmSync(dir, { recursive: true, force: true });
  return r;
}

console.log('== MAL: express en devDependencies (la etapa deps lo omite)');
const mal = imagenSimulada(true);
console.log(`   código de salida: ${mal.status}`);
console.log(`   ${mal.stderr.split('\n').find((l) => l.startsWith('Error'))}`);
console.log('== BIEN: express en dependencies');
const bien = imagenSimulada(false);
console.log(`   ${bien.stdout.trim().split('\n')[0]}`);
