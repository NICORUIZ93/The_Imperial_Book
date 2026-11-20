// Módulo 20 · F129 · ANTES (vulnerable). NO copies este archivo: existe para compararlo con despues.js.
// Fallos: (1) la clave de la base de datos está escrita en el código (y por tanto en Git, para siempre);
// (2) se imprime en el log al arrancar; (3) un endpoint de «debug» la devuelve junto con todo process.env;
// (4) si el DBA rota la clave, hay que cambiar el código y desplegar. Ejecuta: node f129-secretos/antes.js   (:3129)
import express from 'express';

const BD = { usuario: 'app', clave: 'Cl4ve-Pr0d-2026' }; // (1)

export function crearApp(baseDeDatos, { log = console.log } = {}) {
  log(`conectando a la base de datos con ${JSON.stringify(BD)}`); // (2)
  const app = express();
  app.get('/pedidos', (_req, res) => {
    try { res.json(baseDeDatos.consultar(BD)); } catch (error) { res.status(500).json({ error: error.message }); } // (4)
  });
  app.get('/debug/config', (_req, res) => res.json({ bd: BD, entorno: process.env })); // (3)
  return app;
}

if (import.meta.main) {
  const { crearBaseDeDatos } = await import('./comun.js');
  crearApp(crearBaseDeDatos('Cl4ve-Pr0d-2026')).listen(3129, () => console.log('ANTES (vulnerable) en :3129'));
}
