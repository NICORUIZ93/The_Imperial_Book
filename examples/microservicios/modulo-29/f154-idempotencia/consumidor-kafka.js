// Módulo 25 · F154 · Consumidor Kafka idempotente (kafkajs 2.2.4 + Kafka 4.4.0 + PostgreSQL).
// Ejecuta (con docker compose arriba): node f154-idempotencia/consumidor-kafka.js
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_BROKERS } from '../comun/config.js';
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, procesarUnaVez, sumarPuntos } from './idempotencia.js';

const pool = crearPool();
await prepararEsquema(pool);
const kafka = new Kafka({ clientId: 'f154', brokers: KAFKA_BROKERS, logLevel: logLevel.WARN });
const topic = 'f154.compras';
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [{ topic, numPartitions: 1 }] });
await admin.disconnect();

// El productor manda la misma compra DOS veces (simula un reintento tras un timeout): dos offsets, un solo evento.
const productor = kafka.producer();
await productor.connect();
const compra = { id: 'C-1', cliente: 'ana', puntos: 10 };
for (let i = 0; i < 2; i++) await productor.send({ topic, messages: [{ key: compra.cliente, value: JSON.stringify(compra) }] });
await productor.disconnect();

const consumidor = kafka.consumer({ groupId: 'f154-fidelidad' });
await consumidor.connect();
await consumidor.subscribe({ topic, fromBeginning: true });
let vistos = 0;
await new Promise((terminar) => consumidor.run({
  // autoCommit (por defecto): el offset se confirma DESPUÉS de que eachMessage termina → al menos una vez.
  eachMessage: async ({ message, partition }) => {
    const evento = JSON.parse(message.value.toString());
    const r = await procesarUnaVez(pool, 'fidelidad', evento, sumarPuntos);
    console.log(`partición ${partition} offset ${message.offset} evento ${evento.id} → ${r}`);
    if (++vistos === 2) terminar();
  },
}));
await consumidor.disconnect();
const { rows: [ana] } = await pool.query("SELECT puntos FROM f154_puntos WHERE cliente = 'ana'");
console.log(`puntos de ana = ${ana.puntos}`);
await pool.end();
