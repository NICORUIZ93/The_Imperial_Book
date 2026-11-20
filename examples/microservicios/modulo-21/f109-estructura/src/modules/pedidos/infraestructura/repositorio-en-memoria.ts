// infraestructura/: adaptadores hacia el mundo exterior (base de datos, colas, otros servicios).
// Este guarda en memoria; el de producción (PostgreSQL, Módulo 15) implementa la MISMA interfaz.
import type { GeneradorDeIds, RepositorioDePedidos } from '../aplicacion/puertos.ts';
import type { Pedido } from '../dominio/pedido.ts';

export function repositorioEnMemoria(): RepositorioDePedidos {
  const datos = new Map<string, Pedido>();
  return {
    async guardar(pedido) {
      datos.set(pedido.id, pedido);
    },
    async buscar(id) {
      return datos.get(id);
    },
  };
}

export function idsSecuenciales(): GeneradorDeIds {
  let n = 0;
  return { siguiente: () => `P-${++n}` };
}
