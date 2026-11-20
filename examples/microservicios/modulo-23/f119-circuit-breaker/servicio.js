// Módulo 19 · F119 · Servicio «pedidos» (Express 5.3.0) que consulta el inventario detrás de un circuito opossum 10.0.0.
// Requisitos: Node.js 26.13.1 LTS. Ejecuta: node f119-circuit-breaker/servicio.js   (PORT=3119 por defecto)
import express from 'express';
import { crearCircuitoDeInventario, ErrorDeNegocio, estadoDe } from './cliente-inventario.js';

const INVENTARIO_URL = process.env.INVENTARIO_URL ?? 'http://127.0.0.1:21212';

export function crearApp(circuito = crearCircuitoDeInventario(INVENTARIO_URL)) {
  const app = express();
  // Cada cambio de estado queda en el log: es lo primero que mirarás en un incidente.
  for (const evento of ['open', 'halfOpen', 'close']) {
    circuito.on(evento, () => console.log(`[circuito ${circuito.name}] ${evento} -> ${estadoDe(circuito)}`));
  }

  app.get('/pedidos/stock/:sku', async (req, res) => {
    try {
      res.json(await circuito.fire(req.params.sku));
    } catch (error) {
      if (error instanceof ErrorDeNegocio) return res.status(error.status).json({ error: error.message });
      if (error.code === 'EOPENBREAKER') {
        // Circuito abierto: respondemos al instante, sin tocar la red, y decimos cuándo volver a intentar.
        res.set('Retry-After', String(Math.ceil(circuito.options.resetTimeout / 1000)));
        return res.status(503).json({ error: 'inventario no disponible', circuito: 'ABIERTO' });
      }
      res.status(502).json({ error: 'fallo al consultar el inventario', causa: error.cause?.code ?? error.name });
    }
  });

  app.get('/circuito', (_req, res) => {
    const { fires, successes, failures, rejects, timeouts } = circuito.stats;
    res.json({ estado: estadoDe(circuito), fires, successes, failures, rejects, timeouts });
  });
  return app;
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3119);
  crearApp().listen(puerto, () => console.log(`pedidos (F119) en :${puerto} -> inventario ${INVENTARIO_URL}`));
}
