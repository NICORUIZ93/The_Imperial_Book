// Módulo 23 · F146 · ERROR COMÚN: canary por petición (Math.random) en vez de por usuario.
// El 10 % de las PETICIONES va a v2, pero casi todos los USUARIOS acaban viendo las dos versiones mezcladas.
// Ejecuta: node f146-blue-green-canary/error-comun.js
import { Canary } from './despliegue.js';

const usuarios = Array.from({ length: 1000 }, (_, i) => `u${i}`);
const PETICIONES_POR_USUARIO = 20;
function mezclados(elegir) {
  let ambos = 0;
  for (const u of usuarios) {
    const vistas = new Set(Array.from({ length: PETICIONES_POR_USUARIO }, () => elegir(u)));
    if (vistas.size > 1) ambos++;
  }
  return ambos;
}
console.log(`MAL  (Math.random() < 0.10 por petición): ${mezclados(() => (Math.random() < 0.1 ? 'canary' : 'estable'))} de 1000 usuarios vieron v1 y v2`);
const c = new Canary(10);
console.log(`BIEN (cubeta por usuario, peso 10 %):      ${mezclados((u) => c.elegir(u))} de 1000 usuarios vieron v1 y v2`);
