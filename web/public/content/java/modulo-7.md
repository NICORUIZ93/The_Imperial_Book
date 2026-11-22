# Módulo 7: Logging y depuración

Cuando un programa falla en producción, `System.out.println` no alcanza: no tiene niveles, no tiene contexto, no se puede filtrar ni enrutar. El logging estructurado y una depuración metódica permiten entender qué pasó, cuándo y por qué. Este módulo cubre SLF4J/Logback, MDC y técnicas prácticas de depuración.

**Entorno de referencia verificado (2026-05-22):** JDK 27. Ejemplos SLF4J/Logback verificados con `slf4j-api-2.0.16`, `logback-classic-1.5.16`, `logback-core-1.5.16` descargados desde Maven Central.

## Aprende construyendo

### Tema 1: SLF4J y Logback — logging estructurado · Intermedio · 40 min

En producción no hay consola interactiva. Necesitas logs con niveles, timestamp, clase e información útil para diagnosticar fallos.

#### SLF4J

**Definición formal.** SLF4J (Simple Logging Facade for Java) es una fachada de logging: tu código depende de su API (`Logger`, `LoggerFactory`) y una implementación concreta se enlaza en runtime.

**Para qué sirve.** Desacopla el código de aplicación del backend de logging, útil en librerías y aplicaciones.

**Cuándo usarlo y cuándo no.** Úsalo como API de logging en casi todo código Java. No te acoples directamente a una implementación si no es necesario.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m7-t1-slf4j && cd /tmp/java-m7-t1-slf4j
curl -sL -o slf4j-api.jar https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.16/slf4j-api-2.0.16.jar
curl -sL -o slf4j-simple.jar https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/2.0.16/slf4j-simple-2.0.16.jar
```

```java
import org.slf4j.*;
public class DemoSlf4j {
    private static final Logger log = LoggerFactory.getLogger(DemoSlf4j.class);
    public static void main(String[] args) { log.info("hola {}", "Ada"); }
}
```

**Caso de uso real.** Una librería loggea con SLF4J y la app decide Logback/Log4j2.

**Error común.** Incluir varias implementaciones en classpath. Síntoma: warnings o comportamiento impredecible. Corrección: una sola binding.

**Verificación (JDK 27, SLF4J 2.0.16 simple, 2026-05-22).**

```bash
javac -cp "slf4j-api.jar:slf4j-simple.jar" DemoSlf4j.java
java -cp ".:slf4j-api.jar:slf4j-simple.jar" DemoSlf4j
```

Salida real observada (formato puede variar):

```text
[main] INFO DemoSlf4j - hola Ada
```

#### Logback

**Definición formal.** Logback es una implementación de logging compatible con SLF4J, configurable por XML/groovy y con appenders/encoders.

**Para qué sirve.** Emitir, formatear, filtrar y enrutar logs a consola, archivo, etc.

**Cuándo usarlo y cuándo no.** Úsalo cuando necesites configuración rica. Revisa configuración por defecto antes de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m7-t1-logback && cd /tmp/java-m7-t1-logback
curl -sL -o slf4j-api.jar https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.16/slf4j-api-2.0.16.jar
curl -sL -o logback-classic.jar https://repo1.maven.org/maven2/ch/qos/logback/logback-classic/1.5.16/logback-classic-1.5.16.jar
curl -sL -o logback-core.jar https://repo1.maven.org/maven2/ch/qos/logback/logback-core/1.5.16/logback-core-1.5.16.jar
```

```java
import org.slf4j.*;
public class DemoLogback {
    private static final Logger log = LoggerFactory.getLogger(DemoLogback.class);
    public static void main(String[] args) { log.info("ok"); }
}
```

**Caso de uso real.** Logback con rolling file appender en producción.

**Error común.** Sin configuración ni binding claro. Síntoma: no aparecen logs. Corrección: agregar dependencias y `logback.xml`.

**Verificación (JDK 27, Logback 1.5.16, 2026-05-22).** Compila y emite línea INFO con configuración por defecto.

#### Logging estructurado

**Definición formal.** Práctica de emitir logs con campos consistentes y parseables (timestamp, nivel, logger, mensaje, contexto, excepción).

**Para qué sirve.** Permite búsqueda, filtrado y correlación en herramientas de observabilidad.

**Cuándo usarlo.** En producción y sistemas con múltiples requests. Evita mensajes ambiguos sin contexto.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.slf4j.*;
public class DemoEstructurado {
    private static final Logger log = LoggerFactory.getLogger(DemoEstructurado.class);
    public static void main(String[] args) {
        String guia = "G-1";
        log.info("Procesando guia={} estado={}", guia, "CREADA");
    }
}
```

**Caso de uso real.** Incluir `orderId`, `requestId`, `userId` como campos.

**Error común.** Concatenar strings: `"guia " + guia`. Síntoma: menos legible y evalúa aunque el nivel esté desactivado. Corrección: placeholders `{}`.

**Verificación (JDK 27, 2026-05-22).** Salida contiene `Procesando guia=G-1 estado=CREADA`.

#### Niveles de log

**Definición formal.** Clasificación de severidad/verbosidad: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` (de mayor a menor severidad típica).

**Para qué sirve.** Filtrar señal del ruido según entorno y necesidad.

**Cuándo usarlo.** `ERROR` fallo que requiere atención; `WARN` anómalo recuperable; `INFO` evento de negocio; `DEBUG/TRACE` diagnóstico.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.slf4j.*;
public class DemoNiveles {
    private static final Logger log = LoggerFactory.getLogger(DemoNiveles.class);
    public static void main(String[] args) {
        log.info("info");
        log.warn("warn");
        log.error("error");
    }
}
```

**Caso de uso real.** INFO para alta de pedido, WARN para reintento, ERROR para fallo no recuperado.

**Error común.** Loggear todo en INFO o loggear secretos. Corrección: elegir nivel por semántica y redactar sensibles.

**Verificación (JDK 27, 2026-05-22).** Se emiten las tres líneas con sus niveles.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m7-t1 && cd /tmp/java-m7-t1
curl -sL -o slf4j-api.jar https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.16/slf4j-api-2.0.16.jar
curl -sL -o logback-classic.jar https://repo1.maven.org/maven2/ch/qos/logback/logback-classic/1.5.16/logback-classic-1.5.16.jar
curl -sL -o logback-core.jar https://repo1.maven.org/maven2/ch/qos/logback/logback-core/1.5.16/logback-core-1.5.16.jar
```

```java
import org.slf4j.*;
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

#### Recorrido del código

`LoggerFactory.getLogger` crea logger por clase. Los placeholders `{}` evitan concatenación. `log.error(msg, e)` preserva stack trace.

#### Ejecución y salida real

```bash
javac -cp ".:slf4j-api.jar:logback-classic.jar:logback-core.jar" DemoLog.java
java -cp ".:slf4j-api.jar:logback-classic.jar:logback-core.jar" DemoLog
```

Salida real observada (varía por patrón, 2026-05-22):

```text
... INFO  DemoLog - Procesando guia G-1
... WARN  DemoLog - Reintento para guia G-1
... ERROR DemoLog - Fallo procesando guia G-1
java.lang.NumberFormatException: For input string: "x"
...
```

#### Errores frecuentes

Usar `System.out.println`, concatenar strings, loggear secretos, perder excepción al loggear solo `e.getMessage()`.

#### Verificación

Confirmar que aparecen INFO/WARN/ERROR y que el stack trace contiene `NumberFormatException`.


### Tema 2: MDC — contexto por request/hilo · Intermedio · 35 min

Con muchas requests concurrentes, los logs se mezclan. Necesitas un `requestId` en cada línea para reconstruir la historia de una solicitud.

#### MDC (Mapped Diagnostic Context)

**Definición formal.** MDC es un mapa de contexto por hilo provisto por SLF4J; los valores se pueden incluir en el patrón de logging.

**Para qué sirve.** Adjuntar IDs de correlación (requestId, userId, traceId) a todas las líneas de log de una ejecución.

**Cuándo usarlo y cuándo no.** Úsalo en requests, jobs o mensajes. No metas PII sensible.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m7-t2-mdc && cd /tmp/java-m7-t2-mdc
# usar jars slf4j-api/logback-classic/logback-core y logback.xml con %X{requestId}
```

```java
import org.slf4j.*;
public class DemoMdc {
    private static final Logger log = LoggerFactory.getLogger(DemoMdc.class);
    public static void main(String[] args) {
        MDC.put("requestId", "req-1");
        try { log.info("hola"); }
        finally { MDC.remove("requestId"); }
    }
}
```

**Caso de uso real.** Correlacionar todos los logs de una request HTTP.

**Error común.** No limpiar MDC. Síntoma: el ID aparece en la siguiente request en un pool de hilos. Corrección: `finally { MDC.remove/clear }`.

**Verificación (JDK 27, Logback 1.5.16, 2026-05-22).** Con patrón `%X{requestId}`, la salida incluye `req-1`.

#### Contexto por request/hilo

**Definición formal.** Valores contextuales vigentes durante una ejecución, almacenados por hilo.

**Para qué sirve.** Evita pasar requestId por todos los métodos.

**Cuándo usarlo.** Al inicio de request/job; limpiar al final.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.slf4j.*;
public class DemoContexto {
    static final Logger log = LoggerFactory.getLogger(DemoContexto.class);
    static void servicio() { log.info("servicio"); }
    public static void main(String[] args) {
        MDC.put("requestId", "r2");
        try { servicio(); } finally { MDC.remove("requestId"); }
    }
}
```

**Caso de uso real.** Filtros/interceptores que establecen contexto.

**Error común.** Asumir propagación automática a hilos async. Corrección: propagar explícitamente.

**Verificación (JDK 27, 2026-05-22).** `servicio` loggea con el mismo requestId.

#### Propagación y limpieza

**Definición formal.** Establecer contexto al entrar y removerlo al salir; en async, copiar/restaurar el mapa MDC.

**Para qué sirve.** Evita contaminación entre ejecuciones en pools.

**Cuándo usarlo.** Siempre, en `finally`.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import org.slf4j.*;
public class DemoLimpieza {
    public static void main(String[] args) {
        MDC.put("requestId", "r3");
        try { System.out.println(MDC.get("requestId")); }
        finally { MDC.remove("requestId"); }
        System.out.println(MDC.get("requestId"));
    }
}
```

**Caso de uso real.** Worker que procesa mensajes de una cola.

**Error común.** `clear()` agresivo cuando otras claves son de otro framework. Corrección: `remove` de claves propias o manejo cuidadoso.

**Verificación (JDK 27, 2026-05-22).** Salida: `r3` y `null`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m7-t2 && cd /tmp/java-m7-t2
# jars slf4j-api-2.0.16, logback-classic-1.5.16, logback-core-1.5.16
```

`logback.xml`:

```xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder><pattern>%level [%X{requestId}] %logger - %msg%n</pattern></encoder>
  </appender>
  <root level="INFO"><appender-ref ref="STDOUT"/></root>
</configuration>
```

```java
import org.slf4j.*;
public class DemoMdc {
    private static final Logger log = LoggerFactory.getLogger(DemoMdc.class);
    public static void main(String[] args) {
        MDC.put("requestId", "req-123");
        try { log.info("Inicio"); log.info("Fin"); }
        finally { MDC.remove("requestId"); }
    }
}
```

#### Ejecución y salida real

```bash
javac -cp ".:slf4j-api.jar:logback-classic.jar:logback-core.jar" DemoMdc.java
java -cp ".:slf4j-api.jar:logback-classic.jar:logback-core.jar" DemoMdc
```

```text
INFO [req-123] DemoMdc - Inicio
INFO [req-123] DemoMdc - Fin
```

#### Errores frecuentes

No limpiar MDC, no incluir `%X{requestId}` en el patrón, perder contexto en async.

#### Verificación

Ejecutar dos requests simuladas y confirmar IDs distintos por request.

### Tema 3: Depuración y stack traces · Básico · 30 min

Un job falla con `NullPointerException`. Necesitas leer el stack trace, identificar causa raíz y corregir el contrato.

#### Depuración

**Definición formal.** Proceso sistemático de reproducir, aislar, diagnosticar y corregir un defecto.

**Para qué sirve.** Resolver la causa raíz, no solo el síntoma.

**Cuándo usarla.** Ante fallos o comportamientos inesperados; primero reproducir.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m7-t3-debug && cd /tmp/java-m7-t3-debug
```

```java
public class DemoDebug {
    static int total(String s) { return s.length(); }
    public static void main(String[] args) {
        try { total(null); }
        catch (Exception e) { System.out.println(e.getClass().getSimpleName()); }
    }
}
```

**Caso de uso real.** Reproducir bug con input mínimo.

**Error común.** Cambiar código al azar. Corrección: reproducir, aislar, hipotetizar, verificar.

**Verificación (JDK 27, 2026-05-22).** Salida: `NullPointerException`.

#### Stack trace

**Definición formal.** Traza de llamadas que muestra dónde se lanzó la excepción y la cadena de causas (`Caused by`).

**Para qué sirve.** Localizar origen del fallo y su contexto.

**Cuándo usarlo.** Al analizar excepciones. Lee la causa raíz, no solo el último wrapper.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m7-t3-stack && cd /tmp/java-m7-t3-stack
```

```java
public class DemoStack {
    static void a() { b(); }
    static void b() { throw new RuntimeException("boom"); }
    public static void main(String[] args) {
        try { a(); } catch (Exception e) { System.out.println(e.getStackTrace()[0].getMethodName()); }
    }
}
```

**Caso de uso real.** Identificar método y línea que originaron el fallo.

**Error común.** Leer solo el mensaje final. Corrección: recorrer `Caused by` hasta la raíz.

**Verificación (JDK 27, 2026-05-22).** Salida: `b`.

#### Causa raíz vs síntoma

**Definición formal.** La causa raíz es el origen real; el síntoma es la manifestación observable.

**Para qué sirve.** Evita parches frágiles.

**Cuándo usarlo.** Siempre en análisis de bugs.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m7-t3-causa && cd /tmp/java-m7-t3-causa
```

```java
public class DemoCausa {
    static String nombre(String input) {
        if (input == null) throw new IllegalArgumentException("input nulo");
        return input.trim();
    }
    public static void main(String[] args) {
        try { nombre(null); } catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

**Caso de uso real.** Validar contrato en frontera en vez de dejar NPE profundo.

**Error común.** Capturar NPE y seguir con estado corrupto. Corrección: corregir contrato/origen.

**Verificación (JDK 27, 2026-05-22).** Salida: `input nulo`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m7-t3 && cd /tmp/java-m7-t3
```

```java
public class DemoDebug {
    static int longitud(String valor) { return valor.length(); }
    static String procesar(String nombre) { return "Hola " + nombre.trim().toUpperCase(); }
    public static void main(String[] args) {
        try { System.out.println(longitud(null)); }
        catch (NullPointerException e) { System.out.println("NPE en longitud"); }
        try { System.out.println(procesar("  ada  ")); System.out.println(procesar(null)); }
        catch (NullPointerException e) { System.out.println("NPE en procesar"); }
    }
}
```

#### Ejecución y salida real

```bash
javac DemoDebug.java
java DemoDebug
```

```text
NPE en longitud
Hola ADA
NPE en procesar
```

#### Errores frecuentes

Cambiar código sin reproducir, ignorar la causa raíz, tragar excepciones.

#### Verificación

Agregar validación de null y confirmar mensaje claro en vez de NPE.

## Cierre del módulo

Logging útil, contexto MDC y lectura disciplinada de stack traces permiten diagnosticar problemas reales. La base es: loggear con semántica, no loggear secretos, limpiar contexto y depurar por causa raíz.
