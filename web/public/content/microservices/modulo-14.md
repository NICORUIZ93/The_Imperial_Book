# Módulo 14 · Consistencia distribuida

**Fase 3 · Nivel maestro: arquitectura avanzada** (semana 2 de 8). **Duración:** 12 h (5 temas de unos 110 min y
2 h 50 min de laboratorio integrador). **Dificultad:** 5 de 5. **Dependencias:** Módulo 22 (confirms, deduplicación,
sagas coreografiadas y compensaciones), Módulo 18 (KafkaJS) y Módulo 15 (PostgreSQL). **Herramientas:**Node.js
26.13.1 LTS**, **pg 8.23.1** con **PostgreSQL 18.7**, **kafkajs 2.2.4** con **Apache Kafka 4.4.0**, **Debezium 3.7**
(Kafka Connect, imagen `quay.io/debezium/connect:3.7`; la estable es 3.7.1.Final) y **@temporalio/client, worker,
workflow, activity y testing 1.26.0** (Temporal Server 1.32.1 o el servidor de desarrollo del CLI). 
responde; los comandos de verificación indicados levanta PostgreSQL, Kafka y Debezium, arranca Temporal y lo exige todo).

En el Módulo 22 aprendiste a no perder mensajes y a deshacer pasos con compensaciones. Este módulo responde la
pregunta de fondo: **¿cómo mantienes coherentes los datos de varios servicios sin una transacción que los abarque a
todos?** La respuesta tiene cinco piezas: publicar un evento **si y solo si** se guardó el cambio (outbox), coordinar
procesos largos con un **orquestador durable** (Temporal), aceptar que llegarán **duplicados** y neutralizarlos
(idempotencia), saber **qué cubre de verdad** «exactly-once» y entender **por qué** la transacción distribuida clásica
(2PC) no es la respuesta entre microservicios.

```mermaid
flowchart LR
    T1["1 · Outbox + CDC<br/>con Debezium"] --> T3["3 · Idempotencia en<br/>consumidores Kafka"]
    T3 --> T4["4 · Exactly-once<br/>en la práctica"]
    T2["2 · Sagas orquestadas<br/>con Temporal"] --> T5["5 · 2PC: por qué<br/>no usar"]
    T4 --> T5
```

**Texto alternativo:** mapa del módulo. El tema 1 (outbox y CDC con Debezium) lleva al tema 3 (idempotencia en
consumidores Kafka), que lleva al tema 4 (exactly-once en la práctica). En paralelo, el tema 2 (sagas orquestadas con
Temporal) lleva al tema 5 (Two-Phase Commit: por qué no usar), al que también llega el tema 4.

**Cómo usar el laboratorio.** Con Node 26 y Docker:

```bash
npm ci
docker compose up -d --wait         # PostgreSQL :5432 · Kafka :9092 · Kafka Connect + Debezium :8083
  # tests + demos + errores comunes de las 5 fichas → «RESULTADO: OK»
docker compose down -v
```

PostgreSQL para todo lo esencial; Kafka y Debezium solo para el tramo final de cada una. La ficha 2 necesita un
servidor Temporal solo para sus tests de integración: `temporal.infra.js` lo descarga y lo arranca (necesita internet
la primera vez).

`package.json` del laboratorio (con `package-lock.json` que fija el árbol completo):

```json
{
  "name": "modulo-25-consistencia-distribuida",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 25 (Fase 3): Consistencia distribuida (outbox + CDC con Debezium, sagas con Temporal, idempotencia en consumidores Kafka, exactly-once, por qué no 2PC).",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "test": "node --test --test-concurrency=1 'f15*/*.test.js'"
  },
  "dependencies": {
    "@temporalio/activity": "1.26.0",
    "@temporalio/client": "1.26.0",
    "@temporalio/worker": "1.26.0",
    "@temporalio/workflow": "1.26.0",
    "kafkajs": "2.2.4",
    "pg": "8.23.1"
  },
  "devDependencies": {
    "@temporalio/testing": "1.26.0"
  }
}
```

`docker-compose.yml`:

```yaml
# Módulo 25 (modulo-29) · Consistencia distribuida: PostgreSQL 18.7 + Kafka 4.4.0 + Debezium 3.7 (Kafka Connect)
# Arranca:  docker compose up -d --wait   (espera a los healthchecks)
#   PostgreSQL :5432 (academia/academia) con wal_level=logical (CDC) y max_prepared_transactions=10 (2PC) → F152, F154, F155, F156
#   Kafka :9092 → F152 (Debezium), F154, F155
#   Kafka Connect con Debezium :8083 → F152
# F153 (Temporal) no va aquí: el test descarga y arranca el servidor de desarrollo del CLI de Temporal (createLocal).
# Detén:    docker compose down -v
name: modulo-29
services:
  postgres:
    image: postgres:18.7
    environment:
      POSTGRES_USER: academia
      POSTGRES_PASSWORD: academia
      POSTGRES_DB: academia
    # wal_level=logical: lo exige Debezium; max_prepared_transactions: por defecto es 0 y PREPARE TRANSACTION falla.
    command: ["postgres", "-c", "wal_level=logical", "-c", "max_prepared_transactions=10"]
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "academia", "-d", "academia"]
      interval: 2s
      timeout: 3s
      retries: 30
  kafka:
    image: apache/kafka:4.4.0
    hostname: kafka
    ports: ["9092:9092"]
    environment:
      # Un nodo KRaft con dos listeners: localhost:9092 para el host y kafka:19092 para Kafka Connect.
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: "broker,controller"
      KAFKA_LISTENERS: "CONTROLLER://:29093,PLAINTEXT_HOST://:9092,PLAINTEXT://:19092"
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT_HOST://localhost:9092,PLAINTEXT://kafka:19092"
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT"
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:29093"
      KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_INTER_BROKER_LISTENER_NAME: "PLAINTEXT"
      CLUSTER_ID: "4L6g3nShT-eMCtK--X86sw"
      # Un solo broker: los topics internos de offsets y de transacciones con 1 réplica (F155 usa transacciones).
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_MIN_ISR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
    healthcheck:
      test: ["CMD-SHELL", "/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list >/dev/null"]
      interval: 5s
      timeout: 15s
      retries: 30
  connect:
    # Imagen de Kafka Connect con los conectores de Debezium (línea 3.7; la estable es 3.7.1.Final).
    image: quay.io/debezium/connect:3.7
    depends_on:
      kafka: { condition: service_healthy }
      postgres: { condition: service_healthy }
    ports: ["8083:8083"]
    environment:
      BOOTSTRAP_SERVERS: "kafka:19092"
      GROUP_ID: "1"
      CONFIG_STORAGE_TOPIC: "connect_configs"
      OFFSET_STORAGE_TOPIC: "connect_offsets"
      STATUS_STORAGE_TOPIC: "connect_statuses"
      # Un solo broker: los topics internos de Connect con 1 réplica (CONNECT_* → propiedad de Connect; pendiente de
      # verificar en el Mac, ver verificacion/microservicios/pendiente.md).
      CONNECT_CONFIG_STORAGE_REPLICATION_FACTOR: "1"
      CONNECT_OFFSET_STORAGE_REPLICATION_FACTOR: "1"
      CONNECT_STATUS_STORAGE_REPLICATION_FACTOR: "1"
    healthcheck:
      test: ["CMD-SHELL", "curl -fs http://localhost:8083/connector-plugins >/dev/null"]
      interval: 5s
      timeout: 5s
      retries: 40
      start_period: 30s
```

Conexión compartida (`comun/config.js` y `comun/pg.js`):

`comun/pg.js`:

```javascript
// Módulo 25 · Direcciones de la infraestructura del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  PG_URL=... KAFKA_BROKERS=... TEMPORAL_ADDRESS=... node ...
export const PG_URL = process.env.PG_URL ?? 'postgres://academia:academia@localhost:5432/academia';
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
export const CONNECT_URL = process.env.CONNECT_URL ?? 'http://localhost:8083';
```

```javascript
// Módulo 25 · Pool de PostgreSQL (pg 8.23.1) compartido por las fichas F152, F154, F155 y F156.
import pg from 'pg';
import { PG_URL } from './config.js';

export function crearPool(url = PG_URL) {
  return new pg.Pool({ connectionString: url, max: 10 });
}

// Ejecuta fn(cliente) dentro de BEGIN … COMMIT; si fn lanza, ROLLBACK y relanza el error.
export async function enTransaccion(pool, fn) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await fn(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    cliente.release();
  }
}
```

**Lo que se ejecutó al escribir este módulo** (Node 26.13.1 y PostgreSQL 16.15 local con `wal_level=logical` y
`max_prepared_transactions=10`): todos los tests, demos y errores comunes que usan PostgreSQL, la saga sin servidor y
el empaquetado de workflows de Temporal. **Lo que no se pudo ejecutar aquí** (sin Docker con registro ni descarga del
servidor de Temporal): Debezium con Kafka, los consumidores KafkaJS, las transacciones de Kafka y los tests con
servidor Temporal. Sus salidas se describen como **esperadas** y están anotadas, con el comando, en
`verificacion/microservicios/pendiente.md`.

---


### Outbox Pattern + CDC con Debezium

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar el patrón outbox (el pedido y su evento se guardan en la misma transacción local), publicarlo de dos maneras (un relay por sondeo con FOR UPDATE SKIP LOCKED y captura de cambios con Debezium) y explicar por qué el «guardar y luego publicar» pierde eventos. Lo comprueb…

#### ► LA IDEA EN UNA FRASE
**Implementar el patrón outbox (el pedido y su evento se guardan en la misma transacción local), publicarlo de dos maneras (un relay por sondeo con FOR UPDATE SKIP LOCKED y captura de cambios con Debezium) y explicar por qué el «guardar y luego publicar» pierde eventos.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en outbox pattern + cdc con debezium como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant S as servicio pedidos
    participant DB as PostgreSQL
    participant W as WAL (diario)
    participant D as Debezium (Kafka Connect)
    participant K as Kafka
    participant C as inventario / pagos
    S->>DB: BEGIN
    S->>DB: INSERT f152_pedidos (P-7)
    S->>DB: INSERT f152_outbox (PedidoCreado, P-7)
    S->>DB: COMMIT
    DB->>W: las dos filas, en la misma transacción
    D->>W: lee por replicación lógica (slot, pgoutput)
    D->>D: EventRouter: topic outbox.event.pedido, clave P-7
    D->>K: publica el evento
    K->>C: entrega (al menos una vez)
```

1. Cuando alguien hace un pedido, tu servicio tiene que hacer **dos cosas**: guardarlo en su base de datos y **avisar**
2. Si guardas y después avisas, puede pasar que el aviso falle (la red, el broker caído) y nadie se entere del pedido.
3. La solución: guardar el aviso **en la misma base de datos**, en una tabla llamada **outbox** (bandeja de salida), en
4. Después, otro proceso lee la bandeja de salida y envía los avisos. Si falla, lo vuelve a intentar: el aviso sigue

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Outbox Pattern + CDC con Debezium se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Outbox Pattern + CDC con Debezium | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Publicar «dentro» de la transacción para que parezca atómico. Llamar al broker entre el BEGIN y el COMMIT no une las dos operaciones: si el commit falla después de publicar, el evento ya salió y habla de un pedido que no existe.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: outbox pattern + cdc con debezium funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando alguien hace un pedido, tu servicio tiene que hacer **dos cosas**: guardarlo en su base de datos y **avisar**
- Si guardas y después avisas, puede pasar que el aviso falle (la red, el broker caído) y nadie se entere del pedido.
- La solución: guardar el aviso **en la misma base de datos**, en una tabla llamada **outbox** (bandeja de salida), en
- Después, otro proceso lee la bandeja de salida y envía los avisos. Si falla, lo vuelve a intentar: el aviso sigue

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve outbox pattern + cdc con debezium en tu contexto?
2. ¿Cómo sabrías que outbox pattern + cdc con debezium no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar outbox pattern + cdc con debezium?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
    participant S as servicio pedidos
    participant DB as PostgreSQL
    participant W as WAL (diario)
    participant D as Debezium (Kafka Connect)
    participant K as Kafka
    participant C as inventario / pagos
    S->>DB: BEGIN
    S->>DB: INSERT f152_pedidos (P-7)
    S->>DB: INSERT f152_outbox (PedidoCreado, P-7)
    S->>DB: COMMIT
    DB->>W: las dos filas, en la misma transacción
    D->>W: lee por replicación lógica (slot, pgoutput)
    D->>D: EventRouter: topic outbox.event.pedido, clave P-7
    D->>K: publica el evento
    K->>C: entrega (al menos una vez)
```

```sql
-- Módulo 25 · F152 · Tablas del servicio de pedidos con su outbox (PostgreSQL 18.7; probado también en 16).
-- Las columnas de outbox son las que espera por defecto el Outbox Event Router de Debezium 3.7.
CREATE TABLE IF NOT EXISTS f152_pedidos (
  id      text PRIMARY KEY,
  cliente text NOT NULL,
  total   integer NOT NULL CHECK (total > 0)
);
CREATE TABLE IF NOT EXISTS f152_outbox (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregatetype varchar(255) NOT NULL,   -- decide el topic: outbox.event.<aggregatetype>
  aggregateid   varchar(255) NOT NULL,   -- clave del mensaje en Kafka (orden por pedido)
  type          varchar(255) NOT NULL,   -- tipo de evento: PedidoCreado
  payload       jsonb,
  creado_en     timestamptz NOT NULL DEFAULT clock_timestamp(),
  publicado_en  timestamptz              -- solo lo usa el relay por sondeo; Debezium lo ignora
);
```

```javascript
// Módulo 25 · F152 · Outbox Pattern: el pedido y su evento se guardan en la MISMA transacción local.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7 (docker-compose.yml).
import { readFile } from 'node:fs/promises';
import { enTransaccion } from '../comun/pg.js';

export async function prepararEsquema(pool) {
  await pool.query(await readFile(new URL('./esquema.sql', import.meta.url), 'utf8'));
  await pool.query('TRUNCATE f152_pedidos, f152_outbox');
}

// Caso de uso: crear un pedido. O se guardan las dos filas o ninguna (atomicidad de PostgreSQL).
export function crearPedido(pool, { id, cliente, total }) {
  return enTransaccion(pool, async (tx) => {
    await tx.query('INSERT INTO f152_pedidos (id, cliente, total) VALUES ($1, $2, $3)', [id, cliente, total]);
    await tx.query(
      `INSERT INTO f152_outbox (aggregatetype, aggregateid, type, payload)
       VALUES ('pedido', $1, 'PedidoCreado', $2)`,
      [id, { pedidoId: id, cliente, total }],
    );
  });
}

// Relay por sondeo (la alternativa sin Debezium): toma un lote, lo publica y lo marca, todo en una transacción.
// FOR UPDATE SKIP LOCKED deja que varias réplicas del relay trabajen a la vez sin tomar las mismas filas.
export function publicarPendientes(pool, publicar, { lote = 100 } = {}) {
  return enTransaccion(pool, async (tx) => {
    const { rows } = await tx.query(
      `SELECT id, aggregatetype, aggregateid, type, payload FROM f152_outbox
       WHERE publicado_en IS NULL ORDER BY creado_en LIMIT $1 FOR UPDATE SKIP LOCKED`,
      [lote],
    );
    for (const fila of rows) {
      // Si publicar() lanza, el ROLLBACK deja la fila pendiente y se reintenta en la próxima vuelta.
      await publicar({ topic: `outbox.event.${fila.aggregatetype}`, key: fila.aggregateid, id: fila.id, type: fila.type, payload: fila.payload });
      await tx.query('UPDATE f152_outbox SET publicado_en = clock_timestamp() WHERE id = $1', [fila.id]);
    }
    return rows.length;
  });
}
```

```json
{
  "name": "pedidos-outbox",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "plugin.name": "pgoutput",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "academia",
    "database.password": "academia",
    "database.dbname": "academia",
    "topic.prefix": "pedidosdb",
    "table.include.list": "public.f152_outbox",
    "tombstones.on.delete": "false",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.table.expand.json.payload": "true",
    "transforms.outbox.table.fields.additional.placement": "type:header:eventType",
    "key.converter": "org.apache.kafka.connect.storage.StringConverter",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false"
  }
}
```

```javascript
// Módulo 25 · F152 · Lo que lee Debezium: el WAL de PostgreSQL decodificado (replicación lógica).
// Usa el plugin test_decoding (texto legible) en lugar de pgoutput (binario, el que usa Debezium).
// Requisitos: PostgreSQL con wal_level=logical (docker-compose.yml lo arranca así). Ejecuta: node f152-outbox/cdc-wal.js
import { crearPool } from '../comun/pg.js';
import { crearPedido, prepararEsquema } from './outbox.js';

const pool = crearPool();
await prepararEsquema(pool);
const slot = 'f152_demo';
await pool.query('SELECT pg_drop_replication_slot($1) FROM pg_replication_slots WHERE slot_name = $1', [slot]);
await pool.query("SELECT pg_create_logical_replication_slot($1, 'test_decoding')", [slot]);

await crearPedido(pool, { id: 'P-7', cliente: 'ana', total: 99000 });

// Cada transacción confirmada aparece completa entre BEGIN y COMMIT, en orden de commit.
const { rows } = await pool.query('SELECT data FROM pg_logical_slot_get_changes($1, NULL, NULL)', [slot]);
for (const { data } of rows) console.log(data.replace(/id\[uuid\]:'[0-9a-f-]+'/, "id[uuid]:'…'").replace(/creado_en\[timestamp with time zone\]:'[^']+'/, "creado_en[…]:'…'"));
await pool.query('SELECT pg_drop_replication_slot($1)', [slot]); // un slot olvidado retiene WAL y llena el disco
await pool.end();
```

```javascript
// Módulo 25 · F152 · Ejecuta (PostgreSQL arriba): node f152-outbox/demo.js
import { crearPool } from '../comun/pg.js';
import { crearPedido, prepararEsquema, publicarPendientes } from './outbox.js';

const pool = crearPool();
await prepararEsquema(pool);

await crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 120000 });
await crearPedido(pool, { id: 'P-2', cliente: 'luis', total: 45000 });
// P-3 viola el CHECK (total > 0): falla el INSERT del pedido y el evento tampoco queda.
await crearPedido(pool, { id: 'P-3', cliente: 'eva', total: 0 }).catch((e) => console.log(`P-3 rechazado: ${e.message}`));

const { rows: [c] } = await pool.query('SELECT (SELECT count(*) FROM f152_pedidos) AS pedidos, (SELECT count(*) FROM f152_outbox) AS eventos');
console.log(`pedidos: ${c.pedidos} · eventos en outbox: ${c.eventos}`);

// Un «broker» de mentira que imprime; en producción sería producer.send() de kafkajs.
const publicados = await publicarPendientes(pool, async (m) => console.log(`→ ${m.topic} key=${m.key} ${m.type} ${JSON.stringify(m.payload)}`));
console.log(`relay: ${publicados} publicados · segunda vuelta: ${await publicarPendientes(pool, async () => {})} pendientes`);
await pool.end();
```

</details>

### Sagas orquestadas con Temporal.io

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir una saga orquestada de pedido (reservar stock → cobrar → crear envío) como un workflow de Temporal, con actividades idempotentes, política de reintentos, errores no reintentables y compensaciones en orden inverso, y explicar por qué el código del workflow tiene que ser…

#### ► LA IDEA EN UNA FRASE
**Construir una saga orquestada de pedido (reservar stock → cobrar → crear envío) como un workflow de Temporal, con actividades idempotentes, política de reintentos, errores no reintentables y compensaciones en orden inverso, y explicar por qué el código del workflow tiene que ser determinista.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sagas orquestadas con temporal.io como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant Cl as cliente (iniciar.js)
    participant T as Temporal Server
    participant W as worker (workflow sagaPedido)
    participant A as actividades
    Cl->>T: start sagaPedido (workflowId saga-P-1)
    T->>W: tarea de workflow
    W->>T: programar reservarStock
    T->>A: reservarStock ✔
    W->>T: programar cobrarPago
    T->>A: cobrarPago ✘ (transitorio) → reintento con backoff
    T->>A: cobrarPago ✘ PagoRechazado (no reintentable)
    T->>W: ActivityFailure
    W->>T: programar liberarStock (compensación)
    T->>A: liberarStock ✔
    W->>T: workflow completado {estado: COMPENSADA}
    T->>Cl: resultado
```

1. Comprar en una tienda en línea son varios pasos en servicios distintos: apartar el producto, cobrar, programar el
2. Una **saga** es esa lista de pasos con su «deshacer» para cada uno.
3. En una saga **orquestada**, un solo programa (el orquestador) dice qué paso toca, en lugar de que cada servicio
4. **Temporal** es un orquestador que **no olvida**: guarda cada paso en una base de datos. Si el programa se apaga a

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sagas orquestadas con Temporal.io se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sagas orquestadas con Temporal.io | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El «orquestador dios»: un workflow que contiene la lógica de negocio de todos los servicios (calcula precios, valida stock, decide reembolsos) en lugar de pedírsela a ellos. Acaba siendo un monolito distribuido: cada cambio en un servicio obliga a cambiar y desplegar el orquestador.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sagas orquestadas con temporal.io funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Comprar en una tienda en línea son varios pasos en servicios distintos: apartar el producto, cobrar, programar el
- Una **saga** es esa lista de pasos con su «deshacer» para cada uno.
- En una saga **orquestada**, un solo programa (el orquestador) dice qué paso toca, en lugar de que cada servicio
- **Temporal** es un orquestador que **no olvida**: guarda cada paso en una base de datos. Si el programa se apaga a

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sagas orquestadas con temporal.io en tu contexto?
2. ¿Cómo sabrías que sagas orquestadas con temporal.io no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sagas orquestadas con temporal.io?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Prueba la lógica de compensación sin servidor:

```bash
node --test --test-reporter=spec f153-temporal/saga.test.js
```

**Output esperado** (real):

```text
✔ todo bien: COMPLETADA y sin compensaciones (0.985308ms)
✔ falla el tercer paso: se compensan los dos anteriores en orden inverso (1.188354ms)
✔ el paso que falla NO se compensa (no llegó a hacerse) (0.201329ms)
✔ una compensación que falla no impide las demás y queda reportada (0.277482ms)
✔ con ActivityFailure, el motivo se toma de cause (0.191682ms)
```

(Los milisegundos cambian en cada ejecución.)

2. Con el [CLI de Temporal](https://docs.temporal.io/cli) instalado (`brew install temporal` en macOS), abre tres
   terminales:

```bash
temporal server start-dev                              # terminal 1: servidor + UI en http://localhost:8233
node f153-temporal/worker.js                           # terminal 2
node f153-temporal/iniciar.js P-1 inestable "Calle 1"  # terminal 3: el cobro falla 2 veces y luego pasa
node f153-temporal/iniciar.js P-2 rechazada "Calle 1"  # rechazo no reintentable → compensa
```

**Output esperado** (no ejecutado aquí: sin acceso para descargar el servidor de Temporal; pendiente en
`verificacion/microservicios/pendiente.md`): para P-1, `iniciado saga-P-1` y un JSON con `"estado":"COMPLETADA"` y
`"hechos":["reservarStock","cobrarPago","crearEnvio"]`; para P-2, `"estado":"COMPENSADA"`,
`"fallo":"cobrarPago: tarjeta rechazada"` y `"compensadas":["reservarStock"]`. **Captura comentada:** en la UI, la
ejecución `saga-P-1` muestra en su historial `ActivityTaskScheduled` de `cobrarPago` con *Attempt 3*; `saga-P-2`
muestra `ActivityTaskFailed` y después la actividad `liberarStock`.

3. Con un servidor ya arrancado, ejecuta los tests de integración:

```bash
TEMPORAL_ADDRESS=localhost:7233 node --test --test-force-exit --test-reporter=spec f153-temporal/temporal.infra.js
```

**Output esperado** (pendiente en el Mac): `ℹ tests 3` y `ℹ pass 3`.

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **@temporalio/workflow, activity, worker, client y testing 1.26.0** y **Temporal
Server 1.32.1** (o el servidor de desarrollo que arranca el CLI con `temporal server start-dev`).

`f153-temporal/saga.js`:

```javascript
// Módulo 25 · F153 · Pila de compensaciones de una saga orquestada.
// Sin imports de Node: se usa dentro del sandbox determinista de los workflows de Temporal y en tests normales.
export class Saga {
  #compensaciones = [];
  // Registra cómo deshacer un paso YA hecho. Se deshace en orden inverso (último en entrar, primero en salir).
  agregarCompensacion(nombre, fn) {
    this.#compensaciones.push({ nombre, fn });
  }
  // Ejecuta TODAS las compensaciones aunque alguna falle; devuelve qué se compensó y qué no.
  async compensar() {
    const hechas = [];
    const fallidas = [];
    for (const { nombre, fn } of this.#compensaciones.reverse()) {
      try {
        await fn();
        hechas.push(nombre);
      } catch (error) {
        fallidas.push(`${nombre}: ${error.message}`);
      }
    }
    this.#compensaciones = [];
    return { hechas, fallidas };
  }
}

// Orquestador genérico: ejecuta los pasos en orden y, si uno falla, compensa los anteriores.
// pasos = [{ nombre, hacer: () => Promise, deshacer?: () => Promise }]
export async function ejecutarSaga(pasos) {
  const saga = new Saga();
  const hechos = [];
  for (const paso of pasos) {
    try {
      await paso.hacer();
    } catch (error) {
      // En Temporal el error llega como ActivityFailure («Activity task failed»); el motivo real va en cause.
      const motivo = error.cause?.message ?? error.message;
      const { hechas, fallidas } = await saga.compensar();
      return { estado: 'COMPENSADA', fallo: `${paso.nombre}: ${motivo}`, hechos, compensadas: hechas, sinCompensar: fallidas };
    }
    hechos.push(paso.nombre);
    // La compensación se registra DESPUÉS de que el paso termina bien: no se deshace lo que no se hizo.
    if (paso.deshacer) saga.agregarCompensacion(paso.nombre, paso.deshacer);
  }
  return { estado: 'COMPLETADA', hechos, compensadas: [], sinCompensar: [] };
}
```

`f153-temporal/actividades.js`:

```javascript
// Módulo 25 · F153 · Actividades: el código con efectos (HTTP, BD, colas). Temporal las reintenta según la RetryPolicy.
// Aquí simulan tres servicios con estado en memoria e IDEMPOTENTES por pedidoId (un reintento no duplica).
import { ApplicationFailure, log } from '@temporalio/activity';

export const estado = { stock: new Map([['TEC-1', 5]]), reservas: new Map(), cobros: new Map(), envios: new Map(), intentos: new Map() };

export async function reservarStock({ pedidoId, sku, cantidad }) {
  if (estado.reservas.has(pedidoId)) return 'ya reservado';
  const disponible = estado.stock.get(sku) ?? 0;
  if (disponible < cantidad) throw ApplicationFailure.nonRetryable(`sin stock de ${sku}`, 'SinStock');
  estado.stock.set(sku, disponible - cantidad);
  estado.reservas.set(pedidoId, { sku, cantidad });
  return 'reservado';
}

export async function liberarStock({ pedidoId }) {
  const reserva = estado.reservas.get(pedidoId);
  if (!reserva) return 'nada que liberar'; // idempotente: la segunda vez no suma otra vez
  estado.stock.set(reserva.sku, estado.stock.get(reserva.sku) + reserva.cantidad);
  estado.reservas.delete(pedidoId);
  return 'liberado';
}

export async function cobrarPago({ pedidoId, total, tarjeta }) {
  if (estado.cobros.has(pedidoId)) return estado.cobros.get(pedidoId);
  // Rechazo de negocio: no tiene sentido reintentar → nonRetryable.
  if (tarjeta === 'rechazada') throw ApplicationFailure.nonRetryable('tarjeta rechazada', 'PagoRechazado');
  // Fallo técnico transitorio: los 2 primeros intentos fallan y Temporal reintenta solo.
  const n = (estado.intentos.get(pedidoId) ?? 0) + 1;
  estado.intentos.set(pedidoId, n);
  if (tarjeta === 'inestable' && n < 3) throw new Error(`pasarela no responde (intento ${n})`);
  const cobro = `COBRO-${pedidoId}`;
  estado.cobros.set(pedidoId, cobro);
  log.info('cobrado', { pedidoId, total, intento: n });
  return cobro;
}

export async function reembolsarPago({ pedidoId }) {
  if (!estado.cobros.delete(pedidoId)) return 'nada que reembolsar';
  return 'reembolsado';
}

export async function crearEnvio({ pedidoId, direccion }) {
  if (!direccion) throw ApplicationFailure.nonRetryable('dirección vacía', 'DireccionInvalida');
  estado.envios.set(pedidoId, `ENV-${pedidoId}`);
  return `ENV-${pedidoId}`;
}
```

`f153-temporal/workflows.js`:

```javascript
// Módulo 25 · F153 · Workflow de la saga de pedido, orquestado por Temporal.
// Requisitos: Node.js 26.13.1 LTS, @temporalio/workflow 1.26.0, Temporal Server 1.32.1 (o el servidor de desarrollo del CLI).
// Este archivo corre en un sandbox determinista: sin red, sin disco y sin imports de Node.
import { log, proxyActivities } from '@temporalio/workflow';
import { ejecutarSaga } from './saga.js';

const act = proxyActivities({
  startToCloseTimeout: '10 seconds',
  retry: { initialInterval: '100 milliseconds', backoffCoefficient: 2, maximumAttempts: 5 },
});

export async function sagaPedido(pedido) {
  const resultado = await ejecutarSaga([
    { nombre: 'reservarStock', hacer: () => act.reservarStock(pedido), deshacer: () => act.liberarStock(pedido) },
    { nombre: 'cobrarPago', hacer: () => act.cobrarPago(pedido), deshacer: () => act.reembolsarPago(pedido) },
    { nombre: 'crearEnvio', hacer: () => act.crearEnvio(pedido) },
  ]);
  log.info('saga terminada', { pedidoId: pedido.pedidoId, estado: resultado.estado });
  return resultado;
}
```

`f153-temporal/worker.js`:

```javascript
// Módulo 25 · F153 · Worker: ejecuta workflows y actividades de la cola «pedidos».
// Ejecuta (con un servidor Temporal en localhost:7233): node f153-temporal/worker.js
import { NativeConnection, Worker } from '@temporalio/worker';
import * as actividades from './actividades.js';

const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
const worker = await Worker.create({
  connection,
  taskQueue: 'pedidos',
  workflowsPath: new URL('./workflows.js', import.meta.url).pathname, // el SDK lo empaqueta con webpack
  activities: actividades,
});
console.log('worker escuchando la cola «pedidos» (Ctrl+C para salir)');
await worker.run();
```

`f153-temporal/iniciar.js`:

```javascript
// Módulo 25 · F153 · Cliente: inicia una saga y espera el resultado.
// Ejecuta (con worker.js corriendo): node f153-temporal/iniciar.js P-1 inestable "Calle 1"
import { Client, Connection } from '@temporalio/client';

const [pedidoId = 'P-1', tarjeta = 'ok', direccion = 'Calle 1'] = process.argv.slice(2);
const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
const client = new Client({ connection });
// workflowId = pedidoId: si lo lanzas dos veces, Temporal rechaza el duplicado (WorkflowExecutionAlreadyStartedError).
const handle = await client.workflow.start('sagaPedido', {
  taskQueue: 'pedidos',
  workflowId: `saga-${pedidoId}`,
  args: [{ pedidoId, sku: 'TEC-1', cantidad: 1, total: 99000, tarjeta, direccion }],
});
console.log(`iniciado ${handle.workflowId}`);
console.log(JSON.stringify(await handle.result()));
await connection.close();
```

#### Verificación
Test de integración con servidor Temporal (`f153-temporal/temporal.infra.js`):

```javascript
// Módulo 25 · F153 · Tests con un servidor Temporal de verdad.
// Por defecto el SDK descarga y arranca el servidor de desarrollo del CLI de Temporal (TestWorkflowEnvironment.createLocal);
// con TEMPORAL_ADDRESS=host:7233 usa un servidor que ya tengas en marcha.
// Ejecuta: node --test f153-temporal/temporal.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Runtime, DefaultLogger, Worker } from '@temporalio/worker';
import * as actividades from './actividades.js';

let env;
let worker;
let enMarcha;
before(async () => {
  Runtime.install({ logger: new DefaultLogger('WARN') });
  env = process.env.TEMPORAL_ADDRESS
    ? await TestWorkflowEnvironment.createFromExistingServer({ address: process.env.TEMPORAL_ADDRESS })
    : await TestWorkflowEnvironment.createLocal();
  worker = await Worker.create({
    connection: env.nativeConnection,
    taskQueue: 'pedidos-test',
    workflowsPath: new URL('./workflows.js', import.meta.url).pathname,
    activities: actividades,
  });
  enMarcha = worker.run();
}, { timeout: 180_000 });
after(async () => { worker?.shutdown(); await enMarcha; await env?.teardown(); });

const correr = (pedido) => env.client.workflow.execute('sagaPedido', {
  taskQueue: 'pedidos-test', workflowId: `saga-${pedido.pedidoId}-${Date.now()}`, args: [pedido],
});
const base = { sku: 'TEC-1', cantidad: 1, total: 99000, direccion: 'Calle 1' };

test('pasarela inestable: Temporal reintenta el cobro y la saga se completa', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, pedidoId: 'T-1', tarjeta: 'inestable' });
  assert.equal(r.estado, 'COMPLETADA');
  assert.equal(actividades.estado.intentos.get('T-1'), 3);
});

test('tarjeta rechazada (no reintentable): se libera el stock', { timeout: 90_000 }, async () => {
  const antes = actividades.estado.stock.get('TEC-1');
  const r = await correr({ ...base, pedidoId: 'T-2', tarjeta: 'rechazada' });
  assert.equal(r.estado, 'COMPENSADA');
  assert.equal(r.fallo, 'cobrarPago: tarjeta rechazada');
  assert.deepEqual(r.compensadas, ['reservarStock']);
  assert.equal(actividades.estado.stock.get('TEC-1'), antes);
});

test('envío inválido: se reembolsa y se libera, en orden inverso', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, pedidoId: 'T-3', tarjeta: 'ok', direccion: '' });
  assert.deepEqual(r.compensadas, ['cobrarPago', 'reservarStock']);
  assert.equal(actividades.estado.cobros.has('T-3'), false);
});
```

Y el test sin servidor (`f153-temporal/saga.test.js`):

```javascript
// Módulo 25 · F153 · Tests de la lógica de compensación (sin servidor). Ejecuta: node --test f153-temporal/saga.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ejecutarSaga } from './saga.js';

const registro = [];
const paso = (nombre, { falla = false, deshacerFalla = false } = {}) => ({
  nombre,
  hacer: async () => { if (falla) throw new Error(`${nombre} falló`); registro.push(`+${nombre}`); },
  deshacer: async () => { if (deshacerFalla) throw new Error('timeout'); registro.push(`-${nombre}`); },
});

test('todo bien: COMPLETADA y sin compensaciones', async () => {
  registro.length = 0;
  const r = await ejecutarSaga([paso('a'), paso('b'), paso('c')]);
  assert.equal(r.estado, 'COMPLETADA');
  assert.deepEqual(registro, ['+a', '+b', '+c']);
});

test('falla el tercer paso: se compensan los dos anteriores en orden inverso', async () => {
  registro.length = 0;
  const r = await ejecutarSaga([paso('a'), paso('b'), paso('c', { falla: true })]);
  assert.equal(r.estado, 'COMPENSADA');
  assert.equal(r.fallo, 'c: c falló');
  assert.deepEqual(registro, ['+a', '+b', '-b', '-a']);
});

test('el paso que falla NO se compensa (no llegó a hacerse)', async () => {
  registro.length = 0;
  await ejecutarSaga([paso('a', { falla: true })]);
  assert.deepEqual(registro, []);
});

test('una compensación que falla no impide las demás y queda reportada', async () => {
  registro.length = 0;
  const r = await ejecutarSaga([paso('a'), paso('b', { deshacerFalla: true }), paso('c', { falla: true })]);
  assert.deepEqual(r.compensadas, ['a']);
  assert.deepEqual(r.sinCompensar, ['b: timeout']);
});

test('con ActivityFailure, el motivo se toma de cause', async () => {
  const fallo = Object.assign(new Error('Activity task failed'), { cause: new Error('tarjeta rechazada') });
  const r = await ejecutarSaga([{ nombre: 'cobrar', hacer: async () => { throw fallo; } }]);
  assert.equal(r.fallo, 'cobrar: tarjeta rechazada');
});
```

**Output esperado:** `saga.test.js` → `ℹ pass 5` (real); `temporal.infra.js` → `ℹ pass 3` (pendiente en el Mac).

**Pregunta de comprobación:** si `crearEnvio` falla, ¿en qué orden se compensan los pasos? (Primero `cobrarPago`
→ reembolso, después `reservarStock` → liberar. `crearEnvio` no se compensa porque no llegó a hacerse.)

</details>

### Idempotencia real en consumidores Kafka

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar un consumidor que aplica cada evento una sola vez aunque Kafka lo entregue varias veces, guardando la marca «procesado» y el efecto en la misma transacción de PostgreSQL, y justificar por qué la clave es el id de negocio del evento y no el offset. Lo compruebas cuando…

#### ► LA IDEA EN UNA FRASE
**Implementar un consumidor que aplica cada evento una sola vez aunque Kafka lo entregue varias veces, guardando la marca «procesado» y el efecto en la misma transacción de PostgreSQL, y justificar por qué la clave es el id de negocio del evento y no el offset.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en idempotencia real en consumidores kafka como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    K["Kafka: offset 0 C-1 · offset 1 C-1 (reintento del productor)"] --> C["consumidor (eachMessage)"]
    C --> TX{"BEGIN"}
    TX --> I["INSERT f154_procesados (fidelidad, C-1)<br/>ON CONFLICT DO NOTHING"]
    I -->|"rowCount = 1"| E["efecto: sumar puntos"]
    I -->|"rowCount = 0"| D["duplicado: no hacer nada"]
    E --> CM["COMMIT (marca + efecto juntos)"]
    D --> CM
    CM --> OF["commit del offset en Kafka"]
```

1. Kafka entrega cada mensaje **al menos una vez**. A veces, dos. No es un fallo: es el precio de no perder nada.
2. Si el mensaje dice «suma 10 puntos» y llega dos veces, el cliente recibe 20. Eso sí es un fallo.
3. Un consumidor **idempotente** produce el mismo resultado si recibe un mensaje una vez o diez veces.
4. La forma más segura: cada evento trae un **número único**; el consumidor apunta en su base de datos «ya procesé este

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Idempotencia real en consumidores Kafka se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Idempotencia real en consumidores Kafka | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Comprobar y luego actuar en dos pasos separados («si no está procesado, procesa y marca»), sin transacción ni clave única. Entre el SELECT y el INSERT, otro consumidor hace lo mismo y los dos procesan.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: idempotencia real en consumidores kafka funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Kafka entrega cada mensaje **al menos una vez**. A veces, dos. No es un fallo: es el precio de no perder nada.
- Si el mensaje dice «suma 10 puntos» y llega dos veces, el cliente recibe 20. Eso sí es un fallo.
- Un consumidor **idempotente** produce el mismo resultado si recibe un mensaje una vez o diez veces.
- La forma más segura: cada evento trae un **número único**; el consumidor apunta en su base de datos «ya procesé este

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve idempotencia real en consumidores kafka en tu contexto?
2. ¿Cómo sabrías que idempotencia real en consumidores kafka no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar idempotencia real en consumidores kafka?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    K["Kafka: offset 0 C-1 · offset 1 C-1 (reintento del productor)"] --> C["consumidor (eachMessage)"]
    C --> TX{"BEGIN"}
    TX --> I["INSERT f154_procesados (fidelidad, C-1)<br/>ON CONFLICT DO NOTHING"]
    I -->|"rowCount = 1"| E["efecto: sumar puntos"]
    I -->|"rowCount = 0"| D["duplicado: no hacer nada"]
    E --> CM["COMMIT (marca + efecto juntos)"]
    D --> CM
    CM --> OF["commit del offset en Kafka"]
```

```javascript
// Módulo 25 · F154 · Consumidor idempotente: la marca «ya procesado» y el efecto van en la MISMA transacción.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7.
import { enTransaccion } from '../comun/pg.js';

export async function prepararEsquema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS f154_procesados (
      consumidor text NOT NULL,          -- cada grupo de consumidores lleva su propia cuenta
      evento_id  text NOT NULL,          -- id de NEGOCIO del evento (no el offset de Kafka)
      procesado_en timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (consumidor, evento_id)
    );
    CREATE TABLE IF NOT EXISTS f154_puntos (cliente text PRIMARY KEY, puntos integer NOT NULL);
    TRUNCATE f154_procesados, f154_puntos;`);
}

// Devuelve 'procesado' o 'duplicado'. Si efecto() lanza, se deshace también la marca y el reintento procesará.
export function procesarUnaVez(pool, consumidor, evento, efecto) {
  return enTransaccion(pool, async (tx) => {
    // ON CONFLICT DO NOTHING: si otra transacción insertó la misma clave, esta espera a que termine y luego no inserta.
    const { rowCount } = await tx.query(
      'INSERT INTO f154_procesados (consumidor, evento_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [consumidor, evento.id],
    );
    if (rowCount === 0) return 'duplicado';
    await efecto(tx, evento);
    return 'procesado';
  });
}

// Efecto de ejemplo: sumar puntos de fidelidad (NO es idempotente por sí solo: sumar dos veces da el doble).
export async function sumarPuntos(tx, { cliente, puntos }) {
  await tx.query(
    `INSERT INTO f154_puntos (cliente, puntos) VALUES ($1, $2)
     ON CONFLICT (cliente) DO UPDATE SET puntos = f154_puntos.puntos + EXCLUDED.puntos`,
    [cliente, puntos],
  );
}
```

```javascript
// Módulo 25 · F154 · Consumidor Kafka idempotente (kafkajs 2.2.4 + Kafka 4.4.0 + PostgreSQL).
// Ejecuta (con docker compose arriba): node f154-idempotencia/consumidor-kafka.js
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_BROKERS } from '../comun/config.js';
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, procesarUnaVez, sumarPuntos } from './idempotencia.js';

const pool = crearPool();
await prepararEsquema(pool);
const kafka = new Kafka({ clientId: 'f154', brokers: KAFKA_BROKERS, logLevel: logLevel.WARN });
const topic = 'f154.compras';
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [{ topic, numPartitions: 1 }] });
await admin.disconnect();

// El productor manda la misma compra DOS veces (simula un reintento tras un timeout): dos offsets, un solo evento.
const productor = kafka.producer();
await productor.connect();
const compra = { id: 'C-1', cliente: 'ana', puntos: 10 };
for (let i = 0; i < 2; i++) await productor.send({ topic, messages: [{ key: compra.cliente, value: JSON.stringify(compra) }] });
await productor.disconnect();

const consumidor = kafka.consumer({ groupId: 'f154-fidelidad' });
await consumidor.connect();
await consumidor.subscribe({ topic, fromBeginning: true });
let vistos = 0;
await new Promise((terminar) => consumidor.run({
  // autoCommit (por defecto): el offset se confirma DESPUÉS de que eachMessage termina → al menos una vez.
  eachMessage: async ({ message, partition }) => {
    const evento = JSON.parse(message.value.toString());
    const r = await procesarUnaVez(pool, 'fidelidad', evento, sumarPuntos);
    console.log(`partición ${partition} offset ${message.offset} evento ${evento.id} → ${r}`);
    if (++vistos === 2) terminar();
  },
}));
await consumidor.disconnect();
const { rows: [ana] } = await pool.query("SELECT puntos FROM f154_puntos WHERE cliente = 'ana'");
console.log(`puntos de ana = ${ana.puntos}`);
await pool.end();
```

```javascript
// Módulo 25 · F154 · Ejecuta (PostgreSQL arriba): node f154-idempotencia/demo.js
// Simula las entregas que hace Kafka «al menos una vez»: duplicados por reintento del productor y por rebalanceo.
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, procesarUnaVez, sumarPuntos } from './idempotencia.js';

const pool = crearPool();
await prepararEsquema(pool);
const entregas = [
  { offset: 0, evento: { id: 'C-1', cliente: 'ana', puntos: 10 } },
  { offset: 1, evento: { id: 'C-1', cliente: 'ana', puntos: 10 } }, // reintento del productor: otro offset, mismo evento
  { offset: 2, evento: { id: 'C-2', cliente: 'ana', puntos: 5 } },
  { offset: 2, evento: { id: 'C-2', cliente: 'ana', puntos: 5 } }, // rebalanceo antes del commit: mismo offset otra vez
];
for (const { offset, evento } of entregas) {
  console.log(`offset ${offset} ${evento.id} → ${await procesarUnaVez(pool, 'fidelidad', evento, sumarPuntos)}`);
}
// Cinco copias de C-3 A LA VEZ (cinco consumidores tras un rebalanceo): la clave primaria deja pasar una.
const r = await Promise.all(Array.from({ length: 5 }, () => procesarUnaVez(pool, 'fidelidad', { id: 'C-3', cliente: 'ana', puntos: 1 }, sumarPuntos)));
console.log(`C-3 en paralelo ×5 → ${r.filter((x) => x === 'procesado').length} procesado, ${r.filter((x) => x === 'duplicado').length} duplicados`);
const { rows: [ana] } = await pool.query("SELECT puntos FROM f154_puntos WHERE cliente = 'ana'");
console.log(`puntos de ana = ${ana.puntos} (10 + 5 + 1)`);
await pool.end();
```

```bash
docker compose up -d --wait postgres
node f154-idempotencia/demo.js
```

```text
offset 0 C-1 → procesado
offset 1 C-1 → duplicado
offset 2 C-2 → procesado
offset 2 C-2 → duplicado
C-3 en paralelo ×5 → 1 procesado, 4 duplicados
puntos de ana = 16 (10 + 5 + 1)
```

</details>

### Exactly-once semantics en la práctica

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Aplicar las dos formas reales de conseguir el efecto «exactamente una vez»: las transacciones de Kafka (leer → transformar → escribir, con el offset dentro de la transacción y lectores read_committed) cuando origen y destino son Kafka, y guardar el offset junto al resultado en tu…

#### ► LA IDEA EN UNA FRASE
**Aplicar las dos formas reales de conseguir el efecto «exactamente una vez»: las transacciones de Kafka (leer → transformar → escribir, con el offset dentro de la transacción y lectores read_committed) cuando origen y destino son Kafka, y guardar el offset junto al resultado en tu base de datos cuando el destino no es Kafka; y delimitar lo que ninguna de las dos cubre (efectos externos).**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en exactly-once semantics en la práctica como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant C as consumidor (grupo f155-conversor)
    participant P as productor transaccional
    participant TC as coordinador de transacciones
    participant O as topic f155.pagos-cop
    participant G as __consumer_offsets
    C->>P: mensaje PAGO-1 (offset 0)
    P->>TC: beginTransaction
    P->>O: send PAGO-1 convertido
    P->>G: sendOffsets (offset 1)
    P->>TC: commit → marcadores COMMIT en O y G
    C->>P: mensaje PAGO-2 (offset 1)
    P->>O: send PAGO-2 convertido
    P->>G: sendOffsets (offset 2)
    P->>TC: abort → marcador ABORT; el offset no avanza
    C->>P: PAGO-2 otra vez (offset 1) → commit
    Note over O: un lector read_committed ve PAGO-1, PAGO-2, PAGO-3<br/>uno read_uncommitted ve también el intento abortado
```

1. «Exactamente una vez» suena a que un mensaje viaja una sola vez. No es así: los mensajes pueden **viajar** varias
2. Truco 1: guardar el resultado y el «voy por aquí» (el **offset**) en el mismo lugar y al mismo tiempo. Si algo
3. Truco 2: Kafka permite hacer eso mismo **dentro de Kafka**: escribir el resultado en otro topic y avanzar el offset en
4. Lo que ningún truco arregla: si en medio mandaste un correo o llamaste a otra API, eso ya ocurrió y se repetirá.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Exactly-once semantics en la práctica se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Exactly-once semantics en la práctica | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
transactionalId aleatorio por arranque (transactionalId: \conversor-${randomUUID()}\). Cada reinicio parece un productor nuevo: el coordinador no puede cercar a la instancia anterior si sigue viva, y las transacciones que dejó abiertas solo se cierran cuando vence su transactionTimeout, frenando mientras tanto a los lectores read_committed.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: exactly-once semantics en la práctica funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- «Exactamente una vez» suena a que un mensaje viaja una sola vez. No es así: los mensajes pueden **viajar** varias
- Truco 1: guardar el resultado y el «voy por aquí» (el **offset**) en el mismo lugar y al mismo tiempo. Si algo
- Truco 2: Kafka permite hacer eso mismo **dentro de Kafka**: escribir el resultado en otro topic y avanzar el offset en
- Lo que ningún truco arregla: si en medio mandaste un correo o llamaste a otra API, eso ya ocurrió y se repetirá.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve exactly-once semantics en la práctica en tu contexto?
2. ¿Cómo sabrías que exactly-once semantics en la práctica no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar exactly-once semantics en la práctica?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **kafkajs 2.2.4**, **Kafka 4.4.0**, **pg 8.23.1** y **PostgreSQL 18.7**.

`f155-exactly-once/eos-kafka.js`:

```javascript
// Módulo 25 · F155 · Exactly-once DENTRO de Kafka: leer → transformar → escribir con transacciones (kafkajs 2.2.4, Kafka 4.4.0).
// La salida y el offset del consumidor se confirman juntos; quien lea con read_committed nunca ve la salida de una transacción abortada.
// Ejecuta (con docker compose arriba): node f155-exactly-once/eos-kafka.js
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_BROKERS } from '../comun/config.js';

const kafka = new Kafka({ clientId: 'f155', brokers: KAFKA_BROKERS, logLevel: logLevel.WARN });
const [entrada, salida, grupo] = ['f155.pagos-usd', 'f155.pagos-cop', 'f155-conversor'];
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [{ topic: entrada }, { topic: salida }] });
await admin.disconnect();

const semilla = kafka.producer();
await semilla.connect();
await semilla.send({ topic: entrada, messages: [1, 2, 3].map((n) => ({ key: `PAGO-${n}`, value: JSON.stringify({ usd: n * 10 }) })) });
await semilla.disconnect();

// transactionalId estable por instancia: si una instancia «zombi» reaparece, el coordinador la cerca (fencing).
const productor = kafka.producer({ transactionalId: 'f155-conversor-0', idempotent: true, maxInFlightRequests: 1 });
await productor.connect();
const consumidor = kafka.consumer({ groupId: grupo }); // readUncommitted: false (por defecto) → isolation.level=read_committed
await consumidor.connect();
await consumidor.subscribe({ topic: entrada, fromBeginning: true });

let fallado = false;
let confirmados = 0;
await new Promise((fin) => consumidor.run({
  autoCommit: false, // el offset lo confirma la transacción, no el consumidor
  eachMessage: async ({ topic, partition, message }) => {
    const tx = await productor.transaction();
    try {
      const { usd } = JSON.parse(message.value.toString());
      await tx.send({ topic: salida, messages: [{ key: message.key, value: JSON.stringify({ cop: usd * 4000 }) }] });
      await tx.sendOffsets({ consumerGroupId: grupo, topics: [{ topic, partitions: [{ partition, offset: (BigInt(message.offset) + 1n).toString() }] }] });
      if (message.key.toString() === 'PAGO-2' && !fallado) { fallado = true; throw new Error('fallo simulado'); }
      await tx.commit();
      console.log(`commit  ${message.key} offset ${message.offset}`);
    } catch (error) {
      await tx.abort(); // lo escrito en f155.pagos-cop queda marcado como abortado y el offset no avanza
      console.log(`abort   ${message.key}: ${error.message}`);
      throw error; // kafkajs vuelve a entregar PAGO-2
    }
    if (++confirmados === 3) fin();
  },
}));
await consumidor.disconnect();
await productor.disconnect();

// Lee la salida con los dos niveles de aislamiento: read_committed no ve el intento abortado de PAGO-2.
for (const readUncommitted of [false, true]) {
  const lector = kafka.consumer({ groupId: `f155-lector-${readUncommitted}-${Date.now()}`, readUncommitted });
  await lector.connect();
  await lector.subscribe({ topic: salida, fromBeginning: true });
  const claves = [];
  await new Promise((fin) => {
    lector.run({ eachMessage: async ({ message }) => { claves.push(message.key.toString()); } });
    setTimeout(fin, 5000);
  });
  await lector.disconnect();
  console.log(`${readUncommitted ? 'read_uncommitted' : 'read_committed  '} → ${claves.join(', ')}`);
}
```

`f155-exactly-once/offsets-en-bd.js`:

`comun/pg.js`: conexión PostgreSQL compartida.

```javascript
// Módulo 25 · F155 · «Exactly-once» efectivo fuera de Kafka: el resultado y el offset se guardan en la MISMA transacción.
// Al reiniciar, el consumidor lee el offset de la BD (no el del grupo de Kafka) y sigue desde ahí.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7.
import { enTransaccion } from '../comun/pg.js';

export async function prepararEsquema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS f155_offsets (
      consumidor text, topic text, particion int, siguiente bigint NOT NULL,
      PRIMARY KEY (consumidor, topic, particion));
    CREATE TABLE IF NOT EXISTS f155_saldos (cuenta text PRIMARY KEY, saldo bigint NOT NULL);
    TRUNCATE f155_offsets, f155_saldos;`);
}

export async function leerOffset(pool, { consumidor, topic, particion }) {
  const { rows } = await pool.query(
    'SELECT siguiente FROM f155_offsets WHERE consumidor = $1 AND topic = $2 AND particion = $3', [consumidor, topic, particion]);
  return rows.length ? Number(rows[0].siguiente) : 0;
}

export async function depositar(tx, { cuenta, monto }) {
  await tx.query(
    `INSERT INTO f155_saldos VALUES ($1, $2) ON CONFLICT (cuenta) DO UPDATE SET saldo = f155_saldos.saldo + EXCLUDED.saldo`,
    [cuenta, monto]);
}

// BIEN: efecto + offset en una transacción. Un fallo en cualquier punto deshace las dos cosas.
export function procesarMensaje(pool, pos, { offset, valor }, aplicar, { fallarAntesDelCommit = false } = {}) {
  return enTransaccion(pool, async (tx) => {
    await aplicar(tx, valor);
    await tx.query(
      `INSERT INTO f155_offsets VALUES ($1, $2, $3, $4)
       ON CONFLICT (consumidor, topic, particion) DO UPDATE SET siguiente = EXCLUDED.siguiente`,
      [pos.consumidor, pos.topic, pos.particion, offset + 1]);
    if (fallarAntesDelCommit) throw new Error(`proceso muerto en el offset ${offset}`);
  });
}

// Consume una partición (array de mensajes, como los devolvería Kafka) desde el offset guardado.
export async function consumir(pool, pos, particion, aplicar, { morirEn } = {}) {
  const desde = await leerOffset(pool, pos);
  for (const mensaje of particion.slice(desde)) {
    await procesarMensaje(pool, pos, mensaje, aplicar, { fallarAntesDelCommit: mensaje.offset === morirEn });
  }
  return desde;
}
```

`f155-exactly-once/demo.js`:

```javascript
// Módulo 25 · F155 · Ejecuta (PostgreSQL arriba): node f155-exactly-once/demo.js
// Cinco depósitos de 100 a la cuenta A. El proceso muere en el offset 2 y vuelve a arrancar.
import { crearPool } from '../comun/pg.js';
import { consumir, depositar, prepararEsquema } from './offsets-en-bd.js';

const pool = crearPool();
await prepararEsquema(pool);
const particion = [0, 1, 2, 3, 4].map((offset) => ({ offset, valor: { cuenta: 'A', monto: 100 } }));
const pos = { consumidor: 'saldos', topic: 'f155.depositos', particion: 0 };

await consumir(pool, pos, particion, depositar, { morirEn: 2 }).catch((e) => console.log(`1.ª ejecución: ${e.message}`));
const saldo = async () => (await pool.query("SELECT saldo FROM f155_saldos WHERE cuenta = 'A'")).rows[0].saldo;
console.log(`tras la caída: saldo = ${await saldo()}`);
const desde = await consumir(pool, pos, particion, depositar);
console.log(`2.ª ejecución: retoma desde el offset ${desde}`);
console.log(`saldo final = ${await saldo()} (5 × 100, ni uno más ni uno menos)`);
await pool.end();
```

</details>

### Two-Phase Commit: por qué no usar

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Ejecutar un Two-Phase Commit real con PREPARE TRANSACTION / COMMIT PREPARED de PostgreSQL, provocar el caso que lo hace inviable entre microservicios (el coordinador cae entre las dos fases y los participantes quedan bloqueados) y argumentar cuándo usar sagas en su lugar. Lo comp…

#### ► LA IDEA EN UNA FRASE
**Ejecutar un Two-Phase Commit real con PREPARE TRANSACTION / COMMIT PREPARED de PostgreSQL, provocar el caso que lo hace inviable entre microservicios (el coordinador cae entre las dos fases y los participantes quedan bloqueados) y argumentar cuándo usar sagas en su lugar.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en two-phase commit: por qué no usar como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant Co as coordinador
    participant A as banco A
    participant B as banco B
    participant O as otro cobro
    Co->>A: BEGIN · UPDATE ana −200 · PREPARE 'f156-t3-a'
    A-->>Co: sí (fila de ana bloqueada)
    Co->>B: BEGIN · UPDATE luis +200 · PREPARE 'f156-t3-b'
    B-->>Co: sí (fila de luis bloqueada)
    Note over Co: el coordinador cae aquí
    O->>A: UPDATE ana −10
    A-->>O: espera… lock timeout
    Note over A,B: en duda hasta que alguien ejecute<br/>COMMIT PREPARED o ROLLBACK PREPARED
```

1. A veces quieres que dos bases de datos cambien **juntas**: restar dinero en una y sumarlo en otra.
2. El **Two-Phase Commit** (2PC) lo intenta en dos pasos: primero pregunta a todas «¿puedes?» y cada una se prepara;
3. El problema: entre «me preparo» y «hazlo», cada base de datos se queda **bloqueada** esperando. Si quien da las
4. En microservicios, cada servicio tiene su base de datos y debe seguir funcionando aunque otro falle. 2PC hace lo

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Two-Phase Commit: por qué no usar se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Two-Phase Commit: por qué no usar | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La transacción distribuida «para no pensar en consistencia»: un servicio que abre conexiones a las bases de datos de otros servicios y las une con XA.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: two-phase commit: por qué no usar funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- A veces quieres que dos bases de datos cambien **juntas**: restar dinero en una y sumarlo en otra.
- El **Two-Phase Commit** (2PC) lo intenta en dos pasos: primero pregunta a todas «¿puedes?» y cada una se prepara;
- El problema: entre «me preparo» y «hazlo», cada base de datos se queda **bloqueada** esperando. Si quien da las
- En microservicios, cada servicio tiene su base de datos y debe seguir funcionando aunque otro falle. 2PC hace lo

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve two-phase commit: por qué no usar en tu contexto?
2. ¿Cómo sabrías que two-phase commit: por qué no usar no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar two-phase commit: por qué no usar?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
    participant Co as coordinador
    participant A as banco A
    participant B as banco B
    participant O as otro cobro
    Co->>A: BEGIN · UPDATE ana −200 · PREPARE 'f156-t3-a'
    A-->>Co: sí (fila de ana bloqueada)
    Co->>B: BEGIN · UPDATE luis +200 · PREPARE 'f156-t3-b'
    B-->>Co: sí (fila de luis bloqueada)
    Note over Co: el coordinador cae aquí
    O->>A: UPDATE ana −10
    A-->>O: espera… lock timeout
    Note over A,B: en duda hasta que alguien ejecute<br/>COMMIT PREPARED o ROLLBACK PREPARED
```

```javascript
// Módulo 25 · F156 · Two-Phase Commit con PREPARE TRANSACTION de PostgreSQL (para entender por qué NO usarlo entre servicios).
// Dos participantes: «banco A» y «banco B» (aquí, dos conexiones a dos tablas; en la vida real, dos bases distintas).
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1, PostgreSQL 18.7 con max_prepared_transactions > 0 (por defecto es 0).

export async function prepararEsquema(pool) {
  const { rows } = await pool.query('SELECT gid FROM pg_prepared_xacts WHERE gid LIKE $1', ['f156-%']);
  for (const { gid } of rows) await pool.query(`ROLLBACK PREPARED '${gid}'`); // limpia restos de ejecuciones anteriores
  await pool.query(`
    CREATE TABLE IF NOT EXISTS f156_banco_a (cuenta text PRIMARY KEY, saldo integer NOT NULL CHECK (saldo >= 0));
    CREATE TABLE IF NOT EXISTS f156_banco_b (cuenta text PRIMARY KEY, saldo integer NOT NULL CHECK (saldo >= 0));
    TRUNCATE f156_banco_a, f156_banco_b;
    INSERT INTO f156_banco_a VALUES ('ana', 1000);
    INSERT INTO f156_banco_b VALUES ('luis', 0);`);
}

// Coordinador: fase 1 (preparar = votar) en los dos participantes; fase 2 (confirmar) solo si los dos votaron sí.
export async function transferir(pool, { gid, monto }, { caerTrasPreparar = false } = {}) {
  const [a, b] = [await pool.connect(), await pool.connect()];
  const preparados = [];
  try {
    // FASE 1 · cada participante hace su parte y la deja PREPARADA: escrita en disco, con los bloqueos tomados.
    await a.query('BEGIN');
    await a.query("UPDATE f156_banco_a SET saldo = saldo - $1 WHERE cuenta = 'ana'", [monto]);
    await a.query(`PREPARE TRANSACTION '${gid}-a'`);
    preparados.push(`${gid}-a`);
    await b.query('BEGIN');
    await b.query("UPDATE f156_banco_b SET saldo = saldo + $1 WHERE cuenta = 'luis'", [monto]);
    await b.query(`PREPARE TRANSACTION '${gid}-b'`);
    preparados.push(`${gid}-b`);
  } catch (error) {
    // Alguien votó NO: se deshace lo preparado y lo que quedó a medias.
    await a.query('ROLLBACK').catch(() => {});
    await b.query('ROLLBACK').catch(() => {});
    for (const p of preparados) await pool.query(`ROLLBACK PREPARED '${p}'`);
    a.release(); b.release();
    return `abortada: ${error.message}`;
  }
  a.release(); b.release();
  if (caerTrasPreparar) return 'coordinador caído entre la fase 1 y la fase 2';
  // FASE 2 · la decisión es definitiva; cualquier conexión puede ejecutarla, incluso tras reiniciar.
  for (const p of preparados) await pool.query(`COMMIT PREPARED '${p}'`);
  return 'confirmada';
}

export async function saldos(pool) {
  const { rows } = await pool.query(`SELECT (SELECT saldo FROM f156_banco_a WHERE cuenta = 'ana') AS ana,
                                            (SELECT saldo FROM f156_banco_b WHERE cuenta = 'luis') AS luis`);
  return rows[0];
}
```

```javascript
// Módulo 25 · F156 · Ejecuta (PostgreSQL arriba): node f156-2pc/demo.js
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, saldos, transferir } from './coordinador.js';

const pool = crearPool();
await prepararEsquema(pool);
console.log(`T1 (300):  ${await transferir(pool, { gid: 'f156-t1', monto: 300 })} → ${JSON.stringify(await saldos(pool))}`);
console.log(`T2 (5000): ${await transferir(pool, { gid: 'f156-t2', monto: 5000 })} → ${JSON.stringify(await saldos(pool))}`);
console.log(`T3 (200):  ${await transferir(pool, { gid: 'f156-t3', monto: 200 }, { caerTrasPreparar: true })}`);

const { rows } = await pool.query("SELECT gid FROM pg_prepared_xacts WHERE gid LIKE 'f156-%' ORDER BY gid");
console.log(`en duda (pg_prepared_xacts): ${rows.map((r) => r.gid).join(', ')}`);
console.log(`leer sí se puede (valor anterior): ${JSON.stringify(await saldos(pool))}`);

// Otro pedido quiere cobrarle a ana mientras T3 sigue en duda: su fila está bloqueada por la transacción preparada.
const c = await pool.connect();
try {
  await c.query("SET lock_timeout = '1s'");
  await c.query("UPDATE f156_banco_a SET saldo = saldo - 10 WHERE cuenta = 'ana'");
} catch (error) {
  console.log(`otro cobro a ana: ${error.message}`);
} finally { c.release(); }

// Recuperación: alguien (el coordinador al volver, o una persona) decide. Aquí se confirma.
for (const { gid } of rows) await pool.query(`COMMIT PREPARED '${gid}'`);
console.log(`tras COMMIT PREPARED: ${JSON.stringify(await saldos(pool))}`);
await pool.end();
```

```bash
docker compose up -d --wait postgres
node f156-2pc/demo.js
```

```text
T1 (300):  confirmada → {"ana":700,"luis":300}
T2 (5000): abortada: new row for relation "f156_banco_a" violates check constraint "f156_banco_a_saldo_check" → {"ana":700,"luis":300}
T3 (200):  coordinador caído entre la fase 1 y la fase 2
en duda (pg_prepared_xacts): f156-t3-a, f156-t3-b
leer sí se puede (valor anterior): {"ana":700,"luis":300}
otro cobro a ana: canceling statement due to lock timeout
tras COMMIT PREPARED: {"ana":500,"luis":500}
```

```bash
docker compose exec postgres psql -U academia -c "SELECT gid, prepared, owner FROM pg_prepared_xacts"
docker compose exec postgres psql -U academia -c "SELECT locktype, relation::regclass, mode FROM pg_locks WHERE pid IS NULL"
```

</details>
