// Módulo 32 · F182 · ERROR COMÚN: llamar al proveedor de pagos DESDE el workflow (importando las actividades como
// funciones normales). El workflow arrastra node:http/fetch y código no determinista al sandbox de Temporal.
import { crearActividades } from './actividades.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';

export async function reservaWorkflowMal(reserva) {
  const act = crearActividades({ inventario: crearInventario({}), repo: null, pagosUrl: 'http://localhost:8090' });
  return act.cobrar(reserva); // ¡red dentro del workflow!
}
