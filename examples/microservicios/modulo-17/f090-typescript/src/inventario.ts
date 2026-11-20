// Módulo 13 · F090 · TypeScript: tipos, interfaces, generics, strict mode.
// Requisitos: Node.js 26.13.1 LTS (ejecuta .ts sin compilar) y typescript 6.0.3 (solo para `tsc --noEmit`).

// 1. TIPOS: alias, uniones de literales y tipos primitivos.
export type Categoria = 'libro' | 'curso' | 'licencia';
export type Id = string;

// 2. INTERFACES: la forma que debe tener un objeto. `?` = opcional, readonly = no se puede reasignar.
export interface Producto {
  readonly id: Id;
  nombre: string;
  precio: number;
  categoria: Categoria;
  stock?: number;
}

// Unión discriminada: el campo `ok` le dice al compilador qué otros campos existen.
export type Resultado<T, E = string> = { ok: true; valor: T } | { ok: false; error: E };

// 3. GENERICS: una sola implementación que conserva el tipo que le pases.
// `T extends { id: Id }` es una RESTRICCIÓN: solo acepta objetos con id.
export class Repositorio<T extends { readonly id: Id }> {
  #items = new Map<Id, T>(); // campo privado de JavaScript (#), no `private` de TS

  guardar(item: T): T {
    this.#items.set(item.id, item);
    return item;
  }

  buscar(id: Id): Resultado<T> {
    const item = this.#items.get(id); // tipo: T | undefined
    // 4. STRICT MODE: sin este if, `item.nombre` no compila (item puede ser undefined).
    if (item === undefined) return { ok: false, error: `No existe ${id}` };
    return { ok: true, valor: item };
  }

  filtrar(predicado: (item: T) => boolean): T[] {
    return [...this.#items.values()].filter(predicado);
  }
}

export function primero<T>(lista: readonly T[]): T | undefined {
  return lista[0]; // con noUncheckedIndexedAccess el tipo ya es T | undefined
}

export function valorDeInventario(productos: readonly Producto[]): number {
  // stock es opcional: `?? 0` cubre el undefined (strict no deja multiplicar por undefined).
  return productos.reduce((total, p) => total + p.precio * (p.stock ?? 0), 0);
}

// Exhaustividad: si mañana agregas una categoría y olvidas el caso, `never` hace fallar la compilación.
export function iva(categoria: Categoria): number {
  switch (categoria) {
    case 'libro':
      return 0;
    case 'curso':
    case 'licencia':
      return 0.19;
    default: {
      const imposible: never = categoria;
      throw new Error(`Categoría desconocida: ${String(imposible)}`);
    }
  }
}
