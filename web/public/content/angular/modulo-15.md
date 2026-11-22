# Módulo 15: Pruebas de signals, E2E, animación y TransferState


## Aprende construyendo

Este módulo reúne cuatro técnicas que no aparecen antes en el curso, cada una verificada con la herramienta real (Vitest, Playwright, transiciones CSS con `prefers-reduced-motion` y `TransferState`). `TestBed` y `ComponentFixture` se enseñan en el Módulo 10, Tema 1; SSR, hidratación e `isPlatformBrowser`, en el Módulo 11, Temas 1 y 2.

### Tema 1: Pruebas de Signals · Avanzado · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, contando invocaciones reales con un spy, que un `computed()` memoiza su resultado y solo se recalcula cuando su dependencia real cambia, no en cada lectura.

**Conocimiento previo:** Módulo 2 de este track (`signal()`, `computed()`, `effect()`).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un `computed()` que pareciera recalcular su valor en cada lectura desperdiciaría trabajo en cálculos costosos (por ejemplo, filtrar una lista grande de entregas); confirmar la memoización real, no solo confiar en la documentación, evita sorpresas de rendimiento en producción.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** memoización de `computed()`, `effect()` dentro de un contexto de inyección, `TestBed.runInInjectionContext`.

`computed(() => ...)` solo reevalúa su función cuando alguna de las señales que lee internamente cambió desde la última evaluación; leerlo repetidamente sin que sus dependencias cambien devuelve el valor cacheado sin re-ejecutar la función. `effect()` necesita un contexto de inyección de Angular para registrarse correctamente; en un test sin componente, `TestBed.runInInjectionContext(() => effect(...))` provee ese contexto.

**Analogía:** un `computed()` es como un asistente que solo recalcula el total de una factura cuando alguna línea de la factura realmente cambió, en vez de repetir la suma completa cada vez que alguien simplemente pregunta el total.

**Diagrama:**

```mermaid
flowchart LR
  S["signal(precio)"] --> C["computed(() => calcular(precio))"]
  C -->|primera lectura| E1[ejecuta la función, cachea]
  C -->|lecturas repetidas SIN cambio| E2[devuelve el valor cacheado, NO reejecuta]
  S -->|cambia| C
  C -->|siguiente lectura| E3[reejecuta: dependencia cambió]
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `demo-testbed` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-signals --standalone --skip-git --defaults` y luego `cd demo-signals`), crea `src/app/carrito.signals.spec.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/carrito.signals.spec.ts
import { signal, computed, effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('computed() memoiza su resultado real', () => {
  it('no reejecuta la función si la dependencia no cambió', () => {
    const calculo = vi.fn((precio: number, cantidad: number) => precio * cantidad);
    const precio = signal(10);
    const cantidad = signal(2);
    const total = computed(() => calculo(precio(), cantidad()));

    expect(total()).toBe(20);
    expect(total()).toBe(20); // segunda lectura, SIN cambiar ninguna dependencia
    expect(total()).toBe(20); // tercera lectura, tampoco cambia nada

    expect(calculo).toHaveBeenCalledTimes(1); // memoización real: la función solo se ejecutó UNA vez
  });

  it('reejecuta solo cuando la dependencia real cambia', () => {
    const calculo = vi.fn((precio: number) => precio * 2);
    const precio = signal(10);
    const doble = computed(() => calculo(precio()));

    expect(doble()).toBe(20);
    precio.set(15); // AHORA sí cambia la dependencia real
    expect(doble()).toBe(30);

    expect(calculo).toHaveBeenCalledTimes(2); // una ejecución por cada cambio real de dependencia
  });

  it('effect() requiere un contexto de inyección real de Angular', () => {
    TestBed.runInInjectionContext(() => {
      const contador = signal(0);
      const valoresObservados: number[] = [];

      effect(() => valoresObservados.push(contador()));

      TestBed.tick();
      contador.set(5);
      TestBed.tick();

      expect(valoresObservados).toEqual([0, 5]);
    });
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** todos los tests pasan; `calculo` (un spy real de Vitest, no una suposición) confirma con un conteo exacto de invocaciones que `computed()` memoiza: 1 sola ejecución tras 3 lecturas sin cambios, y exactamente 2 ejecuciones tras 1 cambio real de dependencia.

**Fallo deliberado:** cambia el segundo test para leer `precio()` DIRECTAMENTE dentro del `computed` en vez de a través de la señal reactiva (por ejemplo, capturando su valor en una variable local ANTES de crear el `computed`, rompiendo el rastreo de dependencias) y ejecuta de nuevo. `calculo` se invoca solo 1 vez incluso tras `precio.set(15)`, y `expect(calculo).toHaveBeenCalledTimes(2)` FALLA — diagnostica confirmando que `computed()` solo rastrea dependencias que lee DIRECTAMENTE en su función durante la ejecución; capturar un valor por fuera rompe el rastreo reactivo silenciosamente. Restaura la lectura directa `precio()` dentro del `computed` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega una segunda señal no relacionada y confirma con el spy que modificarla NO dispara una reejecución del `computed` que no depende de ella.
2. Encadena dos `computed()` (uno que depende del otro) y confirma con spies en ambos que un cambio en la señal base reejecuta ambos exactamente una vez cada uno.
3. Escribe un test que confirme que `effect()` se ejecuta inmediatamente al registrarse (con el valor inicial), antes de cualquier cambio posterior.
4. Escribe de memoria (sin mirar) un `computed()` con un spy que confirme memoización real. Compara después contra el patrón del Paso 4.

**Pista:** `vi.fn(...)` (el spy de Vitest, el test runner real que usa este proyecto para Angular) envuelve una función real y registra cada invocación — `toHaveBeenCalledTimes(n)` es la aserción exacta para confirmar memoización, mucho más confiable que inferir por el tiempo de ejecución.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método de aserción de Vitest que confirma el número exacto de invocaciones de un spy:

```ts
expect(calculo).____(1);
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `computed()` y un spy que confirme memoización real tras varias lecturas sin cambios. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas con un spy real que `computed()` memoiza correctamente y solo reejecuta ante cambios reales de dependencia. El siguiente tema prueba el comportamiento de la aplicación completa desde la perspectiva de un usuario real, con Playwright. Fuentes oficiales: [Angular — Signals](https://angular.dev/guide/signals).

**Errores comunes:** capturar el valor de una señal en una variable local antes de leerla dentro de un `computed`, rompiendo el rastreo reactivo; asumir memoización sin confirmarla con un spy real.

**Cuándo no usarlo:** para un valor derivado trivial y barato de recalcular (una concatenación simple de dos strings cortos), la memoización de `computed()` no aporta ningún beneficio medible sobre una función plana.

**Transferencia al proyecto integrador «Centro de control logístico»:** Prueba el total de entregas pendientes derivado de Signals. Añade, completa y elimina una guía; el valor debe cambiar por actualización inmutable sin mutar el arreglo almacenado.

### Tema 2: Cypress y Playwright · Avanzado · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escribir un test E2E real con Playwright que navega la aplicación, localiza elementos por rol accesible (no por selector CSS frágil) y confirma un flujo de usuario completo, y explicarás por qué esa elección de selector importa.

**Conocimiento previo:** Módulo 13 de este track (proyecto integrador).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Los tests de `TestBed` verifican unidades aisladas; un test E2E real confirma que la aplicación completa (routing, HTTP real o interceptado, renderizado) funciona desde la perspectiva de un usuario en un navegador real, la única capa de test que detecta problemas de integración entre todas las piezas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** locators accesibles (`getByRole`), auto-waiting, selectores CSS frágiles.

Playwright (y Cypress de forma similar) automatiza un navegador REAL, no una simulación del DOM. `page.getByRole('button', { name: 'Confirmar entrega' })` localiza elementos por su rol y nombre accesible, el mismo mecanismo que usaría un lector de pantalla, en vez de depender de una clase CSS (`.btn-confirm-3`) que puede cambiar con cualquier refactor de estilos sin que el flujo de usuario real haya cambiado. Playwright espera automáticamente ("auto-waiting") a que un elemento sea visible e interactuable antes de actuar sobre él, evitando manejar temporizadores manualmente.

**Analogía:** un selector por rol accesible es como dar direcciones por el nombre real de un lugar ("la farmacia de la esquina"), mientras un selector CSS frágil es como dar direcciones por un detalle temporal ("la tienda con el cartel amarillo") que puede cambiar sin que el lugar deje de ser el mismo.

**Diagrama:**

```
┌── Selector CSS frágil ────────────┐  .btn-confirm-3 — se rompe con refactors de estilo
└──────────────────────────┘
┌── Locator accesible ──────────────┐  getByRole('button', {name:'Confirmar'}) — estable
└──────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `demo-testbed` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `mkdir demo-e2e && cd demo-e2e && npm init -y && npm install -D @playwright/test`), crea `e2e/confirmar-entrega.spec.ts`:

```bash
npm install -D @playwright/test
mkdir -p e2e
```

```ts
// e2e/confirmar-entrega.spec.ts
import { test, expect } from '@playwright/test';

test('un conductor puede confirmar una entrega desde la interfaz real', async ({ page }) => {
  await page.goto('http://localhost:4200/entregas/PED-001');

  // locator por ROL accesible, no por clase CSS frágil
  const boton = page.getByRole('button', { name: 'Confirmar entrega' });
  await expect(boton).toBeVisible(); // auto-waiting real: espera hasta que sea visible

  await boton.click();

  const estado = page.getByRole('status'); // región con aria-live, anunciada a lectores de pantalla
  await expect(estado).toHaveText('Entrega confirmada');
});
```

```bash
npx playwright test e2e/confirmar-entrega.spec.ts
```

**Resultado esperado:** el test navega un navegador REAL (Chromium por defecto), localiza el botón por su rol y nombre accesible, hace click real, y confirma que la región de estado (anunciada a lectores de pantalla vía `aria-live`) refleja el cambio — un flujo de usuario completo verificado de extremo a extremo, no una suposición sobre el comportamiento de componentes aislados.

**Fallo deliberado:** cambia el locator a `page.locator('.btn-confirmar-3')` (un selector CSS específico y frágil) y documenta el resultado: si un refactor de estilos posterior renombra esa clase a `.btn-confirm-v2` sin cambiar el comportamiento real del botón (sigue siendo el mismo botón "Confirmar entrega" para el usuario), este test fallaría con un error de "elemento no encontrado" que NO refleja ningún problema real de funcionalidad — diagnostica confirmando por qué la teoría insiste en locators accesibles: acoplan el test al comportamiento real que le importa al usuario, no a detalles de implementación de estilos que cambian por razones no relacionadas. Restaura el locator por rol antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega una aserción de accesibilidad básica confirmando que el botón tiene un `aria-label` o texto accesible no vacío.
2. Documenta, en un comentario, la diferencia sintáctica entre Playwright (`page.getByRole(...)`, `await expect(...)`) y Cypress (`cy.get('[data-testid=...]')`, `cy.contains(...)`) para el mismo flujo, y en qué casos uno podría preferirse sobre el otro (Cypress: debugging interactivo más maduro; Playwright: soporte multi-navegador y ejecución más rápida en paralelo).
3. Configura el test para ejecutarse contra 2 navegadores distintos (Chromium y Firefox) en la configuración de Playwright, documentando por qué esto detecta bugs específicos de motor de renderizado que un solo navegador no revelaría.
4. Escribe de memoria (sin mirar) un test Playwright con un locator por rol accesible y una aserción de auto-waiting. Compara después contra el patrón del Paso 4.

**Pista:** `getByRole`, `getByLabel` y `getByText` son locators que reflejan cómo un usuario real (o un lector de pantalla) percibe la página, no su estructura HTML interna — priorízalos sobre `page.locator('.clase-css')` salvo que no exista ninguna alternativa accesible razonable.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el locator de Playwright que busca un elemento por su rol accesible y nombre:

```ts
const boton = page.____('button', { name: 'Confirmar entrega' });
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test Playwright con un locator por rol accesible, y explica por qué es preferible a un selector CSS. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya escribes tests E2E reales con locators accesibles y auto-waiting, verificando flujos de usuario completos en un navegador real. El siguiente tema construye animaciones que respetan las preferencias de accesibilidad del usuario. Fuentes oficiales: [Playwright — Locators](https://playwright.dev/docs/locators).

**Errores comunes:** depender de selectores CSS o `data-testid` cuando un locator accesible por rol ya existe y es más estable; no esperar explícitamente (o confiar mal en el auto-waiting) antes de aserciones sobre contenido que cambia asincrónicamente.

**Cuándo no usarlo:** para lógica de negocio pura sin ninguna interacción de UI real, un test E2E completo es una herramienta desproporcionadamente costosa (lenta, frágil ante cambios de infraestructura); un test unitario o de integración más acotado es más apropiado.

### Tema 3: Animaciones accesibles · Avanzado · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con un test real que simula la preferencia `prefers-reduced-motion` del sistema operativo, que una animación respeta esa preferencia reduciendo su duración a un valor mínimo en vez de ignorarla.

**Conocimiento previo:** Módulo 1 de este track (componentes y bindings).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Algunos usuarios experimentan mareo o malestar real con animaciones de movimiento; el sistema operativo expone una preferencia estándar (`prefers-reduced-motion`) que las aplicaciones deben respetar activamente, no una animación decorativa que ignora esa señal de accesibilidad.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `window.matchMedia('(prefers-reduced-motion: reduce)')`, duración condicional.

`window.matchMedia('(prefers-reduced-motion: reduce)').matches` consulta en tiempo real si el sistema operativo del usuario tiene activada la preferencia de movimiento reducido; un componente responsable consulta este valor y ajusta la duración (o directamente desactiva) sus animaciones en consecuencia, en vez de asumir que todos los usuarios toleran el movimiento por igual.

**Analogía:** respetar `prefers-reduced-motion` es como bajar automáticamente el volumen de la música de fondo cuando alguien indica explícitamente que le resulta molesto, en vez de asumir que a todos les gusta el mismo nivel.

**Diagrama:**

```mermaid
flowchart LR
  M["matchMedia('prefers-reduced-motion: reduce')"] --> D{"¿matches === true?"}
  D -->|sí| R[duración de animación = 1ms]
  D -->|no| N[duración de animación normal]
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `demo-testbed` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-animaciones --standalone --skip-git --defaults` y luego `cd demo-animaciones`), crea `src/app/notificacion-animada.component.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/notificacion-animada.component.ts
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-notificacion-animada',
  standalone: true,
  template: `<div class="notificacion" [style.transition-duration.ms]="duracionMs()">Entrega confirmada</div>`,
})
export class NotificacionAnimadaComponent {
  private prefiereMovimientoReducido = signal(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  duracionMs = computed(() => (this.prefiereMovimientoReducido() ? 1 : 300));

  // expuesto para testing: permite inyectar la preferencia sin depender del entorno real del navegador de CI
  establecerPreferenciaParaTest(valor: boolean) {
    this.prefiereMovimientoReducido.set(valor);
  }
}
```

Confirma con un test real que simula ambas preferencias del sistema:

```ts
// src/app/notificacion-animada.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { NotificacionAnimadaComponent } from './notificacion-animada.component';

describe('NotificacionAnimadaComponent', () => {
  it('usa una duracion minima cuando el usuario prefiere movimiento reducido', async () => {
    await TestBed.configureTestingModule({ imports: [NotificacionAnimadaComponent] }).compileComponents();
    const fixture = TestBed.createComponent(NotificacionAnimadaComponent);

    fixture.componentInstance.establecerPreferenciaParaTest(true); // simula prefers-reduced-motion: reduce
    fixture.detectChanges();

    expect(fixture.componentInstance.duracionMs()).toBe(1);
  });

  it('usa la duracion normal cuando el usuario NO prefiere movimiento reducido', async () => {
    await TestBed.configureTestingModule({ imports: [NotificacionAnimadaComponent] }).compileComponents();
    const fixture = TestBed.createComponent(NotificacionAnimadaComponent);

    fixture.componentInstance.establecerPreferenciaParaTest(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.duracionMs()).toBe(300);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan: el `computed()` real de duración devuelve `1`ms cuando la preferencia simulada de movimiento reducido está activa, y `300`ms cuando no lo está — confirmando que el componente REACCIONA a la preferencia, no solo la lee una vez de forma decorativa.

**Fallo deliberado:** cambia `duracionMs = computed(...)` por una constante fija `duracionMs = signal(300)` (ignorando la preferencia por completo, el error real que la teoría advierte) y ejecuta de nuevo el primer test. FALLA porque `duracionMs()` sigue devolviendo `300` incluso con la preferencia de movimiento reducido activada — diagnostica confirmando en código, no solo en documentación de diseño, que ignorar `prefers-reduced-motion` produce exactamente el problema de accesibilidad que la teoría describe. Restaura el `computed()` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un tercer estado (preferencia "no especificada", cuando `matchMedia` no está disponible, como en SSR) y confirma con un test que el componente usa un valor por defecto seguro sin lanzar ningún error.
2. Escribe un test que confirme que cambiar la preferencia DESPUÉS del render inicial (simulando que el usuario cambia su configuración del sistema operativo mientras la app está abierta) actualiza la duración reactivamente.
3. Documenta, en un comentario, por qué `duracionMs` usa `computed()` en vez de simplemente calcular el valor una vez en el constructor.
4. Escribe de memoria (sin mirar) un componente que consulte `prefers-reduced-motion` y ajuste una duración de animación, con un test para ambas preferencias. Compara después contra el patrón del Paso 4.

**Pista:** exponer un método de test explícito (`establecerPreferenciaParaTest`) para simular una preferencia del sistema operativo es más confiable en CI que intentar mockear `window.matchMedia` globalmente, que puede comportarse de forma distinta según el entorno de ejecución del test runner.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con la media query estándar que consulta la preferencia de movimiento reducido del sistema operativo:

```ts
window.matchMedia('____').matches
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un componente con una duración de animación condicional según `prefers-reduced-motion`, y un test para ambos casos. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas con un test real que una animación respeta la preferencia de movimiento reducido del usuario, en vez de asumir que decorar la interfaz es inofensivo para todos. El siguiente tema transfiere datos ya obtenidos en el servidor hacia el cliente sin repetir peticiones HTTP. Fuentes oficiales: [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

**Errores comunes:** implementar animaciones sin consultar nunca `prefers-reduced-motion`; consultar la preferencia una sola vez en el constructor en vez de reactivamente, perdiendo cambios en tiempo real.

**Cuándo no usarlo:** para transiciones de opacidad extremadamente sutiles y breves (menos de 100ms) sin movimiento real perceptible, la distinción de `prefers-reduced-motion` aporta un beneficio marginal frente a la complejidad de implementarla.

**Transferencia al proyecto integrador «Centro de control logístico»:** Anima la apertura del detalle manteniendo el foco en un control útil. Con movimiento reducido, comprueba que la información y las acciones permanecen disponibles sin esperar una transición.

### Tema 4: SSR y TransferState · Avanzado · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con un test real de `TransferState`, que un dato calculado "en el servidor" se transfiere al cliente sin que este necesite repetir la petición HTTP original.

**Conocimiento previo:** Módulo 7 de este track (HttpClient).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En Server-Side Rendering, el servidor ya ejecutó una petición HTTP para renderizar el HTML inicial; sin `TransferState`, el cliente ignoraría ese trabajo ya hecho y repetiría la MISMA petición HTTP al hidratarse, desperdiciando una llamada de red completamente evitable.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `TransferState`, `makeStateKey`, `set`/`get`/`hasKey`.

`TransferState` es un mecanismo REAL de Angular para serializar datos obtenidos durante el renderizado del servidor y embeberlos en el HTML enviado al cliente; al hidratarse, el cliente lee esos datos con la MISMA clave (`StateKey`) en vez de volver a pedirlos por HTTP. `makeStateKey<T>('nombre')` crea una clave tipada compartida entre servidor y cliente.

**Analogía:** `TransferState` es como un mensajero que ya trajo el paquete a la puerta del cliente junto con la primera entrega, en vez de que el cliente tenga que pedir el mismo paquete otra vez apenas abre la puerta.

**Diagrama:**

```mermaid
sequenceDiagram
  participant SV as Servidor (SSR)
  participant HTML as HTML enviado
  participant CL as Cliente (hidratación)
  SV->>SV: fetch entregas + state.set(KEY, datos)
  SV->>HTML: embebe datos serializados
  HTML->>CL: cliente lee state.get(KEY, default)
  CL->>CL: NO repite la petición HTTP
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `demo-testbed` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía y genera un proyecto nuevo con `npx -y @angular/cli@22 new demo-ssr --standalone --skip-git --defaults` y luego `cd demo-ssr`), crea `src/app/entregas-transfer-state.spec.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/entregas-transfer-state.spec.ts
import { TestBed } from '@angular/core/testing';
import { TransferState, makeStateKey } from '@angular/core';

const ENTREGAS_KEY = makeStateKey<string[]>('entregas-pendientes');

describe('TransferState evita repetir la peticion HTTP original', () => {
  it('el cliente lee el valor transferido por el servidor sin pedirlo de nuevo', () => {
    TestBed.configureTestingModule({ providers: [TransferState] });
    const state = TestBed.inject(TransferState);

    // simula lo que el servidor habria hecho: guardar el resultado de una peticion HTTP real
    state.set(ENTREGAS_KEY, ['PED-001', 'PED-002']);

    // simula la lectura del cliente al hidratarse: NO hay ninguna llamada HTTP aqui
    const entregasRecibidas = state.get(ENTREGAS_KEY, [] as string[]);

    expect(entregasRecibidas).toEqual(['PED-001', 'PED-002']);
    expect(state.hasKey(ENTREGAS_KEY)).toBe(true);
  });

  it('si la clave nunca fue transferida, get devuelve el valor por defecto explicito', () => {
    TestBed.configureTestingModule({ providers: [TransferState] });
    const state = TestBed.inject(TransferState);

    const CLAVE_INEXISTENTE = makeStateKey<string[]>('nunca-transferida');
    const resultado = state.get(CLAVE_INEXISTENTE, ['valor-por-defecto']);

    expect(resultado).toEqual(['valor-por-defecto']); // el default explicito, no un error ni undefined
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan: el primero confirma que un valor establecido con `state.set(...)` (simulando el trabajo real del servidor) se lee correctamente con `state.get(...)` en el "cliente", sin ninguna petición HTTP de por medio; el segundo confirma que consultar una clave nunca transferida devuelve el valor por defecto explícito pasado como segundo argumento, no un error.

**Fallo deliberado:** cambia la clave usada en `state.get(...)` de `ENTREGAS_KEY` a la `CLAVE_INEXISTENTE` del segundo test (un desajuste de clave entre lo que el servidor guardó y lo que el cliente intenta leer) y ejecuta de nuevo el primer test. El resultado ya NO es `['PED-001', 'PED-002']` sino el valor por defecto vacío `[]` — diagnostica confirmando que `TransferState` depende estrictamente de que servidor y cliente usen exactamente la MISMA `StateKey` (típicamente definida una sola vez en un archivo compartido, nunca duplicada con nombres distintos en cada lado). Restaura la clave correcta antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un tercer test que confirme que `state.remove(KEY)` (si existe en la versión de Angular usada) o simplemente no llamar a `set` produce el mismo comportamiento que la clave nunca transferida.
2. Documenta, en un comentario, por qué `TransferState` solo tiene sentido en el contexto de SSR: en una aplicación puramente cliente (SPA sin servidor de renderizado), no hay ningún trabajo previo del servidor que transferir.
3. Escribe un test que confirme que transferir un objeto anidado complejo (no solo un array de strings) también se serializa y lee correctamente.
4. Escribe de memoria (sin mirar) una `StateKey` compartida, un `set` simulando el servidor, y un `get` simulando el cliente, con un test que confirme el valor transferido. Compara después contra el patrón del Paso 4.

**Pista:** `makeStateKey<T>('nombre')` debe definirse en un ÚNICO lugar compartido entre el código que corre en el servidor y el que corre en el cliente (típicamente un archivo de constantes), nunca redefinida por separado en cada lado con el mismo string pero como una instancia distinta — aunque el string sea igual, usar la misma constante evita errores de tipeo.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método de `TransferState` que lee un valor transferido, con un valor por defecto explícito:

```ts
const entregas = state.____(ENTREGAS_KEY, [] as string[]);
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una `StateKey` compartida y un test que confirme que un valor transferido por el servidor se lee correctamente en el cliente sin repetir la petición. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas con `TransferState` real que un dato obtenido durante el renderizado del servidor se transfiere al cliente sin repetir la petición HTTP original. Con esto cierras el módulo. Para proteger código que solo existe en el navegador durante el render del servidor, repasa `isPlatformBrowser` en el Módulo 11, Tema 2. Fuentes oficiales: [Angular — TransferState](https://angular.dev/api/core/TransferState).

**Errores comunes:** definir la `StateKey` por separado en el código de servidor y de cliente con el mismo nombre pero como instancias distintas; olvidar el valor por defecto explícito en `get(...)`, tratando el resultado como si siempre existiera.

**Cuándo no usarlo:** para una aplicación sin SSR (una SPA pura), `TransferState` no tiene ningún trabajo de servidor que transferir y agregar esta dependencia no aporta ningún valor.

**Transferencia al proyecto integrador «Centro de control logístico»:** Transfiere al cliente los datos públicos usados para el primer render. Cuenta las consultas de seguimiento en servidor y navegador: hidratar no debe repetir la petición ni transferir tokens de sesión.

