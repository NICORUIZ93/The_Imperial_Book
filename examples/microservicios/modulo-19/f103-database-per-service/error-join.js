// ERROR COMÚN F103: intentar un JOIN entre las bases de dos servicios. Ejecuta: node f103-database-per-service/error-join.js
import pg from 'pg';
import { pgUrl } from '../config.js';

const cliente = new pg.Client({ connectionString: pgUrl('pedidos_db', 'pedidos_app', 'pedidos') });
await cliente.connect();
try {
  await cliente.query('SELECT p.id, s.disponible FROM pedidos p JOIN inventario_db.public.stock s ON s.sku = p.sku');
} catch (error) {
  console.log(`${error.severity} ${error.code}: ${error.message}`);
}
await cliente.end();
