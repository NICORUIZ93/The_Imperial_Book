// Módulo 29 · F172 · Tests. Ejecuta: node --test f172-dimensionamiento/tamano.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canales, comparar, dividir, evaluarTamano, revisarAgrupacion } from './tamano.js';

test('canales crecen con el cuadrado: 5→10, 9→36, 24→276', () => {
  assert.deepEqual([5, 9, 24].map(canales), [10, 36, 276]);
});

test('tamaño adecuado entre 5 y 9 personas', () => {
  assert.equal(evaluarTamano(4), 'pequeño: frágil ante vacaciones y bajas');
  assert.equal(evaluarTamano(5), 'adecuado');
  assert.equal(evaluarTamano(9), 'adecuado');
  assert.match(evaluarTamano(10), /^grande/);
  assert.match(evaluarTamano(16), /^demasiado grande/);
});

test('dividir reparte parejo y nunca pasa del máximo', () => {
  assert.deepEqual(dividir(24), [8, 8, 8]);
  assert.deepEqual(dividir(20), [7, 7, 6]);
  assert.ok(dividir(41).every((n) => n <= 9));
});

test('24 personas: 276 canales en un grupo frente a 84 + 2 en tres equipos', () => {
  assert.deepEqual(comparar(24, { interfaces: 2 }), { unSoloGrupo: 276, tamanos: [8, 8, 8], canalesInternos: 84, interfacesEntreEquipos: 2 });
});

test('un grupo de equipos de 54 personas pasa del límite de 50 salvo con alta confianza', () => {
  assert.equal(revisarAgrupacion([8, 8, 8, 7, 9, 6, 8]).ok, false);
  assert.equal(revisarAgrupacion([8, 8, 8, 7, 9, 6, 8], { altaConfianza: true }).ok, true);
});
