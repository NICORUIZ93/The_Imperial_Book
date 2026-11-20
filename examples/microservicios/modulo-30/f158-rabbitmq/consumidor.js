// Módulo 26 · F158 · Consumidor con tres caminos de fallo:
//   error pasajero  → se reenvía a la cola de espera que toca (1.º 200 ms, 2.º 600 ms) y se hace ack del original
//   sin reintentos  → reject(requeue=false) → DLQ (x-death reason: rejected)
//   error de datos  → reject(requeue=false) → DLQ de inmediato
// Y si el proceso MUERE con el mensaje en la mano, la cola quorum cuenta la entrega y, tras x-delivery-limit, lo aparta.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1.
import { ESPERAS, espera } from './topologia.js';

export class ErrorDeDatos extends Error {}

// Cabeceras propias del mensaje, sin las que pone el broker al hacer dead-letter (x-death, x-first-death-*, x-last-death-*):
// la copia es un mensaje NUEVO y el historial de muertes lo vuelve a escribir RabbitMQ.
const propias = (h = {}) => Object.fromEntries(Object.entries(h).filter(([k]) => !/^x-(death|first-death|last-death)/.test(k)));

export async function consumir(canal, cola, procesar, { registro = () => {} } = {}) {
  await canal.prefetch(5);
  return canal.consume(cola, async (msg) => {
    if (msg === null) return; // el broker canceló el consumidor (p. ej. borraron la cola)
    const reintento = Number(msg.properties.headers?.['x-reintento'] ?? 0);
    try {
      await procesar(JSON.parse(msg.content), reintento);
      canal.ack(msg);
      registro(`ack     intento ${reintento + 1}`);
    } catch (error) {
      if (!(error instanceof ErrorDeDatos) && reintento < ESPERAS.length) {
        // Publica una copia en la cola de espera (por el exchange por defecto) y confirma el original.
        canal.sendToQueue(espera(ESPERAS[reintento]), msg.content, {
          persistent: true,
          messageId: msg.properties.messageId,
          headers: { ...propias(msg.properties.headers), 'x-reintento': reintento + 1 },
        });
        canal.ack(msg);
        registro(`espera  ${ESPERAS[reintento]} ms (${error.message})`);
      } else {
        canal.reject(msg, false); // → DLX → DLQ
        registro(`dlq     ${error.message}`);
      }
    }
  }, { noAck: false });
}
