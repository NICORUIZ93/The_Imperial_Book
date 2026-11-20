// Test de diferencias.js. Mismos casos que DiferenciasTest.java, más el caso que Java no permite.
// Ejecuta (desde la carpeta node/):  node --test diferencias.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sumar, convertir, tresTareasEnParalelo } from './diferencias.js';

test('sumar(2, 2) es 4', () => assert.equal(sumar(2, 2), 4));
test("sumar('2', 2) es '22': JavaScript no revisa tipos", () => assert.equal(sumar('2', 2), '22'));
test("convertir('42') da número 42", () => assert.equal(convertir('42'), 'número 42'));
test("convertir('cuarenta') detecta NaN", () => assert.match(convertir('cuarenta'), /^error/));
test('3 tareas de 1 s en paralelo tardan menos de 1.5 s', async () => {
  assert.ok((await tresTareasEnParalelo()) < 1500);
});
