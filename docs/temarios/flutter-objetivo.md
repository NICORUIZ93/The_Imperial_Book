# Temario objetivo · Flutter (3.50) y Dart (3.14), de cero a experto

**Estado:** Aprobado por el dueño el 2026-11-20, con la opción recomendada en cada decisión. (specs/021, Fase 3, criterio Z2). No hay lecciones escritas ni
cambiadas: este documento solo fija qué temas tendrá el curso, en qué orden y de dónde sale cada uno.
**Variante:** extendida (regla 10 de specs/021: nunca la reducida).
**Fecha de revisión de fuentes:** 2026-11-20.
**Versión de referencia:** Flutter 3.50 y Dart 3.14, las estables que documentan docs.flutter.dev y dart.dev
en esa fecha. `docs/VERSIONES.md` es la fuente de las versiones de la academia y anota que el Mac del dueño
tenía Flutter 3.47.2 el 2026-11-18: hay que actualizarlo y confirmarlo antes de escribir (sección 1.4).
**Identificador de ruta:** `flutter` (se conserva, y con él el progreso de lectura).
**Posición en la academia:** 4.º curso prioritario (specs/021 §5).

## 1. Resumen

### 1.1 El curso hoy

El listado medido (`docs/reestructuracion/listado-de-temas.csv`, filas `flutter`) tiene **119 temas en 23
módulos** (M0–M22), en `web/public/content/flutter/modulo-N.md`.

| Nivel declarado hoy | Temas | % |
|---|---:|---:|
| Básico | 4 | 3 % |
| Intermedio | 50 | 42 % |
| Avanzado | 62 | 52 % |
| Experto | 3 | 3 % |

- Hoy el 55 % de los temas está declarado Avanzado o Experto (65 de 119): la regla «al menos
  la mitad» se cumple en la etiqueta, pero **solo hay 4 temas de nivel Básico**. El curso no empieza de cero:
  no enseña a instalar, ni el lenguaje paso a paso (Dart entero cabe en 7 temas), ni los widgets, listas,
  formularios y navegación elementales que todas las fuentes ponen al principio.
- **67 de los 119 temas tienen menos de 900 palabras** y 24 no tienen diagrama ni imagen.
- Hay tres pares de módulos que enseñan lo mismo dos veces: M13 y M18 (producción: frontera nativa,
  secretos, frames, telemetría), M14 y M19 (entregas: mapa, tiempo real, offline) y M15 y M20 («Flutter
  Master»: pruebas, arquitectura, i18n, release). En el temario objetivo cada par se fusiona (anexo A).
- De los 119 temas, 117 alimentan el temario objetivo y 2 pasan a ser el proyecto final (M12 T2 y T3).
  Ninguno se retira.

### 1.2 El curso objetivo

**345 temas en 52 módulos** (de 4 a 7 temas cada uno), en los cuatro tramos del formato único.

| Tramo (nivel) | Módulos | Temas | Ya está | Está pero básico | Falta |
|---|---|---:|---:|---:|---:|
| Fundamentos (Básico) | M0–M9 | 64 | 7 | 14 | 43 |
| Aplicación (Intermedio) | M10–M22 | 91 | 17 | 30 | 44 |
| Integración (Avanzado) | M23–M41 | 122 | 13 | 40 | 69 |
| Experto (Experto) | M42–M51 | 68 | 3 | 17 | 48 |
| **Total** | M0–M51 | **345** | **40** | **101** | **204** |

- **Integración + Experto: 190 de 345 temas (55 %)**. Cumple la regla «al menos la mitad».
- **Faltan 204 temas** (59 %): no existen hoy en el curso.
- **101 temas están pero son básicos** (29 %): existen, y cada fila dice qué les falta para llegar al
  nivel maestro.
- **40 temas ya están** (12 %) con la profundidad suficiente. También pasan al formato de 12 secciones en
  la Fase 5, como todos.
- Duración estimada: 345 temas a 40 min de media ≈ 230 h, más unas 25 h de proyecto final. Es una
  estimación; los minutos reales se fijan tema a tema (20–45 min) al escribirlos.
- Dart ocupa siete módulos propios en Fundamentos y Aplicación (M1–M4 y M10–M12) y cuatro más en los
  tramos altos (isolates, VM, metaprogramación y FFI). Se pueden estudiar con `dart run`, sin Flutter.

### 1.3 Cómo se decidió el estado de cada tema

- **ya está**: hay un tema actual dedicado al asunto, con unas 900 palabras o más.
- **está pero básico**: el asunto aparece, pero en un tema corto (menos de unas 900 palabras según el CSV),
  compartido con otros asuntos, o sin la parte interna, el error real o la medición. La fila dice qué falta.
- **falta**: ningún tema actual lo trata.

**Límite de esta clasificación:** se hizo con el título, el nivel, el número de palabras y la columna
«diagrama o imagen» de cada tema en el CSV, no leyendo las 119 lecciones línea a línea. La columna «qué
falta» es la lista de lo que el tema objetivo exige; al reescribir cada tema (Fase 5) se comprueba contra la
lección real y lo que ya esté se conserva.

Entre paréntesis va el tema actual de origen con la numeración de hoy (por ejemplo, «M5 T3» es el tema 3 del
módulo 5 actual). Un tema actual puede alimentar a más de un tema objetivo cuando se parte, y varios temas
actuales cortos pueden fusionarse en uno. El anexo A da el destino de los 119 temas actuales, uno por uno.

### 1.4 Rigor de versiones (Flutter 3.50 y Dart 3.14)

Datos tomados el 2026-11-20 de las páginas oficiales citadas en la sección 6.1. Nada de esta tabla se ejecutó:
en esta máquina no hay Flutter instalado, y cada dato se vuelve a comprobar en el Mac del dueño antes de
escribir su tema (regla 9 de specs/021).

| Asunto | Estado según la fuente oficial | Fuente |
|---|---|---|
| Versión estable | Flutter 3.50.0 es la última de la lista de estables; la entrada de novedades de 3.50 lleva fecha 2026-11-11. dart.dev documenta Dart 3.14.0 | Release notes, What's new (Flutter); dart.dev |
| Plataformas de Flutter 3.50 | Android API 24 a 37; iOS 15 a 27; Windows 10 y 11; macOS 12 a 27; Debian 10 a 13 y Ubuntu 20.04 a 24.04 LTS; Chrome y Edge (dos últimas), Firefox (dos últimas) y Safari 15.6 o superior | Supported platforms |
| Impeller | iOS: único motor de render, sin vuelta a Skia. Android: activo por defecto en API 29 o superior con Vulkan, y con OpenGL como respaldo en el resto. macOS, Linux y Windows: activo por defecto desde Flutter 3.47, con una opción de desactivación que se anuncia que se retirará. Web: no usa Impeller | Impeller |
| Web | Dos compiladores (JavaScript con `dart2js`; WebAssembly con `dart2wasm` y la opción `--wasm`) y dos renderizadores (CanvasKit y Skwasm). Desde Flutter 3.50, una app compilada con `--wasm` solo usa WebAssembly en Firefox y en navegadores WebKit si la app los añade a su `wasmAllowList` | Web renderers, Supported platforms |
| Hilos | El hilo de interfaz y el de plataforma están fusionados en iOS y Android desde Flutter 3.29, y en Linux desde 3.41 | Architectural overview, Breaking changes |
| Material y Cupertino | Flutter 3.50 declara obsoletas las bibliotecas incluidas en el SDK y documenta la migración a los paquetes `material_ui` y `cupertino_ui` con `dart fix` | What's new 3.50, Breaking changes |
| Widget Previewer | Estable desde Flutter 3.47 | What's new 3.47 |
| Interop nativo | La documentación de 3.50 recomienda Pigeon, `package:ffigen` y `package:jnigen` para proyectos nuevos y mantiene los platform channels para paso de mensajes de bajo nivel y código existente; añade build hooks | Platform channels, What's new 3.50 |
| Swift Package Manager y Kotlin | Guías de migración a SwiftPM para apps y plugins (3.47 y 3.50) y al plugin de Kotlin integrado en Gradle (3.44) | What's new, Breaking changes |
| **Macros de Dart** | **Trabajo detenido**: el equipo de Dart declara que no publicará macros en el futuro previsible. Como alternativas nombra las augmentations (que planea publicar por separado), mejoras de build_runner y funciones de lenguaje más acotadas para datos | dart.dev/language/macros |
| Constructores primarios | La página del lenguaje exige versión de lenguaje 3.13 o superior y no menciona flag de experimento; la página de novedades los registró como experimentales en 3.12 | dart.dev (Primary constructors, What's new) |
| Funciones de lenguaje recientes | Records, patrones y modificadores de clase (3.0); extension types (3.3); separadores de dígitos (3.6); variables comodín (3.7); elementos null-aware (3.8); dot shorthands (3.10); parámetros con nombre privados (3.12) | dart.dev What's new |
| Herramientas de Dart | Pub workspaces (3.6); guía de plugins del analizador, `dart build` y `dart install` (3.10); `dart migrate` y data-driven fixes (3.14) | dart.dev What's new |
| `dart:mirrors` | Marcada como obsoleta en la documentación de Dart 3.14 | dart.dev What's new |

**Aviso sobre las versiones de Dart de la tabla:** la página «What's new» de dart.dev registra cuándo se
*documentó* cada función, que puede no coincidir con la versión del SDK en que se entregó. Cada tema cita la
versión comprobando el registro de cambios del SDK al escribirlo.

Reglas que se proponen para el curso:

1. Todo tema sobre una función que no es definitiva, o cuyo estado cambió hace poco, lo dice en el título o en
   un aviso: macros (M45 T1, como historia y alternativas, no como función utilizable), constructores primarios
   (M3 T3), WebAssembly en Firefox y Safari (M36 T1), carga diferida en Wasm (M44 T5, experimental según la
   página de novedades de 3.13) y la migración a `material_ui` y `cupertino_ui` (M8 T6).
2. **Augmentations:** esta revisión no encontró su estado en dart.dev (la página de novedades no las
   nombra). No tienen tema propio; M45 T1 dirá su estado tras comprobarlo.
3. **Nombres de API y opciones de línea de comandos.** Las clases, métodos y opciones de Flutter que aparecen en los títulos (por ejemplo `PopScope`,
   `AppLifecycleListener`, `ListenableBuilder`, `SliverGeometry` o `--split-debug-info`) y las API de paquetes de terceros (por
   ejemplo `StatefulShellRoute` de go_router o `AsyncNotifier` de Riverpod) **no se abrieron una a una en
   api.flutter.dev ni en pub.dev en esta revisión**. Se comprueban contra la versión instalada antes de
   escribir cada tema; si un nombre cambió, cambia el título.
4. Los paquetes de terceros (go_router, Provider, Riverpod, Bloc, dio, json_serializable, freezed, sqflite,
   Drift, Hive, Isar, mocktail, Mockito, Patrol, Formz, workmanager, Pigeon, ffigen, jnigen,
   `flutter_secure_storage`, `in_app_purchase`, los SDK de Firebase, Sentry y los de anuncios) no tienen versión
   en este documento: se fijan en `docs/VERSIONES.md` y en el `pubspec.yaml` de cada laboratorio antes de
   escribir su módulo, comprobando que siguen mantenidos.
5. Todo dato de rendimiento se mide en modo profile y en un dispositivo real, nunca en debug ni en emulador.


## 2. Temario objetivo completo

Orden lineal: los módulos se estudian en el orden M0 → M51 y el nivel no baja. Las abreviaturas de la
columna «Fuentes» están en la sección 6; entre paréntesis va la sección del índice de donde sale el tema.


### Tramo 1 · Fundamentos (nivel Básico) — 64 temas

#### M0 · Plataforma, herramientas y primera app (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué son Flutter y Dart hoy: framework, motor, embebedor, plataformas soportadas y ritmo de versiones estables | Básico | **falta** | AO·PLAT·FiA c1·FfB c1, c3·UNAM 1·FM intro |
| 2 | Instalar Flutter 3.50 y convivir con varias versiones: `flutter doctor`, `PATH`, FVM y las herramientas de Android y Xcode | Básico | **falta** | FD (Install)·FM c2·FCC 2·RM·YT-ES 5–7 |
| 3 | `flutter create`: anatomía del proyecto, `pubspec.yaml` y carpetas de cada plataforma | Básico | **falta** | FM c2·UNAM 3·YT-ES 12·PLZ 3·FCC 8–10 |
| 4 | Ejecutar en emulador, simulador, teléfono y navegador; hot reload y hot restart y qué estado conserva cada uno | Básico | **falta** | FD (Hot reload)·FM c2·UD c3·PLZ 2 |
| 5 | El IDE, el depurador y DevTools por primera vez: Inspector de widgets y puntos de parada | Básico | **está pero básico** (M8 T2): hoy DevTools solo aparece para detectar jank (858 palabras); falta el primer uso guiado del depurador y del Inspector | FD (Tools)·DT·RM·YT-ES 13·UD c3 |
| 6 | DartPad, `dart run` y el Widget Previewer (estable desde Flutter 3.47) para probar sin dispositivo | Básico | **falta** | DD (Tools)·WN·RM |

#### M1 · Dart I: valores, tipos y control de flujo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Variables: `var`, `final`, `const`, `late` e inferencia de tipos | Básico | **falta** | DD (Variables)·FM c1·FCC 3·RM·UNAM 2 |
| 2 | Tipos integrados: `int`, `double`, `num`, `bool` y cómo cambian los números entre nativo y web | Básico | **falta** | DD (Built-in types, Number representation)·FM c1·FfB c2 |
| 3 | `String`: interpolación, cadenas multilínea, runas y grafemas (por qué `length` engaña con emojis) | Básico | **falta** | DD (Built-in types)·DA c1 |
| 4 | Operadores: aritméticos, de igualdad, cascada `..`, `??`, `?.` y propagación | Básico | **falta** | DD (Operators)·RM·FfB c2 |
| 5 | Control de flujo: `if`, bucles, etiquetas, `switch` clásico y `assert` | Básico | **falta** | DD (Loops, Branches)·DWN 3.8·FCC 4·FM c1·RM |
| 6 | Null safety sólida: tipos anulables, promoción, `!`, `late` y por qué a veces la promoción falla | Básico | **ya está** (M0 T1) | DD (Null safety, Fixing type promotion failures)·DWN 3.13·FCC 5·FM c1 |
| 7 | Errores: `Exception` frente a `Error`, `try`/`on`/`catch`/`finally`, `rethrow` y lectura de la traza | Básico | **falta** | DD (Error handling)·DA c10 |

#### M2 · Dart II: funciones y colecciones (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Funciones: parámetros posicionales, con nombre, opcionales, `required` y valores por defecto | Básico | **falta** | DD (Functions)·FM c1·FCC 3·RM |
| 2 | Funciones como valores: anónimas, closures, tear-offs y `typedef` | Básico | **falta** | DD (Functions, Typedefs)·DWN 3.5·DA c2·RM |
| 3 | `List`, `Set` y `Map`: literales, `if` y `for` de colección, spread y elementos null-aware (documentados con Dart 3.8) | Básico | **falta** | DD (Collections)·DWN 3.8·FCC 4·RM |
| 4 | `Iterable` perezoso: `map`, `where`, `fold`, `expand` y cuándo se evalúa de verdad | Básico | **está pero básico** (M0 T3): hoy comparte un tema con futures; faltan la evaluación perezosa demostrada y el coste de recorrer dos veces | DD (Iterable collections)·FM c1 |
| 5 | Colecciones inmutables y constantes: `const`, vistas no modificables e igualdad de colecciones | Básico | **falta** | DD (Collections)·RM (Immutability) |
| 6 | Records, primer contacto: devolver varios valores y desestructurarlos (se parte: aquí el uso; el detalle va a Aplicación) | Básico | **ya está** (M0 T6) | DD (Records)·DWN 3.0, 3.8·FM c1 |

#### M3 · Dart III: clases y objetos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Clases, campos, métodos, getters, setters y `this` | Básico | **está pero básico** (M0 T2): hoy comparte 1.141 palabras con mixins; faltan getters y setters, campos `static` y `late final`, y el modelo de referencias dibujado | DD (Classes, Methods)·FCC 6·FfB c4·RM |
| 2 | Constructores: generativos, con nombre, de redirección, `const`, `factory` y lista de inicialización | Básico | **falta** | DD (Constructors)·FfB c4·FCC 6 |
| 3 | Constructores primarios y sintaxis concisa (versión de lenguaje 3.13 o superior) | Básico | **falta** | DPC·DWN 3.12–3.14 |
| 4 | Herencia, `super`, sobrescritura y `covariant` | Básico | **falta** | DD (Extend a class)·DA c3 |
| 5 | Clases abstractas e interfaces implícitas con `implements` | Básico | **falta** | DD (Classes)·DA c4–c5·ENT1 |
| 6 | Mixins: `with`, `on`, orden de linearización y cuándo sustituyen a la herencia | Básico | **está pero básico** (M0 T2): faltan la restricción `on`, el orden de linearización trazado y la comparación con extension methods que piden las entrevistas | DD (Mixins)·DA c6·ENT-S 3·FM c1 |
| 7 | Enums simples y mejorados, y dot shorthands (documentados con Dart 3.10) | Básico | **falta** | DD (Enums, Dot shorthands)·DWN 3.10·DA c9·FCC 6 |

#### M4 · Dart IV: asincronía esencial y paquetes (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El bucle de eventos: un solo hilo de ejecución por isolate y la cola de eventos, dibujados | Básico | **falta** | DCON·ENT1·FiA c9 |
| 2 | `Future`, `async`/`await` y errores asíncronos | Básico | **está pero básico** (M0 T3): hoy comparte tema con colecciones; faltan el error sin capturar, el `await` olvidado y `Future.wait` | DCON·DD (dart:async, Futures and error handling)·DA c12·FCC 7·RM |
| 3 | `Stream`, primer uso: `await for`, suscripción y cancelación | Básico | **ya está** (M0 T5) | DCON·DD (Using streams)·DA c13·FA c14·RM |
| 4 | Bibliotecas e imports: `show`, `hide`, `as`, privacidad con `_` y `part` | Básico | **falta** | DD (Libraries & imports) |
| 5 | pub y pub.dev: dependencias, restricciones de versión, `pubspec.lock` y cómo evaluar un paquete antes de usarlo | Básico | **falta** | DD (Packages)·FD (Using packages, Dependency management)·RM·FfB c9–c10·UNAM 6 |
| 6 | `dart format`, `dart analyze`, lints y `analysis_options.yaml` | Básico | **está pero básico** (M0 T4): 800 palabras; faltan `dart fix`, el formato al guardar y las opciones de análisis compartidas | DD (Static analysis, dart format, dart fix)·DWN 3.7, 3.11 |

#### M5 · Widgets: el modelo declarativo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Todo es un widget: `runApp`, composición y la interfaz como función del estado | Básico | **falta** | AO·FiA c3·FA c2, c4·FM c3·UNAM 4·YT-ES 8–9 |
| 2 | `StatelessWidget`, `build` y `BuildContext` como posición en el árbol | Básico | **está pero básico** (M1 T1): el tema actual compara los dos tipos; falta explicar `BuildContext` y por qué `build` debe ser puro y barato | AO·FM c3·UNAM 5·PLZ 5·YT-ES 10 |
| 3 | `StatefulWidget` y `State`: `setState`, `initState` y `dispose` | Básico | **ya está** (M1 T1, M1 T2) | AO·FM c3·UNAM 5·YT-ES 26·UD c2 |
| 4 | Widgets básicos: `Text`, `Icon`, `Image`, `Container`, `Padding` y `SizedBox` | Básico | **falta** | FD (Widget catalog)·FA c3·FM c3·UNAM 4·YT-ES 14–22·PLZ 6 |
| 5 | Estructura de una pantalla: `Scaffold`, `AppBar`, botón flotante y navegación inferior | Básico | **falta** | FD (Material)·YT-ES 17–18·UNAM 4·FA c3 |
| 6 | Assets, imágenes (resolución, red y caché) y fuentes propias | Básico | **falta** | FD (Assets & media, Fonts & typography)·RM·YT-ES 15, 24–25·PLZ 9 |
| 7 | Leer los errores de Flutter: pantalla roja, franjas de desbordamiento y `setState` después de `dispose` | Básico | **falta** | FD (Common errors, Debugging tools)·ENT10·FfB c12 |

#### M6 · Layout I: restricciones, filas, columnas y listas (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | La regla del layout: las restricciones bajan, los tamaños suben y el padre posiciona | Básico | **ya está** (M2 T2) | FD (Constraints)·FM c4·ENT6·AO |
| 2 | `Row`, `Column`, ejes, `Expanded`, `Flexible`, `Spacer` y el desbordamiento de `RenderFlex` diagnosticado | Básico | **está pero básico** (M1 T2): hoy comparte 1.005 palabras con `Stack` y el ciclo de vida; faltan `Flexible` frente a `Expanded` y el desbordamiento reproducido | FD (Layout)·FM c4·YT-ES 19–20·PLZ 6·ENT2 |
| 3 | `Stack`, `Positioned` y `Align` | Básico | **está pero básico** (M1 T2): se nombra dentro de otro tema; faltan el tamaño de un `Stack` y los hijos no posicionados | FM c4·FD (Layout)·ENT2 |
| 4 | Cajas que cambian restricciones: `Container` por dentro, `SizedBox`, `ConstrainedBox`, `FittedBox` y `AspectRatio` | Básico | **falta** | FD (Constraints, Widget catalog)·FM c3–c4 |
| 5 | Listas: `ListView`, `ListView.builder`, `ListView.separated` y `ListTile` | Básico | **falta** | FD (Lists & grids)·FA c5·FM c3·YT-ES 23·PLZ 15 |
| 6 | Cuadrículas y otros desplazamientos: `GridView`, `SingleChildScrollView` y `PageView` | Básico | **falta** | FD (Lists & grids, Scrolling)·FA c5·FM c4 |

#### M7 · Interacción, entrada y formularios (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Toques básicos: botones, `InkWell` y `GestureDetector` | Básico | **está pero básico** (M1 T5): el tema actual empieza en la arena de gestos (nivel Avanzado); falta el primer uso guiado | FD (Gestures)·YT-ES 27–28·FfB c6·FiA c5 |
| 2 | `TextField` y `TextEditingController`: leer, escuchar cambios, tipos de teclado y `dispose` | Básico | **falta** | FD (Input & forms)·YT-ES 30, 32·UD c9·PLZ 11 |
| 3 | `Form`, `FormField` y validación de formularios | Básico | **falta** | FD (Input & forms)·YT-ES 31·FiA c5·PLZ 10–11 |
| 4 | Foco: `FocusNode`, orden de foco y teclado que tapa los campos | Básico | **falta** | FD (Input & forms, Keyboard focus)·YT-ES 33 |
| 5 | Diálogos, hojas inferiores y snackbars | Básico | **falta** | FD (Snackbars)·YT-ES 36–38 |
| 6 | Controles de selección: casillas, interruptores, deslizadores, desplegables y selectores de fecha | Básico | **falta** | FD (Widget catalog, Input)·BC 3.50·FA c7 |

#### M8 · Navegación básica y tema (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `Navigator`: `push`, `pop`, la pila de rutas y devolver un resultado | Básico | **falta** | FD (Navigation & routing)·YT-ES 29·UNAM 8·FM c6·PLZ 7, 12 |
| 2 | Pasar argumentos entre pantallas y rutas con nombre: uso y límites | Básico | **falta** | FD (Navigation & routing)·UNAM 8·FCC 20·FM c6 |
| 3 | Pestañas, barra de navegación y `Drawer` | Básico | **falta** | FD (Navigation & routing)·YT-ES 35·UD c7 |
| 4 | `ThemeData` con Material 3: `ColorScheme`, tipografía y temas de componentes | Básico | **está pero básico** (M10 T1): 835 palabras; faltan los temas de componentes y la actualización de tokens de Material 3 (Flutter 3.41) | FD (Themes)·BC 3.41·FiA c4·FM c15 |
| 5 | Modo oscuro y `ThemeMode` | Básico | **está pero básico** (M10 T3): hoy es un apartado dentro del tema de accesibilidad; falta el cambio en caliente y guardar la preferencia | FM c15·FD (Themes) |
| 6 | Material y Cupertino desde Flutter 3.50: los paquetes `material_ui` y `cupertino_ui` y la migración con `dart fix` | Básico | **falta** | WN 3.50·BC 3.50 |

#### M9 · Primera app completa: estado local, datos y prueba (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Estado efímero frente a estado de la app, y subir el estado | Básico | **falta** | FD (State management)·FM c5·FA c13 |
| 2 | `setState` y sus límites | Básico | **ya está** (M4 T1) | FD (State management)·RM·FM c5·UNAM 6 |
| 3 | `FutureBuilder` y `StreamBuilder`: los estados de carga, error y dato | Básico | **falta** | PLZ 15–16·FiA c9·FA c14·ENT3 |
| 4 | Primera petición HTTP y JSON decodificado a mano | Básico | **está pero básico** (M5 T1): el tema actual compara `http` y `dio`; falta el primer `GET` guiado con `jsonDecode` y un modelo escrito a mano | FD (Networking & HTTP, JSON)·PLZ 14, 17·FiA c10 |
| 5 | Guardar preferencias con `shared_preferences` | Básico | **ya está** (M6 T1) | FD (Persistence)·FA c10·FM c8 |
| 6 | Primera prueba unitaria y primera prueba de widget | Básico | **está pero básico** (M15 T1, M20 T1): 651 y 461 palabras; falta la prueba guiada paso a paso con su fallo leído | FD (Testing)·FA c17·FCC 26 |
| 7 | Compilar e instalar en un teléfono real: APK de depuración y ejecución en un iPhone | Básico | **falta** | FD (Install, Deployment)·PLZ 24·UNAM 10·WN 3.50 |


### Tramo 2 · Aplicación (nivel Intermedio) — 91 temas

#### M10 · Dart V: sistema de tipos, genéricos y patrones (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Sistema de tipos sólido: subtipado, `Object?`, `dynamic`, `Never` y `void` | Intermedio | **falta** | DD (Type system)·DWN 3.8·ENT12 |
| 2 | Genéricos: clases, métodos, límites y parámetros F-acotados | Intermedio | **falta** | DD (Generics)·DWN 3.8·DA c8·FM c1 |
| 3 | Varianza: covarianza de los genéricos de Dart, `covariant` y el error que aparece en ejecución | Intermedio | **falta** | DD (Type system, Generics)·ENT12 |
| 4 | Inferencia de tipos: hacia abajo, hacia arriba y con límites (algoritmo documentado con Dart 3.7) | Intermedio | **falta** | DD (Type system)·DWN 3.7 |
| 5 | Records a fondo: tipos estructurales, campos con nombre, igualdad y records como datos simples | Intermedio | **está pero básico** (M0 T6): 956 palabras para records y patrones juntos; faltan el tipo estructural, la igualdad y los límites frente a una clase | DD (Records)·DWN 3.8·FM c1 |
| 6 | Patrones: tipos de patrón, `switch` de expresión, guardas, `if-case` y exhaustividad | Intermedio | **está pero básico** (M0 T6): faltan los tipos de patrón uno a uno, las guardas y el orden de patrones entre paréntesis | DD (Patterns)·DWN 3.0, 3.2, 3.4·FM c1·ENT14 |
| 7 | Tipos sellados y modificadores de clase: `sealed`, `final`, `base`, `interface` y `mixin class` | Intermedio | **falta** | DD (Class modifiers)·DWN 3.0–3.1·ENT14 |

#### M11 · Dart VI: diseño de objetos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Igualdad, `hashCode`, `Comparable`, `identical` y canonicalización de constantes | Intermedio | **falta** | DD (Operators, dart:core)·ENT12 |
| 2 | Modelos inmutables y `copyWith`: a mano, con freezed y con built_value | Intermedio | **falta** | ARQ (recomendaciones)·FM c7·RM (Immutability) |
| 3 | Extension methods: añadir comportamiento sin heredar y cómo se resuelven estáticamente | Intermedio | **ya está** (M0 T7) | DD (Extension methods)·DA c7·FM c1·ENT-S 3 |
| 4 | Extension types: envoltorios sin coste en ejecución | Intermedio | **está pero básico** (M0 T7): comparte tema con extension methods; faltan el tipo de representación, lo que se pierde en ejecución y su uso en interop | DD (Extension types)·DWN 3.3 |
| 5 | Objetos invocables, operadores sobrecargados y parámetros con nombre privados (Dart 3.12) | Intermedio | **falta** | DD (Callable objects, Operators)·DWN 3.12 |
| 6 | Metadatos y anotaciones: `@override`, variantes de `@Deprecated`, `@mustBeConst` y comentarios de documentación | Intermedio | **falta** | DD (Metadata, Comments)·DWN 3.4, 3.6, 3.9, 3.10 |
| 7 | Effective Dart: estilo, uso y diseño de APIs | Intermedio | **falta** | DWN 3.13·DD (Linter rules) |

#### M12 · Dart VII: asincronía a fondo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Futures a fondo: encadenamiento, `Future.wait`, `Future.any`, `Completer`, plazos y errores sin capturar | Intermedio | **está pero básico** (M0 T3): faltan `Completer`, los plazos y qué ocurre con un error que nadie espera | DD (Futures and error handling)·DA c12·ENT11 |
| 2 | Microtareas frente a eventos: predecir el orden de ejecución de un programa | Intermedio | **falta** | DCON·ENT11·DA c11 |
| 3 | Streams a fondo: suscripción única frente a difusión, `StreamController`, pausa y cancelación | Intermedio | **ya está** (M0 T5) | DD (Using streams, Creating streams)·DA c13·FA c14·ENT-S 3 |
| 4 | Crear y transformar streams: `async*`, `yield*`, `asyncMap` y `StreamTransformer` | Intermedio | **está pero básico** (M0 T5): faltan los generadores asíncronos y los transformadores propios | DD (Creating streams)·DCON·RM (Reactive Programming) |
| 5 | Cancelación y plazos de operaciones asíncronas: suscripciones, `Timer` y tokens de cancelación | Intermedio | **falta** | DD (dart:async)·ENT11 |
| 6 | `Zone`: `runZonedGuarded`, valores de zona y captura global de errores | Intermedio | **falta** | DD (dart:async)·FD (Handle errors)·FM c16 |
| 7 | Isolates, primer uso: `Isolate.run` y `compute` para no congelar la interfaz | Intermedio | **ya está** (M8 T4) | DCON·FD (Concurrency & isolates)·DA c14·ENT7·RM |

#### M13 · Layout II: scroll, slivers y diseño adaptable (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El viewport y la construcción a demanda: cómo `ListView.builder` solo crea lo visible | Intermedio | **falta** | IF (Infinite scrolling)·FiA c9·ENT7 |
| 2 | Slivers: `CustomScrollView`, `SliverList`, `SliverGrid` y `SliverAppBar` | Intermedio | **falta** | FD (Slivers, floating app bar)·FA c6·FM c3 |
| 3 | Cabeceras persistentes, parallax y `NestedScrollView` | Intermedio | **falta** | FD (Scrolling: parallax)·FA c6 |
| 4 | `ScrollController`, física de scroll, notificaciones, paginación infinita y tirar para refrescar | Intermedio | **falta** | FiA c9·FD (Scrolling)·FA c5 |
| 5 | `MediaQuery` frente a `LayoutBuilder` | Intermedio | **ya está** (M2 T1) | FD (Adaptive & responsive)·FM c4·UD c5·UNAM 7 |
| 6 | Breakpoints propios y `SafeArea` | Intermedio | **ya está** (M2 T3) | FD (SafeArea & MediaQuery)·BC 3.50·FM c4 |
| 7 | Pantallas grandes, plegables, orientación y entrada con ratón y teclado | Intermedio | **falta** | FD (Large screens & foldables, User input & accessibility)·BC 3.44·UD c5 |

#### M14 · Widgets por dentro I: ciclo de vida, contexto y keys (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Ciclo de vida completo de `State`: `didChangeDependencies`, `didUpdateWidget`, `deactivate` y `reassemble` | Intermedio | **está pero básico** (M1 T2): hoy es un apartado de un tema de layout; faltan los métodos intermedios trazados con un registro real | ENT6·ENT10·FM c16·UD c6 |
| 2 | `BuildContext` es un `Element`: `of(context)`, `mounted` y usar el contexto después de un `await` | Intermedio | **falta** | AO·ENT6·ENT10 |
| 3 | `InheritedWidget`, `InheritedModel` e `InheritedNotifier`: cómo viajan los datos por el árbol | Intermedio | **falta** | FD (State management: options)·UNAM 5·FM c5·RM·ENT6 |
| 4 | Keys: `ValueKey`, `ObjectKey`, `UniqueKey`, `GlobalKey` y `PageStorageKey` | Intermedio | **ya está** (M1 T3) | ENT6·FM c3·ENT-S 2·UD c6 |
| 5 | `ChangeNotifier`, `ValueNotifier`, `ListenableBuilder` y `ValueListenableBuilder` | Intermedio | **falta** | FD (State management: options)·ARQ·RM |
| 6 | Widgets `const` y reconstrucciones: qué se reconstruye, por qué y cómo verlo | Intermedio | **está pero básico** (M8 T3): 987 palabras compartidas con `RepaintBoundary` y `shouldRepaint`; falta contar reconstrucciones con DevTools | IF (Sublinear widget building)·ENT7·DT |
| 7 | Componer mejor: extraer widgets frente a métodos, `Builder` y widgets que reciben `child` | Intermedio | **falta** | IF (Aggressive composability)·PLZ 8·UD c6·ENT10 |

#### M15 · Navegación declarativa (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Navigator 2.0 por dentro: `Router`, `RouterDelegate`, `RouteInformationParser` y `Page` | Intermedio | **falta** | FM c6·FiA c7·FA c8·ENT11 |
| 2 | go_router: navegación como función de la URL | Intermedio | **ya está** (M3 T1) | ARQ (recomendaciones)·FM c6·FA c8 |
| 3 | Navegación anidada: `ShellRoute`, `StatefulShellRoute` y pestañas con pila propia | Intermedio | **falta** | FM c6·FD (Navigation & routing) |
| 4 | Guards, redirecciones y flujo de autenticación en las rutas | Intermedio | **está pero básico** (M3 T2): 1.159 palabras compartidas con deep linking; falta la redirección que reacciona al estado de sesión | FM c6·FCC 23·ENT11 |
| 5 | Deep links: Android App Links, iOS Universal Links y el validador de DevTools | Intermedio | **está pero básico** (M3 T2): faltan los archivos de asociación de cada plataforma y la validación con DevTools | FD (Deep linking, Android app links, iOS universal links)·DT·FA c9·FM c6 |
| 6 | Estrategias de URL en web y el botón atrás del navegador | Intermedio | **falta** | FD (Web URL strategies)·FA c9 |
| 7 | Atrás predictivo en Android y `PopScope` | Intermedio | **falta** | FD (Android: predictive back)·ENT11 |

#### M16 · Gestión de estado comparada I: Provider, Riverpod, Bloc y MVVM (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Mapa de opciones y criterios para elegir: alcance, pruebas, equipo y coste | Intermedio | **falta** | FD (State management: options)·FM c5·ENT-S 1·ENT3·RM |
| 2 | Provider: `ChangeNotifierProvider`, `Consumer`, `Selector` y sus límites | Intermedio | **falta** | FM c5·PLZ 18, 21·RM·FA c13 |
| 3 | Riverpod: providers, `ref`, `Notifier` y `AsyncNotifier` | Intermedio | **ya está** (M4 T2) | FM c5·RM·ENT3·ENT-S 1 |
| 4 | Riverpod a fondo: familias, `autoDispose`, generación de código y sustitución en pruebas | Intermedio | **está pero básico** (M4 T5, M14 T1, M19 T1): la sustitución de implementaciones está (1.297 palabras); faltan familias, `autoDispose` y el ciclo de vida de un provider | RM·ENT3·FM c5 |
| 5 | Bloc y Cubit: eventos, estados, `BlocBuilder` y `BlocListener` | Intermedio | **está pero básico** (M4 T3): hoy comparte 1.118 palabras con «otras alternativas»; falta el flujo evento → estado completo | FM c5·FCC 39–42·RM·ENT3 |
| 6 | Bloc a fondo: transformadores de eventos, concurrencia, pruebas de un bloc y persistencia del estado | Intermedio | **falta** | ENT3·ENT7 (isolates con BLoC)·FCC 41 |
| 7 | MVVM oficial: `ViewModel` con `ChangeNotifier` y el patrón `Command` | Intermedio | **está pero básico** (M12 T4): el tema actual cubre la arquitectura entera; falta `Command` con sus estados en ejecución, completo y error | ARQ (Command, recomendaciones)·FM c16 |

#### M17 · Red: HTTP, JSON y autenticación (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `http` frente a `dio`: clientes, plazos y cierre de conexiones | Intermedio | **ya está** (M5 T1) | FD (Networking & HTTP)·FM c7·FiA c10·FA c12 |
| 2 | Modelos JSON: a mano, `json_serializable` y freezed | Intermedio | **ya está** (M5 T2) | FD (JSON)·DD (JSON serialization)·FA c11·FM c7·RM |
| 3 | Interceptores, reintentos y estados explícitos de una petición | Intermedio | **ya está** (M5 T3) | FM c7·ENT4 |
| 4 | Parseo de JSON grande en segundo plano | Intermedio | **falta** | FD (Background JSON parsing)·ENT7 |
| 5 | Autenticación con tokens: inicio de sesión, almacenamiento seguro, renovación y cierre de sesión | Intermedio | **ya está** (M5 T4) | FD (Authenticated requests)·UD c11·RM (Authentication)·ENT4 |
| 6 | WebSockets y Socket.IO: mensajes en tiempo real | Intermedio | **está pero básico** (M14 T4, M19 T4): 849 y 506 palabras; faltan el ciclo de vida de la conexión y el cierre limpio | FD (WebSockets)·FM c7 |
| 7 | Subir y descargar archivos: multipart, progreso y cancelación | Intermedio | **está pero básico** (M7 T4, M14 T6, M19 T6): la carga multipart está; faltan el progreso, la cancelación y la descarga a disco | FM c7·UD c14 |

#### M18 · Persistencia local (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Elegir almacenamiento: clave-valor, archivos, SQL o NoSQL (guía oficial «Choose a database») | Intermedio | **falta** | FD (Choose a database)·WN 3.50·FM c8 |
| 2 | Archivos: `path_provider`, carpetas correctas y escritura segura | Intermedio | **está pero básico** (M6 T5): 882 palabras; faltan la escritura atómica y qué carpeta respalda cada sistema | FD (Read/write files)·FM c8 |
| 3 | SQLite con sqflite: esquema, consultas, transacciones y migraciones | Intermedio | **está pero básico** (M6 T2): hoy compara sqflite y Hive en un solo tema; faltan transacciones y migraciones de versión | FD (SQLite)·ARQ (SQL data)·FM c8·FA c15·FCC 27 |
| 4 | SQL tipado y consultas reactivas sobre SQLite (paquete candidato: Drift, por confirmar al fijar versiones) | Intermedio | **falta** | FD (Choose a database)·FM c8 |
| 5 | NoSQL local: Hive e Isar comparados | Intermedio | **está pero básico** (M6 T2): solo aparece Hive; faltan las alternativas y el criterio | FM c8·FD (Choose a database) |
| 6 | Almacenamiento seguro: Keychain y Keystore con `flutter_secure_storage` | Intermedio | **está pero básico** (M5 T4): hoy es un apartado del flujo de tokens; faltan qué protege cada plataforma y qué ocurre al reinstalar | FM c8·ENT4 |
| 7 | Caché local de datos e imágenes | Intermedio | **está pero básico** (M14 T5, M19 T5): 611 y 497 palabras; faltan la política de caducidad y el límite de tamaño | FM c7·FD (Network images)·ENT7 |

#### M19 · Animaciones I (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Animaciones implícitas frente a explícitas | Intermedio | **ya está** (M8 T1) | FD (Animations)·FM c10·FiA c6·ENT6 |
| 2 | `AnimationController`, `Ticker`, `vsync`, `Tween` y `Curve` | Intermedio | **está pero básico** (M8 T1): se presentan en 920 palabras junto a las implícitas; faltan `Ticker`, `vsync` y el `dispose` olvidado | FD (Animations: tutorial, API overview)·FM c10·RM·ENT6 |
| 3 | `AnimatedBuilder`, `AnimatedWidget` y `TweenAnimationBuilder` | Intermedio | **falta** | FM c10·RM·ENT6·PLZ 22 |
| 4 | Animaciones `Hero` entre rutas | Intermedio | **falta** | FD (Hero animations)·FM c10·YT-ES 40·RM |
| 5 | Transiciones de página personalizadas | Intermedio | **ya está** (M3 T3) | FD (Page route transitions)·BC 3.44·UD c12 |
| 6 | Animaciones escalonadas e intervalos | Intermedio | **falta** | FD (Staggered animations)·FM c10·ENT6 |
| 7 | `AnimatedList`, `AnimatedSwitcher` y animar cambios de contenido | Intermedio | **falta** | FD (Widget catalog: Animation)·FfB c11 |

#### M20 · Pruebas I: unitarias, de widget y golden (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | La pirámide de pruebas en Flutter y qué prueba cada nivel | Intermedio | **está pero básico** (M9 T1): 957 palabras para unitarias y de widget juntas; falta el criterio de reparto con su coste | FD (Testing: overview)·FM c13·ENT-S 5 |
| 2 | Pruebas unitarias con `package:test`: grupos, matchers y código asíncrono | Intermedio | **está pero básico** (M9 T1): faltan los matchers asíncronos y el control del tiempo en pruebas | DD (Testing)·FD (Unit)·FiA c11·FCC 26 |
| 3 | Dobles de prueba: fakes frente a mocks, mocktail y Mockito | Intermedio | **está pero básico** (M9 T2): 876 palabras; falta el criterio «prefiere fakes» de la guía de arquitectura | FD (Unit: mocking)·ARQ (recomendaciones)·FM c13 |
| 4 | Pruebas de widget: `pump`, `pumpAndSettle`, finders e interacción | Intermedio | **está pero básico** (M15 T1, M15 T2, M20 T1): 651, 900 y 461 palabras repartidas; faltan los finders, el scroll y el `pumpAndSettle` que nunca termina | FD (Widget: finders, scrolling, user interaction)·FA c18·FM c13 |
| 5 | Probar estado y navegación: providers, blocs y rutas en una prueba de widget | Intermedio | **falta** | ARQ (Testing each layer)·ENT4 |
| 6 | Golden tests, primer uso | Intermedio | **está pero básico** (M15 T2, M20 T3): comparten tema con integración (900 y 464 palabras); falta generar, actualizar y leer la diferencia | FM c13·ENT4 |
| 7 | Cobertura de pruebas: generarla, leerla y no perseguirla a ciegas | Intermedio | **falta** | FD (Testing)·DD (dart test) |

#### M21 · Accesibilidad, internacionalización y diseño (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Accesibilidad con `Semantics` y lectores de pantalla | Intermedio | **ya está** (M10 T3) | FD (Accessibility)·FM c15·BC 3.47 |
| 2 | Accesibilidad visual y motora: escala de texto, contraste, tamaño de los objetivos táctiles y movimiento reducido | Intermedio | **falta** | FD (Accessibility: UI design & styling, Assistive technologies)·FM c15 |
| 3 | Internacionalización con `flutter_localizations` y `gen-l10n` | Intermedio | **está pero básico** (M15 T5, M20 T2): 769 y 442 palabras; faltan los archivos ARB con marcadores y el cambio de idioma en caliente | FD (Internationalization)·FM c15·FCC 51·PLZ 23 |
| 4 | Plurales, géneros, fechas, números y monedas con `intl` | Intermedio | **está pero básico** (M15 T5, M20 T2): aparece de pasada; faltan plurales y selección de género | FD (Internationalization)·FM c15 |
| 5 | Texto de derecha a izquierda y direccionalidad de la interfaz | Intermedio | **falta** | FD (Internationalization)·BC 3.50 |
| 6 | Adaptación Material frente a Cupertino y adaptaciones automáticas de plataforma | Intermedio | **está pero básico** (M10 T2): 899 palabras; faltan las adaptaciones automáticas y el cambio de paquetes de Flutter 3.50 | FD (Automatic platform adaptations, Cupertino design)·WN 3.50·RM |
| 7 | Sistema de diseño propio: `ThemeExtension`, tokens y catálogo de componentes | Intermedio | **falta** | FM c15·FD (Design & theming) |

#### M22 · Plataforma I: plugins, permisos y funciones del dispositivo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Usar plugins con criterio: qué instala un plugin en cada plataforma y cómo se registran | Intermedio | **falta** | FD (Using packages)·FfB c9–c10·FM c12 |
| 2 | Permisos de plataforma y cuándo escribir un platform channel propio | Intermedio | **ya está** (M7 T3) | FD (Android, iOS)·FM c12 |
| 3 | Cámara y galería: capturar una evidencia | Intermedio | **ya está** (M7 T4) | FM c12·UD c13·YT-ES 43 |
| 4 | Ubicación y mapas: permisos, flujo de posiciones y Google Maps | Intermedio | **está pero básico** (M14 T2, M19 T2): 759 y 530 palabras; faltan la precisión, el consumo de batería y la ubicación en segundo plano | FD (Maps)·UD c13·FM c12 |
| 5 | Notificaciones locales y push | Intermedio | **está pero básico** (M14 T6, M19 T6): 668 y 573 palabras compartidas con Dio; faltan los canales de Android, el permiso de iOS y la app cerrada | RM (Push Notifications)·UD c14 |
| 6 | Ciclo de vida de la app: primer plano, segundo plano, pausa y `AppLifecycleListener` | Intermedio | **falta** | FM c16·ENT10 |
| 7 | Sensores, biometría, compartir contenido y abrir enlaces externos | Intermedio | **falta** | FM c12·FfB c10·FCC 38 |


### Tramo 3 · Integración (nivel Avanzado) — 122 temas

#### M23 · Los tres árboles y el pipeline de un frame (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Los tres árboles: Widget, Element y RenderObject | Avanzado | **ya está** (M1 T4) | AO·IF·FM c3·ENT6·ENT-S 2·UD c6 |
| 2 | Reconciliación: `canUpdate`, tipo y key, y cirugía de árbol | Avanzado | **está pero básico** (M1 T4): 1.071 palabras para los tres árboles; faltan `canUpdate` y el traslado de subárboles con `GlobalKey` | IF (Linear reconciliation, Tree surgery)·ENT6 |
| 3 | Las fases de un frame: animación, build, layout, pintura, composición y semántica | Avanzado | **falta** | AO (From user input to the GPU)·ENT6·ENT-S 2 |
| 4 | `SchedulerBinding`: vsync, callbacks de frame y `addPostFrameCallback` | Avanzado | **falta** | AO·ENT6 |
| 5 | Los bindings y `runApp` por dentro: qué hace `WidgetsFlutterBinding.ensureInitialized` | Avanzado | **falta** | AO (Anatomy of an app)·ENT6 |
| 6 | El layout por dentro: `BoxConstraints`, `performLayout` y límites de relayout | Avanzado | **está pero básico** (M2 T2): el tema actual da la regla; falta el recorrido del algoritmo y por qué es sublineal | IF (Sublinear layout)·AO (Layout and rendering)·FM c4 |
| 7 | Pintura y composición: capas, `RepaintBoundary`, clips y opacidad | Avanzado | **está pero básico** (M8 T3, M15 T3): 987 y 769 palabras compartidas; falta ver las capas con las herramientas de depuración | AO·ENT7·IF (Constant-factor optimizations) |

#### M24 · Gestos, foco y entrada avanzada (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Hit testing y despacho de punteros | Avanzado | **falta** | AO (From user input to the GPU)·ENT7 |
| 2 | La arena de gestos: quién gana y por qué | Avanzado | **ya está** (M1 T5) | FD (Gestures)·FiA c5 |
| 3 | Reconocedores propios, `RawGestureDetector` y conflictos entre scrolls anidados | Avanzado | **falta** | ENT7·FD (Gestures) |
| 4 | Deslizar, arrastrar y reordenar: `Dismissible`, `Draggable` y listas reordenables | Avanzado | **está pero básico** (M1 T5): `Dismissible` está; faltan arrastrar y soltar y el cambio de `onReorder` de Flutter 3.44 | FD (Gestures: drag, swipe to dismiss)·BC 3.44 |
| 5 | Atajos y acciones: `Shortcuts`, `Actions`, `Intent` y recorrido de foco con teclado | Avanzado | **falta** | FD (Actions & shortcuts, Keyboard focus) |
| 6 | La entrada de texto por dentro: conexión con el teclado del sistema, formateadores y autocompletado | Avanzado | **falta** | BC 3.44 (TextInputConnection)·FD (Input & forms) |

#### M25 · Gráficos propios: Canvas, texto y shaders (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `CustomPainter`: dibujar con `Canvas` sin repintar de más | Avanzado | **ya está** (M8 T5) | FM c11·FiA c6·ENT7 |
| 2 | `Path`, `Paint`, gradientes, modos de mezcla, `ShaderMask` y recortes | Avanzado | **falta** | FM c11·FfB c7 |
| 3 | Texto por dentro: `TextSpan`, `RichText`, `TextPainter`, `WidgetSpan` y fuentes variables | Avanzado | **falta** | FM c3·BC 3.41, 3.50·FD (Fonts & typography) |
| 4 | Layouts propios sin `RenderObject`: `CustomMultiChildLayout`, `CustomSingleChildLayout` y `Flow` | Avanzado | **falta** | FD (Widget catalog: Layout)·ENT7 |
| 5 | Fragment shaders: escribir y cargar un shader GLSL | Avanzado | **falta** | FD (Fragment shaders) |
| 6 | Gráficos de terceros: Rive, Lottie y gráficas de datos | Avanzado | **falta** | FM c11 |

#### M26 · Animaciones II: física, coreografía y rendimiento (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Animaciones con física: simulación de resorte y gestos que sueltan con velocidad | Avanzado | **falta** | FD (Physics simulation)·FM c10·ENT6 |
| 2 | Coreografía: varios controladores, `TweenSequence` y curvas propias | Avanzado | **falta** | FM c10·FD (Staggered menu) |
| 3 | Animaciones dirigidas por scroll y por gestos | Avanzado | **falta** | FD (Parallax scrolling)·FiA c6 |
| 4 | Animar un marcador de mapa sin saltos: interpolación de posiciones | Avanzado | **está pero básico** (M14 T3, M19 T3): 578 y 485 palabras; falta la interpolación con el tiempo real entre posiciones | FD (Maps)·IF (Interpolation) |
| 5 | Rendimiento de las animaciones: el parámetro `child`, `RepaintBoundary` y transiciones frente a `Opacity` | Avanzado | **falta** | FD (Rendering performance, Best practices)·ENT6·ENT7 |
| 6 | Transiciones de contenedor y constructores de transición de página (reorganizados en Flutter 3.44) | Avanzado | **falta** | BC 3.44·FD (Animations) |

#### M27 · Gestión de estado comparada II y flujo de datos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Redux, GetX y el resto del ecosistema: qué resuelve cada uno y cuándo no usarlos | Avanzado | **está pero básico** (M4 T3): «otras alternativas» es un apartado; falta cada biblioteca con el mismo ejemplo | RM (Redux, GetX)·ENT3·FiA c8 |
| 2 | La misma función en `setState`, Provider, Riverpod y Bloc: reconstrucciones, pruebas y líneas de código medidas | Avanzado | **falta** | ENT-S 1·ENT3·FM c5 |
| 3 | Formularios profesionales con Formz y Riverpod | Avanzado | **ya está** (M4 T4) | UD c9·FiA c5 |
| 4 | Estados de interfaz como uniones selladas y flujo de datos unidireccional | Avanzado | **falta** | ARQ (recomendaciones)·DD (Class modifiers)·FM c16 (MVI) |
| 5 | Estado optimista y errores con objetos `Result` | Avanzado | **falta** | ARQ (Optimistic state, Result) |
| 6 | Restauración de estado: `RestorationMixin` y qué sobrevive a la muerte del proceso | Avanzado | **está pero básico** (M6 T4): 503 palabras y sin diagrama; faltan la restauración en iOS y en la navegación | FD (Android: state restoration, iOS: state restoration) |
| 7 | Inyección de dependencias: por constructor, con Riverpod y con un localizador de servicios | Avanzado | **ya está** (M4 T5) | ARQ (Dependency injection)·FM c9·RM |

#### M28 · Arquitectura de aplicaciones (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | La arquitectura recomendada: capa de interfaz y capa de datos con views, view models, repositorios y servicios | Avanzado | **ya está** (M12 T4) | ARQ·ENT5·FM c16 |
| 2 | Repositorios y servicios: fuente de verdad, modelos de API frente a modelos de dominio | Avanzado | **falta** | ARQ (Data layer, recomendaciones)·FM c9·RM (Repository Pattern) |
| 3 | Capa de dominio y casos de uso: cuándo se justifica | Avanzado | **está pero básico** (M15 T4, M20 T5): 659 y 449 palabras; falta el criterio «condicional» de la guía oficial con un ejemplo que lo necesite | ARQ (recomendaciones)·FM c9·ENT5 |
| 4 | Clean Architecture y organización por features | Avanzado | **está pero básico** (M12 T1): 847 palabras y sin diagrama; faltan las reglas de dependencia comprobadas por el analizador | FM c9·ENT5·ENT12 |
| 5 | Modularizar una app: paquetes locales y pub workspaces | Avanzado | **falta** | DD (Workspaces)·DWN 3.6, 3.12·FM c16 |
| 6 | Manejo global de errores: `FlutterError.onError`, `PlatformDispatcher.onError` y pantalla de error propia | Avanzado | **falta** | FD (Handle errors, Error reporting)·FM c16 |
| 7 | Probar cada capa por separado y juntas con fakes | Avanzado | **falta** | ARQ (Testing each layer, recomendaciones)·ENT5 |

#### M29 · Datos avanzados: offline-first y tiempo real (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Offline-first: fuente de verdad local y estrategias de lectura y escritura | Avanzado | **ya está** (M6 T3) | ARQ (Offline-first)·FM c7 |
| 2 | Cola de operaciones pendientes, sincronización y conflictos | Avanzado | **está pero básico** (M14 T5, M19 T5): 611 y 497 palabras; faltan la idempotencia, el orden y la resolución de conflictos | ARQ (Offline-first)·ENT13 |
| 3 | Trabajo en segundo plano con workmanager: sincronizar aunque la app esté cerrada | Avanzado | **ya está** (M7 T5) | ENT13 |
| 4 | Caché HTTP, validación condicional y paginación | Avanzado | **falta** | FM c7·ENT4 |
| 5 | GraphQL desde Flutter: consultas, mutaciones y caché normalizada | Avanzado | **falta** | RM (GraphQL) |
| 6 | Migraciones de datos locales y cómo probarlas | Avanzado | **falta** | FM c8 |
| 7 | Tiempo real robusto: reconexión, latidos y espera exponencial | Avanzado | **está pero básico** (M14 T4, M19 T4): el tema actual actualiza rutas con Socket.IO; faltan la reconexión y la pérdida de mensajes | FM c7·ENT-S 1·ENT13 |

#### M30 · Firebase y backend como servicio (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Configurar Firebase en un proyecto Flutter para Android, iOS y web | Avanzado | **falta** | FD (Firebase)·FCC 11·RM |
| 2 | Autenticación con Firebase: correo, verificación y proveedores | Avanzado | **falta** | FD (Firebase: authentication)·FCC 12–25·UD c11 |
| 3 | Cloud Firestore: modelo de documentos, escucha en tiempo real y reglas de seguridad | Avanzado | **está pero básico** (M6 T3): hoy es la mitad de un tema de offline-first; faltan las reglas de seguridad y el coste por lectura | FA c16·FCC 36–37, 49·FiA c10·RM |
| 4 | Cloud Storage y Cloud Functions desde la app | Avanzado | **falta** | RM (Cloud Functions)·UD c14·DWN 3.12 |
| 5 | Remote Config y App Distribution | Avanzado | **falta** | RM·FM c17 |
| 6 | Cuándo no usar Firebase: dependencia del proveedor, costes y alternativas | Avanzado | **falta** | FD (Choose a database)·ENT8 |

#### M31 · Concurrencia: isolates a fondo (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El modelo de isolates: memoria aislada, grupos de isolates y por qué no son hilos | Avanzado | **está pero básico** (M8 T4): 1.015 palabras de primer uso y sin diagrama; faltan los grupos de isolates y el ciclo de vida | DCON (Performance and isolate groups, Isolates aren't threads)·ENT7 |
| 2 | `Isolate.spawn`, puertos y tipos de mensaje: qué se copia y qué se transfiere | Avanzado | **falta** | DCON (Message types)·DA c14·ENT7·ENT-S 3 |
| 3 | Isolates de larga vida: un worker con protocolo de mensajes | Avanzado | **falta** | DCON (Background workers)·ENT7 |
| 4 | Plugins y platform channels desde un isolate de fondo | Avanzado | **falta** | PC (Channels and platform threading)·ENT7 |
| 5 | Límites: comunicación síncrona, concurrencia en web y qué no puede cruzar | Avanzado | **falta** | DCON (Limitations, Concurrency on the web) |
| 6 | Elegir con datos: `async`, isolate o código nativo, medido en un teléfono | Avanzado | **falta** | FD (Concurrency & isolates)·ENT-S 3·ENT7 |

#### M32 · Platform channels, Pigeon y vistas nativas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `MethodChannel`: llamar a código de Android e iOS | Avanzado | **ya está** (M7 T1) | PC·FM c12·ENT6·AO |
| 2 | Códecs y tipos de datos: qué viaja por un canal y a qué se convierte | Avanzado | **falta** | PC (Data types, codecs)·ENT6 |
| 3 | `EventChannel` y `BasicMessageChannel`: flujos de datos nativos | Avanzado | **falta** | FM c12·PC·ENT6 |
| 4 | Pigeon: canales con tipos generados | Avanzado | **falta** | FD (Pigeon)·PC·WN 3.50·ENT6 |
| 5 | Hilos en los canales: hilo principal, colas de tareas y saltos de hilo | Avanzado | **está pero básico** (M13 T1, M18 T1): 932 y 692 palabras sobre la frontera nativa; faltan las colas de tareas y el salto al hilo principal | PC (Channels and platform threading)·AO |
| 6 | Vistas de plataforma: incrustar una vista nativa de Android, iOS o macOS | Avanzado | **falta** | FD (Android, iOS, macOS: native views)·AO·FM c12 |
| 7 | Probar código que usa canales y plugins | Avanzado | **falta** | FD (Testing plugins, Plugin code in tests)·ENT6 |

#### M33 · Paquetes y plugins propios (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Diseñar, documentar y validar un paquete Dart | Avanzado | **está pero básico** (M17 T6): 661 palabras y sin diagrama; faltan la estructura convencional y la documentación generada | DD (Creating packages, Package layout conventions, dart doc)·FD (Developing packages) |
| 2 | Plugins federados: interfaz de plataforma e implementaciones | Avanzado | **está pero básico** (M7 T2): 808 palabras y sin diagrama; falta crear uno con dos plataformas | FD (Developing packages)·FM c12, c16·ENT6·ENT9 |
| 3 | Plugins con Swift Package Manager y con el plugin de Kotlin integrado en Gradle | Avanzado | **falta** | FD (Swift Package Manager)·WN 3.47, 3.50·BC 3.44 |
| 4 | Publicar en pub.dev: versionado semántico, puntuación y editor verificado | Avanzado | **falta** | DD (Publishing packages, Versioning, Verified publishers)·ENT9 |
| 5 | Código que depende de la plataforma: imports condicionales y paquetes multiplataforma | Avanzado | **falta** | FM c12·DD (Multi-platform apps) |
| 6 | Mantener una API pública: modificadores de clase, deprecaciones y data-driven fixes | Avanzado | **falta** | DD (Class modifiers for API maintainers, Data-driven fixes)·DWN 3.10, 3.14 |

#### M34 · Pruebas II: integración, golden a fondo y dispositivos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Pruebas de integración con `integration_test` | Avanzado | **ya está** (M9 T3) | FD (Integration)·FM c13·ENT-S 5 |
| 2 | Probar la interfaz nativa (permisos, notificaciones) con Patrol | Avanzado | **falta** | FD (Testing: overview) |
| 3 | Golden a fondo: fuentes, tolerancia, varios tamaños y ejecución en CI | Avanzado | **está pero básico** (M20 T3): 464 palabras; faltan las diferencias entre máquinas y el flujo de actualización en CI | FM c13·ENT4 |
| 4 | Medir rendimiento en una prueba de integración | Avanzado | **falta** | FD (Integration: profiling)·FD (Metrics) |
| 5 | Pruebas de accesibilidad automatizadas | Avanzado | **falta** | FD (Accessibility testing)·BC 3.41 |
| 6 | Legibilidad de las pruebas: patrón robot y BDD | Avanzado | **falta** | RM (BDD)·ENT4 |
| 7 | Ejecutar en dispositivos reales y domar las pruebas inestables | Avanzado | **falta** | ENT-S 5·FD (Testing: overview) |

#### M35 · Rendimiento I: medir con DevTools (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Modos de compilación: debug, profile y release, y por qué solo se mide en profile | Avanzado | **falta** | FD (Build modes)·ENT7·ENT-S 6 |
| 2 | El presupuesto de un frame y los hilos de interfaz y de rasterización | Avanzado | **ya está** (M13 T3, M18 T3) | FD (Rendering performance, UI profiling)·AO·FM c14 |
| 3 | La vista Performance: línea de tiempo, frames tardíos y diagnóstico de jank | Avanzado | **está pero básico** (M8 T2): 858 palabras; falta leer una traza real fase por fase | DT (Performance)·FM c14·ENT-S 6 |
| 4 | El perfilador de CPU: gráfico de llamas y dónde se va el tiempo | Avanzado | **está pero básico** (M20 T4): 487 palabras; falta el perfil leído sobre un caso real | DT (CPU Profiler)·ENT7 |
| 5 | La vista Memory: instantáneas, comparación y recolección de basura | Avanzado | **falta** | DT (Memory)·FM c14·ENT7 |
| 6 | Las vistas Network y Logging y las extensiones de DevTools | Avanzado | **falta** | DT (Network, Logging, Extensions) |
| 7 | Buenas prácticas medidas: `build` barato, listas perezosas, capas, clips y opacidad | Avanzado | **está pero básico** (M8 T3, M15 T3): 987 y 769 palabras; falta cada práctica con su medición antes y después | FD (Performance: best practices)·ENT7·FM c14 |

#### M36 · Web y escritorio (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Flutter web: compiladores (JavaScript y WebAssembly) y renderizadores (CanvasKit y Skwasm) | Avanzado | **está pero básico** (M11 T5): 1.229 palabras para web y escritorio juntos; faltan el modo Wasm y la lista de navegadores permitidos de Flutter 3.50 | WEB·PLAT·WN 3.50·AO (Flutter web support) |
| 2 | Arranque de una app web: inicialización, archivo de configuración e incrustación en una página existente | Avanzado | **falta** | FD (Web: initialization, configuration file, embedding)·FM c17 |
| 3 | Interop con JavaScript: `dart:js_interop` y el DOM | Avanzado | **falta** | DD (JavaScript interop)·DWN 3.3–3.5, 3.14 |
| 4 | Escritorio: Windows, macOS y Linux, compilación y particularidades | Avanzado | **está pero básico** (M11 T5): falta cada plataforma con su compilación y sus flavors (Flutter 3.50) | FD (Desktop apps, Windows, macOS, Linux)·WN 3.50·UNAM 10 |
| 5 | Interfaz de escritorio: ratón, hover, menús, atajos y barras de desplazamiento | Avanzado | **falta** | FD (User input & accessibility, Actions & shortcuts)·UD c5 |
| 6 | Publicar web y escritorio: despliegue, PWA y paquetes instalables | Avanzado | **falta** | FD (Release: web, Windows, macOS, Linux)·FM c17·UNAM 7 |
| 7 | Accesibilidad y rendimiento en web, y cuándo Flutter web no es la herramienta | Avanzado | **falta** | FD (Web accessibility, Web profiling, Web FAQ)·WN 3.50 |

#### M37 · Entrega: builds, flavors y CI/CD (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Builds de release para cada plataforma | Avanzado | **ya está** (M11 T1) | FD (Release)·FM c17·FfB c13 |
| 2 | Firma de Android e iOS: almacén de claves, certificados y perfiles | Avanzado | **está pero básico** (M15 T6, M20 T6): 702 y 527 palabras; faltan el almacén de claves paso a paso y los perfiles de aprovisionamiento | FD (Release: Android, iOS)·FM c17·ENT-S 7 |
| 3 | Entornos y flavors con `--dart-define-from-file` | Avanzado | **está pero básico** (M11 T4): 836 palabras; faltan los flavors nativos de Android e iOS y los de escritorio | FD (App flavors)·DD (Environment declarations)·ENT-S 4·WN 3.50 |
| 4 | Iconos, nombre de la app y pantalla de arranque | Avanzado | **está pero básico** (M11 T2): 864 palabras; faltan la pantalla de arranque nativa de Android y la de iOS | FD (Android: splash screen, iOS: launch screen)·FA c19·FCC 45–46 |
| 5 | Integración continua: analizar, probar y compilar en cada cambio | Avanzado | **falta** | FD (Continuous deployment)·FM c13, c17·RM (GitHub Actions)·ENT-S 7 |
| 6 | Entrega continua con Fastlane o Codemagic | Avanzado | **está pero básico** (M11 T3): 887 palabras; falta la firma en el servidor de CI y la subida automática a las pistas de prueba | FD (Continuous deployment)·RM (Fastlane, Codemagic, Bitrise)·ENT9 |
| 7 | Versionado, número de build y notas de versión | Avanzado | **falta** | FD (Release)·FM c17 |

#### M38 · Publicación en tiendas (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Google Play: consola, pistas de prueba y App Bundle | Avanzado | **está pero básico** (M15 T6, M20 T6): las lecciones actuales llegan a la entrega; faltan la consola y las pistas | FD (Release: Android)·FA c20·FCC 50·PLZ 25–26·RM |
| 2 | App Store Connect: TestFlight y revisión | Avanzado | **está pero básico** (M15 T6, M20 T6): faltan TestFlight y los motivos habituales de rechazo | FD (Release: iOS)·FA c21·FCC 47–49·RM |
| 3 | Fichas de tienda, privacidad declarada y políticas que causan rechazos | Avanzado | **falta** | FM c17 (Pre-launch checklist)·FCC 49·ENT9 |
| 4 | Lanzamiento gradual, vigilancia de fallos y marcha atrás | Avanzado | **falta** | ENT-S 8·FM c17 |
| 5 | Versión mínima obligatoria y avisos de actualización dentro de la app | Avanzado | **falta** | ENT-S 8·ENT13 |
| 6 | Compatibilidad de plataformas: versiones mínimas de Android e iOS y preparación para nuevas versiones del sistema | Avanzado | **falta** | PLAT·WN 3.50 |

#### M39 · Monetización I: compras dentro de la app (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Catálogo y flujo de compra con `in_app_purchase` | Avanzado | **está pero básico** (M21 T1): 614 palabras; falta el flujo completo con sus estados de error | FD (In-app purchases) |
| 2 | Suscripciones en Android: planes base y cambios de plan | Avanzado | **está pero básico** (M21 T2): 612 palabras; falta el cambio de plan probado | FD (In-app purchases) |
| 3 | Suscripciones en iOS con StoreKit | Avanzado | **está pero básico** (M21 T3): 596 palabras; faltan los grupos de suscripción y los periodos de gracia | FD (In-app purchases) |
| 4 | Probar compras en sandbox | Avanzado | **está pero básico** (M21 T4): 565 palabras; faltan las cuentas de prueba de cada tienda paso a paso | FD (In-app purchases) |
| 5 | Restaurar compras y derechos de acceso | Avanzado | **está pero básico** (M21 T5): 533 palabras; falta la restauración entre dispositivos | FD (In-app purchases) |
| 6 | Validar transacciones en el servidor | Avanzado | **está pero básico** (M21 T6): 649 palabras; falta el servidor de validación de ejemplo y las notificaciones de la tienda | FD (In-app purchases)·ENT13 |

#### M40 · Monetización II: anuncios (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Configurar AdMob y cargar el primer banner de prueba | Avanzado | **está pero básico** (M22 T1): 749 palabras y sin diagrama | FD (Ads: AdMob, banners) |
| 2 | Formatos: banners, intersticiales y anuncios recompensados | Avanzado | **está pero básico** (M22 T3): 701 palabras y sin diagrama; falta el ciclo de vida de cada formato | FD (Ads: banners, video) |
| 3 | Mediación: subasta frente a cascada | Avanzado | **está pero básico** (M22 T2): 619 palabras y sin diagrama | FD (Ads: mediation) |
| 4 | Probar anuncios y diagnosticar la falta de inventario | Avanzado | **está pero básico** (M22 T4): 600 palabras y sin diagrama | FD (Ads) |
| 5 | Consentimiento, privacidad y audiencias | Avanzado | **está pero básico** (M22 T5): 605 palabras y sin diagrama; falta el flujo de consentimiento probado | FD (Ads)·ENT9 |
| 6 | Comparar redes: AdMob, AppLovin MAX y Unity LevelPlay | Avanzado | **está pero básico** (M22 T6): 704 palabras y sin diagrama | FD (Ads: mediation) |

#### M41 · IA en apps Flutter (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | IA generativa en una app Flutter con Firebase AI Logic | Avanzado | **ya está** (M15 T8) | FD (Build AI-powered apps) |
| 2 | Flutter AI Toolkit: interfaz de chat y proveedores de modelos propios | Avanzado | **falta** | FD (Flutter AI Toolkit) |
| 3 | GenUI SDK: interfaz generada por un modelo, componentes y eventos | Avanzado | **falta** | FD (GenUI SDK) |
| 4 | Buenas prácticas: prompts, salida estructurada, llamadas a herramientas y modo de interacción | Avanzado | **falta** | FD (AI best practices) |
| 5 | Desarrollar Flutter con asistentes de IA: reglas, servidor MCP de Dart y skills de paquetes | Avanzado | **falta** | FD (Develop with AI)·WN 3.47, 3.50·DWN 3.9, 3.14 |


### Tramo 4 · Experto (nivel Experto) — 68 temas

#### M42 · RenderObjects y slivers propios (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El protocolo de `RenderBox`: restricciones, tamaño, `performLayout`, dimensiones intrínsecas y línea base | Experto | **falta** | AO (Layout and rendering)·FM c11·ENT7·RM (Render Objects) |
| 2 | Del widget al render object: `LeafRenderObjectWidget`, variantes con hijos y `ParentData` | Experto | **falta** | ENT7·AO (Build: from Widget to Element) |
| 3 | Pintar y responder a toques en un `RenderObject`: `paint`, `hitTest`, `markNeedsLayout` y `markNeedsPaint` | Experto | **falta** | ENT7·FM c11 |
| 4 | El protocolo de slivers: `SliverConstraints` y `SliverGeometry` | Experto | **falta** | ENT7 (RenderBox vs. RenderSliver)·IF (Viewport-aware layout) |
| 5 | Un sliver propio paso a paso | Experto | **falta** | ENT7·FD (Slivers) |
| 6 | `Element` propio e `InheritedElement`: cuándo bajar a este nivel y cuándo basta `CustomPaint` | Experto | **falta** | IF (Separation of the Element and RenderObject trees)·ENT7 |
| 7 | Semántica en un render object propio | Experto | **falta** | FD (Accessibility)·AO |

#### M43 · El motor por dentro e Impeller (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Arquitectura por capas: framework, motor, embebedor y `dart:ui` | Experto | **falta** | AO (Architectural layers)·ENT7 |
| 2 | Los hilos del motor y la fusión del hilo de interfaz con el de plataforma (móviles desde Flutter 3.29, Linux en 3.41) | Experto | **falta** | AO·BC 3.41·ENT7 |
| 3 | Del árbol de capas a la GPU: `SceneBuilder`, escena y rasterización | Experto | **falta** | AO (Flutter's rendering model)·ENT7 |
| 4 | Impeller: por qué sustituye a Skia y qué backend usa en cada plataforma | Experto | **falta** | IMP·AO·ENT7 |
| 5 | Impeller en Flutter 3.50: estado por plataforma y cómo desactivarlo para diagnosticar | Experto | **falta** | IMP·BC 3.47, 3.50 |
| 6 | Jank por compilación de shaders y antialiasing en Impeller | Experto | **falta** | FD (Impeller anti-aliasing)·ENT7 |
| 7 | Texturas externas y coste de composición de las vistas de plataforma | Experto | **falta** | AO (Rendering native controls)·BC 3.47 |

#### M44 · Dart por dentro: VM, compilación y memoria (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | La máquina virtual de Dart: JIT, AOT y los destinos de `dart compile` | Experto | **falta** | DD (dart compile, dartaotruntime)·DWN 3.8–3.9·ENT7 |
| 2 | Hot reload por dentro y los cambios que no puede aplicar | Experto | **falta** | FD (Hot reload)·ENT7 |
| 3 | Recolección de basura generacional, `Finalizer`, `WeakReference` y `NativeFinalizer` | Experto | **falta** | ENT7 (Memory management)·RM (Memory Allocation) |
| 4 | Eliminación de código muerto, constantes y carga diferida | Experto | **falta** | ENT7 (Tree shaking and deferred loading)·FD (Deferred components) |
| 5 | Compilar a web por dentro: `dart2js`, `dart2wasm`, niveles de optimización y carga diferida en Wasm | Experto | **falta** | DD (Wasm compilation)·DWN 3.13–3.14·AO (Flutter web support) |
| 6 | Evolución del lenguaje: versionado, flags de experimento, `dart fix` y `dart migrate` | Experto | **falta** | DD (Language versioning, Experiment flags, dart fix, dart migrate)·DWN 3.12, 3.14 |
| 7 | `dart:typed_data`, números y colecciones eficientes | Experto | **falta** | DD (dart:core, Number representation)·ENT7 |

#### M45 · Metaprogramación y herramientas del lenguaje (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Macros de Dart: qué fueron, por qué no se publican y las alternativas vigentes | Experto | **está pero básico** (M17 T1): 598 palabras; hay que reescribirlo con el estado oficial (trabajo detenido) y las alternativas | DMAC·DWN 3.4, 3.7 |
| 2 | Generación de código con build_runner a fondo | Experto | **está pero básico** (M17 T2): 553 palabras y sin diagrama; faltan el grafo de builders y los tiempos de compilación | DD (build_runner)·DMAC·ENT12 |
| 3 | Un builder propio para build_runner | Experto | **está pero básico** (M17 T5): 590 palabras; falta el builder probado de principio a fin | DD (build_runner) |
| 4 | Recorrer el AST de Dart con el paquete analyzer | Experto | **está pero básico** (M17 T4): 551 palabras; faltan el modelo de elementos y un ejemplo que modifique código | DD (Static analysis) |
| 5 | Lints propios y plugins del analizador (guía documentada con Dart 3.10) | Experto | **falta** | DD (Analyzer plugins)·DWN 3.0, 3.10 |
| 6 | Reflexión limitada: `dart:mirrors` (marcada como obsoleta en Dart 3.14) y registros tipados | Experto | **está pero básico** (M17 T3): 601 palabras; falta el estado de `dart:mirrors` y por qué Flutter no la permite | DWN 3.14·ENT12 |
| 7 | Herramientas de línea de comandos en Dart y su distribución | Experto | **falta** | DD (Command-line & server apps, Distributing CLI tools, dart install)·DWN 3.10, 3.14 |

#### M46 · FFI y código nativo en C y Rust (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Cuándo usar FFI frente a un platform channel y cómo crear el paquete | Experto | **está pero básico** (M16 T1): 600 palabras y sin diagrama; falta la comparación medida | FD (Native interop)·ENT7·ENT-S 4·AO (FFI) |
| 2 | `dart:ffi`: tipos nativos, punteros, estructuras y asignación de memoria | Experto | **falta** | DD (C interop)·FD (dart:ffi) |
| 3 | Generar bindings de C con `package:ffigen` | Experto | **está pero básico** (M16 T2): 623 palabras y sin diagrama; falta la configuración en Dart documentada con Dart 3.14 | FD (FFIgen)·DWN 3.14 |
| 4 | Propiedad de la memoria nativa, liberación y errores | Experto | **está pero básico** (M16 T6): 727 palabras y sin diagrama; faltan `NativeFinalizer` y el fallo de doble liberación reproducido | ENT7 (NativeFinalizer)·DD (C interop) |
| 5 | Callbacks nativos, hilos e isolates: no bloquear la interfaz | Experto | **está pero básico** (M16 T5): 674 palabras; falta `NativeCallable` y la medición | ENT7 (NativeCallable)·DD (C interop) |
| 6 | Build hooks: compilar y empaquetar bibliotecas nativas por plataforma | Experto | **está pero básico** (M16 T4): 600 palabras y sin diagrama; hay que reescribirlo con build hooks y link hooks | DD (Hooks)·DWN 3.2, 3.11–3.13·WN 3.50 |
| 7 | Conectar una biblioteca Rust mediante una ABI de C | Experto | **está pero básico** (M16 T3): 616 palabras y sin diagrama; falta el empaquetado para Android e iOS | DD (C interop)·FD (Bind to native code) |

#### M47 · Interop con Kotlin y Swift, add-to-app y embebido (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Llamar a Java y Kotlin con `package:jnigen` | Experto | **falta** | FD (JNIgen)·DD (Java & Kotlin interop)·WN 3.50 |
| 2 | Llamar a Objective-C y Swift con `package:ffigen` | Experto | **falta** | DD (Objective-C & Swift interop)·FD (iOS: Apple system libraries)·WN 3.50 |
| 3 | Add-to-app: una pantalla Flutter dentro de una app Android o iOS existente | Experto | **ya está** (M7 T6) | FD (Add to an existing app)·AO (Hosting Flutter content) |
| 4 | Varias instancias de Flutter, secuencia de carga y depuración de módulos incrustados | Experto | **falta** | FD (Multiple Flutter instances, Loading sequence & performance, Debugging embedded modules) |
| 5 | Extensiones de iOS, App Clips y actividades de Compose junto a Flutter | Experto | **falta** | FD (iOS: App Clips, app extensions; Android: Compose activity) |
| 6 | Flutter embebido: el embebedor, embebedores propios e incrustación en web | Experto | **falta** | AO (Platform embedding)·FD (Web embedding) |

#### M48 · Rendimiento II: tamaño, arranque y memoria (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Tamaño de la app: herramienta de análisis, información de depuración separada y componentes diferidos | Experto | **falta** | DT (App size)·FD (App size, Deferred components)·FM c14·ENT7 |
| 2 | Tiempo de arranque: del proceso al primer frame | Experto | **falta** | FM c14·FD (Metrics, Loading sequence & performance) |
| 3 | Imágenes y memoria: decodificación, tamaño en caché y presión de memoria | Experto | **falta** | ENT7 (image optimization, memory pressure)·FD (Assets and images) |
| 4 | Fugas de memoria: controladores sin `dispose`, closures y cómo encontrarlas | Experto | **falta** | ENT7·DT (Memory)·FM c14 |
| 5 | Listas enormes: extensión fija, `findItemIndexCallback` y la caché de scroll (cambios de Flutter 3.41 y 3.44) | Experto | **falta** | BC 3.41, 3.44·ENT7·IF |
| 6 | Rendimiento en web: Wasm, tamaño de descarga y Core Web Vitals | Experto | **falta** | FD (Web profiling, WebAssembly)·WN 3.50 |
| 7 | Presupuestos de rendimiento en CI y métricas en una versión publicada | Experto | **está pero básico** (M18 T7, M20 T4): 749 y 487 palabras; falta el presupuesto que rompe el build | FD (Metrics)·ENT-S 6 |

#### M49 · Seguridad (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Modelo de amenazas de una app Flutter: qué hay dentro del binario y qué puede leer un atacante | Experto | **está pero básico** (M13 T1, M18 T1): hoy se enfoca en la frontera nativa; falta abrir un binario real y ver qué contiene | SEG·ENT9 |
| 2 | Los secretos no pertenecen al binario | Experto | **está pero básico** (M13 T2, M18 T2): 854 y 740 palabras; falta extraer un secreto de un build de release para demostrarlo | ENT9·FD (Obfuscate Dart code) |
| 3 | Ofuscación y símbolos: `--obfuscate`, `--split-debug-info` y simbolizar una traza | Experto | **falta** | FD (Obfuscate Dart code)·ENT7 |
| 4 | Datos en reposo: almacenamiento seguro, biometría y contenido sensible en pantalla | Experto | **falta** | FD (Android: sensitive content)·FM c8 |
| 5 | Red segura: TLS, fijación de certificados y permisos de red local | Experto | **falta** | FD (Android: local network permissions)·ENT4 |
| 6 | Endurecimiento de la plataforma en Flutter 3.50: flags del motor en release y verificación de `Intent` | Experto | **falta** | BC 3.50 |
| 7 | Cadena de suministro: avisos de seguridad de pub, actualización del SDK y dependencias | Experto | **falta** | SEG·DD (Security advisories)·DWN 3.3 |

#### M50 · Observabilidad y operación (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Registro estructurado en una app: niveles, contexto y qué no registrar | Experto | **falta** | FM c16·DT (Logging) |
| 2 | Reportes de fallos con Crashlytics y Sentry | Experto | **está pero básico** (M18 T5): 791 palabras; falta simbolizar una traza ofuscada | FD (Error reporting)·FM c17·ENT-S 8 |
| 3 | Analítica con privacidad y consentimiento | Experto | **está pero básico** (M18 T6): 580 palabras; falta el consentimiento probado en las dos plataformas | RM (Analytics)·FM c17 |
| 4 | Monitoreo de rendimiento en una versión publicada | Experto | **está pero básico** (M18 T7): 749 palabras; faltan las métricas de arranque y de frames lentos por versión | FD (Metrics)·ENT-S 8 |
| 5 | Protocolo, telemetría y contención: versiones de API, banderas remotas e interruptor de emergencia | Experto | **ya está** (M13 T4, M18 T4) | RM (Remote Config)·ENT-S 8·ENT13 |
| 6 | Respuesta a un incidente: detectar, contener, corregir y publicar | Experto | **falta** | ENT-S 8·ENT13 |

#### M51 · Escala, evolución y criterio de experto (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Migrar una app de versión sin romper la entrega (caso: Flutter 3.50 y Dart 3.14) | Experto | **ya está** (M15 T7) | BC·WN 3.50·DD (dart migrate)·ENT14 |
| 2 | Leer cambios incompatibles y aplicar correcciones automáticas en un código grande | Experto | **falta** | BC·FD (Automated fixes, Compatibility policy)·DWN 3.14 |
| 3 | Monorepos y equipos grandes: workspaces anidados, opciones de análisis compartidas y propiedad del código | Experto | **falta** | DD (Workspaces)·DWN 3.7, 3.12, 3.14·ENT5 |
| 4 | Diseño de sistema de una app móvil: requisitos, offline, sincronización y límites | Experto | **falta** | ENT13·ENT-S 1 |
| 5 | Deuda técnica y decisiones de arquitectura con evidencia | Experto | **falta** | ENT-S 9–11·ENT12 |
| 6 | Leer el código de Flutter y participar: guía de contribución y proceso público de RFC | Experto | **falta** | WN 3.50·FD (Contribute) |
| 7 | Juegos con Flutter: Casual Games Toolkit y Flame, visión general | Experto | **falta** | FD (Games) |

### 2.1 Notas de linealidad

- Dart va antes que Flutter: M1–M4 no usan ningún widget. Quien ya programe en otro lenguaje puede leerlos
  rápido, pero no saltarlos: null safety (M1 T6) y la asincronía (M4) se usan desde M5.
- Las pruebas se **ejecutan** desde M9 T6 y se **enseñan** en M20 y M34. Ningún tema anterior a M20 pide
  diseñar una batería de pruebas.
- DevTools aparece tres veces a propósito: primer uso en M0 T5, conteo de reconstrucciones en M14 T6 y
  medición completa en M35. Los isolates, igual: primer uso en M12 T7, modelo completo en M31 y callbacks
  nativos en M46 T5. En cada caso el tema posterior enlaza al anterior y no lo repite.
- Los tres árboles se nombran desde M5 (qué es un `BuildContext`) y se abren en M23; los `RenderObject`
  propios esperan a M42, cuando ya se sabe medir (M35).
- La gestión de estado va en dos pasos: opciones principales y elección para el proyecto en M16, y
  comparación medida con el resto de bibliotecas en M27.
- Los laboratorios consumen la API de RutaFlow desde M9. El curso solo exige arrancar el backend con el
  `docker-compose.yml` de la raíz; el porqué vive en los cursos de Spring y Docker (decisión D5).

### 2.2 Temas de las fuentes que se dejan fuera a propósito

| Tema que aparece en las fuentes | Dónde aparece | Propuesta |
|---|---|---|
| Git, GitHub y alojamiento de repositorios | RM, FCC 15 | Curso Fundamentos (ya es su dueño) |
| SOLID, patrones de diseño generales, estructuras de datos y programación funcional como teoría | RM | Cursos Java y Diseño de sistemas; Flutter aplica lo necesario en M11, M27 y M28 |
| Comparación de Flutter con otros frameworks y guías «vengo de Android, SwiftUI, React Native, Xamarin» | FfB c3, FD (Coming from another platform), UNAM 1 | Fuera como temas; una nota en M0 T1 |
| Desarrollo completo de juegos (Flame, logros, multijugador) | FD (Games) | Un solo tema de visión general (M51 T7). Decisión D9 |
| Dart en el servidor y en Google Cloud | DD (Command-line & server apps, Google Cloud) | Fuera: el backend de la academia es Spring y Node. Queda la herramienta de consola (M45 T7) |
| Escribir Cloud Functions y reglas de backend complejas | RM, FCC 49 | Fuera: Flutter enseña a llamarlas (M30 T4) |
| Pagos con Google Pay y Apple Pay (paquete `pay`) y anuncios de vídeo con IMA SDK | FD (Payments, IMA SDK) | Fuera en esta propuesta. Decisión D9 |
| Herramientas de analítica concretas (Mixpanel, Google Analytics) una a una | RM | Un tema de analítica con privacidad (M50 T3) |
| FlutterFlow y otras herramientas sin código | Resultados de búsqueda de cursos | Fuera |
| ChromeOS como plataforma propia | FD (Android: ChromeOS) | Fuera; se menciona en M13 T7 |
| Preguntas de entrevista no técnicas (mentoría, desacuerdos) | ENT-S 9–12 | Solo queda el criterio técnico (M51 T5) |
| Interop JS antiguo (`dart:html`, `package:js`) | DD (Past JS interop) | Solo como historia dentro de M36 T3: dart.dev lo marca obsoleto |

## 3. Lo que hoy está en Flutter y debería vivir en otro curso

Regla 1 de la spec: un concepto, un curso dueño. Flutter se queda con Dart, el framework, el motor, las
herramientas y la entrega de una app. A diferencia de Java, **ningún tema completo sale del curso**: lo que se
mueve es la parte conceptual de algunos temas, que pasa a ser un enlace.

| Qué hay hoy en Flutter | Temas actuales | Curso dueño del concepto | Qué queda en Flutter |
|---|---|---|---|
| JWT, OAuth y renovación de tokens como concepto | parte de M5 T4 | **Fundamentos** (concepto) y **Spring** (servidor) | El flujo del cliente: guardar, renovar y cerrar sesión (M17 T5, M18 T6) |
| Qué es CI/CD, pipelines y ejecutores | parte de M11 T3 | **DevOps** | El pipeline concreto de una app Flutter: analizar, probar, firmar y subir (M37 T5–T6) |
| Clean Architecture, capas y principios de diseño como teoría | parte de M12 T1, M15 T4, M20 T5 | **Diseño de sistemas** | La arquitectura oficial de Flutter y su aplicación (M28) |
| Servidor de tiempo real (Socket.IO) y API de RutaFlow | parte de M14 T4, M19 T4 | **Spring** y **Node** | El cliente: conexión, reconexión y sincronización (M17 T6, M29) |
| Validación de compras en el servidor | parte de M21 T6 | **Spring** (el servicio que valida) | Qué envía la app, qué espera y cómo reacciona (M39 T6) |
| Observabilidad de plataforma (tableros, alertas, trazas distribuidas) | parte de M13 T4, M18 T4 | **DevOps** | Fallos, analítica y rendimiento desde la app (M50) |
| IA generativa: modelos, prompts y evaluación como disciplina | parte de M15 T8 | **IA aplicada al desarrollo** (`docs/temarios/ia-aplicada.md`) | La integración en una app Flutter (M41) |
| Firma, Gradle de Android y Xcode en profundidad | parte de M15 T6, M20 T6 | **Android**, **iOS** y **Gradle** | Lo que una app Flutter necesita para firmar y publicar (M37 y M38) |
| Firebase | M6 T3 y apariciones sueltas | No tiene curso dueño en la academia | Se queda en Flutter como módulo propio (M30). Decisión D5 |

Nada se pierde (regla 2): ningún tema se retira. Los tres pares de módulos duplicados (M13 y M18, M14 y M19,
M15 y M20) se fusionan tema a tema, y M12 T2 y T3 pasan a ser el proyecto final. El destino de cada uno está
en el anexo A.

## 4. Proyecto guía y laboratorio por módulo

### 4.1 Proyecto guía: `rutaflow_repartidor`

La app del repartidor de RutaFlow: jornada, lista de entregas, mapa, evidencia de entrega y trabajo sin
conexión. Es el mismo dominio del resto de la academia y consume la API de RutaFlow del curso de Spring. Parte
de lo que ya existe en `examples/flutter_rutaflow/` y en los módulos actuales de «Flutter para entregas» (M14 y
M19), y crece módulo a módulo en lugar de usar ejemplos sueltos.

| Tramo | Qué es el proyecto al terminar el tramo |
|---|---|
| Fundamentos (M0–M9) | Versión 0.1: lista de entregas cargada por HTTP, detalle, formulario de confirmación, tema claro y oscuro, una preferencia guardada, una prueba de widget y el APK instalado en un teléfono |
| Aplicación (M10–M22) | Versión 0.5: modelo de dominio sellado e inmutable, navegación con URL y enlaces profundos, estado con la biblioteca elegida y MVVM, API con sesión, base de datos local, animaciones, dos idiomas, accesibilidad, cámara, ubicación y notificaciones, con batería de pruebas |
| Integración (M23–M41) | Versión 1.0 publicable: capas y paquetes de un workspace, offline-first con sincronización, isolate de optimización de ruta, plugin propio de escáner, pruebas de integración y golden en CI, rendimiento medido, panel web y de escritorio, tres flavors firmados, ensayo de publicación en las dos tiendas, plan de pago y asistente con IA |
| Experto (M42–M51) | La misma app abierta y endurecida: `RenderObject` y sliver propios, Impeller medido, generador de código y lint propios, biblioteca nativa por FFI, pantalla incrustada en apps nativas, presupuesto de tamaño y arranque, auditoría de seguridad e incidentes contenidos con telemetría |

**Proyecto final (con rúbrica, formato único §3):** entregar `rutaflow_repartidor` con (1) `flutter analyze` y
`flutter test` en verde en Flutter 3.50; (2) el flujo completo de una entrega probado en un dispositivo real,
incluida la confirmación sin conexión y su sincronización; (3) un informe de rendimiento en modo profile con la
traza de DevTools antes y después de una mejora; (4) el build de release ofuscado, firmado y subido a una pista
de prueba de cada tienda; (5) un informe de los tres incidentes de M50; y (6) un registro de decisiones (gestión
de estado, base de datos local, interop nativo y qué funciones no definitivas se usan y por qué). Recoge los
actuales M12 T2 y M12 T3.

### 4.2 Convenciones de los laboratorios

- Carpeta `examples/flutter/modulo-N/` con `README.md`, `pubspec.yaml` con versiones fijadas, `pubspec.lock`
  versionado, `analysis_options.yaml` y `verificar.sh`, que termina en `RESULTADO: OK` (formato único §3). Los
  módulos de Dart puro (M1–M4, M10–M12, M44 y M45) son paquetes de consola que se verifican con `dart test`.
- `verificar.sh` ejecuta como mínimo `flutter analyze` y `flutter test`. Lo que solo se puede comprobar en un
  dispositivo (cámara, notificaciones, compras, rendimiento, publicación) se documenta en el README con capturas
  reales del emulador o del teléfono y se verifica en el Mac del dueño (regla 9 de specs/021).
- Los laboratorios con código de Android usan Gradle con Kotlin DSL (regla 7 de specs/021); los de iOS y macOS,
  Swift Package Manager cuando el plugin lo permite.
- Los módulos de rendimiento (M35, M43, M48) guardan junto al laboratorio las trazas y capturas de DevTools en
  modo profile, con el dispositivo y la versión anotados.
- Cada laboratorio parte del estado final del anterior; el README dice qué archivo cambia y por qué.
- Énfasis propio del curso (spec 021 §3): árbol de widgets, elementos y render objects dibujado en cada tema
  de interfaz; rendimiento medido con DevTools; la misma app que crece.
- Este documento no crea ni toca `examples/`: la carpeta `examples/flutter/` es la propuesta para la Fase 5.


### 4.3 Laboratorio por módulo

| Módulo | Tramo | Laboratorio (`examples/flutter/modulo-N/`) |
|---|---|---|
| M0 · Plataforma, herramientas y primera app | Fundamentos | Instalar Flutter 3.50, pasar `flutter doctor`, crear `rutaflow_repartidor` y ejecutarlo en emulador, teléfono y navegador |
| M1 · Dart I: valores, tipos y control de flujo | Fundamentos | Calculadora de tarifa y peso de un paquete en Dart puro (`dart run`), con cada error de nulos provocado y corregido |
| M2 · Dart II: funciones y colecciones | Fundamentos | Manifiesto de entregas del día: filtrar, agrupar y resumir paquetes con colecciones y records |
| M3 · Dart III: clases y objetos | Fundamentos | Modelo de `Entrega`, `Direccion` y `Paquete` con constructores, mixins y enums; la misma clase escrita con y sin constructor primario |
| M4 · Dart IV: asincronía esencial y paquetes | Fundamentos | Cliente de consola que consulta el estado de una entrega con `Future` y escucha un flujo de posiciones; paquete propio con lints activados |
| M5 · Widgets: el modelo declarativo | Fundamentos | Primera pantalla de RutaFlow: tarjeta de entrega con texto, icono, imagen y estado, y tres errores típicos provocados y leídos |
| M6 · Layout I: restricciones, filas, columnas y listas | Fundamentos | Lista de entregas del día con filas, columnas y cuadrícula; un desbordamiento reproducido y arreglado |
| M7 · Interacción, entrada y formularios | Fundamentos | Formulario «confirmar entrega»: receptor, observaciones, validación, foco y diálogo de confirmación |
| M8 · Navegación básica y tema | Fundamentos | Navegación lista → detalle → confirmación con resultado devuelto; tema claro y oscuro de RutaFlow sobre `material_ui` |
| M9 · Primera app completa: estado local, datos y prueba | Fundamentos | Versión 0.1 de `rutaflow_repartidor`: lista cargada por HTTP, preferencia guardada, una prueba de widget y el APK instalado en un teléfono |
| M10 · Dart V: sistema de tipos, genéricos y patrones | Aplicación | Estados de una entrega como tipos sellados; el compilador obliga a tratar cada estado nuevo en cada `switch` |
| M11 · Dart VI: diseño de objetos | Aplicación | Modelos de dominio inmutables con igualdad, `copyWith` y un identificador como extension type |
| M12 · Dart VII: asincronía a fondo | Aplicación | Seguimiento en vivo: flujo de posiciones transformado, cancelado y con plazo; cálculo de ruta movido a un isolate |
| M13 · Layout II: scroll, slivers y diseño adaptable | Aplicación | Pantalla de jornada con cabecera que se contrae, lista infinita paginada y diseño de dos paneles en tableta |
| M14 · Widgets por dentro I: ciclo de vida, contexto y keys | Aplicación | Lista de entregas que conserva el estado de cada fila al reordenar; contador de reconstrucciones antes y después de optimizar |
| M15 · Navegación declarativa | Aplicación | Rutas de RutaFlow con go_router: pestañas con pila propia, redirección por sesión y un enlace profundo que abre una entrega |
| M16 · Gestión de estado comparada I: Provider, Riverpod, Bloc y MVVM | Aplicación | La función «jornada del repartidor» en Provider, Riverpod y Bloc, y la versión elegida con MVVM y `Command` |
| M17 · Red: HTTP, JSON y autenticación | Aplicación | Cliente de la API de RutaFlow: modelos generados, interceptores, renovación de token y subida de la foto de evidencia con progreso |
| M18 · Persistencia local | Aplicación | Base de datos local de entregas con migración de esquema, token en almacenamiento seguro y caché de imágenes con límite |
| M19 · Animaciones I | Aplicación | Tarjeta de entrega animada: cambio de estado, transición `Hero` al detalle y lista que anima altas y bajas |
| M20 · Pruebas I: unitarias, de widget y golden | Aplicación | Batería de pruebas de la versión 0.5: unitarias, de widget, de navegación y golden, con cobertura medida |
| M21 · Accesibilidad, internacionalización y diseño | Aplicación | RutaFlow en español e inglés, con lector de pantalla, texto grande y un sistema de diseño propio |
| M22 · Plataforma I: plugins, permisos y funciones del dispositivo | Aplicación | Evidencia de entrega: foto, ubicación con permiso, notificación de nueva ruta y comportamiento en segundo plano |
| M23 · Los tres árboles y el pipeline de un frame | Integración | Un mismo cambio de estado seguido por los tres árboles y por las fases del frame, con registro y capturas de DevTools |
| M24 · Gestos, foco y entrada avanzada | Integración | Lista de paradas reordenable con arrastre, atajos de teclado y un reconocedor de gesto propio (deslizar para confirmar) |
| M25 · Gráficos propios: Canvas, texto y shaders | Integración | Firma del receptor dibujada con `Canvas`, gráfica de entregas por hora y un shader de fondo |
| M26 · Animaciones II: física, coreografía y rendimiento | Integración | Deslizar para confirmar con física de resorte y marcador de mapa que se mueve sin saltos, con el coste por frame medido |
| M27 · Gestión de estado comparada II y flujo de datos | Integración | La jornada reescrita con estados sellados, confirmación optimista, `Result` y restauración tras la muerte del proceso |
| M28 · Arquitectura de aplicaciones | Integración | `rutaflow_repartidor` reorganizado en capas y paquetes de un workspace, con errores globales capturados y cada capa probada con fakes |
| M29 · Datos avanzados: offline-first y tiempo real | Integración | Confirmaciones sin conexión: cola persistente, sincronización en segundo plano y un conflicto resuelto |
| M30 · Firebase y backend como servicio | Integración | Variante con Firebase: sesión, entregas en tiempo real con reglas de seguridad y distribución a probadores |
| M31 · Concurrencia: isolates a fondo | Integración | Optimizador de ruta en un isolate de larga vida con protocolo de mensajes, comparado con `async` en un teléfono |
| M32 · Platform channels, Pigeon y vistas nativas | Integración | Lector de códigos del paquete con un canal propio, con Pigeon y con una vista nativa incrustada |
| M33 · Paquetes y plugins propios | Integración | `rutaflow_escaner` como plugin federado con Swift Package Manager, probado y con su publicación ensayada en seco |
| M34 · Pruebas II: integración, golden a fondo y dispositivos | Integración | Flujo completo de entrega probado en dispositivo, con el permiso nativo aceptado por Patrol y golden en CI |
| M35 · Rendimiento I: medir con DevTools | Integración | Campaña de rendimiento de la lista y del mapa: traza leída, perfil de CPU, memoria y mejora demostrada en modo profile |
| M36 · Web y escritorio | Integración | Panel del despachador en web (Wasm) y escritorio, con atajos, menús y un instalador |
| M37 · Entrega: builds, flavors y CI/CD | Integración | Pipeline de `rutaflow_repartidor`: análisis, pruebas, tres flavors firmados y entrega automática a las pistas de prueba |
| M38 · Publicación en tiendas | Integración | Ensayo de publicación: pista interna de Google Play y TestFlight, con ficha, privacidad declarada y lanzamiento gradual |
| M39 · Monetización I: compras dentro de la app | Integración | Plan «RutaFlow Pro» de suscripción probado en sandbox, con restauración y validación en servidor |
| M40 · Monetización II: anuncios | Integración | Variante gratuita con anuncios de prueba, consentimiento y diagnóstico de falta de inventario |
| M41 · IA en apps Flutter | Integración | Asistente del repartidor: resumen de la jornada generado por un modelo, con salida estructurada y límites claros |
| M42 · RenderObjects y slivers propios | Experto | Un `RenderObject` propio para la línea de tiempo de una entrega y un sliver de cabecera de parada |
| M43 · El motor por dentro e Impeller | Experto | La misma pantalla con Impeller activado y desactivado: capas, hilos y tiempos de rasterización comparados |
| M44 · Dart por dentro: VM, compilación y memoria | Experto | `rutaflow_cli` compilado como ejecutable AOT, y la app web compilada a JavaScript y a Wasm, con tamaños y arranque medidos |
| M45 · Metaprogramación y herramientas del lenguaje | Experto | Generador de código propio para los modelos de RutaFlow y un lint que prohíbe importar la capa de datos desde la interfaz |
| M46 · FFI y código nativo en C y Rust | Experto | Enlace a una biblioteca nativa de geodesia en C y a una función en Rust, con la memoria vigilada y build hooks |
| M47 · Interop con Kotlin y Swift, add-to-app y embebido | Experto | Pantalla Flutter de seguimiento incrustada en una app Android y en una app iOS existentes, con motor precalentado |
| M48 · Rendimiento II: tamaño, arranque y memoria | Experto | Dieta de `rutaflow_repartidor`: tamaño, arranque y memoria medidos, con un presupuesto que rompe el build al superarse |
| M49 · Seguridad | Experto | Auditoría de seguridad: secreto extraído de un build mal hecho, build ofuscado, fijación de certificados y dependencias revisadas |
| M50 · Observabilidad y operación | Experto | Tres incidentes provocados (fallo en arranque, versión rota de la API y fuga de memoria) detectados y contenidos con telemetría |
| M51 · Escala, evolución y criterio de experto | Experto | Migración de versión de `rutaflow_repartidor` confirmación a confirmación y documento de diseño de sistema de la app |

## 5. Decisiones que debe tomar el dueño

- **D1 · Tamaño.** Aprobar 345 temas en 52 módulos (hoy 119 en 23), unas 230 h más el
  proyecto. **Recomendación:** aprobarlo entero (regla 10: siempre la versión extendida). Si hubiera que
  recortar, lo que menos se pierde es M40 (anuncios), M41 (IA) y M51 T7 (juegos).
- **D2 · Dart dentro de Flutter.** El temario dedica 11 módulos a Dart (M1–M4, M10–M12, M31 y M44–M46).
  **Recomendación:** dejarlo dentro de este curso, como pide el encargo, con los módulos de Dart ejecutables sin
  Flutter. Alternativa: sacar un curso «Dart» propio y que Flutter lo exija como prerrequisito.
- **D3 · Gestión de estado del proyecto guía.** El curso enseña y compara `setState`, `InheritedWidget`,
  Provider, Riverpod, Bloc y MVVM con `ChangeNotifier`, y trata Redux, GetX y el resto del ecosistema en un tema
  comparativo. **Recomendación:** que `rutaflow_repartidor` use Riverpod con la arquitectura oficial (views,
  view models, repositorios), porque es lo que ya usan las lecciones actuales y `examples/flutter_rutaflow/`.
  Alternativa: Bloc como estándar del proyecto.
- **D4 · Monetización.** Los 12 temas actuales de compras y anuncios (M21 y M22) se conservan como M39 y M40,
  en Integración, después de publicar en tiendas. **Recomendación:** conservarlos (nada se pierde y la
  documentación oficial los cubre). Alternativa: moverlos a una ruta aparte de «negocio de apps».
- **D5 · Firebase y backend del proyecto.** Firebase no tiene curso dueño en la academia.
  **Recomendación:** que el backend principal de `rutaflow_repartidor` sea la API de RutaFlow (Spring) y que
  Firebase sea un módulo propio (M30, 6 temas) más los servicios de operación (fallos, analítica, Remote
  Config). Desde M9 los laboratorios piden arrancar el backend con `docker compose up` antes de que el
  estudiante haya hecho Docker. Alternativa: Firebase como backend único del proyecto.
- **D6 · Material y Cupertino tras Flutter 3.50.** **Recomendación:** escribir todo el curso sobre los
  paquetes `material_ui` y `cupertino_ui` desde M5, y dedicar M8 T6 a la migración, **después** de comprobar en
  el Mac que la migración funciona con las dependencias del proyecto. Alternativa: seguir con las bibliotecas
  incluidas en el SDK mientras existan y migrar más adelante.
- **D7 · Funciones no definitivas o retiradas.** **Recomendación:** macros queda como un solo tema de historia
  y alternativas (M45 T1); los constructores primarios se enseñan (M3 T3) tras comprobar su estado con
  `dart --version` en el Mac; WebAssembly se enseña con su lista de navegadores. Alternativa: dejar fuera todo
  lo que no sea definitivo.
- **D8 · Renumeración y niveles.** El curso pasa de M0–M22 a M0–M51 y casi todos los temas actuales cambian de
  módulo; 63 de los 117 temas actuales que alimentan el temario quedan en un tramo cuyo nivel no
  coincide con el que declaran hoy (contando el primer destino de cada uno).
  **Recomendación:** aceptar la renumeración conservando el identificador `flutter` y migrando el progreso de
  lectura con la tabla del anexo A.
- **D9 · Temas descartados.** Confirmar que quedan fuera el desarrollo completo de juegos (queda un tema de
  visión general), Dart en el servidor, los pagos con el paquete `pay`, los anuncios de vídeo con IMA SDK y
  FlutterFlow (sección 2.2), o pedir alguno. **Recomendación:** confirmarlo; si se quiere uno, el de más
  demanda en las fuentes es juegos con Flame, que cabría como módulo de 5 temas en Experto.
- **D10 · Proyecto guía y verificación.** Aprobar `rutaflow_repartidor` (sobre `examples/flutter_rutaflow/`)
  y aceptar que los laboratorios de iOS, macOS, compras, notificaciones y publicación solo se pueden verificar en
  el Mac del dueño con Xcode, un teléfono Android y cuentas de desarrollador de las dos tiendas.
  **Recomendación:** aprobarlo y decidir ya si habrá cuentas de tienda; sin ellas, M38 y M39 se quedan en
  ensayo documentado.
- **D11 · Certificación.** No se encontró un examen oficial de Google para Flutter; los resultados de
  búsqueda solo muestran un examen de terceros (AFD-200) cuyos objetivos no se abrieron (sección 6.7).
  **Recomendación:** no alinear el curso con ninguna certificación.

## 6. Fuentes consultadas

Consultadas el 2026-11-20. De cada una se tomó solo la lista de temas (hechos), nunca su texto. La columna
«Abrev.» es la que usa la tabla del temario; entre paréntesis, en las filas, va la sección del índice.

### 6.1 Documentación oficial

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| FD | [docs.flutter.dev](https://docs.flutter.dev/) | Índice lateral completo: interfaz, diseño adaptable, navegación, animaciones, accesibilidad, datos y backend, arquitectura, interop nativo, integración por plataforma, paquetes, pruebas, rendimiento, despliegue, add-to-app, IA, herramientas y soluciones (Firebase, juegos, monetización, mapas) |
| AO | [Flutter architectural overview](https://docs.flutter.dev/resources/architectural-overview) | Secciones: capas, anatomía de una app, widgets, render y layout, embebedores, integración con otro código y soporte web |
| IF | [Inside Flutter](https://docs.flutter.dev/resources/inside-flutter) | Secciones: composición, layout y build sublineales, reconciliación, cirugía de árbol, scroll infinito |
| IMP | [Impeller rendering engine](https://docs.flutter.dev/perf/impeller) | Estado por plataforma y forma de desactivarlo |
| WEB | [Web renderers](https://docs.flutter.dev/platform-integration/web/renderers) | Compiladores y renderizadores web |
| PLAT | [Supported deployment platforms](https://docs.flutter.dev/reference/supported-platforms) | Plataformas, versiones y arquitecturas de Flutter 3.50 |
| PC | [Platform channels](https://docs.flutter.dev/platform-integration/platform-channels) | Secciones: tipos de datos, códecs, Pigeon, hilos e isolates de fondo |
| ARQ | Guía de arquitectura: [recomendaciones](https://docs.flutter.dev/app-architecture/recommendations) y [patrones de diseño](https://docs.flutter.dev/app-architecture/design-patterns) | Las 17 recomendaciones con su fuerza y los 6 patrones (estado optimista, clave-valor, SQL, offline-first, Command, Result) |
| DT | [Flutter and Dart DevTools](https://docs.flutter.dev/tools/devtools) | Lista de vistas y herramientas |
| — | [Opciones de gestión de estado](https://docs.flutter.dev/data-and-backend/state-mgmt/options) y [visión general de pruebas](https://docs.flutter.dev/testing/overview) | Enfoques incluidos en el SDK; tipos de prueba y paquetes nombrados |
| SEG | [Security](https://docs.flutter.dev/security) | Secciones y buenas prácticas |
| WN | [What's new in the docs](https://docs.flutter.dev/release/whats-new) | Entradas de 3.44, 3.47 y 3.50 |
| BC | [Breaking changes](https://docs.flutter.dev/release/breaking-changes) | Cambios de 3.41, 3.44, 3.47 y 3.50 |
| — | [Release notes](https://docs.flutter.dev/release/release-notes) | Lista de versiones estables (última: 3.50.0) |
| DD | [dart.dev](https://dart.dev/language) | Índice lateral completo: lenguaje, bibliotecas, paquetes, desarrollo, interop y herramientas; versión documentada (3.14.0) |
| DWN | [What's new (dart.dev)](https://dart.dev/resources/whats-new) | Novedades documentadas de Dart 3.0 a 3.14 |
| DCON | [Concurrency in Dart](https://dart.dev/language/concurrency) | Secciones: bucle de eventos, asincronía, isolates y sus límites |
| DMAC | [Macros](https://dart.dev/language/macros) | Estado de las macros y alternativas |
| DPC | [Primary constructors](https://dart.dev/language/primary-constructors) | Versión de lenguaje requerida |
| VER | `docs/VERSIONES.md` (repositorio) | Versión de Flutter anotada en el Mac del dueño |

### 6.2 Libros de referencia (índices)

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| FiA | Windmill, *Flutter in Action* (Manning) — [índice en O'Reilly](https://oreilly.com/library/view/flutter-in-action/9781617296147/kindle_split_002.html) | 4 partes y 11 capítulos |
| FA | *Flutter Apprentice*, 4.ª ed. (Kodeco) — [índice](https://www.kodeco.com/books/flutter-apprentice/v4.0) | 7 secciones y 22 capítulos |
| DA | *Dart Apprentice: Beyond the Basics* (Kodeco) — [índice](https://www.kodeco.com/books/dart-apprentice-beyond-the-basics/v1.0) | 14 capítulos |
| FfB | Biessek y Bailey, *Flutter for Beginners*, 3.ª ed. (Packt) — [qué cubre el libro](https://packtpub.com/en-co/product/flutter-for-beginners-third-edition-9781837630387/chapter/preface-pref/section/what-this-book-covers-preflvl1sec03) | 13 capítulos |
| FM | *Flutter Mastery: Building Production-Grade Applications* (Leanpub) — [índice](https://leanpub.com/fluttermasterybuildingproduction-gradeapplications) | 17 capítulos con sus secciones. Es el índice más completo de los cinco |

### 6.3 Certificación

No se encontró un examen oficial de Google para Flutter. La búsqueda solo devolvió material de práctica de un
examen de terceros («AFD-200 Flutter Certified Application Developer») y no se abrió ninguna lista de
objetivos (6.7). Ninguna fila del temario cita una certificación.

### 6.4 Sílabos de universidades y plataformas

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| UNAM n | [Temario «Flutter Básico desde Cero»](https://www.ingenieria.unam.mx/cursosunica/temarios/Temarios_julio_2023/Temario_Flutter.pdf) (PDF alojado en el sitio de la Facultad de Ingeniería de la UNAM, carpeta de temarios de julio de 2023; 30 horas. El documento no nombra la institución) | Las 11 unidades |
| PLZ n | Platzi, [Curso de Flutter](https://platzi.com/cursos/flutter/) | Las 7 secciones y 26 clases |

### 6.5 Cursos largos de YouTube y plataformas

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| FCC n | freeCodeCamp.org, «Flutter Course for Beginners», 37 horas, de Vandad Nahavandipoor — [artículo del curso](https://www.freecodecamp.org/news/learn-flutter-full-course/) | Los 51 capítulos |
| YT-ES n | «Curso Introducción a Flutter» en español, 9 h 15 min, [listado en Cursa](https://cursa.app/es/curso-gratis/flutter-bcbh). La página no nombra el canal de YouTube | Las lecciones, numeradas hasta la 65, en 7 bloques |
| UD cN | «Flutter & Dart - The Complete Guide» (Udemy), según [unos apuntes públicos del curso](https://fistkim101.github.io/lecture/flutter_and_dart_the_complete_guide/flutter_and_dart_the_complete_guide/) | Títulos de los capítulos 1 a 14. La página de Udemy no abrió (6.7) |

Los cursos largos confirman el orden de Fundamentos y Aplicación y dónde terminan: Firebase, Bloc,
publicación e internacionalización. Ninguno llega a render objects, Impeller, FFI ni rendimiento medido.

### 6.6 Rutas públicas y entrevistas de nivel sénior

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| RM | Ruta de Flutter de roadmap.sh, leída en [una copia pública](https://iagodantasf.github.io/tech-studies/roadmaps/skill-based/flutter/) que se declara tomada de roadmap.sh | Los temas de sus 13 grupos. La página original no mostró los nodos (6.7) |
| ENT n | Serie «Flutter Interview Questions» de DEV Community, 14 partes. Se abrieron la [parte 6](https://dev.to/anurag_dev/flutter-interview-questions-part-6-advanced-flutter-platform-channels-internals-keys--432l) y la [parte 7](https://dev.to/anurag_dev/flutter-interview-questions-part-7-advanced-flutter-renderobjects-isolates-engine-performance-3821) | Grupos de temas de las partes 6 y 7. **De las otras doce solo se leyó el título**; una cita «ENT n» con n distinto de 6 y 7 se apoya en ese título |
| ENT-S n | DistantJob, [12 Senior Flutter Interview Questions](https://distantjob.com/?p=128139) | El tema de cada una de las 12 preguntas |

### 6.7 Fuentes que no se pudieron abrir o llegaron incompletas

| Fuente | Qué pasó | Cómo se cubrió |
|---|---|---|
| [roadmap.sh/flutter](https://roadmap.sh/flutter) | La página abrió, pero su contenido legible no incluye los nodos de la ruta. El repositorio en GitHub rechazó la lectura automática y el JSON en bruto dio error | Copia pública de la ruta (RM). **Pendiente:** revisar los nodos de roadmap.sh a mano antes de aprobar |
| `dart.dev/language/evolution` | Error del sitio | Las versiones de cada función se tomaron de «What's new», que registra cuándo se documentó cada una (aviso en 1.4) |
| Página de interop nativo de docs.flutter.dev (dos direcciones probadas) | Error del sitio | Índice lateral, página de platform channels y entrada de novedades de 3.50 |
| Ruta de aprendizaje oficial (`docs.flutter.dev/learn`) | Abrió sin la lista de lecciones | No se usó como fuente |
| Udemy (página del curso «Flutter & Dart - The Complete Guide») | Error del sitio | Apuntes públicos del curso, solo capítulos 1 a 14 |
| Certificación de Flutter | No se abrió ninguna lista de objetivos; solo títulos de resultados de búsqueda | Sin cubrir (decisión D11) |
| Serie de entrevistas de DEV Community, partes 1–5 y 8–14 | No se abrieron | Solo sus títulos |
| Canal del curso en español de 9 horas | El listado no nombra el canal | Se cita el listado; **pendiente** identificar el canal |
| Curso largo en español de nivel avanzado | La búsqueda no devolvió ninguno con temario legible | Sin cubrir: las fuentes en español solo confirman el nivel básico |
| api.flutter.dev y pub.dev | No se consultaron | Los nombres de API se comprueban al escribir cada tema (1.4, regla 3) |
| Estado de las augmentations de Dart | No aparece en las páginas abiertas | Sin tema propio (1.4, regla 2) |


## Anexo A · Destino de los 119 temas actuales

Numeración de la columna «Tema actual»: la de hoy. Numeración de «Flutter objetivo»: la de la sección 2.

| Tema actual | Título | Palabras | Destino |
|---|---|---:|---|
| M0 T1 | Sound null safety | 1099 | Flutter objetivo: M1 T6 |
| M0 T2 | Clases y mixins | 1141 | Flutter objetivo: M3 T1, M3 T6 |
| M0 T3 | Futures, async/await y colecciones funcionales | 1020 | Flutter objetivo: M2 T4, M4 T2, M12 T1 |
| M0 T4 | Lints y estilo con analysis_options.yaml | 800 | Flutter objetivo: M4 T6 |
| M0 T5 | Streams en Dart: secuencias de eventos asíncronos con await for y StreamController | 967 | Flutter objetivo: M4 T3, M12 T3, M12 T4 |
| M0 T6 | Records y patterns en Dart: varios valores sin clases y switch exhaustivo | 956 | Flutter objetivo: M2 T6, M10 T5, M10 T6 |
| M0 T7 | Extension methods y extension types: agregar comportamiento sin heredar | 1282 | Flutter objetivo: M11 T3, M11 T4 |
| M1 T1 | StatelessWidget vs StatefulWidget | 980 | Flutter objetivo: M5 T2, M5 T3 |
| M1 T2 | Layout con Row, Column y Stack, y ciclo de vida | 1005 | Flutter objetivo: M5 T3, M6 T2, M6 T3, M14 T1 |
| M1 T3 | Keys | 1201 | Flutter objetivo: M14 T4 |
| M1 T4 | Los tres árboles de Flutter: Widget, Element y RenderObject | 1071 | Flutter objetivo: M23 T1, M23 T2 |
| M1 T5 | Gestos en Flutter: GestureDetector, Dismissible y la arena de gestos | 1346 | Flutter objetivo: M7 T1, M24 T2, M24 T4 |
| M2 T1 | MediaQuery vs LayoutBuilder | 1081 | Flutter objetivo: M13 T5 |
| M2 T2 | Cómo Flutter calcula tamaños | 1032 | Flutter objetivo: M6 T1, M23 T6 |
| M2 T3 | Breakpoints propios y SafeArea | 1224 | Flutter objetivo: M13 T6 |
| M3 T1 | go_router: navegación como función de la URL | 968 | Flutter objetivo: M15 T2 |
| M3 T2 | Guards y deep linking | 1159 | Flutter objetivo: M15 T4, M15 T5 |
| M3 T3 | Transiciones personalizadas | 1157 | Flutter objetivo: M19 T5 |
| M4 T1 | setState y sus límites | 981 | Flutter objetivo: M9 T2 |
| M4 T2 | Riverpod | 1055 | Flutter objetivo: M16 T3 |
| M4 T3 | Bloc/Cubit y otras alternativas | 1118 | Flutter objetivo: M16 T5, M27 T1 |
| M4 T4 | Formularios profesionales con Formz y Riverpod | 1377 | Flutter objetivo: M27 T3 |
| M4 T5 | Inyección de dependencias con Riverpod: reemplazar implementaciones | 1297 | Flutter objetivo: M16 T4, M27 T7 |
| M5 T1 | http vs dio | 1025 | Flutter objetivo: M9 T4, M17 T1 |
| M5 T2 | json_serializable | 1016 | Flutter objetivo: M17 T2 |
| M5 T3 | Interceptores y estados explícitos | 1217 | Flutter objetivo: M17 T3 |
| M5 T4 | Flujo de autenticación con tokens: login, almacenamiento seguro, renovación y cierre de sesión | 1521 | Flutter objetivo: M17 T5, M18 T6 |
| M6 T1 | shared_preferences | 936 | Flutter objetivo: M9 T5 |
| M6 T2 | sqflite vs Hive | 1071 | Flutter objetivo: M18 T3, M18 T5 |
| M6 T3 | Offline-first y Firebase | 1379 | Flutter objetivo: M29 T1, M30 T3 |
| M6 T4 | Restauración de formularios con RestorationMixin y una prueba de recreación | 503 | Flutter objetivo: M27 T6 |
| M6 T5 | Archivos en Flutter: path_provider, carpetas correctas y escritura segura | 882 | Flutter objetivo: M18 T2 |
| M7 T1 | MethodChannel | 1234 | Flutter objetivo: M32 T1 |
| M7 T2 | Plugins federados | 808 | Flutter objetivo: M33 T2 |
| M7 T3 | Permisos de plataforma y cuándo escribir un platform channel propio | 955 | Flutter objetivo: M22 T2 |
| M7 T4 | Cámara, galería y carga multipart de una evidencia | 1342 | Flutter objetivo: M17 T7, M22 T3 |
| M7 T5 | Trabajo en segundo plano con workmanager: sincronizar aunque la app esté cerrada | 986 | Flutter objetivo: M29 T3 |
| M7 T6 | Add-to-app: integrar una pantalla Flutter en una app Android o iOS existente | 1309 | Flutter objetivo: M47 T3 |
| M8 T1 | Animaciones implícitas vs explícitas | 920 | Flutter objetivo: M19 T1, M19 T2 |
| M8 T2 | Flutter DevTools y detección de jank | 858 | Flutter objetivo: M0 T5, M35 T3 |
| M8 T3 | const widgets, RepaintBoundary y shouldRepaint | 987 | Flutter objetivo: M14 T6, M23 T7, M35 T7 |
| M8 T4 | Isolates — trabajo pesado sin congelar la interfaz | 1015 | Flutter objetivo: M12 T7, M31 T1 |
| M8 T5 | CustomPainter: dibujar con Canvas sin repintar de más | 1218 | Flutter objetivo: M25 T1 |
| M9 T1 | Unit tests y widget tests | 957 | Flutter objetivo: M20 T1, M20 T2 |
| M9 T2 | Mocking con mocktail | 876 | Flutter objetivo: M20 T3 |
| M9 T3 | Integration tests | 1138 | Flutter objetivo: M34 T1 |
| M10 T1 | ThemeData con Material 3 | 835 | Flutter objetivo: M8 T4 |
| M10 T2 | Adaptación Material vs Cupertino | 899 | Flutter objetivo: M21 T6 |
| M10 T3 | Accesibilidad con Semantics y dark mode | 1209 | Flutter objetivo: M8 T5, M21 T1 |
| M11 T1 | Builds de release para cada plataforma | 906 | Flutter objetivo: M37 T1 |
| M11 T2 | Iconos y splash screens | 864 | Flutter objetivo: M37 T4 |
| M11 T3 | CI/CD con Codemagic o Fastlane | 887 | Flutter objetivo: M37 T6 |
| M11 T4 | Entornos y flavors con --dart-define-from-file | 836 | Flutter objetivo: M37 T3 |
| M11 T5 | Flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador | 1229 | Flutter objetivo: M36 T1, M36 T4 |
| M12 T1 | Arquitectura por features y Clean Architecture | 847 | Flutter objetivo: M28 T4 |
| M12 T2 | Uniendo los módulos del track | 992 | Proyecto final del curso (sección 4.1): la integración de los módulos pasa a ser el guion del proyecto |
| M12 T3 | Retrospectiva del proyecto integrador | 953 | Proyecto final del curso (sección 4.1): la retrospectiva pasa a ser la rúbrica y el registro de decisiones |
| M12 T4 | Arquitectura recomendada de Flutter: views, view models, repositories y services | 1403 | Flutter objetivo: M16 T7, M28 T1 |
| M13 T1 | Una API Dart puede terminar en una frontera nativa | 932 | Flutter objetivo: M32 T5, M49 T1 |
| M13 T2 | Los secretos no pertenecen al binario | 854 | Flutter objetivo: M49 T2 |
| M13 T3 | Fluidez se mide contra el presupuesto de cada frame | 927 | Flutter objetivo: M35 T2 |
| M13 T4 | Producción exige protocolo, telemetría y contención | 1485 | Flutter objetivo: M50 T5 |
| M14 T1 | Diseño de pantallas y Riverpod | 707 | Flutter objetivo: M16 T4 |
| M14 T2 | Google Maps y localización en tiempo real | 759 | Flutter objetivo: M22 T4 |
| M14 T3 | Animaciones de localización | 578 | Flutter objetivo: M26 T4 |
| M14 T4 | Socket.IO y actualización de rutas | 849 | Flutter objetivo: M17 T6, M29 T7 |
| M14 T5 | Almacenamiento local, imágenes y offline | 611 | Flutter objetivo: M18 T7, M29 T2 |
| M14 T6 | Dio y notificaciones push | 668 | Flutter objetivo: M17 T7, M22 T5 |
| M15 T1 | flutter test y WidgetTester | 651 | Flutter objetivo: M9 T6, M20 T4 |
| M15 T2 | pumpAndSettle, golden e integration tests | 900 | Flutter objetivo: M20 T4, M20 T6 |
| M15 T3 | Rendimiento, RepaintBoundary y Keys | 769 | Flutter objetivo: M23 T7, M35 T7 |
| M15 T4 | Clean Architecture | 659 | Flutter objetivo: M28 T3 |
| M15 T5 | Internacionalización completa | 769 | Flutter objetivo: M21 T3, M21 T4 |
| M15 T6 | Builds, firma y despliegue | 702 | Flutter objetivo: M37 T2, M38 T1, M38 T2 |
| M15 T7 | Migrar una app a Flutter 3.50 y Dart 3.14 sin romper la entrega | 960 | Flutter objetivo: M51 T1 |
| M15 T8 | Integrar IA generativa en una app Flutter con Firebase AI Logic | 914 | Flutter objetivo: M41 T1 |
| M16 T1 | reconocer cuándo usar FFI y crear el paquete | 600 | Flutter objetivo: M46 T1 |
| M16 T2 | generar bindings C seguros para Dart | 623 | Flutter objetivo: M46 T3 |
| M16 T3 | conectar una biblioteca Rust mediante una ABI C | 616 | Flutter objetivo: M46 T7 |
| M16 T4 | compilar y empaquetar bibliotecas por plataforma | 600 | Flutter objetivo: M46 T6 |
| M16 T5 | medir rendimiento y evitar bloquear la interfaz | 674 | Flutter objetivo: M46 T5 |
| M16 T6 | propiedad de memoria, liberación y errores | 727 | Flutter objetivo: M46 T4 |
| M17 T1 | macros de Dart y alternativas disponibles | 598 | Flutter objetivo: M45 T1 |
| M17 T2 | generación avanzada con build_runner | 553 | Flutter objetivo: M45 T2 |
| M17 T3 | reflexión limitada y registro tipado | 601 | Flutter objetivo: M45 T6 |
| M17 T4 | recorrer el AST de Dart con analyzer | 551 | Flutter objetivo: M45 T4 |
| M17 T5 | crear un builder pequeño para build_runner | 590 | Flutter objetivo: M45 T3 |
| M17 T6 | diseñar y validar un paquete Dart | 661 | Flutter objetivo: M33 T1 |
| M18 T1 | la frontera entre Dart y el código nativo | 692 | Flutter objetivo: M32 T5, M49 T1 |
| M18 T2 | secretos fuera del binario | 740 | Flutter objetivo: M49 T2 |
| M18 T3 | fluidez y presupuesto de frames | 594 | Flutter objetivo: M35 T2 |
| M18 T4 | protocolo, telemetría y contención | 573 | Flutter objetivo: M50 T5 |
| M18 T5 | reportes de fallos con Crashlytics y Sentry | 791 | Flutter objetivo: M50 T2 |
| M18 T6 | analítica con privacidad y consentimiento | 580 | Flutter objetivo: M50 T3 |
| M18 T7 | monitoreo de rendimiento en una versión publicada | 749 | Flutter objetivo: M48 T7, M50 T4 |
| M19 T1 | estado de la jornada con Riverpod | 616 | Flutter objetivo: M16 T4 |
| M19 T2 | mapa y permiso de ubicación | 530 | Flutter objetivo: M22 T4 |
| M19 T3 | animar el marcador sin saltos | 485 | Flutter objetivo: M26 T4 |
| M19 T4 | posiciones en tiempo real con Socket.IO | 506 | Flutter objetivo: M17 T6, M29 T7 |
| M19 T5 | confirmaciones offline y sincronización | 497 | Flutter objetivo: M18 T7, M29 T2 |
| M19 T6 | carga de evidencia con Dio y notificaciones | 573 | Flutter objetivo: M17 T7, M22 T5 |
| M20 T1 | pruebas unitarias y de widget con Flutter Test | 461 | Flutter objetivo: M9 T6, M20 T4 |
| M20 T2 | internacionalización y formatos locales | 442 | Flutter objetivo: M21 T3, M21 T4 |
| M20 T3 | golden e integración de un flujo real | 464 | Flutter objetivo: M20 T6, M34 T3 |
| M20 T4 | perfilado y presupuesto de rendimiento | 487 | Flutter objetivo: M35 T4, M48 T7 |
| M20 T5 | Clean Architecture y sustitución de dependencias | 449 | Flutter objetivo: M28 T3 |
| M20 T6 | builds por plataforma, firma y entrega | 527 | Flutter objetivo: M37 T2, M38 T1, M38 T2 |
| M21 T1 | catálogo y flujo con `in_app_purchase` | 614 | Flutter objetivo: M39 T1 |
| M21 T2 | suscripciones Android, planes base y cambios | 612 | Flutter objetivo: M39 T2 |
| M21 T3 | suscripciones iOS con StoreKit | 596 | Flutter objetivo: M39 T3 |
| M21 T4 | pruebas de IAP en sandbox | 565 | Flutter objetivo: M39 T4 |
| M21 T5 | restauración de compras y entitlement | 533 | Flutter objetivo: M39 T5 |
| M21 T6 | validación de transacciones en servidor | 649 | Flutter objetivo: M39 T6 |
| M22 T1 | configurar AdMob y cargar el primer banner de prueba | 749 | Flutter objetivo: M40 T1 |
| M22 T2 | elegir mediación, bidding y waterfall | 619 | Flutter objetivo: M40 T3 |
| M22 T3 | banners, interstitials y anuncios recompensados | 701 | Flutter objetivo: M40 T2 |
| M22 T4 | pruebas de anuncios y diagnóstico de no-fill | 600 | Flutter objetivo: M40 T4 |
| M22 T5 | consentimiento, privacidad y audiencias | 605 | Flutter objetivo: M40 T5 |
| M22 T6 | comparar AdMob, AppLovin MAX y Unity LevelPlay | 704 | Flutter objetivo: M40 T6 |
