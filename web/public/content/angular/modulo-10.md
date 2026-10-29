# Módulo 10: Testing en Angular


## Aprende construyendo

### Tema 1: TestBed y componentes standalone

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `TestBed` real, que `fixture.componentRef.setInput(...)` es la única forma soportada de asignar un `input()` signal desde una prueba, reproduciendo el error real que ocurre al intentar el atajo incorrecto.

**Conocimiento previo:** Módulo 1 de este track (`input()` signal).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un `input()` signal es de solo lectura desde la perspectiva del propio componente; confirmar con una prueba real que intentar asignarlo directamente (en vez de usar `setInput`) falla de una forma real y diagnosticable evita que un desarrollador pierda tiempo con un atajo que Angular simplemente no soporta.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `TestBed.configureTestingModule`, `createComponent`, `componentRef.setInput`.

`TestBed` es el entorno de pruebas de Angular que permite crear una instancia real y renderizada de un componente dentro de un entorno controlado y aislado para pruebas, sin necesidad de arrancar la aplicación completa. `TestBed.configureTestingModule({ imports: [Tarjeta] })` declara qué componente (u otras dependencias) estarán disponibles en ese entorno de prueba específico; al tratarse de un componente standalone (Módulo 0), simplemente se importa directamente, sin necesidad de declarar un `NgModule` de pruebas dedicado como se requería en versiones anteriores de Angular.

`TestBed.createComponent(Tarjeta)` instancia realmente el componente dentro del entorno de prueba, devolviendo un `fixture` que da acceso tanto a la instancia del componente como a su elemento DOM real renderizado (`fixture.nativeElement`), permitiendo verificar tanto el estado interno del componente como lo que efectivamente se renderiza visualmente en el DOM, siendo esta verificación del DOM renderizado generalmente preferible a inspeccionar directamente propiedades internas del componente, dado que refleja más fielmente lo que un usuario real experimentaría.

`fixture.componentRef.setInput('titulo', 'Hola')` es la forma correcta y soportada de asignar un valor a un `input()` signal (Módulo 1) desde una prueba: dado que los inputs signal son de solo lectura desde la perspectiva del propio componente, no pueden asignarse directamente como una propiedad normal del componente; `setInput` pasa por el mecanismo interno correcto que Angular usa en producción para propagar valores de binding hacia inputs, siendo necesario además llamar `await fixture.whenStable()` después, para esperar a que la detección de cambios y cualquier efecto asociado (Módulo 2) se hayan estabilizado antes de hacer las aserciones.

**Analogía:** `TestBed` es como un laboratorio controlado donde se puede montar una réplica exacta de un componente para experimentar con él de forma aislada, sin afectar ni depender del resto de la aplicación; `setInput` es como ajustar un dial de entrada del experimento exactamente de la misma forma en que se ajustaría en el mundo real, en vez de forzar internamente un valor que el experimento nunca aceptaría normalmente.

**Diagrama — setInput respeta el mecanismo real de binding:**

```
┌──────────────┐   setInput('titulo','Hola')   ┌──────────────────┐
│ fixture         │ ──────────────────────────────▶│ componentRef       │
│ (entorno de test)│                                │ (mismo mecanismo   │
└──────────────┘                                │  que un binding    │
                                                  │  real en produccion)│
                                                  └──────────────────┘
```

**¿Por qué es importante?** `setInput` respeta el mecanismo real de propagación de inputs signal que Angular usa en producción, haciendo que la prueba verifique el comportamiento genuino del componente en vez de un atajo que podría no reflejar el comportamiento real.

**Código del ejemplo:**

```ts
describe('Tarjeta', () => {
  it('muestra el título', async () => {
    await TestBed.configureTestingModule({ imports: [Tarjeta] }).compileComponents();
    const fixture = TestBed.createComponent(Tarjeta);
    fixture.componentRef.setInput('titulo', 'Hola');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Hola');
  });
});
```

#### Paso 4 · Demostración guiada desde cero

Parte de una carpeta vacía (o continúa en `demo-comparacion` del Módulo 9):

```bash
npx -y @angular/cli@22 new demo-testbed --standalone --skip-git --defaults
mkdir -p src/app
```

Crea `src/app/tarjeta.ts`:

```ts
// src/app/tarjeta.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  template: `<h2>{{ titulo() }}</h2>`,
})
export class Tarjeta {
  titulo = input.required<string>();
}
```

Confirma con `TestBed` real tanto el uso correcto (`setInput`) como el error real que produce el atajo incorrecto:

```ts
// src/app/tarjeta.spec.ts
import { TestBed } from '@angular/core/testing';
import { Tarjeta } from './tarjeta';

describe('setInput es la unica forma soportada de asignar un input signal en un test', () => {
  it('setInput propaga el valor y se refleja en el DOM renderizado', async () => {
    await TestBed.configureTestingModule({ imports: [Tarjeta] }).compileComponents();
    const fixture = TestBed.createComponent(Tarjeta);
    fixture.componentRef.setInput('titulo', 'Hola mundo');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Hola mundo');
  });

  it('intentar llamar .set() directamente sobre el input signal falla en tiempo de ejecucion', async () => {
    await TestBed.configureTestingModule({ imports: [Tarjeta] }).compileComponents();
    const fixture = TestBed.createComponent(Tarjeta);
    fixture.componentRef.setInput('titulo', 'Valor inicial');
    await fixture.whenStable();

    expect(() => {
      (fixture.componentInstance.titulo as any).set('Intento invalido');
    }).toThrow();
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; el segundo confirma con `expect(...).toThrow()` que un `input()` signal NO expone `.set()` (a diferencia de un `signal()` normal del Módulo 2), porque es un `InputSignal` de solo lectura, no un `WritableSignal` — la razón real, verificada en código, de por qué `setInput` es indispensable.

**Fallo deliberado:** quita el `await fixture.whenStable();` inmediatamente después de `fixture.componentRef.setInput('titulo', 'Hola mundo');` en el primer test, y ejecuta de nuevo. El test se vuelve intermitente/falla dependiendo del entorno porque la aserción sobre `fixture.nativeElement.textContent` puede ejecutarse ANTES de que Angular complete la detección de cambios que actualiza el DOM tras `setInput` — diagnosticando por qué la teoría insiste en `whenStable()` como paso obligatorio, no opcional. Restaura el `await` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo input opcional (`subtitulo = input<string>('')`) y confirma con un test que su valor por defecto se usa cuando `setInput` no lo asigna explícitamente.
2. Escribe un test que confirme que `setInput` con un valor DISTINTO en una segunda llamada actualiza correctamente el DOM (no solo la primera vez).
3. Documenta, en un comentario, la diferencia real entre un `WritableSignal` (Módulo 2, con `.set()`/`.update()`) y un `InputSignal` (Módulo 1, sin ellos) — ambos son signals legibles de la misma forma (`titulo()`), pero solo uno es escribible directamente.
4. Escribe de memoria (sin mirar) un componente con `input.required()` y un test que use `setInput` + `whenStable()` correctamente. Compara después contra el patrón del Paso 4.

**Pista:** si una prueba de un componente con inputs signal falla de forma intermitente (a veces pasa, a veces no), la primera sospecha debe ser un `await fixture.whenStable()` faltante después de `setInput`, no un bug en el componente mismo.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real de `componentRef` que asigna un valor a un `input()` signal desde un test:

```ts
fixture.componentRef.____('titulo', 'Hola mundo');
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un componente con `input.required()` y un test que confirme tanto el uso correcto de `setInput` como el error real de intentar `.set()` directamente. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con `TestBed` real, que `setInput` es la única forma soportada de asignar un `input()` signal desde una prueba, y reproduces el error real de intentar el atajo incorrecto. El siguiente tema confirma con Angular Testing Library que consultar el DOM por rol/texto (en vez de por selector CSS interno) hace que una prueba sobreviva a un refactor puramente cosmético. **Evidencia:** entrega el resultado de ambos tests en verde, y el mensaje del error real que produce `.set()` sobre un `InputSignal`. Fuentes oficiales: [Angular — Testing components](https://angular.dev/guide/testing/components-scenarios).

**Errores comunes:** asignar un input signal como propiedad directa en vez de usar `setInput`; olvidar `await fixture.whenStable()` tras `setInput`, produciendo aserciones que se ejecutan antes de que la vista termine de actualizarse.

**Cuándo no usarlo:** para un componente sin ningún input (o con solo `@Output`/eventos), no hay ningún valor de input que propagar — `TestBed.createComponent` sin `setInput` es suficiente.

**Transferencia al proyecto integrador «Centro de control logístico»:** Monta el formulario de asignación con sus imports standalone y dependencias falsas. Verifica que un conductor inválido impide enviar la solicitud y que un caso válido emite el identificador esperado.

### Tema 2: Angular Testing Library

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con dos pruebas equivalentes (una por selector CSS interno y otra por rol/texto), que solo la prueba orientada al usuario sobrevive a un refactor puramente cosmético del componente — la garantía concreta que justifica preferir Angular Testing Library.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Renombrar una clase CSS por razones puramente visuales (sin cambiar ningún comportamiento) no debería romper ninguna prueba; confirmar con un experimento real (dos pruebas del mismo componente, un refactor cosmético real aplicado) cuál sobrevive y cuál no es la evidencia concreta, no solo la afirmación teórica.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** consultas orientadas al usuario, `render`, `screen`, `userEvent`.

Angular Testing Library es una capa sobre `TestBed` que promueve un estilo de prueba centrado deliberadamente en cómo un usuario real interactúa con la interfaz, en vez de en detalles internos de implementación: en lugar de acceder a elementos del DOM mediante selectores CSS internos (`fixture.nativeElement.querySelector('.boton-interno')`, que se rompe si el nombre de una clase CSS cambia por razones puramente visuales sin afectar el comportamiento real), se consulta el DOM por texto visible o por rol semántico de accesibilidad (`screen.getByRole('button', { name: /ver más/i })`), exactamente la misma información que un usuario (o una tecnología asistiva como un lector de pantalla) usaría para identificar ese elemento.

`render(Tarjeta, { inputs: { titulo: 'Hola' }, on: { seleccionar } })` renderiza el componente pasando directamente los valores de inputs y los manejadores de outputs (Módulo 1) como opciones declarativas, evitando gran parte de la ceremonia manual de `TestBed.configureTestingModule`/`createComponent`/`setInput` del Tema 1 para el caso común de simplemente montar un componente con ciertos valores iniciales. `userEvent.click(screen.getByRole('button', {...}))` simula una interacción de usuario real (incluyendo los eventos intermedios que un clic real dispara en un navegador, no solo el evento `click` final), disparando después la aserción sobre el manejador de output esperado (`expect(seleccionar).toHaveBeenCalled()`).

Este enfoque produce pruebas que sobreviven refactors internos de implementación (cambiar la estructura interna del HTML, renombrar clases CSS, reorganizar el árbol de componentes internos) siempre que el comportamiento observable desde la perspectiva del usuario permanezca igual, a diferencia de pruebas acopladas a selectores CSS internos, que se rompen ante cualquier cambio puramente cosmético sin relación real con el comportamiento probado.

**Analogía:** probar por selector CSS interno es como verificar que un cajero automático funciona revisando el color exacto de un cable interno específico; probar con Testing Library es como verificar que, al presionar el botón correcto en la pantalla (lo que cualquier usuario real haría), el dinero efectivamente sale — sin que importe qué cable interno específico haya cambiado de color entretanto.

**Diagrama — qué sobrevive a un refactor cosmético:**

```
┌───────────────────────────┐   renombrar .boton-interno   ┌────────┐
│ query por selector CSS       │ ─────────────────────────────▶│ ROTA    │
└───────────────────────────┘                                └────────┘
┌───────────────────────────┐   renombrar .boton-interno   ┌────────┐
│ query por rol/texto          │ ─────────────────────────────▶│ SIGUE   │
│ (screen.getByRole)           │                                │ PASANDO │
└───────────────────────────┘                                └────────┘
```

**¿Por qué es importante?** Consultar el DOM como lo haría un usuario real (por texto, por rol) hace que las pruebas sobrevivan a refactors internos de implementación que no cambian el comportamiento observable de la aplicación.

**Código del ejemplo:**

```ts
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

it('emite el evento al hacer click', async () => {
  const seleccionar = vi.fn();
  await render(Tarjeta, { inputs: { titulo: 'Hola' }, on: { seleccionar } });
  await userEvent.click(screen.getByRole('button', { name: /ver más/i }));
  expect(seleccionar).toHaveBeenCalled();
});
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-testing-library --standalone --skip-git --defaults`):

```bash
npm install @testing-library/angular @testing-library/user-event --save-dev
mkdir -p src/app
```

Crea `src/app/boton-entrega.ts` con un botón cuyo `class` interno cambiará durante el experimento:

```ts
// src/app/boton-entrega.ts
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-boton-entrega',
  standalone: true,
  template: `<button class="boton-interno-v1" (click)="confirmar.emit()">Confirmar entrega</button>`,
})
export class BotonEntrega {
  confirmar = output<void>();
}
```

Escribe DOS pruebas del mismo comportamiento: una acoplada al selector CSS interno, otra orientada al usuario:

```ts
// src/app/boton-entrega.spec.ts
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BotonEntrega } from './boton-entrega';

describe('prueba acoplada a selector CSS interno (fragil)', () => {
  it('encuentra el boton por su clase CSS interna', async () => {
    await TestBed.configureTestingModule({ imports: [BotonEntrega] }).compileComponents();
    const fixture = TestBed.createComponent(BotonEntrega);
    fixture.detectChanges();
    const boton = fixture.nativeElement.querySelector('.boton-interno-v1');

    expect(boton).not.toBeNull();
  });
});

describe('prueba orientada al usuario con Testing Library (robusta)', () => {
  it('encuentra el boton por su rol y texto visible, sin importar su clase CSS', async () => {
    const confirmar = vi.fn();
    await render(BotonEntrega, { on: { confirmar } });

    await userEvent.click(screen.getByRole('button', { name: /confirmar entrega/i }));

    expect(confirmar).toHaveBeenCalled();
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan inicialmente.

**Fallo deliberado:** aplica un refactor puramente cosmético al componente: cambia `class="boton-interno-v1"` por `class="boton-interno-v2"` en `boton-entrega.ts` (sin cambiar ningún comportamiento real) y ejecuta de nuevo ambos tests. El primero (`.querySelector('.boton-interno-v1')`) FALLA con `boton` como `null` — se rompió por un cambio que no afectó el comportamiento real. El segundo (`screen.getByRole('button', {...})`) SIGUE PASANDO sin ninguna modificación — confirmando en código, no solo en teoría, exactamente la garantía que Angular Testing Library promete. Restaura la clase original o actualiza el primer test antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Repite el experimento pero esta vez cambiando el TEXTO visible del botón (de "Confirmar entrega" a "Confirmar pedido") — esta vez la prueba orientada al usuario SÍ debería fallar, porque el texto es parte del comportamiento observable real, no un detalle cosmético interno.
2. Documenta, en un comentario, la diferencia entre un cambio "puramente cosmético" (nombre de clase CSS) y un cambio "de comportamiento observable" (texto visible al usuario) — y por qué Testing Library debería reaccionar solo al segundo.
3. Agrega una prueba con `screen.getByLabelText(...)` para un campo de formulario, y documenta por qué esa consulta también es accesible para un lector de pantalla, no solo conveniente para el test.
4. Escribe de memoria (sin mirar) un componente y dos pruebas equivalentes (una por selector CSS, otra por rol/texto) que demuestren la diferencia de robustez ante un refactor cosmético. Compara después contra el patrón del Paso 4.

**Pista:** el experimento del Paso 4 es la forma más convincente de enseñar por qué Testing Library existe — no te limites a explicarlo, reprodúcelo cada vez que quieras confirmar (o recordar) la diferencia real.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con la función real de `@testing-library/angular` que consulta el DOM renderizado por rol semántico de accesibilidad:

```ts
const boton = screen.____('button', { name: /confirmar entrega/i });
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, dos pruebas equivalentes del mismo componente (una por selector CSS interno, otra con `screen.getByRole`) y documenta cuál sobrevive a un refactor cosmético. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con un refactor cosmético real aplicado a un componente, que una prueba por selector CSS interno se rompe mientras una prueba orientada al usuario (por rol/texto) sigue pasando. El siguiente y último tema confirma con `HttpTestingController` cómo aislar completamente una prueba de un backend real, incluyendo el caso de error. **Evidencia:** entrega el resultado de ambas pruebas antes y después del refactor cosmético. Fuentes oficiales: [Testing Library — Angular](https://testing-library.com/docs/angular-testing-library/intro/).

**Errores comunes:** consultar por selector CSS interno cuando una consulta por rol/texto cubriría el mismo caso con mayor robustez; usar `getByTestId` como primera opción en vez de como último recurso (la documentación oficial de Testing Library recomienda preferir siempre consultas por rol, texto o label antes que un atributo `data-testid` artificial).

**Cuándo no usarlo:** para verificar un detalle de implementación interno que SÍ importa probar directamente (como confirmar que un signal interno específico cambió de valor, sin ninguna manifestación visible en el DOM), acceder directamente a `fixture.componentInstance` (Tema 1) sigue siendo apropiado — Testing Library está diseñada para comportamiento observable, no para reemplazar todo acceso a la instancia del componente.

**Transferencia al proyecto integrador «Centro de control logístico»:** Prueba asignar una entrega mediante etiquetas y botones visibles. Cambia la estructura interna del componente: la prueba debe seguir pasando mientras el operador pueda completar la tarea.

### Tema 3: Mockear HttpClient y el nuevo builder basado en Vitest

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `HttpTestingController` real, tanto una respuesta exitosa como un error 500 simulados, verificando en código que un servicio maneja ambos casos sin ninguna dependencia de un backend real.

**Conocimiento previo:** Módulo 7 de este track (`HttpTestingController`); Temas 1-2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Probar cómo una aplicación maneja un error 500 real del servidor sin poder forzar deliberadamente ese error en un backend real de producción es prácticamente imposible; `HttpTestingController` permite simular ese error exacto de forma determinista y repetible en cada ejecución de la suite de pruebas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `HttpTestingController`, aislamiento de pruebas del backend real, migración de Karma a Vitest.

`HttpTestingController` es el mecanismo de Angular para interceptar peticiones HTTP realizadas durante una prueba sin que lleguen a un servidor real: `httpMock.expectOne('/api/usuarios')` verifica que exactamente una petición a esa URL fue realizada por el código bajo prueba, devolviendo un objeto `req` sobre el que se puede llamar `req.flush([{ id: 1, nombre: 'Ana' }])` para simular la respuesta exacta del servidor que la prueba necesita, permitiendo probar cómo el servicio o componente maneja esa respuesta específica (incluyendo casos de error simulados con `req.flush(null, { status: 500, statusText: 'Error' })`) sin ninguna dependencia de un backend real disponible ni de datos reales impredecibles.

Históricamente, las pruebas de Angular se ejecutaban con Karma (un ejecutor de pruebas que abre un navegador real, típicamente Chrome, para ejecutar las pruebas dentro de él) combinado con Jasmine como framework de aserciones; el nuevo builder de pruebas de Angular (`@angular/build:unit-test`) reemplaza esta combinación usando Vitest por debajo, un ejecutor de pruebas considerablemente más rápido para arrancar y para el modo watch de desarrollo (re-ejecutar automáticamente solo las pruebas afectadas por un cambio de archivo), dado que Vitest puede ejecutar pruebas en un entorno simulado de DOM sin necesidad de abrir un navegador real completo para cada ejecución, aunque sigue siendo posible ejecutar contra un navegador real cuando es necesario verificar comportamiento específico de un motor de renderizado particular.

**Analogía:** `HttpTestingController` es como un actor que se hace pasar por el servidor real durante un ensayo teatral, respondiendo exactamente las líneas que el guion de la prueba requiere, sin necesidad de que el servidor real (y todos sus datos reales impredecibles) esté presente en el ensayo; migrar de Karma a Vitest es como reemplazar un ensayo que requiere montar el escenario físico completo cada vez por uno que puede simularse rápidamente en una sala más simple, llegando al mismo resultado con mucha menor fricción de configuración.

**¿Por qué es importante?** `HttpTestingController` aísla completamente las pruebas de un backend real, haciendo que sean deterministas y ejecutables sin red; el builder basado en Vitest reduce significativamente el tiempo de arranque y de iteración durante el desarrollo con pruebas.

**Diagrama — dos escenarios simulados con la misma peticion:**

```
servicio.cargarUsuarios()
        │
        ▼
┌──────────────────┐
│ HttpTestingController│
└──────────────────┘
   │ flush([...])         │ flush(null, {status:500})
   ▼                       ▼
┌───────────┐        ┌────────────┐
│ caso exito  │        │ caso error  │
└───────────┘        └────────────┘
```

**Código del ejemplo:**

```ts
const httpMock = TestBed.inject(HttpTestingController);
servicio.cargarUsuarios().subscribe();
const req = httpMock.expectOne('/api/usuarios');
req.flush([{ id: 1, nombre: 'Ana' }]);
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-http-testing --standalone --skip-git --defaults`), crea `src/app/usuarios-error.service.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/usuarios-error.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosErrorService {
  private http = inject(HttpClient);

  cargarUsuarios() {
    return this.http.get<Usuario[]>('/api/usuarios').pipe(
      map((usuarios) => ({ ok: true as const, usuarios })),
      catchError(() => of({ ok: false as const, usuarios: [] as Usuario[] }))
    );
  }
}
```

Confirma con `HttpTestingController` real AMBOS casos: la respuesta exitosa y el error simulado:

```ts
// src/app/usuarios-error.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuariosErrorService } from './usuarios-error.service';

describe('UsuariosErrorService maneja exito y error 500 sin backend real', () => {
  let controlador: HttpTestingController;
  let servicio: UsuariosErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    controlador = TestBed.inject(HttpTestingController);
    servicio = TestBed.inject(UsuariosErrorService);
  });

  afterEach(() => controlador.verify());

  it('con respuesta exitosa, devuelve ok:true con los usuarios', () => {
    let resultado: any;
    servicio.cargarUsuarios().subscribe((r) => (resultado = r));

    controlador.expectOne('/api/usuarios').flush([{ id: 1, nombre: 'Ana' }]);

    expect(resultado).toEqual({ ok: true, usuarios: [{ id: 1, nombre: 'Ana' }] });
  });

  it('con un error 500 simulado, devuelve ok:false sin lanzar una excepcion sin manejar', () => {
    let resultado: any;
    servicio.cargarUsuarios().subscribe((r) => (resultado = r));

    controlador.expectOne('/api/usuarios').flush(null, { status: 500, statusText: 'Server Error' });

    expect(resultado).toEqual({ ok: false, usuarios: [] });
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; el segundo confirma con `flush(null, { status: 500, statusText: 'Server Error' })` que `HttpTestingController` puede simular un error real del servidor SIN necesitar que ningún backend real esté caído o mal configurado — el escenario de error se reproduce de forma completamente determinista en cada ejecución.

**Fallo deliberado:** quita el operador `catchError(...)` del pipe en `cargarUsuarios()`, dejando solo `map(...)`, y ejecuta de nuevo el segundo test. FALLA porque el Observable ahora se rechaza (error no manejado) en vez de emitir `{ ok: false, usuarios: [] }` — el test nunca recibe un valor en `resultado`, reproduciendo en código exactamente el bug que ocurriría en producción si un componente real no maneja el error de una petición fallida. Restaura `catchError(...)` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un tercer test que simule un error 404 (`flush(null, { status: 404, statusText: 'Not Found' })`) y confirma si el servicio actual lo distingue de un 500 o los trata igual (documenta la decisión).
2. Investiga (leyendo el README del repositorio) qué comando ejecuta el nuevo builder basado en Vitest, y documenta en un comentario la diferencia de tiempo de arranque frente al builder anterior basado en Karma, si puedes medirla localmente.
3. Escribe un test que confirme que `controlador.verify()` en `afterEach` detectaría una petición extra no esperada si el servicio, por error, hiciera una segunda llamada HTTP no anticipada.
4. Escribe de memoria (sin mirar) un servicio con manejo de error vía `catchError`, y dos tests con `HttpTestingController` que confirmen el caso exitoso y el caso de error. Compara después contra el patrón del Paso 4.

**Pista:** `flush(null, { status: N, statusText: '...' })` es la forma de simular CUALQUIER código de error HTTP (401, 404, 500, 503) sin necesitar que un servidor real produzca ese error específico bajo demanda — úsalo para cubrir cada código de error que tu código realmente maneja de forma distinta.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el operador real de RxJS que captura un error del Observable y permite devolver un valor de reemplazo en vez de propagar el rechazo:

```ts
this.http.get<Usuario[]>('/api/usuarios').pipe(
  map((usuarios) => ({ ok: true as const, usuarios })),
  ____(() => of({ ok: false as const, usuarios: [] }))
);
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un servicio con manejo de error vía `catchError` y dos tests con `HttpTestingController` que confirmen ambos casos. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con `HttpTestingController` real, tanto una respuesta exitosa como un error 500 simulado, sin ninguna dependencia de un backend real. Con esto cierras el módulo de testing y el track completo de Angular: pruebas con `TestBed` respetando el mecanismo real de inputs (Tema 1), pruebas orientadas al usuario que sobreviven a refactors cosméticos (Tema 2), y aislamiento completo del backend con casos de éxito y error cubiertos (Tema 3); el siguiente paso natural es aplicar esta misma disciplina de pruebas a un proyecto propio de principio a fin. **Evidencia:** entrega el resultado de ambos tests en verde, y el resultado del fallo deliberado (Observable rechazado sin manejar). Fuentes oficiales: [Angular — HTTP testing](https://angular.dev/guide/http/testing).

**Errores comunes:** probar solo el camino feliz (respuesta exitosa) sin simular nunca un error real del servidor; olvidar `controlador.verify()` en `afterEach`, dejando pasar peticiones no esperadas sin que ningún test las detecte.

**Transferencia al proyecto integrador «Centro de control logístico»:** Prueba el servicio que consulta el estado de una entrega contra `HttpTestingController`, simulando tanto una respuesta exitosa como un 500 real del backend de RutaFlow. El operador debe ver un mensaje explícito de error, nunca una pantalla en blanco sin explicación.

**Cuándo no usarlo:** para verificar el comportamiento end-to-end real de la aplicación completa contra un backend genuino (incluyendo configuración de red, CORS, certificados reales), un test end-to-end con Playwright es más apropiado que `HttpTestingController`, que deliberadamente nunca toca la red real.

---


### Tema 4: Angular Material y CDK: componentes accesibles probados con harnesses

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir una tabla con Angular Material, anunciar cambios a lectores de pantalla con el CDK y probar el componente con *component harnesses* en lugar de selectores de CSS. Prerrequisitos: Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real
El tablero de envíos del centro de control se construyó con HTML propio: cada pantalla tenía tablas distintas, sin soporte de teclado ni anuncios para lectores de pantalla, y las pruebas se rompían con cada cambio de clase CSS. Es el caso real que resuelve una librería de componentes como Angular Material, que casi todo proyecto Angular empresarial usa.

#### Paso 3 · Teoría, modelo mental y analogía
**Angular Material** ofrece componentes que siguen Material Design y las pautas de accesibilidad (roles ARIA, foco, teclado). Debajo está el **CDK** (Component Dev Kit): utilidades sin estilo como `LiveAnnouncer` (anuncia texto a lectores de pantalla), `FocusTrap` u *overlays*, que sirven aunque uses otro diseño. Los **harnesses** (`MatTableHarness`, `MatButtonHarness`) son APIs de prueba que interactúan con el componente como lo haría una persona, sin depender de su HTML interno.

**Analogía:** Material es una cocina modular que ya viene con enchufes e instalaciones en regla; el harness es el inspector que prueba que los interruptores funcionan sin abrir las paredes.

**Diagrama:**

```mermaid
flowchart LR
    T[Tablero] --> MT[mat-table]
    T --> MB[mat-flat-button]
    T --> LA[LiveAnnouncer del CDK]
    S[spec] --> H[harnesses]
    H --> MT
    H --> MB
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir angular-material && cd angular-material
npx -y @angular/cli@22 new tablero-material --defaults --skip-git --style=css --ssr=false
cd tablero-material
npm install @angular/material@22 @angular/cdk@22
```

Crea `src/app/tablero.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';

interface Envio { guia: string; barrio: string; estado: 'en ruta' | 'entregado'; }

@Component({
  selector: 'app-tablero',
  imports: [MatTableModule, MatButtonModule, MatChipsModule],
  template: `
    <h2 id="titulo">Envíos de hoy</h2>
    <mat-chip-set aria-label="Resumen">
      <mat-chip>{{ pendientes() }} en ruta</mat-chip>
    </mat-chip-set>

    <table mat-table [dataSource]="envios()" aria-labelledby="titulo">
      <ng-container matColumnDef="guia">
        <th mat-header-cell *matHeaderCellDef>Guía</th>
        <td mat-cell *matCellDef="let e">{{ e.guia }}</td>
      </ng-container>
      <ng-container matColumnDef="barrio">
        <th mat-header-cell *matHeaderCellDef>Barrio</th>
        <td mat-cell *matCellDef="let e">{{ e.barrio }}</td>
      </ng-container>
      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let e">{{ e.estado }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let fila; columns: columnas"></tr>
    </table>

    <button mat-flat-button (click)="entregarPrimero()" [disabled]="pendientes() === 0">
      Marcar primera entrega
    </button>
  `,
})
export class Tablero {
  private anunciador = inject(LiveAnnouncer);   // CDK: avisa a lectores de pantalla
  columnas = ['guia', 'barrio', 'estado'];
  envios = signal<Envio[]>([
    { guia: 'BO-1', barrio: 'Chapinero', estado: 'en ruta' },
    { guia: 'BO-2', barrio: 'Suba', estado: 'en ruta' },
    { guia: 'BO-3', barrio: 'Bosa', estado: 'entregado' },
  ]);
  pendientes = computed(() => this.envios().filter((e) => e.estado === 'en ruta').length);

  entregarPrimero() {
    const indice = this.envios().findIndex((e) => e.estado === 'en ruta');
    if (indice < 0) return;
    this.envios.update((lista) => lista.map((e, i) => (i === indice ? { ...e, estado: 'entregado' } : e)));
    this.anunciador.announce(`Envío ${this.envios()[indice].guia} entregado. Quedan ${this.pendientes()} en ruta`);
  }
}
```

Crea `src/app/tablero.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatChipHarness } from '@angular/material/chips/testing';
import { Tablero } from './tablero';

describe('Tablero con Angular Material', () => {
  it('marca entregas y deshabilita el botón al terminar', async () => {
    const fixture = TestBed.createComponent(Tablero);
    // Los harnesses prueban el componente como lo usa una persona, sin depender del HTML interno
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabla = await loader.getHarness(MatTableHarness);
    const boton = await loader.getHarness(MatButtonHarness.with({ text: /Marcar primera/ }));
    const chip = await loader.getHarness(MatChipHarness);

    expect((await tabla.getRows()).length).toBe(3);
    expect(await chip.getText()).toBe('2 en ruta');

    await boton.click();
    await boton.click();

    const estados = await tabla.getCellTextByColumnName();
    expect(estados['estado'].text).toEqual(['entregado', 'entregado', 'entregado']);
    expect(await chip.getText()).toBe('0 en ruta');
    expect(await boton.isDisabled()).toBe(true);
  });
});
```

**Ejecuta el ejemplo:**

```bash
rm src/app/app.spec.ts
npx ng test --watch=false
```

**Resultado esperado:**

```text
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

La prueba no usa ningún selector de CSS: lee filas, celdas, el chip y el estado del botón a través de los harnesses. Con `ng add @angular/material` también se configuran el tema y la tipografía; aquí se instala lo mínimo para que el ejemplo sea reproducible.

**Fallo deliberado:** Quita `MatTableModule` de los `imports` del componente. La compilación falla con `NG8002: Can't bind to 'dataSource' since it isn't a known property of 'table'.`: sin el módulo, Angular no sabe que `<table mat-table>` es un componente y trata `dataSource` como un atributo HTML desconocido.

#### Paso 5 · Práctica guiada
Agrega ordenamiento por barrio con `MatSortModule` y una prueba con `MatSortHarness` que verifique el orden. **Pista:** envuelve los datos en `MatTableDataSource`, conecta `dataSource.sort` con `viewChild(MatSort)` y agrega `mat-sort-header` a la columna.

#### Paso 6 · Práctica independiente
Activa un lector de pantalla (VoiceOver o NVDA), pulsa el botón y verifica que se lee el anuncio. Documenta qué pasaría sin `LiveAnnouncer`.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque usar bien una librería de componentes ahorra semanas de trabajo, mejora la accesibilidad y hace que las pruebas sobrevivan a los cambios visuales.
**Fuente oficial:** [Angular Material: Table](https://material.angular.dev/components/table/overview), [Angular CDK: Component Harnesses](https://material.angular.dev/cdk/test-harnesses/overview).
**Conceptos clave:** Angular Material, CDK, `LiveAnnouncer`, `mat-table`, component harness, `TestbedHarnessEnvironment`, accesibilidad.
**Cuándo no usarlo:** si el producto tiene un sistema de diseño propio muy distinto de Material, usa solo el CDK y tus estilos, en lugar de pelear con los estilos de Material.

**Transferencia al proyecto integrador «Centro de control logístico»:** reemplaza la tabla de envíos del centro de control por `mat-table` y cubre sus acciones con harnesses.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** probar un `mat-table` consultando clases CSS internas de Material en vez de un harness (`MatTableHarness`), lo que rompe la prueba en cada actualización de versión; omitir `LiveAnnouncer` al anunciar un cambio de estado y asumir que el rol ARIA del componente ya lo cubre.

## Laboratorio práctico

**Objetivo del laboratorio:** escribir una suite de pruebas completa para un componente con input signal y un servicio que consume HTTP.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Probar un componente con `TestBed` | Ver Tema 1 | Usa `setInput` para el input signal |
| 2 | Reescribir la misma prueba con Testing Library | Ver Tema 2 | Compara la legibilidad de ambos enfoques |
| 3 | Simular un clic con `userEvent` | Ver Tema 2 | Verifica que el output se emite correctamente |
| 4 | Mockear una petición HTTP | Ver Tema 3 | Usa `HttpTestingController` |
| 5 | Simular un error HTTP | `req.flush(null, {status: 500, ...})` | Verifica el manejo de errores del servicio |

**Verificación:** el laboratorio se considera exitoso si todas las pruebas pasan de forma determinista sin depender de un backend real, y si las pruebas escritas con Testing Library consultan el DOM por rol/texto en vez de por selectores CSS internos.

**Errores comunes y soluciones**

- **Asignar un input signal como propiedad directa en vez de usar `setInput`.** Los inputs signal son de solo lectura desde el componente; usa siempre `fixture.componentRef.setInput(...)`.
- **Olvidar `await fixture.whenStable()` tras `setInput`.** Sin esperar la estabilización, las aserciones pueden ejecutarse antes de que la vista se actualice.
- **Consultar por selector CSS interno en vez de por rol/texto.** Esto hace que la prueba se rompa ante refactors cosméticos sin relación con el comportamiento real.

---
