// Módulo 21 · F133 · Pino escribe a la vez en la consola y en Loki (pino.multistream).
// Ejecuta (con docker compose up -d --wait):  node f133-loki/demo.js
// Después, en Grafana (http://localhost:3000 → Explore → Loki):  {servicio="pedidos"} | json | level="error"
import pino from 'pino';
import { LOKI_URL } from '../comun/config.js';
import { crearLoggerPino } from '../f132-pino-winston/logger-pino.js';
import { EnvioLoki } from './envio-loki.js';

const loki = new EnvioLoki({ url: LOKI_URL });
const log = crearLoggerPino({ servicio: 'pedidos', destino: pino.multistream([{ stream: process.stdout }, { stream: loki }]) });

for (let i = 1; i <= 5; i++) log.info({ pedidoId: `P-${i}`, total: i * 1000 }, 'pedido creado');
log.error({ pedidoId: 'P-3' }, 'cobro rechazado');
log.warn({ pedidoId: 'P-4', intento: 2 }, 'reintentando cobro');

await new Promise((r) => loki.end(r)); // _final: envía lo pendiente antes de salir
console.error(`enviadas a Loki: ${loki.enviados} · perdidas: ${loki.fallidos}`);
