// Módulo 25 · F152 · Test de punta a punta con Debezium 3.7 + Kafka 4.4.0 (solo con ./verificar.sh --compose).
// Registra el conector, crea un pedido y espera el evento en el topic outbox.event.pedido.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { Kafka, logLevel } from 'kafkajs';
import { CONNECT_URL, KAFKA_BROKERS } from '../comun/config.js';
import { crearPool } from '../comun/pg.js';
import { crearPedido, prepararEsquema } from './outbox.js';

test('Debezium lleva la fila de la outbox al topic outbox.event.pedido', { timeout: 240_000 }, async () => {
  const pool = crearPool();
  const kafka = new Kafka({ clientId: 'f152-test', brokers: KAFKA_BROKERS, logLevel: logLevel.NOTHING });
  const consumidor = kafka.consumer({ groupId: `f152-${Date.now()}` });
  try {
    await prepararEsquema(pool);
    // Kafka Connect tarda en abrir su API REST aunque el contenedor ya esté «up»: espera hasta 120 s.
    let listo = false;
    for (let i = 0; i < 120 && !listo; i++) {
      listo = await fetch(`${CONNECT_URL}/connectors`).then((x) => x.ok, () => false);
      if (!listo) await new Promise((r) => setTimeout(r, 1000));
    }
    assert.ok(listo, `Kafka Connect no respondió en ${CONNECT_URL}`);
    const conector = JSON.parse(await readFile(new URL('./debezium/conector-outbox.json', import.meta.url), 'utf8'));
    await fetch(`${CONNECT_URL}/connectors/${conector.name}`, { method: 'DELETE' });
    const r = await fetch(`${CONNECT_URL}/connectors`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(conector) });
    assert.equal(r.status, 201, await r.text());

    await consumidor.connect();
    await crearPedido(pool, { id: 'P-42', cliente: 'ana', total: 100 });
    // El topic lo crea Connect con el primer evento: espera a que exista antes de suscribirte.
    const admin = kafka.admin();
    await admin.connect();
    for (let i = 0; i < 90 && !(await admin.listTopics()).includes('outbox.event.pedido'); i++) await new Promise((r) => setTimeout(r, 1000));
    await admin.disconnect();
    await consumidor.subscribe({ topic: 'outbox.event.pedido', fromBeginning: true });
    const recibido = new Promise((resolve) => consumidor.run({ eachMessage: async ({ message }) => resolve(message) }));
    const mensaje = await recibido;
    assert.equal(mensaje.key.toString(), 'P-42');
    assert.equal(mensaje.headers.eventType.toString(), 'PedidoCreado');
    assert.equal(JSON.parse(mensaje.value.toString()).pedidoId, 'P-42');
  } finally {
    // Cerrar siempre: un consumidor o un pool abiertos dejan el proceso de test vivo para siempre.
    await consumidor.disconnect().catch(() => {});
    await pool.end().catch(() => {});
  }
});
