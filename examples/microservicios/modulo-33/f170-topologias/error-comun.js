// Módulo 29 · F170 · Error común: renombrar el equipo de operaciones a «plataforma» sin cambiar cómo trabaja.
// Sigue atendiendo tickets uno a uno, así que la espera de los equipos stream-aligned crece con cada equipo nuevo.
// Ejecuta: node f170-topologias/error-comun.js
import { simularEspera } from './topologia.js';

for (const pedidos of [4, 10, 20]) {
  const mal = simularEspera({ pedidos, capacidadDia: 2, minutosAutoservicio: 15 });
  console.log(`MAL  → «plataforma» por tickets, ${pedidos} equipos: espera media ${mal.porTickets.mediaDias} días, la peor ${mal.porTickets.peorDias}`);
}
console.log('BIEN → plataforma como producto (autoservicio): 15 minutos, haya 4, 10 o 20 equipos');
