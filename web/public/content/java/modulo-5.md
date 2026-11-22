# Módulo 5: Concurrencia — hilos y virtual threads

La concurrencia permite que un programa avance en varias tareas. Bien usada, mejora capacidad de respuesta y aprovechamiento de recursos; mal usada, produce condiciones de carrera, bloqueos y bugs difíciles de reproducir. Este módulo parte del modelo clásico de hilos y avanza a virtual threads, structured concurrency y scoped values de Java moderno.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Ejecutar tareas con `ExecutorService` y controlar su ciclo de vida |
| 2 | Componer tareas asíncronas con `CompletableFuture` |
| 3 | Usar virtual threads para I/O concurrente de alto volumen |
| 4 | Identificar y corregir condiciones de carrera |
| 5 | Usar structured concurrency para tareas relacionadas |
| 6 | Propagar contexto con scoped values en lugar de `ThreadLocal` |
| 7 | Manejar timeouts y cancelación cooperativa sin fugas |

## Aprende construyendo

### Tema 1: ExecutorService y gestión de hilos · Intermedio · 40 min

**Caso guía**

Necesitas procesar varias guías en paralelo sin crear un hilo nuevo por tarea manualmente. Quieres limitar el número de hilos, esperar resultados y cerrar el pool correctamente.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *hilo* (thread) es la unidad de ejecución dentro de un proceso. `ExecutorService` es una abstracción de ejecución que desacopla el envío de tareas (`Runnable`/`Callable`) de la política de hilos. `Future<T>` representa el resultado pendiente de una computación asíncrona.

**Contrato / invariantes / reglas.** `submit`/`invokeAll` aceptan tareas y devuelven futuros. `shutdown()` inicia cierre ordenado: no acepta nuevas tareas, pero completa las ya encoladas. `awaitTermination` espera cierre. `ExecutorService` es `AutoCloseable` desde Java 19. `Future.get()` bloquea y puede lanzar `ExecutionException` (falla de tarea), `InterruptedException` (interrupción) o `CancellationException`.

**Modelo mental.** El executor es una oficina con un número fijo de escritorios: tú entregas tareas a la bandeja; los trabajadores las toman; tú recoges el comprobante (`Future`).

**Implementación desde cero**

```java
import java.util.concurrent.*;
import java.util.*;

public class DemoExecutor {
    public static void main(String[] args) throws Exception {
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            List<Callable<String>> tareas = List.of(
                () -> "procesada G-1 en " + Thread.currentThread().getName(),
                () -> "procesada G-2 en " + Thread.currentThread().getName(),
                () -> "procesada G-3 en " + Thread.currentThread().getName()
            );
            List<Future<String>> futuros = executor.invokeAll(tareas);
            for (Future<String> futuro : futuros) {
                System.out.println(futuro.get());
            }
        }
        System.out.println("pool cerrado");
    }
}
```

**Desglose del código**

- `newFixedThreadPool(2)` limita concurrencia a dos hilos.
- `Callable<String>` permite devolver valor y lanzar excepciones comprobadas.
- `invokeAll` devuelve futuros en el mismo orden de las tareas.
- `try-with-resources` llama `close()`, cerrando el executor de forma ordenada.
- `future.get()` propaga errores de la tarea envueltos en `ExecutionException`.

**Ejecución y salida real**

```text
procesada G-1 en pool-1-thread-1
procesada G-2 en pool-1-thread-2
procesada G-3 en pool-1-thread-1
pool cerrado
```

Los nombres de hilos pueden variar.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| La JVM no termina | Pool sin cerrar | Usa try-with-resources o `shutdown()` |
| `ExecutionException` | La tarea lanzó excepción | Inspecciona `getCause()` |
| Bloqueo indefinido en `get()` | Tarea colgada | Usa `get(timeout, unit)` |

**Verificación rápida**

```bash
javac DemoExecutor.java && java DemoExecutor
```

Cambia el pool a 1 y observa que las tareas se ejecutan secuencialmente en un solo hilo.

### Tema 2: CompletableFuture · Intermedio · 40 min

**Caso guía**

Necesitas consultar el precio de un producto y el tipo de cambio, combinar ambos resultados y manejar fallos sin bloquear manualmente cada paso con `Future.get()`.

**Fundamento técnico y modelo mental**

**Definición formal.** `CompletableFuture<T>` es una implementación de `Future<T>` y `CompletionStage<T>` que permite componer, combinar y manejar asincronía mediante callbacks/pipelines declarativos.

**Contrato / invariantes / reglas.** Las etapas pueden ejecutarse en el pool común, en un executor dado o en el hilo que completa, según el método (`*Async`). `thenCompose` aplana dependencias de futuros (monadic flatMap); `thenCombine` combina futuros independientes. Excepciones se propagan por la cadena; `exceptionally/handle/whenComplete` permiten recuperación u observación. `join()` es similar a `get()` pero lanza excepción unchecked.

**Modelo mental.** Es una cadena de promesas: cuando llega un resultado, se activa la siguiente etapa; si falla, se desvía al manejador de error.

**Implementación desde cero**

```java
import java.util.concurrent.*;

public class DemoCompletable {
    static CompletableFuture<Double> precioUsd() {
        return CompletableFuture.supplyAsync(() -> 100.0);
    }

    static CompletableFuture<Double> tipoCambio() {
        return CompletableFuture.supplyAsync(() -> 0.92);
    }

    public static void main(String[] args) {
        CompletableFuture<Double> precioEur = precioUsd().thenCombine(tipoCambio(), (p, c) -> p * c);
        CompletableFuture<String> mensaje = precioEur
            .thenApply(eur -> "Precio EUR: " + eur)
            .exceptionally(ex -> "Error: " + ex.getMessage());
        System.out.println(mensaje.join());
    }
}
```

**Desglose del código**

- `supplyAsync` ejecuta en el `ForkJoinPool.commonPool()` por defecto.
- `thenCombine` es ideal cuando dos tareas son independientes.
- `thenCompose` se usaría si el segundo futuro depende del valor del primero.
- `exceptionally` ofrece una ruta de recuperación.
- `join()` espera resultado al final.

**Ejecución y salida real**

```text
Precio EUR: 92.0
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Pipeline devuelve `CompletableFuture<CompletableFuture<T>>` | Usaste `thenApply` en vez de `thenCompose` | Usa `thenCompose` para dependencias |
| Error silencioso | No manejaste `exceptionally/handle` | Agrega manejo explícito |
| Bloqueas con `get()` por todas partes | Perdió el beneficio de composición | Compón y espera al final |

**Verificación rápida**

```bash
javac DemoCompletable.java && java DemoCompletable
```

Simula un fallo en `tipoCambio()` lanzando `RuntimeException` y verifica que `exceptionally` responde.

### Tema 3: Virtual threads · Intermedio · 40 min

**Caso guía**

Un servicio debe atender miles de solicitudes que pasan mucho tiempo esperando I/O. Con hilos de plataforma, cada hilo bloqueado consume recursos caros. Los virtual threads permiten modelar una tarea por solicitud con bajo costo.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *virtual thread* (Java 21+) es un hilo ligero gestionado por la JVM, montado sobre hilos de plataforma (carrier threads). Mantiene la semántica de `Thread` pero con costo de creación/cambio mucho menor para cargas I/O-bound.

**Contrato / invariantes / reglas.** Los virtual threads son apropiados para alta concurrencia con bloqueos frecuentes. No incrementan CPU; no sustituyen el diseño concurrente correcto. Operaciones bloqueantes en I/O soportado desmontan el virtual thread del carrier. Se debe evitar fijar (pinning) prolongado por secciones críticas nativas o sincronizadas problemáticas. El estado compartido mutable sigue requiriendo sincronización.

**Modelo mental.** Hilo de plataforma: un camión por entrega. Virtual thread: muchos paquetes con pocos camiones, donde los paquetes bajan del camión mientras esperan en la puerta.

**Implementación desde cero**

```java
import java.time.Duration;
import java.util.concurrent.*;

public class DemoVirtualThreads {
    public static void main(String[] args) throws Exception {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            Future<String> a = executor.submit(() -> tarea("A"));
            Future<String> b = executor.submit(() -> tarea("B"));
            System.out.println(a.get());
            System.out.println(b.get());
        }
    }

    static String tarea(String id) throws Exception {
        Thread.sleep(Duration.ofMillis(100));
        return id + " en " + Thread.currentThread();
    }
}
```

**Desglose del código**

- `newVirtualThreadPerTaskExecutor()` crea un virtual thread por tarea.
- `Thread.sleep` simula bloqueo; el carrier puede liberarse mientras la tarea espera.
- El executor es `AutoCloseable`; ciérralo para esperar el trabajo pendiente.
- Los virtual threads no eliminan la necesidad de sincronización ante estado compartido.

**Ejecución y salida real**

```text
A en VirtualThread[#...]/runnable@ForkJoinPool-1-worker-...
B en VirtualThread[#...]/runnable@ForkJoinPool-1-worker-...
```

La salida exacta varía.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Esperabas acelerar CPU puro | Virtual threads no añaden CPU | Usa paralelismo apropiado o optimiza algoritmo |
| Bloqueos en código sincronizado/nativo | Pinning o sección crítica larga | Evita bloquear dentro de `synchronized` en I/O; revisa diseño |
| Sigues compartiendo estado mutable sin control | Concurrencia mal diseñada | Aplica inmutabilidad, confinamiento o sincronización |

**Verificación rápida**

```bash
javac DemoVirtualThreads.java && java DemoVirtualThreads
```

Comprueba que ambas tareas completan y el proceso termina.

### Tema 4: Condiciones de carrera y sincronización · Avanzado · 45 min

**Caso guía**

Dos hilos incrementan el mismo contador. A veces el resultado es correcto, a veces menor. El bug no siempre aparece, lo que lo hace peligroso.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *condición de carrera* (data race / race condition, según contexto) ocurre cuando la corrección depende del orden no determinista de acceso concurrente a estado compartido. Una *sección crítica* es una región que debe ejecutarse con exclusión o disciplina de sincronización para preservar invariantes.

**Contrato / invariantes / reglas.** `count++` es una operación compuesta (leer-modificar-escribir), no atómica. El Java Memory Model define *happens-before*: sin una relación happens-before, no hay garantías de visibilidad/orden esperadas. `synchronized`, `volatile`, `Lock`, y clases atómicas establecen garantías distintas. `volatile` garantiza visibilidad/orden de lecturas-escrituras de la variable, pero no atomicidad de operaciones compuestas.

**Modelo mental.** Dos personas editan el mismo saldo en papeles distintos: ambos leen 100, ambos escriben 110; se perdió una operación.

**Implementación desde cero**

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class DemoRace {
    static int noSeguro = 0;
    static AtomicInteger seguro = new AtomicInteger(0);

    public static void main(String[] args) throws Exception {
        try (ExecutorService ex = Executors.newFixedThreadPool(4)) {
            for (int i = 0; i < 1000; i++) {
                ex.submit(() -> { noSeguro++; seguro.incrementAndGet(); });
            }
        }
        System.out.println("noSeguro=" + noSeguro);
        System.out.println("seguro=" + seguro.get());
    }
}
```

**Desglose del código**

- `noSeguro++` puede perder incrementos cuando dos hilos leen el mismo valor antes de escribir.
- `AtomicInteger.incrementAndGet()` realiza la operación atómica.
- El `try-with-resources` espera el cierre del executor antes de imprimir.
- Para invariantes más complejos, un atómico simple puede no bastar.

**Ejecución y salida real**

```text
noSeguro=987
seguro=1000
```

`noSeguro` puede variar; `seguro` debe ser 1000.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Resultado cambia entre ejecuciones | Condición de carrera | Sincroniza o usa primitivas atómicas |
| Deadlock | Locks adquiridos en orden inconsistente | Define orden de adquisición; reduce alcance del lock |
| Usas `volatile` para `count++` | `volatile` no hace atómica la operación compuesta | Usa `AtomicInteger` o sincronización |

**Verificación rápida**

```bash
javac DemoRace.java && java DemoRace
```

Ejecuta varias veces. Si `noSeguro` sale menor que 1000 en alguna ejecución, viste la carrera.

### Tema 5: Structured Concurrency (StructuredTaskScope, Java 25) · Avanzado · 45 min

**Caso guía**

Para responder una solicitud necesitas consultar usuario y pedidos. Son tareas relacionadas: si una falla o se agota el tiempo, no quieres dejar la otra huérfana.

> **Nota de versión:** Structured Concurrency ha evolucionado entre previews. En JDK 27 (con preview habilitado) este ejemplo compila con `--release 27 --enable-preview`. Verifica la API exacta de tu JDK antes de usarla en producción.

**Fundamento técnico y modelo mental**

**Definición formal.** La *concurrencia estructurada* es un modelo donde las subtareas concurrentes tienen un alcance léxico bien definido: se inician, esperan y terminan dentro de un bloque/scope, formando una unidad de trabajo.

**Contrato / invariantes / reglas.** El scope establece la política de inicio, unión, propagación de fallos y cancelación. Las subtareas no deben sobrevivir al scope. Esto mejora observabilidad, manejo de errores y cancelación respecto a futuros no estructurados. Como la API ha sido preview en versiones recientes, el contrato exacto depende de la versión del JDK.

**Modelo mental.** Es como un equipo que entra a una sala a resolver un caso: nadie se va hasta que el caso se cierra o se cancela formalmente.

**Implementación desde cero**

```java
import java.util.concurrent.StructuredTaskScope;

public class DemoStructured {
    static String usuario() throws InterruptedException {
        Thread.sleep(100);
        return "Ada";
    }

    static String pedidos() throws InterruptedException {
        Thread.sleep(120);
        return "3 pedidos";
    }

    public static void main(String[] args) throws Exception {
        try (var scope = StructuredTaskScope.open()) {
            var u = scope.fork(DemoStructured::usuario);
            var p = scope.fork(DemoStructured::pedidos);
            scope.join();
            System.out.println(u.get() + " - " + p.get());
        }
    }
}
```

**Desglose del código**

- `StructuredTaskScope.open()` crea el ámbito de las subtareas.
- `fork` lanza subtareas relacionadas.
- `join()` espera la finalización del scope según su política.
- El `try-with-resources` asegura el cierre del scope.

**Ejecución y salida real**

En JDK 27 con preview habilitado:

```text
Ada - 3 pedidos
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `cannot find symbol StructuredTaskScope` | JDK no soporta esa API/versión | Verifica JDK y flags preview |
| Subtareas huérfanas | Usaste futuros sin estructura | Agrupa tareas relacionadas en un scope |
| Ignoras fallos parciales | No definiste política de error | Elige join/fallo/cancelación según el caso |

**Verificación rápida**

```bash
javac --release 27 --enable-preview DemoStructured.java
java --enable-preview DemoStructured
```

Si tu JDK no tiene esta API exacta, conserva el concepto y usa el equivalente disponible en tu versión.

### Tema 6: Scoped Values frente a ThreadLocal (Java 25) · Avanzado · 45 min

**Caso guía**

Quieres propagar un `requestId` a código llamado dentro de la misma tarea, incluso si se ejecuta en otros hilos/vthreads. Con `ThreadLocal` es fácil olvidar la limpieza o filtrar contexto.

> **Nota de versión:** Scoped Values es una característica final en Java 25. Requiere JDK 25+.

**Fundamento técnico y modelo mental**

**Definición formal.** Un `ScopedValue` es una variable de contexto inmutable ligada a un alcance de ejecución dinámico. A diferencia de `ThreadLocal`, su valor se enlaza para la ejecución de un bloque y no se muta arbitrariamente.

**Contrato / invariantes / reglas.** `ScopedValue.where(k,v).run(...)` establece el binding en el alcance. `get()` requiere que el valor esté ligado en el contexto actual; si no, lanza excepción. El valor se desliga al salir del scope. Esto evita fugas típicas de `ThreadLocal` en pools y favorece un modelo funcional/inmutable de contexto.

**Modelo mental.** `ThreadLocal` es una mochila que cada hilo carga y puede olvidar vaciar; `ScopedValue` es un pase temporal que solo vale dentro de una sala.

**Implementación desde cero**

```java
public class DemoScopedValue {
    static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

    static void procesar() {
        System.out.println("request=" + REQUEST_ID.get());
    }

    public static void main(String[] args) {
        ScopedValue.where(REQUEST_ID, "req-123").run(() -> {
            procesar();
        });
        System.out.println("fuera=" + REQUEST_ID.isBound());
    }
}
```

**Desglose del código**

- `ScopedValue.newInstance()` crea la clave.
- `where(..., ...).run(...)` define el alcance donde el valor está ligado.
- `REQUEST_ID.get()` solo es válido dentro de un scope donde esté enlazado.
- `isBound()` permite verificar si hay valor en el contexto actual.

**Ejecución y salida real**

En JDK 25+:

```text
request=req-123
fuera=false
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `NoSuchElementException` al hacer `get()` | No hay valor ligado en el scope actual | Verifica `isBound()` o estructura el scope |
| Usas ScopedValue como estado mutable | Mal modelo | Mantén el valor inmutable; pasa estado explícito si cambia |
| Olvidas limpieza con ThreadLocal | Patrón viejo en pools | Prefiere ScopedValue cuando el contexto es de alcance |

**Verificación rápida**

```bash
javac --release 25 DemoScopedValue.java && java DemoScopedValue
```

Prueba llamar `REQUEST_ID.get()` fuera del scope y captura la excepción para entender el contrato.

### Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos · Avanzado · 45 min

**Caso guía**

Una llamada externa puede tardar demasiado. Quieres limitar el tiempo, cancelar la tarea y asegurarte de que archivos/conexiones se cierren aunque haya timeout.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *timeout* es un límite temporal máximo para una operación. La *cancelación cooperativa* es un mecanismo donde la tarea observa una señal de cancelación/interrupción y termina limpiamente; no es terminación forzada inmediata del hilo.

**Contrato / invariantes / reglas.** `Future.cancel(true)` solicita interrupción. El código debe responder a `InterruptedException`, a `Thread.interrupted()/isInterrupted()` o a APIs sensibles a interrupción. Ignorar interrupciones puede dejar tareas colgadas. Los recursos deben cerrarse en `try-with-resources` o `finally`. Al capturar `InterruptedException`, se debe restaurar el estado de interrupción (`Thread.currentThread().interrupt()`) o salir de forma controlada.

**Modelo mental.** Cancelar es tocar el timbre y pedir salir; la tarea debe escuchar el timbre y recoger sus cosas antes de irse.

**Implementación desde cero**

```java
import java.util.concurrent.*;

public class DemoTimeout {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> futuro = executor.submit(() -> {
            for (int i = 1; i <= 5; i++) {
                if (Thread.currentThread().isInterrupted()) {
                    return "cancelado";
                }
                Thread.sleep(200);
            }
            return "ok";
        });

        try {
            System.out.println(futuro.get(300, TimeUnit.MILLISECONDS));
        } catch (TimeoutException e) {
            futuro.cancel(true);
            System.out.println("timeout");
        } catch (Exception e) {
            System.out.println("error: " + e);
        } finally {
            executor.shutdownNow();
        }
    }
}
```

**Desglose del código**

- `get(300, TimeUnit.MILLISECONDS)` aplica timeout al que espera el resultado.
- `future.cancel(true)` solicita interrupción.
- La tarea revisa `isInterrupted()` y usa `sleep`, que también responde a interrupción.
- `shutdownNow()` intenta detener tareas pendientes al cerrar.
- Los recursos abiertos dentro de la tarea deben ir en `try-with-resources`.

**Ejecución y salida real**

```text
timeout
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| La tarea sigue corriendo tras timeout | No coopera con interrupción | Revisa `isInterrupted()` y APIs interrumpibles |
| `InterruptedException` atrapada y ignorada | Se perdió la señal | Restablece `Thread.currentThread().interrupt()` o termina |
| Recursos abiertos tras cancelar | Limpieza no garantizada | Usa `try-with-resources` dentro de la tarea |

**Verificación rápida**

```bash
javac DemoTimeout.java && java DemoTimeout
```

Aumenta el timeout a 2000 ms y verifica que la salida cambia a `ok`.

## Cierre del módulo

Concurrencia no es solo “hacer cosas en paralelo”: es coordinar tareas, proteger estado compartido y cerrar recursos bajo fallos y tiempos límite. En el siguiente módulo aplicarás esta base en I/O y NIO.2, donde el costo de esperar y manejar recursos es central.
