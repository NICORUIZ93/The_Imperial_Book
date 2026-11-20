// Módulo 22 · F137 · Comandos (órdenes: «haz esto») y eventos (hechos: «esto pasó») de la saga de pedidos.
// Requisitos: Node.js 26.13.1 LTS, @nestjs/cqrs 12.1.3, TypeScript 6.0.3.
import { Command } from '@nestjs/cqrs';
import type { IEvent } from '@nestjs/cqrs';

// ---- Comandos: Command<R> declara qué devuelve commandBus.execute() (aquí, nada) ----
export class CrearPedido extends Command<void> {
  constructor(readonly pedidoId: string, readonly sku: string, readonly cantidad: number, readonly total: number) { super(); }
}
export class ReservarStock extends Command<void> {
  // total viaja con el comando para que el evento StockReservado lo lleve al paso siguiente (cobrar)
  constructor(readonly pedidoId: string, readonly sku: string, readonly cantidad: number, readonly total: number) { super(); }
}
export class CobrarPago extends Command<void> {
  constructor(readonly pedidoId: string, readonly total: number) { super(); }
}
export class LiberarStock extends Command<void> { // COMPENSACIÓN de ReservarStock
  constructor(readonly pedidoId: string) { super(); }
}
export class ConfirmarPedido extends Command<void> {
  constructor(readonly pedidoId: string) { super(); }
}
export class CancelarPedido extends Command<void> {
  constructor(readonly pedidoId: string, readonly motivo: string) { super(); }
}

// ---- Eventos: en pasado; la saga reacciona a ellos ----
export class PedidoCreado implements IEvent {
  constructor(readonly pedidoId: string, readonly sku: string, readonly cantidad: number, readonly total: number) {}
}
export class StockReservado implements IEvent { constructor(readonly pedidoId: string, readonly total: number) {} }
export class StockAgotado implements IEvent { constructor(readonly pedidoId: string) {} }
export class PagoAceptado implements IEvent { constructor(readonly pedidoId: string) {} }
export class PagoRechazado implements IEvent { constructor(readonly pedidoId: string, readonly motivo: string) {} }
export class StockLiberado implements IEvent { constructor(readonly pedidoId: string, readonly motivo: string) {} }
export class PedidoConfirmado implements IEvent { constructor(readonly pedidoId: string) {} }
export class PedidoCancelado implements IEvent { constructor(readonly pedidoId: string, readonly motivo: string) {} }
