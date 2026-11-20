// Módulo 23 · Servicio «pedidos» que el módulo empaqueta, despliega y escala.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, TypeScript 6.0.3 (npm run build compila a dist/).
import express from 'express';
import { createHash } from 'node:crypto';

export interface Estado {
  listo: boolean;        // false mientras arranca o cuando recibe SIGTERM: Kubernetes deja de enviarle tráfico
  version: string;       // la etiqueta de la imagen (v1, v2…): Blue-Green y Canary la usan para distinguir versiones
  tasaError: number;     // 0..1 · solo para el laboratorio: fracción de pedidos que fallan en una versión defectuosa (F146)
}

export function crearApp(estado: Estado) {
  const app = express();
  app.disable('x-powered-by');

  // Liveness: «el proceso responde». Si falla, el kubelet reinicia el contenedor. No consulta dependencias.
  app.get('/salud/viva', (_req, res) => { res.json({ estado: 'viva' }); });

  // Readiness: «puedo atender tráfico». Si falla, el pod sale de los Endpoints del Service, sin reiniciarse.
  app.get('/salud/lista', (_req, res) => {
    if (estado.listo) res.json({ estado: 'lista' });
    else res.status(503).json({ estado: 'no lista' });
  });

  app.get('/version', (_req, res) => { res.json({ version: estado.version, pod: process.env.HOSTNAME ?? 'local' }); });

  app.get('/pedidos/:id', (req, res) => {
    // Fallo DETERMINISTA: el mismo id falla siempre en una versión defectuosa (así la simulación es repetible).
    const cubeta = Number.parseInt(createHash('sha256').update(req.params.id).digest('hex').slice(0, 8), 16) % 100;
    if (cubeta < estado.tasaError * 100) { res.status(500).json({ error: 'fallo simulado', version: estado.version }); return; }
    res.json({ id: req.params.id, estado: 'pagado', version: estado.version });
  });

  // Trabajo de CPU para que el HPA tenga algo que medir (F144): ?ms=50 quema unos 50 ms de CPU.
  app.get('/trabajo', (req, res) => {
    const ms = Math.min(Number(req.query.ms ?? 50), 1000);
    const fin = performance.now() + ms;
    let h = 'x';
    while (performance.now() < fin) h = createHash('sha256').update(h).digest('hex');
    res.json({ ms, version: estado.version });
  });
  return app;
}
