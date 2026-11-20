// Módulo 21 · F131 · Servicio «facturacion»: consume de RabbitMQ y CONTINÚA la traza que vino en el mensaje.
// Ejecuta: OTEL_SERVICE_NAME=facturacion node --import ./f131-traceparent/trazas.js f131-traceparent/consumidor-rabbit.js 2
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { extraerAmqp, conSpanConsumidor } from './propagacion.js';
import { apagarTrazas } from './trazas.js';

const COLA = 'f131.pedidos';
const esperados = Number(process.argv[2] ?? 1);
let procesados = 0;
const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createChannel();
// RabbitMQ 4.x rechaza colas no exclusivas y no durables («transient_nonexcl_queues» está retirada): durable.
await canal.assertQueue(COLA, { durable: true });
console.log('facturacion esperando mensajes');

await canal.consume(COLA, async (mensaje) => {
  const padre = extraerAmqp(mensaje); // contexto remoto: trace-id y span-id del PRODUCER
  await conSpanConsumidor(COLA, padre, async (span) => {
    const { id } = JSON.parse(mensaje.content);
    console.log(`facturacion procesa ${id} en la traza ${span.spanContext().traceId}`);
  });
  canal.ack(mensaje);
  if (++procesados === esperados) { await canal.close(); await conexion.close(); await apagarTrazas(); }
});
