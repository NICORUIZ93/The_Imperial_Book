// Módulo 22 · F135 · Consumer acknowledgments: el consumidor dice al broker qué hizo con cada mensaje.
//   ack                  → «procesado, bórralo»
//   nack(requeue=true)   → «no pude ahora, devuélvelo a la cola» (un fallo pasajero)
//   nack(requeue=false)  → «no lo voy a poder procesar nunca» → va a la dead letter queue (DLQ)
// Si el consumidor muere SIN responder, el broker lo reentrega a otro consumidor con redelivered=true.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1.
export class ErrorPermanente extends Error {} // datos inválidos: reintentar no lo arregla

export async function consumir(canal, cola, procesar, { prefetch = 10, registro = console.log } = {}) {
  // prefetch: cuántos mensajes SIN ack puede tener este consumidor a la vez. Sin él, el broker le envía TODOS.
  await canal.prefetch(prefetch);
  const { consumerTag } = await canal.consume(cola, async (msg) => {
    const id = msg.properties.messageId;
    try {
      await procesar(JSON.parse(msg.content), msg);
      canal.ack(msg);                                   // SOLO después de terminar el trabajo
      registro(`ack   ${id}`);
    } catch (error) {
      const permanente = error instanceof ErrorPermanente || msg.fields.redelivered; // un solo reintento
      canal.nack(msg, false, !permanente);              // (mensaje, allUpTo=false, requeue)
      registro(`nack  ${id} requeue=${!permanente} (${error.message})`);
    }
  }, { noAck: false });                                  // noAck: false = acks manuales (el valor por defecto)
  return consumerTag;
}
