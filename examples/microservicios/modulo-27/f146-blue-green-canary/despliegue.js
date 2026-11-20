// Módulo 23 · F146 · Lógica de Blue-Green y Canary, sin dependencias: a qué versión va cada usuario y cuándo abortar.
// Requisitos: Node.js 26.13.1 LTS.
import { createHash } from 'node:crypto';

/** Cubeta estable 0..99 por usuario: el mismo usuario cae siempre en la misma versión (sesiones coherentes). */
export function cubeta(usuario) {
  return Number.parseInt(createHash('sha256').update(String(usuario)).digest('hex').slice(0, 8), 16) % 100;
}

/** Blue-Green: TODO el tráfico va al color activo; cambiar es un solo paso atómico (y volver atrás, también). */
export class BlueGreen {
  constructor(activo = 'blue') { this.activo = activo; }
  elegir() { return this.activo; }
  cambiar() { this.activo = this.activo === 'blue' ? 'green' : 'blue'; return this.activo; }
}

/** Canary: un porcentaje del tráfico (por usuario) va a la versión nueva. */
export class Canary {
  constructor(peso = 0) { this.peso = peso; }
  elegir(usuario) { return cubeta(usuario) < this.peso ? 'canary' : 'estable'; }
}

/**
 * Análisis del canary: compara la tasa de error de la versión nueva con la estable.
 * Devuelve 'esperar' si aún no hay datos suficientes, 'abortar' si la nueva es peor que el umbral, o 'continuar'.
 */
export function analizar({ estable, canary }, { minPeticiones = 20, maxTasaError = 0.02, maxDiferencia = 0.01 } = {}) {
  if (canary.total < minPeticiones) return 'esperar';
  const tasa = canary.errores / canary.total;
  const base = estable.total ? estable.errores / estable.total : 0;
  return tasa > maxTasaError || tasa - base > maxDiferencia ? 'abortar' : 'continuar';
}
