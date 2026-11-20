// Módulo 32 · F182 · test sin servidor: el workflow pasa el empaquetador de Temporal (el mismo que usa Worker.create),
// que rechaza imports no deterministas. node --test f182-saga-temporal/bundle.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bundleWorkflowCode } from '@temporalio/worker';

const silencio = { info() {}, warn() {}, debug() {}, trace() {}, error() {}, log() {} };
const ruta = (f) => new URL(f, import.meta.url).pathname;

test('workflows.js se empaqueta para el sandbox de Temporal', { timeout: 120_000 }, async () => {
  const { code } = await bundleWorkflowCode({ workflowsPath: ruta('./workflows.js'), logger: silencio });
  assert.ok(code.includes('reservaWorkflow'));
});

test('workflow-mal.js (importa las actividades) se rechaza', { timeout: 120_000 }, async () => {
  await assert.rejects(bundleWorkflowCode({ workflowsPath: ruta('./workflow-mal.js'), logger: silencio }),
    /importing the following disallowed modules:\s+- '@temporalio\/activity'/);
});
