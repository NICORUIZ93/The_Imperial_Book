// Módulo 22 · F135 · Demo: publica con confirms y consume con acks manuales (un éxito, un fallo pasajero,
// un mensaje inválido que acaba en la DLQ y uno que el broker no puede enrutar).
// Ejecuta (con RabbitMQ arriba):  node f135-rabbitmq-confirms/demo.js
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { declarar, vaciar, COLA, DLQ } from './topologia.js';
import { crearPublicador } from './publicador.js';
import { consumir, ErrorPermanente } from './consumidor.js';

const conexion = await amqplib.connect(AMQP_URL);
const canalPub = await conexion.createConfirmChannel();  // canal en modo confirm
const canalCon = await conexion.createChannel();
await declarar(canalPub); await vaciar(canalPub);
const publicar = crearPublicador(canalPub);

let fallosPasajeros = 0;
await consumir(canalCon, COLA, async (pedido) => {
  if (pedido.total <= 0) throw new ErrorPermanente('total inválido');
  if (pedido.id === 'P-2' && fallosPasajeros++ === 0) throw new Error('la base de datos no respondió');
}, { prefetch: 5, registro: (l) => console.log(`consumidor: ${l}`) });

for (const [id, total, ruta] of [['P-1', 100, 'pedido.creado'], ['P-2', 200, 'pedido.creado'], ['P-3', -5, 'pedido.creado'], ['P-4', 50, 'pedido.borrado']]) {
  try {
    await publicar(ruta, { id, total }, { messageId: id });
    console.log(`publicador: ${id} confirmado por el broker`);
  } catch (error) {
    console.log(`publicador: ${error.message}`);
  }
}
await new Promise((r) => setTimeout(r, 300));
const [cola, dlq] = [await canalPub.checkQueue(COLA), await canalPub.checkQueue(DLQ)];
console.log(`colas: ${COLA}=${cola.messageCount} · ${DLQ}=${dlq.messageCount}`);
await conexion.close();
