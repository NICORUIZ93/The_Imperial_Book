# Temario objetivo · Angular 22, de cero a experto (web y Angular Native)

> **Aprobado por el dueño el 2026-11-20** (versión extendida, regla 10 de la spec 021).

**Estado:** Aprobado por el dueño el 2026-11-20, con la opción recomendada en cada decisión. (specs/021, Fase 3, criterio Z2). No hay lecciones escritas ni
cambiadas: este documento solo fija qué temas tendrá el curso, en qué orden y de dónde sale cada uno.
**Fecha de revisión de fuentes:** 2026-11-20.
**Versión de referencia:** Angular 22 (`@angular/core` 22.3.0, publicada el 2026-11-18 según el registro de npm;
v22 es la única versión en estado «Active» en angular.dev/reference/releases). `docs/VERSIONES.md` es la fuente de
las versiones de la academia y ya fija Angular 22.
**Identificador de ruta:** `angular` (se conserva, y con él el progreso de lectura).
**Bloque nativo:** el dueño aclaró el 2026-11-20 que «Angular native» es el proyecto **Angular Native**
(ng-native.com, repositorio `ng-native/ng-native`). Está en **alfa**: sus temas pueden cambiar entre versiones
`0.x` (sección 1.5 y decisión D2).

## 1. Resumen

### 1.1 El curso hoy

El listado medido (`docs/reestructuracion/listado-de-temas.csv`, filas `angular`) tiene **78 temas en
17 módulos** (M0–M16).

| Nivel declarado hoy | Temas | % |
|---|---:|---:|
| Básico | 0 | 0 % |
| Intermedio | 3 | 4 % |
| Avanzado | 4 | 5 % |
| Experto | 2 | 3 % |
| Sin nivel | 69 | 88 % |

Solo 6 de 78 temas (8 %) declaran nivel Avanzado o Experto, y la mayoría no declara nivel. El
módulo 16 actual («Angular Native», opcional, 4 temas) es todo lo que hay hoy de desarrollo móvil. De los 78
temas, 77 alimentan el temario objetivo y 1 (M13 T2) pasa a ser parte del proyecto final (anexo A).

### 1.2 El curso objetivo

**297 temas en 49 módulos** (de 4 a 7 temas cada uno), en los cuatro tramos del formato único.

| Tramo (nivel) | Módulos | Temas | Ya está | Está pero básico | Falta |
|---|---|---:|---:|---:|---:|
| Fundamentos (Básico) | M0–M8 | 54 | 24 | 14 | 16 |
| Aplicación (Intermedio) | M9–M19 | 70 | 23 | 13 | 34 |
| Integración (Avanzado) | M20–M41 | 135 | 17 | 18 | 100 |
| Experto (Experto) | M42–M48 | 38 | 1 | 7 | 30 |
| **Total** | M0–M48 | **297** | **65** | **52** | **180** |

- **Integración + Experto: 173 de 297 temas (58 %)**. Cumple la regla «al menos la mitad».
- **Faltan 180 temas** (61 %): no existen hoy en el curso.
- **52 temas están pero son básicos** (18 %): existen, y cada fila dice qué les falta.
- **65 temas ya están** (22 %) con la profundidad suficiente. También pasan al formato de 12 secciones en
  la Fase 5, como todos.
- **Bloque nativo: 82 temas en 13 módulos** (28 % del curso). Angular Native ocupa
  76 temas en 12 módulos (M29–M40: 3 ya están, 10 están pero básicos y
  63 faltan) y las alternativas (NativeScript, Ionic con Capacitor y PWA) un módulo comparativo de
  6 temas (M41).
- Duración estimada: 297 temas a 40 min de media ≈ 198 h, más unas 25 h de proyecto final. Es una
  estimación; los minutos reales se fijan tema a tema (20–45 min) al escribirlos.

### 1.3 Cómo se decidió el estado de cada tema

- **ya está**: hay un tema actual dedicado al asunto, con unas 900 palabras o más.
- **está pero básico**: el asunto aparece, pero en un tema corto (menos de unas 900 palabras según el CSV),
  compartido con otros asuntos, o sin la parte interna, el error real o la medición. La fila dice qué falta.
- **falta**: ningún tema actual lo trata.

**Límite de esta clasificación:** se hizo con el título, el nivel y el número de palabras de cada tema en el CSV
(6 de los 78 temas tienen menos de 900 palabras) y leyendo el encabezado y el primer tema del módulo
16, no leyendo las 78 lecciones línea a línea. La columna «qué falta» es la lista de lo que el tema objetivo
exige; al reescribir cada tema (Fase 5) se comprueba contra la lección real y lo que ya esté se conserva. Un
«ya está» significa que el asunto tiene tema propio y extensión suficiente, no que ya cumpla las 12 secciones.

Entre paréntesis va el tema actual de origen con la numeración de hoy (por ejemplo, «M5 T3» es el tema 3 del
módulo 5 actual). Un tema actual puede alimentar a más de un tema objetivo cuando se parte, y varios temas
actuales cortos pueden fusionarse en uno. El anexo A da el destino de los 78 temas actuales, uno por uno.

### 1.4 Rigor de versiones (Angular web)

Datos tomados el 2026-11-20 de angular.dev y del registro de npm (`registry.npmjs.org`):

| Dato | Valor | Fuente |
|---|---|---|
| Versión estable vigente | Angular 22 · `@angular/core` y `@angular/cli` 22.3.0 (2026-11-18 y 2026-11-19) | npm; angular.dev/reference/releases |
| Soporte de v22 | publicada el 2026-06-03; activa hasta 2027-06; LTS hasta 2028-06 | angular.dev/reference/releases |
| Versiones anteriores | v21 (2025-11-19) en LTS hasta 2027-06 · v20 en LTS hasta el 2026-11-28 | angular.dev/reference/releases |
| Cadencia | una versión mayor cada 12 meses desde v22 (antes, cada 6) | angular.dev/reference/releases |
| Node.js para 22.x | `^22.22.3 \|\| ^24.15.0 \|\| ^26.0.0` | angular.dev/reference/versions |
| TypeScript para 22.x | `>=6.0.0 <6.1.0` (la academia usa TypeScript 7.x en otros cursos: ver `docs/VERSIONES.md`) | angular.dev/reference/versions |
| RxJS para 22.x | `^6.5.3 \|\| ^7.4.0` (última publicada: 7.8.2) | angular.dev/reference/versions; npm |
| Pruebas | Vitest es el ejecutor por defecto de los proyectos nuevos del CLI, con jsdom | angular.dev/guide/testing |
| Marcadas «Production ready» en el roadmap | Signal Forms, Resource API, `httpResource`, zoneless, `linkedSignal`, hidratación incremental, Effect API, event replay y modo de render por ruta | angular.dev/roadmap |
| «Available to experiment with» | WebMCP | angular.dev/roadmap |
| Ecosistema (última versión en npm) | `@angular/material`, `@angular/cdk` y `@angular/aria` 22.3.0 · `@ngrx/store` y `@ngrx/signals` 22.0.1 · `@angular-architects/native-federation` 22.2.5 · `nx` 24.0.6 · `vitest` 5.1.1 · `@playwright/test` 1.65.1 · `cypress` 16.3.0 · `@testing-library/angular` 19.6.0 · `@storybook/angular` 10.6.8 · `@jsverse/transloco` 8.4.0 · `@analogjs/platform` 2.9.7 | npm |
| Aviso | `@angular/fire` 21.0.0 declara `@angular/core ^21.2.0`; la 22 está en `next` (22.0.0-rc.1) | npm |

Reglas que se proponen para el curso:

1. Todo tema sobre una función experimental lo dice en el título y en un aviso. En la parte web es **1 tema**
   (M46 T3, WebMCP). Angular Aria aparece como «New» en la navegación de angular.dev y la página consultada no
   declara su estabilidad: se comprueba antes de escribir M14 T4.
2. Lo heredado (NgModules, Zone.js, Karma y Jasmine, `@angular/animations`) se enseña solo para leerlo y
   migrarlo (M17 T3, M20 T5, M25 T6 y M45), nunca como forma de trabajo.
3. Las librerías de terceros no tienen versión en este documento más allá de la tabla anterior: se fijan en
   `docs/VERSIONES.md` y en el `package.json` de cada laboratorio antes de escribir su módulo.
4. Datos que este documento **no** verificó ejecutando (regla 9 de la spec): todo. Las versiones vienen de
   fuentes primarias, pero ningún laboratorio se ha corrido todavía.

### 1.5 Rigor de versiones (bloque nativo)

| Tecnología | Versión vigente (npm, 2026-11-20) | Compatibilidad con Angular 22 | Fuente |
|---|---|---|---|
| **Angular Native** (`@ng-native/*`) | 0.25.0 (2026-11-19); todos los paquetes se publican con la misma versión | `@ng-native/platform` declara `@angular/core ^22.0.0`. La plantilla `@ng-native/template` 0.25.0 fija `expo ~58.0.16`, `react-native 0.88.0`, `react 19.3.0`, `typescript ~6.0.3` y `vitest ^5.0.0`. La guía de apps existentes admite Expo SDK 57 y 58 | npm; ng-native.com |
| Expo · React Native | `expo` 58.0.26 (2026-11-17) · `react-native` 0.88.1 | los fija la plantilla; no se actualizan por separado | npm |
| NativeScript | `@nativescript/angular` 22.0.2 (2026-10-23) · `@nativescript/core` 9.1.4 · CLI `nativescript` 9.1.2 (Node ≥ 20) | la rama principal de `NativeScript/angular` usa `@angular/core` 22.0.8, TypeScript 6.0.3 y `zone.js` 0.16.2; existe la etiqueta `v21-lts` (21.2.0) | npm; GitHub `NativeScript/angular`; docs.nativescript.org |
| Ionic Framework | `@ionic/angular` 9.0.13 (2026-11-20); v9 publicada el 2026-08-19; v8 en mantenimiento hasta el 2027-02-19 | v9 admite Angular 18 a 22.x; Angular 22 exige TypeScript 6.0 o posterior | ionicframework.com/docs/reference/support; npm |
| Capacitor | `@capacitor/core` 8.6.2 (2026-11-12); v8 activa desde el 2025-12-08; 9.0.0-rc.0 en `next` | independiente de Angular; mínimos de v8: iOS 15, Android 7 (API 24), Xcode 26 y Node 22 | capacitorjs.com/docs/main/reference/support-policy; npm |

**Angular Native es alfa.** Su documentación lo dice así: está en alfa, puede tener errores y las API pueden
cambiar entre versiones `0.x`. Es un proyecto independiente, sin relación con Google, con el equipo de Angular
ni con Expo. Dibuja componentes Angular como vistas nativas (`UIView` en iOS, `android.view.View` en Android)
implementando `Renderer2` sobre el renderer Fabric de React Native, dentro de una app de Expo y sin WebView.
Consecuencias para el temario:

1. Los 76 temas de M29–M40 llevan «(alfa)» en el título del módulo y un aviso fijo en
   cada tema con la versión con la que se escribió.
2. El temario sigue la documentación de la versión 0.25.0. Entre el 2026-11-18 (cuando se escribió el módulo 16
   actual, con la plantilla 0.24.0 y Expo SDK 57) y el 2026-11-20 la plantilla ya cambió a 0.25.0 y Expo SDK 58:
   es la velocidad de cambio que hay que esperar.
3. El README del repositorio en GitHub, tal como se leyó, todavía cita Expo SDK 57, React Native 0.86 y Node
   22.18 o posterior; la plantilla publicada en npm fija SDK 58 y React Native 0.88. Vale la plantilla, y el
   requisito de Node se comprueba al instalar.
4. Antes de escribir cada módulo nativo se vuelve a leer su página de documentación y el registro de cambios, y
   se corre `npx @ng-native/migrate@latest --dry-run` sobre el laboratorio (decisión D2).
5. La documentación distingue lo implementado de lo verificado en hardware real: los laboratorios se dan por
   válidos solo cuando corren en el Mac del dueño, en simulador de iOS y emulador de Android.

## 2. Temario objetivo completo

Orden lineal: los módulos se estudian en el orden M0 → M48 y el nivel no baja. Las abreviaturas de la
columna «Fuentes» están en la sección 6. «AD» seguido de un nombre es la guía de angular.dev de ese nombre, con
la página entre paréntesis; «NGN» seguido de un nombre es la página de ng-native.com de ese nombre.

### Tramo 1 · Fundamentos (nivel Básico) — 54 temas

#### M0 · Plataforma, CLI y primer proyecto (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es Angular hoy: versión estable, calendario de versiones (una mayor cada 12 meses desde v22), ventanas de soporte y compatibilidad con Node y TypeScript | Básico | **está pero básico** (M12 T1): 655 palabras y orientado a proyectos heredados; faltan el calendario oficial, la tabla de compatibilidad y cómo leer `ng version` | VER·AD Keeping up-to-date·RS·LA c1·MA c1 |
| 2 | Instalar Node y el CLI, `ng new` y anatomía del workspace (`angular.json`, `tsconfig`, `src/`, `public/`) | Básico | **está pero básico** (M0 T1): hoy explica que el CLI ya no genera NgModules; faltan la instalación, las opciones de `ng new` y el recorrido archivo por archivo | AD CLI (Local set-up)·RS·LA c1·FCC·UD s1·DT s4 |
| 3 | TypeScript imprescindible para Angular: tipos, clases, interfaces, genéricos, decoradores y modo estricto | Básico | **está pero básico** (M0 T3): hoy cubre `unknown`, `any`, `never` y tipos utilitarios; faltan clases, interfaces, genéricos y decoradores, y el enlace al curso dueño (decisión D6) | LA c2·FCC·UD s46·DT s3·RS |
| 4 | El ciclo de desarrollo: `ng serve`, recarga en caliente (HMR), errores del compilador y de la consola leídos uno a uno | Básico | **falta** | AD CLI (Serving)·RMP (Improve HMR)·LA c1·UD s5 |
| 5 | Angular DevTools y Angular Language Service: inspeccionar el árbol de componentes y autocompletar plantillas | Básico | **falta** | AD DevTools·AD Language Service·RS·FM |
| 6 | Generar código con `ng generate` y la guía de estilo oficial: nombres, carpetas y convenciones | Básico | **falta** | AD CLI (Schematics)·AD Style Guide·RS·LA c1 |

#### M1 · Componentes (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Anatomía de un componente standalone: clase, plantilla, selector e `imports` | Básico | **ya está** (M0 T1) | AD Componentes (Anatomy, Selectors)·RS·LA c3·MA c2·UD s2·DT s4 |
| 2 | Estilos de componente y encapsulación: emulada, Shadow DOM y ninguna; `:host` y estilos globales | Básico | **falta** | AD Componentes (Styling)·RS·LA c3 |
| 3 | Entradas con `input()`: obligatorias, con valor por defecto, alias y `transform` | Básico | **ya está** (M1 T1) | AD Componentes (Inputs)·RS·MA c4·MAS·FM·DT s29 |
| 4 | Salidas con `output()` y enlace bidireccional con `model()` | Básico | **está pero básico** (M1 T1): el tema actual junta entradas y salidas; faltan `model()`, el nombrado de eventos y `outputFromObservable` | AD Componentes (Outputs)·AD Plantillas (Two-way binding)·MAS·FM·DT s29 |
| 5 | Ciclo de vida de un componente: orden real de los hooks y cuándo usar cada uno | Básico | **ya está** (M1 T4) | AD Componentes (Lifecycle)·RS·FCC·DT s20·ENT |
| 6 | El elemento host: enlaces y escuchas con la propiedad `host` | Básico | **falta** | AD Componentes (Host elements)·RS |
| 7 | Comunicación entre componentes: padre a hijo, hijo a padre y servicio compartido, con criterio para elegir | Básico | **falta** | RS·FCC·ENT·LA c3·FM |

#### M2 · Plantillas y enlace de datos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Interpolación y enlaces de propiedad, atributo, clase y estilo | Básico | **ya está** (M0 T2) | AD Plantillas (Binding)·RS·LA c3·FCC·UD s2 |
| 2 | Eventos del DOM, `$event` y enlace bidireccional | Básico | **está pero básico** (M0 T2): el tema actual solo cubre interpolación y enlace de propiedad; faltan los eventos, los modificadores de teclado y el enlace bidireccional | AD Plantillas (Event listeners, Two-way binding)·RS·FCC |
| 3 | Control de flujo incorporado: `@if`, `@for` con `track`, `@empty` y `@switch` | Básico | **ya está** (M1 T2) | AD Plantillas (Control flow)·RS·MA c4·UD s2·ENT·DT s28 |
| 4 | Variables de plantilla: `@let`, referencias `#ref` y su ámbito | Básico | **falta** | AD Plantillas (Variables)·RS·RMP (Local template variables) |
| 5 | Pipes incorporados: fecha, moneda, número, `json`, `async` y sus parámetros de locale | Básico | **está pero básico** (M1 T7): el tema actual trata pureza y `AsyncPipe`; falta el recorrido de los pipes incorporados con sus formatos | AD Plantillas (Pipes)·RS·LA c4·FCC·DT s11 |
| 6 | Sintaxis de expresiones, espacios en blanco y verificación de tipos de plantilla (`strictTemplates`) | Básico | **falta** | AD Plantillas (Expression syntax, Whitespace)·AD CLI (Template type checking) |
| 7 | Proyección de contenido con `ng-content`: primer uso | Básico | **ya está** (M1 T3) | AD Plantillas (ng-content)·AD Componentes (Content projection)·FCC·RMP |

#### M3 · Directivas y pipes propios (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Directivas de atributo propias: entradas, host y casos reales | Básico | **está pero básico** (M1 T6): 726 palabras compartidas con pipes; faltan las entradas de la directiva, los enlaces de host y un caso real (permisos, foco) | AD Directivas (Attribute)·RS·LA c4·DT s23·FCC |
| 2 | Directivas estructurales y fragmentos con `ng-template` | Básico | **falta** | AD Directivas (Structural)·AD Plantillas (ng-template)·RS |
| 3 | `ng-container` y `NgTemplateOutlet`: plantillas reutilizables con contexto | Básico | **falta** | AD Plantillas (ng-container, ng-template)·RS |
| 4 | Pipes personalizados: puros, impuros y su coste frente a llamar funciones en la plantilla | Básico | **ya está** (M1 T7, M1 T6) | AD Plantillas (Pipes)·RS·LA c4·DT s12·ENT·FCC |
| 5 | Imágenes con `NgOptimizedImage`: primer uso, `priority` y tamaños | Básico | **falta** | AD Directivas (NgOptimizedImage)·RS·RMP·LA c15 |

#### M4 · Signals: primer contacto (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `signal()` y `computed()`: estado y estado derivado | Básico | **ya está** (M2 T1) | AD Signals (Overview)·MA c6·MAS·LA c7·UD s40·DT s24·RS |
| 2 | `effect()`: para qué sirve, para qué no, limpieza y `untracked` | Básico | **está pero básico** (M2 T1): hoy comparte tema con `signal` y `computed`; faltan la limpieza, `untracked`, el contexto de inyección y los antipatrones | AD Signals (Side effects)·MA c7·MAS·ENT·RMP (Effect API) |
| 3 | Mutación frente a actualización inmutable con `set` y `update` | Básico | **ya está** (M2 T2) | AD Signals (Overview)·MA c6·MAS |
| 4 | `linkedSignal`: estado derivado que el usuario puede sobrescribir | Básico | **está pero básico** (M2 T5): 774 palabras; faltan la forma con `source` y `computation`, el valor previo y el caso de la lista con selección | AD Signals (linkedSignal)·MAS·FM·ENT·RMP |
| 5 | Signals frente a Observables: la primera decisión | Básico | **ya está** (M2 T3) | AD RxJS interop·MA c6·ENT·MAS·UD s40 |
| 6 | Consultas con signals: `viewChild`, `viewChildren`, `contentChild` y `contentChildren` | Básico | **ya está** (M1 T5) | AD Componentes (Queries)·MA c4·RS·FCC |

#### M5 · Servicios e inyección de dependencias (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Servicios, `@Injectable` y `providedIn: 'root'` | Básico | **ya está** (M3 T1) | AD DI (Creating services)·RS·LA c5·MA c3·FCC·UD s2 |
| 2 | `inject()` frente al constructor y el contexto de inyección | Básico | **ya está** (M3 T2) | AD DI (Injection context)·MA c3·FM·ENT |
| 3 | Definir proveedores: `useClass`, `useValue`, `useFactory` y `useExisting` | Básico | **está pero básico** (M3 T4): hoy aparece dentro del tema de tokens; falta un tema propio con cada receta y su caso de uso | AD DI (Defining providers)·RS·LA c5·FCC·FM |
| 4 | Tokens de inyección para valores y configuración | Básico | **ya está** (M3 T4) | AD DI (Defining providers)·ENT·FM·FCC |
| 5 | Configuración de la aplicación: `app.config.ts`, funciones `provide*` e inicializadores de aplicación | Básico | **falta** | AD DI (DI in action)·FCC·MA c2·AE c3 |

#### M6 · Enrutamiento esencial (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Definir rutas, `RouterOutlet`, `RouterLink` y enlace activo | Básico | **ya está** (M4 T1) | AD Routing (Define routes, Outlets, Navigate)·RS·LA c9·UD s14·FCC·DT s9 |
| 2 | Parámetros de ruta, query params y enlace a entradas del componente | Básico | **ya está** (M4 T4) | AD Routing (Read route state)·FM·LA c9·FCC |
| 3 | Rutas hijas, layouts y outlets con nombre | Básico | **está pero básico** (M4 T4): hoy es un apartado de un tema amplio; faltan los layouts anidados y los outlets secundarios con ejemplo completo | AD Routing (Outlets)·FCC·DT s13·LA c9 |
| 4 | Redirecciones, ruta comodín y página 404 | Básico | **falta** | AD Routing (Redirecting routes)·FCC·LA c9 |
| 5 | Carga diferida con `loadComponent` y `loadChildren` | Básico | **ya está** (M4 T3) | AD Routing (Loading strategies)·RS·UD s15·DT s13·ENT |
| 6 | Guards funcionales: `canActivate`, `canActivateChild` y `canMatch` | Básico | **ya está** (M4 T2) | AD Routing (Guards)·RS·FM·UD s36·FCC·DT s16 |

#### M7 · Formularios I (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Los tres sistemas de formularios (Signal Forms, reactivos y de plantilla): cuál elegir hoy | Básico | **falta** | AD Forms (Overview, Comparison)·RS·LA c10·AE c2 |
| 2 | Signal Forms: modelo, `form()` y enlace de campos | Básico | **ya está** (M5 T5) | AD Forms · Signal Forms (Form models)·RMP (Signal Forms)·FM·MAS |
| 3 | Signal Forms: validación y estado del campo (tocado, sucio, inválido) | Básico | **está pero básico** (M5 T5): hoy todo Signal Forms está en un único tema de 2.548 palabras; se parte y faltan el diseño del modelo y la gestión del estado del campo | AD Forms · Signal Forms (Field state, Validation)·FM·MAS |
| 4 | Signal Forms: envío del formulario y errores devueltos por el servidor | Básico | **falta** | AD Forms · Signal Forms (Form submission)·FM |
| 5 | Formularios reactivos: `FormGroup` y `FormControl` con tipado estricto | Básico | **ya está** (M5 T1) | AD Forms · Reactive (Strictly typed)·RS·LA c10·FCC·DT s17·RMP |
| 6 | Formularios de plantilla: cuándo siguen siendo válidos | Básico | **ya está** (M5 T4) | AD Forms · Template-driven·RS·LA c10·FCC |

#### M8 · HTTP y datos remotos (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `provideHttpClient` y peticiones tipadas | Básico | **ya está** (M7 T1) | AD HTTP (Setup, Making requests)·RS·LA c8·FCC·UD s2 |
| 2 | Errores HTTP, reintentos y estados de carga, vacío y error en la interfaz | Básico | **está pero básico** (M7 T3): hoy se centra en el registro de interceptores; faltan `catchError`, `retry` y los tres estados de la vista con su error diagnosticado | AD HTTP (Making requests)·LA c11·FCC·AE c7 |
| 3 | Interceptores funcionales | Básico | **ya está** (M7 T2) | AD HTTP (Intercepting)·RS·FCC·ENT·LA c8 |
| 4 | `httpResource`: lectura reactiva de datos | Básico | **está pero básico** (M2 T6): hoy comparte tema con `resource()`; faltan el estado de carga y error, la recarga y el esquema de validación de la respuesta | AD HTTP (httpResource)·RMP·MAS·FM |
| 5 | Probar HTTP: `provideHttpClientTesting` y `HttpTestingController` | Básico | **ya está** (M10 T3) | AD HTTP (Testing)·LA c13·MA c8 |
| 6 | Entornos de build y proxy de desarrollo: una URL de API por entorno | Básico | **falta** | AD CLI (Build environments, Serving)·RS·AE c10 |


### Tramo 2 · Aplicación (nivel Intermedio) — 70 temas

#### M9 · Componentes avanzados (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Proyección avanzada: varios huecos, contenido por defecto, `ngProjectAs` y proyección condicional | Intermedio | **está pero básico** (M1 T3): el tema actual cubre el uso básico; faltan los huecos múltiples, el contenido de reserva y los límites de la proyección | AD Componentes (Content projection)·FCC·RMP·LA c3 |
| 2 | Trabajo posterior al render: `afterNextRender`, `afterEveryRender` y sus fases | Intermedio | **ya está** (M1 T5) | AD Componentes (Lifecycle, Using DOM APIs)·MA c4·ENT |
| 3 | Renderizar componentes por programa: `NgComponentOutlet` y `ViewContainerRef.createComponent` | Intermedio | **falta** | AD Componentes (Programmatically rendering)·RS (Dynamic components) |
| 4 | API de composición de directivas: `hostDirectives` | Intermedio | **falta** | AD Directivas (Composition API)·RMP·MA c4 |
| 5 | Herencia de componentes y por qué preferir composición | Intermedio | **falta** | AD Componentes (Inheritance)·ENT |
| 6 | Usar las API del DOM con seguridad: `ElementRef`, `Renderer2` y por qué importa fuera del navegador | Intermedio | **falta** | AD Componentes (Using DOM APIs)·NGN Arquitectura·AD SSR |
| 7 | Custom Elements con `@angular/elements` | Intermedio | **falta** | AD Componentes (Custom Elements)·MA c9 |

#### M10 · Signals en profundidad (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `resource()` y `rxResource`: estado asíncrono reactivo, recarga y cancelación | Intermedio | **ya está** (M2 T6) | AD Signals (Resources)·RMP (Resource API)·MAS·MA c7·FM |
| 2 | Signals con retardo: `debounce` sobre entradas del usuario | Intermedio | **falta** | AD Signals (Debounced signals) |
| 3 | Efectos para API no reactivas: limpieza, `afterRenderEffect` y sincronización con librerías externas | Intermedio | **falta** | AD Signals (Side effects)·MA c7·ENT |
| 4 | Cómo se propaga un cambio: igualdad, perezoso frente a ansioso y el problema del diamante | Intermedio | **falta** | ENT·MA c7·MAS·AD Signals (Overview) |
| 5 | Componentes con enlace bidireccional propio: `model()` a fondo | Intermedio | **falta** | AD Componentes (Inputs)·MAS·FM |
| 6 | Probar signals, `computed` y efectos | Intermedio | **ya está** (M15 T1) | AD Testing (Component scenarios)·MAS·ENT·MA c8 |

#### M11 · RxJS para Angular (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Observable frente a Promise; flujos fríos y calientes | Intermedio | **ya está** (M6 T1) | AD RxJS interop·RS·LA c6·MA c5·FCC |
| 2 | Operadores de transformación y filtrado: `map`, `filter`, `debounceTime` y `distinctUntilChanged` | Intermedio | **ya está** (M6 T2) | RS·LA c6·FCC·MA c5 |
| 3 | Operadores de aplanamiento: `switchMap`, `mergeMap`, `concatMap` y `exhaustMap` | Intermedio | **ya está** (M6 T4) | ENT·RS·MA c5·AE c2 |
| 4 | Combinar flujos: `combineLatest`, `forkJoin`, `withLatestFrom` y `zip` | Intermedio | **está pero básico** (M6 T2): hoy `combineLatest` es un apartado; faltan `forkJoin`, `withLatestFrom` y el caso del tablero con varias fuentes | ENT·RS·AE c2 |
| 5 | Subjects y multidifusión: `BehaviorSubject`, `share` y `shareReplay` | Intermedio | **está pero básico** (M6 T4): hoy comparte tema con el aplanamiento; faltan `share` frente a `shareReplay` y la fuga por `refCount` | ENT·RS·FCC·AE c2 |
| 6 | Suscripciones sin fugas: `takeUntilDestroyed`, `AsyncPipe` y `DestroyRef` | Intermedio | **ya está** (M6 T3) | AD RxJS interop·MA c5·ENT·LA c6 |
| 7 | Interoperar: `toSignal`, `toObservable` y `rxResource` | Intermedio | **está pero básico** (M2 T3): el tema actual compara los dos modelos; faltan las opciones de `toSignal` (valor inicial, `requireSync`) y el coste de cada puente | AD RxJS interop·MAS·MA c5·ENT |

#### M12 · Enrutamiento avanzado (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Resolvers funcionales: datos listos antes de mostrar la ruta | Intermedio | **ya está** (M4 T6) | AD Routing (Resolvers)·FCC·LA c9 |
| 2 | Cargar datos de ruta con resources | Intermedio | **falta** | AD Routing (Data fetching with resources)·FM |
| 3 | `canDeactivate`: proteger un borrador | Intermedio | **está pero básico** (M4 T5): 560 palabras; faltan el diálogo de confirmación asíncrono y la prueba de la navegación cancelada | AD Routing (Guards)·FCC·LA c9 |
| 4 | Ciclo de vida y eventos del router: depurar una navegación | Intermedio | **falta** | AD Routing (Lifecycle and events)·FCC |
| 5 | Estrategias de carga y precarga de rutas | Intermedio | **falta** | AD Routing (Loading strategies)·AD Rendimiento (Lazy-loaded routes)·ENT |
| 6 | Límites de error: en rutas y con `@boundary` en plantillas | Intermedio | **falta** | AD Routing (Error boundaries)·AD Plantillas (@boundary)·AD Errores no controlados |
| 7 | Personalizar el router: títulos, coincidencias propias, restauración de scroll y transiciones de ruta | Intermedio | **falta** | AD Routing (Customizing, Custom matches, Route transition animations) |

#### M13 · Formularios II (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Signal Forms: esquemas, lógica de formulario y reglas entre campos | Intermedio | **falta** | AD Forms · Signal Forms (Schemas, Form logic, Cross-field)·FM |
| 2 | Signal Forms: operaciones asíncronas y metadatos de campo | Intermedio | **falta** | AD Forms · Signal Forms (Async operations, Field metadata) |
| 3 | Signal Forms: arrays y formularios dinámicos a partir de JSON | Intermedio | **falta** | AD Forms · Signal Forms (Dynamic forms with JSON)·FM·RS (Dynamic forms) |
| 4 | Controles propios: para Signal Forms y con `ControlValueAccessor` | Intermedio | **falta** | AD Forms · Signal Forms (Custom controls)·RS (Control value accessor)·AE c8 |
| 5 | Formularios reactivos: validadores síncronos, asíncronos y entre campos | Intermedio | **ya está** (M5 T2) | AD Forms · Reactive (Validate input)·RS·FCC·DT s18 |
| 6 | `FormArray` y formularios reactivos dinámicos | Intermedio | **ya está** (M5 T3) | AD Forms · Reactive (Dynamic forms)·FCC·DT s19·AE c8 |
| 7 | Migrar de formularios reactivos a Signal Forms y probar formularios | Intermedio | **falta** | AD Forms · Signal Forms (Migrating, Testing) |

#### M14 · Estilos, componentes de interfaz y accesibilidad (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Estilos de aplicación: hojas globales, CSS moderno y Tailwind en Angular | Intermedio | **falta** | AD Tailwind·RMP (Modern CSS)·AD Componentes (Styling) |
| 2 | Angular Material: instalación, temas con tokens y densidad | Intermedio | **está pero básico** (M10 T4): hoy Material aparece solo como objeto de prueba con harnesses; faltan la instalación, el sistema de temas y la personalización | AD Angular Material·LA c12·DT s14·RMP |
| 3 | Angular CDK: overlay, portal, utilidades de accesibilidad y scroll virtual | Intermedio | **está pero básico** (M10 T4): hoy se menciona junto a Material; falta cada primitiva con su caso | AD Angular CDK·RMP·AE c8 |
| 4 | Angular Aria: patrones accesibles sin estilos (listbox, menú, pestañas, árbol, rejilla) | Intermedio | **falta** | AD Angular Aria·RMP |
| 5 | Accesibilidad como comportamiento: foco, teclado, roles y lectores de pantalla | Intermedio | **ya está** (M14 T1) | AD Accesibilidad·RS·AE c8 |
| 6 | Animaciones con `animate.enter`, `animate.leave` y CSS, respetando `prefers-reduced-motion` | Intermedio | **ya está** (M15 T3) | AD Animaciones (Enter and Leave, Complex with CSS)·RS·UD s42 |
| 7 | Arrastrar y soltar con el CDK, incluida la rejilla en dos dimensiones | Intermedio | **falta** | AD Drag and drop·RMP |

#### M15 · Pruebas I (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Vitest como ejecutor por defecto: configuración, modo observación y jsdom | Intermedio | **está pero básico** (M10 T3): hoy aparece dentro del tema de HTTP; falta un tema propio con la configuración de `ng test` y la lectura de un fallo | AD Testing (Overview)·RMP (ng test)·MA c8·LA c13·ENT |
| 2 | `TestBed` con componentes standalone | Intermedio | **ya está** (M10 T1) | AD Testing (Basics of testing components)·LA c13·MA c8·UD s44·FCC |
| 3 | Escenarios de componentes: entradas, salidas, asincronía y componentes anidados | Intermedio | **falta** | AD Testing (Component scenarios)·LA c13·FCC |
| 4 | Probar servicios, pipes y directivas | Intermedio | **falta** | AD Testing (Services, Pipes, Attribute directives)·LA c13·FCC |
| 5 | Angular Testing Library: probar como lo usa una persona | Intermedio | **ya está** (M10 T2) | MA c8·ENT·NPM |
| 6 | Harnesses de componentes: usar los de Material | Intermedio | **ya está** (M10 T4) | AD Testing (Component harnesses)·RMP·LA c13 |
| 7 | Probar el router y la navegación con `RouterTestingHarness` | Intermedio | **falta** | AD Routing (Testing)·AD Testing (Routing and navigation) |

#### M16 · Gestión de estado (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Estado local, de funcionalidad y global: un store propio con signals | Intermedio | **ya está** (M9 T1, M13 T3) | ENT·MAS·AE c2·FM |
| 2 | NgRx SignalStore: estado, métodos, `computed` y funcionalidades reutilizables | Intermedio | **falta** | ENT·AE c9·NPM·MAS |
| 3 | NgRx Store: acciones, reducers y selectores | Intermedio | **ya está** (M9 T2) | RS·UD s41·AE c9·ENT |
| 4 | NgRx Effects y Entity: efectos secundarios y colecciones normalizadas | Intermedio | **falta** | AE c9·UD s41·RS |
| 5 | Cuándo una librería de estado justifica su complejidad | Intermedio | **ya está** (M9 T3) | ENT·AE c9 |
| 6 | Estado del servidor: caché, revalidación y actualizaciones optimistas | Intermedio | **falta** | FM·AE c8·NPM·ENT |

#### M17 · Arquitectura de la aplicación (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Organización por funcionalidad y límites entre carpetas | Intermedio | **ya está** (M8 T2, M13 T1) | AD Style Guide·AE c3·MA c2·ENT |
| 2 | Arranque sin NgModules: `bootstrapApplication` y proveedores de entorno | Intermedio | **ya está** (M8 T1) | AD Componentes·MA c2·UD s39·DT s22 |
| 3 | NgModules heredados: leerlos, convivir con ellos e importarlos desde standalone | Intermedio | **está pero básico** (M8 T3): hoy se trata como migración; falta enseñar a leer un módulo heredado y a interoperar sin migrar | AD NgModules·RS·FCC·UD s39 |
| 4 | Autenticación y autorización en una SPA: guards, interceptor de token y navegación por rol | Intermedio | **falta** | AE c5–c6·UD s36·DT s16, s25–s26·FCC |
| 5 | Errores no controlados: `ErrorHandler` global, errores de navegación y avisos al usuario | Intermedio | **está pero básico** (M7 T3): hoy solo cubre errores HTTP; faltan el manejador global y la política de qué se muestra y qué se registra | AD Errores no controlados·LA c11·FCC |
| 6 | Seguridad de base: XSS, sanitización automática y sus fronteras | Intermedio | **ya está** (M14 T2) | AD Seguridad·RS·ENT |

#### M18 · Internacionalización (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `@angular/localize`: marcar texto en plantillas y en código | Intermedio | **ya está** (M14 T3) | AD i18n (Prepare component)·RS·AE c10 |
| 2 | Archivos de traducción, identificadores propios, plurales y selecciones ICU | Intermedio | **está pero básico** (M14 T3): hoy es un tema conceptual; faltan la extracción, el formato de los archivos y las expresiones ICU | AD i18n (Translation files, Custom IDs)·RS |
| 3 | Formato por locale: fechas, números y monedas | Intermedio | **falta** | AD i18n (Format data, Locales by ID)·LA c4 |
| 4 | Compilar y desplegar varios locales | Intermedio | **falta** | AD i18n (Merge translations, Deploy multiple locales) |
| 5 | Traducción en tiempo de ejecución con Transloco como alternativa | Intermedio | **falta** | NGN Localización (Transloco)·NPM |

#### M19 · Build, despliegue y actualización (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `ng build`: el sistema de build actual, configuraciones, presupuestos y mapas de código | Intermedio | **falta** | AD CLI (Building, Builders)·RMP (modern bundlers)·RS·LA c14 |
| 2 | AOT frente a JIT: qué hace el compilador antes de servir | Intermedio | **ya está** (M0 T4) | AD CLI (AOT)·RS·ENT |
| 3 | Desplegar una aplicación estática: `ng deploy`, alojamiento y rutas del lado del servidor | Intermedio | **falta** | AD CLI (Deployment)·RS·LA c14·UD s16·DT s6·FCC |
| 4 | Actualizar con `ng update`: una versión mayor a la vez | Intermedio | **está pero básico** (M12 T2, M12 T3): dos temas de 568 y 565 palabras que se fusionan; faltan la ejecución real de `ng update` y la lectura de sus migraciones | AD Keeping up-to-date·VER·ENT |
| 5 | Migraciones automáticas del CLI: standalone, control de flujo, `inject` y entradas con signals | Intermedio | **está pero básico** (M8 T3): hoy cubre solo la de NgModules; faltan las demás migraciones y revisar el diff que dejan | AD CLI (Schematics)·RMP·MA c2·ENT |


### Tramo 3 · Integración (nivel Avanzado) — 135 temas

#### M20 · Detección de cambios por dentro (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El modelo completo: árbol de vistas, marcas de suciedad y pasadas de comprobación | Avanzado | **está pero básico** (M2 T4): hoy se explica como camino hacia zoneless; faltan el árbol de vistas, qué marca cada cosa y una traza con DevTools | AD Rendimiento (Runtime overview)·ENT·MA c7·RMP (Change Detection) |
| 2 | `OnPush` por defecto en Angular 22 y cuándo usar `Eager` | Avanzado | **ya está** (M11 T5) | AD Rendimiento (Skipping subtrees)·ENT·MAS·ION Zoneless |
| 3 | Zoneless: qué notifica a Angular y qué no | Avanzado | **ya está** (M11 T4, M2 T4) | AD Rendimiento (Zoneless)·RMP (Zoneless Angular)·MAS·ENT |
| 4 | Componentes reactivos: cómo una signal leída en la plantilla programa el render | Avanzado | **falta** | MA c7·MAS·ENT·AD Signals (Overview) |
| 5 | Zone.js heredado: `NgZone`, contaminación de zona y `runOutsideAngular` | Avanzado | **falta** | AD Rendimiento (Zone pollution)·ENT·AD Testing (Zone.js utilities) |
| 6 | Migrar una aplicación existente a zoneless | Avanzado | **está pero básico** (M11 T4): el tema actual explica el modo; falta el procedimiento de migración con los fallos típicos (campo asignado en un `setTimeout`) | AD Rendimiento (Zoneless)·ION Zoneless·MAS |

#### M21 · Inyección de dependencias avanzada (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Jerarquía de inyectores: de entorno y de elemento | Avanzado | **ya está** (M3 T3) | AD DI (Hierarchical injectors)·ENT·MA c3 |
| 2 | Modificadores de resolución: `optional`, `self`, `skipSelf` y `host` | Avanzado | **ya está** (M3 T4) | AD DI (Hierarchical injectors)·ENT·FCC |
| 3 | `providers` frente a `viewProviders` y proveedores a nivel de ruta | Avanzado | **falta** | AD DI (Hierarchical injectors)·ENT·AD Routing (Define routes) |
| 4 | Proveedores múltiples, tokens con fábrica y tokens que el build puede eliminar | Avanzado | **falta** | AD DI (Optimizing injection tokens)·ENT·FM |
| 5 | Servicios cargados de forma diferida | Avanzado | **falta** | AD DI (Lazy loading services)·AD Rendimiento (Lazy loading services) |
| 6 | Depurar la inyección: árbol de inyectores en DevTools y errores típicos | Avanzado | **falta** | AD DI (Debugging and troubleshooting)·RMP (DI debugging APIs) |

#### M22 · Renderizado en servidor e híbrido (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | SSR: qué se ejecuta en el servidor y qué en el navegador | Avanzado | **ya está** (M11 T1) | AD SSR (Overview)·RS·MA c9·UD s16·ENT |
| 2 | Modos de render por ruta: CSR, SSR y prerender con `app.routes.server.ts` | Avanzado | **ya está** (M11 T6) | AD SSR (Server routing)·RMP (Route-level render mode)·AD Routing (Rendering strategies) |
| 3 | Hidratación no destructiva y sus errores de desajuste | Avanzado | **ya está** (M11 T2) | AD SSR (Hydration)·RS·ENT·RMP |
| 4 | Hidratación incremental con `@defer` y disparadores `hydrate` | Avanzado | **ya está** (M11 T7) | AD SSR (Incremental Hydration)·RMP |
| 5 | Reproducción de eventos (event replay) | Avanzado | **falta** | AD SSR (Hydration)·RMP (Event replay) |
| 6 | Componentes compatibles con el servidor: `DOCUMENT`, petición y respuesta por inyección, y código solo de navegador | Avanzado | **falta** | AD SSR (Server-compatible components)·AD Componentes (Using DOM APIs) |
| 7 | `TransferState` y caché de `HttpClient` entre servidor y navegador | Avanzado | **ya está** (M15 T4) | AD SSR (Caching data)·MA c9 |

#### M23 · SSR en producción (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Prerender con parámetros y estrategias de reserva; aplicación totalmente estática | Avanzado | **está pero básico** (M11 T6): hoy es un apartado del tema de modos de render; faltan `getPrerenderParams`, las estrategias de reserva y la salida estática | AD SSR (Customizing prerendering, Fully static) |
| 2 | Cabeceras, códigos de estado y redirecciones desde las rutas de servidor | Avanzado | **falta** | AD SSR (Headers and status codes, Redirects) |
| 3 | Configurar el servidor: Node.js y entornos que no son Node | Avanzado | **falta** | AD SSR (Configuring a server) |
| 4 | Seguridad en SSR: qué expone el servidor y cómo limitarlo | Avanzado | **falta** | AD SSR (Security)·AD Seguridad |
| 5 | SEO y metadatos: `Title`, `Meta` y datos estructurados | Avanzado | **falta** | LA c14·AE c10·RS |

#### M24 · Rendimiento de carga y de ejecución (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `@defer`: disparadores, estados y precarga | Avanzado | **ya está** (M11 T3) | AD Rendimiento (Deferred loading)·RS·UD s15·ENT·RMP |
| 2 | Tamaño del bundle: analizarlo, presupuestos y carga diferida de rutas | Avanzado | **falta** | AD Rendimiento (Lazy-loaded routes)·AD CLI (Building)·LA c15 |
| 3 | Imágenes a fondo: `NgOptimizedImage`, `srcset`, cargadores y LCP | Avanzado | **falta** | AD Rendimiento (Image optimization)·RS·LA c15·RMP |
| 4 | Core Web Vitals en una aplicación Angular: medir LCP, INP y CLS | Avanzado | **está pero básico** (M14 T4): hoy es un tema conceptual sobre contratos de experiencia; faltan la medición real y una mejora demostrada | AD Rendimiento (Loading overview)·LA c15 |
| 5 | Perfilar con Angular DevTools y el panel Performance de Chrome | Avanzado | **ya está** (M14 T5) | AD Rendimiento (Chrome DevTools profiling)·AD DevTools·FM |
| 6 | Rendimiento en ejecución: cálculos lentos, saltar subárboles y listas grandes con scroll virtual | Avanzado | **falta** | AD Rendimiento (Slow computations, Skipping subtrees)·AD Angular CDK·ENT |

#### M25 · Pruebas II (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Pruebas de extremo a extremo con Playwright | Avanzado | **está pero básico** (M15 T2): 963 palabras compartidas con Cypress; faltan los localizadores, las trazas y la ejecución en CI | AD CLI (End-to-End Testing)·RS·RMP (e2e strategy) |
| 2 | Cypress: E2E y pruebas de componente | Avanzado | **está pero básico** (M15 T2): comparte tema con Playwright; falta la prueba de componente y la comparación con criterio | AD CLI (End-to-End Testing)·NPM |
| 3 | Cobertura de código y depuración de pruebas | Avanzado | **falta** | AD Testing (Code coverage, Debugging tests)·RS |
| 4 | Dobles de prueba para Angular: proveedores falsos, ng-mocks y Spectator | Avanzado | **falta** | ENT·MA c8·NPM |
| 5 | Crear harnesses para componentes propios | Avanzado | **falta** | AD Testing (Creating harnesses, Additional environments) |
| 6 | Migrar de Karma y Jasmine a Vitest; utilidades de prueba de Zone.js | Avanzado | **falta** | AD Testing (Migrating from Karma, Karma and Jasmine, Zone.js utilities)·RMP |
| 7 | Storybook: catálogo de componentes y pruebas de interacción | Avanzado | **falta** | NGN Web (Storybook)·NPM·AE c8 |

#### M26 · PWA, service workers y web workers (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El service worker de Angular: `@angular/pwa` y `ngsw-config.json` | Avanzado | **falta** | AD Service Workers & PWAs·UD s43·NPM |
| 2 | Actualizaciones de versión y notificaciones push desde el service worker | Avanzado | **falta** | AD Service Workers & PWAs·UD s43 |
| 3 | Aplicación instalable: manifiesto, iconos y criterios de instalación | Avanzado | **falta** | AD Service Workers & PWAs·ION PWA·CAP Web/PWA |
| 4 | Web workers: sacar cálculo pesado del hilo principal | Avanzado | **falta** | AD Web workers |
| 5 | Datos sin conexión en la web: almacenamiento local y sincronización al volver la red | Avanzado | **falta** | AD Service Workers & PWAs·NGN Sin conexión |

#### M27 · Librerías, monorepos y herramientas (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Librerías con el CLI: un workspace, varias aplicaciones y código compartido | Avanzado | **ya está** (M8 T4) | AD Librerías (Creating, Using)·RS·AE c3 |
| 2 | Publicar una librería: Angular Package Format, dependencias entre pares y versionado | Avanzado | **falta** | AD Librerías (Angular Package Format)·RS |
| 3 | Schematics propios: `ng add`, `ng generate` y `ng update` para una librería | Avanzado | **falta** | AD CLI (Authoring schematics, Schematics for libraries)·NGN CLI |
| 4 | Nx: grafo de proyectos, límites entre módulos y caché de tareas | Avanzado | **falta** | NGN Nx·AE c3·NPM |
| 5 | Builders del CLI y pipeline de build personalizado | Avanzado | **falta** | AD CLI (Builders)·AD Custom build pipeline·RS |
| 6 | Sistema de diseño: tokens, temas y componentes sin estilos | Avanzado | **falta** | AD Angular Aria·AD Angular Material·RMP (Material customizability)·AE c8 |

#### M28 · Seguridad avanzada (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | CSP con nonce y Trusted Types | Avanzado | **ya está** (M14 T6) | AD Seguridad·RS·RMP (Trusted Types) |
| 2 | `DomSanitizer`: contextos de seguridad y cuándo es legítimo saltarlo | Avanzado | **está pero básico** (M14 T2): el tema actual cubre las fronteras de la sanitización; faltan los contextos y los `bypassSecurityTrust*` con su riesgo demostrado | AD Seguridad·RS |
| 3 | OAuth 2.0 y OpenID Connect en una SPA: PKCE, dónde vive el token y patrón BFF | Avanzado | **falta** | AE c5·UD s36·DT s25–s26 |
| 4 | XSRF con `HttpClient` y XSSI | Avanzado | **falta** | AD Seguridad·RS (HttpClient CSRF, XSSI) |
| 5 | Cadena de suministro: auditoría de dependencias y política de actualización | Avanzado | **falta** | AD Keeping up-to-date·AE c10 |

#### M29 · Angular Native (alfa): primeros pasos (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es Angular Native y qué significa que esté en alfa: versión fijada del curso y cómo se revisa | Avanzado | **ya está** (M16 T1, M16 T4) | NGN Primeros pasos·NGN Comparación (Maturity)·NPM |
| 2 | Entorno y primera app: Node, Xcode, Android Studio y `create-expo-app` con la plantilla `@ng-native/template` | Avanzado | **está pero básico** (M16 T1): el tema actual se escribió con Expo SDK 57 y la plantilla 0.24.0; hoy la plantilla 0.25.0 fija Expo SDK 58 y React Native 0.88; falta el entorno paso a paso | NGN Primeros pasos·NPM |
| 3 | Anatomía del proyecto: `src/main.ts`, `registerPlatformComponents`, `mount()`, `app.json` y `metro.config.js` | Avanzado | **falta** | NGN Apps existentes·NGN Platform·NGN Metro |
| 4 | Expo Go frente a development build, y qué cambios se aplican en caliente y cuáles recargan la app | Avanzado | **falta** | NGN Primeros pasos·NGN Despliegue·NGN Limitaciones (Hot reload) |
| 5 | Añadir Angular Native a un proyecto existente: Expo en blanco, Angular CLI (`ng add @ng-native/schematics`) y Nx | Avanzado | **falta** | NGN Apps existentes·NGN CLI·NGN Nx |
| 6 | TypeScript, verificación de plantillas con `ngc` y las reglas del plugin de ESLint | Avanzado | **falta** | NGN Apps existentes (Checking templates)·NGN ESLint |

#### M30 · Angular Native (alfa): arquitectura (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | De `Renderer2` a `UIView` y `android.view.View`: los paquetes `platform`, `components` y `fabric` | Avanzado | **está pero básico** (M16 T1): el tema actual explica que no hay WebView; faltan el reparto en tres paquetes y el recorrido de un elemento hasta la vista nativa | NGN Arquitectura·NGN Fabric·NGN Platform |
| 2 | El árbol retenido y el commit: una llamada a Fabric por pasada de detección de cambios, medida con `engine.stats` | Avanzado | **falta** | NGN Arquitectura (What a commit is)·NGN Fabric (Commits) |
| 3 | Arranque sin `bootstrapApplication`: `mount()`, siempre zoneless, y sus opciones | Avanzado | **falta** | NGN Platform·NGN Apps existentes (entry point) |
| 4 | Eventos: despacho por etiqueta de nodo, negociación del responder y errores hacia `ErrorHandler` | Avanzado | **falta** | NGN Arquitectura (Events)·NGN Limitaciones (Errors)·NGN Componentes (Events) |
| 5 | No hay DOM: qué API de Angular no existen en nativo y con qué se sustituyen | Avanzado | **está pero básico** (M16 T4): el tema actual evalúa madurez; falta la lista de límites documentados (sin `DomSanitizer`, `NgOptimizedImage`, `@angular/animations`, SSR ni Angular DevTools) con su alternativa | NGN Limitaciones·NGN ESLint |
| 6 | Metro y la compilación AOT: `withAngularNative`, CSS con lightningcss y la regla de `host` y `styles` sin valores importados | Avanzado | **falta** | NGN Metro·NGN Limitaciones·NGN Arquitectura (CSS) |

#### M31 · Angular Native (alfa): interfaz nativa (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `<view>`, `<text>` y layout con flexbox: nombres en minúscula y propiedades compartidas | Avanzado | **está pero básico** (M16 T1): el tema actual usa estos elementos en un ejemplo; faltan el modelo de layout, las propiedades compartidas y el fallo de escribir `<View>` | NGN Componentes (Layout, Text)·NGN ESLint |
| 2 | Área segura, borde a borde en Android y teclado en pantalla | Avanzado | **falta** | NGN Android edge-to-edge·NGN Componentes (Safe area, Keyboard avoiding view) |
| 3 | `<scroll-view>` y tirar para refrescar | Avanzado | **falta** | NGN Componentes (Scroll view)·NGN Limitaciones |
| 4 | Imágenes, imagen de fondo e indicador de actividad | Avanzado | **falta** | NGN Componentes (Image, Activity indicator) |
| 5 | Entradas y pulsaciones: `<text-input>`, `<switch>`, `<pressable>` y sus eventos | Avanzado | **falta** | NGN Componentes (Input, Switch, Pressable) |
| 6 | Modales, superposición a pantalla completa y diálogos del sistema | Avanzado | **falta** | NGN Componentes (Modal)·NGN Router (Screens)·NGN Device (Dialogs) |
| 7 | Markdown, elementos HTML admitidos y vistas nativas de terceros con `registerViewName` | Avanzado | **falta** | NGN Componentes (Markdown, HTML elements)·NGN Fabric |

#### M32 · Angular Native (alfa): CSS de Fabric y Tailwind (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El motor de CSS: se compila en el build y la cascada se resuelve en el dispositivo | Avanzado | **está pero básico** (M16 T2): el tema actual dice que los estilos se resuelven en build; faltan la cascada en ejecución, la precedencia y la herencia emulada del texto | NGN Arquitectura (CSS)·NGN Fabric (CSS engine)·NGN Comparación (Styling) |
| 2 | CSS admitido y regla de alcance: qué se compila, qué se descarta con aviso y qué no existirá (`::before`, `::after`, tablas) | Avanzado | **falta** | NGN Arquitectura (Scope rule)·NGN Fabric (Supported CSS) |
| 3 | Tailwind en nativo: `@ng-native/tailwind`, `withTailwind` y la hoja generada | Avanzado | **ya está** (M16 T2) | NGN Tailwind·NGN Theming |
| 4 | Variantes de plataforma y de estado: `ios:`, `android:`, `native:`, `web:`, `hover:` como pulsado y `focus-visible:` | Avanzado | **está pero básico** (M16 T2): el tema actual cubre las variantes de plataforma; faltan las de estado y su diferencia con la web | NGN Theming·NGN Tailwind |
| 5 | Modo oscuro: clase, esquema del sistema, `ColorScheme` y `watchConditions` | Avanzado | **falta** | NGN Theming (dark)·NGN Device (Color scheme) |
| 6 | Tokens de diseño: propiedades personalizadas entre componentes, `injectToken` y fuentes | Avanzado | **falta** | NGN Theming (Tokens)·NGN Expo (Fonts) |

#### M33 · Angular Native (alfa): navegación nativa (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `provideNativeRouter` y `<native-stack-outlet>`: el Router de Angular sobre pantallas nativas | Avanzado | **ya está** (M16 T3) | NGN Router·NGN Arquitectura (Routing) |
| 2 | `NativeNavigation`: `push`, `replace`, `present`, `back`, `popTo` y una pantalla por URL | Avanzado | **está pero básico** (M16 T3): el tema actual muestra la navegación básica; faltan el servicio completo, `nativeRouterLink` y la regla de una pantalla por URL | NGN Router (Screens) |
| 3 | Cabecera nativa: `<native-header>` y sus elementos | Avanzado | **falta** | NGN Router (Header) |
| 4 | Pestañas nativas con `<native-tabs-outlet>` | Avanzado | **falta** | NGN Router (Tabs)·NGN Iconos (As an image) |
| 5 | Modales y hojas: opciones de presentación, rechazar el cierre y navegar desde una pantalla presentada | Avanzado | **falta** | NGN Router (Screens) |
| 6 | Deep links: `DeepLinks`, padres de enlace con `withLinkParent` y guards al llegar | Avanzado | **falta** | NGN Router·NGN Device (Deep links) |
| 7 | Rutas por archivo (`fileRoutes` y `@ng-native/analog`) y fallos al cargar una página | Avanzado | **falta** | NGN Router (File routes)·NGN Analog |

#### M34 · Angular Native (alfa): formularios, datos y listas (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Signal Forms con controles nativos: el contrato `value`/`checked` y por qué no hay `ControlValueAccessor` | Avanzado | **falta** | NGN Formularios·AD Forms · Signal Forms |
| 2 | Validación visible, envío y arrays en formularios nativos | Avanzado | **falta** | NGN Formularios·NGN Testing (Forms) |
| 3 | `HttpClient` en nativo: `provideNativeHttpClient()` y el fallo de respuesta con cuerpo nulo | Avanzado | **falta** | NGN Platform (HTTP)·NGN Limitaciones (HttpClient) |
| 4 | Listas virtualizadas con `<virtual-list>`: reciclaje, filas que se miden solas y posición estable | Avanzado | **falta** | NGN Componentes (Lists)·NGN Limitaciones |
| 5 | Listas por secciones y acciones de fila | Avanzado | **falta** | NGN Componentes (Lists)·NGN Limitaciones (Section lists) |
| 6 | Trabajar sin conexión: `Network`, `Storage` o `Database`, cola de escrituras e interceptor | Avanzado | **falta** | NGN Sin conexión·NGN Expo (Network, Storage, Database) |

#### M35 · Angular Native (alfa): dispositivo y módulos de Expo como servicios (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `@ng-native/device`: pantalla, área segura, esquema de color, estado de la app y tokens `OS` y `OS_VERSION` | Avanzado | **falta** | NGN Device |
| 2 | Teclado, botón atrás de Android, barras de estado y de navegación, compartir y vibración | Avanzado | **falta** | NGN Device·NGN Android edge-to-edge |
| 3 | Usar un módulo de Expo como servicio inyectable y pedir permisos | Avanzado | **está pero básico** (M16 T3): el tema actual inyecta un servicio de Expo; faltan el patrón general, la señal `available` y el flujo completo de permisos | NGN Expo (Using a module, Permissions)·NGN Device (Android permissions) |
| 4 | Cámara, selector de imágenes y documentos, biblioteca multimedia y reproductor | Avanzado | **falta** | NGN Expo (Media and camera) |
| 5 | Ubicación y mapas | Avanzado | **está pero básico** (M16 T3): el tema actual trata el permiso denegado; faltan el seguimiento de posición y `<expo-map>` | NGN Expo (Location, Maps) |
| 6 | Almacenamiento: `Storage`, almacenamiento seguro, sistema de archivos y base de datos SQLite | Avanzado | **falta** | NGN Expo (Storage and files)·NGN Sin conexión |
| 7 | Notificaciones locales y push (Firebase Messaging) y tareas en segundo plano | Avanzado | **falta** | NGN Expo (Notifications, Background task)·NGN Firebase Messaging |

#### M36 · Angular Native (alfa): capacidades avanzadas y código nativo (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Identidad y seguridad: biometría, Sign in with Apple, criptografía y transparencia de seguimiento | Avanzado | **falta** | NGN Expo (Location and identity) |
| 2 | Estado del dispositivo: sensores, hápticos, batería, red, orientación y plegables | Avanzado | **falta** | NGN Expo (Device state, Feedback) |
| 3 | Fuera de la app: Live Activities, widgets de pantalla de inicio, Apple Watch y notificaciones en curso | Avanzado | **falta** | NGN Expo (Live Activities, Widgets, Apple Watch, Ongoing notifications) |
| 4 | IA en el dispositivo desde un servicio Angular | Avanzado | **falta** | NGN Expo (On-device AI) |
| 5 | Escribir un módulo nativo propio en Swift y Kotlin e inyectarlo como servicio | Avanzado | **falta** | NGN Módulos nativos·NGN Expo (Native views) |
| 6 | Llamar a los SDK de iOS y Android desde TypeScript con `@ng-native/nativescript` | Avanzado | **falta** | NGN NativeScript·NGN Comparación |

#### M37 · Angular Native (alfa): animación, gestos e iconos (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Animación con CSS: transiciones, `@keyframes` y `animate.enter`/`animate.leave` | Avanzado | **falta** | NGN Componentes (Animation)·NGN Limitaciones (No @angular/animations) |
| 2 | `AnimatedStyle` y el driver nativo | Avanzado | **falta** | NGN Componentes (Animation)·NGN Device (Layout animation) |
| 3 | Worklets de Reanimated: `WorkletStyle` y `WorkletScroll` | Avanzado | **falta** | NGN Componentes (Animation) |
| 4 | Gestos con gesture-handler: arrastrar, deslizar y pellizcar | Avanzado | **falta** | NGN Componentes (Gestures, Lists · Row actions) |
| 5 | Iconos nativos con `@ng-native/icons` | Avanzado | **falta** | NGN Iconos |

#### M38 · Angular Native (alfa): pruebas, inspección y asistentes de IA (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Pruebas de componente en Node con `@ng-native/testing`: el Fabric falso, `render` y `screen` | Avanzado | **está pero básico** (M16 T4): el tema actual ejecuta una prueba sin simulador; faltan qué demuestra y qué no una prueba así, y la configuración de Vitest | NGN Testing (Overview, Setup, Writing a test) |
| 2 | Probar formularios, asincronía, servicios, HTTP, navegación y estilos | Avanzado | **falta** | NGN Testing (Forms, Async, Services, HttpClient, Router, Styles) |
| 3 | Pruebas en otro sistema operativo y pruebas dentro de la app en ejecución | Avanzado | **falta** | NGN Testing (Another OS, In-app tests) |
| 4 | E2E con Maestro: selectores, flujos, Expo Go y development build | Avanzado | **falta** | NGN Testing (End-to-end) |
| 5 | Maestro en integración continua: simulador de iOS y emulador de Android | Avanzado | **falta** | NGN Testing (End-to-end · In CI) |
| 6 | Inspeccionar una app en el dispositivo: Pangular Inspector y el depurador de Hermes | Avanzado | **falta** | NGN Inspector·NGN Limitaciones (DevTools) |
| 7 | Asistentes de IA en un proyecto Angular Native: `AGENTS.md`, `llms.txt` y el MCP del inspector | Avanzado | **falta** | NGN Asistentes de IA·NGN Inspector |

#### M39 · Angular Native (alfa): web, islands, escritorio e idiomas (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El mismo componente en el navegador: `@ng-native/web`, `BrowserEngine` y qué no sobrevive al viaje | Avanzado | **falta** | NGN Nativo y web·NGN Web·NGN Web (Limits) |
| 2 | Islands: `<ng-native-island>` dentro de una aplicación Angular web | Avanzado | **falta** | NGN Web (Islands)·NGN Analog |
| 3 | El camino inverso: componentes web dentro de una pantalla nativa con `<dom-component>` y `mountInWebView` | Avanzado | **falta** | NGN Web·NGN Expo (DOM components) |
| 4 | Compatibilidad web (experimental) para librerías escritas para el navegador | Avanzado | **falta** | NGN Web compatibility |
| 5 | Aplicación de escritorio para macOS: ventanas, menús y empaquetado | Avanzado | **falta** | NGN Mac·NGN Desktop |
| 6 | Internacionalización en nativo: traducción en ejecución, extracción, cambio de idioma y RTL | Avanzado | **falta** | NGN Localización·NGN Limitaciones (i18n) |

#### M40 · Angular Native (alfa): compilación y publicación en tiendas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Configurar la app: `app.json`, identificadores permanentes, versión, iconos y pantalla de arranque | Avanzado | **falta** | NGN Despliegue (Configure the app)·NGN Expo (Splash screen) |
| 2 | Compilar en local: `expo run:ios`, `expo run:android` y builds de release | Avanzado | **falta** | NGN Despliegue (Locally)·NGN Primeros pasos (Building for release) |
| 3 | EAS Build: perfiles de `eas.json`, development client y distribución interna | Avanzado | **falta** | NGN Despliegue (EAS Build) |
| 4 | Firma: certificados y perfiles de Apple, keystore de Android y `eas credentials` | Avanzado | **falta** | NGN Despliegue (Signing) |
| 5 | Instalar en dispositivos: TestFlight y pista de pruebas internas de Google Play | Avanzado | **falta** | NGN Despliegue (Installing on a device) |
| 6 | Enviar a App Store y Google Play con `eas submit` | Avanzado | **falta** | NGN Despliegue (Submit to a store) |
| 7 | Actualizaciones OTA (`expo-updates`, HotCodePush) y actualización de versiones con `@ng-native/migrate` | Avanzado | **falta** | NGN OTA·NGN Actualizar·NGN Expo (Updates) |

#### M41 · Alternativas para móvil con Angular: NativeScript, Ionic con Capacitor y PWA (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Cuatro modelos de render: WebView, enlaces directos a API nativas, Fabric y PWA | Avanzado | **está pero básico** (M16 T1): el tema actual compara en un diagrama; falta una comparación con la misma pantalla construida en cada modelo | NGN Comparación·ION Core Concepts (Web View)·NS Introducción |
| 2 | NativeScript con Angular: `@nativescript/angular`, CLI `ns`, interfaz nativa, marshalling y plugins | Avanzado | **falta** | NS·NPM·NGN Comparación (NativeScript) |
| 3 | Ionic con Angular: componentes, navegación, ciclo de vida y zoneless | Avanzado | **falta** | ION Angular·NPM |
| 4 | Capacitor: proyecto nativo, plugins oficiales, código nativo propio y despliegue a tiendas | Avanzado | **falta** | CAP·NPM·ION Deployment |
| 5 | PWA frente a app nativa: instalación, capacidades y límites por plataforma | Avanzado | **falta** | ION Core Concepts (What are PWAs?)·CAP Web/PWA·AD Service Workers & PWAs |
| 6 | Matriz de decisión: cuándo Angular Native, NativeScript, Ionic con Capacitor o PWA, y cómo evaluar una tecnología en alfa | Avanzado | **ya está** (M16 T4) | NGN Comparación (When to choose which, Maturity)·ENT |


### Tramo 4 · Experto (nivel Experto) — 38 temas

#### M42 · Compilador y runtime por dentro (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Del decorador a las instrucciones: qué genera el compilador para una plantilla | Experto | **falta** | AD CLI (AOT)·RMP (Compiler)·MA c10 |
| 2 | Verificación de tipos de plantilla y diagnósticos extendidos | Experto | **falta** | AD CLI (Template type checking)·RMP (advanced compiler diagnostics) |
| 3 | Errores de metadatos AOT y opciones del compilador de Angular | Experto | **falta** | AD CLI (AOT metadata errors) |
| 4 | El grafo reactivo por dentro: productores, consumidores y versiones | Experto | **falta** | MA c7·MAS·ENT |
| 5 | El planificador de render: de la notificación al `tick` y a las fases posteriores al render | Experto | **falta** | AD Rendimiento (Zoneless)·MA c7·AD Componentes (Lifecycle) |
| 6 | Hidratación por dentro: qué viaja en el HTML y cómo se reconcilia | Experto | **falta** | AD SSR (Hydration)·RMP (Non-destructive hydration) |

#### M43 · Microfrontends y arquitectura a escala (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Microfrontends con Native Federation y cuándo no usarlos | Experto | **ya está** (M8 T5) | ENT·NPM·AE c3 |
| 2 | Límites de arquitectura verificados en el build: capas, etiquetas y reglas de dependencia | Experto | **falta** | NGN Arquitectura (module boundaries)·AE c3·ENT |
| 3 | Componer varios frameworks o versiones con Custom Elements | Experto | **falta** | AD Componentes (Custom Elements)·RMP (Ecosystem compatibility) |
| 4 | Estado, rutas y comunicación entre microfrontends | Experto | **falta** | AE c3·ENT |
| 5 | Dependencias compartidas y versiones de Angular entre equipos | Experto | **falta** | NPM·ENT·VER |
| 6 | Registro de decisión: monolito modular, librerías o microfrontends, con números | Experto | **está pero básico** (M8 T5): el tema actual da el criterio; falta un ADR completo con carga, equipos y coste comparados | ENT·AE c3 |

#### M44 · Rendimiento experto (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Método: objetivo, medición en laboratorio y en usuarios reales, y regresiones en CI | Experto | **falta** | AD Rendimiento·LA c15·ENT |
| 2 | Perfil de detección de cambios: leer un gráfico de llamas y encontrar el componente caro | Experto | **está pero básico** (M14 T5): el tema actual presenta las herramientas; falta un caso completo de principio a fin con la mejora medida | AD Rendimiento (Chrome DevTools profiling)·AD DevTools·ENT |
| 3 | Fugas de memoria en Angular: encontrarlas con instantáneas del heap y corregirlas | Experto | **falta** | ENT·MA c5·LA c15 |
| 4 | Rendimiento del servidor SSR: tiempo de respuesta, caché y carga concurrente | Experto | **falta** | AD SSR (Caching data, Configuring a server)·ENT |
| 5 | Rendimiento en Angular Native: commits, listas largas, animación fuera del hilo de JavaScript y lo que elimina un build de release | Experto | **falta** | NGN Fabric (Commits)·NGN Componentes (Lists, Animation)·NGN Despliegue (What a release build strips) |

#### M45 · Migraciones y código heredado (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Reconocer la versión y la arquitectura de un proyecto heredado | Experto | **está pero básico** (M12 T1): 655 palabras; faltan una lista de comprobación ejecutable y el informe de deuda resultante | AD Keeping up-to-date·VER·ENT |
| 2 | Plan de actualización de varias versiones mayores con verificación en cada salto | Experto | **está pero básico** (M12 T2, M12 T3): dos temas cortos; falta un salto real documentado con sus roturas | AD Keeping up-to-date·VER·ENT |
| 3 | Modernizar una base de código: standalone, control de flujo, `inject` y entradas y consultas con signals | Experto | **está pero básico** (M8 T3): hoy solo cubre NgModules; faltan las demás migraciones aplicadas en orden sobre un proyecto real | RMP·MA c2·ENT·MAS |
| 4 | De RxJS y NgRx a signals sin reescribir todo | Experto | **falta** | MAS·ENT·MA c6 |
| 5 | Migrar al sistema de build actual y de Karma a Vitest en un proyecto grande | Experto | **falta** | AD CLI (Migrating to new build system)·AD Testing (Migrating from Karma)·RMP |
| 6 | Estrategia para AngularJS y aplicaciones muy antiguas | Experto | **falta** | ENT |

#### M46 · Angular con IA (4 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Configurar un asistente para Angular: servidor MCP del CLI, reglas para el modelo y habilidades de agente | Experto | **falta** | AD IA (LLM prompts, Agent Skills, CLI MCP Server)·RMP (AI) |
| 2 | Patrones de diseño para funciones con IA en una aplicación Angular | Experto | **falta** | AD IA (Design Patterns)·RMP (AI Powered Experiences) |
| 3 | WebMCP (experimental): exponer herramientas de la aplicación a un agente | Experto | **falta** | AD IA (WebMCP)·RMP (Available to experiment with) |
| 4 | Revisar código generado: lint, verificación de plantillas y pruebas como red de seguridad | Experto | **falta** | AD IA (Get Started)·NGN ESLint·NGN Asistentes de IA |

#### M47 · Operación en producción (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | CI para Angular web: lint, pruebas, build con presupuestos y E2E | Experto | **falta** | AE c10·FCC·RS·AD CLI |
| 2 | Desplegar una aplicación con SSR | Experto | **falta** | AD SSR (Configuring a server)·AD CLI (Deployment)·UD s16·AE c10 |
| 3 | Errores y trazas en producción: mapas de código y seguimiento de errores en web y en nativo | Experto | **falta** | AD Errores no controlados·NS Crash Reporting·NPM |
| 4 | Funciones tras banderas y despliegue gradual | Experto | **falta** | AE c10·ENT |
| 5 | CI y entrega móvil: build, Maestro y envío a tiendas automatizados | Experto | **falta** | NGN Testing (End-to-end · In CI)·NGN Despliegue·CAP CI/CD |
| 6 | Política de versiones del producto: soporte LTS, actualizaciones periódicas y deuda | Experto | **está pero básico** (M14 T4): el tema actual es conceptual; falta la política escrita con las fechas oficiales de soporte | VER·AD Keeping up-to-date |

#### M48 · Evolución de Angular y criterio de experto (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Leer el roadmap oficial: qué está entregado, qué es experimental y qué significa «developer preview» | Experto | **falta** | RMP·VER |
| 2 | Leer el código fuente, los RFC y las notas de versión de Angular para resolver una duda | Experto | **falta** | RMP·ENT |
| 3 | Signals, RxJS o store: defender una decisión de estado | Experto | **está pero básico** (M9 T3): el tema actual decide sobre NgRx; falta el marco completo de decisión con los tres modelos | ENT·MAS·AE c9 |
| 4 | Meta-frameworks: AnalogJS y qué añade sobre el CLI | Experto | **falta** | RS·NGN Analog·NPM |
| 5 | Entrevista de nivel sénior: explicar por dentro lo que se usa a diario | Experto | **falta** | ENT |

### 2.1 Notas de linealidad

- Las pruebas se **ejecutan** desde M0 (el proyecto generado ya trae una) y se **escriben** desde M8 T5 (HTTP);
  el módulo completo de pruebas es M15. Ningún tema anterior a M8 pide escribir una prueba.
- Signals aparecen tres veces a propósito: primer uso (M4), profundidad (M10) y funcionamiento interno (M20 T4
  y M42 T4). Lo mismo ocurre con Signal Forms (M7, M13 y, en nativo, M34), SSR (M22, M23 y M42 T6), `@defer`
  (M24 T1 y M22 T4) y `NgOptimizedImage` (M3 T5 y M24 T3). En cada par, el segundo tema enlaza al primero y no
  lo repite.
- El bloque nativo (M29–M41) va después de todo Angular web de nivel Integración porque
  reutiliza signals, inyección, Router, Signal Forms, `HttpClient` y pruebas tal como se enseñaron. Sus únicos
  prerrequisitos nuevos son Xcode y Android Studio, que se instalan en M29 T2.
- Dentro del bloque nativo, M29 y M30 (primeros pasos y arquitectura) van antes que cualquier
  componente; la publicación (M40) va al final porque necesita la app completa; el módulo de alternativas
  (M41) cierra el bloque porque compara contra algo que el estudiante ya construyó.
- RxJS se enseña en M11, después de signals: el curso parte de signals como modelo por defecto y presenta RxJS
  como herramienta para flujos de eventos.

### 2.2 Temas de las fuentes que se dejan fuera a propósito

| Tema que aparece en las fuentes | Dónde aparece | Propuesta |
|---|---|---|
| TypeScript como lenguaje completo | LA c2, FCC, UD s46, DT s3 | Un tema de repaso (M0 T3); el curso dueño es JavaScript/TypeScript. Decisión D6 |
| Backend de ejemplo (NestJS, MEAN, GraphQL del lado del servidor) | DT s25–s27, AE c7 | Fuera: los laboratorios consumen la API de RutaFlow; el backend vive en Spring, Node y Microservicios |
| Bootstrap CSS y PrimeNG | FCC, DT s11 | Fuera: la interfaz se enseña con Material, CDK, Angular Aria y Tailwind |
| Mapas en la web (Mapbox, Google Maps) | DT s21, s31; angular.dev (Google Maps, externo) | Fuera de la parte web; los mapas se enseñan en nativo (M35 T5) |
| Angular Fire, Google Pay y reproductor de YouTube | angular.dev · Extended Ecosystem | Fuera: `@angular/fire` todavía declara Angular 21 (sección 1.4) |
| Elf (librería de estado) | RS | Fuera: el estado se enseña con signals, SignalStore y NgRx Store |
| Docker, Kubernetes y nube como tales | AE c10 | Cursos Docker, Kubernetes y Cloud; Angular se queda con su build, su servidor SSR y su pipeline (M47) |
| Git, HTTP y REST como conceptos | FCC, AE c7 | Curso Fundamentos |
| React Native, Flutter | NGN Comparación | Solo como contexto en M41 T1; tienen curso propio o no forman parte de la academia |
| NativeScript e Ionic con Capacitor a fondo (interfaz, navegación, plugins, pruebas y publicación de cada uno) | NS, ION, CAP | Reducidos a M41 por decisión del dueño; la versión a fondo queda como alternativa en D3 |
| Aplicaciones de escritorio con Electron o Tauri | — | Fuera; el escritorio se cubre con el destino macOS de Angular Native (M39 T5) |

## 3. Lo que hoy está en Angular y debería vivir en otro curso

Regla 1 de la spec: un concepto, un curso dueño. Angular se queda con el framework, su CLI, su ecosistema
directo y Angular Native.

| Qué hay hoy en Angular | Temas actuales | Curso dueño propuesto | Qué queda en Angular |
|---|---|---|---|
| TypeScript: `unknown`, `any`, `never` y tipos utilitarios | M0 T3 | **JavaScript** (o el curso de TypeScript que decida el dueño, D6) | M0 T3 como repaso de lo que Angular exige, con enlace |
| Playwright y Cypress como herramientas | M15 T2 | Queda en Angular (M25 T1–T2) mientras no exista un curso de pruebas web; si se crea, pasa a enlace | El uso con Angular: `ng e2e`, harnesses y CI |
| Core Web Vitals como concepto | M14 T4 | **Fundamentos** (web) | Medirlos y mejorarlos en una app Angular (M24 T4) |
| XSS, CSRF y CSP como conceptos | M14 T2, M14 T6 | **Fundamentos** (seguridad web) | Las defensas propias de Angular (M17 T6, M28) |
| Accesibilidad como concepto (WCAG) | M14 T1 | **Fundamentos** | Accesibilidad en componentes Angular, CDK y Angular Aria (M14) |
| JWT, OAuth 2.0 y OpenID Connect | no existe hoy | **Fundamentos** el concepto; **Spring** el servidor | El lado del cliente (M17 T4, M28 T3) |
| CI/CD e imágenes de contenedor | no existe hoy | **DevOps** y **Docker** | El pipeline concreto de una app Angular web y móvil (M47) |
| Microfrontends como estilo de arquitectura | M8 T5 | **Diseño de sistemas** (cuando exista) | Native Federation y la decisión con números (M43) |

Nada se pierde (regla 2): ningún tema actual se retira. El módulo 16 actual, hoy opcional, deja de serlo: sus
cuatro temas se reparten en el bloque nativo (anexo A).

## 4. Proyecto guía y laboratorio por módulo

### 4.1 Proyecto guía: RutaFlow web y RutaFlow conductor

Dos aplicaciones del mismo dominio de la academia (envíos, rutas, rastreo), que crecen módulo a módulo:

| Tramo | Qué es el proyecto al terminar el tramo |
|---|---|
| Fundamentos (M0–M8) | `rutaflow-web`: lista y detalle de envíos, alta con formulario, datos por HTTP y navegación con sesión |
| Aplicación (M9–M19) | La misma aplicación con rastreo en vivo, estado organizado, tema accesible, dos idiomas, pruebas y build de producción desplegado |
| Integración web (M20–M28) | Zoneless, página pública de rastreo con SSR e hidratación incremental, PWA, librería `rutaflow-ui` y revisión de seguridad |
| Integración nativa (M29–M41) | `rutaflow-conductor`: app nativa de iOS y Android con Angular Native para que el conductor vea sus paradas, registre entregas con foto y ubicación, trabaje sin conexión y reciba notificaciones; probada con Maestro y distribuida por TestFlight y pista interna |
| Experto (M42–M48) | Las dos aplicaciones medidas y operadas: informe de rendimiento, migración de un proyecto heredado, pipeline web y móvil, y decisiones de arquitectura escritas |

`rutaflow-conductor` es el nombre que ya usa el módulo 16 actual. `rutaflow-ui` permite compartir una tarjeta de
envío entre la web y la app (M39 T2).

**Proyecto final (con rúbrica, formato único §3):** entregar (1) `rutaflow-web` con `ng build` y `ng test` en
verde en Angular 22, SSR en la página de rastreo y Web Vitals medidos; (2) `rutaflow-conductor` corriendo en
simulador de iOS y emulador de Android, con su batería de pruebas en Node y un flujo de Maestro por plataforma;
(3) un build de release firmado y distribuido a pruebas internas; (4) un informe de rendimiento con una mejora
demostrada en web y otra en nativo; y (5) un registro de decisiones (estado, modo de render por ruta, por qué
Angular Native frente a las alternativas y qué versión alfa se fijó). Recoge el actual M13 T2.

### 4.2 Convenciones de los laboratorios

- Carpeta `examples/angular/modulo-N/` con `README.md`, `package.json` con versiones exactas, `package-lock.json`
  y `verificar.sh`, que termina en `RESULTADO: OK` (formato único §3).
- Parte web: proyecto del CLI de Angular 22, standalone, zoneless y con Vitest. `verificar.sh` corre `ng build`
  y `ng test`.
- Parte nativa: proyecto creado con `create-expo-app` y la plantilla `@ng-native/template` en la versión
  fijada (D2). `verificar.sh` corre la verificación de tipos y las pruebas en Node, que no necesitan simulador;
  los pasos que sí lo necesitan (simulador, emulador, Maestro, firma) van en el README como verificación manual
  en el Mac del dueño, con la captura real.
- Cada laboratorio parte del estado final del anterior; el README dice qué archivo cambia y por qué.
- Los laboratorios que necesitan una API usan la de RutaFlow emulada en local; ninguno depende de un servicio
  de pago. La publicación real en tiendas no forma parte de `verificar.sh` (decisión D9).
- Énfasis propio del curso (spec 021 §3): detección de cambios y signals visualizados, inyección de
  dependencias con su árbol, y la misma app que crece con pruebas y SSR.

### 4.3 Laboratorio por módulo

| Módulo | Tramo | Laboratorio (`examples/angular/modulo-N/`) |
|---|---|---|
| M0 · Plataforma, CLI y primer proyecto | Fundamentos | Instalar Node y el CLI, crear `rutaflow-web` con `ng new`, servirlo y leer cada archivo generado |
| M1 · Componentes | Fundamentos | Tarjeta de envío: componente con entradas, salidas, estilos encapsulados y ciclo de vida trazado en consola |
| M2 · Plantillas y enlace de datos | Fundamentos | Lista de envíos con filtros: enlaces, `@for` con `track`, `@if` y pipes de fecha y moneda |
| M3 · Directivas y pipes propios | Fundamentos | Directiva de permiso por rol, directiva estructural propia y pipe de estado del envío |
| M4 · Signals: primer contacto | Fundamentos | Carrito de bultos de un envío con `signal`, `computed`, `linkedSignal` y un efecto de guardado |
| M5 · Servicios e inyección de dependencias | Fundamentos | Servicio de envíos con configuración por token y un inicializador de aplicación |
| M6 · Enrutamiento esencial | Fundamentos | Navegación de `rutaflow-web`: lista, detalle con parámetro, 404, ruta diferida y guard de sesión |
| M7 · Formularios I | Fundamentos | Formulario «Nuevo envío» escrito con Signal Forms y comparado con su versión reactiva |
| M8 · HTTP y datos remotos | Fundamentos | Cliente HTTP de la API de RutaFlow (emulada en local) con interceptor, errores visibles y pruebas |
| M9 · Componentes avanzados | Aplicación | Tabla de envíos reutilizable: proyección con varios huecos, celdas dinámicas y directivas compuestas |
| M10 · Signals en profundidad | Aplicación | Buscador de envíos con `resource`, retardo en la entrada y efectos con limpieza, todo con pruebas |
| M11 · RxJS para Angular | Aplicación | Rastreo en vivo: flujo de posiciones combinado con filtros, sin fugas y con puente a signals |
| M12 · Enrutamiento avanzado | Aplicación | Detalle de envío con resolver, borrador protegido, límite de error y transición entre rutas |
| M13 · Formularios II | Aplicación | Asistente de alta de envío en varios pasos con reglas entre campos, validación asíncrona y un control propio |
| M14 · Estilos, componentes de interfaz y accesibilidad | Aplicación | Tema de RutaFlow con Material y Tailwind, un menú accesible con Angular Aria y revisión con lector de pantalla |
| M15 · Pruebas I | Aplicación | Batería de pruebas de `rutaflow-web`: componentes, servicios, router y harnesses con Vitest |
| M16 · Gestión de estado | Aplicación | El estado de envíos tres veces: store con signals, SignalStore y NgRx Store, comparados |
| M17 · Arquitectura de la aplicación | Aplicación | `rutaflow-web` reorganizado por funcionalidad, con inicio de sesión, navegación por rol y manejador global de errores |
| M18 · Internacionalización | Aplicación | `rutaflow-web` en español e inglés: extracción, plurales y un build por locale |
| M19 · Build, despliegue y actualización | Aplicación | Build de producción con presupuestos, despliegue estático y una actualización de versión mayor ensayada |
| M20 · Detección de cambios por dentro | Integración | Un tablero que se repinta de más: se traza, se explica y se corrige; después se migra a zoneless |
| M21 · Inyección de dependencias avanzada | Integración | Plugins de transportista con proveedores múltiples y servicios diferidos; un error de inyección diagnosticado |
| M22 · Renderizado en servidor e híbrido | Integración | Página pública de rastreo con SSR, hidratación incremental y estado transferido |
| M23 · SSR en producción | Integración | La página de rastreo en producción: prerender por parámetro, códigos de estado, servidor Node y metadatos |
| M24 · Rendimiento de carga y de ejecución | Integración | Campaña de carga: bundle analizado, imágenes optimizadas y Web Vitals antes y después |
| M25 · Pruebas II | Integración | E2E del flujo de alta de envío con Playwright, harness propio y migración de una suite de Karma |
| M26 · PWA, service workers y web workers | Integración | `rutaflow-web` instalable y con datos sin conexión; cálculo de rutas en un web worker |
| M27 · Librerías, monorepos y herramientas | Integración | Librería `rutaflow-ui` publicada en local, con schematic `ng add` y workspace Nx con límites |
| M28 · Seguridad avanzada | Integración | Revisión de seguridad de `rutaflow-web`: CSP, Trusted Types, inicio de sesión con PKCE y auditoría |
| M29 · Angular Native (alfa): primeros pasos | Integración | Crear `rutaflow-conductor` con la plantilla, correrlo en simulador de iOS y emulador de Android y pasar su prueba |
| M30 · Angular Native (alfa): arquitectura | Integración | Seguir un cambio de signal hasta el commit de Fabric y medirlo con `engine.stats` |
| M31 · Angular Native (alfa): interfaz nativa | Integración | Pantalla «Mis entregas» con vistas, texto, imágenes, entradas y un modal, en iOS y Android |
| M32 · Angular Native (alfa): CSS de Fabric y Tailwind | Integración | Tema claro y oscuro de la app del conductor con CSS de componente, Tailwind y tokens |
| M33 · Angular Native (alfa): navegación nativa | Integración | Navegación de la app: pila, pestañas, hoja de confirmación de entrega y deep link a un envío |
| M34 · Angular Native (alfa): formularios, datos y listas | Integración | Formulario de entrega con Signal Forms, lista virtualizada de paradas y cola de escrituras sin conexión |
| M35 · Angular Native (alfa): dispositivo y módulos de Expo como servicios | Integración | Entrega con foto, ubicación, notificación y datos guardados en SQLite, con permisos denegados tratados |
| M36 · Angular Native (alfa): capacidades avanzadas y código nativo | Integración | Módulo nativo propio (estado térmico) en Swift y Kotlin; desbloqueo con biometría |
| M37 · Angular Native (alfa): animación, gestos e iconos | Integración | Fila deslizable para marcar entregado, transición entre pantallas e iconos nativos |
| M38 · Angular Native (alfa): pruebas, inspección y asistentes de IA | Integración | Batería de pruebas en Node, flujo de entrega con Maestro en ambos sistemas e inspección en dispositivo |
| M39 · Angular Native (alfa): web, islands, escritorio e idiomas | Integración | Tarjeta de envío compartida como island en `rutaflow-web`; app en dos idiomas; variante para macOS |
| M40 · Angular Native (alfa): compilación y publicación en tiendas | Integración | Build de release firmado, distribución por TestFlight y pista interna, y una actualización OTA |
| M41 · Alternativas para móvil con Angular: NativeScript, Ionic con Capacitor y PWA | Integración | La pantalla de entrega construida también con NativeScript, con Ionic y Capacitor y como PWA; matriz de decisión |
| M42 · Compilador y runtime por dentro | Experto | Leer el código generado para una plantilla y provocar tres errores del compilador |
| M43 · Microfrontends y arquitectura a escala | Experto | Portal de RutaFlow con dos microfrontends y un registro de decisión que lo justifique o lo descarte |
| M44 · Rendimiento experto | Experto | Informe de rendimiento de web y nativo: objetivo, medición, mejora y prueba de regresión |
| M45 · Migraciones y código heredado | Experto | Proyecto heredado con NgModules, Karma y Zone.js llevado a Angular 22 paso a paso |
| M46 · Angular con IA | Experto | Asistente configurado para el repositorio y una función con IA en `rutaflow-web`, revisada con pruebas |
| M47 · Operación en producción | Experto | Pipeline completo: web con SSR desplegada y app móvil compilada, probada y enviada a pruebas internas |
| M48 · Evolución de Angular y criterio de experto | Experto | Ficha de una función experimental del roadmap leída, probada y defendida en una entrevista simulada |

## 5. Decisiones que debe tomar el dueño

- **D1 · Tamaño.** Aprobar 297 temas en 49 módulos (hoy 78 en 17), unas 198 h más el
  proyecto, o indicar qué módulos recortar. Los candidatos a recorte con menos pérdida son M39 (web, islands,
  escritorio e idiomas en nativo), M36 (capacidades avanzadas) y M46 (Angular con IA). **Recomendación:**
  aprobar completo (regla 10).
- **D2 · Qué es «Angular native» y cómo tratar su estado alfa.** El dueño ya resolvió la primera parte el
  2026-11-20: es **Angular Native** (ng-native.com), y NativeScript e Ionic con Capacitor quedan en un módulo
  comparativo. Falta decidir cómo se convive con el alfa. **Recomendación:** (a) fijar la versión `0.25.0` con
  Expo SDK 58 en todos los laboratorios y anotarla en `docs/VERSIONES.md`; (b) marcar los 12 módulos como
  «(alfa)» en la app, con la versión y la fecha de verificación en cada tema; (c) releer la documentación y el
  registro de cambios antes de escribir cada módulo y subir de versión solo entre módulos, nunca a mitad de
  uno; (d) hacer una revisión completa del bloque cuando el proyecto publique su versión estable, y antes de
  eso cada vez que una versión `0.x` rompa un laboratorio; (e) escribir este bloque el último dentro de Angular,
  para que la versión fijada sea la más reciente posible.
- **D3 · Tamaño de las alternativas.** Propuesta: un módulo de 6 temas (M41) con la misma pantalla
  construida en NativeScript, en Ionic con Capacitor y como PWA, y una matriz de decisión. Alternativa: dar a
  NativeScript y a Ionic con Capacitor un bloque propio a fondo (interfaz, navegación, plugins, pruebas y
  publicación de cada uno), que añadiría unos 40 temas. Las dos tecnologías tienen hoy versión compatible con
  Angular 22 (sección 1.5). **Recomendación:** mantener el módulo comparativo, como pidió el dueño, y dejar la
  versión a fondo como curso o bloque futuro si Angular Native no llega a estable.
- **D4 · Alcance de Angular Native más allá de iOS y Android.** La documentación cubre también macOS, el
  renderizado en navegador (`@ng-native/web`), islands y una capa experimental de compatibilidad web.
  **Recomendación:** incluirlo todo en M39, como está, porque el dueño pidió el bloque completo; el destino web
  se enseña con el aviso de la propia documentación de que no está pensado como destino de despliegue.
- **D5 · Funciones experimentales.** Propuesta: enseñar WebMCP (M46 T3) y la compatibilidad web de Angular
  Native (M39 T4) con aviso en el título. Alternativa: dejarlas fuera hasta que sean estables.
  **Recomendación:** enseñarlas con aviso.
- **D6 · TypeScript.** Propuesta: Angular conserva un único tema de repaso (M0 T3) y el lenguaje completo vive
  en el curso de JavaScript (o en uno de TypeScript). Hay que tener presente que Angular 22 exige TypeScript 6.0
  y `docs/VERSIONES.md` fija TypeScript 7.x para otros cursos. **Recomendación:** aprobar el reparto y anotar la
  diferencia de versión en `docs/VERSIONES.md`.
- **D7 · Librerías de terceros dentro de Angular.** Confirmar que el curso es dueño de NgRx (Store y
  SignalStore), Angular Material, CDK y Angular Aria, Nx, Native Federation, Angular Testing Library, Transloco
  y Storybook, y que Playwright y Cypress se enseñan aquí mientras no haya un curso de pruebas web.
  **Recomendación:** confirmar.
- **D8 · Proyecto guía.** Aprobar `rutaflow-web` y `rutaflow-conductor` (sección 4.1) o elegir otro dominio.
  **Recomendación:** aprobar; es el dominio del resto de la academia y el que ya usa el módulo 16.
- **D9 · Hasta dónde llega la publicación.** Publicar en App Store y Google Play exige cuentas de desarrollador
  de pago y una app que pase revisión. Propuesta: el curso llega hasta TestFlight y la pista de pruebas internas
  con la cuenta del dueño, y documenta el envío a revisión con capturas reales sin exigirlo en la rúbrica.
  Alternativa: publicar de verdad `rutaflow-conductor`. **Recomendación:** llegar hasta pruebas internas.
- **D10 · Código heredado.** Propuesta: NgModules, Zone.js, Karma y Jasmine y `@angular/animations` se enseñan
  solo para leerlos y migrarlos (M17 T3, M20 T5, M25 T6 y M45). Alternativa: darles módulos propios para quien
  mantiene aplicaciones antiguas. **Recomendación:** solo migración.
- **D11 · Certificación.** No se encontró ni se consultó una certificación oficial vigente de Angular, así que
  la fuente 3 de la spec queda sin cubrir (sección 6.7). Confirmar que se acepta o indicar cuál contrastar.

## 6. Fuentes consultadas

Consultadas el 2026-11-20. De cada una se tomó solo la lista de temas y los datos de versión (hechos), nunca su
texto. La columna «Abrev.» es la que usa la tabla del temario.

### 6.1 Documentación oficial de Angular

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| AD *guía* | [angular.dev](https://angular.dev/overview) | Árbol de navegación completo y las páginas de cada guía: [Signals](https://angular.dev/guide/signals), [Componentes](https://angular.dev/guide/components), [Plantillas](https://angular.dev/guide/templates), [Directivas](https://angular.dev/guide/directives), [DI](https://angular.dev/guide/di), [Routing](https://angular.dev/guide/routing), [Forms](https://angular.dev/guide/forms), [HTTP](https://angular.dev/guide/http), [SSR](https://angular.dev/guide/ssr) (también sus encabezados), [Testing](https://angular.dev/guide/testing), [Angular Aria](https://angular.dev/guide/aria/overview), [i18n](https://angular.dev/guide/i18n), [Animaciones](https://angular.dev/guide/animations), [Rendimiento](https://angular.dev/best-practices/runtime-performance), [CLI](https://angular.dev/tools/cli) y [Librerías](https://angular.dev/tools/libraries). «AD IA» es la sección Build with AI; «AD Seguridad», «AD Accesibilidad», «AD Style Guide», «AD Errores no controlados» y «AD Keeping up-to-date» son las entradas de Best Practices |
| RMP | [Roadmap oficial](https://angular.dev/roadmap) | Funciones listas para producción, en experimentación y proyectos completados |
| VER | [Releases](https://angular.dev/reference/releases) y [compatibilidad de versiones](https://angular.dev/reference/versions) | Versiones con soporte, fechas, cadencia y tabla de Node, TypeScript y RxJS |
| NPM | Registro de npm (`registry.npmjs.org/<paquete>`) | Última versión, fecha y dependencias entre pares de unos 90 paquetes (secciones 1.4 y 1.5) |

### 6.2 Documentación del bloque nativo

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| NGN *página* | [ng-native.com](https://ng-native.com/guide/getting-started) | Navegación completa y encabezados de las páginas leídas (lista en 6.7): guía, conceptos y la portada de cada paquete |
| — | [Repositorio `ng-native/ng-native`](https://github.com/ng-native/ng-native) | README: qué es, estado alfa, lista de paquetes y funciones |
| NS | [docs.nativescript.org](https://docs.nativescript.org/) y [`NativeScript/angular`](https://github.com/NativeScript/angular) | Navegación completa de la documentación y versiones de la integración con Angular |
| ION | [ionicframework.com/docs](https://ionicframework.com/docs/angular/overview) | Navegación completa, [política de soporte y compatibilidad con Angular](https://ionicframework.com/docs/reference/support) y la guía [Zoneless](https://ionicframework.com/docs/angular/zoneless) |
| CAP | [capacitorjs.com/docs](https://capacitorjs.com/docs) | Navegación completa y [política de soporte](https://capacitorjs.com/docs/main/reference/support-policy) |

### 6.3 Libros de referencia (índices)

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| MA c*n* | Vardanyan, *Modern Angular* (Manning, 2025) — [ficha con índice](https://www.simonandschuster.co.uk/books/Modern-Angular/Armen-Vardanyan/9781638357261) | Capítulos 1–10 |
| LA c*n* | Bampakos, *Learning Angular*, 5.ª ed. (Packt) — [«What this book covers»](https://subscription.packtpub.com/book/web-development/9781835087480/pref/preflvl1sec03/what-this-book-covers) | Capítulos 1–15 |
| AE c*n* | *Angular for Enterprise Applications*, 3.ª ed. (Packt) — [prefacio](https://www.packtpub.com/en-cl/product/angular-for-enterprise-applications-third-edition-pref-9781805127123/chapter/preface) | Capítulos 1–10 y apéndice A |
| MAS | Ayaz, *Mastering Angular Signals* (Leanpub, actualizado el 2026-06-11) — [ficha](https://leanpub.com/mastering-angular-signals) | Las seis áreas temáticas (la ficha no lista capítulos) |

### 6.4 Certificación

No hay fuente (decisión D11 y sección 6.7).

### 6.5 Cursos largos, sílabos y YouTube

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| FCC | freeCodeCamp.org (YouTube), [«Angular for Beginners Course»](https://www.freecodecamp.org/news/angular-for-beginners-course/), 18 horas | Las 14 secciones y sus temas |
| DT s*n* | DevTalles, [«Angular: De cero a experto»](https://cursos.devtalles.com/courses/angular) (Fernando Herrera, en español), 45,5 horas y 454 lecciones | Las 31 secciones. La página avisa de que esta edición ya no se actualiza |
| FM | Frontend Masters, [«Intermediate Angular: Signals & Dependency Injection»](https://frontendmasters.com/courses/intermediate-angular/) (Alex Okrushko), 4 h 46 min | Secciones y lecciones |
| UD s*n* | Udemy, «Angular - The Complete Guide» (edición 2025), según [unas notas públicas del curso](https://everoot.github.io/Blog/Tools/Frontend/Angular/Angular%20-%20The%20Complete%20Guide/Angular%20-%20The%20Complete%20Guide%20(2025%20Edition)) | 15 títulos de sección, con su número. La página de Udemy no abrió (6.7) |

### 6.6 Rutas públicas y entrevistas de nivel sénior

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| RS | roadmap.sh/angular, según [una copia pública de su lista de temas](https://iagodantasf.github.io/tech-studies/roadmaps/skill-based/angular/) | Los temas y subtemas. La página original no entregó su contenido (6.7) |
| ENT | [GreatFrontEnd, preguntas de Angular sénior](https://www.greatfrontend.com/blog/senior-angular-developer-interview-questions-advanced-topics-and-answers) · [This is Angular, «Senior Angular Interview Questions»](https://dev.to/this-is-angular/senior-angular-interview-questions-ji0) · [«Senior Angular Interview Questions (2026)»](https://dev.to/cristiansifuentes/senior-angular-interview-questions-2026-architecture-signals-rxjs-and-the-real-senior-bar-4bej) | Los temas de las preguntas |

### 6.7 Fuentes que no abrieron y límites de la lectura

| Fuente | Qué pasó | Qué se hizo |
|---|---|---|
| [roadmap.sh/angular](https://roadmap.sh/angular) | la página se dibuja en el navegador y solo llegaron metadatos | se usó una copia pública de la lista (RS); puede no coincidir con la versión de hoy |
| Repositorio `kamranahmedse/developer-roadmap` (carpeta de Angular) | bloqueado por `robots.txt`, 403 en la API y 404 en la ruta del JSON | no se usó |
| Página del curso en udemy.com | error del sitio | se usaron notas públicas con 15 títulos de sección; el sílabo completo no se vio |
| `angular.dev/llms.txt` y `ng-native.com` con `curl` | el proxy devolvió 403 | las mismas páginas sí abrieron con WebFetch |
| `package.json` de `@nativescript/angular` en la vista de GitHub | límite de peticiones | se leyó el archivo en crudo de la rama principal y el registro de npm |
| Ficha de *Mastering Angular Signals* | no lista capítulos | se tomaron las seis áreas temáticas |
| Prefacio de *Angular for Enterprise Applications* | la página no muestra el autor | el título y la edición salen de la URL del editor; el autor no se cita |
| Certificación oficial de Angular | no se buscó a fondo ni se encontró una vigente | fuente 3 de la spec sin cubrir (D11) |
| Sílabos de universidades | no se consultó ninguno específico de Angular | la fuente 4 de la spec se cubre con cursos largos y bootcamps en vídeo (6.5) |
| Documentación de Expo y de React Native | no se abrió | los temas de publicación (EAS, firma, tiendas) salen de la página de despliegue de ng-native.com, que remite a Expo; hay que leer la de Expo antes de escribir M40 |

**ng-native.com: qué se leyó.** Página a página: Primeros pasos, Apps existentes, Comparación, Theming y
Tailwind, Formularios, Sin conexión, Módulos nativos, Localización, Mac, Despliegue, OTA, Actualizar,
Arquitectura, Nativo y web, Android edge-to-edge, Inspector, Limitaciones y Asistentes de IA; la portada de los
paquetes Components, Router, Device, Expo, Firebase Messaging, Testing, NativeScript, Desktop, ESLint, Tailwind,
Icons, Analog, Web, Web compatibility, Platform, Fabric, Metro, Angular CLI y Nx; y las subpáginas Animation,
Lists, Screens, Islands y End-to-end. **No se leyeron una a una**, solo por su título en la navegación: las otras
14 subpáginas de Components, 3 de Router (Header, Tabs, File routes), 17 de Device, 48 de Expo, 11 de Testing,
6 de Desktop, 5 de Localización y 2 de Web (Storybook, Limits). Los temas que se apoyan solo en esos títulos
son M31 T3–T7, M33 T3–T4, M35, M36 T1–T4 y M38 T2–T3: su alcance exacto se fija al leer la página antes de
escribirlos.

Los datos de este documento salen de resúmenes automáticos de cada página (WebFetch) y del registro de npm, no
de ejecutar nada. Ningún nombre de API de Angular Native se probó en un proyecto real.

## 7. Qué sigue al aprobar

1. Registrar las decisiones D1–D11 al principio de este archivo.
2. Anotar en `docs/VERSIONES.md` la versión fijada de Angular Native, Expo y React Native (D2) y la diferencia
   de TypeScript (D6).
3. Marcar el avance en `docs/reestructuracion/ESTADO.md`. Angular es el sexto curso en el orden de la spec 021,
   después de Java, Spring Boot, Microservicios, Flutter e iOS.
4. Reescritura (Fase 5) en dos pasadas: primero la parte web (M0–M28 y M42–M48), después el bloque nativo
   (M29–M41), con la documentación de Angular Native releída en ese momento.

## Anexo A · Destino de los temas actuales

Los 78 temas del listado medido, con su destino en el temario objetivo. Ninguno se retira.

| Tema actual | Título | Palabras | Destino |
|---|---|---:|---|
| M0 T1 | El CLI ya no genera NgModules | 1430 | M0 T2 · M1 T1 |
| M0 T2 | Interpolación y property binding | 1346 | M2 T1 · M2 T2 |
| M0 T3 | TypeScript a fondo — unknown, any, never y utility types | 1510 | M0 T3 |
| M0 T4 | Compilador AOT frente a JIT | 1886 | M19 T2 |
| M1 T1 | input()/output() basados en signals | 1384 | M1 T3 · M1 T4 |
| M1 T2 | Control de flujo nativo — @if, @for, @switch | 1403 | M2 T3 |
| M1 T3 | Content projection con ng-content | 1245 | M2 T7 · M9 T1 |
| M1 T4 | Ciclo de vida completo de un componente | 1429 | M1 T5 |
| M1 T5 | Consultas signal y trabajo posterior al render | 1390 | M4 T6 · M9 T2 |
| M1 T6 | Directivas y pipes personalizados | 726 | M3 T1 · M3 T4 |
| M1 T7 | Pipes puros e impuros, AsyncPipe y signals | 1558 | M2 T5 · M3 T4 |
| M2 T1 | signal(), computed() y effect() | 1355 | M4 T1 · M4 T2 |
| M2 T2 | Mutación frente a actualización inmutable | 1415 | M4 T3 |
| M2 T3 | Signals frente a Observables | 1335 | M4 T5 · M11 T7 |
| M2 T4 | Hacia zoneless change detection | 1561 | M20 T1 · M20 T3 |
| M2 T5 | linkedSignal — estado derivado que el usuario puede sobrescribir | 774 | M4 T4 |
| M2 T6 | resource() y httpResource — datos asíncronos reactivos | 1553 | M8 T4 · M10 T1 |
| M3 T1 | @Injectable y providedIn: root | 1483 | M5 T1 |
| M3 T2 | inject() frente a inyección por constructor | 1266 | M5 T2 |
| M3 T3 | Jerarquía de inyectores | 1383 | M21 T1 |
| M3 T4 | Tokens de inyección y decoradores de resolución | 1690 | M5 T3 · M5 T4 · M21 T2 |
| M4 T1 | Router config con rutas standalone | 1445 | M6 T1 |
| M4 T2 | Guards funcionales | 1313 | M6 T6 |
| M4 T3 | Lazy loading con loadComponent | 1422 | M6 T5 |
| M4 T4 | Parámetros de ruta, query params y capacidades avanzadas de routing | 1675 | M6 T2 · M6 T3 |
| M4 T5 | CanDeactivate: proteger un borrador sin confundir navegación con autorización | 560 | M12 T3 |
| M4 T6 | Resolvers funcionales: datos listos antes de mostrar la ruta | 1070 | M12 T1 |
| M5 T1 | Reactive Forms — FormGroup y FormControl | 1285 | M7 T5 |
| M5 T2 | Validadores asíncronos | 1410 | M13 T5 |
| M5 T3 | FormArray para campos dinámicos | 1218 | M13 T6 |
| M5 T4 | Template-driven forms — cuándo siguen siendo válidos | 1291 | M7 T6 |
| M5 T5 | Signal Forms: formularios basados en signals (Angular 22) | 2548 | M7 T2 · M7 T3 |
| M6 T1 | Observable frente a Promise | 1359 | M11 T1 |
| M6 T2 | Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest | 1283 | M11 T2 · M11 T4 |
| M6 T3 | Manejo de suscripciones sin fugas de memoria | 1322 | M11 T6 |
| M6 T4 | Subjects y operadores de aplanamiento avanzados | 1673 | M11 T3 · M11 T5 |
| M7 T1 | HttpClient (fetch por defecto) y peticiones tipadas | 1256 | M8 T1 |
| M7 T2 | Interceptores funcionales | 1240 | M8 T3 |
| M7 T3 | Registro de interceptores y centralización del manejo de errores | 1357 | M8 T2 · M17 T5 |
| M8 T1 | Bootstrap sin NgModules | 1227 | M17 T2 |
| M8 T2 | Organización por feature | 1155 | M17 T1 |
| M8 T3 | Migración desde NgModules | 1279 | M17 T3 · M19 T5 · M45 T3 |
| M8 T4 | Librerías y monorepos con Angular CLI: un workspace, varias aplicaciones y código compartido | 969 | M27 T1 |
| M8 T5 | Microfrontends con criterio: Native Federation y cuándo no usarlos | 1247 | M43 T1 · M43 T6 |
| M9 T1 | Store propio con signals | 1336 | M16 T1 |
| M9 T2 | NgRx — actions, reducers y selectors | 1391 | M16 T3 |
| M9 T3 | Cuándo NgRx justifica su complejidad | 1567 | M16 T5 · M48 T3 |
| M10 T1 | TestBed y componentes standalone | 1453 | M15 T2 |
| M10 T2 | Angular Testing Library | 1349 | M15 T5 |
| M10 T3 | Mockear HttpClient y el builder predeterminado basado en Vitest | 1426 | M8 T5 · M15 T1 |
| M10 T4 | Angular Material y CDK: componentes accesibles probados con harnesses | 1354 | M14 T2 · M14 T3 · M15 T6 |
| M11 T1 | Server-Side Rendering | 1043 | M22 T1 |
| M11 T2 | Hidratación | 1616 | M22 T3 |
| M11 T3 | `@defer` — estados reales, incluyendo error | 1035 | M24 T1 |
| M11 T4 | Zoneless | 1117 | M20 T3 · M20 T6 |
| M11 T5 | OnPush por defecto (Angular 22): qué se revisa y cuándo usar `Eager` | 2142 | M20 T2 |
| M11 T6 | Modos de render por ruta: SSR, prerender (SSG) y CSR con app.routes.server.ts | 1028 | M22 T2 · M23 T1 |
| M11 T7 | Hidratación incremental: @defer con hydrate on para despertar solo lo que se usa | 1422 | M22 T4 |
| M12 T1 | Reconocer la versión y la arquitectura de un proyecto | 655 | M0 T1 · M45 T1 |
| M12 T2 | Leer la guía de actualización antes de modificar archivos | 568 | M19 T4 · M45 T2 |
| M12 T3 | Migrar una versión mayor a la vez y verificar cada salto | 565 | M19 T4 · M45 T2 |
| M13 T1 | Estructura del proyecto integrador | 1295 | M17 T1 |
| M13 T2 | Integrando routing, store y formularios | 1254 | Proyecto final (sección 4.1) |
| M13 T3 | TareasStore — combinando signals, computed y HttpClient | 1532 | M16 T1 |
| M14 T1 | Accesibilidad es comportamiento, no una puntuación | 1042 | M14 T5 |
| M14 T2 | La seguridad automática tiene fronteras explícitas | 1023 | M17 T6 · M28 T2 |
| M14 T3 | Internacionalizar implica significado, no reemplazo de texto | 1070 | M18 T1 · M18 T2 |
| M14 T4 | Rendimiento y actualización son contratos de experiencia | 1155 | M24 T4 · M47 T6 |
| M14 T5 | Perfilar con Angular DevTools y el panel Performance de Chrome | 1139 | M24 T5 · M44 T2 |
| M14 T6 | CSP con nonce y Trusted Types en Angular | 1819 | M28 T1 |
| M15 T1 | Pruebas de Signals | 975 | M10 T6 |
| M15 T2 | Cypress y Playwright | 963 | M25 T1 · M25 T2 |
| M15 T3 | Animaciones accesibles | 937 | M14 T6 |
| M15 T4 | SSR y TransferState | 1034 | M22 T7 |
| M16 T1 | Qué renderiza Angular Native y por qué no es un WebView | 1187 | M29 T1 · M29 T2 · M30 T1 · M31 T1 · M41 T1 |
| M16 T2 | Signals, estilos nativos compilados y el preset de Tailwind | 1104 | M32 T1 · M32 T3 · M32 T4 |
| M16 T3 | Router nativo y servicios de Expo inyectados como servicios Angular | 1204 | M33 T1 · M33 T2 · M35 T3 · M35 T5 |
| M16 T4 | Evaluar la madurez de una tecnología alpha con criterio | 1204 | M29 T1 · M30 T5 · M38 T1 · M41 T6 |
