// Módulo 20 · F127 · Tests SIN base de datos: una colección falsa apunta qué filtro recibiría MongoDB.
// Demuestran dónde está el fallo: en «antes» el operador del atacante llega al filtro; en «después» no llega nada.
// Ejecuta: node --test f127-nosql/filtros.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

function baseFalsa() {
  const filtros = [];
  const coleccion = {
    findOne: async (filtro) => { filtros.push(filtro); return null; },
    find: (filtro) => { filtros.push(filtro); return { toArray: async () => [] }; },
  };
  return { filtros, db: { collection: () => coleccion } };
}
async function conApp(crearApp, prueba) {
  const { filtros, db } = baseFalsa();
  const servidor = crearApp(db).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const login = (cuerpo) => fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
  try { await prueba({ base, login, filtros }); } finally { servidor.close(); }
}

test('ANTES: el operador {"$ne":null} del atacante llega tal cual al filtro de MongoDB', async () => {
  await conApp(crearAntes, async ({ login, filtros }) => {
    await login({ usuario: 'root', clave: { $ne: null } });
    assert.deepEqual(filtros, [{ usuario: 'root', clave: { $ne: null } }]);
  });
});

test('ANTES: con el parser extended, ?categoria[$ne]=x también llega como operador', async () => {
  await conApp(crearAntes, async ({ base, filtros }) => {
    await fetch(`${base}/productos?categoria[$ne]=x`);
    assert.deepEqual(filtros, [{ categoria: { $ne: 'x' } }]);
  });
});

test('DESPUÉS: un objeto en vez de texto se rechaza con 400 y la base de datos ni se consulta', async () => {
  await conApp(crearDespues, async ({ login, filtros }) => {
    for (const clave of [{ $ne: null }, { $regex: '^S' }, { $gt: '' }, ['a'], 123, null]) {
      const r = await login({ usuario: 'root', clave });
      assert.equal(r.status, 400, JSON.stringify(clave));
      assert.deepEqual((await r.json()).campos, ['clave']);
    }
    assert.equal((await login({ usuario: { $ne: null }, clave: 'x' })).status, 400);
    assert.equal((await login({ usuario: 'root', clave: 'x', rol: 'admin' })).status, 400, 'campos extra tampoco');
    assert.deepEqual(filtros, []);
  });
});

test('DESPUÉS: una entrada válida produce un filtro con $eq y sin la clave', async () => {
  await conApp(crearDespues, async ({ login, filtros }) => {
    assert.equal((await login({ usuario: 'root', clave: 'S3gura!2026' })).status, 401); // la base falsa no tiene usuarios
    assert.deepEqual(filtros, [{ usuario: { $eq: 'root' } }]);
  });
});

test('DESPUÉS: la query solo admite categorías conocidas; los corchetes ya no crean objetos', async () => {
  await conApp(crearDespues, async ({ base, filtros }) => {
    assert.equal((await fetch(`${base}/productos?categoria[$ne]=x`)).status, 400);
    assert.equal((await fetch(`${base}/productos?categoria=interno`)).status, 400);
    assert.equal((await fetch(`${base}/productos?categoria=perifericos`)).status, 200);
    assert.deepEqual(filtros, [{ categoria: { $eq: 'perifericos' } }]);
  });
});
