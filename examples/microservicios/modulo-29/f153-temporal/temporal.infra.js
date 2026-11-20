// Módulo 25 · F153 · Tests con un servidor Temporal de verdad.
// Por defecto el SDK descarga y arranca el servidor de desarrollo del CLI de Temporal (TestWorkflowEnvironment.createLocal);
// con TEMPORAL_ADDRESS=host:7233 usa un servidor que ya tengas en marcha.
// Ejecuta: node --test f153-temporal/temporal.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Runtime, DefaultLogger, Worker } from '@temporalio/worker';
import * as actividades from './actividades.js';

let env;
let worker;
let enMarcha;
before(async () => {
  Runtime.install({ logger: new DefaultLogger('WARN') });
  env = process.env.TEMPORAL_ADDRESS
    ? await TestWorkflowEnvironment.createFromExistingServer({ address: process.env.TEMPORAL_ADDRESS })
    : await TestWorkflowEnvironment.createLocal();
  worker = await Worker.create({
    connection: env.nativeConnection,
    taskQueue: 'pedidos-test',
    workflowsPath: new URL('./workflows.js', import.meta.url).pathname,
    activities: actividades,
  });
  enMarcha = worker.run();
}, { timeout: 180_000 });
after(async () => { worker?.shutdown(); await enMarcha; await env?.teardown(); });

const correr = (pedido) => env.client.workflow.execute('sagaPedido', {
  taskQueue: 'pedidos-test', workflowId: `saga-${pedido.pedidoId}-${Date.now()}`, args: [pedido],
});
const base = { sku: 'TEC-1', cantidad: 1, total: 99000, direccion: 'Calle 1' };

test('pasarela inestable: Temporal reintenta el cobro y la saga se completa', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, pedidoId: 'T-1', tarjeta: 'inestable' });
  assert.equal(r.estado, 'COMPLETADA');
  assert.equal(actividades.estado.intentos.get('T-1'), 3);
});

test('tarjeta rechazada (no reintentable): se libera el stock', { timeout: 90_000 }, async () => {
  const antes = actividades.estado.stock.get('TEC-1');
  const r = await correr({ ...base, pedidoId: 'T-2', tarjeta: 'rechazada' });
  assert.equal(r.estado, 'COMPENSADA');
  assert.equal(r.fallo, 'cobrarPago: tarjeta rechazada');
  assert.deepEqual(r.compensadas, ['reservarStock']);
  assert.equal(actividades.estado.stock.get('TEC-1'), antes);
});

test('envío inválido: se reembolsa y se libera, en orden inverso', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, pedidoId: 'T-3', tarjeta: 'ok', direccion: '' });
  assert.deepEqual(r.compensadas, ['cobrarPago', 'reservarStock']);
  assert.equal(actividades.estado.cobros.has('T-3'), false);
});
