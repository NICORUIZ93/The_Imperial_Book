// Módulo 24 · F149 · Tests del modelo C4. Ejecuta: node --test f149-c4/c4.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contenedores, contexto, validar } from './c4.js';

const leer = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const modelo = leer('./modelo.json');

test('el modelo de la tienda cumple las reglas de notación', () => {
  assert.deepEqual(validar(modelo), []);
});

test('Contexto: la tienda es UNA caja y no aparece ningún contenedor', () => {
  const texto = contexto(modelo);
  assert.match(texto, /tienda\["<b>Tienda<\/b><br\/>\[Sistema de software\]/);
  for (const c of modelo.sistema.contenedores) assert.doesNotMatch(texto, new RegExp(`\\b${c.id}\\[`));
  assert.match(texto, /cliente -- "Compra en<br\/>\[HTTPS\]" --> tienda/);
  assert.equal(texto.split('\n').filter((l) => l.includes('-->')).length, 4); // relaciones internas colapsadas
});

test('Contenedores: cada contenedor con su tecnología y la BD con forma de cilindro', () => {
  const texto = contenedores(modelo);
  assert.match(texto, /subgraph tienda\["Tienda \[Sistema de software\]"\]/);
  assert.match(texto, /bdpedidos\[\("<b>BD de pedidos<\/b><br\/>\[Contenedor: PostgreSQL 18\]/);
  assert.equal(texto.split('\n').filter((l) => l.includes('-->')).length, modelo.relaciones.length);
});

test('el diagrama de pizarra incumple 5 reglas', () => {
  assert.deepEqual(validar(leer('./error-comun.json')), [
    'el contenedor «API» no dice su tecnología',
    '«PedidoService.java» es código (nivel 4), no un contenedor: mezcla niveles',
    'relación cliente -> api: sin descripción (una flecha sin verbo no dice nada)',
    'relación cliente -> bd: una persona no usa directamente un almacén de datos',
    'el contenedor «PedidoService.java» no se relaciona con nada',
  ]);
});
