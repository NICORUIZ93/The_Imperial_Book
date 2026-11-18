# Revisión completa — The Imperial Book

Generado: `2026-11-18T11:40:18`

> Mide PRESENCIA de marcadores, no calidad pedagógica ni ejecución real.
> Fuentes oficiales y ASCII usan el detector de `scripts/audit_code_visual_quality.py`;
> profundidad y duplicados usan los umbrales de este script.

## Resumen ejecutivo

| Métrica | Valor |
|---|---:|
| Temas totales | **1430** |
| Completos (7/7 pasos) | **235/1430** (16%) |
| Con fuente oficial | **1350/1430** (94%) |
| Con caso real | **1130/1430** (79%) |
| Con Mermaid | **746/1430** |
| ASCII pendiente | **179** |
| Profundidad insuficiente | **0** |
| Duplicados cross-track | **0** |

## Distribución por prioridad

| Prioridad | Significado | Temas |
|---|---|---:|
| P0 | Sin código NI comando | 0 |
| P1 | Falta ≥1 paso de los 7 | 1195 |
| P2 | Sin fuente o sin caso real | 11 |
| P3 | ASCII sin Mermaid | 0 |
| OK | Cumple los 4 ejes | 224 |

## Pasos faltantes (global)

| Paso | Temas que lo omiten |
|---|---:|
| P2_prerrequisitos | 831 |
| P7_rutaflow | 711 |
| P6_modificacion | 148 |
| P5_fallo | 74 |
| P1_resultado | 3 |
| P4_comando | 1 |

## Cobertura por track

| Track | Módulos | Temas | 7/7 | Fuente | Caso | Mermaid | ASCII | P0 | P1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 19 | 83 | 14 | 81 | 83 | 36 | 40 | 0 | 69 |
| angular | 17 | 78 | 12 | 78 | 78 | 37 | 20 | 0 | 66 |
| cloud | 35 | 168 | 16 | 166 | 168 | 86 | 17 | 0 | 152 |
| control-1 | 23 | 70 | 0 | 13 | 0 | 0 | 0 | 0 | 70 |
| devops | 23 | 138 | 32 | 137 | 138 | 91 | 40 | 0 | 106 |
| flutter | 23 | 119 | 14 | 112 | 118 | 95 | 2 | 0 | 105 |
| foundations | 16 | 102 | 14 | 102 | 101 | 73 | 0 | 0 | 88 |
| ios | 15 | 69 | 15 | 68 | 69 | 47 | 4 | 0 | 54 |
| java | 23 | 117 | 25 | 112 | 40 | 24 | 0 | 0 | 92 |
| javascript | 15 | 92 | 6 | 92 | 91 | 62 | 0 | 0 | 86 |
| kotlin-multiplatform | 14 | 66 | 13 | 65 | 66 | 42 | 17 | 0 | 53 |
| microservices | 2 | 24 | 23 | 24 | 24 | 1 | 0 | 0 | 1 |
| node | 16 | 90 | 9 | 87 | 29 | 39 | 0 | 0 | 81 |
| react | 15 | 64 | 6 | 64 | 64 | 43 | 5 | 0 | 58 |
| rutaflow | 8 | 29 | 24 | 29 | 29 | 26 | 0 | 0 | 5 |
| spring-boot | 27 | 121 | 12 | 120 | 32 | 44 | 0 | 0 | 109 |

## Listado de temas por curso

### Track: android (83 temas en 19 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 26 | Estructura de un proyecto Android Studio | 26 | 1169 | OK | — |
| 154 | Recursos externalizados | 154 | 983 | OK | — |
| 275 | AndroidManifest.xml y módulos Gradle | 275 | 1023 | OK | — |
| 402 | Kotlin esencial para Android — lo que usarás en cada pantalla | 402 | 972 | P1 | P2_prerrequisitos |
| 510 | Lambdas y funciones de orden superior en Kotlin — contratos, captura y receptores · Intermedio · 120 min | 510 | 1244 | P1 | P2_prerrequisitos |
| 634 | Coroutines — asincronía sin bloquear la UI | 634 | 923 | P1 | P2_prerrequisitos |
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
| 313 | Capa de dominio y casos de uso: reglas de negocio fuera del ViewModel · Avanzado · 40 min | 313 | 951 | OK | — |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | El sistema operativo conecta tu app con entradas externas | 8 | 986 | P1 | P7_rutaflow |
| 135 | Proteger datos exige conocer copias y ciclo de vida | 135 | 949 | P1 | P7_rutaflow |
| 249 | Offline-first necesita un protocolo de cambios | 249 | 1210 | P1 | P7_rutaflow |
| 386 | La calidad se opera por dispositivo y versión | 386 | 1026 | P1 | P7_rutaflow |
| 571 | Del dispositivo al diagnóstico: SoC, memoria, límites térmicos y arranque verificado | 571 | 703 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | ComposeTestRule ejecuta tu UI sin emulador visible | 8 | 1069 | P1 | P7_rutaflow |
| 136 | Finders, assertions y actions navegan el árbol semántico | 136 | 893 | P1 | P7_rutaflow |
| 238 | Semantics y clearAndSetSemantics definen qué percibe la accesibilidad | 238 | 1090 | P1 | P7_rutaflow |
| 387 | AccessibilityService y TalkBack consumen el árbol semántico en producción | 387 | 948 | P1 | P7_rutaflow |
| 497 | Animaciones de estado y visibilidad usan una especificación medible | 497 | 1098 | P1 | P7_rutaflow |
| 623 | AnimatedContent y AnimationSpec especifican transiciones completas | 623 | 1208 | P1 | P7_rutaflow |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Intents implícitos y Activity Result API | 6 | 901 | P1 | P2_prerrequisitos |
| 130 | BroadcastReceiver: reaccionar a eventos del sistema | 130 | 845 | P1 | P2_prerrequisitos |
| 252 | Foreground Service de ubicación con FusedLocationProvider | 252 | 939 | P1 | P2_prerrequisitos |
| 415 | Compartir archivos con FileProvider y content:// | 415 | 783 | OK | — |
| 543 | Mapas con Maps Compose: marcadores, cámara y ruta · Intermedio · 45 min | 543 | 875 | P2 | — |
| 668 | Geofencing: avisar al entrar en la zona de una parada · Avanzado · 45 min | 668 | 962 | OK | — |
| 823 | CameraX y ML Kit: foto de entrega y escaneo de códigos de barras · Avanzado · 50 min | 823 | 923 | OK | — |
| 962 | Sensores con SensorManager: detectar caídas del paquete y orientación · Intermedio · 40 min | 962 | 923 | OK | — |
| 1083 | Bluetooth LE: buscar y leer una báscula del vehículo · Avanzado · 50 min | 1083 | 1055 | OK | — |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Permisos en tiempo de ejecución y alternativas sin permiso | 10 | 520 | P1 | P2_prerrequisitos |
| 99 | DataStore para preferencias consistentes y migrables | 99 | 465 | P1 | P2_prerrequisitos |
| 181 | Paging 3, estados de carga y RemoteMediator | 181 | 448 | P1 | P2_prerrequisitos |
| 265 | FCM, permiso de notificaciones y sincronización confiable | 265 | 485 | P1 | P2_prerrequisitos |
| 354 | Interfaces adaptativas para teléfono, tablet y foldable | 354 | 500 | P1 | P2_prerrequisitos |
| 437 | Credential Manager, passkeys y verificación en servidor | 437 | 507 | P1 | P2_prerrequisitos |
| 530 | Play Integrity API: comprobar en el servidor que la petición viene de tu app real · Experto · 50 min | 530 | 1099 | OK | — |
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
| 332 | Macrobenchmark: medir el arranque y el scroll como lo vive el usuario · Avanzado · 45 min | 332 | 906 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Composables y recomposición | 6 | 922 | P1 | P7_rutaflow |
| 109 | State hoisting | 109 | 967 | P1 | P7_rutaflow |
| 220 | remember, rememberSaveable y layout básico | 220 | 975 | P1 | P7_rutaflow |
| 343 | Material 3 en Compose: tema, color dinámico y componentes · Intermedio · 40 min | 343 | 1016 | OK | — |
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

### Track: angular (78 temas en 17 módulos)

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
| 823 | Pipes puros e impuros, AsyncPipe y signals | 823 | 1096 | P1 | P2_prerrequisitos, P7_rutaflow |
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
| 390 | Zoneless | 390 | 1099 | P1 | P7_rutaflow |
| 513 | Modos de render por ruta: SSR, prerender (SSG) y CSR con app.routes.server.ts · Avanzado · 45 min | 513 | 1028 | OK | — |
| 641 | Hidratación incremental: @defer con hydrate on para despertar solo lo que se usa · Avanzado · 40 min | 641 | 1052 | OK | — |
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
| 526 | CSP con nonce y Trusted Types en Angular · Experto · 45 min | 526 | 1074 | OK | — |
| 663 | Perfilar con Angular DevTools y el panel Performance de Chrome · Avanzado · 40 min | 663 | 1139 | OK | — |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | TestBed y ComponentFixture | 8 | 853 | P1 | P7_rutaflow |
| 124 | Pruebas de Signals | 124 | 971 | P1 | P7_rutaflow |
| 248 | Cypress y Playwright | 248 | 963 | P1 | P7_rutaflow |
| 339 | Animaciones accesibles | 339 | 933 | P1 | P7_rutaflow |
| 468 | SSR y TransferState | 468 | 1025 | P1 | P7_rutaflow |
| 580 | Hidratación y `provideServerRendering` | 580 | 1308 | P1 | P7_rutaflow |
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
| 422 | Hacia zoneless change detection | 422 | 1561 | P1 | P7_rutaflow |
| 552 | linkedSignal — estado derivado que el usuario puede sobrescribir | 552 | 772 | P1 | P7_rutaflow |
| 638 | resource() y httpResource — datos asíncronos reactivos | 638 | 1182 | P1 | P7_rutaflow |
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
| 675 | Resolvers funcionales: datos listos antes de mostrar la ruta · Intermedio · 40 min | 675 | 1070 | OK | — |
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
| 391 | Librerías y monorepos con Angular CLI: un workspace, varias aplicaciones y código compartido · Avanzado · 45 min | 391 | 969 | OK | — |
| 525 | Microfrontends con criterio: Native Federation y cuándo no usarlos · Experto · 50 min | 525 | 1029 | OK | — |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Store propio con signals | 6 | 1334 | P1 | P7_rutaflow |
| 158 | NgRx — actions, reducers y selectors | 158 | 1387 | P1 | P7_rutaflow |
| 312 | Cuándo NgRx justifica su complejidad | 312 | 1334 | P1 | P7_rutaflow |

### Track: cloud (168 temas en 35 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 12 | Fundamentos absolutos — qué es una terminal, un comando y un sistema operativo | 12 | 491 | P1 | P7_rutaflow |
| 77 | Fundamentos de redes — direcciones IP, puertos, HTTP y APIs | 77 | 615 | P1 | P2_prerrequisitos, P7_rutaflow |
| 158 | Qué vas a aprender y cómo está estructurado el curso | 158 | 517 | P1 | P7_rutaflow |
| 224 | Qué es Floci — definición, propósito y comparativa con LocalStack | 224 | 690 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 269 | Servicios que emula Floci — AWS, Azure y GCP | 269 | 542 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 312 | Ventajas y limitaciones de practicar con un emulador local | 312 | 484 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 342 | Metodología de estudio — teoría, laboratorio y evaluación en cada módulo | 342 | 634 | P1 | P7_rutaflow |
| 383 | Modelos de servicio (IaaS, PaaS, SaaS), regiones y zonas de disponibilidad · Básico · 40 min | 383 | 1028 | OK | — |
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
| 57 | KMS y envelope encryption | 57 | 968 | P1 | P2_prerrequisitos |
| 113 | SSM Parameter Store vs Secrets Manager | 113 | 773 | P1 | P2_prerrequisitos |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El patrón fan-out con SNS | 6 | 834 | P1 | P2_prerrequisitos |
| 67 | EventBridge: bus de eventos con filtrado declarativo | 67 | 845 | P1 | P2_prerrequisitos |
| 133 | SNS + SQS juntos, y Azure Event Hubs | 133 | 793 | P1 | P2_prerrequisitos |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Log groups, log streams y correlation ID | 6 | 896 | P1 | P2_prerrequisitos |
| 70 | Metric filters y alarmas | 70 | 957 | P1 | P2_prerrequisitos |
| 124 | Diagnóstico sistemático y X-Ray | 124 | 553 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | RDS Instance y cuándo elegir SQL sobre NoSQL | 6 | 936 | P1 | P2_prerrequisitos |
| 63 | Snapshots y restore | 63 | 778 | P1 | P2_prerrequisitos |
| 129 | Migrations | 129 | 866 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | ECR y por qué no basta con Docker Hub | 6 | 819 | OK | — |
| 61 | Task Definition y ECS Cluster | 61 | 835 | P1 | P2_prerrequisitos |
| 114 | Contenedores vs Lambda, y EKS | 114 | 926 | P1 | P2_prerrequisitos |
| 172 | Cadena de suministro en la nube: escaneo, firma y verificación de imágenes en ECR · Avanzado · 45 min | 172 | 1010 | OK | — |
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
| 148 | Express vs Standard, y cuándo EventBridge Pipes es suficiente | 148 | 815 | P1 | P2_prerrequisitos, P7_rutaflow |
| 193 | Procesamiento por lotes: trabajos independientes, reintentos e idempotencia · Avanzado · 40 min | 193 | 1086 | OK | — |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Streams vs colas | 6 | 881 | P1 | P2_prerrequisitos |
| 61 | MSK (Kafka gestionado) y consumer groups | 61 | 920 | P1 | P2_prerrequisitos |
| 126 | Kinesis Data Streams vs Firehose, y GCP Managed Kafka | 126 | 745 | P1 | P2_prerrequisitos |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Por qué no construir tu propio sistema de autenticación | 6 | 1025 | P1 | P2_prerrequisitos |
| 69 | Access Token, ID Token y Refresh Token | 69 | 934 | P1 | P2_prerrequisitos |
| 128 | OAuth 2.0 y PKCE | 128 | 959 | P1 | P2_prerrequisitos |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Data lake y Glue Catalog | 6 | 834 | P1 | P2_prerrequisitos |
| 68 | Glue Crawler y Athena | 68 | 906 | P1 | P2_prerrequisitos |
| 139 | Parquet vs CSV, y partition pruning | 139 | 856 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Objetos, buckets y su nomenclatura | 6 | 1060 | P1 | P2_prerrequisitos |
| 100 | Claves y metadatos | 100 | 867 | P1 | P2_prerrequisitos |
| 170 | Versionado y ciclo de vida | 170 | 891 | P1 | P2_prerrequisitos |
| 242 | Transición entre capas de almacenamiento | 242 | 761 | P1 | P2_prerrequisitos |
| 303 | Políticas de bucket, ACL y URLs pre-firmadas | 303 | 827 | P1 | P2_prerrequisitos |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Bedrock Runtime y respuestas stub deterministas | 6 | 884 | P1 | P2_prerrequisitos |
| 59 | Textract y Transcribe | 59 | 792 | P1 | P2_prerrequisitos |
| 118 | Stub vs mock, y qué probar localmente | 118 | 844 | P1 | P2_prerrequisitos |
| 164 | Gobierno de IA y ML: fichas de modelo, umbrales por grupo y una puerta antes de publicar · Avanzado · 45 min | 164 | 1041 | OK | — |
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
| 332 | WAF y protección DDoS: limitar peticiones y bloquear ataques comunes en el borde · Avanzado · 45 min | 332 | 1068 | OK | — |
**modulo-23**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué resuelve un caché en memoria — y cuándo no ayuda | 6 | 1056 | P1 | P2_prerrequisitos |
| 78 | Arquitectura de ElastiCache en Floci — contenedores reales, no simulación | 78 | 782 | P1 | P2_prerrequisitos, P7_rutaflow |
| 131 | Creación de clústeres y conexión con clientes estándar | 131 | 766 | P1 | P2_prerrequisitos |
| 198 | Autenticación IAM para el plano de datos de ElastiCache | 198 | 823 | P1 | P2_prerrequisitos |
**modulo-24**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | CodeBuild — compilaciones reales dentro de contenedores Docker | 6 | 986 | P1 | P2_prerrequisitos |
| 84 | buildspec.yml — fases y artefactos | 84 | 574 | P1 | P2_prerrequisitos, P7_rutaflow |
| 161 | CodeDeploy — aplicaciones, grupos y configuraciones predefinidas | 161 | 830 | P1 | P2_prerrequisitos |
| 218 | Despliegue Blue/Green de Lambda — cambio de tráfico por alias | 218 | 904 | P1 | P2_prerrequisitos |
| 274 | Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB | 274 | 983 | P1 | P2_prerrequisitos |
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
| 262 | Datos de series temporales: escritura por tiempo, reducción de resolución y retención · Intermedio · 40 min | 262 | 1068 | OK | — |
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
| 6 | Colas, productores y consumidores | 6 | 923 | P1 | P2_prerrequisitos |
| 65 | Ciclo de vida de un mensaje | 65 | 1074 | P1 | P2_prerrequisitos |
| 136 | Dead Letter Queues (DLQ) | 136 | 1045 | P1 | P2_prerrequisitos |
| 207 | Colas FIFO vs Standard | 207 | 997 | P1 | P2_prerrequisitos |
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
| 6 | Arquitectura multi-nube y portabilidad de conocimiento | 6 | 1222 | P1 | P2_prerrequisitos |
| 165 | Arquitectura interna de cloud local y su uso en CI/CD | 165 | 583 | P1 | P2_prerrequisitos, P7_rutaflow |
| 220 | Migración desde otros emuladores, y límites de un emulador | 220 | 856 | P1 | P2_prerrequisitos |
| 271 | Testcontainers — pruebas de integración automatizadas | 271 | 946 | P1 | P2_prerrequisitos, P7_rutaflow |
| 437 | Migrar a la nube: las 7 R para decidir qué hacer con cada aplicación · Intermedio · 40 min | 437 | 1068 | OK | — |
| 581 | Nube híbrida: conectar el centro de datos con la nube de forma segura y medible · Avanzado · 45 min | 581 | 1020 | OK | — |
**modulo-32**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Una red segura empieza por flujos, no por subredes | 8 | 748 | P1 | P2_prerrequisitos |
| 75 | Una landing zone convierte gobierno en una base repetible | 75 | 759 | P1 | P2_prerrequisitos |
| 152 | Disponibilidad y recuperación responden preguntas distintas | 152 | 779 | P1 | P2_prerrequisitos |
| 224 | Un backup solo existe operativamente después de restaurarlo | 224 | 732 | P1 | P2_prerrequisitos |
| 289 | Well-Architected: revisar una arquitectura con los seis pilares · Avanzado · 45 min | 289 | 1081 | OK | — |
| 415 | Residencia y soberanía de datos: que los datos personales vivan donde la ley permite · Avanzado · 40 min | 415 | 1018 | OK | — |
**modulo-33**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Terraform avanzado y CI/CD cloud | 6 | 848 | P1 | P2_prerrequisitos |
| 75 | Kubernetes administrado, ECS y Service Mesh | 75 | 809 | P1 | P2_prerrequisitos |
| 133 | EC2, VPC, RDS, S3 y DynamoDB avanzados | 133 | 1071 | P1 | P2_prerrequisitos |
| 208 | Lambda, API Gateway y observabilidad avanzada | 208 | 852 | P1 | P2_prerrequisitos, P7_rutaflow |
| 266 | Seguridad, auditoría y FinOps | 266 | 793 | P1 | P2_prerrequisitos |
| 322 | Microservicios, Big Data, AI/ML y multi-cloud | 322 | 930 | OK | — |
| 376 | Detección de amenazas: leer registros de auditoría y alertar sobre comportamiento sospechoso · Avanzado · 45 min | 376 | 1053 | OK | — |
**modulo-34**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 19 | Instalación en macOS, Linux y Windows | 19 | 556 | P1 | P2_prerrequisitos, P7_rutaflow |
| 79 | Modelo mental de la plataforma | 79 | 795 | P1 | P2_prerrequisitos, P7_rutaflow |
| 155 | AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK | 155 | 749 | P1 | P2_prerrequisitos |
| 224 | Configuración avanzada y ciclo de vida | 224 | 633 | P1 | P2_prerrequisitos, P7_rutaflow |
| 289 | Automatización, UI y agentes | 289 | 1000 | P1 | P2_prerrequisitos |
| 370 | Servicios AWS incorporados en la documentación actual | 370 | 977 | P1 | P2_prerrequisitos |
| 440 | Servicios Azure que completan el recorrido | 440 | 945 | P1 | P2_prerrequisitos |
| 520 | Servicios GCP que completan el recorrido | 520 | 817 | P1 | P2_prerrequisitos |
| 600 | floci-ui — explorador visual multi-nube | 600 | 817 | P1 | P2_prerrequisitos |
| 648 | Laboratorios oficiales reconstruidos en español | 648 | 596 | P1 | P7_rutaflow |
| 716 | Límites y transferencia a producción | 716 | 532 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué es NoSQL y cuándo usarlo | 6 | 1266 | P1 | P2_prerrequisitos |
| 96 | Tablas, items y atributos | 96 | 1264 | P1 | P2_prerrequisitos |
| 193 | Tipos de datos — S, N, B, BOOL, NULL, L, M | 193 | 1733 | P1 | P2_prerrequisitos |
| 392 | Clave primaria simple (HASH) vs compuesta (HASH + RANGE) | 392 | 1174 | P1 | P2_prerrequisitos |
| 476 | Índices secundarios globales (GSI) y locales (LSI) | 476 | 1153 | P1 | P2_prerrequisitos |
| 563 | Query vs Scan | 563 | 1310 | P1 | P2_prerrequisitos |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué es serverless — ventajas y desventajas | 6 | 1697 | P1 | P2_prerrequisitos |
| 166 | Estructura de una función Lambda | 166 | 1390 | P1 | P2_prerrequisitos |
| 319 | Runtimes — Node.js, Python, Java, Go | 319 | 1328 | P1 | P2_prerrequisitos |
| 448 | Payload de entrada y respuesta | 448 | 1268 | P1 | P2_prerrequisitos |
| 580 | Versionado y alias | 580 | 1197 | P1 | P2_prerrequisitos |
| 672 | Integración con S3, DynamoDB Streams y API Gateway | 672 | 1272 | P1 | P2_prerrequisitos |
| 759 | Deprecaciones en la nube: encontrar a tiempo runtimes y versiones que dejan de tener soporte · Intermedio · 35 min | 759 | 1080 | OK | — |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Qué es API Gateway y tipos de API — REST, HTTP, WebSocket | 6 | 1029 | P1 | P2_prerrequisitos |
| 71 | Recursos, métodos y stages | 71 | 1182 | P1 | P2_prerrequisitos |
| 173 | Integración con Lambda (proxy) | 173 | 1179 | P1 | P2_prerrequisitos |
| 249 | Mapeo de entrada/salida y validación con modelos | 249 | 932 | P1 | P2_prerrequisitos |
| 306 | Despliegue y variables de stage | 306 | 949 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Principio de mínimo privilegio | 6 | 1040 | P1 | P2_prerrequisitos, P7_rutaflow |
| 68 | Modelo de responsabilidad compartida | 68 | 1032 | P1 | P2_prerrequisitos |
| 128 | Usuarios, grupos y roles | 128 | 1072 | P1 | P2_prerrequisitos, P7_rutaflow |
| 183 | Estructura de una política — acciones, recursos y condiciones | 183 | 758 | P1 | P2_prerrequisitos, P7_rutaflow |
| 254 | Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales | 254 | 1032 | P1 | P2_prerrequisitos |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions | 6 | 1073 | P1 | P2_prerrequisitos |
| 76 | floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions | 76 | 1060 | P1 | P2_prerrequisitos |
| 147 | Comparativa AWS vs Azure vs GCP por categoría de servicio | 147 | 1550 | P1 | P2_prerrequisitos |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura de la aplicación — frontend, backend y base de datos | 6 | 1037 | P1 | P2_prerrequisitos, P7_rutaflow |
| 61 | CRUD de tareas sobre DynamoDB expuesto por Lambda | 61 | 946 | P1 | P2_prerrequisitos, P7_rutaflow |
| 128 | Archivos adjuntos en S3 y procesamiento en segundo plano con SQS | 128 | 1113 | P1 | P2_prerrequisitos, P7_rutaflow |
| 188 | API Gateway e IAM de mínimo privilegio para el proyecto | 188 | 1000 | P1 | P2_prerrequisitos, P7_rutaflow |
| 256 | Documentación de la API y guía de despliegue | 256 | 725 | P1 | P2_prerrequisitos, P7_rutaflow |

### Track: control-1 (70 temas en 23 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Cómo está armado cada capítulo | 13 | 1012 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | ¿Qué es un número complejo? | 14 | 1116 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 183 | Operaciones con números complejos: suma, producto y división | 183 | 1521 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 433 | Raíces de s²+bs+c | 433 | 1397 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 679 | Forma polar, fórmula de Euler y evaluación de G(jω) | 679 | 913 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | La forma de espacio de estados | 13 | 892 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 144 | De estados a función de transferencia | 144 | 778 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Forma estándar de primer orden: K y τ | 14 | 857 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 147 | Respuestas de primer orden al escalón, la rampa y el impulso | 147 | 1163 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 343 | Retardo o tiempo muerto | 343 | 692 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 469 | Identificación desde una gráfica | 469 | 936 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Forma estándar de segundo orden: K, ωn y ζ | 14 | 884 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 186 | Simulador: mueve ζ y ωn | 186 | 779 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 306 | Los cuatro casos según ζ | 306 | 751 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 440 | Fórmulas del caso subamortiguado | 440 | 2082 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 811 | De las especificaciones a la función de transferencia | 811 | 963 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Polos dominantes | 13 | 1136 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 160 | Efecto de un cero | 160 | 1008 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 288 | Cero de fase no mínima | 288 | 756 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Fórmula general del error en estado estacionario | 13 | 709 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 146 | Tipo de sistema y constantes | 146 | 1225 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Qué es estabilidad | 14 | 710 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 125 | El arreglo de Routh | 125 | 1402 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 338 | Casos especiales del arreglo de Routh | 338 | 801 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 467 | Rango de K para estabilidad | 467 | 1110 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Geometría de un polo en el plano s | 14 | 817 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 148 | Estabilidad según la posición de los polos | 148 | 727 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 276 | La zona de diseño | 276 | 1466 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Las dos condiciones del lugar de las raíces | 14 | 877 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 139 | Reglas de construcción (con su porqué) | 139 | 1535 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 363 | Elegir K desde el lugar de las raíces | 363 | 835 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | La idea de las acciones P, I y D: presente, pasado y tendencia | 14 | 587 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 119 | Error en estado estacionario | 119 | 736 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 233 | Cada acción, con números | 233 | 896 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 408 | Ventajas y desventajas (punto 4 del Parcial 1) | 408 | 825 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 521 | Sintonía de Ziegler-Nichols | 521 | 1141 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 19 | Diseño de un adelanto | 19 | 780 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 134 | Diseño de un atraso | 134 | 829 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 252 | Implementación con op-amps | 252 | 839 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | La idea de la transformada de Laplace: del tiempo al dominio s | 13 | 682 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 144 | La tabla de transformadas de Laplace | 144 | 956 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 307 | Propiedades de la transformada de Laplace | 307 | 1327 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 565 | Valor final y valor inicial | 565 | 1165 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Qué es la respuesta en frecuencia | 13 | 570 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 114 | Decibeles y la escala logarítmica | 114 | 750 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 255 | Los bloques básicos del diagrama de Bode | 255 | 808 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 368 | Márgenes de estabilidad | 368 | 1214 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-21**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Parcial 1 resuelto paso a paso | 7 | 1004 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-22**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Simulacro con solución | 7 | 988 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Caso 1: polos reales distintos | 13 | 1522 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 243 | Caso 2: polos repetidos | 243 | 1166 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 424 | Caso 3: polos complejos (completar el cuadrado) | 424 | 1608 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 692 | Resolver una ecuación diferencial completa | 692 | 827 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Qué es la función de transferencia | 13 | 1637 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | ¿Qué es un sistema de control? | 13 | 1011 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 150 | Los elementos de un lazo de control | 150 | 1473 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 329 | Álgebra de bloques | 329 | 1312 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Reglas para mover bloques en un diagrama | 14 | 746 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 120 | Grafos de flujo de señal | 120 | 863 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 233 | Regla de Mason | 233 | 1074 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 408 | Referencia y perturbación juntas | 408 | 918 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Impedancias de resistencia, bobina y condensador en s | 14 | 968 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 170 | Circuitos pasivos: divisor de voltaje | 170 | 651 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 305 | El op-amp inversor | 305 | 1254 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Mecánico de traslación | 14 | 813 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 152 | Mecánico de rotación | 152 | 622 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 259 | Motor DC (electromecánico) | 259 | 943 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 396 | Sistemas térmicos e hidráulicos | 396 | 658 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| 507 | Analogías entre sistemas eléctricos, mecánicos y térmicos | 507 | 742 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 12 | La idea de la linealización: aproximar con la recta tangente | 12 | 917 | P1 | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |

### Track: devops (138 temas en 23 módulos)

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
| 923 | systemd: servicios, timers y logs con journalctl | 923 | 879 | P1 | P2_prerrequisitos |
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
| 601 | FinOps: costos visibles por servicio, etiquetas obligatorias y presupuestos con alertas · Avanzado · 40 min | 601 | 995 | OK | — |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El pipeline completo — de commit a producción verificada | 6 | 851 | P1 | P2_prerrequisitos |
| 127 | Uniendo cada módulo del track en un solo flujo | 127 | 807 | P1 | P2_prerrequisitos |
| 232 | Cierre del track — checklist final y reflexión | 232 | 818 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Confiabilidad es una expectativa cuantificada | 8 | 849 | P1 | P2_prerrequisitos |
| 78 | Una alerta debe conducir a una acción | 78 | 1003 | P1 | P2_prerrequisitos |
| 208 | Construir una imagen no demuestra de dónde proviene | 208 | 938 | P1 | P2_prerrequisitos |
| 334 | Una plataforma interna es un producto con límites | 334 | 940 | P1 | P2_prerrequisitos |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Docker y Compose avanzados | 6 | 798 | P1 | P2_prerrequisitos |
| 148 | Kubernetes extensible y Helm avanzado | 148 | 653 | P1 | P2_prerrequisitos |
| 240 | Service Mesh con Istio o Linkerd | 240 | 718 | P1 | P2_prerrequisitos |
| 329 | GitOps con Argo CD y Flux | 329 | 664 | P1 | P2_prerrequisitos |
| 398 | Ansible, inventarios, roles y Vault | 398 | 710 | P1 | P2_prerrequisitos |
| 483 | DevSecOps y métricas DORA | 483 | 768 | P1 | P2_prerrequisitos |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Postman y Newman — tu primera colección contra una API real | 7 | 935 | OK | — |
| 129 | Scripts y assertions — pruebas automatizadas sobre datos reales | 129 | 957 | P1 | P7_rutaflow |
| 239 | Newman en profundidad — reportes y el contrato del código de salida | 239 | 909 | P1 | P7_rutaflow |
| 322 | Jenkins — instalación, jobs y el linter real de pipelines declarativos | 322 | 1033 | P1 | P7_rutaflow |
| 435 | Integración completa — Newman dentro de un pipeline Jenkins | 435 | 915 | P1 | P7_rutaflow |
| 542 | Bruno y Postman, evaluar con el mismo contrato | 542 | 464 | P1 | P2_prerrequisitos |
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
| 593 | Contenedores sin privilegios: usuario no root, sistema de archivos de solo lectura y capacidades mínimas · Avanzado · 45 min | 593 | 1035 | OK | — |
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
| 325 | Promoción entre entornos con quality gates: el mismo artefacto de pruebas a producción · Avanzado · 45 min | 325 | 988 | OK | — |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Blue-green deployment | 6 | 740 | P1 | P7_rutaflow |
| 102 | Canary releases | 102 | 694 | P1 | P7_rutaflow |
| 197 | Rolling updates | 197 | 768 | P1 | P7_rutaflow |
| 279 | Feature flags vs branches por entorno | 279 | 750 | P1 | P7_rutaflow |
| 361 | Rollback automático por métricas | 361 | 865 | P1 | P7_rutaflow |
| 486 | Rollback ensayado y compatibilidad del artefacto anterior | 486 | 450 | P1 | P2_prerrequisitos, P7_rutaflow |
| 541 | A/B testing y shadow traffic: medir sin convertir usuarios en cobayas | 541 | 1192 | P1 | P2_prerrequisitos |
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
| 634 | Clúster local con Minikube: perfiles, addons e Ingress | 634 | 922 | P1 | P7_rutaflow |
| 721 | Arquitectura de Kubernetes: plano de control, nodos y el ciclo de reconciliación · Intermedio · 40 min | 721 | 921 | OK | — |
| 833 | Scheduling en Kubernetes: requests, limits, afinidad, taints y tolerations · Avanzado · 45 min | 833 | 1008 | OK | — |
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
| 643 | Políticas en Kubernetes: NetworkPolicy y Pod Security Admission · Avanzado · 45 min | 643 | 984 | OK | — |
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
| 653 | OpenTofu, plan y estado sin recursos cloud | 653 | 475 | P1 | P2_prerrequisitos |
| 710 | terraform import y policy as code: adoptar recursos existentes y revisar planes con reglas · Avanzado · 45 min | 710 | 1013 | OK | — |
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
| 608 | Chaos engineering: experimentos controlados para comprobar que el sistema resiste fallos · Experto · 50 min | 608 | 1042 | P2 | — |

### Track: flutter (119 temas en 23 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 27 | Sound null safety | 27 | 1099 | P1 | P2_prerrequisitos |
| 144 | Clases y mixins | 144 | 1098 | P1 | P2_prerrequisitos |
| 255 | Futures, async/await y colecciones funcionales | 255 | 1020 | P1 | P2_prerrequisitos, P7_rutaflow |
| 366 | Lints y estilo con analysis_options.yaml | 366 | 716 | P1 | P2_prerrequisitos, P7_rutaflow |
| 469 | Streams en Dart: secuencias de eventos asíncronos con await for y StreamController · Intermedio · 40 min | 469 | 967 | OK | — |
| 601 | Records y patterns en Dart: varios valores sin clases y switch exhaustivo · Intermedio · 40 min | 601 | 956 | OK | — |
| 725 | Extension methods y extension types: agregar comportamiento sin heredar · Intermedio · 35 min | 725 | 846 | OK | — |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | StatelessWidget vs StatefulWidget | 6 | 919 | P1 | P2_prerrequisitos |
| 109 | Layout con Row, Column y Stack, y ciclo de vida | 109 | 943 | P1 | P2_prerrequisitos |
| 226 | Keys | 226 | 1016 | P1 | P2_prerrequisitos |
| 332 | Los tres árboles de Flutter: Widget, Element y RenderObject · Avanzado · 45 min | 332 | 1071 | OK | — |
| 478 | Gestos en Flutter: GestureDetector, Dismissible y la arena de gestos · Intermedio · 40 min | 478 | 937 | OK | — |
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
| 436 | Flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador · Avanzado · 45 min | 436 | 1015 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura por features y Clean Architecture | 6 | 847 | P1 | P2_prerrequisitos |
| 84 | Uniendo los módulos del track | 84 | 888 | P1 | P2_prerrequisitos |
| 185 | Cierre del track | 185 | 926 | P1 | P2_prerrequisitos |
| 263 | Arquitectura recomendada de Flutter: views, view models, repositories y services · Avanzado · 50 min | 263 | 1145 | OK | — |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Una API Dart puede terminar en una frontera nativa | 8 | 804 | P1 | P2_prerrequisitos |
| 103 | Los secretos no pertenecen al binario | 103 | 854 | P1 | P2_prerrequisitos |
| 207 | Fluidez se mide contra el presupuesto de cada frame | 207 | 803 | P1 | P2_prerrequisitos |
| 290 | Producción exige protocolo, telemetría y contención | 290 | 872 | P1 | P2_prerrequisitos |
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
| 5 | flutter test y WidgetTester | 5 | 651 | P1 | P2_prerrequisitos, P7_rutaflow |
| 79 | pumpAndSettle, golden e integration tests | 79 | 900 | P1 | P2_prerrequisitos, P7_rutaflow |
| 206 | Rendimiento, RepaintBoundary y Keys | 206 | 634 | P1 | P2_prerrequisitos, P7_rutaflow |
| 259 | Clean Architecture | 259 | 648 | P1 | P2_prerrequisitos, P7_rutaflow |
| 311 | Internacionalización completa | 311 | 771 | P1 | P2_prerrequisitos |
| 417 | Builds, firma y despliegue | 417 | 702 | P1 | P2_prerrequisitos |
| 505 | Migrar una app a Flutter 3.50 y Dart 3.14 sin romper la entrega | 505 | 942 | P1 | P2_prerrequisitos, P7_rutaflow |
| 602 | Integrar IA generativa en una app Flutter con Firebase AI Logic | 602 | 898 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | reconocer cuándo usar FFI y crear el paquete | 9 | 600 | P1 | P2_prerrequisitos |
| 67 | generar bindings C seguros para Dart | 67 | 623 | P1 | P2_prerrequisitos |
| 123 | conectar una biblioteca Rust mediante una ABI C | 123 | 616 | P1 | P2_prerrequisitos |
| 169 | compilar y empaquetar bibliotecas por plataforma | 169 | 600 | OK | — |
| 211 | medir rendimiento y evitar bloquear la interfaz | 211 | 674 | P1 | P2_prerrequisitos |
| 259 | propiedad de memoria, liberación y errores | 259 | 634 | P1 | P2_prerrequisitos |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | macros de Dart y alternativas disponibles | 9 | 593 | P1 | P2_prerrequisitos |
| 96 | generación avanzada con build_runner | 96 | 553 | P1 | P2_prerrequisitos |
| 186 | reflexión limitada y registro tipado | 186 | 601 | P1 | P2_prerrequisitos |
| 284 | recorrer el AST de Dart con analyzer | 284 | 551 | P1 | P2_prerrequisitos |
| 375 | crear un builder pequeño para build_runner | 375 | 583 | P1 | P2_prerrequisitos |
| 475 | diseñar y validar un paquete Dart | 475 | 593 | P1 | P2_prerrequisitos |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | la frontera entre Dart y el código nativo | 9 | 678 | P1 | P2_prerrequisitos |
| 115 | secretos fuera del binario | 115 | 740 | P1 | P2_prerrequisitos |
| 214 | fluidez y presupuesto de frames | 214 | 536 | P1 | P2_prerrequisitos, P7_rutaflow |
| 271 | protocolo, telemetría y contención | 271 | 573 | P1 | P2_prerrequisitos |
| 335 | reportes de fallos con Crashlytics y Sentry | 335 | 705 | P1 | P2_prerrequisitos, P7_rutaflow |
| 402 | analítica con privacidad y consentimiento | 402 | 578 | P1 | P2_prerrequisitos, P7_rutaflow |
| 464 | monitoreo de rendimiento en una versión publicada | 464 | 674 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | estado de la jornada con Riverpod | 9 | 616 | P1 | P2_prerrequisitos, P7_rutaflow |
| 93 | mapa y permiso de ubicación | 93 | 530 | P1 | P2_prerrequisitos, P7_rutaflow |
| 163 | posiciones en tiempo real con Socket.IO | 163 | 506 | P1 | P2_prerrequisitos, P7_rutaflow |
| 237 | animar el marcador sin saltos | 237 | 485 | P1 | P2_prerrequisitos, P7_rutaflow |
| 304 | confirmaciones offline y sincronización | 304 | 497 | P1 | P2_prerrequisitos, P7_rutaflow |
| 368 | carga de evidencia con Dio y notificaciones | 368 | 545 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | MediaQuery vs LayoutBuilder | 6 | 919 | P1 | P2_prerrequisitos |
| 91 | Cómo Flutter calcula tamaños | 91 | 912 | P1 | P2_prerrequisitos |
| 164 | Breakpoints propios y SafeArea | 164 | 905 | P1 | P2_prerrequisitos |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | pruebas unitarias y de widget con Flutter Test | 9 | 461 | P1 | P2_prerrequisitos, P7_rutaflow |
| 75 | golden e integración de un flujo real | 75 | 464 | P1 | P2_prerrequisitos, P7_rutaflow |
| 124 | perfilado y presupuesto de rendimiento | 124 | 487 | P1 | P2_prerrequisitos, P7_rutaflow |
| 173 | Clean Architecture y sustitución de dependencias | 173 | 449 | P1 | P2_prerrequisitos, P7_rutaflow |
| 242 | internacionalización y formatos locales | 242 | 442 | P1 | P2_prerrequisitos, P7_rutaflow |
| 303 | builds por plataforma, firma y entrega | 303 | 503 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-21**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | catálogo y flujo con `in_app_purchase` | 9 | 614 | P1 | P2_prerrequisitos |
| 100 | suscripciones Android, planes base y cambios | 100 | 612 | P1 | P2_prerrequisitos |
| 156 | suscripciones iOS con StoreKit | 156 | 596 | P1 | P2_prerrequisitos |
| 212 | restauración de compras y entitlement | 212 | 533 | P1 | P2_prerrequisitos |
| 277 | pruebas de IAP en sandbox | 277 | 565 | P1 | P2_prerrequisitos, P7_rutaflow |
| 333 | validación de transacciones en servidor | 333 | 607 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-22**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | configurar AdMob y cargar el primer banner de prueba | 9 | 749 | P1 | P2_prerrequisitos |
| 130 | elegir mediación, bidding y waterfall | 130 | 619 | P1 | P2_prerrequisitos, P7_rutaflow |
| 188 | banners, interstitials y anuncios recompensados | 188 | 701 | P1 | P2_prerrequisitos |
| 273 | consentimiento, privacidad y audiencias | 273 | 603 | P1 | P2_prerrequisitos |
| 346 | pruebas de anuncios y diagnóstico de no-fill | 346 | 600 | P1 | P2_prerrequisitos, P7_rutaflow |
| 405 | comparar AdMob, AppLovin MAX y Unity LevelPlay | 405 | 656 | P2 | — |
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
| 532 | Inyección de dependencias con Riverpod: reemplazar implementaciones | 532 | 744 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | http vs dio | 6 | 865 | P1 | P2_prerrequisitos |
| 86 | json_serializable | 86 | 916 | P1 | P2_prerrequisitos |
| 159 | Interceptores y estados explícitos | 159 | 1039 | P1 | P2_prerrequisitos |
| 258 | Flujo de autenticación con tokens: login, almacenamiento seguro, renovación y cierre de sesión | 258 | 1068 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | shared_preferences | 6 | 781 | P1 | P2_prerrequisitos |
| 78 | sqflite vs Hive | 78 | 905 | P1 | P2_prerrequisitos |
| 171 | Offline-first y Firebase | 171 | 947 | P1 | P2_prerrequisitos |
| 285 | Restauración de formularios con RestorationMixin y una prueba de recreación | 285 | 503 | P1 | P2_prerrequisitos, P7_rutaflow |
| 371 | Archivos en Flutter: path_provider, carpetas correctas y escritura segura · Intermedio · 35 min | 371 | 882 | OK | — |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | MethodChannel | 6 | 893 | P1 | P2_prerrequisitos |
| 107 | Plugins federados | 107 | 808 | P1 | P2_prerrequisitos |
| 167 | Permisos de plataforma y cuándo escribir un platform channel propio | 167 | 836 | P1 | P2_prerrequisitos |
| 235 | Cámara, galería y carga multipart de una evidencia | 235 | 1251 | P1 | P2_prerrequisitos, P7_rutaflow |
| 429 | Add-to-app: integrar una pantalla Flutter en una app Android o iOS existente · Experto · 50 min | 429 | 992 | OK | — |
| 593 | Trabajo en segundo plano con workmanager: sincronizar aunque la app esté cerrada · Avanzado · 45 min | 593 | 986 | OK | — |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Animaciones implícitas vs explícitas | 6 | 802 | P1 | P2_prerrequisitos |
| 90 | Flutter DevTools y detección de jank | 90 | 858 | P1 | P2_prerrequisitos |
| 160 | const widgets, RepaintBoundary y shouldRepaint | 160 | 906 | P1 | P2_prerrequisitos |
| 234 | Isolates — trabajo pesado sin congelar la interfaz | 234 | 879 | P1 | P2_prerrequisitos |
| 323 | CustomPainter: dibujar con Canvas sin repintar de más | 323 | 894 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Unit tests y widget tests | 6 | 882 | P1 | P2_prerrequisitos |
| 91 | Mocking con mocktail | 91 | 834 | P1 | P2_prerrequisitos |
| 167 | Integration tests | 167 | 859 | P1 | P2_prerrequisitos |

### Track: foundations (102 temas en 16 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 32 | Computador, sistema operativo, programa y proceso · Básico · 90 min | 32 | 1020 | P1 | P2_prerrequisitos |
| 136 | Del archivo fuente al programa en ejecución | 136 | 715 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 201 | Archivos, carpetas y rutas sin perderse | 201 | 555 | P1 | P2_prerrequisitos, P7_rutaflow |
| 258 | Cómo leer un comando antes de ejecutarlo | 258 | 497 | P1 | P2_prerrequisitos, P7_rutaflow |
| 315 | Primer programa, primer error y primera evidencia | 315 | 589 | P1 | P2_prerrequisitos |
| 383 | VS Code, comandos y atajos comprobables | 383 | 507 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Del problema al algoritmo y a los casos de prueba | 8 | 1526 | P1 | P7_rutaflow |
| 179 | Variables, tipos, expresiones y cambios de estado | 179 | 1226 | P1 | P7_rutaflow |
| 308 | Decisiones, repeticiones y trazado de ejecución | 308 | 1303 | P1 | P2_prerrequisitos, P7_rutaflow |
| 445 | Funciones y descomposición de problemas | 445 | 1210 | P1 | P2_prerrequisitos, P7_rutaflow |
| 593 | Cómo la computadora representa los datos — binario, texto y decimales | 593 | 838 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | La red convierte el resultado en una incertidumbre | 8 | 1121 | P1 | P2_prerrequisitos |
| 135 | Replicación, consistencia y decisiones explícitas | 135 | 1160 | P1 | P2_prerrequisitos |
| 250 | Mensajes que se procesan con efectos exactamente una vez | 250 | 1255 | P1 | P2_prerrequisitos, P7_rutaflow |
| 413 | Resiliencia y observabilidad orientadas a objetivos | 413 | 1151 | P1 | P2_prerrequisitos |
| 531 | Tiempo, coordinación y acuerdo: Lamport, elección de líder y commit en dos fases | 531 | 1171 | P1 | P2_prerrequisitos |
| 700 | Latencia y throughput: medir concurrencia sin confundirla con capacidad ilimitada | 700 | 736 | P1 | P2_prerrequisitos |
| 790 | Diseño de sistemas: de requisitos a estimación de capacidad y cuello de botella | 790 | 1140 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 11 | Sistemas, arquitectura y sistemas operativos | 11 | 996 | P1 | P2_prerrequisitos |
| 112 | Algoritmos, autómatas, lenguajes y compiladores | 112 | 1004 | P1 | P2_prerrequisitos |
| 229 | Bases de datos, almacenes analíticos y minería de datos | 229 | 668 | P1 | P2_prerrequisitos |
| 308 | Inteligencia artificial, aprendizaje automático y visión | 308 | 994 | P1 | P2_prerrequisitos |
| 419 | Gráficos y cómputo científico | 419 | 959 | P1 | P2_prerrequisitos |
| 519 | Redes, seguridad, web e ingeniería profesional | 519 | 923 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 15 | Matemáticas aplicadas: derivada, integral y modelos | 15 | 583 | P1 | P2_prerrequisitos |
| 69 | Circuitos DC y AC: Kirchhoff, Thévenin y Norton | 69 | 605 | P1 | P2_prerrequisitos |
| 123 | Electrónica analógica: diodos, transistores y amplificadores | 123 | 601 | P1 | P2_prerrequisitos |
| 177 | Electrónica digital: lógica y máquinas de estados | 177 | 535 | P1 | P2_prerrequisitos |
| 233 | Microcontroladores: GPIO, ADC, PWM e interrupciones | 233 | 586 | P1 | P2_prerrequisitos |
| 287 | Comunicaciones: modulación y detección de errores | 287 | 542 | P1 | P2_prerrequisitos |
| 341 | Señales y sistemas: muestreo, Fourier y convolución | 341 | 596 | P1 | P2_prerrequisitos |
| 397 | DSP: filtros digitales y compresión | 397 | 582 | P1 | P2_prerrequisitos |
| 453 | Instrumentación: calibración, DAQ e incertidumbre | 453 | 535 | P1 | P2_prerrequisitos |
| 507 | Control automático: realimentación, PID y estabilidad | 507 | 574 | P1 | P2_prerrequisitos |
| 564 | Potencia: conversión, eficiencia y disipación | 564 | 555 | P1 | P2_prerrequisitos |
| 618 | PCB: esquemático, ERC, DRC y fabricación | 618 | 584 | P1 | P2_prerrequisitos |
| 670 | Sistemas embebidos: RTOS, buses y firmware | 670 | 825 | P1 | P2_prerrequisitos |
| 744 | Programación de bajo nivel: C, memoria y depuración | 744 | 541 | P1 | P2_prerrequisitos |
| 797 | Electromagnetismo: Faraday y líneas de transmisión | 797 | 546 | P1 | P2_prerrequisitos |
| 849 | Gestión profesional: requisitos, riesgos y evidencia | 849 | 556 | OK | — |
| 902 | PLC y control industrial: ciclo de scan e IEC 61131-3 | 902 | 593 | P1 | P2_prerrequisitos |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Ordenamientos: insertion, merge y quick sort | 6 | 971 | OK | — |
| 123 | Algoritmos codiciosos y árbol de expansión mínima | 123 | 937 | P1 | P2_prerrequisitos |
| 234 | Caminos más cortos con Dijkstra | 234 | 868 | P1 | P2_prerrequisitos |
| 345 | Búsqueda en cadenas: de la fuerza bruta a KMP | 345 | 844 | OK | — |
| 457 | Problemas intratables: P, NP y heurísticas | 457 | 881 | P1 | P2_prerrequisitos |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Decorator: agregar comportamiento sin heredar | 6 | 703 | P1 | P2_prerrequisitos |
| 115 | State: un objeto que cambia de comportamiento según su estado | 115 | 663 | P1 | P2_prerrequisitos |
| 221 | Template Method: un algoritmo fijo con pasos variables | 221 | 664 | OK | — |
| 338 | Chain of Responsibility: una cadena de validadores | 338 | 710 | OK | — |
| 446 | Mediator: coordinar objetos sin que se conozcan | 446 | 686 | OK | — |
| 551 | Memento: guardar y restaurar estado para deshacer | 551 | 624 | OK | — |
| 661 | Visitor: operaciones nuevas sin tocar las clases | 661 | 680 | P1 | P2_prerrequisitos |
| 758 | Flyweight: compartir estado para ahorrar memoria | 758 | 708 | OK | — |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Nombres que revelan intención y funciones pequeñas | 6 | 872 | P1 | P2_prerrequisitos |
| 113 | Comentarios honestos y excepciones en lugar de códigos de error | 113 | 794 | OK | — |
| 217 | Objetos frente a estructuras de datos y la ley de Demeter | 217 | 754 | P1 | P2_prerrequisitos |
| 321 | Pruebas limpias: F.I.R.S.T. y un concepto por prueba | 321 | 703 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Elegir estructuras según las operaciones | 7 | 1300 | P1 | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| 171 | Pilas, colas y abstracciones de comportamiento | 171 | 1289 | P1 | P2_prerrequisitos, P7_rutaflow |
| 316 | Búsqueda, precondiciones y demostración de corrección | 316 | 1277 | P1 | P2_prerrequisitos, P7_rutaflow |
| 465 | Complejidad, medición, ordenamiento y recursión | 465 | 1403 | P1 | P2_prerrequisitos, P7_rutaflow |
| 636 | Árboles y árboles binarios de búsqueda (BST) | 636 | 842 | P1 | P2_prerrequisitos, P7_rutaflow |
| 738 | Tablas hash — búsqueda en tiempo constante | 738 | 696 | P1 | P2_prerrequisitos, P7_rutaflow |
| 817 | Grafos y recorridos BFS/DFS | 817 | 761 | P1 | P2_prerrequisitos |
| 912 | Programación dinámica — resolver una vez, recordar el resultado | 912 | 724 | P1 | P2_prerrequisitos |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | De una URL al servidor: red, DNS, IP y puertos | 6 | 1351 | P1 | P2_prerrequisitos, P7_rutaflow |
| 139 | HTTP como contrato observable | 139 | 1284 | P1 | P2_prerrequisitos, P7_rutaflow |
| 291 | HTML semántico, formularios y el DOM | 291 | 1300 | P1 | P2_prerrequisitos, P7_rutaflow |
| 473 | CSS, layout responsive y accesibilidad verificable | 473 | 1516 | P1 | P2_prerrequisitos, P7_rutaflow |
| 663 | Proyecto integrador — sitio de seguimiento accesible | 663 | 628 | P1 | P2_prerrequisitos |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Del mundo real al modelo relacional | 6 | 1500 | P1 | P2_prerrequisitos |
| 155 | SQL para definir, escribir, consultar y relacionar | 155 | 1248 | P1 | P7_rutaflow |
| 298 | Índices, restricciones y planes de consulta | 298 | 1397 | P1 | P2_prerrequisitos, P7_rutaflow |
| 441 | Transacciones, concurrencia y elección SQL/NoSQL | 441 | 1481 | P1 | P2_prerrequisitos, P7_rutaflow |
| 603 | SQL avanzado: subconsultas, vistas, triggers y funciones de ventana | 603 | 1153 | P1 | P2_prerrequisitos |
| 756 | Procedimientos almacenados, funciones y cursores con PL/pgSQL | 756 | 1042 | OK | — |
| 897 | De SQL a Excel: reportes con tablas y fórmulas vivas | 897 | 838 | P1 | P2_prerrequisitos |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Depurar con evidencia, no con cambios aleatorios | 6 | 1279 | P1 | P2_prerrequisitos, P7_rutaflow |
| 125 | Pruebas con propósito y niveles adecuados | 125 | 1352 | P1 | P2_prerrequisitos, P7_rutaflow |
| 269 | Git como historial de decisiones y colaboración | 269 | 1286 | P1 | P2_prerrequisitos, P7_rutaflow |
| 407 | Calidad estática, revisión e integración continua | 407 | 1493 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Activos, amenazas, riesgos y límites de confianza | 6 | 3064 | P1 | P2_prerrequisitos |
| 272 | Identidad, contraseñas, sesiones y autorización | 272 | 2676 | P1 | P2_prerrequisitos |
| 578 | Criptografía aplicada, TLS, claves y secretos | 578 | 2943 | P1 | P2_prerrequisitos |
| 942 | Validación, vulnerabilidades web, privacidad y respuesta | 942 | 2792 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1197 | Ingeniería social, phishing y respuesta: analizar el correo, no solo mirarlo | 1197 | 3629 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Requisitos, stakeholders y criterios verificables | 6 | 976 | P1 | P7_rutaflow |
| 117 | Arquitectura guiada por atributos de calidad | 117 | 895 | P1 | P2_prerrequisitos, P7_rutaflow |
| 239 | Diseño modular, principios, patrones y refactoring | 239 | 1071 | P1 | P2_prerrequisitos, P7_rutaflow |
| 406 | Decisiones, documentación, deuda y evolución | 406 | 922 | OK | — |
| 473 | Records de C#: igualdad por valor no implica inmutabilidad profunda | 473 | 602 | P1 | P2_prerrequisitos, P7_rutaflow |
| 537 | Desarrollo guiado por especificación con agentes de IA | 537 | 1198 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | El sistema operativo como administrador y frontera | 8 | 974 | P1 | P2_prerrequisitos |
| 130 | Memoria y concurrencia sin magia | 130 | 1084 | P1 | P2_prerrequisitos, P7_rutaflow |
| 242 | Linux como entorno observable | 242 | 855 | P1 | P2_prerrequisitos |
| 320 | Contenedores: aislamiento reproducible | 320 | 1012 | P1 | P2_prerrequisitos |
| 446 | Problemas clásicos de concurrencia: filósofos y lectores-escritores | 446 | 949 | OK | — |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Lógica para especificar antes de programar | 8 | 1141 | P1 | P2_prerrequisitos |
| 154 | Conjuntos, relaciones, funciones e inducción | 154 | 901 | OK | — |
| 263 | Conteo, grafos y estructuras conectadas | 263 | 924 | P1 | P2_prerrequisitos |
| 390 | Probabilidad y evidencia para decisiones técnicas | 390 | 1148 | P1 | P2_prerrequisitos |

### Track: ios (69 temas en 15 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 24 | Optionals y unwrapping seguro | 24 | 1113 | P1 | P2_prerrequisitos, P7_rutaflow |
| 122 | struct vs class | 122 | 1097 | P1 | P2_prerrequisitos, P7_rutaflow |
| 230 | Protocolos y enums con valores asociados | 230 | 1000 | P1 | P2_prerrequisitos, P7_rutaflow |
| 317 | Closures, colecciones y genéricos con propósito | 317 | 1266 | P1 | P2_prerrequisitos, P7_rutaflow |
| 474 | Ownership en Swift: borrowing, consuming y tipos ~Copyable · Experto · 45 min | 474 | 876 | P2 | — |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El protocolo View y composición | 6 | 1426 | P1 | P2_prerrequisitos |
| 188 | Orden de modificadores y layout con stacks | 188 | 1212 | P1 | P2_prerrequisitos, P7_rutaflow |
| 325 | Previews, LazyVGrid/ScrollView y property wrappers | 325 | 1137 | P1 | P2_prerrequisitos |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Instruments | 8 | 795 | P1 | P2_prerrequisitos |
| 67 | Accesibilidad con VoiceOver | 67 | 708 | P1 | P2_prerrequisitos |
| 130 | Human Interface Guidelines, Dynamic Type e interop con UIKit | 130 | 858 | P1 | P2_prerrequisitos |
| 194 | UIKit desde cero para mantener aplicaciones reales | 194 | 1255 | P1 | P2_prerrequisitos |
| 375 | Localización con String Catalogs: textos, plurales y formatos por idioma · Intermedio · 40 min | 375 | 911 | OK | — |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Certificados y provisioning profiles | 8 | 920 | P1 | P2_prerrequisitos |
| 78 | Archivar, subir y TestFlight | 78 | 979 | P1 | P2_prerrequisitos |
| 153 | Metadata y versionado | 153 | 939 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Arquitectura del proyecto integrador | 8 | 954 | P1 | P2_prerrequisitos |
| 91 | Sincronización entre red y persistencia local | 91 | 1248 | P1 | P2_prerrequisitos, P7_rutaflow |
| 286 | Cierre del track | 286 | 936 | P1 | P2_prerrequisitos |
| 362 | Swift Package Manager: separar la app en paquetes locales y declarar dependencias · Avanzado · 45 min | 362 | 834 | OK | — |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | El sandbox reduce superficie, pero no valida intenciones | 10 | 918 | P1 | P2_prerrequisitos |
| 103 | Proteger datos es controlar todas sus copias | 103 | 997 | P1 | P2_prerrequisitos |
| 198 | Offline-first es un protocolo, no una caché | 198 | 1049 | OK | — |
| 307 | Operar significa detectar, limitar y aprender del fallo | 307 | 1027 | P1 | P2_prerrequisitos |
| 403 | Keychain — guardar secretos de forma segura | 403 | 660 | P1 | P2_prerrequisitos |
| 477 | Permisos y privacidad — pedir acceso con criterio | 477 | 681 | P1 | P2_prerrequisitos |
| 542 | Notificaciones push con APNs | 542 | 693 | P1 | P2_prerrequisitos |
| 612 | Core Location moderno: CLLocationUpdate, permisos y precisión · Avanzado · 45 min | 612 | 1013 | OK | — |
| 740 | BackgroundTasks: actualizar datos y sincronizar cuando el sistema lo permite · Avanzado · 45 min | 740 | 956 | OK | — |
| 877 | Face ID y Touch ID con LocalAuthentication: confirmar acciones sensibles · Intermedio · 35 min | 877 | 999 | OK | — |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Swift Testing y pruebas asíncronas | 8 | 1003 | P1 | P2_prerrequisitos |
| 153 | ViewInspector con criterio | 153 | 912 | P1 | P2_prerrequisitos |
| 264 | Combine avanzado | 264 | 650 | P1 | P2_prerrequisitos |
| 322 | Animaciones y matchedGeometryEffect | 322 | 639 | P1 | P2_prerrequisitos |
| 376 | UIViewRepresentable | 376 | 638 | P1 | P2_prerrequisitos |
| 438 | UIViewControllerRepresentable y Coordinator | 438 | 607 | P1 | P2_prerrequisitos |
| 502 | Core ML y Vision — inferencia en el dispositivo | 502 | 1145 | P1 | P2_prerrequisitos |
| 577 | Gestos en SwiftUI: arrastrar, mantener presionado y combinar gestos · Intermedio · 40 min | 577 | 943 | OK | — |
| 707 | WidgetKit: un widget con las entregas pendientes del día · Avanzado · 45 min | 707 | 1038 | OK | — |
| 853 | App Intents: acciones de la app en Siri, Atajos y Spotlight · Avanzado · 40 min | 853 | 937 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | @State y @Binding | 6 | 1121 | P1 | P2_prerrequisitos |
| 97 | @Observable | 97 | 891 | P1 | P2_prerrequisitos |
| 184 | @Environment y identidad vs valor | 184 | 1093 | P1 | P2_prerrequisitos |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | NavigationStack y NavigationPath | 8 | 725 | P1 | P2_prerrequisitos |
| 84 | Sheets, full screen covers y TabView | 84 | 802 | P1 | P2_prerrequisitos |
| 153 | Deep linking y controles de formulario | 153 | 883 | P1 | P2_prerrequisitos |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | async/await y Task | 8 | 888 | P1 | P2_prerrequisitos |
| 82 | Actors para estado mutable seguro | 82 | 797 | P1 | P2_prerrequisitos |
| 147 | TaskGroup y MainActor | 147 | 1032 | P1 | P2_prerrequisitos |
| 257 | Cancelación cooperativa: distinguir una tarea cancelada de un fallo de red | 257 | 469 | P1 | P2_prerrequisitos, P7_rutaflow |
| 316 | Swift 6: aislamiento, Sendable y data races detectadas al compilar · Experto · 50 min | 316 | 1028 | OK | — |
| 448 | AsyncSequence y AsyncStream: recibir valores en el tiempo con for await · Avanzado · 40 min | 448 | 941 | OK | — |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | URLSession con async/await y Codable | 8 | 776 | P1 | P2_prerrequisitos |
| 81 | Errores tipados | 81 | 805 | P1 | P2_prerrequisitos |
| 146 | Reintentos y cancelación | 146 | 1026 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | @Model y ModelContainer | 8 | 738 | P1 | P2_prerrequisitos |
| 82 | @Query y operaciones de escritura | 82 | 773 | P1 | P2_prerrequisitos |
| 157 | Migraciones y SwiftData vs Core Data | 157 | 967 | P1 | P2_prerrequisitos |
| 229 | CloudKit con SwiftData: sincronizar datos entre los dispositivos del usuario · Avanzado · 45 min | 229 | 903 | OK | — |
| 356 | Archivos en iOS: FileManager, carpetas de la app y fileImporter · Intermedio · 40 min | 356 | 1003 | OK | — |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Publishers y Subscribers | 8 | 725 | P1 | P2_prerrequisitos |
| 84 | Operadores: debounce y combineLatest | 84 | 758 | P1 | P2_prerrequisitos |
| 141 | Combine vs async/await | 141 | 919 | P1 | P2_prerrequisitos |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | De una vista "gorda" a MVVM | 8 | 856 | P1 | P2_prerrequisitos |
| 90 | Capas del proyecto e inyección por inicializador | 90 | 736 | P1 | P2_prerrequisitos, P7_rutaflow |
| 158 | Cuándo MVVM no alcanza | 158 | 934 | P1 | P2_prerrequisitos |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | XCTest clásico y Swift Testing | 8 | 949 | P1 | P2_prerrequisitos |
| 112 | Testing de código async | 112 | 870 | P1 | P2_prerrequisitos |
| 182 | UI Tests con XCUITest | 182 | 1072 | P1 | P2_prerrequisitos |

### Track: java (117 temas en 23 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 62 | Del código fuente a la JVM | 62 | 1036 | P1 | P2_prerrequisitos, P7_rutaflow |
| 205 | public static void main — qué significa cada palabra | 205 | 1222 | P1 | P2_prerrequisitos, P7_rutaflow |
| 363 | JDK, JRE y JVM | 363 | 519 | P1 | P2_prerrequisitos, P7_rutaflow |
| 470 | Tipos primitivos vs referencias | 470 | 1017 | P1 | P2_prerrequisitos, P6_modificacion |
| 625 | Variables, conversiones y `String` | 625 | 527 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 743 | Operadores, precedencia y control de flujo | 743 | 890 | P1 | P2_prerrequisitos, P7_rutaflow |
| 907 | Arreglos, wrappers y paso de argumentos | 907 | 535 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1020 | Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`) | 1020 | 534 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Clases, objetos, constructores y encapsulación | 6 | 1040 | P1 | P2_prerrequisitos, P7_rutaflow |
| 192 | Herencia y sobreescritura | 192 | 1117 | P1 | P2_prerrequisitos, P7_rutaflow |
| 402 | Interfaces, clases abstractas y cuándo usar cada una | 402 | 869 | P1 | P2_prerrequisitos, P7_rutaflow |
| 580 | Sobrecarga vs sobreescritura, y modificadores de acceso | 580 | 812 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | module-info.java y encapsulación fuerte | 6 | 564 | P1 | P2_prerrequisitos, P7_rutaflow |
| 100 | Migración incremental y cuándo JPMS aporta valor | 100 | 652 | P1 | P2_prerrequisitos, P7_rutaflow |
| 188 | opens para acceso reflexivo controlado de frameworks | 188 | 625 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Generaciones de memoria y recolectores | 6 | 600 | P1 | P2_prerrequisitos, P7_rutaflow |
| 104 | Java Flight Recorder y JIT compilation | 104 | 636 | P1 | P2_prerrequisitos, P7_rutaflow |
| 203 | Referencias especiales y heap dumps | 203 | 571 | P1 | P2_prerrequisitos, P7_rutaflow |
| 298 | Foreign Function & Memory API (Java 22) | 298 | 573 | P1 | P2_prerrequisitos |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Builder — configuración paso a paso y validación | 6 | 611 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 104 | Factory Method y Strategy | 104 | 628 | P1 | P2_prerrequisitos, P7_rutaflow |
| 206 | Abstract Factory y familias de productos compatibles | 206 | 618 | P1 | P2_prerrequisitos |
| 308 | SOLID y cuándo NO aplicar un patrón | 308 | 589 | P1 | P2_prerrequisitos, P7_rutaflow |
| 404 | Prototype: copiar un objeto sin compartir sus datos | 404 | 625 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 502 | Patrones estructurales para conectar piezas existentes | 502 | 546 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura por capas del proyecto integrador | 6 | 686 | P1 | P2_prerrequisitos, P7_rutaflow |
| 106 | Integrando concurrencia, modelado y testing | 106 | 678 | P1 | P2_prerrequisitos, P7_rutaflow |
| 205 | Build reproducible y cierre del track | 205 | 651 | P1 | P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Compartir memoria requiere orden y visibilidad | 8 | 656 | P1 | P2_prerrequisitos, P7_rutaflow |
| 110 | La JVM optimiza y puede invalidar un cronómetro ingenuo | 110 | 600 | P1 | P2_prerrequisitos, P7_rutaflow |
| 217 | Deserializar es permitir construcción y comportamiento | 217 | 609 | P1 | P2_prerrequisitos, P7_rutaflow |
| 313 | El runtime es parte del artefacto y necesita ciclo de vida | 313 | 525 | P1 | P2_prerrequisitos, P7_rutaflow |
| 401 | Arranque más rápido: archivos CDS y la caché AOT · Avanzado · 40 min | 401 | 938 | OK | — |
| 509 | Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps · Avanzado · 45 min | 509 | 925 | OK | — |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Maven avanzado | 7 | 563 | P1 | P7_rutaflow |
| 95 | Gradle y builds reproducibles | 95 | 567 | P1 | P2_prerrequisitos, P7_rutaflow |
| 184 | Proyectos multi-módulo sin ciclos | 184 | 553 | P1 | P2_prerrequisitos, P7_rutaflow |
| 283 | JUnit 5, Mockito y assertions expresivas | 283 | 566 | P1 | P2_prerrequisitos, P7_rutaflow |
| 386 | Pruebas de integración reproducibles | 386 | 574 | P1 | P2_prerrequisitos, P7_rutaflow |
| 491 | SLF4J, Logback, MDC y logging estructurado | 491 | 568 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Entidades y relaciones JPA | 14 | 567 | P1 | P2_prerrequisitos, P7_rutaflow |
| 124 | FetchType.LAZY, EAGER y el problema N+1 | 124 | 560 | P1 | P2_prerrequisitos, P7_rutaflow |
| 221 | Relaciones uno a uno, muchos a muchos y herencia | 221 | 565 | P1 | P2_prerrequisitos, P7_rutaflow |
| 325 | Ciclo de vida, EntityManager y consultas tipadas | 325 | 592 | P1 | P2_prerrequisitos, P7_rutaflow |
| 422 | Búsquedas dinámicas con Criteria y Querydsl | 422 | 596 | P1 | P2_prerrequisitos, P7_rutaflow |
| 523 | EntityGraph y cachés de persistencia | 523 | 580 | P1 | P2_prerrequisitos, P7_rutaflow |
| 623 | Concurrencia, transacciones y propagación | 623 | 592 | P1 | P2_prerrequisitos, P7_rutaflow |
| 725 | Migraciones y pruebas JPA con Testcontainers | 725 | 503 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | JDBC, PreparedStatement y DAO | 14 | 1086 | OK | — |
| 183 | Transacciones, ACID y aislamiento | 183 | 980 | OK | — |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | HttpClient, REST, timeouts y fallos | 14 | 1549 | OK | — |
| 308 | Tokens, validación y límites de seguridad | 308 | 1521 | OK | — |
| 548 | Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos · Avanzado · 45 min | 548 | 1121 | OK | — |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Reflexión y anotaciones en tiempo de ejecución | 6 | 1215 | P1 | P2_prerrequisitos |
| 213 | Expresiones regulares con Pattern y Matcher | 213 | 1164 | OK | — |
| 398 | Dinero exacto con BigDecimal | 398 | 1168 | P1 | P2_prerrequisitos |
| 582 | Assertions y diseño por contrato | 582 | 1305 | OK | — |
| 790 | ServiceLoader: plugins sin acoplar implementaciones | 790 | 1254 | P1 | P2_prerrequisitos |
| 1001 | Proxies dinámicos: así funcionan @Transactional y los mocks | 1001 | 1431 | OK | — |
| 1234 | Internacionalización: números, monedas, fechas y orden de texto | 1234 | 1235 | OK | — |
| 1428 | Carga de clases: cargadores, delegación y plugins con URLClassLoader · Avanzado · 45 min | 1428 | 1099 | OK | — |
| 1570 | MethodHandles y VarHandles: invocar métodos y cambiar campos con acceso tipado · Experto · 45 min | 1570 | 1020 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | List, Set, Map y sus implementaciones | 6 | 957 | P1 | P2_prerrequisitos, P7_rutaflow |
| 156 | Genéricos, wildcards y type erasure | 156 | 1377 | P1 | P7_rutaflow |
| 349 | Comparable vs Comparator, e iteración | 349 | 1366 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Las cuatro formas: Predicate, Function, Consumer y Supplier | 9 | 647 | P1 | P2_prerrequisitos, P7_rutaflow |
| 153 | Componer sin anidar: andThen, compose, negate y reglas encadenadas | 153 | 1093 | OK | — |
| 335 | Streams como composición: pereza, orden y efectos que se esconden | 335 | 1119 | P1 | P7_rutaflow |
| 530 | Function y BiFunction: transformar uno o dos datos | 530 | 672 | OK | — |
| 662 | UnaryOperator y BinaryOperator: la salida conserva el tipo | 662 | 642 | OK | — |
| 793 | Referencias a métodos: escribir la operación sin repetirla | 793 | 669 | OK | — |
| 930 | Optional: buscar un envío que puede no existir | 930 | 684 | OK | — |
| 1067 | Streams intermedios: filtrar, transformar, aplanar y ordenar | 1067 | 660 | OK | — |
| 1200 | Streams terminales: encontrar, contar y combinar resultados | 1200 | 559 | OK | — |
| 1324 | Collectors: formar listas, mapas, grupos y texto | 1324 | 577 | OK | — |
| 1457 | Streams paralelos: comparar antes de acelerarlos | 1457 | 665 | OK | — |
| 1587 | Pureza y efectos: calcular separado de guardar o imprimir | 1587 | 657 | OK | — |
| 1715 | Flow API: publicar datos con demanda y cierre | 1715 | 781 | OK | — |
**modulo-21**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Qué es la superficie pública de una API · Básico · 40 min | 9 | 2091 | P1 | P7_rutaflow |
| 243 | Compatibilidad binaria frente a compatibilidad de fuente · Intermedio · 45 min | 243 | 1951 | P1 | P7_rutaflow |
| 430 | Evolucionar sin romper: default methods, deprecación y retirada · Intermedio · 45 min | 430 | 2068 | P1 | P7_rutaflow |
| 701 | Genéricos, borrado y métodos puente en la superficie pública · Avanzado · 50 min | 701 | 1833 | P1 | P7_rutaflow |
| 909 | Verificar la compatibilidad en el build · Avanzado · 50 min | 909 | 1778 | P1 | P7_rutaflow |
**modulo-22**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | El contrato de equals y hashCode · Básico · 35 min | 9 | 2282 | P1 | P7_rutaflow |
| 247 | Claves mutables y el mapa que pierde entradas · Intermedio · 40 min | 247 | 1960 | P1 | P7_rutaflow |
| 436 | Copia defensiva, copia superficial y clone · Intermedio · 40 min | 436 | 2191 | P1 | P7_rutaflow |
| 718 | Enums de dominio: estado, código y comportamiento · Intermedio · 45 min | 718 | 2110 | P1 | P7_rutaflow |
| 952 | Clases anidadas, this$0 y la referencia que retiene · Avanzado · 45 min | 952 | 2044 | P1 | P7_rutaflow |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Checked vs unchecked exceptions | 6 | 946 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 181 | try-with-resources | 181 | 999 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 385 | Excepciones personalizadas y no tragar excepciones | 385 | 1267 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Stream API — map, filter, reduce, collect | 6 | 723 | P1 | P2_prerrequisitos, P7_rutaflow |
| 147 | Optional — evitar null explícitamente | 147 | 522 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 279 | Streams paralelos y referencias a métodos | 279 | 530 | P1 | P6_modificacion, P7_rutaflow |
| 398 | Stream Gatherers (Java 24) | 398 | 695 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | ExecutorService y gestión de hilos | 6 | 506 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 132 | CompletableFuture | 132 | 514 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 247 | Virtual threads | 247 | 609 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 371 | Condiciones de carrera y sincronización | 371 | 645 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 485 | Structured Concurrency (StructuredTaskScope, Java 25) | 485 | 647 | P1 | P2_prerrequisitos, P7_rutaflow |
| 604 | Scoped Values frente a ThreadLocal (Java 25) | 604 | 532 | P1 | P2_prerrequisitos, P7_rutaflow |
| 751 | Timeouts y cancelación cooperativa sin abandonar recursos | 751 | 712 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | NIO.2 — Path y Files | 6 | 530 | P1 | P2_prerrequisitos, P7_rutaflow |
| 141 | Serialización con Jackson | 141 | 575 | P1 | P2_prerrequisitos |
| 278 | Archivos grandes y recursos del classpath | 278 | 626 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | record — modelos inmutables sin boilerplate | 6 | 523 | P1 | P2_prerrequisitos, P7_rutaflow |
| 107 | sealed — jerarquías cerradas y exhaustividad | 107 | 534 | P1 | P2_prerrequisitos, P6_modificacion |
| 215 | Pattern matching exhaustivo y para instanceof | 215 | 515 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 317 | Unnamed variables y patterns (_, Java 22) | 317 | 551 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | pom.xml vs build.gradle.kts | 6 | 534 | P1 | P2_prerrequisitos, P7_rutaflow |
| 102 | Ciclo de vida de build y scopes | 102 | 563 | P1 | P2_prerrequisitos, P7_rutaflow |
| 201 | Proyectos multi-módulo | 201 | 582 | P1 | P2_prerrequisitos, P7_rutaflow |
| 294 | Maven y Gradle lado a lado — el mismo proyecto en dos herramientas | 294 | 575 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | JUnit 5 — anotaciones y ciclo de vida | 6 | 584 | P1 | P2_prerrequisitos, P7_rutaflow |
| 102 | Mockito — aislar dependencias | 102 | 560 | P1 | P2_prerrequisitos, P7_rutaflow |
| 205 | Tests parametrizados y cobertura | 205 | 587 | P1 | P2_prerrequisitos, P7_rutaflow |
| 304 | Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 45 min | 304 | 1226 | OK | — |

### Track: javascript (92 temas en 15 módulos)

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
| 552 | Decoradores estándar de TypeScript 5 | 552 | 818 | OK | — |
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
| 8 | TypeScript avanzado | 8 | 799 | P1 | P7_rutaflow |
| 130 | Workers y ejecución fuera del hilo principal | 130 | 789 | P1 | P2_prerrequisitos, P7_rutaflow |
| 263 | Bundlers y optimización | 263 | 793 | P1 | P7_rutaflow |
| 394 | Accesibilidad web | 394 | 790 | P1 | P2_prerrequisitos, P7_rutaflow |
| 540 | WebAssembly con Rust o C | 540 | 814 | P1 | P7_rutaflow |
| 681 | Web3 y machine learning en navegador | 681 | 690 | P1 | P7_rutaflow |
| 767 | Geolocalización, permisos y precisión GPS | 767 | 597 | P1 | P7_rutaflow |
| 879 | sessionStorage, cookies e IndexedDB | 879 | 565 | P1 | P7_rutaflow |
| 976 | Expresiones regulares avanzadas y Unicode | 976 | 553 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1068 | Patrones Factory, Strategy, Observer y Pub/Sub | 1068 | 522 | P1 | P7_rutaflow |
| 1163 | Service Workers, PWA y estrategias de caché | 1163 | 706 | P1 | P7_rutaflow |
| 1288 | WebSocket y comunicación en tiempo real | 1288 | 565 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1410 | Typed Arrays, ArrayBuffer y DataView | 1410 | 467 | P1 | P7_rutaflow |
| 1500 | ECMAScript moderno, Temporal e iterator helpers | 1500 | 625 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1598 | Gestión explícita de recursos: using, await using y DisposableStack · Avanzado · 40 min | 1598 | 976 | OK | — |
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
| 539 | Streams web: leer una respuesta de fetch por partes · Intermedio · 40 min | 539 | 988 | OK | — |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | ESM frente a CommonJS | 6 | 1095 | P1 | P7_rutaflow |
| 126 | Tree-shaking y code-splitting | 126 | 1143 | P1 | P2_prerrequisitos, P7_rutaflow |
| 248 | Vite y esbuild | 248 | 1082 | P1 | P7_rutaflow |
| 367 | package.json — exports, type y scripts | 367 | 1013 | P1 | P7_rutaflow |
| 473 | import() dinámico e import.meta | 473 | 996 | P1 | P7_rutaflow |
| 574 | Webpack, Rollup y Babel/SWC | 574 | 1085 | P1 | P7_rutaflow |
| 692 | Módulos ES a fondo: top-level await, ciclos de importación e import maps · Avanzado · 45 min | 692 | 1224 | OK | — |
| 848 | Cadena de suministro npm: lockfile, integridad y paquetes alterados · Avanzado · 45 min | 848 | 1062 | OK | — |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Selección y manipulación del DOM | 6 | 1150 | P1 | P6_modificacion, P7_rutaflow |
| 132 | Delegación de eventos | 132 | 1076 | P1 | P2_prerrequisitos, P7_rutaflow |
| 242 | Formularios y validación nativa | 242 | 1001 | P1 | P7_rutaflow |
| 344 | Web APIs — localStorage e IntersectionObserver | 344 | 1037 | P1 | P7_rutaflow |
| 448 | ResizeObserver y MutationObserver | 448 | 1027 | P1 | P2_prerrequisitos, P7_rutaflow |
| 541 | requestAnimationFrame y requestIdleCallback | 541 | 1106 | P1 | P7_rutaflow |
| 686 | Formularios accesibles: validar, anunciar y conservar la entrada | 686 | 520 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Unit testing con Vitest | 6 | 989 | P1 | P7_rutaflow |
| 111 | Mocks, spies y fakes | 111 | 1034 | P1 | P2_prerrequisitos, P7_rutaflow |
| 207 | Mockear fetch | 207 | 973 | P1 | P7_rutaflow |
| 314 | ESLint, Prettier y cobertura de código | 314 | 1022 | P1 | P2_prerrequisitos, P7_rutaflow |

### Track: kotlin-multiplatform (66 temas en 14 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 30 | Null safety real | 30 | 1118 | P1 | P7_rutaflow |
| 160 | data class y funciones de extensión | 160 | 945 | P1 | P7_rutaflow |
| 286 | when como expresión | 286 | 1113 | P1 | P7_rutaflow |
| 434 | Destructuring declarations y rangos | 434 | 1104 | P1 | P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Funciones de orden superior | 8 | 941 | P1 | P7_rutaflow |
| 127 | Scope functions | 127 | 1033 | P1 | P7_rutaflow |
| 256 | Sealed classes y colecciones funcionales | 256 | 1019 | P1 | P7_rutaflow |
| 399 | Lambdas con receptor y builders tipo DSL | 399 | 1111 | P1 | P7_rutaflow |
| 531 | Genéricos en Kotlin: varianza con in y out, restricciones y reified · Avanzado · 45 min | 531 | 1010 | OK | — |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Pipeline Gradle multiplataforma en CI | 6 | 1085 | OK | — |
| 110 | Fastlane | 110 | 1021 | P1 | P2_prerrequisitos |
| 191 | Versionado compartido | 191 | 803 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Arquitectura del proyecto integrador | 6 | 931 | P1 | P2_prerrequisitos, P7_rutaflow |
| 83 | Sincronización de datos remotos con caché local | 83 | 1151 | P1 | P2_prerrequisitos |
| 174 | Cierre del track — la promesa realista de KMP | 174 | 1068 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | La mejor frontera compartida es deliberadamente pequeña | 8 | 1090 | OK | — |
| 110 | Garbage collection no cierra sockets ni rompe ciclos externos | 110 | 1037 | P1 | P2_prerrequisitos |
| 196 | Un artefacto compatible necesita más que el mismo número de versión | 196 | 1168 | P1 | P2_prerrequisitos |
| 309 | Un fallo compartido necesita símbolos y contexto de ambas plataformas | 309 | 997 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Kotlin/Native | 6 | 596 | P1 | P2_prerrequisitos, P7_rutaflow |
| 50 | Interop con C | 50 | 584 | P1 | P2_prerrequisitos, P7_rutaflow |
| 93 | Swift Export | 93 | 784 | P1 | P2_prerrequisitos |
| 145 | XCFramework y API pública | 145 | 677 | P1 | P2_prerrequisitos, P7_rutaflow |
| 200 | Publicación en Maven Central | 200 | 569 | P1 | P2_prerrequisitos |
| 248 | Compatibilidad binaria y CI multi-target | 248 | 654 | P1 | P2_prerrequisitos, P7_rutaflow |
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
| 474 | Version catalogs y convention plugins: una sola fuente de versiones y configuración de Gradle · Avanzado · 45 min | 474 | 927 | OK | — |
| 630 | Más allá del móvil: targets JVM, JS y Wasm desde el mismo código común · Avanzado · 45 min | 630 | 943 | OK | — |
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
| 598 | Seguridad multiplataforma: guardar secretos con Keystore y Keychain detrás de una interfaz común · Avanzado · 45 min | 598 | 1278 | OK | — |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Compose Multiplatform vs Jetpack Compose | 8 | 1058 | P1 | P7_rutaflow |
| 138 | Estado y recomposición — mutableStateOf y por qué la UI se redibuja | 138 | 1272 | P1 | P7_rutaflow |
| 316 | Theming y navegación compartidos | 316 | 1060 | P1 | P7_rutaflow |
| 462 | Limitaciones en iOS y otros targets | 462 | 1246 | P1 | P7_rutaflow |
| 598 | Recursos y localización en Compose Multiplatform: textos, imágenes y plurales comunes · Intermedio · 40 min | 598 | 827 | OK | — |
| 740 | Deep links en Compose Multiplatform: abrir una pantalla desde un enlace · Avanzado · 45 min | 740 | 934 | OK | — |
| 887 | Accesibilidad en Compose Multiplatform: semántica que funciona con TalkBack y VoiceOver · Intermedio · 40 min | 887 | 952 | OK | — |
| 1032 | Compose Hot Reload: ver cambios de la interfaz sin reiniciar la app · Intermedio · 30 min | 1032 | 949 | OK | — |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | El framework generado para iOS | 6 | 950 | OK | — |
| 141 | Mapeo de tipos Kotlin ↔ Swift | 141 | 1062 | P1 | P2_prerrequisitos, P7_rutaflow |
| 215 | Coroutines desde Swift, y distribución del framework | 215 | 1231 | P1 | P2_prerrequisitos, P7_rutaflow |
| 330 | Compose Multiplatform dentro de SwiftUI y vistas UIKit dentro de Compose · Avanzado · 45 min | 330 | 941 | OK | — |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | kotlin.test en commonTest | 6 | 899 | P1 | P2_prerrequisitos, P7_rutaflow |
| 82 | Fakes en vez de mocks | 82 | 955 | P1 | P2_prerrequisitos |
| 148 | runTest para coroutines | 148 | 929 | P1 | P2_prerrequisitos |
| 226 | Benchmarks multiplataforma con kotlinx-benchmark: medir el mismo código en cada target · Avanzado · 40 min | 226 | 930 | P2 | — |

### Track: microservices (24 temas en 2 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 13 | Ejecutar dos procesos Java y comprobar su socket HTTP · Básico · 45 min | 13 | 1033 | OK | — |
| 143 | Imponer un presupuesto temporal a una solicitud HTTP · Intermedio · 45 min | 143 | 1590 | OK | — |
| 328 | Propagar un deadline absoluto entre servicios HTTP · Intermedio · 45 min | 328 | 1442 | OK | — |
| 534 | Clasificar un resultado desconocido antes de reintentar · Avanzado · 45 min | 534 | 778 | OK | — |
| 622 | Evitar efectos duplicados con una clave idempotente · Avanzado · 45 min | 622 | 1265 | OK | — |
| 766 | Seleccionar un reloj según la evidencia temporal · Avanzado · 40 min | 766 | 808 | OK | — |
| 857 | Preservar el orden de eventos por versión del agregado · Avanzado · 45 min | 857 | 792 | OK | — |
| 960 | Evolucionar un contrato JSON sin romper consumidores · Experto · 45 min | 960 | 720 | OK | — |
| 1061 | Rechazar un frame excesivo antes de reservar memoria · Experto · 35 min | 1061 | 730 | OK | — |
| 1155 | Refutar falacias distribuidas mediante evidencia reproducible · Experto · 45 min | 1155 | 695 | OK | — |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 11 | Distinguir estructura lógica de unidad de despliegue · Básico · 40 min | 11 | 684 | OK | — |
| 108 | Evaluar autonomía antes de extraer un proceso · Básico · 45 min | 108 | 606 | P1 | P7_rutaflow |
| 194 | Agrupar código por capacidad de negocio · Intermedio · 40 min | 194 | 614 | OK | — |
| 276 | Proteger la API pública de un módulo · Intermedio · 45 min | 276 | 633 | OK | — |
| 362 | Mantener reglas de dominio libres de frameworks · Intermedio · 40 min | 362 | 566 | OK | — |
| 441 | Sustituir adaptadores mediante puertos · Intermedio · 45 min | 441 | 612 | OK | — |
| 521 | Representar dependencias de módulos como un grafo · Avanzado · 35 min | 521 | 549 | OK | — |
| 590 | Romper ciclos según el tipo de acoplamiento · Avanzado · 45 min | 590 | 526 | OK | — |
| 655 | Bloquear accesos a internals con ArchUnit · Avanzado · 40 min | 655 | 568 | OK | — |
| 741 | Detectar ciclos de paquetes con ArchUnit · Avanzado · 35 min | 741 | 615 | OK | — |
| 806 | Evitar falsos verdes en fitness functions · Avanzado · 35 min | 806 | 642 | OK | — |
| 864 | Medir señales que justifican una extracción · Experto · 40 min | 864 | 576 | OK | — |
| 929 | Registrar una decisión reversible en un ADR · Experto · 40 min | 929 | 537 | OK | — |
| 1002 | Separar mitos y verdades de Domain-Driven Design · Avanzado · 40 min | 1002 | 1163 | OK | — |

### Track: node (90 temas en 16 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 23 | Node no es "JavaScript en el servidor" sin más · Básico · 75 min | 23 | 790 | P1 | P2_prerrequisitos, P7_rutaflow |
| 118 | Fases del Event Loop de Node · Intermedio · 75 min | 118 | 743 | P1 | P2_prerrequisitos, P7_rutaflow |
| 207 | process, global y módulos core · Básico · 75 min | 207 | 763 | P1 | P2_prerrequisitos, P7_rutaflow |
| 336 | Event-driven architecture y non-blocking I/O · Intermedio · 75 min | 336 | 804 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | package.json y semver · Básico · 50 min | 6 | 1050 | P1 | P7_rutaflow |
| 137 | Lockfiles e instalación reproducible · Básico · 50 min | 137 | 922 | P1 | P7_rutaflow |
| 246 | Workspaces — monorepos con npm/pnpm · Intermedio · 60 min | 246 | 983 | P1 | P7_rutaflow |
| 389 | Scripts de ciclo de vida · Intermedio · 50 min | 389 | 903 | P1 | P7_rutaflow |
| 500 | Publicar y versionar un paquete npm (público o privado) · Intermedio · 60 min | 500 | 1139 | P2 | — |
| 666 | ESM y CommonJS en el mismo proyecto · Intermedio · 60 min | 666 | 1051 | P1 | P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 5 | Cabeceras seguras con helmet · Intermedio · 55 min | 5 | 810 | P1 | P7_rutaflow |
| 103 | Rate limiting · Intermedio · 55 min | 103 | 962 | P1 | P7_rutaflow |
| 201 | Inyección SQL y sanitización contra XSS · Intermedio · 65 min | 201 | 1011 | P1 | P7_rutaflow |
| 313 | OWASP API Security Top 10 y auditoría de dependencias · Intermedio · 65 min | 313 | 1184 | P1 | P7_rutaflow |
| 453 | CVE, CWE y npm audit en el pipeline · Avanzado · 70 min | 453 | 1289 | P1 | P7_rutaflow |
| 634 | Modelo de permisos de Node: limitar archivos, procesos y workers · Avanzado · 35 min | 634 | 904 | OK | — |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 5 | Dockerfile multi-stage para Node · Intermedio · 75 min | 5 | 865 | P1 | P7_rutaflow |
| 157 | Variables de entorno por ambiente y healthchecks · Intermedio · 70 min | 157 | 1060 | P1 | P7_rutaflow |
| 332 | PM2, contenedores y zero-downtime deploys · Avanzado · 85 min | 332 | 1058 | P1 | P7_rutaflow |
| 498 | Nginx como reverse proxy y serverless · Avanzado · 85 min | 498 | 1122 | P1 | P7_rutaflow |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Arquitectura por capas · Intermedio · 90 min | 9 | 1316 | P1 | P2_prerrequisitos, P7_rutaflow |
| 260 | Uniendo cada módulo del track · Avanzado · 180 min | 260 | 1926 | P1 | P2_prerrequisitos, P7_rutaflow |
| 685 | Qué le falta a esta API para producción real · Intermedio · 75 min | 685 | 962 | P1 | P2_prerrequisitos, P7_rutaflow |
| 849 | Próximos pasos — microservicios, colas de mensajes y TypeScript · Intermedio · 75 min | 849 | 1104 | P1 | P7_rutaflow |
| 997 | Posiciones espaciales y Socket.IO con orden recuperable · Avanzado · 150 min | 997 | 1874 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1340 | Archivos y notificaciones push sin convertirlos en autorización · Avanzado · 150 min | 1340 | 1767 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Tipos estáticos dentro, datos desconocidos en la frontera · Intermedio · 90 min | 9 | 1226 | P1 | P2_prerrequisitos |
| 200 | Un contrato HTTP es comportamiento, no solo documentación · Avanzado · 90 min | 200 | 1566 | P1 | P2_prerrequisitos, P7_rutaflow |
| 500 | Reintentar sin duplicar el efecto · Avanzado · 120 min | 500 | 1929 | P1 | P2_prerrequisitos |
| 870 | Webhooks verificables y recuperación por reconciliación · Avanzado · 100 min | 870 | 1299 | P1 | P2_prerrequisitos, P7_rutaflow |
| 1090 | OpenAPI como contrato ejecutable · Avanzado · 100 min | 1090 | 1503 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | TypeScript en Node.js | 7 | 803 | P1 | P2_prerrequisitos, P7_rutaflow |
| 81 | GraphQL avanzado y Federation | 81 | 794 | P1 | P7_rutaflow |
| 147 | Compensar una entrega cuando falla un paso | 147 | 680 | P1 | P2_prerrequisitos |
| 217 | Serverless multi-cloud | 217 | 753 | P1 | P2_prerrequisitos, P7_rutaflow |
| 302 | Docker productivo con Node | 302 | 751 | P1 | P2_prerrequisitos, P7_rutaflow |
| 388 | CI/CD y promoción de artefactos | 388 | 787 | P1 | P2_prerrequisitos, P7_rutaflow |
| 477 | Kafka desde Node: clave, grupo consumidor y offset | 477 | 614 | P1 | P2_prerrequisitos, P6_modificacion |
| 564 | RabbitMQ desde Node: exchange, cola y confirmaciones | 564 | 616 | P1 | P2_prerrequisitos |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Deno y permisos explícitos | 7 | 553 | P1 | P2_prerrequisitos |
| 69 | Bun reúne runtime, paquetes, pruebas y bundler | 69 | 575 | P1 | P2_prerrequisitos |
| 145 | Migrar un proyecto Node a Bun sin perder reproducibilidad | 145 | 545 | P1 | P2_prerrequisitos |
| 202 | Elegir entre Node, Deno y Bun | 202 | 642 | OK | — |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | fs/promises frente a callbacks · Intermedio · 45 min | 6 | 1199 | P1 | P7_rutaflow |
| 158 | Streams básicos: Readable, Writable y Transform · Intermedio · 60 min | 158 | 1129 | P1 | P7_rutaflow |
| 323 | Backpressure: write() y el evento drain · Avanzado · 55 min | 323 | 1007 | P1 | P7_rutaflow |
| 475 | pipeline() para componer streams de forma segura · Avanzado · 60 min | 475 | 1108 | P1 | P7_rutaflow |
| 633 | Buffer, Blob y las Web APIs de Node: bytes, codificaciones y código compartido con el navegador · Intermedio · 40 min | 633 | 1039 | OK | — |
| 756 | Compresión con zlib: gzip y Brotli por streams · Intermedio · 35 min | 756 | 913 | OK | — |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | El modelo request/response · Básico · 60 min | 7 | 547 | P1 | P2_prerrequisitos, P7_rutaflow |
| 93 | Routing manual · Básico · 75 min | 93 | 673 | P1 | P2_prerrequisitos, P7_rutaflow |
| 202 | Parsing de body y headers · Intermedio · 75 min | 202 | 618 | P1 | P2_prerrequisitos, P7_rutaflow |
| 312 | Códigos de estado y content negotiation · Intermedio · 75 min | 312 | 585 | P1 | P2_prerrequisitos, P7_rutaflow |
| 407 | Paginación por cursor y límites de entrada comprobables · Intermedio · 60 min | 407 | 613 | P1 | P2_prerrequisitos, P7_rutaflow |
| 501 | HTTPS y HTTP/2 con TLS: certificados, ALPN y varias peticiones por conexión · Avanzado · 45 min | 501 | 1051 | OK | — |
| 635 | Debajo de HTTP: TCP con net, UDP con dgram y resolución DNS · Intermedio · 40 min | 635 | 1004 | OK | — |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Middleware — orden de ejecución y next() · Básico · 75 min | 7 | 920 | P1 | P2_prerrequisitos, P7_rutaflow |
| 124 | Routers anidados · Básico · 75 min | 124 | 908 | P1 | P2_prerrequisitos, P7_rutaflow |
| 256 | Validación de entrada con Zod y manejo centralizado de errores · Intermedio · 75 min | 256 | 960 | P1 | P2_prerrequisitos, P7_rutaflow |
| 388 | Express frente a Fastify · Intermedio · 75 min | 388 | 996 | P1 | P2_prerrequisitos, P7_rutaflow |
| 528 | WebSocket — comunicación en tiempo real bidireccional · Intermedio · 75 min | 528 | 810 | P1 | P2_prerrequisitos, P7_rutaflow |
| 626 | Subida de archivos — multipart y validación segura · Intermedio · 75 min | 626 | 1087 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | PostgreSQL desde Node con el driver puro · Básico · 90 min | 7 | 1130 | P1 | P2_prerrequisitos, P7_rutaflow |
| 176 | Prisma — schema, migraciones y queries tipadas · Intermedio · 90 min | 176 | 1222 | P1 | P2_prerrequisitos, P7_rutaflow |
| 358 | Pool de conexiones y transacciones · Intermedio · 90 min | 358 | 1276 | P1 | P2_prerrequisitos, P7_rutaflow |
| 544 | MongoDB con Mongoose y otras alternativas de ORM · Intermedio · 75 min | 544 | 926 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Hashing de contraseñas · Intermedio · 90 min | 9 | 990 | P1 | P2_prerrequisitos, P7_rutaflow |
| 125 | JWT — access y refresh tokens · Intermedio · 90 min | 125 | 926 | P1 | P2_prerrequisitos |
| 233 | Middleware de autenticación y control de roles · Intermedio · 90 min | 233 | 1088 | P1 | P2_prerrequisitos |
| 426 | OAuth 2.0 y Passport.js · Intermedio · 75 min | 426 | 932 | P1 | P2_prerrequisitos, P7_rutaflow |
| 524 | Sesiones, cookies seguras y protección CSRF · Intermedio · 105 min | 524 | 1317 | P1 | P2_prerrequisitos, P7_rutaflow |
| 761 | Flujo de login completo — de `/api/auth/login` a una ruta protegida · Intermedio · 105 min | 761 | 1230 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 5 | Vitest y Supertest — pruebas de integración HTTP reales · Intermedio · 50 min | 5 | 791 | P1 | P7_rutaflow |
| 135 | Testcontainers — bases de datos de prueba reales y efímeras · Intermedio · 55 min | 135 | 915 | P1 | P7_rutaflow |
| 280 | Mocks de servicios externos y CI · Intermedio · 50 min | 280 | 1001 | P1 | P7_rutaflow |
| 430 | Alternativas de testing y debugging · Intermedio · 45 min | 430 | 751 | P1 | P7_rutaflow |
| 549 | node:test — test runner nativo sin dependencias · Intermedio · 40 min | 549 | 768 | P1 | P7_rutaflow |
| 688 | TDD práctico: rojo, verde y refactor con node:test · Intermedio · 60 min | 688 | 1149 | P1 | P7_rutaflow |
| 859 | Cobertura de pruebas con node:test: líneas, ramas y umbrales · Intermedio · 35 min | 859 | 912 | OK | — |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 5 | Worker Threads para trabajo CPU-bound · Intermedio · 45 min | 5 | 891 | P1 | P7_rutaflow |
| 115 | Cluster module y balanceo entre procesos · Intermedio · 45 min | 115 | 927 | P1 | P7_rutaflow |
| 232 | Colas de trabajo con BullMQ · Intermedio · 50 min | 232 | 945 | P1 | P7_rutaflow |
| 371 | PM2, memory leaks y heap snapshots · Intermedio · 50 min | 371 | 933 | P1 | P7_rutaflow |
| 495 | Redis para caché, idempotencia y Pub/Sub · Intermedio · 50 min | 495 | 1003 | P1 | P7_rutaflow |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 5 | Logging estructurado · Intermedio · 45 min | 5 | 778 | P1 | P7_rutaflow |
| 127 | Correlation ID por request · Intermedio · 45 min | 127 | 791 | P1 | P1_resultado, P7_rutaflow |
| 249 | Excepciones no capturadas y graceful shutdown · Avanzado · 60 min | 249 | 1035 | P1 | P1_resultado, P7_rutaflow |
| 411 | REST, GraphQL y gRPC · Intermedio · 55 min | 411 | 969 | P1 | P1_resultado, P7_rutaflow |
| 597 | Métricas Prometheus y trazas distribuidas con OpenTelemetry · Avanzado · 75 min | 597 | 1041 | P1 | P7_rutaflow |
| 789 | Contexto por petición con AsyncLocalStorage y eventos con diagnostics_channel · Avanzado · 45 min | 789 | 1062 | OK | — |

### Track: react (64 temas en 15 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 29 | JSX es azúcar sintáctica sobre createElement | 29 | 978 | P1 | P2_prerrequisitos |
| 110 | Listas con key estable | 110 | 1285 | P1 | P2_prerrequisitos |
| 215 | Composición sobre herencia, y Fragments | 215 | 1199 | P1 | P2_prerrequisitos |
| 325 | Renderizado condicional y estilos | 325 | 866 | P1 | P2_prerrequisitos |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | useState y actualizaciones funcionales | 8 | 1406 | P1 | P2_prerrequisitos |
| 125 | Render frente a commit | 125 | 1019 | P1 | P2_prerrequisitos |
| 214 | Batching de actualizaciones | 214 | 900 | P1 | P2_prerrequisitos |
| 299 | Componentes controlados | 299 | 635 | P1 | P2_prerrequisitos |
| 373 | Componentes puros y el estado como instantánea · Básico · 40 min | 373 | 1046 | OK | — |
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
| 107 | Hooks genéricos | 107 | 878 | P1 | P2_prerrequisitos |
| 178 | Eventos tipados y componentes polimórficos | 178 | 1120 | P1 | P2_prerrequisitos |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Estructura del proyecto integrador | 8 | 835 | P1 | P2_prerrequisitos |
| 114 | Integrando rutas, TanStack Query y Zustand | 114 | 868 | P1 | P2_prerrequisitos |
| 180 | useTareas — hook dedicado con TanStack Query | 180 | 582 | P1 | P2_prerrequisitos |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Diseñar estados de carga, error y recuperación | 10 | 1047 | P1 | P2_prerrequisitos |
| 134 | La composición visual debe conservar semántica y foco | 134 | 903 | P1 | P2_prerrequisitos |
| 225 | Cliente y servidor forman una sola frontera de seguridad | 225 | 926 | P1 | P2_prerrequisitos |
| 311 | Hidratación determinista, idioma y releases medibles | 311 | 944 | P1 | P2_prerrequisitos, P7_rutaflow |
| 404 | Migrar a React 19: codemods, cambios que rompen y verificación · Avanzado · 45 min | 404 | 968 | OK | — |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Server Components y streaming | 6 | 915 | P1 | P2_prerrequisitos, P7_rutaflow |
| 122 | Server Actions y seguridad | 122 | 850 | P1 | P2_prerrequisitos, P7_rutaflow |
| 193 | Next.js ISR, Metadata y Middleware | 193 | 817 | P1 | P2_prerrequisitos, P7_rutaflow |
| 299 | Optimización de imágenes y fuentes | 299 | 667 | P1 | P2_prerrequisitos, P7_rutaflow |
| 362 | Accesibilidad y React Aria | 362 | 715 | P1 | P2_prerrequisitos, P7_rutaflow |
| 430 | i18n, pluralización y RTL | 430 | 818 | P1 | P2_prerrequisitos |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | useEffect — dependencias y limpieza | 8 | 975 | P1 | P2_prerrequisitos |
| 91 | useRef — valores mutables sin re-render | 91 | 850 | P1 | P2_prerrequisitos |
| 168 | useMemo y useCallback con criterio | 168 | 1036 | P1 | P2_prerrequisitos |
| 257 | Reglas de los hooks, useReducer y useImperativeHandle | 257 | 1095 | P1 | P2_prerrequisitos |
| 340 | Error Boundaries — contener errores de render sin romper toda la app | 340 | 810 | P1 | P2_prerrequisitos |
| 462 | Efectos cancelables: impedir que una respuesta antigua sobrescriba la selección actual | 462 | 515 | P1 | P2_prerrequisitos, P7_rutaflow |
| 526 | useLayoutEffect y useEffectEvent: medir antes de pintar y leer valores sin reconectar · Avanzado · 45 min | 526 | 1128 | OK | — |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | React Hook Form y el problema del re-render por tecla | 8 | 980 | P1 | P2_prerrequisitos |
| 93 | Validación con zod y formularios multi-paso | 93 | 976 | P1 | P2_prerrequisitos |
| 165 | Eventos sintéticos | 165 | 552 | P1 | P2_prerrequisitos |
| 229 | Formularios con Actions: useActionState y useOptimistic · Avanzado · 45 min | 229 | 991 | OK | — |
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
| 103 | Loaders — datos antes de renderizar | 103 | 896 | P1 | P2_prerrequisitos |
| 174 | Rutas protegidas y code-splitting por ruta | 174 | 660 | P1 | P2_prerrequisitos |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | useQuery y el problema que resuelve | 8 | 1081 | P1 | P2_prerrequisitos |
| 125 | Mutations e invalidación | 125 | 981 | P1 | P2_prerrequisitos |
| 222 | Optimistic updates | 222 | 1191 | P1 | P2_prerrequisitos |
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
| 152 | Testing de hooks personalizados | 152 | 935 | P1 | P2_prerrequisitos |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Medir antes de optimizar | 8 | 839 | P1 | P2_prerrequisitos |
| 92 | React.memo con criterio | 92 | 901 | P1 | P2_prerrequisitos |
| 159 | Virtualización y code-splitting | 159 | 824 | P1 | P2_prerrequisitos |
| 220 | useTransition, useDeferredValue y Fiber | 220 | 949 | P1 | P2_prerrequisitos |
| 297 | Suspense y React.lazy — carga diferida del lado cliente | 297 | 762 | P1 | P2_prerrequisitos |
| 365 | El hook use: leer una promesa con Suspense y un contexto de forma condicional · Avanzado · 40 min | 365 | 1024 | OK | — |
| 490 | React Compiler y las reglas de React: memoización automática · Avanzado · 45 min | 490 | 1019 | OK | — |

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
| 144 | Mapas operativos | 144 | 1228 | OK | — |
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
| 376 | Socket.IO extremo a extremo: un gateway compatible con el cliente móvil | 376 | 1244 | P1 | P2_prerrequisitos |
| 540 | OSRM: del contrato de coordenadas a una respuesta de ruta verificable | 540 | 757 | P1 | P2_prerrequisitos, P7_rutaflow |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Cotización y facturación reproducible | 6 | 1182 | OK | — |
| 139 | Recaudo, liquidación y conciliación | 139 | 1200 | OK | — |
| 267 | Fraude responsable | 267 | 1262 | OK | — |
| 397 | Tokenización de pagos: un identificador opaco no sustituye autorización ni confirmación | 397 | 727 | P1 | P2_prerrequisitos |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 6 | Infraestructura y entrega segura | 6 | 1029 | OK | — |
| 141 | SLO y respuesta a incidentes | 141 | 1059 | OK | — |
| 263 | Pruebas end-to-end del sistema completo (app ↔ backend) | 263 | 840 | P1 | P2_prerrequisitos |
| 337 | Continuidad, costes y proyecto final | 337 | 1359 | OK | — |

### Track: spring-boot (121 temas en 27 módulos)

**modulo-0**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 37 | Inversión de control y el contenedor de Spring | 37 | 858 | P1 | P2_prerrequisitos, P7_rutaflow |
| 206 | Inyección por constructor vs por campo | 206 | 833 | P1 | P2_prerrequisitos, P7_rutaflow |
| 364 | Estereotipos, autoconfiguración y scopes | 364 | 1009 | P1 | P6_modificacion, P7_rutaflow |
| 547 | Ciclo de vida de los beans y apagado ordenado · Intermedio · 45 min | 547 | 1095 | OK | — |
**modulo-1**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 55 | Spring Initializr y starters | 55 | 869 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 189 | application.yml vs application.properties | 189 | 704 | P1 | P6_modificacion, P7_rutaflow |
| 325 | Perfiles y estructura por capas | 325 | 856 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
**modulo-10**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Config Server y service discovery | 8 | 982 | P1 | P2_prerrequisitos |
| 202 | Spring Cloud Gateway | 202 | 870 | P1 | P2_prerrequisitos |
| 338 | Circuit breaker con Resilience4j | 338 | 733 | P1 | P6_modificacion |
| 424 | OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización | 424 | 1147 | P1 | P2_prerrequisitos, P6_modificacion |
| 558 | HTTP Interfaces, deadlines y descubrimiento según el entorno | 558 | 829 | P1 | P2_prerrequisitos |
| 717 | Spring gRPC, contrato HTTP/2 y evolución segura | 717 | 880 | P1 | P6_modificacion |
| 868 | DDD para decidir límites y propiedad de datos | 868 | 744 | P1 | P6_modificacion |
| 1007 | Orquestar pedidos con Temporal y Spring Boot | 1007 | 1226 | P1 | P2_prerrequisitos, P6_modificacion |
| 1165 | Comprueba módulos antes de separar servicios | 1165 | 884 | P1 | P2_prerrequisitos, P6_modificacion |
| 1305 | Spring Cloud Bus para propagar cambios de configuración | 1305 | 989 | P1 | P2_prerrequisitos |
| 1442 | Micrometer Tracing entre servicios | 1442 | 911 | P1 | P2_prerrequisitos |
| 1591 | Contract testing entre productor y consumidor | 1591 | 795 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-11**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Fat JAR vs capas de Docker | 8 | 909 | P1 | P2_prerrequisitos, P6_modificacion |
| 155 | GraalVM native image | 155 | 936 | P1 | P2_prerrequisitos, P6_modificacion |
| 298 | Health checks para Kubernetes | 298 | 901 | P1 | P2_prerrequisitos, P6_modificacion |
| 460 | Imágenes OCI con Buildpacks: spring-boot:build-image sin Dockerfile · Avanzado · 40 min | 460 | 857 | OK | — |
**modulo-12**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Arquitectura del microservicio integrador | 8 | 990 | P1 | P2_prerrequisitos, P6_modificacion |
| 151 | Integra seguridad JWT y observabilidad | 151 | 987 | P1 | P2_prerrequisitos, P6_modificacion |
| 285 | Cierra el servicio con evidencia y próximos pasos | 285 | 869 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-13**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | `@Transactional` funciona en una frontera, no como encantamiento | 10 | 695 | P1 | P2_prerrequisitos, P6_modificacion |
| 145 | Recuperación implica duplicación segura | 145 | 862 | P1 | P2_prerrequisitos, P6_modificacion |
| 270 | Contratos ejecutables protegen despliegues independientes | 270 | 705 | P1 | P6_modificacion |
| 354 | Observabilidad sirve a un objetivo y a una decisión | 354 | 749 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-14**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | CRUD API y contratos | 8 | 664 | P1 | P2_prerrequisitos, P6_modificacion |
| 101 | MySQL y datos espaciales | 101 | 803 | P1 | P2_prerrequisitos, P6_modificacion |
| 231 | JPA e Hibernate Spatial | 231 | 698 | P1 | P2_prerrequisitos |
| 324 | JWT Bearer y autorización por roles | 324 | 657 | P1 | P2_prerrequisitos, P6_modificacion |
| 414 | Tiempo real con STOMP | 414 | 970 | P1 | P6_modificacion |
| 519 | Archivos y notificaciones push | 519 | 1081 | P1 | P6_modificacion |
**modulo-15**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Backpressure real en WebFlux con reactor-test | 8 | 843 | P1 | P6_modificacion |
| 134 | Contenedores Testcontainers reutilizados entre clases | 134 | 880 | P1 | P6_modificacion |
| 247 | Arquitectura hexagonal verificada con ArchUnit | 247 | 819 | P2 | — |
| 355 | Bulkhead y RateLimiter de Resilience4j | 355 | 831 | P1 | P2_prerrequisitos, P6_modificacion |
| 436 | Saga con compensación real | 436 | 802 | P1 | P2_prerrequisitos |
| 528 | Event Sourcing con replay real | 528 | 727 | P1 | P2_prerrequisitos |
| 625 | Compensación que falla: conservar trabajo pendiente y reintentar sin duplicar | 625 | 998 | P1 | P2_prerrequisitos |
| 797 | Clean Architecture y DDD táctico: caso de uso antes que framework | 797 | 965 | P1 | P2_prerrequisitos |
**modulo-16**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Relaciones, lado propietario y ciclo de vida | 14 | 957 | P1 | P2_prerrequisitos, P6_modificacion |
| 119 | LAZY, EAGER, N+1 y consultas de caso de uso | 119 | 931 | P1 | P6_modificacion |
**modulo-17**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | DataSource, JdbcTemplate y DAO | 14 | 723 | P1 | P2_prerrequisitos |
| 108 | `@Transactional`, rollback y límites de transacción | 108 | 722 | P1 | P2_prerrequisitos |
**modulo-18**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | SecurityFilterChain y autorización | 14 | 708 | P1 | P2_prerrequisitos, P6_modificacion |
| 106 | DTO validation, CORS, JWT/OIDC y clientes HTTP | 106 | 862 | P1 | P2_prerrequisitos, P6_modificacion |
| 206 | SAML 2.0 con Spring Security: iniciar sesión con el proveedor de identidad de una empresa · Experto · 50 min | 206 | 1013 | OK | — |
**modulo-19**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Job, Step, Tasklet y chunk processing | 14 | 822 | P1 | P2_prerrequisitos, P6_modificacion |
| 119 | Reinicio, JobParameters, retry, skip y listeners | 119 | 816 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-2**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Por qué DTOs en vez de entidades directamente | 10 | 981 | P1 | P2_prerrequisitos, P7_rutaflow |
| 252 | Validación con Bean Validation y ResponseEntity | 252 | 953 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 408 | Manejo centralizado de errores con @ControllerAdvice | 408 | 1024 | P1 | P2_prerrequisitos, P7_rutaflow |
| 612 | Lombok y MapStruct sin exponer datos internos | 612 | 1068 | P1 | P2_prerrequisitos, P4_comando, P7_rutaflow |
| 847 | OpenAPI con springdoc: el contrato como prueba | 847 | 984 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 1071 | Paginación HTTP con validación y un límite de recursos explícito | 1071 | 1051 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
**modulo-20**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | Scheduling y tareas periódicas | 14 | 712 | P1 | P2_prerrequisitos, P6_modificacion |
| 110 | Eventos locales, eventos transaccionales y mensajería | 110 | 802 | P1 | P2_prerrequisitos, P6_modificacion |
| 219 | Correo con Spring Mail y entrega recuperable | 219 | 758 | P1 | P2_prerrequisitos, P6_modificacion |
| 342 | Caché con Spring Cache, Caffeine y Redis | 342 | 1468 | P1 | P2_prerrequisitos |
| 515 | @Async y ejecutores: trabajo en segundo plano con límites | 515 | 1141 | P1 | P2_prerrequisitos |
| 639 | Integraciones empresariales, SOAP y fronteras de protocolo | 639 | 1202 | P1 | P2_prerrequisitos |
| 752 | Spring AI: ChatClient y herramientas con autorización fuera del modelo | 752 | 1295 | P1 | P2_prerrequisitos |
| 926 | RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar | 926 | 1224 | P1 | P2_prerrequisitos |
| 1068 | Model Context Protocol (MCP) con Spring AI: exponer y consumir herramientas | 1068 | 1127 | P1 | P2_prerrequisitos |
**modulo-21**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Productor, tópico, key y consumidor | 9 | 562 | P1 | P2_prerrequisitos, P6_modificacion |
| 94 | Reintentos, DLT, entrega al menos una vez e idempotencia | 94 | 574 | P1 | P2_prerrequisitos, P6_modificacion |
| 179 | Outbox transaccional y flujo de negocio | 179 | 563 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-22**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | Hexagonal: puertos que hablan el idioma del dominio | 7 | 1128 | P2 | — |
| 183 | C4: contexto, contenedores, componentes y código | 183 | 1122 | P2 | — |
| 344 | ADR: decisiones con contexto, alternativas y consecuencias | 344 | 1115 | P2 | — |
**modulo-23**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | módulos y límites entre paquetes | 7 | 541 | P1 | P2_prerrequisitos |
| 91 | eventos entre módulos sin importar implementación | 91 | 533 | P1 | P2_prerrequisitos |
| 175 | documentación generada y mapa de dependencias | 175 | 558 | P1 | P2_prerrequisitos |
| 259 | pruebas de integración por módulo | 259 | 568 | P1 | P2_prerrequisitos |
**modulo-24**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 7 | schema-first con tipos y consultas | 7 | 550 | P1 | P2_prerrequisitos |
| 91 | data fetchers, relaciones y problema N+1 | 91 | 595 | P1 | P2_prerrequisitos |
| 178 | mutations y subscriptions | 178 | 547 | P1 | P2_prerrequisitos |
| 262 | pruebas GraphQL con GraphQlTester | 262 | 591 | P1 | P2_prerrequisitos |
**modulo-25**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 11 | bindings y destinations | 11 | 488 | P1 | P2_prerrequisitos, P6_modificacion |
| 95 | binder Kafka y binder RabbitMQ | 95 | 569 | P1 | P2_prerrequisitos, P6_modificacion |
| 191 | reintentos, error handler y dead-letter | 191 | 540 | P1 | P2_prerrequisitos, P6_modificacion |
| 274 | test binder y límites de la prueba | 274 | 488 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-26**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 14 | CompletableFuture, @Async y el bug de la autoinvocación · Avanzado · 1 h 20 min | 14 | 1645 | P1 | P6_modificacion |
| 187 | Locks, deadlocks, semáforos y MDC en concurrencia · Experto · 1 h 30 min | 187 | 2053 | P1 | P6_modificacion |
**modulo-3**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 9 | Entidades y repositorios derivados | 9 | 1096 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 192 | El problema N+1 y su corrección | 192 | 1158 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 478 | Migraciones con Flyway | 478 | 870 | P1 | P2_prerrequisitos, P7_rutaflow |
| 644 | Spring Data MongoDB: documentos, consultas derivadas y cuándo elegir un modelo de documentos · Intermedio · 45 min | 644 | 1016 | OK | — |
**modulo-4**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | SecurityFilterChain moderno | 10 | 1003 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 228 | Filtro JWT y autorización por rol | 228 | 1324 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 532 | CORS y CSRF | 532 | 998 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 706 | Reducir SSRF en clientes HTTP con InetAddressFilter | 706 | 863 | P1 | P2_prerrequisitos, P7_rutaflow |
| 782 | Flujo de login completo — de `/api/auth/login` a una ruta protegida | 782 | 1130 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-5**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | @ConfigurationProperties tipado | 10 | 1010 | P1 | P2_prerrequisitos, P6_modificacion |
| 195 | Fallar rápido al arranque | 195 | 756 | P1 | P2_prerrequisitos, P6_modificacion |
| 316 | Manejo global de excepciones consistente entre entornos | 316 | 784 | P1 | P2_prerrequisitos, P6_modificacion |
| 479 | FailureAnalyzer: errores de arranque que explican la causa y la solución · Avanzado · 35 min | 479 | 859 | OK | — |
**modulo-6**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Probar un controller con `@WebMvcTest` | 10 | 810 | P1 | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| 138 | Probar el repositorio contra PostgreSQL con `@DataJpaTest` | 138 | 840 | P1 | P2_prerrequisitos, P7_rutaflow |
| 297 | Integrar el flujo con `@SpringBootTest` | 297 | 821 | P1 | P2_prerrequisitos, P6_modificacion |
**modulo-7**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 10 | Actuator y health checks personalizados | 10 | 904 | P1 | P2_prerrequisitos, P6_modificacion |
| 205 | Contar operaciones de negocio con Micrometer | 205 | 903 | P1 | P2_prerrequisitos |
| 381 | Liveness y readiness sin reinicios en cadena | 381 | 1213 | P1 | P2_prerrequisitos, P6_modificacion |
| 552 | Logging en Spring Boot: niveles, grupos y logs estructurados en JSON · Intermedio · 40 min | 552 | 913 | OK | — |
**modulo-8**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 8 | Producers y consumers con Spring Kafka | 8 | 1060 | P1 | P2_prerrequisitos, P6_modificacion |
| 160 | Dead-letter queue | 160 | 880 | P1 | P2_prerrequisitos, P6_modificacion |
| 269 | Transacciones Kafka y SQL: idempotencia y límites de exactly-once | 269 | 1384 | P1 | P2_prerrequisitos |
| 461 | Rebalanceo de consumer groups y asignación de particiones | 461 | 1160 | P1 | P2_prerrequisitos, P6_modificacion |
| 618 | Kafka frente a RabbitMQ | 618 | 1248 | P2 | — |
| 756 | Spring Cloud Stream y binders de Kafka/RabbitMQ | 756 | 1101 | P1 | P2_prerrequisitos, P6_modificacion |
| 936 | Kafka Streams con Spring para transformar eventos | 936 | 793 | P1 | P2_prerrequisitos, P6_modificacion |
| 1084 | Avro y Schema Registry para contratos de eventos | 1084 | 933 | P1 | P2_prerrequisitos |
| 1230 | RabbitMQ con Spring AMQP: routing, ack y prefetch | 1230 | 1214 | P1 | P2_prerrequisitos |
| 1361 | JMS con Spring y ActiveMQ Artemis: colas punto a punto y transacciones · Avanzado · 45 min | 1361 | 926 | OK | — |
**modulo-9**

| # | Tema | Línea | Palabras | Prioridad | Faltantes |
|---|---|---:|---:|---|---|
| 213 | Mono y Flux | 213 | 793 | P1 | P2_prerrequisitos, P6_modificacion |
| 328 | WebClient y composición no bloqueante | 328 | 842 | P1 | P2_prerrequisitos, P6_modificacion |
| 445 | Cuándo WebFlux vale la complejidad, y R2DBC | 445 | 988 | P1 | P2_prerrequisitos |

## Temas P1 — incompletos (1195)

| Track | Módulo | Tema | Profundidad | Falta |
|---|---|---|---|---|
| android | — | — | profunda | P2_prerrequisitos |
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
| cloud | — | — | adecuada | P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| cloud | — | — | adecuada | P7_rutaflow |
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
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| cloud | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | adecuada | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
| control-1 | — | — | profunda | P2_prerrequisitos, P5_fallo, P6_modificacion, P7_rutaflow |
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
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | profunda | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos |
| flutter | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
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
| flutter | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
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
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P7_rutaflow |
| foundations | — | — | profunda | P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos |
| foundations | — | — | adecuada | P2_prerrequisitos |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
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
| foundations | — | — | profunda | P2_prerrequisitos, P5_fallo, P7_rutaflow |
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
| foundations | — | — | profunda | P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| foundations | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
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
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos |
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
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| ios | — | — | profunda | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| java | — | — | adecuada | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| java | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
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
| javascript | — | — | profunda | P7_rutaflow |
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
| javascript | — | — | profunda | P6_modificacion, P7_rutaflow |
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
| microservices | — | — | adecuada | P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| node | — | — | adecuada | P2_prerrequisitos |
| node | — | — | adecuada | P2_prerrequisitos |
| node | — | — | adecuada | P2_prerrequisitos |
| node | — | — | adecuada | P2_prerrequisitos |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| node | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
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
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| node | — | — | profunda | P2_prerrequisitos |
| node | — | — | adecuada | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | adecuada | P7_rutaflow |
| node | — | — | adecuada | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
| node | — | — | adecuada | P7_rutaflow |
| node | — | — | adecuada | P1_resultado, P7_rutaflow |
| node | — | — | profunda | P1_resultado, P7_rutaflow |
| node | — | — | profunda | P1_resultado, P7_rutaflow |
| node | — | — | profunda | P7_rutaflow |
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
| react | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
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
| rutaflow | — | — | adecuada | P2_prerrequisitos, P7_rutaflow |
| rutaflow | — | — | adecuada | P2_prerrequisitos |
| rutaflow | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | adecuada | P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | adecuada | P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P4_comando, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | profunda | P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P7_rutaflow |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | profunda | P2_prerrequisitos |
| spring-boot | — | — | adecuada | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos, P6_modificacion |
| spring-boot | — | — | profunda | P2_prerrequisitos |

## Temas P2 — sin fuente o sin caso real (11)

| Track | Módulo | Tema | Archivo:Línea |
|---|---|---|---|
| android | — | — | web/public/content/android/modulo-15.md:543 |
| devops | — | — | web/public/content/devops/modulo-9.md:608 |
| flutter | — | — | web/public/content/flutter/modulo-22.md:405 |
| ios | — | — | web/public/content/ios/modulo-0.md:474 |
| kotlin-multiplatform | — | — | web/public/content/kotlin-multiplatform/modulo-9.md:226 |
| node | — | — | web/public/content/node/modulo-1.md:500 |
| spring-boot | — | — | web/public/content/spring-boot/modulo-15.md:247 |
| spring-boot | — | — | web/public/content/spring-boot/modulo-22.md:7 |
| spring-boot | — | — | web/public/content/spring-boot/modulo-22.md:183 |
| spring-boot | — | — | web/public/content/spring-boot/modulo-22.md:344 |
| spring-boot | — | — | web/public/content/spring-boot/modulo-8.md:618 |

## Recomendaciones priorizadas

2. **Completar 1195 temas P1** (falta ≥1 paso).
3. **Añadir fuente oficial a 80 temas**.
4. **Añadir caso real a 300 temas**.
5. **Convertir 179 ASCII a Mermaid**.
8. **Iniciar revisión humana**: 0/1430 revisados pedagógicamente.

## Límites

- Mide presencia, no calidad ni ejecución.
- Similitud = Jaccard sobre shingles de 5 palabras.
- No sustituye revisión humana.
