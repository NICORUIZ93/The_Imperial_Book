// Módulo 18 · F116 · Test contra RabbitMQ real. Ejecuta: docker compose up -d --wait && node --test f116-kafka-rabbit/rabbit.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import amqplib from 'amqplib';
import { crearEvento } from './evento.js';
import { consumir, crearPublicador, URL_AMQP } from './rabbit.js';

// Exchange y cola propios del test: no se mezclan con los del laboratorio.
const exchange = `test.pedidos.${process.pid}`;
const cola = `test.facturacion.${process.pid}`;
let publicador;
before(async () => { publicador = await crearPublicador({ exchange }); });
after(async () => {
  await publicador.cerrar();
  const conexion = await amqplib.connect(URL_AMQP);
  const canal = await conexion.createChannel();
  await canal.deleteQueue(cola);
  await canal.deleteExchange(exchange);
  await conexion.close();
});

async function esperar(condicion, ms = 5000) {
  const fin = Date.now() + ms;
  while (!condicion()) {
    if (Date.now() > fin) throw new Error('tiempo de espera agotado');
    await dormir(20);
  }
}

test('el exchange topic enruta por tipo: la cola solo recibe pedido.creado', async () => {
  const recibidos = [];
  const consumidor = await consumir({ exchange, cola, patron: 'pedido.creado', alRecibir: async (e) => { recibidos.push(`${e.tipo}:${e.datos.pedidoId}`); } });
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-1' }));
  await publicador.publicar(crearEvento('pedido.pagado', { pedidoId: 'P-1' }));
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-2' }));
  await esperar(() => recibidos.length === 2);
  await dormir(200); // margen: si pedido.pagado fuera a llegar, llegaría aquí
  assert.deepEqual(recibidos, ['pedido.creado:P-1', 'pedido.creado:P-2']);
  await consumidor.cerrar();
});

test('si el manejador falla, el mensaje se reentrega (redelivered) y no se pierde', async () => {
  const intentos = [];
  const consumidor = await consumir({
    exchange, cola, patron: 'pedido.creado',
    alRecibir: async (e, { reentregado }) => {
      intentos.push(reentregado);
      if (!reentregado) throw new Error('fallo transitorio');
    },
  });
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-3' }));
  await esperar(() => intentos.length === 2);
  assert.deepEqual(intentos, [false, true]);
  await consumidor.cerrar();
});

test('la cola durable guarda los mensajes mientras el consumidor está apagado', async () => {
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-4' })); // nadie escucha ahora
  const recibidos = [];
  const consumidor = await consumir({ exchange, cola, patron: 'pedido.creado', alRecibir: async (e) => { recibidos.push(e.datos.pedidoId); } });
  await esperar(() => recibidos.length === 1);
  assert.deepEqual(recibidos, ['P-4']);
  await consumidor.cerrar();
});
