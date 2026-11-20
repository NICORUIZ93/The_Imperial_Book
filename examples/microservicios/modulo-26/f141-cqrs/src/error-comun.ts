// Módulo 22 · F141 · Error común: tratar el lado de lectura como si fuera inmediato. La pantalla guarda el precio y
// enseguida lo vuelve a leer: ve el VIEJO, cree que falló y lo envía otra vez (o muestra un dato falso).
// Ejecuta: npm run build && node dist/f141-cqrs/src/error-comun.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { CatalogoModule } from './app.module.js';
import { CrearProducto, CambiarPrecio } from './escritura.js';
import { VerProducto } from './lectura.js';

const app = await NestFactory.createApplicationContext(CatalogoModule, { logger: false });
const comandos = app.get(CommandBus), consultas = app.get(QueryBus);
await comandos.execute(new CrearProducto('TEC-1', 'Teclado', 100));
await esperar(100);

// MAL: escribir y leer sin pedir la versión que acabas de escribir.
await comandos.execute(new CambiarPrecio('TEC-1', 140));
const vista = await consultas.execute(new VerProducto('TEC-1'));
console.log(`MAL  → guardé 140 y la pantalla muestra ${vista?.precio}`);
try { await comandos.execute(new CambiarPrecio('TEC-1', 140)); console.log('       el usuario lo reintenta: segundo cambio aceptado, 2 eventos para un solo cambio real'); }
catch (e) { console.log(`       reintento → ${(e as Error).message}`); }

// BIEN: el comando devuelve la versión y la consulta espera a que la vista la alcance (read-your-writes).
const version = await comandos.execute(new CambiarPrecio('TEC-1', 150));
const buena = await consultas.execute(new VerProducto('TEC-1', version));
console.log(`BIEN → guardé 150 (versión ${version}) y la pantalla muestra ${buena?.precio}`);
await app.close();
