# Módulo 15: Build, testing y calidad

Un proyecto Java profesional no se define solo por compilar. Se define por poder construirse de forma repetible, dividir responsabilidades sin ciclos, probar reglas rápido y diagnosticar comportamiento en ejecución. Este módulo construye `tienda-aurora-build`, un multi-módulo Gradle con dominio, app, tests JUnit 6 + Mockito, integración con H2 y logging estructurado con SLF4J/Logback/MDC. Un proyecto Maven paralelo muestra el mismo criterio de reproducibilidad con `pom.xml`.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-15-build-testing.html`; regeneración: editar el HTML/SVG en esa ruta):** [Build reproducible, módulos domain/app, tests JUnit y logging estructurado](/visuals/temas/java/modulo-15-build-testing.html)

Lectura: Dominio aislado, app como adaptador, wrapper/build reproducible y tests como feedback rápido.

## Proyecto desde cero

#### Prerrequisitos

```bash
java -version
gradle --version
mvn -version
```

#### Bootstrap

```bash
mkdir -p tienda-aurora-build/domain/src/main/java/com/aurora/build/domain
mkdir -p tienda-aurora-build/domain/src/test/java/com/aurora/build/domain
mkdir -p tienda-aurora-build/app/src/main/java/com/aurora/build/app
mkdir -p tienda-aurora-build/app/src/main/resources
mkdir -p tienda-aurora-build/app/src/test/java/com/aurora/build/app
cd tienda-aurora-build
gradle wrapper --gradle-version 9.9.1
```

El proyecto Maven de comparación vive en `tienda-aurora-build/maven-demo`; Gradle solo incluye `domain` y `app`, por lo que ese subdirectorio no altera el build.

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2 (Gradle) y 27.0.1.0.3 (Maven), Gradle 9.9.1, Maven 3.10.0, JUnit 6.1.3, Mockito 5.24.0, SLF4J 2.0.17, Logback 1.5.18, logstash-logback-encoder 8.1, H2 2.3.232.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-build"
include("domain", "app")
```

#### `build.gradle.kts` (raíz)

Configura grupo, versión, repositorio y toolchain Java 25 para todos los subproyectos. También fija encoding, warnings estrictos y JUnit Platform con eventos de test visibles.

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
        testLogging {
            events("passed", "skipped", "failed")
        }
    }
}
```

#### `domain/build.gradle.kts`

El dominio conoce JUnit 6 y Mockito para tests. No conoce Logback, HTTP ni frameworks de aplicación.

```kotlin
dependencies {
    testImplementation(platform("org.junit:junit-bom:6.1.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("org.mockito:mockito-junit-jupiter:5.24.0")
}
```

#### `app/build.gradle.kts`

`app` depende de `domain`, usa SLF4J como fachada, Logback en ejecución y el encoder JSON. H2 entra solo en el classpath de tests para la prueba de integración reproducible.

```kotlin
plugins {
    application
}

dependencies {
    implementation(project(":domain"))
    implementation("org.slf4j:slf4j-api:2.0.17")
    implementation("net.logstash.logback:logstash-logback-encoder:8.1")
    runtimeOnly("ch.qos.logback:logback-classic:1.5.18")

    testImplementation(platform("org.junit:junit-bom:6.1.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("ch.qos.logback:logback-classic:1.5.18")
    testImplementation("net.logstash.logback:logstash-logback-encoder:8.1")
    testImplementation("com.h2database:h2:2.3.232")
}

application {
    mainClass = "com.aurora.build.app.TiendaAuroraBuildApp"
}
```

#### Dominio: `domain/src/main/java/com/aurora/build/domain/Dinero.java`

Value object con invariantes: no nulo, escala 2, no negativo. Centraliza reglas monetarias para evitar `BigDecimal` suelto por todo el código.

```java
package com.aurora.build.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record Dinero(BigDecimal monto) {
    public Dinero {
        Objects.requireNonNull(monto, "monto");
        monto = monto.setScale(2, RoundingMode.HALF_UP);
        if (monto.signum() < 0) throw new IllegalArgumentException("monto negativo: " + monto);
    }
    public static Dinero de(String valor) { return new Dinero(new BigDecimal(valor)); }
    public Dinero multiplicar(int cantidad) {
        if (cantidad < 0) throw new IllegalArgumentException("cantidad negativa: " + cantidad);
        return new Dinero(monto.multiply(BigDecimal.valueOf(cantidad)));
    }
    public Dinero sumar(Dinero otro) { Objects.requireNonNull(otro, "otro"); return new Dinero(monto.add(otro.monto)); }
}
```

#### Dominio: `domain/src/main/java/com/aurora/build/domain/Producto.java`

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
        if (valor == null || valor.isBlank()) throw new IllegalArgumentException(campo + " vacío");
        return valor.trim();
    }
}
```

#### Dominio: `domain/src/main/java/com/aurora/build/domain/ResultadoReserva.java`

```java
package com.aurora.build.domain;
import java.util.Objects;
public record ResultadoReserva(String pedidoId, String sku, int cantidad, Dinero total) {
    public ResultadoReserva {
        if (pedidoId == null || pedidoId.isBlank()) throw new IllegalArgumentException("pedidoId vacío");
        if (sku == null || sku.isBlank()) throw new IllegalArgumentException("sku vacío");
        if (cantidad <= 0) throw new IllegalArgumentException("cantidad inválida: " + cantidad);
        Objects.requireNonNull(total, "total");
    }
}
```

#### Dominio: `domain/src/main/java/com/aurora/build/domain/CatalogoProductos.java`

```java
package com.aurora.build.domain;
import java.util.Optional;
public interface CatalogoProductos {
    Optional<Producto> buscarPorSku(String sku);
}
```

#### Dominio: `domain/src/main/java/com/aurora/build/domain/ServicioReservas.java`

Caso de uso puro: valida entrada, consulta catálogo por puerto y calcula total. No sabe si el catálogo es en memoria, JDBC o HTTP.

```java
package com.aurora.build.domain;

import java.util.Objects;

public final class ServicioReservas {
    private final CatalogoProductos catalogo;
    public ServicioReservas(CatalogoProductos catalogo) { this.catalogo = Objects.requireNonNull(catalogo, "catalogo"); }

    public ResultadoReserva reservar(String pedidoId, String sku, int cantidad) {
        if (pedidoId == null || pedidoId.isBlank()) throw new IllegalArgumentException("pedidoId vacío");
        if (sku == null || sku.isBlank()) throw new IllegalArgumentException("sku vacío");
        if (cantidad <= 0) throw new IllegalArgumentException("cantidad inválida: " + cantidad);
        Producto producto = catalogo.buscarPorSku(sku)
                .orElseThrow(() -> new IllegalArgumentException("producto no encontrado: " + sku));
        return new ResultadoReserva(pedidoId.trim(), producto.sku(), cantidad, producto.precio().multiplicar(cantidad));
    }
}
```

#### App: `app/src/main/java/com/aurora/build/app/CatalogoEnMemoria.java`

Adaptador simple para ejecutar la app sin base de datos. La integración usa `CatalogoJdbc` en el classpath de tests.

```java
package com.aurora.build.app;

import com.aurora.build.domain.*;
import java.util.Map;
import java.util.Optional;

public final class CatalogoEnMemoria implements CatalogoProductos {
    private final Map<String, Producto> productos = Map.of(
            "CAF-001", new Producto("CAF-001", "Café Aurora", Dinero.de("12.50")),
            "TET-002", new Producto("TET-002", "Tetera Norte", Dinero.de("45.00"))
    );
    @Override public Optional<Producto> buscarPorSku(String sku) { return Optional.ofNullable(productos.get(sku)); }
}
```

#### App: `app/src/main/resources/logback.xml`

Encoder JSON para que los logs sean procesables por herramientas de observabilidad. MDC agrega `pedidoId`, `sku` y `operacion`.

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

#### App: `app/src/main/java/com/aurora/build/app/TiendaAuroraBuildApp.java`

Punto de entrada. `reservar` contiene el borde observable: dominio real + MDC + logging; `main` solo interpreta argumentos e imprime el resultado. El MDC se limpia en `finally`.

```java
package com.aurora.build.app;

import com.aurora.build.domain.ResultadoReserva;
import com.aurora.build.domain.ServicioReservas;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public final class TiendaAuroraBuildApp {

    private static final Logger log = LoggerFactory.getLogger(TiendaAuroraBuildApp.class);

    private TiendaAuroraBuildApp() {
    }

    public static void main(String[] args) {
        String pedidoId = argumento(args, 0, "PED-100");
        String sku = argumento(args, 1, "CAF-001");
        int cantidad = Integer.parseInt(argumento(args, 2, "2"));

        try {
            ResultadoReserva resultado = reservar(pedidoId, sku, cantidad);
            System.out.println("RESERVA_OK " + resultado.pedidoId() + " " + resultado.total().monto());
        } catch (IllegalArgumentException e) {
            System.out.println("RESERVA_RECHAZADA " + e.getMessage());
            System.exit(2);
        }
    }

    /** Punto de integración observable: dominio real + MDC + logging estructurado. */
    public static ResultadoReserva reservar(String pedidoId, String sku, int cantidad) {
        ServicioReservas servicio = new ServicioReservas(new CatalogoEnMemoria());
        MDC.put("pedidoId", pedidoId);
        MDC.put("sku", sku);
        MDC.put("operacion", "reservar");
        try {
            log.info("Iniciando reserva");
            try {
                ResultadoReserva resultado = servicio.reservar(pedidoId, sku, cantidad);
                log.info("Reserva confirmada total={} cantidad={}", resultado.total().monto(), resultado.cantidad());
                return resultado;
            } catch (IllegalArgumentException e) {
                log.warn("Reserva rechazada motivo={}", e.getMessage());
                throw e;
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

#### Test unitario: `domain/src/test/java/com/aurora/build/domain/ServicioReservasTest.java`

lambda como `CatalogoProductos`, sin Spring, sin BD, sin Logback.

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

#### Test con Mockito: `domain/src/test/java/com/aurora/build/domain/ServicioReservasMockitoTest.java`

Aquí el doble sí aporta: permite verificar la interacción con el puerto y capturar el argumento, además de comprobar que una validación temprana no consulta el catálogo.

```java
package com.aurora.build.domain;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServicioReservasMockitoTest {

    @Mock
    private CatalogoProductos catalogo;

    @Captor
    private ArgumentCaptor<String> skuCaptor;

    @Test
    void verificaInteraccionConElPuerto() {
        when(catalogo.buscarPorSku("TET-002"))
                .thenReturn(Optional.of(new Producto("TET-002", "Tetera Norte", Dinero.de("45.00"))));

        ResultadoReserva resultado = new ServicioReservas(catalogo).reservar("PED-200", "TET-002", 3);

        verify(catalogo).buscarPorSku(skuCaptor.capture());
        assertAll("reserva con doble Mockito",
                () -> assertEquals("TET-002", skuCaptor.getValue(), "sku consultado en el catálogo"),
                () -> assertEquals("PED-200", resultado.pedidoId(), "id de pedido devuelto"),
                () -> assertEquals(Dinero.de("135.00"), resultado.total(), "total calculado"));
    }

    @Test
    void noConsultaCatalogoConCantidadInvalida() {
        ServicioReservas servicio = new ServicioReservas(catalogo);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> servicio.reservar("PED-201", "TET-002", 0), "cantidad 0 debe rechazarse");

        assertAll("validación antes del puerto",
                () -> assertEquals("cantidad inválida: 0", error.getMessage()),
                () -> verify(catalogo, never()).buscarPorSku(anyString()));
    }
}
```

#### Test unitario: `app/src/test/java/com/aurora/build/app/CatalogoEnMemoriaTest.java`

```java
package com.aurora.build.app;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
class CatalogoEnMemoriaTest {
    @Test void encuentraProductoSemilla() { assertTrue(new CatalogoEnMemoria().buscarPorSku("CAF-001").isPresent()); }
}
```

#### Integración: `app/src/test/java/com/aurora/build/app/CatalogoJdbc.java`

Adaptador real sobre H2. Vive en el classpath de tests para que el unit test siga siendo puro.

```java
package com.aurora.build.app;

import com.aurora.build.domain.CatalogoProductos;
import com.aurora.build.domain.Dinero;
import com.aurora.build.domain.Producto;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

/** Adaptador real de infraestructura: solo existe en el classpath de tests. */
public final class CatalogoJdbc implements CatalogoProductos {

    private final DataSource dataSource;

    public CatalogoJdbc(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Optional<Producto> buscarPorSku(String sku) {
        String sql = "SELECT sku, nombre, precio FROM productos WHERE sku = ?";
        try (Connection c = dataSource.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, sku);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return Optional.empty();
                return Optional.of(new Producto(rs.getString("sku"), rs.getString("nombre"),
                        Dinero.de(rs.getBigDecimal("precio").toPlainString())));
            }
        } catch (SQLException e) {
            throw new IllegalStateException("consulta de catálogo fallida", e);
        }
    }
}
```

#### Integración: `app/src/test/java/com/aurora/build/app/ReservaIntegracionTest.java`

Base de datos H2 con nombre único por test, catálogo JDBC real y un appender que captura el JSON de Logback. La prueba valida a la vez el resultado de negocio y los campos de correlación.

```java
package com.aurora.build.app;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.OutputStreamAppender;
import com.aurora.build.domain.ResultadoReserva;
import com.aurora.build.domain.ServicioReservas;
import net.logstash.logback.encoder.LogstashEncoder;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReservaIntegracionTest {

    @Test
    void reservaConH2YLogsJson() throws SQLException {
        DataSource ds = baseDatosAislada();
        CatalogoJdbc catalogo = new CatalogoJdbc(ds);

        LoggerContext contexto = (LoggerContext) LoggerFactory.getILoggerFactory();
        ch.qos.logback.classic.Logger root = contexto.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        OutputStreamAppender<ILoggingEvent> appender = new OutputStreamAppender<>();
        LogstashEncoder encoder = new LogstashEncoder();
        encoder.setCustomFields("{\"service\":\"tienda-aurora-build\"}");
        encoder.setContext(contexto);
        encoder.start();
        appender.setEncoder(encoder);
        appender.setOutputStream(new PrintStream(buffer, true, StandardCharsets.UTF_8));
        appender.setContext(contexto);
        appender.start();
        root.addAppender(appender);

        try {
            ResultadoReserva resultado = new ServicioReservas(catalogo).reservar("PED-300", "CAF-001", 2);
            TiendaAuroraBuildApp.reservar("PED-300", "CAF-001", 2);

            String logs = buffer.toString(StandardCharsets.UTF_8);
            assertAll("integración dominio + JDBC + logging",
                    () -> assertEquals("25.00", resultado.total().monto().toPlainString()),
                    () -> assertTrue(logs.contains("\"pedidoId\":\"PED-300\""), "MDC pedidoId en JSON"),
                    () -> assertTrue(logs.contains("\"sku\":\"CAF-001\""), "MDC sku en JSON"),
                    () -> assertTrue(logs.contains("\"operacion\":\"reservar\""), "MDC operacion en JSON"),
                    () -> assertTrue(logs.contains("\"service\":\"tienda-aurora-build\""), "campo de servicio"));
        } finally {
            root.detachAppender(appender);
            appender.stop();
        }
    }

    private static DataSource baseDatosAislada() throws SQLException {
        JdbcDataSource ds = new JdbcDataSource();
        ds.setURL("jdbc:h2:mem:aurora-int-" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1");
        ds.setUser("sa");
        ds.setPassword("");
        try (Connection c = ds.getConnection(); Statement st = c.createStatement()) {
            st.execute("CREATE TABLE productos (sku VARCHAR(20) PRIMARY KEY, nombre VARCHAR(80) NOT NULL, precio DECIMAL(10,2) NOT NULL)");
            st.execute("INSERT INTO productos(sku, nombre, precio) VALUES ('CAF-001', 'Café Aurora', 12.50)");
        }
        return ds;
    }
}
```

#### Maven paralelo: `maven-demo/pom.xml`

`dependencyManagement` importa el BOM de JUnit, `pluginManagement` fija compilador y Surefire, Enforcer exige JDK 25 y el perfil `ci` activa advertencias explícitas.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.aurora</groupId>
  <artifactId>aurora-maven-demo</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.release>25</maven.compiler.release>
    <junit.version>6.1.3</junit.version>
  </properties>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.junit</groupId>
        <artifactId>junit-bom</artifactId>
        <version>${junit.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.platform</groupId>
      <artifactId>junit-platform-launcher</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.14.1</version>
        </plugin>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-surefire-plugin</artifactId>
          <version>3.5.4</version>
        </plugin>
      </plugins>
    </pluginManagement>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-enforcer-plugin</artifactId>
        <version>3.6.2</version>
        <executions>
          <execution>
            <id>exige-jdk-25</id>
            <goals><goal>enforce</goal></goals>
            <configuration>
              <rules>
                <requireJavaVersion>
                  <version>[25,)</version>
                </requireJavaVersion>
              </rules>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>

  <profiles>
    <profile>
      <id>ci</id>
      <activation>
        <property><name>ci</name></property>
      </activation>
      <properties>
        <maven.compiler.showWarnings>true</maven.compiler.showWarnings>
      </properties>
    </profile>
  </profiles>
</project>
```

#### `maven-demo/src/main/java/com/aurora/maven/Importe.java`

```java
package com.aurora.maven;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record Importe(BigDecimal valor) {
    public Importe {
        Objects.requireNonNull(valor, "valor");
        valor = valor.setScale(2, RoundingMode.HALF_UP);
        if (valor.signum() < 0) throw new IllegalArgumentException("valor negativo: " + valor);
    }

    public Importe sumar(Importe otro) {
        return new Importe(valor.add(Objects.requireNonNull(otro, "otro").valor));
    }
}
```

#### `maven-demo/src/test/java/com/aurora/maven/ImporteTest.java`

```java
package com.aurora.maven;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ImporteTest {
    @Test
    void sumaConEscalaDos() {
        Importe total = new Importe(new BigDecimal("10.5"))
                .sumar(new Importe(new BigDecimal("4.75")));

        assertAll("suma",
                () -> assertEquals(new BigDecimal("15.25"), total.valor()),
                () -> assertEquals(2, total.valor().scale()));
    }
}
```

### Tema 1: Maven avanzado · Intermedio · 40 min

Maven organiza el build alrededor del POM (`pom.xml`), un ciclo de vida estándar y plugins. El POM declara coordenadas (`groupId`, `artifactId`, `version`), dependencias, plugins y propiedades. El ciclo de vida da fases predecibles: `validate`, `compile`, `test`, `package`, `verify`, `install`, `deploy`. Surefire ejecuta tests en `test`.

**Por qué existe:** en equipos, el problema no es compilar un archivo, sino compilar el mismo proyecto de la misma forma en CI, en laptops y en releases. Maven estandariza esa convención.

**Implicación práctica:** el `pom.xml` de `maven-demo` usa `dependencyManagement` con BOM para no repetir versiones de JUnit, `pluginManagement` para fijar compilador/Surefire, Enforcer para exigir JDK 25 y un perfil `ci`. `mvn -B verify` ejecuta `validate → compile → test → package` con la salida mostrada más abajo.

**Confusión común:** “Maven es solo XML”. El XML es el formato; el valor real está en el modelo de ciclo de vida, la resolución de dependencias y la reproducibilidad.

### Tema 2: Gradle y builds reproducibles · Avanzado · 45 min

Gradle modela el build como un grafo de tareas. Cada tarea declara inputs, outputs y dependencias; Gradle puede ejecutar en orden correcto, evitar trabajo innecesario y cachear resultados. El script Kotlin DSL (`build.gradle.kts`) es código tipado que configura plugins, toolchains y dependencias.

**Por qué existe:** los proyectos reales necesitan más que compilar: múltiples módulos, generación de código, tests, empaquetado, quality gates, publicación. Gradle da flexibilidad sin perder estructura.

**Implicación práctica:** reproducibilidad significa fijar Gradle con wrapper (`./gradlew`), fijar Java con toolchain, declarar repositorios y versiones, y evitar depender de estado local oculto. `-Werror` y `-Xlint:all` convierten warnings en deuda visible.

**Confusión común:** “Gradle siempre es no determinista porque es flexible”. La flexibilidad es un riesgo si se abusa, pero con wrapper, toolchain, inputs declarados y dependencias fijas el build puede ser muy estable. Otro error es commitear salidas `build/` en vez del wrapper.

### Tema 3: Proyectos multi-módulo sin ciclos · Avanzado · 40 min

Un multi-módulo divide el sistema en unidades con dependencias explícitas. En este proyecto, `domain` define reglas y puertos (`CatalogoProductos`, `ServicioReservas`, `Dinero`); `app` implementa adaptadores (`CatalogoEnMemoria`, `CatalogoJdbc`), configuración de logging y el `main`.

**Por qué existe:** cuando todo vive en un solo módulo, los límites se vuelven sociales (“no importes esto”). El build no puede defenderlos. Los módulos hacen que la frontera sea compilable.

**Implicación práctica:** la dirección de dependencia importa. `app` depende de `domain`; `domain` no conoce `app`. Si el dominio necesita algo externo, se expresa como puerto/interfaz en `domain` y se implementa en `app`. Esto permite probar dominio sin infraestructura.

**Confusión común:** crear muchos módulos sin criterio. Un módulo debe representar una frontera con razón clara. Otro error es “romper” ciclos con utilidades compartidas que terminan siendo un basurero; el ciclo suele indicar un contrato mal ubicado.

### Tema 4: JUnit 6, Mockito y assertions expresivas · Avanzado · 45 min

JUnit 6.1.3 (Jupiter) ejecuta tests con un modelo extensible. `@Test` define casos; `assertAll` agrupa assertions relacionadas; `MockitoExtension`, `@Mock`, `ArgumentCaptor`, `when(...)` y `verify(...)` permiten aislar colaboradores y verificar interacciones.

**Por qué existe:** las reglas de dominio deben validarse rápido. Un test unitario rápido da feedback en segundos y localiza fallos. Los dobles aíslan dependencias lentas o externas sin levantar infraestructura.

**Implicación práctica:** `ServicioReservasTest` usa un lambda porque el puerto es simple; `ServicioReservasMockitoTest` usa Mockito cuando interesa verificar que se consultó el SKU esperado y que una validación temprana impidió la llamada. Las assertions son expresivas: mensaje descriptivo por condición y separación entre valor esperado y comportamiento observable.

**Confusión común:** confundir cobertura con calidad. Otro error clásico es mockear todo, incluso value objects o lógica pura, produciendo tests frágiles que replican implementación. Si un refactor interno rompe tests pero el comportamiento sigue bien, los tests estaban mal acoplados.

### Tema 5: Pruebas de integración reproducibles · Avanzado · 40 min

Una prueba de integración verifica colaboración real entre componentes: persistencia, serialización, configuración, HTTP, colas o arranque de contexto. No reemplaza unit tests; cubre riesgos que los dobles no ven.

**Por qué existe:** dos piezas pueden pasar sus unit tests y fallar juntas por configuración, mapeo, transacciones, SQL real o formato de mensajes.

**Implicación práctica:** `ReservaIntegracionTest` crea una H2 con nombre UUID, aplica `Schema` en código, usa `CatalogoJdbc` real, ejecuta el caso de uso y captura el JSON de Logback. No depende de servicios compartidos ni de orden entre tests. Para integraciones de BD/cola externas, el mismo principio aplica: declarar dependencias, aislar datos, limpiar estado y evitar servicios externos compartidos; el módulo siguiente muestra ese patrón con PostgreSQL efímero.

**Confusión común:** llamar “integración” a un test que levanta todo el sistema innecesariamente, o al revés, mockear la frontera que justamente querías validar. H2 es útil, pero no sustituyePostgreSQL cuando importan dialecto o comportamiento del motor.

### Tema 6: SLF4J, Logback, MDC y logging estructurado · Intermedio · 30 min

SLF4J es la fachada; Logback es la implementación; el dominio no importa ninguna de las dos. MDC asocia contexto a un hilo (`pedidoId`, `sku`, `operacion`) para que cada línea de log pueda correlacionarse con una operación.

**Por qué existe:** en producción, un log plano sin identificador de correlación obliga a reconstruir la secuencia a mano. JSON con campos estables permite filtrar y correlacionar en un colector de logs.

**Implicación práctica:** `TiendaAuroraBuildApp.reservar` hace `MDC.put` antes de loguear y `MDC.remove` en `finally`. `logback.xml` usa `LogstashEncoder` con `customFields` para `service`. La salida observada incluye `"pedidoId":"PED-100"`, `"sku":"CAF-001"`, `"operacion":"reservar"` y `"service":"tienda-aurora-build"` en cada evento.

**Confusión común:** usar Logback directamente en reglas de negocio (acopla el dominio a infraestructura), olvidar limpiar MDC en un pool de hilos (filtra contexto de la petición anterior) o loguear datos sensibles. Los placeholders `{}` evitan concatenar strings costosos y preservan parámetros tipados.

## Verificación real

Ejecutado nuevamente el 2026-11-23 en `/tmp/opencode/aurora-m15` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25) y en `/tmp/opencode/aurora-m15/maven-demo` (Maven 3.10.0, JDK 27.0.1.0.3).

```bash
cd /tmp/opencode/aurora-m15
./gradlew test --rerun-tasks --console=plain
./gradlew -q :app:run --args="PED-100 CAF-001 2"
cd /tmp/opencode/aurora-m15/maven-demo
mvn -B verify
```

Salida observada de `./gradlew test --rerun-tasks --console=plain` ( líneas de resultados ):

```text
CatalogoEnMemoriaTest > encuentraProductoSemilla() PASSED
ReservaIntegracionTest > reservaConH2YLogsJson() PASSED
ServicioReservasMockitoTest > verificaInteraccionConElPuerto() PASSED
ServicioReservasMockitoTest > noConsultaCatalogoConCantidadInvalida() PASSED
ServicioReservasTest > calculaTotalDeReserva() PASSED
ServicioReservasTest > fallaCuandoProductoNoExiste() PASSED
BUILD SUCCESSFUL in 1s
```

Salida observada de `./gradlew -q :app:run --args="PED-100 CAF-001 2"`:

```text
{"@timestamp":"2026-11-23T03:20:55.726415-05:00","@version":"1","message":"Iniciando reserva","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"INFO","level_value":20000,"pedidoId":"PED-100","sku":"CAF-001","operacion":"reservar","service":"tienda-aurora-build"}
{"@timestamp":"2026-11-23T03:20:55.729604-05:00","@version":"1","message":"Reserva confirmada total=25.00 cantidad=2","logger_name":"com.aurora.build.app.TiendaAuroraBuildApp","thread_name":"main","level":"INFO","level_value":20000,"pedidoId":"PED-100","sku":"CAF-001","operacion":"reservar","service":"tienda-aurora-build"}
RESERVA_OK PED-100 25.00
```

Salida observada de `mvn -B verify`:

```text
[INFO] --- enforcer:3.6.2:enforce (exige-jdk-25) @ aurora-maven-demo ---
[INFO] Rule 0: org.apache.maven.enforcer.rules.version.RequireJavaVersion passed
[INFO] --- compiler:3.14.1:compile (default-compile) @ aurora-maven-demo ---
[INFO] Compiling 1 source file with javac [debug release 25] to target/classes
[INFO] --- surefire:3.5.4:test (default-test) @ aurora-maven-demo ---
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] Running com.aurora.maven.ImporteTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.019 s -- in com.aurora.maven.ImporteTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- jar:3.5.1:jar (default-jar) @ aurora-maven-demo ---
[INFO] Building jar: /private/tmp/opencode/aurora-m15/maven-demo/target/aurora-maven-demo-1.0.0.jar
[INFO] BUILD SUCCESS
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Build distinto entre máquinas | Gradle/JDK/Maven no fijados | Revisar wrapper/toolchain/Enforcer | Usar `./gradlew`, toolchain Java 25 y `mvn -B verify` con JDK fijado |
| `Tests run: 0` en Maven | Surefire sin provider JUnit Platform | Revisar versión de Surefire y dependencias test | Fijar Surefire 3.5.4 y `junit-jupiter` + launcher |
| Falta `junit-platform-launcher` | JUnit 6 con Gradle | Stack trace de arranque de tests | Declarar `testRuntimeOnly("org.junit.platform:junit-platform-launcher")` |
| Ciclo entre módulos | Dependencia inversa | `gradle dependencies`, imports | Mover contrato a dominio/puerto |
| Test frágil con mocks | Acoplado a implementación | Revisar `verify`/capturas | Verificar comportamiento observable y mensajes de error |
| Integración inestable | BD compartida o sin limpieza | Flakiness, datos sucios | H2 con nombre UUID y seed explícito por test |
| Log sin contexto | MDC no seteado/limpiado | Revisar JSON del appender | `MDC.put` + `finally` con `MDC.remove` |
| Campos de correlación perdidos | Hilo reutilizado sin limpieza | Logs del request anterior en el siguiente | Limpiar MDC al cerrar cada operación |

## Cierre

Build, tests y observabilidad son parte del producto. Un módulo bien separado, un wrapper reproducible, un POM con versiones centralizadas y tests que ejercitan la integración real hacen que cambiar código sea seguro. El siguiente módulo lleva ese criterio a la persistencia: JPA/Hibernate, SQL observable y pruebas contra PostgreSQL efímero.

## Checklist de cierre

- [ ] Puedo explicar wrapper, toolchain, POM, BOM y build reproducible.
- [ ] Ejecuto `mvn -B verify` y `./gradlew test` y sé interpretar su salida.
- [ ] Puedo justificar la separación `domain`/`app` sin ciclos.
- [ ] Escribo tests unitarios rápidos y sé cuándo usar fake/lambda vs Mockito.
- [ ] Sé qué hace reproducible una prueba de integración con BD embebida.
- [ ] Uso SLF4J/MDC sin acoplar el dominio al logging y verifico campos en el JSON.
