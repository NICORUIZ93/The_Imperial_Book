// Módulo 32 · F182 · Orquestador LOCAL: ejecuta la misma saga (saga.js) y las mismas actividades sin servidor de Temporal,
// con una política de reintentos parecida a la del workflow (backoff exponencial, errores no reintentables).
// Sirve para desarrollar y para los tests; NO es durable: si el proceso muere a mitad, la saga se pierde. En el
// proyecto entregable usa orquestador-temporal.js (Temporal guarda cada paso y retoma tras una caída).
import { sagaReserva } from './saga.js';
import { espera } from '../comun/estadistica.js';

export function conReintentos(actividades, { intentos = 8, inicialMs = 200, coeficiente = 2, maximoMs = 5_000, alReintentar } = {}) {
  const envueltas = {};
  for (const [nombre, fn] of Object.entries(actividades)) {
    envueltas[nombre] = async (...args) => {
      for (let intento = 1, pausa = inicialMs; ; intento++, pausa = Math.min(pausa * coeficiente, maximoMs)) {
        try { return await fn(...args); }
        catch (e) {
          if (e.nonRetryable || intento >= intentos) throw e;
          alReintentar?.(nombre, intento, e);
          await espera(pausa);
        }
      }
    };
  }
  return envueltas;
}

export function crearOrquestadorLocal(actividades, politica) {
  const act = conReintentos(actividades, politica);
  return { iniciar: (reserva) => sagaReserva(reserva, act) };
}
