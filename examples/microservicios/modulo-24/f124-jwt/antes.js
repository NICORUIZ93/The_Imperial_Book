// Módulo 20 · F124 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Fallos: (1) usa jwt.decode(), que NO comprueba la firma; (2) secreto débil y dentro del código;
// (3) tokens sin caducidad. Ejecuta: node f124-jwt/antes.js   (:3124)
import express from 'express';
import jwt from 'jsonwebtoken';

const SECRETO = 'secreto'; // (2) adivinable con un diccionario y visible en el repositorio
const USUARIOS = { ana: { id: 'u1', clave: 'ana123', rol: 'cliente' } };

export function crearApp() {
  const app = express();
  app.use(express.json());

  app.post('/login', (req, res) => {
    const usuario = USUARIOS[req.body.usuario];
    if (!usuario || usuario.clave !== req.body.clave) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ token: jwt.sign({ sub: usuario.id, rol: usuario.rol }, SECRETO) }); // (3) sin expiresIn: vale para siempre
  });

  app.get('/admin/ventas', (req, res) => {
    const token = (req.get('authorization') ?? '').replace('Bearer ', '');
    const payload = jwt.decode(token); // (1) decode solo LEE el token: cualquiera puede fabricar uno
    if (payload?.rol !== 'admin') return res.status(403).json({ error: 'solo administradores' });
    res.json({ ventasDelMes: 184_500_000 });
  });
  return app;
}

if (import.meta.main) crearApp().listen(3124, () => console.log('ANTES (vulnerable) en :3124'));
