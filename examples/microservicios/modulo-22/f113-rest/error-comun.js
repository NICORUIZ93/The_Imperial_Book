// Módulo 18 · F113 · ERROR COMÚN: creer que fetch lanza una excepción cuando el servidor responde 404 o 503.
// Ejecuta (con el servicio arrancado): node f113-rest/error-comun.js
const base = process.env.INVENTARIO_URL ?? 'http://localhost:3113';

try {
  const res = await fetch(`${base}/existencias/ROTO`); // el servidor responde 503
  const { disponibles } = await res.json(); // …y aquí nadie miró res.ok
  console.log('disponibles:', disponibles);
  if (disponibles > 0) console.log('hay existencias');
  else console.log('SIN existencias → se rechaza el pedido (¡pero inventario solo estaba en mantenimiento!)');
} catch (error) {
  console.log('nunca llega aquí con un 503:', error.message);
}
