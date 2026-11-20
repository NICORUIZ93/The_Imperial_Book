// Módulo 19 · Cliente mínimo de la API HTTP de Toxiproxy 2.13.0 (puerto 8474) para los scripts de simulación.
// Requisitos: Node.js 26.13.1 LTS (usa fetch nativo). La infraestructura se levanta con docker compose up -d --wait.
export const TOXIPROXY_API = process.env.TOXIPROXY_API ?? 'http://127.0.0.1:8474';
export const INVENTARIO_URL = process.env.INVENTARIO_URL ?? 'http://127.0.0.1:21212'; // inventario A TRAVÉS de Toxiproxy
export const INVENTARIO_DIRECTO = process.env.INVENTARIO_DIRECTO ?? 'http://127.0.0.1:9000'; // sin proxy (control)
export const REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:26379'; // Redis A TRAVÉS de Toxiproxy

async function api(metodo, ruta, cuerpo) {
  const r = await fetch(`${TOXIPROXY_API}${ruta}`, {
    method: metodo,
    headers: { 'content-type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!r.ok) throw new Error(`Toxiproxy ${metodo} ${ruta} -> ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}

/** Latencia fija en cada respuesta (toxic "latency"). */
export const lento = (proxy, ms) => api('POST', `/proxies/${proxy}/toxics`, {
  name: 'lento', type: 'latency', stream: 'downstream', toxicity: 1, attributes: { latency: ms, jitter: 0 },
});
/** Acepta la conexión y nunca entrega datos (toxic "timeout" con timeout 0). */
export const cuelga = (proxy) => api('POST', `/proxies/${proxy}/toxics`, {
  name: 'cuelga', type: 'timeout', stream: 'downstream', toxicity: 1, attributes: { timeout: 0 },
});
/** Apaga el proxy: conexión rechazada, como un servicio caído. */
export const apagar = (proxy) => api('POST', `/proxies/${proxy}`, { enabled: false });
export const encender = (proxy) => api('POST', `/proxies/${proxy}`, { enabled: true });
/** Quita todos los toxics y enciende todos los proxies. */
export const sanar = () => api('POST', '/reset');

export const dormir = (ms) => new Promise((ok) => setTimeout(ok, ms));
export const control = (ruta, metodo = 'GET') => fetch(`${INVENTARIO_DIRECTO}${ruta}`, { method: metodo }).then((r) => r.json());
