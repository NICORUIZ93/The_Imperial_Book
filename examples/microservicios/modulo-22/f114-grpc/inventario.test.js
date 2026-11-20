// Módulo 18 · F114 · Ejecuta: node --test f114-grpc/inventario.test.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { crearCliente } from './cliente.js';
import { grpc } from './contrato.js';
import { iniciarServidor } from './servidor.js';

let servidor;
let cliente;
before(async () => {
  servidor = await iniciarServidor(0);
  cliente = crearCliente(`127.0.0.1:${servidor.puerto}`);
});
after(async () => { cliente.cerrar(); await servidor.detener(); });

test('llamada unaria: los campos snake_case del .proto llegan en camelCase', async () => {
  assert.deepEqual(await cliente.consultar('TEC-1'), { sku: 'TEC-1', disponibles: 12, bodegaOrigen: 'BOG-1' });
});

test('un valor por defecto (0) llega aunque no viaje por el cable', async () => {
  assert.equal((await cliente.consultar('MOU-2')).disponibles, 0);
});

test('error de negocio → código NOT_FOUND', async () => {
  await assert.rejects(cliente.consultar('NO-HAY'), { code: grpc.status.NOT_FOUND, details: 'No existe el SKU NO-HAY' });
});

test('deadline: el cliente deja de esperar y recibe DEADLINE_EXCEEDED', async () => {
  const inicio = performance.now();
  await assert.rejects(cliente.consultar('LENTO', { plazoMs: 200 }), { code: grpc.status.DEADLINE_EXCEEDED });
  assert.ok(performance.now() - inicio < 1000);
});

test('streaming de servidor: llegan 3 mensajes en orden', async () => {
  const recibidos = [];
  for await (const e of cliente.seguir('TEC-1')) recibidos.push(e.disponibles);
  assert.deepEqual(recibidos, [12, 11, 10]);
});

test('servidor apagado → UNAVAILABLE', async () => {
  const sinServidor = crearCliente('127.0.0.1:1');
  await assert.rejects(sinServidor.consultar('TEC-1', { plazoMs: 2000 }), { code: grpc.status.UNAVAILABLE });
  sinServidor.cerrar();
});
