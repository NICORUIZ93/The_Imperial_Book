# Módulo 12: Patrones de diseño

Los patrones de diseño son soluciones probadas a problemas recurrentes de diseño. No son plantillas para copiar a ciegas: son vocabulario y criterio. Un patrón bien aplicado reduce acoplamiento, hace explícita una intención y facilita el cambio. Un patrón mal aplicado agrega indirección, clases extra y complejidad cognitiva sin resolver una presión real.

En este módulo vas a construir `tienda-aurora-java-m12`, un proyecto pequeño donde cada patrón aparece por una necesidad concreta de Tienda Aurora: construir objetos válidos, crear notificaciones por canal, variar estrategias de precio, generar familias de UI coherentes, copiar plantillas sin efectos secundarios, integrar un proveedor externo, decorar comportamiento y simplificar un subsistema.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-12-patrones.html"
    alt="Mapa de patrones por intención: creación, comportamiento y estructura"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Patrones organizados por intención. El criterio es: problema real, presión de cambio y prueba que lo justifique.</figcaption>
</figure>

## Prerrequisitos y bootstrap

```bash
java -version
gradle --version
mkdir -p tienda-aurora-java-m12/src/main/java/com/aurora/patrones/ui
mkdir -p tienda-aurora-java-m12/src/test/java/com/aurora/patrones
cd tienda-aurora-java-m12
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25.

## Build y configuración

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m12"
```

#### `build.gradle.kts`

Usa Java 25, JUnit 5 y compilación estricta. `-Werror` obliga a tratar warnings como defectos; esto mantiene el proyecto didáctico limpio.

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
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
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

### Tema 1: Builder — configuración paso a paso y validación · Básico · 35 min

El problema de construcción aparece cuando un objeto tiene campos obligatorios, opcionales e invariantes. Un constructor telescópico (`new Email(to, subject, body, tag1, tag2...)`) se vuelve ilegible y frágil. Un objeto mutable con setters permite estados inválidos intermedios. Builder separa la acumulación de datos de la construcción final: el método `build()` valida y devuelve un objeto consistente.

Usa Builder cuando hay varios parámetros opcionales, reglas de validación o normalización al construir. No lo uses para objetos pequeños y obvios (`Point(x,y)`, DTO simple); el costo de clases extra no se paga. En Java moderno, records cubren muchos casos simples; Builder sigue siendo útil cuando la construcción necesita pasos o validación.

#### `Email.java`

```java
package com.aurora.patrones;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class Email {

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

    public static Builder builder() {
        return new Builder();
    }

    public String to() { return to; }
    public String subject() { return subject; }
    public String body() { return body; }
    public List<String> tags() { return tags; }

    @Override
    public String toString() {
        return "Email[to=%s, subject=%s, tags=%s]".formatted(to, subject, tags);
    }

    public static final class Builder {
        private String to;
        private String subject;
        private String body = "";
        private final List<String> tags = new ArrayList<>();

        private Builder() { }

        public Builder to(String to) { this.to = Objects.requireNonNull(to, "to").trim(); return this; }
        public Builder subject(String subject) { this.subject = Objects.requireNonNull(subject, "subject").trim(); return this; }
        public Builder body(String body) { this.body = Objects.requireNonNull(body, "body"); return this; }
        public Builder tag(String tag) {
            String limpio = Objects.requireNonNull(tag, "tag").trim();
            if (!limpio.isEmpty()) { tags.add(limpio); }
            return this;
        }

        public Email build() {
            if (to == null || to.isBlank() || !to.contains("@")) {
                throw new IllegalArgumentException("to inválido: " + to);
            }
            if (subject == null || subject.isBlank()) {
                throw new IllegalArgumentException("subject es obligatorio");
            }
            if (subject.length() > 120) {
                throw new IllegalArgumentException("subject demasiado largo");
            }
            return new Email(this);
        }
    }
}
```

Puntos de diseño: constructor privado, validación en `build()`, copia defensiva/inmutable con `List.copyOf`, y API fluida (`return this`) solo como ergonomía. El error común es permitir `build()` sin validar y descubrir datos inválidos lejos del origen.

### Tema 2: Factory Method y Strategy · Intermedio · 40 min

Estos dos patrones suelen aparecer juntos, pero resuelven problemas distintos. Factory Method responde a **cómo crear** un objeto cuando el tipo concreto varía. Strategy responde a **cómo ejecutar** un algoritmo cuando la regla varía. Confundirlos lleva a fábricas que también calculan o estrategias que también instancian infraestructura innecesaria.

#### Factory Method

El código cliente necesita enviar una notificación, pero el canal llega de configuración o input. Sin factory, aparece un `switch` repetido por todo el sistema. Factory Method concentra la decisión de creación en un punto.

#### `Notificacion.java`

```java
package com.aurora.patrones;

public interface Notificacion {
    void enviar(String destino, String mensaje);
}
```

#### `EmailNotificacion.java`

```java
package com.aurora.patrones;

public final class EmailNotificacion implements Notificacion {
    @Override
    public void enviar(String destino, String mensaje) {
        System.out.println("Email[to=" + destino + ", subject=Notificación, tags=[]] cuerpo=" + mensaje);
    }
}
```

#### `SmsNotificacion.java`

```java
package com.aurora.patrones;

public final class SmsNotificacion implements Notificacion {
    @Override
    public void enviar(String destino, String mensaje) {
        System.out.println("[SMS] to=" + destino + " msg=" + mensaje);
    }
}
```

#### `NotificacionFactory.java`

```java
package com.aurora.patrones;

public final class NotificacionFactory {

    private NotificacionFactory() { }

    public static Notificacion crear(String canal) {
        return switch (canal == null ? "" : canal.toLowerCase()) {
            case "email" -> new EmailNotificacion();
            case "sms" -> new SmsNotificacion();
            default -> throw new IllegalArgumentException("Canal no soportado: " + canal);
        };
    }
}
```

El cliente depende de `Notificacion`, no de clases concretas. El límite del patrón: si la creación se vuelve compleja (credenciales, pools, configuración), una factory simple puede quedarse corta y conviene un módulo de composición o DI.

#### Strategy

El precio de Aurora cambia por campaña: normal, VIP, liquidación. Meter todo en `if/switch` dentro de `Checkout` hace crecer el método con cada regla nueva. Strategy encapsula cada algoritmo detrás de una interfaz.

#### `PricingStrategy.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;

@FunctionalInterface
public interface PricingStrategy {
    BigDecimal aplicar(BigDecimal subtotal);

    static PricingStrategy normal() { return total -> total; }
    static PricingStrategy vip() { return total -> total.multiply(new BigDecimal("0.90")); }
    static PricingStrategy liquidacion() { return total -> total.multiply(new BigDecimal("0.75")); }
}
```

#### `Checkout.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.util.Objects;

public final class Checkout {

    private PricingStrategy pricingStrategy;

    public Checkout(PricingStrategy pricingStrategy) {
        this.pricingStrategy = Objects.requireNonNull(pricingStrategy, "pricingStrategy");
    }

    public void cambiarEstrategia(PricingStrategy pricingStrategy) {
        this.pricingStrategy = Objects.requireNonNull(pricingStrategy, "pricingStrategy");
    }

    public BigDecimal total(BigDecimal subtotal) {
        Objects.requireNonNull(subtotal, "subtotal");
        if (subtotal.signum() < 0) {
            throw new IllegalArgumentException("subtotal no puede ser negativo");
        }
        return pricingStrategy.aplicar(subtotal).stripTrailingZeros();
    }
}
```

Diferencia práctica: Factory decide **qué objeto crear**; Strategy decide **cómo calcular**. Puedes combinarlos: una factory elige la estrategia por configuración.

### Tema 3: Abstract Factory — familias de objetos compatibles · Intermedio · 45 min

Abstract Factory crea familias de objetos relacionados sin acoplar el cliente a clases concretas. El problema real no es “crear un botón”, sino crear un botón, input y paleta que pertenezcan al mismo tema. Si el cliente instancia componentes sueltos, puede mezclar tema claro con oscuro.

#### `ui/TemaUiFactory.java`

```java
package com.aurora.patrones.ui;

public interface TemaUiFactory {
    Boton crearBoton(String texto);
    Input crearInput(String placeholder);
}
```

#### `ui/Boton.java`

```java
package com.aurora.patrones.ui;

public interface Boton {
    String render();
}
```

#### `ui/Input.java`

```java
package com.aurora.patrones.ui;

public interface Input {
    String render();
}
```

#### `ui/ClaroUiFactory.java`

```java
package com.aurora.patrones.ui;

public final class ClaroUiFactory implements TemaUiFactory {
    @Override public Boton crearBoton(String texto) { return () -> "[CLARO][BOTON]" + texto; }
    @Override public Input crearInput(String placeholder) { return () -> "[CLARO][INPUT]" + placeholder; }
}
```

#### `ui/OscuroUiFactory.java`

```java
package com.aurora.patrones.ui;

public final class OscuroUiFactory implements TemaUiFactory {
    @Override public Boton crearBoton(String texto) { return () -> "[OSCURO][BOTON]" + texto; }
    @Override public Input crearInput(String placeholder) { return () -> "[OSCURO][INPUT]" + placeholder; }
}
```

#### `ui/PantallaCheckout.java`

```java
package com.aurora.patrones.ui;

import java.util.List;

public final class PantallaCheckout {
    private final TemaUiFactory factory;
    public PantallaCheckout(TemaUiFactory factory) { this.factory = factory; }
    public List<String> render() {
        return List.of(factory.crearInput("email").render(), factory.crearBoton("Confirmar").render());
    }
}
```

La decisión de diseño es la consistencia: toda la pantalla sale de la misma fábrica. El costo es real: agregar un nuevo producto a la familia obliga a tocar la interfaz y todas las fábricas. Úsalo cuando la familia cambia junta; si solo hay un producto, una factory simple basta.

### Tema 4: SOLID y cuándo NO aplicar un patrón · Intermedio · 40 min

SOLID es un conjunto de principios para mantener el código cambiable sin volverlo frágil. En este módulo aparecen de forma concreta: **S**ingle Responsibility (Builder valida construcción; Facade orquesta caso simple), **O**pen/Closed (`Checkout` cambia estrategia sin modificar su código), **L**iskov (cualquier `Notificacion`/`ProcesadorPago` sustituye al contrato), **I**nterface Segregation (interfaces pequeñas: `Boton`, `Input`, `Notificacion`), **D**ependency Inversion (`Checkout` depende de `PricingStrategy`, no de implementaciones).

Los patrones no son objetivo en sí mismos. Aplicar un patrón sin presión real viola YAGNI y aumenta la carga cognitiva. La pregunta de diagnóstico es: *¿qué cambio espero y qué costo tiene el diseño actual?* Si no hay cambio probable, una solución simple y clara es mejor.

Los patrones estructurales de abajo muestran el mismo criterio: usarlos solo cuando la frontera o la extensión lo justifica.

#### Adapter y Decorator — integrar y extender sin herencia rígida

Ambos envuelven otro objeto, pero la intención es distinta. Adapter cambia la interfaz para que un cliente pueda usar algo incompatible. Decorator mantiene la interfaz y agrega comportamiento antes/después.

Ambos envuelven otro objeto, pero la intención es distinta. Adapter cambia la interfaz para que un cliente pueda usar algo incompatible. Decorator mantiene la interfaz y agrega comportamiento antes/después.

#### Adapter

Aurora tiene la interfaz `ProcesadorPago`, pero el proveedor externo `PagoExterno` expone `cobrarCentavos`. No conviene contaminar el dominio con tipos del proveedor.

#### `ProcesadorPago.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;

public interface ProcesadorPago {
    String cobrar(String clienteId, BigDecimal monto);
}
```

#### `PagoExterno.java`

```java
package com.aurora.patrones;

public final class PagoExterno {
    public String cobrarCentavos(String cliente, long centavos) {
        return "OK:" + cliente + ":" + centavos;
    }
}
```

#### `PagoExternoAdapter.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public final class PagoExternoAdapter implements ProcesadorPago {

    private final PagoExterno externo;

    public PagoExternoAdapter(PagoExterno externo) {
        this.externo = Objects.requireNonNull(externo, "externo");
    }

    @Override
    public String cobrar(String clienteId, BigDecimal monto) {
        Objects.requireNonNull(clienteId, "clienteId");
        Objects.requireNonNull(monto, "monto");
        long centavos = monto.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
        return externo.cobrarCentavos(clienteId, centavos);
    }
}
```

El adapter traduce tipos y semántica. Si el proveedor cambia, se cambia el adapter; el dominio sigue hablando `ProcesadorPago`.

#### Decorator

Ahora queremos logging sin modificar el procesador base ni crear una explosión de subclases.

#### `ProcesadorPagoDecorado.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.logging.Logger;

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

Se compone en runtime: `new ProcesadorPagoDecorado(new PagoExternoAdapter(new PagoExterno()))`. Puedes apilar métricas, retry o auditoría; cada capa agrega complejidad y debe ser observable.

#### Facade — simplificar un subsistema complejo

Facade ofrece una interfaz simple sobre un subsistema con varios pasos. No reemplaza el subsistema ni prohíbe el acceso avanzado; reduce la superficie para el caso común.

Facade ofrece una interfaz simple sobre un subsistema con varios pasos. No reemplaza el subsistema ni prohíbe el acceso avanzado; reduce la superficie para el caso común.

#### `PagoFacade.java`

```java
package com.aurora.patrones;

import java.math.BigDecimal;
import java.util.Objects;

public final class PagoFacade {

    private final ProcesadorPago procesador;

    public PagoFacade(ProcesadorPago procesador) {
        this.procesador = Objects.requireNonNull(procesador, "procesador");
    }

    public String cobrarSimple(String clienteId, BigDecimal monto) {
        if (clienteId == null || clienteId.isBlank()) {
            throw new IllegalArgumentException("clienteId inválido");
        }
        if (monto == null || monto.signum() <= 0) {
            throw new IllegalArgumentException("monto debe ser positivo");
        }
        return procesador.cobrar(clienteId, monto);
    }
}
```

En un sistema real la facade podría orquestar validación, conversión de moneda, adapter, emisión de evento y manejo de errores. La confusión común es confundir Facade con Adapter: Adapter traduce una interfaz incompatible; Facade simplifica un subsistema. También se confunde Facade con “Dios objeto”; si acumula reglas de negocio, dejó de ser una fachada.

### Tema 5: Prototype: copiar un objeto sin compartir sus datos · Intermedio · 35 min

Prototype crea un objeto copiando una instancia existente. Sirve cuando la construcción es costosa o cuando quieres partir de una plantilla. El riesgo principal es la copia superficial: si el objeto tiene listas u objetos mutables internos, clonar solo la referencia hace que original y copia compartan estado.

#### `PlantillaCampana.java`

```java
package com.aurora.patrones;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class PlantillaCampana implements Cloneable {

    private String nombre;
    private List<String> etiquetas;

    public PlantillaCampana(String nombre, List<String> etiquetas) {
        this.nombre = Objects.requireNonNull(nombre, "nombre");
        this.etiquetas = new ArrayList<>(Objects.requireNonNull(etiquetas, "etiquetas"));
    }

    public String nombre() { return nombre; }
    public List<String> etiquetas() { return etiquetas; }

    @Override
    public PlantillaCampana clone() {
        try {
            PlantillaCampana copia = (PlantillaCampana) super.clone();
            copia.etiquetas = new ArrayList<>(this.etiquetas); // copia profunda de la lista mutable
            return copia;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError("Cloneable pero no clonable", e);
        }
    }
}
```

`super.clone()` hace copia superficial; la línea crítica es `new ArrayList<>(this.etiquetas)`. Sin ella, agregar una etiqueta a la copia mutaría la plantilla base. En código moderno, muchas veces se prefiere un constructor de copia o factory estática explícita; el concepto es el mismo: controlar si el estado interno compartido se copia o se comparte.

## Punto de entrada y verificación ejecutable

#### `App.java`

```java
package com.aurora.patrones;

import com.aurora.patrones.ui.ClaroUiFactory;
import com.aurora.patrones.ui.PantallaCheckout;

import java.math.BigDecimal;
import java.util.List;

public final class App {

    private App() { }

    public static void main(String[] args) {
        Email email = Email.builder()
                .to("ana@aurora.test")
                .subject("Bienvenida")
                .body("Hola Ana")
                .tag("onboarding")
                .build();
        System.out.println(email);

        NotificacionFactory.crear("sms").enviar("+51999", "Tu pedido va en camino");

        Checkout checkout = new Checkout(PricingStrategy.vip());
        System.out.println("vip=" + checkout.total(new BigDecimal("100.00")));

        PantallaCheckout pantalla = new PantallaCheckout(new ClaroUiFactory());
        System.out.println(String.join(" ", pantalla.render()));

        PlantillaCampana base = new PlantillaCampana("Base", List.of("base"));
        PlantillaCampana copia = base.clone();
        copia.etiquetas().add("vip");
        System.out.println("base=" + base.etiquetas() + " copia=" + copia.etiquetas());

        ProcesadorPago pago = new ProcesadorPagoDecorado(new PagoExternoAdapter(new PagoExterno()));
        PagoFacade facade = new PagoFacade(pago);
        System.out.println(facade.cobrarSimple("C-1", new BigDecimal("19.90")));
    }
}
```

#### `PatronesTest.java`

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
        Email email = Email.builder().to("ana@aurora.test").subject("Hola").tag("vip").build();
        assertEquals("ana@aurora.test", email.to());
        assertThrows(IllegalArgumentException.class, () -> Email.builder().to("malo").subject("x").build());
    }

    @Test
    void factoryYStrategy() {
        assertNotNull(NotificacionFactory.crear("email"));
        Checkout checkout = new Checkout(PricingStrategy.normal());
        assertEquals(new BigDecimal("100"), checkout.total(new BigDecimal("100")));
        checkout.cambiarEstrategia(PricingStrategy.liquidacion());
        assertEquals(new BigDecimal("75.00"), checkout.total(new BigDecimal("100.00")));
    }

    @Test
    void abstractFactoryNoMezclaFamilia() {
        assertEquals("[CLARO][INPUT]email", new PantallaCheckout(new ClaroUiFactory()).render().get(0));
        assertEquals("[OSCURO][BOTON]Ok", new OscuroUiFactory().crearBoton("Ok").render());
    }

    @Test
    void prototypeCopiaProfunda() {
        PlantillaCampana base = new PlantillaCampana("Base", List.of("base"));
        PlantillaCampana copia = base.clone();
        copia.etiquetas().add("vip");
        assertEquals(List.of("base"), base.etiquetas());
        assertEquals(List.of("base", "vip"), copia.etiquetas());
    }

    @Test
    void adapterDecoratorFacade() {
        PagoFacade facade = new PagoFacade(new PagoExternoAdapter(new PagoExterno()));
        assertEquals("OK:C-1:1990", facade.cobrarSimple("C-1", new BigDecimal("19.90")));
        assertThrows(IllegalArgumentException.class, () -> facade.cobrarSimple("C-1", new BigDecimal("0")));
    }
}
```

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m12` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run
```

Resultados observados:

- `test`: 5 pruebas, 0 fallas (`builderValidaYConstruye`, `factoryYStrategy`, `abstractFactoryNoMezclaFamilia`, `prototypeCopiaProfunda`, `adapterDecoratorFacade`).
- `run` (salida real, logs JUL resumidos): Email construido, SMS enviado, `vip=90.0000`, `[CLARO][INPUT]email [CLARO][BOTON]Confirmar`, `base=[base] copia=[base, vip]`, logs de decorator y `OK:C-1:1990`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Objeto inválido creado | Validación ausente en constructor/builder | Test con datos inválidos | Mover invariantes a `build()`/constructor |
| `switch` repetido por el código | Creación acoplada al cliente | Buscar `new` concretos dispersos | Factory Method o composición |
| Algoritmo crece con `if` por campaña | Regla variable incrustada | Medir cambios por regla nueva | Strategy con interfaz clara |
| UI mezcla estilos | Familia creada sin fábrica | Revisar instanciación de componentes | Abstract Factory por familia |
| Copia muta original | Shallow copy de campos mutables | Modificar copia en test | Copia profunda/copy constructor |
| Integración externa ensucia dominio | Tipos/semántica del proveedor en core | Revisar imports y conversiones | Adapter en frontera |
| Clase con demasiadas responsabilidades | Logging/métricas dentro de negocio | Revisar razones de cambio | Decorator o aspecto bien acotado |
| “Facade” enorme | Acumuló reglas de negocio | Revisar tamaño/responsabilidad | Mantener facade delgada |

## Checklist de cierre

- [ ] Puedo explicar qué problema resuelve cada patrón implementado.
- [ ] Distingo Factory Method, Abstract Factory y Builder por intención.
- [ ] Puedo justificar Strategy frente a un `if/switch` creciente.
- [ ] Puedo identificar copia superficial peligrosa y corregirla.
- [ ] Distingo Adapter, Decorator y Facade.
- [ ] Sé cuándo NO aplicar un patrón.
- [ ] Ejecuté `./gradlew -q test` y `./gradlew -q run` con salida real.
