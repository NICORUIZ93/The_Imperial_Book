# Módulo 8: Build tools — Maven y Gradle

Compilar a mano con `javac` sirve para aprender, pero un proyecto real necesita dependencias, tests, empaquetado, versiones y tareas repetibles. Maven y Gradle automatizan ese ciclo. Este módulo enseña a leer ambos, entender su ciclo de vida y elegir con criterio.

**Entorno de referencia verificado (2026-05-22):** JDK 27, Maven 3.10.0, Gradle 9.8.2.

## Aprende construyendo

### Tema 1: pom.xml vs build.gradle.kts · Básico · 40 min

Quieres compilar y empaquetar un proyecto Java de forma reproducible. Necesitas entender Maven (`pom.xml`) o Gradle (`build.gradle.kts`).

#### Maven (`pom.xml`)

**Definición formal.** Herramienta de build declarativa basada en POM XML, convención sobre configuración y ciclos de vida.

**Para qué sirve.** Builds reproducibles, gestión de dependencias y plugins con estructura estándar.

**Cuándo usarlo y cuándo no.** Úsalo cuando valoras convención y ecosistema maduro. Evita personalizaciones complejas embutidas en XML oscuro.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m8-t1-maven/src/main/java/com/academia
cd /tmp/java-m8-t1-maven
```

`pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId><artifactId>demo</artifactId><version>1.0.0</version>
  <properties><maven.compiler.release>21</maven.compiler.release></properties>
</project>
```

`src/main/java/com/academia/App.java`:

```java
package com.academia;
public class App { public static void main(String[] args){ System.out.println("Maven OK"); } }
```

**Caso de uso real.** Servicio backend estándar con dependencias, tests y CI.

**Error común.** Editar POM sin entender fases/plugins. Síntoma: build inesperado. Corrección: conocer el lifecycle.

**Verificación (JDK 27, Maven 3.10.0, 2026-05-22).**

```bash
mvn -q -DskipTests package
java -cp target/demo-1.0.0.jar com.academia.App
```

```text
Maven OK
```

#### Gradle (`build.gradle.kts`)

**Definición formal.** Herramienta de build basada en tareas y DAG, con DSL Kotlin/Groovy y caché incremental.

**Para qué sirve.** Builds flexibles y normalmente rápidos, con lógica programable.

**Cuándo usarlo y cuándo no.** Úsalo cuando necesitas customización o rendimiento. No conviertas el build script en programa opaco.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m8-t1-gradle/src/main/java/com/academia
cd /tmp/java-m8-t1-gradle
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

**Caso de uso real.** Monorepo con tareas personalizadas y builds incrementales.

**Error común.** Script complejo no mantenible. Corrección: mantener convención y extraer lógica a plugins/buildSrc cuando crezca.

**Verificación (JDK 27, Gradle 9.8.2, 2026-05-22).**

```bash
gradle -q run
```

```text
Gradle OK
```

#### Gestión de dependencias

**Definición formal.** Resolución declarativa de librerías, versiones, transitivas y repositorios.

**Para qué sirve.** Evita copiar JARs manualmente y permite builds reproducibles.

**Cuándo usarlo.** Siempre en proyectos reales. Fija versiones.

**Ejemplo mínimo enfocado (ejecutable).**

```xml
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <version>2.0.16</version>
</dependency>
```

**Caso de uso real.** Agregar JUnit, Jackson, Logback.

**Error común.** Conflictos de versión transitiva. Corrección: inspeccionar árbol (`mvn dependency:tree` / `gradle dependencies`).

**Verificación.** Ejecutar `mvn -q dependency:tree` en un proyecto con dependencia; confirma resolución.

#### Reproducibilidad

**Definición formal.** Capacidad de obtener el mismo resultado a partir de mismos inputs (código, config, versiones, JDK compatible).

**Para qué sirve.** CI confiable y depuración consistente.

**Cuándo usarlo.** Siempre. Usa wrapper y versiones fijas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mvn -v
gradle -v
```

**Caso de uso real.** `mvnw`/`gradlew` commiteados en repo.

**Error común.** Depender del Maven/Gradle instalado localmente. Corrección: wrapper.

**Verificación (2026-05-22).** `mvn -v` muestra Maven 3.10.0; `gradle -v` muestra Gradle 9.8.2.

#### Ejemplo integrado desde cero

Usa el ejemplo Maven mínimo de arriba: `pom.xml` + `App.java`, `mvn -q -DskipTests package`, luego `java -cp target/demo-1.0.0.jar com.academia.App`.

#### Verificación integrada

Salida real: `Maven OK`.


### Tema 2: Ciclo de vida de build y scopes · Intermedio · 40 min

Agregas JUnit para tests. Debe estar disponible al testear, pero no igual que dependencias de runtime.

#### Ciclo de vida Maven

**Definición formal.** Secuencia de fases ordenadas (`validate`, `compile`, `test`, `package`, `verify`, `install`, `deploy`).

**Para qué sirve.** Da builds predecibles y repetibles.

**Cuándo usarlo.** Ejecuta la fase que necesitas; Maven corre fases previas del mismo lifecycle.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
# en proyecto Maven del T1
mvn -q -DskipTests package
```

**Caso de uso real.** CI ejecuta `mvn verify`.

**Error común.** Creer que `package` siempre ejecuta todo lo deseado. Corrección: entender fases y plugins ligados.

**Verificación (Maven 3.10.0, 2026-05-22).** Genera JAR en `target/`.

#### Scopes Maven

**Definición formal.** Alcance de dependencia: `compile`, `provided`, `runtime`, `test`, etc., que determina en qué classpath participa.

**Para qué sirve.** Controla disponibilidad en compilación, test y runtime.

**Cuándo usarlo.** JUnit en `test`; API de contenedor en `provided`.

**Ejemplo mínimo enfocado (ejecutable).**

```xml
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>5.11.4</version>
  <scope>test</scope>
</dependency>
```

**Caso de uso real.** Librería de test no incluida en runtime de producción.

**Error común.** Poner todo en `compile`. Síntoma: JAR inflado o conflictos. Corrección: scope correcto.

**Verificación.** `mvn -q test` usa dependencia test; no es necesaria en runtime de app.

#### Tareas/fases Gradle y classpath

**Definición formal.** En Gradle, tareas forman un DAG (`test`, `build`). Las configurations (`implementation`, `testImplementation`) definen classpaths.

**Para qué sirve.** Ejecución incremental y separación clara de dependencias.

**Cuándo usarlo.** Proyectos Gradle.

**Ejemplo mínimo enfocado (ejecutable).**

```kotlin
dependencies { testImplementation("org.junit.jupiter:junit-jupiter:5.11.4") }
tasks.test { useJUnitPlatform() }
```

**Caso de uso real.** Separar API pública de implementación interna.

**Error común.** Confundir fase Maven con tarea Gradle 1:1. Corrección: pensar en grafo de tareas.

**Verificación.** `gradle tasks --all` muestra tareas disponibles.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m8-t2/src/main/java/com/academia /tmp/java-m8-t2/src/test/java/com/academia
cd /tmp/java-m8-t2
```

`pom.xml` (con junit-jupiter scope test y surefire 3.5.2), `App.java` y `AppTest.java`.

```bash
mvn -q test
```

**Verificación (Maven 3.10.0, JDK 27, 2026-05-22).** Salida observada:

```text
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

### Tema 3: Proyectos multi-módulo · Intermedio · 40 min

Tu proyecto crece: `domain`, `app`, `infra`. Necesitas separar módulos con dependencias explícitas y un build único.

#### Multi-módulo y agregador

**Definición formal.** Un proyecto multi-módulo tiene un root/agregador que lista submódulos; cada módulo tiene su propio descriptor de build.

**Para qué sirve.** Separar responsabilidades y construir todo coordinadamente.

**Cuándo usarlo y cuándo no.** Úsalo cuando los límites son claros. No crees módulos por moda.

**Ejemplo mínimo enfocado (ejecutable).**

```xml
<packaging>pom</packaging>
<modules><module>domain</module><module>app</module></modules>
```

**Caso de uso real.** `domain`, `application`, `infrastructure`.

**Error común.** Módulo no incluido en root. Síntoma: no compila en build global. Corrección: agregarlo a `<modules>` o `settings.gradle.kts`.

**Verificación.** `mvn -q -DskipTests package` desde root construye módulos.

#### Dependencia entre módulos

**Definición formal.** Un módulo declara otro módulo como dependencia, haciendo visibles sus clases según configuración.

**Para qué sirve.** Reutilizar código respetando límites.

**Cuándo usarlo.** `app` depende de `domain`; `domain` no depende de `infra`.

**Ejemplo mínimo enfocado (ejecutable).**

```xml
<dependency>
  <groupId>com.academia</groupId><artifactId>domain</artifactId><version>${project.version}</version>
</dependency>
```

**Caso de uso real.** Capa de aplicación usa entidades/dominio.

**Error común.** Ciclo de dependencias. Síntoma: build falla o diseño frágil. Corrección: rediseñar límites.

**Verificación (Maven 3.10.0, JDK 27, 2026-05-22).** El proyecto multi-módulo del ejemplo compila y ejecuta `Hola dominio`.

#### Ejemplo integrado desde cero

Crea root `pom.xml` (packaging pom), módulos `domain` y `app`; `app` depende de `domain`.

```bash
mvn -q -DskipTests package
java -cp "domain/target/domain-1.0.0.jar:app/target/app-1.0.0.jar" com.academia.app.Main
```

Salida real:

```text
Hola dominio
```

### Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas · Avanzado · 40 min

Heredas un repo en Gradle pero conoces Maven. Necesitas mapear conceptos equivalentes.

#### Descriptor y coordenadas

**Definición formal.** Maven usa `pom.xml`; Gradle usa `build.gradle.kts` y `settings.gradle.kts`. Ambos identifican artefactos con coordenadas.

**Para qué sirve.** Entender dónde se declara identidad, dependencias y plugins.

**Cuándo usarlo.** Al migrar o leer repositorios.

**Ejemplo mínimo enfocado (ejecutable).**

Maven: `<groupId>com.academia</groupId><artifactId>demo</artifactId><version>1.0.0</version>`. Gradle: `group = "com.academia"; version = "1.0.0"` y `rootProject.name`.

**Caso de uso real.** Auditar dependencia y versión en CI.

**Error común.** Buscar `pom.xml` en proyecto Gradle. Corrección: identificar la herramienta por archivos raíz.

**Verificación.** `mvn -v` o `gradle -v` y presencia de `pom.xml`/`build.gradle*`.

#### Ciclo/tareas y equivalencias

**Definición formal.** Maven tiene fases; Gradle tiene tareas en DAG. No hay mapeo 1:1 perfecto, pero hay equivalencias prácticas.

**Para qué sirve.** Operar con seguridad en cualquiera de las dos.

**Cuándo usarlo.** Al ejecutar CI o local.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mvn -q test
gradle -q test
```

**Caso de uso real.** Pipelines que cambian de herramienta.

**Error común.** Asumir que `gradle build` es idéntico a `mvn package` en todos los detalles. Corrección: revisar tareas/fases del proyecto.

**Verificación (Maven 3.10.0, Gradle 9.8.2, 2026-05-22).** Ambos ejecutan tests en sus proyectos respectivos.

#### Wrapper

**Definición formal.** Script commiteado (`mvnw`, `gradlew`) que fija versión de la herramienta de build.

**Para qué sirve.** Reproducibilidad entre máquinas y CI.

**Cuándo usarlo.** Siempre en repos compartidos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
./mvnw -v
./gradlew -v
```

**Caso de uso real.** CI usa wrapper del repo.

**Error común.** Usar versión local distinta. Síntoma: comportamiento diferente. Corrección: wrapper.

**Verificación.** Comprobar existencia y versión del wrapper.

#### Ejemplo integrado desde cero

Proyecto equivalente en Gradle: `build.gradle.kts`, `settings.gradle.kts`, `App.java`. Ejecutar `gradle -q run`.

Salida real:

```text
Gradle OK
```

## Cierre del módulo

Puedes leer y operar builds en Maven y Gradle, entender scopes, fases/tareas y estructura multi-módulo. El siguiente paso es calidad: pruebas automatizadas con JUnit y Mockito.
