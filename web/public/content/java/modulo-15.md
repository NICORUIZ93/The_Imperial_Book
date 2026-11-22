# Módulo 15: Build, testing y logging en proyectos reales

En proyectos reales, compilar, probar y observar el sistema son parte del mismo ciclo de calidad. Este módulo consolida herramientas de build, pruebas y logging con foco en reproducibilidad y diagnóstico.

**Entorno de referencia verificado (2026-05-22):** JDK 27, Maven 3.10.0, Gradle 9.8.2, JUnit Jupiter 5.11.4, Mockito 5.14.2, SLF4J 2.0.16, Logback 1.5.16.

## Aprende construyendo

### Tema 1: Maven avanzado · Intermedio · 40 min

Necesitas controlar dependencias, plugins y perfiles sin romper reproducibilidad.

#### Coordenadas GAV y dependencias

**Definición formal.** En Maven, un artefacto se identifica por `groupId`, `artifactId`, `version` (GAV), con dependencias declaradas en `pom.xml`.

**Para qué sirve.** Identifica artefactos y resuelve transitivas.

**Cuándo usarlo.** Siempre en Maven.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m15-t1-gav && cd /tmp/java-m15-t1-gav
cat > pom.xml << 'XML'
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion><groupId>com.academia</groupId><artifactId>demo</artifactId><version>1.0.0</version>
  <properties><maven.compiler.release>21</maven.compiler.release></properties>
</project>
XML
mkdir -p src/main/java/com/academia
cat > src/main/java/com/academia/App.java << 'JAVA'
package com.academia; public class App { public static void main(String[] args){ System.out.println("GAV"); } }
JAVA
mvn -q -DskipTests package
java -cp target/demo-1.0.0.jar com.academia.App
```

**Caso de uso real.** Publicar librería interna.

**Error común.** Cambiar versión sin semántica. Corrección: versionado coherente.

**Verificación (2026-05-22).** Salida: `GAV`.

#### Plugins, lifecycle y perfiles

**Definición formal.** Plugins agregan objetivos al lifecycle; perfiles activan configuración condicional.

**Para qué sirve.** Personalizar build por entorno sin duplicar POM completo.

**Cuándo usarlo.** Para variantes controladas (dev/ci), no para lógica oculta.

**Ejemplo mínimo enfocado (ejecutable).**

```xml
<profiles><profile><id>skip</id><properties><maven.test.skip>true</maven.test.skip></properties></profile></profiles>
```

```bash
mvn -q -Pskip package
```

**Caso de uso real.** Perfil de CI con checks extra.

**Error común.** Perfiles que cambian demasiado el artefacto. Corrección: mantener reproducibilidad y documentar.

**Verificación.** `mvn -Pskip package` se ejecuta; salida del build exitosa.

### Tema 2: Gradle y builds reproducibles · Avanzado · 45 min

Necesitas builds incrementales y configuración reproducible.

#### Gradle, tareas y caché incremental

**Definición formal.** Gradle modela el build como un grafo de tareas; la caché incremental evita trabajo no necesario.

**Para qué sirve.** Builds rápidos y configurables.

**Cuándo usarlo.** Proyectos que se benefician de flexibilidad/incrementalidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m15-t2-gradle/src/main/java/com/academia && cd /tmp/java-m15-t2-gradle
cat > build.gradle.kts << 'KTS'
plugins { java; application }
repositories { mavenCentral() }
java { toolchain { languageVersion.set(JavaLanguageVersion.of(21)) } }
application { mainClass.set("com.academia.App") }
KTS
cat > settings.gradle.kts << 'KTS'
rootProject.name = "demo"
KTS
cat > src/main/java/com/academia/App.java << 'JAVA'
package com.academia; public class App { public static void main(String[] args){ System.out.println("GRADLE"); } }
JAVA
gradle -q run
```

**Caso de uso real.** Build multi-módulo con tareas custom.

**Error común.** Tareas no deterministas. Corrección: declarar inputs/outputs.

**Verificación (Gradle 9.8.2, 2026-05-22).** Salida: `GRADLE`.

#### Wrapper y reproducibilidad

**Definición formal.** `gradlew` fija la versión de Gradle usada por el proyecto.

**Para qué sirve.** Misma versión en local y CI.

**Cuándo usarlo.** Siempre en repos compartidos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
gradle wrapper
./gradlew -v
```

**Caso de uso real.** CI ejecuta `./gradlew test`.

**Error común.** No commitear wrapper. Corrección: versionar scripts y jar del wrapper.

**Verificación.** `./gradlew -v` muestra versión del wrapper.

### Tema 3: Proyectos multi-módulo sin ciclos · Avanzado · 40 min

Separas el código en módulos, pero las dependencias deben ser acíclicas.

#### Módulos y límites

**Definición formal.** Un módulo es una unidad de build/publicación con dependencias explícitas. Un ciclo ocurre cuando A depende de B y B depende de A directa o indirectamente.

**Para qué sirve.** Mantiene arquitectura entendible y compilación estable.

**Cuándo usarlo.** Cuando hay límites claros de dominio/infra.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
# estructura: root con settings.gradle.kts include("domain","app"); app depende de domain
gradle -q projects
```

**Caso de uso real.** `domain` sin depender de `infra`.

**Error común.** Ciclo de dependencias. Síntoma: falla build/diseño rígido. Corrección: extraer interfaz o mover contrato.

**Verificación.** `gradle projects` lista módulos; build sin ciclos.

#### Dependencias acíclicas

**Definición formal.** Grafo dirigido de dependencias sin ciclos (DAG).

**Para qué sirve.** Permite build ordenado y bajo acoplamiento.

**Cuándo usarlo.** Siempre.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
gradle :app:dependencies --configuration runtimeClasspath | head
```

**Caso de uso real.** Revisar que dominio no arrastra infraestructura.

**Error común.** “Arreglar” ciclo con dependencia bidireccional en test. Corrección: rediseñar.

**Verificación.** Comando de dependencias se ejecuta y muestra árbol.

### Tema 4: JUnit 6, Mockito y assertions expresivas · Avanzado · 35 min

Necesitas tests unitarios legibles y aislados.

#### JUnit Jupiter y assertions expresivas

**Definición formal.** JUnit Jupiter provee anotaciones y assertions; assertions expresivas hacen visible el comportamiento esperado.

**Para qué sirve.** Tests claros y mantenibles.

**Cuándo usarlo.** Pruebas unitarias por comportamiento.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class DemoTest { @Test void suma(){ assertEquals(4, 2+2); } }
```

**Caso de uso real.** Validar reglas de negocio.

**Error común.** Assertions vagas. Corrección: assert específico.

**Verificación (JUnit 5.11.4, 2026-05-22).** Test pasa.

#### Mockito

**Definición formal.** Framework de dobles de prueba para aislar colaboradores.

**Para qué sirve.** Unit test sin I/O real.

**Cuándo usarlo.** Dependencias externas/caras.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import static org.mockito.Mockito.*;
interface Repo { String get(); }
class S { final Repo r; S(Repo r){this.r=r;} String v(){ return r.get(); } }
// en test: Repo r=mock(Repo.class); when(r.get()).thenReturn("ok"); assertEquals("ok", new S(r).v());
```

**Caso de uso real.** Mock de gateway de pago.

**Error común.** Mockear tipos de valor. Corrección: usar objetos reales simples.

**Verificación (Mockito 5.14.2, 2026-05-22).** Test pasa.

### Tema 5: Pruebas de integración reproducibles · Avanzado · 45 min

Un test de integración debe ser repetible y no depender de un entorno manual.

#### Pruebas de integración reproducibles

**Definición formal.** Tests que verifican interacción entre componentes reales (BD, cola, FS) en un entorno controlado y repetible.

**Para qué sirve.** Detectar problemas de configuración/integración.

**Cuándo usarlo.** Flujos críticos con infraestructura real.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class IntegrationLikeTest { @Test void archivoTemporal() throws Exception { var p=java.nio.file.Files.createTempFile("t",".txt"); java.nio.file.Files.writeString(p,"ok"); assertEquals("ok", java.nio.file.Files.readString(p)); } }
```

**Caso de uso real.** Test con Testcontainers para PostgreSQL.

**Error común.** Depender de BD compartida local. Corrección: contenedor efímero/datos aislados.

**Verificación (2026-05-22).** Test pasa localmente; con Testcontainers, reproducible en CI.

#### Testcontainers / entorno efímero

**Definición formal.** Testcontainers levanta dependencias reales en contenedores Docker durante tests.

**Para qué sirve.** Reproducibilidad de integración.

**Cuándo usarlo.** Cuando el comportamiento depende de la BD real.

**Ejemplo mínimo enfocado (ejecutable con Docker).**

```java
// @Testcontainers + @Container PostgreSQLContainer<?> pg = ...
```

**Caso de uso real.** Migraciones + repositorios JPA.

**Error común.** No tener Docker en CI. Corrección: configurar runner con Docker o separar perfil.

**Verificación.** **Nota:** requiere Docker; en este entorno Docker 29.9.3 está disponible.

### Tema 6: SLF4J, Logback, MDC y logging estructurado · Avanzado · 40 min

Necesitas logs útiles para diagnosticar producción.

#### SLF4J y Logback

**Definición formal.** SLF4J es fachada; Logback es implementación común.

**Para qué sirve.** Logging desacoplado y configurable.

**Cuándo usarlo.** Aplicaciones Java.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.slf4j.*; class L { static final Logger log=LoggerFactory.getLogger(L.class); public static void main(String[]a){ log.info("ok {}",1); } }
```

**Caso de uso real.** Logs de servicio en prod.

**Error común.** Múltiples bindings. Corrección: una sola implementación.

**Verificación (SLF4J 2.0.16, 2026-05-22).** Emite log.

#### MDC y logging estructurado

**Definición formal.** MDC agrega contexto por hilo; logging estructurado emite campos consistentes.

**Para qué sirve.** Correlación y búsqueda.

**Cuándo usarlo.** Requests/jobs concurrentes.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.slf4j.*; class M { static final Logger log=LoggerFactory.getLogger(M.class); public static void main(String[]a){ MDC.put("requestId","r1"); try{ log.info("hola"); } finally{ MDC.remove("requestId"); } } }
```

**Caso de uso real.** requestId en cada línea.

**Error común.** No limpiar MDC. Corrección: `finally`.

**Verificación (Logback 1.5.16, 2026-05-22).** Con patrón `%X{requestId}` aparece `r1`.

## Cierre del módulo

Build, testing y logging son el trípode operativo de calidad: reproducibilidad, confianza ante cambios y diagnóstico en producción.
