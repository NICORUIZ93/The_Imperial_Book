// Módulo 20 · F128 · ANTES (vulnerable): cinco fallos del OWASP Top 10:2025 en una API pequeña.
// NO copies este archivo: existe para atacarlo con ataque.js. Ejecuta: node f128-owasp/antes.js   (:3128)
import express from 'express';
import { consultarPermiso, FACTURAS, identificar } from './comun.js';

export function crearApp() {
  const app = express();
  app.use(express.json());

  // A01 Broken Access Control (IDOR): comprueba QUIÉN eres, pero no si la factura es TUYA.
  app.get('/facturas/:id', identificar, (req, res) => {
    const factura = FACTURAS[req.params.id];
    if (!factura) return res.status(404).json({ error: 'no existe' });
    res.json(factura);
  });

  // A01 (SSRF, que en 2025 forma parte de A01): el servidor descarga CUALQUIER URL que le pidan.
  app.get('/vista-previa', identificar, async (req, res) => {
    const r = await fetch(req.query.url);
    res.type('text/plain').send(await r.text());
  });

  // A10 Mishandling of Exceptional Conditions: si el servicio de permisos falla… se deja pasar («fail open»).
  app.post('/exportar', identificar, async (req, res) => {
    let permitido;
    try { permitido = await consultarPermiso(req.usuario, 'exportar'); } catch { permitido = true; }
    if (!permitido) return res.status(403).json({ error: 'no tienes permiso' });
    res.json({ exportadas: Object.keys(FACTURAS).length });
  });

  // A09 Security Logging and Alerting Failures: un acceso denegado no deja ningún rastro.
  app.get('/admin', identificar, (req, res) => res.status(403).json({ error: 'solo administradores' }));

  app.get('/fallo', () => { throw new Error('conexión a postgres://app:Cl4ve@10.0.0.5/tienda rechazada'); });

  // A02 Security Misconfiguration: el error llega al cliente con mensaje interno y pila de llamadas.
  app.use((error, _req, res, _next) => res.status(500).json({ error: error.message, pila: error.stack.split('\n').slice(0, 3) }));
  return app;
}

if (import.meta.main) crearApp().listen(3128, () => console.log('ANTES (vulnerable) en :3128'));
