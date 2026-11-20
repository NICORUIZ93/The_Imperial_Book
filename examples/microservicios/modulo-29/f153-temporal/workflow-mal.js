// Módulo 25 · F153 · Error común: un workflow que hace E/S directamente (aquí lee un archivo con node:fs).
// El código del workflow se re-ejecuta (replay) para reconstruir su estado: tiene que ser determinista.
import { readFileSync } from 'node:fs';
import { proxyActivities } from '@temporalio/workflow';

const act = proxyActivities({ startToCloseTimeout: '10 seconds' });

export async function sagaPedidoMal(pedido) {
  const tarifas = JSON.parse(readFileSync('/tmp/tarifas.json', 'utf8')); // ✘ E/S dentro del workflow
  await act.cobrarPago({ ...pedido, total: pedido.total + tarifas.envio });
}
