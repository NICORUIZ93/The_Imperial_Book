# Módulo 8: Build tools — Maven y Gradle


## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-8-build-tools.html"
    alt="Maven y Gradle construyen el mismo proyecto multi-módulo con fases/tareas y salida de negocio idéntica"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Maven y Gradle son dos modelos de build; el comportamiento de negocio debe permanecer igual.</figcaption>
</figure>


Tienda Aurora ya tiene código, pero el código no vive solo en un IDE. Necesita compilarse en CI, declarar dependencias, ejecutar tests, empaquetar artefactos y hacerlo igual en la máquina de cualquier persona del equipo. Eso es el trabajo de un build tool. Maven y Gradle resuelven el mismo problema con filosofías distintas: Maven favorece convención y configuración declarativa en XML; Gradle favorece un modelo programable con DSL Kotlin/Groovy y mejor incrementalidad.

En este módulo vas a ver el mismo proyecto en ambas herramientas: un multi-módulo pequeño con `core` y `api`. `core` contiene el dominio y serializa JSON con Jackson; `api` depende de `core` y expone un `main`. La meta no es memorizar XML o Kotlin, sino entender qué problema resuelve cada archivo del build.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, Maven 3.10.0, macOS arm64. Ambos builds se ejecutaron en `/tmp/aurora-m8-gradle` y `/tmp/aurora-m8-maven`. Las salidas mostradas son reales.

## Proyecto desde cero: tienda-aurora-build-tools

La estructura lógica es la misma en Maven y Gradle:

```text
tienda-aurora-build-tools/
├── core/   # dominio, Jackson, tests
└── api/    # aplicación, depende de core
```

## Prerrequisitos

```bash
java -version
gradle --version
mvn -v
```

## Bootstrap

```bash
mkdir -p tienda-aurora-build/core/src/main/java/com/aurora/build/core
mkdir -p tienda-aurora-build/core/src/test/java/com/aurora/build/core
mkdir -p tienda-aurora-build/api/src/main/java/com/aurora/build/api
cd tienda-aurora-build
gradle wrapper --gradle-version 9.9.1
```

## Estructura Gradle

```text
tienda-aurora-build-tools/
├── build.gradle.kts
├── settings.gradle.kts
├── core/
│   ├── build.gradle.kts
│   └── src/
└── api/
    ├── build.gradle.kts
    └── src/
```

## Estructura Maven

```text
tienda-aurora-build-tools/
├── pom.xml
├── core/
│   ├── pom.xml
│   └── src/
└── api/
    ├── pom.xml
    └── src/
```

## Código completo

#### Código compartido

El código Java es el mismo en ambos builds. La diferencia está en cómo se declara y ejecuta.

`Producto` es un record de dominio. Es el dato que el catálogo expone y serializa.

**Archivo:** `core/src/main/java/com/aurora/build/core/Producto.java`

```java
package com.aurora.build.core;
import java.math.BigDecimal;
public record Producto(String sku, String nombre, BigDecimal precio) {}
```

`Catalogo` crea productos y los serializa con Jackson. Convierte `JsonProcessingException` en `IllegalStateException` para que la API pública del módulo no obligue a la app a conocer el detalle checked de Jackson.

**Archivo:** `core/src/main/java/com/aurora/build/core/Catalogo.java`

```java
package com.aurora.build.core;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
public final class Catalogo {
    private final ObjectMapper mapper = new ObjectMapper();
    public List<Producto> productos() {
        return List.of(
                new Producto("CAF-100", "Cafe Aurora", new BigDecimal("14.90")),
                new Producto("MOL-200", "Molino Manual", new BigDecimal("79.90"))
        );
    }
    public String comoJson() {
        try {
            return mapper.writeValueAsString(productos());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("No se pudo serializar catálogo", e);
        }
    }
}
```

Test JUnit Jupiter del módulo `core`. Verifica el comportamiento de dominio sin pasar por la app.

**Archivo:** `core/src/test/java/com/aurora/build/core/CatalogoTest.java`

```java
package com.aurora.build.core;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class CatalogoTest {
    @Test void contieneProductos() {
        assertEquals(2, new Catalogo().productos().size());
    }
}
```

La app consume `core`. Este es el punto donde se ve la dependencia entre módulos: `api` compila porque depende de `core`.

**Archivo:** `api/src/main/java/com/aurora/build/api/TiendaAuroraApiApp.java`

```java
package com.aurora.build.api;
import com.aurora.build.core.Catalogo;
public final class TiendaAuroraApiApp {
    public static void main(String[] args) {
        Catalogo catalogo = new Catalogo();
        System.out.println("productos=" + catalogo.productos().size());
        System.out.println(catalogo.comoJson());
    }
}
```

#### Build Gradle (Kotlin DSL)

Declara el nombre del build y los módulos incluidos. Gradle necesita saber qué subproyectos forman el build.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-build-tools"
include("core", "api")
```

Configura propiedades comunes: grupo, versión, repositorios, toolchain Java 25, compilación estricta y JUnit Platform. `subprojects` evita repetir la configuración en cada módulo.

**Archivo:** `build.gradle.kts`

```kotlin
plugins {
    base
}

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
        options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
    }
    tasks.withType<Test>().configureEach { useJUnitPlatform() }
}
```

`core` usa Jackson como dependencia de implementación y JUnit como dependencia de test. El scope de Gradle `implementation` significa que es necesaria para compilar y ejecutar el módulo; `testImplementation` solo existe en el classpath de pruebas.

**Archivo:** `core/build.gradle.kts`

```kotlin
dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.19.0")
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
```

`api` aplica el plugin `application`, depende de `project(":core")` y declara la clase main. La dependencia entre módulos es explícita.

**Archivo:** `api/build.gradle.kts`

```kotlin
plugins { application }
dependencies { implementation(project(":core")) }
application { mainClass = "com.aurora.build.api.TiendaAuroraApiApp" }
```

#### Build Maven (POM XML)

POM padre. Declara packaging `pom`, módulos, propiedades comunes, `dependencyManagement` para el BOM de JUnit y configuración de plugins. En Maven, el padre es el lugar natural para centralizar versiones.

**Archivo:** `pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.aurora</groupId>
  <artifactId>tienda-aurora-build-tools</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>
  <modules>
    <module>core</module>
    <module>api</module>
  </modules>
  <properties>
    <maven.compiler.release>25</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>5.13.4</junit.version>
    <jackson.version>2.19.0</jackson.version>
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
  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-surefire-plugin</artifactId>
          <version>3.5.2</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

POM de `core`. Hereda del padre, declara Jackson y JUnit. JUnit tiene `<scope>test</scope>`: participa en compilación/ejecución de tests, pero no debe ser dependencia runtime del artefacto principal.

**Archivo:** `core/pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.aurora</groupId>
    <artifactId>tienda-aurora-build-tools</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>core</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>${jackson.version}</version>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

POM de `api`. Depende de `core` usando `${project.version}`. Maven resuelve el módulo dentro del reactor multi-módulo.

**Archivo:** `api/pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.aurora</groupId>
    <artifactId>tienda-aurora-build-tools</artifactId>
    <version>1.0.0</version>
  </parent>
  <artifactId>api</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.aurora</groupId>
      <artifactId>core</artifactId>
      <version>${project.version}</version>
    </dependency>
  </dependencies>
</project>
```

## Ejecutar

#### Gradle

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q test
./gradlew -q :api:run
```

```text
productos=2
[{"sku":"CAF-100","nombre":"Cafe Aurora","precio":14.90},{"sku":"MOL-200","nombre":"Molino Manual","precio":79.90}]
```

#### Maven

```bash
mvn -q test
mvn -q -pl api -am -DskipTests package
mvn -q -pl api -am dependency:copy-dependencies -DincludeScope=runtime -DoutputDirectory=target/deps package
java -cp "api/target/classes:api/target/deps/*" com.aurora.build.api.TiendaAuroraApiApp
```

```text
productos=2
[{"sku":"CAF-100","nombre":"Cafe Aurora","precio":14.90},{"sku":"MOL-200","nombre":"Molino Manual","precio":79.90}]
```

**Nota de verificación:** la ejecución Maven se hizo compilando y usando el classpath de runtime con dependencias copiadas. `exec:java` puede funcionar, pero depende de la configuración del plugin; el classpath explícito muestra de forma directa qué artefactos necesita la app.

## Conceptos cubiertos

### Tema 1: pom.xml vs build.gradle.kts · Básico · 40 min

Maven usa `pom.xml`. POM significa Project Object Model: un modelo declarativo del proyecto. Defines coordenadas (`groupId`, `artifactId`, `version`), dependencias, plugins y módulos. Su fortaleza es la convención: si sigues la estructura estándar, Maven sabe dónde está el código, los tests y los recursos. El mecanismo central es la resolución de dependencias desde repositorios y la ejecución de goals ligados a fases del ciclo de vida.

Gradle usa scripts, en este caso `build.gradle.kts` con Kotlin DSL. El build se describe como un grafo de tareas con entradas, salidas y relaciones. Puedes escribir lógica de build cuando la necesitas. Su fortaleza es la flexibilidad y el rendimiento incremental; su riesgo es que un build demasiado “creativo” se vuelva difícil de entender.

**Por qué existen ambos formats:** Maven priorizó estandarización y previsibilidad; Gradle priorizó flexibilidad y ejecución incremental. Ninguno elimina la disciplina de declarar versiones, scopes y fronteras.

**Implicación:** en equipos grandes, `pom.xml` facilita que cualquier persona lea el mismo modelo; `build.gradle.kts` permite automatizaciones sofisticadas, pero requiere revisión como código que es.

**Confusión común:** “Gradle es siempre más moderno y mejor”. La herramienta que el equipo entiende y mantiene con discipline suele ser mejor que una migración impulsada por moda.

Compara la misma dependencia. En Maven:

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>${jackson.version}</version>
</dependency>
```

En Gradle:

```kotlin
dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.19.0")
}
```

Maven es más verboso pero muy explícito. Gradle es compacto. Ninguno es mágicamente mejor; lo importante es que las dependencias estén declaradas, versionadas y entendidas.

### Tema 2: Ciclo de vida de build y scopes · Intermedio · 40 min

Maven tiene ciclos de vida con fases. Las más comunes del ciclo default son `validate`, `compile`, `test`, `package`, `verify`, `install`, `deploy`. Cuando ejecutas `mvn package`, Maven ejecuta las fases anteriores necesarias. Eso da predictibilidad: todos los proyectos Maven entienden el mismo vocabulario.

Gradle tiene tareas. Algunas vienen por plugins (`compileJava`, `test`, `jar`, `build`, `run`) y puedes crear otras. El modelo es más flexible, pero requiere conocer qué tareas aporta cada plugin.

Los scopes/configuraciones de dependencia controlan dónde vive una librería. En Maven, `test` significa que JUnit está disponible para compilar y ejecutar tests, pero no es dependencia de runtime del artefacto final. En Gradle, `testImplementation` y `testRuntimeOnly` expresan la misma idea. Esto importa por tamaño, seguridad y claridad: no quieres empaquetar JUnit en tu servicio de producción.

En el proyecto, `core/build.gradle.kts` declara:

```kotlin
testImplementation(platform("org.junit:junit-bom:5.13.4"))
testImplementation("org.junit.jupiter:junit-jupiter")
testRuntimeOnly("org.junit.platform:junit-platform-launcher")
```

Y en Maven:

```xml
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
```

La herramienta cambia; la intención es la misma: separar qué se necesita para compilar, qué se necesita para ejecutar y qué solo existe para verificar.

**Confusión común:** usar `implementation`/`compile` para JUnit y empaquetarlo en produção. El scope correcto evita que dependencias de test aparezcan en el artefacto final.

### Tema 3: Proyectos multi-módulo · Intermedio · 40 min

Un multi-módulo divide el build en unidades con responsabilidades claras. En este caso, `core` no sabe nada de la app; `api` depende de `core`. Esa dirección es importante: si `core` dependiera de `api`, tendrías un ciclo.

En Gradle, `settings.gradle.kts` incluye los módulos y `api/build.gradle.kts` declara `implementation(project(":core"))`. En Maven, el POM padre lista `<modules>` y `api/pom.xml` declara la dependencia a `com.aurora:core`.

El beneficio práctico es que puedes compilar, testear y reutilizar `core` sin arrastrar la aplicación. También obliga a pensar en contratos entre módulos. Si `Catalogo.comoJson()` expusiera `JsonProcessingException` de Jackson, la app tendría que conocer un detalle de la librería usada por `core`; por eso el código lo traduce a `IllegalStateException`.

**Por qué existe:** los módulos convierten una convención arquitectónica (“el dominio no depende de la app”) en una restricción del build.

**Implicación:** una dependencia circular deja de ser un problema de disciplina y pasa a ser un error de compilación. Los contratos y traducciones de excepciones se vuelven visibles.

**Confusión común:** crear módulos por moda, sin criterio, o compartir todo en un módulo `common` que termina acoplando a todos. Cada módulo debe tener un propósito y una dirección de dependencia justificable.

### Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas · Avanzado · 40 min

Ver la misma app en ambos builds quita el misterio. El código Java es idéntico. Lo que cambia es el archivo que declara la estructura. Gradle lo expresa con menos texto y con un modelo de tareas; Maven lo expresa con XML y un ciclo de vida estándar.

La salida verificada de ambos builds fue la misma:

```text
productos=2
[{"sku":"CAF-100","nombre":"Cafe Aurora","precio":14.90},{"sku":"MOL-200","nombre":"Molino Manual","precio":79.90}]
```

Eso es lo que debería pasar. El build tool no debe cambiar el comportamiento de negocio; debe hacerlo reproducible. Cuando elijas entre Maven y Gradle, la pregunta no es cuál es “más pro”. La pregunta es qué necesita tu equipo: convención estricta y ecosistema XML predecible, o flexibilidad y rendimiento con una DSL programable. En muchos equipos existentes, la mejor herramienta es la que ya entienden y pueden mantener con disciplina.

**Por qué importa ver ambos:** ver el mismo código en dos herramientas revela qué partes son del dominio y qué partes son del build. Si cambiar el build cambia la salida, hay una dependencia accidental del entorno.

**Implicación:** la elección de herramienta es una decisión de mantenimiento a largo plazo, no una discusión estética.

**Confusión común:** pensar que la salida de Gradle y Maven debe diferir. El comportamiento observable debe ser el mismo; lo que difiere es la forma de declarar y ejecutar el proceso.

## Verificación real

Ejecutado originalmente el 2026-05-23 y re-verificado el 2026-11-23 en `/tmp/opencode/aurora-m8` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, Maven 3.10.0).

```bash
./gradlew -q test
./gradlew -q :api:run
mvn -q test
mvn -q -DskipTests package
```

Resultados observados:

- Gradle `test`: 0 fallas (build exitoso).
- Gradle `:api:run`: `productos=2` y JSON con los dos productos del catálogo.
- Maven `test`: exitoso, 0 fallas.
- Maven `package`: exitoso, artefactos `core`/`api` generados.

**Nota honesta:** la ejecución Maven se realizó directamente con `mvn` en la corrida de 2026-11-23; la nota anterior que decía que Maven no estaba instalado quedó corregida. La salida de la app con Maven se mostró previamente usando classpath de runtime explícito; `exec:java` depende de configuración del plugin y no se usa como evidencia canónica.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Build falla en otra máquina | Versiones de JDK/Gradle no fijadas | "funciona en mi máquina" | Wrapper + toolchain + versiones declaradas |
| Dependencia no encontrada | Repos/config incompleta | Error de resolución | Verificar `repositories`, coordenadas, red/cache |
| Ciclo de módulos | Dependencia bidireccional | Gradle/Maven falla | Extraer API común, invertir dependencia |
| Tests no corren | JUnit platform mal configurada | "No tests found" | `useJUnitPlatform()` y dependencias correctas |
| Artefacto con configuración sensible | Secretos en repo/build | Fuga en VCS/logs | Variables de entorno, vault, `.gitignore` |

## Cierre

Maven y Gradle son dos interfaces para el mismo contrato: construir software de forma repetible. Aprende a leer sus archivos como mapas de dependencias, scopes, módulos y tareas/fases. Cuando entiendas ese mapa, cambiar de herramienta deja de ser una migración mística y pasa a ser una traducción.

## Checklist

- Puedo identificar coordenadas, dependencias, plugins y módulos en Maven y Gradle.
- Distingo dependencias de compilación/runtime/test y sé por qué el scope importa.
- Entiendo el ciclo de vida Maven y el modelo de tareas Gradle.
- Puedo estructurar un multi-módulo sin ciclos.
- Sé ejecutar y verificar el mismo proyecto en ambas herramientas.
