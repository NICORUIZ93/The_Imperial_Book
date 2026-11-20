// Módulo 21 · F133 · Verificación: el payload tiene la forma de la API de push de Loki y respeta la cardinalidad.
// Ejecuta: node --test f133-loki/loki.test.js   (usa un Loki falso: no necesita Docker)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import pino from 'pino';
import { aPayloadLoki, EnvioLoki } from './envio-loki.js';
import { lokiFalso } from './loki-falso.js';
import { crearLoggerPino } from '../f132-pino-winston/logger-pino.js';

test('un stream por combinación de etiquetas; marcas de tiempo en nanosegundos como string', () => {
  const ns = '1763600000000000000';
  const payload = aPayloadLoki([
    { linea: '{"servicio":"pedidos","level":"info","pedidoId":"P-1"}', ns },
    { linea: '{"servicio":"pedidos","level":"info","pedidoId":"P-2"}', ns },
    { linea: '{"servicio":"pedidos","level":"error","pedidoId":"P-3"}', ns },
  ], { entorno: 'lab' });
  assert.equal(payload.streams.length, 2, 'info y error: 2 streams, NO uno por pedido');
  assert.deepEqual(payload.streams[0].stream, { entorno: 'lab', servicio: 'pedidos', level: 'info' });
  assert.equal(payload.streams[0].values.length, 2);
  assert.equal(typeof payload.streams[0].values[0][0], 'string');
  assert.match(payload.streams[0].values[0][0], /^\d{19}$/);
  assert.equal(JSON.parse(payload.streams[0].values[0][1]).pedidoId, 'P-1', 'el id viaja en la línea, no en la etiqueta');
});

test('Pino → EnvioLoki → POST /loki/api/v1/push: llegan todas las líneas en lotes', async () => {
  const loki = await lokiFalso();
  const envio = new EnvioLoki({ url: loki.url, lote: 3, cadaMs: 50 });
  const log = crearLoggerPino({ servicio: 'pedidos', destino: envio });
  for (let i = 1; i <= 7; i++) log.info({ pedidoId: `P-${i}` }, 'pedido creado');
  log.error('cobro rechazado');
  await new Promise((r) => setTimeout(r, 300));
  await new Promise((r) => envio.end(r));
  loki.cerrar();
  const lineas = loki.recibidos.flatMap((p) => p.streams.flatMap((s) => s.values));
  assert.equal(lineas.length, 8);
  assert.equal(envio.enviados, 8);
  assert.ok(loki.recibidos.length >= 2, 'se envió en más de un lote');
});

test('si Loki no responde, se cuentan las líneas perdidas y el servicio sigue', async () => {
  const envio = new EnvioLoki({ url: 'http://127.0.0.1:9', cadaMs: 10_000 });
  const log = crearLoggerPino({ servicio: 'pedidos', destino: pino.multistream([{ stream: envio }]) });
  log.info('uno'); log.info('dos');
  await new Promise((r) => envio.end(r));
  assert.equal(envio.fallidos, 2);
  assert.equal(envio.enviados, 0);
});
