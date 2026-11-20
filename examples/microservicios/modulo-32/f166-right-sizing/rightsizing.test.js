// Módulo 28 · F166 · tests: node --test f166-right-sizing/rightsizing.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarUso, SERVICIOS } from './uso.js';
import { recomendar, percentil, costoMes } from './rightsizing.js';

test('percentil: p95 de 1..100 es 95', () => {
  assert.equal(percentil(Array.from({ length: 100 }, (_, i) => i + 1), 0.95), 95);
});

test('la memoria recomendada nunca queda por debajo del uso medido (0 OOMKilled)', () => {
  SERVICIOS.forEach((s, i) => {
    const uso = generarUso(s.perfil, 2026 + i);
    const r = recomendar(uso);
    assert.equal(uso.mem.filter((m) => m > r.mib).length, 0, s.nombre);
  });
});

test('pedidos está sobredimensionado y pagos infradimensionado', () => {
  const [pedidos, , pagos] = SERVICIOS;
  assert.ok(recomendar(generarUso(pedidos.perfil, 2026)).vcpu < pedidos.pide.vcpu);
  assert.ok(recomendar(generarUso(pagos.perfil, 2028)).vcpu > pagos.pide.vcpu);
});

test('costo Autopilot: 1 vCPU y 1 GiB, 1 réplica, 730 h', () => {
  assert.ok(Math.abs(costoMes({ vcpu: 1, mib: 1024 }, 1) - 730 * (0.0445 + 0.0049225)) < 1e-9);
});

test('el uso generado es reproducible (misma semilla, mismos datos)', () => {
  assert.deepEqual(generarUso(SERVICIOS[0].perfil, 7).mem.slice(0, 5), generarUso(SERVICIOS[0].perfil, 7).mem.slice(0, 5));
});
