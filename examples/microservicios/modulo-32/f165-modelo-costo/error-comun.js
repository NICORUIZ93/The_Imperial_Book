// Módulo 28 · F165 · ERROR COMÚN: presupuestar solo el cómputo («6 servicios × 3 tareas») y olvidar la red y los logs.
// Ejecuta: node f165-modelo-costo/error-comun.js
import { readFileSync } from 'node:fs';
import { costear } from './modelo.js';
import { usd } from '../comun/precios.js';

const arq = JSON.parse(readFileSync(new URL('./microservicios.json', import.meta.url)));
const solo = costear(arq, { soloComputo: true }).total;
const real = costear(arq).total;
console.log(`presupuesto «solo cómputo»: ${usd(solo)}/mes`);
console.log(`modelo completo:            ${usd(real)}/mes`);
console.log(`infravaloración:            ${usd(real - solo)}/mes (${(((real - solo) / real) * 100).toFixed(1)} % de la factura)`);
