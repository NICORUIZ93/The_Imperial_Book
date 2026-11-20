// Módulo 32 · F182 · Workflow de Temporal para la saga de reservas.
// Versiones: Node.js 26.13.1 LTS, @temporalio/workflow 1.26.0, Temporal Server 1.32.1 (o `temporal server start-dev`).
// Corre en el sandbox determinista de Temporal: sin red, sin disco, sin imports de Node. Solo orquesta; el trabajo real
// lo hacen las actividades (actividades.js), que Temporal reintenta y cuyo resultado guarda en el historial.
import { proxyActivities } from '@temporalio/workflow';
import { sagaReserva } from './saga.js';

const reintentos = { initialInterval: '200 milliseconds', backoffCoefficient: 2, maximumInterval: '5 seconds', maximumAttempts: 8,
  nonRetryableErrorTypes: ['SinPlazas', 'PagoRechazado', 'EventoCerrado'] };

// Actividades propias: cola «reservas».
const act = proxyActivities({ startToCloseTimeout: '10 seconds', retry: reintentos });
// El cobro va a su propia cola, «cobros», para poder limitar su ritmo sin frenar lo demás (ADR-0007, F185/F186).
// scheduleToCloseTimeout: tiempo total que aceptamos esperar al cobro, contando la cola y los reintentos.
const pagos = proxyActivities({ taskQueue: 'cobros', startToCloseTimeout: '10 seconds', scheduleToCloseTimeout: '10 minutes',
  retry: { ...reintentos, maximumAttempts: 0 } }); // 0 = sin límite de intentos: manda scheduleToCloseTimeout

export async function reservaWorkflow(reserva) {
  return sagaReserva(reserva, { ...act, cobrar: pagos.cobrar, reembolsar: pagos.reembolsar });
}
