// Módulo 20 · F126 · DESPUÉS (seguro): Helmet pone las cabeceras de seguridad y CORS solo admite una lista de orígenes.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, helmet 8.3.0 y cors 2.8.6.
// Ejecuta: ORIGENES=https://tienda.example,https://admin.tienda.example node f126-helmet-cors/despues.js   (:3226)
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

export function crearApp({ origenes = (process.env.ORIGENES ?? 'https://tienda.example').split(',') } = {}) {
  const permitidos = new Set(origenes); // comparación EXACTA de cadenas: nada de includes(), endsWith() ni regex flojas
  const app = express();
  app.disable('x-powered-by');          // no anuncies qué framework usas (Helmet también la quita)

  // Helmet agrupa una docena de middlewares pequeños, uno por cabecera. Para una API JSON: CSP que no deja cargar nada y el resto por defecto.
  app.use(helmet({
    contentSecurityPolicy: { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    strictTransportSecurity: { maxAge: 31_536_000, includeSubDomains: true }, // HSTS: 1 año, solo HTTPS
  }));

  app.use(cors({
    // Sin cabecera Origin (curl, otro servicio, navegación directa) no hay nada que decidir.
    // Origen en la lista -> se devuelve ESE origen. Cualquier otro -> ninguna cabecera CORS.
    origin: (origen, listo) => listo(null, origen !== undefined && permitidos.has(origen)),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // solo tiene sentido con lista blanca; jamás con «*» ni reflejando el origen
    maxAge: 600,       // el navegador recuerda el preflight 10 minutos
  }));

  app.get('/api/perfil', (_req, res) => res.json({ nombre: 'Ana', saldo: 250_000 }));
  return app;
}

if (import.meta.main) crearApp().listen(3226, () => console.log('DESPUÉS (seguro) en :3226'));
