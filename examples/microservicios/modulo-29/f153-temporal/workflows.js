// Módulo 25 · F153 · Workflow de la saga de pedido, orquestado por Temporal.
// Requisitos: Node.js 26.13.1 LTS, @temporalio/workflow 1.26.0, Temporal Server 1.32.1 (o el servidor de desarrollo del CLI).
// Este archivo corre en un sandbox determinista: sin red, sin disco y sin imports de Node.
import { log, proxyActivities } from '@temporalio/workflow';
import { ejecutarSaga } from './saga.js';

const act = proxyActivities({
  startToCloseTimeout: '10 seconds',
  retry: { initialInterval: '100 milliseconds', backoffCoefficient: 2, maximumAttempts: 5 },
});

export async function sagaPedido(pedido) {
  const resultado = await ejecutarSaga([
    { nombre: 'reservarStock', hacer: () => act.reservarStock(pedido), deshacer: () => act.liberarStock(pedido) },
    { nombre: 'cobrarPago', hacer: () => act.cobrarPago(pedido), deshacer: () => act.reembolsarPago(pedido) },
    { nombre: 'crearEnvio', hacer: () => act.crearEnvio(pedido) },
  ]);
  log.info('saga terminada', { pedidoId: pedido.pedidoId, estado: resultado.estado });
  return resultado;
}
