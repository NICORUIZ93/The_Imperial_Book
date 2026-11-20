// Módulo 21 · F132 · Logger JSON con Pino 10.4.0: una línea JSON por evento, lista para Loki o Elasticsearch.
// Requisitos: Node.js 26.13.1 LTS, pino 10.4.0, @opentelemetry/api 1.10.0.
import pino from 'pino';
import { camposDeTraza } from './correlacion.js';

export function crearLoggerPino({ servicio, nivel = process.env.LOG_LEVEL ?? 'info', destino } = {}) {
  return pino({
    level: nivel,                                   // trace < debug < info < warn < error < fatal
    base: { servicio },                             // campos fijos en TODAS las líneas (sin pid ni hostname)
    timestamp: pino.stdTimeFunctions.isoTime,       // "time":"2026-11-19T…Z" en lugar de milisegundos
    formatters: { level: (etiqueta) => ({ level: etiqueta }) }, // "level":"info" en vez de 30
    mixin: camposDeTraza,                           // se llama en cada línea: añade trace_id y span_id
    // Datos sensibles: se reemplazan ANTES de serializar. Rutas con comodín y corchetes para cabeceras.
    redact: { paths: ['req.headers.authorization', 'tarjeta.numero', '*.password'], censor: '[OCULTO]' },
  }, destino); // destino: por defecto stdout (pino.destination(1)); en los tests, un stream en memoria
}
