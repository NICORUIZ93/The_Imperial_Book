// Módulo 22 · F139 · Error común: anexar SIN versión esperada («añade al final, sea cual sea el final»).
// Dos usuarios leen el pedido abierto a la vez: uno confirma y el otro agrega una línea. Los dos «tienen razón» con lo
// que leyeron, y los dos eventos se guardan: el pedido queda CONFIRMADO con una línea agregada DESPUÉS de confirmar.
// Ejecuta: node f139-event-sourcing/error-comun.js   (sin infraestructura)
import { AlmacenEventosMemoria } from './almacen-memoria.js';
import { decidir, reconstruir, ejecutar } from './pedido.js';

export async function ejecutarSinVersion(almacen, pedidoId, comando) {
  const { eventos } = await almacen.leerStream(`pedido-${pedidoId}`);
  const nuevos = decidir(reconstruir(eventos), comando);
  await new Promise((r) => setTimeout(r, 10));                         // el otro usuario escribe mientras tanto
  const { version } = await almacen.leerStream(`pedido-${pedidoId}`); // MAL: la versión se lee al ESCRIBIR, no al decidir
  return almacen.anexar(`pedido-${pedidoId}`, version, nuevos);
}

async function preparar() {
  const almacen = new AlmacenEventosMemoria();
  await ejecutar(almacen, 'P-1', { tipo: 'Crear', cliente: 'ana' });
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'TEC-1', cantidad: 1, precio: 100 });
  return almacen;
}
const confirmar = { tipo: 'Confirmar' };
const agregar = { tipo: 'AgregarLinea', sku: 'USB-1', cantidad: 1, precio: 50 };

if (import.meta.main) {
  let almacen = await preparar();
  await Promise.all([ejecutarSinVersion(almacen, 'P-1', confirmar), ejecutarSinVersion(almacen, 'P-1', agregar)]);
  let { eventos } = await almacen.leerStream('pedido-P-1');
  console.log(`SIN versión esperada: ${eventos.map((e) => e.tipo).join(' → ')}`);
  console.log(`  estado ${reconstruir(eventos).estado} con total ${reconstruir(eventos).total} (se confirmó por 100)`);

  almacen = await preparar();
  const resultados = await Promise.allSettled([ejecutar(almacen, 'P-1', confirmar), ejecutar(almacen, 'P-1', agregar)]);
  ({ eventos } = await almacen.leerStream('pedido-P-1'));
  console.log(`CON versión esperada: ${eventos.map((e) => e.tipo).join(' → ')}`);
  for (const r of resultados) if (r.status === 'rejected') console.log(`  el segundo reintentó, releyó y su regla lo frenó → ${r.reason.message}`);
}
