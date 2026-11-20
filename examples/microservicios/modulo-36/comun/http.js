// Módulo 32 · utilidades HTTP sin dependencias (solo node:http).
import http from 'node:http';

// Arranca un servidor en un puerto libre (0) y devuelve su URL base.
export function escuchar(servidor) {
  return new Promise((ok) => servidor.listen(0, '127.0.0.1', () => ok(`http://127.0.0.1:${servidor.address().port}`)));
}

export const cerrar = (servidor) => new Promise((ok) => servidor.close(() => ok()));

// Lee el cuerpo completo de una petición o respuesta.
export async function leerCuerpo(flujo) {
  const trozos = [];
  for await (const t of flujo) trozos.push(t);
  return Buffer.concat(trozos).toString('utf8');
}

export function json(res, estado, cuerpo, cabeceras = {}) {
  res.writeHead(estado, { 'content-type': 'application/json', ...cabeceras });
  res.end(JSON.stringify(cuerpo));
}

// Petición con fetch nativo de Node 26; devuelve estado, cabeceras útiles y cuerpo JSON (o texto).
export async function pedir(url, opciones = {}) {
  const r = await fetch(url, opciones);
  const texto = await r.text();
  let cuerpo;
  try { cuerpo = JSON.parse(texto); } catch { cuerpo = texto; }
  return { estado: r.status, servidoPor: r.headers.get('x-servido-por'), cuerpo };
}

export { http };
