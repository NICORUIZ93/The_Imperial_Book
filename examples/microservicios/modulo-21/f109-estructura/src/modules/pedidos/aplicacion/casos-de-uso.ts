// aplicacion/: los casos de uso. Orquestan el dominio y los puertos; no saben de HTTP ni de SQL.
import { NoEncontrado } from '../../../shared/errores.ts';
import { crearPedido, type Linea, type Pedido } from '../dominio/pedido.ts';
import type { GeneradorDeIds, RepositorioDePedidos } from './puertos.ts';

export interface Dependencias {
  readonly repositorio: RepositorioDePedidos;
  readonly ids: GeneradorDeIds;
  readonly montoMaximo: number;
}

export interface CasosDeUsoDePedidos {
  crear(entrada: { cliente: string; lineas: Linea[] }): Promise<Pedido>;
  consultar(id: string): Promise<Pedido>;
}

export function crearCasosDeUso({ repositorio, ids, montoMaximo }: Dependencias): CasosDeUsoDePedidos {
  return {
    async crear({ cliente, lineas }) {
      const pedido = crearPedido(ids.siguiente(), cliente, lineas, montoMaximo);
      await repositorio.guardar(pedido);
      return pedido;
    },
    async consultar(id) {
      const pedido = await repositorio.buscar(id);
      if (!pedido) throw new NoEncontrado(`No existe el pedido ${id}`);
      return pedido;
    },
  };
}
