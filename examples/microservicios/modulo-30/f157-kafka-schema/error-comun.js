// Módulo 26 · F157 · Error común: añadir un campo SIN valor por defecto. Los consumidores actualizados ya no pueden
// leer los mensajes viejos que siguen en el topic (o los que mandan productores sin actualizar).
// Ejecuta: node f157-kafka-schema/error-comun.js
import { codificar, decodificar } from './formato.js';
import { tipos } from './esquemas.js';

const registro = new Map([[1, tipos.v1], [3, tipos.v2SinDefault]]);
const viejo = codificar(1, tipos.v1, { id: 'P-1', total: 120000 }); // mensaje que ya estaba en el topic
try {
  decodificar(viejo, (id) => registro.get(id), tipos.v2SinDefault);
} catch (error) {
  console.log(`MAL  → consumidor con v2SinDefault: ${error.message.split('\n')[0]}`);
}
console.log(`BIEN → consumidor con v2 (default 'COP'): ${JSON.stringify(decodificar(viejo, (id) => registro.get(id), tipos.v2))}`);
