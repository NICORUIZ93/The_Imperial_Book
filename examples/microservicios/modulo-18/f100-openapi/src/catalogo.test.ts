// Verificación F100: npm run build && node --test dist/f100-openapi/src/catalogo.test.js
import 'reflect-metadata';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { CatalogoModule, configurar, documentoOpenApi } from './catalogo.js';

let app: INestApplication;
let base: string;
before(async () => {
  const modulo = await Test.createTestingModule({ imports: [CatalogoModule] }).compile();
  app = modulo.createNestApplication({ logger: false });
  configurar(app);
  await app.listen(0);
  base = (await app.getUrl()).replace('[::1]', 'localhost');
});
after(() => app.close());

test('/docs-json publica un documento OpenAPI 3 con las rutas y respuestas', async () => {
  const doc = await (await fetch(`${base}/docs-json`)).json();
  assert.match(doc.openapi, /^3\./);
  assert.deepEqual(Object.keys(doc.paths).sort(), ['/productos', '/productos/{id}']);
  assert.deepEqual(Object.keys(doc.paths['/productos/{id}'].get.responses).sort(), ['200', '404']);
});

test('el esquema del DTO trae tipos, ejemplos, enum y campos obligatorios', async () => {
  const doc = await (await fetch(`${base}/docs-json`)).json();
  const esquema = doc.components.schemas.CrearProductoDto;
  assert.deepEqual(esquema.required.sort(), ['categoria', 'nombre', 'precio']);
  assert.deepEqual(esquema.properties.categoria.enum, ['hardware', 'software']);
  assert.equal(esquema.properties.precio.minimum, 1);
});

test('Swagger UI responde en /docs', async () => {
  const r = await fetch(`${base}/docs`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /swagger-ui/i);
});

test('el contrato versionado (openapi.json) coincide con el código: no hay deriva', () => {
  const versionado = JSON.parse(readFileSync(new URL('../../../f100-openapi/openapi.json', import.meta.url), 'utf8'));
  assert.deepEqual(documentoOpenApi(app), versionado);
});

test('la API cumple su contrato: un precio negativo → 400', async () => {
  const r = await fetch(`${base}/productos`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nombre: 'Mouse', precio: -5, categoria: 'hardware' }) });
  assert.equal(r.status, 400);
});
