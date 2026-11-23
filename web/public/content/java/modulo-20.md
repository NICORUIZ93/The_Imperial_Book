# Módulo 20: Java funcional — interfaces que componen comportamiento

El estilo funcional en Java no reemplaza la orientación a objetos. Le da una forma precisa de pasar comportamiento: una regla, una transformación, una acción o un proveedor de datos. El problema real aparece cuando un flujo de negocio se llena de `for`, `if`, banderas y acumuladores que mezclan cálculo, filtrado y efectos secundarios. El código funciona, pero cuesta leer qué regla aplica, dónde se transforma un dato y dónde se escribe a consola, base de datos o red.

En este módulo vas a construir un mini-módulo de envíos de Tienda Aurora. No será un ejercicio de “usar streams por usar streams”: cada función tendrá un lugar. Las reglas se modelan como objetos que se pueden probar; los cálculos se mantienen puros; los efectos se dejan en el borde. También vas a ver los límites: un stream no es siempre mejor que un `for`, `Optional` no debe invadir todos los campos, y `parallelStream()` solo sirve cuando el trabajo y los datos lo justifican.

## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 20 — mapa visual](/visuals/temas/java/modulo-20-interfaces-funcionales.html)

Lectura: Cada interfaz funcional expresa una forma de entrada/salida; Flow agrega demanda explícita.

## Qué vas a construir

Un proyecto Gradle llamado `tienda-aurora-java-m20` con:

- un modelo de dominio inmutable (`Envio`, `EstadoEnvio`);
- una regla de negocio nombrada (`ReglaEnvio`) que combina predicados;
- funciones puras para transformar, filtrar, agrupar y resumir envíos;
- un repositorio en memoria que expone ausencia con `Optional`;
- un ejemplo de `Flow` con backpressure;
- tests JUnit 5 que verifican composición, pereza, collectors, Optional y Flow.

## Prerrequisitos

- JDK 25 instalado y visible con `java -version`.
- Gradle 9.x para generar el wrapper, o un wrapper ya existente.
- Conocimientos de M3-M9: clases/records, colecciones, genéricos, lambdas básicas y manejo de errores.

## Estructura del proyecto

```text
tienda-aurora-java-m20/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/funcional/
    │   ├── App.java
    │   ├── Envio.java
    │   ├── EstadoEnvio.java
    │   ├── EventosEnvio.java
    │   ├── EnvioRepository.java
    │   ├── ReglaEnvio.java
    │   ├── ReglasEnvio.java
    │   └── ReporteEnvios.java
    └── test/java/com/aurora/funcional/
        └── FuncionalTest.java
```

La separación importa: `Envio` y `ReporteEnvios` no saben imprimir ni guardar; `App` es el borde donde se conectan efectos.

## Bootstrap desde cero

Crea el proyecto y el wrapper:

```bash
mkdir -p tienda-aurora-java-m20/src/main/java/com/aurora/funcional
mkdir -p tienda-aurora-java-m20/src/test/java/com/aurora/funcional
cd tienda-aurora-java-m20
gradle wrapper --gradle-version 9.9.1
```

## Código, archivo por archivo

#### `settings.gradle.kts`

Define el nombre del build. Gradle lo usa para identificar el proyecto.

```kotlin
rootProject.name = "tienda-aurora-java-m20"
```

#### `build.gradle.kts`

Configura Java 25 con toolchain, JUnit 5 y la clase principal. `-Xlint:all -Werror` hace visibles problemas que en ejemplos pequeños suelen pasar desapercibidos.

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

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.aurora.funcional.App"
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
        showStandardStreams = true
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

#### `EstadoEnvio.java`

Un `enum` acota los estados posibles. Esto evita strings mágicos como `"entregado"` o `"ENTREGADO"` dispersos por el código.

```java
package com.aurora.funcional;

public enum EstadoEnvio {
    PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO
}
```

#### `Envio.java`

El record es inmutable. La validación en el constructor compacto protege invariantes antes de que el objeto circule por streams o collectors. `List.copyOf` evita que alguien modifique la lista de paradas desde afuera.

```java
package com.aurora.funcional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/** Value object inmutable: dato del dominio, sin I/O. */
public record Envio(
        String id,
        String destino,
        BigDecimal pesoKg,
        BigDecimal costo,
        EstadoEnvio estado,
        List<String> paradas
) {
    public Envio {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(destino, "destino");
        Objects.requireNonNull(pesoKg, "pesoKg");
        Objects.requireNonNull(costo, "costo");
        Objects.requireNonNull(estado, "estado");
        paradas = List.copyOf(paradas);
        if (id.isBlank()) throw new IllegalArgumentException("id vacío");
        if (destino.isBlank()) throw new IllegalArgumentException("destino vacío");
        if (pesoKg.signum() <= 0) throw new IllegalArgumentException("pesoKg debe ser > 0");
        if (costo.signum() < 0) throw new IllegalArgumentException("costo no puede ser negativo");
    }
}
```

**Caso de borde:** si `paradas` fuera una lista mutable expuesta tal cual, un consumidor podría agregar elementos después de crear el envío. La copia defensiva hace que el record mantenga su promesa.

#### `ReglaEnvio.java`

Aquí aparece una decisión de diseño importante. `Predicate<Envio>` ya prueba una condición, pero en negocio también queremos saber *por qué* una regla existe. Por eso definimos `ReglaEnvio`, con `test` y `motivo`.

No usamos `@FunctionalInterface` porque hay dos métodos abstractos. Eso no es un problema: la factory `de(...)` recibe un `Predicate<Envio>` y construye la regla. Así conservamos lambdas donde son cómodas y un nombre de dominio donde aporta claridad.

```java
package com.aurora.funcional;

import java.util.Objects;
import java.util.function.Predicate;

/**
 * Regla de negocio nombrada. Combina Predicate (test) con motivo legible.
 * No es @FunctionalInterface porque expone dos métodos abstractos; la factory `de`
 * crea instancias a partir de lambdas Predicate.
 */
public interface ReglaEnvio {
    boolean test(Envio envio);
    String motivo();

    default ReglaEnvio and(ReglaEnvio otra) {
        ReglaEnvio self = this;
        Objects.requireNonNull(otra, "otra");
        return new ReglaEnvio() {
            @Override
            public boolean test(Envio envio) {
                return self.test(envio) && otra.test(envio);
            }
            @Override
            public String motivo() {
                return self.motivo() + " Y " + otra.motivo();
            }
        };
    }

    default Predicate<Envio> asPredicate() {
        return this::test;
    }

    static ReglaEnvio de(String motivo, Predicate<Envio> predicate) {
        Objects.requireNonNull(motivo, "motivo");
        Objects.requireNonNull(predicate, "predicate");
        return new ReglaEnvio() {
            @Override public boolean test(Envio envio) { return predicate.test(envio); }
            @Override public String motivo() { return motivo; }
        };
    }
}
```

**Trade-off:** si solo necesitas filtrar en un stream local, `Predicate<Envio>` basta. Si la regla es parte del lenguaje del dominio, un tipo propio da mejor diagnóstico y composición con significado.

#### `ReglasEnvio.java`

Esta clase concentra funciones puras. Es el corazón de los primeros seis temas: las cuatro interfaces funcionales core, `Function/BiFunction`, composición y operadores.

```java
package com.aurora.funcional;

import java.math.BigDecimal;
import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

/** Fábrica de reglas y funciones puras. Sin I/O: se puede probar sin mocks. */
public final class ReglasEnvio {
    private ReglasEnvio() {}

    // Predicate / regla propia
    public static ReglaEnvio pesoMaximo(BigDecimal maxKg) {
        return ReglaEnvio.de("peso <= " + maxKg, e -> e.pesoKg().compareTo(maxKg) <= 0);
    }

    public static ReglaEnvio destinoPermitido(String destino) {
        return ReglaEnvio.de("destino=" + destino, e -> e.destino().equalsIgnoreCase(destino));
    }

    public static ReglaEnvio noFallido() {
        return ReglaEnvio.de("no fallido", e -> e.estado() != EstadoEnvio.FALLIDO);
    }

    // Function<T,R> y BiFunction<T,U,R>
    public static Function<Envio, String> etiqueta() {
        return e -> e.id() + "@" + e.destino();
    }

    public static BiFunction<BigDecimal, BigDecimal, BigDecimal> tarifaConImpuesto() {
        return (base, impuesto) -> base.add(base.multiply(impuesto));
    }

    // UnaryOperator/BinaryOperator: mismo tipo entra y sale
    public static UnaryOperator<BigDecimal> aplicarDescuento(BigDecimal porcentaje) {
        BigDecimal factor = BigDecimal.ONE.subtract(porcentaje);
        return total -> total.multiply(factor);
    }

    public static BinaryOperator<BigDecimal> mayorCosto() {
        return (a, b) -> a.compareTo(b) >= 0 ? a : b;
    }

    // Supplier / Consumer: bordes. Consumer se inyecta, no se hardcodea System.out.
    public static Supplier<String> generadorId(String prefijo, int n) {
        return () -> prefijo + "-" + n;
    }

    public static Consumer<String> auditor(Consumer<String> salida) {
        return salida;
    }

    // Composición explícita
    public static Function<BigDecimal, BigDecimal> normalizarYRedondear() {
        UnaryOperator<BigDecimal> noNegativo = v -> v.signum() < 0 ? BigDecimal.ZERO : v;
        UnaryOperator<BigDecimal> dosDecimales = v -> v.setScale(2, java.math.RoundingMode.HALF_UP);
        return noNegativo.andThen(dosDecimales);
    }
}
```

Observa la separación: `Supplier` y `Consumer` están cerca del borde, no calculan reglas de negocio. `Function`, `BiFunction`, `UnaryOperator` y `BinaryOperator` sí transforman valores. La función `normalizarYRedondear` muestra composición con `andThen`: primero sanea, luego da formato numérico.

#### `EnvioRepository.java`

`Optional` sirve bien en un borde de consulta: “puede existir o no”. No lo usamos como campo de `Envio`; el dominio debe ser claro. El repositorio en memoria simula una búsqueda por id.

```java
package com.aurora.funcional;

import java.util.Map;
import java.util.Optional;

/** Puerto simple para demostrar Optional en borde de consulta. */
public class EnvioRepository {
    private final Map<String, Envio> porId;

    public EnvioRepository(Map<String, Envio> porId) {
        this.porId = Map.copyOf(porId);
    }

    public Optional<Envio> buscarPorId(String id) {
        return Optional.ofNullable(porId.get(id));
    }

    public Envio obtenerObligatorio(String id) {
        return buscarPorId(id)
                .orElseThrow(() -> new IllegalArgumentException("envío obligatorio no encontrado: " + id));
    }
}
```

**Error común:** `optional.get()` sin verificar. Aquí usamos `map(...).orElse(...)` o `orElseThrow(...)` con mensaje útil. `Optional` no elimina el caso ausente; lo hace visible.

#### `ReporteEnvios.java`

Este archivo concentra streams, collectors, pereza, orden, paralelismo seguro e inseguro. La regla es simple: entra una colección, sale un valor o colección nueva; no hay impresión ni persistencia.

```java
package com.aurora.funcional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/** Cálculos puros sobre envíos. No imprime ni guarda: devuelve datos. */
public final class ReporteEnvios {
    private ReporteEnvios() {}

    public static List<String> etiquetasValidas(List<Envio> envios, Predicate<Envio> regla, Function<Envio, String> etiqueta) {
        return envios.stream()
                .filter(regla)
                .map(etiqueta)
                .toList();
    }

    public static List<String> paradasNormalizadas(List<Envio> envios) {
        return envios.stream()
                .flatMap(e -> e.paradas().stream())
                .map(String::trim)
                .filter(p -> !p.isBlank())
                .map(String::toUpperCase)
                .distinct()
                .sorted()
                .toList();
    }

    public static Optional<Envio> masCaro(List<Envio> envios) {
        return envios.stream().max(Comparator.comparing(Envio::costo));
    }

    public static long totalEntregados(List<Envio> envios) {
        return envios.stream().filter(e -> e.estado() == EstadoEnvio.ENTREGADO).count();
    }

    public static BigDecimal sumaCostos(List<Envio> envios) {
        return envios.stream()
                .map(Envio::costo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static Map<EstadoEnvio, List<Envio>> porEstado(List<Envio> envios) {
        return envios.stream().collect(Collectors.groupingBy(Envio::estado));
    }

    public static Map<String, BigDecimal> costoPorDestino(List<Envio> envios) {
        return envios.stream().collect(Collectors.groupingBy(
                Envio::destino,
                LinkedHashMap::new,
                Collectors.reducing(BigDecimal.ZERO, Envio::costo, BigDecimal::add)
        ));
    }

    public static String resumenIds(List<Envio> envios) {
        return envios.stream().map(Envio::id).collect(Collectors.joining(", ", "[", "]"));
    }

    public static Set<String> destinosOrdenados(List<Envio> envios) {
        return envios.stream()
                .map(Envio::destino)
                .collect(Collectors.toCollection(TreeSet::new));
    }

    // Demuestra orden: normalizar antes de validar evita rechazos falsos
    public static List<String> destinosValidosNormalizados(List<String> destinosCrudos) {
        Predicate<String> permitido = d -> Set.of("BOG", "MED", "CALI").contains(d);
        return destinosCrudos.stream()
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(permitido)
                .toList();
    }

    // Pipeline perezoso: no ejecuta hasta terminal
    public static long contarConTraza(Stream<Integer> valores, List<String> traza) {
        return valores
                .filter(v -> {
                    traza.add("filter:" + v);
                    return v % 2 == 0;
                })
                .map(v -> {
                    traza.add("map:" + v);
                    return v * 10;
                })
                .count();
    }

    // Paralelo seguro: sin estado compartido mutable
    public static BigDecimal sumaParalelaSegura(List<BigDecimal> costos) {
        return costos.parallelStream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Demuestra problema: suma con estado compartido (solo para test educativo)
    public static long sumaParalelaInsegura(List<Integer> valores) {
        final int[] caja = {0}; // mutable compartido: race condition
        valores.parallelStream().forEach(v -> caja[0] += v);
        return caja[0];
    }
}
```

Hay dos detalles pedagógicos deliberados. `contarConTraza` usa una lista externa solo para observar la pereza en un test controlado; no es el patrón recomendado para negocio. `sumaParalelaInsegura` existe para mostrar por qué el estado mutable compartido rompe en paralelo; en producción esa versión no debe existir.

#### `EventosEnvio.java`

La Flow API implementa Reactive Streams en Java estándar. El punto clave es backpressure: el suscriptor pide `n` elementos con `request(n)`. El publicador no debe empujar sin límite a un consumidor lento.

```java
package com.aurora.funcional;

import java.util.concurrent.Flow;
import java.util.concurrent.SubmissionPublisher;
import java.util.concurrent.TimeUnit;

/** Flow API: publisher emite eventos; subscriber controla demanda con request(n). */
public final class EventosEnvio {
    private EventosEnvio() {}

    public static final class Evento {
        private final String id;
        private final String mensaje;
        public Evento(String id, String mensaje) { this.id = id; this.mensaje = mensaje; }
        public String id() { return id; }
        public String mensaje() { return mensaje; }
        @Override public String toString() { return id + ":" + mensaje; }
    }

    public static class SuscriptorAuditor implements Flow.Subscriber<Evento> {
        private final int lote;
        private final StringBuilder log;
        private Flow.Subscription subscription;
        private int recibidos;

        public SuscriptorAuditor(int lote, StringBuilder log) {
            this.lote = lote;
            this.log = log;
        }

        @Override
        public void onSubscribe(Flow.Subscription subscription) {
            this.subscription = subscription;
            subscription.request(lote); // backpressure: pide N
        }

        @Override
        public void onNext(Evento item) {
            recibidos++;
            log.append("NEXT:").append(item).append('\n');
            if (recibidos % lote == 0) {
                subscription.request(lote);
            }
        }

        @Override
        public void onError(Throwable throwable) {
            log.append("ERROR:").append(throwable.getMessage()).append('\n');
        }

        @Override
        public void onComplete() {
            log.append("DONE").append('\n');
        }
    }

    public static String demo() throws InterruptedException {
        StringBuilder log = new StringBuilder();
        SubmissionPublisher<Evento> publisher = new SubmissionPublisher<>();
        try (publisher) {
            publisher.subscribe(new SuscriptorAuditor(2, log));
            publisher.submit(new Evento("E1", "creado"));
            publisher.submit(new Evento("E2", "validado"));
            publisher.submit(new Evento("E3", "enviado"));
        }
        // close() es llamado por try-with-resources; esperamos entrega
        Thread.sleep(200);
        return log.toString();
    }
}
```

**Límite:** Flow es útil para entender backpressure en el JDK estándar. En producción, librerías como Reactor o Mutiny aportan operadores, scheduling y manejo de errores más ricos; la idea de demanda controlada es la misma.

#### `App.java`

`App` es el composition root. Aquí se conectan datos, reglas puras y efectos. La consola es un efecto; por eso el `Consumer<String>` se inyecta con `System.out::println`.

```java
package com.aurora.funcional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

public final class App {
    public static void main(String[] args) throws Exception {
        List<Envio> envios = datos();

        // 1-3: interfaces funcionales core + composición
        ReglaEnvio regla = ReglasEnvio.pesoMaximo(new BigDecimal("10")).and(ReglasEnvio.noFallido());
        Predicate<Envio> valido = regla.asPredicate();
        Function<Envio, String> etiqueta = ReglasEnvio.etiqueta();
        Consumer<String> auditor = ReglasEnvio.auditor(System.out::println);
        Supplier<String> idNuevo = ReglasEnvio.generadorId("TMP", 99);
        System.out.println("ID=" + idNuevo.get());
        ReporteEnvios.etiquetasValidas(envios, valido, etiqueta).forEach(auditor);
        System.out.println("REGLA=" + regla.motivo());

        // 2,5: BiFunction / operadores
        BiFunction<BigDecimal, BigDecimal, BigDecimal> tarifa = ReglasEnvio.tarifaConImpuesto();
        UnaryOperator<BigDecimal> descuento = ReglasEnvio.aplicarDescuento(new BigDecimal("0.10"));
        BinaryOperator<BigDecimal> mayor = ReglasEnvio.mayorCosto();
        BigDecimal total = descuento.apply(tarifa.apply(new BigDecimal("100"), new BigDecimal("0.19")));
        System.out.println("TOTAL=" + ReglasEnvio.normalizarYRedondear().apply(total));
        System.out.println("MAYOR=" + mayor.apply(new BigDecimal("10"), new BigDecimal("25")));

        // 4: laziness
        List<String> traza = new ArrayList<>();
        long cuenta = ReporteEnvios.contarConTraza(List.of(1, 2, 3, 4, 5).stream(), traza);
        System.out.println("CUENTA=" + cuenta);
        System.out.println("TRAZA=" + traza.size());

        // 6: method references
        List<String> destinos = envios.stream().map(Envio::destino).distinct().sorted().toList();
        System.out.println("DESTINOS=" + destinos);

        // 7: Optional
        EnvioRepository repo = new EnvioRepository(Map.of("A1", envios.get(0)));
        System.out.println("OPT=" + repo.buscarPorId("A1").map(Envio::id).orElse("NA"));
        System.out.println("MISS=" + repo.buscarPorId("ZZ").map(Envio::id).orElse("NA"));

        // 8-10: streams intermedios/terminales/collectors
        System.out.println("PARADAS=" + ReporteEnvios.paradasNormalizadas(envios));
        System.out.println("MAS_CARO=" + ReporteEnvios.masCaro(envios).map(Envio::id).orElse("NA"));
        System.out.println("ENTREGADOS=" + ReporteEnvios.totalEntregados(envios));
        System.out.println("SUMA=" + ReporteEnvios.sumaCostos(envios));
        System.out.println("POR_ESTADO=" + ReporteEnvios.porEstado(envios).keySet());
        System.out.println("COSTO_DESTINO=" + ReporteEnvios.costoPorDestino(envios));
        System.out.println("IDS=" + ReporteEnvios.resumenIds(envios));
        System.out.println("DEST_SET=" + ReporteEnvios.destinosOrdenados(envios));
        System.out.println("NORMALIZADOS=" + ReporteEnvios.destinosValidosNormalizados(List.of(" bog ", "med", "XX")));

        // 11: paralelo seguro
        System.out.println("PARALELA=" + ReporteEnvios.sumaParalelaSegura(envios.stream().map(Envio::costo).toList()));

        // 12: pureza - cálculo separado de efecto
        String reporte = "REPORTE:" + ReporteEnvios.resumenIds(envios);
        auditor.accept(reporte); // efecto en el borde

        // 13: Flow API
        System.out.print(EventosEnvio.demo());
    }

    static List<Envio> datos() {
        return List.of(
                new Envio("A1", "BOG", new BigDecimal("2.5"), new BigDecimal("10000"), EstadoEnvio.ENTREGADO, List.of("Bodega", "BOG")),
                new Envio("A2", "MED", new BigDecimal("12.0"), new BigDecimal("25000"), EstadoEnvio.PENDIENTE, List.of("Bodega", "MED", "med")),
                new Envio("A3", "BOG", new BigDecimal("1.0"), new BigDecimal("8000"), EstadoEnvio.FALLIDO, List.of("BOG")),
                new Envio("A4", "CALI", new BigDecimal("3.0"), new BigDecimal("12000"), EstadoEnvio.EN_RUTA, List.of("BOG", "CALI"))
        );
    }
}
```

#### `FuncionalTest.java`

Los tests fijan el comportamiento. No prueban la consola; prueban funciones puras y contratos. Esa es la ventaja de separar cálculo de efectos.

```java
package com.aurora.funcional;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class FuncionalTest {

    private List<Envio> datos() {
        return List.of(
                new Envio("A1", "BOG", new BigDecimal("2.5"), new BigDecimal("10000"), EstadoEnvio.ENTREGADO, List.of("Bodega", "BOG")),
                new Envio("A2", "MED", new BigDecimal("12.0"), new BigDecimal("25000"), EstadoEnvio.PENDIENTE, List.of("Bodega", "MED")),
                new Envio("A3", "BOG", new BigDecimal("1.0"), new BigDecimal("8000"), EstadoEnvio.FALLIDO, List.of("BOG"))
        );
    }

    @Test
    void componeReglasYTransforma() {
        ReglaEnvio regla = ReglasEnvio.pesoMaximo(new BigDecimal("10")).and(ReglasEnvio.noFallido());
        Function<Envio, String> etiqueta = ReglasEnvio.etiqueta();
        List<String> out = ReporteEnvios.etiquetasValidas(datos(), regla.asPredicate(), etiqueta);
        assertEquals(List.of("A1@BOG"), out);
        assertEquals("peso <= 10 Y no fallido", regla.motivo());
    }

    @Test
    void biFunctionYOperadores() {
        BigDecimal total = ReglasEnvio.tarifaConImpuesto().apply(new BigDecimal("100"), new BigDecimal("0.19"));
        assertEquals(new BigDecimal("119.00"), ReglasEnvio.normalizarYRedondear().apply(total));
        assertEquals(new BigDecimal("90.00"), ReglasEnvio.aplicarDescuento(new BigDecimal("0.10")).apply(new BigDecimal("100")));
        assertEquals(new BigDecimal("25"), ReglasEnvio.mayorCosto().apply(new BigDecimal("10"), new BigDecimal("25")));
    }

    @Test
    void optionalExplicito() {
        EnvioRepository repo = new EnvioRepository(Map.of("A1", datos().get(0)));
        assertEquals("A1", repo.buscarPorId("A1").map(Envio::id).orElse("NA"));
        assertEquals("NA", repo.buscarPorId("ZZ").map(Envio::id).orElse("NA"));
        assertThrows(IllegalArgumentException.class, () -> repo.obtenerObligatorio("ZZ"));
    }

    @Test
    void streamEsPerezosoYSeConsumeUnaVez() {
        List<String> traza = new ArrayList<>();
        long c = ReporteEnvios.contarConTraza(List.of(1, 2, 3, 4).stream(), traza);
        assertEquals(2, c);
        assertFalse(traza.isEmpty());
        Stream<Integer> s = Stream.of(1, 2);
        s.count();
        assertThrows(IllegalStateException.class, s::count);
    }

    @Test
    void collectorsYAplanado() {
        assertEquals(List.of("BODEGA", "BOG", "MED"), ReporteEnvios.paradasNormalizadas(datos()));
        assertEquals(Set.of("BOG", "MED"), ReporteEnvios.destinosOrdenados(datos()));
        assertEquals("[A1, A2, A3]", ReporteEnvios.resumenIds(datos()));
        assertEquals(new BigDecimal("43000"), ReporteEnvios.sumaCostos(datos()));
    }

    @Test
    void normalizaAntesDeValidar() {
        assertEquals(List.of("BOG", "MED"), ReporteEnvios.destinosValidosNormalizados(List.of(" bog ", "med", "xx")));
    }

    @Test
    void flowEntregaEventos() throws Exception {
        String log = EventosEnvio.demo();
        assertTrue(log.contains("NEXT:E1:creado"));
        assertTrue(log.contains("NEXT:E3:enviado"));
        assertTrue(log.contains("DONE"));
    }
}
```

## Ejecución real

Comandos ejecutados desde `/tmp/opencode/aurora-m20` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

Salida real de `./gradlew -q run`:

```text
ID=TMP-99
A1@BOG
A4@CALI
REGLA=peso <= 10 Y no fallido
TOTAL=107.10
MAYOR=25
CUENTA=2
TRAZA=7
DESTINOS=[BOG, CALI, MED]
OPT=A1
MISS=NA
PARADAS=[BODEGA, BOG, CALI, MED]
MAS_CARO=A2
ENTREGADOS=1
SUMA=55000
POR_ESTADO=[ENTREGADO, EN_RUTA, PENDIENTE, FALLIDO]
COSTO_DESTINO={BOG=18000, MED=25000, CALI=12000}
IDS=[A1, A2, A3, A4]
DEST_SET=[BOG, CALI, MED]
NORMALIZADOS=[BOG, MED]
PARALELA=55000
REPORTE:[A1, A2, A3, A4]
NEXT:E1:creado
NEXT:E2:validado
NEXT:E3:enviado
DONE
```

`./gradlew -q test` pasó con 7 tests, 0 fallas. El orden de líneas de Flow puede depender de scheduling, pero en esta ejecución salió `E1`, `E2`, `E3`, `DONE`.

## Conceptos cubiertos, en el orden del track

### Tema 1: Las cuatro formas: Predicate, Function, Consumer y Supplier · Básico · 30 min

Las cuatro interfaces base responden preguntas distintas. `Predicate<T>` decide: recibe `T` y devuelve boolean. `Function<T,R>` transforma: recibe `T` y devuelve `R`. `Consumer<T>` ejecuta un efecto: recibe `T` y no devuelve valor. `Supplier<T>` produce: no recibe entrada y devuelve `T`.

En `ReglasEnvio`, `pesoMaximo` construye una regla que se comporta como predicado; `etiqueta` transforma un `Envio` a `String`; `generadorId` produce IDs; `auditor` recibe un destino de salida. La clave es el borde: el cálculo no imprime; `App` inyecta `System.out::println`.

**Error común:** meter `System.out.println` dentro de un `Function` o `Predicate`. Funciona, pero hace impura una operación que después querrás probar o reutilizar.

### Tema 2: Function y BiFunction: transformar uno o dos datos · Básico · 35 min

`Function<T,R>` modela una transformación con una entrada. `BiFunction<T,U,R>` la modela con dos entradas. En el proyecto, `etiqueta()` es `Function<Envio,String>` y `tarifaConImpuesto()` es `BiFunction<BigDecimal,BigDecimal,BigDecimal>`.

Usa `BiFunction` cuando las dos entradas son independientes y el resultado es un cálculo claro. Si el par `(base, impuesto)` empieza a viajar por todo el sistema con reglas propias, conviene modelarlo como objeto (`Tarifa`, `PoliticaImpuesto`) en vez de seguir pasando dos valores sueltos.

### Tema 3: Componer sin anidar: andThen, compose, negate y reglas encadenadas · Intermedio · 40 min

Componer evita anidamiento. `andThen` aplica primero la función actual y luego la siguiente; `compose` lo hace al revés. En predicados, `and`, `or` y `negate` construyen reglas legibles.

En `ReglaEnvio.and`, el motivo se combina junto con la condición. Eso importa en negocio: no basta con saber que un envío fue rechazado; también importa por qué. `normalizarYRedondear()` muestra `andThen` con dos `UnaryOperator<BigDecimal>`.

**Borde:** la composición debe seguir siendo legible. Si encadenas diez funciones sin nombres, un `for` bien escrito puede ser más claro.

### Tema 4: Streams como composición: pereza, orden y efectos que se esconden · Intermedio · 40 min

Un stream es un pipeline: fuente, operaciones intermedias y operación terminal. Las intermedias son perezosas. Nada se ejecuta hasta que una terminal (`count`, `collect`, `forEach`, `reduce`) lo exige.

`contarConTraza` demuestra esto: el test observa que hay traza solo al ejecutar la terminal. También se ve el orden: normalizar antes de filtrar evita rechazar `" bog "` por espacios/minúsculas.

**Error común:** usar `peek` para lógica de negocio o asumir que un stream es una colección reutilizable. Un stream consumido lanza `IllegalStateException`.

### Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo · Intermedio · 35 min

`UnaryOperator<T>` es una especialización de `Function<T,T>`; `BinaryOperator<T>` lo es de `BiFunction<T,T,T>`. Se usan cuando el tipo no cambia: descuento sobre monto, normalización de monto, elegir el mayor costo.

En el proyecto, `aplicarDescuento` devuelve un operador que conserva `BigDecimal`. `mayorCosto()` combina dos costos del mismo tipo. La ventaja es semántica: el nombre del tipo ya comunica que no hay conversión a otro dominio.

### Tema 6: Referencias a métodos: escribir la operación sin repetirla · Intermedio · 40 min

Una referencia a método es una lambda con nombre. `Envio::destino` equivale a `e -> e.destino()`. `System.out::println` equivale a `s -> System.out.println(s)`.

Se usan cuando hacen el código más claro. No se fuerzan cuando la lambda explica mejor el intento, por ejemplo una transformación con varias operaciones o con validación local. En `App`, `map(Envio::destino)` y `auditor.accept(...)` son legibles porque el método nombrado ya dice lo que pasa.

### Tema 7: Optional: buscar un envío que puede no existir · Intermedio · 40 min

`Optional<T>` representa ausencia explícita en el retorno. `EnvioRepository.buscarPorId` devuelve `Optional<Envio>`; el llamador decide: valor por defecto, mapear, o fallar con error claro.

No es buena idea usar `Optional` en campos de entidades, parámetros obligatorios o setters; agrega ruido y no reemplaza un buen modelo. El caso correcto es consulta/búsqueda donde “no hay” es normal.

**Error común:** `get()` sin comprobar. Preferir `orElse`, `orElseGet`, `orElseThrow`, `map`, `filter`.

### Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar · Intermedio · 45 min

Las intermedias construyen el pipeline. `filter` elimina; `map` transforma; `flatMap` aplana; `distinct` elimina duplicados; `sorted` ordena. En `paradasNormalizadas` se ve la cadena completa: de cada envío salen varias paradas, se normalizan, se deduplican y se ordenan.

El orden importa por corrección y costo. Normalizar antes de `distinct` evita que `"BOG"` y `"bog"` cuenten como distintos. Filtrar antes de mapear puede evitar trabajo innecesario.

### Tema 9: Streams terminales: encontrar, contar y combinar resultados · Intermedio · 45 min

La terminal produce resultado o efecto. `count` cuenta; `max` busca máximo; `reduce` combina; `collect` materializa; `forEach` aplica un efecto. `ReporteEnvios` usa `count`, `max`, `reduce` y `collect`.

`reduce(BigDecimal.ZERO, BigDecimal::add)` es una reducción segura cuando la operación es asociativa y no hay mutación compartida. Para sumas simples está bien; para lógica compleja, un collector o un bucle explícito pueden ser más legibles.

### Tema 10: Collectors: formar listas, mapas, grupos y texto · Avanzado · 50 min

Collectors convierten un stream en una estructura final. `toList()` crea lista; `joining` arma texto; `groupingBy` agrupa; `toCollection(TreeSet::new)` elige implementación; `reducing` combina dentro de un grupo.

En `costoPorDestino` se usa `groupingBy` con `LinkedHashMap` para mantener orden de inserción y `reducing` para sumar costos por destino. Elegir collector es elegir contrato de salida: orden, mutabilidad, duplicados y costo.

### Tema 11: Streams paralelos: comparar antes de acelerarlos · Avanzado · 50 min

`parallelStream()` puede acelerar CPU-bound sobre datos grandes y operaciones independientes. También puede empeorar: overhead de split/merge, contención, orden no determinista y bugs por estado compartido.

`sumaParalelaSegura` usa `reduce` sin mutación compartida. `sumaParalelaInsegura` muestra el anti-patrón: un array mutable compartido produce race condition. No lo uses en producción. La regla práctica es medir con datos reales y mantener la operación pura.

**Nota de verificación honesta:** no incluí un benchmark JMH en esta ejecución porque requiere dependencia/configuración adicional; la diferencia de rendimiento se trata como hipótesis a medir, no como promesa.

### Tema 12: Pureza y efectos: calcular separado de guardar o imprimir · Avanzado · 45 min

Una función pura, para la misma entrada, devuelve el mismo resultado y no modifica estado externo. Eso simplifica tests. `ReporteEnvios` es puro; `App` aplica efectos (`println`) al final.

No todo debe ser puro: persistir, loguear y publicar eventos son efectos necesarios. El diseño sano los empuja al borde. Así, si mañana cambias consola por logger o por una API, el cálculo no cambia.

### Tema 13: Flow API: publicar datos con demanda y cierre · Intermedio · 40 min

Flow API es la implementación estándar de Reactive Streams en `java.util.concurrent`. `Publisher` emite, `Subscriber` recibe, `Subscription` conecta ambos y permite `request(n)`/`cancel()`. El backpressure evita inundar consumidores lentos.

En `EventosEnvio.demo`, el suscriptor pide 2 elementos y luego vuelve a pedir. `onComplete()` marca el cierre normal. En sistemas reales, además de backpressure hay que considerar errores, cancelación, scheduling, bloqueo en callbacks y política de buffer.

**Diagrama (animdiagram, animado con fallback estático):** [Flow API: backpressure por demanda](/visuals/temas/java/modulo-20-flow.html)

Lectura: el Subscriber controla la demanda con `request(n)`. El Publisher no debe inundarlo; con reduced motion el diagrama queda estático.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `IllegalStateException: stream has already been operated upon or closed` | Reusar un stream después de una terminal | Revisar variable `Stream` compartida | Crear un nuevo stream desde la fuente |
| Resultado incorrecto en `parallelStream()` | Estado mutable compartido o operación no asociativa | Comparar ejecución secuencial vs paralela; revisar side effects | Usar `reduce`/collectors seguros, sin mutación compartida |
| `NoSuchElementException` o null inesperado | `Optional.get()` o ausencia no modelada | Buscar `get()` y retornos null | `orElseThrow` con contexto, `map/orElse`, o modelar ausencia |
| Regla difícil de entender | Composición excesiva o lambdas opacas | Leer pipeline como frase; si no se entiende, está mal nombrado | Extraer método, nombrar función, o usar `for` claro |
| Collector falla o pierde orden | Collector no acorde al contrato | Revisar tipo de `Map/Set` y orden esperado | Usar `LinkedHashMap`, `TreeSet`, `toCollection` |

## Checklist de verificación

- [ ] El proyecto compila con Java 25 toolchain.
- [ ] `./gradlew -q test` pasa.
- [ ] `./gradlew -q run` muestra etiquetas, totales, Optional, collectors y eventos Flow.
- [ ] Las funciones de cálculo no hacen I/O.
- [ ] Los streams no se reutilizan.
- [ ] `parallelStream()` solo se usa con operación segura y justificación.

## Puente al siguiente módulo

El siguiente paso es salir del código puro y mirar el contrato público de una librería: qué cambia pueden hacer tus consumidores sin romperse, cómo afecta el borrado de genéricos y cómo verificar compatibilidad. Eso es Java de API pública y evolución, donde el estilo funcional también debe respetar compatibilidad.
