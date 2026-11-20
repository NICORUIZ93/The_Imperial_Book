// F097 · MÓDULO: agrupa controllers y providers de un mismo dominio. Es la unidad de organización de Nest.
import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller.js';
import { PedidosService } from './pedidos.service.js';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService], // otros módulos que importen PedidosModule podrán inyectarlo
})
export class PedidosModule {}

@Module({ imports: [PedidosModule] })
export class AppModule {} // módulo raíz: el que se pasa a NestFactory.create
