// Módulo 22 · F137 · Demo: tres pedidos recorren la saga (feliz, sin stock y pago rechazado con compensación).
// Ejecuta: npm run build && node dist/f137-sagas-nestjs/src/main.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { filter, firstValueFrom } from 'rxjs';
import { PedidosModule } from './app.module.js';
import { CrearPedido, PedidoConfirmado, PedidoCancelado } from './mensajes.js';
import { InventarioService, PedidosRepositorio } from './servicios.js';

const app = await NestFactory.createApplicationContext(PedidosModule, { logger: ['error', 'warn'] });
const comandos = app.get(CommandBus);
const eventos = app.get(EventBus);
// EventBus es un Observable: nos suscribimos solo para imprimir cada evento en el orden en que ocurre.
eventos.subscribe((e) => console.log(`  evento ${e.constructor.name.padEnd(16)} ${JSON.stringify(e)}`));

async function ejecutar(pedido: CrearPedido) {
  const fin = firstValueFrom(eventos.pipe(ofType(PedidoConfirmado, PedidoCancelado), filter((e) => e.pedidoId === pedido.pedidoId)));
  console.log(`▶ ${pedido.pedidoId}: ${pedido.cantidad} × ${pedido.sku} por ${pedido.total}`);
  await comandos.execute(pedido);
  await fin; // la saga es asíncrona: execute() vuelve en cuanto el primer paso termina
}

await ejecutar(new CrearPedido('P-1', 'TEC-1', 2, 240_000));     // camino feliz
await ejecutar(new CrearPedido('P-2', 'MOU-1', 1, 50_000));      // sin stock: se cancela sin compensar
await ejecutar(new CrearPedido('P-3', 'TEC-1', 1, 2_000_000));   // pago rechazado: libera el stock y cancela

const inventario = app.get(InventarioService);
console.log('estado final:', JSON.stringify(Object.fromEntries(app.get(PedidosRepositorio).pedidos)));
console.log('stock TEC-1:', inventario.stock.get('TEC-1'), '· reservas:', [...inventario.reservas.keys()].join(','));
await app.close();
