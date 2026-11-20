// Módulo 21 · F131 · Servicio «pedidos»: publica N eventos en RabbitMQ con traceparent en las cabeceras AMQP.
// Ejecuta: OTEL_SERVICE_NAME=pedidos node --import ./f131-traceparent/trazas.js f131-traceparent/productor-rabbit.js 2
import amqplib from 'amqplib';
import { trace } from '@opentelemetry/api';
import { AMQP_URL } from '../comun/config.js';
import { conSpanProductor } from './propagacion.js';
import { apagarTrazas } from './trazas.js';

const COLA = 'f131.pedidos';
const total = Number(process.argv[2] ?? 1);
const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createConfirmChannel();
await canal.assertQueue(COLA, { durable: false });

for (let i = 1; i <= total; i++) {
  // Span raíz «crear pedido»: simula la petición HTTP que origina el evento.
  await trace.getTracer('pedidos').startActiveSpan('crear pedido', async (raiz) => {
    await conSpanProductor(COLA, async (cabeceras) => {
      console.log(`pedidos publica P-${i} con traceparent=${cabeceras.traceparent}`);
      canal.sendToQueue(COLA, Buffer.from(JSON.stringify({ id: `P-${i}` })), { headers: cabeceras });
      await canal.waitForConfirms();
    });
    raiz.end();
  });
}
await canal.close(); await conexion.close(); await apagarTrazas();
