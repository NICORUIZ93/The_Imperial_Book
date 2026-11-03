# Temario completo de Java — índice de expansión

> Documento vivo de cobertura. Los archivos de lección enlazados son el contenido canónico. El índice conserva todos los temas existentes; un tema sin subtemas 4-pasos sigue pendiente aunque ya tenga explicación anterior.

**Proyecto continuo:** Motor de asignación de entregas.
**Prerrequisito de entrada:** Fundamentos de programación; el módulo 0 comienza con JDK y terminal..
**Duración objetivo:** temas de 20–45 minutos; cada tema se divide en 3–6 acciones de 5–15 minutos.
**Estado estructural:** 6/101 temas migrados; auditoría estructural actualizada el 2026-11-03.

## Índice de módulos y temas

Los enlaces abren el Markdown de lección que la aplicación publica. La etiqueta `[4 pasos]` refleja solo criterios estructurales detectados; no significa que el ejemplo se haya ejecutado ni que una revisión pedagógica humana lo haya aprobado.

### Módulo 0: Sintaxis, tipos y el modelo de la JVM

[Abrir lección completa](../web/public/content/java/modulo-0.md)

- [4 pasos] Tema 1: Del código fuente a la JVM
  - ✓ Subtema 1.1: Compila y ejecuta tu primera clase · 10 min
  - ✓ Subtema 1.2: Lee una instrucción del bytecode · 10 min
  - ✓ Subtema 1.3: Diagnostica dónde busca la JVM · 10 min
- [4 pasos] Tema 2: public static void main — qué significa cada palabra
  - ✓ Subtema 2.1: Identifica cada parte de la firma clásica · 10 min
  - ✓ Subtema 2.2: Recibe argumentos sin recompilar · 10 min
  - ✓ Subtema 2.3: Compara una forma abreviada de Java 25 · 10 min
- [pendiente de migrar] Tema 3: JDK, JRE y JVM
  - pendiente Subtema 3.1: Comprueba las herramientas instaladas · 10 min
  - ✓ Subtema 3.2: Mira la máquina virtual que ejecuta el programa · 10 min
  - ✓ Subtema 3.3: Decide qué instalar en cada máquina · 10 min
- [pendiente de migrar] Tema 4: Tipos primitivos vs referencias
- [pendiente de migrar] Tema 5: Variables, conversiones y `String`
- [pendiente de migrar] Tema 6: Operadores, precedencia y control de flujo
- [pendiente de migrar] Tema 7: Arreglos, wrappers y paso de argumentos
- [pendiente de migrar] Tema 8: Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`)

### Módulo 1: Programación orientada a objetos

[Abrir lección completa](../web/public/content/java/modulo-1.md)

- [4 pasos] Tema 1: Clases, objetos, constructores y encapsulación
  - ✓ Subtema 1.1: Crea una clase e instancia objetos · 10 min
  - ✓ Subtema 1.2: Protege los datos con encapsulación · 10 min
  - ✓ Subtema 1.3: Rechaza guías inválidas desde el constructor · 15 min
- [4 pasos] Tema 2: Herencia y sobreescritura
  - ✓ Subtema 2.1: Extiende una clase y hereda su comportamiento · 10 min
  - ✓ Subtema 2.2: Sobrescribe una operación · 10 min
  - ✓ Subtema 2.3: Observa el polimorfismo con varios vehículos · 10 min
  - ✓ Subtema 2.4: Declara una anotación que pueda leer una auditoría · 10 min
- [4 pasos] Tema 3: Interfaces, clases abstractas y cuándo usar cada una
  - ✓ Subtema 3.1: Define un contrato con una interfaz · 10 min
  - ✓ Subtema 3.2: Comparte estado y comportamiento con una clase abstracta · 10 min
  - ✓ Subtema 3.3: Combina contrato e implementación compartida · 15 min
- [pendiente de migrar] Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso

### Módulo 2: Colecciones y genéricos

[Abrir lección completa](../web/public/content/java/modulo-2.md)

- [pendiente de migrar] Tema 1: List, Set, Map y sus implementaciones
- [pendiente de migrar] Tema 2: Genéricos, wildcards y type erasure
- [pendiente de migrar] Tema 3: Comparable vs Comparator, e iteración

### Módulo 3: Excepciones y manejo de recursos

[Abrir lección completa](../web/public/content/java/modulo-3.md)

- [pendiente de migrar] Tema 1: Checked vs unchecked exceptions
- [pendiente de migrar] Tema 2: try-with-resources
- [pendiente de migrar] Tema 3: Excepciones personalizadas y no tragar excepciones

### Módulo 4: Streams y programación funcional

[Abrir lección completa](../web/public/content/java/modulo-4.md)

- [pendiente de migrar] Tema 1: Stream API — map, filter, reduce, collect
- [pendiente de migrar] Tema 2: Optional — evitar null explícitamente
- [pendiente de migrar] Tema 3: Streams paralelos y referencias a métodos
- [pendiente de migrar] Tema 4: Stream Gatherers (Java 24)

### Módulo 5: Concurrencia — hilos y virtual threads

[Abrir lección completa](../web/public/content/java/modulo-5.md)

- [pendiente de migrar] Tema 1: ExecutorService y gestión de hilos
- [pendiente de migrar] Tema 2: CompletableFuture
- [pendiente de migrar] Tema 3: Virtual threads
- [pendiente de migrar] Tema 4: Condiciones de carrera y sincronización
- [pendiente de migrar] Tema 5: Structured Concurrency (StructuredTaskScope, Java 25)
- [pendiente de migrar] Tema 6: Scoped Values frente a ThreadLocal (Java 25)
- [pendiente de migrar] Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos

### Módulo 6: I/O, NIO.2 y serialización

[Abrir lección completa](../web/public/content/java/modulo-6.md)

- [pendiente de migrar] Tema 1: NIO.2 — Path y Files
- [pendiente de migrar] Tema 2: Serialización con Jackson
- [pendiente de migrar] Tema 3: Archivos grandes y recursos del classpath

### Módulo 7: Records, sealed classes y pattern matching

[Abrir lección completa](../web/public/content/java/modulo-7.md)

- [pendiente de migrar] Tema 1: record — modelos inmutables sin boilerplate
- [pendiente de migrar] Tema 2: sealed — jerarquías cerradas y exhaustividad
- [pendiente de migrar] Tema 3: Pattern matching exhaustivo y para instanceof
- [pendiente de migrar] Tema 4: Unnamed variables y patterns (_, Java 22)

### Módulo 8: Build tools — Maven y Gradle

[Abrir lección completa](../web/public/content/java/modulo-8.md)

- [pendiente de migrar] Tema 1: pom.xml vs build.gradle.kts
- [pendiente de migrar] Tema 2: Ciclo de vida de build y scopes
- [pendiente de migrar] Tema 3: Proyectos multi-módulo
- [pendiente de migrar] Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas

### Módulo 9: Testing con JUnit 5 y Mockito

[Abrir lección completa](../web/public/content/java/modulo-9.md)

- [pendiente de migrar] Tema 1: JUnit 5 — anotaciones y ciclo de vida
- [pendiente de migrar] Tema 2: Mockito — aislar dependencias
- [pendiente de migrar] Tema 3: Tests parametrizados y cobertura

### Módulo 10: Módulos (JPMS) y proyectos grandes

[Abrir lección completa](../web/public/content/java/modulo-10.md)

- [pendiente de migrar] Tema 1: module-info.java y encapsulación fuerte
- [pendiente de migrar] Tema 2: Migración incremental y cuándo JPMS aporta valor
- [pendiente de migrar] Tema 3: `opens` para acceso reflexivo controlado de frameworks

### Módulo 11: JVM interna — GC, profiling y JIT

[Abrir lección completa](../web/public/content/java/modulo-11.md)

- [pendiente de migrar] Tema 1: Generaciones de memoria y recolectores
- [pendiente de migrar] Tema 2: Java Flight Recorder y JIT compilation
- [pendiente de migrar] Tema 3: Referencias especiales y heap dumps
- [pendiente de migrar] Tema 4: Foreign Function & Memory API (Java 22)

### Módulo 12: Buenas prácticas y patrones de diseño

[Abrir lección completa](../web/public/content/java/modulo-12.md)

- [pendiente de migrar] Tema 1: Builder — configuración paso a paso y validación
- [pendiente de migrar] Tema 2: Factory Method y Strategy
- [pendiente de migrar] Tema 3: Abstract Factory y familias de productos compatibles
- [pendiente de migrar] Tema 4: SOLID y cuándo NO aplicar un patrón
- [pendiente de migrar] Tema 5: Prototype: copiar un objeto sin compartir sus datos
- [pendiente de migrar] Tema 6: Patrones estructurales para conectar piezas existentes

### Módulo 13: Proyecto integrador

[Abrir lección completa](../web/public/content/java/modulo-13.md)

- [pendiente de migrar] Tema 1: Arquitectura por capas del proyecto integrador
- [pendiente de migrar] Tema 2: Integrando concurrencia, modelado y testing
- [pendiente de migrar] Tema 3: Build reproducible y cierre del track

### Módulo 14: Java en producción — memoria, benchmarks y runtime seguro

[Abrir lección completa](../web/public/content/java/modulo-14.md)

- [pendiente de migrar] Tema 1: Compartir memoria requiere orden y visibilidad
- [pendiente de migrar] Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo
- [pendiente de migrar] Tema 3: Deserializar es permitir construcción y comportamiento
- [pendiente de migrar] Tema 4: El runtime es parte del artefacto y necesita ciclo de vida

### Módulo 15: Java Master — builds, pruebas y observabilidad

[Abrir lección completa](../web/public/content/java/modulo-15.md)

- [pendiente de migrar] Tema 1: Maven avanzado
- [pendiente de migrar] Tema 2: Gradle y builds reproducibles
- [pendiente de migrar] Tema 3: Proyectos multi-módulo sin ciclos
- [pendiente de migrar] Tema 4: JUnit 5, Mockito y assertions expresivas
- [pendiente de migrar] Tema 5: Pruebas de integración reproducibles
- [pendiente de migrar] Tema 6: SLF4J, Logback, MDC y logging estructurado

### Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

[Abrir lección completa](../web/public/content/java/modulo-16.md)

- [pendiente de migrar] Tema 1: Entidades y relaciones JPA
- [pendiente de migrar] Tema 2: FetchType.LAZY, EAGER y el problema N+1
- [pendiente de migrar] Tema 3: Relaciones uno a uno, muchos a muchos y herencia
- [pendiente de migrar] Tema 4: Ciclo de vida, EntityManager y consultas tipadas
- [pendiente de migrar] Tema 5: Búsquedas dinámicas con Criteria y Querydsl
- [pendiente de migrar] Tema 6: EntityGraph y cachés de persistencia
- [pendiente de migrar] Tema 7: Concurrencia, transacciones y propagación
- [pendiente de migrar] Tema 8: Migraciones y pruebas JPA con Testcontainers

### Módulo 17: JDBC, DAO y transacciones

[Abrir lección completa](../web/public/content/java/modulo-17.md)

- [pendiente de migrar] Tema 1: JDBC, PreparedStatement y DAO
- [pendiente de migrar] Tema 2: Transacciones, ACID y aislamiento

### Módulo 18: HTTP, seguridad y backend con Java

[Abrir lección completa](../web/public/content/java/modulo-18.md)

- [pendiente de migrar] Tema 1: HttpClient, REST, timeouts y fallos
- [pendiente de migrar] Tema 2: Tokens, validación y límites de seguridad

### Módulo 19: Java del día a día — reflexión, regex, dinero, contratos, plugins e i18n

[Abrir lección completa](../web/public/content/java/modulo-19.md)

- [pendiente de migrar] Tema 1: Reflexión y anotaciones en tiempo de ejecución
- [pendiente de migrar] Tema 2: Expresiones regulares con Pattern y Matcher
- [pendiente de migrar] Tema 3: Dinero exacto con BigDecimal
- [pendiente de migrar] Tema 4: Assertions y diseño por contrato
- [pendiente de migrar] Tema 5: ServiceLoader: plugins sin acoplar implementaciones
- [pendiente de migrar] Tema 6: Proxies dinámicos: así funcionan @Transactional y los mocks
- [pendiente de migrar] Tema 7: Internacionalización: números, monedas, fechas y orden de texto

### Módulo 20: Java funcional — interfaces que componen comportamiento

[Abrir lección completa](../web/public/content/java/modulo-20.md)

- [4 pasos] Tema 1: Las cuatro formas: Predicate, Function, Consumer y Supplier
  - ✓ Subtema 1.1: Elige una interfaz por la salida que necesitas · 10 min
  - ✓ Subtema 1.2: Normaliza una guía con Function · 10 min
  - ✓ Subtema 1.3: Provee un turno y registra la etiqueta · 10 min
- [pendiente de migrar] Tema 2: Componer sin anidar: andThen, compose, negate y reglas encadenadas
- [pendiente de migrar] Tema 3: Streams como composición: pereza, orden y efectos que se esconden
- [pendiente de migrar] Tema 4: Function y BiFunction: transformar uno o dos datos
- [pendiente de migrar] Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo
- [pendiente de migrar] Tema 6: Referencias a métodos: escribir la operación sin repetirla
- [pendiente de migrar] Tema 7: Optional: buscar un envío que puede no existir
- [pendiente de migrar] Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar
- [pendiente de migrar] Tema 9: Streams terminales: encontrar, contar y combinar resultados
- [pendiente de migrar] Tema 10: Collectors: formar listas, mapas, grupos y texto
- [pendiente de migrar] Tema 11: Streams paralelos: comparar antes de acelerarlos
- [pendiente de migrar] Tema 12: Pureza y efectos: calcular separado de guardar o imprimir
- [pendiente de migrar] Tema 13: Flow API: publicar datos con demanda y cierre

## Comparación de cobertura con fuentes de referencia

La tabla registra presencia de áreas en el inventario del track, no profundidad profesional. La columna de migración usa la auditoría automática de estructura; los temas pendientes requieren revisión de contenidos, ejemplos y fuentes antes de declarar el curso exhaustivo.

| Área de referencia | Módulos del inventario | Estado de contenido | Estado de cuatro pasos |
|---|---|---|---|
| Lenguaje, sintaxis y orientación a objetos | M0–M1 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Colecciones, genéricos, excepciones y streams | M2–M4, M20 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Concurrencia y programación asíncrona | M5 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Archivos, fechas, HTTP y seguridad | M6, M14, M18 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Builds, módulos y pruebas | M8–M10, M15 | Inventariada; revisión temática manual pendiente | Migración parcial |
| JVM, memoria, profiling y rendimiento | M11, M14 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Patrones, integración y persistencia | M12–M13, M15–M17, M20 | Inventariada; revisión temática manual pendiente | Migración parcial |

### Fuentes consultadas

- [roadmap.sh Java](https://roadmap.sh/java)
- [Dev.java Learn](https://dev.java/learn/)
- [Java SE 25 documentation](https://docs.oracle.com/en/java/javase/25/)

### Huecos y límites reportados

- El repositorio contiene 101 temas en 21 módulos; 6 cumplen hoy los marcadores estructurales de 3–6 subtemas y cuatro pasos.
- No hay base para afirmar que el track esté completo: la comparación con la fuente de referencia está pendiente de revisión humana módulo por módulo.
- Los elementos de la fuente que todavía deben verificarse de forma explícita están enumerados en la tabla anterior; cualquier técnica crítica que no tenga tema propio debe añadirse conservando el currículo base.
- La ejecución de ejemplos, el comportamiento con brokers/plataformas reales y la calidad pedagógica humana se registran por separado.

## Proyecto integrador y hito final

Evoluciona el proyecto **Motor de asignación de entregas** a través de los módulos. Al cerrar cada módulo, conserva el código, salida esperada, fallo diagnosticado y evidencia de la decisión técnica. El capstone queda pendiente hasta que el índice completo y sus huecos de referencia hayan sido revisados.
