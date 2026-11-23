# Módulo 9 · Observabilidad de Tienda Aurora

Tienda Aurora tiene 5 microservicios en producción. Cuando un usuario reporta que "el checkout falló", los logs locales de cada servicio no bastan para reconstruir qué pasó. Necesitas responder tres preguntas: qué está pasando (métricas), dónde está pasando (trazas) y por qué pasó (logs correlacionados). Este módulo construye observabilidad con Micrometer, OpenTelemetry, logs estructurados y SLOs.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los smokes validan lógica de contadores, propagación de traceId, logs JSON y alertas por SLO en Java puro. Prometheus, Grafana, OTel Collector, Tempo/Loki y Spring Boot Actuator reales requieren infraestructura; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-observability

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
docker --version  # Docker 24+ (para Prometheus/Grafana/OTel Collector)
```

### Estructura del proyecto

```text
tienda-aurora-observability/
├── build.gradle.kts
├── settings.gradle.kts
├── src/
│   ├── main/
│   │   ├── java/com/aurora/observability/
│   │   │   ├── ObservabilityApplication.java
│   │   │   ├── controller/CatalogController.java
│   │   │   ├── service/CatalogService.java
│   │   │   └── config/ObservabilityConfig.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/aurora/observability/
│           └── ObservabilitySmokeTest.java
└── docker-compose.yml
```

### build.gradle.kts

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")
    implementation("io.micrometer:micrometer-tracing-bridge-otel")
    implementation("io.opentelemetry:opentelemetry-exporter-otlp")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.test {
    useJUnitPlatform()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-observability"
```

### application.yml

```yaml
spring:
  application:
    name: observability-service

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  tracing:
    sampling:
      probability: 1.0
  metrics:
    tags:
      application: observability-service

otel:
  exporter:
    otlp:
      endpoint: http://localhost:4317

server:
  port: 8080
```

### docker-compose.yml

```yaml
services:
  prometheus:
    image: prom/prometheus:v2.50.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:10.3.0
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin

  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.95.0
    ports:
      - "4317:4317"
      - "4318:4318"
```

### Tema 1: Micrometer y Prometheus · Intermedio · 150 min

## Métricas con Micrometer: de la opinión a la evidencia

`catalog-service` empieza a responder lento después de un despliegue. El equipo revisa CPU y memoria: parecen normales. Los usuarios se quejan, pero nadie puede decir cuántas requests fallan, cuál endpoint es lento ni si el problema empezó antes o después del despliegue. Sin métricas, la discusión se vuelve opinión.

Las métricas son el tablero de instrumentos de un avión. No te dicen la causa raíz de todo, pero te dicen si estás perdiendo altitud, velocidad o combustible. RED (Rate, Errors, Duration) mide la experiencia del servicio; USE (Utilization, Saturation, Errors) mide recursos. Micrometer es la fachada que expone métricas; Prometheus las recolecta; Grafana las visualiza.

```java
import java.util.*;

public class MetricsExample {
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
javac MetricsExample.java
java MetricsExample
```

Salida esperada:

```text
requests_200=2
requests_500=1
```

En Spring Boot, Actuator expone `/actuator/prometheus` y Micrometer instrumenta automáticamente. El error más común es usar labels de alta cardinalidad. El síntoma es que Prometheus se degrada o se vuelve costoso. La causa es que cada valor único crea una serie temporal. La corrección es labels bajos en cardinalidad: `status=200` sí, `userId=...` no.

### Tema 2: OpenTelemetry por defecto: métricas, trazas y logs correlacionados · Avanzado · 150 min

## OpenTelemetry: trazas distribuidas end-to-end

Una compra en Tienda Aurora falla con 500. El log de `gateway` dice timeout, el de `orders` dice error al llamar inventory, y el de `inventory` dice consulta lenta a DB. Están en tres servicios, tres formatos y tres relojes. Reconstruir la historia lleva 40 minutos.

Una traza distribuida es como el número de seguimiento de un paquete. Cada oficina por donde pasa el paquete sella el mismo número. Puedes ver el recorrido completo, no solo el sello local. En OTel, ese número es el `traceId`; cada sello es un `span`.

```java
import java.util.*;

public class TraceExample {
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
javac TraceExample.java
java TraceExample
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
public class LogExample {
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
javac LogExample.java
java LogExample
```

Salida esperada:

```text
has-traceId=true
has-t1=true
```

En Spring, MDC guarda `traceId/spanId` por request. El encoder JSON los emite. Nunca loguees secretos, tokens o PII sin redacción. El error más común es logs de texto libre sin IDs: el síntoma es que no se puede reconstruir un incidente.

## SLO, p99 y alerting

El equipo de Tienda Aurora tiene 200 alertas al día: CPU alta, GC, un pod reinició, latencia de un endpoint interno. Nadie las mira. El día que el checkout falla para usuarios reales, la alerta importante queda enterrada en ruido. Esto es alert fatigue.

Un SLO es como un acuerdo de servicio con el usuario: "el 99.9% de checkouts responden en menos de 300ms". El error budget es cuánto puedes fallar sin romper el acuerdo. Alertar por burn rate es avisar cuando estás gastando ese presupuesto demasiado rápido, no cuando una CPU sube por 30 segundos sin afectar a nadie.

```java
public class SloExample {
    static boolean page(int p99, double err) { return p99 > 300 || err > 0.01; }

    public static void main(String[] args) {
        System.out.println("healthy=" + page(200, 0.001));
        System.out.println("page=" + page(500, 0.001));
    }
}
```

```bash
javac SloExample.java
java SloExample
```

Salida esperada:

```text
healthy=false
page=true
```

SLOs y alertas por síntoma reducen ruido y enfocan la respuesta en el usuario. El error más común es alert fatigue: alertas ignoradas porque se alerta por CPU/ruido sin impacto. La corrección es alertas por síntoma/SLO, severidad y runbook.

## Cierre

Observabilidad no es "tener dashboards": es poder explicar el comportamiento del sistema con evidencia. Métricas para síntomas, trazas para recorrido, logs para detalle, SLOs para decidir cuándo actuar. Para Tienda Aurora, esto significa que cuando un usuario reporta "el checkout falló", el equipo puede reconstruir la request completa en minutos, no horas. Gradle coordina el build multi-módulo con dependencias por servicio.

## Checklist

- RED/USE medidos con baja cardinalidad.
- Traces propagados con W3C `traceparent`.
- Logs JSON con `traceId/spanId`.
- Alertas por síntoma/SLO, no por ruido.
- Nota de verificación honesta cuando falta infraestructura.
