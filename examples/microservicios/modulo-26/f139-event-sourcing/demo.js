// Módulo 22 · F139 · Demo: un pedido como secuencia de eventos; su estado se reconstruye leyendo el stream.
// Ejecuta: node f139-event-sourcing/demo.js                    (MongoDB del docker-compose.yml)
//          ALMACEN=memoria node f139-event-sourcing/demo.js    (sin Docker: mismo resultado)
import { abrirAlmacen } from './almacen.js';
import { ejecutar, reconstruir } from './pedido.js';

const { almacen, db, cerrar } = await abrirAlmacen();
await db?.collection('f139_commits').deleteMany({ stream: 'pedido-P-1' });
console.log(`almacén: ${almacen.constructor.name}`);

await ejecutar(almacen, 'P-1', { tipo: 'Crear', cliente: 'ana' });
await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'TEC-1', cantidad: 2, precio: 120000 });
await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'MOU-1', cantidad: 1, precio: 45000 });
const version = await ejecutar(almacen, 'P-1', { tipo: 'Confirmar' });

const { eventos } = await almacen.leerStream('pedido-P-1');
eventos.forEach((e, i) => console.log(`  v${i + 1} ${e.tipo.padEnd(16)} ${JSON.stringify(e.datos)}`));
const estado = reconstruir(eventos);
console.log(`versión ${version} → estado ${estado.estado}, ${estado.lineas.length} líneas, total ${estado.total}`);
// «Viaje en el tiempo»: el estado tal como estaba tras el evento 2.
console.log(`estado en la v2: total ${reconstruir(eventos.slice(0, 2)).total}, ${reconstruir(eventos.slice(0, 2)).estado}`);
try {
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'USB-1', cantidad: 1, precio: 9000 });
} catch (error) { console.log(`AgregarLinea tras confirmar → ${error.name}: ${error.message}`); }
await cerrar();
