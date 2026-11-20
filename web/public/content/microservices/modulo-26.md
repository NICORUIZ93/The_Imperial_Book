# Módulo 22 · Mensajería y patrones de datos

**Fase 2 · Node.js de cero a experto** (una semana y media de 12). **Duración:** 14 h (7 temas de unos 100 min y 2 h
20 min de laboratorio integrador). **Dificultad:** 5 de 5. **Dependencias:** Módulo 18 (Kafka y RabbitMQ, sync vs
async), Módulo 19 (retry, timeouts), Módulo 21 (traceparent en colas) y Módulo 15 (MongoDB); para las fichas 3 y 7,
Módulo 14 (NestJS). **Herramientas:** **Node.js 26.13.1 LTS**, **TypeScript 6.0.3**, **amqplib 2.4.0** con
**RabbitMQ 4.4.1**, **redis (node-redis) 6.3.1** con **Redis 8.10.2**, **@nestjs/core 12.5.1** y **@nestjs/cqrs
12.1.3** con **rxjs 7.8.2**, **mongodb 7.9.1** (driver) con **MongoDB 9.0.8** y **`node:sqlite`** (integrado en Node
26). **Laboratorio:** `examples/microservicios/modulo-26/` (`./verificar.sh` compila y ejecuta los tests, demos y
errores comunes; F135, F136 y F139-MongoDB se ejecutan si su servicio responde; `./verificar.sh --compose` levanta
RabbitMQ, Redis y MongoDB y lo exige todo).

En el Módulo 18 enviaste mensajes; en este aprendes a **no perderlos, no procesarlos dos veces y no dejar datos a
medias** cuando una operación cruza varios servicios. Tres ideas atraviesan el módulo: un broker solo garantiza
**al menos una entrega** (habrá duplicados), una transacción distribuida se sustituye por **pasos locales con
compensación** (sagas) y, a veces, conviene guardar **los hechos** en lugar del estado (event sourcing) y leer de una
**vista aparte** (proyecciones y CQRS).

```mermaid
flowchart LR
    T1["1 · RabbitMQ: publisher confirms,<br/>consumer acknowledgments"] --> T2["2 · Deduplicación<br/>con Redis"]
    T2 --> T3["3 · Sagas con<br/>NestJS CQRS"]
    T3 --> T4["4 · Compensaciones<br/>idempotentes"]
    T5["5 · Event Sourcing con<br/>EventStoreDB o MongoDB"] --> T6["6 · Proyecciones<br/>materializadas"]
    T6 --> T7["7 · CQRS"]
    T3 --> T7
```

**Texto alternativo:** mapa del módulo. El tema 1 (confirms y acks de RabbitMQ) lleva al tema 2 (deduplicación con
Redis), que lleva al tema 3 (sagas con NestJS CQRS) y este al tema 4 (compensaciones idempotentes). En paralelo, el
tema 5 (event sourcing) lleva al tema 6 (proyecciones materializadas) y este al tema 7 (CQRS), que también se apoya en
el tema 3.

**Cómo usar el laboratorio.** Con Node 26 y Docker:

```bash
cd examples/microservicios/modulo-26
npm ci && npm run build             # tsc compila las fichas NestJS (F137 y F141) a dist/
docker compose up -d --wait         # RabbitMQ :5672 (consola :15672), Redis :6379, MongoDB :27017
./verificar.sh --compose            # tests + demos + errores comunes de las 7 fichas → «RESULTADO: OK»
docker compose down -v
```

Todas las órdenes de las fichas se ejecutan **desde `examples/microservicios/modulo-26`**. Las fichas 3, 4, 6 y 7 no
necesitan infraestructura; la 5 y la 6 funcionan con MongoDB o, con `ALMACEN=memoria`, con un almacén en memoria que
sigue las mismas reglas.

`package.json` del laboratorio (con `package-lock.json` que fija el árbol completo):

```json
{
  "name": "modulo-22-mensajeria-y-datos-node",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 22 (Fase 2): Mensajería y patrones de datos en Node.js (publisher confirms y acks de RabbitMQ, deduplicación con Redis, sagas con NestJS CQRS, compensaciones idempotentes, event sourcing con MongoDB, proyecciones y CQRS).",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "npm run build && node --test --test-concurrency=1 'f13*/*.test.js' 'f14*/*.test.js' 'dist/**/*.test.js'"
  },
  "dependencies": {
    "@nestjs/common": "12.5.1",
    "@nestjs/core": "12.5.1",
    "@nestjs/cqrs": "12.1.3",
    "amqplib": "2.4.0",
    "mongodb": "7.9.1",
    "redis": "6.3.1",
    "reflect-metadata": "0.2.2",
    "rxjs": "7.8.2"
  },
  "devDependencies": {
    "@nestjs/testing": "12.5.1",
    "@types/node": "26.6.6",
    "typescript": "6.0.3"
  }
}
```

`docker-compose.yml`:

```yaml
# Módulo 22 (modulo-26) · Mensajería y patrones de datos en Node.js
# Arranca:  docker compose up -d --wait   (espera a los healthchecks de los tres servicios)
#   RabbitMQ :5672 (consola :15672, academia/academia) → F135
#   Redis :6379 → F136
#   MongoDB :27017 (un nodo, sin replica set: el almacén de F139 no usa transacciones) → F139 y F140
# F137, F138 y F141 no necesitan infraestructura.
# Detén:    docker compose down -v        (sin volúmenes persistentes: todo se borra)
name: modulo-26
services:
  rabbitmq:
    image: rabbitmq:4.4.1-management
    environment:
      RABBITMQ_DEFAULT_USER: academia
      RABBITMQ_DEFAULT_PASS: academia
    ports: ["5672:5672", "15672:15672"]
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 5s
      timeout: 10s
      retries: 30
  redis:
    image: redis:8.10.2-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 2s
      timeout: 3s
      retries: 30
  mongo:
    image: mongo:9.0.8
    ports: ["27017:27017"]
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
      interval: 5s
      timeout: 10s
      retries: 30
```

`comun/config.js` y `comun/infra.js` (direcciones y omisión de tests sin infraestructura):

```javascript
// Módulo 22 · Direcciones de la infraestructura del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  AMQP_URL=... REDIS_URL=... MONGO_URL=... node ...
export const AMQP_URL = process.env.AMQP_URL ?? 'amqp://academia:academia@localhost:5672';
export const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
```

```javascript
// Módulo 22 · ¿Responde la infraestructura? Los tests que la necesitan se OMITEN si no responde
// (o FALLAN si EXIGIR_INFRA=1, como hace ./verificar.sh --compose).
import net from 'node:net';

export function responde(url, puertoPorDefecto) {
  const { hostname, port } = new URL(url);
  return new Promise((r) => net.connect(Number(port || puertoPorDefecto), hostname)
    .on('connect', function () { this.destroy(); r(true); })
    .on('error', () => r(false)));
}

export async function omitirSinInfra(nombre, url, puerto) {
  if (await responde(url, puerto)) return false;
  return process.env.EXIGIR_INFRA === '1' ? false : `sin ${nombre} en ${url}`;
}
```

---

### RabbitMQ: publisher confirms, consumer acknowledgments

#### 1. UBICACIÓN

Módulo 22, Lección 1 de 7 · Fase 2 · Laboratorio `examples/microservicios/modulo-26/f135-rabbitmq-confirms/`.

#### 2. PRERREQUISITOS

- Exchanges, colas, bindings y `amqplib` básico (Módulo 18, ficha «Kafka y RabbitMQ»).
- Promesas y callbacks en Node (Módulo 13).
- Docker Compose (Módulo 0.5).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** un publicador que solo da un mensaje por enviado cuando RabbitMQ lo **confirma** (y que detecta los
mensajes que no llegan a ninguna cola) y un consumidor con **acks manuales**, prefetch y cola de mensajes muertos, y
**demostrar** que ningún mensaje se pierde ni se queda atascado. Lo compruebas cuando `confirms.test.js` pasa 5 de 5
contra un RabbitMQ real.

#### 4. ANALOGÍA VISUAL

Dibuja una **oficina de correo certificado**. Al dejar la carta, el empleado te da un **recibo sellado**: hasta que no
lo tienes, no sabes si la carta entró al sistema (eso es el *publisher confirm*). Si la dirección no existe, te la
**devuelven** en la ventanilla (*mandatory* + *return*). En el otro extremo, el cartero entrega la carta y el
destinatario **firma el acuse de recibo** solo cuando la ha leído (el *ack*). Si el cartero llega y el destinatario
se desmaya antes de firmar, la carta **vuelve a la oficina** y se reparte otra vez. Y las cartas con dirección
ilegible van a un **casillero de rechazados** para que alguien las revise (la *dead letter queue*).

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant P as publicador (ConfirmChannel)
    participant X as exchange f135.pedidos
    participant Q as cola f135.facturacion
    participant C as consumidor (prefetch 5)
    participant D as DLQ f135.facturacion.dlq
    P->>X: publish(P-1, persistent, mandatory)
    X->>Q: enruta (pedido.creado)
    Q-->>P: basic.ack (confirm) → la promesa se resuelve
    P->>X: publish(P-4, ruta sin cola, mandatory)
    X-->>P: basic.return 312 NO_ROUTE, después basic.ack → la promesa se rechaza
    Q->>C: entrega P-1
    C-->>Q: ack → el broker lo borra
    Q->>C: entrega P-2
    C-->>Q: nack(requeue=true) → vuelve a la cola (redelivered=true)
    Q->>C: entrega P-3 (total inválido)
    C-->>Q: nack(requeue=false)
    Q->>D: dead-letter (x-death: rejected)
```

**Texto alternativo:** diagrama de secuencia. El publicador, con un canal en modo confirm, publica P-1 persistente y
mandatory en el exchange f135.pedidos, que lo enruta a la cola f135.facturacion; el broker responde basic.ack y la
promesa se resuelve. Al publicar P-4 con una clave sin cola, el broker devuelve basic.return 312 NO_ROUTE y después el
ack, y la promesa se rechaza. El consumidor, con prefetch 5, recibe P-1 y hace ack, con lo que el broker lo borra;
recibe P-2 y hace nack con requeue, con lo que vuelve a la cola marcado como redelivered; recibe P-3, inválido, hace
nack sin requeue y el broker lo envía a la cola de mensajes muertos con la cabecera x-death de motivo rejected.

#### 6. EXPLICACIÓN NIVEL 0

- Cuando tu programa envía un mensaje a RabbitMQ, **no sabe** si llegó: la red puede fallar justo en ese momento.
- Con **publisher confirms**, RabbitMQ responde «lo tengo» por cada mensaje. Tu programa espera esa respuesta antes de
  decir «pedido enviado».
- Del otro lado, el programa que recibe tiene que decir «ya lo procesé» (**ack**). Hasta que no lo dice, RabbitMQ
  guarda el mensaje. Si el programa se cae a mitad, RabbitMQ se lo da a otro.
- Si un mensaje está mal y nunca se podrá procesar, se aparta a una **cola de mensajes muertos** para revisarlo, en
  vez de repetirlo para siempre.

#### 7. EXPLICACIÓN INTERMEDIA

- **Canal en modo confirm:** `conexion.createConfirmChannel()`. Cada `publish(exchange, clave, contenido, opciones,
  callback)` recibe su confirm en el callback: `error === null` es un `basic.ack`, un error es un `basic.nack` (el
  broker no pudo hacerse cargo). `canal.waitForConfirms()` espera todos los pendientes.
- **Cuándo confirma RabbitMQ:** para un mensaje enrutable, cuando todas las colas lo aceptaron; si es **persistente**
  (`persistent: true`) y la cola es **durable**, después de escribirlo a disco; en una cola quorum, cuando la mayoría de
  réplicas lo tiene.
- **`mandatory: true`:** un mensaje que no llega a ninguna cola se **confirma igual** (el broker hizo su trabajo: no
  había adónde mandarlo). Para enterarte, `mandatory` hace que el broker lo devuelva con `basic.return` (evento
  `'return'` en amqplib, código **312 NO_ROUTE**), y RabbitMQ envía ese return **antes** del ack del mismo mensaje. Por
  eso `publicador.js` apunta los devueltos y los revisa al llegar el confirm.
- **Acks manuales:** `consume(cola, fn, { noAck: false })`. `ack(msg)` borra; `nack(msg, false, true)` reencola;
  `nack(msg, false, false)` descarta o, si la cola tiene `deadLetterExchange`, lo manda allí con la cabecera
  `x-death`. `msg.fields.redelivered` dice si ya se entregó antes.
- **`prefetch(n)`:** máximo de mensajes **sin ack** que el broker le entrega a este consumidor. Sin prefetch, el broker
  le empuja toda la cola a la memoria del proceso; con un prefetch pequeño, el trabajo se reparte entre consumidores.
- **Durabilidad:** exchange y cola `durable: true` sobreviven a un reinicio; los mensajes, solo si además son
  persistentes.

#### 8. EXPLICACIÓN MAESTRA

- **Confirm uno a uno vs en lote vs asíncrono.** Esperar cada confirm (como aquí) es simple y da el error exacto, pero
  limita el rendimiento a un mensaje por ida y vuelta. Publicar un lote y `waitForConfirms()` es más rápido, pero si
  algo falla no sabes cuál y reenvías el lote. Lo habitual en producción: publicar sin esperar y llevar un mapa de
  pendientes por `deliveryTag`, con una ventana máxima en vuelo. Trade-off: latencia por mensaje frente a rendimiento.
- **Al menos una vez, no exactamente una.** Confirms + acks dan **at-least-once**: si el ack del consumidor se pierde,
  el mensaje se reentrega y lo procesarás dos veces; si el confirm se pierde, el publicador reenvía y habrá un
  duplicado en la cola. Por eso la ficha 2 (deduplicación) no es opcional. Exactly-once real no existe entre sistemas;
  existe el **efecto** exactamente una vez (idempotencia).
- **Colas clásicas vs quorum.** Para mensajes que no puedes perder, usa colas **quorum** (replicadas con Raft): el
  confirm llega cuando la mayoría las tiene. Permiten fijar un límite de reentregas (`x-delivery-limit`) para que un
  mensaje venenoso no gire para siempre. Las clásicas son de un nodo.
- **Alternativas:** *Kafka* con `acks=all` y productor idempotente (Módulo 26) para flujos de eventos de alto volumen
  con relectura; *transactional outbox* (Módulo 25) cuando el mensaje debe salir **si y solo si** se guardó un cambio en
  tu base de datos: los confirms no resuelven ese problema (puedes guardar y morir antes de publicar).
- **El ack olvidado.** RabbitMQ cierra el canal de un consumidor que retiene un mensaje sin ack más de
  `consumer_timeout`; antes de eso, con prefetch, el consumidor se queda quieto (error común).
- **Cuándo NO hace falta:** telemetría o métricas que toleran pérdidas (un `publish` sin confirm es más barato), o
  notificaciones que se regeneran solas.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **amqplib 2.4.0** y **RabbitMQ 4.4.1** (imagen `rabbitmq:4.4.1-management`).

`f135-rabbitmq-confirms/topologia.js`:

```javascript
// Módulo 22 · F135 · Topología del ejemplo: exchange «pedidos» → cola «facturacion», con su cola de mensajes muertos.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1 (docker-compose.yml del laboratorio).
export const EXCHANGE = 'f135.pedidos';
export const COLA = 'f135.facturacion';
export const DLX = 'f135.pedidos.dlx';
export const DLQ = 'f135.facturacion.dlq';

export async function declarar(canal) {
  // durable: el exchange y la cola sobreviven a un reinicio del broker (los MENSAJES, solo si son persistentes).
  await canal.assertExchange(EXCHANGE, 'direct', { durable: true });
  await canal.assertExchange(DLX, 'fanout', { durable: true });
  await canal.assertQueue(DLQ, { durable: true });
  await canal.bindQueue(DLQ, DLX, '');
  // Lo que el consumidor rechace con requeue=false va a DLX → DLQ, en lugar de perderse.
  await canal.assertQueue(COLA, { durable: true, deadLetterExchange: DLX });
  await canal.bindQueue(COLA, EXCHANGE, 'pedido.creado');
}

export async function vaciar(canal) {
  await canal.purgeQueue(COLA);
  await canal.purgeQueue(DLQ);
}
```

`f135-rabbitmq-confirms/publicador.js`:

```javascript
// Módulo 22 · F135 · Publisher confirms: el broker CONFIRMA (ack) cada mensaje cuando ya es suyo.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1.
// Sin confirms, publish() solo escribe en el socket: si el broker cae o rechaza, tu código nunca se entera.
import { EXCHANGE } from './topologia.js';

export class MensajeNoConfirmado extends Error {}

export function crearPublicador(canal /* ConfirmChannel: conexion.createConfirmChannel() */) {
  const devueltos = new Map(); // messageId → motivo, de los mensajes que el broker no pudo enrutar
  // mandatory: true pide al broker que DEVUELVA (basic.return) lo que no llega a ninguna cola.
  // RabbitMQ envía el basic.return ANTES que el ack del mismo mensaje: al llegar el ack ya sabemos si volvió.
  canal.on('return', (msg) => devueltos.set(msg.properties.messageId, `${msg.fields.replyCode} ${msg.fields.replyText}`));

  return function publicar(rutaClave, cuerpo, { messageId }) {
    return new Promise((resolver, rechazar) => {
      canal.publish(EXCHANGE, rutaClave, Buffer.from(JSON.stringify(cuerpo)), {
        messageId,                 // identificador estable: el consumidor lo usa para deduplicar (F136)
        persistent: true,          // deliveryMode 2: el broker lo escribe a disco antes de confirmar (en cola durable)
        mandatory: true,
        contentType: 'application/json',
      }, (error) => {
        // Este callback es el CONFIRM: error === null → basic.ack; error → basic.nack (el broker no lo aceptó).
        if (error) return rechazar(new MensajeNoConfirmado(`nack del broker para ${messageId}`));
        const motivo = devueltos.get(messageId);
        devueltos.delete(messageId);
        if (motivo) return rechazar(new MensajeNoConfirmado(`${messageId} no llegó a ninguna cola (${motivo})`));
        resolver(messageId);
      });
    });
  };
}
```

`f135-rabbitmq-confirms/consumidor.js`:

```javascript
// Módulo 22 · F135 · Consumer acknowledgments: el consumidor dice al broker qué hizo con cada mensaje.
//   ack                  → «procesado, bórralo»
//   nack(requeue=true)   → «no pude ahora, devuélvelo a la cola» (un fallo pasajero)
//   nack(requeue=false)  → «no lo voy a poder procesar nunca» → va a la dead letter queue (DLQ)
// Si el consumidor muere SIN responder, el broker lo reentrega a otro consumidor con redelivered=true.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0, RabbitMQ 4.4.1.
export class ErrorPermanente extends Error {} // datos inválidos: reintentar no lo arregla

export async function consumir(canal, cola, procesar, { prefetch = 10, registro = console.log } = {}) {
  // prefetch: cuántos mensajes SIN ack puede tener este consumidor a la vez. Sin él, el broker le envía TODOS.
  await canal.prefetch(prefetch);
  const { consumerTag } = await canal.consume(cola, async (msg) => {
    const id = msg.properties.messageId;
    try {
      await procesar(JSON.parse(msg.content), msg);
      canal.ack(msg);                                   // SOLO después de terminar el trabajo
      registro(`ack   ${id}`);
    } catch (error) {
      const permanente = error instanceof ErrorPermanente || msg.fields.redelivered; // un solo reintento
      canal.nack(msg, false, !permanente);              // (mensaje, allUpTo=false, requeue)
      registro(`nack  ${id} requeue=${!permanente} (${error.message})`);
    }
  }, { noAck: false });                                  // noAck: false = acks manuales (el valor por defecto)
  return consumerTag;
}
```

`f135-rabbitmq-confirms/demo.js`:

```javascript
// Módulo 22 · F135 · Demo: publica con confirms y consume con acks manuales (un éxito, un fallo pasajero,
// un mensaje inválido que acaba en la DLQ y uno que el broker no puede enrutar).
// Ejecuta (con RabbitMQ arriba):  node f135-rabbitmq-confirms/demo.js
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { declarar, vaciar, COLA, DLQ } from './topologia.js';
import { crearPublicador } from './publicador.js';
import { consumir, ErrorPermanente } from './consumidor.js';

const conexion = await amqplib.connect(AMQP_URL);
const canalPub = await conexion.createConfirmChannel();  // canal en modo confirm
const canalCon = await conexion.createChannel();
await declarar(canalPub); await vaciar(canalPub);
const publicar = crearPublicador(canalPub);

let fallosPasajeros = 0;
await consumir(canalCon, COLA, async (pedido) => {
  if (pedido.total <= 0) throw new ErrorPermanente('total inválido');
  if (pedido.id === 'P-2' && fallosPasajeros++ === 0) throw new Error('la base de datos no respondió');
}, { prefetch: 5, registro: (l) => console.log(`consumidor: ${l}`) });

for (const [id, total, ruta] of [['P-1', 100, 'pedido.creado'], ['P-2', 200, 'pedido.creado'], ['P-3', -5, 'pedido.creado'], ['P-4', 50, 'pedido.borrado']]) {
  try {
    await publicar(ruta, { id, total }, { messageId: id });
    console.log(`publicador: ${id} confirmado por el broker`);
  } catch (error) {
    console.log(`publicador: ${error.message}`);
  }
}
await new Promise((r) => setTimeout(r, 300));
const [cola, dlq] = [await canalPub.checkQueue(COLA), await canalPub.checkQueue(DLQ)];
console.log(`colas: ${COLA}=${cola.messageCount} · ${DLQ}=${dlq.messageCount}`);
await conexion.close();
```

#### 10. MINI-LABORATORIO

1. Levanta RabbitMQ y ejecuta la demo:

```bash
docker compose up -d --wait rabbitmq
node f135-rabbitmq-confirms/demo.js
```

**Output esperado** (real, con RabbitMQ 3.12.1 en el entorno de redacción; el orden entre las líneas del publicador y
las del consumidor puede variar porque corren a la vez):

```text
consumidor: ack   P-1
publicador: P-1 confirmado por el broker
consumidor: nack  P-2 requeue=true (la base de datos no respondió)
publicador: P-2 confirmado por el broker
consumidor: ack   P-2
consumidor: nack  P-3 requeue=false (total inválido)
publicador: P-3 confirmado por el broker
publicador: P-4 no llegó a ninguna cola (312 NO_ROUTE)
colas: f135.facturacion=0 · f135.facturacion.dlq=1
```

2. Mira las colas desde el broker:

```bash
docker compose exec rabbitmq rabbitmqctl -q list_queues name messages
```

**Output esperado** (el orden de las filas puede variar):

```text
f135.facturacion.dlq	1
f135.facturacion	0
```

3. Abre la consola `http://localhost:15672` (usuario y clave `academia`) → *Queues and Streams* →
   `f135.facturacion.dlq` → *Get messages*. **Captura comentada:** el mensaje `{"id":"P-3","total":-5}` con la cabecera
   `x-death` (`reason: rejected`, `queue: f135.facturacion`): así sabes de dónde vino y por qué.

*(Los pasos con `docker compose` se ejecutaron en el entorno de redacción con un RabbitMQ 3.12.1 local en lugar de la
imagen 4.4.1; la confirmación con 4.4.1 está en `verificacion/microservicios/pendiente.md`.)*

#### 11. VERIFICACIÓN

Test contra RabbitMQ real (se omite si no responde; con `EXIGIR_INFRA=1` falla):

```javascript
// Módulo 22 · F135 · Verificación contra un RabbitMQ real (AMQP_URL). Si no responde, se OMITE (o FALLA con EXIGIR_INFRA=1).
// Ejecuta: node --test f135-rabbitmq-confirms/confirms.test.js
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { omitirSinInfra } from '../comun/infra.js';
import { declarar, vaciar, COLA, DLQ } from './topologia.js';
import { crearPublicador } from './publicador.js';
import { consumir, ErrorPermanente } from './consumidor.js';

const skip = await omitirSinInfra('RabbitMQ', AMQP_URL, 5672);
let conexion, canal, publicar;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function hasta(condicion, ms = 3000) {
  const limite = Date.now() + ms;
  while (!(await condicion())) { if (Date.now() > limite) throw new Error('tiempo agotado'); await esperar(20); }
}
before(async () => {
  if (skip) return;
  conexion = await amqplib.connect(AMQP_URL);
  canal = await conexion.createConfirmChannel();
  await declarar(canal);
  publicar = crearPublicador(canal);
});
beforeEach(async () => { if (!skip) await vaciar(canal); });
after(async () => { await conexion?.close(); });

test('publish con confirm: la promesa se resuelve cuando el broker tiene el mensaje en la cola', { skip }, async () => {
  assert.equal(await publicar('pedido.creado', { id: 'P-1' }, { messageId: 'P-1' }), 'P-1');
  assert.equal((await canal.checkQueue(COLA)).messageCount, 1);
});

test('mandatory + confirm: un mensaje que no llega a ninguna cola se RECHAZA (312 NO_ROUTE), no se pierde en silencio', { skip }, async () => {
  await assert.rejects(publicar('ruta.sin.cola', { id: 'X' }, { messageId: 'X' }), /X no llegó a ninguna cola \(312 NO_ROUTE\)/);
});

test('ack borra el mensaje; nack(requeue=false) lo manda a la DLQ con la cabecera x-death', { skip }, async () => {
  const c = await conexion.createChannel();
  await consumir(c, COLA, async (p) => { if (p.total < 0) throw new ErrorPermanente('inválido'); }, { registro: () => {} });
  await publicar('pedido.creado', { id: 'ok', total: 1 }, { messageId: 'ok' });
  await publicar('pedido.creado', { id: 'mal', total: -1 }, { messageId: 'mal' });
  await hasta(async () => (await canal.checkQueue(DLQ)).messageCount === 1);
  await c.close();
  assert.equal((await canal.checkQueue(COLA)).messageCount, 0);
  const muerto = await canal.get(DLQ, { noAck: true });
  assert.equal(muerto.properties.messageId, 'mal');
  assert.equal(muerto.properties.headers['x-death'][0].reason, 'rejected');
});

test('fallo pasajero: nack(requeue=true) y el broker lo reentrega con redelivered=true', { skip }, async () => {
  const c = await conexion.createChannel();
  const entregas = [];
  await consumir(c, COLA, async (_p, msg) => {
    entregas.push(msg.fields.redelivered);
    if (entregas.length === 1) throw new Error('pasajero');
  }, { registro: () => {} });
  await publicar('pedido.creado', { id: 'P-9', total: 1 }, { messageId: 'P-9' });
  await hasta(() => entregas.length === 2);
  await c.close();
  assert.deepEqual(entregas, [false, true]);
});

test('si el consumidor muere sin ack, el broker reentrega el mensaje a otro consumidor', { skip }, async () => {
  await publicar('pedido.creado', { id: 'P-7', total: 1 }, { messageId: 'P-7' });
  const c1 = await conexion.createChannel();
  let recibido = false;
  await c1.consume(COLA, () => { recibido = true; }, { noAck: false }); // recibe y «se cuelga»: nunca hace ack
  await hasta(() => recibido);
  await c1.close();                                                      // muere: el mensaje vuelve a la cola
  const c2 = await conexion.createChannel();
  let msg;
  await hasta(async () => (msg = await c2.get(COLA, { noAck: false })) !== false);
  assert.equal(msg.properties.messageId, 'P-7');
  assert.equal(msg.fields.redelivered, true);
  c2.ack(msg);
  await c2.close();
});
```

```bash
node --test f135-rabbitmq-confirms/confirms.test.js
```

**Output esperado:** `ℹ tests 5` y `ℹ pass 5`.

**Pregunta de comprobación:** si publicas con `mandatory: false` a una clave sin cola, ¿qué recibe el callback del
confirm? (Un ack normal: el broker confirmó y el mensaje se descartó en silencio.)

#### 12. ERROR COMÚN

**Síntoma:** el consumidor procesa unos pocos mensajes al arrancar y luego **se queda quieto**, sin errores, mientras
la cola crece. **Causa:** falta el `ack`. Con `prefetch(5)`, el broker entrega 5 mensajes y espera; como nunca llega
el ack, no entrega más.

```javascript
// Módulo 22 · F135 · Error común: olvidar el ack con prefetch. El consumidor recibe `prefetch` mensajes y se queda
// QUIETO: el broker no le envía más hasta que confirme alguno. No hay error ni log: la cola simplemente crece.
// Ejecuta (con RabbitMQ arriba):  node f135-rabbitmq-confirms/error-comun.js
import amqplib from 'amqplib';
import { AMQP_URL } from '../comun/config.js';
import { declarar, vaciar, EXCHANGE, COLA } from './topologia.js';

const conexion = await amqplib.connect(AMQP_URL);
const canal = await conexion.createConfirmChannel();
await declarar(canal); await vaciar(canal);
for (let i = 1; i <= 10; i++) canal.publish(EXCHANGE, 'pedido.creado', Buffer.from(`{"id":"P-${i}"}`), { persistent: true });
await canal.waitForConfirms();

const consumidor = await conexion.createChannel();
await consumidor.prefetch(5);
let recibidos = 0;
await consumidor.consume(COLA, (msg) => {
  recibidos++;
  // ... se procesa el pedido ...
  // MAL: falta consumidor.ack(msg)
}, { noAck: false });

await new Promise((r) => setTimeout(r, 1000));
const { messageCount } = await canal.checkQueue(COLA);
console.log(`publicados: 10 · recibidos por el consumidor: ${recibidos} · listos en la cola: ${messageCount}`);
console.log(`→ ${recibidos} mensajes «unacked» bloquean al consumidor; con prefetch=5 no recibirá nada más`);
await conexion.close(); // al cerrar, los 5 sin ack vuelven a la cola (no se pierden)
```

Salida real de `node f135-rabbitmq-confirms/error-comun.js`:

```text
publicados: 10 · recibidos por el consumidor: 5 · listos en la cola: 5
→ 5 mensajes «unacked» bloquean al consumidor; con prefetch=5 no recibirá nada más
```

**Diagnóstico visual:** en la consola de RabbitMQ, la cola muestra **Unacked = 5** (igual al prefetch) y **Ready**
creciendo, con un consumidor conectado que no avanza. Por CLI: `rabbitmqctl list_queues name messages_ready
messages_unacknowledged`. **Arreglo:** `canal.ack(msg)` al terminar (y `nack` en el `catch`), como en
`consumidor.js`. Sin prefetch, el mismo error es peor: el consumidor acumula **toda** la cola en memoria.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo garantizas que un mensaje no se pierde entre un productor, RabbitMQ y un consumidor?**

**Respuesta modelo:** cubro los tres tramos. Del productor al broker, con publisher confirms: solo considero enviado
un mensaje cuando el broker lo confirma, y lo publico persistente en un exchange y una cola durables, mejor una cola
quorum para que el confirm signifique que está replicado; con `mandatory` detecto los mensajes sin ruta, que si no se
confirman igualmente y se pierden en silencio. En el broker, durabilidad y réplicas. Del broker al consumidor, acks
manuales después de terminar el trabajo, con prefetch para limitar lo que tiene en vuelo; si el consumidor muere, el
broker reentrega. Los errores pasajeros se reencolan con un límite y los permanentes van a una dead letter queue que
alguien vigila. Esto da al menos una entrega, así que el consumidor tiene que ser idempotente o deduplicar por
`messageId`. Y si el mensaje nace de un cambio en mi base de datos, uso outbox, porque los confirms no evitan que guarde
el cambio y muera antes de publicar.

#### 14. ANTI-PATRÓN RELACIONADO

**`noAck: true` («auto-ack») en un consumidor que hace trabajo importante.** Evítalo: el broker borra el mensaje en
cuanto lo **envía**, antes de que lo proceses. Si el proceso muere a mitad, el mensaje se pierde sin rastro.

```javascript
// MAL: el mensaje se da por entregado al salir del broker; un fallo durante el cobro lo pierde.
await canal.consume(COLA, async (msg) => { await cobrar(JSON.parse(msg.content)); }, { noAck: true });

// BIEN: ack manual al terminar; si algo falla, nack (reintento o DLQ) (consumidor.js).
await canal.consume(COLA, async (msg) => {
  try { await cobrar(JSON.parse(msg.content)); canal.ack(msg); } catch { canal.nack(msg, false, !msg.fields.redelivered); }
}, { noAck: false });
```

---

### Deduplicación con Redis

#### 1. UBICACIÓN

Módulo 22, Lección 2 de 7 · Fase 2 · Laboratorio `examples/microservicios/modulo-26/f136-dedup-redis/`.

#### 2. PRERREQUISITOS

- Ficha 1 (al menos una entrega, `messageId`).
- Redis: claves, `GET`, `SET`, `EXPIRE` y el cliente `redis` de Node (Módulo 19, ficha «Rate Limiting con Redis»).
- `Promise.all` y concurrencia en Node (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** un consumidor que procesa cada mensaje **una sola vez** aunque llegue repetido, usando `SET NX EX` de
Redis como marca atómica, y **demostrar** que 10 copias simultáneas producen un solo efecto y que un fallo no deja el
mensaje marcado como hecho. Lo compruebas cuando `dedup.test.js` pasa 5 de 5 contra un Redis real.

#### 4. ANALOGÍA VISUAL

Dibuja la **entrada de un concierto** con un lector de boletas. Cada boleta tiene un código único. Al pasarla, el
lector la marca como usada **en el mismo gesto en que la valida**: si dos personas con fotocopias de la misma boleta
llegan a la vez a dos puertas, una entra y la otra ve «ya usada». Si el lector primero **mirara** si está usada y
**después** la marcara, las dos fotocopias entrarían en ese segundo de diferencia. Y las marcas no se guardan para
siempre: una semana después del concierto se borran.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TD
    M["mensaje llega<br/>messageId = P-1"] --> S{"SET dedup:facturacion:P-1 en-curso NX EX 30"}
    S -- "OK (gané)" --> T["procesar (cobrar)"]
    T -- éxito --> H["SET … hecho EX 604800"] --> A["ack"]
    T -- error --> DEL["DEL clave"] --> N["nack → reentrega"]
    S -- "null (ya existía)" --> G{"GET clave"}
    G -- hecho --> D["duplicado: ack sin procesar"]
    G -- en-curso --> R["otro consumidor lo tiene:<br/>nack con requeue"]
```

**Texto alternativo:** diagrama de flujo de la deduplicación. Llega un mensaje con messageId P-1 y se ejecuta SET de la
clave dedup:facturacion:P-1 con valor en-curso, NX y caducidad de 30 segundos. Si responde OK, se procesa: con éxito se
guarda el valor hecho con caducidad de una semana y se hace ack; con error se borra la clave y se hace nack para que se
reentregue. Si el SET devuelve null porque la clave existía, se lee: si vale hecho, es un duplicado y se hace ack sin
procesar; si vale en-curso, otro consumidor lo está procesando y se hace nack con requeue.

#### 6. EXPLICACIÓN NIVEL 0

- En la ficha 1 viste que un mensaje **puede llegar dos veces** (por ejemplo, si se pierde el «ya lo procesé»).
- Si el mensaje es «cobrar 100 a Ana», procesarlo dos veces es un cobro doble.
- La solución: anotar en una libreta compartida (**Redis**) qué mensajes ya procesaste, usando su identificador. Antes
  de procesar, miras la libreta.
- El truco está en **mirar y anotar a la vez**, con una sola orden de Redis, para que dos copias que llegan juntas no
  pasen las dos.

#### 7. EXPLICACIÓN INTERMEDIA

- **`SET clave valor NX EX segundos`**: escribe **solo si no existe** (`NX`) y con caducidad (`EX`), en una operación
  atómica. Redis ejecuta los comandos de uno en uno, así que entre N intentos simultáneos exactamente uno recibe `OK` y
  los demás `null`. En node-redis 6.3.1: `redis.set(clave, 'en-curso', { condition: 'NX', expiration: { type: 'EX',
  value: 30 } })`.
- **Dos estados:** `en-curso` con TTL corto (si el proceso muere, la marca caduca y otro puede reintentar) y `hecho`
  con TTL largo, la **ventana de deduplicación** (aquí una semana). Duplicados que lleguen después de la ventana no se
  detectan: elige la ventana mayor que el tiempo máximo de reentrega de tu broker.
- **Si el trabajo falla:** `DEL` la clave y relanza el error, para que el `nack` provoque una reentrega que sí se
  procese.
- **Clave:** incluye el **consumidor** (`dedup:facturacion:P-1`): el mismo evento lo procesan facturación y envíos, y
  cada uno debe deduplicar por su cuenta.
- **El `messageId` lo pone el productor** (ficha 1) y debe ser estable en los reintentos: un id nuevo en cada reenvío
  anula la deduplicación.

#### 8. EXPLICACIÓN MAESTRA

- **El hueco que queda.** Entre «terminé el trabajo» y `SET hecho` el proceso puede morir: la marca `en-curso` caduca,
  el mensaje se reentrega y el trabajo se repite. La marca en Redis **no está en la misma transacción** que el efecto.
  Si el efecto es en tu base de datos, la solución robusta es el **patrón inbox**: guardar el `messageId` en una tabla
  con clave única **en la misma transacción** que el cambio de negocio. Redis es más rápido y sirve a varios servicios,
  la tabla inbox es exacta. Trade-off: velocidad y sencillez frente a garantía.
- **Idempotencia natural vs deduplicación.** Mejor que deduplicar es que la operación sea idempotente por diseño
  («dejar el pedido en estado PAGADO» en vez de «sumar 100»; ficha 4). La deduplicación es la red cuando la operación no
  lo es (enviar un correo, llamar a una pasarela).
- **Alternativas:** clave de idempotencia en la API de destino (muchas pasarelas de pago la aceptan), restricción
  `UNIQUE` en la base de datos, o la deduplicación del broker (Kafka con productor idempotente evita duplicados **en el
  log**, no en tu consumidor).
- **Redis como dependencia.** Si Redis no responde, decide: ¿paras de consumir (seguro) o procesas sin deduplicar
  (riesgo de duplicado)? Para cobros, para. Y usa Redis con persistencia y réplica si la ventana es larga, o perderás
  las marcas en un reinicio.
- **Cuándo NO usarlo:** operaciones ya idempotentes (un `PUT` de estado), consumidores que escriben en una base de datos
  donde puedes usar inbox, o volúmenes donde la ventana de marcas no cabe en memoria.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **redis (node-redis) 6.3.1** y **Redis 8.10.2** (imagen `redis:8.10.2-alpine`).

`f136-dedup-redis/dedup.js`:

```javascript
// Módulo 22 · F136 · Deduplicación con Redis: procesar cada mensaje UNA vez aunque llegue varias (at-least-once).
// Requisitos: Node.js 26.13.1 LTS, redis (node-redis) 6.3.1, Redis 8.10.2.
//
// Clave dedup:<consumidor>:<messageId> con dos estados:
//   «en-curso» (TTL corto)  → alguien lo está procesando ahora; si muere, la clave caduca y otro puede reintentar
//   «hecho»    (TTL largo)  → ya se procesó: cualquier copia posterior se descarta
// SET ... NX es ATÓMICO: de N consumidores que lo intentan a la vez, exactamente uno gana.
export class EnCursoEnOtroLado extends Error {}

export async function procesarUnaVez(redis, { consumidor, messageId }, trabajo,
  { ttlEnCursoSeg = 30, ttlHechoSeg = 7 * 24 * 3600 } = {}) {
  const clave = `dedup:${consumidor}:${messageId}`;
  // SET clave en-curso NX EX 30 → 'OK' si no existía; null si ya existía (otra copia llegó antes).
  const gane = await redis.set(clave, 'en-curso', { condition: 'NX', expiration: { type: 'EX', value: ttlEnCursoSeg } });
  if (gane === null) {
    const estado = await redis.get(clave);
    if (estado === 'hecho') return { estado: 'duplicado' };
    throw new EnCursoEnOtroLado(`${messageId} se está procesando en otro consumidor`); // → nack con requeue
  }
  try {
    const resultado = await trabajo();
    await redis.set(clave, 'hecho', { expiration: { type: 'EX', value: ttlHechoSeg } }); // la ventana de deduplicación
    return { estado: 'procesado', resultado };
  } catch (error) {
    await redis.del(clave); // falló: libera la clave para que la reentrega lo intente de nuevo
    throw error;
  }
}
```

`f136-dedup-redis/demo.js`:

```javascript
// Módulo 22 · F136 · Demo: RabbitMQ (at-least-once) entrega dos veces el pedido P-1; el cobro se hace UNA vez.
// Ejecuta (con Redis arriba):  node f136-dedup-redis/demo.js
import { createClient } from 'redis';
import { REDIS_URL } from '../comun/config.js';
import { procesarUnaVez } from './dedup.js';

const redis = await createClient({ url: REDIS_URL }).connect();
await redis.del(['dedup:facturacion:P-1', 'dedup:facturacion:P-2']);
const cobros = [];
const cobrar = (id, total) => async () => { cobros.push(id); return `cobrados ${total}`; };

// Entregas tal como podrían llegar: P-1 se reentrega porque el ack anterior se perdió en la red.
for (const [id, total] of [['P-1', 100], ['P-2', 50], ['P-1', 100]]) {
  const r = await procesarUnaVez(redis, { consumidor: 'facturacion', messageId: id }, cobrar(id, total));
  console.log(`${id} → ${r.estado}${r.resultado ? ` (${r.resultado})` : ''}`);
}
console.log(`cobros reales: ${cobros.join(', ')}`);
console.log(`TTL de dedup:facturacion:P-1 = ${await redis.ttl('dedup:facturacion:P-1')} s · valor = ${await redis.get('dedup:facturacion:P-1')}`);
await redis.close();
```

En un consumidor de RabbitMQ (ficha 1), `procesarUnaVez` va dentro del manejador: `procesar = (pedido, msg) =>
procesarUnaVez(redis, { consumidor: 'facturacion', messageId: msg.properties.messageId }, () => cobrar(pedido))`; un
`duplicado` termina en `ack` y un `EnCursoEnOtroLado` en `nack` con reencolado.

#### 10. MINI-LABORATORIO

1. Levanta Redis y ejecuta la demo:

```bash
docker compose up -d --wait redis
node f136-dedup-redis/demo.js
```

**Output esperado** (real, con Redis 7.0.15 en el entorno de redacción):

```text
P-1 → procesado (cobrados 100)
P-2 → procesado (cobrados 50)
P-1 → duplicado
cobros reales: P-1, P-2
TTL de dedup:facturacion:P-1 = 604800 s · valor = hecho
```

2. Mira la marca desde Redis:

```bash
docker compose exec redis redis-cli --scan --pattern 'dedup:*'
docker compose exec redis redis-cli TTL dedup:facturacion:P-1
```

**Output esperado:** las claves `dedup:facturacion:P-1` y `dedup:facturacion:P-2` (en cualquier orden) y un TTL
cercano a `604800` que baja cada segundo.

3. Compara la versión ingenua con la atómica: `node f136-dedup-redis/error-comun.js` (salida en el punto 12).

*(Con `redis:8.10.2-alpine` está en `verificacion/microservicios/pendiente.md`.)*

#### 11. VERIFICACIÓN

```javascript
// Módulo 22 · F136 · Verificación contra un Redis real (REDIS_URL). Si no responde, se OMITE (o FALLA con EXIGIR_INFRA=1).
// Ejecuta: node --test f136-dedup-redis/dedup.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from 'redis';
import { REDIS_URL } from '../comun/config.js';
import { omitirSinInfra } from '../comun/infra.js';
import { procesarUnaVez, EnCursoEnOtroLado } from './dedup.js';
import { procesarUnaVezMal } from './error-comun.js';

const skip = await omitirSinInfra('Redis', REDIS_URL, 6379);
let redis;
const id = () => `t-${process.pid}-${Math.random().toString(36).slice(2)}`;
before(async () => { if (!skip) redis = await createClient({ url: REDIS_URL }).connect(); });
after(async () => { await redis?.close(); });

test('la segunda entrega del mismo messageId se descarta', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  let veces = 0;
  assert.equal((await procesarUnaVez(redis, m, async () => ++veces)).estado, 'procesado');
  assert.equal((await procesarUnaVez(redis, m, async () => ++veces)).estado, 'duplicado');
  assert.equal(veces, 1);
});

test('10 entregas SIMULTÁNEAS: SET NX deja pasar exactamente una', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  let veces = 0;
  const lento = async () => { veces++; await new Promise((r) => setTimeout(r, 50)); };
  const r = await Promise.allSettled(Array.from({ length: 10 }, () => procesarUnaVez(redis, m, lento)));
  assert.equal(veces, 1);
  assert.equal(r.filter((x) => x.status === 'fulfilled').length, 1);
  assert.ok(r.filter((x) => x.status === 'rejected').every((x) => x.reason instanceof EnCursoEnOtroLado));
});

test('si el trabajo falla, la clave se borra y la reentrega SÍ se procesa', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  await assert.rejects(procesarUnaVez(redis, m, async () => { throw new Error('cobro caído'); }), /cobro caído/);
  assert.equal((await procesarUnaVez(redis, m, async () => 'ok')).estado, 'procesado');
});

test('la marca «hecho» tiene caducidad: la ventana de deduplicación no crece para siempre', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  await procesarUnaVez(redis, m, async () => {}, { ttlHechoSeg: 60 });
  const ttl = await redis.ttl(`dedup:test:${m.messageId}`);
  assert.ok(ttl > 0 && ttl <= 60, `TTL=${ttl}`);
});

test('error común: GET y luego SET (no atómico) deja pasar varias copias simultáneas', { skip }, async () => {
  const m = { consumidor: 'test', messageId: id() };
  let veces = 0;
  await Promise.all(Array.from({ length: 10 }, () => procesarUnaVezMal(redis, m, async () => { veces++; })));
  assert.ok(veces > 1, `procesado ${veces} veces`);
});
```

```bash
node --test f136-dedup-redis/dedup.test.js
```

**Output esperado:** `ℹ tests 5` y `ℹ pass 5`.

**Pregunta de comprobación:** ¿qué pasaría si `ttlEnCursoSeg` fuera más corto que lo que tarda el trabajo?

#### 12. ERROR COMÚN

**Síntoma:** con una sola réplica no hay cobros dobles; al escalar a cinco, tras una reentrega masiva aparecen cobros
duplicados «aunque deduplicamos». **Causa:** la comprobación se hace con `GET` y la marca con `SET` en **dos pasos**:
todas las copias leen «no existe» antes de que la primera escriba.

```javascript
// Módulo 22 · F136 · Error común: comprobar con GET y marcar con SET en dos pasos. Entre uno y otro hay un hueco:
// las copias que llegan a la vez ven «no existe» y TODAS procesan. Además, marcar ANTES del trabajo sin
// borrar al fallar perdería el mensaje si el proceso muere a mitad.
// Ejecuta (con Redis arriba):  node f136-dedup-redis/error-comun.js
import { createClient } from 'redis';
import { REDIS_URL } from '../comun/config.js';

export async function procesarUnaVezMal(redis, { consumidor, messageId }, trabajo) {
  const clave = `dedup:${consumidor}:${messageId}`;
  if (await redis.get(clave)) return { estado: 'duplicado' };   // 1) ¿ya está?
  await trabajo();                                              // 2) proceso…
  await redis.set(clave, 'hecho', { expiration: { type: 'EX', value: 3600 } }); // 3) …y marco. Demasiado tarde.
  return { estado: 'procesado' };
}

if (import.meta.main) {
  const redis = await createClient({ url: REDIS_URL }).connect();
  await redis.del('dedup:facturacion:P-1');
  let cobros = 0;
  // 5 copias del mismo mensaje llegan a la vez (5 réplicas del consumidor tras una reentrega masiva).
  await Promise.all(Array.from({ length: 5 }, () => procesarUnaVezMal(redis, { consumidor: 'facturacion', messageId: 'P-1' }, async () => { cobros++; })));
  console.log(`GET + SET: 5 copias simultáneas de P-1 → ${cobros} cobros`);
  await redis.del('dedup:facturacion:P-1');
  const { procesarUnaVez } = await import('./dedup.js');
  cobros = 0;
  await Promise.allSettled(Array.from({ length: 5 }, () => procesarUnaVez(redis, { consumidor: 'facturacion', messageId: 'P-1' }, async () => { cobros++; })));
  console.log(`SET NX:    5 copias simultáneas de P-1 → ${cobros} cobro`);
  await redis.close();
}
```

Salida real de `node f136-dedup-redis/error-comun.js`:

```text
GET + SET: 5 copias simultáneas de P-1 → 5 cobros
SET NX:    5 copias simultáneas de P-1 → 1 cobro
```

**Diagnóstico visual:** en los logs (Módulo 21), filtra por `messageId`: varias líneas «procesado» con el mismo id y
milisegundos de diferencia, desde réplicas distintas. En Redis, `MONITOR` (solo en desarrollo) muestra `GET` y `SET`
intercalados de varias conexiones. **Arreglo:** una sola orden atómica, `SET … NX`, como en `dedup.js`.

#### 13. PREGUNTA DE ENTREVISTA

**Tu consumidor recibe mensajes duplicados. ¿Cómo evitas procesarlos dos veces?**

**Respuesta modelo:** primero acepto que con at-least-once habrá duplicados y que exactly-once entre sistemas no existe,
así que busco que el **efecto** ocurra una vez. Lo mejor es que la operación sea idempotente por diseño, fijando un
estado en vez de sumar. Si no lo es, deduplico por un id estable que pone el productor. Con Redis uso `SET clave NX EX`,
que es atómico: un estado «en curso» con caducidad corta para que una caída no bloquee el mensaje y un «hecho» con la
ventana de deduplicación; si el trabajo falla, borro la marca para permitir el reintento. La clave incluye el
consumidor. Sé que queda un hueco entre terminar y marcar, así que si el efecto va a mi base de datos uso una tabla
inbox con clave única en la misma transacción. Nunca hago `GET` y luego `SET`, porque entre los dos se cuelan las
copias concurrentes.

#### 14. ANTI-PATRÓN RELACIONADO

**Marcar como procesado ANTES de hacer el trabajo, sin caducidad ni limpieza.** Evítalo: si el proceso muere después
de marcar, el mensaje se reentrega, ve la marca «hecho» y se descarta. Has cambiado un duplicado por una **pérdida**.

```javascript
// MAL: la marca es definitiva antes de cobrar; si cobrar() revienta, el reintento lo da por hecho.
if (await redis.set(clave, 'hecho', { condition: 'NX' })) await cobrar(pedido);

// BIEN: «en-curso» con TTL corto, «hecho» solo al terminar y DEL si falla (dedup.js).
const r = await procesarUnaVez(redis, { consumidor: 'facturacion', messageId }, () => cobrar(pedido));
```

---

### Sagas con NestJS CQRS

#### 1. UBICACIÓN

Módulo 22, Lección 3 de 7 · Fase 2 · Laboratorio `examples/microservicios/modulo-26/f137-sagas-nestjs/`.

#### 2. PRERREQUISITOS

- NestJS: módulos, providers e inyección de dependencias (Módulo 14, ficha «NestJS»).
- Observables de rxjs a nivel de `pipe`, `map` y `filter`.
- Comandos y eventos (Módulo 18, «sync vs async»).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** una saga coreografiada con `@nestjs/cqrs` que reacciona a eventos (`@Saga()`), ejecuta el comando del
paso siguiente y, si un paso falla, ejecuta la **compensación** de los anteriores, y **demostrar** con tests los tres
caminos (feliz, fallo sin compensar y fallo con compensación). Lo compruebas cuando `saga.test.js` pasa 4 de 4.

#### 4. ANALOGÍA VISUAL

Dibuja una **agencia de viajes** que te arma un paquete: vuelo, hotel y tour. No puede reservar los tres «a la vez»
en una sola operación, porque son tres empresas distintas. Reserva el vuelo; con la confirmación en la mano, reserva el
hotel; con esa, el tour. Si el tour está agotado, **no puede borrar el pasado**: llama al hotel para **cancelar** y a
la aerolínea para **anular** el vuelo (compensaciones). Encima de la mesa tiene una **hoja de ruta** que dice «si llega
la confirmación del vuelo, pide el hotel; si el tour falla, cancela el hotel»: esa hoja es la saga.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    C["CrearPedido"] --> E1(["PedidoCreado"])
    E1 -- saga --> C2["ReservarStock"]
    C2 --> E2(["StockReservado"])
    C2 --> E2b(["StockAgotado"])
    E2 -- saga --> C3["CobrarPago"]
    C3 --> E3(["PagoAceptado"])
    C3 --> E3b(["PagoRechazado"])
    E3 -- saga --> C4["ConfirmarPedido"] --> E4(["PedidoConfirmado"])
    E3b -- "saga (compensación)" --> C5["LiberarStock"] --> E5(["StockLiberado"])
    E5 -- saga --> C6["CancelarPedido"]
    E2b -- saga --> C6
    C6 --> E6(["PedidoCancelado"])
```

**Texto alternativo:** flujo de la saga de pedidos. CrearPedido produce PedidoCreado, al que la saga responde con
ReservarStock. ReservarStock produce StockReservado o StockAgotado. Con StockReservado, la saga envía CobrarPago, que
produce PagoAceptado o PagoRechazado. PagoAceptado lleva a ConfirmarPedido y a PedidoConfirmado. PagoRechazado lleva a la
compensación LiberarStock, que produce StockLiberado, y la saga entonces envía CancelarPedido. StockAgotado también lleva
a CancelarPedido, sin compensar nada. CancelarPedido produce PedidoCancelado.

#### 6. EXPLICACIÓN NIVEL 0

- Comprar en una tienda online toca varios servicios: **inventario** (apartar el producto), **pagos** (cobrar) y
  **pedidos** (confirmar). Cada uno tiene su propia base de datos.
- No existe un botón «hazlo todo o nada» entre bases de datos distintas. Entonces se hace **paso a paso**, y cada paso
  tiene su **deshacer**.
- Si el cobro falla después de apartar el producto, hay que **devolver el producto al estante**. Eso es una
  **compensación**.
- Una **saga** es la receta que dice qué paso sigue cuando uno sale bien y qué deshacer cuando uno sale mal.

#### 7. EXPLICACIÓN INTERMEDIA

- **@nestjs/cqrs** trae tres buses: `CommandBus` (órdenes: «reserva stock»), `EventBus` (hechos: «stock reservado») y
  `QueryBus` (ficha 7). `CqrsModule.forRoot()` los registra y, al arrancar, conecta los `@CommandHandler` y las sagas de
  los providers del módulo.
- **Comando:** una clase que extiende `Command<R>` (`R` es lo que devuelve `commandBus.execute`); su manejador
  implementa `ICommandHandler` con `execute()`. Un comando tiene **un** manejador.
- **Evento:** una clase con los datos del hecho, en pasado; la publica el manejador con `eventBus.publish(evento)`.
  Puede tener muchos oyentes.
- **Saga:** una propiedad decorada con `@Saga()` que recibe el flujo (Observable) de **todos** los eventos y devuelve
  un flujo de comandos: `eventos$.pipe(ofType(PagoRechazado), map((e) => new LiberarStock(e.pedidoId)))`. Nest ejecuta
  cada comando emitido en el `CommandBus`.
- **Compensación:** un comando más (`LiberarStock`) que deshace el efecto de un paso anterior; debe ser idempotente
  (ficha 4). Solo se compensa lo que se hizo: con `StockAgotado` no hay nada que liberar.
- **El evento lleva lo necesario** para el paso siguiente (`StockReservado` lleva el `total`), así la saga no consulta
  nada y queda como una tabla «evento → comando».
- **Detalle del bus en memoria:** `publish()` llama a las sagas **sincrónicamente**. Si ningún manejador hace `await`,
  toda la cadena ocurre dentro del primer `publish()` y un oyente suscrito después ve los eventos al revés. En el
  laboratorio los servicios simulan la red con `await` y el orden se ve causal.

#### 8. EXPLICACIÓN MAESTRA

- **Coreografía vs orquestación.** Esta saga es **coreografía**: cada paso reacciona a eventos y nadie guarda «en qué
  paso va el pedido». Escala bien con pocos pasos, pero el flujo queda repartido y es difícil de ver. La
  **orquestación** (Temporal.io, Módulo 25; Camunda; AWS Step Functions) pone un coordinador con estado que llama a cada
  paso, reintenta y compensa, con historial y tiempos de espera. Trade-off: menos piezas frente a visibilidad y
  durabilidad.
- **Lo que @nestjs/cqrs NO te da:** el `EventBus` por defecto vive **en memoria del proceso**. Si el proceso muere entre
  `StockReservado` y `CobrarPago`, la saga se pierde: nada recuerda que había stock reservado. Para producción, los
  eventos tienen que salir a un broker durable (un `eventPublisher` propio que publique en RabbitMQ o Kafka, con outbox)
  y la saga necesita **estado persistido** y **tiempos límite** («si no hay respuesta del pago en 10 minutos,
  compensa»). Esta ficha enseña el modelo; el Módulo 25 lo hace durable con Temporal.
- **Errores dentro de la saga.** Por defecto (`sagaErrorStrategy: 'complete'`), una excepción en el flujo de una saga
  la **termina**: Nest la registra una vez y deja de escuchar (error común). `'resubscribe'` se vuelve a suscribir con
  espera creciente, pero pierde los eventos de mientras. Lo correcto es no lanzar dentro del `pipe` y validar en los
  manejadores.
- **Aislamiento.** Mientras la saga corre, otros ven estados intermedios (stock reservado de un pedido que se va a
  cancelar). Es la «I» que pierdes respecto a una transacción ACID; se mitiga con estados explícitos (`PENDIENTE`) y
  reservas con caducidad.
- **Cuándo NO usar una saga:** si los datos pueden vivir en **un solo servicio** con una transacción local, hazlo así.
  Una saga para algo que cabía en una transacción es el anti-patrón «sagas innecesarias» del Módulo 30.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **TypeScript 6.0.3**, **@nestjs/core 12.5.1**, **@nestjs/cqrs 12.1.3**, **rxjs
7.8.2** y **reflect-metadata 0.2.2**. Se compila con `npm run build` (`tsconfig.json` con `experimentalDecorators` y
`emitDecoratorMetadata`, que NestJS necesita):

```json
{
  // Módulo 22 · NestJS 12.5.1 + @nestjs/cqrs 12.1.3 con TypeScript 6.0.3. Compila F137 y F141 a dist/ (npm run build).
  // NestJS necesita decoradores «experimentales» y emitDecoratorMetadata (lee los tipos de los constructores para
  // inyectar dependencias). Node 26 no sabe quitar decoradores por sí solo (type stripping): por eso se compila con tsc.
  "compilerOptions": {
    "target": "es2024",
    "module": "nodenext",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false,
    "outDir": "dist",
    "rootDir": ".",
    "sourceMap": true,
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["f137-sagas-nestjs/src", "f141-cqrs/src"]
}
```

`f137-sagas-nestjs/src/mensajes.ts`:

```typescript
// Módulo 22 · F137 · Comandos (órdenes: «haz esto») y eventos (hechos: «esto pasó») de la saga de pedidos.
// Requisitos: Node.js 26.13.1 LTS, @nestjs/cqrs 12.1.3, TypeScript 6.0.3.
import { Command } from '@nestjs/cqrs';
import type { IEvent } from '@nestjs/cqrs';

// ---- Comandos: Command<R> declara qué devuelve commandBus.execute() (aquí, nada) ----
export class CrearPedido extends Command<void> {
  constructor(readonly pedidoId: string, readonly sku: string, readonly cantidad: number, readonly total: number) { super(); }
}
export class ReservarStock extends Command<void> {
  // total viaja con el comando para que el evento StockReservado lo lleve al paso siguiente (cobrar)
  constructor(readonly pedidoId: string, readonly sku: string, readonly cantidad: number, readonly total: number) { super(); }
}
export class CobrarPago extends Command<void> {
  constructor(readonly pedidoId: string, readonly total: number) { super(); }
}
export class LiberarStock extends Command<void> { // COMPENSACIÓN de ReservarStock
  constructor(readonly pedidoId: string) { super(); }
}
export class ConfirmarPedido extends Command<void> {
  constructor(readonly pedidoId: string) { super(); }
}
export class CancelarPedido extends Command<void> {
  constructor(readonly pedidoId: string, readonly motivo: string) { super(); }
}

// ---- Eventos: en pasado; la saga reacciona a ellos ----
export class PedidoCreado implements IEvent {
  constructor(readonly pedidoId: string, readonly sku: string, readonly cantidad: number, readonly total: number) {}
}
export class StockReservado implements IEvent { constructor(readonly pedidoId: string, readonly total: number) {} }
export class StockAgotado implements IEvent { constructor(readonly pedidoId: string) {} }
export class PagoAceptado implements IEvent { constructor(readonly pedidoId: string) {} }
export class PagoRechazado implements IEvent { constructor(readonly pedidoId: string, readonly motivo: string) {} }
export class StockLiberado implements IEvent { constructor(readonly pedidoId: string, readonly motivo: string) {} }
export class PedidoConfirmado implements IEvent { constructor(readonly pedidoId: string) {} }
export class PedidoCancelado implements IEvent { constructor(readonly pedidoId: string, readonly motivo: string) {} }
```

`f137-sagas-nestjs/src/servicios.ts`:

```typescript
// Módulo 22 · F137 · Los «servicios remotos» de la saga, en memoria para que el laboratorio corra sin infraestructura.
// En un sistema real, cada uno sería otro microservicio al otro lado de RabbitMQ o HTTP (Módulos 18 y 22).
import { Injectable } from '@nestjs/common';
import { setTimeout as esperar } from 'node:timers/promises';

// Simula la latencia de red de un servicio remoto. Además hace que cada paso termine en OTRO turno del event loop:
// sin ningún await, el EventBus en memoria encadenaría toda la saga dentro del primer publish() (ver la ficha).
const red = () => esperar(2);

@Injectable()
export class InventarioService {
  readonly stock = new Map<string, number>([['TEC-1', 5], ['MOU-1', 0]]);
  readonly reservas = new Map<string, { sku: string; cantidad: number }>(); // pedidoId → reserva

  async reservar(pedidoId: string, sku: string, cantidad: number): Promise<boolean> {
    await red();
    if (this.reservas.has(pedidoId)) return true;          // idempotente: la misma reserva no descuenta dos veces
    const disponibles = this.stock.get(sku) ?? 0;
    if (disponibles < cantidad) return false;
    this.stock.set(sku, disponibles - cantidad);
    this.reservas.set(pedidoId, { sku, cantidad });
    return true;
  }

  // Compensación idempotente (F138): devuelve lo reservado SOLO si la reserva existe, y la borra.
  async liberar(pedidoId: string): Promise<void> {
    await red();
    const reserva = this.reservas.get(pedidoId);
    if (!reserva) return;
    this.stock.set(reserva.sku, (this.stock.get(reserva.sku) ?? 0) + reserva.cantidad);
    this.reservas.delete(pedidoId);
  }
}

@Injectable()
export class PagosService {
  limite = 1_000_000; // la pasarela rechaza cobros mayores (así provocamos el fallo del paso 3)
  readonly cobros = new Map<string, number>();
  async cobrar(pedidoId: string, total: number): Promise<boolean> {
    await red();
    if (total > this.limite) return false;
    this.cobros.set(pedidoId, total);
    return true;
  }
}

export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';
@Injectable()
export class PedidosRepositorio {
  readonly pedidos = new Map<string, { estado: EstadoPedido; motivo?: string }>();
  async guardar(pedidoId: string, datos: { estado: EstadoPedido; motivo?: string }) {
    await red(); // la base de datos también está «al otro lado de la red»
    this.pedidos.set(pedidoId, datos);
  }
}
```

`f137-sagas-nestjs/src/manejadores.ts`:

```typescript
// Módulo 22 · F137 · Un manejador por comando: hace UN paso local y publica el evento con el resultado.
// Ningún manejador conoce el paso siguiente: eso lo decide la saga (pedido.saga.ts).
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import {
  CrearPedido, ReservarStock, CobrarPago, LiberarStock, ConfirmarPedido, CancelarPedido,
  PedidoCreado, StockReservado, StockAgotado, PagoAceptado, PagoRechazado, StockLiberado, PedidoConfirmado, PedidoCancelado,
} from './mensajes.js';
import { InventarioService, PagosService, PedidosRepositorio } from './servicios.js';

@CommandHandler(CrearPedido)
export class CrearPedidoHandler implements ICommandHandler<CrearPedido> {
  constructor(private readonly repo: PedidosRepositorio, private readonly eventos: EventBus) {}
  async execute({ pedidoId, sku, cantidad, total }: CrearPedido) {
    await this.repo.guardar(pedidoId, { estado: 'PENDIENTE' });
    this.eventos.publish(new PedidoCreado(pedidoId, sku, cantidad, total));
  }
}

@CommandHandler(ReservarStock)
export class ReservarStockHandler implements ICommandHandler<ReservarStock> {
  constructor(private readonly inventario: InventarioService, private readonly eventos: EventBus) {}
  async execute({ pedidoId, sku, cantidad, total }: ReservarStock) {
    const ok = await this.inventario.reservar(pedidoId, sku, cantidad);
    // El evento lleva lo que la saga necesita para armar el comando siguiente, sin consultar a nadie.
    this.eventos.publish(ok ? new StockReservado(pedidoId, total) : new StockAgotado(pedidoId));
  }
}

@CommandHandler(CobrarPago)
export class CobrarPagoHandler implements ICommandHandler<CobrarPago> {
  constructor(private readonly pagos: PagosService, private readonly eventos: EventBus) {}
  async execute({ pedidoId, total }: CobrarPago) {
    const ok = await this.pagos.cobrar(pedidoId, total);
    this.eventos.publish(ok ? new PagoAceptado(pedidoId) : new PagoRechazado(pedidoId, `cobro de ${total} rechazado`));
  }
}

@CommandHandler(LiberarStock)
export class LiberarStockHandler implements ICommandHandler<LiberarStock> {
  constructor(private readonly inventario: InventarioService, private readonly eventos: EventBus) {}
  async execute({ pedidoId }: LiberarStock) {
    await this.inventario.liberar(pedidoId);
    this.eventos.publish(new StockLiberado(pedidoId, 'pago rechazado'));
  }
}

@CommandHandler(ConfirmarPedido)
export class ConfirmarPedidoHandler implements ICommandHandler<ConfirmarPedido> {
  constructor(private readonly repo: PedidosRepositorio, private readonly eventos: EventBus) {}
  async execute({ pedidoId }: ConfirmarPedido) {
    await this.repo.guardar(pedidoId, { estado: 'CONFIRMADO' });
    this.eventos.publish(new PedidoConfirmado(pedidoId));
  }
}

@CommandHandler(CancelarPedido)
export class CancelarPedidoHandler implements ICommandHandler<CancelarPedido> {
  constructor(private readonly repo: PedidosRepositorio, private readonly eventos: EventBus) {}
  async execute({ pedidoId, motivo }: CancelarPedido) {
    await this.repo.guardar(pedidoId, { estado: 'CANCELADO', motivo });
    this.eventos.publish(new PedidoCancelado(pedidoId, motivo));
  }
}

export const MANEJADORES = [CrearPedidoHandler, ReservarStockHandler, CobrarPagoHandler, LiberarStockHandler, ConfirmarPedidoHandler, CancelarPedidoHandler];
```

`f137-sagas-nestjs/src/pedido.saga.ts`:

```typescript
// Módulo 22 · F137 · La saga: escucha EVENTOS y emite el COMANDO siguiente (o la compensación).
// Requisitos: @nestjs/cqrs 12.1.3 y rxjs 7.8.2. Cada método con @Saga() recibe el flujo de TODOS los eventos
// (un Observable) y devuelve un flujo de comandos que @nestjs/cqrs ejecuta en el CommandBus.
//
//   PedidoCreado   → ReservarStock          StockAgotado  → CancelarPedido
//   StockReservado → CobrarPago            PagoRechazado → LiberarStock (compensación) → StockLiberado → CancelarPedido
//   PagoAceptado   → ConfirmarPedido
import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import type { ICommand } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import {
  PedidoCreado, StockReservado, StockAgotado, PagoAceptado, PagoRechazado, StockLiberado,
  ReservarStock, CobrarPago, LiberarStock, ConfirmarPedido, CancelarPedido,
} from './mensajes.js';

@Injectable()
export class PedidoSaga {
  @Saga()
  pedidoCreado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PedidoCreado),
    map((e) => new ReservarStock(e.pedidoId, e.sku, e.cantidad, e.total)),
  );

  @Saga()
  stockReservado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(StockReservado),
    map((e) => new CobrarPago(e.pedidoId, e.total)),
  );

  @Saga()
  pagoAceptado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PagoAceptado),
    map((e) => new ConfirmarPedido(e.pedidoId)),
  );

  // Camino de fallo: el paso 3 (cobrar) falló → se deshace el paso 2 (reservar) con su compensación.
  @Saga()
  pagoRechazado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PagoRechazado),
    map((e) => new LiberarStock(e.pedidoId)),
  );

  // Cuando la compensación terminó, o el paso 2 ni siquiera se hizo, el pedido se cancela.
  @Saga()
  cancelar = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(StockAgotado, StockLiberado),
    map((e) => new CancelarPedido(e.pedidoId, e instanceof StockAgotado ? 'sin stock' : e.motivo)),
  );
}
```

`f137-sagas-nestjs/src/app.module.ts` y `f137-sagas-nestjs/src/main.ts`:

```typescript
// Módulo 22 · F137 · Módulo de Nest: CqrsModule.forRoot() registra CommandBus, EventBus y QueryBus;
// al arrancar, Nest busca en los providers los @CommandHandler y los @Saga() y los conecta.
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MANEJADORES } from './manejadores.js';
import { PedidoSaga } from './pedido.saga.js';
import { InventarioService, PagosService, PedidosRepositorio } from './servicios.js';

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [...MANEJADORES, PedidoSaga, InventarioService, PagosService, PedidosRepositorio],
})
export class PedidosModule {}
```

```typescript
// Módulo 22 · F137 · Demo: tres pedidos recorren la saga (feliz, sin stock y pago rechazado con compensación).
// Ejecuta: npm run build && node dist/f137-sagas-nestjs/src/main.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { filter, firstValueFrom } from 'rxjs';
import { PedidosModule } from './app.module.js';
import { CrearPedido, PedidoConfirmado, PedidoCancelado } from './mensajes.js';
import { InventarioService, PedidosRepositorio } from './servicios.js';

const app = await NestFactory.createApplicationContext(PedidosModule, { logger: ['error', 'warn'] });
const comandos = app.get(CommandBus);
const eventos = app.get(EventBus);
// EventBus es un Observable: nos suscribimos solo para imprimir cada evento en el orden en que ocurre.
eventos.subscribe((e) => console.log(`  evento ${e.constructor.name.padEnd(16)} ${JSON.stringify(e)}`));

async function ejecutar(pedido: CrearPedido) {
  const fin = firstValueFrom(eventos.pipe(ofType(PedidoConfirmado, PedidoCancelado), filter((e) => e.pedidoId === pedido.pedidoId)));
  console.log(`▶ ${pedido.pedidoId}: ${pedido.cantidad} × ${pedido.sku} por ${pedido.total}`);
  await comandos.execute(pedido);
  await fin; // la saga es asíncrona: execute() vuelve en cuanto el primer paso termina
}

await ejecutar(new CrearPedido('P-1', 'TEC-1', 2, 240_000));     // camino feliz
await ejecutar(new CrearPedido('P-2', 'MOU-1', 1, 50_000));      // sin stock: se cancela sin compensar
await ejecutar(new CrearPedido('P-3', 'TEC-1', 1, 2_000_000));   // pago rechazado: libera el stock y cancela

const inventario = app.get(InventarioService);
console.log('estado final:', JSON.stringify(Object.fromEntries(app.get(PedidosRepositorio).pedidos)));
console.log('stock TEC-1:', inventario.stock.get('TEC-1'), '· reservas:', [...inventario.reservas.keys()].join(','));
await app.close();
```

#### 10. MINI-LABORATORIO

1. Compila y ejecuta la demo (no necesita Docker):

```bash
npm run build
node dist/f137-sagas-nestjs/src/main.js
```

**Output esperado** (real):

```text
▶ P-1: 2 × TEC-1 por 240000
  evento PedidoCreado     {"pedidoId":"P-1","sku":"TEC-1","cantidad":2,"total":240000}
  evento StockReservado   {"pedidoId":"P-1","total":240000}
  evento PagoAceptado     {"pedidoId":"P-1"}
  evento PedidoConfirmado {"pedidoId":"P-1"}
▶ P-2: 1 × MOU-1 por 50000
  evento PedidoCreado     {"pedidoId":"P-2","sku":"MOU-1","cantidad":1,"total":50000}
  evento StockAgotado     {"pedidoId":"P-2"}
  evento PedidoCancelado  {"pedidoId":"P-2","motivo":"sin stock"}
▶ P-3: 1 × TEC-1 por 2000000
  evento PedidoCreado     {"pedidoId":"P-3","sku":"TEC-1","cantidad":1,"total":2000000}
  evento StockReservado   {"pedidoId":"P-3","total":2000000}
  evento PagoRechazado    {"pedidoId":"P-3","motivo":"cobro de 2000000 rechazado"}
  evento StockLiberado    {"pedidoId":"P-3","motivo":"pago rechazado"}
  evento PedidoCancelado  {"pedidoId":"P-3","motivo":"pago rechazado"}
estado final: {"P-1":{"estado":"CONFIRMADO"},"P-2":{"estado":"CANCELADO","motivo":"sin stock"},"P-3":{"estado":"CANCELADO","motivo":"pago rechazado"}}
stock TEC-1: 3 · reservas: P-1
```

**Captura comentada:** P-3 reservó 1 teclado (stock 5 → 2 tras P-1 y P-3) y, al rechazarse el pago, `StockLiberado` lo
devolvió: al final quedan 3, los que se llevó P-1. P-2 se cancela **sin** compensación porque no reservó nada.

2. Rompe la saga a propósito: en `servicios.ts`, quita el `await red();` de `liberar`, `cobrar`, `reservar` y
   `guardar`, recompila y ejecuta. **Output esperado:** los eventos de cada pedido salen **al revés**
   (`PedidoConfirmado` primero): el bus en memoria encadenó toda la saga dentro del primer `publish()` (punto 7).
   Vuelve a dejarlo como estaba.

#### 11. VERIFICACIÓN

```typescript
// Módulo 22 · F137 · Verificación de la saga con @nestjs/cqrs 12.1.3 (sin infraestructura).
// Ejecuta: npm run build && node --test dist/f137-sagas-nestjs/src/saga.test.js
import 'reflect-metadata';
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { filter, firstValueFrom } from 'rxjs';
import { PedidosModule } from './app.module.js';
import { CrearPedido, PedidoConfirmado, PedidoCancelado } from './mensajes.js';
import { InventarioService, PagosService, PedidosRepositorio } from './servicios.js';

let app: TestingModule;
let vistos: string[];
beforeEach(async () => {
  app = await Test.createTestingModule({ imports: [PedidosModule] }).compile();
  await app.init(); // onApplicationBootstrap de CqrsModule: registra manejadores y sagas
  vistos = [];
  app.get(EventBus).subscribe((e: any) => vistos.push(`${e.pedidoId}:${e.constructor.name}`));
});
afterEach(() => app.close());

async function correr(...pedidos: CrearPedido[]) {
  const eventos: EventBus = app.get(EventBus);
  const fines = pedidos.map((p) => firstValueFrom(eventos.pipe(ofType(PedidoConfirmado, PedidoCancelado), filter((e) => e.pedidoId === p.pedidoId))));
  await Promise.all(pedidos.map((p) => app.get(CommandBus).execute(p)));
  return Promise.all(fines);
}
const de = (id: string) => vistos.filter((v) => v.startsWith(`${id}:`)).map((v) => v.split(':')[1]);

test('camino feliz: reservar → cobrar → confirmar', async () => {
  await correr(new CrearPedido('P-1', 'TEC-1', 2, 240_000));
  assert.deepEqual(de('P-1'), ['PedidoCreado', 'StockReservado', 'PagoAceptado', 'PedidoConfirmado']);
  assert.equal(app.get(PedidosRepositorio).pedidos.get('P-1')?.estado, 'CONFIRMADO');
  assert.equal(app.get(InventarioService).stock.get('TEC-1'), 3);
});

test('sin stock: se cancela y NO se cobra ni se compensa (no hubo nada que deshacer)', async () => {
  await correr(new CrearPedido('P-2', 'MOU-1', 1, 50_000));
  assert.deepEqual(de('P-2'), ['PedidoCreado', 'StockAgotado', 'PedidoCancelado']);
  assert.equal(app.get(PagosService).cobros.size, 0);
});

test('pago rechazado: la compensación LiberarStock devuelve el stock antes de cancelar', async () => {
  await correr(new CrearPedido('P-3', 'TEC-1', 1, 2_000_000));
  assert.deepEqual(de('P-3'), ['PedidoCreado', 'StockReservado', 'PagoRechazado', 'StockLiberado', 'PedidoCancelado']);
  assert.equal(app.get(InventarioService).stock.get('TEC-1'), 5, 'el stock vuelve a 5');
  assert.equal(app.get(InventarioService).reservas.size, 0);
  assert.equal(app.get(PedidosRepositorio).pedidos.get('P-3')?.motivo, 'pago rechazado');
});

test('tres sagas a la vez no se mezclan: cada pedido termina en su estado', async () => {
  await correr(new CrearPedido('A', 'TEC-1', 1, 100), new CrearPedido('B', 'MOU-1', 1, 100), new CrearPedido('C', 'TEC-1', 1, 5_000_000));
  const estados = Object.fromEntries([...app.get(PedidosRepositorio).pedidos].map(([id, p]) => [id, p.estado]));
  assert.deepEqual(estados, { A: 'CONFIRMADO', B: 'CANCELADO', C: 'CANCELADO' });
  assert.equal(app.get(InventarioService).stock.get('TEC-1'), 4, 'solo A se queda con su unidad');
});
```

```bash
npm run build && node --test dist/f137-sagas-nestjs/src/saga.test.js
```

**Output esperado:** `ℹ tests 4` y `ℹ pass 4`.

**Pregunta de comprobación:** en el test de tres sagas a la vez, ¿por qué el stock final de TEC-1 es 4 y no 3?

#### 12. ERROR COMÚN

**Síntoma:** tras un pedido con datos raros, **ningún pedido más avanza**: se crean y se quedan en `PENDIENTE`. En el
log hay un único error, de hace horas. **Causa:** una excepción dentro del `pipe` de una saga; con la estrategia por
defecto de @nestjs/cqrs 12.1.3 (`sagaErrorStrategy: 'complete'`) esa saga se da por terminada.

```typescript
// Módulo 22 · F137 · Error común: una excepción DENTRO del flujo de una saga la apaga para siempre.
// Con la opción por defecto de @nestjs/cqrs 12.1.3 (sagaErrorStrategy: 'complete'), Nest registra el error UNA vez
// y el Observable de esa saga termina: los eventos siguientes se ignoran en silencio y los pedidos quedan colgados.
// Ejecuta: npm run build && node dist/f137-sagas-nestjs/src/error-comun.js
import 'reflect-metadata';
import { Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CqrsModule, CommandBus, CommandHandler, EventBus, Saga, ofType } from '@nestjs/cqrs';
import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { CrearPedido, PedidoCreado, ConfirmarPedido } from './mensajes.js';

const confirmados: string[] = [];

@Injectable()
class SagaFragil {
  @Saga()
  pedidoCreado = (eventos$: Observable<any>): Observable<ICommand> => eventos$.pipe(
    ofType(PedidoCreado),
    map((e) => {
      if (e.total <= 0) throw new Error(`total inválido en ${e.pedidoId}`); // MAL: validar lanzando dentro del stream
      return new ConfirmarPedido(e.pedidoId);
    }),
  );
}

@CommandHandler(CrearPedido)
class Crear implements ICommandHandler<CrearPedido> {
  constructor(private readonly eventos: EventBus) {}
  async execute(c: CrearPedido) { this.eventos.publish(new PedidoCreado(c.pedidoId, c.sku, c.cantidad, c.total)); }
}
@CommandHandler(ConfirmarPedido)
class Confirmar implements ICommandHandler<ConfirmarPedido> {
  async execute(c: ConfirmarPedido) { confirmados.push(c.pedidoId); }
}

for (const estrategia of ['complete', 'resubscribe'] as const) {
  confirmados.length = 0;
  @Module({ imports: [CqrsModule.forRoot({ sagaErrorStrategy: estrategia })], providers: [SagaFragil, Crear, Confirmar] })
  class Demo {}
  const app = await NestFactory.createApplicationContext(Demo, { logger: ['error'] });
  const bus = app.get(CommandBus);
  await bus.execute(new CrearPedido('P-1', 'TEC-1', 1, 100));
  await bus.execute(new CrearPedido('P-2', 'TEC-1', 1, 0));    // este revienta la saga
  await new Promise((r) => setTimeout(r, 300));                // 'resubscribe' vuelve a suscribirse a los 100 ms
  await bus.execute(new CrearPedido('P-3', 'TEC-1', 1, 100));  // ¿alguien lo escucha todavía?
  await new Promise((r) => setTimeout(r, 50));
  console.log(`sagaErrorStrategy=${estrategia.padEnd(11)} → confirmados: [${confirmados.join(', ')}]`);
  await app.close();
}
```

Salida real de `NO_COLOR=1 node dist/f137-sagas-nestjs/src/error-comun.js` (sin las líneas `at …` de la pila; la fecha
y el pid cambian):

```text
[Nest] 11880  - 11/20/2026, 12:28:39 AM   ERROR [EventBus] Saga "pedidoCreado" has thrown an unhandled exception.
[Nest] 11880  - 11/20/2026, 12:28:39 AM   ERROR [EventBus] Error: total inválido en P-2
sagaErrorStrategy=complete    → confirmados: [P-1]
[Nest] 11880  - 11/20/2026, 12:28:39 AM   ERROR [EventBus] Saga "pedidoCreado" has thrown an unhandled exception.
[Nest] 11880  - 11/20/2026, 12:28:39 AM   ERROR [EventBus] Error: total inválido en P-2
sagaErrorStrategy=resubscribe → confirmados: [P-1, P-3]
```

**Diagnóstico visual:** busca en los logs `Saga "…" has thrown an unhandled exception` y mira la hora: todo lo que
quedó colgado empezó justo después. Un panel con «pedidos en PENDIENTE hace más de N minutos» lo detecta antes que los
clientes. **Arreglo:** no lances dentro del flujo de la saga; valida en el manejador del comando (que publica un evento
de rechazo) o captura por evento dentro de un `mergeMap`. `'resubscribe'` es una red de seguridad, no el arreglo: pierde
los eventos que llegan mientras espera.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué es una saga y cuándo usarías coreografía en lugar de orquestación?**

**Respuesta modelo:** una saga reemplaza una transacción distribuida por una secuencia de transacciones locales, una por
servicio, donde cada paso publica un evento que dispara el siguiente y cada paso tiene una compensación que deshace su
efecto si un paso posterior falla. No da aislamiento: otros pueden ver estados intermedios, así que los modelo con
estados explícitos como «pendiente». En coreografía, cada servicio reacciona a eventos de los demás sin coordinador; la
uso con pocos pasos y equipos que ya publican eventos, porque no añade infraestructura. Cuando hay muchos pasos,
tiempos de espera, reintentos y necesito ver en qué paso va cada instancia, prefiero orquestación con algo durable como
Temporal. En NestJS, `@Saga()` de @nestjs/cqrs es coreografía dentro de un proceso: sirve para modelar el flujo, pero
el bus es en memoria, así que en producción saco los eventos a un broker con outbox y persisto el estado de la saga.

#### 14. ANTI-PATRÓN RELACIONADO

**La saga que llama directamente a los servicios.** Evita que la saga haga el trabajo (llamar al inventario, cobrar)
dentro del `map`: mezcla la decisión «qué sigue» con efectos de red, no hay manejador que reintentar ni evento que
registrar, y cualquier excepción la apaga.

```typescript
// MAL: la saga cobra ella misma; si el cobro lanza, la saga muere y no queda rastro del paso.
@Saga() stockReservado = (e$: Observable<any>) => e$.pipe(ofType(StockReservado),
  mergeMap(async (e) => { await this.pagos.cobrar(e.pedidoId, e.total); return new ConfirmarPedido(e.pedidoId); }));

// BIEN: la saga solo traduce evento → comando; el trabajo y sus fallos van en el manejador (pedido.saga.ts).
@Saga() stockReservado = (e$: Observable<any>) => e$.pipe(ofType(StockReservado), map((e) => new CobrarPago(e.pedidoId, e.total)));
```

---

### Compensaciones idempotentes

#### 1. UBICACIÓN

Módulo 22, Lección 4 de 7 · Fase 2 · Laboratorio `examples/microservicios/modulo-26/f138-compensaciones/`.

#### 2. PRERREQUISITOS

- Ficha 3 (sagas y compensaciones).
- Ficha 2 (duplicados y reintentos).
- Retry con backoff (Módulo 19).

#### 3. OBJETIVO DE APRENDIZAJE

**Diseñar** compensaciones que se pueden ejecutar varias veces y llegar desordenadas sin dañar los datos (clave
estable, estado en vez de delta y «lápida» para lo que todavía no ocurrió), y **demostrar** que con respuestas perdidas
y reintentos el dinero vuelve exactamente una vez. Lo compruebas cuando `compensaciones.test.js` pasa 6 de 6.

#### 4. ANALOGÍA VISUAL

Dibuja un **interruptor de luz** y un **timbre**. Si te dicen «deja la luz apagada» y lo haces tres veces, la luz
sigue apagada: la orden es **idempotente**. Si te dicen «toca el timbre» tres veces, sonó tres veces. Una compensación
tiene que ser como el interruptor: «deja el pago P en estado reembolsado», no «devuelve 300 pesos». Y una tercera
viñeta: alguien te dice «apaga la luz de la habitación 7» pero esa luz **nunca se encendió**; pegas una nota en el
interruptor, «no encender: cancelado», para que si alguien llega tarde a encenderla, no lo haga.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant S as coordinador de la saga
    participant P as pagos
    S->>P: reembolsar(S-1)
    Note over P: cobro S-1 → REEMBOLSADO (saldo +300)
    P--xS: respuesta perdida (timeout)
    S->>P: reembolsar(S-1) (reintento 2)
    Note over P: ya REEMBOLSADO → no hace nada
    P--xS: respuesta perdida
    S->>P: reembolsar(S-1) (reintento 3)
    P-->>S: {estado: REEMBOLSADO, repetido: true}
    S->>P: reembolsar(S-2) (su cobro aún no llegó)
    Note over P: sin cobro → lápida S-2
    P-->>S: {estado: SIN_COBRO}
    Note over P: llega tarde cobrar(S-2) → RECHAZADO
```

**Texto alternativo:** diagrama de secuencia entre el coordinador de la saga y el servicio de pagos. El coordinador
pide reembolsar S-1; pagos lo marca como reembolsado y suma 300 al saldo, pero la respuesta se pierde. El coordinador
reintenta dos veces más: en la segunda la respuesta también se pierde y en la tercera llega «reembolsado, repetido»;
en ninguna se devuelve el dinero de nuevo. Después pide reembolsar S-2, cuyo cobro aún no ha llegado: pagos deja una
lápida para S-2 y responde «sin cobro»; cuando el cobro de S-2 llega tarde, se rechaza.

#### 6. EXPLICACIÓN NIVEL 0

- Una compensación es el «deshacer» de un paso de la saga: si cobraste y luego algo falló, **reembolsas**.
- Pero la red puede fallar justo cuando el servicio de pagos responde «hecho». El coordinador no lo sabe y lo **vuelve a
  pedir**.
- Si el reembolso «suma 300» cada vez que se lo piden, Ana recibe 900. Si el reembolso dice «deja este cobro como
  reembolsado», pedirlo tres veces da lo mismo que una.
- Y a veces el «deshacer» llega **antes** que el «hacer» (los mensajes viajan por caminos distintos). Hay que recordar
  «esto ya se canceló» para rechazar el «hacer» cuando llegue.

#### 7. EXPLICACIÓN INTERMEDIA

- **Regla 1, clave estable:** la compensación se identifica por algo que no cambia entre reintentos (el `sagaId`, o
  `sagaId:reembolso`). Nunca un `randomUUID()` por intento.
- **Regla 2, estado y no delta:** guarda el estado del cobro (`COBRADO` → `REEMBOLSADO`) y aplica el cambio de saldo
  **solo en la transición**. Si ya está en el estado final, responde lo mismo sin tocar nada (`repetido: true`).
- **Regla 3, lápida:** compensar algo que no existe **no es un error**: devuelve `SIN_COBRO` y guarda la marca. La
  acción original, si llega después, ve la lápida y se rechaza. Sin lápida, el cobro tardío quedaría cobrado para
  siempre.
- **La acción también es idempotente:** `cobrar(S-3)` dos veces cobra una vez (misma clave).
- **El coordinador reintenta con tope:** las compensaciones **no pueden fallar** a medias para siempre; si tras N
  intentos no hay respuesta, se escala a una persona (cola de revisión manual, alerta). En `red.js`,
  `compensarConReintentos` lo modela.
- `red.js` simula la red que pierde respuestas: el servicio **ejecuta** la llamada y el cliente recibe un timeout. Es
  el caso que obliga a reintentar.

#### 8. EXPLICACIÓN MAESTRA

- **Compensar no es borrar.** Una compensación es un **nuevo hecho de negocio** (un reembolso, una nota crédito, la
  liberación de una reserva), no un `DELETE` del cobro: el historial queda y contabilidad lo necesita. Algunas acciones
  **no se pueden compensar** (enviar un correo, despachar un paquete): ponlas **al final** de la saga, después del
  último paso que puede fallar (el «pivote»), o compénsalas con otra acción («correo de disculpa»).
- **Semántica vs mecánica.** Que el dinero vuelva una vez es mecánica (idempotencia). Que el cliente reciba lo que
  esperaba es semántica: si entre el cobro y el reembolso cambió el tipo de cambio o se cobró una comisión, el reembolso
  correcto no es «el mismo monto». Decídelo con negocio.
- **Alternativas:** *reservas con caducidad* (el stock reservado se libera solo si la saga no confirma en 15 minutos:
  la compensación pasa a ser el camino por defecto); *orquestador durable* (Temporal registra qué compensaciones ya se
  ejecutaron y no las repite tras un reinicio, aunque tus actividades siguen necesitando idempotencia porque pueden
  reintentarse); *transacción local* si los datos caben en un servicio (no hace falta compensar).
- **Almacenamiento real:** en una base de datos, las reglas son una restricción `UNIQUE (saga_id)` en la tabla de
  reembolsos y un `UPDATE … WHERE estado = 'COBRADO'` que solo afecta a una fila la primera vez.
- **Cuándo NO hace falta tanto cuidado:** compensaciones que ya son idempotentes por naturaleza («marcar pedido como
  cancelado»). El cuidado es para las que mueven dinero o cantidades.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** (JavaScript puro, sin dependencias).

`f138-compensaciones/pagos.js`:

```javascript
// Módulo 22 · F138 · Servicio de pagos con una acción (cobrar) y su compensación (reembolsar), ambas idempotentes.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). En producción, cobros y reembolsos vivirían en tablas con
// clave única por sagaId; aquí, Maps en memoria con las mismas reglas.
//
// Tres reglas de una compensación idempotente:
//   1. Clave estable: la compensación se identifica por el sagaId (no por un id nuevo en cada intento).
//   2. Estado, no deltas: «el pago P queda reembolsado», no «suma 100 al saldo».
//   3. Compensar lo que no existe es válido: deja una «lápida» para que la acción que llegue tarde se rechace.
export class PagosService {
  saldo = new Map([['ana', 1000]]);
  cobros = new Map();       // sagaId → { cliente, monto, estado: 'COBRADO' | 'REEMBOLSADO' }
  lapidas = new Set();      // sagaIds compensados antes de que llegara su cobro
  operaciones = [];         // diario de movimientos de dinero (para comprobar que no hay dobles)

  cobrar(sagaId, cliente, monto) {
    if (this.lapidas.has(sagaId)) return { estado: 'RECHAZADO', motivo: 'la saga ya fue compensada' };
    const previo = this.cobros.get(sagaId);
    if (previo) return { estado: previo.estado, repetido: true };   // reintento del cobro: no cobra dos veces
    this.saldo.set(cliente, this.saldo.get(cliente) - monto);
    this.cobros.set(sagaId, { cliente, monto, estado: 'COBRADO' });
    this.operaciones.push(`cobro ${sagaId} -${monto}`);
    return { estado: 'COBRADO' };
  }

  reembolsar(sagaId) {
    const cobro = this.cobros.get(sagaId);
    if (!cobro) { this.lapidas.add(sagaId); return { estado: 'SIN_COBRO' }; }   // regla 3
    if (cobro.estado === 'REEMBOLSADO') return { estado: 'REEMBOLSADO', repetido: true }; // regla 2: ya está
    this.saldo.set(cobro.cliente, this.saldo.get(cobro.cliente) + cobro.monto);
    cobro.estado = 'REEMBOLSADO';
    this.operaciones.push(`reembolso ${sagaId} +${cobro.monto}`);
    return { estado: 'REEMBOLSADO' };
  }
}
```

`f138-compensaciones/red.js`:

```javascript
// Módulo 22 · F138 · Una «red» que pierde respuestas: la llamada SÍ se ejecuta en el servidor, pero el cliente
// recibe un timeout. Es el caso que obliga a reintentar y, por tanto, a que todo sea idempotente.
export function redQuePierde(servicio, { perderRespuestas = 0 } = {}) {
  let porPerder = perderRespuestas;
  return new Proxy(servicio, {
    get(destino, metodo) {
      const original = destino[metodo];
      if (typeof original !== 'function') return original;
      return async (...args) => {
        const resultado = original.apply(destino, args);   // el servidor ejecuta…
        if (porPerder > 0) { porPerder--; throw new Error('timeout: no llegó la respuesta'); } // …pero el cliente no lo sabe
        return resultado;
      };
    },
  });
}

// El coordinador de la saga reintenta la compensación hasta que obtiene respuesta (con un tope).
export async function compensarConReintentos(compensacion, { intentos = 5, registro = () => {} } = {}) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const r = await compensacion();
      registro(`intento ${i}: ${JSON.stringify(r)}`);
      return r;
    } catch (error) {
      registro(`intento ${i}: ${error.message}`);
    }
  }
  throw new Error(`compensación sin confirmar tras ${intentos} intentos: revisión manual`);
}
```

`f138-compensaciones/demo.js`:

```javascript
// Módulo 22 · F138 · Demo: el reembolso se ejecuta 3 veces (2 respuestas perdidas + 1 buena) y el dinero vuelve UNA vez.
// Ejecuta: node f138-compensaciones/demo.js
import { PagosService } from './pagos.js';
import { redQuePierde, compensarConReintentos } from './red.js';

const pagos = new PagosService();
pagos.cobrar('S-1', 'ana', 300);
console.log(`tras cobrar S-1: saldo de ana = ${pagos.saldo.get('ana')}`);

const remoto = redQuePierde(pagos, { perderRespuestas: 2 });
await compensarConReintentos(() => remoto.reembolsar('S-1'), { registro: (l) => console.log(`  reembolsar S-1 · ${l}`) });
console.log(`tras compensar S-1: saldo de ana = ${pagos.saldo.get('ana')} · movimientos: ${pagos.operaciones.join(' | ')}`);

// Orden invertido: la compensación de S-2 llega ANTES que su cobro (el cobro iba lento por la red).
console.log('reembolsar S-2 antes de cobrarlo →', JSON.stringify(pagos.reembolsar('S-2')));
console.log('cobrar S-2 tarde                  →', JSON.stringify(pagos.cobrar('S-2', 'ana', 200)));
console.log(`saldo final de ana = ${pagos.saldo.get('ana')}`);
```

#### 10. MINI-LABORATORIO

1. Ejecuta la demo (no necesita Docker):

```bash
node f138-compensaciones/demo.js
```

**Output esperado** (real):

```text
tras cobrar S-1: saldo de ana = 700
  reembolsar S-1 · intento 1: timeout: no llegó la respuesta
  reembolsar S-1 · intento 2: timeout: no llegó la respuesta
  reembolsar S-1 · intento 3: {"estado":"REEMBOLSADO","repetido":true}
tras compensar S-1: saldo de ana = 1000 · movimientos: cobro S-1 -300 | reembolso S-1 +300
reembolsar S-2 antes de cobrarlo → {"estado":"SIN_COBRO"}
cobrar S-2 tarde                  → {"estado":"RECHAZADO","motivo":"la saga ya fue compensada"}
saldo final de ana = 1000
```

**Captura comentada:** el reembolso se **ejecutó** en el intento 1 (por eso el 3 dice `repetido: true`), pero el
coordinador no lo supo hasta el 3. El diario de movimientos tiene un solo reembolso.

2. Compara con la versión ingenua: `node f138-compensaciones/error-comun.js` (salida en el punto 12).
3. Experimenta: en `demo.js`, cambia `perderRespuestas: 2` por `99`. **Output esperado:** cinco intentos con timeout y
   el programa termina con el error `compensación sin confirmar tras 5 intentos: revisión manual`. Ojo: el reembolso
   **sí** se aplicó en el servidor en el primer intento; el coordinador no lo sabe, y por eso escala a una persona en
   vez de darlo por fallido y seguir.

#### 11. VERIFICACIÓN

```javascript
// Módulo 22 · F138 · Verificación: las compensaciones se pueden repetir y llegar desordenadas sin dañar el saldo.
// Ejecuta: node --test f138-compensaciones/compensaciones.test.js   (sin infraestructura)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PagosService } from './pagos.js';
import { redQuePierde, compensarConReintentos } from './red.js';
import { PagosIngenuo } from './error-comun.js';

test('reembolsar dos veces devuelve el dinero UNA vez', () => {
  const p = new PagosService();
  p.cobrar('S-1', 'ana', 300);
  assert.equal(p.reembolsar('S-1').estado, 'REEMBOLSADO');
  assert.deepEqual(p.reembolsar('S-1'), { estado: 'REEMBOLSADO', repetido: true });
  assert.equal(p.saldo.get('ana'), 1000);
  assert.deepEqual(p.operaciones, ['cobro S-1 -300', 'reembolso S-1 +300']);
});

test('respuestas perdidas: el coordinador reintenta y el efecto se aplica una sola vez', async () => {
  const p = new PagosService();
  p.cobrar('S-1', 'ana', 300);
  const r = await compensarConReintentos(() => redQuePierde(p, { perderRespuestas: 0 }).reembolsar('S-1'));
  assert.equal(r.estado, 'REEMBOLSADO');
  const remoto = redQuePierde(p, { perderRespuestas: 3 });
  await compensarConReintentos(() => remoto.reembolsar('S-1'));
  assert.equal(p.saldo.get('ana'), 1000);
  assert.equal(p.operaciones.filter((o) => o.startsWith('reembolso')).length, 1);
});

test('compensar antes de la acción deja una lápida: el cobro tardío se rechaza', () => {
  const p = new PagosService();
  assert.equal(p.reembolsar('S-2').estado, 'SIN_COBRO');
  assert.equal(p.cobrar('S-2', 'ana', 200).estado, 'RECHAZADO');
  assert.equal(p.saldo.get('ana'), 1000);
});

test('la acción también es idempotente: reintentar el cobro no cobra dos veces', () => {
  const p = new PagosService();
  p.cobrar('S-3', 'ana', 100);
  assert.equal(p.cobrar('S-3', 'ana', 100).repetido, true);
  assert.equal(p.saldo.get('ana'), 900);
});

test('si la compensación nunca responde, se escala a revisión manual (no se reintenta para siempre)', async () => {
  const remoto = redQuePierde(new PagosService(), { perderRespuestas: 99 });
  await assert.rejects(compensarConReintentos(() => remoto.reembolsar('S-4'), { intentos: 3 }), /revisión manual/);
});

test('error común: la compensación con delta e id nuevo devuelve el dinero tantas veces como reintentos', async () => {
  const p = new PagosIngenuo();
  const remoto = redQuePierde(p, { perderRespuestas: 2 });
  await compensarConReintentos(() => remoto.reembolsar('S-1', 'ana', 300));
  assert.equal(p.saldo.get('ana'), 1600);
});
```

```bash
node --test f138-compensaciones/compensaciones.test.js
```

**Output esperado:** `ℹ tests 6` y `ℹ pass 6`.

**Pregunta de comprobación:** ¿qué pasaría en el test de la lápida si `reembolsar` devolviera un error cuando no
encuentra el cobro?

#### 12. ERROR COMÚN

**Síntoma:** después de un incidente de red, varios clientes tienen **más saldo** del que deberían; el registro de
reembolsos muestra el mismo monto repetido con ids distintos. **Causa:** el reembolso suma un delta y genera un id
nuevo en cada intento; cada reintento del coordinador devuelve el dinero otra vez.

```javascript
// Módulo 22 · F138 · Error común: una compensación que aplica un DELTA y genera un id nuevo en cada intento.
// Con 2 respuestas perdidas, el coordinador reintenta 3 veces y el cliente recibe el dinero 3 veces.
// Ejecuta: node f138-compensaciones/error-comun.js
import { randomUUID } from 'node:crypto';
import { redQuePierde, compensarConReintentos } from './red.js';

export class PagosIngenuo {
  saldo = new Map([['ana', 700]]);   // ya se cobraron 300 de 1000
  reembolsos = new Map();
  reembolsar(_sagaId, cliente, monto) {
    const id = randomUUID();                                        // MAL: id nuevo en cada intento
    this.reembolsos.set(id, monto);
    this.saldo.set(cliente, this.saldo.get(cliente) + monto);       // MAL: delta, no estado
    return { reembolsoId: id };
  }
}

if (import.meta.main) {
  const pagos = new PagosIngenuo();
  const remoto = redQuePierde(pagos, { perderRespuestas: 2 });
  await compensarConReintentos(() => remoto.reembolsar('S-1', 'ana', 300), { registro: (l) => console.log(`  ${l}`) });
  console.log(`cobrados 300, reembolsados ${[...pagos.reembolsos.values()].reduce((a, b) => a + b, 0)} · saldo de ana = ${pagos.saldo.get('ana')} (debía quedar en 1000)`);
}
```

Salida real de `node f138-compensaciones/error-comun.js` (el uuid cambia):

```text
  intento 1: timeout: no llegó la respuesta
  intento 2: timeout: no llegó la respuesta
  intento 3: {"reembolsoId":"0083d471-36d7-4996-a0a3-99130dddc770"}
cobrados 300, reembolsados 900 · saldo de ana = 1600 (debía quedar en 1000)
```

**Diagnóstico visual:** una consulta que agrupe reembolsos por saga (`GROUP BY saga_id HAVING COUNT(*) > 1`) o un panel
de «reembolsado > cobrado» lo delata. **Arreglo:** las tres reglas de `pagos.js`: clave = `sagaId`, transición de
estado y lápida.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué hace que una compensación sea segura de reintentar?**

**Respuesta modelo:** que sea idempotente y tolerante al desorden. Uso una clave estable, el id de la saga, para que
todos los reintentos se refieran a la misma compensación; la implemento como transición de estado y no como delta, de
modo que «dejar el cobro reembolsado» aplicado tres veces tiene el efecto de una; y si me piden compensar algo que aún
no ocurrió, no fallo: dejo una lápida para rechazar la acción original si llega tarde. La acción también tiene que ser
idempotente. El coordinador reintenta con backoff y con tope, porque una compensación que no termina deja datos
inconsistentes, y al agotar los intentos escala a revisión manual. En base de datos lo apoyo con restricciones únicas y
`UPDATE` condicionados al estado. Y ordeno la saga para que lo que no se puede compensar, como notificar al cliente, vaya
al final.

#### 14. ANTI-PATRÓN RELACIONADO

**Compensar con un `DELETE`.** Evita «deshacer» borrando la fila del cobro: pierdes el historial, contabilidad no
cuadra, y si el borrado se reintenta después de que otro proceso reinsertó algo con la misma clave, borras lo que no
era tuyo.

```javascript
// MAL: la compensación borra la evidencia del cobro.
await db.query('DELETE FROM cobros WHERE saga_id = $1', [sagaId]);

// BIEN: la compensación es un hecho nuevo y una transición de estado, solo desde COBRADO (pagos.js).
await db.query("UPDATE cobros SET estado = 'REEMBOLSADO' WHERE saga_id = $1 AND estado = 'COBRADO'", [sagaId]);
```

---

### Event Sourcing con EventStoreDB o MongoDB

#### 1. UBICACIÓN

Módulo 22, Lección 5 de 7 · Fase 2 · Laboratorio `examples/microservicios/modulo-26/f139-event-sourcing/`.

#### 2. PRERREQUISITOS

- MongoDB y el driver `mongodb` (Módulo 15).
- `Array.prototype.reduce` y objetos inmutables (Módulo 0.3 y Módulo 12).
- Concurrencia optimista (versión esperada) a nivel de idea.

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** un agregado con event sourcing (decidir → eventos → aplicar) y un almacén de eventos sobre **MongoDB**
con **concurrencia optimista**, y **demostrar** que el estado se reconstruye de los eventos y que dos escritores con la
misma versión no pueden escribir los dos. Lo compruebas cuando `almacen.test.js` pasa 5 de 5 en memoria y 9 de 9 con
MongoDB.

#### 4. ANALOGÍA VISUAL

Dibuja una **libreta de cuenta bancaria** antigua. El banco no escribe «saldo: 285.000» y lo borra cada día: anota
**cada movimiento** en una línea nueva, numerada, con tinta: «1 · apertura», «2 · depósito 240.000», «3 · depósito
45.000». El saldo se **calcula** sumando las líneas. Si quieres saber cuánto tenías el martes, sumas hasta la línea del
martes. Y si dos cajeros intentan escribir a la vez la línea número 4, solo uno puede; el otro tiene que volver a mirar
la libreta y decidir de nuevo.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    CMD["comando<br/>AgregarLinea"] --> L["leerStream(pedido-P-1)<br/>→ eventos v1..v3, versión 3"]
    L --> R["reconstruir = reduce(aplicar)"]
    R --> D{"decidir(estado, comando)"}
    D -- "regla rota" --> ERR["ReglaDeNegocio"]
    D -- "nuevos eventos" --> A["anexar(stream, versionEsperada=3, eventos)"]
    A --> M[("MongoDB · f139_commits<br/>_id: pedido-P-1@4 (único)")]
    A -- "E11000 / versión distinta" --> C["ConflictoDeConcurrencia<br/>→ releer y decidir otra vez"]
    C --> L
```

**Texto alternativo:** diagrama de flujo del ciclo de un comando con event sourcing. El comando AgregarLinea lee el
stream pedido-P-1, que tiene los eventos de la versión 1 a la 3. Se reconstruye el estado aplicando los eventos con
reduce y se decide: si se rompe una regla, se lanza ReglaDeNegocio; si no, se anexan los nuevos eventos con versión
esperada 3 en la colección f139_commits de MongoDB, con _id único pedido-P-1@4. Si MongoDB devuelve el error de clave
duplicada E11000 o la versión no coincide, se produce ConflictoDeConcurrencia y se vuelve a leer y decidir.

#### 6. EXPLICACIÓN NIVEL 0

- Lo normal es guardar **cómo está** algo ahora: «pedido P-1: confirmado, total 285.000». Si cambia, se sobrescribe y
  lo anterior se pierde.
- Con **event sourcing** se guarda **lo que pasó**, en orden: «se creó», «se agregó un teclado», «se agregó un mouse»,
  «se confirmó». Nunca se borra ni se cambia una línea.
- Para saber cómo está el pedido, se **repasan** los eventos de principio a fin. Así también puedes saber cómo estaba
  ayer, o por qué llegó a este estado.
- Cada pedido tiene su propia lista de eventos (un **stream**), numerada (la **versión**).

#### 7. EXPLICACIÓN INTERMEDIA

- **El agregado** (`pedido.js`) son tres funciones puras: `decidir(estado, comando)` aplica las reglas y devuelve
  eventos nuevos (o lanza `ReglaDeNegocio`); `aplicar(estado, evento)` devuelve el estado siguiente **sin reglas** (un
  hecho no se discute); `reconstruir(eventos)` es `eventos.reduce(aplicar, INICIAL)`.
- **Ciclo de un comando** (`ejecutar`): leer el stream → reconstruir → decidir → `anexar(stream, versionLeída,
  eventos)`. Si entre la lectura y la escritura otro escribió, el almacén lanza `ConflictoDeConcurrencia` y se repite
  todo desde la lectura (máximo 3 reintentos).
- **Almacén en MongoDB** (`almacen-mongo.js`): **un documento por commit** con todos sus eventos. En MongoDB escribir
  **un documento** es atómico, así que un commit de varios eventos entra entero o no entra, sin transacciones ni replica
  set. El `_id` es `stream@versiónInicial`: si dos escritores intentan la misma versión, el segundo recibe el error
  **E11000 duplicate key** (código 11000) y se traduce a `ConflictoDeConcurrencia`.
- **Posición global** (`posicion`): un contador atómico con `findOneAndUpdate({$inc})` da un orden total para que las
  proyecciones (ficha 6) lean «todo lo nuevo desde X».
- **Almacén en memoria** (`almacen-memoria.js`): mismas reglas, para tests sin Docker; `almacen.test.js` ejecuta el
  **mismo contrato** contra los dos.
- **Viaje en el tiempo:** `reconstruir(eventos.slice(0, 2))` da el estado tras el evento 2.

#### 8. EXPLICACIÓN MAESTRA

- **EventStoreDB (hoy KurrentDB 26.1.3) vs MongoDB.** *KurrentDB* (cliente Node `@kurrent/kurrentdb-client` 1.3.3,
  sucesor de `@eventstore/db-client`) está hecho para esto: streams nativos, escritura con revisión esperada,
  suscripciones a un stream o a todos (`$all`) con orden global garantizado y proyecciones en el servidor. *MongoDB* es
  una base de datos general que tu equipo probablemente ya opera; a cambio, el almacén lo escribes tú y su punto débil
  es el orden global: el contador de `posicion` deja **huecos** si un commit falla después de pedir número y, con
  escritores concurrentes, un commit con posición 7 puede hacerse visible **antes** que el 6. Una proyección que lee
  «desde 6» se saltaría el 6. Mitigaciones: un único escritor por almacén, releer una ventana hacia atrás, o leer con
  *change streams* (requieren replica set). Otras alternativas: PostgreSQL con una tabla de eventos y una secuencia
  (o Marten/Emmett), o Kafka como log (no sirve para leer un agregado por id).
- **Snapshots.** Un agregado con 10 000 eventos tarda en reconstruirse: cada N eventos se guarda una foto del estado y
  se reconstruye desde la foto. Hazlo solo cuando lo midas.
- **Evolución de eventos.** Los eventos son para siempre. Cambiar su forma exige *upcasting* (convertir versiones
  viejas al leer) o eventos nuevos (`LineaAgregadaV2`). `aplicar` ignora tipos desconocidos para no romper.
- **Datos personales.** «Nunca se borra» choca con el derecho al olvido: guarda los datos personales cifrados con una
  clave por persona y borra la clave (*crypto-shredding*), o fuera del evento.
- **Cuándo NO usarlo:** CRUD sin reglas ni necesidad de historia (un catálogo), equipos sin experiencia en el patrón
  (la curva es real) o cuando el único motivo es la auditoría: una tabla de auditoría o el CDC del Módulo 25 son más
  baratos. Event sourcing brilla cuando la **historia es el negocio** (cuentas, reservas, inventario con trazabilidad).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **mongodb 7.9.1** (driver oficial) y **MongoDB 9.0.8** (imagen `mongo:9.0.8`).

`f139-event-sourcing/pedido.js`:

```javascript
// Módulo 22 · F139 · El agregado Pedido con event sourcing: su estado NO se guarda; se CALCULA a partir de sus eventos.
// Requisitos: Node.js 26.13.1 LTS (JavaScript puro, sin dependencias).
//   decidir(estado, comando) → eventos nuevos (o error de negocio)   ← aquí viven las reglas
//   aplicar(estado, evento)  → estado siguiente                      ← sin reglas: un hecho no se discute
export class ReglaDeNegocio extends Error { name = 'ReglaDeNegocio'; }

export const INICIAL = { existe: false, estado: null, cliente: null, lineas: [], total: 0 };

export function aplicar(estado, { tipo, datos }) {
  switch (tipo) {
    case 'PedidoCreado': return { ...estado, existe: true, estado: 'ABIERTO', cliente: datos.cliente };
    case 'LineaAgregada': return { ...estado, lineas: [...estado.lineas, datos], total: estado.total + datos.cantidad * datos.precio };
    case 'PedidoConfirmado': return { ...estado, estado: 'CONFIRMADO' };
    case 'PedidoCancelado': return { ...estado, estado: 'CANCELADO' };
    default: return estado; // un tipo desconocido (de una versión futura) no rompe la reconstrucción
  }
}

export const reconstruir = (eventos) => eventos.reduce(aplicar, INICIAL);

export function decidir(estado, comando) {
  switch (comando.tipo) {
    case 'Crear':
      if (estado.existe) throw new ReglaDeNegocio('el pedido ya existe');
      return [{ tipo: 'PedidoCreado', datos: { cliente: comando.cliente } }];
    case 'AgregarLinea':
      if (estado.estado !== 'ABIERTO') throw new ReglaDeNegocio(`pedido ${estado.estado ?? 'inexistente'}: no admite líneas`);
      return [{ tipo: 'LineaAgregada', datos: { sku: comando.sku, cantidad: comando.cantidad, precio: comando.precio } }];
    case 'Confirmar':
      if (estado.estado !== 'ABIERTO' || estado.lineas.length === 0) throw new ReglaDeNegocio('solo se confirma un pedido abierto con líneas');
      return [{ tipo: 'PedidoConfirmado', datos: {} }];
    case 'Cancelar':
      if (estado.estado === 'CANCELADO') return []; // idempotente: cancelar dos veces no genera otro evento
      return [{ tipo: 'PedidoCancelado', datos: { motivo: comando.motivo } }];
    default: throw new ReglaDeNegocio(`comando desconocido ${comando.tipo}`);
  }
}

// Ciclo completo de un comando: leer stream → reconstruir → decidir → anexar con la versión leída.
// Si otro escribió entre medias, el almacén lanza ConflictoDeConcurrencia y se REINTENTA desde la lectura.
export async function ejecutar(almacen, pedidoId, comando, { reintentos = 3 } = {}) {
  for (let intento = 1; ; intento++) {
    const { eventos, version } = await almacen.leerStream(`pedido-${pedidoId}`);
    const nuevos = decidir(reconstruir(eventos), comando);
    if (nuevos.length === 0) return version;
    try {
      return await almacen.anexar(`pedido-${pedidoId}`, version, nuevos);
    } catch (error) {
      if (error.name !== 'ConflictoDeConcurrencia' || intento > reintentos) throw error;
    }
  }
}
```

`f139-event-sourcing/almacen-mongo.js`:

```javascript
// Módulo 22 · F139 · Almacén de eventos sobre MongoDB 9.0.8 con el driver oficial mongodb 7.9.1.
// Diseño «un documento por commit»: cada anexar() guarda UN documento con TODOS sus eventos. En MongoDB la escritura
// de un documento es atómica, así que un commit se guarda entero o no se guarda (sin transacciones ni replica set).
//   { _id: 'pedido-P1@3', stream: 'pedido-P1', desde: 3, hasta: 4, posicion: 17, eventos: [{tipo, datos, en}, …] }
// Concurrencia optimista: _id = stream@versión-inicial es ÚNICO. Si dos escritores leyeron la versión 2 e intentan
// escribir desde la 3, el segundo choca con E11000 (duplicate key) → ConflictoDeConcurrencia.
export class ConflictoDeConcurrencia extends Error { name = 'ConflictoDeConcurrencia'; }

export class AlmacenEventosMongo {
  constructor(db) {
    this.commits = db.collection('f139_commits');
    this.contadores = db.collection('f139_contadores');
  }

  async preparar() {
    await this.commits.createIndex({ stream: 1, desde: 1 });   // leer un stream en orden
    await this.commits.createIndex({ posicion: 1 }, { unique: true }); // leer TODO en orden (proyecciones, F140)
  }

  async leerStream(stream) {
    const commits = await this.commits.find({ stream }).sort({ desde: 1 }).toArray();
    const eventos = commits.flatMap((c) => c.eventos);
    return { eventos, version: commits.at(-1)?.hasta ?? 0 };
  }

  async anexar(stream, versionEsperada, eventos) {
    const actual = await this.commits.find({ stream }).sort({ desde: -1 }).limit(1).next();
    if ((actual?.hasta ?? 0) !== versionEsperada) {
      throw new ConflictoDeConcurrencia(`${stream}: esperabas la versión ${versionEsperada} y va por la ${actual?.hasta ?? 0}`);
    }
    // Posición global: un contador atómico ($inc). Da un orden total para las proyecciones (ver la ficha: tiene huecos
    // si un commit falla y no garantiza que se HAGAN VISIBLES en orden con escritores concurrentes).
    const { valor: posicion } = await this.contadores.findOneAndUpdate({ _id: 'posicion' }, { $inc: { valor: 1 } },
      { upsert: true, returnDocument: 'after' });
    const desde = versionEsperada + 1;
    try {
      await this.commits.insertOne({
        _id: `${stream}@${desde}`, stream, desde, hasta: versionEsperada + eventos.length, posicion,
        eventos: eventos.map((e) => ({ ...e, en: new Date() })),
      });
    } catch (error) {
      if (error.code === 11000) throw new ConflictoDeConcurrencia(`${stream}: otro escritor anexó la versión ${desde} primero`);
      throw error;
    }
    return versionEsperada + eventos.length;
  }

  // Para las proyecciones (F140): commits con posición > desde, en orden global.
  async leerDesde(desde, limite = 100) {
    return this.commits.find({ posicion: { $gt: desde } }).sort({ posicion: 1 }).limit(limite).toArray();
  }
}
```

`f139-event-sourcing/almacen-memoria.js` y `f139-event-sourcing/almacen.js`:

```javascript
// Módulo 22 · F139 · El mismo almacén en memoria, con las MISMAS reglas que el de MongoDB (versión esperada,
// _id único por stream@versión, posición global). Sirve para los tests sin Docker y para F140.
import { ConflictoDeConcurrencia } from './almacen-mongo.js';
export { ConflictoDeConcurrencia };

export class AlmacenEventosMemoria {
  commits = new Map();   // _id → commit (como la colección)
  posicion = 0;
  async preparar() {}

  async leerStream(stream) {
    const commits = [...this.commits.values()].filter((c) => c.stream === stream).sort((a, b) => a.desde - b.desde);
    return { eventos: commits.flatMap((c) => c.eventos), version: commits.at(-1)?.hasta ?? 0 };
  }

  async anexar(stream, versionEsperada, eventos) {
    const { version } = await this.leerStream(stream);
    await Promise.resolve(); // como en la red: entre leer y escribir puede colarse otro escritor
    if (version !== versionEsperada) throw new ConflictoDeConcurrencia(`${stream}: esperabas la versión ${versionEsperada} y va por la ${version}`);
    const desde = versionEsperada + 1;
    const _id = `${stream}@${desde}`;
    const posicion = ++this.posicion;
    if (this.commits.has(_id)) throw new ConflictoDeConcurrencia(`${stream}: otro escritor anexó la versión ${desde} primero`); // E11000
    this.commits.set(_id, { _id, stream, desde, hasta: versionEsperada + eventos.length, posicion,
      eventos: eventos.map((e) => ({ ...e, en: new Date() })) });
    return versionEsperada + eventos.length;
  }

  async leerDesde(desde, limite = 100) {
    return [...this.commits.values()].filter((c) => c.posicion > desde).sort((a, b) => a.posicion - b.posicion).slice(0, limite);
  }
}
```

```javascript
// Módulo 22 · F139 · Elige el almacén: ALMACEN=memoria (sin Docker) o MongoDB en MONGO_URL (por defecto).
import { MongoClient } from 'mongodb';
import { MONGO_URL } from '../comun/config.js';
import { AlmacenEventosMongo } from './almacen-mongo.js';
import { AlmacenEventosMemoria } from './almacen-memoria.js';

export async function abrirAlmacen({ tipo = process.env.ALMACEN ?? 'mongo', basedatos = 'modulo26' } = {}) {
  if (tipo === 'memoria') return { almacen: new AlmacenEventosMemoria(), cerrar: async () => {} };
  const cliente = await new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 3000 }).connect();
  const db = cliente.db(basedatos);
  const almacen = new AlmacenEventosMongo(db);
  await almacen.preparar();
  return { almacen, db, cerrar: () => cliente.close() };
}
```

`f139-event-sourcing/demo.js`:

```javascript
// Módulo 22 · F139 · Demo: un pedido como secuencia de eventos; su estado se reconstruye leyendo el stream.
// Ejecuta: node f139-event-sourcing/demo.js                    (MongoDB del docker-compose.yml)
//          ALMACEN=memoria node f139-event-sourcing/demo.js    (sin Docker: mismo resultado)
import { abrirAlmacen } from './almacen.js';
import { ejecutar, reconstruir } from './pedido.js';

const { almacen, db, cerrar } = await abrirAlmacen();
await db?.collection('f139_commits').deleteMany({ stream: 'pedido-P-1' });
console.log(`almacén: ${almacen.constructor.name}`);

await ejecutar(almacen, 'P-1', { tipo: 'Crear', cliente: 'ana' });
await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'TEC-1', cantidad: 2, precio: 120000 });
await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'MOU-1', cantidad: 1, precio: 45000 });
const version = await ejecutar(almacen, 'P-1', { tipo: 'Confirmar' });

const { eventos } = await almacen.leerStream('pedido-P-1');
eventos.forEach((e, i) => console.log(`  v${i + 1} ${e.tipo.padEnd(16)} ${JSON.stringify(e.datos)}`));
const estado = reconstruir(eventos);
console.log(`versión ${version} → estado ${estado.estado}, ${estado.lineas.length} líneas, total ${estado.total}`);
// «Viaje en el tiempo»: el estado tal como estaba tras el evento 2.
console.log(`estado en la v2: total ${reconstruir(eventos.slice(0, 2)).total}, ${reconstruir(eventos.slice(0, 2)).estado}`);
try {
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'USB-1', cantidad: 1, precio: 9000 });
} catch (error) { console.log(`AgregarLinea tras confirmar → ${error.name}: ${error.message}`); }
await cerrar();
```

#### 10. MINI-LABORATORIO

1. Sin Docker, con el almacén en memoria:

```bash
ALMACEN=memoria node f139-event-sourcing/demo.js
```

**Output esperado** (real):

```text
almacén: AlmacenEventosMemoria
  v1 PedidoCreado     {"cliente":"ana"}
  v2 LineaAgregada    {"sku":"TEC-1","cantidad":2,"precio":120000}
  v3 LineaAgregada    {"sku":"MOU-1","cantidad":1,"precio":45000}
  v4 PedidoConfirmado {}
versión 4 → estado CONFIRMADO, 2 líneas, total 285000
estado en la v2: total 240000, ABIERTO
AgregarLinea tras confirmar → ReglaDeNegocio: pedido CONFIRMADO: no admite líneas
```

2. Con MongoDB:

```bash
docker compose up -d --wait mongo
node f139-event-sourcing/demo.js
docker compose exec mongo mongosh --quiet modulo26 --eval 'db.f139_commits.find({}, {eventos: 0}).sort({posicion: 1})'
```

**Output esperado:** la demo imprime lo mismo con `almacén: AlmacenEventosMongo` en la primera línea. `mongosh` muestra
4 documentos con `_id` `pedido-P-1@1` … `pedido-P-1@4`, `desde`/`hasta` iguales en cada uno y `posicion` creciente.
*(Este paso no se pudo ejecutar en el entorno de redacción, que no tiene MongoDB: está en
`verificacion/microservicios/pendiente.md`.)*

3. Provoca el conflicto en `mongosh`: `db.f139_commits.insertOne({_id: 'pedido-P-1@4'})`. **Output esperado:** un
   error `E11000 duplicate key error collection: modulo26.f139_commits index: _id_ dup key: { _id: "pedido-P-1@4" }`
   (texto del servidor; puede variar ligeramente entre versiones).

#### 11. VERIFICACIÓN

```javascript
// Módulo 22 · F139 · Verificación: el MISMO contrato contra el almacén en memoria y contra MongoDB (MONGO_URL).
// Ejecuta: node --test f139-event-sourcing/almacen.test.js   (MongoDB se OMITE si no responde, salvo EXIGIR_INFRA=1)
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MONGO_URL } from '../comun/config.js';
import { omitirSinInfra } from '../comun/infra.js';
import { abrirAlmacen } from './almacen.js';
import { ejecutar, reconstruir, decidir, INICIAL, ReglaDeNegocio } from './pedido.js';

const sinMongo = await omitirSinInfra('MongoDB', MONGO_URL, 27017);

for (const tipo of ['memoria', 'mongo']) {
  describe(`almacén ${tipo}`, { skip: tipo === 'mongo' && sinMongo }, () => {
    let almacen, cerrar;
    const stream = () => `t${process.pid}x${Math.random().toString(36).slice(2, 8)}`;
    before(async () => ({ almacen, cerrar } = await abrirAlmacen({ tipo, basedatos: 'modulo26_test' })));
    after(async () => { await cerrar?.(); });

    test('anexar y leer: el estado se reconstruye de los eventos en orden', async () => {
      const id = stream();
      await ejecutar(almacen, id, { tipo: 'Crear', cliente: 'ana' });
      await ejecutar(almacen, id, { tipo: 'AgregarLinea', sku: 'A', cantidad: 2, precio: 10 });
      const v = await ejecutar(almacen, id, { tipo: 'Confirmar' });
      const { eventos, version } = await almacen.leerStream(`pedido-${id}`);
      assert.equal(v, 3); assert.equal(version, 3);
      assert.deepEqual(eventos.map((e) => e.tipo), ['PedidoCreado', 'LineaAgregada', 'PedidoConfirmado']);
      assert.deepEqual({ ...reconstruir(eventos), lineas: undefined }, { existe: true, estado: 'CONFIRMADO', cliente: 'ana', lineas: undefined, total: 20 });
    });

    test('versión esperada vieja → ConflictoDeConcurrencia (y no se escribe nada)', async () => {
      const s = `pedido-${stream()}`;
      await almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: { cliente: 'ana' } }]);
      await assert.rejects(almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: { cliente: 'eva' } }]), { name: 'ConflictoDeConcurrencia' });
      assert.equal((await almacen.leerStream(s)).eventos.length, 1);
    });

    test('dos escritores A LA VEZ con la misma versión: exactamente uno gana', async () => {
      const s = `pedido-${stream()}`;
      const r = await Promise.allSettled([1, 2, 3].map((n) => almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: { cliente: `c${n}` } }])));
      assert.equal(r.filter((x) => x.status === 'fulfilled').length, 1);
      assert.ok(r.filter((x) => x.status === 'rejected').every((x) => x.reason.name === 'ConflictoDeConcurrencia'));
    });

    test('un commit con varios eventos se guarda entero y avanza la versión en N', async () => {
      const s = `pedido-${stream()}`;
      const v = await almacen.anexar(s, 0, [{ tipo: 'PedidoCreado', datos: {} }, { tipo: 'LineaAgregada', datos: { cantidad: 1, precio: 5 } }]);
      assert.equal(v, 2);
      const commits = await almacen.leerDesde(0, 100_000);
      const mio = commits.filter((c) => c.stream === s);
      assert.equal(mio.length, 1); assert.equal(mio[0].eventos.length, 2);
    });
  });
}

test('las reglas viven en decidir(): no se agregan líneas a un pedido confirmado', () => {
  assert.throws(() => decidir({ ...INICIAL, existe: true, estado: 'CONFIRMADO' }, { tipo: 'AgregarLinea', sku: 'A', cantidad: 1, precio: 1 }), ReglaDeNegocio);
  assert.deepEqual(decidir({ ...INICIAL, estado: 'CANCELADO' }, { tipo: 'Cancelar' }), [], 'cancelar dos veces no genera eventos');
});
```

```bash
node --test f139-event-sourcing/almacen.test.js
```

**Output esperado:** sin MongoDB, `ℹ pass 5` y la suite `almacén mongo` marcada `# sin MongoDB en
mongodb://localhost:27017`; con MongoDB arriba, `ℹ pass 9`.

**Pregunta de comprobación:** ¿por qué `aplicar` no valida reglas y `decidir` sí?

#### 12. ERROR COMÚN

**Síntoma:** un pedido aparece **confirmado por 100** pero con un total de 150: se agregó una línea después de
confirmar, cosa que el código «prohíbe». **Causa:** el almacén anexa **sin versión esperada** (o con la versión leída al
escribir, no al decidir). Dos usuarios leen el pedido abierto a la vez; los dos deciden bien con lo que leyeron y los
dos eventos se guardan.

```javascript
// Módulo 22 · F139 · Error común: anexar SIN versión esperada («añade al final, sea cual sea el final»).
// Dos usuarios leen el pedido abierto a la vez: uno confirma y el otro agrega una línea. Los dos «tienen razón» con lo
// que leyeron, y los dos eventos se guardan: el pedido queda CONFIRMADO con una línea agregada DESPUÉS de confirmar.
// Ejecuta: node f139-event-sourcing/error-comun.js   (sin infraestructura)
import { AlmacenEventosMemoria } from './almacen-memoria.js';
import { decidir, reconstruir, ejecutar } from './pedido.js';

export async function ejecutarSinVersion(almacen, pedidoId, comando) {
  const { eventos } = await almacen.leerStream(`pedido-${pedidoId}`);
  const nuevos = decidir(reconstruir(eventos), comando);
  await new Promise((r) => setTimeout(r, 10));                         // el otro usuario escribe mientras tanto
  const { version } = await almacen.leerStream(`pedido-${pedidoId}`); // MAL: la versión se lee al ESCRIBIR, no al decidir
  return almacen.anexar(`pedido-${pedidoId}`, version, nuevos);
}

async function preparar() {
  const almacen = new AlmacenEventosMemoria();
  await ejecutar(almacen, 'P-1', { tipo: 'Crear', cliente: 'ana' });
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'TEC-1', cantidad: 1, precio: 100 });
  return almacen;
}
const confirmar = { tipo: 'Confirmar' };
const agregar = { tipo: 'AgregarLinea', sku: 'USB-1', cantidad: 1, precio: 50 };

if (import.meta.main) {
  let almacen = await preparar();
  await Promise.all([ejecutarSinVersion(almacen, 'P-1', confirmar), ejecutarSinVersion(almacen, 'P-1', agregar)]);
  let { eventos } = await almacen.leerStream('pedido-P-1');
  console.log(`SIN versión esperada: ${eventos.map((e) => e.tipo).join(' → ')}`);
  console.log(`  estado ${reconstruir(eventos).estado} con total ${reconstruir(eventos).total} (se confirmó por 100)`);

  almacen = await preparar();
  const resultados = await Promise.allSettled([ejecutar(almacen, 'P-1', confirmar), ejecutar(almacen, 'P-1', agregar)]);
  ({ eventos } = await almacen.leerStream('pedido-P-1'));
  console.log(`CON versión esperada: ${eventos.map((e) => e.tipo).join(' → ')}`);
  for (const r of resultados) if (r.status === 'rejected') console.log(`  el segundo reintentó, releyó y su regla lo frenó → ${r.reason.message}`);
}
```

Salida real de `node f139-event-sourcing/error-comun.js`:

```text
SIN versión esperada: PedidoCreado → LineaAgregada → PedidoConfirmado → LineaAgregada
  estado CONFIRMADO con total 150 (se confirmó por 100)
CON versión esperada: PedidoCreado → LineaAgregada → PedidoConfirmado
  el segundo reintentó, releyó y su regla lo frenó → pedido CONFIRMADO: no admite líneas
```

**Diagnóstico visual:** lee el stream del agregado y busca eventos que el estado anterior no permitía (una
`LineaAgregada` después de `PedidoConfirmado`). En MongoDB, dos commits con `desde` solapados o un `_id` que no sigue
`stream@versión` delatan un almacén sin control de concurrencia. **Arreglo:** la versión esperada es **la que leíste
para decidir**, y el almacén la hace cumplir con una clave única.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué es event sourcing y cómo manejas la concurrencia en un almacén de eventos?**

**Respuesta modelo:** es guardar el estado como la secuencia de eventos que lo produjeron, en lugar de sobrescribir el
estado actual; el estado se obtiene aplicando los eventos en orden. Me da historia completa, auditoría y la posibilidad
de construir vistas nuevas repitiendo los eventos. Cada agregado es un stream versionado. Para la concurrencia uso
control optimista: el comando lee el stream y su versión, decide, y anexa indicando la versión esperada; si otro
escribió entretanto, el almacén rechaza la escritura y el comando relee y decide otra vez, con un número limitado de
reintentos. En KurrentDB es la revisión esperada del stream; en MongoDB lo implemento con un documento por commit cuyo
`_id` es stream más versión, así la clave única hace cumplir la regla y el commit es atómico. Hay que cuidar la
evolución del esquema de eventos, los snapshots cuando un stream es largo y los datos personales. No lo uso para CRUD
simple.

#### 14. ANTI-PATRÓN RELACIONADO

**Eventos que son filas de una tabla con otro nombre.** Evita eventos tipo `PedidoActualizado { ...todoElEstado }`:
no dicen **qué pasó** ni por qué, cada uno repite el estado completo y la historia no se puede leer ni proyectar por
intención.

```javascript
// MAL: «algo cambió»; para saber qué, hay que comparar con el evento anterior.
{ tipo: 'PedidoActualizado', datos: { estado: 'ABIERTO', lineas: [/* todas */], total: 285000 } }

// BIEN: hechos de negocio con intención y solo los datos del hecho (pedido.js).
{ tipo: 'LineaAgregada', datos: { sku: 'MOU-1', cantidad: 1, precio: 45000 } }
```

---

### Proyecciones materializadas

#### 1. UBICACIÓN

Módulo 22, Lección 6 de 7 · Fase 2 · Laboratorio `examples/microservicios/modulo-26/f140-proyecciones/`.

#### 2. PRERREQUISITOS

- Ficha 5 (event sourcing, posición global).
- SQL básico: `CREATE TABLE`, `INSERT`, `UPDATE`, `SELECT … GROUP BY` y transacciones `BEGIN`/`COMMIT`/`ROLLBACK`
  (Módulo 15).

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** una proyección que convierte los eventos del almacén en una tabla SQL consultable, con **checkpoint en la
misma transacción** que los cambios, y **demostrar** que se puede repetir, sobrevive a una caída a mitad de lote y se
reconstruye igual desde cero. Lo compruebas cuando `proyeccion.test.js` pasa 5 de 5.

#### 4. ANALOGÍA VISUAL

Dibuja el **marcador de un estadio**. Abajo, en la cancha, un árbitro anota cada jugada en su libreta (los eventos).
Arriba, un operario mira la libreta y **actualiza el marcador** gigante: goles, faltas, tiempo. El público no lee la
libreta: mira el marcador. El operario pone un **clip** en la última jugada que pasó al marcador; si se distrae, sigue
desde el clip. Si el marcador se rompe, lo borra y lo rehace leyendo la libreta desde la primera página.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    S[("almacén de eventos<br/>(F139: memoria o MongoDB)")] -- "leerDesde(checkpoint, 100)" --> P["ProyeccionResumenPedidos"]
    subgraph TX["una transacción SQLite por commit"]
        P --> U["INSERT/UPDATE resumen_pedidos"]
        P --> K["UPDATE checkpoints SET posicion"]
    end
    U --> V[("vista: resumen_pedidos<br/>id · cliente · estado · lineas · total")]
    Q["consultas: ventas por cliente,<br/>pedidos abiertos…"] --> V
```

**Texto alternativo:** diagrama de flujo. La proyección ProyeccionResumenPedidos lee del almacén de eventos de la ficha
5 los commits posteriores a su checkpoint, en lotes de 100. Por cada commit abre una transacción de SQLite en la que
hace los INSERT o UPDATE en la tabla resumen_pedidos y actualiza la posición en la tabla checkpoints. La tabla
resumen_pedidos, con id, cliente, estado, líneas y total, es la vista que usan las consultas, como ventas por cliente o
pedidos abiertos.

#### 6. EXPLICACIÓN NIVEL 0

- En la ficha 5 guardaste **lo que pasó**. Pero para responder «¿cuánto vendimos a Ana?» tendrías que repasar todos
  los eventos de todos los pedidos cada vez: muy lento.
- Una **proyección** es un programa que lee los eventos **una vez** y va llenando una **tabla** pensada para esa
  pregunta.
- La tabla es una copia **derivada**: si se daña o quieres otra, la borras y la vuelves a llenar desde los eventos.
- La proyección recuerda **hasta dónde leyó** (el checkpoint) para continuar desde ahí.

#### 7. EXPLICACIÓN INTERMEDIA

- **`node:sqlite`** viene con Node 26 (SQLite 3.54.1 en 26.13.1): `new DatabaseSync(':memory:')` o un archivo,
  `db.exec(sql)` y sentencias preparadas `db.prepare(sql).run(...)` / `.get()` / `.all()`. Sin dependencias.
- **Un manejador por tipo de evento:** `PedidoCreado` → `INSERT`, `LineaAgregada` → suma al total, `PedidoConfirmado`
  → cambia el estado. Los tipos que no le interesan se ignoran.
- **Checkpoint atómico:** por cada commit del almacén, `BEGIN` → aplicar sus eventos → `UPDATE checkpoints` →
  `COMMIT`. Si algo falla, `ROLLBACK` deshace **también** el avance del checkpoint, y la siguiente ejecución repite ese
  commit completo. Resultado: cada evento afecta la vista **exactamente una vez**.
- **`ponerseAlDia()`** lee lotes desde el checkpoint hasta que no hay más; se llama en un bucle, con un temporizador o
  al recibir una notificación.
- **`reconstruir()`** borra la tabla, pone el checkpoint a 0 y repite todo: así cambias el esquema de la vista o
  arreglas un bug de la proyección.
- `INSERT OR IGNORE` es idempotente, pero `total = total + ?` **no**: por eso el checkpoint en la misma transacción no
  es opcional.

#### 8. EXPLICACIÓN MAESTRA

- **Dónde vive la vista.** Aquí, SQLite en el mismo proceso (simple, ideal para aprender y para vistas locales). En
  producción, la vista suele estar en la base que mejor responde a la pregunta: PostgreSQL para consultas relacionales,
  Elasticsearch para búsqueda, Redis para lecturas por clave muy rápidas. Si la vista y el checkpoint están en bases
  distintas, pierdes la atomicidad y necesitas manejadores idempotentes (por versión del agregado, como en la ficha 7).
- **Síncrona vs asíncrona.** Proyectar en la misma transacción que se escriben los eventos da lectura inmediata, pero
  acopla escritura y lectura y una proyección lenta frena los comandos. Asíncrona (esta ficha) desacopla y escala por
  separado a cambio de **consistencia eventual** (ficha 7).
- **Orden y huecos.** La proyección confía en que `leerDesde` devuelve en orden de posición. Con el almacén de MongoDB de
  la ficha 5 y escritores concurrentes, un commit puede hacerse visible después de otro con posición mayor; KurrentDB
  (`$all`) o change streams evitan el problema. Vigila el **retraso** de la proyección (posición del almacén menos
  checkpoint) como métrica (Módulo 21).
- **Reconstrucciones largas.** Con millones de eventos, reconstruir en el sitio deja la vista vacía durante horas:
  construye la vista nueva **al lado** (`resumen_pedidos_v2`), ponla al día y cambia el tráfico (blue-green de vistas).
- **Alternativas:** proyecciones del servidor en KurrentDB, vistas materializadas de PostgreSQL (`REFRESH MATERIALIZED
  VIEW`, que recalcula todo), o Kafka Streams/ksqlDB si los eventos ya están en Kafka.
- **Cuándo NO:** si una consulta sobre el propio almacén (un índice en MongoDB) basta y es rápida, no añadas una vista
  que mantener.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** con **`node:sqlite`** integrado (SQLite 3.54.1); lee del almacén de la ficha 5
(**mongodb 7.9.1** con **MongoDB 9.0.8**, o en memoria).

`f140-proyecciones/proyeccion.js`:

```javascript
// Módulo 22 · F140 · Proyección materializada: convierte los eventos de F139 en una TABLA lista para consultar.
// Requisitos: Node.js 26.13.1 LTS con node:sqlite integrado (SQLite 3.54.1; sin dependencias). Lee de cualquier almacén
// de F139 (memoria o MongoDB) con leerDesde(posicion).
//
// Regla de oro: el cambio en la tabla y el checkpoint (hasta qué posición llegó) se guardan en la MISMA transacción.
// Si el proceso muere a mitad, la transacción se deshace entera y al volver empieza desde el último checkpoint:
// ningún evento se aplica dos veces ni se salta.
import { DatabaseSync } from 'node:sqlite';

export class ProyeccionResumenPedidos {
  nombre = 'resumen_pedidos';

  constructor(almacen, { archivo = ':memory:', alAplicar = () => {} } = {}) {
    this.almacen = almacen;
    this.alAplicar = alAplicar; // gancho para los tests (simular una caída a mitad de lote)
    this.db = new DatabaseSync(archivo);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resumen_pedidos (
        id TEXT PRIMARY KEY, cliente TEXT, estado TEXT, lineas INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS checkpoints (nombre TEXT PRIMARY KEY, posicion INTEGER NOT NULL);
      INSERT OR IGNORE INTO checkpoints VALUES ('${this.nombre}', 0);`);
    this.sql = {
      // INSERT OR IGNORE es idempotente; el UPDATE con «total = total + ?» NO lo es: por eso hace falta el checkpoint.
      crear: this.db.prepare('INSERT OR IGNORE INTO resumen_pedidos (id, cliente, estado) VALUES (?, ?, ?)'),
      linea: this.db.prepare('UPDATE resumen_pedidos SET lineas = lineas + 1, total = total + ? WHERE id = ?'),
      estado: this.db.prepare('UPDATE resumen_pedidos SET estado = ? WHERE id = ?'),
      leerCheckpoint: this.db.prepare('SELECT posicion FROM checkpoints WHERE nombre = ?'),
      guardarCheckpoint: this.db.prepare('UPDATE checkpoints SET posicion = ? WHERE nombre = ?'),
    };
  }

  checkpoint() { return this.sql.leerCheckpoint.get(this.nombre).posicion; }

  // Un manejador por tipo de evento. Los tipos que no le interesan se ignoran (la proyección no es el agregado).
  aplicar(id, { tipo, datos }) {
    if (tipo === 'PedidoCreado') this.sql.crear.run(id, datos.cliente, 'ABIERTO');
    else if (tipo === 'LineaAgregada') this.sql.linea.run(datos.cantidad * datos.precio, id);
    else if (tipo === 'PedidoConfirmado') this.sql.estado.run('CONFIRMADO', id);
    else if (tipo === 'PedidoCancelado') this.sql.estado.run('CANCELADO', id);
  }

  // Lee lotes desde el checkpoint hasta alcanzar el final del almacén. Devuelve cuántos commits aplicó.
  async ponerseAlDia({ lote = 100 } = {}) {
    let aplicados = 0;
    for (;;) {
      const commits = await this.almacen.leerDesde(this.checkpoint(), lote);
      if (commits.length === 0) return aplicados;
      for (const commit of commits) {
        const id = commit.stream.replace(/^pedido-/, '');
        this.db.exec('BEGIN');
        try {
          for (const evento of commit.eventos) { this.alAplicar(evento); this.aplicar(id, evento); }
          this.sql.guardarCheckpoint.run(commit.posicion, this.nombre);
          this.db.exec('COMMIT');
          aplicados++;
        } catch (error) {
          this.db.exec('ROLLBACK');
          throw error;
        }
      }
    }
  }

  // Reconstruir: borrar la tabla y repetir TODOS los eventos. Así cambias el esquema de la vista o arreglas un bug.
  async reconstruir() {
    this.db.exec(`DELETE FROM resumen_pedidos; UPDATE checkpoints SET posicion = 0 WHERE nombre = '${this.nombre}';`);
    return this.ponerseAlDia();
  }

  consultar(sql, ...parametros) { return this.db.prepare(sql).all(...parametros); }
}
```

`f140-proyecciones/demo.js`:

```javascript
// Módulo 22 · F140 · Demo: 3 pedidos con event sourcing (F139) → proyección SQL → consultas que el agregado no sabe hacer.
// Ejecuta: ALMACEN=memoria node f140-proyecciones/demo.js     (o sin ALMACEN, con el MongoDB del docker-compose.yml)
import { abrirAlmacen } from '../f139-event-sourcing/almacen.js';
import { ejecutar } from '../f139-event-sourcing/pedido.js';
import { ProyeccionResumenPedidos } from './proyeccion.js';

const { almacen, db, cerrar } = await abrirAlmacen({ basedatos: 'modulo26_f140' });
if (db) { await db.dropDatabase(); await almacen.preparar(); } // MongoDB: empezar de cero en cada demo

const comandos = [
  ['P-1', { tipo: 'Crear', cliente: 'ana' }], ['P-1', { tipo: 'AgregarLinea', sku: 'TEC-1', cantidad: 2, precio: 120000 }],
  ['P-2', { tipo: 'Crear', cliente: 'luis' }], ['P-2', { tipo: 'AgregarLinea', sku: 'MOU-1', cantidad: 1, precio: 45000 }],
  ['P-1', { tipo: 'Confirmar' }], ['P-3', { tipo: 'Crear', cliente: 'ana' }],
  ['P-3', { tipo: 'AgregarLinea', sku: 'USB-1', cantidad: 3, precio: 9000 }], ['P-2', { tipo: 'Cancelar', motivo: 'cliente' }],
];
for (const [id, c] of comandos) await ejecutar(almacen, id, c);

const vista = new ProyeccionResumenPedidos(almacen);
console.log(`commits aplicados: ${await vista.ponerseAlDia()} · checkpoint: ${vista.checkpoint()}`);
console.table(vista.consultar('SELECT * FROM resumen_pedidos ORDER BY id'));
console.log('ventas confirmadas por cliente:', JSON.stringify(vista.consultar(
  "SELECT cliente, COUNT(*) AS pedidos, SUM(total) AS total FROM resumen_pedidos WHERE estado = 'CONFIRMADO' GROUP BY cliente")));
await ejecutar(almacen, 'P-3', { tipo: 'Confirmar' });
console.log(`llega 1 evento nuevo → aplicados: ${await vista.ponerseAlDia()} · checkpoint: ${vista.checkpoint()}`);
console.log(`sin eventos nuevos  → aplicados: ${await vista.ponerseAlDia()}`);
console.log(`reconstruir desde 0 → aplicados: ${await vista.reconstruir()} · misma tabla: ${JSON.stringify(vista.consultar('SELECT id, estado, total FROM resumen_pedidos ORDER BY id'))}`);
await cerrar();
```

#### 10. MINI-LABORATORIO

1. Sin Docker:

```bash
ALMACEN=memoria node f140-proyecciones/demo.js
```

**Output esperado** (real):

```text
commits aplicados: 8 · checkpoint: 8
┌─────────┬───────┬─────────┬──────────────┬────────┬────────┐
│ (index) │ id    │ cliente │ estado       │ lineas │ total  │
├─────────┼───────┼─────────┼──────────────┼────────┼────────┤
│ 0       │ 'P-1' │ 'ana'   │ 'CONFIRMADO' │ 1      │ 240000 │
│ 1       │ 'P-2' │ 'luis'  │ 'CANCELADO'  │ 1      │ 45000  │
│ 2       │ 'P-3' │ 'ana'   │ 'ABIERTO'    │ 1      │ 27000  │
└─────────┴───────┴─────────┴──────────────┴────────┴────────┘
ventas confirmadas por cliente: [{"cliente":"ana","pedidos":1,"total":240000}]
llega 1 evento nuevo → aplicados: 1 · checkpoint: 9
sin eventos nuevos  → aplicados: 0
reconstruir desde 0 → aplicados: 9 · misma tabla: [{"id":"P-1","estado":"CONFIRMADO","total":240000},{"id":"P-2","estado":"CANCELADO","total":45000},{"id":"P-3","estado":"CONFIRMADO","total":27000}]
```

**Captura comentada:** «ventas confirmadas por cliente» es una pregunta que el agregado de la ficha 5 no sabe
responder (solo conoce un pedido a la vez): la vista sí. El segundo `ponerseAlDia()` aplica solo el evento nuevo y el
tercero, ninguno.

2. Con MongoDB: `docker compose up -d --wait mongo` y `node f140-proyecciones/demo.js`. **Output esperado:** la misma
   salida (la demo borra la base `modulo26_f140` al empezar). *(Pendiente de ejecutar con MongoDB: ver
   `verificacion/microservicios/pendiente.md`.)*
3. Persiste la vista en un archivo: en `demo.js`, cambia `new ProyeccionResumenPedidos(almacen)` por
   `new ProyeccionResumenPedidos(almacen, { archivo: 'vista.db' })`, ejecuta y abre `sqlite3 vista.db 'SELECT * FROM
   checkpoints'` (si tienes la CLI de SQLite). **Output esperado:** `resumen_pedidos|9`.

#### 11. VERIFICACIÓN

```javascript
// Módulo 22 · F140 · Verificación: la proyección coincide con el agregado, se puede repetir, sobrevive a caídas y
// se reconstruye igual. Ejecuta: node --test f140-proyecciones/proyeccion.test.js   (sin infraestructura)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AlmacenEventosMemoria } from '../f139-event-sourcing/almacen-memoria.js';
import { ejecutar, reconstruir } from '../f139-event-sourcing/pedido.js';
import { ProyeccionResumenPedidos } from './proyeccion.js';
import { escenario, ProyeccionIngenua } from './error-comun.js';

async function almacenConPedidos() {
  const a = new AlmacenEventosMemoria();
  for (const [id, cliente, n] of [['P-1', 'ana', 2], ['P-2', 'luis', 1], ['P-3', 'ana', 3]]) {
    await ejecutar(a, id, { tipo: 'Crear', cliente });
    for (let i = 0; i < n; i++) await ejecutar(a, id, { tipo: 'AgregarLinea', sku: `S${i}`, cantidad: 1, precio: 10 });
  }
  await ejecutar(a, 'P-1', { tipo: 'Confirmar' });
  return a;
}

test('la tabla coincide con reconstruir() de cada stream', async () => {
  const almacen = await almacenConPedidos();
  const vista = new ProyeccionResumenPedidos(almacen);
  await vista.ponerseAlDia();
  for (const fila of vista.consultar('SELECT * FROM resumen_pedidos')) {
    const estado = reconstruir((await almacen.leerStream(`pedido-${fila.id}`)).eventos);
    assert.deepEqual([fila.estado, fila.total, fila.lineas], [estado.estado, estado.total, estado.lineas.length]);
  }
});

test('ponerseAlDia() dos veces no duplica nada (el checkpoint manda)', async () => {
  const vista = new ProyeccionResumenPedidos(await almacenConPedidos());
  const primera = await vista.ponerseAlDia();
  assert.equal(await vista.ponerseAlDia(), 0);
  assert.equal(vista.checkpoint(), primera);
  assert.equal(vista.consultar('SELECT SUM(total) AS t FROM resumen_pedidos')[0].t, 60);
});

test('caída a mitad de un commit: ROLLBACK y al reintentar el total es correcto', async () => {
  assert.equal(await escenario(ProyeccionResumenPedidos), 150);
});

test('reconstruir() desde cero da exactamente la misma tabla', async () => {
  const vista = new ProyeccionResumenPedidos(await almacenConPedidos());
  await vista.ponerseAlDia();
  const antes = vista.consultar('SELECT * FROM resumen_pedidos ORDER BY id');
  await vista.reconstruir();
  assert.deepEqual(vista.consultar('SELECT * FROM resumen_pedidos ORDER BY id'), antes);
});

test('error común: con el checkpoint fuera de la transacción, la caída duplica importes', async () => {
  assert.equal(await escenario(ProyeccionIngenua), 250);
});
```

```bash
node --test f140-proyecciones/proyeccion.test.js
```

**Output esperado:** `ℹ tests 5` y `ℹ pass 5`.

**Pregunta de comprobación:** si la proyección guardara el checkpoint por **evento** y no por **commit**, ¿qué
cambiaría en la caída a mitad de un commit con dos eventos?

#### 12. ERROR COMÚN

**Síntoma:** después de un reinicio del proceso, algunos totales de la vista están **inflados**; reconstruir desde cero
los arregla, hasta el siguiente reinicio. **Causa:** el checkpoint se guarda al final del lote, fuera de la transacción
de los cambios: si el proceso muere en medio, al volver repite eventos ya aplicados y los `UPDATE … + ?` suman dos veces.

```javascript
// Módulo 22 · F140 · Error común: guardar el checkpoint FUERA de la transacción (o después, «cuando termine el lote»).
// Si el proceso muere entre aplicar los eventos y guardar el checkpoint, al volver repite eventos ya aplicados y los
// totales se SUMAN dos veces. No hay error: la vista simplemente miente.
// Ejecuta: node f140-proyecciones/error-comun.js   (sin infraestructura)
import { AlmacenEventosMemoria } from '../f139-event-sourcing/almacen-memoria.js';
import { ejecutar } from '../f139-event-sourcing/pedido.js';
import { ProyeccionResumenPedidos } from './proyeccion.js';

export class ProyeccionIngenua extends ProyeccionResumenPedidos {
  async ponerseAlDia() {
    const commits = await this.almacen.leerDesde(this.checkpoint(), 100);
    for (const commit of commits) {
      for (const evento of commit.eventos) { this.alAplicar(evento); this.aplicar(commit.stream.replace(/^pedido-/, ''), evento); }
    }
    // MAL: el checkpoint se guarda al final, en otra «transacción»; si algo cae antes, todo lo anterior se repetirá
    if (commits.length) this.sql.guardarCheckpoint.run(commits.at(-1).posicion, this.nombre);
    return commits.length;
  }
}

export async function escenario(Clase) {
  const almacen = new AlmacenEventosMemoria();
  await ejecutar(almacen, 'P-1', { tipo: 'Crear', cliente: 'ana' });
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'A', cantidad: 1, precio: 100 });
  await ejecutar(almacen, 'P-1', { tipo: 'AgregarLinea', sku: 'B', cantidad: 1, precio: 50 });
  let caidas = 1;
  const vista = new Clase(almacen, {
    alAplicar: (e) => { if (e.datos.sku === 'B' && caidas-- > 0) throw new Error('el proceso murió'); },
  });
  await vista.ponerseAlDia().catch((e) => e);       // 1.ª ejecución: muere al procesar la línea B
  try { await vista.ponerseAlDia(); } catch {}      // reinicio: sigue desde el checkpoint guardado
  return vista.consultar("SELECT total FROM resumen_pedidos WHERE id = 'P-1'")[0]?.total;
}

if (import.meta.main) {
  console.log(`checkpoint fuera de la transacción → total de P-1 = ${await escenario(ProyeccionIngenua)} (debía ser 150)`);
  console.log(`checkpoint en la misma transacción → total de P-1 = ${await escenario(ProyeccionResumenPedidos)}`);
}
```

Salida real de `node f140-proyecciones/error-comun.js`:

```text
checkpoint fuera de la transacción → total de P-1 = 250 (debía ser 150)
checkpoint en la misma transacción → total de P-1 = 150
```

**Diagnóstico visual:** compara la vista con la verdad: para unos cuantos ids, `reconstruir(leerStream(id))` contra la
fila de la vista (el primer test lo hace). Si difieren solo en sumas, es repetición de eventos. **Arreglo:** checkpoint
en la misma transacción que los cambios, o manejadores idempotentes por versión si la vista y el checkpoint no pueden
compartir transacción.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo garantizas que una proyección no aplica un evento dos veces ni se salta ninguno?**

**Respuesta modelo:** con un checkpoint guardado de forma atómica con los cambios de la vista. La proyección lee los
eventos en orden global desde su última posición y, por cada commit o lote, abre una transacción en la base de la
vista, aplica los cambios y actualiza la posición, y confirma. Si muere a la mitad, la transacción se deshace entera,
incluida la posición, y al volver repite ese lote: cada evento se aplica exactamente una vez sobre la vista. Si la vista
está en una base sin transacciones o distinta de donde guardo la posición, hago los manejadores idempotentes, por
ejemplo ignorando eventos con versión menor o igual a la ya aplicada. Para no saltarme eventos necesito un orden global
fiable del almacén, cosa que KurrentDB da con `$all` y que en MongoDB hay que cuidar. Mido el retraso de la proyección y
puedo reconstruirla desde cero, idealmente en una tabla paralela.

#### 14. ANTI-PATRÓN RELACIONADO

**La proyección que consulta otros servicios para completar la vista.** Evita que el manejador de un evento haga un
`fetch` al catálogo para traer el nombre del producto: la reconstrucción desde cero hará millones de llamadas, el
resultado depende de **cuándo** reconstruyes (el nombre de hoy, no el del día del evento) y si el catálogo cae, la
proyección se para.

```javascript
// MAL: la vista depende de otro servicio en el momento de proyectar.
if (tipo === 'LineaAgregada') {
  const { nombre } = await (await fetch(`${CATALOGO}/productos/${datos.sku}`)).json();
  this.sql.linea.run(datos.cantidad * datos.precio, nombre, id);
}

// BIEN: el evento ya trae lo que la vista necesita (o la vista proyecta también los eventos del catálogo).
if (tipo === 'LineaAgregada') this.sql.linea.run(datos.cantidad * datos.precio, id);
```

---

### CQRS

#### 1. UBICACIÓN

Módulo 22, Lección 7 de 7 · Fase 2 · Laboratorio `examples/microservicios/modulo-26/f141-cqrs/`.

#### 2. PRERREQUISITOS

- Fichas 3 (`CommandBus`, `EventBus`), 5 (eventos versionados) y 6 (proyecciones).
- NestJS (Módulo 14).

#### 3. OBJETIVO DE APRENDIZAJE

**Separar** en un servicio NestJS el lado de escritura (comandos que validan reglas y emiten eventos) del lado de
lectura (consultas sobre un modelo desnormalizado que se actualiza con esos eventos), **explicar** la consistencia
eventual que aparece entre ambos y **resolver** el «leer lo que acabo de escribir» con una versión mínima. Lo
compruebas cuando `cqrs.test.js` pasa 5 de 5.

#### 4. ANALOGÍA VISUAL

Dibuja un **restaurante** con dos ventanillas. En la de **pedidos** (comandos) un mesero toma tu orden, revisa que el
plato exista y que haya ingredientes, y te da un número: no te muestra la carta. En la de **pantalla de turnos**
(consultas) ves los platos listos y en preparación, en grande, ordenados para leerlos de un vistazo. La pantalla se
actualiza **unos segundos después** de que la cocina avisa. Si acabas de pedir y miras la pantalla en el mismo
instante, tu número todavía no sale: no es que se perdió, es que la pantalla va un poco atrás.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    subgraph W["escritura (comandos)"]
        C1["CommandBus.execute(CambiarPrecio)"] --> H["CambiarPrecioHandler<br/>reglas: existe, subida ≤ 50 %"]
        H --> S[("AlmacenProductos<br/>eventos por producto")]
    end
    H -- "EventBus.publish(PrecioCambiado v2)" --> PR["ProyeccionCatalogo<br/>(@EventsHandler, asíncrona)"]
    subgraph R["lectura (consultas)"]
        PR --> V[("CatalogoLectura<br/>fichas desnormalizadas")]
        Q["QueryBus.execute(VerProducto id, versionMinima)"] --> QH["VerProductoHandler"] --> V
    end
    H -. "devuelve solo la versión (2)" .-> C1
```

**Texto alternativo:** diagrama de CQRS. En el lado de escritura, CommandBus ejecuta CambiarPrecio; su manejador valida
que el producto exista y que la subida no pase del 50 % y guarda el evento en AlmacenProductos, y devuelve solo la
versión nueva. El manejador publica PrecioCambiado versión 2 en el EventBus. En el lado de lectura, ProyeccionCatalogo,
un manejador de eventos asíncrono, actualiza CatalogoLectura, con fichas desnormalizadas. QueryBus ejecuta VerProducto
con un id y una versión mínima, y su manejador lee solo de CatalogoLectura.

#### 6. EXPLICACIÓN NIVEL 0

- Un programa hace dos tipos de cosas: **cambiar** datos («sube el precio») y **mostrar** datos («lista el catálogo
  barato»).
- Lo que se necesita para cambiar bien (reglas, versiones) no es lo mismo que para mostrar rápido (listas ordenadas,
  datos juntos).
- **CQRS** (separación de responsabilidades entre comandos y consultas) usa **dos modelos**: uno para escribir y otro
  para leer, conectados por eventos.
- El precio a pagar: el modelo de lectura se entera **un poco después**. Hay que diseñar las pantallas para eso.

#### 7. EXPLICACIÓN INTERMEDIA

- **Comandos** (`escritura.ts`): `CrearProducto` y `CambiarPrecio` extienden `Command<number>`; su manejador lee el
  modelo de escritura (solo lo necesario para decidir), valida reglas, anexa el evento con versión esperada, lo publica
  y **devuelve la versión**, no la ficha.
- **Consultas** (`lectura.ts`): `ListarCatalogo` y `VerProducto` extienden `Query<R>`; sus `@QueryHandler` solo leen
  `CatalogoLectura` y no validan nada.
- **Proyección:** `@EventsHandler(ProductoCreado, PrecioCambiado)` actualiza la ficha desnormalizada (precio,
  precio anterior, número de cambios, versión). Ignora eventos con versión menor o igual a la que ya tiene: es
  idempotente frente a duplicados (ficha 2) y a reenvíos.
- **Consistencia eventual:** la proyección corre después (aquí, 30 ms simulados). Una consulta justo después del
  comando ve el dato viejo.
- **Read-your-writes:** el comando devuelve la versión y la consulta acepta `versionMinima`: espera (con tope de 1 s) a
  que la vista la alcance. Otras formas: devolver el dato calculado en la respuesta del comando (optimista en la
  interfaz) o leer del lado de escritura solo para el propio usuario.
- **Reconstrucción:** como en la ficha 6, la vista se puede borrar y rehacer repitiendo los eventos.

#### 8. EXPLICACIÓN MAESTRA

- **Niveles de CQRS.** (1) Mismos datos, clases separadas para comandos y consultas: casi gratis, mejora el diseño.
  (2) Dos modelos en la misma base (tablas de lectura actualizadas en la misma transacción): sin consistencia eventual.
  (3) Dos bases y eventos entre ellas (este laboratorio, con event sourcing o sin él): escalas lectura y escritura por
  separado, eliges la tecnología de cada lado, pero aceptas consistencia eventual, más piezas y proyecciones que operar.
  Sube de nivel solo cuando el anterior duela.
- **CQRS sin event sourcing** es perfectamente válido (el lado de escritura puede ser un CRUD con outbox). **Event
  sourcing casi siempre necesita CQRS**, porque el almacén de eventos no sabe responder consultas.
- **Diseño de la interfaz.** La consistencia eventual se esconde con versiones mínimas, respuestas optimistas, mensajes
  «procesando» y notificaciones (WebSocket) cuando la vista se actualiza. Ignorarla produce reintentos del usuario
  (error común).
- **Alternativas:** un CRUD clásico con índices y réplicas de lectura de la base (las réplicas también tienen retraso);
  cachés de lectura (Redis) invalidadas por eventos; GraphQL con *resolvers* que leen vistas.
- **Cuándo NO usarlo:** la mayoría de servicios CRUD con pocas reglas y lecturas parecidas a las escrituras. CQRS en
  todo el sistema es un anti-patrón; se aplica en el **bounded context** donde lectura y escritura tienen necesidades
  realmente distintas (catálogo con millones de lecturas y pocos cambios, tableros de operación).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **TypeScript 6.0.3**, **@nestjs/core 12.5.1**, **@nestjs/cqrs 12.1.3** y
**@nestjs/testing 12.5.1** (compilado con el `tsconfig.json` de la ficha 3).

`f141-cqrs/src/escritura.ts`:

```typescript
// Módulo 22 · F141 · CQRS, lado de ESCRITURA (comandos): valida reglas, guarda eventos y los publica.
// Nunca responde consultas: un comando devuelve, como mucho, la versión nueva.
// Requisitos: Node.js 26.13.1 LTS, @nestjs/cqrs 12.1.3, TypeScript 6.0.3.
import { Injectable } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import type { ICommandHandler, IEvent } from '@nestjs/cqrs';

export class CrearProducto extends Command<number> { constructor(readonly id: string, readonly nombre: string, readonly precio: number) { super(); } }
export class CambiarPrecio extends Command<number> { constructor(readonly id: string, readonly precio: number) { super(); } }

export class ProductoCreado implements IEvent { constructor(readonly id: string, readonly version: number, readonly nombre: string, readonly precio: number) {} }
export class PrecioCambiado implements IEvent { constructor(readonly id: string, readonly version: number, readonly anterior: number, readonly precio: number) {} }
type EventoProducto = ProductoCreado | PrecioCambiado;

export class ReglaDeNegocio extends Error { name = 'ReglaDeNegocio'; }

// Modelo de escritura: solo lo necesario para DECIDIR (¿existe?, precio actual). Nada de listas ni filtros.
@Injectable()
export class AlmacenProductos {
  readonly streams = new Map<string, EventoProducto[]>();
  leer(id: string) {
    const eventos = this.streams.get(id) ?? [];
    const precio = eventos.reduce((p, e) => e.precio, 0);
    return { existe: eventos.length > 0, precio, version: eventos.length };
  }
  anexar(id: string, versionEsperada: number, evento: EventoProducto) {
    const eventos = this.streams.get(id) ?? [];
    if (eventos.length !== versionEsperada) throw new Error(`conflicto: ${id} va por la versión ${eventos.length}`);
    this.streams.set(id, [...eventos, evento]);
  }
}

@CommandHandler(CrearProducto)
export class CrearProductoHandler implements ICommandHandler<CrearProducto> {
  constructor(private readonly almacen: AlmacenProductos, private readonly eventos: EventBus) {}
  async execute({ id, nombre, precio }: CrearProducto) {
    if (this.almacen.leer(id).existe) throw new ReglaDeNegocio(`${id} ya existe`);
    if (precio <= 0) throw new ReglaDeNegocio('el precio debe ser positivo');
    const evento = new ProductoCreado(id, 1, nombre, precio);
    this.almacen.anexar(id, 0, evento);
    this.eventos.publish(evento); // el lado de lectura se entera por aquí
    return 1;
  }
}

@CommandHandler(CambiarPrecio)
export class CambiarPrecioHandler implements ICommandHandler<CambiarPrecio> {
  constructor(private readonly almacen: AlmacenProductos, private readonly eventos: EventBus) {}
  async execute({ id, precio }: CambiarPrecio) {
    const actual = this.almacen.leer(id);
    if (!actual.existe) throw new ReglaDeNegocio(`${id} no existe`);
    if (precio > actual.precio * 1.5) throw new ReglaDeNegocio(`subida mayor al 50 % (${actual.precio} → ${precio})`);
    const evento = new PrecioCambiado(id, actual.version + 1, actual.precio, precio);
    this.almacen.anexar(id, actual.version, evento);
    this.eventos.publish(evento);
    return evento.version;
  }
}
```

`f141-cqrs/src/lectura.ts`:

```typescript
// Módulo 22 · F141 · CQRS, lado de LECTURA (consultas): un modelo desnormalizado, pensado para las pantallas,
// que se actualiza escuchando eventos. Nunca valida reglas ni escribe en el modelo de escritura.
import { Injectable } from '@nestjs/common';
import { EventsHandler, Query, QueryHandler } from '@nestjs/cqrs';
import type { IEventHandler, IQueryHandler } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { ProductoCreado, PrecioCambiado } from './escritura.js';

export interface FichaProducto { id: string; nombre: string; precio: number; precioAnterior: number | null; cambios: number; version: number }

@Injectable()
export class CatalogoLectura {
  readonly fichas = new Map<string, FichaProducto>();
  retrasoMs = 30; // simula la propagación asíncrona (cola, otra réplica, otra base de datos)
}

@EventsHandler(ProductoCreado, PrecioCambiado)
export class ProyeccionCatalogo implements IEventHandler<ProductoCreado | PrecioCambiado> {
  constructor(private readonly catalogo: CatalogoLectura) {}
  async handle(e: ProductoCreado | PrecioCambiado) {
    await esperar(this.catalogo.retrasoMs);
    const ficha = this.catalogo.fichas.get(e.id);
    if (ficha && ficha.version >= e.version) return; // idempotente: un evento repetido o viejo no cambia nada
    if (e instanceof ProductoCreado) {
      this.catalogo.fichas.set(e.id, { id: e.id, nombre: e.nombre, precio: e.precio, precioAnterior: null, cambios: 0, version: e.version });
    } else if (ficha) {
      this.catalogo.fichas.set(e.id, { ...ficha, precio: e.precio, precioAnterior: e.anterior, cambios: ficha.cambios + 1, version: e.version });
    }
  }
}

export class ListarCatalogo extends Query<FichaProducto[]> { constructor(readonly precioMaximo = Infinity) { super(); } }
// versionMinima: «léeme al menos lo que yo acabo de escribir» (read-your-writes). Espera hasta 1 s.
export class VerProducto extends Query<FichaProducto | null> { constructor(readonly id: string, readonly versionMinima = 0) { super(); } }

@QueryHandler(ListarCatalogo)
export class ListarCatalogoHandler implements IQueryHandler<ListarCatalogo> {
  constructor(private readonly catalogo: CatalogoLectura) {}
  async execute({ precioMaximo }: ListarCatalogo) {
    return [...this.catalogo.fichas.values()].filter((f) => f.precio <= precioMaximo).sort((a, b) => a.precio - b.precio);
  }
}

@QueryHandler(VerProducto)
export class VerProductoHandler implements IQueryHandler<VerProducto> {
  constructor(private readonly catalogo: CatalogoLectura) {}
  async execute({ id, versionMinima }: VerProducto) {
    const limite = Date.now() + 1000;
    while ((this.catalogo.fichas.get(id)?.version ?? 0) < versionMinima && Date.now() < limite) await esperar(5);
    return this.catalogo.fichas.get(id) ?? null;
  }
}
```

`f141-cqrs/src/app.module.ts` y `f141-cqrs/src/main.ts`:

```typescript
// Módulo 22 · F141 · Los dos lados registrados en el mismo proceso. En producción suelen ser DOS despliegues con
// DOS bases de datos (p. ej. PostgreSQL para escribir y Elasticsearch o Redis para leer) unidos por un broker.
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AlmacenProductos, CrearProductoHandler, CambiarPrecioHandler } from './escritura.js';
import { CatalogoLectura, ProyeccionCatalogo, ListarCatalogoHandler, VerProductoHandler } from './lectura.js';

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [
    AlmacenProductos, CrearProductoHandler, CambiarPrecioHandler,             // escritura
    CatalogoLectura, ProyeccionCatalogo, ListarCatalogoHandler, VerProductoHandler, // lectura
  ],
})
export class CatalogoModule {}
```

```typescript
// Módulo 22 · F141 · Demo de CQRS: comandos por el CommandBus, consultas por el QueryBus, y la consistencia eventual
// entre los dos. Ejecuta: npm run build && node dist/f141-cqrs/src/main.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { CatalogoModule } from './app.module.js';
import { CrearProducto, CambiarPrecio } from './escritura.js';
import { ListarCatalogo, VerProducto } from './lectura.js';

const app = await NestFactory.createApplicationContext(CatalogoModule, { logger: ['error', 'warn'] });
const comandos = app.get(CommandBus);
const consultas = app.get(QueryBus);

await comandos.execute(new CrearProducto('TEC-1', 'Teclado', 120000));
await comandos.execute(new CrearProducto('MOU-1', 'Mouse', 45000));
await comandos.execute(new CrearProducto('USB-1', 'Memoria USB', 9000));
console.log('justo después de crear, catálogo:', (await consultas.execute(new ListarCatalogo())).length, 'productos');
await esperar(100);
console.log('100 ms después, hasta 50000:', JSON.stringify((await consultas.execute(new ListarCatalogo(50000))).map((f) => `${f.id}=${f.precio}`)));

const version = await comandos.execute(new CambiarPrecio('TEC-1', 99000));
console.log(`CambiarPrecio devolvió la versión ${version} (un comando no devuelve la ficha)`);
console.log('lectura inmediata  :', JSON.stringify(await consultas.execute(new VerProducto('TEC-1'))));
console.log('con versionMinima=2:', JSON.stringify(await consultas.execute(new VerProducto('TEC-1', version))));
try { await comandos.execute(new CambiarPrecio('MOU-1', 90000)); } catch (e) { console.log(`regla del lado de escritura → ${(e as Error).message}`); }
await app.close();
```

#### 10. MINI-LABORATORIO

1. Compila y ejecuta (no necesita Docker):

```bash
npm run build
node dist/f141-cqrs/src/main.js
```

**Output esperado** (real):

```text
justo después de crear, catálogo: 0 productos
100 ms después, hasta 50000: ["USB-1=9000","MOU-1=45000"]
CambiarPrecio devolvió la versión 2 (un comando no devuelve la ficha)
lectura inmediata  : {"id":"TEC-1","nombre":"Teclado","precio":120000,"precioAnterior":null,"cambios":0,"version":1}
con versionMinima=2: {"id":"TEC-1","nombre":"Teclado","precio":99000,"precioAnterior":120000,"cambios":1,"version":2}
regla del lado de escritura → subida mayor al 50 % (45000 → 90000)
```

**Captura comentada:** la primera línea es la consistencia eventual en estado puro: los tres comandos terminaron y la
vista todavía está vacía. La «lectura inmediata» devuelve la versión 1 (precio viejo); con `versionMinima=2` la consulta
espera unos milisegundos y devuelve el precio nuevo con su historia (`precioAnterior`, `cambios`).

2. Cambia `retrasoMs = 30` por `retrasoMs = 0` en `lectura.ts`, recompila y ejecuta. **Output esperado:** la primera
   línea sigue diciendo `0 productos`: aunque el retraso sea 0, el manejador de eventos es asíncrono (`await`) y la
   consulta llega antes. La consistencia eventual no desaparece bajando el retraso.
3. Ejecuta el error común: `node dist/f141-cqrs/src/error-comun.js` (salida en el punto 12).

#### 11. VERIFICACIÓN

```typescript
// Módulo 22 · F141 · Verificación de CQRS con @nestjs/cqrs 12.1.3 (sin infraestructura).
// Ejecuta: npm run build && node --test dist/f141-cqrs/src/cqrs.test.js
import 'reflect-metadata';
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { CatalogoModule } from './app.module.js';
import { CrearProducto, CambiarPrecio, PrecioCambiado, AlmacenProductos } from './escritura.js';
import { ListarCatalogo, VerProducto, CatalogoLectura } from './lectura.js';

let app: TestingModule, comandos: CommandBus, consultas: QueryBus;
beforeEach(async () => {
  app = await Test.createTestingModule({ imports: [CatalogoModule] }).compile();
  await app.init();
  comandos = app.get(CommandBus); consultas = app.get(QueryBus);
});
afterEach(() => app.close());

test('el comando devuelve solo la versión; la consulta devuelve la ficha desnormalizada', async () => {
  assert.equal(await comandos.execute(new CrearProducto('A', 'Teclado', 100)), 1);
  assert.equal(await comandos.execute(new CambiarPrecio('A', 120)), 2);
  const ficha = await consultas.execute(new VerProducto('A', 2));
  assert.deepEqual(ficha, { id: 'A', nombre: 'Teclado', precio: 120, precioAnterior: 100, cambios: 1, version: 2 });
});

test('consistencia eventual: justo después del comando la lectura todavía no lo ve', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  assert.equal(await consultas.execute(new VerProducto('A')), null);
  await esperar(80);
  assert.equal((await consultas.execute(new VerProducto('A')))?.precio, 100);
});

test('las reglas viven en el lado de escritura y no tocan el de lectura', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  await assert.rejects(comandos.execute(new CambiarPrecio('A', 1000)), /subida mayor al 50 %/);
  await assert.rejects(comandos.execute(new CrearProducto('B', 'Gratis', 0)), /positivo/);
  await esperar(80);
  assert.equal(app.get(AlmacenProductos).leer('A').version, 1);
  assert.equal((await consultas.execute(new ListarCatalogo())).length, 1);
});

test('la proyección es idempotente: un evento repetido no cuenta dos cambios', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  await comandos.execute(new CambiarPrecio('A', 110));
  app.get(EventBus).publish(new PrecioCambiado('A', 2, 100, 110)); // el broker lo entregó dos veces
  await esperar(100);
  assert.equal((await consultas.execute(new VerProducto('A')))?.cambios, 1);
});

test('el modelo de lectura se puede borrar y rehacer desde los eventos del de escritura', async () => {
  await comandos.execute(new CrearProducto('A', 'Teclado', 100));
  await comandos.execute(new CambiarPrecio('A', 90));
  await esperar(80);
  const antes = await consultas.execute(new VerProducto('A'));
  const lectura = app.get(CatalogoLectura);
  lectura.fichas.clear(); lectura.retrasoMs = 0;
  for (const eventos of app.get(AlmacenProductos).streams.values()) for (const e of eventos) app.get(EventBus).publish(e);
  assert.deepEqual(await consultas.execute(new VerProducto('A', 2)), antes);
});
```

```bash
npm run build && node --test dist/f141-cqrs/src/cqrs.test.js
```

**Output esperado:** `ℹ tests 5` y `ℹ pass 5`.

**Pregunta de comprobación:** ¿por qué el test de idempotencia publica un `PrecioCambiado` con versión 2 a mano y
espera que `cambios` siga en 1?

#### 12. ERROR COMÚN

**Síntoma:** usuarios que cambian un precio y ven el viejo en la pantalla siguiente; algunos lo vuelven a enviar y el
historial muestra cambios duplicados. **Causa:** la pantalla trata el lado de lectura como si fuera inmediato.

```typescript
// Módulo 22 · F141 · Error común: tratar el lado de lectura como si fuera inmediato. La pantalla guarda el precio y
// enseguida lo vuelve a leer: ve el VIEJO, cree que falló y lo envía otra vez (o muestra un dato falso).
// Ejecuta: npm run build && node dist/f141-cqrs/src/error-comun.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { setTimeout as esperar } from 'node:timers/promises';
import { CatalogoModule } from './app.module.js';
import { CrearProducto, CambiarPrecio } from './escritura.js';
import { VerProducto } from './lectura.js';

const app = await NestFactory.createApplicationContext(CatalogoModule, { logger: false });
const comandos = app.get(CommandBus), consultas = app.get(QueryBus);
await comandos.execute(new CrearProducto('TEC-1', 'Teclado', 100));
await esperar(100);

// MAL: escribir y leer sin pedir la versión que acabas de escribir.
await comandos.execute(new CambiarPrecio('TEC-1', 140));
const vista = await consultas.execute(new VerProducto('TEC-1'));
console.log(`MAL  → guardé 140 y la pantalla muestra ${vista?.precio}`);
try { await comandos.execute(new CambiarPrecio('TEC-1', 140)); console.log('       el usuario lo reintenta: segundo cambio aceptado, 2 eventos para un solo cambio real'); }
catch (e) { console.log(`       reintento → ${(e as Error).message}`); }

// BIEN: el comando devuelve la versión y la consulta espera a que la vista la alcance (read-your-writes).
const version = await comandos.execute(new CambiarPrecio('TEC-1', 150));
const buena = await consultas.execute(new VerProducto('TEC-1', version));
console.log(`BIEN → guardé 150 (versión ${version}) y la pantalla muestra ${buena?.precio}`);
await app.close();
```

Salida real de `node dist/f141-cqrs/src/error-comun.js`:

```text
MAL  → guardé 140 y la pantalla muestra 100
       el usuario lo reintenta: segundo cambio aceptado, 2 eventos para un solo cambio real
BIEN → guardé 150 (versión 4) y la pantalla muestra 150
```

**Diagnóstico visual:** en las trazas (Módulo 21), una petición de escritura seguida a pocos milisegundos de una de
lectura del mismo recurso que devuelve una versión menor; en los datos, eventos idénticos consecutivos del mismo
usuario. **Arreglo:** read-your-writes con `versionMinima`, respuesta optimista en la interfaz, o mostrar «guardado,
actualizando…» hasta que la vista alcance la versión.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué es CQRS, qué problema resuelve y qué te cuesta?**

**Respuesta modelo:** CQRS separa el modelo que procesa comandos, que cambian el estado y aplican reglas, del modelo
que responde consultas. Resuelve el conflicto entre lo que necesita la escritura, que es consistencia, invariantes y
concurrencia, y lo que necesita la lectura, que son vistas desnormalizadas, rápidas y quizá en otra tecnología, y
permite escalar cada lado por separado. En su forma ligera son solo clases separadas sobre los mismos datos; en su
forma completa son dos almacenes unidos por eventos, a menudo con event sourcing en la escritura. Lo que cuesta es la
consistencia eventual entre los dos lados, más infraestructura, proyecciones que operar y reconstruir, y manejadores
idempotentes. La consistencia eventual la gestiono devolviendo la versión en el comando y dejando que la consulta
espere esa versión, o con respuestas optimistas en la interfaz. Lo aplico solo donde lectura y escritura son muy
distintas, no en todo el sistema.

#### 14. ANTI-PATRÓN RELACIONADO

**El comando que devuelve la vista leyendo el modelo de lectura.** Evita que `CambiarPrecio` termine con
`return this.queryBus.execute(new VerProducto(id))`: devolverá el dato **viejo** (la proyección aún no corrió), y si
para «arreglarlo» haces la proyección síncrona dentro del comando, acoplas los dos lados y pierdes lo que CQRS te daba.

```typescript
// MAL: el comando lee la vista, que todavía no se ha actualizado.
async execute({ id, precio }: CambiarPrecio) { /* … */ this.eventos.publish(evento); return this.consultas.execute(new VerProducto(id)); }

// BIEN: el comando devuelve la versión; quien necesite la ficha la pide con versionMinima (escritura.ts y lectura.ts).
async execute({ id, precio }: CambiarPrecio) { /* … */ this.eventos.publish(evento); return evento.version; }
```
