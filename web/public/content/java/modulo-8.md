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

Recibes dos proyectos Java: uno usa Maven, otro Gradle. Necesitas saber dónde están las dependencias, la versión de Java, el nombre del artefacto y cómo ejecutar tests.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *build tool* automatiza la transformación de código fuente y recursos en artefactos verificables. Maven usa un modelo declarativo basado en POM (Project Object Model) y ciclo de vida. Gradle usa un grafo de tareas dirigido acíclico (DAG) configurado por DSL.

**Contrato / invariantes / reglas.** Maven favorece convención sobre configuración; la estructura estándar (`src/main/java`, `src/test/java`) activa comportamientos por defecto. Gradle evalúa scripts y construye un grafo de tareas; las dependencias de tareas determinan el orden. Ambos resuelven dependencias desde repositorios, soportan wrappers (`mvnw`/`gradlew`) y producen artefactos reproducibles si la configuración está fijada.

**Modelo mental.** Maven es una línea de ensamblaje con estaciones predefinidas; Gradle es un plano de tareas donde declaras qué depende de qué.

**Implementación desde cero**

Desde una carpeta vacía (Maven):

```bash
mkdir -p ~/academia-java/modulo-8-maven/src/main/java/com/academia src/test/java/com/academia
cd ~/academia-java/modulo-8-maven
```

Crea `pom.xml`:


```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId>
  <artifactId>demo</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.11.0</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

Gradle mínimo (`build.gradle.kts`):

```kotlin
plugins { java }
group = "com.academia"
version = "1.0.0"
repositories { mavenCentral() }
dependencies { testImplementation("org.junit.jupiter:junit-jupiter:5.11.0") }
tasks.test { useJUnitPlatform() }
```

**Desglose del código**

- `groupId/artifactId/version` identifican el artefacto en Maven; en Gradle, `group` y `version`.
- `maven.compiler.release` fija la versión de Java objetivo.
- `scope test` en Maven equivale conceptualmente a `testImplementation` en Gradle.
- El wrapper (`mvnw`/`gradlew`) permite construir sin instalar la herramienta globalmente.

**Ejecución y salida real**

```bash
mvn -q test
./gradlew test
```

La salida depende del proyecto, pero ambos ejecutan compilación y pruebas según su configuración.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Dependencia no encontrada | Repositorio o coordenada mal escrita | Verifica group/artifact/version |
| Compila con Java incorrecto | Release/source no configurado | Fija `maven.compiler.release` o toolchain Gradle |
| “Works on my machine” | No usan wrapper | Versiona y usa `mvnw`/`gradlew` |

**Verificación rápida**

Crea un proyecto mínimo, agrega JUnit y ejecuta `test` con wrapper. El build debe pasar en una máquina limpia con JDK instalado.

### Tema 2: Ciclo de vida de build y scopes · Intermedio · 40 min

**Caso guía**

Un colega dice “corre `mvn package`” y otro “corre `./gradlew build`”. Quieres saber qué etapas se ejecutan y por qué una dependencia está en `test` y no en producción.

**Fundamento técnico y modelo mental**

**Definición formal.** El *ciclo de vida* en Maven es una secuencia de fases; cada fase puede tener goals vinculados. En Gradle, las *tareas* forman un DAG; ejecutar una tarea ejecuta sus dependencias. Los *scopes/configurations* definen en qué classpath participa una dependencia.

**Contrato / invariantes / reglas.** En Maven, invocar una fase ejecuta las fases previas del mismo ciclo. En Gradle, la ejecución la determina el grafo de dependencias de tareas. Las dependencias de test no deben filtrarse a runtime de producción. La resolución transitiva puede traer conflictos de versión; se deben inspeccionar con `dependency:tree`/`dependencies`.

**Modelo mental.** Scope/configuration es la etiqueta de equipaje: indica si viaja en cabina, bodega o solo en pruebas.

**Implementación desde cero**

En el proyecto Maven del Tema 1 (`~/academia-java/modulo-8-maven`):

```bash
# Maven
mvn clean test
mvn package

# Gradle
./gradlew clean test
./gradlew build
```

Ejemplo de dependencia por scope/configuration:

```xml
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <version>1.18.34</version>
  <scope>provided</scope>
</dependency>
```

```kotlin
dependencies {
    compileOnly("org.projectlombok:lombok:1.18.34")
    annotationProcessor("org.projectlombok:lombok:1.18.34")
}
```

**Desglose del código**

- `clean` elimina artefactos previos (`target/` o `build/`).
- `test` compila y ejecuta pruebas.
- `package/build` produce el artefacto entregable.
- Usar `test` scope evita llevar JUnit al JAR de producción.

**Ejecución y salida real**

Deberías ver fases/tareas ejecutadas en orden y un resultado `BUILD SUCCESS` o `BUILD SUCCESSFUL`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Dependencia de test llega a runtime | Scope/configuración mal puesta | Revisa `test`/`testImplementation` |
| Build lento por no entender tareas | Ejecutas más de lo necesario | Usa la tarea/fase mínima para tu objetivo |
| Tests no corren en JUnit 5 | Falta plataforma/configuración | En Gradle agrega `useJUnitPlatform()` |

**Verificación rápida**

Ejecuta `mvn test` o `./gradlew test` y confirma que solo se ejecutan pruebas, no empaquetado innecesario.

### Tema 3: Proyectos multi-módulo · Intermedio · 40 min

**Caso guía**

Tu aplicación crece: dominio, API y persistencia empiezan a mezclarse. Quieres separar módulos con límites claros y builds reutilizables.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *proyecto multi-módulo* es un agregado de módulos con builds independientes pero coordinados. En Maven, un POM padre agrega módulos; en Gradle, `settings.gradle.kts` incluye subproyectos.

**Contrato / invariantes / reglas.** Los módulos deben tener dependencias acíclicas. Los contratos entre módulos deben ser explícitos. La versionado/configuración puede centralizarse (BOM, dependencyManagement, plataformas Gradle). Modularizar prematuramente aumenta complejidad sin beneficio.

**Modelo mental.** Multi-módulo es dividir una casa en departamentos con contratos claros, no levantar muros al azar.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-8-multi/domain/src/main/java ~/academia-java/modulo-8-multi/app/src/main/java
cd ~/academia-java/modulo-8-multi
```

Maven (`pom.xml` padre):

```xml
<modules>
  <module>domain</module>
  <module>api</module>
</modules>
```

Gradle (`settings.gradle.kts`):

```kotlin
rootProject.name = "demo"
include("domain", "api")
```

Dependencia entre módulos (Gradle):

```kotlin
dependencies {
    implementation(project(":domain"))
}
```

**Desglose del código**

- El padre/agregador coordina módulos.
- Cada módulo tiene su propio build y dependencias.
- Las dependencias entre módulos hacen visible la arquitectura.
- Evita dependencias cíclicas: son señal de mal límite.

**Ejecución y salida real**

```bash
mvn -q -DskipTests package
./gradlew build
```

El build compila módulos en orden según dependencias.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Ciclo entre módulos | Límites mal definidos | Extrae contrato común o invierte dependencia |
| Build complejo demasiado pronto | Sobreingeniería | Empieza simple; modulariza cuando duela |
| Versionado inconsistente | Cada módulo con versiones sueltas | Centraliza versiones/BOM/propiedades |

**Verificación rápida**

Crea dos módulos (`domain`, `api`) donde `api` depende de `domain` y verifica que el build falla si inviertes la dependencia sin declararla.

### Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas · Avanzado · 40 min

**Contexto y para qué sirve**

En equipos reales te encontrarás ambos. Saber traducir mentalmente de uno a otro te evita quedarte bloqueado por la herramienta.

**Fundamento técnico y modelo mental**

**Definición formal.** La equivalencia entre build tools no es sintáctica, sino funcional: ambas resuelven dependencias, compilan, prueban, empaquetan y publican. El mapeo correcto es por intención/resultado.

**Contrato / invariantes / reglas.** Un mismo proyecto puede construirse con Maven o Gradle si las dependencias, versiones, layout y plugins/tareas equivalentes están bien definidos. El árbol de dependencias es la fuente para diagnosticar conflictos transitivos. Las opciones de depuración (`mvn -X`, `gradle --info/--scan`) deben usarse con criterio por volumen de salida.

**Modelo mental.** Son dos idiomas distintos para describir el mismo proceso industrial.

**Implementación desde cero**

Usa cualquier proyecto Maven o Gradle existente (por ejemplo `~/academia-java/modulo-8-maven` del Tema 1). Desde la raíz del proyecto:

```bash
# Maven: árbol de dependencias
mvn dependency:tree

# Gradle (en un proyecto Gradle equivalente)
./gradlew dependencies --configuration runtimeClasspath
```

**Desglose del código**

- `dependency:tree`/`dependencies` ayudan a detectar conflictos y versiones transitivas.
- La configuración de Gradle (`runtimeClasspath`, `testRuntimeClasspath`) es más granular.
- Maven es más rígido; eso reduce sorpresas. Gradle es más flexible; eso exige disciplina.

**Ejecución y salida real**

Ambos comandos muestran dependencias directas y transitivas, con formatos distintos.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Conflicto de versiones transitivas | Dos libs traen versiones distintas | Inspecciona árbol y fuerza/alinea versión |
| Plugin/tarea hace “magia” | No entiendes el build script | Ejecuta con `-X`/`--info` o revisa tareas |
| Copias scripts sin entender | Deuda en el build | Documenta el propósito de cada tarea/fase |

**Verificación rápida**

En un proyecto con dependencias, ejecuta el árbol de dependencias en Maven o Gradle y ubica una dependencia transitiva.

## Cierre del módulo

Puedes leer y operar builds en Maven y Gradle, entender scopes, fases/tareas y estructura multi-módulo. El siguiente paso es asegurar calidad: pruebas automatizadas con JUnit y Mockito.
