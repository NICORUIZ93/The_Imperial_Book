# Módulo 7 · Arquitectura, consistencia y evolución en Node

Los patrones técnicos no salvan una mala frontera de servicio. Este módulo cierra la capa experta: límites con DDD, consistencia distribuida con outbox/sagas, anti-patrones, migración incremental, gobernanza ligera y evidencia operativa. El foco es tomar decisiones defendibles en Node/TypeScript.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Los ejemplos de límites, outbox, idempotencia, anti-patrones y fitness functions se ejecutan con Node. Debezium/Temporal/K8s reales se tratan con **Nota de verificación**.

## Aprende construyendo

### Tema 1: DDD y bounded contexts en Node · Avanzado · 150 min

Caso guía: separar `orders`, `billing` y `catalog` sin crear un monolito distribuido.

#### Bounded context

**Definición formal.** Un bounded context es un límite donde un modelo de dominio tiene significado consistente. Dentro del límite, términos, reglas e invariantes son coherentes; entre límites, se integra por contratos.

**Para qué sirve.** Reducir acoplamiento semántico y técnico, y asignar ownership claro.

**Cuándo usarlo / cuándo no.** Úsalo cuando el dominio tiene reglas y lenguaje propios. No crees microservicios por capa técnica; no compartas DB entre contextos.

**Contrato mínimo.** Contexto, entidades/agregados, invariantes, eventos publicados, API consumida, owner.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm11-ddd
cd nm11-ddd
```

Crea el archivo `context.mjs`:

```js
const contexts = {
  orders: { owns: ['Order'], publishes: ['OrderCreated'], consumes: ['StockReserved'] },
  billing: { owns: ['Payment'], publishes: ['PaymentCaptured'], consumes: ['OrderCreated'] },
};
function canOwn(context, entity) { return contexts[context]?.owns.includes(entity) ?? false; }
console.log(canOwn('orders', 'Order'));
console.log(canOwn('billing', 'Order'));
```

```bash
node context.mjs
```

**Caso de uso real.** `orders` no actualiza tablas de `billing`; se integra por evento/API.

**Error común.** Microservicios por capa (API service, DB service).

**Síntoma.** cada cambio cruza muchos servicios. **Causa.** límites técnicos, no de dominio. **Corrección.** bounded contexts por capacidad de negocio. **Señal observable.** deploys coordinados frecuentes.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `false`.

### Tema 2: Outbox y consistencia eventual · Avanzado · 150 min

Caso guía: guardar pedido y publicar evento sin perder mensajes.

#### Transactional outbox

**Definición formal.** El patrón outbox escribe el cambio de negocio y un registro de evento en la misma transacción local; un relay publica luego el evento al broker.

**Para qué sirve.** Evitar dual write inconsistente entre DB y broker.

**Cuándo usarlo / cuándo no.** Úsalo cuando DB y broker no comparten transacción. No lo uses si el cambio no necesita evento confiable.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm11-outbox
cd nm11-outbox
```

Crea el archivo `outbox.mjs`:

```js
const db = { orders: [], outbox: [], published: [] };
function createOrder(order) {
  db.orders.push(order); // misma "transacción" local simulada
  db.outbox.push({ id: `evt-${order.id}`, type: 'OrderCreated', payload: order, published: false });
}
function relay() {
  for (const e of db.outbox.filter(e => !e.published)) {
    db.published.push(e); e.published = true;
  }
}
createOrder({ id: 'o1' });
console.log(db.outbox.length);
relay();
console.log(db.published.length);
console.log(db.outbox[0].published);
```

```bash
node outbox.mjs
```

**Caso de uso real.** Postgres outbox + Debezium/Kafka Connect.

**Error común.** Publicar al broker antes de commit DB.

**Síntoma.** evento existe pero pedido no, o al revés. **Causa.** dual write sin atomicidad. **Corrección.** outbox/CDC, idempotencia consumidor. **Señal observable.** inconsistencias ante fallos entre DB y publish.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `1`, `1`, `true`. **Nota de verificación:** Debezium/CDC real requiere infraestructura.

### Tema 3: Sagas y compensaciones · Avanzado · 120 min

Caso guía: order -> payment -> inventory con compensación.

#### Saga distribuida

**Definición formal.** Saga coordina pasos locales con compensaciones; garantiza consistencia eventual de negocio, no aislamiento ACID global.

**Para qué sirve.** Procesos multi-servicio sin 2PC.

**Cuándo usarlo / cuándo no.** Úsala cuando hay compensaciones claras. No la uses para invariantes que deben ser atómicas en un mismo agregado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm11-saga
cd nm11-saga
```

Crea el archivo `saga.mjs`:

```js
const steps = [];
async function saga() {
  steps.push('reserve');
  steps.push('charge:fail');
  steps.push('compensate:release');
  return { ok: false, steps };
}
console.log((await saga()).steps.includes('compensate:release'));
```

```bash
node saga.mjs
```

**Caso de uso real.** Orquestador con Temporal o coreografía por eventos.

**Error común.** Saga sin idempotencia.

**Síntoma.** compensaciones o pasos duplicados. **Causa.** reintentos at-least-once. **Corrección.** idempotency keys y estado persistido. **Señal observable.** efectos duplicados con mismo ID de negocio.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`. **Nota de verificación:** Temporal/NestJS CQRS real no ejecutado.

### Tema 4: Anti-patrones y monolito distribuido · Avanzado · 120 min

Caso guía: detectar cuando “microservicios” empeoró el sistema.

#### Anti-patrones

**Definición formal.** Un monolito distribuido es un sistema dividido en despliegues separados pero acoplado en datos, releases o llamadas síncronas, heredando complejidad distribuida sin autonomía.

**Para qué sirve.** Reconocer señales de mal diseño antes de escalar el daño.

**Cuándo usarlo / cuándo no.** Usa esta lista como diagnóstico, no como excusa para nunca dividir.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm11-anti
cd nm11-anti
```

Crea el archivo `anti.mjs`:

```js
function smell(metrics) {
  const smells = [];
  if (metrics.sharedDb) smells.push('shared-db');
  if (metrics.syncChain > 3) smells.push('chatty-sync-chain');
  if (metrics.coordinatedDeploys) smells.push('lockstep-deploy');
  return smells;
}
console.log(smell({ sharedDb: true, syncChain: 5, coordinatedDeploys: true }).length);
```

```bash
node anti.mjs
```

**Caso de uso real.** Auditoría de arquitectura antes de extraer otro servicio.

**Error común.** Dividir por repositorios, no por ownership.

**Síntoma.** más incidentes y menor velocidad. **Causa.** acoplamiento distribuido. **Corrección.** consolidar límites, contracts, async donde aplique. **Señal observable.** lead time sube, MTTR sube.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `3`.

### Tema 5: Strangler Fig y métricas DORA · Avanzado · 120 min

Caso guía: migrar un monolito Node sin big bang.

#### Migración incremental

**Definición formal.** Strangler Fig enruta gradualmente capacidades desde el sistema legado al nuevo, hasta retirar el legado. DORA mide delivery performance: deployment frequency, lead time, change failure rate, MTTR.

**Para qué sirve.** Reducir riesgo de migración y medir mejora real.

**Cuándo usarlo / cuándo no.** Úsalo en sistemas vivos con riesgo alto. No hagas big bang sin necesidad extrema.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm11-strangler
cd nm11-strangler
```

Crea el archivo `strangler.mjs`:

```js
function route(capability, migrated) { return migrated.has(capability) ? 'new' : 'legacy'; }
const migrated = new Set(['catalog']);
console.log(route('catalog', migrated));
console.log(route('orders', migrated));
const dora = { deployFrequency: 'daily', leadTimeHours: 24, changeFailRate: 0.1, mttrHours: 2 };
console.log(dora.deployFrequency);
```

```bash
node strangler.mjs
```

**Caso de uso real.** Gateway enruta `/catalog` a nuevo servicio y resto al monolito.

**Error común.** No medir antes/después.

**Síntoma.** migración “terminada” pero peor operación. **Causa.** no hay baseline. **Corrección.** métricas DORA/SLI antes y después. **Señal observable.** MTTR y change failure rate empeoran.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `new`, `legacy`, `daily`.

### Tema 6: ADRs y fitness functions · Intermedio · 90 min

Caso guía: registrar por qué se eligió Kafka sobre RabbitMQ.

#### Gobernanza ligera

**Definición formal.** Un ADR (Architecture Decision Record) documenta una decisión, contexto, opciones, decisión y consecuencias. Una fitness function es una prueba automatizada que verifica una característica arquitectónica.

**Para qué sirve.** Preservar criterio y evitar regresiones arquitectónicas.

**Cuándo usarlo / cuándo no.** Úsalo en decisiones con trade-offs y costo de reversión. No escribas ADRs para todo detalle trivial.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm11-adr
cd nm11-adr
```

Crea el archivo `adr.mjs`:

```js
const adr = { id: 'ADR-001', decision: 'Use Kafka for order events', status: 'accepted', consequences: ['ops complexity', 'high throughput'] };
console.log(adr.status);
function noSharedDb(deps) { return deps.every(d => d.dbOwner === d.service); }
console.log(noSharedDb([{ service: 'orders', dbOwner: 'orders' }, { service: 'billing', dbOwner: 'billing' }]));
```

```bash
node adr.mjs
```

**Caso de uso real.** ArchUnit/fitness checks en CI para prohibir imports cruzados.

**Error común.** ADR sin consecuencias.

**Síntoma.** decisiones repetidas o mal entendidas. **Causa.** falta contexto y trade-offs. **Corrección.** ADR corto con consecuencias y estado. **Señal observable.** debates recurrentes sobre la misma decisión.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `accepted`, `true`.

## Cierre

La arquitectura experta no es “más servicios”: es límites claros, consistencia explícita, migración incremental, métricas y decisiones registradas. En Node, la disciplina de contratos e idempotencia es tan importante como el framework.

## Checklist

- Bounded contexts con ownership de datos.
- Outbox/saga/compensaciones para consistencia eventual.
- Anti-patrones identificados con métricas.
- Migración Strangler con baseline DORA.
- ADRs y fitness functions para gobernanza.
