// Módulo 22 · F135 · Error común: olvidar el ack con prefetch. El consumidor recibe `prefetch` mensajes y se queda
// QUIETO: el broker no le envía más hasta que confirme alguno. No hay error ni log: la cola simplemente crece.
// Ejecuta (con RabbitMQ arriba):  node f135-rabbitmq-confirms/error-comun.js
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { declarar, vaciar, EXCHANGE, COLA } from './topologia.js';

const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createConfirmChannel();
await declarar(canal); await vaciar(canal);
for (let i = 1; i <= 10; i++) canal.publish(EXCHANGE, 'pedido.creado', Buffer.from(`{"id":"P-${i}"}`), { persistent: true });
await canal.waitForConfirms();

const consumidor = await conexion.createChannel();
await consumidor.prefetch(5);
let recibidos = 0;
await consumidor.consume(COLA, (msg) => {
  recibidos++;
  // ... se procesa el pedido ...
  // MAL: falta consumidor.ack(msg)
}, { noAck: false });

await new Promise((r) => setTimeout(r, 1000));
const { messageCount } = await canal.checkQueue(COLA);
console.log(`publicados: 10 · recibidos por el consumidor: ${recibidos} · listos en la cola: ${messageCount}`);
console.log(`→ ${recibidos} mensajes «unacked» bloquean al consumidor; con prefetch=5 no recibirá nada más`);
await conexion.close(); // al cerrar, los 5 sin ack vuelven a la cola (no se pierden)
