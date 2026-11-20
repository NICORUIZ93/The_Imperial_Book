// Módulo 20 · F128 · DESPUÉS (seguro): los mismos cinco puntos del OWASP Top 10:2025, corregidos.
// Requisitos: Node.js 26.13.1 LTS y express 5.3.0. Ejecuta: node f128-owasp/despues.js   (:3228)
import express from 'express';
import { randomUUID } from 'node:crypto';
import { consultarPermiso, FACTURAS, identificar } from './comun.js';

const DESTINOS_PERMITIDOS = new Set(['imagenes.tienda.example']); // lista blanca de hosts para /vista-previa

export function crearApp({ log = console.log, descargar = fetch } = {}) {
  // A09: eventos de seguridad como JSON estructurado; un sistema de alertas cuenta los «acceso_denegado».
  const evento = (tipo, req, extra = {}) => log(JSON.stringify({ tipo, usuario: req.usuario?.id ?? null, ruta: req.path, ip: req.ip, ...extra }));
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // A01: la consulta incluye al dueño. Si no es tuya responde 404 (igual que si no existiera: no revela nada).
  app.get('/facturas/:id', identificar, (req, res) => {
    const factura = FACTURAS[req.params.id];
    if (!factura || factura.de !== req.usuario.id) {
      if (factura) evento('acceso_denegado', req, { recurso: `factura:${factura.id}` });
      return res.status(404).json({ error: 'no existe' });
    }
    res.json(factura);
  });

  // A01 (SSRF): solo https, solo hosts de la lista y sin seguir redirecciones (un 302 podría llevar dentro de la red).
  app.get('/vista-previa', identificar, async (req, res) => {
    let destino;
    try { destino = new URL(String(req.query.url)); } catch { return res.status(400).json({ error: 'url inválida' }); }
    if (destino.protocol !== 'https:' || !DESTINOS_PERMITIDOS.has(destino.hostname)) {
      evento('destino_no_permitido', req, { destino: destino.host });
      return res.status(400).json({ error: 'destino no permitido' });
    }
    const r = await descargar(destino, { redirect: 'error', signal: AbortSignal.timeout(2000) });
    res.type('text/plain').send(await r.text());
  });

  // A10: ante una excepción se NIEGA («fail closed») y se responde 503: el fallo no regala permisos.
  app.post('/exportar', identificar, async (req, res) => {
    let permitido;
    try {
      permitido = await consultarPermiso(req.usuario, 'exportar');
    } catch (error) {
      evento('permisos_no_disponibles', req, { causa: error.message });
      return res.status(503).json({ error: 'no se pudo comprobar el permiso; inténtalo más tarde' });
    }
    if (!permitido) { evento('acceso_denegado', req, { accion: 'exportar' }); return res.status(403).json({ error: 'no tienes permiso' }); }
    res.json({ exportadas: Object.keys(FACTURAS).length });
  });

  app.get('/admin', identificar, (req, res) => { evento('acceso_denegado', req); res.status(403).json({ error: 'solo administradores' }); });

  app.get('/fallo', () => { throw new Error('conexión a postgres://app:Cl4ve@10.0.0.5/tienda rechazada'); });

  // A02: al cliente, un mensaje genérico y un id para soporte; el detalle se queda en el log del servidor.
  app.use((error, req, res, _next) => {
    const incidente = randomUUID();
    evento('error_no_controlado', req, { incidente, detalle: error.message });
    res.status(500).json({ error: 'error interno', incidente });
  });
  return app;
}

if (import.meta.main) crearApp().listen(3228, () => console.log('DESPUÉS (seguro) en :3228'));
