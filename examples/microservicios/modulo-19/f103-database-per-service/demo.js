// Ejecuta: node f103-database-per-service/demo.js   (desde examples/microservicios/modulo-19)
import pg from 'pg';
import { pgUrl } from '../config.js';
import { arrancar } from './arrancar.js';

const { pedidosUrl, inventarioUrl, apagar } = await arrancar();
const pedir = async (sku, cantidad) => {
  const r = await fetch(`${pedidosUrl}/pedidos`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sku, cantidad }) });
  return `${r.status} ${JSON.stringify(await r.json())}`;
};

console.log('Pedido de 2 teclados →', await pedir('TEC-001', 2));
console.log('Pedido de 2 teclados →', await pedir('TEC-001', 2));
console.log('Stock según inventario →', JSON.stringify(await (await fetch(`${inventarioUrl}/stock/TEC-001`)).json()));

// ¿Y si pedidos intenta «atajar» entrando a la base de inventario con SU usuario?
const intruso = new pg.Client({ connectionString: pgUrl('inventario_db', 'pedidos_app', 'pedidos') });
try {
  await intruso.connect();
  console.log('ALERTA: pedidos_app pudo entrar a inventario_db');
  await intruso.end();
} catch (error) {
  console.log('pedidos_app → inventario_db:', error.message);
}

await apagar();
