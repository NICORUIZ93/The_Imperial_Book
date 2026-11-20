// Módulo 20 · F126 · ANTES (vulnerable). NO copies este archivo: existe para compararlo con despues.js.
// Fallos: (1) sin cabeceras de seguridad y anunciando «X-Powered-By: Express»; (2) CORS que refleja CUALQUIER
// origen y además permite credenciales: cualquier web puede leer la respuesta con la cookie de la víctima.
// Ejecuta: node f126-helmet-cors/antes.js   (:3126)
import cors from 'cors';
import express from 'express';

export function crearApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true })); // (2) origin: true = «copia el Origin que venga»
  app.get('/api/perfil', (_req, res) => res.json({ nombre: 'Ana', saldo: 250_000 }));
  return app;
}

if (import.meta.main) crearApp().listen(3126, () => console.log('ANTES (vulnerable) en :3126'));
