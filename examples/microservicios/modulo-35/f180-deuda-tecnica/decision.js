// Módulo 31 · F180 · EJERCICIO DE DECISIÓN: «facturación es nuestro peor hotspot; ¿lo sacamos a un microservicio?».
// Evalúa los criterios del curso (Módulos 5 y 30) con los datos del laboratorio. Ejecuta: node f180-deuda-tecnica/decision.js
import { pathToFileURL } from 'node:url';

// Cada criterio a favor de extraer un servicio: ¿se cumple?
export function decidir(c) {
  const aFavor = [
    ['necesita escalar distinto que el resto', c.escalaDistinto],
    ['otro equipo lo despliega a otro ritmo', c.equipoPropio],
    ['frontera estable: cambia sola, no junto a otro módulo', c.acoplamientoTemporal < 0.3],
    ['requisito propio (aislamiento, regulación, tecnología)', c.requisitoPropio],
  ];
  const cumplidos = aFavor.filter(([, si]) => si).length;
  return { aFavor, extraer: cumplidos >= 2 && c.acoplamientoTemporal < 0.3 };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const facturacion = { escalaDistinto: false, equipoPropio: false, acoplamientoTemporal: 1.0, requisitoPropio: false };
  const r = decidir(facturacion);
  for (const [criterio, si] of r.aFavor) console.log(`${si ? '✔' : '✘'} ${criterio}`);
  console.log(r.extraer ? 'DECISIÓN: extraer a un microservicio'
    : 'DECISIÓN: NO usar microservicios. Refactorizar facturación DENTRO del monolito (módulo con interfaz propia) y medir');
}
