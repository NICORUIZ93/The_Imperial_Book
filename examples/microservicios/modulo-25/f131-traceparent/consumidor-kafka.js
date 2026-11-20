// Módulo 21 · F131 · Servicio «facturacion»: consume de Kafka y continúa la traza (cabeceras Buffer → string).
// Ejecuta: OTEL_SERVICE_NAME=facturacion node --import ./f131-traceparent/trazas.js f131-traceparent/consumidor-kafka.js 2
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_BROKERS } from '../comun/config.js';
import { extraerKafka, conSpanConsumidor } from './propagacion.js';
import { apagarTrazas } from './trazas.js';

const TOPIC = 'f131.pedidos';
const esperados = Number(process.argv[2] ?? 1);
let procesados = 0;
const kafka = new Kafka({ clientId: 'facturacion', brokers: KAFKA_BROKERS, logLevel: logLevel.ERROR });
// Crear el topic antes de suscribirse: si no existe, el broker responde UNKNOWN_TOPIC_OR_PARTITION
// («This server does not host this topic-partition») y el consumidor se cae al arrancar.
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [{ topic: TOPIC, numPartitions: 1 }], waitForLeaders: true });
await admin.disconnect();
const consumidor = kafka.consumer({ groupId: 'f131-facturacion' });
await consumidor.connect();
await consumidor.subscribe({ topic: TOPIC, fromBeginning: true });
console.log('facturacion esperando mensajes');

await consumidor.run({
  eachMessage: async ({ message }) => {
    const padre = extraerKafka(message); // getterKafka convierte los Buffer a string
    await conSpanConsumidor(TOPIC, padre, async (span) => {
      const { id } = JSON.parse(message.value);
      console.log(`facturacion procesa ${id} en la traza ${span.spanContext().traceId}`);
    });
    if (++procesados === esperados) setImmediate(async () => { await consumidor.disconnect(); await apagarTrazas(); });
  },
});
