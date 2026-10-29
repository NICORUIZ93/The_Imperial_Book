import { createHash } from 'node:crypto';

/**
 * Asigna siempre el mismo usuario a la misma variante dentro de este ejemplo.
 * No es un sistema de experimentación de producción: no persiste consentimiento,
 * métricas, exclusiones ni reglas de privacidad.
 */
export function abVariant(userId, split = 0.1) {
  if (!userId || !Number.isFinite(split) || split < 0 || split > 1) {
    throw new Error('userId y split válido (0..1) son obligatorios');
  }
  const digest = createHash('sha256').update(userId).digest();
  const bucket = digest.readUInt32BE(0) / 0x1_0000_0000;
  return bucket < split ? 'canary' : 'stable';
}

/**
 * Ejecuta el comportamiento estable y envía una copia a la variante shadow.
 * La respuesta shadow se descarta y el callback recibe solo la respuesta real.
 * El handler shadow debe ser de solo lectura o idempotente para no duplicar
 * efectos de negocio.
 */
export async function serveWithShadow({ request, stable, shadow, timeoutMs = 100 }) {
  if (typeof stable !== 'function' || typeof shadow !== 'function') {
    throw new Error('stable y shadow deben ser funciones');
  }
  const shadowWork = Promise.resolve()
    .then(() => shadow(request))
    .catch(() => undefined);
  const stableResult = await stable(request);
  await Promise.race([
    shadowWork,
    new Promise(resolve => setTimeout(resolve, timeoutMs)),
  ]);
  return stableResult;
}
