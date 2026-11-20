// Módulo 23 · F146 · Tests de Blue-Green y Canary. Ejecuta: node --test f146-blue-green-canary/despliegue.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAllDocuments } from 'yaml';
import { BlueGreen, Canary, analizar, cubeta } from './despliegue.js';

const usuarios = Array.from({ length: 1000 }, (_, i) => `u${i}`);

test('canary al 10 %: cerca del 10 % de los usuarios va a la versión nueva', () => {
  const c = new Canary(10);
  const nuevos = usuarios.filter((u) => c.elegir(u) === 'canary').length;
  assert.ok(nuevos > 70 && nuevos < 130, `${nuevos}`);
});

test('el mismo usuario cae siempre en la misma versión, y subir el peso no saca a nadie del canary', () => {
  assert.equal(cubeta('u42'), cubeta('u42'));
  const al10 = usuarios.filter((u) => new Canary(10).elegir(u) === 'canary');
  assert.ok(al10.every((u) => new Canary(25).elegir(u) === 'canary'));
});

test('análisis: espera sin datos, aborta si la nueva falla más y continúa si está sana', () => {
  const estable = { total: 180, errores: 0 };
  assert.equal(analizar({ estable, canary: { total: 5, errores: 5 } }), 'esperar');
  assert.equal(analizar({ estable, canary: { total: 20, errores: 4 } }), 'abortar');
  assert.equal(analizar({ estable, canary: { total: 20, errores: 0 } }), 'continuar');
});

test('blue-green: el cambio y el rollback son un solo paso', () => {
  const bg = new BlueGreen('blue');
  assert.equal(bg.cambiar(), 'green');
  assert.ok(usuarios.every((u) => bg.elegir(u) === 'green'));
  assert.equal(bg.cambiar(), 'blue');
});

test('manifiestos: el Service elige solo el color blue y el Rollout pausa en 10, 25 y 50 %', () => {
  const docs = parseAllDocuments(readFileSync(new URL('./blue-green.yaml', import.meta.url), 'utf8')).map((d) => d.toJS());
  assert.deepEqual(docs.find((d) => d.kind === 'Service').spec.selector, { app: 'pedidos', color: 'blue' });
  const rollout = parseAllDocuments(readFileSync(new URL('./rollout-canary.yaml', import.meta.url), 'utf8'))[0].toJS();
  assert.deepEqual(rollout.spec.strategy.canary.steps.filter((s) => s.setWeight).map((s) => s.setWeight), [10, 25, 50]);
});
