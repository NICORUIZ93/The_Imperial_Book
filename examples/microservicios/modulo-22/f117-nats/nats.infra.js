// Módulo 18 · F117 · Test contra NATS real. Ejecuta: docker compose up -d --wait && node --test f117-nats/nats.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { conectar, pedir, publicar, responder, suscribir } from './nats.js';

const p = `test${process.pid}`; // prefijo propio para no mezclarse con otros clientes del servidor
let nc;
before(async () => { nc = await conectar('test'); });
after(async () => { await nc.drain(); });

test('comodines: «*» cubre un tramo y «>» todos los que siguen', async () => {
  const uno = [];
  const todos = [];
  const s1 = suscribir(nc, `${p}.pedidos.*`, (_d, subject) => uno.push(subject.replace(`${p}.`, '')));
  const s2 = suscribir(nc, `${p}.>`, (_d, subject) => todos.push(subject.replace(`${p}.`, '')));
  await nc.flush();
  publicar(nc, `${p}.pedidos.creado`, {});
  publicar(nc, `${p}.pedidos.creado.urgente`, {});
  publicar(nc, `${p}.pagos.aprobado`, {});
  await nc.flush();
  await dormir(100);
  assert.deepEqual(uno, ['pedidos.creado']);
  assert.deepEqual(todos, ['pedidos.creado', 'pedidos.creado.urgente', 'pagos.aprobado']);
  s1.unsubscribe(); // si «>» siguiera activa, contaría como oyente de CUALQUIER subject de los tests siguientes
  s2.unsubscribe();
});

test('grupo de cola: cada mensaje lo recibe UN solo miembro; sin grupo, todos', async () => {
  const porWorker = { A: 0, B: 0 };
  let auditoria = 0;
  suscribir(nc, `${p}.tareas`, () => { porWorker.A += 1; }, { grupo: 'workers' });
  suscribir(nc, `${p}.tareas`, () => { porWorker.B += 1; }, { grupo: 'workers' });
  suscribir(nc, `${p}.tareas`, () => { auditoria += 1; });
  await nc.flush();
  for (let i = 0; i < 20; i++) publicar(nc, `${p}.tareas`, { i });
  await nc.flush();
  await dormir(100);
  assert.equal(porWorker.A + porWorker.B, 20);
  assert.equal(auditoria, 20);
});

test('petición/respuesta', async () => {
  responder(nc, `${p}.inventario.consultar`, ({ sku }) => ({ sku, disponibles: 12 }));
  await nc.flush();
  assert.deepEqual(await pedir(nc, `${p}.inventario.consultar`, { sku: 'TEC-1' }), { sku: 'TEC-1', disponibles: 12 });
});

test('petición sin nadie que responda: falla enseguida con «no responders»', async () => {
  const inicio = performance.now();
  await assert.rejects(pedir(nc, `${p}.nadie.escucha`, {}, { timeoutMs: 2000 }), { name: 'RequestError', message: /no responders/ });
  assert.ok(performance.now() - inicio < 1000);
});

test('petición con un oyente que nunca responde: se agota el tiempo (TimeoutError)', async () => {
  const mudo = suscribir(nc, `${p}.mudo`, () => {}); // escucha, pero no llama a respond()
  await nc.flush();
  await assert.rejects(pedir(nc, `${p}.mudo`, {}, { timeoutMs: 300 }), { name: 'TimeoutError' });
  mudo.unsubscribe();
});

test('NATS core no guarda mensajes: lo publicado sin suscriptores se pierde', async () => {
  publicar(nc, `${p}.avisos`, { n: 1 }); // nadie escucha todavía
  await nc.flush();
  const recibidos = [];
  suscribir(nc, `${p}.avisos`, (d) => recibidos.push(d.n));
  await nc.flush();
  publicar(nc, `${p}.avisos`, { n: 2 });
  await nc.flush();
  await dormir(100);
  assert.deepEqual(recibidos, [2]);
});
