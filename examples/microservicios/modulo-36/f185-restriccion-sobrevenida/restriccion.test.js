// Módulo 32 · F185 · tests (escenario reducido: 30 reservas/s durante 2 s, proveedor a 10/s):
// node --test f185-restriccion-sobrevenida/restriccion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correr } from './escenario.js';
import { limitarCobros } from './cola-cobros.js';

test('la cola de cobros despacha a ritmo fijo y en orden de llegada', async () => {
  const marcas = [];
  const act = limitarCobros({ cobrar: async (r) => { marcas.push([r.id, Date.now()]); return {}; }, reembolsar: async () => ({}) }, 20);
  await Promise.all([1, 2, 3, 4, 5].map((id) => act.cobrar({ id })));
  assert.deepEqual(marcas.map(([id]) => id), [1, 2, 3, 4, 5]);
  const total = marcas.at(-1)[1] - marcas[0][1];
  assert.ok(total >= 190 && total < 400, `5 cobros a 20/s tardan ~200 ms (${total} ms)`);
});

test('ANTES: con cobro inmediato el proveedor responde 429 y se pierden ventas', { timeout: 60_000 }, async () => {
  const r = await correr({ tasa: 30, segundos: 2, limiteRps: 10 });
  assert.ok(r.rechazados429 > 0);
  assert.ok(r.canceladas > 0, `canceladas: ${r.canceladas}`);
});

test('DESPUÉS: con la cola a 9/s no hay ningún 429 y todas se confirman', { timeout: 60_000 }, async () => {
  const r = await correr({ tasa: 30, segundos: 2, limiteRps: 10, cobrosPorSegundo: 9 });
  assert.deepEqual([r.rechazados429, r.canceladas, r.confirmadas], [0, 0, 60]);
  assert.ok(r.maxCobrosEnUnSegundo <= 10);
});
