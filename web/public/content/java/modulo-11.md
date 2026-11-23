# Módulo 11: JVM interna — GC, profiling y memoria

Cuando una aplicación Java se vuelve lenta o consume demasiada memoria, el código fuente rara vez explica el síntoma por sí solo. El mecanismo de diagnóstico consiste en observar al runtime mientras trabaja: `-Xlog:gc` registra recolecciones y pausas, Java Flight Recorder (JFR) acumula eventos de la JVM, un heap dump captura la gráfica de objetos y las referencias que los retienen, y la Foreign Function & Memory API (FFM) gestiona memoria nativa con un dueño explícito.

Estas herramientas existen porque el comportamiento de la JVM —cuándo recolecta, qué método compila el JIT, qué objeto mantiene vivo otro— no está determinado únicamente por el código fuente: depende del heap, del recolector, de la carga y de la versión de JDK. La implicación es que toda afirmación de rendimiento necesita evidencia obtenida en el entorno y con el workload que se quiere explicar. La confusión habitual es tunear flags sin medir, o extraer de una microcarga una conclusión válida para producción.

El proyecto verificado es `tienda-aurora-jvm` en `/tmp/opencode/aurora-m11`. Todos los comandos y salidas de este módulo se ejecutaron allí el 2026-11-23.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-11-jvm.html`; regeneración: editar el HTML/SVG en esa ruta):** [Mapa visual de JVM: heap y GC, JFR/JIT, referencias y heap dump, FFM y memoria nativa](/visuals/temas/java/modulo-11-jvm.html)

Lectura: Mapa visual: cada herramienta de diagnóstico responde una pregunta distinta. La evidencia debe tomarse en tu workload y entorno.

## Proyecto verificado

```text
/tmp/opencode/aurora-m11/
├── build.gradle.kts
├── settings.gradle.kts
└── src/main/java/com/aurora/jvm/
    ├── TiendaAuroraJvmApp.java
    └── TrabajoCpu.java
```

No existe `src/test` en este proyecto. La tarea `test` de Gradle se ejecutó y terminó con `NO-SOURCE`; por eso no se afirma en este módulo que haya tests unitarios.

## Prerrequisitos

```bash
java -version
gradle --version
```

Las herramientas del JDK usadas están en `/Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin`: `java`, `jfr`, `jcmd`, `javap`. Entorno observado: JDK 27.0.1.0.2 (Temurin), Gradle 9.9.1, toolchain Java 25, macOS arm64.

## Bootstrap

```bash
mkdir -p tienda-aurora-jvm/src/main/java/com/aurora/jvm
cd tienda-aurora-jvm
gradle wrapper --gradle-version 9.9.1
```

## Código completo, archivo por archivo

Ruta base: `/tmp/opencode/aurora-m11/`.

**`settings.gradle.kts`**

```kotlin
rootProject.name = "tienda-aurora-jvm"
```

**`build.gradle.kts`**

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

application {
    mainClass = "com.aurora.jvm.TiendaAuroraJvmApp"
}

repositories {
    mavenCentral()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-restricted", "-Werror"))
}
```

`-Xlint:-restricted` evita el aviso de compilación por usar métodos restringidos de FFM. La habilitación real de native access se decide en ejecución con `--enable-native-access=ALL-UNNAMED`.

**`src/main/java/com/aurora/jvm/TrabajoCpu.java`**

```java
package com.aurora.jvm;

public final class TrabajoCpu {

    private TrabajoCpu() {
    }

    public static long carga(int iteraciones) {
        long acc = 0;
        for (int i = 1; i <= iteraciones; i++) {
            acc += (long) i * i;
        }
        return acc;
    }

    public static void main(String[] args) {
        int iteraciones = args.length > 0 ? Integer.parseInt(args[0]) : 5_000_000;
        int rondas = args.length > 1 ? Integer.parseInt(args[1]) : 20;
        long total = 0;
        for (int i = 0; i < rondas; i++) {
            total += carga(iteraciones);
            if (i % 5 == 0) {
                System.out.println("ronda=" + i + " total=" + total);
            }
        }
        System.out.println("final=" + total);
    }
}
```

Es una carga CPU determinista para grabar JFR. Los números de línea que aparecen en las muestras de JFR —`TrabajoCpu.carga(int) line: 10` y `TrabajoCpu.main(String[]) line: 21`— corresponden a este archivo.

**`src/main/java/com/aurora/jvm/TiendaAuroraJvmApp.java`**

```java
package com.aurora.jvm;

import java.lang.foreign.Arena;
import java.lang.foreign.FunctionDescriptor;
import java.lang.foreign.Linker;
import java.lang.foreign.MemorySegment;
import java.lang.foreign.SymbolLookup;
import java.lang.foreign.ValueLayout;
import java.lang.invoke.MethodHandle;
import java.lang.ref.PhantomReference;
import java.lang.ref.Reference;
import java.lang.ref.ReferenceQueue;
import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

public final class TiendaAuroraJvmApp {

    private TiendaAuroraJvmApp() {
    }

    public static void main(String[] args) throws Exception {
        String cmd = args.length == 0 ? "demo" : args[0];
        try {
            switch (cmd) {
            case "demo" -> demo();
            case "alloc" -> allocaciones(Integer.parseInt(arg(args, 1, "200000")));
            case "refs" -> referencias();
            case "ffm" -> ffm();
            case "ffm-closed" -> ffmClosed();
            case "leak" -> leak(Integer.parseInt(arg(args, 1, "200")));
            default -> {
                System.err.println("Comando desconocido: " + cmd);
                System.exit(2);
            }
            }
        } catch (Throwable t) {
            t.printStackTrace(System.err);
            System.exit(1);
        }
    }

    private static String arg(String[] args, int index, String def) {
        return args.length > index ? args[index] : def;
    }

    private static void demo() throws Throwable {
        System.out.println("== refs ==");
        referencias();
        System.out.println("== ffm ==");
        ffm();
    }

    private static void allocaciones(int cantidad) {
        long inicio = System.nanoTime();
        long checksum = 0;
        for (int i = 0; i < cantidad; i++) {
            byte[] b = new byte[1024];
            b[0] = (byte) i;
            checksum += b[0];
        }
        long ms = Duration.ofNanos(System.nanoTime() - inicio).toMillis();
        System.out.println("allocaciones=" + cantidad);
        System.out.println("checksum=" + checksum);
        System.out.println("ms=" + ms);
    }

    private static void referencias() throws Exception {
        Object fuerte = new byte[1024 * 32];
        WeakReference<Object> weak = new WeakReference<>(new byte[1024 * 32]);
        SoftReference<Object> soft = new SoftReference<>(new byte[1024 * 32]);

        ReferenceQueue<Object> queue = new ReferenceQueue<>();
        Object phantomTarget = new byte[1024 * 32];
        PhantomReference<Object> phantom = new PhantomReference<>(phantomTarget, queue);

        pedirGc();
        System.out.println("fuertePresente=" + (fuerte != null));
        System.out.println("weakAntesDeLiberar=" + (weak.get() != null));
        System.out.println("softPresente=" + (soft.get() != null));

        phantomTarget = null;
        pedirGc();
        Reference<?> encolada = queue.poll();
        System.out.println("phantomEncolada=" + (encolada == phantom));

        if (fuerte.hashCode() == Integer.MIN_VALUE) {
            System.out.println("imposible");
        }
    }

    private static void pedirGc() throws InterruptedException {
        for (int i = 0; i < 3; i++) {
            System.gc();
            Thread.sleep(50);
        }
    }

    private static void ffm() throws Throwable {
        Linker linker = Linker.nativeLinker();
        SymbolLookup stdlib = linker.defaultLookup();
        MemorySegment strlenAddr = stdlib.find("strlen")
                .orElseThrow(() -> new IllegalStateException("No se encontró strlen"));
        MethodHandle strlen = linker.downcallHandle(strlenAddr,
                FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));

        try (Arena arena = Arena.ofConfined()) {
            MemorySegment cString = arena.allocateFrom("Aurora");
            long len = (long) strlen.invokeExact(cString);
            System.out.println("strlen=" + len);
        }
    }

    private static void ffmClosed() throws Throwable {
        Linker linker = Linker.nativeLinker();
        MemorySegment strlenAddr = linker.defaultLookup().find("strlen")
                .orElseThrow(() -> new IllegalStateException("No se encontró strlen"));
        MethodHandle strlen = linker.downcallHandle(strlenAddr,
                FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));

        Arena arena = Arena.ofConfined();
        MemorySegment cString = arena.allocateFrom("Aurora");
        arena.close();
        try {
            long len = (long) strlen.invokeExact(cString);
            System.out.println("strlen=" + len);
        } catch (IllegalStateException e) {
            System.out.println("error=" + e.getClass().getSimpleName());
        }
    }

    private static void leak(int mb) throws Exception {
        List<byte[]> retencion = new ArrayList<>();
        for (int i = 0; i < mb; i++) {
            retencion.add(new byte[1024 * 1024]);
            if (i % 20 == 0) {
                System.out.println("mb=" + i);
            }
        }
        System.out.println("totalMb=" + retencion.size());
        Files.writeString(Path.of("build/leak.txt"), "mb=" + retencion.size());
    }
}
```

## Comandos ejecutados y salida observada

#### Build y CLI

```bash
cd /tmp/opencode/aurora-m11
./gradlew -q build
./gradlew -q run --args="demo"
```

Salida de `./gradlew -q run --args="demo"`:

```text
== refs ==
fuertePresente=true
weakAntesDeLiberar=false
softPresente=true
phantomEncolada=true
== ffm ==
WARNING: A restricted method in java.lang.foreign.Linker has been called
WARNING: java.lang.foreign.Linker::downcallHandle has been called by com.aurora.jvm.TiendaAuroraJvmApp in an unnamed module (file:/private/tmp/opencode/aurora-m11/build/classes/java/main/)
WARNING: Use --enable-native-access=ALL-UNNAMED to avoid a warning for callers in this module
WARNING: Restricted methods will be blocked in a future release unless native access is enabled

strlen=6
```

La tarea `test` se ejecutó para comprobar el estado del proyecto:

```bash
cd /tmp/opencode/aurora-m11
./gradlew test
```

```text
> Task :compileTestJava NO-SOURCE
> Task :processTestResources NO-SOURCE
> Task :testClasses UP-TO-DATE
> Task :test NO-SOURCE
```

No hay tests en `src/test`; no se reporta “0 fallas en tests” porque no se ejecutó ninguno.

#### GC logs: G1 por defecto

```bash
cd /tmp/opencode/aurora-m11
java -Xms32m -Xmx32m -Xlog:gc -cp build/classes/java/main \
  com.aurora.jvm.TiendaAuroraJvmApp alloc 200000
```

```text
[0.005s][info][gc] Using G1
[0.018s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.310ms
[0.019s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 14M->1M(32M) 0.159ms
[0.020s][info][gc] GC(2) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.155ms
[0.020s][info][gc] GC(3) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.146ms
[0.022s][info][gc] GC(4) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.121ms
[0.023s][info][gc] GC(5) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.108ms
allocaciones=200000
[0.027s][info][gc] GC(6) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.287ms
checksum=-97952
ms=7
```

Las líneas de GC van a stderr y las del programa a stdout; por eso aparecen intercaladas.

#### Comparación G1 frente a ZGC

Mismo comando lógico, mismo heap de 32 MB y misma carga de 300000 asignaciones:

```bash
cd /tmp/opencode/aurora-m11
java -Xms32m -Xmx32m -XX:+UseG1GC -Xlog:gc -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp alloc 300000
java -Xms32m -Xmx32m -XX:+UseZGC -Xlog:gc -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp alloc 300000
```

Salida observada con G1:

```text
[0.004s][info][gc] Using G1
[0.018s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.268ms
[0.018s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 14M->1M(32M) 0.162ms
[0.019s][info][gc] GC(2) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.156ms
[0.020s][info][gc] GC(3) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.173ms
[0.022s][info][gc] GC(4) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.168ms
[0.023s][info][gc] GC(5) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.151ms
[0.027s][info][gc] GC(6) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.395ms
allocaciones=300000
checksum=-149488
ms=8
```

Salida observada con ZGC:

```text
[0.003s][info][gc] Using The Z Garbage Collector
[0.024s][info][gc] GC(0) Major Collection (Warmup)
[0.026s][info][gc] GC(0) Major Collection (Warmup) 4M(12%)->26M(81%) 0.002s
[0.026s][info][gc] GC(1) Major Collection (Warmup)
[0.027s][info][gc] Allocation Stall (main) 0.667ms
[0.028s][info][gc] Allocation Stall (main) 0.477ms
[0.028s][info][gc] GC(2) Minor Collection (Allocation Stall)
[0.029s][info][gc] Allocation Stall (main) 0.419ms
[0.029s][info][gc] GC(2) Minor Collection (Allocation Stall) 32M(100%)->6M(19%) 0.001s
[0.029s][info][gc] GC(3) Minor Collection (Allocation Rate)
[0.029s][info][gc] GC(3) Minor Collection (Allocation Rate) 8M(25%)->8M(25%) 0.000s
[0.029s][info][gc] GC(1) Major Collection (Warmup) 28M(88%)->8M(25%) 0.003s
[0.029s][info][gc] GC(4) Major Collection (Warmup)
[0.029s][info][gc] GC(5) Minor Collection (Allocation Rate)
[0.030s][info][gc] GC(5) Minor Collection (Allocation Rate) 12M(38%)->12M(38%) 0.000s
[0.030s][info][gc] GC(6) Minor Collection (Allocation Rate)
[0.030s][info][gc] GC(6) Minor Collection (Allocation Rate) 16M(50%)->6M(19%) 0.000s
[0.031s][info][gc] GC(7) Minor Collection (Allocation Rate)
[0.031s][info][gc] Allocation Stall (main) 0.076ms
[0.031s][info][gc] GC(7) Minor Collection (Allocation Rate) 20M(62%)->8M(25%) 0.001s
[0.031s][info][gc] GC(4) Major Collection (Warmup) 10M(31%)->8M(25%) 0.002s
[0.032s][info][gc] GC(8) Minor Collection (Allocation Rate)
[0.032s][info][gc] GC(8) Minor Collection (Allocation Rate) 10M(31%)->8M(25%) 0.000s
[0.032s][info][gc] GC(9) Minor Collection (Allocation Rate)
[0.032s][info][gc] GC(9) Minor Collection (Allocation Rate) 8M(25%)->10M(31%) 0.000s
[0.032s][info][gc] GC(10) Minor Collection (Allocation Rate)
[0.032s][info][gc] GC(10) Minor Collection (Allocation Rate) 14M(44%)->10M(31%) 0.000s
allocaciones=300000
checksum=-149488
ms=9
```

Ambas corridas producen el mismo `checksum`, así que el trabajo realizado coincide. G1 muestra pausas `Pause Young` del orden de 0.15–0.40 ms; ZGC muestra `Allocation Stall` y fases `Minor`/`Major` con duraciones de 0.000–0.003 s. El tiempo impreso por el programa (`ms=8` frente a `ms=9`) es una medición de una sola corrida y no sirve para decidir qué recolector es mejor. G1 prioriza regiones con mucho garbage y un objetivo de pausa; ZGC apunta a pausas muy bajas con heaps grandes a cambio de barreras y trabajo concurrente. La comparación correcta usa tu workload, tu heap y métricas de latencia y throughput.

#### JFR: grabación, resumen y hotspot

La grabación se hizo con una ejecución suficientemente larga para que el archivo tenga duración y muestras. La salida del programa se redirigió a `build/jfr/programa-largo.txt`; a continuación se muestran las primeras y últimas líneas leídas de ese archivo.

```bash
cd /tmp/opencode/aurora-m11
JFR=/Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin/jfr
java -XX:StartFlightRecording=filename=build/jfr/m11-largo.jfr,dumponexit=true,settings=profile \
  -cp build/classes/java/main com.aurora.jvm.TrabajoCpu 3000000 12000 \
  > build/jfr/programa-largo.txt 2>&1
head -5 build/jfr/programa-largo.txt
tail -3 build/jfr/programa-largo.txt
$JFR summary build/jfr/m11-largo.jfr
```

Salida de `head -5 build/jfr/programa-largo.txt`:

```text
[0.124s][info][jfr,startup] Started recording 1. No limit specified, using maxsize=250MB as default.
[0.124s][info][jfr,startup] 
[0.124s][info][jfr,startup] Use jcmd 36494 JFR.dump name=1 to copy recording data to file.
ronda=0 total=9000004500000500000
ronda=5 total=-1340205221125654848
```

Salida de `tail -3 build/jfr/programa-largo.txt`:

```text
ronda=11990 total=5601128305118546400
ronda=11995 total=-4739081416007608448
final=-5632551563424711680
```

Salida de `jfr summary build/jfr/m11-largo.jfr` (inicio del resumen):

```text
 Version: 2.1
 Chunks: 1
 Start: 2026-11-23 08:21:20 (UTC)
 Duration: 9 s

 Event Type                              Count  Size (bytes) 
=============================================================
 jdk.NativeLibrary                         956         81040
 jdk.ExecutionSample                       760          7588
 jdk.SystemProcess                         594         58201
 jdk.ModuleExport                          506          5430
 jdk.BooleanFlag                           469         13767
 jdk.ActiveSetting                         381          9450
 jdk.ModuleRequire                         155          1550
 jdk.LongFlag                              136          4236
 jdk.UnsignedLongFlag                       83          2674
```

Muestras reales de `jfr print --events jdk.ExecutionSample --stack-depth 8 build/jfr/m11-largo.jfr`:

```text
jdk.ExecutionSample {
  startTime = 03:21:20.168 (2026-11-23)
  sampledThread = "main" (javaThreadId = 3)
  state = "STATE_RUNNABLE"
  stackTrace = [
    com.aurora.jvm.TrabajoCpu.carga(int) line: 10
    com.aurora.jvm.TrabajoCpu.main(String[]) line: 21
  ]
}

jdk.ExecutionSample {
  startTime = 03:21:20.178 (2026-11-23)
  sampledThread = "main" (javaThreadId = 3)
  state = "STATE_RUNNABLE"
  stackTrace = [
    com.aurora.jvm.TrabajoCpu.carga(int) line: 10
    com.aurora.jvm.TrabajoCpu.main(String[]) line: 21
  ]
}
```

El hotspot observado es `TrabajoCpu.carga(int)` en la línea 10 del bucle, llamada desde `main` en la línea 21. Una grabación corta de la misma carga produjo `Duration: 0 s` y 19 muestras; para obtener evidencia útil se alargó la ejecución hasta 9 s y 760 muestras. No se generó flamegraph: esta es una identificación directa del método con más muestras en el archivo grabado.

#### Referencias especiales

```bash
cd /tmp/opencode/aurora-m11
./gradlew -q run --args="refs"
```

```text
fuertePresente=true
weakAntesDeLiberar=false
softPresente=true
phantomEncolada=true
```

#### Heap dump ante OutOfMemoryError

```bash
cd /tmp/opencode/aurora-m11
java -Xms64m -Xmx64m -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=build/m11-oom.hprof \
  -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp leak 120
ls -lh build/m11-oom.hprof
```

```text
mb=0
mb=20
java.lang.OutOfMemoryError: Java heap space
Dumping heap to build/m11-oom.hprof ...
Heap dump file created [36457187 bytes in 0.010 secs]
java.lang.OutOfMemoryError: Java heap space
	at com.aurora.jvm.TiendaAuroraJvmApp.leak(TiendaAuroraJvmApp.java:140)
	at com.aurora.jvm.TiendaAuroraJvmApp.main(TiendaAuroraJvmApp.java:35)
```

```text
-rw-------@ 1 nicolasruiz  wheel    35M Nov 23 03:21 build/m11-oom.hprof
```

Los números de línea del stack trace coinciden con el código transcrito: la línea 140 es `retencion.add(new byte[1024 * 1024])` y la 35 es la rama `case "leak"` del `main`. El hprof se generó en `build/m11-oom.hprof` con 36457187 bytes. El análisis con Eclipse MAT o VisualVM buscaría el dominator tree para identificar la lista `retencion` como estructura que mantiene vivos los `byte[]`.

#### FFM con y sin native access

```bash
cd /tmp/opencode/aurora-m11
java -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp ffm
java --enable-native-access=ALL-UNNAMED -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp ffm
java --enable-native-access=ALL-UNNAMED -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp ffm-closed
```

Sin la flag, la llamada restringida emite advertencias y termina correctamente:

```text
WARNING: A restricted method in java.lang.foreign.Linker has been called
WARNING: java.lang.foreign.Linker::downcallHandle has been called by com.aurora.jvm.TiendaAuroraJvmApp in an unnamed module (file:/private/tmp/opencode/aurora-m11/build/classes/java/main/)
WARNING: Use --enable-native-access=ALL-UNNAMED to avoid a warning for callers in this module
WARNING: Restricted methods will be blocked in a future release unless native access is enabled

strlen=6
```

Con `--enable-native-access=ALL-UNNAMED`:

```text
strlen=6
```

Con un `Arena` cerrado antes de la llamada:

```text
error=IllegalStateException
```

## Conceptos cubiertos

### Tema 1: Generaciones de memoria y recolectores · Avanzado · 45 min

**Mecanismo.** Un objeto es alcanzable si existe una cadena de referencias desde una raíz GC: variables de stacks activos, campos estáticos, referencias JNI o hilos vivos. El recolector reclama objetos no alcanzables, pero decide cuándo hacerlo según sus heurísticas: salir de un scope no libera memoria de inmediato. La hipótesis generacional observa que la mayoría de los objetos muere joven; por eso el heap se divide en regiones jóvenes y viejas y los objetos que sobreviven varias colecciones pueden promoverse. G1 divide el heap en regiones y prioriza las que contienen más basura; ZGC realiza trabajo concurrente con pausas breves y barreras de lectura.

**Por qué existe.** La asignación y la liberación manuales son propensas a errores; el GC automatiza esa gestión. Los distintos recolectores existen porque no todos los workloads optimizan lo mismo: algunos prefieren throughput y otros latencia p99.

**Implicaciones observadas.** `alloc 200000` con heap de 32 MB y G1 produjo siete pausas young entre 0.108 ms y 0.310 ms y terminó con `ms=7`. Con 300000 asignaciones, G1 registró pausas de 0.151–0.395 ms y `ms=8`; ZGC registró `Allocation Stall` de hasta 0.667 ms y `ms=9`. El `checksum=-149488` fue idéntico en ambas variantes, lo que confirma que se hizo el mismo trabajo. Son microcargas: no permiten concluir qué recolector conviene en producción.

**Confusión común.** Tomar el menor número de milisegundos de una corrida como prueba de que un recolector es mejor. Faltan percentiles de latencia, tamaño de heap real, tasa de asignación y duración suficiente.

### Tema 2: Java Flight Recorder y JIT compilation · Avanzado · 40 min

**Mecanismo.** JFR es un sistema de eventos dentro de la JVM con bajo overhead. `-XX:StartFlightRecording=filename=...,dumponexit=true,settings=profile` inicia una grabación; `jfr summary` muestra duración, chunks y conteo por tipo de evento; `jfr print --events jdk.ExecutionSample --stack-depth 8` expone las pilas muestreadas. El JIT compila a código nativo los métodos calientes mientras la aplicación corre, por lo que las primeras iteraciones de un benchmark miden warmup.

**Por qué existe.** Necesitamos evidencia desde dentro del runtime sin montar un profiler externo pesado. Los eventos permiten correlacionar GC, asignaciones, clases, hilos y muestras de ejecución con lo que hace el programa.

**Implicaciones observadas.** La grabación de 9 s registró `jdk.ExecutionSample` con 760 eventos. Las pilas impresas apuntan a `TrabajoCpu.carga(int) line: 10`, dentro del bucle `acc += (long) i * i`, llamado desde `main` en la línea 21. Esa es una identificación concreta del hotspot en esta corrida. Con una ejecución de 0.26 s, JFR reportó `Duration: 0 s` y solo 19 muestras: la duración importa tanto como el flag `settings=profile`.

**Confusión común.** Esperar un flamegraph de una grabación sin muestras útiles, o atribuir el resultado al JIT sin observar dónde se ejecuta el tiempo. Para medir rendimiento estable se usa JMH (warmup, forks, medición); JFR sirve para observar qué ocurre dentro de la JVM.

### Tema 3: Referencias especiales y heap dumps · Avanzado · 45 min

**Mecanismo.** Una referencia fuerte impide la recolección. `WeakReference` permite recoger el objeto en cuanto no quedan referencias fuertes; `SoftReference` se conserva más tiempo y suele liberarse por presión de memoria; `PhantomReference.get()` siempre devuelve `null` y se usa con `ReferenceQueue` para detectar que el objeto ya fue marcado para limpieza posterior. Un heap dump es una fotografía del heap con objetos, tamaños y cadenas de retención, obtenible con `jcmd <pid> GC.heap_dump`, `jmap` o `-XX:+HeapDumpOnOutOfMemoryError`.

**Por qué existe.** Estas referencias modelan relaciones donde retener el objeto no debe ser obligatorio, como caches. El heap dump responde una pregunta que los logs no pueden responder: qué cadena de referencias mantiene vivo un objeto.

**Implicaciones observadas.** En este JDK, `refs` produjo `weakAntesDeLiberar=false`, `softPresente=true` y `phantomEncolada=true` tras tres `System.gc()` con pausas de 50 ms. El comando `leak 120` con heap de 64 MB terminó en `OutOfMemoryError: Java heap space`, generó un hprof de 36457187 bytes y mostró un stack trace con líneas 140 y 35 que coinciden con el código fuente. `System.gc()` es una sugerencia, no un contrato: en otro entorno la weak podría no haberse limpiado en ese instante.

**Confusión común.** Usar `System.gc()` como parte de la lógica de negocio o confiar en `SoftReference` para garantizar memoria disponible. Ninguno ofrece una garantía de tiempo; para limpieza determinista se prefiere `try-with-resources` o `Cleaner`.

### Tema 4: Foreign Function & Memory API (Java 22) · Experto · 45 min

**Mecanismo.** FFM permite llamar código nativo y gestionar memoria fuera del heap Java. `Linker` enlaza la función, `SymbolLookup` la localiza, `FunctionDescriptor` y `MethodHandle` describen la firma, `MemorySegment` representa la memoria y `Arena` define su ciclo de vida. `Arena.ofConfined()` asigna la memoria a un hilo y `try-with-resources` la cierra de forma determinista. Es una API restringida: requiere `--enable-native-access` para evitar advertencias y posibles bloqueos futuros.

**Por qué existe.** JNI era propenso a errores de firma y de ciclo de vida. FFM hace explícito el dueño de la memoria nativa porque el GC del heap Java no conoce cuándo debe liberar un bloque externo.

**Implicaciones observadas.** La llamada a `strlen("Aurora")` devolvió `strlen=6` tanto con advertencias como con `--enable-native-access=ALL-UNNAMED`. Ese flag eliminó las cuatro líneas `WARNING`. Al cerrar el arena antes de la llamada, el programa imprimió `error=IllegalStateException` en lugar de leer memoria liberada. Una firma nativa incorrecta o un lifetime equivocado pueden causar un crash nativo, no solo una excepción Java.

**Confusión común.** Pensar que las advertencias son el error. Las advertencias indican que native access no se habilitó; el error real de `ffm-closed` es el uso de un segmento después de cerrar su arena.

## Verificación real

Ejecutado el 2026-11-23 en `/tmp/opencode/aurora-m11` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25). `jfr` se invocó desde `/Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home/bin/jfr`.

| Comando (desde `/tmp/opencode/aurora-m11`) | Resultado observado |
|---|---|
| `./gradlew -q build` | exit 0 |
| `./gradlew -q run --args="demo"` | referencias y `strlen=6`, con warnings FFM esperados |
| `./gradlew test` | `test NO-SOURCE`; no hay tests en el proyecto |
| `java ... alloc 200000` con G1 | 7 pausas young, `checksum=-97952`, `ms=7` |
| `alloc 300000` con G1 | pausas 0.151–0.395 ms, `checksum=-149488`, `ms=8` |
| `alloc 300000` con ZGC | `Allocation Stall`, `checksum=-149488`, `ms=9` |
| JFR de 9 s sobre `TrabajoCpu` | `Duration: 9 s`, 760 `jdk.ExecutionSample`, hotspot en `carga(int) line: 10` |
| `./gradlew -q run --args="refs"` | `weakAntesDeLiberar=false`, `softPresente=true`, `phantomEncolada=true` |
| `leak 120` con OOM | stack trace en líneas 140 y 35; hprof de 36457187 bytes |
| `ffm` / `ffm-closed` | `strlen=6` con y sin flag; `error=IllegalStateException` tras cerrar arena |

Los números de GC, duraciones y tamaños son evidencia de este entorno y de esta carga, no constantes de la JVM.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Pausas GC frecuentes | Heap pequeño, alta asignación o recolector inadecuado | `-Xlog:gc` y métricas de latencia/throughput | Ajustar heap y carga; comparar G1/ZGC con el workload real |
| CPU alta sin saber dónde | Método caliente o contención | JFR con `settings=profile` y `jfr print --events jdk.ExecutionSample` | Optimizar el hotspot medido y validar con JMH o nueva grabación |
| JFR con `Duration: 0 s` | Grabación demasiado corta | `jfr summary` muestra pocas muestras | Alargar la ejecución; en este caso de 0.26 s a 9 s |
| `OutOfMemoryError: Java heap space` | Retención accidental o heap insuficiente | `-XX:+HeapDumpOnOutOfMemoryError`, dominator tree en MAT/VisualVM | Eliminar la retención o dimensionar el heap con evidencia |
| `WeakReference` no se limpia | `System.gc()` no es garantía | Resultado distinto entre ejecuciones | No depender de limpieza en tiempo exacto |
| Warnings de FFM | Native access no habilitado | Mensajes `WARNING: A restricted method ...` | `--enable-native-access=ALL-UNNAMED` o configurar el módulo |
| `IllegalStateException` en FFM | Arena cerrada antes de usar el segmento | `error=IllegalStateException` en `ffm-closed` | Mantener la arena viva durante el uso de la memoria |
| “0 fallas” donde no hay tests | `src/test` inexistente | `./gradlew test` reporta `NO-SOURCE` | Añadir tests o no afirmar cobertura de pruebas |

## Cierre

Medir antes de tunear es la regla práctica. Cada herramienta responde una pregunta distinta: GC logs hablan de recolecciones, JFR de eventos del runtime, el heap dump de retención de objetos y FFM de memoria nativa con dueño. Las salidas transcritas permiten comprobar cada afirmación en el mismo entorno.

## Checklist

- Puedo explicar heap, alcanzabilidad y por qué GC no es liberación inmediata.
- Comparé G1 y ZGC con el mismo workload y sé que el trade-off depende del caso.
- Sé grabar JFR, leer `jfr summary` e identificar un hotspot con `jfr print`.
- Distingo Strong, Weak, Soft y Phantom, y no confío en `System.gc()` como contrato.
- Sé generar un heap dump ante OOM y sé qué información buscar en él.
- Uso FFM con `Arena` y entiendo el riesgo de firma y lifetime nativo.
