# Módulo 3 · Testing y calidad

**Fase 1 · Spring Boot de cero a experto** (semana 5 de 12). **Duración:** 15 h (5 temas de 2,5–3,5 h).
**Dificultad:** 3 de 5. **Dependencias:** Módulo 2 (APIs REST y persistencia: controllers, DTOs, JDBC/JPA y
PostgreSQL) y, de la Fase 0, Docker básico (Módulo 0.5). **Herramientas:**JDK 25 LTS**, **Spring Boot 4.1.3**
(que gestiona JUnit Jupiter 6.0.3, Mockito 5.23.0, AssertJ 3.27.7 y Testcontainers 2.0.5), Pact JVM 4.7.7,
Pact Broker 2.124.0, ArchUnit 1.5.1, JaCoCo 0.8.15, SonarQube Community Build 26.11 y Docker con Compose v2.

ejecuta los tests, el ciclo completo del Pact Broker y el análisis de SonarQube).

Un microservicio que no tiene tests no se puede cambiar sin miedo, y un sistema de microservicios cambia todos los
días. En este módulo construyes la **red de seguridad** completa, de la pieza más pequeña a la más grande: tests de
unidad con JUnit y Mockito, tests de la capa web con MockMvc, tests contra una base de datos real con
Testcontainers, contratos entre servicios con Pact, reglas de arquitectura con ArchUnit y un tablero de calidad con
SonarQube.

```mermaid
flowchart BT
    U["1 · JUnit + Mockito + MockMvc<br/>unidad y capa web (milisegundos)"] --> I["2 · Testcontainers<br/>integración con PostgreSQL real (segundos)"]
    I --> C["3 · Pact + Pact Broker<br/>contratos entre servicios"]
    U --> A["4 · ArchUnit<br/>reglas de arquitectura como tests"]
    C --> S["5 · SonarQube<br/>cobertura, bugs y Quality Gate"]
    A --> S
```

**Texto alternativo:** diagrama de abajo hacia arriba. En la base, el tema 1 (JUnit, Mockito y MockMvc: tests de
unidad y de capa web que tardan milisegundos). De él salen dos flechas: al tema 2 (Testcontainers: integración con
PostgreSQL real, segundos) y al tema 4 (ArchUnit). Del tema 2 se sube al tema 3 (Pact y Pact Broker). Los temas 3 y
4 llegan al tema 5 (SonarQube), que resume la calidad de todo.

**Sobre «JUnit 5».** El temario dice JUnit 5 porque así se llamaba la plataforma cuando se escribió. El 30 de
septiembre de 2025 salió **JUnit 6.0.0** y Spring Boot 4.1.3 trae **JUnit 6.0.3**. No es un cambio de forma de
escribir tests: JUnit 6 sigue usando el **modelo de programación Jupiter** (`org.junit.jupiter.api.Test`,
`@BeforeEach`, `@ParameterizedTest`, `@ExtendWith`…) que nació con JUnit 5. Lo que cambió: exige **Java 17 o
superior**, Platform, Jupiter y Vintage comparten **un único número de versión** (6.0.3 para todo; en JUnit 5 la
Platform iba por 1.x), las APIs anotan su nulabilidad con JSpecify, se retiraron APIs que ya estaban obsoletas (por
ejemplo `MethodOrderer.Alphanumeric` y el módulo `junit-platform-runner`) y el motor Vintage (tests de JUnit 4) queda
obsoleto. Todo lo que aprendas aquí con «Jupiter» vale para proyectos con JUnit 5.10+ y con JUnit 6. Fuente:
https://docs.junit.org/6.0.0/release-notes/

| Herramienta | Versión | Quién la fija |
|---|---|---|
| JUnit Jupiter / Platform | 6.0.3 | BOM de Spring Boot 4.1.3 |
| Mockito | 5.23.0 | BOM de Spring Boot 4.1.3 |
| AssertJ | 3.27.7 | BOM de Spring Boot 4.1.3 |
| Testcontainers | 2.0.5 | BOM de Spring Boot 4.1.3 |
| Pact JVM | 4.7.7 | tu catálogo `gradle/libs.versions.toml` |
| Pact Broker | 2.124.0 (imagen `pactfoundation/pact-broker:3.2.0-pactbroker2.124.0`) | `docker-compose.yml` |
| ArchUnit | 1.5.1 (`archunit-junit6`) | tu catálogo `gradle/libs.versions.toml` |
| JaCoCo | 0.8.15 | tu catálogo `gradle/libs.versions.toml` |
| SonarScanner for Gradle (plugin `org.sonarqube`) | 7.5.0.8588 | tu catálogo `gradle/libs.versions.toml` |
| SonarQube | Community Build 26.11.0.134175 | `docker-compose.yml` |

---


### JUnit 5, Mockito, MockMvc

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Escribir tests de unidad con JUnit Jupiter y Mockito y tests de la capa web con MockMvc para un servicio de cotizaciones, distinguiendo qué prueba cada nivel; lo compruebas cuando los 11 tests de f032-junit-mockito-mockmvc pasan y, al romper la frontera del descuento a propósito,…

#### ► LA IDEA EN UNA FRASE
**Escribir tests de unidad con JUnit Jupiter y Mockito y tests de la capa web con MockMvc para un servicio de cotizaciones, distinguiendo qué prueba cada nivel; lo compruebas cuando los 11 tests de f032-junit-mockito-mockmvc pasan y, al romper la frontera del descuento a propósito, falla exactamente el caso que la cubre.**

#### ► POR QUÉ EXISTE ESTO
Un test es un pequeño programa que usa tu programa y comprueba que hace lo que prometiste. En vez de abrir el navegador y mirar a ojo, escribes: «si pido 10 teclados de 100, el total debe ser 900». El ordenador lo comprueba en milisegundos, siempre igual, cada vez que cambias algo.

#### ► LA ANALOGÍA
Piensa en junit 5, mockito, mockmvc como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph UNIDAD["CatalogoServicioTest (sin Spring)"]
      T1["JUnit Jupiter<br/>@Test / @ParameterizedTest"] --> S1["CatalogoServicio<br/>(real)"]
      S1 --> M1["ProductoRepositorio<br/>@Mock de Mockito"]
    end
    subgraph WEB["ProductoControllerTest (@WebMvcTest)"]
      T2["MockMvc.perform(get(...))"] --> D["DispatcherServlet"]
      D --> C["ProductoController<br/>(real)"]
      C --> M2["CatalogoServicio<br/>@MockitoBean"]
      D --> J["Jackson 3<br/>objeto -> JSON"]
    end
```

1. **JUnit** es la herramienta que encuentra tus tests, los ejecuta y pinta verde (pasa) o rojo (falla).
2. **Mockito** crea **dobles**: objetos de mentira que sustituyen a una pieza lenta o que aún no existe (la base de
3. **MockMvc** permite enviar peticiones HTTP a tu controller **sin arrancar un servidor**: compruebas el código de

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| JUnit 5, Mockito, MockMvc se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar JUnit 5, Mockito, MockMvc | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El test que repite la implementación («mock-everything»). Se ve así:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: junit 5, mockito, mockmvc funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **JUnit** es la herramienta que encuentra tus tests, los ejecuta y pinta verde (pasa) o rojo (falla).
- **Mockito** crea **dobles**: objetos de mentira que sustituyen a una pieza lenta o que aún no existe (la base de
- **MockMvc** permite enviar peticiones HTTP a tu controller **sin arrancar un servidor**: compruebas el código de

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve junit 5, mockito, mockmvc en tu contexto?
2. ¿Cómo sabrías que junit 5, mockito, mockmvc no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar junit 5, mockito, mockmvc?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Ejecuta los tests:

```bash
../gradlew test
```

   **Output esperado** (esquema de la salida de Gradle; el texto exacto de cada línea está pendiente de verificación
   en el Mac):

```text
CatalogoServicioTest > … PASSED        <- 8 líneas, una por test (el parametrizado cuenta 4)
ProductoControllerTest > … PASSED      <- 3 líneas

BUILD SUCCESSFUL in …s
```

   El informe completo, con tiempos por clase, queda en `build/reports/tests/test/index.html`.

   **Captura comentada:** `CatalogoServicioTest` cuenta 8 porque el test parametrizado se ejecuta 4 veces (una por
   fila de `@CsvSource`) más los 4 tests normales. `CatalogoServicioTest` tarda milisegundos (no hay Spring);
   `ProductoControllerTest` tarda un par de segundos porque arranca el contexto de la capa web. Los tiempos varían.

2. Arranca la API y pruébala de verdad:

```bash
../gradlew bootRun
# en otra terminal:
curl -s "localhost:8080/productos/1/cotizacion?cantidad=10"; echo
curl -s -o /dev/null -w "%{http_code}\n" "localhost:8080/productos/99/cotizacion?cantidad=1"
curl -s -o /dev/null -w "%{http_code}\n" "localhost:8080/productos/1/cotizacion"
```

   **Output esperado:**

```text
{"id":1,"cantidad":10,"total":900}
404
400
```

3. **Rompe la regla a propósito.** En `CatalogoServicio` cambia `cantidad >= 10` por `cantidad > 10` y vuelve a
   ejecutar `../gradlew test`.

   **Output esperado:** falla **1** test, el caso `10 unidades a 100 -> total 900` del parametrizado. El de MockMvc
   **no** falla, porque ahí el servicio es un mock y la regla no se ejecuta. Gradle muestra (esquema: el formato es el
   real de Gradle con `exceptionFormat = FULL`, comprobado aquí con otro test; el texto de este caso está pendiente
   de verificación en el Mac):

```text
CatalogoServicioTest > aplicaElDescuentoDesdeDiezUnidades(…) > … FAILED
    org.opentest4j.AssertionFailedError: …
    expected: 900
     but was: 1000
        at … CatalogoServicioTest.aplicaElDescuentoDesdeDiezUnidades(CatalogoServicioTest.java:<línea>)

11 tests completed, 1 failed

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':f032-junit-mockito-mockmvc:test'.
> There were failing tests. See the report at: file:///…/build/reports/tests/test/index.html
```

   **Captura comentada:** un solo caso rojo (10 unidades) te dice exactamente qué frontera se rompió; los casos 1, 9
   y 20 siguen verdes. Esto es lo que buscas: tests que fallan **por la razón correcta** y en **un solo lugar**.
   Restaura `>=` antes de seguir.

#### Código de referencia / ejecutable
Versiones: **JDK 25**, **Spring Boot 4.1.3**, **JUnit Jupiter 6.0.3**, **Mockito 5.23.0**, **AssertJ 3.27.7**
(las tres últimas gestionadas por el BOM; no escribas su versión). Proyecto completo en
`f032-junit-mockito-mockmvc`.

> **Build con Gradle (y su equivalencia en Maven).** Este laboratorio se construye con **Gradle 9.9.2** y Kotlin DSL
> mediante el wrapper `./gradlew` (no instalas Gradle). `settings.gradle.kts` lista los subproyectos (en Maven,
> `<modules>` del POM agregador), cada carpeta tiene su `build.gradle.kts` (su `pom.xml`) y
> `gradle/libs.versions.toml` es el **catálogo de versiones** (las `<properties>` y el `dependencyManagement`): por eso
> las dependencias se escriben `libs.…`. Equivalencias: `./mvnw test` → `./gradlew test` ·
> `./mvnw package -DskipTests` → `./gradlew bootJar` · `./mvnw spring-boot:run` → `./gradlew bootRun` ·
> `-Dtest=Clase` → `--tests Clase` · `target/` → `build/` (el jar queda en `build/libs/`). Gradle escribe una línea
> `PASSED` por test y termina con `BUILD SUCCESSFUL` (Maven: `Tests run: N` y `BUILD SUCCESS`).

`modulo-7/settings.gradle.kts`:

```kotlin
// Módulo 3 (modulo-7) · Build multi-proyecto: "./gradlew test" ejecuta los tests de las 5 fichas (F032–F036).
// El orden importa y está declarado: el test del proveedor de Pact depende del test del consumidor (que genera el
// contrato). F033 (Testcontainers) necesita Docker en marcha; Pact Broker y SonarQube se levantan con docker-compose.yml.
// Cada carpeta tiene su propio build.gradle.kts; las versiones viven en gradle/libs.versions.toml
// (catálogo "libs"). Equivale al POM agregador con <modules> de Maven.
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}
// Sin esto, un alumno sin JDK 25 instalado ve el build morir en la configuración, antes de cualquier test.
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "modulo-7-laboratorios"

include(
    "f032-junit-mockito-mockmvc",
    "f033-testcontainers",
    "f034-pact-consumidor",
    "f034-pact-proveedor",
    "f035-archunit",
    "f036-sonarqube",
)
```

`modulo-7/gradle/libs.versions.toml`:

```toml
# Módulo 3 (modulo-7)
# Catálogo de versiones del laboratorio: una sola fuente para plugins y librerías.
# Las librerías SIN versión las fija el BOM de Spring Boot (spring-boot-dependencies) o el BOM que importe el proyecto.

[versions]
# plugins.gradle.org/plugin/org.sonarqube (consultado el 2026-11-20)
sonarqube = "7.5.0.8588"
jacoco = "0.8.15"
pact = "4.7.7"
spring-boot = "4.1.3"

[libraries]
spring-boot-starter-webmvc = { module = "org.springframework.boot:spring-boot-starter-webmvc" }
spring-boot-starter-test = { module = "org.springframework.boot:spring-boot-starter-test" }
spring-boot-starter-webmvc-test = { module = "org.springframework.boot:spring-boot-starter-webmvc-test" }
junit-platform-launcher = { module = "org.junit.platform:junit-platform-launcher" }
spring-boot-starter-jdbc = { module = "org.springframework.boot:spring-boot-starter-jdbc" }
postgresql = { module = "org.postgresql:postgresql" }
spring-boot-testcontainers = { module = "org.springframework.boot:spring-boot-testcontainers" }
testcontainers-junit-jupiter = { module = "org.testcontainers:testcontainers-junit-jupiter" }
testcontainers-postgresql = { module = "org.testcontainers:testcontainers-postgresql" }
pact-consumer-junit5 = { module = "au.com.dius.pact.consumer:junit5", version.ref = "pact" }
spring-boot-dependencies = { module = "org.springframework.boot:spring-boot-dependencies", version.ref = "spring-boot" }
pact-provider-junit5 = { module = "au.com.dius.pact.provider:junit5", version.ref = "pact" }
archunit-junit6 = { module = "com.tngtech.archunit:archunit-junit6", version = "1.5.1" }
spring-boot-starter = { module = "org.springframework.boot:spring-boot-starter" }

[plugins]
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
spring-dependency-management = { id = "io.spring.dependency-management", version = "1.1.7" }
pact = { id = "au.com.dius.pact", version.ref = "pact" }
sonarqube = { id = "org.sonarqube", version.ref = "sonarqube" }
```

`f032-junit-mockito-mockmvc/build.gradle.kts`:

```kotlin
// F032 · JUnit 5 (hoy JUnit Jupiter 6.0.3), Mockito 5.23.0, MockMvc (Spring Boot 4.1.3, JDK 25)
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // Spring MVC 7 + Tomcat 11 + Jackson 3
    implementation(libs.spring.boot.starter.webmvc)
    // JUnit Jupiter 6.0.3 + Mockito 5.23.0 + AssertJ 3.27.7 (versiones del BOM de Boot 4.1.3)
    testImplementation(libs.spring.boot.starter.test)
    // @WebMvcTest y MockMvc
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

Código de producción (`src/main/java/academia/pruebas/`):

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/PruebasApp.java`:

```java
package academia.pruebas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F032 · Catálogo con reglas de precio: lo probamos en 3 niveles (unidad, mocks, capa web). */
@SpringBootApplication
public class PruebasApp {
    public static void main(String[] args) {
        SpringApplication.run(PruebasApp.class, args);
    }
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/Producto.java`:

```java
package academia.pruebas;

public record Producto(long id, String nombre, int precio, int stock) {
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/Cotizacion.java`:

```java
package academia.pruebas;

/** Lo que devuelve la API: {"id":1,"cantidad":10,"total":900}. */
public record Cotizacion(long id, int cantidad, int total) {
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/ProductoRepositorio.java`:

```java
package academia.pruebas;

import java.util.Optional;

/** El servicio depende de esta interfaz, no de una base concreta: por eso se puede simular con Mockito. */
public interface ProductoRepositorio {
    Optional<Producto> buscar(long id);

    void guardar(Producto producto);
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/RepositorioEnMemoria.java`:

```java
package academia.pruebas;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

@Repository
class RepositorioEnMemoria implements ProductoRepositorio {

    private final Map<Long, Producto> filas = new ConcurrentHashMap<>(Map.of(
            1L, new Producto(1, "Teclado", 100, 5)));

    @Override
    public Optional<Producto> buscar(long id) {
        return Optional.ofNullable(filas.get(id));
    }

    @Override
    public void guardar(Producto producto) {
        filas.put(producto.id(), producto);
    }
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/ProductoNoEncontrado.java`:

```java
package academia.pruebas;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProductoNoEncontrado extends RuntimeException {
    public ProductoNoEncontrado(long id) {
        super("No existe el producto " + id);
    }
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/PeticionInvalida.java`:

```java
package academia.pruebas;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PeticionInvalida extends RuntimeException {
    public PeticionInvalida(String mensaje) {
        super(mensaje);
    }
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/CatalogoServicio.java`:

```java
package academia.pruebas;

import org.springframework.stereotype.Service;

/** Reglas: 10 % de descuento desde 10 unidades; cantidad > 0; no se reserva más que el stock. */
@Service
public class CatalogoServicio {

    private final ProductoRepositorio repositorio;

    public CatalogoServicio(ProductoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    public Cotizacion cotizar(long id, int cantidad) {
        if (cantidad <= 0) {
            throw new PeticionInvalida("La cantidad debe ser mayor que 0");
        }
        Producto p = repositorio.buscar(id).orElseThrow(() -> new ProductoNoEncontrado(id));
        int bruto = p.precio() * cantidad;
        int total = cantidad >= 10 ? bruto * 90 / 100 : bruto;
        return new Cotizacion(id, cantidad, total);
    }

    public void reservar(long id, int cantidad) {
        Producto p = repositorio.buscar(id).orElseThrow(() -> new ProductoNoEncontrado(id));
        if (cantidad > p.stock()) {
            throw new PeticionInvalida("Solo quedan " + p.stock() + " unidades");
        }
        repositorio.guardar(new Producto(p.id(), p.nombre(), p.precio(), p.stock() - cantidad));
    }
}
```

`f032-junit-mockito-mockmvc/src/main/java/academia/pruebas/ProductoController.java`:

```java
package academia.pruebas;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductoController {

    private final CatalogoServicio servicio;

    ProductoController(CatalogoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/productos/{id}/cotizacion")
    Cotizacion cotizar(@PathVariable long id, @RequestParam int cantidad) {
        return servicio.cotizar(id, cantidad);
    }
}
```

Tests (`src/test/java/academia/pruebas/`). Unidad con JUnit + Mockito:

`f032-junit-mockito-mockmvc/src/test/java/academia/pruebas/CatalogoServicioTest.java`:

```java
package academia.pruebas;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Test de UNIDAD: sin Spring. Mockito sustituye al repositorio; corre en milisegundos. */
@ExtendWith(MockitoExtension.class)
class CatalogoServicioTest {

    @Mock ProductoRepositorio repositorio;          // doble de prueba: responde lo que le digamos
    @InjectMocks CatalogoServicio servicio;          // la clase bajo prueba, con el mock inyectado

    @ParameterizedTest(name = "{0} unidades a 100 -> total {1}")
    @CsvSource({"1, 100", "9, 900", "10, 900", "20, 1800"})
    void aplicaElDescuentoDesdeDiezUnidades(int cantidad, int totalEsperado) {
        given(repositorio.buscar(1)).willReturn(Optional.of(new Producto(1, "Teclado", 100, 50)));

        assertThat(servicio.cotizar(1, cantidad).total()).isEqualTo(totalEsperado);
    }

    @Test
    @DisplayName("Un producto que no existe lanza ProductoNoEncontrado")
    void productoInexistente() {
        given(repositorio.buscar(99)).willReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.cotizar(99, 1))
                .isInstanceOf(ProductoNoEncontrado.class)
                .hasMessage("No existe el producto 99");
    }

    @Test
    void cantidadCeroNiSiquieraConsultaElRepositorio() {
        assertThatThrownBy(() -> servicio.cotizar(1, 0)).isInstanceOf(PeticionInvalida.class);
        verify(repositorio, never()).buscar(1);
    }

    @Test
    void reservarGuardaElStockDescontado() {
        given(repositorio.buscar(1)).willReturn(Optional.of(new Producto(1, "Teclado", 100, 5)));

        servicio.reservar(1, 2);

        ArgumentCaptor<Producto> guardado = ArgumentCaptor.forClass(Producto.class);
        verify(repositorio).guardar(guardado.capture());           // ¿se llamó? ¿con qué?
        assertThat(guardado.getValue().stock()).isEqualTo(3);
    }

    @Test
    void sinStockNoSeGuardaNada() {
        given(repositorio.buscar(1)).willReturn(Optional.of(new Producto(1, "Teclado", 100, 1)));

        assertThatThrownBy(() -> servicio.reservar(1, 2)).hasMessage("Solo quedan 1 unidades");
        verify(repositorio, never()).guardar(any());
    }
}
```

Capa web con MockMvc:

`f032-junit-mockito-mockmvc/src/test/java/academia/pruebas/ProductoControllerTest.java`:

```java
package academia.pruebas;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Test de la CAPA WEB: @WebMvcTest arranca solo Spring MVC (DispatcherServlet, controller, Jackson)
 * sin Tomcat ni servicios reales. El servicio es un @MockitoBean.
 */
@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean CatalogoServicio servicio;

    @Test
    void devuelve200ConElJsonDeLaCotizacion() throws Exception {
        given(servicio.cotizar(1, 10)).willReturn(new Cotizacion(1, 10, 900));

        mvc.perform(get("/productos/1/cotizacion").param("cantidad", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.total").value(900))
                .andExpect(jsonPath("$.cantidad").value(10));
    }

    @Test
    void productoInexistenteEs404() throws Exception {
        given(servicio.cotizar(99, 1)).willThrow(new ProductoNoEncontrado(99));

        mvc.perform(get("/productos/99/cotizacion").param("cantidad", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void sinElParametroCantidadEs400() throws Exception {
        mvc.perform(get("/productos/1/cotizacion"))
                .andExpect(status().isBadRequest());
    }
}
```

#### Verificación
Test que debe pasar: `../gradlew test` en `f032-junit-mockito-mockmvc` con 11 líneas `PASSED`, ninguna `FAILED`, y
`BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)*.

Reto: añade a `CatalogoServicioTest` un test `reservarTodoElStockDejaCero` que reserve 5 de 5 y compruebe con
`ArgumentCaptor` que se guarda `stock() == 0`. Debe pasar sin tocar el código de producción:

```java
@Test
void reservarTodoElStockDejaCero() {
    given(repositorio.buscar(1)).willReturn(Optional.of(new Producto(1, "Teclado", 100, 5)));

    servicio.reservar(1, 5);

    ArgumentCaptor<Producto> guardado = ArgumentCaptor.forClass(Producto.class);
    verify(repositorio).guardar(guardado.capture());
    assertThat(guardado.getValue().stock()).isZero();
}
```

**Pregunta de comprobación:** en el paso 3 del laboratorio rompiste la regla del descuento y el test de MockMvc
siguió verde. ¿Es un fallo del test de MockMvc?

<details>
<summary>Respuesta</summary>

No. `ProductoControllerTest` no prueba la regla de negocio: el servicio es un `@MockitoBean` que devuelve lo que el
test programó. Su trabajo es probar el **contrato HTTP** del controller (ruta, parámetros, código de estado, JSON).
La regla la protege `CatalogoServicioTest`. Cada nivel prueba una cosa; si un mismo error rompiera tests de todos
los niveles, tendrías tests redundantes y lentos.
</details>

</details>

### Testcontainers

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir un test de integración que arranque PostgreSQL 18.7 en Docker con Testcontainers y lo conecte a Spring Boot con @ServiceConnection, y justificar por qué una base en memoria no habría detectado el mismo fallo; lo compruebas cuando los 3 tests de f033-testcontainers pasan…

#### ► LA IDEA EN UNA FRASE
**Construir un test de integración que arranque PostgreSQL 18.7 en Docker con Testcontainers y lo conecte a Spring Boot con @ServiceConnection, y justificar por qué una base en memoria no habría detectado el mismo fallo; lo compruebas cuando los 3 tests de f033-testcontainers pasan y docker ps muestra el contenedor solo mientras corren.**

#### ► POR QUÉ EXISTE ESTO
Tu servicio guarda datos en PostgreSQL. Para probarlo de verdad necesitas un PostgreSQL… pero no quieres instalarlo a mano en cada computadora ni compartir una base con tus compañeros (alguien borra tus datos a mitad de la prueba).

#### ► LA ANALOGÍA
Piensa en testcontainers como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant J as JUnit (@Testcontainers)
    participant TC as Testcontainers
    participant D as Docker
    participant B as Spring Boot
    participant R as ClienteRepositorio
    J->>TC: antes de la clase: start() del @Container
    TC->>D: crea y arranca postgres:18.7 (puerto aleatorio)
    D-->>TC: listo cuando el log dice "ready to accept connections"
    TC-->>B: @ServiceConnection: URL JDBC, usuario y clave
    B->>B: crea DataSource y ejecuta schema.sql
    J->>R: registrarVisita(...)
    R->>D: INSERT ... ON CONFLICT ... RETURNING
    J->>TC: después de la clase: stop()
    TC->>D: elimina el contenedor
```

1. Tu servicio guarda datos en PostgreSQL.
2. Para probarlo de verdad necesitas un PostgreSQL… pero no quieres instalarlo a mano en cada computadora ni compartir una base con tus compañeros (alguien borra tus datos a mitad de la prueba).

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Testcontainers se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Testcontainers | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La base de datos de pruebas compartida. Todos los desarrolladores y el CI apuntan a jdbc:postgresql://db-test:5432/app:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: testcontainers funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Tu servicio guarda datos en PostgreSQL.
- Para probarlo de verdad necesitas un PostgreSQL… pero no quieres instalarlo a mano en cada computadora ni compartir una base con tus compañeros (alguien borra tus datos a mitad de la prueba).

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve testcontainers en tu contexto?
2. ¿Cómo sabrías que testcontainers no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar testcontainers?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Comprueba Docker y descarga la imagen una vez (así el primer test no espera la descarga):

```bash
docker version --format '{{.Server.Version}}'
docker pull postgres:18.7
```

   **Output esperado:** la versión del servidor (por ejemplo `29.10.0`) y, al final del `pull`,
   `Status: Downloaded newer image for postgres:18.7` (o `Image is up to date for postgres:18.7` si ya la tenías).

2. Ejecuta los tests y, mientras corren, mira los contenedores en otra terminal:

```bash
../gradlew test
# en otra terminal, durante la ejecución:
docker ps --format '{{.Image}}  {{.Ports}}'
```

   **Output esperado** de `docker ps` (los puertos del host cambian en cada ejecución):

```text
postgres:18.7  0.0.0.0:55012->5432/tcp
testcontainers/ryuk:…  0.0.0.0:55011->8080/tcp
```

   y al final de Gradle, tras 3 líneas `PASSED` *(el conteo está verificado en el Mac del dueño el 2026-11-21: f033 da
   3 tests y 0 fallos; las dos líneas de `docker ps` de arriba son ilustrativas —los puertos son aleatorios y la etiqueta
   exacta de la imagen de Ryuk sigue sin capturar—)*:

```text
BUILD SUCCESSFUL in …s
```

   **Captura comentada:** en el log del test verás líneas de `tc.postgres:18.7` con `Creating container for image:
   postgres:18.7` y `Container postgres:18.7 started in PT…S`; después, el arranque normal de Spring Boot. Repite
   `docker ps` al terminar: ya no hay contenedores. El puerto del host (55012 en el ejemplo) es aleatorio: por eso
   la URL no se escribe en ningún archivo.

3. **Fallo deliberado:** cambia en `schema.sql` `email TEXT PRIMARY KEY` por `email TEXT` (sin clave) y repite.
   **Output esperado:** fallan los dos tests que llaman a `registrarVisita` (2 líneas `FAILED` y `3 tests completed, 2 failed`) con un
   `BadSqlGrammarException` cuyo mensaje de PostgreSQL es `ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification`. Esa
   regla solo la aplica PostgreSQL real: es justo lo que Testcontainers detecta y una base de juguete podría no
   detectar. Restaura la clave.

#### Código de referencia / ejecutable
Versiones: **JDK 25**, **Spring Boot 4.1.3**, **Testcontainers 2.0.5** (gestionado por el BOM de Boot),
**driver PostgreSQL 42.7.14**, imagen **`postgres:18.7`**. Necesitas Docker en marcha. Proyecto completo en
`f033-testcontainers`.

`f033-testcontainers/build.gradle.kts`:

```kotlin
// F033 · Testcontainers 2.0.5 + PostgreSQL 18.7 (Spring Boot 4.1.3, JDK 25). Necesita Docker en marcha.
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // JdbcClient + HikariCP
    implementation(libs.spring.boot.starter.jdbc)
    // Driver JDBC de PostgreSQL 42.7.14 (gestionado por Boot)
    runtimeOnly(libs.postgresql)
    testImplementation(libs.spring.boot.starter.test)
    // @ServiceConnection: Boot lee host, puerto, usuario y clave del contenedor
    testImplementation(libs.spring.boot.testcontainers)
    // Testcontainers 2.0.5 (gestionado por Boot): @Testcontainers/@Container y el módulo de PostgreSQL
    testImplementation(libs.testcontainers.junit.jupiter)
    testImplementation(libs.testcontainers.postgresql)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

Configuración y esquema:

`f033-testcontainers/src/main/resources/application.properties`:

```properties
# F033 · Sin URL de base de datos a propósito: en los tests la pone @ServiceConnection desde el contenedor.
spring.sql.init.mode=always
```

`f033-testcontainers/src/main/resources/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS cliente (
    email   TEXT PRIMARY KEY,
    nombre  TEXT NOT NULL,
    visitas INT  NOT NULL DEFAULT 1
);
```

Código de producción:

`f033-testcontainers/src/main/java/academia/contenedores/ContenedoresApp.java`:

```java
package academia.contenedores;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F033 · Repositorio con SQL propio de PostgreSQL. Para ejecutarlo en desarrollo: ../gradlew bootTestRun */
@SpringBootApplication
public class ContenedoresApp {
    public static void main(String[] args) {
        SpringApplication.run(ContenedoresApp.class, args);
    }
}
```

`f033-testcontainers/src/main/java/academia/contenedores/Cliente.java`:

```java
package academia.contenedores;

public record Cliente(String email, String nombre, int visitas) {
}
```

`f033-testcontainers/src/main/java/academia/contenedores/ClienteRepositorio.java`:

```java
package academia.contenedores;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/** Usa dos cosas que SOLO tiene PostgreSQL (o que H2 imita a medias): ON CONFLICT ... RETURNING e ILIKE. */
@Repository
public class ClienteRepositorio {

    private final JdbcClient jdbc;

    ClienteRepositorio(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** Inserta o suma una visita en UNA sentencia atómica; devuelve el total de visitas. */
    public int registrarVisita(String email, String nombre) {
        return jdbc.sql("""
                INSERT INTO cliente (email, nombre) VALUES (:email, :nombre)
                ON CONFLICT (email) DO UPDATE SET visitas = cliente.visitas + 1
                RETURNING visitas
                """)
                .param("email", email).param("nombre", nombre)
                .query(Integer.class).single();
    }

    /** Búsqueda sin distinguir mayúsculas. */
    public List<Cliente> buscarPorNombre(String fragmento) {
        return jdbc.sql("SELECT email, nombre, visitas FROM cliente WHERE nombre ILIKE :patron ORDER BY email")
                .param("patron", "%" + fragmento + "%")
                .query(Cliente.class).list();
    }
}
```

Test de integración:

`f033-testcontainers/src/test/java/academia/contenedores/ClienteRepositorioTest.java`:

```java
package academia.contenedores;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Testcontainers arranca un PostgreSQL 18.7 REAL en Docker antes de los tests y lo destruye al final.
 * @ServiceConnection entrega a Spring Boot la URL, el usuario y la clave: no hay application-test.properties.
 */
@Testcontainers
@SpringBootTest
class ClienteRepositorioTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18.7");

    @Autowired ClienteRepositorio repositorio;

    @Test
    void elUpsertCuentaVisitasSinDuplicarFilas() {
        assertThat(repositorio.registrarVisita("ana@example.com", "Ana")).isEqualTo(1);
        assertThat(repositorio.registrarVisita("ana@example.com", "Ana")).isEqualTo(2);
        assertThat(repositorio.registrarVisita("ana@example.com", "Ana")).isEqualTo(3);
    }

    @Test
    void ilikeNoDistingueMayusculas() {
        repositorio.registrarVisita("beto@example.com", "Alberto");
        assertThat(repositorio.buscarPorNombre("BER"))
                .extracting(Cliente::email)
                .containsExactly("beto@example.com");
    }

    @Test
    void laBaseEsDeVerdadPostgres18() {
        assertThat(postgres.isRunning()).isTrue();
        assertThat(postgres.getJdbcUrl()).startsWith("jdbc:postgresql://");
    }
}
```

Arranque de desarrollo con el mismo contenedor (opcional):

`f033-testcontainers/src/test/java/academia/contenedores/ContenedoresDeDesarrollo.java`:

```java
package academia.contenedores;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** El mismo PostgreSQL como bean, para arrancar la app en desarrollo sin instalar nada. */
@TestConfiguration(proxyBeanMethods = false)
class ContenedoresDeDesarrollo {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
        return new PostgreSQLContainer("postgres:18.7");
    }
}
```

`f033-testcontainers/src/test/java/academia/contenedores/ContenedoresAppDeDesarrollo.java`:

```java
package academia.contenedores;

import org.springframework.boot.SpringApplication;

/** ../gradlew bootTestRun arranca ESTA clase: la app real + un PostgreSQL en Docker. */
public class ContenedoresAppDeDesarrollo {
    public static void main(String[] args) {
        SpringApplication.from(ContenedoresApp::main).with(ContenedoresDeDesarrollo.class).run(args);
    }
}
```

#### Verificación
Test que debe pasar: `../gradlew test` en `f033-testcontainers` → 3 líneas `PASSED` y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)*.

Reto: añade a `ClienteRepositorioTest` un test que registre `"Carla"` y compruebe que `buscarPorNombre("arl")`
devuelve un solo cliente con `visitas() == 1`:

```java
@Test
void unClienteNuevoEmpiezaConUnaVisita() {
    repositorio.registrarVisita("carla@example.com", "Carla");
    assertThat(repositorio.buscarPorNombre("arl"))
            .singleElement()
            .extracting(Cliente::visitas)
            .isEqualTo(1);
}
```

**Pregunta de comprobación:** ¿por qué el campo `postgres` es `static` y qué pasaría si no lo fuera?

<details>
<summary>Respuesta</summary>

Un `@Container` estático se arranca una vez para toda la clase y lo comparten los 3 tests. Si fuera de instancia,
Testcontainers lo arrancaría y destruiría en cada test (más lento) y, peor, el contexto de Spring (que se cachea entre
tests) seguiría apuntando al puerto del primer contenedor, ya destruido. Con `@ServiceConnection` el contenedor debe
ser estático o un `@Bean`.
</details>

</details>

### Contract Testing con Pact y Pact Broker

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar un contrato dirigido por el consumidor entre tienda-web (consumidor) y catalogo (proveedor) con Pact, publicarlo en un Pact Broker y decidir con can-i-deploy si una versión puede desplegarse; lo compruebas cuando el proveedor verifica las 2 interacciones, el broker mu…

#### ► LA IDEA EN UNA FRASE
**Implementar un contrato dirigido por el consumidor entre tienda-web (consumidor) y catalogo (proveedor) con Pact, publicarlo en un Pact Broker y decidir con can-i-deploy si una versión puede desplegarse; lo compruebas cuando el proveedor verifica las 2 interacciones, el broker muestra la verificación en verde y, al renombrar el campo precio en el proveedor, la verificación falla con Actual map is missing the following keys: precio.**

#### ► POR QUÉ EXISTE ESTO
Dos servicios se hablan por HTTP: la tienda le pide al catálogo «dame el producto 1» y espera {"id":1,"nombre":"Teclado","precio":100}. Si un día el equipo del catálogo renombra precio a valor, la tienda se rompe en producción, aunque los tests de cada equipo estén verdes.

#### ► LA ANALOGÍA
Piensa en contract testing con pact y pact broker como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph CONS["tienda-web (consumidor)"]
      CT["ProductoClientePactTest"] --> MS["Servidor simulado de Pact"]
      CT --> PF["build/pacts/<br/>tienda-web-catalogo.json"]
    end
    subgraph BRK["Pact Broker :9292"]
      P["contrato tienda-web 1.0.0"]
      V["resultado de verificación<br/>catalogo 1.0.0"]
    end
    subgraph PROV["catalogo (proveedor)"]
      PT["ContratoDesdeBrokerManual<br/>@State + HttpTestTarget"] --> APP["catalogo real<br/>(puerto aleatorio)"]
    end
    PF -- "pactPublish" --> P
    P -- "descarga" --> PT
    PT -- "publishResults=true" --> V
    V -- "canIDeploy" --> D{"¿desplegar<br/>tienda-web 1.0.0?"}
```

1. Dos servicios se hablan por HTTP: la tienda le pide al catálogo «dame el producto 1» y espera {"id":1,"nombre":"Teclado","precio":100}.
2. Si un día el equipo del catálogo renombra precio a valor, la tienda se rompe en producción, aunque los tests de cada equipo estén verdes.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Contract Testing con Pact y Pact Broker se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Contract Testing con Pact y Pact Broker | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El contrato «foto de la respuesta». El consumidor copia la respuesta completa del proveedor con valores exactos:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: contract testing con pact y pact broker funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Dos servicios se hablan por HTTP: la tienda le pide al catálogo «dame el producto 1» y espera {"id":1,"nombre":"Teclado","precio":100}.
- Si un día el equipo del catálogo renombra precio a valor, la tienda se rompe en producción, aunque los tests de cada equipo estén verdes.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve contract testing con pact y pact broker en tu contexto?
2. ¿Cómo sabrías que contract testing con pact y pact broker no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar contract testing con pact y pact broker?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Genera el contrato en el consumidor y míralo:

```bash
./gradlew :f034-pact-consumidor:test
python3 -m json.tool f034-pact-consumidor/build/pacts/tienda-web-catalogo.json | head -20
```

   **Output esperado:** 2 líneas `PASSED` (una por test) y un JSON que empieza con
   `"consumer": {"name": "tienda-web"}`, contiene `"interactions"` con las descripciones `obtener el producto 1` y
   `obtener un producto inexistente`, sus `providerStates` y, en `metadata`, `"pactSpecification": {"version": "4.0"}`.

2. Verifica el contrato en el proveedor sin broker (lee la carpeta del consumidor; Gradle ejecuta antes el test del
   consumidor porque el `build.gradle.kts` del proveedor lo declara con `dependsOn`):

```bash
./gradlew :f034-pact-proveedor:test
```

   **Output esperado** (reportero de consola de Pact y final de Gradle). El ciclo con broker **sí se ejecutó** en el Mac
   del dueño el 2026-11-21 y dejó estas líneas literales: `Publishing 'tienda-web-catalogo.json'... OK`,
   `All required verification results are published and successful` y, en `canIDeploy`, `Computer says yes \o/`.
   El bloque por interacción que sigue no se capturó (la verificación automatizada corre Gradle en modo silencioso), así que trátalo
   como formato esperado, no como copia de una terminal:

```text
Verifying a pact between tienda-web and catalogo
  [Using …]   <- origen del contrato: la carpeta de @PactFolder
  Given existe el producto 1
  obtener el producto 1
    returns a response which
      has status code 200 (OK)
      has a matching body (OK)
…
BUILD SUCCESSFUL in …s
```

3. Levanta el broker, publica, verifica desde el broker y pregunta si puedes desplegar:

```bash
docker compose up -d --wait pact-broker
./gradlew :f034-pact-consumidor:pactPublish
./gradlew :f034-pact-proveedor:test --tests ContratoDesdeBrokerManual -Pbroker -Ppact.verifier.publishResults=true
./gradlew :f034-pact-consumidor:canIDeploy -Ppacticipant=tienda-web -PpacticipantVersion=1.0.0
```

   **Output esperado:** `pactPublish` informa la publicación de `tienda-web-catalogo.json` en
   `http://localhost:9292`; la verificación vuelve a pasar (2 líneas `PASSED`); y `canIDeploy` imprime una
   línea que empieza por `Computer says yes \o/` seguida del motivo que devuelve el broker.

   **Captura comentada:** abre `http://localhost:9292`. La tabla muestra una fila *tienda-web → catalogo* con la
   versión 1.0.0 del consumidor, la 1.0.0 del proveedor y la celda «Last verified» en verde. Haz clic en el
   contrato: el broker lo dibuja como documentación legible («Given existe el producto 1, upon receiving obtener el
   producto 1…»).

4. **Rompe el contrato** desde el proveedor: en `f034-pact-proveedor`, renombra el componente `precio` del record
   `Producto` a `valor` y repite el paso 2. **Output esperado:** `has a matching body (FAILED)` y, en el detalle,
   `Actual map is missing the following keys: precio`. El build del proveedor se pone rojo **antes** de desplegar.
   Restaura el nombre y `docker compose down`.

#### Código de referencia / ejecutable
Versiones: **JDK 25**, **Spring Boot 4.1.3**, **Pact JVM 4.7.7** (`au.com.dius.pact.consumer:junit5`,
`au.com.dius.pact.provider:junit5` y el plugin de Gradle `au.com.dius.pact`), **Pact Broker 2.124.0** en
Docker. El artefacto de Pact se llama `junit5` pero corre sobre la plataforma JUnit 6 de Boot 4.1 (misma API
Jupiter de extensiones). Código completo en `f034-pact-*`.

**Consumidor:**

`f034-pact-consumidor/build.gradle.kts`:

```kotlin
// F034 · Contract Testing con Pact (lado CONSUMIDOR "tienda-web"). Pact JVM 4.7.7, Spring Boot 4.1.3, JDK 25.
// ../gradlew test          -> genera build/pacts/tienda-web-catalogo.json
// ../gradlew pactPublish   -> lo sube al Pact Broker de docker-compose.yml (http://localhost:9292)
plugins {
    java
    // Plugin de Pact: tareas pactPublish y canIDeploy contra el broker
    alias(libs.plugins.pact)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // BOM de Spring Boot como plataforma de Gradle: fija las versiones sin aplicar el plugin de Boot
    implementation(platform(libs.spring.boot.dependencies))
    // RestClient (spring-web 7) + Jackson 3 para el cliente HTTP
    implementation(libs.spring.boot.starter.webmvc)
    testImplementation(libs.spring.boot.starter.test)
    // Pact para JUnit Jupiter: servidor simulado + escritura del contrato
    testImplementation(libs.pact.consumer.junit5)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
    options.compilerArgs.add("-parameters")   // el plugin de Boot lo añade solo; aquí no está aplicado
}

tasks.withType<Test> {
    useJUnitPlatform()
    // Carpeta donde Pact escribe el contrato (el proveedor lo lee de aquí con @PactFolder)
    systemProperty("pact.rootDir", layout.buildDirectory.dir("pacts").get().asFile.path)
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}

pact {
    broker {
        // se puede cambiar desde la línea de comandos con -PpactBrokerUrl=...
        pactBrokerUrl = providers.gradleProperty("pactBrokerUrl").getOrElse("http://localhost:9292")
    }
    publish {
        // build/pacts es también el valor por defecto del plugin; la versión publicada es la del proyecto (1.0.0)
        pactDirectory = layout.buildDirectory.dir("pacts").get().asFile.path
    }
}
```

`f034-pact-consumidor/src/main/java/academia/consumidor/Producto.java`:

```java
package academia.consumidor;

/** Lo ÚNICO que la tienda necesita del catálogo. Lo que no está aquí, el contrato no lo exige. */
public record Producto(long id, String nombre, int precio) {
}
```

`f034-pact-consumidor/src/main/java/academia/consumidor/ProductoCliente.java`:

```java
package academia.consumidor;

import org.springframework.web.client.RestClient;

/** Cliente HTTP de la tienda hacia el servicio "catalogo". */
public class ProductoCliente {

    private final RestClient http;

    public ProductoCliente(String urlBase) {
        this.http = RestClient.create(urlBase);
    }

    /** GET /productos/{id}. Un 404 se convierte en HttpClientErrorException.NotFound. */
    public Producto obtener(long id) {
        return http.get().uri("/productos/{id}", id).retrieve().body(Producto.class);
    }
}
```

`f034-pact-consumidor/src/test/java/academia/consumidor/ProductoClientePactTest.java`:

```java
package academia.consumidor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactDslJsonBody;
import au.com.dius.pact.consumer.dsl.PactDslWithProvider;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.PactSpecVersion;
import au.com.dius.pact.core.model.V4Pact;
import au.com.dius.pact.core.model.annotations.Pact;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.web.client.HttpClientErrorException;

/**
 * Test del CONSUMIDOR: Pact levanta un servidor HTTP simulado que responde según las interacciones
 * declaradas; si el cliente las usa bien, Pact escribe el contrato en build/pacts/tienda-web-catalogo.json.
 */
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "catalogo", pactVersion = PactSpecVersion.V4)
public class ProductoClientePactTest {

    @Pact(consumer = "tienda-web")
    public V4Pact productoExiste(PactDslWithProvider builder) {
        return builder
                .given("existe el producto 1")                      // estado que el PROVEEDOR debe preparar
                .uponReceiving("obtener el producto 1")
                    .path("/productos/1")
                    .method("GET")
                .willRespondWith()
                    .status(200)
                    .headers(Map.of("Content-Type", "application/json"))
                    .body(new PactDslJsonBody()
                            .integerType("id", 1)                   // cualquier entero (ejemplo: 1)
                            .stringType("nombre", "Teclado")        // cualquier texto
                            .integerType("precio", 100))
                .toPact(V4Pact.class);
    }

    @Pact(consumer = "tienda-web")
    public V4Pact productoNoExiste(PactDslWithProvider builder) {
        return builder
                .given("no existe el producto 99")
                .uponReceiving("obtener un producto inexistente")
                    .path("/productos/99")
                    .method("GET")
                .willRespondWith()
                    .status(404)
                .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "productoExiste")
    void leeElProducto(MockServer servidor) {
        Producto p = new ProductoCliente(servidor.getUrl()).obtener(1);

        assertThat(p.nombre()).isEqualTo("Teclado");
        assertThat(p.precio()).isEqualTo(100);
    }

    @Test
    @PactTestFor(pactMethod = "productoNoExiste")
    void unProductoInexistenteEsUn404(MockServer servidor) {
        assertThatThrownBy(() -> new ProductoCliente(servidor.getUrl()).obtener(99))
                .isInstanceOf(HttpClientErrorException.NotFound.class);
    }
}
```

**Proveedor:**

`f034-pact-proveedor/build.gradle.kts`:

```kotlin
// F034 · Contract Testing con Pact (lado PROVEEDOR "catalogo"). Pact JVM 4.7.7, Spring Boot 4.1.3, JDK 25.
// ../gradlew test   -> verifica el contrato que dejó ../f034-pact-consumidor/build/pacts (sin broker)
// ../gradlew test --tests ContratoDesdeBrokerManual -Pbroker -Ppact.verifier.publishResults=true
//                   -> lo descarga del Pact Broker (localhost:9292) y publica el resultado
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    implementation(libs.spring.boot.starter.webmvc)
    testImplementation(libs.spring.boot.starter.test)
    // Verificador de Pact para JUnit Jupiter (@Provider, @State, @PactFolder, @PactBroker)
    testImplementation(libs.pact.provider.junit5)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    // El contrato lo genera el test del consumidor: tiene que ejecutarse antes
    dependsOn(":f034-pact-consumidor:test")
    // Pact lee estas propiedades de la JVM de los TESTS: Gradle no les pasa solo lo que escribes en la línea de
    // comandos. Se pueden cambiar con -Ppactbroker.host=..., -Ppactbroker.port=... y -Ppact.verifier.publishResults=true
    systemProperty("pactbroker.host", providers.gradleProperty("pactbroker.host").getOrElse("localhost"))
    systemProperty("pactbroker.port", providers.gradleProperty("pactbroker.port").getOrElse("9292"))
    systemProperty("pact.verifier.publishResults", providers.gradleProperty("pact.verifier.publishResults").getOrElse("false"))
    systemProperty("pact.provider.version", version.toString())
    // Gradle ejecuta todas las clases con tests (Surefire, en Maven, solo las *Test). ContratoDesdeBrokerManual
    // necesita el broker encendido: queda fuera salvo que la pidas con -Pbroker
    if (!providers.gradleProperty("broker").isPresent) {
        exclude("**/*Manual.class")
    }
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

`f034-pact-proveedor/src/main/java/academia/proveedor/CatalogoApp.java`:

```java
package academia.proveedor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F034 · Servicio "catalogo": el PROVEEDOR del contrato. */
@SpringBootApplication
public class CatalogoApp {
    public static void main(String[] args) {
        SpringApplication.run(CatalogoApp.class, args);
    }
}
```

`f034-pact-proveedor/src/main/java/academia/proveedor/Producto.java`:

```java
package academia.proveedor;

/** El proveedor puede tener MÁS campos que los que pide el consumidor (stock): eso no rompe el contrato. */
public record Producto(long id, String nombre, int precio, int stock) {
}
```

`f034-pact-proveedor/src/main/java/academia/proveedor/Productos.java`:

```java
package academia.proveedor;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class Productos {

    private final Map<Long, Producto> filas = new ConcurrentHashMap<>();

    public Optional<Producto> buscar(long id) {
        return Optional.ofNullable(filas.get(id));
    }

    public void guardar(Producto p) {
        filas.put(p.id(), p);
    }

    public void borrar(long id) {
        filas.remove(id);
    }
}
```

`f034-pact-proveedor/src/main/java/academia/proveedor/ProductoController.java`:

```java
package academia.proveedor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductoController {

    private final Productos productos;

    ProductoController(Productos productos) {
        this.productos = productos;
    }

    @GetMapping("/productos/{id}")
    ResponseEntity<Producto> obtener(@PathVariable long id) {
        return ResponseEntity.of(productos.buscar(id));
    }
}
```

`f034-pact-proveedor/src/test/java/academia/proveedor/ContratoDesdeCarpetaTest.java`:

```java
package academia.proveedor;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * Test del PROVEEDOR: arranca el catálogo de verdad (puerto aleatorio) y reproduce cada interacción
 * del contrato contra él. Un @TestTemplate = un test por interacción.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Provider("catalogo")
@PactFolder("../f034-pact-consumidor/build/pacts")
class ContratoDesdeCarpetaTest {

    @LocalServerPort int puerto;
    @Autowired Productos productos;

    @BeforeEach
    void apuntarAlServicio(PactVerificationContext contexto) {
        contexto.setTarget(new HttpTestTarget("localhost", puerto, "/"));
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verificaCadaInteraccion(PactVerificationContext contexto) {
        contexto.verifyInteraction();
    }

    /** Los nombres deben ser IDÉNTICOS a los .given(...) del consumidor. */
    @State("existe el producto 1")
    void existeElProducto1() {
        productos.guardar(new Producto(1, "Teclado", 100, 7));
    }

    @State("no existe el producto 99")
    void noExisteElProducto99() {
        productos.borrar(99);
    }
}
```

`f034-pact-proveedor/src/test/java/academia/proveedor/ContratoDesdeBrokerManual.java`:

```java
package academia.proveedor;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactBroker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * Igual que ContratoDesdeCarpetaTest, pero el contrato viene del Pact Broker.
 * El nombre termina en "Manual" a propósito: build.gradle.kts excluye las clases *Manual salvo que añadas -Pbroker
 * (así "./gradlew test" no necesita el broker encendido). Se pide con --tests ContratoDesdeBrokerManual -Pbroker.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Provider("catalogo")
@PactBroker(host = "${pactbroker.host}", port = "${pactbroker.port}")
class ContratoDesdeBrokerManual {

    @LocalServerPort int puerto;
    @Autowired Productos productos;

    @BeforeEach
    void apuntarAlServicio(PactVerificationContext contexto) {
        contexto.setTarget(new HttpTestTarget("localhost", puerto, "/"));
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verificaCadaInteraccion(PactVerificationContext contexto) {
        contexto.verifyInteraction();
    }

    @State("existe el producto 1")
    void existeElProducto1() {
        productos.guardar(new Producto(1, "Teclado", 100, 7));
    }

    @State("no existe el producto 99")
    void noExisteElProducto99() {
        productos.borrar(99);
    }
}
```

**Pact Broker** (fragmento de `docker-compose.yml`):

```yaml
services:
  pact-db:
    image: postgres:18.7
    environment:
      POSTGRES_USER: pact
      POSTGRES_PASSWORD: pact
      POSTGRES_DB: pact
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U pact -d pact"]
      interval: 2s
      timeout: 3s
      retries: 30
  pact-broker:
    image: pactfoundation/pact-broker:3.2.0-pactbroker2.124.0   # Pact Broker 2.124.0
    depends_on:
      pact-db:
        condition: service_healthy
    environment:
      PACT_BROKER_DATABASE_URL: postgres://pact:pact@pact-db/pact
      PACT_BROKER_PORT: "9292"
      PACT_BROKER_LOG_LEVEL: INFO
    ports: ["9292:9292"]
    healthcheck:
      # la imagen trae Ruby: se usa para no depender de curl dentro del contenedor
      test: ["CMD", "ruby", "-rnet/http", "-e", "exit(Net::HTTP.get_response(URI('http://localhost:9292/diagnostic/status/heartbeat')).code == '200' ? 0 : 1)"]
      interval: 3s
      timeout: 5s
      retries: 40
```

</details>

### ArchUnit

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Codificar las reglas de arquitectura de un servicio (capas, dependencias prohibidas, inyección por constructor, convenciones de nombres) como tests de ArchUnit y diagnosticar una violación a partir de su mensaje; lo compruebas cuando las 4 reglas de ArquitecturaTest pasan y, al i…

#### ► LA IDEA EN UNA FRASE
**Codificar las reglas de arquitectura de un servicio (capas, dependencias prohibidas, inyección por constructor, convenciones de nombres) como tests de ArchUnit y diagnosticar una violación a partir de su mensaje; lo compruebas cuando las 4 reglas de ArquitecturaTest pasan y, al inyectar el repositorio en el controller, fallan 2 reglas con Architecture Violation.**

#### ► POR QUÉ EXISTE ESTO
Todo equipo acuerda reglas de orden: «los controllers no hablan con la base de datos», «todo servicio se llama …Servicio». Al principio se respetan; seis meses después alguien, con prisa, se salta una. Nadie lo ve en la revisión y el código se enreda.

#### ► LA ANALOGÍA
Piensa en archunit como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    C["controller<br/>PedidoController"] -->|permitido| S["servicio<br/>PedidoServicio"]
    S -->|permitido| R["repositorio<br/>PedidoRepositorio"]
    C -. "PROHIBIDO<br/>(regla 1 y 2)" .-> R
    S -. "PROHIBIDO<br/>(regla 1)" .-> C
    M["modelo<br/>Pedido"]
    C --> M
    S --> M
    R --> M
```

1. Todo equipo acuerda reglas de orden: «los controllers no hablan con la base de datos», «todo servicio se llama …Servicio».
2. Al principio se respetan; seis meses después alguien, con prisa, se salta una.
3. Nadie lo ve en la revisión y el código se enreda.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| ArchUnit se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar ArchUnit | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El «big ball of mud» dentro del servicio. Sin reglas, el diagrama de dependencias de un servicio de un año se ve como una telaraña: controllers que leen repositorios, repositorios que llaman servicios, el dominio importando clases de Spring MVC, ciclos entre paquetes:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: archunit funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Todo equipo acuerda reglas de orden: «los controllers no hablan con la base de datos», «todo servicio se llama …Servicio».
- Al principio se respetan; seis meses después alguien, con prisa, se salta una.
- Nadie lo ve en la revisión y el código se enreda.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve archunit en tu contexto?
2. ¿Cómo sabrías que archunit no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar archunit?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Ejecuta las reglas:

```bash
../gradlew test
```

   **Output esperado:** 4 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)* (una ejecución por
   cada campo `@ArchTest`).

2. **Sáltate una capa.** En `PedidoController` cambia el constructor para que reciba también el repositorio:

```java
import academia.capas.repositorio.PedidoRepositorio;
// ...
    private final PedidoServicio servicio;
    private final PedidoRepositorio repositorio;          // atajo "temporal"

    public PedidoController(PedidoServicio servicio, PedidoRepositorio repositorio) {
        this.servicio = servicio;
        this.repositorio = repositorio;
    }
```

   y ejecuta `../gradlew test`.

   **Output esperado:** 2 líneas `FAILED` y `4 tests completed, 2 failed`. Fallan `capas` y `controllersSinRepositorios`. El mensaje de la
   segunda empieza así (formato de `FailureDisplayFormatFactory` en ArchUnit):

```text
java.lang.AssertionError: Architecture Violation [Priority: MEDIUM] - Rule 'no classes that reside in a package
'..controller..' should depend on classes that reside in a package '..repositorio..'' was violated (… times):
```

   seguido de una línea por cada dependencia encontrada: el campo `repositorio` de tipo `PedidoRepositorio` y el
   parámetro del constructor, cada una con `in (PedidoController.java:…)`.

   **Captura comentada:** la primera línea repite la regla **en lenguaje natural** (por eso conviene escribirlas
   claras); el número entre paréntesis dice cuántas violaciones hay; las líneas siguientes son el mapa exacto del
   «túnel». Deshaz el cambio.

3. **Inyección por campo.** En `PedidoServicio`, reemplaza el constructor por un campo
   `@org.springframework.beans.factory.annotation.Autowired private PedidoRepositorio repositorio;` (quita `final`).
   **Output esperado:** falla `sinInyeccionPorCampo`; el mensaje nombra la regla `no classes should use field
   injection, because field injection is considered harmful; use constructor injection or setter injection instead;
   see https://stackoverflow.com/q/39890849 for detailed explanations` (texto de `GeneralCodingRules`). Deshazlo.

#### Código de referencia / ejecutable
Versiones: **JDK 25**, **Spring Boot 4.1.3**, **ArchUnit 1.5.1** (`com.tngtech.archunit:archunit-junit6`, no lo
gestiona Boot), **JUnit Platform 6.0.3**. `f035-archunit/build.gradle.kts`:

```kotlin
// F035 · ArchUnit 1.5.1 (motor para JUnit 6: archunit-junit6), Spring Boot 4.1.3, JDK 25
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    implementation(libs.spring.boot.starter.webmvc)
    testImplementation(libs.spring.boot.starter.test)
    // ArchUnit no lo gestiona Boot: versión fija. archunit-junit6 existe desde ArchUnit 1.5.0
    testImplementation(libs.archunit.junit6)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

Código de producción (`src/main/java/academia/capas/`):

`f035-archunit/src/main/java/academia/capas/CapasApp.java`:

```java
package academia.capas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** F035 · Servicio de pedidos en capas: controller -> servicio -> repositorio. ArchUnit vigila que siga así. */
@SpringBootApplication
public class CapasApp {
    public static void main(String[] args) {
        SpringApplication.run(CapasApp.class, args);
    }
}
```

`f035-archunit/src/main/java/academia/capas/modelo/Pedido.java`:

```java
package academia.capas.modelo;

public record Pedido(long id, String cliente, int total) {
}
```

`f035-archunit/src/main/java/academia/capas/repositorio/PedidoRepositorio.java`:

```java
package academia.capas.repositorio;

import java.util.Optional;

import academia.capas.modelo.Pedido;

public interface PedidoRepositorio {
    Optional<Pedido> buscar(long id);
}
```

`f035-archunit/src/main/java/academia/capas/repositorio/PedidoRepositorioEnMemoria.java`:

```java
package academia.capas.repositorio;

import java.util.Map;
import java.util.Optional;

import academia.capas.modelo.Pedido;
import org.springframework.stereotype.Repository;

@Repository
class PedidoRepositorioEnMemoria implements PedidoRepositorio {

    private final Map<Long, Pedido> filas = Map.of(1L, new Pedido(1, "Ana", 900));

    @Override
    public Optional<Pedido> buscar(long id) {
        return Optional.ofNullable(filas.get(id));
    }
}
```

`f035-archunit/src/main/java/academia/capas/servicio/PedidoServicio.java`:

```java
package academia.capas.servicio;

import academia.capas.modelo.Pedido;
import academia.capas.repositorio.PedidoRepositorio;
import org.springframework.stereotype.Service;

@Service
public class PedidoServicio {

    private final PedidoRepositorio repositorio;   // inyección por constructor: la regla de ArchUnit lo exige

    public PedidoServicio(PedidoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    public Pedido obtener(long id) {
        return repositorio.buscar(id).orElseThrow();
    }
}
```

`f035-archunit/src/main/java/academia/capas/controller/PedidoController.java`:

```java
package academia.capas.controller;

import academia.capas.modelo.Pedido;
import academia.capas.servicio.PedidoServicio;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PedidoController {

    private final PedidoServicio servicio;

    public PedidoController(PedidoServicio servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/pedidos/{id}")
    public Pedido obtener(@PathVariable long id) {
        return servicio.obtener(id);
    }
}
```

Las reglas (`src/test/java/academia/capas/ArquitecturaTest.java`):

`f035-archunit/src/test/java/academia/capas/ArquitecturaTest.java`:

```java
package academia.capas;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.library.GeneralCodingRules.NO_CLASSES_SHOULD_USE_FIELD_INJECTION;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import org.springframework.stereotype.Service;

/**
 * Las reglas de arquitectura como TESTS: ArchUnit lee el bytecode compilado de academia.capas
 * y falla el build si alguien se salta una capa. Cada @ArchTest es un test.
 */
@AnalyzeClasses(packages = "academia.capas", importOptions = ImportOption.DoNotIncludeTests.class)
class ArquitecturaTest {

    @ArchTest
    static final ArchRule capas = layeredArchitecture().consideringOnlyDependenciesInLayers()
            .layer("Controller").definedBy("..controller..")
            .layer("Servicio").definedBy("..servicio..")
            .layer("Repositorio").definedBy("..repositorio..")
            .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
            .whereLayer("Servicio").mayOnlyBeAccessedByLayers("Controller")
            .whereLayer("Repositorio").mayOnlyBeAccessedByLayers("Servicio");

    @ArchTest
    static final ArchRule controllersSinRepositorios = noClasses()
            .that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAPackage("..repositorio..");

    @ArchTest
    static final ArchRule sinInyeccionPorCampo = NO_CLASSES_SHOULD_USE_FIELD_INJECTION;

    @ArchTest
    static final ArchRule serviciosTerminanEnServicio = classes()
            .that().areAnnotatedWith(Service.class)
            .should().haveSimpleNameEndingWith("Servicio");
}
```

</details>

### SonarQube

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Configurar el análisis de un proyecto Gradle en SonarQube con cobertura de JaCoCo y un Quality Gate que bloquee el build, e interpretar sus métricas (cobertura, bugs, vulnerabilidades, code smells, hotspots); lo compruebas cuando sonar/analizar.sh imprime Quality Gate: OK, una co…

#### ► LA IDEA EN UNA FRASE
**Configurar el análisis de un proyecto Gradle en SonarQube con cobertura de JaCoCo y un Quality Gate que bloquee el build, e interpretar sus métricas (cobertura, bugs, vulnerabilidades, code smells, hotspots); lo compruebas cuando sonar/analizar.sh imprime Quality Gate: OK, una cobertura mayor que 0 y RESULTADO SONAR: OK.**

#### ► POR QUÉ EXISTE ESTO
Los tests te dicen si el programa hace lo que debe. SonarQube mira otra cosa: cómo está escrito. Lee tu código y busca errores probables (dividir entre cero, recursos sin cerrar), agujeros de seguridad (una contraseña escrita en el código), código difícil de mantener (métodos gigantes, duplicados) y cuántas líneas tocaron tus tests (la cobertura, que mide JaCoCo).

#### ► LA ANALOGÍA
Piensa en sonarqube como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant Dev as Tú / CI
    participant MVN as Gradle (./gradlew check sonar)
    participant JC as JaCoCo
    participant SQ as SonarQube :9000
    Dev->>MVN: check + sonar con -Dsonar.token
    MVN->>JC: plugin jacoco: instrumenta los tests
    JC-->>MVN: build/reports/jacoco/test/jacocoTestReport.xml
    MVN->>SQ: descarga el motor y las reglas del servidor
    MVN->>MVN: analiza el código fuente y el bytecode
    MVN->>SQ: sube el informe (fuentes, problemas, cobertura)
    SQ->>SQ: Compute Engine procesa y evalúa el Quality Gate
    MVN->>SQ: sonar.qualitygate.wait=true: ¿estado?
    SQ-->>MVN: OK o ERROR
    MVN-->>Dev: BUILD SUCCESSFUL o BUILD FAILED
```

1. Los tests te dicen si el programa hace lo que debe.
2. SonarQube mira otra cosa: cómo está escrito.
3. Lee tu código y busca errores probables (dividir entre cero, recursos sin cerrar), agujeros de seguridad (una contraseña escrita en el código), código difícil de mantener (métodos gigantes, duplicados) y cuántas líneas tocaron tus tests (la cobertura, que mide JaCoCo).

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| SonarQube se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar SonarQube | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Gaming de métricas: tests que ejecutan sin comprobar.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sonarqube funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Los tests te dicen si el programa hace lo que debe.
- SonarQube mira otra cosa: cómo está escrito.
- Lee tu código y busca errores probables (dividir entre cero, recursos sin cerrar), agujeros de seguridad (una contraseña escrita en el código), código difícil de mantener (métodos gigantes, duplicados) y cuántas líneas tocaron tus tests (la cobertura, que mide JaCoCo).

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sonarqube en tu contexto?
2. ¿Cómo sabrías que sonarqube no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sonarqube?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
Versiones: **JDK 25**, **Spring Boot 4.1.3**, **JaCoCo 0.8.15** (soporta oficialmente Java 26 y, de forma
experimental, clases de Java 27), **SonarScanner for Gradle 7.5.0.8588**, **SonarQube Community Build
26.11.0.134175** (imagen `sonarqube:26.11.0.134175-community`). Proyecto en
`f036-sonarqube`.

`f036-sonarqube/build.gradle.kts`:

```kotlin
// F036 · SonarQube Community Build 26.11 + JaCoCo 0.8.15 + SonarScanner for Gradle 7.5.0.8588 (Spring Boot 4.1.3, JDK 25)
// ../gradlew check                   -> tests + informe de cobertura build/reports/jacoco/test/jacocoTestReport.xml
// ./sonar/analizar.sh                -> crea un token en el SonarQube de docker-compose.yml, analiza y comprueba el Quality Gate
plugins {
    java
    // JaCoCo viene con Gradle: agente durante los tests + informe XML que SonarQube importa
    jacoco
    // Versión fija del escáner (SonarScanner for Gradle): añade la tarea sonar
    alias(libs.plugins.sonarqube)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // BOM de Spring Boot como plataforma de Gradle: fija las versiones sin aplicar el plugin de Boot
    implementation(platform(libs.spring.boot.dependencies))
    implementation(libs.spring.boot.starter)
    testImplementation(libs.spring.boot.starter.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
    options.compilerArgs.add("-parameters")   // el plugin de Boot lo añade solo; aquí no está aplicado
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    finalizedBy(tasks.jacocoTestReport)   // cada ejecución de los tests deja el informe de cobertura
}

jacoco {
    toolVersion = libs.versions.jacoco.get()
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required = true   // build/reports/jacoco/test/jacocoTestReport.xml: el que lee SonarQube
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestReport)   // "check" = tests + informe (en Maven, "verify")
}

// Lo que lee el escáner (se puede sobrescribir con -Dsonar.xxx=... en la línea de comandos)
sonar {
    properties {
        property("sonar.host.url", "http://localhost:9000")
        property("sonar.projectKey", "f036-sonarqube")
        property("sonar.coverage.jacoco.xmlReportPaths",
            layout.buildDirectory.file("reports/jacoco/test/jacocoTestReport.xml").get().asFile.path)
        // El build espera la decisión del Quality Gate y FALLA si no pasa
        property("sonar.qualitygate.wait", "true")
    }
}
```

Código y test:

`f036-sonarqube/src/main/java/academia/calidad/CalculadoraEnvio.java`:

```java
package academia.calidad;

/**
 * Regla de negocio pequeña para que SonarQube mida cobertura y busque problemas.
 * Costo: 5 + 2 por kg; express duplica; desde 20 kg el envío normal es gratis.
 */
public final class CalculadoraEnvio {

    private CalculadoraEnvio() {
    }

    public static int costo(int pesoKg, boolean express) {
        if (pesoKg <= 0) {
            throw new IllegalArgumentException("El peso debe ser positivo");
        }
        if (!express && pesoKg >= 20) {
            return 0;
        }
        int base = 5 + 2 * pesoKg;
        return express ? base * 2 : base;
    }
}
```

`f036-sonarqube/src/test/java/academia/calidad/CalculadoraEnvioTest.java`:

```java
package academia.calidad;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.Test;

class CalculadoraEnvioTest {

    @ParameterizedTest(name = "{0} kg, express={1} -> {2}")
    @CsvSource({"1, false, 7", "1, true, 14", "19, false, 43", "20, false, 0", "20, true, 90"})
    void calculaElCosto(int peso, boolean express, int esperado) {
        assertThat(CalculadoraEnvio.costo(peso, express)).isEqualTo(esperado);
    }

    @Test
    void pesoCeroEsInvalido() {
        assertThatThrownBy(() -> CalculadoraEnvio.costo(0, false)).isInstanceOf(IllegalArgumentException.class);
    }
}
```

SonarQube en Docker Compose (fragmento de `docker-compose.yml`):

```yaml
services:
  sonarqube:
    image: sonarqube:26.11.0.134175-community
    environment:
      # desactiva las comprobaciones de arranque de Elasticsearch (vm.max_map_count): solo para laboratorio
      SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: "true"
    ports: ["9000:9000"]
```

Script que prepara el servidor, analiza y comprueba el resultado (`f036-sonarqube/sonar/analizar.sh`):

`f036-sonarqube/sonar/analizar.sh`:

```bash
#!/usr/bin/env bash
# F036 · Analiza f036-sonarqube con el SonarQube de ../docker-compose.yml y comprueba el resultado.
# Requisitos: curl, python3, JDK 25. Idempotente: si la clave de admin ya cambió, la reutiliza.
set -euo pipefail
cd "$(dirname "$0")/.."
URL="${SONAR_URL:-http://localhost:9000}"
CLAVE_NUEVA="Laboratorio-2026!"

echo "1/5 Esperando a que SonarQube responda status=UP..."
for _ in $(seq 1 90); do
  estado=$(curl -s "$URL/api/system/status" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("status",""))' 2>/dev/null || true)
  [ "$estado" = "UP" ] && break
  sleep 2
done
[ "$estado" = "UP" ] || { echo "SonarQube no llegó a UP (estado: '$estado'). Mira: docker compose logs sonarqube"; exit 1; }

echo "2/5 Cambiando la clave inicial admin/admin (obligatorio en el primer uso)..."
curl -s -o /dev/null -u admin:admin -X POST "$URL/api/users/change_password" \
  --data-urlencode "login=admin" --data-urlencode "previousPassword=admin" --data-urlencode "password=$CLAVE_NUEVA" || true

echo "3/5 Generando un token de análisis..."
TOKEN=$(curl -s -u "admin:$CLAVE_NUEVA" -X POST "$URL/api/user_tokens/generate" \
  --data-urlencode "name=laboratorio-$(date +%s)" | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')

echo "4/5 Tests + cobertura + análisis (el build espera al Quality Gate)..."
../gradlew -q check sonar -Dsonar.token="$TOKEN" -Dsonar.host.url="$URL"

echo "5/5 Comprobando por API..."
curl -s -u "$TOKEN:" "$URL/api/qualitygates/project_status?projectKey=f036-sonarqube" | python3 -c '
import sys, json
estado = json.load(sys.stdin)["projectStatus"]["status"]
print("Quality Gate:", estado)
sys.exit(0 if estado == "OK" else 1)'
curl -s -u "$TOKEN:" "$URL/api/measures/component?component=f036-sonarqube&metricKeys=coverage,bugs,vulnerabilities,code_smells" | python3 -c '
import sys, json
medidas = {m["metric"]: m["value"] for m in json.load(sys.stdin)["component"]["measures"]}
print("Medidas:", ", ".join(f"{k}={medidas[k]}" for k in sorted(medidas)))
assert float(medidas["coverage"]) > 0, "SonarQube no importó la cobertura de JaCoCo"'
echo "RESULTADO SONAR: OK"
```

</details>
