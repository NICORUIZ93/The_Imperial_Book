# Módulo 6: RxJS esencial para Angular


## Aprende construyendo

### Tema 1: Observable frente a Promise

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con espías reales y `fakeAsync`/`tick`, dos propiedades de los Observables que las Promesas nativas NO tienen: evaluación perezosa (no producen nada hasta que alguien se suscribe) y cancelación real (desuscribirse detiene efectivamente la operación en curso).

**Conocimiento previo:** Módulo 5 del track de JavaScript (Promesas); RxJS básico.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En un buscador en vivo, cancelar una petición en curso cuando el usuario escribe una nueva letra (en vez de dejarla completarse inútilmente) ahorra ancho de banda real y evita que una respuesta obsoleta sobrescriba una más reciente; confirmar con una prueba real que la cancelación efectivamente detiene la lógica productora (no solo ignora su resultado) es la diferencia concreta frente a una Promesa.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** múltiples emisiones, cancelación nativa, evaluación perezosa.

Una Promesa (estudiada en profundidad en el Módulo 5 del track de JavaScript) representa un único valor futuro, resuelto o rechazado exactamente una vez; un Observable de RxJS representa un flujo que puede emitir múltiples valores a lo largo del tiempo (cero, uno, o infinitos valores sucesivos), y que se puede cancelar explícitamente en cualquier momento simplemente desuscribiéndose, una capacidad que las Promesas nativas de JavaScript no ofrecen directamente (una vez creada, una Promesa no puede cancelarse; como mucho, se puede ignorar su resultado, pero la operación subyacente sigue ejecutándose de todas formas, salvo mecanismos externos adicionales como `AbortController`, estudiado en el Módulo 6 del track de JavaScript).

Otra diferencia importante es la evaluación perezosa: un Observable no comienza a ejecutar su lógica productora hasta que alguien se suscribe explícitamente a él (`observable.subscribe(...)`); una Promesa, en cambio, comienza a ejecutarse inmediatamente en el momento de su creación, independientemente de si alguien está interesado en su resultado o no. Esta diferencia hace que un mismo Observable pueda suscribirse múltiples veces, potencialmente disparando su lógica productora una vez por cada suscripción independiente (a menos que se use un operador como `shareReplay`, Tema 4, para compartir una única ejecución entre múltiples suscriptores), mientras que una Promesa, al ejecutarse una única vez en su creación, siempre entrega el mismo resultado a cualquier código que la consulte después, sin importar cuántas veces se consulte.

Esta capacidad de emitir múltiples valores a lo largo del tiempo es precisamente lo que hace a los Observables la herramienta apropiada para modelar flujos de eventos continuos (clics del usuario, cambios de valor de un input mientras el usuario escribe, mensajes entrantes de un WebSocket), casos donde una Promesa de un único valor simplemente no encaja conceptualmente, siendo esta la razón fundamental por la que Angular sigue apoyándose en RxJS para ciertos casos, en vez de haber sido completamente reemplazado por signals, que están diseñados deliberadamente para el caso más simple de estado síncrono puntual, no para flujos continuos de eventos a lo largo del tiempo.

**Analogía:** una Promesa es como pedir un solo paquete que llegará exactamente una vez, en un momento futuro determinado, sin posibilidad de cancelar el envío una vez iniciado; un Observable es como suscribirse a una revista con entregas periódicas continuas a lo largo del tiempo, que puedes cancelar en cualquier momento (desuscribiéndote) para dejar de recibir más entregas futuras.

**Diagrama:**

```
┌─────────────────────────────────────────────┐
│ Promise: UN valor, NO cancelable,            │
│          se ejecuta YA al crearse            │
├─────────────────────────────────────────────┤
│ Observable: MULTIPLES valores, cancelable    │
│          (unsubscribe), perezoso             │
│          (empieza SOLO al suscribirse)       │
└─────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Parte de una carpeta vacía (o continúa en `demo-forms` del Módulo 5):

```bash
npx -y @angular/cli@22 new demo-rxjs --standalone --skip-git --defaults
mkdir -p src/app
```

Crea `src/app/observable-vs-promise.ts` con un Observable instrumentado con espías para observar exactamente cuándo se ejecuta su lógica productora y su lógica de limpieza:

```ts
// src/app/observable-vs-promise.ts
import { Observable } from 'rxjs';

export function crearObservableCancelable(
  alProducir: () => void,
  alLimpiar: () => void
): Observable<number> {
  return new Observable<number>((subscriber) => {
    alProducir();
    const id = setTimeout(() => subscriber.next(42), 1000);
    return () => {
      clearTimeout(id);
      alLimpiar();
    };
  });
}
```

```ts
// src/app/observable-vs-promise.spec.ts
import { fakeAsync, tick } from '@angular/core/testing';
import { crearObservableCancelable } from './observable-vs-promise';

describe('Observable es perezoso y cancelable, a diferencia de una Promise', () => {
  it('NO ejecuta su logica productora hasta que alguien se suscribe', () => {
    const alProducir = jasmine.createSpy('alProducir');
    crearObservableCancelable(alProducir, () => {});

    expect(alProducir).not.toHaveBeenCalled();
  });

  it('desuscribirse ANTES de que emita ejecuta la limpieza real y el valor nunca llega', fakeAsync(() => {
    const alProducir = jasmine.createSpy('alProducir');
    const alLimpiar = jasmine.createSpy('alLimpiar');
    const receptor = jasmine.createSpy('receptor');

    const suscripcion = crearObservableCancelable(alProducir, alLimpiar).subscribe(receptor);
    expect(alProducir).toHaveBeenCalledTimes(1);

    suscripcion.unsubscribe();
    tick(1000);

    expect(alLimpiar).toHaveBeenCalledTimes(1);
    expect(receptor).not.toHaveBeenCalled();
  }));
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; el segundo confirma con `receptor` (un espía separado del valor emitido) que desuscribirse ANTES de que el `setTimeout` interno complete impide que `next(42)` llegue jamás — cancelación real, no solo ignorar un resultado que de todas formas se produciría.

**Fallo deliberado:** quita la línea `clearTimeout(id);` de la función de limpieza (dejando solo `alLimpiar();`) y ejecuta de nuevo el segundo test. El test sigue pasando en apariencia, pero agrega esta aserción extra al final: `tick(1000); expect(receptor).not.toHaveBeenCalled();` con un `tick(1000)` adicional — FALLA porque, sin `clearTimeout`, el `setTimeout` original sigue vivo y `subscriber.next(42)` se invoca de todas formas después del `unsubscribe()` (aunque el Observable ya no tiene un suscriptor activo escuchando, el temporizador subyacente nunca se canceló realmente) — diagnosticando que la cancelación de RxJS depende completamente de que la función de limpieza del productor libere los recursos reales subyacentes; RxJS no cancela mágicamente un `setTimeout` por sí solo. Restaura `clearTimeout(id);` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un tercer test que confirme que suscribirse DOS veces al mismo Observable invoca `alProducir` dos veces de forma independiente (evaluación perezosa por suscripción, no compartida).
2. Documenta, en un comentario, qué operador de RxJS (mencionado en el Tema 4) permitiría compartir una única ejecución entre ambas suscripciones en vez de duplicarla.
3. Compara, con un test equivalente usando una función que devuelve una `Promise`, que la Promesa SÍ ejecuta su lógica productora inmediatamente al crearse, sin necesitar ningún `.then()` para dispararla.
4. Escribe de memoria (sin mirar) un Observable con lógica de limpieza real y un test que confirme evaluación perezosa y cancelación real. Compara después contra el patrón del Paso 4.

**Pista:** la función de limpieza que devuelve el productor de un `new Observable(...)` es la única responsable de liberar recursos reales (temporizadores, suscripciones a WebSocket, listeners); `unsubscribe()` por sí solo no libera nada automáticamente si esa función no lo hace explícitamente.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real que detiene una suscripción activa de RxJS:

```ts
const suscripcion = observable$.subscribe(receptor);
suscripcion.____();
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un Observable con lógica productora y de limpieza instrumentadas con espías, y un test que confirme evaluación perezosa y cancelación real. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con espías reales, que un Observable es perezoso (no produce nada sin suscriptor) y genuinamente cancelable (la limpieza real detiene el trabajo subyacente), a diferencia de una Promesa. El siguiente tema confirma con `fakeAsync`/`tick` cómo `switchMap` cancela automáticamente un Observable interno cuando llega un nuevo valor. Fuentes oficiales: [RxJS — Observable](https://rxjs.dev/guide/observable).

**Errores comunes:** asumir que `unsubscribe()` cancela automáticamente cualquier operación asíncrona subyacente sin que el productor implemente su propia función de limpieza; confundir "nadie está escuchando el resultado" con "la operación se detuvo realmente".

**Cuándo no usarlo:** para un único valor asíncrono sin necesidad de cancelación ni de múltiples emisiones (como el resultado de una función `async` simple), una Promesa nativa es más simple y no requiere ningún import de RxJS.

**Transferencia al proyecto integrador «Centro de control logístico»:** Compara una consulta puntual de guía con la secuencia de cambios del filtro. Demuestra qué suscripción puede cancelarse al salir y qué valor debe mantenerse como estado de pantalla.

### Tema 2: Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `fakeAsync`/`tick` sobre un `Subject` real, que `switchMap` cancela efectivamente el Observable interno anterior cuando llega un nuevo valor antes de que ese interno complete — la garantía exacta que resuelve condiciones de carrera en un buscador en vivo.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En un buscador que dispara una petición por cada letra escrita, si la respuesta de una búsqueda antigua ("ta") llega DESPUÉS que la de una búsqueda más reciente ("tarea"), sin `switchMap` la pantalla terminaría mostrando el resultado obsoleto sobrescribiendo al correcto; confirmar con un test real que solo la respuesta más reciente se propaga previene ese bug de condición de carrera.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** transformación y combinación de flujos, cancelación automática con switchMap.

`debounceTime(300)`, aplicado sobre el flujo de cambios de valor de un input (`valueChanges`), espera 300 milisegundos de inactividad antes de dejar pasar el valor más reciente hacia el resto de la cadena de operadores, exactamente el mismo concepto de debounce estudiado en el Módulo 10 del track de JavaScript, ahora expresado como un operador componible dentro de una cadena de RxJS. `distinctUntilChanged()`, colocado inmediatamente después, filtra valores consecutivos idénticos al anterior, evitando disparar una nueva búsqueda si el usuario borra y vuelve a escribir exactamente el mismo texto sin cambio neto real en el valor.

`switchMap(texto => this.api.buscar(texto))` transforma cada valor emitido (el texto de búsqueda) en un nuevo Observable interno (la petición HTTP de búsqueda correspondiente), con una propiedad crucial: si llega un nuevo valor antes de que el Observable interno anterior haya completado, `switchMap` cancela automáticamente ese Observable interno anterior (equivalente conceptual a `AbortController` del Módulo 6 del track de JavaScript, pero gestionado automáticamente por el operador sin código manual de cancelación), garantizando que solo la respuesta correspondiente a la búsqueda más reciente se propague hacia adelante, resolviendo exactamente el mismo problema de condición de carrera de respuestas desordenadas discutido en ese módulo.

`combineLatest([filtro$, orden$])` combina el valor más reciente de múltiples Observables, re-emitiendo un nuevo valor combinado cada vez que cualquiera de las fuentes emite (no solo cuando todas emiten simultáneamente), apropiado para recalcular una lista derivada que depende de múltiples criterios independientes (un filtro y un criterio de orden, por ejemplo) que pueden cambiar de forma independiente entre sí, sin necesidad de coordinar manualmente cuándo cada uno cambió respecto al otro.

**Analogía:** `debounceTime` es como esperar a que alguien termine completamente de hablar antes de responder, en vez de interrumpir a mitad de frase; `switchMap` es como colgar inmediatamente una llamada telefónica en curso en cuanto llega una llamada más urgente y prioritaria, atendiendo siempre solo la más reciente; `combineLatest` es como un panel de control que recalcula automáticamente un valor combinado cada vez que cualquiera de sus indicadores de entrada individuales cambia.

**Diagrama — switchMap cancela el interno anterior:**

```
┌───────────┐      ┌────────────────┐
│ 'ta' llega │ ────▶│ peticion A (en │
└───────────┘      │ curso...)       │
                    └────────────────┘
                          │ CANCELADA
                          ▼
┌───────────┐      ┌────────────────┐
│'tarea' llega│────▶│ peticion B      │───▶ solo B se propaga
└───────────┘      └────────────────┘
```

**Código del ejemplo:**

```ts
resultados = toSignal(
  this.busqueda.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(texto => this.api.buscar(texto)) // cancela la petición anterior automáticamente
  ),
  { initialValue: [] }
);
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-switchmap --standalone --skip-git --defaults`), crea `src/app/buscador.pipeline.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/buscador.pipeline.ts
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ApiBusqueda {
  buscar(texto: string): Observable<string[]>;
}

export function crearPipelineBusqueda(entrada$: Subject<string>, api: ApiBusqueda) {
  return entrada$.pipe(switchMap((texto) => api.buscar(texto)));
}
```

Confirma con `fakeAsync`/`tick` que la respuesta de la primera búsqueda NUNCA llega si una segunda búsqueda se dispara antes de que la primera complete:

```ts
// src/app/buscador.pipeline.spec.ts
import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { crearPipelineBusqueda, ApiBusqueda } from './buscador.pipeline';

describe('switchMap cancela el Observable interno anterior', () => {
  it('si "tarea" llega antes de que resuelva "ta", solo el resultado de "tarea" se propaga', fakeAsync(() => {
    const apiSimulada: ApiBusqueda = {
      buscar: (texto) => of([`resultado-${texto}`]).pipe(delay(300)),
    };
    const entrada$ = new Subject<string>();
    const resultados: string[][] = [];
    crearPipelineBusqueda(entrada$, apiSimulada).subscribe((r) => resultados.push(r));

    entrada$.next('ta');
    tick(100); // "ta" sigue en curso (delay de 300ms)
    entrada$.next('tarea'); // switchMap cancela la busqueda de "ta"

    tick(300); // ahora "tarea" completa

    expect(resultados).toEqual([['resultado-tarea']]);
  }));
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; `resultados` contiene ÚNICAMENTE `['resultado-tarea']`, nunca `'resultado-ta'` — confirmando que `switchMap` canceló efectivamente el Observable interno de la búsqueda anterior antes de que pudiera emitir su valor.

**Fallo deliberado:** cambia `switchMap` por `mergeMap` en `crearPipelineBusqueda` (mismo import de `rxjs/operators`) y ejecuta de nuevo el test. FALLA porque `resultados` ahora contiene AMBOS resultados (`['resultado-ta']` y `['resultado-tarea']`, en ese orden), ya que `mergeMap` deja ejecutar ambas peticiones internas en paralelo sin cancelar ninguna — diagnosticando en código la diferencia exacta de comportamiento entre ambos operadores que la teoría describe. Restaura `switchMap` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega `debounceTime(300)` y `distinctUntilChanged()` antes del `switchMap` en el pipeline, y ajusta el test para confirmar que emitir el mismo texto dos veces consecutivas no dispara una segunda llamada a `buscar`.
2. Repite el experimento del fallo deliberado pero con `concatMap` en vez de `mergeMap`, y documenta en un comentario en qué orden llegan ambos resultados con `concatMap` (a diferencia de `mergeMap`).
3. Escribe un test con `combineLatest` que confirme que cambiar CUALQUIERA de dos Subjects de entrada (`filtro$`, `orden$`) dispara una nueva emisión combinada.
4. Escribe de memoria (sin mirar) un pipeline con `switchMap` sobre un `Subject`, y un test `fakeAsync` que confirme la cancelación del interno anterior. Compara después contra el patrón del Paso 4.

**Pista:** la diferencia entre `switchMap`, `mergeMap`, `concatMap` y `exhaustMap` (Tema 4) es completamente verificable con la misma estructura de test que el Paso 4 — solo cambia el operador y observa qué resultados terminan en el array.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el operador real de RxJS que cancela automáticamente el Observable interno anterior:

```ts
entrada$.pipe(____((texto) => api.buscar(texto)))
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un pipeline con `switchMap` y un test `fakeAsync` que confirme que solo la respuesta más reciente se propaga. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con `fakeAsync`/`tick` sobre un `Subject` real, que `switchMap` cancela el Observable interno anterior cuando llega un nuevo valor, resolviendo condiciones de carrera reales. El siguiente tema confirma con un componente real destruido que `takeUntilDestroyed` completa automáticamente una suscripción, evitando la fuga de memoria clásica. Fuentes oficiales: [RxJS — switchMap](https://rxjs.dev/api/operators/switchMap).

**Errores comunes:** usar `mergeMap` donde la semántica correcta es "solo me interesa la respuesta más reciente" (caso de uso de `switchMap`); olvidar `debounceTime`/`distinctUntilChanged` antes de `switchMap`, disparando peticiones innecesarias en cada tecla.

**Cuándo no usarlo:** si CADA emisión debe procesarse completamente sin cancelar ninguna (por ejemplo, enviar múltiples notificaciones independientes que todas deben completarse), `switchMap` es la elección incorrecta — `mergeMap` (Tema 4) es la apropiada.

**Transferencia al proyecto integrador «Centro de control logístico»:** Combina texto, estado y zona para consultar entregas. Prueba escritura rápida y respuestas invertidas: solo la combinación actual debe aparecer y no deben enviarse consultas por cada tecla.

### Tema 3: Manejo de suscripciones sin fugas de memoria

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con un componente Angular real creado y destruido con `TestBed`, que `takeUntilDestroyed()` completa automáticamente una suscripción cuando el componente se destruye — sin ningún `ngOnDestroy` manual escrito.

**Conocimiento previo:** Módulo 1 de este track (ciclo de vida, `ngOnDestroy`); Tema 1-2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En una aplicación con muchos componentes creándose y destruyéndose durante la navegación normal (Módulo 4), una suscripción manual olvidada mantiene viva una referencia al componente ya destruido, impidiendo que el recolector de basura libere su memoria; confirmar con una prueba real que `takeUntilDestroyed` completa la suscripción exactamente en el momento de la destrucción, sin depender de que un desarrollador recuerde escribir `ngOnDestroy` manualmente, es la garantía concreta que se está verificando.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `async` pipe, `takeUntilDestroyed`, fugas de memoria por suscripciones huérfanas.

Suscribirse manualmente a un Observable con `.subscribe(...)` dentro de un componente crea una responsabilidad explícita de desuscribirse eventualmente (típicamente en `ngOnDestroy`, Módulo 1) para evitar una fuga de memoria: si el componente se destruye pero la suscripción sigue activa, el callback de esa suscripción puede seguir ejecutándose (por ejemplo, intentando actualizar una propiedad de un componente que ya no existe visualmente), manteniendo además una referencia activa que impide que el recolector de basura (Módulo 5 del track de JavaScript) libere la memoria del componente ya destruido, un problema que se agrava considerablemente en aplicaciones con muchos componentes creándose y destruyéndose dinámicamente durante la navegación normal del usuario.

El `async` pipe, usado directamente en la plantilla (`{{ observable$ | async }}` o `@for (item of items$ | async; ...)`), resuelve este problema de forma completamente automática y transparente: se suscribe al Observable cuando el componente se renderiza, y crucialmente se desuscribe automáticamente cuando el componente se destruye, sin ningún código manual de limpieza necesario en `ngOnDestroy`, siendo la razón principal por la que se recomienda preferir el `async` pipe sobre `subscribe()` manual en cualquier caso donde el valor del Observable simplemente necesite mostrarse en la plantilla.

`takeUntilDestroyed()`, un operador más reciente diseñado específicamente para casos donde sí se necesita una suscripción manual explícita (por ejemplo, para ejecutar lógica imperativa en respuesta a cada emisión, no solo para mostrar un valor en la plantilla), automatiza la misma limpieza que el `async` pipe ofrece de forma transparente: aplicado dentro del `pipe()` de un Observable, completa automáticamente ese Observable cuando el componente (o servicio, en un contexto de inyección apropiado) se destruye, eliminando la necesidad de gestionar manualmente un `Subject` de destrucción y de llamarlo explícitamente dentro de `ngOnDestroy`, un patrón considerablemente más verboso que se usaba anteriormente para lograr el mismo resultado antes de que `takeUntilDestroyed` existiera como operador dedicado.

**Analogía:** una suscripción manual sin desuscripción es como dejar una línea telefónica abierta indefinidamente incluso después de que la persona que la atendía ya se retiró del edificio, siguiendo consumiendo recursos sin que nadie esté realmente escuchando del otro lado; el `async` pipe y `takeUntilDestroyed` son como un sistema que cuelga automáticamente la línea en el momento exacto en que la persona correspondiente se retira, sin requerir que nadie recuerde hacerlo manualmente cada vez.

**Diagrama — ciclo de vida de la suscripción:**

```
┌────────────────┐  componente vivo  ┌─────────────────┐
│ eventos$.next(1) │ ─────────────────▶│ recibidos = [1]  │
└────────────────┘                    └─────────────────┘
        │ fixture.destroy()
        ▼
┌────────────────┐  suscripcion YA   ┌─────────────────┐
│ eventos$.next(2) │  completada      │ recibidos = [1]  │ (el 2 nunca llega)
└────────────────┘ ─────────────────▶└─────────────────┘
```

**Código del ejemplo:**

```html
<!-- async pipe: se suscribe Y se desuscribe automáticamente -->
@for (item of resultados$ | async; track item.id) { <li>{{ item.nombre }}</li> }
```
```ts
// takeUntilDestroyed: para suscripciones manuales que sí son necesarias
this.eventos$.pipe(takeUntilDestroyed()).subscribe(evento => this.procesar(evento));
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-cleanup --standalone --skip-git --defaults`), crea `src/app/eventos.component.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/eventos.component.ts
import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

@Component({ selector: 'app-eventos', standalone: true, template: '' })
export class EventosComponent {
  eventos$ = new Subject<number>();
  recibidos: number[] = [];

  constructor() {
    this.eventos$.pipe(takeUntilDestroyed()).subscribe((evento) => this.recibidos.push(evento));
  }
}
```

Confirma con `TestBed` real (creando y destruyendo el componente) que la suscripción se completa exactamente al destruir:

```ts
// src/app/eventos.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { EventosComponent } from './eventos.component';

describe('takeUntilDestroyed completa la suscripcion al destruir el componente', () => {
  it('deja de recibir eventos despues de fixture.destroy()', () => {
    const fixture = TestBed.createComponent(EventosComponent);
    fixture.detectChanges();
    const componente = fixture.componentInstance;

    componente.eventos$.next(1);
    expect(componente.recibidos).toEqual([1]);

    fixture.destroy();
    componente.eventos$.next(2);

    expect(componente.recibidos).toEqual([1]);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; `recibidos` permanece en `[1]` después de `fixture.destroy()`, aunque `eventos$.next(2)` se invoque explícitamente después — la suscripción ya no está activa porque `takeUntilDestroyed()` la completó automáticamente en el momento exacto de la destrucción.

**Fallo deliberado:** quita `.pipe(takeUntilDestroyed())` dejando solo `this.eventos$.subscribe(...)` directo, y ejecuta de nuevo el test. FALLA porque `recibidos` termina en `[1, 2]` en vez de `[1]` — el `2` sí llega, porque sin `takeUntilDestroyed()` nadie completó la suscripción al destruir el componente, reproduciendo exactamente la fuga de memoria que la teoría describe (un callback que sigue ejecutándose sobre un componente ya destruido). Restaura `takeUntilDestroyed()` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Reemplaza la suscripción manual con `takeUntilDestroyed()` por el `async` pipe en un componente con template real, y confirma con un test que el resultado final es equivalente (misma limpieza automática, sin código de suscripción manual).
2. Documenta, en un comentario, en qué casos el `async` pipe NO es suficiente y `takeUntilDestroyed()` sigue siendo necesario (pista: cuando necesitas ejecutar lógica imperativa en cada emisión, no solo mostrar un valor).
3. Escribe un test que confirme que `takeUntilDestroyed()` usado dentro de un servicio (no un componente) requiere pasar explícitamente un `DestroyRef` si se invoca fuera del contexto de inyección del constructor.
4. Escribe de memoria (sin mirar) un componente con una suscripción usando `takeUntilDestroyed()` y un test que confirme la limpieza automática con `fixture.destroy()`. Compara después contra el patrón del Paso 4.

**Pista:** `fixture.destroy()` en un test es el equivalente exacto a que Angular destruya el componente durante una navegación real (Módulo 4) — es la forma correcta de simular el ciclo de vida completo sin necesitar un router real para esta prueba específica.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el operador real de `@angular/core/rxjs-interop` que completa automáticamente un Observable al destruirse el componente:

```ts
this.eventos$.pipe(____()).subscribe(evento => this.procesar(evento));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un componente con una suscripción usando `takeUntilDestroyed()` y un test que confirme que deja de recibir eventos tras `fixture.destroy()`. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con un componente real creado y destruido, que `takeUntilDestroyed()` completa automáticamente una suscripción exactamente al destruirse el componente, sin ningún `ngOnDestroy` manual. El siguiente y último tema confirma con `fakeAsync`/`tick` cómo `exhaustMap` previene el doble envío de un formulario ignorando clics mientras una petición sigue en curso. Fuentes oficiales: [Angular — takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed).

**Errores comunes:** usar `subscribe()` manual sin `takeUntilDestroyed()` ni `async` pipe, dejando la limpieza a la memoria del desarrollador en vez de al framework; usar `takeUntilDestroyed()` fuera de un contexto de inyección sin pasar explícitamente un `DestroyRef`.

**Cuándo no usarlo:** si el valor del Observable solo necesita mostrarse directamente en el template (sin ninguna lógica imperativa adicional en cada emisión), el `async` pipe es más simple y evita el import adicional de `takeUntilDestroyed`.

**Transferencia al proyecto integrador «Centro de control logístico»:** Abre y cierra el panel de seguimiento repetidamente. Cuenta suscripciones al flujo de posiciones y demuestra que destruir el componente deja de recibir actualizaciones y libera la escucha.

### Tema 4: Subjects y operadores de aplanamiento avanzados

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `fakeAsync`/`tick` y un espía real sobre la función de envío, que `exhaustMap` ignora efectivamente un segundo clic de envío mientras el primero sigue en curso — la técnica real para prevenir el doble envío accidental de un formulario.

**Conocimiento previo:** Temas 1-2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En un formulario de confirmación de entrega, un usuario que hace doble clic accidental en "Enviar" (por ansiedad o por una interfaz lenta) no debería disparar dos peticiones de envío duplicadas; confirmar con un espía real que la función de envío se invoca EXACTAMENTE una vez, incluso ante dos clics rápidos, es la prueba concreta de que el bug de doble envío está prevenido.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `Subject`, `BehaviorSubject`, `mergeMap`/`concatMap`/`exhaustMap`, `shareReplay`.

Un `Subject` es simultáneamente un Observable y un "emisor" activo: a diferencia de un Observable normal creado con una función productora, un `Subject` permite invocar `.next(valor)` externamente para emitir un nuevo valor manualmente hacia cualquier suscriptor actualmente activo, siendo útil como puente entre código imperativo (eventos del DOM, callbacks de terceros) y el mundo declarativo de RxJS. `BehaviorSubject` extiende `Subject` con un valor inicial obligatorio y la propiedad de recordar siempre el último valor emitido, entregándolo inmediatamente a cualquier nuevo suscriptor que se una después de que ya hubo emisiones anteriores (en vez de que ese nuevo suscriptor tenga que esperar a la siguiente emisión futura para recibir algo). `ReplaySubject` extiende esta idea recordando un número configurable de emisiones pasadas (no solo la última), y `AsyncSubject` solo emite el último valor, y únicamente cuando el Subject se completa formalmente, nunca antes.

`mergeMap`, `concatMap` y `exhaustMap` son alternativas a `switchMap` (Tema 2) para el mismo problema general de transformar cada valor emitido en un nuevo Observable interno, pero con estrategias distintas ante emisiones superpuestas: `mergeMap` ejecuta todos los Observables internos en paralelo simultáneamente, sin cancelar ninguno (apropiado cuando cada operación es independiente y todas deben completarse, como enviar múltiples notificaciones simultáneas); `concatMap` ejecuta los Observables internos en estricta secuencia, uno después de que el anterior completa (apropiado cuando el orden de ejecución importa genuinamente, como guardar cambios en un orden específico); `exhaustMap` ignora completamente nuevas emisiones mientras un Observable interno anterior sigue en curso (apropiado para prevenir doble envío accidental de un formulario, ignorando clics adicionales del botón de envío mientras la petición anterior todavía está en proceso).

`shareReplay()` convierte un Observable "frío" (que ejecuta su lógica productora de forma independiente para cada nueva suscripción) en uno "caliente" que comparte una única ejecución subyacente entre múltiples suscriptores, cacheando además un número configurable de emisiones pasadas para entregarlas inmediatamente a cualquier suscriptor nuevo que llegue después, útil para evitar disparar la misma petición HTTP costosa múltiples veces cuando varios componentes distintos se suscriben independientemente al mismo Observable de datos compartido.

**Analogía:** `mergeMap` es como atender simultáneamente a todos los clientes que llegan, sin hacer esperar a ninguno por el otro; `concatMap` es como atender a los clientes estrictamente en el orden de llegada, uno completamente después del anterior; `exhaustMap` es como un empleado que, mientras atiende a un cliente, simplemente ignora a cualquier otro que intente interrumpir hasta terminar con el actual. `shareReplay` es como una única presentación grabada que múltiples espectadores pueden ver, compartiendo la misma grabación en vez de que el presentador tenga que repetir la presentación completa para cada espectador individual.

**Diagrama:**

```
┌───────────┬──────────────────────────────────────────────┐
│ switchMap  │ cancela el anterior (buscadores)              │
│ mergeMap   │ ejecuta todos en paralelo (notificaciones)    │
│ concatMap  │ ejecuta en secuencia estricta (orden importa) │
│ exhaustMap │ ignora nuevas emisiones (prevenir doble envio)│
└───────────┴──────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-exhaustmap --standalone --skip-git --defaults`), crea `src/app/envio.pipeline.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/envio.pipeline.ts
import { Observable, Subject } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

export interface ApiEnvio {
  enviar(): Observable<string>;
}

export function crearPipelineEnvio(click$: Subject<void>, api: ApiEnvio) {
  return click$.pipe(exhaustMap(() => api.enviar()));
}
```

Confirma con `fakeAsync`/`tick` y un espía real que un segundo clic durante el envío en curso NUNCA dispara una segunda llamada:

```ts
// src/app/envio.pipeline.spec.ts
import { fakeAsync, tick } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { crearPipelineEnvio, ApiEnvio } from './envio.pipeline';

describe('exhaustMap ignora clics mientras un envio esta en curso', () => {
  it('el segundo clic durante el envio se ignora; solo un envio real ocurre', fakeAsync(() => {
    const enviarSpy = jasmine.createSpy('enviar').and.callFake(() => of('ok').pipe(delay(300)));
    const apiSimulada: ApiEnvio = { enviar: enviarSpy };
    const click$ = new Subject<void>();
    const resultados: string[] = [];
    crearPipelineEnvio(click$, apiSimulada).subscribe((r) => resultados.push(r));

    click$.next();
    tick(100); // el envio sigue en curso (delay de 300ms)
    click$.next(); // IGNORADO por exhaustMap

    tick(300);

    expect(enviarSpy).toHaveBeenCalledTimes(1);
    expect(resultados).toEqual(['ok']);
  }));
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; `enviarSpy` se invocó exactamente UNA vez, a pesar de que `click$.next()` se llamó dos veces — el segundo clic, ocurrido mientras el primer envío seguía en curso, fue completamente ignorado por `exhaustMap`, previniendo el doble envío real.

**Fallo deliberado:** cambia `exhaustMap` por `mergeMap` en `crearPipelineEnvio` y ejecuta de nuevo el test. FALLA porque `enviarSpy` ahora se invocó `2` veces en vez de `1` (`toHaveBeenCalledTimes(1)` falla) — diagnosticando en código el bug real de doble envío que `exhaustMap` existe específicamente para prevenir. Restaura `exhaustMap` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Repite el mismo test pero con `concatMap`, y confirma que en ese caso `enviarSpy` SÍ se invoca dos veces (a diferencia de `exhaustMap`), pero en estricta secuencia una después de la otra.
2. Crea un `BehaviorSubject` con un valor inicial y confirma con un test que un suscriptor que se une DESPUÉS de la primera emisión recibe inmediatamente el último valor emitido, sin esperar una nueva emisión futura.
3. Escribe un test con `shareReplay()` que confirme que dos suscriptores independientes al mismo Observable comparten una única ejecución de la lógica productora (usa un espía para contar cuántas veces se invoca).
4. Escribe de memoria (sin mirar) un pipeline con `exhaustMap` y un test `fakeAsync` que confirme que un segundo clic durante un envío en curso se ignora. Compara después contra el patrón del Paso 4.

**Pista:** la diferencia de comportamiento entre `switchMap`, `mergeMap`, `concatMap` y `exhaustMap` es completamente verificable contando cuántas veces se invoca un espía y en qué orden llegan los resultados — no necesitas memorizar la diferencia en abstracto, puedes reproducirla en un test cada vez que la olvides.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el operador real de RxJS que ignora nuevas emisiones mientras el Observable interno anterior sigue en curso:

```ts
click$.pipe(____(() => api.enviar()))
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un pipeline con `exhaustMap` y un test `fakeAsync` con un espía que confirme exactamente una invocación ante dos clics rápidos. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con un espía real y `fakeAsync`/`tick`, que `exhaustMap` previene el doble envío ignorando clics mientras una operación sigue en curso. Con esto cierras el módulo de RxJS: Observable vs Promise (Tema 1), `switchMap` cancela condiciones de carrera (Tema 2), `takeUntilDestroyed` evita fugas de memoria (Tema 3), y los operadores de aplanamiento correctos según la semántica deseada (Tema 4). El siguiente módulo aplica estos flujos a peticiones HTTP reales con `HttpClient` e interceptores. Fuentes oficiales: [RxJS — exhaustMap](https://rxjs.dev/api/operators/exhaustMap).

**Errores comunes:** usar `mergeMap` o `concatMap` para prevenir doble envío (ambos SÍ ejecutan ambas llamadas, solo cambia el orden/paralelismo, no la prevención); asumir que `exhaustMap` "cancela" la nueva emisión en vez de simplemente ignorarla (no la cancela, ni siquiera la procesa).

**Cuándo no usarlo:** si cada emisión debe generar su propio Observable interno sin ser ignorada bajo ninguna circunstancia (por ejemplo, cada clic en "agregar producto al carrito" debe contar, incluso si el anterior sigue procesándose), `exhaustMap` descartaría silenciosamente eventos válidos — `mergeMap` o `concatMap` son las opciones correctas en ese caso.

---

**Transferencia al proyecto integrador «Centro de control logístico»:** Compara búsquedas reemplazables con confirmaciones que deben controlarse contra doble clic. Prueba cada flujo con peticiones pendientes y explica por qué necesitan operadores de aplanamiento distintos.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un buscador con debounce y cancelación automática de peticiones previas, y practicar el manejo correcto de suscripciones.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear el buscador con debounce | Ver Tema 2 | `debounceTime(300)` + `distinctUntilChanged()` |
| 2 | Usar `switchMap` para las peticiones | Ver Tema 2 | Verifica que cancela la anterior automáticamente |
| 3 | Combinar filtro y orden con `combineLatest` | Ver Tema 2 | Recalcula al cambiar cualquiera de las dos fuentes |
| 4 | Usar el `async` pipe en la plantilla | Ver Tema 3 | Explica por qué evita fugas de memoria |
| 5 | Convertir el resultado a signal | `toSignal()` | Úsalo en un `computed()` posterior |

**Verificación:** el laboratorio se considera exitoso si el buscador cancela correctamente peticiones anteriores al escribir rápido (verificable en la pestaña Network, viendo peticiones canceladas), y si no hay ninguna fuga de memoria verificable tras destruir y recrear el componente repetidamente.

**Errores comunes y soluciones**

- **Usar `subscribe()` manual sin desuscribirse en `ngOnDestroy`.** Prefiere el `async` pipe, o usa `takeUntilDestroyed()` si necesitas una suscripción manual explícita.
- **Usar `mergeMap` donde `switchMap` sería lo correcto.** Si solo te interesa la respuesta más reciente (como en un buscador), usa `switchMap` para cancelar automáticamente las anteriores.
- **Olvidar `distinctUntilChanged()` tras `debounceTime`.** Sin él, valores idénticos consecutivos disparan búsquedas redundantes innecesarias.

---
