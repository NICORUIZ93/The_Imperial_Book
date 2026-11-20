// Módulo 32 · F186 · La fitness function del ADR-0002, ejecutable, y la validación de los ADR del proyecto.
// node --test f186-adr/fitness.test.js   (escenario reducido: 30 reservas/s durante 3 s, proveedor a 10/s, cola a 9/s)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { correr } from '../f185-restriccion-sobrevenida/escenario.js';
import { validarAdr } from './validar-adr.js';

test('fitness function del ADR-0002: 0 respuestas 429, 0 canceladas y p99 hasta el cobro < 60 s', { timeout: 120_000 }, async () => {
  const r = await correr({ tasa: 30, segundos: 3, limiteRps: 10, cobrosPorSegundo: 9 });
  assert.equal(r.rechazados429, 0);
  assert.equal(r.canceladas, 0);
  assert.ok(r.p99HastaCobroS < 60, `p99 ${r.p99HastaCobroS} s`);
});

test('todos los ADR del proyecto cumplen la plantilla', () => {
  const dir = new URL('./adr/', import.meta.url);
  const adrs = readdirSync(dir).filter((f) => f.endsWith('.md'));
  assert.ok(adrs.length >= 2);
  for (const f of adrs) assert.deepEqual(validarAdr(readFileSync(new URL(f, dir), 'utf8')), [], f);
});

test('un ADR sin números ni alternativas no pasa', () => {
  assert.equal(validarAdr(readFileSync(new URL('./adr-mal.md', import.meta.url), 'utf8')).length, 12);
});
