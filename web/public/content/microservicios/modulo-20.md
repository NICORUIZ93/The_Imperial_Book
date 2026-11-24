# Módulo 20 · Mensajería y patrones de datos en Node

La mensajería asíncrona desacopla servicios, pero introduce entrega at-least-once, orden parcial, duplicados, mensajes venenosos y consistencia eventual. Este módulo cubre patrones prácticos en Node para operar mensajería con seguridad: confirms/acks, deduplicación, sagas, compensaciones, event sourcing, proyecciones y CQRS.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Los patrones de idempotencia, saga, compensación, event sourcing y proyección se ejecutan con Node. RabbitMQ, Redis, NestJS CQRS, EventStoreDB/MongoDB requieren infraestructura/dependencias; se incluyen con **Nota de verificación**.

## Aprende construyendo

### Tema 1: RabbitMQ: publisher confirms, consumer acknowledgments · Avanzado · 150 min

Caso guía: publicar un evento de pedido sin perder mensajes ni reprocesarlos ciegamente.

#### Confirms y acks

**Definición formal.** Publisher confirms es el mecanismo de RabbitMQ donde el broker confirma que recibió/persistió un mensaje publicado. Consumer acknowledgments (ack/nack/reject) indican al broker si el consumidor procesó el mensaje; sin ack, el mensaje puede ser reentregado.

**Para qué sirve.** Controlar entrega y evitar pérdida silenciosa.

**Cuándo usarlo / cuándo no.** Úsalo en flujos donde perder mensajes es inaceptable. No uses auto-ack en procesamiento no trivial; no hagas ack antes de persistir el efecto.

**Contrato mínimo.** Confirmar publicación, procesar, persistir efecto, ack; en fallo, nack/retry/DLQ según política.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm9-ack
cd nm9-ack
```

Crea el archivo `ack.mjs`:

```js
class BrokerSim {
  constructor() { this.queue = []; this.dlq = []; }
  publish(msg) { this.queue.push({ ...msg, attempts: 0 }); return { confirmed: true }; }
  consume(handler) {
    const msg = this.queue.shift();
    if (!msg) return null;
    try { handler(msg); return 'ack'; }
    catch (e) {
      msg.attempts++;
      if (msg.attempts >= 2) { this.dlq.push({ ...msg, error: e.message }); return 'dlq'; }
      this.queue.push(msg); return 'nack';
    }
  }
}
const b = new BrokerSim();
console.log(b.publish({ id: 'm1' }).confirmed);
console.log(b.consume(() => { throw new Error('bad'); }));
console.log(b.consume(() => { throw new Error('bad'); }));
console.log(b.dlq.length);
```

```bash
node ack.mjs
```

**Caso de uso real.** `amqplib` con confirm channel y `channel.ack(msg)` tras persistir.

**Error común.** Auto-ack o ack prematuro.

**Síntoma.** mensajes perdidos al caer el consumidor. **Causa.** broker considera entregado antes de procesar. **Corrección.** ack manual post-efecto, idempotencia, DLQ. **Señal observable.** gaps en eventos procesados tras reinicios.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `nack`, `dlq`, `1`. **Nota de verificación:** RabbitMQ real requiere broker y `npm i amqplib`.

### Tema 2: Deduplicación con Redis · Avanzado · 120 min

Caso guía: el mismo `eventId` llega dos veces por reentrega.

#### Idempotencia por clave

**Definición formal.** La deduplicación idempotente registra claves de eventos procesados y evita aplicar el efecto más de una vez. Redis se usa comúnmente por su latencia y TTL.

**Para qué sirve.** Hacer seguro el procesamiento at-least-once.

**Cuándo usarlo / cuándo no.** Úsalo en consumidores con efectos secundarios. No lo uses sin TTL/política de retención; no asumas que la dedup en memoria funciona con múltiples réplicas.

**Contrato mínimo.** Clave única (`eventId`), ventana/TTL, operación atómica de “claim”, efecto, confirmación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm9-dedup
cd nm9-dedup
```

Crea el archivo `dedup.mjs`:

```js
class DedupStore {
  constructor() { this.keys = new Set(); }
  claim(key) { if (this.keys.has(key)) return false; this.keys.add(key); return true; }
}
const store = new DedupStore();
function handle(evt) {
  if (!store.claim(evt.id)) return 'duplicate';
  return `processed:${evt.orderId}`;
}
console.log(handle({ id: 'evt-1', orderId: 'o1' }));
console.log(handle({ id: 'evt-1', orderId: 'o1' }));
```

```bash
node dedup.mjs
```

**Caso de uso real.** Redis `SET eventId 1 NX EX 86400` antes de aplicar efecto.

**Error común.** Deduplicar después del efecto.

**Síntoma.** duplicados con efectos ya aplicados. **Causa.** la ventana de carrera ocurre entre efecto y registro. **Corrección.** claim atómico antes del efecto o transacción/outbox según caso. **Señal observable.** doble cargo/registro con misma clave de negocio.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `processed:o1`, `duplicate`. **Nota de verificación:** Redis real requiere instancia Redis y cliente.

### Tema 3: Sagas con NestJS CQRS · Avanzado · 180 min

Caso guía: crear pedido implica reservar inventario y cobrar; si cobro falla, compensar reserva.

#### Saga

**Definición formal.** Una saga coordina una transacción distribuida como secuencia de pasos locales con compensaciones. Puede ser coreografiada (eventos) u orquestada (coordinador central).

**Para qué sirve.** Mantener consistencia de negocio entre servicios sin 2PC.

**Cuándo usarlo / cuándo no.** Úsalo en procesos multi-servicio con compensaciones claras. No la uses si una transacción local basta; no ignores compensaciones imposibles.

**Contrato mínimo.** Estados, comandos/eventos, pasos, compensaciones, idempotencia, timeout/reintentos, observabilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm9-saga
cd nm9-saga
```

Crea el archivo `saga.mjs`:

```js
async function runSaga() {
  const state = { reserved: false, charged: false };
  try {
    state.reserved = true; // reserve inventory
    throw new Error('payment_failed'); // charge
    state.charged = true;
    return { ok: true, state };
  } catch (e) {
    if (state.reserved && !state.charged) state.reserved = false; // compensate
    return { ok: false, error: e.message, state };
  }
}
console.log(await runSaga());
```

```bash
node saga.mjs
```

**Caso de uso real.** NestJS CQRS con comandos/eventos y saga que reacciona a `PaymentFailed`.

**Error común.** Compensaciones no idempotentes.

**Síntoma.** compensación aplicada dos veces deja estado inconsistente. **Causa.** reintentos duplican efecto. **Corrección.** idempotency key por paso/compensación. **Señal observable.** inventario liberado dos veces o saldo inconsistente.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{ ok: false, error: 'payment_failed', state: { reserved: false, charged: false } }`. **Nota de verificación:** NestJS CQRS real requiere `@nestjs/cqrs`.

### Tema 4: Compensaciones idempotentes · Avanzado · 120 min

Caso guía: reintentar `releaseInventory` no debe liberar stock dos veces.

#### Compensación

**Definición formal.** Una compensación es una acción que revierte el efecto de negocio de un paso previo; debe diseñarse para ser segura ante reintentos.

**Para qué sirve.** Recuperar consistencia ante fallos posteriores en una saga.

**Cuándo usarlo / cuándo no.** Úsala cuando el paso es reversible lógicamente. No asumas que toda acción es compensable; algunas requieren compensación de negocio (reembolso, nota de crédito).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm9-comp
cd nm9-comp
```

Crea el archivo `comp.mjs`:

```js
const released = new Set();
function releaseReservation(reservationId) {
  if (released.has(reservationId)) return 'already_released';
  released.add(reservationId);
  return 'released';
}
console.log(releaseReservation('r1'));
console.log(releaseReservation('r1'));
```

```bash
node comp.mjs
```

**Caso de uso real.** `RefundPayment` con `refundId` idempotente.

**Error común.** Tratar compensación como rollback de DB.

**Síntoma.** efectos externos no revertidos o revertidos mal. **Causa.** confundir transacción local ACID con proceso distribuido. **Corrección.** modelar compensación de negocio explícita. **Señal observable.** cliente cobrado sin pedido, o doble reembolso.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `released`, `already_released`.

### Tema 5: Event Sourcing con EventStoreDB o MongoDB · Avanzado · 180 min

Caso guía: auditar todos los cambios de un pedido.

#### Event sourcing

**Definición formal.** Event sourcing persiste el estado como secuencia append-only de eventos; el estado actual se obtiene replegando eventos.

**Para qué sirve.** Auditoría, reconstrucción temporal, integración por eventos.

**Cuándo usarlo / cuándo no.** Úsalo cuando el historial es valor de negocio. No lo uses por defecto en CRUD simple; implica complejidad de versionado, snapshots y proyecciones.

**Contrato mínimo.** Evento inmutable, versión/orden, stream por agregado, replay determinista, esquema evolutivo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm9-es
cd nm9-es
```

Crea el archivo `es.mjs`:

```js
const events = [];
function append(evt) { events.push({ ...evt, version: events.length + 1 }); }
append({ type: 'OrderCreated', orderId: 'o1' });
append({ type: 'ItemAdded', orderId: 'o1', sku: 'A1' });
append({ type: 'OrderConfirmed', orderId: 'o1' });
const state = events.reduce((s, e) => {
  if (e.type === 'OrderCreated') return { ...s, status: 'created', items: [] };
  if (e.type === 'ItemAdded') return { ...s, items: [...s.items, e.sku] };
  if (e.type === 'OrderConfirmed') return { ...s, status: 'confirmed' };
  return s;
}, {});
console.log(state.status);
console.log(state.items.length);
console.log(events.length);
```

```bash
node es.mjs
```

**Caso de uso real.** EventStoreDB almacena streams; MongoDB puede usarse como append log con cuidado.

**Error común.** Mutar eventos existentes.

**Síntoma.** auditoría rota, proyecciones inconsistentes. **Causa.** tratar event store como tabla CRUD. **Corrección.** append-only, eventos correctivos, versionado. **Señal observable.** hashes/versiones de stream cambian.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `confirmed`, `1`, `3`. **Nota de verificación:** EventStoreDB/MongoDB reales no ejecutados aquí.

### Tema 6: Proyecciones materializadas · Intermedio · 120 min

Caso guía: pantalla de listado necesita consulta rápida sin replay completo.

#### Proyección

**Definición formal.** Una proyección es una vista derivada construida desde eventos o cambios de escritura, optimizada para lectura.

**Para qué sirve.** Separar escritura de lectura y acelerar consultas.

**Cuándo usarlo / cuándo no.** Úsala cuando las lecturas tienen forma distinta a la escritura. No la uses si añade complejidad sin beneficio; maneja retraso eventual.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm9-proj
cd nm9-proj
```

Crea el archivo `proj.mjs`:

```js
const projection = new Map();
function project(event) {
  if (event.type === 'OrderCreated') projection.set(event.orderId, { id: event.orderId, status: 'created' });
  if (event.type === 'OrderConfirmed') projection.get(event.orderId).status = 'confirmed';
}
project({ type: 'OrderCreated', orderId: 'o1' });
project({ type: 'OrderConfirmed', orderId: 'o1' });
console.log(projection.get('o1').status);
```

```bash
node proj.mjs
```

**Caso de uso real.** Proyección en Mongo/Postgres/Elasticsearch para queries.

**Error común.** Asumir proyección siempre actualizada.

**Síntoma.** UI muestra estado viejo. **Causa.** eventual consistency entre write model y read model. **Corrección.** comunicar consistencia eventual, versionar lecturas, polling/notifications. **Señal observable.** read-after-write falla intermitentemente.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `confirmed`.

### Tema 7: CQRS · Intermedio · 120 min

Caso guía: escrituras con reglas complejas y lecturas optimizadas para dashboard.

#### CQRS

**Definición formal.** Command Query Responsibility Segregation separa modelos de comando (escritura) y consulta (lectura). Puede compartir DB o usar modelos distintos.

**Para qué sirve.** Optimizar lectura/escritura por separado y escalar modelos distintos.

**Cuándo usarlo / cuándo no.** Úsalo cuando lectura y escritura tienen necesidades muy distintas. No lo uses por defecto en CRUD simple.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm9-cqrs
cd nm9-cqrs
```

Crea el archivo `cqrs.mjs`:

```js
const writeDb = new Map();
const readDb = new Map();
function commandCreate(id) { writeDb.set(id, { id, status: 'created' }); readDb.set(id, { id, status: 'created' }); }
function queryById(id) { return readDb.get(id); }
commandCreate('o1');
console.log(queryById('o1').status);
console.log(writeDb.has('o1'));
```

```bash
node cqrs.mjs
```

**Caso de uso real.** NestJS CQRS separa command handlers y query handlers.

**Error común.** Usar CQRS sin necesidad.

**Síntoma.** más código/infra, bugs de sincronización. **Causa.** complejidad accidental. **Corrección.** empezar simple, extraer CQRS cuando el dolor sea real. **Señal observable.** muchas proyecciones para casos CRUD básicos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `created`, `true`. **Nota de verificación:** NestJS CQRS real requiere dependencia.

## Cierre

En mensajería, la entrega es fácil; la corrección bajo duplicados, fallos y reordenamiento es lo difícil. Acks, deduplicación, sagas, compensaciones y proyecciones convierten el “happy path” en un flujo operable.

## Checklist

- Uso ack manual y DLQ.
- Hago consumidores idempotentes.
- Diseño compensaciones idempotentes.
- Entiendo eventual consistency en proyecciones/CQRS.
- No aplico event sourcing/CQRS sin necesidad real.
