// Módulo 22 · F138 · Una «red» que pierde respuestas: la llamada SÍ se ejecuta en el servidor, pero el cliente
// recibe un timeout. Es el caso que obliga a reintentar y, por tanto, a que todo sea idempotente.
export function redQuePierde(servicio, { perderRespuestas = 0 } = {}) {
  let porPerder = perderRespuestas;
  return new Proxy(servicio, {
    get(destino, metodo) {
      const original = destino[metodo];
      if (typeof original !== 'function') return original;
      return async (...args) => {
        const resultado = original.apply(destino, args);   // el servidor ejecuta…
        if (porPerder > 0) { porPerder--; throw new Error('timeout: no llegó la respuesta'); } // …pero el cliente no lo sabe
        return resultado;
      };
    },
  });
}

// El coordinador de la saga reintenta la compensación hasta que obtiene respuesta (con un tope).
export async function compensarConReintentos(compensacion, { intentos = 5, registro = () => {} } = {}) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const r = await compensacion();
      registro(`intento ${i}: ${JSON.stringify(r)}`);
      return r;
    } catch (error) {
      registro(`intento ${i}: ${error.message}`);
    }
  }
  throw new Error(`compensación sin confirmar tras ${intentos} intentos: revisión manual`);
}
