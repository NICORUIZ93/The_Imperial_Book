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

Procesas 20 tareas I/O-bound. Crear un hilo por tarea sin límite desperdicia recursos; necesitas un pool gestionado y un apagado limpio.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **ExecutorService** | Interfaz de alto nivel para ejecutar tareas asíncronas (`submit`, `invokeAll`, `shutdown`). | Separar envío de tareas de la gestión de hilos. | Casi siempre en vez de `new Thread()`. | No cerrar el executor (fuga de hilos). |
| **Gestión de hilos** | Control de creación, reutilización, cola, límites y ciclo de vida de hilos. | Evitar sobrecarga y fugas. | Servicios con tareas concurrentes. | Pool sin límite o sin shutdown. |
| **Thread pools** | Conjunto de hilos trabajadores que reutilizan tareas de una cola. | Amortizar coste de creación de hilos. | Tareas repetidas/I-O bound con límite. | `newFixedThreadPool` enorme; `cached` sin límite. |
| **`shutdown`/`awaitTermination`** | `shutdown` deja de aceptar nuevas tareas; `awaitTermination` espera finalización. | Cierre ordenado. | Al finalizar app/test. | Olvidar `shutdown`, JVM no termina. |

**Contrato / invariantes / reglas.** `submit` retorna `Future`. Tareas enviadas después de `shutdown` lanzan `RejectedExecutionException`. `shutdownNow` intenta interrumpir. El executor debe cerrarse en `finally`/try-with-resources (Java 19+ `ExecutorService` es `AutoCloseable`).

**Modelo mental.** Pool = equipo fijo de trabajadores con bandeja de tareas; shutdown = “no aceptamos más pedidos, terminen los actuales”.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-5 && cd ~/academia-java/modulo-5
```

`DemoExecutor.java`:

```java
import java.util.concurrent.*;
import java.util.*;

public class DemoExecutor {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(4);
        try {
            List<Future<String>> futuros = new ArrayList<>();
            for (int i = 1; i <= 6; i++) {
                final int id = i;
                futuros.add(executor.submit(() -> {
                    Thread.sleep(50);
                    return "tarea-" + id + " en " + Thread.currentThread().getName();
                }));
            }
            for (Future<String> f : futuros) System.out.println(f.get());
        } finally {
            executor.shutdown();
            executor.awaitTermination(5, TimeUnit.SECONDS);
        }
    }
}
```

**Ejecución y salida real**

```bash
javac DemoExecutor.java
java DemoExecutor
```

```text
tarea-1 en pool-1-thread-1
...
tarea-6 en pool-1-thread-...
```

(orden/nombres de hilo pueden variar; 6 tareas completadas).

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| JVM no termina | Falta `shutdown` | `shutdown` + `awaitTermination` o try-with-resources |
| Tareas rechazadas | `submit` tras shutdown | Controla ciclo de vida |
| Demasiados hilos | Pool mal dimensionado | Mide; limita según recurso |

**Verificación rápida:** confirma que el proceso termina sin colgarse.


### Tema 2: CompletableFuture · Intermedio · 40 min

**Caso guía**

Necesitas obtener usuario y pedidos en paralelo, combinarlos, y manejar fallo con valor por defecto sin bloquear el hilo principal innecesariamente.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **CompletableFuture** | `Future` que puede completarse manualmente y encadenar etapas asíncronas. | Composición async no bloqueante. | Pipelines async, combinar llamadas independientes. | Bloquear con `get()` por todas partes. |
| **`supplyAsync`/`thenApply`/`thenCombine`** | Crea tarea async; transforma resultado; combina dos futuros. | Pipeline y fan-out/fan-in. | Dependencias y combinación de resultados. | Usar pool común para I/O bloqueante sin control. |
| **`exceptionally`/`handle`** | Recuperación ante error. | Valor por defecto o manejo explícito. | Fallbacks controlados. | Tragar error y devolver dato incorrecto. |
| **No bloqueante (composición)** | Encadenar etapas sin esperar activamente. | Mejor uso de hilos. | Orquestación async. | `join/get` temprano rompe la composición. |

**Contrato / invariantes / reglas.** Por defecto usa `ForkJoinPool.commonPool()`; para I/O pasa executor propio. Excepciones se propagan por la cadena hasta handler. `join()` lanza unchecked; `get()` checked/interrumpible.

**Modelo mental.** Promesa encadenable: “cuando llegue X, haz Y; si falla, usa Z”.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-5 && cd ~/academia-java/modulo-5
```

`DemoCompletable.java`:

```java
import java.util.concurrent.*;

public class DemoCompletable {
    static CompletableFuture<String> usuario() {
        return CompletableFuture.supplyAsync(() -> { dormir(100); return "Ada"; });
    }
    static CompletableFuture<Integer> pedidos() {
        return CompletableFuture.supplyAsync(() -> { dormir(120); return 3; });
    }
    static void dormir(long ms){ try { Thread.sleep(ms); } catch (InterruptedException e){ Thread.currentThread().interrupt(); }}
    public static void main(String[] args) {
        String resumen = usuario().thenCombine(pedidos(), (u,p) -> u + " tiene " + p + " pedidos")
            .exceptionally(e -> "fallback")
            .join();
        System.out.println(resumen);
    }
}
```

**Ejecución y salida real**

```bash
javac DemoCompletable.java
java DemoCompletable
```

```text
Ada tiene 3 pedidos
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Bloqueo/inanición | `get()` en pool común desde tarea del pool común | `join` con cuidado, executor separado |
| Error perdido | Sin `exceptionally/handle` | Maneja en cadena |
| I/O bloquea pool común | `supplyAsync` sin executor | Pasa executor dedicado |

**Verificación rápida:** fuerza excepción en `pedidos()` y confirma “fallback”.


### Tema 3: Virtual threads · Intermedio · 40 min

**Caso guía**

Miles de tareas esperan I/O. Hilos de plataforma son costosos para bloquearse masivamente; virtual threads permiten un hilo por tarea con bajo overhead.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Virtual threads** | Hilos ligeros gestionados por la JVM (Java 21+, JEP 444) que se montan/desmontan de carrier threads. | Alta concurrencia I/O-bound con modelo simple por tarea. | Muchas tareas bloqueantes (HTTP, DB, archivos). | Usarlos para CPU-bound intensivo esperando magia. |
| **Hilos de plataforma** | Hilos tradicionales del SO, caros en memoria/context switch. | CPU-bound o pocos hilos largos. | Trabajo pesado CPU, pools acotados. | Crear miles para I/O. |
| **Carrier thread / pinning** | VT se ejecuta sobre carrier; `synchronized`/algunas llamadas nativas pueden pinning (en versiones antiguas; Java 24+ mejora). | Entender límites de escalado. | Código con bloqueos/monitores. | Pinning prolongado reduce escalabilidad. |
| **`Executors.newVirtualThreadPerTaskExecutor()`** | Executor que crea un VT por tarea. | Estilo executor con VTs. | Migrar código basado en executor. | Olvidar cerrar executor. |

**Contrato / invariantes / reglas.** VTs no hacen más rápida una tarea individual; mejoran throughput con muchas tareas bloqueantes. Evita pools fijos de VTs: crea por tarea. Usa semáforos para limitar recursos escasos. `ThreadLocal` pesado puede ser costoso con muchos VTs; considera Scoped Values.

**Modelo mental.** Hilo de plataforma = camión caro; virtual thread = bicicleta ligera: muchas pueden esperar sin consumir camiones.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-5 && cd ~/academia-java/modulo-5
```

`DemoVirtualThreads.java`:

```java
import java.util.concurrent.*;
import java.util.stream.IntStream;

public class DemoVirtualThreads {
    public static void main(String[] args) throws Exception {
        try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
            var futuros = IntStream.range(0, 10)
                .mapToObj(i -> ex.submit(() -> {
                    Thread.sleep(50);
                    return i + ":" + Thread.currentThread().isVirtual();
                })).toList();
            for (Future<String> f : futuros) System.out.println(f.get());
        }
    }
}
```

**Ejecución y salida real**

```bash
javac DemoVirtualThreads.java
java DemoVirtualThreads
```

```text
0:true
1:true
...
9:true
```

(orden puede variar).

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| No mejora | CPU-bound o pinning/contención | Mide; VTs para I/O |
| Agotas DB/conexiones | Demasiadas VTs pegando recurso | Limita con `Semaphore` |
| `ThreadLocal` pesado | Muchos VTs | Usa Scoped Values o cuidado con herencia |

**Verificación rápida:** confirma `isVirtual()==true` y que todas las tareas completan.


### Tema 4: Condiciones de carrera y sincronización · Avanzado · 45 min

**Caso guía**

Dos hilos incrementan un contador compartido 10.000 veces. Esperas 20.000; obtienes menos. No es magia: es una condición de carrera.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Condición de carrera** | Resultado depende del interleaving no controlado de hilos sobre estado compartido mutable. | Identificar bugs de concurrencia. | Al compartir estado entre hilos. | Asumir que `count++` es atómico. |
| **Sincronización (`synchronized`)** | Monitor/mutex intrínseco que garantiza exclusión mutua y visibilidad (happens-before). | Proteger sección crítica. | Estado compartido simple. | Sincronizar demasiado (contención/deadlock). |
| **`volatile`** | Garantiza visibilidad y ordenamiento de lecturas/escrituras de una variable, no atomicidad compuesta. | Flags de parada, estado simple. | Señales simples. | Usarlo para `count++` (no atómico). |
| **`AtomicInteger`/locks** | Operaciones atómicas CAS o locks explícitos (`ReentrantLock`). | Contadores/estado concurrente sin `synchronized` grande. | Contadores, acumuladores, estructuras concurrentes. | Elegir lock complejo cuando basta atómico. |

**Contrato / invariantes / reglas.** `count++` es leer-modificar-escribir: no atómico. `synchronized` establece happens-before al entrar/salir del mismo monitor. `volatile` no reemplaza exclusión mutua para operaciones compuestas. Prefiere inmutabilidad o confinamiento por hilo cuando sea posible.

**Modelo mental.** Dos personas editando la misma celda sin turno: gana el último guardado. Lock = turno; atómico = operación indivisible.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-5 && cd ~/academia-java/modulo-5
```

`DemoRace.java`:

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class DemoRace {
    static int unsafe = 0;
    static int safeSync = 0;
    static final AtomicInteger atomic = new AtomicInteger(0);
    static synchronized void incSync(){ safeSync++; }

    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(4);
        int tareas = 2, iter = 10000;
        CountDownLatch latch = new CountDownLatch(tareas);
        for (int t=0;t<tareas;t++) ex.submit(() -> {
            for (int i=0;i<iter;i++){ unsafe++; incSync(); atomic.incrementAndGet(); }
            latch.countDown();
        });
        latch.await();
        ex.shutdown();
        System.out.println("unsafe <= 20000: " + (unsafe <= 20000));
        System.out.println("sync: " + safeSync);
        System.out.println("atomic: " + atomic.get());
    }
}
```

**Ejecución y salida real**

```bash
javac DemoRace.java
java DemoRace
```

```text
unsafe <= 20000: true
sync: 20000
atomic: 20000
```

(`unsafe` normalmente < 20000; puede variar, pero casi nunca correcto).

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Conteo menor al esperado | Race condition | `synchronized`, `Atomic*`, o lock |
| Deadlock | Orden inconsistente de locks | Ordenar locks, evitar locks anidados |
| `volatile` no basta | Operación compuesta | Usa atómico/lock |

**Verificación rápida:** ejecuta varias veces; `sync` y `atomic` siempre 20000.


### Tema 5: Structured Concurrency (StructuredTaskScope, Java 25) · Avanzado · 45 min

**Caso guía**

Lanzas dos subtareas para armar una respuesta. Si una falla, quieres cancelar la otra y no dejar hilos huérfanos. Con `ExecutorService` ad-hoc es fácil fugar tareas.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Structured Concurrency** | Modelo donde subtareas tienen ciclo de vida ligado a un bloque léxico; entran y salen juntas. | Evitar tareas huérfanas, simplificar cancelación/errores. | Fan-out/fan-in concurrente. | Lanzar tareas sin scope y perder ownership. |
| **`StructuredTaskScope`** | API Java 25 (JEP 505) para fork/join estructurado. Se abre con `StructuredTaskScope.open(...)` y se cierra con try-with-resources. | Coordinar subtareas con política (Joiner). | Llamadas concurrentes dependientes. | Usar ejemplos de preview antiguos (`ShutdownOnFailure`). |
| **Cancelación por política (Joiner)** | `Joiner` define cuándo completar/cancelar: p.ej. `awaitAllSuccessfulOrThrow()`, `anySuccessfulResultOrThrow()`. | Fail-fast y liberación rápida. | Respuesta total o primer resultado válido. | No elegir joiner adecuado al caso. |
| **Join/resultado** | `scope.join()` espera según política; cada `Subtask` expone estado/resultado con `get()` cuando corresponde. | Punto único de recolección. | Antes de armar respuesta. | Leer `get()` antes de `join()`. |

**Contrato / invariantes / reglas.** Java 25 final usa `open` + `Joiner` (la API preview anterior cambió). El scope se cierra al salir del `try` y no deja subtareas huérfanas. Interrupción se propaga con `InterruptedException` en `join()`.

**Modelo mental.** Equipo de trabajo: abres sala (scope), asignas subtareas, una política decide cuándo cerrar, y no sales con tareas colgadas.

**Implementación desde cero (JDK 25+)**

```bash
mkdir -p ~/academia-java/modulo-5 && cd ~/academia-java/modulo-5
```

> **Nota de verificación**: Java 25 define la API final; en JDK 27 de esta máquina `StructuredTaskScope` sigue en preview, por eso la verificación usa `--enable-preview`.

`DemoStructured.java`:

```java
import java.util.concurrent.StructuredTaskScope;
import java.util.concurrent.StructuredTaskScope.Joiner;
import java.util.concurrent.StructuredTaskScope.Subtask;

public class DemoStructured {
    static String usuario() throws InterruptedException { Thread.sleep(100); return "Ada"; }
    static int pedidos() throws InterruptedException { Thread.sleep(120); return 3; }
    public static void main(String[] args) throws Exception {
        try (var scope = StructuredTaskScope.open(Joiner.<Object>awaitAllSuccessfulOrThrow())) {
            Subtask<String> u = scope.fork(DemoStructured::usuario);
            Subtask<Integer> p = scope.fork(DemoStructured::pedidos);
            scope.join();
            System.out.println(u.get() + " tiene " + p.get() + " pedidos");
        }
    }
}
```

**Ejecución y salida real**

```bash
javac --release 27 --enable-preview DemoStructured.java
java --enable-preview DemoStructured
```

```text
Ada tiene 3 pedidos
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| No compila `ShutdownOnFailure` | Usaste API preview antigua | Usa `open` + `Joiner` de Java 25 |
| Subtarea huérfana | No usaste scope estructurado | try-with-resources sobre scope |
| `get()` inválido | Leíste antes de `join()` o joiner no garantiza éxito | `join()` primero; usa joiner adecuado |

**Verificación rápida:** fuerza excepción en `pedidos()` y verifica que el scope falle por política fail-fast.


### Tema 6: Scoped Values frente a ThreadLocal (Java 25) · Avanzado · 45 min

**Caso guía**

Necesitas propagar `requestId` por el flujo de una request concurrente. `ThreadLocal` funciona, pero con virtual threads y herencia puede ser pesado y difícil de limpiar.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Scoped Values** | Valores inmutables vinculados a un ámbito léxico dinámico (Java 25, JEP 506). | Propagar contexto sin mutabilidad de ThreadLocal. | Contexto request/trace en tareas estructuradas. | Usar donde necesitas mutar valor en el mismo scope. |
| **ThreadLocal** | Variable cuyo valor es independiente por hilo. | Contexto por hilo en modelo tradicional. | Código legacy, hilos de plataforma controlados. | Fugas por no `remove()`, costo con muchos VTs. |
| **Inmutabilidad + scope** | El valor no cambia dentro del scope; se rebinde en scopes hijos. | Razonamiento simple y seguridad. | Datos de contexto read-only. | Intentar “setear” como ThreadLocal. |
| **Herencia en virtual threads** | ThreadLocal inheritable se copia; con muchos VTs puede ser costoso. Scoped values se diseñan para este modelo. | Escalar contexto con VTs. | Apps con alta concurrencia. | Asumir mismo comportamiento/costo que ThreadLocal. |

**Contrato / invariantes / reglas.** ScopedValue se lee con `get()` y se vincula con `where(...).run/call(...)`. Dentro del scope es inmutable. Requiere JDK 25+ (o preview en versiones previas). ThreadLocal requiere limpieza manual (`remove`) en pools.

**Modelo mental.** ThreadLocal = casillero mutable por hilo; ScopedValue = nota sellada visible mientras estás en una sala (scope).

**Implementación desde cero (JDK 25+)**

```bash
mkdir -p ~/academia-java/modulo-5 && cd ~/academia-java/modulo-5
```

> **Nota de verificación**: API final Java 25+. Verificada con JDK 27 en esta máquina sin flags preview.

`DemoScoped.java`:

```java
public class DemoScoped {
    static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();
    static void atender() { System.out.println("request=" + REQUEST_ID.get()); }
    public static void main(String[] args) {
        ScopedValue.where(REQUEST_ID, "req-123").run(() -> {
            atender();
            ScopedValue.where(REQUEST_ID, "req-child").run(DemoScoped::atender);
            atender();
        });
    }
}
```

**Ejecución y salida real (JDK 25+)**

```bash
javac DemoScoped.java
java DemoScoped
```

```text
request=req-123
request=req-child
request=req-123
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `NoSuchElementException`/no bound | Leíste fuera de scope | Vincula con `where(...).run(...)` |
| Esperabas mutación | ScopedValue es inmutable en scope | Crea scope hijo con nuevo valor |
| Fuga en ThreadLocal | No `remove()` en pool | Limpiar siempre o usar ScopedValue |

**Verificación rápida:** confirma que el valor externo vuelve a `req-123` tras el scope hijo.


### Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos · Avanzado · 45 min

**Caso guía**

Una tarea externa puede colgarse. Quieres timeout, cancelar cooperativamente y asegurar que archivos/conexiones se cierren.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Timeouts** | Límite máximo de espera para una operación. | Evitar bloqueos indefinidos. | I/O remota, tareas externas. | Timeout sin cancelar/limpiar recurso. |
| **Cancelación cooperativa** | La tarea observa interrupción/flag y termina limpiamente. | Detener trabajo sin corromper estado. | Loops largos, waits bloqueantes. | Atrapar `InterruptedException` y seguir como si nada. |
| **Interrupción** | Señal (`Thread.interrupt`) que ciertas operaciones bloqueantes respetan lanzando `InterruptedException`. | Mecanismo estándar de cancelación. | `sleep`, `wait`, `BlockingQueue`, etc. | Borrar estado de interrupción sin manejar. |
| **Liberación de recursos** | Cerrar recursos en `finally`/try-with-resources aunque haya timeout/cancelación. | Evitar fugas. | Archivos, sockets, DB. | Cancelar y dejar conexión abierta. |

**Contrato / invariantes / reglas.** `Future.cancel(true)` solicita interrupción, pero la tarea debe cooperar. Al capturar `InterruptedException`, restaura interrupción (`Thread.currentThread().interrupt()`) o termina limpiamente. Timeout + cancelación + cierre en `finally` forman la triada segura.

**Modelo mental.** Timeout = temporizador; cancelación cooperativa = pedirle al trabajador que pare en el próximo punto seguro; finally = recoger herramientas antes de salir.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-5 && cd ~/academia-java/modulo-5
```

`DemoTimeout.java`:

```java
import java.util.concurrent.*;

public class DemoTimeout {
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        Future<?> f = ex.submit(() -> {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    Thread.sleep(100); // punto bloqueante que observa interrupción
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt(); // restaura
                System.out.println("cancelada limpiamente");
            } finally {
                System.out.println("recursos liberados");
            }
        });
        try {
            f.get(200, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            System.out.println("timeout");
            f.cancel(true);
        } finally {
            ex.shutdown();
            ex.awaitTermination(2, TimeUnit.SECONDS);
        }
    }
}
```

**Ejecución y salida real**

```bash
javac DemoTimeout.java
java DemoTimeout
```

```text
timeout
cancelada limpiamente
recursos liberados
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Tarea no se detiene | Ignora interrupción | Chequear `isInterrupted` y manejar `InterruptedException` |
| Fuga de recurso | No hay `finally` | Cierra en finally/try-with-resources |
| Estado inconsistente | Cancelar a mitad sin cuidado | Puntos de cancelación seguros |

**Verificación rápida:** confirma que aparecen las 3 líneas incluso con timeout.


## Cierre del módulo

Concurrencia no es solo “hacer cosas en paralelo”: es coordinar tareas, proteger estado compartido y cerrar recursos bajo fallos y tiempos límite. En el siguiente módulo aplicarás esta base en I/O y NIO.2, donde el costo de esperar y manejar recursos es central.
