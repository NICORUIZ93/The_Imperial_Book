// Módulo 17 · F112 · Configuración centralizada con el KV de Consul.
// Requisitos: Node.js 26.13.1 LTS, consul 2.0.1 (npm) y un agente Consul 2.1.0.
// Capas (de menor a mayor prioridad): valores por defecto < KV de Consul < variables de entorno.
import { EventEmitter } from 'node:events';

const POR_DEFECTO = { 'pagos.timeoutMs': 2000, 'pedidos.montoMaximo': 5000000, 'funciones.envioGratis': false };

// Convierte y valida. Una clave desconocida o un valor inválido NO entran: se conserva lo anterior.
function interpretar(clave, texto) {
  const ejemplo = POR_DEFECTO[clave];
  if (ejemplo === undefined) throw new Error(`clave desconocida: ${clave}`);
  if (typeof ejemplo === 'number') {
    if (!/^\d+$/.test(texto)) throw new Error(`${clave} debe ser un entero y llegó "${texto}"`);
    return Number(texto);
  }
  if (typeof ejemplo === 'boolean') {
    if (texto !== 'true' && texto !== 'false') throw new Error(`${clave} debe ser true o false y llegó "${texto}"`);
    return texto === 'true';
  }
  return texto;
}

// «pagos.timeoutMs» ⇄ variable de entorno «PAGOS_TIMEOUT_MS»
const variableDe = (clave) => clave.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/\./g, '_').toUpperCase();

export function combinar(paresKv, env = process.env) {
  const config = { ...POR_DEFECTO };
  const rechazadas = [];
  const aplicar = (clave, texto, origen) => {
    try { config[clave] = interpretar(clave, texto); } catch (error) { rechazadas.push(`${origen}: ${error.message}`); }
  };
  for (const [clave, texto] of paresKv) aplicar(clave, texto, 'consul');
  for (const clave of Object.keys(POR_DEFECTO)) {
    const texto = env[variableDe(clave)];
    if (texto !== undefined) aplicar(clave, texto, 'entorno');
  }
  return { config: Object.freeze(config), rechazadas };
}

// «config/pedidos/pagos.timeoutMs» → [«pagos.timeoutMs», «1500»]
const aPares = (items, prefijo) => (items ?? []).filter((i) => i.Key !== prefijo).map((i) => [i.Key.slice(prefijo.length), i.Value ?? '']);

// Lee una vez (al arrancar). Si Consul no responde, lanza: el servicio decide si arranca con los valores por defecto.
export async function leerConfig(consul, { prefijo = 'config/pedidos/', env = process.env } = {}) {
  const items = await consul.kv.get({ key: prefijo, recurse: true });
  return combinar(aPares(items, prefijo), env);
}

// Observa el prefijo con una consulta bloqueante (long polling): Consul retiene la petición hasta que
// algo cambia. Emite «cambio» con la configuración nueva y las claves que cambiaron; «rechazo» si llega
// un valor inválido (y entonces se conserva el valor anterior de esa clave).
export function observarConfig(consul, { prefijo = 'config/pedidos/', env = process.env, inicial } = {}) {
  const emisor = new EventEmitter();
  let actual = inicial ?? Object.freeze({ ...POR_DEFECTO });
  const vigilante = consul.watch({
    method: consul.kv.get,
    options: { key: prefijo, recurse: true, wait: '30s' },
    backoffFactor: 200,
  });
  vigilante.on('change', (items) => {
    const { config, rechazadas } = combinar(aPares(items, prefijo), env);
    const nueva = { ...config };
    // Una clave rechazada conserva su valor ANTERIOR (no vuelve al valor por defecto).
    for (const r of rechazadas) {
      const clave = Object.keys(POR_DEFECTO).find((k) => r.includes(` ${k} `));
      if (clave && r.startsWith('consul')) nueva[clave] = actual[clave];
      emisor.emit('rechazo', r);
    }
    const cambiadas = Object.keys(nueva).filter((k) => nueva[k] !== actual[k]);
    if (cambiadas.length === 0) return;
    actual = Object.freeze(nueva);
    emisor.emit('cambio', actual, cambiadas);
  });
  vigilante.on('error', (error) => emisor.emit('sinConsul', error)); // el vigilante reintenta solo con backoff
  emisor.actual = () => actual;
  emisor.detener = () => vigilante.end();
  return emisor;
}
