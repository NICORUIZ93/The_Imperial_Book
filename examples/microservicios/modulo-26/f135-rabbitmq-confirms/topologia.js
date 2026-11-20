// Módulo 22 · F135 · Topología del ejemplo: exchange «pedidos» → cola «facturacion», con su cola de mensajes muertos.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1 (docker-compose.yml del laboratorio).
export const EXCHANGE = 'f135.pedidos';
export const COLA = 'f135.facturacion';
export const DLX = 'f135.pedidos.dlx';
export const DLQ = 'f135.facturacion.dlq';

export async function declarar(canal) {
  // durable: el exchange y la cola sobreviven a un reinicio del broker (los MENSAJES, solo si son persistentes).
  await canal.assertExchange(EXCHANGE, 'direct', { durable: true });
  await canal.assertExchange(DLX, 'fanout', { durable: true });
  await canal.assertQueue(DLQ, { durable: true });
  await canal.bindQueue(DLQ, DLX, '');
  // Lo que el consumidor rechace con requeue=false va a DLX → DLQ, en lugar de perderse.
  await canal.assertQueue(COLA, { durable: true, deadLetterExchange: DLX });
  await canal.bindQueue(COLA, EXCHANGE, 'pedido.creado');
}

export async function vaciar(canal) {
  await canal.purgeQueue(COLA);
  await canal.purgeQueue(DLQ);
}
