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

En producción no hay consola interactiva. Necesitas logs con niveles, timestamp, clase e información útil para diagnosticar fallos.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **SLF4J** | Fachada de logging (`LoggerFactory.getLogger`) que desacopla API de implementación. | Escribir código independiente del backend. | Casi siempre en librerías/apps Java. | Acoplarse a implementación concreta. |
| **Logback** | Implementación de logging compatible con SLF4J. | Emitir/rotar/formatear logs. | Apps que usan SLF4J+Logback. | Config por defecto en prod sin revisar. |
| **Logging estructurado** | Logs con campos consistentes (timestamp, nivel, logger, thread, mensaje, contexto). | Buscar/parsear/agregar en observabilidad. | Producción y debugging. | Concatenar strings sin contexto. |
| **Niveles (ERROR/WARN/INFO/DEBUG/TRACE)** | Severidad/verbosidad del evento. | Filtrar señal vs ruido. | ERROR fallo, WARN anómalo, INFO negocio, DEBUG diagnóstico. | Todo en INFO o loggear secretos. |

**Contrato / invariantes / reglas.** Usa placeholders `{}` para evitar concatenación innecesaria. No loggees secretos/PII. Loggear excepción con stack: `logger.error("msg", e)`. Configuración (logback.xml) controla formato, appenders y niveles.

**Implementación desde cero (con dependencias)**

```bash
mkdir -p ~/academia-java/modulo-07 && cd ~/academia-java/modulo-07
curl -L -o slf4j-api.jar https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.16/slf4j-api-2.0.16.jar
curl -L -o logback-classic.jar https://repo1.maven.org/maven2/ch/qos/logback/logback-classic/1.5.16/logback-classic-1.5.16.jar
curl -L -o logback-core.jar https://repo1.maven.org/maven2/ch/qos/logback/logback-core/1.5.16/logback-core-1.5.16.jar
```

`DemoLog.java`:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
public class DemoLog {
    private static final Logger log = LoggerFactory.getLogger(DemoLog.class);
    public static void main(String[] args) {
        String guia = "G-1";
        log.info("Procesando guia {}", guia);
        log.warn("Reintento para guia {}", guia);
        try { Integer.parseInt("x"); }
        catch (Exception e) { log.error("Fallo procesando guia {}", guia, e); }
    }
}
```

**Ejecución y salida real (varía por patrón)**

```bash
javac -cp ".:slf4j-api.jar:logback-classic.jar:logback-core.jar" DemoLog.java
java -cp ".:slf4j-api.jar:logback-classic.jar:logback-core.jar" DemoLog
```

```text
... INFO  DemoLog - Procesando guia G-1
... WARN  DemoLog - Reintento para guia G-1
... ERROR DemoLog - Fallo procesando guia G-1
java.lang.NumberFormatException: For input string: "x"
  ...
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| No aparecen logs | Falta binding/config | Agrega logback-classic/core o configura nivel |
| Log ilegible | Mensajes sin contexto | Incluye IDs/estado con `{}` |
| Secreto en logs | Loggeaste datos sensibles | Redacta/omite |

**Verificación rápida:** cambia nivel a DEBUG en `logback.xml` y observa diferencia.


### Tema 2: MDC — contexto por request/hilo · Intermedio · 35 min

**Caso guía**

Con muchas requests concurrentes, logs se mezclan. Necesitas `requestId` en cada línea para reconstruir la historia de una solicitud.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **MDC (Mapped Diagnostic Context)** | Mapa de contexto por hilo asociado al logging. | Adjuntar IDs de correlación a logs. | Requests, jobs, mensajes. | No limpiar MDC (`remove/clear`). |
| **Contexto por request/hilo** | Valores contextuales (requestId, userId) vigentes durante una ejecución. | Trazabilidad. | Entrada/salida de request o tarea. | Fuga de contexto en pool de hilos. |
| **Propagación/limpieza** | Establecer al iniciar y limpiar en `finally`. | Evitar contaminación entre requests. | Siempre. | Asumir que el hilo “se limpia solo”. |
| **Patrón de log** | Formato que incluye `%X{clave}`. | Hacer visible el MDC. | Config Logback. | Poner MDC pero no incluirlo en pattern. |

**Contrato / invariantes / reglas.** MDC es por hilo; en pools, el hilo se reutiliza: limpia en `finally`. En async, propaga contexto explícitamente. No metas PII sensible.

**Implementación desde cero (con SLF4J/Logback)**

`DemoMdc.java`:

```java
import org.slf4j.*;
public class DemoMdc {
    private static final Logger log = LoggerFactory.getLogger(DemoMdc.class);
    public static void main(String[] args) {
        String requestId = "req-123";
        org.slf4j.MDC.put("requestId", requestId);
        try {
            log.info("Inicio request");
            log.info("Consultando datos");
        } finally {
            org.slf4j.MDC.remove("requestId"); // evitar fuga
        }
    }
}
```

`logback.xml` (fragmento de patrón):

```xml
<pattern>%d %level [%thread] [%X{requestId}] %logger - %msg%n</pattern>
```

**Ejecución y salida real (con patrón adecuado)**

```text
... INFO [main] [req-123] DemoMdc - Inicio request
... INFO [main] [req-123] DemoMdc - Consultando datos
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| requestId aparece en otra request | No limpiaste MDC en pool | `finally { MDC.remove(...) }` |
| No se ve requestId | Patrón no incluye `%X{requestId}` | Ajusta logback.xml |
| Contexto perdido en async | Cambio de hilo | Propaga MDC al ejecutar tarea |

**Verificación rápida:** ejecuta dos requests simuladas y confirma que cada una loggea su propio ID.


### Tema 3: Depuración y stack traces · Básico · 30 min

**Caso guía**

Un job falla con `NullPointerException`. Necesitas leer el stack trace, identificar la línea/causa raíz y corregir el contrato.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Depuración** | Proceso sistemático de reproducir, aislar, diagnosticar y corregir un defecto. | Resolver causa raíz, no síntoma. | Ante fallos o comportamiento inesperado. | Cambiar código al azar. |
| **Stack trace** | Traza de llamadas que muestra dónde se lanzó la excepción y su cadena de causas. | Localizar origen del fallo. | Al analizar excepciones. | Leer solo el mensaje final. |
| **Causa raíz vs síntoma** | Causa raíz es el origen real; síntoma es la manifestación. | Evitar parches frágiles. | Análisis de bugs. | Capturar excepción y seguir con estado corrupto. |
| **Reproducción mínima** | Caso pequeño que dispara el fallo consistentemente. | Acelerar diagnóstico. | Antes de corregir. | Depurar sin input/estado conocido. |

**Contrato / invariantes / reglas.** Lee de arriba hacia abajo hasta la primera línea de tu código: ahí suele estar el punto de fallo; revisa "Caused by" para la causa raíz. En producción usa logger con excepción, no solo `printStackTrace`. Corrige definiendo contrato (null permitido o no).

**Modelo mental.** Stack trace = migas de pan hacia atrás; causa raíz = dónde empezó a romperse, no donde explotó al final.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-07-debug && cd ~/academia-java/modulo-07-debug
```

`DemoDebug.java`:

```java
public class DemoDebug {
    static String normalizar(String texto) { return texto.trim().toLowerCase(); }
    public static void main(String[] args) {
        String[] valores = {" Ada ", null};
        for (String v : valores) {
            try { System.out.println(normalizar(v)); }
            catch (Exception e) {
                System.out.println("Fallo con valor=" + v);
                e.printStackTrace(System.out);
            }
        }
    }
}
```

**Ejecución y salida real**

```bash
javac DemoDebug.java
java DemoDebug
```

```text
ada
Fallo con valor=null
java.lang.NullPointerException: Cannot invoke "String.trim()" because "texto" is null
    at DemoDebug.normalizar(DemoDebug.java:2)
    at DemoDebug.main(DemoDebug.java:7)
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Lees solo el final | Te perdiste la causa | Busca primera línea de tu código y `Caused by` |
| Parche sin contrato | No definiste si null es válido | Decide contrato y valida |
| No puedes reproducir | Falta contexto | Loggea inputs/estado |

**Verificación rápida:** maneja `null` en `normalizar` (rechazar con `IllegalArgumentException` o devolver default) y define el comportamiento esperado.


## Cierre del módulo

El logging te da visibilidad; la depuración te da método. Con SLF4J, MDC y lectura de stack traces puedes diagnosticar fallos sin adivinar. En el siguiente módulo verás cómo construir y empaquetar proyectos con Maven y Gradle.
