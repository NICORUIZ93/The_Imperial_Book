// Módulo 29 · F172 · Ejecuta: node f172-dimensionamiento/demo.js
import { canales, comparar, evaluarTamano, revisarAgrupacion } from './tamano.js';

for (const n of [3, 7, 12, 24]) console.log(`${String(n).padStart(2)} personas → ${String(canales(n)).padStart(3)} canales · ${evaluarTamano(n)}`);
const c = comparar(24, { interfaces: 2 });
console.log(`24 personas en un grupo: ${c.unSoloGrupo} canales · en equipos ${c.tamanos.join('+')}: ${c.canalesInternos} internos + ${c.interfacesEntreEquipos} interfaces entre equipos`);
const g = revisarAgrupacion([8, 8, 8, 7, 9, 6, 8]);
console.log(`Grupo de 7 equipos: ${g.total} personas (límite ${g.limite}) → ${g.ok ? 'ok' : 'partir en dos grupos'}`);
