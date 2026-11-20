// Módulo 24 · F150 · Tests del ATAM ligero. Ejecuta: node --test f150-atam/atam.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar, informe, priorizar, validar } from './atam.js';

const leer = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const atam = leer('./atam.json');

test('los escenarios de la tienda tienen sus 6 partes, medida con número y objetivo de negocio', () => {
  assert.deepEqual(validar(atam), []);
});

test('prioriza (A,A) antes que (A,M) y (M,B) al final', () => {
  assert.deepEqual(priorizar(atam.escenarios).map((e) => e.id), ['R1', 'C1', 'D1', 'O1', 'M1']);
});

test('agrupa los riesgos en temas y los liga a los objetivos de negocio que amenazan', () => {
  const { temas, sinAnalizar } = analizar(atam);
  assert.deepEqual([...temas.keys()], ['Consistencia de los cobros', 'Dependencia de la pasarela']);
  assert.deepEqual([...temas.get('Consistencia de los cobros').objetivos], ['N3']);
  assert.deepEqual(sinAnalizar, []);
});

test('avisa de un escenario de importancia A que ningún enfoque analiza', () => {
  const copia = structuredClone(atam);
  copia.enfoques[0].escenarios = ['R1', 'D1'];
  assert.deepEqual(analizar(copia).sinAnalizar, ['C1']);
  assert.match(informe(copia), /Escenarios de importancia A sin analizar: C1/);
});

test('los escenarios vagos no se pueden analizar', () => {
  assert.deepEqual(validar(leer('./error-comun.json')), [
    'R1: la medida «rápido» no tiene un número (no se puede comprobar)',
    'S1: falta «fuente»',
    'S1: falta «artefacto»',
    'S1: la medida «bien» no tiene un número (no se puede comprobar)',
    'S1: no se relaciona con ningún objetivo de negocio',
  ]);
});
