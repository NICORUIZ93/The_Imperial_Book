# Módulo 8: Build tools — Maven y Gradle

Un build tool responde a una pregunta concreta: cómo transformar código fuente, dependencias y reglas en un artefacto reproducible. El mecanismo es un grafo: entradas (fuentes, dependencias, configuración) producen salidas (clases, tests ejecutados, jars). Maven representa ese grafo con un modelo declarativo en XML y un ciclo de vida de fases; Gradle lo representa con tareas y una DSL ejecutable. Existen porque “compilar” no es solo invocar `javac`: hay que resolver versiones, decidir qué dependencia vive en cada classpath, ejecutar verificaciones y empaquetar siempre igual en la máquina local y en CI.

La implicación práctica es que el build pasa a ser código de proyecto: cambia el resultado, tiene versiones y requiere revisión. La confusión frecuente es tratar al build tool como un detalle de entorno (“el IDE ya compila”). Cuando el build cambia la salida de negocio, o cuando un artefacto arrastra dependencias de test, el problema está en la declaración del build, no en Java.

En este módulo el mismo código Java se construye con las dos herramientas dentro de un único árbol, `tienda-aurora-build-tools`. La verificación se ejecutó en `/tmp/opencode/aurora-m8` el 2026-11-23.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-8-build-tools.html`; regeneración: editar el HTML/SVG en esa ruta):** [Maven y Gradle construyen el mismo proyecto multi-módulo con fases/tareas y salida de negocio idéntica](/visuals/temas/java/modulo-8-build-tools.html)

Lectura: Maven y Gradle son dos modelos de build; el comportamiento de negocio debe permanecer igual.

## Proyecto verificado

Directorio de trabajo: `/tmp/opencode/aurora-m8`. Nombre declarado en ambos builds: `tienda-aurora-build-tools`.

```text
/tmp/opencode/aurora-m8/
├── settings.gradle.kts
├── build.gradle.kts
├── pom.xml
├── core/
│   ├── build.gradle.kts
│   ├── pom.xml
│   └── src/main/java/com/aurora/build/core/
└── api/
    ├── build.gradle.kts
    ├── pom.xml
    └── src/main/java/com/aurora/build/api/
```

Los dos modelos conviven en el mismo árbol para que la comparación sea del build, no del código. `core` tiene el dominio, Jackson y un test; `api` depende de `core` y contiene el `main`.

## Prerrequisitos

```bash
java -version
gradle --version
mvn -v
```

Entorno observado: JDK 27.0.1.0.2 (Temurin), Gradle 9.9.1, Maven 3.10.0, macOS arm64. Gradle usa toolchain Java 25 y Maven compila con `release` 25.

## Bootstrap

```bash
mkdir -p tienda-aurora-build-tools/core/src/main/java/com/aurora/build/core
mkdir -p tienda-aurora-build-tools/core/src/test/java/com/aurora/build/core
mkdir -p tienda-aurora-build-tools/api/src/main/java/com/aurora/build/api
cd tienda-aurora-build-tools
gradle wrapper --gradle-version 9.9.1
```

El nombre del directorio y el `rootProject.name`/`artifactId` coinciden: `tienda-aurora-build-tools`. Usar `tienda-aurora-build` en el bootstrap y `tienda-aurora-build-tools` en los archivos de build genera dos nombres distintos para un mismo proyecto y confunde los reportes.

## Código completo, archivo por archivo

#### Fuentes Java compartidas

**`/tmp/opencode/aurora-m8/core/src/main/java/com/aurora/build/core/Producto.java`**

```java
package com.aurora.build.core;
import java.math.BigDecimal;
public record Producto(String sku, String nombre, BigDecimal precio) {}
```

`Producto` es el dato de dominio que se serializa.

**`/tmp/opencode/aurora-m8/core/src/main/java/com/aurora/build/core/Catalogo.java`**

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

La excepción checked de Jackson se traduce a `IllegalStateException`: `api` no necesita conocer la librería que usa `core`.

**`/tmp/opencode/aurora-m8/core/src/test/java/com/aurora/build/core/CatalogoTest.java`**

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

**`/tmp/opencode/aurora-m8/api/src/main/java/com/aurora/build/api/TiendaAuroraApiApp.java`**

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

#### Build Gradle

**`/tmp/opencode/aurora-m8/settings.gradle.kts`**

```kotlin
rootProject.name = "tienda-aurora-build-tools"
include("core", "api")
```

**`/tmp/opencode/aurora-m8/build.gradle.kts`**

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

**`/tmp/opencode/aurora-m8/core/build.gradle.kts`**

```kotlin
dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.19.0")
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
```

**`/tmp/opencode/aurora-m8/api/build.gradle.kts`**

```kotlin
plugins { application }
dependencies { implementation(project(":core")) }
application { mainClass = "com.aurora.build.api.TiendaAuroraApiApp" }
```

#### Build Maven

**`/tmp/opencode/aurora-m8/pom.xml`**

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

**`/tmp/opencode/aurora-m8/core/pom.xml`**

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

**`/tmp/opencode/aurora-m8/api/pom.xml`**

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

## Comandos ejecutados y salida observada

Todos se ejecutaron desde `/tmp/opencode/aurora-m8`.

#### Gradle

```bash
cd /tmp/opencode/aurora-m8
./gradlew test --rerun-tasks
./gradlew -q :api:run
```

Salida de `./gradlew test --rerun-tasks` (segmento con las tareas del build):

```text
> Task :core:compileJava
> Task :api:compileJava
> Task :core:compileTestJava
> Task :core:test
> Task :api:test NO-SOURCE

BUILD SUCCESSFUL in 946ms
5 actionable tasks: 5 executed
```

El XML de resultados, `core/build/test-results/test/TEST-com.aurora.build.core.CatalogoTest.xml`, registra `tests="1" skipped="0" failures="0" errors="0"`.

Salida de `./gradlew -q :api:run`:

```text
productos=2
[{"sku":"CAF-100","nombre":"Cafe Aurora","precio":14.90},{"sku":"MOL-200","nombre":"Molino Manual","precio":79.90}]
```

#### Maven

```bash
cd /tmp/opencode/aurora-m8
mvn test
mvn -q -DskipTests package
mvn -q -pl core dependency:copy-dependencies -DincludeScope=runtime -DoutputDirectory=target/deps
java -cp "api/target/classes:core/target/classes:core/target/deps/*" com.aurora.build.api.TiendaAuroraApiApp
```

Salida de `mvn test` (resumen del reactor y del test):

```text
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] tienda-aurora-build-tools .......................... SUCCESS [  0.001 s]
[INFO] core ............................................... SUCCESS [  1.211 s]
[INFO] api ................................................ SUCCESS [  0.149 s]
[INFO] BUILD SUCCESS
[INFO] Total time:  1.430 s
[INFO] Finished at: 2026-11-23T03:18:05-05:00
```

Ejecución de la app con el classpath de runtime copiado:

```text
productos=2
[{"sku":"CAF-100","nombre":"Cafe Aurora","precio":14.90},{"sku":"MOL-200","nombre":"Molino Manual","precio":79.90}]
```

`core/target/deps/` contiene `jackson-annotations-2.19.0.jar`, `jackson-core-2.19.0.jar` y `jackson-databind-2.19.0.jar`. No aparece ningún jar de JUnit.

## Conceptos cubiertos

### Tema 1: pom.xml vs build.gradle.kts · Básico · 40 min

**Mecanismo.** `pom.xml` es un modelo declarativo: coordenadas (`groupId`, `artifactId`, `version`), `<modules>`, `<dependencies>`, `<properties>` y plugins ligados a fases. `build.gradle.kts` es un script Kotlin que configura un grafo de tareas: cada tarea declare entradas, salidas y dependencias con otras tareas. Los plugins aportan tareas y convenciones en ambos casos.

**Por qué existe.** Necesitamos una descripción del build que una persona y una máquina puedan ejecutar sin depender del IDE. Maven eligió la convención y un vocabulario fijo; Gradle eligió la programabilidad y el cálculo incremental.

**Implicaciones.** En Maven, la estructura estándar (`src/main/java`, `src/test/java`) hace que gran parte del build sea implícito. En Gradle, `subprojects { ... }` centraliza la configuración, pero esa misma flexibilidad permite builds difíciles de leer. Un script de build merece revisión de código; un POM merece revisión de versiones y scopes.

**Confusión común.** “Gradle es siempre más moderno y mejor”. La herramienta que el equipo sabe mantener, con wrapper y versiones fijadas, suele ser mejor que una migración por moda.

La misma dependencia se expresa así en Maven:

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>${jackson.version}</version>
</dependency>
```

Y así en Gradle:

```kotlin
dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.19.0")
}
```

Maven es más verboso y explicita la coordenada completa; Gradle es compacto. Ninguno garantiza corrección por sí mismo: lo importante es que la versión esté declarada y sea la misma en todos los entornos.

### Tema 2: Ciclo de vida de build y scopes · Intermedio · 40 min

**Mecanismo.** El ciclo default de Maven encadena fases: `validate`, `compile`, `test`, `package`, `verify`, `install`, `deploy`. `mvn package` ejecuta las fases previas. Gradle no tiene fases: tiene tareas (`compileJava`, `test`, `jar`, `build`, `run`) con relaciones definidas por plugins. Los scopes son conjuntos de classpath: Maven usa `<scope>test</scope>`, `<scope>runtime</scope>`, etc.; Gradle usa configuraciones como `implementation`, `runtimeOnly`, `testImplementation` y `testRuntimeOnly`.

**Por qué existe.** Separar clasificaciones evita que una dependencia necesaria solo para probar o solo en ejecución contamine la compilación o el artefacto. Afecta al tamaño del paquete, a la superficie de seguridad y a la claridad de los contratos.

**Implicaciones observables en este proyecto.** `junit-platform-launcher` está declarado con `testRuntimeOnly`. Se ejecutaron los reportes de dependencias y se filtraron las líneas JUnit:

```bash
cd /tmp/opencode/aurora-m8
./gradlew -q :core:dependencies --configuration testCompileClasspath | grep -E 'junit|platform|opentest|apiguardian'
./gradlew -q :core:dependencies --configuration testRuntimeClasspath | grep -E 'junit|platform|opentest|apiguardian'
```

En `testCompileClasspath` aparece `org.junit.jupiter:junit-jupiter -> 5.13.4` con `junit-jupiter-api` y `junit-jupiter-params`, pero no el launcher. En `testRuntimeClasspath` aparece, además:

```text
\--- org.junit.platform:junit-platform-launcher -> 1.13.4
     +--- org.junit:junit-bom:5.13.4 (*)
     \--- org.junit.platform:junit-platform-engine:1.13.4 (*)
```

La consecuencia es concreta: el launcher está en el classpath de ejecución de tests y no en el de compilación. El código de `CatalogoTest` no puede importarlo, y Gradle no lo necesita para compilar.

En Maven se ejecutó:

```bash
cd /tmp/opencode/aurora-m8
mvn -pl core dependency:tree -Dscope=test
```

Salida filtrada:

```text
[INFO] +- com.fasterxml.jackson.core:jackson-databind:jar:2.19.0:compile
[INFO] |  +- com.fasterxml.jackson.core:jackson-annotations:jar:2.19.0:compile
[INFO] |  \- com.fasterxml.jackson.core:jackson-core:jar:2.19.0:compile
[INFO] \- org.junit.jupiter:junit-jupiter:jar:5.13.4:test
[INFO]    +- org.junit.jupiter:junit-jupiter-api:jar:5.13.4:test
[INFO]    |  +- org.junit.platform:junit-platform-commons:jar:1.13.4:test
[INFO]    +- org.junit.jupiter:junit-jupiter-params:jar:5.13.4:test
[INFO]    \- org.junit.jupiter:junit-jupiter-engine:jar:5.13.4:test
[INFO]       \- org.junit.platform:junit-platform-engine:jar:1.13.4:test
```

Y el contenido de `core/target/core-1.0.0.jar` solo incluye `Catalogo.class`, `Producto.class` y los metadatos de Maven. La misma separación existe en los dos builds, aunque se escriba distinto:

```kotlin
testImplementation(platform("org.junit:junit-bom:5.13.4"))
testImplementation("org.junit.jupiter:junit-jupiter")
testRuntimeOnly("org.junit.platform:junit-platform-launcher")
```

```xml
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
```

**Confusión común.** Creer que `runtimeOnly`/`<scope>runtime</scope>` es una etiqueta decorativa. No lo es: cambia el classpath. Un driver JDBC declarado con `runtimeOnly` compila sin la clase del driver y falla en runtime si se quita; una librería de test declarada con `implementation` se filtra al artefacto. La comprobación no es leer el archivo, sino mirar `dependencies`/`dependency:tree` y el jar resultante.

### Tema 3: Proyectos multi-módulo · Intermedio · 40 min

**Mecanismo.** Gradle declara la pertenencia al build en `settings.gradle.kts` con `include("core", "api")`; Maven la declara en el POM padre con `<modules>`. La dirección de la dependencia se escribe después: `implementation(project(":core"))` o `com.aurora:core:${project.version}`.

**Por qué existe.** Un multi-módulo convierte una regla arquitectónica en una restricción del build: `core` no puede importar `api` porque no declara esa dependencia. Un classpath plano no ofrecería esa barrera.

**Implicaciones.** Se puede compilar y testear `core` sin levantar la aplicación. Los contratos entre módulos se vuelven visibles: si `Catalogo.comoJson()` expusiera `JsonProcessingException`, `api` tendría que declarar Jackson para compilar. Traducirla a `IllegalStateException` mantiene el límite limpio. Un ciclo `core → api → core` deja de ser una mala costumbre y pasa a ser un error de resolución.

**Confusión común.** Crear módulos “por orden” o vaciar todo en un `common` que todos importan. Eso reproduce el classpath plano con más carpetas. Cada módulo necesita una responsabilidad y una dirección de dependencia justificables.

### Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas · Avanzado · 40 min

**Mecanismo.** Las fuentes Java son idénticas; cambia la descripción del build y el comando que lo ejecuta. Gradle ejecuta tareas (`test`, `:api:run`); Maven ejecuta fases (`test`, `package`) y necesita un classpath explícito para ejecutar `main` cuando no se configura `exec:java`.

**Por qué existe.** Comparar los dos modelos con el mismo código separa lo que es del dominio de lo que es del entorno. Si la salida cambia al cambiar de herramienta, hay una dependencia accidental del build.

**Implicaciones.** La salida observada en ambos builds fue idéntica:

```text
productos=2
[{"sku":"CAF-100","nombre":"Cafe Aurora","precio":14.90},{"sku":"MOL-200","nombre":"Molino Manual","precio":79.90}]
```

La elección de herramienta es una decisión de mantenimiento: convención y XML predecible frente a flexibilidad y DSL programable. En equipos existentes, la herramienta que se entiende y se puede mantener con disciplina suele ser la correcta.

**Confusión común.** Esperar que Gradle y Maven produzcan comportamientos de negocio distintos. Lo que difiere es la forma de declarar y ejecutar el proceso; el resultado observable del programa debe ser el mismo.

## Verificación real

Ejecutado el 2026-11-23 en `/tmp/opencode/aurora-m8` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1 con toolchain Java 25, Maven 3.10.0).

| Comando (desde `/tmp/opencode/aurora-m8`) | Resultado observado |
|---|---|
| `./gradlew test --rerun-tasks` | `BUILD SUCCESSFUL`; `core` 1 test, 0 fallas; `api:test NO-SOURCE` |
| `./gradlew -q :api:run` | `productos=2` y el JSON de los dos productos |
| `mvn test` | `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`; `BUILD SUCCESS` |
| `mvn -q -DskipTests package` | exitoso; `core-1.0.0.jar` y `api-1.0.0.jar` generados |
| `mvn -q -pl core dependency:copy-dependencies -DincludeScope=runtime -DoutputDirectory=target/deps` | exitoso; 3 jars de Jackson copiados |
| `java -cp "api/target/classes:core/target/classes:core/target/deps/*" com.aurora.build.api.TiendaAuroraApiApp` | `productos=2` y el mismo JSON |

Los reportes de dependencias de Gradle y el `dependency:tree` de Maven se ejecutaron para demostrar los scopes; sus líneas relevantes están transcritas en el Tema 2.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Build falla en otra máquina | Wrapper o toolchain sin fijar | Versiones distintas entre entornos | Wrapper 9.9.1 + toolchain 25 + versiones declaradas |
| Dependencia no encontrada | Repositorio, coordenata o red incompletos | Error de resolución en `dependencies`/`dependency:tree` | Revisar `repositories`, coordenadas y caché |
| Ciclo de módulos | Dependencia bidireccional | Gradle/Maven falla al resolver | Invertir la dependencia o extraer una API común |
| Tests no corren | JUnit Platform sin configurar | `NO-SOURCE` o “No tests found” | `useJUnitPlatform()` y configuraciones `test*` correctas |
| JUnit aparece en el artefacto | Dependencia de test declarada como `implementation`/`compile` | `jar tf` muestra jars de test | `testImplementation`/`testRuntimeOnly` o `<scope>test</scope>` |
| `mvn -pl api -am dependency:copy-dependencies` falla con `Path com/aurora/core/1.0.0/core-1.0.0.jar NOT allowed from central` | El plugin intenta resolver el módulo hermano como artefacto externo | Error observado al ejecutar ese comando en este reactor | Copiar dependencias desde `core` y usar `core/target/classes` en el classpath, como en la sección de comandos |
| Salida distinta entre builds | Configuración dependiente del entorno | Comparar `api:run` con el `java -cp` de Maven | Mover esa configuración al archivo de build |

## Cierre

Maven y Gradle son dos interfaces para el mismo contrato: construir software de forma repetible. Lee sus archivos como mapas de coordenadas, scopes, módulos y tareas/fases. Cuando entiendes ese mapa, cambiar de herramienta deja de ser una migración mística y pasa a ser una traducción.

## Checklist

- Puedo identificar coordenadas, dependencias, plugins y módulos en Maven y Gradle.
- Distingo dependencias de compilación, runtime y test, y sé comprobarlo con reportes.
- Entiendo el ciclo de vida Maven y el modelo de tareas Gradle.
- Puedo estructurar un multi-módulo sin ciclos.
- Sé ejecutar y verificar el mismo proyecto en ambas herramientas.
