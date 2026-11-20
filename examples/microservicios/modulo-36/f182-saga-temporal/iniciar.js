// Módulo 32 · F182 · Cliente de Temporal: inicia la saga de 3 reservas y espera su resultado.
// Ejecuta (servidor, proveedor y worker en marcha): node f182-saga-temporal/iniciar.js
import { Client, Connection } from '@temporalio/client';

const client = new Client({ connection: await Connection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' }) });
const reservas = [
  { reservaId: 'R-1', eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' },
  { reservaId: 'R-2', eventoId: 'concierto-1', clienteId: 'C-2', importe: 80, tarjeta: '4000-RECHAZAR' },
  { reservaId: 'R-3', eventoId: 'concierto-1', clienteId: 'C-3', importe: 80, tarjeta: '4242-OK', fallarAlConfirmar: true },
];
for (const r of reservas) {
  // workflowId = reservaId: si el cliente reintenta el POST, Temporal no arranca una segunda saga para la misma reserva.
  const resultado = await client.workflow.execute('reservaWorkflow', { taskQueue: 'reservas', workflowId: `reserva-${r.reservaId}`, args: [r] });
  console.log(JSON.stringify(resultado));
}
