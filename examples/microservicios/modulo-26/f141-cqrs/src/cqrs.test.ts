// Módulo 22 · F141 · Verificación de CQRS con @nestjs/cqrs 12.1.3 (sin infraestructura).
// Ejecuta: npm run build && node --test dist/f141-cqrs/src/cqrs.test.js
import 'reflect-metadata';
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { CatalogoModule } from './app.module.js';
import { CrearProducto, CambiarPrecio, PrecioCambiado, AlmacenProductos } from './escritura.js';
import { ListarCatalogo, VerProducto, CatalogoLectura } from './lectura.js';

let app: TestingModule, comandos: CommandBus, consultas: QueryBus;
beforeEach(async () => {
  app = await Test.createTestingModule({ imports: [CatalogoModule] }).compile();
  await app.init();
  comandos = app.get(CommandBus); consultas = app.get(QueryBus);
});
afterEach(() => app.close());

test('el comando devuelve solo la versión; la consulta devuelve la ficha desnormalizada', async () => {
  assert.equal(await comandos.execute(new CrearProducto('A', 'Teclado', 100)), 1);
  assert.equal(await comandos.execute(new CambiarPrecio('A', 120)), 2);
  const ficha = await consultas.execute(new VerProducto('A', 2));
  assert.deepEqual(ficha, { id: 'A', nombre: 'Teclado', precio: 120, precioAnterior: 100, cambios: 1, version: 2 });
});

test('consistencia eventual: justo después del comando la lectura todavía no lo ve', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  assert.equal(await consultas.execute(new VerProducto('A')), null);
  await esperar(80);
  assert.equal((await consultas.execute(new VerProducto('A')))?.precio, 100);
});

test('las reglas viven en el lado de escritura y no tocan el de lectura', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  await assert.rejects(comandos.execute(new CambiarPrecio('A', 1000)), /subida mayor al 50 %/);
  await assert.rejects(comandos.execute(new CrearProducto('B', 'Gratis', 0)), /positivo/);
  await esperar(80);
  assert.equal(app.get(AlmacenProductos).leer('A').version, 1);
  assert.equal((await consultas.execute(new ListarCatalogo())).length, 1);
});

test('la proyección es idempotente: un evento repetido no cuenta dos cambios', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  await comandos.execute(new CambiarPrecio('A', 110));
  app.get(EventBus).publish(new PrecioCambiado('A', 2, 100, 110)); // el broker lo entregó dos veces
  await esperar(100);
  assert.equal((await consultas.execute(new VerProducto('A')))?.cambios, 1);
});

test('el modelo de lectura se puede borrar y rehacer desde los eventos del de escritura', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  await comandos.execute(new CambiarPrecio('A', 90));
  await esperar(80);
  const antes = await consultas.execute(new VerProducto('A'));
  const lectura = app.get(CatalogoLectura);
  lectura.fichas.clear(); lectura.retrasoMs = 0;
  for (const eventos of app.get(AlmacenProductos).streams.values()) for (const e of eventos) app.get(EventBus).publish(e);
  assert.deepEqual(await consultas.execute(new VerProducto('A', 2)), antes);
});
