// F097 · Arranque. Ejecuta: npm run build && node dist/f097-nestjs/src/main.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './pedidos.module.js';

const app = await NestFactory.create(AppModule);
app.enableShutdownHooks(); // SIGTERM → cierra módulos (graceful shutdown, Módulo 13)
await app.listen(Number(process.env.PORT ?? 3097));
console.log(`API NestJS en ${await app.getUrl()}`);
