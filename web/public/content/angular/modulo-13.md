# Módulo 13: Proyecto integrador — aplicación standalone completa


## Aprende construyendo

Cada tema verifica su garantía con pruebas de integración reales: `RouterTestingHarness` oficial de Angular navegando rutas realmente protegidas, la identidad singleton real de un store inyectado en dos componentes distintos, y `HttpTestingController` real interceptando la petición HTTP genuina de `TareasStore`.


### Tema 1: Estructura del proyecto integrador · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con RouterTestingHarness (la utilidad oficial de test de router de Angular) navegando realmente entre rutas, que la separación tareas/ / auth/ funciona como puntos de integración explícitos: el guard de auth/ bloquea o permite el acceso a las rutas…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con RouterTestingHarness (la utilidad oficial de test de router de Angular) navegando realmente entre rutas, que la separación tareas/ / auth/ funciona como puntos de integración explícitos: el guard de auth/ bloquea o permite el acceso a las rutas de tareas/ según el estado real de sesión.**

#### ► LA ANALOGÍA
**Conceptos clave:** organización por feature, separación entre `tareas/` y `auth/`, `RouterTestingHarness`.

Siguiendo el principio de organización por feature estudiado en el Módulo 8, el proyecto integrador se estructura en dos features principales claramente separadas: `tareas/`, que agrupa todo lo relacionado con la gestión de tareas (`tarea-lista.ts` para listar, `tarea-detalle.ts` para ver/editar una tarea individual, `tareas.store.ts` como store centralizado de estado, y `tareas.routes.ts` con las rutas específicas de esta feature), y `auth/`, que agrupa todo lo relacionado con autenticación (`auth.guard.ts` como guard funcional de protección de rutas, `auth.interceptor.ts` como interceptor de autenticación HTTP, y `auth.service.ts` como servicio de estado de sesión).

`app.routes.ts` y `app.config.ts` permanecen en la raíz de `src/app/`, actuando como el punto de composición donde se ensamblan las rutas y providers de cada feature individual (mediante `loadChildren` o composición directa de arreglos de rutas, Módulo 4), sin que la raíz de la aplicación necesite conocer los detalles internos de implementación de cada feature, solo su punto de integración público (las rutas que expone, los providers globales que requiere).

Esta separación clara entre `tareas/` y `auth/` refleja además una separación de responsabilidades a nivel de dominio: `auth/` se preocupa exclusivamente por quién es el usuario actual y si tiene permiso para acceder a ciertas rutas, mientras que `tareas/` se preocupa exclusivamente por la lógica de negocio de gestión de tareas en sí, comunicándose entre sí solo a través de puntos de integración explícitos (el guard consultando el estado de autenticación, el interceptor agregando el token a las peticiones de tareas), sin que la lógica de tareas necesite conocer los detalles internos de cómo funciona la autenticación.

**Analogía:** la estructura del proyecto integrador es como un edificio con departamentos claramente delimitados (tareas, autenticación), cada uno con su propia responsabilidad interna bien definida, comunicándose entre sí únicamente a través de puertas y protocolos explícitos (el guard, el interceptor), sin que un departamento necesite conocer el funcionamiento interno completo del otro.

**Diagrama:**

```
┌── src/app/tareas/ ──────────────────┐   ┌── src/app/auth/ ─────────────────┐
│  tarea-lista.ts                     │   │  auth.guard.ts                   │
│  tarea-detalle.ts                   │   │  auth.interceptor.ts             │
│  tareas.store.ts  (signals+computed)│   │  auth.service.ts                 │
│  tareas.routes.ts                   │   └───────────────────────────────────┘
└──────────────────────────────────────┘
┌── src/app/ (raiz) ───────────────────┐
│  app.routes.ts   (compone ambas)     │
│  app.config.ts                       │
└───────────────────────────────────────┘
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar podrás confirmar, con `RouterTestingHarness` (la utilidad oficial de test de router de Angular) navegando realmente entre rutas, que la separación `tareas/` / `auth/` funciona como puntos de integración explícitos: el guard de `auth/` bloquea o permite el acceso a las rutas de `tareas/` según el estado real de sesión.

**Conocimiento previo:** Módulo 4 de este track (routing y guards); Módulo 8 (organización por feature).

</details>

### Tema 2: Integrando routing, store y formularios · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, inyectando TareasStore desde dos componentes distintos dentro del mismo TestBed, que Angular entrega la MISMA instancia singleton a ambos (gracias a providedIn: 'root'), garantizando que ambos vean siempre el mismo estado consistente sin sincronizac…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, inyectando TareasStore desde dos componentes distintos dentro del mismo TestBed, que Angular entrega la MISMA instancia singleton a ambos (gracias a providedIn: 'root'), garantizando que ambos vean siempre el mismo estado consistente sin sincronización manual.**

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  G["auth.guard.ts CanActivateFn"] -->|protege| R["tareas.routes.ts loadComponent lazy"]
  S["tareas.store.ts"] -->|consumido por| L["tarea-lista.ts"]
  S -->|consumido por| D["tarea-detalle.ts"]
  F["formulario reactivo"] -->|store.metodoPublico| S
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  G["auth.guard.ts CanActivateFn"] -->|protege| R["tareas.routes.ts loadComponent lazy"]
  S["tareas.store.ts"] -->|consumido por| L["tarea-lista.ts"]
  S -->|consumido por| D["tarea-detalle.ts"]
  F["formulario reactivo"] -->|store.metodoPublico| S
```

```bash
mkdir -p src/app/tareas
```

```ts
// src/app/tareas/tareas.store.ts
import { Injectable, signal } from '@angular/core';

export interface Tarea { id: number; titulo: string; completada: boolean; }

@Injectable({ providedIn: 'root' })
export class TareasStore {
  private tareas = signal<Tarea[]>([]);
  todas = this.tareas.asReadonly();

  agregar(titulo: string) {
    this.tareas.update((actuales) => [...actuales, { id: actuales.length + 1, titulo, completada: false }]);
  }
}
```

```ts
// src/app/tareas/tareas-store-compartido.spec.ts
import { TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import { TareasStore } from './tareas.store';

@Component({ selector: 'app-lista', standalone: true, template: `` })
class ListaComponent {
  store = inject(TareasStore);
}

@Component({ selector: 'app-detalle', standalone: true, template: `` })
class DetalleComponent {
  store = inject(TareasStore);
}

describe('TareasStore como singleton compartido', () => {
  it('dos componentes distintos reciben la MISMA instancia del store', () => {
    TestBed.configureTestingModule({ imports: [ListaComponent, DetalleComponent] });

    const fixtureLista = TestBed.createComponent(ListaComponent);
    const fixtureDetalle = TestBed.createComponent(DetalleComponent);

    expect(fixtureLista.componentInstance.store).toBe(fixtureDetalle.componentInstance.store);
  });

  it('una actualizacion desde un componente se refleja en el otro sin sincronizacion manual', () => {
    TestBed.configureTestingModule({ imports: [ListaComponent, DetalleComponent] });

    const fixtureLista = TestBed.createComponent(ListaComponent);
    const fixtureDetalle = TestBed.createComponent(DetalleComponent);

    fixtureDetalle.componentInstance.store.agregar('Revisar entrega PED-001');

    expect(fixtureLista.componentInstance.store.todas()).toHaveLength(1);
    expect(fixtureLista.componentInstance.store.todas()[0].titulo).toBe('Revisar entrega PED-001');
  });
});
```

```bash
npx ng test --watch=false
```

```ts
@Injectable({ providedIn: '____' })
export class TareasStore { /* ... */ }
```

</details>

### Tema 3: TareasStore — combinando signals, computed y HttpClient · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con HttpTestingController real (la utilidad oficial de Angular para interceptar peticiones HTTP en tests), que TareasStore.cargar() realiza realmente la petición GET esperada y que pendientes deriva correctamente su valor mediante computed() a parti…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con HttpTestingController real (la utilidad oficial de Angular para interceptar peticiones HTTP en tests), que TareasStore.cargar() realiza realmente la petición GET esperada y que pendientes deriva correctamente su valor mediante computed() a partir de los datos recibidos.**

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar podrás confirmar, con `HttpTestingController` real (la utilidad oficial de Angular para interceptar peticiones HTTP en tests), que `TareasStore.cargar()` realiza realmente la petición GET esperada y que `pendientes` deriva correctamente su valor mediante `computed()` a partir de los datos recibidos.

**Conocimiento previo:** Módulo 7 de este track (HttpClient); Temas 1-2 de este módulo.

</details>
