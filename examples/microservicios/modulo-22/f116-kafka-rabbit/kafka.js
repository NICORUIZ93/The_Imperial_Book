// Módulo 18 · F116 · KafkaJS: productor y consumidor de eventos de pedidos.
// Requisitos: Node.js 26.13.1 LTS, kafkajs 2.2.4 y Kafka 4.4.0 (docker-compose.yml del laboratorio).
import { Kafka, logLevel } from 'kafkajs';
import { deserializar, serializar } from './evento.js';

export const TOPIC = 'pedidos.eventos';

export function crearKafka({ brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','), clientId = 'pedidos' } = {}) {
  return new Kafka({ clientId, brokers, logLevel: logLevel.ERROR, retry: { retries: 3 } });
}

// Crea el topic con 3 particiones si no existe (en producción lo crea la plataforma, no el servicio).
export async function asegurarTopic(kafka, topic = TOPIC, particiones = 3) {
  const admin = kafka.admin();
  await admin.connect();
  try {
    return await admin.createTopics({ topics: [{ topic, numPartitions: particiones, replicationFactor: 1 }], waitForLeaders: true });
  } finally {
    await admin.disconnect();
  }
}

export async function crearProductor(kafka) {
  // idempotent: el broker descarta los duplicados que provocan los reintentos del productor.
  // KafkaJS exige con idempotent que maxInFlightRequests sea 1 (y acks = -1, todas las réplicas).
  const productor = kafka.producer({ idempotent: true, maxInFlightRequests: 1 });
  await productor.connect();
  return {
    // La CLAVE decide la partición: todos los eventos del mismo pedido van a la misma y conservan su orden.
    async publicar(evento, topic = TOPIC) {
      const [resultado] = await productor.send({
        topic,
        acks: -1,
        messages: [{ key: evento.datos.pedidoId, value: serializar(evento), headers: { tipo: evento.tipo } }],
      });
      return { particion: resultado.partition, offset: resultado.baseOffset };
    },
    cerrar: () => productor.disconnect(),
  };
}

// Consume desde el principio con un grupo: las instancias del mismo grupo se reparten las particiones.
export async function consumir(kafka, { grupo, topic = TOPIC, alRecibir }) {
  const consumidor = kafka.consumer({ groupId: grupo });
  await consumidor.connect();
  await consumidor.subscribe({ topics: [topic], fromBeginning: true });
  await consumidor.run({
    // KafkaJS confirma (commit) el offset DESPUÉS de que esta función termina sin error: «al menos una vez».
    // Si lanza, no hay commit y el mensaje se vuelve a entregar.
    eachMessage: async ({ partition, message }) => {
      await alRecibir(deserializar(message.value), { particion: partition, offset: message.offset, clave: message.key?.toString() });
    },
  });
  return { cerrar: () => consumidor.disconnect() };
}
