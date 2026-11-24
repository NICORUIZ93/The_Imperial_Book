# Módulo 9: Gestión de estado


## Aprende construyendo


### Tema 1: Store propio con signals · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con TestBed real, dos garantías concretas de un store de signals: que es un singleton compartido (dos inyecciones ven el mismo estado) y que su encapsulación es real en tiempo de ejecución (no solo una restricción de tipos de TypeScript que desapare…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con TestBed real, dos garantías concretas de un store de signals: que es un singleton compartido (dos inyecciones ven el mismo estado) y que su encapsulación es real en tiempo de ejecución (no solo una restricción de tipos de TypeScript que desaparece al compilar).**

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌─────────────────────────────┐
│ CarritoStore (providedIn: root) │
│  private items = signal([])     │
│  readonly lista (solo lectura)  │──▶ componente A (lee)
│  agregar()/quitar() (unica via  │──▶ componente B (lee el MISMO estado)
│  de escritura permitida)        │
└─────────────────────────────┘
```

```ts
@Injectable({ providedIn: 'root' })
export class CarritoStore {
  private items = signal<Item[]>([]);
  readonly lista = this.items.asReadonly();
  readonly total = computed(() => this.items().reduce((s, i) => s + i.precio, 0));

  agregar(item: Item) { this.items.update(l => [...l, item]); }
  quitar(id: string) { this.items.update(l => l.filter(i => i.id !== id)); }
}
```

```bash
npx -y @angular/cli@22 new demo-store --standalone --skip-git --defaults
cd demo-store
mkdir -p src/app
```

```ts
// src/app/carrito.store.ts
import { Injectable, computed, signal } from '@angular/core';

export interface Item {
  id: string;
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoStore {
  private items = signal<Item[]>([]);
  readonly lista = this.items.asReadonly();
  readonly total = computed(() => this.items().reduce((s, i) => s + i.precio, 0));

  agregar(item: Item) {
    this.items.update((l) => [...l, item]);
  }

  quitar(id: string) {
    this.items.update((l) => l.filter((i) => i.id !== id));
  }
}
```

```ts
// src/app/carrito.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { CarritoStore } from './carrito.store';

describe('CarritoStore es singleton y encapsula su estado en tiempo de ejecucion', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('dos inyecciones independientes reciben la MISMA instancia con el MISMO estado', () => {
    const storeA = TestBed.inject(CarritoStore);
    const storeB = TestBed.inject(CarritoStore);

    storeA.agregar({ id: '1', precio: 10 });

    expect(storeB.lista()).toEqual([{ id: '1', precio: 10 }]);
    expect(storeB.total()).toBe(10);
  });

  it('lista NO tiene metodo set/update en tiempo de ejecucion (encapsulacion real, no solo de tipos)', () => {
    const store = TestBed.inject(CarritoStore);

    expect((store.lista as any).set).toBeUndefined();
    expect((store.lista as any).update).toBeUndefined();
  });
});
```

```bash
npx ng test --watch=false
```

</details>

### Tema 2: NgRx — actions, reducers y selectors · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con un reducer real de NgRx invocado directamente en un test, que nunca muta el objeto de estado original que recibe — la garantía de pureza que el patrón Redux exige y que habilita el historial inspeccionable que la teoría describe.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌────────┐   dispatch   ┌─────────┐   nuevo estado   ┌───────────┐
│ action  │─────────────▶│ reducer  │──────────────────▶│ selectors  │──▶ vista
│ (plana) │              │ (puro)   │                    │ (memoizados)│
└────────┘              └─────────┘                    └───────────┘
```

```ts
const agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>());

const carritoReducer = createReducer(estadoInicial,
  on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))
);

const selectTotal = createSelector(selectCarrito, (estado) =>
  estado.items.reduce((s, i) => s + i.precio, 0)
);
```

```bash
npm install @ngrx/store --save
mkdir -p src/app
```

```ts
// src/app/carrito.reducer.ts
import { createAction, createReducer, createSelector, on, props } from '@ngrx/store';
import { Item } from './carrito.store';

export interface EstadoCarrito {
  items: Item[];
}

export const agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>());

const estadoInicial: EstadoCarrito = { items: [] };

export const carritoReducer = createReducer(
  estadoInicial,
  on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))
);

export const selectCarrito = (estado: { carrito: EstadoCarrito }) => estado.carrito;
export const selectTotal = createSelector(selectCarrito, (estado) =>
  estado.items.reduce((s, i) => s + i.precio, 0)
);
```

```ts
// src/app/carrito.reducer.spec.ts
import { EstadoCarrito, agregarItem, carritoReducer, selectTotal } from './carrito.reducer';

describe('carritoReducer es una funcion pura que nunca muta el estado original', () => {
  it('produce un NUEVO objeto de estado sin modificar el original', () => {
    const estadoOriginal: EstadoCarrito = { items: [] };

    const estadoNuevo = carritoReducer(estadoOriginal, agregarItem({ item: { id: '1', precio: 10 } }));

    expect(estadoOriginal.items).toEqual([]);
    expect(estadoNuevo.items).toEqual([{ id: '1', precio: 10 }]);
    expect(estadoNuevo).not.toBe(estadoOriginal);
  });

  it('selectTotal calcula el total derivado del estado', () => {
    const estado = { carrito: { items: [{ id: '1', precio: 10 }, { id: '2', precio: 5 }] } };
    expect(selectTotal(estado)).toBe(15);
  });
});
```

```bash
npx ng test --watch=false
```

</details>

### Tema 3: Cuándo NgRx justifica su complejidad · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, en código, que un store de signals (Tema 1) y un reducer de NgRx equivalente (Tema 2) alcanzan exactamente el mismo estado final ante la misma secuencia de operaciones — la base concreta para decidir cuál ceremonia realmente se justifica en cada cas…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, en código, que un store de signals (Tema 1) y un reducer de NgRx equivalente (Tema 2) alcanzan exactamente el mismo estado final ante la misma secuencia de operaciones — la base concreta para decidir cuál ceremonia realmente se justifica en cada caso.**

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌────────────────┬───────────────────────────────────────────┐
│ Store de signals │ menos ceremonia, ideal para la mayoria     │
│                   │ de features                                │
├────────────────┼───────────────────────────────────────────┤
│ NgRx              │ mas ceremonia, justificado con historial   │
│                   │ inspeccionable, equipos grandes, o         │
│                   │ side-effects asincronos complejos          │
└────────────────┴───────────────────────────────────────────┘
```

```bash
mkdir -p src/app
```

```ts
// src/app/comparacion-store.spec.ts
import { TestBed } from '@angular/core/testing';
import { CarritoStore } from './carrito.store';
import { EstadoCarrito, agregarItem, carritoReducer, selectTotal } from './carrito.reducer';

describe('store de signals y NgRx alcanzan el mismo estado final ante la misma secuencia', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('agregar los mismos 2 items produce el mismo total en ambos enfoques', () => {
    const store = TestBed.inject(CarritoStore);
    store.agregar({ id: '1', precio: 10 });
    store.agregar({ id: '2', precio: 5 });

    let estadoNgrx: EstadoCarrito = { items: [] };
    estadoNgrx = carritoReducer(estadoNgrx, agregarItem({ item: { id: '1', precio: 10 } }));
    estadoNgrx = carritoReducer(estadoNgrx, agregarItem({ item: { id: '2', precio: 5 } }));

    expect(store.total()).toBe(selectTotal({ carrito: estadoNgrx }));
  });
});
```

```bash
npx ng test --watch=false
```

```ts
expect(store.____()).toBe(selectTotal({ carrito: estadoNgrx }));
```

</details>
