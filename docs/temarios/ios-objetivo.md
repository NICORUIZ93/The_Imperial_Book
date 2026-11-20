# Temario objetivo · iOS con Swift (Xcode 27 · Swift 6.4 · iOS 27), de cero a experto

**Estado:** Aprobado por el dueño el 2026-11-20, con la opción recomendada en cada decisión. (specs/021, Fase 3, criterio Z2). Versión extendida (regla 10 de
la spec). No hay lecciones escritas ni cambiadas: este documento solo fija qué temas tendrá el curso, en qué
orden y de dónde sale cada uno.
**Fecha de revisión de fuentes:** 2026-11-20.
**Versiones de referencia:** Xcode 27.2 · Swift 6.4 (6.4.2) · SDK de iOS 27 · destino mínimo iOS 26. El
detalle y su comprobación están en la sección 1.4; `docs/VERSIONES.md` es la fuente de las versiones de la
academia.
**Identificador de ruta:** `ios` (se conserva, y con él el progreso de lectura). Las lecciones viven en
`web/public/content/ios/modulo-N.md`.

## 1. Resumen

### 1.1 El curso hoy

El listado medido (`docs/reestructuracion/listado-de-temas.csv`, filas `ios`) tiene **69 temas en 15
módulos** (M0–M14) y 70.489 palabras.

| Nivel declarado hoy | Temas | % |
|---|---:|---:|
| Básico | 9 | 13 % |
| Intermedio | 32 | 46 % |
| Avanzado | 25 | 36 % |
| Experto | 3 | 4 % |

Hoy el 41 % de los temas está en Avanzado o Experto (28 de 69), por debajo de la mitad que exige la regla 4
de la spec. Más grave que ese porcentaje es lo que no existe:

- El curso **empieza en opcionales**: no enseña variables, control de flujo, funciones, colecciones ni cómo
  instalar y usar Xcode. No es «de cero».
- No hay tema propio de ARC y ciclos de retención, layout a fondo, listas, Core Data, macros, modularización,
  CI/CD, StoreKit, Live Activities, passkeys ni Foundation Models.
- UIKit es **un** tema de 1.610 palabras; Instruments, **uno** de 795.
- Los módulos van de 3 a 10 temas, y M13 y M14 mezclan asuntos sin relación (seguridad, push, ubicación,
  animación, pruebas, Core ML, widgets).

Ningún tema actual sale hacia otro curso: los 69 alimentan el temario objetivo (anexo A).

### 1.2 El curso objetivo

**324 temas en 51 módulos** (de 4 a 7 temas cada uno), en los cuatro tramos del formato único.

| Tramo (nivel) | Módulos | Temas | Ya está | Está pero básico | Falta |
|---|---|---:|---:|---:|---:|
| Fundamentos (Básico) | M0–M9 | 62 | 7 | 21 | 34 |
| Aplicación (Intermedio) | M10–M21 | 77 | 7 | 26 | 44 |
| Integración (Avanzado) | M22–M39 | 116 | 23 | 28 | 65 |
| Experto (Experto) | M40–M50 | 69 | 5 | 4 | 60 |
| **Total** | M0–M50 | **324** | **42** | **79** | **203** |

- **Integración + Experto: 185 de 324 temas (57 %)**. Cumple la regla «al menos la mitad».
- **Faltan 203 temas** (63 %): no existen hoy en el curso.
- **79 temas están pero son básicos** (24 %): existen, y cada fila dice qué les falta.
- **42 temas ya están** (13 %) con la profundidad suficiente. También pasan al formato de 12 secciones en la
  Fase 5, como todos.
- Duración estimada: 324 temas a 40 min de media ≈ 216 h, más unas 24 h de proyecto final. Es una
  estimación; los minutos reales se fijan tema a tema (20–45 min) al escribirlos. Hoy 10 temas declaran más de
  45 min: al reescribirlos se parten o se ajustan al máximo de 45.

### 1.3 Cómo se decidió el estado de cada tema

- **ya está**: hay un tema actual dedicado al asunto, con unas 900 palabras o más.
- **está pero básico**: el asunto aparece, pero en un tema corto (menos de unas 900 palabras según el CSV),
  compartido con otros asuntos, o solo como mención dentro de otro tema. La fila dice qué falta.
- **falta**: ningún tema actual lo trata.

**Límite de esta clasificación:** se hizo con el título, el nivel y el número de palabras de cada tema en el
CSV, con los encabezados de los 15 módulos y con una búsqueda de un centenar de nombres de API y herramientas en el texto
de las lecciones (por ejemplo, `async let` aparece 8 veces y solo en M4 T3; `GeometryReader`,
`NavigationSplitView`, `@Bindable`, `StoreKit` o `Xcode Cloud` no aparecen ninguna). No se leyeron las 69
lecciones línea a línea. La columna «qué falta» es la lista de lo que el tema objetivo exige; al reescribir
cada tema (Fase 5) se comprueba contra la lección real y lo que ya esté se conserva.

Entre paréntesis va el tema actual de origen con la numeración de hoy («M4 T3» es el tema 3 del módulo 4
actual). Un tema actual puede alimentar a más de un tema objetivo cuando se parte, y varios temas cortos
pueden fusionarse en uno. El anexo A da el destino de los 69 temas actuales, uno por uno.

### 1.4 Rigor de versiones

Comprobado el 2026-11-20 en las páginas oficiales (enlaces en la sección 6.1):

| Pieza | Versión estable vigente | Dónde se comprobó |
|---|---|---|
| Swift | **6.4.2** (6.4 publicado el 2026-09-15; 6.4.1 el 2026-10-12; la página de instalación no fecha la 6.4.2) | swift.org, instalación y blog |
| Xcode | **27.2** (27B52, 2026-10-29). Exige macOS Tahoe 26.6, trae el compilador Swift 6.4 y el SDK de iOS 27.2, y admite destinos de despliegue iOS 15–27. Modos de lenguaje: Swift 6, 5, 4.2 y 4 | developer.apple.com, soporte de Xcode y notas de publicaciones |
| iOS | **27.2.1** (2026-11-09) | developer.apple.com, publicaciones |
| En beta (no se enseña como estable) | Xcode 27.3 beta 2 (2026-11-16) e iOS 27.3 beta 2 (2026-11-19) | developer.apple.com, publicaciones |
| Libro oficial del lenguaje | *The Swift Programming Language (6.4)* | índice del repositorio `swiftlang/swift-book` |
| Academia | Xcode 27 · Swift 6.4 · destino mínimo iOS 26; Mac del dueño con Xcode 27.2 y Swift 6.4.2 (2026-11-18) | `docs/VERSIONES.md` |

Lo que el temario toma de cada versión reciente de Swift, según los anuncios oficiales de publicación:

| Versión | Funciones que aparecen en el temario | Temas |
|---|---|---|
| Swift 6.2 | aislamiento por defecto en el actor principal, funciones asíncronas en el contexto del llamador, `@concurrent`; `InlineArray` y `Span`; modo estricto de seguridad de memoria; `Observations`; notificaciones con tipo; Subprocess 0.1; pruebas de salida y adjuntos en Swift Testing; swift-syntax precompilado para macros; mejoras de depuración asíncrona en LLDB | M22 T5, M23 T3, M41 T3, M41 T5, M32 T5, M42 T3, M21 T1 |
| Swift 6.3 | `@c` y `@c` con `@implementation`; `@specialize`, `@inline(always)`, `@export(implementation)`; vista previa de Swift Build en SwiftPM; `swift package show-traits`; Swift Testing: severidad de avisos, cancelación de pruebas, adjuntos de imagen; salidas experimentales de DocC | M40 T3, M40 T6, M41 T6, M37 T5, M37 T7, M32 T5 |
| Swift 6.4 | `some T?`/`any T?` sin paréntesis (SE-0521); `@diagnose` (SE-0522); `await` en `defer` (SE-0493); `withTaskCancellationShield` (SE-0504); notificaciones continuas de `@Observable` (SE-0506); Subprocess 1.0; interoperabilidad XCTest ↔ Swift Testing (ST-0021), `CustomTestReflectable` (ST-0022), repetición de casos (ST-0024); Swift Build por defecto en SwiftPM; SBOM (SE-0509); accesores `borrow`/`mutate` (SE-0507); `Ref`/`MutableRef` (SE-0519); `UniqueBox` (SE-0517); `UniqueArray` (SE-0527); `Iterable` (SE-0516); tipos no copiables con `Equatable`/`Comparable`/`Hashable` | M11 T3, M23 T3, M23 T4, M19 T3, M32 T5, M37 T7, M41 T2–T4, M48 T7 |

Reglas que se proponen para el curso:

1. **Solo lo estable.** Nada de Xcode 27.3 beta ni de iOS 27.3 beta. La documentación de SwiftUI y UIKit ya
   lista símbolos marcados «beta» (`ScrollGestureAxisLock`, `ToolbarContainerBehavior`,
   `UIBarContainerBehavior`): quedan fuera hasta que salgan en una versión estable.
2. **Una sola excepción señalada.** La documentación de App Intents tiene un apartado «Siri AI Developer
   Preview». M35 T6 lo menciona con ese rótulo en el título y en un aviso, y su laboratorio no depende de él
   (decisión D5).
3. **Versión en el título cuando la función es reciente.** Los temas que dependen de Swift 6.2, 6.3 o 6.4 lo
   dicen en el título, porque un proyecto con un Xcode anterior no los compila.
4. **Destino mínimo iOS 26 con el SDK de iOS 27** (como fija `docs/VERSIONES.md`). Lo que solo exista en
   iOS 27 se enseña detrás de `#available` (M2 T6). Decisión D2.
5. **Datos que este documento no verificó y se comprueban al escribir cada tema** (regla 9 de la spec):
   - Los números de propuesta (SE-, ST-) y el reparto exacto de funciones entre 6.3 y 6.4 se leyeron de los
     anuncios a través de un resumen automático. Hay al menos una incoherencia: los selectores de módulo
     (`Modulo::simbolo`) aparecen en la lectura de los dos anuncios. Por eso el temario no les asigna versión
     ni tema propio; se confirma en swift.org antes de escribir M40.
   - Las versiones mínimas de iOS de cada API (por ejemplo, Observation, SwiftData, Swift Charts, el
     protocolo `Layout` o Foundation Models, que la documentación da como iOS 26.0) no se citan en los
     títulos salvo que se hayan leído hoy: se toman de la página de cada API al escribir el tema.
   - Los nombres de API que aparecen en títulos y no están en los índices leídos (por ejemplo `Logger`,
     `@SceneStorage`, `URLCache`, `MemoryLayout`, `Mirror`, `NavigationSplitView`, `ViewThatFits`) se
     verifican compilando el laboratorio en el Mac.
6. **Bibliotecas de terceros sin versión aquí.** Las que el temario nombra para «leer y decidir» (CocoaPods,
   Carthage, Fastlane, bibliotecas de instantáneas e inspección de vistas) se fijan en `docs/VERSIONES.md`
   antes de escribir su tema. Ningún laboratorio obligatorio depende de ellas (decisión D7).

## 2. Temario objetivo completo

Orden lineal: los módulos se estudian en el orden M0 → M50 y el nivel no baja. Las abreviaturas de la columna
«Fuentes» están en la sección 6. *The Swift Programming Language* se cita por el nombre del capítulo en su
índice; la documentación de Apple, por el nombre del grupo de temas de cada framework.


### Tramo 1 · Fundamentos (nivel Básico) — 62 temas

#### M0 · Entorno: Mac, Xcode y primer programa (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es desarrollar para iOS hoy: Swift, SDK, Xcode, simulador y dispositivo; versiones vigentes (Xcode 27, Swift 6.4, iOS 27) y qué exige el Mac | Básico | **falta** | AD-XC·S64·XCV·VER·DIS v1 |
| 2 | Instalar Xcode y los simuladores; comprobar la instalación con `xcode-select`, `swift --version` y `xcrun simctl list` | Básico | **falta** | AD-XC·SWI·RM |
| 3 | Primer programa Swift sin interfaz: paquete ejecutable, `swift build`, `swift run` y el REPL | Básico | **falta** | TSPL GuidedTour·BNR-S c1, c27 |
| 4 | Recorrer Xcode: navegadores, editor, inspectores, canvas, biblioteca y atajos esenciales | Básico | **falta** | AD-XC·DIS v1·CERT 2·YT-B 1·CS193p L1 |
| 5 | Crear el proyecto de la app, entender sus archivos y ejecutarlo en el simulador y en un iPhone físico | Básico | **falta** | AD-XC·DIS v1·BNR-I c1·CERT 2 |
| 6 | Leer errores: diagnósticos del compilador, fix-its, errores de ejecución, consola y primer punto de parada | Básico | **falta** | CERT 5·BNR-I c9·DIS v5·AD-XC |

#### M1 · Swift: valores, tipos y operadores (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Constantes y variables: `let`, `var`, inferencia y anotación de tipos | Básico | **falta** | TSPL TheBasics·100D d1, d4·BNR-S c2·CERT 4.7 |
| 2 | Números: `Int`, `Double`, conversión explícita y el desbordamiento que detiene el programa | Básico | **falta** | TSPL TheBasics, BasicOperators·BNR-S c4·100D d1 |
| 3 | `Bool`, operadores de comparación y lógicos, rangos y operador ternario | Básico | **falta** | TSPL BasicOperators·100D d2, d5·CERT 4.2·YT-B 24 |
| 4 | `String` y `Character`: interpolación, cadenas multilínea, Unicode y por qué no se indexa con enteros | Básico | **falta** | TSPL StringsAndCharacters·AS c6·BNR-S c7·100D d1–d2 |
| 5 | Tuplas, alias de tipo, `Any` y conversión de tipos con `as`, `as?` e `is` | Básico | **falta** | TSPL TheBasics, TypeCasting |
| 6 | Nombres y estilo en Swift: convenciones de identificadores y código legible | Básico | **falta** | CERT 4.8·TSPL GuidedTour |

#### M2 · Control de flujo, funciones y closures (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `if`, `guard` y `switch` con coincidencia de patrones básica | Básico | **falta** | TSPL ControlFlow·100D d5·BNR-S c3, c5·CERT 4.5 |
| 2 | Bucles `for-in`, `while` y `repeat`; rangos, `stride`, `break`, `continue` y etiquetas | Básico | **falta** | TSPL ControlFlow·100D d6·BNR-S c6·CERT 4.5 |
| 3 | Funciones: etiquetas de argumento, valores por defecto, parámetros variádicos, `inout` y retorno múltiple | Básico | **falta** | TSPL Functions·100D d7–d8·CERT 4.1·BNR-S c12 |
| 4 | Closures: sintaxis, closure final, captura de valores y funciones como parámetros | Básico | **está pero básico** (M0 T4): comparte tema con colecciones y genéricos; faltan la captura dibujada y el paso de funciones como valores | TSPL Closures·100D d9·BNR-S c13·ENT |
| 5 | Errores: `throw`, `do`-`catch`, `try?`, `try!` y `defer` | Básico | **está pero básico** (M5 T2): hoy solo aparece dentro de la capa de red; falta el mecanismo del lenguaje enseñado antes de usarlo | TSPL ErrorHandling·AS c10·BNR-S c23·100D d8 |
| 6 | Comprobar disponibilidad de API con `#available` y `@available`, y destino mínimo de despliegue | Básico | **falta** | TSPL ControlFlow, Attributes·XCV |

#### M3 · Colecciones y opcionales (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `Array`: crear, recorrer, modificar y el fallo de índice fuera de rango diagnosticado | Básico | **está pero básico** (M0 T4): las colecciones son un apartado de un tema compartido; faltan operaciones, coste y el fallo reproducido | TSPL CollectionTypes·CERT 4.4·100D d3·BNR-S c8 |
| 2 | `Dictionary` y `Set`: claves `Hashable`, valores por defecto y operaciones de conjuntos | Básico | **está pero básico** (M0 T4): se nombran sin práctica propia | TSPL CollectionTypes·BNR-S c10–c11·100D d3 |
| 3 | Opcionales: `nil`, `if let`, `guard let`, `??` y encadenamiento opcional | Básico | **ya está** (M0 T1) | TSPL TheBasics, OptionalChaining·AS c3·100D d14·BNR-S c9·YT-B 47·ENT·ENT2·RM |
| 4 | Transformar colecciones: `map`, `filter`, `reduce`, `compactMap`, `sorted` y `first(where:)` | Básico | **está pero básico** (M0 T4): aparecen de pasada; falta práctica graduada y la comparación con el bucle equivalente | TSPL Closures·AS c2·CS193p L5·100D d9 |
| 5 | Semántica de valor en colecciones: copia al asignar, `let` frente a `var` y mutación | Básico | **falta** | TSPL ClassesAndStructures·AS c8·BNR-S c18·ENT |
| 6 | Rangos, `ArraySlice`, `enumerated`, `zip` y secuencias perezosas con `lazy` | Básico | **falta** | AS c2·TSPL CollectionTypes |

#### M4 · Tipos propios: struct, enum y class (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `struct`: propiedades, métodos, `mutating` e inicializador miembro a miembro | Básico | **está pero básico** (M0 T2): el tema actual compara struct y class; falta construir structs paso a paso con `mutating` y el inicializador sintetizado | TSPL ClassesAndStructures, Methods·100D d10·CERT 4.3·BNR-S c15 |
| 2 | Propiedades: almacenadas, calculadas, observadores `willSet`/`didSet`, `lazy` y `static` | Básico | **falta** | TSPL Properties·100D d10–d11·BNR-S c16 |
| 3 | Enumeraciones: casos, valores crudos, `CaseIterable` y valores asociados | Básico | **está pero básico** (M0 T3): comparte tema con protocolos; faltan valores crudos, `CaseIterable` y métodos en enums | TSPL Enumerations·AS c7·100D d3·CERT 4.6·BNR-S c14 |
| 4 | `class`: referencias, identidad con `===`, herencia, `override` y `final` | Básico | **está pero básico** (M0 T2): la herencia y la identidad se mencionan sin ejemplo propio | TSPL Inheritance·100D d12·BNR-S c15 |
| 5 | `struct` frente a `class`: valor y referencia dibujados en memoria y criterio de elección | Básico | **ya está** (M0 T2) | TSPL ClassesAndStructures·AS c8·BNR-S c18·ENT·ENT2·RM |
| 6 | Inicialización completa: designados, de conveniencia, fallables, `required`, las dos fases y `deinit` | Básico | **falta** | TSPL Initialization, Deinitialization·BNR-S c17 |
| 7 | Control de acceso (`private` a `open`), extensiones y tipos anidados | Básico | **falta** | TSPL AccessControl, Extensions, NestedTypes·100D d11, d13·BNR-S c20 |

#### M5 · Protocolos y genéricos: primer contacto (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Protocolos: requisitos, conformidad y extensiones de protocolo | Básico | **está pero básico** (M0 T3): comparte tema con enums; faltan las extensiones de protocolo y la conformidad en una extensión | TSPL Protocols·100D d13·BNR-S c19, c22·CS193p L9·YT-A 15·RM |
| 2 | `Equatable`, `Hashable`, `Comparable`, `Identifiable` y `CustomStringConvertible`: conformidad sintetizada y manual | Básico | **falta** | BNR-S c25·CS193p L10·100D P14 |
| 3 | `Codable`, primer contacto: convertir un tipo propio a JSON y de vuelta | Básico | **está pero básico** (M5 T1): hoy aparece ya mezclado con URLSession; falta el primer contacto aislado | 100D P7–P8·RM·ENT |
| 4 | Genéricos: funciones y tipos genéricos con restricciones | Básico | **está pero básico** (M0 T4): un apartado dentro de un tema de tres asuntos; faltan tipos genéricos propios y restricciones | TSPL Generics·AS c4·BNR-S c21·YT-A 8·CS193p L7·ENT |
| 5 | `some` y `any`, primer contacto: tipos opacos y existenciales | Básico | **falta** | TSPL OpaqueTypes·ADT v3·100D P3 |

#### M6 · SwiftUI: vistas y composición (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Anatomía de una app SwiftUI: `@main`, `App`, `Scene` y `WindowGroup` | Básico | **falta** | AD-SUI App organization, Scenes·DIS v3·CS193p L1 |
| 2 | El protocolo `View`, `body` y `some View`: las vistas son valores que describen la interfaz | Básico | **ya está** (M1 T1) | AD-SUI View fundamentals·TSUI c1·100D P3·CS193p L1·ENT |
| 3 | `Text`, `Image`, `Label`, SF Symbols y el catálogo de recursos | Básico | **falta** | AD-SUI Text input and output, Images·AD-XC Asset management·SBT c5·YT-B 2, 6, 7·CERT 2 |
| 4 | Modificadores: cómo envuelven la vista y por qué importa el orden | Básico | **ya está** (M1 T2) | AD-SUI View configuration·100D P3·CS193p L2·TSUI c1 |
| 5 | Colores, gradientes, materiales, formas básicas y modo oscuro | Básico | **falta** | AD-SUI Shapes·YT-B 3–5, 44, 55·100D P2 |
| 6 | Extraer subvistas y propiedades; vistas con parámetros | Básico | **está pero básico** (M1 T1): la composición está; falta el criterio de cuándo extraer y las vistas como propiedades | 100D P3·YT-B 20–21·DIS v3 |
| 7 | Previews: `#Preview`, variantes, datos de ejemplo y canvas interactivo | Básico | **está pero básico** (M1 T3): comparte tema con rejillas y property wrappers; faltan variantes, datos de ejemplo y diagnóstico de una preview que falla | AD-XC Essentials·AD-SUI Previews in Xcode·AD-WK Previews |

#### M7 · SwiftUI: layout esencial (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `VStack`, `HStack`, `ZStack`, `Spacer` y `padding` | Básico | **ya está** (M1 T2) | AD-SUI Layout fundamentals·SBT c7·YT-B 10–12·ADT v1 c1 |
| 2 | `frame`, alineación, `background`, `overlay` y área segura | Básico | **falta** | AD-SUI Layout adjustments·YT-B 8, 9, 17 |
| 3 | Cómo se reparte el espacio: el padre propone, el hijo elige (modelo mental básico) | Básico | **falta** | TSUI c3·100D P18·CS193p L5 |
| 4 | `ScrollView`, pilas perezosas, `LazyVGrid` y `Grid` | Básico | **está pero básico** (M1 T3): comparte tema con previews; faltan `Grid`, pilas perezosas y cuándo usar cada una | AD-SUI Scroll views, View groupings·SBT c16·YT-B 15–16·100D P8 |
| 5 | `List` y `ForEach`: identidad de las filas, secciones, acciones de deslizamiento y edición | Básico | **falta** | AD-SUI Lists·SBT c14–c15·YT-B 14, 31, 58·CS193p L10·ADT v1 c2 |
| 6 | Adaptar la interfaz: orientación, clases de tamaño, `ViewThatFits` y primer contacto con Dynamic Type | Básico | **falta** | BNR-I c17·100D P19·CS193p L11 |

#### M8 · SwiftUI: estado e interacción básica (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `@State`: la fuente de verdad local y por qué la vista se vuelve a evaluar | Básico | **ya está** (M2 T1) | AD-SUI Model data·TSUI c2·YT-B 19·100D P1·CS193p L4·DIS v3 |
| 2 | `@Binding`: compartir estado con una subvista, proyección con `$` y bindings propios | Básico | **está pero básico** (M2 T1): el binding básico está; faltan los bindings construidos a mano y el error de duplicar la fuente de verdad | ADT v1 c4·YT-B 22·YT-A 27·CS193p L7·100D P11 |
| 3 | Controles: `Button`, `Toggle`, `Picker`, `Slider`, `Stepper` y `DatePicker` | Básico | **está pero básico** (M3 T3): los controles son la segunda mitad de un tema de deep linking; falta cada control con su estilo y su estado | AD-SUI Controls and indicators·SBT c6·YT-B 18, 37–42, 57·100D P1, P4 |
| 4 | Entrada de texto: `TextField`, `SecureField`, `TextEditor`, `@FocusState` y teclado | Básico | **está pero básico** (M3 T3): solo `TextField` básico; faltan foco, tipos de teclado y envío | AD-SUI Text input and output, Focus·YT-B 35–36, 60–61·PLZ·100D P1 |
| 5 | Formularios con `Form` y validación de entradas | Básico | **está pero básico** (M3 T3): falta la validación con estado derivado y el botón deshabilitado | 100D P1, P10·SBT c6 |
| 6 | Alertas, diálogos de confirmación y menús contextuales | Básico | **falta** | AD-SUI Modal presentations, Menus and commands·SBT c17·YT-B 32–34·100D P2, P13, P16 |

#### M9 · Navegación básica y primera app completa (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `NavigationStack`, `NavigationLink` y `navigationDestination` | Básico | **está pero básico** (M3 T1): 829 palabras para toda la navegación; aquí queda el primer uso guiado y el resto pasa a Aplicación | AD-SUI Navigation·100D P9·SBT c13·CS193p L10·ADT v1 c3 |
| 2 | Hojas modales: `sheet`, `fullScreenCover`, `popover` y tamaños de presentación | Básico | **ya está** (M3 T2) | AD-SUI Modal presentations·YT-B 28–29·CS193p L11·SBT c17 |
| 3 | `TabView`: pestañas, insignias y selección programática | Básico | **está pero básico** (M3 T2): comparte tema con las hojas; faltan la selección programática y las insignias | YT-B 43, 59·100D P16·PLZ |
| 4 | Barras de herramientas, títulos y búsqueda con `searchable` | Básico | **falta** | AD-SUI Toolbars, Search·100D P9, P19 |
| 5 | Ciclo de vida de vista y escena: `onAppear`, `onDisappear`, `onChange` y `scenePhase` | Básico | **falta** | YT-B 46·ADT v1 c5·100D P13, P17 |
| 6 | Preferencias simples: `UserDefaults` y `@AppStorage`, y qué no guardar ahí | Básico | **falta** | YT-B 52–53·100D P7·RM·SBT c10·ENT |
| 7 | Diseñar como la plataforma: Human Interface Guidelines, Liquid Glass y el ciclo de diseño de una app | Básico | **está pero básico** (M10 T3): las HIG son un tercio de un tema de 908 palabras; faltan Liquid Glass y el ciclo descubrimiento → prototipo → validación | AD-SUI Essentials·DIS v2·CERT 1.1·IOS27 |


### Tramo 2 · Aplicación (nivel Intermedio) — 77 temas

#### M10 · Swift intermedio: modelar con tipos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Opcionales por dentro: el enum `Optional`, `map`/`flatMap`, desempaquetado implícito y el fallo por `!` diagnosticado | Intermedio | **está pero básico** (M0 T1): el uso seguro está; falta el tipo por dentro y el fallo real leído en el informe | AS c3·TSPL OptionalChaining·ENT·ENT2 |
| 2 | Enums como máquinas de estado: valores asociados, `indirect`, exhaustividad y estados de pantalla | Intermedio | **está pero básico** (M0 T3): faltan los enums recursivos y el modelado de estados (cargando, vacío, error, datos) | AS c7·TSPL Enumerations·100D P14·ENT |
| 3 | Coincidencia de patrones completa: `if case`, `guard case`, `where`, tuplas y el operador `~=` | Intermedio | **falta** | TSPL Patterns·AS c7 |
| 4 | Errores con tipo: `throws(E)`, `Result`, `rethrows` y traducción de errores entre capas | Intermedio | **está pero básico** (M5 T2): 853 palabras centradas en la red; faltan `Result`, `rethrows` y la traducción entre capas | TSPL ErrorHandling·AS c10·100D P16·YT-A 28 |
| 5 | Subscripts, key paths y `@dynamicMemberLookup` | Intermedio | **falta** | TSPL Subscripts, Attributes·YT-A 29, 32 |
| 6 | Property wrappers propios: qué genera el compilador, `wrappedValue` y `projectedValue` | Intermedio | **está pero básico** (M1 T3): hoy se explican solo como consumidores (los de SwiftUI); falta escribir uno y ver su expansión | BNR-S c26·YT-A 30–31·RM·100D P13 |
| 7 | Operadores avanzados y propios: sobrecarga, precedencia y aritmética con desbordamiento | Intermedio | **falta** | TSPL AdvancedOperators·YT-A 33 |

#### M11 · Protocolos y genéricos en serio (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Programación orientada a protocolos: implementaciones por defecto y la trampa del despacho estático en extensiones | Intermedio | **está pero básico** (M0 T3): falta la programación orientada a protocolos como diseño y el caso trampa reproducido | AS c5·BNR-S c22·RM·ENT·ENT2 |
| 2 | Tipos asociados y cláusulas `where` | Intermedio | **falta** | TSPL Generics·AS c5 |
| 3 | `some` frente a `any` a fondo: existenciales, tipos asociados primarios y cuándo cuesta cada uno | Intermedio | **falta** | TSPL OpaqueTypes·AS c5·ADT v3·S64 |
| 4 | Genéricos avanzados: extensiones con restricciones y conformidad condicional | Intermedio | **está pero básico** (M0 T4): falta todo lo que va más allá de una función genérica | TSPL Generics·AS c4 |
| 5 | `Sequence`, `Collection` e `IteratorProtocol`: escribir una colección propia | Intermedio | **falta** | AS c2·S64 |
| 6 | Result builders: cómo funciona `@ViewBuilder` y construir un DSL pequeño | Intermedio | **falta** | RM·YT-A 9·CS193p L7·PSUI |

#### M12 · Memoria y ARC (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | ARC paso a paso: conteo de referencias fuertes y momento exacto de la liberación | Intermedio | **falta** | TSPL AutomaticReferenceCounting·AS c9·BNR-S c24·ENT·ENT2 |
| 2 | Ciclos de retención: `weak`, `unowned` y listas de captura | Intermedio | **está pero básico** (M10 T5): `weak` solo aparece en los delegados del tema de UIKit; falta el ciclo reproducido y las listas de captura | TSPL AutomaticReferenceCounting·AS c9·BNR-S c24·ENT·ENT2 |
| 3 | Closures que escapan: `@escaping`, `self` implícito y explícito, y delegados débiles | Intermedio | **falta** | TSPL Closures·ENT2·ENT |
| 4 | Copy-on-write: cómo lo hace `Array` y cómo implementarlo en un tipo propio | Intermedio | **falta** | AS c8·ENT |
| 5 | Encontrar fugas: depurador de grafo de memoria y el instrumento Leaks | Intermedio | **está pero básico** (M10 T1): el instrumento se nombra en el tema de Instruments; falta el flujo completo sobre una fuga real | ENT2·ENT·AD-PERF Memory and size |
| 6 | Seguridad de memoria: acceso exclusivo y conflictos de acceso | Intermedio | **falta** | TSPL MemorySafety |

#### M13 · Concurrencia I: async/await y tareas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Por qué concurrencia: hilo principal, interfaz bloqueada y lo que había antes (callbacks y GCD, como historia) | Intermedio | **falta** | MCS c1·RM·ENT·ENT2 |
| 2 | `async`/`await`: puntos de suspensión y qué ocurre con el hilo | Intermedio | **está pero básico** (M4 T1): 888 palabras junto con `Task`; falta el modelo de suspensión dibujado y el error de bloquear dentro de una función asíncrona | TSPL Concurrency·MCS c2·ENT·ENT2 |
| 3 | `Task`, `Task.detached`, prioridades y el modificador `.task` de SwiftUI | Intermedio | **está pero básico** (M4 T1): faltan las tareas desligadas, las prioridades y la relación de `.task` con la vida de la vista | TSPL Concurrency·MCS c3·ENT |
| 4 | `async let` y concurrencia estructurada: árbol de tareas y propagación de errores | Intermedio | **está pero básico** (M4 T3): `async let` se usa dentro del tema de `TaskGroup`; falta su tema propio con el árbol de tareas y la propagación de errores | TSPL Concurrency·ADT v3·ENT·ENT2·RM |
| 5 | `@MainActor`: actualizar la interfaz con seguridad | Intermedio | **está pero básico** (M4 T3): comparte tema con `TaskGroup`; falta el aislamiento de tipos enteros y el error de compilación típico | ENT·MCS c9·S62 |
| 6 | Cancelación cooperativa: `Task.isCancelled`, `checkCancellation` y distinguir cancelación de fallo | Intermedio | **está pero básico** (M4 T4): 469 palabras; faltan los manejadores de cancelación y la cancelación en cascada | TSPL Concurrency·MCS c3 |
| 7 | Puentes con código de callbacks: continuaciones comprobadas | Intermedio | **está pero básico** (M14 T3, M4 T5): las continuaciones se usan como herramienta en dos temas; falta enseñarlas, con el fallo de reanudar dos veces o ninguna | MCS c5·ENT |

#### M14 · Estado y flujo de datos en SwiftUI (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `@Observable`: modelos observables y seguimiento por propiedad | Intermedio | **ya está** (M2 T2) | AD-SUI Model data·ADT v1 c5·100D P7·DIS v4·ENT |
| 2 | `@Bindable`, `@State` con clases y quién es dueño de cada modelo | Intermedio | **falta** | AD-SUI Model data·100D P7, P12 |
| 3 | `@Environment`: valores del sistema, claves propias e inyección de modelos | Intermedio | **ya está** (M2 T3) | AD-SUI Environment values·TSUI c6·PSUI·100D P19 |
| 4 | Identidad de vista: estructural y explícita, `id()` y cuándo vive y muere el estado | Intermedio | **está pero básico** (M2 T3): es la segunda mitad de un tema; falta el fallo de estado que se reinicia y la identidad estructural con `if`/`else` | TSUI c1–c2·PSUI·ENT |
| 5 | Flujo de datos de extremo a extremo: fuente de verdad única, estado derivado y datos hacia abajo, acciones hacia arriba | Intermedio | **falta** | CS193p L5–L6·ADT v1 c8·SBT c8–c9 |
| 6 | `ObservableObject`, `@StateObject`, `@ObservedObject` y `@EnvironmentObject`: leer y migrar código anterior a Observation | Intermedio | **falta** | YT-B 50–51·ENT·SBT c8–c9 |
| 7 | Preferences: comunicar valores del hijo al padre | Intermedio | **falta** | AD-SUI Preferences·TSUI c6·YT-A 10·PSUI |

#### M15 · Layout y componentes reutilizables (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El algoritmo de layout a fondo: propuestas, tamaño ideal, `fixedSize` y `layoutPriority` | Intermedio | **falta** | TSUI c3·100D P18·PSUI |
| 2 | Alineación a fondo y guías de alineación propias | Intermedio | **falta** | 100D P18·TSUI c5 |
| 3 | `GeometryReader`, espacios de coordenadas y cuándo evitarlo | Intermedio | **falta** | 100D P18·CS193p L16·TSUI c5 |
| 4 | Modificadores propios con `ViewModifier` y estilos (`ButtonStyle` y afines) | Intermedio | **falta** | YT-A 1–2·100D P3·AD-SUI View styles |
| 5 | Contenedores genéricos con `@ViewBuilder` | Intermedio | **falta** | YT-A 9·100D P3·CS193p L7 |
| 6 | Dibujo: `Shape`, `Path` y `Canvas` | Intermedio | **falta** | AD-SUI Shapes, Drawing and graphics·YT-A 5–6·SBT c18·ADT v1 c7·CS193p L16 |

#### M16 · Navegación a fondo (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Navegación dirigida por datos: `NavigationPath`, navegación programática y volver a la raíz | Intermedio | **está pero básico** (M3 T1): el camino tipado está en pocas líneas; faltan la navegación programática completa y el retorno a la raíz | 100D P9·AD-SUI Navigation·ENT |
| 2 | `NavigationSplitView`: columnas, iPad y colapso en iPhone | Intermedio | **falta** | 100D P19·ADT v4 c2·CS193p L11 |
| 3 | Un enrutador para la app: rutas como tipos y navegación fuera de las vistas | Intermedio | **falta** | ENT·RM |
| 4 | Enlaces profundos: esquemas de URL, `onOpenURL` y Universal Links | Intermedio | **está pero básico** (M3 T3, M13 T1): media lección de esquemas de URL y una mención de Universal Links en el tema del sandbox; falta el flujo completo y la prueba desde la terminal del simulador | RM·AD-WK Interactivity |
| 5 | Restaurar el estado: `@SceneStorage` y guardar la ruta de navegación | Intermedio | **falta** | 100D P9·AD-UIK App and environment |
| 6 | Presentaciones coordinadas: hojas con `item`, `dismiss`, y de una alerta a una navegación | Intermedio | **está pero básico** (M3 T2): faltan la presentación dirigida por un opcional y el encadenamiento de presentaciones | 100D P11, P19·SBT c17·CS193p L11–L12 |

#### M17 · Red I: URLSession y JSON (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Peticiones HTTP con `URLSession` y `async`/`await`: `URLRequest`, códigos de estado y cuerpo | Intermedio | **ya está** (M5 T1) | RM·ENT·BNR-I c20·100D P10 |
| 2 | `Codable` a fondo: `CodingKeys`, estrategias de fechas y claves, tipos anidados y decodificación manual | Intermedio | **está pero básico** (M5 T1): la decodificación directa está; faltan claves propias, fechas, JSON anidado y el error de decodificación leído | 100D P8, P10·ADT v3·ENT |
| 3 | Cliente de API tipado: endpoints, errores propios y capa de red inyectable | Intermedio | **está pero básico** (M5 T2): los errores están; falta el cliente como pieza sustituible en pruebas | ADT v3·PLZ·ENT |
| 4 | Imágenes remotas: `AsyncImage`, caché en memoria y celdas que se reutilizan | Intermedio | **falta** | YT-B 54·100D P10·ENT |
| 5 | Estados de carga en la interfaz: cargando, vacío, error y recargar con `refreshable` | Intermedio | **falta** | 100D P13–P14·PLZ |
| 6 | App Transport Security y configuración de red de la app | Intermedio | **falta** | ENT·AD-SEC Secure data |

#### M18 · Persistencia I: SwiftData y archivos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Dónde guardar cada dato: preferencias, archivos, base de datos y llavero (criterio) | Intermedio | **falta** | ENT·RM·CS193p L16 |
| 2 | `@Model`, `ModelContainer` y `ModelContext` | Intermedio | **está pero básico** (M6 T1): 740 palabras; falta qué genera la macro, la configuración del contenedor y el guardado automático | AD-SD Model definition, Model life cycle·CS193p L13·DIS v4·100D P11 |
| 3 | Consultar: `@Query`, `FetchDescriptor`, `#Predicate` y ordenación | Intermedio | **está pero básico** (M6 T2): 777 palabras; faltan `FetchDescriptor`, los predicados compuestos y las consultas dinámicas | AD-SD Model fetch·CS193p L13–L15·100D P12 |
| 4 | Relaciones, reglas de borrado, atributos únicos e índices | Intermedio | **falta** | AD-SD Model definition·CS193p L13·100D P12·DIS v4 |
| 5 | Crear, editar, borrar y deshacer; previews con contenedor en memoria | Intermedio | **falta** | AD-SD Essentials, Model life cycle·CS193p L14·DIS v4·ADT v4 c3 |
| 6 | Archivos: `FileManager`, carpetas de la app y `fileImporter` | Intermedio | **ya está** (M6 T4) | RM·100D P14·BNR-I c16 |
| 7 | Guardar `Codable` en disco con escritura atómica y manejo de errores | Intermedio | **falta** | 100D P7, P14·ADT v1 c6 |

#### M19 · Pruebas I: Swift Testing y XCTest (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Swift Testing: `@Test`, `#expect`, `#require` y suites | Intermedio | **ya está** (M9 T1, M14 T3) | AD-ST Essentials, Behavior validation·DIS v4 |
| 2 | Pruebas parametrizadas, traits, etiquetas y problemas conocidos | Intermedio | **falta** | AD-ST Test parameterization, Test customization, Behavior validation |
| 3 | XCTest: leer y mantener suites existentes, convivir y migrar a Swift Testing | Intermedio | **está pero básico** (M9 T1): media lección; faltan la migración y la convivencia de ambas bibliotecas (interoperabilidad en Swift 6.4) | AD-ST Essentials·S64·RM·ENT |
| 4 | Diseñar para probar: protocolos, dobles de prueba e inyección de dependencias | Intermedio | **falta** | YT-A 16–17·ADT v3·RM |
| 5 | Probar código asíncrono: `await` en pruebas y confirmaciones | Intermedio | **ya está** (M9 T2, M14 T3) | MCS c6·AD-ST Behavior validation |
| 6 | Planes de prueba, cobertura y ejecutar las pruebas desde la terminal | Intermedio | **falta** | AD-XC Testing, Command-line tools·S64 |

#### M20 · Arquitectura I: separar responsabilidades (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Modelo e interfaz separados: la lógica fuera de la vista | Intermedio | **falta** | CS193p L3–L4·DIS v4 |
| 2 | De una vista «gorda» a MVVM con `@Observable` | Intermedio | **está pero básico** (M8 T1): 888 palabras; falta el modelo de vista probado y el error de meter navegación y red en él | PLZ·100D P14·RM·ENT·ENT2 |
| 3 | Capas del proyecto e inyección por inicializador y por `Environment` | Intermedio | **está pero básico** (M8 T2): 770 palabras; falta la inyección por entorno y la raíz de composición | YT-A 16·ENT·RM |
| 4 | MVC, MVP, MVVM y VIPER: leer la arquitectura de un proyecto ajeno | Intermedio | **falta** | RM·ENT |
| 5 | Repositorios y casos de uso: aislar red y persistencia de la interfaz | Intermedio | **falta** | RM·ENT·ADT v4 c1 |
| 6 | Cuándo MVVM no alcanza | Intermedio | **ya está** (M8 T3) | ENT·RM |

#### M21 · Herramientas del día a día (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Depurar con LLDB: puntos de parada condicionales y de acción, inspección de valores y tareas asíncronas | Intermedio | **falta** | AD-XC Debugging·BNR-I c9·S62·RM·DIS v5 |
| 2 | Depurar la interfaz: jerarquía de vistas, previews que fallan y Device Hub | Intermedio | **falta** | AD-XC Tuning and debugging |
| 3 | Registro estructurado con `Logger` y lectura en la consola | Intermedio | **falta** | AD-XC Debugging·RM |
| 4 | Git dentro de Xcode: cambios, ramas y conflictos en archivos de proyecto (el Git general vive en Fundamentos) | Intermedio | **falta** | AD-XC Source control management·RM |
| 5 | Swift Package Manager I: añadir dependencias, reglas de versión y `Package.resolved` | Intermedio | **está pero básico** (M12 T3): el tema actual está al final del curso; aquí va el primer uso (añadir y fijar una dependencia) | AD-XC Swift packages·100D P16·RM |
| 6 | Proyecto por dentro: targets, esquemas, configuraciones, ajustes de build, `Info.plist` y archivos `.xcconfig` | Intermedio | **falta** | AD-XC Projects and workspaces, Build system·CERT 2 |
| 7 | Documentar el código: comentarios de documentación y DocC | Intermedio | **falta** | AD-XC Writing documentation·YT-B 45·S63 |


### Tramo 3 · Integración (nivel Avanzado) — 116 temas

#### M22 · Concurrencia II: actores y aislamiento (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Actores: aislamiento, llamadas con `await` y reentrancia (el fallo que no es una carrera de datos) | Avanzado | **está pero básico** (M4 T2): 812 palabras; falta la reentrancia reproducida y `nonisolated` | TSPL Concurrency·MCS c8·ENT·ENT2·RM |
| 2 | Actores globales y `@MainActor` a fondo: aislar tipos, métodos y closures | Avanzado | **está pero básico** (M4 T3): faltan los actores globales propios y la herencia del aislamiento | MCS c9·ENT |
| 3 | `Sendable`: tipos de valor, clases, closures `@Sendable` y `@unchecked Sendable` | Avanzado | **está pero básico** (M4 T6): comparte tema con el modo Swift 6; falta cada caso con su error de compilación | ENT·TSPL Concurrency |
| 4 | Modo de lenguaje Swift 6: comprobación estricta y lectura de los errores de carrera de datos | Avanzado | **ya está** (M4 T6) | ENT·S62·XCV |
| 5 | Concurrencia accesible (Swift 6.2): aislamiento por defecto en el actor principal, funciones asíncronas en el contexto del llamador y `@concurrent` | Avanzado | **falta** | S62 |
| 6 | Migrar un módulo existente al modo Swift 6 paso a paso | Avanzado | **falta** | ENT·S62 |
| 7 | `TaskGroup`: trabajo en paralelo con límite de concurrencia y resultados parciales | Avanzado | **ya está** (M4 T3) | MCS c7·TSPL Concurrency·ENT |

#### M23 · Concurrencia III: secuencias asíncronas y coordinación (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `AsyncSequence` y `for await` | Avanzado | **ya está** (M4 T5) | MCS c3·TSPL Concurrency |
| 2 | `AsyncStream`: puente desde delegados y callbacks, política de búfer y terminación | Avanzado | **está pero básico** (M4 T5): comparte tema; faltan la política de búfer y la limpieza al terminar | MCS c4 |
| 3 | Observar cambios como secuencia: `Observations` (Swift 6.2) y notificaciones con tipo | Avanzado | **falta** | S62·S64 |
| 4 | Cancelación avanzada: manejadores, `withTaskCancellationShield` y `await` dentro de `defer` (Swift 6.4) | Avanzado | **falta** | S64·MCS c3 |
| 5 | Tiempo en concurrencia: esperas, plazos, antirrebote y limitación de frecuencia con tareas | Avanzado | **falta** | MCS c3·100D P17 |

#### M24 · Asincronía heredada: GCD, Operation y Combine (4 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Grand Central Dispatch y `OperationQueue`: leer y migrar código existente | Avanzado | **falta** | RM·ENT·ENT2 |
| 2 | Combine: publishers, subscribers y operadores (`debounce`, `combineLatest`) | Avanzado | **está pero básico** (M7 T1, M7 T2): dos temas de menos de 800 palabras que se fusionan; falta el ciclo de vida de la suscripción y la gestión de `AnyCancellable` | RM·ENT2·YT-A 19 |
| 3 | Combine avanzado: subjects, `Future`, planificadores y contrapresión | Avanzado | **está pero básico** (M14 T5): 720 palabras; faltan los planificadores y la contrapresión | YT-A 19–20·RM |
| 4 | Combine frente a `async`/`await`: criterio y migración | Avanzado | **ya está** (M7 T3) | ENT·ENT2 |

#### M25 · SwiftUI avanzado: animación y gestos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Animaciones implícitas y explícitas, curvas, muelles y transacciones | Avanzado | **está pero básico** (M14 T1): 744 palabras junto con `matchedGeometryEffect`; faltan las transacciones y el control de qué se anima | AD-SUI Animations·TSUI c4·100D P6·YT-B 25–26·CS193p L7–L8·SBT c19 |
| 2 | Transiciones, incluidas las propias | Avanzado | **falta** | YT-B 27·YT-A 3·100D P6·PSUI·SBT c20 |
| 3 | `matchedGeometryEffect` y transiciones entre pantallas | Avanzado | **está pero básico** (M14 T1): falta el fallo típico de identificadores duplicados y la transición de navegación | YT-A 4·AD-SUI Animations |
| 4 | `Animatable`: animar datos propios y formas | Avanzado | **falta** | YT-A 7·PSUI·TSUI c4 |
| 5 | Animaciones por fases y por fotogramas clave; `TimelineView` | Avanzado | **falta** | YT-A 26·AD-SUI Animations |
| 6 | Gestos: tocar, arrastrar, mantener, ampliar, composición y estado del gesto | Avanzado | **ya está** (M14 T2) | AD-SUI Gestures·SBT c11·100D P17·CS193p L16 |
| 7 | Respuesta háptica y efectos ligados al desplazamiento | Avanzado | **falta** | 100D P10, P17, P18·AD-UIK User interface |

#### M26 · SwiftUI avanzado: layout propio, datos visuales y rendimiento (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El protocolo `Layout`: contenedores de layout propios | Avanzado | **falta** | AD-SUI Custom layout·PSUI·TSUI c5·DIS v5 |
| 2 | Desplazamiento avanzado: posición, anclajes, paginación y contenido perezoso | Avanzado | **falta** | AD-SUI Scroll views·100D P18 |
| 3 | Gráficas con Swift Charts | Avanzado | **falta** | SBT c20 |
| 4 | Cómo decide SwiftUI qué volver a evaluar: dependencias, identidad y coste de `body` | Avanzado | **falta** | TSUI c1–c2·ENT·ENT3·AD-PERF Responsiveness |
| 5 | Listas y rejillas grandes: identificadores estables, carga perezosa y el coste del borrado de tipos | Avanzado | **falta** | ENT·AD-PERF Responsiveness·PSUI |
| 6 | Medir SwiftUI con Instruments: el instrumento de SwiftUI y actualizaciones innecesarias | Avanzado | **falta** | AD-SUI Performance analysis·AD-PERF Responsiveness |
| 7 | Liquid Glass a fondo: adoptar el diseño del sistema en barras, hojas y controles propios | Avanzado | **falta** | AD-SUI Essentials·AD-UIK Essentials·IOS27 |

#### M27 · UIKit desde cero (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Ciclo de vida de la app y de las escenas en UIKit: delegado de app y delegado de escena | Avanzado | **falta** | AD-UIK App and environment·RM·ENT |
| 2 | `UIViewController`: ciclo de vida, contención y paso de datos | Avanzado | **está pero básico** (M10 T5): un único tema de 1.610 palabras cubre todo UIKit; aquí falta el ciclo de vida completo trazado y la contención | AD-UIK View controllers·BNR-I c5·ENT·RM·ADT v2 c1 |
| 3 | Vistas y jerarquía: `UIView`, interfaz programática y `layoutSubviews` | Avanzado | **está pero básico** (M10 T5): se construye una pantalla programática; falta la jerarquía y el ciclo de layout | AD-UIK Views and controls·BNR-I c3, c6·RM |
| 4 | Auto Layout: restricciones, tamaño intrínseco, prioridades y `UIStackView` | Avanzado | **está pero básico** (M10 T5): un apartado; faltan prioridades, conflictos de restricciones diagnosticados y stack views | AD-UIK View layout·BNR-I c13·ENT·RM |
| 5 | Delegación, target-action y cadena de respuesta | Avanzado | **falta** | BNR-I c4, c18·ENT |
| 6 | `UINavigationController`, barra de pestañas y presentación modal | Avanzado | **falta** | BNR-I c14·RM·ADT v2 c2 |
| 7 | Storyboards, XIB, `IBOutlet` e `IBAction`: leer y mantener proyectos que los usan | Avanzado | **falta** | CERT 3·RM·ENT |

#### M28 · UIKit moderno e interoperabilidad con SwiftUI (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `UICollectionView` moderno: layout composicional, fuente de datos diffable y registro de celdas | Avanzado | **falta** | ADT v2 c2·BNR-I c21·RM |
| 2 | `UITableView` y reutilización de celdas: mantener listas existentes | Avanzado | **está pero básico** (M10 T5): aparece como ejemplo; falta la reutilización explicada y su fallo típico (celdas con datos de otra fila) | BNR-I c10–c12·ENT·RM |
| 3 | Configuraciones de contenido y vistas de contenido | Avanzado | **falta** | ADT v2 c3 |
| 4 | `UIViewRepresentable`: llevar una vista de UIKit a SwiftUI | Avanzado | **está pero básico** (M14 T6): 645 palabras; faltan el ciclo `makeUIView`/`updateUIView` trazado y el desmontaje | AD-SUI UIKit integration·YT-A 13 |
| 5 | `UIViewControllerRepresentable` y `Coordinator` | Avanzado | **está pero básico** (M14 T7): 611 palabras; falta el coordinador como delegado con un caso real completo | AD-SUI UIKit integration·YT-A 14·PLZ |
| 6 | SwiftUI dentro de UIKit: `UIHostingController`, celdas con contenido SwiftUI y migración gradual de una app | Avanzado | **está pero básico** (M10 T3): un tercio de un tema; falta la estrategia de migración pantalla a pantalla | AD-SUI UIKit integration·ENT |
| 7 | Animación y gestos en UIKit: `UIView.animate`, Core Animation y reconocedores de gestos | Avanzado | **falta** | RM·BNR-I c8, c19·AD-UIK Animation and haptics, Touches, presses, and gestures |

#### M29 · Persistencia II: SwiftData a fondo y Core Data (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Migraciones de esquema en SwiftData: ligeras y con plan propio | Avanzado | **está pero básico** (M6 T3): comparte tema con la comparación con Core Data; falta una migración con plan propio ejecutada | AD-SD Model definition·100D P12 |
| 2 | SwiftData y concurrencia: trabajo en segundo plano y contextos aislados | Avanzado | **falta** | AD-SD Model life cycle·CS193p L15 |
| 3 | Historial de cambios persistente: detectar qué cambió y cuándo | Avanzado | **falta** | AD-SD Model life cycle, History life cycle |
| 4 | Modelos complejos: herencia, enumeraciones, relaciones de varios a varios e índices compuestos | Avanzado | **falta** | AD-SD Essentials, Model definition |
| 5 | Core Data: pila, contextos, peticiones de búsqueda y relaciones | Avanzado | **está pero básico** (M6 T3, M6 T1): solo aparece como comparación; falta enseñarlo para mantener apps que lo usan | BNR-I c22–c23·RM·ENT |
| 6 | Convivir y migrar entre Core Data y SwiftData | Avanzado | **está pero básico** (M6 T3): falta la convivencia de ambas pilas sobre el mismo almacén | AD-SD Essentials |
| 7 | CloudKit con SwiftData: sincronizar entre los dispositivos del usuario | Avanzado | **ya está** (M6 T5) | AD-SD Model life cycle·100D P12·YT-A 21–25 |

#### M30 · Red II: robustez (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Reintentos con espera creciente, idempotencia, plazos y cancelación | Avanzado | **ya está** (M5 T3) | ENT·RM |
| 2 | Caché HTTP: `URLCache`, validadores y políticas por petición | Avanzado | **falta** | RM·ADT v3 |
| 3 | Autenticación: OAuth 2 con sesión web del sistema y renovación de token serializada con un actor | Avanzado | **falta** | RM |
| 4 | Subidas y descargas largas: progreso, sesiones en segundo plano y reanudación | Avanzado | **falta** | RM·S64 |
| 5 | Tiempo real con WebSockets | Avanzado | **falta** | RM |
| 6 | Ver la red: instrumento de tráfico HTTP y respuestas simuladas con `URLProtocol` | Avanzado | **falta** | AD-PERF Network·ADT v3 |
| 7 | Diseñar para mala conectividad: estado de la red, colas de reintento y mensajes al usuario | Avanzado | **falta** | ENT |

#### M31 · Sincronización y trabajo en segundo plano (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Sincronizar red y persistencia local: copia local de los datos del servidor | Avanzado | **ya está** (M12 T2) | AD-SD Model storage·ENT |
| 2 | Offline-first es un protocolo, no una caché | Avanzado | **ya está** (M13 T7) | ENT |
| 3 | Conflictos de sincronización: versiones, fusión y cola de operaciones pendientes | Avanzado | **falta** | ENT |
| 4 | Ciclo de vida del proceso: primer plano, segundo plano, suspensión y terminación por el sistema | Avanzado | **falta** | RM·BNR-I c16·AD-PERF Responsiveness |
| 5 | BackgroundTasks: actualizar y sincronizar cuando el sistema lo permite | Avanzado | **ya está** (M13 T10) | RM·AD-UN Sample code |

#### M32 · Pruebas II: interfaz, integración y concurrencia (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Pruebas de interfaz con XCUITest: estables, con identificadores y objetos de página | Avanzado | **ya está** (M9 T3) | YT-A 18·RM·AD-XC Testing·ENT |
| 2 | Pruebas de vistas: instantáneas e inspección con criterio | Avanzado | **ya está** (M14 T4) | RM·SBT c4 |
| 3 | Probar red y persistencia: respuestas simuladas y contenedor en memoria | Avanzado | **falta** | ADT v3·CS193p L14 |
| 4 | Probar concurrencia: actores, relojes inyectados y pruebas intermitentes | Avanzado | **falta** | MCS c6·AD-ST Behavior validation |
| 5 | Swift Testing avanzado: pruebas de salida del proceso, adjuntos, cancelación y repetición (Swift 6.2 a 6.4) | Avanzado | **falta** | S62·S63·S64·AD-ST Data collection |
| 6 | Pruebas de rendimiento y auditorías automáticas de accesibilidad | Avanzado | **falta** | AD-PERF Essentials·AD-XC Testing |
| 7 | Desarrollo guiado por pruebas en una funcionalidad real | Avanzado | **falta** | RM |

#### M33 · Accesibilidad e internacionalización (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | VoiceOver: etiquetas, valores, rasgos y agrupación de elementos | Avanzado | **está pero básico** (M10 T2): 761 palabras; faltan el orden de lectura, la agrupación y la prueba con el lector real | AD-SUI Accessibility·100D P15·SBT c12·BNR-I c24·ENT |
| 2 | Dynamic Type a fondo, contraste y preferencias de movimiento y transparencia | Avanzado | **está pero básico** (M10 T3): un tercio de un tema; faltan los tamaños de accesibilidad y las preferencias del sistema | AD-SUI Accessibility·100D P15, P17 |
| 3 | Navegación accesible: acciones, rotor, foco y control por voz | Avanzado | **está pero básico** (M14 T2): las acciones accesibles aparecen como alternativa a un gesto; falta el resto | AD-SUI Accessibility·100D P15 |
| 4 | Auditar accesibilidad: Accessibility Inspector y auditoría en pruebas de interfaz | Avanzado | **falta** | AD-XC Interface·ADT v2 c5 |
| 5 | Localización con String Catalogs: textos, plurales y variantes | Avanzado | **ya está** (M10 T4) | AD-XC Localization·BNR-I c7 |
| 6 | Formato según la región: fechas, números, monedas y medidas | Avanzado | **está pero básico** (M10 T4): dos menciones dentro del tema de catálogos; falta el tema propio | BNR-I c7·AD-XC Localization |
| 7 | Idiomas de derecha a izquierda, pseudoidiomas y exportación para traducción | Avanzado | **falta** | AD-XC Localization |

#### M34 · Capacidades del sistema I: permisos, notificaciones y sensores (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Permisos y privacidad: pedir acceso con criterio y vivir con la negativa | Avanzado | **está pero básico** (M13 T4): 681 palabras; falta el flujo completo de estados de autorización y la cadena de propósito | AD-UIK Essentials·CERT 1.2·100D P16 |
| 2 | Notificaciones locales: permiso, disparadores, categorías y acciones | Avanzado | **falta** | AD-UN·100D P16 |
| 3 | Notificaciones push con APNs: registro, token, carga y entornos | Avanzado | **está pero básico** (M13 T6): 693 palabras; faltan el envío de prueba desde la terminal y el diagnóstico de un push que no llega | AD-UN Remote notifications·RM·YT-A 24 |
| 4 | Extensión de servicio, contenido enriquecido, push en segundo plano y la consola de pruebas de push | Avanzado | **falta** | AD-UN Notification service app extension, Remote notifications, Sample code |
| 5 | Core Location moderno: actualizaciones, permisos y precisión | Avanzado | **ya está** (M13 T9) | RM |
| 6 | Mapas con MapKit en SwiftUI | Avanzado | **falta** | 100D P14·RM |
| 7 | Fotos y cámara: selector de fotos, captura y permisos | Avanzado | **falta** | 100D P13·BNR-I c15·PLZ |

#### M35 · Capacidades del sistema II: extensiones, widgets y App Intents (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es una extensión de app: procesos separados, App Groups y datos compartidos | Avanzado | **está pero básico** (M14 T9): los App Groups se explican dentro del tema del widget; falta el modelo general de extensiones | AD-SUI App extensions·AD-UIK App extensions·AD-WK Essentials |
| 2 | WidgetKit: línea de tiempo, familias y recarga | Avanzado | **ya está** (M14 T9) | AD-WK·RM·IOS27 |
| 3 | Widgets interactivos y controles del sistema | Avanzado | **falta** | AD-WK Interactivity, System experiences |
| 4 | Live Activities y Dynamic Island | Avanzado | **falta** | AD-WK System experiences·IOS27 |
| 5 | App Intents: intenciones, entidades y App Shortcuts | Avanzado | **ya está** (M14 T10) | AD-AI App-specific content, Feature integration |
| 6 | App Intents en el sistema: Spotlight, esquemas de dominio y Apple Intelligence (la parte de Siri AI está marcada «Developer Preview») | Avanzado | **está pero básico** (M14 T10): Spotlight se toca en el tema actual; faltan los esquemas y la verificación de la implementación | AD-AI System integration, Feature integration, Testing·IOS27 |
| 7 | Compartir contenido: `ShareLink`, `Transferable`, portapapeles y arrastrar y soltar | Avanzado | **falta** | AD-SUI Event handling·100D P13·S64 |

#### M36 · Seguridad y datos del usuario (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El sandbox reduce la superficie, pero no valida intenciones | Avanzado | **ya está** (M13 T1) | AD-SEC Secure code·CERT 1.2 |
| 2 | Proteger datos es controlar todas sus copias | Avanzado | **ya está** (M13 T2) | CERT 1.2·ENT |
| 3 | Keychain: clases de elemento, accesibilidad, grupos de acceso y errores `OSStatus` | Avanzado | **está pero básico** (M13 T3): 660 palabras; faltan los atributos de accesibilidad, los grupos de acceso y la lectura de errores | AD-SEC Secure data·RM·ENT |
| 4 | Face ID y Touch ID con LocalAuthentication | Avanzado | **ya está** (M13 T5) | 100D P14 |
| 5 | Passkeys, Sign in with Apple y autocompletado de contraseñas | Avanzado | **falta** | AD-SEC Authorization and authentication·RM·IOS27 |
| 6 | Criptografía aplicada: resumen, autenticación de mensajes, cifrado simétrico y firma | Avanzado | **falta** | AD-SEC Cryptography |
| 7 | Privacidad ante la tienda: declaración de datos, manifiestos y permiso de seguimiento | Avanzado | **falta** | AD-UIK Essentials·CERT 1.2 |

#### M37 · Swift Package Manager y modularización (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Paquetes locales: `Package.swift`, targets, productos y dependencias | Avanzado | **ya está** (M12 T3) | AD-XC Swift packages·RM |
| 2 | Recursos, localización y plataformas dentro de un paquete | Avanzado | **falta** | AD-XC Swift packages |
| 3 | Modularizar una app: módulos de funcionalidad, núcleo e interfaces, y su grafo de dependencias | Avanzado | **falta** | ENT·ENT3 |
| 4 | Bibliotecas estáticas y dinámicas, frameworks y distribución binaria | Avanzado | **falta** | AD-XC Bundles and frameworks |
| 5 | Plugins de build y de comando | Avanzado | **falta** | S63 |
| 6 | CocoaPods y Carthage: leer proyectos que los usan y migrarlos a paquetes | Avanzado | **falta** | RM |
| 7 | Publicar y mantener un paquete: versiones semánticas, rasgos del paquete y lista de materiales (SBOM, Swift 6.4) | Avanzado | **falta** | S63·S64 |

#### M38 · Firma, TestFlight y App Store (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Programa de desarrollador, identificadores de app, capacidades y entitlements | Avanzado | **falta** | AD-XC Capabilities·DIS v8 |
| 2 | Certificados y perfiles de aprovisionamiento; firma automática y manual | Avanzado | **ya está** (M11 T1) | AD-DIST Code signing·RM·ENT |
| 3 | Archivar, validar y subir a App Store Connect | Avanzado | **ya está** (M11 T2) | AD-DIST·DIS v8·RM |
| 4 | TestFlight: probadores internos y externos, grupos y comentarios | Avanzado | **está pero básico** (M11 T2): comparte tema con el archivado; faltan los grupos, la revisión beta y la gestión de comentarios | AD-DIST Feedback·DIS v8·RM |
| 5 | Ficha de la tienda, capturas y versionado | Avanzado | **ya está** (M11 T3) | DIS v8·RM |
| 6 | Revisión de la app: directrices, rechazos frecuentes y cumplimiento de exportación de cifrado | Avanzado | **falta** | DIS v8·AD-SEC Cryptography·RM |
| 7 | Estrategia de lanzamiento: publicación por fases, versiones de corrección y retirada | Avanzado | **falta** | ENT |

#### M39 · Monetización y crecimiento (4 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Compras dentro de la app y suscripciones con StoreKit | Avanzado | **falta** | RM |
| 2 | Probar compras: configuración local de StoreKit en Xcode y entorno de pruebas | Avanzado | **falta** | RM·AD-XC Testing |
| 3 | App Clips: una parte de la app sin instalarla | Avanzado | **falta** | RM |
| 4 | Pedir valoraciones con criterio y leer las analíticas de App Store Connect | Avanzado | **falta** | 100D P13·NOV |


### Tramo 4 · Experto (nivel Experto) — 69 temas

#### M40 · Swift por dentro: tipos, despacho y ABI (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Despacho de métodos: directo, por tabla virtual, por tabla de testigos y por mensajes de Objective-C | Experto | **falta** | ENT3·AS c5·ENT |
| 2 | Existenciales por dentro: contenedor, coste y comparación con genéricos especializados | Experto | **falta** | AS c5·ADT v3·ENT3·S64 |
| 3 | Especialización de genéricos y control de la optimización: `@inlinable`, `@specialize` e `@inline(always)` (Swift 6.3) | Experto | **falta** | S63·AS c4 |
| 4 | Disposición en memoria: `MemoryLayout`, pila frente a heap y contexto de los closures | Experto | **falta** | AS c8–c9·ENT3 |
| 5 | `String` por dentro: grafemas, vistas Unicode, índices, `Substring` y rendimiento | Experto | **falta** | AS c6·TSPL StringsAndCharacters |
| 6 | Estabilidad de ABI y evolución de bibliotecas: `@frozen` y `@export(implementation)` (Swift 6.3) | Experto | **falta** | S63·AD-XC Hardware considerations |

#### M41 · Ownership y programación de sistemas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Ownership: `borrowing`, `consuming` y tipos `~Copyable` | Experto | **ya está** (M0 T5) | S64·S62 |
| 2 | Tipos no copiables en genéricos, en opcionales y con `Equatable`/`Hashable` (Swift 6.4) | Experto | **falta** | S64 |
| 3 | `Span`, `RawSpan` e `InlineArray` (Swift 6.2) y accesores `borrow`/`mutate` (Swift 6.4) | Experto | **falta** | S62·S64 |
| 4 | `UniqueBox`, `UniqueArray`, `Ref` y `MutableRef` (Swift 6.4): propiedad única sin conteo de referencias | Experto | **falta** | S64 |
| 5 | Punteros inseguros, memoria manual y el modo estricto de seguridad de memoria (Swift 6.2) | Experto | **falta** | S62·AS c11·S64 |
| 6 | Interoperar con C y Objective-C: cabeceras puente, `@objc`, anotaciones de nulabilidad y `@c` (Swift 6.3) | Experto | **falta** | AS c11·RM·S63·S64 |
| 7 | Interoperar con C++ | Experto | **falta** | S62·S64 |

#### M42 · Macros y metaprogramación (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Macros: independientes y adjuntas, uso y expansión vista en Xcode | Experto | **falta** | TSPL Macros |
| 2 | Escribir una macro con SwiftSyntax: paquete, plugin del compilador y diagnósticos | Experto | **falta** | TSPL Macros·S62·S63 |
| 3 | Probar macros y su coste de compilación (swift-syntax precompilado) | Experto | **falta** | S62·S63 |
| 4 | Leer la expansión de `@Observable`, `@Model`, `#Predicate` y `#Preview` | Experto | **falta** | AD-SD Model definition, Model fetch·CS193p L13·AD-WK Previews·TSPL Macros |
| 5 | Reflexión con `Mirror`, key paths y generación de código: cuándo una macro y cuándo no | Experto | **falta** | YT-A 29·AD-ST Value description and reflection |

#### M43 · Concurrencia por dentro (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El runtime de concurrencia: grupo cooperativo de hilos, ejecutores y por qué no se bloquea un hilo | Experto | **falta** | MCS c1·ENT3·ENT2 |
| 2 | Controlar dónde se ejecuta el código: ejecutores y parámetros de aislamiento | Experto | **falta** | ENT3·S62 |
| 3 | Reentrancia, inversión de prioridad e inanición: diagnóstico con Instruments | Experto | **falta** | ENT3·MCS c8·AD-PERF Responsiveness |
| 4 | Carreras que el compilador no ve: `@unchecked`, `@preconcurrency` y Thread Sanitizer | Experto | **falta** | ENT·ENT2·ENT3 |
| 5 | Diseñar API concurrentes para otros equipos: aislamiento y `Sendable` en la superficie pública | Experto | **falta** | ENT |
| 6 | Actores distribuidos | Experto | **falta** | MCS c10 |

#### M44 · Rendimiento I: medir con Instruments (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Método: objetivo medible, dispositivo real, compilación de lanzamiento y comparación antes/después | Experto | **falta** | AD-PERF Essentials |
| 2 | Time Profiler, árboles de llamadas y Processor Trace | Experto | **está pero básico** (M10 T1): 795 palabras para todo Instruments; falta leer un árbol de llamadas real y Processor Trace | AD-PERF Processor usage·RM |
| 3 | Bloqueos y saltos de imagen: qué son, cómo se detectan y cómo se corrigen | Experto | **falta** | AD-PERF Responsiveness·ENT |
| 4 | Memoria: Allocations, Leaks, crecimiento y terminaciones por presión de memoria | Experto | **está pero básico** (M10 T1): se nombran los instrumentos; falta una investigación completa | AD-PERF Memory and size, Responsiveness·ENT2 |
| 5 | Tiempo de arranque: medirlo y reducirlo | Experto | **falta** | AD-PERF Responsiveness |
| 6 | Energía y red: Power Profiler y consumo de batería | Experto | **falta** | AD-PERF Power, Network |
| 7 | Señales propias (signposts) e instrumentos a medida | Experto | **está pero básico** (M13 T8): los signposts se usan en el tema de operación; falta el tema propio y los instrumentos a medida | AD-PERF Custom instruments |

#### M45 · Rendimiento II: la app en producción (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Métricas de campo: MetricKit y el Organizer de Xcode | Experto | **está pero básico** (M13 T8): MetricKit se cita en el tema de operación; falta leer métricas reales y actuar sobre ellas | AD-PERF Essentials, Responsiveness |
| 2 | Informes de fallo: simbolizar, leer el hilo que falla y reconocer terminaciones del sistema | Experto | **falta** | AD-XC Debugging·AD-PERF Responsiveness·ENT |
| 3 | Tamaño de la app: informe de tamaño y reducción | Experto | **falta** | AD-PERF Memory and size |
| 4 | Disco y almacenamiento: escrituras, uso y métricas | Experto | **falta** | AD-PERF Disk usage |
| 5 | Operar significa detectar, limitar y aprender del fallo | Experto | **ya está** (M13 T8) | ENT |
| 6 | Caso completo: una pantalla SwiftUI lenta llevada a su objetivo con datos | Experto | **falta** | AD-PERF Responsiveness·PSUI·ENT |

#### M46 · Arquitectura II: apps a escala (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Arquitecturas unidireccionales: estado, acción y reductor | Experto | **falta** | ENT·RM |
| 2 | Clean Architecture y VIPER en iOS: fronteras, coste y cuándo compensa | Experto | **falta** | RM·ENT |
| 3 | Inyección de dependencias a escala: raíz de composición, contenedores y entorno | Experto | **falta** | RM·YT-A 16·ENT |
| 4 | Navegación desacoplada entre módulos: coordinadores y rutas públicas | Experto | **falta** | RM·ENT |
| 5 | Diseño de sistemas móviles: lista paginada con imágenes, lectura sin conexión y sincronización (formato de entrevista) | Experto | **falta** | ENT·ENT2 |
| 6 | Evolucionar la API de un módulo compartido entre equipos | Experto | **falta** | ENT |
| 7 | Arquitectura del proyecto integrador | Experto | **ya está** (M12 T1) | ENT·ADT v4 c1 |

#### M47 · Seguridad avanzada (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Modelo de amenazas de una app móvil | Experto | **falta** | CERT 1.2·AD-SEC |
| 2 | TLS y evaluación de confianza: fijación de certificados y sus riesgos operativos | Experto | **falta** | AD-SEC Cryptography, Secure data |
| 3 | Claves protegidas por hardware, control de acceso biométrico y atestación del dispositivo | Experto | **falta** | AD-SEC Secure data, Cryptography |
| 4 | Firma de código por dentro: entitlements, perfiles y qué comprueba el sistema al instalar y al arrancar | Experto | **falta** | AD-SEC Secure code·ENT |
| 5 | Qué ve un atacante en el paquete de la app: secretos en el binario y endurecimiento | Experto | **falta** | AD-SEC Secure code·CERT 1.2 |

#### M48 · CI/CD e ingeniería de lanzamientos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | La app desde la terminal: `xcodebuild`, `xcrun`, `simctl` y los paquetes de resultados | Experto | **falta** | AD-XC Command-line tools |
| 2 | Xcode Cloud: flujos de trabajo, entornos y scripts | Experto | **falta** | AD-XC Distribution and continuous integration·RM |
| 3 | Integración continua en GitHub Actions con ejecutores macOS | Experto | **falta** | RM |
| 4 | Fastlane: leer un `Fastfile` y decidir si hace falta | Experto | **falta** | RM |
| 5 | Firma sin intervención humana: claves de la API de App Store Connect e identidades de firma en CI | Experto | **falta** | AD-DIST Code signing·NOV |
| 6 | Automatizar TestFlight y la ficha con la API de App Store Connect | Experto | **falta** | NOV·AD-DIST |
| 7 | Tiempos de compilación y calidad en cada cambio: sistema de build, caché, análisis estático y cobertura | Experto | **falta** | AD-XC Build system·S64·S62 |

#### M49 · Inteligencia en el dispositivo (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Core ML y Vision: inferencia en el dispositivo | Experto | **ya está** (M14 T8) | DIS v6·100D P4 |
| 2 | Entrenar un modelo con Create ML | Experto | **falta** | DIS v6·100D P4 |
| 3 | Lenguaje natural y texto en imágenes | Experto | **falta** | DIS v6 |
| 4 | Foundation Models: disponibilidad del modelo, sesiones, instrucciones y ventana de contexto | Experto | **falta** | AD-FM·IOS27·DIS v6 |
| 5 | Salida estructurada con generación guiada y llamadas a herramientas | Experto | **falta** | AD-FM Structured output, Tools |
| 6 | Evaluar, proteger y medir una función generativa; cuándo usar Private Cloud Compute | Experto | **falta** | AD-FM Safety, Performance and evaluation, Private Cloud Compute |

#### M50 · Más allá del iPhone y criterio de experto (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | iPad a fondo: ventanas, varias escenas, puntero y teclado | Experto | **falta** | AD-SUI App structure·AD-UIK User interactions·100D P19·CS193p L11 |
| 2 | La misma base de código en macOS, watchOS y visionOS: qué se comparte y qué no | Experto | **falta** | ADT v4·DIS v7·SBT c22–c23·AD-SUI Framework integration |
| 3 | Swift fuera de las plataformas de Apple: línea de comandos con Subprocess, servidor, Android, WebAssembly y Embedded (panorama) | Experto | **falta** | S62·S63·S64·BNR-S c27 |
| 4 | Asistentes de código en Xcode: usarlos con criterio y verificar lo que proponen | Experto | **falta** | AD-XC Code·DIS v1 |
| 5 | Mantenerse al día: leer una propuesta de Swift Evolution, activar funciones futuras y adoptar el SDK de cada año | Experto | **falta** | S62·S64·AD-DIST Testing·AD-XC Essentials |
| 6 | Mapa de la entrevista sénior de iOS: lenguaje, concurrencia, SwiftUI, arquitectura y diseño de sistemas | Experto | **falta** | ENT·ENT2·ENT3 |
| 7 | Cierre del track | Experto | **ya está** (M12 T4) | — |

### 2.1 Notas de linealidad

- **Swift antes que la interfaz.** M1–M5 son Swift puro en un paquete (sin SwiftUI). El estudiante ve la app
  en el simulador en M0 T5 y vuelve a ella en M6, ya sabiendo leer el código que escribe.
- **Las pruebas se ejecutan desde M1** (los laboratorios traen pruebas escritas) y **se escriben desde M19**.
  Ningún tema anterior a M19 pide escribir una prueba.
- **Las macros se usan mucho antes de explicarse**: `#Preview` (M6 T7), `@Observable` (M14 T1), `@Model` y
  `#Predicate` (M18), `@Test` (M19). Cómo funcionan y cómo se escriben va en M42; M42 T4 vuelve sobre esas
  cuatro y lee su expansión.
- **La concurrencia tiene cuatro pasadas a propósito**: uso (M13), actores y aislamiento (M22), secuencias y
  coordinación (M23) y funcionamiento interno (M43). Lo mismo ocurre con opcionales (M3 T3 y M10 T1), enums
  (M4 T3 y M10 T2), protocolos y genéricos (M5, M11 y M40), `some`/`any` (M5 T5, M11 T3 y M40 T2), layout
  (M7 T3, M15 T1 y M26 T1), navegación (M9 y M16), SwiftData (M18 y M29), red (M17 y M30), pruebas (M19 y
  M32), Swift Package Manager (M21 T5 y M37), Instruments (M12 T5, M26 T6 y M44) y ownership (M3 T5 como
  semántica de valor, M12 y M41). En cada grupo, el tema posterior enlaza al anterior y no lo repite.
- **`.task` y `refreshable` no aparecen antes de M13.** M9 T5 enseña el ciclo de vida solo con trabajo
  síncrono; la carga asíncrona entra en M13 T3 y M17.
- **UIKit va después de SwiftUI** (M27–M28) y se enseña para mantener e integrar código existente. Quien
  llegue de UIKit puede leer M27 antes, pero el orden del curso no lo exige.
- **Publicar (M38) está en Integración por orden, no por dificultad**: hoy esos temas declaran nivel
  Intermedio, pero solo tiene sentido firmar y subir la app cuando ya tiene red, persistencia y pruebas. Al
  reescribirlos suben a Avanzado porque incorporan el diagnóstico de fallos de firma y de revisión.
- **El servidor de los laboratorios de red** (desde M17) es un servidor local de pruebas incluido en el
  laboratorio. El curso no exige haber hecho Spring ni Docker (decisión D9).
- **Instruments se usa con guion en M12 T5 y M26 T6** y se enseña completo en M44.

### 2.2 Temas de las fuentes que se dejan fuera a propósito

| Tema que aparece en las fuentes | Dónde aparece | Propuesta |
|---|---|---|
| Objective-C como lenguaje completo | RM | Fuera como lenguaje. Queda leerlo e interoperar (M41 T6). Decisión D8 |
| Storyboards e Interface Builder como forma principal de construir interfaz | CERT 3, BNR-I, RM | Solo un tema de lectura y mantenimiento (M27 T7) |
| Alamofire y otras bibliotecas de red de terceros | RM | Fuera: el curso usa `URLSession`. Una nota en M17 T3 |
| Firebase (autenticación, base de datos, push) | lista de YouTube de Swiftful Thinking «Firebase» | Fuera: es un proveedor concreto; la nube de la academia es Floci y vive en Cloud |
| SQLite directo | RM | Una nota en M18 T1; no hay tema propio. Decisión D8 |
| AVFoundation (audio y vídeo), WebKit, Core Image, Core Graphics a fondo, reconocimiento de voz | RM, ADT v1 c8, 100D P13, PLZ | Fuera del tronco. Candidatos a un módulo optativo «Medios y contenido web» (decisión D8) |
| Juegos y gráficos: SpriteKit, Metal, RealityKit, 3D | IOS27, DIS v7 | Fuera |
| visionOS, watchOS y macOS como cursos completos | DIS v7, ADT v4, SBT c22–c23 | Solo M50 T2 (qué se comparte). Decisión D8 |
| Salud, hogar, pagos y otros frameworks de dominio (HealthKit, HomeKit, Wallet, PencilKit, TextKit, impresión) | AD-UIK, IOS27 | Fuera |
| CloudKit usado directamente (registros, recursos, suscripciones) | YT-A 21–25 | Solo a través de SwiftData (M29 T7) |
| Git, control de versiones y revisión de código | RM | Curso Fundamentos (ya es su dueño); aquí solo la integración en Xcode (M21 T4) |
| HTTP, REST y OAuth como teoría | RM, ENT | Curso Fundamentos; aquí su uso desde la app (M17, M30 T3) |
| Diseño de producto: descubrimiento, prototipos y validación con usuarios | DIS v2, CERT 1.1 | Un tema (M9 T7). No hay curso de diseño en la academia |
| Algoritmos y estructuras de datos de entrevista | ENT | Fuera: no es específico de iOS |
| Core AI y proveedores de modelos propios en Foundation Models; Image Playground | AD-FM, DIS v6 | Fuera por ahora: M49 se queda en el modelo del sistema |
| Texto enriquecido y herramientas de escritura del sistema | AD-UIK Text | Fuera |

## 3. Lo que hoy está en iOS y debería vivir en otro curso

Regla 1 de la spec: un concepto, un curso dueño. iOS se queda con Swift, los frameworks de Apple, Xcode y la
distribución en App Store. **Ningún tema actual de iOS sale completo hacia otro curso**; lo que hay son
fronteras que conviene fijar para no duplicar:

| Asunto | Dónde se toca en iOS | Curso dueño del concepto | Qué queda en iOS |
|---|---|---|---|
| Git | M21 T4 | **Fundamentos** | Usarlo desde Xcode y resolver conflictos en archivos de proyecto |
| HTTP, REST, JSON como formato | M17 | **Fundamentos** | `URLSession`, `Codable` y el cliente de la app |
| OAuth 2 / OIDC y tokens | M30 T3 | **Fundamentos** (concepto) y **Spring** (servidor) | El flujo desde la app y la custodia del token en el llavero |
| Criptografía (conceptos) | M36 T6, M47 | **Fundamentos** | Las API de Apple y su uso correcto |
| CI/CD (qué es un pipeline, DORA) | M48 | **DevOps** | Lo específico de Apple: `xcodebuild`, firma en CI, Xcode Cloud, TestFlight |
| Diseño de sistemas | M46 T5 | **Diseño de sistemas** | El lado móvil: sin conexión, sincronización, paginación e imágenes |
| Aprendizaje automático y modelos generativos (conceptos) | M49 | **IA aplicada** (`docs/temarios/ia-aplicada.md`) | Los frameworks en el dispositivo. Decisión D6 |
| Backend de RutaFlow | M17, M30, M31 | **Spring / Microservicios** | Un servidor local de pruebas dentro del laboratorio (decisión D9) |
| Kotlin Multiplatform: compartir lógica con Android | — | **Kotlin Multiplatform** | Nada: se enlaza desde M50 T2 |

Nada se pierde (regla 2): ningún tema se retira. Los 69 temas actuales tienen su destino en el anexo A. El
contenido se mueve a su módulo nuevo solo cuando el dueño apruebe este temario.

## 4. Proyecto guía y laboratorio por módulo

### 4.1 Proyecto guía: `RutaFlowApp` y `RutaFlowKit`

Las lecciones actuales ya usan esos nombres (`RutaFlowApp` aparece 137 veces y `RutaFlowKit` 19): se conservan.
Es **la app del repartidor de RutaFlow**, el mismo dominio del resto de la academia (envíos, rutas, entregas),
y crece módulo a módulo, sin ejemplos sueltos.

| Tramo | Qué es el proyecto al terminar el tramo |
|---|---|
| Fundamentos (M0–M9) | `RutaFlowKit` como paquete Swift con el modelo de entregas probado, y una primera `RutaFlowApp` en SwiftUI con pestañas, lista, detalle, formulario, búsqueda y preferencias |
| Aplicación (M10–M21) | La app por capas: estado con Observation, navegación con enrutador y enlaces profundos, cliente de la API contra un servidor local, persistencia con SwiftData, batería de pruebas, registro y documentación |
| Integración (M22–M39) | La app completa: concurrencia estricta en modo Swift 6, modo sin conexión con sincronización, pantallas UIKit integradas, accesibilidad e idiomas, notificaciones, mapa, widget, Live Activity, App Intents, llavero y biometría, dividida en paquetes y subida a TestFlight |
| Experto (M40–M50) | La misma app medida y endurecida: campaña de rendimiento con Instruments, informes de fallo leídos, macro propia, analizador binario con `Span`, modelo de amenazas, pipeline de CI/CD, una función con modelos en el dispositivo y versión para iPad |

**Proyecto final (con rúbrica, formato único §3):** entregar `RutaFlowApp` con (1) compilación sin avisos en
modo Swift 6 y pruebas en verde desde la terminal; (2) el flujo «completar entrega» funcionando sin conexión
y sincronizado después, con su prueba de interfaz; (3) auditoría de accesibilidad superada y dos idiomas;
(4) un informe de rendimiento con objetivo, traza de Instruments y mejora demostrada; (5) el pipeline que
entrega una compilación a TestFlight; y (6) un registro de decisiones (arquitectura, persistencia,
aislamiento, qué se dejó en UIKit y por qué). Recoge los actuales M12 T1 y M12 T4.

### 4.2 Convenciones de los laboratorios

- Hoy **no existe** `examples/ios/`: las lecciones traen el código dentro del Markdown y citan comandos
  `xcodebuild`. El temario propone crear `examples/ios/modulo-N/` con `README.md`, versiones fijadas
  (Xcode, Swift, destino de despliegue, simulador) y `verificar.sh`, que termina en `RESULTADO: OK`
  (formato único §3).
- **Dos clases de laboratorio:**
  - *SwiftPM* (M1–M5, M10 y M11): paquete Swift puro; `verificar.sh` ejecuta `swift build` y `swift test`.
    En principio podrían comprobarse también con la cadena de herramientas abierta de Swift fuera de macOS,
    pero **no se probó**; la referencia sigue siendo el Mac.
  - *Xcode* (el resto): proyecto o paquete con destino iOS; `verificar.sh` ejecuta
    `xcodebuild test -scheme … -destination 'platform=iOS Simulator,…'` y comprueba el resultado.
    **Solo se pueden verificar en un Mac con Xcode 27.**
- Cada laboratorio parte del estado final del anterior; el README dice qué archivo cambia y por qué.
- Los laboratorios de red llevan su servidor local de pruebas y no dependen de Internet.
- Énfasis propio del curso (spec 021 §3): diagramas de estado para SwiftUI y de actores para la concurrencia,
  la misma app que crece y **capturas reales del simulador** en cada tema de interfaz (se generan en el Mac
  con `xcrun simctl io … screenshot`).
- Lo que un guion no puede comprobar se declara en el README como **verificación manual con lista de
  comprobación**: VoiceOver real, Face ID en dispositivo, llegada de un push, aspecto de una animación,
  lectura de una traza de Instruments, subida a TestFlight y respuesta de la revisión de la tienda.

### 4.3 Laboratorio por módulo

Columna «Dónde se verifica»: **Mac** = Mac con Xcode 27 y simulador; **+iPhone** = además un dispositivo físico; **+cuenta** = además la membresía de pago del programa de desarrolladores (decisión D10); **SwiftPM** = paquete Swift puro que se comprueba con `swift test` (ver 4.2).

| Módulo | Tramo | Laboratorio (`examples/ios/modulo-N/`) | Dónde se verifica |
|---|---|---|---|
| M0 · Entorno: Mac, Xcode y primer programa | Fundamentos | Instalar y comprobar el entorno; paquete `hola-rutaflow` ejecutado con `swift run` y proyecto `RutaFlowApp` creado y lanzado en el simulador | Mac |
| M1 · Swift: valores, tipos y operadores | Fundamentos | Calculadora de tarifa de un envío: tipos numéricos, conversiones y texto con acentos y emojis, con pruebas ya escritas que el estudiante hace pasar | SwiftPM |
| M2 · Control de flujo, funciones y closures | Fundamentos | Clasificador de paquetes por peso, zona y urgencia con `switch`, funciones pequeñas y errores que terminan en un mensaje útil | SwiftPM |
| M3 · Colecciones y opcionales | Fundamentos | Manifiesto de reparto: lista de entregas con datos que faltan, transformada y resumida con colecciones y opcionales sin un solo `!` | SwiftPM |
| M4 · Tipos propios: struct, enum y class | Fundamentos | Modelo de `Entrega`, `Direccion` y `EstadoEntrega` con invariantes protegidas; se demuestra con pruebas qué se copia y qué se comparte | SwiftPM |
| M5 · Protocolos y genéricos: primer contacto | Fundamentos | `RutaFlowKit` nace como paquete: modelos comparables, identificables y codificables, y un almacén en memoria genérico | SwiftPM |
| M6 · SwiftUI: vistas y composición | Fundamentos | Tarjeta de entrega de RutaFlowApp compuesta por subvistas, con previews en claro, oscuro y texto grande | Mac |
| M7 · SwiftUI: layout esencial | Fundamentos | Lista de entregas del día y rejilla de resumen que se adaptan a iPhone pequeño, grande y horizontal | Mac |
| M8 · SwiftUI: estado e interacción básica | Fundamentos | Formulario «nueva entrega» con validación en vivo, foco entre campos y confirmación antes de descartar | Mac |
| M9 · Navegación básica y primera app completa | Fundamentos | Primera versión completa de RutaFlowApp: pestañas, lista → detalle, búsqueda, hoja de edición y preferencias guardadas | Mac |
| M10 · Swift intermedio: modelar con tipos | Aplicación | Los estados de una entrega como máquina de estados con transiciones inválidas imposibles de compilar, y un envoltorio de propiedad propio para valores acotados | SwiftPM |
| M11 · Protocolos y genéricos en serio | Aplicación | Repositorio genérico y una colección propia de paradas de ruta; un DSL mínimo para describir una ruta | SwiftPM |
| M12 · Memoria y ARC | Aplicación | Tres fugas plantadas en RutaFlowApp (closure, delegado y temporizador) encontradas con el grafo de memoria y corregidas | Mac |
| M13 · Concurrencia I: async/await y tareas | Aplicación | Carga concurrente del resumen del día: de bloquear la interfaz a `async let`, con cancelación al salir de la pantalla | Mac |
| M14 · Estado y flujo de datos en SwiftUI | Aplicación | El estado de RutaFlowApp reorganizado: un modelo observable por funcionalidad, entorno propio y un fallo de identidad reproducido y corregido | Mac |
| M15 · Layout y componentes reutilizables | Aplicación | Biblioteca de componentes de RutaFlow: estilo de botón, insignia de estado, contenedor de tarjeta y un indicador de progreso dibujado | Mac |
| M16 · Navegación a fondo | Aplicación | Enrutador de RutaFlowApp con rutas tipadas, enlace profundo a una entrega abierto desde `simctl` y restauración tras relanzar | Mac |
| M17 · Red I: URLSession y JSON | Aplicación | Cliente de la API de RutaFlow contra un servidor local de pruebas incluido en el laboratorio: lista, detalle, errores y estados de carga | Mac |
| M18 · Persistencia I: SwiftData y archivos | Aplicación | Entregas y clientes persistidos con SwiftData: relaciones, búsqueda, borrado en cascada y comprobante exportado a un archivo | Mac |
| M19 · Pruebas I: Swift Testing y XCTest | Aplicación | Batería de pruebas de `RutaFlowKit` con Swift Testing (parametrizadas y asíncronas) y la suite XCTest heredada migrada | Mac |
| M20 · Arquitectura I: separar responsabilidades | Aplicación | RutaFlowApp refactorizada a capas con repositorios inyectados; la misma pantalla antes y después, con sus pruebas | Mac |
| M21 · Herramientas del día a día | Aplicación | Sesión de depuración guiada sobre tres fallos plantados, registro estructurado y documentación DocC de `RutaFlowKit` | Mac |
| M22 · Concurrencia II: actores y aislamiento | Integración | Caché de entregas como actor con un fallo de reentrancia reproducido, y `RutaFlowKit` migrado al modo Swift 6 sin avisos | Mac |
| M23 · Concurrencia III: secuencias asíncronas y coordinación | Integración | Flujo en vivo de la posición del repartidor con `AsyncStream`, búsqueda con antirrebote y cancelación limpia | Mac |
| M24 · Asincronía heredada: GCD, Operation y Combine | Integración | Un módulo heredado con GCD y Combine leído, cubierto con pruebas y migrado a `async`/`await` | Mac |
| M25 · SwiftUI avanzado: animación y gestos | Integración | Tarjeta de entrega con arrastre para completar, transición propia al detalle y animación del progreso de ruta | Mac |
| M26 · SwiftUI avanzado: layout propio, datos visuales y rendimiento | Integración | Layout propio para las etiquetas de una entrega, gráfica de entregas por hora y una lista de 10.000 filas medida antes y después | Mac +iPhone |
| M27 · UIKit desde cero | Integración | Pantalla de historial de entregas escrita en UIKit puro (programática y con Auto Layout) dentro de un proyecto aparte | Mac |
| M28 · UIKit moderno e interoperabilidad con SwiftUI | Integración | El historial pasa a `UICollectionView` moderno y se integra en RutaFlowApp; un escáner de códigos de UIKit envuelto para SwiftUI | Mac +iPhone |
| M29 · Persistencia II: SwiftData a fondo y Core Data | Integración | Migración del esquema de RutaFlowApp entre dos versiones, importación en segundo plano y un almacén Core Data heredado leído y convivido | Mac |
| M30 · Red II: robustez | Integración | Cliente de red endurecido: reintentos, caché validada, renovación de token sin carreras y tráfico inspeccionado con Instruments | Mac |
| M31 · Sincronización y trabajo en segundo plano | Integración | Modo sin conexión de RutaFlowApp: cola de entregas completadas que se sincroniza al volver la red y resuelve un conflicto | Mac +iPhone |
| M32 · Pruebas II: interfaz, integración y concurrencia | Integración | Pruebas de interfaz del flujo «completar entrega», pruebas de red con respuestas simuladas y una prueba intermitente estabilizada | Mac |
| M33 · Accesibilidad e internacionalización | Integración | Auditoría de accesibilidad de RutaFlowApp con VoiceOver y Accessibility Inspector, y la app en español, inglés y un idioma de derecha a izquierda | Mac +iPhone |
| M34 · Capacidades del sistema I: permisos, notificaciones y sensores | Integración | Aviso local de «entrega próxima», push de nueva asignación, mapa de la ruta y foto de comprobante | Mac +iPhone +cuenta |
| M35 · Capacidades del sistema II: extensiones, widgets y App Intents | Integración | Widget con las entregas pendientes, Live Activity de la ruta en curso y la acción «completar entrega» como App Intent | Mac +iPhone |
| M36 · Seguridad y datos del usuario | Integración | Sesión guardada en el llavero, acción sensible confirmada con biometría y revisión de privacidad de RutaFlowApp | Mac +iPhone |
| M37 · Swift Package Manager y modularización | Integración | RutaFlowApp partida en paquetes (`Nucleo`, `Red`, `Persistencia`, `DiseñoUI` y funcionalidades) con el grafo de dependencias comprobado | Mac |
| M38 · Firma, TestFlight y App Store | Integración | RutaFlowApp firmada, archivada y subida a TestFlight con un grupo de prueba; lista de comprobación previa a la revisión | Mac +cuenta |
| M39 · Monetización y crecimiento | Integración | Suscripción «RutaFlow Pro» probada con la configuración local de StoreKit | Mac |
| M40 · Swift por dentro: tipos, despacho y ABI | Experto | La misma función de tarifa llamada de cuatro formas y medida; lectura del código generado y de la disposición en memoria | Mac |
| M41 · Ownership y programación de sistemas | Experto | Analizador de un formato binario de etiquetas de envío con `Span` y tipos no copiables, y enlace a una biblioteca C | Mac |
| M42 · Macros y metaprogramación | Experto | Una macro propia que genera código repetitivo de `RutaFlowKit`, con sus pruebas, y la expansión de `@Observable` leída línea a línea | Mac |
| M43 · Concurrencia por dentro | Experto | Tres fallos de concurrencia plantados (reentrancia, bloqueo del grupo cooperativo y carrera oculta) diagnosticados con Instruments y Thread Sanitizer | Mac +iPhone |
| M44 · Rendimiento I: medir con Instruments | Experto | Campaña de rendimiento de RutaFlowApp: arranque, desplazamiento y memoria con objetivo, traza de Instruments y mejora demostrada | Mac +iPhone |
| M45 · Rendimiento II: la app en producción | Experto | Tres informes de fallo reales de RutaFlowApp simbolizados y explicados; informe de tamaño de la app reducido | Mac +cuenta |
| M46 · Arquitectura II: apps a escala | Experto | Registro de decisiones de arquitectura de RutaFlowApp y el diseño escrito de la sincronización para 50.000 entregas | Mac |
| M47 · Seguridad avanzada | Experto | Modelo de amenazas de RutaFlowApp, evaluación de confianza del servidor a medida y revisión del paquete de la app como lo vería un atacante | Mac +iPhone |
| M48 · CI/CD e ingeniería de lanzamientos | Experto | Pipeline completo de RutaFlowApp: pruebas en cada cambio y entrega automática a TestFlight desde la terminal y desde un servicio de CI | Mac +cuenta |
| M49 · Inteligencia en el dispositivo | Experto | Lectura de la etiqueta de un paquete con Vision y un resumen del día generado en el dispositivo con salida estructurada | Mac +iPhone |
| M50 · Más allá del iPhone y criterio de experto | Experto | RutaFlowApp adaptada a iPad con varias ventanas y un objetivo para macOS; ficha de una propuesta de Swift Evolution leída y probada | Mac |

Recuento: Mac: 30 módulos · Mac +iPhone: 10 módulos · SwiftPM: 7 módulos · Mac +cuenta: 3 módulos · Mac +iPhone +cuenta: 1 módulo.

**Límites de verificación (regla 9 de la spec):**

- **Todo lo que no es SwiftPM exige el Mac del dueño con Xcode 27.** Este temario se escribió en un entorno
  Linux sin Xcode: no se compiló ni ejecutó ningún ejemplo.
- **Necesitan iPhone físico** (el simulador no basta o no es fiable): rendimiento y energía (M26, M44),
  biometría real y llavero con protección por hardware (M36, M47), cámara (M28, M34), push real (M34), Live
  Activities en la isla dinámica (M35), VoiceOver con gestos (M33), sincronización al perder la red (M31) y
  modelos en el dispositivo (M49).
- **Necesitan la membresía de pago del programa de desarrolladores** (a confirmar en developer.apple.com
  antes de escribir cada módulo): push con APNs (M34), CloudKit (M29 T7), TestFlight y App Store Connect
  (M38, M48), métricas e informes de fallo de una app distribuida (M45) y Sign in with Apple (M36 T5).
- **No son automatizables de extremo a extremo:** la revisión de la tienda (M38 T6), la publicación por
  fases (M38 T7) y las compras reales (M39). Se enseñan con el entorno de pruebas y con capturas reales.

## 5. Decisiones que debe tomar el dueño

- **D1 · Tamaño.** Aprobar 324 temas en 51 módulos (hoy 69 en 15), unas 216 h más el proyecto.
  **Recomendación: aprobar completo** (regla 10: siempre la versión extendida). Si hubiera que recortar, los
  módulos con menos pérdida son M39 (monetización, 4 temas) y M49 (inteligencia en el dispositivo, 6 temas).
- **D2 · Versiones y destino mínimo.** Enseñar con Xcode 27.2, Swift 6.4 y el SDK de iOS 27, con destino
  mínimo iOS 26 (lo que ya fija `docs/VERSIONES.md`). **Recomendación: mantenerlo**, con proyectos nuevos en
  modo de lenguaje Swift 6 desde M6 y lo exclusivo de iOS 27 detrás de `#available`. Alternativa: subir el
  mínimo a iOS 27 (menos condicionales, pero las apps del estudiante no correrían en iOS 26).
- **D3 · Peso de UIKit.** El temario le da 14 temas (M27 y M28) más los de interoperabilidad. **Recomendación:
  mantenerlos**: las guías de entrevista y la ruta pública siguen pidiendo ciclo de vida de controladores,
  Auto Layout y listas con reutilización, y casi toda app con años tiene UIKit. Alternativa: reducir a un
  módulo de 7 temas centrado en interoperabilidad.
- **D4 · Combine y Observation anterior.** Combine baja de 4 temas repartidos a un módulo de «asincronía
  heredada» (M24, 4 temas con GCD) y `ObservableObject` queda en un tema de lectura y migración (M14 T6).
  **Recomendación: aprobarlo así**; el curso enseña `async`/`await` y Observation como camino principal.
- **D5 · Funciones en vista previa y beta.** **Recomendación: solo lo estable.** Única excepción propuesta:
  mencionar el apartado «Siri AI Developer Preview» dentro de M35 T6, rotulado y sin laboratorio que dependa
  de él. Alternativa: dejarlo fuera hasta que sea estable.
- **D6 · Inteligencia en el dispositivo (M49).** **Recomendación: iOS es dueño de los frameworks de Apple**
  (Core ML, Vision, Create ML, Foundation Models) y el curso «IA aplicada» lo es de los conceptos (qué es un
  modelo, evaluación, seguridad). Alternativa: mover M49 entero a IA aplicada y dejar aquí solo el actual
  tema de Core ML y Vision.
- **D7 · Bibliotecas de terceros.** **Recomendación: el curso se construye solo con frameworks de Apple.** Las
  de terceros aparecen únicamente en temas de «leer y decidir» (CocoaPods y Carthage en M37 T6, Fastlane en
  M48 T4, instantáneas e inspección de vistas en M32 T2, arquitecturas unidireccionales en M46 T1) y ningún
  laboratorio obligatorio depende de ellas. Confirmar, o indicar cuáles deben enseñarse a fondo.
- **D8 · Temas descartados.** Confirmar que quedan fuera Objective-C como lenguaje, Firebase, SQLite directo,
  juegos y 3D, y los cursos completos de watchOS, visionOS y macOS (sección 2.2). **Recomendación: confirmar,
  y decidir aparte** si se quiere un módulo optativo «Medios y contenido web» (AVFoundation, WebKit, Core
  Image), que hoy no está en el temario y serían unos 6 temas más.
- **D9 · Proyecto guía y servidor.** Aprobar `RutaFlowApp` + `RutaFlowKit` (la app del repartidor, nombres
  que ya usan las lecciones). **Recomendación: que los laboratorios de red usen un servidor local de pruebas
  incluido en el propio laboratorio**, de modo que iOS no dependa de haber hecho Spring ni Docker; el backend
  real de RutaFlow queda como ejercicio opcional del proyecto final.
- **D10 · Cuenta de desarrollador y dispositivo.** 11 módulos necesitan iPhone físico y 4 la membresía
  de pago para verificarse de extremo a extremo (sección 4.3). **Recomendación:** confirmar que el dueño
  dispone de ambos para la Fase 7; si no, esos laboratorios se entregan con verificación parcial en simulador
  y la parte restante queda marcada «sin verificar en dispositivo» en el README.
- **D11 · Nivel de los temas de publicación.** Firma, TestFlight y App Store pasan de Intermedio a Avanzado
  (M38) por orden lineal. **Recomendación: aprobarlo**; la alternativa es adelantar un tema corto «primera
  subida a TestFlight» al final de Aplicación, que rompería la regla de que nada se use antes de enseñarse
  (firma y capacidades).
- **D12 · Certificación.** La única certificación vigente localizada es «App Development with Swift» de
  Apple y Certiport, de nivel inicial y con objetivos de Storyboard. **Recomendación: no orientar el curso a
  ella**; sus objetivos quedan cubiertos por M0–M5, M9 T7 y M27 T7.

## 6. Fuentes consultadas

Consultadas el 2026-11-20. De cada una se tomó solo la lista de temas (hechos), nunca su texto. La columna
«Abrev.» es la que usa la tabla del temario.

### 6.1 Documentación y especificación oficiales

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| TSPL | [The Swift Programming Language (6.4)](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/), índice leído del [repositorio del libro](https://github.com/swiftlang/swift-book/blob/main/TSPL.docc/The-Swift-Programming-Language.md) | Los 3 capítulos de bienvenida, los 29 de la guía del lenguaje y los 10 de la referencia (se citan por nombre de capítulo) |
| SWI | [swift.org · Instalación en macOS](https://www.swift.org/install/macos/) | Versión estable vigente (6.4.2) y fechas de las anteriores |
| S64 | [swift.org · Swift 6.4 Released](https://www.swift.org/blog/swift-6.4-released/) (2026-09-15) | Lista de funciones de lenguaje, concurrencia, biblioteca, pruebas, herramientas, interoperabilidad y plataformas |
| S63 | [swift.org · Swift 6.3 Released](https://www.swift.org/blog/swift-6.3-released/) | Ídem para 6.3 |
| S62 | [swift.org · Swift 6.2 Released](https://www.swift.org/blog/swift-6.2-released/) | Ídem para 6.2 |
| XCV | [developer.apple.com · Xcode: requisitos y compatibilidad](https://developer.apple.com/support/xcode/) | Versiones de Xcode 26.5 a 27.3 beta: macOS mínimo, SDK, compilador de Swift y destinos de despliegue |
| NOV | [developer.apple.com · Publicaciones](https://developer.apple.com/news/releases/) | Últimas versiones estables y beta de iOS, Xcode, TestFlight y la API de App Store Connect |
| IOS27 | [developer.apple.com · iOS](https://developer.apple.com/ios/) | Versión vigente (iOS 27) y áreas destacadas para desarrolladores |
| AD-SUI | [Documentación de SwiftUI](https://developer.apple.com/documentation/swiftui) | Los grupos de temas (estructura de la app, datos, vistas, layout, eventos, accesibilidad, integración, herramientas) y sus artículos de primer nivel |
| AD-UIK | [Documentación de UIKit](https://developer.apple.com/documentation/uikit) | Grupos de temas (estructura de app, interfaz, interacciones, gráficos, texto) |
| AD-XC | [Documentación de Xcode](https://developer.apple.com/documentation/xcode) | Los 8 grupos y sus 26 artículos; además los subíndices de AD-PERF y AD-DIST |
| AD-PERF | [Xcode · Performance and metrics](https://developer.apple.com/documentation/xcode/performance-and-metrics) | Los 9 grupos (capacidad de respuesta, CPU, memoria y tamaño, gráficos, energía, disco, red, instrumentos propios) |
| AD-DIST | [Xcode · Distribution](https://developer.apple.com/documentation/xcode/distribution) | Grupos de distribución, firma, pruebas y comentarios |
| AD-SD | [Documentación de SwiftData](https://developer.apple.com/documentation/swiftdata) | Grupos: definición del modelo, ciclo de vida, consultas, almacenamiento e historial |
| AD-ST | [Documentación de Swift Testing](https://developer.apple.com/documentation/testing) | Los 6 grupos (esenciales, parametrización, validación, traits, reflexión, adjuntos) |
| AD-AI | [Documentación de App Intents](https://developer.apple.com/documentation/appintents) | Los 8 grupos, incluido el apartado «Siri AI Developer Preview» |
| AD-WK | [Documentación de WidgetKit](https://developer.apple.com/documentation/widgetkit) | Los 6 grupos (widgets, Live Activities, controles, interactividad, accesibilidad, previews) |
| AD-UN | [Documentación de User Notifications](https://developer.apple.com/documentation/usernotifications) | Los grupos de temas (gestión, remotas, peticiones, contenido, disparadores, categorías, respuestas, extensión de servicio) |
| AD-SEC | [Documentación de Security](https://developer.apple.com/documentation/security) | Grupos: autorización y autenticación, datos seguros, código seguro, criptografía |
| AD-FM | [Documentación de Foundation Models](https://developer.apple.com/documentation/foundationmodels) | Grupos de temas y disponibilidad (iOS 26.0) |
| DIS v.n | [Develop in Swift Tutorials](https://developer.apple.com/tutorials/develop-in-swift) | Los 8 volúmenes y 29 capítulos (se citan por volumen) |
| ADT v.n c.n | [Develop apps for Apple platforms](https://developer.apple.com/tutorials/app-dev-training) | Los 4 volúmenes (SwiftUI, UIKit, siguientes pasos, macOS), 22 capítulos y 60 tutoriales |
| VER | `docs/VERSIONES.md` (repositorio) | Versiones fijadas de la academia |

La documentación de Apple se leyó desde el índice de datos que sirve cada página
(`developer.apple.com/tutorials/data/documentation/<framework>.json`), porque la página normal necesita
JavaScript.

### 6.2 Libros de referencia (índices)

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| AS c.n | Eidhof, Begemann y otros, *Advanced Swift* — [índice en objc.io](https://www.objc.io/books/advanced-swift/) (la página lo da actualizado a Swift 5.6) | Los 11 capítulos |
| TSUI c.n | Eidhof y Kugler, *Thinking in SwiftUI* — [índice en objc.io](https://www.objc.io/books/thinking-in-swiftui/) (edición para iOS 17) | Los 6 capítulos |
| BNR-I c.n | *iOS Programming: The Big Nerd Ranch Guide*, 7.ª ed. — [índice en InformIT](https://www.informit.com/store/ios-programming-the-big-nerd-ranch-guide-9780135265536) | Los 25 capítulos (libro basado en UIKit) |
| BNR-S c.n | *Swift Programming: The Big Nerd Ranch Guide*, 3.ª ed. — [índice en InformIT](https://www.informit.com/store/swift-programming-the-big-nerd-ranch-guide-9780135264201) | Los 29 capítulos |
| SBT c.n | *SwiftUI by Tutorials*, v5.0 — [índice en Kodeco](https://www.kodeco.com/books/swiftui-by-tutorials) (Swift 5.8, iOS 16) | Las 6 secciones y 24 capítulos |
| MCS c.n | *Modern Concurrency in Swift*, v2.0 — [índice en Kodeco](https://www.kodeco.com/books/modern-concurrency-in-swift) (Swift 5.8, iOS 16) | Los 11 capítulos |
| PSUI | Hudson, *Pro SwiftUI* — [ficha en Hacking with Swift](https://www.hackingwithswift.com/store/pro-swiftui) | Solo la lista de asuntos de la ficha (el índice completo es un PDF que no se abrió) |

Todos los libros son anteriores a Swift 6: sirven para el alcance y el orden, no para el estado de cada
función, que se toma de la documentación oficial (6.1).

### 6.3 Certificación

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| CERT n | Objetivos del examen «App Development with Swift Associate» (Apple y Certiport), según la transcripción de [PUE](https://www.pue.es/pue-academy/certiport/examenes/objetivos/app-development-swift-associate/es) | Los 5 dominios y sus objetivos (se citan por número). La página no indica versión de Swift ni de Xcode |

### 6.4 Sílabos de universidades y bootcamps

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| CS193p L.n | Universidad de Stanford, [CS193p: Developing Applications for iOS using SwiftUI (primavera de 2025)](https://cs193p.stanford.edu/) | Títulos y temas de las 16 clases. El curso es anterior a iOS 26 |
| 100D d.n / P.n | Paul Hudson, [100 Days of SwiftUI](https://www.hackingwithswift.com/100/swiftui) y su [lista de proyectos](https://www.hackingwithswift.com/books/ios-swiftui) | Estructura de los 100 días (d = día) y temas de los 19 proyectos (P = proyecto) |
| PLZ | Platzi, [Curso de SwiftUI: apps para iOS](https://platzi.com/cursos/swiftui-apps-ios/) (en español) | Las 7 secciones y 36 clases |

### 6.5 Cursos largos de YouTube y plataformas

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| YT-B n | Swiftful Thinking, «SwiftUI Bootcamp (Beginner Level)», 62 vídeos — [listado en Class Central](https://classcentral.com/classroom/youtube-swiftui-bootcamp-beginner-level-98821) | Título de cada vídeo (se citan por número de vídeo) |
| YT-A n | Swiftful Thinking, «SwiftUI Advanced Learning», 34 vídeos — [listado en Class Central](https://classcentral.com/classroom/youtube-swiftui-advanced-learning-advanced-level-295214) | Título de cada vídeo |

La lista de nivel inicial usa API anteriores (`NavigationView`, `ObservableObject`): confirma el orden de
Fundamentos, no las API. No se localizó hoy una lista larga **en español** con temario legible (6.7).

### 6.6 Rutas públicas y entrevistas de nivel sénior

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| RM | [Ruta de iOS de «tech-studies»](https://iagodantasf.github.io/tech-studies/roadmaps/role-based/ios/), que enlaza a roadmap.sh/ios | Los 84 nodos en 12 grupos. Sustituye a roadmap.sh, cuyos nodos no se pudieron leer (6.7); la página no afirma ser copia exacta |
| ENT | GoLinuxCloud, [iOS Developer Interview Questions](https://www.golinuxcloud.com/ios-developer-interview-questions/) | Las preguntas por área y la tabla de enfoque por nivel (júnior, medio, sénior, staff) |
| ENT2 | techinterview.org, [Swift and iOS Interview Questions](https://www.techinterview.org/post/3233460869/swift-ios-interview-questions/) | Las 7 áreas y sus preguntas (ARC, valor y referencia, opcionales, protocolos, concurrencia, Combine, arquitectura SwiftUI) |
| ENT3 | DEV Community, [The Complete Senior iOS Developer Interview Guide 2026, parte 2](https://dev.to/divyesh_vekariya/the-complete-senior-ios-developer-interview-guide-2026-part-2-3628) | Solo las 5 áreas del avance (el resto está tras un enlace externo): interior de Swift y sistema de tipos, casos límite de concurrencia, renderizado de SwiftUI, arquitectura modular y pruebas, problemas reales de memoria |

### 6.7 Fuentes que no se pudieron abrir o llegaron incompletas

| Fuente | Qué pasó | Cómo se cubrió |
|---|---|---|
| [roadmap.sh/ios](https://roadmap.sh/ios) | La página abre, pero su contenido legible no incluye los nodos (se dibujan aparte); el repositorio en GitHub y los puntos de datos del sitio rechazaron la lectura automática | Ruta RM (que enlaza a roadmap.sh) y las guías de entrevista. **Pendiente:** revisar los nodos de roadmap.sh a mano antes de aprobar |
| Páginas normales de la documentación de Apple y de *The Swift Programming Language* | Necesitan JavaScript; el contenido legible llega vacío | Índices de datos de cada página (Apple) y el índice del repositorio del libro (Swift) |
| Guía de migración a Swift 6 (`swift.org/migration`) y portada de documentación de swift.org | Necesitan JavaScript o solo redirigen | Los anuncios de 6.2 a 6.4 y el capítulo de concurrencia del libro. **Pendiente:** leer la guía de migración antes de escribir M22 T6 |
| bignerdranch.com (ficha del libro de iOS) | El sitio no permitió la lectura automática | Índice tomado de InformIT |
| *Pro SwiftUI*, índice completo | Es un PDF enlazado que no se abrió | Lista de asuntos de la ficha del libro |
| *Advanced Swift* y *Thinking in SwiftUI* | La página solo lista capítulos, sin secciones, y da ediciones de 2022 y 2023 | Se citan por capítulo |
| Guía de entrevista sénior de DEV Community | Solo el avance; el cuerpo está en otro sitio de pago | Las 5 áreas del avance (ENT3) más ENT y ENT2 |
| Página oficial de Certiport de la certificación de Swift | No se abrió directamente (los resultados eran PDF de terceros y páginas espejo) | Transcripción de objetivos de PUE. **Pendiente:** contrastar con Certiport |
| Lista larga de YouTube en español | La búsqueda devolvió un artículo de 2015 con canales sin temario legible y cursos de Platzi | Se usó Platzi (PLZ) como fuente en español. **Pendiente:** que el dueño indique un canal en español de referencia si lo tiene |
| Hacking with Swift, portada de 100 Days | No nombra los proyectos ni detalla los días 16–100 | Lista de proyectos del libro en línea del mismo autor |
| Lectura por resumen automático | Todas las páginas se leyeron a través de una herramienta que resume; los números de propuesta (SE-, ST-) y los recuentos pueden tener errores de transcripción | Sección 1.4, regla 5: se comprueban en la fuente al escribir cada tema |

## Anexo A · Destino de los 69 temas actuales

Numeración de la columna «Tema actual»: la de hoy. Numeración de «iOS objetivo»: la de la sección 2.

| Tema actual | Título | Nivel hoy | Palabras | Destino |
|---|---|---|---:|---|
| M0 T1 | Optionals y unwrapping seguro | Básico | 1193 | iOS objetivo: M3 T3, M10 T1 |
| M0 T2 | struct vs class | Básico | 1110 | iOS objetivo: M4 T1, M4 T4, M4 T5 |
| M0 T3 | Protocolos y enums con valores asociados | Básico | 1013 | iOS objetivo: M4 T3, M5 T1, M10 T2, M11 T1 |
| M0 T4 | Closures, colecciones y genéricos con propósito | Intermedio | 1289 | iOS objetivo: M2 T4, M3 T1, M3 T2, M3 T4, M5 T4, M11 T4 |
| M0 T5 | Ownership en Swift: borrowing, consuming y tipos ~Copyable | Experto | 1922 | iOS objetivo: M41 T1 |
| M1 T1 | El protocolo View y composición | Básico | 1426 | iOS objetivo: M6 T2, M6 T6 |
| M1 T2 | Orden de modificadores y layout con stacks | Básico | 1212 | iOS objetivo: M6 T4, M7 T1 |
| M1 T3 | Previews, LazyVGrid/ScrollView y property wrappers | Intermedio | 1414 | iOS objetivo: M6 T7, M7 T4, M10 T6 |
| M2 T1 | @State y @Binding | Básico | 1139 | iOS objetivo: M8 T1, M8 T2 |
| M2 T2 | @Observable | Intermedio | 903 | iOS objetivo: M14 T1 |
| M2 T3 | @Environment y identidad vs valor | Intermedio | 1342 | iOS objetivo: M14 T3, M14 T4 |
| M3 T1 | NavigationStack y NavigationPath | Básico | 829 | iOS objetivo: M9 T1, M16 T1 |
| M3 T2 | Sheets, full screen covers y TabView | Básico | 960 | iOS objetivo: M9 T2, M9 T3, M16 T6 |
| M3 T3 | Deep linking y controles de formulario | Intermedio | 1240 | iOS objetivo: M8 T3, M8 T4, M8 T5, M16 T4 |
| M4 T1 | async/await y Task | Intermedio | 888 | iOS objetivo: M13 T2, M13 T3 |
| M4 T2 | Actors para estado mutable seguro | Avanzado | 812 | iOS objetivo: M22 T1 |
| M4 T3 | TaskGroup y MainActor | Avanzado | 1328 | iOS objetivo: M13 T4, M13 T5, M22 T2, M22 T7 |
| M4 T4 | Cancelación cooperativa: distinguir una tarea cancelada de un fallo de red | Avanzado | 469 | iOS objetivo: M13 T6 |
| M4 T5 | AsyncSequence y AsyncStream: recibir valores en el tiempo con for await | Avanzado | 954 | iOS objetivo: M13 T7, M23 T1, M23 T2 |
| M4 T6 | Swift 6: aislamiento, Sendable y data races detectadas al compilar | Experto | 1126 | iOS objetivo: M22 T3, M22 T4 |
| M5 T1 | URLSession con async/await y Codable | Intermedio | 1071 | iOS objetivo: M5 T3, M17 T1, M17 T2 |
| M5 T2 | Errores tipados | Intermedio | 853 | iOS objetivo: M2 T5, M10 T4, M17 T3 |
| M5 T3 | Reintentos y cancelación | Avanzado | 1296 | iOS objetivo: M30 T1 |
| M6 T1 | @Model y ModelContainer | Básico | 740 | iOS objetivo: M18 T2, M29 T5 |
| M6 T2 | @Query y operaciones de escritura | Intermedio | 777 | iOS objetivo: M18 T3 |
| M6 T3 | Migraciones y SwiftData vs Core Data | Intermedio | 969 | iOS objetivo: M29 T1, M29 T5, M29 T6 |
| M6 T4 | Archivos en iOS: FileManager, carpetas de la app y fileImporter | Intermedio | 1003 | iOS objetivo: M18 T6 |
| M6 T5 | CloudKit con SwiftData: sincronizar datos entre los dispositivos del usuario | Avanzado | 1270 | iOS objetivo: M29 T7 |
| M7 T1 | Publishers y Subscribers | Intermedio | 727 | iOS objetivo: M24 T2 |
| M7 T2 | Operadores: debounce y combineLatest | Intermedio | 795 | iOS objetivo: M24 T2 |
| M7 T3 | Combine vs async/await | Avanzado | 1250 | iOS objetivo: M24 T4 |
| M8 T1 | De una vista "gorda" a MVVM | Intermedio | 888 | iOS objetivo: M20 T2 |
| M8 T2 | Capas del proyecto e inyección por inicializador | Intermedio | 770 | iOS objetivo: M20 T3 |
| M8 T3 | Cuándo MVVM no alcanza | Avanzado | 1193 | iOS objetivo: M20 T6 |
| M9 T1 | XCTest clásico y Swift Testing | Intermedio | 957 | iOS objetivo: M19 T1, M19 T3 |
| M9 T2 | Testing de código async | Avanzado | 886 | iOS objetivo: M19 T5 |
| M9 T3 | UI Tests con XCUITest | Avanzado | 1344 | iOS objetivo: M32 T1 |
| M10 T1 | Instruments | Intermedio | 795 | iOS objetivo: M12 T5, M44 T2, M44 T4 |
| M10 T2 | Accesibilidad con VoiceOver | Intermedio | 761 | iOS objetivo: M33 T1 |
| M10 T3 | Human Interface Guidelines, Dynamic Type e interop con UIKit | Intermedio | 908 | iOS objetivo: M9 T7, M28 T6, M33 T2 |
| M10 T4 | Localización con String Catalogs: textos, plurales y formatos por idioma | Intermedio | 917 | iOS objetivo: M33 T5, M33 T6 |
| M10 T5 | UIKit desde cero para mantener aplicaciones reales | Avanzado | 1610 | iOS objetivo: M12 T2, M27 T2, M27 T3, M27 T4, M28 T2 |
| M11 T1 | Certificados y provisioning profiles | Intermedio | 979 | iOS objetivo: M38 T2 |
| M11 T2 | Archivar, subir y TestFlight | Intermedio | 979 | iOS objetivo: M38 T3, M38 T4 |
| M11 T3 | Metadata y versionado | Intermedio | 1223 | iOS objetivo: M38 T5 |
| M12 T1 | Arquitectura del proyecto integrador | Avanzado | 954 | iOS objetivo: M46 T7 |
| M12 T2 | Sincronización entre red y persistencia local | Avanzado | 1252 | iOS objetivo: M31 T1 |
| M12 T3 | Swift Package Manager: separar la app en paquetes locales y declarar dependencias | Avanzado | 916 | iOS objetivo: M21 T5, M37 T1 |
| M12 T4 | Cierre del track | Experto | 1223 | iOS objetivo: M50 T7 |
| M13 T1 | El sandbox reduce superficie, pero no valida intenciones | Intermedio | 964 | iOS objetivo: M16 T4, M36 T1 |
| M13 T2 | Proteger datos es controlar todas sus copias | Intermedio | 1002 | iOS objetivo: M36 T2 |
| M13 T3 | Keychain — guardar secretos de forma segura | Intermedio | 660 | iOS objetivo: M36 T3 |
| M13 T4 | Permisos y privacidad — pedir acceso con criterio | Intermedio | 681 | iOS objetivo: M34 T1 |
| M13 T5 | Face ID y Touch ID con LocalAuthentication: confirmar acciones sensibles | Intermedio | 999 | iOS objetivo: M36 T4 |
| M13 T6 | Notificaciones push con APNs | Avanzado | 693 | iOS objetivo: M34 T3 |
| M13 T7 | Offline-first es un protocolo, no una caché | Avanzado | 1049 | iOS objetivo: M31 T2 |
| M13 T8 | Operar significa detectar, limitar y aprender del fallo | Avanzado | 1042 | iOS objetivo: M44 T7, M45 T1, M45 T5 |
| M13 T9 | Core Location moderno: CLLocationUpdate, permisos y precisión | Avanzado | 1040 | iOS objetivo: M34 T5 |
| M13 T10 | BackgroundTasks: actualizar datos y sincronizar cuando el sistema lo permite | Avanzado | 1540 | iOS objetivo: M31 T5 |
| M14 T1 | Animaciones y matchedGeometryEffect | Intermedio | 744 | iOS objetivo: M25 T1, M25 T3 |
| M14 T2 | Gestos en SwiftUI: arrastrar, mantener presionado y combinar gestos | Intermedio | 943 | iOS objetivo: M25 T6, M33 T3 |
| M14 T3 | Swift Testing y pruebas asíncronas | Intermedio | 1037 | iOS objetivo: M13 T7, M19 T1, M19 T5 |
| M14 T4 | ViewInspector con criterio | Intermedio | 946 | iOS objetivo: M32 T2 |
| M14 T5 | Combine avanzado | Avanzado | 720 | iOS objetivo: M24 T3 |
| M14 T6 | UIViewRepresentable | Avanzado | 645 | iOS objetivo: M28 T4 |
| M14 T7 | UIViewControllerRepresentable y Coordinator | Avanzado | 611 | iOS objetivo: M28 T5 |
| M14 T8 | Core ML y Vision — inferencia en el dispositivo | Avanzado | 1145 | iOS objetivo: M49 T1 |
| M14 T9 | WidgetKit: un widget con las entregas pendientes del día | Avanzado | 1038 | iOS objetivo: M35 T1, M35 T2 |
| M14 T10 | App Intents: acciones de la app en Siri, Atajos y Spotlight | Avanzado | 1115 | iOS objetivo: M35 T5, M35 T6 |
