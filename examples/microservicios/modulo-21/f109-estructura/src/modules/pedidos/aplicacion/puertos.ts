// aplicacion/puertos.ts: lo que el caso de uso NECESITA del exterior, descrito como interfaces ("puertos").
// La infraestructura las implementa ("adaptadores"); la aplicación nunca importa la implementación.
import type { Pedido } from '../dominio/pedido.ts';

export interface RepositorioDePedidos {
  guardar(pedido: Pedido): Promise<void>;
  buscar(id: string): Promise<Pedido | undefined>;
}

export interface GeneradorDeIds {
  siguiente(): string;
}
