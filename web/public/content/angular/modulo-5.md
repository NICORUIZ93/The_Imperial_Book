# Módulo 5: Formularios reactivos y template-driven


## Aprende construyendo


### Tema 1: Reactive Forms — FormGroup y FormControl · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con un FormGroup real evaluado directamente en un test unitario (sin renderizar NINGÚN template HTML), que cada validador reporta su error específico exacto — la ventaja de testabilidad que la teoría de este tema describe, demostrada en código.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
npx -y @angular/cli@22 new demo-forms --standalone --skip-git --defaults
cd demo-forms
mkdir -p src/app
```

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

</details>

### Tema 2: Validadores asíncronos · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con el reloj simulado de Vitest (vi.useFakeTimers() y vi.advanceTimersByTime()), que un control con un validador asíncrono real permanece en estado PENDING mientras la petición simulada está en curso, y se resuelve a VALID o INVALID exactamente cuan…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con el reloj simulado de Vitest (vi.useFakeTimers() y vi.advanceTimersByTime()), que un control con un validador asíncrono real permanece en estado PENDING mientras la petición simulada está en curso, y se resuelve a VALID o INVALID exactamente cuando el Observable emite.**

#### ► LA ANALOGÍA
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

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
setValue('ocupado@x.com')
        │
        ▼
┌───────────────┐   Observable en curso   ┌───────────────┐   emite valor   ┌────────────────────┐
│ status: VALID  │ ───────────────────────▶│ status: PENDING│ ───────────────▶│ status: INVALID/VALID│
└───────────────┘                          └───────────────┘                 └────────────────────┘
```

```ts
function emailDisponibleValidator(servicio: UsuariosService): AsyncValidatorFn {
  return (control) => servicio.emailExiste(control.value).pipe(
    map(existe => existe ? { emailOcupado: true } : null)
  );
}
new FormControl('', { asyncValidators: [emailDisponibleValidator(servicio)] });
```

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

</details>

### Tema 3: FormArray para campos dinámicos · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con push/removeAt reales sobre un FormArray, que el número de controles crece y decrece dinámicamente, y que cada control agregado valida de forma completamente independiente de los demás.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
FormArray inicial: [ tel0 ]
        │ push(new FormControl(''))
        ▼
FormArray: [ tel0, tel1 ]
        │ removeAt(0)
        ▼
FormArray: [ tel1 ]   (tel1 conserva su propio estado de validacion)
```

```ts
form = new FormGroup({ telefonos: new FormArray([new FormControl('')]) });
agregarTelefono() {
  (this.form.controls.telefonos as FormArray).push(new FormControl(''));
}
```

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

</details>

### Tema 4: Template-driven forms — cuándo siguen siendo válidos · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con un componente real renderizado y [(ngModel)], que escribir en un <input> actualiza la propiedad del componente en ambas direcciones, y reproducir el error real de compilación de plantilla que ocurre al olvidar importar FormsModule.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌────────────────┐   usuario escribe   ┌───────────────────┐
│  <input>  (DOM)  │ ───────────────────▶│ componente.busqueda│
└────────────────┘                       └───────────────────┘
       ▲                                          │
       │            componente.busqueda = 'x'     │
       └──────────────────────────────────────────┘
```

```html
<!-- template-driven: apropiado solo para casos muy simples -->
<input [(ngModel)]="busqueda" />
```

```
Reactive Forms: estructura explícita en TypeScript, testeable sin DOM,
                 apropiado para validación cruzada, arrays dinámicos, testing serio
```

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

</details>

### Tema 5: Signal Forms: formularios basados en signals (Angular 22) · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

</details>
