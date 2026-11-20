// Módulo 27 · F163 · DOBLE de la API HTTP de Vault (motor «database»), para correr el laboratorio sin Docker.
// Implementa solo lo que usa despues.js, con las mismas rutas que Vault 2.2.0:
//   POST /v1/database/roles/:rol      {db_name, creation_statements, revocation_statements, default_ttl, max_ttl}
//   GET  /v1/database/creds/:rol      -> {lease_id, lease_duration, renewable, data:{username,password}}
//   POST /v1/sys/leases/renew         {lease_id, increment}
//   POST /v1/sys/leases/revoke        {lease_id}            (y /v1/sys/leases/revoke-prefix/:prefijo)
// Con --compose, despues.js habla con el Vault real (hashicorp/vault:2.2.0) y nada de este archivo se usa.
import http from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { leerJson, responder } from '../comun/cliente.js';

const segundos = (v) => (typeof v === 'number' ? v : Number(String(v).replace(/h$/, '')) * (String(v).endsWith('h') ? 3600 : 1));

export function crearDobleVault({ bd, token = 'root', reloj = () => Date.now() }) {
  const roles = new Map();
  const leases = new Map(); // lease_id -> { rol, usuario, vence }

  async function revocar(id) {
    const l = leases.get(id);
    if (!l) return;
    const sql = roles.get(l.rol).revocation_statements.replaceAll('{{name}}', l.usuario);
    await bd.ejecutar(sql);
    leases.delete(id);
  }

  const servidor = http.createServer(async (req, res) => {
    if (req.headers['x-vault-token'] !== token) return responder(res, 403, { errors: ['permission denied'] });
    const url = new URL(req.url, 'http://x');
    let m;
    if (req.method === 'POST' && (m = url.pathname.match(/^\/v1\/database\/roles\/([\w-]+)$/))) {
      roles.set(m[1], await leerJson(req));
      return res.writeHead(204).end();
    }
    if (req.method === 'GET' && (m = url.pathname.match(/^\/v1\/database\/creds\/([\w-]+)$/))) {
      const rol = roles.get(m[1]);
      if (!rol) return responder(res, 400, { errors: [`unknown role: ${m[1]}`] });
      const ttl = segundos(rol.default_ttl);
      const usuario = `v-${m[1]}-${randomBytes(4).toString('hex')}`;
      const clave = randomBytes(18).toString('base64url');
      const vence = reloj() + ttl * 1000;
      const sql = rol.creation_statements.replaceAll('{{name}}', usuario).replaceAll('{{password}}', clave)
        .replaceAll('{{expiration}}', new Date(vence).toISOString());
      await bd.ejecutar(sql);
      const lease_id = `database/creds/${m[1]}/${randomUUID()}`;
      leases.set(lease_id, { rol: m[1], usuario, vence, max: reloj() + segundos(rol.max_ttl) * 1000 });
      return responder(res, 200, { lease_id, lease_duration: ttl, renewable: true, data: { username: usuario, password: clave } });
    }
    if (req.method === 'POST' && url.pathname === '/v1/sys/leases/renew') {
      const { lease_id, increment = 0 } = await leerJson(req);
      const l = leases.get(lease_id);
      if (!l) return responder(res, 400, { errors: ['lease not found'] });
      l.vence = Math.min(reloj() + segundos(increment || roles.get(l.rol).default_ttl) * 1000, l.max);
      return responder(res, 200, { lease_id, renewable: true, lease_duration: Math.round((l.vence - reloj()) / 1000) });
    }
    if (req.method === 'POST' && url.pathname === '/v1/sys/leases/revoke') {
      await revocar((await leerJson(req)).lease_id);
      return res.writeHead(204).end();
    }
    if (req.method === 'POST' && (m = url.pathname.match(/^\/v1\/sys\/leases\/revoke-prefix\/(.+)$/))) {
      for (const id of [...leases.keys()]) if (id.startsWith(m[1])) await revocar(id);
      return res.writeHead(204).end();
    }
    responder(res, 404, { errors: [] });
  });
  /** Vault revoca solo lo que caduca; aquí se dispara a mano tras mover el reloj. */
  servidor.caducar = async () => { for (const [id, l] of [...leases]) if (l.vence <= reloj()) await revocar(id); };
  servidor.leases = leases;
  return servidor;
}
