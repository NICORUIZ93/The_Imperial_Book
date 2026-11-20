// Módulo 17 · F110 · ERROR COMÚN: leer process.env ANTES de que dotenv cargue el archivo.
// Ejecuta: node f110-dotenv/error-comun.js   (con f110-dotenv/.env creado)
// En módulos ES todos los `import` se evalúan antes que el cuerpo del archivo: cliente-pagos.js lee
// process.env.PAGOS_URL al importarse, cuando dotenv.config() todavía no se ha ejecutado.
import dotenv from 'dotenv';
import { join } from 'node:path';
import { urlDePagos } from './cliente-pagos.js';

dotenv.config({ path: join(import.meta.dirname, '.env'), quiet: true });

console.log('PAGOS_URL al importar el cliente:', urlDePagos);
console.log('PAGOS_URL después de dotenv.config():', process.env.PAGOS_URL);
new URL('/cobros', urlDePagos); // TypeError: Invalid URL
