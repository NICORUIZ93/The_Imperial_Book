// Módulo 22 · F136 · Verificación contra un Redis real (REDIS_URL). Si no responde, se OMITE (o FALLA con EXIGIR_INFRA=1).
// Ejecuta: node --test f136-dedup-redis/dedup.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from 'redis';
import { REDIS_URL } from '../comun/config.js';
import { omitirSinInfra } from '../comun/infra.js';
import { procesarUnaVez, EnCursoEnOtroLado } from './dedup.js';
import { procesarUnaVezMal } from './error-comun.js';

const skip = await omitirSinInfra('Redis', REDIS_URL, 6379);
let redis;
const id = () => `t-${process.pid}-${Math.random().toString(36).slice(2)}`;
before(async () => { if (!skip) redis = await createClient({ url: REDIS_URL }).connect(); });
after(async () => { await redis?.close(); });

test('la segunda entrega del mismo messageId se descarta', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  let veces = 0;
  assert.equal((await procesarUnaVez(redis, m, async () => ++veces)).estado, 'procesado');
  assert.equal((await procesarUnaVez(redis, m, async () => ++veces)).estado, 'duplicado');
  assert.equal(veces, 1);
});

test('10 entregas SIMULTÁNEAS: SET NX deja pasar exactamente una', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  let veces = 0;
  const lento = async () => { veces++; await new Promise((r) => setTimeout(r, 50)); };
  const r = await Promise.allSettled(Array.from({ length: 10 }, () => procesarUnaVez(redis, m, lento)));
  assert.equal(veces, 1);
  assert.equal(r.filter((x) => x.status === 'fulfilled').length, 1);
  assert.ok(r.filter((x) => x.status === 'rejected').every((x) => x.reason instanceof EnCursoEnOtroLado));
});

test('si el trabajo falla, la clave se borra y la reentrega SÍ se procesa', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  await assert.rejects(procesarUnaVez(redis, m, async () => { throw new Error('cobro caído'); }), /cobro caído/);
  assert.equal((await procesarUnaVez(redis, m, async () => 'ok')).estado, 'procesado');
});

test('la marca «hecho» tiene caducidad: la ventana de deduplicación no crece para siempre', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  await procesarUnaVez(redis, m, async () => {}, { ttlHechoSeg: 60 });
  const ttl = await redis.ttl(`dedup:test:${m.messageId}`);
  assert.ok(ttl > 0 && ttl <= 60, `TTL=${ttl}`);
});

test('error común: GET y luego SET (no atómico) deja pasar varias copias simultáneas', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  let veces = 0;
  await Promise.all(Array.from({ length: 10 }, () => procesarUnaVezMal(redis, m, async () => { veces++; })));
  assert.ok(veces > 1, `procesado ${veces} veces`);
});
