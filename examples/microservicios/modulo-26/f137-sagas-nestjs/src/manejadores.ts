// Módulo 22 · F137 · Un manejador por comando: hace UN paso local y publica el evento con el resultado.
// Ningún manejador conoce el paso siguiente: eso lo decide la saga (pedido.saga.ts).
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import {
  CrearPedido, ReservarStock, CobrarPago, LiberarStock, ConfirmarPedido, CancelarPedido,
  PedidoCreado, StockReservado, StockAgotado, PagoAceptado, PagoRechazado, StockLiberado, PedidoConfirmado, PedidoCancelado,
} from './mensajes.js';
import { InventarioService, PagosService, PedidosRepositorio } from './servicios.js';

@CommandHandler(CrearPedido)
export class CrearPedidoHandler implements ICommandHandler<CrearPedido> {
  constructor(private readonly repo: PedidosRepositorio, private readonly eventos: EventBus) {}
  async execute({ pedidoId, sku, cantidad, total }: CrearPedido) {
    await this.repo.guardar(pedidoId, { estado: 'PENDIENTE' });
    this.eventos.publish(new PedidoCreado(pedidoId, sku, cantidad, total));
  }
}

@CommandHandler(ReservarStock)
export class ReservarStockHandler implements ICommandHandler<ReservarStock> {
  constructor(private readonly inventario: InventarioService, private readonly eventos: EventBus) {}
  async execute({ pedidoId, sku, cantidad, total }: ReservarStock) {
    const ok = await this.inventario.reservar(pedidoId, sku, cantidad);
    // El evento lleva lo que la saga necesita para armar el comando siguiente, sin consultar a nadie.
    this.eventos.publish(ok ? new StockReservado(pedidoId, total) : new StockAgotado(pedidoId));
  }
}

@CommandHandler(CobrarPago)
export class CobrarPagoHandler implements ICommandHandler<CobrarPago> {
  constructor(private readonly pagos: PagosService, private readonly eventos: EventBus) {}
  async execute({ pedidoId, total }: CobrarPago) {
    const ok = await this.pagos.cobrar(pedidoId, total);
    this.eventos.publish(ok ? new PagoAceptado(pedidoId) : new PagoRechazado(pedidoId, `cobro de ${total} rechazado`));
  }
}

@CommandHandler(LiberarStock)
export class LiberarStockHandler implements ICommandHandler<LiberarStock> {
  constructor(private readonly inventario: InventarioService, private readonly eventos: EventBus) {}
  async execute({ pedidoId }: LiberarStock) {
    await this.inventario.liberar(pedidoId);
    this.eventos.publish(new StockLiberado(pedidoId, 'pago rechazado'));
  }
}

@CommandHandler(ConfirmarPedido)
export class ConfirmarPedidoHandler implements ICommandHandler<ConfirmarPedido> {
  constructor(private readonly repo: PedidosRepositorio, private readonly eventos: EventBus) {}
  async execute({ pedidoId }: ConfirmarPedido) {
    await this.repo.guardar(pedidoId, { estado: 'CONFIRMADO' });
    this.eventos.publish(new PedidoConfirmado(pedidoId));
  }
}

@CommandHandler(CancelarPedido)
export class CancelarPedidoHandler implements ICommandHandler<CancelarPedido> {
  constructor(private readonly repo: PedidosRepositorio, private readonly eventos: EventBus) {}
  async execute({ pedidoId, motivo }: CancelarPedido) {
    await this.repo.guardar(pedidoId, { estado: 'CANCELADO', motivo });
    this.eventos.publish(new PedidoCancelado(pedidoId, motivo));
  }
}

export const MANEJADORES = [CrearPedidoHandler, ReservarStockHandler, CobrarPagoHandler, LiberarStockHandler, ConfirmarPedidoHandler, CancelarPedidoHandler];
