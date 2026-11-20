// Módulo 30 · F174 · Error común: un microservicio por entidad (clientes, direcciones, teléfonos…).
// Las entidades de un mismo agregado cambian juntas: cada funcionalidad toca 2 o 3 servicios y 2 o 3 despliegues.
// Ejecuta: node f174-sobre-descomposicion/error-comun.js
import { granularidad } from './nano.js';

const cambios = [ // las últimas 5 funcionalidades del área de clientes
  ['clientes-svc', 'direcciones-svc'], ['clientes-svc', 'telefonos-svc'], ['clientes-svc', 'direcciones-svc', 'telefonos-svc'],
  ['direcciones-svc', 'clientes-svc'], ['clientes-svc', 'telefonos-svc'],
];
const mal = granularidad({ servicios: ['clientes-svc', 'direcciones-svc', 'telefonos-svc'], desarrolladores: 3, cambios });
console.log(`MAL  → un servicio por entidad: ${mal.cambiosMultiServicio} de los cambios tocan varios servicios · fusionar: ${mal.fusionar.join(', ')}`);

const juntos = cambios.map(() => ['clientes-svc']); // el agregado Cliente en un solo servicio
const bien = granularidad({ servicios: ['clientes-svc'], desarrolladores: 3, cambios: juntos });
console.log(`BIEN → un servicio por agregado: ${bien.cambiosMultiServicio} de los cambios tocan varios servicios`);
