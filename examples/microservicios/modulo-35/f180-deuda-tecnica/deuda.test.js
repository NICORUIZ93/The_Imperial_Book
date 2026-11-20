// Módulo 31 · F180 · tests: node --test f180-deuda-tecnica/deuda.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizar, complejidad } from './hotspots.js';
import { generarRepo } from './generar-repo.js';
import { DEUDAS, priorizar } from './registro-deuda.js';
import { decidir } from './decision.js';

test('complejidad por indentación: 2 espacios = 1 nivel, las líneas vacías no cuentan', () => {
  assert.equal(complejidad('a\n  b\n\n    c\n'), 3);
});

const { filas, acoplamiento } = analizar(generarRepo());

test('el hotspot es facturacion.js, no el archivo más complejo (reportes-legado.js)', () => {
  assert.equal(filas[0].archivo, 'facturacion.js');
  const masComplejo = [...filas].sort((a, b) => b.complejidad - a.complejidad)[0];
  assert.equal(masComplejo.archivo, 'reportes-legado.js');
  assert.equal(masComplejo.revisiones, 1);
});

test('facturación y pedidos cambian siempre juntos (acoplamiento temporal del 100 %)', () => {
  assert.equal(acoplamiento('facturacion.js', 'pedidos.js'), 1);
});

test('el registro prioriza por meses de recuperación: D4 primero, D3 el último', () => {
  const orden = priorizar(DEUDAS).map((d) => d.id);
  assert.equal(orden[0], 'D4');
  assert.equal(orden.at(-1), 'D3');
});

test('ejercicio de decisión: con acoplamiento del 100 % y sin criterios a favor, NO extraer', () => {
  assert.equal(decidir({ escalaDistinto: false, equipoPropio: false, acoplamientoTemporal: 1, requisitoPropio: false }).extraer, false);
  assert.equal(decidir({ escalaDistinto: true, equipoPropio: true, acoplamientoTemporal: 0.1, requisitoPropio: false }).extraer, true);
});
