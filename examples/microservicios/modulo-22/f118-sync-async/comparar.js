// Módulo 18 · F118 · Ejecuta: node f118-sync-async/comparar.js
import { cola, notificar, pedidosAsincrono, pedidosSincrono, servicio } from './servicios.js';

const pagos = await servicio('pagos', 50);
const notificaciones = await servicio('notificaciones', 200);
// Calentamiento: la primera conexión HTTP tarda más y falsearía la comparación.
for (const s of [pagos, notificaciones]) { await fetch(s.url, { method: 'POST' }); s.atendidas = 0; }
const eventos = cola();
const sincrono = pedidosSincrono({ pagos, notificaciones });
const asincrono = pedidosAsincrono({ pagos, eventos });
const linea = (modo, r) => console.log(`${modo.padEnd(9)} ${r.pedidoId} → ${r.status} en ~${Math.round(r.ms / 50) * 50} ms${r.error ? ` (${r.error})` : ''}`);

console.log('1) Todo sano');
linea('síncrono', await sincrono('P-1'));
linea('asíncrono', await asincrono('P-2'));
console.log(`   cola: ${eventos.pendientes.length} pendiente(s) → el worker procesa ${await eventos.procesar(notificar(notificaciones))}`);

console.log('2) notificaciones caído');
notificaciones.caido = true;
linea('síncrono', await sincrono('P-3'));
linea('asíncrono', await asincrono('P-4'));
console.log(`   cola: ${eventos.pendientes.length} pendiente(s) → el worker procesa ${await eventos.procesar(notificar(notificaciones))} (sigue caído)`);

console.log('3) notificaciones vuelve');
notificaciones.caido = false;
console.log(`   cola: ${eventos.pendientes.length} pendiente(s) → el worker procesa ${await eventos.procesar(notificar(notificaciones))}`);
console.log(`   notificaciones enviadas en total: ${notificaciones.atendidas}`);

console.log('4) pagos caído (dependencia que SÍ se necesita para decidir)');
pagos.caido = true;
linea('síncrono', await sincrono('P-5'));
linea('asíncrono', await asincrono('P-6'));

pagos.cerrar();
notificaciones.cerrar();
