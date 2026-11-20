// Módulo 19 · F120 · Retry con jitter: reintentos con espera exponencial y aleatoriedad, escritos a mano.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias).
import { setTimeout as dormir } from 'node:timers/promises';

/**
 * Cuánto esperar antes del reintento número `intento` (1 = primer reintento).
 *  - 'ninguno':  base * 2^(intento-1), igual para todos los clientes (¡tormenta de reintentos!)
 *  - 'completo': aleatorio entre 0 y ese valor («full jitter», el que mejor reparte la carga)
 *  - 'igual':    la mitad fija + la otra mitad aleatoria («equal jitter», garantiza una espera mínima)
 * Siempre con tope `maxMs`.
 */
export function esperaMs(intento, { baseMs = 100, maxMs = 5000, jitter = 'completo', aleatorio = Math.random } = {}) {
  const exponencial = Math.min(maxMs, baseMs * 2 ** (intento - 1));
  if (jitter === 'ninguno') return exponencial;
  if (jitter === 'igual') return Math.round(exponencial / 2 + aleatorio() * (exponencial / 2));
  return Math.round(aleatorio() * exponencial);
}

/** Error que NO tiene sentido reintentar (4xx: la petición está mal y seguirá mal). */
export class ErrorNoReintentable extends Error {}

/** Por defecto se reintenta todo salvo ErrorNoReintentable y las cancelaciones del propio llamador. */
export const esReintentablePorDefecto = (error) => !(error instanceof ErrorNoReintentable) && error.name !== 'AbortError';

/**
 * Ejecuta `fn(intento)` hasta `intentos` veces. Entre intentos espera con backoff exponencial + jitter,
 * o lo que pida el servidor en `error.retryAfterMs` (cabecera Retry-After). Respeta `signal` para cancelar.
 */
export async function reintentar(fn, opciones = {}) {
  const { intentos = 3, esReintentable = esReintentablePorDefecto, alReintentar = () => {}, signal } = opciones;
  for (let intento = 1; ; intento += 1) {
    try {
      return await fn(intento);
    } catch (error) {
      if (intento >= intentos || !esReintentable(error)) throw error;
      const espera = error.retryAfterMs ?? esperaMs(intento, opciones);
      alReintentar({ intento, espera, error });
      await dormir(espera, undefined, { signal }); // si `signal` se aborta, la espera termina con AbortError
    }
  }
}

/** GET con reintentos: reintenta fallos de red y 502/503/504; un 4xx es definitivo. Lee Retry-After (en segundos). */
export function getConReintentos(url, opciones = {}) {
  return reintentar(async () => {
    const r = await fetch(url, { signal: AbortSignal.timeout(opciones.timeoutMs ?? 1000) });
    if ([502, 503, 504].includes(r.status)) {
      const error = new Error(`HTTP ${r.status}`);
      const retryAfter = Number(r.headers.get('retry-after'));
      if (retryAfter > 0) error.retryAfterMs = retryAfter * 1000;
      throw error;
    }
    if (!r.ok) throw new ErrorNoReintentable(`HTTP ${r.status}`);
    return r.json();
  }, opciones);
}
