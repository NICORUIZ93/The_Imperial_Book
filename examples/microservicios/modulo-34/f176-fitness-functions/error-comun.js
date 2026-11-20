// Módulo 30 · F176 · Error común: una fitness function que da verde falso porque mide mal.
// La versión ingenua solo reconoce «import … from '…'» y no ve el import() dinámico de envios.
// Ejecuta: node f176-fitness-functions/error-comun.js
import { join } from 'node:path';
import { grafoDeImportaciones, INGENUA, sinInternosAjenos } from './fitness.js';

const raiz = join(import.meta.dirname, 'ejemplo-roto');
const mal = sinInternosAjenos(grafoDeImportaciones(raiz, INGENUA));
const bien = sinInternosAjenos(grafoDeImportaciones(raiz));
const perdidas = bien.filter((v) => !mal.includes(v));
console.log(`MAL  → regex ingenua: ${mal.length} violaciones · no ve: ${perdidas.join('; ')}`);
console.log(`BIEN → todas las formas de importar: ${bien.length} violaciones`);
