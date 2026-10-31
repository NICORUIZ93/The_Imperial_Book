# Módulo 5: Formularios reactivos y template-driven


## Aprende construyendo

### Tema 1: Reactive Forms — FormGroup y FormControl

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

Ya confirmas, con un `FormGroup` evaluado directamente sin renderizar HTML, que cada validador reporta su clave de error específica. El siguiente tema confirma con `fakeAsync`/`tick` el estado `PENDING` real que Angular gestiona mientras un validador asíncrono resuelve. Fuentes oficiales: [Angular — Reactive forms](https://angular.dev/guide/forms/reactive-forms).

**Errores comunes:** testear un `FormGroup` únicamente a través de renderizar su template y simular eventos del DOM, perdiendo la ventaja real de una prueba unitaria directa y más rápida; mostrar un único mensaje de error genérico en vez de consultar la clave específica del validador que falló.

**Cuándo no usarlo:** para un formulario de un único campo sin ninguna regla de validación cruzada ni necesidad seria de testing (Tema 4), la sobrecarga de declarar un `FormGroup` completo puede no justificarse frente a `ngModel`.

**Transferencia al proyecto integrador «Centro de control logístico»:** Construye el formulario de asignación con controles tipados para guía y conductor. Prueba campos vacíos y una selección válida; solo el segundo caso debe generar el comando de asignación.

### Tema 2: Validadores asíncronos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `fakeAsync`/`tick`, que un control con un validador asíncrono real permanece en estado `PENDING` mientras la petición simulada está en curso, y se resuelve a `VALID` o `INVALID` exactamente cuando el Observable emite.

**Conocimiento previo:** Tema 1 de este módulo; RxJS básico (`Observable`, `map`, `delay`).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En un formulario de registro, mostrar "verificando disponibilidad..." mientras se consulta si un email ya existe (en vez de dejar el formulario en un estado ambiguo) depende de que el estado `PENDING` de Angular se gestione correctamente; confirmar esto con un test real que controla el tiempo (`tick`) es más confiable que confiar en una revisión manual en el navegador.

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

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-async --standalone --skip-git --defaults`), crea `src/app/email-disponible.validator.ts`:

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

Confirma el ciclo `VALID → PENDING → INVALID/VALID` con `fakeAsync`/`tick`, controlando el tiempo de forma determinista:

```ts
// src/app/email-disponible.validator.spec.ts
import { fakeAsync, tick } from '@angular/core/testing';
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
  it('el control queda PENDING de inmediato, y se resuelve a INVALID tras 300ms si el email existe', fakeAsync(() => {
    const control = new FormControl('ocupado@example.com', {
      nonNullable: true,
      asyncValidators: [emailDisponibleValidator(new UsuariosServiceSimulado())],
    });

    expect(control.status).toBe('PENDING');

    tick(300);

    expect(control.status).toBe('INVALID');
    expect(control.errors?.['emailOcupado']).toBe(true);
  }));

  it('se resuelve a VALID si el email no existe', fakeAsync(() => {
    const control = new FormControl('libre@example.com', {
      nonNullable: true,
      asyncValidators: [emailDisponibleValidator(new UsuariosServiceSimulado())],
    });

    tick(300);

    expect(control.status).toBe('VALID');
  }));
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; `control.status` es literalmente `'PENDING'` de forma síncrona inmediatamente después de crear el control (antes de que `tick(300)` avance el reloj simulado), confirmando que Angular gestiona ese estado automáticamente mientras el Observable del validador asíncrono no ha emitido todavía.

**Fallo deliberado:** cambia `tick(300)` por `tick(100)` (menos que el `delay(300)` real del servicio simulado) y ejecuta de nuevo el primer test. FALLA porque `control.status` sigue siendo `'PENDING'` en vez de `'INVALID'` — diagnosticando que el tiempo simulado avanzado por `tick()` debe igualar o superar el delay real del Observable para que la validación asíncrona efectivamente resuelva. Restaura `tick(300)` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un validador síncrono (`Validators.email`) al mismo control y confirma con un test que Angular NO invoca el validador asíncrono si el síncrono ya falló (verifica que `emailExiste` de un espía no se llamó).
2. Documenta, en un comentario, por qué `fakeAsync`/`tick` es preferible a `setTimeout` real con un test asíncrono (`async`/`await`) para verificar temporización exacta de forma determinista.
3. Escribe un test que confirme que dos validaciones asíncronas consecutivas y rápidas (simulando teclas presionadas rápidamente) no dejan el control en un estado inconsistente al resolver fuera de orden.
4. Escribe de memoria (sin mirar) un `AsyncValidatorFn` y un test con `fakeAsync`/`tick` que confirme el ciclo `PENDING → INVALID`. Compara después contra el patrón del Paso 4.

**Pista:** `control.status === 'PENDING'` es la aserción clave que demuestra que el estado se está gestionando correctamente; olvidar verificarlo (y solo comprobar el resultado final) deja sin probar la parte de la experiencia de usuario que muestra el indicador de "verificando...".

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con la función real de `@angular/core/testing` que avanza el reloj simulado dentro de una zona `fakeAsync`:

```ts
____(300);
expect(control.status).toBe('INVALID');
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `AsyncValidatorFn` y un test `fakeAsync` que confirme el estado `PENDING` inmediato y la resolución tras `tick`. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con `fakeAsync`/`tick`, el ciclo completo de estado `VALID → PENDING → INVALID/VALID` que Angular gestiona automáticamente para validadores asíncronos. El siguiente tema confirma con `push`/`removeAt` reales que un `FormArray` crece y decrece dinámicamente, con validación independiente por control. Fuentes oficiales: [Angular — Async validators](https://angular.dev/guide/forms/reactive-forms#async-validators).

**Errores comunes:** verificar solo el resultado final de una validación asíncrona sin confirmar el estado `PENDING` intermedio, dejando sin probar el indicador visual de carga; usar `setTimeout` real en un test en vez de `fakeAsync`/`tick`, haciendo la prueba lenta e indeterminista.

**Cuándo no usarlo:** para una validación que puede resolverse instantáneamente con datos ya disponibles en el cliente (sin ninguna consulta externa real), un validador síncrono normal es más simple y no introduce ningún estado `PENDING` innecesario.

**Transferencia al proyecto integrador «Centro de control logístico»:** Valida disponibilidad del conductor mediante una consulta cancelable. Escribe dos identificadores seguidos y devuelve las respuestas al revés; el formulario debe conservar la validez correspondiente al último valor.

### Tema 3: FormArray para campos dinámicos

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

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-arrays --standalone --skip-git --defaults`), crea `src/app/telefonos-form.model.ts`:

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

### Tema 4: Template-driven forms — cuándo siguen siendo válidos

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

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-ngmodel --standalone --skip-git --defaults`), crea `src/app/busqueda-template.component.ts`:

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
3. Reproduce el error `NG8002` real (Paso 4) y documenta, con tus propias palabras, en qué se diferencia de los errores `NG0203`/`NG0304`/`NullInjectorError` de módulos anteriores (todos ocurren en tiempo distinto: compilación de plantilla vs. tiempo de ejecución).
4. Escribe de memoria (sin mirar) un componente standalone con `[(ngModel)]`, sus `imports`, y un test que simule un evento `input` real. Compara después contra el patrón del Paso 4.

**Pista:** un test que simplemente asigna `fixture.componentInstance.busqueda = 'Angular'` y verifica que el input lo refleja prueba la dirección componente → DOM; despachar un evento `input` real prueba la dirección DOM → componente — ambas direcciones deben probarse para confirmar la sincronización bidireccional completa que `ngModel` promete.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el módulo real de `@angular/forms` que debe importarse para que `[(ngModel)]` funcione en un componente standalone:

```ts
imports: [____],
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un componente standalone con `[(ngModel)]` correctamente configurado y un test que confirme la sincronización DOM → componente con un evento `input` real. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya confirmas, con un componente renderizado y un evento `input` real del DOM, que `[(ngModel)]` sincroniza en ambas direcciones, y reproduces el error real `NG8002` que ocurre al olvidar `FormsModule`. Con esto cierras el módulo de formularios: `FormGroup` testeado sin DOM (Tema 1), validación asíncrona con `PENDING` real (Tema 2), `FormArray` dinámico (Tema 3) y `ngModel` para casos triviales (Tema 4). El siguiente módulo aplica estos formularios a peticiones HTTP reales con `HttpClient`. Fuentes oficiales: [Angular — Template-driven forms](https://angular.dev/guide/forms/template-driven-forms).

**Errores comunes:** usar `ngModel` para un formulario con validación cruzada o arrays dinámicos, perdiendo la robustez y testabilidad de Reactive Forms sin necesidad real; olvidar `FormsModule` en un componente standalone y interpretar erróneamente el `NG8002` resultante como un bug del propio binding en vez de un import faltante.

**Cuándo no usarlo:** para cualquier formulario con más de un par de campos, o con cualquier necesidad de validación cruzada, arrays dinámicos, o testing serio del comportamiento sin renderizar HTML, Reactive Forms (Temas 1-3) es la opción más predecible y mantenible.

---

**Transferencia al proyecto integrador «Centro de control logístico»:** Usa un formulario simple para la preferencia de densidad del panel. Comprueba guardado y restauración, y documenta por qué el formulario de asignación conserva Reactive Forms para sus reglas entre campos.

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

**Verificación:** el laboratorio se considera exitoso si cada validador muestra su mensaje de error específico correspondiente, si el validador asíncrono correctamente marca el control como `pending` mientras verifica, y si el `FormArray` permite agregar y quitar teléfonos dinámicamente sin errores.

**Errores comunes y soluciones**

- **Mostrar un único mensaje de error genérico en vez de uno específico por validador.** Verifica el objeto `errors` específico de cada control para identificar exactamente cuál validador falló.
- **Disparar un validador asíncrono sin debounce.** Combina con `debounceTime` (Módulo 6) para no saturar el servidor con verificaciones en cada tecla presionada.
- **Usar template-driven forms para un formulario con validación cruzada compleja.** Migra a Reactive Forms para cualquier cosa más allá de lo más simple.

---
