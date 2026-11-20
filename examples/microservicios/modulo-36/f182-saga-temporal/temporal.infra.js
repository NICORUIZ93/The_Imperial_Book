// Módulo 32 · F182 · Tests con un servidor Temporal de verdad (no corre en `npm test`).
// Por defecto descarga y arranca el servidor de desarrollo del CLI (TestWorkflowEnvironment.createLocal); con
// TEMPORAL_ADDRESS=host:7233 usa uno que ya tengas en marcha. Ejecuta: node --test f182-saga-temporal/temporal.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { crearActividades } from './actividades.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';
import { crearRepositorio } from '../f181-sistema-reservas/repositorio.js';
import { crearProveedor } from '../f181-sistema-reservas/proveedor-pagos.js';
import { cerrar, escuchar } from '../comun/http.js';

let env; let workers = []; let enMarcha; let proveedor; let stats;
before(async () => {
  Runtime.install({ logger: new DefaultLogger('WARN') });
  ({ servidor: proveedor, stats } = crearProveedor());
  const pagosUrl = await escuchar(proveedor);
  env = process.env.TEMPORAL_ADDRESS
    ? await TestWorkflowEnvironment.createFromExistingServer({ address: process.env.TEMPORAL_ADDRESS })
    : await TestWorkflowEnvironment.createLocal();
  const act = crearActividades({ inventario: crearInventario({ 'concierto-1': 10 }), repo: crearRepositorio(), pagosUrl });
  workers = [
    await Worker.create({ connection: env.nativeConnection, taskQueue: 'reservas', workflowsPath: new URL('./workflows.js', import.meta.url).pathname, activities: act }),
    await Worker.create({ connection: env.nativeConnection, taskQueue: 'cobros', activities: { cobrar: act.cobrar, reembolsar: act.reembolsar } }),
  ];
  enMarcha = Promise.all(workers.map((w) => w.run()));
}, { timeout: 180_000 });
after(async () => { workers.forEach((w) => w.shutdown()); await enMarcha; await env?.teardown(); await cerrar(proveedor); });

const correr = (r) => env.client.workflow.execute('reservaWorkflow', { taskQueue: 'reservas', workflowId: `reserva-${r.reservaId}-${Date.now()}`, args: [r] });
const base = { eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' };

test('Temporal: camino feliz', { timeout: 90_000 }, async () => {
  assert.equal((await correr({ ...base, reservaId: 'T-1' })).estado, 'CONFIRMADA');
});
test('Temporal: tarjeta rechazada -> CANCELADA con la plaza liberada', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, reservaId: 'T-2', tarjeta: '4000-RECHAZAR' });
  assert.deepEqual([r.estado, r.compensadas], ['CANCELADA', ['liberarPlaza']]);
  assert.match(r.motivo, /tarjeta rechazada/);
});
test('Temporal: falla confirmar -> reembolsar y liberar', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, reservaId: 'T-3', fallarAlConfirmar: true });
  assert.deepEqual(r.compensadas, ['reembolsar', 'liberarPlaza']);
  assert.ok(stats.reembolsos >= 1);
});
