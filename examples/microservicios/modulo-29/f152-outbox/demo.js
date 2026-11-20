// Módulo 25 · F152 · Ejecuta (PostgreSQL arriba): node f152-outbox/demo.js
import { crearPool } from '../comun/pg.js';
import { crearPedido, prepararEsquema, publicarPendientes } from './outbox.js';

const pool = crearPool();
await prepararEsquema(pool);

await crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 120000 });
await crearPedido(pool, { id: 'P-2', cliente: 'luis', total: 45000 });
// P-3 viola el CHECK (total > 0): falla el INSERT del pedido y el evento tampoco queda.
await crearPedido(pool, { id: 'P-3', cliente: 'eva', total: 0 }).catch((e) => console.log(`P-3 rechazado: ${e.message}`));

const { rows: [c] } = await pool.query('SELECT (SELECT count(*) FROM f152_pedidos) AS pedidos, (SELECT count(*) FROM f152_outbox) AS eventos');
console.log(`pedidos: ${c.pedidos} · eventos en outbox: ${c.eventos}`);

// Un «broker» de mentira que imprime; en producción sería producer.send() de kafkajs.
const publicados = await publicarPendientes(pool, async (m) => console.log(`→ ${m.topic} key=${m.key} ${m.type} ${JSON.stringify(m.payload)}`));
console.log(`relay: ${publicados} publicados · segunda vuelta: ${await publicarPendientes(pool, async () => {})} pendientes`);
await pool.end();
