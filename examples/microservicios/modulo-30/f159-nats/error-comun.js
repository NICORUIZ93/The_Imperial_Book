// Módulo 26 · F159 · Error común: reintentar un publish de JetStream SIN msgID. Si el primer intento sí llegó
// (y lo que se perdió fue el ack), el stream guarda el pedido dos veces. Ejecuta: node f159-nats/error-comun.js
import { conectar, streamPedidos } from './jetstream.js';

const { nc, js, jsm } = await conectar('f159-error');
await streamPedidos(jsm, 'F159E');
for (const intento of [1, 2]) await js.publish('f159e.pedidos.creado', JSON.stringify({ id: 'P-1', intento }));
console.log(`MAL  → sin msgID:  ${(await jsm.streams.info('F159E_PEDIDOS')).state.messages} mensajes para un solo pedido`);
await streamPedidos(jsm, 'F159E');
for (const intento of [1, 2]) await js.publish('f159e.pedidos.creado', JSON.stringify({ id: 'P-1', intento }), { msgID: 'P-1' });
console.log(`BIEN → msgID=P-1: ${(await jsm.streams.info('F159E_PEDIDOS')).state.messages} mensaje`);
await jsm.streams.delete('F159E_PEDIDOS');
await nc.drain();
