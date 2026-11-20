// Módulo 23 · F144 · Tests del algoritmo del HPA y del manifiesto. Ejecuta: node --test f144-hpa/hpa.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Hpa, cargarSpec, recomendar } from './simulador.js';

test('fórmula: 3 pods al 90 % con objetivo 60 % -> ceil(4.5) = 5', () => {
  assert.equal(recomendar(3, 90, 60), 5);
});

test('tolerancia de 0.1: 65 % o 55 % con objetivo 60 % no cambia nada', () => {
  assert.equal(recomendar(4, 65, 60), 4);
  assert.equal(recomendar(4, 55, 60), 4);
});

test('sin métrica (pods sin cpu.requests) el HPA no actúa', () => {
  assert.equal(recomendar(3, null, 60), 3);
});

test('el manifiesto usa autoscaling/v2 con min 3, max 10 y objetivo 60 %', () => {
  const spec = cargarSpec();
  assert.equal(spec.minReplicas, 3);
  assert.equal(spec.maxReplicas, 10);
  assert.equal(spec.metrics[0].resource.target.averageUtilization, 60);
});

test('subida limitada por la política (4 pods / 15 s) y acotada a maxReplicas', () => {
  const hpa = new Hpa(cargarSpec(), 3);
  assert.equal(hpa.paso(0, 300), 7);   // pide 9, la política deja 3 + 4
  assert.equal(hpa.paso(15, 129), 10); // pide 10 (15 acotado a max), la política dejaría 11
});

test('bajada: espera la ventana de 300 s y luego baja de 2 en 2 por minuto', () => {
  const hpa = new Hpa(cargarSpec(), 10);
  hpa.paso(0, 90);
  const replicas = [];
  for (let t = 15; t <= 480; t += 15) replicas.push([t, hpa.paso(t, 15)]);
  assert.equal(replicas.find(([t]) => t === 285)[1], 10);  // dentro de la ventana: sigue en 10
  assert.equal(replicas.find(([t]) => t === 300)[1], 8);   // sale el 10 de la ventana -> baja 2
  assert.equal(replicas.at(-1)[1], 3);                     // termina en minReplicas
});
