// Módulo 22 · F141 · Demo de CQRS: comandos por el CommandBus, consultas por el QueryBus, y la consistencia eventual
// entre los dos. Ejecuta: npm run build && node dist/f141-cqrs/src/main.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { CatalogoModule } from './app.module.js';
import { CrearProducto, CambiarPrecio } from './escritura.js';
import { ListarCatalogo, VerProducto } from './lectura.js';

const app = await NestFactory.createApplicationContext(CatalogoModule, { logger: ['error', 'warn'] });
const comandos = app.get(CommandBus);
const consultas = app.get(QueryBus);

await comandos.execute(new CrearProducto('TEC-1', 'Teclado', 120000));
await comandos.execute(new CrearProducto('MOU-1', 'Mouse', 45000));
await comandos.execute(new CrearProducto('USB-1', 'Memoria USB', 9000));
console.log('justo después de crear, catálogo:', (await consultas.execute(new ListarCatalogo())).length, 'productos');
await esperar(100);
console.log('100 ms después, hasta 50000:', JSON.stringify((await consultas.execute(new ListarCatalogo(50000))).map((f) => `${f.id}=${f.precio}`)));

const version = await comandos.execute(new CambiarPrecio('TEC-1', 99000));
console.log(`CambiarPrecio devolvió la versión ${version} (un comando no devuelve la ficha)`);
console.log('lectura inmediata  :', JSON.stringify(await consultas.execute(new VerProducto('TEC-1'))));
console.log('con versionMinima=2:', JSON.stringify(await consultas.execute(new VerProducto('TEC-1', version))));
try { await comandos.execute(new CambiarPrecio('MOU-1', 90000)); } catch (e) { console.log(`regla del lado de escritura → ${(e as Error).message}`); }
await app.close();
