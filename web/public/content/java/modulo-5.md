# Módulo 5: Concurrencia — hilos y virtual threads

La concurrencia permite que un programa avance en varias tareas. Bien usada, mejora capacidad de respuesta y aprovechamiento; mal usada, produce condiciones de carrera, bloqueos y fugas. Este módulo parte del modelo clásico y avanza a virtual threads, structured concurrency y scoped values.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: ExecutorService y gestión de hilos · Intermedio · 40 min

Procesas varias tareas I/O-bound. Crear hilos sin límite desperdicia recursos; necesitas un pool gestionado y un apagado limpio.

#### ExecutorService

**Definición formal.** Interfaz de alto nivel para ejecutar tareas asíncronas (`submit`, `invokeAll`) y controlar su ciclo de vida (`shutdown`).

**Para qué sirve.** Separa el envío de tareas de la gestión de hilos.

**Cuándo usarlo y cuándo no.** Prefiérelo sobre `new Thread()` para tareas repetidas. No lo dejes sin cerrar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t1-exec && cd /tmp/java-m5-t1-exec
```

```java
import java.util.concurrent.*;
public class DemoExec {
    public static void main(String[] args) throws Exception {
        try (ExecutorService ex = Executors.newFixedThreadPool(2)) {
            System.out.println(ex.submit(() -> "ok").get());
        }
    }
}
```

**Caso de uso real.** Procesar pedidos en background con un pool acotado.

**Error común.** No cerrar el executor. Síntoma: la JVM no termina. Corrección: `try-with-resources` o `shutdown`+`awaitTermination`.

**Verificación (JDK 27, 2026-05-22).** Salida: `ok`.

#### Thread pools

**Definición formal.** Un pool es un conjunto de hilos trabajadores que reutilizan tareas de una cola. Ejemplos: `newFixedThreadPool`, `newCachedThreadPool`, `newSingleThreadExecutor`.

**Para qué sirve.** Amortiza la creación de hilos y limita concurrencia.

**Cuándo usarlo y cuándo no.** `fixed` para límite conocido; evita `cached` sin límite en cargas impredecibles. Dimensiona según recurso (CPU/I/O).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t1-pool && cd /tmp/java-m5-t1-pool
```

```java
import java.util.concurrent.*;
public class DemoPool {
    public static void main(String[] args) throws Exception {
        try (ExecutorService ex = Executors.newFixedThreadPool(2)) {
            System.out.println(ex.submit(() -> Thread.currentThread().getName()).get().startsWith("pool-"));
        }
    }
}
```

**Caso de uso real.** Pool fijo para llamadas a un servicio externo con límite de conexiones.

**Error común.** Pool enorme por defecto. Síntoma: contención o agotamiento de memoria. Corrección: medir y acotar.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### Gestión de hilos y shutdown

**Definición formal.** Gestión de hilos es controlar creación, reutilización, cola y ciclo de vida. `shutdown()` deja de aceptar tareas; `awaitTermination()` espera finalización; `shutdownNow()` intenta interrumpir.

**Para qué sirve.** Evita fugas de hilos y permite cierre ordenado.

**Cuándo usarlo y cuándo no.** Siempre en servicios/apps al terminar. No envíes tareas tras shutdown.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t1-shutdown && cd /tmp/java-m5-t1-shutdown
```

```java
import java.util.concurrent.*;
public class DemoShutdown {
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        ex.submit(() -> 1);
        ex.shutdown();
        System.out.println(ex.awaitTermination(1, TimeUnit.SECONDS));
    }
}
```

**Caso de uso real.** Apagado limpio de un worker en shutdown hook.

**Error común.** Olvidar `awaitTermination`. Síntoma: el proceso sale antes de terminar tareas. Corrección: esperar con timeout y manejar interrupción.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m5-t1 && cd /tmp/java-m5-t1
```

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
                futuros.add(executor.submit(() -> { Thread.sleep(20); return "tarea-" + id; }));
            }
            for (Future<String> f : futuros) System.out.println(f.get());
        } finally {
            executor.shutdown();
            executor.awaitTermination(5, TimeUnit.SECONDS);
        }
    }
}
```

#### Recorrido del código

`submit` envía tareas y devuelve `Future`. El pool fijo limita a 4 hilos. `finally` garantiza cierre. `get()` recupera resultados.

#### Ejecución y salida real

```bash
javac DemoExecutor.java
java DemoExecutor
```

```text
tarea-1
tarea-2
tarea-3
tarea-4
tarea-5
tarea-6
```

#### Errores frecuentes

No cerrar executor, dimensionar mal el pool, o bloquear `get()` sin timeout en sistemas sensibles.

#### Verificación

Confirmar que el proceso termina y que las 6 tareas completan.

### Tema 2: CompletableFuture · Intermedio · 40 min

Necesitas obtener usuario y pedidos en paralelo, combinarlos y manejar fallos sin bloquear innecesariamente.

#### CompletableFuture

**Definición formal.** `CompletableFuture<T>` es un `Future` que puede completarse manualmente y componer etapas asíncronas.

**Para qué sirve.** Orquestar pipelines async no bloqueantes: transformar, combinar, recuperar.

**Cuándo usarlo y cuándo no.** Úsalo para composición async. No lo conviertas en código bloqueante llamando `join/get` en cada paso.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t2-cf && cd /tmp/java-m5-t2-cf
```

```java
import java.util.concurrent.*;
public class DemoCF {
    public static void main(String[] args) {
        String r = CompletableFuture.supplyAsync(() -> "Ada").thenApply(String::toUpperCase).join();
        System.out.println(r);
    }
}
```

**Caso de uso real.** Enriquecer respuesta agregando datos de varios servicios.

**Error común.** Bloquear temprano con `get()`. Síntoma: pierde beneficios de composición. Corrección: encadenar y manejar en frontera.

**Verificación (JDK 27, 2026-05-22).** Salida: `ADA`.

#### `supplyAsync`, `thenApply`, `thenCombine`

**Definición formal.** `supplyAsync` crea una tarea async. `thenApply` transforma resultado. `thenCombine` combina dos futuros independientes.

**Para qué sirve.** Modela dependencias y fan-out/fan-in.

**Cuándo usarlo y cuándo no.** Úsalo cuando tareas son independientes o tienen dependencia clara. Para I/O bloqueante, pasa executor propio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t2-combine && cd /tmp/java-m5-t2-combine
```

```java
import java.util.concurrent.*;
public class DemoCombine {
    public static void main(String[] args) {
        var a = CompletableFuture.supplyAsync(() -> "Ada");
        var b = CompletableFuture.supplyAsync(() -> 3);
        System.out.println(a.thenCombine(b, (u,p) -> u + p).join());
    }
}
```

**Caso de uso real.** Consultar perfil y pedidos en paralelo y unir resultado.

**Error común.** Usar pool común para I/O bloqueante pesado. Síntoma: inanición. Corrección: executor dedicado.

**Verificación (JDK 27, 2026-05-22).** Salida: `Ada3`.

#### `exceptionally` y manejo de errores

**Definición formal.** `exceptionally`, `handle` y `whenComplete` permiten recuperar o observar fallos en la cadena.

**Para qué sirve.** Proporciona fallback controlado o transforma el error.

**Cuándo usarlo y cuándo no.** Úsalo en fronteras donde un fallback tenga sentido. No ocultes errores devolviendo datos incorrectos silenciosamente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t2-ex && cd /tmp/java-m5-t2-ex
```

```java
import java.util.concurrent.*;
public class DemoEx {
    public static void main(String[] args) {
        String r = CompletableFuture.<String>supplyAsync(() -> { throw new RuntimeException("x"); })
            .exceptionally(e -> "fallback").join();
        System.out.println(r);
    }
}
```

**Caso de uso real.** Si falla el servicio de recomendaciones, devolver lista vacía.

**Error común.** Tragar excepción sin log. Síntoma: fallos invisibles. Corrección: loguear/metricar y luego fallback.

**Verificación (JDK 27, 2026-05-22).** Salida: `fallback`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m5-t2 && cd /tmp/java-m5-t2
```

```java
import java.util.concurrent.*;
public class DemoCompletable {
    static CompletableFuture<String> usuario() { return CompletableFuture.supplyAsync(() -> "Ada"); }
    static CompletableFuture<Integer> pedidos() { return CompletableFuture.supplyAsync(() -> 3); }
    public static void main(String[] args) {
        String resumen = usuario().thenCombine(pedidos(), (u,p) -> u + " tiene " + p + " pedidos")
            .exceptionally(e -> "fallback").join();
        System.out.println(resumen);
    }
}
```

#### Recorrido del código

Dos tareas async se combinan con `thenCombine`. `exceptionally` define recuperación. `join()` se usa en la frontera del ejemplo.

#### Ejecución y salida real

```bash
javac DemoCompletable.java
java DemoCompletable
```

```text
Ada tiene 3 pedidos
```

#### Errores frecuentes

Bloquear el pool común, perder errores, o encadenar sin controlar executor.

#### Verificación

Forzar excepción en `pedidos()` y confirmar `fallback`.


### Tema 3: Virtual threads · Intermedio · 40 min

Miles de tareas esperan I/O. Los hilos de plataforma son costosos para bloquearse masivamente; los virtual threads permiten un modelo de “un hilo por tarea” con bajo overhead.

#### Virtual threads

**Definición formal.** Hilos ligeros gestionados por la JVM (Java 21+, JEP 444) que se montan/desmontan sobre carrier threads.

**Para qué sirve.** Alta concurrencia I/O-bound con código bloqueante de estilo simple.

**Cuándo usarlo y cuándo no.** Úsalo para muchas tareas bloqueantes (HTTP, BD, archivos). No esperes magia en CPU-bound intensivo; mide.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t3-vt && cd /tmp/java-m5-t3-vt
```

```java
import java.util.concurrent.*;
public class DemoVT {
    public static void main(String[] args) throws Exception {
        try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
            System.out.println(ex.submit(() -> Thread.currentThread().isVirtual()).get());
        }
    }
}
```

**Caso de uso real.** Servidor que atiende muchas peticiones con llamadas bloqueantes a BD.

**Error común.** Asumir que elimina todos los problemas de concurrencia. Síntoma: sigue habiendo race conditions o agotamiento de BD. Corrección: controlar concurrencia y recursos compartidos.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### Hilos de plataforma y carrier threads

**Definición formal.** Un hilo de plataforma es un hilo del SO. Un virtual thread se ejecuta sobre un carrier thread; cuando bloquea en operaciones soportadas, la JVM puede desmontarlo.

**Para qué sirve.** Entender por qué los VT escalan en I/O y dónde pueden tener límites (pinning en casos específicos, CPU-bound).

**Cuándo usarlo.** Hilos de plataforma para CPU-bound o pools acotados. VT para I/O masivo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t3-carrier && cd /tmp/java-m5-t3-carrier
```

```java
public class DemoCarrier {
    public static void main(String[] args) throws Exception {
        Thread vt = Thread.startVirtualThread(() -> {
            System.out.println(Thread.currentThread().isVirtual());
        });
        vt.join();
    }
}
```

**Caso de uso real.** Elegir VT para fan-out de llamadas HTTP.

**Error común.** Crear miles de hilos de plataforma para I/O. Síntoma: alto uso de memoria/context switch. Corrección: VT o pool acotado.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### `Executors.newVirtualThreadPerTaskExecutor()`

**Definición formal.** Executor que crea un virtual thread por tarea y lo cierra con try-with-resources.

**Para qué sirve.** Aplicar el modelo por tarea sin gestionar hilos manualmente.

**Cuándo usarlo y cuándo no.** Úsalo en tareas I/O-bound independientes. Limita concurrencia aguas abajo si el recurso externo tiene tope.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t3-executor && cd /tmp/java-m5-t3-executor
```

```java
import java.util.concurrent.*;
public class DemoVTExec {
    public static void main(String[] args) throws Exception {
        try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
            var f1 = ex.submit(() -> "A");
            var f2 = ex.submit(() -> "B");
            System.out.println(f1.get() + f2.get());
        }
    }
}
```

**Caso de uso real.** Ejecutar varias consultas externas y combinar resultados.

**Error común.** Lanzar miles de tareas que golpean una BD sin límite. Síntoma: saturación de BD. Corrección: semáforo/bulkhead o pool acotado.

**Verificación (JDK 27, 2026-05-22).** Salida: `AB`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m5-t3 && cd /tmp/java-m5-t3
```

```java
import java.util.concurrent.*;
import java.util.stream.*;
public class DemoVT {
    public static void main(String[] args) throws Exception {
        try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
            var futuros = IntStream.rangeClosed(1, 5)
                .mapToObj(i -> ex.submit(() -> {
                    Thread.sleep(20);
                    return "ok-" + i + ":" + Thread.currentThread().isVirtual();
                })).toList();
            for (var f : futuros) System.out.println(f.get());
        }
    }
}
```

#### Recorrido del código

Cada tarea se ejecuta en un virtual thread. `isVirtual()` confirma el tipo. El executor se cierra al salir del try-with-resources.

#### Ejecución y salida real

```bash
javac DemoVT.java
java DemoVT
```

```text
ok-1:true
ok-2:true
ok-3:true
ok-4:true
ok-5:true
```

#### Errores frecuentes

Usar VT para CPU-bound esperando mejora automática; saturar recursos externos; usar `ThreadLocal` pesado sin revisar semántica (ver Tema 6).

#### Verificación

Confirmar `true` en cada línea y el cierre limpio del proceso.

### Tema 4: Condiciones de carrera y sincronización · Avanzado · 45 min

Dos hilos incrementan el mismo contador. El resultado final a veces es 2000, a veces menos. No es magia: es una race condition.

#### Condición de carrera

**Definición formal.** Ocurre cuando el resultado depende del orden no controlado de acceso concurrente a estado compartido mutable.

**Para qué sirve entenderlo.** Permite identificar por qué datos se corrompen intermitentemente bajo concurrencia.

**Cuándo aparece.** Lectura/escritura compartida sin coordinación suficiente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t4-race && cd /tmp/java-m5-t4-race
```

```java
import java.util.concurrent.*;
public class DemoRace {
    static int c = 0;
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(2);
        for (int i = 0; i < 1000; i++) ex.submit(() -> c++);
        ex.shutdown();
        ex.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println(c <= 1000);
        System.out.println(c > 0);
    }
}
```

**Caso de uso real.** Contadores de inventario, saldo, o métricas actualizados sin sincronización.

**Error común.** “Funciona en mi máquina”. Síntoma: bug intermitente en producción. Corrección: proteger estado compartido.

**Verificación (JDK 27, 2026-05-22).** La salida observada puede variar; lo importante es que `c` no es confiablemente 1000. La propiedad segura verificada aquí es:

```text
true
true
```

#### Sincronización

**Definición formal.** Mecanismo para coordinar acceso a estado compartido. `synchronized` provee exclusión mutua y visibilidad de memoria.

**Para qué sirve.** Garantiza que secciones críticas no se ejecuten simultáneamente de forma insegura.

**Cuándo usarlo y cuándo no.** Úsalo en secciones críticas pequeñas. No protejas bloques grandes innecesariamente; reduce escalabilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t4-sync && cd /tmp/java-m5-t4-sync
```

```java
import java.util.concurrent.*;
public class DemoSync {
    static int c = 0;
    static synchronized void inc() { c++; }
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(2);
        for (int i = 0; i < 1000; i++) ex.submit(DemoSync::inc);
        ex.shutdown();
        ex.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println(c);
    }
}
```

**Caso de uso real.** Actualizar un caché compartido simple.

**Error común.** Sincronizar en objetos distintos. Síntoma: no hay exclusión real. Corrección: mismo monitor para el mismo estado.

**Verificación (JDK 27, 2026-05-22).** Salida: `1000`.

#### `AtomicInteger` y clases atómicas

**Definición formal.** Tipos de `java.util.concurrent.atomic` que realizan operaciones atómicas (CAS) sin bloqueo explícito para casos simples.

**Para qué sirve.** Contadores, flags y actualizaciones simples con buen rendimiento.

**Cuándo usarlo y cuándo no.** Úsalo para operaciones atómicas individuales. No sirve para invariantes que involucran múltiples variables sin coordinación adicional.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t4-atomic && cd /tmp/java-m5-t4-atomic
```

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
public class DemoAtomic {
    public static void main(String[] args) throws Exception {
        AtomicInteger c = new AtomicInteger();
        ExecutorService ex = Executors.newFixedThreadPool(2);
        for (int i = 0; i < 1000; i++) ex.submit(c::incrementAndGet);
        ex.shutdown();
        ex.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println(c.get());
    }
}
```

**Caso de uso real.** Métricas de requests en memoria.

**Error común.** Usar dos atómicos y asumir consistencia conjunta. Síntoma: invariante roto. Corrección: lock o diseño inmutable/atómico compuesto.

**Verificación (JDK 27, 2026-05-22).** Salida: `1000`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m5-t4 && cd /tmp/java-m5-t4
```

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
public class DemoRace {
    static int inseguro = 0;
    static AtomicInteger seguro = new AtomicInteger(0);
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(4);
        for (int i = 0; i < 1000; i++) ex.submit(() -> { inseguro++; seguro.incrementAndGet(); });
        ex.shutdown();
        ex.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("seguro=" + seguro.get());
        System.out.println("inseguro<=1000=" + (inseguro <= 1000));
    }
}
```

#### Recorrido del código

`inseguro++` no es atómico. `AtomicInteger.incrementAndGet()` sí lo es. El ejemplo muestra contraste: el atómico termina en 1000; el inseguro puede perder incrementos.

#### Ejecución y salida real

```bash
javac DemoRace.java
java DemoRace
```

```text
seguro=1000
inseguro<=1000=true
```

(El valor de `inseguro` puede variar entre ejecuciones; la propiedad verificada es que no es confiable para ser exactamente 1000 bajo carrera).

#### Errores frecuentes

Compartir estado mutable sin protección, sincronizar sobre el objeto equivocado, o usar atómicos para invariantes multi-campo.

#### Verificación

Ejecutar varias veces; `seguro` siempre debe ser 1000.


### Tema 5: Structured Concurrency (StructuredTaskScope, Java 25) · Avanzado · 45 min

Lanzas dos tareas concurrentes: una falla. Sin estructura, la otra puede quedar huérfana consumiendo recursos. Structured concurrency da un ámbito donde las subtareas nacen y terminan juntas.

#### Structured Concurrency

**Definición formal.** Modelo donde tareas concurrentes relacionadas se gestionan como una unidad en un scope con vida léxica. En Java, `StructuredTaskScope` (API en evolución/preview según versión) permite fork/join con política clara.

**Para qué sirve.** Evita tareas huérfanas, simplifica cancelación y hace visible la relación entre subtareas.

**Cuándo usarlo y cuándo no.** Úsalo cuando varias subtareas concurren para producir un resultado. No lo uses para tareas de fondo sin dueño léxico claro.

**Ejemplo mínimo enfocado (ejecutable, JDK 27 preview).**

```bash
mkdir -p /tmp/java-m5-t5-sts && cd /tmp/java-m5-t5-sts
```

```java
import java.util.concurrent.StructuredTaskScope;
public class DemoSTS {
    public static void main(String[] args) throws Exception {
        try (var scope = StructuredTaskScope.open()) {
            var a = scope.fork(() -> "A");
            var b = scope.fork(() -> "B");
            scope.join();
            System.out.println(a.get() + b.get());
        }
    }
}
```

**Caso de uso real.** Consultar usuario y pedidos en paralelo; si uno falla, cancelar el otro.

**Error común.** Usar hilos “sueltos” sin dueño. Síntoma: fugas y cancelaciones inconsistentes. Corrección: scope estructurado.

**Verificación (JDK 27, 2026-05-22, preview).**

```bash
javac --enable-preview --release 27 DemoSTS.java
java --enable-preview -cp . DemoSTS
```

```text
AB
```

**Nota de verificación.** `StructuredTaskScope` es API preview en JDK 27; requiere `--enable-preview`. La API puede cambiar en versiones futuras.

#### `fork` y `join`

**Definición formal.** `fork` inicia una subtarea dentro del scope; `join` espera según la política del scope hasta completar o fallar.

**Para qué sirve.** Coordina subtareas con un punto de espera explícito.

**Cuándo usarlo.** Siempre que uses `StructuredTaskScope`: fork subtareas, join, luego lee resultados.

**Ejemplo mínimo enfocado (ejecutable, JDK 27 preview).**

```bash
mkdir -p /tmp/java-m5-t5-join && cd /tmp/java-m5-t5-join
```

```java
import java.util.concurrent.StructuredTaskScope;
public class DemoJoin {
    public static void main(String[] args) throws Exception {
        try (var scope = StructuredTaskScope.open()) {
            var x = scope.fork(() -> 2 * 21);
            scope.join();
            System.out.println(x.get());
        }
    }
}
```

**Caso de uso real.** Agregar resultados parciales en paralelo.

**Error común.** Leer `get()` sin `join()`. Síntoma: resultado no disponible o uso incorrecto del contrato. Corrección: seguir el ciclo fork/join/get.

**Verificación (JDK 27, 2026-05-22, preview).** Salida: `42`.

#### Cancelación y propagación de fallos

**Definición formal.** En structured concurrency, la política del scope determina cómo un fallo/cancelación afecta a las demás subtareas.

**Para qué sirve.** Evita trabajo inútil cuando el resultado ya no es necesario.

**Cuándo usarlo.** En fan-out donde una falla invalida la respuesta completa.

**Ejemplo mínimo enfocado (ejecutable, JDK 27 preview).**

```bash
mkdir -p /tmp/java-m5-t5-fail && cd /tmp/java-m5-t5-fail
```

```java
import java.util.concurrent.StructuredTaskScope;
public class DemoFail {
    public static void main(String[] args) {
        try (var scope = StructuredTaskScope.open()) {
            scope.fork(() -> { throw new RuntimeException("boom"); });
            scope.fork(() -> "ok");
            scope.join();
        } catch (Exception e) {
            System.out.println("error");
        }
    }
}
```

**Caso de uso real.** Si falla la consulta de inventario, abortar la composición de respuesta.

**Error común.** Ignorar políticas de fallo y asumir comportamiento. Síntoma: subtareas sobrevivientes. Corrección: usar política/scope apropiado y probar fallos.

**Verificación (JDK 27, 2026-05-22, preview).** Salida: `error`.

#### Ejemplo integrado desde cero

Usa el ejemplo de `fork/join` con dos subtareas y verifica salida `AB`. El punto clave: el scope cierra y no deja subtareas huérfanas.

#### Errores frecuentes

No usar `--enable-preview` cuando corresponde; no cerrar el scope; no manejar fallos de subtareas.

#### Verificación

Compilar y ejecutar con `--enable-preview --release 27`. Confirmar `AB`.

### Tema 6: Scoped Values frente a ThreadLocal (Java 25) · Avanzado · 45 min

Necesitas pasar un `requestId` a varios métodos llamados desde la misma tarea, incluso en hilos hijos. `ThreadLocal` funciona, pero con virtual threads y tareas estructuradas puede ser difícil de limpiar y razonar.

#### Scoped Values

**Definición formal.** `ScopedValue` permite enlazar un valor inmutable a un ámbito de ejecución; el valor es visible dentro de ese scope y se restablece al salir.

**Para qué sirve.** Propagar contexto (request id, usuario, locale) de forma segura y acotada.

**Cuándo usarlo y cuándo no.** Úsalo para contexto de lectura dentro de un scope. No lo uses como estado mutable compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t6-sv && cd /tmp/java-m5-t6-sv
```

```java
public class DemoSV {
    static final ScopedValue<String> REQ = ScopedValue.newInstance();
    public static void main(String[] args) {
        ScopedValue.where(REQ, "req-1").run(() -> System.out.println(REQ.get()));
    }
}
```

**Caso de uso real.** Propagar trace/request id en logs.

**Error común.** Intentar mutar el contexto como si fuera variable global. Corrección: crear otro binding por scope.

**Verificación (JDK 27, 2026-05-22).** Salida: `req-1`.

#### `ThreadLocal`

**Definición formal.** Variable cuyo valor es independiente por hilo. Requiere `set/remove` disciplinado.

**Para qué sirve.** Contexto por hilo en modelos clásicos.

**Cuándo usarlo y cuándo no.** Úsalo con cuidado en código legado. Evítalo si puedes usar scoped values; especialmente con pools/VT, olvidar `remove` provoca fugas o contaminación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t6-tl && cd /tmp/java-m5-t6-tl
```

```java
public class DemoTL {
    static final ThreadLocal<String> TL = new ThreadLocal<>();
    public static void main(String[] args) {
        TL.set("req-1");
        try { System.out.println(TL.get()); }
        finally { TL.remove(); }
    }
}
```

**Caso de uso real.** Código legado de servidor con filtros por hilo.

**Error común.** No llamar `remove()`. Síntoma: fuga de contexto entre requests en pool. Corrección: `finally { remove(); }` o migrar a `ScopedValue`.

**Verificación (JDK 27, 2026-05-22).** Salida: `req-1`.

#### Comparación de ámbito y ciclo de vida

**Definición formal.** `ScopedValue` tiene ámbito léxico y no requiere limpieza manual; `ThreadLocal` tiene ciclo ligado al hilo y limpieza manual.

**Para qué sirve.** Elegir el mecanismo correcto de propagación de contexto.

**Cuándo usarlo.** Preferir `ScopedValue` en código moderno estructurado; `ThreadLocal` solo cuando sea necesario por compatibilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t6-cmp && cd /tmp/java-m5-t6-cmp
```

```java
public class DemoCmp {
    static final ScopedValue<String> SV = ScopedValue.newInstance();
    public static void main(String[] args) {
        ScopedValue.where(SV, "A").run(() -> System.out.println(SV.get()));
        System.out.println(SV.isBound());
    }
}
```

**Caso de uso real.** Evitar contaminación de contexto entre requests.

**Error común.** Asumir que `ThreadLocal` se limpia solo. Corrección: limpieza explícita o scoped value.

**Verificación (JDK 27, 2026-05-22).** Salida: `A` y `false`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m5-t6 && cd /tmp/java-m5-t6
```

```java
public class DemoScoped {
    static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();
    static void log(String msg) { System.out.println(REQUEST_ID.orElse("none") + ":" + msg); }
    public static void main(String[] args) {
        ScopedValue.where(REQUEST_ID, "req-1").run(() -> log("inicio"));
        log("fuera");
    }
}
```

#### Recorrido del código

`where(...).run(...)` enlaza el valor solo dentro del scope. Fuera, `orElse("none")` muestra que no hay binding.

#### Ejecución y salida real

```bash
javac DemoScoped.java
java DemoScoped
```

```text
req-1:inicio
none:fuera
```

#### Errores frecuentes

Usar `ThreadLocal` sin `remove`; usar scoped value como mutable global.

#### Verificación

Confirmar que fuera del scope el valor no está ligado.

### Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos · Avanzado · 45 min

Una tarea externa tarda demasiado. Cancelarla no basta si no libera recursos o no respeta interrupción.

#### Timeout

**Definición formal.** Límite máximo de espera para una operación. En `Future.get(timeout, unit)` lanza `TimeoutException` si excede.

**Para qué sirve.** Evita bloqueos indefinidos y protege latencia/saturación.

**Cuándo usarlo.** En toda llamada externa o tarea con SLA.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t7-timeout && cd /tmp/java-m5-t7-timeout
```

```java
import java.util.concurrent.*;
public class DemoTimeout {
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        Future<?> f = ex.submit(() -> { try { Thread.sleep(500); } catch (InterruptedException e) {} });
        try { f.get(50, TimeUnit.MILLISECONDS); }
        catch (TimeoutException e) { System.out.println("timeout"); }
        finally { f.cancel(true); ex.shutdownNow(); }
    }
}
```

**Caso de uso real.** Timeout a llamada HTTP/BD.

**Error común.** Capturar timeout y seguir esperando igual. Corrección: cancelar, manejar y liberar recursos.

**Verificación (JDK 27, 2026-05-22).** Salida: `timeout`.

#### Cancelación cooperativa e interrupción

**Definición formal.** Cancelar con `cancel(true)` solicita interrupción; la tarea debe observar `Thread.interrupted()` o manejar `InterruptedException` y terminar limpiamente.

**Para qué sirve.** Permite detener trabajo sin corromper estado ni dejar recursos abiertos.

**Cuándo usarlo.** En tareas largas o bloqueables.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t7-cancel && cd /tmp/java-m5-t7-cancel
```

```java
import java.util.concurrent.*;
public class DemoCancel {
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        Future<?> f = ex.submit(() -> {
            while (!Thread.currentThread().isInterrupted()) {}
            System.out.println("interrumpido");
        });
        Thread.sleep(20);
        f.cancel(true);
        ex.shutdown();
        ex.awaitTermination(1, TimeUnit.SECONDS);
    }
}
```

**Caso de uso real.** Worker que revisa cancelación entre iteraciones.

**Error común.** Tragar `InterruptedException` y seguir. Síntoma: tarea no cancelable. Corrección: restaurar interrupción o salir limpiamente.

**Verificación (JDK 27, 2026-05-22).** Salida: `interrumpido`.

#### No abandonar recursos

**Definición formal.** Al cancelar/expirar, la tarea debe cerrar recursos (`AutoCloseable`) y dejar estado consistente.

**Para qué sirve.** Evita leaks de sockets, archivos, conexiones o locks.

**Cuándo usarlo.** Siempre que el trabajo use recursos externos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m5-t7-resource && cd /tmp/java-m5-t7-resource
```

```java
public class DemoResource {
    static class R implements AutoCloseable { public void close(){ System.out.println("cerrado"); } }
    public static void main(String[] args) {
        try (R r = new R()) { System.out.println("uso"); }
    }
}
```

**Caso de uso real.** Cancelar importación y cerrar archivo/conexión.

**Error común.** Interrumpir pero dejar archivo abierto. Síntoma: leak. Corrección: try-with-resources y manejo de interrupción.

**Verificación (JDK 27, 2026-05-22).** Salida: `uso` y `cerrado`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m5-t7 && cd /tmp/java-m5-t7
```

```java
import java.util.concurrent.*;
public class DemoTimeout {
    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        Future<String> f = ex.submit(() -> { Thread.sleep(500); return "ok"; });
        try {
            System.out.println(f.get(50, TimeUnit.MILLISECONDS));
        } catch (TimeoutException e) {
            System.out.println("timeout");
            f.cancel(true);
        } finally {
            ex.shutdown();
            ex.awaitTermination(1, TimeUnit.SECONDS);
        }
    }
}
```

#### Recorrido del código

`get` con timeout limita espera. Al expirar, se cancela con interrupción y se cierra el executor.

#### Ejecución y salida real

```bash
javac DemoTimeout.java
java DemoTimeout
```

```text
timeout
```

#### Errores frecuentes

No cancelar tras timeout; tragar interrupción; no cerrar executor/recursos.

#### Verificación

Confirmar `timeout` y terminación limpia del proceso.

## Cierre del módulo

La concurrencia moderna en Java combina control de pools, composición async, virtual threads, estructuras seguras y cancelación con limpieza. El criterio es: proteger estado compartido, acotar recursos, estructurar subtareas y nunca abandonar recursos ante timeout/cancelación.
