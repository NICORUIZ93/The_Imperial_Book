// Módulo 32 · F182 · Orquestador con Temporal para el servicio de reservas: misma interfaz que orquestador-local.js.
// El servicio usa este cuando ORQUESTADOR=temporal. Versiones: @temporalio/client 1.26.0.
import { Client, Connection } from '@temporalio/client';

export async function crearOrquestadorTemporal(address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233') {
  const client = new Client({ connection: await Connection.connect({ address }) });
  return {
    // Arranca y espera el resultado (el servicio responde 202 antes: no bloquea la petición HTTP).
    iniciar: (reserva) => client.workflow.execute('reservaWorkflow',
      { taskQueue: 'reservas', workflowId: `reserva-${reserva.reservaId}`, args: [reserva] }),
  };
}
