// Ejecuta: node f090-typescript/src/demo.ts   (Node 26 quita los tipos y ejecuta)
import { Repositorio, valorDeInventario, iva, primero } from './inventario.ts';
import type { Producto } from './inventario.ts';

const repo = new Repositorio<Producto>();
repo.guardar({ id: 'p1', nombre: 'Clean Architecture', precio: 120000, categoria: 'libro', stock: 3 });
repo.guardar({ id: 'p2', nombre: 'Curso de Node', precio: 300000, categoria: 'curso' });

const r = repo.buscar('p1');
if (r.ok) console.log('Encontrado:', r.valor.nombre, '| IVA:', iva(r.valor.categoria));
const r2 = repo.buscar('p9');
if (!r2.ok) console.log('Error tipado:', r2.error);

const todos = repo.filtrar(() => true);
console.log('Valor del inventario:', valorDeInventario(todos));
console.log('Primero:', primero(todos)?.id, '| primero de []:', primero([]));
