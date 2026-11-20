// Módulo 32 · F187 · tests: node --test f187-defensa-arb/defensa.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { puntuar } from './puntuar.js';
import { revisar } from './entregables.js';

const leer = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url)));

test('los pesos de la rúbrica suman 1', () => {
  const suma = leer('./rubrica.json').criterios.reduce((s, c) => s + c.peso, 0);
  assert.equal(Math.round(suma * 100) / 100, 1);
});

test('la evaluación de ejemplo aprueba con 3.30', () => {
  const r = puntuar(leer('./evaluacion-ejemplo.json').notas);
  assert.deepEqual([r.total, r.aprueba], [3.3, true]);
});

test('una media alta NO aprueba si un criterio está en 1', () => {
  const r = puntuar(leer('./evaluacion-con-un-1.json').notas);
  assert.equal(r.total, 3.7);
  assert.deepEqual([r.aprueba, r.enUno], [false, ['Seguridad']]);
});

test('una nota fuera de 1-4 es un error, no un 0 silencioso', () => {
  assert.throws(() => puntuar({ 1: 5 }), /fuera de 1-4/);
});

test('este laboratorio tiene todos los entregables que pide el Comité', () => {
  const faltan = revisar(new URL('..', import.meta.url).pathname).filter(([, ok]) => !ok).map(([q]) => q);
  assert.deepEqual(faltan, []);
});
