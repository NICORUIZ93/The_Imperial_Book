// Módulo 20 · F124 · DESPUÉS (seguro): jwt.verify con lista blanca de algoritmos, ES256, caducidad de 15 min,
// emisor y audiencia comprobados, y la clave pública publicada como JWKS para otros servicios.
// Requisitos: Node.js 26.13.1 LTS, jsonwebtoken 9.0.3 y express 5.3.0. Ejecuta: node f124-jwt/despues.js   (:3224)
import express from 'express';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { autenticar, emitir, generarClaves } from './tokens.js';

const hash = (clave, sal) => scryptSync(clave, sal, 32);
const USUARIOS = { ana: { id: 'u1', rol: 'cliente', sal: 'sal-de-ana', hash: hash('ana123', 'sal-de-ana') } };

export function crearApp(claves = generarClaves()) {
  const clavesPublicas = new Map([[claves.kid, claves.publicKey]]);
  const app = express();
  app.use(express.json());

  app.post('/login', (req, res) => {
    const usuario = USUARIOS[req.body?.usuario];
    const valido = usuario && typeof req.body.clave === 'string' && timingSafeEqual(hash(req.body.clave, usuario.sal), usuario.hash);
    if (!valido) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ token: emitir(claves, usuario), tipo: 'Bearer', expiraEn: 900 });
  });

  // Otros microservicios verifican con la clave PÚBLICA: la descargan de aquí y no pueden emitir tokens.
  app.get('/.well-known/jwks.json', (_req, res) => {
    res.json({ keys: [...clavesPublicas].map(([kid, clave]) => ({ ...clave.export({ format: 'jwk' }), kid, use: 'sig', alg: 'ES256' })) });
  });

  app.get('/admin/ventas', autenticar(clavesPublicas), (req, res) => {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: 'solo administradores' });
    res.json({ ventasDelMes: 184_500_000 });
  });
  app.get('/mi-perfil', autenticar(clavesPublicas), (req, res) => res.json({ id: req.usuario.sub, rol: req.usuario.rol }));
  return app;
}

if (import.meta.main) crearApp().listen(3224, () => console.log('DESPUÉS (seguro) en :3224'));
