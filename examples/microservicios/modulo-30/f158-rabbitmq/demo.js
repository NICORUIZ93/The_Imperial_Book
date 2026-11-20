// Módulo 26 · F158 · Ejecuta (RabbitMQ arriba): node f158-rabbitmq/demo.js
import amqplib from 'amqplib';
import { setTimeout as dormir } from 'node:timers/promises';
import { AMQP_URL } from '../comun/config.js';
import { ErrorDeDatos, consumir } from './consumidor.js';
import { COLA, DLQ, EXCHANGE, borrar, declarar } from './topologia.js';

const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createConfirmChannel();
await borrar(canal);
await declarar(canal);

const inicio = Date.now();
const fallosPendientes = { 'P-1': 0, 'P-2': 2, 'P-3': 99 }; // P-2 falla 2 veces y luego pasa; P-3 nunca pasa
await consumir(canal, COLA, async ({ id, total }) => {
  if (total <= 0) throw new ErrorDeDatos(`${id}: total inválido`);
  if (fallosPendientes[id]-- > 0) throw new Error(`${id}: pasarela no responde`);
}, { registro: (t) => console.log(`${String(Date.now() - inicio).padStart(5)} ms  ${t}`) });

for (const p of [{ id: 'P-1', total: 100 }, { id: 'P-2', total: 200 }, { id: 'P-3', total: 300 }, { id: 'P-4', total: 0 }]) {
  canal.publish(EXCHANGE, 'cobro', Buffer.from(JSON.stringify(p)), { persistent: true, messageId: p.id });
}
await canal.waitForConfirms();
await dormir(1500);
const { messageCount } = await canal.checkQueue(DLQ);
console.log(`en la DLQ: ${messageCount} (P-3 agotó los reintentos y P-4 tenía datos inválidos)`);
await conexion.close();
