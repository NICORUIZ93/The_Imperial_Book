// Módulo 18 · F116 · ERROR COMÚN: declarar un exchange (o una cola) que ya existe con OTROS atributos.
// Ejecuta (con RabbitMQ arriba): node f116-kafka-rabbit/error-comun.js
import amqplib from 'amqplib';
import { URL_AMQP } from './rabbit.js';

const conexion = await amqplib.connect(URL_AMQP);
const canal = await conexion.createChannel();
canal.on('error', (error) => console.log('evento «error» del canal →', error.message));
await canal.assertExchange('demo.error-comun', 'direct', { durable: true }); // el equipo A lo declaró «direct»
try {
  await canal.assertExchange('demo.error-comun', 'topic', { durable: true }); // el equipo B lo quiere «topic»
} catch (error) {
  console.log('assertExchange rechazó   →', error.message);
}
// El broker CERRÓ el canal: cualquier operación posterior sobre él también falla.
await canal.checkExchange('demo.error-comun').catch((error) => console.log('el canal quedó inservible →', error.message));

const limpio = await conexion.createChannel(); // hace falta un canal nuevo
await limpio.deleteExchange('demo.error-comun');
await conexion.close();
