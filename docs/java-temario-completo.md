# Java — temario completo y reporte de cobertura

> Estado del trabajo: inventario completo de la estructura base (21 módulos) y expansión en curso. Este documento refleja lo que existe en los archivos del curso; no convierte la presencia de un título o de un hito en prueba de que todos sus ejemplos se ejecutaron o de que cada tema ya cumple la atomicidad solicitada.

## Portada

- **Track:** Java, desde fundamentos hasta integración profesional.
- **Proyecto continuo:** RutaFlow, con utilidades de dominio, persistencia, servicios HTTP, reglas y reportes.
- **Duración:** la duración por módulo está en el catálogo Angular; la estimación agregada queda pendiente de reconciliar tras la atomización de todos los temas.
- **Prerrequisito:** ninguno para M0. Cada módulo declara sus dependencias locales; verificar explícitamente la cadena entre módulos forma parte del trabajo pendiente.
- **Contenido oficial:** [`web/public/content/java/`](../web/public/content/java/).

## Índice y temas preservados

Los títulos siguientes salen de los Markdown del track. Son un inventario de cobertura; las rutas abren el contenido ejecutable de cada módulo.

### M0 · Módulo 0: Sintaxis, tipos y el modelo de la JVM

Lección: [`modulo-0.md`](../web/public/content/java/modulo-0.md) · 8 temas.

- Tema 1: Del código fuente a la JVM
- Tema 2: public static void main — qué significa cada palabra
- Tema 3: JDK, JRE y JVM
- Tema 4: Tipos primitivos vs referencias
- Tema 5: Variables, conversiones y `String`
- Tema 6: Operadores, precedencia y control de flujo
- Tema 7: Arreglos, wrappers y paso de argumentos
- Tema 8: Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`)

### M1 · Módulo 1: Programación orientada a objetos

Lección: [`modulo-1.md`](../web/public/content/java/modulo-1.md) · 4 temas.

- Tema 1: Clases, objetos, constructores y encapsulación
- Tema 2: Herencia y sobreescritura
- Tema 3: Interfaces, clases abstractas y cuándo usar cada una
- Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso

### M2 · Módulo 2: Colecciones y genéricos

Lección: [`modulo-2.md`](../web/public/content/java/modulo-2.md) · 3 temas.

- Tema 1: List, Set, Map y sus implementaciones
- Tema 2: Genéricos, wildcards y type erasure
- Tema 3: Comparable vs Comparator, e iteración

### M3 · Módulo 3: Excepciones y manejo de recursos

Lección: [`modulo-3.md`](../web/public/content/java/modulo-3.md) · 3 temas.

- Tema 1: Checked vs unchecked exceptions
- Tema 2: try-with-resources
- Tema 3: Excepciones personalizadas y no tragar excepciones

### M4 · Módulo 4: Streams y programación funcional

Lección: [`modulo-4.md`](../web/public/content/java/modulo-4.md) · 4 temas.

- Tema 1: Stream API — map, filter, reduce, collect
- Tema 2: Optional — evitar null explícitamente
- Tema 3: Streams paralelos y referencias a métodos
- Tema 4: Stream Gatherers (Java 24)

### M5 · Módulo 5: Concurrencia — hilos y virtual threads

Lección: [`modulo-5.md`](../web/public/content/java/modulo-5.md) · 7 temas.

- Tema 1: ExecutorService y gestión de hilos
- Tema 2: CompletableFuture
- Tema 3: Virtual threads
- Tema 4: Condiciones de carrera y sincronización
- Tema 5: Structured Concurrency (StructuredTaskScope, Java 25)
- Tema 6: Scoped Values frente a ThreadLocal (Java 25)
- Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos

### M6 · Módulo 6: I/O, NIO.2 y serialización

Lección: [`modulo-6.md`](../web/public/content/java/modulo-6.md) · 3 temas.

- Tema 1: NIO.2 — Path y Files
- Tema 2: Serialización con Jackson
- Tema 3: Archivos grandes y recursos del classpath

### M7 · Módulo 7: Records, sealed classes y pattern matching

Lección: [`modulo-7.md`](../web/public/content/java/modulo-7.md) · 4 temas.

- Tema 1: record — modelos inmutables sin boilerplate
- Tema 2: sealed — jerarquías cerradas y exhaustividad
- Tema 3: Pattern matching exhaustivo y para instanceof
- Tema 4: Unnamed variables y patterns (_, Java 22)

### M8 · Módulo 8: Build tools — Maven y Gradle

Lección: [`modulo-8.md`](../web/public/content/java/modulo-8.md) · 4 temas.

- Tema 1: pom.xml vs build.gradle.kts
- Tema 2: Ciclo de vida de build y scopes
- Tema 3: Proyectos multi-módulo
- Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas

### M9 · Módulo 9: Testing con JUnit 5 y Mockito

Lección: [`modulo-9.md`](../web/public/content/java/modulo-9.md) · 3 temas.

- Tema 1: JUnit 5 — anotaciones y ciclo de vida
- Tema 2: Mockito — aislar dependencias
- Tema 3: Tests parametrizados y cobertura

### M10 · Módulo 10: Módulos (JPMS) y proyectos grandes

Lección: [`modulo-10.md`](../web/public/content/java/modulo-10.md) · 3 temas.

- Tema 1: module-info.java y encapsulación fuerte
- Tema 2: Migración incremental y cuándo JPMS aporta valor
- Tema 3: `opens` para acceso reflexivo controlado de frameworks

### M11 · Módulo 11: JVM interna — GC, profiling y JIT

Lección: [`modulo-11.md`](../web/public/content/java/modulo-11.md) · 4 temas.

- Tema 1: Generaciones de memoria y recolectores
- Tema 2: Java Flight Recorder y JIT compilation
- Tema 3: Referencias especiales y heap dumps
- Tema 4: Foreign Function & Memory API (Java 22)

### M12 · Módulo 12: Buenas prácticas y patrones de diseño

Lección: [`modulo-12.md`](../web/public/content/java/modulo-12.md) · 6 temas.

- Tema 1: Builder — configuración paso a paso y validación
- Tema 2: Factory Method y Strategy
- Tema 3: Abstract Factory y familias de productos compatibles
- Tema 4: SOLID y cuándo NO aplicar un patrón
- Tema 5: Prototype: copiar un objeto sin compartir sus datos
- Tema 6: Patrones estructurales para conectar piezas existentes

### M13 · Módulo 13: Proyecto integrador

Lección: [`modulo-13.md`](../web/public/content/java/modulo-13.md) · 3 temas.

- Tema 1: Arquitectura por capas del proyecto integrador
- Tema 2: Integrando concurrencia, modelado y testing
- Tema 3: Build reproducible y cierre del track

### M14 · Módulo 14: Java en producción — memoria, benchmarks y runtime seguro

Lección: [`modulo-14.md`](../web/public/content/java/modulo-14.md) · 4 temas.

- Tema 1: Compartir memoria requiere orden y visibilidad
- Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo
- Tema 3: Deserializar es permitir construcción y comportamiento
- Tema 4: El runtime es parte del artefacto y necesita ciclo de vida

### M15 · Módulo 15: Java Master — builds, pruebas y observabilidad

Lección: [`modulo-15.md`](../web/public/content/java/modulo-15.md) · 6 temas.

- Tema 1: Maven avanzado
- Tema 2: Gradle y builds reproducibles
- Tema 3: Proyectos multi-módulo sin ciclos
- Tema 4: JUnit 5, Mockito y assertions expresivas
- Tema 5: Pruebas de integración reproducibles
- Tema 6: SLF4J, Logback, MDC y logging estructurado

### M16 · Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

Lección: [`modulo-16.md`](../web/public/content/java/modulo-16.md) · 8 temas.

- Tema 1: Entidades y relaciones JPA
- Tema 2: FetchType.LAZY, EAGER y el problema N+1
- Tema 3: Relaciones uno a uno, muchos a muchos y herencia
- Tema 4: Ciclo de vida, EntityManager y consultas tipadas
- Tema 5: Búsquedas dinámicas con Criteria y Querydsl
- Tema 6: EntityGraph y cachés de persistencia
- Tema 7: Concurrencia, transacciones y propagación
- Tema 8: Migraciones y pruebas JPA con Testcontainers

### M17 · Módulo 17: JDBC, DAO y transacciones

Lección: [`modulo-17.md`](../web/public/content/java/modulo-17.md) · 2 temas.

- Tema 1: JDBC, PreparedStatement y DAO
- Tema 2: Transacciones, ACID y aislamiento

### M18 · Módulo 18: HTTP, seguridad y backend con Java

Lección: [`modulo-18.md`](../web/public/content/java/modulo-18.md) · 2 temas.

- Tema 1: HttpClient, REST, timeouts y fallos
- Tema 2: Tokens, validación y límites de seguridad

### M19 · Módulo 19: Java del día a día — reflexión, regex, dinero, contratos, plugins e i18n

Lección: [`modulo-19.md`](../web/public/content/java/modulo-19.md) · 7 temas.

- Tema 1: Reflexión y anotaciones en tiempo de ejecución
- Tema 2: Expresiones regulares con Pattern y Matcher
- Tema 3: Dinero exacto con BigDecimal
- Tema 4: Assertions y diseño por contrato
- Tema 5: ServiceLoader: plugins sin acoplar implementaciones
- Tema 6: Proxies dinámicos: así funcionan @Transactional y los mocks
- Tema 7: Internacionalización: números, monedas, fechas y orden de texto

### M20 · Módulo 20: Java funcional — interfaces que componen comportamiento

Lección: [`modulo-20.md`](../web/public/content/java/modulo-20.md) · 13 temas.

- Tema 1: Las cuatro formas: Predicate, Function, Consumer y Supplier
- Tema 2: Componer sin anidar: andThen, compose, negate y reglas encadenadas
- Tema 3: Streams como composición: pereza, orden y efectos que se esconden
- Tema 4: Function y BiFunction: transformar uno o dos datos
- Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo
- Tema 6: Referencias a métodos: escribir la operación sin repetirla
- Tema 7: Optional: buscar un envío que puede no existir
- Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar
- Tema 9: Streams terminales: encontrar, contar y combinar resultados
- Tema 10: Collectors: formar listas, mapas, grupos y texto
- Tema 11: Streams paralelos: comparar antes de acelerarlos
- Tema 12: Pureza y efectos: calcular separado de guardar o imprimir
- Tema 13: Flow API: publicar datos con demanda y cierre

## Hitos del track

El cierre integrador se conserva en cada módulo y en el proyecto Java del catálogo. Evidencias exigibles al terminar el track: código que compila y corre, pruebas repetibles, diagnóstico de un fallo reproducido, decisiones de diseño justificadas y README que permita repetir el recorrido. La suma de marcas de finalización no certifica dominio.

## Reporte de exhaustividad

- **Módulos base preservados:** 21/21 (M0–M20).
- **Temas estructurales encontrados:** 101; no se quitaron temas para esta expansión.
- **M20:** 13 temas, cada uno con tres subtemas accionables de 5–15 minutos. Se ejecutaron 39 archivos Java completos de sus ejemplos y subtemas; `Exigir.java` y `UnaVez.java` producen intencionalmente las excepciones documentadas.
- **M18:** se ampliaron sus dos temas a cuatro subtemas prácticos cada uno. Los ocho ejemplos nuevos se ejecutaron con servidores locales; los fallos 404 se comprueban deliberadamente.
- **M17:** los dos temas ya tienen tres subtemas cada uno. La suite JDBC ejecutó tres pruebas (búsqueda parametrizada, commit y rollback); el ejemplo de allowlist imprimió la consulta permitida y rechazó una opción hostil.
- **Cobertura atómica medida:** 21/101 temas numerados tienen 3–6 encabezados `Subtema`; son M17, M18 y M20. Los otros 80 temas requieren expansión. Los siete pasos de una lección son una estructura parental y no cuentan por sí solos como subtemas atómicos completos.
- **Diferencia con el esqueleto del prompt:** el prompt reserva M19 para Java funcional y M20 para el proyecto. En este repositorio M19 es “Java del día a día”, M20 contiene Java funcional y el proyecto aparece en M13 y en laboratorios transversales. No se eliminó ni renumeró contenido; queda pendiente reconciliar la secuencia y dar al capstone la ubicación que pide el prompt.
- **Ejecución de ejemplos:** no se afirma que todos los ejemplos de todos los módulos hayan sido ejecutados. Las pruebas de laboratorios se reportan por separado.
- **Pruebas de navegador y revisión pedagógica humana:** separadas de la auditoría estructural; pendientes para validar el recorrido completo de Java.

### Cotejo con fuentes

| Fuente | Temas que exige o enfatiza | Cotejo visible en este track |
|---|---|---|
| [roadmap.sh/Java](https://roadmap.sh/java) | lenguaje y POO, colecciones, JVM, concurrencia, bases de datos, APIs y prácticas profesionales | El inventario Java M0–M20 incluye fundamentos/POO, colecciones, JVM, concurrencia, persistencia JDBC/JPA, HTTP, pruebas, módulos y producción. Esta comparación valida amplitud del índice, no profundidad ejecutada. |
| [Oracle Java 25 — java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html) | Predicate, Function, Consumer, Supplier, aridades dobles y operadores especializados | M20 temas 1, 4 y 5; los ejemplos básicos muestran selección de interfaz, transformación, provisión y efecto. |
| [Oracle Java 25 — java.util.stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html) | operaciones intermedias y terminales, reducción, colectores, pereza y paralelismo | M20 temas 3 y 8–12. Gatherers también existe en M4 y debe cotejarse con la versión JDK de cada ejercicio. |
| [Oracle Java 25 — java.util.concurrent.Flow](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Flow.html) | Publisher, Subscriber, Subscription y demanda/backpressure | M20 tema 13; `Estados.java`, `Demanda.java` y `Cancelar.java` se ejecutaron y produjeron las salidas esperadas. |
| [Oracle Java 25 — PreparedStatement](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) y [Connection](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | parametrización, conexiones, confirmación y rollback | M17 temas 1–2; las tres pruebas del laboratorio H2 pasan. |
| *Core Java, Volume I/II* (Horstmann); *Java a fondo* (Sznajdleder) | reflexión, anotaciones, regex, números exactos, plugins, proxies e internacionalización | M19 agrega siete de estos vacíos; la serialización binaria nativa queda identificada como baja prioridad y con cobertura parcial. Referencia resumida en [`biblioteca-externa-gaps-java.md`](biblioteca-externa-gaps-java.md). |

### Pendientes explícitos; Java no se declara completo

1. Expandir los 80 temas pendientes (M0–M16 y M19) a 3–6 subtemas de 5–15 minutos con contexto, archivo y código completo, comando, salida exacta, fallo reproducible y diagnóstico.
2. Auditar errores y salidas deliberadas de los 47 ejemplos de M18 y M20; la ejecución normal de archivos no prueba todos los fallos indicados en prosa.
3. Resolver del inventario de roadmap cualquier diferencia de versión, herramienta o tópico avanzado con evidencia primaria; registrar por qué se incluye o excluye cada elemento.
4. Revisar prerrequisitos cruzados, incrementos del proyecto RutaFlow y criterios observables de salida por módulo.
5. Separar y registrar revisión humana de claridad, ejecución de todos los ejemplos y pruebas del navegador.

**Conclusión de cobertura:** la estructura de 21 módulos está indexada y el núcleo funcional prioritario se amplió, pero el track completo todavía no satisface el contrato atómico del prompt. No se declara “de cero a profesional completo” hasta cerrar los pendientes críticos y validarlos.
