# Módulo 11: JVM interna — GC, profiling y JIT

Entender la JVM te ayuda a diagnosticar problemas de rendimiento, memoria y latencia que no se ven en el código fuente. Este módulo cubre el modelo de memoria, garbage collection, profiling con JFR, referencias especiales y la Foreign Function & Memory API.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Explicar generaciones de heap y elegir un GC con criterio |
| 2 | Capturar y leer evidencia con Java Flight Recorder y entender JIT |
| 3 | Distinguir referencias fuertes/débiles/suaves/fantasma y leer heap dumps |
| 4 | Usar FFM API para memoria nativa con ciclo de vida explícito |

## Aprende construyendo

### Tema 1: Generaciones de memoria y recolectores · Avanzado · 45 min

**Caso guía**

Tu servicio se vuelve lento con picos de latencia. Sospechas GC. Necesitas entender memoria JVM y qué recolector elegir.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Generaciones de memoria** | Hipótesis generacional: la mayoría de objetos muere joven; heap dividido (young/old, según GC). | Optimizar recolección. | Razonar sobre GC. | Asumir mismo layout para todos los GCs. |
| **Heap/Stack/Metaspace** | Heap: objetos; Stack: frames por hilo; Metaspace: metadata de clases. | Diagnosticar OOM correcto. | Profiling/tuning. | Confundir `StackOverflowError` con heap OOM. |
| **Recolectores (G1, ZGC, Shenandoah, etc.)** | Algoritmos de GC con distintos trade-offs latencia/throughput. | Elegir por SLO. | G1 default balanceado; ZGC/Shenandoah baja latencia. | Tunear sin medir. |
| **Pausas/throughput** | Pausa = app detenida; throughput = % tiempo ejecutando app. | Alinear GC con SLO. | Servicios latencia-sensible vs batch. | Perseguir “0 GC”. |

**Contrato / invariantes / reglas.** GC libera objetos inalcanzables, no “memoria que ya no usas” en sentido lógico si aún hay referencias. `OutOfMemoryError` puede ser heap, metaspace, threads, direct memory. Configura y mide: `-Xms/-Xmx`, logs GC (`-Xlog:gc*`).

**Modelo mental.** Heap = almacén; GC = equipo de limpieza que busca cajas sin dueño; generacional = revisa más la zona de cajas temporales.

**Implementación desde cero (observación)**

```bash
mkdir -p ~/academia-java/modulo-11 && cd ~/academia-java/modulo-11
```

`DemoMem.java`:

```java
import java.util.*;
public class DemoMem {
    public static void main(String[] args) {
        List<byte[]> basura = new ArrayList<>();
        for (int i = 0; i < 200; i++) basura.add(new byte[1024 * 1024]); // ~1MB
        System.out.println("allocs=" + basura.size());
        System.out.println(Runtime.getRuntime().totalMemory() / (1024*1024) + "MB total");
    }
}
```

```bash
javac DemoMem.java
java -Xms64m -Xmx256m -Xlog:gc DemoMem
```

**Ejecución y salida real (varía)**

```text
allocs=200
...MB total
```

y logs GC con eventos de recolección.

**Errores comunes**: retener referencias (leak lógico), tunear sin baseline, confundir áreas de memoria. **Verificación**: reduce `-Xmx` y observa OOM/GC.


### Tema 2: Java Flight Recorder y JIT compilation · Avanzado · 40 min

**Caso guía**

En producción hay latencia esporádica. Necesitas profiling de bajo overhead (JFR) y entender por qué la JVM “se calienta” (JIT).

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Java Flight Recorder (JFR)** | Profiler/event recorder de bajo overhead integrado en la JVM. | Diagnosticar CPU, GC, locks, allocs en prod. | Incidentes de rendimiento. | Activarlo solo después de no poder reproducir. |
| **JIT compilation** | Compilación Just-In-Time: JVM compila bytecode caliente a código nativo. | Optimizar rendimiento en ejecución. | Apps de larga ejecución. | Hacer microbench sin warmup. |
| **Warmup** | Periodo inicial donde JIT observa y optimiza. | Explicar rendimiento inicial menor. | Benchmarks/servicios recién arrancados. | Comparar cold vs hot sin controlar. |
| **Eventos/métricas** | Datos JFR (CPU, allocation, GC, threads, locks). | Evidencia para tuning. | Análisis post-mortem o en vivo. | Optimizar por intuición. |

**Contrato / invariantes / reglas.** JFR tiene bajo overhead, pero no cero; configúralo. JIT puede desoptimizar. Benchmarks serios con JMH, no `System.nanoTime` ingenuo. `jcmd` permite iniciar/dumpear JFR.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-11 && cd ~/academia-java/modulo-11
```

`DemoJit.java`:

```java
public class DemoJit {
    static long work(int n){ long s=0; for(int i=0;i<n;i++) s+=i; return s; }
    public static void main(String[] args){
        for(int i=0;i<20;i++){
            long t1=System.nanoTime();
            work(1_000_000);
            long t2=System.nanoTime();
            System.out.println("iter"+i+" ms="+(t2-t1)/1_000_000);
        }
    }
}
```

```bash
javac DemoJit.java
java DemoJit
```

Para JFR:

```bash
java -XX:StartFlightRecording=filename=recording.jfr,duration=20s -cp . DemoJit
```

**Ejecución y salida real (varía)**

Tiempos suelen bajar tras iteraciones (warmup/JIT). JFR genera `recording.jfr` abrible con JDK Mission Control.

**Errores comunes**: benchmark sin warmup, interpretar JFR sin contexto, tunear sin SLO. **Verificación**: genera `.jfr` y confirma archivo existe.


### Tema 3: Referencias especiales y heap dumps · Avanzado · 45 min

**Caso guía**

Un caché crece sin límite y hay OOM. Necesitas entender referencias fuertes/débiles y analizar heap dump.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Referencias fuertes** | Referencia normal; impide GC mientras sea alcanzable. | Ownership normal. | Por defecto. | Caches/mapas estáticos que retienen todo. |
| **`WeakReference`** | Referencia que no impide GC si solo hay refs débiles. | Caches sensibles a memoria. | Memoización opcional. | Esperar que el objeto permanezca. |
| **`SoftReference`** | GC puede reclamarlas bajo presión de memoria. | Caches más persistentes que weak. | Caches de memoria. | Usarlas como garantía. |
| **Heap dump** | Snapshot del heap (`jcmd GC.heap_dump`, `-XX:+HeapDumpOnOutOfMemoryError`). | Analizar leaks y retenciones. | OOM/incidentes memoria. | No mirar ruta de retención (GC roots). |

**Contrato / invariantes / reglas.** Leak en Java suele ser referencia fuerte no liberada. `WeakHashMap` usa claves weak. Heap dump puede contener datos sensibles: trata como artefacto sensible. Analiza con MAT/VisualVM.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-11 && cd ~/academia-java/modulo-11
```

`DemoWeak.java`:

```java
import java.lang.ref.WeakReference;
public class DemoWeak {
    public static void main(String[] args) {
        Object obj = new byte[1024*1024];
        WeakReference<Object> weak = new WeakReference<>(obj);
        System.out.println(weak.get() != null);
        obj = null; // quita referencia fuerte
        System.gc();
        System.out.println(weak.get() == null);
    }
}
```

**Ejecución y salida real (típica)**

```bash
javac DemoWeak.java
java DemoWeak
```

```text
true
true
```

(la segunda línea puede variar por timing de GC, pero es comúnmente `true`).

**Errores comunes**: confiar en `System.gc()` como garantía, caches estáticos sin límite, no proteger heap dumps. **Verificación**: genera heap dump con `jcmd <pid> GC.heap_dump file.hprof`.


### Tema 4: Foreign Function & Memory API (Java 22) · Experto · 45 min

**Caso guía**

Necesitas interoperar con memoria nativa o librería C sin JNI frágil. FFM ofrece API segura y más moderna.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **FFM API** | API Java 22 (JEP 454) para acceder a memoria y funciones nativas (`java.lang.foreign`). | Interop nativa sin JNI boilerplate. | Librerías nativas, memoria off-heap controlada. | Usarla sin entender lifetime/safety. |
| **`Arena`** | Controla ciclo de vida de memoria nativa. | Liberación determinista. | Alocar memoria nativa. | Usar memoria fuera de scope. |
| **`MemorySegment`** | Vista segura a región de memoria. | Leer/escribir nativa con bounds. | Buffers nativos, structs. | Asumir acceso ilimitado. |
| **`Linker`/`SymbolLookup`** | Enlazan funciones nativas por símbolo. | Llamar funciones C. | Integración con librerías del sistema. | Firma/ABI incorrecta. |

**Contrato / invariantes / reglas.** Seguridad por bounds y lifetime de arena. `confined` arena es single-thread; `shared` permite multi-thread. Llamadas nativas pueden romper seguridad si firmas son incorrectas. Requiere entender ABI/plataforma.

**Modelo mental.** Arena = caja de memoria nativa con fecha de destrucción; MemorySegment = puntero con cinturón de seguridad.

**Implementación desde cero (Java 22+)**

```bash
mkdir -p ~/academia-java/modulo-11-ffm && cd ~/academia-java/modulo-11-ffm
```

`DemoFfm.java`:

```java
import java.lang.foreign.*;
import java.lang.invoke.MethodHandle;

public class DemoFfm {
    public static void main(String[] args) throws Throwable {
        Linker linker = Linker.nativeLinker();
        SymbolLookup stdlib = linker.defaultLookup();
        MethodHandle strlen = linker.downcallHandle(
            stdlib.find("strlen").orElseThrow(),
            FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS)
        );
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment cstr = arena.allocateFrom("hola");
            long len = (long) strlen.invoke(cstr);
            System.out.println(len);
        }
    }
}
```

**Ejecución y salida real (JDK 22+)**

```bash
javac DemoFfm.java
java DemoFfm
```

```text
4
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `UnsatisfiedLinkError`/símbolo no encontrado | Plataforma/lib distinta | Verifica símbolo/ABI/plataforma |
| Crash/JVM fatal | Firma nativa incorrecta | Revisa FunctionDescriptor |
| Acceso tras cerrar arena | Lifetime violado | No uses segment fuera de arena |

**Verificación rápida:** cambia cadena a `"java"` y confirma `4`.


## Cierre del módulo

La JVM no es una caja negra: con GC logs, JFR, heap dumps y entendimiento de referencias puedes diagnosticar memoria y rendimiento con evidencia. El siguiente paso en la ruta es aplicar este criterio en sistemas reales y en la evolución moderna de Java.
