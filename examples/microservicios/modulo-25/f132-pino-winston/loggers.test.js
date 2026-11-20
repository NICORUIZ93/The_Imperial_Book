// Módulo 21 · F132 · Verificación: los dos loggers escriben JSON con servicio, nivel, trace_id y datos ocultos.
// Ejecuta: node --import ./f131-traceparent/trazas.js --test f132-pino-winston/loggers.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { trace } from '@opentelemetry/api';
import winston from 'winston';
import { crearLoggerPino } from './logger-pino.js';
import { crearLoggerWinston } from './logger-winston.js';

function memoria() { // stream que guarda cada línea JSON escrita
  const lineas = [];
  const stream = new Writable({ write(trozo, _c, listo) { lineas.push(...trozo.toString().trim().split('\n').map((l) => JSON.parse(l))); listo(); } });
  return { stream, lineas };
}
const enSpan = (fn) => trace.getTracer('test').startActiveSpan('peticion', (s) => { try { return fn(s); } finally { s.end(); } });

test('Pino: JSON con servicio y nivel en texto, trace_id del span activo y la tarjeta oculta', () => {
  const { stream, lineas } = memoria();
  const log = crearLoggerPino({ servicio: 'pedidos', destino: stream });
  enSpan((span) => log.info({ tarjeta: { numero: '4111111111111111' } }, 'pedido creado'));
  const [l] = lineas;
  assert.equal(l.servicio, 'pedidos');
  assert.equal(l.level, 'info');
  assert.equal(l.msg, 'pedido creado');
  assert.match(l.trace_id, /^[0-9a-f]{32}$/);
  assert.equal(l.tarjeta.numero, '[OCULTO]');
  assert.equal(l.pid, undefined, 'base reemplaza pid y hostname');
});

test('Pino: el nivel filtra (debug no sale con info) y el hijo añade sus campos a cada línea', () => {
  const { stream, lineas } = memoria();
  const log = crearLoggerPino({ servicio: 'pedidos', nivel: 'info', destino: stream }).child({ pedidoId: 'P-1' });
  log.debug('no sale'); log.warn('sí sale');
  assert.equal(lineas.length, 1);
  assert.deepEqual([lineas[0].level, lineas[0].pedidoId], ['warn', 'P-1']);
});

test('Pino: un Error en «err» se serializa con type, message y stack', () => {
  const { stream, lineas } = memoria();
  crearLoggerPino({ servicio: 'pedidos', destino: stream }).error({ err: new Error('boom') }, 'falló');
  assert.equal(lineas[0].err.type, 'Error');
  assert.equal(lineas[0].err.message, 'boom');
  assert.match(lineas[0].err.stack, /^Error: boom/);
});

test('Winston: mismos campos (message en vez de msg), trace_id y tarjeta oculta', () => {
  const { stream, lineas } = memoria();
  const log = crearLoggerWinston({ servicio: 'pedidos', transporte: new winston.transports.Stream({ stream }) });
  enSpan((span) => {
    log.info('pedido creado', { tarjeta: { numero: '4111111111111111' } });
    assert.equal(lineas[0].trace_id, span.spanContext().traceId);
  });
  assert.deepEqual([lineas[0].servicio, lineas[0].level, lineas[0].message], ['pedidos', 'info', 'pedido creado']);
  assert.equal(lineas[0].tarjeta.numero, '[OCULTO]');
});

test('error común: en Pino el objeto como SEGUNDO argumento se pierde', () => {
  const { stream, lineas } = memoria();
  crearLoggerPino({ servicio: 'pedidos', destino: stream }).info('pedido creado', { id: 'P-1' });
  assert.equal(lineas[0].id, undefined);
});
