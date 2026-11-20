// Módulo 23 · F145 · Ejecuta EN LOCAL los pasos «run:» de un job de ci.yml, en orden y con bash, como haría el runner.
// Los pasos «uses:» (checkout, setup-node) los hace GitHub: aquí se anuncian y se saltan. Emula GITHUB_ENV, GITHUB_SHA,
// GITHUB_REPOSITORY y GITHUB_REF, y salta los pasos con «if:» que exigen main. Requisitos: Node.js 26.13.1 LTS, yaml 2.9.1.
// Uso (desde la raíz del laboratorio): node f145-github-actions/simular-ci.js pruebas   |   ... imagen (necesita Docker)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';

const nombreJob = process.argv[2] ?? 'pruebas';
const job = parse(readFileSync(new URL('./ci.yml', import.meta.url), 'utf8')).jobs[nombreJob];
const archivoEnv = join(mkdtempSync(join(tmpdir(), 'gha-')), 'env');
writeFileSync(archivoEnv, '');
const base = { ...process.env, GITHUB_ENV: archivoEnv, GITHUB_REPOSITORY: 'Estudiante/Tienda', GITHUB_ACTOR: 'estudiante', GITHUB_REF: 'refs/heads/rama-local', GITHUB_SHA: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678', CI: 'true' };

let fallo = false;
for (const paso of job.steps) {
  const titulo = paso.name ?? paso.uses ?? paso.run.split('\n')[0];
  if (paso.uses) { console.log(`– ${titulo} (acción de GitHub: se salta en local)`); continue; }
  if (paso.if && !paso.if.includes('refs/heads/rama-local')) { console.log(`– ${titulo} (if: ${paso.if} → falso en local)`); continue; }
  const extra = Object.fromEntries(readFileSync(archivoEnv, 'utf8').split('\n').filter(Boolean).map((l) => l.split(/=(.*)/s).slice(0, 2)));
  const inicio = Date.now();
  const r = spawnSync('bash', ['-eo', 'pipefail', '-c', paso.run], { env: { ...base, ...extra }, encoding: 'utf8' });
  const seg = ((Date.now() - inicio) / 1000).toFixed(1);
  if (r.status === 0) {
    console.log(`✔ ${titulo} (${seg} s)`);
    if (r.stdout.trim() && !paso.run.startsWith('npm')) console.log(`    ${r.stdout.trim().split('\n').slice(-1)[0]}`);
  } else {
    console.log(`✘ ${titulo} (código ${r.status})\n${(r.stdout + r.stderr).trim().split('\n').slice(-15).join('\n')}`);
    fallo = true;
    break;
  }
}
const env = readFileSync(archivoEnv, 'utf8').trim();
if (env) console.log(`GITHUB_ENV: ${env}`);
console.log(fallo ? `job ${nombreJob}: FALLA` : `job ${nombreJob}: OK`);
process.exitCode = fallo ? 1 : 0;
