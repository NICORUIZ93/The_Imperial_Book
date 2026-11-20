// Módulo 27 · F163 · DESPUÉS (seguro): secretos DINÁMICOS de Vault (motor database).
// Cada instancia pide a Vault su propio usuario de PostgreSQL al arrancar (vida 1 h, máximo 24 h),
// lo renueva mientras vive y lo revoca al apagarse. Si se filtra: caduca solo, se puede revocar por prefijo
// y el nombre (v-pedidos-…) dice de qué rol salió. Habla con la API HTTP de Vault (fetch nativo de Node 26).
// Uso real: VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=… node f163-vault/despues.js
import { pathToFileURL } from 'node:url';

export class ClienteVault {
  constructor({ direccion = process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200', token = process.env.VAULT_TOKEN } = {}) {
    if (!token) throw new Error('falta VAULT_TOKEN (en producción: AppRole o Kubernetes auth, nunca un token raíz)');
    this.direccion = direccion;
    this.token = token;
  }
  async #api(metodo, ruta, cuerpo) {
    const r = await fetch(`${this.direccion}/v1/${ruta}`, {
      method: metodo,
      headers: { 'X-Vault-Token': this.token, ...(cuerpo ? { 'content-type': 'application/json' } : {}) },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    if (!r.ok) throw new Error(`Vault ${metodo} ${ruta} -> ${r.status} ${await r.text()}`);
    return r.status === 204 ? null : r.json();
  }
  credenciales(rol) { return this.#api('GET', `database/creds/${rol}`); }
  renovar(leaseId, incremento) { return this.#api('POST', 'sys/leases/renew', { lease_id: leaseId, increment: incremento }); }
  revocar(leaseId) { return this.#api('POST', 'sys/leases/revoke', { lease_id: leaseId }); }
}

/** Credenciales de una instancia: pedir, renovar a los 2/3 del lease, revocar al apagar. */
export class CredencialesDinamicas {
  constructor(vault, rol) { this.vault = vault; this.rol = rol; this.temporizador = null; }
  async iniciar() {
    const s = await this.vault.credenciales(this.rol);
    this.leaseId = s.lease_id;
    this.usuario = s.data.username;
    this.clave = s.data.password;
    this.duracion = s.lease_duration;
    this.#programar(s.lease_duration);
    return this;
  }
  #programar(segundos) {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(async () => {
      const r = await this.vault.renovar(this.leaseId, this.duracion).catch(() => null);
      if (r) this.#programar(r.lease_duration); // si ya no renueva (max_ttl), toca iniciar() de nuevo
    }, Math.max(1, segundos * 2 / 3) * 1000).unref();
  }
  async cerrar() { clearTimeout(this.temporizador); await this.vault.revocar(this.leaseId); }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cred = await new CredencialesDinamicas(new ClienteVault(), process.argv[2] ?? 'pedidos').iniciar();
  console.log(`usuario=${cred.usuario} lease=${cred.leaseId} lease_duration=${cred.duracion}`);
  await cred.cerrar();
  console.log('lease revocado al apagar');
}
