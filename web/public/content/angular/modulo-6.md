# Módulo 6: RxJS esencial para Angular


## Aprende construyendo


### Tema 1: Observable frente a Promise · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con espías reales (vi.fn()) y el reloj simulado de Vitest (vi.useFakeTimers()), dos propiedades de los Observables que las Promesas nativas NO tienen: evaluación perezosa (no producen nada hasta que alguien se suscribe) y cancelación real (desuscrib…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con espías reales (vi.fn()) y el reloj simulado de Vitest (vi.useFakeTimers()), dos propiedades de los Observables que las Promesas nativas NO tienen: evaluación perezosa (no producen nada hasta que alguien se suscribe) y cancelación real (desuscribirse detiene efectivamente la operación en curso).**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en observable frente a promise como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que observable frente a promise resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► REGLA PRÁCTICA
Si la operación produce un único valor y no necesitas cancelarla a medias, una Promise (o `async`/`await`) es más simple. Si necesitas cancelar una operación en curso (el usuario navega a otra pantalla, escribe una nueva búsqueda) o esperas múltiples valores en el tiempo, necesitas un Observable: una Promise ya empezó a ejecutarse en cuanto se creó y no tiene forma de detenerla.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Observable frente a Promise se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Observable frente a Promise | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses observable frente a promise por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: observable frente a promise funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Observable frente a Promise existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve observable frente a promise en tu contexto?
2. ¿Cómo sabrías que observable frente a promise no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar observable frente a promise?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
npx -y @angular/cli@22 new demo-rxjs --standalone --skip-git --defaults
cd demo-rxjs
mkdir -p src/app
```

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
import { crearObservableCancelable } from './observable-vs-promise';

describe('Observable es perezoso y cancelable, a diferencia de una Promise', () => {
  beforeEach(() => vi.useFakeTimers()); // reloj simulado de Vitest
  afterEach(() => vi.useRealTimers());

  it('NO ejecuta su logica productora hasta que alguien se suscribe', () => {
    const alProducir = vi.fn();
    crearObservableCancelable(alProducir, () => {});

    expect(alProducir).not.toHaveBeenCalled();
  });

  it('desuscribirse ANTES de que emita ejecuta la limpieza real y el valor nunca llega', () => {
    const alProducir = vi.fn();
    const alLimpiar = vi.fn();
    const receptor = vi.fn();

    const suscripcion = crearObservableCancelable(alProducir, alLimpiar).subscribe(receptor);
    expect(alProducir).toHaveBeenCalledTimes(1);

    suscripcion.unsubscribe();
    vi.advanceTimersByTime(1000);

    expect(alLimpiar).toHaveBeenCalledTimes(1);
    expect(receptor).not.toHaveBeenCalled();
  });
});
```

```bash
npx ng test --watch=false
```

```ts
const suscripcion = observable$.subscribe(receptor);
suscripcion.____();
```

</details>

### Tema 2: Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con el reloj simulado de Vitest (vi.useFakeTimers()) sobre un Subject real, que switchMap cancela efectivamente el Observable interno anterior cuando llega un nuevo valor antes de que ese interno complete — la garantía exacta que resuelve condicione…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con el reloj simulado de Vitest (vi.useFakeTimers()) sobre un Subject real, que switchMap cancela efectivamente el Observable interno anterior cuando llega un nuevo valor antes de que ese interno complete — la garantía exacta que resuelve condiciones de carrera en un buscador en vivo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
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

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que operadores clave — debouncetime, distinctuntilchanged, switchmap, combinelatest resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses operadores clave — debouncetime, distinctuntilchanged, switchmap, combinelatest por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: operadores clave — debouncetime, distinctuntilchanged, switchmap, combinelatest funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve operadores clave — debouncetime, distinctuntilchanged, switchmap, combinelatest en tu contexto?
2. ¿Cómo sabrías que operadores clave — debouncetime, distinctuntilchanged, switchmap, combinelatest no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar operadores clave — debouncetime, distinctuntilchanged, switchmap, combinelatest?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```ts
// src/app/buscador.pipeline.spec.ts
import { Subject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { crearPipelineBusqueda, ApiBusqueda } from './buscador.pipeline';

describe('switchMap cancela el Observable interno anterior', () => {
  beforeEach(() => vi.useFakeTimers()); // reloj simulado de Vitest
  afterEach(() => vi.useRealTimers());

  it('si "tarea" llega antes de que resuelva "ta", solo el resultado de "tarea" se propaga', () => {
    const apiSimulada: ApiBusqueda = {
      buscar: (texto) => of([`resultado-${texto}`]).pipe(delay(300)),
    };
    const entrada$ = new Subject<string>();
    const resultados: string[][] = [];
    crearPipelineBusqueda(entrada$, apiSimulada).subscribe((r) => resultados.push(r));

    entrada$.next('ta');
    vi.advanceTimersByTime(100); // "ta" sigue en curso (delay de 300ms)
    entrada$.next('tarea'); // switchMap cancela la busqueda de "ta"

    vi.advanceTimersByTime(300); // ahora "tarea" completa

    expect(resultados).toEqual([['resultado-tarea']]);
  });
});
```

```bash
npx ng test --watch=false
```

</details>

### Tema 3: Manejo de suscripciones sin fugas de memoria · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con un componente Angular real creado y destruido con TestBed, que takeUntilDestroyed() completa automáticamente una suscripción cuando el componente se destruye — sin ningún ngOnDestroy manual escrito.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con un componente Angular real creado y destruido con TestBed, que takeUntilDestroyed() completa automáticamente una suscripción cuando el componente se destruye — sin ningún ngOnDestroy manual escrito.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en manejo de suscripciones sin fugas de memoria como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que manejo de suscripciones sin fugas de memoria resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Manejo de suscripciones sin fugas de memoria se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Manejo de suscripciones sin fugas de memoria | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses manejo de suscripciones sin fugas de memoria por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: manejo de suscripciones sin fugas de memoria funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Manejo de suscripciones sin fugas de memoria existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve manejo de suscripciones sin fugas de memoria en tu contexto?
2. ¿Cómo sabrías que manejo de suscripciones sin fugas de memoria no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar manejo de suscripciones sin fugas de memoria?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```html
<!-- async pipe: se suscribe Y se desuscribe automáticamente -->
@for (item of resultados$ | async; track item.id) { <li>{{ item.nombre }}</li> }
```

```ts
// takeUntilDestroyed: para suscripciones manuales que sí son necesarias
this.eventos$.pipe(takeUntilDestroyed()).subscribe(evento => this.procesar(evento));
```

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

</details>

### Tema 4: Subjects y operadores de aplanamiento avanzados · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con el reloj simulado de Vitest (vi.useFakeTimers()) y un espía real sobre la función de envío, que exhaustMap ignora efectivamente un segundo clic de envío mientras el primero sigue en curso — la técnica real para prevenir el doble envío accidental…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con el reloj simulado de Vitest (vi.useFakeTimers()) y un espía real sobre la función de envío, que exhaustMap ignora efectivamente un segundo clic de envío mientras el primero sigue en curso — la técnica real para prevenir el doble envío accidental de un formulario.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en subjects y operadores de aplanamiento avanzados como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que subjects y operadores de aplanamiento avanzados resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Subjects y operadores de aplanamiento avanzados se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Subjects y operadores de aplanamiento avanzados | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses subjects y operadores de aplanamiento avanzados por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: subjects y operadores de aplanamiento avanzados funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Subjects y operadores de aplanamiento avanzados existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve subjects y operadores de aplanamiento avanzados en tu contexto?
2. ¿Cómo sabrías que subjects y operadores de aplanamiento avanzados no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar subjects y operadores de aplanamiento avanzados?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌───────────┬──────────────────────────────────────────────┐
│ switchMap  │ cancela el anterior (buscadores)              │
│ mergeMap   │ ejecuta todos en paralelo (notificaciones)    │
│ concatMap  │ ejecuta en secuencia estricta (orden importa) │
│ exhaustMap │ ignora nuevas emisiones (prevenir doble envio)│
└───────────┴──────────────────────────────────────────────┘
```

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

```ts
// src/app/envio.pipeline.spec.ts
import { Subject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { crearPipelineEnvio, ApiEnvio } from './envio.pipeline';

describe('exhaustMap ignora clics mientras un envio esta en curso', () => {
  beforeEach(() => vi.useFakeTimers()); // reloj simulado de Vitest
  afterEach(() => vi.useRealTimers());

  it('el segundo clic durante el envio se ignora; solo un envio real ocurre', () => {
    const enviarSpy = vi.fn(() => of('ok').pipe(delay(300)));
    const apiSimulada: ApiEnvio = { enviar: enviarSpy };
    const click$ = new Subject<void>();
    const resultados: string[] = [];
    crearPipelineEnvio(click$, apiSimulada).subscribe((r) => resultados.push(r));

    click$.next();
    vi.advanceTimersByTime(100); // el envio sigue en curso (delay de 300ms)
    click$.next(); // IGNORADO por exhaustMap

    vi.advanceTimersByTime(300);

    expect(enviarSpy).toHaveBeenCalledTimes(1);
    expect(resultados).toEqual(['ok']);
  });
});
```

```bash
npx ng test --watch=false
```

```ts
click$.pipe(____(() => api.enviar()))
```

</details>
