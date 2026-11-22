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

Tu servicio Java aumenta el uso de memoria con el tiempo y aparecen pausas de GC. Antes de cambiar flags al azar, necesitas entender qué parte del heap está creciendo y qué tipo de recolector estás usando.

**Fundamento técnico y modelo mental**

**Definición formal.** El *heap* de la JVM es el área de memoria de runtime donde se asignan objetos e instancias de arrays. El *garbage collector* (GC) reclama memoria de objetos inaccesibles desde raíces (roots). Muchos GC modernos usan una hipótesis generacional: la mayoría de objetos mueren jóvenes, por lo que dividen el heap en generaciones/regiones con estrategias distintas.

**Contrato / invariantes / reglas.** La accesibilidad se determina desde raíces GC (stacks, estáticos, JNI, etc.). El GC no garantiza el momento exacto de recolección ni la finalización de objetos; `System.gc()` es una sugerencia. Las pausas, throughput y uso de memoria dependen del recolector (`G1`, `ZGC`, `Shenandoah`, `Serial`, `Parallel`), tamaño de heap, patrón de asignación y referencias retenidas. Una fuga en Java suele ser una *referencia retenida* no intencional, no “memoria sin liberar” al estilo manual.

**Modelo mental.** El heap es un almacén. La generación joven es la zona de entrada rápida donde llegan paquetes nuevos; si sobreviven, se mueven a zonas de mayor permanencia. El GC es el equipo que revisa qué cajas ya nadie referencia y las retira.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-11 && cd ~/academia-java/modulo-11
```

Crea `MemoriaGC.java`:
```java
public class MemoriaGC {
    public static void main(String[] args) throws Exception {
        System.out.println("Inicio");
        for (int i = 0; i < 20; i++) {
            byte[] bloque = new byte[1_000_000]; // ~1MB
            System.out.println("iter=" + i + " len=" + bloque.length);
        }
        System.out.println("maxMemory=" + Runtime.getRuntime().maxMemory());
        Thread.sleep(3000);
    }
}
```

Ejecuta con logs de GC:

```bash
javac MemoriaGC.java
java -Xlog:gc* -Xms64m -Xmx64m MemoriaGC
```

**Desglose del código**

- Cada iteración asigna un arreglo grande; muchos se vuelven inaccesibles al terminar la iteración.
- `Runtime.getRuntime().maxMemory()` muestra el límite de heap visto por la JVM.
- `-Xlog:gc*` emite eventos de GC. No adivines: lee la evidencia.
- Los flags `-Xms/-Xmx` fijan heap inicial/máximo para un experimento reproducible.

**Ejecución y salida real**

Salida del programa (resumen):

```text
Inicio
iter=0 len=1000000
...
iter=19 len=1000000
maxMemory=67108864
```

Además verás líneas de GC en stderr/stdout según configuración. El contenido exacto varía por JVM y GC.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `OutOfMemoryError: Java heap space` | Heap insuficiente o fuga de referencias | Aumenta heap solo si tiene sentido; toma heap dump y analiza retenciones |
| Pausas largas | GC inadecuado o heap mal dimensionado | Mide con GC logs/JFR; evalúa G1/ZGC/heap/tasa de asignación |
| Crees que `System.gc()` arregla todo | No es garantía | Corrige el modelo de retención de objetos |

**Verificación rápida**

```bash
javac MemoriaGC.java && java -Xms64m -Xmx64m MemoriaGC
```

Observa `maxMemory` y verifica que el programa completa las iteraciones.

### Tema 2: Java Flight Recorder y JIT compilation · Avanzado · 40 min

**Caso guía**

Una API responde lento de forma intermitente. No sabes si el problema es GC, CPU, bloqueos o compilación JIT. Necesitas un perfil de bajo overhead.

**Fundamento técnico y modelo mental**

**Definición formal.** *Java Flight Recorder (JFR)* es un sistema de profiling/eventos integrado en la JVM que registra eventos de runtime (GC, CPU, hilos, asignaciones, locks, etc.) con bajo overhead. El *JIT compiler* (Just-In-Time) compila bytecode caliente a código nativo en runtime, aplicando optimizaciones basadas en perfilado.

**Contrato / invariantes / reglas.** JFR recopila evidencia; no corrige por sí mismo. La calidad del diagnóstico depende de duración de captura, carga representativa y eventos habilitados. El JIT introduce warm-up: el rendimiento inicial puede ser peor que tras optimizar. Microbenchmarks ingenuos pueden ser inválidos por dead code elimination, inlining o calentamiento; para microbenchmarks usa JMH.

**Modelo mental.** JFR es la caja negra del avión: no evita la turbulencia, pero te dice qué pasó. El JIT es un mecánico que, mientras conduces, ajusta el motor según el trayecto real.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-11 && cd ~/academia-java/modulo-11
```

Crea `TrabajoJFR.java`:
```java
public class TrabajoJFR {
    static long trabajo(int n) {
        long s = 0;
        for (int i = 0; i < n; i++) s += i;
        return s;
    }

    public static void main(String[] args) throws Exception {
        for (int i = 0; i < 20; i++) {
            System.out.println(trabajo(1_000_00));
            Thread.sleep(100);
        }
        System.out.println("fin");
    }
}
```

Captura JFR:

```bash
javac TrabajoJFR.java
java -XX:StartFlightRecording=filename=trabajo.jfr,duration=5s,settings=profile TrabajoJFR
jfr summary trabajo.jfr
```

**Desglose del código**

- El bucle genera carga repetida para que JFR tenga eventos que capturar.
- `-XX:StartFlightRecording=...` inicia la grabación al arrancar la JVM.
- `jfr summary` da una vista rápida del archivo; JDK Mission Control o `jfr print` permiten inspección más profunda.
- El warm-up JIT significa que las primeras iteraciones no representan el estado optimizado.

**Ejecución y salida real**

```text
...
fin
```

Y `jfr summary` mostrará conteos de eventos (varía por sistema/carga).

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| JFR vacío o poco útil | Captura muy corta o sin carga | Captura durante carga representativa |
| Conclusiones desde microbenchmark casero | Warm-up/JIT invalidan la medición | Usa JMH para microbenchmarks |
| Culpas al GC sin evidencia | Sesgo diagnóstico | Correlaciona GC, CPU, locks y allocs en JFR |

**Verificación rápida**

```bash
javac TrabajoJFR.java
java -XX:StartFlightRecording=filename=trabajo.jfr,duration=3s TrabajoJFR
jfr summary trabajo.jfr | head
```

Verifica que el archivo JFR existe y contiene eventos.

### Tema 3: Referencias especiales y heap dumps · Avanzado · 45 min

**Caso guía**

Implementas un caché en memoria y el proceso termina en `OutOfMemoryError`. Sospechas que el caché retiene objetos que deberían poder ser recolectados bajo presión de memoria.

**Fundamento técnico y modelo mental**

**Definición formal.** Java define varios niveles de alcanzabilidad por tipo de referencia: *fuerte* (normal), `SoftReference` (útil para caches sensibles a memoria), `WeakReference` (no impide GC), `PhantomReference` (post-mortem, con `ReferenceQueue`). Un *heap dump* es una instantánea del heap que permite analizar objetos, tamaños y cadenas de retención.

**Contrato / invariantes / reglas.** Un objeto fuertemente alcanzable no se recolecta. Un objeto solo débilmente alcanzable es elegible en GC. Los `SoftReference` se recolectan típicamente bajo presión de memoria (política de JVM). `PhantomReference.get()` siempre retorna `null`; se usa con `ReferenceQueue` para limpieza post-mortem. `System.gc()` no garantiza recolección inmediata. Los heap dumps pueden contener datos sensibles y deben tratarse como artefactos sensibles.

**Modelo mental.** Referencia fuerte: mano agarrando el objeto. Débil: post-it que se cae cuando limpian. Suave: post-it que aguantan hasta que falta espacio. Fantasma: aviso de que el objeto ya se fue, para hacer limpieza.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-11 && cd ~/academia-java/modulo-11
```

Crea `ReferenciaDebil.java`:
```java
import java.lang.ref.WeakReference;

public class ReferenciaDebil {
    public static void main(String[] args) {
        WeakReference<byte[]> ref = new WeakReference<>(new byte[1_000_000]);
        System.out.println("antes gc: " + (ref.get() != null));
        System.gc();
        System.out.println("despues gc: " + (ref.get() != null));
    }
}
```

Generar heap dump (ejemplo):

```bash
javac ReferenciaDebil.java
java -Xmx32m -XX:+HeapDumpOnOutOfMemoryError ReferenciaDebil
```

**Desglose del código**

- `new WeakReference<>(...)` envuelve el arreglo sin impedir su recolección si solo queda esa referencia débil.
- `System.gc()` sugiere GC; en muchos entornos de prueba se observará la limpieza, pero no es contrato estricto.
- `-XX:+HeapDumpOnOutOfMemoryError` genera dump ante OOME para análisis posterior.
- Herramientas como `jcmd`, `jmap`, VisualVM o MAT sirven para inspeccionar dumps.

**Ejecución y salida real**

Salida típica (puede variar):

```text
antes gc: true
despues gc: false
```

En algunas JVM/condiciones el segundo valor puede seguir siendo `true`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Cache crece sin límite | Referencias fuertes en `HashMap` | Usa política de tamaño/TTL o `WeakHashMap`/cache especializado |
| `System.gc()` no libera nada | Referencias fuertes siguen vivas | Busca la cadena de retención en heap dump |
| OOME sin dump | No activaste dump | Habilita `-XX:+HeapDumpOnOutOfMemoryError` |

**Verificación rápida**

```bash
javac ReferenciaDebil.java && java ReferenciaDebil
```

Ejecuta varias veces; observa que el GC no es determinista, pero la referencia débil permite recolección.

### Tema 4: Foreign Function & Memory API (Java 22) · Experto · 45 min

**Caso guía**

Necesitas interoperar con memoria nativa o preparar el terreno para llamar funciones nativas sin JNI tradicional. Quieres asignar memoria fuera del heap Java con límites y liberación determinista.

**Fundamento técnico y modelo mental**

**Definición formal.** La *Foreign Function & Memory (FFM) API* (final en Java 22, paquete `java.lang.foreign`) permite acceder a memoria fuera del heap y llamar funciones nativas de forma segura y más directa que JNI. `Arena` controla el ciclo de vida de las asignaciones; `MemorySegment` representa una región de memoria; `Linker`/`FunctionDescriptor` describen llamadas nativas.

**Contrato / invariantes / reglas.** Los segmentos tienen alcance (scope) y límites; acceder fuera de límite o tras cierre de arena produce excepción (`IndexOutOfBoundsException`/`IllegalStateException` según caso). `Arena.ofConfined()` crea una arena confinada al hilo actual; `ofShared()` permite acceso compartido con otras reglas. FFM reduce boilerplate de JNI, pero sigue siendo código de bajo nivel: errores de layout/tamaño/ABI causan fallos graves. La seguridad depende de respetar tamaños, layouts y ciclos de vida.

**Modelo mental.** El heap Java es memoria gestionada por la JVM; FFM te da un terreno fuera del heap con una valla (`Arena`) y un contrato de cuándo se derriba la valla.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-11 && cd ~/academia-java/modulo-11
```

Crea `MemoriaNativa.java`:
```java
import java.lang.foreign.Arena;
import java.lang.foreign.MemorySegment;

public class MemoriaNativa {
    public static void main(String[] args) {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment segmento = arena.allocate(4);
            segmento.set(java.lang.foreign.ValueLayout.JAVA_INT, 0, 42);
            int valor = segmento.get(java.lang.foreign.ValueLayout.JAVA_INT, 0);
            System.out.println(valor);
            System.out.println(segmento.byteSize());
        }
    }
}
```

**Desglose del código**

- `Arena.ofConfined()` crea un ámbito de vida; al cerrar el `try`, la memoria se libera.
- `allocate(4)` reserva 4 bytes fuera del heap Java.
- `ValueLayout.JAVA_INT` define cómo leer/escribir un `int`.
- Acceder al segmento después del cierre debe fallar: el ciclo de vida es explícito.

**Ejecución y salida real**

```bash
javac MemoriaNativa.java
java MemoriaNativa
```

```text
42
4
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `IllegalStateException` / acceso inválido | Usaste el segmento tras cerrar la arena | Respeta el ciclo de vida; no escapes el segmento |
| Datos corruptos/lectura rara | Layout o offset incorrecto | Usa `ValueLayout` y tamaños correctos |
| Confundes FFM con “más rápido siempre” | Costo de frontera nativa/seguridad | Mide; usa FFM solo cuando la interoperabilidad lo justifique |

**Verificación rápida**

```bash
javac MemoriaNativa.java && java MemoriaNativa
```

Verifica `42` y `4`. Luego intenta acceder al segmento fuera del `try` (en un experimento aparte) para observar el error de ciclo de vida.

## Cierre del módulo

La JVM no es una caja negra: con GC logs, JFR, heap dumps y entendimiento de referencias puedes diagnosticar memoria y rendimiento con evidencia. El siguiente paso en la ruta es aplicar este criterio en sistemas reales y en la evolución moderna de Java.
