// Módulo 25 · F153 · Cliente: inicia una saga y espera el resultado.
// Ejecuta (con worker.js corriendo): node f153-temporal/iniciar.js P-1 inestable "Calle 1"
import { Client, Connection } from '@temporalio/client';

const [pedidoId = 'P-1', tarjeta = 'ok', direccion = 'Calle 1'] = process.argv.slice(2);
const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
const client = new Client({ connection });
// workflowId = pedidoId: si lo lanzas dos veces, Temporal rechaza el duplicado (WorkflowExecutionAlreadyStartedError).
const handle = await client.workflow.start('sagaPedido', {
  taskQueue: 'pedidos',
  workflowId: `saga-${pedidoId}`,
  args: [{ pedidoId, sku: 'TEC-1', cantidad: 1, total: 99000, tarjeta, direccion }],
});
console.log(`iniciado ${handle.workflowId}`);
console.log(JSON.stringify(await handle.result()));
await connection.close();
