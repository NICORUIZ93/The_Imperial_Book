# Módulo 9 · Observabilidad en Spring

Observabilidad permite responder por qué falla un sistema distribuido. En Spring, Micrometer, Actuator, logs estructurados y OpenTelemetry son la base para métricas, logs y traces correlacionados.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan smokes de métricas/logs/trace context en Java puro. Prometheus/Grafana/OTel collector reales requieren infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Micrometer y Prometheus · Intermedio · 150 min

Caso guía: medir tasa de requests y latencia.

#### Métricas

**Definición formal.** Micrometer es fachada de métricas para JVM. Prometheus scrapea métricas; Grafana las visualiza.

**Contrato / internals.** Micrometer es fachada de métricas; Prometheus scrapea `/actuator/prometheus`. Usar counters para acumulados, gauges para estado, timers/histograms para latencia; controlar cardinalidad de tags.


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

**Caso real.** `catalog-service` expone `http.server.requests` y un counter `cache.hit` para medir efectividad de Redis.


**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `2`, `1`.

### Tema 2: OpenTelemetry por defecto: métricas, trazas y logs correlacionados · Avanzado · 150 min

Caso guía: una request de compra atraviesa gateway, orders, inventory y payments. El usuario recibe 500, pero cada servicio solo ve su parte. Necesitas una traza completa.

#### Definición formal

OpenTelemetry (OTel) es un estándar/open-source para instrumentar, generar, recolectar y exportar telemetría: traces, metrics y logs. Un **trace** es un conjunto de spans relacionados por `traceId`; cada span representa una operación con duración, estado y atributos.

#### Contrato / internals

- **Context propagation:** `traceparent`/W3C Trace Context viaja por headers HTTP o metadata de mensajería.
- **Span:** nombre, inicio/fin, status, atributos, eventos, parent.
- **Métricas:** contadores/histogramas/gauges; deben evitar alta cardinalidad.
- **Logs correlacionados:** incluyen `traceId`/`spanId` para unir evidencia.
- **Exportación:** OTLP a collector; el collector enruta a backends (Tempo/Jaeger, Prometheus/Mimir, Loki, etc.).
- **Límite:** instrumentar no arregla la causa; solo hace observable el fallo.

#### Cuándo usarlo / cuándo no

**Úsalo** en cualquier sistema multi-servicio o con latencia/errores difíciles de diagnosticar. **No** pongas IDs únicos por request como labels de métricas; usa traces/logs para alta cardinalidad.

#### Ejemplo mínimo ejecutable

Crea el archivo `Trace.java`:

```java
import java.util.*;
public class Trace {
  static Map<String, String> span(String traceId, String name) {
    return Map.of("traceId", traceId, "name", name);
  }
  public static void main(String[] args) {
    var root = span("t1", "http");
    var child = span(root.get("traceId"), "db");
    System.out.println(root.get("traceId").equals(child.get("traceId")));
    System.out.println(child.get("name"));
  }
}
```

```bash
javac Trace.java
java Trace
```

Salida esperada:

```text
true
db
```

#### Caso real

Gateway crea el span raíz, propaga `traceparent` a `orders`, `orders` crea un span hijo para la llamada a `inventory` y otro para DB. En Grafana/Tempo se ve la latencia por servicio y el span con error.

#### Error común

**Síntoma.** trazas cortadas en el borde de un servicio. **Causa.** no propagar contexto en headers o en consumidor de mensajería. **Corrección.** instrumentación OTel + propagación W3C; validar en integración. **Señal observable.** spans huérfanos con distintos `traceId`.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `db`.

**Nota de verificación:** no se ejecutó collector OTel/Tempo/Prometheus en esta sesión. Verificación propuesta: levantar OTel Collector + backend, instrumentar app Spring Boot con OTel agent/SDK y confirmar que una request genera spans conectados.

### Tema 3: Logs estructurados y correlación · Intermedio · 120 min

Caso guía: ante un incidente, necesitas encontrar todos los logs de la request `t1` en cinco servicios.

#### Definición formal

Logging estructurado emite logs como registros con campos consistentes (JSON o key-value), en lugar de texto libre. La correlación agrega identificadores como `traceId`, `spanId`, `requestId`, `service`, `tenant` para conectar eventos.

#### Contrato / internals

- **Campos mínimos:** timestamp, level, service, env, message/event, traceId/spanId.
- **MDC (Mapped Diagnostic Context):** en SLF4J/Logback permite inyectar contexto por hilo/request.
- **PII/secretos:** no deben loguearse; aplicar redacción.
- **Nivel:** INFO para eventos de negocio, WARN/ERROR para fallos accionables, DEBUG solo controlado.
- **Límite:** loguear todo no es observabilidad; es costo y ruido.

#### Cuándo usarlo / cuándo no

**Úsalo** siempre en producción. **No** loguees tokens, passwords, payloads sensibles ni datos de alta cardinalidad sin control.

#### Ejemplo mínimo ejecutable

Crea el archivo `Log.java`:

```java
public class Log {
  static String json(String level, String msg, String trace) {
    return "{\"level\":\"" + level + "\",\"traceId\":\"" + trace + "\",\"msg\":\"" + msg + "\"}";
  }
  public static void main(String[] args) {
    String line = json("INFO", "created", "t1");
    System.out.println(line.contains("traceId"));
    System.out.println(line.contains("t1"));
  }
}
```

```bash
javac Log.java
java Log
```

Salida esperada:

```text
true
true
```

#### Caso real

Un filtro HTTP pone `traceId` en MDC; Logback JSON encoder emite el campo en cada línea. En Loki/ELK se filtra por `traceId=t1`.

#### Error común

**Síntoma.** no se puede reconstruir un incidente. **Causa.** logs de texto libre sin IDs. **Corrección.** JSON estructurado + MDC + propagación de traceId. **Señal observable.** búsqueda por request requiere `grep` manual en múltiples archivos.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `true`.

**Nota de verificación:** no se ejecutó stack Logback/Loki/ELK en esta sesión. Verificación propuesta: configurar logback encoder JSON, inyectar MDC y consultar por `traceId` en el backend de logs.

### Tema 4: SLO, p99 y alerting · Intermedio · 120 min

Caso guía: alertar por degradación de usuario, no por ruido interno.

#### SLO/alertas

**Definición formal.** SLI mide; SLO objetivo; alerta avisa cuando se quema presupuesto de error o se afecta usuario.

**Contrato / internals.** SLO define objetivo medible; SLI es la métrica; error budget es la tolerancia. Alertar por síntomas/SLO burn rate, no por cada CPU spike.


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

**Caso real.** SLO: 99.9% de `GET /productos/{id}` < 300ms. Alerta cuando el burn rate consume 5% del budget en 1h.


**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `false`, `true`.

## Cierre

Métricas, logs y traces deben correlacionarse por `traceId`. La observabilidad buena reduce MTTR y evita suposiciones.

## Checklist

- RED metrics y p99 medidos.
- Logs JSON con traceId.
- Traces propagados.
- Alertas por síntoma/SLO.
