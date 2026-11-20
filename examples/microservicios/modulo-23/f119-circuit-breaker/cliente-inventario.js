// Módulo 19 · F119 · Circuit Breaker con opossum: el cliente del inventario protegido por un circuito.
// Requisitos: Node.js 26.13.1 LTS y opossum 10.0.0 (package.json del laboratorio).
import CircuitBreaker from 'opossum';

/** Error de negocio (4xx): el inventario respondió bien, aunque la respuesta sea «no». No debe abrir el circuito. */
export class ErrorDeNegocio extends Error {
  constructor(status, detalle) {
    super(detalle);
    this.name = 'ErrorDeNegocio';
    this.status = status;
  }
}

/** La llamada «desnuda»: un GET con límite de tiempo. Lanza si no hay conexión, si tarda o si responde 5xx. */
export async function consultarStock(urlBase, sku, { timeoutMs = 1000 } = {}) {
  const r = await fetch(`${urlBase}/stock/${sku}`, { signal: AbortSignal.timeout(timeoutMs) });
  if (r.status >= 500) throw new Error(`inventario respondió ${r.status}`);
  if (!r.ok) throw new ErrorDeNegocio(r.status, (await r.json()).error);
  return r.json();
}

export const OPCIONES_POR_DEFECTO = {
  name: 'inventario',
  timeout: false,               // el límite de tiempo ya lo pone AbortSignal.timeout (y sí cancela la petición)
  volumeThreshold: 4,           // no decide nada hasta ver 4 llamadas en la ventana…
  errorThresholdPercentage: 50, // …y abre cuando falla MÁS del 50 % (comparación estricta: 2 de 4 no abre, 3 de 5 sí)
  rollingCountTimeout: 10_000,  // ventana deslizante de 10 s…
  rollingCountBuckets: 10,      // …en 10 cubetas de 1 s
  resetTimeout: 1000,           // tras 1 s abierto deja pasar UNA llamada de prueba (semiabierto)
};

/**
 * Crea UN circuito para el inventario (uno por dependencia, creado una sola vez al arrancar).
 * `accion` es inyectable para poder probarlo sin red.
 */
export function crearCircuitoDeInventario(urlBase, opciones = {}, accion = (sku) => consultarStock(urlBase, sku)) {
  const circuito = new CircuitBreaker(accion, {
    ...OPCIONES_POR_DEFECTO,
    errorFilter: (error) => error instanceof ErrorDeNegocio, // true = «esto NO cuenta como fallo»
    ...opciones,
  });
  return circuito;
}

/** Estado legible del circuito: CERRADO, ABIERTO o SEMIABIERTO. */
export function estadoDe(circuito) {
  if (circuito.opened) return 'ABIERTO';
  if (circuito.halfOpen) return 'SEMIABIERTO';
  return 'CERRADO';
}
