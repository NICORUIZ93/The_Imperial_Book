// F097 · CONTROLLER: traduce HTTP (ruta, verbo, parámetros) a llamadas al provider. No tiene lógica de negocio.
import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { PedidosService } from './pedidos.service.js';
import type { Pedido } from './pedidos.service.js';
import { RolGuard, Roles } from './rol.guard.js';
import { TiempoInterceptor } from './tiempo.interceptor.js';

@Controller('pedidos') // prefijo de ruta: /pedidos
@UseGuards(RolGuard)
@UseInterceptors(TiempoInterceptor)
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {} // inyección de dependencias por el tipo

  @Get()
  listar(): Pedido[] {
    return this.pedidos.listar();
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number): Pedido { // ParseIntPipe: "7" → 7, "abc" → 400
    return this.pedidos.buscar(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin') // solo pasa el guard con x-rol: admin
  crear(@Body() cuerpo: { cliente: string; total: number }): Pedido {
    return this.pedidos.crear(cuerpo.cliente, cuerpo.total);
  }
}
