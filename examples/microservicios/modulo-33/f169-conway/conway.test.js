// Módulo 29 · F169 · Tests (Git real en una carpeta temporal). Ejecuta: node --test f169-conway/conway.test.js
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { after, test } from 'node:test';
import { analizar, leerHistorial, POR_CAPAS, POR_FLUJO, propietario } from './conway.js';
import { crearRepoDeEjemplo } from './repo.js';

const dir = crearRepoDeEjemplo();
after(() => rmSync(dir, { recursive: true, force: true }));

test('propietario: como en CODEOWNERS, gana la última regla que coincide', () => {
  const reglas = [['^api/', 'equipo-backend'], ['^api/pagos/', 'equipo-pagos']];
  assert.equal(propietario('api/pagos/rutas.js', reglas), 'equipo-pagos');
  assert.equal(propietario('api/catalogo/rutas.js', reglas), 'equipo-backend');
  assert.equal(propietario('README.md', reglas), 'sin-dueño');
});

test('el historial de Git tiene 6 funcionalidades de 3 archivos cada una', () => {
  const commits = leerHistorial(dir);
  assert.equal(commits.length, 6);
  assert.ok(commits.every((c) => c.archivos.length === 3));
});

test('por capas: cada funcionalidad obliga a coordinar 3 equipos (2 traspasos)', () => {
  const r = analizar(leerHistorial(dir), POR_CAPAS);
  assert.equal(r.cruzados, 6);
  assert.equal(r.traspasos, 12);
  assert.equal(r.pares['equipo-backend ↔ equipo-datos'], 6);
});

test('por flujo: cada funcionalidad la termina un solo equipo', () => {
  const r = analizar(leerHistorial(dir), POR_FLUJO);
  assert.equal(r.cruzados, 0);
  assert.equal(r.traspasos, 0);
  assert.deepEqual(r.pares, {});
});
