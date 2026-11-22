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

**Concepto clave / modelo mental**

Crear `new Thread(...).start()` por tarea es simple pero no escala bien. `ExecutorService` separa la tarea del hilo que la ejecuta.

| API | Uso |
|---|---|
| `Executors.newFixedThreadPool(n)` | Pool con límite fijo |
| `submit(Callable)` | Envía tarea que devuelve resultado (`Future`) |
| `shutdown()` | No acepta nuevas tareas |
| `awaitTermination(...)` | Espera cierre |
| `close()` (Java 19+) | `ExecutorService` es `AutoCloseable` |

`Future.get()` bloquea hasta que hay resultado o error.

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
- `invokeAll` envía todas las tareas y devuelve futuros en el mismo orden.
- `try-with-resources` llama `close()`, que cierra el executor de forma ordenada.
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

**Concepto clave / modelo mental**

`CompletableFuture` representa un resultado asíncrono que puede componerse. Permite encadenar pasos, combinar futuros y definir recuperación ante errores.

| Método | Propósito |
|---|---|
| `supplyAsync` | Ejecuta tarea que devuelve valor |
| `thenApply` | Transforma resultado |
| `thenCompose` | Encadena otro futuro dependiente |
| `thenCombine` | Combina dos futuros independientes |
| `exceptionally` | Recupera ante error |

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
        CompletableFuture<Double> precioEur = precioUsd()
            .thenCombine(tipoCambio(), (precio, cambio) -> precio * cambio);

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
- `exceptionally` ofrece una ruta de recuperación; evita dejar la excepción sin manejo.
- `join()` espera resultado y lanza excepción unchecked si falla.

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

**Concepto clave / modelo mental**

Los virtual threads (Java 21+) son hilos ligeros gestionados por la JVM. Son adecuados para tareas con mucho bloqueo (I/O, espera de red). No hacen más rápido el CPU puro; hacen más barata la espera.

| Tipo | Bueno para | Límite |
|---|---|---|
| Hilo de plataforma | CPU, tareas nativas, pocos hilos | Caro en miles de bloqueos |
| Virtual thread | Muchas tareas bloqueantes | No reemplaza diseño; cuidado con pinning/synchronized |

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
- `Thread.sleep` simula bloqueo; con virtual threads, el hilo de plataforma puede liberarse mientras la tarea espera.
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

Comprueba que ambas tareas completan y el proceso termina. Para carga real, mide con muchas tareas y I/O simulado.

### Tema 4: Condiciones de carrera y sincronización · Avanzado · 45 min

**Caso guía**

Dos hilos incrementan el mismo contador. A veces el resultado es correcto, a veces menor. El bug no siempre aparece, lo que lo hace peligroso.

**Concepto clave / modelo mental**

Una condición de carrera ocurre cuando el resultado depende del orden de intercalación de hilos sobre estado compartido mutable. `count++` no es atómico: lee, suma y escribe.

Herramientas comunes:

| Herramienta | Cuándo usarla |
|---|---|
| `synchronized` | Proteger sección crítica simple |
| `AtomicInteger/Long` | Contadores y actualizaciones atómicas simples |
| `Lock` | Control más fino que `synchronized` |
| Inmutabilidad/confined state | Evitar compartir estado mutable |

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
- Para invariantes más complejos, un simple atómico puede no bastar; usa bloqueos o diseña el estado compartido.

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

**Concepto clave / modelo mental**

Structured concurrency trata tareas concurrentes como una unidad de trabajo con alcance claro. El scope abre, lanza subtareas, espera y cierra. Si el scope termina, las subtareas no quedan sueltas.

Beneficios:

- ciclo de vida claro;
- cancelación y errores propagados por estructura;
- código más fácil de razonar que futuros sueltos.

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
- Si una subtarea falla, la política del scope determina cancelación/propagación; revisa la configuración para tu caso.

**Ejecución y salida real**

En JDK 25 con esta API:

```text
Ada - 3 pedidos
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `cannot find symbol StructuredTaskScope` | JDK no soporta esa API/versión | Verifica JDK 25 y ajusta al API disponible |
| Subtareas huérfanas | Usaste futuros sin estructura | Agrupa tareas relacionadas en un scope |
| Ignoras fallos parciales | No definiste política de error | Elige join/fallo/cancelación según el caso de negocio |

**Verificación rápida**

```bash
javac --release 27 --enable-preview DemoStructured.java
java --enable-preview DemoStructured
```

Si tu JDK no tiene esta API exacta, conserva el concepto y usa el equivalente disponible en tu versión.

### Tema 6: Scoped Values frente a ThreadLocal (Java 25) · Avanzado · 45 min

**Caso guía**

Quieres propagar un `requestId` a código llamado dentro de la misma tarea, incluso si se ejecuta en otros hilos/vthreads. Con `ThreadLocal` es fácil olvidar la limpieza o filtrar contexto.

> **Nota de versión:** Scoped Values es una característica final en Java 25. Requiere JDK 25.

**Concepto clave / modelo mental**

`ScopedValue` permite vincular un valor inmutable a un ámbito de ejecución. A diferencia de `ThreadLocal`:

- el valor no se muta; se enlaza por alcance;
- el alcance es visible en el código;
- funciona bien con virtual threads y structured concurrency.

| `ThreadLocal` | `ScopedValue` |
|---|---|
| Mutable, set/get | Enlazado por scope |
| Requiere `remove()` | Se limpia al salir del scope |
| Fácil de filtrar en pools | Modelo de alcance más seguro |

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

En JDK 25:

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

**Concepto clave / modelo mental**

La cancelación en Java es normalmente **cooperativa**: interrumpir un hilo no mata mágicamente la tarea; la tarea debe observar la interrupción o comprobar una condición.

Buenas prácticas:

- usa timeouts (`get(timeout)`, `orTimeout`, APIs con deadline);
- maneja `InterruptedException` restaurando la interrupción o saliendo limpiamente;
- cierra recursos con `try-with-resources`;
- evita tragar interrupciones.

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
- La tarea devuelve o termina limpiamente; los recursos que abra deben ir en `try-with-resources` dentro de la tarea.

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
