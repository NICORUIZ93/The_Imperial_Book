// Módulo 22 · F135 · Publisher confirms: el broker CONFIRMA (ack) cada mensaje cuando ya es suyo.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1.
// Sin confirms, publish() solo escribe en el socket: si el broker cae o rechaza, tu código nunca se entera.
import { EXCHANGE } from './topologia.js';

export class MensajeNoConfirmado extends Error {}

export function crearPublicador(canal /* ConfirmChannel: conexion.createConfirmChannel() */) {
  const devueltos = new Map(); // messageId → motivo, de los mensajes que el broker no pudo enrutar
  // mandatory: true pide al broker que DEVUELVA (basic.return) lo que no llega a ninguna cola.
  // RabbitMQ envía el basic.return ANTES que el ack del mismo mensaje: al llegar el ack ya sabemos si volvió.
  canal.on('return', (msg) => devueltos.set(msg.properties.messageId, `${msg.fields.replyCode} ${msg.fields.replyText}`));

  return function publicar(rutaClave, cuerpo, { messageId }) {
    return new Promise((resolver, rechazar) => {
      canal.publish(EXCHANGE, rutaClave, Buffer.from(JSON.stringify(cuerpo)), {
        messageId,                 // identificador estable: el consumidor lo usa para deduplicar (F136)
        persistent: true,          // deliveryMode 2: el broker lo escribe a disco antes de confirmar (en cola durable)
        mandatory: true,
        contentType: 'application/json',
      }, (error) => {
        // Este callback es el CONFIRM: error === null → basic.ack; error → basic.nack (el broker no lo aceptó).
        if (error) return rechazar(new MensajeNoConfirmado(`nack del broker para ${messageId}`));
        const motivo = devueltos.get(messageId);
        devueltos.delete(messageId);
        if (motivo) return rechazar(new MensajeNoConfirmado(`${messageId} no llegó a ninguna cola (${motivo})`));
        resolver(messageId);
      });
    });
  };
}
