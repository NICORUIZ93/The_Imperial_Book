// Módulo 27 · cliente HTTP/HTTPS de los ataques y los tests: devuelve { status, body } o { error: código }.
import http from 'node:http';
import https from 'node:https';

/**
 * llamar('https://127.0.0.1:4161/cobros', { metodo, cabeceras, cuerpo, tls: { cert, key, ca } })
 * Nunca lanza: los fallos de red o de TLS vuelven como { error: 'ERR_…' } para poder imprimirlos.
 */
export function llamar(url, { metodo = 'GET', cabeceras = {}, cuerpo, tls } = {}) {
  const u = new URL(url);
  const mod = u.protocol === 'https:' ? https : http;
  const datos = cuerpo === undefined ? undefined : JSON.stringify(cuerpo);
  return new Promise((resolve) => {
    const req = mod.request(u, {
      method: metodo,
      agent: false, // sin reutilizar conexiones: cada llamada hace su propio handshake
      headers: { ...(datos ? { 'content-type': 'application/json' } : {}), ...cabeceras },
      ...(tls ?? {}),
      servername: u.hostname === '127.0.0.1' ? 'localhost' : u.hostname,
      timeout: 3000,
    }, (res) => {
      let texto = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (texto += c));
      res.on('end', () => {
        let body = texto;
        try { body = JSON.parse(texto); } catch { /* texto plano */ }
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });
    req.on('timeout', () => req.destroy(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })));
    req.on('error', (e) => resolve({ error: e.code ?? e.message }));
    if (datos) req.write(datos);
    req.end();
  });
}

/** Lee el cuerpo JSON de una petición entrante. */
export function leerJson(req) {
  return new Promise((resolve) => {
    let t = '';
    req.setEncoding('utf8');
    req.on('data', (c) => (t += c));
    req.on('end', () => { try { resolve(t ? JSON.parse(t) : {}); } catch { resolve(null); } });
  });
}

export function responder(res, status, obj, cabeceras = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...cabeceras });
  res.end(JSON.stringify(obj));
}

/** Arranca un servidor en el puerto dado (0 = libre) y devuelve { servidor, puerto, cerrar }. */
export function escuchar(servidor, puerto = 0, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    servidor.once('error', reject);
    servidor.listen(puerto, host, () => resolve({
      servidor,
      puerto: servidor.address().port,
      cerrar: () => new Promise((r) => { servidor.closeAllConnections?.(); servidor.close(() => r()); }),
    }));
  });
}

/** Formatea el resultado de llamar() en una línea: «200 {...}» o «sin conexión: ERR_…». */
export function resumen(r) {
  if (r.error) return `rechazado en la conexión (${r.error})`;
  return `${r.status} ${typeof r.body === 'string' ? r.body : JSON.stringify(r.body)}`;
}
