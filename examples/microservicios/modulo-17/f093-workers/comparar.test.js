// Verificación F093: node --test f093-workers/comparar.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latidosDurante, enHiloPrincipal, enWorker, enProcesoHijo, versionConExecFile } from './comparar.js';

const N = 34; // ≈ 100–200 ms de CPU

test('en el hilo principal el Event Loop se congela (0 latidos)', async () => {
  const { latidos, resultado } = await latidosDurante(() => enHiloPrincipal(N));
  assert.equal(resultado, 5702887);
  assert.equal(latidos, 0);
});

test('en un Worker Thread el loop sigue latiendo', async () => {
  const { latidos, resultado } = await latidosDurante(() => enWorker(N));
  assert.equal(resultado, 5702887);
  assert.ok(latidos > 0, `latidos: ${latidos}`);
});

test('en un proceso hijo el loop sigue latiendo y el PID es otro', async () => {
  const { latidos, resultado } = await latidosDurante(() => enProcesoHijo(N));
  assert.equal(resultado.resultado, 5702887);
  assert.notEqual(resultado.pid, process.pid);
  assert.ok(latidos > 0, `latidos: ${latidos}`);
});

test('execFile ejecuta otro programa y captura su salida', async () => {
  assert.equal(await versionConExecFile(), process.version);
});
