# Módulo 11: JVM interna — GC, profiling y JIT


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 11 — mapa visual](/visuals/temas/java/modulo-11-concurrencia.html)

Lectura: Entrega tareas a un executor y observa resultados/fallos; evita crear hilos sin control.


Cuando Tienda Aurora se vuelve lenta en producción, el código fuente no siempre alcanza. Una pausa larga puede venir del recolector de basura, un pico de CPU de un método compilado en caliente, una fuga por referencias retenidas, o un uso incorrecto de memoria nativa. Este módulo abre la caja negra de la JVM con evidencia: logs de GC, Java Flight Recorder, referencias especiales, heap dump por OOM y Foreign Function & Memory API.

La idea no es “tunear por intuición”. Es medir, observar y luego cambiar una cosa a la vez. Cada herramienta responde una pregunta distinta: GC logs para pausas y recolecciones, JFR para eventos del runtime, heap dump para quién retiene memoria, y FFM para interoperar con código nativo con un dueño explícito de memoria.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2 (Temurin 25.0.5.1+2 en toolchain Gradle y JDK 27 instalado en el sistema), Gradle 9.9.1, macOS arm64. Comandos ejecutados en `/tmp/opencode/aurora-m11`. Salidas abajo son reales; las métricas de GC/JFR dependen de la máquina, versión y carga, por eso se incluyen como evidencia de este entorno, no como constantes universales.

## Proyecto desde cero: tienda-aurora-jvm

## Prerrequisitos

```bash
java -version
gradle --version
```

También son útiles herramientas del JDK: `jcmd`, `jfr`, `jmap`, `jstat`. Su disponibilidad depende de la instalación.

## Estructura del proyecto

```text
tienda-aurora-jvm/
├── build.gradle.kts
├── settings.gradle.kts
└── src/main/java/com/aurora/jvm/
    ├── TiendaAuroraJvmApp.java
    └── TrabajoCpu.java
```

## Código completo

Nombre del proyecto Gradle.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-jvm"
```

Configura Java 25, aplicación de consola y compilación estricta. Se desactiva `-Xlint:restricted` porque la FFM API llama métodos restringidos del JDK; la restricción real se controla en runtime con `--enable-native-access`, que se documenta al ejecutar.

**Archivo:** `build.gradle.kts`

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

Carga CPU pequeña y determinista. Sirve para generar actividad al grabar JFR y para explicar por qué el JIT optimiza código caliente.

**Archivo:** `src/main/java/com/aurora/jvm/TrabajoCpu.java`

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

CLI de diagnóstico: asignaciones para observar GC, referencias Weak/Soft/Phantom, fuga de memoria para heap dump por OOM, y llamadas FFM con `Arena`.

**Archivo:** `src/main/java/com/aurora/jvm/TiendaAuroraJvmApp.java`

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

        // liberar fuerte para uso honesto, evitar warning de no uso
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
        // keep reference alive until end
        Files.writeString(Path.of("build/leak.txt"), "mb=" + retencion.size());
    }
}
```

## Construir y ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q build
./gradlew -q run --args="demo"
```

Salida real:

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

## Conceptos cubiertos

### Tema 1: Generaciones de memoria y recolectores · Avanzado · 45 min

La JVM administra memoria automática en el heap. Un objeto vive en heap mientras es alcanzable desde raíces GC (stacks, estáticos, JNI, referencias activas). Cuando ya no es alcanzable, el recolector puede reclamarlo. El recolector no libera “cuando tú quieres”, sino cuando sus heurísticas lo deciden.

Muchos recolectores usan la hipótesis generacional: la mayoría de objetos muere joven. Por eso separan memoria en regiones jóvenes y viejas. Asignar objetos de vida corta en young generation es barato; los que sobreviven varias colecciones pueden promoverse a old generation. Esto explica por qué crear muchos arrays temporales en un loop puede generar pausas young frecuentes, pero no necesariamente una fuga.

En el proyecto, `alloc` crea muchos arreglos de 1 KB:

```bash
java -Xms32m -Xmx32m -Xlog:gc -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp alloc 200000
```

Salida real (G1 por defecto en este JDK/configuración):

```text
[0.004s][info][gc] Using G1
[0.021s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.430ms
[0.022s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 14M->1M(32M) 0.170ms
[0.023s][info][gc] GC(2) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.272ms
[0.025s][info][gc] GC(3) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.273ms
[0.026s][info][gc] GC(4) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.231ms
[0.027s][info][gc] GC(5) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.254ms
allocaciones=200000
checksum=-97952
ms=9
```

Comparación real con dos recolectores en el mismo comando:

```bash
java -Xms32m -Xmx32m -XX:+UseG1GC -Xlog:gc -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp alloc 300000
java -Xms32m -Xmx32m -XX:+UseZGC -Xlog:gc -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp alloc 300000
```

G1 real:

```text
[0.004s][info][gc] Using G1
[0.021s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.369ms
[0.022s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 14M->1M(32M) 0.242ms
[0.023s][info][gc] GC(2) Pause Young (Normal) (G1 Evacuation Pause) 18M->1M(32M) 0.277ms
[0.025s][info][gc] GC(3) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.258ms
[0.026s][info][gc] GC(4) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.165ms
[0.027s][info][gc] GC(5) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.154ms
[0.028s][info][gc] GC(6) Pause Young (Normal) (G1 Evacuation Pause) 19M->1M(32M) 0.358ms
allocaciones=300000
checksum=-149488
ms=10
```

ZGC real:

```text
[0.005s][info][gc] Using The Z Garbage Collector
[0.032s][info][gc] GC(0) Major Collection (Warmup)
[0.034s][info][gc] GC(1) Minor Collection (High Usage)
[0.036s][info][gc] Allocation Stall (main) 1.166ms
[0.038s][info][gc] Allocation Stall (main) 0.522ms
[0.038s][info][gc] GC(1) Minor Collection (High Usage) 30M(94%)->32M(100%) 0.004s
[0.038s][info][gc] GC(2) Minor Collection (High Usage)
[0.038s][info][gc] Allocation Stall (main) 0.503ms
[0.039s][info][gc] GC(2) Minor Collection (High Usage) 32M(100%)->8M(25%) 0.001s
[0.039s][info][gc] GC(0) Major Collection (Warmup) 4M(12%)->12M(38%) 0.007s
[0.039s][info][gc] GC(3) Major Collection (Warmup)
[0.039s][info][gc] GC(4) Minor Collection (Allocation Rate)
[0.040s][info][gc] GC(4) Minor Collection (Allocation Rate) 12M(38%)->8M(25%) 0.001s
[0.040s][info][gc] GC(5) Minor Collection (Allocation Rate)
[0.040s][info][gc] GC(5) Minor Collection (Allocation Rate) 8M(25%)->14M(44%) 0.001s
[0.040s][info][gc] GC(6) Minor Collection (Allocation Rate)
[0.041s][info][gc] GC(6) Minor Collection (Allocation Rate) 14M(44%)->8M(25%) 0.000s
[0.041s][info][gc] GC(7) Minor Collection (Allocation Rate)
[0.042s][info][gc] GC(7) Minor Collection (Allocation Rate) 18M(56%)->8M(25%) 0.001s
[0.042s][info][gc] GC(3) Major Collection (Warmup) 14M(44%)->8M(25%) 0.003s
[0.042s][info][gc] GC(8) Major Collection (Warmup)
[0.042s][info][gc] GC(9) Minor Collection (Allocation Rate)
[0.042s][info][gc] GC(9) Minor Collection (Allocation Rate) 16M(50%)->10M(31%) 0.000s
[0.044s][info][gc] GC(10) Minor Collection (Allocation Rate)
[0.045s][info][gc] GC(10) Minor Collection (Allocation Rate) 20M(62%)->12M(38%) 0.001s
[0.045s][info][gc] GC(8) Major Collection (Warmup) 10M(31%)->12M(38%) 0.003s
allocaciones=300000
checksum=-149488
ms=11
```

G1 (Garbage First) divide el heap en regiones y prioriza recolectar regiones con mucho garbage. Suele dar buen throughput con pausas objetivo. ZGC apunta a pausas muy bajas, incluso con heaps grandes, pero puede tener mayor costo en CPU/barriers y distinto throughput. La comparación correcta no es “cuál es mejor”, sino “qué trade-off necesitas”: latencia p99, throughput, tamaño de heap y costo operativo.

**Nota de verificación:** estas pausas son de una microcarga en una máquina específica. Para decisiones reales, usa tu workload, tu heap y métricas de latencia/throughput. No extrapoles milisegundos de este ejemplo a producción.

### Tema 2: Java Flight Recorder y JIT compilation · Avanzado · 40 min

Java Flight Recorder (JFR) es un sistema de eventos de bajo overhead integrado en la JVM. Graba información del runtime: GC, asignaciones, clases, configuración, threads y, según configuración, muestras de ejecución. Es útil porque captura evidencia desde dentro de la JVM sin montar un profiler externo pesado desde el inicio.

El JIT compiler (Just-In-Time) compila bytecode a código nativo mientras la aplicación corre. La JVM empieza interpretando o con compilación simple; cuando detecta métodos “calientes” (muy ejecutados), los optimiza. Por eso un microbenchmark ingenuo puede medir warmup en vez del rendimiento estable. Herramientas como JMH manejan warmup, forks y medición; JFR ayuda a observar qué pasa dentro de la JVM.

Comando usado para grabar JFR sobre `TrabajoCpu`:

```bash
java -XX:StartFlightRecording=filename=/tmp/m11-app2.jfr,dumponexit=true,settings=profile \
  -cp build/classes/java/main com.aurora.jvm.TrabajoCpu 3000000 60
```

Salida real del programa:

```text
[0.147s][info][jfr,startup] Started recording 1. No limit specified, using maxsize=250MB as default.
[0.147s][info][jfr,startup] 
[0.147s][info][jfr,startup] Use jcmd 1009 JFR.dump name=1 to copy recording data to file.
ronda=0 total=9000004500000500000
ronda=5 total=-1340205221125654848
ronda=10 total=6766329131457741920
ronda=15 total=-3573880589668412928
ronda=20 total=4532653762914983840
ronda=25 total=-5807555958211171008
ronda=30 total=2298978394372225760
ronda=35 total=-8041231326753929088
ronda=40 total=65303025829467680
ronda=45 total=8171837378412864448
ronda=50 total=-2168372342713290400
ronda=55 total=5938162009870106368
final=5044691862453003136
```

Resumen real del archivo JFR:

```text

 Version: 2.1
 Chunks: 1
 Start: 2026-11-23 04:10:27 (UTC)
 Duration: 0 s

 Event Type                              Count  Size (bytes) 
=============================================================
 jdk.NativeLibrary                         956         80562
 jdk.SystemProcess                         584         56622
 jdk.ModuleExport                          506          4913
 jdk.BooleanFlag                           469         13767
 jdk.ActiveSetting                         381          9450
 jdk.ModuleRequire                         155          1395
 jdk.LongFlag                              136          4236
 jdk.UnsignedLongFlag                       83          2675
 jdk.InitialSecurityProperty                47          2313
 jdk.UnsignedIntFlag                        45          1401
 jdk.IntFlag                                43          1534
 jdk.InitialEnvironmentVariable             36          2093
```

Para analizar en un entorno donde haya muestras de ejecución, el flujo es: `jfr summary archivo.jfr`, luego `jfr print --events jdk.ExecutionSample --stack-depth 20 archivo.jfr` o abrirlo en JDK Mission Control. El método con más muestras de CPU suele ser el hotspot. En este entorno, la ejecución corta no capturó `jdk.ExecutionSample`/`jdk.CPUTimeSample` (aparecen con conteo 0 en el summary), así que no voy a inventar un stack flamegraph. **Nota de verificación:** para obtener muestras útiles, ejecuta la carga más tiempo, usa `settings=profile`, y analiza con `jfr print --events jdk.ExecutionSample` o Mission Control en la misma JDK.

### Tema 3: Referencias especiales y heap dumps · Avanzado · 45 min

No todas las referencias a objetos son iguales. Una referencia fuerte impide que el GC reclame el objeto. Las referencias especiales en `java.lang.ref` permiten interactuar con el GC:

- `WeakReference`: el objeto puede ser recolectado cuando ya no hay referencias fuertes. Útil para caches donde perder el valor es aceptable.
- `SoftReference`: el GC intenta conservarlo más tiempo y suele liberarlo antes de un OOM por presión de memoria. Útil para caches sensibles a memoria, con cuidado.
- `PhantomReference`: `get()` siempre devuelve `null`; sirve para saber que el objeto fue encolado para post-procesamiento después de ser phantom-reachable. Se usa con `ReferenceQueue` para limpieza avanzada; es más delicado que `Cleaner`/try-with-resources.

El comando `refs` del proyecto ejecuta una demostración controlada:

```bash
./gradlew -q run --args="refs"
```

Salida real observada en `demo`:

```text
fuertePresente=true
weakAntesDeLiberar=false
softPresente=true
phantomEncolada=true
```

**Nota de verificación:** `System.gc()` es una sugerencia, no una garantía. En este JDK/entorno la weak fue recolectada y la phantom encolada; la soft se mantuvo. No escribas lógica de negocio que dependa de que `System.gc()` limpie referencias en un momento exacto.

Un heap dump es una fotografía del heap: objetos, tamaños, referencias y cadenas de retención. Sirve para responder “quién mantiene vivo este objeto”. Se puede obtener con `jcmd <pid> GC.heap_dump`, `jmap`, o automáticamente con `-XX:+HeapDumpOnOutOfMemoryError`.

Provocamos un OOM reteniendo arrays de 1MB:

```bash
java -Xms64m -Xmx64m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/m11-oom.hprof \
  -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp leak 120
```

Salida real:

```text
mb=0
mb=20
java.lang.OutOfMemoryError: Java heap space
Dumping heap to /tmp/m11-oom.hprof ...
Heap dump file created [36457187 bytes in 0.018 secs]
java.lang.OutOfMemoryError: Java heap space
	at com.aurora.jvm.TiendaAuroraJvmApp.leak(TiendaAuroraJvmApp.java:140)
	at com.aurora.jvm.TiendaAuroraJvmApp.main(TiendaAuroraJvmApp.java:35)
```

El archivo `/tmp/m11-oom.hprof` se generó (35M en este entorno). En un análisis real, abrirías el hprof con Eclipse MAT o VisualVM y buscarías el dominator tree / leak suspects para ver qué estructura retiene los `byte[]`.

### Tema 4: Foreign Function & Memory API (Java 22) · Experto · 45 min

FFM (Foreign Function & Memory API) es la API moderna de Java para llamar código nativo y manejar memoria fuera del heap Java. Reemplaza gran parte del uso de JNI con un modelo más seguro y explícito. Sus piezas clave: `Linker` para enlazar funciones nativas, `SymbolLookup` para encontrarlas, `FunctionDescriptor`/`MethodHandle` para describir firma, `MemorySegment` para memoria, y `Arena` para controlar el ciclo de vida.

En `ffm`, llamamos `strlen` de la librería C del sistema:

```java
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MemorySegment strlenAddr = stdlib.find("strlen").orElseThrow();
MethodHandle strlen = linker.downcallHandle(strlenAddr,
        FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment cString = arena.allocateFrom("Aurora");
    long len = (long) strlen.invokeExact(cString);
    System.out.println("strlen=" + len);
}
```

Salida real:

```bash
java --enable-native-access=ALL-UNNAMED -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp ffm
```

```text
strlen=6
```

`Arena.ofConfined()` crea un área de memoria con un dueño: el hilo que la creó. `try-with-resources` cierra el arena al salir. Eso hace que la liberación sea determinista. Es diferente al GC, que decide cuándo reclamar objetos del heap Java. La memoria nativa necesita dueño explícito porque el GC no conoce automáticamente la semántica de esa memoria externa.

El caso de error importante es usar memoria después de cerrar el arena. `ffm-closed` lo reproduce:

```bash
java --enable-native-access=ALL-UNNAMED -cp build/classes/java/main com.aurora.jvm.TiendaAuroraJvmApp ffm-closed
```

```text
error=IllegalStateException
```

La JVM lanza `IllegalStateException` porque el segmento ya no es válido. Este fallo es mucho mejor que leer memoria liberada en C sin protección. Aun así, FFM sigue siendo una API restringida: requiere `--enable-native-access` para evitar advertencias/bloqueos futuros y exige entender la firma nativa que estás llamando.

## Cierre

La JVM no es magia negra: es un runtime con reglas observables. GC logs muestran pausas y recolecciones; JFR captura eventos internos; referencias especiales modelan relaciones de alcanzabilidad; heap dumps explican retenciones; FFM permite cruzar la frontera nativa con ciclo de vida explícito. El criterio profesional es medir antes de tunear y documentar el entorno donde se obtuvo la evidencia.

## Checklist

- Puedo explicar young/old generation y por qué existen.
- Comparé G1 y ZGC con el mismo comando y entiendo que el trade-off depende del workload.
- Sé grabar un JFR y conozco el flujo para buscar `jdk.ExecutionSample`/hotspots.
- Distingo Weak/Soft/Phantom y no confío en `System.gc()` como contrato.
- Sé generar un heap dump ante OOM y para qué sirve analizar retenciones.
- Uso FFM con `Arena` y entiendo por qué usar memoria cerrada falla.
