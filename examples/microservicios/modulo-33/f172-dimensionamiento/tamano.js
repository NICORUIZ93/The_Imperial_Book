// Módulo 29 · F172 · Dimensionamiento de equipos: canales de comunicación, tamaño de 5 a 9 personas y límites de
// agrupación (Team Topologies, cap. 3, basado en el número de Dunbar).
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.

// Canales de comunicación entre n personas: cada par es un canal → n·(n−1)/2 (Brooks, The Mythical Man-Month).
export const canales = (n) => (n * (n - 1)) / 2;

// «Un grupo estable de cinco a nueve personas que trabajan hacia un objetivo común como una unidad».
export function evaluarTamano(n) {
  if (n < 5) return 'pequeño: frágil ante vacaciones y bajas';
  if (n <= 9) return 'adecuado';
  if (n <= 15) return 'grande: solo funciona con mucha confianza; considera dividir';
  return 'demasiado grande: dividir';
}

// Reparte `personas` en el menor número de equipos de como máximo `maximo` personas, lo más parejos posible.
export function dividir(personas, maximo = 9) {
  const equipos = Math.ceil(personas / maximo);
  const base = Math.floor(personas / equipos);
  const resto = personas % equipos;
  return Array.from({ length: equipos }, (_, i) => base + (i < resto ? 1 : 0));
}

// Compara un solo grupo con la división en equipos. Entre equipos no hablan todos con todos: se comunican por
// `interfaces` explícitas (una API, un contrato o una reunión de sincronización) entre los pares que se necesitan.
export function comparar(personas, { maximo = 9, interfaces } = {}) {
  const tamanos = dividir(personas, maximo);
  const internos = tamanos.reduce((s, n) => s + canales(n), 0);
  const entreEquipos = interfaces ?? canales(tamanos.length); // por defecto, el peor caso: todos los pares
  return { unSoloGrupo: canales(personas), tamanos, canalesInternos: internos, interfacesEntreEquipos: entreEquipos };
}

// Límites de agrupación de equipos del libro: ≈50 personas por grupo de equipos (150 con mucha confianza).
export function revisarAgrupacion(tamanos, { altaConfianza = false } = {}) {
  const total = tamanos.reduce((s, n) => s + n, 0);
  const limite = altaConfianza ? 150 : 50;
  return { total, limite, ok: total <= limite };
}
