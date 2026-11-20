// Módulo 22 · F135 · Verificación contra un RabbitMQ real (AMQP_URL). Si no responde, se OMITE (o FALLA con EXIGIR_INFRA=1).
// Ejecuta: node --test f135-rabbitmq-confirms/confirms.test.js
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { omitirSinInfra } from '../comun/infra.js';
import { declarar, vaciar, COLA, DLQ } from './topologia.js';
import { crearPublicador } from './publicador.js';
import { consumir, ErrorPermanente } from './consumidor.js';

const skip = await omitirSinInfra('RabbitMQ', AMQP_URL, 5672);
let conexion, canal, publicar;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function hasta(condicion, ms = 3000) {
  const limite = Date.now() + ms;
  while (!(await condicion())) { if (Date.now() > limite) throw new Error('tiempo agotado'); await esperar(20); }
}
before(async () => {
  if (skip) return;
  conexion = await amqplib.connect(AMQP_URL);
  canal = await conexion.createConfirmChannel();
  await declarar(canal);
  publicar = crearPublicador(canal);
});
beforeEach(async () => { if (!skip) await vaciar(canal); });
after(async () => { await conexion?.close(); });

test('publish con confirm: la promesa se resuelve cuando el broker tiene el mensaje en la cola', { skip }, async () => {
  assert.equal(await publicar('pedido.creado', { id: 'P-1' }, { messageId: 'P-1' }), 'P-1');
  assert.equal((await canal.checkQueue(COLA)).messageCount, 1);
});

test('mandatory + confirm: un mensaje que no llega a ninguna cola se RECHAZA (312 NO_ROUTE), no se pierde en silencio', { skip }, async () => {
  await assert.rejects(publicar('ruta.sin.cola', { id: 'X' }, { messageId: 'X' }), /X no llegó a ninguna cola \(312 NO_ROUTE\)/);
});

test('ack borra el mensaje; nack(requeue=false) lo manda a la DLQ con la cabecera x-death', { skip }, async () => {
  const c = await conexion.createChannel();
  await consumir(c, COLA, async (p) => { if (p.total < 0) throw new ErrorPermanente('inválido'); }, { registro: () => {} });
  await publicar('pedido.creado', { id: 'ok', total: 1 }, { messageId: 'ok' });
  await publicar('pedido.creado', { id: 'mal', total: -1 }, { messageId: 'mal' });
  await hasta(async () => (await canal.checkQueue(DLQ)).messageCount === 1);
  await c.close();
  assert.equal((await canal.checkQueue(COLA)).messageCount, 0);
  const muerto = await canal.get(DLQ, { noAck: true });
  assert.equal(muerto.properties.messageId, 'mal');
  assert.equal(muerto.properties.headers['x-death'][0].reason, 'rejected');
});

test('fallo pasajero: nack(requeue=true) y el broker lo reentrega con redelivered=true', { skip }, async () => {
  const c = await conexion.createChannel();
  const entregas = [];
  await consumir(c, COLA, async (_p, msg) => {
    entregas.push(msg.fields.redelivered);
    if (entregas.length === 1) throw new Error('pasajero');
  }, { registro: () => {} });
  await publicar('pedido.creado', { id: 'P-9', total: 1 }, { messageId: 'P-9' });
  await hasta(() => entregas.length === 2);
  await c.close();
  assert.deepEqual(entregas, [false, true]);
});

test('si el consumidor muere sin ack, el broker reentrega el mensaje a otro consumidor', { skip }, async () => {
  await publicar('pedido.creado', { id: 'P-7', total: 1 }, { messageId: 'P-7' });
  const c1 = await conexion.createChannel();
  let recibido = false;
  await c1.consume(COLA, () => { recibido = true; }, { noAck: false }); // recibe y «se cuelga»: nunca hace ack
  await hasta(() => recibido);
  await c1.close();                                                      // muere: el mensaje vuelve a la cola
  const c2 = await conexion.createChannel();
  let msg;
  await hasta(async () => (msg = await c2.get(COLA, { noAck: false })) !== false);
  assert.equal(msg.properties.messageId, 'P-7');
  assert.equal(msg.fields.redelivered, true);
  c2.ack(msg);
  await c2.close();
});
