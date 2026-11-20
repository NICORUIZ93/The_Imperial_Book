// F099 · Arranque. Ejecuta: npm run build && node dist/f099-dtos/src/main.js
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UsuariosModule } from './usuarios.js';

const app = await NestFactory.create(UsuariosModule, { logger: ['error', 'warn'] });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
await app.listen(Number(process.env.PORT ?? 3099));
console.log(`API de usuarios en http://localhost:${process.env.PORT ?? 3099}`);
