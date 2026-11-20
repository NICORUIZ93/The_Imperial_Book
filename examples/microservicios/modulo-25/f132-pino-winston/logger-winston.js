// Módulo 21 · F132 · El mismo logger con Winston 3.19.0: formatos encadenables y varios transportes.
// Requisitos: Node.js 26.13.1 LTS, winston 3.19.0, @opentelemetry/api 1.10.0.
import winston from 'winston';
import { camposDeTraza } from './correlacion.js';

const { combine, timestamp, json, errors } = winston.format;

// Un «format» de Winston es una función que recibe la línea (info) y la devuelve transformada.
const conTraza = winston.format((info) => Object.assign(info, camposDeTraza()));
const ocultar = winston.format((info) => {
  if (info.tarjeta?.numero) info.tarjeta = { ...info.tarjeta, numero: '[OCULTO]' };
  return info;
});

export function crearLoggerWinston({ servicio, nivel = process.env.LOG_LEVEL ?? 'info', transporte } = {}) {
  return winston.createLogger({
    level: nivel,
    defaultMeta: { servicio },
    format: combine(errors({ stack: true }), conTraza(), ocultar(), timestamp(), json()),
    transports: [transporte ?? new winston.transports.Console()],
  });
}
