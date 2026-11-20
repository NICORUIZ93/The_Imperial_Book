// Módulo 28 · F168 · Observability tax: cuánto cuesta ver el sistema (logs, métricas y trazas) frente a lo que cuesta
// ejecutarlo. Precios de CloudWatch Logs, métricas personalizadas y X-Ray (comun/precios.js).
// Uso: node f168-observability-tax/observabilidad.js
import { pathToFileURL } from 'node:url';
import { p, usd } from '../comun/precios.js';

const GB = 1024 ** 3;

/** Bytes reales de una línea de log JSON como la que escribe pino (Módulo 21), medidos con Buffer.byteLength. */
export function bytesPorLinea(extra = {}) {
  const linea = {
    level: 30, time: 1795147884123, pid: 1, hostname: 'pedidos-7d9c6b5f4-x2k8q', servicio: 'pedidos',
    trace_id: '4bf92f3577b34da6a3ce929d0e0e4736', span_id: '00f067aa0ba902b7',
    req: { method: 'POST', url: '/pedidos', id: 'req-1b2c' }, res: { statusCode: 201 }, responseTime: 37, msg: 'request completed',
    ...extra,
  };
  return Buffer.byteLength(JSON.stringify(linea) + '\n');
}

/**
 * Series temporales de un histograma de Prometheus: por cada combinación de etiquetas, un _bucket por cada límite
 * más el +Inf, un _sum y un _count.
 */
export function seriesHistograma(cardinalidades, buckets) {
  const combinaciones = Object.values(cardinalidades).reduce((a, b) => a * b, 1);
  return combinaciones * (buckets + 1 + 2);
}

/** Combinaciones de etiquetas (dimensiones): el producto de cuántos valores distintos toma cada una. */
export const combinaciones = (dims) => Object.values(dims).reduce((a, b) => a * b, 1);

/**
 * Factura mensual de observabilidad. Métricas al precio del PRIMER tramo de CloudWatch (0.30 USD por métrica y mes):
 * por encima de 10 000 métricas el precio por métrica baja, así que para el escenario grande es una cota superior.
 */
export function factura({ peticionesMes, lineasPorPeticion, bytesLinea, retencionMeses, dimensiones, metricasPorCombinacion, muestreoTrazas }) {
  const gbLogs = (peticionesMes * lineasPorPeticion * bytesLinea) / GB;
  return {
    'logs: ingesta': gbLogs * p('logsIngestaGb'),
    'logs: almacenamiento': gbLogs * retencionMeses * p('logsAlmacenGbMes'),
    'métricas': combinaciones(dimensiones) * metricasPorCombinacion * p('metricaMes'),
    'trazas': ((peticionesMes * muestreoTrazas) / 1e6) * p('millonTrazas'),
  };
}

export const ESCENARIOS = {
  ingenuo: {
    nombre: 'Por defecto: INFO en todo, 100 % de trazas, etiqueta pod y código exacto',
    peticionesMes: 30_000_000, lineasPorPeticion: 12, bytesLinea: bytesPorLinea({ user_id: 'u-1029384', body: { items: 3, total: 129900 } }),
    retencionMeses: 12,
    dimensiones: { servicio: 6, ruta: 12, codigo: 5, pod: 60 }, metricasPorCombinacion: 2,
    muestreoTrazas: 1,
  },
  disciplinado: {
    nombre: 'Disciplinado: 1 línea por petición + WARN, 10 % de trazas, sin pod, clase de código',
    peticionesMes: 30_000_000, lineasPorPeticion: 1.2, bytesLinea: bytesPorLinea(),
    retencionMeses: 1,
    dimensiones: { servicio: 6, ruta: 12, clase: 3 }, metricasPorCombinacion: 2,
    muestreoTrazas: 0.1,
  },
};

export function informe(computoMes = 398.14) {
  const lineas = [];
  for (const e of Object.values(ESCENARIOS)) {
    const f = factura(e);
    const total = Object.values(f).reduce((a, b) => a + b, 0);
    lineas.push(`${e.nombre}`);
    lineas.push(`  ${e.bytesLinea} bytes/línea · ${(combinaciones(e.dimensiones) * e.metricasPorCombinacion).toLocaleString('en-US')} métricas · muestreo ${e.muestreoTrazas * 100} % · en Prometheus: ${seriesHistograma(e.dimensiones, 10).toLocaleString('en-US')} series del histograma de latencia`);
    for (const [k, v] of Object.entries(f)) lineas.push(`  ${k.padEnd(22)} ${usd(v).padStart(14)}`);
    lineas.push(`  ${'TOTAL'.padEnd(22)} ${usd(total).padStart(14)}  -> ${((total / computoMes) * 100).toFixed(0)} % de lo que cuesta ejecutar el sistema (${usd(computoMes)}, F165)`);
  }
  return lineas.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) console.log(informe());
