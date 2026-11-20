// F100 · Exporta el contrato a f100-openapi/openapi.json (se versiona en Git y se revisa en cada PR).
// Ejecuta: npm run build && node dist/f100-openapi/src/exportar.js
import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { CatalogoModule, documentoOpenApi } from './catalogo.js';

const app = await NestFactory.create(CatalogoModule, { logger: false });
const destino = new URL('../../../f100-openapi/openapi.json', import.meta.url);
writeFileSync(destino, JSON.stringify(documentoOpenApi(app), null, 2) + '\n');
await app.close();
console.log(`contrato escrito en ${destino.pathname.split('/').slice(-2).join('/')}`);
