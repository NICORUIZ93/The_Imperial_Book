// Módulo 26 · F160 · Tests sin infraestructura. Ejecuta: node --test f160-ecst/ecst.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { crearBus, crearCatalogo, facturacionECST, facturacionNotificacion } from './servicios.js';

test('notificación: una llamada al dueño por cada evento', async () => {
  const bus = crearBus();
  const catalogo = await crearCatalogo(bus);
  const notif = facturacionNotificacion(bus, catalogo.url);
  for (const p of [110, 120, 130]) catalogo.cambiarPrecio('TEC-1', p);
  await dormir(100);
  assert.equal(catalogo.consultas, 3);
  assert.equal(notif.precio('TEC-1'), 130);
  await catalogo.cerrar();
});

test('notificación: si el dueño está caído, el consumidor no puede actualizarse', async () => {
  const bus = crearBus();
  const catalogo = await crearCatalogo(bus);
  const notif = facturacionNotificacion(bus, catalogo.url);
  await catalogo.cerrar();
  bus.emit('notificacion', { id: 'TEC-1' });
  await dormir(100);
  assert.match(notif.errores[0], /ECONNREFUSED/);
});

test('ECST: el consumidor responde sin llamar al dueño, aunque esté caído', async () => {
  const bus = crearBus();
  const catalogo = await crearCatalogo(bus);
  const ecst = facturacionECST(bus);
  catalogo.cambiarPrecio('TEC-1', 110);
  await catalogo.cerrar();
  assert.equal(ecst.precio('TEC-1'), 110);
  assert.equal(catalogo.consultas, 0);
});

test('ECST: un evento con versión vieja no pisa uno nuevo', () => {
  const ecst = facturacionECST(crearBus());
  assert.equal(ecst.aplicar({ id: 'X', precio: 130, version: 3 }), true);
  assert.equal(ecst.aplicar({ id: 'X', precio: 120, version: 2 }), false);
  assert.equal(ecst.precio('X'), 130);
});
