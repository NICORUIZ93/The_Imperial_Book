# Módulo 15 · Mensajería avanzada y event-driven

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

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usar una transacción de Kafka para escribir en dos topics de forma atómica, explicar cómo el coordinador aparta a un productor zombi (fencing) y decidir el modo de compatibilidad de Schema Registry y qué cambios de esquema permite cada uno, comprobándolo con la resolución de esqu…

#### ► LA IDEA EN UNA FRASE
**Usar una transacción de Kafka para escribir en dos topics de forma atómica, explicar cómo el coordinador aparta a un productor zombi (fencing) y decidir el modo de compatibilidad de Schema Registry y qué cambios de esquema permite cada uno, comprobándolo con la resolución de esquemas de Avro y con el formato de cable de Confluent.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en kafka profundo: transacciones, eos, schema registry como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Una **transacción** en Kafka junta varios mensajes, incluso para topics distintos, en un paquete de «todos o
2. Si dos copias del mismo programa escriben a la vez por error, Kafka **deja fuera a la vieja** y solo acepta a la
3. Un **esquema** es el «molde» de un mensaje: qué campos tiene y de qué tipo. **Schema Registry** guarda los moldes y
4. Cuando cambias un molde, el registro comprueba que los programas que leen con el molde viejo, o con el nuevo, sigan

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Kafka profundo: transacciones, EOS, Schema Registry se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Kafka profundo: transacciones, EOS, Schema Registry | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Mensajes «autodescriptivos»: el esquema completo dentro de cada mensaje (o JSON sin ningún contrato). Multiplica el tamaño, no impide cambios incompatibles y deja a cada consumidor adivinar qué versión recibe.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: kafka profundo: transacciones, eos, schema registry funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una **transacción** en Kafka junta varios mensajes, incluso para topics distintos, en un paquete de «todos o
- Si dos copias del mismo programa escriben a la vez por error, Kafka **deja fuera a la vieja** y solo acepta a la
- Un **esquema** es el «molde» de un mensaje: qué campos tiene y de qué tipo. **Schema Registry** guarda los moldes y
- Cuando cambias un molde, el registro comprueba que los programas que leen con el molde viejo, o con el nuevo, sigan

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve kafka profundo: transacciones, eos, schema registry en tu contexto?
2. ¿Cómo sabrías que kafka profundo: transacciones, eos, schema registry no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar kafka profundo: transacciones, eos, schema registry?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
node f157-kafka-schema/demo.js
```

</details>

### RabbitMQ avanzado

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Diseñar una topología de RabbitMQ que no se atasca ni pierde mensajes: colas quorum con límite de entregas, reintentos escalonados con colas de espera (TTL + dead-letter de vuelta), DLQ para lo que no tiene arreglo y single active consumer para procesar en orden con relevo automá…

#### ► LA IDEA EN UNA FRASE
**Diseñar una topología de RabbitMQ que no se atasca ni pierde mensajes: colas quorum con límite de entregas, reintentos escalonados con colas de espera (TTL + dead-letter de vuelta), DLQ para lo que no tiene arreglo y single active consumer para procesar en orden con relevo automático.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en rabbitmq avanzado como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un mensaje puede fallar por dos motivos: algo **pasajero** (un servicio caído un minuto) o algo **permanente**
2. Lo pasajero merece **otro intento, pero no enseguida**: si reintentas al instante, vuelves a chocar contra el mismo
3. Lo permanente se aparta a una **cola de mensajes muertos** para que una persona lo revise.
4. Hay mensajes que tumban al programa cada vez que los toca. Las colas **quorum** cuentan cuántas veces se entregó un

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| RabbitMQ avanzado se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar RabbitMQ avanzado | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Reintentar dentro del consumidor con setTimeout reteniendo el mensaje. El mensaje queda sin ack mientras esperas: ocupa un hueco del prefetch, bloquea a los demás y, si el proceso muere, se reentrega de inmediato, sin espera y sin contador.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rabbitmq avanzado funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un mensaje puede fallar por dos motivos: algo **pasajero** (un servicio caído un minuto) o algo **permanente**
- Lo pasajero merece **otro intento, pero no enseguida**: si reintentas al instante, vuelves a chocar contra el mismo
- Lo permanente se aparta a una **cola de mensajes muertos** para que una persona lo revise.
- Hay mensajes que tumban al programa cada vez que los toca. Las colas **quorum** cuentan cuántas veces se entregó un

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rabbitmq avanzado en tu contexto?
2. ¿Cómo sabrías que rabbitmq avanzado no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rabbitmq avanzado?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### NATS

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usar JetStream, la capa de persistencia de NATS, para tres problemas reales: deduplicar publicaciones reintentadas con msgID, repartir trabajo con una cola de trabajo de reintentos limitados (nak, term, max_deliver, doble ack) y evitar sobreventas con el KV y su compare-and-set p…

#### ► LA IDEA EN UNA FRASE
**Usar JetStream, la capa de persistencia de NATS, para tres problemas reales: deduplicar publicaciones reintentadas con msgID, repartir trabajo con una cola de trabajo de reintentos limitados (nak, term, max_deliver, doble ack) y evitar sobreventas con el KV y su compare-and-set por revisión.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en nats como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. NATS normal es como la radio: si no estabas escuchando, te lo perdiste. **JetStream** añade un **archivo**: guarda
2. Si envías dos veces el mismo mensaje porque no sabías si llegó, JetStream lo reconoce por su **número de envío** y
3. Una **cola de trabajo** reparte tareas: cada una la hace un solo trabajador y desaparece al terminarla. Si falla,
4. El **KV** es una tabla de «nombre → valor» con versión. Sirve para que dos programas no cambien el mismo dato a la

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| NATS se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar NATS | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Usar NATS core (nc.publish) para eventos que no se pueden perder. No hay persistencia ni ack: con el consumidor reiniciándose, los mensajes publicados en ese intervalo desaparecen.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: nats funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- NATS normal es como la radio: si no estabas escuchando, te lo perdiste. **JetStream** añade un **archivo**: guarda
- Si envías dos veces el mismo mensaje porque no sabías si llegó, JetStream lo reconoce por su **número de envío** y
- Una **cola de trabajo** reparte tareas: cada una la hace un solo trabajador y desaparece al terminarla. Si falla,
- El **KV** es una tabla de «nombre → valor» con versión. Sirve para que dos programas no cambien el mismo dato a la

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve nats en tu contexto?
2. ¿Cómo sabrías que nats no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar nats?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
docker compose up -d --wait nats
node f159-nats/demo.js
```

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

```bash
curl -s http://localhost:8222/jsz
```

</details>

### Event Notification vs Event-Carried State Transfer

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Comparar dos formas de diseñar un evento, Event Notification (delgado: «algo cambió», y el consumidor pregunta) y Event-Carried State Transfer (gordo: el evento lleva el estado y el consumidor guarda una réplica), medir su efecto en acoplamiento y disponibilidad con servicios HTT…

#### ► LA IDEA EN UNA FRASE
**Comparar dos formas de diseñar un evento, Event Notification (delgado: «algo cambió», y el consumidor pregunta) y Event-Carried State Transfer (gordo: el evento lleva el estado y el consumidor guarda una réplica), medir su efecto en acoplamiento y disponibilidad con servicios HTTP reales y elegir según el caso.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en event notification vs event-carried state transfer como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Cuando algo cambia en un servicio, puede avisar de dos maneras.
2. **Aviso corto:** «el producto TEC-1 cambió». Quien quiera saber cómo quedó, tiene que preguntarle al dueño.
3. **Aviso completo:** «el producto TEC-1 ahora se llama Teclado y cuesta 110». Quien lo recibe se guarda una copia y
4. El aviso corto obliga a que el dueño esté disponible y reciba muchas preguntas. El aviso completo hace que cada uno

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Event Notification vs Event-Carried State Transfer se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Event Notification vs Event-Carried State Transfer | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El evento «notificación» que todos los consumidores convierten en una llamada síncrona inmediata (la estampida): el diseño parece asíncrono, pero cada evento dispara N peticiones al dueño en el mismo instante, y su caída paraliza a todos.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: event notification vs event-carried state transfer funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando algo cambia en un servicio, puede avisar de dos maneras.
- **Aviso corto:** «el producto TEC-1 cambió». Quien quiera saber cómo quedó, tiene que preguntarle al dueño.
- **Aviso completo:** «el producto TEC-1 ahora se llama Teclado y cuesta 110». Quien lo recibe se guarda una copia y
- El aviso corto obliga a que el dueño esté disponible y reciba muchas preguntas. El aviso completo hace que cada uno

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve event notification vs event-carried state transfer en tu contexto?
2. ¿Cómo sabrías que event notification vs event-carried state transfer no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar event notification vs event-carried state transfer?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>
