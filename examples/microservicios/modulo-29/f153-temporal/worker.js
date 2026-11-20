// Módulo 25 · F153 · Worker: ejecuta workflows y actividades de la cola «pedidos».
// Ejecuta (con un servidor Temporal en localhost:7233): node f153-temporal/worker.js
import { NativeConnection, Worker } from '@temporalio/worker';
import * as actividades from './actividades.js';

const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
const worker = await Worker.create({
  connection,
  taskQueue: 'pedidos',
  workflowsPath: new URL('./workflows.js', import.meta.url).pathname, // el SDK lo empaqueta con webpack
  activities: actividades,
});
console.log('worker escuchando la cola «pedidos» (Ctrl+C para salir)');
await worker.run();
