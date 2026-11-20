// Módulo 22 · F137 · Error común: una excepción DENTRO del flujo de una saga la apaga para siempre.
// Con la opción por defecto de @nestjs/cqrs 12.1.3 (sagaErrorStrategy: 'complete'), Nest registra el error UNA vez
// y el Observable de esa saga termina: los eventos siguientes se ignoran en silencio y los pedidos quedan colgados.
// Ejecuta: npm run build && node dist/f137-sagas-nestjs/src/error-comun.js
import 'reflect-metadata';
import { Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CqrsModule, CommandBus, CommandHandler, EventBus, Saga, ofType } from '@nestjs/cqrs';
import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { CrearPedido, PedidoCreado, ConfirmarPedido } from './mensajes.js';

const confirmados: string[] = [];

@Injectable()
class SagaFragil {
  @Saga()
  pedidoCreado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PedidoCreado),
    map((e) => {
      if (e.total <= 0) throw new Error(`total inválido en ${e.pedidoId}`); // MAL: validar lanzando dentro del stream
      return new ConfirmarPedido(e.pedidoId);
    }),
  );
}

@CommandHandler(CrearPedido)
class Crear implements ICommandHandler<CrearPedido> {
  constructor(private readonly eventos: EventBus) {}
  async execute(c: CrearPedido) { this.eventos.publish(new PedidoCreado(c.pedidoId, c.sku, c.cantidad, c.total)); }
}
@CommandHandler(ConfirmarPedido)
class Confirmar implements ICommandHandler<ConfirmarPedido> {
  async execute(c: ConfirmarPedido) { confirmados.push(c.pedidoId); }
}

for (const estrategia of ['complete', 'resubscribe'] as const) {
  confirmados.length = 0;
  @Module({ imports: [CqrsModule.forRoot({ sagaErrorStrategy: estrategia })], providers: [SagaFragil, Crear, Confirmar] })
  class Demo {}
  const app = await NestFactory.createApplicationContext(Demo, { logger: ['error'] });
  const bus = app.get(CommandBus);
  await bus.execute(new CrearPedido('P-1', 'TEC-1', 1, 100));
  await bus.execute(new CrearPedido('P-2', 'TEC-1', 1, 0));    // este revienta la saga
  await new Promise((r) => setTimeout(r, 300));                // 'resubscribe' vuelve a suscribirse a los 100 ms
  await bus.execute(new CrearPedido('P-3', 'TEC-1', 1, 100));  // ¿alguien lo escucha todavía?
  await new Promise((r) => setTimeout(r, 50));
  console.log(`sagaErrorStrategy=${estrategia.padEnd(11)} → confirmados: [${confirmados.join(', ')}]`);
  await app.close();
}
