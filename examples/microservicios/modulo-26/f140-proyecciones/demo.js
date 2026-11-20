// Módulo 22 · F140 · Demo: 3 pedidos con event sourcing (F139) → proyección SQL → consultas que el agregado no sabe hacer.
// Ejecuta: ALMACEN=memoria node f140-proyecciones/demo.js     (o sin ALMACEN, con el MongoDB del docker-compose.yml)
import { abrirAlmacen } from '../f139-event-sourcing/almacen.js';
import { ejecutar } from '../f139-event-sourcing/pedido.js';
import { ProyeccionResumenPedidos } from './proyeccion.js';

const { almacen, db, cerrar } = await abrirAlmacen({ basedatos: 'modulo26_f140' });
if (db) { await db.dropDatabase(); await almacen.preparar(); } // MongoDB: empezar de cero en cada demo

const comandos = [
  ['P-1', { tipo: 'Crear', cliente: 'ana' }], ['P-1', { tipo: 'AgregarLinea', sku: 'TEC-1', cantidad: 2, precio: 120000 }],
  ['P-2', { tipo: 'Crear', cliente: 'luis' }], ['P-2', { tipo: 'AgregarLinea', sku: 'MOU-1', cantidad: 1, precio: 45000 }],
  ['P-1', { tipo: 'Confirmar' }], ['P-3', { tipo: 'Crear', cliente: 'ana' }],
  ['P-3', { tipo: 'AgregarLinea', sku: 'USB-1', cantidad: 3, precio: 9000 }], ['P-2', { tipo: 'Cancelar', motivo: 'cliente' }],
];
for (const [id, c] of comandos) await ejecutar(almacen, id, c);

const vista = new ProyeccionResumenPedidos(almacen);
console.log(`commits aplicados: ${await vista.ponerseAlDia()} · checkpoint: ${vista.checkpoint()}`);
console.table(vista.consultar('SELECT * FROM resumen_pedidos ORDER BY id'));
console.log('ventas confirmadas por cliente:', JSON.stringify(vista.consultar(
  "SELECT cliente, COUNT(*) AS pedidos, SUM(total) AS total FROM resumen_pedidos WHERE estado = 'CONFIRMADO' GROUP BY cliente")));
await ejecutar(almacen, 'P-3', { tipo: 'Confirmar' });
console.log(`llega 1 evento nuevo → aplicados: ${await vista.ponerseAlDia()} · checkpoint: ${vista.checkpoint()}`);
console.log(`sin eventos nuevos  → aplicados: ${await vista.ponerseAlDia()}`);
console.log(`reconstruir desde 0 → aplicados: ${await vista.reconstruir()} · misma tabla: ${JSON.stringify(vista.consultar('SELECT id, estado, total FROM resumen_pedidos ORDER BY id'))}`);
await cerrar();
