// Módulo 26 · F159 · Tests contra NATS real con JetStream (NATS_URL). Ejecuta: node --test f159-nats/nats.test.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { colaDeCobros, conectar, procesarSiguiente, reservar, streamPedidos } from './jetstream.js';

const P = `T${process.pid}`; // prefijo propio: streams F159 de la demo y de los tests no se pisan
let c;
before(async () => { c = await conectar('f159-test'); });
after(async () => {
  for (const s of [`${P}_PEDIDOS`, `${P}_COBROS`]) await c.jsm.streams.delete(s).catch(() => {});
  await c.nc.drain();
});

test('mismo msgID dentro de la ventana: duplicate=true y un solo mensaje', async () => {
  await streamPedidos(c.jsm, P);
  const a = await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-1' });
  const b = await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-1' });
  assert.deepEqual([a.duplicate, b.duplicate, b.seq], [false, true, a.seq]);
});

test('pasada la ventana de deduplicación (2 s), el mismo msgID se guarda otra vez', async () => {
  await streamPedidos(c.jsm, P);
  await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-2' });
  await dormir(2200);
  const b = await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-2' });
  assert.equal(b.duplicate, false);
});

test('cola de trabajo: nak reintenta y el ack borra el mensaje del stream', async () => {
  await colaDeCobros(c.jsm, P);
  await c.js.publish(`${P.toLowerCase()}.cobros`, JSON.stringify({ id: 'C-1' }));
  const r1 = await procesarSiguiente(c.js, P, async (_d, entrega) => { if (entrega < 2) throw new Error('caída'); });
  const r2 = await procesarSiguiente(c.js, P, async () => {});
  assert.deepEqual([r1, r2], ['nak (entrega 1): caída', 'ack (entrega 2)']);
  assert.equal((await c.jsm.streams.info(`${P}_COBROS`)).state.messages, 0);
});

test('max_deliver: tras 3 entregas sin ack no vuelve a entregarse', async () => {
  await colaDeCobros(c.jsm, P);
  await c.js.publish(`${P.toLowerCase()}.cobros`, JSON.stringify({ id: 'C-2' }));
  const r = [];
  for (let i = 0; i < 4; i++) r.push(await procesarSiguiente(c.js, P, async () => { throw new Error('caída'); }));
  assert.deepEqual(r.map((x) => x?.slice(0, 13) ?? null), ['nak (entrega ', 'nak (entrega ', 'nak (entrega ', null]);
});

test('KV: dos reservas concurrentes no venden de más (compare-and-set con revisión)', async () => {
  const kv = await c.kvm.create(`${P}_stock`);
  await kv.put('TEC-1', '3');
  const r = await Promise.allSettled([1, 2].map(() => reservar(kv, 'TEC-1', 2, { antesDeEscribir: () => dormir(30) })));
  assert.deepEqual(r.map((x) => x.status).sort(), ['fulfilled', 'rejected']);
  assert.equal((await kv.get('TEC-1')).string(), '1');
  await kv.destroy();
});
