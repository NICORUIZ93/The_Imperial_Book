// Módulo 20 · F125 · DESPUÉS (seguro) con Passport.js: estrategia «local» para el login (scrypt + comparación en
// tiempo constante) y estrategia «jwt» para cada petición, sin sesiones en el servidor, más un guard de roles.
// Requisitos: Node.js 26.13.1 LTS, passport 0.7.0, passport-local 1.0.0, passport-jwt 4.0.1, jsonwebtoken 9.0.3.
// Ejecuta: JWT_SECRETO=$(openssl rand -hex 32) node f125-passport/despues.js   (:3225)
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as EstrategiaJwt } from 'passport-jwt';
import { Strategy as EstrategiaLocal } from 'passport-local';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Nunca guardes la clave: guarda sal + hash lento (scrypt). Cada usuario tiene su propia sal.
function crearUsuario(id, nombre, clave, rol) {
  const sal = randomBytes(16);
  return { id, nombre, rol, sal, hash: scryptSync(clave, sal, 32) };
}
const USUARIOS = new Map([
  ['ana', crearUsuario('u1', 'ana', 'ana123', 'cliente')],
  ['root', crearUsuario('u2', 'root', 'S3gura!2026', 'admin')],
]);
const SAL_FALSA = randomBytes(16); // para gastar el mismo tiempo cuando el usuario no existe

export function crearApp({ secreto = process.env.JWT_SECRETO } = {}) {
  if (!secreto || secreto.length < 32) throw new Error('JWT_SECRETO debe tener al menos 32 caracteres aleatorios');
  const autenticador = new passport.Passport(); // instancia propia: no comparte estado global entre apps ni tests

  // ESTRATEGIA LOCAL: usuario + clave -> usuario o false. El mismo resultado (false) si no existe o si la clave falla.
  autenticador.use(new EstrategiaLocal({ usernameField: 'usuario', passwordField: 'clave' }, (nombre, clave, listo) => {
    const usuario = USUARIOS.get(nombre);
    const calculado = scryptSync(clave, usuario?.sal ?? SAL_FALSA, 32);
    const valido = usuario !== undefined && timingSafeEqual(calculado, usuario.hash);
    listo(null, valido ? usuario : false);
  }));

  // ESTRATEGIA JWT: saca el token de Authorization: Bearer, verifica firma, algoritmo, emisor y caducidad.
  autenticador.use(new EstrategiaJwt({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secreto,
    algorithms: ['HS256'],
    issuer: 'pedidos',
  }, (payload, listo) => {
    const usuario = [...USUARIOS.values()].find((u) => u.id === payload.sub);
    listo(null, usuario ? { id: usuario.id, rol: usuario.rol } : false); // el rol sale del SERVIDOR, no del cliente
  }));

  const conClave = autenticador.authenticate('local', { session: false });
  const conToken = autenticador.authenticate('jwt', { session: false });
  // AUTORIZACIÓN: estar identificado no basta; además hay que tener el rol.
  const soloRol = (rol) => (req, res, next) => (req.user.rol === rol ? next() : res.status(403).json({ error: 'no tienes permiso' }));

  const app = express();
  app.use(express.json());
  app.post('/login', conClave, (req, res) => {
    const token = jwt.sign({}, secreto, { algorithm: 'HS256', subject: req.user.id, issuer: 'pedidos', expiresIn: '15m' });
    res.json({ token, tipo: 'Bearer', expiraEn: 900 });
  });
  app.get('/mis-pedidos', conToken, (req, res) => res.json({ pedidos: [1, 2], de: req.user.id }));
  app.delete('/admin/usuarios/:id', conToken, soloRol('admin'), (req, res) => res.json({ borrado: req.params.id }));
  return app;
}

if (import.meta.main) crearApp().listen(3225, () => console.log('DESPUÉS (seguro) en :3225'));
