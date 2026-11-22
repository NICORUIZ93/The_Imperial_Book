# Módulo 7: Logging y depuración

Cuando un programa falla en producción, `System.out.println` no alcanza: no tiene niveles, no tiene contexto, no se puede filtrar ni enrutar. El logging estructurado y una depuración metódica permiten entender qué pasó, cuándo y por qué. Este módulo cubre SLF4J/Logback, MDC y técnicas prácticas de depuración.

## Setup ejecutable del módulo

Desde carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-07/src/main/java
mkdir -p ~/academia-java/modulo-07/src/main/resources
cd ~/academia-java/modulo-07
```

`pom.xml` mínimo:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId>
  <artifactId>modulo-07</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>ch.qos.logback</groupId>
      <artifactId>logback-classic</artifactId>
      <version>1.5.18</version>
    </dependency>
  </dependencies>
</project>
```

`logback-classic` trae `slf4j-api`. Crea `src/main/resources/logback.xml`:

```xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss} %-5level [%X{requestId}] %logger{36} - %msg%n%ex</pattern>
    </encoder>
  </appender>
  <root level="INFO">
    <appender-ref ref="STDOUT"/>
  </root>
</configuration>
```

Ejecuta ejemplos con:

```bash
mvn -q -DskipTests compile exec:java -Dexec.mainClass=DemoLogging
```

> **Alternativa sin Maven:** descarga `slf4j-api`, `logback-classic`, `logback-core` jars y compila/ejecuta con `javac -cp "...jars..."` y `java -cp ".:...jars..."`. Maven es la opción reproducible recomendada.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Usar SLF4J con niveles y placeholders correctamente |
| 2 | Agregar contexto con MDC para rastrear solicitudes |
| 3 | Depurar fallos con stack traces, breakpoints y reproducibilidad |

## Aprende construyendo

### Tema 1: SLF4J y Logback — logging estructurado · Intermedio · 40 min

**Caso guía**

Tu aplicación procesa guías. En desarrollo usabas `println`, pero en producción necesitas saber si un mensaje es información, advertencia o error, y poder activarlo por nivel sin recompilar.

**Fundamento técnico y modelo mental**

**Definición formal.** SLF4J (Simple Logging Facade for Java) es una fachada (abstracción) de logging; Logback es una implementación de backend. Un *logger* emite eventos con nivel, mensaje, metadatos y opcionalmente una excepción.

**Contrato / invariantes / reglas.** El código debe depender de la API de la fachada (`org.slf4j.Logger`) y no del backend concreto. Los niveles (`TRACE < DEBUG < INFO < WARN < ERROR`) filtran eventos según configuración. El placeholder `{}` delega el formateo al backend, evitando concatenación innecesaria cuando el nivel está deshabilitado. Registrar excepciones debe incluir el `Throwable` como último argumento para preservar stack trace. No se deben registrar secretos/PII sin política de redacción.

**Modelo mental.** SLF4J es el tomacorriente estándar; Logback es el aparato conectado. Cambias el aparato sin cambiar la instalación.

**Implementación desde cero**

Usa el proyecto Maven del setup del módulo (`~/academia-java/modulo-07`). Si no lo creaste, vuelve a **Setup ejecutable del módulo**.

Crea `src/main/java/DemoLogging.java` (en el proyecto del setup):

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DemoLogging {
    private static final Logger log = LoggerFactory.getLogger(DemoLogging.class);

    public static void main(String[] args) {
        String guia = "G-1";
        log.info("Procesando guia {}", guia);
        log.debug("Detalle interno guia={}", guia);
        try {
            int x = Integer.parseInt("NO");
        } catch (NumberFormatException e) {
            log.error("Error procesando guia {}", guia, e);
        }
    }
}
```

**Desglose del código**

- `LoggerFactory.getLogger(...)` crea un logger por clase.
- `log.info("... {}", guia)` pasa el valor como argumento; SLF4J lo interpola si el nivel aplica.
- `log.error(..., e)` incluye la excepción y su stack trace en el log.
- No loguees secretos, tokens o datos sensibles.

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile exec:java -Dexec.mainClass=DemoLogging
```

Salida esperada (formato depende de `logback.xml`; DEBUG no aparece porque root está en INFO):

```text
12:00:00 INFO  [] DemoLogging - Procesando guia G-1
12:00:00 ERROR [] DemoLogging - Error procesando guia G-1
java.lang.NumberFormatException: For input string: "NO"
	at java.base/java.lang.Integer.parseInt(Integer.java:...)
	...
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `No SLF4J providers were found` | Falta backend en classpath | Agrega `logback-classic` o `slf4j-simple` |
| Logs duplicados | Configuración de appenders/loggers mal armada | Revisa additivity y appenders |
| Concatenas strings costosas | `"a"+obj` en debug | Usa placeholders `{}` |

**Verificación rápida**

Ejecuta con un backend SLF4J en classpath y verifica que el nivel INFO aparece y DEBUG puede activarse por configuración.

### Tema 2: MDC — contexto por request/hilo · Intermedio · 35 min

**Caso guía**

Dos solicitudes se procesan al mismo tiempo. En los logs ves “procesando guía”, pero no sabes a qué request pertenece cada línea. Necesitas un identificador de correlación.

**Fundamento técnico y modelo mental**

**Definición formal.** MDC (Mapped Diagnostic Context) es un mapa clave-valor asociado al contexto de ejecución (típicamente por hilo) que los appenders pueden incluir en cada evento de log.

**Contrato / invariantes / reglas.** Los valores en MDC son visibles para el hilo actual. En pools de hilos o ejecución asíncrona, el contexto debe limpiarse (`remove/clear`) en `finally` y propagarse explícitamente al cruzar límites de hilo. No almacenar objetos grandes o sensibles sin control. El patrón de layout debe incluir `%X{clave}` para emitirlo.

**Modelo mental.** MDC es una etiqueta adhesiva que el hilo lleva puesta mientras procesa una solicitud; todos los logs que emite salen con esa etiqueta.

**Implementación desde cero**

Usa el proyecto Maven del setup del módulo (`~/academia-java/modulo-07`).

Crea `src/main/java/DemoMDC.java` en el mismo proyecto del módulo:

```java
import org.slf4j.*;

public class DemoMDC {
    private static final Logger log = LoggerFactory.getLogger(DemoMDC.class);

    static void procesar(String requestId) {
        MDC.put("requestId", requestId);
        try {
            log.info("inicio");
            log.info("fin");
        } finally {
            MDC.remove("requestId"); // evita fuga en thread pools
        }
    }

    public static void main(String[] args) {
        procesar("req-1");
        procesar("req-2");
    }
}
```

**Desglose del código**

- `MDC.put("requestId", requestId)` agrega contexto al hilo actual.
- El layout de logging debe incluir `%X{requestId}` o equivalente.
- `MDC.remove` en `finally` evita fugas de contexto en pools de hilos.
- El contexto facilita correlacionar logs en sistemas concurrentes.

**Ejecución y salida real**

Usa el `logback.xml` del setup (ya incluye `%X{requestId}`):

```bash
mvn -q -DskipTests compile exec:java -Dexec.mainClass=DemoMDC
```

Salida esperada:

```text
12:00:00 INFO  [req-1] DemoMDC - inicio
12:00:00 INFO  [req-1] DemoMDC - fin
12:00:00 INFO  [req-2] DemoMDC - inicio
12:00:00 INFO  [req-2] DemoMDC - fin
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| requestId aparece en logs de otra request | No limpiaste MDC en pool | Usa `finally { MDC.remove(...) }` |
| MDC vacío | Patrón de log no lo imprime | Configura `%X{requestId}` |
| Contexto perdido en async | El hilo cambió | Propaga MDC al ejecutar tareas |

**Verificación rápida**

Configura el patrón de logging para mostrar `requestId` y verifica que cada bloque de logs queda asociado al ID correcto.

### Tema 3: Depuración y stack traces · Básico · 30 min

**Caso guía**

Un programa lanza `NullPointerException` solo con ciertos datos. Necesitas encontrar la causa raíz, no solo el síntoma.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *stack trace* es la traza de marcos de llamada activos al momento de lanzar una excepción. La *depuración* es el proceso sistemático de reproducir, aislar, diagnosticar y corregir una falla, verificando la corrección con evidencia.

**Contrato / invariantes / reglas.** La excepción reporta tipo, mensaje, stack trace y causa encadenada (`getCause`). El primer marco relevante del código propio suele indicar el punto de fallo; la causa raíz puede estar más abajo o en `Caused by`. Una corrección debe validarse con un caso que reproduzca el fallo y con regresiones. En producción, se prefiere logging estructurado sobre `printStackTrace`.

**Modelo mental.** El stack trace es la migaja de pan hacia atrás: te dice por qué camino llegó el programa hasta caerse.

**Implementación desde cero**

Este tema no requiere dependencias externas, solo JDK. Desde cualquier carpeta:

```bash
mkdir -p ~/academia-java/modulo-07-debug && cd ~/academia-java/modulo-07-debug
```

Crea `DemoDebug.java`:

```java
public class DemoDebug {
    static String normalizar(String texto) {
        return texto.trim().toLowerCase();
    }

    public static void main(String[] args) {
        String[] valores = {" Ada ", null};
        for (String v : valores) {
            try {
                System.out.println(normalizar(v));
            } catch (Exception e) {
                System.out.println("Fallo con valor=" + v);
                e.printStackTrace(System.out);
            }
        }
    }
}
```

**Desglose del código**

- `null.trim()` produce `NullPointerException`.
- El `catch` imprime el valor que causó el fallo; eso hace reproducible el problema.
- `printStackTrace` es útil en ejercicios; en aplicaciones reales usa logger con excepción.
- La corrección puede ser validar `null`, rechazarlo o usar `Optional`, según el contrato.

**Ejecución y salida real**

```text
ada
Fallo con valor=null
java.lang.NullPointerException: Cannot invoke "String.trim()" because "texto" is null
    at DemoDebug.normalizar(...)
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Lees solo el final del stack trace | Te perdiste la causa | Ubica la primera línea de tu código |
| Corriges el síntoma, no la causa | Parche local | Reproduce, identifica contrato y corrige en origen |
| No puedes reproducir | Falta contexto | Registra inputs, estado y entorno |

**Verificación rápida**

```bash
javac DemoDebug.java && java DemoDebug
```

Corrige `normalizar` para manejar `null` explícitamente y define el comportamiento esperado.

## Cierre del módulo

El logging te da visibilidad; la depuración te da método. Con SLF4J, MDC y lectura de stack traces puedes diagnosticar fallos sin adivinar. En el siguiente módulo verás cómo construir y empaquetar proyectos con Maven y Gradle.
