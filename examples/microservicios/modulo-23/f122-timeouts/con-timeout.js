// Módulo 19 · F122 · Timeouts: límite de tiempo que SÍ cancela la petición, y presupuesto que viaja entre servicios.
// Requisitos: Node.js 26.13.1 LTS (fetch, AbortSignal.timeout y AbortSignal.any son nativos).

/**
 * fetch con límite de tiempo total (conexión + cabeceras + cuerpo). Al vencer, la petición se CANCELA (se cierra el
 * socket) y la promesa se rechaza con TimeoutError. Si el llamador pasa su propia `signal`, cualquiera de las dos corta.
 */
export async function fetchConTimeout(url, { timeoutMs, signal, ...opciones } = {}) {
  const limite = AbortSignal.timeout(timeoutMs);
  const r = await fetch(url, { ...opciones, signal: signal ? AbortSignal.any([limite, signal]) : limite });
  const cuerpo = await r.text(); // leer el cuerpo DENTRO del límite: las cabeceras pueden llegar rápido y el cuerpo no
  return { status: r.status, cuerpo: cuerpo ? JSON.parse(cuerpo) : null };
}

export const CABECERA = 'x-timeout-ms'; // presupuesto restante, relativo (como grpc-timeout): no depende de relojes sincronizados

/**
 * Presupuesto de una petición entrante: cuánto tiempo queda para responder. Lo fija la cabecera x-timeout-ms del
 * llamador o, si no viene, `porDefectoMs`. Nunca supera `maximoMs` (no te fíes de un cliente que pide 1 hora).
 */
export function presupuestoDe(cabeceras, { porDefectoMs = 2000, maximoMs = 10_000 } = {}) {
  const pedido = Number(cabeceras[CABECERA]);
  const total = Math.min(maximoMs, pedido > 0 ? pedido : porDefectoMs);
  const vence = performance.now() + total;
  return {
    total,
    restante: () => Math.max(0, Math.round(vence - performance.now())),
    /** Tiempo para la siguiente llamada: lo que queda menos un margen para poder responder nosotros. */
    paraLlamar: (margenMs = 50) => Math.max(1, Math.round(vence - performance.now()) - margenMs),
  };
}

export const esTimeout = (error) => error.name === 'TimeoutError';
