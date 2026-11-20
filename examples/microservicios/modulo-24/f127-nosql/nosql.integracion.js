// Módulo 20 · F127 · Test de integración contra MongoDB 9.0.8 (docker compose up -d --wait).
// Ejecuta: node --test f127-nosql/nosql.integracion.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { conectar, sembrar } from './datos.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

let cliente; let db;
before(async () => { ({ cliente, db } = await conectar('tienda_f127_test')); await sembrar(db); });
after(async () => { await db.dropDatabase(); await cliente.close(); });

async function loginEn(crearApp, cuerpo) {
  const servidor = crearApp(db).listen(0);
  await once(servidor, 'listening');
  const r = await fetch(`http://127.0.0.1:${servidor.address().port}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
  servidor.close();
  return { status: r.status, cuerpo: await r.json() };
}

test('ANTES: {"$ne":null} entra como root sin conocer la clave', async () => {
  const r = await loginEn(crearAntes, { usuario: 'root', clave: { $ne: null } });
  assert.deepEqual(r, { status: 200, cuerpo: { bienvenido: 'root', rol: 'admin' } });
});

test('DESPUÉS: el mismo ataque recibe 400 y la clave correcta sigue entrando', async () => {
  assert.equal((await loginEn(crearDespues, { usuario: 'root', clave: { $ne: null } })).status, 400);
  assert.equal((await loginEn(crearDespues, { usuario: 'root', clave: 'incorrecta' })).status, 401);
  assert.deepEqual(await loginEn(crearDespues, { usuario: 'root', clave: 'S3gura!2026' }), { status: 200, cuerpo: { bienvenido: 'root', rol: 'admin' } });
});
