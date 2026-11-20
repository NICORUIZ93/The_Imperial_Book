// Módulo 18 · F115 · Ejecuta: node --test f115-graphql/esquema.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearServicios } from './datos.js';
import { crearContexto, crearServidor } from './esquema.js';

// executeOperation ejecuta la operación sin abrir un puerto: ideal para tests.
async function ejecutar(query, { variables, ingenuo = false } = {}) {
  const servicios = crearServicios();
  const servidor = crearServidor({ ingenuo });
  const { body } = await servidor.executeOperation({ query, variables }, { contextValue: crearContexto(servicios) });
  await servidor.stop();
  // El resultado usa objetos sin prototipo; pasarlo por JSON deja objetos normales, como los vería un cliente HTTP.
  return { ...JSON.parse(JSON.stringify(body.singleResult)), llamadas: servicios.llamadas };
}

test('el cliente pide solo los campos que necesita', async () => {
  const { data, errors } = await ejecutar('{ pedido(id: "P-1") { total } }');
  assert.equal(errors, undefined);
  assert.deepEqual(data, { pedido: { total: 240000 } });
});

test('una sola consulta trae el pedido Y su cliente (dos servicios, un viaje)', async () => {
  const { data, llamadas } = await ejecutar('query($id: ID!) { pedido(id: $id) { id cliente { nombre email } } }', { variables: { id: 'P-2' } });
  assert.deepEqual(data, { pedido: { id: 'P-2', cliente: { nombre: 'Luis', email: 'luis@correo.co' } } });
  assert.deepEqual(llamadas, { pedidos: 1, clientes: 1 });
});

test('si no pides «cliente», su resolver no se ejecuta', async () => {
  const { llamadas } = await ejecutar('{ pedidos { id total } }');
  assert.equal(llamadas.clientes, 0);
});

test('N+1: resolvers ingenuos llaman a clientes una vez por pedido; DataLoader, una sola', async () => {
  const query = '{ pedidos { id cliente { nombre } } }';
  assert.equal((await ejecutar(query, { ingenuo: true })).llamadas.clientes, 3);
  assert.equal((await ejecutar(query)).llamadas.clientes, 1);
});

test('una consulta que no cumple el esquema se rechaza ANTES de ejecutar nada', async () => {
  const { data, errors, llamadas } = await ejecutar('{ pedido(id: "P-1") { nombre } }');
  assert.equal(data, undefined);
  assert.equal(errors[0].message, 'Cannot query field "nombre" on type "Pedido".');
  assert.equal(errors[0].extensions.code, 'GRAPHQL_VALIDATION_FAILED');
  assert.deepEqual(llamadas, { pedidos: 0, clientes: 0 });
});

test('un error de negocio viaja en «errors» con su código en extensions', async () => {
  const { data, errors } = await ejecutar('mutation { crearPedido(clienteId: "C-1", total: 0) { id } }');
  assert.equal(data, null);
  assert.equal(errors[0].message, 'El total debe ser mayor que cero');
  assert.deepEqual(errors[0].extensions, { code: 'BAD_USER_INPUT', campo: 'total' });
});

test('mutación válida', async () => {
  const { data } = await ejecutar('mutation { crearPedido(clienteId: "C-2", total: 1000) { id cliente { nombre } } }');
  assert.deepEqual(data, { crearPedido: { id: 'P-4', cliente: { nombre: 'Luis' } } });
});
