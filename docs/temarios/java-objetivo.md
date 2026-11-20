# Temario objetivo · Java (JDK 25), de cero a experto

> **Aprobado por el dueño el 2026-11-20** (versión extendida). Decisiones: JPA/Hibernate pasa a Spring; los temas de Gradle pasan al curso de Gradle; Maven queda en dos temas.

**Estado:** propuesta para aprobación del dueño (specs/021, Fase 3, criterio Z2). No hay lecciones escritas ni
cambiadas: este documento solo fija qué temas tendrá el curso, en qué orden y de dónde sale cada uno.
**Fecha de revisión de fuentes:** 2026-11-20.
**Versión de referencia:** JDK 25 (LTS; disponibilidad general el 2025-09-16, según la página del proyecto
JDK 25). `docs/VERSIONES.md` es la fuente de las versiones de la academia.
**Identificador de ruta:** `java` (se conserva, y con él el progreso de lectura).

## 1. Resumen

### 1.1 El curso hoy

El listado medido (`docs/reestructuracion/listado-de-temas.csv`, filas `java`) tiene **120 temas en 23
módulos** (M0–M22). La spec 021 cita 134 temas de Java en su diagnóstico; el CSV de este árbol contiene 120, y
ese es el número que se usa aquí.

| Nivel declarado hoy | Temas | % |
|---|---:|---:|
| Básico | 15 | 12 % |
| Intermedio | 64 | 53 % |
| Avanzado | 37 | 31 % |
| Experto | 2 | 2 % |
| Sin nivel | 2 | 2 % |

Hoy el 32 % de los temas está en Avanzado o Experto (39 de 120), por debajo de la
mitad que exige la regla 4 de la spec. De los 120 temas, 17 salen hacia otros cursos o hacia el proyecto final
(sección 3) y 103 alimentan el temario objetivo.

### 1.2 El curso objetivo

**279 temas en 44 módulos** (de 3 a 7 temas cada uno), en los cuatro tramos del formato único.

| Tramo (nivel) | Módulos | Temas | Ya está | Está pero básico | Falta |
|---|---|---:|---:|---:|---:|
| Fundamentos (Básico) | M0–M8 | 57 | 11 | 27 | 19 |
| Aplicación (Intermedio) | M9–M20 | 77 | 20 | 37 | 20 |
| Integración (Avanzado) | M21–M32 | 76 | 13 | 15 | 48 |
| Experto (Experto) | M33–M43 | 69 | 2 | 13 | 54 |
| **Total** | M0–M43 | **279** | **46** | **92** | **141** |

- **Integración + Experto: 145 de 279 temas (52 %)**. Cumple la regla «al menos la mitad».
- **Faltan 141 temas** (51 %): no existen hoy en el curso.
- **92 temas están pero son básicos** (33 %): existen, y cada fila dice qué les falta para llegar al
  nivel maestro.
- **46 temas ya están** (16 %) con la profundidad suficiente. También pasan al formato de 12 secciones en la
  Fase 5, como todos.
- Duración estimada: 279 temas a 40 min de media ≈ 186 h, más unas 20 h de proyecto final. Es una
  estimación; los minutos reales se fijan tema a tema (20–45 min) al escribirlos.

### 1.3 Cómo se decidió el estado de cada tema

- **ya está**: hay un tema actual dedicado al asunto, con unas 900 palabras o más y con la explicación de cómo
  funciona por dentro.
- **está pero básico**: el asunto aparece, pero en un tema corto (menos de unas 900 palabras según el CSV),
  compartido con otros asuntos, o sin la parte interna, el error real o la medición. La fila dice qué falta.
- **falta**: ningún tema actual lo trata.

**Límite de esta clasificación:** se hizo con el título, el nivel y el número de palabras de cada tema en el CSV
y con los encabezados de los módulos, no leyendo las 120 lecciones línea a línea. La columna «qué falta» es la
lista de lo que el tema objetivo exige; al reescribir cada tema (Fase 5) se comprueba contra la lección real y lo
que ya esté se conserva.

Entre paréntesis va el tema actual de origen con la numeración de hoy (por ejemplo, «M5 T3» es el tema 3 del
módulo 5 actual). Un tema actual puede alimentar a más de un tema objetivo cuando se parte, y varios temas
actuales cortos pueden fusionarse en uno. El anexo A da el destino de los 120 temas actuales, uno por uno.

### 1.4 Rigor de versiones (JDK 25)

Estado de cada función tomado de la lista oficial «JEPs in JDK 25 integrated since JDK 21» y del anuncio de
disponibilidad general (18 JEP en JDK 25):

| Estado en JDK 25 | JEP |
|---|---|
| **Definitivas en JDK 25** | 503 Remove the 32-bit x86 Port · 506 Scoped Values · 510 Key Derivation Function API · 511 Module Import Declarations · 512 Compact Source Files and Instance Main Methods · 513 Flexible Constructor Bodies · 514 Ahead-of-Time Command-Line Ergonomics · 515 Ahead-of-Time Method Profiling · 518 JFR Cooperative Sampling · 519 Compact Object Headers · 520 JFR Method Timing & Tracing · 521 Generational Shenandoah |
| **Preview** (requieren `--enable-preview`) | 470 PEM Encodings of Cryptographic Objects (Preview) · 502 Stable Values (Preview) · 505 Structured Concurrency (Fifth Preview) · 507 Primitive Types in Patterns, instanceof, and switch (Third Preview) |
| **Incubación** | 508 Vector API (Tenth Incubator) |
| **Experimental** | 509 JFR CPU-Time Profiling (Experimental) |
| Definitivas entre JDK 22 y 24 que usa el temario | JDK 22: 423 Region Pinning for G1 · 454 Foreign Function & Memory API · 456 Unnamed Variables & Patterns · 458 Launch Multi-File Source-Code Programs. JDK 23: 467 Markdown Documentation Comments · 471 Deprecate the Memory-Access Methods in sun.misc.Unsafe for Removal · 474 ZGC: Generational Mode by Default. JDK 24: 472 Prepare to Restrict the Use of JNI · 475 Late Barrier Expansion for G1 · 483 Ahead-of-Time Class Loading & Linking · 484 Class-File API · 485 Stream Gatherers · 486 Permanently Disable the Security Manager · 490 ZGC: Remove the Non-Generational Mode · 491 Synchronize Virtual Threads without Pinning · 493 Linking Run-Time Images without JMODs · 496 y 497 ML-KEM y ML-DSA · 498 Warn upon Use of Memory-Access Methods in sun.misc.Unsafe |

Reglas que se proponen para el curso:

1. Todo tema sobre una función en preview, incubación o experimental lo dice en el título y en un aviso, y su
   laboratorio activa la opción correspondiente en el `build.gradle.kts`. En este temario son **7 temas**: M10 T6
   (JEP 507), M24 T6 (JEP 505), M30 T3 (JEP 470, solo la parte de PEM), M32 T2 (JEP 502, solo la parte de
   Stable Values), M37 T7 (JEP 508), M39 T4 (JEP 509, solo la parte de CPU) y M43 T3 (resumen).
2. Las funciones entregadas en JDK 21 o antes (hilos virtuales, colecciones secuenciadas, patrones de record,
   `switch` con patrones, records, tipos sellados, bloques de texto, UTF-8 por defecto, KEM, `jwebserver`, etc.)
   se citan en la tabla por su versión de JDK. **Sus números de JEP no se reabrieron en esta revisión**: se
   comprueban en openjdk.org al escribir cada tema (regla 9 de la spec).
3. Los detalles marcados para comprobar en el Mac antes de escribir: que Compact Object Headers (JEP 519) sigue
   sin estar activado por defecto en JDK 25 y que el perfil por tiempo de CPU de JFR (JEP 509) solo existe en
   Linux. Son datos que este documento no verificó ejecutando.
4. Las herramientas de terceros que aparecen (JUnit, Mockito, AssertJ, jqwik, JaCoCo, JMH, JOL, jcstress,
   async-profiler, JITWatch, Eclipse MAT, HikariCP, Jackson, Logback, `jextract`) no tienen versión en este
   documento: se fijan en `docs/VERSIONES.md` y en el catálogo de versiones de Gradle antes de escribir su módulo.

## 2. Temario objetivo completo

Orden lineal: los módulos se estudian en el orden M0 → M43 y el nivel no baja. Las abreviaturas de la
columna «Fuentes» están en la sección 6. Las secciones de la JLS y la JVMS se citan al nivel que muestra su
índice (capítulo o sección de dos cifras).


### Tramo 1 · Fundamentos (nivel Básico) — 57 temas

#### M0 · Plataforma, herramientas y primer programa (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es Java hoy: lenguaje, JVM, JDK, distribuciones de OpenJDK y calendario de versiones (LTS y entregas semestrales) | Básico | **está pero básico** (M0 T2): 519 palabras; faltan distribuciones, calendario de entregas, qué significa LTS y cómo leer `java -version` | DJ·CJ1 c1·OCNJ c3·ENT·YT-EN |
| 2 | Instalar JDK 25 y convivir con varias versiones: `JAVA_HOME`, `PATH`, SDKMAN y toolchains | Básico | **falta** | DJ·CJ1 c2·YT-EN·MAN |
| 3 | Del fuente al bytecode: `javac`, `java`, classpath y primera lectura con `javap` | Básico | **ya está** (M0 T1) | DJ·JLS §12.1·JVMS §2.1·CJ1 c2·MAN·YT-EN |
| 4 | Anatomía de `main`: de `public static void main` al `main` de instancia y los archivos fuente compactos (JEP 512, JDK 25) | Básico | **ya está** (M0 T3, M0 T9) | JEP 512·JLS §12.1·DJ·CJ1 c3 |
| 5 | JShell y el lanzador de código fuente: un archivo y varios archivos (JEP 458, JDK 22) | Básico | **está pero básico** (M0 T9): solo cubre el lanzador de un archivo; faltan JShell, el modo multiarchivo y sus límites | DJ·JEP 458·CJ1 c2·MAN |
| 6 | El IDE y el depurador: puntos de parada, inspección de variables y paso a paso | Básico | **falta** | DJ·CJ1 c7·MIT·YT-EN·YT-ES |
| 7 | Primer build con el wrapper de Gradle: ejecutar, probar y empaquetar (solo uso; el porqué vive en el curso de Gradle) | Básico | **está pero básico** (M8 T1): hoy compara Maven y Gradle; aquí queda solo el uso mínimo del wrapper y el resto se va a Gradle | RM·VER |

#### M1 · Datos: tipos, variables y operadores (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Primitivos: rangos, literales, desbordamiento silencioso, `Math.*Exact` y `char` como unidad UTF-16 | Básico | **está pero básico** (M0 T4, M0 T5): no se enseña el desbordamiento ni los métodos exactos, ni `char` como UTF-16 | JLS §4.2·OCP 1·CJ1 c3·YT-EN·MOOC p1 |
| 2 | Valores frente a referencias: pila, heap, alias y `null` dibujados | Básico | **ya está** (M0 T4) | JLS §4.3·JVMS §2.5·CJ1 c4·ENT·61B·YT-EN |
| 3 | Variables, ámbito, `final`, `var` y asignación definitiva | Básico | **está pero básico** (M0 T5): 527 palabras; faltan `var` con sus límites, sombreado y la regla de asignación definitiva | JLS §4.12, §6.3–6.4, c16·OCP 3·EJ 57·CJ1 c3 |
| 4 | Conversiones: ensanchamiento, estrechamiento, casting y promoción numérica | Básico | **está pero básico** (M0 T5): se menciona sin las reglas de promoción ni la pérdida de precisión demostrada | JLS c5·OCP 1·CJ1 c3 |
| 5 | Operadores, precedencia, orden de evaluación y cortocircuito | Básico | **está pero básico** (M0 T6): mezclado con control de flujo; faltan orden de evaluación, operadores de bits y asignación compuesta con casting implícito | JLS §15.7, §15.17–15.26·OCP 1·CJ1 c3·ENT·YT-EN |
| 6 | Punto flotante IEEE 754: por qué 0.1 + 0.2 no es 0.3, `NaN`, infinitos y comparación | Básico | **falta** | JLS §4.2, §15.4·JVMS §2.8·EJ 60·CJ1 c3 |
| 7 | `Math`, números aleatorios con `RandomGenerator` y primer contacto con `BigInteger`/`BigDecimal` | Básico | **falta** | API java.util.random, java.math·CJ1 c3·OCP 1·MOOC p12·JP c12 |

#### M2 · Texto y entrada/salida de consola (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `String`: inmutabilidad, pool de literales y `==` frente a `equals` | Básico | **está pero básico** (M0 T5): un apartado corto; faltan el pool, `intern` y el error clásico de comparar con `==` diagnosticado | JLS §3.10·CJ1 c3·OCP 1·ENT·YT-EN |
| 2 | API moderna de `String`: `strip`, `isBlank`, `repeat`, `lines`, `formatted` y bloques de texto | Básico | **falta** | API java.lang·OCP 1·CJ1 c3·JLS §3.10 |
| 3 | `StringBuilder` y el coste real de concatenar | Básico | **falta** | OCP 1·EJ 63·JP c12·ENT·CJ1 c3 |
| 4 | Unicode de verdad: code points, pares sustitutos, normalización y charsets (UTF-8 por defecto desde JDK 18) | Básico | **falta** | JLS §3.1–3.3·API java.nio.charset, java.text·CJ2 c7 |
| 5 | Formato de salida: `printf`, `String.format` y `Formatter` | Básico | **falta** | CJ1 c3·API java.util·YT-EN |
| 6 | Entrada por consola: `IO` (JDK 25), `Scanner`, `Console` y argumentos del programa | Básico | **está pero básico** (M0 T8, M0 T9): `IO` ya está; faltan `Scanner` con sus trampas de salto de línea, `Console` y los argumentos | JEP 512·CJ1 c3·OCP 9·MOOC p1·YT-EN |

#### M3 · Control de flujo y métodos (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `if`, operador ternario y condiciones legibles | Básico | **está pero básico** (M0 T6): un apartado dentro de un tema de 900 palabras; faltan errores típicos y criterio de legibilidad | JLS §14.9, §15.25·OCP 2·MOOC p1·YT-EN |
| 2 | `switch`: sentencia y expresión, flecha, `yield`, exhaustividad y caída entre casos | Básico | **está pero básico** (M0 T6): solo la forma clásica; faltan la expresión, `yield` y la exhaustividad | JLS §14.11, §15.28·OCP 2·CJ1 c3·YT-EN |
| 3 | Bucles `for`, `while`, `do`, for-each, `break`, `continue` y etiquetas | Básico | **está pero básico** (M0 T6): faltan etiquetas, bucles anidados medidos y errores de uno de más | JLS §14.12–14.16·OCP 2·EJ 58·MOOC p1·YT-EN |
| 4 | Métodos: parámetros, retorno, paso por valor, sobrecarga y varargs | Básico | **está pero básico** (M0 T7, M1 T4): el paso de argumentos está; faltan la resolución de sobrecarga y varargs | JLS §8.4, §15.12·OCP 3·EJ 52–53·CJ1 c4·YT-EN |
| 5 | Recursión y la pila de llamadas: leer un `StackOverflowError` | Básico | **falta** | JVMS §2.5–2.6·MIT·61B |
| 6 | Leer una traza de error y depurar un programa pequeño con método | Básico | **falta** | CJ1 c7·MIT·RM |

#### M4 · Arreglos y primeras colecciones (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Arreglos: creación, valores por defecto, recorrido y `ArrayIndexOutOfBoundsException` | Básico | **está pero básico** (M0 T7): 535 palabras compartidas con wrappers; faltan valores por defecto, memoria dibujada y el error diagnosticado | JLS c10·OCP 5·CJ1 c3·YT-EN·ENT |
| 2 | Arreglos multidimensionales y la clase `Arrays`: ordenar, copiar, comparar y buscar | Básico | **falta** | JLS §10.3·CJ1 c3·MOOC p12·OCP 5 |
| 3 | Covarianza de arreglos y `ArrayStoreException`: por qué las listas son más seguras | Básico | **falta** | JLS §10.5·EJ 28 |
| 4 | `ArrayList` y `HashMap`: primer uso | Básico | **está pero básico** (M2 T1): hoy entra directamente a todas las implementaciones; falta un primer contacto guiado | CJ1 c5·MOOC p8·OCP 5·YT-EN·61B |
| 5 | Wrappers y autoboxing: caché de `Integer`, `==` y el `NullPointerException` al desempaquetar | Básico | **está pero básico** (M0 T7): se nombra; faltan las tres trampas reproducidas | JLS §5.1·EJ 61·CJ1 c5·ENT |
| 6 | Algoritmos a mano y coste: búsqueda lineal y binaria, ordenación y notación O | Básico | **falta** | 61B·MOOC p12·RM |

#### M5 · Objetos y clases (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Clases, objetos, campos, métodos y `this` | Básico | **ya está** (M1 T1) | JLS §8.1–8.4·CJ1 c4·OCP 3·MOOC p9·YT-EN·YT-ES |
| 2 | Constructores, encadenamiento con `this(...)`, bloques de inicialización y orden exacto de inicialización | Básico | **está pero básico** (M1 T1): faltan los bloques de instancia y estáticos y el orden completo trazado | JLS §8.6–8.8, §12.5·OCP 3·CJ1 c4 |
| 3 | Encapsulación y modificadores de acceso | Básico | **está pero básico** (M1 T4): comparte tema con sobrecarga; faltan acceso de paquete, `protected` real y criterio (minimizar accesibilidad) | JLS §6.6·EJ 15–16·OCP 3·ENT·YT-ES |
| 4 | `static`: campos, métodos, constantes e inicialización de clase | Básico | **falta** | JLS §8.3, §8.7, §12.4·CJ1 c4·ENT·YT-ES |
| 5 | Paquetes, `import`, `import static`, `import module` (JEP 511, JDK 25) y convenciones de nombres | Básico | **está pero básico** (M0 T9): `import module` está; faltan paquetes, importaciones estáticas y nombres | JLS c7·JEP 511·EJ 68·CJ1 c4·YT-EN |
| 6 | Los métodos de `Object`: `toString`, `equals` y `hashCode`, primer contacto | Básico | **ya está** (M2 T2): se parte: aquí el uso; el contrato completo va a Aplicación | JLS §4.3·EJ 10–12·CJ1 c5·MOOC p8·61B |
| 7 | Objetos inmutables y `record`: primer contacto | Básico | **está pero básico** (M1 T5): 554 palabras; falta contrastar con la clase equivalente y mirar con `javap` lo que genera | JLS §8.10·OCP 3·EJ 17·CJ1 c4·ENT |

#### M6 · Herencia, interfaces y polimorfismo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Herencia, `super`, sobreescritura y `@Override` | Básico | **ya está** (M1 T2) | JLS §8.1, §8.4·OCP 3·EJ 40·CJ1 c5·MOOC p9·YT-ES |
| 2 | Polimorfismo y despacho dinámico; casting e `instanceof` con patrón | Básico | **está pero básico** (M1 T2, M7 T2): falta el despacho mostrado en bytecode (`invokevirtual`) y el `ClassCastException` diagnosticado | JLS §15.12, §15.20·JVMS §6.5·OCP 3·MOOC p9·61B |
| 3 | Clases abstractas | Básico | **está pero básico** (M1 T3): 869 palabras junto con interfaces; falta el patrón plantilla como caso real | JLS §8.1·CJ1 c5·OCP 3·YT-ES·PLZ |
| 4 | Interfaces: métodos abstractos, `default`, `static` y `private` | Básico | **está pero básico** (M1 T3): faltan los métodos `private` y `static` de interfaz y la regla de resolución | JLS c9·OCP 3·EJ 20–22·CJ1 c6·PLZ |
| 5 | Sobrecarga frente a sobreescritura: qué se decide al compilar y qué al ejecutar | Básico | **está pero básico** (M1 T4): falta el caso trampa de sobrecarga con tipos estáticos | JLS §15.12·EJ 52·ENT |
| 6 | Composición frente a herencia, `final` y diseñar para heredar o prohibirlo | Básico | **falta** | EJ 18–19·CJ1 c5·MIT |
| 7 | Enums: constantes, campos, métodos y `switch` | Básico | **ya está** (M22 T2): primera mitad; la segunda va a Aplicación | JLS §8.9·OCP 3·EJ 34–35·CJ1 c5·YT-ES |

#### M7 · Excepciones (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Jerarquía de `Throwable`: comprobadas, no comprobadas y `Error` | Básico | **ya está** (M3 T1) | JLS §11.1–11.2·OCP 4·EJ 70–71·CJ1 c7·ENT·YT-ES |
| 2 | `try`/`catch`/`finally`, multi-catch y el flujo real (qué ocurre con `return` en `finally`) | Básico | **está pero básico** (M3 T1): falta el flujo exacto, visto también en bytecode | JLS §14.20·JVMS §3.12–3.13·OCP 4·CJ1 c7 |
| 3 | `try`-with-resources, `AutoCloseable` y excepciones suprimidas | Básico | **ya está** (M3 T2) | JLS §14.20·EJ 9·OCP 4·ENT·PLZ |
| 4 | Excepciones propias, causa encadenada y traducción entre capas | Básico | **ya está** (M3 T3) | EJ 72–77·CJ1 c7·OCP 4·YT-ES |
| 5 | Leer trazas: `Caused by`, marcos, NPE descriptivas y mensajes que ayudan | Básico | **falta** | EJ 75·CJ1 c7·RM |
| 6 | Validar pronto: `Objects.requireNonNull`, precondiciones y atomicidad ante fallos | Básico | **falta** | EJ 49, 76·MIT·API java.util |

#### M8 · Fechas, dinero y documentación (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `java.time`: `LocalDate`, `LocalTime`, `LocalDateTime`, `Period` y `Duration` | Básico | **está pero básico** (M0 T8): 534 palabras para todo el paquete; faltan aritmética de fechas, ajustadores e inmutabilidad | API java.time·OCP 1·CJ2 c6·MJiA c12·DJ |
| 2 | Zonas horarias: `Instant`, `ZonedDateTime`, `OffsetDateTime` y horario de verano | Básico | **falta** | API java.time.zone·OCP 1·CJ2 c6·MJiA c12 |
| 3 | Formato y parseo con `DateTimeFormatter`; convivir con `Date` y `Calendar` heredados | Básico | **está pero básico** (M0 T8): explica por qué evitarlas; falta la conversión en ambos sentidos y el formateo por `Locale` | API java.time.format·CJ2 c6·OCP 10 |
| 4 | Dinero exacto con `BigDecimal`: escala, redondeo y `MathContext` | Básico | **ya está** (M19 T3) | EJ 60·CJ1 c3·API java.math |
| 5 | Javadoc: comentarios de documentación, etiquetas y Markdown con `///` (JEP 467, JDK 23) | Básico | **falta** | JEP 467·EJ 56·CJ1 c4·PLZ·MAN |


### Tramo 2 · Aplicación (nivel Intermedio) — 77 temas

#### M9 · Diseño de clases a fondo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El contrato completo de `equals`, `hashCode` y `compareTo`, y cómo se rompe | Intermedio | **ya está** (M2 T2) | EJ 10–14·JLS §4.3·MIT·ENT·OCP 3 |
| 2 | Records a fondo: constructor canónico y compacto, invariantes, records locales y límites | Intermedio | **está pero básico** (M1 T5): faltan el constructor compacto, la copia defensiva de componentes, records locales y la serialización de records | JLS §8.10·OCP 3·CJ1 c4·ENT |
| 3 | Constructores flexibles: validar y preparar antes de `super(...)` (JEP 513, JDK 25) | Intermedio | **ya está** (M1 T6) | JEP 513·JLS §8.8 |
| 4 | Copia defensiva, copia superficial y `clone` | Intermedio | **ya está** (M22 T1) | EJ 13, 50·MIT |
| 5 | Clases anidadas, internas, locales y anónimas; `this$0` y la referencia retenida | Intermedio | **ya está** (M22 T3) | JLS §8.1, §14.3, §15.9·EJ 24·OCP 3·CJ1 c6·PLZ |
| 6 | Fábricas estáticas, builders y minimizar la mutabilidad | Intermedio | **está pero básico** (M12 T1): solo Builder; faltan fábricas estáticas con nombre y el coste de la mutabilidad | EJ 1–2, 17·MIT |
| 7 | Enums avanzados: comportamiento por constante, `EnumSet`, `EnumMap`, singleton y extensión con interfaces | Intermedio | **está pero básico** (M22 T2): faltan `EnumSet`/`EnumMap`, el singleton con enum y la extensión mediante interfaces | EJ 3, 34–38·JLS §8.9·CJ1 c5 |

#### M10 · Tipos sellados, patrones y programación orientada a datos (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `sealed` y `permits`: jerarquías cerradas | Intermedio | **está pero básico** (M7 T1): 534 palabras; faltan las reglas de `permits`, `non-sealed` y la reflexión sobre subclases permitidas | JLS §8.1, §9.1·OCP 3·CJ1 c5·ENT |
| 2 | Pattern matching en `instanceof` y `switch`: patrones de tipo, guardas `when`, dominancia y `null` | Intermedio | **está pero básico** (M7 T2): 515 palabras; faltan dominancia, `null` en `switch` y lo que genera el compilador (`invokedynamic` a `SwitchBootstraps`) | JLS §14.11, §14.30, §15.28·OCP 3·CJ1 c5·ENT |
| 3 | Patrones de record y desestructuración anidada | Intermedio | **falta** | JLS §14.30·OCP 3·DJ·CJ1 c5 |
| 4 | Variables y patrones sin nombre con `_` (JEP 456, JDK 22) | Intermedio | **ya está** (M7 T3) | JEP 456·JLS §14.30 |
| 5 | Tipos algebraicos y programación orientada a datos: modelar el dominio sin herencia de comportamiento | Intermedio | **falta** | DJ·JLS §8.10, §8.1·ENT |
| 6 | Tipos primitivos en patrones, `instanceof` y `switch` (JEP 507, **tercera preview** en JDK 25) | Intermedio | **falta** | JEP 507 |

#### M11 · Genéricos (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Clases y métodos genéricos; tipos acotados | Intermedio | **está pero básico** (M2 T4): un único tema para todos los genéricos; falta práctica graduada y cotas múltiples | JLS §4.4–4.5, §8.1, §8.4·CJ1 c8·EJ 29–30·MOOC p12·YT-ES |
| 2 | Varianza: comodines `? extends`, `? super` y la regla PECS | Intermedio | **está pero básico** (M2 T4): se explica en pocas líneas; falta el porqué con el fallo de compilación y `Collections.copy` como caso | JLS §4.5, §4.10·EJ 31·CJ1 c8·ENT |
| 3 | Borrado de tipos, tipos reificables, métodos puente y contaminación del heap | Intermedio | **ya está** (M21 T4, M2 T4) | JLS §4.6–4.8·CJ1 c8·ENT·JVMS §4.7 |
| 4 | Límites: arreglos genéricos, varargs con `@SafeVarargs` y tipos crudos | Intermedio | **falta** | EJ 26–28, 32·JLS §4.8, §9.6·CJ1 c8 |
| 5 | Inferencia de tipos: diamante, `var`, tipado por destino y tipos intersección | Intermedio | **falta** | JLS c18, §4.9·CJ1 c8 |
| 6 | Patrones con genéricos: contenedores heterogéneos tipados, tipos recursivos y testigos de tipo | Intermedio | **falta** | EJ 33·CJ1 c8 |

#### M12 · Colecciones: uso con criterio (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Mapa del framework: `Collection`, `List`, `Set`, `Map`, `Queue`, `Deque` y las interfaces `Sequenced*` (JDK 21) | Intermedio | **está pero básico** (M2 T1): no incluye `SequencedCollection`/`SequencedMap` ni el mapa completo de interfaces | API java.util·OCP 5·CJ1 c9·DJ·YT-ES |
| 2 | Listas: `ArrayList`, `LinkedList`, `List.of` y su coste por operación | Intermedio | **está pero básico** (M2 T1): comparación en una tabla sin medición ni memoria | CJ1 c9·ENT·61B·JP c12·MOOC p12 |
| 3 | Conjuntos y mapas: variantes `Hash`, `LinkedHash` y `Tree`; `NavigableMap` y consultas por rango | Intermedio | **está pero básico** (M2 T1): faltan `NavigableMap`/`NavigableSet` y los métodos `compute`, `merge` y `computeIfAbsent` | CJ1 c9·ENT·OCP 5·PLZ·MJiA c8 |
| 4 | Colas y pilas: `Queue`, `Deque`, `ArrayDeque` y `PriorityQueue` | Intermedio | **ya está** (M2 T6) | CJ1 c9·OCP 5·61B |
| 5 | Orden: `Comparable`, `Comparator` y sus combinadores | Intermedio | **ya está** (M2 T5) | EJ 14·OCP 5·MOOC p10·ENT·61B |
| 6 | Iteradores, fail-fast, `ConcurrentModificationException` y `removeIf` | Intermedio | **está pero básico** (M2 T5): la iteración es un apartado; falta el fallo reproducido y `ListIterator` | CJ1 c9·ENT·61B |
| 7 | Colecciones inmutables, vistas y copias: `List.of`, `copyOf`, `Collections.unmodifiable*`, `Arrays.asList` y `subList` | Intermedio | **falta** | CJ1 c9·EJ 54·MJiA c8·API java.util |

#### M13 · Lambdas e interfaces funcionales (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | De la clase anónima a la lambda: sintaxis, captura y variables efectivamente finales | Intermedio | **está pero básico** (M20 T1): 647 palabras; faltan la captura, `this` dentro de la lambda y la comparación con la clase anónima en bytecode | JLS §15.27·EJ 42·MJiA c2–3·CJ1 c6·OCP 6·PLZ |
| 2 | Interfaces funcionales estándar: `Predicate`, `Function`, `Consumer`, `Supplier`, `BiFunction`, operadores y variantes primitivas | Intermedio | **está pero básico** (M20 T1, M20 T2, M20 T5): tres temas cortos que se fusionan; faltan las variantes primitivas y `@FunctionalInterface` | JLS §9.8·EJ 44·OCP 6·MJiA c3·API java.util.function |
| 3 | Referencias a métodos: las cuatro formas | Intermedio | **está pero básico** (M20 T6, M4 T4): 667 palabras; falta distinguir la referencia ligada de la no ligada y el momento en que se evalúa el receptor | JLS §15.13·EJ 43·MJiA c3·ENT |
| 4 | Componer funciones: `andThen`, `compose`, `negate` y `Comparator.comparing` | Intermedio | **ya está** (M20 T3) | MJiA c3·API java.util.function |
| 5 | `Optional` bien usado: cuándo devolverlo y cuándo no | Intermedio | **está pero básico** (M4 T2, M20 T7): dos temas cortos que se fusionan; faltan los antipatrones (campo, parámetro, `get` a ciegas) | EJ 55·MJiA c11·CJ2 c1·OCP 6 |
| 6 | Pureza y efectos: separar el cálculo de guardar o imprimir | Intermedio | **está pero básico** (M20 T12): 657 palabras; falta un caso con error real provocado por un efecto oculto | EJ 46·MJiA c18·MIT |
| 7 | Métodos `default` y herencia múltiple de comportamiento: la regla de resolución | Intermedio | **está pero básico** (M21 T3): aparece como herramienta de evolución; falta el conflicto de diamante y su resolución | JLS §9.4, §8.4·MJiA c13·EJ 21·ENT |

#### M14 · Streams (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El pipeline: fuente, operaciones intermedias, terminal y evaluación perezosa | Intermedio | **ya está** (M20 T4, M4 T1) | MJiA c4·CJ2 c1·EJ 45·OCP 6·MOOC p10·MIT |
| 2 | Intermedias: `filter`, `map`, `flatMap`, `mapMulti`, `sorted`, `distinct`, `limit`, `skip`, `takeWhile` y `dropWhile` | Intermedio | **está pero básico** (M20 T8): 660 palabras; faltan `mapMulti`, `takeWhile`/`dropWhile` y el coste de las operaciones con estado | CJ2 c1·MJiA c5·OCP 6·API java.util.stream |
| 3 | Terminales y reducción: `reduce`, `collect`, búsqueda y coincidencia | Intermedio | **está pero básico** (M20 T9): 559 palabras; falta `reduce` con identidad y combinador, y por qué importa la asociatividad | CJ2 c1·MJiA c5·OCP 6 |
| 4 | `Collectors`: `toList`, `toMap`, `groupingBy`, `partitioningBy`, colectores anidados y `teeing` | Intermedio | **está pero básico** (M20 T10): 577 palabras; faltan colectores anidados, `teeing` y el fallo de claves duplicadas en `toMap` | CJ2 c1·MJiA c6·OCP 6·API java.util.stream |
| 5 | Streams de primitivos, rangos y estadísticas | Intermedio | **falta** | CJ2 c1·OCP 6·MJiA c5 |
| 6 | Stream Gatherers: operaciones intermedias propias (JEP 485, JDK 24) | Intermedio | **está pero básico** (M4 T3): 685 palabras; faltan los gatherers incluidos uno a uno y cuándo no hacen falta | JEP 485·API java.util.stream |
| 7 | Crear streams: `iterate`, `generate`, `Files.lines`, streams infinitos y cierre de recursos | Intermedio | **falta** | CJ2 c1·MJiA c5·EJ 47 |

#### M15 · Entrada/salida y archivos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Flujos de bytes y de caracteres: `InputStream`/`OutputStream`, `Reader`/`Writer`, buffers y charsets | Intermedio | **falta** | CJ2 c2·OCP 9·DJ·JP c12·YT-ES |
| 2 | `Path` y `Files`: leer, escribir, copiar y mover | Intermedio | **está pero básico** (M6 T1): 530 palabras; faltan las opciones de apertura, el movimiento atómico y los errores por permisos | API java.nio.file·OCP 9·CJ2 c2·DJ |
| 3 | Recorrer árboles: `walk`, `find`, `FileVisitor`, atributos y permisos | Intermedio | **falta** | API java.nio.file.attribute·OCP 9·CJ2 c2 |
| 4 | Archivos grandes y recursos del classpath: leer en flujo sin agotar la memoria | Intermedio | **está pero básico** (M6 T3): falta medir la memoria en las dos variantes y `FileChannel` como siguiente paso | CJ2 c2·JP c12·DJ |
| 5 | `WatchService`, archivos temporales y escritura segura (escribir, sincronizar, renombrar) | Intermedio | **falta** | API java.nio.file·DJ |
| 6 | Formatos de trabajo: `Properties`, CSV a mano y archivos ZIP/JAR con `java.util.zip` | Intermedio | **falta** | API java.util.zip, java.util.jar·CJ2 c2·CJ1 c4 |
| 7 | Expresiones regulares con `Pattern` y `Matcher` | Intermedio | **ya está** (M19 T2) | API java.util.regex·CJ2 c2·DJ·MIT |

#### M16 · Empaquetar, configurar y ejecutar una aplicación (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Classpath a fondo y archivos JAR: manifiesto, `Main-Class` y la herramienta `jar` | Intermedio | **falta** | CJ1 c4·OCP 7·MAN·YT-ES |
| 2 | Configuración sin framework: `Properties`, variables de entorno, propiedades del sistema y precedencia | Intermedio | **falta** | API java.util, java.lang·CJ2 c10·RM |
| 3 | Registro: `System.Logger`, `java.util.logging`, SLF4J con Logback, MDC y registro estructurado | Intermedio | **está pero básico** (M15 T6): 618 palabras; faltan `System.Logger`, el coste de registrar y cómo se decide el nivel | CJ1 c7·JP c12·API java.lang·RM |
| 4 | Internacionalización: `Locale`, `ResourceBundle`, `MessageFormat`, formatos de número y `Collator` | Intermedio | **ya está** (M19 T6) | OCP 10·CJ2 c7·API java.text |
| 5 | Una CLI real: argumentos, códigos de salida, flujos estándar, `ProcessBuilder` y `ProcessHandle` | Intermedio | **falta** | CJ1 c10·API java.lang·JLS §12.8 |

#### M17 · Pruebas en la JVM (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | JUnit Jupiter: ciclo de vida, aserciones y pruebas anidadas | Intermedio | **está pero básico** (M9 T1, M15 T4): 584 palabras y sin nivel declarado; faltan `@Nested`, `assertAll`, tiempo máximo y el orden de ejecución | MIT·61B·RM |
| 2 | Pruebas parametrizadas, dinámicas y cobertura con JaCoCo | Intermedio | **está pero básico** (M9 T3): 587 palabras; faltan las fuentes de argumentos y leer un informe de cobertura con criterio | MIT·RM |
| 3 | Dobles de prueba y Mockito: stub, mock, spy y cuándo no simular | Intermedio | **está pero básico** (M9 T2): 560 palabras; falta la diferencia entre dobles y el antipatrón de simularlo todo | MJiA c9·RM·MIT |
| 4 | Aserciones expresivas con AssertJ y pruebas que se leen como especificación | Intermedio | **está pero básico** (M15 T4): 566 palabras y sin nivel; falta el diseño de la prueba (preparar, actuar, comprobar) y los mensajes de fallo | MIT·MJiA c9 |
| 5 | Pruebas basadas en propiedades | Intermedio | **ya está** (M9 T4) | MIT |
| 6 | `assert` y diseño por contrato: precondiciones, postcondiciones e invariantes | Intermedio | **ya está** (M19 T4) | JLS §14.10·CJ1 c7·MIT |
| 7 | Probar código con tiempo, azar y archivos: `Clock`, semillas y directorios temporales | Intermedio | **falta** | API java.time·MIT·JCiP «Testing Concurrent Programs» |

#### M18 · Concurrencia I: hilos, tareas y datos compartidos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Por qué concurrencia: procesos, hilos y núcleos; `Thread`, `Runnable` y estados de un hilo | Intermedio | **falta** | CJ1 c10·JCiP «Thread Safety»·OCP 8·JLS c17·YT-ES·ENT |
| 2 | Condiciones de carrera, `synchronized` y monitores | Intermedio | **está pero básico** (M5 T4): 645 palabras; faltan la carrera reproducida con conteo real y el bytecode `monitorenter`/`monitorexit` | JLS §17.1, §14.19·JVMS §3.14·JCiP «Thread Safety»·EJ 78·MIT·OCP 8 |
| 3 | Visibilidad, `volatile` y publicación segura: primer contacto | Intermedio | **está pero básico** (M14 T1): 656 palabras a nivel avanzado; falta una entrada suave con el bucle que nunca termina | JLS §17.4·JCiP «Sharing Objects»·EJ 78·ENT |
| 4 | `ExecutorService`, `Callable`, `Future` y apagado ordenado | Intermedio | **está pero básico** (M5 T1): 506 palabras; faltan los tipos de pool, `invokeAll`/`invokeAny`, `close()` y el apagado en dos fases | JCiP «Task Execution»·EJ 80·OCP 8·CJ1 c10·ENT |
| 5 | Interrupción, tiempos máximos y cancelación cooperativa | Intermedio | **está pero básico** (M5 T7): 712 palabras; falta la política de interrupción y qué hacer con `InterruptedException` | JCiP «Cancellation and Shutdown»·CJ1 c10 |
| 6 | Colecciones concurrentes: `ConcurrentHashMap`, `CopyOnWriteArrayList`, `BlockingQueue` y productor-consumidor | Intermedio | **falta** | JCiP «Building Blocks»·CJ1 c10·OCP 8·ENT·MIT |
| 7 | Hilos virtuales: primer uso y cuándo ayudan (JDK 21) | Intermedio | **ya está** (M5 T3) | DJ·OCP 8·ENT·API java.lang |

#### M19 · Patrones de diseño con Java moderno (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | SOLID y cuándo no aplicar un patrón | Intermedio | **está pero básico** (M12 T4): 589 palabras; falta un caso de sobreingeniería medido en líneas y acoplamiento | ENT·EJ 18–20·MIT |
| 2 | Creacionales: Builder, Factory Method, Abstract Factory, Prototype y Singleton | Intermedio | **está pero básico** (M12 T1, M12 T2, M12 T3, M12 T5): cuatro temas cortos que se fusionan; faltan Singleton (y por qué evitarlo) y las versiones con lambdas | EJ 1–5·ENT·MJiA c9 |
| 3 | Estructurales: Adapter, Decorator, Facade, Proxy y Composite | Intermedio | **ya está** (M12 T6) | EJ 18·MJiA c9·ENT |
| 4 | De comportamiento: Strategy, Observer, Template Method, Command, State y Visitor con lambdas y tipos sellados | Intermedio | **está pero básico** (M12 T2): solo Strategy; faltan los otros cinco y su forma moderna | MJiA c9·ENT·MIT |
| 5 | Inyección de dependencias a mano y `ServiceLoader` | Intermedio | **ya está** (M19 T5) | EJ 5·CJ1 c6·API java.util |
| 6 | Arquitectura de una aplicación Java sin framework: capas, puertos y adaptadores | Intermedio | **está pero básico** (M13 T1): 686 palabras; falta la regla de dependencias comprobada automáticamente | MIT·RM |

#### M20 · Datos y red I: JDBC, HTTP y JSON (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | JDBC: `Connection`, `PreparedStatement`, `ResultSet` y el patrón DAO | Intermedio | **ya está** (M17 T1) | CJ2 c5·JP c11·YT-ES·PLZ·RM |
| 2 | Transacciones con JDBC: confirmar, deshacer, puntos de guardado y niveles de aislamiento | Intermedio | **ya está** (M17 T2): el concepto ACID se enlaza a Fundamentos | CJ2 c5·JP c11·YT-ES |
| 3 | `HttpClient`: llamadas síncronas y asíncronas, tiempos máximos y reintentos | Intermedio | **ya está** (M18 T1): la teoría de REST se enlaza a Fundamentos | CJ2 c4·API java.net.http·JP c10 |
| 4 | JSON con Jackson: árbol, enlace a records, fechas y campos desconocidos | Intermedio | **está pero básico** (M6 T2): 614 palabras; faltan records, `java.time`, polimorfismo con tipos sellados y la configuración segura | JP c10·RM |
| 5 | Servidor HTTP mínimo con `com.sun.net.httpserver` y `jwebserver` | Intermedio | **falta** | CJ2 c4·MAN |


### Tramo 3 · Integración (nivel Avanzado) — 76 temas

#### M21 · Colecciones por dentro (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `ArrayList` y `ArrayDeque` por dentro: crecimiento, copia y localidad de memoria | Avanzado | **falta** | JP c12·61B·CJ1 c9·API java.util |
| 2 | `HashMap` por dentro: tabla, dispersión del hash, colisiones, árboles en cubetas y redimensionado | Avanzado | **falta** | 61B·ENT·JP c12·MOOC p12 |
| 3 | Claves mutables y el mapa que pierde entradas; `IdentityHashMap` y `WeakHashMap` | Avanzado | **ya está** (M2 T3): se añaden los dos mapas especiales | EJ 7, 11·CJ1 c9·ENT |
| 4 | `TreeMap` (árbol rojo-negro) y `PriorityQueue` (montículo): coste real | Avanzado | **falta** | 61B·CJ1 c9 |
| 5 | `LinkedHashMap` y caché LRU; `EnumMap`, `EnumSet` y `BitSet` por dentro | Avanzado | **falta** | EJ 36–37·CJ1 c9·ENT |
| 6 | `ConcurrentHashMap` por dentro: CAS, bloqueo por cubeta, operaciones atómicas y conteo | Avanzado | **falta** | ENT·JCiP «Building Blocks»·JP c12 |
| 7 | Elegir estructura midiendo: memoria por elemento (JOL), tamaño inicial y benchmark | Avanzado | **falta** | JP c7, c12·OCNJ ap. A |

#### M22 · Streams y lambdas por dentro (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `Spliterator`, características y cómo se ejecuta de verdad un pipeline | Avanzado | **falta** | MJiA c7·API java.util·JP c12 |
| 2 | Colectores propios y gatherers propios: estado, integrador, combinador y finalizador | Avanzado | **falta** | MJiA c6·JEP 485·API java.util.stream |
| 3 | Streams paralelos: pool común de Fork/Join, división del trabajo y cuándo empeoran | Avanzado | **está pero básico** (M20 T11, M4 T4): 665 y 861 palabras; faltan el benchmark con JMH, el efecto de la fuente y el riesgo de bloquear el pool común | EJ 48·MJiA c7·CJ2 c1·OCP 6, 8·JP c9 |
| 4 | Orden, estado compartido y efectos laterales en streams: fallos reproducibles | Avanzado | **está pero básico** (M20 T4, M20 T12): se explica el riesgo; falta el fallo reproducido en paralelo | EJ 46·MJiA c7·API java.util.stream |
| 5 | Lambdas por dentro: `invokedynamic`, `LambdaMetafactory`, captura y coste | Avanzado | **falta** | MJiA ap. D·JVMS §6.5·JLS §15.27·JP c12 |
| 6 | Flow API: publicar datos con demanda, contrapresión y cierre | Avanzado | **ya está** (M20 T13): Reactor y WebFlux se enlazan a Spring | MJiA c17·API java.util.concurrent·ENT |

#### M23 · Concurrencia II: clases seguras, locks y sincronizadores (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Diseñar clases seguras para hilos: confinamiento, inmutabilidad, invariantes y documentación | Avanzado | **falta** | JCiP «Composing Objects», «Sharing Objects»·EJ 82·MIT |
| 2 | Locks explícitos: `ReentrantLock`, `tryLock`, `Condition`, `ReadWriteLock` y `StampedLock` | Avanzado | **falta** | JCiP «Explicit Locks»·CJ1 c10·OCP 8·ENT |
| 3 | Variables atómicas y CAS: `AtomicInteger`, `AtomicReference` y `LongAdder` | Avanzado | **falta** | JCiP «Atomic Variables and Nonblocking Synchronization»·ENT·OCP 8 |
| 4 | Sincronizadores: `CountDownLatch`, `Semaphore`, `CyclicBarrier`, `Phaser` y `Exchanger` | Avanzado | **falta** | JCiP «Building Blocks»·ENT·API java.util.concurrent |
| 5 | `wait`/`notify` y por qué preferir las utilidades de concurrencia | Avanzado | **falta** | JLS §17.2·EJ 81·JCiP «Building Custom Synchronizers» |
| 6 | Vivacidad: bloqueo mutuo, livelock e inanición; diagnóstico con `jcmd Thread.print` | Avanzado | **falta** | JCiP «Avoiding Liveness Hazards»·EJ 79·JP c9·MIT |
| 7 | `ThreadLocal`, sus fugas y Scoped Values (JEP 506, definitivo en JDK 25) | Avanzado | **ya está** (M5 T6) | JEP 506·API java.lang |

#### M24 · Concurrencia III: ejecutores, asincronía e hilos virtuales (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `ThreadPoolExecutor` por dentro: colas, saturación, políticas de rechazo y dimensionado | Avanzado | **falta** | JCiP «Applying Thread Pools»·JP c9·ENT |
| 2 | `ScheduledExecutorService` y tareas periódicas | Avanzado | **falta** | JCiP «Task Execution»·API java.util.concurrent |
| 3 | Fork/Join: robo de trabajo y `RecursiveTask` | Avanzado | **falta** | JP c9·MJiA c7·ENT·CJ1 c10 |
| 4 | `CompletableFuture`: composición, errores, tiempos máximos y elección de ejecutor | Avanzado | **está pero básico** (M5 T2): 514 palabras; faltan `thenCompose` frente a `thenApply`, el manejo de errores, `orTimeout` y en qué hilo corre cada etapa | MJiA c15–16·CJ1 c10·ENT·JP c10 |
| 5 | Hilos virtuales a fondo: continuaciones, hilos portadores, anclaje (JEP 491, JDK 24) y límites de recursos | Avanzado | **está pero básico** (M5 T3): el uso está; faltan el funcionamiento interno, el anclaje antes y después de JDK 24, los volcados con `jcmd Thread.dump_to_file` y los eventos JFR | DJ·JEP 491·ENT·API java.lang |
| 6 | Structured Concurrency con `StructuredTaskScope` (JEP 505, **quinta preview** en JDK 25) | Avanzado | **está pero básico** (M5 T5): 647 palabras; faltan los `Joiner`, la propagación de cancelación y errores, y el aviso de API en preview | JEP 505 |
| 7 | Probar código concurrente: pruebas de estrés, jcstress y fallos reproducibles | Avanzado | **falta** | JCiP «Testing Concurrent Programs»·OCNJ c13 |

#### M25 · Módulos (JPMS) y distribución (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `module-info.java`: `requires`, `exports` y encapsulación fuerte | Avanzado | **está pero básico** (M10 T1): 664 palabras; faltan el grafo de legibilidad y los errores de compilación y de arranque leídos | JLS §7.7·CJ1 c12·OCP 7·DJ·MJiA c14 |
| 2 | `opens` y el acceso reflexivo de los frameworks | Avanzado | **ya está** (M10 T3) | CJ1 c12·OCP 7·JLS §7.7 |
| 3 | `requires transitive` y `static`, exportación cualificada y paquetes partidos | Avanzado | **falta** | CJ1 c12·JLS §7.7·OCP 7 |
| 4 | Servicios entre módulos: `uses` y `provides` | Avanzado | **está pero básico** (M19 T5): `ServiceLoader` está en classpath; falta la declaración en módulos y el descubrimiento | CJ1 c12·OCP 7·JLS §7.7 |
| 5 | Migración: módulo sin nombre, módulos automáticos, `--add-opens`/`--add-exports` y `jdeps` | Avanzado | **está pero básico** (M10 T2): 652 palabras; faltan los módulos automáticos y `jdeps` sobre un proyecto real | CJ1 c12·OCP 7·MAN·DJ |
| 6 | `jlink`: imágenes de runtime a medida (y enlace sin JMOD, JEP 493, JDK 24) | Avanzado | **está pero básico** (M14 T4): 525 palabras; faltan el tamaño medido, los módulos elegidos con `jdeps` y la JEP 493 | DJ·JEP 493·OCP 7·MAN |
| 7 | `jpackage`, JAR multiversión y firma con `jarsigner` | Avanzado | **falta** | MAN·DJ·CJ2 c9 |

#### M26 · Reflexión, anotaciones y metaprogramación (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Reflexión: `Class`, `Field`, `Method`, `Constructor`, acceso y coste | Avanzado | **ya está** (M19 T1) | CJ1 c5·DJ·EJ 65·API java.lang.reflect |
| 2 | Anotaciones: declararlas, retención, destino, repetibles y de tipo | Avanzado | **está pero básico** (M19 T1): comparte tema con reflexión; faltan retención y destino, las repetibles y las anotaciones de tipo | JLS §9.6–9.7·CJ1 c11·EJ 39–41·DJ |
| 3 | Procesadores de anotaciones: generar código durante la compilación | Avanzado | **falta** | CJ1 c11·ENT·API java.compiler |
| 4 | Proxies dinámicos: así funcionan `@Transactional` y los mocks | Avanzado | **ya está** (M19 T7) | CJ1 c6·API java.lang.reflect |
| 5 | `MethodHandle` y `VarHandle`: invocación y acceso tipados | Avanzado | **ya está** (M19 T9) | DJ·API java.lang.invoke |
| 6 | Reflexión sobre genéricos, records, tipos sellados y módulos | Avanzado | **falta** | CJ1 c8·API java.lang.reflect, java.lang.module |
| 7 | La API del compilador (`javax.tools`) y la de scripting | Avanzado | **falta** | CJ2 c8 |

#### M27 · E/S avanzada: NIO, canales y serialización (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `ByteBuffer`: en heap y directo, posición y límite, orden de bytes | Avanzado | **falta** | API java.nio·JP c8, c10·CJ2 c2 |
| 2 | `FileChannel`: lectura posicional, `transferTo`, `force` y bloqueo de archivos | Avanzado | **falta** | CJ2 c2·API java.nio.channels |
| 3 | Archivos mapeados en memoria: `MappedByteBuffer` y `MemorySegment` | Avanzado | **falta** | CJ2 c2·API java.lang.foreign·DJ |
| 4 | E/S no bloqueante: `Selector`, canales y E/S asíncrona | Avanzado | **falta** | JP c10·API java.nio.channels |
| 5 | Serialización Java: `Serializable`, `serialVersionUID`, forma personalizada y proxy de serialización | Avanzado | **falta** | EJ 86–90·OCP 9·CJ2 c2·JP c12·ENT |
| 6 | Deserialización segura: `ObjectInputFilter` y alternativas | Avanzado | **está pero básico** (M14 T3): 609 palabras; faltan el filtro configurado y probado, y la comparación con JSON y records | EJ 85, 88·DJ·API java.io |
| 7 | Datos binarios y compresión: `DataInputStream`/`DataOutputStream`, GZIP y sumas de verificación | Avanzado | **falta** | CJ2 c2·API java.util.zip·JP c12 |

#### M28 · Redes (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Sockets TCP: cliente, servidor, tiempos máximos y un hilo virtual por conexión | Avanzado | **falta** | CJ2 c4·MIT·YT-ES·API java.net |
| 2 | UDP, multidifusión, `InetAddress` y resolución de nombres | Avanzado | **falta** | API java.net, java.net.spi·CJ2 c4 |
| 3 | TLS con JSSE: `SSLContext`, almacén de claves y de confianza, `keytool` | Avanzado | **falta** | API javax.net.ssl·DJ·MAN·CJ2 c9 |
| 4 | `HttpClient` avanzado: HTTP/2, cuerpos en flujo, autenticación y proxy | Avanzado | **está pero básico** (M18 T1): cubre tiempos máximos y fallos; faltan HTTP/2, `BodyHandler`/`BodyPublisher` en flujo y la autenticación | CJ2 c4·API java.net.http·JP c10 |
| 5 | WebSocket con `java.net.http` | Avanzado | **falta** | API java.net.http |
| 6 | Servidor de red con NIO frente a hilos virtuales: comparar midiendo | Avanzado | **falta** | JP c10·DJ·OCNJ c13 |

#### M29 · JDBC a fondo y acceso a datos sin framework (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Pool de conexiones y `DataSource`: dimensionado y fugas de conexiones | Avanzado | **falta** | JP c11·CJ2 c5 |
| 2 | Lotes, claves generadas y lectura en flujo de resultados grandes | Avanzado | **falta** | JP c11·CJ2 c5·YT-ES |
| 3 | Metadatos, tipos SQL y Java (`java.time`, `BigDecimal`), valores nulos y procedimientos almacenados | Avanzado | **falta** | CJ2 c5·YT-ES |
| 4 | Concurrencia sobre la base de datos: aislamiento demostrado, bloqueo optimista y pesimista con JDBC | Avanzado | **está pero básico** (M17 T2): explica los niveles; falta reproducir las anomalías con dos conexiones y el bloqueo optimista por versión | JP c11·CJ2 c5 |
| 5 | Del DAO al repositorio: mapear a records y entender qué resuelve un ORM | Avanzado | **está pero básico** (M17 T1): el DAO está; falta el mapeo a records y el puente conceptual hacia JPA (que vive en Spring) | JP c11·PLZ·RM |

#### M30 · Seguridad en la plataforma Java (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos | Avanzado | **ya está** (M18 T3) | DJ·CJ2 c9·API java.security, javax.crypto |
| 2 | Clave pública: firmas, acuerdo de claves, KEM (JDK 21) y algoritmos poscuánticos ML-KEM y ML-DSA (JEP 496 y 497, JDK 24) | Avanzado | **falta** | JEP 496·JEP 497·DJ·CJ2 c9·API java.security |
| 3 | Derivación de claves y contraseñas: API KDF (JEP 510, JDK 25), PBKDF2 y PEM (JEP 470, **preview** en JDK 25) | Avanzado | **falta** | JEP 510·JEP 470·API javax.crypto |
| 4 | Almacenes de claves, certificados X.509, `keytool` y `jarsigner` | Avanzado | **falta** | DJ·MAN·CJ2 c9·API java.security.cert |
| 5 | Código seguro en Java: validar entradas, inyección, secretos en memoria y errores que filtran datos | Avanzado | **está pero básico** (M18 T2): la validación y los límites están; los tokens se mueven a Spring; faltan inyección, secretos y las guías de código seguro | DJ·EJ 49–50, 85·ENT |
| 6 | Integridad por defecto: fin del Security Manager (JEP 486), restricciones a JNI (JEP 472) y a `sun.misc.Unsafe` (JEP 471 y 498) | Avanzado | **falta** | JEP 486·JEP 472·JEP 471·JEP 498·DJ |

#### M31 · APIs públicas, compatibilidad y librerías (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es la superficie pública de una API | Avanzado | **ya está** (M21 T1) | EJ 15, 51, 56·JLS §13.1 |
| 2 | Compatibilidad binaria, de fuente y de comportamiento | Avanzado | **ya está** (M21 T2) | JLS c13 |
| 3 | Evolucionar sin romper: métodos `default`, deprecación y retirada | Avanzado | **ya está** (M21 T3) | JLS §13.5·EJ 21·MJiA c13·MAN |
| 4 | Verificar la compatibilidad en el build | Avanzado | **ya está** (M21 T5) | JLS c13 |
| 5 | Diseñar una librería: nulabilidad, excepciones documentadas, inmutabilidad y Javadoc como contrato | Avanzado | **falta** | EJ 51, 54–56, 74·MIT |
| 6 | Migrar entre versiones LTS: de 17 a 21 y a 25 con `jdeprscan` y `jdeps` | Avanzado | **ya está** (M14 T6) | MAN·JDK25 |

#### M32 · Java funcional avanzado (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Funciones de orden superior, currificación y aplicación parcial | Avanzado | **falta** | MJiA c19·MIT |
| 2 | Evaluación perezosa y memoización: `Supplier`, inicialización diferida y Stable Values (JEP 502, **preview** en JDK 25) | Avanzado | **falta** | MJiA c19·EJ 83·JEP 502 |
| 3 | Errores como valores: `Result`/`Either` con tipos sellados y cuándo sí usar excepciones | Avanzado | **falta** | MJiA c18–19·EJ 69–71 |
| 4 | Lenguajes específicos de dominio con lambdas y builders | Avanzado | **falta** | MJiA c10·MIT |
| 5 | Inmutabilidad a escala: estructuras persistentes, copias y su coste medido | Avanzado | **falta** | MJiA c19·EJ 17·JP c7 |


### Tramo 4 · Experto (nivel Experto) — 69 temas

#### M33 · Bytecode y formato de clase (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Leer bytecode con `javap -c -v`: pila de operandos, variables locales y marcos | Experto | **falta** | JVMS §2.6, §2.11, c3·MAN·MJiA ap. D |
| 2 | El archivo `.class`: constant pool, descriptores, atributos y verificación | Experto | **falta** | JVMS c4 |
| 3 | Cómo compila `javac`: `switch`, `try`/`finally`, concatenación, clases internas, records y patrones | Experto | **falta** | JVMS §3.10–3.13·JLS §15.18·JP c12 |
| 4 | `invokedynamic`, métodos de arranque y constantes dinámicas | Experto | **falta** | JVMS §4.4, §5.4, §6.5·API java.lang.invoke, java.lang.runtime |
| 5 | Class-File API: leer, generar y transformar clases (JEP 484, JDK 24) | Experto | **falta** | JEP 484·API java.lang.classfile·CJ1 c11 |
| 6 | Agentes Java, instrumentación y clases ocultas | Experto | **falta** | ENT·CJ1 c11·API java.lang.invoke |

#### M34 · Carga de clases, enlace, inicialización y arranque (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Cargadores de clases, delegación y `URLClassLoader` | Experto | **ya está** (M19 T8) | JVMS §5.3·JLS §12.2·CJ2 c9·ENT·JP c12 |
| 2 | Carga, verificación, preparación, resolución e inicialización: orden exacto y sus errores (`NoClassDefFoundError`, `ClassNotFoundException`, `ExceptionInInitializerError`) | Experto | **falta** | JVMS §5.3–5.5·JLS §12.2–12.4·ENT |
| 3 | Capas de módulos, aislamiento de plugins, descarga de clases y fugas de cargadores | Experto | **falta** | JLS §12.7·API java.lang.module·JP c12 |
| 4 | Class Data Sharing y AppCDS | Experto | **ya está** (M14 T5): primera mitad del tema actual | JP c12·DJ |
| 5 | Caché AOT: carga y enlace anticipados (JEP 483, JDK 24), ergonomía (JEP 514) y perfiles de método (JEP 515), ambas en JDK 25 | Experto | **está pero básico** (M14 T5): la caché AOT está presentada; faltan las JEP 514 y 515 y el arranque medido en tres configuraciones | JEP 483·JEP 514·JEP 515 |
| 6 | El arranque de la JVM por fases: `-Xlog:startuptime`, `-Xlog:class+load` y qué se puede acortar | Experto | **falta** | JVMS §5.2·JLS §12.1·OCNJ c3·MAN |

#### M35 · Memoria: objetos, áreas y referencias (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Áreas de memoria de HotSpot: heap, pilas, metaspace, code cache y memoria nativa | Experto | **está pero básico** (M11 T1): 600 palabras para memoria y recolectores; faltan metaspace, code cache y la memoria nativa | JVMS §2.5·JP c5, c8·OCNJ c3·ENT |
| 2 | El objeto por dentro: cabecera, mark word, puntero de clase, alineación y punteros comprimidos, vistos con JOL | Experto | **falta** | JVMS §2.7·JP c7·OCNJ c4 |
| 3 | Compact Object Headers (JEP 519, función de producto en JDK 25): qué cambia y cómo medirlo | Experto | **falta** | JEP 519 |
| 4 | Asignación: TLAB, análisis de escape y reemplazo escalar | Experto | **falta** | JP c4, c7·OCNJ c4, c6 |
| 5 | Referencias blandas, débiles y fantasma; `Cleaner` y el fin de la finalización | Experto | **está pero básico** (M11 T3): 571 palabras con los volcados de heap; faltan `ReferenceQueue`, `Cleaner` y la retirada de `finalize` | JP c7·EJ 7–8·ENT·JLS §12.6·API java.lang.ref |
| 6 | `String` por dentro: cadenas compactas, pool, deduplicación y concatenación con `invokedynamic` | Experto | **falta** | JP c12·ENT·JLS §15.18 |
| 7 | Memoria nativa: buffers directos, Native Memory Tracking y por qué el proceso ocupa más que el heap | Experto | **falta** | JP c8·OCNJ c9·MAN |

#### M36 · Recolección de basura (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Teoría: alcanzabilidad, raíces, hipótesis generacional, barreras y puntos seguros | Experto | **está pero básico** (M11 T1): solo generaciones; faltan raíces, barreras y puntos seguros | JP c5·OCNJ c4·ENT·DJ |
| 2 | Serial y Parallel: cuándo siguen siendo la elección correcta | Experto | **falta** | JP c5–6·OCNJ c4 |
| 3 | G1 por dentro: regiones, conjuntos recordados, colecciones mixtas, objetos enormes y objetivo de pausa | Experto | **falta** | JP c6·OCNJ c5·ENT·JEP 423·JEP 475 |
| 4 | ZGC generacional: por defecto desde JDK 23 (JEP 474) y único modo desde JDK 24 (JEP 490) | Experto | **falta** | JEP 474·JEP 490·JP c6·OCNJ c5·ENT |
| 5 | Shenandoah generacional (JEP 521, JDK 25) y Epsilon | Experto | **falta** | JEP 521·JP c6·OCNJ c5 |
| 6 | Leer registros de GC con `-Xlog:gc*` y ajustar con datos: tamaño de heap, pausas y rendimiento | Experto | **falta** | JP c5–6·OCNJ c5·ENT·DJ |
| 7 | Fugas de memoria y `OutOfMemoryError`: histogramas, volcados de heap y árbol de dominadores | Experto | **está pero básico** (M11 T3): presenta el volcado; faltan los tipos de OOM, el histograma con `jcmd` y un análisis completo de una fuga | JP c7·OCNJ c5·DJ·MAN |

#### M37 · Compilación JIT y ejecución (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Intérprete, C1, C2, compilación por niveles y OSR | Experto | **está pero básico** (M11 T2): 636 palabras junto con JFR; faltan los niveles, OSR y el registro de compilación leído | JP c4·OCNJ c6·ENT |
| 2 | Inlining, desvirtualización, perfiles de tipo y desoptimización | Experto | **falta** | JP c4·OCNJ c6 |
| 3 | Análisis de escape, eliminación de bloqueos, optimización de bucles e intrínsecos | Experto | **falta** | JP c4·OCNJ c6 |
| 4 | Code cache y cómo observar al compilador: `-XX:+PrintCompilation`, `jcmd Compiler.*` y JITWatch | Experto | **falta** | JP c4·OCNJ c6·MAN |
| 5 | Puntos seguros y tiempo hasta el punto seguro | Experto | **falta** | OCNJ c4, c6·JP c4 |
| 6 | GraalVM: compilador Graal e imagen nativa frente a HotSpot (qué se gana y qué se pierde) | Experto | **falta** | JP c4·OCNJ c6, c15 |
| 7 | Vector API: cálculo SIMD explícito (JEP 508, **décima incubación** en JDK 25) | Experto | **falta** | JEP 508 |

#### M38 · Modelo de memoria de Java y concurrencia sin bloqueos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El modelo de memoria: acciones, happens-before y carreras de datos | Experto | **está pero básico** (M14 T1): 656 palabras; faltan las reglas de happens-before una a una y un resultado prohibido y uno permitido comprobados | JLS §17.4·JCiP «The Java Memory Model»·ENT |
| 2 | Campos `final`, publicación segura y el bloqueo con doble comprobación | Experto | **falta** | JLS §17.5·JCiP «The Java Memory Model»·EJ 83·ENT |
| 3 | Desgarro de palabras, `long`/`double` no atómicos, falso compartido y `@Contended` | Experto | **falta** | JLS §17.6–17.7·JP c9 |
| 4 | `VarHandle`: modos de acceso simple, opaco, adquirir/liberar y volátil | Experto | **está pero básico** (M19 T9): presenta `VarHandle`; faltan los modos de acceso y su relación con el modelo de memoria | API java.lang.invoke·JLS §17.4 |
| 5 | Algoritmos sin bloqueo: pila de Treiber, cola de Michael-Scott y el problema ABA | Experto | **falta** | JCiP «Atomic Variables and Nonblocking Synchronization»·ENT |
| 6 | `AbstractQueuedSynchronizer`: construir un sincronizador propio | Experto | **falta** | JCiP «Building Custom Synchronizers»·API java.util.concurrent.locks |
| 7 | Monitores por dentro: bloqueo ligero, inflado y la retirada del bloqueo sesgado | Experto | **falta** | JP c9·JVMS §2.11·OCNJ c13 |

#### M39 · Rendimiento: método y medición (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Método: objetivo, hipótesis, medición, percentiles y errores de medida | Experto | **falta** | JP c1–2·OCNJ c1–2 |
| 2 | JMH: por qué un cronómetro ingenuo miente y cómo escribir un microbenchmark válido | Experto | **está pero básico** (M14 T2): 602 palabras; faltan el modo de medición, `Blackhole`, parámetros y la lectura del error | JP c2·OCNJ ap. A·EJ 67 |
| 3 | JFR a fondo: eventos, configuraciones, eventos propios y transmisión en vivo | Experto | **está pero básico** (M11 T2): 636 palabras junto con JIT; faltan los eventos propios, la configuración y la herramienta `jfr` | DJ·JP c3·OCNJ c11·MAN |
| 4 | JFR en JDK 25: muestreo cooperativo (JEP 518), tiempo y traza de métodos (JEP 520) y perfil por tiempo de CPU (JEP 509, **experimental**) | Experto | **falta** | JEP 518·JEP 520·JEP 509 |
| 5 | Perfilado: muestreo frente a instrumentación, sesgo de punto seguro, async-profiler y gráficos de llamas | Experto | **falta** | JP c3·OCNJ c12 |
| 6 | JDK Mission Control: leer una grabación de principio a fin | Experto | **falta** | JP c3·DJ·OCNJ c11 |
| 7 | Rendimiento de las API: cadenas, colecciones, excepciones, boxing y streams frente a bucles | Experto | **falta** | JP c12·EJ 6, 61, 63·OCNJ ap. B |

#### M40 · Diagnóstico en producción (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | `jcmd` de extremo a extremo: `VM.flags`, `Thread.print`, `GC.heap_info`, `VM.native_memory` y `JFR.start` | Experto | **falta** | DJ·MAN·JP c3 |
| 2 | Volcados de hilos: leerlos, encontrar el bloqueo y volcar hilos virtuales | Experto | **falta** | JP c9·DJ·MAN·JCiP «Avoiding Liveness Hazards» |
| 3 | Volcados de heap en producción: `HeapDumpOnOutOfMemoryError`, coste y análisis | Experto | **está pero básico** (M11 T3): presenta el volcado; faltan el volcado automático, su coste y el análisis de principio a fin | JP c7·MAN·DJ |
| 4 | Registro unificado `-Xlog`, archivos `hs_err`, volcados de proceso y `jhsdb` | Experto | **falta** | MAN·DJ·OCNJ c3 |
| 5 | JMX y MXBeans; `jconsole` y `jstat` | Experto | **falta** | MAN·JP c3·DJ |
| 6 | Guiones de diagnóstico: CPU alta, latencia por pausas, bloqueo y fuga de memoria nativa | Experto | **falta** | JP c3, c8·OCNJ c12, ap. B·ENT |
| 7 | Depuración avanzada: JDWP remoto, `jdb` y puntos de parada condicionales | Experto | **falta** | MAN·CJ1 c7 |

#### M41 · Java en contenedores y operación del runtime (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | La JVM dentro de un contenedor: detección de límites, `MaxRAMPercentage` y número de CPU | Experto | **falta** | OCNJ c8–9·JP c8·MAN |
| 2 | El runtime como parte del artefacto: `jlink`, imagen base y ciclo de parches | Experto | **está pero básico** (M14 T4): 525 palabras; faltan la imagen medida y la política de actualización de parches del JDK | DJ·OCNJ c9·MAN |
| 3 | Arranque y huella en producción: CDS y caché AOT dentro de la imagen; CRaC y la imagen nativa como contexto | Experto | **falta** | JEP 483·JEP 514·OCNJ c15·JP c4 |
| 4 | Opciones de la JVM: categorías, `-XX:+PrintFlagsFinal`, `JAVA_TOOL_OPTIONS` y qué no tocar | Experto | **falta** | JP ap. A·MAN·OCNJ c3 |
| 5 | Apagado ordenado: señales, ganchos de cierre y drenaje de trabajo | Experto | **falta** | JLS §12.8·JCiP «Cancellation and Shutdown»·API java.lang |

#### M42 · Interoperar con código nativo (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | FFM API: `MemorySegment`, `Arena` y diseños de memoria (JEP 454, JDK 22) | Experto | **está pero básico** (M11 T4): 918 palabras para toda la API; se reparte en tres temas y falta el ciclo de vida de las arenas con su fallo de uso tras cierre | JEP 454·API java.lang.foreign·CJ2 c13·DJ |
| 2 | FFM API: `Linker`, llamadas hacia C, retrollamadas desde C y estado de error | Experto | **falta** | JEP 454·API java.lang.foreign·CJ2 c13 |
| 3 | `jextract`: generar enlaces desde un `.h` y usar una librería real | Experto | **falta** | JEP 454·DJ |
| 4 | JNI: cómo funciona, su coste y por qué se restringe (`--enable-native-access`, `jnativescan`) | Experto | **falta** | CJ2 c13·EJ 66·JP c12·JEP 472·MAN |
| 5 | Memoria fuera del heap sin `Unsafe`: migrar a FFM y `VarHandle` | Experto | **falta** | JEP 471·JEP 498·API java.lang.foreign |

#### M43 · Evolución de Java y criterio de experto (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Cómo evoluciona Java: el proceso JEP y qué significan preview, incubación y experimental (`--enable-preview`) | Experto | **falta** | JLS §1.5·JVMS §1.5·JDK25·DJ |
| 2 | El mismo ejemplo de Java 8 a 25: refactor guiado versión a versión | Experto | **falta** | MJiA c1, c21·JDK25·OCP 3 |
| 3 | Las funciones no definitivas de JDK 25 juntas (JEP 470, 502, 505, 507, 508 y 509) y la política del curso para usarlas | Experto | **falta** | JDK25 |
| 4 | Proyectos de OpenJDK (Amber, Loom, Panama, Valhalla, Leyden, Babylon): qué está entregado y qué no | Experto | **falta** | JDK25·MJiA c21·OCNJ c15 |
| 5 | Leer la JLS y la JVMS: resolver una duda de lenguaje con la especificación | Experto | **falta** | JLS c1–2·JVMS c1 |

### 2.1 Notas de linealidad

- Las pruebas se **ejecutan** desde M0 T7 (`./gradlew test`) y los laboratorios de Fundamentos ya traen pruebas
  escritas; **escribirlas** se enseña en M17. Ningún tema anterior a M17 pide escribir una prueba.
- JMH y JOL se **usan** con una plantilla en M21 T7 y M22 T3; su funcionamiento se enseña en M39 T2 y M35 T2.
  `jcmd Thread.print` se usa por primera vez en M23 T6 y se enseña completo en M40.
- Los hilos virtuales aparecen dos veces a propósito: primer uso en M18 T7 y funcionamiento interno en M24 T5.
  Lo mismo ocurre con `equals`/`hashCode` (M5 T6 y M9 T1), enums (M6 T7 y M9 T7), records (M5 T7 y M9 T2),
  JFR (M39 T3 y T4) y FFM (M27 T3 y M42). En cada par, el segundo tema enlaza al primero y no lo repite.
- Desde M20 los laboratorios usan PostgreSQL en un contenedor. El curso solo exige `docker compose up`; el
  porqué vive en el curso de Docker (decisión D7).

### 2.2 Temas de las fuentes que se dejan fuera a propósito

| Tema que aparece en las fuentes | Dónde aparece | Propuesta |
|---|---|---|
| XML (DOM, SAX/StAX, XPath, XSLT) | CJ2 c3 | Fuera del curso; una nota en M15 T6. Decisión D6 |
| Interfaces gráficas: Swing, AWT, JavaFX | CJ2 c10–12, DJ, YT-ES, JCiP «GUI Applications» | Fuera: la academia hace interfaz con web y móvil |
| Applets, Java Web Start, JSP y Servlets | YT-ES | Fuera: tecnologías retiradas del JDK o propias de Jakarta EE; la web con Java vive en Spring |
| Correo electrónico, RMI | CJ2 c4, MAN (`rmiregistry`) | Fuera |
| Estructuras de datos y algoritmos completos (árboles B, grafos, caminos mínimos, ordenación avanzada) | 61B, RM | Java enseña el uso y el interior de las colecciones (M4 T6, M21). El curso completo de algoritmos no existe en la academia: decisión D6 |
| Git, control de versiones y revisión de código | MIT, RM | Curso Fundamentos (ya es su dueño) |
| Spring Boot, REST, despliegue, diseño de sistemas | RM, ENT, JP c10–11 | Cursos Spring, Docker, Kubernetes y Diseño de sistemas |
| JPA y Spring Data | JP c11, PLZ | Curso Spring |
| Scala y comparación de lenguajes | MJiA c20 | Fuera |
| Técnicas de sistemas distribuidos, nube y observabilidad de plataforma | OCNJ c8, c10, c14 | Cursos Cloud, DevOps y Microservicios; Java se queda con JFR, JMX y el registro |
| CMS, bloqueo sesgado y opciones de JDK 8 | JP c5–6, c9 | Solo como historia dentro de M36 y M38: ya no existen en JDK 25 |

## 3. Lo que hoy está en Java y debería vivir en otro curso

Regla 1 de la spec: un concepto, un curso dueño. Java se queda con el lenguaje, la biblioteca estándar, la JVM y
sus herramientas. El destino tema a tema está en el anexo A.

| Qué hay hoy en Java | Temas actuales | Curso dueño propuesto | Qué queda en Java |
|---|---|---|---|
| Maven y Gradle: comparación, ciclo de vida, scopes, multi-módulo, builds reproducibles | M8 T1–T4, M13 T2, M15 T1–T3 (8 temas) | **Gradle** (curso nuevo; Maven como alternativa dentro de él) | M0 T7: usar el wrapper para compilar, probar y empaquetar. Todos los laboratorios son builds de Gradle que el estudiante ejecuta, no diseña |
| JPA, Hibernate, `EntityManager`, Criteria/Querydsl, N+1, `EntityGraph`, cachés, propagación de transacciones | M16 T1–T8 (8 temas) | **Spring** («Data y JPA a fondo», spec 021 §5) | JDBC completo (M20 T1–T2 y M29) y el puente «qué resuelve un ORM» (M29 T5) |
| Pruebas de integración con Testcontainers | M15 T5 y parte de M16 T8 | **Spring** (pruebas: slices y Testcontainers). Decisión D2 | Pruebas unitarias, parametrizadas, de propiedades y de concurrencia (M17, M24 T7) |
| Tokens (JWT), autenticación y autorización de una API | parte de M18 T2 | **Spring** (Security, OAuth2/OIDC); el concepto, en Fundamentos | Criptografía de la plataforma y código seguro (M30) |
| Teoría de REST y de HTTP | parte de M18 T1 | **Fundamentos** | `HttpClient`, sockets, TLS y WebSocket (M20 T3, M28) |
| ACID y aislamiento como concepto de bases de datos | parte de M17 T2 | **Fundamentos** (SQL) | Cómo se usan desde JDBC y las anomalías reproducidas (M20 T2, M29 T4) |
| Programación reactiva con Reactor | mencionada desde M20 T13 | **Spring** (WebFlux) | Flow API y contrapresión (M22 T6) |
| Imagen de contenedor del servicio y su construcción | parte de M14 T4 | **Docker** | Ergonomía de la JVM en contenedores, `jlink` y caché AOT (M41) |
| Imagen nativa de una aplicación Spring | — | **Spring** (AOT/native) | Qué es GraalVM y qué supuestos cambia (M37 T6) |
| Observabilidad de plataforma (métricas, trazas, tableros) | parte de M15 T6 | **DevOps** | Registro, JFR y JMX (M16 T3, M39, M40) |
| Ejemplos del SDK de AWS (`examples/java/*.java`: S3, DynamoDB, SQS, Lambda, IAM, API Gateway) | no son lecciones de Java | **Cloud** (con Floci) | Nada: la carpeta `examples/java/` pasa a ser la de los laboratorios `modulo-N/` |
| Arquitectura por capas y patrones de diseño | M12 T1–T6, M13 T1 | Quedan en Java (M19), reescritos con Java moderno. Decisión D3 | — |

Nada se pierde (regla 2): ningún tema se retira. Los 16 temas que salen completos hacia Gradle y Spring, y el
que pasa a ser el proyecto final (M13 T3), tienen su destino escrito en el anexo A, y el contenido se mueve solo cuando el dueño apruebe el temario del curso de destino.

## 4. Proyecto guía y laboratorio por módulo

### 4.1 Proyecto guía: `rutaflow-nucleo`

El motor de envíos de RutaFlow escrito en **Java puro, sin framework**: un solo proyecto que crece módulo a
módulo. Es el mismo dominio del resto de la academia (envíos, rutas, tarifas, rastreo), así que el curso de
Spring puede partir de este núcleo en lugar de empezar de cero.

| Tramo | Qué es el proyecto al terminar el tramo |
|---|---|
| Fundamentos (M0–M8) | Programa de consola que registra envíos, calcula tarifa y fecha prometida, lee un archivo y falla con mensajes útiles |
| Aplicación (M9–M20) | Aplicación por capas con modelo de dominio sellado, reglas de tarifa componibles, informes con streams, importación de archivos, CLI empaquetada, pruebas con cobertura, ingesta concurrente de eventos, persistencia JDBC en PostgreSQL y un puerto HTTP mínimo |
| Integración (M21–M32) | Build de Gradle con varios subproyectos y módulos JPMS (`dominio`, `tarifas`, `persistencia`, `rastreo`, `servidor`, `cli`), plugins de transportistas por `ServiceLoader`, registro de eventos de solo anexar, protocolo TCP con TLS, cotizador concurrente con hilos virtuales, manifiestos firmados, librería `rutaflow-tarifas` con compatibilidad verificada e imagen `jlink` |
| Experto (M33–M43) | El mismo sistema medido y endurecido: benchmarks con JMH, grabaciones JFR, colector elegido con datos, arranque con caché AOT, estructuras sin bloqueos verificadas, enlace nativo con FFM, imagen de contenedor mínima y tres incidentes diagnosticados |

**Proyecto final (con rúbrica, formato único §3):** entregar `rutaflow-nucleo` con (1) el build verde con
`./gradlew check` en JDK 25; (2) una carga de 10 000 conexiones de rastreo atendida con hilos virtuales y su
grabación JFR; (3) un informe de rendimiento con objetivo en percentiles, benchmark y mejora demostrada; (4) un
informe de diagnóstico de los tres incidentes de M40; (5) la imagen de runtime con `jlink` y caché AOT, con el
arranque medido antes y después; y (6) un registro de decisiones (qué colector, qué estructuras, qué funciones en
preview se usan y por qué). Recoge el actual M13 T3.

### 4.2 Convenciones de los laboratorios

- Carpeta `examples/java/modulo-N/` con `README.md`, `settings.gradle.kts`, `build.gradle.kts`,
  `gradle/libs.versions.toml` (catálogo de versiones), wrapper de Gradle incluido y `verificar.sh`, que termina en
  `RESULTADO: OK` (formato único §3).
- Kotlin DSL siempre; toolchain de Java 25 declarada en el build, como ya hace `examples/java-gradle/`.
- Los módulos con funciones en preview o incubación activan `--enable-preview` o `--add-modules` en el propio
  `build.gradle.kts` (compilación, pruebas y ejecución), y el README lo avisa.
- Los módulos de rendimiento y diagnóstico (M21, M22, M35–M40) añaden un subproyecto `bench` con JMH y guardan
  la salida real (tablas de JMH, registros de GC, resúmenes de `jfr`) junto al laboratorio.
- Cada laboratorio parte del estado final del anterior; el README dice qué archivo cambia y por qué.
- Énfasis propio del curso (spec 021 §3): memoria dibujada en cada tema de lenguaje, bytecode con `javap`, JFR
  para ver qué hace la JVM, el mismo ejemplo de Java 8 a 25 y fallos de concurrencia reproducibles.

### 4.3 Laboratorio por módulo

| Módulo | Tramo | Laboratorio (`examples/java/modulo-N/`, Gradle Kotlin DSL) |
|---|---|---|
| M0 · Plataforma, herramientas y primer programa | Fundamentos | Instalar JDK 25, compilar a mano con `javac`, mirar el bytecode con `javap` y dejar creado el proyecto Gradle `rutaflow-nucleo` con wrapper y toolchain 25 |
| M1 · Datos: tipos, variables y operadores | Fundamentos | Calculadora de tarifas de envío: desbordamientos, redondeos y conversiones demostrados con pruebas que fallan y luego pasan |
| M2 · Texto y entrada/salida de consola | Fundamentos | Lector de guías de envío por consola: validar, normalizar y formatear texto con acentos y emojis sin romperlo |
| M3 · Control de flujo y métodos | Fundamentos | Clasificador de paquetes por peso, zona y urgencia, escrito primero con `if` y después con `switch` de expresión y métodos pequeños |
| M4 · Arreglos y primeras colecciones | Fundamentos | Manifiesto de carga: ordenar y buscar paquetes con arreglos, y después con `ArrayList` y `HashMap`, comparando el código |
| M5 · Objetos y clases | Fundamentos | Modelo inicial de `Envio`, `Direccion` y `Paquete` con invariantes protegidas y el orden de inicialización trazado paso a paso |
| M6 · Herencia, interfaces y polimorfismo | Fundamentos | Tipos de envío (estándar, exprés, refrigerado) con una jerarquía y con interfaces; se mide qué cambia al añadir un tipo nuevo |
| M7 · Excepciones | Fundamentos | Importador de envíos desde un archivo defectuoso: cada error termina en un mensaje útil y ningún recurso queda abierto |
| M8 · Fechas, dinero y documentación | Fundamentos | Cálculo de fecha prometida de entrega entre zonas horarias y de costo con IVA, documentado con Javadoc generado por Gradle |
| M9 · Diseño de clases a fondo | Aplicación | Refactor del modelo de envíos a tipos de valor correctos: igualdad, copia, anidamiento y fábricas, con pruebas que demuestran cada rotura |
| M10 · Tipos sellados, patrones y programación orientada a datos | Aplicación | Estados y eventos del envío como tipos algebraicos; el compilador obliga a tratar cada caso nuevo |
| M11 · Genéricos | Aplicación | Repositorio en memoria y canal de eventos genéricos para RutaFlow, con sus errores de compilación explicados uno a uno |
| M12 · Colecciones: uso con criterio | Aplicación | Índices de envíos por estado, ruta y fecha: elegir la colección por operación y demostrar el coste |
| M13 · Lambdas e interfaces funcionales | Aplicación | Motor de reglas de tarifa: cada regla es una función que se compone, sin `if` anidados |
| M14 · Streams | Aplicación | Informes de operación (envíos por ruta, tiempos medios, retrasos) escritos con bucles y con streams, comparando legibilidad y resultado |
| M15 · Entrada/salida y archivos | Aplicación | Importación y exportación de envíos en CSV y ZIP con carpetas vigiladas, sin perder datos si el proceso se corta |
| M16 · Empaquetar, configurar y ejecutar una aplicación | Aplicación | `rutaflow` como herramienta de línea de comandos: JAR ejecutable, configuración externa, registro y mensajes en dos idiomas |
| M17 · Pruebas en la JVM | Aplicación | La batería de pruebas de `rutaflow-nucleo`: unitarias, parametrizadas y de propiedades, con cobertura medida en el build de Gradle |
| M18 · Concurrencia I: hilos, tareas y datos compartidos | Aplicación | Ingesta concurrente de eventos de rastreo: primero con una carrera reproducible que pierde eventos y después corregida |
| M19 · Patrones de diseño con Java moderno | Aplicación | Refactor de `rutaflow-nucleo` a capas con puertos y adaptadores; tres patrones clásicos reescritos con lambdas y tipos sellados |
| M20 · Datos y red I: JDBC, HTTP y JSON | Aplicación | `rutaflow-nucleo` guarda envíos en PostgreSQL con JDBC, consulta un servicio de geocodificación con `HttpClient` y expone un puerto HTTP mínimo |
| M21 · Colecciones por dentro | Integración | Banco de pruebas de estructuras: memoria por elemento con JOL y tiempos con JMH para los índices de RutaFlow |
| M22 · Streams y lambdas por dentro | Integración | Informe de un millón de envíos: secuencial, paralelo y con gatherer propio, medidos y explicados |
| M23 · Concurrencia II: clases seguras, locks y sincronizadores | Integración | Reserva de capacidad de camiones bajo carga: invariantes protegidas, bloqueo mutuo provocado y diagnosticado con `jcmd` |
| M24 · Concurrencia III: ejecutores, asincronía e hilos virtuales | Integración | Servicio de cotización que consulta tres transportistas en paralelo con plazo total, cancelación y sin fugas de hilos |
| M25 · Módulos (JPMS) y distribución | Integración | `rutaflow-nucleo` modularizado en cuatro módulos, con un plugin cargado como servicio y una imagen de runtime propia creada con `jlink` |
| M26 · Reflexión, anotaciones y metaprogramación | Integración | Mini contenedor de inyección y validador por anotaciones para RutaFlow, y un procesador que genera código al compilar |
| M27 · E/S avanzada: NIO, canales y serialización | Integración | Registro de eventos de rastreo de solo anexar (append-only) sobre `FileChannel` y archivo mapeado, con recuperación tras un corte |
| M28 · Redes | Integración | Protocolo propio de rastreo sobre TCP con TLS, y un servidor que atiende diez mil conexiones con hilos virtuales, comparado con NIO |
| M29 · JDBC a fondo y acceso a datos sin framework | Integración | Capa de persistencia de RutaFlow con pool de conexiones, lotes y bloqueo optimista, medida contra PostgreSQL en contenedor |
| M30 · Seguridad en la plataforma Java | Integración | Firma y cifrado de manifiestos de carga, contraseñas derivadas correctamente y una revisión de código seguro de `rutaflow-nucleo` |
| M31 · APIs públicas, compatibilidad y librerías | Integración | `rutaflow-tarifas` publicado como librería: versión 1.0, cambio incompatible detectado por el build y versión 1.1 compatible |
| M32 · Java funcional avanzado | Integración | Validación de envíos que acumula errores sin excepciones y un DSL de reglas de tarifa |
| M33 · Bytecode y formato de clase | Experto | Un mismo método de tarifa compilado de seis maneras y leído con `javap`; una herramienta propia que lista las llamadas de un JAR con la Class-File API |
| M34 · Carga de clases, enlace, inicialización y arranque | Experto | Sistema de plugins de transportistas con aislamiento y descarga; arranque de `rutaflow` medido con y sin CDS y caché AOT |
| M35 · Memoria: objetos, áreas y referencias | Experto | Radiografía de memoria de RutaFlow: cuánto ocupa un envío, dónde vive y cuánta memoria nativa usa el proceso |
| M36 · Recolección de basura | Experto | La misma carga de RutaFlow con Serial, Parallel, G1, ZGC y Shenandoah: registros leídos, pausas comparadas y una fuga encontrada |
| M37 · Compilación JIT y ejecución | Experto | Un bucle de cálculo de rutas seguido desde el intérprete hasta C2: compilaciones, inlining y una desoptimización provocada |
| M38 · Modelo de memoria de Java y concurrencia sin bloqueos | Experto | Contador de eventos y cola de rastreo sin bloqueos, verificados con jcstress y comparados con sus versiones con `synchronized` |
| M39 · Rendimiento: método y medición | Experto | Campaña de rendimiento del cotizador: objetivo en percentiles, benchmark con JMH, grabación JFR y la mejora demostrada |
| M40 · Diagnóstico en producción | Experto | Tres incidentes provocados en RutaFlow (CPU al 100 %, hilos bloqueados y fuga nativa) resueltos con un guion y solo herramientas del JDK |
| M41 · Java en contenedores y operación del runtime | Experto | Imagen mínima de `rutaflow` con runtime de `jlink` y caché AOT; límites de memoria y CPU comprobados y apagado ordenado demostrado |
| M42 · Interoperar con código nativo | Experto | Enlace a una librería C real (compresión o geodesia) con la FFM API y `jextract`, comparado con JNI en seguridad y tiempo |
| M43 · Evolución de Java y criterio de experto | Experto | El mismo módulo de RutaFlow llevado de Java 8 a 25 confirmación a confirmación; ficha de una JEP en preview leída y probada |
## 5. Decisiones que debe tomar el dueño

- **D1 · Tamaño.** Aprobar 279 temas en 44 módulos (hoy 120 en 23), unas 186 h más el proyecto, o indicar qué
  módulos recortar. Los candidatos a recorte con menos pérdida son M32 (funcional avanzado) y M43 (evolución).
- **D2 · Dueño de las pruebas.** Propuesta: Java es dueño de las pruebas en la JVM (JUnit, Mockito, AssertJ,
  propiedades, concurrencia; M17 y M24 T7) y Spring lo es de las de integración con Testcontainers y slices.
  Alternativa: un curso propio de pruebas.
- **D3 · Patrones de diseño.** Propuesta: quedan en Java (M19, 6 temas) y se reescriben con
  lambdas, records y tipos sellados. Alternativa: moverlos a Diseño de sistemas o a un curso propio.
- **D4 · JPA fuera de Java.** Confirmar que los 8 temas de JPA/Hibernate pasan a Spring y que Java termina en
  JDBC a fondo (M29).
- **D5 · Funciones no definitivas.** Propuesta: se enseñan las 7 marcadas (preview, incubación y experimental)
  con aviso en el título y opción activada en el build. Alternativa: dejarlas fuera hasta que sean definitivas
  (M24 T6, Structured Concurrency, está en el alcance mínimo de la spec).
- **D6 · Temas descartados.** Confirmar que quedan fuera XML, Swing/JavaFX, RMI, JSP/Servlets y el curso completo
  de algoritmos (sección 2.2), o pedir alguno.
- **D7 · Bibliotecas de terceros y contenedor en los laboratorios.** Confirmar que Jackson, SLF4J/Logback y
  HikariCP se enseñan en Java como dueño, y que desde M20 los laboratorios pueden pedir `docker compose up` para
  PostgreSQL antes de que el estudiante haya hecho el curso de Docker.
- **D8 · Proyecto guía.** Aprobar `rutaflow-nucleo` (RutaFlow en Java puro, base del curso de Spring) o elegir
  otro dominio.

## 6. Fuentes consultadas

Consultadas el 2026-11-20. De cada una se tomó solo la lista de temas (hechos), nunca su texto. La columna
«Abrev.» es la que usa la tabla del temario.

### 6.1 Documentación y especificación oficiales

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| DJ | [dev.java · Learn](https://dev.java/learn/) | Secciones y tutoriales de la ruta oficial de aprendizaje |
| JLS | [The Java Language Specification, Java SE 25](https://docs.oracle.com/javase/specs/jls/se25/html/index.html) | Índice: capítulos 1–19 y sus secciones |
| JVMS | [The Java Virtual Machine Specification, Java SE 25](https://docs.oracle.com/javase/specs/jvms/se25/html/index.html) | Índice: capítulos 1–7 y sus secciones |
| API | [Javadoc de `java.base`, JDK 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/module-summary.html) | Lista de los 58 paquetes exportados |
| MAN | [Especificaciones de las herramientas del JDK 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/index.html) | Lista de herramientas (`java`, `javac`, `javap`, `jcmd`, `jfr`, `jlink`, `jpackage`, `jdeps`, `jdeprscan`, `jnativescan`, `jhsdb`, `jshell`, `jwebserver`, `keytool`, `jarsigner`, etc.) |
| JEP n · JDK25 | [JEPs in JDK 25 integrated since JDK 21](https://openjdk.org/projects/jdk/25/jeps-since-jdk-21) | Número, título, versión y categoría de las 39 JEP entre JDK 22 y 25 |
| JDK25 | [Anuncio «Java 25 / JDK 25: General Availability» (jdk-dev)](https://mail.openjdk.org/pipermail/jdk-dev/2025-September/010483.html) | Lista definitiva de las 18 JEP de JDK 25 |
| JDK25 | [Página del proyecto JDK 25](https://openjdk.org/projects/jdk/25/) | Fecha de disponibilidad general (ver 6.7: la lista de JEP llegó incompleta) |
| VER | `docs/VERSIONES.md` (repositorio) | Versiones fijadas de la academia |

### 6.2 Libros de referencia (índices)

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| CJ1 | Horstmann, *Core Java, Volume I: Fundamentals*, 13.ª ed. — [índice en InformIT](https://www.informit.com/store/core-java-volume-i-fundamentals-9780135328378) | Capítulos 1–12 y secciones |
| CJ2 | Horstmann, *Core Java, Volume II: Advanced Features*, 13.ª ed. — [índice en InformIT](https://www.informit.com/store/core-java-volume-ii-advanced-features-13th-edition-9780135371749) | Capítulos 1–13 y secciones |
| EJ | Bloch, *Effective Java*, 3.ª ed. — [índice en O'Reilly](https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/) | Capítulos y los 90 ítems (se citan por número de ítem) |
| JCiP | Goetz et al., *Java Concurrency in Practice* — [índice en jcip.net](https://jcip.net/contents.html) | Partes y capítulos (se citan por título, porque la página no los numera) |
| MJiA | Urma, Fusco y Mycroft, *Modern Java in Action* — [índice en O'Reilly](https://www.oreilly.com/library/view/modern-java-in/9781617293566/) | Partes, capítulos 1–21 y apéndices |
| JP | Oaks, *Java Performance*, 2.ª ed. — [índice en O'Reilly](https://www.oreilly.com/library/view/java-performance-2nd/9781492056102/) | Capítulos 1–12, secciones y apéndice A |
| OCNJ | Evans y Gough, *Optimizing Cloud Native Java*, 2.ª ed. (sucesor de *Optimizing Java*) — [índice en O'Reilly](https://www.oreilly.com/library/view/optimizing-cloud-native/9781098149338/) | Capítulos 1–15 y apéndices A y B |

### 6.3 Certificación

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| OCP n | Objetivos del examen Oracle 1Z0-830 (Java SE 21 Developer Professional), según la transcripción de [Enthuware](https://enthuware.com/oca-ocp-java-certification-resources/290-ocp-java-21-exam-syllabus) | Las 10 áreas de objetivos (se citan por número de área). La página oficial de Oracle no se pudo abrir (6.7) |
| — | Guía de estudio OCP Java SE 21 (Sybex) — [índice en O'Reilly](https://www.oreilly.com/library/view/ocp-oracle-certified/9781394286614/f08.xhtml) | Capítulos 1–14, para contrastar la transcripción anterior |
| — | Mughal y Strelnikov, guía del programador OCP 1Z0-830/1Z0-829 — [índice en Pearson](https://www.pearson.com/en-us/subject-catalog/p/ocp-oracle-certified-professional-java-se-21-developer-exam-1z0-830-java-se-17-developer-exam-1z0-829-programmers-guide/P200000013826/9780135446034) | Capítulos de las dos partes |

### 6.4 Sílabos de universidades y bootcamps

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| MOOC p.n | Universidad de Helsinki, [Java Programming I y II](https://java-programming.mooc.fi/) | Estructura en 14 partes y secciones de las partes [1](https://java-programming.mooc.fi/part-1), [8](https://java-programming.mooc.fi/part-8), [9](https://java-programming.mooc.fi/part-9), [10](https://java-programming.mooc.fi/part-10) y [12](https://java-programming.mooc.fi/part-12) |
| MIT | MIT OpenCourseWare, [6.005 Software Construction (primavera de 2016), lecturas](https://ocw.mit.edu/courses/6-005-software-construction-spring-2016/pages/readings/) | Títulos de las 27 lecturas |
| 61B | UC Berkeley, [CS 61B Data Structures (primavera de 2024)](https://sp24.datastructur.es/) | Temas de las 40 clases |
| PLZ | Platzi, [Curso de Java avanzado](https://platzi.com/cursos/java-avanzado/) | Secciones del temario |

### 6.5 Cursos largos de YouTube y plataformas

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| YT-ES | «Curso Java» en español, 255 vídeos y unas 71 horas, [listado en Cursa](https://cursa.app/es/curso-gratis/java-desde-0-eai). La página no nombra el canal de YouTube | Los 18 grupos de temas (POO, Swing, eventos, despliegue, excepciones, E/S, genéricos, hilos, colecciones, sockets, JDBC, JSP, servlets) |
| YT-EN | Amigoscode, «Java Full Course», 48 vídeos — [listado en Class Central](https://classcentral.com/classroom/youtube-java-full-course-new-92913) | Temas de los vídeos |
| YT-EN | freeCodeCamp.org, curso de Java de unas 4 horas de Farhan Hasin Chowdhury — [artículo del curso](https://www.freecodecamp.org/news/learn-java-programming/) | Lista de temas |

Los dos cursos en inglés que se pudieron abrir terminan en la introducción a objetos: confirman el orden de
Fundamentos, no el alcance. El curso en español llega a JDBC, sockets e hilos, pero dedica más de un tercio a
Swing, applets, JSP y servlets, que este temario deja fuera (sección 2.2).

### 6.6 Rutas públicas y entrevistas de nivel sénior

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| RM | [Java Roadmap de java-journey.com](https://java-journey.com/java-roadmap/) | Las 24 paradas de sus 6 etapas. Sustituye a roadmap.sh, cuyos nodos no se pudieron leer (6.7) |
| ENT | DataCamp, [preguntas de entrevista de Java](https://www.datacamp.com/blog/java-interview-questions) | Los 61 temas de pregunta por nivel (júnior, intermedio, sénior y Java 17–21) |
| ENT | techinterview.org, [Java Interview Questions: JVM Internals, Concurrency, and Design Patterns](https://www.techinterview.org/post/3233460836/java-interview-questions-advanced/) | Los 9 temas (áreas de memoria, G1 y ZGC, modelo de memoria, utilidades de concurrencia, hilos virtuales, borrado de tipos, `equals`/`hashCode`, patrones, cadenas) |

### 6.7 Fuentes que no se pudieron abrir o llegaron incompletas

| Fuente | Qué pasó | Cómo se cubrió |
|---|---|---|
| [roadmap.sh/java](https://roadmap.sh/java) | La página se abrió, pero su contenido legible no incluye los nodos de la ruta (se dibujan aparte). El repositorio en GitHub rechazó la lectura automática | Se usó otra ruta pública (RM) y las listas de entrevista. **Pendiente:** revisar los nodos de roadmap.sh a mano antes de aprobar |
| Página oficial de Oracle del examen 1Z0-830 (`education.oracle.com`) | Error del sitio al abrirla | Transcripción de los objetivos en Enthuware, contrastada con los índices de dos guías de estudio. **Pendiente:** contrastar con la página oficial |
| [Página del proyecto JDK 25](https://openjdk.org/projects/jdk/25/) | La lectura devolvió una lista parcial (13 JEP, varias como «propuestas») que no coincide con la entrega final | La lista de JEP se tomó de «JEPs since JDK 21» y del anuncio de disponibilidad general (18 JEP), que coinciden entre sí |
| Índice general de JEP (`openjdk.org/jeps/0`) | La lectura no devolvió la lista | Por eso los números de JEP de JDK 21 y anteriores no se citan (sección 1.4, regla 2) |
| *Core Java*, 14.ª edición | No se abrió su índice | Se usó la 13.ª edición de los dos volúmenes |
| *Modern Java in Action* en manning.com y su vista previa | Sin índice en el contenido legible | Índice tomado de O'Reilly |
| *Effective Java* en InformIT | Solo capítulos, sin ítems | Ítems tomados de O'Reilly |
| Objetivos del examen en el apéndice de la guía de Pearson (O'Reilly) | Contenido truncado: solo dos objetivos | Enthuware |
| MOOC.fi, partes 2–7, 11, 13 y 14 | No se abrieron una a una | Se usaron las partes 1, 8, 9, 10 y 12 |
| Udemy (cursos «de cero a experto» en español e inglés) | Error del sitio al abrir las páginas de curso | Se usaron los listados de Cursa, Class Central, freeCodeCamp y Platzi |
| Canal del curso en español de 255 vídeos | El listado no nombra el canal | Se cita el listado; **pendiente** identificar el canal |

## Anexo A · Destino de los 120 temas actuales

Numeración de la columna «Tema actual»: la de hoy. Numeración de «Java objetivo»: la de la sección 2.

| Tema actual | Título | Destino |
|---|---|---|
| M0 T1 | Del código fuente a la JVM | Java objetivo: M0 T3 |
| M0 T2 | JDK, JRE y JVM | Java objetivo: M0 T1 |
| M0 T3 | public static void main — qué significa cada palabra | Java objetivo: M0 T4 |
| M0 T4 | Tipos primitivos vs referencias | Java objetivo: M1 T1, M1 T2 |
| M0 T5 | Variables, conversiones y `String` | Java objetivo: M1 T1, M1 T3, M1 T4, M2 T1 |
| M0 T6 | Operadores, precedencia y control de flujo | Java objetivo: M1 T5, M3 T1, M3 T2, M3 T3 |
| M0 T7 | Arreglos, wrappers y paso de argumentos | Java objetivo: M3 T4, M4 T1, M4 T5 |
| M0 T8 | Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`) | Java objetivo: M2 T6, M8 T1, M8 T3 |
| M0 T9 | Java 25 para programas pequeños: `IO`, archivos compactos e `import module` | Java objetivo: M0 T4, M0 T5, M2 T6, M5 T5 |
| M1 T1 | Clases, objetos, constructores y encapsulación | Java objetivo: M5 T1, M5 T2 |
| M1 T2 | Herencia y sobreescritura | Java objetivo: M6 T1, M6 T2 |
| M1 T3 | Interfaces, clases abstractas y cuándo usar cada una | Java objetivo: M6 T3, M6 T4 |
| M1 T4 | Sobrecarga vs sobreescritura, y modificadores de acceso | Java objetivo: M3 T4, M5 T3, M6 T5 |
| M1 T5 | record — modelos inmutables sin boilerplate | Java objetivo: M5 T7, M9 T2 |
| M1 T6 | Constructores flexibles (Java 25): validar y preparar antes de `super(...)` | Java objetivo: M9 T3 |
| M2 T1 | List, Set, Map y sus implementaciones | Java objetivo: M4 T4, M12 T1, M12 T2, M12 T3 |
| M2 T2 | El contrato de equals y hashCode | Java objetivo: M5 T6, M9 T1 |
| M2 T3 | Claves mutables y el mapa que pierde entradas | Java objetivo: M21 T3 |
| M2 T4 | Genéricos, wildcards y type erasure | Java objetivo: M11 T1, M11 T2, M11 T3 |
| M2 T5 | Comparable vs Comparator, e iteración | Java objetivo: M12 T5, M12 T6 |
| M2 T6 | Colas y pilas: `Queue`, `Deque`, `ArrayDeque` y `PriorityQueue` | Java objetivo: M12 T4 |
| M3 T1 | Checked vs unchecked exceptions | Java objetivo: M7 T1, M7 T2 |
| M3 T2 | try-with-resources | Java objetivo: M7 T3 |
| M3 T3 | Excepciones personalizadas y no tragar excepciones | Java objetivo: M7 T4 |
| M4 T1 | Stream API — map, filter, reduce, collect | Java objetivo: M14 T1 |
| M4 T2 | Optional — evitar null explícitamente | Java objetivo: M13 T5 |
| M4 T3 | Stream Gatherers (Java 24) | Java objetivo: M14 T6 |
| M4 T4 | Streams paralelos y referencias a métodos | Java objetivo: M13 T3, M22 T3 |
| M5 T1 | ExecutorService y gestión de hilos | Java objetivo: M18 T4 |
| M5 T2 | CompletableFuture | Java objetivo: M24 T4 |
| M5 T3 | Virtual threads | Java objetivo: M18 T7, M24 T5 |
| M5 T4 | Condiciones de carrera y sincronización | Java objetivo: M18 T2 |
| M5 T5 | Structured Concurrency (StructuredTaskScope, Java 25) | Java objetivo: M24 T6 |
| M5 T6 | Scoped Values frente a ThreadLocal (Java 25) | Java objetivo: M23 T7 |
| M5 T7 | Timeouts y cancelación cooperativa sin abandonar recursos | Java objetivo: M18 T5 |
| M6 T1 | NIO.2 — Path y Files | Java objetivo: M15 T2 |
| M6 T2 | Serialización con Jackson | Java objetivo: M20 T4 |
| M6 T3 | Archivos grandes y recursos del classpath | Java objetivo: M15 T4 |
| M7 T1 | sealed — jerarquías cerradas y exhaustividad | Java objetivo: M10 T1 |
| M7 T2 | Pattern matching exhaustivo y para instanceof | Java objetivo: M6 T2, M10 T2 |
| M7 T3 | Unnamed variables y patterns (_, Java 22) | Java objetivo: M10 T4 |
| M8 T1 | pom.xml vs build.gradle.kts | Java objetivo: M0 T7 · Curso **Gradle** (comparación Maven/Gradle). En Java queda solo el uso del wrapper (M0 T7) |
| M8 T2 | Ciclo de vida de build y scopes | Curso **Gradle** (ciclo de vida y configuraciones de dependencias); la parte de Maven, como alternativa dentro de Gradle |
| M8 T3 | Proyectos multi-módulo | Curso **Gradle** (multi-proyecto) |
| M8 T4 | Maven y Gradle lado a lado — el mismo proyecto en dos herramientas | Curso **Gradle** (Maven como alternativa, lado a lado) |
| M9 T1 | JUnit 6 (Jupiter) — anotaciones y ciclo de vida | Java objetivo: M17 T1 |
| M9 T2 | Mockito — aislar dependencias | Java objetivo: M17 T3 |
| M9 T3 | Tests parametrizados y cobertura | Java objetivo: M17 T2 |
| M9 T4 | Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada | Java objetivo: M17 T5 |
| M10 T1 | module-info.java y encapsulación fuerte | Java objetivo: M25 T1 |
| M10 T2 | Migración incremental y cuándo JPMS aporta valor | Java objetivo: M25 T5 |
| M10 T3 | opens para acceso reflexivo controlado de frameworks | Java objetivo: M25 T2 |
| M11 T1 | Generaciones de memoria y recolectores | Java objetivo: M35 T1, M36 T1 |
| M11 T2 | Java Flight Recorder y JIT compilation | Java objetivo: M37 T1, M39 T3 |
| M11 T3 | Referencias especiales y heap dumps | Java objetivo: M35 T5, M36 T7, M40 T3 |
| M11 T4 | Foreign Function & Memory API (Java 22) | Java objetivo: M42 T1 |
| M12 T1 | Builder — configuración paso a paso y validación | Java objetivo: M9 T6, M19 T2 |
| M12 T2 | Factory Method y Strategy | Java objetivo: M19 T2, M19 T4 |
| M12 T3 | Abstract Factory y familias de productos compatibles | Java objetivo: M19 T2 |
| M12 T4 | SOLID y cuándo NO aplicar un patrón | Java objetivo: M19 T1 |
| M12 T5 | Prototype: copiar un objeto sin compartir sus datos | Java objetivo: M19 T2 |
| M12 T6 | Patrones estructurales para conectar piezas existentes | Java objetivo: M19 T3 |
| M13 T1 | Arquitectura por capas del proyecto integrador | Java objetivo: M19 T6 |
| M13 T2 | Build reproducible y cierre del track | Curso **Gradle** (builds reproducibles) |
| M13 T3 | Integrando concurrencia, modelado y testing | Proyecto final de Java (sección 4); no es un tema |
| M14 T1 | Compartir memoria requiere orden y visibilidad | Java objetivo: M18 T3, M38 T1 |
| M14 T2 | La JVM optimiza y puede invalidar un cronómetro ingenuo | Java objetivo: M39 T2 |
| M14 T3 | Deserializar es permitir construcción y comportamiento | Java objetivo: M27 T6 |
| M14 T4 | El runtime es parte del artefacto y necesita ciclo de vida | Java objetivo: M25 T6, M41 T2 |
| M14 T5 | Arranque más rápido: archivos CDS y la caché AOT | Java objetivo: M34 T4, M34 T5 |
| M14 T6 | Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps | Java objetivo: M31 T6 |
| M15 T1 | Maven avanzado | Curso **Gradle**, apartado «Maven como alternativa» |
| M15 T2 | Gradle y builds reproducibles | Curso **Gradle** (builds reproducibles) |
| M15 T3 | Proyectos multi-módulo sin ciclos | Curso **Gradle** (multi-proyecto sin ciclos) |
| M15 T4 | JUnit 6, Mockito y assertions expresivas | Java objetivo: M17 T1, M17 T4 |
| M15 T5 | Pruebas de integración reproducibles | Curso **Spring** (pruebas de integración con Testcontainers); ver decisión D2 |
| M15 T6 | SLF4J, Logback, MDC y logging estructurado | Java objetivo: M16 T3 |
| M16 T1 | Entidades y relaciones JPA | Curso **Spring** (Data y JPA a fondo) |
| M16 T2 | Relaciones uno a uno, muchos a muchos y herencia | Curso **Spring** (Data y JPA a fondo) |
| M16 T3 | Ciclo de vida, EntityManager y consultas tipadas | Curso **Spring** (Data y JPA a fondo) |
| M16 T4 | Búsquedas dinámicas con Criteria y Querydsl | Curso **Spring** (Data y JPA a fondo) |
| M16 T5 | FetchType.LAZY, EAGER y el problema N+1 | Curso **Spring** (Data y JPA a fondo) |
| M16 T6 | EntityGraph y cachés de persistencia | Curso **Spring** (Data y JPA a fondo) |
| M16 T7 | Concurrencia, transacciones y propagación | Curso **Spring** (transacciones y propagación) |
| M16 T8 | Migraciones y pruebas JPA con Testcontainers | Curso **Spring** (migraciones y pruebas JPA con Testcontainers) |
| M17 T1 | JDBC, PreparedStatement y DAO | Java objetivo: M20 T1, M29 T5 |
| M17 T2 | Transacciones, ACID y aislamiento | Java objetivo: M20 T2, M29 T4 |
| M18 T1 | HttpClient, REST, timeouts y fallos | Java objetivo: M20 T3, M28 T4 |
| M18 T2 | Tokens, validación y límites de seguridad | Java objetivo: M30 T5 |
| M18 T3 | Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos | Java objetivo: M30 T1 |
| M19 T1 | Reflexión y anotaciones en tiempo de ejecución | Java objetivo: M26 T1, M26 T2 |
| M19 T2 | Expresiones regulares con Pattern y Matcher | Java objetivo: M15 T7 |
| M19 T3 | Dinero exacto con BigDecimal | Java objetivo: M8 T4 |
| M19 T4 | Assertions y diseño por contrato | Java objetivo: M17 T6 |
| M19 T5 | ServiceLoader: plugins sin acoplar implementaciones | Java objetivo: M19 T5, M25 T4 |
| M19 T6 | Internacionalización: números, monedas, fechas y orden de texto | Java objetivo: M16 T4 |
| M19 T7 | Proxies dinámicos: así funcionan @Transactional y los mocks | Java objetivo: M26 T4 |
| M19 T8 | Carga de clases: cargadores, delegación y plugins con URLClassLoader | Java objetivo: M34 T1 |
| M19 T9 | MethodHandles y VarHandles: invocar métodos y cambiar campos con acceso tipado | Java objetivo: M26 T5, M38 T4 |
| M20 T1 | Las cuatro formas: Predicate, Function, Consumer y Supplier | Java objetivo: M13 T1, M13 T2 |
| M20 T2 | Function y BiFunction: transformar uno o dos datos | Java objetivo: M13 T2 |
| M20 T3 | Componer sin anidar: andThen, compose, negate y reglas encadenadas | Java objetivo: M13 T4 |
| M20 T4 | Streams como composición: pereza, orden y efectos que se esconden | Java objetivo: M14 T1, M22 T4 |
| M20 T5 | UnaryOperator y BinaryOperator: la salida conserva el tipo | Java objetivo: M13 T2 |
| M20 T6 | Referencias a métodos: escribir la operación sin repetirla | Java objetivo: M13 T3 |
| M20 T7 | Optional: buscar un envío que puede no existir | Java objetivo: M13 T5 |
| M20 T8 | Streams intermedios: filtrar, transformar, aplanar y ordenar | Java objetivo: M14 T2 |
| M20 T9 | Streams terminales: encontrar, contar y combinar resultados | Java objetivo: M14 T3 |
| M20 T10 | Collectors: formar listas, mapas, grupos y texto | Java objetivo: M14 T4 |
| M20 T11 | Streams paralelos: comparar antes de acelerarlos | Java objetivo: M22 T3 |
| M20 T12 | Pureza y efectos: calcular separado de guardar o imprimir | Java objetivo: M13 T6, M22 T4 |
| M20 T13 | Flow API: publicar datos con demanda y cierre | Java objetivo: M22 T6 |
| M21 T1 | Qué es la superficie pública de una API | Java objetivo: M31 T1 |
| M21 T2 | Compatibilidad binaria frente a compatibilidad de fuente | Java objetivo: M31 T2 |
| M21 T3 | Evolucionar sin romper: default methods, deprecación y retirada | Java objetivo: M13 T7, M31 T3 |
| M21 T4 | Genéricos, borrado y métodos puente en la superficie pública | Java objetivo: M11 T3 |
| M21 T5 | Verificar la compatibilidad en el build | Java objetivo: M31 T4 |
| M22 T1 | Copia defensiva, copia superficial y clone | Java objetivo: M9 T4 |
| M22 T2 | Enums de dominio: estado, código y comportamiento | Java objetivo: M6 T7, M9 T7 |
| M22 T3 | Clases anidadas, this$0 y la referencia que retiene | Java objetivo: M9 T5 |
