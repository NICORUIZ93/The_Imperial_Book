# Módulo 3: Servicios e inyección de dependencias


## Aprende construyendo

Cada tema verifica su garantía con comparaciones reales de identidad de objeto (`toBe`) y errores genuinos de Angular: el singleton real de `providedIn: 'root'`, el error real `NG0203` al usar `inject()` fuera de contexto, la jerarquía real de inyectores con overrides a nivel de componente, y `NG0201` (*No provider found*) real al faltar un `InjectionToken`.


### Tema 1: @Injectable y providedIn: root · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con una comparación real de identidad de objeto (toBe), que providedIn: 'root' garantiza una única instancia singleton compartida entre cualquier número de componentes que inyecten el mismo servicio.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A["ComponenteA inject(TareasService)"] --> S["UNA instancia raiz (providedIn: root)"]
  B["ComponenteB inject(TareasService)"] --> S
  C["ComponenteC inject(TareasService)"] --> S
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```ts
@Injectable({ providedIn: 'root' }) // singleton de toda la app, tree-shakeable
export class TareasService {
  private tareas = signal<Tarea[]>([]);
  readonly lista = this.tareas.asReadonly();
  agregar(tarea: Tarea) { this.tareas.update(l => [...l, tarea]); }
}
```

```mermaid
flowchart LR
  A["ComponenteA inject(TareasService)"] --> S["UNA instancia raiz (providedIn: root)"]
  B["ComponenteB inject(TareasService)"] --> S
  C["ComponenteC inject(TareasService)"] --> S
```

```bash
mkdir demo-di
cd demo-di
npx -y @angular/cli@22 new . --standalone --style=css --routing=false --skip-git --defaults
```

```ts
// src/app/tareas.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private tareas = signal<string[]>([]);
  readonly lista = this.tareas.asReadonly();
  agregar(titulo: string) {
    this.tareas.update((l) => [...l, titulo]);
  }
}
```

```ts
// src/app/tareas.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import { TareasService } from './tareas.service';

@Component({ selector: 'app-a', standalone: true, template: `` })
class ComponenteA {
  servicio = inject(TareasService);
}

@Component({ selector: 'app-b', standalone: true, template: `` })
class ComponenteB {
  servicio = inject(TareasService);
}

describe('providedIn: root garantiza un singleton real', () => {
  it('dos componentes distintos reciben la MISMA instancia del servicio', () => {
    TestBed.configureTestingModule({ imports: [ComponenteA, ComponenteB] });

    const fixtureA = TestBed.createComponent(ComponenteA);
    const fixtureB = TestBed.createComponent(ComponenteB);

    expect(fixtureA.componentInstance.servicio).toBe(fixtureB.componentInstance.servicio);
  });

  it('un cambio desde un componente es visible desde el otro, sin sincronizacion manual', () => {
    TestBed.configureTestingModule({ imports: [ComponenteA, ComponenteB] });

    const fixtureA = TestBed.createComponent(ComponenteA);
    const fixtureB = TestBed.createComponent(ComponenteB);

    fixtureA.componentInstance.servicio.agregar('PED-001');

    expect(fixtureB.componentInstance.servicio.lista()).toEqual(['PED-001']);
  });
});
```

```bash
npx ng test --watch=false
```

</details>

### Tema 2: inject() frente a inyección por constructor · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con el error real NG0203 de Angular, que inject() requiere un contexto de inyección activo, mientras la inyección por constructor está limitada exclusivamente a clases con constructor — la razón real por la que inject() es la única opción viable en…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con el error real NG0203 de Angular, que inject() requiere un contexto de inyección activo, mientras la inyección por constructor está limitada exclusivamente a clases con constructor — la razón real por la que inject() es la única opción viable en guards e interceptores funcionales.**

#### ► REGLA PRÁCTICA
Usa inyección por constructor cuando ya estás dentro de una clase (es la opción más explícita); usa `inject()` cuando necesites inyectar fuera de un constructor —campo de clase, guard funcional, interceptor funcional— porque ahí la inyección por constructor simplemente no existe como opción. Fuera de un contexto de inyección válido, `inject()` falla con NG0203; no lo llames desde una función ordinaria.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── constructor(private s: Servicio) ┐  SOLO dentro de una clase con constructor
└──────────────────────────────────────┘  siempre tiene contexto valido (Angular lo provee)
┌── inject(Servicio) ─────────────────┐  funciona en constructor, campo de clase,
└──────────────────────────────────────┘  guard funcional... pero fuera de eso: NG0203
```

```ts
@Component({ /* ... */ })
export class ListaTareas {
  private servicio = inject(TareasService); // más conciso, funciona en cualquier contexto de inyección
  tareas = this.servicio.lista;
}
```

```bash
mkdir -p src/app
```

```ts
// src/app/inject-fuera-de-contexto.ts
import { inject } from '@angular/core';
import { TareasService } from './tareas.service';

// funcion ORDINARIA, sin contexto de inyeccion: NO es un guard, NO es un constructor
export function obtenerServicioFueraDeContexto() {
  return inject(TareasService);
}
```

```ts
// src/app/inject-fuera-de-contexto.spec.ts
import { obtenerServicioFueraDeContexto } from './inject-fuera-de-contexto';

describe('inject() fuera de contexto de inyeccion', () => {
  it('lanza el error real NG0203 al invocarse sin contexto valido', () => {
    expect(() => obtenerServicioFueraDeContexto()).toThrowError(/NG0203|injection context/i);
  });
});
```

```bash
npx ng test --watch=false
```

</details>

### Tema 3: Jerarquía de inyectores · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con una comparación real de identidad de objeto, que un provider registrado a nivel de componente produce una instancia DISTINTA de la instancia raíz, verificando en código la regla real de resolución jerárquica: el nivel más cercano al punto de iny…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con una comparación real de identidad de objeto, que un provider registrado a nivel de componente produce una instancia DISTINTA de la instancia raíz, verificando en código la regla real de resolución jerárquica: el nivel más cercano al punto de inyección gana.**

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
  R["Root (toda la app, providedIn: root)"] --> Ro["Inyector de Ruta (providers en una Route)"]
  Ro --> C["Inyector de Componente (providers en @Component)"]
  C -.->|"resuelve buscando desde el mas cercano"| R
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir -p src/app
```

```ts
// src/app/contador-intentos.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ContadorIntentosService {
  private intentos = signal(0);
  readonly valor = this.intentos.asReadonly();
  incrementar() { this.intentos.update((v) => v + 1); }
}
```

```ts
// src/app/contador-intentos.spec.ts
import { TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import { ContadorIntentosService } from './contador-intentos.service';

@Component({ selector: 'app-sin-override', standalone: true, template: `` })
class ComponenteSinOverride {
  contador = inject(ContadorIntentosService);
}

@Component({
  selector: 'app-con-override',
  standalone: true,
  providers: [ContadorIntentosService], // override LOCAL: gana sobre la raiz
  template: ``,
})
class ComponenteConOverride {
  contador = inject(ContadorIntentosService);
}

describe('Jerarquia real de inyectores: el mas cercano gana', () => {
  it('un componente SIN provider local recibe la instancia raiz compartida', () => {
    TestBed.configureTestingModule({ imports: [ComponenteSinOverride] });
    const raiz = TestBed.inject(ContadorIntentosService);
    const fixture = TestBed.createComponent(ComponenteSinOverride);

    expect(fixture.componentInstance.contador).toBe(raiz);
  });

  it('un componente CON provider local recibe una instancia DISTINTA de la raiz', () => {
    TestBed.configureTestingModule({ imports: [ComponenteConOverride] });
    const raiz = TestBed.inject(ContadorIntentosService);
    const fixture = TestBed.createComponent(ComponenteConOverride);

    expect(fixture.componentInstance.contador).not.toBe(raiz);
  });
});
```

```bash
npx ng test --watch=false
```

```ts
@Component({ selector: 'app-con-override', ____: [ContadorIntentosService], template: `` })
```

</details>

### Tema 4: Tokens de inyección y decoradores de resolución · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con el error real NG0201 de Angular, que un InjectionToken sin ningún provider registrado produce un fallo explícito al inyectarlo, y que @Optional() cambia genuinamente ese comportamiento a null en vez de un error.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  T["new InjectionToken(API_URL)"] -->|"SIN provider"| E["NG0201 real"]
  T -->|"CON provider useValue"| V["valor inyectable real"]
  T -->|"inject(TOKEN, optional:true)"| N["null, sin error"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  T["new InjectionToken(API_URL)"] -->|"SIN provider"| E["NG0201 real"]
  T -->|"CON provider useValue"| V["valor inyectable real"]
  T -->|"inject(TOKEN, optional:true)"| N["null, sin error"]
```

```ts
export const API_URL = new InjectionToken<string>('API_URL');
// en la configuración de la app:
providers: [{ provide: API_URL, useValue: 'https://api.miapp.com' }]
// en cualquier servicio/componente:
private apiUrl = inject(API_URL);
```

```bash
mkdir -p src/app
```

```ts
// src/app/api-url.token.ts
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');
```

```ts
// src/app/api-url.spec.ts
import { TestBed } from '@angular/core/testing';
import { Component, inject, Optional } from '@angular/core';
import { API_URL } from './api-url.token';

@Component({ selector: 'app-config-obligatoria', standalone: true, template: `` })
class ConfigObligatoriaComponent {
  apiUrl = inject(API_URL); // SIN @Optional: obligatorio
}

@Component({ selector: 'app-config-opcional', standalone: true, template: `` })
class ConfigOpcionalComponent {
  apiUrl = inject(API_URL, { optional: true }); // CON optional: no lanza error
}

describe('InjectionToken sin provider (NG0201 real)', () => {
  it('inyectar API_URL sin provider registrado lanza NG0201 real', () => {
    TestBed.configureTestingModule({ imports: [ConfigObligatoriaComponent] });

    expect(() => TestBed.createComponent(ConfigObligatoriaComponent)).toThrowError(/NG0201/);
  });

  it('con optional:true, la ausencia de provider resuelve a null, sin error', () => {
    TestBed.configureTestingModule({ imports: [ConfigOpcionalComponent] });

    const fixture = TestBed.createComponent(ConfigOpcionalComponent);
    expect(fixture.componentInstance.apiUrl).toBeNull();
  });
});
```

```bash
npx ng test --watch=false
```

</details>
