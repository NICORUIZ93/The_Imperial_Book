// Módulo 26 · F157 · Transacciones de Kafka: escribir en DOS topics de forma atómica y cercar a un productor zombi.
// Requisitos: Node.js 26.13.1 LTS, kafkajs 2.2.4, Kafka 4.4.0 (docker-compose.yml). Ejecuta: node f157-kafka-schema/transacciones.js
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_BROKERS } from '../comun/config.js';

const kafka = new Kafka({ clientId: 'f157', brokers: KAFKA_BROKERS, logLevel: logLevel.NOTHING });
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [{ topic: 'f157.pedidos' }, { topic: 'f157.auditoria' }] });
await admin.disconnect();

const nuevoProductor = async () => {
  const p = kafka.producer({ transactionalId: 'f157-pedidos', idempotent: true, maxInFlightRequests: 1 });
  await p.connect(); // initProducerId: el coordinador sube la epoch de este transactionalId
  return p;
};

// 1) Atomicidad entre topics: el pedido y su registro de auditoría se ven juntos o no se ven.
const a = await nuevoProductor();
const tx1 = await a.transaction();
await tx1.send({ topic: 'f157.pedidos', messages: [{ key: 'P-1', value: 'creado' }] });
await tx1.send({ topic: 'f157.auditoria', messages: [{ key: 'P-1', value: 'ana creó P-1' }] });
await tx1.commit();
console.log('tx1: P-1 en f157.pedidos y f157.auditoria (commit)');

const tx2 = await a.transaction();
await tx2.send({ topic: 'f157.pedidos', messages: [{ key: 'P-2', value: 'creado' }] });
await tx2.send({ topic: 'f157.auditoria', messages: [{ key: 'P-2', value: 'luis creó P-2' }] });
await tx2.abort();
console.log('tx2: P-2 abortada en los dos topics');

// 2) Fencing: arranca otra instancia con el MISMO transactionalId (p. ej. el reemplazo tras una pausa larga de «a»).
const tx3 = await a.transaction();
await tx3.send({ topic: 'f157.pedidos', messages: [{ key: 'P-3', value: 'creado por a' }] });
const b = await nuevoProductor(); // sube la epoch: «a» queda cercada y su transacción abierta se aborta
try {
  await tx3.commit();
  console.log('tx3: commit de «a» aceptado (no debía pasar)');
} catch (error) {
  console.log(`tx3: «a» cercada → ${error.name}`);
}
await a.disconnect().catch(() => {});

// 3) Lo que ve un lector read_committed (por defecto en KafkaJS).
const lector = kafka.consumer({ groupId: `f157-lector-${Date.now()}` });
await lector.connect();
await lector.subscribe({ topics: ['f157.pedidos', 'f157.auditoria'], fromBeginning: true });
const vistos = [];
await new Promise((fin) => {
  lector.run({ eachMessage: async ({ topic, message }) => { vistos.push(`${topic}:${message.key}`); } });
  setTimeout(fin, 5000);
});
await lector.disconnect();
await b.disconnect();
console.log(`read_committed → ${vistos.sort().join(', ')}`);
