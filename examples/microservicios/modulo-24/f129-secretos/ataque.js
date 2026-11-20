// Módulo 20 · F129 · La fuga: dónde aparece la clave en cada versión (código, logs, endpoint de debug) y qué pasa
// cuando el DBA la rota. Usa un proveedor en memoria para no necesitar Docker. Ejecuta: node f129-secretos/ataque.js
import { readFileSync } from 'node:fs';
import { once } from 'node:events';
import { crearBaseDeDatos } from './comun.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';
import { SecretosConCache } from './secretos.js';

const CLAVE = 'Cl4ve-Pr0d-2026';
const NUEVA = 'Rotada-2026-11';
// Hace de gestor de secretos: guarda el valor fuera del código y sabe rotarlo.
const gestor = { nombre: 'memoria', version: 1, valor: { usuario: 'app', clave: CLAVE }, async leer() { return { valor: this.valor, version: String(this.version) }; } };

async function revisar(nombre, archivo, crear) {
  const baseDeDatos = crearBaseDeDatos(CLAVE);
  const lineasDeLog = [];
  const servidor = (await crear(baseDeDatos, (linea) => lineasDeLog.push(linea))).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const debug = await fetch(`${base}/debug/config`);
  const contiene = (texto) => (texto.includes(CLAVE) ? 'SÍ' : 'no');
  console.log(`== ${nombre}`);
  console.log(`   ¿la clave está en el código (${archivo})?  ${contiene(readFileSync(new URL(archivo, import.meta.url), 'utf8'))}`);
  console.log(`   ¿la clave sale en el log de arranque?        ${contiene(lineasDeLog.join('\n'))}   log: ${lineasDeLog[0]}`);
  console.log(`   GET /debug/config                            ${debug.status}${debug.ok ? ` y la respuesta contiene la clave: ${contiene(await debug.text())}` : ''}`);
  console.log(`   GET /pedidos                                 ${(await fetch(`${base}/pedidos`)).status}`);
  baseDeDatos.rotar(NUEVA); gestor.valor = { usuario: 'app', clave: NUEVA }; gestor.version += 1; // el DBA rota la clave
  const tras = await fetch(`${base}/pedidos`);
  console.log(`   GET /pedidos tras rotar la clave             ${tras.status} ${tras.ok ? '(recargó el secreto solo)' : await tras.text()}`);
  servidor.close();
  gestor.valor = { usuario: 'app', clave: CLAVE }; gestor.version = 1; // deja el gestor como al principio
}
await revisar('ANTES (vulnerable)', './antes.js', (bd, log) => crearAntes(bd, { log }));
await revisar('DESPUÉS (seguro)', './despues.js', (bd, log) => crearDespues(bd, new SecretosConCache(gestor), { log }));
