// Módulo 26 · F160 · Error común: réplica ECST sin versión. Si los eventos llegan desordenados (reintentos, particiones
// distintas, varios consumidores), un estado viejo pisa uno nuevo. Ejecuta: node f160-ecst/error-comun.js
import { crearBus, facturacionECST } from './servicios.js';

const llegada = [ // orden en que llegan: v3 se adelantó a v2
  { id: 'TEC-1', nombre: 'Teclado', precio: 130, version: 3 },
  { id: 'TEC-1', nombre: 'Teclado', precio: 120, version: 2 },
];
const mal = facturacionECST(crearBus(), { respetarVersion: false });
const bien = facturacionECST(crearBus());
for (const e of llegada) { mal.aplicar(e); bien.aplicar(e); }
console.log(`MAL  → sin versión: precio = ${mal.precio('TEC-1')} (el catálogo dice 130)`);
console.log(`BIEN → con versión: precio = ${bien.precio('TEC-1')}`);
