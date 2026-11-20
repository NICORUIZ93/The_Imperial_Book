// Módulo 18 · F116 · amqplib: publicador con confirmaciones y consumidor con ack manual sobre RabbitMQ.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0 y RabbitMQ 4.4.1 (docker-compose.yml del laboratorio).
import amqplib from 'amqplib';
import { deserializar, serializar } from './evento.js';

export const EXCHANGE = 'pedidos.eventos';
export const URL_AMQP = process.env.AMQP_URL ?? 'amqp://academia:academia@localhost:5672';

// Topología: exchange «pedidos.eventos» (topic) → cola de cada consumidor, enlazada por patrón de routing key.
export async function declararCola(canal, cola, patron, exchange = EXCHANGE) {
  await canal.assertExchange(exchange, 'topic', { durable: true });
  await canal.assertQueue(cola, { durable: true }); // durable: la cola sobrevive a un reinicio del broker
  await canal.bindQueue(cola, exchange, patron);
}

export async function crearPublicador({ url = URL_AMQP, exchange = EXCHANGE } = {}) {
  const conexion = await amqplib.connect(url);
  // Canal con «publisher confirms»: el broker confirma cada mensaje que aceptó.
  const canal = await conexion.createConfirmChannel();
  await canal.assertExchange(exchange, 'topic', { durable: true });
  return {
    // La routing key es el tipo del evento («pedido.creado»): el exchange decide a qué colas llega.
    async publicar(evento) {
      canal.publish(exchange, evento.tipo, serializar(evento), {
        persistent: true, // el mensaje se escribe en disco
        messageId: evento.id,
        contentType: 'application/json',
      });
      await canal.waitForConfirms(); // resuelve cuando RabbitMQ lo aceptó; rechaza si lo descartó
    },
    async cerrar() { await canal.close(); await conexion.close(); },
  };
}

export async function consumir({ url = URL_AMQP, exchange = EXCHANGE, cola, patron, alRecibir, prefetch = 10 }) {
  const conexion = await amqplib.connect(url);
  const canal = await conexion.createChannel();
  await declararCola(canal, cola, patron, exchange);
  await canal.prefetch(prefetch); // como máximo N mensajes sin confirmar a la vez por consumidor
  await canal.consume(cola, async (mensaje) => {
    if (mensaje === null) return; // el broker canceló al consumidor
    try {
      await alRecibir(deserializar(mensaje.content), { reentregado: mensaje.fields.redelivered, routingKey: mensaje.fields.routingKey });
      canal.ack(mensaje); // «listo»: RabbitMQ lo borra de la cola
    } catch (error) {
      // requeue solo la primera vez; si ya era una reentrega se descarta (o va a la DLQ: Módulo 22).
      canal.nack(mensaje, false, !mensaje.fields.redelivered);
    }
  }, { noAck: false }); // ack MANUAL: sin esto el mensaje se da por entregado al enviarlo
  return { async cerrar() { await canal.close(); await conexion.close(); } };
}
