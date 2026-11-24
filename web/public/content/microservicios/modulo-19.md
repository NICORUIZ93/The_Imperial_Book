# Módulo 19 · Observabilidad en Node.js

Un microservicio sin observabilidad es una caja negra: falla, pero no puedes explicar dónde, por qué ni cuánto impacto tiene. Observabilidad combina **logs, métricas y traces** para responder preguntas nuevas sin redesplegar código a ciegas. En Node, además, hay que observar el event loop y propagar contexto entre HTTP y mensajería.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Los ejemplos de correlación, logs estructurados y métricas se ejecutan con Node. OpenTelemetry SDK/exporters, Prometheus server, Grafana, Loki/ELK requieren dependencias/infra; se incluyen con **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: OpenTelemetry para Node · Avanzado · 150 min

Caso guía: una request entra por HTTP, llama a inventory y publica un evento; necesitas ver el recorrido completo.

#### Trazas y spans

**Definición formal.** Una traza representa una transacción distribuida; está compuesta por spans. Cada span tiene nombre, tiempo de inicio/fin, atributos, estado y contexto padre-hijo. OpenTelemetry (OTel) es un estándar/vendor-neutral para instrumentar traces, métricas y logs.

**Para qué sirve.** Explicar latencia end-to-end y localizar el salto donde ocurre el fallo.

**Cuándo usarlo / cuándo no.** Úsalo en sistemas con múltiples servicios/saltos. No lo uses como reemplazo de logs/métricas; no instrumentes todo con alta cardinalidad en atributos.

**Contrato mínimo.** Nombre de span, kind, status, atributos de bajo cardinalidad, propagación de contexto, exportador/collector.

**Ejemplo mínimo enfocado (ejecutable: modelo de span y contexto).**

```bash
mkdir -p nm8-otel
cd nm8-otel
```

Crea el archivo `trace.mjs`:

```js
import { randomUUID } from 'node:crypto';
function startSpan(name, parent) {
  return { traceId: parent?.traceId ?? randomUUID(), spanId: randomUUID(), parentId: parent?.spanId, name, start: Date.now(), attrs: {} };
}
function endSpan(span, ok = true) {
  return { ...span, durationMs: Date.now() - span.start, status: ok ? 'OK' : 'ERROR' };
}
const root = startSpan('POST /orders');
const child = startSpan('inventory.reserve', root);
const ended = endSpan(child, true);
console.log(root.traceId === child.traceId);
console.log(ended.parentId === root.spanId);
console.log(ended.status);
```

```bash
node trace.mjs
```

**Caso de uso real.** OTel Node SDK auto-instrumenta HTTP/Express; spans manuales cubren lógica de negocio.

**Error común.** Alta cardinalidad en atributos.

**Síntoma.** backend de observabilidad caro/lento, índices explotados. **Causa.** usar `userId`, `orderId` crudo o URL completa como atributo indexado sin control. **Corrección.** atributos de baja cardinalidad (`route`, `status_code`, `service`); IDs en logs/trazas muestreadas con criterio. **Señal observable.** facturas/almacenamiento de observabilidad crecen desproporcionadamente.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `true`, `OK`. **Nota de verificación:** OTel real requiere `npm i @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http` y un collector/Jaeger; no se ejecutó exportación real por no haber collector en el entorno.

### Tema 2: Propagación de traceparent en AMQP/Kafka · Avanzado · 120 min

Caso guía: el servicio publica un evento en RabbitMQ/Kafka y el consumidor debe continuar la traza.

#### Propagación de contexto

**Definición formal.** La propagación de contexto transmite identificadores de traza entre procesos. W3C Trace Context define headers como `traceparent` y `tracestate`. En mensajería, se propagan en headers/metadata del mensaje.

**Para qué sirve.** Conectar productor y consumidor en la misma traza distribuida.

**Cuándo usarlo / cuándo no.** Úsalo siempre que haya async messaging entre servicios observados. No asumas que el broker propaga contexto automáticamente; debes inyectar/extraer.

**Contrato mínimo.** Formato W3C, inyectar al publicar, extraer al consumir, crear span hijo con parent extraído.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm8-prop
cd nm8-prop
```

Crea el archivo `propagate.mjs`:

```js
function inject(traceId, spanId) {
  return `00-${traceId}-${spanId}-01`; // version-traceId-parentId-flags
}
function extract(traceparent) {
  const [version, traceId, spanId, flags] = traceparent.split('-');
  return { version, traceId, spanId, flags };
}
const header = inject('4bf92f3577b34da6a3ce929d0e0e4736', '00f067aa0ba902b7');
const msg = { headers: { traceparent: header }, body: { orderId: 'o1' } };
const ctx = extract(msg.headers.traceparent);
console.log(ctx.traceId === '4bf92f3577b34da6a3ce929d0e0e4736');
console.log(ctx.spanId === '00f067aa0ba902b7');
```

```bash
node propagate.mjs
```

**Caso de uso real.** Kafka headers o AMQP properties llevan `traceparent`; consumidor crea span `process OrderCreated` como hijo.

**Error común.** No propagar contexto en mensajes.

**Síntoma.** traza se corta en el productor; consumidor aparece como traza nueva. **Causa.** no inyectar/extractar headers. **Corrección.** instrumentación OTel messaging o propagación manual W3C. **Señal observable.** dos traceIds distintos para el mismo flujo de negocio.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `true`.

### Tema 3: Pino/Winston · Intermedio · 90 min

Caso guía: ante un error 500, necesitas encontrar el request, usuario, servicio y traza en segundos.

#### Logging estructurado

**Definición formal.** Logging estructurado emite logs como objetos con campos consistentes (JSON), en lugar de texto libre. Pino y Winston son loggers Node; Pino prioriza rendimiento y JSON.

**Para qué sirve.** Buscar, filtrar y correlacionar logs en agregadores (Loki/ELK).

**Cuándo usarlo / cuándo no.** Úsalo en producción y sistemas distribuidos. No uses `console.log` con strings concatenados como estrategia principal; no loguees secretos/PII.

**Contrato mínimo.** timestamp, level, service, env, msg, requestId/traceId, error stack; redacción de campos sensibles.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm8-log
cd nm8-log
```

Crea el archivo `log.mjs`:

```js
function log(level, msg, fields = {}) {
  const entry = { ts: new Date().toISOString(), level, service: 'orders', ...fields, msg };
  console.log(JSON.stringify(entry));
}
log('info', 'order.created', { orderId: 'o1', traceId: 't1' });
log('error', 'db.timeout', { traceId: 't1', err: { code: 'ETIMEDOUT' } });
```

```bash
node log.mjs
```

**Caso de uso real.** Pino con `pino-http` agrega requestId; logs van a stdout y Loki/ELK los ingesta.

**Error común.** Loguear PII o secretos.

**Síntoma.** incidente de seguridad/compliance. **Causa.** serializar body completo o headers de auth. **Corrección.** redacción/allowlist de campos, revisión de logs, políticas de retención. **Señal observable.** hallazgos en auditoría DLP/seguridad.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: dos líneas JSON con `level`, `service`, `traceId`. **Nota de verificación:** Pino real `npm i pino`; Winston `npm i winston`.

### Tema 4: ELK o Grafana Loki · Intermedio · 90 min

Caso guía: centralizar logs de 20 réplicas.

#### Agregación de logs

**Definición formal.** Un stack de agregación recolecta, indexa/almacena y permite consultar logs. ELK (Elasticsearch, Logstash, Kibana) indexa contenido; Grafana Loki indexa etiquetas y almacena líneas comprimidas, optimizando costo.

**Para qué sirve.** Buscar logs por servicio, traceId, nivel o ventana temporal sin entrar a cada contenedor.

**Cuándo usarlo / cuándo no.** Úsalo cuando hay múltiples instancias/servicios. No envíes logs no estructurados si puedes evitarlo; no indexes campos de alta cardinalidad sin necesidad.

**Contrato mínimo.** Labels/tags consistentes, retención, control de cardinalidad, acceso RBAC.

**Ejemplo mínimo enfocado (ejecutable: query por label).**

```bash
mkdir -p nm8-loki
cd nm8-loki
```

Crea el archivo `labels.mjs`:

```js
const logs = [
  { labels: { service: 'orders', level: 'error' }, msg: 'timeout' },
  { labels: { service: 'orders', level: 'info' }, msg: 'created' },
  { labels: { service: 'billing', level: 'error' }, msg: 'declined' },
];
const result = logs.filter(l => l.labels.service === 'orders' && l.labels.level === 'error');
console.log(result.length);
console.log(result[0].msg);
```

```bash
node labels.mjs
```

**Caso de uso real.** Loki + Promtail/Alloy recolecta stdout de Kubernetes; Grafana consulta `{service="orders", level="error"}`.

**Error común.** Usar labels de alta cardinalidad.

**Síntoma.** Loki lento/caro o rechaza streams. **Causa.** poner `userId` o `requestId` como label. **Corrección.** labels de baja cardinalidad; IDs en el contenido JSON. **Señal observable.** aumento de streams/chunks y errores de ingesta.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `1`, `timeout`. **Nota de verificación:** ELK/Loki requieren infraestructura; no levantados en esta ejecución.

### Tema 5: Prometheus client · Intermedio · 120 min

Caso guía: alertar cuando el p99 o la tasa de errores sube.

#### Métricas RED/USE

**Definición formal.** Las métricas son series numéricas agregables en el tiempo. RED (Rate, Errors, Duration) aplica a servicios; USE (Utilization, Saturation, Errors) a recursos. Prometheus recolecta métricas por scrape y `prom-client` expone métricas en Node.

**Para qué sirve.** Detectar síntomas, capacity planning y alertas.

**Cuándo usarlo / cuándo no.** Úsalo para señales agregadas. No uses métricas para detalles por request individual; no pongas labels de alta cardinalidad.

**Contrato mínimo.** Nombre, tipo (counter/gauge/histogram), labels bajos en cardinalidad, endpoint `/metrics`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm8-metrics
cd nm8-metrics
```

Crea el archivo `metrics.mjs`:

```js
class Counter {
  constructor() { this.values = new Map(); }
  inc(labels = {}, n = 1) {
    const key = JSON.stringify(labels);
    this.values.set(key, (this.values.get(key) || 0) + n);
  }
  get(labels = {}) { return this.values.get(JSON.stringify(labels)) || 0; }
}
const httpRequests = new Counter();
httpRequests.inc({ route: '/orders', status: '200' });
httpRequests.inc({ route: '/orders', status: '500' });
httpRequests.inc({ route: '/orders', status: '200' });
console.log(httpRequests.get({ route: '/orders', status: '200' }));
console.log(httpRequests.get({ route: '/orders', status: '500' }));
```

```bash
node metrics.mjs
```

**Caso de uso real.** `prom-client` histogram para latencia, counter para errores, gauge para conexiones activas.

**Error común.** Cardinalidad alta en labels.

**Síntoma.** Prometheus OOM/lento. **Causa.** labels como `userId`, `path` con IDs. **Corrección.** usar `route` normalizada, limitar labels, revisar métricas. **Señal observable.** crecimiento de series activas.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `2`, `1`. **Nota de verificación:** Prometheus real requiere `npm i prom-client` y servidor Prometheus/Grafana.

## Cierre

Observabilidad no es “poner logs”. Es diseñar señales correlacionables: traces para recorrido, métricas para síntomas, logs estructurados para detalle. En Node, propaga contexto por HTTP y mensajería y cuida cardinalidad.

## Checklist

- Emito logs JSON con `traceId/requestId`.
- Propago `traceparent` en HTTP y mensajería.
- Mido RED con labels de baja cardinalidad.
- No logueo secretos/PII.
- Tengo ruta de verificación o nota honesta para OTel/Prometheus/Loki.
