# Módulo 9: Gestión de estado


## Aprende construyendo

### Tema 1: Store propio con signals

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `TestBed` real, dos garantías concretas de un store de signals: que es un singleton compartido (dos inyecciones ven el mismo estado) y que su encapsulación es real en tiempo de ejecución (no solo una restricción de tipos de TypeScript que desaparece al compilar).

**Conocimiento previo:** Módulo 2 de este track (signals, `asReadonly`); Módulo 3 (`providedIn: 'root'`).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En una app de entregas con carrito compartido entre la barra de navegación y la página de checkout, confirmar con una prueba real que ambos componentes ven exactamente el mismo estado (no dos copias independientes que podrían divergir) previene el bug clásico de "el carrito muestra 3 items aquí pero 2 allá".

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `@Injectable({ providedIn: 'root' })`, encapsulación de estado mutable, exposición de solo lectura.

Un store de signals es, en esencia, un servicio inyectable (Módulo 3) que encapsula uno o varios signals de estado privados, exponiendo hacia el exterior únicamente versiones de solo lectura de ese estado (mediante `asReadonly()`, estudiado en el Módulo 2) junto con métodos públicos explícitos que son la única forma permitida de modificar ese estado internamente, un patrón que aplica el mismo principio de encapsulación estudiado para clases en general (Módulo 4 del track de JavaScript) al caso específico del estado reactivo compartido de una aplicación.

En el ejemplo de `CarritoStore`, el signal privado `items` mantiene el arreglo de productos en el carrito, expuesto hacia afuera como `lista` mediante `asReadonly()` (impidiendo que código externo llame `.set()` o `.update()` directamente sobre él, forzándolo a pasar por los métodos `agregar()`/`quitar()` explícitamente definidos por el store); `total`, un `computed()` derivado de `items`, se recalcula automáticamente cada vez que el arreglo de items cambia, sin que ningún código tenga que recordar mantenerlo sincronizado manualmente.

Al estar registrado con `providedIn: 'root'` (Módulo 3), cualquier componente en cualquier parte del árbol de la aplicación que inyecte `CarritoStore` recibe la misma instancia única compartida, viendo automáticamente el mismo estado actualizado sin necesidad de pasar ese estado manualmente como input a través de una cadena potencialmente larga de componentes intermedios que no necesitan conocer ese estado en absoluto (el problema de "prop drilling" que este patrón evita estructuralmente).

**Analogía:** un store de signals es como una caja fuerte con un único guardián autorizado (el propio servicio) que controla exactamente qué operaciones están permitidas sobre su contenido (los métodos públicos), mientras que cualquiera puede consultar el contenido actual a través de una ventana de solo observación (la versión de solo lectura expuesta), sin poder alterarlo directamente por su cuenta.

**Diagrama — encapsulación real del store:**

```
┌─────────────────────────────┐
│ CarritoStore (providedIn: root) │
│  private items = signal([])     │
│  readonly lista (solo lectura)  │──▶ componente A (lee)
│  agregar()/quitar() (unica via  │──▶ componente B (lee el MISMO estado)
│  de escritura permitida)        │
└─────────────────────────────┘
```

**Código del ejemplo:**

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

#### Paso 4 · Demostración guiada desde cero

Parte de una carpeta vacía (o continúa en `demo-orden` del Módulo 7):

```bash
npx -y @angular/cli@22 new demo-store --standalone --skip-git --defaults
mkdir -p src/app
```

Crea `src/app/carrito.store.ts`:

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

Confirma con `TestBed` real el singleton compartido y la encapsulación en tiempo de ejecución:

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

**Resultado esperado:** ambos tests pasan; el primero confirma que `storeA` y `storeB` son literalmente la misma instancia (el cambio hecho a través de `storeA` es visible inmediatamente a través de `storeB`); el segundo confirma que `asReadonly()` produce un objeto sin `.set`/`.update` en TIEMPO DE EJECUCIÓN, no solo una restricción de tipos de TypeScript que un `as any` podría burlar en producción.

**Fallo deliberado:** cambia `readonly lista = this.items.asReadonly();` por `readonly lista = this.items;` (exponiendo directamente el signal escribible, sin `asReadonly()`) y ejecuta de nuevo el segundo test. FALLA porque `(store.lista as any).set` ahora SÍ está definido (es una función real) — diagnosticando en código exactamente la brecha de encapsulación que ocurriría si un desarrollador olvida `asReadonly()` al exponer un signal de estado. Restaura `asReadonly()` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un método `limpiar()` que vacíe `items`, y un test que confirme que `total()` vuelve a `0` después de llamarlo.
2. Escribe un test que confirme que `total` (el `computed()`) se recalcula automáticamente después de `agregar()`, sin ninguna llamada manual adicional.
3. Documenta, en un comentario, qué error de TypeScript (en tiempo de COMPILACIÓN, no de ejecución) habría prevenido el bug del fallo deliberado si el código de producción hubiera intentado hacer `store.lista.set(...)` directamente — contrasta esto con la prueba en tiempo de ejecución del Paso 4.
4. Escribe de memoria (sin mirar) un store de signals con `asReadonly()` y un test que confirme tanto el singleton compartido como la encapsulación en tiempo de ejecución. Compara después contra el patrón del Paso 4.

**Pista:** un signal expuesto sin `asReadonly()` sigue funcionando "normalmente" en apariencia durante el desarrollo — el bug de encapsulación rota solo se manifiesta cuando algún código, en algún lugar, efectivamente llama `.set()` sobre él directamente; una prueba explícita como la del Paso 4 detecta la brecha ANTES de que eso ocurra.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real de un signal escribible que expone una versión de solo lectura del mismo:

```ts
readonly lista = this.items.____();
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un store de signals con estado encapsulado y un test que confirme el singleton compartido y la ausencia de `.set`/`.update` en la versión expuesta. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con `TestBed` real, que un store de signals es un singleton compartido con encapsulación real en tiempo de ejecución, no solo una convención de tipos. El siguiente tema confirma con un reducer real de NgRx que las funciones reductoras nunca mutan el estado original. **Evidencia:** entrega el resultado de ambos tests en verde, y el resultado incorrecto (`set` definido) que produce el fallo deliberado. Fuentes oficiales: [Angular — Signals](https://angular.dev/guide/signals).

**Errores comunes:** exponer un signal de estado sin `asReadonly()`, permitiendo que cualquier código externo lo modifique directamente sin pasar por los métodos del store; asumir que la encapsulación de tipos de TypeScript (que desaparece al compilar) es suficiente sin verificarla también en tiempo de ejecución.

**Cuándo no usarlo:** para estado que es genuinamente local a un único componente y nunca se comparte con ningún otro (Módulo 2), envolverlo en un store inyectable con `providedIn: 'root'` añade indirección innecesaria — un signal local dentro del propio componente es suficiente.

**Transferencia al proyecto integrador «Centro de control logístico»:** Implementa un store de entregas con comandos y selectores derivados. Prueba confirmar una guía y recuperar un fallo; ningún consumidor debe mutar directamente la colección almacenada.

### Tema 2: NgRx — actions, reducers y selectors

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con un reducer real de NgRx invocado directamente en un test, que nunca muta el objeto de estado original que recibe — la garantía de pureza que el patrón Redux exige y que habilita el historial inspeccionable que la teoría describe.

**Conocimiento previo:** Tema 1 de este módulo; Módulo 3 del track de JavaScript (funciones puras, inmutabilidad).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Si un reducer muta el estado original en vez de crear uno nuevo, herramientas como Redux DevTools (que dependen de comparar referencias de estado a lo largo del tiempo para reconstruir el historial) dejan de funcionar correctamente; confirmar con una prueba real que el objeto original permanece sin cambios después de invocar el reducer es la verificación concreta de esa garantía de pureza.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** flujo unidireccional de datos, funciones puras, historial inspeccionable.

NgRx implementa el patrón Redux para Angular: en vez de modificar el estado directamente mediante métodos de un servicio (como en el Tema 1), el estado se modifica exclusivamente despachando "actions" (objetos planos que describen qué ocurrió, como `agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>())`), que son procesadas por "reducers" — funciones puras (Módulo 3 del track de JavaScript) que reciben el estado actual y una action, y devuelven un nuevo estado sin mutar el original (`carritoReducer`, usando `on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))`).

Los "selectors" (`createSelector`) son funciones derivadas que calculan valores a partir del estado global del store de NgRx, de forma conceptualmente equivalente a un `computed()` de signals (Módulo 2) pero operando sobre el árbol de estado inmutable de NgRx en vez de sobre un signal individual, memoizando automáticamente su resultado para evitar recálculos innecesarios cuando las partes del estado de las que depende no han cambiado.

Este flujo estrictamente unidireccional (acción despachada → reducer puro → nuevo estado → selectors recalculados → vista actualizada) hace que cada cambio de estado en la aplicación quede registrado como una action explícita con nombre descriptivo, habilitando herramientas como Redux DevTools para inspeccionar el historial completo de cambios de estado a lo largo del tiempo, incluyendo la capacidad de viajar en el tiempo (time-travel debugging) para reproducir exactamente la secuencia de acciones que llevó a un estado particular, algo que un store de signals simple no ofrece de forma nativa.

**Analogía:** un reducer de NgRx es como un contable que nunca modifica un libro de cuentas existente directamente, sino que siempre registra una nueva entrada firmada (la action) y produce un balance completamente nuevo a partir de esa entrada, dejando un rastro auditable completo de cada cambio ocurrido a lo largo del tiempo.

**Diagrama — flujo unidireccional de NgRx:**

```
┌────────┐   dispatch   ┌─────────┐   nuevo estado   ┌───────────┐
│ action  │─────────────▶│ reducer  │──────────────────▶│ selectors  │──▶ vista
│ (plana) │              │ (puro)   │                    │ (memoizados)│
└────────┘              └─────────┘                    └───────────┘
```

**Código del ejemplo:**

```ts
const agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>());

const carritoReducer = createReducer(estadoInicial,
  on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))
);

const selectTotal = createSelector(selectCarrito, (estado) =>
  estado.items.reduce((s, i) => s + i.precio, 0)
);
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-ngrx --standalone --skip-git --defaults`):

```bash
npm install @ngrx/store --save
mkdir -p src/app
```

`--save` es la bandera que registra el paquete como dependencia de runtime en `package.json` (el comportamiento por defecto en versiones recientes de npm, aquí explícito).

Crea `src/app/carrito.reducer.ts`:

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

Confirma con un test directo (sin ningún `Store` de NgRx inyectado; el reducer es una función pura normal) que el reducer nunca muta el estado que recibe:

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

**Resultado esperado:** ambos tests pasan; el primero confirma con `expect(estadoOriginal.items).toEqual([])` que el objeto de estado ORIGINAL permanece completamente sin cambios después de invocar el reducer — la garantía de pureza real, no solo una convención mencionada en la teoría.

**Fallo deliberado:** cambia el `on(agregarItem, ...)` para mutar directamente:

```typescript
on(agregarItem, (estado, { item }) => {
  estado.items.push(item);
  return estado;
})
```

Ejecuta de nuevo el primer test. FALLA porque `estadoOriginal.items` ahora contiene `[{ id: '1', precio: 10 }]` en vez de `[]` (el objeto original SÍ cambió) — diagnosticando en código exactamente la violación de pureza que rompería Redux DevTools en una aplicación real. Restaura la versión inmutable (`{ ...estado, items: [...estado.items, item] }`) antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega una segunda action (`quitarItem`) y un caso `on(quitarItem, ...)` en el reducer, con un test que confirme la misma garantía de inmutabilidad.
2. Escribe un test que confirme que `selectTotal` es una función pura: invocarla dos veces con el mismo estado produce exactamente el mismo resultado.
3. Documenta, en un comentario, qué diferencia de comportamiento observarías si `selectTotal` NO estuviera memoizado con `createSelector` (pista: recalcularía en cada invocación, incluso si el estado relevante no cambió).
4. Escribe de memoria (sin mirar) una action, un reducer con un caso `on(...)`, y un test que confirme que el reducer no muta el estado original. Compara después contra el patrón del Paso 4.

**Pista:** `expect(estadoNuevo).not.toBe(estadoOriginal)` (comparación de referencia, no de contenido) es la aserción clave que distingue "el reducer devolvió algo con el contenido correcto" de "el reducer realmente creó un objeto nuevo en vez de mutar el existente" — ambas aserciones son necesarias para confirmar pureza completa.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con la función real de `@ngrx/store` que crea una función reductora a partir de un estado inicial y una lista de casos:

```ts
export const carritoReducer = ____(estadoInicial, on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] })));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una action, un reducer puro, y un test que confirme con `not.toBe()` que el estado original nunca se muta. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con un test real que compara referencias de objetos, que un reducer de NgRx nunca muta el estado original que recibe. El siguiente y último tema confirma en código que un store de signals y un reducer de NgRx equivalente alcanzan exactamente el mismo estado final ante la misma secuencia de operaciones, cuantificando la ceremonia real de cada enfoque. **Evidencia:** entrega el resultado de ambos tests en verde, y el resultado incorrecto (`estadoOriginal.items` modificado) que produce el fallo deliberado. Fuentes oficiales: [NgRx — Reducers](https://ngrx.io/guide/store/reducers).

**Errores comunes:** mutar el estado directamente dentro de un caso `on(...)` en vez de devolver un objeto nuevo con spread; olvidar `createSelector` y recalcular manualmente un valor derivado en cada componente, perdiendo la memoización automática.

**Cuándo no usarlo:** para un cambio de estado trivial de un único campo sin ninguna necesidad de historial inspeccionable, definir una action y un caso de reducer completo es ceremonia desproporcionada frente a un simple `signal.set(...)` (Tema 1).

**Transferencia al proyecto integrador «Centro de control logístico»:** Modela cargar, cargar correctamente y fallar como acciones distintas. Reproduce la secuencia de asignación y comprueba reducers puros y selectores que no duplican estado calculable.

### Tema 3: Cuándo NgRx justifica su complejidad

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, en código, que un store de signals (Tema 1) y un reducer de NgRx equivalente (Tema 2) alcanzan exactamente el mismo estado final ante la misma secuencia de operaciones — la base concreta para decidir cuál ceremonia realmente se justifica en cada caso.

**Conocimiento previo:** Temas 1-2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Antes de justificar la ceremonia adicional de NgRx para una feature específica, confirmar que ambos enfoques producen el mismo resultado funcional (y solo difieren en cuánto código y estructura requieren) permite tomar la decisión de adopción basándose en necesidades reales (historial, equipo grande, side-effects complejos) y no en una preferencia no examinada.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** ceremonia frente a beneficio, escala del equipo, complejidad de side-effects asíncronos.

NgRx agrega una cantidad considerable de ceremonia respecto a un store de signals directo: cada cambio de estado requiere definir una action, un caso en un reducer, y potencialmente un selector para leerlo de vuelta, además de (para lógica asíncrona) un "effect" que escucha ciertas actions y despacha nuevas actions como resultado de operaciones asíncronas (como una petición HTTP), una capa adicional de indirección que no existe en un store de signals, donde la lógica asíncrona simplemente vive directamente dentro de un método del store.

Esta ceremonia adicional está genuinamente justificada cuando el historial de cambios inspeccionable es un requisito real (depuración de bugs de estado complejos en producción, reproducir exactamente una secuencia de eventos reportada por un usuario), cuando un equipo grande necesita un patrón único y predecible para modificar estado en toda la base de código (evitando que cada desarrollador invente su propia convención ad-hoc para gestionar estado), o cuando la lógica de side-effects asíncronos es genuinamente compleja (múltiples acciones encadenadas condicionalmente, cancelación de flujos en curso, coordinación entre múltiples fuentes de eventos).

Para la mayoría de features de tamaño moderado, sin embargo, un store de signals bien diseñado (Tema 1) ofrece prácticamente el mismo beneficio de estado compartido y encapsulado con una fracción de la ceremonia, siendo la recomendación por defecto salvo que exista una razón concreta y específica (no solo "podría ser útil algún día") para asumir el costo adicional de NgRx.

**Analogía:** NgRx es como un sistema de contabilidad corporativo completo con auditoría externa, apropiado para una empresa grande con múltiples departamentos y necesidad de trazabilidad legal; un store de signals es como llevar las cuentas personales en una libreta simple, perfectamente adecuado y mucho menos costoso de mantener cuando la escala y las necesidades de auditoría no lo justifican.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-comparacion --standalone --skip-git --defaults`), crea `src/app/comparacion-store.spec.ts` reutilizando ambos módulos anteriores:

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

**Resultado esperado:** el test pasa; `store.total()` (Tema 1) y `selectTotal({ carrito: estadoNgrx })` (Tema 2) son ambos `15` — confirmando en código, no solo en teoría, que ambos enfoques alcanzan exactamente el mismo resultado funcional ante la misma secuencia de operaciones, y que la diferencia real entre ellos es de ceremonia de código, no de capacidad.

**Fallo deliberado:** en la rama de NgRx, cambia el segundo `agregarItem({ item: { id: '2', precio: 5 } })` por `agregarItem({ item: { id: '2', precio: 7 } })` (un precio distinto al que se agregó en el store de signals) y ejecuta de nuevo el test. FALLA porque `store.total()` es `15` pero `selectTotal(...)` ahora es `17` — reproduciendo en código exactamente el bug de "dos fuentes de verdad divergentes" que el Tema 1 advertía en su Paso 5, esta vez entre dos implementaciones distintas del mismo estado en vez de dos componentes. Restaura el precio correcto antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Cuenta las líneas de código necesarias para agregar un nuevo campo mutable al estado en cada enfoque (store de signals: un signal más un método; NgRx: una action, un caso de reducer, posiblemente un selector) y documenta la diferencia real medida, no estimada.
2. Escribe un test que agregue un `effect` simple de NgRx (una acción asíncrona) y documenta cuántas piezas adicionales requirió comparado con simplemente hacer una llamada HTTP dentro de un método del store de signals (Tema 1).
3. Revisa el criterio "equipo grande necesita un patrón único" de la teoría y documenta, con tus propias palabras, por qué ese criterio es sobre COORDINACIÓN humana, no sobre capacidad técnica del código.
4. Escribe de memoria (sin mirar) un test que compare el resultado final de un store de signals y un reducer de NgRx equivalentes ante la misma secuencia de operaciones. Compara después contra el patrón del Paso 4.

**Pista:** la pregunta correcta no es "¿NgRx es mejor que signals?" sino "¿esta feature específica tiene un requisito real de historial inspeccionable, coordinación de equipo grande, o side-effects asíncronos complejos?" — si la respuesta es no, el store de signals (Tema 1) es la opción con menos ceremonia y el mismo resultado funcional, como el Paso 4 demuestra en código.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real del store de signals que expone el total derivado, usado en la comparación del Paso 4:

```ts
expect(store.____()).toBe(selectTotal({ carrito: estadoNgrx }));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test que compare el resultado de un store de signals y un reducer de NgRx equivalentes ante la misma secuencia de operaciones. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, en código, que un store de signals y un reducer de NgRx equivalente alcanzan exactamente el mismo estado final, y documentas los criterios concretos (no la moda) que justificarían la ceremonia adicional de NgRx. Con esto cierras el módulo de gestión de estado: encapsulación real de un store (Tema 1), pureza real de un reducer (Tema 2), y equivalencia funcional entre ambos enfoques (Tema 3). El siguiente módulo aplica estos fundamentos al testing sistemático de toda la aplicación. **Evidencia:** entrega el resultado del test en verde, y el resultado incorrecto (`15` vs `17`) que produce el fallo deliberado. Fuentes oficiales: [Angular — Signals](https://angular.dev/guide/signals), [NgRx — Store](https://ngrx.io/guide/store).

**Errores comunes:** adoptar NgRx "por si acaso" sin ningún requisito concreto de historial, equipo grande, o side-effects complejos que lo justifique; asumir que un store de signals no puede escalar sin haber medido realmente en qué punto la ceremonia de NgRx empieza a pagar por sí misma.

**Cuándo no usarlo:** ninguno de los dos enfoques es universal — para estado verdaderamente local a un componente (Módulo 2), ni siquiera un store compartido (con o sin NgRx) es necesario; un signal local dentro del propio componente es suficiente y más simple que ambos.

---

**Transferencia al proyecto integrador «Centro de control logístico»:** Documenta si el flujo de asignación necesita auditoría de eventos o solo estado local. Implementa una prueba del flujo elegido y justifica NgRx con problemas observados, no con el tamaño del catálogo.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un store de carrito de compras con signals, y una versión equivalente simplificada en NgRx para comparar.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `CarritoStore` con signals | Ver Tema 1 | Encapsula el estado, expone solo lectura |
| 2 | Inyectarlo en dos componentes distintos | `inject(CarritoStore)` | Verifica que ambos ven el mismo estado |
| 3 | Definir la action, reducer y selector equivalentes | Ver Tema 2 | Compara la ceremonia frente al store de signals |
| 4 | Comparar ambas implementaciones | — | Discute cuándo cada una sería apropiada |

**Verificación:** el laboratorio se considera exitoso si ambos componentes reflejan el mismo estado del carrito en tiempo real al modificarlo desde cualquiera de los dos, y si puedes articular claramente en qué escenario elegirías NgRx en vez del store de signals.

**Errores comunes y soluciones**

- **Exponer el signal mutable directamente sin `asReadonly()`.** Cualquier componente externo podría modificar el estado sin pasar por los métodos del store, rompiendo la encapsulación.
- **Mutar el arreglo dentro de `update()` en vez de crear uno nuevo.** Usa siempre spread (`[...l, item]`) para mantener inmutabilidad (Módulo 2).
- **Adoptar NgRx sin una razón concreta.** Evalúa primero si un store de signals cubre la necesidad real.

---
