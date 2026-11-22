# Módulo 25 · Consistencia distribuida

**Fase 3 · Nivel maestro: arquitectura avanzada** (semana 2 de 8). **Duración:** 12 h (5 temas de unos 110 min y
2 h 50 min de laboratorio integrador). **Dificultad:** 5 de 5. **Dependencias:** Módulo 22 (confirms, deduplicación,
sagas coreografiadas y compensaciones), Módulo 18 (KafkaJS) y Módulo 15 (PostgreSQL). **Herramientas:**Node.js
26.13.1 LTS**, **pg 8.23.1** con **PostgreSQL 18.7**, **kafkajs 2.2.4** con **Apache Kafka 4.4.0**, **Debezium 3.7**
(Kafka Connect, imagen `quay.io/debezium/connect:3.7`; la estable es 3.7.1.Final) y **@temporalio/client, worker,
workflow, activity y testing 1.26.0** (Temporal Server 1.32.1 o el servidor de desarrollo del CLI). **Laboratorio:**
`modulo-29` (`./verificar.sh` ejecuta lo que no necesita infraestructura y lo de PostgreSQL si
responde; `./verificar.sh --compose` levanta PostgreSQL, Kafka y Debezium, arranca Temporal y lo exige todo).

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
./verificar.sh --compose            # tests + demos + errores comunes de las 5 fichas → «RESULTADO: OK»
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

#### 1. UBICACIÓN

Módulo 25, Lección 1 de 5 · Fase 3.

#### 2. PRERREQUISITOS

- Transacciones de PostgreSQL con `pg` (Módulo 15).
- Productores y consumidores de KafkaJS (Módulo 18).
- Publisher confirms y entrega «al menos una vez» (Módulo 22, ficha 1).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** el patrón outbox (el pedido y su evento se guardan en la misma transacción local), **publicarlo** de
dos maneras (un relay por sondeo con `FOR UPDATE SKIP LOCKED` y captura de cambios con Debezium) y **explicar** por qué
el «guardar y luego publicar» pierde eventos. Lo compruebas cuando `outbox.test.js` pasa 5 de 5 y ves en el WAL de
PostgreSQL las dos filas dentro del mismo `BEGIN … COMMIT`.

#### 4. ANALOGÍA VISUAL

Dibuja una **notaría**. Cuando firmas una escritura, el notario escribe en el **mismo libro**, en la misma página, la
escritura y una nota «avisar al registro». Si la firma se anula, se tacha la página entera: no queda una nota suelta.
Un **mensajero** pasa cada hora, lee las notas pendientes, lleva los avisos al registro y pone una marca «entregado»
(relay por sondeo). Una notaría moderna tiene, en cambio, una **cámara que filma el libro**: cada vez que se cierra una
página, la cámara manda una copia al registro sin que el notario haga nada (CDC: Debezium lee el diario de cambios de
la base de datos). Lo que nunca hace el notario es firmar y luego **llamar por teléfono** al registro: si la línea está
caída, la escritura existe y el registro jamás se entera.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de secuencia. El servicio de pedidos abre una transacción en PostgreSQL, inserta el
pedido P-7 y una fila PedidoCreado en la tabla outbox y confirma. PostgreSQL escribe las dos filas en el WAL dentro de
la misma transacción. Debezium, como conector de Kafka Connect, lee el WAL por replicación lógica con un slot y el
plugin pgoutput; su transformación EventRouter elige el topic outbox.event.pedido y la clave P-7, y publica el evento
en Kafka, que lo entrega al menos una vez a inventario y pagos.

#### 6. EXPLICACIÓN NIVEL 0

- Cuando alguien hace un pedido, tu servicio tiene que hacer **dos cosas**: guardarlo en su base de datos y **avisar**
  a otros servicios (inventario, pagos).
- Si guardas y después avisas, puede pasar que el aviso falle (la red, el broker caído) y nadie se entere del pedido.
  Si avisas primero y después guardas, puede pasar que el guardado falle y todos crean en un pedido que no existe.
- La solución: guardar el aviso **en la misma base de datos**, en una tabla llamada **outbox** (bandeja de salida), en
  el mismo momento en que guardas el pedido. La base de datos garantiza que se guardan las dos cosas o ninguna.
- Después, otro proceso lee la bandeja de salida y envía los avisos. Si falla, lo vuelve a intentar: el aviso sigue
  ahí.

#### 7. EXPLICACIÓN INTERMEDIA

- **La tabla outbox** (`esquema.sql`) tiene las columnas que espera por defecto el *Outbox Event Router* de Debezium:
  `id` (uuid), `aggregatetype` (decide el topic), `aggregateid` (clave del mensaje: mantiene el orden por pedido),
  `type` (tipo de evento) y `payload` (jsonb). Puedes añadir columnas propias.
- **Escribir:** `crearPedido()` hace los dos `INSERT` dentro de `enTransaccion()`. Si el pedido viola el `CHECK`, el
  `ROLLBACK` deshace también el evento.
- **Publicar con un relay por sondeo:** `publicarPendientes()` toma un lote con `SELECT … FOR UPDATE SKIP LOCKED`,
  publica cada fila y la marca con `publicado_en`, todo en una transacción. `SKIP LOCKED` hace que dos réplicas del
  relay se repartan las filas sin pisarse. Si publicar falla, el `ROLLBACK` deja la fila pendiente.
- **Publicar con CDC (Debezium):** el conector de PostgreSQL lee el **WAL** por replicación lógica. Necesita
  `wal_level=logical` en el servidor y `plugin.name=pgoutput` en el conector (el valor por defecto es `decoderbufs`,
  que la imagen oficial de PostgreSQL no trae). La transformación `io.debezium.transforms.outbox.EventRouter` convierte
  cada fila en un mensaje: topic `outbox.event.${routedByValue}` (por defecto el valor de `aggregatetype`), clave
  `aggregateid` y valor `payload`.
- **Qué ves en el WAL:** `cdc-wal.js` crea un slot con el plugin `test_decoding` (texto legible) y muestra que las dos
  filas aparecen entre el mismo `BEGIN` y `COMMIT`. Eso es exactamente lo que Debezium aprovecha.
- Fuentes: https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html (columnas y
  valores por defecto del EventRouter) y https://debezium.io/documentation/reference/stable/connectors/postgresql.html
  (`wal_level=logical`, `plugin.name`).

#### 8. EXPLICACIÓN MAESTRA

- **Relay por sondeo vs CDC.** El sondeo es simple (solo SQL, sin infraestructura extra) pero añade latencia (el
  intervalo), carga sobre la tabla y escala mal con muchos eventos; el orden global depende de `creado_en`, que no
  coincide exactamente con el orden de commit. El CDC lee el WAL **en orden de commit**, con latencia de milisegundos y
  sin consultas a la tabla, a cambio de operar Kafka Connect, un **slot de replicación** (si el conector se para, el
  slot retiene WAL y puede **llenar el disco**) y permisos de replicación.
- **Al menos una vez, siempre.** Los dos métodos pueden publicar dos veces: el relay si muere entre publicar y marcar;
  Debezium si reinicia antes de guardar su offset. Por eso cada evento lleva un `id` único y los consumidores son
  idempotentes (ficha 3). Outbox resuelve «no perder», no «no duplicar».
- **Limpieza.** Con Debezium la fila ya no hace falta tras el commit: muchos equipos la **borran en la misma
  transacción** (el `INSERT` queda en el WAL y Debezium lo ve) o la purgan por fecha. Con sondeo, borra o archiva las
  publicadas.
- **Alternativas:** *listen-to-yourself* (el servicio publica el evento y actualiza su propia base al consumirlo: el
  evento manda, pero lees tus escrituras con retraso); *event sourcing* (Módulo 22: el evento **es** el dato, no hay
  doble escritura); transacciones de Kafka (ficha 4) solo cuando origen y destino son Kafka.
- **Cuándo NO usarlo:** si el aviso puede perderse sin daño (métricas, cachés que caducan solas), o si nadie más
  necesita enterarse en tiempo real (un proceso por lotes que lee la tabla basta).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **pg 8.23.1**, **PostgreSQL 18.7** (verificado aquí con 16.15) y **Debezium 3.7**.

`f152-outbox/esquema.sql`:

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

`f152-outbox/outbox.js`:

`comun/pg.js`: conexión PostgreSQL compartida.

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

`f152-outbox/debezium/conector-outbox.json` (se registra con `POST /connectors` en Kafka Connect):

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

`f152-outbox/cdc-wal.js`:

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

`f152-outbox/demo.js`:

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

#### 10. MINI-LABORATORIO

1. Levanta PostgreSQL y crea pedidos con su outbox:

```bash
docker compose up -d --wait postgres
node f152-outbox/demo.js
```

**Output esperado** (real, con PostgreSQL 16.15 en el entorno de redacción):

```text
P-3 rechazado: new row for relation "f152_pedidos" violates check constraint "f152_pedidos_total_check"
pedidos: 2 · eventos en outbox: 2
→ outbox.event.pedido key=P-1 PedidoCreado {"total":120000,"cliente":"ana","pedidoId":"P-1"}
→ outbox.event.pedido key=P-2 PedidoCreado {"total":45000,"cliente":"luis","pedidoId":"P-2"}
relay: 2 publicados · segunda vuelta: 0 pendientes
```

(`jsonb` no conserva el orden de las claves del objeto original: por eso `total` aparece antes que `pedidoId`.)

2. Mira lo que lee Debezium: el WAL decodificado.

```bash
node f152-outbox/cdc-wal.js
```

**Output esperado** (real; el número tras `BEGIN` y `COMMIT` es el id de transacción y cambia en cada ejecución):

```text
BEGIN 23290
table public.f152_pedidos: INSERT: id[text]:'P-7' cliente[text]:'ana' total[integer]:99000
table public.f152_outbox: INSERT: id[uuid]:'…' aggregatetype[character varying]:'pedido' aggregateid[character varying]:'P-7' type[character varying]:'PedidoCreado' payload[jsonb]:'{"total": 99000, "cliente": "ana", "pedidoId": "P-7"}' creado_en[…]:'…' publicado_en[timestamp with time zone]:null
COMMIT 23290
```

3. Con todo el `docker compose` arriba, registra el conector y lee el topic:

```bash
curl -s -X POST -H 'Content-Type: application/json' --data @f152-outbox/debezium/conector-outbox.json http://localhost:8083/connectors
node f152-outbox/demo.js
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic outbox.event.pedido --from-beginning --property print.key=true --property print.headers=true --max-messages 2
```

**Output esperado** (no ejecutado aquí; pendiente en `verificacion/microservicios/pendiente.md`): dos líneas, una por
pedido, con la cabecera `eventType:PedidoCreado` (más las cabeceras propias de Debezium), la clave `P-1` o `P-2` y el
payload JSON del pedido como valor. **Captura comentada:** en `http://localhost:8083/connectors/pedidos-outbox/status`
el conector y su tarea en `"state":"RUNNING"`.

#### 11. VERIFICACIÓN

Test contra PostgreSQL real (`f152-outbox/outbox.test.js`):

```javascript
// Módulo 25 · F152 · Tests contra PostgreSQL real. Ejecuta: node --test f152-outbox/outbox.test.js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { crearPedido, prepararEsquema, publicarPendientes } from './outbox.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const contar = async (tabla) => (await pool.query(`SELECT count(*)::int AS n FROM ${tabla}`)).rows[0].n;

test('el pedido y su evento se guardan juntos', async () => {
  await crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 100 });
  assert.equal(await contar('f152_pedidos'), 1);
  assert.equal(await contar('f152_outbox'), 1);
});

test('si el pedido falla, el evento tampoco queda (misma transacción)', async () => {
  await assert.rejects(crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 0 }), /check constraint/);
  assert.equal(await contar('f152_outbox'), 0);
});

test('si publicar falla, la fila sigue pendiente y se publica en el siguiente intento', async () => {
  await crearPedido(pool, { id: 'P-1', cliente: 'ana', total: 100 });
  await assert.rejects(publicarPendientes(pool, async () => { throw new Error('broker caído'); }));
  const recibidos = [];
  assert.equal(await publicarPendientes(pool, async (m) => recibidos.push(m.key)), 1);
  assert.deepEqual(recibidos, ['P-1']);
});

test('dos relays a la vez no publican la misma fila (FOR UPDATE SKIP LOCKED)', async () => {
  for (let i = 1; i <= 20; i++) await crearPedido(pool, { id: `P-${i}`, cliente: 'ana', total: i });
  const vistos = [];
  const lento = async (m) => { vistos.push(m.key); await new Promise((r) => setTimeout(r, 5)); };
  const [a, b] = await Promise.all([publicarPendientes(pool, lento, { lote: 10 }), publicarPendientes(pool, lento, { lote: 10 })]);
  assert.equal(a + b, 20);
  assert.equal(new Set(vistos).size, 20);
});

test('el conector de Debezium usa pgoutput, la tabla outbox y el EventRouter', async () => {
  const { config } = JSON.parse(await readFile(new URL('./debezium/conector-outbox.json', import.meta.url), 'utf8'));
  assert.equal(config['connector.class'], 'io.debezium.connector.postgresql.PostgresConnector');
  assert.equal(config['plugin.name'], 'pgoutput'); // el valor por defecto es decoderbufs, que la imagen oficial de postgres no trae
  assert.equal(config['table.include.list'], 'public.f152_outbox');
  assert.equal(config['transforms.outbox.type'], 'io.debezium.transforms.outbox.EventRouter');
});
```

```bash
node --test --test-reporter=spec f152-outbox/outbox.test.js
```

**Output esperado** (real): las 5 pruebas con `✔`, `ℹ tests 5` y `ℹ pass 5`. Con todo el Compose arriba,
`node --test f152-outbox/debezium.infra.js` registra el conector y espera el evento de `P-42` en Kafka (pendiente de
ejecutar en el Mac).

**Pregunta de comprobación:** si el relay publica una fila y el proceso muere antes del `COMMIT` que la marca, ¿qué pasa
en la siguiente vuelta? (La fila sigue sin `publicado_en`: se publica otra vez. Habrá un duplicado, nunca una pérdida.)

#### 12. ERROR COMÚN

**Síntoma:** hay pedidos en la base de datos que inventario y pagos nunca recibieron; los logs muestran un error de
conexión al broker justo después de crearlos. **Causa:** *dual write*: guardar y publicar como dos operaciones
separadas.

```javascript
// Módulo 25 · F152 · Error común: «dual write» (guardar en la BD y luego publicar en el broker, por separado).
// Ejecuta: node f152-outbox/error-comun.js
import { crearPool } from '../comun/pg.js';
import { prepararEsquema } from './outbox.js';

const pool = crearPool();
await prepararEsquema(pool);
const publicados = [];
const brokerCaido = async () => { throw new Error('KafkaJSConnectionError: Connection error: connect ECONNREFUSED 127.0.0.1:9092'); };

async function crearPedidoMal({ id, cliente, total }, publicar) {
  await pool.query('INSERT INTO f152_pedidos (id, cliente, total) VALUES ($1, $2, $3)', [id, cliente, total]); // 1) commit
  await publicar({ id, tipo: 'PedidoCreado' }); // 2) si esto falla, el pedido YA existe y nadie se entera
  publicados.push(id);
}

await crearPedidoMal({ id: 'P-1', cliente: 'ana', total: 120000 }, brokerCaido).catch((e) => console.log(`publicar falló: ${e.message}`));
const { rows: [c] } = await pool.query('SELECT count(*)::int AS n FROM f152_pedidos');
console.log(`MAL  → pedidos en la BD: ${c.n} · eventos publicados: ${publicados.length} (inventario y pagos nunca sabrán de P-1)`);
await pool.end();
```

Salida real de `node f152-outbox/error-comun.js`:

```text
publicar falló: KafkaJSConnectionError: Connection error: connect ECONNREFUSED 127.0.0.1:9092
MAL  → pedidos en la BD: 1 · eventos publicados: 0 (inventario y pagos nunca sabrán de P-1)
```

**Diagnóstico visual:** compara `SELECT count(*) FROM pedidos` con los eventos del topic (o con lo que tiene
inventario): la diferencia crece justo en los minutos en que el broker tuvo problemas. **Arreglo:** escribe el evento en
la outbox dentro de la misma transacción (`crearPedido()`) y deja la publicación al relay o a Debezium. Si además usas
Debezium, recuerda `plugin.name=pgoutput`: sin él, el conector falla al arrancar porque busca el plugin `decoderbufs`.

**Error real visto en el Mac (Debezium 3.7 + Kafka 4.4):** la clave llegó como
`{"schema":{"type":"string","optional":false},"payload":"P-42"}` en vez de `P-42`. El *worker* de Kafka Connect usa
`JsonConverter` con esquemas para las claves si el conector no dice otra cosa. Solución: `"key.converter":
"org.apache.kafka.connect.storage.StringConverter"` en la configuración del conector (la clave del EventRouter es el
`aggregateid`, un texto).

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo garantizas que un evento se publica si y solo si se guardó el cambio en la base de datos?**

**Respuesta modelo:** no lo intento con dos escrituras, porque entre la base de datos y el broker no hay una
transacción común y cualquier fallo entre las dos me deja inconsistente. Uso el patrón outbox: en la misma transacción
local en que guardo el pedido, inserto una fila con el evento en una tabla outbox. La base de datos garantiza que están
las dos o ninguna. Después un proceso aparte lleva esas filas al broker: un relay que consulta con `FOR UPDATE SKIP
LOCKED` y marca lo publicado, o mejor, captura de cambios con Debezium, que lee el WAL en orden de commit con poca
latencia y su EventRouter enruta por tipo de agregado con el id del agregado como clave. Cualquiera de los dos publica
al menos una vez, así que los eventos llevan un id único y los consumidores son idempotentes. Y vigilo el slot de
replicación, porque un conector parado retiene WAL.

#### 14. ANTI-PATRÓN RELACIONADO

**Publicar «dentro» de la transacción para que parezca atómico.** Llamar al broker entre el `BEGIN` y el `COMMIT` no
une las dos operaciones: si el commit falla después de publicar, el evento ya salió y habla de un pedido que no existe.

```javascript
// MAL: el evento sale aunque el COMMIT falle después (o tarde, con la transacción y sus bloqueos abiertos).
await tx.query('BEGIN');
await tx.query('INSERT INTO pedidos …');
await producer.send({ topic: 'pedidos', messages: [evento] }); // ✘ efecto fuera de la transacción
await tx.query('COMMIT');

// BIEN: el evento es una fila más de la misma transacción; otro proceso lo publica (outbox.js).
await tx.query('INSERT INTO f152_outbox (aggregatetype, aggregateid, type, payload) VALUES (…)');
```

---

### Sagas orquestadas con Temporal.io

#### 1. UBICACIÓN

Módulo 25, Lección 2 de 5 · Fase 3.

#### 2. PRERREQUISITOS

- Sagas coreografiadas y compensaciones idempotentes (Módulo 22, fichas 3 y 4).
- Reintentos con backoff y errores transitorios vs permanentes (Módulo 19).
- `async`/`await` y módulos ES (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** una saga orquestada de pedido (reservar stock → cobrar → crear envío) como un **workflow de Temporal**,
con actividades idempotentes, política de reintentos, errores no reintentables y compensaciones en orden inverso, y
**explicar** por qué el código del workflow tiene que ser determinista. Lo compruebas cuando `saga.test.js` pasa 5 de
5, el empaquetador rechaza el workflow con E/S y, con un servidor Temporal, `temporal.infra.js` pasa 3 de 3.

#### 4. ANALOGÍA VISUAL

Dibuja a una **organizadora de bodas** con una **libreta**. Ella no cocina ni toca música: **llama** al catering, a la
banda y al fotógrafo (actividades) y **anota en la libreta** cada llamada y cada respuesta. Si se enferma a mitad del
día, otra organizadora toma la libreta, la **relee desde la primera línea** y sabe exactamente por dónde iba sin volver
a llamar a nadie (replay del historial). Si el fotógrafo no contesta, vuelve a llamar con pausas cada vez más largas
(reintentos). Si el salón cancela, ella deshace en orden inverso: primero cancela la banda, luego el catering
(compensaciones). La regla de oro: la organizadora **solo decide**; nunca va ella misma a comprar flores, porque al
releer la libreta compraría las flores dos veces.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de secuencia. El cliente inicia el workflow sagaPedido con el id saga-P-1 en el
servidor Temporal, que entrega una tarea al worker. El workflow programa reservarStock, que se ejecuta bien, y después
cobrarPago; un fallo transitorio provoca un reintento con backoff, y un rechazo marcado como no reintentable hace que
el servidor devuelva un ActivityFailure al workflow. El workflow programa la compensación liberarStock, que se ejecuta
bien, y termina con estado COMPENSADA; el cliente recibe el resultado.

#### 6. EXPLICACIÓN NIVEL 0

- Comprar en una tienda en línea son varios pasos en servicios distintos: apartar el producto, cobrar, programar el
  envío. Si el cobro falla, hay que **devolver** el producto al estante.
- Una **saga** es esa lista de pasos con su «deshacer» para cada uno.
- En una saga **orquestada**, un solo programa (el orquestador) dice qué paso toca, en lugar de que cada servicio
  escuche al anterior.
- **Temporal** es un orquestador que **no olvida**: guarda cada paso en una base de datos. Si el programa se apaga a
  mitad, al volver continúa exactamente donde iba.

#### 7. EXPLICACIÓN INTERMEDIA

- **Workflow** (`workflows.js`): una función `async` que decide el orden. Corre en un **sandbox determinista**: el
  worker la empaqueta con webpack y la ejecuta aislada, sin `node:fs`, sin red. `Date.now()` y `Math.random()` se
  reemplazan por versiones deterministas.
- **Actividades** (`actividades.js`): funciones normales de Node con los efectos. Se llaman desde el workflow con
  `proxyActivities({ startToCloseTimeout, retry })`. Temporal las reintenta según la `RetryPolicy`
  (`initialInterval`, `backoffCoefficient`, `maximumAttempts`, `nonRetryableErrorTypes`).
- **Errores:** un `throw new Error()` en una actividad se reintenta; `ApplicationFailure.nonRetryable(mensaje, tipo)`
  no. En el workflow el fallo llega como `ActivityFailure` («Activity task failed») con el motivo real en `cause`.
- **Compensaciones:** `saga.js` es una pila: tras cada paso que **termina bien** se apila su «deshacer»; si un paso
  falla, se desapila y ejecuta todo en orden inverso. No importa nada de Node, así que sirve dentro del sandbox y en
  tests normales.
- **Worker y cliente:** `worker.js` registra workflows y actividades en la cola `pedidos`; `iniciar.js` arranca una
  ejecución con `workflowId = saga-<pedido>` (un segundo `start` con el mismo id lo rechaza el servidor).
- **Replay:** el servidor guarda el **historial de eventos** (actividad programada, completada, fallida…). Si el worker
  muere, otro relee el historial, re-ejecuta el código del workflow y, en vez de repetir las actividades ya hechas, usa
  sus resultados guardados.

#### 8. EXPLICACIÓN MAESTRA

- **Orquestación vs coreografía.** La coreografía (Módulo 22) no tiene punto único de fallo ni de acoplamiento, pero el
  flujo queda repartido en suscripciones y nadie lo ve entero; diagnosticar «¿por qué este pedido se quedó a medias?»
  exige reconstruirlo desde logs. Orquestar con Temporal da un flujo legible, timeouts y reintentos declarativos,
  historial consultable en la UI y esperas de días (`sleep('3 days')`) sin cron. El precio: operar el clúster de
  Temporal (con su base de datos) y aprender sus restricciones de determinismo y versionado.
- **Determinismo y versionado.** Cambiar el código de un workflow con ejecuciones en curso puede romper el replay
  (`NonDeterminismError`) si cambia el orden de comandos. Se resuelve con `patched()` / `deprecatePatch()` o con
  *Worker Versioning*. Esto es lo que más sorprende en producción.
- **Las actividades siguen siendo «al menos una vez».** Temporal garantiza que el workflow avanza, pero una actividad
  puede ejecutarse más de una vez (el worker muere tras cobrar y antes de informar). Por eso `cobrarPago` es idempotente
  por `pedidoId` y, en un servicio real, pasa ese id como clave de idempotencia a la pasarela.
- **Compensaciones que fallan.** Una compensación es una actividad más: se reintenta. Si aun así falla, la saga no
  puede quedar «en silencio»: `saga.js` devuelve `sinCompensar` para alertar o abrir una tarea manual.
- **Alternativas:** *coreografía* con eventos (pocos pasos, equipos autónomos); *máquina de estados en tu base de
  datos* con un proceso que la avanza (sin infraestructura nueva, pero reinventas timeouts y reintentos); *AWS Step
  Functions* o *Camunda/Zeebe* (orquestadores gestionados o BPMN, útiles si negocio quiere ver el diagrama).
- **Cuándo NO usarlo:** flujos de uno o dos pasos síncronos (una llamada con reintento basta); equipos que no pueden
  operar Temporal y no quieren el servicio gestionado; o un monolito modular, donde una transacción local de la base de
  datos resuelve lo mismo sin saga.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

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

#### 11. VERIFICACIÓN

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

#### 12. ERROR COMÚN

**Síntoma:** el worker no arranca y el log muestra un error de webpack al empaquetar los workflows. **Causa:** el
workflow importa un módulo de Node (`node:fs`, `pg`, un cliente HTTP) para hacer E/S directamente.

`f153-temporal/workflow-mal.js`:

```javascript
// Módulo 25 · F153 · Error común: un workflow que hace E/S directamente (aquí lee un archivo con node:fs).
// El código del workflow se re-ejecuta (replay) para reconstruir su estado: tiene que ser determinista.
import { readFileSync } from 'node:fs';
import { proxyActivities } from '@temporalio/workflow';

const act = proxyActivities({ startToCloseTimeout: '10 seconds' });

export async function sagaPedidoMal(pedido) {
  const tarifas = JSON.parse(readFileSync('/tmp/tarifas.json', 'utf8')); // ✘ E/S dentro del workflow
  await act.cobrarPago({ ...pedido, total: pedido.total + tarifas.envio });
}
```

`f153-temporal/error-comun.js`:

```javascript
// Módulo 25 · F153 · Error común: E/S dentro del workflow. El empaquetador del Worker lo rechaza antes de arrancar.
// Ejecuta: node f153-temporal/error-comun.js
import { bundleWorkflowCode } from '@temporalio/worker';

const errores = [];
const logger = { trace() {}, debug() {}, info() {}, warn() {}, log() {}, error: (m) => errores.push(String(m)) };
try {
  await bundleWorkflowCode({ workflowsPath: new URL('./workflow-mal.js', import.meta.url).pathname, logger });
  console.log('empaquetado (no debía pasar)');
} catch (error) {
  console.log(`MAL  → ${error.message.split(',')[0]}`);
  const lineas = errores.join('\n').split('\n');
  console.log(`       ${lineas.find((l) => l.startsWith('ERROR in'))}`);
  console.log(`       ${lineas.find((l) => l.includes('UnhandledSchemeError'))}`);
}
const { code } = await bundleWorkflowCode({ workflowsPath: new URL('./workflows.js', import.meta.url).pathname, logger });
console.log(`BIEN → workflows.js empaquetado (${(code.length / 1024 / 1024).toFixed(1)} MiB): la E/S vive en actividades.js`);
```

Salida real de `node f153-temporal/error-comun.js`:

```text
MAL  → Webpack finished with errors
       ERROR in node:fs
       Module build failed: UnhandledSchemeError: Reading from "node:fs" is not handled by plugins (Unhandled scheme).
BIEN → workflows.js empaquetado (1.7 MiB): la E/S vive en actividades.js
```

**Diagnóstico visual:** el mensaje completo de webpack termina con la cadena de imports
(`@./f153-temporal/workflow-mal.js`) que te dice qué archivo trajo el módulo prohibido. **Arreglo:** mueve la E/S a una
actividad (`leerTarifas()`) y llámala con `proxyActivities`. Si el import es indirecto (una librería tuya que importa
`pg`), separa los tipos y funciones puras en otro archivo.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cuándo orquestarías una saga con Temporal en vez de coreografiarla con eventos, y qué cuidarías?**

**Respuesta modelo:** orquesto cuando el flujo tiene varios pasos con reglas de negocio, timeouts largos o necesito
ver en un lugar en qué paso está cada pedido; coreografío cuando son pocos pasos y quiero que los equipos estén
desacoplados. Con Temporal el workflow solo decide y los efectos van en actividades con una RetryPolicy: los errores
transitorios se reintentan con backoff y los de negocio se marcan no reintentables. Cada paso que termina bien apila su
compensación y, si algo falla, compenso en orden inverso. Cuido tres cosas: que el workflow sea determinista, porque
se re-ejecuta desde el historial; que las actividades sean idempotentes, porque pueden correr más de una vez; y el
versionado del workflow cuando cambio el código con ejecuciones vivas, con `patched` o Worker Versioning. Y si una
compensación falla definitivamente, lo reporto para intervención manual en vez de dejarlo en silencio.

#### 14. ANTI-PATRÓN RELACIONADO

**El «orquestador dios»:** un workflow que contiene la lógica de negocio de todos los servicios (calcula precios,
valida stock, decide reembolsos) en lugar de pedírsela a ellos. Acaba siendo un monolito distribuido: cada cambio en un
servicio obliga a cambiar y desplegar el orquestador.

```mermaid
flowchart LR
    subgraph MAL
        O1["workflow: calcula precio,<br/>valida stock, decide reembolso"] --> DB1[("BD de inventario")]
        O1 --> DB2[("BD de pagos")]
    end
    subgraph BIEN
        O2["workflow: solo el orden<br/>y las compensaciones"] --> S1["inventario.reservar()"]
        O2 --> S2["pagos.cobrar()"]
    end
```

**Texto alternativo:** a la izquierda, el anti-patrón: un workflow que calcula precios, valida stock y decide
reembolsos y además escribe directamente en las bases de datos de inventario y pagos. A la derecha, lo correcto: el
workflow solo decide el orden y las compensaciones, y llama a las operaciones de inventario y pagos, que guardan su
propia lógica.

---

### Idempotencia real en consumidores Kafka

#### 1. UBICACIÓN

Módulo 25, Lección 3 de 5 · Fase 3.

#### 2. PRERREQUISITOS

- Consumer groups, offsets y commit en KafkaJS (Módulo 18).
- Deduplicación con Redis (Módulo 22, ficha 2).
- Outbox (ficha 1 de este módulo): de ahí vienen los duplicados.

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** un consumidor que aplica cada evento **una sola vez** aunque Kafka lo entregue varias veces, guardando
la marca «procesado» y el efecto en **la misma transacción** de PostgreSQL, y **justificar** por qué la clave es el id
de negocio del evento y no el offset. Lo compruebas cuando `idempotencia.test.js` pasa 4 de 4 y cinco copias
simultáneas del mismo evento suman una sola vez.

#### 4. ANALOGÍA VISUAL

Dibuja la **ventanilla de un banco** que cobra cheques. Cada cheque tiene un **número impreso**. La cajera, antes de
pagar, busca el número en un **libro de cheques cobrados**; si está, lo rechaza. Lo importante: escribe el número en
el libro **en el mismo movimiento** en que entrega el dinero (con una sola firma). Si apuntara primero y se cayera la
luz antes de pagar, el cliente se quedaría sin dinero; si pagara primero y se fuera la luz antes de apuntar, el cheque
se cobraría dos veces. Y no sirve fijarse en **el turno de la fila** en que llegó el cheque (el offset): el mismo
cheque puede volver a la fila con otro turno.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de flujo. Kafka entrega el evento C-1 dos veces, en los offsets 0 y 1, porque el
productor reintentó. El consumidor abre una transacción e intenta insertar la pareja consumidor y evento en la tabla de
procesados con ON CONFLICT DO NOTHING. Si se insertó una fila, aplica el efecto de sumar puntos; si no se insertó
ninguna, es un duplicado y no hace nada. En los dos casos confirma la transacción, y después se confirma el offset en
Kafka.

#### 6. EXPLICACIÓN NIVEL 0

- Kafka entrega cada mensaje **al menos una vez**. A veces, dos. No es un fallo: es el precio de no perder nada.
- Si el mensaje dice «suma 10 puntos» y llega dos veces, el cliente recibe 20. Eso sí es un fallo.
- Un consumidor **idempotente** produce el mismo resultado si recibe un mensaje una vez o diez veces.
- La forma más segura: cada evento trae un **número único**; el consumidor apunta en su base de datos «ya procesé este
  número» en el mismo instante en que suma los puntos. Si el número ya estaba, no suma.

#### 7. EXPLICACIÓN INTERMEDIA

- **De dónde vienen los duplicados:** (1) el productor reintenta tras un timeout y el primer envío sí había llegado
  (otro offset); (2) el consumidor procesa y muere antes de confirmar el offset, o hay un **rebalanceo**, y otro
  miembro del grupo vuelve a leer desde el último offset confirmado (mismo offset); (3) el outbox publica dos veces
  (ficha 1).
- **La tabla `f154_procesados`** tiene clave primaria `(consumidor, evento_id)`: cada grupo de consumidores lleva su
  propia cuenta, porque el mismo evento debe procesarlo una vez *cada* servicio interesado.
- **`INSERT … ON CONFLICT DO NOTHING`** devuelve `rowCount = 0` si la clave ya existe. Si dos transacciones insertan la
  misma clave a la vez, la segunda **espera** a que la primera termine: si la primera confirma, la segunda no inserta;
  si la primera hace `ROLLBACK`, la segunda sí inserta. La base de datos resuelve la carrera.
- **Efecto en la misma transacción:** `procesarUnaVez()` recibe el cliente de la transacción y se lo pasa al efecto.
  Si el efecto lanza, el `ROLLBACK` borra también la marca y el reintento procesa.
- **Commit del offset después:** con `autoCommit` (por defecto en KafkaJS), el offset se confirma después de que
  `eachMessage` termina. Si mueres entre tu `COMMIT` y el del offset, Kafka reentrega y la tabla lo detecta.

#### 8. EXPLICACIÓN MAESTRA

- **Id de negocio, no offset.** El offset identifica una **posición** en una partición, no un **hecho**. Un reintento
  del productor (si no es idempotente o si la aplicación reenvía) crea otra posición para el mismo hecho. El id debe
  nacer con el evento (el `id` uuid de la outbox, o una clave natural como `compra-C-1`).
- **Productor idempotente ≠ consumidor idempotente.** `idempotent: true` en el productor evita duplicados por
  reintentos **de red** dentro de una sesión del productor; no evita que tu aplicación llame dos veces a `send()`, ni
  las reentregas al consumidor. Necesitas las dos cosas.
- **Efectos fuera de tu base de datos.** Si el efecto es una llamada HTTP (cobrar, enviar correo), la tabla no basta:
  pasa el id del evento como **clave de idempotencia** al servicio externo (cabecera `Idempotency-Key`), o guarda
  primero la intención y procésala con su propio outbox.
- **Retención de la tabla.** Crece sin límite: purga por fecha lo que ya no puede volver (más allá de la retención del
  topic más un margen). Con Redis (`SET NX EX`, Módulo 22) la caducidad es automática, pero la marca y el efecto ya no
  son atómicos si el efecto vive en otra base de datos.
- **Alternativas:** *efectos naturalmente idempotentes* (`UPDATE … SET estado = 'PAGADO'` en vez de sumar;
  `upsert` por clave); *versión o secuencia por agregado* (ignorar eventos con versión ≤ la aplicada: sirve además
  para descartar eventos desordenados); *offsets en la base de datos* (ficha 4).
- **Cuándo NO hace falta:** consumidores cuyo efecto ya es idempotente por diseño (sobrescribir una proyección con el
  último estado) o que toleran duplicados (contadores aproximados, métricas).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **pg 8.23.1**, **kafkajs 2.2.4**, **PostgreSQL 18.7** y **Kafka 4.4.0**.

`f154-idempotencia/idempotencia.js`:

`comun/pg.js`: conexión PostgreSQL compartida.

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

`f154-idempotencia/consumidor-kafka.js`:

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

`f154-idempotencia/demo.js`:

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

#### 10. MINI-LABORATORIO

1. Simula las entregas de Kafka contra PostgreSQL:

```bash
docker compose up -d --wait postgres
node f154-idempotencia/demo.js
```

**Output esperado** (real):

```text
offset 0 C-1 → procesado
offset 1 C-1 → duplicado
offset 2 C-2 → procesado
offset 2 C-2 → duplicado
C-3 en paralelo ×5 → 1 procesado, 4 duplicados
puntos de ana = 16 (10 + 5 + 1)
```

2. Mira la tabla de procesados:

```bash
docker compose exec postgres psql -U academia -c "SELECT consumidor, evento_id FROM f154_procesados ORDER BY evento_id"
```

**Output esperado:** tres filas, `fidelidad | C-1`, `fidelidad | C-2` y `fidelidad | C-3`.

3. Con Kafka arriba, el consumidor de verdad (el productor manda la misma compra dos veces):

```bash
docker compose up -d --wait kafka
node f154-idempotencia/consumidor-kafka.js
```

**Output esperado** (no ejecutado aquí; pendiente en `verificacion/microservicios/pendiente.md`):

```text
partición 0 offset 0 evento C-1 → procesado
partición 0 offset 1 evento C-1 → duplicado
puntos de ana = 10
```

#### 11. VERIFICACIÓN

Test contra PostgreSQL real (`f154-idempotencia/idempotencia.test.js`):

```javascript
// Módulo 25 · F154 · Tests contra PostgreSQL real. Ejecuta: node --test f154-idempotencia/idempotencia.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, procesarUnaVez, sumarPuntos } from './idempotencia.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const puntos = async () => (await pool.query("SELECT puntos FROM f154_puntos WHERE cliente = 'ana'")).rows[0]?.puntos ?? 0;
const ev = { id: 'C-1', cliente: 'ana', puntos: 10 };

test('el mismo evento dos veces suma una sola vez', async () => {
  assert.equal(await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos), 'procesado');
  assert.equal(await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos), 'duplicado');
  assert.equal(await puntos(), 10);
});

test('cinco copias en paralelo: una procesada y cuatro duplicadas', async () => {
  const r = await Promise.all(Array.from({ length: 5 }, () => procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos)));
  assert.equal(r.filter((x) => x === 'procesado').length, 1);
  assert.equal(await puntos(), 10);
});

test('si el efecto falla, la marca se deshace y el reintento sí procesa', async () => {
  await assert.rejects(procesarUnaVez(pool, 'fidelidad', ev, async () => { throw new Error('BD de puntos caída'); }));
  assert.equal(await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos), 'procesado');
  assert.equal(await puntos(), 10);
});

test('otro grupo de consumidores procesa el mismo evento por su cuenta', async () => {
  await procesarUnaVez(pool, 'fidelidad', ev, sumarPuntos);
  assert.equal(await procesarUnaVez(pool, 'auditoria', ev, async () => {}), 'procesado');
});
```

```bash
node --test --test-reporter=spec f154-idempotencia/idempotencia.test.js
```

**Output esperado** (real): `ℹ tests 4` y `ℹ pass 4`.

**Pregunta de comprobación:** si el efecto falla con la base de datos de puntos caída, ¿queda el evento marcado como
procesado? (No: la marca está en la misma transacción y el `ROLLBACK` la borra; el reintento lo procesa.)

#### 12. ERROR COMÚN

**Síntoma:** a pesar de «deduplicar», algunos clientes tienen el doble de puntos, siempre después de un timeout del
productor. **Causa:** la clave de deduplicación es `partición:offset`.

```javascript
// Módulo 25 · F154 · Error común: deduplicar por offset de Kafka. Ejecuta: node f154-idempotencia/error-comun.js
// Un reintento del productor (sin idempotencia) escribe el mismo evento en OTRO offset: la deduplicación por offset no lo ve.
const entregas = [
  { particion: 0, offset: 0, evento: { id: 'C-1', puntos: 10 } },
  { particion: 0, offset: 1, evento: { id: 'C-1', puntos: 10 } },
];
function contar(clave) {
  const vistos = new Set();
  let puntos = 0;
  for (const e of entregas) {
    const k = clave(e);
    if (vistos.has(k)) continue;
    vistos.add(k);
    puntos += e.evento.puntos;
  }
  return puntos;
}
console.log(`MAL  → clave partición+offset: puntos = ${contar((e) => `${e.particion}:${e.offset}`)}`);
console.log(`BIEN → clave id del evento:     puntos = ${contar((e) => e.evento.id)}`);
```

Salida real de `node f154-idempotencia/error-comun.js`:

```text
MAL  → clave partición+offset: puntos = 20
BIEN → clave id del evento:     puntos = 10
```

**Diagnóstico visual:** en el topic (`kafka-console-consumer.sh --property print.offset=true`) ves el mismo `id` de
evento en dos offsets consecutivos; en la tabla de procesados, dos filas para un solo hecho. **Arreglo:** deduplica por
el id de negocio que nace con el evento.

#### 13. PREGUNTA DE ENTREVISTA

**Kafka entrega al menos una vez. ¿Cómo haces que tu consumidor aplique cada evento una sola vez?**

**Respuesta modelo:** asumo duplicados por tres vías: reintentos del productor, reentregas tras un rebalanceo o una
caída antes del commit del offset, y publicaciones dobles del outbox. Cada evento lleva un id único que nace con él, y
el consumidor, en una sola transacción de su base de datos, inserta la pareja grupo-evento en una tabla con clave
primaria y aplica el efecto; si la inserción no afecta filas, es un duplicado y no hago nada. Como marca y efecto se
confirman juntos, un fallo deshace los dos y la carrera entre dos consumidores la resuelve la clave primaria. El
offset lo confirmo después. Si el efecto sale de mi base de datos, propago el id como clave de idempotencia. Nunca
deduplico por offset, porque un reintento del productor crea otro offset para el mismo hecho. Y purgo la tabla según
la retención del topic.

#### 14. ANTI-PATRÓN RELACIONADO

**Comprobar y luego actuar en dos pasos separados** («si no está procesado, procesa y marca»), sin transacción ni
clave única. Entre el `SELECT` y el `INSERT`, otro consumidor hace lo mismo y los dos procesan.

```javascript
// MAL: carrera entre la consulta y la marca; y si el efecto falla tras marcar, el evento se pierde.
const { rowCount } = await pool.query('SELECT 1 FROM procesados WHERE id = $1', [evento.id]);
if (rowCount === 0) { await sumarPuntos(pool, evento); await pool.query('INSERT INTO procesados VALUES ($1)', [evento.id]); }

// BIEN: la clave primaria decide, y marca + efecto van juntos (idempotencia.js).
await procesarUnaVez(pool, 'fidelidad', evento, sumarPuntos);
```

---

### Exactly-once semantics en la práctica

#### 1. UBICACIÓN

Módulo 25, Lección 4 de 5 · Fase 3.

#### 2. PRERREQUISITOS

- Idempotencia en consumidores (ficha 3).
- Exactly-Once Semantics de Kafka en Java (Módulo 11, ficha 2): productor idempotente y transaccional.
- Transacciones de PostgreSQL (Módulo 15).

#### 3. OBJETIVO DE APRENDIZAJE

**Aplicar** las dos formas reales de conseguir el efecto «exactamente una vez»: las **transacciones de Kafka**
(leer → transformar → escribir, con el offset dentro de la transacción y lectores `read_committed`) cuando origen y
destino son Kafka, y **guardar el offset junto al resultado** en tu base de datos cuando el destino no es Kafka; y
**delimitar** lo que ninguna de las dos cubre (efectos externos). Lo compruebas cuando `exactly-once.test.js` pasa 3 de
3 y el saldo queda exacto tras una caída.

#### 4. ANALOGÍA VISUAL

Dibuja una **cadena de montaje con un marcapáginas**. El operario toma una pieza de la cinta de entrada, la pinta y la
pone en la cinta de salida. En la misma mano lleva un **marcapáginas** que indica qué pieza toca después. Si deja la
pieza pintada y mueve el marcapáginas **con un solo gesto**, al volver de un corte de luz sabe exactamente dónde
seguir: ni pinta dos veces ni se salta ninguna. Las piezas que estaba pintando cuando se cortó la luz quedan con una
**etiqueta roja** «descartar», y el siguiente puesto, que solo mira las piezas sin etiqueta, ni las ve
(`read_committed`). Pero si el operario, además de pintar, **llamó por teléfono** al cliente para avisar, esa llamada no
se puede «descartar»: al repetir la pieza, el cliente recibe otra llamada.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de secuencia. El consumidor del grupo f155-conversor recibe PAGO-1 en el offset 0; el
productor transaccional abre una transacción con el coordinador, envía el pago convertido al topic de salida, envía el
offset 1 del grupo a __consumer_offsets y confirma, lo que escribe marcadores de commit. Con PAGO-2 hace lo mismo pero
aborta: se escribe un marcador de aborto y el offset no avanza, así que PAGO-2 vuelve a llegar y esta vez se confirma.
Una nota indica que un lector read_committed ve PAGO-1, PAGO-2 y PAGO-3, y uno read_uncommitted ve además el intento
abortado.

#### 6. EXPLICACIÓN NIVEL 0

- «Exactamente una vez» suena a que un mensaje viaja una sola vez. No es así: los mensajes pueden **viajar** varias
  veces; lo que se consigue es que el **resultado** cuente una sola vez.
- Truco 1: guardar el resultado y el «voy por aquí» (el **offset**) en el mismo lugar y al mismo tiempo. Si algo
  falla, no se guarda ninguno de los dos y se repite desde el mismo punto.
- Truco 2: Kafka permite hacer eso mismo **dentro de Kafka**: escribir el resultado en otro topic y avanzar el offset en
  una sola **transacción**.
- Lo que ningún truco arregla: si en medio mandaste un correo o llamaste a otra API, eso ya ocurrió y se repetirá.

#### 7. EXPLICACIÓN INTERMEDIA

- **Transacciones de Kafka** (`eos-kafka.js`): productor con `transactionalId` estable, `idempotent: true` y
  `maxInFlightRequests: 1`. Por cada mensaje: `producer.transaction()`, `tx.send()` a la salida,
  `tx.sendOffsets({ consumerGroupId, topics })` con **offset + 1** (el siguiente a leer) y `tx.commit()`; si algo
  falla, `tx.abort()`. El consumidor usa `autoCommit: false` porque el offset lo confirma la transacción.
- **Lectores `read_committed`:** en KafkaJS el consumidor tiene `readUncommitted: false` por defecto, que se traduce
  en `isolation.level=read_committed`: no entrega mensajes de transacciones abiertas ni abortadas. Con
  `readUncommitted: true` verías también los abortados.
- **Fencing de zombis:** al iniciar, el productor registra su `transactionalId` y recibe una *epoch*. Si una instancia
  vieja (pausada por GC, o que perdió la red) vuelve e intenta escribir con la misma id, el coordinador la rechaza.
  Por eso el `transactionalId` es **estable por instancia** (por ejemplo, por partición asignada o por réplica), no
  aleatorio.
- **Offsets en tu base de datos** (`offsets-en-bd.js`): cuando la salida es PostgreSQL, guarda `siguiente offset` en
  una tabla, en la misma transacción que el efecto. Al arrancar, léelo y empieza desde ahí (con KafkaJS:
  `consumer.seek({ topic, partition, offset })` en el evento de asignación). La base de datos es la fuente de verdad del
  progreso, no el grupo de Kafka.
- **El límite:** un correo, una llamada HTTP o una escritura en otro sistema hecha a mitad se repite si la transacción
  se aborta o se reintenta (`error-comun.js`).

#### 8. EXPLICACIÓN MAESTRA

- **Coste de las transacciones de Kafka.** Cada commit escribe marcadores en todas las particiones tocadas y en
  `__consumer_offsets`; por mensaje es caro, así que en producción se agrupa (`eachBatch`, una transacción por lote).
  Los lectores `read_committed` no avanzan más allá del **LSO** (*last stable offset*): una transacción abierta mucho
  tiempo **frena a todos** los lectores de esa partición. Ajusta `transactionTimeout`.
- **Kafka Streams y KIP-447.** En Java, Kafka Streams con `processing.guarantee=exactly_once_v2` hace todo esto por ti
  y comparte un productor por hilo. En Node no hay equivalente oficial: o lo escribes como en `eos-kafka.js` o usas el
  patrón de offsets en base de datos.
- **Mantenimiento de KafkaJS.** `kafkajs` 2.2.4 no publica versiones desde 2023 (ver
  `docs/microservicios/08-herramientas-y-versiones.md`); para transacciones en producción considera
  `@confluentinc/kafka-javascript` (basado en librdkafka), que también las soporta.
- **Alternativas:** *at-least-once + idempotencia* (ficha 3: lo más común y lo más simple de operar); *offsets en la base
  de datos* (exactamente una vez hacia un único almacén transaccional); *transacciones de Kafka* (Kafka → Kafka). Para
  efectos externos: claves de idempotencia en la API destino o un outbox propio.
- **Cuándo NO usarlo:** si tu consumidor ya es idempotente, las transacciones de Kafka añaden latencia y complejidad sin
  beneficio; tampoco tienen sentido cuando la salida no es Kafka (no cubren tu base de datos).

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Offsets en la base de datos: el proceso muere en el offset 2 y vuelve.

```bash
docker compose up -d --wait postgres
node f155-exactly-once/demo.js
```

**Output esperado** (real):

```text
1.ª ejecución: proceso muerto en el offset 2
tras la caída: saldo = 200
2.ª ejecución: retoma desde el offset 2
saldo final = 500 (5 × 100, ni uno más ni uno menos)
```

2. Transacciones de Kafka (leer → transformar → escribir, con un aborto simulado en PAGO-2):

```bash
docker compose up -d --wait kafka
node f155-exactly-once/eos-kafka.js
```

**Output esperado** (no ejecutado aquí; pendiente en `verificacion/microservicios/pendiente.md`; KafkaJS además imprime
el log del reintento de `PAGO-2`):

```text
commit  PAGO-1 offset 0
abort   PAGO-2: fallo simulado
commit  PAGO-2 offset 1
commit  PAGO-3 offset 2
read_committed   → PAGO-1, PAGO-2, PAGO-3
read_uncommitted → PAGO-1, PAGO-2, PAGO-2, PAGO-3
```

#### 11. VERIFICACIÓN

Test contra PostgreSQL real (`f155-exactly-once/exactly-once.test.js`):

```javascript
// Módulo 25 · F155 · Tests contra PostgreSQL real. Ejecuta: node --test f155-exactly-once/exactly-once.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { consumir, depositar, leerOffset, prepararEsquema } from './offsets-en-bd.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const pos = { consumidor: 'saldos', topic: 't', particion: 0 };
const particion = [0, 1, 2, 3, 4].map((offset) => ({ offset, valor: { cuenta: 'A', monto: 100 } }));
const saldo = async () => Number((await pool.query("SELECT saldo FROM f155_saldos WHERE cuenta = 'A'")).rows[0]?.saldo ?? 0);

test('sin fallos: 5 depósitos y el offset queda en 5', async () => {
  await consumir(pool, pos, particion, depositar);
  assert.equal(await saldo(), 500);
  assert.equal(await leerOffset(pool, pos), 5);
});

test('muere en el offset 2 antes del commit: al reiniciar retoma en 2 y el saldo es exacto', async () => {
  await assert.rejects(consumir(pool, pos, particion, depositar, { morirEn: 2 }), /offset 2/);
  assert.equal(await saldo(), 200);
  assert.equal(await consumir(pool, pos, particion, depositar), 2);
  assert.equal(await saldo(), 500);
});

test('volver a entregar la partición entera no cambia nada (todo está por debajo del offset)', async () => {
  await consumir(pool, pos, particion, depositar);
  await consumir(pool, pos, particion, depositar);
  assert.equal(await saldo(), 500);
});
```

```bash
node --test --test-reporter=spec f155-exactly-once/exactly-once.test.js
```

**Output esperado** (real): `ℹ tests 3` y `ℹ pass 3`.

**Pregunta de comprobación:** en `eos-kafka.js`, ¿por qué `sendOffsets` usa `offset + 1`? (Porque el offset confirmado
de un grupo es el **siguiente** mensaje a leer; con `offset` a secas, al reiniciar se reprocesaría el último.)

#### 12. ERROR COMÚN

**Síntoma:** el saldo está bien, pero los clientes reciben **dos correos** «Recibiste 100» después de un reinicio.
**Causa:** el efecto externo (correo) se ejecuta dentro del procesamiento «exactly-once», pero no forma parte de la
transacción.

```javascript
// Módulo 25 · F155 · Error común: creer que «exactly-once» cubre efectos externos (correo, HTTP, otra BD).
// El correo sale ANTES del commit; si el proceso muere antes de confirmar, el reintento lo envía otra vez.
// Ejecuta: node f155-exactly-once/error-comun.js
import { crearPool } from '../comun/pg.js';
import { consumir, depositar, prepararEsquema } from './offsets-en-bd.js';

const pool = crearPool();
await prepararEsquema(pool);
const correos = [];
const particion = [{ offset: 0, valor: { cuenta: 'A', monto: 100 } }];
const pos = { consumidor: 'saldos', topic: 'f155.depositos', particion: 0 };
const depositarYAvisar = async (tx, valor) => {
  await depositar(tx, valor);
  correos.push(`Recibiste ${valor.monto} en ${valor.cuenta}`); // efecto externo: no se puede deshacer con ROLLBACK
};
await consumir(pool, pos, particion, depositarYAvisar, { morirEn: 0 }).catch(() => {});
await consumir(pool, pos, particion, depositarYAvisar);
const { rows: [a] } = await pool.query("SELECT saldo FROM f155_saldos WHERE cuenta = 'A'");
console.log(`saldo = ${a.saldo} (exacto) · correos enviados = ${correos.length} (duplicado)`);
await pool.end();
```

Salida real de `node f155-exactly-once/error-comun.js`:

```text
saldo = 100 (exacto) · correos enviados = 2 (duplicado)
```

**Diagnóstico visual:** en el proveedor de correo, dos envíos idénticos con segundos de diferencia que coinciden con un
reinicio o un rebalanceo del consumidor. **Arreglo:** saca el correo de la transacción: escribe la intención
(«avisar a A del depósito del offset 0») en una outbox de la misma transacción y que otro proceso la envíe con el id
como clave de idempotencia del proveedor.

#### 13. PREGUNTA DE ENTREVISTA

**«Usamos Kafka con exactly-once, así que no hay duplicados». ¿Qué le respondes a tu equipo?**

**Respuesta modelo:** que exactly-once en Kafka cubre un caso concreto: leer de Kafka, transformar y escribir en Kafka,
con el offset del consumidor dentro de la misma transacción y lectores en `read_committed`. Ahí el resultado cuenta una
vez aunque haya reintentos, y el `transactionalId` estable aparta a las instancias zombi. Pero no cubre nada fuera de
Kafka: si el consumidor escribe en PostgreSQL, llama a una API o manda un correo, eso puede repetirse. Para una base de
datos guardo el offset junto al resultado en la misma transacción y arranco desde ahí; para APIs externas uso claves
de idempotencia; y en general diseño consumidores idempotentes, que es más barato que las transacciones. También aviso
del coste: una transacción larga frena a los lectores por el last stable offset.

#### 14. ANTI-PATRÓN RELACIONADO

**`transactionalId` aleatorio por arranque** (`transactionalId: \`conversor-${randomUUID()}\``). Cada reinicio parece
un productor nuevo: el coordinador no puede cercar a la instancia anterior si sigue viva, y las transacciones que dejó
abiertas solo se cierran cuando vence su `transactionTimeout`, frenando mientras tanto a los lectores
`read_committed`.

```javascript
// MAL: id nuevo en cada arranque; no hay fencing entre la instancia vieja y la nueva.
const productor = kafka.producer({ transactionalId: `conversor-${randomUUID()}`, idempotent: true });

// BIEN: id estable por instancia o por partición asignada (eos-kafka.js usa f155-conversor-0).
const productor = kafka.producer({ transactionalId: `conversor-${process.env.HOSTNAME}`, idempotent: true, maxInFlightRequests: 1 });
```

---

### Two-Phase Commit: por qué no usar

#### 1. UBICACIÓN

Módulo 25, Lección 5 de 5 · Fase 3.

#### 2. PRERREQUISITOS

- Transacciones, bloqueos y `lock_timeout` en PostgreSQL (Módulo 15).
- Sagas (ficha 2) y outbox (ficha 1): la alternativa.
- Teorema CAP y disponibilidad (Módulo 5).

#### 3. OBJETIVO DE APRENDIZAJE

**Ejecutar** un Two-Phase Commit real con `PREPARE TRANSACTION` / `COMMIT PREPARED` de PostgreSQL, **provocar** el
caso que lo hace inviable entre microservicios (el coordinador cae entre las dos fases y los participantes quedan
bloqueados) y **argumentar** cuándo usar sagas en su lugar. Lo compruebas cuando `dospc.test.js` pasa 3 de 3 y ves otro
cobro fallar por `lock timeout` mientras la transacción está en duda.

#### 4. ANALOGÍA VISUAL

Dibuja una **boda** con un **juez** y dos novios. Fase 1: el juez pregunta a cada uno «¿aceptas?»; cada uno dice «sí»
y desde ese momento **no puede irse** ni casarse con otra persona: está comprometido a esperar la decisión. Fase 2: el
juez declara «los declaro casados». Ahora imagina que el juez **se desmaya** justo entre las dos fases. Los novios
siguen de pie en el altar, sin poder irse ni casarse con nadie más, hasta que el juez despierte. Nadie más en la sala
puede decidir por él. Eso es una transacción **en duda**.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de secuencia. El coordinador abre una transacción en el banco A, resta 200 a ana y la
prepara con el id f156-t3-a; el banco A vota sí y deja bloqueada la fila de ana. Lo mismo en el banco B con luis. El
coordinador cae en ese momento. Otro cobro intenta restar 10 a ana en el banco A y espera hasta agotar el lock
timeout. Una nota indica que las dos transacciones quedan en duda hasta que alguien ejecute COMMIT PREPARED o ROLLBACK
PREPARED.

#### 6. EXPLICACIÓN NIVEL 0

- A veces quieres que dos bases de datos cambien **juntas**: restar dinero en una y sumarlo en otra.
- El **Two-Phase Commit** (2PC) lo intenta en dos pasos: primero pregunta a todas «¿puedes?» y cada una se prepara;
  si todas dicen sí, les ordena «hazlo».
- El problema: entre «me preparo» y «hazlo», cada base de datos se queda **bloqueada** esperando. Si quien da las
  órdenes se cae, se quedan bloqueadas y **nadie más puede tocar esos datos**.
- En microservicios, cada servicio tiene su base de datos y debe seguir funcionando aunque otro falle. 2PC hace lo
  contrario: ata a todos al más lento y al que se cae.

#### 7. EXPLICACIÓN INTERMEDIA

- **Fase 1 (votación):** el coordinador hace el trabajo en cada participante y ejecuta `PREPARE TRANSACTION 'gid'`.
  PostgreSQL escribe la transacción a disco con sus bloqueos y **la separa de la conexión**: ya no es de esa sesión
  (un `ROLLBACK` en la conexión no hace nada) y sobrevive a desconexiones y reinicios. Si un participante falla (el
  `CHECK` de saldo en T2), el coordinador hace `ROLLBACK PREPARED` de los que ya votaron.
- **Fase 2 (decisión):** `COMMIT PREPARED 'gid'` en todos. Lo puede ejecutar **cualquier** conexión.
- **En duda:** `pg_prepared_xacts` lista las transacciones preparadas (`gid`, `owner`, `database`, `prepared`). Mientras
  estén ahí, sus filas siguen bloqueadas para escritura; las lecturas ven el valor anterior (MVCC).
- **Configuración:** `max_prepared_transactions` es **0 por defecto**; con 0, `PREPARE TRANSACTION` falla con
  `ERROR: prepared transactions are disabled` (`HINT: Set max_prepared_transactions to a nonzero value.`). El Compose
  del laboratorio lo pone en 10.
- Fuente: https://www.postgresql.org/docs/current/sql-prepare-transaction.html.

#### 8. EXPLICACIÓN MAESTRA

- **Por qué no entre microservicios.** (1) **Bloqueo:** 2PC es un protocolo *bloqueante*; si el coordinador cae tras
  la fase 1, los participantes no pueden decidir solos (no saben si otro votó no). (2) **Disponibilidad:** la
  transacción solo avanza si **todos** están arriba: la disponibilidad del conjunto es el producto de las de cada uno.
  (3) **Acoplamiento:** todos los servicios deben hablar el mismo protocolo (XA) y exponer su base de datos al
  coordinador, rompiendo el «base de datos por servicio». (4) **Latencia:** dos idas y vueltas con bloqueos tomados.
  (5) **Soporte:** Kafka, RabbitMQ, Redis, MongoDB y la mayoría de APIs HTTP no participan en XA.
- **Qué usar en su lugar.** Transacciones **locales** + **outbox** para publicar (ficha 1) + **sagas** con
  compensaciones para el proceso de negocio (ficha 2) + **idempotencia** para los duplicados (ficha 3). Cambias
  atomicidad global por consistencia eventual con estados intermedios visibles (`PENDIENTE`, `COMPENSADO`), y los
  diseñas en el dominio.
- **Variantes:** *3PC* añade una fase para no bloquear, pero asume red sin particiones; los protocolos de consenso
  (Paxos, Raft) resuelven el acuerdo dentro de **una** base de datos distribuida (CockroachDB, Spanner, YugabyteDB, que
  usan 2PC por dentro sobre grupos replicados con consenso). Si de verdad necesitas atomicidad entre dos tablas, quizás
  deberían estar en el **mismo servicio**.
- **Cuándo SÍ es razonable:** dentro de un mismo sistema gestionado por un equipo (dos bases de datos del mismo
  servicio con un gestor de transacciones maduro como Narayana o Atomikos), o en un monolito con XA entre la base de
  datos y un broker JMS que lo soporte. Nunca como mecanismo de integración entre servicios de equipos distintos.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **pg 8.23.1** y **PostgreSQL 18.7** con `max_prepared_transactions=10`.

`f156-2pc/coordinador.js`:

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

`f156-2pc/demo.js`:

`comun/pg.js`: conexión PostgreSQL compartida.

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

#### 10. MINI-LABORATORIO

1. Ejecuta las tres transferencias (bien, voto no y coordinador caído):

```bash
docker compose up -d --wait postgres
node f156-2pc/demo.js
```

**Output esperado** (real):

```text
T1 (300):  confirmada → {"ana":700,"luis":300}
T2 (5000): abortada: new row for relation "f156_banco_a" violates check constraint "f156_banco_a_saldo_check" → {"ana":700,"luis":300}
T3 (200):  coordinador caído entre la fase 1 y la fase 2
en duda (pg_prepared_xacts): f156-t3-a, f156-t3-b
leer sí se puede (valor anterior): {"ana":700,"luis":300}
otro cobro a ana: canceling statement due to lock timeout
tras COMMIT PREPARED: {"ana":500,"luis":500}
```

2. Deja una transacción en duda y mírala desde `psql` (antes de que la demo la confirme, o con el error común del
   paso 12 a medias):

```bash
docker compose exec postgres psql -U academia -c "SELECT gid, prepared, owner FROM pg_prepared_xacts"
docker compose exec postgres psql -U academia -c "SELECT locktype, relation::regclass, mode FROM pg_locks WHERE pid IS NULL"
```

**Output esperado:** en la primera consulta, una fila por cada `gid` en duda; en la segunda, los bloqueos de las
transacciones preparadas, con `pid` vacío porque ya no pertenecen a ninguna sesión. En el entorno de redacción
(PostgreSQL 16.15, una transacción preparada sobre `f156_banco_a`) fueron `RowExclusiveLock` sobre `f156_banco_a` y su
índice `f156_banco_a_pkey`, y un `ExclusiveLock` de tipo `transactionid`.

#### 11. VERIFICACIÓN

Test contra PostgreSQL real (`f156-2pc/dospc.test.js`):

```javascript
// Módulo 25 · F156 · Tests contra PostgreSQL real (max_prepared_transactions > 0). Ejecuta: node --test f156-2pc/dospc.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, saldos, transferir } from './coordinador.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => prepararEsquema(pool));
const enDuda = async () => (await pool.query("SELECT gid FROM pg_prepared_xacts WHERE gid LIKE 'f156-%' ORDER BY gid")).rows.map((r) => r.gid);

test('los dos votan sí: se confirma en los dos', async () => {
  assert.equal(await transferir(pool, { gid: 'f156-a', monto: 300 }), 'confirmada');
  assert.deepEqual(await saldos(pool), { ana: 700, luis: 300 });
});

test('uno vota no: no cambia nada en ninguno', async () => {
  assert.match(await transferir(pool, { gid: 'f156-b', monto: 5000 }), /^abortada/);
  assert.deepEqual(await saldos(pool), { ana: 1000, luis: 0 });
  assert.deepEqual(await enDuda(), []);
});

test('coordinador caído tras preparar: quedan en duda y bloquean la fila', async () => {
  await transferir(pool, { gid: 'f156-c', monto: 200 }, { caerTrasPreparar: true });
  assert.deepEqual(await enDuda(), ['f156-c-a', 'f156-c-b']);
  const c = await pool.connect();
  await c.query("SET lock_timeout = '300ms'");
  await assert.rejects(c.query("UPDATE f156_banco_a SET saldo = 0 WHERE cuenta = 'ana'"), /lock timeout/);
  c.release();
  for (const gid of await enDuda()) await pool.query(`COMMIT PREPARED '${gid}'`);
  assert.deepEqual(await saldos(pool), { ana: 800, luis: 200 });
});
```

```bash
node --test --test-reporter=spec f156-2pc/dospc.test.js
```

**Output esperado** (real): `ℹ tests 3` y `ℹ pass 3`.

**Pregunta de comprobación:** con el coordinador caído, ¿puede el banco A decidir por su cuenta hacer `ROLLBACK` para
liberar a ana? (No con seguridad: no sabe si el banco B ya recibió `COMMIT PREPARED`. Por eso 2PC es bloqueante.)

#### 12. ERROR COMÚN

**Síntoma:** después de un error, el coordinador hace `ROLLBACK` «por si acaso», cierra la conexión, y horas más tarde
las filas de esa cuenta siguen bloqueadas y el disco crece. **Causa:** una transacción **preparada** no pertenece a la
conexión: ni el `ROLLBACK` normal ni cerrar la conexión ni reiniciar el proceso la deshacen.

```javascript
// Módulo 25 · F156 · Error común: tratar una transacción PREPARADA como una normal.
// Tras PREPARE TRANSACTION la conexión ya no tiene transacción: un ROLLBACK ahí no deshace nada,
// y cerrar la conexión (o reiniciar el proceso) tampoco. Ejecuta: node f156-2pc/error-comun.js
import { crearPool } from '../comun/pg.js';
import { prepararEsquema, saldos } from './coordinador.js';

let pool = crearPool();
await prepararEsquema(pool);
const c = await pool.connect();
c.on('notice', (n) => console.log(`aviso de PostgreSQL: ${n.severity}: ${n.message}`));
await c.query('BEGIN');
await c.query("UPDATE f156_banco_a SET saldo = saldo - 100 WHERE cuenta = 'ana'");
await c.query("PREPARE TRANSACTION 'f156-olvidada'");
await c.query('ROLLBACK'); // ✘ no hay transacción en curso en esta conexión
c.release();
await pool.end(); // ✘ «se cae el proceso»: la transacción preparada sigue viva en el servidor

pool = crearPool();
const { rows: [x] } = await pool.query("SELECT gid, owner, database FROM pg_prepared_xacts WHERE gid = 'f156-olvidada'");
console.log(`MAL  → sigue en pg_prepared_xacts tras cerrar el pool: ${JSON.stringify(x)}`);
await pool.query("ROLLBACK PREPARED 'f156-olvidada'"); // ✔ la única forma de deshacerla (o COMMIT PREPARED para confirmarla)
console.log(`BIEN → ROLLBACK PREPARED: ${JSON.stringify(await saldos(pool))}`);
await pool.end();
```

Salida real de `node f156-2pc/error-comun.js`:

```text
aviso de PostgreSQL: WARNING: there is no transaction in progress
MAL  → sigue en pg_prepared_xacts tras cerrar el pool: {"gid":"f156-olvidada","owner":"academia","database":"academia"}
BIEN → ROLLBACK PREPARED: {"ana":1000,"luis":0}
```

**Diagnóstico visual:** `SELECT gid, prepared FROM pg_prepared_xacts` con fechas antiguas; en `pg_locks`, bloqueos con
`pid` vacío; y VACUUM que no limpia filas muertas porque la transacción preparada retiene el
horizonte. **Arreglo:** decide con `COMMIT PREPARED` o `ROLLBACK PREPARED` según el registro del coordinador, y vigila
`pg_prepared_xacts` con una alerta. Mejor aún: no uses 2PC entre servicios.

#### 13. PREGUNTA DE ENTREVISTA

**¿Por qué no usar transacciones distribuidas (2PC/XA) entre microservicios? ¿Qué propones?**

**Respuesta modelo:** porque 2PC es bloqueante y acopla. En la fase de preparación cada participante deja sus filas
bloqueadas hasta que el coordinador decida; si el coordinador cae entre las fases, quedan en duda y ningún participante
puede decidir solo porque no sabe qué votaron los demás. La transacción solo avanza si todos están disponibles, así que
la disponibilidad del conjunto cae, la latencia sube con los bloqueos tomados, y obliga a que todos hablen XA y expongan
su base de datos al coordinador, lo que rompe la autonomía de cada servicio; además brokers como Kafka o APIs HTTP no
participan. Propongo transacciones locales con outbox para publicar eventos de forma fiable, sagas orquestadas o
coreografiadas con compensaciones para el proceso de negocio, y consumidores idempotentes. Acepto consistencia
eventual con estados intermedios explícitos en el dominio. Y si dos datos tienen que cambiar siempre de forma atómica,
reviso los límites: probablemente pertenecen al mismo servicio.

#### 14. ANTI-PATRÓN RELACIONADO

**La transacción distribuida «para no pensar en consistencia»:** un servicio que abre conexiones a las bases de datos
de otros servicios y las une con XA.

```mermaid
flowchart LR
    subgraph MAL["MAL: un coordinador XA ata tres bases ajenas"]
        P["pedidos"] -->|"XA prepare/commit"| DBI[("BD de inventario")]
        P -->|"XA prepare/commit"| DBP[("BD de pagos")]
        P --> DBO[("BD de pedidos")]
    end
    subgraph BIEN["BIEN: transacción local + outbox + saga"]
        P2["pedidos"] --> DBO2[("BD de pedidos + outbox")]
        DBO2 -->|"CDC"| K["Kafka"]
        K --> I2["inventario (su BD)"]
        K --> PG2["pagos (su BD)"]
    end
```

**Texto alternativo:** a la izquierda, el anti-patrón: el servicio de pedidos coordina con XA, mediante prepare y
commit, las bases de datos de inventario, pagos y pedidos. A la derecha, la alternativa: pedidos escribe solo en su
base de datos junto con la outbox; la captura de cambios lleva los eventos a Kafka, y de allí a inventario y pagos, cada
uno con su propia base de datos.
