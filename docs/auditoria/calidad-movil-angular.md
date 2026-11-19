# Calidad de temario: Android, iOS, Flutter, Kotlin Multiplatform y Angular

- **Fecha:** 2026-11-18.
- **Alcance:** `web/public/content/{android,ios,flutter,kotlin-multiplatform,angular}/modulo-*.md` y `web/src/app/tracks/<curso>.track.ts`.
- **Qué no repite este informe:** la rúbrica A1–F3, la plantilla, el código que no compila, el voseo, la jerga, las soluciones ausentes y los errores técnicos puntuales. Todo eso ya está en `docs/auditoria/android-node.md`, `java-ios.md`, `flutter-angular.md`, `devops-kotlin.md` y `calidad-transversal.md`. Cuando un hallazgo de aquí toca uno de esos, se cita y se mira desde otro ángulo: qué promete el track, qué cubre el temario y cómo se ordena.
- **Método:**
  1. Se listaron los 415 temas (`grep '^### Tema'`).
  2. Cada `concepts`/`challenges` del track se cruzó con el texto del módulo. Fue un script que busca cada identificador prometido; los términos de texto libre se revisaron a mano.
  3. Se midieron horas declaradas, temas, minutos de los títulos y palabras por módulo.
  4. Se compararon los objetivos («Al finalizar…») de los pares sospechosos de duplicarse.
  5. Las versiones vigentes se verificaron contra fuentes primarias (sección «Fuentes», al final).
  - No se ejecutó código. Ningún SDK móvil está disponible en este entorno.
- **Convención de citas:** `curso/modulo-N.md:línea` va relativo a `web/public/content/`; `<curso>.track.ts:línea` va relativo a `web/src/app/tracks/`.

---

## 0. Resumen transversal (los cinco cursos)

### 0.1 Carga declarada frente a la metodología

La metodología fija temas de 20–45 min (`docs/METODOLOGIA-DE-APRENDIZAJE.md`). Las horas del track no se derivan de los temas.

| Curso | Horas declaradas | Temas | Min/tema promedio | Rango esperado por metodología | Horas después del integrador |
|---|---|---|---|---|---|
| Android | 103,5 h | 83 | 75 | 28–62 h | 64 h (M13–M18), el 62 % del curso |
| iOS | 49 h | 69 | 43 | 23–52 h | 13 h (M13–M14) |
| Flutter | 90,5 h | 119 | 46 | 40–89 h | 54 h (M13–M22), el 60 % |
| KMP | 51 h | 66 | 46 | 22–50 h | 16 h (M12–M13) |
| Angular | 60 h | 78 | 46 | 26–59 h | 21 h (M14–M16) |

Hay presupuestos imposibles: restando los minutos escritos en los títulos, quedan menos de 20 min para cada uno de los demás temas.

- `flutter` M0: 150 min declarados y 115 en tres títulos, así que quedan **9 min** para cada uno de los otros 4 temas.
- `flutter` M7: **6 min** por tema.
- `kotlin-multiplatform` M7: **6 min** por tema (180 min declarados, 155 en cuatro títulos).
- `kotlin-multiplatform` M3: **15 min** por tema.
- `angular` M8: **8 min** por tema.
- `ios` M13: **16 min** por tema (240 min para 10 temas).

En el otro extremo están `android` M17 (12 h para 5 temas, **144 min** por tema) y M18 (**169 min**).

La densidad varía 15 veces: `android/modulo-17.md` tiene 2883 palabras para 12 h (240 palabras/h) y `angular/modulo-1.md` tiene 9258 palabras para 2 h 30 min (3700 palabras/h).

### 0.2 Versiones sin registro

La metodología exige: «Cada curso registra en su spec la línea estable o LTS de referencia, las notas de versiones, la guía de migración y la fecha de revisión» (`docs/METODOLOGIA-DE-APRENDIZAJE.md:75`). Ninguna spec (`specs/011`–`015`) lo hace para estos cinco cursos.

En su lugar, cada curso añadió una sección «Revisión oficial de plataforma — julio de 2026» al final de un módulo de producción:

- `android/modulo-13.md:511`
- `ios/modulo-13.md:1025`
- `kotlin-multiplatform/modulo-12.md:393`
- `flutter/modulo-13.md:379`
- `angular/modulo-14.md:793`

Así, la novedad queda lejos del tema que cambia. Por ejemplo, la concurrencia de Swift 6.2 está en M13 y no en M4.

### 0.3 Repetición entre cursos móviles

| Contenido repetido | Dónde | ¿Justificado? | Propuesta |
|---|---|---|---|
| Kotlin básico: null safety, lambdas y coroutines | `android/modulo-0.md:531,639,763` frente a `kotlin-multiplatform/modulo-0.md`, `modulo-1.md:8,396` y `modulo-2.md:8,151`. Android M8 pide «KMP, Módulo 2» como previo (ver `android-node.md`). | No. Son dos versiones del mismo material, y el Tema 5 de Android (lambdas, «Intermedio · 120 min») está en el Módulo 0. | Un único «Kotlin esencial», compartido o declarado como prerrequisito. Android M0 se queda solo con lo específico de Android. |
| Módulo «X en producción» con la misma plantilla de cuatro temas: frontera/entrada externa, «proteger datos = todas sus copias», «offline-first es un protocolo», operar/telemetría | `android/modulo-13.md:10,137,251,388`; `ios/modulo-13.md:10,103,198,307`; `flutter/modulo-13.md:8,103,207,290`, repetido además en `flutter/modulo-18.md`; `kotlin-multiplatform/modulo-12.md` | En parte: las API son nativas, pero el modelo conceptual (outbox, idempotencia, LWW, rollout) se explica cinco veces. | Un tema conceptual común (por ejemplo en Fundamentos o Cloud). Cada curso conserva solo la implementación nativa: Keystore/Keychain, WorkManager/BGTask. |
| Offline-first y outbox dentro de cada curso | Android M6 T3 (`:295`), M13 T3 y M16 T4; iOS M12 T2 (`:91`) y M13 T3 (`:198`); Flutter M6 T3, M14 T5 y M19 T5; KMP M11 T2 | No dentro de un mismo curso. | Uno básico y uno avanzado por curso, no tres o cuatro. |
| App del conductor de RutaFlow (mapa, GPS, evidencia, push) | Android M15 T3, T5 y T6; iOS M13 T8; Flutter M14 y M19 completos | Sí entre cursos. No dentro de Flutter (M14/M19, §3). | Ver §3. |
| Publicación en tiendas y Fastlane | Android M11, iOS M11, Flutter M11 + M15 T6 + M20 T6, KMP M10 T2 | Sí entre cursos. Flutter lo repite tres veces. | Ver §3. |

---

## 1. Android (`android`, 19 módulos, 83 temas)

### 1.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura: navegación | El curso enseña solo Navigation 2: `navigation = "2.10.2"` (`android/modulo-0.md:427`) y NavHost/NavController en M3. «Navigation 3», `NavDisplay` y `navigation3` aparecen **0 veces**. Navigation 3 1.0 es estable desde el 19-11-2025 y Google dice: «If you're already using Nav2… you should consider migrating to Nav3» ([blog oficial](https://developer.android.com/blog/posts/jetpack-navigation-3-is-stable)). | Alto: el estudiante aprende la API que Google ya invita a dejar. | Rehacer M3 sobre Navigation 3. Dejar Nav2 como tema de mantenimiento o migración. |
| Cobertura: edge-to-edge e insets | 0 apariciones de «edge-to-edge», `enableEdgeToEdge` o `WindowInsets` en 19 módulos. Con target Android 16 no se puede desactivar: «`windowOptOutEdgeToEdgeEnforcement` is deprecated and disabled» ([behavior changes 16](https://developer.android.com/about/versions/16/behavior-changes-16)). | Alto: toda app nueva del curso dibuja bajo las barras del sistema y el temario no lo explica. | Un tema en M2 o M17: insets, `Scaffold` con `contentWindowInsets` e IME. |
| Cobertura: SDK objetivo y requisitos de Play | `targetSdk` y `compileSdk` aparecen **0 veces**. Desde el 31-08-2026 Play exige API 36 a apps nuevas y actualizaciones ([target-sdk](https://developer.android.com/google/play/requirements/target-sdk)). Tampoco se trata el requisito de 16 KB de página para dependencias nativas (CameraX, ML Kit), que bloquea actualizaciones desde el 01-02-2027 ([page-sizes](https://developer.android.com/guide/practices/page-sizes)). | Alto: M11 «Publicación» no prepara para el rechazo real en Play. | En M11: un tema «Requisitos de Play vigentes» con `targetSdk = 36`, 16 KB y la Data safety. Fecharlo y registrarlo en la spec. |
| Cobertura: cambios de Android 16 | M3 T4 trata Predictive Back con «Android 14+» y prueba «en un emulador con Android 15 o superior» (`android/modulo-3.md:411,476`). No menciona que con target 36 `onBackPressed` deja de llamarse y las animaciones del sistema son el valor por defecto. Tampoco que en pantallas de 600 dp o más se ignoran orientación y redimensionado ([behavior changes 16](https://developer.android.com/about/versions/16/behavior-changes-16)). | Medio. | Actualizar M3 T4. Agregar en M16 T5 («Interfaces adaptativas») la regla de 600 dp. |
| Cobertura: otras ausencias | 0 menciones de Compose BOM, *strong skipping*, Glance (widgets), Material 3 Expressive e IA en el dispositivo o con Firebase AI Logic. Flutter sí enseña Firebase AI (`flutter/modulo-15.md:603`). | Medio. | Compose BOM en M0. Strong skipping en M10 T1. Las demás, como optativas. |
| Promesa frente a contenido | El título de M15 promete «… servicios y content providers» (`android.track.ts:199`), pero ningún tema enseña `ContentProvider` ni `ContentResolver`: solo FileProvider (T4). El track lista 4 conceptos y el módulo trae 9 temas (Maps, Geofencing, CameraX, sensores, BLE) que el track no anuncia. | Medio: el catálogo no describe el módulo. | Renombrar M15 («Integración con el sistema y el hardware») o dividirlo en «Plataforma» (T1–T4) y «Hardware y ubicación» (T5–T9). Actualizar los `concepts`. |
| Promesa frente a contenido | M2 promete «LazyColumn, LazyRow y LazyVerticalGrid» y «Scaffold, TopAppBar y FloatingActionButton» (`android.track.ts:32`). Ninguno aparece en `modulo-2.md`; las listas se enseñan en M17 T2 (`android/modulo-17.md:96`). | Alto: las listas son el segundo tema de la ruta oficial (Unidad 3 de *Android Basics with Compose*) y aquí llegan después de 60 h. | Mover un tema básico de `LazyColumn` + `Scaffold` a M2. Dejar en M17 lo avanzado (claves estables, rendimiento). |
| Promesa frente a contenido | La pregunta de M4 «¿Por qué un evento de "mostrar Snackbar" debería modelarse con SharedFlow y no con StateFlow?» (`android.track.ts:66`) fija como respuesta lo que la guía oficial desaconseja (el error de contenido ya está en `android-node.md`). | Alto: el track refuerza el error aunque se corrija la lección. | Cambiar la pregunta a «¿Por qué un mensaje de UI se modela como estado consumible?». |
| Promesa frente a contenido | M3 dice que el retroceso predictivo es «obligatorio desde Android 14+» (`android.track.ts:44`). En Android 14 es opcional; con target 36 es el valor por defecto. | Bajo. | Corregir la frase. |
| Promesa frente a contenido | El título de M5 es «Networking con Retrofit/Ktor», pero Ktor solo aparece de pasada (`android/modulo-5.md:1`). | Bajo. | Quitar «Ktor» del título o derivarlo al curso KMP. |
| Solapamientos internos | Pruebas de UI Compose: M9 T2 (`modulo-9.md:172`) frente a M14 T1–T2 (`modulo-14.md:8,136`), con el mismo objetivo (montar un composable y verificar lo renderizado). | Medio. | Fusionar en M14, que es más completo. M9 se queda con ViewModel, `runTest` y E2E. |
| Solapamientos internos | `remember`/`rememberSaveable` en M2 T3 (`:224`) y otra vez en M4 T4 (`:407`). | Bajo. | Quitar M4 T4 o convertirlo en práctica de M2 T3. |
| Solapamientos internos | Efectos: M10 T2 «ciclo de efectos» (`:162`) frente a M17 T4 «Side effects, lifecycle» (`:270`). Baseline Profiles: M10 T2 frente a M18 T4 (`:250`), además de Macrobenchmark en M18 T5. Accesibilidad: M10 T3, M14 T3–T4 y M17 T3/T5. | Medio: el mismo tema aparece tres veces con niveles distintos. | M10 se queda solo con Material 3 y una introducción a la accesibilidad. Efectos en M17. Perfiles y benchmark en M18. |
| Solapamientos internos | Inyección de dependencias: M7 (Hilt) y M12 T2 «Inyección de dependencias en toda la app» (`:127`). | Bajo. | M12 T2 pasa a ser una evidencia del integrador, no un tema nuevo. |
| Progresión | El integrador M12 («Cierre del track y próximos pasos», `modulo-12.md:219`) llega a las 39,5 h. Después siguen 64 h, y M15 y M17 están etiquetados «Integración» después de módulos «Experto» (`android/modulo-0.md:30–33`). | Alto: el estudiante «termina» y luego encuentra el 62 % del curso. | Reordenar: Fundamentos 0–2 → listas/edge-to-edge → navegación → estado → red → Room → DI → plataforma (M15) → Compose profesional (M17) → pruebas → integrador → producción, build y publicación. |
| Progresión y carga | M0 dura 6 h y mezcla instalación, recursos, Gradle multimódulo, un catálogo de 20 bibliotecas (Firebase BOM, CameraX, Play Integrity…; `android/modulo-0.md:420–448`), lambdas avanzadas (120 min) y coroutines. | Alto: es el primer contacto del estudiante. | M0 = instalación + primer composable + recursos. El catálogo se añade módulo a módulo. Lambdas y coroutines van al «Kotlin esencial» común (§0.3). |
| Carga | M16 dura 14 h para 7 temas; M17 y M18, 12 h para 5 temas cada uno (§0.1). | Medio. | Recalcular las horas como suma de temas. |
| Experiencia | Remite a otros cursos 25 veces. Hay recursos ficticios: `tasks.example.com` y `localhost:8000/8001` sin servidor del curso. | Bajo (lo cubre `android-node.md`). | Ver ese informe. |

### 1.2 Cambios de temario propuestos (para aprobación del dueño)

1. **[P1]** Reordenar la ruta según §1.1 «Progresión». El integrador pasa al final de los módulos de aplicación, y los módulos «Integración» van antes que los «Experto».
2. **[P1]** M3 sobre **Navigation 3**. Navigation 2 queda como tema de migración.
3. **[P1]** Nuevo tema en M2: **LazyColumn + Scaffold + edge-to-edge/insets**. Se quita la promesa de M2 que hoy no se cumple.
4. **[P1]** M11: tema **«Requisitos vigentes de Google Play»** (targetSdk 36, 16 KB, extensión al 01-11-2026) con fecha de revisión en la spec.
5. **[P2]** Fusionar M9 T2 con M14 T1–T2. Quitar M4 T4. Repartir el contenido de M10 entre M17 y M18.
6. **[P2]** Partir M15 en «Plataforma» y «Hardware y ubicación», o renombrarlo. Corregir los `concepts`.
7. **[P2]** Sacar Kotlin esencial (M0 T4–T6) a un prerrequisito compartido con KMP.
8. **[P3]** Optativos: Glance, Material 3 Expressive e IA en el dispositivo.

---

## 2. iOS (`ios`, 15 módulos, 69 temas)

### 2.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Versiones | La base del curso es «Xcode 26 o posterior… incluye Swift 6.2 y necesita macOS Sequoia 15.6» (`ios/modulo-0.md:10`; 15 menciones de Swift 6.2 y 11 de Xcode 26). Hoy está publicado Xcode 27.1, que «includes Swift 6.4 and SDKs for iOS 27.1» y «requires a Mac running macOS Tahoe 26.6 or later» ([Xcode 27.1 release notes](https://developer.apple.com/documentation/xcode-release-notes/xcode-27_1-release-notes)). Swift 6.3 salió el 24-03-2026 ([swift.org](https://swift.org/blog/swift-6.3-released/)). | Alto: quien instale desde la App Store recibe Xcode 27 y un requisito de macOS distinto del que dice M0. | Fijar en la spec «Xcode 27 / Swift 6.4 / iOS 27». Revisar la plantilla de paquetes (`@main` en `swift package init`, `ios/modulo-0.md:131`). |
| Cobertura: concurrencia | Lo nuevo de Swift 6.2 (aislamiento por defecto en el actor principal, `@concurrent`, async en el contexto de quien llama; [swift.org 6.2](https://www.swift.org/blog/swift-6.2-released/)) solo aparece en el apéndice de M13 (`ios/modulo-13.md:1027–1031`). M4 T5 «Swift 6: aislamiento, Sendable…» (`modulo-4.md:319`) no lo integra. | Alto: los diagnósticos que verá el estudiante dependen de esos ajustes de compilación. | Rehacer M4 T3/T5 con el modo de aislamiento explícito y `@concurrent`. Quitar el apéndice. |
| Promesa frente a contenido | M10 promete «Novedades recientes: Liquid Glass, layouts volumétricos y WebView nativo» y «@ViewBuilder y .matchedGeometryEffect()» (`ios.track.ts:131`). Ninguno aparece en `modulo-10.md`; `matchedGeometryEffect` está en M14 T4 (`modulo-14.md:322`). | Alto: Liquid Glass es el lenguaje visual de iOS 26 y posteriores, y no se enseña en ningún módulo (0 apariciones). No se pudo abrir la página de requisitos de SDK de Apple para fechar su obligatoriedad. | Tema «Diseño iOS 26+: Liquid Glass y materiales» en M10. Quitar «volumétricos» (visionOS está fuera de alcance). |
| Cobertura: otras ausencias | 0 apariciones de `NavigationSplitView` (iPad), StoreKit (IAP; Flutter sí lo cubre en `flutter/modulo-21.md:156`) y Foundation Models (modelo en el dispositivo). Privacy manifest: 1 mención (`modulo-13.md`). | Medio. | NavigationSplitView en M3. StoreKit 2 y Foundation Models como optativos en M14. Privacy manifest en M11. |
| Obsolescencia relativa | Combine ocupa un módulo completo (M7, 2 h, «Integración») y además M14 T3 «Combine avanzado» (`modulo-14.md:264`). `ObservableObject`/`@Published` aparecen en M2, M4 y M12 junto a `@Observable`. | Medio: dos módulos para una API de mantenimiento, mientras faltan Liquid Glass y StoreKit. | M7 pasa a ser un solo tema: «Leer y migrar código Combine a async/AsyncSequence/Observation». Eliminar M14 T3. |
| Solapamientos internos | M13 T2 «guardar el token de sesión… en Keychain (no en `UserDefaults`)» (`modulo-13.md:103`) y M13 T5 «guardar y leer un token de sesión en el Keychain… por qué nunca… `UserDefaults`» (`:406`): el objetivo es idéntico. El track también lo lista dos veces (`ios.track.ts` M13: «Keychain, Data Protection…» y «Keychain: guardar secretos…»). | Medio. | Fusionar T5 en T2. |
| Solapamientos internos | Pruebas: M9 T1–T2 (`modulo-9.md:8,112`) frente a M14 T1 «Swift Testing y pruebas asíncronas» (`modulo-14.md:8`). Interoperabilidad con UIKit: M10 T3–T4 (`modulo-10.md:130,194`) frente a M14 T5–T6 (`:376,438`). Sincronización: M12 T2 (`:91`) frente a M13 T3 (`:198`). | Medio. | M9 = XCTest/Swift Testing básico. M14 T1 solo cancelación. Interoperabilidad con UIKit en un único lugar (M14). M12 T2 enlaza M13 T3. |
| Progresión | Ownership `~Copyable` («Experto · 45 min») en el Módulo 0 (`modulo-0.md:510`). SPM se enseña en M12 T4 (`:362`), pero se usa desde M0. | Medio. | `~Copyable` a M14. SPM básico a M0 o M1. |
| Carga | M13: 10 temas en 4 h (16 min para cada tema sin duración en el título). M14: 10 temas en 9 h. | Medio. | M13 → 7 h o dividirlo en «Seguridad y privacidad» y «Capacidades del sistema» (ubicación, BGTask, Face ID). |
| Experiencia | 35 remisiones a otros cursos (React, Android, Angular, Spring, Cloud). La auditoría `java-ios.md` las califica como D3 = 0. M0 aclara que son opcionales (`modulo-0.md:21`), pero M5 exige Cloud. | Ver `java-ios.md`. | Ver ese informe. |

### 2.2 Cambios de temario propuestos

1. **[P1]** Base **Xcode 27 / Swift 6.4 / iOS 27** registrada en la spec. Actualizar M0.
2. **[P1]** M4: concurrencia con aislamiento por defecto y `@concurrent`, integrada. Se elimina el apéndice de M13.
3. **[P1]** M10: Liquid Glass + `matchedGeometryEffect` + `@ViewBuilder`, como promete el track, o bien retirar esas promesas.
4. **[P2]** Reducir Combine a un tema de migración y eliminar M14 T3.
5. **[P2]** Fusionar M13 T5 en T2. Unificar la interoperabilidad con UIKit en M14. M9/M14 sin repetir.
6. **[P2]** Añadir NavigationSplitView (M3) y privacy manifest (M11).
7. **[P3]** Optativos: StoreKit 2 y Foundation Models.

---

## 3. Flutter (`flutter`, 23 módulos, 119 temas)

### 3.1 Duplicados confirmados (13/18, 14/19, 15/20)

Se compararon los objetivos («Al finalizar…»). El texto está reescrito: la similitud de vocabulario es de 0,15–0,24. Lo que se repite son **los objetivos y los conceptos**.

| Par | Tema A | Tema B | Veredicto | Fusión propuesta |
|---|---|---|---|---|
| 13/18 | M13 T1 «Una API Dart puede terminar en una frontera nativa»: validar un deep link (`modulo-13.md:8`) | M18 T1 «la frontera entre Dart y el código nativo»: decidir Dart, plugin o API nativa con la batería (`modulo-18.md:9`) | Mismo título, objetivos distintos. M18 T1 repite **M7 T1** (MethodChannel de batería, `modulo-7.md:6,12`). | M13 T1 queda como «Validar deep links». M18 T1 se elimina (ya está en M7). |
| 13/18 | M13 T2 «Los secretos no pertenecen al binario»: `SessionVault` con Keychain/Keystore (`:103`) | M18 T2 «secretos fuera del binario»: mover una operación privilegiada al servidor (`:115`) | Duplicado conceptual con dos ejemplos complementarios. | Un solo tema en dos partes: secretos del servidor y tokens del usuario. |
| 13/18 | M13 T3 «Fluidez… presupuesto de cada frame» (`:207`) | M18 T3 «fluidez y presupuesto de frames» (`:214`) | Duplicado. Además repite M8 T2–T3, M15 T3 y M20 T3 (cinco veces en total). | Un tema en M8 (introducción) y uno en producción (medir en profile y en release). |
| 13/18 | M13 T4 «Producción exige protocolo, telemetría y contención» (`:290`) | M18 T4 «protocolo, telemetría y contención» (`:271`) | Duplicado. | Fusionar. Conservar de M18 los T5–T7 (Crashlytics/Sentry, analítica con consentimiento, monitoreo), que no tienen par. |
| 14/19 | M14 T1–T6: diseño + Riverpod, mapa + localización, Socket.IO, animación del marcador, offline + imágenes, Dio + push (`modulo-14.md:30–401`) | M19 T1–T6: estado de jornada con Riverpod, mapa + permiso, Socket.IO, animar marcador, confirmaciones offline, evidencia con Dio + push (`modulo-19.md:9–368`) | Duplicado tema por tema (6 de 6). M19 dice «no repetir el mapa del módulo 14» (`modulo-19.md:5`), pero lo repite, y fija `flutter_riverpod: ^2.4.0` mientras M4 enseña Riverpod 3 (`modulo-4.md:168`). | Un solo módulo «App del conductor» con 6 temas. Tomar de M14 la validación de `PositionSample` (T2) y de M19 los permisos graduales y el outbox idempotente (T2, T5). Unificar en Riverpod 3. |
| 15/20 | M15 T1–T6: test/WidgetTester, golden e integración, rendimiento, Clean Architecture, i18n, builds (`modulo-15.md:5–417`) | M20 T1–T6: los mismos seis títulos (`modulo-20.md:9–303`) | Duplicado tema por tema (6 de 6). Además, pruebas = M9; i18n = concepto de M12; builds = M11 T1. | Un solo «Flutter Master» con los temas sin par: M15 T7 (migración 3.50), M15 T8 (IA) y lo mejor de cada par. M9 se queda con lo básico de pruebas. |

**Otros duplicados en Flutter:**

- **Arquitectura** se enseña cuatro veces con recomendaciones que chocan:
  - M12 T1 «Clean Architecture» (`modulo-12.md:6`);
  - M12 T4 «Arquitectura recomendada… views, view models, repositories y services» (`:263`);
  - M15 T4 (`modulo-15.md:259`);
  - M20 T4 (`modulo-20.md:173`).

  La guía oficial pide dos capas (UI con views y view models; datos con repositories y services) y un dominio **opcional**: «This layer is optional because not all applications… have these requirements» ([guía de arquitectura](https://docs.flutter.dev/app-architecture/guide)). **Propuesta:** M12 T4 como única arquitectura del curso, con los casos de uso como variante opcional. Eliminar M12 T1, M15 T4 y M20 T4.
- **Isolates:** M8 T4 y el título de M13 («seguridad, isolates…»), aunque M13 no tiene ningún tema de isolates.

### 3.2 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Versiones: desacople de Material/Cupertino | Flutter 3.50 declara obsoletas `package:flutter/material.dart` y `cupertino.dart`. Ofrece `dart fix --apply --code=migrate_design_widgets` y `material_ui`/`cupertino_ui` desde 3.47 ([breaking change](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)). Según el [análisis de Very Good Ventures sobre 3.50](https://verygood.ventures/blog/flutter-3-50-dart-3-14/) (fuente secundaria; no lo pude comprobar en la nota oficial), `flutter create` genera ya `package:material_ui`. El curso lo resuelve con un aviso (`flutter/modulo-0.md:25`) y la migración en M15 T7 (`modulo-15.md:505`). Las lecciones siguen importando la librería obsoleta en 11 módulos, por ejemplo `modulo-1.md:188`. | Alto: si se confirma lo de `flutter create`, el proyecto nuevo y la lección no coinciden desde M1. | Migrar todos los imports a `material_ui`. Convertir M15 T7 en «Migrar una app *existente*». Mover a M10 el tema de diseño desacoplado (temas, `MaterialUiCompatibilityBridge`, delegados de localización unificados). |
| Versiones: inconsistencia interna | Riverpod 3 en M4 frente a `^2.4.0` en M19 y `examples/flutter_rutaflow` (`modulo-19.md:5`). «Usa Flutter 3.24 o superior» en `modulo-12.md:273` y `modulo-11.md:454`, frente a una base de 3.50 en `modulo-13.md:383`. Ejecución de referencia «Flutter 3.47.2» (`modulo-11.md:87`). | Medio. | Una sola línea base (Flutter 3.50 / Dart 3.14) declarada en la spec y en M0. Actualizar el ejemplo a Riverpod 3. |
| Cobertura: iOS y Android actuales | CocoaPods aparece como paso de instalación (`modulo-0.md`, tabla de macOS). Según [Very Good Ventures](https://verygood.ventures/blog/flutter-3-50-dart-3-14/) (fuente secundaria), Flutter pasa a Swift Package Manager porque CocoaPods deja de aceptar actualizaciones en diciembre de 2026; en el curso SwiftPM solo aparece 2 veces, en M15. Retroceso predictivo y `PopScope`: 0 apariciones; con Android 16 el retroceso del sistema es el valor por defecto ([behavior changes 16](https://developer.android.com/about/versions/16/behavior-changes-16)). | Medio. | SwiftPM en M0 y M7. `PopScope` en M3. |
| Cobertura y obsolescencia | M17 promete «Macros experimentales: estado actual» (`flutter.track.ts:203`). El equipo de Dart detuvo el trabajo en macros ([dart.dev/go/macros](https://dart.dev/go/macros)). La lección lo trata bien («presentar macros como disponibles» es un error, `modulo-17.md:94`); el track no. | Bajo. | Track: «Por qué no hay macros y qué usar en su lugar». |
| Promesa frente a contenido | M8 promete «Key especializadas: ValueKey, ObjectKey, UniqueKey y GlobalKey» (`flutter.track.ts:108`): 0 apariciones en `modulo-8.md` (las claves están en M1 T3). M15 promete `GlobalKey` (`:184,186`): 0 apariciones. M4 promete Provider, GetX, get_it e injectable (`:57`), con 1–5 menciones de pasada. M6 promete «Firebase: Authentication, Firestore, Cloud Functions y FCM» (`:84`), con 1 mención de cada uno. | Medio. | Ajustar los `concepts` a lo que se enseña. No anunciar GetX ni Firebase completo si no hay tema. |
| Progresión | M12 «Cierre del track» llega a las 36,5 h y después siguen 10 módulos y 54 h, entre ellos IAP (M21) y anuncios (M22), ambos «Experto». | Alto. | Tras las fusiones (§3.1), Flutter baja a unos 18 módulos. Integrador al final. M16 (FFI), M17 (generación), M21 (IAP) y M22 (anuncios) quedan como **optativos** fuera de la ruta principal. |
| Carga | M0: 9 min por tema restante. M7: 6 min (§0.1). | Medio. | Recalcular. |
| Experiencia | 43 remisiones a otros cursos (Swift, React, Room…; ver `flutter-angular.md` D3). | Ver ese informe. | — |

### 3.3 Cambios de temario propuestos

1. **[P1]** Fusionar 13+18, 14+19 y 15+20 según la tabla de §3.1. Eliminar M18 T1 (repite M7 T1).
2. **[P1]** Una sola arquitectura (la guía oficial, M12 T4). Eliminar M12 T1, M15 T4 y M20 T4.
3. **[P1]** Migrar el curso a `material_ui`/`cupertino_ui`. Fijar Flutter 3.50 / Dart 3.14 / Riverpod 3 en la spec.
4. **[P2]** Reordenar con el integrador al final. FFI, generación, IAP y anuncios como optativos.
5. **[P2]** Añadir `PopScope`/retroceso predictivo (M3) y SwiftPM (M0/M7).
6. **[P3]** Ajustar los `concepts` de M4, M6, M8, M15 y M17 al contenido real.

---

## 4. Kotlin Multiplatform (`kotlin-multiplatform`, 14 módulos, 66 temas)

### 4.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura: AGP 9 | M3 enseña `androidTarget()` con `iosX64()` (`kotlin-multiplatform/modulo-3.md:217–271`). Con AGP 9 «the Kotlin Multiplatform Gradle plugin is no longer compatible with `com.android.application` and `com.android.library`»: el módulo compartido usa `com.android.kotlin.multiplatform.library` con `kotlin { androidLibrary { … } }`, y la app Android va en su propio módulo ([migración AGP 9](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html)). El curso Android ya usa AGP 9 (`android/modulo-0.md:490`). | Alto: la estructura de proyecto que enseña M3 no es la que genera el asistente actual, y los dos cursos se contradicen. | Rehacer M3 T1/T3 con el plugin Android-KMP y el módulo `androidApp` separado. |
| Versiones | `iosX64` aparece como destino estándar (`modulo-3.md:222`, `modulo-8.md:15`, `modulo-13.md:231`). Hoy es **Tier 3**: «Running tests is not supported» ([native-target-support](https://kotlinlang.org/docs/native-target-support.html)). | Medio. | Usar `iosArm64` + `iosSimulatorArm64` y mencionar `iosX64` solo como heredado. |
| Versiones | Kotlin 2.4.21 es la versión estable actual (08-10-2026, [releases](https://kotlinlang.org/docs/releases.html)), así que es correcto. Pero M0 exige «Gradle 9.8+» y **JDK 27** (`modulo-0.md:8–16`), mientras que [whatsnew 2.4.20](https://kotlinlang.org/docs/whatsnew2420.html) declara compatibilidad total solo hasta Gradle 9.7.0. El mismo curso admite que Kotlin no genera bytecode 27 (`modulo-12.md:296`). JDK 27 no es LTS; el curso Java usa 25. | Medio: un principiante instala una combinación fuera de la matriz probada. | Base: JDK 25 LTS + Gradle de la matriz oficial. Registrarlo en la spec. |
| Versiones | Compose Multiplatform no tiene versión fijada. Pide «1.6», «1.7», «1.8» o «1.10 o superior» según el tema (`modulo-7.md:608,750,897,1042`). La vigente es la 1.12.2 ([compatibilidad](https://kotlinlang.org/docs/multiplatform/compose-compatibility-and-versioning.html)). La «fuente oficial» de M7 T1/T3 es una página de marketing (`jetbrains.com/lp/compose-multiplatform`, `modulo-7.md:130,454`). | Medio. | Una versión en la spec. Enlazar kotlinlang.org/docs/multiplatform. |
| Cobertura | 0 apariciones de Room KMP, DataStore KMP y ViewModel/Lifecycle multiplataforma (solo 1 mención de ViewModel en M2). Son las bibliotecas Jetpack que comparte el curso Android. | Medio: el curso enseña SQLDelight y Koin, pero no el camino que tomaría un equipo Android que migra. | Tema comparativo SQLDelight frente a Room KMP en M6. ViewModel compartido en M7. |
| Promesa frente a contenido | M7 promete «Navegación multiplataforma» (`kotlin-multiplatform.track.ts:104`), pero el cierre del tema dice «(conceptualmente) un grafo de navegación» (`modulo-7.md:454`): no se implementa. M2 promete `kotlinx.atomicfu` (`track:35`, 0 apariciones). M9 promete «Cobertura de la capa compartida» (`track:130`, 0 apariciones de cobertura/Kover). M1 compara con «JavaScript» (`track:20`). | Medio. | Implementar navegación en M7 T3 (ya existe M7 T6 con `navigation-compose`). Quitar atomicfu o enseñarlo. Añadir Kover o retirar la promesa. |
| Solapamientos internos | M12 T3 «artefacto compatible»: validación de ABI (`modulo-12.md:196`) frente a M13 T6 «Compatibilidad binaria y CI multi-target» (`modulo-13.md:305`). XCFramework: M8 T3 (`modulo-8.md:215`) frente a M13 T4 (`:202`). Kotlin/Native y memoria: M12 T2 (`:110`) frente a M13 T1–T2. Errores tipados: M4 T4 `Result` (`modulo-4.md:414`) frente a M5 T2 (`modulo-5.md:145`). CI: M10 T1 frente a M13 T6. | Medio: M12 y M13 se cruzan en la mitad de sus temas. | Fusionar M12 y M13 en un «KMP para producción y publicación» de unos 7 temas. M5 T2 reutiliza el `Result` de M4. |
| Repetición entre cursos | M0–M2 (Kotlin, funcional, coroutines) son 7,5 h que repiten Android M0 T4–T6 (§0.3). | Medio. | Prerrequisito común. |
| Carga | M7 tiene 8 temas en 3 h (6 min para cada tema sin duración en el título). M11 (integrador), 7 h para 3 temas. | Medio. | M7 → 6 h. |

### 4.2 Cambios de temario propuestos

1. **[P1]** M3 sobre el **plugin Android-KMP (AGP 9)** con módulo `androidApp`. Retirar `iosX64` como predeterminado.
2. **[P1]** Spec de versiones: Kotlin 2.4.21, JDK 25 LTS, Gradle dentro de la matriz oficial y Compose Multiplatform 1.12.x.
3. **[P2]** Fusionar M12 y M13. Eliminar las repeticiones de XCFramework y CI.
4. **[P2]** Implementar la navegación compartida (M7) y añadir ViewModel KMP. Comparar Room KMP con SQLDelight (M6).
5. **[P2]** Kotlin esencial compartido con Android.
6. **[P3]** Retirar del track las promesas que no se enseñan (atomicfu, cobertura) o crear los temas correspondientes.

---

## 5. Angular (`angular`, 17 módulos, 78 temas)

### 5.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Versiones: soporte | El track dice «Arranca con la última versión **LTS** de Angular» (`angular.track.ts:5`). La versión vigente es la v22 en estado *Active*. La v21 está en LTS hasta 2027-06 y la v20 termina su LTS el **2026-11-28** ([releases](https://angular.dev/reference/releases)). M12 fecha su tabla en «julio de 2026» y codifica `mayor === 21 \|\| mayor === 20 → 'LTS'` (`angular/modulo-12.md:3,57`); en 10 días deja de ser cierto para la v20. | Medio. | «Última versión activa (v22)». En M12, que el ejercicio consulte la tabla en vivo en lugar de tener fechas fijas. |
| Cobertura: novedades de v22 | Angular 22 hizo estables **Signal Forms** y los *resources*, puso **OnPush como estrategia por defecto** (`Default` pasa a llamarse `Eager`), dejó obsoletos `withFetch()` (fetch ya es el predeterminado) y `withIncrementalHydration()` (ahora por defecto) y activó `strictTemplates` ([Ninja Squad, Angular 22.0](https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0)). En el curso: Signal Forms, 0 apariciones; OnPush/`Eager`, 0; M7 T1 «HttpClient con backend fetch» (`modulo-7.md:6`) enseña como opción algo que ya es el valor por defecto. M11 T6 basa el «fallo deliberado» en quitar `withIncrementalHydration()` (`modulo-11.md:748`), y en v22 ese fallo ya no ocurre. | Alto: M5 «Formularios» enseña solo Reactive y template-driven, sin la API de formularios estable de la versión que fija el curso (`@angular/cli@22`). | Nuevo tema «Signal Forms» en M5. Tema «OnPush por defecto y `Eager`» en M11. Reescribir M7 T1 y M11 T6. |
| Cobertura: animaciones | M15 T4 «Animaciones accesibles» usa solo `transition-duration` y `matchMedia` (`modulo-15.md:339–383`). La guía oficial presenta `animate.enter`/`animate.leave` y deja el paquete anterior como «Legacy Animations» ([guía de animaciones](https://angular.dev/guide/animations)). | Medio. | M15 T4 con `animate.enter`/`animate.leave` + `prefers-reduced-motion`. |
| Promesa frente a contenido | El track anuncia API retiradas o que no se enseñan: «Angular Universal» y «webpack-bundle-analyzer» (`angular.track.ts:151`; el curso usa `@angular/ssr` y el builder con esbuild); `mutate()` (`:32`, eliminado de signals; 0 apariciones); «`providedIn: platform/any`» (`:47`, 0 apariciones); «fakeAsync, tick() y flush()» y «DebugElement, By.css()» (`:138`, 0 apariciones en M10); `ChangeDetectionStrategy.OnPush` (`:151`, 0); «NgRx Entities… Akita, Elf y NGXS» (`:125`, 0); «Dockerización… GitHub Actions… Module Federation» en el integrador (`:176`, 0); `ngClass`/`ngStyle` (`:19`, 0). | Alto: el catálogo vende 14 conceptos que el estudiante no encontrará, y algunos están retirados. | Reescribir los `concepts` de M1, M2, M3, M9, M10, M11 y M13 según el contenido real. Si el dueño quiere esos temas, que pasen por spec. |
| Solapamientos internos | SSR e hidratación: M11 T1–T2 (`modulo-11.md:8,126`) y M15 T5–T6 (`modulo-15.md:468,580`); M15 T6 vuelve a explicar la discrepancia servidor/cliente de M11 T2. TestBed: M10 T1 «input() con `setInput`» (`modulo-10.md:6`) y M15 T1 «`setInput`… forzar detección» (`modulo-15.md:8`), casi el mismo objetivo. Zoneless: M2 T4 (`modulo-2.md:422`) y M11 T4. Standalone: M0 T1 «El CLI ya no genera NgModules» y M8 completo. | Medio. | M15 se queda con E2E, animación y TransferState. M15 T1 y T6 se fusionan en M10 y M11. M2 T4 queda como avance de 10 min o se elimina. |
| Progresión | M0 T1 empieza por lo histórico («El CLI ya no genera NgModules», `modulo-0.md:76`) cuando el estudiante «no necesita haber programado antes» (`:6`). M0 T3 «TypeScript a fondo» (unknown/never/utility types) cabe en un módulo de 2 h. El apéndice M12 (AngularJS → Ivy) está antes del integrador M13. | Medio. | M0 T1 = primer componente. Mover TypeScript avanzado a un prerrequisito (curso JS/TS) o después de M3. M12 como apéndice tras el integrador. |
| Alcance | M16 «Angular Native» dedica 5 h de la ruta principal a un proyecto «experimental (no oficial…), alpha, versión `0.x`» (`modulo-16.md:5`). | Medio: es tiempo de la ruta principal en una dependencia sin soporte, mientras faltan Signal Forms y animaciones. | Pasarlo a optativo. Si el dueño quiere cubrir apps móviles con Angular, comparar con Capacitor/Ionic. |
| Carga | M8: 5 temas en 2 h (8 min para cada tema sin duración en el título). M13 (integrador): 6 h para 3 temas. | Medio. | Recalcular. |

### 5.2 Cambios de temario propuestos

1. **[P1]** Alinear con v22: Signal Forms (M5), OnPush por defecto (M11), reescribir M7 T1 y M11 T6. Spec de versiones con «v22 activa, v21 LTS» y fecha.
2. **[P1]** Reescribir los `concepts` del track que hoy anuncian API retiradas o no enseñadas.
3. **[P2]** Fusionar M15 T1 en M10 y M15 T6 en M11. M15 = E2E, animación (`animate.enter/leave`) y TransferState.
4. **[P2]** M0 sin enfoque histórico. TypeScript avanzado fuera de M0. Apéndice M12 tras el integrador.
5. **[P3]** M16 Angular Native como optativo.

---

## 6. Lista priorizada global (para aprobación del dueño; no aplicada)

| # | Prioridad | Curso | Cambio |
|---|---|---|---|
| 1 | P1 | Flutter | Fusionar 13+18, 14+19 y 15+20, eliminar M18 T1 y unificar la arquitectura (§3.1). Ahorra unas 15 h repetidas. |
| 2 | P1 | Todos | Registrar en spec la línea de versiones por curso (Android API 36/AGP 9; Xcode 27/Swift 6.4; Flutter 3.50/Dart 3.14; Kotlin 2.4.21/CMP 1.12/JDK 25; Angular 22) con fecha de revisión. Retirar los apartados «Revisión oficial — julio 2026». |
| 3 | P1 | Android | Navigation 3; LazyColumn, Scaffold y edge-to-edge en M2; requisitos vigentes de Play en M11. |
| 4 | P1 | KMP | Plugin Android-KMP (AGP 9) en M3. |
| 5 | P1 | Angular | Signal Forms, OnPush por defecto y track sin API retiradas. |
| 6 | P1 | iOS | Base Xcode 27/Swift 6.4, concurrencia 6.2+ en M4 y Liquid Glass en M10. |
| 7 | P1 | Flutter | Migrar las lecciones a `material_ui`/`cupertino_ui`. |
| 8 | P2 | Android, Flutter | Integrador al final de la ruta principal. Módulos avanzados de nicho como optativos (Flutter M16, M17, M21, M22; Angular M16). |
| 9 | P2 | Android, KMP | «Kotlin esencial» único compartido. |
| 10 | P2 | Todos | Recalcular horas como suma de temas de 20–45 min (§0.1). |
| 11 | P2 | iOS, KMP, Angular, Android | Fusiones internas: iOS M13 T2/T5, M9/M14 y UIKit; KMP M12/M13; Angular M10/M15 y M11/M15; Android M9/M14, M2/M4 y M10/M17/M18. |
| 12 | P3 | Todos | Producción móvil: un modelo conceptual común (outbox, idempotencia, rollout) y la implementación nativa en cada curso. |

---

## Fuentes (consultadas el 2026-11-18)

- Android:
  - [Navigation 3 estable](https://developer.android.com/blog/posts/jetpack-navigation-3-is-stable)
  - [Requisito de target SDK de Play](https://developer.android.com/google/play/requirements/target-sdk)
  - [Cambios de comportamiento de Android 16](https://developer.android.com/about/versions/16/behavior-changes-16)
  - [Tamaño de página de 16 KB](https://developer.android.com/guide/practices/page-sizes)
  - [Android Basics with Compose](https://developer.android.com/courses/android-basics-compose/course)
- Apple y Swift:
  - [Xcode 27.1 release notes](https://developer.apple.com/documentation/xcode-release-notes/xcode-27_1-release-notes)
  - [Swift 6.3](https://swift.org/blog/swift-6.3-released/)
  - [Swift 6.2](https://www.swift.org/blog/swift-6.2-released/)
- Flutter y Dart:
  - [Material/Cupertino como paquetes](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)
  - [Notas de Flutter 3.50.0](https://docs.flutter.dev/release/release-notes/release-notes-3.50.0)
  - [Guía de arquitectura](https://docs.flutter.dev/app-architecture/guide)
  - [Macros de Dart](https://dart.dev/go/macros)
  - [Very Good Ventures: Flutter 3.50 y Dart 3.14](https://verygood.ventures/blog/flutter-3-50-dart-3-14/) (secundaria; se usó para Dart 3.14, el cambio de `flutter create` y CocoaPods)
- Kotlin:
  - [Releases de Kotlin](https://kotlinlang.org/docs/releases.html)
  - [Novedades de Kotlin 2.4.20](https://kotlinlang.org/docs/whatsnew2420.html)
  - [Migración KMP a AGP 9](https://kotlinlang.org/docs/multiplatform/multiplatform-project-agp-9-migration.html)
  - [Soporte de destinos nativos](https://kotlinlang.org/docs/native-target-support.html)
  - [Compatibilidad de Compose Multiplatform](https://kotlinlang.org/docs/multiplatform/compose-compatibility-and-versioning.html)
- Angular:
  - [Versiones y soporte](https://angular.dev/reference/releases)
  - [Guía de animaciones](https://angular.dev/guide/animations) (sitio construido con v22.3.0)
  - [Ninja Squad: Angular 22.0](https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0) (secundaria; se usó para el detalle de los cambios de v22)
