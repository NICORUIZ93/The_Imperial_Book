// Módulo 20 · F125 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Fallos: (1) claves en texto plano comparadas con ===; (2) mensajes distintos que revelan qué usuarios existen;
// (3) la «sesión» es una cabecera x-usuario que escribe el propio cliente; (4) /admin no comprueba el rol.
// Ejecuta: node f125-passport/antes.js   (:3125)
import express from 'express';

const USUARIOS = { ana: { clave: 'ana123', rol: 'cliente' }, root: { clave: 'S3gura!2026', rol: 'admin' } };

export function crearApp() {
  const app = express();
  app.use(express.json());

  app.post('/login', (req, res) => {
    const usuario = USUARIOS[req.body.usuario];
    if (!usuario) return res.status(404).json({ error: 'el usuario no existe' });       // (2)
    if (usuario.clave !== req.body.clave) return res.status(401).json({ error: 'clave incorrecta' }); // (1) (2)
    res.json({ mensaje: 'bienvenido', usa: `x-usuario: ${req.body.usuario}` });           // (3)
  });

  const identificado = (req, res, next) => {
    req.usuario = USUARIOS[req.get('x-usuario')];                                         // (3) confía en el cliente
    if (!req.usuario) return res.status(401).json({ error: 'identifícate' });
    next();
  };
  app.get('/mis-pedidos', identificado, (req, res) => res.json({ pedidos: [1, 2] }));
  app.delete('/admin/usuarios/:id', identificado, (req, res) => res.json({ borrado: req.params.id })); // (4)
  return app;
}

if (import.meta.main) crearApp().listen(3125, () => console.log('ANTES (vulnerable) en :3125'));
