// Módulo 20 · F128 · Datos y piezas compartidas por las dos versiones (antes y después).
// La identificación está SIMULADA con tokens fijos para centrar la ficha en el Top 10; la de verdad es F124 y F125.
import http from 'node:http';
import { once } from 'node:events';

export const USUARIOS = { 'token-ana': { id: 'ana', rol: 'cliente' }, 'token-luis': { id: 'luis', rol: 'cliente' } };
export const FACTURAS = { 1: { id: 1, de: 'ana', total: 120_000 }, 2: { id: 2, de: 'luis', total: 990_000 } };

export function identificar(req, res, next) {
  req.usuario = USUARIOS[(req.get('authorization') ?? '').replace('Bearer ', '')];
  if (!req.usuario) return res.status(401).json({ error: 'identifícate' });
  next();
}

/** Servicio de permisos externo. `caido.valor = true` simula que no responde (excepción). */
export const caido = { valor: false };
export async function consultarPermiso(usuario, accion) {
  if (caido.valor) throw new Error('servicio de permisos: ETIMEDOUT');
  return usuario.rol === 'admin' && accion === 'exportar';
}

/** Servicio INTERNO que jamás debería verse desde fuera (como el endpoint de metadatos de una nube). */
export async function arrancarServicioInterno() {
  const servidor = http.createServer((_req, res) => res.end(JSON.stringify({ claveDeAcceso: 'AKIA-INTERNA-NO-PUBLICAR' }))).listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  return { url: `http://127.0.0.1:${servidor.address().port}/credenciales`, cerrar: () => servidor.close() };
}
