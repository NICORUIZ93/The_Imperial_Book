// Módulo 30 · F174 · Ejecuta: node f174-sobre-descomposicion/demo.js
// Los tiempos dependen de tu máquina; lo que no cambia es el número de llamadas y el orden de magnitud.
import { crearNanoservicios, granularidad, p50, totalEnProceso } from './nano.js';

const pedido = { id: 'P-1', lineas: [{ sku: 'TEC-1', precio: 120000, cantidad: 1 }, { sku: 'MOU-1', precio: 45000, cantidad: 2 }] };
const nano = await crearNanoservicios();
const a = totalEnProceso(pedido);
const b = await nano.total(pedido);
console.log(`Mismo resultado: en proceso total=${a.total} · nanoservicios total=${b.total} (${nano.llamadas} llamadas HTTP)`);
const tLocal = await p50(async () => totalEnProceso(pedido));
const tNano = await p50(() => nano.total(pedido));
console.log(`p50 en proceso: ${tLocal.toFixed(4)} ms · p50 nanoservicios: ${tNano.toFixed(2)} ms · ≈${Math.round(tNano / tLocal)} veces más lento`);
await nano.cerrar();

const g = granularidad({
  servicios: ['clientes', 'direcciones', 'pedidos', 'lineas-pedido', 'pagos', 'notificaciones'],
  desarrolladores: 4,
  cambios: [['clientes', 'direcciones'], ['pedidos', 'lineas-pedido'], ['pedidos', 'lineas-pedido', 'pagos'],
    ['clientes', 'direcciones', 'pedidos'], ['notificaciones'], ['pedidos', 'lineas-pedido']],
});
console.log(`Granularidad: ${g.serviciosPorPersona} servicios por persona · ${g.cambiosMultiServicio} de los cambios tocan varios servicios · fusionar: ${g.fusionar.join(', ')}`);
