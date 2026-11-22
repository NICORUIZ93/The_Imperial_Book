# Módulo 9 · Mensajería y patrones de datos

**Fase 2 · Node.js de cero a experto** (una semana y media de 12). **Duración:** 14 h (7 temas de unos 100 min y 2 h
20 min de laboratorio integrador). **Dificultad:** 5 de 5. **Dependencias:** Módulo 18 (Kafka y RabbitMQ, sync vs
async), Módulo 19 (retry, timeouts), Módulo 21 (traceparent en colas) y Módulo 15 (MongoDB); para las fichas 3 y 7,
Módulo 14 (NestJS). **Herramientas:**Node.js 26.13.1 LTS**, **TypeScript 6.0.3**, **amqplib 2.4.0** con
**RabbitMQ 4.4.1**, **redis (node-redis) 6.3.1** con **Redis 8.10.2**, **@nestjs/core 12.5.1** y **@nestjs/cqrs
12.1.3** con **rxjs 7.8.2**, **mongodb 7.9.1** (driver) con **MongoDB 9.0.8** y **`node:sqlite`** (integrado en Node
26). 
errores comunes; F135, F136 y F139-MongoDB se ejecutan si su servicio responde; los comandos de verificación indicados levanta
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
npm ci && npm run build             # tsc compila las fichas NestJS (F137 y F141) a dist/
docker compose up -d --wait         # RabbitMQ :5672 (consola :15672), Redis :6379, MongoDB :27017
  # tests + demos + errores comunes de las 7 fichas → «RESULTADO: OK»
docker compose down -v
```

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
// (o FALLAN si EXIGIR_INFRA=1, como hace los comandos de verificación indicados).
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

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar un publicador que solo da un mensaje por enviado cuando RabbitMQ lo confirma (y que detecta los mensajes que no llegan a ninguna cola) y un consumidor con acks manuales, prefetch y cola de mensajes muertos, y demostrar que ningún mensaje se pierde ni se queda atascado…

#### ► LA IDEA EN UNA FRASE
**Implementar un publicador que solo da un mensaje por enviado cuando RabbitMQ lo confirma (y que detecta los mensajes que no llegan a ninguna cola) y un consumidor con acks manuales, prefetch y cola de mensajes muertos, y demostrar que ningún mensaje se pierde ni se queda atascado.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en rabbitmq: publisher confirms, consumer acknowledgments como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Cuando tu programa envía un mensaje a RabbitMQ, **no sabe** si llegó: la red puede fallar justo en ese momento.
2. Con **publisher confirms**, RabbitMQ responde «lo tengo» por cada mensaje. Tu programa espera esa respuesta antes de
3. Del otro lado, el programa que recibe tiene que decir «ya lo procesé» (**ack**). Hasta que no lo dice, RabbitMQ
4. Si un mensaje está mal y nunca se podrá procesar, se aparta a una **cola de mensajes muertos** para revisarlo, en

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| RabbitMQ: publisher confirms, consumer acknowledgments se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar RabbitMQ: publisher confirms, consumer acknowledgments | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
noAck: true («auto-ack») en un consumidor que hace trabajo importante. Evítalo: el broker borra el mensaje en cuanto lo envía, antes de que lo proceses. Si el proceso muere a mitad, el mensaje se pierde sin rastro.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rabbitmq: publisher confirms, consumer acknowledgments funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando tu programa envía un mensaje a RabbitMQ, **no sabe** si llegó: la red puede fallar justo en ese momento.
- Con **publisher confirms**, RabbitMQ responde «lo tengo» por cada mensaje. Tu programa espera esa respuesta antes de
- Del otro lado, el programa que recibe tiene que decir «ya lo procesé» (**ack**). Hasta que no lo dice, RabbitMQ
- Si un mensaje está mal y nunca se podrá procesar, se aparta a una **cola de mensajes muertos** para revisarlo, en

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rabbitmq: publisher confirms, consumer acknowledgments en tu contexto?
2. ¿Cómo sabrías que rabbitmq: publisher confirms, consumer acknowledgments no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rabbitmq: publisher confirms, consumer acknowledgments?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Deduplicación con Redis

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar un consumidor que procesa cada mensaje una sola vez aunque llegue repetido, usando SET NX EX de Redis como marca atómica, y demostrar que 10 copias simultáneas producen un solo efecto y que un fallo no deja el mensaje marcado como hecho. Lo compruebas cuando dedup.tes…

#### ► LA IDEA EN UNA FRASE
**Implementar un consumidor que procesa cada mensaje una sola vez aunque llegue repetido, usando SET NX EX de Redis como marca atómica, y demostrar que 10 copias simultáneas producen un solo efecto y que un fallo no deja el mensaje marcado como hecho.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en deduplicación con redis como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. En la ficha 1 viste que un mensaje **puede llegar dos veces** (por ejemplo, si se pierde el «ya lo procesé»).
2. Si el mensaje es «cobrar 100 a Ana», procesarlo dos veces es un cobro doble.
3. La solución: anotar en una libreta compartida (**Redis**) qué mensajes ya procesaste, usando su identificador. Antes
4. El truco está en **mirar y anotar a la vez**, con una sola orden de Redis, para que dos copias que llegan juntas no

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Deduplicación con Redis se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Deduplicación con Redis | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Marcar como procesado ANTES de hacer el trabajo, sin caducidad ni limpieza. Evítalo: si el proceso muere después de marcar, el mensaje se reentrega, ve la marca «hecho» y se descarta. Has cambiado un duplicado por una pérdida.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: deduplicación con redis funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- En la ficha 1 viste que un mensaje **puede llegar dos veces** (por ejemplo, si se pierde el «ya lo procesé»).
- Si el mensaje es «cobrar 100 a Ana», procesarlo dos veces es un cobro doble.
- La solución: anotar en una libreta compartida (**Redis**) qué mensajes ya procesaste, usando su identificador. Antes
- El truco está en **mirar y anotar a la vez**, con una sola orden de Redis, para que dos copias que llegan juntas no

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve deduplicación con redis en tu contexto?
2. ¿Cómo sabrías que deduplicación con redis no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar deduplicación con redis?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
docker compose up -d --wait redis
node f136-dedup-redis/demo.js
```

```text
P-1 → procesado (cobrados 100)
P-2 → procesado (cobrados 50)
P-1 → duplicado
cobros reales: P-1, P-2
TTL de dedup:facturacion:P-1 = 604800 s · valor = hecho
```

```bash
docker compose exec redis redis-cli --scan --pattern 'dedup:*'
docker compose exec redis redis-cli TTL dedup:facturacion:P-1
```

</details>

### Sagas con NestJS CQRS

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar una saga coreografiada con @nestjs/cqrs que reacciona a eventos (@Saga()), ejecuta el comando del paso siguiente y, si un paso falla, ejecuta la compensación de los anteriores, y demostrar con tests los tres caminos (feliz, fallo sin compensar y fallo con compensación…

#### ► LA IDEA EN UNA FRASE
**Implementar una saga coreografiada con @nestjs/cqrs que reacciona a eventos (@Saga()), ejecuta el comando del paso siguiente y, si un paso falla, ejecuta la compensación de los anteriores, y demostrar con tests los tres caminos (feliz, fallo sin compensar y fallo con compensación).**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sagas con nestjs cqrs como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Comprar en una tienda online toca varios servicios: **inventario** (apartar el producto), **pagos** (cobrar) y
2. No existe un botón «hazlo todo o nada» entre bases de datos distintas. Entonces se hace **paso a paso**, y cada paso
3. Si el cobro falla después de apartar el producto, hay que **devolver el producto al estante**. Eso es una
4. Una **saga** es la receta que dice qué paso sigue cuando uno sale bien y qué deshacer cuando uno sale mal.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sagas con NestJS CQRS se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sagas con NestJS CQRS | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La saga que llama directamente a los servicios. Evita que la saga haga el trabajo (llamar al inventario, cobrar) dentro del map: mezcla la decisión «qué sigue» con efectos de red, no hay manejador que reintentar ni evento que registrar, y cualquier excepción la apaga.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sagas con nestjs cqrs funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Comprar en una tienda online toca varios servicios: **inventario** (apartar el producto), **pagos** (cobrar) y
- No existe un botón «hazlo todo o nada» entre bases de datos distintas. Entonces se hace **paso a paso**, y cada paso
- Si el cobro falla después de apartar el producto, hay que **devolver el producto al estante**. Eso es una
- Una **saga** es la receta que dice qué paso sigue cuando uno sale bien y qué deshacer cuando uno sale mal.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sagas con nestjs cqrs en tu contexto?
2. ¿Cómo sabrías que sagas con nestjs cqrs no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sagas con nestjs cqrs?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Compensaciones idempotentes

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Diseñar compensaciones que se pueden ejecutar varias veces y llegar desordenadas sin dañar los datos (clave estable, estado en vez de delta y «lápida» para lo que todavía no ocurrió), y demostrar que con respuestas perdidas y reintentos el dinero vuelve exactamente una vez. Lo co…

#### ► LA IDEA EN UNA FRASE
**Diseñar compensaciones que se pueden ejecutar varias veces y llegar desordenadas sin dañar los datos (clave estable, estado en vez de delta y «lápida» para lo que todavía no ocurrió), y demostrar que con respuestas perdidas y reintentos el dinero vuelve exactamente una vez.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en compensaciones idempotentes como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Una compensación es el «deshacer» de un paso de la saga: si cobraste y luego algo falló, **reembolsas**.
2. Pero la red puede fallar justo cuando el servicio de pagos responde «hecho». El coordinador no lo sabe y lo **vuelve a
3. Si el reembolso «suma 300» cada vez que se lo piden, Ana recibe 900. Si el reembolso dice «deja este cobro como
4. Y a veces el «deshacer» llega **antes** que el «hacer» (los mensajes viajan por caminos distintos). Hay que recordar

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Compensaciones idempotentes se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Compensaciones idempotentes | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Compensar con un DELETE. Evita «deshacer» borrando la fila del cobro: pierdes el historial, contabilidad no cuadra, y si el borrado se reintenta después de que otro proceso reinsertó algo con la misma clave, borras lo que no era tuyo.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: compensaciones idempotentes funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una compensación es el «deshacer» de un paso de la saga: si cobraste y luego algo falló, **reembolsas**.
- Pero la red puede fallar justo cuando el servicio de pagos responde «hecho». El coordinador no lo sabe y lo **vuelve a
- Si el reembolso «suma 300» cada vez que se lo piden, Ana recibe 900. Si el reembolso dice «deja este cobro como
- Y a veces el «deshacer» llega **antes** que el «hacer» (los mensajes viajan por caminos distintos). Hay que recordar

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve compensaciones idempotentes en tu contexto?
2. ¿Cómo sabrías que compensaciones idempotentes no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar compensaciones idempotentes?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Event Sourcing con EventStoreDB o MongoDB

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar un agregado con event sourcing (decidir → eventos → aplicar) y un almacén de eventos sobre MongoDB con concurrencia optimista, y demostrar que el estado se reconstruye de los eventos y que dos escritores con la misma versión no pueden escribir los dos. Lo compruebas c…

#### ► LA IDEA EN UNA FRASE
**Implementar un agregado con event sourcing (decidir → eventos → aplicar) y un almacén de eventos sobre MongoDB con concurrencia optimista, y demostrar que el estado se reconstruye de los eventos y que dos escritores con la misma versión no pueden escribir los dos.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en event sourcing con eventstoredb o mongodb como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Lo normal es guardar **cómo está** algo ahora: «pedido P-1: confirmado, total 285.000». Si cambia, se sobrescribe y
2. Con **event sourcing** se guarda **lo que pasó**, en orden: «se creó», «se agregó un teclado», «se agregó un mouse»,
3. Para saber cómo está el pedido, se **repasan** los eventos de principio a fin. Así también puedes saber cómo estaba
4. Cada pedido tiene su propia lista de eventos (un **stream**), numerada (la **versión**).

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Event Sourcing con EventStoreDB o MongoDB se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Event Sourcing con EventStoreDB o MongoDB | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Eventos que son filas de una tabla con otro nombre. Evita eventos tipo PedidoActualizado {...todoElEstado }: no dicen qué pasó ni por qué, cada uno repite el estado completo y la historia no se puede leer ni proyectar por intención.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: event sourcing con eventstoredb o mongodb funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Lo normal es guardar **cómo está** algo ahora: «pedido P-1: confirmado, total 285.000». Si cambia, se sobrescribe y
- Con **event sourcing** se guarda **lo que pasó**, en orden: «se creó», «se agregó un teclado», «se agregó un mouse»,
- Para saber cómo está el pedido, se **repasan** los eventos de principio a fin. Así también puedes saber cómo estaba
- Cada pedido tiene su propia lista de eventos (un **stream**), numerada (la **versión**).

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve event sourcing con eventstoredb o mongodb en tu contexto?
2. ¿Cómo sabrías que event sourcing con eventstoredb o mongodb no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar event sourcing con eventstoredb o mongodb?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Proyecciones materializadas

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir una proyección que convierte los eventos del almacén en una tabla SQL consultable, con checkpoint en la misma transacción que los cambios, y demostrar que se puede repetir, sobrevive a una caída a mitad de lote y se reconstruye igual desde cero. Lo compruebas cuando pro…

#### ► LA IDEA EN UNA FRASE
**Construir una proyección que convierte los eventos del almacén en una tabla SQL consultable, con checkpoint en la misma transacción que los cambios, y demostrar que se puede repetir, sobrevive a una caída a mitad de lote y se reconstruye igual desde cero.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en proyecciones materializadas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. En la ficha 5 guardaste **lo que pasó**. Pero para responder «¿cuánto vendimos a Ana?» tendrías que repasar todos
2. Una **proyección** es un programa que lee los eventos **una vez** y va llenando una **tabla** pensada para esa
3. La tabla es una copia **derivada**: si se daña o quieres otra, la borras y la vuelves a llenar desde los eventos.
4. La proyección recuerda **hasta dónde leyó** (el checkpoint) para continuar desde ahí.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Proyecciones materializadas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Proyecciones materializadas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La proyección que consulta otros servicios para completar la vista. Evita que el manejador de un evento haga un fetch al catálogo para traer el nombre del producto: la reconstrucción desde cero hará millones de llamadas, el resultado depende de cuándo reconstruyes (el nombre de hoy, no el del día del evento) y si el catálogo cae, la proyección se p…

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: proyecciones materializadas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- En la ficha 5 guardaste **lo que pasó**. Pero para responder «¿cuánto vendimos a Ana?» tendrías que repasar todos
- Una **proyección** es un programa que lee los eventos **una vez** y va llenando una **tabla** pensada para esa
- La tabla es una copia **derivada**: si se daña o quieres otra, la borras y la vuelves a llenar desde los eventos.
- La proyección recuerda **hasta dónde leyó** (el checkpoint) para continuar desde ahí.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve proyecciones materializadas en tu contexto?
2. ¿Cómo sabrías que proyecciones materializadas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar proyecciones materializadas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### CQRS

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Separar en un servicio NestJS el lado de escritura (comandos que validan reglas y emiten eventos) del lado de lectura (consultas sobre un modelo desnormalizado que se actualiza con esos eventos), explicar la consistencia eventual que aparece entre ambos y resolver el «leer lo que…

#### ► LA IDEA EN UNA FRASE
**Separar en un servicio NestJS el lado de escritura (comandos que validan reglas y emiten eventos) del lado de lectura (consultas sobre un modelo desnormalizado que se actualiza con esos eventos), explicar la consistencia eventual que aparece entre ambos y resolver el «leer lo que acabo de escribir» con una versión mínima.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en cqrs como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un programa hace dos tipos de cosas: **cambiar** datos («sube el precio») y **mostrar** datos («lista el catálogo
2. Lo que se necesita para cambiar bien (reglas, versiones) no es lo mismo que para mostrar rápido (listas ordenadas,
3. **CQRS** (separación de responsabilidades entre comandos y consultas) usa **dos modelos**: uno para escribir y otro
4. El precio a pagar: el modelo de lectura se entera **un poco después**. Hay que diseñar las pantallas para eso.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| CQRS se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar CQRS | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El comando que devuelve la vista leyendo el modelo de lectura. Evita que CambiarPrecio termine con return this.queryBus.execute(new VerProducto(id)): devolverá el dato viejo (la proyección aún no corrió), y si para «arreglarlo» haces la proyección síncrona dentro del comando, acoplas los dos lados y pierdes lo que CQRS te daba.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: cqrs funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un programa hace dos tipos de cosas: **cambiar** datos («sube el precio») y **mostrar** datos («lista el catálogo
- Lo que se necesita para cambiar bien (reglas, versiones) no es lo mismo que para mostrar rápido (listas ordenadas,
- **CQRS** (separación de responsabilidades entre comandos y consultas) usa **dos modelos**: uno para escribir y otro
- El precio a pagar: el modelo de lectura se entera **un poco después**. Hay que diseñar las pantallas para eso.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve cqrs en tu contexto?
2. ¿Cómo sabrías que cqrs no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar cqrs?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

</details>
