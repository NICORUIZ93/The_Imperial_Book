# Módulo 20: Java funcional — interfaces que componen comportamiento

Cuando un flujo de envíos crece, el código imperativo suele mezclar tres cosas distintas: decidir si un envío es válido, transformar datos para un reporte y ejecutar efectos como imprimir, guardar o publicar eventos. El resultado funciona, pero es frágil: probar una regla exige levantar todo el flujo, cambiar un formato rompe una validación, y un `for` con banderas oculta la intención de negocio.

Java no te obliga a elegir entre objetos y funciones. La opción útil es combinar ambos: objetos para modelar el dominio y funciones para pasar comportamiento pequeño y comprobable. En este módulo vas a construir `tienda-aurora-java-m20`, un mini-módulo de envíos donde las reglas se componen, los cálculos se prueban sin I/O, y los efectos quedan en el borde.

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2 con toolchain Java 25, Gradle 9.9.1.
Con él se capturaron las salidas del proyecto Gradle (sección «Verificación real»).

**Entorno de las salidas nuevas de los temas (2026-11-24):** Linux x86_64 con 2 núcleos, OpenJDK 25.0.5.1, sin
Gradle. Los programas de un solo archivo de los temas se ejecutan con `java Archivo.java` y sus transcripciones son
literales. Los mensajes de error del compilador se capturaron con `javac` 25.0.5.1. Los programas también se
ejecutaron con OpenJDK 21.0.13.1 y dieron la misma salida. Las pruebas JUnit no se ejecutaron en este entorno.

## Apertura del módulo

#### Objetivos del módulo
Al terminar este módulo podrás:
- elegir entre `Predicate`, `Function`, `BiFunction`, `Consumer`, `Supplier`, `UnaryOperator` y `BinaryOperator` por la forma de entrada y salida;
- componer funciones y reglas con `andThen`, `compose`, `and`, `or` y `negate` sin anidar llamadas;
- predecir cuándo y en qué orden se ejecuta un stream, y detectar efectos que nunca ocurren;
- encadenar `Optional` con `map`, `flatMap` y `filter` sin `Optional<Optional<…>>`;
- agrupar resultados con `groupingBy`, collectors *downstream* y mapas con orden explícito;
- separar cálculos puros de efectos y demostrar por qué el estado compartido rompe un stream paralelo;
- controlar la demanda de un `Flow.Subscriber` con `request(n)` y esperar su cierre sin temporizadores.

#### Esquema del módulo
1. Temas 1, 2 y 5 — las interfaces funcionales del JDK por su forma.
2. Tema 3 — composición de funciones y predicados.
3. Temas 4, 8, 9 y 10 — streams como composición: pereza, intermedias, terminales y collectors.
4. Temas 6 y 7 — referencias a métodos y `Optional` encadenado.
5. Temas 11 y 12 — paralelismo, pureza y efectos en el borde.
6. Tema 13 — Flow API y demanda explícita.
7. Proyecto `tienda-aurora-java-m20`, con su verificación real al final del módulo.

#### Qué necesitas saber antes
Estos términos ya tienen ficha y aquí se citan, no se redefinen: lambda, interfaz funcional, referencia a método,
`Stream`, operación intermedia y terminal, `filter`, `map`, `flatMap`, `reduce`, `collect` y Collectors (Java,
Módulo 4, Tema 1); `Optional`, `Optional.of`, `orElse`, `orElseThrow` y `Supplier` (Java, Módulo 4, Tema 2);
referencia a constructor, stream paralelo, ForkJoinPool común, operación asociativa y efecto secundario (Java,
Módulo 4, Tema 4); `record`, objeto de valor y copia defensiva (Java, Módulo 1, Tema 5); interfaz y método `default`
(Java, Módulo 1, Tema 3); `HashMap`, `LinkedHashMap`, `TreeMap` y `TreeSet` (Java, Módulo 2, Tema 1); `Comparator`
(Java, Módulo 2, Tema 5); `CompletableFuture` (Java, Módulo 5, Tema 2); estado mutable compartido y operación atómica
(Java, Módulo 5, Tema 4); condición de carrera (Fundamentos, Módulo 5, Tema 2); escala de `BigDecimal` y Strategy
(Java, Módulo 12, Tema 2).

## Visual del módulo

**Visual:** [Interfaces funcionales: rol de cada una y composición en Flow](/visuals/temas/java/modulo-20-interfaces-funcionales.html)

Lectura: Cada interfaz funcional expresa una forma de entrada/salida; el flujo compone reglas y efectos.

## Prerrequisitos y bootstrap

Necesitas JDK 25 y Gradle 9.x. Verifica:

```bash
java -version
gradle --version
```

Crea el proyecto desde cero:

```bash
mkdir -p tienda-aurora-java-m20/src/main/java/com/aurora/funcional
mkdir -p tienda-aurora-java-m20/src/test/java/com/aurora/funcional
cd tienda-aurora-java-m20
gradle wrapper --gradle-version 9.9.1
```

Estructura objetivo:

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

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m20"
```

#### `build.gradle.kts`

Java 25 por toolchain, JUnit 5 para pruebas y `-Werror` para no ignorar warnings.

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

## Código completo del proyecto

Todos los archivos Java que se compilan y ejecutan están publicados aquí completos, con `package`, imports y cuerpo. Los temas posteriores se refieren a estos archivos; no hay fragmentos que debas pegar a mano.

#### `EstadoEnvio.java`

```java
package com.aurora.funcional;

public enum EstadoEnvio {
    PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO
}
```

#### `Envio.java`

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

`List.copyOf` es una copia defensiva: quien construya el envío no puede mutar después la lista interna. Esa inmutabilidad hace que pasar `Envio` por streams y funciones sea predecible.

#### `EnvioRepository.java`

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

#### `ReglaEnvio.java`

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

#### `ReglasEnvio.java`

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

#### `ReporteEnvios.java`

```java
package com.aurora.funcional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

`sumaParalelaInsegura` se conserva como contraejemplo: nunca debe usarse para calcular dinero. `sumaParalelaSegura` usa `reduce` con identidad y operación asociativa, sin estado compartido.

#### `EventosEnvio.java`

```java
package com.aurora.funcional;

import java.util.concurrent.CompletableFuture;
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
        private final CompletableFuture<Void> terminado;
        private Flow.Subscription subscription;
        private int recibidos;

        public SuscriptorAuditor(int lote, StringBuilder log, CompletableFuture<Void> terminado) {
            this.lote = lote;
            this.log = log;
            this.terminado = terminado;
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
            terminado.completeExceptionally(throwable);
        }

        @Override
        public void onComplete() {
            log.append("DONE").append('\n');
            terminado.complete(null); // señala entrega completa: sin Thread.sleep
        }
    }

    public static String demo() throws Exception {
        StringBuilder log = new StringBuilder();
        CompletableFuture<Void> terminado = new CompletableFuture<>();
        try (SubmissionPublisher<Evento> publisher = new SubmissionPublisher<>()) {
            publisher.subscribe(new SuscriptorAuditor(2, log, terminado));
            publisher.submit(new Evento("E1", "creado"));
            publisher.submit(new Evento("E2", "validado"));
            publisher.submit(new Evento("E3", "enviado"));
        }
        terminado.get(2, TimeUnit.SECONDS); // espera al evento real, no a un temporizador
        return log.toString();
    }
}
```

La espera usa `terminado.get(2, TimeUnit.SECONDS)`, liberada por `onComplete()` o `onError()`. No hay `Thread.sleep(200)`: un temporizador podía devolver la log antes de que el suscriptor terminara y hacía la prueba no determinista. El test llama a `demo()` dos veces y espera exactamente la misma salida.

#### `App.java`

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
        assertEquals("peso <= 10 Y no fallido", regla.motivo());
        assertEquals(List.of("A1@BOG"), out);
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
        String esperado = "NEXT:E1:creado\nNEXT:E2:validado\nNEXT:E3:enviado\nDONE\n";
        assertEquals(esperado, EventosEnvio.demo());
        assertEquals(esperado, EventosEnvio.demo()); // determinista: sin sleeps
    }
}
```

## Los 13 temas aplicados al proyecto

### Tema 1: Las cuatro formas: Predicate, Function, Consumer y Supplier · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- elegir entre `Predicate`, `Function`, `Consumer` y `Supplier` mirando qué entra y qué sale;
- escribir una función de orden superior que reciba una regla y una transformación;
- cambiar el destino de un efecto (consola o lista) sin tocar el cálculo;
- leer los errores `Unexpected @FunctionalInterface annotation` y `bad return type in lambda expression`.

**Conceptos clave:** Predicate, Function, Consumer, función de orden superior, @FunctionalInterface

Ya los conoces y no se repiten: lambda, interfaz funcional y referencia a método (Java, Módulo 4, Tema 1);
`Supplier` (Java, Módulo 4, Tema 2); `record` (Java, Módulo 1, Tema 5); `enum` (Java, Módulo 0, Tema 6).

#### El problema
Tienda Aurora tiene cuatro envíos. Debe decidir cuáles son válidos, convertir cada válido en una etiqueta
`id@destino`, imprimir las etiquetas y generar un identificador temporal. Hoy todo vive en un `for` con `if` y
`System.out.println`. Para probar la regla tienes que leer la consola. ¿Cómo separas decidir, transformar, producir y
publicar?

#### Glosario del tema

**Predicate**
- **Definición técnica:** `java.util.function.Predicate<T>`, interfaz funcional con el método `boolean test(T t)`; trae los métodos `default` `and`, `or` y `negate`.
- **En palabras sencillas:** una pregunta de sí o no sobre un dato: «¿este envío es válido?».
- **Dónde se rompe la comparación:** la pregunta no explica por qué dijo «no»; para eso el proyecto usa `ReglaEnvio`, que agrega `motivo()`.
- **Ejemplo:** `Predicate<Envio> valido = e -> e.pesoKg() <= 10 && e.estado() != Estado.FALLIDO;` (línea 33 del Problema resuelto 1.1) da `A2 válido? false`.
- **Error típico:** devolver otra cosa que `boolean`: `Predicate<String> valido = id -> id.trim();` produce `incompatible types: bad return type in lambda expression`.

**Function**
- **Definición técnica:** `java.util.function.Function<T,R>`, interfaz funcional con el método `R apply(T t)`: recibe un valor de tipo `T` y devuelve uno de tipo `R`.
- **En palabras sencillas:** una máquina que recibe una pieza y entrega otra, quizá de otra clase.
- **Dónde se rompe la comparación:** una máquina puede guardar estado entre piezas; una buena `Function` no debería.
- **Ejemplo:** `Function<Envio, String> etiqueta = e -> e.id() + "@" + e.destino();` (línea 34) convierte `A1` en `A1@BOG`.
- **Error típico:** usar `Function<Envio, Void>` para «hacer algo» con el envío; si no devuelves nada, la forma correcta es `Consumer`.

**Consumer**
- **Definición técnica:** `java.util.function.Consumer<T>`, interfaz funcional con el método `void accept(T t)`: recibe un valor y no devuelve nada.
- **En palabras sencillas:** un buzón: recibe la carta y no responde; lo que importa es lo que hace con ella.
- **Dónde se rompe la comparación:** el buzón puede ser de mentira: en una prueba, el `Consumer` guarda en una lista en vez de imprimir.
- **Ejemplo:** `Consumer<String> consola = System.out::println;` (línea 36) imprime; `capturadas::add` (línea 43) guarda en memoria.
- **Error típico:** poner la lógica de negocio dentro del `Consumer`; así el cálculo vuelve a mezclarse con el efecto.

**función de orden superior**
- **Definición técnica:** método o función que recibe otra función como parámetro, la devuelve como resultado, o ambas cosas.
- **En palabras sencillas:** una receta que deja en blanco un paso («aquí va tu regla») y lo recibe al usarla.
- **Dónde se rompe la comparación:** en Java la «función» que recibes es un objeto de una interfaz funcional, no una función suelta.
- **Ejemplo:** `etiquetasValidas(List<Envio>, Predicate<Envio>, Function<Envio, String>)` (líneas 15–24) sirve para cualquier regla y cualquier etiqueta.
- **Error típico:** recibir un `boolean` ya calculado en lugar del `Predicate`; el método pierde la capacidad de evaluar cada envío.

**`@FunctionalInterface`**
- **Definición técnica:** anotación de `java.lang` que pide al compilador comprobar que la interfaz tiene exactamente un método abstracto.
- **En palabras sencillas:** un sello que dice «aquí cabe una lambda»; si alguien agrega otro método abstracto, el compilador protesta.
- **Dónde se rompe la comparación:** el sello no es obligatorio: una interfaz con un solo método abstracto ya acepta lambdas sin él.
- **Ejemplo:** el proyecto no la pone en `ReglaEnvio` porque tiene `test` y `motivo`; por eso crea las reglas con la fábrica `ReglaEnvio.de`.
- **Error típico:** ponerla en una interfaz con dos métodos abstractos: `error: Unexpected @FunctionalInterface annotation`.

#### ► CÓMO FUNCIONA

El JDK agrupa el comportamiento más común en cuatro formas. La diferencia no es sintáctica; es el contrato:
`Predicate<T>` devuelve booleano, `Function<T,R>` transforma, `Consumer<T>` recibe un valor y no devuelve nada, y
`Supplier<T>` produce un valor sin entrada.

En el proyecto, `ReglaEnvio` envuelve un `Predicate<Envio>` con un motivo legible, `ReglasEnvio.etiqueta()` es la
`Function`, `ReglasEnvio.auditor(...)` devuelve el `Consumer` inyectado y `ReglasEnvio.generadorId(...)` es el
`Supplier`. Salida verificada: `ID=TMP-99`, `A1@BOG`, `A4@CALI`, `REGLA=peso <= 10 Y no fallido`. `A2` se excluye
por peso y `A3` por estado fallido.

Para elegir, haz dos preguntas: ¿recibe un dato? ¿devuelve algo? La respuesta te da la forma.

```mermaid
flowchart TD
  Q1{"¿Recibe un dato?"} -->|"no"| S["Supplier<br/>T get()"]
  Q1 -->|"sí"| Q2{"¿Qué devuelve?"}
  Q2 -->|"boolean"| P["Predicate<br/>boolean test(T)"]
  Q2 -->|"otro valor"| F["Function<br/>R apply(T)"]
  Q2 -->|"nada"| C["Consumer<br/>void accept(T)"]
```

Una función de orden superior une las formas: recibe la regla y la etiqueta como parámetros. El método no sabe qué
regla aplica; solo sabe en qué momento llamarla.

#### Problema resuelto 1.1
Selecciona los envíos válidos de Tienda Aurora, conviértelos en etiquetas y publícalas dos veces: en consola y en una
lista que podrías revisar en una prueba.

**Razonamiento:**
1. «¿Es válido?» recibe un envío y devuelve sí o no: `Predicate<Envio>`.
2. «Dame la etiqueta» recibe un envío y devuelve texto: `Function<Envio, String>`.
3. «Dame un id nuevo» no recibe nada: `Supplier<String>`. «Publica» recibe texto y no devuelve: `Consumer<String>`.
4. El recorrido se escribe una vez, en un método que recibe la regla y la etiqueta.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class CuatroFormas {

    enum Estado { PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO }

    record Envio(String id, String destino, double pesoKg, Estado estado) {}

    // Función de orden superior: recibe dos comportamientos y devuelve datos.
    static List<String> etiquetasValidas(List<Envio> envios, Predicate<Envio> regla,
                                         Function<Envio, String> etiqueta) {
        List<String> salida = new ArrayList<>();
        for (Envio e : envios) {
            if (regla.test(e)) {
                salida.add(etiqueta.apply(e));
            }
        }
        return salida;
    }

    public static void main(String[] args) {
        List<Envio> envios = List.of(
                new Envio("A1", "BOG", 2.5, Estado.ENTREGADO),
                new Envio("A2", "MED", 12.0, Estado.PENDIENTE),
                new Envio("A3", "BOG", 1.0, Estado.FALLIDO),
                new Envio("A4", "CALI", 3.0, Estado.EN_RUTA));

        Predicate<Envio> valido = e -> e.pesoKg() <= 10 && e.estado() != Estado.FALLIDO;
        Function<Envio, String> etiqueta = e -> e.id() + "@" + e.destino();
        Supplier<String> idNuevo = () -> "TMP-" + 99;
        Consumer<String> consola = System.out::println;

        System.out.println("ID=" + idNuevo.get());
        List<String> etiquetas = etiquetasValidas(envios, valido, etiqueta);
        etiquetas.forEach(consola);

        List<String> capturadas = new ArrayList<>();
        Consumer<String> enMemoria = capturadas::add;
        etiquetas.forEach(enMemoria);
        System.out.println("capturadas=" + capturadas);
        System.out.println("A2 válido? " + valido.test(envios.get(1)));
    }
}
```

```text
$ java CuatroFormas.java
ID=TMP-99
A1@BOG
A4@CALI
capturadas=[A1@BOG, A4@CALI]
A2 válido? false
```

**Explicación por partes.**
- Líneas 15–24: `etiquetasValidas` es la función de orden superior. Llama a `regla.test(e)` y a `etiqueta.apply(e)` sin saber qué hacen.
- Línea 33: el `Predicate` combina dos condiciones; `A2` pesa 12 kg y `A3` está fallido, así que solo pasan `A1` y `A4`.
- Líneas 34–35: la `Function` arma la etiqueta y el `Supplier` produce `TMP-99` cada vez que llamas a `get()`.
- Línea 36: `System.out::println` encaja en `Consumer<String>` porque recibe un texto y no devuelve nada.
- Líneas 42–45: otro `Consumer` guarda las mismas etiquetas en una lista; el cálculo de la línea 39 no cambió.

> **Error común.** Anotar con `@FunctionalInterface` una interfaz con dos métodos abstractos, como `ReglaEnvio`
> (`test` y `motivo`). `javac` responde `error: Unexpected @FunctionalInterface annotation` y explica
> `multiple non-overriding abstract methods found in interface ReglaEnvio`. Quita la anotación o deja un solo
> método abstracto.

> **Error común.** Elegir la forma equivocada. `Predicate<String> valido = id -> id.trim();` produce
> `error: incompatible types: bad return type in lambda expression` seguido de `String cannot be converted to boolean`.
> El mensaje dice que la lambda devuelve texto donde el contrato exige `boolean`.

> **Buena práctica.** Nombra los comportamientos por lo que significan para el negocio: `valido`, `etiqueta`,
> `consola`. Un nombre como `p1` obliga a leer la lambda para saber qué decide.

#### Checkpoint 1.1
¿Qué forma usarías para «calcular el costo de un envío» y para «guardar un envío en la base de datos»?

Respuesta: calcular el costo recibe un envío y devuelve un valor: `Function<Envio, BigDecimal>`. Guardar recibe un
envío y no devuelve nada útil: `Consumer<Envio>`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta el programa de un solo archivo
Guarda el Problema resuelto 1.1 como `CuatroFormas.java` y ejecuta `java CuatroFormas.java`. Comprueba que la salida
coincide línea por línea, incluida `capturadas=[A1@BOG, A4@CALI]`.

#### Paso 2 · Localiza las cuatro formas en el proyecto
En `tienda-aurora-java-m20`, abre `ReglasEnvio.java` y `App.java`. Marca dónde aparecen `pesoMaximo` y `noFallido`
(reglas), `etiqueta()` (`Function`), `generadorId` (`Supplier`) y `auditor` (`Consumer`).

#### Paso 3 · Compón una regla y compruébala
`App` arma `ReglasEnvio.pesoMaximo(new BigDecimal("10")).and(ReglasEnvio.noFallido())`. Ejecuta `./gradlew -q run`
y busca `A1@BOG`, `A4@CALI` y `REGLA=peso <= 10 Y no fallido` en la salida de «Verificación real». El test
`componeReglasYTransforma` fija ese mismo resultado.

#### Paso 4 · Provoca el error de la anotación
Agrega `@FunctionalInterface` encima de `public interface ReglaEnvio` y compila. Lee el mensaje
`Unexpected @FunctionalInterface annotation` y quita la anotación.

#### Resumen
- **Predicate** responde sí o no (`test`); **Function** transforma (`apply`).
- **Consumer** recibe y no devuelve (`accept`); `Supplier` produce sin recibir (`get`).
- Una **función de orden superior** recibe comportamiento como parámetro y decide cuándo llamarlo.
- Cambiar el `Consumer` cambia el destino del efecto sin tocar el cálculo.
- **`@FunctionalInterface`** pide al compilador comprobar que hay un solo método abstracto.

#### Ejercicio verificable 1
Básico. En `CuatroFormas.java`, llama a `etiquetasValidas` con la regla `e -> e.destino().equals("BOG")` y la misma
etiqueta. ¿Qué lista obtienes?

Respuesta esperada: `[A1@BOG, A3@BOG]`. La regla nueva no mira el estado, así que `A3` (fallido) sí pasa.

#### Ejercicio verificable 2
Intermedio. Escribe una `Function<Envio, String>` que produzca `id (peso kg)` y úsala con la regla `valido`.

Respuesta esperada: `[A1 (2.5 kg), A4 (3.0 kg)]`. La lambda es `e -> e.id() + " (" + e.pesoKg() + " kg)"`.

#### Ejercicio verificable 3
Reto. Escribe un `Supplier<String>` que devuelva `TMP-1`, `TMP-2`, `TMP-3` en llamadas sucesivas. ¿Sigue siendo una
función sin efectos?

Respuesta esperada: imprime `TMP-1 TMP-2 TMP-3`. Necesita un contador fuera de la lambda (por ejemplo, `int[] n = {0}`
y `() -> "TMP-" + (++n[0])`). Ya no es una función sin efectos: cada llamada cambia el contador y devuelve algo distinto.

#### En el trabajo
En Spring, un `@Bean` de tipo `Predicate<Pedido>` o `Function<Evento, Comando>` se inyecta igual que un servicio.
Spring Cloud Function despliega `Function`, `Consumer` y `Supplier` como manejadores de mensajes o de HTTP. Elegir
bien la forma decide si la pieza se puede probar sin levantar infraestructura.

</details>

### Tema 2: Function y BiFunction: transformar uno o dos datos · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- calcular una tarifa con `BiFunction` y encadenar su resultado con `andThen`;
- convertir una función de dos entradas en una cadena de funciones de una entrada (currificación);
- fijar un argumento por adelantado (aplicación parcial) y reutilizar la función resultante en un stream;
- reconocer cuándo dos parámetros piden un tipo de dominio en vez de más argumentos.

**Conceptos clave:** BiFunction, aridad, currificación, aplicación parcial

Ya los conoces y no se repiten: `Function` (Tema 1 de este módulo); lambda e interfaz funcional (Java, Módulo 4,
Tema 1); escala de `BigDecimal` (Java, Módulo 12, Tema 2).

#### El problema
Tienda Aurora cobra una tarifa base más un impuesto. El cálculo necesita dos datos: la base y la tasa. Además, el
reporte aplica el mismo IVA a una lista de bases. Si escribes `tarifa(base, iva)` en cada lugar, repites el IVA en
todo el código. ¿Cómo modelas un cálculo de dos entradas y cómo fijas una de ellas una sola vez?

#### Glosario del tema

**BiFunction**
- **Definición técnica:** `java.util.function.BiFunction<T,U,R>`, interfaz funcional con `R apply(T t, U u)`; su método `default` `andThen(Function<? super R, ? extends V>)` encadena el resultado.
- **En palabras sencillas:** una máquina con dos ranuras de entrada y una de salida.
- **Dónde se rompe la comparación:** no hay `compose` en `BiFunction`; solo puedes encadenar después, no antes.
- **Ejemplo:** `tarifaConImpuesto.apply(base, iva)` (línea 19 del Problema resuelto 2.1) imprime `con impuesto: 119.00`.
- **Error típico:** llamarla con un solo argumento: `error: method apply in interface BiFunction<T,U,R> cannot be applied to given types;`.

**aridad**
- **Definición técnica:** número de parámetros que recibe una función: `Supplier` tiene aridad 0, `Function` 1 y `BiFunction` 2.
- **En palabras sencillas:** cuántas cosas tienes que darle a la función para que trabaje.
- **Dónde se rompe la comparación:** el JDK no trae `TriFunction`; con tres entradas creas tu interfaz o un tipo de dominio.
- **Ejemplo:** `redondear` (línea 14) tiene aridad 1; `tarifaConImpuesto` (líneas 17–18) tiene aridad 2.
- **Error típico:** seguir agregando parámetros cuando aparecen reglas nuevas; con tres o más, un `record` comunica mejor.

**currificación**
- **Definición técnica:** transformar una función de *n* argumentos en una cadena de *n* funciones de un argumento cada una.
- **En palabras sencillas:** en vez de pedir los dos datos a la vez, pides el primero y te devuelven una máquina que espera el segundo.
- **Dónde se rompe la comparación:** en Java el tipo se vuelve largo: `Function<BigDecimal, Function<BigDecimal, BigDecimal>>`.
- **Ejemplo:** `impuesto -> b -> b.add(b.multiply(impuesto))` (líneas 27–28) es la versión currificada de la tarifa.
- **Error típico:** leer la flecha doble como una sola lambda; son dos: la primera devuelve la segunda.

**aplicación parcial**
- **Definición técnica:** fijar algunos argumentos de una función y obtener una nueva función que espera los restantes.
- **En palabras sencillas:** dejar puesto el IVA y quedarte con una calculadora que solo pide la base.
- **Dónde se rompe la comparación:** el valor fijado se captura al crear la función; si cambias la tasa después, la función vieja no se entera.
- **Ejemplo:** `conImpuesto.apply(iva)` (línea 29) devuelve `conIva`, que el stream usa en la línea 32: `[119.00, 297.50, 47.60]`.
- **Error típico:** fijar un valor mutable y modificarlo después; usa valores inmutables como `BigDecimal`.

#### ► CÓMO FUNCIONA

`Function<T,R>` recibe un valor y produce otro. `BiFunction<T,U,R>` recibe dos. El criterio es simple: si necesitas
dos entradas independientes para calcular un resultado, `BiFunction` es natural; si esos dos valores empiezan a
tener reglas propias, crea un objeto de dominio. `ReglasEnvio.tarifaConImpuesto()` devuelve la `BiFunction` que
calcula base más impuesto.

La salida de `tarifa.apply(100, 0.19)` es **`119.00`** tras normalizar; el test `biFunctionYOperadores` lo fija. En
`App`, ese mismo valor se pasa por `ReglasEnvio.aplicarDescuento(0.10)` y por `normalizarYRedondear()`, por eso la
salida final del programa es **`TOTAL=107.10`**. No son dos resultados contradictorios: son dos puntos distintos del
pipeline. Si mañana el impuesto depende de país, zona o tipo de producto, el paso correcto no es agregar más
parámetros a la `BiFunction`; es introducir un tipo de dominio.

Cuando uno de los dos argumentos casi nunca cambia, como el IVA, la currificación lo separa. Fijas el IVA una vez y
obtienes una `Function` de una entrada. Esa función encaja directo en `map`.

```mermaid
flowchart LR
  B["BiFunction<br/>(base, iva) → total"] -->|"currificar"| C["Function<br/>iva → (base → total)"]
  C -->|"apply(0.19)"| P["conIva<br/>base → total"]
  P -->|"map(conIva)"| R["[119.00, 297.50, 47.60]"]
```

#### Problema resuelto 2.1
Calcula la tarifa con impuesto de tres formas: con `BiFunction`, con `BiFunction` seguida de un redondeo, y con una
versión currificada que fija el IVA para una lista de bases.

**Razonamiento:**
1. La tarifa depende de la base y del impuesto: dos entradas, una salida, `BiFunction`.
2. Redondear recibe un `BigDecimal` y devuelve otro: `Function`. `andThen` lo pone después de la tarifa.
3. Para aplicar el mismo IVA a muchas bases, fija el IVA primero: la función currificada devuelve otra función.
4. Comprueba que la versión currificada da lo mismo que la original.

```java
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;

public class Tarifas {

    public static void main(String[] args) {
        BigDecimal base = new BigDecimal("100");
        BigDecimal iva = new BigDecimal("0.19");

        // Function: una entrada, una salida.
        Function<BigDecimal, BigDecimal> redondear = v -> v.setScale(2, RoundingMode.HALF_UP);

        // BiFunction: dos entradas independientes, una salida.
        BiFunction<BigDecimal, BigDecimal, BigDecimal> tarifaConImpuesto =
                (b, impuesto) -> b.add(b.multiply(impuesto));
        System.out.println("con impuesto: " + tarifaConImpuesto.apply(base, iva));

        // BiFunction.andThen recibe una Function para el resultado.
        BiFunction<BigDecimal, BigDecimal, BigDecimal> tarifaRedondeada =
                tarifaConImpuesto.andThen(redondear);
        System.out.println("redondeada:   " + tarifaRedondeada.apply(new BigDecimal("99.99"), iva));

        // Currificación: primero el impuesto, después la base.
        Function<BigDecimal, Function<BigDecimal, BigDecimal>> conImpuesto =
                impuesto -> b -> b.add(b.multiply(impuesto));
        Function<BigDecimal, BigDecimal> conIva = conImpuesto.apply(iva);   // aplicación parcial

        List<BigDecimal> bases = List.of(new BigDecimal("100"), new BigDecimal("250"), new BigDecimal("40"));
        System.out.println("bases con IVA: " + bases.stream().map(conIva).toList());
        System.out.println("misma regla:  " + conIva.apply(base).equals(tarifaConImpuesto.apply(base, iva)));
    }
}
```

```text
$ java Tarifas.java
con impuesto: 119.00
redondeada:   118.99
bases con IVA: [119.00, 297.50, 47.60]
misma regla:  true
```

**Explicación por partes.**
- Línea 14: `redondear` fija dos decimales con `HALF_UP`.
- Líneas 17–19: la `BiFunction` suma la base y su impuesto. `100 × 0.19 = 19.00`, por eso el total ya trae dos decimales.
- Líneas 22–24: `andThen(redondear)` crea una `BiFunction` nueva. `99.99 × 1.19 = 118.9881`, que se redondea a `118.99`.
- Líneas 27–29: la versión currificada recibe el impuesto y devuelve otra función; `conIva` ya tiene el 0.19 fijado.
- Líneas 31–33: `map(conIva)` aplica la tarifa a cada base. La última línea confirma que ambas versiones coinciden.

> **Error común.** Llamar a una `BiFunction` con un argumento. `tarifa.apply(new BigDecimal("100"))` produce
> `error: method apply in interface BiFunction<T,U,R> cannot be applied to given types;` con `required:
> BigDecimal,BigDecimal` y `found: BigDecimal`. Si quieres pasar un solo dato, fija el otro con aplicación parcial.

> **Buena práctica.** Construye los `BigDecimal` desde `String` (`new BigDecimal("0.19")`). Desde `double`, el
> valor `0.19` ya llega con error binario y el total deja de ser exacto.

> **Ingeniería de software.** Si la tarifa empieza a depender de país, zona y tipo de producto, no crees una
> `BiFunction` con un `Map` como segundo argumento. Crea un `record ContextoTarifa` y una `Function<ContextoTarifa,
> BigDecimal>`: el tipo documenta qué datos hacen falta.

#### Checkpoint 2.1
¿De qué tipo es `conImpuesto.apply(iva)` y qué le falta para dar un número?

Respuesta: es `Function<BigDecimal, BigDecimal>`. Le falta la base; al llamar `apply(base)` devuelve el total.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta las tres versiones
Guarda el Problema resuelto 2.1 como `Tarifas.java` y ejecuta `java Tarifas.java`. Comprueba `con impuesto: 119.00`
y `misma regla:  true`.

#### Paso 2 · Encuentra la BiFunction en el proyecto
Abre `ReglasEnvio.java` y localiza `tarifaConImpuesto()`. Abre `App.java` y sigue el valor: tarifa, luego
`aplicarDescuento(0.10)`, luego `normalizarYRedondear()`.

#### Paso 3 · Confirma los dos puntos del pipeline
El test `biFunctionYOperadores` exige `119.00` para la tarifa normalizada. La salida de `./gradlew -q run` muestra
`TOTAL=107.10`: es la misma tarifa con el descuento del 10 %.

#### Resumen
- **BiFunction** recibe dos datos y devuelve uno; su `andThen` encadena una `Function` sobre el resultado.
- La **aridad** es el número de parámetros; el JDK trae formas hasta aridad 2.
- La **currificación** convierte una función de dos entradas en una cadena de funciones de una.
- La **aplicación parcial** fija un argumento y deja una función lista para `map`.
- `119.00` y `107.10` son dos puntos del mismo pipeline, no dos resultados en conflicto.

#### Ejercicio verificable 1
Básico. ¿Qué imprime `tarifaConImpuesto.apply(new BigDecimal("250"), iva)`?

Respuesta esperada: `297.50`. `250 × 0.19 = 47.50` y `250 + 47.50 = 297.50`.

#### Ejercicio verificable 2
Intermedio. Escribe una `BiFunction<BigDecimal, Integer, BigDecimal>` que multiplique una tarifa por kilo por un
número de paquetes. ¿Qué da con `4200` y `3`?

Respuesta esperada: `12600`. La lambda es `(tarifa, n) -> tarifa.multiply(BigDecimal.valueOf(n))`.

#### Ejercicio verificable 3
Reto. Currifica un cálculo de tres datos: impuesto, descuento y base. Aplica `0.19`, `0.10` y `100`. ¿Qué obtienes
antes y después de `setScale(2, RoundingMode.HALF_UP)`?

Respuesta esperada: `107.1000` y `107.10`. El tipo es `Function<BigDecimal, Function<BigDecimal, Function<BigDecimal,
BigDecimal>>>` y la lambda `imp -> desc -> b -> b.add(b.multiply(imp)).multiply(BigDecimal.ONE.subtract(desc))`.

#### En el trabajo
Los motores de precios separan reglas fijas (impuesto del país, moneda) de los datos de cada pedido. Fijar la
configuración al arrancar y dejar una función que solo pide el pedido es aplicación parcial, aunque el código la
llame «fábrica de calculadoras». Evita además leer la configuración en cada llamada.

</details>

### Tema 3: Componer sin anidar: andThen, compose, negate y reglas encadenadas · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- predecir el resultado de `andThen` y de `compose` sobre las mismas dos funciones;
- combinar predicados con `and`, `or`, `negate` y `Predicate.not`;
- componer una regla de negocio que conserve su motivo legible;
- corregir el error `lambda expression not expected here`.

**Conceptos clave:** composición de funciones, andThen, compose, and, or, negate, Predicate.not

Ya los conoces y no se repiten: `Function` y `Predicate` (Tema 1 de este módulo); método `default` (Java, Módulo 1,
Tema 3); `filter` y `map` (Java, Módulo 4, Tema 1).

#### El problema
La regla de envíos válidos de Tienda Aurora es «pesa 10 kg o menos y no está fallido». Mañana habrá otra: «revisar
los que pesan más de 10 kg o están fallidos». Si escribes cada regla como una lambda nueva, repites condiciones y
una corrección en la regla de peso no llega a todas. ¿Cómo armas reglas nuevas a partir de las que ya existen?

#### Glosario del tema

**composición de funciones**
- **Definición técnica:** operación que une dos funciones `f` y `g` en una nueva `h(x) = g(f(x))`: la salida de una es la entrada de la otra.
- **En palabras sencillas:** conectar dos máquinas con una cinta: lo que sale de la primera entra a la segunda.
- **Dónde se rompe la comparación:** el orden importa; en el Problema resuelto 3.1, `sumarUno` y `duplicar` dan `12` u `11` según cuál va primero.
- **Ejemplo:** `recortar.andThen(String::toUpperCase)` (línea 18) convierte `" bog "` en `BOG`.
- **Error típico:** componer funciones cuyo tipo no encaja: la salida de la primera debe ser aceptable para la segunda.

**`andThen`**
- **Definición técnica:** método `default` de `Function` (y de `BiFunction` y `Consumer`) que devuelve una función que aplica primero `this` y después el argumento.
- **En palabras sencillas:** «haz esto y luego aquello», en el orden en que se lee.
- **Dónde se rompe la comparación:** en `Consumer`, `andThen` no pasa un resultado: ejecuta los dos efectos con el mismo valor.
- **Ejemplo:** `sumarUno.andThen(duplicar).apply(5)` (línea 14) calcula `(5 + 1) × 2 = 12`.
- **Error típico:** esperar que conserve el tipo: en `UnaryOperator`, `andThen` devuelve `Function` (Tema 5).

**`compose`**
- **Definición técnica:** método `default` de `Function` que devuelve una función que aplica primero el argumento y después `this`.
- **En palabras sencillas:** «antes de hacer esto, haz aquello»: el orden de lectura queda al revés.
- **Dónde se rompe la comparación:** solo existe en `Function`; `BiFunction` y `Predicate` no lo tienen.
- **Ejemplo:** `sumarUno.compose(duplicar).apply(5)` (línea 15) calcula `5 × 2 + 1 = 11`.
- **Error típico:** usar `compose` cuando quieres el orden natural; `andThen` se lee de izquierda a derecha.

**`and`, `or` y `negate`**
- **Definición técnica:** métodos `default` de `Predicate` que devuelven un predicado nuevo: conjunción con cortocircuito, disyunción con cortocircuito y negación.
- **En palabras sencillas:** las palabras «y», «o» y «no» aplicadas a preguntas de sí o no.
- **Dónde se rompe la comparación:** con cortocircuito, `and` no evalúa la segunda condición si la primera ya es falsa.
- **Ejemplo:** `pesoMaximo.and(fallido.negate())` (línea 29) deja `válidos  = [A1, A4]`.
- **Error típico:** llamar a `negate()` directamente sobre una lambda: `error: lambda expression not expected here`.

**`Predicate.not`**
- **Definición técnica:** método estático `Predicate.not(Predicate<? super T>)` (Java 11+) que devuelve la negación del predicado recibido.
- **En palabras sencillas:** el «no» que puedes escribir delante de una lambda o de una referencia a método.
- **Dónde se rompe la comparación:** hace lo mismo que `negate()`, pero acepta una lambda sin variable intermedia.
- **Ejemplo:** `filter(Predicate.not(e -> e.destino().equals("BOG")))` (línea 35) imprime `no BOG   = [A2, A4]`.
- **Error típico:** escribir `filter(!esBog)`: `!` solo funciona con `boolean`, no con un `Predicate`.

#### ► CÓMO FUNCIONA

La composición evita anidar llamadas como `f(g(h(x)))`. `andThen` lee en orden natural: primero esto, luego
aquello. `compose` invierte el orden. En predicados, `and/or/negate` expresan lógica booleana. `ReglaEnvio.and`
compone condición y motivo; `normalizarYRedondear()` compone dos `UnaryOperator` con `andThen`.

Caso de borde: componer demasiado puede ocultar la intención. Si la cadena necesita un comentario para entenderse,
extrae métodos con nombres de negocio o usa pasos explícitos.

Cada método de composición no ejecuta nada: devuelve un objeto nuevo que guarda las dos piezas. El trabajo ocurre
cuando llamas a `apply` o a `test`.

```mermaid
flowchart LR
  X["x = 5"] --> A1["sumarUno<br/>6"] --> A2["duplicar<br/>12"]
  Y["x = 5"] --> C1["duplicar<br/>10"] --> C2["sumarUno<br/>11"]
  A2 -.- L1["sumarUno.andThen(duplicar)"]
  C2 -.- L2["sumarUno.compose(duplicar)"]
```

#### Problema resuelto 3.1
Compara `andThen` con `compose`, arma un normalizador de destinos y construye dos reglas de envíos a partir de dos
predicados base.

**Razonamiento:**
1. Con `x + 1` y `x * 2`, el orden cambia el resultado; así se ve la diferencia entre `andThen` y `compose`.
2. Normalizar es «recortar y luego pasar a mayúsculas»: `andThen`.
3. Las reglas se arman con dos piezas: «peso máximo» y «fallido». «Válido» es peso y no fallido; «revisar» es lo contrario.
4. `Predicate.not` permite negar una lambda sin guardarla antes en una variable.

```java
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;

public class Componer {

    enum Estado { PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO }

    record Envio(String id, String destino, double pesoKg, Estado estado) {}

    public static void main(String[] args) {
        Function<Integer, Integer> sumarUno = x -> x + 1;
        Function<Integer, Integer> duplicar = x -> x * 2;
        System.out.println("sumarUno.andThen(duplicar)(5) = " + sumarUno.andThen(duplicar).apply(5));
        System.out.println("sumarUno.compose(duplicar)(5) = " + sumarUno.compose(duplicar).apply(5));

        Function<String, String> recortar = String::trim;
        Function<String, String> normalizar = recortar.andThen(String::toUpperCase);
        System.out.println("normalizar(\" bog \") = [" + normalizar.apply(" bog ") + "]");

        List<Envio> envios = List.of(
                new Envio("A1", "BOG", 2.5, Estado.ENTREGADO),
                new Envio("A2", "MED", 12.0, Estado.PENDIENTE),
                new Envio("A3", "BOG", 1.0, Estado.FALLIDO),
                new Envio("A4", "CALI", 3.0, Estado.EN_RUTA));

        Predicate<Envio> pesoMaximo = e -> e.pesoKg() <= 10;
        Predicate<Envio> fallido = e -> e.estado() == Estado.FALLIDO;
        Predicate<Envio> valido = pesoMaximo.and(fallido.negate());
        Predicate<Envio> revisar = pesoMaximo.negate().or(fallido);

        System.out.println("válidos  = " + envios.stream().filter(valido).map(Envio::id).toList());
        System.out.println("revisar  = " + envios.stream().filter(revisar).map(Envio::id).toList());
        System.out.println("no BOG   = " + envios.stream()
                .filter(Predicate.not(e -> e.destino().equals("BOG")))
                .map(Envio::id).toList());
    }
}
```

```text
$ java Componer.java
sumarUno.andThen(duplicar)(5) = 12
sumarUno.compose(duplicar)(5) = 11
normalizar(" bog ") = [BOG]
válidos  = [A1, A4]
revisar  = [A2, A3]
no BOG   = [A2, A4]
```

**Explicación por partes.**
- Líneas 12–15: las mismas dos funciones dan `12` con `andThen` y `11` con `compose`.
- Líneas 17–18: la referencia `String::trim` se guarda primero en una variable con tipo; así `andThen` sabe qué recibe.
- Líneas 27–28: dos predicados base, cada uno con una sola condición.
- Líneas 29–30: `valido` y `revisar` salen de combinar los mismos dos predicados. `revisar` es exactamente la negación de `valido`.
- Línea 35: `Predicate.not` niega la lambda en el mismo lugar donde se usa.

> **Error común.** Llamar a un método sobre una lambda suelta: `(e -> e.pesoKg() <= 10).negate()` produce
> `error: lambda expression not expected here`. Una lambda necesita un tipo destino antes de tener métodos. Guárdala en
> un `Predicate<Envio>` o usa `Predicate.not(...)`.

> **Buena práctica.** Construye reglas grandes a partir de reglas pequeñas con nombre. Si la regla de peso cambia,
> la corriges en un solo lugar y `valido` y `revisar` la heredan.

> **Prevenir errores.** Escribe una prueba por regla compuesta con un caso que pase y otro que no. `revisar` debe
> dar exactamente los envíos que `valido` descarta: `[A2, A3]` frente a `[A1, A4]`.

#### Checkpoint 3.1
¿Qué devuelve `duplicar.andThen(sumarUno).apply(5)`?

Respuesta: `11`. Primero `duplicar` (10) y luego `sumarUno` (11). Es lo mismo que `sumarUno.compose(duplicar)`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta la comparación
Guarda el Problema resuelto 3.1 como `Componer.java` y ejecuta `java Componer.java`. Comprueba que `válidos` y
`revisar` no comparten ningún envío.

#### Paso 2 · Lee la composición con motivo del proyecto
Abre `ReglaEnvio.java`. El método `and` devuelve una regla nueva cuyo `test` exige las dos condiciones y cuyo `motivo`
une los dos textos con `" Y "`. Por eso `App` imprime `REGLA=peso <= 10 Y no fallido`.

#### Paso 3 · Lee la composición de operadores
En `ReglasEnvio.normalizarYRedondear()`, `noNegativo.andThen(dosDecimales)` primero corrige negativos y después
redondea. El test `biFunctionYOperadores` comprueba `119.00`.

#### Resumen
- La **composición de funciones** conecta la salida de una con la entrada de otra.
- **`andThen`** aplica primero `this`; **`compose`** aplica primero el argumento.
- **`and`**, **`or`** y **`negate`** crean predicados nuevos sin ejecutar nada todavía.
- **`Predicate.not`** niega una lambda o referencia en el mismo lugar donde se usa.
- Una regla con motivo (`ReglaEnvio.and`) compone la condición y también el texto que la explica.

#### Ejercicio verificable 1
Básico. ¿Qué imprime `sumarUno.compose(duplicar).andThen(duplicar).apply(5)`?

Respuesta esperada: `22`. Orden: `duplicar` (10), `sumarUno` (11), `duplicar` (22).

#### Ejercicio verificable 2
Intermedio. Arma una regla «destino BOG o CALI, y no fallido» con `or`, `and` y `negate`. ¿Qué ids pasan?

Respuesta esperada: `[A1, A4]`. `A3` va a BOG pero está fallido; `A2` va a MED.

#### Ejercicio verificable 3
Reto. Crea `record Regla(String motivo, Predicate<Envio> prueba)` con un método `y(Regla otra)` que devuelva
`new Regla(motivo + " Y " + otra.motivo(), prueba.and(otra.prueba()))`. Compón «peso <= 10» con «no fallido».

Respuesta esperada: el motivo es `peso <= 10 Y no fallido` y pasan `[A1, A4]`, igual que `ReglaEnvio.and` del proyecto.

#### En el trabajo
Los motores de reglas de crédito, fraude o logística se construyen así: reglas pequeñas con nombre que se combinan
por configuración. El motivo compuesto es lo que ve el operador en el panel cuando un pedido queda retenido.

</details>

### Tema 4: Streams como composición: pereza, orden y efectos que se esconden · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- predecir el orden exacto en que un stream ejecuta `filter` y `map` para cada elemento;
- explicar por qué `sorted()` cambia ese orden y cuándo corta `limit`;
- usar `peek` para observar un pipeline sin confundirlo con lógica de negocio;
- detectar un efecto que nunca se ejecuta porque `count()` no lo necesita.

**Conceptos clave:** procesamiento vertical, peek, operación con estado

Ya los conoces y no se repiten: `Stream`, operación intermedia y operación terminal (Java, Módulo 4, Tema 1); efecto
secundario (Java, Módulo 4, Tema 4); composición de funciones (Tema 3 de este módulo).

#### El problema
Un analista de Tienda Aurora agregó trazas dentro de `filter` y `map` para auditar qué envíos se procesan. En un
reporte las trazas aparecen intercaladas; en otro, `map` no deja ninguna traza aunque el conteo es correcto. ¿En
qué orden ejecuta realmente un stream sus pasos, y cuándo se salta alguno?

#### Glosario del tema

**procesamiento vertical**
- **Definición técnica:** estrategia de ejecución de los streams: cada elemento recorre todas las operaciones sin estado antes de que empiece el siguiente, en una sola pasada.
- **En palabras sencillas:** una línea de ensamblaje donde cada pieza pasa por todas las estaciones antes de que entre la siguiente.
- **Dónde se rompe la comparación:** una estación que necesita ver todas las piezas (como `sorted`) detiene la línea hasta reunirlas.
- **Ejemplo:** la traza `[filter:1, filter:2, map:2, filter:3, ...]` del Problema resuelto 4.1 muestra que `map:2` ocurre antes de `filter:3`.
- **Error típico:** imaginar que primero se filtra toda la lista y después se mapea, como en dos bucles separados.

**`peek`**
- **Definición técnica:** operación intermedia `peek(Consumer<? super T>)` que ejecuta una acción sobre cada elemento que pasa y lo deja seguir sin cambios; existe sobre todo para depurar.
- **En palabras sencillas:** una ventana en la cinta para mirar qué pasa por ahí.
- **Dónde se rompe la comparación:** la ventana solo ve lo que el stream decide procesar; si la terminal no necesita un elemento, `peek` no lo ve.
- **Ejemplo:** `peek(v -> traza.add("antes:" + v))` (línea 24) registra los cuatro valores antes de `sorted()`.
- **Error típico:** usar `peek` para guardar o enviar datos; el JDK puede omitir esa llamada cuando el resultado no la necesita.

**operación con estado**
- **Definición técnica:** operación intermedia que necesita información de elementos anteriores, o de todos, para emitir el siguiente: `sorted`, `distinct`, `limit` y `skip`.
- **En palabras sencillas:** una estación con memoria: para ordenar, tiene que ver todas las piezas primero.
- **Dónde se rompe la comparación:** `limit` tiene memoria (cuenta), pero no espera a todos: corta en cuanto llega al número.
- **Ejemplo:** con `sorted()` (línea 25), las cuatro trazas `antes:` aparecen antes de cualquier `después:`.
- **Error típico:** poner `sorted()` antes de `limit` en un stream enorme pensando que solo ordena los primeros.

#### ► CÓMO FUNCIONA

Un stream no ejecuta sus pasos intermedios cuando los declaras. Solo ejecuta cuando llega una operación terminal.
`ReporteEnvios.contarConTraza(Stream<Integer>, List<String>)` añade trazas dentro de `filter` y `map`; con
`List.of(1, 2, 3, 4, 5)` la salida es `CUENTA=2` y `TRAZA=7`: solo los pares llegan a `map` y nada ocurre antes de
`count()`. Otro borde crítico: un stream se consume una vez. El test `streamEsPerezosoYSeConsumeUnaVez` espera
`IllegalStateException` al contar dos veces el mismo stream.

Cuando la terminal arranca, empuja los elementos uno a uno a través de la cadena compuesta. Por eso el stream es una
composición: `filter` y `map` se fusionan en una sola pasada.

```mermaid
sequenceDiagram
  participant T as count()
  participant F as filter
  participant M as map
  T->>F: 1
  F-->>T: descartado
  T->>F: 2
  F->>M: 2 (par)
  M-->>T: 20
  T->>F: 3
  F-->>T: descartado
  Note over T,M: 4 sigue el camino de 2; 5 el de 3
```

Hay un borde menos conocido. Desde Java 9, si `count()` puede saber el tamaño sin recorrer los elementos, no los
recorre. Un `map` no cambia cuántos elementos hay, así que su lambda puede no ejecutarse nunca.

#### Problema resuelto 4.1
Observa el orden real de ejecución de un pipeline en cuatro situaciones: antes de la terminal, con `count()`, con
`sorted()` y `limit`, y con un `map` cuyo efecto nadie necesita.

**Razonamiento:**
1. Registra cada paso en una lista `traza` para ver el orden, no solo el resultado.
2. Imprime la traza antes de la terminal: debe estar vacía.
3. Usa `peek` antes y después de `sorted()` para ver la barrera.
4. Repite un `map` con efecto, pero sin `filter`, y cuenta.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class Pereza {

    public static void main(String[] args) {
        List<String> traza = new ArrayList<>();

        // 1. Declarar no ejecuta.
        Stream<Integer> pipeline = Stream.of(1, 2, 3, 4, 5)
                .filter(v -> { traza.add("filter:" + v); return v % 2 == 0; })
                .map(v -> { traza.add("map:" + v); return v * 10; });
        System.out.println("antes de la terminal: " + traza);

        // 2. La terminal arrastra cada elemento por todos los pasos.
        long cuenta = pipeline.count();
        System.out.println("CUENTA=" + cuenta + " TRAZA=" + traza.size());
        System.out.println(traza);

        // 3. sorted() es una barrera: ve todo antes de soltar el primero.
        traza.clear();
        List<Integer> primeros = Stream.of(5, 3, 1, 4)
                .peek(v -> traza.add("antes:" + v))
                .sorted()
                .peek(v -> traza.add("después:" + v))
                .limit(2)
                .toList();
        System.out.println(primeros + " " + traza);

        // 4. Un efecto en map puede no ejecutarse nunca.
        traza.clear();
        long n = List.of(1, 2, 3).stream()
                .map(v -> { traza.add("map:" + v); return v; })
                .count();
        System.out.println("n=" + n + " efectos en map=" + traza);
    }
}
```

```text
$ java Pereza.java
antes de la terminal: []
CUENTA=2 TRAZA=7
[filter:1, filter:2, map:2, filter:3, filter:4, map:4, filter:5]
[1, 3] [antes:5, antes:3, antes:1, antes:4, después:1, después:3]
n=3 efectos en map=[]
```

**Explicación por partes.**
- Líneas 11–14: el pipeline está declarado, pero la traza sigue vacía: `antes de la terminal: []`.
- Líneas 17–19: `count()` dispara el recorrido. Cinco `filter` y dos `map` dan `TRAZA=7`, intercalados elemento a elemento.
- Líneas 23–28: `sorted()` reúne los cuatro valores (`antes:5 … antes:4`) y después suelta `1` y `3`. `limit(2)` corta ahí: `4` y `5` nunca llegan a `después:`.
- Líneas 33–36: sin `filter`, `count()` conoce el tamaño de la lista y no ejecuta `map`. La traza queda vacía y `n=3`.

> **Error común.** Poner un efecto de negocio en `map` o en `peek` y confiar en que ocurrirá. La salida
> `n=3 efectos en map=[]` muestra que el JDK omitió las tres llamadas. Si necesitas el efecto, hazlo después con una
> terminal que lo exija (`toList()` y luego `forEach`) o fuera del stream.

> **Error común.** Reutilizar el stream: llamar dos veces a `pipeline.count()` termina con
> `java.lang.IllegalStateException: stream has already been operated upon or closed`. Crea un stream nuevo desde la colección.

> **Rendimiento.** `sorted()` necesita memoria para todos los elementos. Si solo quieres el mayor o el menor, `max`
> o `min` (Tema 9) recorren una vez sin ordenar.

#### Checkpoint 4.1
Si cambias el `count()` de la línea 35 por `toList()`, ¿qué imprime la traza?

Respuesta: `[map:1, map:2, map:3]`. `toList()` necesita cada valor transformado, así que ejecuta `map` tres veces.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta las cuatro situaciones
Guarda el Problema resuelto 4.1 como `Pereza.java` y ejecuta `java Pereza.java`. Compara cada línea con la
explicación por partes.

#### Paso 2 · Provoca el consumo doble
Después de la línea 18, agrega `System.out.println(pipeline.count());`. Ejecuta y lee el mensaje
`stream has already been operated upon or closed`. Quita la línea.

#### Paso 3 · Comprueba la pereza en el proyecto
En `ReporteEnvios.contarConTraza`, la traza se llena dentro de `filter` y `map`. La salida de `./gradlew -q run` muestra
`CUENTA=2` y `TRAZA=7`, igual que la línea 18 de `Pereza.java`.

#### Resumen
- Un stream no hace nada hasta la operación terminal.
- El **procesamiento vertical** lleva cada elemento por todos los pasos antes de pasar al siguiente.
- Una **operación con estado** como `sorted()` rompe ese ritmo: reúne todo antes de emitir.
- **`peek`** sirve para observar; no garantiza ejecutarse si la terminal no necesita el elemento.
- `count()` puede saltarse un `map` cuando el tamaño se conoce sin recorrer.
- Un stream se consume una vez; el segundo uso lanza `IllegalStateException`.

#### Ejercicio verificable 1
Básico. Cambia la terminal de las líneas 11–17 por `findFirst()`. ¿Qué devuelve y cuál es la traza?

Respuesta esperada: `Optional[20]` y la traza `[filter:1, filter:2, map:2]`. `findFirst` corta en el primer par.

#### Ejercicio verificable 2
Intermedio. En la situación 4, reemplaza `count()` por `toList()`. ¿Qué imprime la lista y qué la traza?

Respuesta esperada: `[1, 2, 3]` y `[map:1, map:2, map:3]`.

#### Ejercicio verificable 3
Reto. En la situación 3, quita `sorted()` y deja los dos `peek` y `limit(2)`. Predice la lista y la traza.

Respuesta esperada: `[5, 3]` y `[antes:5, después:5, antes:3, después:3]`. Sin la barrera, cada valor cruza ambos
`peek` antes del siguiente, y `limit` corta tras el segundo.

#### En el trabajo
En servicios que procesan eventos, un `peek(repositorio::guardar)` puede funcionar en desarrollo y dejar de guardar
cuando alguien cambia la terminal por `count()`. Las revisiones de código suelen marcar cualquier efecto dentro de
`map` o `peek` por esta razón.

</details>

### Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- elegir `UnaryOperator` o `BinaryOperator` cuando la entrada y la salida tienen el mismo tipo;
- reducir una lista con un `BinaryOperator` propio o con `BinaryOperator.minBy` y `maxBy`;
- usar `UnaryOperator.identity()` como paso neutro;
- corregir el error de tipos que aparece al componer dos `UnaryOperator` con `andThen`.

**Conceptos clave:** UnaryOperator, BinaryOperator, identity, minBy y maxBy

Ya los conoces y no se repiten: `Function` (Tema 1), `BiFunction` (Tema 2) y `andThen` (Tema 3) de este módulo;
`reduce` (Java, Módulo 4, Tema 1); `Comparator` (Java, Módulo 2, Tema 5).

#### El problema
El precio de un envío de Tienda Aurora pasa por varios ajustes: descuento, corrección de negativos y redondeo. Todos
reciben un `BigDecimal` y devuelven un `BigDecimal`. El reporte además necesita el costo mayor y el menor. Si
declaras todo como `Function<BigDecimal, BigDecimal>`, el tipo no dice que el valor conserva su clase. ¿Qué forma
comunica «mismo tipo de entrada y salida»?

#### Glosario del tema

**UnaryOperator**
- **Definición técnica:** `java.util.function.UnaryOperator<T>`, subinterfaz de `Function<T,T>`: recibe un `T` y devuelve un `T`.
- **En palabras sencillas:** un ajuste que recibe un precio y entrega un precio.
- **Dónde se rompe la comparación:** hereda `andThen` y `compose` de `Function`, y esos métodos devuelven `Function`, no `UnaryOperator`.
- **Ejemplo:** `aplicarDescuento(new BigDecimal("0.10"))` (línea 17 del Problema resuelto 5.1) imprime `descuento(100)  = 90.00`.
- **Error típico:** asignar `noNegativo.andThen(dosDecimales)` a un `UnaryOperator<BigDecimal>`: `error: incompatible types`.

**BinaryOperator**
- **Definición técnica:** `java.util.function.BinaryOperator<T>`, subinterfaz de `BiFunction<T,T,T>`: combina dos valores del mismo tipo en uno de ese tipo.
- **En palabras sencillas:** una regla para quedarte con uno de dos precios, o para juntarlos en uno.
- **Dónde se rompe la comparación:** es la forma que pide `reduce`; si no es asociativa, el resultado paralelo cambia (Tema 11).
- **Ejemplo:** `mayorCosto.apply(10, 25)` (línea 29) imprime `25`; `BigDecimal::add` (línea 33) suma `55000`.
- **Error típico:** usar `BiFunction<BigDecimal, BigDecimal, BigDecimal>` donde un método pide `BinaryOperator`: no son intercambiables sin adaptar.

**`identity`**
- **Definición técnica:** métodos estáticos `Function.identity()` y `UnaryOperator.identity()` que devuelven una función que retorna su argumento sin cambios.
- **En palabras sencillas:** un ajuste que no ajusta nada; deja el precio igual.
- **Dónde se rompe la comparación:** parece inútil, pero es el punto de partida natural al componer una lista de ajustes con `reduce`.
- **Ejemplo:** `UnaryOperator.identity()` (línea 25) imprime `identidad(42)   = 42`.
- **Error típico:** escribir `x -> x` en muchos lugares; `identity()` dice la intención con su nombre.

**`minBy` y `maxBy`**
- **Definición técnica:** métodos estáticos `BinaryOperator.minBy(Comparator)` y `BinaryOperator.maxBy(Comparator)` que devuelven un operador que conserva el menor o el mayor de dos valores.
- **En palabras sencillas:** un árbitro que, de dos precios, siempre se queda con el más bajo (o el más alto).
- **Dónde se rompe la comparación:** ante un empate, `minBy` y `maxBy` se quedan con el primer argumento.
- **Ejemplo:** `reduce(BinaryOperator.minBy(Comparator.naturalOrder()))` (líneas 34 y 37) imprime `mínimo          = 8000`.
- **Error típico:** olvidar que `reduce` sin identidad devuelve `Optional`; hay que cerrarlo con `orElseThrow()` u `orElse`.

#### ► CÓMO FUNCIONA

`UnaryOperator<T>` es `Function<T,T>`; `BinaryOperator<T>` es `BiFunction<T,T,T>`. Úsalos cuando el tipo se conserva:
comunican mejor la intención que una función genérica. `aplicarDescuento` y `mayorCosto` trabajan con `BigDecimal` de
principio a fin. La salida verificada en `App` es `TOTAL=107.10` y `MAYOR=25`; en el test,
`aplicarDescuento(0.10).apply(100)` es `90.00`.

Hay una trampa de tipos. `UnaryOperator` hereda `andThen` de `Function`, y ese método está declarado para devolver
`Function`. Por eso `ReglasEnvio.normalizarYRedondear()` declara su retorno como `Function<BigDecimal, BigDecimal>`.

```mermaid
flowchart TD
  F["Function de T a R"] --> U["UnaryOperator de T<br/>T → T"]
  B["BiFunction de T, U a R"] --> O["BinaryOperator de T<br/>(T, T) → T"]
  U -->|"andThen(...)"| R1["devuelve Function"]
  O -->|"reduce(identidad, op)"| R2["un solo T"]
```

#### Problema resuelto 5.1
Aplica un descuento, redondea, obtén la identidad, elige el mayor de dos costos y reduce la lista de costos a suma,
máximo y mínimo.

**Razonamiento:**
1. Descontar y redondear conservan el tipo: `UnaryOperator<BigDecimal>`.
2. Al encadenarlos con `andThen`, el resultado se declara como `Function`.
3. Elegir el mayor de dos y sumar dos conservan el tipo: `BinaryOperator<BigDecimal>`.
4. `reduce` con un `BinaryOperator` y sin identidad devuelve `Optional`, porque la lista podría estar vacía.

```java
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.UnaryOperator;

public class Operadores {

    static UnaryOperator<BigDecimal> aplicarDescuento(BigDecimal porcentaje) {
        BigDecimal factor = BigDecimal.ONE.subtract(porcentaje);
        return total -> total.multiply(factor);
    }

    public static void main(String[] args) {
        UnaryOperator<BigDecimal> descuento10 = aplicarDescuento(new BigDecimal("0.10"));
        UnaryOperator<BigDecimal> dosDecimales = v -> v.setScale(2, RoundingMode.HALF_UP);
        System.out.println("descuento(100)  = " + descuento10.apply(new BigDecimal("100")));

        // andThen viene de Function: el resultado se declara como Function.
        Function<BigDecimal, BigDecimal> precioFinal = descuento10.andThen(dosDecimales);
        System.out.println("final(119.00)   = " + precioFinal.apply(new BigDecimal("119.00")));

        UnaryOperator<BigDecimal> sinCambio = UnaryOperator.identity();
        System.out.println("identidad(42)   = " + sinCambio.apply(new BigDecimal("42")));

        BinaryOperator<BigDecimal> mayorCosto = (a, b) -> a.compareTo(b) >= 0 ? a : b;
        System.out.println("mayor(10, 25)   = " + mayorCosto.apply(new BigDecimal("10"), new BigDecimal("25")));

        List<BigDecimal> costos = List.of(new BigDecimal("10000"), new BigDecimal("25000"),
                new BigDecimal("8000"), new BigDecimal("12000"));
        BinaryOperator<BigDecimal> sumar = BigDecimal::add;
        BinaryOperator<BigDecimal> menor = BinaryOperator.minBy(Comparator.naturalOrder());
        System.out.println("suma            = " + costos.stream().reduce(BigDecimal.ZERO, sumar));
        System.out.println("máximo          = " + costos.stream().reduce(mayorCosto).orElseThrow());
        System.out.println("mínimo          = " + costos.stream().reduce(menor).orElseThrow());
    }
}
```

```text
$ java Operadores.java
descuento(100)  = 90.00
final(119.00)   = 107.10
identidad(42)   = 42
mayor(10, 25)   = 25
suma            = 55000
máximo          = 25000
mínimo          = 8000
```

**Explicación por partes.**
- Líneas 11–14: `aplicarDescuento` calcula el factor una vez (`0.90`) y devuelve un `UnaryOperator` que lo captura.
- Líneas 22–23: `andThen` encadena descuento y redondeo. `119.00 × 0.90 = 107.1000`, redondeado a `107.10`: el mismo `TOTAL` de `App`.
- Línea 25: `identity()` devuelve `42` sin tocarlo.
- Línea 28: `mayorCosto` compara con `compareTo` y conserva el primero si empatan.
- Líneas 33–37: la misma lista se reduce de tres maneras: suma con identidad `ZERO`, máximo y mínimo con `Optional`.

> **Error común.** Declarar como `UnaryOperator` el resultado de `andThen`. `UnaryOperator<BigDecimal> normalizar =
> noNegativo.andThen(dosDecimales);` produce `error: incompatible types: no instance(s) of type variable(s) V exist so
> that Function<BigDecimal,V> conforms to UnaryOperator<BigDecimal>`. Declara la variable como `Function<BigDecimal,
> BigDecimal>`.

> **Buena práctica.** Si el tipo se conserva, usa la forma específica. `UnaryOperator<BigDecimal> descuento` dice más
> que `Function<BigDecimal, BigDecimal> descuento` y evita que alguien cambie el tipo de salida por error.

> **Prevenir errores.** Para dinero, el operador de suma debe ser `BigDecimal::add` y la identidad `BigDecimal.ZERO`.
> Una identidad distinta suma un valor extra por cada parte del cálculo (Tema 11).

#### Checkpoint 5.1
¿Qué tipo devuelve `costos.stream().reduce(mayorCosto)` y por qué no es directamente `BigDecimal`?

Respuesta: `Optional<BigDecimal>`. Sin identidad, una lista vacía no tendría resultado; `Optional` representa ese caso.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta los operadores
Guarda el Problema resuelto 5.1 como `Operadores.java` y ejecuta `java Operadores.java`. Comprueba
`final(119.00)   = 107.10`.

#### Paso 2 · Provoca el error de tipos
Cambia el tipo de la línea 22 a `UnaryOperator<BigDecimal>`. Compila y lee el mensaje. Devuelve el tipo a `Function`.

#### Paso 3 · Compara con el proyecto
En `ReglasEnvio`, `aplicarDescuento` devuelve `UnaryOperator` y `mayorCosto` devuelve `BinaryOperator`. El test
`biFunctionYOperadores` exige `90.00` y `25`; `App` imprime `MAYOR=25`.

#### Resumen
- **UnaryOperator** es una `Function` cuyo tipo de entrada y salida coinciden.
- **BinaryOperator** combina dos valores del mismo tipo; es la forma que pide `reduce`.
- `andThen` sobre un `UnaryOperator` devuelve `Function`; declara el resultado con ese tipo.
- **`identity`** es el ajuste neutro y el punto de partida para componer listas de ajustes.
- **`minBy` y `maxBy`** construyen operadores de mínimo y máximo a partir de un `Comparator`.

#### Ejercicio verificable 1
Básico. ¿Qué devuelve `aplicarDescuento(new BigDecimal("0.25")).apply(new BigDecimal("200"))`?

Respuesta esperada: `150.00`. El factor es `0.75`; `200 × 0.75 = 150.00`, con la escala de `0.75`.

#### Ejercicio verificable 2
Intermedio. Reemplaza `mayorCosto` en la línea 36 por `BinaryOperator.maxBy(Comparator.naturalOrder())`. ¿Cambia la salida?

Respuesta esperada: no. Imprime `25000`, igual que `mayorCosto`.

#### Ejercicio verificable 3
Reto. Pon `noNegativo`, el descuento del 10 % y `dosDecimales` en una `List<UnaryOperator<BigDecimal>>`. Compónlos con
`reduce(UnaryOperator.identity(), (f, g) -> x -> g.apply(f.apply(x)))` y aplica el resultado a `-5` y a `119.00`.

Respuesta esperada: `0.00` y `107.10`. La identidad es el punto de partida; cada paso envuelve al anterior.

#### En el trabajo
Los sistemas de precios aplican cadenas de ajustes configurables: promociones, impuestos, redondeo por moneda. Guardar
cada ajuste como `UnaryOperator<Precio>` y componerlos desde configuración permite activar o quitar uno sin tocar los demás.

</details>

### Tema 6: Referencias a métodos: escribir la operación sin repetirla · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- reemplazar lambdas del pipeline de envíos por referencias a métodos equivalentes;
- distinguir un receptor ligado de uno no ligado y predecir cuándo se evalúa cada uno;
- leer el error `reference to toString is ambiguous` y elegir una alternativa sin ambigüedad.

**Conceptos clave:** receptor no ligado, receptor ligado, referencia ambigua

Ya los conoces y no se repiten: referencia a método (Java, Módulo 4, Tema 1) y sus cuatro formas, incluida la
referencia a constructor (Java, Módulo 4, Tema 4); `Comparator` (Java, Módulo 2, Tema 5); `Consumer` (Tema 1 de este
módulo).

#### El problema
El reporte de Tienda Aurora tiene lambdas como `e -> e.destino()` y `(a, b) -> a.add(b)`. Un compañero las cambió
por referencias a métodos y, en otro lugar, cambió `id -> nuevaBitacora().add(id)` por `nuevaBitacora()::add`. El
primer cambio no alteró nada; el segundo hizo que todos los ids terminaran en una sola bitácora. ¿Qué cambió?

#### Glosario del tema

**receptor no ligado**
- **Definición técnica:** referencia de la forma `Tipo::metodoDeInstancia`; el objeto sobre el que se llama el método llega como primer argumento de la interfaz funcional en cada llamada.
- **En palabras sencillas:** «a cada envío que llegue, pregúntale su destino»; el envío cambia en cada llamada.
- **Dónde se rompe la comparación:** el mismo texto `Tipo::metodo` también puede ser un método estático; el compilador decide por las firmas.
- **Ejemplo:** `Function<Envio, String> destino = Envio::destino;` (línea 27 del Problema resuelto 6.1) produce `DESTINOS=[BOG, CALI, MED]`.
- **Error típico:** usarla donde la interfaz no recibe el objeto: `Supplier<String> s = Envio::destino;` no compila porque `Supplier` no recibe nada.

**receptor ligado**
- **Definición técnica:** referencia de la forma `expresion::metodo`; la expresión se evalúa una sola vez, al crear la referencia, y ese objeto recibe todas las llamadas.
- **En palabras sencillas:** eliges el cuaderno al principio; cada nota que llega se escribe en ese mismo cuaderno.
- **Dónde se rompe la comparación:** la lambda equivalente parece igual, pero evalúa la expresión en cada llamada.
- **Ejemplo:** `nuevaBitacora()::add` (línea 34) crea una sola bitácora: `bitácoras creadas: 1`; la lambda de la línea 40 crea `4`.
- **Error típico:** escribir `obtenerConexion()::enviar` creyendo que pedirá una conexión por mensaje; la pide una sola vez.

**referencia ambigua**
- **Definición técnica:** referencia a método que encaja con más de un método del tipo, por ejemplo un estático y uno de instancia con el mismo nombre; el compilador la rechaza.
- **En palabras sencillas:** dos personas responden al mismo nombre y el compilador no sabe a cuál llamar.
- **Dónde se rompe la comparación:** a una persona le preguntarías; el compilador no adivina: exige que escribas cuál.
- **Ejemplo:** `map(Integer::toString)` sobre `Stream<Integer>` encaja con `toString(int)` y con `toString()`.
- **Error típico:** insistir con la referencia; usa `Object::toString` o la lambda `i -> Integer.toString(i)`.

#### ► CÓMO FUNCIONA

Una referencia a método es una forma compacta de una lambda existente. No agrega magia; solo nombra un comportamiento
ya disponible. En el proyecto aparecen `Envio::destino`, `Envio::id`, `Envio::costo`, `Envio::estado`,
`System.out::println` y `BigDecimal::add`. Salida verificada: `DESTINOS=[BOG, CALI, MED]`. La referencia a método no
cambia el resultado de la lambda equivalente: cambia claridad.

Hay una excepción a «no cambia el resultado»: el receptor ligado. En `expresion::metodo`, Java evalúa `expresion` en
el momento de crear la referencia. `System.out::println` captura el `System.out` de ese instante. En la lambda,
la expresión se evalúa dentro del cuerpo, en cada llamada.

```mermaid
flowchart LR
  subgraph L["nuevaBitacora()::add"]
    C1["crear referencia"] --> B1["nuevaBitacora() 1 vez"] --> A1["4 × add en la misma lista"]
  end
  subgraph M["id -> nuevaBitacora().add(id)"]
    C2["crear lambda"] --> A2["4 llamadas"] --> B2["nuevaBitacora() 4 veces"]
  end
```

#### Problema resuelto 6.1
Reescribe el pipeline de destinos, costo mayor y suma con referencias a métodos. Después compara una referencia con
receptor ligado contra la lambda que parece equivalente.

**Razonamiento:**
1. `e -> e.destino()` solo llama a un método del parámetro: se reemplaza por `Envio::destino` (receptor no ligado).
2. `(a, b) -> a.add(b)` también: `BigDecimal::add`, con el primer argumento como receptor.
3. Para ver cuándo se evalúa un receptor ligado, cuenta cuántas veces se llama al método que lo produce.

```java
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;

public class Receptores {

    record Envio(String id, String destino, BigDecimal costo) {}

    static int bitacorasCreadas = 0;

    static List<String> nuevaBitacora() {
        bitacorasCreadas++;
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        List<Envio> envios = List.of(
                new Envio("A1", "BOG", new BigDecimal("10000")),
                new Envio("A2", "MED", new BigDecimal("25000")),
                new Envio("A3", "BOG", new BigDecimal("8000")),
                new Envio("A4", "CALI", new BigDecimal("12000")));

        // Receptor no ligado: el Envio llega como argumento en cada llamada.
        Function<Envio, String> destino = Envio::destino;
        System.out.println("DESTINOS=" + envios.stream().map(destino).distinct().sorted().toList());
        System.out.println("MAS_CARO=" + envios.stream()
                .max(Comparator.comparing(Envio::costo)).map(Envio::id).orElse("NA"));
        System.out.println("SUMA=" + envios.stream().map(Envio::costo).reduce(BigDecimal.ZERO, BigDecimal::add));

        // Receptor ligado: nuevaBitacora() se evalúa una vez, al crear la referencia.
        Consumer<String> ligada = nuevaBitacora()::add;
        envios.forEach(e -> ligada.accept(e.id()));
        System.out.println("referencia ligada -> bitácoras creadas: " + bitacorasCreadas);

        // Lambda: nuevaBitacora() se evalúa en cada llamada.
        bitacorasCreadas = 0;
        Consumer<String> lambda = id -> nuevaBitacora().add(id);
        envios.forEach(e -> lambda.accept(e.id()));
        System.out.println("lambda            -> bitácoras creadas: " + bitacorasCreadas);
    }
}
```

```text
$ java Receptores.java
DESTINOS=[BOG, CALI, MED]
MAS_CARO=A2
SUMA=55000
referencia ligada -> bitácoras creadas: 1
lambda            -> bitácoras creadas: 4
```

**Explicación por partes.**
- Líneas 27–28: `Envio::destino` recibe cada envío; `distinct` y `sorted` dejan `[BOG, CALI, MED]`, como en `App`.
- Líneas 29–31: `Comparator.comparing(Envio::costo)`, `Envio::id` y `BigDecimal::add` reemplazan tres lambdas sin cambiar el resultado.
- Líneas 34–36: `nuevaBitacora()` se ejecuta al crear `ligada`. Las cuatro llamadas usan la misma lista: `1`.
- Líneas 39–42: en la lambda, `nuevaBitacora()` está dentro del cuerpo y se ejecuta en cada llamada: `4`.

> **Error común.** Usar una referencia que encaja con dos métodos. `List.of(7, 42).stream().map(Integer::toString)`
> produce `error: incompatible types: cannot infer type-variable(s) R` con la explicación `reference to toString is
> ambiguous` y `both method toString(int) in Integer and method toString() in Integer match`. Usa `Object::toString`.

> **Buena práctica.** Usa la referencia cuando la lambda solo reenvía sus argumentos a un método. Si la lambda
> combina dos llamadas o agrega una condición, déjala como lambda: la referencia no aclara nada.

> **Prevenir errores.** Antes de convertir `x -> algo().metodo(x)` en `algo()::metodo`, pregúntate si `algo()` debe
> ejecutarse una vez o en cada llamada. Si es en cada llamada, deja la lambda.

#### Checkpoint 6.1
¿Qué forma de referencia es `System.out::println` y qué objeto queda fijado?

Respuesta: receptor ligado. Se fija el `PrintStream` que devuelve `System.out` al crear la referencia.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta la comparación
Guarda el Problema resuelto 6.1 como `Receptores.java` y ejecuta `java Receptores.java`. Comprueba `1` frente a `4`.

#### Paso 2 · Sustituye lambdas en el proyecto
En `App.java`, busca `envios.stream().map(Envio::destino)`. Escribe temporalmente `e -> e.destino()`, ejecuta
`./gradlew -q run` y comprueba que `DESTINOS=[BOG, CALI, MED]` no cambia. Vuelve a la referencia.

#### Paso 3 · Provoca la referencia ambigua
Escribe un programa con `List.of(7, 42).stream().map(Integer::toString).toList()` y compílalo. Lee el mensaje y
cámbialo por `Object::toString`.

#### Resumen
- Una referencia a método nombra una lambda que solo reenvía sus argumentos.
- Con **receptor no ligado** (`Tipo::metodo`), el objeto llega en cada llamada.
- Con **receptor ligado** (`expresion::metodo`), la expresión se evalúa una vez al crear la referencia.
- Una **referencia ambigua** encaja con dos métodos; el compilador la rechaza y debes elegir uno.
- La referencia cambia la claridad, salvo en el receptor ligado, donde puede cambiar cuándo se evalúa algo.

#### Ejercicio verificable 1
Básico. Reemplaza `e -> e.id()` por una referencia en `envios.stream().map(e -> e.id()).toList()`. ¿Qué imprime?

Respuesta esperada: `Envio::id` e imprime `[A1, A2, A3, A4]`.

#### Ejercicio verificable 2
Intermedio. Corrige `map(Integer::toString)` de dos formas distintas para `List.of(7, 42)`.

Respuesta esperada: `map(Object::toString)` y `map(i -> Integer.toString(i))`. Ambas imprimen `[7, 42]`.

#### Ejercicio verificable 3
Reto. Guarda `nuevaBitacora()` en una variable `bitacora`, crea `Consumer<String> ligada = bitacora::add` y pasa los
cuatro ids. ¿Cuántos elementos tiene `bitacora` y cuántas bitácoras se crearon?

Respuesta esperada: `4` elementos (`[A1, A2, A3, A4]`) y `1` bitácora. La variable hace explícito lo que el receptor
ligado ya hacía.

#### En el trabajo
En Spring, `repositorio::save` dentro de un `forEach` es un receptor ligado al bean inyectado, y eso es lo que se
quiere. El problema aparece con fábricas: `clienteHttp()::enviar` reutiliza un solo cliente, lo cual puede ser
correcto o un error según su ciclo de vida.

</details>

### Tema 7: Optional: buscar un envío que puede no existir · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- transformar el contenido de un `Optional` con `map` sin abrirlo;
- encadenar dos búsquedas que pueden fallar con `flatMap` y evitar `Optional<Optional<…>>`;
- descartar un valor presente que no cumple una condición con `filter`;
- convertir la ausencia en una excepción con mensaje útil.

**Conceptos clave:** Optional.map, Optional.flatMap, Optional.filter

Ya los conoces y no se repiten: `Optional`, `Optional.of` (con `ofNullable` y `empty`), `orElse` y `orElseThrow`
(Java, Módulo 4, Tema 2); `Function` y `Predicate` (Tema 1 de este módulo).

#### El problema
El repositorio de Tienda Aurora busca envíos por id. Algunos ids no existen. Además, un envío puede tener conductor
asignado o no. Para mostrar «conductor del envío A4» hay dos ausencias posibles: el envío y el conductor. Con `if`
anidados y `null` el código se llena de comprobaciones. ¿Cómo encadenas búsquedas que pueden fallar?

#### Glosario del tema

**`Optional.map`**
- **Definición técnica:** método `map(Function<? super T, ? extends U>)` de `Optional<T>`; si hay valor, aplica la función y devuelve `Optional<U>`; si está vacío, devuelve vacío sin llamar a la función.
- **En palabras sencillas:** transformar lo que hay en la caja sin abrirla; si la caja está vacía, sigue vacía.
- **Dónde se rompe la comparación:** si la función devuelve `null`, el resultado es un `Optional` vacío, no una caja con `null`.
- **Ejemplo:** `buscarPorId("A1").map(Envio::id).orElse("NA")` (línea 30 del Problema resuelto 7.1) imprime `OPT=A1`.
- **Error típico:** usar `map` con una función que ya devuelve `Optional`: obtienes `Optional[Optional[Marta]]`.

**`Optional.flatMap`**
- **Definición técnica:** método `flatMap(Function<? super T, ? extends Optional<? extends U>>)` de `Optional<T>`; aplica una función que devuelve `Optional` y no lo anida.
- **En palabras sencillas:** abrir una caja que contiene otra caja y quedarte con una sola.
- **Dónde se rompe la comparación:** si cualquiera de las dos cajas está vacía, el resultado está vacío; no sabes cuál faltó.
- **Ejemplo:** `buscarPorId("A4").flatMap(BuscarEnvio::conductorDe)` (línea 39) imprime `Optional[Marta]`.
- **Error típico:** asignar el resultado de `map` a `Optional<String>`: `error: incompatible types: inference variable U has incompatible bounds`.

**`Optional.filter`**
- **Definición técnica:** método `filter(Predicate<? super T>)` de `Optional<T>`; conserva el valor si cumple el predicado y devuelve vacío si no lo cumple o si ya estaba vacío.
- **En palabras sencillas:** mirar dentro de la caja y vaciarla si lo que hay no sirve.
- **Dónde se rompe la comparación:** un `Optional` vacío después de `filter` no dice si faltaba el valor o si no cumplió la condición.
- **Ejemplo:** `buscarPorId("A4").filter(e -> e.estado() == Estado.ENTREGADO).isPresent()` (líneas 35–36) imprime `false`.
- **Error típico:** usar `filter` y después `get()`; si el valor no cumple, `get()` lanza `NoSuchElementException`.

#### ► CÓMO FUNCIONA

`Optional` obliga a decidir qué hacer cuando un dato no está. `EnvioRepository.buscarPorId` devuelve
`Optional<Envio>`; `obtenerObligatorio` convierte la ausencia en `IllegalArgumentException` con mensaje útil.
Salidas verificadas: `OPT=A1`, `MISS=NA`. El caso obligatorio falla con `envío obligatorio no encontrado: ZZ`: un
`NoSuchElementException` genérico no ayuda en producción.

`map`, `flatMap` y `filter` hacen con un `Optional` lo mismo que con un stream de cero o un elemento. Cada paso solo
se ejecuta si hay valor. La decisión sobre la ausencia se toma una vez, al final, con `orElse` u `orElseThrow`.

```mermaid
flowchart LR
  B["buscarPorId(id)<br/>Optional de Envio"] -->|"flatMap(conductorDe)"| C{"¿envío y conductor?"}
  C -->|"los dos"| P["Optional[Marta]"]
  C -->|"falta uno"| V["Optional.empty"]
  P --> O["orElse(...)"]
  V --> O
```

#### Problema resuelto 7.1
Busca envíos por id, extrae su id, comprueba si están entregados, obtén su conductor y exige un envío obligatorio.

**Razonamiento:**
1. La búsqueda devuelve `Optional<Envio>` porque el id puede no existir: `ofNullable` sobre el mapa.
2. Extraer un campo es `map`; comprobar el estado es `filter`.
3. El conductor también puede faltar, así que `conductorDe` devuelve `Optional<String>`: se encadena con `flatMap`.
4. Cuando el envío es obligatorio, la ausencia es un error: `orElseThrow` con un mensaje que nombra el id.

```java
import java.util.Map;
import java.util.Optional;

public class BuscarEnvio {

    enum Estado { PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO }

    record Envio(String id, String destino, Estado estado) {}

    static final Map<String, Envio> ENVIOS = Map.of(
            "A1", new Envio("A1", "BOG", Estado.ENTREGADO),
            "A4", new Envio("A4", "CALI", Estado.EN_RUTA));

    static final Map<String, String> CONDUCTORES = Map.of("A4", "Marta");

    static Optional<Envio> buscarPorId(String id) {
        return Optional.ofNullable(ENVIOS.get(id));
    }

    static Optional<String> conductorDe(Envio envio) {
        return Optional.ofNullable(CONDUCTORES.get(envio.id()));
    }

    static Envio obtenerObligatorio(String id) {
        return buscarPorId(id)
                .orElseThrow(() -> new IllegalArgumentException("envío obligatorio no encontrado: " + id));
    }

    public static void main(String[] args) {
        System.out.println("OPT="  + buscarPorId("A1").map(Envio::id).orElse("NA"));
        System.out.println("MISS=" + buscarPorId("ZZ").map(Envio::id).orElse("NA"));

        System.out.println("A1 entregado? " + buscarPorId("A1")
                .filter(e -> e.estado() == Estado.ENTREGADO).isPresent());
        System.out.println("A4 entregado? " + buscarPorId("A4")
                .filter(e -> e.estado() == Estado.ENTREGADO).isPresent());

        System.out.println("map     A4 -> " + buscarPorId("A4").map(BuscarEnvio::conductorDe));
        System.out.println("flatMap A4 -> " + buscarPorId("A4").flatMap(BuscarEnvio::conductorDe));
        System.out.println("flatMap A1 -> " + buscarPorId("A1").flatMap(BuscarEnvio::conductorDe));

        try {
            obtenerObligatorio("ZZ");
        } catch (IllegalArgumentException e) {
            System.out.println("error: " + e.getMessage());
        }
    }
}
```

```text
$ java BuscarEnvio.java
OPT=A1
MISS=NA
A1 entregado? true
A4 entregado? false
map     A4 -> Optional[Optional[Marta]]
flatMap A4 -> Optional[Marta]
flatMap A1 -> Optional.empty
error: envío obligatorio no encontrado: ZZ
```

**Explicación por partes.**
- Líneas 16–22: las dos búsquedas usan `Optional.ofNullable` porque `Map.get` devuelve `null` si no encuentra la clave.
- Líneas 24–27: `orElseThrow` con un `Supplier` crea la excepción solo si falta el envío.
- Líneas 30–31: `map` transforma solo cuando hay valor; con `ZZ` la función no se llama y queda `NA`.
- Líneas 33–36: `filter` conserva `A1` (entregado) y vacía `A4` (en ruta).
- Líneas 38–40: `map` anida (`Optional[Optional[Marta]]`); `flatMap` aplana. `A1` no tiene conductor: `Optional.empty`.

> **Error común.** Usar `map` con una función que devuelve `Optional` y asignar el resultado a `Optional<String>`.
> `Optional<String> conductor = Optional.of("A4").map(MapMal::conductorDe);` produce `error: incompatible types:
> inference variable U has incompatible bounds`, con `equality constraints: String` y `lower bounds: Optional<String>`.
> Cambia `map` por `flatMap`.

> **Buena práctica.** Devuelve `Optional` en métodos de consulta (`buscarPorId`) y un valor directo en métodos que
> exigen existencia (`obtenerObligatorio`). El nombre y el tipo cuentan al lector qué esperar.

> **Prevenir errores.** No uses `Optional` como campo de un `record` ni como parámetro. Está pensado para el retorno
> de una consulta; en campos y parámetros complica la llamada sin evitar el `null`.

#### Checkpoint 7.1
¿Qué imprime `buscarPorId("ZZ").flatMap(BuscarEnvio::conductorDe)`?

Respuesta: `Optional.empty`. El envío no existe, así que `conductorDe` ni siquiera se llama.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta las búsquedas
Guarda el Problema resuelto 7.1 como `BuscarEnvio.java` y ejecuta `java BuscarEnvio.java`. Compara la línea de `map`
con la de `flatMap`.

#### Paso 2 · Revisa el repositorio del proyecto
Abre `EnvioRepository.java`. `buscarPorId` usa `Optional.ofNullable` y `obtenerObligatorio` usa `orElseThrow` con el
mensaje `envío obligatorio no encontrado: `. La salida de `./gradlew -q run` muestra `OPT=A1` y `MISS=NA`.

#### Paso 3 · Comprueba la excepción con mensaje
El test `optionalExplicito` exige `IllegalArgumentException` al pedir `ZZ` como obligatorio. En el Problema resuelto
7.1, la última línea muestra el mensaje completo.

#### Resumen
- **`Optional.map`** transforma el valor si existe; si no, no llama a la función.
- **`Optional.flatMap`** encadena una función que devuelve `Optional` sin anidar cajas.
- **`Optional.filter`** vacía el `Optional` si el valor no cumple la condición.
- La decisión sobre la ausencia se toma al final: `orElse` para un valor por defecto, `orElseThrow` para un error.
- Un mensaje que nombra el id que faltó ahorra tiempo en producción frente a `No value present`.

#### Ejercicio verificable 1
Básico. ¿Qué imprime `buscarPorId("A4").map(Envio::destino).orElse("NA")`?

Respuesta esperada: `CALI`.

#### Ejercicio verificable 2
Intermedio. Obtén el conductor de `A1` con `flatMap` y muestra `sin asignar` si no tiene.

Respuesta esperada: `buscarPorId("A1").flatMap(BuscarEnvio::conductorDe).orElse("sin asignar")` imprime `sin asignar`.

#### Ejercicio verificable 3
Reto. Escribe `estadoDe(String id)` que devuelva el nombre del estado o `desconocido`, sin `if`. Pruébalo con `A4` y `ZZ`.

Respuesta esperada: `EN_RUTA` y `desconocido`. El cuerpo es `buscarPorId(id).map(e -> e.estado().name()).orElse("desconocido")`.

#### En el trabajo
Spring Data devuelve `Optional<T>` en `findById`. El patrón habitual en un servicio es
`repositorio.findById(id).orElseThrow(() -> new RecursoNoEncontrado(id))`, y un manejador global convierte esa
excepción en una respuesta HTTP 404 con el id en el mensaje.

</details>

### Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- aplanar las paradas de varios envíos y dejar una lista limpia, única y ordenada;
- ordenar con un `Comparator` compuesto de dos criterios;
- explicar por qué normalizar antes de filtrar cambia el resultado;
- leer la `ClassCastException` que lanza `sorted()` sobre un tipo sin orden natural.

**Conceptos clave:** distinct, sorted, normalización

Ya los conoces y no se repiten: `filter`, `map` y `flatMap` (Java, Módulo 4, Tema 1); `Comparable` y `Comparator`
(Java, Módulo 2, Tema 5); operación con estado (Tema 4 de este módulo).

#### El problema
Cada envío de Tienda Aurora trae su lista de paradas, escrita a mano: `"Bodega"`, `"MED"`, `"med"`. El tablero
necesita todas las paradas sin repetir y en orden. Además, los destinos llegan de un formulario como `" bog "` y se
validan contra una lista permitida. Con el orden equivocado, destinos válidos quedan rechazados. ¿En qué orden van
los pasos?

#### Glosario del tema

**`distinct`**
- **Definición técnica:** operación intermedia con estado que deja pasar cada elemento solo la primera vez, usando `equals` y `hashCode` para comparar.
- **En palabras sencillas:** un portero que recuerda a quién ya dejó pasar.
- **Dónde se rompe la comparación:** el portero compara con `equals`: `"MED"` y `"med"` son distintos hasta que los normalizas.
- **Ejemplo:** en el Problema resuelto 8.1, `distinct()` (línea 22) deja 4 paradas de las 8 originales.
- **Error típico:** aplicar `distinct` antes de pasar a mayúsculas: `MED` y `med` sobreviven los dos.

**`sorted`**
- **Definición técnica:** operación intermedia con estado que ordena los elementos; sin argumentos usa el orden natural (`Comparable`) y con un `Comparator` usa ese criterio.
- **En palabras sencillas:** reunir todas las tarjetas y ponerlas en fila antes de entregar la primera.
- **Dónde se rompe la comparación:** si el tipo no tiene orden natural, el error no aparece al compilar sino al ejecutar.
- **Ejemplo:** `sorted(Comparator.comparing(String::length).thenComparing(Comparator.reverseOrder()))` (línea 28) imprime `[MED, BOG, CALI, BODEGA]`.
- **Error típico:** `sorted()` sobre un `record` sin `Comparable`: `ClassCastException: class SortedMal$Envio cannot be cast to class java.lang.Comparable`.

**normalización**
- **Definición técnica:** transformar datos equivalentes a una forma canónica única (sin espacios, misma capitalización) antes de compararlos o validarlos.
- **En palabras sencillas:** pasar todo al mismo formato para que «bog», « BOG » y «BOG» cuenten como lo mismo.
- **Dónde se rompe la comparación:** normalizar de más borra información: si `"Bogotá"` y `"BOGOTA"` deben distinguirse, no quites tildes.
- **Ejemplo:** `map(String::trim).map(String::toUpperCase).filter(permitido)` (líneas 36–37) imprime `NORMALIZADOS=[BOG, MED]`.
- **Error típico:** filtrar antes de normalizar: `filtrar y luego normalizar = []`.

#### ► CÓMO FUNCIONA

Las operaciones intermedias devuelven otro stream: `filter`, `map`, `flatMap`, `distinct`, `sorted`.
`ReporteEnvios.paradasNormalizadas` usa `flatMap` porque cada envío tiene una lista de paradas; sin aplanar
terminarías con `Stream<List<String>>`. Salida verificada: `PARADAS=[BODEGA, BOG, CALI, MED]`.
`destinosValidosNormalizados` muestra el orden correcto: recortar, pasar a mayúsculas y solo entonces filtrar; salida
`NORMALIZADOS=[BOG, MED]`.

El orden de los pasos sigue una regla: primero aplana, después limpia y normaliza, después descarta duplicados y al
final ordena. Ordenar al final es más barato: `sorted` trabaja con menos elementos.

```mermaid
flowchart LR
  A["envíos"] -->|"flatMap"| B["8 paradas"]
  B -->|"trim, filter vacías"| C["limpias"]
  C -->|"toUpperCase"| D["normalizadas"]
  D -->|"distinct"| E["4 únicas"]
  E -->|"sorted"| F["[BODEGA, BOG, CALI, MED]"]
```

#### Problema resuelto 8.1
Obtén las paradas únicas y ordenadas de los cuatro envíos, ordénalas por un segundo criterio y valida destinos crudos
en dos órdenes distintos.

**Razonamiento:**
1. Cada envío aporta varias paradas: `flatMap` las vuelca en un solo stream.
2. `trim` y `toUpperCase` igualan `"MED"` y `"med"`; solo entonces `distinct` los reconoce como iguales.
3. Para ordenar por largo y, a igual largo, de Z a A, compón dos criterios con `thenComparing`.
4. La lista permitida está en mayúsculas sin espacios; el dato crudo debe llegar así antes del `filter`.

```java
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

public class Intermedias {

    record Envio(String id, String destino, List<String> paradas) {}

    public static void main(String[] args) {
        List<Envio> envios = List.of(
                new Envio("A1", "BOG", List.of("Bodega", "BOG")),
                new Envio("A2", "MED", List.of("Bodega", "MED", "med")),
                new Envio("A3", "BOG", List.of("BOG")),
                new Envio("A4", "CALI", List.of("BOG", "CALI")));

        List<String> paradas = envios.stream()
                .flatMap(e -> e.paradas().stream())
                .map(String::trim)
                .filter(p -> !p.isBlank())
                .map(String::toUpperCase)
                .distinct()
                .sorted()
                .toList();
        System.out.println("PARADAS=" + paradas);

        List<String> porLargo = paradas.stream()
                .sorted(Comparator.comparing(String::length).thenComparing(Comparator.reverseOrder()))
                .toList();
        System.out.println("por largo, luego Z-A=" + porLargo);

        List<String> crudos = List.of(" bog ", "med", "XX");
        Predicate<String> permitido = d -> Set.of("BOG", "MED", "CALI").contains(d);
        List<String> filtrandoPrimero = crudos.stream()
                .filter(permitido).map(String::trim).map(String::toUpperCase).toList();
        List<String> normalizandoPrimero = crudos.stream()
                .map(String::trim).map(String::toUpperCase).filter(permitido).toList();
        System.out.println("filtrar y luego normalizar = " + filtrandoPrimero);
        System.out.println("NORMALIZADOS=" + normalizandoPrimero);
    }
}
```

```text
$ java Intermedias.java
PARADAS=[BODEGA, BOG, CALI, MED]
por largo, luego Z-A=[MED, BOG, CALI, BODEGA]
filtrar y luego normalizar = []
NORMALIZADOS=[BOG, MED]
```

**Explicación por partes.**
- Líneas 17–24: aplanar, recortar, quitar vacías, normalizar, quitar duplicados y ordenar. El resultado coincide con `PARADAS` de `App`.
- Líneas 27–29: tres letras primero (`MED`, `BOG`, en orden Z-A), luego cuatro (`CALI`) y seis (`BODEGA`).
- Líneas 34–35: el filtro recibe `" bog "` y `"med"` sin normalizar; ninguno está en la lista y queda `[]`.
- Líneas 36–37: con el orden correcto, `" bog "` se vuelve `BOG` antes de validar; `XX` sigue fuera.

> **Error común.** Llamar a `sorted()` sobre un tipo que no implementa `Comparable`. Compila, pero al ejecutar
> termina con `java.lang.ClassCastException: class SortedMal$Envio cannot be cast to class java.lang.Comparable`.
> Pasa un criterio: `sorted(Comparator.comparing(Envio::id))`.

> **Buena práctica.** Pon `distinct` y `sorted` lo más tarde posible, después de los `filter`. Las dos son operaciones
> con estado y su costo crece con la cantidad de elementos que reciben.

> **Prevenir errores.** Escribe la normalización como una sola función con nombre (por ejemplo, la `normalizar` del
> Tema 3) y úsala en todos los lugares que comparan destinos. Dos normalizaciones distintas producen rechazos falsos.

#### Checkpoint 8.1
Si quitas `.map(String::toUpperCase)` de la línea 21, ¿cuántas paradas quedan?

Respuesta: cinco: `[BOG, Bodega, CALI, MED, med]`. `distinct` ya no une `MED` con `med`, y el orden natural pone las mayúsculas antes.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta el pipeline
Guarda el Problema resuelto 8.1 como `Intermedias.java` y ejecuta `java Intermedias.java`. Comprueba
`PARADAS=[BODEGA, BOG, CALI, MED]`.

#### Paso 2 · Provoca la ClassCastException
Escribe un programa que ordene dos `record Envio(String id, String destino)` con `sorted()` sin argumentos. Ejecútalo
y lee la primera línea de la traza. Corrígelo con `sorted(Comparator.comparing(Envio::id))`.

#### Paso 3 · Compara con el proyecto
`ReporteEnvios.paradasNormalizadas` y `destinosValidosNormalizados` siguen el mismo orden. El test
`normalizaAntesDeValidar` exige `[BOG, MED]`.

#### Resumen
- **`distinct`** quita repetidos usando `equals`; necesita datos ya normalizados.
- **`sorted`** ordena con el orden natural o con un `Comparator`; sin orden natural falla al ejecutar.
- La **normalización** lleva datos equivalentes a una sola forma antes de comparar o validar.
- Orden recomendado: aplanar, limpiar, normalizar, filtrar, quitar duplicados y ordenar.
- Filtrar antes de normalizar rechaza datos válidos.

#### Ejercicio verificable 1
Básico. Con los cuatro envíos, obtén los destinos sin repetir y ordenados.

Respuesta esperada: `envios.stream().map(Envio::destino).distinct().sorted().toList()` imprime `[BOG, CALI, MED]`.

#### Ejercicio verificable 2
Intermedio. Agrega un campo `BigDecimal costo` (10000, 25000, 8000, 12000) y ordena los ids de mayor a menor costo.

Respuesta esperada: `sorted(Comparator.comparing(Envio::costo).reversed())` imprime `[A2, A4, A1, A3]`.

#### Ejercicio verificable 3
Reto. Cuenta las paradas después de `flatMap` y `toUpperCase`, con y sin `distinct`.

Respuesta esperada: `8` sin `distinct` y `4` con `distinct`.

#### En el trabajo
La normalización de direcciones y ciudades es una fuente constante de errores en logística: «Bogotá D.C.», «BOGOTA»
y «bogota» llegan de sistemas distintos. Los equipos fijan una función de normalización compartida y la prueban con
casos reales antes de usarla para validar o agrupar.

</details>

### Tema 9: Streams terminales: encontrar, contar y combinar resultados · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- contar, encontrar el mayor y el menor y sumar con la terminal adecuada;
- responder preguntas de sí o no con `anyMatch`, `allMatch` y `noneMatch`;
- tomar el primer elemento que cumple una condición con `findFirst`;
- predecir qué devuelven estas terminales con una lista vacía.

**Conceptos clave:** count, max y min, anyMatch, allMatch, noneMatch, findFirst

Ya los conoces y no se repiten: operación terminal, `reduce` y `collect` (Java, Módulo 4, Tema 1); `Optional` (Java,
Módulo 4, Tema 2); `Comparator` (Java, Módulo 2, Tema 5); `BinaryOperator` (Tema 5 de este módulo).

#### El problema
El supervisor de Tienda Aurora pide cinco datos del día: cuántos envíos se entregaron, cuál es el más caro y el más
barato, cuánto suman, si hay alguno fallido y cuál es el primero en ruta. Cada pregunta tiene una terminal distinta.
Si usas `collect` o `forEach` para todo, el código no dice qué preguntas. ¿Qué terminal responde cada pregunta?

#### Glosario del tema

**`count`**
- **Definición técnica:** operación terminal que devuelve un `long` con la cantidad de elementos que llegan al final del pipeline.
- **En palabras sencillas:** contar lo que salió de la cinta.
- **Dónde se rompe la comparación:** si el tamaño se conoce sin recorrer, no recorre: los pasos intermedios pueden no ejecutarse (Tema 4).
- **Ejemplo:** `filter(e -> e.estado() == Estado.ENTREGADO).count()` (línea 19 del Problema resuelto 9.1) da `ENTREGADOS=1`.
- **Error típico:** guardar el resultado en un `int`: `count()` devuelve `long` y la asignación no compila sin conversión.

**`max` y `min`**
- **Definición técnica:** operaciones terminales que reciben un `Comparator` y devuelven `Optional<T>` con el mayor o el menor elemento; vacío si el stream no tiene elementos.
- **En palabras sencillas:** recorrer una vez y quedarte con el ganador según una regla.
- **Dónde se rompe la comparación:** puede no haber ganador: con una lista vacía devuelven `Optional.empty`.
- **Ejemplo:** `max(Comparator.comparing(Envio::costo))` (línea 20) da `MAS_CARO=A2`; `min` (línea 21) da `MAS_BARATO=A3`.
- **Error típico:** ordenar toda la lista con `sorted` para tomar el primero; `max` y `min` hacen una sola pasada.

**`anyMatch`, `allMatch` y `noneMatch`**
- **Definición técnica:** terminales de cortocircuito que reciben un `Predicate` y devuelven `boolean`: si alguno cumple, si todos cumplen o si ninguno cumple.
- **En palabras sencillas:** las preguntas «¿hay alguno?», «¿son todos?» y «¿no hay ninguno?».
- **Dónde se rompe la comparación:** con una lista vacía, `allMatch` y `noneMatch` responden `true` y `anyMatch` responde `false`.
- **Ejemplo:** `anyMatch(e -> e.estado() == Estado.FALLIDO)` (línea 26) imprime `true` y deja de recorrer al encontrar `A3`.
- **Error típico:** escribir `filter(...).count() > 0` en vez de `anyMatch`: recorre todo aunque el primero ya cumpla.

**`findFirst`**
- **Definición técnica:** terminal de cortocircuito que devuelve `Optional<T>` con el primer elemento del stream en el orden de encuentro.
- **En palabras sencillas:** detener la cinta en cuanto aparece la primera pieza que sirve.
- **Dónde se rompe la comparación:** en un stream paralelo, `findAny` puede devolver otro elemento; `findFirst` respeta el orden aunque cueste más.
- **Ejemplo:** `filter(e -> e.estado() == Estado.EN_RUTA).findFirst()` (líneas 29–30) da `A4`.
- **Error típico:** llamar a `get()` sobre el resultado sin comprobar; si nada cumple, lanza `NoSuchElementException`.

#### ► CÓMO FUNCIONA

La terminal cierra el pipeline: `count`, `max`, `reduce`, `collect`, `forEach`. Después de una terminal, el stream ya
no sirve. `masCaro`, `totalEntregados` y `sumaCostos` devuelven `MAS_CARO=A2`, `ENTREGADOS=1` y `SUMA=55000`.
`reduce` necesita identidad y operación asociativa; para objetos mutables, prefiere collectors o un acumulador
explícito.

Las terminales se dividen en dos grupos. Unas necesitan ver todos los elementos: `count`, `max`, `min`, `reduce`.
Otras pueden parar antes: `anyMatch`, `allMatch`, `noneMatch` y `findFirst`. Las que pueden no tener resultado
devuelven `Optional`.

```mermaid
flowchart TD
  Q{"¿Qué preguntas?"} -->|"¿cuántos?"| C["count → long"]
  Q -->|"¿cuál gana?"| M["max / min → Optional"]
  Q -->|"¿cuánto suman?"| R["reduce(identidad, op) → T"]
  Q -->|"¿hay alguno? ¿todos? ¿ninguno?"| B["anyMatch / allMatch / noneMatch → boolean"]
  Q -->|"¿cuál es el primero?"| F["findFirst → Optional"]
```

#### Problema resuelto 9.1
Responde las preguntas del supervisor sobre los cuatro envíos y comprueba qué devuelven las mismas terminales con
una lista vacía.

**Razonamiento:**
1. «¿Cuántos entregados?» es filtrar y contar.
2. «¿El más caro y el más barato?» compara costos: `max` y `min` con `Comparator.comparing(Envio::costo)`.
3. «¿Cuánto suman?» es `reduce` con `BigDecimal.ZERO` y `BigDecimal::add`.
4. Las preguntas de sí o no usan las terminales `Match`; «el primero en ruta» es `filter` y `findFirst`.

```java
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class Terminales {

    enum Estado { PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO }

    record Envio(String id, String destino, BigDecimal costo, Estado estado) {}

    public static void main(String[] args) {
        List<Envio> envios = List.of(
                new Envio("A1", "BOG", new BigDecimal("10000"), Estado.ENTREGADO),
                new Envio("A2", "MED", new BigDecimal("25000"), Estado.PENDIENTE),
                new Envio("A3", "BOG", new BigDecimal("8000"), Estado.FALLIDO),
                new Envio("A4", "CALI", new BigDecimal("12000"), Estado.EN_RUTA));

        long entregados = envios.stream().filter(e -> e.estado() == Estado.ENTREGADO).count();
        Optional<Envio> masCaro = envios.stream().max(Comparator.comparing(Envio::costo));
        Optional<Envio> masBarato = envios.stream().min(Comparator.comparing(Envio::costo));
        BigDecimal suma = envios.stream().map(Envio::costo).reduce(BigDecimal.ZERO, BigDecimal::add);
        System.out.println("ENTREGADOS=" + entregados + " MAS_CARO=" + masCaro.map(Envio::id).orElse("NA")
                + " MAS_BARATO=" + masBarato.map(Envio::id).orElse("NA") + " SUMA=" + suma);

        System.out.println("¿alguno fallido?     " + envios.stream().anyMatch(e -> e.estado() == Estado.FALLIDO));
        System.out.println("¿todos con costo>0?  " + envios.stream().allMatch(e -> e.costo().signum() > 0));
        System.out.println("¿ninguno a PAS?      " + envios.stream().noneMatch(e -> e.destino().equals("PAS")));
        System.out.println("primero en ruta:     " + envios.stream()
                .filter(e -> e.estado() == Estado.EN_RUTA).findFirst().map(Envio::id).orElse("NA"));

        List<Envio> vacia = List.of();
        System.out.println("max de lista vacía:  " + vacia.stream().max(Comparator.comparing(Envio::costo)));
        System.out.println("anyMatch vacía:      " + vacia.stream().anyMatch(e -> true)
                + " | allMatch vacía: " + vacia.stream().allMatch(e -> false));
    }
}
```

```text
$ java Terminales.java
ENTREGADOS=1 MAS_CARO=A2 MAS_BARATO=A3 SUMA=55000
¿alguno fallido?     true
¿todos con costo>0?  true
¿ninguno a PAS?      true
primero en ruta:     A4
max de lista vacía:  Optional.empty
anyMatch vacía:      false | allMatch vacía: true
```

**Explicación por partes.**
- Línea 19: solo `A1` está entregado: `1`.
- Líneas 20–21: `max` y `min` devuelven `Optional<Envio>`; `map(Envio::id)` y `orElse` sacan el id.
- Línea 22: la suma con identidad devuelve `BigDecimal` directamente: `55000`.
- Líneas 26–30: las tres preguntas de sí o no y el primer envío en ruta.
- Líneas 32–35: con la lista vacía, `max` devuelve `Optional.empty`, `anyMatch` da `false` y `allMatch` da `true`.

> **Error común.** Usar `reduce` sin identidad y esperar un valor directo. `BigDecimal suma = ...stream().reduce(BigDecimal::add);`
> produce `error: incompatible types: Optional<BigDecimal> cannot be converted to BigDecimal`. Pasa la identidad
> (`reduce(BigDecimal.ZERO, BigDecimal::add)`) o cierra el `Optional`.

> **Buena práctica.** Elige la terminal que nombra la pregunta. `anyMatch(fallido)` se lee como «¿hay algún
> fallido?»; `filter(fallido).count() > 0` obliga a traducir y además recorre todo.

> **Prevenir errores.** Prueba cada terminal con una lista vacía. `allMatch` devuelve `true` sin elementos; si tu
> regla es «todos los envíos están entregados», un lote vacío pasaría como correcto.

#### Checkpoint 9.1
¿Por qué `allMatch(e -> false)` devuelve `true` con una lista vacía?

Respuesta: porque no hay ningún elemento que incumpla. «Todos cumplen» es verdadero cuando no existe un contraejemplo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta las preguntas
Guarda el Problema resuelto 9.1 como `Terminales.java` y ejecuta `java Terminales.java`. Comprueba
`ENTREGADOS=1 MAS_CARO=A2 MAS_BARATO=A3 SUMA=55000`.

#### Paso 2 · Compara con el proyecto
En `ReporteEnvios`, `masCaro` usa `max`, `totalEntregados` usa `count` y `sumaCostos` usa `reduce`. La salida de
`./gradlew -q run` muestra `MAS_CARO=A2`, `ENTREGADOS=1` y `SUMA=55000`.

#### Paso 3 · Provoca el error de tipos de reduce
Quita `BigDecimal.ZERO` de la línea 22 y compila. Lee el mensaje `Optional<BigDecimal> cannot be converted to
BigDecimal` y vuelve a poner la identidad.

#### Resumen
- **`count`** devuelve un `long` con la cantidad de elementos.
- **`max` y `min`** recorren una vez y devuelven `Optional`, vacío si no hay elementos.
- **`anyMatch`**, **`allMatch`** y **`noneMatch`** responden sí o no y pueden parar antes de terminar.
- **`findFirst`** devuelve el primer elemento en orden de encuentro dentro de un `Optional`.
- `reduce` con identidad devuelve el tipo directo; sin identidad, un `Optional`.

#### Ejercicio verificable 1
Básico. ¿Cuántos envíos van a `BOG`?

Respuesta esperada: `2`, con `filter(e -> e.destino().equals("BOG")).count()`.

#### Ejercicio verificable 2
Intermedio. ¿Cuál es el envío más barato entre los que no están fallidos?

Respuesta esperada: `A1`. `filter(e -> e.estado() != Estado.FALLIDO).min(Comparator.comparing(Envio::costo))`; sin `A3`, el menor es `10000`.

#### Ejercicio verificable 3
Reto. ¿Qué imprime `List.<Envio>of().stream().noneMatch(e -> true)` y por qué?

Respuesta esperada: `true`. No hay ningún elemento que cumpla, así que «ninguno cumple» es verdadero.

#### En el trabajo
Los validadores de lotes usan `allMatch` para aceptar un archivo y `anyMatch` para rechazarlo. Un lote vacío que pasa
`allMatch` es un fallo real que se ha visto en producción; por eso se valida el tamaño antes de la regla.

</details>

### Tema 10: Collectors: formar listas, mapas, grupos y texto · Avanzado · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- agrupar envíos con `groupingBy` eligiendo la clave, el tipo de mapa y lo que se acumula en cada grupo;
- combinar collectors *downstream* como `mapping`, `counting` y `reducing`;
- fijar el orden de un mapa por enum con `EnumMap` y reunir resultados en el contenedor que elijas;
- corregir el error de tipos de `joining` sobre un stream que no es de texto.

**Conceptos clave:** groupingBy, collector downstream, mapping, toCollection, EnumMap

Ya los conoces y no se repiten: `collect` y Collectors, incluido `joining` (Java, Módulo 4, Tema 1); `HashMap`,
`LinkedHashMap`, `TreeMap` y `TreeSet` (Java, Módulo 2, Tema 1); `enum` (Java, Módulo 0, Tema 6).

#### El problema
El tablero de Tienda Aurora muestra los envíos por estado, el costo por destino y la lista de ids. Un día el orden de
los estados en pantalla cambió sin que nadie tocara el código. El mapa salía de `groupingBy(Envio::estado)`. ¿Qué
decide el orden de un mapa agrupado y cómo lo fijas?

#### Glosario del tema

**`groupingBy`**
- **Definición técnica:** collector de `Collectors` que reparte los elementos en un `Map` según una función clasificadora; acepta la fábrica del mapa y un collector para los valores de cada grupo.
- **En palabras sencillas:** clasificar cartas en casilleros: la clave dice el casillero y lo de adentro es lo que guardas.
- **Dónde se rompe la comparación:** sin fábrica, el mapa es un `HashMap` y el orden de los casilleros no está garantizado.
- **Ejemplo:** `groupingBy(Envio::estado)` (líneas 23–24 del Problema resuelto 10.1) devuelve un mapa de tipo `HashMap`.
- **Error típico:** confiar en el orden de impresión de ese `HashMap`; cambia entre equipos y versiones.

**collector downstream**
- **Definición técnica:** collector que `groupingBy` aplica a los elementos de cada grupo para producir el valor de esa clave; por defecto es `toList()`.
- **En palabras sencillas:** la regla de qué guardas en cada casillero: la carta entera, solo su número o el total.
- **Dónde se rompe la comparación:** los downstream se anidan: un `mapping` puede contener un `toList` o un `joining`.
- **Ejemplo:** `Collectors.reducing(BigDecimal.ZERO, Envio::costo, BigDecimal::add)` (línea 38) suma costos por destino: `{BOG=18000, MED=25000, CALI=12000}`.
- **Error típico:** agrupar con `toList()` y luego recorrer el mapa para sumar; el downstream lo hace en la misma pasada.

**`mapping`**
- **Definición técnica:** collector `Collectors.mapping(Function, Collector)` que transforma cada elemento antes de pasarlo a otro collector.
- **En palabras sencillas:** quedarte solo con el número de la carta antes de meterla al casillero.
- **Dónde se rompe la comparación:** es el `map` de los collectors; solo tiene sentido dentro de otro collector como `groupingBy`.
- **Ejemplo:** `Collectors.mapping(Envio::id, Collectors.toList())` (línea 31) guarda ids en lugar de envíos completos.
- **Error típico:** hacer `map(Envio::id)` antes de `groupingBy`; pierdes el estado con el que querías agrupar.

**`toCollection`**
- **Definición técnica:** collector `Collectors.toCollection(Supplier<C>)` que reúne los elementos en la colección que crea el `Supplier`.
- **En palabras sencillas:** elegir la caja donde quedará el resultado: lista, conjunto ordenado o cola.
- **Dónde se rompe la comparación:** la caja define reglas: un `TreeSet` ordena y quita duplicados aunque no lo pidas.
- **Ejemplo:** `Collectors.toCollection(TreeSet::new)` (línea 47) imprime `DEST_SET=[BOG, CALI, MED]`.
- **Error típico:** usar `toSet()` y esperar orden; `toSet()` no promete ningún tipo de conjunto en particular.

**`EnumMap`**
- **Definición técnica:** implementación de `Map` de `java.util` para claves de un `enum`; guarda las entradas en un arreglo indexado por el ordinal y recorre en el orden de declaración.
- **En palabras sencillas:** un casillero por cada valor del enum, siempre en la misma fila.
- **Dónde se rompe la comparación:** solo acepta claves de un enum; se crea con la clase del enum: `new EnumMap<>(Estado.class)`.
- **Ejemplo:** con `() -> new EnumMap<>(Estado.class)` (línea 30), la salida sigue la declaración: `PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO`.
- **Error típico:** pasar `EnumMap::new` como fábrica; no compila porque `EnumMap` no tiene constructor sin argumentos.

#### ► CÓMO FUNCIONA

`collect` materializa el resultado y la elección del collector define el contrato de salida. `porEstado` agrupa por
enum, `costoPorDestino` usa `LinkedHashMap` para conservar orden de inserción, `resumenIds` usa `joining` y
`destinosOrdenados` usa `TreeSet`. Salidas verificadas: `POR_ESTADO=[ENTREGADO, EN_RUTA, PENDIENTE, FALLIDO]`,
`COSTO_DESTINO={BOG=18000, MED=25000, CALI=12000}`, `IDS=[A1, A2, A3, A4]`, `DEST_SET=[BOG, CALI, MED]`.

Cuidado con la primera salida. `porEstado` usa `groupingBy` sin fábrica, que devuelve un `HashMap`. El hash de una
constante de enum es el de identidad del objeto, distinto en cada JVM. El mismo proyecto, ejecutado con OpenJDK
25.0.5.1 en Linux, imprimió `POR_ESTADO=[FALLIDO, ENTREGADO, PENDIENTE, EN_RUTA]`. Si el orden importa, pasa la fábrica.

`groupingBy` con tres argumentos tiene tres decisiones: qué clave, qué mapa y qué guardar por grupo.

```mermaid
flowchart LR
  E["Stream de Envio"] --> K["clasificador<br/>Envio::estado"]
  K --> M["fábrica<br/>EnumMap / LinkedHashMap"]
  M --> D["downstream<br/>mapping / counting / reducing"]
  D --> R["Map con orden fijado"]
```

#### Problema resuelto 10.1
Agrupa los envíos por estado con orden fijo, suma y cuenta por destino conservando el orden de llegada, une los ids
en texto y reúne los destinos en un conjunto ordenado.

**Razonamiento:**
1. Primero comprueba qué mapa crea `groupingBy` sin fábrica: imprime su clase.
2. Para estados, la fábrica es `EnumMap`; en cada grupo solo interesan los ids: `mapping(Envio::id, toList())`.
3. Para destinos, el orden de llegada se conserva con `LinkedHashMap`; el valor es una suma (`reducing`) o un conteo (`counting`).
4. Los ids van a texto con `joining`; los destinos a un `TreeSet` con `toCollection`.

```java
import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

public class Agrupar {

    enum Estado { PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO }

    record Envio(String id, String destino, BigDecimal costo, Estado estado) {}

    public static void main(String[] args) {
        List<Envio> envios = List.of(
                new Envio("A1", "BOG", new BigDecimal("10000"), Estado.ENTREGADO),
                new Envio("A2", "MED", new BigDecimal("25000"), Estado.PENDIENTE),
                new Envio("A3", "BOG", new BigDecimal("8000"), Estado.FALLIDO),
                new Envio("A4", "CALI", new BigDecimal("12000"), Estado.EN_RUTA));

        Map<Estado, List<Envio>> porEstado = envios.stream()
                .collect(Collectors.groupingBy(Envio::estado));
        System.out.println("tipo de mapa: " + porEstado.getClass().getSimpleName());

        Map<Estado, List<String>> idsPorEstado = envios.stream()
                .collect(Collectors.groupingBy(
                        Envio::estado,
                        () -> new EnumMap<>(Estado.class),
                        Collectors.mapping(Envio::id, Collectors.toList())));
        System.out.println("POR_ESTADO=" + idsPorEstado);

        Map<String, BigDecimal> costoPorDestino = envios.stream()
                .collect(Collectors.groupingBy(
                        Envio::destino,
                        LinkedHashMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Envio::costo, BigDecimal::add)));
        System.out.println("COSTO_DESTINO=" + costoPorDestino);

        Map<String, Long> cuantosPorDestino = envios.stream()
                .collect(Collectors.groupingBy(Envio::destino, LinkedHashMap::new, Collectors.counting()));
        System.out.println("CUANTOS=" + cuantosPorDestino);

        String ids = envios.stream().map(Envio::id).collect(Collectors.joining(", ", "[", "]"));
        Set<String> destinos = envios.stream().map(Envio::destino)
                .collect(Collectors.toCollection(TreeSet::new));
        System.out.println("IDS=" + ids + " DEST_SET=" + destinos);
    }
}
```

```text
$ java Agrupar.java
tipo de mapa: HashMap
POR_ESTADO={PENDIENTE=[A2], EN_RUTA=[A4], ENTREGADO=[A1], FALLIDO=[A3]}
COSTO_DESTINO={BOG=18000, MED=25000, CALI=12000}
CUANTOS={BOG=2, MED=1, CALI=1}
IDS=[A1, A2, A3, A4] DEST_SET=[BOG, CALI, MED]
```

**Explicación por partes.**
- Líneas 23–25: sin fábrica, el mapa es un `HashMap`: su orden de recorrido no está garantizado.
- Líneas 27–32: clasificador, fábrica `EnumMap` y downstream `mapping`. El orden sigue la declaración del enum.
- Líneas 34–39: `LinkedHashMap::new` conserva `BOG, MED, CALI`, el orden en que aparecen; `reducing` suma `10000 + 8000` en BOG.
- Líneas 41–43: el mismo agrupamiento con `counting()` da `{BOG=2, MED=1, CALI=1}`.
- Líneas 45–48: `joining` con separador, prefijo y sufijo; `toCollection(TreeSet::new)` ordena y quita duplicados.

> **Error común.** Usar `joining` sobre un stream que no es de texto. `List.of(10000, 25000).stream().collect(Collectors.joining(", "))`
> produce `error: no suitable method found for collect(Collector<CharSequence,CAP#1,String>)`. Convierte antes:
> `map(String::valueOf)` y después `joining`.

> **Buena práctica.** Declara el orden que necesitas con la fábrica del mapa: `EnumMap` para enums, `LinkedHashMap`
> para orden de llegada y `TreeMap` para orden natural. Un `HashMap` solo sirve cuando el orden no se muestra.

> **Prevenir errores.** Si una prueba compara la impresión de un mapa, asegúrate de que el mapa tiene orden
> garantizado. Si no, la prueba pasa en tu equipo y falla en el servidor de integración.

#### Checkpoint 10.1
¿Por qué `COSTO_DESTINO` muestra `BOG` primero y `CALI` al final, si `CALI` va antes que `MED` en orden alfabético?

Respuesta: porque el mapa es un `LinkedHashMap`, que conserva el orden de inserción: `BOG` (A1), `MED` (A2) y `CALI` (A4).

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta los collectors
Guarda el Problema resuelto 10.1 como `Agrupar.java` y ejecuta `java Agrupar.java`. Comprueba que
`POR_ESTADO` sigue el orden `PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO`.

#### Paso 2 · Revisa los collectors del proyecto
En `ReporteEnvios`, localiza `porEstado`, `costoPorDestino`, `resumenIds` y `destinosOrdenados`. Identifica en cada
uno el collector y, si existe, la fábrica y el downstream.

#### Paso 3 · Fija el orden de porEstado
En tu copia del proyecto, cambia `porEstado` a `groupingBy(Envio::estado, () -> new EnumMap<>(EstadoEnvio.class),
Collectors.toList())`. Agrega `import java.util.EnumMap;`. Ejecuta `./gradlew -q run`
dos veces: `POR_ESTADO` debe salir `[PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO]` en cualquier equipo.

#### Resumen
- **`groupingBy`** reparte en un mapa; sin fábrica crea un `HashMap` sin orden garantizado.
- Un **collector downstream** decide qué se guarda por grupo: lista, conteo, suma o texto.
- **`mapping`** transforma cada elemento antes de entregarlo al collector interno.
- **`toCollection`** reúne el resultado en la colección que elijas, con sus reglas.
- **`EnumMap`** recorre las claves en el orden en que el enum las declara.

#### Ejercicio verificable 1
Básico. Cuenta los envíos por destino en orden alfabético.

Respuesta esperada: `groupingBy(Envio::destino, TreeMap::new, Collectors.counting())` imprime `{BOG=2, CALI=1, MED=1}`.

#### Ejercicio verificable 2
Intermedio. Agrupa los ids por destino conservando el orden de llegada.

Respuesta esperada: `groupingBy(Envio::destino, LinkedHashMap::new, Collectors.mapping(Envio::id, Collectors.toList()))`
imprime `{BOG=[A1, A3], MED=[A2], CALI=[A4]}`.

#### Ejercicio verificable 3
Reto. Suma los costos por estado en un `EnumMap`.

Respuesta esperada: `{PENDIENTE=25000, EN_RUTA=12000, ENTREGADO=10000, FALLIDO=8000}`, con la fábrica
`() -> new EnumMap<>(Estado.class)` y el downstream `reducing(BigDecimal.ZERO, Envio::costo, BigDecimal::add)`.

#### En el trabajo
Los reportes que se exportan a CSV o se muestran en un tablero necesitan columnas en un orden estable. Los equipos
fijan la fábrica del mapa en el collector, o convierten a una lista ordenada antes de serializar, para que el archivo
no cambie entre ejecuciones.

</details>

### Tema 11: Streams paralelos: comparar antes de acelerarlos · Avanzado · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- reproducir una suma paralela que pierde valores por estado mutable compartido y corregirla;
- elegir la identidad correcta de `reduce` y explicar por qué una incorrecta cambia el resultado en paralelo;
- distinguir una medición casera de un microbenchmark antes de decidir si usar `parallelStream()`.

**Conceptos clave:** elemento identidad, microbenchmark

Ya los conoces y no se repiten: stream paralelo, ForkJoinPool común, operación asociativa y efecto secundario (Java,
Módulo 4, Tema 4); estado mutable compartido y operación atómica (Java, Módulo 5, Tema 4); condición de carrera
(Fundamentos, Módulo 5, Tema 2); desbordamiento (Java, Módulo 0, Tema 4); `BinaryOperator` (Tema 5 de este módulo).

#### El problema
El cierre diario de Tienda Aurora suma un millón de valores. Alguien cambió `stream()` por `parallelStream()` y
acumuló en un arreglo `caja[0] += v`. Las pruebas pasaron casi siempre; en producción, algunos cierres no cuadran.
¿Por qué la misma suma da resultados distintos, y qué condiciones debe cumplir un cálculo para ir en paralelo?

#### Glosario del tema

**elemento identidad**
- **Definición técnica:** valor `id` que, combinado con cualquier `x` mediante la operación, devuelve `x`: `op(id, x) == x`. `reduce(identidad, op)` lo usa como punto de partida de cada parte.
- **En palabras sencillas:** el valor que no cambia nada: el cero para sumar, el uno para multiplicar.
- **Dónde se rompe la comparación:** en paralelo, la identidad no se usa una vez sino una por cada parte; si no es neutra, se suma varias veces.
- **Ejemplo:** con identidad `1`, la suma secuencial da `55001` y la paralela `55004` (líneas 30–31 del Problema resuelto 11.1).
- **Error típico:** usar como identidad un valor inicial de negocio, como un saldo de apertura; súmalo después del `reduce`.

**microbenchmark**
- **Definición técnica:** medición controlada del tiempo de una porción pequeña de código, con calentamiento del JIT, repeticiones y análisis estadístico; en Java se hace con JMH (*Java Microbenchmark Harness*).
- **En palabras sencillas:** cronometrar muchas veces, en condiciones parecidas, antes de decir cuál es más rápido.
- **Dónde se rompe la comparación:** un cronómetro con `System.nanoTime()` mide una sola vez y mezcla calentamiento, recolección de basura y ruido del equipo.
- **Ejemplo:** la auditoría de Java, Módulo 4, Tema 4, midió `seq=12ms par=2ms` en una corrida; el número útil allí era `same=true`, no los milisegundos.
- **Error típico:** decidir con una sola medición casera; en este módulo no se ejecutó JMH, así que no se afirma ninguna aceleración.

#### ► CÓMO FUNCIONA

`parallelStream()` reparte trabajo, pero no hace segura una operación con estado compartido.
`ReporteEnvios.sumaParalelaInsegura` muestra el error con un `int[]` mutable; `sumaParalelaSegura` usa `reduce` sin
estado compartido. Salida verificada de la versión segura: `PARALELA=55000`. No se ejecutó JMH: mide con datos y
hardware reales antes de dejar `parallelStream()` en producción; la corrección de la carrera sí está verificada por el
código y el test.

Un stream paralelo divide la fuente en partes. Cada parte se reduce por separado, empezando desde la identidad, y
después las partes se combinan. Por eso hay dos condiciones: la operación debe ser asociativa y la identidad, neutra.
`caja[0] += v` no cumple nada de eso: es leer, sumar y escribir sobre la misma posición desde varios hilos.

```mermaid
flowchart TD
  F["costos: 10000, 25000, 8000, 12000"] --> P1["parte 1<br/>1 + 10000"]
  F --> P2["parte 2<br/>1 + 25000"]
  F --> P3["parte 3<br/>1 + 8000"]
  F --> P4["parte 4<br/>1 + 12000"]
  P1 --> C["combinar con add"]
  P2 --> C
  P3 --> C
  P4 --> C
  C --> R["55004: la identidad 1 se sumó 4 veces"]
```

#### Problema resuelto 11.1
Suma un millón de valores en paralelo con un acumulador compartido y con una suma sin estado. Después reduce los
costos de los envíos con una identidad correcta y con una incorrecta.

**Razonamiento:**
1. El acumulador `long[] caja` es estado mutable compartido: varios hilos ejecutan `caja[0] += v` a la vez.
2. La versión segura no comparte nada: `mapToLong(...).sum()` reduce cada parte y combina al final.
3. Repite cinco veces: una carrera no falla siempre, así que una sola corrida no prueba nada.
4. Para la identidad, compara `reduce` secuencial y paralelo con `ZERO` y con `ONE`.

```java
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.IntStream;

public class Carrera {

    static long sumaInsegura(List<Integer> valores) {
        final long[] caja = {0};                      // estado mutable compartido
        valores.parallelStream().forEach(v -> caja[0] += v);
        return caja[0];
    }

    static long sumaSegura(List<Integer> valores) {
        return valores.parallelStream().mapToLong(Integer::longValue).sum();
    }

    public static void main(String[] args) {
        List<Integer> valores = IntStream.rangeClosed(1, 1_000_000).boxed().toList();
        System.out.println("esperado = 500000500000");
        for (int corrida = 1; corrida <= 5; corrida++) {
            System.out.println("corrida " + corrida + ": insegura=" + sumaInsegura(valores)
                    + " segura=" + sumaSegura(valores));
        }

        List<BigDecimal> costos = List.of(new BigDecimal("10000"), new BigDecimal("25000"),
                new BigDecimal("8000"), new BigDecimal("12000"));
        System.out.println("PARALELA=" + costos.parallelStream().reduce(BigDecimal.ZERO, BigDecimal::add));
        System.out.println("identidad 0 secuencial=" + costos.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                + " paralela=" + costos.parallelStream().reduce(BigDecimal.ZERO, BigDecimal::add));
        System.out.println("identidad 1 secuencial=" + costos.stream().reduce(BigDecimal.ONE, BigDecimal::add)
                + " paralela=" + costos.parallelStream().reduce(BigDecimal.ONE, BigDecimal::add));
    }
}
```

```text
$ java Carrera.java
esperado = 500000500000
corrida 1: insegura=500000500000 segura=500000500000
corrida 2: insegura=500000500000 segura=500000500000
corrida 3: insegura=496669200158 segura=500000500000
corrida 4: insegura=500000500000 segura=500000500000
corrida 5: insegura=478701291489 segura=500000500000
PARALELA=55000
identidad 0 secuencial=55000 paralela=55000
identidad 1 secuencial=55001 paralela=55004
```

**Explicación por partes.**
- Líneas 7–11: `caja[0] += v` no es atómico. Dos hilos leen el mismo valor, suman cada uno el suyo y uno pisa al otro.
- Líneas 13–15: `mapToLong(Integer::longValue).sum()` no comparte estado; siempre da `500000500000`.
- Líneas 20–23: en esta corrida, la versión insegura acertó tres veces y falló dos (`496669200158` y `478701291489`). Tu salida será distinta.
- Línea 27: la suma paralela de los costos con identidad `ZERO` coincide con `PARALELA=55000` del proyecto.
- Líneas 28–31: con `ZERO` las dos versiones coinciden. Con `ONE`, la secuencial suma 1 una vez y la paralela una vez por parte: `55004`.

> **Error común.** Acumular desde `forEach` de un stream paralelo en una variable externa. La salida de esta corrida
> mostró `insegura=478701291489` frente a `esperado = 500000500000`: no hay mensaje de error, solo un número
> equivocado. Usa `sum()`, `reduce` o un collector.

> **Error común.** Que el acumulador sea `int`. El `sumaParalelaInsegura` del proyecto usa `int[]`; con el millón de
> valores de este tema, un `int[]` desborda incluso sin carrera, porque `500000500000` no cabe en 32 bits. Por eso el
> Problema resuelto 11.1 usa `long[]`: así el único fallo visible es la carrera.

> **Prevenir errores.** Antes de agregar `.parallel()`, comprueba tres cosas: la operación es asociativa, la identidad
> es neutra y ningún paso modifica estado externo. Después ejecuta varias veces y compara con la versión secuencial.

> **Rendimiento.** Con 2 núcleos, el pool común tiene un hilo trabajador más el hilo que llama. Para sumar 4 costos,
> dividir y combinar cuesta más que sumar. Mide con JMH sobre tus datos antes de decidir.

#### Checkpoint 11.1
¿Por qué la versión insegura a veces da el resultado correcto?

Respuesta: porque la carrera solo ocurre cuando dos hilos leen y escriben `caja[0]` casi al mismo tiempo. Si no se
cruzan, la suma sale bien; por eso una prueba que pasa una vez no demuestra que el código sea correcto.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Reproduce la carrera
Guarda el Problema resuelto 11.1 como `Carrera.java` y ejecútalo tres veces con `java Carrera.java`. Anota cuántas
corridas de `insegura` fallan; la columna `segura` debe ser siempre `500000500000`.

#### Paso 2 · Corrige con una operación atómica
Cambia el cuerpo de `sumaInsegura` por un `AtomicLong total` y `valores.parallelStream().forEach(total::addAndGet)`.
Ejecuta de nuevo: todas las corridas dan `500000500000`, aunque sigue siendo más lento que `sum()`.

#### Paso 3 · Compara con el proyecto
`ReporteEnvios.sumaParalelaSegura` usa `reduce(BigDecimal.ZERO, BigDecimal::add)`; `App` imprime `PARALELA=55000`.
`sumaParalelaInsegura` se conserva solo como contraejemplo.

#### Resumen
- `parallelStream()` divide la fuente, reduce cada parte y combina; no protege el estado compartido.
- Acumular en una variable externa desde varios hilos produce una condición de carrera silenciosa.
- El **elemento identidad** se usa una vez por parte; si no es neutro, el resultado paralelo cambia.
- La operación de `reduce` debe ser asociativa y sin efectos externos.
- Un **microbenchmark** con JMH es la forma seria de decidir si el paralelo acelera; una medición casera no basta.

#### Ejercicio verificable 1
Básico. Con los costos del Problema resuelto 11.1, usa `BigDecimal.TEN` como identidad. ¿Qué dan la versión
secuencial y la paralela?

Respuesta esperada: `55010` y `55040` en este equipo. La paralela divide los 4 costos en 4 partes y suma el 10 en cada una.

#### Ejercicio verificable 2
Intermedio. Implementa la corrección del Paso 2 con `AtomicLong` y ejecútala tres veces. ¿Qué imprime?

Respuesta esperada: `500000500000` las tres veces. `addAndGet` es una operación atómica: lee, suma y escribe sin que otro hilo se intercale.

#### Ejercicio verificable 3
Reto. Calcula la misma suma con `valores.parallelStream().collect(Collectors.summingLong(Integer::longValue))`. ¿Por
qué es segura sin `AtomicLong`?

Respuesta esperada: imprime `500000500000`. Cada parte acumula en su propio contenedor y el collector combina los
contenedores al final; ningún hilo escribe en el de otro.

#### En el trabajo
En servidores web, el pool común lo comparten todas las peticiones. Un `parallelStream()` en un endpoint puede
acaparar sus hilos y frenar a otros. Por eso muchos equipos lo evitan en código de peticiones y lo reservan para lotes
grandes, medidos con JMH.

</details>

### Tema 12: Pureza y efectos: calcular separado de guardar o imprimir · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- distinguir una función pura de una impura con una prueba de dos llamadas;
- reescribir un reporte para que el cálculo sea puro y el efecto quede en el borde;
- inyectar el efecto como `Consumer` y probarlo sin consola;
- proteger la inmutabilidad de un `record` con copia defensiva y leer la `UnsupportedOperationException`.

**Conceptos clave:** función pura, transparencia referencial, núcleo funcional y borde imperativo

Ya los conoces y no se repiten: efecto secundario (Java, Módulo 4, Tema 4); inmutable (Java, Módulo 0, Tema 5);
copia defensiva e inmutabilidad superficial (Java, Módulo 1, Tema 5); colección inmodificable (Java, Módulo 2,
Tema 1); puerto (Java, Módulo 13, Tema 1); `Consumer` (Tema 1 de este módulo).

#### El problema
El reporte diario de Tienda Aurora se arma, se numera e imprime en el mismo método. Para probarlo hay que capturar la
consola, y dos llamadas seguidas devuelven textos distintos porque el contador global avanza. Mañana el reporte irá a
un log y luego a una cola de mensajes. ¿Cómo separas lo que se calcula de lo que se hace con el resultado?

#### Glosario del tema

**función pura**
- **Definición técnica:** función cuyo resultado depende solo de sus argumentos y que no produce efectos observables: no modifica estado externo, no imprime, no lee reloj ni red.
- **En palabras sencillas:** una calculadora: con los mismos números, siempre el mismo resultado, y no toca nada más.
- **Dónde se rompe la comparación:** puede crear objetos nuevos y variables locales; lo prohibido es lo que se ve desde afuera.
- **Ejemplo:** `reportePuro(envios)` (líneas 24–26 del Problema resuelto 12.1) devuelve `REPORTE:[A1, A2]` todas las veces.
- **Error típico:** leer un campo `static` que otro código cambia; la función parece pura pero su resultado depende de ese campo.

**transparencia referencial**
- **Definición técnica:** propiedad de una expresión que puede reemplazarse por su valor sin cambiar el comportamiento del programa.
- **En palabras sencillas:** si `reporte(envios)` vale `"REPORTE:[A1, A2]"`, puedes escribir ese texto en su lugar y nada cambia.
- **Dónde se rompe la comparación:** con una función impura, reemplazar la llamada por su valor borra el efecto: el texto ya no se imprime.
- **Ejemplo:** `a.equals(b)` da `false` con `reporteImpuro` y `c.equals(d)` da `true` con `reportePuro` (líneas 32–38).
- **Error típico:** guardar en caché el resultado de una función impura; las siguientes llamadas pierden su efecto o su valor nuevo.

**núcleo funcional y borde imperativo**
- **Definición técnica:** organización del código en la que la lógica de negocio son funciones puras (núcleo) y los efectos de E/S viven en una capa delgada exterior (borde) que llama al núcleo.
- **En palabras sencillas:** la cocina prepara el plato; el mesero lo lleva. La cocina no sale al comedor.
- **Dónde se rompe la comparación:** el borde también decide cuándo llamar al núcleo y qué hacer si falla la E/S; no es solo un mensajero.
- **Ejemplo:** en el proyecto, `ReporteEnvios` es el núcleo y `App.main` el borde: calcula `REPORTE:[A1, A2, A3, A4]` y se lo pasa al `Consumer`.
- **Error típico:** llamar a `System.out.println` o a un repositorio desde dentro de `ReporteEnvios`; el núcleo deja de poder probarse solo.

#### ► CÓMO FUNCIONA

Una función pura depende solo de su entrada y no causa efectos observables. `ReporteEnvios` es puro: recibe listas,
devuelve valores. El efecto se hace en el borde: `App` calcula `REPORTE:[A1, A2, A3, A4]` y se lo pasa al `Consumer`
inyectado. Si mañana el reporte va a un logger, a Kafka o a HTTP, el cálculo no cambia.

La prueba más simple de pureza es llamar dos veces con la misma entrada. Si el resultado cambia o algo se imprime,
hay un efecto. La inmutabilidad ayuda: si `Envio` copia sus listas al construirse, nadie puede cambiarle los datos al
núcleo mientras calcula.

```mermaid
flowchart LR
  subgraph B1["borde (App.main)"]
    D["datos()"]
    C["Consumer de String<br/>consola, log o lista de prueba"]
  end
  subgraph N["núcleo puro (ReporteEnvios)"]
    R["resumenIds(envios)"]
  end
  D --> R --> T["REPORTE:[A1, A2, A3, A4]"] --> C
```

#### Problema resuelto 12.1
Compara un reporte impuro con uno puro, publica el puro en dos destinos distintos y comprueba que un `record` con
copia defensiva no cambia cuando cambian sus datos de origen.

**Razonamiento:**
1. El impuro incrementa un contador global e imprime: dos llamadas deben dar textos distintos.
2. El puro solo transforma la lista: dos llamadas deben dar el mismo texto.
3. El destino del texto es un `Consumer`: la consola en producción, una lista en una prueba.
4. El constructor compacto del `record` copia la lista con `List.copyOf`; mutar la original no debe afectarlo.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class Pureza {

    record Envio(String id, List<String> paradas) {
        Envio {
            paradas = List.copyOf(paradas);       // copia defensiva: nadie la muta después
        }
    }

    static int reportesEmitidos = 0;

    // Impura: lee y cambia estado global, e imprime.
    static String reporteImpuro(List<Envio> envios) {
        reportesEmitidos++;
        String texto = "REPORTE#" + reportesEmitidos + ":" + envios.stream().map(Envio::id).toList();
        System.out.println(texto);
        return texto;
    }

    // Pura: el resultado depende solo de la entrada; no toca nada afuera.
    static String reportePuro(List<Envio> envios) {
        return "REPORTE:" + envios.stream().map(Envio::id).toList();
    }

    public static void main(String[] args) {
        List<Envio> envios = List.of(new Envio("A1", List.of("Bodega", "BOG")),
                new Envio("A2", List.of("MED")));

        String a = reporteImpuro(envios);
        String b = reporteImpuro(envios);
        System.out.println("impuro: misma entrada, mismo resultado? " + a.equals(b));

        String c = reportePuro(envios);
        String d = reportePuro(envios);
        System.out.println("puro:   misma entrada, mismo resultado? " + c.equals(d));

        // El efecto vive en el borde y se inyecta.
        Consumer<String> consola = System.out::println;
        List<String> capturado = new ArrayList<>();
        Consumer<String> prueba = capturado::add;
        consola.accept(reportePuro(envios));
        prueba.accept(reportePuro(envios));
        System.out.println("capturado en prueba=" + capturado);

        List<String> mutable = new ArrayList<>(List.of("BOG"));
        Envio e = new Envio("A3", mutable);
        mutable.add("CALI");
        System.out.println("paradas de A3 tras mutar la lista original=" + e.paradas());
    }
}
```

```text
$ java Pureza.java
REPORTE#1:[A1, A2]
REPORTE#2:[A1, A2]
impuro: misma entrada, mismo resultado? false
puro:   misma entrada, mismo resultado? true
REPORTE:[A1, A2]
capturado en prueba=[REPORTE:[A1, A2]]
paradas de A3 tras mutar la lista original=[BOG]
```

**Explicación por partes.**
- Líneas 16–21: `reporteImpuro` cambia `reportesEmitidos` e imprime. Por eso aparecen `REPORTE#1` y `REPORTE#2`.
- Líneas 24–26: `reportePuro` no toca nada fuera de su parámetro.
- Líneas 32–38: dos llamadas con la misma entrada. La impura da `false`; la pura, `true`.
- Líneas 41–46: el mismo texto puro va a la consola y a una lista. La lista permite verificarlo sin leer la consola.
- Líneas 48–51: `mutable.add("CALI")` cambia la lista original, pero `A3` conserva `[BOG]` gracias a `List.copyOf`.

> **Error común.** Intentar modificar una lista que el `record` ya copió como inmodificable.
> `envio.paradas().add("CALI")` termina con `Exception in thread "main" java.lang.UnsupportedOperationException`,
> sin mensaje, y la traza apunta a `ImmutableCollections.uoe`. Crea un `Envio` nuevo con la lista que necesitas.

> **Buena práctica.** Deja la E/S en la raíz del programa (`main`, el controlador, el consumidor de la cola) y pasa al
> núcleo solo datos. Cuando cambie el destino, solo cambia el `Consumer` que inyectas.

> **Ingeniería de software.** Un núcleo puro se prueba con datos de entrada y aserciones sobre la salida, sin mocks.
> Los mocks quedan para el borde, donde de verdad hay E/S (Java, Módulo 13, Tema 1).

#### Checkpoint 12.1
¿Es pura `ReporteEnvios.contarConTraza(Stream<Integer>, List<String>)`?

Respuesta: no. Agrega textos a la lista `traza` que recibe: modifica un objeto que se ve desde afuera.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta la comparación
Guarda el Problema resuelto 12.1 como `Pureza.java` y ejecuta `java Pureza.java`. Comprueba `false` para el impuro y
`true` para el puro.

#### Paso 2 · Localiza núcleo y borde en el proyecto
En `App.main`, la línea `String reporte = "REPORTE:" + ReporteEnvios.resumenIds(envios);` es cálculo puro y
`auditor.accept(reporte)` es el efecto. `ReporteEnvios` y `ReglasEnvio` no llaman a `System.out`: lo recibe `App` como `Consumer`.

#### Paso 3 · Provoca la UnsupportedOperationException
Escribe un programa que cree `new Envio("A1", List.of("Bodega", "BOG"))` y llame a `envio.paradas().add("CALI")`.
Lee la traza y cámbialo por la creación de un envío nuevo.

#### Resumen
- Una **función pura** depende solo de sus argumentos y no produce efectos observables.
- La **transparencia referencial** permite cambiar una llamada pura por su valor sin alterar el programa.
- En **núcleo funcional y borde imperativo**, el cálculo es puro y la E/S vive afuera.
- Inyectar el efecto como `Consumer` permite probar el reporte con una lista en vez de la consola.
- La copia defensiva en el constructor del `record` impide que cambien los datos del núcleo.

#### Ejercicio verificable 1
Básico. Clasifica como puras o impuras: `ReglasEnvio.etiqueta()`, el `Consumer` de `auditor`, `generadorId("TMP", 99)` y
`ReporteEnvios.contarConTraza`.

Respuesta esperada: `etiqueta()` es pura; `generadorId("TMP", 99)` es pura (siempre `TMP-99`); el `Consumer` que
imprime es impuro; `contarConTraza` es impura porque modifica la lista `traza`.

#### Ejercicio verificable 2
Intermedio. Convierte `reporteImpuro` en pura: recibe el número de reporte como parámetro y no imprime. ¿Qué devuelve
dos veces `reporte(envios, 1)`?

Respuesta esperada: dos veces `REPORTE#1:[A1, A2]`, y `equals` da `true`. El contador pasa al borde, que decide el número.

#### Ejercicio verificable 3
Reto. Escribe una prueba sin consola: crea `List<String> capturado`, pásale `capturado::add` como `Consumer` y publica
`reportePuro(envios)`. ¿Qué contiene la lista?

Respuesta esperada: `[REPORTE:[A1, A2]]`, igual que la línea `capturado en prueba=` del Problema resuelto 12.1.

#### En el trabajo
Esta separación se conoce como *functional core, imperative shell*. En un microservicio, el controlador HTTP o el
consumidor de Kafka es el borde; las reglas de precios o de validación son el núcleo. Las pruebas del núcleo corren en
milisegundos y no necesitan contenedores.

</details>

### Tema 13: Flow API: publicar datos con demanda y cierre · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- implementar un `Flow.Subscriber` que pide eventos por lotes con `request(n)`;
- publicar eventos con `SubmissionPublisher` y cerrarlo con try-with-resources;
- esperar el cierre del flujo con un `CompletableFuture` en lugar de `Thread.sleep`;
- leer el error `non-positive subscription request` y el `TimeoutException` de un suscriptor que deja de pedir.

**Conceptos clave:** Reactive Streams, Publisher, Subscriber, Subscription, backpressure, SubmissionPublisher

Ya los conoces y no se repiten: `CompletableFuture` (Java, Módulo 5, Tema 2); timeout y `TimeoutException` (Java,
Módulo 5, Tema 7); try-with-resources (Java, Módulo 3); `Consumer` (Tema 1 de este módulo).

#### El problema
Tienda Aurora publica eventos de cada envío: creado, validado, enviado. El auditor que los registra es más lento que
el emisor. Si el emisor empuja todo de golpe, el auditor acumula una cola sin límite. Y la prueba antigua esperaba
200 ms con `Thread.sleep`, a veces antes de que el auditor terminara. ¿Cómo controla el consumidor cuánto recibe y
cómo sabes que terminó?

#### Glosario del tema

**Reactive Streams**
- **Definición técnica:** especificación de interfaces y reglas para procesar flujos asíncronos con demanda controlada por el consumidor; Java 9 la incorporó en `java.util.concurrent.Flow`.
- **En palabras sencillas:** un acuerdo entre quien envía y quien recibe: el que recibe dice cuánto puede tomar.
- **Dónde se rompe la comparación:** el acuerdo trae reglas estrictas (por ejemplo, pedir 0 es un error); no es solo una costumbre.
- **Ejemplo:** `Flow.Publisher`, `Flow.Subscriber`, `Flow.Subscription` y `Flow.Processor` son las cuatro interfaces de la especificación.
- **Error típico:** creer que `Flow` trae operadores como `map` o `retry`; solo define el contrato. Los operadores vienen de Reactor, Mutiny o RxJava.

**Publisher**
- **Definición técnica:** `Flow.Publisher<T>`, interfaz con `subscribe(Subscriber<? super T>)`; produce elementos y los entrega a cada suscriptor según la demanda que este señala.
- **En palabras sencillas:** la emisora de eventos.
- **Dónde se rompe la comparación:** no decide el ritmo de entrega; lo decide la demanda del suscriptor.
- **Ejemplo:** el `SubmissionPublisher<Evento>` de la línea 52 del Problema resuelto 13.1.
- **Error típico:** publicar sin suscriptores y esperar que alguien reciba después; los eventos ya enviados no se repiten.

**Subscriber**
- **Definición técnica:** `Flow.Subscriber<T>`, interfaz con cuatro métodos: `onSubscribe`, `onNext`, `onError` y `onComplete`; los dos últimos son terminales y excluyentes.
- **En palabras sencillas:** el receptor, con cuatro avisos: «ya estás conectado», «llegó uno», «falló» y «se acabó».
- **Dónde se rompe la comparación:** los avisos llegan desde otro hilo; no ocurren dentro de la llamada a `submit`.
- **Ejemplo:** `Auditor` (líneas 10–47) registra cada aviso en el `log`.
- **Error típico:** no completar nada en `onError`; quien espera el final queda bloqueado hasta el timeout.

**Subscription**
- **Definición técnica:** `Flow.Subscription`, el vínculo entre un publisher y un suscriptor, con `request(long n)` para pedir `n` elementos más y `cancel()` para dejar de recibir.
- **En palabras sencillas:** el contrato firmado; con él pides más o te das de baja.
- **Dónde se rompe la comparación:** pedir es acumulativo: dos `request(2)` permiten cuatro entregas.
- **Ejemplo:** `s.request(lote)` (línea 26) y `subscription.request(lote)` (línea 34).
- **Error típico:** pedir `0` o un número negativo: `IllegalArgumentException: non-positive subscription request`.

**backpressure**
- **Definición técnica:** mecanismo por el cual el consumidor limita la velocidad del productor indicando cuántos elementos puede recibir.
- **En palabras sencillas:** el que recibe dice «mándame dos» y no le llega el tercero hasta que pide más.
- **Dónde se rompe la comparación:** si el productor genera más rápido, los elementos se acumulan en un búfer; cuando se llena, `submit` bloquea.
- **Ejemplo:** con lote 2, la salida muestra `REQUEST:2`, dos `NEXT`, otra vez `REQUEST:2` y el tercero.
- **Error típico:** pedir `Long.MAX_VALUE` en `onSubscribe` y anular el control sin darte cuenta.

**SubmissionPublisher**
- **Definición técnica:** implementación de `Flow.Publisher` en `java.util.concurrent` que entrega los elementos de `submit` de forma asíncrona, con un búfer por suscriptor; es `AutoCloseable` y `close()` emite `onComplete`.
- **En palabras sencillas:** una emisora lista para usar, con una sala de espera por cada oyente.
- **Dónde se rompe la comparación:** `onComplete` llega solo después de entregar lo pendiente; si el suscriptor no pide más, nunca llega.
- **Ejemplo:** el bloque try-with-resources de las líneas 52–57 publica tres eventos y cierra.
- **Error típico:** esperar con `Thread.sleep` a que termine; el tiempo varía entre equipos y la prueba se vuelve intermitente.

#### ► CÓMO FUNCIONA

`java.util.concurrent.Flow` reproduce las interfaces de la especificación Reactive Streams: `Publisher`,
`Subscriber`, `Subscription`, `Processor`. El punto clave es backpressure: el consumidor pide datos con `request(n)`.

**Visual (animdiagram, animado con fallback estático; fuente `visuals/temas/java/modulo-20-flow.html`; regeneración: editar el HTML/SVG en esa ruta):** [Flow API: backpressure por demanda](/visuals/temas/java/modulo-20-flow.html)

Lectura: el Subscriber controla la demanda con `request(n)`. El Publisher no debe inundarlo; con reduced motion el diagrama queda estático.

`SuscriptorAuditor` pide dos eventos, vuelve a pedir dos cuando lleva dos, y completa un `CompletableFuture<Void>` en
`onComplete()`/`onError()`. Salida verificada y repetible:

```text
NEXT:E1:creado
NEXT:E2:validado
NEXT:E3:enviado
DONE
```

Flow es la base estándar. Para pipelines reactivos reales con operadores ricos, timeouts, retries y schedulers,
normalmente se usa Reactor/Mutiny/RxJava. Flow te enseña el contrato.

```mermaid
sequenceDiagram
  participant P as SubmissionPublisher
  participant S as Auditor
  participant F as CompletableFuture
  P->>S: onSubscribe(subscription)
  S->>P: request(2)
  P->>S: onNext(E1)
  P->>S: onNext(E2)
  S->>P: request(2)
  P->>S: onNext(E3)
  Note over P: close()
  P->>S: onComplete()
  S->>F: complete(null)
```

#### Problema resuelto 13.1
Haz visible la demanda: registra cada `request` junto a los eventos. Ejecuta el flujo con lote 2 y con lote 0 y
espera el cierre con un `CompletableFuture` limitado a 2 segundos.

**Razonamiento:**
1. El suscriptor guarda la `Subscription` en `onSubscribe` y pide el primer lote ahí.
2. En `onNext` cuenta lo recibido; al completar un lote, pide otro.
3. `onComplete` y `onError` completan el futuro; `get(2, TimeUnit.SECONDS)` espera ese evento y no un temporizador.
4. Con lote 0, la especificación exige un error: debe llegar `onError`, no `onNext`.

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Flow;
import java.util.concurrent.SubmissionPublisher;
import java.util.concurrent.TimeUnit;

public class Demanda {

    record Evento(String id, String mensaje) {}

    static class Auditor implements Flow.Subscriber<Evento> {
        private final int lote;
        private final StringBuilder log;
        private final CompletableFuture<Void> terminado;
        private Flow.Subscription subscription;
        private int recibidos;

        Auditor(int lote, StringBuilder log, CompletableFuture<Void> terminado) {
            this.lote = lote;
            this.log = log;
            this.terminado = terminado;
        }

        @Override public void onSubscribe(Flow.Subscription s) {
            subscription = s;
            log.append("REQUEST:").append(lote).append('\n');
            s.request(lote);
        }

        @Override public void onNext(Evento e) {
            recibidos++;
            log.append("NEXT:").append(e.id()).append(':').append(e.mensaje()).append('\n');
            if (recibidos % lote == 0) {
                log.append("REQUEST:").append(lote).append('\n');
                subscription.request(lote);
            }
        }

        @Override public void onError(Throwable t) {
            log.append("ERROR:").append(t).append('\n');
            terminado.completeExceptionally(t);
        }

        @Override public void onComplete() {
            log.append("DONE").append('\n');
            terminado.complete(null);
        }
    }

    static String ejecutar(int lote) throws Exception {
        StringBuilder log = new StringBuilder();
        CompletableFuture<Void> terminado = new CompletableFuture<>();
        try (SubmissionPublisher<Evento> publisher = new SubmissionPublisher<>()) {
            publisher.subscribe(new Auditor(lote, log, terminado));
            publisher.submit(new Evento("E1", "creado"));
            publisher.submit(new Evento("E2", "validado"));
            publisher.submit(new Evento("E3", "enviado"));
        }
        try {
            terminado.get(2, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.append("get lanzó ").append(e.getClass().getSimpleName()).append('\n');
        }
        return log.toString();
    }

    public static void main(String[] args) throws Exception {
        System.out.print(ejecutar(2));
        System.out.println("--- lote 0 ---");
        System.out.print(ejecutar(0));
    }
}
```

```text
$ java Demanda.java
REQUEST:2
NEXT:E1:creado
NEXT:E2:validado
REQUEST:2
NEXT:E3:enviado
DONE
--- lote 0 ---
REQUEST:0
ERROR:java.lang.IllegalArgumentException: non-positive subscription request
get lanzó ExecutionException
```

**Explicación por partes.**
- Líneas 23–27: al suscribirse, el auditor guarda el vínculo, registra `REQUEST:2` y pide dos.
- Líneas 29–36: tras el segundo evento pide dos más; por eso `REQUEST:2` aparece entre `E2` y `E3`.
- Líneas 38–46: los dos avisos terminales completan el futuro, con error o sin él.
- Líneas 52–57: el try-with-resources llama a `close()`, que envía `onComplete` cuando se entregó lo pendiente.
- Líneas 58–62: `get` espera el cierre real. Con lote 0, `onError` recibe `non-positive subscription request` y `get` lanza `ExecutionException`.
- La sección de lote 2 dio la misma salida en ocho corridas seguidas en este entorno.

> **Error común.** Pedir `request(0)`. El publisher no entrega nada y llama a `onError` con
> `java.lang.IllegalArgumentException: non-positive subscription request`. Si tu `onError` no completa el futuro,
> quien espera se queda bloqueado hasta el timeout.

> **Error común.** Olvidar pedir el siguiente lote. Si quitas las líneas 32–35, el auditor recibe `E1` y `E2`, nunca
> `E3`, y `onComplete` no llega: `get` termina con `TimeoutException` a los 2 segundos.

> **Buena práctica.** Espera el final del flujo con un evento (`CompletableFuture`, `CountDownLatch`) y un timeout,
> nunca con `Thread.sleep`. El test del proyecto llama dos veces a `EventosEnvio.demo()` y exige la misma salida.

#### Checkpoint 13.1
Con lote 3 y tres eventos, ¿cuántas líneas `REQUEST` aparecen?

Respuesta: dos. Una en `onSubscribe` y otra después del tercer evento, porque `3 % 3 == 0`. Después llega `DONE`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Ejecuta el flujo
Guarda el Problema resuelto 13.1 como `Demanda.java` y ejecuta `java Demanda.java` varias veces. La sección de lote 2
debe ser idéntica en todas las corridas.

#### Paso 2 · Compara con el proyecto
`EventosEnvio.SuscriptorAuditor` es la misma idea sin las líneas `REQUEST`. La salida de `./gradlew -q run` termina
con los tres `NEXT` y `DONE`, y el test `flowEntregaEventos` exige dos veces la misma cadena.

#### Paso 3 · Provoca el timeout
En `Demanda.java`, comenta las líneas 32–35 y ejecuta. Observa que la ejecución tarda unos 2 segundos y termina con
`get lanzó TimeoutException`. Restaura las líneas.

#### Resumen
- **Reactive Streams** define el contrato; `java.util.concurrent.Flow` trae sus cuatro interfaces.
- El **Publisher** produce; el **Subscriber** recibe por cuatro avisos; la **Subscription** los une.
- Con **backpressure**, el consumidor fija el ritmo con `request(n)`.
- **SubmissionPublisher** entrega de forma asíncrona y su `close()` emite `onComplete` cuando ya no hay pendientes.
- El final se espera con un `CompletableFuture` y un timeout, nunca con `Thread.sleep`.

#### Ejercicio verificable 1
Básico. Ejecuta `ejecutar(1)`. ¿Cuántas líneas `REQUEST:1` aparecen?

Respuesta esperada: cuatro: una al suscribirse y una después de cada uno de los tres eventos. La última va seguida de `DONE`.

#### Ejercicio verificable 2
Intermedio. Ejecuta `ejecutar(3)` y escribe la salida.

Respuesta esperada: `REQUEST:3`, `NEXT:E1:creado`, `NEXT:E2:validado`, `NEXT:E3:enviado`, `REQUEST:3` y `DONE`.

#### Ejercicio verificable 3
Reto. Con lote 2, haz que el auditor no vuelva a pedir después del primer lote. ¿Qué imprime y por qué?

Respuesta esperada: `REQUEST:2`, `NEXT:E1:creado`, `NEXT:E2:validado` y `get lanzó TimeoutException`. `E3` queda en el
búfer, así que el publisher no puede emitir `onComplete`.

#### En el trabajo
Spring WebFlux, R2DBC y los clientes de Kafka reactivos se apoyan en este mismo contrato. Cuando una base de datos
lenta recibe filas a demanda, el servicio no se queda sin memoria. Entender `request(n)` ayuda a leer por qué un flujo
«se queda colgado»: casi siempre alguien dejó de pedir.

</details>

## Verificación real

Ejecutado el 2026-11-23 en `~/labs/aurora-m20` (macOS arm64, JDK 27.0.1.0.2 con toolchain Java 25, Gradle 9.9.1):

```bash
./gradlew -q test
./gradlew -q run
```

`./gradlew -q test`: **7 tests, 0 fallas** (`build/test-results/test/TEST-com.aurora.funcional.FuncionalTest.xml`). El test de Flow llama dos veces a `EventosEnvio.demo()` y exige la misma salida exacta, sin temporizadores.

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

**Comprobación adicional (2026-11-24, Linux x86_64, OpenJDK 25.0.5.1, `javac -Xlint:all -Werror` y `java`, sin
Gradle):** el código principal compila sin advertencias y `App` produce las mismas líneas, salvo una. La línea
`POR_ESTADO` salió `POR_ESTADO=[FALLIDO, ENTREGADO, PENDIENTE, EN_RUTA]`. No es un fallo del entorno:
`groupingBy(Envio::estado)` devuelve un `HashMap` y su orden no está garantizado (Tema 10). Con la fábrica
`() -> new EnumMap<>(EstadoEnvio.class)` la línea sale `POR_ESTADO=[PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO]` en ese
mismo entorno. Las pruebas JUnit no se ejecutaron allí.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `error: cannot infer type for local variable` con `(lambda expression needs an explicit target-type)` | La lambda no tiene tipo objetivo (por ejemplo, `var f = x -> x * 2;`) | Revisar a qué variable o parámetro se asigna | Declarar la interfaz funcional concreta: `UnaryOperator<Integer> f = x -> x * 2;` |
| `error: local variables referenced from a lambda expression must be final or effectively final` | Variable local mutada en la lambda | Compilador lo señala | Usar variable final/efectivamente final o acumulador explícito |
| `119.00` contra `107.10` | Comparar dos puntos del pipeline | Revisar si se aplicó descuento | `119.00` es tarifa con impuesto; `107.10` es tras descuento del 10 % |
| Efectos antes de la terminal | Confundir declaración con ejecución del stream | Añadir traza y ver cuándo aparece | Recordar que las operaciones intermedias son perezosas |
| `IllegalStateException: stream has already been operated upon` | Reutilizar un stream consumido | Contar cuántas terminales se aplican | Crear un stream nuevo desde la colección |
| Salida de Flow a medias o distinta entre corridas | Esperar con `Thread.sleep` | Repetir el test varias veces | Esperar a `onComplete()` con `CompletableFuture.get(timeout)` |
| Resultado paralelo inconsistente | Estado mutable compartido | Revisar arrays/cajas en `forEach` | Usar `reduce`/collectors sin estado compartido |
| Pérdida de centavos | Mezclar `double` con `BigDecimal` | Imprimir escala y valor | Construir `BigDecimal` desde `String` y fijar `RoundingMode` |

## Checklist de cierre

- [ ] Cada interfaz funcional se eligió por su forma de entrada/salida, no por moda.
- [ ] Las reglas de negocio llevan motivo y se componen sin anidar lambdas.
- [ ] Los cálculos son puros; imprimir o publicar queda en el borde.
- [ ] Los streams se tratan como recursos de un solo uso y se verifica la pereza.
- [ ] `Optional` comunica ausencia sin mensajes genéricos.
- [ ] El paralelismo no comparte estado mutable y se mide antes de adoptarse.
- [ ] Flow usa demanda explícita y espera al evento de cierre, no a un temporizador.

Siguiente paso natural: **Módulo 21 — APIs públicas, compatibilidad y evolución**. Allí las funciones y tipos que diseñaste se vuelven contrato para otros equipos; un cambio pequeño puede romper compatibilidad binaria o de fuente.
