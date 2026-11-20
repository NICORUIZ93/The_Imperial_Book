// Módulo 25 · F153 · Actividades: el código con efectos (HTTP, BD, colas). Temporal las reintenta según la RetryPolicy.
// Aquí simulan tres servicios con estado en memoria e IDEMPOTENTES por pedidoId (un reintento no duplica).
import { ApplicationFailure, log } from '@temporalio/activity';

export const estado = { stock: new Map([['TEC-1', 5]]), reservas: new Map(), cobros: new Map(), envios: new Map(), intentos: new Map() };

export async function reservarStock({ pedidoId, sku, cantidad }) {
  if (estado.reservas.has(pedidoId)) return 'ya reservado';
  const disponible = estado.stock.get(sku) ?? 0;
  if (disponible < cantidad) throw ApplicationFailure.nonRetryable(`sin stock de ${sku}`, 'SinStock');
  estado.stock.set(sku, disponible - cantidad);
  estado.reservas.set(pedidoId, { sku, cantidad });
  return 'reservado';
}

export async function liberarStock({ pedidoId }) {
  const reserva = estado.reservas.get(pedidoId);
  if (!reserva) return 'nada que liberar'; // idempotente: la segunda vez no suma otra vez
  estado.stock.set(reserva.sku, estado.stock.get(reserva.sku) + reserva.cantidad);
  estado.reservas.delete(pedidoId);
  return 'liberado';
}

export async function cobrarPago({ pedidoId, total, tarjeta }) {
  if (estado.cobros.has(pedidoId)) return estado.cobros.get(pedidoId);
  // Rechazo de negocio: no tiene sentido reintentar → nonRetryable.
  if (tarjeta === 'rechazada') throw ApplicationFailure.nonRetryable('tarjeta rechazada', 'PagoRechazado');
  // Fallo técnico transitorio: los 2 primeros intentos fallan y Temporal reintenta solo.
  const n = (estado.intentos.get(pedidoId) ?? 0) + 1;
  estado.intentos.set(pedidoId, n);
  if (tarjeta === 'inestable' && n < 3) throw new Error(`pasarela no responde (intento ${n})`);
  const cobro = `COBRO-${pedidoId}`;
  estado.cobros.set(pedidoId, cobro);
  log.info('cobrado', { pedidoId, total, intento: n });
  return cobro;
}

export async function reembolsarPago({ pedidoId }) {
  if (!estado.cobros.delete(pedidoId)) return 'nada que reembolsar';
  return 'reembolsado';
}

export async function crearEnvio({ pedidoId, direccion }) {
  if (!direccion) throw ApplicationFailure.nonRetryable('dirección vacía', 'DireccionInvalida');
  estado.envios.set(pedidoId, `ENV-${pedidoId}`);
  return `ENV-${pedidoId}`;
}
