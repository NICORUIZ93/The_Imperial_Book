# Módulo 5: Concurrencia

En Tienda Aurora, el checkout necesita responder rápido aunque dependa de varias fuentes. El precio puede venir del catálogo, el stock del inventario y la validación de fraude de otro servicio. Si cada llamada espera a la anterior, la latencia se acumula. Si lanzas tareas sin control, aparecen bugs peores: condiciones de carrera, hilos colgados, timeouts que dejan trabajo huérfano o datos contaminados entre requests.

La concurrencia en Java no es una sola API. Es una escalera. `ExecutorService` te da control básico sobre pools y tareas. `CompletableFuture` compone trabajo asíncrono. Los virtual threads hacen barato bloquear en I/O. `synchronized` y otras primitivas protegen estado compartido. Structured Concurrency da un ciclo de vida claro a subtareas relacionadas. `ScopedValue` propaga contexto sin los problemas de `ThreadLocal` en escenarios masivos.

Este módulo construye `tienda-aurora-concurrency`, una app de consola que simula catálogo e inventario remotos con latencia. No hay HTTP real; la latencia se modela con `Thread.sleep` para centrarnos en el comportamiento de concurrencia. Cada comando ejecuta un caso verificable.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2 (Temurin 25.0.5.1+2), Gradle 9.9.1, macOS arm64. El proyecto se compiló con `./gradlew -q build` usando `--release 25`, `--enable-preview` y `-Xlint:all,-preview -Werror`. **Nota de verificación:** Structured Concurrency (`StructuredTaskScope`) y Scoped Values son APIs preview en JDK 25; los comandos usan `--enable-preview`. La simulación de latencia usa `Thread.sleep`; no se hicieron llamadas de red reales.

## Proyecto desde cero: tienda-aurora-concurrency

## Prerrequisitos

```bash
java -version
gradle --version
```

Necesitas JDK 25 o superior. Para ejecutar los ejemplos tal como están, usa un JDK que soporte las APIs preview usadas en el código.

## Estructura del proyecto

```text
tienda-aurora-concurrency/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── java/
            └── com/aurora/concurrency/
                ├── TiendaAuroraConcurrencyApp.java
                ├── dominio/
                │   ├── CheckoutResult.java
                │   └── ResultadoCotizacion.java
                └── servicio/
                    ├── CatalogoRemoto.java
                    ├── CheckoutService.java
                    └── InventarioRemoto.java
```

## build.gradle.kts

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

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all,-preview", "-Werror", "--enable-preview"))
}

tasks.withType<JavaExec>().configureEach {
    jvmArgs("--enable-preview")
}
```

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-concurrency"
```

## Código completo

Nombre del proyecto. Mantener el wrapper y el nombre del build hace que el entorno sea reproducible.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-concurrency"
```

Configura Java 25 y habilita `--enable-preview` tanto en compilación como en ejecución. Structured Concurrency y Scoped Values son APIs preview en JDK 25, por eso el build necesita esta configuración explícita; sin ella el compilador rechaza `StructuredTaskScope.open()` y `ScopedValue`.

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
    mainClass = "com.aurora.concurrency.TiendaAuroraConcurrencyApp"
    applicationDefaultJvmArgs = listOf("--enable-preview")
}

repositories {
    mavenCentral()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all,-preview", "-Werror", "--enable-preview"))
}

tasks.withType<JavaExec>().configureEach {
    jvmArgs("--enable-preview")
}
```

### Dominio

Record inmutable para la respuesta de una cotización. Lleva SKU, precio, stock y latencia medida. Usar un tipo explícito evita devolver mapas o arreglos de objetos sin significado.

**Archivo:** `src/main/java/com/aurora/concurrency/dominio/ResultadoCotizacion.java`

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

Resultado del checkout coordinado. Incluye `requestId` para demostrar que el contexto propagado por `ScopedValue` llega a la respuesta de negocio.

**Archivo:** `src/main/java/com/aurora/concurrency/dominio/CheckoutResult.java`

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

### Servicios

Simula un servicio remoto de catálogo. `Thread.sleep` representa latencia de I/O. En producción sería una llamada HTTP o a base de datos; la forma de manejar espera, timeout y cancelación es la misma.

**Archivo:** `src/main/java/com/aurora/concurrency/servicio/CatalogoRemoto.java`

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

Simula el servicio remoto de inventario. Separarlo del catálogo permite ejecutar ambas consultas en paralelo y combinar el resultado.

**Archivo:** `src/main/java/com/aurora/concurrency/servicio/InventarioRemoto.java`

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

Contiene los casos de concurrencia del módulo: `ExecutorService` con `Future`, `CompletableFuture` con composición y timeout, `StructuredTaskScope` con subtareas, un contador con race condition y su versión sincronizada, y una medición simple de plataforma vs virtual threads.

**Archivo:** `src/main/java/com/aurora/concurrency/servicio/CheckoutService.java`

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

### Frontera CLI

CLI de demostración. Cada comando ejecuta un caso concreto y escribe una salida verificable. Así el módulo no queda en teoría: cada mecanismo tiene una ejecución observable.

**Archivo:** `src/main/java/com/aurora/concurrency/TiendaAuroraConcurrencyApp.java`

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

## Ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q build
./gradlew -q run --args="executor"
```

```text
executor sku=CAF-100 precio=14.90 stock=8
```

```bash
./gradlew -q run --args="future"
```

```text
future sku=MOL-200 precio=79.90 stock=3
```

```bash
./gradlew -q run --args="structured"
```

```text
structured pedido=PED-900 precio=14.90 stock=8 requestId=req-7f3a
requestId fuera=sin-request
```

```bash
./gradlew -q run --args="race"
```

```text
race esperado=1000 observado=985
seguro esperado=1000 observado=1000
```

El contador con race condition es no determinista: en ejecuciones repetidas se observaron valores como 986, 992, 987 o 988, pero el contador sincronizado siempre devolvió 1000.

```bash
./gradlew -q run --args="medir"
```

```text
plataforma-ms=444
virtual-ms=59
```

Esta medición es indicativa, no un benchmark JMH. Sirve para ver la diferencia de comportamiento con tareas bloqueantes simuladas; no debe usarse como número de rendimiento definitivo.

## Conceptos cubiertos

### Tema 1: ExecutorService y gestión de hilos · Intermedio · 40 min

Crear un `Thread` por tarea es fácil, pero no escala bien. Cada hilo de plataforma consume memoria y recursos del sistema operativo, y gestionar su ciclo de vida a mano se vuelve frágil. `ExecutorService` separa dos cosas: enviar trabajo y decidir cómo se ejecuta ese trabajo.

En `CheckoutService.cotizarConExecutor`, el catálogo y el inventario se consultan en paralelo con un pool fijo de dos hilos:

```java
try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
    Instant inicio = Instant.now();
    Future<BigDecimal> precioFuture = executor.submit(() -> catalogo.precio(sku, Duration.ofMillis(120)));
    Future<Integer> stockFuture = executor.submit(() -> inventario.stock(sku, Duration.ofMillis(90)));
    BigDecimal precio = precioFuture.get(2, TimeUnit.SECONDS);
    int stock = stockFuture.get(2, TimeUnit.SECONDS);
    return new ResultadoCotizacion(sku, precio, stock, Duration.between(inicio, Instant.now()).toMillis());
}
```

`submit` recibe un `Callable` y devuelve un `Future`. El `Future` no es el resultado; es una promesa de resultado. `get()` bloquea hasta que el valor esté listo o hasta que expire el timeout. El timeout es una defensa: sin él, una dependencia lenta puede colgar el hilo llamador indefinidamente.

El `try-with-resources` sobre el executor importa porque `ExecutorService` implementa `AutoCloseable` en Java moderno. Al salir del bloque, se cierra y no deja hilos trabajadores vivos. En versiones antiguas se usaba `shutdown()` y `awaitTermination()` explícitamente; ese patrón sigue siendo válido cuando necesitas más control sobre el apagado.

La salida real del comando `executor` es:

```text
executor sku=CAF-100 precio=14.90 stock=8
```

### Tema 2: CompletableFuture · Intermedio · 45 min

`Future` es útil, pero limitado: para combinar resultados o encadenar pasos suele terminar en código bloqueante. `CompletableFuture` representa una etapa asíncrona que puede componerse. Puedes transformar su resultado, combinar dos futuros, manejar errores o aplicar un timeout.

En `cotizarConCompletableFuture`, precio y stock se consultan de forma asíncrona y luego se combinan:

```java
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
```

`supplyAsync` ejecuta una tarea que devuelve valor. `thenCombine` espera a dos etapas independientes y combina sus resultados. `orTimeout` evita esperar indefinidamente. `exceptionally` permite transformar el fallo en una respuesta o, como aquí, en una excepción con contexto. El detalle de `Thread.currentThread().interrupt()` es importante: si una tarea bloqueante es interrumpida, restaurar el flag de interrupción preserva la señal para capas superiores.

La salida real:

```text
future sku=MOL-200 precio=79.90 stock=3
```

### Tema 3: Virtual threads · Intermedio · 35 min

Los hilos de plataforma son caros: cada uno está respaldado por un hilo del sistema operativo. Eso limita cuántos puedes tener bloqueados esperando I/O. Los virtual threads, estables desde Java 21, cambian el costo del modelo: son hilos ligeros administrados por la JVM, pensados para tareas que pasan mucho tiempo esperando.

El cambio de API es pequeño. En vez de `newFixedThreadPool`, puedes usar `Executors.newVirtualThreadPerTaskExecutor()`:

```java
ExecutorService executor = virtual
        ? Executors.newVirtualThreadPerTaskExecutor()
        : Executors.newFixedThreadPool(20);
```

En la medición del módulo, 200 tareas con 40 ms de espera simulada se ejecutaron con pool fijo de 20 hilos de plataforma y con un virtual thread por tarea. La salida real fue:

```text
plataforma-ms=444
virtual-ms=59
```

La diferencia es grande porque el pool de plataforma solo puede avanzar 20 tareas a la vez; el resto espera turno. Con virtual threads, cada tarea puede bloquearse sin ocupar un hilo de OS caro, así que la JVM puede programar muchas esperas concurrentes. Esto no significa que los virtual threads hagan más rápida la CPU: brillan cuando el cuello de botella es la espera, especialmente I/O bloqueante.

**Nota de verificación:** esta medición es indicativa. No controla calentamiento de JVM, ruido del sistema ni hace estadística como JMH. Sirve para observar el comportamiento, no para publicar un número definitivo de rendimiento.

### Tema 4: Condiciones de carrera y sincronización · Intermedio · 40 min

Una condición de carrera ocurre cuando dos o más hilos leen y escriben estado compartido sin coordinación, y el resultado depende del orden de ejecución. El bug más clásico es `valor++`. Parece una operación, pero en realidad son tres: leer, sumar, escribir. Dos hilos pueden leer el mismo valor y ambos escribir el mismo resultado, perdiendo un incremento.

En `contarConRace()` se lanzan 1000 incrementos con un pool de 8 hilos sobre un contador sin sincronización:

```java
class Contador {
    int valor;
    void inc() { valor++; }
}
```

La salida real que capturé fue:

```text
race esperado=1000 observado=985
seguro esperado=1000 observado=1000
```

El valor esperado era 1000 y el observado fue 985. En ejecuciones repetidas aparecieron 986, 992, 987 o 988. Esa variabilidad es parte del problema: una race condition puede pasar pruebas y fallar en producción, o fallar solo bajo carga.

La versión corregida usa `synchronized`:

```java
class ContadorSeguro {
    private int valor;
    synchronized void inc() { valor++; }
    synchronized int valor() { return valor; }
}
```

`synchronized` garantiza exclusión mutua: solo un hilo a la vez entra al bloque/método protegido por el mismo monitor. También establece una relación happens-before entre la liberación del monitor y la siguiente adquisición, lo que da visibilidad de memoria. El resultado observado fue `1000` de forma consistente.

`synchronized` no es la única herramienta. Para contadores simples, `AtomicInteger` suele ser más directo. Para estructuras más complejas, pueden hacer falta `Lock`, colas concurrentes o evitar el estado compartido. La lección principal es: si hay estado mutable compartido, debe haber una política clara de sincronización.

### Tema 5: Structured Concurrency (StructuredTaskScope, Java 25) · Avanzado · 45 min

Cuando lanzas subtareas con futuros sueltos, es fácil perder el control: una subtarea sigue viva aunque el request ya falló, o el hilo padre retorna sin saber si dejó trabajo pendiente. Structured Concurrency trata un grupo de subtareas relacionadas como una unidad con inicio y fin claros.

En el checkout, precio y stock son subtareas del mismo request. Con `StructuredTaskScope.open()` se escriben así:

```java
try (var scope = StructuredTaskScope.open()) {
    StructuredTaskScope.Subtask<BigDecimal> precioTask =
            scope.fork(() -> catalogo.precio(sku, Duration.ofMillis(120)));
    StructuredTaskScope.Subtask<Integer> stockTask =
            scope.fork(() -> inventario.stock(sku, Duration.ofMillis(90)));
    scope.join();
    return new CheckoutResult(pedidoId, precioTask.get(), stockTask.get(), REQUEST_ID.get());
}
```

`fork()` crea una subtarea. `join()` espera a que el scope termine según su política. El `try-with-resources` delimita el ciclo de vida: no se sale del bloque dejando subtareas huérfanas. Esto hace que el código concurrente se parezca más a código estructurado normal, donde los bloques tienen entrada y salida claras.

La salida real:

```text
structured pedido=PED-900 precio=14.90 stock=8 requestId=req-7f3a
requestId fuera=sin-request
```

**Nota de verificación:** la API usada aquí es preview en JDK 25 y se compiló/ejecutó con `--enable-preview`. El nombre y los detalles de la API pueden cambiar en versiones futuras; la idea estable es el ciclo de vida estructurado de subtareas.

### Tema 6: Scoped Values frente a ThreadLocal (Java 25) · Avanzado · 35 min

En servicios concurrentes es común necesitar contexto por request: requestId, usuario, tenant, locale. `ThreadLocal` resolvió esto durante años, pero tiene costos: el valor es mutable, puede filtrarse si no se limpia, y con muchos virtual threads su uso descuidado puede volverse pesado.

`ScopedValue` ofrece un modelo distinto. El valor se enlaza a un alcance y se hereda por las tareas creadas dentro de ese alcance. No se “setea” y “resetea” manualmente como un mutable global por hilo; se ejecuta código dentro de `where(...).call(...)` o `run(...)`.

```java
private static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

return ScopedValue.where(REQUEST_ID, requestId).call(() -> {
    try (var scope = StructuredTaskScope.open()) {
        StructuredTaskScope.Subtask<BigDecimal> precioTask = scope.fork(() -> catalogo.precio(sku, Duration.ofMillis(120)));
        StructuredTaskScope.Subtask<Integer> stockTask = scope.fork(() -> inventario.stock(sku, Duration.ofMillis(90)));
        scope.join();
        return new CheckoutResult(pedidoId, precioTask.get(), stockTask.get(), REQUEST_ID.get());
    }
});
```

Dentro del alcance, `REQUEST_ID.get()` devuelve `req-7f3a`. Fuera del alcance, el método `requestIdActual()` devuelve `sin-request`. Esa salida real demuestra el límite: el contexto existe solo donde fue enlazado. Eso reduce el riesgo de contaminación entre requests.

**Nota de verificación:** Scoped Values también es API preview en JDK 25 en este entorno. El patrón conceptual es estable: contexto inmutable por alcance, especialmente útil con virtual threads y structured concurrency.

### Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos · Avanzado · 40 min

Un timeout no es solo “dejar de esperar”. Si la tarea sigue corriendo y consumiendo conexiones, hilos o memoria, el timeout solo escondió el síntoma. Por eso la cancelación en Java es cooperativa: interrumpir un hilo no lo mata a la fuerza; le envía una señal que el código debe respetar.

En `cotizarConCompletableFuture` se usa `orTimeout(2, TimeUnit.SECONDS)`. En `cotizarConExecutor` se usa `future.get(2, TimeUnit.SECONDS)`. Ambos ponen un límite de espera. Pero el límite de espera debe ir acompañado de tareas que respeten interrupción. En los servicios remotos simulados, `Thread.sleep(...)` lanza `InterruptedException` cuando el hilo es interrumpido; por eso el código la captura, llama `Thread.currentThread().interrupt()` y propaga o traduce el error.

Restaurar el flag de interrupción es un detalle pequeño y crítico. Si atrapas `InterruptedException` y lo ignoras, borras la señal de cancelación. El código superior cree que todo sigue normal. La forma correcta es decidir: o manejas la cancelación completamente, o restauras el flag y/o propagas una excepción.

La limpieza de recursos es el otro lado. Por eso los executors están en `try-with-resources` y el `StructuredTaskScope` también. Un timeout sin cierre de recursos produce fugas; un cierre sin timeout puede colgar. La combinación correcta es límite de tiempo, señal de cancelación y liberación determinista.

## Cierre

La concurrencia moderna en Java no se trata de crear hilos por todos lados. Se trata de elegir la abstracción adecuada: `ExecutorService` para controlar ejecución, `CompletableFuture` para componer etapas, virtual threads para escalar esperas bloqueantes, sincronización para proteger estado compartido, structured concurrency para dar ciclo de vida a subtareas, scoped values para contexto y timeouts con cancelación cooperativa para no abandonar trabajo.

## Checklist

- Uso `ExecutorService` o ejecutores gestionados, no hilos sueltos sin ciclo de vida claro.
- Combino trabajo asíncrono con `CompletableFuture` y pongo timeout donde hay dependencias externas.
- Uso virtual threads para I/O bloqueante masivo, no como atajo mágico para CPU-bound.
- Protejo estado compartido mutable con sincronización o estructuras concurrentes.
- Uso structured concurrency y scoped values para mantener subtareas y contexto dentro de un alcance.
- Trato la interrupción como señal de cancelación: la propago o la restauro, y cierro recursos.
