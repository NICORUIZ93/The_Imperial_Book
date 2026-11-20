// Módulo 28 · F168 · tests: node --test f168-observability-tax/observabilidad.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seriesHistograma, combinaciones, factura, bytesPorLinea, ESCENARIOS } from './observabilidad.js';

test('un histograma con 10 límites expone 13 series por combinación (10 + +Inf, _sum, _count)', () => {
  assert.equal(seriesHistograma({ ruta: 1 }, 10), 13);
  assert.equal(seriesHistograma({ servicio: 6, ruta: 12, clase: 3 }, 10), 216 * 13);
});

test('añadir una etiqueta multiplica las combinaciones', () => {
  assert.equal(combinaciones({ a: 6, b: 12 }) * 50, combinaciones({ a: 6, b: 12, user_id: 50 }));
});

test('la línea de log se mide en bytes reales (UTF-8 + salto de línea)', () => {
  assert.ok(bytesPorLinea() > 250 && bytesPorLinea() < 400);
  assert.equal(bytesPorLinea({ msg: 'ñ' }) - bytesPorLinea({ msg: 'n' }), 1); // «ñ» ocupa 2 bytes en UTF-8
});

test('el escenario disciplinado cuesta menos del 1,5 % del ingenuo', () => {
  const total = (e) => Object.values(factura(e)).reduce((a, b) => a + b, 0);
  assert.ok(total(ESCENARIOS.disciplinado) < total(ESCENARIOS.ingenuo) * 0.015);
});

test('trazas: 30 millones al 10 % = 3 millones × 5 USD', () => {
  assert.equal(factura(ESCENARIOS.disciplinado).trazas, 15);
});
