// Módulo 26 · F158 · Tests contra RabbitMQ real (AMQP_URL). Ejecuta: node --test f158-rabbitmq/rabbitmq.test.js
import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { consumir } from './consumidor.js';
import { COLA, DLQ, EXCHANGE, LIMITE_ENTREGAS, borrar, declarar } from './topologia.js';

let conexion;
let canal;
before(async () => { conexion = await amqplib.connect(AMQP_URL); });
after(() => conexion.close());
beforeEach(async () => {
  canal = await conexion.createConfirmChannel();
  await borrar(canal);
  await declarar(canal);
});
afterEach(() => canal.close().catch(() => {}));
const publicar = async (p) => {
  canal.publish(EXCHANGE, 'cobro', Buffer.from(JSON.stringify(p)), { persistent: true, messageId: p.id });
  await canal.waitForConfirms();
};

test('cola quorum: tras x-delivery-limit entregas fallidas el mensaje va a la DLQ con reason delivery_limit', async () => {
  await publicar({ id: 'P-1' });
  let entregas = 0;
  for (let i = 0; i < LIMITE_ENTREGAS + 3; i++) {
    const m = await canal.get(COLA);
    if (!m) break;
    entregas += 1;
    canal.reject(m, true); // como si el proceso muriera con el mensaje: cuenta como entrega fallida
    await dormir(50);
  }
  assert.equal(entregas, LIMITE_ENTREGAS + 1);
  await dormir(200);
  const muerto = await canal.get(DLQ);
  assert.equal(muerto.properties.headers['x-first-death-reason'], 'delivery_limit');
  canal.ack(muerto);
});

test('reintento escalonado: falla 2 veces, espera 200 y 600 ms, y al tercer intento pasa', async () => {
  const momentos = [];
  const inicio = Date.now();
  let fallos = 2;
  await consumir(canal, COLA, async () => { momentos.push(Date.now() - inicio); if (fallos-- > 0) throw new Error('caída'); });
  await publicar({ id: 'P-2' });
  await dormir(1500);
  assert.equal(momentos.length, 3);
  assert.ok(momentos[1] - momentos[0] >= 190, `1.er reintento a los ${momentos[1] - momentos[0]} ms`);
  assert.ok(momentos[2] - momentos[1] >= 590, `2.º reintento a los ${momentos[2] - momentos[1]} ms`);
  assert.equal((await canal.checkQueue(DLQ)).messageCount, 0);
});

test('sin más reintentos, a la DLQ: la última muerte es rejected en f158.cobros', async () => {
  await consumir(canal, COLA, async () => { throw new Error('siempre falla'); });
  await publicar({ id: 'P-3' });
  await dormir(1500);
  const lector = await conexion.createChannel();
  const muerto = await lector.get(DLQ);
  await lector.close();
  // x-death va de la muerte más reciente a la más antigua: antes «murió» dos veces por TTL en las colas de espera.
  const [ultima] = muerto.properties.headers['x-death'];
  assert.deepEqual([ultima.reason, ultima.queue], ['rejected', COLA]);
  assert.equal(muerto.properties.headers['x-first-death-reason'], 'expired');
  assert.equal(muerto.properties.headers['x-reintento'], 2);
});

test('single active consumer: de dos consumidores, solo uno recibe; si se va, el otro toma el relevo', async () => {
  const q = 'f158.sac';
  await canal.deleteQueue(q);
  await canal.assertQueue(q, { durable: true, arguments: { 'x-queue-type': 'quorum', 'x-single-active-consumer': true } });
  const recibidos = { A: [], B: [] };
  const { consumerTag: tagA } = await canal.consume(q, (m) => { if (!m) return; recibidos.A.push(m.content.toString()); canal.ack(m); });
  await canal.consume(q, (m) => { if (!m) return; recibidos.B.push(m.content.toString()); canal.ack(m); });
  for (const n of [1, 2, 3]) canal.sendToQueue(q, Buffer.from(String(n)));
  await dormir(300);
  await canal.cancel(tagA);
  for (const n of [4, 5]) canal.sendToQueue(q, Buffer.from(String(n)));
  await dormir(300);
  assert.deepEqual(recibidos, { A: ['1', '2', '3'], B: ['4', '5'] });
  await canal.deleteQueue(q);
});
