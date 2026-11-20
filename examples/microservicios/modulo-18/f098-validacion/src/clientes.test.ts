// Verificación F098 (class-validator): npm run build && node --test dist/f098-validacion/src/clientes.test.js
import 'reflect-metadata';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClienteNuevoDto, ClientesModule, tuberiaDeValidacion } from './clientes.js';

let app: INestApplication;
let base: string;
before(async () => {
  const modulo = await Test.createTestingModule({ imports: [ClientesModule] }).compile();
  app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(tuberiaDeValidacion);
  await app.listen(0);
  base = (await app.getUrl()).replace('[::1]', 'localhost');
});
after(() => app.close());

const enviar = (cuerpo: unknown) =>
  fetch(`${base}/clientes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });

test('validate() sin Nest: devuelve un error por propiedad', async () => {
  const dto = plainToInstance(ClienteNuevoDto, { nombre: 'A', email: 'x', edad: '15' });
  const errores = await validate(dto);
  assert.deepEqual(errores.map((e) => e.property), ['nombre', 'email', 'edad']);
});

test('ValidationPipe: datos válidos → 201 e instancia de la clase con edad numérica', async () => {
  const r = await enviar({ nombre: 'Ana', email: 'ana@correo.co', edad: '30', direccion: { calle: 'Cra 7 # 40', ciudad: 'Bogotá' } });
  assert.equal(r.status, 201);
  const cuerpo = await r.json();
  assert.equal(cuerpo.esInstancia, true);
  assert.equal(cuerpo.recibido.edad, 30);
});

test('ValidationPipe: inválido → 400 con un mensaje por regla rota', async () => {
  const r = await enviar({ nombre: 'A', email: 'x', edad: 15, direccion: { calle: 'X' } });
  assert.equal(r.status, 400);
  const { message } = await r.json();
  assert.deepEqual(message.sort(), [
    'debe ser mayor de edad',
    'direccion.calle must be longer than or equal to 3 characters',
    'direccion.ciudad must be a string',
    'email inválido',
    'nombre: entre 2 y 60 caracteres',
  ]);
});

test('forbidNonWhitelisted: un campo extra ("rol") → 400', async () => {
  const r = await enviar({ nombre: 'Ana', email: 'ana@correo.co', edad: 30, rol: 'admin' });
  assert.equal(r.status, 400);
  assert.deepEqual((await r.json()).message, ['property rol should not exist']);
});
