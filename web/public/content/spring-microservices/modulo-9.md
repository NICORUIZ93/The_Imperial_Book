# Módulo 9 · Observabilidad en Spring

Observabilidad permite responder por qué falla un sistema distribuido. En Spring, Micrometer, Actuator, logs estructurados y OpenTelemetry son la base para métricas, logs y traces correlacionados.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan smokes de métricas/logs/trace context en Java puro. Prometheus/Grafana/OTel collector reales requieren infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Micrometer y Prometheus · Intermedio · 150 min

Caso guía: medir tasa de requests y latencia.

#### Métricas

**Definición formal.** Micrometer es fachada de métricas para JVM. Prometheus scrapea métricas; Grafana las visualiza.

**Cuándo usarlo / cuándo no.** Úsalo para RED/USE. No uses labels de alta cardinalidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm9-metrics
cd sm9-metrics
```

Crea el archivo `Metrics.java`:

```java
import java.util.*;
public class Metrics {
  static Map<String,Integer> counter = new HashMap<>();
  static void inc(String key){ counter.put(key, counter.getOrDefault(key,0)+1); }
  public static void main(String[] args){ inc("200"); inc("500"); inc("200"); System.out.println(counter.get("200")); System.out.println(counter.get("500")); }
}
```

```bash
javac Metrics.java
java Metrics
```

**Error común.** Label `userId` en métrica.

**Síntoma.** Prometheus se degrada. **Causa.** cardinalidad alta. **Corrección.** labels bajos en cardinalidad. **Señal observable.** series activas crecen sin límite.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `2`, `1`.

### Tema 2: OpenTelemetry por defecto: métricas, trazas y logs correlacionados · Avanzado · 150 min

Caso guía: seguir una request entre orders e inventory.

#### Tracing

**Definición formal.** OTel estandariza traces, métricas y logs. Una traza contiene spans con contexto padre-hijo.

**Cuándo usarlo / cuándo no.** Úsalo en flujos multi-servicio. No instrumentes todo con atributos de alta cardinalidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm9-otel
cd sm9-otel
```

Crea el archivo `Trace.java`:

```java
import java.util.*;
public class Trace {
  static Map<String,String> span(String traceId, String name){ return Map.of("traceId",traceId,"name",name); }
  public static void main(String[] args){ var root=span("t1","http"); var child=span(root.get("traceId"),"db"); System.out.println(root.get("traceId").equals(child.get("traceId"))); }
}
```

```bash
javac Trace.java
java Trace
```

**Error común.** Romper propagación de contexto.

**Síntoma.** trazas cortadas. **Causa.** no propagar headers. **Corrección.** W3C traceparent, instrumentación OTel. **Señal observable.** spans huérfanos.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`.

### Tema 3: Logs estructurados y correlación · Intermedio · 120 min

Caso guía: buscar todos los logs de una request fallida.

#### Logging estructurado

**Definición formal.** Logs JSON con campos consistentes (`timestamp`, `level`, `service`, `traceId`). MDC en SLF4J/Logback permite inyectar contexto.

**Cuándo usarlo / cuándo no.** Siempre en prod. No loguees secretos/PII.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm9-log
cd sm9-log
```

Crea el archivo `Log.java`:

```java
public class Log {
  static String json(String level,String msg,String trace){ return "{\"level\":\""+level+"\",\"traceId\":\""+trace+"\",\"msg\":\""+msg+"\"}"; }
  public static void main(String[] args){ System.out.println(json("INFO","created","t1").contains("traceId")); }
}
```

```bash
javac Log.java
java Log
```

**Error común.** Logs de texto libre.

**Síntoma.** imposible correlacionar. **Causa.** sin campos estructurados. **Corrección.** JSON + MDC. **Señal observable.** grep manual ineficiente.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`.

### Tema 4: SLO, p99 y alerting · Intermedio · 120 min

Caso guía: alertar por degradación de usuario, no por ruido interno.

#### SLO/alertas

**Definición formal.** SLI mide; SLO objetivo; alerta avisa cuando se quema presupuesto de error o se afecta usuario.

**Cuándo usarlo / cuándo no.** Úsalo para servicios productivos. No alertes por toda causa interna.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm9-slo
cd sm9-slo
```

Crea el archivo `Slo.java`:

```java
public class Slo {
  static boolean page(int p99, double err){ return p99 > 300 || err > 0.01; }
  public static void main(String[] args){ System.out.println(page(200,0.001)); System.out.println(page(500,0.001)); }
}
```

```bash
javac Slo.java
java Slo
```

**Error común.** Alert fatigue.

**Síntoma.** alertas ignoradas. **Causa.** alertar por CPU sin impacto. **Corrección.** alertas por síntoma/SLO. **Señal observable.** páginas sin acción.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `false`, `true`.

## Cierre

Métricas, logs y traces deben correlacionarse por `traceId`. La observabilidad buena reduce MTTR y evita suposiciones.

## Checklist

- RED metrics y p99 medidos.
- Logs JSON con traceId.
- Traces propagados.
- Alertas por síntoma/SLO.
