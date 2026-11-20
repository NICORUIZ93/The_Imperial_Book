// Módulo 21 · F131 · Verificación con broker real: el CONSUMER de facturacion cuelga del PRODUCER de pedidos.
// Ejecuta: BROKER=rabbit node --test f131-traceparent/broker.infra.js    (RabbitMQ en AMQP_URL)
//          BROKER=kafka  node --test f131-traceparent/broker.infra.js    (Kafka en KAFKA_BROKERS)
// Si el broker no responde, el test se OMITE (o FALLA si EXIGIR_INFRA=1, como en ./verificar.sh --compose).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { arrancar, esperarTexto } from '../comun/procesos.js';
import { AMQP_URL, KAFKA_BROKERS } from '../comun/config.js';

const broker = process.env.BROKER ?? 'rabbit';
const [host, puerto] = broker === 'kafka' ? KAFKA_BROKERS[0].split(':') : [new URL(AMQP_URL).hostname, new URL(AMQP_URL).port || '5672'];
const responde = await new Promise((r) => net.connect(Number(puerto), host).on('connect', function () { this.destroy(); r(true); }).on('error', () => r(false)));
const omitir = !responde && process.env.EXIGIR_INFRA !== '1' ? `sin ${broker} en ${host}:${puerto}` : false;

const OTEL = ['--import', './f131-traceparent/trazas.js'];
const linea = (salida, tipo) => salida.match(new RegExp(`${tipo} .*traza=(\\w+) span=(\\w+) padre=(\\S+)`)).slice(1);

test(`${broker}: 3 mensajes y cada CONSUMER es hijo de su PRODUCER (misma traza)`, { skip: omitir, timeout: 60_000 }, async () => {
  const consumidor = arrancar([...OTEL, `f131-traceparent/consumidor-${broker}.js`, '3'], { OTEL_SERVICE_NAME: 'facturacion' });
  await esperarTexto(consumidor, 'esperando mensajes', 30_000);
  const productor = arrancar([...OTEL, `f131-traceparent/productor-${broker}.js`, '3'], { OTEL_SERVICE_NAME: 'pedidos' });
  await new Promise((r) => productor.once('exit', r));
  await new Promise((r) => (consumidor.exitCode !== null ? r() : consumidor.once('exit', r)));
  const productores = productor.salida.split('\n').filter((l) => l.includes('PRODUCER')).map((l) => linea(l, 'PRODUCER'));
  const consumos = consumidor.salida.split('\n').filter((l) => l.includes('CONSUMER')).map((l) => linea(l, 'CONSUMER'));
  assert.equal(productores.length, 3, productor.salida);
  assert.equal(consumos.length, 3, consumidor.salida);
  for (const [traza, , padre] of consumos) {
    const origen = productores.find(([t]) => t === traza);
    assert.ok(origen, `la traza ${traza} del consumidor no viene de ningún productor`);
    assert.equal(padre, origen[1], 'el padre del CONSUMER es el span PRODUCER');
  }
});
