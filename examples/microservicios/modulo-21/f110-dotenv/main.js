// Módulo 17 · F110 · Arranque: carga la configuración UNA vez, antes que cualquier otra cosa.
// Ejecuta: node f110-dotenv/main.js
import { cargarConfig, sinSecretos } from './config.js';

let cargada;
try {
  cargada = cargarConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1); // fail-fast: el orquestador verá que el contenedor no arranca
}
console.log(`Origen: ${cargada.origen}`);
console.log(JSON.stringify(sinSecretos(cargada.config), null, 2));
