// Módulo 22 · F140 · Error común: guardar el checkpoint FUERA de la transacción (o después, «cuando termine el lote»).
// Si el proceso muere entre aplicar los eventos y guardar el checkpoint, al volver repite eventos ya aplicados y los
// totales se SUMAN dos veces. No hay error: la vista simplemente miente.
// Ejecuta: node f140-proyecciones/error-comun.js   (sin infraestructura)
import { AlmacenEventosMemoria } from '../f139-event-sourcing/almacen-memoria.js';
import { ejecutar } from '../f139-event-sourcing/pedido.js';
import { ProyeccionResumenPedidos } from './proyeccion.js';

export class ProyeccionIngenua extends ProyeccionResumenPedidos {
  async ponerseAlDia() {
    const commits = await this.almacen.leerDesde(this.checkpoint(), 100);
    for (const commit of commits) {
      for (const evento of commit.eventos) { this.alAplicar(evento); this.aplicar(commit.stream.replace(/^pedido-/, ''), evento); }
    }
    // MAL: el checkpoint se guarda al final, en otra «transacción»; si algo cae antes, todo lo anterior se repetirá
    if (commits.length) this.sql.guardarCheckpoint.run(commits.at(-1).posicion, this.nombre);
    return commits.length;
  }
}

export async function escenario(Clase) {
  const almacen = new AlmacenEventosMemoria();
  await ejecutar(almacen, 'P-1', { tipo: 'Crear', cliente: 'ana' });
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'A', cantidad: 1, precio: 100 });
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'B', cantidad: 1, precio: 50 });
  let caidas = 1;
  const vista = new Clase(almacen, {
    alAplicar: (e) => { if (e.datos.sku === 'B' && caidas-- > 0) throw new Error('el proceso murió'); },
  });
  await vista.ponerseAlDia().catch((e) => e);       // 1.ª ejecución: muere al procesar la línea B
  try { await vista.ponerseAlDia(); } catch {}      // reinicio: sigue desde el checkpoint guardado
  return vista.consultar("SELECT total FROM resumen_pedidos WHERE id = 'P-1'")[0]?.total;
}

if (import.meta.main) {
  console.log(`checkpoint fuera de la transacción → total de P-1 = ${await escenario(ProyeccionIngenua)} (debía ser 150)`);
  console.log(`checkpoint en la misma transacción → total de P-1 = ${await escenario(ProyeccionResumenPedidos)}`);
}
