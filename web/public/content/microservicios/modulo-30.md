# Módulo 30 · Proyecto final: capstone Node microservicios

El capstone integra todo el track: diseño, contratos, idempotencia, observabilidad, resiliencia, seguridad, entrega y defensa técnica. No se evalúa “que funcione en feliz camino”, sino la capacidad de justificar decisiones y operar bajo restricciones reales.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Los artefactos de verificación del capstone (contratos, idempotencia, smoke checks, ADR) se pueden ejecutar con Node. Brokers/K8s/observabilidad completa requieren infraestructura; se exigen notas honestas cuando falten.

## Aprende construyendo

### Tema 1: Alcance y arquitectura del sistema · Avanzado · 240 min

Caso guía: RutaFlow con `orders`, `catalog`, `billing` y `notifications`.

#### Diseño de capstone

**Definición formal.** Un capstone arquitectónico es un sistema integrador que demuestra diseño, implementación, operación y defensa de decisiones bajo trade-offs.

**Para qué sirve.** Convertir conocimiento aislado en criterio operativo.

**Cuándo usarlo / cuándo no.** Úsalo al final del track. No lo uses como demo sin evidencia.

**Contrato mínimo.** Contexto, bounded contexts, contratos, datos por servicio, SLOs, riesgos, plan de verificación.

**Ejemplo mínimo enfocado (ejecutable: definición de arquitectura).**

```bash
mkdir -p nm12-cap
cd nm12-cap
```

Crea el archivo `arch.mjs`:

```js
const system = {
  services: ['orders', 'catalog', 'billing', 'notifications'],
  async: ['OrderCreated', 'PaymentCaptured'],
  sync: ['GET /catalog/items/:id'],
};
console.log(system.services.length);
console.log(system.async.includes('OrderCreated'));
```

```bash
node arch.mjs
```

**Caso de uso real.** Diagrama C4 y ADRs del sistema.

**Error común.** Demasiados servicios para el alcance.

**Síntoma.** coordinación domina el trabajo. **Causa.** sobre-descomposición. **Corrección.** empezar con pocos contextos claros. **Señal observable.** cambios simples tocan 4+ repos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `4`, `true`.

### Tema 2: Contratos, idempotencia y mensajería · Avanzado · 240 min

Caso guía: evitar doble cobro y doble notificación.

#### Contrato e idempotencia

**Definición formal.** El contrato define estructura y semántica de mensajes/APIs. Idempotencia garantiza que reintentos/duplicados no generan efectos adicionales.

**Para qué sirve.** Operar seguro en at-least-once.

**Cuándo usarlo / cuándo no.** Siempre en consumidores y comandos críticos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm12-idem
cd nm12-idem
```

Crea el archivo `consumer.mjs`:

```js
const processed = new Set();
function consume(event) {
  if (!event.id || !event.type) return { status: 'invalid' };
  if (processed.has(event.id)) return { status: 'duplicate' };
  processed.add(event.id);
  return { status: 'processed' };
}
console.log(consume({ id: 'e1', type: 'OrderCreated' }).status);
console.log(consume({ id: 'e1', type: 'OrderCreated' }).status);
console.log(consume({ type: 'OrderCreated' }).status);
```

```bash
node consumer.mjs
```

**Caso de uso real.** `eventId` en Redis/DB con TTL o constraint único.

**Error común.** Idempotencia solo “si hay tiempo”.

**Síntoma.** efectos duplicados en incidentes. **Causa.** asumir exactly-once. **Corrección.** dedup/constraints/outbox. **Señal observable.** doble cobro/notificación en retries.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `processed`, `duplicate`, `invalid`.

### Tema 3: Observabilidad, resiliencia y seguridad · Avanzado · 180 min

Caso guía: detectar picos 5xx y contener dependencia caída.

#### Controles operativos

**Definición formal.** Observabilidad, resiliencia y seguridad son controles transversales: medir, degradar y proteger.

**Para qué sirve.** Mantener el sistema operable bajo fallo y abuso.

**Cuándo usarlo / cuándo no.** Siempre antes de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm12-ops
cd nm12-ops
```

Crea el archivo `ops.mjs`:

```js
function health({ db, broker }) { return db && broker ? 200 : 503; }
function allowAuth(header) { return header === 'Bearer valid'; }
console.log(health({ db: true, broker: true }));
console.log(health({ db: true, broker: false }));
console.log(allowAuth('Bearer valid'));
console.log(allowAuth('Bearer bad'));
```

```bash
node ops.mjs
```

**Caso de uso real.** Readiness probe, circuit breaker, JWT validation.

**Error común.** Liveness depende de dependencias externas.

**Síntoma.** reinicios en cascada. **Causa.** probe mal definido. **Corrección.** separar liveness/readiness. **Señal observable.** restart count sube durante outage externo.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200`, `503`, `true`, `false`.

### Tema 4: Prueba de carga, restricción sobrevenida y defensa ARB · Experto · 240 min

Caso guía: el comité impone “reducir costo 30%” o “agregar región EU”.

#### Defensa arquitectónica

**Definición formal.** Una defensa ARB (Architecture Review Board) expone contexto, decisiones, trade-offs, evidencia y respuesta a restricciones sobrevenidas.

**Para qué sirve.** Demostrar criterio, no solo implementación.

**Cuándo usarlo / cuándo no.** Úsalo al cerrar el capstone. No defiendas sin métricas/evidencia.

**Contrato mínimo.** ADRs, SLOs, resultados de smoke/load, riesgos, plan de rollback, respuesta a restricción.

**Ejemplo mínimo enfocado (ejecutable: evaluación de restricción).**

```bash
mkdir -p nm12-arb
cd nm12-arb
```

Crea el archivo `arb.mjs`:

```js
function evaluateConstraint({ p95Ms, errorRate, costDelta }) {
  return { latencyOk: p95Ms < 300, errorsOk: errorRate < 0.01, costOk: costDelta <= 0 };
}
console.log(evaluateConstraint({ p95Ms: 180, errorRate: 0.002, costDelta: -0.1 }));
```

```bash
node arb.mjs
```

**Caso de uso real.** Gatling/k6 para carga; ADR para restricción; dashboard para p95/error/costo.

**Error común.** Defender con opiniones.

**Síntoma.** decisión rechazada o frágil. **Causa.** sin evidencia. **Corrección.** métricas, trade-offs, alternativas descartadas. **Señal observable.** no hay números en la defensa.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{ latencyOk: true, errorsOk: true, costOk: true }`. **Nota de verificación:** pruebas de carga reales (k6/Gatling) y ARB son actividades de entorno/equipo; se entrega criterio y artefactos verificables.

## Cierre

El capstone Node demuestra madurez: contratos claros, idempotencia, observabilidad, resiliencia, seguridad y entrega segura. El resultado no es “microservicios por moda”, sino un sistema defendible con evidencia.

## Checklist

- Bounded contexts y ownership de datos definidos.
- Contratos versionados e idempotencia implementada.
- Logs/métricas/traces correlacionables.
- Probes, CI y estrategia de despliegue.
- ADRs y defensa ante restricción con evidencia.
