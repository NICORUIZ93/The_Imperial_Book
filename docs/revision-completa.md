# Revisión completa — The Imperial Book

Generado: `2026-10-31T15:23:27`

> Mide PRESENCIA de marcadores, no calidad pedagógica ni ejecución real.
> Fuentes oficiales y ASCII usan el detector de `scripts/audit_code_visual_quality.py`;
> profundidad y duplicados usan los umbrales de este script.

## Resumen ejecutivo

| Métrica | Valor |
|---|---:|
| Temas totales | **1131** |
| Completos (7/7 pasos) | **119/1131** (10%) |
| Con fuente oficial | **1130/1131** (99%) |
| Con caso real | **1131/1131** (100%) |
| Con Mermaid | **620/1131** |
| ASCII pendiente | **211** |
| Profundidad insuficiente | **0** |
| Duplicados cross-track | **0** |

## Distribución por prioridad

| Prioridad | Significado | Temas |
|---|---|---:|
| P0 | Sin código NI comando | 0 |
| P1 | Falta ≥1 paso de los 7 | 1012 |
| P2 | Sin fuente o sin caso real | 0 |
| P3 | ASCII sin Mermaid | 0 |
| OK | Cumple los 4 ejes | 119 |

## Pasos faltantes (global)

| Paso | Temas que lo omiten |
|---|---:|
| P2_prerrequisitos | 638 |
| P7_rutaflow | 630 |
| P5_fallo | 17 |

## Cobertura por track

| Track | Módulos | Temas | 7/7 | Fuente | Caso | Mermaid | ASCII | P0 | P1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 19 | 73 | 5 | 72 | 73 | 27 | 40 | 0 | 68 |
| angular | 17 | 71 | 5 | 71 | 71 | 30 | 20 | 0 | 66 |
| cloud | 35 | 156 | 4 | 156 | 156 | 80 | 17 | 0 | 152 |
| devops | 23 | 129 | 24 | 129 | 129 | 82 | 40 | 0 | 105 |
| flutter | 16 | 63 | 2 | 63 | 63 | 51 | 2 | 0 | 61 |
| foundations | 16 | 99 | 15 | 99 | 99 | 70 | 0 | 0 | 84 |
| ios | 15 | 56 | 2 | 56 | 56 | 30 | 6 | 0 | 54 |
| java | 21 | 85 | 12 | 85 | 85 | 25 | 0 | 0 | 73 |
| javascript | 15 | 88 | 2 | 88 | 88 | 58 | 0 | 0 | 86 |
| kotlin-multiplatform | 14 | 56 | 3 | 56 | 56 | 32 | 17 | 0 | 53 |
| node | 15 | 77 | 3 | 77 | 77 | 24 | 9 | 0 | 74 |
| react | 15 | 58 | 0 | 58 | 58 | 37 | 5 | 0 | 58 |
| rutaflow | 8 | 29 | 24 | 29 | 29 | 26 | 0 | 0 | 5 |
| spring-boot | 23 | 91 | 18 | 91 | 91 | 48 | 20 | 0 | 73 |

## Listado de temas por curso

### Track: android (73 temas en 19 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 26 | Estructura de un proyecto Android Studio | 26 | 1058 | OK | — |
| 139 | Recursos externalizados | 139 | 983 | OK | — |
| 260 | AndroidManifest.xml y módulos Gradle | 260 | 1022 | OK | — |
| 387 | Kotlin esencial para Android — lo que usarás en cada pantalla | 387 | 972 | P1 | P2_prerrequisitos |
| 495 | Coroutines — asincronía sin bloquear la UI | 495 | 923 | P1 | P2_prerrequisitos |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Ciclo de vida de una Activity | 6 | 954 | P1 | P7_rutaflow |
| 101 | ViewModel sobrevive a la rotación | 101 | 962 | P1 | P7_rutaflow |
| 211 | SavedStateHandle | 211 | 1014 | P1 | P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Detectar y corregir recomposición innecesaria | 6 | 1248 | P1 | P7_rutaflow |
| 158 | Baseline Profiles y ciclo de efectos | 158 | 1012 | P1 | P7_rutaflow |
| 279 | Accesibilidad e interop con Views | 279 | 887 | P1 | P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Firma de la app | 6 | 997 | P1 | P7_rutaflow |
| 113 | App Bundle vs APK | 113 | 1052 | P1 | P7_rutaflow |
| 205 | Versionado, tracks y políticas | 205 | 962 | P1 | P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura MVVM completa con UDF | 6 | 970 | P1 | P7_rutaflow |
| 125 | Inyección de dependencias en toda la app | 125 | 833 | P1 | P7_rutaflow |
| 218 | Cierre del track y próximos pasos | 218 | 872 | P1 | P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | El sistema operativo conecta tu app con entradas externas | 8 | 986 | P1 | P7_rutaflow |
| 135 | Proteger datos exige conocer copias y ciclo de vida | 135 | 949 | P1 | P7_rutaflow |
| 249 | Offline-first necesita un protocolo de cambios | 249 | 1210 | P1 | P7_rutaflow |
| 386 | La calidad se opera por dispositivo y versión | 386 | 1026 | P1 | P7_rutaflow |
| 571 | Del dispositivo al diagnóstico: SoC, memoria, límites térmicos y arranque verificado | 571 | 645 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | ComposeTestRule ejecuta tu UI sin emulador visible | 8 | 1051 | P1 | P7_rutaflow |
| 141 | Finders, assertions y actions navegan el árbol semántico | 141 | 893 | P1 | P7_rutaflow |
| 243 | Semantics y clearAndSetSemantics definen qué percibe la accesibilidad | 243 | 1090 | P1 | P7_rutaflow |
| 392 | AccessibilityService y TalkBack consumen el árbol semántico en producción | 392 | 948 | P1 | P7_rutaflow |
| 502 | Animaciones de estado y visibilidad usan una especificación medible | 502 | 1098 | P1 | P7_rutaflow |
| 628 | AnimatedContent y AnimationSpec especifican transiciones completas | 628 | 1208 | P1 | P7_rutaflow |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Intents implícitos y Activity Result API | 6 | 901 | P1 | P2_prerrequisitos |
| 128 | BroadcastReceiver: reaccionar a eventos del sistema | 128 | 845 | P1 | P2_prerrequisitos |
| 248 | Foreground Service de ubicación con FusedLocationProvider | 248 | 939 | P1 | P2_prerrequisitos |
| 409 | Compartir archivos con FileProvider y content:// | 409 | 783 | OK | — |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Permisos en tiempo de ejecución y alternativas sin permiso | 10 | 520 | P1 | P2_prerrequisitos |
| 99 | DataStore para preferencias consistentes y migrables | 99 | 465 | P1 | P2_prerrequisitos |
| 181 | Paging 3, estados de carga y RemoteMediator | 181 | 448 | P1 | P2_prerrequisitos |
| 265 | FCM, permiso de notificaciones y sincronización confiable | 265 | 485 | P1 | P2_prerrequisitos |
| 354 | Interfaces adaptativas para teléfono, tablet y foldable | 354 | 500 | P1 | P2_prerrequisitos |
| 437 | Credential Manager, passkeys y verificación en servidor | 437 | 507 | P1 | P2_prerrequisitos |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Constraints, Modifier y componentes con slots | 9 | 535 | P1 | P2_prerrequisitos |
| 96 | LazyColumn, grids, claves estables y estado de scroll | 96 | 541 | OK | — |
| 182 | Formularios, IME, foco y validación accesible | 182 | 573 | P1 | P2_prerrequisitos |
| 270 | Side effects, lifecycle y APIs imperativas | 270 | 511 | P1 | P2_prerrequisitos |
| 351 | Gestos, Canvas y componentes personalizados accesibles | 351 | 509 | P1 | P2_prerrequisitos |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Gradle, version catalogs y resolución de dependencias | 9 | 486 | P1 | P2_prerrequisitos |
| 91 | Build types, product flavors y configuración segura | 91 | 486 | P1 | P2_prerrequisitos |
| 173 | Modularización, convenciones y fronteras de arquitectura | 173 | 475 | P1 | P2_prerrequisitos |
| 250 | R8, recursos, Baseline Profiles y pipeline reproducible | 250 | 481 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Composables y recomposición | 6 | 922 | P1 | P7_rutaflow |
| 109 | State hoisting | 109 | 967 | P1 | P7_rutaflow |
| 220 | remember, rememberSaveable y layout básico | 220 | 975 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | NavHost y NavController | 6 | 879 | P1 | P7_rutaflow |
| 122 | Argumentos tipados y deep links | 122 | 955 | P1 | P7_rutaflow |
| 223 | Navegación anidada con stacks independientes | 223 | 1001 | P1 | P7_rutaflow |
| 352 | Predictive Back — gesto del sistema con preview animado | 352 | 816 | P1 | P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | StateFlow en el ViewModel | 6 | 921 | P1 | P7_rutaflow |
| 125 | collectAsStateWithLifecycle y UDF | 125 | 893 | P1 | P7_rutaflow |
| 220 | SharedFlow para eventos de un solo uso | 220 | 1004 | P1 | P7_rutaflow |
| 373 | Restaurar un borrador tras recreación: remember no equivale a rememberSaveable | 373 | 562 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Retrofit con coroutines | 6 | 886 | P1 | P7_rutaflow |
| 119 | Manejo de errores HTTP | 119 | 934 | P1 | P7_rutaflow |
| 223 | Interceptores de OkHttp | 223 | 1022 | P1 | P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Entities, DAOs y Database | 6 | 1023 | P1 | P7_rutaflow |
| 138 | Room + Flow reactivo, y migraciones | 138 | 1040 | P1 | P7_rutaflow |
| 260 | Estrategia offline-first | 260 | 1118 | P1 | P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Configuración básica de Hilt | 6 | 926 | P1 | P7_rutaflow |
| 120 | @Provides y @Binds | 120 | 994 | P1 | P7_rutaflow |
| 248 | Scopes y testing con Hilt | 248 | 949 | P1 | P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | CoroutineWorker y garantía de ejecución | 6 | 1006 | P1 | P7_rutaflow |
| 124 | Constraints y trabajo periódico | 124 | 832 | P1 | P7_rutaflow |
| 234 | Notificaciones desde background work | 234 | 889 | P1 | P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Testing de ViewModels con fakes y runTest | 6 | 1065 | P1 | P7_rutaflow |
| 139 | Compose UI Testing | 139 | 969 | P1 | P7_rutaflow |
| 255 | Testing end-to-end con Activity real, y fakes vs mocks | 255 | 1246 | P1 | P7_rutaflow |

### Track: angular (71 temas en 17 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 41 | El CLI ya no genera NgModules | 41 | 1380 | P1 | P7_rutaflow |
| 177 | Interpolación y property binding | 177 | 1342 | P1 | P7_rutaflow |
| 329 | TypeScript a fondo — unknown, any, never y utility types | 329 | 1510 | P1 | P7_rutaflow |
| 476 | Compilador AOT frente a JIT | 476 | 1438 | P1 | P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | input()/output() basados en signals | 8 | 1309 | P1 | P7_rutaflow |
| 173 | Control de flujo nativo — @if, @for, @switch | 173 | 1399 | P1 | P7_rutaflow |
| 315 | Content projection con ng-content | 315 | 1241 | P1 | P7_rutaflow |
| 460 | Ciclo de vida completo de un componente | 460 | 1416 | P1 | P7_rutaflow |
| 599 | Consultas signal y trabajo posterior al render | 599 | 1367 | P1 | P7_rutaflow |
| 750 | Directivas y pipes personalizados | 750 | 724 | P1 | P2_prerrequisitos, P7_rutaflow |
| 821 | Pipes puros e impuros, AsyncPipe y signals | 821 | 1096 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | TestBed y componentes standalone | 6 | 1236 | P1 | P7_rutaflow |
| 147 | Angular Testing Library | 147 | 1345 | P1 | P7_rutaflow |
| 291 | Mockear HttpClient y el nuevo builder basado en Vitest | 291 | 1416 | OK | — |
| 456 | Angular Material y CDK: componentes accesibles probados con harnesses | 456 | 1015 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Server-Side Rendering | 8 | 1018 | P1 | P7_rutaflow |
| 125 | Hidratación | 125 | 1199 | P1 | P7_rutaflow |
| 262 | `@defer` — estados reales, incluyendo error | 262 | 1051 | P1 | P7_rutaflow |
| 390 | Zoneless | 390 | 1036 | P1 | P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Reconocer la versión y la arquitectura de un proyecto | 7 | 655 | P1 | P7_rutaflow |
| 94 | Leer la guía de actualización antes de modificar archivos | 94 | 568 | P1 | P2_prerrequisitos, P7_rutaflow |
| 156 | Migrar una versión mayor a la vez y verificar cada salto | 156 | 520 | P1 | P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Estructura del proyecto integrador | 8 | 1295 | P1 | P7_rutaflow |
| 168 | Integrando routing, store y formularios | 168 | 1250 | P1 | P7_rutaflow |
| 305 | TareasStore — combinando signals, computed y HttpClient | 305 | 1281 | P1 | P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Accesibilidad es comportamiento, no una puntuación | 10 | 978 | P1 | P7_rutaflow |
| 146 | La seguridad automática tiene fronteras explícitas | 146 | 1019 | P1 | P7_rutaflow |
| 278 | Internacionalizar implica significado, no reemplazo de texto | 278 | 1066 | P1 | P7_rutaflow |
| 392 | Rendimiento y actualización son contratos de experiencia | 392 | 1164 | P1 | P7_rutaflow |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | TestBed y ComponentFixture | 8 | 853 | P1 | P7_rutaflow |
| 124 | Pruebas de Signals | 124 | 971 | P1 | P7_rutaflow |
| 248 | Cypress y Playwright | 248 | 963 | P1 | P7_rutaflow |
| 339 | Animaciones accesibles | 339 | 933 | P1 | P7_rutaflow |
| 468 | SSR y TransferState | 468 | 1025 | P1 | P7_rutaflow |
| 580 | Hidratación y `provideServerRendering` | 580 | 1099 | P1 | P7_rutaflow |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Qué renderiza Angular Native y por qué no es un WebView | 8 | 1161 | OK | — |
| 123 | Signals, estilos nativos compilados y el preset de Tailwind | 123 | 1102 | OK | — |
| 234 | Router nativo y servicios de Expo inyectados como servicios Angular | 234 | 1202 | OK | — |
| 361 | Evaluar la madurez de una tecnología alpha con criterio | 361 | 1202 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | signal(), computed() y effect() | 8 | 1355 | P1 | P7_rutaflow |
| 146 | Mutación frente a actualización inmutable | 146 | 1409 | P1 | P7_rutaflow |
| 285 | Signals frente a Observables | 285 | 1331 | P1 | P7_rutaflow |
| 422 | Hacia zoneless change detection | 422 | 1544 | P1 | P7_rutaflow |
| 552 | linkedSignal — estado derivado que el usuario puede sobrescribir | 552 | 772 | P1 | P7_rutaflow |
| 638 | resource() y httpResource — datos asíncronos reactivos | 638 | 845 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | @Injectable y providedIn: root | 8 | 1483 | P1 | P7_rutaflow |
| 165 | inject() frente a inyección por constructor | 165 | 1262 | P1 | P7_rutaflow |
| 277 | Jerarquía de inyectores | 277 | 1379 | P1 | P7_rutaflow |
| 409 | Tokens de inyección y decoradores de resolución | 409 | 1328 | P1 | P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Router config con rutas standalone | 8 | 1445 | P1 | P7_rutaflow |
| 170 | Guards funcionales | 170 | 1327 | P1 | P7_rutaflow |
| 319 | Lazy loading con loadComponent | 319 | 1418 | P1 | P7_rutaflow |
| 456 | Parámetros de ruta, query params y capacidades avanzadas de routing | 456 | 1386 | P1 | P7_rutaflow |
| 611 | CanDeactivate: proteger un borrador sin confundir navegación con autorización | 611 | 560 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Reactive Forms — FormGroup y FormControl | 6 | 1278 | P1 | P7_rutaflow |
| 151 | Validadores asíncronos | 151 | 1350 | P1 | P7_rutaflow |
| 305 | FormArray para campos dinámicos | 305 | 1214 | P1 | P7_rutaflow |
| 444 | Template-driven forms — cuándo siguen siendo válidos | 444 | 1281 | P1 | P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Observable frente a Promise | 6 | 1339 | P1 | P7_rutaflow |
| 141 | Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest | 141 | 1254 | P1 | P7_rutaflow |
| 280 | Manejo de suscripciones sin fugas de memoria | 280 | 1313 | P1 | P7_rutaflow |
| 414 | Subjects y operadores de aplanamiento avanzados | 414 | 1399 | P1 | P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | HttpClient con backend fetch | 6 | 1214 | P1 | P7_rutaflow |
| 160 | Interceptores funcionales | 160 | 1236 | P1 | P7_rutaflow |
| 314 | Registro de interceptores y centralización del manejo de errores | 314 | 1128 | P1 | P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Bootstrap sin NgModules | 8 | 1135 | P1 | P7_rutaflow |
| 143 | Organización por feature | 143 | 1151 | P1 | P7_rutaflow |
| 272 | Migración desde NgModules | 272 | 1243 | P1 | P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Store propio con signals | 6 | 1334 | P1 | P7_rutaflow |
| 158 | NgRx — actions, reducers y selectors | 158 | 1387 | P1 | P7_rutaflow |
| 312 | Cuándo NgRx justifica su complejidad | 312 | 1334 | P1 | P7_rutaflow |

### Track: cloud (156 temas en 35 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 29 | Fundamentos absolutos — qué es una terminal, un comando y un sistema operativo | 29 | 784 | P1 | P2_prerrequisitos, P7_rutaflow |
| 78 | Fundamentos de redes — direcciones IP, puertos, HTTP y APIs | 78 | 962 | P1 | P2_prerrequisitos, P7_rutaflow |
| 156 | Qué vas a aprender y cómo está estructurado el curso | 156 | 810 | P1 | P7_rutaflow |
| 214 | Qué es Floci — definición, propósito y comparativa con LocalStack | 214 | 891 | P1 | P2_prerrequisitos, P7_rutaflow |
| 264 | Servicios que emula Floci — AWS, Azure y GCP | 264 | 787 | P1 | P2_prerrequisitos, P7_rutaflow |
| 340 | Ventajas y limitaciones de practicar con un emulador local | 340 | 748 | P1 | P2_prerrequisitos, P7_rutaflow |
| 397 | Metodología de estudio — teoría, laboratorio y evaluación en cada módulo | 397 | 707 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Virtualización vs contenedores | 6 | 792 | P1 | P2_prerrequisitos, P7_rutaflow |
| 77 | Imágenes y capas | 77 | 745 | P1 | P2_prerrequisitos, P7_rutaflow |
| 128 | Registros de contenedores (Docker Hub) | 128 | 646 | P1 | P2_prerrequisitos, P7_rutaflow |
| 175 | Comandos esenciales de Docker | 175 | 730 | P1 | P2_prerrequisitos, P7_rutaflow |
| 228 | Docker Compose — servicios, redes y volúmenes | 228 | 770 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Secrets Manager y por qué no usar variables de entorno hardcodeadas | 6 | 899 | P1 | P2_prerrequisitos |
| 57 | KMS y envelope encryption | 57 | 963 | P1 | P2_prerrequisitos |
| 113 | SSM Parameter Store vs Secrets Manager | 113 | 773 | P1 | P2_prerrequisitos |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El patrón fan-out con SNS | 6 | 832 | P1 | P2_prerrequisitos |
| 68 | EventBridge: bus de eventos con filtrado declarativo | 68 | 834 | P1 | P2_prerrequisitos |
| 134 | SNS + SQS juntos, y Azure Event Hubs | 134 | 789 | P1 | P2_prerrequisitos |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Log groups, log streams y correlation ID | 6 | 893 | P1 | P2_prerrequisitos |
| 71 | Metric filters y alarmas | 71 | 957 | P1 | P2_prerrequisitos |
| 125 | Diagnóstico sistemático y X-Ray | 125 | 553 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | RDS Instance y cuándo elegir SQL sobre NoSQL | 6 | 931 | P1 | P2_prerrequisitos |
| 64 | Snapshots y restore | 64 | 774 | P1 | P2_prerrequisitos |
| 130 | Migrations | 130 | 862 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | ECR y por qué no basta con Docker Hub | 6 | 819 | OK | — |
| 61 | Task Definition y ECS Cluster | 61 | 835 | P1 | P2_prerrequisitos |
| 114 | Contenedores vs Lambda, y EKS | 114 | 924 | P1 | P2_prerrequisitos |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Stack, Template y por qué no crear recursos manualmente con la CLI | 6 | 629 | P1 | P2_prerrequisitos, P7_rutaflow |
| 68 | Change sets | 68 | 618 | P1 | P2_prerrequisitos, P7_rutaflow |
| 121 | Drift detection, Terraform/CDK, y compatibilidad multi-herramienta | 121 | 613 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | State machine y Task states | 6 | 825 | P1 | P2_prerrequisitos |
| 79 | Choice state, Retry y Catch | 79 | 838 | P1 | P2_prerrequisitos |
| 147 | Express vs Standard, y cuándo EventBridge Pipes es suficiente | 147 | 815 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Streams vs colas | 6 | 877 | P1 | P2_prerrequisitos |
| 61 | MSK (Kafka gestionado) y consumer groups | 61 | 916 | P1 | P2_prerrequisitos |
| 126 | Kinesis Data Streams vs Firehose, y GCP Managed Kafka | 126 | 737 | P1 | P2_prerrequisitos |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Por qué no construir tu propio sistema de autenticación | 6 | 1021 | P1 | P2_prerrequisitos |
| 69 | Access Token, ID Token y Refresh Token | 69 | 922 | P1 | P2_prerrequisitos |
| 128 | OAuth 2.0 y PKCE | 128 | 948 | P1 | P2_prerrequisitos |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Data lake y Glue Catalog | 6 | 831 | P1 | P2_prerrequisitos |
| 68 | Glue Crawler y Athena | 68 | 890 | P1 | P2_prerrequisitos |
| 139 | Parquet vs CSV, y partition pruning | 139 | 855 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Objetos, buckets y su nomenclatura | 6 | 1060 | P1 | P2_prerrequisitos |
| 100 | Claves y metadatos | 100 | 865 | P1 | P2_prerrequisitos |
| 170 | Versionado y ciclo de vida | 170 | 889 | P1 | P2_prerrequisitos |
| 242 | Transición entre capas de almacenamiento | 242 | 761 | P1 | P2_prerrequisitos |
| 303 | Políticas de bucket, ACL y URLs pre-firmadas | 303 | 826 | P1 | P2_prerrequisitos |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Bedrock Runtime y respuestas stub deterministas | 6 | 884 | P1 | P2_prerrequisitos |
| 59 | Textract y Transcribe | 59 | 791 | P1 | P2_prerrequisitos |
| 118 | Stub vs mock, y qué probar localmente | 118 | 844 | P1 | P2_prerrequisitos |
**modulo-21**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El modelo de ejecución de EC2 — instancias que son contenedores Docker reales | 6 | 806 | P1 | P2_prerrequisitos, P7_rutaflow |
| 84 | AMIs, grupos de seguridad y claves SSH | 84 | 950 | P1 | P2_prerrequisitos, P7_rutaflow |
| 138 | UserData e IMDS — arranque automatizado y credenciales por instancia | 138 | 694 | P1 | P2_prerrequisitos, P7_rutaflow |
| 204 | Auto Scaling — configuraciones de lanzamiento y grupos | 204 | 842 | P1 | P2_prerrequisitos |
| 262 | El reconciliador de capacidad y las políticas de escalado | 262 | 867 | P1 | P2_prerrequisitos |
| 321 | VPC y redes — subredes, security groups y el flujo del tráfico | 321 | 807 | P1 | P2_prerrequisitos |
**modulo-22**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | ELB v2 — balanceadores, grupos objetivo y reglas | 6 | 1099 | P1 | P2_prerrequisitos |
| 77 | ACM — certificados TLS con criptografía real | 77 | 887 | P1 | P2_prerrequisitos |
| 137 | CloudFront — distribución de contenido y control de acceso al origen | 137 | 928 | P1 | P2_prerrequisitos, P7_rutaflow |
| 204 | Route53 — zonas alojadas y registros de recursos | 204 | 872 | P1 | P2_prerrequisitos |
| 261 | Cómo se integran los cuatro servicios en una arquitectura de borde real | 261 | 1043 | P1 | P2_prerrequisitos |
**modulo-23**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué resuelve un caché en memoria — y cuándo no ayuda | 6 | 1056 | P1 | P2_prerrequisitos |
| 78 | Arquitectura de ElastiCache en Floci — contenedores reales, no simulación | 78 | 782 | P1 | P2_prerrequisitos, P7_rutaflow |
| 131 | Creación de clústeres y conexión con clientes estándar | 131 | 766 | P1 | P2_prerrequisitos |
| 195 | Autenticación IAM para el plano de datos de ElastiCache | 195 | 823 | P1 | P2_prerrequisitos |
**modulo-24**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | CodeBuild — compilaciones reales dentro de contenedores Docker | 6 | 986 | P1 | P2_prerrequisitos |
| 84 | buildspec.yml — fases y artefactos | 84 | 574 | P1 | P2_prerrequisitos, P7_rutaflow |
| 158 | CodeDeploy — aplicaciones, grupos y configuraciones predefinidas | 158 | 830 | P1 | P2_prerrequisitos |
| 215 | Despliegue Blue/Green de Lambda — cambio de tráfico por alias | 215 | 904 | P1 | P2_prerrequisitos |
| 271 | Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB | 271 | 983 | P1 | P2_prerrequisitos |
**modulo-25**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | AWS Config — rastrear reglas sobre tus recursos | 6 | 796 | P1 | P2_prerrequisitos |
| 59 | AppConfig — desplegar configuración sin redeployar código | 59 | 861 | P1 | P2_prerrequisitos |
| 119 | AppConfigData — el plano de datos que consume tu aplicación | 119 | 949 | P1 | P2_prerrequisitos, P7_rutaflow |
| 186 | AWS Backup — centralizar la política de respaldo de múltiples servicios | 186 | 868 | P1 | P2_prerrequisitos |
| 246 | El ciclo de vida de un trabajo de respaldo | 246 | 878 | OK | — |
| 353 | Simulacro de restauración: comprobar contenido, no solo la existencia del backup | 353 | 487 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-26**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Amazon Data Firehose — entrega gestionada sin consumidores propios | 6 | 924 | P1 | P2_prerrequisitos |
| 66 | Firehose vs Kinesis Data Streams — quién consume los datos | 66 | 853 | P1 | P2_prerrequisitos |
| 119 | EventBridge Pipes — conectar origen y destino sin código de pegamento | 119 | 1012 | P1 | P2_prerrequisitos |
| 185 | Cuándo usar Pipes frente a reglas EventBridge o Step Functions | 185 | 993 | P1 | P2_prerrequisitos |
**modulo-27**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | AppSync — APIs GraphQL gestionadas | 6 | 675 | P1 | P2_prerrequisitos, P7_rutaflow |
| 69 | Fuentes de datos y resolvers | 69 | 865 | P1 | P2_prerrequisitos |
| 127 | SES — identidades, envío y plantillas | 127 | 917 | P1 | P2_prerrequisitos |
| 185 | El simulador de buzones y el punto de inspección local | 185 | 867 | P1 | P2_prerrequisitos |
**modulo-28**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Bases de datos de grafos — cuando las relaciones son el dato | 6 | 965 | P1 | P2_prerrequisitos |
| 78 | Neptune en Floci — un servidor Gremlin real, no una simulación | 78 | 758 | P1 | P2_prerrequisitos |
| 134 | OpenSearch — modo simulado y modo real | 134 | 962 | P1 | P2_prerrequisitos |
| 196 | Eligiendo entre Neptune, OpenSearch y DynamoDB | 196 | 970 | P1 | P2_prerrequisitos |
**modulo-29**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Cost Explorer — costos sintetizados a partir de tu estado real | 6 | 895 | OK | — |
| 65 | Pricing — catálogo de tarifas de referencia | 65 | 846 | P1 | P2_prerrequisitos |
| 126 | BCM Data Exports — reportes de costo en formato estándar | 126 | 806 | P1 | P2_prerrequisitos |
| 182 | Resource Groups Tagging API — descubrimiento centralizado por etiqueta | 182 | 824 | P1 | P2_prerrequisitos |
| 243 | STS en profundidad — identidad temporal y aislamiento multi-cuenta | 243 | 897 | P1 | P2_prerrequisitos |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Colas, productores y consumidores | 6 | 913 | P1 | P2_prerrequisitos |
| 65 | Ciclo de vida de un mensaje | 65 | 1070 | P1 | P2_prerrequisitos |
| 136 | Dead Letter Queues (DLQ) | 136 | 1045 | P1 | P2_prerrequisitos |
| 207 | Colas FIFO vs Standard | 207 | 999 | P1 | P2_prerrequisitos |
**modulo-30**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué resuelve Transfer Family | 6 | 861 | P1 | P2_prerrequisitos |
| 59 | Ciclo de vida del servidor y modelo de usuarios | 59 | 815 | P1 | P2_prerrequisitos |
| 121 | Claves públicas SSH y autenticación de usuarios | 121 | 885 | P1 | P2_prerrequisitos |
| 186 | Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente | 186 | 887 | P1 | P2_prerrequisitos |
**modulo-31**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura multi-nube y portabilidad de conocimiento | 6 | 889 | P1 | P2_prerrequisitos |
| 69 | Arquitectura interna de cloud local y su uso en CI/CD | 69 | 583 | P1 | P2_prerrequisitos, P7_rutaflow |
| 122 | Migración desde otros emuladores, y límites de un emulador | 122 | 856 | P1 | P2_prerrequisitos |
| 173 | Testcontainers — pruebas de integración automatizadas | 173 | 946 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-32**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Una red segura empieza por flujos, no por subredes | 8 | 739 | P1 | P2_prerrequisitos |
| 73 | Una landing zone convierte gobierno en una base repetible | 73 | 756 | P1 | P2_prerrequisitos |
| 148 | Disponibilidad y recuperación responden preguntas distintas | 148 | 776 | P1 | P2_prerrequisitos |
| 218 | Un backup solo existe operativamente después de restaurarlo | 218 | 726 | P1 | P2_prerrequisitos |
**modulo-33**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Terraform avanzado y CI/CD cloud | 6 | 848 | P1 | P2_prerrequisitos |
| 73 | Kubernetes administrado, ECS y Service Mesh | 73 | 805 | P1 | P2_prerrequisitos |
| 129 | EC2, VPC, RDS, S3 y DynamoDB avanzados | 129 | 1070 | P1 | P2_prerrequisitos |
| 204 | Lambda, API Gateway y observabilidad avanzada | 204 | 852 | P1 | P2_prerrequisitos, P7_rutaflow |
| 262 | Seguridad, auditoría y FinOps | 262 | 790 | P1 | P2_prerrequisitos |
| 318 | Microservicios, Big Data, AI/ML y multi-cloud | 318 | 930 | OK | — |
**modulo-34**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 19 | Instalación en macOS, Linux y Windows | 19 | 540 | P1 | P2_prerrequisitos, P7_rutaflow |
| 76 | Modelo mental de la plataforma | 76 | 773 | P1 | P2_prerrequisitos, P7_rutaflow |
| 151 | AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK | 151 | 749 | P1 | P2_prerrequisitos |
| 218 | Configuración avanzada y ciclo de vida | 218 | 615 | P1 | P2_prerrequisitos, P7_rutaflow |
| 282 | Automatización, UI y agentes | 282 | 981 | P1 | P2_prerrequisitos |
| 363 | Servicios AWS incorporados en la documentación actual | 363 | 977 | P1 | P2_prerrequisitos |
| 433 | Servicios Azure que completan el recorrido | 433 | 947 | P1 | P2_prerrequisitos |
| 513 | Servicios GCP que completan el recorrido | 513 | 819 | P1 | P2_prerrequisitos |
| 593 | floci-ui — explorador visual multi-nube | 593 | 817 | P1 | P2_prerrequisitos |
| 639 | Laboratorios oficiales reconstruidos en español | 639 | 578 | P1 | P7_rutaflow |
| 704 | Límites y transferencia a producción | 704 | 511 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué es NoSQL y cuándo usarlo | 6 | 1258 | P1 | P2_prerrequisitos |
| 96 | Tablas, items y atributos | 96 | 1226 | P1 | P2_prerrequisitos |
| 191 | Tipos de datos — S, N, B, BOOL, NULL, L, M | 191 | 1707 | P1 | P2_prerrequisitos |
| 390 | Clave primaria simple (HASH) vs compuesta (HASH + RANGE) | 390 | 1174 | P1 | P2_prerrequisitos |
| 474 | Índices secundarios globales (GSI) y locales (LSI) | 474 | 1153 | P1 | P2_prerrequisitos |
| 561 | Query vs Scan | 561 | 1302 | P1 | P2_prerrequisitos |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué es serverless — ventajas y desventajas | 6 | 1697 | P1 | P2_prerrequisitos |
| 166 | Estructura de una función Lambda | 166 | 1385 | P1 | P2_prerrequisitos |
| 319 | Runtimes — Node.js, Python, Java, Go | 319 | 1321 | P1 | P2_prerrequisitos |
| 448 | Payload de entrada y respuesta | 448 | 1268 | P1 | P2_prerrequisitos |
| 580 | Versionado y alias | 580 | 1197 | P1 | P2_prerrequisitos |
| 672 | Integración con S3, DynamoDB Streams y API Gateway | 672 | 1268 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué es API Gateway y tipos de API — REST, HTTP, WebSocket | 6 | 1020 | P1 | P2_prerrequisitos |
| 71 | Recursos, métodos y stages | 71 | 1180 | P1 | P2_prerrequisitos |
| 174 | Integración con Lambda (proxy) | 174 | 1169 | P1 | P2_prerrequisitos |
| 250 | Mapeo de entrada/salida y validación con modelos | 250 | 925 | P1 | P2_prerrequisitos |
| 307 | Despliegue y variables de stage | 307 | 934 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Principio de mínimo privilegio | 6 | 1040 | P1 | P2_prerrequisitos, P7_rutaflow |
| 68 | Modelo de responsabilidad compartida | 68 | 1032 | P1 | P2_prerrequisitos |
| 128 | Usuarios, grupos y roles | 128 | 1072 | P1 | P2_prerrequisitos, P7_rutaflow |
| 183 | Estructura de una política — acciones, recursos y condiciones | 183 | 758 | P1 | P2_prerrequisitos, P7_rutaflow |
| 254 | Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales | 254 | 1023 | P1 | P2_prerrequisitos |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions | 6 | 1069 | P1 | P2_prerrequisitos |
| 76 | floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions | 76 | 1057 | P1 | P2_prerrequisitos |
| 147 | Comparativa AWS vs Azure vs GCP por categoría de servicio | 147 | 1547 | P1 | P2_prerrequisitos |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura de la aplicación — frontend, backend y base de datos | 6 | 1040 | P1 | P2_prerrequisitos |
| 62 | CRUD de tareas sobre DynamoDB expuesto por Lambda | 62 | 946 | P1 | P2_prerrequisitos, P7_rutaflow |
| 129 | Archivos adjuntos en S3 y procesamiento en segundo plano con SQS | 129 | 1113 | P1 | P2_prerrequisitos, P7_rutaflow |
| 189 | API Gateway e IAM de mínimo privilegio para el proyecto | 189 | 1000 | P1 | P2_prerrequisitos, P7_rutaflow |
| 257 | Documentación de la API y guía de despliegue | 257 | 725 | P1 | P2_prerrequisitos, P7_rutaflow |

### Track: devops (129 temas en 23 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 33 | Sistema de archivos y permisos (chmod/chown) | 33 | 957 | P1 | P7_rutaflow |
| 115 | Procesos, señales y jobs en segundo plano | 115 | 900 | P1 | P7_rutaflow |
| 192 | Pipes, redirección y filtros (grep, awk, sed) | 192 | 805 | P1 | P7_rutaflow |
| 273 | Variables de entorno y scripts bash robustos (set -euo pipefail) | 273 | 826 | P1 | P7_rutaflow |
| 354 | Cron y tareas programadas | 354 | 755 | P1 | P7_rutaflow |
| 434 | Hardening básico — SSH sin contraseña, firewalls, SELinux/AppArmor | 434 | 806 | P1 | P7_rutaflow |
| 507 | Redes — modelo OSI, TCP/IP, DNS y balanceadores de carga | 507 | 712 | P1 | P7_rutaflow |
| 578 | Cultura DevOps y el ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor | 578 | 650 | P1 | P7_rutaflow |
| 650 | NGINX y proxies desde cero | 650 | 864 | P1 | P7_rutaflow |
| 804 | Usuarios, grupos, permisos compartidos y sudo con mínimo privilegio | 804 | 912 | P1 | P2_prerrequisitos |
| 921 | systemd: servicios, timers y logs con journalctl | 921 | 879 | P1 | P2_prerrequisitos |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Trunk-based development vs GitFlow | 6 | 964 | P1 | P7_rutaflow |
| 88 | Rebase interactivo vs merge | 88 | 765 | P1 | P7_rutaflow |
| 171 | Bisect para encontrar regresiones | 171 | 775 | P1 | P7_rutaflow |
| 253 | Hooks de Git y commits firmados | 253 | 827 | P1 | P7_rutaflow |
| 336 | Monorepos vs polyrepos | 336 | 745 | P1 | P7_rutaflow |
| 413 | git cherry-pick, git stash, git reset vs git revert | 413 | 779 | P1 | P7_rutaflow |
| 490 | git reflog, git worktree y git submodule | 490 | 808 | P1 | P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Logging estructurado (JSON) | 6 | 841 | P1 | P7_rutaflow |
| 103 | Pipeline ELK/EFK | 103 | 752 | P1 | P7_rutaflow |
| 189 | Loki + Grafana como alternativa ligera | 189 | 797 | P1 | P7_rutaflow |
| 268 | Correlation ID a través de servicios | 268 | 888 | P1 | P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Escaneo de imágenes y dependencias (Trivy, Snyk) | 6 | 934 | P1 | P7_rutaflow |
| 103 | Integración en el pipeline | 103 | 885 | P1 | P7_rutaflow |
| 199 | Gestión de secretos (Vault, SOPS) | 199 | 885 | P1 | P7_rutaflow |
| 276 | Menor privilegio en CI/CD | 276 | 956 | P1 | P7_rutaflow |
| 402 | SBOM y supply chain security | 402 | 824 | P1 | P7_rutaflow |
| 491 | SAST, DAST y SCA — diferencias y herramientas | 491 | 909 | P1 | P7_rutaflow |
| 575 | Reconocimiento de tu propio laboratorio: escaneo de puertos y banners | 575 | 840 | P1 | P2_prerrequisitos |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | De cloud local a un proveedor cloud real | 6 | 1029 | P1 | P7_rutaflow |
| 106 | Gestión de secretos cloud-native | 106 | 952 | P1 | P7_rutaflow |
| 186 | IaC multi-nube | 186 | 938 | P1 | P7_rutaflow |
| 293 | Checklist de salida a producción | 293 | 856 | P1 | P7_rutaflow |
| 385 | GitOps con ArgoCD y FluxCD | 385 | 975 | P1 | P7_rutaflow |
| 479 | Platform Engineering — Internal Developer Platforms (IDPs) | 479 | 1112 | P1 | P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El pipeline completo — de commit a producción verificada | 6 | 851 | P1 | P2_prerrequisitos |
| 127 | Uniendo cada módulo del track en un solo flujo | 127 | 807 | P1 | P2_prerrequisitos |
| 232 | Cierre del track — checklist final y reflexión | 232 | 818 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Confiabilidad es una expectativa cuantificada | 8 | 846 | P1 | P2_prerrequisitos |
| 78 | Una alerta debe conducir a una acción | 78 | 1003 | P1 | P2_prerrequisitos |
| 208 | Construir una imagen no demuestra de dónde proviene | 208 | 935 | P1 | P2_prerrequisitos |
| 334 | Una plataforma interna es un producto con límites | 334 | 915 | P1 | P2_prerrequisitos |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Docker y Compose avanzados | 6 | 709 | P1 | P2_prerrequisitos |
| 96 | Kubernetes extensible y Helm avanzado | 96 | 601 | P1 | P2_prerrequisitos |
| 166 | Service Mesh con Istio o Linkerd | 166 | 735 | P1 | P2_prerrequisitos |
| 253 | GitOps con Argo CD y Flux | 253 | 669 | P1 | P2_prerrequisitos |
| 320 | Ansible, inventarios, roles y Vault | 320 | 653 | P1 | P2_prerrequisitos |
| 380 | DevSecOps y métricas DORA | 380 | 740 | P1 | P2_prerrequisitos |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Postman y Newman — tu primera colección contra una API real | 7 | 935 | OK | — |
| 129 | Scripts y assertions — pruebas automatizadas sobre datos reales | 129 | 957 | P1 | P7_rutaflow |
| 239 | Newman en profundidad — reportes y el contrato del código de salida | 239 | 909 | P1 | P7_rutaflow |
| 322 | Jenkins — instalación, jobs y el linter real de pipelines declarativos | 322 | 1033 | P1 | P7_rutaflow |
| 435 | Integración completa — Newman dentro de un pipeline Jenkins | 435 | 915 | P1 | P7_rutaflow |
| 542 | Tema complementario: Bruno y Postman, evaluar con el mismo contrato | 542 | 464 | P1 | P2_prerrequisitos |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | El borde: balanceo, proxy inverso, CDN y límites de tasa | 7 | 1211 | OK | — |
| 177 | Datos que crecen: índices, réplicas, sharding y la elección SQL/NoSQL | 177 | 1223 | OK | — |
| 344 | CAP, consistencia e idempotencia: lo que se paga en cada decisión | 344 | 1223 | OK | — |
| 479 | Capacidad y observabilidad: latencia, throughput, SLO y pruebas de carga | 479 | 1227 | OK | — |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Aprovisionar y endurecer: usuario, SSH, firewall y parches | 7 | 1224 | OK | — |
| 161 | Dominio, TLS y borde: DNS, Let's Encrypt y Cloudflare | 161 | 1177 | OK | — |
| 296 | Despliegue y rollback: systemd, nginx y artefactos versionados | 296 | 1243 | OK | — |
| 515 | Respaldos que se restauran: restic, RPO/RTO y simulacro | 515 | 1102 | OK | — |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Límites, acoplamiento y monolito modular: cuándo un microservicio no es la respuesta | 9 | 1548 | OK | — |
| 163 | Lenguaje ubicuo y contextos delimitados: el mismo envío no significa lo mismo | 163 | 1482 | OK | — |
| 325 | Agregados, invariantes y eventos de dominio: dónde vive la regla que no se puede romper | 325 | 1371 | P1 | P7_rutaflow |
| 475 | ADR y fitness functions: decisiones que el código puede defender | 475 | 1219 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Dockerfile multi-stage | 6 | 1000 | P1 | P7_rutaflow |
| 105 | Capas e invalidación de caché | 105 | 725 | P1 | P7_rutaflow |
| 192 | Imágenes base distroless/alpine | 192 | 654 | P1 | P7_rutaflow |
| 260 | Volúmenes vs bind mounts | 260 | 700 | P1 | P7_rutaflow |
| 339 | Redes en Docker | 339 | 699 | P1 | P7_rutaflow |
| 408 | Registries — Docker Hub, AWS ECR, Azure Container Registry, Harbor | 408 | 727 | P1 | P7_rutaflow |
| 485 | Operación diaria: inspect, stats, events y respaldo de volúmenes | 485 | 1002 | OK | — |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Eventos de dominio e integración: hechos, no comandos | 9 | 1363 | OK | — |
| 150 | Outbox transaccional: guardar el hecho y el mensaje juntos | 150 | 1627 | OK | — |
| 338 | Idempotencia y orden: consumidores que sobreviven a reintentos | 338 | 1464 | OK | — |
| 509 | Sagas y compensaciones: procesos largos sin transacción distribuida | 509 | 1305 | OK | — |
**modulo-21**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Descomponer por capacidad de negocio: dos servicios, un contrato | 9 | 1227 | OK | — |
| 146 | Datos por servicio: propiedad, composición y réplicas | 146 | 1290 | OK | — |
| 274 | Resiliencia: timeouts, reintentos y cortacircuitos | 274 | 1551 | P1 | P7_rutaflow |
| 440 | Observabilidad distribuida: trazas, correlación y SLO | 440 | 1476 | OK | — |
**modulo-22**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Floci desde cero: instalar, aislar y verificar | 13 | 1661 | OK | — |
| 179 | S3 y diagnóstico de red: objetos, metadatos y errores | 179 | 1684 | OK | — |
| 342 | Contenedores y CI: una imagen que se prueba contra Floci | 342 | 1742 | OK | — |
| 549 | Terraform, SQS y operación: infraestructura reproducible y ejercicios | 549 | 1604 | OK | — |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Servicios, dependencias y healthchecks | 6 | 723 | P1 | P7_rutaflow |
| 99 | Variables de entorno y .env | 99 | 633 | P1 | P7_rutaflow |
| 178 | Redes y descubrimiento por nombre de servicio | 178 | 720 | P1 | P7_rutaflow |
| 267 | Perfiles para distintos entornos | 267 | 630 | P1 | P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Jobs, steps y matrices de build | 6 | 766 | P1 | P7_rutaflow |
| 98 | Caché de dependencias en CI | 98 | 763 | P1 | P7_rutaflow |
| 171 | Artifacts y reportes de cobertura | 171 | 723 | P1 | P7_rutaflow |
| 237 | Pipelines como código (GitHub Actions/GitLab CI) | 237 | 820 | P1 | P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Blue-green deployment | 6 | 740 | P1 | P7_rutaflow |
| 102 | Canary releases | 102 | 694 | P1 | P7_rutaflow |
| 197 | Rolling updates | 197 | 768 | P1 | P7_rutaflow |
| 279 | Feature flags vs branches por entorno | 279 | 750 | P1 | P7_rutaflow |
| 361 | Rollback automático por métricas | 361 | 865 | P1 | P7_rutaflow |
| 486 | Rollback ensayado y compatibilidad del artefacto anterior | 486 | 450 | P1 | P2_prerrequisitos, P7_rutaflow |
| 541 | A/B testing y shadow traffic: medir sin convertir usuarios en cobayas | 541 | 1106 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Pod, ReplicaSet, Deployment | 6 | 842 | P1 | P7_rutaflow |
| 100 | Service (ClusterIP, NodePort, LoadBalancer) | 100 | 704 | P1 | P7_rutaflow |
| 188 | ConfigMaps y Secrets | 188 | 829 | P1 | P7_rutaflow |
| 268 | kubectl esencial | 268 | 739 | P1 | P7_rutaflow |
| 346 | Namespaces | 346 | 752 | P1 | P7_rutaflow |
| 424 | StatefulSets, DaemonSets, Jobs y CronJobs | 424 | 876 | P1 | P7_rutaflow |
| 527 | Persistent Volumes, PVCs y StorageClasses | 527 | 809 | P1 | P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Helm charts y values | 6 | 742 | P1 | P7_rutaflow |
| 106 | Ingress Controllers y reglas de enrutamiento | 106 | 825 | P1 | P7_rutaflow |
| 202 | HorizontalPodAutoscaler | 202 | 818 | P1 | P7_rutaflow |
| 277 | Probes de liveness y readiness | 277 | 863 | P1 | P7_rutaflow |
| 387 | RBAC en Kubernetes | 387 | 781 | P1 | P7_rutaflow |
| 480 | Service Mesh — Istio, Linkerd, Envoy y mTLS | 480 | 845 | P1 | P7_rutaflow |
| 575 | Estrategias de despliegue — Recreate vs RollingUpdate | 575 | 661 | P1 | P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Providers, resources y data sources | 6 | 762 | P1 | P7_rutaflow |
| 94 | State remoto y locking | 94 | 760 | P1 | P7_rutaflow |
| 180 | Módulos reutilizables | 180 | 757 | P1 | P7_rutaflow |
| 281 | terraform plan vs apply | 281 | 769 | P1 | P7_rutaflow |
| 364 | Workspaces para múltiples entornos | 364 | 738 | P1 | P7_rutaflow |
| 451 | Ansible — playbooks, roles, inventory y módulos | 451 | 788 | P1 | P7_rutaflow |
| 537 | Pulumi como alternativa a HCL | 537 | 884 | P1 | P7_rutaflow |
| 653 | Tema complementario: OpenTofu, plan y estado sin recursos cloud | 653 | 475 | P1 | P2_prerrequisitos |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Modelo de métricas de Prometheus — counter, gauge, histogram | 6 | 855 | P1 | P7_rutaflow |
| 94 | PromQL esencial | 94 | 701 | P1 | P7_rutaflow |
| 175 | Dashboards en Grafana | 175 | 721 | P1 | P7_rutaflow |
| 263 | Alertmanager y reglas de alerta | 263 | 792 | P1 | P7_rutaflow |
| 355 | SLI, SLO, SLA | 355 | 887 | P1 | P7_rutaflow |
| 434 | OpenTelemetry como estándar de instrumentación | 434 | 788 | P1 | P7_rutaflow |
| 525 | Métricas DORA — Lead Time, Deployment Frequency, MTTR, Change Failure Rate | 525 | 921 | P1 | P7_rutaflow |

### Track: flutter (63 temas en 16 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 27 | Sound null safety | 27 | 1099 | P1 | P2_prerrequisitos |
| 144 | Clases y mixins | 144 | 1061 | P1 | P2_prerrequisitos |
| 245 | Futures, async/await y colecciones funcionales | 245 | 958 | P1 | P2_prerrequisitos, P7_rutaflow |
| 343 | Lints y estilo con analysis_options.yaml | 343 | 716 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | StatelessWidget vs StatefulWidget | 6 | 953 | P1 | P2_prerrequisitos |
| 121 | Layout con Row, Column y Stack, y ciclo de vida | 121 | 958 | P1 | P2_prerrequisitos |
| 247 | Keys | 247 | 1016 | P1 | P2_prerrequisitos |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | ThemeData con Material 3 | 6 | 789 | P1 | P2_prerrequisitos |
| 74 | Adaptación Material vs Cupertino | 74 | 863 | P1 | P2_prerrequisitos |
| 143 | Accesibilidad con Semantics y dark mode | 143 | 915 | P1 | P2_prerrequisitos |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Builds de release para cada plataforma | 6 | 906 | OK | — |
| 100 | Iconos y splash screens | 100 | 864 | P1 | P2_prerrequisitos |
| 224 | CI/CD con Codemagic o Fastlane | 224 | 887 | P1 | P2_prerrequisitos |
| 314 | Entornos y flavors con --dart-define-from-file | 314 | 762 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura por features y Clean Architecture | 6 | 847 | P1 | P2_prerrequisitos |
| 83 | Uniendo los módulos del track | 83 | 888 | P1 | P2_prerrequisitos |
| 184 | Cierre del track | 184 | 921 | P1 | P2_prerrequisitos |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Una API Dart puede terminar en una frontera nativa | 8 | 804 | P1 | P2_prerrequisitos |
| 102 | Los secretos no pertenecen al binario | 102 | 854 | P1 | P2_prerrequisitos |
| 206 | Fluidez se mide contra el presupuesto de cada frame | 206 | 803 | P1 | P2_prerrequisitos |
| 289 | Producción exige protocolo, telemetría y contención | 289 | 872 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 30 | Diseño de pantallas y Riverpod | 30 | 707 | P1 | P2_prerrequisitos, P7_rutaflow |
| 112 | Google Maps y localización en tiempo real | 112 | 759 | P1 | P2_prerrequisitos, P7_rutaflow |
| 198 | Socket.IO y actualización de rutas | 198 | 849 | P1 | P2_prerrequisitos |
| 285 | Animaciones de localización | 285 | 578 | P1 | P2_prerrequisitos, P7_rutaflow |
| 342 | Almacenamiento local, imágenes y offline | 342 | 611 | P1 | P2_prerrequisitos, P7_rutaflow |
| 401 | Dio y notificaciones push | 401 | 668 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 5 | flutter test y WidgetTester | 5 | 627 | P1 | P2_prerrequisitos, P7_rutaflow |
| 55 | pumpAndSettle, golden e integration tests | 55 | 720 | P1 | P2_prerrequisitos, P7_rutaflow |
| 128 | Rendimiento, RepaintBoundary y Keys | 128 | 634 | P1 | P2_prerrequisitos, P7_rutaflow |
| 181 | Clean Architecture | 181 | 648 | P1 | P2_prerrequisitos, P7_rutaflow |
| 233 | Internacionalización completa | 233 | 681 | P1 | P2_prerrequisitos |
| 291 | Builds, firma y despliegue | 291 | 702 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | MediaQuery vs LayoutBuilder | 6 | 919 | P1 | P2_prerrequisitos |
| 91 | Cómo Flutter calcula tamaños | 91 | 912 | P1 | P2_prerrequisitos |
| 164 | Breakpoints propios y SafeArea | 164 | 905 | P1 | P2_prerrequisitos |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | go_router: navegación como función de la URL | 6 | 881 | P1 | P2_prerrequisitos |
| 85 | Guards y deep linking | 85 | 911 | P1 | P2_prerrequisitos |
| 154 | Transiciones personalizadas | 154 | 827 | P1 | P2_prerrequisitos |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | setState y sus límites | 6 | 894 | P1 | P2_prerrequisitos |
| 86 | Riverpod | 86 | 950 | P1 | P2_prerrequisitos |
| 209 | Bloc/Cubit y otras alternativas | 209 | 1053 | P1 | P2_prerrequisitos |
| 338 | Formularios profesionales con Formz y Riverpod | 338 | 1280 | P1 | P2_prerrequisitos, P7_rutaflow |
| 531 | Inyección de dependencias con Riverpod: reemplazar implementaciones | 531 | 744 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | http vs dio | 6 | 880 | P1 | P2_prerrequisitos |
| 94 | json_serializable | 94 | 916 | P1 | P2_prerrequisitos |
| 167 | Interceptores y estados explícitos | 167 | 1073 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | shared_preferences | 6 | 781 | P1 | P2_prerrequisitos |
| 78 | sqflite vs Hive | 78 | 905 | P1 | P2_prerrequisitos |
| 171 | Offline-first y Firebase | 171 | 947 | P1 | P2_prerrequisitos |
| 285 | Restauración de formularios con RestorationMixin y una prueba de recreación | 285 | 503 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | MethodChannel | 6 | 893 | P1 | P2_prerrequisitos |
| 106 | Plugins federados | 106 | 808 | P1 | P2_prerrequisitos |
| 166 | Permisos de plataforma y cuándo escribir un platform channel propio | 166 | 836 | P1 | P2_prerrequisitos |
| 234 | Cámara, galería y carga multipart de una evidencia | 234 | 1251 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Animaciones implícitas vs explícitas | 6 | 802 | P1 | P2_prerrequisitos |
| 90 | Flutter DevTools y detección de jank | 90 | 858 | P1 | P2_prerrequisitos |
| 160 | const widgets, RepaintBoundary y shouldRepaint | 160 | 906 | P1 | P2_prerrequisitos |
| 234 | Isolates — trabajo pesado sin congelar la interfaz | 234 | 879 | P1 | P2_prerrequisitos |
| 322 | CustomPainter: dibujar con Canvas sin repintar de más | 322 | 894 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Unit tests y widget tests | 6 | 882 | P1 | P2_prerrequisitos |
| 91 | Mocking con mocktail | 91 | 834 | P1 | P2_prerrequisitos |
| 167 | Integration tests | 167 | 859 | P1 | P2_prerrequisitos |

### Track: foundations (99 temas en 16 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 30 | Del hardware al programa en ejecución | 30 | 730 | P1 | P2_prerrequisitos, P7_rutaflow |
| 101 | Archivos, carpetas y rutas sin perderse | 101 | 555 | P1 | P2_prerrequisitos, P7_rutaflow |
| 158 | Cómo leer un comando antes de ejecutarlo | 158 | 486 | P1 | P2_prerrequisitos, P7_rutaflow |
| 215 | Primer programa, primer error y primera evidencia | 215 | 578 | P1 | P2_prerrequisitos |
| 283 | Tema complementario: VS Code, comandos y atajos comprobables | 283 | 463 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Del problema al algoritmo y a los casos de prueba | 6 | 1402 | P1 | P7_rutaflow |
| 151 | Variables, tipos, expresiones y cambios de estado | 151 | 1221 | P1 | P7_rutaflow |
| 279 | Decisiones, repeticiones y trazado de ejecución | 279 | 1298 | P1 | P2_prerrequisitos, P7_rutaflow |
| 415 | Funciones y descomposición de problemas | 415 | 1205 | P1 | P2_prerrequisitos, P7_rutaflow |
| 561 | Cómo la computadora representa los datos — binario, texto y decimales | 561 | 790 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | La red convierte el resultado en una incertidumbre | 8 | 1122 | P1 | P2_prerrequisitos |
| 135 | Replicación, consistencia y decisiones explícitas | 135 | 1160 | P1 | P2_prerrequisitos |
| 250 | Mensajes que se procesan con efectos exactamente una vez | 250 | 1179 | P1 | P2_prerrequisitos |
| 376 | Resiliencia y observabilidad orientadas a objetivos | 376 | 1151 | P1 | P2_prerrequisitos |
| 494 | Tiempo, coordinación y acuerdo: Lamport, elección de líder y commit en dos fases | 494 | 1171 | P1 | P2_prerrequisitos |
| 661 | Latencia y throughput: medir concurrencia sin confundirla con capacidad ilimitada | 661 | 652 | P1 | P2_prerrequisitos |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 11 | Sistemas, arquitectura y sistemas operativos | 11 | 996 | P1 | P2_prerrequisitos |
| 112 | Algoritmos, autómatas, lenguajes y compiladores | 112 | 1004 | P1 | P2_prerrequisitos |
| 229 | Bases de datos, almacenes analíticos y minería de datos | 229 | 668 | P1 | P2_prerrequisitos |
| 306 | Inteligencia artificial, aprendizaje automático y visión | 306 | 994 | P1 | P2_prerrequisitos |
| 417 | Gráficos y cómputo científico | 417 | 959 | P1 | P2_prerrequisitos |
| 517 | Redes, seguridad, web e ingeniería profesional | 517 | 923 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 15 | Matemáticas aplicadas: derivada, integral y modelos | 15 | 581 | P1 | P2_prerrequisitos |
| 70 | Circuitos DC y AC: Kirchhoff, Thévenin y Norton | 70 | 603 | P1 | P2_prerrequisitos |
| 125 | Electrónica analógica: diodos, transistores y amplificadores | 125 | 599 | P1 | P2_prerrequisitos |
| 180 | Electrónica digital: lógica y máquinas de estados | 180 | 533 | P1 | P2_prerrequisitos |
| 237 | Microcontroladores: GPIO, ADC, PWM e interrupciones | 237 | 584 | P1 | P2_prerrequisitos |
| 292 | Comunicaciones: modulación y detección de errores | 292 | 540 | P1 | P2_prerrequisitos |
| 347 | Señales y sistemas: muestreo, Fourier y convolución | 347 | 594 | P1 | P2_prerrequisitos |
| 404 | DSP: filtros digitales y compresión | 404 | 580 | P1 | P2_prerrequisitos |
| 461 | Instrumentación: calibración, DAQ e incertidumbre | 461 | 533 | P1 | P2_prerrequisitos |
| 516 | Control automático: realimentación, PID y estabilidad | 516 | 572 | P1 | P2_prerrequisitos |
| 574 | Potencia: conversión, eficiencia y disipación | 574 | 553 | P1 | P2_prerrequisitos |
| 629 | PCB: esquemático, ERC, DRC y fabricación | 629 | 582 | P1 | P2_prerrequisitos |
| 682 | Sistemas embebidos: RTOS, buses y firmware | 682 | 823 | P1 | P2_prerrequisitos |
| 757 | Programación de bajo nivel: C, memoria y depuración | 757 | 539 | P1 | P2_prerrequisitos |
| 811 | Electromagnetismo: Faraday y líneas de transmisión | 811 | 544 | P1 | P2_prerrequisitos |
| 864 | Gestión profesional: requisitos, riesgos y evidencia | 864 | 554 | OK | — |
| 918 | PLC y control industrial: ciclo de scan e IEC 61131-3 | 918 | 591 | P1 | P2_prerrequisitos |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Ordenamientos: insertion, merge y quick sort | 6 | 971 | OK | — |
| 122 | Algoritmos codiciosos y árbol de expansión mínima | 122 | 937 | P1 | P2_prerrequisitos |
| 232 | Caminos más cortos con Dijkstra | 232 | 868 | P1 | P2_prerrequisitos |
| 342 | Búsqueda en cadenas: de la fuerza bruta a KMP | 342 | 844 | OK | — |
| 453 | Problemas intratables: P, NP y heurísticas | 453 | 881 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Decorator: agregar comportamiento sin heredar | 6 | 703 | P1 | P2_prerrequisitos |
| 113 | State: un objeto que cambia de comportamiento según su estado | 113 | 663 | P1 | P2_prerrequisitos |
| 217 | Template Method: un algoritmo fijo con pasos variables | 217 | 664 | OK | — |
| 332 | Chain of Responsibility: una cadena de validadores | 332 | 710 | OK | — |
| 438 | Mediator: coordinar objetos sin que se conozcan | 438 | 686 | OK | — |
| 541 | Memento: guardar y restaurar estado para deshacer | 541 | 624 | OK | — |
| 649 | Visitor: operaciones nuevas sin tocar las clases | 649 | 680 | P1 | P2_prerrequisitos |
| 744 | Flyweight: compartir estado para ahorrar memoria | 744 | 708 | OK | — |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Nombres que revelan intención y funciones pequeñas | 6 | 872 | P1 | P2_prerrequisitos |
| 111 | Comentarios honestos y excepciones en lugar de códigos de error | 111 | 794 | OK | — |
| 213 | Objetos frente a estructuras de datos y la ley de Demeter | 213 | 754 | P1 | P2_prerrequisitos |
| 315 | Pruebas limpias: F.I.R.S.T. y un concepto por prueba | 315 | 703 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Elegir estructuras según las operaciones | 6 | 1209 | P1 | P2_prerrequisitos, P7_rutaflow |
| 128 | Pilas, colas y abstracciones de comportamiento | 128 | 1284 | P1 | P2_prerrequisitos, P7_rutaflow |
| 272 | Búsqueda, precondiciones y demostración de corrección | 272 | 1272 | P1 | P2_prerrequisitos, P7_rutaflow |
| 420 | Complejidad, medición, ordenamiento y recursión | 420 | 1313 | P1 | P2_prerrequisitos, P7_rutaflow |
| 573 | Árboles y árboles binarios de búsqueda (BST) | 573 | 838 | P1 | P2_prerrequisitos, P7_rutaflow |
| 671 | Tablas hash — búsqueda en tiempo constante | 671 | 692 | P1 | P2_prerrequisitos, P7_rutaflow |
| 746 | Grafos y recorridos BFS/DFS | 746 | 757 | P1 | P2_prerrequisitos |
| 837 | Programación dinámica — resolver una vez, recordar el resultado | 837 | 720 | P1 | P2_prerrequisitos |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | De una URL al servidor: red, DNS, IP y puertos | 6 | 1189 | P1 | P2_prerrequisitos, P7_rutaflow |
| 125 | HTTP como contrato observable | 125 | 1220 | P1 | P2_prerrequisitos, P7_rutaflow |
| 262 | HTML semántico, formularios y el DOM | 262 | 1292 | P1 | P2_prerrequisitos, P7_rutaflow |
| 444 | CSS, layout responsive y accesibilidad verificable | 444 | 1484 | P1 | P2_prerrequisitos, P7_rutaflow |
| 636 | HTML semántico y CSS responsive desde un archivo vacío | 636 | 623 | P1 | P2_prerrequisitos |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Del mundo real al modelo relacional | 6 | 1500 | P1 | P2_prerrequisitos |
| 155 | SQL para definir, escribir, consultar y relacionar | 155 | 1248 | P1 | P7_rutaflow |
| 298 | Índices, restricciones y planes de consulta | 298 | 1297 | P1 | P2_prerrequisitos, P7_rutaflow |
| 422 | Transacciones, concurrencia y elección SQL/NoSQL | 422 | 1407 | P1 | P2_prerrequisitos, P7_rutaflow |
| 575 | SQL avanzado: subconsultas, vistas, triggers y funciones de ventana | 575 | 1135 | P1 | P2_prerrequisitos |
| 726 | Procedimientos almacenados, funciones y cursores con PL/pgSQL | 726 | 1005 | OK | — |
| 863 | De SQL a Excel: reportes con tablas y fórmulas vivas | 863 | 838 | P1 | P2_prerrequisitos |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Depurar con evidencia, no con cambios aleatorios | 6 | 1180 | P1 | P2_prerrequisitos, P7_rutaflow |
| 118 | Pruebas con propósito y niveles adecuados | 118 | 1312 | P1 | P2_prerrequisitos, P7_rutaflow |
| 259 | Git como historial de decisiones y colaboración | 259 | 1221 | P1 | P2_prerrequisitos, P7_rutaflow |
| 384 | Calidad estática, revisión e integración continua | 384 | 1412 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Activos, amenazas, riesgos y límites de confianza | 6 | 3066 | P1 | P2_prerrequisitos |
| 272 | Identidad, contraseñas, sesiones y autorización | 272 | 2676 | P1 | P2_prerrequisitos |
| 578 | Criptografía aplicada, TLS, claves y secretos | 578 | 2943 | P1 | P2_prerrequisitos |
| 942 | Validación, vulnerabilidades web, privacidad y respuesta | 942 | 2792 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1197 | Ingeniería social, phishing y respuesta: analizar el correo, no solo mirarlo | 1197 | 3629 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Requisitos, stakeholders y criterios verificables | 6 | 971 | OK | — |
| 117 | Arquitectura guiada por atributos de calidad | 117 | 895 | P1 | P2_prerrequisitos, P7_rutaflow |
| 239 | Diseño modular, principios, patrones y refactoring | 239 | 847 | P1 | P2_prerrequisitos |
| 340 | Decisiones, documentación, deuda y evolución | 340 | 922 | OK | — |
| 407 | Records de C#: igualdad por valor no implica inmutabilidad profunda | 407 | 596 | P1 | P2_prerrequisitos |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | El sistema operativo como administrador y frontera | 8 | 908 | P1 | P2_prerrequisitos |
| 102 | Memoria y concurrencia sin magia | 102 | 1084 | P1 | P2_prerrequisitos, P7_rutaflow |
| 212 | Linux como entorno observable | 212 | 855 | P1 | P2_prerrequisitos |
| 290 | Contenedores: aislamiento reproducible | 290 | 925 | P1 | P2_prerrequisitos |
| 380 | Problemas clásicos de concurrencia: filósofos y lectores-escritores | 380 | 949 | OK | — |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Lógica para especificar antes de programar | 8 | 1123 | P1 | P2_prerrequisitos |
| 121 | Conjuntos, relaciones, funciones e inducción | 121 | 871 | OK | — |
| 211 | Conteo, grafos y estructuras conectadas | 211 | 894 | P1 | P2_prerrequisitos |
| 319 | Probabilidad y evidencia para decisiones técnicas | 319 | 1104 | P1 | P2_prerrequisitos |

### Track: ios (56 temas en 15 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 24 | Optionals y unwrapping seguro | 24 | 1113 | P1 | P2_prerrequisitos, P7_rutaflow |
| 122 | struct vs class | 122 | 1097 | P1 | P2_prerrequisitos, P7_rutaflow |
| 230 | Protocolos y enums con valores asociados | 230 | 1031 | P1 | P2_prerrequisitos, P7_rutaflow |
| 327 | Closures, colecciones y genéricos con propósito | 327 | 1266 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El protocolo View y composición | 6 | 1317 | P1 | P2_prerrequisitos |
| 180 | Orden de modificadores y layout con stacks | 180 | 1169 | P1 | P2_prerrequisitos, P7_rutaflow |
| 317 | Previews, LazyVGrid/ScrollView y property wrappers | 317 | 977 | P1 | P2_prerrequisitos |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Instruments | 8 | 785 | P1 | P2_prerrequisitos |
| 66 | Accesibilidad con VoiceOver | 66 | 698 | P1 | P2_prerrequisitos |
| 128 | Human Interface Guidelines, Dynamic Type e interop con UIKit | 128 | 848 | P1 | P2_prerrequisitos |
| 191 | UIKit desde cero para mantener aplicaciones reales | 191 | 1256 | P1 | P2_prerrequisitos |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Certificados y provisioning profiles | 8 | 822 | P1 | P2_prerrequisitos |
| 67 | Archivar, subir y TestFlight | 67 | 827 | P1 | P2_prerrequisitos |
| 128 | Metadata y versionado | 128 | 900 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Arquitectura del proyecto integrador | 8 | 935 | P1 | P2_prerrequisitos |
| 91 | Sincronización entre red y persistencia local | 91 | 934 | P1 | P2_prerrequisitos, P7_rutaflow |
| 171 | Cierre del track | 171 | 925 | P1 | P2_prerrequisitos |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | El sandbox reduce superficie, pero no valida intenciones | 10 | 919 | P1 | P2_prerrequisitos |
| 103 | Proteger datos es controlar todas sus copias | 103 | 890 | P1 | P2_prerrequisitos |
| 196 | Offline-first es un protocolo, no una caché | 196 | 940 | OK | — |
| 303 | Operar significa detectar, limitar y aprender del fallo | 303 | 830 | P1 | P2_prerrequisitos |
| 388 | Keychain — guardar secretos de forma segura | 388 | 661 | P1 | P2_prerrequisitos |
| 460 | Permisos y privacidad — pedir acceso con criterio | 460 | 682 | P1 | P2_prerrequisitos |
| 523 | Notificaciones push con APNs | 523 | 694 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Swift Testing y pruebas asíncronas | 8 | 738 | P1 | P2_prerrequisitos |
| 106 | ViewInspector con criterio | 106 | 541 | P1 | P2_prerrequisitos |
| 155 | Combine avanzado | 155 | 548 | P1 | P2_prerrequisitos |
| 208 | Animaciones y matchedGeometryEffect | 208 | 525 | P1 | P2_prerrequisitos |
| 257 | UIViewRepresentable | 257 | 523 | P1 | P2_prerrequisitos |
| 314 | UIViewControllerRepresentable y Coordinator | 314 | 587 | P1 | P2_prerrequisitos |
| 376 | Core ML y Vision — inferencia en el dispositivo | 376 | 1003 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | @State y @Binding | 6 | 1151 | P1 | P2_prerrequisitos |
| 105 | @Observable | 105 | 866 | P1 | P2_prerrequisitos |
| 190 | @Environment y identidad vs valor | 190 | 926 | P1 | P2_prerrequisitos |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | NavigationStack y NavigationPath | 8 | 717 | P1 | P2_prerrequisitos |
| 82 | Sheets, full screen covers y TabView | 82 | 794 | P1 | P2_prerrequisitos |
| 149 | Deep linking y controles de formulario | 149 | 791 | P1 | P2_prerrequisitos |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | async/await y Task | 8 | 889 | P1 | P2_prerrequisitos |
| 81 | Actors para estado mutable seguro | 81 | 806 | P1 | P2_prerrequisitos |
| 152 | TaskGroup y MainActor | 152 | 926 | P1 | P2_prerrequisitos |
| 260 | Cancelación cooperativa: distinguir una tarea cancelada de un fallo de red | 260 | 469 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | URLSession con async/await y Codable | 8 | 788 | P1 | P2_prerrequisitos |
| 86 | Errores tipados | 86 | 813 | P1 | P2_prerrequisitos |
| 159 | Reintentos y cancelación | 159 | 913 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | @Model y ModelContainer | 8 | 743 | P1 | P2_prerrequisitos |
| 90 | @Query y operaciones de escritura | 90 | 762 | P1 | P2_prerrequisitos |
| 163 | Migraciones y SwiftData vs Core Data | 163 | 845 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Publishers y Subscribers | 8 | 715 | P1 | P2_prerrequisitos |
| 82 | Operadores: debounce y combineLatest | 82 | 763 | P1 | P2_prerrequisitos |
| 144 | Combine vs async/await | 144 | 782 | P1 | P2_prerrequisitos |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | De una vista "gorda" a MVVM | 8 | 846 | P1 | P2_prerrequisitos |
| 89 | Capas del proyecto e inyección por inicializador | 89 | 737 | P1 | P2_prerrequisitos, P7_rutaflow |
| 156 | Cuándo MVVM no alcanza | 156 | 806 | P1 | P2_prerrequisitos |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | XCTest clásico y Swift Testing | 8 | 841 | P1 | P2_prerrequisitos |
| 101 | Testing de código async | 101 | 763 | P1 | P2_prerrequisitos |
| 167 | UI Tests con XCUITest | 167 | 948 | P1 | P2_prerrequisitos |

### Track: java (85 temas en 21 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 30 | Del código fuente a la JVM | 30 | 947 | P1 | P2_prerrequisitos, P7_rutaflow |
| 103 | public static void main — qué significa cada palabra | 103 | 882 | P1 | P2_prerrequisitos, P7_rutaflow |
| 158 | JDK, JRE y JVM | 158 | 894 | P1 | P2_prerrequisitos, P7_rutaflow |
| 216 | Tipos primitivos vs referencias | 216 | 964 | P1 | P2_prerrequisitos, P7_rutaflow |
| 289 | Variables, conversiones y `String` | 289 | 641 | P1 | P2_prerrequisitos, P7_rutaflow |
| 344 | Operadores, precedencia y control de flujo | 344 | 916 | P1 | P2_prerrequisitos, P7_rutaflow |
| 428 | Arreglos, wrappers y paso de argumentos | 428 | 953 | P1 | P2_prerrequisitos, P7_rutaflow |
| 509 | Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`) | 509 | 603 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Clases, objetos, constructores y encapsulación | 8 | 457 | P1 | P2_prerrequisitos, P7_rutaflow |
| 45 | Herencia y sobreescritura | 45 | 1210 | P1 | P2_prerrequisitos, P7_rutaflow |
| 143 | Interfaces, clases abstractas y cuándo usar cada una | 143 | 816 | P1 | P2_prerrequisitos, P7_rutaflow |
| 211 | Sobrecarga vs sobreescritura, y modificadores de acceso | 211 | 802 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | module-info.java y encapsulación fuerte | 8 | 854 | P1 | P2_prerrequisitos, P7_rutaflow |
| 76 | Migración incremental y cuándo JPMS aporta valor | 76 | 932 | P1 | P2_prerrequisitos, P7_rutaflow |
| 140 | `opens` para acceso reflexivo controlado de frameworks | 140 | 918 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Generaciones de memoria y recolectores | 8 | 1021 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 74 | Java Flight Recorder y JIT compilation | 74 | 931 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 138 | Referencias especiales y heap dumps | 138 | 958 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 202 | Foreign Function & Memory API (Java 22) | 202 | 825 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Builder — configuración paso a paso y validación | 8 | 849 | P1 | P5_fallo |
| 72 | Factory Method y Strategy | 72 | 973 | P1 | P2_prerrequisitos |
| 160 | Abstract Factory y familias de productos compatibles | 160 | 803 | P1 | P2_prerrequisitos |
| 230 | SOLID y cuándo NO aplicar un patrón | 230 | 1083 | P1 | P2_prerrequisitos |
| 307 | Prototype — copiar configuración sin compartir estado mutable | 307 | 683 | P1 | P2_prerrequisitos |
| 380 | Patrones estructurales — elegir por intención | 380 | 722 | P1 | P2_prerrequisitos |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura por capas del proyecto integrador | 6 | 910 | P1 | P2_prerrequisitos, P7_rutaflow |
| 64 | Integrando concurrencia, modelado y testing | 64 | 933 | P1 | P2_prerrequisitos, P7_rutaflow |
| 125 | Build reproducible y cierre del track | 125 | 551 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Compartir memoria requiere orden y visibilidad | 10 | 892 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 109 | La JVM optimiza y puede invalidar un cronómetro ingenuo | 109 | 852 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 190 | Deserializar es permitir construcción y comportamiento | 190 | 804 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 274 | El runtime es parte del artefacto y necesita ciclo de vida | 274 | 986 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Maven avanzado | 9 | 823 | P1 | P7_rutaflow |
| 61 | Gradle y builds reproducibles | 61 | 717 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 128 | Proyectos multi-módulo sin ciclos | 128 | 597 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 190 | JUnit 5, Mockito y assertions expresivas | 190 | 660 | P1 | P2_prerrequisitos, P7_rutaflow |
| 255 | Pruebas de integración reproducibles | 255 | 664 | P1 | P2_prerrequisitos, P7_rutaflow |
| 317 | SLF4J, Logback, MDC y logging estructurado | 317 | 738 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 16 | Entidades y relaciones JPA | 16 | 803 | OK | — |
| 125 | FetchType.LAZY, EAGER y el problema N+1 | 125 | 772 | OK | — |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 16 | JDBC, PreparedStatement y DAO | 16 | 677 | OK | — |
| 93 | Transacciones, ACID y aislamiento | 93 | 644 | OK | — |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 16 | HttpClient, REST, timeouts y fallos | 16 | 681 | OK | — |
| 95 | Tokens, validación y límites de seguridad | 95 | 751 | OK | — |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Reflexión y anotaciones en tiempo de ejecución | 6 | 783 | P1 | P2_prerrequisitos |
| 128 | Expresiones regulares con Pattern y Matcher | 128 | 734 | OK | — |
| 228 | Dinero exacto con BigDecimal | 228 | 736 | OK | — |
| 326 | Assertions y diseño por contrato | 326 | 832 | OK | — |
| 452 | ServiceLoader: plugins sin acoplar implementaciones | 452 | 788 | P1 | P2_prerrequisitos |
| 588 | Proxies dinámicos: así funcionan @Transactional y los mocks | 588 | 861 | OK | — |
| 714 | Internacionalización: números, monedas, fechas y orden de texto | 714 | 749 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | List, Set, Map y sus implementaciones | 6 | 954 | P1 | P2_prerrequisitos, P7_rutaflow |
| 69 | Genéricos, wildcards y type erasure | 69 | 871 | P1 | P2_prerrequisitos, P7_rutaflow |
| 126 | Comparable vs Comparator, e iteración | 126 | 802 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Las cuatro formas: Predicate, Function, Consumer y Supplier | 7 | 830 | OK | — |
| 134 | Componer sin anidar: andThen, compose, negate y reglas encadenadas | 134 | 630 | P1 | P7_rutaflow |
| 234 | Streams como composición: pereza, orden y efectos que se esconden | 234 | 675 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Checked vs unchecked exceptions | 6 | 859 | P1 | P2_prerrequisitos, P7_rutaflow |
| 64 | try-with-resources | 64 | 795 | P1 | P2_prerrequisitos, P7_rutaflow |
| 120 | Excepciones personalizadas y no tragar excepciones | 120 | 872 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Stream API — map, filter, reduce, collect | 8 | 820 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 68 | Optional — evitar null explícitamente | 68 | 822 | P1 | P2_prerrequisitos, P7_rutaflow |
| 124 | Streams paralelos y referencias a métodos | 124 | 801 | P1 | P2_prerrequisitos, P7_rutaflow |
| 183 | Stream Gatherers (Java 24) | 183 | 716 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | ExecutorService y gestión de hilos | 8 | 527 | P1 | P2_prerrequisitos, P7_rutaflow |
| 70 | CompletableFuture | 70 | 720 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 130 | Virtual threads | 130 | 944 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 186 | Condiciones de carrera y sincronización | 186 | 873 | P1 | P2_prerrequisitos, P7_rutaflow |
| 240 | Structured Concurrency (StructuredTaskScope, Java 25) | 240 | 932 | P1 | P2_prerrequisitos, P7_rutaflow |
| 332 | Scoped Values frente a ThreadLocal (Java 25) | 332 | 608 | P1 | P2_prerrequisitos, P7_rutaflow |
| 414 | Timeouts y cancelación cooperativa sin abandonar recursos | 414 | 463 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | NIO.2 — Path y Files | 6 | 958 | P1 | P2_prerrequisitos, P7_rutaflow |
| 107 | Serialización con Jackson | 107 | 788 | P1 | P2_prerrequisitos, P7_rutaflow |
| 165 | Archivos grandes y recursos del classpath | 165 | 835 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | record — modelos inmutables sin boilerplate | 8 | 779 | P1 | P2_prerrequisitos, P7_rutaflow |
| 66 | sealed — jerarquías cerradas y exhaustividad | 66 | 826 | P1 | P2_prerrequisitos, P7_rutaflow |
| 122 | Pattern matching exhaustivo y para instanceof | 122 | 819 | P1 | P2_prerrequisitos, P7_rutaflow |
| 185 | Unnamed variables y patterns (_, Java 22) | 185 | 1027 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | pom.xml vs build.gradle.kts | 6 | 727 | P1 | P5_fallo, P7_rutaflow |
| 76 | Ciclo de vida de build y scopes | 76 | 861 | P1 | P2_prerrequisitos, P7_rutaflow |
| 130 | Proyectos multi-módulo | 130 | 801 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 185 | Maven y Gradle lado a lado — el mismo proyecto en dos herramientas | 185 | 889 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | JUnit 5 — anotaciones y ciclo de vida | 6 | 778 | P1 | P2_prerrequisitos, P7_rutaflow |
| 65 | Mockito — aislar dependencias | 65 | 825 | P1 | P2_prerrequisitos, P7_rutaflow |
| 130 | Tests parametrizados y cobertura | 130 | 994 | P1 | P2_prerrequisitos, P7_rutaflow |

### Track: javascript (88 temas en 15 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 36 | Variables — `const`, `let` y `var` | 36 | 596 | P1 | P7_rutaflow |
| 119 | Tipos primitivos y `typeof` | 119 | 463 | P1 | P7_rutaflow |
| 189 | Conversión, coerción e igualdad | 189 | 483 | P1 | P7_rutaflow |
| 259 | Template literals y mensajes seguros | 259 | 493 | P1 | P7_rutaflow |
| 323 | JavaScript en navegador y Node.js | 323 | 534 | P1 | P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Tres formas de escribir una función | 6 | 883 | P1 | P7_rutaflow |
| 91 | Parámetros por defecto y rest/spread | 91 | 900 | P1 | P7_rutaflow |
| 178 | Funciones de orden superior | 178 | 805 | P1 | P7_rutaflow |
| 264 | Control de flujo — if, switch y loops | 264 | 907 | P1 | P7_rutaflow |
| 356 | IIFE y el objeto arguments | 356 | 849 | P1 | P7_rutaflow |
| 444 | Desestructuración, valores por defecto y rest | 444 | 836 | OK | — |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Debounce y throttle | 6 | 1059 | P1 | P7_rutaflow |
| 114 | Memoización | 114 | 972 | P1 | P2_prerrequisitos, P7_rutaflow |
| 202 | Web Workers para trabajo pesado | 202 | 1024 | P1 | P7_rutaflow |
| 296 | Profiling con DevTools | 296 | 1043 | P1 | P2_prerrequisitos, P7_rutaflow |
| 399 | Core Web Vitals | 399 | 1091 | P1 | P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Tipos básicos, interfaces y type aliases | 6 | 1037 | P1 | P7_rutaflow |
| 108 | Generics | 108 | 1003 | P1 | P2_prerrequisitos, P7_rutaflow |
| 198 | Narrowing y union types | 198 | 1029 | P1 | P7_rutaflow |
| 290 | tsconfig esencial y modo strict | 290 | 1184 | P1 | P2_prerrequisitos, P7_rutaflow |
| 423 | TypeScript avanzado: sobrecargas, tipos mapeados, condicionales y satisfies | 423 | 999 | P1 | P2_prerrequisitos |
| 549 | Decoradores estándar de TypeScript 5 | 549 | 818 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Routing manual con History API | 6 | 1111 | P1 | P7_rutaflow |
| 104 | Estado de aplicación con un store propio | 104 | 1007 | P1 | P2_prerrequisitos, P7_rutaflow |
| 205 | Consumo de una API real con manejo de errores | 205 | 989 | P1 | P7_rutaflow |
| 295 | Conectando todo — el patrón completo de una SPA | 295 | 1102 | P1 | P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Datos no confiables y seguridad en el navegador | 8 | 945 | P1 | P7_rutaflow |
| 127 | Memoria administrada no significa memoria infinita | 127 | 800 | P1 | P2_prerrequisitos, P7_rutaflow |
| 224 | Errores útiles sin convertir usuarios en sensores involuntarios | 224 | 794 | P1 | P7_rutaflow |
| 329 | Compatibilidad, idioma y tiempo son requisitos de datos | 329 | 801 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | TypeScript avanzado | 8 | 729 | P1 | P7_rutaflow |
| 104 | Workers y ejecución fuera del hilo principal | 104 | 666 | P1 | P2_prerrequisitos, P7_rutaflow |
| 196 | Bundlers y optimización | 196 | 688 | P1 | P7_rutaflow |
| 287 | Accesibilidad web | 287 | 657 | P1 | P2_prerrequisitos, P7_rutaflow |
| 380 | WebAssembly con Rust o C | 380 | 715 | P1 | P7_rutaflow |
| 474 | Web3 y machine learning en navegador | 474 | 689 | P1 | P7_rutaflow |
| 560 | Geolocalización, permisos y precisión GPS | 560 | 495 | P1 | P7_rutaflow |
| 644 | sessionStorage, cookies e IndexedDB | 644 | 496 | P1 | P7_rutaflow |
| 721 | Expresiones regulares avanzadas y Unicode | 721 | 514 | P1 | P2_prerrequisitos, P7_rutaflow |
| 798 | Patrones Factory, Strategy, Observer y Pub/Sub | 798 | 479 | P1 | P7_rutaflow |
| 878 | Service Workers, PWA y estrategias de caché | 878 | 604 | P1 | P7_rutaflow |
| 969 | WebSocket y comunicación en tiempo real | 969 | 452 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1051 | Typed Arrays, ArrayBuffer y DataView | 1051 | 420 | P1 | P7_rutaflow |
| 1124 | ECMAScript moderno, Temporal e iterator helpers | 1124 | 592 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Scope léxico y closures | 6 | 795 | P1 | P7_rutaflow |
| 90 | Hoisting y Temporal Dead Zone | 90 | 825 | P1 | P7_rutaflow |
| 172 | Call stack y contexto de ejecución | 172 | 791 | P1 | P7_rutaflow |
| 259 | this según el modo de invocación | 259 | 797 | P1 | P7_rutaflow |
| 343 | Module pattern y factory functions | 343 | 850 | P1 | P7_rutaflow |
| 435 | Execution Context, Scope Chain y Lexical Environment | 435 | 818 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Prototype chain y Object.create | 6 | 801 | P1 | P7_rutaflow |
| 90 | class, extends y super | 90 | 799 | P1 | P7_rutaflow |
| 186 | Getters, setters y propiedades computadas | 186 | 883 | P1 | P7_rutaflow |
| 279 | Encapsulación con campos privados (#campo) | 279 | 895 | P1 | P7_rutaflow |
| 381 | Symbol y objetos iterables propios | 381 | 761 | P1 | P2_prerrequisitos |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | map, filter, reduce, find, some/every | 6 | 839 | P1 | P7_rutaflow |
| 81 | Set y Map frente a Array y Object | 81 | 853 | P1 | P7_rutaflow |
| 166 | Inmutabilidad y actualización de estructuras anidadas | 166 | 751 | P1 | P7_rutaflow |
| 239 | WeakMap y WeakSet | 239 | 763 | P1 | P7_rutaflow |
| 312 | Métodos inmutables modernos | 312 | 705 | P1 | P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El Event Loop | 6 | 834 | P1 | P7_rutaflow |
| 85 | Promesas | 85 | 947 | P1 | P7_rutaflow |
| 183 | Promise.all, allSettled, race y any | 183 | 825 | P1 | P7_rutaflow |
| 267 | El motor V8 — JIT y AST | 267 | 888 | P1 | P7_rutaflow |
| 352 | Stack, Heap y Garbage Collection | 352 | 936 | P1 | P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | async/await sobre promesas | 6 | 818 | P1 | P7_rutaflow |
| 100 | try/catch en flujos asíncronos | 100 | 956 | P1 | P7_rutaflow |
| 191 | fetch API y AbortController | 191 | 826 | P1 | P7_rutaflow |
| 268 | Reintentos y timeouts manuales | 268 | 837 | P1 | P7_rutaflow |
| 351 | Generadores — function*, yield y yield* | 351 | 1057 | P1 | P7_rutaflow |
| 443 | Proxies y Reflect | 443 | 1055 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | ESM frente a CommonJS | 6 | 1095 | P1 | P7_rutaflow |
| 126 | Tree-shaking y code-splitting | 126 | 1143 | P1 | P2_prerrequisitos, P7_rutaflow |
| 248 | Vite y esbuild | 248 | 1082 | P1 | P7_rutaflow |
| 367 | package.json — exports, type y scripts | 367 | 1013 | P1 | P7_rutaflow |
| 473 | import() dinámico e import.meta | 473 | 996 | P1 | P7_rutaflow |
| 574 | Webpack, Rollup y Babel/SWC | 574 | 1085 | P1 | P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Selección y manipulación del DOM | 6 | 1130 | P1 | P7_rutaflow |
| 117 | Delegación de eventos | 117 | 1076 | P1 | P2_prerrequisitos, P7_rutaflow |
| 227 | Formularios y validación nativa | 227 | 1001 | P1 | P7_rutaflow |
| 329 | Web APIs — localStorage e IntersectionObserver | 329 | 1037 | P1 | P7_rutaflow |
| 433 | ResizeObserver y MutationObserver | 433 | 1027 | P1 | P2_prerrequisitos, P7_rutaflow |
| 526 | requestAnimationFrame y requestIdleCallback | 526 | 1106 | P1 | P7_rutaflow |
| 671 | Formularios accesibles: validar, anunciar y conservar la entrada | 671 | 520 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Unit testing con Vitest | 6 | 989 | P1 | P7_rutaflow |
| 111 | Mocks, spies y fakes | 111 | 1034 | P1 | P2_prerrequisitos, P7_rutaflow |
| 207 | Mockear fetch | 207 | 973 | P1 | P7_rutaflow |
| 314 | ESLint, Prettier y cobertura de código | 314 | 1022 | P1 | P2_prerrequisitos, P7_rutaflow |

### Track: kotlin-multiplatform (56 temas en 14 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 28 | Null safety real | 28 | 1118 | P1 | P7_rutaflow |
| 158 | data class y funciones de extensión | 158 | 945 | P1 | P7_rutaflow |
| 284 | when como expresión | 284 | 1113 | P1 | P7_rutaflow |
| 432 | Destructuring declarations y rangos | 432 | 1104 | P1 | P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Funciones de orden superior | 8 | 941 | P1 | P7_rutaflow |
| 127 | Scope functions | 127 | 1033 | P1 | P7_rutaflow |
| 256 | Sealed classes y colecciones funcionales | 256 | 1019 | P1 | P7_rutaflow |
| 399 | Lambdas con receptor y builders tipo DSL | 399 | 1111 | P1 | P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Pipeline Gradle multiplataforma en CI | 6 | 1056 | OK | — |
| 107 | Fastlane | 107 | 986 | P1 | P2_prerrequisitos |
| 186 | Versionado compartido | 186 | 803 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura del proyecto integrador | 6 | 931 | P1 | P2_prerrequisitos, P7_rutaflow |
| 82 | Sincronización de datos remotos con caché local | 82 | 1123 | P1 | P2_prerrequisitos |
| 170 | Cierre del track — la promesa realista de KMP | 170 | 1068 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | La mejor frontera compartida es deliberadamente pequeña | 8 | 1063 | OK | — |
| 107 | Garbage collection no cierra sockets ni rompe ciclos externos | 107 | 1037 | P1 | P2_prerrequisitos |
| 193 | Un artefacto compatible necesita más que el mismo número de versión | 193 | 1116 | P1 | P2_prerrequisitos |
| 304 | Un fallo compartido necesita símbolos y contexto de ambas plataformas | 304 | 997 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Kotlin/Native | 6 | 596 | P1 | P2_prerrequisitos, P7_rutaflow |
| 49 | Interop con C | 49 | 584 | P1 | P2_prerrequisitos, P7_rutaflow |
| 91 | Swift Export | 91 | 784 | P1 | P2_prerrequisitos |
| 142 | XCFramework y API pública | 142 | 677 | P1 | P2_prerrequisitos, P7_rutaflow |
| 196 | Publicación en Maven Central | 196 | 569 | P1 | P2_prerrequisitos |
| 243 | Compatibilidad binaria y CI multi-target | 243 | 654 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | suspend functions y concurrencia estructurada | 8 | 1084 | P1 | P7_rutaflow |
| 152 | Flow, StateFlow y SharedFlow | 152 | 1120 | P1 | P7_rutaflow |
| 282 | Manejo de errores y exclusión mutua | 282 | 1261 | P1 | P7_rutaflow |
| 451 | Dispatchers y withContext: en qué hilo corre tu código | 451 | 1264 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Source sets | 8 | 934 | P1 | P7_rutaflow |
| 104 | expect/actual | 104 | 857 | P1 | P7_rutaflow |
| 203 | Gradle multiplataforma y targets disponibles | 203 | 934 | P1 | P7_rutaflow |
| 327 | Jerarquía de source sets intermedios | 327 | 1140 | P1 | P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Modelos de dominio y casos de uso | 8 | 1070 | P1 | P7_rutaflow |
| 144 | Repositorios con interfaz común | 144 | 1034 | P1 | P7_rutaflow |
| 277 | Inyección de dependencias multiplataforma con Koin | 277 | 1017 | P1 | P7_rutaflow |
| 414 | Modelado de errores de dominio con un tipo Result explícito | 414 | 1228 | P1 | P7_rutaflow |
| 591 | Tiempo determinista: probar vencimientos sin dormir ni consultar el reloj global | 591 | 499 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Ktor Client multiplataforma | 8 | 1001 | P1 | P7_rutaflow |
| 145 | Manejo de errores de red con un tipo explícito | 145 | 1030 | P1 | P7_rutaflow |
| 287 | Interceptores y autenticación | 287 | 965 | P1 | P7_rutaflow |
| 425 | Reintentos con backoff exponencial | 425 | 1166 | P1 | P7_rutaflow |
| 577 | kotlinx.serialization — JSON compartido entre plataformas | 577 | 664 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Esquemas SQLDelight y queries tipadas | 8 | 1208 | P1 | P7_rutaflow |
| 148 | Drivers por plataforma | 148 | 1059 | P1 | P7_rutaflow |
| 291 | Migraciones de esquema | 291 | 1154 | P1 | P7_rutaflow |
| 416 | Transacciones: atomicidad en operaciones multi-tabla | 416 | 1288 | P1 | P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Compose Multiplatform vs Jetpack Compose | 8 | 1058 | P1 | P7_rutaflow |
| 138 | Estado y recomposición — mutableStateOf y por qué la UI se redibuja | 138 | 1272 | P1 | P7_rutaflow |
| 316 | Theming y navegación compartidos | 316 | 1060 | P1 | P7_rutaflow |
| 462 | Limitaciones en iOS y otros targets | 462 | 1246 | P1 | P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El framework generado para iOS | 6 | 950 | OK | — |
| 141 | Mapeo de tipos Kotlin ↔ Swift | 141 | 1062 | P1 | P2_prerrequisitos, P7_rutaflow |
| 215 | Coroutines desde Swift, y distribución del framework | 215 | 1231 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | kotlin.test en commonTest | 6 | 899 | P1 | P2_prerrequisitos, P7_rutaflow |
| 82 | Fakes en vez de mocks | 82 | 975 | P1 | P2_prerrequisitos |
| 156 | runTest para coroutines | 156 | 929 | P1 | P2_prerrequisitos |

### Track: node (77 temas en 15 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 25 | Node no es "JavaScript en el servidor" sin más | 25 | 1319 | P1 | P7_rutaflow |
| 128 | Fases del Event Loop de Node | 128 | 1260 | P1 | P7_rutaflow |
| 230 | process, global y módulos core | 230 | 1346 | P1 | P2_prerrequisitos, P7_rutaflow |
| 373 | Event-driven architecture y non-blocking I/O | 373 | 1233 | P1 | P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | package.json y semver | 6 | 1065 | P1 | P2_prerrequisitos, P7_rutaflow |
| 102 | Lockfiles e instalación reproducible | 102 | 1073 | P1 | P7_rutaflow |
| 184 | Workspaces — monorepos con npm/pnpm | 184 | 1132 | P1 | P2_prerrequisitos, P7_rutaflow |
| 322 | Scripts de ciclo de vida | 322 | 1019 | P1 | P2_prerrequisitos, P7_rutaflow |
| 432 | Publicar y versionar un paquete npm (público o privado) | 432 | 843 | P1 | P2_prerrequisitos |
| 550 | ESM y CommonJS en el mismo proyecto | 550 | 809 | OK | — |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Cabeceras seguras con helmet | 6 | 826 | OK | — |
| 106 | Rate limiting | 106 | 810 | P1 | P2_prerrequisitos, P7_rutaflow |
| 183 | Inyección SQL y sanitización contra XSS | 183 | 940 | P1 | P2_prerrequisitos, P7_rutaflow |
| 264 | OWASP API Security Top 10 y auditoría de dependencias | 264 | 908 | P1 | P2_prerrequisitos, P7_rutaflow |
| 336 | CVE, CWE y npm audit en el pipeline | 336 | 863 | P1 | P2_prerrequisitos |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Dockerfile multi-stage para Node | 6 | 842 | P1 | P2_prerrequisitos, P7_rutaflow |
| 102 | Variables de entorno por ambiente y healthchecks | 102 | 820 | P1 | P2_prerrequisitos, P7_rutaflow |
| 183 | PM2, contenedores y zero-downtime deploys | 183 | 804 | P1 | P2_prerrequisitos, P7_rutaflow |
| 261 | Nginx como reverse proxy y serverless | 261 | 889 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura por capas | 6 | 901 | P1 | P2_prerrequisitos, P7_rutaflow |
| 87 | Uniendo cada módulo del track | 87 | 803 | P1 | P2_prerrequisitos, P7_rutaflow |
| 162 | Qué le falta a esta API para producción real | 162 | 851 | P1 | P2_prerrequisitos, P7_rutaflow |
| 242 | Próximos pasos — microservicios, colas de mensajes y TypeScript | 242 | 817 | P1 | P2_prerrequisitos, P7_rutaflow |
| 322 | Posiciones espaciales y Socket.IO con orden recuperable | 322 | 934 | P1 | P2_prerrequisitos, P7_rutaflow |
| 458 | Archivos y notificaciones push sin convertirlos en autorización | 458 | 807 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Tipos estáticos dentro, datos desconocidos en la frontera | 8 | 1035 | P1 | P2_prerrequisitos |
| 123 | Un contrato HTTP es comportamiento, no solo documentación | 123 | 963 | P1 | P2_prerrequisitos |
| 234 | Reintentar sin duplicar el efecto | 234 | 1065 | P1 | P2_prerrequisitos |
| 344 | Webhooks verificables y recuperación por reconciliación | 344 | 920 | P1 | P2_prerrequisitos |
| 493 | OpenAPI como contrato ejecutable | 493 | 804 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | TypeScript en Node.js | 7 | 770 | P1 | P2_prerrequisitos, P7_rutaflow |
| 77 | GraphQL avanzado y Federation | 77 | 770 | P1 | P7_rutaflow |
| 141 | Microservicios, Kafka, RabbitMQ y sagas | 141 | 688 | P1 | P2_prerrequisitos, P7_rutaflow |
| 221 | Serverless multi-cloud | 221 | 727 | P1 | P2_prerrequisitos, P7_rutaflow |
| 304 | Docker productivo con Node | 304 | 728 | P1 | P2_prerrequisitos, P7_rutaflow |
| 388 | CI/CD y promoción de artefactos | 388 | 761 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | fs/promises frente a callbacks | 6 | 1186 | P1 | P2_prerrequisitos, P7_rutaflow |
| 133 | Streams básicos: Readable, Writable y Transform | 133 | 1387 | P1 | P7_rutaflow |
| 260 | Backpressure: write() y el evento drain | 260 | 1124 | P1 | P7_rutaflow |
| 394 | pipeline() para componer streams de forma segura | 394 | 1175 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El modelo request/response | 6 | 1242 | P1 | P2_prerrequisitos, P7_rutaflow |
| 122 | Routing manual | 122 | 1188 | P1 | P2_prerrequisitos, P7_rutaflow |
| 252 | Parsing de body y headers | 252 | 1099 | P1 | P2_prerrequisitos, P7_rutaflow |
| 387 | Códigos de estado y content negotiation | 387 | 1241 | P1 | P2_prerrequisitos, P7_rutaflow |
| 538 | Paginación por cursor y límites de entrada comprobables | 538 | 569 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Middleware — orden de ejecución y next() | 6 | 1074 | P1 | P2_prerrequisitos, P7_rutaflow |
| 122 | Routers anidados | 122 | 1101 | P1 | P2_prerrequisitos, P7_rutaflow |
| 255 | Validación de entrada con Zod y manejo centralizado de errores | 255 | 1178 | P1 | P2_prerrequisitos, P7_rutaflow |
| 388 | Express frente a Fastify | 388 | 1144 | P1 | P2_prerrequisitos, P7_rutaflow |
| 529 | WebSocket — comunicación en tiempo real bidireccional | 529 | 697 | OK | — |
| 598 | Subida de archivos — multipart y validación segura | 598 | 707 | P1 | P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | PostgreSQL desde Node con el driver puro | 6 | 1264 | P1 | P2_prerrequisitos, P7_rutaflow |
| 169 | Prisma — schema, migraciones y queries tipadas | 169 | 1397 | P1 | P2_prerrequisitos, P7_rutaflow |
| 324 | Pool de conexiones y transacciones | 324 | 1359 | P1 | P2_prerrequisitos, P7_rutaflow |
| 508 | MongoDB con Mongoose y otras alternativas de ORM | 508 | 958 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Hashing de contraseñas | 6 | 1002 | P1 | P2_prerrequisitos, P7_rutaflow |
| 95 | JWT — access y refresh tokens | 95 | 476 | P1 | P2_prerrequisitos, P7_rutaflow |
| 155 | Middleware de autenticación y control de roles | 155 | 925 | P1 | P2_prerrequisitos, P7_rutaflow |
| 253 | OAuth 2.0 y Passport.js | 253 | 815 | P1 | P2_prerrequisitos, P7_rutaflow |
| 334 | Sesiones, cookies seguras y protección CSRF | 334 | 1089 | P1 | P2_prerrequisitos, P7_rutaflow |
| 494 | Flujo de login completo — de `/api/auth/login` a una ruta protegida | 494 | 1082 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Vitest y Supertest — pruebas de integración HTTP reales | 6 | 826 | P1 | P2_prerrequisitos, P7_rutaflow |
| 101 | Testcontainers — bases de datos de prueba reales y efímeras | 101 | 901 | P1 | P2_prerrequisitos, P7_rutaflow |
| 190 | Mocks de servicios externos y CI | 190 | 912 | P1 | P2_prerrequisitos, P7_rutaflow |
| 276 | Alternativas de testing y debugging | 276 | 851 | P1 | P2_prerrequisitos, P7_rutaflow |
| 354 | node:test — test runner nativo sin dependencias | 354 | 819 | P1 | P2_prerrequisitos |
| 452 | TDD práctico: rojo, verde y refactor con node:test | 452 | 861 | P1 | P2_prerrequisitos |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Worker Threads para trabajo CPU-bound | 6 | 853 | P1 | P2_prerrequisitos, P7_rutaflow |
| 85 | Cluster module y balanceo entre procesos | 85 | 863 | P1 | P2_prerrequisitos, P7_rutaflow |
| 170 | Colas de trabajo con BullMQ | 170 | 454 | P1 | P2_prerrequisitos, P7_rutaflow |
| 232 | PM2, memory leaks y heap snapshots | 232 | 845 | P1 | P2_prerrequisitos, P7_rutaflow |
| 310 | Redis para caché, idempotencia y Pub/Sub | 310 | 936 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Logging estructurado | 6 | 749 | P1 | P2_prerrequisitos, P7_rutaflow |
| 84 | Correlation ID por request | 84 | 823 | P1 | P2_prerrequisitos, P7_rutaflow |
| 169 | Excepciones no capturadas y graceful shutdown | 169 | 889 | P1 | P2_prerrequisitos, P7_rutaflow |
| 250 | REST, GraphQL y gRPC | 250 | 812 | P1 | P2_prerrequisitos, P7_rutaflow |
| 328 | Métricas Prometheus y trazas distribuidas con OpenTelemetry | 328 | 949 | P1 | P2_prerrequisitos, P7_rutaflow |

### Track: react (58 temas en 15 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 29 | JSX es azúcar sintáctica sobre createElement | 29 | 978 | P1 | P2_prerrequisitos |
| 110 | Listas con key estable | 110 | 1285 | P1 | P2_prerrequisitos |
| 214 | Composición sobre herencia, y Fragments | 214 | 1199 | P1 | P2_prerrequisitos |
| 324 | Renderizado condicional y estilos | 324 | 866 | P1 | P2_prerrequisitos |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | useState y actualizaciones funcionales | 8 | 1406 | P1 | P2_prerrequisitos |
| 125 | Render frente a commit | 125 | 1019 | P1 | P2_prerrequisitos |
| 214 | Batching de actualizaciones | 214 | 900 | P1 | P2_prerrequisitos |
| 298 | Componentes controlados | 298 | 635 | P1 | P2_prerrequisitos |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Server Components por defecto | 8 | 846 | P1 | P2_prerrequisitos, P7_rutaflow |
| 97 | use client para interactividad | 97 | 834 | P1 | P2_prerrequisitos |
| 157 | Streaming con Suspense en el servidor | 157 | 816 | P1 | P2_prerrequisitos |
| 214 | Server Actions | 214 | 628 | P1 | P2_prerrequisitos |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Tipado de props y children | 8 | 836 | P1 | P2_prerrequisitos |
| 106 | Hooks genéricos | 106 | 878 | P1 | P2_prerrequisitos |
| 177 | Eventos tipados y componentes polimórficos | 177 | 1083 | P1 | P2_prerrequisitos |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Estructura del proyecto integrador | 8 | 835 | P1 | P2_prerrequisitos |
| 113 | Integrando rutas, TanStack Query y Zustand | 113 | 868 | P1 | P2_prerrequisitos |
| 179 | useTareas — hook dedicado con TanStack Query | 179 | 582 | P1 | P2_prerrequisitos |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Diseñar estados de carga, error y recuperación | 10 | 1047 | P1 | P2_prerrequisitos |
| 133 | La composición visual debe conservar semántica y foco | 133 | 903 | P1 | P2_prerrequisitos |
| 223 | Cliente y servidor forman una sola frontera de seguridad | 223 | 926 | P1 | P2_prerrequisitos |
| 308 | Hidratación determinista, idioma y releases medibles | 308 | 944 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Server Components y streaming | 6 | 778 | P1 | P2_prerrequisitos, P7_rutaflow |
| 91 | Server Actions y seguridad | 91 | 850 | P1 | P2_prerrequisitos, P7_rutaflow |
| 162 | Next.js ISR, Metadata y Middleware | 162 | 817 | P1 | P2_prerrequisitos, P7_rutaflow |
| 268 | Optimización de imágenes y fuentes | 268 | 667 | P1 | P2_prerrequisitos, P7_rutaflow |
| 331 | Accesibilidad y React Aria | 331 | 715 | P1 | P2_prerrequisitos, P7_rutaflow |
| 399 | i18n, pluralización y RTL | 399 | 818 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | useEffect — dependencias y limpieza | 8 | 975 | P1 | P2_prerrequisitos |
| 91 | useRef — valores mutables sin re-render | 91 | 850 | P1 | P2_prerrequisitos |
| 168 | useMemo y useCallback con criterio | 168 | 1036 | P1 | P2_prerrequisitos |
| 257 | Reglas de los hooks, useReducer y useImperativeHandle | 257 | 1095 | P1 | P2_prerrequisitos |
| 340 | Error Boundaries — contener errores de render sin romper toda la app | 340 | 810 | P1 | P2_prerrequisitos |
| 460 | Efectos cancelables: impedir que una respuesta antigua sobrescriba la selección actual | 460 | 515 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | React Hook Form y el problema del re-render por tecla | 8 | 980 | P1 | P2_prerrequisitos |
| 92 | Validación con zod y formularios multi-paso | 92 | 976 | P1 | P2_prerrequisitos |
| 163 | Eventos sintéticos | 163 | 552 | P1 | P2_prerrequisitos |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | createContext y useContext | 8 | 941 | P1 | P2_prerrequisitos |
| 114 | Cuándo Context es suficiente y cuándo no | 114 | 981 | P1 | P2_prerrequisitos |
| 179 | Componentes compuestos, render props y hooks personalizados | 179 | 612 | P1 | P2_prerrequisitos |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Rutas anidadas y layouts compartidos | 8 | 872 | P1 | P2_prerrequisitos |
| 102 | Loaders — datos antes de renderizar | 102 | 896 | P1 | P2_prerrequisitos |
| 173 | Rutas protegidas y code-splitting por ruta | 173 | 660 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | useQuery y el problema que resuelve | 8 | 1081 | P1 | P2_prerrequisitos |
| 124 | Mutations e invalidación | 124 | 981 | P1 | P2_prerrequisitos |
| 221 | Optimistic updates | 221 | 1157 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Zustand — stores mínimos sin boilerplate | 8 | 871 | P1 | P2_prerrequisitos |
| 97 | Redux Toolkit — slices y ceremonia | 97 | 1025 | P1 | P2_prerrequisitos |
| 172 | Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto | 172 | 992 | P1 | P2_prerrequisitos |
| 233 | Jotai, Recoil y XState como alternativas | 233 | 910 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Queries por rol, no por clase CSS | 8 | 853 | P1 | P2_prerrequisitos |
| 88 | Mock Service Worker (MSW) | 88 | 812 | P1 | P2_prerrequisitos |
| 151 | Testing de hooks personalizados | 151 | 913 | P1 | P2_prerrequisitos |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Medir antes de optimizar | 8 | 839 | P1 | P2_prerrequisitos |
| 91 | React.memo con criterio | 91 | 901 | P1 | P2_prerrequisitos |
| 158 | Virtualización y code-splitting | 158 | 824 | P1 | P2_prerrequisitos |
| 219 | useTransition, useDeferredValue y Fiber | 219 | 949 | P1 | P2_prerrequisitos |
| 296 | Suspense y React.lazy — carga diferida del lado cliente | 296 | 762 | P1 | P2_prerrequisitos |

### Track: rutaflow (29 temas en 8 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 24 | El proceso logístico como sistema | 24 | 965 | OK | — |
| 131 | Entorno reproducible en Windows, macOS y Linux | 131 | 955 | OK | — |
| 230 | Arquitectura, privacidad y amenazas | 230 | 902 | OK | — |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Modelo relacional e historial | 6 | 959 | OK | — |
| 114 | Geografía con precisión útil | 114 | 908 | OK | — |
| 214 | Ledger de doble partida | 214 | 970 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Contratos HTTP y autorización | 6 | 1030 | OK | — |
| 147 | Casos de uso y transacciones | 147 | 1053 | OK | — |
| 278 | Outbox, colas y observabilidad | 278 | 1095 | OK | — |
| 410 | Evolución de contratos: aceptar una versión nueva sin romper clientes anteriores | 410 | 544 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Estados explícitos y arquitectura de interfaz | 6 | 1105 | OK | — |
| 144 | Mapas operativos | 144 | 1231 | OK | — |
| 296 | Accesibilidad, seguridad y rendimiento | 296 | 1038 | OK | — |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura Flutter por capacidades | 6 | 1075 | OK | — |
| 165 | GPS, permisos y batería | 165 | 1019 | OK | — |
| 279 | Offline-first y prueba de entrega | 279 | 1114 | OK | — |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Grafos y problema de rutas | 6 | 1201 | OK | — |
| 128 | Geocoding y map matching | 128 | 1063 | OK | — |
| 240 | Streaming y ETA con incertidumbre | 240 | 1227 | OK | — |
| 376 | Socket.IO extremo a extremo: un gateway compatible con el cliente móvil | 376 | 1183 | P1 | P2_prerrequisitos |
| 538 | OSRM: del contrato de coordenadas a una respuesta de ruta verificable | 538 | 754 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Cotización y facturación reproducible | 6 | 1182 | OK | — |
| 139 | Recaudo, liquidación y conciliación | 139 | 1200 | OK | — |
| 267 | Fraude responsable | 267 | 1262 | OK | — |
| 397 | Tokenización de pagos: un identificador opaco no sustituye autorización ni confirmación | 397 | 676 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Infraestructura y entrega segura | 6 | 1029 | OK | — |
| 141 | SLO y respuesta a incidentes | 141 | 1059 | OK | — |
| 263 | Pruebas end-to-end del sistema completo (app ↔ backend) | 263 | 840 | P1 | P2_prerrequisitos |
| 335 | Continuidad, costes y proyecto final | 335 | 1206 | OK | — |

### Track: spring-boot (91 temas en 23 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 29 | Inversión de control y el contenedor de Spring | 29 | 1099 | P1 | P7_rutaflow |
| 146 | Inyección por constructor vs por campo | 146 | 1054 | P1 | P7_rutaflow |
| 280 | Estereotipos, autoconfiguración y scopes | 280 | 936 | P1 | P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Spring Initializr y starters | 8 | 838 | P1 | P7_rutaflow |
| 105 | application.yml vs application.properties | 105 | 918 | P1 | P7_rutaflow |
| 215 | Perfiles y estructura por capas | 215 | 920 | P1 | P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Config Server y service discovery | 8 | 1081 | P1 | P7_rutaflow |
| 173 | Spring Cloud Gateway | 173 | 1057 | P1 | P7_rutaflow |
| 341 | Circuit breaker con Resilience4j | 341 | 1004 | P1 | P7_rutaflow |
| 468 | OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización | 468 | 1010 | P1 | P7_rutaflow |
| 624 | HTTP Interfaces, deadlines y descubrimiento según el entorno | 624 | 1005 | P1 | P7_rutaflow |
| 786 | Spring gRPC para comunicación interna de alta frecuencia (Spring Boot 4.1) | 786 | 991 | P1 | P7_rutaflow |
| 906 | DDD para decidir límites y propiedad de datos | 906 | 1054 | P1 | P7_rutaflow |
| 1063 | Orquestación de microservicios con Temporal y Spring Boot | 1063 | 1698 | OK | — |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Fat JAR vs capas de Docker | 8 | 907 | P1 | P7_rutaflow |
| 110 | GraalVM native image | 110 | 992 | P1 | P7_rutaflow |
| 220 | Health checks para Kubernetes | 220 | 1024 | P1 | P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Arquitectura del microservicio integrador | 8 | 1161 | P1 | P7_rutaflow |
| 247 | Integrando seguridad, persistencia y observabilidad | 247 | 1148 | P1 | P7_rutaflow |
| 464 | Cierre del track y próximos pasos | 464 | 910 | P1 | P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | `@Transactional` funciona en una frontera, no como encantamiento | 10 | 1044 | P1 | P7_rutaflow |
| 150 | Recuperación implica duplicación segura | 150 | 1239 | P1 | P7_rutaflow |
| 340 | Contratos ejecutables protegen despliegues independientes | 340 | 1059 | P1 | P7_rutaflow |
| 468 | Observabilidad sirve a un objetivo y a una decisión | 468 | 1113 | P1 | P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | CRUD API y contratos | 8 | 911 | P1 | P7_rutaflow |
| 183 | MySQL y datos espaciales | 183 | 1062 | P1 | P7_rutaflow |
| 319 | JPA e Hibernate Spatial | 319 | 1055 | P1 | P7_rutaflow |
| 490 | JWT Bearer y autorización por roles | 490 | 991 | P1 | P7_rutaflow |
| 635 | Tiempo real con STOMP | 635 | 1108 | OK | — |
| 805 | Archivos y notificaciones push | 805 | 1071 | P1 | P7_rutaflow |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Backpressure real en WebFlux con reactor-test | 8 | 836 | P1 | P7_rutaflow |
| 124 | Contenedores Testcontainers reutilizados entre clases | 124 | 889 | P1 | P7_rutaflow |
| 252 | Arquitectura hexagonal verificada con ArchUnit | 252 | 952 | P1 | P7_rutaflow |
| 395 | Bulkhead y RateLimiter de Resilience4j | 395 | 998 | P1 | P7_rutaflow |
| 548 | Saga con compensación real | 548 | 1058 | P1 | P7_rutaflow |
| 723 | Event Sourcing con replay real | 723 | 1118 | P1 | P7_rutaflow |
| 894 | Compensación que falla: conservar trabajo pendiente y reintentar sin duplicar | 894 | 663 | P1 | P2_prerrequisitos |
| 989 | Clean Architecture y DDD táctico: caso de uso antes que framework | 989 | 972 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Relaciones, lado propietario y ciclo de vida | 14 | 724 | OK | — |
| 90 | LAZY, EAGER, N+1 y consultas de caso de uso | 90 | 749 | OK | — |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | DataSource, JdbcTemplate y DAO | 14 | 739 | OK | — |
| 102 | `@Transactional`, rollback y límites de transacción | 102 | 699 | OK | — |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | SecurityFilterChain y autorización | 14 | 682 | OK | — |
| 101 | DTO validation, CORS, JWT/OIDC y clientes HTTP | 101 | 672 | OK | — |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Job, Step, Tasklet y chunk processing | 14 | 914 | OK | — |
| 125 | Reinicio, JobParameters, retry, skip y listeners | 125 | 757 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Por qué DTOs en vez de entidades directamente | 8 | 926 | P1 | P7_rutaflow |
| 121 | Validación con Bean Validation y ResponseEntity | 121 | 836 | P1 | P7_rutaflow |
| 220 | Manejo centralizado de errores con @ControllerAdvice | 220 | 838 | P1 | P7_rutaflow |
| 325 | Lombok y MapStruct sin exponer datos internos | 325 | 935 | P1 | P7_rutaflow |
| 508 | OpenAPI con springdoc: el contrato como prueba | 508 | 918 | P1 | P2_prerrequisitos |
| 694 | Paginación HTTP con validación y un límite de recursos explícito | 694 | 543 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Scheduling y tareas periódicas | 14 | 705 | OK | — |
| 83 | Eventos locales, eventos transaccionales y mensajería | 83 | 750 | OK | — |
| 151 | Correo con Spring Mail y entrega recuperable | 151 | 685 | OK | — |
| 219 | Caché con Spring Cache, Caffeine y Redis | 219 | 731 | OK | — |
| 294 | @Async y ejecutores: trabajo en segundo plano con límites | 294 | 894 | P1 | P2_prerrequisitos |
| 458 | Tema complementario: Integraciones empresariales, SOAP y fronteras de protocolo | 458 | 539 | P1 | P2_prerrequisitos |
| 517 | Spring AI: ChatClient y herramientas con autorización fuera del modelo | 517 | 623 | P1 | P2_prerrequisitos |
| 604 | RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar | 604 | 647 | P1 | P2_prerrequisitos |
**modulo-21**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 17 | Productor, tópico, key y consumidor | 17 | 1192 | OK | — |
| 191 | Reintentos, DLT, entrega al menos una vez e idempotencia | 191 | 1451 | OK | — |
| 383 | Outbox transaccional y flujo de negocio | 383 | 1098 | OK | — |
**modulo-22**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Hexagonal: puertos que hablan el idioma del dominio | 7 | 818 | P1 | P7_rutaflow |
| 152 | C4: contexto, contenedores, componentes y código | 152 | 809 | P1 | P7_rutaflow |
| 284 | ADR: decisiones con contexto, alternativas y consecuencias | 284 | 834 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Entidades y repositorios derivados | 8 | 1218 | P1 | P7_rutaflow |
| 183 | El problema N+1 y su corrección | 183 | 1091 | P1 | P7_rutaflow |
| 334 | Migraciones con Flyway | 334 | 1033 | P1 | P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | SecurityFilterChain moderno | 8 | 979 | P1 | P7_rutaflow |
| 177 | Filtro JWT y autorización por rol | 177 | 1295 | P1 | P7_rutaflow |
| 394 | CORS y CSRF | 394 | 1048 | P1 | P7_rutaflow |
| 544 | Protección SSRF con InetAddressFilter (Spring Boot 4.1) | 544 | 880 | P1 | P7_rutaflow |
| 643 | Flujo de login completo — de `/api/auth/login` a una ruta protegida | 643 | 1192 | OK | — |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | @ConfigurationProperties tipado | 8 | 944 | P1 | P7_rutaflow |
| 157 | Fallar rápido al arranque | 157 | 951 | P1 | P7_rutaflow |
| 273 | Manejo global de excepciones consistente entre entornos | 273 | 1198 | P1 | P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Slices de testing — @WebMvcTest | 8 | 1064 | P1 | P7_rutaflow |
| 168 | @DataJpaTest con Testcontainers | 168 | 1089 | P1 | P7_rutaflow |
| 328 | @SpringBootTest completo y estrategia de pirámide de tests | 328 | 1126 | P1 | P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Actuator y health checks personalizados | 8 | 1088 | P1 | P7_rutaflow |
| 185 | Métricas de negocio con Micrometer | 185 | 996 | P1 | P7_rutaflow |
| 348 | Liveness vs readiness | 348 | 1052 | P1 | P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Producers y consumers con Spring Kafka | 8 | 1243 | P1 | P7_rutaflow |
| 202 | Dead-letter queue | 202 | 1172 | P1 | P7_rutaflow |
| 380 | Productor idempotente y transacciones (exactly-once) | 380 | 1384 | P1 | P7_rutaflow |
| 586 | Rebalanceo de consumer groups y partition assignment | 586 | 1312 | P1 | P7_rutaflow |
| 788 | Kafka frente a RabbitMQ | 788 | 1242 | P1 | P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 213 | Mono y Flux | 213 | 947 | P1 | P7_rutaflow |
| 336 | WebClient y composición no bloqueante | 336 | 1076 | P1 | P7_rutaflow |
| 496 | Cuándo WebFlux vale la complejidad, y R2DBC | 496 | 1197 | P1 | P7_rutaflow |

## Temas P1 — incompletos (1012)

| Track | Módulo | Tema | Profundidad | Falta |
|---|---|---|---|---|
| android | — | — | profunda | P2_prerrequisitos |
| android | — | — | profunda | P2_prerrequisitos |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P2_prerrequisitos |
| android | — | — | profunda | P2_prerrequisitos |
| android | — | — | profunda | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | adecuada | P2_prerrequisitos |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| android | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| angular | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | adecuada | P7_rutaflow |
| angular | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| angular | — | — | adecuada | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | adecuada | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| angular | — | — | profunda | P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | adecuada | P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| devops | — | — | profunda | P2_prerrequisitos |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P2_prerrequisitos |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| devops | — | — | adecuada | P7_rutaflow |
| devops | — | — | profunda | P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P7_rutaflow |
| foundations | — | — | profunda | P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P5_fallo |
| java | — | — | profunda | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos |
| java | — | — | adecuada | P2_prerrequisitos |
| java | — | — | adecuada | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos |
| java | — | — | adecuada | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | adecuada | P7_rutaflow |
| java | — | — | adecuada | P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | adecuada | P2_prerrequisitos |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | adecuada | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| javascript | — | — | profunda | P7_rutaflow |
| javascript | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | adecuada | P2_prerrequisitos |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos |
| kotlin-multiplatform | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| react | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| react | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| react | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| react | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| react | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | profunda | P2_prerrequisitos |
| react | — | — | adecuada | P2_prerrequisitos |
| rutaflow | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| rutaflow | — | — | profunda | P2_prerrequisitos |
| rutaflow | — | — | adecuada | P2_prerrequisitos |
| rutaflow | — | — | adecuada | P2_prerrequisitos |
| rutaflow | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |
| spring-boot | — | — | profunda | P7_rutaflow |

## Recomendaciones priorizadas

2. **Completar 1012 temas P1** (falta ≥1 paso).
3. **Añadir fuente oficial a 1 temas**.
5. **Convertir 211 ASCII a Mermaid**.
8. **Iniciar revisión humana**: 0/1131 revisados pedagógicamente.

## Límites

- Mide presencia, no calidad ni ejecución.
- Similitud = Jaccard sobre shingles de 5 palabras.
- No sustituye revisión humana.
