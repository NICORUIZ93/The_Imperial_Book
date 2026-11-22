# Módulo 15: Build, testing y observabilidad

Un proyecto profesional no se define solo por compilar: debe construirse de forma reproducible, probarse en varios niveles y dejar evidencia observable cuando falla. Este módulo cubre Maven/Gradle avanzado, estructura multi-módulo, tests con JUnit/Mockito, integración reproducible y logging estructurado.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Configurar Maven con ciclo de vida, scopes y perfiles |
| 2 | Usar Gradle con tareas, configuraciones y reproducibilidad |
| 3 | Diseñar multi-módulo sin ciclos y con límites claros |
| 4 | Escribir tests unitarios expresivos con JUnit/Mockito |
| 5 | Diseñar pruebas de integración reproducibles |
| 6 | Implementar logging estructurado con SLF4J/Logback/MDC |

## Aprende construyendo

### Tema 1: Maven avanzado · Intermedio · 40 min

**Caso guía**

Tu proyecto compila localmente, pero en CI falla por versiones de plugin, dependencias mal scoped o perfiles no controlados. Necesitas un `pom.xml` que exprese el build con precisión.

**Fundamento técnico y modelo mental**

**Definición formal.** Maven es una herramienta de build basada en el Project Object Model (POM). El POM declara coordenadas, dependencias, plugins, propiedades y perfiles. El ciclo de vida estándar (`validate`, `compile`, `test`, `package`, `verify`, `install`, `deploy`) define fases donde los goals de plugins se enlazan.

**Contrato / invariantes / reglas.** Los plugins deben tener versión fijada para reproducibilidad. Los scopes (`compile`, `provided`, `runtime`, `test`) controlan el classpath. Los perfiles modifican configuración bajo condiciones; deben ser explícitos y auditables. `dependencyManagement` centraliza versiones; no agrega dependencia por sí sola. El build debe ser ejecutable por `./mvnw clean verify`.

**Modelo mental.** El POM es el contrato de construcción: declara qué entra, qué se ejecuta y en qué fase.

**Implementación desde cero**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId>
  <artifactId>demo-build</artifactId>
  <version>1.0.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>5.11.0</junit.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.0</version>
      </plugin>
    </plugins>
  </build>
</project>
```

**Desglose del código**

- `maven.compiler.release` fija el bytecode/API objetivo.
- La dependencia JUnit está en `test`: no contamina runtime.
- `maven-surefire-plugin` con versión fijada da reproducibilidad.
- `clean verify` es el comando de verificación estándar en CI.

**Ejecución y salida real**

```bash
./mvnw clean verify
```

Salida esperada:

```text
[INFO] BUILD SUCCESS
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Build distinto en CI | Plugin sin versión o dependencia flotante | Fija versiones y usa wrapper |
| JAR incluye dependencias de test | Scope incorrecto | Usa `scope test` |
| Perfil activa comportamiento oculto | Perfil poco documentado | Documenta activación y propósito |

**Verificación rápida**

Ejecuta `./mvnw -q help:effective-pom` y verifica versiones efectivas de plugins/dependencias.

### Tema 2: Gradle y builds reproducibles · Avanzado · 45 min

**Caso guía**

Un equipo usa Gradle y quiere builds rápidos pero reproducibles. Alguien agrega una tarea con efectos no declarados y el cache produce resultados sospechosos.

**Fundamento técnico y modelo mental**

**Definición formal.** Gradle es una herramienta de build basada en un DAG de tareas. Cada tarea declara entradas, salidas y acciones; con esa metadata, Gradle puede aplicar up-to-date checks, build cache e incrementalidad.

**Contrato / invariantes / reglas.** La reproducibilidad requiere wrappers, versiones fijadas, toolchains declaradas y tareas con entradas/salidas bien definidas. Una tarea sin declarar inputs/outputs rompe el modelo de up-to-date/caching. Las dependencias se declaran por configuración (`implementation`, `testImplementation`, etc.). La configuración debe ser determinista: no depender de tiempo, red o entorno no declarado sin invalidación.

**Modelo mental.** Una tarea Gradle es una función pura ideal: mismas entradas declaradas -> mismas salidas. Si oculta entradas, el cache miente.

**Implementación desde cero**

```kotlin
plugins {
    java
}

group = "com.academia"
version = "1.0.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}
```

**Desglose del código**

- `toolchain` fija la versión de Java para compilación/tests.
- `repositories` y versiones explícitas hacen resoluble el build.
- `useJUnitPlatform()` habilita JUnit Jupiter.
- El wrapper `gradlew` debe versionarse.

**Ejecución y salida real**

```bash
./gradlew clean build
```

Salida esperada:

```text
BUILD SUCCESSFUL
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Tarea cacheada incorrectamente | Inputs/outputs no declarados | Declara entradas/salidas |
| Build no reproducible | Versión de Java o dependencias flotantes | Fija toolchain y versiones |
| Tests JUnit 5 no corren | Falta `useJUnitPlatform()` | Configura la tarea test |

**Verificación rápida**

Ejecuta `./gradlew --version` y `./gradlew clean test` desde el wrapper del proyecto.

### Tema 3: Proyectos multi-módulo sin ciclos · Avanzado · 40 min

**Caso guía**

Separas `domain`, `application` e `infrastructure`. Al poco tiempo `domain` importa una clase de `infrastructure` y se crea un ciclo. El build se vuelve frágil y los cambios se propagan.

**Fundamento técnico y modelo mental**

**Definición formal.** Un proyecto multi-módulo divide el sistema en artefactos/módulos con límites explícitos. Una *dependencia acíclica* significa que el grafo de dependencias entre módulos no tiene ciclos. Los límites se modelan por contratos (interfaces, DTOs, puertos).

**Contrato / invariantes / reglas.** El dominio debe ser estable y con pocas dependencias externas. La dirección de dependencia debe ser deliberada (por ejemplo, infraestructura depende de aplicación/dominio, no al revés). Los ciclos impiden compilación ordenada, dificultan pruebas y señalan acoplamiento. Un módulo debe tener una razón de cambio clara; separar por carpetas sin controlar dependencias no es modularidad real.

**Modelo mental.** Los módulos son órganos con funciones: pueden colaborar, pero si todos dependen de todos, el sistema pierde estructura.

**Implementación desde cero**

Maven parent (resumen):

```xml
<modules>
  <module>domain</module>
  <module>application</module>
  <module>infrastructure</module>
</modules>
```

Regla de dependencia (conceptual):

```text
infrastructure -> application -> domain
```

Ejemplo de contrato en `domain`:

```java
public interface GuiaRepository {
    void guardar(String guia);
}
```

Implementación en `infrastructure`:

```java
public class GuiaRepositoryMemoria implements GuiaRepository {
    public void guardar(String guia) { System.out.println(guia); }
}
```

**Desglose del código**

- `GuiaRepository` en dominio/aplicación define el puerto.
- La implementación concreta vive en infraestructura.
- El grafo debe permanecer acíclico; se verifica con revisión y herramientas de build/análisis.
- Si dos módulos se necesitan mutuamente, extrae contrato común.

**Ejecución y salida real**

```bash
./mvnw -q -DskipTests package
```

Build exitoso indica que no hay ciclos de compilación en la estructura declarada.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Ciclo entre módulos | Límites mal definidos | Extrae interfaz/contrato o mueve responsabilidad |
| Dominio depende de framework | Fuga de infraestructura | Invierte dependencia con puerto |
| Módulos por moda | Sin razón de cambio clara | Empieza simple; modulariza cuando duela |

**Verificación rápida**

Dibuja el grafo de dependencias de módulos y confirma que sea un DAG.

### Tema 4: JUnit 6, Mockito y assertions expresivas · Avanzado · 35 min

**Caso guía**

Una regla de negocio falla en producción. El bug podría haberse detectado con un test unitario rápido, aislado y legible. Necesitas tests que fallen con mensajes útiles y no dependan de infraestructura.

**Fundamento técnico y modelo mental**

**Definición formal.** Una prueba unitaria verifica una unidad pequeña de comportamiento en aislamiento. JUnit Jupiter provee el modelo de test; Mockito permite crear dobles para dependencias. Una aserción expresiva verifica el resultado observable relevante.

**Contrato / invariantes / reglas.** El test debe ser determinista, rápido y aislado. Se mockean dependencias lentas/externas/no deterministas, no el valor bajo prueba. `verify` se usa para interacciones relevantes; exceso de verificación acopla a implementación. Los nombres de tests deben describir comportamiento. Arrange-Act-Assert ayuda a legibilidad, pero no es dogma.

**Modelo mental.** Un test unitario es una lupa sobre una pieza: si la pieza falla, debe ser obvio por qué, sin levantar todo el sistema.

**Implementación desde cero**

Ejemplo con JUnit 5/6 + Mockito (dependencias externas):

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

interface EmailClient { void send(String to, String body); }

class Notifier {
    private final EmailClient email;
    Notifier(EmailClient email) { this.email = email; }
    void avisar(String to) {
        if (to == null || to.isBlank()) throw new IllegalArgumentException("to requerido");
        email.send(to, "Hola");
    }
}

class NotifierTest {
    @Test
    void enviaEmail() {
        EmailClient email = mock(EmailClient.class);
        new Notifier(email).avisar("ada@example.com");
        verify(email).send("ada@example.com", "Hola");
    }

    @Test
    void rechazaDestinoVacio() {
        EmailClient email = mock(EmailClient.class);
        assertThrows(IllegalArgumentException.class, () -> new Notifier(email).avisar(""));
        verifyNoInteractions(email);
    }
}
```

**Desglose del código**

- `mock` crea el doble de `EmailClient`.
- `assertThrows` verifica el contrato de error.
- `verifyNoInteractions` garantiza que no hubo efecto lateral.
- El SUT (`Notifier`) es real; la dependencia es simulada.

**Ejecución y salida real**

```bash
./mvnw test
# o
./gradlew test
```

Salida esperada: tests ejecutados con 0 fallos.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Test frágil | Verifica detalles internos | Verifica comportamiento observable |
| Mock de todo | Diseño acoplado o test mal enfocado | Usa objetos reales cuando sean simples |
| Test no determinista | Tiempo/red/estado global | Aísla y controla dependencias |

**Verificación rápida**

Rompe la condición de validación en `avisar`; el test `rechazaDestinoVacio` debe fallar.

### Tema 5: Pruebas de integración reproducibles · Avanzado · 45 min

**Caso guía**

Tu test unitario pasa, pero en producción falla porque la consulta SQL real o la configuración del contenedor es distinta. Necesitas pruebas de integración reproducibles.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *prueba de integración* verifica la interacción entre componentes reales o casi reales (DB, colas, HTTP, filesystem). *Reproducible* significa que el entorno de prueba se puede crear de forma controlada y determinista en cualquier máquina/CI.

**Contrato / invariantes / reglas.** La integración debe aislar dependencias externas inestables: usar contenedores efímeros (Testcontainers), bases en memoria cuando el comportamiento sea equivalente, o fixtures controladas. Los tests no deben depender de estado compartido entre ejecuciones. Deben limpiar datos o usar bases efímeras. El costo es mayor que unit tests: se ejecutan en menor cantidad y con foco en contratos críticos.

**Modelo mental.** El unit test prueba la pieza; la integración prueba el ensamblaje en un banco de pruebas controlado.

**Implementación desde cero**

Ejemplo conceptual con Testcontainers (dependencia externa):

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.testcontainers.containers.PostgreSQLContainer;

class RepoIntegracionTest {
    @Test
    void guardaYLee() {
        try (var postgres = new PostgreSQLContainer<>("postgres:16-alpine")) {
            postgres.start();
            String jdbc = postgres.getJdbcUrl();
            assertTrue(jdbc.startsWith("jdbc:postgresql://"));
            // aquí abrirías conexión, crearías esquema y probarías el repo real
        }
    }
}
```

**Desglose del código**

- El contenedor crea una DB real efímera para el test.
- `start()` levanta el entorno; el `try-with-resources` lo destruye.
- El test valida integración con el motor real, no con un mock.
- El entorno es reproducible en CI si hay Docker disponible.

**Ejecución y salida real**

```bash
./mvnw -Dtest=RepoIntegracionTest test
```

Requiere Docker/Testcontainers. Si no están disponibles, el test debe marcarse/gestionarse según política del proyecto.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Test pasa local y falla en CI | Docker/entorno ausente | Documenta prerrequisitos y usa pipeline compatible |
| Tests lentos y frágiles | Demasiadas integraciones innecesarias | Mantén pirámide de tests: más unit, menos integración |
| Estado compartido entre tests | No limpias datos | Usa contenedores efímeros/transacciones/fixtures |

**Verificación rápida**

Ejecuta el test dos veces seguidas: debe dar el mismo resultado sin preparación manual.

### Tema 6: SLF4J, Logback, MDC y logging estructurado · Avanzado · 40 min

**Caso guía**

En producción hay un error intermitente. Los logs dicen “error al procesar” pero no identifican request, usuario ni operación. Necesitas logs estructurados y correlacionables.

**Fundamento técnico y modelo mental**

**Definición formal.** SLF4J es una fachada de logging; Logback es una implementación común. El *logging estructurado* emite eventos con campos consistentes (nivel, timestamp, logger, mensaje, contexto). MDC (Mapped Diagnostic Context) agrega contexto por hilo/ejecución.

**Contrato / invariantes / reglas.** Loggear por niveles apropiados (`ERROR` para fallos accionables, `WARN` para anomalías recuperables, `INFO` para eventos de negocio, `DEBUG` para diagnóstico). No loggear secretos, tokens o PII sensible. Incluir excepción en el log de error (`log.error("...", e)`). Limpiar MDC en `finally`. El formato estructurado (JSON o key-value) facilita consulta en agregadores.

**Modelo mental.** Un buen log es una caja negra: no graba todo, graba lo necesario para reconstruir el evento.

**Implementación desde cero**

> **Nota:** requiere dependencias `org.slf4j:slf4j-api` y un backend como `ch.qos.logback:logback-classic`.

Ejemplo con SLF4J/Logback (dependencias externas):

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public class DemoLog {
    private static final Logger log = LoggerFactory.getLogger(DemoLog.class);

    static void procesar(String requestId, String guia) {
        MDC.put("requestId", requestId);
        try {
            log.info("procesando guia={}", guia);
            if (guia.isBlank()) throw new IllegalArgumentException("guia vacia");
            log.info("ok guia={}", guia);
        } catch (Exception e) {
            log.error("fallo guia={}", guia, e);
        } finally {
            MDC.remove("requestId");
        }
    }

    public static void main(String[] args) {
        procesar("req-1", "G-1");
        procesar("req-2", "");
    }
}
```

**Desglose del código**

- `LoggerFactory.getLogger` crea logger por clase.
- `{}` evita concatenación innecesaria.
- `MDC` agrega `requestId` a todos los logs del hilo.
- `finally` limpia MDC para evitar fuga de contexto.

**Ejecución y salida real**

Con Logback configurado:

```text
INFO ... [req-1] procesando guia=G-1
INFO ... [req-1] ok guia=G-1
INFO ... [req-2] procesando guia=
ERROR ... [req-2] fallo guia=
java.lang.IllegalArgumentException: guia vacia
```

El formato depende del patrón/appender.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Logs inútiles | Mensajes vagos sin contexto | Agrega campos de negocio y MDC |
| Fuga de contexto | No limpias MDC | Usa `finally { MDC.remove(...) }` |
| Logs ruidosos/caros | Nivel o volumen mal calibrado | Ajusta niveles y muestreo |

**Verificación rápida**

Configura el patrón para incluir `%X{requestId}` y verifica que aparezca en cada evento del request.

## Cierre del módulo

Build, tests y observabilidad son el sistema inmunológico del proyecto: detectan regresiones, garantizan reproducibilidad y dejan evidencia diagnóstica. En el siguiente módulo pasarás a Spring Boot para construir servicios web sobre estas bases.
