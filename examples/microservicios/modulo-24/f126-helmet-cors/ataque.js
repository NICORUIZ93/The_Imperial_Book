// Módulo 20 · F126 · El ataque: una página en https://sitio-malo.example intenta leer /api/perfil con las credenciales
// de la víctima. El navegador solo entrega la respuesta al script si el servidor contesta con
// Access-Control-Allow-Origin igual a ese origen (y Allow-Credentials: true). Ejecuta: node f126-helmet-cors/ataque.js
import { once } from 'node:events';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const SEGURIDAD = ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'cross-origin-resource-policy', 'x-powered-by'];

async function probar(nombre, app) {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  const url = `http://127.0.0.1:${servidor.address().port}/api/perfil`;
  console.log(`== ${nombre}`);
  for (const origen of ['https://sitio-malo.example', 'https://tienda.example']) {
    const r = await fetch(url, { headers: { origin: origen } });
    const acao = r.headers.get('access-control-allow-origin');
    const lee = acao === origen && r.headers.get('access-control-allow-credentials') === 'true';
    console.log(`   Origin ${origen.padEnd(27)} -> Allow-Origin: ${(acao ?? '(no está)').padEnd(27)} · el navegador ${lee ? 'ENTREGA' : 'BLOQUEA'} la respuesta al script`);
  }
  const pre = await fetch(url, { method: 'OPTIONS', headers: { origin: 'https://tienda.example', 'access-control-request-method': 'DELETE', 'access-control-request-headers': 'authorization' } });
  console.log(`   preflight DELETE desde la tienda  -> ${pre.status} métodos=${pre.headers.get('access-control-allow-methods')} max-age=${pre.headers.get('access-control-max-age')}`);
  const r = await fetch(url);
  console.log('   cabeceras de seguridad:');
  for (const cabecera of SEGURIDAD) console.log(`     ${cabecera}: ${r.headers.get(cabecera) ?? '(no está)'}`);
  servidor.close();
}
await probar('ANTES (vulnerable)', crearAntes());
await probar('DESPUÉS (seguro)', crearDespues());
