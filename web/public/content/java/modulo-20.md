# Módulo 20: Java funcional — interfaces que componen comportamiento

Cuando un flujo de envíos crece, el código imperativo suele mezclar tres cosas distintas: decidir si un envío es válido, transformar datos para un reporte, y ejecutar efectos como imprimir, guardar o publicar eventos. El resultado funciona, pero es frágil: probar una regla exige levantar todo el flujo, cambiar un formato rompe una validación, y un `for` con banderas oculta la intención de negocio.

Java no te obliga a elegir entre objetos y funciones. La opción útil es combinar ambos: objetos para modelar el dominio y funciones para pasar comportamiento pequeño y comprobable. En este módulo vas a construir `tienda-aurora-java-m20`, un mini-módulo de envíos donde las reglas se componen, los cálculos se prueban sin I/O, y los efectos quedan en el borde.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-20-interfaces-funcionales.html"
    alt="Interfaces funcionales: rol de cada una y composición en Flow"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Cada interfaz funcional expresa una forma de entrada/salida; el flujo compone reglas y efectos.</figcaption>
</figure>

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

#### Build: `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m20"
```

#### Build: `build.gradle.kts`

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

## Modelo de dominio base

Antes de hablar de lambdas, el dominio debe ser estable. Si el dato es mutable o inválido, la composición funcional solo hará más elegante el desastre.

#### `EstadoEnvio.java`

```java
package com.aurora.funcional;

public enum EstadoEnvio {
    PENDIENTE, EN_RUTA, ENTREGADO, FALLIDO
}
```

El `enum` evita estados mágicos. Un `switch` o un filtro sobre `EstadoEnvio.FALLIDO` es más seguro que comparar strings.

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

`List.copyOf` es una copia defensiva: quien construya el envío no puede mutar después la lista interna. Esta inmutabilidad hace que pasar `Envio` por streams y funciones sea predecible.

## Los 13 conceptos del módulo, aplicados al proyecto

### Tema 1: Las cuatro formas: Predicate, Function, Consumer y Supplier · Básico · 30 min

El JDK agrupa el comportamiento más común en cuatro formas. La diferencia no es sintáctica; es el contrato:

| Forma | Entrada | Salida | Pregunta que responde |
|---|---|---|---|
| `Predicate<T>` | `T` | `boolean` | ¿Cumple la condición? |
| `Function<T,R>` | `T` | `R` | ¿Cómo se transforma? |
| `Consumer<T>` | `T` | `void` | ¿Qué efecto aplico? |
| `Supplier<T>` | ninguna | `T` | ¿Cómo obtengo/creo un valor? |

El error típico es usar la forma equivocada por comodidad. Si una función “calcula y además imprime”, ya no es solo `Function`: mezcló cálculo con efecto.

#### Código: `ReglaEnvio.java`

Usamos `Predicate<Envio>` para la condición, pero lo envolvemos en un tipo de dominio porque una regla de negocio también necesita motivo. Nota: no es `@FunctionalInterface` porque tiene dos métodos abstractos; la factory `de(...)` sí acepta una lambda/predicate.

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

#### Código: `ReglasEnvio.java` (parte de las cuatro formas)

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

En `App`, estas formas se ven con intención clara:

```java
ReglaEnvio regla = ReglasEnvio.pesoMaximo(new BigDecimal("10")).and(ReglasEnvio.noFallido());
Predicate<Envio> valido = regla.asPredicate();
Function<Envio, String> etiqueta = ReglasEnvio.etiqueta();
Consumer<String> auditor = ReglasEnvio.auditor(System.out::println);
Supplier<String> idNuevo = ReglasEnvio.generadorId("TMP", 99);
System.out.println("ID=" + idNuevo.get());
ReporteEnvios.etiquetasValidas(envios, valido, etiqueta).forEach(auditor);
System.out.println("REGLA=" + regla.motivo());
```

Salida verificada de ese bloque:

```text
ID=TMP-99
A1@BOG
A4@CALI
REGLA=peso <= 10 Y no fallido
```

`A2` se excluye por peso y `A3` por estado fallido. La regla dice *por qué* es válida la composición.

### Tema 2: Function y BiFunction: transformar uno o dos datos · Básico · 35 min

`Function<T,R>` recibe un valor y produce otro. `BiFunction<T,U,R>` recibe dos. El criterio es simple: si necesitas dos entradas independientes para calcular un resultado, `BiFunction` es natural; si esos dos valores empiezan a tener reglas propias, crea un objeto.

En el proyecto, `tarifaConImpuesto()` calcula total con base e impuesto. `etiqueta()` transforma `Envio` a `String`.

```java
BiFunction<BigDecimal, BigDecimal, BigDecimal> tarifa = ReglasEnvio.tarifaConImpuesto();
BigDecimal total = tarifa.apply(new BigDecimal("100"), new BigDecimal("0.19"));
```

Resultado: `119.00` después de normalizar con `normalizarYRedondear()`. Si mañana el impuesto depende de país, zona o tipo de producto, el paso correcto no es agregar más parámetros a la `BiFunction`; es introducir un tipo de dominio.

### Tema 3: Componer sin anidar: andThen, compose, negate y reglas encadenadas · Intermedio · 40 min

La composición evita anidar llamadas como `f(g(h(x)))`. `andThen` lee en orden natural: primero esto, luego aquello. `compose` invierte el orden. En predicados, `and/or/negate` expresan lógica booleana.

`ReglaEnvio.and` compone condición y motivo. `normalizarYRedondear()` compone dos operadores:

```java
UnaryOperator<BigDecimal> noNegativo = v -> v.signum() < 0 ? BigDecimal.ZERO : v;
UnaryOperator<BigDecimal> dosDecimales = v -> v.setScale(2, java.math.RoundingMode.HALF_UP);
return noNegativo.andThen(dosDecimales);
```

Caso de borde: componer demasiado puede ocultar la intención. Si la cadena necesita un comentario para entenderse, extrae métodos con nombres de negocio o usa pasos explícitos.

### Tema 4: Streams como composición: pereza, orden y efectos que se esconden · Intermedio · 40 min

Un stream no ejecuta sus pasos intermedios cuando los declaras. Solo ejecuta cuando llega una operación terminal. Eso permite pipelines eficientes, pero también confunde si esperas efectos inmediatos.

#### Código: `ReporteEnvios.java` (pereza y orden)

```java
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
```

En `App`:

```java
List<String> traza = new ArrayList<>();
long cuenta = ReporteEnvios.contarConTraza(List.of(1, 2, 3, 4, 5).stream(), traza);
System.out.println("CUENTA=" + cuenta);
System.out.println("TRAZA=" + traza.size());
```

Salida verificada: `CUENTA=2`, `TRAZA=7`. La traza muestra que solo los valores pares pasan por `map`, y nada ocurre antes de `count()`.

Otro borde crítico: un stream se consume una vez. El test `streamEsPerezosoYSeConsumeUnaVez` espera `IllegalStateException` al contar dos veces el mismo stream.

### Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo · Intermedio · 35 min

`UnaryOperator<T>` es `Function<T,T>`; `BinaryOperator<T>` es `BiFunction<T,T,T>`. Úsalos cuando el tipo se conserva. Comunican mejor la intención que una función genérica.

```java
UnaryOperator<BigDecimal> descuento = ReglasEnvio.aplicarDescuento(new BigDecimal("0.10"));
BinaryOperator<BigDecimal> mayor = ReglasEnvio.mayorCosto();
```

Salida verificada:

```text
TOTAL=107.10
MAYOR=25
```

`TOTAL` viene de aplicar impuesto, descuento y normalización. Los operadores mantienen el dominio en `BigDecimal`, evitando conversiones accidentales.

### Tema 6: Referencias a métodos: escribir la operación sin repetirla · Intermedio · 40 min

Una referencia a método es una forma compacta de una lambda existente. No agrega magia; solo nombra un comportamiento ya disponible.

Formas útiles en este módulo:

- `Envio::destino` — método de instancia sobre cada elemento.
- `Envio::id` — extracción clara para collectors.
- `System.out::println` — efecto en el borde, inyectado como `Consumer`.
- `BigDecimal::add` — reducción/operación conocida.

```java
List<String> destinos = envios.stream().map(Envio::destino).distinct().sorted().toList();
```

Usa referencia a método cuando se lee mejor que la lambda. Si necesitas validar, transformar varias cosas o capturar contexto complejo, una lambda o un método nombrado puede ser más claro.

### Tema 7: Optional: buscar un envío que puede no existir · Intermedio · 40 min

`Optional<T>` modela ausencia en el retorno. Es ideal en consultas: buscar por id puede no encontrar nada. No es buena idea usarlo como campo de entidad o parámetro obligatorio.

#### Código: `EnvioRepository.java`

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

Uso verificado:

```text
OPT=A1
MISS=NA
```

Y el caso obligatorio falla con error claro: `IllegalArgumentException: envío obligatorio no encontrado: ZZ`. El mensaje importa: un `NoSuchElementException` genérico no ayuda en producción.

### Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar · Intermedio · 45 min

Las operaciones intermedias devuelven otro stream. Las más comunes:

- `filter`: conserva elementos que cumplen una condición.
- `map`: transforma uno a uno.
- `flatMap`: transforma uno a muchos y aplana.
- `distinct`: elimina duplicados por `equals/hashCode`.
- `sorted`: ordena; cuidado con el costo en colecciones grandes.

#### Código: `ReporteEnvios.java` (paradas normalizadas)

```java
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
```

Salida verificada: `PARADAS=[BODEGA, BOG, CALI, MED]`. Aquí `flatMap` es clave: cada envío tiene una lista de paradas; sin aplanar, terminarías con `Stream<List<String>>`.

### Tema 9: Streams terminales: encontrar, contar y combinar resultados · Intermedio · 45 min

La terminal cierra el pipeline. `count`, `max`, `min`, `findFirst`, `anyMatch`, `reduce`, `collect` y `forEach` son terminales. Después de una terminal, el stream ya no sirve.

```java
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
```

Salida verificada:

```text
MAS_CARO=A2
ENTREGADOS=1
SUMA=55000
```

`reduce` necesita identidad y operación asociativa. Para sumas es claro; para objetos mutables, prefiere collectors o un acumulador explícito.

### Tema 10: Collectors: formar listas, mapas, grupos y texto · Avanzado · 50 min

`collect` materializa el resultado. La elección del collector define el contrato de salida.

```java
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
```

Salida verificada:

```text
POR_ESTADO=[ENTREGADO, EN_RUTA, PENDIENTE, FALLIDO]
COSTO_DESTINO={BOG=18000, MED=25000, CALI=12000}
IDS=[A1, A2, A3, A4]
DEST_SET=[BOG, CALI, MED]
```

El `LinkedHashMap` preserva orden de aparición; `TreeSet` ordena. No son detalles cosméticos: el contrato de tu API depende de esto.

### Tema 11: Streams paralelos: comparar antes de acelerarlos · Avanzado · 50 min

`parallelStream()` divide el trabajo en tareas y las ejecuta en el ForkJoinPool común. Puede ayudar cuando hay muchos datos, operaciones costosas y CPU disponible. Puede empeorar cuando el dataset es pequeño, la operación es barata, hay I/O, o hay estado compartido.

Seguro:

```java
public static BigDecimal sumaParalelaSegura(List<BigDecimal> costos) {
    return costos.parallelStream().reduce(BigDecimal.ZERO, BigDecimal::add);
}
```

Inseguro (solo educativo):

```java
public static long sumaParalelaInsegura(List<Integer> valores) {
    final int[] caja = {0}; // mutable compartido: race condition
    valores.parallelStream().forEach(v -> caja[0] += v);
    return caja[0];
}
```

**Nota de verificación honesta:** no ejecuté JMH en esta corrida. La regla es medir con datos y hardware reales antes de dejar `parallelStream()` en producción. La corrección, en cambio, sí es verificable: no compartas estado mutable.

### Tema 12: Pureza y efectos: calcular separado de guardar o imprimir · Avanzado · 45 min

Una función pura depende solo de su entrada y no causa efectos observables. Eso la hace fácil de probar y componer. `ReporteEnvios` es puro: recibe listas, devuelve valores.

El efecto se hace en el borde:

```java
String reporte = "REPORTE:" + ReporteEnvios.resumenIds(envios);
auditor.accept(reporte); // efecto en el borde
```

Salida: `REPORTE:[A1, A2, A3, A4]`. Si mañana el reporte va a un logger, a Kafka o a HTTP, el cálculo no cambia.

### Tema 13: Flow API: publicar datos con demanda y cierre · Intermedio · 40 min

`java.util.concurrent.Flow` implementa Reactive Streams: `Publisher`, `Subscriber`, `Subscription`, `Processor`. El punto clave es backpressure: el consumidor pide datos con `request(n)`.

**Diagrama (animdiagram, animado con fallback estático):** [Flow API: backpressure por demanda](/visuals/temas/java/modulo-20-flow.html)

Lectura: el Subscriber controla la demanda con `request(n)`. El Publisher no debe inundarlo; con reduced motion el diagrama queda estático.

#### Código: `EventosEnvio.java`

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

Salida verificada:

```text
NEXT:E1:creado
NEXT:E2:validado
NEXT:E3:enviado
DONE
```

**Límite:** Flow es la base estándar. Para pipelines reactivos reales con operadores ricos, timeouts, retries y schedulers, normalmente se usa Reactor/Mutiny/RxJava. Flow te enseña el contrato.

## El borde de la aplicación: `App.java`

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

## Tests: el comportamiento se fija sin I/O

```java
package com.aurora.funcional;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
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

## Verificación real

Comandos ejecutados desde `/tmp/opencode/aurora-m20` el 2026-05-23 (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

Resultado de tests: **7 tests, 0 fallas**.

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

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `IllegalStateException: stream has already been operated upon or closed` | Reusar un stream | Buscar variables `Stream<T>` reutilizadas | Crear stream nuevo desde la fuente |
| Resultado distinto en paralelo | Estado mutable compartido o operación no asociativa | Ejecutar secuencial/paralelo y comparar; revisar lambdas con side effects | `reduce`/collector seguro; no mutar colecciones externas |
| `NoSuchElementException` | `Optional.get()` | Revisar uso de `get()` | `orElseThrow` con mensaje, `orElse`, `map` |
| Pipeline ilegible | Demasiada composición o nombres opacos | Si no se puede leer como frase, está mal | Extraer método nombrado o usar `for` claro |
| `NullPointerException` en `groupingBy` | Clave null o collector mal asumido | Revisar datos de entrada y contrato | Filtrar/normalizar nulos o usar collector con manejo explícito |

## Checklist de cierre

- [ ] Sabes elegir entre Predicate, Function, Consumer y Supplier por contrato, no por costumbre.
- [ ] Puedes explicar por qué un stream es perezoso y cuándo se consume.
- [ ] Usas Optional en retornos de consulta, no como parche general.
- [ ] Sabes cuándo `parallelStream()` es riesgo, no optimización automática.
- [ ] Separaste cálculo puro de efectos en el borde.

Siguiente paso natural: **Módulo 21 — APIs públicas, compatibilidad y evolución**. Allí las funciones y tipos que diseñaste se vuelven contrato para otros equipos; un cambio pequeño puede romper binario o fuente.
