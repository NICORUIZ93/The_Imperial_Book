// Módulo 20 · F129 · DESPUÉS (seguro): la clave vive en un gestor de secretos; el servicio la pide al arrancar con su
// identidad, la guarda 5 minutos en memoria, nunca la escribe en logs ni respuestas y sobrevive a una rotación.
// Requisitos: Node.js 26.13.1 LTS y los emuladores del docker-compose.yml (o la nube real).
// Ejecuta: SECRETOS=aws AWS_ENDPOINT_URL=http://127.0.0.1:4566 node f129-secretos/despues.js   (:3229)
import express from 'express';
import { ErrorDeAutenticacion, SECRETO_BD } from './comun.js';

export async function crearApp(baseDeDatos, secretos, { log = console.log } = {}) {
  await secretos.obtener(SECRETO_BD); // falla al ARRANCAR si no hay acceso al secreto (mejor que en la primera petición)
  log(`secreto ${SECRETO_BD} cargado (${JSON.stringify(secretos.estado()[0])})`); // nombre y versión; jamás el valor

  const app = express();
  app.disable('x-powered-by');

  app.get('/pedidos', async (_req, res) => {
    try {
      res.json(baseDeDatos.consultar(await secretos.obtener(SECRETO_BD)));
    } catch (error) {
      if (!(error instanceof ErrorDeAutenticacion)) throw error;
      // ¿La base rechazó la clave? Quizá la rotaron: pide la versión nueva UNA vez y reintenta.
      log(`la base de datos rechazó la clave en caché; recargando ${SECRETO_BD}`);
      res.json(baseDeDatos.consultar(await secretos.obtener(SECRETO_BD, { forzar: true })));
    }
  });

  app.get('/salud/secretos', (_req, res) => res.json(secretos.estado())); // metadatos, sin valores
  app.use((_error, _req, res, _next) => res.status(500).json({ error: 'error interno' })); // nunca el detalle
  return app;
}

if (import.meta.main) {
  const { crearBaseDeDatos } = await import('./comun.js');
  const { proveedorDesdeEntorno, SecretosConCache } = await import('./secretos.js');
  const secretos = new SecretosConCache(proveedorDesdeEntorno());
  const app = await crearApp(crearBaseDeDatos((await secretos.obtener(SECRETO_BD)).clave), secretos);
  app.listen(3229, () => console.log(`DESPUÉS (seguro) en :3229 con SECRETOS=${process.env.SECRETOS ?? 'aws'}`));
}
