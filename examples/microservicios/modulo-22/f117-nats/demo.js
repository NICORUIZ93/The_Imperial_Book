// Módulo 18 · F117 · Ejecuta (con docker compose arriba): node f117-nats/demo.js
import { setTimeout as dormir } from 'node:timers/promises';
import { conectar, pedir, publicar, responder, suscribir } from './nats.js';

const nc = await conectar('demo');
console.log(`conectado a ${nc.getServer()}`);

// 1) Publicar/suscribir con comodines: «auditoria» escucha todo lo de pedidos.
suscribir(nc, 'pedidos.*', (dato, subject) => console.log(`auditoria   ← ${subject} ${JSON.stringify(dato)}`));

// 2) Grupo de cola: dos «workers» de facturación se reparten los pedidos creados.
for (const id of ['A', 'B']) {
  suscribir(nc, 'pedidos.creado', (dato) => console.log(`facturacion-${id} ← ${dato.pedidoId}`), { grupo: 'facturacion' });
}

// 3) Petición/respuesta: «inventario» contesta consultas.
responder(nc, 'inventario.consultar', ({ sku }) => ({ sku, disponibles: sku === 'TEC-1' ? 12 : 0 }));

await nc.flush(); // espera a que el servidor haya registrado las suscripciones
for (const pedidoId of ['P-1', 'P-2', 'P-3', 'P-4']) publicar(nc, 'pedidos.creado', { pedidoId });
publicar(nc, 'pedidos.cancelado', { pedidoId: 'P-2' });
await dormir(200);

console.log('respuesta   ←', JSON.stringify(await pedir(nc, 'inventario.consultar', { sku: 'TEC-1' })));
await pedir(nc, 'pagos.cobrar', { pedidoId: 'P-1' }).catch((error) => console.log(`pagos.cobrar → ${error.name}: ${error.message}`));

await nc.drain(); // procesa lo pendiente, cancela las suscripciones y cierra
