// Módulo 29 · F169 · Error común: «reorganizamos los equipos por flujo» pero el código sigue con una pieza compartida.
// Los equipos nuevos se pisan en el módulo común y la coordinación vuelve: si solo cambias el organigrama, Conway gana.
// Ejecuta: node f169-conway/error-comun.js
import { analizar, POR_FLUJO } from './conway.js';

// Historial tras la reorganización: cada funcionalidad toca su flujo… y también api/comun/modelos.js, que siguen
// editando los dos equipos. Lo marcamos con una regla más: el módulo común «es de todos» (en la práctica, de nadie).
const reglas = [...POR_FLUJO, ['^api/comun/', 'equipo-compartido']];
const commits = [
  { mensaje: 'Pagar con tarjeta', archivos: ['web/pagos/a.js', 'api/pagos/b.js', 'api/comun/modelos.js'] },
  { mensaje: 'Filtrar por precio', archivos: ['web/catalogo/a.js', 'api/catalogo/b.js', 'api/comun/modelos.js'] },
  { mensaje: 'Pagar con PSE', archivos: ['web/pagos/c.js', 'api/pagos/d.js', 'api/comun/modelos.js'] },
];
const mal = analizar(commits, reglas);
console.log(`MAL  → solo organigrama: ${mal.cruzados}/${mal.commits} cambios cruzan equipos · pares: ${JSON.stringify(mal.pares)}`);

// Arreglo: partir el módulo común para que cada flujo tenga sus propios modelos (el código sigue a los equipos).
const arreglado = [
  { mensaje: 'Pagar con tarjeta', archivos: ['web/pagos/a.js', 'api/pagos/b.js', 'api/pagos/modelos.js'] },
  { mensaje: 'Filtrar por precio', archivos: ['web/catalogo/a.js', 'api/catalogo/b.js', 'api/catalogo/modelos.js'] },
  { mensaje: 'Pagar con PSE', archivos: ['web/pagos/c.js', 'api/pagos/d.js', 'api/pagos/modelos.js'] },
];
const bien = analizar(arreglado, reglas);
console.log(`BIEN → organigrama + código: ${bien.cruzados}/${bien.commits} cambios cruzan equipos`);
