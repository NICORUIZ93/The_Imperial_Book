// Módulo 32 · F181 · tests del sistema de reservas: node --test f181-sistema-reservas/reservas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esperarFinal, montarSistema } from './montaje.js';

const post = (url, cuerpo, clave) => fetch(`${url}/reservas`, { method: 'POST', body: JSON.stringify(cuerpo),
  headers: { 'content-type': 'application/json', ...(clave ? { 'idempotency-key': clave } : {}) } });
const base = { eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' };

test('POST /reservas responde 202 con Location y la reserva acaba CONFIRMADA', async () => {
  const s = await montarSistema();
  try {
    const r = await post(s.reservasUrl, base, 'k1');
    assert.equal(r.status, 202);
    assert.equal(r.headers.get('location'), '/reservas/R-k1');
    assert.equal((await r.json()).estado, 'PENDIENTE');
    assert.equal((await esperarFinal(s.reservasUrl, 'R-k1')).estado, 'CONFIRMADA');
  } finally { await s.cerrar(); }
});

test('validación: sin importe positivo responde 400', async () => {
  const s = await montarSistema();
  try { assert.equal((await post(s.reservasUrl, { ...base, importe: 0 })).status, 400); } finally { await s.cerrar(); }
});

test('el mismo POST con la misma Idempotency-Key no cobra dos veces', async () => {
  const s = await montarSistema();
  try {
    await post(s.reservasUrl, base, 'k2'); await post(s.reservasUrl, base, 'k2');
    await esperarFinal(s.reservasUrl, 'R-k2');
    assert.equal(s.stats.cobros, 1);
  } finally { await s.cerrar(); }
});

test('GET de una reserva que no existe: 404', async () => {
  const s = await montarSistema();
  try { assert.equal((await fetch(`${s.reservasUrl}/reservas/R-nada`)).status, 404); } finally { await s.cerrar(); }
});
