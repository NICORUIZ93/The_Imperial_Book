# Módulo 15: Java Master — builds, pruebas y observabilidad


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 15 — mapa visual](/visuals/temas/java/modulo-15-jvm-internals.html)

Lectura: La JVM carga/verifica bytecode, ejecuta con runtime/JIT y expone señales de GC/observabilidad.


Cuando Tienda Aurora pasa de ser un ejercicio a ser un proyecto mantenible, el problema ya no es solo escribir clases que compilen. El problema es que el build sea reproducible, que las dependencias estén controladas, que los módulos no se acoplen en círculos, que las pruebas den feedback rápido y que los logs permitan entender qué pasó en producción sin leer texto ambiguo.

Este módulo junta esas piezas en un proyecto pequeño pero real: `tienda-aurora-build`. El dominio calcula reservas; la aplicación de consola ejecuta el caso de uso y emite logs estructurados JSON con contexto de pedido. La separación por módulos obliga a decidir dónde vive cada responsabilidad. Las pruebas verifican la regla de negocio sin levantar infraestructura innecesaria.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, JUnit Jupiter 5.13.4, SLF4J 2.0.17, Logback 1.5.18, logstash-logback-encoder 8.1, macOS arm64. El proyecto se compiló y sus pruebas pasaron con `./gradlew -q test`. Las ejecuciones de `app:run` son reales; el caso rechazado devuelve exit code 2 por diseño y Gradle lo reporta como fallo de tarea, pero las líneas JSON y `RESERVA_RECHAZADA` son la salida real de la aplicación.

## Proyecto desde cero: tienda-aurora-build

El proyecto usa un build multi-módulo de Gradle. `domain` contiene el modelo y el caso de uso. `app` contiene el adaptador en memoria, la configuración de Logback y el punto de entrada. La dependencia apunta en una sola dirección: `app -> domain`. El dominio no conoce Logback, ni la consola, ni el formato JSON.

## Prerrequisitos

```bash
java -version
gradle --version
```

En el entorno de referencia, Gradle 9.9.1 resolvió el toolchain de Java 25 para compilar. Maven 3.10.0 está instalado en el entorno; la sección de Maven muestra comandos y configuración verificables, pero el build ejecutado en este módulo es el de Gradle.

## Estructura del proyecto

```text
tienda-aurora-build/
├── build.gradle.kts
├── settings.gradle.kts
├── domain/
│   ├── build.gradle.kts
│   └── src/
│       ├── main/java/com/aurora/build/domain/
│       │   ├── CatalogoProductos.java
│       │   ├── Dinero.java
│       │   ├── Producto.java
│       │   ├── ResultadoReserva.java
│       │   └── ServicioReservas.java
│       └── test/java/com/aurora/build/domain/
│           └── ServicioReservasTest.java
└── app/
    ├── build.gradle.kts
    └── src/
        ├── main/java/com/aurora/build/app/
        │   ├── CatalogoEnMemoria.java
        │   └── TiendaAuroraBuildApp.java
        ├── main/resources/
        │   └── logback.xml
        └── test/java/com/aurora/build/app/
            └── CatalogoEnMemoriaTest.java
```

## Código completo

El `settings.gradle.kts` raíz declara el nombre del build y los módulos incluidos. Aquí la decisión importante es visible: `domain` y `app` son módulos separados. El dominio no sabe que existe Logback ni la aplicación de consola; la app depende del dominio.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-build"
include("domain", "app")
```

El build raíz centraliza configuración compartida: grupo, versión, repositorio Maven Central, toolchain Java 25, compilación estricta y JUnit Platform. Esto evita repetir versiones y flags en cada módulo. `subprojects` aplica Java a ambos módulos; el módulo `app` añadirá además el plugin `application`.

**Archivo:** `build.gradle.kts`

```kotlin
plugins {
    base
}

allprojects {
    group = "com.aurora"
    version = "1.0.0"
    repositories {
        mavenCentral()
    }
}

subprojects {
    apply(plugin = "java-library")

    extensions.configure<JavaPluginExtension> {
        toolchain {
            languageVersion = JavaLanguageVersion.of(25)
        }
    }

    tasks.withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror", "-parameters"))
    }

    tasks.withType<Test>().configureEach {
        useJUnitPlatform()
    }
}
```

El módulo `domain` solo tiene dependencias de prueba JUnit Jupiter. No depende de SLF4J, Logback ni de frameworks web. Esa ausencia es una decisión de arquitectura: las reglas de negocio deben poder compilarse y probarse sin infraestructura.

**Archivo:** `domain/build.gradle.kts`

```kotlin
dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
```

El módulo `app` depende de `:domain`, usa SLF4J como fachada de logging, Logback como implementación y el encoder JSON de Logstash para emitir logs estructurados. Las dependencias de test quedan en `testImplementation`; Logback queda en `runtimeOnly` porque el código compila contra SLF4J, no contra Logback.

**Archivo:** `app/build.gradle.kts`

```kotlin
plugins {
    application
}

dependencies {
    implementation(project(":domain"))
    implementation("org.slf4j:slf4j-api:2.0.17")
    runtimeOnly("ch.qos.logback:logback-classic:1.5.18")
    runtimeOnly("net.logstash.logback:logstash-logback-encoder:8.1")

    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.aurora.build.app.TiendaAuroraBuildApp"
}
```

`Dinero` es un value object del dominio. Normaliza la escala a dos decimales y rechaza montos negativos. No tiene ninguna dependencia de logging ni de infraestructura; su contrato es puramente de negocio.

**Archivo:** `domain/src/main/java/com/aurora/build/domain/Dinero.java`

```java
package com.aurora.build.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record Dinero(BigDecimal monto) {

    public Dinero {
        Objects.requireNonNull(monto, "monto");
        monto = monto.setScale(2, RoundingMode.HALF_UP);
        if (monto.signum() < 0) {
            throw new IllegalArgumentException("monto negativo: " + monto);
        }
    }

    public static Dinero de(String valor) {
        return new Dinero(new BigDecimal(valor));
    }

    public Dinero multiplicar(int cantidad) {
        if (cantidad < 0) {
            throw new IllegalArgumentException("cantidad negativa: " + cantidad);
        }
        return new Dinero(monto.multiply(BigDecimal.valueOf(cantidad)));
    }

    public Dinero sumar(Dinero otro) {
        Objects.requireNonNull(otro, "otro");
        return new Dinero(monto.add(otro.monto));
    }
}
```

`Producto` representa un ítem del catálogo. Valida SKU y nombre. Al ser un record, deja claro que es un valor inmutable de dominio.

**Archivo:** `domain/src/main/java/com/aurora/build/domain/Producto.java`

```java
package com.aurora.build.domain;

import java.util.Objects;

public record Producto(String sku, String nombre, Dinero precio) {

    public Producto {
        sku = validarTexto(sku, "sku");
        nombre = validarTexto(nombre, "nombre");
        Objects.requireNonNull(precio, "precio");
    }

    private static String validarTexto(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(campo + " vacío");
        }
        return valor.trim();
    }
}
```

`ResultadoReserva` es el resultado explícito del caso de uso. En vez de devolver un mapa o imprimir desde el servicio, el dominio devuelve un dato tipado que la capa de aplicación puede loguear o mostrar.

**Archivo:** `domain/src/main/java/com/aurora/build/domain/ResultadoReserva.java`

```java
package com.aurora.build.domain;

import java.util.Objects;

public record ResultadoReserva(String pedidoId, String sku, int cantidad, Dinero total) {

    public ResultadoReserva {
        if (pedidoId == null || pedidoId.isBlank()) {
            throw new IllegalArgumentException("pedidoId vacío");
        }
        if (sku == null || sku.isBlank()) {
            throw new IllegalArgumentException("sku vacío");
        }
        if (cantidad <= 0) {
            throw new IllegalArgumentException("cantidad inválida: " + cantidad);
        }
        Objects.requireNonNull(total, "total");
    }
}
```

`CatalogoProductos` es un puerto: una interfaz pequeña definida por el dominio. El servicio de reservas depende de esta abstracción, no de una base de datos ni de un mapa en memoria. Esa inversión de dependencia es lo que permite probar el dominio con dobles simples.

**Archivo:** `domain/src/main/java/com/aurora/build/domain/CatalogoProductos.java`

```java
package com.aurora.build.domain;

import java.util.Optional;

public interface CatalogoProductos {
    Optional<Producto> buscarPorSku(String sku);
}
```

`ServicioReservas` contiene la regla de negocio. Valida entrada, busca el producto por el puerto, calcula el total y devuelve `ResultadoReserva`. Si algo falta, lanza una excepción con mensaje claro. Observa lo que no hace: no configura loggers, no lee archivos, no conoce JSON. Eso mantiene el dominio fácil de probar.

**Archivo:** `domain/src/main/java/com/aurora/build/domain/ServicioReservas.java`

```java
package com.aurora.build.domain;

import java.util.Objects;

public final class ServicioReservas {

    private final CatalogoProductos catalogo;

    public ServicioReservas(CatalogoProductos catalogo) {
        this.catalogo = Objects.requireNonNull(catalogo, "catalogo");
    }

    public ResultadoReserva reservar(String pedidoId, String sku, int cantidad) {
        if (pedidoId == null || pedidoId.isBlank()) {
            throw new IllegalArgumentException("pedidoId vacío");
        }
        if (sku == null || sku.isBlank()) {
            throw new IllegalArgumentException("sku vacío");
        }
        if (cantidad <= 0) {
            throw new IllegalArgumentException("cantidad inválida: " + cantidad);
        }
        Producto producto = catalogo.buscarPorSku(sku)
                .orElseThrow(() -> new IllegalArgumentException("producto no encontrado: " + sku));
        Dinero total = producto.precio().multiplicar(cantidad);
        return new ResultadoReserva(pedidoId.trim(), producto.sku(), cantidad, total);
    }
}
```

La prueba de dominio usa JUnit Jupiter. El catálogo se reemplaza por una lambda que implementa `CatalogoProductos`; ese es un doble simple, suficiente porque la interfaz tiene un solo método. La prueba verifica el total calculado y el mensaje de error cuando el producto no existe. No levanta Spring, no escribe logs JSON y corre rápido.

**Archivo:** `domain/src/test/java/com/aurora/build/domain/ServicioReservasTest.java`

```java
package com.aurora.build.domain;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ServicioReservasTest {

    @Test
    void calculaTotalDeReserva() {
        CatalogoProductos catalogo = sku -> Optional.ofNullable(Map.of(
                "CAF-001", new Producto("CAF-001", "Café Aurora", Dinero.de("12.50"))
        ).get(sku));
        ServicioReservas servicio = new ServicioReservas(catalogo);

        ResultadoReserva resultado = servicio.reservar("PED-100", "CAF-001", 2);

        assertEquals("PED-100", resultado.pedidoId());
        assertEquals("CAF-001", resultado.sku());
        assertEquals(Dinero.de("25.00"), resultado.total());
    }

    @Test
    void fallaCuandoProductoNoExiste() {
        ServicioReservas servicio = new ServicioReservas(sku -> Optional.empty());

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> servicio.reservar("PED-101", "NO-EXISTE", 1));

        assertEquals("producto no encontrado: NO-EXISTE", error.getMessage());
    }
}
```

`CatalogoEnMemoria` es un adaptador de infraestructura para la demo. Implementa el puerto del dominio con un `Map` fijo. En un sistema real podría ser JDBC, JPA o un cliente HTTP; el servicio de dominio no cambiaría.

**Archivo:** `app/src/main/java/com/aurora/build/app/CatalogoEnMemoria.java`

```java
package com.aurora.build.app;

import com.aurora.build.domain.CatalogoProductos;
import com.aurora.build.domain.Dinero;
import com.aurora.build.domain.Producto;

import java.util.Map;
import java.util.Optional;

public final class CatalogoEnMemoria implements CatalogoProductos {

    private final Map<String, Producto> productos = Map.of(
            "CAF-001", new Producto("CAF-001", "Café Aurora", Dinero.de("12.50")),
            "TET-002", new Producto("TET-002", "Tetera Norte", Dinero.de("45.00"))
    );

    @Override
    public Optional<Producto> buscarPorSku(String sku) {
        return Optional.ofNullable(productos.get(sku));
    }
}
```

La aplicación es la frontera. Aquí sí tiene sentido usar logging estructurado: recibe un pedido, coloca contexto en el MDC, registra inicio, confirma o rechaza, y limpia el MDC en `finally`. El `try/finally` garantiza que el contexto no se quede pegado al hilo si más adelante ese hilo atiende otro pedido. También se usa SLF4J con placeholders (`{}`), no concatenación.

**Archivo:** `app/src/main/java/com/aurora/build/app/TiendaAuroraBuildApp.java`

```java
package com.aurora.build.app;

import com.aurora.build.domain.ResultadoReserva;
import com.aurora.build.domain.ServicioReservas;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public final class TiendaAuroraBuildApp {

    private static final Logger log = LoggerFactory.getLogger(TiendaAuroraBuildApp.class);

    public static void main(String[] args) {
        String pedidoId = argumento(args, 0, "PED-100");
        String sku = argumento(args, 1, "CAF-001");
        int cantidad = Integer.parseInt(argumento(args, 2, "2"));

        ServicioReservas servicio = new ServicioReservas(new CatalogoEnMemoria());
        MDC.put("pedidoId", pedidoId);
        MDC.put("sku", sku);
        MDC.put("operacion", "reservar");
        try {
            log.info("Iniciando reserva");
            try {
                ResultadoReserva resultado = servicio.reservar(pedidoId, sku, cantidad);
                log.info("Reserva confirmada total={} cantidad={}", resultado.total().monto(), resultado.cantidad());
                System.out.println("RESERVA_OK " + resultado.pedidoId() + " " + resultado.total().monto());
            } catch (IllegalArgumentException e) {
                log.warn("Reserva rechazada motivo={}", e.getMessage());
                System.out.println("RESERVA_RECHAZADA " + e.getMessage());
                System.exit(2);
            }
        } finally {
            MDC.remove("pedidoId");
            MDC.remove("sku");
            MDC.remove("operacion");
        }
    }

    private static String argumento(String[] args, int indice, String defecto) {
        if (args.length > indice && !args[indice].isBlank()) {
            return args[indice];
        }
        return defecto;
    }
}
```

La configuración de Logback usa `LogstashEncoder` para emitir JSON. Cada evento incluye campos del log, timestamp, nivel, logger, hilo y los campos del MDC como `pedidoId`, `sku` y `operacion`. También agrega `service=tienda-aurora-build` como campo fijo. Este es el punto donde el log deja de ser texto suelto y pasa a ser dato consultable.

**Archivo:** `app/src/main/resources/logback.xml`

```xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <customFields>{"service":"tienda-aurora-build"}</customFields>
    </encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="STDOUT" />
  </root>
</configuration>
```

Esta prueba pequeña verifica el adaptador de aplicación. No es una integración con infraestructura externa; es una prueba rápida que confirma que el wiring básico de la demo tiene los datos semilla esperados.

**Archivo:** `app/src/test/java/com/aurora/build/app/CatalogoEnMemoriaTest.java`

```java
package com.aurora.build.app;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CatalogoEnMemoriaTest {

    @Test
    void encuentraProductoSemilla() {
        CatalogoEnMemoria catalogo = new CatalogoEnMemoria();
        assertTrue(catalogo.buscarPorSku("CAF-001").isPresent());
    }
}
```

## Ejecutar

Genera el wrapper y ejecuta las pruebas:

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q test
```

El comando termina sin fallos; JUnit ejecuta las pruebas de `domain` y `app`.

Ejecuta una reserva válida:

```bash
./gradlew -q :app:run --args="PED-100 CAF-001 2"
```

```text
{"@timestamp":"2026-11-22T22:29:26.626013-05:00","@version":"1","message":"Iniciando reserva","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"INFO","level_value":20000,"pedidoId":"PED-100","sku":"CAF-001","operacion":"reservar","service":"tienda-aurora-build"}
{"@timestamp":"2026-11-22T22:29:26.63007-05:00","@version":"1","message":"Reserva confirmada total=25.00 cantidad=2","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"INFO","level_value":20000,"pedidoId":"PED-100","sku":"CAF-001","operacion":"reservar","service":"tienda-aurora-build"}
RESERVA_OK PED-100 25.00
```

Ejecuta una reserva rechazada:

```bash
./gradlew -q :app:run --args="PED-101 NOPE 1"
```

```text
{"@timestamp":"2026-11-22T22:29:28.724048-05:00","@version":"1","message":"Iniciando reserva","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"INFO","level_value":20000,"pedidoId":"PED-101","sku":"NOPE","operacion":"reservar","service":"tienda-aurora-build"}
{"@timestamp":"2026-11-22T22:29:28.727319-05:00","@version":"1","message":"Reserva rechazada motivo=producto no encontrado: NOPE","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"WARN","level_value":30000,"pedidoId":"PED-101","sku":"NOPE","operacion":"reservar","service":"tienda-aurora-build"}
RESERVA_RECHAZADA producto no encontrado: NOPE
```

El caso rechazado termina con código de salida 2 en la aplicación. Gradle reporta el exit code distinto de cero como fallo de la tarea `:app:run`; las líneas relevantes para el módulo son las dos líneas JSON y `RESERVA_RECHAZADA`.

## Conceptos cubiertos

### Tema 1: Maven avanzado · Intermedio · 40 min

Maven y Gradle resuelven el mismo problema de fondo: declarar dependencias, compilar, probar, empaquetar y publicar artefactos de forma repetible. El “avanzado” en Maven no significa agregar XML por agregar; significa controlar versiones y plugins cuando el proyecto crece.

El mecanismo central es `dependencyManagement`. Permite declarar versiones en un lugar, normalmente en un POM padre o importando un BOM (Bill of Materials), y que los módulos hijos declaren dependencias sin repetir versión. Eso reduce la deriva: dos módulos usando versiones distintas de la misma librería. Un BOM típico es `junit-bom`; al importarlo con `<scope>import</scope>` y `<type>pom</type>`, todas las dependencias JUnit quedan alineadas.

Los perfiles (`<profiles>`) activan variaciones de build: por ejemplo, ejecutar integración solo cuando hay Docker, o agregar un plugin en CI. Son útiles, pero peligrosos si esconden comportamiento invisible. Un build que pasa en local y falla en CI porque un perfil estaba activo sin que nadie lo supiera es difícil de diagnosticar. La regla es que el perfil cambie lo mínimo y que su activación sea explícita.

En el entorno hay Maven 3.10.0 instalado, así que la inspección de POMs es verificable con comandos como:

```bash
mvn -v
mvn help:effective-pom
```

**Nota de verificación:** no se construyó un segundo proyecto Maven paralelo en este módulo para no duplicar el artefacto verificado; el proyecto ejecutado y comprobado es el multi-módulo Gradle. La configuración Maven mostrada aquí es de referencia para el mismo concepto de control de versiones y plugins.

### Tema 2: Gradle y builds reproducibles · Avanzado · 45 min

Un build reproducible produce el mismo resultado cuando las entradas son las mismas. En Gradle, la pieza más visible es el wrapper: `gradlew`, `gradlew.bat` y `gradle/wrapper/gradle-wrapper.properties` fijan la versión de Gradle que usa el proyecto. Eso evita el clásico “en mi máquina funciona porque tengo otra versión de Gradle”.

En este módulo el wrapper se generó con:

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q test
```

La reproducibilidad no se consigue solo con el wrapper. También hace falta fijar versiones de dependencias, evitar `latest.release`, definir toolchains de Java y mantener entradas estables. El `build.gradle.kts` raíz declara el toolchain 25 y versiones concretas de JUnit, SLF4J, Logback y el encoder. Si mañana una dependencia publica una versión nueva, el build no cambia hasta que alguien actualice la versión de forma consciente.

Gradle además tiene caché incremental y build cache. Son optimizaciones, no garantías de corrección. La regla de oro es: primero el build debe ser correcto; después, rápido. Un `clean` ocasional en CI o ante comportamientos raros es una herramienta de diagnóstico, no una forma de vida.

### Tema 3: Proyectos multi-módulo sin ciclos · Avanzado · 40 min

Dividir un proyecto en módulos solo ayuda si las dependencias tienen dirección. Un módulo `domain` que depende de `app`, o dos módulos que dependen uno del otro, crean un ciclo. Los ciclos hacen que el build sea frágil, que los tests sean lentos y que el diseño se degrade porque “todo necesita todo”.

En `tienda-aurora-build`, la separación es pequeña pero clara:

```text
domain  <-  app
```

`domain` define `Producto`, `Dinero`, `ResultadoReserva`, `ServicioReservas` y el puerto `CatalogoProductos`. `app` implementa `CatalogoEnMemoria`, configura Logback y expone `main`. El archivo `app/build.gradle.kts` contiene `implementation(project(":domain"))`; el dominio no tiene dependencia inversa.

Esta forma también mejora el testing. `ServicioReservasTest` prueba la regla de negocio con una lambda como catálogo. No necesita Logback, no necesita JSON, no necesita el classpath de la app. Cuando un módulo de dominio se puede probar solo, es una señal de que sus dependencias apuntan hacia adentro.

### Tema 4: JUnit 6, Mockito y assertions expresivas · Avanzado · 45 min

Una prueba útil verifica un comportamiento observable y falla con un mensaje que ayude a entender qué se rompió. JUnit Jupiter (la base de JUnit 5/6) aporta el modelo de pruebas con `@Test`, ciclo de vida, assertions y extensiones. En este proyecto usamos JUnit Jupiter 5.13.4, la línea estable verificada en el entorno; la idea central es la misma que se busca en JUnit 6: pruebas claras, aisladas y ejecutadas por JUnit Platform.

El test real del dominio prueba dos comportamientos: el cálculo del total y el rechazo cuando el producto no existe. El doble de `CatalogoProductos` es una lambda porque la interfaz tiene un solo método; así el test se enfoca en la regla de negocio.

```java
package com.aurora.build.domain;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ServicioReservasTest {

    @Test
    void calculaTotalDeReserva() {
        CatalogoProductos catalogo = sku -> Optional.ofNullable(Map.of(
                "CAF-001", new Producto("CAF-001", "Café Aurora", Dinero.de("12.50"))
        ).get(sku));
        ServicioReservas servicio = new ServicioReservas(catalogo);

        ResultadoReserva resultado = servicio.reservar("PED-100", "CAF-001", 2);

        assertEquals("PED-100", resultado.pedidoId());
        assertEquals("CAF-001", resultado.sku());
        assertEquals(Dinero.de("25.00"), resultado.total());
    }

    @Test
    void fallaCuandoProductoNoExiste() {
        ServicioReservas servicio = new ServicioReservas(sku -> Optional.empty());

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> servicio.reservar("PED-101", "NO-EXISTE", 1));

        assertEquals("producto no encontrado: NO-EXISTE", error.getMessage());
    }
}
```

`assertEquals` verifica el resultado observable. `assertThrows` es importante porque no solo dice “falló”; captura la excepción y permite afirmar sobre su tipo y mensaje. Eso evita el patrón frágil de `try/catch` con `fail()`.

Mockito entra cuando el doble manual deja de ser cómodo: muchas interacciones, verificación de llamadas, o dependencias con varias operaciones. Si `CatalogoProductos` creciera, un test con Mockito se vería así:

```java
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@Test
void consultaCatalogoConMockito() {
    CatalogoProductos catalogo = mock(CatalogoProductos.class);
    when(catalogo.buscarPorSku("CAF-001"))
            .thenReturn(Optional.of(new Producto("CAF-001", "Café Aurora", Dinero.de("12.50"))));

    ServicioReservas servicio = new ServicioReservas(catalogo);
    ResultadoReserva resultado = servicio.reservar("PED-100", "CAF-001", 2);

    assertEquals(Dinero.de("25.00"), resultado.total());
    verify(catalogo).buscarPorSku("CAF-001");
}
```

**Nota de verificación:** la prueba ejecutada en el proyecto es la primera, con doble manual y JUnit Jupiter 5.13.4. El bloque Mockito es un ejemplo de referencia de la misma regla de negocio; no se agregó la dependencia Mockito al build verificado para mantener el módulo pequeño. Si lo incorporas, añade `testImplementation("org.mockito:mockito-junit-jupiter:<versión verificada>")` y ejecuta las pruebas.

### Tema 5: Pruebas de integración reproducibles · Avanzado · 40 min

Las pruebas unitarias prueban una pieza con sus dependencias reemplazadas. Las pruebas de integración prueban el ensamblaje real con infraestructura: base de datos, broker, filesystem, HTTP, contenedores. El valor de una integración es alto, pero también su costo y su fragilidad. Por eso deben ser pocas, representativas y reproducibles.

Reproducible significa que no dependen de un estado oculto: ni una base compartida, ni datos creados por otro test, ni el puerto local ocupado por casualidad. Testcontainers es una herramienta común para esto porque levanta infraestructura efímera en Docker durante la prueba. Con una base PostgreSQL real en contenedor, el test valida SQL, migraciones y comportamiento del driver sin depender de una instalación local permanente.

Una prueba de integración bien diseñada sigue este patrón:

```java
@Test
void guardaYLeeReserva() {
    // arrange: contenedor/base limpia
    // act: ejecutar repositorio real
    // assert: observar estado persistido
}
```

**Nota de verificación:** Docker está instalado en el entorno, pero este módulo no levantó contenedores durante la ejecución automatizada. La prueba de integración reproducible queda descrita como criterio y patrón; el build verificado cubre pruebas unitarias y de adaptador en memoria. En un siguiente paso del mismo módulo, el candidato natural sería un test con Testcontainers para PostgreSQL o Kafka, ejecutado en CI con Docker disponible.

### Tema 6: SLF4J, Logback, MDC y logging estructurado · Avanzado · 40 min

Un log en producción no es un `System.out.println`. Tiene que responder preguntas bajo presión: ¿qué pedido falló?, ¿en qué operación?, ¿en qué servicio?, ¿fue un rechazo de negocio o un error técnico?, ¿qué pasó antes y después? Para eso el log necesita estructura y contexto.

**La dependencia correcta: fachada en compilación, implementación en runtime.** En `app/build.gradle.kts` el código depende de `slf4j-api`, mientras Logback y el encoder JSON quedan como `runtimeOnly`. Eso significa que `TiendaAuroraBuildApp` compila contra la API de SLF4J, no contra clases de Logback:

```kotlin
dependencies {
    implementation(project(":domain"))
    implementation("org.slf4j:slf4j-api:2.0.17")
    runtimeOnly("ch.qos.logback:logback-classic:1.5.18")
    runtimeOnly("net.logstash.logback:logstash-logback-encoder:8.1")

    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
```

SLF4J es la fachada. El código obtiene un logger con `LoggerFactory.getLogger(...)` y escribe eventos con placeholders `{}`. Logback es la implementación que decide cómo formatear y adónde enviar el evento. Esta separación permite cambiar la implementación sin tocar la lógica de negocio.

**El código que emite el log.** La frontera de la aplicación pone contexto en el MDC antes de procesar la reserva, registra el inicio, confirma o rechaza, y limpia el MDC en `finally`. `MDC` es el Mapped Diagnostic Context: un mapa asociado al hilo actual. Cada evento emitido por ese hilo puede incluir esos campos.

```java
package com.aurora.build.app;

import com.aurora.build.domain.ResultadoReserva;
import com.aurora.build.domain.ServicioReservas;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public final class TiendaAuroraBuildApp {

    private static final Logger log = LoggerFactory.getLogger(TiendaAuroraBuildApp.class);

    public static void main(String[] args) {
        String pedidoId = argumento(args, 0, "PED-100");
        String sku = argumento(args, 1, "CAF-001");
        int cantidad = Integer.parseInt(argumento(args, 2, "2"));

        ServicioReservas servicio = new ServicioReservas(new CatalogoEnMemoria());
        MDC.put("pedidoId", pedidoId);
        MDC.put("sku", sku);
        MDC.put("operacion", "reservar");
        try {
            log.info("Iniciando reserva");
            try {
                ResultadoReserva resultado = servicio.reservar(pedidoId, sku, cantidad);
                log.info("Reserva confirmada total={} cantidad={}",
                        resultado.total().monto(), resultado.cantidad());
                System.out.println("RESERVA_OK " + resultado.pedidoId() + " " + resultado.total().monto());
            } catch (IllegalArgumentException e) {
                log.warn("Reserva rechazada motivo={}", e.getMessage());
                System.out.println("RESERVA_RECHAZADA " + e.getMessage());
                System.exit(2);
            }
        } finally {
            MDC.remove("pedidoId");
            MDC.remove("sku");
            MDC.remove("operacion");
        }
    }

    private static String argumento(String[] args, int indice, String defecto) {
        if (args.length > indice && !args[indice].isBlank()) {
            return args[indice];
        }
        return defecto;
    }
}
```

Hay tres decisiones de código que vale leer con cuidado. Primero, `LoggerFactory.getLogger(TiendaAuroraBuildApp.class)` crea un logger con nombre estable; ese nombre aparece en el campo `logger_name` del JSON y permite filtrar por clase. Segundo, los mensajes usan placeholders `{}`: `log.info("Reserva confirmada total={} cantidad={}", total, cantidad)`. SLF4J resuelve el mensaje solo cuando el nivel está habilitado y evita la concatenación manual. Tercero, el `finally` limpia con `MDC.remove(...)` clave por clave. No se usa `MDC.clear()` porque borrar todo el contexto puede eliminar claves que otro componente haya puesto en el mismo hilo.

**La configuración que lo vuelve estructurado.** Logback lee `logback.xml` desde el classpath. Aquí el appender escribe a consola, pero el encoder no emite texto libre: `LogstashEncoder` produce un objeto JSON por evento. El campo fijo `service` identifica el emisor.

```xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <customFields>{"service":"tienda-aurora-build"}</customFields>
    </encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="STDOUT" />
  </root>
</configuration>
```

El resultado real de una ejecución válida fue:

```text
{"@timestamp":"2026-11-22T22:29:34.098561-05:00","@version":"1","message":"Iniciando reserva","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"INFO","level_value":20000,"pedidoId":"PED-100","sku":"CAF-001","operacion":"reservar","service":"tienda-aurora-build"}
{"@timestamp":"2026-11-22T22:29:34.10238-05:00","@version":"1","message":"Reserva confirmada total=25.00 cantidad=2","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"INFO","level_value":20000,"pedidoId":"PED-100","sku":"CAF-001","operacion":"reservar","service":"tienda-aurora-build"}
RESERVA_OK PED-100 25.00
```

Esos campos hacen que el log sea consultable. En un agregador puedes filtrar por `pedidoId=PED-100` o por `operacion=reservar`. Si fuera texto libre, tendrías que parsear frases. Observa también la separación de responsabilidades: `RESERVA_OK` va por `System.out` como salida del comando, mientras los eventos JSON van por el logger. El log no reemplaza la salida funcional; la enriquece con contexto operativo.

**Errores comunes que vale evitar.** Concatenar strings en vez de usar placeholders crea trabajo aunque el nivel de log esté desactivado y hace más fácil meter datos mal formateados. Usar `MDC.clear()` borra todo el contexto del hilo, incluyendo claves ajenas; `MDC.remove` de las claves propias es más seguro. Loguear objetos gigantes, payloads completos, secretos o tokens es un riesgo de seguridad y de costo. Y asumir que el MDC se propaga solo a hilos nuevos es falso: en ejecutores, `CompletableFuture` o virtual threads hay que propagar el contexto explícitamente, por ejemplo copiando el mapa con `MDC.getCopyOfContextMap()` y restaurándolo en el hilo que ejecuta la tarea.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m15` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run
```

Resultados observados:

- `test`: 0 fallas.
- `run`: emite logs JSON y `RESERVA_OK PED-100 25.00`.

## Cierre

Un proyecto Java profesional no se define por la cantidad de frameworks, sino por la calidad de sus contratos de trabajo: build reproducible, dependencias claras, módulos sin ciclos, pruebas con intención y logs que sirvan en producción. El código de `tienda-aurora-build` es pequeño, pero tiene la forma correcta: el dominio se prueba aislado, la app ensambla dependencias y el logging estructurado agrega contexto sin invadir la regla de negocio.

## Checklist

- Fijo versiones de herramientas y dependencias; el wrapper y el toolchain forman parte del build.
- Mantengo dependencias entre módulos en una dirección clara; `domain` no depende de `app`.
- Escribo pruebas unitarias rápidas para reglas de negocio y dejo claro cuándo una integración necesita infraestructura real.
- Uso SLF4J con placeholders, Logback como implementación y MDC con limpieza en `finally`.
- Emito logs estructurados con campos útiles y evito secretos, payloads completos y texto ambiguo.
