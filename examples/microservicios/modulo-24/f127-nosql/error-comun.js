// Módulo 20 · F127 · ERROR COMÚN: «limpiar» la entrada borrando los $ con un replace en vez de validar el tipo.
// El filtro casero revisa solo el primer nivel, así que un operador anidado pasa intacto.
// Ejecuta: node f127-nosql/error-comun.js
import * as z from 'zod';

// MAL: lista negra casera, solo mira las claves del primer nivel.
function limpiarMal(cuerpo) {
  const limpio = {};
  for (const [campo, valor] of Object.entries(cuerpo)) if (!campo.startsWith('$')) limpio[campo] = valor;
  return limpio;
}
// BIEN: lista blanca con esquema; lo que no sea exactamente texto se rechaza.
const Credenciales = z.strictObject({ usuario: z.string().max(64), clave: z.string().max(128) });

const ataque = { usuario: 'root', clave: { $ne: null } };
console.log('entrada del atacante :', JSON.stringify(ataque));
console.log('MAL  (lista negra)   :', JSON.stringify(limpiarMal(ataque)), '<- el operador sigue ahí, un nivel más abajo');
const resultado = Credenciales.safeParse(ataque);
console.log('BIEN (esquema zod)   :', resultado.success ? 'aceptada' : `rechazada: ${resultado.error.issues[0].path.join('.')} -> ${resultado.error.issues[0].message}`);
