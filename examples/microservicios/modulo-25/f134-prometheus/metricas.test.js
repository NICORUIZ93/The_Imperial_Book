// Módulo 21 · F134 · Verificación: /metrics expone el contador, el histograma y el gauge con las etiquetas correctas.
// Ejecuta: node --test f134-prometheus/metricas.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearServidor } from './servidor.js';
import { crearMetricas } from './metricas.js';

let servidor, base, metricas;
before(async () => {
  metricas = crearMetricas({ servicio: 'pedidos' });
  servidor = crearServidor(metricas);
  await new Promise((r) => servidor.listen(0, r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => servidor.close());

test('cada petición suma en el contador con la RUTA plantilla y el estado', async () => {
  for (const id of ['1', '2', '404']) await fetch(`${base}/pedidos/${id}`);
  const texto = await (await fetch(`${base}/metrics`)).text();
  assert.match(texto, /http_peticiones_total\{metodo="GET",ruta="\/pedidos\/:id",estado="200",servicio="pedidos"\} 2/);
  assert.match(texto, /http_peticiones_total\{metodo="GET",ruta="\/pedidos\/:id",estado="404",servicio="pedidos"\} 1/);
  assert.doesNotMatch(texto, /ruta="\/pedidos\/1"/, 'la URL real nunca es etiqueta');
});

test('el histograma es acumulativo: _count = bucket +Inf y la petición lenta cae en le=0.05', async () => {
  const { values } = await metricas.duracion.get();
  const bucket = (le) => values.find((v) => v.metricName.endsWith('_bucket') && v.labels.le === le).value;
  const count = values.find((v) => v.metricName.endsWith('_count')).value;
  assert.equal(count, 3);
  assert.equal(bucket('+Inf'), count);
  assert.ok(bucket(0.01) <= bucket(0.05), 'los buckets nunca decrecen');
  assert.equal(bucket(0.05), 3, 'la impar de ~30 ms cabe en 0.05 s');
});

test('el gauge vuelve a 0 y las métricas por defecto de Node están presentes', async () => {
  const texto = await (await fetch(`${base}/metrics`)).text();
  assert.match(texto, /http_peticiones_en_curso\{servicio="pedidos"\} 0/);
  assert.match(texto, /# TYPE node_nodejs_eventloop_lag_seconds gauge/);
  assert.match(texto, /# TYPE node_process_cpu_seconds_total counter/);
});

test('error común: registrar dos veces el mismo nombre en un registro lanza error', () => {
  assert.throws(() => crearMetricas().registro.registerMetric(metricas.peticiones), /already been registered/);
});
