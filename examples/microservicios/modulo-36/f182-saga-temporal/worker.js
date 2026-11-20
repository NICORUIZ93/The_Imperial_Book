// Módulo 32 · F182 · Workers de Temporal: uno para la cola «reservas» (workflows + actividades propias) y otro para la
// cola «cobros» (solo el proveedor de pagos). Ejecuta con `temporal server start-dev` en marcha:
//   node f182-saga-temporal/worker.js            (sin límite de cobros: el diseño ANTES de la restricción)
//   COBROS_POR_SEGUNDO=18 node f182-saga-temporal/worker.js   (el diseño del ADR-0007: 18 cobros/s en toda la cola)
// Versiones: @temporalio/worker 1.26.0, Temporal Server 1.32.1. Necesita el proveedor (node f181-sistema-reservas/proveedor-pagos.js).
import { NativeConnection, Worker } from '@temporalio/worker';
import { crearActividades } from './actividades.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';
import { crearRepositorio } from '../f181-sistema-reservas/repositorio.js';

const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
const actividades = crearActividades({ inventario: crearInventario({ 'concierto-1': 500 }), repo: crearRepositorio(),
  pagosUrl: process.env.PAGOS_URL ?? 'http://localhost:8090' });
const limite = process.env.COBROS_POR_SEGUNDO ? Number(process.env.COBROS_POR_SEGUNDO) : undefined;

const reservas = await Worker.create({ connection, taskQueue: 'reservas',
  workflowsPath: new URL('./workflows.js', import.meta.url).pathname, activities: actividades });
const cobros = await Worker.create({ connection, taskQueue: 'cobros',
  activities: { cobrar: actividades.cobrar, reembolsar: actividades.reembolsar },
  // Límite aplicado por el SERVIDOR a toda la cola, sumando todos los workers (no por proceso): ver F183, error común.
  ...(limite ? { maxTaskQueueActivitiesPerSecond: limite } : {}) });
console.log(`workers en «reservas» y «cobros»${limite ? ` (cobros limitados a ${limite}/s)` : ''}. Ctrl+C para salir`);
await Promise.all([reservas.run(), cobros.run()]);
