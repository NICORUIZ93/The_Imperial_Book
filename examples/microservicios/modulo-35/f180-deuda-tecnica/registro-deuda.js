// Módulo 31 · F180 · Registro de deuda técnica con «interés»: horas que se pierden cada mes por no pagarla y horas que
// cuesta pagarla. Se prioriza por meses de recuperación (costo / interés): primero lo que antes se amortiza.
// Ejecuta: node f180-deuda-tecnica/registro-deuda.js
import { pathToFileURL } from 'node:url';

export const DEUDAS = [
  { id: 'D1', que: 'facturacion.js: cálculo de impuestos anidado 6 niveles', interesHorasMes: 30, costoHoras: 60, cuadrante: 'imprudente-deliberada' },
  { id: 'D2', que: 'pedidos y facturación comparten tablas (cambian juntos)', interesHorasMes: 20, costoHoras: 120, cuadrante: 'prudente-inadvertida' },
  { id: 'D3', que: 'reportes-legado.js: 9 niveles, nadie lo toca desde 2026-01', interesHorasMes: 0.5, costoHoras: 80, cuadrante: 'imprudente-inadvertida' },
  { id: 'D4', que: 'sin tests de contrato entre la fachada y pedidos-nuevo', interesHorasMes: 12, costoHoras: 16, cuadrante: 'prudente-deliberada' },
  { id: 'D5', que: 'despliegue manual del monolito (2 h por release)', interesHorasMes: 8, costoHoras: 40, cuadrante: 'prudente-deliberada' },
];

export function priorizar(deudas) {
  return deudas.map((d) => ({ ...d, mesesRecuperacion: d.costoHoras / d.interesHorasMes }))
    .sort((a, b) => a.mesesRecuperacion - b.mesesRecuperacion);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log('id  interés h/mes  costo h  se recupera en  qué');
  for (const d of priorizar(DEUDAS)) {
    console.log(`${d.id}  ${String(d.interesHorasMes).padStart(13)}  ${String(d.costoHoras).padStart(7)}  ${(d.mesesRecuperacion.toFixed(1) + ' meses').padStart(14)}  ${d.que}`);
  }
  const total = DEUDAS.reduce((s, d) => s + d.interesHorasMes, 0);
  console.log(`interés total: ${total} h/mes (${(total / 160 * 100).toFixed(0)} % de una persona a tiempo completo)`);
}
