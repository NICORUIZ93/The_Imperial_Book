// Módulo 24 · F151 · Tests de las fitness functions. Ejecuta: node --test f151-fitness/fitness.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { consultas, cuantil, delta, evaluar, medir, medirEnPrometheus, parsear } from './fitness.js';
import { crearServidor } from './servicio.js';

test('cuantil interpola dentro del cubo como histogram_quantile', () => {
  // 1000 observaciones: 980 en ≤ 0.3 s y 20 entre 0.3 y 0.5 s -> p99 = 0.3 + 0.2 × (990 − 980) / 20 = 0.4
  const cubos = [{ le: 0.1, cuenta: 900 }, { le: 0.3, cuenta: 980 }, { le: 0.5, cuenta: 1000 }, { le: Infinity, cuenta: 1000 }];
  assert.ok(Math.abs(cuantil(0.99, cubos) - 0.4) < 1e-9);
  assert.ok(Math.abs(cuantil(0.5, cubos) - 0.1 * 500 / 900) < 1e-9);
});

test('parsear lee nombre, etiquetas y valor del formato de texto de Prometheus', () => {
  const [s] = parsear('# HELP x y\nhttp_requests_total{ruta="/pedidos",codigo="500"} 3\n');
  assert.deepEqual(s, { nombre: 'http_requests_total', etiquetas: { ruta: '/pedidos', codigo: '500' }, valor: 3 });
});

test('delta cuenta solo lo ocurrido en la ventana', () => {
  const antes = parsear('http_requests_total{ruta="/pedidos",codigo="200"} 9000');
  const despues = parsear('http_requests_total{ruta="/pedidos",codigo="200"} 9990\nhttp_requests_total{ruta="/pedidos",codigo="500"} 10');
  assert.deepEqual(delta(antes, despues).map((s) => s.valor), [990, 10]);
  assert.equal(medir(delta(antes, despues)).FF2, 0.01);
});

test('evaluar marca cada función con su límite', () => {
  const r = evaluar({ FF1: 0.25, FF2: 0.002, FF3: 1 });
  assert.deepEqual(r.map((x) => [x.id, x.ok]), [['FF1', true], ['FF2', false], ['FF3', true]]);
});

test('con el servicio real: 200 pedidos sanos cumplen las tres funciones', async () => {
  const servidor = crearServidor().listen(0);
  await once(servidor, 'listening');
  try {
    const base = `http://127.0.0.1:${servidor.address().port}`;
    const leer = async () => parsear(await fetch(`${base}/metrics`).then((r) => r.text()));
    const antes = await leer();
    // En tandas de 20: 200 conexiones a la vez agotan la cola de escucha en macOS (ECONNRESET).
    for (let i = 0; i < 200; i += 20) {
      await Promise.all(Array.from({ length: 20 }, (_, j) => fetch(`${base}/pedidos/t${i + j}`).then((r) => r.text())));
    }
    const valores = medir(delta(antes, await leer()));
    assert.equal(valores.peticiones, 200);
    assert.deepEqual(valores.destinos, ['inventario']);
    assert.ok(evaluar(valores).every((r) => r.ok), JSON.stringify(valores));
  } finally {
    // Cerrar SIEMPRE: si una petición falla y el servidor queda escuchando, el proceso de test no termina nunca.
    servidor.closeAllConnections();
    servidor.close();
  }
});

test('las consultas PromQL filtran por job y usan rate en ventana de 5 minutos', () => {
  for (const q of Object.values(consultas('pedidos-v2'))) assert.match(q, /rate\(\w+\{job="pedidos-v2".*\}\[5m\]\)/);
});

test('medirEnPrometheus lee la respuesta de /api/v1/query (doble local de la API de Prometheus)', async () => {
  const respuestas = { histogram_quantile: '0.367', sum: '0.013', count: '2' };
  const doble = createServer((req, res) => {
    const q = new URL(req.url, 'http://x').searchParams.get('query');
    const valor = respuestas[Object.keys(respuestas).find((k) => q.startsWith(k))];
    res.end(JSON.stringify({ status: 'success', data: { resultType: 'vector', result: [{ metric: {}, value: [1795148263.5, valor] }] } }));
  }).listen(0);
  await once(doble, 'listening');
  const valores = await medirEnPrometheus(`http://127.0.0.1:${doble.address().port}`, 'pedidos-v2');
  doble.close();
  assert.deepEqual(valores, { FF1: 0.367, FF2: 0.013, FF3: 2 });
  assert.deepEqual(evaluar(valores).map((r) => r.ok), [false, false, false]);
});
