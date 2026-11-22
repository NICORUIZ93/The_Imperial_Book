# Módulo 26 · Mensajería avanzada y event-driven

**Fase 3 · Nivel maestro: arquitectura avanzada** (semana 3 de 8). **Duración:** 10 h (4 temas de unos 110 min y
2 h 40 min de laboratorio integrador). **Dificultad:** 5 de 5. **Dependencias:** Módulo 11 (Kafka profundo, EOS,
Schema Registry, RabbitMQ y NATS en Java), Módulo 18 (KafkaJS, amqplib y NATS en Node), Módulo 22 (confirms, acks y
DLQ) y Módulo 25 (outbox, idempotencia y exactly-once). **Herramientas:**Node.js 26.13.1 LTS**, **kafkajs 2.2.4** con
**Apache Kafka 4.4.0**, **@kafkajs/confluent-schema-registry 4.1.0** y **avsc 5.7.9** con **Confluent Schema Registry
8.4.1**, **amqplib 2.4.0** con **RabbitMQ 4.4.1**, **@nats-io/transport-node, jetstream y kv 3.5.0** con **NATS Server
2.15.3**. 
infraestructura y lo de RabbitMQ y NATS si responden; los comandos de verificación indicados levanta los cuatro servicios y lo exige
todo).

En los Módulos 11 y 18 aprendiste a usar Kafka, RabbitMQ y NATS. Aquí decides **cómo se comportan cuando algo sale
mal y cómo evolucionan sin romper a nadie**: transacciones de Kafka que abarcan varios topics y apartan a productores
zombis, esquemas que cambian sin tumbar a los consumidores, colas de RabbitMQ que no se atascan con un mensaje
venenoso, JetStream que deduplica y reparte trabajo, y la decisión de diseño que más acopla (o desacopla) a tus
servicios: **qué lleva dentro un evento**.

```mermaid
flowchart LR
    T1["1 · Kafka profundo:<br/>transacciones, EOS,<br/>Schema Registry"] --> T4["4 · Event Notification vs<br/>Event-Carried State Transfer"]
    T2["2 · RabbitMQ<br/>avanzado"] --> T4
    T3["3 · NATS<br/>JetStream"] --> T4
```

**Texto alternativo:** mapa del módulo. Los temas 1 (Kafka profundo: transacciones, EOS y Schema Registry), 2
(RabbitMQ avanzado) y 3 (NATS con JetStream) son independientes entre sí y los tres llevan al tema 4 (Event
Notification frente a Event-Carried State Transfer), que es una decisión de diseño válida con cualquier broker.

**Cómo usar el laboratorio.** Con Node 26 y Docker:

```bash
npm ci
docker compose up -d --wait         # Kafka :9092 · Schema Registry :8081 · RabbitMQ :5672/15672 · NATS :4222/8222
  # tests + demos + errores comunes de las 4 fichas → «RESULTADO: OK»
docker compose down -v
```

infraestructura; la ficha 1 hace sin infraestructura todo lo de Avro y usa Kafka y Schema Registry solo para su tramo
final.

`package.json` del laboratorio (con `package-lock.json` que fija el árbol completo):

```json
{
  "name": "modulo-26-mensajeria-avanzada-event-driven",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 26 (Fase 3): Mensajería avanzada y event-driven (transacciones de Kafka y Schema Registry, RabbitMQ con colas quorum y reintentos escalonados, NATS JetStream, Event Notification vs Event-Carried State Transfer).",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "test": "node --test --test-concurrency=1 'f15*/*.test.js' 'f16*/*.test.js'"
  },
  "dependencies": {
    "@kafkajs/confluent-schema-registry": "4.1.0",
    "@nats-io/jetstream": "3.5.0",
    "@nats-io/kv": "3.5.0",
    "@nats-io/transport-node": "3.5.0",
    "amqplib": "2.4.0",
    "avsc": "5.7.9",
    "kafkajs": "2.2.4"
  }
}
```

`docker-compose.yml`:

```yaml
# Módulo 26 (modulo-30) · Mensajería avanzada: Kafka 4.4.0 + Schema Registry 8.4.1 + RabbitMQ 4.4.1 + NATS 2.15.3
# Arranca todo:  docker compose up -d --wait        (espera a que los 4 healthchecks estén "healthy")
#   Kafka :9092 y Schema Registry :8081 → F157 · RabbitMQ :5672/15672 → F158 · NATS :4222/8222 → F159
# F160 no necesita infraestructura.
# Detén:         docker compose down -v
# Si otro módulo ocupa esos puertos (p. ej. modulo-15), haz antes «docker compose down» allí.
name: modulo-30
services:
  kafka:
    image: apache/kafka:4.4.0
    hostname: kafka
    ports:
      - "9092:9092"
    environment:
      # Un solo nodo KRaft (broker + controlador) con DOS listeners:
      #  PLAINTEXT_HOST -> localhost:9092 para tus apps y tests en el host
      #  PLAINTEXT      -> kafka:19092 para otros contenedores (Schema Registry)
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: "broker,controller"
      KAFKA_LISTENERS: "CONTROLLER://:29093,PLAINTEXT_HOST://:9092,PLAINTEXT://:19092"
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT_HOST://localhost:9092,PLAINTEXT://kafka:19092"
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT"
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:29093"
      KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_INTER_BROKER_LISTENER_NAME: "PLAINTEXT"
      CLUSTER_ID: "4L6g3nShT-eMCtK--X86sw"
      # Con un solo broker, los topics internos (offsets de grupos y estado de transacciones) necesitan RF 1.
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_MIN_ISR: 1
      # Sin espera inicial de 3 s antes del primer rebalanceo de un grupo (solo laboratorio).
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_LOG_DIRS: "/tmp/kraft-combined-logs"
    healthcheck:
      test: ["CMD-SHELL", "/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list >/dev/null"]
      interval: 5s
      timeout: 15s
      retries: 30

  schema-registry:
    image: confluentinc/cp-schema-registry:8.4.1
    hostname: schema-registry
    depends_on:
      kafka:
        condition: service_healthy
    ports:
      - "8081:8081"
    environment:
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_LISTENERS: "http://0.0.0.0:8081"
      # Los esquemas se guardan en el topic interno _schemas de este Kafka
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: "PLAINTEXT://kafka:19092"
      # Un solo broker: el topic interno _schemas con 1 réplica (por defecto pide 3).
      SCHEMA_REGISTRY_KAFKASTORE_TOPIC_REPLICATION_FACTOR: 1
    healthcheck:
      # 127.0.0.1 (no «localhost», que puede resolver a ::1). Si la imagen no trae curl, prueba el puerto con bash.
      test: ["CMD-SHELL", "curl -fs http://127.0.0.1:8081/subjects >/dev/null 2>&1 || bash -c 'exec 3<>/dev/tcp/127.0.0.1/8081' 2>/dev/null"]
      interval: 5s
      timeout: 10s
      retries: 40
      start_period: 60s

  rabbitmq:
    image: rabbitmq:4.4.1-management
    environment:
      RABBITMQ_DEFAULT_USER: academia
      RABBITMQ_DEFAULT_PASS: academia
    ports:
      - "5672:5672"     # AMQP 0-9-1
      - "15672:15672"   # consola web: http://localhost:15672 (academia / academia)
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 5s
      timeout: 10s
      retries: 30

  nats:
    # La variante alpine trae shell y wget para el healthcheck (la imagen «scratch» no tiene ni shell).
    image: nats:2.15.3-alpine
    command: ["-js", "-m", "8222"]   # -js activa JetStream; -m expone el monitoreo HTTP
    ports:
      - "4222:4222"     # clientes
      - "8222:8222"     # monitoreo: http://localhost:8222/healthz, /jsz, /connz
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O- http://localhost:8222/healthz | grep -q ok"]
      interval: 3s
      timeout: 5s
      retries: 30
```

`comun/config.js`:

```javascript
// Módulo 26 · Direcciones de la infraestructura del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  KAFKA_BROKERS=... SCHEMA_REGISTRY_URL=... AMQP_URL=... NATS_URL=... node ...
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
export const SCHEMA_REGISTRY_URL = process.env.SCHEMA_REGISTRY_URL ?? 'http://localhost:8081';
export const AMQP_URL = process.env.AMQP_URL ?? 'amqp://academia:academia@localhost:5672';
export const NATS_URL = process.env.NATS_URL ?? 'nats://localhost:4222';
```

**Lo que se ejecutó al escribir este módulo** (Node 26.13.1, RabbitMQ 3.12.1 y NATS Server 2.10.7 locales): la
parte Avro de la ficha 1 y las fichas 2, 3 y 4 completas. **Lo que no se pudo ejecutar aquí** (sin Docker con registro
ni Kafka): Schema Registry, las transacciones de Kafka y el `--compose` con las imágenes fijadas. Sus salidas se
describen como **esperadas** y están anotadas, con el comando, en `verificacion/microservicios/pendiente.md`.

---

### Kafka profundo: transacciones, EOS, Schema Registry

#### 1. UBICACIÓN

Módulo 26, Lección 1 de 4 · Fase 3.

#### 2. PRERREQUISITOS

- Exactly-once en la práctica (Módulo 25, ficha 4): transacciones de Kafka leer → transformar → escribir.
- Schema Registry y Avro en Java (Módulo 11, ficha 3).
- Productores y consumidores de KafkaJS (Módulo 18).

#### 3. OBJETIVO DE APRENDIZAJE

**Usar** una transacción de Kafka para escribir en **dos topics** de forma atómica, **explicar** cómo el coordinador
aparta a un productor zombi (fencing) y **decidir** el modo de compatibilidad de Schema Registry y qué cambios de
esquema permite cada uno, comprobándolo con la resolución de esquemas de Avro y con el formato de cable de Confluent.
Lo compruebas cuando `schema.test.js` pasa 5 de 5 y, con Compose, `registry.infra.js` pasa 2 de 2.

#### 4. ANALOGÍA VISUAL

Dibuja una **imprenta de periódicos** con dos rotativas: la de la edición y la del **archivo**. El jefe de turno solo
da la orden «¡a la calle!» cuando las dos páginas del día están impresas; si una falla, las dos tiradas se marcan
«no distribuir» (la transacción). El jefe lleva una **credencial con número de turno**: si llega un jefe nuevo con un
número mayor, la credencial del anterior queda anulada y sus órdenes ya no valen, aunque vuelva de un largo almuerzo
(fencing). Y en la puerta hay un **libro de estilo** (Schema Registry): antes de imprimir con un formato nuevo de
página, el portero comprueba que los quioscos con las gafas viejas sigan pudiendo leerla (compatibilidad).

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant A as productor «a» (f157-pedidos, epoch 0)
    participant TC as coordinador de transacciones
    participant P as f157.pedidos
    participant AU as f157.auditoria
    participant B as productor «b» (f157-pedidos)
    A->>TC: tx1: send P-1 a pedidos y auditoría
    A->>TC: commit → marcadores COMMIT en las dos particiones
    A->>TC: tx2: send P-2 a pedidos y auditoría → abort
    A->>P: tx3: send P-3 (abierta)
    B->>TC: initProducerId(f157-pedidos) → epoch 1, aborta tx3
    A->>TC: commit tx3 → rechazado: «a» está cercada
    Note over P,AU: read_committed solo ve P-1 en los dos topics
```

**Texto alternativo:** diagrama de secuencia. El productor a, con transactionalId f157-pedidos y epoch 0, envía P-1 a
los topics de pedidos y de auditoría en una transacción y la confirma, lo que escribe marcadores de commit en las dos
particiones. Luego envía P-2 a los dos topics y aborta. Después abre una tercera transacción con P-3. Un productor b
con el mismo transactionalId se registra, recibe la epoch 1 y el coordinador aborta la transacción abierta de a; cuando
a intenta confirmarla, es rechazado porque está cercado. Una nota indica que un lector read_committed solo ve P-1 en los
dos topics.

#### 6. EXPLICACIÓN NIVEL 0

- Una **transacción** en Kafka junta varios mensajes, incluso para topics distintos, en un paquete de «todos o
  ninguno». Los lectores normales no ven el paquete hasta que se confirma.
- Si dos copias del mismo programa escriben a la vez por error, Kafka **deja fuera a la vieja** y solo acepta a la
  nueva.
- Un **esquema** es el «molde» de un mensaje: qué campos tiene y de qué tipo. **Schema Registry** guarda los moldes y
  cada mensaje lleva solo un número que dice cuál usó.
- Cuando cambias un molde, el registro comprueba que los programas que leen con el molde viejo, o con el nuevo, sigan
  entendiendo los mensajes. Si no, rechaza el cambio antes de que rompa algo.

#### 7. EXPLICACIÓN INTERMEDIA

- **Transacción en varios topics** (`transacciones.js`): `producer({ transactionalId, idempotent: true,
  maxInFlightRequests: 1 })`, `producer.transaction()`, varios `tx.send()` a topics distintos y `tx.commit()` o
  `tx.abort()`. Kafka escribe un **marcador** de commit o aborto en cada partición tocada.
- **Fencing:** al conectar, el productor pide al coordinador un *producer id* y una **epoch** para su
  `transactionalId`. Otro productor con la misma id sube la epoch y el coordinador **aborta** la transacción que quedara
  abierta; las peticiones con la epoch vieja se rechazan.
- **EOS de punta a punta:** transacciones + `sendOffsets` (Módulo 25, ficha 4) + lectores `read_committed` (el valor
  por defecto en KafkaJS: `readUncommitted: false`).
- **Formato de cable de Confluent** (`formato.js`): byte 0 = `0` (versión del formato), bytes 1–4 = id del esquema en
  **big-endian**, y después el dato en Avro binario. El consumidor lee el id, pide el esquema del escritor al registry
  (con caché) y decodifica.
- **Subject:** por defecto `TopicNameStrategy`, así que el esquema del valor de `f157.pedidos` vive en el subject
  `f157.pedidos-value`.
- **Modos de compatibilidad** (el modo por defecto es **BACKWARD**):
  - **BACKWARD:** un consumidor con el esquema nuevo lee datos del anterior → puedes **añadir campos con default** y
    **quitar campos**. Actualiza primero los consumidores.
  - **FORWARD:** datos del esquema nuevo los lee un consumidor con el anterior → puedes **añadir campos** y **quitar
    campos con default**. Actualiza primero los productores.
  - **FULL:** las dos cosas → solo añadir o quitar campos **con default**; productores y consumidores en cualquier
    orden.
  - Las variantes `_TRANSITIVE` comparan con **todas** las versiones anteriores, no solo la última; `NONE` desactiva la
    comprobación.
- `esquemas.js` reproduce esas reglas con la resolución de esquemas de Avro: `lector.createResolver(escritor)` falla si
  el lector no puede leer lo escrito.
- Fuentes: https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html (modos y
  orden de actualización) y https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/index.html
  (formato de cable y `TopicNameStrategy`).

#### 8. EXPLICACIÓN MAESTRA

- **Qué modo elegir.** BACKWARD encaja con topics que se **releen desde el principio** (event sourcing, reprocesos):
  el consumidor nuevo tiene que entender todo lo viejo. FORWARD encaja cuando hay muchos consumidores lentos de
  actualizar y un productor que evoluciona rápido. FULL_TRANSITIVE es lo más seguro para eventos públicos entre
  equipos: obliga a que todo campo tenga default, a cambio de esquemas más «blandos».
- **Cambios que ningún modo salva:** renombrar un campo (Avro lo ve como quitar uno y añadir otro; usa `aliases`),
  cambiar su tipo de forma incompatible, o cambiar el significado sin cambiar el tipo (precio en pesos → en
  centavos). Para eso: **topic nuevo** (`pedidos.v2`), doble publicación durante la migración y retirada del viejo.
- **Avro, Protobuf o JSON Schema.** Avro: compacto y con resolución de esquemas, ideal en Kafka. Protobuf: mejor si ya
  usas gRPC (Módulo 18) y quieres el mismo contrato. JSON Schema: legible, más pesado y con reglas de compatibilidad más
  delicadas. Las tres funcionan con Schema Registry.
- **Coste de las transacciones.** Latencia extra por los marcadores y el coordinador; los lectores `read_committed` se
  paran en el *last stable offset* mientras haya una transacción abierta; y el `transactionalId` tiene que ser estable
  por instancia para que el fencing sirva. Además, `kafkajs` 2.2.4 no recibe versiones desde 2023 y Kafka 4.0 retiró
  versiones antiguas del protocolo (KIP-896); comprueba tu cliente (alternativa mantenida:
  `@confluentinc/kafka-javascript`, ver `docs/microservicios/08-herramientas-y-versiones.md`).
- **Alternativas:** *outbox + idempotencia* (Módulo 25) cuando la fuente de verdad es tu base de datos; *contratos con
  Pact* (Módulo 16) para validar productores y consumidores en CI; *JSON sin registry* con versionado en el nombre del
  evento, para sistemas pequeños.
- **Cuándo NO usarlo:** un solo productor y un solo consumidor del mismo equipo, desplegados juntos, no necesitan
  Schema Registry; y si tu consumidor ya es idempotente, las transacciones de Kafka añaden coste sin beneficio.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **avsc 5.7.9**, **@kafkajs/confluent-schema-registry 4.1.0**, **kafkajs 2.2.4**,
**Kafka 4.4.0** y **Confluent Schema Registry 8.4.1**.

`f157-kafka-schema/esquemas.js`:

```javascript
// Módulo 26 · F157 · Versiones del esquema Avro del evento PedidoCreado (avsc 5.7.9).
import avro from 'avsc';

const base = { type: 'record', name: 'PedidoCreado', namespace: 'academia.pedidos' };
export const crudos = {
  v1: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'total', type: 'long' }] },
  // v2 bien: campo nuevo CON valor por defecto.
  v2: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'total', type: 'long' }, { name: 'moneda', type: 'string', default: 'COP' }] },
  // v2 mal: campo nuevo SIN valor por defecto.
  v2SinDefault: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'total', type: 'long' }, { name: 'moneda', type: 'string' }] },
  // v3: quita «total» (campo sin valor por defecto en v1).
  v3SinTotal: { ...base, fields: [{ name: 'id', type: 'string' }, { name: 'moneda', type: 'string', default: 'COP' }] },
};
export const tipos = Object.fromEntries(Object.entries(crudos).map(([k, v]) => [k, avro.Type.forSchema(v)]));

// ¿Puede un consumidor con el esquema `lector` leer datos escritos con `escritor`? (resolución de esquemas de Avro)
export function puedeLeer(lector, escritor) {
  try {
    lector.createResolver(escritor);
    return true;
  } catch {
    return false;
  }
}

// Reglas de Schema Registry entre la versión nueva y la anterior (modos no transitivos).
export function compatible(modo, nuevo, anterior) {
  const backward = puedeLeer(nuevo, anterior); // consumidores nuevos leen datos viejos
  const forward = puedeLeer(anterior, nuevo); // consumidores viejos leen datos nuevos
  return { BACKWARD: backward, FORWARD: forward, FULL: backward && forward, NONE: true }[modo];
}
```

`f157-kafka-schema/formato.js`:

```javascript
// Módulo 26 · F157 · Formato de cable de Confluent: byte 0 = 0 (magic byte), bytes 1-4 = id del esquema (big-endian),
// después el dato en Avro binario. Así viaja cada mensaje cuando usas Schema Registry.
export function codificar(idEsquema, tipo, valor) {
  const cabecera = Buffer.alloc(5);
  cabecera.writeUInt8(0, 0);
  cabecera.writeUInt32BE(idEsquema, 1);
  return Buffer.concat([cabecera, tipo.toBuffer(valor)]);
}

// buscarTipo(id) → tipo Avro del ESCRITOR (en la vida real, GET /schemas/ids/{id} con caché).
// Si el consumidor tiene su propio esquema (lector), se resuelve escritor → lector.
export function decodificar(buffer, buscarTipo, lector) {
  if (buffer.readUInt8(0) !== 0) throw new Error(`magic byte desconocido: ${buffer.readUInt8(0)}`);
  const escritor = buscarTipo(buffer.readUInt32BE(1));
  const datos = buffer.subarray(5);
  return lector ? lector.fromBuffer(datos, lector.createResolver(escritor)) : escritor.fromBuffer(datos);
}
```

`f157-kafka-schema/transacciones.js`:

```javascript
// Módulo 26 · F157 · Transacciones de Kafka: escribir en DOS topics de forma atómica y cercar a un productor zombi.
// Requisitos: Node.js 26.13.1 LTS, kafkajs 2.2.4, Kafka 4.4.0 (docker-compose.yml). Ejecuta: node f157-kafka-schema/transacciones.js
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_BROKERS } from '../comun/config.js';

const kafka = new Kafka({ clientId: 'f157', brokers: KAFKA_BROKERS, logLevel: logLevel.NOTHING });
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [{ topic: 'f157.pedidos' }, { topic: 'f157.auditoria' }] });
await admin.disconnect();

const nuevoProductor = async () => {
  const p = kafka.producer({ transactionalId: 'f157-pedidos', idempotent: true, maxInFlightRequests: 1 });
  await p.connect(); // initProducerId: el coordinador sube la epoch de este transactionalId
  return p;
};

// 1) Atomicidad entre topics: el pedido y su registro de auditoría se ven juntos o no se ven.
const a = await nuevoProductor();
const tx1 = await a.transaction();
await tx1.send({ topic: 'f157.pedidos', messages: [{ key: 'P-1', value: 'creado' }] });
await tx1.send({ topic: 'f157.auditoria', messages: [{ key: 'P-1', value: 'ana creó P-1' }] });
await tx1.commit();
console.log('tx1: P-1 en f157.pedidos y f157.auditoria (commit)');

const tx2 = await a.transaction();
await tx2.send({ topic: 'f157.pedidos', messages: [{ key: 'P-2', value: 'creado' }] });
await tx2.send({ topic: 'f157.auditoria', messages: [{ key: 'P-2', value: 'luis creó P-2' }] });
await tx2.abort();
console.log('tx2: P-2 abortada en los dos topics');

// 2) Fencing: arranca otra instancia con el MISMO transactionalId (p. ej. el reemplazo tras una pausa larga de «a»).
const tx3 = await a.transaction();
await tx3.send({ topic: 'f157.pedidos', messages: [{ key: 'P-3', value: 'creado por a' }] });
const b = await nuevoProductor(); // sube la epoch: «a» queda cercada y su transacción abierta se aborta
try {
  await tx3.commit();
  console.log('tx3: commit de «a» aceptado (no debía pasar)');
} catch (error) {
  console.log(`tx3: «a» cercada → ${error.name}`);
}
await a.disconnect().catch(() => {});

// 3) Lo que ve un lector read_committed (por defecto en KafkaJS).
const lector = kafka.consumer({ groupId: `f157-lector-${Date.now()}` });
await lector.connect();
await lector.subscribe({ topics: ['f157.pedidos', 'f157.auditoria'], fromBeginning: true });
const vistos = [];
await new Promise((fin) => {
  lector.run({ eachMessage: async ({ topic, message }) => { vistos.push(`${topic}:${message.key}`); } });
  setTimeout(fin, 5000);
});
await lector.disconnect();
await b.disconnect();
console.log(`read_committed → ${vistos.sort().join(', ')}`);
```

`f157-kafka-schema/demo.js`:

```javascript
// Módulo 26 · F157 · Ejecuta (sin infraestructura): node f157-kafka-schema/demo.js
import { codificar, decodificar } from './formato.js';
import { compatible, tipos } from './esquemas.js';

for (const [nombre, nuevo] of [['v2', tipos.v2], ['v2SinDefault', tipos.v2SinDefault], ['v3SinTotal', tipos.v3SinTotal]]) {
  const fila = ['BACKWARD', 'FORWARD', 'FULL'].map((m) => `${m}=${compatible(m, nuevo, tipos.v1) ? 'sí' : 'no'}`).join(' ');
  console.log(`v1 → ${nombre.padEnd(12)} ${fila}`);
}

// Un productor viejo escribe con v1 (id 1); un consumidor nuevo lee con v2 y recibe el valor por defecto.
const mensaje = codificar(1, tipos.v1, { id: 'P-1', total: 120000 });
console.log(`bytes: ${mensaje.subarray(0, 5).toString('hex')} | ${mensaje.subarray(5).toString('hex')} (${mensaje.length} en total)`);
const registro = new Map([[1, tipos.v1], [2, tipos.v2]]);
console.log('consumidor v2 lee un mensaje v1:', JSON.stringify(decodificar(mensaje, (id) => registro.get(id), tipos.v2)));
```

#### 10. MINI-LABORATORIO

1. Compatibilidad y formato de cable, sin infraestructura:

```bash
node f157-kafka-schema/demo.js
```

**Output esperado** (real):

```text
v1 → v2           BACKWARD=sí FORWARD=sí FULL=sí
v1 → v2SinDefault BACKWARD=no FORWARD=sí FULL=no
v1 → v3SinTotal   BACKWARD=sí FORWARD=no FULL=no
bytes: 0000000001 | 06502d3180d30e (12 en total)
consumidor v2 lee un mensaje v1: {"id":"P-1","total":120000,"moneda":"COP"}
```

Lee los bytes: `00` es el byte de formato, `00000001` el id 1 en big-endian, y `06502d31` la cadena `P-1` en Avro
(longitud 3 codificada en zigzag = `06`, más los bytes de `P-1`), seguida del `long` 120000 (`80d30e`).

2. Con Kafka y Schema Registry arriba:

```bash
docker compose up -d --wait kafka schema-registry
node --test --test-force-exit --test-reporter=spec f157-kafka-schema/registry.infra.js
node f157-kafka-schema/transacciones.js
curl -s http://localhost:8081/subjects
```

**Output esperado** (no ejecutado aquí; pendiente en `verificacion/microservicios/pendiente.md`): los tests con
`ℹ pass 2`; `transacciones.js` imprime `tx1: … (commit)`, `tx2: P-2 abortada en los dos topics`, una línea
`tx3: «a» cercada → <nombre del error de KafkaJS>` y por último
`read_committed → f157.auditoria:P-1, f157.pedidos:P-1`; `curl` lista los subjects `f157.pedidos-…-value` que crearon
los tests. **Captura comentada:** `curl -s http://localhost:8081/config` devuelve el modo de compatibilidad global, que por
defecto es BACKWARD.

#### 11. VERIFICACIÓN

Tests sin infraestructura (`f157-kafka-schema/schema.test.js`):

```javascript
// Módulo 26 · F157 · Tests sin infraestructura (avsc 5.7.9). Ejecuta: node --test f157-kafka-schema/schema.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { codificar, decodificar } from './formato.js';
import { compatible, tipos } from './esquemas.js';

test('campo nuevo con default: compatible en los dos sentidos (FULL)', () => {
  assert.equal(compatible('FULL', tipos.v2, tipos.v1), true);
});

test('campo nuevo sin default: rompe BACKWARD (consumidores nuevos no leen datos viejos)', () => {
  assert.equal(compatible('BACKWARD', tipos.v2SinDefault, tipos.v1), false);
  assert.equal(compatible('FORWARD', tipos.v2SinDefault, tipos.v1), true);
});

test('quitar un campo sin default: rompe FORWARD (consumidores viejos no leen datos nuevos)', () => {
  assert.equal(compatible('BACKWARD', tipos.v3SinTotal, tipos.v1), true);
  assert.equal(compatible('FORWARD', tipos.v3SinTotal, tipos.v1), false);
});

test('formato de cable: magic byte 0 y el id en big-endian', () => {
  const b = codificar(258, tipos.v1, { id: 'P-1', total: 1 });
  assert.deepEqual([...b.subarray(0, 5)], [0, 0, 0, 1, 2]);
});

test('ida y vuelta con resolución: escrito con v1, leído con v2', () => {
  const b = codificar(1, tipos.v1, { id: 'P-1', total: 5 });
  assert.deepEqual({ ...decodificar(b, () => tipos.v1, tipos.v2) }, { id: 'P-1', total: 5, moneda: 'COP' });
});
```

Y contra Schema Registry (`f157-kafka-schema/registry.infra.js`):

```javascript
// Módulo 26 · F157 · Tests contra Confluent Schema Registry 8.4.1 (solo con los comandos de verificación indicados).
// Ejecuta: node --test f157-kafka-schema/registry.infra.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import { SCHEMA_REGISTRY_URL } from '../comun/config.js';
import { codificar } from './formato.js';
import { crudos, tipos } from './esquemas.js';

const registry = new SchemaRegistry({ host: SCHEMA_REGISTRY_URL });
const subject = `f157.pedidos-${Date.now()}-value`; // TopicNameStrategy: <topic>-value
const json = { 'content-type': 'application/vnd.schemaregistry.v1+json' };
const registrar = (esquema) => registry.register({ type: SchemaType.AVRO, schema: JSON.stringify(esquema) }, { subject });

test('el formato de cable de la librería coincide con formato.js', async () => {
  const { id } = await registrar(crudos.v1);
  const valor = { id: 'P-1', total: 120000 };
  assert.deepEqual(await registry.encode(id, valor), codificar(id, tipos.v1, valor));
});

test('con BACKWARD, el registry acepta v2 (con default) y rechaza v2SinDefault', async () => {
  await fetch(`${SCHEMA_REGISTRY_URL}/config/${subject}`, { method: 'PUT', headers: json, body: JSON.stringify({ compatibility: 'BACKWARD' }) });
  const prueba = async (esquema) => (await (await fetch(`${SCHEMA_REGISTRY_URL}/compatibility/subjects/${subject}/versions/latest`, {
    method: 'POST', headers: json, body: JSON.stringify({ schema: JSON.stringify(esquema) }),
  })).json()).is_compatible;
  assert.equal(await prueba(crudos.v2SinDefault), false);
  assert.equal(await prueba(crudos.v2), true);
  await assert.rejects(registrar(crudos.v2SinDefault));
  await registrar(crudos.v2);
});
```

**Output esperado:** `schema.test.js` → `ℹ tests 5` y `ℹ pass 5` (real); `registry.infra.js` → `ℹ pass 2` (pendiente
en el Mac).

**Pregunta de comprobación:** con el subject en FORWARD, ¿puedes quitar el campo `total` de v1? (No: `total` no tiene
default, así que un consumidor con v1 no podría leer los mensajes nuevos.)

#### 12. ERROR COMÚN

**Síntoma:** despliegas consumidores con el esquema nuevo y fallan al leer los mensajes que ya estaban en el topic.
**Causa:** el campo nuevo no tiene valor por defecto (y el subject estaba en `NONE`, o el esquema se usó sin
registrarlo).

```javascript
// Módulo 26 · F157 · Error común: añadir un campo SIN valor por defecto. Los consumidores actualizados ya no pueden
// leer los mensajes viejos que siguen en el topic (o los que mandan productores sin actualizar).
// Ejecuta: node f157-kafka-schema/error-comun.js
import { codificar, decodificar } from './formato.js';
import { tipos } from './esquemas.js';

const registro = new Map([[1, tipos.v1], [3, tipos.v2SinDefault]]);
const viejo = codificar(1, tipos.v1, { id: 'P-1', total: 120000 }); // mensaje que ya estaba en el topic
try {
  decodificar(viejo, (id) => registro.get(id), tipos.v2SinDefault);
} catch (error) {
  console.log(`MAL  → consumidor con v2SinDefault: ${error.message.split('\n')[0]}`);
}
console.log(`BIEN → consumidor con v2 (default 'COP'): ${JSON.stringify(decodificar(viejo, (id) => registro.get(id), tipos.v2))}`);
```

Salida real de `node f157-kafka-schema/error-comun.js`:

```text
MAL  → consumidor con v2SinDefault: no matching field for default-less academia.pedidos.PedidoCreado.moneda
BIEN → consumidor con v2 (default 'COP'): {"id":"P-1","total":120000,"moneda":"COP"}
```

**Diagnóstico visual:** el lag del grupo crece solo en los consumidores desplegados, que reinician en bucle con el
mismo error de deserialización; `curl …/config/<subject>` muestra `NONE`. **Arreglo:** añade `default` al campo, deja
el subject en BACKWARD (o más estricto) y haz que CI compruebe el esquema con
`POST /compatibility/subjects/<subject>/versions/latest` antes de desplegar.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo evolucionas el esquema de un evento de Kafka que consumen cinco equipos sin romper a ninguno?**

**Respuesta modelo:** registro el esquema en Schema Registry y cada mensaje lleva solo el id del esquema, así el
consumidor siempre sabe con qué esquema se escribió y Avro resuelve las diferencias con el suyo. Para un evento
compartido elijo FULL_TRANSITIVE, o al menos BACKWARD si el topic se relee desde el principio: solo añado o quito
campos con default, y el registro rechaza cualquier cambio que no cumpla, porque también lo compruebo en CI. Con
BACKWARD actualizo primero los consumidores y con FORWARD primero los productores. Un cambio que no es compatible,
como renombrar o cambiar el significado de un campo, va a un topic nuevo con doble publicación durante la migración.
Si además el evento tiene que salir junto con otro, por ejemplo pedido y auditoría, lo escribo en una transacción con
un transactionalId estable por instancia, para que el coordinador aparte a una instancia zombi.

#### 14. ANTI-PATRÓN RELACIONADO

**Mensajes «autodescriptivos»: el esquema completo dentro de cada mensaje** (o JSON sin ningún contrato). Multiplica
el tamaño, no impide cambios incompatibles y deja a cada consumidor adivinar qué versión recibe.

```javascript
// MAL: cada mensaje arrastra su esquema y nadie valida la evolución.
producer.send({ topic, messages: [{ value: JSON.stringify({ schema: crudos.v2, data: pedido }) }] });

// BIEN: 5 bytes de cabecera con el id; el registry guarda el esquema y aplica la compatibilidad (formato.js).
producer.send({ topic, messages: [{ value: await registry.encode(idEsquema, pedido) }] });
```

---

### RabbitMQ avanzado

#### 1. UBICACIÓN

Módulo 26, Lección 2 de 4 · Fase 3.

#### 2. PRERREQUISITOS

- Publisher confirms, acks manuales y DLQ (Módulo 22, ficha 1).
- Exchanges, colas y bindings con amqplib (Módulo 18).
- Reintentos con backoff (Módulo 19).

#### 3. OBJETIVO DE APRENDIZAJE

**Diseñar** una topología de RabbitMQ que no se atasca ni pierde mensajes: **colas quorum** con límite de entregas,
**reintentos escalonados** con colas de espera (TTL + dead-letter de vuelta), **DLQ** para lo que no tiene arreglo y
**single active consumer** para procesar en orden con relevo automático. Lo compruebas cuando `rabbitmq.test.js` pasa 4
de 4 y ves en la DLQ los motivos `delivery_limit` y `rejected`.

#### 4. ANALOGÍA VISUAL

Dibuja una **oficina de reclamaciones**. Cada reclamación entra por la ventanilla principal. Si el empleado no puede
resolverla porque el sistema está caído, la deja en una **bandeja de «volver a intentar en 10 minutos»**, y luego en
una de «en 1 hora»: cuando pasa el tiempo, la bandeja la devuelve sola a la ventanilla. Si una reclamación hace que el
empleado se desmaye cada vez que la toca (mensaje venenoso), al tercer desmayo el supervisor la aparta a un
**archivador de casos especiales** con una nota de por qué llegó ahí (la DLQ con `x-death`). Y para los expedientes que
deben tramitarse en orden, solo **un empleado** atiende la ventanilla; los demás esperan sentados y el siguiente
ocupa su lugar en cuanto se va (single active consumer).

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    X["exchange f158.pedidos"] -->|"cobro"| Q["f158.cobros<br/>(quorum, x-delivery-limit 3)"]
    Q --> C["consumidor"]
    C -->|"error pasajero, intento 1"| E1["f158.espera.200ms<br/>(TTL 200 ms)"]
    C -->|"error pasajero, intento 2"| E2["f158.espera.600ms<br/>(TTL 600 ms)"]
    E1 -->|"expira → dead-letter"| X
    E2 -->|"expira → dead-letter"| X
    C -->|"sin reintentos o datos inválidos: reject"| D["exchange f158.dlx"]
    Q -->|"más de 3 entregas fallidas"| D
    D --> DLQ["f158.cobros.dlq (quorum)"]
```

**Texto alternativo:** diagrama de flujo. El exchange f158.pedidos enruta con la clave cobro a la cola quorum
f158.cobros, con límite de 3 entregas. El consumidor, ante un error pasajero, reenvía el mensaje a la cola de espera de
200 milisegundos en el primer intento o a la de 600 en el segundo; al vencer el TTL, esas colas devuelven el mensaje al
exchange principal por dead-letter. Si ya no quedan reintentos o los datos son inválidos, el consumidor lo rechaza y va
al exchange f158.dlx; también va allí si la cola registra más de 3 entregas fallidas. El exchange f158.dlx lo deja en
la cola quorum f158.cobros.dlq.

#### 6. EXPLICACIÓN NIVEL 0

- Un mensaje puede fallar por dos motivos: algo **pasajero** (un servicio caído un minuto) o algo **permanente**
  (los datos están mal).
- Lo pasajero merece **otro intento, pero no enseguida**: si reintentas al instante, vuelves a chocar contra el mismo
  servicio caído. Se espera un rato, y cada vez un poco más.
- Lo permanente se aparta a una **cola de mensajes muertos** para que una persona lo revise.
- Hay mensajes que tumban al programa cada vez que los toca. Las colas **quorum** cuentan cuántas veces se entregó un
  mensaje sin éxito y, pasado un límite, lo apartan solas.

#### 7. EXPLICACIÓN INTERMEDIA

- **Cola quorum:** `assertQueue(nombre, { durable: true, arguments: { 'x-queue-type': 'quorum' } })`. Replicada con
  Raft entre nodos; es la única opción de cola replicada desde que RabbitMQ 4.0 eliminó el *mirroring* de colas
  clásicas. El tipo no se puede cambiar con una política: se fija al declarar.
- **`x-delivery-limit`:** tras ese número de entregas fallidas, el mensaje se descarta o, si la cola tiene
  `x-dead-letter-exchange`, se manda allí con `reason: delivery_limit`. Desde RabbitMQ 4.0 el límite por defecto es
  **20**. Las reentregas llevan la cabecera `x-delivery-count`.
- **Qué cuenta como entrega fallida (RabbitMQ 4.3 o superior):** `basic.reject`, el cierre del canal o la caída del
  cliente con el mensaje sin ack. **No** cuenta un `basic.nack` con requeue (solo sube `x-acquired-count`). Por eso el
  test usa `reject(msg, true)` para simular el fallo. En 3.12.1, donde se ejecutó aquí, el `nack` con requeue sí
  subía `x-delivery-count` (comprobado).
- **Reintento escalonado** (`consumidor.js`): ante un error pasajero, el consumidor publica una copia en
  `f158.espera.<ms>` con la cabecera `x-reintento` y hace `ack` del original. Esa cola no tiene consumidores: tiene
  `x-message-ttl` y `x-dead-letter-exchange` apuntando al exchange principal, así que al vencer el TTL el mensaje
  «muere» y vuelve a `f158.cobros`. Se usa **una cola por retardo** porque el TTL solo expira en la cabeza de la cola.
- **DLQ con historia:** la cabecera `x-death` es una lista, de la muerte más reciente a la más antigua, con `reason`
  (`rejected`, `expired`, `delivery_limit`…), `queue` y `count`; `x-first-death-reason` guarda la primera.
- **Single active consumer:** `arguments: { 'x-single-active-consumer': true }`. Con varios consumidores, solo uno
  recibe; si se desconecta o cancela, el siguiente toma el relevo. Así mantienes el orden sin perder disponibilidad.
- Fuentes: https://www.rabbitmq.com/docs/quorum-queues (límite de entregas y qué lo incrementa) y
  https://www.rabbitmq.com/blog/2024/08/28/quorum-queues-in-4.0 (límite por defecto 20 y retirada del mirroring).

#### 8. EXPLICACIÓN MAESTRA

- **Reintento en el consumidor vs en el broker.** Las colas de espera viven en el broker: sobreviven a reinicios del
  consumidor y no ocupan su memoria, a cambio de más colas que declarar. Un `setTimeout` dentro del consumidor es más
  simple, pero retiene el mensaje sin ack (bloqueando prefetch) y lo pierde si el proceso muere… o lo reentrega al
  instante. Alternativas en el broker: el plugin *delayed message exchange* (un solo exchange con cabecera
  `x-delay`, pero es un plugin aparte) o el TTL por mensaje (con el problema de la cabeza de la cola).
- **Ack + publicar no es atómico.** Si el consumidor muere entre publicar la copia en la cola de espera y hacer `ack`
  del original, habrá dos copias. Usa un canal con confirms y consumidores idempotentes (Módulo 25, ficha 3).
- **Quorum vs clásicas vs streams.** Quorum: durabilidad y replicación, a cambio de más latencia y uso de disco. Clásicas: un nodo, rápidas, para datos que puedes perder. *Streams* (`x-queue-type: stream`): log
  inmutable que se relee, parecido a una partición de Kafka; para *fan-out* masivo y repetición.
- **Orden.** RabbitMQ conserva el orden de una cola con un consumidor; con varios consumidores o reintentos, no.
  Single active consumer da orden con relevo; para orden por clave con paralelismo, el plugin *consistent hash
  exchange* reparte por clave entre varias colas, cada una con su consumidor único.
- **Cuándo NO usarlo:** si necesitas releer historia o reprocesar desde el principio, Kafka o RabbitMQ Streams encajan
  mejor; si la carga es un simple *fire-and-forget* sin requisitos de durabilidad, una cola clásica sin DLQ basta.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **amqplib 2.4.0** y **RabbitMQ 4.4.1** (imagen `rabbitmq:4.4.1-management`;
ejecutado aquí con RabbitMQ 3.12.1).

`f158-rabbitmq/topologia.js`:

```javascript
// Módulo 26 · F158 · Topología avanzada: cola quorum con límite de entregas, reintentos escalonados con colas de
// espera (TTL + dead-letter de vuelta) y cola de mensajes muertos. Requisitos: amqplib 2.4.0, RabbitMQ 4.4.1.
export const EXCHANGE = 'f158.pedidos';
export const COLA = 'f158.cobros';
export const DLX = 'f158.dlx';
export const DLQ = 'f158.cobros.dlq';
export const ESPERAS = [200, 600]; // ms de espera del 1.er y 2.º reintento (en producción: 10 s, 1 min, 10 min…)
export const espera = (ms) => `f158.espera.${ms}ms`;
export const LIMITE_ENTREGAS = 3;

export async function declarar(canal) {
  await canal.assertExchange(EXCHANGE, 'direct', { durable: true });
  await canal.assertExchange(DLX, 'fanout', { durable: true });
  await canal.assertQueue(DLQ, { durable: true, arguments: { 'x-queue-type': 'quorum' } });
  await canal.bindQueue(DLQ, DLX, '');
  // Cola quorum (replicada con Raft). x-delivery-limit: tras ese número de entregas fallidas, a la DLX.
  await canal.assertQueue(COLA, {
    durable: true,
    arguments: { 'x-queue-type': 'quorum', 'x-delivery-limit': LIMITE_ENTREGAS, 'x-dead-letter-exchange': DLX },
  });
  await canal.bindQueue(COLA, EXCHANGE, 'cobro');
  // Colas de espera: nadie las consume. Al vencer el TTL, el mensaje «muere» y vuelve al exchange principal.
  for (const ms of ESPERAS) {
    await canal.assertQueue(espera(ms), {
      durable: true,
      arguments: { 'x-message-ttl': ms, 'x-dead-letter-exchange': EXCHANGE, 'x-dead-letter-routing-key': 'cobro' },
    });
  }
}

export async function borrar(canal) {
  for (const q of [COLA, DLQ, ...ESPERAS.map(espera)]) await canal.deleteQueue(q);
}
```

`f158-rabbitmq/consumidor.js`:

```javascript
// Módulo 26 · F158 · Consumidor con tres caminos de fallo:
//   error pasajero  → se reenvía a la cola de espera que toca (1.º 200 ms, 2.º 600 ms) y se hace ack del original
//   sin reintentos  → reject(requeue=false) → DLQ (x-death reason: rejected)
//   error de datos  → reject(requeue=false) → DLQ de inmediato
// Y si el proceso MUERE con el mensaje en la mano, la cola quorum cuenta la entrega y, tras x-delivery-limit, lo aparta.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1.
import { ESPERAS, espera } from './topologia.js';

export class ErrorDeDatos extends Error {}

// Cabeceras propias del mensaje, sin las que pone el broker al hacer dead-letter (x-death, x-first-death-*, x-last-death-*):
// la copia es un mensaje NUEVO y el historial de muertes lo vuelve a escribir RabbitMQ.
const propias = (h = {}) => Object.fromEntries(Object.entries(h).filter(([k]) => !/^x-(death|first-death|last-death)/.test(k)));

export async function consumir(canal, cola, procesar, { registro = () => {} } = {}) {
  await canal.prefetch(5);
  return canal.consume(cola, async (msg) => {
    if (msg === null) return; // el broker canceló el consumidor (p. ej. borraron la cola)
    const reintento = Number(msg.properties.headers?.['x-reintento'] ?? 0);
    try {
      await procesar(JSON.parse(msg.content), reintento);
      canal.ack(msg);
      registro(`ack     intento ${reintento + 1}`);
    } catch (error) {
      if (!(error instanceof ErrorDeDatos) && reintento < ESPERAS.length) {
        // Publica una copia en la cola de espera (por el exchange por defecto) y confirma el original.
        canal.sendToQueue(espera(ESPERAS[reintento]), msg.content, {
          persistent: true,
          messageId: msg.properties.messageId,
          headers: { ...propias(msg.properties.headers), 'x-reintento': reintento + 1 },
        });
        canal.ack(msg);
        registro(`espera  ${ESPERAS[reintento]} ms (${error.message})`);
      } else {
        canal.reject(msg, false); // → DLX → DLQ
        registro(`dlq     ${error.message}`);
      }
    }
  }, { noAck: false });
}
```

`f158-rabbitmq/demo.js`:

```javascript
// Módulo 26 · F158 · Ejecuta (RabbitMQ arriba): node f158-rabbitmq/demo.js
import amqplib from 'amqplib';
import { setTimeout as dormir } from 'node:timers/promises';
import { AMQP_URL } from '../comun/config.js';
import { ErrorDeDatos, consumir } from './consumidor.js';
import { COLA, DLQ, EXCHANGE, borrar, declarar } from './topologia.js';

const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createConfirmChannel();
await borrar(canal);
await declarar(canal);

const inicio = Date.now();
const fallosPendientes = { 'P-1': 0, 'P-2': 2, 'P-3': 99 }; // P-2 falla 2 veces y luego pasa; P-3 nunca pasa
await consumir(canal, COLA, async ({ id, total }) => {
  if (total <= 0) throw new ErrorDeDatos(`${id}: total inválido`);
  if (fallosPendientes[id]-- > 0) throw new Error(`${id}: pasarela no responde`);
}, { registro: (t) => console.log(`${String(Date.now() - inicio).padStart(5)} ms  ${t}`) });

for (const p of [{ id: 'P-1', total: 100 }, { id: 'P-2', total: 200 }, { id: 'P-3', total: 300 }, { id: 'P-4', total: 0 }]) {
  canal.publish(EXCHANGE, 'cobro', Buffer.from(JSON.stringify(p)), { persistent: true, messageId: p.id });
}
await canal.waitForConfirms();
await dormir(1500);
const { messageCount } = await canal.checkQueue(DLQ);
console.log(`en la DLQ: ${messageCount} (P-3 agotó los reintentos y P-4 tenía datos inválidos)`);
await conexion.close();
```

#### 10. MINI-LABORATORIO

1. Levanta RabbitMQ y ejecuta la demo:

```bash
docker compose up -d --wait rabbitmq
node f158-rabbitmq/demo.js
```

**Output esperado** (real, con RabbitMQ 3.12.1 en el entorno de redacción; los milisegundos cambian en cada ejecución):

```text
    4 ms  ack     intento 1
    5 ms  espera  200 ms (P-2: pasarela no responde)
    5 ms  espera  200 ms (P-3: pasarela no responde)
    6 ms  dlq     P-4: total inválido
  253 ms  espera  600 ms (P-2: pasarela no responde)
  253 ms  espera  600 ms (P-3: pasarela no responde)
  858 ms  ack     intento 3
  858 ms  dlq     P-3: pasarela no responde
en la DLQ: 2 (P-3 agotó los reintentos y P-4 tenía datos inválidos)
```

2. Mira las colas y sus tipos:

```bash
docker compose exec rabbitmq rabbitmqctl -q list_queues name type messages
```

**Output esperado** (real con RabbitMQ 3.12.1; el orden de las filas puede variar):

```text
f158.cobros.dlq	quorum	2
f158.espera.200ms	classic	0
f158.espera.600ms	classic	0
f158.cobros	quorum	0
```

Si lo ejecutas en el mismo segundo que la demo puede salir `0` en la DLQ: las cifras de `list_queues` se refrescan
cada pocos segundos. Espera unos segundos y repite.

3. Abre `http://localhost:15672` (usuario y clave `academia`) → *Queues and Streams* → `f158.cobros.dlq` → *Get
   messages*. **Captura comentada:** el mensaje de P-3 lleva `x-reintento: 2` y `x-death` con dos entradas: la más
   reciente `rejected` en `f158.cobros` y la anterior `expired` en `f158.espera.600ms`; P-4 solo trae `rejected`.

#### 11. VERIFICACIÓN

Tests contra RabbitMQ real (`f158-rabbitmq/rabbitmq.test.js`):

```javascript
// Módulo 26 · F158 · Tests contra RabbitMQ real (AMQP_URL). Ejecuta: node --test f158-rabbitmq/rabbitmq.test.js
import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { consumir } from './consumidor.js';
import { COLA, DLQ, EXCHANGE, LIMITE_ENTREGAS, borrar, declarar } from './topologia.js';

let conexion;
let canal;
before(async () => { conexion = await amqplib.connect(AMQP_URL); });
after(() => conexion.close());
beforeEach(async () => {
  canal = await conexion.createConfirmChannel();
  await borrar(canal);
  await declarar(canal);
});
afterEach(() => canal.close().catch(() => {}));
const publicar = async (p) => {
  canal.publish(EXCHANGE, 'cobro', Buffer.from(JSON.stringify(p)), { persistent: true, messageId: p.id });
  await canal.waitForConfirms();
};

test('cola quorum: tras x-delivery-limit entregas fallidas el mensaje va a la DLQ con reason delivery_limit', async () => {
  await publicar({ id: 'P-1' });
  let entregas = 0;
  for (let i = 0; i < LIMITE_ENTREGAS + 3; i++) {
    const m = await canal.get(COLA);
    if (!m) break;
    entregas += 1;
    canal.reject(m, true); // como si el proceso muriera con el mensaje: cuenta como entrega fallida
    await dormir(50);
  }
  assert.equal(entregas, LIMITE_ENTREGAS + 1);
  await dormir(200);
  const muerto = await canal.get(DLQ);
  assert.equal(muerto.properties.headers['x-first-death-reason'], 'delivery_limit');
  canal.ack(muerto);
});

test('reintento escalonado: falla 2 veces, espera 200 y 600 ms, y al tercer intento pasa', async () => {
  const momentos = [];
  const inicio = Date.now();
  let fallos = 2;
  await consumir(canal, COLA, async () => { momentos.push(Date.now() - inicio); if (fallos-- > 0) throw new Error('caída'); });
  await publicar({ id: 'P-2' });
  await dormir(1500);
  assert.equal(momentos.length, 3);
  assert.ok(momentos[1] - momentos[0] >= 190, `1.er reintento a los ${momentos[1] - momentos[0]} ms`);
  assert.ok(momentos[2] - momentos[1] >= 590, `2.º reintento a los ${momentos[2] - momentos[1]} ms`);
  assert.equal((await canal.checkQueue(DLQ)).messageCount, 0);
});

test('sin más reintentos, a la DLQ: la última muerte es rejected en f158.cobros', async () => {
  await consumir(canal, COLA, async () => { throw new Error('siempre falla'); });
  await publicar({ id: 'P-3' });
  await dormir(1500);
  const lector = await conexion.createChannel();
  const muerto = await lector.get(DLQ);
  await lector.close();
  // x-death va de la muerte más reciente a la más antigua: antes «murió» dos veces por TTL en las colas de espera.
  const [ultima] = muerto.properties.headers['x-death'];
  assert.deepEqual([ultima.reason, ultima.queue], ['rejected', COLA]);
  assert.equal(muerto.properties.headers['x-first-death-reason'], 'expired');
  assert.equal(muerto.properties.headers['x-reintento'], 2);
});

test('single active consumer: de dos consumidores, solo uno recibe; si se va, el otro toma el relevo', async () => {
  const q = 'f158.sac';
  await canal.deleteQueue(q);
  await canal.assertQueue(q, { durable: true, arguments: { 'x-queue-type': 'quorum', 'x-single-active-consumer': true } });
  const recibidos = { A: [], B: [] };
  const { consumerTag: tagA } = await canal.consume(q, (m) => { if (!m) return; recibidos.A.push(m.content.toString()); canal.ack(m); });
  await canal.consume(q, (m) => { if (!m) return; recibidos.B.push(m.content.toString()); canal.ack(m); });
  for (const n of [1, 2, 3]) canal.sendToQueue(q, Buffer.from(String(n)));
  await dormir(300);
  await canal.cancel(tagA);
  for (const n of [4, 5]) canal.sendToQueue(q, Buffer.from(String(n)));
  await dormir(300);
  assert.deepEqual(recibidos, { A: ['1', '2', '3'], B: ['4', '5'] });
  await canal.deleteQueue(q);
});
```

```bash
node --test --test-reporter=spec f158-rabbitmq/rabbitmq.test.js
```

**Output esperado** (real, con RabbitMQ 3.12.1): `ℹ tests 4` y `ℹ pass 4`. Con RabbitMQ 4.4.1, pendiente en el Mac.

**Pregunta de comprobación:** en el primer test, ¿por qué hay 4 entregas con `x-delivery-limit: 3`? (La primera
entrega no es un reintento: el mensaje se aparta cuando las entregas **fallidas** superan el límite.)

#### 12. ERROR COMÚN

**Síntoma:** la CPU del consumidor y del broker se dispara, la cola tiene **1** mensaje y los logs repiten el mismo
error miles de veces por minuto. **Causa:** un mensaje venenoso se reencola sin límite (`nack` con `requeue=true`) en
una cola clásica: vuelve a la cabeza y se entrega al instante.

```javascript
// Módulo 26 · F158 · Error común: reencolar sin límite un mensaje venenoso en una cola CLÁSICA.
// nack(requeue=true) lo devuelve a la cabeza de la cola y vuelve a llegar al instante: un bucle que quema CPU y red.
// Ejecuta (RabbitMQ arriba): node f158-rabbitmq/error-comun.js
import amqplib from 'amqplib';
import { setTimeout as dormir } from 'node:timers/promises';
import { AMQP_URL } from '../comun/config.js';

const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createChannel();
const cola = 'f158.clasica.bucle';
await canal.deleteQueue(cola);
await canal.assertQueue(cola, { durable: true }); // clásica: sin x-delivery-limit
canal.sendToQueue(cola, Buffer.from('{"id":"P-VENENO","total":"no es un número"}'));
let entregas = 0;
await canal.consume(cola, (msg) => {
  entregas += 1;
  canal.nack(msg, false, true); // ✘ «quizá la próxima vez funcione»
});
await dormir(1000);
await canal.close();
console.log(`MAL  → 1 mensaje venenoso, ${entregas > 100 ? 'más de 100' : entregas} entregas en 1 s (y seguiría para siempre)`);
const limpio = await conexion.createChannel();
await limpio.deleteQueue(cola);
await conexion.close();
```

Salida real de `node f158-rabbitmq/error-comun.js`:

```text
MAL  → 1 mensaje venenoso, más de 100 entregas en 1 s (y seguiría para siempre)
```

**Diagnóstico visual:** en la consola, la gráfica *Message rates* de la cola muestra *Redelivered* muy alto con
*Publish* en cero. **Arreglo:** cola quorum con `x-delivery-limit` y DLX, reintentos con espera (colas de espera) y
`reject(msg, false)` para lo que no tiene arreglo. Recuerda que en 4.3+ un `nack` con requeue **no** cuenta para el
límite: si tu consumidor reencola así un mensaje que siempre falla, el límite no lo salvará.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo diseñas los reintentos y los mensajes venenosos en RabbitMQ?**

**Respuesta modelo:** separo errores pasajeros de permanentes. Los pasajeros se reintentan con espera creciente, no
al instante: el consumidor publica una copia en una cola de espera con TTL cuyo dead-letter devuelve el mensaje al
exchange principal, con un contador de reintentos en una cabecera, y hace ack del original; uso una cola por retardo
porque el TTL solo expira en la cabeza. Agotados los reintentos, o si los datos son inválidos, rechazo sin reencolar y
va a una DLQ que alguien vigila, con la historia en `x-death`. La cola principal es quorum, replicada, con
`x-delivery-limit` para que un mensaje que tumba al consumidor se aparte solo; en 4.x el límite por defecto es 20.
Como publicar la copia y hacer ack no es atómico, los consumidores son idempotentes. Y si necesito orden, uso single
active consumer o reparto por clave con consistent hash.

#### 14. ANTI-PATRÓN RELACIONADO

**Reintentar dentro del consumidor con `setTimeout` reteniendo el mensaje.** El mensaje queda sin ack mientras
esperas: ocupa un hueco del prefetch, bloquea a los demás y, si el proceso muere, se reentrega de inmediato, sin
espera y sin contador.

```javascript
// MAL: el reintento vive en la memoria del proceso.
canal.consume(COLA, async (msg) => {
  for (let i = 0; i < 3; i++) { try { await cobrar(msg); break; } catch { await dormir(60_000); } }
  canal.ack(msg);
});

// BIEN: el reintento vive en el broker (colas de espera con TTL) y el contador en una cabecera (consumidor.js).
canal.sendToQueue(espera(ESPERAS[reintento]), msg.content, { headers: { 'x-reintento': reintento + 1 } });
canal.ack(msg);
```

---

### NATS

#### 1. UBICACIÓN

Módulo 26, Lección 3 de 4 · Fase 3.

#### 2. PRERREQUISITOS

- NATS core en Node: subjects, grupos de cola y petición/respuesta (Módulo 18, ficha 5).
- Idempotencia y exactly-once (Módulo 25, fichas 3 y 4).
- Concurrencia optimista con versión (Módulo 22, ficha 5).

#### 3. OBJETIVO DE APRENDIZAJE

**Usar** JetStream, la capa de persistencia de NATS, para tres problemas reales: **deduplicar** publicaciones
reintentadas con `msgID`, **repartir trabajo** con una cola de trabajo de reintentos limitados (`nak`, `term`,
`max_deliver`, doble ack) y **evitar sobreventas** con el KV y su compare-and-set por revisión. Lo compruebas cuando
`nats.test.js` pasa 5 de 5.

#### 4. ANALOGÍA VISUAL

Dibuja una **oficina de correos con casilleros numerados** (el stream). Cada carta tiene un **número de envío**
(`Nats-Msg-Id`): si el cartero, dudando, vuelve con la misma carta en los dos minutos siguientes, el empleado mira el
registro y le dice «ya la tengo» sin guardarla dos veces. En la trastienda, una **pila de tareas** (cola de trabajo):
cada repartidor toma una, y si no avisa de que la terminó a tiempo, vuelve a la pila; a la tercera vez que nadie puede
con ella, se aparta y suena una alarma. Y en la pared, una **pizarra de existencias** (KV) donde cada cifra tiene un
número de versión: solo puedes borrar «5» y escribir «3» si sigue diciendo «5, versión 7»; si alguien la cambió antes,
vuelves a leer.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TB
    subgraph S1["Stream F159_PEDIDOS (duplicate_window 2 s)"]
        P1["publish P-1 msgID=P-1 → seq 1"]
        P2["publish P-1 msgID=P-1 → seq 1, duplicate=true"]
    end
    subgraph S2["Stream F159_COBROS (retention workqueue)"]
        C1["consumidor durable «cobradores»<br/>ack explícito · ack_wait 1 s · max_deliver 3"]
        C1 -->|"ackAck"| B["mensaje borrado"]
        C1 -->|"nak(100 ms)"| R["reentrega"]
        C1 -->|"3 entregas sin ack"| A["aviso $JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES"]
    end
    subgraph S3["KV f159_stock"]
        K1["get TEC-1 → 5, revisión r"]
        K1 --> K2["update(TEC-1, 3, r)"]
        K2 -->|"r cambió"| K3["wrong last sequence → releer"]
    end
```

**Texto alternativo:** tres bloques. En el stream F159_PEDIDOS, con ventana de deduplicación de 2 segundos, el primer
publish de P-1 con msgID P-1 se guarda con secuencia 1 y el segundo devuelve la misma secuencia con duplicate verdadero.
En el stream F159_COBROS, de retención workqueue, el consumidor durable cobradores con ack explícito, ack_wait de 1
segundo y max_deliver 3: un ackAck borra el mensaje, un nak con 100 milisegundos lo reentrega y tres entregas sin ack
generan el aviso MAX_DELIVERIES. En el KV f159_stock, se lee TEC-1 con valor 5 y revisión r y se actualiza a 3 con esa
revisión; si la revisión cambió, el servidor responde wrong last sequence y se relee.

#### 6. EXPLICACIÓN NIVEL 0

- NATS normal es como la radio: si no estabas escuchando, te lo perdiste. **JetStream** añade un **archivo**: guarda
  los mensajes para leerlos después.
- Si envías dos veces el mismo mensaje porque no sabías si llegó, JetStream lo reconoce por su **número de envío** y
  guarda solo uno.
- Una **cola de trabajo** reparte tareas: cada una la hace un solo trabajador y desaparece al terminarla. Si falla,
  vuelve a intentarse, pero solo unas cuantas veces.
- El **KV** es una tabla de «nombre → valor» con versión. Sirve para que dos programas no cambien el mismo dato a la
  vez sin darse cuenta.

#### 7. EXPLICACIÓN INTERMEDIA

- **Stream:** `jsm.streams.add({ name, subjects, duplicate_window, retention })`. Las duraciones van en
  **nanosegundos** (`ms()` en `jetstream.js`).
- **Deduplicación:** `js.publish(subject, datos, { msgID })` pone la cabecera `Nats-Msg-Id`. El servidor no guarda dos
  veces el mismo id dentro de la ventana (por defecto **dos minutos**; aquí 2 s para probarlo) y responde con
  `PubAck.duplicate = true` y la secuencia original.
- **Cola de trabajo:** `retention: RetentionPolicy.Workqueue` borra el mensaje cuando un consumidor lo confirma. El
  consumidor durable tiene `ack_policy: Explicit`, `ack_wait` (por defecto 30 s) y `max_deliver`.
- **Respuestas al mensaje:** `ack()` / `ackAck()` (el doble ack espera a que el servidor confirme que registró el ack:
  una ida y vuelta más, para cuando reprocesar sería dañino), `nak(ms)` (reentregar tras esa espera), `term()` (no
  reentregar nunca) y `working()` (pedir más tiempo). Con `max_deliver` agotado, el servidor deja de entregar y publica
  un aviso en `$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.<stream>.<consumidor>`; el mensaje sigue en el stream.
- **KV:** `new Kvm(nc).create('bucket')`, `kv.put`, `kv.get` (con `revision`), `kv.create` (solo si no existe) y
  `kv.update(clave, valor, revision)`, que falla con `wrong last sequence: <n>` si otro escribió antes.
- Fuentes: https://docs.nats.io/learn/jetstream/publishing (`Nats-Msg-Id`, ventana de dos minutos y `duplicate`) y
  https://docs.nats.io/learn/jetstream/delivery-and-acknowledgment (doble ack y Ack Wait de 30 s).

#### 8. EXPLICACIÓN MAESTRA

- **NATS vs Kafka vs RabbitMQ.** NATS core es mínimo y rapidísimo (sin persistencia, ideal para petición/respuesta y
  señales); JetStream añade streams con retención por límites, interés o cola de trabajo, consumidores pull/push, KV y
  object store, con un binario pequeño y *leaf nodes* para el borde. Kafka sigue siendo mejor para logs enormes con
  muchos consumidores que releen y ecosistema (Connect, Streams). RabbitMQ, para enrutamiento rico y patrones de colas
  clásicos.
- **Deduplicación con límites.** La ventana es finita y cuesta memoria en el servidor: un reintento que llega después
  de la ventana se guarda otra vez (segundo test). Sigue haciendo idempotentes a los consumidores.
- **Doble ack con criterio.** Un ack simple es *fire-and-forget*: si se pierde, el mensaje vuelve. El doble ack cierra
  ese hueco a costa de latencia por mensaje; úsalo donde reprocesar duele y no puedes hacer idempotente el efecto.
- **KV no es una base de datos.** Compare-and-set por clave sí; transacciones entre claves o consultas, no. Para un
  contador de stock o un *lock* con TTL es perfecto; para un inventario con reglas, usa la base de datos del servicio.
- **Alternativas:** *Kafka* con productor idempotente para deduplicar reintentos de red; *Redis* `SET NX` para
  deduplicar (Módulo 22); *RabbitMQ* con colas quorum para colas de trabajo.
- **Cuándo NO usar JetStream:** si solo necesitas petición/respuesta o notificaciones efímeras, NATS core basta; y si
  tu equipo ya opera Kafka y necesita relectura masiva, añadir NATS es otra pieza que operar.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **@nats-io/transport-node 3.5.0**, **@nats-io/jetstream 3.5.0**, **@nats-io/kv
3.5.0** y **NATS Server 2.15.3** con `-js` (ejecutado aquí con NATS Server 2.10.7).

`f159-nats/jetstream.js`:

```javascript
// Módulo 26 · F159 · NATS JetStream: persistencia, deduplicación por Nats-Msg-Id, cola de trabajo con reintentos
// limitados y KV con concurrencia optimista. Requisitos: Node.js 26.13.1 LTS, @nats-io/transport-node, jetstream y kv
// 3.5.0, NATS Server 2.15.3 con JetStream (-js).
import { connect } from '@nats-io/transport-node';
import { AckPolicy, RetentionPolicy, jetstream, jetstreamManager } from '@nats-io/jetstream';
import { Kvm } from '@nats-io/kv';
import { NATS_URL } from '../comun/config.js';

export const ms = (n) => n * 1_000_000; // JetStream mide las duraciones en nanosegundos

export async function conectar(nombre) {
  const nc = await connect({ servers: NATS_URL, name: nombre });
  return { nc, js: jetstream(nc), jsm: await jetstreamManager(nc), kvm: new Kvm(nc) };
}

// Stream = el log persistente de uno o varios subjects. Se borra y se crea para que cada ejecución empiece limpia.
export async function crearStream(jsm, config) {
  await jsm.streams.delete(config.name).catch(() => {});
  return jsm.streams.add(config);
}

// 1) Pedidos con deduplicación: dos publish con el mismo msgID dentro de la ventana guardan UN mensaje.
export const streamPedidos = (jsm, prefijo = 'F159') => crearStream(jsm, {
  name: `${prefijo}_PEDIDOS`, subjects: [`${prefijo.toLowerCase()}.pedidos.>`], duplicate_window: ms(2000),
});

// 2) Cola de trabajo: cada mensaje lo procesa UN consumidor y se borra al confirmarlo (retention: workqueue).
export async function colaDeCobros(jsm, prefijo = 'F159', { maxEntregas = 3, ackWaitMs = 1000 } = {}) {
  await crearStream(jsm, { name: `${prefijo}_COBROS`, subjects: [`${prefijo.toLowerCase()}.cobros`], retention: RetentionPolicy.Workqueue });
  await jsm.consumers.add(`${prefijo}_COBROS`, {
    durable_name: 'cobradores',
    ack_policy: AckPolicy.Explicit, // cada mensaje necesita ack; si no llega en ack_wait, se reentrega
    ack_wait: ms(ackWaitMs),
    max_deliver: maxEntregas, // tras N entregas sin ack, JetStream deja de entregarlo y emite un aviso
  });
}

// Procesa un mensaje: ack si va bien, nak con espera si falla (reintento), term si nunca podrá procesarse.
export async function procesarSiguiente(js, prefijo, procesar) {
  const consumidor = await js.consumers.get(`${prefijo}_COBROS`, 'cobradores');
  const m = await consumidor.next({ expires: 1500 });
  if (!m) return null;
  const entrega = m.info.deliveryCount;
  try {
    await procesar(m.json(), entrega);
    await m.ackAck(); // «doble ack»: espera la confirmación del servidor de que el ack quedó registrado
    return `ack (entrega ${entrega})`;
  } catch (error) {
    if (error.permanente) { m.term(error.message); return `term (entrega ${entrega}): ${error.message}`; }
    m.nak(100); // vuelve a entregarse en ~100 ms
    return `nak (entrega ${entrega}): ${error.message}`;
  }
}

// 3) KV con compare-and-set: update() solo escribe si la revisión no cambió desde que leíste.
export async function reservar(kv, sku, cantidad, { antesDeEscribir } = {}) {
  for (let intento = 1; ; intento++) {
    const entrada = await kv.get(sku);
    const stock = Number(entrada.string());
    if (stock < cantidad) throw new Error(`sin stock de ${sku}`);
    await antesDeEscribir?.(intento);
    try {
      await kv.update(sku, String(stock - cantidad), entrada.revision);
      return intento;
    } catch (error) {
      if (!/wrong last sequence/.test(error.message)) throw error;
      // Otro escribió entre nuestro get y nuestro update: se relee y se reintenta.
    }
  }
}
```

`f159-nats/demo.js`:

```javascript
// Módulo 26 · F159 · Ejecuta (NATS con JetStream arriba): node f159-nats/demo.js
import { setTimeout as dormir } from 'node:timers/promises';
import { colaDeCobros, conectar, procesarSiguiente, reservar, streamPedidos } from './jetstream.js';

const { nc, js, jsm, kvm } = await conectar('f159-demo');

// 1) Deduplicación: el productor reintenta P-1 (timeout de red) con el mismo msgID.
await streamPedidos(jsm);
for (const intento of [1, 2]) {
  const ack = await js.publish('f159.pedidos.creado', JSON.stringify({ id: 'P-1' }), { msgID: 'P-1' });
  console.log(`publish P-1 (intento ${intento}) → seq ${ack.seq} duplicate=${ack.duplicate}`);
}
console.log(`mensajes en F159_PEDIDOS: ${(await jsm.streams.info('F159_PEDIDOS')).state.messages}`);

// 2) Cola de trabajo con reintentos limitados: C-1 pasa al 2.º intento; C-2 falla siempre.
await colaDeCobros(jsm);
const avisos = nc.subscribe('$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.F159_COBROS.cobradores');
(async () => { for await (const a of avisos) console.log(`aviso MAX_DELIVERIES: stream_seq=${a.json().stream_seq} deliveries=${a.json().deliveries}`); })();
for (const id of ['C-1', 'C-2']) await js.publish('f159.cobros', JSON.stringify({ id }));
const procesar = async ({ id }, entrega) => { if (id === 'C-2' || entrega < 2) throw new Error(`${id}: pasarela caída`); };
for (let i = 0; i < 6; i++) {
  const r = await procesarSiguiente(js, 'F159', procesar);
  if (r) console.log(`cobradores: ${r}`);
}
await dormir(300);
console.log(`mensajes en F159_COBROS: ${(await jsm.streams.info('F159_COBROS')).state.messages} (C-1 se borró al confirmarlo; C-2 queda sin entregar)`);

// 3) KV: dos reservas a la vez sobre el mismo stock.
await kvm.create('f159_stock').then((kv) => kv.destroy()).catch(() => {});
const kv = await kvm.create('f159_stock');
await kv.put('TEC-1', '5');
const [a, b] = await Promise.all([
  reservar(kv, 'TEC-1', 2, { antesDeEscribir: () => dormir(50) }),
  reservar(kv, 'TEC-1', 2, { antesDeEscribir: () => dormir(50) }),
]);
console.log(`reservas: intentos ${a} y ${b} · stock final = ${(await kv.get('TEC-1')).string()}`);
await kv.destroy();
await nc.drain();
```

#### 10. MINI-LABORATORIO

1. Levanta NATS con JetStream y ejecuta la demo:

```bash
docker compose up -d --wait nats
node f159-nats/demo.js
```

**Output esperado** (real, con NATS Server 2.10.7 en el entorno de redacción):

```text
publish P-1 (intento 1) → seq 1 duplicate=false
publish P-1 (intento 2) → seq 1 duplicate=true
mensajes en F159_PEDIDOS: 1
cobradores: nak (entrega 1): C-1: pasarela caída
cobradores: nak (entrega 1): C-2: pasarela caída
cobradores: ack (entrega 2)
cobradores: nak (entrega 2): C-2: pasarela caída
cobradores: nak (entrega 3): C-2: pasarela caída
aviso MAX_DELIVERIES: stream_seq=2 deliveries=3
mensajes en F159_COBROS: 1 (C-1 se borró al confirmarlo; C-2 queda sin entregar)
reservas: intentos 1 y 2 · stock final = 1
```

2. Mira el estado de JetStream por el monitoreo HTTP:

```bash
curl -s http://localhost:8222/jsz
```

**Output esperado:** un JSON con las cifras de JetStream del servidor (streams, consumidores, mensajes y bytes); el
detalle depende de lo que hayas ejecutado. **Captura comentada:** con el CLI `nats` (opcional), `nats stream info
F159_COBROS` muestra la retención de cola de trabajo y `nats consumer info F159_COBROS cobradores` el máximo de 3
entregas y los mensajes reentregados (descrito, no visto: pendiente en el Mac).

#### 11. VERIFICACIÓN

Tests contra NATS real (`f159-nats/nats.test.js`):

```javascript
// Módulo 26 · F159 · Tests contra NATS real con JetStream (NATS_URL). Ejecuta: node --test f159-nats/nats.test.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { colaDeCobros, conectar, procesarSiguiente, reservar, streamPedidos } from './jetstream.js';

const P = `T${process.pid}`; // prefijo propio: streams F159 de la demo y de los tests no se pisan
let c;
before(async () => { c = await conectar('f159-test'); });
after(async () => {
  for (const s of [`${P}_PEDIDOS`, `${P}_COBROS`]) await c.jsm.streams.delete(s).catch(() => {});
  await c.nc.drain();
});

test('mismo msgID dentro de la ventana: duplicate=true y un solo mensaje', async () => {
  await streamPedidos(c.jsm, P);
  const a = await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-1' });
  const b = await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-1' });
  assert.deepEqual([a.duplicate, b.duplicate, b.seq], [false, true, a.seq]);
});

test('pasada la ventana de deduplicación (2 s), el mismo msgID se guarda otra vez', async () => {
  await streamPedidos(c.jsm, P);
  await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-2' });
  await dormir(2200);
  const b = await c.js.publish(`${P.toLowerCase()}.pedidos.creado`, '{}', { msgID: 'P-2' });
  assert.equal(b.duplicate, false);
});

test('cola de trabajo: nak reintenta y el ack borra el mensaje del stream', async () => {
  await colaDeCobros(c.jsm, P);
  await c.js.publish(`${P.toLowerCase()}.cobros`, JSON.stringify({ id: 'C-1' }));
  const r1 = await procesarSiguiente(c.js, P, async (_d, entrega) => { if (entrega < 2) throw new Error('caída'); });
  const r2 = await procesarSiguiente(c.js, P, async () => {});
  assert.deepEqual([r1, r2], ['nak (entrega 1): caída', 'ack (entrega 2)']);
  assert.equal((await c.jsm.streams.info(`${P}_COBROS`)).state.messages, 0);
});

test('max_deliver: tras 3 entregas sin ack no vuelve a entregarse', async () => {
  await colaDeCobros(c.jsm, P);
  await c.js.publish(`${P.toLowerCase()}.cobros`, JSON.stringify({ id: 'C-2' }));
  const r = [];
  for (let i = 0; i < 4; i++) r.push(await procesarSiguiente(c.js, P, async () => { throw new Error('caída'); }));
  assert.deepEqual(r.map((x) => x?.slice(0, 13) ?? null), ['nak (entrega ', 'nak (entrega ', 'nak (entrega ', null]);
});

test('KV: dos reservas concurrentes no venden de más (compare-and-set con revisión)', async () => {
  const kv = await c.kvm.create(`${P}_stock`);
  await kv.put('TEC-1', '3');
  const r = await Promise.allSettled([1, 2].map(() => reservar(kv, 'TEC-1', 2, { antesDeEscribir: () => dormir(30) })));
  assert.deepEqual(r.map((x) => x.status).sort(), ['fulfilled', 'rejected']);
  assert.equal((await kv.get('TEC-1')).string(), '1');
  await kv.destroy();
});
```

```bash
node --test --test-reporter=spec f159-nats/nats.test.js
```

**Output esperado** (real, con NATS Server 2.10.7): `ℹ tests 5` y `ℹ pass 5`. Con NATS 2.15.3, pendiente en el Mac.

**Pregunta de comprobación:** tras agotar `max_deliver`, ¿se borró C-2 del stream de trabajo? (No: sigue ahí, sin
entregarse; por eso la demo cuenta 1 mensaje y conviene escuchar el aviso MAX_DELIVERIES para tratarlo.)

#### 12. ERROR COMÚN

**Síntoma:** pedidos duplicados en el stream justo después de timeouts del cliente. **Causa:** el productor reintenta
`js.publish` sin `msgID`: el primer intento sí se guardó (lo que se perdió fue el `PubAck`).

```javascript
// Módulo 26 · F159 · Error común: reintentar un publish de JetStream SIN msgID. Si el primer intento sí llegó
// (y lo que se perdió fue el ack), el stream guarda el pedido dos veces. Ejecuta: node f159-nats/error-comun.js
import { conectar, streamPedidos } from './jetstream.js';

const { nc, js, jsm } = await conectar('f159-error');
await streamPedidos(jsm, 'F159E');
for (const intento of [1, 2]) await js.publish('f159e.pedidos.creado', JSON.stringify({ id: 'P-1', intento }));
console.log(`MAL  → sin msgID:  ${(await jsm.streams.info('F159E_PEDIDOS')).state.messages} mensajes para un solo pedido`);
await streamPedidos(jsm, 'F159E');
for (const intento of [1, 2]) await js.publish('f159e.pedidos.creado', JSON.stringify({ id: 'P-1', intento }), { msgID: 'P-1' });
console.log(`BIEN → msgID=P-1: ${(await jsm.streams.info('F159E_PEDIDOS')).state.messages} mensaje`);
await jsm.streams.delete('F159E_PEDIDOS');
await nc.drain();
```

Salida real de `node f159-nats/error-comun.js`:

```text
MAL  → sin msgID:  2 mensajes para un solo pedido
BIEN → msgID=P-1: 1 mensaje
```

**Diagnóstico visual:** en el stream hay dos mensajes con el mismo cuerpo y secuencias consecutivas (con el CLI
`nats`, `nats stream view <stream>`). **Arreglo:** un `msgID` estable que el productor pueda recalcular (el id del pedido, no un uuid nuevo en
cada intento). Y en el KV, nunca `put` tras `get` para cambiar un contador: usa `update` con la revisión; si no, dos
reservas simultáneas venden de más (el `update` falla con `JetStreamApiError: wrong last sequence: 2` cuando otro
escribió antes).

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué aporta JetStream sobre NATS core y cómo evitas duplicados y pérdidas con él?**

**Respuesta modelo:** NATS core entrega como máximo una vez y no guarda nada: si no hay suscriptor, el mensaje se
pierde. JetStream añade streams persistentes con retención por límites, interés o cola de trabajo, consumidores
durables con ack explícito y un KV. Para no duplicar al publicar, cada mensaje lleva un `Nats-Msg-Id` estable y el
servidor descarta los repetidos dentro de la ventana de deduplicación, dos minutos por defecto. Para no perder al
consumir, uso ack explícito con un ack_wait adecuado, `nak` con espera para errores pasajeros, `term` para los
permanentes y `max_deliver` con una alerta sobre el aviso de entregas agotadas. Donde reprocesar sería dañino uso el
doble ack. Aun así hago los consumidores idempotentes, porque la ventana es finita. Y para estado compartido pequeño,
como stock, uso el KV con update condicionado a la revisión.

#### 14. ANTI-PATRÓN RELACIONADO

**Usar NATS core (`nc.publish`) para eventos que no se pueden perder.** No hay persistencia ni ack: con el consumidor
reiniciándose, los mensajes publicados en ese intervalo desaparecen.

```javascript
// MAL: si «facturacion» está reiniciando, este pedido se pierde sin rastro.
nc.publish('pedidos.creado', JSON.stringify(pedido));

// BIEN: JetStream guarda el mensaje, confirma con PubAck y deduplica reintentos (jetstream.js).
const ack = await js.publish('f159.pedidos.creado', JSON.stringify(pedido), { msgID: pedido.id });
```

---

### Event Notification vs Event-Carried State Transfer

#### 1. UBICACIÓN

Módulo 26, Lección 4 de 4 · Fase 3.

#### 2. PRERREQUISITOS

- Comunicación síncrona vs asíncrona (Módulo 18, ficha 6).
- Proyecciones y CQRS (Módulo 22, fichas 6 y 7).
- `fetch` y `node:http` (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Comparar** dos formas de diseñar un evento, **Event Notification** (delgado: «algo cambió», y el consumidor pregunta)
y **Event-Carried State Transfer** (gordo: el evento lleva el estado y el consumidor guarda una réplica), **medir** su
efecto en acoplamiento y disponibilidad con servicios HTTP reales y **elegir** según el caso. Lo compruebas cuando
`ecst.test.js` pasa 4 de 4 y el consumidor ECST sigue respondiendo con el catálogo caído.

#### 4. ANALOGÍA VISUAL

Dibuja dos **tablones de anuncios** en una empresa. En el primero, la nota dice «Cambió el menú del comedor»: todos
los que la leen **bajan al comedor a preguntar** cuál es el menú nuevo, y si el comedor está cerrado, se quedan sin
saberlo (notificación). En el segundo, la nota trae **el menú completo** pegado: cada uno lo copia en su libreta y ya
no necesita bajar; si el comedor cierra, siguen sabiendo qué hay (ECST). El precio: las notas son más grandes, cada
libreta puede estar un poco desactualizada y, si dos notas llegan en desorden, hay que mirar **la fecha** para no
copiar el menú viejo encima del nuevo.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant Cat as catálogo (dueño)
    participant Bus as broker
    participant N as facturación (notificación)
    participant E as facturación (ECST)
    Cat->>Bus: PrecioCambiado {id: TEC-1, version: 2}
    Cat->>Bus: ProductoActualizado {id, nombre, precio: 110, version: 2}
    Bus->>N: PrecioCambiado
    N->>Cat: GET /productos/TEC-1
    Cat-->>N: {precio: 110}
    Bus->>E: ProductoActualizado
    E->>E: réplica local: TEC-1 = 110 (si version > la guardada)
    Note over Cat: el catálogo se cae
    Bus->>N: PrecioCambiado (version 5)
    N-xCat: GET → ECONNREFUSED
    Bus->>E: ProductoActualizado (precio 140, version 5)
    E->>E: réplica: 140
```

**Texto alternativo:** diagrama de secuencia. El catálogo, dueño de los datos, publica por cada cambio un evento
delgado PrecioCambiado con el id y la versión, y un evento gordo ProductoActualizado con nombre, precio y versión. La
facturación por notificación recibe el delgado y llama a GET /productos/TEC-1 para obtener el precio. La facturación
ECST recibe el gordo y actualiza su réplica local si la versión es mayor. Después el catálogo se cae: la facturación
por notificación recibe otro aviso y su llamada falla con ECONNREFUSED, mientras la ECST actualiza su réplica a 140 con
lo que trae el evento.

#### 6. EXPLICACIÓN NIVEL 0

- Cuando algo cambia en un servicio, puede avisar de dos maneras.
- **Aviso corto:** «el producto TEC-1 cambió». Quien quiera saber cómo quedó, tiene que preguntarle al dueño.
- **Aviso completo:** «el producto TEC-1 ahora se llama Teclado y cuesta 110». Quien lo recibe se guarda una copia y
  no necesita preguntar a nadie.
- El aviso corto obliga a que el dueño esté disponible y reciba muchas preguntas. El aviso completo hace que cada uno
  tenga copias que pueden ir un poco atrasadas.

#### 7. EXPLICACIÓN INTERMEDIA

- **Event Notification** (`facturacionNotificacion`): el evento lleva identificadores y el tipo de cambio. El
  consumidor hace una llamada de vuelta (*callback*) al dueño. Ventajas: eventos pequeños, el dato siempre se lee
  fresco del dueño, el contrato del evento casi no cambia. Costes: una llamada por evento y por consumidor
  (`consultas: 3` en la demo), acoplamiento **temporal** (si el dueño está caído, el consumidor no avanza) y carga
  sobre el dueño.
- **Event-Carried State Transfer** (`facturacionECST`): el evento lleva el estado que interesa a los consumidores; cada
  uno mantiene una **réplica local** con solo los campos que necesita. Ventajas: autonomía (funciona con el dueño
  caído), cero llamadas, menos latencia. Costes: eventos más grandes, datos duplicados con **consistencia eventual**, y
  el esquema del evento pasa a ser un contrato que hay que versionar (ficha 1).
- **Versión en cada evento:** la réplica solo aplica un evento si su `version` es mayor que la guardada. Sin eso, un
  evento atrasado pisa uno nuevo (error común). Con Kafka, usar el id del agregado como clave mantiene el orden por
  partición, pero los reintentos y las réplicas reconstruidas siguen necesitando la versión.
- **Variante intermedia:** el evento lleva solo el **delta** («precio: 110») en lugar del estado completo. Ahorra bytes
  pero obliga a aplicar todos los deltas en orden y sin huecos.

#### 8. EXPLICACIÓN MAESTRA

- **Cuándo notificación.** Datos sensibles que no quieres repartir (el consumidor pregunta con sus permisos), datos
  muy grandes o que cambian muchísimo y solo interesan a veces, o cuando el consumidor necesita **siempre** el valor
  actual y puede tolerar depender del dueño. También como primer paso, mientras el contrato no está maduro.
- **Cuándo ECST.** Consumidores que leen mucho y deben seguir funcionando aunque el dueño falle (facturación,
  búsqueda, recomendaciones), o cuando el dueño no aguanta la carga de *callbacks*. Es la base de las proyecciones y
  CQRS (Módulo 22) y combina bien con *log compaction* de Kafka: el topic guarda el último estado por clave y una
  réplica nueva se reconstruye leyéndolo desde el principio.
- **Trade-offs que no se ven al principio.** ECST duplica datos personales (cumplimiento: borrar a un cliente implica
  borrarlo en todas las réplicas). Notificación crea una dependencia síncrona escondida dentro de un diseño «asíncrono»:
  el grafo de llamadas de vuelta es el mismo que tendrías con REST, solo que más difícil de ver. Con muchos
  consumidores, la notificación genera una **estampida** de llamadas al dueño tras cada evento.
- **Alternativas:** *event sourcing* (Módulo 22: el evento es el dato y las réplicas son proyecciones); *API de
  consulta con caché* (el consumidor pregunta, pero con caché y circuit breaker del Módulo 19); *CDC* del dueño
  (Módulo 25: ECST sin que el dueño escriba eventos a mano, con el riesgo de exponer su modelo interno).
- **Cuándo NO usar ninguno:** si los dos «servicios» los mantiene el mismo equipo, se despliegan juntos y comparten el
  modelo, una llamada en proceso dentro de un monolito modular es más simple que cualquier evento.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, sin dependencias (`node:http`, `node:events` y `fetch` nativo).

`f160-ecst/servicios.js`:

```javascript
// Módulo 26 · F160 · Event Notification vs Event-Carried State Transfer (ECST), con servidores HTTP reales (node:http).
// El «broker» es un EventEmitter para centrarnos en la forma del evento; con Kafka, RabbitMQ o NATS es igual.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias).
import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';

export const crearBus = () => new EventEmitter();

// Servicio dueño de los datos: catálogo. Publica DOS formas de evento por cada cambio, para comparar.
export async function crearCatalogo(bus) {
  const productos = new Map([['TEC-1', { id: 'TEC-1', nombre: 'Teclado', precio: 100, version: 1 }]]);
  let consultas = 0;
  const servidor = createServer((req, res) => {
    consultas += 1;
    const p = productos.get(req.url.split('/').pop());
    res.writeHead(p ? 200 : 404, { 'content-type': 'application/json' }).end(JSON.stringify(p ?? {}));
  });
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${servidor.address().port}`;
  return {
    url,
    get consultas() { return consultas; },
    cambiarPrecio(id, precio) {
      const p = productos.get(id);
      const nuevo = { ...p, precio, version: p.version + 1 };
      productos.set(id, nuevo);
      bus.emit('notificacion', { tipo: 'PrecioCambiado', id, version: nuevo.version }); // delgado: «algo cambió»
      bus.emit('ecst', { tipo: 'ProductoActualizado', ...nuevo }); // gordo: lleva el estado
    },
    cerrar: () => new Promise((r) => { servidor.closeAllConnections(); servidor.close(r); }),
  };
}

// Consumidor con Event Notification: el evento solo avisa; para saber el precio, llama al catálogo.
export function facturacionNotificacion(bus, urlCatalogo) {
  const precios = new Map();
  const errores = [];
  bus.on('notificacion', async ({ id }) => {
    try {
      const r = await fetch(`${urlCatalogo}/productos/${id}`);
      precios.set(id, (await r.json()).precio);
    } catch (error) {
      errores.push(`${id}: ${error.cause?.code ?? error.message}`);
    }
  });
  return { precio: (id) => precios.get(id), errores };
}

// Consumidor con ECST: guarda una réplica local con lo que trae el evento. Ignora versiones viejas (llegan desordenadas).
export function facturacionECST(bus, { respetarVersion = true } = {}) {
  const replica = new Map();
  bus.on('ecst', (evento) => aplicar(evento));
  function aplicar({ id, nombre, precio, version }) {
    const actual = replica.get(id);
    if (respetarVersion && actual && actual.version >= version) return false;
    replica.set(id, { nombre, precio, version });
    return true;
  }
  return { precio: (id) => replica.get(id)?.precio, aplicar };
}
```

`f160-ecst/demo.js`:

```javascript
// Módulo 26 · F160 · Ejecuta (sin infraestructura): node f160-ecst/demo.js
import { setTimeout as dormir } from 'node:timers/promises';
import { crearBus, crearCatalogo, facturacionECST, facturacionNotificacion } from './servicios.js';

const bus = crearBus();
const catalogo = await crearCatalogo(bus);
const notif = facturacionNotificacion(bus, catalogo.url);
const ecst = facturacionECST(bus);

for (const precio of [110, 120, 130]) catalogo.cambiarPrecio('TEC-1', precio);
await dormir(100);
console.log(`notificación: precio=${notif.precio('TEC-1')} · llamadas HTTP al catálogo: ${catalogo.consultas}`);
console.log(`ECST:         precio=${ecst.precio('TEC-1')} · llamadas HTTP al catálogo: 0`);

await catalogo.cerrar(); // el catálogo se cae… y llega otro cambio que se publicó justo antes
bus.emit('notificacion', { tipo: 'PrecioCambiado', id: 'TEC-1', version: 5 });
bus.emit('ecst', { tipo: 'ProductoActualizado', id: 'TEC-1', nombre: 'Teclado', precio: 140, version: 5 });
await dormir(100);
console.log(`catálogo caído → notificación: precio=${notif.precio('TEC-1')} (desactualizado) · error: ${notif.errores[0]}`);
console.log(`catálogo caído → ECST:         precio=${ecst.precio('TEC-1')} (sigue funcionando con su réplica)`);
```

#### 10. MINI-LABORATORIO

1. Compara los dos estilos, con el catálogo arriba y luego caído:

```bash
node f160-ecst/demo.js
```

**Output esperado** (real):

```text
notificación: precio=130 · llamadas HTTP al catálogo: 3
ECST:         precio=130 · llamadas HTTP al catálogo: 0
catálogo caído → notificación: precio=130 (desactualizado) · error: TEC-1: ECONNREFUSED
catálogo caído → ECST:         precio=140 (sigue funcionando con su réplica)
```

2. Cambia la demo para hacer **10** cambios de precio en lugar de 3 y vuelve a ejecutarla. **Output esperado:**
   `llamadas HTTP al catálogo: 10` con notificación y `0` con ECST: con N consumidores por notificación, serían
   10 × N llamadas.

3. Ejercicio de diseño (sin código): para cada consumidor (facturación, búsqueda, envío de correos de marketing y
   auditoría legal), escribe en una línea si usarías notificación o ECST y qué campos llevaría el evento. **Captura
   comentada:** una tabla de cuatro filas con «estilo», «campos» y «qué pasa si el catálogo cae».

#### 11. VERIFICACIÓN

Tests sin infraestructura (`f160-ecst/ecst.test.js`):

```javascript
// Módulo 26 · F160 · Tests sin infraestructura. Ejecuta: node --test f160-ecst/ecst.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { crearBus, crearCatalogo, facturacionECST, facturacionNotificacion } from './servicios.js';

test('notificación: una llamada al dueño por cada evento', async () => {
  const bus = crearBus();
  const catalogo = await crearCatalogo(bus);
  const notif = facturacionNotificacion(bus, catalogo.url);
  for (const p of [110, 120, 130]) catalogo.cambiarPrecio('TEC-1', p);
  await dormir(100);
  assert.equal(catalogo.consultas, 3);
  assert.equal(notif.precio('TEC-1'), 130);
  await catalogo.cerrar();
});

test('notificación: si el dueño está caído, el consumidor no puede actualizarse', async () => {
  const bus = crearBus();
  const catalogo = await crearCatalogo(bus);
  const notif = facturacionNotificacion(bus, catalogo.url);
  await catalogo.cerrar();
  bus.emit('notificacion', { id: 'TEC-1' });
  await dormir(100);
  assert.match(notif.errores[0], /ECONNREFUSED/);
});

test('ECST: el consumidor responde sin llamar al dueño, aunque esté caído', async () => {
  const bus = crearBus();
  const catalogo = await crearCatalogo(bus);
  const ecst = facturacionECST(bus);
  catalogo.cambiarPrecio('TEC-1', 110);
  await catalogo.cerrar();
  assert.equal(ecst.precio('TEC-1'), 110);
  assert.equal(catalogo.consultas, 0);
});

test('ECST: un evento con versión vieja no pisa uno nuevo', () => {
  const ecst = facturacionECST(crearBus());
  assert.equal(ecst.aplicar({ id: 'X', precio: 130, version: 3 }), true);
  assert.equal(ecst.aplicar({ id: 'X', precio: 120, version: 2 }), false);
  assert.equal(ecst.precio('X'), 130);
});
```

```bash
node --test --test-reporter=spec f160-ecst/ecst.test.js
```

**Output esperado** (real): `ℹ tests 4` y `ℹ pass 4`.

**Pregunta de comprobación:** en el modo notificación, ¿qué precio ve facturación si los tres eventos llegan antes de
que termine la primera llamada? (El actual, 130, tres veces: la notificación lee el estado **del momento de la
consulta**, no el del evento; los precios intermedios nunca se observan.)

#### 12. ERROR COMÚN

**Síntoma:** de vez en cuando, la réplica de un consumidor muestra un precio **anterior** al vigente y se queda así
hasta el próximo cambio. **Causa:** la réplica ECST aplica los eventos en el orden en que llegan, sin comparar
versiones.

```javascript
// Módulo 26 · F160 · Error común: réplica ECST sin versión. Si los eventos llegan desordenados (reintentos, particiones
// distintas, varios consumidores), un estado viejo pisa uno nuevo. Ejecuta: node f160-ecst/error-comun.js
import { crearBus, facturacionECST } from './servicios.js';

const llegada = [ // orden en que llegan: v3 se adelantó a v2
  { id: 'TEC-1', nombre: 'Teclado', precio: 130, version: 3 },
  { id: 'TEC-1', nombre: 'Teclado', precio: 120, version: 2 },
];
const mal = facturacionECST(crearBus(), { respetarVersion: false });
const bien = facturacionECST(crearBus());
for (const e of llegada) { mal.aplicar(e); bien.aplicar(e); }
console.log(`MAL  → sin versión: precio = ${mal.precio('TEC-1')} (el catálogo dice 130)`);
console.log(`BIEN → con versión: precio = ${bien.precio('TEC-1')}`);
```

Salida real de `node f160-ecst/error-comun.js`:

```text
MAL  → sin versión: precio = 120 (el catálogo dice 130)
BIEN → con versión: precio = 130
```

**Diagnóstico visual:** compara la réplica con el dueño para una muestra de ids (un job de reconciliación): las
diferencias coinciden con reintentos del consumidor o con eventos del mismo producto en particiones distintas.
**Arreglo:** versión monotónica en cada evento (la del agregado) y «aplicar solo si es mayor»; clave de partición =
id del agregado.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué diferencia hay entre Event Notification y Event-Carried State Transfer, y cuándo eliges cada uno?**

**Respuesta modelo:** en Event Notification el evento solo avisa de que algo cambió, con ids y tipo, y el consumidor
llama al dueño para obtener los datos; en Event-Carried State Transfer el evento lleva el estado que necesitan los
consumidores, que mantienen una réplica local. La notificación tiene eventos pequeños y datos siempre frescos, pero
crea acoplamiento temporal: si el dueño cae, los consumidores no avanzan, y cada evento genera una llamada por
consumidor. ECST da autonomía y cero llamadas a cambio de datos duplicados con consistencia eventual, eventos más
grandes que hay que versionar con un registro de esquemas, y réplicas que deben respetar la versión para no aplicar un
estado viejo. Elijo ECST para consumidores de lectura intensiva que deben sobrevivir a la caída del dueño, como
facturación o búsqueda, y notificación para datos sensibles, enormes o que el consumidor necesita en tiempo real.

#### 14. ANTI-PATRÓN RELACIONADO

**El evento «notificación» que todos los consumidores convierten en una llamada síncrona inmediata** (la estampida):
el diseño parece asíncrono, pero cada evento dispara N peticiones al dueño en el mismo instante, y su caída paraliza a
todos.

```mermaid
flowchart LR
    Cat["catálogo"] -->|"PrecioCambiado {id}"| Bus["broker"]
    Bus --> F["facturación"]
    Bus --> B["búsqueda"]
    Bus --> R["recomendaciones"]
    F -->|"GET /productos/id"| Cat
    B -->|"GET /productos/id"| Cat
    R -->|"GET /productos/id"| Cat
```

**Texto alternativo:** el catálogo publica PrecioCambiado con solo el id en el broker, que lo entrega a facturación,
búsqueda y recomendaciones; los tres consumidores llaman a la vez a GET /productos/id del catálogo, que recibe tres
peticiones por cada evento y del que dependen todos para avanzar.
