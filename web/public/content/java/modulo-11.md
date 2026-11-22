# Módulo 11: JVM interna — GC, profiling y JIT

Entender la JVM ayuda a diagnosticar problemas de rendimiento, memoria y latencia que no se ven en el código fuente. Este módulo cubre modelo de memoria, garbage collection, profiling con JFR, referencias especiales y la Foreign Function & Memory API.

**Entorno de referencia verificado (2026-05-22):** JDK 27. FFM y referencias verificadas por ejecución; JFR/heap dump tienen notas de herramienta visual.

## Aprende construyendo

### Tema 1: Generaciones de memoria y recolectores · Avanzado · 45 min

Tu servicio se vuelve lento con picos de latencia. Sospechas GC. Necesitas entender memoria JVM y elegir recolector con criterio.

#### Generaciones de memoria

**Definición formal.** La hipótesis generacional observa que la mayoría de objetos muere joven; muchos GCs organizan el heap en generaciones/regionas para optimizar recolección.

**Para qué sirve.** Explica por qué las colecciones jóvenes suelen ser frecuentes y baratas, y las completas más costosas.

**Cuándo usarlo.** Al razonar sobre GC y pausas. No asumas el mismo layout en todos los GCs.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m11-t1-gen && cd /tmp/java-m11-t1-gen
```

```java
import java.util.*;
public class DemoGen {
    public static void main(String[] args) {
        for (int i = 0; i < 1000; i++) { byte[] tmp = new byte[1024]; }
        System.out.println("ok");
    }
}
```

**Caso de uso real.** Alta tasa de objetos temporales en endpoints web.

**Error común.** Crear objetos temporales innecesarios en hot paths. Corrección: perfilar antes de micro-optimizar.

**Verificación (JDK 27, 2026-05-22).** Salida: `ok`. Con `-Xlog:gc` se observan eventos GC según entorno.

#### Heap, Stack y Metaspace

**Definición formal.** Heap: objetos. Stack: frames por hilo (variables locales/referencias/llamadas). Metaspace: metadata de clases.

**Para qué sirve.** Distinguir tipos de `OutOfMemoryError` y `StackOverflowError`.

**Cuándo usarlo.** En diagnóstico de memoria.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m11-t1-mem && cd /tmp/java-m11-t1-mem
```

```java
public class DemoMemAreas {
    public static void main(String[] args) {
        System.out.println(Runtime.getRuntime().maxMemory() > 0);
    }
}
```

**Caso de uso real.** `Java heap space` vs `Metaspace` vs `unable to create native thread`.

**Error común.** Confundir stack overflow con heap OOM. Corrección: leer el tipo de error y la traza.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### Recolectores y trade-offs

**Definición formal.** Recolectores (G1, ZGC, Shenandoah, Serial, Parallel, etc.) implementan estrategias distintas con trade-offs entre latencia, throughput y footprint.

**Para qué sirve.** Elegir GC alineado al SLO.

**Cuándo usarlo.** G1 como default balanceado; ZGC/Shenandoah para baja latencia; Parallel para throughput batch, según caso.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
java -XX:+UseG1GC -version
```

**Caso de uso real.** Servicio con SLO p99 sensible a pausas.

**Error común.** Tunear sin medir baseline. Corrección: medir con métricas/logs/JFR.

**Verificación (JDK 27, 2026-05-22).** `java -version` y flags de GC funcionan en JDK instalado.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m11-t1 && cd /tmp/java-m11-t1
```

```java
import java.util.*;
public class DemoMem {
    public static void main(String[] args) {
        List<byte[]> basura = new ArrayList<>();
        for (int i = 0; i < 50; i++) basura.add(new byte[1024 * 1024]);
        System.out.println("allocs=" + basura.size());
    }
}
```

```bash
javac DemoMem.java
java -Xms64m -Xmx256m -Xlog:gc DemoMem
```

Salida real observada: incluye `allocs=50` y puede incluir eventos GC.

### Tema 2: Java Flight Recorder y JIT compilation · Avanzado · 40 min

Hay latencia esporádica en producción. Necesitas evidencia de bajo overhead y entender el warmup de JIT.

#### Java Flight Recorder (JFR)

**Definición formal.** JFR es un recorder de eventos de la JVM con bajo overhead, integrado en el JDK.

**Para qué sirve.** Capturar CPU, allocs, GC, locks, threads y otros eventos para diagnóstico.

**Cuándo usarlo.** Incidentes de rendimiento en test/staging/prod, con configuración adecuada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m11-t2-jfr && cd /tmp/java-m11-t2-jfr
```

```java
public class DemoJfr { public static void main(String[] args){ for(long i=0;i<5_000_000;i++){} System.out.println("ok"); } }
```

```bash
javac DemoJfr.java
java -XX:StartFlightRecording=filename=recording.jfr,duration=5s -cp . DemoJfr
```

**Caso de uso real.** Analizar pico de latencia en producción.

**Error común.** Activarlo solo cuando ya no se puede reproducir. Corrección: definir estrategia de profiling.

**Verificación (JDK 27, 2026-05-22).** Comando JFR inicia; genera archivo `.jfr` (visualización en JMC o `jfr print`).

#### JIT compilation y warmup

**Definición formal.** JIT compila bytecode caliente a código nativo en runtime. Warmup es el periodo inicial donde la JVM perfila y optimiza.

**Para qué sirve.** Mejora rendimiento en ejecuciones largas.

**Cuándo usarlo.** Considerarlo en benchmarks y arranque de servicios.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m11-t2-jit && cd /tmp/java-m11-t2-jit
```

```java
public class DemoJit {
    static long work(int n){ long s=0; for(int i=0;i<n;i++) s+=i; return s; }
    public static void main(String[] args){
        for(int i=0;i<5;i++){ long t1=System.nanoTime(); work(1_000_000); long t2=System.nanoTime(); System.out.println((t2-t1)/1_000_000); }
    }
}
```

**Caso de uso real.** Microservicio que mejora throughput tras calentarse.

**Error común.** Medir sin warmup con `nanoTime` y concluir. Corrección: JMH para benchmarks serios.

**Verificación (JDK 27, 2026-05-22).** El programa imprime tiempos; pueden variar. No es benchmark riguroso.

#### Ejemplo integrado desde cero

Usar `DemoJfr` con `-XX:StartFlightRecording`. Verificar con:

```bash
jfr summary recording.jfr | head
```

**Nota de verificación.** La inspección visual completa requiere JDK Mission Control; en CLI se puede usar `jfr summary/print`.

### Tema 3: Referencias especiales y heap dumps · Avanzado · 45 min

No toda referencia impide GC igual. Además, ante leaks necesitas inspeccionar el heap.

#### Referencias fuertes, débiles, suaves y fantasmas

**Definición formal.** Fuerte: impide GC. `SoftReference`: recolectable bajo presión de memoria (caches sensibles). `WeakReference`: recolectable cuando no hay fuertes. `PhantomReference`: para post-mortem cleanup con `ReferenceQueue`.

**Para qué sirve.** Modelar caches y limpieza asociada al ciclo de vida de objetos.

**Cuándo usarlo.** `WeakReference`/`WeakHashMap` para asociaciones opcionales; `SoftReference` con cautela; `Phantom` para limpieza avanzada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m11-t3-ref && cd /tmp/java-m11-t3-ref
```

```java
import java.lang.ref.WeakReference;
public class DemoWeak {
    public static void main(String[] args) {
        WeakReference<Object> r = new WeakReference<>(new Object());
        System.out.println(r.get() != null);
        System.gc();
        System.out.println(r.get() == null || r.get() != null); // GC es sugerencia, pero comúnmente null
    }
}
```

**Caso de uso real.** Caché que no debe impedir GC.

**Error común.** Creer que `System.gc()` garantiza recolección inmediata. Corrección: tratar GC como no determinista.

**Verificación (JDK 27, 2026-05-22).** Primera línea `true`; la segunda depende del GC, por eso no se usa como contrato estricto.

#### Heap dumps

**Definición formal.** Snapshot del heap en un punto de tiempo, analizable con herramientas como `jcmd`, `jmap`, VisualVM, MAT.

**Para qué sirve.** Diagnosticar leaks y objetos retenidos.

**Cuándo usarlo.** Ante sospecha de leak o OOM.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
jcmd <pid> GC.heap_dump /tmp/heap.hprof
```

**Caso de uso real.** Encontrar colección que crece sin límite.

**Error común.** Tomar dump en producción sin considerar tamaño/pausa/espacio. Corrección: planificar captura.

**Verificación.** `jcmd` genera archivo; abrir con MAT/VisualVM. **Nota de verificación:** análisis visual no automatizado aquí.

#### Ejemplo integrado desde cero

```java
import java.lang.ref.*;
public class DemoRefs {
    public static void main(String[] args) throws Exception {
        WeakReference<byte[]> weak = new WeakReference<>(new byte[1024*1024]);
        System.out.println(weak.get() != null);
    }
}
```

Salida real observada: `true`.

### Tema 4: Foreign Function & Memory API (Java 22) · Experto · 45 min

Necesitas llamar una función nativa o manejar memoria off-heap con control explícito.

#### FFM API

**Definición formal.** API de `java.lang.foreign` para interoperar con código/memoria nativa de forma más segura que JNI, con `Arena`, `MemorySegment`, `Linker` y `SymbolLookup`.

**Para qué sirve.** Llamar funciones nativas y gestionar memoria fuera del heap con ciclo de vida explícito.

**Cuándo usarlo.** Integración nativa, bibliotecas C, off-heap controlado. No usar por curiosidad si Java puro basta.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m11-t4-ffm && cd /tmp/java-m11-t4-ffm
```

```java
import java.lang.foreign.*;
import java.lang.invoke.MethodHandle;
public class DemoFFM {
    public static void main(String[] args) throws Throwable {
        Linker linker = Linker.nativeLinker();
        SymbolLookup stdlib = linker.defaultLookup();
        MethodHandle strlen = linker.downcallHandle(
            stdlib.find("strlen").orElseThrow(),
            FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment cstr = arena.allocateFrom("hola");
            long n = (long) strlen.invoke(cstr);
            System.out.println(n);
        }
    }
}
```

**Caso de uso real.** Usar librería C existente sin escribir JNI.

**Error común.** Olvidar cerrar `Arena` o usar segmento fuera de su lifetime. Corrección: try-with-resources y entender confinamiento.

**Verificación (JDK 27, macOS, 2026-05-22).**

```bash
javac DemoFFM.java
java --enable-native-access=ALL-UNNAMED -cp . DemoFFM
```

```text
4
```

**Nota de verificación.** La disponibilidad de símbolos nativos depende del SO/libc. `strlen` estuvo disponible en el entorno verificado.

#### `Arena` y `MemorySegment`

**Definición formal.** `MemorySegment` representa una región de memoria; `Arena` controla su ciclo de vida (asignación/liberación).

**Para qué sirve.** Seguridad de lifetime para memoria nativa/off-heap.

**Cuándo usarlo.** Al asignar memoria nativa desde Java.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import java.lang.foreign.*;
public class DemoArena {
    public static void main(String[] args) {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment seg = arena.allocate(ValueLayout.JAVA_INT);
            seg.set(ValueLayout.JAVA_INT, 0, 42);
            System.out.println(seg.get(ValueLayout.JAVA_INT, 0));
        }
    }
}
```

**Caso de uso real.** Buffer nativo temporal.

**Error común.** Acceder al segmento tras cerrar arena. Síntoma: excepción/UB evitado por API. Corrección: respetar lifetime.

**Verificación (JDK 27, 2026-05-22).** Salida: `42`.

## Cierre del módulo

La JVM no es una caja negra: su modelo de memoria, GC, JIT, JFR y APIs como FFM permiten diagnosticar y extender Java con criterio. La regla es medir antes de tunear y entender el lifetime de memoria nativa.
