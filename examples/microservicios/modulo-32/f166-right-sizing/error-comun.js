// Módulo 28 · F166 · ERROR COMÚN: dimensionar la memoria con la MEDIA (o el p50) del uso, como si fuera CPU.
// La memoria no se comprime: cada minuto por encima del límite es un contenedor que el kernel mata (OOMKilled).
// Ejecuta: node f166-right-sizing/error-comun.js
import { generarUso, SERVICIOS } from './uso.js';
import { recomendar, percentil } from './rightsizing.js';

const s = SERVICIOS[0]; // pedidos
const uso = generarUso(s.perfil, 2026);
const media = uso.mem.reduce((a, b) => a + b, 0) / uso.mem.length;
const casos = [
  ['MAL  media × 1,2', Math.ceil(media * 1.2)],
  ['MAL  p50 × 1,2', Math.ceil(percentil(uso.mem, 0.5) * 1.2)],
  ['BIEN máximo × 1,2', recomendar(uso).mib],
];
for (const [nombre, limite] of casos) {
  const fuera = uso.mem.filter((m) => m > limite).length;
  console.log(`${nombre.padEnd(18)} límite ${String(limite).padStart(4)} MiB -> ${String(fuera).padStart(4)} minutos de 10080 por encima (${fuera ? 'OOMKilled' : 'sin reinicios'})`);
}
