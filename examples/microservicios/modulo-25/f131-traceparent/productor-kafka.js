// Módulo 21 · F131 · Servicio «pedidos»: publica N eventos en Kafka con traceparent en las cabeceras del registro.
// Ejecuta: OTEL_SERVICE_NAME=pedidos node --import ./f131-traceparent/trazas.js f131-traceparent/productor-kafka.js 2
// Requisitos: kafkajs 2.2.4 y Kafka 4.4.0 (docker-compose.yml del laboratorio, puerto 9092).
import { Kafka, logLevel } from 'kafkajs';
import { trace } from '@opentelemetry/api';
import { KAFKA_BROKERS } from '../comun/config.js';
import { conSpanProductor } from './propagacion.js';
import { apagarTrazas } from './trazas.js';

const TOPIC = 'f131.pedidos';
const total = Number(process.argv[2] ?? 1);
const kafka = new Kafka({ clientId: 'pedidos', brokers: KAFKA_BROKERS, logLevel: logLevel.ERROR });
const productor = kafka.producer();
await productor.connect();

for (let i = 1; i <= total; i++) {
  await trace.getTracer('pedidos').startActiveSpan('crear pedido', async (raiz) => {
    await conSpanProductor(TOPIC, async (cabeceras) => {
      console.log(`pedidos publica P-${i} con traceparent=${cabeceras.traceparent}`);
      // kafkajs acepta strings en headers; al consumir llegarán como Buffer.
      await productor.send({ topic: TOPIC, messages: [{ key: `P-${i}`, value: JSON.stringify({ id: `P-${i}` }), headers: cabeceras }] });
    });
    raiz.end();
  });
}
await productor.disconnect(); await apagarTrazas();
