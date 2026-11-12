# Módulo 11: JVM interna — GC, profiling y JIT


## Aprende construyendo

### Tema 1: Generaciones de memoria y recolectores

**¿Por qué es importante?** saber si crece el heap o si el GC solo está limpiando objetos temporales ayuda a investigar pausas y memoria insuficiente.

#### Subtema 1.1: Observa el heap de una JVM · 10 min

**1. Contexto**

Un servicio parece usar memoria, pero no sabes cuánto heap reservó y cuánto está ocupado.

**2. Hazlo tú**

Crea `src/Memoria.java` con `public class Memoria { public static void main(String[] args) throws Exception { var datos = new byte[10_000_000]; System.out.println(datos.length); Thread.sleep(30_000); } }`. Ejecuta `javac -d out src/Memoria.java`, luego `java -cp out Memoria` en una terminal aparte y, mientras espera, `jcmd -l` y `jcmd <PID> GC.heap_info`.

**Resultado esperado:** ves una JVM activa y el estado resumido del heap; el arreglo sigue referenciado durante la espera.

**Fallo deliberado:** ejecuta `GC.heap_info` con el PID de otro proceso. **Diagnóstico:** comprueba PID y usuario antes de interpretar la salida.

**3. Entiende**

El heap contiene objetos; el proceso puede reservar más memoria que la ocupada en ese instante.

**4. Cierra**

Guarda la salida de `GC.heap_info` y el PID consultado.

#### Subtema 1.2: Distingue objetos vivos de basura · 10 min

**1. Contexto**

Un lote temporal ya no se necesita y el GC puede recuperar su espacio cuando lo determine.

**2. Hazlo tú**

En `src/Memoria.java`, crea una función que asigne varios arreglos dentro de un bloque y no los retenga después; compara con una lista estática que sí conserve referencias. Ejecuta `java -Xlog:gc -Xms32m -Xmx32m -cp out Memoria`.

**Resultado esperado:** el log informa actividad del GC; los objetos retenidos no desaparecen solo por dejar de usarlos localmente.

**Fallo deliberado:** espera que `System.gc()` garantice una recolección inmediata. **Diagnóstico:** es una solicitud al runtime, no una orden de resultado garantizado.

**3. Entiende**

La alcanzabilidad determina si un objeto puede reclamarse. Las generaciones son una estrategia común del collector, no una promesa de que cada objeto se mueva en un momento exacto.

**4. Cierra**

Escribe cuál arreglo sigue alcanzable y por qué.

#### Subtema 1.3: Compara logs antes de ajustar · 10 min

**1. Contexto**

Cambiar el collector sin medir puede empeorar una aplicación que ya cumple sus objetivos.

**2. Hazlo tú**

Ejecuta `src/Memoria.java` con `java -Xlog:gc -Xms32m -Xmx32m -cp out Memoria` y luego con `java -XX:+UseSerialGC -Xlog:gc -Xms32m -Xmx32m -cp out Memoria`. Compara número de eventos y pausas reportadas sin extrapolar a producción.

**Resultado esperado:** cada proceso deja eventos observables y una configuración reproducible.

**Fallo deliberado:** elige el collector por un único evento corto. **Diagnóstico:** usa una carga representativa y mide latencia además de throughput.

**3. Entiende**

El log permite formular hipótesis; requiere carga y objetivos del servicio para concluir.

**4. Cierra**

Guarda los dos comandos y una observación medida. Fuente: [logging de GC en Java](https://docs.oracle.com/en/java/javase/25/gctuning/garbage-collector-implementation.html).

### Tema 2: Java Flight Recorder y JIT compilation

**¿Por qué es importante?** JFR registra actividad de la JVM con bajo esfuerzo; el JIT compila código caliente y vuelve engañosa una medición sin calentamiento.

#### Subtema 2.1: Captura una grabación JFR · 10 min

**1. Contexto**

Necesitas una evidencia de lo que ocurre durante un proceso, no una suposición basada en el uso de CPU.

**2. Hazlo tú**

Crea `src/Trabajo.java` que imprima un mensaje y mantenga el proceso activo con `Thread.sleep(5000)`. Compila con `javac -d out src/Trabajo.java`; ejecuta `java -XX:StartFlightRecording=filename=trabajo.jfr,duration=8s -cp out Trabajo`; luego `jfr summary trabajo.jfr`.

**Resultado esperado:** el resumen muestra duración y tipos de eventos de la grabación.

**Fallo deliberado:** intenta leer el archivo antes de terminar la captura. **Diagnóstico:** espera a que el proceso cierre la grabación y confirma que el archivo existe.

**3. Entiende**

JFR recopila eventos temporales de la JVM; un resumen breve no explica por sí solo la causa de lentitud.

**4. Cierra**

Guarda `jfr summary` y la duración que capturaste.

#### Subtema 2.2: Observa compilación caliente · 10 min

**1. Contexto**

Un bucle medido una sola vez puede incluir interpretación y compilación JIT.

**2. Hazlo tú**

En `src/Calentar.java` crea un bucle que llame muchas veces una función de suma y mida el tiempo con `System.nanoTime()`. Compila y ejecuta `java -XX:+PrintCompilation -cp out Calentar`.

**Resultado esperado:** el proceso imprime compilaciones JIT además de los tiempos; ejecuciones repetidas pueden diferir por calentamiento.

**Fallo deliberado:** declara que la primera pasada representa el rendimiento estable. **Diagnóstico:** repite la carga y compara después de calentamiento; también considera optimizaciones y ruido de la máquina.

**3. Entiende**

El JIT compila métodos que ejecutan repetidamente. Una micro-medición manual no reemplaza un benchmark diseñado.

**4. Cierra**

Anota la salida de compilación y qué medición no usarías para decidir una optimización.

#### Subtema 2.3: Resume la grabación para comparar · 10 min

**1. Contexto**

Quieres revisar eventos del proceso de carga y no solo el tiempo de pared.

**2. Hazlo tú**

Ejecuta `src/Calentar.java` con `java -XX:StartFlightRecording=filename=calentar.jfr,duration=10s -cp out Calentar`. Corre `jfr summary calentar.jfr` y `jfr print --events jdk.Compilation calentar.jfr`.

**Resultado esperado:** el reporte lista eventos de compilación registrados durante esa ventana.

**Fallo deliberado:** compara grabaciones de cargas distintas como si fueran equivalentes. **Diagnóstico:** repite mismo JDK, flags, duración y carga.

**3. Entiende**

La grabación aporta contexto de ejecución; usa la misma prueba de carga para que las comparaciones signifiquen algo.

**4. Cierra**

Guarda el comando y tres datos del resumen. Fuente: [Java Flight Recorder](https://docs.oracle.com/en/java/javase/25/jfapi/).

**Lee la grabación:** `jfr summary trabajo.jfr` muestra duración y eventos; `jfr print --events jdk.ExecutionSample trabajo.jfr` permite inspeccionar muestras. Busca patrones repetidos de CPU, esperas y bloqueos; una muestra no identifica la causa por sí sola. Para comparar JIT, conserva la misma carga y separa rondas de calentamiento de rondas medidas. Una microprueba manual ayuda a aprender, pero no reemplaza un benchmark controlado ni demuestra una mejora en producción. Fuente primaria: https://docs.oracle.com/en/java/javase/25/docs/specs/man/jfr.html.

### Tema 3: Referencias especiales y heap dumps

**¿Por qué es importante?** retener objetos más tiempo del necesario puede agotar memoria; un heap dump ayuda a encontrar quién conserva referencias.

#### Subtema 3.1: Prueba una referencia débil · 10 min

**1. Contexto**

Un índice de ayuda no debería ser el único motivo para mantener un objeto en memoria.

**2. Hazlo tú**

Crea `src/ReferenciaDebil.java` con `WeakReference<byte[]> ref = new WeakReference<>(new byte[1_000_000]); System.out.println(ref.get() != null); System.gc(); System.out.println(ref.get());`. Ejecuta `javac -d out src/ReferenciaDebil.java` y `java -cp out ReferenciaDebil`.

**Resultado esperado:** la primera consulta encuentra el objeto; la segunda puede encontrarlo o ser `null`, porque el GC no promete cuándo actuar.

**Fallo deliberado:** afirma que `System.gc()` siempre debe producir `null`. **Diagnóstico:** una referencia débil permite recuperación, no ordena una recolección inmediata.

**3. Entiende**

Una referencia débil no mantiene vivo por sí sola su referent; comprueba `get()` antes de usarlo.

**4. Cierra**

Guarda ambas salidas si varían y explica por qué el resultado puede cambiar.

#### Subtema 3.2: Detecta una referencia fuerte accidental · 10 min

**1. Contexto**

Una caché estática que nunca elimina entradas puede conservar miles de paquetes antiguos.

**2. Hazlo tú**

En `src/Retencion.java` usa una lista `static final` que retenga arreglos creados en un ciclo. Ejecuta `javac -d out src/Retencion.java` y `java -Xmx32m -cp out Retencion`; registra el error de memoria o el tamaño alcanzado.

**Resultado esperado:** la lista conserva las referencias hasta que se limpie o termine el proceso.

**Fallo deliberado:** atribuye el crecimiento al GC sin revisar quién mantiene los objetos. **Diagnóstico:** inspecciona campos estáticos y estructuras de caché.

**3. Entiende**

El GC no elimina objetos alcanzables por referencias fuertes. Para una caché real define vencimiento, tamaño máximo o política de expulsión.

**4. Cierra**

Nombra la estructura que retuvo los arreglos y una política para limitarla.

#### Subtema 3.3: Crea un heap dump para investigarlo · 10 min

**1. Contexto**

Una fuga aparente requiere capturar objetos y referencias mientras el proceso aún está vivo.

**2. Hazlo tú**

Inicia `src/Retencion.java` con `java -Xmx64m -cp out Retencion` manteniéndolo activo. En otra terminal identifica PID con `jcmd -l` y ejecuta `jcmd <PID> GC.heap_dump retencion.hprof`. Confirma el archivo y su tamaño.

**Resultado esperado:** aparece un dump HPROF que puedes abrir en un analizador de heap compatible.

**Fallo deliberado:** guarda el dump en un volumen sin espacio. **Diagnóstico:** verifica permisos y espacio antes de repetir; un heap dump puede ser grande y pausar la JVM.

**3. Entiende**

El dump captura objetos y referencias; puede contener datos sensibles de memoria. Protege el archivo y bórralo según política.

**4. Cierra**

Registra comando, PID y ruta del dump, sin compartirlo fuera del entorno autorizado. Fuente: [herramienta `jcmd`](https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html).

### Tema 4: Foreign Function & Memory API (Java 22)

**¿Por qué es importante?** FFM permite llamar funciones nativas y administrar memoria fuera del heap con tipos y ciclos de vida explícitos.

#### Subtema 4.1: Reserva memoria nativa con Arena · 10 min

**1. Contexto**

Una librería nativa necesita un segmento de memoria para recibir texto UTF-8.

**2. Hazlo tú**

Crea `src/MemoriaNativa.java`:

```java
import java.lang.foreign.Arena;

public class MemoriaNativa {
    public static void main(String[] args) {
        try (Arena arena = Arena.ofConfined()) {
            var texto = arena.allocateUtf8String("RutaFlow");
            System.out.println(texto.byteSize());
        }
    }
}
```

Compila `javac -d out src/MemoriaNativa.java` y ejecuta `java -cp out MemoriaNativa` con JDK 22 o superior.

**Resultado esperado:** se imprime el tamaño en bytes del segmento UTF-8.

**Fallo deliberado:** mueve el acceso al segmento fuera del bloque `try`. **Diagnóstico:** el arena ya cerró su memoria; usa el segmento solo durante su ciclo de vida.

**3. Entiende**

El arena controla el tiempo de vida del segmento. Al cerrar un arena confinado, su memoria deja de estar disponible.

**4. Cierra**

Guarda el tamaño y señala cuándo termina el ciclo de vida de esa memoria.

#### Subtema 4.2: Llama una función nativa conocida · 10 min

**1. Contexto**

La función `strlen` de la biblioteca C devuelve la longitud de una cadena terminada en cero.

**2. Hazlo tú**

Crea `src/LongitudNativa.java` con `Linker.nativeLinker()`, busca el símbolo `strlen` en `linker.defaultLookup()`, crea un downcall handle con `FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS)`, reserva `arena.allocateUtf8String("RutaFlow")` y llama `invokeExact(texto)`. Activa `--enable-native-access=ALL-UNNAMED`; compila con JDK 22+ y ejecuta `java --enable-native-access=ALL-UNNAMED -cp out LongitudNativa`.

**Resultado esperado:** la función nativa devuelve `8` para `RutaFlow`.

**Fallo deliberado:** describe el retorno nativo como `JAVA_INT`. **Diagnóstico:** la firma C devuelve `size_t`, representado como `JAVA_LONG` en esta plataforma de 64 bits; revisa la ABI del sistema.

**3. Entiende**

Un downcall handle conecta una firma Java con una función nativa. La firma, plataforma y duración de memoria deben coincidir.

**4. Cierra**

Conserva la salida y el descriptor elegido. Fuente: [FFM API en Java 22](https://docs.oracle.com/en/java/javase/22/core/foreign-function-and-memory-api.html).

#### Subtema 4.3: Evita que memoria nativa se use tras cerrar Arena · 10 min

**1. Contexto**

Un segmento que se conserva después de cerrar su arena ya no es seguro de acceder.

**2. Hazlo tú**

En `src/MemoriaNativa.java`, conserva el segmento en una variable externa al bloque `try (Arena arena = Arena.ofConfined())`. Dentro del bloque imprime el texto; después intenta leerlo con `texto.getString(0)`. Compila y ejecuta `java -cp out MemoriaNativa`.

**Resultado esperado:** el acceso dentro del bloque funciona y el acceso posterior falla porque el segmento quedó liberado.

**Fallo deliberado:** comparte el segmento confinado con otro hilo. **Diagnóstico:** el arena confinado pertenece al hilo que lo creó; usa un arena compartido solo si el diseño necesita acceso concurrente y define quién lo cierra.

**3. Entiende**

FFM hace explícita la gestión de memoria nativa; un acceso inválido puede fallar en vez de comportarse como una referencia Java ordinaria.

**4. Cierra**

Guarda el fallo tras el cierre y documenta quién es responsable de cerrar el arena. Fuente: [JEP 454](https://openjdk.org/jeps/454).

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** generar un reporte de profiling identificando un cuello de botella real, y analizar un heap dump tras un `OutOfMemoryError` provocado intencionalmente.

**Requisitos previos:** Módulos 0-10 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Ejecutar con G1 y con ZGC, comparar pausas | Ver Tema 1 | `-XX:+UseG1GC` vs `-XX:+UseZGC` |
| 2 | Grabar una sesión de JFR bajo carga | Ver Tema 2 | Analiza el método que más CPU consume |
| 3 | Provocar un `OutOfMemoryError` intencional | Ver Tema 3 | Analiza el heap dump generado |
| 4 | Documentar qué hace el JIT compiler | Ver Tema 2 | Compilación en caliente del código frecuente |
| 5 | Invocar una función nativa con el FFM API | Ver Tema 4 | Sin JNI, con ciclo de vida de memoria explícito vía Arena |

**Verificación:** el laboratorio se considera exitoso si el reporte de JFR identifica correctamente el método real que más tiempo de CPU consume bajo la carga simulada, si el heap dump analizado identifica correctamente qué objetos causaron el `OutOfMemoryError`, y si la llamada nativa con FFM API falla de forma diagnosticable al usar memoria de un Arena ya cerrado.

**Errores comunes y soluciones**

- **Asumir que ZGC siempre es mejor que G1 sin medir.** ZGC prioriza latencia mínima a costa de throughput; mide según las necesidades reales de tu aplicación.
- **Intentar diagnosticar un problema de producción solo con logs normales.** Usa JFR o un heap dump para obtener el detalle específico necesario.
- **Usar referencias fuertes normales para una caché que debería liberarse bajo presión de memoria.** Considera `SoftReference` para ese caso específico.
- **Usar memoria nativa de un `Arena` después de que se cerró.** El Arena controla el ciclo de vida explícitamente; usa la memoria solo dentro de su scope o uno de vida más larga.

---
