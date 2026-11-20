// Módulo 20 · F126 · ERROR COMÚN: creer que CORS «bloquea» peticiones. CORS solo le dice al NAVEGADOR si puede
// entregar la respuesta a un script de otro origen. El servidor atiende la petición igual, y curl o cualquier
// programa leen la respuesta sin problema. CORS no sustituye a la autenticación.
// Ejecuta: node f126-helmet-cors/error-comun.js
import { once } from 'node:events';
import { crearApp } from './despues.js';

const servidor = crearApp().listen(0);
await once(servidor, 'listening');
const r = await fetch(`http://127.0.0.1:${servidor.address().port}/api/perfil`, { headers: { origin: 'https://sitio-malo.example' } });
console.log(`petición con Origin no permitido, fuera de un navegador -> ${r.status} ${await r.text()}`);
console.log(`Access-Control-Allow-Origin: ${r.headers.get('access-control-allow-origin') ?? '(no está)'}   <- esto solo detiene al JavaScript de un navegador`);
servidor.close();
