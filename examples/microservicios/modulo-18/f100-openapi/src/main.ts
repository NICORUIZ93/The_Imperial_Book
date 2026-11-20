// F100 · Arranque. Ejecuta: npm run build && node dist/f100-openapi/src/main.js   y abre http://localhost:3100/docs
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CatalogoModule, configurar } from './catalogo.js';

const app = await NestFactory.create(CatalogoModule, { logger: ['error', 'warn'] });
configurar(app);
await app.listen(Number(process.env.PORT ?? 3100));
console.log(`Swagger UI en http://localhost:${process.env.PORT ?? 3100}/docs`);
