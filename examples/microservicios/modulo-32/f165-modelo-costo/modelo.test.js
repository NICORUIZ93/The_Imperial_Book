// Módulo 28 · F165 · tests: node --test f165-modelo-costo/modelo.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { costear } from './modelo.js';

const leer = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url)));
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} ≠ ${b}`);

test('cómputo Fargate del monolito: 2 tareas × 730 h × (1 vCPU + 2 GB)', () => {
  cerca(costear(leer('./monolito.json')).partidas['cómputo (Fargate)'], 2 * 730 * 3600 * (0.000011244 + 2 * 0.000001235));
});

test('los microservicios cuestan más por pedido que el monolito con el mismo tráfico', () => {
  assert.ok(costear(leer('./microservicios.json')).por1000 > costear(leer('./monolito.json')).por1000);
});

test('NAT por horas: 3 gateways × 730 h × 0.045 USD', () => {
  cerca(costear(leer('./microservicios.json')).partidas['NAT gateway (horas)'], 98.55);
});

test('las partidas suman el total y el modelo completo supera al de solo cómputo', () => {
  const arq = leer('./microservicios.json');
  const c = costear(arq);
  cerca(Object.values(c.partidas).reduce((a, b) => a + b, 0), c.total);
  assert.ok(c.total > costear(arq, { soloComputo: true }).total);
});
