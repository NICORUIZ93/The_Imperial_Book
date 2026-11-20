// Módulo 27 · F163 · las dos bases de datos del laboratorio, con la misma interfaz:
//   ejecutar(sentenciasSql)       -> ejecuta lo que Vault manda (creation_statements / revocation_statements)
//   login(usuario, clave, ahora)  -> true si PostgreSQL dejaría entrar
// BdMemoria entiende SOLO las dos formas de SQL de este laboratorio y respeta VALID UNTIL con un reloj inyectable,
// para poder simular 30 días en un segundo. BdPostgres ejecuta el SQL de verdad (pg 8.23.1).
import pg from 'pg';

export class BdMemoria {
  constructor() { this.roles = new Map(); }
  async ejecutar(sql) {
    for (const s of sql.split(';').map((x) => x.trim()).filter(Boolean)) {
      let m = s.match(/^CREATE ROLE "([^"]+)" WITH LOGIN PASSWORD '([^']+)'(?: VALID UNTIL '([^']+)')?$/i);
      if (m) { this.roles.set(m[1], { clave: m[2], hasta: m[3] ? Date.parse(m[3]) : Infinity }); continue; }
      m = s.match(/^DROP ROLE(?: IF EXISTS)? "([^"]+)"$/i);
      if (m) { this.roles.delete(m[1]); continue; }
      if (/^(GRANT .+ TO|REVOKE .+ FROM) "[^"]+"$/i.test(s)) continue; // los permisos no cambian el login
      throw new Error(`BdMemoria no entiende: ${s}`);
    }
  }
  async login(usuario, clave, ahora = Date.now()) {
    const r = this.roles.get(usuario);
    return Boolean(r && r.clave === clave && ahora < r.hasta);
  }
}

export class BdPostgres {
  /** url del administrador que usa Vault (connection_url), p. ej. postgres://vault-admin:…@127.0.0.1:5432/postgres */
  constructor(url) { this.url = new URL(url); }
  async ejecutar(sql) {
    const c = new pg.Client({ connectionString: this.url.href });
    await c.connect();
    try { await c.query(sql); } finally { await c.end(); }
  }
  async login(usuario, clave) { return (await this.intentar(usuario, clave)).ok; }
  /** Como login(), pero devuelve el mensaje real de PostgreSQL si falla. */
  async intentar(usuario, clave) {
    const u = new URL(this.url.href);
    u.username = encodeURIComponent(usuario);
    u.password = encodeURIComponent(clave);
    const c = new pg.Client({ connectionString: u.href, connectionTimeoutMillis: 3000 });
    try { await c.connect(); await c.query('select 1'); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message }; } finally { await c.end().catch(() => {}); }
  }
}
