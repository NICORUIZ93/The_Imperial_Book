// F097 · Error común: el controller pide PedidosService, pero el módulo no lo declara en `providers`.
// Ejecuta: npm run build && node dist/f097-nestjs/src/error-comun.js
import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PedidosController } from './pedidos.controller.js';

@Module({ controllers: [PedidosController] /* ❌ falta providers: [PedidosService] */ })
class ModuloRoto {}

try {
  await NestFactory.create(ModuloRoto, { logger: false, abortOnError: false });
} catch (error) {
  console.log((error as Error).message);
  process.exitCode = 1;
}
