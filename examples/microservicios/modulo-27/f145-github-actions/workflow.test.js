// Módulo 23 · F145 · Tests del workflow de GitHub Actions. Ejecuta: node --test f145-github-actions/workflow.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { validar } from './validar.js';

const texto = readFileSync(new URL('./ci.yml', import.meta.url), 'utf8');
const wf = parse(texto);

test('ci.yml cumple las 6 reglas', () => {
  assert.deepEqual(validar(texto).filter((r) => !r.ok), []);
});

test('ci.antes.yml incumple las 6', () => {
  assert.equal(validar(readFileSync(new URL('./ci.antes.yml', import.meta.url), 'utf8')).filter((r) => !r.ok).length, 6);
});

test('la imagen solo se construye si pasan las pruebas y solo ese job puede escribir paquetes', () => {
  assert.equal(wf.jobs.imagen.needs, 'pruebas');
  assert.deepEqual(wf.jobs.imagen.permissions, { contents: 'read', packages: 'write' });
  assert.equal(wf.jobs.pruebas.permissions, undefined); // hereda contents: read
});

test('se publica solo en main y con el token en una variable de entorno', () => {
  const publicar = wf.jobs.imagen.steps.find((p) => p.name?.startsWith('Publicar'));
  assert.equal(publicar.if, "github.ref == 'refs/heads/main'");
  assert.equal(publicar.env.TOKEN, '${{ secrets.GITHUB_TOKEN }}');
  assert.match(publicar.run, /--password-stdin/);
});

test('el job de pruebas ejecuta lo mismo que el desarrollador: npm ci, build y test', () => {
  assert.deepEqual(wf.jobs.pruebas.steps.filter((p) => p.run).map((p) => p.run), ['npm ci', 'npm run build', 'npm test']);
});
