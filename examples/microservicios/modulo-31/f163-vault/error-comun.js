// Módulo 27 · F163 · ERROR COMÚN: pedir la credencial dinámica una vez al arrancar y no renovarla nunca.
// Síntoma (pasada la vida del lease): las conexiones NUEVAS del pool fallan con
//   password authentication failed for user "v-pedidos-…"
// Diagnóstico: el usuario empieza por v-<rol>- (es de Vault) y su VALID UNTIL ya pasó: \du+ en psql o
//   vault lease lookup <lease_id>. Arreglo: renovar el lease (CredencialesDinamicas lo hace a los 2/3) o
//   pedir credenciales nuevas y recrear el pool antes de max_ttl (Vault Agent o el sidecar de inyección lo automatizan).
// Ejecuta con PostgreSQL real: PGURL=postgres://vault_admin:solo-dev-vault@127.0.0.1:5432/tienda node f163-vault/error-comun.js
import { setTimeout as esperar } from 'node:timers/promises';
import { BdPostgres } from './bd.js';
import { crearDobleVault } from './doble-vault.js';
import { ClienteVault } from './despues.js';
import { ROL_PEDIDOS } from './rol.js';
import { escuchar } from '../comun/cliente.js';

if (!process.env.PGURL) {
  console.log('omitido: define PGURL (PostgreSQL local o el del docker-compose.yml en el puerto 15432) para ver el error real');
  process.exit(0);
}
const bd = new BdPostgres(process.env.PGURL);
const v = await escuchar(crearDobleVault({ bd }));
await fetch(`http://127.0.0.1:${v.puerto}/v1/database/roles/pedidos`, { method: 'POST', headers: { 'X-Vault-Token': 'root' }, body: JSON.stringify({ ...ROL_PEDIDOS, default_ttl: 2 }) });
const vault = new ClienteVault({ direccion: `http://127.0.0.1:${v.puerto}`, token: 'root' });
const s = await vault.credenciales('pedidos'); // ✘ una sola vez, sin renovar
console.log(`arranque: ${s.data.username} con lease_duration=${s.lease_duration} s`);
console.log(`conexión nueva al arrancar     -> ${JSON.stringify(await bd.intentar(s.data.username, s.data.password))}`);
await esperar(3000);
console.log(`conexión nueva pasados 3 s     -> ${JSON.stringify(await bd.intentar(s.data.username, s.data.password))}`);
await vault.revocar(s.lease_id);
await v.cerrar();
