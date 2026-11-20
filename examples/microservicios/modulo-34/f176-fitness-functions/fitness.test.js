// Módulo 30 · F176 · Las fitness functions como tests: se ejecutan en cada build y la rompen si la arquitectura se degrada.
// Ejecuta: node --test f176-fitness-functions/fitness.test.js
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { ciclosEntreServicios, grafoDeImportaciones, presupuestoLatencia, sinInternosAjenos } from './fitness.js';

const aqui = import.meta.dirname;
const ok = grafoDeImportaciones(join(aqui, 'ejemplo-ok'));
const roto = grafoDeImportaciones(join(aqui, 'ejemplo-roto'));

test('FF1 · ejemplo-ok: ningún servicio importa internos de otro', () => {
  assert.deepEqual(sinInternosAjenos(ok), []);
});

test('FF1 · ejemplo-roto: detecta los tres accesos indebidos (dos estáticos y uno dinámico)', () => {
  assert.deepEqual(sinInternosAjenos(roto).sort(), [
    'servicios/envios/index.js → servicios/pagos/interno/tarifas.js', // import() dinámico
    'servicios/pagos/api/cliente.js → servicios/pedidos/index.js', // pedidos no tiene api/: todo es interno
    'servicios/pedidos/index.js → servicios/pagos/interno/tarifas.js',
  ]);
});

test('FF2 · ciclos: ninguno en ejemplo-ok; pagos ↔ pedidos en ejemplo-roto', () => {
  assert.deepEqual(ciclosEntreServicios(ok), []);
  assert.deepEqual(ciclosEntreServicios(roto), ['pagos → pedidos → pagos']);
});

test('FF3 · presupuesto de latencia: p95 ≤ 50 ms cumple; un endpoint de 80 ms no', async () => {
  const servidor = (retardo) => new Promise((listo) => {
    const s = createServer(async (_req, res) => { await dormir(retardo); res.end('{}'); });
    s.listen(0, '127.0.0.1', () => listo(s));
  });
  const [rapido, lento] = await Promise.all([servidor(0), servidor(80)]);
  const url = (s) => `http://127.0.0.1:${s.address().port}/`;
  assert.equal((await presupuestoLatencia(url(rapido), { n: 40, p95MaxMs: 50 })).cumple, true);
  assert.equal((await presupuestoLatencia(url(lento), { n: 10, p95MaxMs: 50 })).cumple, false);
  for (const s of [rapido, lento]) { s.closeAllConnections(); s.close(); }
});
