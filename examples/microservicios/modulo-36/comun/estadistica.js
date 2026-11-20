// Módulo 32 · percentiles por el método «nearest-rank» (el que usan Gatling y la mayoría de herramientas de carga).
export function percentil(valores, p) {
  if (!valores.length) return 0;
  const s = [...valores].sort((a, b) => a - b);
  return s[Math.max(0, Math.ceil((p / 100) * s.length) - 1)];
}
export const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
