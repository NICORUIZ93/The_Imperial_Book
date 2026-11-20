// Módulo 30 · Utilidades HTTP (node:http) para levantar servicios de ejemplo en puertos libres.
// Requisitos: Node.js 26.13.1 LTS.
import { createServer } from 'node:http';

// Arranca un servicio en 127.0.0.1 y un puerto libre. `manejar(req)` devuelve { estado, cuerpo }.
export async function servicio(nombre, manejar) {
  const servidor = createServer(async (req, res) => {
    let r;
    try {
      r = await manejar(req);
    } catch (error) {
      r = { estado: 502, cuerpo: { error: `${nombre}: ${error.message}` } };
    }
    res.writeHead(r.estado, { 'content-type': 'application/json' }).end(JSON.stringify(r.cuerpo));
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  return {
    nombre,
    url: `http://127.0.0.1:${servidor.address().port}`,
    cerrar: () => new Promise((ok) => { servidor.closeAllConnections(); servidor.close(ok); }),
  };
}

// GET con timeout: lanza un Error con la causa legible (ECONNREFUSED, timeout, HTTP 5xx).
export async function obtener(url, { timeoutMs = 1000 } = {}) {
  let r;
  try {
    r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    throw new Error(`${new URL(url).pathname} → ${error.cause?.code ?? error.name}`);
  }
  const cuerpo = await r.json();
  if (!r.ok) throw new Error(cuerpo.error ?? `HTTP ${r.status}`);
  return cuerpo;
}

// Lee el cuerpo JSON de una petición entrante.
export async function leerJson(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  return texto ? JSON.parse(texto) : {};
}

// POST JSON con timeout; devuelve el cuerpo de la respuesta (lanza si no es 2xx).
export async function enviar(url, cuerpo, { timeoutMs = 1000 } = {}) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
  return json;
}
