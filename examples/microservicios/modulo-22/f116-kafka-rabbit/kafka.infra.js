// Módulo 18 · F116 · Test contra Kafka real. Ejecuta: docker compose up -d --wait && node --test f116-kafka-rabbit/kafka.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { crearEvento } from './evento.js';
import { asegurarTopic, consumir, crearKafka, crearProductor } from './kafka.js';

const topic = `test.pedidos.${process.pid}`;
const kafka = crearKafka({ clientId: 'test' });
let productor;
before(async () => {
  await asegurarTopic(kafka, topic, 3);
  productor = await crearProductor(kafka);
});
after(async () => {
  await productor.cerrar();
  const admin = kafka.admin();
  await admin.connect();
  await admin.deleteTopics({ topics: [topic] });
  await admin.disconnect();
});

async function esperar(condicion, ms = 30000) {
  const fin = Date.now() + ms;
  while (!condicion()) {
    if (Date.now() > fin) throw new Error('tiempo de espera agotado');
    await dormir(50);
  }
}

test('la misma clave va siempre a la misma partición y conserva el orden', async () => {
  const particiones = new Set();
  for (const tipo of ['pedido.creado', 'pedido.pagado', 'pedido.enviado']) {
    particiones.add((await productor.publicar(crearEvento(tipo, { pedidoId: 'P-1' }), topic)).particion);
  }
  assert.equal(particiones.size, 1);

  const recibidos = [];
  const consumidor = await consumir(kafka, { grupo: `g1-${process.pid}`, topic, alRecibir: async (e) => { recibidos.push(e.tipo); } });
  await esperar(() => recibidos.length === 3);
  assert.deepEqual(recibidos, ['pedido.creado', 'pedido.pagado', 'pedido.enviado']);
  await consumidor.cerrar();
});

test('otro grupo de consumidores vuelve a leer TODO el topic (el log no se borra al consumir)', async () => {
  const recibidos = [];
  const consumidor = await consumir(kafka, { grupo: `g2-${process.pid}`, topic, alRecibir: async (e) => { recibidos.push(e.tipo); } });
  await esperar(() => recibidos.length === 3);
  assert.equal(recibidos.length, 3);
  await consumidor.cerrar();
});
