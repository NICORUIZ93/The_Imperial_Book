// Módulo 32 · F183 · tests del gateway y del cubo de fichas: node --test f183-gateway-rate-limit/gateway.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LimitadorMemoria } from './limitador.js';
import { crearGateway } from './gateway.js';
import { cerrar, escuchar } from '../comun/http.js';
import { montarSistema } from '../f181-sistema-reservas/montaje.js';

test('cubo de fichas: ráfaga de 10, luego 2 por segundo (reloj simulado)', async () => {
  let ahora = 0;
  const l = new LimitadorMemoria({ tasa: 2, capacidad: 10, reloj: () => ahora });
  const r = []; for (let i = 0; i < 11; i++) r.push((await l.permitir('web')).permitido);
  assert.deepEqual([r.filter(Boolean).length, r[10]], [10, false]);
  assert.equal((await l.permitir('web')).reintentarEnMs, 500);
  ahora = 1000; // 1 s después: 2 fichas nuevas
  assert.deepEqual([(await l.permitir('web')).permitido, (await l.permitir('web')).permitido, (await l.permitir('web')).permitido], [true, true, false]);
  assert.equal((await l.permitir('movil')).permitido, true, 'cada cliente tiene su propio cubo');
});

test('gateway: 401 sin API key, 429 con Retry-After al agotar el cubo y reenvío a reservas', async () => {
  const s = await montarSistema();
  const g = crearGateway({ reservasUrl: s.reservasUrl, limitador: new LimitadorMemoria({ tasa: 1, capacidad: 3 }) });
  const url = await escuchar(g);
  try {
    assert.equal((await fetch(`${url}/reservas/R-1`)).status, 401);
    const estados = [];
    let ultima;
    for (let i = 0; i < 5; i++) { ultima = await fetch(`${url}/reservas/R-1`, { headers: { 'x-api-key': 'clave-web' } }); estados.push(ultima.status); }
    assert.deepEqual(estados, [404, 404, 404, 429, 429]); // 404 = llegó a reservas (R-1 no existe); 429 = lo paró el gateway
    assert.equal(ultima.headers.get('retry-after'), '1');
    assert.equal(ultima.headers.get('x-ratelimit-remaining'), '0');
  } finally { await cerrar(g); await s.cerrar(); }
});

test('gateway: si el limitador falla (Redis caído) deja pasar en lugar de tumbar el servicio', async () => {
  const s = await montarSistema();
  const g = crearGateway({ reservasUrl: s.reservasUrl, limitador: { permitir: async () => { throw new Error('ECONNREFUSED'); } } });
  const url = await escuchar(g);
  try { assert.equal((await fetch(`${url}/reservas/R-1`, { headers: { 'x-api-key': 'clave-web' } })).status, 404); }
  finally { await cerrar(g); await s.cerrar(); }
});
