// Módulo 32 · F181 · Servicio de reservas (API REST con Express 5.3.0 sobre Node.js 26.13.1 LTS).
// POST /reservas  -> 202 Accepted + Location: la saga (pago externo incluido) sigue en segundo plano.
// GET  /reservas/:id -> estado actual (PENDIENTE, CONFIRMADA o CANCELADA).
// El orquestador se inyecta: el local (orquestador-local.js) para desarrollo y tests, o Temporal (orquestador-temporal.js).
import express from 'express';
import { pathToFileURL } from 'node:url';

export function crearServicioReservas({ repo, orquestador }) {
  const app = express();
  app.use(express.json());
  let secuencia = 0;
  app.post('/reservas', (req, res) => {
    const { eventoId, clienteId, importe, tarjeta } = req.body ?? {};
    if (!eventoId || !clienteId || !(importe > 0) || !tarjeta) {
      return res.status(400).json({ error: 'faltan eventoId, clienteId, importe (> 0) o tarjeta' });
    }
    // Idempotency-Key del cliente: el mismo POST repetido devuelve la misma reserva (no crea otra ni cobra dos veces).
    const reservaId = req.get('idempotency-key') ? `R-${req.get('idempotency-key')}` : `R-${++secuencia}`;
    const existente = repo.obtener(reservaId);
    if (existente) return res.status(202).location(`/reservas/${reservaId}`).json(existente);
    const reserva = repo.crear({ reservaId, eventoId, clienteId, importe, tarjeta });
    orquestador.iniciar({ reservaId, eventoId, clienteId, importe, tarjeta, ...(req.body.fallarAlConfirmar ? { fallarAlConfirmar: true } : {}) })
      .catch((e) => repo.actualizar(reservaId, { estado: 'CANCELADA', motivo: `saga interrumpida: ${e.message}` }));
    res.status(202).location(`/reservas/${reservaId}`).json(reserva);
  });
  app.get('/reservas/:id', (req, res) => {
    const r = repo.obtener(req.params.id);
    return r ? res.json(r) : res.status(404).json({ error: `no existe ${req.params.id}` });
  });
  app.get('/salud', (_req, res) => res.json({ estado: 'UP' }));
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Arranque «de verdad»: node f181-sistema-reservas/servicio-reservas.js  (ORQUESTADOR=temporal para usar Temporal)
  const { crearRepositorio } = await import('./repositorio.js');
  const repo = crearRepositorio();
  let orquestador;
  if (process.env.ORQUESTADOR === 'temporal') {
    const { crearOrquestadorTemporal } = await import('../f182-saga-temporal/orquestador-temporal.js');
    orquestador = await crearOrquestadorTemporal();
    const iniciar = orquestador.iniciar;
    orquestador.iniciar = async (r) => { const res = await iniciar(r); repo.actualizar(r.reservaId, res.estado === 'CONFIRMADA' ? { estado: res.estado } : { estado: res.estado, motivo: res.motivo }); return res; };
  } else {
    const { crearOrquestadorLocal } = await import('../f182-saga-temporal/orquestador-local.js');
    const { crearActividades } = await import('../f182-saga-temporal/actividades.js');
    const { crearInventario } = await import('./inventario.js');
    orquestador = crearOrquestadorLocal(crearActividades({ inventario: crearInventario({ 'concierto-1': 500 }), repo,
      pagosUrl: process.env.PAGOS_URL ?? 'http://localhost:8090' }));
  }
  const puerto = Number(process.env.PORT ?? 8081);
  crearServicioReservas({ repo, orquestador }).listen(puerto, () => console.log(`reservas en :${puerto} (orquestador ${process.env.ORQUESTADOR ?? 'local'})`));
}
