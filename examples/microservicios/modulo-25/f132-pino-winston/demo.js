// Módulo 21 · F132 · Las mismas tres líneas con Pino y con Winston, dentro de un span de OpenTelemetry.
// Ejecuta: OTEL_SERVICE_NAME=pedidos node --import ./f131-traceparent/trazas.js f132-pino-winston/demo.js
import { trace } from '@opentelemetry/api';
import pino from 'pino';
import { crearLoggerPino } from './logger-pino.js';
import { crearLoggerWinston } from './logger-winston.js';

// sync: true solo para que en la demo las líneas salgan en orden con las de Winston (en producción, asíncrono).
const pinoLog = crearLoggerPino({ servicio: 'pedidos', destino: pino.destination({ dest: 1, sync: true }) });
const winstonLog = crearLoggerWinston({ servicio: 'pedidos' });

pinoLog.info('servicio arrancado'); // fuera de un span: sin trace_id

trace.getTracer('demo').startActiveSpan('POST /pedidos', (span) => {
  // Pino: el OBJETO va PRIMERO y el mensaje después. Un logger hijo fija campos para todo el pedido.
  const log = pinoLog.child({ pedidoId: 'P-7' });
  log.info({ total: 240000, tarjeta: { numero: '4111111111111111', marca: 'visa' } }, 'pedido creado');
  log.debug('esto no sale: el nivel es info');
  log.warn({ intento: 2 }, 'reintentando cobro');

  // Winston: el mensaje va PRIMERO y el objeto después (orden contrario a Pino).
  winstonLog.child({ pedidoId: 'P-7' }).info('pedido creado', { total: 240000, tarjeta: { numero: '4111111111111111', marca: 'visa' } });
  span.end();
});
