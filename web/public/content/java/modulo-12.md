# Módulo 12: Patrones de diseño

Los patrones de diseño son soluciones probadas a problemas recurrentes. No son plantillas para copiar: son vocabulario y criterio. Un patrón bien aplicado hace explícita una intención y facilita un cambio esperado; uno mal aplicado añade indirección sin resolver presión real.

En este módulo construyes `tienda-aurora-java-m12`, un proyecto donde cada patrón aparece por una necesidad concreta de Tienda Aurora: construir objetos válidos, crear notificaciones por canal, variar precios, mantener familias de UI coherentes, copiar plantillas sin aliasing, integrar un proveedor, decorar comportamiento, simplificar un subsistema, tratar hojas y grupos con un mismo contrato, controlar acceso a un servicio caro, separar abstracción de canal y compartir estado inmutable. Cada patrón se define por cuatro ejes: **mecanismo**, **por qué existe**, **implicaciones** y **confusión común**.

## Visual del módulo

**Visual:** [Mapa de patrones por intención: creación, comportamiento y estructura](/visuals/temas/java/modulo-12-patrones.html)

Lectura: Patrones organizados por intención. El criterio es: problema real, presión de cambio y prueba que lo justifique.

## Prerrequisitos y bootstrap

```bash
java -version
gradle --version
mkdir -p tienda-aurora-java-m12/src/main/java/com/aurora/patrones/{ui,composite,proxy,bridge,flyweight,srp}
mkdir -p tienda-aurora-java-m12/src/test/java/com/aurora/patrones
cd tienda-aurora-java-m12
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25.

## Build y configuración

El wrapper fija Gradle; el toolchain fija Java. `-Werror` convierte los warnings del compilador en fallos del build.

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m12"
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

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.aurora.patrones.App"
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

### Tema 1: Builder — configuración paso a paso y validación · Básico · 35 min

**Mecanismo.** Un `Builder` acumula valores en su propio estado mutable, expone una API fluida (`return this`) y concentra la validación y la copia defensiva en `build()`. El producto final `Email` es inmutable: constructor privado, campos `final` y `List.copyOf`.

**Por qué existe.** Un constructor telescópico con seis parámetros opcionales es ilegible y permite combos inválidos. Los setters permiten estados intermedios inválidos. Builder separa *acumular datos* de *construir un objeto válido*.

**Implicaciones.** Añade una clase por producto y una capa de llamadas. A cambio, los invariantes viven en un solo punto (`build()`) y el objeto construido no puede mutarse. `tag()` rechaza etiquetas vacías y `build()` valida formato de correo, subject obligatorio y longitud máxima.

**Confusión común.** Confundirlo con “una clase con muchos setters”. La diferencia es que el builder no expone el producto hasta que `build()` valida. Para `Point(x, y)` o un DTO de dos campos, un constructor directo basta.

#### `src/main/java/com/aurora/patrones/Email.java`

```java
package com.aurora.patrones;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Value object inmutable construido con Builder.
 * El constructor es privado: la única forma de crear Email válido es por Builder.build().
 */
public final class Email {
    private static final Pattern EMAIL_SIMPLE = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final String to;
    private final String subject;
    private final String body;
    private final List<String> tags;

    private Email(Builder builder) {
        this.to = builder.to;
        this.subject = builder.subject;
        this.body = builder.body;
        this.tags = List.copyOf(builder.tags);
    }

    public String to() { return to; }
    public String subject() { return subject; }
    public String body() { return body; }
    public List<String> tags() { return tags; }

    @Override
    public String toString() {
        return "Email[to=" + to + ", subject=" + subject + ", tags=" + tags + "]";
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String to;
        private String subject;
        private String body = "";
        private final List<String> tags = new ArrayList<>();

        private Builder() {}

        public Builder to(String to) {
            this.to = Objects.requireNonNull(to, "to").trim();
            return this;
        }

        public Builder subject(String subject) {
            this.subject = Objects.requireNonNull(subject, "subject").trim();
            return this;
        }

        public Builder body(String body) {
            this.body = Objects.requireNonNull(body, "body");
            return this;
        }

        public Builder tag(String tag) {
            String normalized = Objects.requireNonNull(tag, "tag").trim();
            if (normalized.isEmpty()) {
                throw new IllegalArgumentException("tag no puede estar vacío");
            }
            this.tags.add(normalized);
            return this;
        }

        public Email build() {
            if (to == null || !EMAIL_SIMPLE.matcher(to).matches()) {
                throw new IllegalStateException("to debe ser un email válido: " + to);
            }
            if (subject == null || subject.isEmpty()) {
                throw new IllegalStateException("subject es obligatorio");
            }
            if (subject.length() > 120) {
                throw new IllegalStateException("subject excede 120 caracteres");
            }
            return new Email(this);
        }
    }
}
```

La prueba `builderValidaYConstruye` construye un `Email` válido y comprueba que `Email.builder().subject("Sin to").build()` lanza `IllegalStateException`. Esa excepción es la que realmente lanza el código de arriba, no `IllegalArgumentException`.

### Tema 2: Factory Method y Strategy · Intermedio · 40 min

**Mecanismo (Factory Method).** Un método de creación centraliza qué tipo concreto se instancia a partir de un parámetro (`"EMAIL"`, `"SMS"`). El cliente recibe la interfaz `Notificacion`.

**Por qué existe (Factory Method).** Sin él, el `switch` de creación se repite por el sistema. Aquí `NotificacionFactory.crear()` es el único lugar que decide.

**Implicaciones (Factory Method).** Agregar un canal exige tocar la factory. Si la creación necesita credenciales, pools o configuración, esta factory simple se queda corta: conviene un módulo de composición o DI.

**Confusión común (Factory Method).** Creer que toda factory es un “Factory Method” del GoF clásico con herencia. Aquí es una factory estática simple; el criterio útil es el mismo: concentrar la decisión de creación.

**Mecanismo (Strategy).** Una interfaz funcional `PricingStrategy` encapsula el algoritmo; `Checkout` recibe una implementación por constructor y llama a `total(subtotal)`. El lambda se pasa directamente: `new Checkout(sub -> sub.multiply(new BigDecimal("0.90")))`.

**Por qué existe (Strategy).** Las campañas de precio cambian. Sin Strategy, `Checkout` crece con un `if` por campaña y cada regla nueva obliga a modificar esa clase.

**Implicaciones (Strategy).** El contexto depende solo del contrato (DIP) y puede cambiar de algoritmo sin recompilar la clase. En este proyecto no hay `cambiarEstrategia`: se crea un `Checkout` distinto por campaña, que es suficiente para el caso.

**Confusión común (Strategy).** Confundirlo con Factory. Factory decide **qué objeto crear**; Strategy decide **cómo calcular**. Tampoco hace falta una clase concreta por estrategia: un lambda es una estrategia válida si la regla es estable.

#### `src/main/java/com/aurora/patrones/Notificacion.java`

```java
package com.aurora.patrones;

/** Producto creado por Factory Method: el remitente solo conoce el contrato. */
public interface Notificacion {
    String canal();
    String enviar(String destinatario, String mensaje);
}
```

#### `src/main/java/com/aurora/patrones/EmailNotificacion.java`

```java
package com.aurora.patrones;

public final class EmailNotificacion implements Notificacion {
    @Override
    public String canal() { return "EMAIL"; }

    @Override
    public String enviar(String destinatario, String mensaje) {
        return "[EMAIL] to=" + destinatario + " msg=" + mensaje;
    }
}
```

#### `src/main/java/com/aurora/patrones/SmsNotificacion.java`

```java
package com.aurora.patrones;

public final class SmsNotificacion implements Notificacion {
    @Override
    public String canal() { return "SMS"; }

    @Override
    public String enviar(String destinatario, String mensaje) {
        return "[SMS] to=" + destinatario + " msg=" + mensaje;
    }
}
```

#### `src/main/java/com/aurora/patrones/NotificacionFactory.java`

```java
package com.aurora.patrones;

/**
 * Factory Method simple: centraliza creación.
 * La decisión de QUÉ crear vive aquí; la lógica de negocio de notificación vive en el producto.
 */
public final class NotificacionFactory {
    private NotificacionFactory() {}

    public static Notificacion crear(String canal) {
        return switch (canal == null ? "" : canal.trim().toUpperCase()) {
            case "EMAIL" -> new EmailNotificacion();
            case "SMS" -> new SmsNotificacion();
            default -> throw new IllegalArgumentException("Canal no soportado: " + canal);
        };
    }
}
```

#### `src/main/java/com/aurora/patrones/PricingStrategy.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;

/** Strategy: encapsula un algoritmo de precio detrás de un contrato estable. */
@FunctionalInterface
public interface PricingStrategy {
    BigDecimal total(BigDecimal subtotal);
}
```

#### `src/main/java/com/aurora/patrones/Checkout.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Contexto que usa Strategy. No sabe si el precio es normal, VIP o promocional.
 * Solo depende del contrato PricingStrategy (DIP).
 */
public final class Checkout {
    private final PricingStrategy pricing;

    public Checkout(PricingStrategy pricing) {
        this.pricing = Objects.requireNonNull(pricing, "pricing");
    }

    public BigDecimal cobrar(BigDecimal subtotal) {
        BigDecimal base = Objects.requireNonNull(subtotal, "subtotal");
        if (base.signum() < 0) {
            throw new IllegalArgumentException("subtotal no puede ser negativo");
        }
        return pricing.total(base);
    }
}
```

La prueba `factoryYStrategy` comprueba `canal() == "EMAIL"` y usa `compareTo` para `90.00`; no compara `BigDecimal` con `equals` ni recorta ceros. `BigDecimal.equals` compara escala, por lo que `new BigDecimal("90")` no es igual a `new BigDecimal("90.00")`.

### Tema 3: Abstract Factory — familias de objetos compatibles · Intermedio · 45 min

**Mecanismo.** Una interfaz `TemaUiFactory` crea varios productos relacionados (`Boton`, `Input`). Cada fábrica concreta produce una familia completa. `PantallaCheckout` recibe una fábrica y crea todos sus componentes desde ella.

**Por qué existe.** El problema no es crear un botón, sino evitar mezclar claro y oscuro en la misma pantalla. La fábrica convierte la coherencia en una consecuencia del diseño.

**Implicaciones.** Agregar un producto a la familia obliga a modificar la interfaz y todas las fábricas. El costo se paga solo cuando los productos cambian juntos; con un único producto, una factory simple basta.

**Confusión común.** Confundirlo con la factory de canales del tema 2. Factory simple crea *un* producto variable; Abstract Factory crea *una familia* que debe permanecer compatible.

#### `src/main/java/com/aurora/patrones/ui/TemaUiFactory.java`

```java
package com.aurora.patrones.ui;
public interface TemaUiFactory {
    Boton crearBoton();
    Input crearInput();
}
```

#### `src/main/java/com/aurora/patrones/ui/Boton.java`

```java
package com.aurora.patrones.ui;
public interface Boton { String render(); }
```

#### `src/main/java/com/aurora/patrones/ui/Input.java`

```java
package com.aurora.patrones.ui;
public interface Input { String render(); }
```

#### `src/main/java/com/aurora/patrones/ui/ClaroUiFactory.java`

```java
package com.aurora.patrones.ui;
public final class ClaroUiFactory implements TemaUiFactory {
    @Override public Boton crearBoton() { return () -> "[CLARO][BOTON]Confirmar"; }
    @Override public Input crearInput() { return () -> "[CLARO][INPUT]email"; }
}
```

#### `src/main/java/com/aurora/patrones/ui/OscuroUiFactory.java`

```java
package com.aurora.patrones.ui;
public final class OscuroUiFactory implements TemaUiFactory {
    @Override public Boton crearBoton() { return () -> "[OSCURO][BOTON]Confirmar"; }
    @Override public Input crearInput() { return () -> "[OSCURO][INPUT]email"; }
}
```

#### `src/main/java/com/aurora/patrones/ui/PantallaCheckout.java`

```java
package com.aurora.patrones.ui;
import java.util.Objects;
public final class PantallaCheckout {
    private final Boton boton;
    private final Input input;
    public PantallaCheckout(TemaUiFactory factory) {
        TemaUiFactory f = Objects.requireNonNull(factory, "factory");
        this.boton = f.crearBoton();
        this.input = f.crearInput();
    }
    public String render() { return input.render() + " " + boton.render(); }
}
```

`render()` devuelve `"[CLARO][INPUT]email [CLARO][BOTON]Confirmar"` o `"[OSCURO][INPUT]email [OSCURO][BOTON]Confirmar"`; la prueba verifica que no aparezca la familia contraria en la misma pantalla.

### Tema 4: SOLID, patrones estructurales y cuándo NO aplicar un patrón · Intermedio · 40 min

SOLID aparece aquí de forma comprobable: **S**RP se demuestra con `CobroAcoplado` frente a la composición `PagoFacade` + `ProcesadorPagoDecorado` + `PagoExternoAdapter`; **O**pen/Closed se ve en `Checkout` (nueva campaña = nuevo lambda, no nuevo `if`); **L**iskov se cumple porque cualquier `Notificacion` o `ProcesadorPago` sustituye al contrato; **I**nterface Segregation se refleja en contratos pequeños (`Boton`, `Input`, `CanalEntrega`); **D**IP se cumple porque `Checkout` depende de `PricingStrategy` y `PagoFacade` depende de `ProcesadorPago`, nunca de implementaciones concretas.

La pregunta de diagnóstico es siempre la misma: *¿qué cambio espero y cuánto cuesta el diseño actual?* Si no hay cambio probable, la solución simple gana. Al final de este tema hay una comparación ejecutable entre una solución directa y una factory innecesaria.

#### Adapter — traducir un contrato incompatible

**Mecanismo.** `PagoExternoAdapter` implementa `ProcesadorPago` y delega en `PagoExterno.ejecutarPago(clienteId, centavos)`, convirtiendo `BigDecimal` a centavos con `RoundingMode.HALF_UP`.

**Por qué existe.** El proveedor externo no habla el lenguaje del dominio. No conviene importar su API en las reglas de negocio.

**Implicaciones.** La conversión monetaria y el redondeo viven en la frontera. Si el proveedor cambia, se cambia el adapter. `intValueExact()` falla si el monto no cabe en `int`.

**Confusión común.** Confundirlo con Facade. Adapter *traduce* una interfaz incompatible; Facade *simplifica* un subsistema compatible.

#### `src/main/java/com/aurora/patrones/ProcesadorPago.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;

public interface ProcesadorPago {
    String cobrar(String clienteId, BigDecimal monto);
}
```

#### `src/main/java/com/aurora/patrones/PagoExterno.java`

```java
package com.aurora.patrones;

/** API externa/legada con contrato incompatible al dominio. */
public final class PagoExterno {
    public String ejecutarPago(String clienteId, int centavos) {
        return "OK:" + clienteId + ":" + centavos;
    }
}
```

#### `src/main/java/com/aurora/patrones/PagoExternoAdapter.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/** Adapter: traduce el contrato del dominio al contrato del proveedor externo. */
public final class PagoExternoAdapter implements ProcesadorPago {
    private final PagoExterno externo;

    public PagoExternoAdapter(PagoExterno externo) {
        this.externo = Objects.requireNonNull(externo, "externo");
    }

    @Override
    public String cobrar(String clienteId, BigDecimal monto) {
        Objects.requireNonNull(clienteId, "clienteId");
        Objects.requireNonNull(monto, "monto");
        int centavos = monto.multiply(new BigDecimal("100"))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
        return externo.ejecutarPago(clienteId, centavos);
    }
}
```

#### Decorator — agregar comportamiento sin subclases

**Mecanismo.** `ProcesadorPagoDecorado` implementa la misma interfaz que su delegado, registra antes y después de la llamada y devuelve el resultado del delegado.

**Por qué existe.** Logging, métricas o retry son cortes transversales. Crear una subclase por combinación produce una explosión de clases.

**Implicaciones.** Se compone en runtime: `new ProcesadorPagoDecorado(new PagoExternoAdapter(new PagoExterno()))`. Cada capa añade indirección y debe ser observable; los logs JUL aparecen en la salida real de `run`.

**Confusión común.** Confundirlo con Proxy. Decorator *añade responsabilidades* manteniendo el contrato; Proxy *controla el acceso* al objeto real, normalmente sin que el cliente sepa que existe.

#### `src/main/java/com/aurora/patrones/ProcesadorPagoDecorado.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.logging.Logger;

/** Decorator: agrega comportamiento sin modificar la implementación base. */
public final class ProcesadorPagoDecorado implements ProcesadorPago {
    private static final Logger LOG = Logger.getLogger(ProcesadorPagoDecorado.class.getName());
    private final ProcesadorPago delegado;

    public ProcesadorPagoDecorado(ProcesadorPago delegado) {
        this.delegado = Objects.requireNonNull(delegado, "delegado");
    }

    @Override
    public String cobrar(String clienteId, BigDecimal monto) {
        LOG.info(() -> "iniciando cobro cliente=" + clienteId + " monto=" + monto);
        String resultado = delegado.cobrar(clienteId, monto);
        LOG.info(() -> "resultado=" + resultado);
        return resultado;
    }
}
```

#### Facade — simplificar un subsistema

**Mecanismo.** `PagoFacade.cobrarCliente()` valida `clienteId` y delega en el `ProcesadorPago` inyectado.

**Por qué existe.** El caso común no necesita exponer conversión, logging ni composición del procesador. La fachada reduce la superficie que el cliente debe conocer.

**Implicaciones.** No prohíbe el acceso avanzado: el cliente puede seguir usando `ProcesadorPago` directamente. Si la fachada acumula reglas de negocio, dejó de ser fachada.

**Confusión común.** Confundirla con un “objeto Dios” o con Adapter. Facade simplifica; Adapter traduce; un objeto Dios concentra responsabilidades que deberían estar separadas.

#### `src/main/java/com/aurora/patrones/PagoFacade.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.util.Objects;

/** Facade: expone una operación simple ocultando pasos internos. */
public final class PagoFacade {
    private final ProcesadorPago procesador;

    public PagoFacade(ProcesadorPago procesador) {
        this.procesador = Objects.requireNonNull(procesador, "procesador");
    }

    public String cobrarCliente(String clienteId, BigDecimal monto) {
        if (clienteId == null || clienteId.isBlank()) {
            throw new IllegalArgumentException("clienteId inválido");
        }
        return procesador.cobrar(clienteId, monto);
    }
}
```

#### Composite — hojas y grupos bajo un mismo contrato

**Mecanismo.** `ComponentePedido` define `total()` y `descripcion()`. `Articulo` es hoja; `Paquete` contiene `List<ComponentePedido>` y delega el cálculo a sus hijos, de modo que un paquete puede contener otros paquetes.

**Por qué existe.** El cliente no debería preguntar “¿es artículo o paquete?” para sumar. La estructura en árbol se manipula de forma uniforme.

**Implicaciones.** `total()` usa `reduce(BigDecimal.ZERO, BigDecimal::add)` en el orden de inserción; la descripción es recursiva. Añadir un nuevo tipo de componente exige implementar dos métodos del contrato.

**Confusión común.** Pensar que Composite es “una lista”. La lista es el detalle de almacenamiento; el patrón es la interfaz común que elimina el `if` por tipo.

#### `src/main/java/com/aurora/patrones/composite/ComponentePedido.java`

```java
package com.aurora.patrones.composite;

import java.math.BigDecimal;

/** Componente Composite: hojas y grupos comparten el mismo contrato. */
public interface ComponentePedido {
    BigDecimal total();
    String descripcion();
}
```

#### `src/main/java/com/aurora/patrones/composite/Articulo.java`

```java
package com.aurora.patrones.composite;

import java.math.BigDecimal;
import java.util.Objects;

/** Hoja del Composite: un artículo con precio propio. */
public record Articulo(String nombre, BigDecimal precio) implements ComponentePedido {

    public Articulo {
        Objects.requireNonNull(nombre, "nombre");
        Objects.requireNonNull(precio, "precio");
        if (precio.signum() < 0) {
            throw new IllegalArgumentException("precio negativo");
        }
    }

    @Override
    public BigDecimal total() { return precio; }

    @Override
    public String descripcion() { return nombre + "=" + precio; }
}
```

#### `src/main/java/com/aurora/patrones/composite/Paquete.java`

```java
package com.aurora.patrones.composite;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Compuesto del Composite: contiene hojas u otros paquetes. */
public final class Paquete implements ComponentePedido {

    private final String nombre;
    private final List<ComponentePedido> hijos = new ArrayList<>();

    public Paquete(String nombre) {
        this.nombre = Objects.requireNonNull(nombre, "nombre");
    }

    public Paquete anadir(ComponentePedido hijo) {
        hijos.add(Objects.requireNonNull(hijo, "hijo"));
        return this;
    }

    @Override
    public BigDecimal total() {
        return hijos.stream()
                .map(ComponentePedido::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public String descripcion() {
        String contenido = hijos.stream()
                .map(ComponentePedido::descripcion)
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
        return nombre + "[" + contenido + "]";
    }
}
```

#### Proxy — controlar el acceso al objeto real

**Mecanismo.** `ServicioReportesProxy` implementa `ServicioReportes`, comprueba la lista de clientes permitidos y memoriza resultados con `computeIfAbsent` sobre un `HashMap` sincronizado. El objeto real `ServicioReportesReal` cuenta sus llamadas con un `AtomicInteger`.

**Por qué existe.** Generar un informe es costoso y no todos los clientes deben poder pedirlo. El control de acceso y el cacheo son responsabilidades de frontera, no del cálculo del informe.

**Implicaciones.** `real.llamadas()` sigue en 1 aunque se pidan dos veces el mismo reporte; un cliente no autorizado recibe `SecurityException`. El `synchronized` protege el caché si varios hilos comparten el proxy.

**Confusión común.** Confundirlo con Decorator. Proxy decide *si* se llama al real y puede devolver un valor cacheado; Decorator siempre delega y añade comportamiento.

#### `src/main/java/com/aurora/patrones/proxy/ServicioReportes.java`

```java
package com.aurora.patrones.proxy;

/** Contrato compartido por el objeto real y su Proxy. */
public interface ServicioReportes {
    String generar(String clienteId);
}
```

#### `src/main/java/com/aurora/patrones/proxy/ServicioReportesReal.java`

```java
package com.aurora.patrones.proxy;

import java.util.concurrent.atomic.AtomicInteger;

/** Objeto real: costoso de crear y con efecto observable (cuenta llamadas). */
public final class ServicioReportesReal implements ServicioReportes {

    private final AtomicInteger llamadas = new AtomicInteger();

    @Override
    public String generar(String clienteId) {
        return "reporte:" + clienteId + ":" + llamadas.incrementAndGet();
    }

    public int llamadas() { return llamadas.get(); }
}
```

#### `src/main/java/com/aurora/patrones/proxy/ServicioReportesProxy.java`

```java
package com.aurora.patrones.proxy;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Proxy de control de acceso y cacheo: decide si se llama al real y cuándo.
 * El cliente ve el mismo contrato ServicioReportes.
 */
public final class ServicioReportesProxy implements ServicioReportes {

    private final ServicioReportesReal real;
    private final Set<String> permitidos;
    private final Map<String, String> cache = new HashMap<>();

    public ServicioReportesProxy(ServicioReportesReal real, Set<String> permitidos) {
        this.real = Objects.requireNonNull(real, "real");
        this.permitidos = Set.copyOf(Objects.requireNonNull(permitidos, "permitidos"));
    }

    @Override
    public String generar(String clienteId) {
        String id = Objects.requireNonNull(clienteId, "clienteId");
        if (!permitidos.contains(id)) {
            throw new SecurityException("sin acceso: " + id);
        }
        synchronized (cache) {
            return cache.computeIfAbsent(id, real::generar);
        }
    }
}
```

#### Bridge — separar abstracción e implementación

**Mecanismo.** `Alerta` es la abstracción (`emitir`) y `CanalEntrega` es el implementor (`enviar`). `AlertaUrgente` y `AlertaInformativa` refinan la abstracción; `CanalConsola` y `CanalMemoria` implementan el canal. Las dos jerarquías evolucionan por separado.

**Por qué existe.** Sin Bridge harían falta cuatro clases para dos tipos de alerta por dos canales (`UrgenteConsola`, `UrgenteMemoria`, `InformativaConsola` e `InformativaMemoria`). Con Bridge bastan dos abstracciones y dos canales, y cualquier combinación es posible en runtime.

**Implicaciones.** `AlertaInformativa(new CanalMemoria())` deja rastro en `memoria.enviados()`; `AlertaUrgente(new CanalConsola())` convierte el texto a mayúsculas antes de entregarlo. El cliente elige ambos ejes al construir.

**Confusión común.** Confundirlo con Strategy o Adapter. Strategy cambia un algoritmo detrás de una interfaz; Bridge separa dos jerarquías que varían por razones distintas. Adapter se usa cuando la interfaz ya existente es incompatible.

#### `src/main/java/com/aurora/patrones/bridge/CanalEntrega.java`

```java
package com.aurora.patrones.bridge;

/** Implementor del Bridge: cómo se entrega un mensaje. */
public interface CanalEntrega {
    String enviar(String texto);
}
```

#### `src/main/java/com/aurora/patrones/bridge/CanalConsola.java`

```java
package com.aurora.patrones.bridge;

/** Implementor concreto: entrega en consola. */
public final class CanalConsola implements CanalEntrega {
    @Override
    public String enviar(String texto) {
        return "[consola] " + texto;
    }
}
```

#### `src/main/java/com/aurora/patrones/bridge/CanalMemoria.java`

```java
package com.aurora.patrones.bridge;

import java.util.ArrayList;
import java.util.List;

/** Implementor concreto: entrega en memoria, conserva lo enviado. */
public final class CanalMemoria implements CanalEntrega {

    private final List<String> enviados = new ArrayList<>();

    @Override
    public String enviar(String texto) {
        enviados.add(texto);
        return "[memoria] " + texto;
    }

    public List<String> enviados() { return List.copyOf(enviados); }
}
```

#### `src/main/java/com/aurora/patrones/bridge/Alerta.java`

```java
package com.aurora.patrones.bridge;

import java.util.Objects;

/** Abstracción del Bridge: qué tipo de alerta se envía. */
public abstract class Alerta {

    protected final CanalEntrega canal;

    protected Alerta(CanalEntrega canal) {
        this.canal = Objects.requireNonNull(canal, "canal");
    }

    public abstract String emitir(String texto);
}
```

#### `src/main/java/com/aurora/patrones/bridge/AlertaUrgente.java`

```java
package com.aurora.patrones.bridge;

/** Abstracción refinada: urgente, independiente del canal elegido. */
public final class AlertaUrgente extends Alerta {

    public AlertaUrgente(CanalEntrega canal) {
        super(canal);
    }

    @Override
    public String emitir(String texto) {
        return canal.enviar("[URGENTE] " + texto.toUpperCase());
    }
}
```

#### `src/main/java/com/aurora/patrones/bridge/AlertaInformativa.java`

```java
package com.aurora.patrones.bridge;

/** Abstracción refinada: informativa, independiente del canal elegido. */
public final class AlertaInformativa extends Alerta {

    public AlertaInformativa(CanalEntrega canal) {
        super(canal);
    }

    @Override
    public String emitir(String texto) {
        return canal.enviar("[INFO] " + texto);
    }
}
```

#### Flyweight — compartir estado inmutable

**Mecanismo.** `EtiquetaFactory` mantiene un `ConcurrentHashMap<Clave, EtiquetaFlyweight>`. La clave (canal, estilo) es el estado intrínseco compartido; el producto se pasa como estado extrínseco a `renderizar(producto)`.

**Por qué existe.** Crear millones de etiquetas con el mismo canal y estilo malgasta memoria. Compartir la instancia reduce el número de objetos.

**Implicaciones.** `assertSame(primera, segunda)` y `tamanio() == 1` comprueban el compartimiento. El flyweight debe ser inmutable: si guardara el producto, todas las llamadas compartirían el mismo estado mutable.

**Confusión común.** Pensar que es un Singleton. Flyweight crea *una instancia por valor de estado intrínseco*; Singleton crea una instancia global para todo el proceso.

#### `src/main/java/com/aurora/patrones/flyweight/EtiquetaFlyweight.java`

```java
package com.aurora.patrones.flyweight;

/**
 * Estado intrínseco compartido (canal, estilo).
 * El estado extrínseco (producto) se pasa en cada llamada.
 */
public record EtiquetaFlyweight(String canal, String estilo) {

    public String renderizar(String producto) {
        return "[" + canal + "/" + estilo + "]" + producto;
    }
}
```

#### `src/main/java/com/aurora/patrones/flyweight/EtiquetaFactory.java`

```java
package com.aurora.patrones.flyweight;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/** Flyweight: una sola instancia por combinación canal/estilo. */
public final class EtiquetaFactory {

    private final Map<Clave, EtiquetaFlyweight> compartidas = new ConcurrentHashMap<>();

    public EtiquetaFlyweight obtener(String canal, String estilo) {
        return compartidas.computeIfAbsent(
                new Clave(canal, estilo),
                clave -> new EtiquetaFlyweight(clave.canal(), clave.estilo()));
    }

    public int tamanio() { return compartidas.size(); }

    private record Clave(String canal, String estilo) {
        private Clave {
            Objects.requireNonNull(canal, "canal");
            Objects.requireNonNull(estilo, "estilo");
        }
    }
}
```

#### SRP: refactorización comprobada, no enunciado

`CobroAcoplado` concentra cuatro razones para cambiar: validar entrada, convertir a centavos, ejecutar el cobro y componer la respuesta. Es el “antes” deliberado:

#### `src/main/java/com/aurora/patrones/srp/CobroAcoplado.java`

```java
package com.aurora.patrones.srp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Antes del refactor SRP: valida, convierte a centavos, simula el cobro y
 * compone la respuesta en un único método. Cuatro razones para cambiar.
 */
public final class CobroAcoplado {

    public String cobrar(String clienteId, BigDecimal monto) {
        if (clienteId == null || clienteId.isBlank()) {
            throw new IllegalArgumentException("clienteId inválido");
        }
        Objects.requireNonNull(monto, "monto");
        int centavos = monto.multiply(new BigDecimal("100"))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
        return "OK:" + clienteId + ":" + centavos;
    }
}
```

El “después” ya está implementado y mostrado archivo por archivo en este tema: `PagoFacade` valida, `ProcesadorPagoDecorado` registra, `PagoExternoAdapter` convierte y `PagoExterno` ejecuta. La prueba `refactorSrpConservaElResultado` obtiene `"OK:C-1:1990"` por ambos caminos y los compara. La refactorización no cambia el resultado observable; cambia quién puede modificar cada parte.

#### Sobre-ingeniería: comparación ejecutable

`SobreIngenieriaDemo` calcula el mismo descuento de dos formas: un lambda directo y una factory privada que devuelve ese mismo lambda. La prueba `sobreIngenieriaNoAportaComportamiento` usa `compareTo` y confirma que no hay diferencia de comportamiento.

#### `src/main/java/com/aurora/patrones/srp/SobreIngenieriaDemo.java`

```java
package com.aurora.patrones.srp;

import java.math.BigDecimal;

/** Comparación ejecutable: solución directa frente a abstracción innecesaria. */
public final class SobreIngenieriaDemo {

    private static final BigDecimal DESCUENTO = new BigDecimal("0.90");

    public BigDecimal descuentoDirecto(BigDecimal subtotal) {
        return subtotal.multiply(DESCUENTO);
    }

    /** Añade una factory y una interfaz sin introducir ninguna variación nueva. */
    public BigDecimal descuentoConFabricaInnecesaria(BigDecimal subtotal) {
        return new FactoryDeEstrategias().crear().total(subtotal);
    }

    private static final class FactoryDeEstrategias {
        public com.aurora.patrones.PricingStrategy crear() {
            return sub -> sub.multiply(DESCUENTO);
        }
    }
}
```

Veredicto: la factory añade una clase y un salto más sin introducir ninguna variación nueva. Se descarta. Si mañana aparecen tres campañas con reglas propias, Strategy ya está en `PricingStrategy` y no hace falta esta factory.

### Tema 5: Prototype: copiar un objeto sin compartir sus datos · Intermedio · 35 min

**Mecanismo.** `PlantillaCampana.copiar()` llama a un constructor con `new ArrayList<>(etiquetas)`. Es un constructor de copia explícito en lugar de `Cloneable`/`clone()`.

**Por qué existe.** Partir de una plantilla es más barato que reconstruirla. Pero una copia superficial compartiría la lista mutable y mutar la copia alteraría la plantilla.

**Implicaciones.** `etiquetas()` devuelve `List.copyOf(etiquetas)`, así que el estado interno no se filtra. `agregarEtiqueta()` muta la copia; la prueba comprueba que la base sigue siendo `["base"]`.

**Confusión común.** Usar `Object.clone()` por costumbre. `clone()` hace copia superficial por defecto y obliga a tratar `CloneNotSupportedException`; un constructor de copia es más explícito y no necesita `Cloneable`.

#### `src/main/java/com/aurora/patrones/PlantillaCampana.java`

```java
package com.aurora.patrones;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Prototype: crear nuevas campañas copiando una plantilla base.
 * La copia es profunda en la lista mutable de etiquetas para evitar aliasing.
 */
public final class PlantillaCampana {
    private final String canal;
    private final String asunto;
    private final List<String> etiquetas;

    public PlantillaCampana(String canal, String asunto, List<String> etiquetas) {
        this.canal = Objects.requireNonNull(canal, "canal");
        this.asunto = Objects.requireNonNull(asunto, "asunto");
        this.etiquetas = new ArrayList<>(Objects.requireNonNull(etiquetas, "etiquetas"));
    }

    /** Copia profunda: modifica la copia no afecta al original. */
    public PlantillaCampana copiar() {
        return new PlantillaCampana(canal, asunto, new ArrayList<>(etiquetas));
    }

    public void agregarEtiqueta(String etiqueta) {
        etiquetas.add(Objects.requireNonNull(etiqueta, "etiqueta"));
    }

    public String canal() { return canal; }
    public String asunto() { return asunto; }
    public List<String> etiquetas() { return List.copyOf(etiquetas); }
}
```

## Punto de entrada y verificación ejecutable

`App.java` ejecuta los doce patrones y las dos demostraciones SRP/sobre-ingeniería en un solo proceso. `PatronesTest.java` contiene las 11 pruebas que se ejecutan en la sección de verificación.

#### `src/main/java/com/aurora/patrones/App.java`

```java
package com.aurora.patrones;

import com.aurora.patrones.bridge.AlertaInformativa;
import com.aurora.patrones.bridge.AlertaUrgente;
import com.aurora.patrones.bridge.CanalConsola;
import com.aurora.patrones.bridge.CanalMemoria;
import com.aurora.patrones.composite.Articulo;
import com.aurora.patrones.composite.ComponentePedido;
import com.aurora.patrones.composite.Paquete;
import com.aurora.patrones.flyweight.EtiquetaFactory;
import com.aurora.patrones.proxy.ServicioReportesProxy;
import com.aurora.patrones.proxy.ServicioReportesReal;
import com.aurora.patrones.srp.CobroAcoplado;
import com.aurora.patrones.srp.SobreIngenieriaDemo;
import com.aurora.patrones.ui.ClaroUiFactory;
import com.aurora.patrones.ui.PantallaCheckout;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class App {

    public static void main(String[] args) {
        Email email = Email.builder()
                .to("ana@aurora.test")
                .subject("Bienvenida")
                .body("Hola Ana")
                .tag("onboarding")
                .build();
        System.out.println(email);

        Notificacion n = NotificacionFactory.crear("sms");
        System.out.println(n.enviar("+51999", "Tu pedido va en camino"));

        Checkout checkoutVip = new Checkout(sub -> sub.multiply(new BigDecimal("0.90")));
        System.out.println("vip=" + checkoutVip.cobrar(new BigDecimal("100.00")));

        PantallaCheckout pantalla = new PantallaCheckout(new ClaroUiFactory());
        System.out.println(pantalla.render());

        PlantillaCampana base = new PlantillaCampana("EMAIL", "Promo", new ArrayList<>(List.of("base")));
        PlantillaCampana copia = base.copiar();
        copia.agregarEtiqueta("vip");
        System.out.println("base=" + base.etiquetas() + " copia=" + copia.etiquetas());

        ProcesadorPago pago = new ProcesadorPagoDecorado(new PagoExternoAdapter(new PagoExterno()));
        PagoFacade facade = new PagoFacade(pago);
        System.out.println(facade.cobrarCliente("C-1", new BigDecimal("19.90")));

        ComponentePedido paquete = new Paquete("combo")
                .anadir(new Articulo("cafe", new BigDecimal("3.50")))
                .anadir(new Articulo("pan", new BigDecimal("2.00")));
        System.out.println(paquete.descripcion() + " total=" + paquete.total());

        var reportes = new ServicioReportesProxy(new ServicioReportesReal(), Set.of("C-1"));
        System.out.println(reportes.generar("C-1") + " " + reportes.generar("C-1"));

        System.out.println(new AlertaUrgente(new CanalConsola()).emitir("caida"));
        System.out.println(new AlertaInformativa(new CanalMemoria()).emitir("Pedido listo"));

        var etiquetas = new EtiquetaFactory();
        var primera = etiquetas.obtener("EMAIL", "promo");
        var segunda = etiquetas.obtener("EMAIL", "promo");
        System.out.println(primera.renderizar("Cafe") + " compartida=" + (primera == segunda));

        System.out.println("srp=" + new CobroAcoplado().cobrar("C-1", new BigDecimal("19.90")));
        BigDecimal subtotal = new BigDecimal("100.00");
        SobreIngenieriaDemo demo = new SobreIngenieriaDemo();
        System.out.println("sobreIngenieriaIgual=" + (demo.descuentoDirecto(subtotal)
                .compareTo(demo.descuentoConFabricaInnecesaria(subtotal)) == 0));
    }

    private App() {}
}
```

#### `src/test/java/com/aurora/patrones/PatronesTest.java`

```java
package com.aurora.patrones;

import com.aurora.patrones.bridge.AlertaInformativa;
import com.aurora.patrones.bridge.AlertaUrgente;
import com.aurora.patrones.bridge.CanalConsola;
import com.aurora.patrones.bridge.CanalMemoria;
import com.aurora.patrones.composite.Articulo;
import com.aurora.patrones.composite.ComponentePedido;
import com.aurora.patrones.composite.Paquete;
import com.aurora.patrones.flyweight.EtiquetaFactory;
import com.aurora.patrones.proxy.ServicioReportesProxy;
import com.aurora.patrones.proxy.ServicioReportesReal;
import com.aurora.patrones.srp.CobroAcoplado;
import com.aurora.patrones.srp.SobreIngenieriaDemo;
import com.aurora.patrones.ui.ClaroUiFactory;
import com.aurora.patrones.ui.OscuroUiFactory;
import com.aurora.patrones.ui.PantallaCheckout;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class PatronesTest {

    @Test
    void builderValidaYConstruye() {
        Email email = Email.builder().to("ana@aurora.test").subject("Hola").tag("ops").build();
        assertEquals("ana@aurora.test", email.to());
        assertEquals(List.of("ops"), email.tags());
        assertThrows(IllegalStateException.class, () -> Email.builder().subject("Sin to").build());
    }

    @Test
    void factoryYStrategy() {
        Notificacion n = NotificacionFactory.crear("email");
        assertEquals("EMAIL", n.canal());
        Checkout vip = new Checkout(sub -> sub.multiply(new BigDecimal("0.90")));
        assertEquals(0, new BigDecimal("90.00").compareTo(vip.cobrar(new BigDecimal("100.00"))));
    }

    @Test
    void abstractFactoryNoMezclaFamilia() {
        assertTrue(new PantallaCheckout(new ClaroUiFactory()).render().contains("[CLARO]"));
        assertTrue(new PantallaCheckout(new OscuroUiFactory()).render().contains("[OSCURO]"));
    }

    @Test
    void prototypeCopiaProfunda() {
        PlantillaCampana base = new PlantillaCampana("EMAIL", "Promo", List.of("base"));
        PlantillaCampana copia = base.copiar();
        copia.agregarEtiqueta("vip");
        assertEquals(List.of("base"), base.etiquetas());
        assertEquals(List.of("base", "vip"), copia.etiquetas());
    }

    @Test
    void adapterDecoratorFacade() {
        ProcesadorPago pago = new ProcesadorPagoDecorado(new PagoExternoAdapter(new PagoExterno()));
        String resultado = new PagoFacade(pago).cobrarCliente("C-1", new BigDecimal("19.90"));
        assertEquals("OK:C-1:1990", resultado);
    }

    @Test
    void compositeTrataHojaYGrupoIgual() {
        ComponentePedido hoja = new Articulo("cafe", new BigDecimal("3.50"));
        Paquete paquete = new Paquete("combo")
                .anadir(new Articulo("cafe", new BigDecimal("3.50")))
                .anadir(new Articulo("pan", new BigDecimal("2.00")));
        assertEquals("cafe=3.50", hoja.descripcion());
        assertEquals("combo[cafe=3.50, pan=2.00]", paquete.descripcion());
        assertEquals(0, new BigDecimal("5.50").compareTo(paquete.total()));
    }

    @Test
    void proxyControlaAccesoYCaches() {
        ServicioReportesReal real = new ServicioReportesReal();
        ServicioReportesProxy proxy = new ServicioReportesProxy(real, Set.of("C-1"));
        assertEquals("reporte:C-1:1", proxy.generar("C-1"));
        assertEquals("reporte:C-1:1", proxy.generar("C-1"));
        assertEquals(1, real.llamadas());
        assertThrows(SecurityException.class, () -> proxy.generar("C-2"));
    }

    @Test
    void bridgeSeparaAbstraccionYCanal() {
        CanalMemoria memoria = new CanalMemoria();
        assertEquals("[memoria] [INFO] Pedido listo", new AlertaInformativa(memoria).emitir("Pedido listo"));
        assertEquals(List.of("[INFO] Pedido listo"), memoria.enviados());
        assertEquals("[consola] [URGENTE] CAIDA", new AlertaUrgente(new CanalConsola()).emitir("caida"));
    }

    @Test
    void flyweightComparteEstadoIntrinseco() {
        EtiquetaFactory factory = new EtiquetaFactory();
        var primera = factory.obtener("EMAIL", "promo");
        var segunda = factory.obtener("EMAIL", "promo");
        assertSame(primera, segunda);
        assertEquals(1, factory.tamanio());
        assertEquals("[EMAIL/promo]Cafe", primera.renderizar("Cafe"));
        assertNotSame(primera, factory.obtener("SMS", "promo"));
        assertEquals(2, factory.tamanio());
    }

    @Test
    void refactorSrpConservaElResultado() {
        BigDecimal monto = new BigDecimal("19.90");
        String acoplado = new CobroAcoplado().cobrar("C-1", monto);
        ProcesadorPago pago = new ProcesadorPagoDecorado(new PagoExternoAdapter(new PagoExterno()));
        String refactorizado = new PagoFacade(pago).cobrarCliente("C-1", monto);
        assertEquals(acoplado, refactorizado);
        assertEquals("OK:C-1:1990", refactorizado);
    }

    @Test
    void sobreIngenieriaNoAportaComportamiento() {
        SobreIngenieriaDemo demo = new SobreIngenieriaDemo();
        BigDecimal subtotal = new BigDecimal("100.00");
        assertEquals(0, demo.descuentoDirecto(subtotal)
                .compareTo(demo.descuentoConFabricaInnecesaria(subtotal)));
    }
}
```

## Verificación real

Ejecutado el 2026-11-23 en `~/labs/aurora-m12` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25). Comandos: `./gradlew -q test` y `./gradlew -q run`. Con `-q`, Gradle no imprime las pruebas que pasan: el conteo se lee del XML de resultados. La salida observada fue:

```text
$ ./gradlew -q test
(salida vacía: Gradle -q solo muestra errores)
$ grep -h "<testsuite " build/test-results/test/*.xml
<testsuite name="com.aurora.patrones.PatronesTest" tests="11" skipped="0" failures="0" errors="0" timestamp="2026-11-23T08:19:20.628Z" hostname="MacBook-Pro-de-Nicolas.local" time="0.031">
$ ./gradlew -q run
Email[to=ana@aurora.test, subject=Bienvenida, tags=[onboarding]]
[SMS] to=+51999 msg=Tu pedido va en camino
vip=90.0000
[CLARO][INPUT]email [CLARO][BOTON]Confirmar
base=[base] copia=[base, vip]
nov 23, 2026 3:21:47 A. M. com.aurora.patrones.ProcesadorPagoDecorado cobrar
INFORMACIÓN: iniciando cobro cliente=C-1 monto=19.90
nov 23, 2026 3:21:47 A. M. com.aurora.patrones.ProcesadorPagoDecorado cobrar
INFORMACIÓN: resultado=OK:C-1:1990
OK:C-1:1990
combo[cafe=3.50, pan=2.00] total=5.50
reporte:C-1:1 reporte:C-1:1
[consola] [URGENTE] CAIDA
[memoria] [INFO] Pedido listo
[EMAIL/promo]Cafe compartida=true
srp=OK:C-1:1990
sobreIngenieriaIgual=true
```

Listado observable de pruebas (se añadió `--rerun-tasks` solo para que Gradle repita y muestre cada prueba; el resultado es el mismo):

```text
PatronesTest > adapterDecoratorFacade() PASSED
PatronesTest > proxyControlaAccesoYCaches() PASSED
PatronesTest > abstractFactoryNoMezclaFamilia() PASSED
PatronesTest > flyweightComparteEstadoIntrinseco() PASSED
PatronesTest > refactorSrpConservaElResultado() PASSED
PatronesTest > prototypeCopiaProfunda() PASSED
PatronesTest > builderValidaYConstruye() PASSED
PatronesTest > bridgeSeparaAbstraccionYCanal() PASSED
PatronesTest > sobreIngenieriaNoAportaComportamiento() PASSED
PatronesTest > compositeTrataHojaYGrupoIgual() PASSED
PatronesTest > factoryYStrategy() PASSED
BUILD SUCCESSFUL in 702ms
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Objeto inválido creado | Validación ausente en `build()` | Test con datos inválidos | Mover invariantes a `build()` |
| `switch` de creación repetido | Creación acoplada al cliente | Buscar `new` dispersos | Factory centralizada |
| `Checkout` crece con campañas | Regla variable incrustada | Contar `if` por campaña | Strategy con interfaz funcional |
| `assertEquals` falla con BigDecimal | Comparación de escala | Imprimir escala de ambos valores | Usar `compareTo` |
| UI mezcla estilos | Familias creadas sueltas | Revisar qué fábrica crea cada componente | Abstract Factory por familia |
| Copia muta la plantilla | Copia superficial de la lista | Modificar la copia en un test | `new ArrayList<>(etiquetas)` |
| Proveedor ensucia el dominio | Tipos externos en el core | Revisar imports y conversiones | Adapter en la frontera |
| Logs mezclados con negocio | Responsabilidad transversal dentro de la regla | Revisar razones de cambio | Decorator acotado |
| Clase con cuatro razones para cambiar | SRP violado | Comparar con la composición existente | `CobroAcoplado` → Facade + Decorator + Adapter |
| Más clases y el mismo resultado | Sobre-ingeniería | Comparar `descuentoDirecto` y `descuentoConFabricaInnecesaria` | Mantener la solución simple |
| `combo.total()` suma de más | Hijos repetidos o escalas mezcladas | Imprimir `descripcion()` | Revisar inserción y usar `compareTo` |
| Proxy no cachea | Se crea un proxy nuevo por llamada | Imprimir `real.llamadas()` | Reutilizar la misma instancia de proxy |
| Bridge produce clases combinadas | Abstracción e implementación acopladas | Contar clases por combinación | Dos jerarquías independientes |
| Flyweight crece sin límite | Clave incluye estado extrínseco | Imprimir `tamanio()` | Clave solo con estado intrínseco |

## Checklist de cierre

- [ ] Puedo explicar mecanismo, motivo, implicaciones y confusión de los doce patrones implementados.
- [ ] Distingo Factory, Abstract Factory, Builder, Composite y Flyweight por intención.
- [ ] Justifico Strategy frente a un `if/switch` creciente y verifico BigDecimal con `compareTo`.
- [ ] Demuestro copia profunda con `copiar()` y `agregarEtiqueta()`.
- [ ] Explico la equivalencia entre `CobroAcoplado` y la composición Facade/Decorator/Adapter.
- [ ] Identifico un caso de sobre-ingeniería y sé por qué se descarta.
- [ ] Ejecuté `./gradlew -q test` y `./gradlew -q run` con salida real.
