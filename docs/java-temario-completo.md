# Temario completo de Java — índice de expansión

> Documento vivo de cobertura. Los archivos de lección enlazados son el contenido canónico. El índice conserva todos los temas existentes; un tema sin subtemas 4-pasos sigue pendiente aunque ya tenga explicación anterior.

**Proyecto continuo:** Motor de asignación de entregas.
**Prerrequisito de entrada:** Fundamentos de programación; el módulo 0 comienza con JDK y terminal..
**Duración objetivo:** temas de 20–45 minutos; cada tema se divide en 3–6 acciones de 5–15 minutos.
**Estado estructural:** 57/101 temas migrados; auditoría estructural actualizada el 2026-11-03.

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
- [4 pasos] Tema 3: JDK, JRE y JVM
  - ✓ Subtema 3.1: Comprueba qué herramientas instalaste · 10 min
  - ✓ Subtema 3.2: Inspecciona la VM que ejecuta tu clase · 10 min
  - ✓ Subtema 3.3: Separa desarrollo de ejecución · 10 min
- [4 pasos] Tema 4: Tipos primitivos vs referencias
  - ✓ Subtema 4.1: Guarda una cantidad primitiva · 10 min
  - ✓ Subtema 4.2: Usa una referencia para describir un envío · 10 min
  - ✓ Subtema 4.3: Compara valores, no direcciones por accidente · 10 min
- [4 pasos] Tema 5: Variables, conversiones y `String`
  - ✓ Subtema 5.1: Declara y actualiza una variable · 10 min
  - ✓ Subtema 5.2: Convierte un dato sin perderlo · 10 min
  - ✓ Subtema 5.3: Lee texto y conviértelo con control · 10 min
- [4 pasos] Tema 6: Operadores, precedencia y control de flujo
  - ✓ Subtema 6.1: Protege una comprobación con cortocircuito · 10 min
  - ✓ Subtema 6.2: Elige una acción con switch · 10 min
  - ✓ Subtema 6.3: Recorre una lista sin salir de sus límites · 10 min
- [4 pasos] Tema 7: Arreglos, wrappers y paso de argumentos
  - ✓ Subtema 7.1: Guarda y recorre varias guías · 10 min
  - ✓ Subtema 7.2: Convierte entre primitivos y wrappers con cuidado · 10 min
  - ✓ Subtema 7.3: Observa qué cambia al pasar una referencia · 10 min
- [4 pasos] Tema 8: Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`)
  - ✓ Subtema 8.1: Lee una entrada y valida el número · 10 min
  - ✓ Subtema 8.2: Parsea una fecha de entrega · 10 min
  - ✓ Subtema 8.3: Distingue un instante de una hora local · 10 min

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
- [4 pasos] Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso
  - ✓ Subtema 4.1: Sobrecarga según los parámetros · 10 min
  - ✓ Subtema 4.2: Compara sobrecarga y sobreescritura · 10 min
  - ✓ Subtema 4.3: Restringe el acceso a los datos · 15 min

### Módulo 2: Colecciones y genéricos

[Abrir lección completa](../web/public/content/java/modulo-2.md)

- [4 pasos] Tema 1: List, Set, Map y sus implementaciones
  - ✓ Subtema 1.1: Conserva el orden con una List · 10 min
  - ✓ Subtema 1.2: Evita duplicados con un Set · 10 min
  - ✓ Subtema 1.3: Busca una guía por su clave con Map · 15 min
- [4 pasos] Tema 2: Genéricos, wildcards y type erasure
  - ✓ Subtema 2.1: Crea una clase genérica segura · 10 min
  - ✓ Subtema 2.2: Lee una familia de tipos con extends · 10 min
  - ✓ Subtema 2.3: Escribe con super y conserva seguridad · 10 min
  - ✓ Subtema 2.4: Observa qué conserva type erasure · 10 min
- [4 pasos] Tema 3: Comparable vs Comparator, e iteración
  - ✓ Subtema 3.1: Define el orden natural con Comparable · 10 min
  - ✓ Subtema 3.2: Cambia el criterio con Comparator · 10 min
  - ✓ Subtema 3.3: Recorre entradas y elimina con Iterator · 15 min

### Módulo 3: Excepciones y manejo de recursos

[Abrir lección completa](../web/public/content/java/modulo-3.md)

- [4 pasos] Tema 1: Checked vs unchecked exceptions
  - ✓ Subtema 1.1: Maneja un archivo que no existe · 10 min
  - ✓ Subtema 1.2: Propaga una checked exception hasta quien puede resolverla · 10 min
  - ✓ Subtema 1.3: Trata una entrada inválida como error de programa · 10 min
- [4 pasos] Tema 2: try-with-resources
  - ✓ Subtema 2.1: Lee un archivo y deja que Java lo cierre · 10 min
  - ✓ Subtema 2.2: Comprueba el cierre aunque ocurra un error · 10 min
  - ✓ Subtema 2.3: Cierra varios recursos en orden inverso · 10 min
- [4 pasos] Tema 3: Excepciones personalizadas y no tragar excepciones
  - ✓ Subtema 3.1: Representa un saldo insuficiente · 10 min
  - ✓ Subtema 3.2: Atiende el error donde puedes informar al usuario · 10 min
  - ✓ Subtema 3.3: No ocultes fallos con un catch vacío · 10 min

### Módulo 4: Streams y programación funcional

[Abrir lección completa](../web/public/content/java/modulo-4.md)

- [4 pasos] Tema 1: Stream API — map, filter, reduce, collect
  - ✓ Subtema 1.1: Filtra y transforma envíos · 10 min
  - ✓ Subtema 1.2: Suma sin llevar un acumulador externo · 10 min
  - ✓ Subtema 1.3: No reutilices un stream consumido · 10 min
- [4 pasos] Tema 2: Optional — evitar null explícitamente
  - ✓ Subtema 2.1: Representa que una búsqueda puede no encontrar guía · 10 min
  - ✓ Subtema 2.2: Transforma o usa un valor alternativo · 10 min
  - ✓ Subtema 2.3: No envuelvas un valor que puede ser null · 10 min
- [4 pasos] Tema 3: Streams paralelos y referencias a métodos
  - ✓ Subtema 3.1: Reemplaza una lambda por referencia a método · 10 min
  - ✓ Subtema 3.2: Compara una suma secuencial y paralela · 10 min
  - ✓ Subtema 3.3: Conserva el orden cuando lo necesitas · 10 min
- [4 pasos] Tema 4: Stream Gatherers (Java 24)
  - ✓ Subtema 4.1: Agrupa elementos consecutivos en ventanas · 10 min
  - ✓ Subtema 4.2: Compara ventana móvil y grupos separados · 10 min
  - ✓ Subtema 4.3: Elige la herramienta según la relación entre datos · 10 min

### Módulo 5: Concurrencia — hilos y virtual threads

[Abrir lección completa](../web/public/content/java/modulo-5.md)

- [4 pasos] Tema 1: ExecutorService y gestión de hilos
  - ✓ Subtema 1.1: Envía trabajos a un executor · 10 min
  - ✓ Subtema 1.2: Recoge el resultado con Future · 10 min
  - ✓ Subtema 1.3: Cierra el executor al completar todas las tareas · 10 min
- [4 pasos] Tema 2: CompletableFuture
  - ✓ Subtema 2.1: Transforma un resultado asíncrono · 10 min
  - ✓ Subtema 2.2: Combina dos resultados independientes · 10 min
  - ✓ Subtema 2.3: Convierte un fallo en una respuesta visible · 10 min
- [4 pasos] Tema 3: Virtual threads
  - ✓ Subtema 3.1: Ejecuta una tarea en un virtual thread · 10 min
  - ✓ Subtema 3.2: No limites virtual threads como si fueran conexiones · 10 min
  - ✓ Subtema 3.3: Libera las tareas cuando termina el bloque · 10 min
- [4 pasos] Tema 4: Condiciones de carrera y sincronización
  - ✓ Subtema 4.1: Reproduce un retiro duplicado de forma controlada · 10 min
  - ✓ Subtema 4.2: Protege la operación completa con synchronized · 10 min
  - ✓ Subtema 4.3: Usa AtomicInteger para un contador · 10 min
- [4 pasos] Tema 5: Structured Concurrency (StructuredTaskScope, Java 25)
  - ✓ Subtema 5.1: Espera resultados de tareas relacionadas · 10 min
  - ✓ Subtema 5.2: Propaga el fallo y cancela trabajo hermano · 10 min
  - ✓ Subtema 5.3: Activa preview para la versión correcta · 10 min
- [4 pasos] Tema 6: Scoped Values frente a ThreadLocal (Java 25)
  - ✓ Subtema 6.1: Comparte contexto durante una llamada · 10 min
  - ✓ Subtema 6.2: Anida un valor y vuelve al anterior · 10 min
  - ✓ Subtema 6.3: Compara el ciclo de vida con ThreadLocal · 10 min
- [4 pasos] Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos
  - ✓ Subtema 7.1: Limita cuánto espera el hilo coordinador · 10 min
  - ✓ Subtema 7.2: Haz que el trabajo responda a una interrupción · 10 min
  - ✓ Subtema 7.3: Distingue timeout de CompletableFuture y cancelación real · 10 min

### Módulo 6: I/O, NIO.2 y serialización

[Abrir lección completa](../web/public/content/java/modulo-6.md)

- [4 pasos] Tema 1: NIO.2 — Path y Files
  - ✓ Subtema 1.1: Lee y escribe un archivo pequeño · 10 min
  - ✓ Subtema 1.2: Rechaza una ruta que sale del directorio · 10 min
  - ✓ Subtema 1.3: Recorre una carpeta y cierra el stream · 10 min
- [4 pasos] Tema 2: Serialización con Jackson
  - ✓ Subtema 2.1: Convierte un record a JSON y de vuelta · 10 min
  - ✓ Subtema 2.2: Rechaza JSON mal formado · 10 min
  - ✓ Subtema 2.3: Decide qué hacer con campos nuevos · 10 min
- [4 pasos] Tema 3: Archivos grandes y recursos del classpath
  - ✓ Subtema 3.1: Procesa un archivo línea por línea · 10 min
  - ✓ Subtema 3.2: Carga un archivo empacado en el JAR · 10 min
  - ✓ Subtema 3.3: Elige entre leer todo o transmitir · 10 min

### Módulo 7: Records, sealed classes y pattern matching

[Abrir lección completa](../web/public/content/java/modulo-7.md)

- [4 pasos] Tema 1: record — modelos inmutables sin boilerplate
  - ✓ Subtema 1.1: Construye un record de guía · 10 min
  - ✓ Subtema 1.2: Comprueba igualdad por valor · 10 min
  - ✓ Subtema 1.3: Produce una versión actualizada · 10 min
- [4 pasos] Tema 2: sealed — jerarquías cerradas y exhaustividad
  - ✓ Subtema 2.1: Declara estados permitidos · 10 min
  - ✓ Subtema 2.2: Añade un estado con intención · 10 min
  - ✓ Subtema 2.3: Distingue jerarquía cerrada de abierta · 10 min
- [4 pasos] Tema 3: Pattern matching exhaustivo y para instanceof
  - ✓ Subtema 3.1: Calcula una regla con switch · 10 min
  - ✓ Subtema 3.2: Extrae el tipo con instanceof · 10 min
  - ✓ Subtema 3.3: Compara con casteo clásico · 10 min
- [4 pasos] Tema 4: Unnamed variables y patterns (_, Java 22)
  - ✓ Subtema 4.1: Descarta un componente de record pattern · 10 min
  - ✓ Subtema 4.2: Ignora una excepción sin ocultar el caso · 10 min
  - ✓ Subtema 4.3: Escribe texto multilínea legible · 10 min

### Módulo 8: Build tools — Maven y Gradle

[Abrir lección completa](../web/public/content/java/modulo-8.md)

- [4 pasos] Tema 1: pom.xml vs build.gradle.kts
  - ✓ Subtema 1.1: Compila una clase con Maven · 10 min
  - ✓ Subtema 1.2: Declara el mismo proyecto con Gradle · 10 min
  - ✓ Subtema 1.3: Fija una dependencia directa · 10 min
- [4 pasos] Tema 2: Ciclo de vida de build y scopes
  - ✓ Subtema 2.1: Sigue las fases de Maven · 10 min
  - ✓ Subtema 2.2: Mantén JUnit en test scope · 10 min
  - ✓ Subtema 2.3: Inspecciona scopes en Gradle · 10 min
- [4 pasos] Tema 3: Proyectos multi-módulo
  - ✓ Subtema 3.1: Separa modelo y aplicación con Maven · 10 min
  - ✓ Subtema 3.2: Encuentra y rompe un ciclo · 10 min
  - ✓ Subtema 3.3: Construye solo lo que necesita cambio · 10 min
- [4 pasos] Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas
  - ✓ Subtema 4.1: Ejecuta el mismo test en ambas herramientas · 10 min
  - ✓ Subtema 4.2: Compara dependencias resueltas · 10 min
  - ✓ Subtema 4.3: Decide con evidencia del equipo · 10 min

### Módulo 9: Testing con JUnit 5 y Mockito

[Abrir lección completa](../web/public/content/java/modulo-9.md)

- [4 pasos] Tema 1: JUnit 5 — anotaciones y ciclo de vida
  - ✓ Subtema 1.1: Escribe y ejecuta tu primera prueba · 10 min
  - ✓ Subtema 1.2: Prepara datos para cada prueba · 10 min
  - ✓ Subtema 1.3: Comprueba errores esperados · 10 min
- [4 pasos] Tema 2: Mockito — aislar dependencias
  - ✓ Subtema 2.1: Simula un repositorio · 10 min
  - ✓ Subtema 2.2: Verifica una interacción necesaria · 10 min
  - ✓ Subtema 2.3: Simula un error externo · 10 min
- [4 pasos] Tema 3: Tests parametrizados y cobertura
  - ✓ Subtema 3.1: Comprueba varios casos con CSV · 10 min
  - ✓ Subtema 3.2: Encuentra una rama no probada · 10 min
  - ✓ Subtema 3.3: Lee una métrica sin perseguir el porcentaje · 10 min

### Módulo 10: Módulos (JPMS) y proyectos grandes

[Abrir lección completa](../web/public/content/java/modulo-10.md)

- [4 pasos] Tema 1: module-info.java y encapsulación fuerte
  - ✓ Subtema 1.1: Declara un módulo pequeño · 10 min
  - ✓ Subtema 1.2: Ejecuta una aplicación modular · 10 min
  - ✓ Subtema 1.3: Distingue public de exported · 10 min
- [4 pasos] Tema 2: Migración incremental y cuándo JPMS aporta valor
  - ✓ Subtema 2.1: Inspecciona un JAR antes de modularizar · 10 min
  - ✓ Subtema 2.2: Migra un consumidor por etapas · 10 min
  - ✓ Subtema 2.3: Decide si JPMS resuelve un problema real · 10 min
- [4 pasos] Tema 3: opens para acceso reflexivo controlado de frameworks
  - ✓ Subtema 3.1: Distingue exports de opens · 10 min
  - ✓ Subtema 3.2: Limita la apertura a un consumidor · 10 min
  - ✓ Subtema 3.3: Diagnostica una reflexión bloqueada · 10 min

### Módulo 11: JVM interna — GC, profiling y JIT

[Abrir lección completa](../web/public/content/java/modulo-11.md)

- [4 pasos] Tema 1: Generaciones de memoria y recolectores
  - ✓ Subtema 1.1: Observa el heap de una JVM · 10 min
  - ✓ Subtema 1.2: Distingue objetos vivos de basura · 10 min
  - ✓ Subtema 1.3: Compara logs antes de ajustar · 10 min
- [4 pasos] Tema 2: Java Flight Recorder y JIT compilation
  - ✓ Subtema 2.1: Captura una grabación JFR · 10 min
  - ✓ Subtema 2.2: Observa compilación caliente · 10 min
  - ✓ Subtema 2.3: Resume la grabación para comparar · 10 min
- [4 pasos] Tema 3: Referencias especiales y heap dumps
  - ✓ Subtema 3.1: Prueba una referencia débil · 10 min
  - ✓ Subtema 3.2: Detecta una referencia fuerte accidental · 10 min
  - ✓ Subtema 3.3: Crea un heap dump para investigarlo · 10 min
- [4 pasos] Tema 4: Foreign Function & Memory API (Java 22)
  - ✓ Subtema 4.1: Reserva memoria nativa con Arena · 10 min
  - ✓ Subtema 4.2: Llama una función nativa conocida · 10 min
  - ✓ Subtema 4.3: Evita que memoria nativa se use tras cerrar Arena · 10 min

### Módulo 12: Buenas prácticas y patrones de diseño

[Abrir lección completa](../web/public/content/java/modulo-12.md)

- [4 pasos] Tema 1: Builder — configuración paso a paso y validación
  - ✓ Subtema 1.1: Crea un envío con un builder · 10 min
  - ✓ Subtema 1.2: Valida reglas en build() · 10 min
  - ✓ Subtema 1.3: Decide si Builder es necesario · 10 min
- [4 pasos] Tema 2: Factory Method y Strategy
  - ✓ Subtema 2.1: Elige estrategia por interfaz · 10 min
  - ✓ Subtema 2.2: Crea el objeto con Factory Method · 10 min
  - ✓ Subtema 2.3: Inyecta la estrategia en el servicio · 10 min
- [4 pasos] Tema 3: Abstract Factory y familias de productos compatibles
  - ✓ Subtema 3.1: Define una familia de notificaciones · 10 min
  - ✓ Subtema 3.2: Construye familias compatibles · 10 min
  - ✓ Subtema 3.3: Añade una familia nueva sin cambiar el cliente · 10 min
- [4 pasos] Tema 4: SOLID y cuándo NO aplicar un patrón
  - ✓ Subtema 4.1: Separa responsabilidades · 10 min
  - ✓ Subtema 4.2: Sustituye una implementación sin romper el contrato · 10 min
  - ✓ Subtema 4.3: Invierte la dependencia hacia una abstracción · 10 min
- [4 pasos] Tema 5: Prototype: copiar un objeto sin compartir sus datos
  - ✓ Subtema 5.1: Implementa una copia independiente · 10 min
  - ✓ Subtema 5.2: Copia solo lo que el contrato necesita · 10 min
  - ✓ Subtema 5.3: Compara Prototype con una fábrica · 10 min
- [4 pasos] Tema 6: Patrones estructurales para conectar piezas existentes
  - ✓ Subtema 6.1: Adapta un proveedor antiguo · 10 min
  - ✓ Subtema 6.2: Añade comportamiento con Decorator · 10 min
  - ✓ Subtema 6.3: Simplifica una operación con Facade · 10 min

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

- El repositorio contiene 101 temas en 21 módulos; 57 cumplen hoy los marcadores estructurales de 3–6 subtemas y cuatro pasos.
- No hay base para afirmar que el track esté completo: la comparación con la fuente de referencia está pendiente de revisión humana módulo por módulo.
- Los elementos de la fuente que todavía deben verificarse de forma explícita están enumerados en la tabla anterior; cualquier técnica crítica que no tenga tema propio debe añadirse conservando el currículo base.
- La ejecución de ejemplos, el comportamiento con brokers/plataformas reales y la calidad pedagógica humana se registran por separado.

## Proyecto integrador y hito final

Evoluciona el proyecto **Motor de asignación de entregas** a través de los módulos. Al cerrar cada módulo, conserva el código, salida esperada, fallo diagnosticado y evidencia de la decisión técnica. El capstone queda pendiente hasta que el índice completo y sus huecos de referencia hayan sido revisados.
