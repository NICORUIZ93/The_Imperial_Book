# Módulo 15: Build, testing y calidad

Un proyecto Java profesional no se define solo por compilar. Se define por poder construirse de forma repetible, dividir responsabilidades sin ciclos, probar reglas rápido y diagnosticar comportamiento en ejecución. Este módulo construye `tienda-aurora-build`, un multi-módulo Gradle con dominio, app, tests JUnit 5 y logging estructurado con SLF4J/Logback.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-15-build-testing.html"
    alt="Build reproducible, módulos domain/app, tests JUnit y logging estructurado"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Dominio aislado, app como adaptador, wrapper/build reproducible y tests como feedback rápido.</figcaption>
</figure>

## Proyecto desde cero

#### Prerrequisitos

```bash
java -version
gradle --version
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

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, JUnit 5.13.4, SLF4J 2.0.17, Logback 1.5.18.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-build"
include("domain", "app")
```

#### `build.gradle.kts` (raíz)

Configura grupo, versión, repositorio y toolchain Java 25 para todos los subproyectos. También fija encoding, warnings estrictos y JUnit Platform.

```kotlin
plugins { base }

allprojects {
    group = "com.aurora"
    version = "1.0.0"
    repositories { mavenCentral() }
}

subprojects {
    apply(plugin = "java-library")

    extensions.configure<JavaPluginExtension> {
        toolchain { languageVersion = JavaLanguageVersion.of(25) }
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

#### `domain/build.gradle.kts`

El dominio solo depende de JUnit para tests. No conoce Logback, HTTP ni frameworks.

```kotlin
dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
```

#### `app/build.gradle.kts`

`app` depende de `domain` e incorpora SLF4J/Logback para ejecución. La dependencia apunta al módulo, no a clases copiadas.

```kotlin
plugins { application }

dependencies {
    implementation(project(":domain"))
    implementation("org.slf4j:slf4j-api:2.0.17")
    runtimeOnly("ch.qos.logback:logback-classic:1.5.18")
    runtimeOnly("net.logstash.logback:logstash-logback-encoder:8.1")

    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application { mainClass = "com.aurora.build.app.TiendaAuroraBuildApp" }
```

#### Dominio: `Dinero.java`

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

#### Dominio: `Producto.java`, `ResultadoReserva.java`, `CatalogoProductos.java`

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

```java
package com.aurora.build.domain;
import java.util.Optional;
public interface CatalogoProductos {
    Optional<Producto> buscarPorSku(String sku);
}
```

#### Dominio: `ServicioReservas.java`

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

#### App: `CatalogoEnMemoria.java`

Adaptador simple para ejecutar la app sin base de datos. En integración real podría ser JDBC/JPA.

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

#### App: `logback.xml`

Configura Logback con encoder JSON para que los logs sean fáciles de procesar por herramientas de observabilidad. MDC agrega `pedidoId`, `sku` y `operacion`.

```xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <customFields>{"service":"tienda-aurora-build"}</customFields>
    </encoder>
  </appender>
  <root level="INFO"><appender-ref ref="STDOUT" /></root>
</configuration>
```

#### App: `TiendaAuroraBuildApp.java`

Punto de entrada. Usa SLF4J, no Logback directamente. Pone contexto en MDC y lo limpia en `finally`.

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
        if (args.length > indice && !args[indice].isBlank()) return args[indice];
        return defecto;
    }
}
```

## Tests

#### `domain/.../ServicioReservasTest.java`

Prueba pura: usa un lambda como `CatalogoProductos`, sin Spring, sin BD, sin Logback.

```java
package com.aurora.build.domain;

import org.junit.jupiter.api.Test;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

class ServicioReservasTest {
    @Test
    void calculaTotalDeReserva() {
        CatalogoProductos catalogo = sku -> Optional.ofNullable(Map.of(
                "CAF-001", new Producto("CAF-001", "Café Aurora", Dinero.de("12.50"))
        ).get(sku));
        ServicioReservas servicio = new ServicioReservas(catalogo);
        ResultadoReserva resultado = servicio.reservar("PED-100", "CAF-001", 2);
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

#### `app/.../CatalogoEnMemoriaTest.java`

```java
package com.aurora.build.app;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
class CatalogoEnMemoriaTest {
    @Test void encuentraProductoSemilla() { assertTrue(new CatalogoEnMemoria().buscarPorSku("CAF-001").isPresent()); }
}
```

### Tema 1: Maven avanzado · Intermedio · 40 min

Maven organiza el build alrededor del POM, el ciclo de vida y plugins. En un proyecto maduro, la parte “avanzada” no es escribir XML por escribir, sino controlar versiones, reproducibilidad y fronteras entre módulos. El `pom.xml` declara coordenadas, dependencias, plugins y configuración. El ciclo de vida (`validate`, `compile`, `test`, `package`, `verify`, `install`) da puntos de enganche predecibles.

En equipos, Maven se vuelve problemático cuando cada módulo fija versiones distintas o cuando el build depende de propiedades implícitas de la máquina. La respuesta es BOM/dependencyManagement, versiones explícitas, wrapper y perfiles acotados. En este módulo la verificación ejecutable se hizo con Gradle; el concepto Maven se mantiene porque el track lo pide: el criterio es el mismo, builds reproducibles y dependencias controladas.

### Tema 2: Gradle y builds reproducibles · Avanzado · 45 min

Gradle describe el build como tareas y dependencias entre tareas. El wrapper (`./gradlew`) fija la versión de Gradle usada por el proyecto, evitando “en mi máquina tengo otro Gradle”. La toolchain fija Java 25. Las dependencias vienen de repositorios declarados con versiones concretas.

Un build reproducible significa que el mismo comando produce el mismo resultado relevante en otra máquina compatible. No elimina diferencias inevitables (timestamp, entorno), pero sí elimina la mayoría de sorpresas operativas. `-Werror` y `-Xlint:all` convierten warnings en señal temprana.

### Tema 3: Proyectos multi-módulo sin ciclos · Avanzado · 40 min

Separar en módulos obliga a declarar dependencias. `domain` contiene reglas; `app` contiene el adaptador/entrada. `app` depende de `domain`, nunca al revés. Esta dirección evita ciclos y permite probar el dominio sin levantar logging, HTTP o infraestructura.

La regla práctica: si un tipo de dominio necesita importar una clase de app, la frontera está mal. Se resuelve con puertos/interfaces (`CatalogoProductos`) o moviendo el tipo al lugar correcto. Los ciclos entre módulos son costosos porque rompen compilación incremental, empaquetado y claridad mental.

### Tema 4: JUnit 6, Mockito y assertions expresivas · Avanzado · 45 min

Las pruebas unitarias deben ser rápidas, deterministas y legibles. JUnit 5/6 aporta el modelo de extensión y anotaciones (`@Test`, lifecycle, assertions). Mockito o dobles manuales aíslan dependencias. En este proyecto, `ServicioReservasTest` usa un lambda como catálogo: es más simple que Mockito para un puerto pequeño.

Las assertions expresivas dicen qué falló y por qué. `assertThrows` valida tipo y mensaje cuando el mensaje es parte del contrato. El error común es probar detalles internos (métodos privados, orden de llamadas irrelevante) en vez de comportamiento observable. Otro error es usar Mockito para todo; un fake/lambda simple suele ser más claro.

### Tema 5: Pruebas de integración reproducibles · Avanzado · 40 min

Las pruebas de integración verifican que piezas reales colaboran: BD, serialización, configuración, contenedor, filesystem. Deben ser reproducibles: misma entrada, mismo entorno controlado, mismo resultado. Testcontainers, H2 en memoria o fixtures controlados ayudan, pero cada uno tiene límites. H2 no es PostgreSQL; Testcontainers es más fiel pero más pesado.

En este módulo la integración demostrada es app+dominio+logging con entrada fija (`:app:run --args="PED-100 CAF-001 2"`), y la suite corre con `./gradlew -q test`. Para integraciones de BD/cola, el mismo principio aplica: declarar dependencias, aislar datos, limpiar estado y evitar depender de servicios externos compartidos.

**Observabilidad útil en tests/ejecución:** SLF4J como fachada, Logback como implementación, MDC para contexto (`pedidoId`, `sku`, `operacion`). El dominio no loguea infraestructura; la app loguea en bordes. Los logs JSON facilitan correlación.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m15` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q :app:run --args="PED-100 CAF-001 2"
```

Resultados observados:

- `test`: 0 fallas (tests en `domain` y `app`).
- `:app:run`: logs JSON con MDC (`pedidoId=PED-100`, `sku=CAF-001`, `operacion=reservar`) y salida `RESERVA_OK PED-100 25.00`.

**Nota honesta:** el módulo cubre Maven conceptualmente (track), pero la ejecución verificada fue con Gradle wrapper. No se ejecutó Maven en esta corrida.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Build distinto entre máquinas | Gradle/JDK no fijados | Revisar wrapper/toolchain | Usar `./gradlew` y toolchain Java |
| Ciclo entre módulos | Dependencia inversa | `gradle dependencies`, imports | Mover contrato a dominio/puerto |
| Test frágil | Acoplado a implementación | Revisar asserts/mock | Probar comportamiento observable |
| Log sin contexto | MDC no seteado/limpiado | Revisar JSON/log | `MDC.put` + `finally remove` |
| Integración inestable | Depende de entorno compartido | Flakiness, datos sucios | Aislar datos, Testcontainers/fixtures controlados |

## Cierre

El build, los tests y la observabilidad son parte del producto. Un módulo bien separado, un wrapper reproducible y tests rápidos hacen que cambiar código sea seguro. La calidad no se añade al final: se diseña desde la estructura.

## Checklist de cierre

- [ ] Puedo explicar wrapper, toolchain y build reproducible.
- [ ] Puedo justificar la separación `domain`/`app` sin ciclos.
- [ ] Escribo tests unitarios rápidos para reglas de dominio.
- [ ] Entiendo cuándo usar fake/lambda vs Mockito.
- [ ] Sé qué hace reproducible una prueba de integración.
- [ ] Uso SLF4J/MDC sin acoplar el dominio al logging.
