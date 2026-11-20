// Módulo 18 · F116 · Ejecuta (con docker compose arriba): node f116-kafka-rabbit/rabbit-publicador.js
import { crearEvento } from './evento.js';
import { crearPublicador, EXCHANGE } from './rabbit.js';

const publicador = await crearPublicador();
for (const [tipo, pedidoId] of [['pedido.creado', 'P-1'], ['pedido.pagado', 'P-1'], ['pedido.creado', 'P-2']]) {
  await publicador.publicar(crearEvento(tipo, { pedidoId }));
  console.log(`${EXCHANGE} ← ${tipo} (${pedidoId}) confirmado por el broker`);
}
await publicador.cerrar();
