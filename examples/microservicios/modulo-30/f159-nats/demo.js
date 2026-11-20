// Módulo 26 · F159 · Ejecuta (NATS con JetStream arriba): node f159-nats/demo.js
import { setTimeout as dormir } from 'node:timers/promises';
import { colaDeCobros, conectar, procesarSiguiente, reservar, streamPedidos } from './jetstream.js';

const { nc, js, jsm, kvm } = await conectar('f159-demo');

// 1) Deduplicación: el productor reintenta P-1 (timeout de red) con el mismo msgID.
await streamPedidos(jsm);
for (const intento of [1, 2]) {
  const ack = await js.publish('f159.pedidos.creado', JSON.stringify({ id: 'P-1' }), { msgID: 'P-1' });
  console.log(`publish P-1 (intento ${intento}) → seq ${ack.seq} duplicate=${ack.duplicate}`);
}
console.log(`mensajes en F159_PEDIDOS: ${(await jsm.streams.info('F159_PEDIDOS')).state.messages}`);

// 2) Cola de trabajo con reintentos limitados: C-1 pasa al 2.º intento; C-2 falla siempre.
await colaDeCobros(jsm);
const avisos = nc.subscribe('$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.F159_COBROS.cobradores');
(async () => { for await (const a of avisos) console.log(`aviso MAX_DELIVERIES: stream_seq=${a.json().stream_seq} deliveries=${a.json().deliveries}`); })();
for (const id of ['C-1', 'C-2']) await js.publish('f159.cobros', JSON.stringify({ id }));
const procesar = async ({ id }, entrega) => { if (id === 'C-2' || entrega < 2) throw new Error(`${id}: pasarela caída`); };
for (let i = 0; i < 6; i++) {
  const r = await procesarSiguiente(js, 'F159', procesar);
  if (r) console.log(`cobradores: ${r}`);
}
await dormir(300);
console.log(`mensajes en F159_COBROS: ${(await jsm.streams.info('F159_COBROS')).state.messages} (C-1 se borró al confirmarlo; C-2 queda sin entregar)`);

// 3) KV: dos reservas a la vez sobre el mismo stock.
await kvm.create('f159_stock').then((kv) => kv.destroy()).catch(() => {});
const kv = await kvm.create('f159_stock');
await kv.put('TEC-1', '5');
const [a, b] = await Promise.all([
  reservar(kv, 'TEC-1', 2, { antesDeEscribir: () => dormir(50) }),
  reservar(kv, 'TEC-1', 2, { antesDeEscribir: () => dormir(50) }),
]);
console.log(`reservas: intentos ${a} y ${b} · stock final = ${(await kv.get('TEC-1')).string()}`);
await kv.destroy();
await nc.drain();
