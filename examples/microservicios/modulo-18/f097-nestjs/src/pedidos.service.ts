// Módulo 14 · F097 · PROVIDER: una clase @Injectable que Nest crea una vez (singleton) y entrega a quien la pida.
import { Injectable, NotFoundException } from '@nestjs/common';

export interface Pedido {
  id: number;
  cliente: string;
  total: number;
}

@Injectable()
export class PedidosService {
  private readonly pedidos = new Map<number, Pedido>([[1, { id: 1, cliente: 'Ana', total: 120000 }]]);

  listar(): Pedido[] {
    return [...this.pedidos.values()];
  }

  buscar(id: number): Pedido {
    const pedido = this.pedidos.get(id);
    if (!pedido) throw new NotFoundException(`No existe el pedido ${id}`); // Nest la convierte en 404
    return pedido;
  }

  crear(cliente: string, total: number): Pedido {
    const pedido = { id: this.pedidos.size + 1, cliente, total };
    this.pedidos.set(pedido.id, pedido);
    return pedido;
  }
}
