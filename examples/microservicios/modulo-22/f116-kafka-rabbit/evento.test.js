// Módulo 18 · F116 · Ejecuta: node --test f116-kafka-rabbit/evento.test.js   (no necesita brokers)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearEvento, deserializar, serializar, soloUnaVez } from './evento.js';

test('el sobre lleva id único, tipo y fecha, y sobrevive al viaje como bytes', () => {
  const evento = crearEvento('pedido.creado', { pedidoId: 'P-1', total: 240000 });
  assert.match(evento.id, /^[0-9a-f-]{36}$/);
  assert.deepEqual(deserializar(serializar(evento)), evento);
  assert.notEqual(crearEvento('pedido.creado', {}).id, evento.id);
});

test('un mensaje que no es un evento se rechaza al deserializar', () => {
  assert.throws(() => deserializar(Buffer.from('{"hola":1}')), /evento sin id o sin tipo/);
  assert.throws(() => deserializar(Buffer.from('no es json')), SyntaxError);
});

test('consumidor idempotente: la reentrega del mismo evento no repite el efecto', async () => {
  const facturas = [];
  const manejar = soloUnaVez(async (e) => { facturas.push(e.datos.pedidoId); });
  const evento = crearEvento('pedido.creado', { pedidoId: 'P-1' });
  assert.equal(await manejar(evento), 'procesado');
  assert.equal(await manejar(evento), 'duplicado'); // reentrega del broker
  assert.deepEqual(facturas, ['P-1']);
});

test('si el manejador falla, el evento NO queda marcado y el reintento lo procesa', async () => {
  let intentos = 0;
  const manejar = soloUnaVez(async () => { if (++intentos === 1) throw new Error('base de datos caída'); });
  const evento = crearEvento('pedido.creado', { pedidoId: 'P-2' });
  await assert.rejects(manejar(evento), /base de datos caída/);
  assert.equal(await manejar(evento), 'procesado');
});
