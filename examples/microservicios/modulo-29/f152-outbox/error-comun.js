// Módulo 25 · F152 · Error común: «dual write» (guardar en la BD y luego publicar en el broker, por separado).
// Ejecuta: node f152-outbox/error-comun.js
import { crearPool } from '../comun/pg.js';
import { prepararEsquema } from './outbox.js';

const pool = crearPool();
await prepararEsquema(pool);
const publicados = [];
const brokerCaido = async () => { throw new Error('KafkaJSConnectionError: Connection error: connect ECONNREFUSED 127.0.0.1:9092'); };

async function crearPedidoMal({ id, cliente, total }, publicar) {
  await pool.query('INSERT INTO f152_pedidos (id, cliente, total) VALUES ($1, $2, $3)', [id, cliente, total]); // 1) commit
  await publicar({ id, tipo: 'PedidoCreado' }); // 2) si esto falla, el pedido YA existe y nadie se entera
  publicados.push(id);
}

await crearPedidoMal({ id: 'P-1', cliente: 'ana', total: 120000 }, brokerCaido).catch((e) => console.log(`publicar falló: ${e.message}`));
const { rows: [c] } = await pool.query('SELECT count(*)::int AS n FROM f152_pedidos');
console.log(`MAL  → pedidos en la BD: ${c.n} · eventos publicados: ${publicados.length} (inventario y pagos nunca sabrán de P-1)`);
await pool.end();
