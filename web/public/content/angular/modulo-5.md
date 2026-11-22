# Módulo 5: Formularios reactivos y template-driven


## Aprende construyendo

### Tema 1: Reactive Forms — FormGroup y FormControl · Intermedio · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con un `FormGroup` real evaluado directamente en un test unitario (sin renderizar NINGÚN template HTML), que cada validador reporta su error específico exacto — la ventaja de testabilidad que la teoría de este tema describe, demostrada en código.

**Conocimiento previo:** Módulo 1 de este track (signals e inputs); ninguno de `@angular/forms` específicamente.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En un formulario real de registro de entrega, mostrar "el email no tiene un formato válido" en vez de un genérico "campo inválido" reduce directamente el tiempo que un usuario tarda en corregir su error; confirmar con una prueba real que cada validador reporta SU clave de error específica (no solo `invalid: true`) previene que esa especificidad se pierda accidentalmente en una refactorización futura.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** modelo de formulario explícito en TypeScript, validadores declarativos.

Reactive Forms modela la estructura completa de un formulario explícitamente en código TypeScript, mediante instancias de `FormGroup` (que agrupa múltiples controles relacionados) y `FormControl` (que representa un campo individual, con su valor actual y su estado de validación): `new FormGroup({nombre: new FormControl("", [Validators.required]), email: new FormControl("", [Validators.required, Validators.email])})` define un formulario con dos campos, cada uno con sus propios validadores declarados explícitamente como un array de funciones validadoras aplicadas en conjunto.

Esta definición explícita en TypeScript (en contraste con el enfoque template-driven del Tema 4, donde la estructura del formulario se infiere implícitamente a partir de directivas colocadas directamente en la plantilla HTML) es precisamente lo que hace a Reactive Forms más fácil de testear: el formulario completo, con su estado y sus validadores, existe como un objeto TypeScript normal, invocable y verificable directamente en una prueba unitaria sin necesidad de renderizar ningún template HTML real ni de simular interacción del usuario a través del DOM, exactamente el mismo tipo de ventaja de testabilidad que los guards funcionales del Módulo 4 obtienen por ser funciones simples en vez de clases con dependencias más complejas de simular.

El template HTML de un formulario reactivo simplemente enlaza cada elemento visual con su `FormControl` correspondiente mediante la directiva `[formControl]`, y consulta el estado de validación de ese control específico (`form.controls.email.errors?.["email"]`) para decidir qué mensaje de error mostrar, si acaso, según cuál validador específico falló exactamente. Mostrar mensajes de error específicos por tipo de validador fallido (en vez de un mensaje genérico único como "campo inválido") es una práctica de experiencia de usuario importante: un usuario que ve específicamente "el formato del email no es válido" puede corregir su error mucho más rápido que uno que solo ve "hay un error en este campo" sin ninguna indicación de cuál es el problema exacto.

**Analogía:** Reactive Forms es como diseñar el plano arquitectónico completo de un formulario antes de construirlo físicamente, especificando exactamente cada campo y cada regla de validación en un documento formal verificable independientemente de la construcción física real; template-driven forms es como construir directamente sobre la marcha, inferiendo la estructura a partir de las decisiones tomadas directamente en el sitio de construcción (la plantilla HTML), sin un plano formal separado y explícito previo.

**Diagrama — de FormGroup a mensaje específico:**

```
FormGroup { nombre, email }
        │
        ▼
┌─────────────────┐   errors?.['required']   ┌──────────────────────┐
│ email = ''       │ ─────────────────────────▶│ "El email es obligatorio" │
└─────────────────┘                            └──────────────────────┘
┌─────────────────┐   errors?.['email']       ┌──────────────────────┐
│ email = 'x'      │ ─────────────────────────▶│ "Formato de email inválido"│
└─────────────────┘                            └──────────────────────┘
```

**Código del ejemplo:**

```ts
form = new FormGroup({
  nombre: new FormControl('', [Validators.required]),
  email: new FormControl('', [Validators.required, Validators.email]),
});
```
```html
<input [formControl]="form.controls.email" />
@if (form.controls.email.errors?.['email']) {
  <span class="error">Email inválido</span>
}
```

#### Paso 4 · Demostración guiada desde cero

Parte de una carpeta vacía (o continúa en `demo-routing` del Módulo 4):

```bash
npx -y @angular/cli@22 new demo-forms --standalone --skip-git --defaults
cd demo-forms
mkdir -p src/app
```

Crea `src/app/delivery-form.model.ts`:

```ts
// src/app/delivery-form.model.ts
import { FormControl, FormGroup, Validators } from '@angular/forms';

export function crearFormularioEntrega() {
  return new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });
}
```

Confirma la ventaja de testabilidad DIRECTAMENTE: sin `TestBed`, sin `ComponentFixture`, sin ningún HTML renderizado:

```ts
// src/app/delivery-form.model.spec.ts
import { crearFormularioEntrega } from './delivery-form.model';

describe('FormGroup de entrega valida campos y reporta el error especifico', () => {
  it('con campos vacios, reporta "required" en ambos controles', () => {
    const form = crearFormularioEntrega();
    expect(form.valid).toBe(false);
    expect(form.controls.nombre.errors?.['required']).toBe(true);
    expect(form.controls.email.errors?.['required']).toBe(true);
  });

  it('con email mal formado, reporta "email" (no "required")', () => {
    const form = crearFormularioEntrega();
    form.controls.nombre.setValue('Ana');
    form.controls.email.setValue('no-es-un-email');
    expect(form.controls.email.errors?.['email']).toBe(true);
    expect(form.controls.email.errors?.['required']).toBeUndefined();
    expect(form.valid).toBe(false);
  });

  it('con todos los campos validos, el formulario completo es valido', () => {
    const form = crearFormularioEntrega();
    form.controls.nombre.setValue('Ana');
    form.controls.email.setValue('ana@example.com');
    expect(form.valid).toBe(true);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** los 3 tests pasan sin que el archivo `.spec.ts` importe `TestBed` ni renderice ningún elemento del DOM — el `FormGroup` es un objeto TypeScript normal, verificable directamente, la ventaja de testabilidad exacta que la teoría describe.

**Fallo deliberado:** quita `Validators.email` del array de validadores de `email`, dejando solo `Validators.required`, y ejecuta de nuevo el segundo test. FALLA porque `form.controls.email.errors?.['email']` ahora es `undefined` (el validador que lo produciría ya no está registrado) — diagnosticando que la especificidad del mensaje de error depende directamente de qué validadores están declarados, no de qué template los muestra. Restaura `Validators.email` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un tercer control (`telefono`) con `Validators.pattern(/^\d{9}$/)` y un test que confirme que reporta específicamente `errors?.['pattern']` con un valor mal formado.
2. Documenta, en un comentario, cuántas líneas de configuración (`TestBed`, fixture, `detectChanges`) evitaste al testear el `FormGroup` directamente en vez de a través del template.
3. Escribe un test que confirme que `form.valid` es `false` mientras CUALQUIER control individual sea inválido, incluso si los demás son válidos.
4. Escribe de memoria (sin mirar) un `FormGroup` con dos validadores en un control y un test que confirme el error específico de cada uno. Compara después contra el patrón del Paso 4.

**Pista:** un `FormGroup` es un objeto TypeScript normal — cualquier prueba que necesites escribir sobre su estado de validación puede (y debe) escribirse sin `TestBed`, reservando `TestBed` únicamente para verificar que el template está correctamente enlazado al formulario.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el validador real de Angular que verifica formato de email:

```ts
email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.____] })
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `FormGroup` con dos controles validados y un test directo (sin `TestBed`) que confirme el error específico de cada validador. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con un `FormGroup` evaluado directamente sin renderizar HTML, que cada validador reporta su clave de error específica. El siguiente tema confirma con el reloj simulado de Vitest (`vi.useFakeTimers()`) el estado `PENDING` real que Angular gestiona mientras un validador asíncrono resuelve. Fuentes oficiales: [Angular — Reactive forms](https://angular.dev/guide/forms/reactive-forms).

**Errores comunes:** testear un `FormGroup` únicamente a través de renderizar su template y simular eventos del DOM, perdiendo la ventaja real de una prueba unitaria directa y más rápida; mostrar un único mensaje de error genérico en vez de consultar la clave específica del validador que falló.

**Cuándo no usarlo:** para un formulario de un único campo sin ninguna regla de validación cruzada ni necesidad seria de testing (Tema 4), la sobrecarga de declarar un `FormGroup` completo puede no justificarse frente a `ngModel`.

**Transferencia al proyecto integrador «Centro de control logístico»:** Construye el formulario de asignación con controles tipados para guía y conductor. Prueba campos vacíos y una selección válida; solo el segundo caso debe generar el comando de asignación.

### Tema 2: Validadores asíncronos · Intermedio · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con el reloj simulado de Vitest (`vi.useFakeTimers()` y `vi.advanceTimersByTime()`), que un control con un validador asíncrono real permanece en estado `PENDING` mientras la petición simulada está en curso, y se resuelve a `VALID` o `INVALID` exactamente cuando el Observable emite.

**Conocimiento previo:** Tema 1 de este módulo; RxJS básico (`Observable`, `map`, `delay`).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En un formulario de registro, mostrar "verificando disponibilidad..." mientras se consulta si un email ya existe (en vez de dejar el formulario en un estado ambiguo) depende de que el estado `PENDING` de Angular se gestione correctamente; confirmar esto con un test real que controla el tiempo (`vi.advanceTimersByTime`) es más confiable que confiar en una revisión manual en el navegador.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `AsyncValidatorFn`, validación contra un servicio externo.

Un validador asíncrono verifica una condición que requiere consultar una fuente externa (típicamente el servidor, mediante una petición HTTP), como verificar si un email ya está registrado en el sistema antes de permitir continuar un formulario de registro, una validación que no puede resolverse instantáneamente y de forma síncrona como los validadores del Tema 1 (`Validators.required`, que puede evaluarse inmediatamente sin ninguna espera). Un `AsyncValidatorFn` recibe el control a validar y devuelve un Observable (o una Promesa) que eventualmente emite `null` (si la validación pasa) o un objeto de error (si falla), integrándose con el mismo mecanismo de reporte de errores que los validadores síncronos, de modo que la plantilla puede consultar `form.controls.email.errors?.["emailOcupado"]` exactamente con la misma sintaxis usada para errores de validadores síncronos.

Angular gestiona automáticamente el estado `pending` del control mientras el validador asíncrono está en curso (mientras espera la respuesta de la petición HTTP), permitiendo mostrar un indicador visual de "verificando..." mientras la validación asíncrona todavía no ha resuelto, y solo marcando el control como definitivamente válido o inválido una vez que la respuesta llega. Es importante que un validador asíncrono que dispara una petición HTTP incluya debounce (Módulo 6 del track de JavaScript, y RxJS en el Módulo 6 de este track) para no disparar una petición nueva en cada tecla presionada mientras el usuario aún está escribiendo el valor a validar, evitando saturar innecesariamente el servidor con peticiones de validación disparadas prematuramente antes de que el usuario termine de escribir.

Combinar validadores síncronos y asíncronos en el mismo control es común y natural: los validadores síncronos (como `Validators.required` y `Validators.email`) se evalúan primero y de forma inmediata; solo si todos los validadores síncronos pasan, Angular procede a evaluar los validadores asíncronos, evitando disparar innecesariamente una petición de red costosa para verificar la disponibilidad de un email que, de entrada, ni siquiera tiene un formato válido de email según los validadores síncronos más baratos de evaluar.

**Analogía:** un validador síncrono es como verificar instantáneamente si un formulario está completo y con el formato correcto simplemente mirándolo; un validador asíncrono es como tener que llamar por teléfono a una oficina externa para confirmar un dato específico antes de poder aprobar completamente el formulario, un proceso que naturalmente toma más tiempo y durante el cual el formulario permanece en un estado de "verificación pendiente".

**Diagrama — ciclo de vida del estado del control:**

```
setValue('ocupado@x.com')
        │
        ▼
┌───────────────┐   Observable en curso   ┌───────────────┐   emite valor   ┌────────────────────┐
│ status: VALID  │ ───────────────────────▶│ status: PENDING│ ───────────────▶│ status: INVALID/VALID│
└───────────────┘                          └───────────────┘                 └────────────────────┘
```

**Código del ejemplo:**

```ts
function emailDisponibleValidator(servicio: UsuariosService): AsyncValidatorFn {
  return (control) => servicio.emailExiste(control.value).pipe(
    map(existe => existe ? { emailOcupado: true } : null)
  );
}
new FormControl('', { asyncValidators: [emailDisponibleValidator(servicio)] });
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-async --standalone --skip-git --defaults` y luego `cd demo-async`), crea `src/app/email-disponible.validator.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/email-disponible.validator.ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UsuariosService {
  emailExiste(email: string): Observable<boolean>;
}

export function emailDisponibleValidator(servicio: UsuariosService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> =>
    servicio.emailExiste(control.value).pipe(
      map((existe) => (existe ? { emailOcupado: true } : null))
    );
}
```

Confirma el ciclo `VALID → PENDING → INVALID/VALID` con el reloj simulado de Vitest, controlando el tiempo de forma determinista. (Los tutoriales antiguos usan `fakeAsync`/`tick` de `@angular/core/testing`; en un proyecto nuevo de Angular 22, que es *zoneless* y usa Vitest, `fakeAsync` falla con `zone-testing.js is needed for the fakeAsync() test helper but could not be found`.)

```ts
// src/app/email-disponible.validator.spec.ts
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { emailDisponibleValidator, UsuariosService } from './email-disponible.validator';

class UsuariosServiceSimulado implements UsuariosService {
  emailExiste(email: string) {
    return of(email === 'ocupado@example.com').pipe(delay(300));
  }
}

describe('validador asincrono gestiona PENDING mientras el Observable esta en curso', () => {
  beforeEach(() => vi.useFakeTimers()); // reloj simulado de Vitest
  afterEach(() => vi.useRealTimers());

  it('el control queda PENDING de inmediato, y se resuelve a INVALID tras 300ms si el email existe', () => {
    const control = new FormControl('ocupado@example.com', {
      nonNullable: true,
      asyncValidators: [emailDisponibleValidator(new UsuariosServiceSimulado())],
    });

    expect(control.status).toBe('PENDING');

    vi.advanceTimersByTime(300);

    expect(control.status).toBe('INVALID');
    expect(control.errors?.['emailOcupado']).toBe(true);
  });

  it('se resuelve a VALID si el email no existe', () => {
    const control = new FormControl('libre@example.com', {
      nonNullable: true,
      asyncValidators: [emailDisponibleValidator(new UsuariosServiceSimulado())],
    });

    vi.advanceTimersByTime(300);

    expect(control.status).toBe('VALID');
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; `control.status` es literalmente `'PENDING'` de forma síncrona inmediatamente después de crear el control (antes de que `vi.advanceTimersByTime(300)` avance el reloj simulado), confirmando que Angular gestiona ese estado automáticamente mientras el Observable del validador asíncrono no ha emitido todavía.

**Fallo deliberado:** cambia `vi.advanceTimersByTime(300)` por `vi.advanceTimersByTime(100)` (menos que el `delay(300)` real del servicio simulado) en el primer test y ejecuta de nuevo. FALLA con `Expected: "INVALID"` y `Received: "PENDING"` — diagnosticando que el tiempo simulado debe igualar o superar el delay real del Observable para que la validación asíncrona efectivamente resuelva. Restaura `300` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un validador síncrono (`Validators.email`) al mismo control y confirma con un test que Angular NO invoca el validador asíncrono si el síncrono ya falló (verifica que `emailExiste` de un espía no se llamó).
2. Documenta, en un comentario, por qué el reloj simulado (`vi.useFakeTimers()`) es preferible a `setTimeout` real con un test asíncrono (`async`/`await`) para verificar temporización exacta de forma determinista.
3. Escribe un test que confirme que dos validaciones asíncronas consecutivas y rápidas (simulando teclas presionadas rápidamente) no dejan el control en un estado inconsistente al resolver fuera de orden.
4. Escribe de memoria (sin mirar) un `AsyncValidatorFn` y un test con `vi.useFakeTimers()`/`vi.advanceTimersByTime()` que confirme el ciclo `PENDING → INVALID`. Compara después contra el patrón del Paso 4.

**Pista:** `control.status === 'PENDING'` es la aserción clave que demuestra que el estado se está gestionando correctamente; olvidar verificarlo (y solo comprobar el resultado final) deja sin probar la parte de la experiencia de usuario que muestra el indicador de "verificando...".

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con la función real de Vitest que avanza el reloj simulado tras `vi.useFakeTimers()`:

```ts
vi.____(300);
expect(control.status).toBe('INVALID');
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `AsyncValidatorFn` y un test con reloj simulado de Vitest que confirme el estado `PENDING` inmediato y la resolución tras avanzar 300 ms. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con el reloj simulado de Vitest, el ciclo completo de estado `VALID → PENDING → INVALID/VALID` que Angular gestiona automáticamente para validadores asíncronos. El siguiente tema confirma con `push`/`removeAt` reales que un `FormArray` crece y decrece dinámicamente, con validación independiente por control. Fuentes oficiales: [Angular — Async validators](https://angular.dev/guide/forms/reactive-forms#async-validators).

**Errores comunes:** verificar solo el resultado final de una validación asíncrona sin confirmar el estado `PENDING` intermedio, dejando sin probar el indicador visual de carga; usar `setTimeout` real en un test en vez de `vi.useFakeTimers()`, haciendo la prueba lenta e indeterminista.

**Cuándo no usarlo:** para una validación que puede resolverse instantáneamente con datos ya disponibles en el cliente (sin ninguna consulta externa real), un validador síncrono normal es más simple y no introduce ningún estado `PENDING` innecesario.

**Transferencia al proyecto integrador «Centro de control logístico»:** Valida disponibilidad del conductor mediante una consulta cancelable. Escribe dos identificadores seguidos y devuelve las respuestas al revés; el formulario debe conservar la validez correspondiente al último valor.

### Tema 3: FormArray para campos dinámicos · Intermedio · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `push`/`removeAt` reales sobre un `FormArray`, que el número de controles crece y decrece dinámicamente, y que cada control agregado valida de forma completamente independiente de los demás.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En un formulario de entrega con múltiples teléfonos de contacto, confirmar con una prueba real (no solo revisando visualmente en el navegador) que agregar y quitar teléfonos actualiza correctamente tanto la longitud del array como la validez individual de cada teléfono restante previene errores sutiles de índice al eliminar un control específico de la lista.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** número variable de controles, agregar/quitar dinámicamente.

`FormArray` representa una lista de controles cuyo número puede cambiar dinámicamente en tiempo de ejecución, apropiado para casos como agregar múltiples números de teléfono de contacto a un formulario, donde el número exacto de campos necesarios no se conoce de antemano y el usuario debe poder agregar o quitar entradas según necesite. `new FormArray([new FormControl("")])` inicializa el array con un único control, y `(form.controls.telefonos as FormArray).push(new FormControl(""))` agrega dinámicamente un nuevo control vacío al final del array cada vez que el usuario solicita agregar otro campo, con la plantilla iterando sobre los controles del `FormArray` (usando `@for`, Módulo 1) para renderizar dinámicamente un input por cada control presente en el array en cualquier momento dado.

Cada control individual dentro de un `FormArray` puede tener sus propios validadores independientes, exactamente igual que cualquier `FormControl` normal, permitiendo validar cada teléfono agregado dinámicamente de forma independiente (por ejemplo, verificando que cada uno cumple un formato válido de número telefónico), y el `FormArray` en su conjunto también puede tener validadores propios que operen sobre el array completo (como verificar que al menos un teléfono fue proporcionado, no permitiendo un array completamente vacío).

Este patrón de formularios dinámicos con `FormArray` es un ejemplo concreto de un caso donde Reactive Forms ofrece una ventaja clara y difícil de replicar con la misma robustez usando template-driven forms: gestionar programáticamente un número variable de controles con sus propios estados de validación individuales es considerablemente más natural expresado como una estructura de datos TypeScript (un array de `FormControl`) que mediante directivas de plantilla intentando replicar la misma dinámica de forma declarativa en el HTML.

**Analogía:** un `FormArray` es como una lista de contactos de emergencia que un formulario permite expandir o contraer según sea necesario, donde cada contacto agregado tiene sus propios campos de validación independientes (nombre válido, teléfono con formato correcto), y la lista completa puede además tener su propia regla general (por ejemplo, requerir al menos un contacto).

**Diagrama — crecimiento y reducción dinámica:**

```
FormArray inicial: [ tel0 ]
        │ push(new FormControl(''))
        ▼
FormArray: [ tel0, tel1 ]
        │ removeAt(0)
        ▼
FormArray: [ tel1 ]   (tel1 conserva su propio estado de validacion)
```

**Código del ejemplo:**

```ts
form = new FormGroup({ telefonos: new FormArray([new FormControl('')]) });
agregarTelefono() {
  (this.form.controls.telefonos as FormArray).push(new FormControl(''));
}
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-arrays --standalone --skip-git --defaults` y luego `cd demo-arrays`), crea `src/app/telefonos-form.model.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/telefonos-form.model.ts
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

export function crearFormularioTelefonos() {
  return new FormGroup({
    telefonos: new FormArray([
      new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ]),
  });
}

export function agregarTelefono(form: ReturnType<typeof crearFormularioTelefonos>) {
  form.controls.telefonos.push(new FormControl('', { nonNullable: true, validators: [Validators.required] }));
}

export function quitarTelefono(form: ReturnType<typeof crearFormularioTelefonos>, indice: number) {
  form.controls.telefonos.removeAt(indice);
}
```

```ts
// src/app/telefonos-form.model.spec.ts
import { agregarTelefono, crearFormularioTelefonos, quitarTelefono } from './telefonos-form.model';

describe('FormArray de telefonos crece y decrece dinamicamente', () => {
  it('empieza con 1 control; agregarTelefono lo lleva a 2; quitarTelefono lo reduce a 1', () => {
    const form = crearFormularioTelefonos();
    expect(form.controls.telefonos.length).toBe(1);

    agregarTelefono(form);
    expect(form.controls.telefonos.length).toBe(2);

    quitarTelefono(form, 0);
    expect(form.controls.telefonos.length).toBe(1);
  });

  it('cada control valida de forma independiente dentro del array', () => {
    const form = crearFormularioTelefonos();
    agregarTelefono(form);

    form.controls.telefonos.at(0).setValue('123456789');

    expect(form.controls.telefonos.at(0).valid).toBe(true);
    expect(form.controls.telefonos.at(1).valid).toBe(false);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; el segundo confirma con `toBe(true)`/`toBe(false)` que rellenar el primer control del array NO afecta la validez del segundo — cada `FormControl` dentro del `FormArray` mantiene su propio estado de validación completamente aislado.

**Fallo deliberado:** cambia `form.controls.telefonos.removeAt(0)` por `form.controls.telefonos.removeAt(1)` en la llamada del primer test (índice fuera de rango dado que el array solo tiene 2 elementos en ese punto, índices 0 y 1 — cambia a `removeAt(5)`) y ejecuta de nuevo. FALLA porque Angular no lanza un error pero tampoco elimina ningún control (el índice no existe), dejando `form.controls.telefonos.length` en `2` en vez de `1` — diagnosticando que `removeAt` con un índice inválido falla silenciosamente sin ninguna excepción, una fuente real de bugs si el índice se calcula incorrectamente. Restaura `removeAt(0)` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un validador a nivel del `FormArray` completo (no de cada control individual) que requiera al menos un teléfono no vacío, y confírmalo con un test.
2. Documenta, en un comentario, qué sucede con el índice de los controles restantes después de `removeAt(0)` en un array con 3 elementos (verifica con un test que el control que estaba en el índice 1 ahora está en el índice 0).
3. Escribe un test que agregue 3 teléfonos, invalide deliberadamente el del medio, y confirme que `form.valid` es `false` mientras los otros dos siguen siendo `valid` individualmente.
4. Escribe de memoria (sin mirar) un `FormArray` con `push`/`removeAt` y un test que confirme el crecimiento, la reducción y la validación independiente. Compara después contra el patrón del Paso 4.

**Pista:** `removeAt` con un índice fuera de rango no lanza ningún error — siempre verifica `form.controls.telefonos.length` antes y después de la operación para confirmar que el elemento correcto fue efectivamente removido.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real de `FormArray` que agrega un nuevo control al final:

```ts
form.controls.telefonos.____(new FormControl('', { nonNullable: true, validators: [Validators.required] }));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `FormArray` con `push` y `removeAt`, y un test que confirme la validación independiente de cada control. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con `push`/`removeAt` reales, que un `FormArray` gestiona un número dinámico de controles con validación completamente independiente entre ellos. El siguiente y último tema confirma con `ngModel` real en un componente renderizado que template-driven forms sigue siendo válido para casos triviales, y qué error real de compilación produce olvidar `FormsModule`. Fuentes oficiales: [Angular — FormArray](https://angular.dev/api/forms/FormArray).

**Errores comunes:** asumir que `removeAt` con un índice inválido lanza un error (falla silenciosamente); olvidar que los índices de los controles restantes se recalculan tras un `removeAt`, invalidando referencias guardadas al índice anterior.

**Cuándo no usarlo:** para un número de campos que siempre es fijo y conocido de antemano (como "nombre" y "email"), usar `FormArray` añade complejidad innecesaria frente a declarar `FormControl`s individuales directamente en el `FormGroup`.

**Transferencia al proyecto integrador «Centro de control logístico»:** Representa paradas adicionales con FormArray. Añade y retira una parada intermedia y verifica que los errores y los valores enviados permanecen asociados a la parada correcta.

### Tema 4: Template-driven forms — cuándo siguen siendo válidos · Intermedio · 45 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con un componente real renderizado y `[(ngModel)]`, que escribir en un `<input>` actualiza la propiedad del componente en ambas direcciones, y reproducir el error real de compilación de plantilla que ocurre al olvidar importar `FormsModule`.

**Conocimiento previo:** Módulo 1 de este track (componentes standalone); Temas 1-3 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Para un campo de búsqueda simple sin ninguna validación, `ngModel` es genuinamente más rápido de escribir que un `FormControl` completo; pero olvidar importar `FormsModule` en un componente standalone produce un error real de compilación de plantilla que conviene reconocer inmediatamente en vez de perder tiempo depurando un binding que "no hace nada".

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `ngModel`, simplicidad para casos triviales, límites de escalabilidad.

Template-driven forms, basado en la directiva `ngModel` colocada directamente sobre elementos del template, infiere la estructura del formulario implícitamente a partir de las directivas presentes en el HTML, en vez de definirla explícitamente en TypeScript como Reactive Forms. Para un formulario extremadamente simple (un único campo de búsqueda, o un interruptor de encendido/apagado sin ninguna validación cruzada entre campos), `ngModel` puede escribirse más rápidamente, con menos código repetitivo que declarar explícitamente un `FormControl` completo para un caso tan trivial que apenas necesita gestión de estado o validación real.

Sin embargo, para cualquier formulario con requisitos más allá de lo más trivial —validación cruzada entre múltiples campos (como confirmar que dos campos de contraseña coinciden entre sí), arrays dinámicos de campos (Tema 3), o cualquier necesidad seria de testing automatizado del comportamiento del formulario sin depender de renderizar y manipular el DOM real— Reactive Forms es consistentemente la opción más predecible y mantenible, precisamente por tener su estructura completa definida explícitamente como un objeto TypeScript verificable e inspeccionable directamente, sin depender de inferir su comportamiento a partir de directivas dispersas en una plantilla HTML.

La recomendación práctica, y la que la mayoría de equipos de Angular experimentados adoptan consistentemente, es usar Reactive Forms como opción por defecto para prácticamente cualquier formulario de una aplicación real, reservando template-driven forms exclusivamente para los casos más triviales y aislados donde la sobrecarga adicional de definir un `FormGroup` completo genuinamente no se justifica frente a la simplicidad de un `ngModel` directo, una decisión que conviene tomar conscientemente caso por caso, no por defecto automático hacia uno u otro enfoque sin considerar los requisitos reales del formulario específico.

**Analogía:** template-driven forms es como escribir una nota rápida a mano para un recordatorio simple y de un solo propósito; Reactive Forms es como redactar un contrato formal completo con cláusulas explícitas y verificables independientemente, apropiado cuando las consecuencias de un error o la complejidad de las condiciones involucradas justifican la formalidad adicional del documento completo.

**Diagrama — sincronización bidireccional de `ngModel`:**

```
┌────────────────┐   usuario escribe   ┌───────────────────┐
│  <input>  (DOM)  │ ───────────────────▶│ componente.busqueda│
└────────────────┘                       └───────────────────┘
       ▲                                          │
       │            componente.busqueda = 'x'     │
       └──────────────────────────────────────────┘
```

**Código del ejemplo:**

```html
<!-- template-driven: apropiado solo para casos muy simples -->
<input [(ngModel)]="busqueda" />
```
```
Reactive Forms: estructura explícita en TypeScript, testeable sin DOM,
                 apropiado para validación cruzada, arrays dinámicos, testing serio
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-ngmodel --standalone --skip-git --defaults` y luego `cd demo-ngmodel`), crea `src/app/busqueda-template.component.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/busqueda-template.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-busqueda-template',
  standalone: true,
  imports: [FormsModule],
  template: `<input [(ngModel)]="busqueda" name="busqueda" />`,
})
export class BusquedaTemplateComponent {
  busqueda = '';
}
```

Confirma la sincronización bidireccional real renderizando el componente y simulando un evento `input` genuino del DOM:

```ts
// src/app/busqueda-template.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BusquedaTemplateComponent } from './busqueda-template.component';

describe('ngModel sincroniza el input del DOM con la propiedad del componente', () => {
  it('escribir en el input actualiza busqueda del componente', async () => {
    const fixture = TestBed.createComponent(BusquedaTemplateComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.busqueda).toBe('Angular');
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; despachar un evento `input` real del DOM sobre el elemento (no asignar directamente `fixture.componentInstance.busqueda = 'Angular'`, que probaría lo contrario y trivialmente) confirma la dirección DOM → componente de `ngModel`.

**Fallo deliberado:** quita `FormsModule` del array `imports: [FormsModule]` del componente y ejecuta de nuevo el test. FALLA con un error de compilación de plantilla real: `NG8002: Can't bind to 'ngModel' since it isn't a known property of 'input'` — diagnosticando que `ngModel` no es una directiva incorporada nativamente en el HTML, sino que requiere `FormsModule` explícitamente importado para reconocer esa sintaxis en el template. Restaura `FormsModule` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo campo con `ngModel` (por ejemplo un checkbox `[(ngModel)]="soloActivas"`) y confirma con un test que ambos campos sincronizan de forma independiente.
2. Documenta, en un comentario, por qué el test del Paso 4 despacha un evento `input` real del DOM en vez de asignar la propiedad directamente — ¿qué dirección de la sincronización quedaría sin probar si se hiciera al revés?
3. Reproduce el error `NG8002` real (Paso 4) y documenta, con tus propias palabras, en qué se diferencia de los errores `NG0203`/`NG0201`/`NG0950` de módulos anteriores (todos ocurren en tiempo distinto: compilación de plantilla vs. tiempo de ejecución).
4. Escribe de memoria (sin mirar) un componente standalone con `[(ngModel)]`, sus `imports`, y un test que simule un evento `input` real. Compara después contra el patrón del Paso 4.

**Pista:** un test que simplemente asigna `fixture.componentInstance.busqueda = 'Angular'` y verifica que el input lo refleja prueba la dirección componente → DOM; despachar un evento `input` real prueba la dirección DOM → componente — ambas direcciones deben probarse para confirmar la sincronización bidireccional completa que `ngModel` promete.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el módulo real de `@angular/forms` que debe importarse para que `[(ngModel)]` funcione en un componente standalone:

```ts
imports: [____],
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un componente standalone con `[(ngModel)]` correctamente configurado y un test que confirme la sincronización DOM → componente con un evento `input` real. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con un componente renderizado y un evento `input` real del DOM, que `[(ngModel)]` sincroniza en ambas direcciones, y reproduces el error real `NG8002` que ocurre al olvidar `FormsModule`. Con esto cierras el módulo de formularios: `FormGroup` testeado sin DOM (Tema 1), validación asíncrona con `PENDING` real (Tema 2), `FormArray` dinámico (Tema 3) y `ngModel` para casos triviales (Tema 4). El Tema 5 presenta Signal Forms, la API de formularios basada en signals que Angular 22 declaró estable. Fuentes oficiales: [Angular — Template-driven forms](https://angular.dev/guide/forms/template-driven-forms).

**Errores comunes:** usar `ngModel` para un formulario con validación cruzada o arrays dinámicos, perdiendo la robustez y testabilidad de Reactive Forms sin necesidad real; olvidar `FormsModule` en un componente standalone y interpretar erróneamente el `NG8002` resultante como un bug del propio binding en vez de un import faltante.

**Cuándo no usarlo:** para cualquier formulario con más de un par de campos, o con cualquier necesidad de validación cruzada, arrays dinámicos, o testing serio del comportamiento sin renderizar HTML, Reactive Forms (Temas 1-3) es la opción más predecible y mantenible.

---

**Transferencia al proyecto integrador «Centro de control logístico»:** Usa un formulario simple para la preferencia de densidad del panel. Comprueba guardado y restauración, y documenta por qué el formulario de asignación conserva Reactive Forms para sus reglas entre campos.

### Tema 5: Signal Forms: formularios basados en signals (Angular 22) · Intermedio · 45 min

**Duración estimada:** 45 min (4 subtemas de 10–12 min).

**Al finalizar podrás:** crear un formulario con `form()` sobre un `signal` de modelo, enlazar cada campo con `[formField]`, declarar reglas con mensaje (`required`, `pattern`, `email`, `min`, `max`), mostrar los errores cuando el campo fue tocado, enviar con `[formRoot]` y la opción `submission`, y decidir cuándo usar Signal Forms y cuándo Reactive Forms.

**¿Por qué es importante?** Desde Angular 22, Signal Forms es una API estable de `@angular/forms/signals` (su documentación de tipos la marca `@publicApi 22.0`). El modelo del formulario es un `signal` normal, así que encaja con todo lo que aprendiste en el Módulo 2: el valor, la validez y los errores se leen como signals y se repintan sin suscripciones. Los Temas 1–4 siguen siendo necesarios: casi todo el código Angular existente usa Reactive Forms o template-driven forms, y verás los dos.

**Prerrequisitos:** Módulo 2 (signals) y Tema 1 de este módulo (validadores y mensajes por error). Trabajas en el proyecto `demo-forms` del Tema 1, creado con `@angular/cli@22` (zoneless, con Vitest).

Crea la carpeta `src/app/entrega/`. Al terminar el tema tendrás dos archivos: el componente y su prueba.

#### Subtema 5.1: El modelo es un signal; el formulario, un árbol de campos · 10 min

**1. Contexto**
En Reactive Forms el valor vive dentro de cada `FormControl`. En Signal Forms el valor vive en **tu** `signal`, y `form()` construye encima un árbol de campos (`FieldTree`) que lo lee y lo escribe. RutaFlow necesita registrar una entrega con su guía y el email del destinatario.

**2. Hazlo tú**
Crea `src/app/entrega/formulario-entrega.ts`:

```ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, FormRoot, pattern, required } from '@angular/forms/signals';

export interface Entrega {
  guia: string;
  email: string;
}

@Component({
  selector: 'app-formulario-entrega',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="formulario">
      <label>
        Guía
        <input [formField]="formulario.guia" />
      </label>
      @if (formulario.guia().touched() && formulario.guia().invalid()) {
        @for (error of formulario.guia().errors(); track error.kind) {
          <p role="alert">{{ error.message }}</p>
        }
      }

      <label>
        Email del destinatario
        <input type="email" [formField]="formulario.email" />
      </label>
      @if (formulario.email().touched() && formulario.email().invalid()) {
        @for (error of formulario.email().errors(); track error.kind) {
          <p role="alert">{{ error.message }}</p>
        }
      }

      <button type="submit">Registrar</button>
    </form>
    @if (registrada(); as e) {
      <p role="status">Registrada {{ e.guia }}</p>
    }
  `,
})
export class FormularioEntrega {
  // El modelo es un signal normal: el formulario lo lee y lo escribe.
  readonly modelo = signal<Entrega>({ guia: '', email: '' });
  readonly registrada = signal<Entrega | null>(null);

  readonly formulario = form(
    this.modelo,
    (ruta) => {
      required(ruta.guia, { message: 'La guía es obligatoria' });
      pattern(ruta.guia, /^RF-\d{4}$/, { message: 'Usa el formato RF-0000' });
      required(ruta.email, { message: 'El email es obligatorio' });
      email(ruta.email, { message: 'Escribe un email válido' });
    },
    {
      submission: {
        // Solo se llama si el formulario es válido.
        action: async (campo) => {
          this.registrada.set(campo().value());
        },
      },
    },
  );
}
```

Crea `src/app/entrega/formulario-entrega.spec.ts` (los subtemas siguientes agregan pruebas al mismo `describe`):

```ts
import { TestBed } from '@angular/core/testing';
import { FormularioEntrega } from './formulario-entrega';

async function montar() {
  const fixture = TestBed.createComponent(FormularioEntrega);
  await fixture.whenStable();
  return fixture;
}

function escribir(input: HTMLInputElement, valor: string) {
  input.value = valor;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur')); // marca el campo como touched
}

describe('FormularioEntrega (Signal Forms)', () => {
  it('cada regla informa su propio mensaje', async () => {
    const fixture = await montar();
    const [guia, correo] = fixture.nativeElement.querySelectorAll('input');
    escribir(guia, 'rf-1');
    escribir(correo, 'ana');
    await fixture.whenStable();
    const mensajes = [...fixture.nativeElement.querySelectorAll('[role=alert]')].map((p: Element) => p.textContent?.trim());
    expect(mensajes).toEqual(['Usa el formato RF-0000', 'Escribe un email válido']);
  });

  it('escribir en el input actualiza el modelo y el modelo actualiza el input', async () => {
    const fixture = await montar();
    const componente = fixture.componentInstance;
    const [guia] = fixture.nativeElement.querySelectorAll('input');
    escribir(guia, 'RF-4471');
    expect(componente.modelo().guia).toBe('RF-4471');

    componente.modelo.update((m) => ({ ...m, guia: 'RF-5101' }));
    await fixture.whenStable();
    expect(guia.value).toBe('RF-5101');
  });

  it('no envía si es inválido y envía el valor cuando es válido', async () => {
    const fixture = await montar();
    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    boton.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.registrada()).toBeNull();
    expect(fixture.componentInstance.formulario.guia().touched()).toBe(true);

    const [guia, correo] = fixture.nativeElement.querySelectorAll('input');
    escribir(guia, 'RF-4471');
    escribir(correo, 'ana@rutaflow.co');
    boton.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain('Registrada RF-4471');
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** Vitest informa las tres pruebas de `FormularioEntrega (Signal Forms)` en verde. Esta subsección corresponde a la segunda: escribir en el `<input>` cambia `modelo().guia`, y actualizar el `signal` cambia lo que muestra el `<input>`.

**Fallo deliberado:** quita `FormField` del array `imports` del componente y ejecuta la prueba. **Error esperado:** la compilación falla con `NG8002: Can't bind to 'formField' since it isn't a known property of 'input'`. **Diagnóstico:** `[formField]` es una directiva de `@angular/forms/signals`; un componente standalone solo reconoce las directivas que importa (el mismo error que viste con `ngModel` en el Tema 4). Restaura el import.

**3. Entiende**
**Explicación por bloques:** `modelo` es la única fuente de verdad. `form(this.modelo, ...)` devuelve `formulario`, cuyas propiedades (`formulario.guia`, `formulario.email`) siguen la forma del modelo. Cada campo es una función: `formulario.guia()` devuelve su estado, con signals como `value()`, `touched()`, `invalid()` y `errors()`. `[formField]` conecta el `<input>` con ese campo en las dos direcciones. Como el componente es `OnPush` por defecto en Angular 22 y el template lee signals, cada cambio repinta solo lo necesario.

**Analogía:** el modelo es la hoja de ruta original y el formulario es una lámina transparente encima, donde marcas qué casillas faltan o están mal. Escribir en la lámina escribe en la hoja; la hoja sigue siendo una sola.

**4. Cierra**
Guarda el componente y la prueba en verde. Queda listo un formulario sin `FormGroup` ni `FormControl`.

#### Subtema 5.2: Reglas con mensaje y errores cuando el campo fue tocado · 10 min

**1. Contexto**
El segundo argumento de `form()` es la **función de esquema**: recibe `ruta`, un mapa de los campos, y declara las reglas. Cada regla acepta `{ message }`, así que el template no necesita traducir claves de error a texto.

**2. Hazlo tú**
Las reglas ya están en el componente (`required`, `pattern` y `email`). La primera prueba escribe `rf-1` y `ana`, dispara `input` y `blur` (este marca el campo como tocado) y compara los mensajes. Ejecuta de nuevo `npx ng test --watch=false`.

**Resultado esperado:** la prueba «cada regla informa su propio mensaje» pasa: el template muestra `Usa el formato RF-0000` y `Escribe un email válido`, y no muestra los mensajes de `required` porque los campos tienen texto.

**Fallo deliberado:** en el template, quita `formulario.guia().touched() &&` de la primera condición y abre la app con `npx ng serve`. **Resultado:** al cargar la página, antes de escribir nada, ya aparece «La guía es obligatoria». **Diagnóstico:** el campo es inválido desde el principio; mostrar el error solo después de `touched()` evita regañar a quien todavía no escribió. Restaura la condición.

**3. Entiende**
`errors()` devuelve un arreglo de objetos con `kind` (por ejemplo `'required'`, `'pattern'`, `'email'`) y el `message` que declaraste; por eso el `@for` usa `track error.kind`. `invalid()` es `true` si hay al menos un error. Las reglas se evalúan como `computed`: cuando cambia el modelo, los errores se recalculan solos. **Límite:** `pattern` y `email` aceptan la cadena vacía; si el campo es obligatorio, combínalos con `required`.

**4. Cierra**
Anota qué `kind` produce cada regla. El formulario ya explica cada error con su propio texto, como pedía el Tema 1.

#### Subtema 5.3: Envía con `[formRoot]` y `submission` · 12 min

**1. Contexto**
Un envío correcto debe ocurrir solo si el formulario es válido y, si no lo es, mostrar los errores de todos los campos aunque el usuario no los haya tocado.

**2. Hazlo tú**
El tercer argumento de `form()` declara `submission.action`, y el template enlaza `<form [formRoot]="formulario">`. La tercera prueba pulsa «Registrar» con el formulario vacío y después con datos válidos. Ejecuta `npx ng test --watch=false`.

**Resultado esperado:** la prueba «no envía si es inválido y envía el valor cuando es válido» pasa: el primer clic no llama a `action`, pero marca los campos como tocados (por eso aparecen sus errores); el segundo muestra `Registrada RF-4471`.

**Fallo deliberado:** quita `FormRoot` de `imports` (deja `FormField`) y ejecuta la prueba. **Error esperado:** `NG8002: Can't bind to 'formRoot' since it isn't a known property of 'form'`. **Diagnóstico:** sin la directiva, Angular no sabe que ese `<form>` pertenece a `formulario`. Restaura el import.

**3. Entiende**
`FormRoot` pone `novalidate` en el `<form>`, evita el envío por defecto del navegador (que recargaría la página) y llama a `submit()` sobre el árbol. `submit()` marca todos los campos como tocados y, solo si el formulario es válido, ejecuta `action` con el campo raíz; `campo().value()` es una copia del modelo en ese momento. `action` es asíncrona: ahí va la llamada a `HttpClient` del Módulo 7. Si el servidor rechaza los datos, `action` puede devolver errores, por ejemplo `{ kind: 'guiaDuplicada', message: 'La guía ya existe', fieldTree: campo.guia }`, y aparecen en `errors()` de ese campo. Fuente: [Form submission](https://angular.dev/guide/forms/signals/form-submission).

**4. Cierra**
Guarda las tres pruebas en verde.

#### Subtema 5.4: Una sola fuente de verdad y cuándo elegir cada API · 10 min

**1. Contexto**
Como el modelo es tu `signal`, todas las reglas de signals del Módulo 2 aplican, incluida la más importante: actualizar con un objeto nuevo, nunca mutar el actual.

**2. Hazlo tú**
Agrega este bloque al final de `formulario-entrega.spec.ts` y ejecuta las pruebas:

```ts
describe('fallo deliberado', () => {
  it('mutar el objeto del modelo en sitio no llega al input', async () => {
    const fixture = await montar();
    const [guia] = fixture.nativeElement.querySelectorAll('input');
    fixture.componentInstance.modelo().guia = 'RF-9999';
    await fixture.whenStable();
    expect(guia.value).toBe('');
  });
});
```

**Resultado esperado:** la prueba pasa porque **documenta el fallo**: mutar `modelo().guia` en sitio no cambia la referencia del objeto, el signal no avisa y el `<input>` sigue vacío.

**Fallo deliberado:** cambia la expectativa por `expect(guia.value).toBe('RF-9999')`. **Error esperado:** `AssertionError: expected '' to be 'RF-9999'`. **Diagnóstico:** el mismo problema que `push()` sobre un arreglo en un signal; usa `modelo.update((m) => ({ ...m, guia: 'RF-9999' }))` o `formulario.guia().value.set('RF-9999')`. Restaura la expectativa original.

**3. Entiende**
Usa Signal Forms en código nuevo de Angular 22 cuando el formulario se apoya en estado de signals. Mantén Reactive Forms cuando el proyecto ya los usa de forma extensa, cuando dependes de librerías que esperan un `ControlValueAccessor` o un `FormGroup`, o cuando el equipo aún no migró: las dos APIs conviven en la misma aplicación. Template-driven (Tema 4) sigue siendo la opción para un campo trivial. **Límite:** `[formField]` no admite todavía `<select multiple>`, según la [guía oficial](https://angular.dev/essentials/signal-forms).

| Necesidad | Signal Forms | Reactive Forms |
|---|---|---|
| Dónde vive el valor | En tu `signal` | Dentro de cada `FormControl` |
| Leer validez y errores | Signals (`invalid()`, `errors()`) | Propiedades y `statusChanges` (Observable) |
| Mensajes de error | En la regla (`{ message }`) | En el template, por clave de error |
| Código existente y librerías | Nuevo en Angular 22 | La mayor parte del ecosistema actual |

**4. Cierra**
Escribe en un comentario del componente por qué elegiste Signal Forms para este formulario y qué te haría elegir Reactive Forms.

**Hito del tema:**

- [ ] `npx ng test --watch=false` muestra en verde las cuatro pruebas de `formulario-entrega.spec.ts`.
- [ ] Provoqué el `NG8002` al quitar `FormField` y lo diagnostiqué.
- [ ] Comprobé que `submit()` no llama a `action` con datos inválidos y marca los campos como tocados.
- [ ] Expliqué con una limitación cuándo mantendría Reactive Forms.

**Resumen:** el modelo es un `signal`; `form()` construye el árbol de campos; `[formField]` enlaza cada input; las reglas declaran su mensaje; los errores se muestran tras `touched()`; `[formRoot]` y `submission` envían solo si el formulario es válido; y el modelo se actualiza con objetos nuevos.

**Errores comunes:** olvidar importar `FormField` o `FormRoot`, mutar el objeto del modelo en sitio, mostrar errores antes de que el campo se toque y usar `pattern` sin `required` en un campo obligatorio.

**Transferencia al proyecto integrador «Centro de control logístico»:** crea el formulario de alta de entregas con Signal Forms y conserva el de asignación en Reactive Forms; documenta la decisión.

**Ejercicio:** crea `src/app/ejercicio/paquete.ts`, un componente con un único campo numérico `pesoKg` (valor inicial `1`) que acepte de 0,1 a 30 kg y muestre «El peso máximo es 30 kg» o «El peso mínimo es 0,1 kg». Escribe una prueba que escriba `40` y compruebe que el modelo guarda el **número** `40` (no el texto `'40'`) y que aparece el mensaje. Antes de abrir la solución, predice qué tipo tendrá `modelo().pesoKg` después de escribir en un `<input type="number">`.

<details>
<summary>Solución — ábrela después de intentarlo</summary>

`[formField]` sobre un `<input type="number">` convierte el texto en número porque el modelo es `number`; por eso `toBe(40)` pasa.

```ts
import { Component, signal } from '@angular/core';
import { form, FormField, max, min } from '@angular/forms/signals';

@Component({
  selector: 'app-paquete',
  imports: [FormField],
  template: `
    <label>Peso (kg) <input type="number" [formField]="paquete.pesoKg" /></label>
    @for (error of paquete.pesoKg().errors(); track error.kind) {
      <p role="alert">{{ error.message }}</p>
    }
  `,
})
export class Paquete {
  readonly modelo = signal({ pesoKg: 1 });
  readonly paquete = form(this.modelo, (ruta) => {
    min(ruta.pesoKg, 0.1, { message: 'El peso mínimo es 0,1 kg' });
    max(ruta.pesoKg, 30, { message: 'El peso máximo es 30 kg' });
  });
}
```

```ts
import { TestBed } from '@angular/core/testing';
import { Paquete } from './paquete';

it('valida el rango del peso y guarda un número', async () => {
  const fixture = TestBed.createComponent(Paquete);
  await fixture.whenStable();
  const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
  input.value = '40';
  input.dispatchEvent(new Event('input'));
  await fixture.whenStable();
  expect(fixture.componentInstance.modelo().pesoKg).toBe(40);
  expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toBe('El peso máximo es 30 kg');
});
```

Si tu prueba comparaba con `'40'`, falla con `expected 40 to be '40'`: el modelo conserva el tipo que declaraste. Si usaste un `validate()` propio en vez de `min`/`max`, compara: las reglas incorporadas ya producen errores con `kind` `'min'` y `'max'`.

</details>

**Fuentes oficiales:** [Angular — Signal Forms (essentials)](https://angular.dev/essentials/signal-forms), [Angular — Form submission](https://angular.dev/guide/forms/signals/form-submission) y [Angular — Signal Forms overview](https://angular.dev/guide/forms/signals/overview).

## Laboratorio práctico

**Objetivo del laboratorio:** construir un formulario multi-paso con validación reactiva completa, incluyendo un validador asíncrono y un `FormArray` dinámico.

**Requisitos previos:** Módulos 0-4 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear el FormGroup base | Ver Tema 1: nombre, email, contraseña con validadores | Verifica cada validador individualmente |
| 2 | Mostrar mensajes de error específicos | Según qué validador falló | required vs email vs minlength distintos |
| 3 | Agregar un validador asíncrono | Ver Tema 2, simulado con delay | Verifica el estado `pending` mientras resuelve |
| 4 | Construir un FormArray de teléfonos | Ver Tema 3 | Agrega y quita dinámicamente |
| 5 | Implementar el mismo formulario simple con ngModel | Ver Tema 4 | Documenta cuándo seguirías esa opción |
| 6 | Reescribir el formulario de entrega con Signal Forms | Ver Tema 5 | `form()`, `[formField]`, reglas con mensaje y `[formRoot]` |

**Verificación:** el laboratorio se considera exitoso si cada validador muestra su mensaje de error específico correspondiente, si el validador asíncrono correctamente marca el control como `pending` mientras verifica, y si el `FormArray` permite agregar y quitar teléfonos dinámicamente sin errores.

**Errores comunes y soluciones**

- **Mostrar un único mensaje de error genérico en vez de uno específico por validador.** Verifica el objeto `errors` específico de cada control para identificar exactamente cuál validador falló.
- **Disparar un validador asíncrono sin debounce.** Combina con `debounceTime` (Módulo 6) para no saturar el servidor con verificaciones en cada tecla presionada.
- **Usar template-driven forms para un formulario con validación cruzada compleja.** Migra a Reactive Forms para cualquier cosa más allá de lo más simple.

---
