// Módulo 22 · F137 · Módulo de Nest: CqrsModule.forRoot() registra CommandBus, EventBus y QueryBus;
// al arrancar, Nest busca en los providers los @CommandHandler y los @Saga() y los conecta.
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MANEJADORES } from './manejadores.js';
import { PedidoSaga } from './pedido.saga.js';
import { InventarioService, PagosService, PedidosRepositorio } from './servicios.js';

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [...MANEJADORES, PedidoSaga, InventarioService, PagosService, PedidosRepositorio],
})
export class PedidosModule {}
