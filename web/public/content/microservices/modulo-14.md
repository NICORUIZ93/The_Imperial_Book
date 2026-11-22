# Módulo 10 · Observabilidad

**Entorno de referencia (2026-05-22):** Node.js v24.18.0. Se verifican formatos de métricas, logs estructurados y reglas de alertas con ejemplos ejecutables. Prometheus, Grafana, OpenTelemetry, Zipkin/Jaeger, Micrometer requieren stack/infra; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Micrometer + Prometheus · Intermedio · 150 min

Caso guía: exponer latencia y conteo de requests.

#### Métricas con Micrometer

**Definición formal.** Micrometer es una fachada de métricas para JVM que integra contadores, timers, gauges con backends como Prometheus.

**Para qué sirve.** Instrumentación portable.

**Cuándo usarlo y cuándo no.** Úsalo en apps JVM. No instrumentes todo sin propósito; evita alta cardinalidad.

**Ejemplo mínimo enfocado (formato Prometheus ejecutable).**

```bash
node -e "console.log('# TYPE http_requests_total counter'); console.log('http_requests_total{path=\"/ok\"} 5')"
```

**Caso de uso real.** `/actuator/prometheus`.

**Error común.** Labels con alta cardinalidad (`userId`). Corrección: labels acotados.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: líneas de formato Prometheus. **Nota:** Micrometer/Prometheus real requiere app y scraper.

#### Prometheus

**Definición formal.** Prometheus es un sistema de monitoreo pull-based que almacena series temporales y permite consultas PromQL.

**Para qué sirve.** Alertas y diagnóstico de comportamiento.

**Cuándo usarlo y cuándo no.** Úsalo para métricas numéricas. No para logs detallados o traces.

**Ejemplo mínimo enfocado (PromQL conceptual).**

```promql
histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))
```

**Caso de uso real.** Alertar por p99 alto.

**Error común.** Alertar por promedio ocultando cola. Corrección: percentiles.

**Verificación.** **Nota de verificación:** requiere Prometheus server.

### Tema 2: OpenTelemetry + Zipkin/Jaeger · Avanzado · 150 min

Caso guía: rastrear request cross-service.

#### Trazas distribuidas

**Definición formal.** Una traza representa una transacción distribuida como spans relacionados por trace/span IDs.

**Para qué sirve.** Diagnostica latencia y fallos entre servicios.

**Cuándo usarlo y cuándo no.** Úsalo en sistemas distribuidos. No muestrees 100% en alto volumen sin control de costo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const trace='t1', span='s1'; console.log(JSON.stringify({traceId:trace,spanId:span,op:'GET /orders'}))"
```

**Caso de uso real.** OpenTelemetry exporta a Jaeger.

**Error común.** No propagar headers de contexto. Corrección: W3C tracecontext.

**Verificación (Node 24.18.0, 2026-05-22).** Salida JSON con traceId/spanId. **Nota:** OTel/Jaeger real requiere agente/collector.

### Tema 3: Logging estructurado · Intermedio · 90 min

Caso guía: logs consultables por `orderId`.

#### Log estructurado

**Definición formal.** Log emitido en formato estructurado (JSON) con campos consistentes.

**Para qué sirve.** Consulta, agregación y correlación.

**Cuándo usarlo y cuándo no.** Úsalo en producción. No loguees secretos/PII.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "console.log(JSON.stringify({level:'info',msg:'order created',orderId:'O1',traceId:'t1'}))"
```

**Caso de uso real.** Loki/ELK indexa campos.

**Error común.** Mensajes no estructurados con datos embebidos. Corrección: campos separados.

**Verificación (Node 24.18.0, 2026-05-22).** Salida JSON.

### Tema 4: Grafana: dashboards · Intermedio · 90 min

Caso guía: tablero de latencia, errores y saturación.

#### Dashboard

**Definición formal.** Visualización de métricas/logs/trazas para observar estado del sistema.

**Para qué sirve.** Diagnóstico rápido y comunicación operativa.

**Cuándo usarlo y cuándo no.** Úsalo para señales clave. No hagas dashboards sin dueño/SLO.

**Ejemplo mínimo enfocado (conceptual).**

```text
Panels: RPS, error rate, p99 latency, saturation
```

**Caso de uso real.** Grafana dashboard por servicio.

**Error común.** Dashboard bonito pero sin alertas accionables. Corrección: SLOs y alertas.

**Verificación.** **Nota de verificación:** requiere Grafana + datasource.

### Tema 5: Alerting basado en p99 · Intermedio · 90 min

Caso guía: alertar cuando la cola de latencia crece.

#### Alerta por percentil

**Definición formal.** Alerta basada en percentiles (p95/p99) para capturar experiencia de cola, no solo promedio.

**Para qué sirve.** Detecta degradación percibida por usuarios.

**Cuándo usarlo y cuándo no.** Úsalo en latencia. No solo promedio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const p99=820; const threshold=500; console.log(p99>threshold?'ALERT':'OK')"
```

**Caso de uso real.** Prometheus alert rule sobre p99.

**Error común.** Umbral sin ventana/histéresis. Corrección: `for:` y evaluación adecuada.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `ALERT`.

## Cierre del módulo

Observabilidad combina métricas, logs y trazas. Los percentiles, la estructura de logs y la propagación de contexto permiten operar microservicios con evidencia.
