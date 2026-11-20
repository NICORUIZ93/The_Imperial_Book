// Módulo 29 · F170 · Tests. Ejecuta: node --test f170-topologias/topologia.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CORREGIDA, INICIAL } from './ejemplo.js';
import { revisar, simularEspera } from './topologia.js';

test('la topología inicial tiene 5 problemas detectables', () => {
  const avisos = revisar(INICIAL);
  assert.equal(avisos.length, 5);
  assert.ok(avisos.includes('backend: stream-aligned sin flujo de negocio'));
  assert.ok(avisos.includes('observabilidad → checkout: un enabling interactúa por facilitación, no por x-as-a-service'));
  assert.ok(avisos.includes('plataforma ↔ checkout: colaboración sin fecha de fin'));
  assert.ok(avisos.includes('plataforma: plataforma sin consumidores x-as-a-service'));
  assert.ok(avisos.includes('plataforma: 2 colaboraciones a la vez'));
});

test('la topología corregida no tiene avisos', () => {
  assert.deepEqual(revisar(CORREGIDA), []);
});

test('una plataforma que nadie consume como servicio es un aviso', () => {
  const avisos = revisar({ equipos: [{ nombre: 'p', tipo: 'platform' }], interacciones: [] });
  assert.deepEqual(avisos, ['p: plataforma sin consumidores x-as-a-service']);
});

test('por tickets la espera crece con la cola; con autoservicio no', () => {
  const s = simularEspera({ pedidos: 10, capacidadDia: 2, minutosAutoservicio: 15 });
  assert.deepEqual(s.porTickets, { mediaDias: 3, peorDias: 5 });
  assert.equal(s.autoservicio.minutos, 15);
});
