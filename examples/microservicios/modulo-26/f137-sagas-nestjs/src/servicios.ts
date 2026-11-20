// Módulo 22 · F137 · Los «servicios remotos» de la saga, en memoria para que el laboratorio corra sin infraestructura.
// En un sistema real, cada uno sería otro microservicio al otro lado de RabbitMQ o HTTP (Módulos 18 y 22).
import { Injectable } from '@nestjs/common';
import { setTimeout as esperar } from 'node:timers/promises';

// Simula la latencia de red de un servicio remoto. Además hace que cada paso termine en OTRO turno del event loop:
// sin ningún await, el EventBus en memoria encadenaría toda la saga dentro del primer publish() (ver la ficha).
const red = () => esperar(2);

@Injectable()
export class InventarioService {
  readonly stock = new Map<string, number>([['TEC-1', 5], ['MOU-1', 0]]);
  readonly reservas = new Map<string, { sku: string; cantidad: number }>(); // pedidoId → reserva

  async reservar(pedidoId: string, sku: string, cantidad: number): Promise<boolean> {
    await red();
    if (this.reservas.has(pedidoId)) return true;          // idempotente: la misma reserva no descuenta dos veces
    const disponibles = this.stock.get(sku) ?? 0;
    if (disponibles < cantidad) return false;
    this.stock.set(sku, disponibles - cantidad);
    this.reservas.set(pedidoId, { sku, cantidad });
    return true;
  }

  // Compensación idempotente (F138): devuelve lo reservado SOLO si la reserva existe, y la borra.
  async liberar(pedidoId: string): Promise<void> {
    await red();
    const reserva = this.reservas.get(pedidoId);
    if (!reserva) return;
    this.stock.set(reserva.sku, (this.stock.get(reserva.sku) ?? 0) + reserva.cantidad);
    this.reservas.delete(pedidoId);
  }
}

@Injectable()
export class PagosService {
  limite = 1_000_000; // la pasarela rechaza cobros mayores (así provocamos el fallo del paso 3)
  readonly cobros = new Map<string, number>();
  async cobrar(pedidoId: string, total: number): Promise<boolean> {
    await red();
    if (total > this.limite) return false;
    this.cobros.set(pedidoId, total);
    return true;
  }
}

export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';
@Injectable()
export class PedidosRepositorio {
  readonly pedidos = new Map<string, { estado: EstadoPedido; motivo?: string }>();
  async guardar(pedidoId: string, datos: { estado: EstadoPedido; motivo?: string }) {
    await red(); // la base de datos también está «al otro lado de la red»
    this.pedidos.set(pedidoId, datos);
  }
}
