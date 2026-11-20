// Módulo 28 · F168 · ERROR COMÚN: poner un identificador sin límite (user_id, pedido_id, URL con parámetros) como
// ETIQUETA de una métrica. Cada valor nuevo crea series nuevas: la cardinalidad (y la factura o la RAM de Prometheus)
// crece con el número de usuarios, no con el número de servicios.
// Ejecuta: node f168-observability-tax/error-comun.js
import { seriesHistograma, combinaciones } from './observabilidad.js';
import { p, usd } from '../comun/precios.js';

const base = { servicio: 6, ruta: 12, clase: 3 };
for (const [nombre, dims] of [
  ['BIEN etiquetas acotadas      ', base],
  ['MAL  + user_id (1 000 activos)', { ...base, user_id: 1_000 }],
  ['MAL  + user_id (50 000 activos)', { ...base, user_id: 50_000 }],
]) {
  const metricas = combinaciones(dims) * 2;
  console.log(`${nombre.padEnd(31)} -> ${seriesHistograma(dims, 10).toLocaleString('en-US').padStart(13)} series en Prometheus · ${metricas.toLocaleString('en-US').padStart(11)} métricas · cota CloudWatch ${usd(metricas * p('metricaMes')).padStart(16)}/mes`);
}
console.log('Arreglo: el user_id va en el LOG o en el atributo de la TRAZA (alta cardinalidad barata), nunca en la etiqueta.');
