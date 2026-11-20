// Módulo 19 · F122 · Tests de los timeouts con un servidor lento local (sin infraestructura).
// Ejecuta: node --test f122-timeouts/con-timeout.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { CABECERA, fetchConTimeout, presupuestoDe } from './con-timeout.js';

let servidor; let url; const cerradas = [];
before(async () => {
  // /lento?ms=N responde tras N ms; /goteo manda las cabeceras ya y el cuerpo 1 s después.
  servidor = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    res.on('close', () => { if (!res.writableFinished) cerradas.push(u.pathname); }); // el cliente cortó antes de tiempo
    if (u.pathname === '/goteo') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.write('{"sku":');
      setTimeout(() => res.end('"7"}'), 1000);
      return;
    }
    setTimeout(() => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"ok":true}'); }, Number(u.searchParams.get('ms') ?? 0));
  }).listen(0);
  await once(servidor, 'listening');
  url = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => { servidor.close(); servidor.closeAllConnections(); });

test('si responde dentro del límite devuelve status y cuerpo', async () => {
  assert.deepEqual(await fetchConTimeout(`${url}/lento?ms=20`, { timeoutMs: 500 }), { status: 200, cuerpo: { ok: true } });
});

test('si tarda más que el límite lanza TimeoutError cerca del límite y CIERRA la conexión', async () => {
  const inicio = performance.now();
  await assert.rejects(fetchConTimeout(`${url}/lento?ms=2000`, { timeoutMs: 200 }), { name: 'TimeoutError' });
  const tardo = performance.now() - inicio;
  assert.ok(tardo >= 190 && tardo < 600, `tardó ${tardo} ms`);
  await new Promise((ok) => setTimeout(ok, 50));
  assert.ok(cerradas.includes('/lento'), 'el servidor debe ver la conexión cerrada por el cliente');
});

test('el límite cubre también el cuerpo: cabeceras rápidas y cuerpo lento también vencen', async () => {
  await assert.rejects(fetchConTimeout(`${url}/goteo`, { timeoutMs: 200 }), { name: 'TimeoutError' });
});

test('la señal del llamador también cancela, con AbortError', async () => {
  const control = new AbortController();
  setTimeout(() => control.abort(), 50);
  await assert.rejects(fetchConTimeout(`${url}/lento?ms=2000`, { timeoutMs: 5000, signal: control.signal }), { name: 'AbortError' });
});

test('presupuesto: usa la cabecera, aplica el máximo y descuenta el tiempo que pasa', async () => {
  assert.equal(presupuestoDe({}, { porDefectoMs: 1000 }).total, 1000);
  assert.equal(presupuestoDe({ [CABECERA]: '400' }).total, 400);
  assert.equal(presupuestoDe({ [CABECERA]: '3600000' }, { maximoMs: 10_000 }).total, 10_000);
  assert.equal(presupuestoDe({ [CABECERA]: 'abc' }, { porDefectoMs: 700 }).total, 700);
  const p = presupuestoDe({ [CABECERA]: '300' });
  await new Promise((ok) => setTimeout(ok, 100));
  assert.ok(p.restante() <= 205 && p.restante() >= 150, `restante ${p.restante()}`);
  assert.ok(p.paraLlamar(50) <= 155);
  await new Promise((ok) => setTimeout(ok, 250));
  assert.equal(p.restante(), 0);
  assert.equal(p.paraLlamar(), 1, 'nunca 0: AbortSignal.timeout(0) vencería igual, pero 1 lo deja explícito');
});
