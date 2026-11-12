# Módulo 14: Java en producción — memoria, benchmarks y runtime seguro

El proyecto anterior usa concurrencia y produce un artefacto reproducible. Ahora debes demostrar que los hilos observan estado válido, que las optimizaciones no engañan tus mediciones, que datos hostiles no construyen objetos arbitrarios y que el runtime puede actualizarse y diagnosticarse. Cada experimento se crea desde una carpeta vacía.

## Aprende construyendo

### Tema 1: Compartir memoria requiere orden y visibilidad · Experto · 60 min

#### Aprende

**Prerrequisito:** JDK 27 y el Módulo 5 (concurrencia: hilos, locks, atomics). Comprueba `java --version`.

**Al terminar podrás:** explicar una relación happens-before, observar un fallo de visibilidad con una espera acotada y corregir una bandera de parada con `volatile` sin confundir visibilidad con atomicidad.

Un `WorkerControl` con una bandera compartida sin sincronización puede seguir leyendo un valor antiguo aunque otro hilo ya haya escrito `true`. El Java Memory Model no promete visibilidad por intuición: una escritura y una lectura necesitan una relación happens-before.

**¿Por qué es importante?** Porque estos defectos dependen del JIT, la arquitectura y el timing; pueden desaparecer al añadir logs y reaparecer bajo carga.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Carrera de datos y resultado permitido por el JMM | Núcleo | `terminado=false` observado sin `volatile` |
| `volatile` como relación happens-before write→read | Núcleo | `terminado=true` tras declarar la bandera `volatile` |
| Otras aristas happens-before (monitor, `start`/`join`) | Núcleo | Explicación con el `join` del ejemplo |
| `volatile` no da atomicidad en read-modify-write | Límite | Contador `long` que pierde incrementos |
| `AtomicLong`/`LongAdder` para secuencia leer-sumar-escribir | Variante | Total exacto con `incrementAndGet()` |
| Publicación segura de colecciones (copia defensiva) | Diagnóstico | `Map.copyOf` antes de publicar por campo `volatile` |
| Inmutabilidad superficial vs profunda en records | Error frecuente | Componente mutable expuesto por referencia |

Cada fila tiene su explicación individual a continuación.

**Carrera de datos y resultado permitido por el JMM (núcleo).** Cuando un hilo escribe `stopped` y otro lo lee sin ninguna arista de sincronización, el JMM no obliga a que la lectura observe la última escritura. El compilador JIT puede izar la lectura fuera del bucle y cachear `false` en un registro, así que el worker gira indefinidamente. No es un bug del hardware: es una ejecución legal del modelo.

**`volatile` como relación happens-before write→read (núcleo).** Declarar la bandera `volatile` crea una arista: toda escritura `volatile` ocurre-antes de cualquier lectura `volatile` posterior del mismo campo. Eso prohíbe cachear el valor e inserta las barreras de memoria necesarias, por lo que el worker observa `true` y termina.

**Otras aristas happens-before, monitor y `start`/`join` (núcleo).** No solo `volatile` establece orden. Desbloquear un monitor ocurre-antes de bloquearlo de nuevo; lo anterior a `Thread.start()` ocurre-antes del arranque del hilo; y todo lo hecho por un hilo ocurre-antes de que `join()` retorne. Por eso leer `control.iterations` tras `worker.join(500)` es seguro solo si el `join` realmente completó.

**`volatile` no da atomicidad en read-modify-write (límite).** `counter++` son tres pasos: leer, sumar, escribir. `volatile` garantiza visibilidad de cada paso individual, pero dos hilos pueden leer el mismo valor antiguo y pisar el incremento del otro. El total final queda por debajo del esperado.

**`AtomicLong`/`LongAdder` para la secuencia completa (variante).** `AtomicLong.incrementAndGet()` ejecuta la secuencia leer-sumar-escribir como una sola operación atómica (CAS). `LongAdder` reparte el conteo en celdas para reducir contención bajo mucha concurrencia. Cualquiera devuelve el total exacto donde `volatile` fallaba.

**Publicación segura de colecciones (diagnóstico).** Un `volatile` publica de forma segura la *referencia*, pero si la colección referenciada es mutable, otro hilo puede verla a medio modificar. `Map.copyOf(...)` crea una copia inmutable antes de publicarla, de modo que quien lea por el campo `volatile` ve un objeto completo y congelado.

**Inmutabilidad superficial vs profunda en records (error frecuente).** Un `record` hace finales sus componentes, pero no copia lo que apuntan. Si guardas un `List` mutable recibido por el constructor, quien tenga esa referencia externa puede mutar el estado del record. La copia defensiva en el constructor compacto cierra ese hueco.

**Analogía:** dos pizarras privadas no se sincronizan solas; `volatile` es el protocolo que hace visible la última escritura.

Escribir y después leer el mismo campo `volatile` establece happens-before. También lo establecen desbloquear y bloquear el mismo monitor, las acciones anteriores a `Thread.start` y la terminación de un hilo antes de que `join` retorne. `volatile` no vuelve atómico `counter++`: para read-modify-write usa `AtomicLong`, `LongAdder` o un lock.

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

Un record tampoco vuelve inmutables sus componentes. Usa `Map.copyOf` u otra copia defensiva antes de publicar colecciones. OpenJDK jcstress permite explorar intercalados, pero una ejecución sin fallo no demuestra corrección.

#### Practica

Crea una carpeta vacía `ejemplo-visibilidad-volatile` y dentro un archivo `Visibilidad.java`:

```java
public final class Visibilidad {
    static final class WorkerControl {
        private boolean stopped;
        private long iterations;

        void stop() {
            stopped = true;
        }

        void runLoop() {
            while (!stopped) {
                iterations++;
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        var control = new WorkerControl();
        var worker = Thread.ofPlatform().start(control::runLoop);
        Thread.sleep(1000);
        control.stop();
        worker.join(500);
        System.out.println("terminado=" + !worker.isAlive());
        System.out.println("iteraciones=" + control.iterations);
        System.exit(worker.isAlive() ? 1 : 0);
    }
}
```

Ejecuta desde esa carpeta:

```bash
java Visibilidad.java
```

El `join` acotado y `System.exit` evitan que el experimento quede colgado. En una ejecución observada con JDK 27 se obtuvo `terminado=false`; el JMM permite ese resultado, pero no garantiza que ocurra en todas las máquinas o ejecuciones. No uses `iteraciones` como medición fiable: también hay una carrera de datos.

**Corrección:** cambia la declaración a `private volatile boolean stopped;` y vuelve a ejecutar. El hilo debe terminar y el programa debe mostrar `terminado=true`.

**Fallo deliberado adicional:** sustituye la bandera por un contador `long` incrementado desde dos threads hasta un millón por thread. El total puede ser menor que dos millones. Añadir `volatile` no corrige la secuencia leer-sumar-escribir; reemplázala por `AtomicLong.incrementAndGet()`.

**Si falla.** Si la versión sin `volatile` termina, no concluyas que sea correcta: has observado otra ejecución permitida. Conserva la explicación happens-before y repite solo si necesitas volver a observar el síntoma.

#### Aplica

Crea `ConfiguracionRuta.java` con un record que reciba un `Map<String, Integer>` y haga una copia defensiva. Publica una instancia mediante un campo `volatile` y escribe dos clases: una actualiza la configuración completa y otra la lee. Añade un contador con `AtomicLong` y explica por qué no usas `volatile` para incrementarlo.

**Cuándo no usarlo:** `volatile` no protege invariantes compuestos ni secuencias leer-modificar-escribir; usa `AtomicLong`, un lock o una operación atómica que abarque el invariante completo.

**Checklist de salida**

- [ ] La bandera de parada es `volatile`.
- [ ] La espera del experimento está acotada.
- [ ] Una ejecución sin fallo no se presenta como prueba formal.
- [ ] Los incrementos compuestos usan atomicidad.
- [ ] Las colecciones publicadas tienen copia defensiva.
- [ ] Cada mecanismo se relaciona con su garantía happens-before.

**Proyecto integrador:** revisa el procesador del Módulo 13, enumera su estado compartido y documenta el mecanismo de publicación de cada dato.

**Errores comunes:** marcar todo `volatile`, publicar `this` desde un constructor y confundir inmutabilidad superficial con profunda.

Fuentes oficiales revisadas el 2026-11-01: [Java Language Specification, capítulo 17 (Threads and Locks)](https://docs.oracle.com/javase/specs/jls/se27/html/jls-17.html) · [`AtomicLong`](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/concurrent/atomic/AtomicLong.html) · [`LongAdder`](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/concurrent/atomic/LongAdder.html).

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo · Experto · 65 min

#### Aprende

**Prerrequisito:** JDK 27, Maven 3.9 o superior (Módulo 8) y la medición ingenua con `System.nanoTime()`. Comprueba `java --version` y `mvn -version`.

**Al terminar podrás:** construir un benchmark JMH con calentamiento, parámetros y consumo de resultados, y distinguir una operación medida de otra eliminable por el JIT.

Una sola llamada a `System.nanoTime()` mezcla carga de clases, compilación, GC y planificación. Si el resultado no se devuelve ni se consume, el JIT puede eliminar el cálculo. JMH organiza warmup, iteraciones y forks.

**¿Por qué es importante?** Porque una medición falsa puede justificar una optimización que empeora el servicio real.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Dead code elimination del JIT | Prerrequisito | `linearEliminable` con tiempo anormalmente bajo |
| Consumir resultado: retorno vs `Blackhole` | Núcleo | `linearDevuelto` y `linearConsumido` miden trabajo real |
| Warmup, forks e iteraciones | Núcleo | Flags `-wi -w -i -r -f` en la ejecución |
| `@State`, `@Setup` y `@Param` | Núcleo | Setup fuera de la medición, dos tamaños parametrizados |
| Procesador de anotaciones genera `BenchmarkList` | Diagnóstico | `annotationProcessorPaths` en el POM |
| `Score` vs `Error` (distribución, no un número) | Decisión | Columnas comparadas en la salida |
| Microbenchmark ≠ latencia de usuario | Límite | Conclusión contrastada con carga y JFR |

Cada fila tiene su explicación individual a continuación.

**Dead code elimination del JIT (prerrequisito).** Si un método calcula un valor que nadie lee, el compilador C2 puede eliminar el cálculo completo porque no tiene efectos observables. El benchmark reportaría un tiempo cercano a cero que no mide nada. Entender esto es condición previa para leer cualquier resultado.

**Consumir el resultado: retorno vs `Blackhole` (núcleo).** Hay dos formas de impedir la eliminación. Un `@Benchmark` que **devuelve** el valor ya lo entrega a JMH, que lo consume por ti. En un método `void` debes pasar el valor a `Blackhole.consume(...)`, que simula un uso opaco al optimizador. Usar las dos a la vez es redundante.

**Warmup, forks e iteraciones (núcleo).** El warmup deja que el JIT compile el código caliente antes de medir; las iteraciones recogen varias muestras; los forks repiten en JVM nuevas para exponer varianza entre procesos (profile pollution, layout de memoria). Una sola iteración en una sola JVM no es un benchmark, es una anécdota.

**`@State`, `@Setup` y `@Param` (núcleo).** `@State(Scope.Thread)` da estado por hilo sin compartirlo accidentalmente; `@Setup` prepara los datos *fuera* del tiempo medido para no cronometrar la construcción de la lista; `@Param` ejecuta el mismo benchmark con varios tamaños, revelando cómo escala en lugar de dar un único punto.

**El procesador de anotaciones genera `BenchmarkList` (diagnóstico).** JMH no usa reflexión en tiempo de ejecución: un annotation processor genera clases y el recurso `META-INF/BenchmarkList` en compilación. Si falta `annotationProcessorPaths` en el POM, el JAR arranca pero no encuentra benchmarks y falla con `Unable to find the resource: /META-INF/BenchmarkList`.

**`Score` frente a `Error` (decisión).** El resultado no es un número sino una distribución. `Score` es la media y `Error` el intervalo de confianza. Dos implementaciones cuyos intervalos se solapan no son distinguibles con esos datos; decidir solo por el `Score` ignora el ruido de la medición.

**Microbenchmark ≠ latencia de usuario (límite).** JMH mide una función aislada y caliente. No captura GC bajo carga real, contención entre peticiones, I/O de red ni colas. Una mejora en nanosegundos puede ser irrelevante o incluso negativa en p99; por eso la conclusión se contrasta con carga end-to-end y JFR.

**Analogía:** cronometrar a un atleta mientras se ata los zapatos mezcla preparación y carrera.

Un método `@Benchmark` que **devuelve** el resultado ya lo pone a disposición de JMH. No necesita además `Blackhole`. En un método `void`, consume el resultado con `Blackhole` para que no quede muerto.

```mermaid
flowchart LR
    Q["pregunta"] --> W["workload"] --> JMH["warmup · forks · iteraciones"]
    JMH --> DIST["distribución y error"]
    DIST --> JFR["JFR y carga del servicio"] --> USER["impacto de usuario"]
```

Un microbenchmark explica una función, no la latencia de usuario. Registra JDK, CPU, SO, flags, forks, error e intervalos; confirma después con carga y JFR.

#### Practica

Crea `ejemplo-jmh-cronometro/pom.xml` manualmente. Declara el artefacto `search-benchmark`, `maven.compiler.release` en `27`, UTF-8 y la propiedad `jmh.version` en `1.37`. Añade dependencias `jmh-core` y `jmh-generator-annprocess` con esa versión; la segunda usa ámbito `provided`.

Dentro de `build/plugins`, añade `maven-compiler-plugin` `3.14.1` con esta ruta de procesamiento:

```xml
<configuration>
  <annotationProcessorPaths>
    <path>
      <groupId>org.openjdk.jmh</groupId>
      <artifactId>jmh-generator-annprocess</artifactId>
      <version>${jmh.version}</version>
    </path>
  </annotationProcessorPaths>
</configuration>
```

Añade `maven-shade-plugin` `3.6.2`, ejecútalo en la fase `package` con el goal `shade`, fija `finalName` a `benchmarks` y configura `ManifestResourceTransformer` con `org.openjdk.jmh.Main` como `mainClass`.

Crea `src/main/java/academia/bench/SearchBenchmark.java`:

```java
package academia.bench;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.infra.Blackhole;

@State(Scope.Thread)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
public class SearchBenchmark {
    @Param({"100", "10000"})
    int size;
    List<Integer> values;

    @Setup
    public void setup() {
        values = IntStream.range(0, size).boxed().toList();
    }

    @Benchmark
    public void linearConsumido(Blackhole blackhole) {
        blackhole.consume(values.indexOf(size - 1));
    }

    @Benchmark
    public int linearDevuelto() {
        return values.indexOf(size - 1);
    }

    @Benchmark
    public void linearEliminable() {
        int result = values.indexOf(size - 1);
    }
}
```

Compila y ejecuta una medición corta de diagnóstico:

```bash
mvn clean package
java -jar target/benchmarks.jar -wi 1 -w 1s -i 2 -r 1s -f 1
```

**Resultado esperado (verificado con Temurin 27.0.1):** JMH genera `META-INF/BenchmarkList` y ejecuta seis combinaciones: tres métodos por dos tamaños. En una corrida de diagnóstico se obtuvo una tabla como esta (tus números variarán):

```text
Benchmark                         (size)  Mode  Cnt     Score   Error  Units
SearchBenchmark.linearConsumido      100  avgt    2    43,884          ns/op
SearchBenchmark.linearConsumido    10000  avgt    2  8631,106          ns/op
SearchBenchmark.linearDevuelto       100  avgt    2    43,531          ns/op
SearchBenchmark.linearDevuelto     10000  avgt    2  5182,169          ns/op
SearchBenchmark.linearEliminable     100  avgt    2    35,678          ns/op
SearchBenchmark.linearEliminable   10000  avgt    2  5251,819          ns/op
```

Compara las columnas `Score` y `Error`, no solo una ejecución; con `Cnt 2` el error ni siquiera se calcula, señal de que faltan muestras para una conclusión publicable. Para un resultado publicable aumenta warmups, iteraciones y forks.

**Fallo deliberado:** `linearEliminable` ya contiene el error de diseño: calcula un resultado local que nadie usa, así que el JIT tiene permiso para eliminarlo. Observa un matiz importante en JDK 27: esta JVM soporta *Compiler Blackholes* y JMH lo avisa explícitamente ("Current JVM experimentally supports Compiler Blackholes"). Por eso, con un tamaño grande, `linearEliminable` puede salir con un tiempo parecido a los otros dos en vez de caer a cero: la máquina a veces no logra eliminar del todo el `indexOf`. Esa aparente normalidad es precisamente la trampa: no debes confiar en que un método sin consumo mida trabajo real, porque en otra JVM, otro JDK o con otro código sí se eliminará. Restaura el consumo devolviendo `result` o pasándolo a `Blackhole` para no depender del azar del optimizador.

**Si falla.** Si aparece `Unable to find the resource: /META-INF/BenchmarkList`, falta el procesador de anotaciones en la compilación; revisa `annotationProcessorPaths` y vuelve a ejecutar `mvn clean package`.

#### Aplica

Añade `Collections.binarySearch(values, size - 1)` como cuarto benchmark y el tamaño `1000000`. Ejecuta la configuración completa elegida y documenta el entorno. Escribe una conclusión condicionada a los datos; después contrasta el resultado con una carga del servicio.

**Cuándo no usarlo:** si dos implementaciones difieren claramente en orden de complejidad, el análisis puede bastar; reserva JMH para una pregunta acotada y confirma cualquier mejora con carga end-to-end y percentiles de usuario.

**Checklist de salida**

- [ ] El proyecto y el POM se crearon manualmente.
- [ ] El procesador JMH genera la lista de benchmarks.
- [ ] Cada cálculo se devuelve o se consume.
- [ ] La preparación queda fuera de la operación medida.
- [ ] La medición incluye warmup, iteraciones y forks.
- [ ] La conclusión registra error y entorno.

**Proyecto integrador:** formula una pregunta de optimización del procesador del Módulo 13 y conserva el benchmark que la responde.

**Errores comunes:** cronometrar una sola llamada, medir setup accidentalmente y extrapolar nanosegundos a latencia de usuario.

Fuentes oficiales revisadas el 2026-11-01: [OpenJDK JMH](https://openjdk.org/projects/code-tools/jmh/) · [JMH samples (ejemplos canónicos)](https://github.com/openjdk/jmh/tree/master/jmh-samples/src/main/java/org/openjdk/jmh/samples) · [maven-compiler-plugin: `annotationProcessorPaths`](https://maven.apache.org/plugins/maven-compiler-plugin/compile-mojo.html#annotationProcessorPaths).

### Tema 3: Deserializar es permitir construcción y comportamiento · Experto · 60 min

#### Aprende

**Prerrequisito:** JDK 27, records (Módulo 7) e I/O de bytes (`ObjectInputStream`/`ObjectOutputStream`).

**Al terminar podrás:** crear una deserialización nativa acotada con `ObjectInputFilter`, aceptar un DTO permitido y rechazar un tipo inesperado antes de usarlo.

La serialización nativa puede ejecutar callbacks mientras reconstruye un grafo. Para entradas nuevas prefiere JSON con DTO cerrado y validación; conserva `ObjectInputStream` solo en una frontera legacy controlada.

**¿Por qué es importante?** Porque los bytes externos se convierten en objetos con memoria y comportamiento dentro del proceso.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Deserialización ejecuta construcción, no solo lectura | Prerrequisito | `Unexpected` se materializa sin filtro |
| Allowlist por patrón terminada en `!*` | Núcleo | `con-filtro=InvalidClassException: REJECTED` |
| `java.base/*` necesario para tipos internos | Diagnóstico | Lote válido rechazado al quitar esa regla |
| Límites `maxdepth`/`maxrefs`/`maxbytes` | Núcleo | Payload profundo o enorme rechazado |
| El filtro no sustituye validación del DTO | Límite | Invariantes validados tras construir |
| Preferir JSON con DTO cerrado para entradas nuevas | Decisión | Alternativa sin `ObjectInputFilter` |
| Allowlist, no denylist de gadgets | Error frecuente | Regla positiva mínima en vez de lista negra |

Cada fila tiene su explicación individual a continuación.

**Deserialización ejecuta construcción, no solo lectura (prerrequisito).** `ObjectInputStream.readObject()` no copia datos pasivos: reconstruye un grafo de objetos invocando mecanismos internos y posibles callbacks (`readObject`, `readResolve`). Antes de que tu código toque nada, los bytes ya han dirigido la creación de instancias. Por eso el control debe ocurrir *durante* la construcción, no después.

**Allowlist por patrón terminada en `!*` (núcleo).** `ObjectInputFilter.Config.createFilter(...)` acepta patrones separados por `;`. Un patrón positivo (`academia.dto.ImportBatch`) permite; uno con `!` (`!*`) deniega. El `!*` final cierra la lista: todo lo no permitido explícitamente se rechaza con `InvalidClassException` y status `REJECTED`, antes de instanciar la clase.

**`java.base/*` necesario para tipos internos (diagnóstico).** Un DTO casi nunca viaja solo: un `List` arrastra `ArrayList` y su array interno `[Ljava.lang.Object;`, todos en el módulo `java.base`. Si tu allowlist no permite `java.base/*`, el filtro rechaza esas clases de apoyo y hasta el lote legítimo falla. El ajuste correcto no es abrir `*`, sino permitir las clases de `java.base` que el grafo realmente usa.

**Límites `maxdepth`/`maxrefs`/`maxbytes` (núcleo).** Aunque todos los tipos estén permitidos, un atacante puede enviar un grafo muy profundo o muy grande para agotar memoria o pila (denegación de servicio). `maxdepth` acota anidamiento, `maxrefs` el número de referencias y `maxbytes` el tamaño del stream. Son defensa de recursos, complementaria a la de tipos.

**El filtro no sustituye la validación del DTO (límite).** Que el tipo sea `ImportBatch` no garantiza que sus datos sean válidos: la lista podría venir vacía o con códigos en blanco. El filtro controla *qué clase* se construye, no *qué valores* contiene. Los invariantes de negocio se comprueban después, en el constructor compacto o en una validación explícita.

**Preferir JSON con DTO cerrado para entradas nuevas (decisión).** La serialización nativa acopla el formato al grafo de clases y a su comportamiento. Para una frontera nueva, un parser JSON que mapea a un DTO cerrado no ejecuta callbacks arbitrarios ni reconstruye tipos sorpresa, así que no necesita `ObjectInputFilter`. Reserva `ObjectInputStream` para un borde legacy que no puedas cambiar.

**Allowlist, no denylist de gadgets (error frecuente).** Mantener una lista negra de "clases peligrosas conocidas" siempre va por detrás: aparece una cadena de gadgets nueva y el filtro no la cubre. Una allowlist positiva, mínima y terminada en `!*` invierte la carga: solo entra lo que declaraste necesario.

**Analogía:** no es leer una carta, sino aceptar un kit que puede ensamblar máquinas durante el desembalaje.

Una allowlist restringe tipos; `maxdepth`, `maxrefs` y `maxbytes` limitan complejidad. Después valida invariantes del DTO. El filtro no reemplaza autenticación, límites HTTP ni validación de negocio.

```mermaid
flowchart LR
    BYTES["bytes externos"] --> LIMIT["límite de tamaño"] --> PARSER["parser cerrado"]
    PARSER --> TYPES["tipos permitidos"] --> RULES["invariantes"]
    BUILD["dependencias y plugins"] --> VERIFY["checksums y SBOM"] --> UPDATE["actualización probada"]
```

#### Practica

Crea `ejemplo-objectinputfilter/academia/dto/ImportBatch.java`:

```java
package academia.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

public record ImportBatch(List<String> items) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
```

Crea `academia/dto/Unexpected.java` para representar un tipo que nunca debe entrar en este protocolo:

```java
package academia.dto;

import java.io.Serial;
import java.io.Serializable;

public record Unexpected(String value) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
```

Crea en la carpeta raíz `FiltroDemo.java`:

```java
import academia.dto.ImportBatch;
import academia.dto.Unexpected;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public final class FiltroDemo {
    static byte[] serialize(Object value) throws IOException {
        var bytes = new ByteArrayOutputStream();
        try (var output = new ObjectOutputStream(bytes)) {
            output.writeObject(value);
        }
        return bytes.toByteArray();
    }

    static Object read(byte[] bytes, boolean filtered) throws Exception {
        try (var input = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            if (filtered) {
                input.setObjectInputFilter(ObjectInputFilter.Config.createFilter(
                        "maxdepth=8;maxrefs=100;maxbytes=4096;"
                        + "academia.dto.ImportBatch;java.base/*;!*"));
            }
            return input.readObject();
        }
    }

    public static void main(String[] args) throws Exception {
        byte[] valid = serialize(new ImportBatch(new ArrayList<>(List.of("RF-1"))));
        System.out.println("valido=" + read(valid, true));

        byte[] unexpected = serialize(new Unexpected("tipo inesperado"));
        System.out.println("sin-filtro=" + read(unexpected, false).getClass().getName());
        try {
            System.out.println(read(unexpected, true));
        } catch (Exception e) {
            System.out.println("con-filtro=" + e.getClass().getSimpleName()
                    + ": " + e.getMessage());
        }
    }
}
```

Compila y ejecuta:

```bash
javac -d out academia/dto/ImportBatch.java academia/dto/Unexpected.java FiltroDemo.java
java -cp out FiltroDemo
```

**Resultado esperado:** primero aparece `valido=ImportBatch[items=[RF-1]]`; después `sin-filtro=academia.dto.Unexpected` y finalmente `con-filtro=InvalidClassException: filter status: REJECTED`. El filtro por sí solo no sustituye la comprobación del DTO ni la validación de sus campos.

**Fallo deliberado:** elimina `java.base/*` dejando únicamente el DTO y `!*`. La deserialización del lote válido también será rechazada porque `ArrayList` y su array interno necesitan clases de `java.base`. Restaura la regla y reduce después la allowlist a las clases estrictamente necesarias, incluidos los arrays observados.

**Si falla.** `filter status: REJECTED` indica que debes identificar qué clase o límite rechazó el filtro; no respondas abriendo `!*` a `*`. Ajusta una regla concreta y vuelve a probar el tipo hostil.

#### Aplica

Añade en `ImportBatch` una validación que rechace listas vacías y códigos en blanco. Prueba un lote con más de cien referencias y otro que supere 4096 bytes. Después crea una alternativa JSON con DTO cerrado y documenta por qué ya no necesita `ObjectInputFilter`.

**Checklist de salida**

- [ ] El DTO y el programa se escribieron desde cero.
- [ ] La allowlist termina en `!*`.
- [ ] Profundidad, referencias y bytes tienen límites.
- [ ] El DTO válido se deserializa correctamente.
- [ ] El tipo inesperado se diagnostica sin usarse.
- [ ] Los invariantes se validan antes de procesar el lote.

**Proyecto integrador:** aísla la entrada legacy del procesador detrás de un adaptador y conserva las pruebas hostiles.

**Errores comunes:** usar una denylist de gadgets, ampliar el filtro hasta aceptar todo y validar solo después de construir un grafo ilimitado.

Fuentes oficiales revisadas el 2026-11-01: [Serialization Filtering](https://docs.oracle.com/en/java/javase/27/core/serialization-filtering1.html) · [`ObjectInputFilter`](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/io/ObjectInputFilter.html).

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida · Experto · 60 min

#### Aprende

**Prerrequisito:** JDK 27 con `jdeps` y `jlink`, y JPMS/módulos (Módulo 10); comprueba `java --version`.

**Al terminar podrás:** derivar módulos desde un JAR, construir un runtime con `jlink`, ejecutar la aplicación dentro de ese runtime y diagnosticar un módulo ausente.

Un JAR no define el runtime. `jdeps` descubre dependencias y `jlink` enlaza módulos en una imagen autocontenida. Reduce tamaño y módulos incluidos, pero el equipo debe reconstruirla con cada actualización relevante del JDK.

**¿Por qué es importante?** Porque seguridad, diagnóstico y memoria dependen del runtime exacto desplegado, no del JDK del portátil.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `jdeps --print-module-deps` descubre módulos | Prerrequisito | Sale `java.base,java.logging,java.net.http` |
| `jlink` enlaza una imagen autocontenida | Núcleo | `build/runtime/bin/java -jar app.jar` arranca |
| Módulo ausente ⇒ fallo en ejecución | Diagnóstico | `NoClassDefFoundError` sin `java.util.logging` |
| Detección estática no ve reflexión/`ServiceLoader` | Límite | Módulo dinámico declarado tras probar |
| `-Xmx` no cubre memoria no-heap | Error frecuente | Margen para metaspace, stacks, buffers |
| Ciclo de vida: reconstruir ante parche del JDK | Decisión | Runbook con versión, canary y rollback |

Cada fila tiene su explicación individual a continuación.

**`jdeps --print-module-deps` descubre los módulos (prerrequisito).** Un JAR no declara qué módulos del JDK necesita. `jdeps` analiza el bytecode y, con `--print-module-deps`, imprime la lista exacta de módulos del sistema que usa el código. Esa lista es la entrada directa para `jlink`; no se adivina a ojo.

**`jlink` enlaza una imagen autocontenida (núcleo).** `jlink` toma esos módulos y produce un runtime completo que incluye su propio `bin/java`. La aplicación corre con ese runtime sin necesitar un JDK instalado en la máquina destino, lo que reduce tamaño y superficie de ataque frente a enviar el JDK entero.

**Un módulo ausente provoca fallo en ejecución (diagnóstico).** Si construyes la imagen sin un módulo que el código realmente usa, no hay error al enlazar: el fallo aparece al ejecutar, típicamente como `NoClassDefFoundError` al cargar la clase de ese módulo. El síntoma apunta directo al módulo que faltó añadir.

**La detección estática no ve reflexión ni `ServiceLoader` (límite).** `jdeps` sigue referencias en el bytecode, pero una clase cargada por `Class.forName(nombre)` o un proveedor descubierto por `ServiceLoader` no aparece como dependencia estática. Esos módulos hay que declararlos a mano tras confirmarlo con una prueba de ejecución; no se resuelve metiendo todos los módulos a ciegas.

**`-Xmx` no cubre la memoria no-heap (error frecuente).** `-Xmx` limita solo el heap. Metaspace, pilas de hilos, buffers directos y memoria nativa quedan fuera. Fijar `-Xmx` igual al límite del contenedor deja a la JVM sin espacio para esas regiones y el orquestador la mata por OOM; hay que dejar margen.

**Ciclo de vida: reconstruir ante un parche del JDK (decisión).** La imagen de `jlink` es inmutable: no recibe parches de seguridad del JDK sola. Cuando sale una actualización relevante hay que reconstruirla, versionarla junto al JAR, promoverla con un canary y mantener un rollback compatible con los datos. El runtime pasa a ser parte del artefacto versionado.

**Analogía:** una caja de herramientas a medida es más liviana, pero no recibe herramientas reparadas hasta que la reconstruyes.

```mermaid
flowchart LR
    SRC["fuentes"] --> BUILD["build"] --> JAR["JAR + módulos"] --> RUNTIME["jlink runtime"]
    RUNTIME --> IMAGE["imagen inmutable"] --> CANARY["canary"] --> PROMOTE["promover o rollback"]
    PATCH["parche JDK"] --> RUNTIME
```

`-Xmx` limita heap, no metaspace, stacks, buffers ni memoria nativa. En contenedor deja margen, usa usuario no root y forma exec para recibir señales. Versiona JAR y runtime, y define rollback compatible con los datos.

#### Practica

Crea `ejemplo-jlink-runtime/src/academia/runtime/RuntimeDemo.java`. Construye un `HttpClient` y un `HttpRequest`, pero no envíes tráfico: el objetivo es comprobar módulos, no depender de una red.

```java
package academia.runtime;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.util.logging.Logger;

public final class RuntimeDemo {
    private static final Logger LOG = Logger.getLogger(RuntimeDemo.class.getName());

    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder(
                URI.create("http://127.0.0.1:9/salud")).GET().build();
        LOG.info(() -> "cliente=" + client.version() + ", destino=" + request.uri());
    }
}
```

Compila, empaqueta y consulta los módulos:

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 27)"
export PATH="$JAVA_HOME/bin:$PATH"
javac -d classes src/academia/runtime/RuntimeDemo.java
jar --create --file app.jar --main-class academia.runtime.RuntimeDemo -C classes .
jdeps --print-module-deps --ignore-missing-deps app.jar
```

**Resultado esperado:** `java.base,java.logging,java.net.http`. Construye y ejecuta el runtime completo:

```bash
jlink --add-modules java.base,java.logging,java.net.http \
  --strip-debug --no-header-files --no-man-pages \
  --output build/runtime
build/runtime/bin/java -jar app.jar
du -sh build/runtime "$JAVA_HOME"
```

Debe aparecer un log con `cliente=HTTP_2` y el URI local. En el entorno de referencia el runtime ocupó 48 MB frente a 296 MB del JDK; tus cifras pueden variar y debes medirlas en tu máquina.

**Fallo deliberado:** crea otra imagen con `--add-modules java.base,java.net.http --output build/runtime-sin-log` y ejecútala. La aplicación fallará por la ausencia de `java.util.logging`, normalmente con `NoClassDefFoundError`. Reconstruye con los tres módulos indicados por `jdeps`.

**Si falla.** Si `jdeps` no muestra un módulo usado solo mediante reflexión o `ServiceLoader`, la detección estática no basta: declara esa necesidad tras una prueba de ejecución. No añadas todos los módulos para ocultar el diagnóstico.

#### Aplica

Genera el argumento `--add-modules` desde la salida real de `jdeps`, documenta los módulos y compara tamaños. Añade un `Runtime.getRuntime().addShutdownHook(...)` que cierre un recurso con deadline y escribe un runbook para reconstruir el runtime ante un parche del JDK.

**Checklist de salida**

- [ ] El JAR contiene la clase creada manualmente.
- [ ] `jdeps` identifica los tres módulos.
- [ ] El runtime personalizado ejecuta el JAR.
- [ ] El fallo por módulo ausente queda diagnosticado.
- [ ] Los tamaños se miden en el entorno actual.
- [ ] El runbook versiona y reconstruye JAR y runtime.

**Proyecto integrador:** empaqueta el procesador del Módulo 13 con su runtime y conserva el artefacto anterior para rollback.

**Errores comunes:** crear la imagen una sola vez, fijar `-Xmx` igual al límite del contenedor y olvidar dependencias dinámicas.

Fuentes oficiales revisadas el 2026-11-01: [jlink](https://docs.oracle.com/en/java/javase/27/docs/specs/man/jlink.html) · [jdeps](https://docs.oracle.com/en/java/javase/27/docs/specs/man/jdeps.html).

## Revisión oficial de plataforma — octubre de 2026

Para producción, la base recomendada sigue siendo la LTS más reciente, **Java 25 LTS**. El curso exige **JDK 27** para estudiar la evolución de la plataforma sin confundir previews con contratos permanentes. Antes de adoptar una función nueva registra su JEP y estado, compila y prueba en el JDK objetivo y evita publicar artefactos que necesiten `--enable-preview` salvo decisión explícita.

## Construcción guiada del capítulo

### Proyecto: endurecimiento medible del procesador concurrente

Parte del proyecto creado en el Módulo 13 y conserva una copia funcional anterior.

1. Identifica cada estado compartido, su invariante y mecanismo happens-before.
2. Crea el experimento de visibilidad y corrígelo con el mecanismo mínimo.
3. Compara `volatile`, `AtomicLong`, `LongAdder` y lock solo donde tengan semántica equivalente.
4. Escribe benchmarks JMH con forks, warmup, parámetros y resultados consumidos.
5. Contrasta la optimización bajo carga del servicio y JFR; revierte si no mejora el objetivo.
6. Sustituye serialización nativa por DTO JSON cerrado; si conservas un caso legacy, aplica filtro y límites.
7. Prueba tipo no permitido, profundidad, array enorme, payload inválido y secreto ausente.
8. Fija versiones, registra dependencias y prueba cualquier actualización.
9. Usa `jdeps` y `jlink`; compara módulos, tamaño y arranque.
10. Construye el despliegue no root con límite de memoria, healthcheck y JFR habilitable.
11. Documenta parche JDK, canary, compatibilidad, backup y rollback.

**Verificación:** entrega grafo happens-before, salida JMH con entorno, pruebas hostiles, módulos jlink, tamaños y runbook. La revisión de jcstress, SBOM, contenedor y análisis visual de JFR permanece como revisión manual pendiente si no se ejecuta en el entorno correspondiente.

**Errores comunes y soluciones**

- Marcar todo volatile: protege visibilidad, no invariantes compuestos.
- Confiar en que no falló el stress: justifica con el JMM.
- Cronometrar un loop: usa JMH y consume resultados.
- Deserializar sin límites: restringe durante la construcción del grafo.
- Fijar `-Xmx` igual al límite: deja margen para memoria no heap.
- Crear jlink una vez: reconstruye ante actualizaciones del JDK.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://docs.oracle.com/en/java/javase/25/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 49 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Resultado verificable |
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
