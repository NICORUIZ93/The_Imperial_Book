// Verificación F099: npm run build && node --test dist/f099-dtos/src/usuarios.test.js
import 'reflect-metadata';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { UsuariosModule, UsuariosService } from './usuarios.js';

let app: INestApplication;
let base: string;
before(async () => {
  const modulo = await Test.createTestingModule({ imports: [UsuariosModule] }).compile();
  app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(0);
  base = (await app.getUrl()).replace('[::1]', 'localhost');
});
after(() => app.close());

const pedir = (metodo: string, ruta: string, cuerpo?: unknown) =>
  fetch(`${base}${ruta}`, { method: metodo, headers: { 'content-type': 'application/json' }, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });

test('la respuesta es el DTO de salida: sin passwordHash ni rol', async () => {
  const r = await pedir('POST', '/usuarios', { nombre: 'Ana', email: 'ana@correo.co', password: 'una-clave-larga' });
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { id: 1, nombre: 'Ana', email: 'ana@correo.co', miembroDesde: '2026-11-19' });
});

test('asignación masiva bloqueada: enviar "rol" da 400 y nadie se vuelve admin', async () => {
  const r = await pedir('POST', '/usuarios', { nombre: 'Eva', email: 'eva@correo.co', password: 'una-clave-larga', rol: 'admin' });
  assert.equal(r.status, 400);
  assert.deepEqual((await r.json()).message, ['property rol should not exist']);
});

test('PartialType: PATCH acepta solo algunos campos y conserva sus reglas', async () => {
  const ok = await pedir('PATCH', '/usuarios/1', { nombre: 'Ana María' });
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).nombre, 'Ana María');
  const malo = await pedir('PATCH', '/usuarios/1', { email: 'no-es-email' });
  assert.equal(malo.status, 400);
  const sinPassword = await pedir('PATCH', '/usuarios/1', { password: 'otra-clave-larga' });
  assert.deepEqual((await sinPassword.json()).message, ['property password should not exist']); // OmitType
});

test('la entidad interna sí guarda el hash y el rol decidido por el servidor', () => {
  const u = app.get(UsuariosService).buscar(1);
  assert.equal(u.rol, 'cliente');
  assert.equal(u.passwordHash.length, 64);
});
