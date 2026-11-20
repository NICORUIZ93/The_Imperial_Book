// Módulo 26 · F158 · Topología avanzada: cola quorum con límite de entregas, reintentos escalonados con colas de
// espera (TTL + dead-letter de vuelta) y cola de mensajes muertos. Requisitos: amqplib 2.4.0, RabbitMQ 4.4.1.
export const EXCHANGE = 'f158.pedidos';
export const COLA = 'f158.cobros';
export const DLX = 'f158.dlx';
export const DLQ = 'f158.cobros.dlq';
export const ESPERAS = [200, 600]; // ms de espera del 1.er y 2.º reintento (en producción: 10 s, 1 min, 10 min…)
export const espera = (ms) => `f158.espera.${ms}ms`;
export const LIMITE_ENTREGAS = 3;

export async function declarar(canal) {
  await canal.assertExchange(EXCHANGE, 'direct', { durable: true });
  await canal.assertExchange(DLX, 'fanout', { durable: true });
  await canal.assertQueue(DLQ, { durable: true, arguments: { 'x-queue-type': 'quorum' } });
  await canal.bindQueue(DLQ, DLX, '');
  // Cola quorum (replicada con Raft). x-delivery-limit: tras ese número de entregas fallidas, a la DLX.
  await canal.assertQueue(COLA, {
    durable: true,
    arguments: { 'x-queue-type': 'quorum', 'x-delivery-limit': LIMITE_ENTREGAS, 'x-dead-letter-exchange': DLX },
  });
  await canal.bindQueue(COLA, EXCHANGE, 'cobro');
  // Colas de espera: nadie las consume. Al vencer el TTL, el mensaje «muere» y vuelve al exchange principal.
  for (const ms of ESPERAS) {
    await canal.assertQueue(espera(ms), {
      durable: true,
      arguments: { 'x-message-ttl': ms, 'x-dead-letter-exchange': EXCHANGE, 'x-dead-letter-routing-key': 'cobro' },
    });
  }
}

export async function borrar(canal) {
  for (const q of [COLA, DLQ, ...ESPERAS.map(espera)]) await canal.deleteQueue(q);
}
