// Módulo 25 · F155 · Exactly-once DENTRO de Kafka: leer → transformar → escribir con transacciones (kafkajs 2.2.4, Kafka 4.4.0).
// La salida y el offset del consumidor se confirman juntos; quien lea con read_committed nunca ve la salida de una transacción abortada.
// Ejecuta (con docker compose arriba): node f155-exactly-once/eos-kafka.js
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_BROKERS } from '../comun/config.js';

const kafka = new Kafka({ clientId: 'f155', brokers: KAFKA_BROKERS, logLevel: logLevel.WARN });
const [entrada, salida, grupo] = ['f155.pagos-usd', 'f155.pagos-cop', 'f155-conversor'];
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [{ topic: entrada }, { topic: salida }] });
await admin.disconnect();

const semilla = kafka.producer();
await semilla.connect();
await semilla.send({ topic: entrada, messages: [1, 2, 3].map((n) => ({ key: `PAGO-${n}`, value: JSON.stringify({ usd: n * 10 }) })) });
await semilla.disconnect();

// transactionalId estable por instancia: si una instancia «zombi» reaparece, el coordinador la cerca (fencing).
const productor = kafka.producer({ transactionalId: 'f155-conversor-0', idempotent: true, maxInFlightRequests: 1 });
await productor.connect();
const consumidor = kafka.consumer({ groupId: grupo }); // readUncommitted: false (por defecto) → isolation.level=read_committed
await consumidor.connect();
await consumidor.subscribe({ topic: entrada, fromBeginning: true });

let fallado = false;
let confirmados = 0;
await new Promise((fin) => consumidor.run({
  autoCommit: false, // el offset lo confirma la transacción, no el consumidor
  eachMessage: async ({ topic, partition, message }) => {
    const tx = await productor.transaction();
    try {
      const { usd } = JSON.parse(message.value.toString());
      await tx.send({ topic: salida, messages: [{ key: message.key, value: JSON.stringify({ cop: usd * 4000 }) }] });
      await tx.sendOffsets({ consumerGroupId: grupo, topics: [{ topic, partitions: [{ partition, offset: (BigInt(message.offset) + 1n).toString() }] }] });
      if (message.key.toString() === 'PAGO-2' && !fallado) { fallado = true; throw new Error('fallo simulado'); }
      await tx.commit();
      console.log(`commit  ${message.key} offset ${message.offset}`);
    } catch (error) {
      await tx.abort(); // lo escrito en f155.pagos-cop queda marcado como abortado y el offset no avanza
      console.log(`abort   ${message.key}: ${error.message}`);
      throw error; // kafkajs vuelve a entregar PAGO-2
    }
    if (++confirmados === 3) fin();
  },
}));
await consumidor.disconnect();
await productor.disconnect();

// Lee la salida con los dos niveles de aislamiento: read_committed no ve el intento abortado de PAGO-2.
for (const readUncommitted of [false, true]) {
  const lector = kafka.consumer({ groupId: `f155-lector-${readUncommitted}-${Date.now()}`, readUncommitted });
  await lector.connect();
  await lector.subscribe({ topic: salida, fromBeginning: true });
  const claves = [];
  await new Promise((fin) => {
    lector.run({ eachMessage: async ({ message }) => { claves.push(message.key.toString()); } });
    setTimeout(fin, 5000);
  });
  await lector.disconnect();
  console.log(`${readUncommitted ? 'read_uncommitted' : 'read_committed  '} → ${claves.join(', ')}`);
}
