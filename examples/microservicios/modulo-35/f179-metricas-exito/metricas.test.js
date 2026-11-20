// Módulo 31 · F179 · tests: node --test f179-metricas-exito/metricas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dora, puertaDeAvance } from './metricas.js';
import { antes, despues } from './datos.js';

const H = 3_600_000;
const d = (h, fallo = false, rec = 0, rework = false) => ({ commit: 0, despliegue: h * H, fallo, recuperacionMin: rec, rework });

test('DORA a mano: 4 despliegues normales, 1 fallido (30 min) y 1 de rework en 7 días', () => {
  const m = dora([d(2), d(4), d(6, true, 30), d(8), d(1, false, 0, true)], 7);
  assert.equal(m.frecuenciaPorSemana, 5);
  assert.equal(m.leadTimeHoras, 4);
  assert.equal(m.tasaFallo, 0.25);
  assert.equal(m.recuperacionMin, 30);
  assert.equal(m.tasaRework, 0.2);
});

test('con los datos del laboratorio, el servicio nuevo mejora las cinco métricas', () => {
  const a = dora(antes); const n = dora(despues);
  assert.ok(n.frecuenciaPorSemana > a.frecuenciaPorSemana);
  assert.ok(n.leadTimeHoras < a.leadTimeHoras);
  assert.ok(n.recuperacionMin < a.recuperacionMin);
  assert.ok(n.tasaFallo < a.tasaFallo);
  assert.ok(n.tasaRework < a.tasaRework);
});

test('la puerta de avance se cierra si el servicio nuevo es peor que el monolito', () => {
  const base = { errores: 0.4, p99: 400 };
  assert.equal(puertaDeAvance({ base, nuevo: { errores: 0.45, p99: 430 }, diferenciasSombra: 0 }).avanzar, true);
  const r = puertaDeAvance({ base, nuevo: { errores: 0.4, p99: 400 }, diferenciasSombra: 0.02 });
  assert.deepEqual(r, { avanzar: false, motivos: ['tráfico en sombra con 2.00 % de respuestas distintas'] });
});
