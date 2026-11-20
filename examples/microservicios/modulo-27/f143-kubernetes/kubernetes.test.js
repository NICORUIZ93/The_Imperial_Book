// Módulo 23 · F143 · Tests de los manifiestos y del ciclo de vida que Kubernetes espera del contenedor.
// Requisitos: npm run build (usa dist/servidor.js). Ejecuta: node --test f143-kubernetes/kubernetes.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cargar, validar } from './validar.js';

test('los manifiestos de k8s/ no tienen problemas', () => {
  assert.deepEqual(validar(cargar(['k8s'])), []);
});

test('detecta el Service cuyo selector no elige ningún pod', () => {
  assert.deepEqual(validar(cargar(['f143-kubernetes/error-comun.yaml'])), ['Service tienda/pedidos: el selector {"app":"pedido"} no elige ningún pod (Endpoints vacíos)']);
});

test('detecta probes, requests y versión de imagen ausentes', () => {
  const [d] = cargar(['k8s/20-deployment.yaml']);
  const c = d.spec.template.spec.containers[0];
  delete c.readinessProbe; delete c.resources.requests; c.image = 'pedidos:latest';
  const problemas = validar([d]).join('\n');
  assert.match(problemas, /sin readinessProbe/);
  assert.match(problemas, /sin requests de cpu y memoria/);
  assert.match(problemas, /imagen sin versión fija \(pedidos:latest\)/);
});

test('SIGTERM: readiness pasa a 503, la petición en curso termina y el proceso sale con 0', async () => {
  const hijo = spawn(process.execPath, ['dist/servidor.js'], { env: { ...process.env, PORT: '18143', ESPERA_DRENADO_MS: '400' }, stdio: ['ignore', 'pipe', 'inherit'] });
  let salida = '';
  hijo.stdout.setEncoding('utf8').on('data', (t) => { salida += t; });
  const esperarLog = async (texto) => { while (!salida.includes(texto)) await new Promise((r) => setTimeout(r, 10)); };
  await esperarLog('escuchando');
  const base = 'http://127.0.0.1:18143';
  assert.equal((await fetch(`${base}/salud/lista`)).status, 200);
  const enCurso = fetch(`${base}/trabajo?ms=150`);   // empieza antes de la señal (150 ms de CPU)
  await new Promise((r) => setTimeout(r, 20));
  hijo.kill('SIGTERM');
  assert.equal((await enCurso).status, 200);                      // la petición en curso termina bien
  await esperarLog('SIGTERM');
  assert.equal((await fetch(`${base}/salud/lista`)).status, 503); // ya no recibe tráfico nuevo
  assert.equal((await fetch(`${base}/salud/viva`)).status, 200);  // pero sigue vivo: no lo reinicies
  const [codigo] = await once(hijo, 'exit');
  assert.equal(codigo, 0);
});
