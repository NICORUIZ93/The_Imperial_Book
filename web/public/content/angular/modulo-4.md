# Módulo 4: Routing y navegación


## Aprende construyendo

Cada tema verifica su garantía con navegación real (`RouterTestingHarness` oficial de Angular): el orden real del array de rutas, la invocación directa de un guard como función pura, un espía real confirmando que `loadComponent` no descarga hasta navegar, y el input binding real de parámetros de ruta.

### Tema 1: Router config con rutas standalone

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con navegación real vía `RouterTestingHarness`, que el orden del array `Routes` determina qué ruta se activa: una ruta comodín `**` colocada antes de una ruta específica la intercepta indebidamente, un bug real y reproducible, no solo una regla teórica.

**Conocimiento previo:** Módulo 3 de este track (inyección de dependencias); Módulo 8 (standalone y `provideRouter`).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En una app de entregas que separa inicio, detalle y administración, el orden de evaluación de rutas es un contrato real del router: una ruta comodín mal ubicada intercepta silenciosamente URLs válidas, un bug verificable con navegación real, no solo con inspección visual del array.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `Routes`, `provideRouter`, configuración declarativa de navegación.

La configuración de rutas en Angular moderno se declara como un array plano de objetos `Routes` (`export const routes: Routes = [...]`), cada uno asociando un `path` (el segmento de URL) con un `component` a renderizar (o, para lazy loading, una función `loadComponent`, Tema 3), y se registra en la aplicación mediante `provideRouter(routes)` dentro del array de `providers` de la configuración de la aplicación (`app.config.ts`), reemplazando el antiguo patrón de `RouterModule.forRoot(routes)` que requería un `NgModule` dedicado exclusivamente al routing.

Cada ruta puede además declarar `canActivate` (un array de guards que deben aprobar el acceso antes de activar la ruta, Tema 2), y una ruta con `path: "**"` (comodín que coincide con cualquier URL no capturada por ninguna ruta anterior) combinada con `redirectTo` gestiona el caso de una URL no reconocida, redirigiendo típicamente hacia una página de inicio o una vista de error 404 dedicada. El orden de las rutas en el array importa: Angular evalúa las rutas en el orden declarado, activando la primera que coincida con la URL actual, por lo que la ruta comodín `**` debe declararse siempre al final del array, después de todas las rutas específicas, para no interceptar accidentalmente URLs que sí deberían coincidir con una ruta más específica declarada después de ella.

Esta configuración declarativa centralizada de todas las rutas de la aplicación en un único array (o en varios arrays organizados por feature, combinados mediante rutas hijas anidadas) proporciona una visión completa y auditable de toda la navegación posible de la aplicación en un solo lugar, facilitando razonar sobre qué vistas existen, cuáles están protegidas, y cuáles se cargan de forma perezosa, sin necesidad de rastrear esa información dispersa entre múltiples archivos de configuración de módulos como en el patrón histórico anterior a la adopción de standalone.

**Analogía:** la configuración de rutas es como el índice completo y centralizado de un edificio de oficinas, listando cada oficina disponible (cada ruta), quién tiene permiso de entrar a cada una (guards), y cuáles solo se abren y se acondicionan bajo demanda cuando alguien realmente solicita visitarlas (lazy loading), en vez de mantener todas las oficinas completamente acondicionadas y listas desde el primer momento aunque nadie las visite nunca.

**Diagrama — orden de evaluación del array `Routes`:**

```
URL entrante: /tareas
     │
     ▼
┌─────────────────────┐   NO coincide   ┌──────────────────────┐
│ 1. path: ''          │ ──────────────▶ │ 2. path: 'tareas'     │
└─────────────────────┘                  └──────────────────────┘
                                                    │ SÍ coincide
                                                    ▼
                                          ┌──────────────────────┐
                                          │ se activa TareasComp. │
                                          └──────────────────────┘
                                          (3. path:'**' NUNCA se evalúa
                                           porque ya hubo coincidencia)
```

**Código del ejemplo:**

```ts
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tareas', loadComponent: () => import('./tareas/lista').then(m => m.Lista) },
  { path: 'tareas/:id', loadComponent: () => import('./tareas/detalle').then(m => m.Detalle) },
  { path: 'admin', loadComponent: () => import('./admin/panel').then(m => m.Panel), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }, // siempre al final
];
```

#### Paso 4 · Demostración guiada desde cero

Parte de una carpeta vacía:

```bash
mkdir demo-routing
cd demo-routing
npx -y @angular/cli@22 new . --standalone --style=css --routing=true --skip-git --defaults
```

Crea `src/app/rutas-demo.ts` con dos configuraciones: una correcta (comodín al final) y una incorrecta (comodín primero):

```bash
mkdir -p src/app
```

```ts
// src/app/rutas-demo.ts
import { Routes, provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ selector: 'app-inicio', standalone: true, template: 'Inicio' })
export class InicioComponent {}

@Component({ selector: 'app-tareas', standalone: true, template: 'Lista de tareas' })
export class TareasComponent {}

@Component({ selector: 'app-404', standalone: true, template: 'No encontrado' })
export class NoEncontradoComponent {}

export const rutasCorrectas: Routes = [
  { path: '', component: InicioComponent },
  { path: 'tareas', component: TareasComponent },
  { path: '**', component: NoEncontradoComponent }, // AL FINAL, correcto
];

export const rutasIncorrectas: Routes = [
  { path: '**', component: NoEncontradoComponent }, // ANTES de las especificas, incorrecto
  { path: '', component: InicioComponent },
  { path: 'tareas', component: TareasComponent },
];
```

Confirma con navegación real (`RouterTestingHarness`, la utilidad oficial de test de router de Angular) que el orden del array determina realmente qué ruta se activa:

```ts
// src/app/rutas-demo.spec.ts
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { rutasCorrectas, rutasIncorrectas } from './rutas-demo';

describe('Orden real del array Routes', () => {
  it('con el comodin al final, /tareas SI activa TareasComponent', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(rutasCorrectas)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas');

    expect(harness.routeNativeElement?.textContent).toContain('Lista de tareas');
  });

  it('con el comodin PRIMERO, /tareas es interceptada por el comodin (bug real)', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(rutasIncorrectas)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tareas');

    expect(harness.routeNativeElement?.textContent).toContain('No encontrado'); // NO llega a TareasComponent
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; el primero confirma navegación REAL exitosa a `/tareas` con el comodín correctamente al final; el segundo confirma, con la MISMA navegación real, que colocar `**` primero intercepta indebidamente la URL `/tareas`, mostrando "No encontrado" en vez del componente correcto — el bug real y reproducible, no solo una advertencia teórica.

**Fallo deliberado:** en `rutasCorrectas`, mueve `{ path: '**', component: NoEncontradoComponent }` al principio del array (rompiendo el orden correcto) y ejecuta de nuevo el primer test. FALLA porque ahora `/tareas` también es interceptada por el comodín — diagnostica confirmando, con el mismo patrón exacto del segundo test, que el orden del array `Routes` es un contrato real de evaluación secuencial, no un detalle estético. Restaura el comodín al final antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega una tercera ruta específica y confirma con `RouterTestingHarness` que también navega correctamente con el comodín al final.
2. Documenta, en un comentario, por qué Angular evalúa las rutas en el orden EXACTO del array, en vez de buscar automáticamente la coincidencia "más específica" entre todas las rutas declaradas.
3. Escribe un test que confirme que una URL genuinamente inexistente (por ejemplo, `/ruta-que-no-existe`) SÍ es capturada correctamente por el comodín en `rutasCorrectas`.
4. Escribe de memoria (sin mirar) dos configuraciones de `Routes` (comodín al final vs al principio) y dos tests con `RouterTestingHarness` que confirmen el contraste real. Compara después contra el patrón del Paso 4.

**Pista:** `RouterTestingHarness.create()` seguido de `navigateByUrl(...)` ejecuta una navegación REAL del router de Angular — a diferencia de inspeccionar visualmente el array de rutas, esta prueba confirma el comportamiento real de resolución, incluyendo casos donde el orden produce resultados contraintuitivos.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el patrón de ruta que actúa como comodín, capturando cualquier URL no reconocida por rutas anteriores:

```ts
{ path: '____', redirectTo: '' }
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, dos configuraciones de `Routes` (correcta e incorrecta según el orden del comodín) y un test con `RouterTestingHarness` que confirme el contraste real. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con navegación real del router de Angular, que el orden del array `Routes` determina exactamente qué ruta se activa, y que un comodín mal ubicado produce un bug real y reproducible. El siguiente tema confirma, invocando un guard funcional directamente como función pura, la ventaja real de testabilidad que describe su prosa. **Evidencia:** entrega el resultado de ambos tests en verde, y la interceptación indebida que produce el fallo deliberado al mover el comodín al principio. Fuentes oficiales: [Angular — Routing](https://angular.dev/guide/routing), [Angular — Common router tasks](https://angular.dev/guide/routing/common-router-tasks).

**Errores comunes:** colocar la ruta comodín `**` antes de rutas específicas, interceptando URLs que deberían coincidir con una ruta más específica; asumir que Angular reordena automáticamente las rutas por especificidad, cuando en realidad respeta estrictamente el orden declarado.

**Cuándo no usarlo:** para una aplicación con una única ruta (sin necesidad de un mapa de navegación completo), la preocupación por el orden del array `Routes` no tiene ningún caso real que prevenir.

**Transferencia al proyecto integrador «Centro de control logístico»:** Define rutas para lista, detalle y asignación de entregas. Abre directamente una URL de detalle y comprueba que una guía inexistente presenta recuperación hacia la lista.

### Tema 2: Guards funcionales

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, invocando un guard funcional DIRECTAMENTE como una función pura (sin `TestBed.createComponent` ni navegación completa), la ventaja real de testabilidad que distingue a los guards funcionales de los guards de clase históricos.

**Conocimiento previo:** Tema 1 de este módulo; Módulo 3 de este track (`inject()` y contexto de inyección).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En una app de entregas, verificar que `authGuard` bloquea correctamente el acceso sin sesión no debería requerir levantar un router completo ni renderizar componentes; invocar el guard directamente como función, con un `AuthService` real inyectado vía `TestBed.runInInjectionContext`, es la prueba más simple y rápida posible.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `CanActivateFn`, protección de rutas, testabilidad.

Un guard funcional es simplemente una función que Angular invoca antes de activar una ruta, devolviendo `true` (permite la navegación), `false` (la bloquea) o una `UrlTree` (redirige hacia otra ruta en vez de bloquear silenciosamente, la opción más amigable para el usuario, que en vez de simplemente denegar el acceso lo redirige hacia una ubicación más apropiada, como una página de login).

```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaAutenticado() ? true : inject(Router).parseUrl("/login");
};
```

Este guard ilustra el patrón: usa `inject()` (Módulo 3) directamente dentro de la función, sin necesitar ninguna clase ni constructor, precisamente el contexto funcional donde `inject()` es indispensable.

Esta forma funcional reemplaza el patrón histórico de guards implementados como clases que implementan una interfaz específica (`CanActivate`), y ofrece una ventaja concreta de testabilidad: probar un guard funcional es simplemente invocar la función directamente con argumentos simulados y verificar su valor de retorno, sin necesidad de instanciar una clase completa mediante `TestBed` ni de simular su ciclo de vida de inyección de dependencias como clase, una prueba unitaria considerablemente más simple y directa (en el espíritu del Módulo 9 del track de JavaScript, donde funciones puras y simples son más fáciles de probar que estructuras con estado y dependencias complejas).

Encadenar múltiples guards en el array `canActivate` de una misma ruta (`canActivate: [authGuard, permisosGuard]`) permite componer verificaciones independientes: Angular evalúa cada guard en orden, y la navegación solo procede si todos aprueban; si cualquiera de ellos devuelve `false` o una `UrlTree`, la navegación se detiene (o se redirige) en ese punto, sin evaluar los guards restantes de la lista, un patrón de composición similar en espíritu al middleware de Express estudiado en el Módulo 4 del track de Node.js.

**Analogía:** un guard funcional es como un control de acceso independiente y simple en la entrada de una sala específica, que verifica una condición puntual (¿tiene la credencial correcta?) y decide si permite el paso, lo deniega, o redirige hacia otra sala más apropiada; ser una simple función (no una clase compleja) lo hace tan fácil de probar como verificar el resultado de cualquier función pura ante distintas entradas simuladas.

**Diagrama — decisión del guard:**

```
navegación → /admin
      │
      ▼
┌───────────────┐   false/UrlTree   ┌──────────────────┐
│  authGuard()   │ ─────────────────▶│ redirige a /login │
└───────────────┘                    └──────────────────┘
      │ true
      ▼
┌───────────────┐
│ ruta activada  │
└───────────────┘
```

**Código del ejemplo:**

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? true : router.parseUrl('/login');
};
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `demo-routing` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-guards --standalone --skip-git --defaults`), crea `src/app/auth.guard.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/auth.guard.ts
import { inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sesionActiva = signal(false);
  estaAutenticado = this.sesionActiva.asReadonly();
  iniciarSesion() { this.sesionActiva.set(true); }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? true : router.parseUrl('/login');
};
```

Confirma la ventaja real de testabilidad: invoca `authGuard` DIRECTAMENTE como función, sin ningún componente ni navegación completa, usando `TestBed.runInInjectionContext` para proveerle el contexto de inyección que necesita:

```ts
// src/app/auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { authGuard, AuthService } from './auth.guard';

describe('authGuard invocado directamente como funcion pura (sin componente ni router completo)', () => {
  it('SIN sesion, el guard devuelve una UrlTree hacia /login', () => {
    TestBed.configureTestingModule({});
    const injector = TestBed.inject(Injector);

    const resultado = TestBed.runInInjectionContext(injector, () =>
      authGuard({} as any, {} as any)
    );

    expect(resultado).not.toBe(true);
    expect((resultado as any).toString()).toContain('/login');
  });

  it('CON sesion activa, el guard devuelve true', () => {
    TestBed.configureTestingModule({});
    const injector = TestBed.inject(Injector);
    const auth = TestBed.inject(AuthService);
    auth.iniciarSesion();

    const resultado = TestBed.runInInjectionContext(injector, () =>
      authGuard({} as any, {} as any)
    );

    expect(resultado).toBe(true);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** ambos tests pasan; invocar `authGuard(...)` DIRECTAMENTE (sin `TestBed.createComponent`, sin `RouterTestingHarness`, sin renderizar ninguna vista) es suficiente para verificar su comportamiento completo — la ventaja real de testabilidad que la prosa describe, demostrada en código: menos infraestructura de test que un guard de clase equivalente hubiera requerido.

**Fallo deliberado:** cambia `return auth.estaAutenticado() ? true : router.parseUrl('/login');` por `return true;` (el mismo bug de seguridad simulado en el Tema 1 del Módulo 13) y ejecuta de nuevo el primer test. FALLA porque `resultado` ahora es `true` en vez de una `UrlTree` — diagnostica confirmando que la prueba directa del guard detecta el mismo fallo de seguridad real que una prueba de navegación completa detectaría, con considerablemente menos código de configuración. Restaura la verificación real antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo guard (`permisosGuard`) y confirma, invocándolo directamente, que ambos guards pueden probarse de forma completamente aislada entre sí.
2. Documenta, en un comentario, cuántas líneas de configuración de test ahorra invocar el guard directamente frente al patrón de `RouterTestingHarness` usado en el Tema 1 para probar el mismo comportamiento a través de navegación real.
3. Escribe un test que confirme el encadenamiento de guards: si `authGuard` devuelve una `UrlTree`, un segundo guard en la misma ruta nunca debería evaluarse (documenta esta garantía, ya que Angular la aplica internamente en el router real).
4. Escribe de memoria (sin mirar) un guard funcional y un test que lo invoque directamente con `TestBed.runInInjectionContext`. Compara después contra el patrón del Paso 4.

**Pista:** invocar un guard directamente como función es apropiado para probar SU lógica interna de forma aislada; usar `RouterTestingHarness` (Tema 1) sigue siendo necesario para confirmar que el guard está correctamente CONECTADO a la ruta real — ambos niveles de prueba son complementarios, no sustitutos uno del otro.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real de `TestBed` que provee un contexto de inyección explícito para invocar `inject()` fuera de un componente:

```ts
const resultado = TestBed.____(injector, () => authGuard({} as any, {} as any));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un guard funcional y un test que lo invoque directamente, confirmando tanto el bloqueo como el permiso. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, invocando un guard funcional directamente como función pura, la ventaja real de testabilidad que distingue a los guards funcionales de las clases guard históricas. El siguiente tema confirma con un espía real que `loadComponent` no descarga su chunk hasta que la navegación efectivamente ocurre. **Evidencia:** entrega el resultado de ambos tests en verde, y el resultado incorrecto (`true` sin verificación) que produce el fallo deliberado. Fuentes oficiales: [Angular — Router guards](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access).

**Errores comunes:** probar un guard funcional únicamente a través de navegación completa (`RouterTestingHarness`), perdiendo la ventaja real de una prueba unitaria directa y más rápida; olvidar que `inject()` dentro de un guard requiere un contexto de inyección, incluso al invocarlo directamente en un test.

**Cuándo no usarlo:** para un guard extremadamente simple sin ninguna dependencia inyectada (por ejemplo, uno que siempre devuelve `true`), la inversión de escribir un test dedicado puede no aportar ningún valor real de verificación.

**Transferencia al proyecto integrador «Centro de control logístico»:** Impide entrar al panel operativo sin sesión mediante un guard funcional. Prueba también una petición directa a la API: la autorización debe mantenerse aunque el navegador omita el guard.

### Tema 3: Lazy loading con loadComponent

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con un espía real envolviendo la función de importación dinámica, que `loadComponent` NO descarga su chunk hasta que la navegación hacia esa ruta específica efectivamente ocurre — el equivalente automatizable a inspeccionar la pestaña Network del navegador.

**Conocimiento previo:** Temas 1-2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En una app de entregas con un panel de administración usado solo por un subconjunto de usuarios, confirmar automáticamente (en un test, no solo revisando DevTools manualmente) que ese código NUNCA se descarga para usuarios que no navegan hacia `/admin` es la única forma confiable de prevenir una regresión futura donde alguien accidentalmente vuelve esa ruta "eager" de nuevo.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** carga bajo demanda de rutas, `import()` dinámico, reducción del bundle inicial.

`loadComponent: () => import("./tareas/lista").then(m => m.Lista)` usa `import()` dinámico (estudiado en profundidad en el Módulo 7 del track de JavaScript) para cargar el componente correspondiente a una ruta específica únicamente cuando el usuario navega efectivamente hacia esa ruta, en vez de incluir el código de todas las rutas posibles de la aplicación en el bundle inicial que se descarga al cargar la aplicación por primera vez. Verificar en la pestaña Network de las herramientas de desarrollador que el chunk correspondiente a una ruta con `loadComponent` solo se descarga en el momento exacto de navegar hacia ella (no antes, durante la carga inicial de la aplicación) confirma directamente que el lazy loading está funcionando como se espera.

Esta técnica tiene un impacto directo y medible en el tiempo de carga inicial percibido por el usuario, especialmente en aplicaciones con muchas rutas o con funcionalidades específicas (como un panel de administración usado solo por un subconjunto reducido de usuarios) que no todos los usuarios necesitan cargar en cada visita: un usuario que solo navega a la página de inicio de una aplicación con `loadComponent` en sus demás rutas nunca descarga el código de esas otras rutas durante esa sesión específica, reduciendo tanto el tiempo de descarga inicial como el tiempo de parseo y ejecución de JavaScript que el navegador debe realizar antes de que la aplicación se vuelva interactiva.

Combinar lazy loading de rutas con guards (Tema 2) en la misma ruta es perfectamente natural: `{path: "admin", loadComponent: ..., canActivate: [authGuard]}` evalúa primero el guard, y solo si aprueba la navegación, procede a descargar y renderizar el chunk correspondiente, evitando incluso el coste de descarga de un componente al que, de todas formas, el usuario no tendría acceso a ver si el guard lo hubiera rechazado.

**Analogía:** el lazy loading de rutas es como un servicio de streaming que descarga cada episodio de una serie únicamente cuando el espectador decide reproducirlo, en vez de descargar la temporada completa de antemano sin saber con certeza qué episodios específicos el espectador realmente llegará a ver.

**Diagrama — descarga bajo demanda:**

```
carga inicial de la app
      │
      ▼
┌─────────────┐        usuario navega a /admin        ┌───────────────────┐
│ bundle base  │ ─────────────────────────────────────▶│ se descarga chunk │
│ (sin admin)  │                                        │ admin.js recién   │
└─────────────┘                                         │ en este momento   │
                                                          └───────────────────┘
```

**Código del ejemplo:**

```ts
{ path: 'tareas', loadComponent: () => import('./tareas/lista').then(m => m.Lista) }
// verificar en DevTools → Network: el chunk de "lista" solo se descarga al navegar a /tareas
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-lazy --standalone --skip-git --defaults`), crea `src/app/lazy-demo.ts` con un componente lazy y un espía que envuelve la función de importación dinámica, para confirmar programáticamente (sin depender de leer la pestaña Network a simple vista) exactamente cuándo Angular la invoca:

```bash
mkdir -p src/app
```

```ts
// src/app/lazy-demo.ts
import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({ selector: 'app-inicio-lazy', standalone: true, template: 'Inicio' })
export class InicioLazyComponent {}

@Component({ selector: 'app-admin-lazy', standalone: true, template: 'Panel admin' })
export class AdminLazyComponent {}

export function crearRutasLazy(cargarAdmin: () => Promise<{ default: any } | any>): Routes {
  return [
    { path: '', component: InicioLazyComponent },
    { path: 'admin', loadComponent: cargarAdmin },
  ];
}
```

```ts
// src/app/lazy-demo.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminLazyComponent, crearRutasLazy } from './lazy-demo';

describe('loadComponent invoca el import dinamico solo al navegar', () => {
  it('NO invoca el factory antes de navegar, y lo invoca UNA vez al navegar a /admin', async () => {
    const factorySpy = jasmine.createSpy('cargarAdmin').and.callFake(() =>
      Promise.resolve({ AdminLazyComponent })
    );

    TestBed.configureTestingModule({
      providers: [provideRouter(crearRutasLazy(() => factorySpy().then((m: any) => m.AdminLazyComponent)))],
    });

    expect(factorySpy).not.toHaveBeenCalled();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(factorySpy).not.toHaveBeenCalled();

    await harness.navigateByUrl('/admin');
    expect(factorySpy).toHaveBeenCalledTimes(1);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; el espía confirma con evidencia programática (no solo inspección visual de DevTools) que `cargarAdmin` permanece sin invocar tanto antes de cualquier navegación como después de navegar a `/` (la ruta no-lazy), y se invoca exactamente una vez al navegar efectivamente a `/admin` — el chunk se descarga en el momento preciso que la teoría describe, no antes.

**Fallo deliberado:** cambia `{ path: 'admin', loadComponent: cargarAdmin }` por `{ path: 'admin', component: AdminLazyComponent }` (eager, sin lazy loading) y ajusta el test para reflejar ese cambio de API; si mantienes la aserción `expect(factorySpy).not.toHaveBeenCalled()` tras crear las rutas con un componente ya importado de forma estática (no perezosa), verás que la premisa completa del test deja de tener sentido porque ya no existe ningún factory que invocar bajo demanda — diagnosticando que la ausencia de un `loadComponent` real elimina la garantía de carga diferida que el test verifica. Restaura `loadComponent` antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega una tercera ruta lazy y confirma con un segundo espía independiente que cada `loadComponent` se invoca solo cuando su ruta específica es visitada, y no cuando se visita otra ruta lazy distinta.
2. Combina esta ruta lazy con `authGuard` (Tema 2) en la misma configuración y confirma con el espía que, si el guard redirige, el factory de `loadComponent` NUNCA se invoca (el chunk no se descarga si el guard ya bloqueó el acceso).
3. Documenta, comparando con el Tema 1, por qué `RouterTestingHarness` (y no invocar una función directamente, como en el Tema 2) es la herramienta correcta aquí: `loadComponent` solo se activa como parte de una navegación real resuelta por el router.
4. Escribe de memoria (sin mirar) un espía que envuelva un factory de `loadComponent` y un test con `RouterTestingHarness` que confirme que se invoca exactamente una vez al navegar. Compara después contra el patrón del Paso 4.

**Pista:** un espía que envuelve la función factory de `loadComponent` es la forma más precisa de contar invocaciones exactas; inspeccionar la pestaña Network del navegador manualmente confirma lo mismo mucho más lentamente y sin quedar registrado como una prueba automatizada repetible.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el nombre real del método de Jasmine usado para crear una función espía:

```ts
const factorySpy = jasmine.____('cargarAdmin').and.callFake(() => Promise.resolve({ AdminLazyComponent }));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una ruta con `loadComponent` envuelta en un espía y un test con `RouterTestingHarness` que confirme que el chunk no se descarga antes de navegar. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con un espía real sobre la función de importación dinámica, que `loadComponent` respeta estrictamente la carga bajo demanda. El siguiente tema confirma, con `RouterTestingHarness`, cómo Angular llena automáticamente un `input()` de componente a partir de un parámetro de ruta. **Evidencia:** entrega el resultado del test en verde junto con el conteo de invocaciones del espía antes y después de cada navegación. Fuentes oficiales: [Angular — Lazy loading](https://angular.dev/guide/routing/common-router-tasks#lazy-loading).

**Errores comunes:** confiar únicamente en la inspección manual de la pestaña Network para verificar lazy loading, sin ninguna prueba automatizada que detecte una regresión futura; olvidar que combinar un guard con `loadComponent` en la misma ruta evita también el coste de descarga cuando el guard rechaza el acceso.

**Cuándo no usarlo:** para una ruta que la enorme mayoría de usuarios visita en cada sesión (como la página de inicio), forzar `loadComponent` puede añadir una espera de red innecesaria en el camino crítico en vez de aportar un beneficio real de rendimiento.

**Transferencia al proyecto integrador «Centro de control logístico»:** Carga la pantalla de administración bajo demanda. Inspecciona la red al abrir únicamente seguimiento y verifica que ese recorrido no descarga el componente administrativo.

### Tema 4: Parámetros de ruta, query params y capacidades avanzadas de routing

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, navegando con `RouterTestingHarness` hacia una URL con un parámetro dinámico, que Angular llena automáticamente un `input()` del componente de destino con el valor real de ese parámetro — sin ninguna suscripción manual a `ActivatedRoute`.

**Conocimiento previo:** Tema 1 de este módulo (`RouterTestingHarness`); Módulo 1 de este track (`input()`).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En una app de entregas, la vista de detalle de un pedido (`/pedidos/42`) necesita el `42` para saber qué pedido mostrar; confirmar con una prueba real que ese valor efectivamente llega al componente como `input()` (y no solo confiar en que "debería funcionar") previene una regresión silenciosa si alguien cambia el nombre del parámetro de ruta sin actualizar el componente correspondiente.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** input binding de rutas, `ActivatedRoute`, `CanDeactivateFn`, `ResolveFn`.

Los parámetros de ruta dinámicos (`:id` en `path: "tareas/:id"`) pueden leerse de dos formas: la forma clásica inyecta `ActivatedRoute` y suscribe (o convierte con `toSignal`, Módulo 6) al observable `paramMap`; la forma moderna y más concisa usa "input binding de rutas", donde simplemente declarar `id = input<string>();` en el componente hace que Angular llene automáticamente ese input con el valor del parámetro de ruta `:id` correspondiente, sin ninguna suscripción manual necesaria, una integración directa entre el sistema de routing y el modelo de inputs basados en signals estudiado en el Módulo 1.

Los query params (`?estado=pendiente`), a diferencia de los parámetros de ruta (que son parte de la estructura jerárquica de la URL), representan filtros o modificadores opcionales que no cambian qué componente se activa, sino que proporcionan información adicional que ese componente puede leer para ajustar su comportamiento (por ejemplo, qué filtro aplicar sobre una lista mostrada). Sincronizar un query param con un signal del componente permite que el estado del filtro sea reflejado en la URL (haciendo esa vista filtrada compartible mediante un enlace directo, y preservada correctamente ante recargas de página o el uso del botón de retroceso del navegador).

`CanDeactivateFn` protege contra la navegación fuera de una ruta actual (útil para advertir al usuario si intenta abandonar un formulario con cambios sin guardar); `CanMatchFn` decide si una ruta puede considerarse una coincidencia en absoluto antes incluso de intentar activarla (útil, por ejemplo, para mostrar una ruta alternativa completamente distinta según una condición, en vez de simplemente bloquear el acceso a la misma ruta); `canActivateChild` aplica un guard a todas las rutas hijas de una ruta padre de una sola vez, evitando declarar el mismo guard repetidamente en cada ruta hija individual; y `ResolveFn` permite precargar datos necesarios para una vista antes de que esa vista termine de activarse, garantizando que el componente ya tenga los datos disponibles inmediatamente al renderizarse, en vez de mostrar primero un estado de carga y solicitar los datos después de que el componente ya esté visible.

**Analogía:** los parámetros de ruta son como el número de habitación específico dentro de un hotel (parte de la dirección estructural); los query params son como instrucciones adicionales de servicio para esa habitación específica (limpieza extra, no molestar), que no cambian cuál habitación es pero sí modifican cómo se atiende. `CanDeactivateFn` es como preguntar "¿está seguro de que quiere salir de la habitación sin llevar sus pertenencias?" antes de permitir la salida; `ResolveFn` es como tener la habitación completamente preparada y lista antes de que el huésped llegue, en vez de empezar a prepararla justo cuando él ya está entrando.

**Diagrama — de la URL al input del componente:**

```
URL: /pedidos/42
          │
          ▼
┌───────────────────┐   withComponentInputBinding()   ┌────────────────────┐
│ Angular Router     │ ────────────────────────────────▶│ id = input<string>()│
│ extrae :id = "42"  │                                   │ recibe "42"         │
└───────────────────┘                                    └────────────────────┘
```

**Código del ejemplo:**

```ts
@Component({ /* ... */ })
export class Detalle {
  id = input<string>(); // Angular lo llena automáticamente desde :id de la ruta
}
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-params --standalone --skip-git --defaults`), crea `src/app/param-demo.ts` con un componente que declara `id` como `input()`, y navega hacia él con `RouterTestingHarness` para confirmar que Angular lo llena automáticamente:

```bash
mkdir -p src/app
```

```ts
// src/app/param-demo.ts
import { Component, input } from '@angular/core';
import { Routes } from '@angular/router';

@Component({ selector: 'app-pedido-detalle', standalone: true, template: 'Pedido {{ id() }}' })
export class PedidoDetalleComponent {
  id = input<string>();
}

export const rutasConParametro: Routes = [
  { path: 'pedidos/:id', component: PedidoDetalleComponent },
];
```

```ts
// src/app/param-demo.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { rutasConParametro } from './param-demo';

describe('input binding de rutas llena automaticamente el input del componente', () => {
  it('el input id() recibe el valor real del parametro :id de la URL', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(rutasConParametro, withComponentInputBinding())],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/pedidos/42');

    expect(harness.routeNativeElement?.textContent).toContain('Pedido 42');
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; el texto renderizado contiene "Pedido 42", confirmando que Angular tomó el segmento `42` de la URL y lo asignó automáticamente al `input()` `id`, sin que el componente haya escrito ninguna suscripción manual a `ActivatedRoute.paramMap`.

**Fallo deliberado:** elimina `withComponentInputBinding()` de `provideRouter(rutasConParametro, withComponentInputBinding())`, dejando solo `provideRouter(rutasConParametro)`, y ejecuta de nuevo el test. FALLA porque `harness.routeNativeElement?.textContent` ahora contiene "Pedido " sin el `42` (el input nunca se llena) — diagnosticando que el input binding de rutas NO es un comportamiento automático de `input()` por sí solo, sino una característica que debe activarse explícitamente con `withComponentInputBinding()` al configurar el router. Restaura la característica antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo parámetro de ruta (por ejemplo `:seccion` en `pedidos/:id/:seccion`) y confirma con el mismo patrón que ambos inputs se llenan correctamente de forma independiente.
2. Sincroniza un query param (`?estado=pendiente`) con un signal del componente usando `ActivatedRoute.queryParamMap`, y confirma con `RouterTestingHarness` que navegar con ese query param actualiza el signal correspondiente.
3. Escribe un `CanDeactivateFn` real que bloquee la navegación fuera de una ruta si un signal `hayCambiosSinGuardar` está en `true`, y confírmalo navegando con `RouterTestingHarness` antes y después de cambiar ese signal.
4. Escribe de memoria (sin mirar) un componente con un `input()` de ruta y un test con `RouterTestingHarness` y `withComponentInputBinding()` que confirme que se llena correctamente. Compara después contra el patrón del Paso 4.

**Pista:** `withComponentInputBinding()` es una característica que se activa explícitamente en `provideRouter(...)`, no un comportamiento implícito de `input()` — si un input de ruta llega vacío en una app real, esta es la primera causa a revisar.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con la función real de `@angular/router` que activa el llenado automático de inputs desde parámetros de ruta:

```ts
provideRouter(rutasConParametro, ____())
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una ruta con parámetro `:id`, un componente con `id = input<string>()`, y un test con `RouterTestingHarness` que confirme el valor recibido. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, navegando con `RouterTestingHarness` hacia una URL con parámetro dinámico, que Angular llena automáticamente un `input()` de componente a partir de esa URL, siempre que `withComponentInputBinding()` esté activo. Con esto cierras el módulo de routing: dominas configuración de rutas (Tema 1), guards funcionales probados directamente (Tema 2), lazy loading verificado con espías (Tema 3) y parámetros de ruta confirmados con input binding (Tema 4). El siguiente módulo aplica estos fundamentos a formularios reactivos. **Evidencia:** entrega el resultado del test en verde junto con el resultado del fallo deliberado sin `withComponentInputBinding()`. Fuentes oficiales: [Angular — Route parameters](https://angular.dev/guide/routing/common-router-tasks#activated-route).

**Errores comunes:** olvidar `withComponentInputBinding()` y asumir que el input simplemente no se está declarando bien; confundir un parámetro de ruta (identifica el recurso) con un query param (modifica cómo se muestra ese recurso, sin cambiar cuál es).

**Cuándo no usarlo:** para datos que deben estar disponibles ANTES de que el componente se active (evitando mostrar un estado de carga inicial), `ResolveFn` es más apropiado que leer un input de ruta ya dentro del componente activado.

---

**Transferencia al proyecto integrador «Centro de control logístico»:** Guarda filtros en query params y el identificador en la ruta del detalle. Comparte la URL, recárgala y confirma que restaura la búsqueda sin confundir parámetros de navegación con permisos.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una aplicación con al menos 4 rutas, incluyendo una protegida por guard funcional y una cargada de forma perezosa, con parámetros de ruta y query params sincronizados.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir al menos 4 rutas | home, lista, detalle/:id, 404 con redirectTo | Verifica el orden correcto del array |
| 2 | Cargar una ruta de forma perezosa | `loadComponent` | Verifica en Network que solo se descarga al navegar |
| 3 | Implementar un guard funcional | Ver Tema 2 | Bloquea el acceso si no hay "sesión" simulada |
| 4 | Leer un parámetro de ruta | Input binding de rutas | Úsalo para cargar el detalle correspondiente |
| 5 | Sincronizar un query param con un signal | `?estado=pendiente` | Verifica persistencia ante recarga de página |

**Verificación:** el laboratorio se considera exitoso si las 4 rutas navegan correctamente, si la ruta protegida redirige apropiadamente sin sesión simulada, y si el chunk de la ruta perezosa se confirma descargado solo al navegar hacia ella.

**Errores comunes y soluciones**

- **Colocar la ruta comodín `**` antes de rutas específicas.** Siempre debe ir al final del array, o interceptará URLs que deberían coincidir con rutas más específicas.
- **Bloquear silenciosamente con `false` en vez de redirigir con una `UrlTree`.** Prefiere redirigir hacia una ubicación útil (como `/login`) para una mejor experiencia de usuario.
- **Confundir parámetros de ruta con query params.** Los parámetros de ruta identifican qué recurso se muestra; los query params modifican cómo se muestra, sin cambiar qué componente se activa.

---


## Laboratorio de transferencia

### Tema 5: CanDeactivate: proteger un borrador sin confundir navegación con autorización

#### Paso 1 · Objetivo y preparación
Al finalizar protegerás texto sin guardar al navegar a otra ruta y comprobarás las dos decisiones de salida. **Prerrequisitos:** componentes standalone, signals, eventos y Router. Node compatible con Angular 21 y npm. Es un ejemplo independiente desde un proyecto nuevo.

#### Paso 2 · Contexto y caso real
En el proyecto integrador, un operador escribe una observación sobre una entrega. Un clic accidental en otra ruta no debe borrar el trabajo sin permitirle decidir. **¿Por qué es importante?** El guard de salida resuelve una necesidad de continuidad; no es un mecanismo de seguridad del backend.

#### Paso 3 · Teoría, modelo mental y analogía
`CanDeactivate` recibe el componente que está a punto de abandonarse. Puede permitir o cancelar la navegación. Un estado «sucio» indica que el texto actual difiere de la última versión guardada. **Analogía:** antes de retirar una hoja de la mesa, preguntas si hay cambios pendientes. El límite es que una ruta no es una copia de seguridad: cerrar la pestaña o terminar el proceso requiere otra estrategia.

#### Paso 4 · Demostración guiada desde cero
```bash
npx @angular/cli@21 new borrador-demo --standalone --routing --style=css --skip-tests --skip-git --defaults
cd borrador-demo
```
Reemplaza `src/main.ts` por este archivo completo:
```typescript
import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CanDeactivateFn, provideRouter, RouterLink, RouterOutlet } from '@angular/router';

@Component({ selector: 'app-editor', standalone: true, imports: [RouterLink], template: `
  <h1>Observación de la entrega</h1>
  <label for="nota">Nota</label>
  <textarea id="nota" [value]="text()" (input)="edit($event)"></textarea>
  <button (click)="saved.set(text())">Guardar en esta sesión</button>
  <p>{{ text() !== saved() ? 'Cambios sin guardar' : 'Sin cambios pendientes' }}</p>
  <a routerLink="/salir">Ir al listado</a>` })
class Editor {
  text = signal('');
  saved = signal('');
  edit(event: Event) { this.text.set((event.target as HTMLTextAreaElement).value); }
}
const confirmExit: CanDeactivateFn<Editor> = editor =>
  editor.text() === editor.saved() || confirm('Hay cambios sin guardar. ¿Salir?');

@Component({ selector: 'app-listado', standalone: true, imports: [RouterLink],
  template: '<h1>Listado</h1><a routerLink="/">Volver al editor</a>' })
class Listado {}
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet],
  template: '<main><router-outlet /></main>' })
class App {}
bootstrapApplication(App, { providers: [provideRouter([
  { path: '', component: Editor, canDeactivate: [confirmExit] },
  { path: 'salir', component: Listado }
])] }).catch(console.error);
```
```bash
npm start
```
Abre `http://localhost:4200`. **Resultado esperado:** escribe una nota, pulsa «Ir al listado» y cancela: sigues en el editor con el texto. Acepta la siguiente salida: llegas al listado. Explica cada bloque: el componente mantiene dos snapshots, el guard compara y el router consulta la decisión. El botón guarda solo en memoria de esta sesión, sin fingir persistencia remota.

#### Paso 5 · Práctica guiada
**Fallo deliberado:** cambia la condición por `true`. Navega con cambios: no aparece la pregunta. **Pista:** la autorización de salida depende de comparar texto actual y guardado, no de que el componente exista. Restaura y prueba guardar antes de salir: ya no pregunta.

#### Paso 6 · Práctica independiente
Añade un botón «Descartar cambios» que restaure `text` desde `saved`. Comprueba escribir, guardar, volver a editar, descartar y salir. No debe mostrar aviso después de descartar.

#### Paso 7 · Cierre y evidencia
**Evidencia de aprendizaje:** matriz de acciones y estado de la ruta, con el caso cancelado y aceptado. El siguiente paso es persistir borradores y gestionar errores del guardado real. **Errores comunes:** llamar «guardado» a texto no confirmado por el servidor, usar el guard como autorización y suponer que cubre cierre de pestaña. **Límites y decisión de uso:** este diálogo nativo es una demostración mínima; una UI personalizada necesita foco, teclado y semántica correctos.

**Fuente oficial:** [Angular route guards](https://angular.dev/guide/routing/route-guards).
