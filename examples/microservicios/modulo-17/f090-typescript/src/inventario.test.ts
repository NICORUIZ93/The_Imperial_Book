// Verificación F090: npx tsc -p f090-typescript && node --test f090-typescript/src/inventario.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Repositorio, valorDeInventario, iva, primero } from './inventario.ts';
import type { Producto } from './inventario.ts';

const libro: Producto = { id: 'p1', nombre: 'Clean Architecture', precio: 120000, categoria: 'libro', stock: 3 };
const curso: Producto = { id: 'p2', nombre: 'Curso de Node', precio: 300000, categoria: 'curso' };

test('el repositorio genérico guarda y busca con un Resultado discriminado', () => {
  const repo = new Repositorio<Producto>();
  repo.guardar(libro);
  const r = repo.buscar('p1');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.valor.nombre, 'Clean Architecture'); // r.valor solo existe si ok === true
  assert.deepEqual(repo.buscar('p9'), { ok: false, error: 'No existe p9' });
});

test('stock opcional cuenta como 0 en el valor del inventario', () => {
  assert.equal(valorDeInventario([libro, curso]), 360000);
});

test('iva cubre todas las categorías', () => {
  assert.deepEqual([iva('libro'), iva('curso'), iva('licencia')], [0, 0.19, 0.19]);
});

test('primero es genérico y respeta undefined', () => {
  assert.equal(primero(['a', 'b']), 'a');
  assert.equal(primero([]), undefined);
});
