// Módulo 28 · F167 · tests: node --test f167-break-even/breakeven.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { costoLambda, costoFargate, breakEven, tareasNecesarias } from './breakeven.js';

const cerca = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

test('Lambda: 1 millón de peticiones de 120 ms y 512 MB = 0.20 + 60 000 GB-s × 0.0000166667', () => {
  cerca(costoLambda(1e6), 0.20 + 60_000 * 0.0000166667);
});

test('la capa gratuita cubre 1 millón de peticiones y 400 000 GB-s', () => {
  assert.equal(costoLambda(1e6, undefined, { capaGratuita: true }), 0);
});

test('en el break-even Lambda y Fargate (mínimo de tareas) cuestan lo mismo', () => {
  const n = breakEven();
  cerca(costoLambda(n), costoFargate(n));
});

test('Fargate escala por el pico: 1e9 pet/mes con pico ×3 necesita 20 tareas de 60 pet/s', () => {
  assert.equal(tareasNecesarias(1e9), 20);
  assert.ok(costoFargate(1e9) < costoLambda(1e9));
});
