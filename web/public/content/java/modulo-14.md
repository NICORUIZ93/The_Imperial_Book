# Módulo 14: Java en producción — memoria, benchmarks y runtime seguro

El proyecto anterior usa concurrencia y produce un artefacto reproducible. Para operarlo profesionalmente todavía debes demostrar que los hilos observan estado válido, que las optimizaciones no engañan tus mediciones, que datos hostiles no construyen objetos arbitrarios y que el runtime puede actualizarse y diagnosticarse. Este módulo trabaja esas fronteras con experimentos.


## Aprende construyendo

### Tema 1: Compartir memoria requiere orden y visibilidad

#### Paso 1 · Objetivo y preparación
Al finalizar podrás demostrar experimentalmente un problema de visibilidad entre hilos y corregirlo con `volatile`. Prerrequisitos: JDK 25, Maven y un editor. Verifica java --version.

#### Paso 2 · Contexto y caso real
Un `WorkerControl` con una bandera `stopped` sin `volatile` puede nunca detenerse: el hilo que lee la bandera puede quedarse observando eternamente un valor cacheado en registro, mientras otro hilo ya escribió `true` y nadie se entera.

#### Paso 3 · Teoría, modelo mental y analogía
El Java Memory Model no garantiza que una escritura en un hilo sea visible para otro hilo sin una relación happens-before explícita (orden dentro del mismo hilo, un monitor, un `volatile`, o `Thread.join`). La analogía: dos pizarras privadas no se sincronizan solas; `happens-before` es el protocolo de entrega que confirma que la segunda persona recibió la versión más reciente antes de leer.

**Evidencia de aprendizaje:** entrega el bloqueo observado sin `volatile`, la corrección, y el experimento de atomicidad con `AtomicLong`.
**Conceptos clave:** Java Memory Model, action, read, write, data race, happens-before, monitor, synchronized, volatile, atomicidad, visibilidad, orden, final, safe publication, inmutabilidad y jcstress.

Cada hilo ejecuta según su semántica local, pero compilador, JIT y CPU pueden reordenar operaciones si el resultado observable de un solo hilo no cambia. Sin sincronización, otro hilo puede ver valores antiguos o combinaciones sorprendentes. El Java Memory Model define qué ejecuciones son legales; no promete que “eventualmente todos ven lo último” por intuición.

Una escritura es garantizadamente visible a una lectura cuando existe relación **happens-before**. Acciones importantes que la crean incluyen: orden dentro del mismo hilo; desbloquear y luego bloquear el mismo monitor; escribir y luego leer el mismo `volatile`; acciones anteriores a `Thread.start`; y acciones del hilo antes de que otro `join` retorne.

```java
final class WorkerControl {
    private volatile boolean stopped;

    void stop() {
        stopped = true;
    }

    void runLoop() {
        while (!stopped) {
            doOneUnit();
        }
    }
}
```

`volatile` hace visible la escritura y establece orden alrededor del acceso, pero no vuelve atómica una secuencia read-modify-write. `counter++` lee, suma y escribe; dos hilos pueden perder actualización. Usa `AtomicLong`, `LongAdder` para contención apropiada o un lock que proteja el invariante completo.

Los campos `final` correctamente construidos tienen garantías especiales, pero publicar `this` desde el constructor —registrándolo en un callback, por ejemplo— permite observar el objeto antes de terminar. Publica objetos completos mediante campo final de un contenedor seguro, colección concurrente, volatile, lock o mecanismos de `java.util.concurrent`.

```java
public record PriceTable(Map<String, BigDecimal> prices) {
    public PriceTable {
        prices = Map.copyOf(prices); // copia defensiva, estructura inmutable
    }
}
```

Un record no vuelve inmutables sus componentes. Copiar colecciones evita que otro hilo modifique el mapa por una referencia externa. Prefiere mensajes y valores inmutables antes que sincronización dispersa.

Las pruebas unitarias raramente encuentran intercalados. OpenJDK jcstress ejecuta escenarios y clasifica outcomes permitidos/prohibidos. Aun así, una prueba sin fallo no demuestra corrección; conecta la implementación con una relación formal y usa stress como evidencia empírica.

**Analogía:** dos pizarras privadas no se sincronizan porque alguien “ya escribió”. Happens-before es el protocolo de entrega que garantiza que la segunda persona recibió una versión antes de leer.

**Casos de uso reales:** flags de shutdown, singleton mal publicado, cache mutable, contador, configuración recargada, callback escapado del constructor y cola productor/consumidor.

**Diagrama:**

```mermaid
sequenceDiagram
    participant A as Hilo A
    participant M as Memoria coordinada
    participant B as Hilo B
    A->>M: construir estado
    A->>M: write volatile ready=true
    M-->>B: read volatile ready (happens-before)
    B->>B: leer estado completo
```

El procesador concurrente del Proyecto integrador (Módulo 13) es exactamente donde este tipo de defecto de visibilidad aparecería bajo carga real de producción.

**Cuándo no usarlo:** marcar un campo `volatile` no resuelve invariantes compuestos como `counter++`; para operaciones read-modify-write usa `AtomicLong` o un lock que proteja el invariante completo.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-visibilidad-volatile
cd ejemplo-visibilidad-volatile
mkdir -p src/main/java/academia/concurrencia
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `src/main/java/academia/concurrencia/WorkerControl.java` con el campo `stopped` **sin** `volatile` (`private boolean stopped;`), y un `Main.java` que lance un hilo ejecutando `runLoop()`, espere un segundo con `Thread.sleep(1000)`, llame `stop()` desde el hilo principal, y luego mida cuánto tarda el hilo en detenerse.

#### Paso 5 · Práctica guiada
Pista: ejecuta el programa sin `volatile` en modo release (`java -server`) repetidas veces para provocar deliberadamente que el hilo nunca vea la actualización de `stopped` y quede en bucle infinito; interrumpe con Ctrl+C y observa el síntoma. Resultado esperado: agregar `volatile` a `stopped` hace que el hilo se detenga de forma confiable y rápida.

#### Paso 6 · Práctica independiente
Reemplaza el `boolean stopped` por un contador `counter++` incrementado desde dos hilos simultáneamente sin sincronización, cuenta cuántas veces el resultado final es menor al esperado, y corrígelo con `AtomicLong` en vez de con `volatile` (que no basta para operaciones read-modify-write).

#### Paso 7 · Cierre y evidencia
Guarda la versión sin `volatile` (con el bloqueo observado), la versión corregida, y el experimento con `AtomicLong` para el contador concurrente; como siguiente paso mide con JMH en vez de con relojes ingenuos. Errores comunes: marcar todo `volatile` pensando que resuelve invariantes compuestos, y confundir visibilidad con atomicidad. Fuentes oficiales: https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html.
**¿Por qué es importante?** porque los defectos de visibilidad dependen de optimizaciones, arquitectura y timing; pueden desaparecer al agregar logs o debugger y reaparecer bajo carga.

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo

#### Paso 1 · Objetivo y preparación
Al finalizar podrás demostrar por qué un cronómetro ingenuo miente y corregirlo con JMH. Prerrequisitos: JDK 25, Maven y un editor. Verifica java --version.

#### Paso 2 · Contexto y caso real
Un desarrollador mide `System.nanoTime()` alrededor de una búsqueda lineal una sola vez, concluye que es "rápida" y publica el resultado; en producción, bajo carga real y con el JIT ya optimizado (o sin optimizar, por warm-up incompleto), el comportamiento real es distinto al medido.

#### Paso 3 · Teoría, modelo mental y analogía
Medir una vez mezcla arranque, carga de clases, compilación JIT, GC y scheduler. Si el resultado no se usa, el JIT puede eliminar el cálculo entero (dead-code elimination). JMH organiza warmup, iteraciones y forks para aislar la medición real. La analogía: cronometrar a un atleta mientras se ata los zapatos y concluir sobre su velocidad de carrera mezcla fases que no deberían mezclarse.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-jmh-cronometro
cd ejemplo-jmh-cronometro
mvn archetype:generate -DinteractiveMode=false -DarchetypeGroupId=org.openjdk.jmh -DarchetypeArtifactId=jmh-java-benchmark-archetype -DgroupId=academia.bench -DartifactId=app
cd app
mvn clean package
```
> **Con Gradle:** JMH no usa archetype; se aplica el plugin `id("me.champeau.jmh")` en `build.gradle.kts` y los benchmarks se ejecutan con `./gradlew jmh`. El resto del tema (escribir el `@Benchmark`, el `Blackhole`) es idéntico. Ver la tabla de equivalencias en el track de Java, Módulo 8, Tema 4.
Primero escribe un benchmark "ingenuo" en `src/main/java/academia/bench/CronometroIngenuo.java`: mide `System.nanoTime()` antes y después de una sola llamada a `values.indexOf(size - 1)` sobre una lista de 10000 elementos, sin warmup ni repetición. Luego reemplázalo por `src/main/java/academia/bench/SearchBenchmark.java` con `@State`, `@Setup`, `@Param({"100", "10000"})` y `@Benchmark` que consume el resultado con `Blackhole`. Ejecuta `java -jar target/benchmarks.jar`.

#### Paso 5 · Práctica guiada
Pista: en el benchmark JMH, elimina deliberadamente el parámetro `Blackhole blackhole` y el `blackhole.consume(result)` para provocar que el JIT elimine el cálculo entero por dead-code elimination (el benchmark reporta un tiempo sospechosamente cercano a cero); compara contra el cronómetro ingenuo del paso anterior. Resultado esperado: restaurar `Blackhole.consume(...)` produce una medición realista y estable.
#### Paso 6 · Práctica independiente
Agrega un segundo método `@Benchmark` que use `Collections.binarySearch` en vez de `indexOf`, compara ambos con `@Param({"100", "10000", "1000000"})` y documenta a partir de qué tamaño la diferencia se vuelve significativa.

#### Paso 7 · Cierre y evidencia
Guarda el cronómetro ingenuo, el benchmark JMH sin `Blackhole` (con el resultado eliminado), el benchmark corregido, y la comparación entre `indexOf` y `binarySearch`; como siguiente paso valida la deserialización de entradas no confiables. Errores comunes: cronometrar un solo loop sin warmup, olvidar `Blackhole`, y elegir un flag de GC basándose en una sola ejecución local. Fuentes oficiales: https://openjdk.org/projects/code-tools/jmh/.
**¿Por qué es importante?** porque optimizar con una medición falsa empeora código y enseña explicaciones inventadas sobre el JIT.
**Evidencia de aprendizaje:** entrega el cronómetro ingenuo, el benchmark JMH corregido y la comparación de algoritmos.
**Conceptos clave:** benchmark, warmup, JIT, tiered compilation, dead-code elimination, constant folding, escape analysis, allocation, fork, iteration, Blackhole, throughput, latency, percentil y JMH.

Medir `System.nanoTime()` alrededor de un método una vez mezcla arranque, carga de clases, compilación, GC, scheduler y trabajo. La JVM observa código caliente y lo optimiza. Si el resultado no se usa, puede eliminar el cálculo; si entradas son constantes, puede precalcularlo; si un objeto no escapa, puede evitar asignarlo.

JMH organiza warmup, iteraciones, forks y consumo de resultados. Un fork inicia otra JVM y reduce contaminación entre configuraciones. El estado define alcance y los parámetros evitan un benchmark para un único valor.

```java
@State(Scope.Thread)
public class SearchBenchmark {
    @Param({"100", "10000"})
    int size;
    List<Integer> values;

    @Setup
    public void setup() {
        values = IntStream.range(0, size).boxed().toList();
    }

    @Benchmark
    public int linearSearch(Blackhole blackhole) {
        int result = values.indexOf(size - 1);
        blackhole.consume(result);
        return result;
    }
}
```

No incluyas preparación si no es parte de la operación medida. Si estudias parsing completo, sí debe incluirse; declara la pregunta. Mide varias distribuciones, no solo caso favorable. Reporta versión JDK, flags, CPU, SO, frecuencia, forks, error e intervalo.

Microbenchmark explica una función, no experiencia de servicio. Confirma con JFR y prueba de carga end-to-end. Una mejora de nanosegundos puede aumentar memoria, complejidad o latencia de cola. Distingue throughput, tiempo promedio y percentiles. Nunca elijas recolector o flag basándote en una sola ejecución local.

JMH también puede engañarse: setup incorrecto, estado compartido con contención accidental, entradas previsibles y benchmark distinto al workload. Revisa assembly/profilers solo cuando la pregunta lo requiere y conserva código reproducible.

**Analogía:** cronometrar a un atleta mientras se ata zapatos y luego concluir sobre velocidad de carrera mezcla fases. JMH organiza calentamiento y repeticiones, pero aún debes diseñar la prueba correcta.

**Casos de uso reales:** comparar colecciones, serializadores, asignaciones, locks, parsers, algoritmos, flags de GC y regresiones entre versiones JDK.

**Diagrama:**

```mermaid
flowchart LR
    Q["pregunta"] --> W["workload"] --> JMH["warmup · forks · iteraciones"]
    JMH --> DIST["distribución y error"]
    DIST --> JFR["JFR y carga del servicio"] --> USER["impacto de usuario"]
```

Los benchmarks JMH del Proyecto integrador (Módulo 13) son la evidencia que justifica cualquier decisión de optimización antes de llevarla a producción.

**Cuándo no usarlo:** para comparar dos implementaciones obviamente distintas en órdenes de magnitud (un `O(n²)` contra un `O(n)` evidente), un benchmark JMH completo es esfuerzo desproporcionado; un análisis de complejidad basta.

### Tema 3: Deserializar es permitir construcción y comportamiento

#### Paso 1 · Objetivo y preparación
Al finalizar podrás limitar la deserialización nativa de Java con un `ObjectInputFilter` y demostrar por qué es necesario. Prerrequisitos: JDK 25, Maven y un editor. Verifica java --version.

#### Paso 2 · Contexto y caso real
Un sistema legacy recibe un `ImportBatch` serializado con `ObjectInputStream` desde una cola externa; sin restricción, deserializar bytes controlados por otro sistema puede ejecutar código durante la reconstrucción del grafo de objetos (a través de `readObject`), no solo leer datos.

#### Paso 3 · Teoría, modelo mental y analogía
Deserializar no es leer una carta; es aceptar un kit que puede ensamblar máquinas y ejecutar instrucciones durante el desembalaje. Un `ObjectInputFilter` restringe qué clases, qué profundidad y qué tamaño se permiten antes de que el objeto termine de construirse, en vez de validar después (cuando ya podría ser tarde).

**Evidencia de aprendizaje:** entrega la deserialización sin filtro, la corrección con allowlist y la prueba de límite de tamaño rechazado.
**Conceptos clave:** frontera de confianza, allowlist, serialización nativa, ObjectInputStream, gadget, ObjectInputFilter, profundidad, referencias, bytes, JSON schema, polymorphic typing, secreto, criptografía, dependencia, SBOM y firma.

La serialización nativa puede ejecutar callbacks como `readObject` mientras reconstruye grafos. Deserializar datos no confiables es inherentemente peligroso. Prefiere formatos simples con DTO explícito y validación. JSON no es automáticamente seguro: tipos polimórficos abiertos, estructuras enormes, profundidad y campos inesperados también atacan.

Si un protocolo legacy exige `ObjectInputStream`, configura filtro por flujo o JVM y limita clases, profundidad, referencias, tamaño de arrays y bytes. Los filtros no están activos por arte de magia.

```java
ObjectInputFilter filter = ObjectInputFilter.Config.createFilter(
    "maxdepth=8;maxrefs=1000;maxbytes=1048576;" +
    "com.academia.dto.*;java.base/java.lang.*;!*"
);

try (ObjectInputStream input = new ObjectInputStream(stream)) {
    input.setObjectInputFilter(filter);
    Object value = input.readObject();
    if (!(value instanceof ImportBatch batch)) {
        throw new InvalidObjectException("tipo no permitido");
    }
    validate(batch);
}
```

Una allowlist estrecha es más defendible que enumerar gadgets conocidos. Valida invariantes después de construir y antes de usar. Para Jackson, deshabilita tipado polimórfico global con clases arbitrarias; usa discriminador cerrado y subtipos explícitos. Limita tamaño en servidor/proxy antes de parsear.

No inventes criptografía. Usa APIs y algoritmos actuales, `SecureRandom`, almacenamiento de claves externo y comparación adecuada. No hardcodees secretos en JAR, properties incluidas ni Docker layer. Rotación significa que la aplicación acepta transición controlada y registra versión, no que cambia un string manualmente.

El build descarga código. Fija versiones, verifica repositorios, revisa plugins, genera inventario/SBOM y escanea, pero prioriza por alcanzabilidad y exposición. Una actualización de seguridad necesita tests y procedimiento; ignorar el lock o checksum por urgencia crea otro riesgo.

**Analogía:** deserializar no es leer una carta; es aceptar un kit que puede ensamblar máquinas y ejecutar instrucciones durante el desembalaje. Limitar tamaño y piezas es esencial.

**Casos de uso reales:** import legacy, sesión serializada, RMI/JMX, JSON polimórfico, zip bomb lógica, secreto en resources y plugin Maven comprometido.

**Diagrama:**

```mermaid
flowchart LR
    BYTES["bytes externos"] --> LIMIT["límite de tamaño"] --> PARSER["parser cerrado"]
    PARSER --> TYPES["tipos permitidos"] --> RULES["invariantes"]
    BUILD["dependencias y plugins"] --> VERIFY["checksums y SBOM"] --> UPDATE["actualización probada"]
```

El endurecimiento de la deserialización de este tema es uno de los pasos explícitos del proyecto de endurecimiento medible descrito al final de este módulo, sobre el procesador concurrente del Proyecto integrador.

**Cuándo no usarlo:** si el formato de entrada siempre es JSON con un DTO cerrado (sin serialización nativa de Java involucrada), un `ObjectInputFilter` no aplica; valida el JSON con su propio esquema en su lugar.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-objectinputfilter
cd ejemplo-objectinputfilter
mkdir -p src/main/java/academia/dto
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `academia.dto.ImportBatch implements Serializable` con un campo `List<String> items`. Escribe un `Main.java` que serialice una instancia con `ObjectOutputStream` a un archivo, y luego la deserialice con `ObjectInputStream` **sin** ningún filtro configurado.

#### Paso 5 · Práctica guiada
Pista: modifica deliberadamente los bytes serializados (o construye un flujo con una clase distinta a `ImportBatch`) para provocar que la deserialización sin filtro acepte un tipo inesperado; observa que `ObjectInputStream` no rechaza nada por sí solo. Resultado esperado: agregar `input.setObjectInputFilter(...)` con una allowlist (`academia.dto.*;java.base/java.lang.*;!*`) hace que el flujo con tipo inesperado sea rechazado con `InvalidClassException`.
#### Paso 6 · Práctica independiente
Agrega límites de `maxdepth`, `maxrefs` y `maxbytes` al filtro, y prueba deliberadamente con un `ImportBatch` que contenga una lista anormalmente grande para confirmar que el filtro la rechaza antes de terminar de construir el objeto.

#### Paso 7 · Cierre y evidencia
Guarda la deserialización sin filtro (aceptando cualquier tipo), la versión con `ObjectInputFilter` y allowlist, y la prueba del límite de tamaño rechazado; como siguiente paso empaqueta el runtime mínimo con `jlink`. Errores comunes: activar un filtro global demasiado amplio, y validar invariantes solo después de construir el objeto completo. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/core/serialization-filtering1.html.
**¿Por qué es importante?** porque la frontera convierte bytes controlados externamente en objetos con métodos, memoria y acceso al proceso.

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir un runtime Java mínimo con `jlink` y comparar su tamaño contra el JDK completo. Prerrequisitos: JDK 25 con módulo `jlink` disponible y un editor. Verifica java --version.

#### Paso 2 · Contexto y caso real
Un contenedor Docker que empaqueta el JDK completo (300+ MB) para ejecutar una aplicación que solo usa `java.base`, `java.logging` y `java.net.http` desperdicia espacio, superficie de ataque y tiempo de arranque; un runtime a medida contiene solo lo que la aplicación realmente necesita.

#### Paso 3 · Teoría, modelo mental y analogía
`jdeps` descubre qué módulos JDK usa realmente un JAR; `jlink` enlaza esos módulos (y sus dependencias transitivas) en una imagen de runtime autocontenida. La analogía: jlink construye una caja de herramientas a medida, más liviana, pero que ya no recibe automáticamente herramientas reparadas — quien la empacó debe reconstruirla ante cada parche del JDK.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-jlink-runtime
cd ejemplo-jlink-runtime
mkdir -p src/main/java/academia/runtime
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea una clase mínima que use `java.net.http.HttpClient` para hacer una petición GET. Compílala a un JAR simple, luego ejecuta:
```bash
jdeps --print-module-deps --ignore-missing-deps app.jar
jlink --add-modules java.base,java.net.http --strip-debug --no-header-files --no-man-pages --output build/runtime
du -sh build/runtime "$JAVA_HOME"
```

#### Paso 5 · Práctica guiada
Pista: ejecuta la aplicación con `build/runtime/bin/java -jar app.jar` omitiendo deliberadamente el módulo `java.logging` de `--add-modules` mientras el código lo usa, para provocar un fallo deliberado (`NoClassDefFoundError` o similar por módulo ausente); lee el error. Resultado esperado: agregar el módulo faltante a `--add-modules` corrige el fallo.

#### Paso 6 · Práctica independiente
Compara el tamaño de `build/runtime` contra `$JAVA_HOME` completo (con `du -sh`), y documenta cuántos módulos del JDK completo tu aplicación realmente usa según `jdeps`.

#### Paso 7 · Cierre y evidencia
Guarda la salida de `jdeps`, el runtime generado, el fallo por módulo faltante y su corrección, y la comparación de tamaño; como siguiente paso documenta el procedimiento de reconstrucción ante un parche del JDK. Errores comunes: crear la imagen jlink una sola vez y no reconstruirla ante actualizaciones de seguridad del JDK, y fijar `-Xmx` igual al límite del contenedor sin dejar margen para metaspace y memoria nativa. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jlink.html.
**¿Por qué es importante?** porque diagnósticos, seguridad y uso de memoria dependen del runtime exacto que llega a producción, no del JDK instalado en el portátil.
**Evidencia de aprendizaje:** entrega la comparación de tamaño, el fallo por módulo faltante y su corrección.
**Conceptos clave:** module graph, jdeps, jlink, runtime image, jpackage, CDS, container awareness, heap limit, native memory, PID 1, signal, graceful shutdown, JFR, unified logging, health, update y rollback.

Un JAR no define por sí solo el runtime. Versión y módulos JDK cambian comportamiento y superficie. `jdeps` descubre dependencias; `jlink` enlaza módulos y sus dependencias en una imagen personalizada. Esto reduce tamaño y elimina módulos no usados, pero el equipo se vuelve responsable de reconstruirla cuando el JDK recibe correcciones.

```bash
jdeps --print-module-deps --ignore-missing-deps app.jar
jlink --add-modules java.base,java.logging,java.net.http \
  --strip-debug --no-header-files --no-man-pages \
  --output build/runtime
build/runtime/bin/java -jar app.jar
```

`--print-module-deps` es la bandera que hace que `jdeps` imprima la lista de módulos JDK requeridos en el formato exacto que espera `jlink`; `--ignore-missing-deps` es la bandera que evita que `jdeps` falle si no puede resolver alguna dependencia externa al JDK. En el comando de `jlink`, `--add-modules` es la bandera que fija qué módulos incluir en la imagen; `--strip-debug` es la bandera que quita símbolos de depuración para reducir tamaño; `--no-header-files` es la bandera que excluye archivos de cabecera de desarrollo innecesarios en un runtime; `--no-man-pages` es la bandera que excluye las páginas de manual, también innecesarias en un runtime empaquetado; y `--output` es la bandera que fija la carpeta destino de la imagen generada.

Comprueba que la lista proviene del artefacto real y reflexión/ServiceLoader. `jpackage` crea paquetes nativos cuando la distribución de escritorio lo necesita. Class Data Sharing puede reducir arranque/memoria compartiendo metadatos; mide en el entorno objetivo.

En contenedor, ejecuta usuario no root, filesystem de solo lectura cuando sea posible y volumen solo donde se requiere. Define límites y observa heap, metaspace, code cache, direct buffers, stacks y memoria nativa; `-Xmx` no representa todo RSS. Deja margen respecto al límite del cgroup. Virtual threads reducen stack por tarea, no vuelven infinito el pool de conexiones.

La forma exec garantiza señales al proceso Java. Al recibir SIGTERM, deja de aceptar, espera trabajo con deadline, cierra executors y recursos y termina con estado observable. Un shutdown hook no debe esperar indefinidamente ni depender de otro hook sin orden garantizado.

JFR ofrece eventos de CPU, allocations, locks, I/O y GC con overhead diseñado para diagnóstico. Configura grabación circular o bajo demanda, protege archivos porque pueden contener nombres/paths y correlaciona con logs y métricas. Unified logging (`-Xlog`) es más fiable que una colección de flags históricos.

El despliegue versiona JAR **y runtime**. Prueba compatibilidad de datos y contratos, usa canary, conserva imagen anterior y define rollback. Una migración destructiva no se deshace al volver al contenedor anterior.

**Analogía:** jlink construye una caja de herramientas a medida. Es más liviana, pero ya no recibe automáticamente herramientas reparadas: quien la empacó debe reconstruirla y reemplazarla.

**Casos de uso reales:** imagen mínima, arranque serverless, límite Kubernetes, OOMKill con heap aparentemente bajo, SIGTERM, JFR durante incidente y parche crítico de JDK.

**Diagrama:**

```mermaid
flowchart LR
    SRC["fuentes"] --> BUILD["build"] --> JAR["JAR + módulos"] --> RUNTIME["jlink runtime"]
    RUNTIME --> IMAGE["imagen inmutable"] --> CANARY["canary"] --> PROMOTE["promover o rollback"]
    PATCH["parche JDK"] --> RUNTIME
```

Empaquetar el Proyecto integrador (Módulo 13) con `jlink` cierra el ciclo completo: dominio correcto, benchmarks honestos, deserialización endurecida y runtime versionado.

**Cuándo no usarlo:** si el equipo despliega sobre una imagen base ya optimizada y compartida entre varios servicios, mantener un runtime jlink propio por servicio agrega una carga operativa de reconstrucción que puede no justificarse frente al beneficio de tamaño.

## Revisión oficial de plataforma — octubre de 2026

### Java LTS frente a entregas semestrales

La base de producción recomendada para el curso sigue siendo **Java 25 LTS** (liberada en septiembre de 2025, con soporte bajo NFTC hasta septiembre de 2028, un año después de la próxima LTS); **JDK 27** —liberado el 15 de septiembre de 2026— es la entrega semestral más reciente para estudiar hacia dónde evoluciona la plataforma, sin confundir sus previews con contratos permanentes todavía no finalizados. El set final de JDK 27 incluye nueve JEPs: **G1 como recolector de basura por defecto en todos los entornos** (JEP 523 — G1 ya era el default desde Java 9 en máquinas "server-class", pero en entornos restringidos, con un solo CPU o menos de 1792&nbsp;MB de memoria, la JVM caía a Serial GC; desde JDK 27 usa G1 siempre, salvo que se especifique otro recolector explícitamente), intercambio de claves híbrido poscuántico para TLS 1.3, lazy constants, cabeceras de objeto compactas (compact object headers), redacción de datos en proceso para JFR, una Vector API continuada, codificaciones PEM para objetos criptográficos, coincidencia de patrones con tipos primitivos en `instanceof`/`switch`, y la **séptima ronda de preview** de Structured Concurrency (JEP 533) — que ya fue propuesta como candidata a finalizarse sin cambios adicionales, tras seis rondas previas desde JDK 21. Una preview sigue requiriendo flags explícitos (`--enable-preview`), puede cambiar entre rondas y no debe filtrarse a una API pública estable.

**Aplicación al proyecto:** compila y prueba en 25 y 27, confirma que el recolector por defecto (G1) sigue comportándose igual que antes tras el cambio de JDK 26→27, registra JEP/estado de cada función nueva antes de adoptarla, y evita publicar artefactos que necesiten preview (como Structured Concurrency) salvo decisión explícita y documentada.

## Construcción guiada del capítulo

### Proyecto: endurecimiento medible del procesador concurrente

Parte del proyecto 13 y conserva un tag funcional anterior.

1. Identifica cada estado compartido, su invariante y mecanismo happens-before. Elimina publicación de colecciones mutables.
2. Crea un ejemplo defectuoso de visibilidad y un test jcstress con outcomes aceptables/prohibidos; corrige con el mecanismo mínimo.
3. Compara `volatile`, `AtomicLong`, `LongAdder` y lock únicamente para workloads donde tengan semántica equivalente.
4. Escribe dos benchmarks JMH: uno ingenuo deliberadamente y otro con forks, warmup, parámetros y resultados consumidos. Explica la diferencia.
5. Contrasta la optimización elegida bajo carga del servicio y JFR; revierte si no mejora el objetivo.
6. Sustituye serialización nativa en una entrada por DTO JSON cerrado. Si conservas un caso legacy, aplica filtro y límites.
7. Prueba tipo no permitido, profundidad, array enorme, JSON extra, payload inválido y secreto ausente.
8. Genera SBOM, registra procedencia de dependencias y corrige una vulnerabilidad simulada mediante actualización con tests.
9. Usa `jdeps` y `jlink` para crear runtime mínimo. Compara módulos, tamaño y arranque con JDK completo.
10. Construye contenedor no root con límite de memoria, healthcheck y JFR habilitable. Fuerza carga, SIGTERM y presión de memoria.
11. Documenta reconstrucción ante parche JDK, canary, compatibilidad, backup y rollback.

**Verificación:** entrega grafo happens-before, resultados jcstress, salida JMH con entorno, JFR antes/después, pruebas hostiles, SBOM, módulos jlink, tamaños y runbook. CI ejecuta unitarias, stress acotado, verificación de dependencias y smoke test del runtime personalizado.

**Errores comunes y soluciones**

- Marcar todo volatile: protege visibilidad, no invariantes compuestos; diseña dueño y atomicidad.
- Confiar en que no falló el stress: justifica con JMM y usa stress para buscar ejecuciones.
- Cronometrar un loop: usa JMH y evita trabajo eliminado, constantes y falta de warmup.
- Deserializar y validar después sin límites: limita antes/durante construcción del grafo.
- Activar filtro global amplio: usa allowlist contextual y prueba clases y complejidad.
- Fijar `-Xmx` igual al límite: deja memoria para metaspace, stacks, buffers, JIT y nativa.
- Crear jlink una vez: versiona y reconstruye runtime ante cada actualización relevante.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://docs.oracle.com/en/java/javase/25/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 49 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Lenguaje | `tipos y control` · `objetos` · `records` · `sealed types` · `pattern matching` · `genéricos` · `anotaciones` · `JPMS` | tarifas |
| Biblioteca | `colecciones` · `streams` · `Optional` · `fechas` · `i18n` · `regex` · `NIO.2` · `HTTP Client` · `serialización segura` | tarifas |
| Concurrencia | `Java Memory Model` · `locks` · `atomics` · `concurrent collections` · `CompletableFuture` · `virtual threads` · `scoped values` · `structured concurrency` | tarifas |
| JVM | `bytecode` · `class loading` · `JIT` · `memoria` · `garbage collectors` · `Flight Recorder` · `jcmd y jstack` · `heap dumps` · `CDS y AOT` | tarifas |
| Integración | `JDBC` · `transacciones` · `ServiceLoader` · `reflection` · `method handles` · `Foreign Function and Memory API` · `JNI` | tarifas |
| Calidad | `JUnit` · `property testing` · `JMH` · `profiling` · `secure coding` · `criptografía` · `jlink y jpackage` · `migración LTS` | tarifas |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

