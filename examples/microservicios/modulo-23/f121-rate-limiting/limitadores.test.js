// Módulo 19 · F121 · Tests de los limitadores contra Redis de verdad (el del laboratorio, a través de Toxiproxy).
// Ejecuta con la infraestructura arriba: node --test f121-rate-limiting/limitadores.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { setTimeout as dormir } from 'node:timers/promises';
import { conectarRedis, cubetaDeTokens, ventanaFija } from './limitadores.js';
import { crearApp } from './servicio.js';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:26379';
const unico = (nombre) => `${nombre}-${process.pid}-${Date.now()}`;
let redis;
before(async () => { redis = await conectarRedis(REDIS_URL); });
after(async () => { await redis.destroy(); });

test('ventana fija: permite `limite` peticiones y rechaza la siguiente diciendo cuánto esperar', async () => {
  const clave = unico('vf');
  const resultados = [];
  for (let i = 0; i < 4; i += 1) resultados.push(await ventanaFija(redis, clave, { limite: 3, ventanaMs: 2000 }));
  assert.deepEqual(resultados.map((r) => r.permitido), [true, true, true, false]);
  assert.deepEqual(resultados.map((r) => r.restantes), [2, 1, 0, 0]);
  assert.ok(resultados[3].reintentarEnMs > 0 && resultados[3].reintentarEnMs <= 2000);
});

test('ventana fija: la clave SIEMPRE tiene caducidad y el contador se reinicia al vencer', async () => {
  const clave = unico('vf');
  await ventanaFija(redis, clave, { limite: 1, ventanaMs: 300 });
  assert.ok((await redis.pTTL(`vf:${clave}`)) > 0, 'la clave debe tener TTL');
  assert.equal((await ventanaFija(redis, clave, { limite: 1, ventanaMs: 300 })).permitido, false);
  await dormir(350);
  assert.equal((await ventanaFija(redis, clave, { limite: 1, ventanaMs: 300 })).permitido, true);
});

test('cubeta de tokens: admite la ráfaga inicial y luego el ritmo de recarga', async () => {
  const clave = unico('ct');
  const opciones = { capacidad: 3, porSegundo: 10 }; // 1 ficha nueva cada 100 ms
  const rafaga = [];
  for (let i = 0; i < 5; i += 1) rafaga.push((await cubetaDeTokens(redis, clave, opciones)).permitido);
  assert.deepEqual(rafaga, [true, true, true, false, false]);
  await dormir(250); // se recargan 2 fichas
  const despues = [];
  for (let i = 0; i < 3; i += 1) despues.push((await cubetaDeTokens(redis, clave, opciones)).permitido);
  assert.deepEqual(despues, [true, true, false]);
});

test('API: dos clientes tienen contadores separados y el 429 trae Retry-After', async () => {
  const salida = console.log; console.log = () => {};
  const { app, redis: r } = await crearApp({ redisUrl: REDIS_URL, limite: 2, ventanaS: 5 });
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  const url = `http://127.0.0.1:${servidor.address().port}/api/ofertas`;
  const pedir = (cliente) => fetch(url, { headers: { 'x-api-key': cliente } });
  const [ana, luis] = [unico('ana'), unico('luis')];
  assert.equal((await pedir(ana)).status, 200);
  const segunda = await pedir(ana);
  assert.equal(segunda.headers.get('ratelimit-remaining'), '0');
  const tercera = await pedir(ana);
  assert.equal(tercera.status, 429);
  assert.ok(Number(tercera.headers.get('retry-after')) >= 1);
  assert.equal((await pedir(luis)).status, 200, 'el límite de Ana no afecta a Luis');
  servidor.close(); servidor.closeAllConnections(); await r.destroy(); console.log = salida;
});
