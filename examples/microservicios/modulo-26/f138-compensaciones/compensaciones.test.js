// Módulo 22 · F138 · Verificación: las compensaciones se pueden repetir y llegar desordenadas sin dañar el saldo.
// Ejecuta: node --test f138-compensaciones/compensaciones.test.js   (sin infraestructura)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PagosService } from './pagos.js';
import { redQuePierde, compensarConReintentos } from './red.js';
import { PagosIngenuo } from './error-comun.js';

test('reembolsar dos veces devuelve el dinero UNA vez', () => {
  const p = new PagosService();
  p.cobrar('S-1', 'ana', 300);
  assert.equal(p.reembolsar('S-1').estado, 'REEMBOLSADO');
  assert.deepEqual(p.reembolsar('S-1'), { estado: 'REEMBOLSADO', repetido: true });
  assert.equal(p.saldo.get('ana'), 1000);
  assert.deepEqual(p.operaciones, ['cobro S-1 -300', 'reembolso S-1 +300']);
});

test('respuestas perdidas: el coordinador reintenta y el efecto se aplica una sola vez', async () => {
  const p = new PagosService();
  p.cobrar('S-1', 'ana', 300);
  const r = await compensarConReintentos(() => redQuePierde(p, { perderRespuestas: 0 }).reembolsar('S-1'));
  assert.equal(r.estado, 'REEMBOLSADO');
  const remoto = redQuePierde(p, { perderRespuestas: 3 });
  await compensarConReintentos(() => remoto.reembolsar('S-1'));
  assert.equal(p.saldo.get('ana'), 1000);
  assert.equal(p.operaciones.filter((o) => o.startsWith('reembolso')).length, 1);
});

test('compensar antes de la acción deja una lápida: el cobro tardío se rechaza', () => {
  const p = new PagosService();
  assert.equal(p.reembolsar('S-2').estado, 'SIN_COBRO');
  assert.equal(p.cobrar('S-2', 'ana', 200).estado, 'RECHAZADO');
  assert.equal(p.saldo.get('ana'), 1000);
});

test('la acción también es idempotente: reintentar el cobro no cobra dos veces', () => {
  const p = new PagosService();
  p.cobrar('S-3', 'ana', 100);
  assert.equal(p.cobrar('S-3', 'ana', 100).repetido, true);
  assert.equal(p.saldo.get('ana'), 900);
});

test('si la compensación nunca responde, se escala a revisión manual (no se reintenta para siempre)', async () => {
  const remoto = redQuePierde(new PagosService(), { perderRespuestas: 99 });
  await assert.rejects(compensarConReintentos(() => remoto.reembolsar('S-4'), { intentos: 3 }), /revisión manual/);
});

test('error común: la compensación con delta e id nuevo devuelve el dinero tantas veces como reintentos', async () => {
  const p = new PagosIngenuo();
  const remoto = redQuePierde(p, { perderRespuestas: 2 });
  await compensarConReintentos(() => remoto.reembolsar('S-1', 'ana', 300));
  assert.equal(p.saldo.get('ana'), 1600);
});
