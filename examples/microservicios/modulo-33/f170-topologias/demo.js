// Módulo 29 · F170 · Ejecuta: node f170-topologias/demo.js
import { CORREGIDA, INICIAL } from './ejemplo.js';
import { revisar, simularEspera } from './topologia.js';

for (const [nombre, t] of [['inicial', INICIAL], ['corregida', CORREGIDA]]) {
  const avisos = revisar(t);
  console.log(`Topología ${nombre}: ${avisos.length} avisos`);
  for (const a of avisos) console.log(`   - ${a}`);
}
const s = simularEspera({ pedidos: 10, capacidadDia: 2, minutosAutoservicio: 15 });
console.log(`10 equipos piden una base de datos: por tickets esperan ${s.porTickets.mediaDias} días de media (el último, ${s.porTickets.peorDias}); con autoservicio, ${s.autoservicio.minutos} minutos`);
