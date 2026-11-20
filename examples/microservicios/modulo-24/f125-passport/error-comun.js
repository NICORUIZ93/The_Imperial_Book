// Módulo 20 · F125 · ERROR COMÚN: olvidar { session: false } en una API sin sesiones. Passport intenta guardar el
// usuario en req.session, que no existe, y el login correcto responde 500.
// Ejecuta: node f125-passport/error-comun.js
import express from 'express';
import passport from 'passport';
import { Strategy as EstrategiaLocal } from 'passport-local';
import { once } from 'node:events';

const autenticador = new passport.Passport();
autenticador.use(new EstrategiaLocal((usuario, clave, listo) => listo(null, usuario === 'ana' && clave === 'ana123' ? { id: 'u1' } : false)));

const app = express();
app.use(express.json());
app.post('/mal/login', autenticador.authenticate('local'), (req, res) => res.json({ ok: true }));                    // falta session: false
app.post('/bien/login', autenticador.authenticate('local', { session: false }), (req, res) => res.json({ ok: true }));
app.use((error, _req, res, _next) => res.status(500).json({ error: error.message }));

const servidor = app.listen(0);
await once(servidor, 'listening');
for (const ruta of ['/mal/login', '/bien/login']) {
  const r = await fetch(`http://127.0.0.1:${servidor.address().port}${ruta}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"username":"ana","password":"ana123"}' });
  console.log(`POST ${ruta.padEnd(11)} -> ${r.status} ${await r.text()}`);
}
servidor.close();
