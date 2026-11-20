// Módulo 22 · F137 · La saga: escucha EVENTOS y emite el COMANDO siguiente (o la compensación).
// Requisitos: @nestjs/cqrs 12.1.3 y rxjs 7.8.2. Cada método con @Saga() recibe el flujo de TODOS los eventos
// (un Observable) y devuelve un flujo de comandos que @nestjs/cqrs ejecuta en el CommandBus.
//
//   PedidoCreado   → ReservarStock          StockAgotado  → CancelarPedido
//   StockReservado → CobrarPago            PagoRechazado → LiberarStock (compensación) → StockLiberado → CancelarPedido
//   PagoAceptado   → ConfirmarPedido
import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import type { ICommand } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import {
  PedidoCreado, StockReservado, StockAgotado, PagoAceptado, PagoRechazado, StockLiberado,
  ReservarStock, CobrarPago, LiberarStock, ConfirmarPedido, CancelarPedido,
} from './mensajes.js';

@Injectable()
export class PedidoSaga {
  @Saga()
  pedidoCreado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PedidoCreado),
    map((e) => new ReservarStock(e.pedidoId, e.sku, e.cantidad, e.total)),
  );

  @Saga()
  stockReservado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(StockReservado),
    map((e) => new CobrarPago(e.pedidoId, e.total)),
  );

  @Saga()
  pagoAceptado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PagoAceptado),
    map((e) => new ConfirmarPedido(e.pedidoId)),
  );

  // Camino de fallo: el paso 3 (cobrar) falló → se deshace el paso 2 (reservar) con su compensación.
  @Saga()
  pagoRechazado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PagoRechazado),
    map((e) => new LiberarStock(e.pedidoId)),
  );

  // Cuando la compensación terminó, o el paso 2 ni siquiera se hizo, el pedido se cancela.
  @Saga()
  cancelar = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(StockAgotado, StockLiberado),
    map((e) => new CancelarPedido(e.pedidoId, e instanceof StockAgotado ? 'sin stock' : e.motivo)),
  );
}
