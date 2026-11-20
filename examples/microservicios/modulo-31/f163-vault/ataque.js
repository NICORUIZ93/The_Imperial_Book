// Módulo 27 · F163 · la misma credencial filtrada contra ANTES (estática) y DESPUÉS (dinámica de Vault).
// Línea de tiempo simulada con un reloj: el día 0 una credencial acaba en un log que el atacante lee.
// Sin Docker usa BdMemoria + el doble de Vault; con PGURL=postgres://… usa PostgreSQL real para el login.
// Ejecuta: node f163-vault/ataque.js
import { BdMemoria } from './bd.js';
import { crearDobleVault } from './doble-vault.js';
import { ClienteVault, CredencialesDinamicas } from './despues.js';
import { conectarAntes, SQL_ANTES, CONFIG_ANTES } from './antes.js';
import { ROL_PEDIDOS } from './rol.js';
import { escuchar } from '../comun/cliente.js';

const HORA = 3600_000, DIA = 24 * HORA;
let ahora = Date.parse('2026-11-20T09:00:00Z');
const reloj = () => ahora;
const marca = () => `día ${Math.floor((ahora - Date.parse('2026-11-20T09:00:00Z')) / DIA)} ${new Date(ahora).toISOString().slice(11, 16)}`;

console.log('== ANTES (vulnerable): una credencial estática compartida');
const bdA = new BdMemoria();
await bdA.ejecutar(SQL_ANTES);
console.log(`${marca()}  pedidos y pagos usan ${CONFIG_ANTES.usuario}/${'*'.repeat(CONFIG_ANTES.clave.length)}; se filtra en un log`);
for (const [desc, salto] of [['el atacante la prueba', 0], ['una hora después', HORA], ['30 días después', 30 * DIA - HORA]]) {
  ahora += salto;
  const r = await conectarAntes(bdA, 'atacante', ahora);
  console.log(`${marca().padEnd(13)} ${desc.padEnd(34)} -> login ${r.ok ? 'ACEPTADO' : 'rechazado'} como ${r.usuario}`);
}

console.log('   ¿qué servicio la filtró? imposible saberlo: todos usan el mismo usuario');

console.log('== DESPUÉS (seguro): credenciales dinámicas de Vault, 1 h por instancia');
ahora = Date.parse('2026-11-20T09:00:00Z');
const bd = new BdMemoria();
const doble = crearDobleVault({ bd, reloj });
const v = await escuchar(doble);
const vault = new ClienteVault({ direccion: `http://127.0.0.1:${v.puerto}`, token: 'root' });
await fetch(`http://127.0.0.1:${v.puerto}/v1/database/roles/pedidos`, { method: 'POST', headers: { 'X-Vault-Token': 'root' }, body: JSON.stringify(ROL_PEDIDOS) });
const p1 = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
const p2 = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
console.log(`${marca()}  instancia 1 -> ${p1.usuario} (lease ${p1.duracion} s) · instancia 2 -> ${p2.usuario}`);
console.log(`${marca()}  se filtra la de la instancia 1 en un log`);
console.log(`${marca()}  el atacante la prueba               -> login ${(await bd.login(p1.usuario, p1.clave, ahora)) ? 'ACEPTADO' : 'rechazado'} (sigue viva: vida máxima 1 h)`);
ahora += HORA;
await doble.caducar();
console.log(`${marca()}  una hora después (lease caducado)   -> login ${(await bd.login(p1.usuario, p1.clave, ahora)) ? 'ACEPTADO' : 'rechazado'} · rol borrado: ${!bd.roles.has(p1.usuario)}`);
ahora = Date.parse('2026-11-20T09:05:00Z');
console.log('-- otro día, otro incidente: se revoca todo lo emitido para el rol pedidos');
const p3 = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
await fetch(`http://127.0.0.1:${v.puerto}/v1/sys/leases/revoke-prefix/database/creds/pedidos`, { method: 'POST', headers: { 'X-Vault-Token': 'root' } });
console.log(`${marca()}  incidente: revoke-prefix database/creds/pedidos -> login de ${p3.usuario}: ${(await bd.login(p3.usuario, p3.clave, ahora)) ? 'ACEPTADO' : 'rechazado'} · leases vivos: ${doble.leases.size}`);
for (const p of [p1, p2, p3]) clearTimeout(p.temporizador);
await v.cerrar();
