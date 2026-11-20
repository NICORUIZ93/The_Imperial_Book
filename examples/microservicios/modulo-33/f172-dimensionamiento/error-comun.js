// Módulo 29 · F172 · Error común: «vamos tarde, metamos más gente al mismo equipo».
// Cada persona nueva añade tantos canales como personas ya hay; el equipo pasa más tiempo coordinando que entregando.
// Ejecuta: node f172-dimensionamiento/error-comun.js
import { canales, comparar, evaluarTamano } from './tamano.js';

const n = 7;
for (const nuevas of [0, 3, 5]) {
  const total = n + nuevas;
  console.log(`MAL  → ${total} personas en un equipo: ${canales(total)} canales (+${canales(total) - canales(n)}) · ${evaluarTamano(total)}`);
}
const c = comparar(12, { interfaces: 1 });
console.log(`BIEN → 12 personas como ${c.tamanos.join('+')}: ${c.canalesInternos} canales internos + ${c.interfacesEntreEquipos} interfaz, y cada equipo con su propio flujo`);
