# Módulo 7: Logging y depuración

Cuando un programa falla en producción, `System.out.println` no alcanza: no tiene niveles, no tiene contexto, no se puede filtrar ni enrutar. El logging estructurado y una depuración metódica permiten entender qué pasó, cuándo y por qué. Este módulo cubre SLF4J/Logback, MDC y técnicas prácticas de depuración.

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

**Concepto clave / modelo mental**

SLF4J es una fachada de logging: tu código depende de la API SLF4J. Logback (u otro backend) implementa el comportamiento real.

Niveles comunes:

| Nivel | Uso |
|---|---|
| `ERROR` | Fallo que requiere atención |
| `WARN` | Situación anómala pero recuperable |
| `INFO` | Eventos normales relevantes |
| `DEBUG` | Detalle para diagnóstico |
| `TRACE` | Detalle muy fino |

Usa placeholders `{}` en vez de concatenar strings: evita construir mensajes innecesarios cuando el nivel está desactivado.

**Implementación desde cero**

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

Con SLF4J + backend simple configurado:

```text
INFO  DemoLogging - Procesando guia G-1
ERROR DemoLogging - Error procesando guia G-1
java.lang.NumberFormatException: For input string: "NO"
...
```

El formato exacto depende de la configuración de Logback/simple logger.

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

**Concepto clave / modelo mental**

MDC (Mapped Diagnostic Context) es un mapa de contexto asociado al hilo actual. Puedes poner valores como `requestId` y hacer que el patrón de logging los imprima en cada línea.

Reglas:

- pon el valor al inicio del procesamiento;
- límpialo en `finally`;
- en virtual threads/tareas async, propaga el contexto explícitamente si cruza límites.

**Implementación desde cero**

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
            MDC.remove("requestId");
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
- `MDC.remove`/`clear` en `finally` evita fugas de contexto en pools de hilos.
- El contexto facilita correlacionar logs en sistemas concurrentes.

**Ejecución y salida real**

Con patrón que incluya MDC:

```text
INFO DemoMDC [req-1] - inicio
INFO DemoMDC [req-1] - fin
INFO DemoMDC [req-2] - inicio
INFO DemoMDC [req-2] - fin
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

**Concepto clave / modelo mental**

Depurar es reducir incertidumbre: reproducir, observar, aislar, corregir, verificar.

Stack trace: léelo de arriba hacia abajo para el tipo de error, y busca la primera línea de **tu** código: suele ser el punto más cercano a la causa.

Herramientas:

- mensajes de excepción y causa (`getCause`);
- breakpoints y step over/into;
- logs con contexto;
- pruebas pequeñas que reproduzcan el fallo.

**Implementación desde cero**

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
