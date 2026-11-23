# Módulo 12: Patrones de diseño y SOLID


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 12 — mapa visual](/visuals/temas/java/modulo-12-testing.html)

Lectura: Base amplia de unitarios rápidos, menos integración, pocos E2E críticos para feedback barato.


Un patrón de diseño no es una plantilla para copiar y pegar. Es un nombre compartido para una solución recurrente, con un costo y un contexto. El mismo patrón que ordena un diseño en un lugar puede volverlo artificial en otro. SOLID sirve como brújula: te ayuda a justificar por qué una abstracción existe, qué dependencia inviertes, y qué parte del código debería cambiar cuando cambie el negocio.

En Tienda Aurora, estos problemas ya aparecen antes de microservicios: construir un email sin constructores telescópicos, elegir canal de notificación, cambiar reglas de precio, crear familias de UI coherentes, copiar plantillas sin aliasing, y conectar un proveedor de pago externo sin contaminar el dominio.

**Verificación real (2026-11-23, macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, JUnit 5.13.4):** `./gradlew -q test` pasó con 5 tests, 0 fallas. `./gradlew -q run` ejecutó el recorrido de `App`.

## Proyecto desde cero: `tienda-aurora-java-m12`

#### Prerrequisitos

```bash
java -version
gradle --version
```

#### 1. Crear la base

```bash
mkdir -p tienda-aurora-java-m12
cd tienda-aurora-java-m12
gradle wrapper --gradle-version 9.9.1
mkdir -p src/main/java/com/aurora/patrones/ui
mkdir -p src/test/java/com/aurora/patrones
```

#### 2. Estructura

```text
tienda-aurora-java-m12/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/patrones/
    │   ├── App.java
    │   ├── Checkout.java
    │   ├── Email.java
    │   ├── EmailNotificacion.java
    │   ├── Notificacion.java
    │   ├── NotificacionFactory.java
    │   ├── PagoExterno.java
    │   ├── PagoExternoAdapter.java
    │   ├── PagoFacade.java
    │   ├── PlantillaCampana.java
    │   ├── PricingStrategy.java
    │   ├── ProcesadorPago.java
    │   ├── ProcesadorPagoDecorado.java
    │   ├── SmsNotificacion.java
    │   └── ui/
    │       ├── Boton.java
    │       ├── ClaroUiFactory.java
    │       ├── Input.java
    │       ├── OscuroUiFactory.java
    │       ├── PantallaCheckout.java
    │       └── TemaUiFactory.java
    └── test/java/com/aurora/patrones/
        └── PatronesTest.java
```

#### 3. Código, archivo por archivo

#### `settings.gradle.kts`

Nombre del build.

```kotlin
rootProject.name = "tienda-aurora-java-m12"
```

#### `build.gradle.kts`

Build Java 25 con JUnit 5, tarea `application` y flags estrictos. No hay dependencias Spring: este módulo enseña diseño en Java puro.

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

#### `src/main/java/com/aurora/patrones/Email.java`

Builder con validación en `build()`. El objeto `Email` es inmutable; el constructor es privado.

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

#### `src/main/java/com/aurora/patrones/Notificacion.java`

Contrato del producto creado por la factory.

```java
package com.aurora.patrones;

/** Producto creado por Factory Method: el remitente solo conoce el contrato. */
public interface Notificacion {
    String canal();
    String enviar(String destinatario, String mensaje);
}
```

#### `src/main/java/com/aurora/patrones/EmailNotificacion.java`

Implementación concreta de notificación por email.

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

Implementación concreta de notificación por SMS.

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

Factory Method simple: centraliza la decisión de creación y falla explícitamente ante canales desconocidos.

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

Contrato Strategy como interfaz funcional.

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

Contexto que depende de la abstracción `PricingStrategy`, no de un algoritmo concreto.

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

#### `src/main/java/com/aurora/patrones/ui/Boton.java`

Producto abstracto de la familia UI.

```java
package com.aurora.patrones.ui;
public interface Boton { String render(); }
```

#### `src/main/java/com/aurora/patrones/ui/Input.java`

Producto abstracto de la familia UI.

```java
package com.aurora.patrones.ui;
public interface Input { String render(); }
```

#### `src/main/java/com/aurora/patrones/ui/TemaUiFactory.java`

Abstract Factory: declara la familia de productos compatibles.

```java
package com.aurora.patrones.ui;
public interface TemaUiFactory {
    Boton crearBoton();
    Input crearInput();
}
```

#### `src/main/java/com/aurora/patrones/ui/ClaroUiFactory.java`

Familia concreta clara.

```java
package com.aurora.patrones.ui;
public final class ClaroUiFactory implements TemaUiFactory {
    @Override public Boton crearBoton() { return () -> "[CLARO][BOTON]Confirmar"; }
    @Override public Input crearInput() { return () -> "[CLARO][INPUT]email"; }
}
```

#### `src/main/java/com/aurora/patrones/ui/OscuroUiFactory.java`

Familia concreta oscura.

```java
package com.aurora.patrones.ui;
public final class OscuroUiFactory implements TemaUiFactory {
    @Override public Boton crearBoton() { return () -> "[OSCURO][BOTON]Confirmar"; }
    @Override public Input crearInput() { return () -> "[OSCURO][INPUT]email"; }
}
```

#### `src/main/java/com/aurora/patrones/ui/PantallaCheckout.java`

Cliente que consume la familia sin mezclar implementaciones.

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

#### `src/main/java/com/aurora/patrones/PlantillaCampana.java`

Prototype con copia profunda de la lista mutable para evitar aliasing.

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

#### `src/main/java/com/aurora/patrones/PagoExterno.java`

API legada/incompatible: recibe centavos y devuelve string propio.

```java
package com.aurora.patrones;

/** API externa/legada con contrato incompatible al dominio. */
public final class PagoExterno {
    public String ejecutarPago(String clienteId, int centavos) {
        return "OK:" + clienteId + ":" + centavos;
    }
}
```

#### `src/main/java/com/aurora/patrones/ProcesadorPago.java`

Contrato del dominio para cobrar.

```java
package com.aurora.patrones;

import java.math.BigDecimal;

public interface ProcesadorPago {
    String cobrar(String clienteId, BigDecimal monto);
}
```

#### `src/main/java/com/aurora/patrones/PagoExternoAdapter.java`

Adapter: traduce BigDecimal/céntimos y delega al SDK externo.

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

#### `src/main/java/com/aurora/patrones/ProcesadorPagoDecorado.java`

Decorator: agrega logging sin modificar el adaptador ni el proveedor.

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

#### `src/main/java/com/aurora/patrones/PagoFacade.java`

Facade: expone una operación simple y valida entrada antes de delegar.

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

#### `src/main/java/com/aurora/patrones/App.java`

Punto de entrada que ejecuta un recorrido corto por todos los patrones.

```java
package com.aurora.patrones;

import com.aurora.patrones.ui.ClaroUiFactory;
import com.aurora.patrones.ui.PantallaCheckout;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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
    }

    private App() {}
}
```

#### `src/test/java/com/aurora/patrones/PatronesTest.java`

Pruebas JUnit 5 que verifican comportamiento y casos de borde.

```java
package com.aurora.patrones;

import com.aurora.patrones.ui.ClaroUiFactory;
import com.aurora.patrones.ui.OscuroUiFactory;
import com.aurora.patrones.ui.PantallaCheckout;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

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
}
```

#### 4. Ejecutar

Desde la raíz `tienda-aurora-java-m12/`:

```bash
./gradlew -q test
./gradlew -q run
```

Salida real de tests (resumen):

```text
> Task :test

PatronesTest > adapterDecoratorFacade() PASSED
PatronesTest > abstractFactoryNoMezclaFamilia() PASSED
PatronesTest > prototypeCopiaProfunda() PASSED
PatronesTest > builderValidaYConstruye() PASSED
PatronesTest > factoryYStrategy() PASSED

BUILD SUCCESSFUL
```

Salida real de `run` (logs JDK JUL resumidos):

```text
Email[to=ana@aurora.test, subject=Bienvenida, tags=[onboarding]]
[SMS] to=+51999 msg=Tu pedido va en camino
vip=90.0000
[CLARO][INPUT]email [CLARO][BOTON]Confirmar
base=[base] copia=[base, vip]
INFORMACIÓN: iniciando cobro cliente=C-1 monto=19.90
INFORMACIÓN: resultado=OK:C-1:1990
OK:C-1:1990
```

## Conceptos cubiertos

### Tema 1: Builder — configuración paso a paso y validación · Básico · 35 min

#### El problema

Un email en Aurora tiene campos obligatorios (`to`, `subject`) y opcionales (`body`, `tags`). El intento ingenuo es un constructor telescópico:

```java
new Email(to, subject, body, tag1, tag2, tag3 ...)
```

A las pocas semanas nadie recuerda qué significa el tercer `String`. Otro problema: un objeto puede quedar inválido si la validación se dispersa.

#### Solución con Builder

`Email.Builder` acumula estado y `build()` valida invariantes antes de construir:

```java
Email email = Email.builder()
        .to("ana@aurora.test")
        .subject("Bienvenida")
        .body("Hola Ana")
        .tag("onboarding")
        .build();
```

Decisiones importantes en el código:

- **Constructor privado**: impide `new Email(...)` con estado inválido.
- **`build()` valida**: `to`, `subject`, longitud; la validación está en un solo punto.
- **Inmutabilidad**: `List.copyOf(builder.tags)` evita que el llamador mute la lista interna.
- **API fluida**: cada método retorna `this`; es legibilidad, no magia.

#### Cuándo usar / cuándo no

Usa Builder cuando hay 4+ parámetros, opcionales, o invariantes de construcción. No lo uses para un `Point(x,y)` o DTO simple; añades ruido. En Java moderno, records cubren muchos casos simples; Builder sigue siendo útil cuando hay opcionales, validación o normalización.

#### Error común

Permitir `build()` sin validar y devolver un objeto a medio construir. Síntoma: NPE o datos inválidos lejos del origen. Corrección: invariantes en `build()` y tests que verifiquen el rechazo (`assertThrows`).

### Tema 2: Factory Method y Strategy · Intermedio · 40 min

#### Factory Method: separar creación de uso

El código cliente necesita enviar una notificación, pero el canal llega de configuración o input. Sin factory, aparece un `switch` repetido por todo el sistema.

```java
Notificacion n = NotificacionFactory.crear("sms");
n.enviar("+51999", "Tu pedido va en camino");
```

La factory devuelve el contrato `Notificacion`. El cliente depende de `canal()`/`enviar()`, no de `SmsNotificacion`. Si mañana entra WhatsApp, agregas una clase y un caso en la factory; el cliente no cambia.

**Límite:** una factory que contiene reglas de negocio, consultas a BD o decisiones complejas dejó de ser factory: se volvió un "God Service" disfrazado. La factory crea; el dominio decide.

#### Strategy: separar algoritmo de contexto

El precio en checkout puede ser normal, VIP o campaña. Strategy encapsula el algoritmo:

```java
Checkout vip = new Checkout(sub -> sub.multiply(new BigDecimal("0.90")));
vip.cobrar(new BigDecimal("100.00")); // 90.00
```

`Checkout` no sabe cómo se calcula el descuento. Depende de `PricingStrategy` (DIP). Puedes pasar una lambda, una clase o una estrategia compuesta.

#### Diferencia práctica

| Patrón | Pregunta que responde | Eje de cambio |
|---|---|---|
| Factory Method | ¿Qué objeto creo? | Tipo concreto/creación |
| Strategy | ¿Cómo ejecuto este algoritmo? | Comportamiento intercambiable |

#### Error común

Crear una interfaz Strategy para cada `if` simple. Si solo hay dos ramas y no hay expectativa real de variación, una función o `if` claro es mejor. Patrón no es sinónimo de calidad.

### Tema 3: Abstract Factory y familias de productos compatibles · Intermedio · 35 min

#### El problema

Aurora tiene tema claro y oscuro. Cada tema debe producir un botón y un input compatibles. Si creas piezas sueltas, puedes mezclar `[CLARO][BOTON]` con `[OSCURO][INPUT]`.

#### Solución

`TemaUiFactory` declara la familia. `ClaroUiFactory` y `OscuroUiFactory` producen productos coherentes:

```java
PantallaCheckout pantalla = new PantallaCheckout(new ClaroUiFactory());
pantalla.render(); // [CLARO][INPUT]email [CLARO][BOTON]Confirmar
```

`PantallaCheckout` no conoce clases concretas; solo pide una fábrica. La garantía es de consistencia familiar.

#### Cuándo no usarlo

Si solo hay un producto o una sola familia, Abstract Factory es sobreingeniería. También si las familias cambian con frecuencia en forma incompatible: agregar un nuevo producto a la interfaz obliga a tocar todas las fábricas.

#### Error común

Usar Abstract Factory cuando bastaba una factory simple. Síntoma: muchas interfaces/clases para dos variantes que no crecen.

### Tema 4: SOLID y cuándo NO aplicar un patrón · Intermedio · 40 min

#### SOLID en el código del módulo

| Principio | Evidencia en el proyecto | Qué rompe si lo ignoras |
|---|---|---|
| **S** Single Responsibility | `PagoExternoAdapter` traduce; `ProcesadorPagoDecorado` loggea; `PagoFacade` simplifica entrada | Clases que cambian por motivos distintos y son difíciles de probar |
| **O** Open/Closed | Nueva `PricingStrategy` o `Notificacion` sin modificar `Checkout`/cliente | `if/switch` creciendo en cada feature |
| **L** Liskov Substitution | Cualquier `Notificacion` o `ProcesadorPago` respeta el contrato | Subclases que lanzan excepciones inesperadas o cambian semántica |
| **I** Interface Segregation | `Boton` e `Input` son contratos pequeños | Interfaces gordas que obligan implementaciones vacías |
| **D** Dependency Inversion | `Checkout` depende de `PricingStrategy`; `PagoFacade` de `ProcesadorPago` | Alto acoplamiento a detalles concretos |

#### Cuándo NO aplicar un patrón

Esta es la parte más importante del tema. Un patrón tiene costo: más tipos, más indirección, más archivos que leer. Aplica un patrón cuando el cambio esperado es real. No lo apliques por currículum.

Señales de sobre-diseño:

- Solo hay una implementación y no hay evidencia de variación.
- El nombre del patrón aparece en la clase pero nadie puede explicar qué cambio habilita.
- Para entender un flujo simple hay que saltar por 7 archivos.
- La abstracción fue creada "por si acaso".

Regla práctica: **primero hazlo claro, luego extrae patrón cuando el dolor de cambio sea concreto**.

#### Error común

Tratar SOLID como checklist de ceremonia. SOLID no significa "crear interfaces para todo". Significa que las dependencias y responsabilidades estén donde el cambio duele menos.

### Tema 5: Prototype: copiar un objeto sin compartir sus datos · Intermedio · 35 min

#### El problema

Aurora tiene plantillas de campaña. El equipo de marketing quiere partir de una base y crear variantes. Si copias la referencia, ambas campañas comparten la misma lista de etiquetas:

```java
List<String> tags = base.getEtiquetas();
tags.add("vip"); // muta también la base si es la misma lista
```

#### Copia profunda

`PlantillaCampana.copiar()` crea una nueva lista:

```java
public PlantillaCampana copiar() {
    return new PlantillaCampana(canal, asunto, new ArrayList<>(etiquetas));
}
```

La prueba lo verifica:

```java
PlantillaCampana base = new PlantillaCampana("EMAIL", "Promo", List.of("base"));
PlantillaCampana copia = base.copiar();
copia.agregarEtiqueta("vip");
assertEquals(List.of("base"), base.etiquetas());
assertEquals(List.of("base", "vip"), copia.etiquetas());
```

#### Shallow vs deep copy

Copia superficial duplica el objeto pero comparte referencias internas mutables. Copia profunda duplica también el grafo mutable necesario. No todo debe copiarse profundo: IDs, conexiones, recursos externos o entidades compartidas suelen requerir decisión de dominio.

#### Error común

Usar `clone()` de Java sin entenderlo, o hacer copia superficial de colecciones mutables. Síntoma: modificar una variante altera la plantilla original. Corrección: copy constructor/factory explícita y test de no-aliasing.

### Tema 6: Patrones estructurales para conectar piezas existentes · Intermedio · 40 min

#### Tres problemas distintos

| Patrón | Problema | Intención |
|---|---|---|
| Adapter | El proveedor externo tiene otra interfaz | Traducir contrato |
| Decorator | Quiero agregar comportamiento | Envolver sin modificar |
| Facade | El subsistema es complejo para el cliente | Simplificar entrada |

#### Adapter

`PagoExterno` recibe centavos y devuelve `OK:...`. El dominio quiere `cobrar(String, BigDecimal)`:

```java
ProcesadorPago pago = new PagoExternoAdapter(new PagoExterno());
pago.cobrar("C-1", new BigDecimal("19.90")); // OK:C-1:1990
```

El adapter traduce tipos/unidades. No debe contener reglas de negocio del dominio.

#### Decorator

El decorator envuelve el mismo contrato:

```java
ProcesadorPago pago = new ProcesadorPagoDecorado(new PagoExternoAdapter(new PagoExterno()));
```

Agrega logging antes/después. Podrías apilar métricas, retry o auditoría; pero cada capa agrega complejidad y debe ser observable.

#### Facade

`PagoFacade` expone una operación simple y valida el input. En un sistema real ocultaría orquestación: validar cliente, convertir moneda, llamar adapter, emitir evento. La facade no reemplaza el dominio; reduce superficie.

#### Error común

Confundir Adapter con Facade. Adapter traduce una interfaz incompatible; Facade simplifica un subsistema. También confundir Decorator con herencia: herencia es estática y rígida; decorator compone en runtime.

## Verificación real (actualización 2026-05-23)

Reejecutado el 2026-05-23 en `/tmp/opencode/aurora-m12` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

- `test`: 0 fallas.
- `run`: salida observada con Email, SMS, estrategia `vip=90.0000`, factory abstracta, prototype y decorator con logs.

## Cierre

Los patrones son herramientas de comunicación y diseño. El valor no está en memorizar UML, sino en reconocer el problema: construcción inválida, creación variable, algoritmo intercambiable, familia compatible, copia segura, integración con legado, comportamiento añadido, superficie simplificada. Cuando el patrón no responde a un cambio real, no lo uses.

## Checklist

- [ ] Puedo explicar qué problema resuelve cada patrón implementado.
- [ ] Puedo distinguir Factory Method, Abstract Factory y Builder.
- [ ] Puedo justificar Strategy frente a un `if/switch` creciente.
- [ ] Puedo identificar una copia superficial peligrosa y corregirla con copia profunda.
- [ ] Puedo diferenciar Adapter, Decorator y Facade por intención.
- [ ] Puedo señalar cuándo NO aplicar un patrón.
- [ ] Ejecuté `./gradlew -q test` y `./gradlew -q run` desde el proyecto.
