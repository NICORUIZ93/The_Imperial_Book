// Módulo 23 · F142 · Tests del Dockerfile multi-stage (sin Docker). Ejecuta: node --test f142-dockerfile/dockerfile.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { instrucciones, revisar } from './revisar.js';

const despues = readFileSync(new URL('./Dockerfile', import.meta.url), 'utf8');
const antes = readFileSync(new URL('./Dockerfile.antes', import.meta.url), 'utf8');

test('el Dockerfile multi-stage cumple las 7 reglas', () => {
  assert.deepEqual(revisar(despues).filter((r) => !r.ok), []);
});

test('el Dockerfile de una etapa incumple 6 de las 7', () => {
  assert.equal(revisar(antes).filter((r) => !r.ok).length, 6);
});

test('la etapa final solo recibe dist/, node_modules de producción y package.json', () => {
  const ins = instrucciones(despues);
  const ultima = Math.max(...ins.map((i) => i.etapa));
  const copias = ins.filter((i) => i.op === 'COPY' && i.etapa === ultima).map((i) => i.args);
  assert.deepEqual(copias, ['--from=deps /app/node_modules ./node_modules', '--from=build /app/dist ./dist', 'package.json ./']);
});

test('.dockerignore deja fuera node_modules, dist, .git y los .env', () => {
  const ignorados = readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8').split('\n');
  for (const patron of ['node_modules', 'dist', '.git', '.env', '.env.*']) assert.ok(ignorados.includes(patron), patron);
});
