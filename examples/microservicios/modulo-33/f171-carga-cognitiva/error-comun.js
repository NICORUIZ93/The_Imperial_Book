// Módulo 29 · F171 · Error común: medir la carga del equipo por «número de microservicios».
// Dos equipos con 3 servicios cada uno parecen iguales; su carga cognitiva no lo es.
// Ejecuta: node f171-carga-cognitiva/error-comun.js
import { evaluar } from './carga.js';

const a = { nombre: 'buscador', servicios: 3, dominios: [{ nombre: 'búsqueda', complejidad: 'complicado' }],
  tecnologias: ['Node.js', 'OpenSearch'], pasosManuales: 0, alertasSemana: 3, encuesta: [4, 4, 4, 5] };
const b = { nombre: 'facturacion', servicios: 3, dominios: [{ nombre: 'facturación electrónica', complejidad: 'complejo' },
  { nombre: 'conciliación bancaria', complejidad: 'complicado' }], tecnologias: ['Java', 'Node.js', 'PostgreSQL', 'MySQL', 'RabbitMQ'],
  pasosManuales: 6, alertasSemana: 18, encuesta: [2, 3, 2, 2] };

console.log(`MAL  → por número de servicios: ${a.nombre}=${a.servicios} · ${b.nombre}=${b.servicios} → «misma carga»`);
const [ea, eb] = [evaluar(a), evaluar(b)];
console.log(`BIEN → por tipo de carga: ${ea.equipo}=${ea.avisos.length} avisos (encuesta ${ea.encuesta}) · ${eb.equipo}=${eb.avisos.length} avisos (encuesta ${eb.encuesta})`);
