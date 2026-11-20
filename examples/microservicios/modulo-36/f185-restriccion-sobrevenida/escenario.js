// Módulo 32 · F185 · Escenario de la restricción sobrevenida: llegan `tasa` reservas/s durante `segundos` (modelo
// abierto, como el pico que midió Gatling) contra un proveedor limitado a `limiteRps`. Devuelve qué pasó.
import { montarSistema } from '../f181-sistema-reservas/montaje.js';
import { limitarCobros } from './cola-cobros.js';
import { espera, percentil } from '../comun/estadistica.js';

export async function correr({ tasa = 60, segundos = 5, limiteRps = 20, cobrosPorSegundo = 0, politica = { intentos: 3, inicialMs: 100 } } = {}) {
  const s = await montarSistema({ aforo: 1_000_000, proveedor: { limiteRps, latenciaMs: 5 }, politica,
    envolverActividades: cobrosPorSegundo ? (a) => limitarCobros(a, cobrosPorSegundo) : (a) => a });
  const total = tasa * segundos;
  const inicio = Date.now();
  const envios = [];
  for (let i = 0; i < total; i++) {
    await espera(Math.max(0, inicio + (i * 1000) / tasa - Date.now()));
    envios.push(fetch(`${s.reservasUrl}/reservas`, { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': `p${i}` },
      body: JSON.stringify({ eventoId: 'concierto-1', clienteId: `C-${i}`, importe: 80, tarjeta: '4242-OK' }) }).then((r) => r.status));
  }
  const respuestasHttp = await Promise.all(envios);
  while (s.repo.todas().some((r) => r.estado === 'PENDIENTE') && Date.now() - inicio < 120_000) await espera(50);
  const reservas = s.repo.todas();
  const confirmadas = reservas.filter((r) => r.estado === 'CONFIRMADA');
  const resultado = {
    reservas: reservas.length,
    http202: respuestasHttp.filter((e) => e === 202).length,
    confirmadas: confirmadas.length,
    canceladas: reservas.filter((r) => r.estado === 'CANCELADA').length,
    rechazados429: s.stats.rechazados429,
    peticionesProveedor: s.stats.peticiones,
    maxCobrosEnUnSegundo: Math.max(0, ...s.stats.porSegundo.values()),
    p99HastaCobroS: percentil(confirmadas.map((r) => (r.actualizada - r.creada) / 1000), 99),
  };
  await s.cerrar();
  return resultado;
}

export function imprimir(titulo, r) {
  console.log(titulo);
  console.log(`  reservas recibidas (HTTP 202):   ${r.http202} de ${r.reservas}`);
  console.log(`  CONFIRMADAS / CANCELADAS:        ${r.confirmadas} / ${r.canceladas} (${((r.canceladas / r.reservas) * 100).toFixed(1)} % de ventas perdidas)`);
  console.log(`  peticiones al proveedor:         ${r.peticionesProveedor} · respondidas con 429: ${r.rechazados429}`);
  console.log(`  máximo de cobros en un segundo:  ${r.maxCobrosEnUnSegundo}`);
  console.log(`  p99 desde la reserva al cobro:   ${r.p99HastaCobroS.toFixed(1)} s`);
}
