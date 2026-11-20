// Módulo 18 · F116 · Ejecuta (con docker compose arriba): node f116-kafka-rabbit/kafka-productor.js
import { crearEvento } from './evento.js';
import { asegurarTopic, crearKafka, crearProductor, TOPIC } from './kafka.js';

const kafka = crearKafka();
await asegurarTopic(kafka);
const productor = await crearProductor(kafka);
for (const [tipo, pedidoId] of [['pedido.creado', 'P-1'], ['pedido.creado', 'P-3'], ['pedido.pagado', 'P-1'], ['pedido.enviado', 'P-1']]) {
  const { particion, offset } = await productor.publicar(crearEvento(tipo, { pedidoId }));
  console.log(`${TOPIC} ← ${tipo.padEnd(14)} clave=${pedidoId} partición=${particion} offset=${offset}`);
}
await productor.cerrar();
