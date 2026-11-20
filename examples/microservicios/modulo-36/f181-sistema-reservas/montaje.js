// Módulo 32 · F181 · Monta el sistema completo en un proceso (puertos libres): proveedor de pagos externo, servicio de
// reservas con el orquestador local y, si se pide, el gateway (F183). Lo usan la demo, los tests y F184/F185.
import { cerrar, escuchar } from '../comun/http.js';
import { crearProveedor } from './proveedor-pagos.js';
import { crearInventario } from './inventario.js';
import { crearRepositorio } from './repositorio.js';
import { crearServicioReservas } from './servicio-reservas.js';
import { crearActividades } from '../f182-saga-temporal/actividades.js';
import { crearOrquestadorLocal } from '../f182-saga-temporal/orquestador-local.js';

export async function montarSistema({ aforo = 500, proveedor = {}, politica = {}, envolverActividades = (a) => a } = {}) {
  const prov = crearProveedor(proveedor);
  const pagosUrl = await escuchar(prov.servidor);
  const repo = crearRepositorio();
  const inventario = crearInventario({ 'concierto-1': aforo });
  const actividades = envolverActividades(crearActividades({ inventario, repo, pagosUrl }));
  const app = crearServicioReservas({ repo, orquestador: crearOrquestadorLocal(actividades, politica) });
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise((ok) => servidor.once('listening', ok));
  const reservasUrl = `http://127.0.0.1:${servidor.address().port}`;
  return { reservasUrl, pagosUrl, repo, inventario, stats: prov.stats,
    cerrar: async () => { servidor.closeAllConnections?.(); await Promise.all([cerrar(servidor), cerrar(prov.servidor)]); } };
}

// Espera a que una reserva salga de PENDIENTE (la saga corre en segundo plano).
export async function esperarFinal(url, id, maxMs = 30_000) {
  const fin = Date.now() + maxMs;
  for (;;) {
    const r = await (await fetch(`${url}/reservas/${id}`)).json();
    if (r.estado !== 'PENDIENTE' || Date.now() > fin) return r;
    await new Promise((ok) => setTimeout(ok, 20));
  }
}
