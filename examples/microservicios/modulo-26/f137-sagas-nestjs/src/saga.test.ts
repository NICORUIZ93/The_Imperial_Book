// Módulo 22 · F137 · Verificación de la saga con @nestjs/cqrs 12.1.3 (sin infraestructura).
// Ejecuta: npm run build && node --test dist/f137-sagas-nestjs/src/saga.test.js
import 'reflect-metadata';
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { filter, firstValueFrom } from 'rxjs';
import { PedidosModule } from './app.module.js';
import { CrearPedido, PedidoConfirmado, PedidoCancelado } from './mensajes.js';
import { InventarioService, PagosService, PedidosRepositorio } from './servicios.js';

let app: TestingModule;
let vistos: string[];
beforeEach(async () => {
  app = await Test.createTestingModule({ imports: [PedidosModule] }).compile();
  await app.init(); // onApplicationBootstrap de CqrsModule: registra manejadores y sagas
  vistos = [];
  app.get(EventBus).subscribe((e: any) => vistos.push(`${e.pedidoId}:${e.constructor.name}`));
});
afterEach(() => app.close());

async function correr(...pedidos: CrearPedido[]) {
  const eventos: EventBus = app.get(EventBus);
  const fines = pedidos.map((p) => firstValueFrom(eventos.pipe(ofType(PedidoConfirmado, PedidoCancelado), filter((e) => e.pedidoId === p.pedidoId))));
  await Promise.all(pedidos.map((p) => app.get(CommandBus).execute(p)));
  return Promise.all(fines);
}
const de = (id: string) => vistos.filter((v) => v.startsWith(`${id}:`)).map((v) => v.split(':')[1]);

test('camino feliz: reservar → cobrar → confirmar', async () => {
  await correr(new CrearPedido('P-1', 'TEC-1', 2, 240_000));
  assert.deepEqual(de('P-1'), ['PedidoCreado', 'StockReservado', 'PagoAceptado', 'PedidoConfirmado']);
  assert.equal(app.get(PedidosRepositorio).pedidos.get('P-1')?.estado, 'CONFIRMADO');
  assert.equal(app.get(InventarioService).stock.get('TEC-1'), 3);
});

test('sin stock: se cancela y NO se cobra ni se compensa (no hubo nada que deshacer)', async () => {
  await correr(new CrearPedido('P-2', 'MOU-1', 1, 50_000));
  assert.deepEqual(de('P-2'), ['PedidoCreado', 'StockAgotado', 'PedidoCancelado']);
  assert.equal(app.get(PagosService).cobros.size, 0);
});

test('pago rechazado: la compensación LiberarStock devuelve el stock antes de cancelar', async () => {
  await correr(new CrearPedido('P-3', 'TEC-1', 1, 2_000_000));
  assert.deepEqual(de('P-3'), ['PedidoCreado', 'StockReservado', 'PagoRechazado', 'StockLiberado', 'PedidoCancelado']);
  assert.equal(app.get(InventarioService).stock.get('TEC-1'), 5, 'el stock vuelve a 5');
  assert.equal(app.get(InventarioService).reservas.size, 0);
  assert.equal(app.get(PedidosRepositorio).pedidos.get('P-3')?.motivo, 'pago rechazado');
});

test('tres sagas a la vez no se mezclan: cada pedido termina en su estado', async () => {
  await correr(new CrearPedido('A', 'TEC-1', 1, 100), new CrearPedido('B', 'MOU-1', 1, 100), new CrearPedido('C', 'TEC-1', 1, 5_000_000));
  const estados = Object.fromEntries([...app.get(PedidosRepositorio).pedidos].map(([id, p]) => [id, p.estado]));
  assert.deepEqual(estados, { A: 'CONFIRMADO', B: 'CANCELADO', C: 'CANCELADO' });
  assert.equal(app.get(InventarioService).stock.get('TEC-1'), 4, 'solo A se queda con su unidad');
});
