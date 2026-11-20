// Módulo 31 · F180 · ERROR COMÚN: priorizar la deuda por «el código más feo» (solo complejidad) en lugar de por
// hotspot (complejidad × frecuencia de cambio). Se reescribe un archivo que nadie toca y no se recupera nada.
// Ejecuta: node f180-deuda-tecnica/error-comun.js
import { analizar } from './hotspots.js';
import { generarRepo } from './generar-repo.js';

const { filas } = analizar(generarRepo());
const masFeo = [...filas].sort((a, b) => b.complejidad - a.complejidad)[0];
const hotspot = filas[0];
console.log(`por «más feo»: ${masFeo.archivo} (complejidad ${masFeo.complejidad}, ${masFeo.revisiones - 1} cambios desde el inicial)`);
console.log(`por hotspot:   ${hotspot.archivo} (complejidad ${hotspot.complejidad}, ${hotspot.revisiones - 1} cambios desde el inicial)`);
