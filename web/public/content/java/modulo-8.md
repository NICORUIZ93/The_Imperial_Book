# Módulo 8: Build tools — Maven y Gradle

Compilar a mano con `javac` sirve para aprender, pero un proyecto real necesita dependencias, tests, empaquetado, versiones y tareas repetibles. Maven y Gradle automatizan ese ciclo. Este módulo enseña a leer ambos, entender su ciclo de vida y elegir con criterio.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Entender la estructura de `pom.xml` y `build.gradle.kts` |
| 2 | Ejecutar el ciclo de build y configurar scopes/configurations |
| 3 | Reconocer cuándo un proyecto multi-módulo tiene sentido |
| 4 | Comparar el mismo proyecto en Maven y Gradle |

## Aprende construyendo

### Tema 1: pom.xml vs build.gradle.kts · Básico · 40 min

**Caso guía**

Quieres compilar, testear y empaquetar un proyecto Java de forma reproducible. Necesitas elegir y entender Maven (`pom.xml`) o Gradle (`build.gradle.kts`).

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Maven (`pom.xml`)** | Herramienta de build declarativa basada en POM XML, convención y ciclo de vida. | Builds reproducibles, gestión de dependencias. | Proyectos que valoran convención/estándar. | Editar POM sin entender ciclo de vida/plugins. |
| **Gradle (`build.gradle.kts`)** | Herramienta de build programable con DSL (Kotlin/Groovy), tareas y caché incremental. | Builds flexibles y rápidos. | Proyectos que necesitan customización/rendimiento. | Scripts complejos difíciles de mantener. |
| **Gestión de dependencias** | Resolución de librerías, versiones, transitivas y repositorios. | Evitar jars manuales. | Todo proyecto real. | Conflictos de versión no controlados. |
| **Reproducibilidad** | Mismo input (código+config+versiones) produce mismo artefacto. | CI confiable. | Siempre. | Versiones flotantes/plugins no fijados. |

**Contrato / invariantes / reglas.** Maven: coordenadas `groupId:artifactId:version`. Gradle: `group:name:version`. Ambos usan repos (Maven Central). Fija versiones y wrapper (`mvnw`/`gradlew`) para reproducibilidad. Estructura estándar `src/main/java`, `src/test/java`.

**Modelo mental.** Maven = receta estándar con pasos fijos; Gradle = cocina programable con tareas.

**Implementación desde cero (Maven mínimo)**

```bash
mkdir -p ~/academia-java/modulo-8-maven && cd ~/academia-java/modulo-8-maven
mkdir -p src/main/java/com/academia
```

`pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId>
  <artifactId>demo-maven</artifactId>
  <version>1.0.0</version>
  <properties><maven.compiler.release>21</maven.compiler.release></properties>
</project>
```

`src/main/java/com/academia/App.java`:

```java
package com.academia;
public class App { public static void main(String[] args){ System.out.println("Maven OK"); } }
```

**Ejecución y salida real (con Maven instalado)**

```bash
mvn -q -DskipTests package
java -cp target/demo-maven-1.0.0.jar com.academia.App
```

```text
Maven OK
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `mvn: command not found` | Maven no instalado | Instala Maven o usa wrapper |
| Versión Java incorrecta | `release`/JDK no alineados | Ajusta `maven.compiler.release` y JDK |
| Dependencia no resuelve | Repo/coordenada mal | Verifica GAV y repos |

**Verificación rápida:** `mvn -v` y `mvn -q package`.


### Tema 2: Ciclo de vida de build y scopes · Intermedio · 40 min

**Caso guía**

Agregas JUnit para tests. Debe estar disponible al testear, pero no necesariamente empaquetado igual que dependencias de runtime.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Ciclo de vida Maven** | Fases ordenadas (`validate, compile, test, package, verify, install, deploy`). | Build predecible. | Ejecutar builds estándar. | Creer que `package` corre todo lo que quieres sin entender fases. |
| **Scopes Maven** | Alcance de dependencia (`compile, provided, runtime, test, system`). | Controlar classpath por fase. | JUnit en `test`, servlet en `provided`. | Poner todo en `compile`. |
| **Tareas/fases Gradle** | Tareas con grafo de dependencias (`test`, `build`, `assemble`). | Ejecución incremental. | Builds Gradle. | Confundir fase Maven con tarea Gradle 1:1. |
| **Classpath** | Conjunto de clases/jars visibles en compilación/ejecución/tests. | Resolver tipos. | Depurar `ClassNotFound`. | Scope incorrecto. |

**Contrato / invariantes / reglas.** Ejecutar una fase Maven ejecuta fases previas del mismo lifecycle. `test` scope no va a runtime de producción. `provided` lo provee el contenedor. En Gradle, `testImplementation` ≈ test, `implementation` ≈ compile/runtime.

**Implementación desde cero (añadir al proyecto del T1)**

En `pom.xml` agrega:

```xml
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.4</version>
    <scope>test</scope>
  </dependency>
</dependencies>
<build><plugins><plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-surefire-plugin</artifactId><version>3.5.2</version></plugin></plugins></build>
```

`src/test/java/com/academia/AppTest.java`:

```java
package com.academia;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class AppTest { @Test void ok(){ assertEquals(4, 2+2); } }
```

**Ejecución y salida real**

```bash
mvn -q test
```

```text
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Test no corre | Surefire/JUnit5 mal configurado | Usa Surefire moderno y JUnit Jupiter |
| Dependencia en JAR innecesaria | Scope incorrecto | `test` para librerías de test |
| Clase no encontrada en test | Dependencia en scope equivocado | Revisa scope/classpath |

**Verificación rápida:** `mvn -q -DskipTests package` empaqueta sin ejecutar tests.


### Tema 3: Proyectos multi-módulo · Intermedio · 40 min

**Caso guía**

Tu proyecto crece: `domain`, `app`, `infra`. Necesitas separar módulos con dependencias explícitas y build único.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Multi-módulo** | Proyecto con varios submódulos construidos bajo un agregador/root. | Separación de responsabilidades y builds coordinados. | Codebases medianas/grandes. | Dependencias cíclicas entre módulos. |
| **Módulo** | Unidad de build con su propio `pom.xml`/`build.gradle`. | Encapsular código y dependencias. | Límites claros por capa/dominio. | Módulos “bolsa de todo”. |
| **Agregador/root** | POM/gradle raíz que lista módulos y configuración común. | Un comando construye todo. | Repos monorepo multi-módulo. | Duplicar config en cada módulo. |
| **Dependencia entre módulos** | Un módulo declara otro como dependencia. | Reutilizar código con límites. | `app` depende de `domain`. | Capa infra en domain (inversión rota). |

**Contrato / invariantes / reglas.** Maven: root `<packaging>pom</packaging>` y `<modules>`. Gradle: `settings.gradle.kts` con `include(...)`. Evita ciclos. Versiona módulos coherentemente (BOM/parent). Compila desde raíz.

**Implementación desde cero (Maven)**

```bash
mkdir -p ~/academia-java/modulo-8-multi && cd ~/academia-java/modulo-8-multi
mkdir -p domain/src/main/java/com/academia/domain app/src/main/java/com/academia/app
```

`pom.xml` (root):

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId><artifactId>multi</artifactId><version>1.0.0</version><packaging>pom</packaging>
  <modules><module>domain</module><module>app</module></modules>
  <properties><maven.compiler.release>21</maven.compiler.release></properties>
</project>
```

`domain/pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent><groupId>com.academia</groupId><artifactId>multi</artifactId><version>1.0.0</version></parent>
  <artifactId>domain</artifactId>
</project>
```

`domain/src/main/java/com/academia/domain/Saludo.java`:

```java
package com.academia.domain;
public class Saludo { public static String hola(){ return "Hola dominio"; } }
```

`app/pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent><groupId>com.academia</groupId><artifactId>multi</artifactId><version>1.0.0</version></parent>
  <artifactId>app</artifactId>
  <dependencies><dependency><groupId>com.academia</groupId><artifactId>domain</artifactId><version>${project.version}</version></dependency></dependencies>
</project>
```

`app/src/main/java/com/academia/app/Main.java`:

```java
package com.academia.app;
import com.academia.domain.Saludo;
public class Main { public static void main(String[] args){ System.out.println(Saludo.hola()); } }
```

**Ejecución y salida real**

```bash
mvn -q -DskipTests package
java -cp "domain/target/domain-1.0.0.jar:app/target/app-1.0.0.jar" com.academia.app.Main
```

```text
Hola dominio
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Módulo no compila | Falta en `<modules>` o settings | Agrega módulo al agregador |
| Ciclo de dependencias | A depende de B y B de A | Rediseña límites |
| Clase no encontrada entre módulos | Falta dependencia declarada | Declara dependencia de módulo |

**Verificación rápida:** `mvn -q -pl app -am package` construye app y dependencias.


### Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas · Avanzado · 40 min

**Caso guía**

Heredas un repo en Gradle pero tu equipo conoce Maven. Necesitas mapear conceptos equivalentes para operar con seguridad.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Maven | Gradle | Regla práctica |
|---|---|---|---|
| **Descriptor** | `pom.xml` | `build.gradle.kts` + `settings.gradle.kts` | Mismo GAV, distinta sintaxis |
| **Ciclo/tareas** | Fases (`compile,test,package`) | Tareas (`classes,test,build`) | No asumir 1:1 exacto |
| **Dependencias** | `<dependency><scope>test` | `testImplementation(...)` | Mapea scopes/configurations |
| **Wrapper** | `mvnw` | `gradlew` | Siempre usar wrapper del repo |

**Contrato / invariantes / reglas.** Ambos resuelven dependencias desde repos y producen artefactos; la convención de directorios es similar. Usa el wrapper commiteado. No mezcles dos builds sobre el mismo árbol sin aislar outputs.

**Implementación desde cero (Gradle mínimo equivalente)**

```bash
mkdir -p ~/academia-java/modulo-8-gradle && cd ~/academia-java/modulo-8-gradle
mkdir -p src/main/java/com/academia
```

`build.gradle.kts`:

```kotlin
plugins { application; java }
repositories { mavenCentral() }
java { toolchain { languageVersion.set(JavaLanguageVersion.of(21)) } }
application { mainClass.set("com.academia.App") }
```

`settings.gradle.kts`:

```kotlin
rootProject.name = "demo-gradle"
```

`src/main/java/com/academia/App.java`:

```java
package com.academia;
public class App { public static void main(String[] args){ System.out.println("Gradle OK"); } }
```

**Ejecución y salida real (con Gradle instalado)**

```bash
gradle -q run
```

```text
Gradle OK
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `gradle: command not found` | No instalado | Instala Gradle o genera wrapper |
| JDK no coincide | Toolchain mal | Ajusta toolchain/JDK |
| Confusión scope/config | Mapeo mental Maven→Gradle | Usa tabla de equivalencias |

**Verificación rápida:** `gradle tasks --all` y compara con `mvn help:describe -Dcmd=package`.


## Cierre del módulo

Puedes leer y operar builds en Maven y Gradle, entender scopes, fases/tareas y estructura multi-módulo. El siguiente paso es asegurar calidad: pruebas automatizadas con JUnit y Mockito.
