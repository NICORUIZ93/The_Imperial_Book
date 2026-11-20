// Módulo 26 · F158 · Error común: reencolar sin límite un mensaje venenoso en una cola CLÁSICA.
// nack(requeue=true) lo devuelve a la cabeza de la cola y vuelve a llegar al instante: un bucle que quema CPU y red.
// Ejecuta (RabbitMQ arriba): node f158-rabbitmq/error-comun.js
import amqplib from 'amqplib';
import { setTimeout as dormir } from 'node:timers/promises';
import { AMQP_URL } from '../comun/config.js';

const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createChannel();
const cola = 'f158.clasica.bucle';
await canal.deleteQueue(cola);
await canal.assertQueue(cola, { durable: true }); // clásica: sin x-delivery-limit
canal.sendToQueue(cola, Buffer.from('{"id":"P-VENENO","total":"no es un número"}'));
let entregas = 0;
await canal.consume(cola, (msg) => {
  entregas += 1;
  canal.nack(msg, false, true); // ✘ «quizá la próxima vez funcione»
});
await dormir(1000);
await canal.close();
console.log(`MAL  → 1 mensaje venenoso, ${entregas > 100 ? 'más de 100' : entregas} entregas en 1 s (y seguiría para siempre)`);
const limpio = await conexion.createChannel();
await limpio.deleteQueue(cola);
await conexion.close();
