// Verificación F097: npm run build && node --test dist/f097-nestjs/src/pedidos.test.js
import 'reflect-metadata';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './pedidos.module.js';
import { PedidosService } from './pedidos.service.js';

let app: INestApplication;
let base: string;
before(async () => {
  const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = modulo.createNestApplication({ logger: false });
  await app.listen(0);
  base = (await app.getUrl()).replace('[::1]', 'localhost');
});
after(() => app.close());

test('el contenedor de Nest crea UN solo PedidosService (singleton)', () => {
  assert.equal(app.get(PedidosService), app.get(PedidosService));
});

test('controller + interceptor: GET /pedidos/1 → { datos } y cabecera x-tiempo-ms', async () => {
  const r = await fetch(`${base}/pedidos/1`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { datos: { id: 1, cliente: 'Ana', total: 120000 } });
  assert.match(r.headers.get('x-tiempo-ms') ?? '', /^\d+$/);
});

test('pipe: un id que no es número → 400; provider: id inexistente → 404', async () => {
  assert.equal((await fetch(`${base}/pedidos/abc`)).status, 400);
  const r = await fetch(`${base}/pedidos/99`);
  assert.equal(r.status, 404);
  assert.equal((await r.json()).message, 'No existe el pedido 99');
});

test('guard: POST sin rol → 403; con x-rol admin → 201', async () => {
  const cuerpo = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cliente: 'Luis', total: 5000 }) };
  assert.equal((await fetch(`${base}/pedidos`, cuerpo)).status, 403);
  const r = await fetch(`${base}/pedidos`, { ...cuerpo, headers: { ...cuerpo.headers, 'x-rol': 'admin' } });
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { datos: { id: 2, cliente: 'Luis', total: 5000 } });
});
