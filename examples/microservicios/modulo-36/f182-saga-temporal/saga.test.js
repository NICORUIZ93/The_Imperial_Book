// Módulo 32 · F182 · tests de la saga (sin servidor de Temporal): node --test f182-saga-temporal/saga.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sagaReserva } from './saga.js';
import { crearActividades } from './actividades.js';
import { conReintentos } from './orquestador-local.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';
import { crearRepositorio } from '../f181-sistema-reservas/repositorio.js';
import { crearProveedor } from '../f181-sistema-reservas/proveedor-pagos.js';
import { cerrar, escuchar } from '../comun/http.js';

async function montar(opciones = {}, aforo = 1) {
  const { servidor, stats } = crearProveedor(opciones);
  const pagosUrl = await escuchar(servidor);
  const inventario = crearInventario({ 'concierto-1': aforo });
  const repo = crearRepositorio();
  const act = conReintentos(crearActividades({ inventario, repo, pagosUrl }), { inicialMs: 10, intentos: 20 });
  return { act, inventario, repo, stats, cerrar: () => cerrar(servidor) };
}
const reserva = (id, extra = {}) => ({ reservaId: id, eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK', ...extra });

test('camino feliz: plaza reservada, cobro aprobado y reserva confirmada', async () => {
  const m = await montar();
  try {
    const r = await sagaReserva(reserva('R-1'), m.act);
    assert.deepEqual([r.estado, r.hechos], ['CONFIRMADA', ['reservarPlaza', 'cobrar', 'confirmar']]);
    assert.equal(m.inventario.libres('concierto-1'), 0);
    assert.equal(m.repo.obtener('R-1').cobroId, 'CB-R-1');
  } finally { await m.cerrar(); }
});

test('tarjeta rechazada (402, no reintentable): se libera la plaza y no se cobra nada', async () => {
  const m = await montar();
  try {
    const r = await sagaReserva(reserva('R-2', { tarjeta: '4000-RECHAZAR' }), m.act);
    assert.deepEqual([r.estado, r.compensadas], ['CANCELADA', ['liberarPlaza']]);
    assert.match(r.motivo, /tarjeta rechazada/);
    assert.equal(m.inventario.libres('concierto-1'), 1);
    assert.equal(m.stats.peticiones, 1); // el 402 no se reintenta
  } finally { await m.cerrar(); }
});

test('falla el último paso: reembolso y liberación, en orden inverso', async () => {
  const m = await montar();
  try {
    const r = await sagaReserva(reserva('R-3', { fallarAlConfirmar: true }), m.act);
    assert.deepEqual(r.compensadas, ['reembolsar', 'liberarPlaza']);
    assert.deepEqual([m.stats.cobros, m.stats.reembolsos], [1, 1]);
  } finally { await m.cerrar(); }
});

test('sin plazas: la saga termina CANCELADA sin tocar al proveedor', async () => {
  const m = await montar();
  try {
    await sagaReserva(reserva('R-4'), m.act);
    const r = await sagaReserva(reserva('R-5'), m.act);
    assert.deepEqual([r.estado, r.motivo, r.compensadas], ['CANCELADA', 'sin plazas en concierto-1', []]);
  } finally { await m.cerrar(); }
});

test('un 429 del proveedor se reintenta con backoff hasta cobrar, y nunca se cobra dos veces', async () => {
  const m = await montar({ limiteRps: 1 }, 3);
  try {
    const rs = await Promise.all(['R-6', 'R-7', 'R-8'].map((id) => sagaReserva(reserva(id), m.act)));
    assert.deepEqual(rs.map((r) => r.estado), ['CONFIRMADA', 'CONFIRMADA', 'CONFIRMADA']);
    assert.ok(m.stats.rechazados429 >= 2, `429 recibidos: ${m.stats.rechazados429}`);
    assert.equal(m.stats.cobros, 3);
  } finally { await m.cerrar(); }
});
