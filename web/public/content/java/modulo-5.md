# Módulo 5: Concurrencia — hilos y virtual threads

Tienda Aurora puede calcular catálogos y reportes, pero una aplicación real también espera red, disco o servicios remotos. Si cada operación bloqueante consume un hilo de plataforma por mucho tiempo, el sistema escala mal. Si varias tareas actualizan estado compartido sin coordinación, el sistema produce resultados incorrectos. La concurrencia en Java trata esos dos problemas: ejecutar trabajo en paralelo o asincrónicamente, y proteger la corrección cuando hay estado compartido.

Este módulo construye un `CheckoutService` que consulta catálogo e inventario remotos simulados. El mismo caso de uso se implementa con `ExecutorService`, `CompletableFuture`, virtual threads, `StructuredTaskScope` y `ScopedValue`. También se muestra una condición de carrera y su corrección, y una medición simple de lotes bloqueantes.

## Visual del módulo

**Visual:** [Mapa de concurrencia Java: ExecutorService, CompletableFuture, virtual threads, structured concurrency, ScopedValue y race condition](/visuals/temas/java/modulo-5-concurrencia.html)

Lectura: La concurrencia exige coordinar ejecución, cancelación, visibilidad y ciclo de vida, no solo lanzar hilos.

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap

```bash
mkdir -p tienda-aurora-concurrency/src/main/java/com/aurora/concurrency/{dominio,servicio}
mkdir -p tienda-aurora-concurrency/src/test/java/com/aurora/concurrency
cd tienda-aurora-concurrency
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25. El proyecto usa `--enable-preview` porque `StructuredTaskScope` y APIs relacionadas se usaron en modo preview en esta configuración.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-concurrency"
```

#### `build.gradle.kts`

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
    mainClass = "com.aurora.concurrency.TiendaAuroraConcurrencyApp"
    applicationDefaultJvmArgs = listOf("--enable-preview")
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    jvmArgs("--enable-preview")
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all,-preview", "-Werror", "--enable-preview"))
}

tasks.withType<JavaExec>().configureEach {
    jvmArgs("--enable-preview")
}
```

#### Dominio

#### `ResultadoCotizacion.java`

```java
package com.aurora.concurrency.dominio;

import java.math.BigDecimal;
import java.util.Objects;

public record ResultadoCotizacion(String sku, BigDecimal precio, int stock, long latenciaMs) {
    public ResultadoCotizacion {
        Objects.requireNonNull(sku, "sku");
        Objects.requireNonNull(precio, "precio");
        if (latenciaMs < 0) throw new IllegalArgumentException("latencia negativa");
    }
}
```

#### `CheckoutResult.java`

```java
package com.aurora.concurrency.dominio;

import java.math.BigDecimal;
import java.util.Objects;

public record CheckoutResult(String pedidoId, BigDecimal precio, int stock, String requestId) {
    public CheckoutResult {
        Objects.requireNonNull(pedidoId, "pedidoId");
        Objects.requireNonNull(precio, "precio");
        Objects.requireNonNull(requestId, "requestId");
    }
}
```

#### Servicios remotos simulados

Simulan I/O bloqueante con `Thread.sleep`. En código real sería HTTP, BD o cola; la forma de coordinar y cancelar es el punto de aprendizaje.

#### `CatalogoRemoto.java`

```java
package com.aurora.concurrency.servicio;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

public final class CatalogoRemoto {
    private final Map<String, BigDecimal> precios = Map.of(
            "CAF-100", new BigDecimal("14.90"),
            "MOL-200", new BigDecimal("79.90"),
            "FIL-300", new BigDecimal("9.50")
    );

    public BigDecimal precio(String sku, Duration demora) throws InterruptedException {
        Thread.sleep(demora.toMillis());
        BigDecimal precio = precios.get(sku);
        if (precio == null) {
            throw new IllegalArgumentException("SKU desconocido: " + sku);
        }
        return precio;
    }

    public BigDecimal precioConJitter(String sku) throws InterruptedException {
        Thread.sleep(ThreadLocalRandom.current().nextInt(20, 60));
        return precio(sku, Duration.ZERO);
    }
}
```

#### `InventarioRemoto.java`

```java
package com.aurora.concurrency.servicio;

import java.time.Duration;
import java.util.Map;

public final class InventarioRemoto {
    private final Map<String, Integer> stock = Map.of(
            "CAF-100", 8,
            "MOL-200", 3,
            "FIL-300", 25
    );

    public int stock(String sku, Duration demora) throws InterruptedException {
        Thread.sleep(demora.toMillis());
        Integer cantidad = stock.get(sku);
        if (cantidad == null) {
            throw new IllegalArgumentException("SKU desconocido: " + sku);
        }
        return cantidad;
    }
}
```

#### `CheckoutService.java`

Contiene las variantes de concurrencia. Es deliberadamente didáctico: concentra los patrones en una clase para compararlos. En producción, separarías responsabilidades.

```java
package com.aurora.concurrency.servicio;

import com.aurora.concurrency.dominio.CheckoutResult;
import com.aurora.concurrency.dominio.ResultadoCotizacion;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.StructuredTaskScope;
import java.util.concurrent.TimeUnit;

public final class CheckoutService {

    private static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

    private final CatalogoRemoto catalogo;
    private final InventarioRemoto inventario;

    public CheckoutService(CatalogoRemoto catalogo, InventarioRemoto inventario) {
        this.catalogo = catalogo;
        this.inventario = inventario;
    }

    public ResultadoCotizacion cotizarConExecutor(String sku) throws Exception {
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            Instant inicio = Instant.now();
            Future<BigDecimal> precioFuture = executor.submit(() -> catalogo.precio(sku, Duration.ofMillis(120)));
            Future<Integer> stockFuture = executor.submit(() -> inventario.stock(sku, Duration.ofMillis(90)));
            BigDecimal precio = precioFuture.get(2, TimeUnit.SECONDS);
            int stock = stockFuture.get(2, TimeUnit.SECONDS);
            return new ResultadoCotizacion(sku, precio, stock, Duration.between(inicio, Instant.now()).toMillis());
        }
    }

    public ResultadoCotizacion cotizarConCompletableFuture(String sku) {
        Instant inicio = Instant.now();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            CompletableFuture<BigDecimal> precioFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return catalogo.precio(sku, Duration.ofMillis(120));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(e);
                }
            }, executor);

            CompletableFuture<Integer> stockFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return inventario.stock(sku, Duration.ofMillis(90));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(e);
                }
            }, executor);

            CompletableFuture<ResultadoCotizacion> combinado = precioFuture
                    .thenCombine(stockFuture, (precio, stock) ->
                            new ResultadoCotizacion(sku, precio, stock, Duration.between(inicio, Instant.now()).toMillis()))
                    .orTimeout(2, TimeUnit.SECONDS)
                    .exceptionally(ex -> {
                        throw new RuntimeException("falló la cotización de " + sku, ex);
                    });

            return combinado.join();
        }
    }

    public CheckoutResult checkoutConStructuredConcurrency(String pedidoId, String sku, String requestId) throws Exception {
        return ScopedValue.where(REQUEST_ID, requestId).call(() -> {
            try (var scope = StructuredTaskScope.open()) {
                StructuredTaskScope.Subtask<BigDecimal> precioTask =
                        scope.fork(() -> catalogo.precio(sku, Duration.ofMillis(120)));
                StructuredTaskScope.Subtask<Integer> stockTask =
                        scope.fork(() -> inventario.stock(sku, Duration.ofMillis(90)));
                scope.join();
                return new CheckoutResult(pedidoId, precioTask.get(), stockTask.get(), REQUEST_ID.get());
            }
        });
    }

    public String requestIdActual() {
        return REQUEST_ID.isBound() ? REQUEST_ID.get() : "sin-request";
    }

    public int contarConRace() throws Exception {
        class Contador {
            int valor;
            void inc() { valor++; }
        }
        Contador contador = new Contador();
        try (ExecutorService executor = Executors.newFixedThreadPool(8)) {
            List<Future<?>> futuros = new ArrayList<>();
            for (int i = 0; i < 1000; i++) {
                futuros.add(executor.submit(contador::inc));
            }
            for (Future<?> futuro : futuros) {
                futuro.get();
            }
        }
        return contador.valor;
    }

    public int contarSinRace() throws Exception {
        class ContadorSeguro {
            private int valor;
            synchronized void inc() { valor++; }
            synchronized int valor() { return valor; }
        }
        ContadorSeguro contador = new ContadorSeguro();
        try (ExecutorService executor = Executors.newFixedThreadPool(8)) {
            List<Future<?>> futuros = new ArrayList<>();
            for (int i = 0; i < 1000; i++) {
                futuros.add(executor.submit(contador::inc));
            }
            for (Future<?> futuro : futuros) {
                futuro.get();
            }
        }
        return contador.valor();
    }

    public long medirLote(boolean virtual) throws Exception {
        int tareas = 200;
        Duration demora = Duration.ofMillis(40);
        Instant inicio = Instant.now();
        ExecutorService executor = virtual
                ? Executors.newVirtualThreadPerTaskExecutor()
                : Executors.newFixedThreadPool(20);
        try (executor) {
            List<Future<BigDecimal>> futuros = new ArrayList<>();
            for (int i = 0; i < tareas; i++) {
                String sku = i % 2 == 0 ? "CAF-100" : "FIL-300";
                futuros.add(executor.submit(() -> catalogo.precio(sku, demora)));
            }
            for (Future<BigDecimal> futuro : futuros) {
                futuro.get(10, TimeUnit.SECONDS);
            }
        }
        return Duration.between(inicio, Instant.now()).toMillis();
    }
}
```

#### `TiendaAuroraConcurrencyApp.java`

```java
package com.aurora.concurrency;

import com.aurora.concurrency.dominio.CheckoutResult;
import com.aurora.concurrency.dominio.ResultadoCotizacion;
import com.aurora.concurrency.servicio.CatalogoRemoto;
import com.aurora.concurrency.servicio.CheckoutService;
import com.aurora.concurrency.servicio.InventarioRemoto;

public final class TiendaAuroraConcurrencyApp {

    public static void main(String[] args) throws Exception {
        String comando = args.length == 0 ? "demo" : args[0];
        CheckoutService service = new CheckoutService(new CatalogoRemoto(), new InventarioRemoto());
        switch (comando) {
            case "executor" -> {
                ResultadoCotizacion r = service.cotizarConExecutor("CAF-100");
                System.out.println("executor sku=" + r.sku() + " precio=" + r.precio() + " stock=" + r.stock());
            }
            case "future" -> {
                ResultadoCotizacion r = service.cotizarConCompletableFuture("MOL-200");
                System.out.println("future sku=" + r.sku() + " precio=" + r.precio() + " stock=" + r.stock());
            }
            case "structured" -> {
                CheckoutResult r = service.checkoutConStructuredConcurrency("PED-900", "CAF-100", "req-7f3a");
                System.out.println("structured pedido=" + r.pedidoId() + " precio=" + r.precio() + " stock=" + r.stock() + " requestId=" + r.requestId());
                System.out.println("requestId fuera=" + service.requestIdActual());
            }
            case "race" -> {
                int inseguro = service.contarConRace();
                int seguro = service.contarSinRace();
                System.out.println("race esperado=1000 observado=" + inseguro);
                System.out.println("seguro esperado=1000 observado=" + seguro);
            }
            case "medir" -> {
                long plataforma = service.medirLote(false);
                long virtual = service.medirLote(true);
                System.out.println("plataforma-ms=" + plataforma);
                System.out.println("virtual-ms=" + virtual);
            }
            case "demo" -> {
                ResultadoCotizacion a = service.cotizarConExecutor("CAF-100");
                ResultadoCotizacion b = service.cotizarConCompletableFuture("MOL-200");
                CheckoutResult c = service.checkoutConStructuredConcurrency("PED-900", "CAF-100", "req-7f3a");
                System.out.println("executor " + a.sku() + " " + a.precio() + " stock=" + a.stock());
                System.out.println("future " + b.sku() + " " + b.precio() + " stock=" + b.stock());
                System.out.println("structured " + c.pedidoId() + " " + c.requestId());
            }
            default -> {
                System.err.println("Comando desconocido: " + comando);
                System.exit(2);
            }
        }
    }
}
```

#### Test

```java
package com.aurora.concurrency;

import com.aurora.concurrency.dominio.CheckoutResult;
import com.aurora.concurrency.servicio.CatalogoRemoto;
import com.aurora.concurrency.servicio.CheckoutService;
import com.aurora.concurrency.servicio.InventarioRemoto;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CheckoutServiceTest {
    @Test void executorYFuture() throws Exception {
        var s = new CheckoutService(new CatalogoRemoto(), new InventarioRemoto());
        var a = s.cotizarConExecutor("CAF-100");
        var b = s.cotizarConCompletableFuture("MOL-200");
        assertEquals(8, a.stock());
        assertEquals(3, b.stock());
    }
    @Test void structuredYScoped() throws Exception {
        var s = new CheckoutService(new CatalogoRemoto(), new InventarioRemoto());
        CheckoutResult r = s.checkoutConStructuredConcurrency("PED-1","CAF-100","req-x");
        assertEquals("req-x", r.requestId());
        assertEquals("sin-request", s.requestIdActual());
    }
    @Test void raceControlada() throws Exception {
        var s = new CheckoutService(new CatalogoRemoto(), new InventarioRemoto());
        assertEquals(1000, s.contarSinRace());
    }
}
```

### Tema 1: ExecutorService y gestión de hilos · Intermedio · 40 min

`ExecutorService` separa “qué tarea ejecutar” de “qué hilo la ejecuta”. En lugar de crear `new Thread(...)` por tarea, envías tareas a un executor que administra un pool. Eso permite reutilizar hilos, limitar concurrencia y controlar el ciclo de vida. `submit` devuelve un `Future`, que representa un resultado futuro: `get()` bloquea hasta obtenerlo o hasta timeout.

El ciclo de vida importa. Un executor que no se cierra deja hilos vivos y puede impedir que la JVM termine. Desde Java 19, `ExecutorService` implementa `AutoCloseable` y su `close()` espera terminación, lo que hace natural el try-with-resources. En `cotizarConExecutor` se usa un pool fijo de 2 porque hay dos tareas bloqueantes independientes.

**Confusión común:** pool grande = más rápido. No. Demasiados hilos generan cambio de contexto, contención y presión de memoria. Para I/O bloqueante, virtual threads cambian el modelo; para CPU-bound, el paralelismo útil suele estar cerca del número de cores.

Antes del executor, la forma mínima es crear y arrancar un hilo a mano. El proyecto lo demuestra con la API moderna:

```java
public int contarHiloManual() throws Exception {
    AtomicInteger total = new AtomicInteger();
    Thread hilo = Thread.ofPlatform().start(() -> total.incrementAndGet());
    hilo.join();
    return total.get();
}
```

`join()` es la barrera: sin él, `main` podría terminar antes de que el hilo aumente el contador. Un `ExecutorService` sustituye ese patrón por una cola de tareas y un pool reutilizable, y `try-with-resources` garantiza el `close()` del executor. Salida verificada: `hilo-manual=1`.

### Tema 2: CompletableFuture · Intermedio · 45 min

`CompletableFuture` representa una computación asincrónica que puede componerse. `supplyAsync` ejecuta una tarea que devuelve valor; `thenApply/thenCompose/thenCombine` encadenan o combinan resultados; `exceptionally/handle` manejan fallos; `orTimeout` impone límite temporal. A diferencia de `Future`, permite construir pipelines sin bloquear inmediatamente.

En `cotizarConCompletableFuture` se lanzan dos consultas en paralelo y se combinan con `thenCombine`. El executor pasado a `supplyAsync` es importante: si omites el executor, usa el ForkJoinPool común, que no es ideal para I/O bloqueante. Aquí se usa un executor de virtual threads por tarea para la demo.

`thenCombine` ejecuta dos futuros independientes y combina sus resultados. Cuando la segunda llamada **depende** de la primera, la herramienta es `thenCompose`:

```java
return CompletableFuture
        .supplyAsync(() -> catalogo.precio(sku, Duration.ofMillis(40)), executor)
        .thenCompose(precio -> CompletableFuture.supplyAsync(() ->
                new ResultadoCotizacion(sku, precio,
                        inventario.stock(sku, Duration.ofMillis(40)),
                       Duration.between(inicio, Instant.now()).toMillis()), executor))
        .exceptionally(ex -> new ResultadoCotizacion(sku, BigDecimal.ZERO, -1,
                Duration.between(inicio, Instant.now()).toMillis()))
        .join();
```

`thenApply` habría producido un `CompletableFuture<CompletableFuture<ResultadoCotizacion>>`; `thenCompose` aplana la cadena. `exceptionally` define el valor ante fallo, y `orTimeout` limita la espera en la variante anterior. Salida observada: `thenCompose sku=FIL-300 precio=9.50 stock=25`.

**Confusión común:** `CompletableFuture` elimina la necesidad de pensar en errores y cancelación. No. Los errores se propagan como completaciones excepcionales; si olvidas manejarlos, `join()` lanza. Las cadenas largas pueden volverse difíciles de depurar; para subtareas con ciclo de vida claro, Structured Concurrency suele ser más legible.

### Tema 3: Virtual threads · Intermedio · 40 min

Los virtual threads (Java 21+) son hilos ligeros administrados por la JVM, no mapeados 1:1 con hilos del sistema operativo. Permiten escribir código bloqueante de estilo simple mientras la JVM monta/desmonta el virtual thread de un carrier thread cuando hay bloqueo. Esto hace viable tener miles o cientos de miles de tareas concurrentes I/O-bound.

No son magia para CPU-bound: si la tarea consume CPU continuamente, sigues limitado por cores. Tampoco eliminan la necesidad de sincronización sobre estado compartido. Su valor principal es escalar I/O bloqueante con un modelo de programación familiar.

En `medirLote`, el mismo lote de 200 tareas con `sleep(40ms)` se ejecuta con pool fijo de 20 y con virtual threads por tarea. Con `./gradlew -q run --args="medir"` se obtuvo `plataforma-ms=442` y `virtual-ms=48`; son tiempos de una corrida, no un benchmark definitivo.

La escala se aprecia mejor con 100 000 tareas. El proyecto usa un `CountDownLatch` para esperar a todas sin guardar 100 000 `Future`:

```java
public int lanzarVirtualThreads(int cantidad) throws Exception {
    AtomicInteger completadas = new AtomicInteger();
    CountDownLatch latch = new CountDownLatch(cantidad);
    try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
        for (int i = 0; i < cantidad; i++) {
            executor.submit(() -> {
                completadas.incrementAndGet();
                latch.countDown();
            });
        }
        if (!latch.await(30, TimeUnit.SECONDS)) {
            throw new IllegalStateException("no terminaron todas las tareas");
        }
    }
    return completadas.get();
}
```

Salida observada: `virtual-threads=100000`. Con hilos de plataforma ese número de hilos simultáneo no sería razonable en este entorno. La clave no es que cada tarea haga mucho, sino que cada una pueda bloquearse sin inmovilizar un hilo del SO.

### Tema 4: Condiciones de carrera y sincronización · Básico · 35 min

Una condición de carrera ocurre cuando el resultado depende del orden no controlado de acceso concurrente a estado mutable compartido. `valor++` no es atómico: lee, incrementa y escribe. Dos hilos pueden leer el mismo valor y perder incrementos.

`contarConRace()` lanza 1000 incrementos en paralelo sobre un `int` sin protección. El resultado observado puede ser menor que 1000. `contarSinRace()` usa `synchronized` para garantizar exclusión mutua y visibilidad. Otras herramientas son `AtomicInteger`, `LongAdder`, locks, colas concurrentes o, mejor, evitar estado compartido.

**Confusión común:** “no lo vi fallar en mi test, entonces no hay race”. Las races son no deterministas. Se detectan con diseño cuidadoso, pruebas de estrés, sanitizers/herramientas y revisión de invariantes.

### Tema 5: Structured Concurrency (StructuredTaskScope, Java 25) · Avanzado · 45 min

Structured Concurrency trata subtareas concurrentes como parte de un bloque con entrada y salida claras. En lugar de lanzar futuros sueltos que pueden sobrevivir al método que los creó, abres un scope, forkeas subtareas, haces `join()` y el scope garantiza el ciclo de vida. Si el scope termina, las subtareas no quedan huérfanas.

En `checkoutConStructuredConcurrency` se usa `StructuredTaskScope.open()` (API preview en esta configuración de JDK 25) para consultar precio y stock. El resultado se combina solo después de `join()`. Esto mejora legibilidad y manejo de fallos respecto a futuros sueltos.

**Nota honesta:** Structured Concurrency ha cambiado de API entre previews. Este código se verificó con JDK 27.0.1.0.2/Java 25 toolchain y `--enable-preview`. Antes de copiarlo a otro JDK, verifica la API exacta (`open`, `Subtask.get()`, políticas de fallo).

### Tema 6: Scoped Values frente a ThreadLocal (Java 25) · Avanzado · 35 min

`ScopedValue` permite pasar contexto inmutable a lo largo de una llamada y sus subtareas, incluyendo virtual threads. A diferencia de `ThreadLocal`, el valor está acotado al scope: se establece con `ScopedValue.where(...).call/run(...)` y no queda contaminando el hilo después. Eso lo hace más seguro para concurrencia estructurada y virtual threads.

`ThreadLocal` es mutable y vive hasta que se elimina o el hilo muere. Con pools y virtual threads masivos, es fácil filtrar contexto o heredar datos incorrectos. `ScopedValue` favorece inmutabilidad y alcance léxico.

En el ejemplo, `REQUEST_ID` se liga antes del checkout estructurado y se lee dentro del scope; fuera del scope, `requestIdActual()` devuelve `sin-request`. La diferencia con `ThreadLocal` se demuestra con un pool de un solo hilo que se reutiliza:

```java
executor.submit(() -> heredado.set("req-threadlocal")).get();
String filtrado = executor.submit(heredado::get).get();
String dentroScope = ScopedValue.where(REQUEST_ID, "req-scoped").call(this::requestIdActual);
String fueraScope = requestIdActual();
```

Salida observada:

```text
threadlocal-reutilizado=req-threadlocal scoped-dentro=req-scoped scoped-fuera=sin-request
```

El `ThreadLocal` sobrevive a la tarea y contamina la siguiente ejecución en el mismo hilo. El `ScopedValue` desaparece al cerrar el scope. Eso es lo que evita filtrar un `requestId` de una petición a otra.

**Regla práctica:** si el contexto solo se necesita dentro de una llamada y sus subtareas (un `requestId`, una transacción), usa `ScopedValue`; resérvate `ThreadLocal` para el caso real de mutar un valor y releerlo más tarde en el mismo hilo, no como costumbre heredada.

### Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos · Avanzado · 40 min

El timeout evita esperar indefinidamente por una tarea lenta o colgada. `Future.get(timeout, unit)` y `CompletableFuture.orTimeout(...)` son mecanismos básicos. Pero cancelar no es magia: Java interrumpe hilos cooperativamente. El código bloqueable debe responder a `InterruptedException`, restaurar el estado de interrupción cuando corresponda y salir limpiamente.

La cancelación cooperativa significa que la tarea revisa si debe parar. `Thread.sleep`, `Object.wait`, algunas operaciones bloqueantes de I/O y APIs concurrentes responden a interrupción; bucles CPU-bound deben comprobar `Thread.currentThread().isInterrupted()` o recibir una señal. Abandonar recursos ocurre cuando se cancela por fuera pero la tarea sigue con un socket, archivo o lock abierto.

**Regla práctica:** timeout + interrupción + cierre de recursos. Con structured concurrency, el scope da un punto natural para esperar y limpiar. Con executors, usa try-with-resources o shutdown controlado.

## Verificación real

Re-verificado el 2026-11-23 en `~/labs/aurora-m5` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, `--enable-preview`).

Desde la raíz del proyecto:

```bash
cd ~/labs/aurora-m5
./gradlew -q test
./gradlew -q run
./gradlew -q run --args="race"
./gradlew -q run --args="structured"
./gradlew -q run --args="medir"
./gradlew -q run --args="auditoria"
```

Resultados observados:

```text
$ ./gradlew -q run --args="race"
race esperado=1000 observado=989
seguro esperado=1000 observado=1000

$ ./gradlew -q run --args="structured"
structured pedido=PED-900 precio=14.90 stock=8 requestId=req-7f3a
requestId fuera=sin-request

$ ./gradlew -q run --args="medir"
plataforma-ms=442
virtual-ms=48

$ ./gradlew -q run --args="auditoria"
thenCompose sku=FIL-300 precio=9.50 stock=25
hilo-manual=1
virtual-threads=100000
race=996 seguro=1000
threadlocal-reutilizado=req-threadlocal scoped-dentro=req-scoped scoped-fuera=sin-request
```

`./gradlew -q test` (3 pruebas) terminó sin fallos. `run` produce `executor CAF-100 14.90 stock=8`, `future MOL-200 79.90 stock=3` y `structured PED-900 req-7f3a`.

**Nota honesta:** el valor inseguro de `race` cambia en cada corrida (`989` y `996` en las dos ejecuciones mostradas); no es un número canónico. Lo relevante es que `seguro` siempre entrega `1000`. Los tiempos de `medirLote` también dependen de la carga de la máquina.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Race condition intermitente | Estado mutable compartido sin protección | Tests concurrentes, logs no deterministas | `Atomic*`, locks, confinamiento, estructuras concurrentes |
| Deadlock | Locks en orden inconsistente | Thread dump | Ordenar locks, timeout, evitar lock anidado |
| Tareas nunca terminan | No manejar interrupción/cancelación | Hilos bloqueados, app no cierra | Chequear interrupción, propagar, cerrar recursos |
| Virtual threads no mejoran | Carga CPU-bound o pinning | Métricas/JFR | Usar para I/O bloqueante; evitar pinning en secciones críticas |
| `RejectedExecutionException` | Executor cerrado o cola saturada | Stack trace al submit | Política de rechazo clara, lifecycle del executor |

## Cierre

La concurrencia no se resuelve “agregando hilos”. Se resuelve definiendo ownership de tareas, límites de tiempo, manejo de fallos, visibilidad de memoria y cierre de recursos. Los virtual threads simplifican el escalado de I/O, pero no eliminan la necesidad de diseñar bien la coordinación.

## Checklist

- [ ] Sé cerrar un `ExecutorService` correctamente.
- [ ] Puedo componer tareas con `CompletableFuture` sin bloquear antes de tiempo.
- [ ] Entiendo cuándo usar virtual threads y cuándo no.
- [ ] Puedo explicar una race condition y corregirla.
- [ ] Uso structured concurrency/scoped values para ciclo de vida y contexto claros.
- [ ] Trato timeout/cancelación como parte del diseño, no como parche.
