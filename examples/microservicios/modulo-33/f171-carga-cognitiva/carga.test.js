// Módulo 29 · F171 · Tests. Ejecuta: node --test f171-carga-cognitiva/carga.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluar, proponer } from './carga.js';

const base = { nombre: 'x', dominios: [{ nombre: 'envios', complejidad: 'complicado' }], tecnologias: ['Node.js', 'PostgreSQL'],
  pasosManuales: 0, alertasSemana: 2, encuesta: [4, 4, 5] };

test('un equipo con un solo dominio difícil y poco ruido no está sobrecargado', () => {
  assert.equal(evaluar(base).sobrecargado, false);
});

test('dos dominios difíciles: aviso de carga germana', () => {
  const e = evaluar({ ...base, dominios: [...base.dominios, { nombre: 'aduanas', complejidad: 'complejo' }] });
  assert.deepEqual(e.avisos, ['germana: 2 dominios complicados o complejos (envios, aduanas)']);
});

test('despliegue manual y alertas son carga extrínseca; la encuesta baja también avisa', () => {
  const e = evaluar({ ...base, pasosManuales: 5, alertasSemana: 30, encuesta: [2, 2, 3] });
  assert.deepEqual(e.avisos, [
    'extrínseca: 5 pasos manuales por despliegue',
    'extrínseca: 30 alertas por semana',
    'encuesta: entienden sus sistemas 2.3 de 5',
  ]);
});

test('la propuesta deja un dominio difícil por equipo y los simples con el primero', () => {
  const p = proponer({ ...base, nombre: 'logistica', dominios: [
    { nombre: 'envios', complejidad: 'complicado' }, { nombre: 'aduanas', complejidad: 'complejo' }, { nombre: 'etiquetas', complejidad: 'simple' }] });
  assert.deepEqual(p, [
    { nombre: 'logistica-envios', dominios: ['envios', 'etiquetas'] },
    { nombre: 'logistica-aduanas', dominios: ['aduanas'] },
  ]);
});
