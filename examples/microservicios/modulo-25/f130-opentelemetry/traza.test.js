// Módulo 21 · F130 · Verificación: una petición a pedidos produce UNA traza que cruza los dos servicios.
// Ejecuta: node --test f130-opentelemetry/traza.test.js   (no necesita Docker)
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { arrancar, esperarTexto, detener } from '../comun/procesos.js';

const OTEL = ['--import', './f130-opentelemetry/telemetria.js'];
const hijos = [];
after(() => Promise.all(hijos.map(detener)));

function spans(salida) { // [inventario] SERVER GET traza=… span=… padre=…
  return [...salida.matchAll(/\[(\w+)\] (\w+)\s+(\S+)\s+traza=(\w+) span=(\w+) padre=(\S+)/g)]
    .map(([, servicio, tipo, nombre, traza, span, padre]) => ({ servicio, tipo, nombre, traza, span, padre }));
}

test('pedidos → inventario comparten traza y el SERVER de inventario cuelga del CLIENT de pedidos', async () => {
  const inv = arrancar([...OTEL, 'f130-opentelemetry/inventario.js'], { OTEL_SERVICE_NAME: 'inventario', PORT: '3231' });
  const ped = arrancar([...OTEL, 'f130-opentelemetry/pedidos.js'], { OTEL_SERVICE_NAME: 'pedidos', PORT: '3230', INVENTARIO_URL: 'http://localhost:3231' });
  hijos.push(inv, ped);
  await esperarTexto(inv, 'escuchando'); await esperarTexto(ped, 'escuchando');

  const r = await fetch('http://localhost:3230/pedidos/TEC-1', { method: 'POST' });
  assert.equal(r.status, 201);
  await esperarTexto(ped, 'SERVER   POST'); await esperarTexto(inv, 'SERVER   GET');

  const p = spans(ped.salida), i = spans(inv.salida);
  const servidorPedidos = p.find((s) => s.tipo === 'SERVER');
  const cliente = p.find((s) => s.tipo === 'CLIENT');
  const manual = p.find((s) => s.nombre === 'validar-pedido');
  const servidorInventario = i.find((s) => s.tipo === 'SERVER');
  assert.equal(servidorPedidos.padre, '(raíz)', 'la petición del usuario empieza la traza');
  assert.equal(cliente.padre, servidorPedidos.span, 'el fetch es hijo del SERVER de pedidos');
  assert.equal(manual.padre, servidorPedidos.span, 'el span manual cuelga del span activo');
  assert.equal(servidorInventario.traza, servidorPedidos.traza, 'misma traza en otro proceso: traceparent viajó');
  assert.equal(servidorInventario.padre, cliente.span, 'inventario cuelga del CLIENT de pedidos');
});

test('con TRAZAS=otlp los spans llegan por OTLP/HTTP a /v1/traces con service.name', async () => {
  const recibidos = [];
  const colector = http.createServer((req, res) => {
    let cuerpo = ''; req.on('data', (d) => { cuerpo += d; });
    req.on('end', () => { recibidos.push({ url: req.url, tipo: req.headers['content-type'], cuerpo }); res.end('{}'); });
  });
  await new Promise((r) => colector.listen(0, r));
  const inv = arrancar([...OTEL, 'f130-opentelemetry/inventario.js'], {
    OTEL_SERVICE_NAME: 'inventario', PORT: '3232', TRAZAS: 'otlp',
    OTEL_EXPORTER_OTLP_ENDPOINT: `http://127.0.0.1:${colector.address().port}`,
    OTEL_METRICS_EXPORTER: 'none', OTEL_LOGS_EXPORTER: 'none',
  });
  await esperarTexto(inv, 'escuchando');
  await fetch('http://localhost:3232/stock/TEC-1');
  await detener(inv); // SIGTERM → sdk.shutdown() → el BatchSpanProcessor envía lo pendiente
  colector.close();
  const trazas = recibidos.find((r) => r.url === '/v1/traces');
  assert.ok(trazas, `no llegó nada a /v1/traces (llegó: ${recibidos.map((r) => r.url)})`);
  assert.match(trazas.tipo, /application\/(x-protobuf|json)/);
  assert.ok(trazas.cuerpo.includes('inventario'), 'el recurso lleva service.name=inventario');
});
