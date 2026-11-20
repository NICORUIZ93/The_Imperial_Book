// F098 · Arranque de la API NestJS con class-validator. Ejecuta: npm run build && node dist/f098-validacion/src/main.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ClientesModule, tuberiaDeValidacion } from './clientes.js';

const app = await NestFactory.create(ClientesModule, { logger: ['error', 'warn'] });
app.useGlobalPipes(tuberiaDeValidacion); // ❗ sin esta línea los decoradores no validan nada
await app.listen(Number(process.env.PORT ?? 3198));
console.log(`API NestJS con class-validator en http://localhost:${process.env.PORT ?? 3198}`);
