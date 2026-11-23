# Módulo 9 · Observabilidad de Tienda Aurora

Tienda Aurora tiene 5 microservicios en producción. Cuando un usuario reporta que "el checkout falló", los logs locales de cada servicio no bastan para reconstruir qué pasó. Necesitas responder tres preguntas: qué está pasando (métricas), dónde está pasando (trazas) y por qué pasó (logs correlacionados). Este módulo construye observabilidad con Micrometer, OpenTelemetry, logs estructurados y SLOs.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los smokes validan lógica de contadores, propagación de traceId, logs JSON y alertas por SLO en Java puro. Prometheus, Grafana, OTel Collector, Tempo/Loki y Spring Boot Actuator reales requieren infraestructura; se incluyen notas de verificación honestas.

### Tema 1: Micrometer y Prometheus · Intermedio · 150 min

## Métricas con Micrometer: de la opinión a la evidencia

`catalog-service` empieza a responder lento después de un despliegue. El equipo revisa CPU y memoria: parecen normales. Los usuarios se quejan, pero nadie puede decir cuántas requests fallan, cuál endpoint es lento ni si el problema empezó antes o después del despliegue. Sin métricas, la discusión se vuelve opinión.

Las métricas son el tablero de instrumentos de un avión. No te dicen la causa raíz de todo, pero te dicen si estás perdiendo altitud, velocidad o combustible. RED (Rate, Errors, Duration) mide la experiencia del servicio; USE (Utilization, Saturation, Errors) mide recursos. Micrometer es la fachada que expone métricas; Prometheus las recolecta; Grafana las visualiza.

La construcción comienza con un contador mínimo por status HTTP:

```java
import java.util.*;

public class MetricsSmoke {
    static Map<String, Integer> counter = new HashMap<>();
    static void inc(String key) { counter.put(key, counter.getOrDefault(key, 0) + 1); }

    public static void main(String[] args) {
        inc("200"); inc("500"); inc("200");
        System.out.println("requests_200=" + counter.get("200"));
        System.out.println("requests_500=" + counter.get("500"));
    }
}
```

```bash
javac MetricsSmoke.java
java MetricsSmoke
```

Salida esperada:

```text
requests_200=2
requests_500=1
```

En Spring Boot, Actuator expone `/actuator/prometheus` y Micrometer instrumenta automáticamente. La configuración en `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  metrics:
    tags:
      application: catalog-service
      environment: ${SPRING_PROFILES_ACTIVE:dev}
```

El error más común es usar labels de alta cardinalidad. El síntoma es que Prometheus se degrada o se vuelve costoso. La causa es que cada valor único crea una serie temporal. La corrección es labels bajos en cardinalidad: `status=200` sí, `userId=...` no. El detalle por request va a traces y logs, no a métricas.

### Tema 2: OpenTelemetry por defecto: métricas, trazas y logs correlacionados · Avanzado · 150 min

## OpenTelemetry: trazas distribuidas end-to-end

Una compra en Tienda Aurora falla con 500. El log de `gateway` dice timeout, el de `orders` dice error al llamar inventory, y el de `inventory` dice consulta lenta a DB. Están en tres servicios, tres formatos y tres relojes. Reconstruir la historia lleva 40 minutos.

Una traza distribuida es como el número de seguimiento de un paquete. Cada oficina por donde pasa el paquete sella el mismo número. Puedes ver el recorrido completo, no solo el sello local. En OTel, ese número es el `traceId`; cada sello es un `span`.

```java
import java.util.*;

public class TraceSmoke {
    static Map<String, String> span(String traceId, String name) {
        return Map.of("traceId", traceId, "name", name);
    }

    public static void main(String[] args) {
        var root = span("t1", "http");
        var child = span(root.get("traceId"), "db");
        System.out.println("same-trace=" + root.get("traceId").equals(child.get("traceId")));
        System.out.println("child-name=" + child.get("name"));
    }
}
```

```bash
javac TraceSmoke.java
java TraceSmoke
```

Salida esperada:

```text
same-trace=true
child-name=db
```

El `traceId` se propaga por headers W3C `traceparent`. Cada servicio crea spans hijos. El collector recibe OTLP y exporta a Tempo/Jaeger. El error más común es trazas cortadas: el síntoma son spans huérfanos. La causa es no propagar contexto en headers o en consumidor de mensajería.

### Tema 3: Logs estructurados y propagación de contexto · Intermedio · 120 min

## Logs estructurados y correlación

Durante un incidente en Tienda Aurora, el equipo busca "error pedido" en logs. Aparecen 12.000 líneas de cinco servicios. Nadie sabe cuáles pertenecen al usuario afectado. Los logs son texto libre, sin `traceId`, sin `service`, sin estructura.

Un log estructurado es como un formulario con campos, no una nota en servilleta. Si todos usan el mismo formulario, puedes filtrar por `traceId=t1`. Si cada uno escribe texto libre, dependes de suerte y `grep`.

```java
public class LogSmoke {
    static String json(String level, String msg, String trace) {
        return "{\"level\":\"" + level + "\",\"traceId\":\"" + trace + "\",\"msg\":\"" + msg + "\"}";
    }

    public static void main(String[] args) {
        String line = json("INFO", "created", "t1");
        System.out.println("has-traceId=" + line.contains("traceId"));
        System.out.println("has-t1=" + line.contains("t1"));
    }
}
```

```bash
javac LogSmoke.java
java LogSmoke
```

Salida esperada:

```text
has-traceId=true
has-t1=true
```

En Spring, MDC guarda `traceId/spanId` por request. El encoder JSON los emite. Nunca loguees secretos, tokens o PII sin redacción. El error más común es logs de texto libre sin IDs: el síntoma es que no se puede reconstruir un incidente.

### Tema 4: SLO, p99 y alerting · Intermedio · 120 min

## SLO, p99 y alerting: de alert fatigue a alertas por síntoma

El equipo de Tienda Aurora tiene 200 alertas al día: CPU alta, GC, un pod reinició, latencia de un endpoint interno. Nadie las mira. El día que el checkout falla para usuarios reales, la alerta importante queda enterrada en ruido. Esto es alert fatigue.

Un SLO es como un acuerdo de servicio con el usuario: "el 99.9% de checkouts responden en menos de 300ms". El error budget es cuánto puedes fallar sin romper el acuerdo. Alertar por burn rate es avisar cuando estás gastando ese presupuesto demasiado rápido, no cuando una CPU sube por 30 segundos sin afectar a nadie.

```java
public class SloSmoke {
    static boolean page(int p99, double err) { return p99 > 300 || err > 0.01; }

    public static void main(String[] args) {
        System.out.println("healthy=" + page(200, 0.001));
        System.out.println("page=" + page(500, 0.001));
    }
}
```

```bash
javac SloSmoke.java
java SloSmoke
```

Salida esperada:

```text
healthy=false
page=true
```

SLOs y alertas por síntoma reducen ruido y enfocan la respuesta en el usuario. El error más común es alert fatigue: alertas ignoradas porque se alerta por CPU/ruido sin impacto. La corrección es alertas por síntoma/SLO, severidad y runbook.

## Cierre

Observabilidad no es "tener dashboards": es poder explicar el comportamiento del sistema con evidencia. Métricas para síntomas, trazas para recorrido, logs para detalle, SLOs para decidir cuándo actuar. Para Tienda Aurora, esto significa que cuando un usuario reporta "el checkout falló", el equipo puede reconstruir la request completa en minutos, no horas.

## Checklist

- RED/USE medidos con baja cardinalidad.
- Traces propagados con W3C `traceparent`.
- Logs JSON con `traceId/spanId`.
- Alertas por síntoma/SLO, no por ruido.
- Nota de verificación honesta cuando falta infraestructura.
