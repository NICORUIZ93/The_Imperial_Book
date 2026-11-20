// Módulo 26 · F160 · Ejecuta (sin infraestructura): node f160-ecst/demo.js
import { setTimeout as dormir } from 'node:timers/promises';
import { crearBus, crearCatalogo, facturacionECST, facturacionNotificacion } from './servicios.js';

const bus = crearBus();
const catalogo = await crearCatalogo(bus);
const notif = facturacionNotificacion(bus, catalogo.url);
const ecst = facturacionECST(bus);

for (const precio of [110, 120, 130]) catalogo.cambiarPrecio('TEC-1', precio);
await dormir(100);
console.log(`notificación: precio=${notif.precio('TEC-1')} · llamadas HTTP al catálogo: ${catalogo.consultas}`);
console.log(`ECST:         precio=${ecst.precio('TEC-1')} · llamadas HTTP al catálogo: 0`);

await catalogo.cerrar(); // el catálogo se cae… y llega otro cambio que se publicó justo antes
bus.emit('notificacion', { tipo: 'PrecioCambiado', id: 'TEC-1', version: 5 });
bus.emit('ecst', { tipo: 'ProductoActualizado', id: 'TEC-1', nombre: 'Teclado', precio: 140, version: 5 });
await dormir(100);
console.log(`catálogo caído → notificación: precio=${notif.precio('TEC-1')} (desactualizado) · error: ${notif.errores[0]}`);
console.log(`catálogo caído → ECST:         precio=${ecst.precio('TEC-1')} (sigue funcionando con su réplica)`);
