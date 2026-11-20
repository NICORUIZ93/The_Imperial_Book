// Módulo 27 · F163 · tests: node --test f163-vault/vault.test.js
// Sin variables usa BdMemoria. Con PGURL=postgres://vault_admin:solo-dev-vault@127.0.0.1:5432/tienda ejecuta además el
// SQL de verdad en PostgreSQL (CREATE ROLE … VALID UNTIL, login real, DROP ROLE) con un lease de 2 s.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as esperar } from 'node:timers/promises';
import { BdMemoria, BdPostgres } from './bd.js';
import { crearDobleVault } from './doble-vault.js';
import { ClienteVault, CredencialesDinamicas } from './despues.js';
import { conectarAntes, SQL_ANTES } from './antes.js';
import { ROL_PEDIDOS } from './rol.js';
import { escuchar } from '../comun/cliente.js';

async function montar(bd, rol = ROL_PEDIDOS, reloj) {
  const doble = crearDobleVault({ bd, reloj });
  const v = await escuchar(doble);
  await fetch(`http://127.0.0.1:${v.puerto}/v1/database/roles/pedidos`, { method: 'POST', headers: { 'X-Vault-Token': 'root' }, body: JSON.stringify(rol) });
  return { doble, v, vault: new ClienteVault({ direccion: `http://127.0.0.1:${v.puerto}`, token: 'root' }) };
}

test('ANTES: la credencial estática filtrada sigue sirviendo 30 días después', async () => {
  const bd = new BdMemoria();
  await bd.ejecutar(SQL_ANTES);
  assert.equal((await conectarAntes(bd, 'atacante', Date.now() + 30 * 86400_000)).ok, true);
});

test('DESPUÉS: cada instancia recibe un usuario distinto con lease de 1 h', async () => {
  const { v, vault } = await montar(new BdMemoria());
  const a = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  const b = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  assert.notEqual(a.usuario, b.usuario);
  assert.match(a.usuario, /^v-pedidos-/);
  assert.equal(a.duracion, 3600);
  await a.cerrar(); await b.cerrar(); await v.cerrar();
});

test('DESPUÉS: al caducar el lease el login falla y el rol desaparece', async () => {
  let ahora = Date.now();
  const bd = new BdMemoria();
  const { doble, v, vault } = await montar(bd, ROL_PEDIDOS, () => ahora);
  const c = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  assert.equal(await bd.login(c.usuario, c.clave, ahora), true);
  ahora += 3600_000;
  await doble.caducar();
  assert.equal(await bd.login(c.usuario, c.clave, ahora), false);
  clearTimeout(c.temporizador); await v.cerrar();
});

test('DESPUÉS: revocar el lease corta la credencial al momento', async () => {
  const bd = new BdMemoria();
  const { v, vault } = await montar(bd);
  const c = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  await c.cerrar();
  assert.equal(await bd.login(c.usuario, c.clave), false);
  await v.cerrar();
});

test('PostgreSQL real (PGURL): VALID UNTIL corta el login y la revocación borra el rol', { skip: !process.env.PGURL && 'sin PGURL: solo BdMemoria' }, async () => {
  const bd = new BdPostgres(process.env.PGURL);
  const { v, vault } = await montar(bd, { ...ROL_PEDIDOS, default_ttl: 2 });
  const c = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  clearTimeout(c.temporizador); // sin renovar: que caduque
  assert.equal(await bd.login(c.usuario, c.clave), true, 'recién creada debe entrar');
  await esperar(3000);
  assert.equal(await bd.login(c.usuario, c.clave), false, 'pasado VALID UNTIL PostgreSQL debe rechazarla');
  await vault.revocar(c.leaseId);
  await v.cerrar();
});
