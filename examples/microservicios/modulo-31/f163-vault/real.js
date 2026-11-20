// Módulo 27 · F163 · DESPUÉS contra el Vault y el PostgreSQL REALES del docker-compose.yml (sin dobles).
// Uso: docker compose up -d --wait && ./f163-vault/vault/configurar.sh && node f163-vault/real.js
import { BdPostgres } from './bd.js';
import { ClienteVault, CredencialesDinamicas } from './despues.js';

const vault = new ClienteVault({ direccion: process.env.VAULT_ADDR ?? 'http://127.0.0.1:18200', token: process.env.VAULT_TOKEN ?? 'root' });
const bd = new BdPostgres(process.env.PGURL ?? 'postgres://vault_admin:solo-dev-vault@127.0.0.1:15432/tienda');
const c = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
console.log(`Vault real -> ${c.usuario} lease_duration=${c.duracion}`);
console.log(`login con la credencial dinámica  -> ${JSON.stringify(await bd.intentar(c.usuario, c.clave))}`);
await c.cerrar();
console.log(`login tras revocar el lease        -> ${JSON.stringify(await bd.intentar(c.usuario, c.clave))}`);
