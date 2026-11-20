// Módulo 18 · F118 · Ejecuta: node --test f118-sync-async/comparar.test.js
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { cola, notificar, pedidosAsincrono, pedidosSincrono, servicio } from './servicios.js';

let pagos;
let notificaciones;
before(async () => { pagos = await servicio('pagos', 20); notificaciones = await servicio('notificaciones', 150); });
beforeEach(() => { pagos.caido = false; notificaciones.caido = false; notificaciones.atendidas = 0; });
after(() => { pagos.cerrar(); notificaciones.cerrar(); });

test('síncrono: la latencia del cliente es la SUMA de la cadena', async () => {
  const r = await pedidosSincrono({ pagos, notificaciones })('P-1');
  assert.equal(r.status, 201);
  assert.ok(r.ms >= 170, `tardó ${r.ms} ms`); // 20 + 150
});

test('asíncrono: el cliente no espera a notificaciones', async () => {
  const eventos = cola();
  const r = await pedidosAsincrono({ pagos, eventos })('P-1');
  assert.equal(r.status, 201);
  assert.ok(r.ms < 150, `tardó ${r.ms} ms`);
  assert.equal(eventos.pendientes.length, 1);
});

test('síncrono: si cae notificaciones, falla el pedido (aunque el cobro ya se hizo)', async () => {
  notificaciones.caido = true;
  const atendidasAntes = pagos.atendidas;
  const r = await pedidosSincrono({ pagos, notificaciones })('P-2');
  assert.equal(r.status, 503);
  assert.equal(r.error, 'notificaciones respondió 503');
  assert.equal(pagos.atendidas, atendidasAntes + 1); // ¡cobrado y sin pedido!: inconsistencia
});

test('asíncrono: si cae notificaciones, el pedido se crea y el evento espera en la cola', async () => {
  notificaciones.caido = true;
  const eventos = cola();
  assert.equal((await pedidosAsincrono({ pagos, eventos })('P-3')).status, 201);
  assert.equal(await eventos.procesar(notificar(notificaciones)), 0); // el worker falla y NO pierde el mensaje
  assert.equal(eventos.pendientes.length, 1);
  notificaciones.caido = false; // se recupera
  assert.equal(await eventos.procesar(notificar(notificaciones)), 1);
  assert.equal(notificaciones.atendidas, 1);
  assert.equal(eventos.pendientes.length, 0);
});

test('lo asíncrono no arregla una dependencia que necesitas para decidir: sin pagos no hay pedido', async () => {
  pagos.caido = true;
  const eventos = cola();
  assert.equal((await pedidosAsincrono({ pagos, eventos })('P-4')).status, 503);
  assert.equal(eventos.pendientes.length, 0); // no se anuncia un pedido que no existe
});
