# Módulo 18 · Comunicación

**Fase 2 · Node.js de cero a experto** (semana 7 de 12). **Duración:** 14 h (6 temas de 2 h y 2 h de laboratorio
integrador). **Dificultad:** 2 de 5 en REST, 3 de 5 en gRPC, GraphQL y mensajería, 4 de 5 en decidir entre síncrono y
asíncrono. **Dependencias:** Módulo 17 (estructura, configuración, descubrimiento), Módulo 14 (API REST) y Módulo 13
(promesas, `async/await`, streams). **Herramientas:** **Node.js 26.13.1 LTS**, **axios 1.21.1**, **@grpc/grpc-js
1.14.7** + **@grpc/proto-loader 0.8.1**, **@apollo/server 5.5.2** + **graphql 16.15.0** + **dataloader 2.2.3**,
**kafkajs 2.2.4**, **amqplib 2.4.0**, **@nats-io/transport-node 3.5.0**; brokers **Apache Kafka 4.4.0**, **RabbitMQ
4.4.1** y **NATS Server 2.15.3** (Docker Compose).
(los comandos de verificación indicados ejecuta 32 tests sin infraestructura y las demos; los comandos de verificación indicados levanta los tres
brokers y ejecuta además los tests y demos de Kafka, RabbitMQ y NATS).

Un microservicio aislado no sirve de mucho: el valor aparece cuando **conversan**. Hay dos grandes formas de
conversar. **Síncrona:** uno pregunta y espera la respuesta (REST, gRPC, GraphQL). **Asíncrona:** uno deja un mensaje
y sigue con lo suyo; otro lo procesa después (Kafka, RabbitMQ, NATS). Este módulo te enseña las seis herramientas en
Node y, en el último tema, cómo elegir entre las dos formas, que es la decisión que más condiciona la disponibilidad
de tu sistema.

```mermaid
flowchart LR
    T1["1 · REST con<br/>Axios/Fetch"] --> T2["2 · gRPC con<br/>@grpc/grpc-js"]
    T1 --> T3["3 · GraphQL con<br/>Apollo Server"]
    T1 --> T4["4 · KafkaJS, amqplib"]
    T4 --> T5["5 · NATS"]
    T2 --> T6["6 · Sync vs async"]
    T3 --> T6
    T5 --> T6
```

**Texto alternativo:** mapa del módulo. El tema 1 (REST con Axios/Fetch) lleva a los temas 2 (gRPC con
@grpc/grpc-js), 3 (GraphQL con Apollo Server) y 4 (KafkaJS, amqplib). El tema 4 lleva al 5 (NATS). Los temas 2, 3 y 5
llevan al tema 6 (Sync vs async).

**Cómo usar el laboratorio.** Con Node 26 activo:

```bash
  # npm ci + 32 tests + demos de REST, gRPC, GraphQL y sync/async → «RESULTADO: OK»
los comandos de verificación indicados  # además: Kafka, RabbitMQ y NATS con Docker Compose y sus tests
```

Todas las órdenes de las fichas se ejecutan **desde `modulo-22`** después de `npm ci`. Todo el
módulo es JavaScript con módulos ES que Node ejecuta tal cual. `package.json` del laboratorio (con
`package-lock.json` que fija el árbol completo):

```json
{
  "name": "modulo-18-comunicacion-node",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 18 (Fase 2): Comunicación entre microservicios Node.",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "test": "node --test --test-concurrency=1 'f1*/*.test.js'",
    "test:infra": "node --test --test-concurrency=1 'f1*/*.infra.js'"
  },
  "dependencies": {
    "@apollo/server": "5.5.2",
    "@grpc/grpc-js": "1.14.7",
    "@grpc/proto-loader": "0.8.1",
    "@nats-io/transport-node": "3.5.0",
    "amqplib": "2.4.0",
    "axios": "1.21.1",
    "dataloader": "2.2.3",
    "graphql": "16.15.0",
    "kafkajs": "2.2.4"
  }
}
```

`docker-compose.yml` (temas 4 y 5):

```yaml
# Módulo 18 (modulo-22) · Brokers para F116 (Kafka y RabbitMQ) y F117 (NATS).
# Arranca:  docker compose up -d --wait   (espera a que los tres healthchecks estén «healthy»)
# Detén:    docker compose down -v        (topics, colas y mensajes se borran)
name: modulo-22
services:
  kafka:
    image: apache/kafka:4.4.0
    # Sin variables: la imagen arranca un nodo KRaft (broker + controlador) anunciado en localhost:9092.
    ports:
      - "9092:9092"
    healthcheck:
      test: ["CMD-SHELL", "/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list >/dev/null"]
      interval: 5s
      timeout: 15s
      retries: 30
  rabbitmq:
    image: rabbitmq:4.4.1-management
    environment:
      RABBITMQ_DEFAULT_USER: academia
      RABBITMQ_DEFAULT_PASS: academia
    ports:
      - "5672:5672"     # AMQP 0-9-1 (la aplicación)
      - "15672:15672"   # consola web: http://localhost:15672 (academia / academia)
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 5s
      timeout: 10s
      retries: 30
  nats:
    # La variante alpine trae shell y wget para el healthcheck (la imagen «scratch» no tiene ni shell).
    image: nats:2.15.3-alpine
    command: ["-m", "8222"]   # -m expone el monitoreo HTTP
    ports:
      - "4222:4222"     # clientes
      - "8222:8222"     # monitoreo: http://localhost:8222/healthz, /connz, /subsz
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O- http://localhost:8222/healthz | grep -q ok"]
      interval: 3s
      timeout: 5s
      retries: 30
```

---


### REST con Axios/Fetch

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar un cliente REST entre servicios con fetch y otro con Axios que tengan timeout, id de correlación y traducción de errores a un tipo propio, y distinguir cómo trata cada uno un 404, un 503, una respuesta lenta y un servicio apagado; lo compruebas cuando node --test f113…

#### ► LA IDEA EN UNA FRASE
**Implementar un cliente REST entre servicios con fetch y otro con Axios que tengan timeout, id de correlación y traducción de errores a un tipo propio, y distinguir cómo trata cada uno un 404, un 503, una respuesta lenta y un servicio apagado; lo compruebas cuando node --test f113-rest/clientes.test.js pasa 10 de 10.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en rest con axios/fetch como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    P["pedidos"] -- "GET /existencias/TEC-1<br/>x-request-id · timeout" --> I["inventario"]
    I --> R{"¿qué volvió?"}
    R -- "200 + JSON" --> OK["fetch: resuelve, res.ok = true<br/>axios: resuelve, data = objeto"]
    R -- "404 / 503" --> HTTP["fetch: RESUELVE, res.ok = false<br/>axios: RECHAZA, error.response"]
    R -- "nada a tiempo" --> TO["fetch: rechaza, TimeoutError<br/>axios: rechaza, code ECONNABORTED"]
    R -- "conexión rechazada" --> NET["fetch: rechaza, TypeError (cause.code)<br/>axios: rechaza, code ECONNREFUSED"]
    OK --> D["dato"]
    HTTP --> E["ErrorDeInventario<br/>NO_ENCONTRADO | NO_DISPONIBLE"]
    TO --> E2["ErrorDeInventario<br/>TIEMPO_AGOTADO"]
    NET --> E3["ErrorDeInventario<br/>NO_DISPONIBLE"]
```

1. Cuando un servicio necesita un dato de otro, lo más directo es **preguntarle por HTTP**, igual que tu navegador le
2. El que pregunta es el **cliente** y el que responde, el **servidor**. Un microservicio suele ser las dos cosas:
3. En Node hay dos herramientas habituales para hacer de cliente: **`fetch`**, que ya viene con Node, y **Axios**, una
4. Preguntar por la red puede salir mal de formas que no existen dentro de un programa: el otro tarda demasiado, está

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| REST con Axios/Fetch se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar REST con Axios/Fetch | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Llamadas HTTP crudas repartidas por el código, sin timeout y con la URL concatenada:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rest con axios/fetch funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando un servicio necesita un dato de otro, lo más directo es **preguntarle por HTTP**, igual que tu navegador le
- El que pregunta es el **cliente** y el que responde, el **servidor**. Un microservicio suele ser las dos cosas:
- En Node hay dos herramientas habituales para hacer de cliente: **`fetch`**, que ya viene con Node, y **Axios**, una
- Preguntar por la red puede salir mal de formas que no existen dentro de un programa: el otro tarda demasiado, está

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rest con axios/fetch en tu contexto?
2. ¿Cómo sabrías que rest con axios/fetch no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rest con axios/fetch?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    P["pedidos"] -- "GET /existencias/TEC-1<br/>x-request-id · timeout" --> I["inventario"]
    I --> R{"¿qué volvió?"}
    R -- "200 + JSON" --> OK["fetch: resuelve, res.ok = true<br/>axios: resuelve, data = objeto"]
    R -- "404 / 503" --> HTTP["fetch: RESUELVE, res.ok = false<br/>axios: RECHAZA, error.response"]
    R -- "nada a tiempo" --> TO["fetch: rechaza, TimeoutError<br/>axios: rechaza, code ECONNABORTED"]
    R -- "conexión rechazada" --> NET["fetch: rechaza, TypeError (cause.code)<br/>axios: rechaza, code ECONNREFUSED"]
    OK --> D["dato"]
    HTTP --> E["ErrorDeInventario<br/>NO_ENCONTRADO | NO_DISPONIBLE"]
    TO --> E2["ErrorDeInventario<br/>TIEMPO_AGOTADO"]
    NET --> E3["ErrorDeInventario<br/>NO_DISPONIBLE"]
```

```javascript
// Módulo 18 · F113 · Servicio «inventario»: el servidor REST al que llaman los clientes de esta ficha.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). Ejecuta: node f113-rest/servicio-inventario.js
import { createServer } from 'node:http';
import { setTimeout as dormir } from 'node:timers/promises';

const EXISTENCIAS = { 'TEC-1': 12, 'MOU-2': 0 };

export function crearInventario() {
  return createServer(async (req, res) => {
    const json = (status, cuerpo) => res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(cuerpo));
    const m = /^\/existencias\/([\w-]+)$/.exec(req.url);
    if (req.method !== 'GET' || !m) return json(404, { detalle: `No existe ${req.method} ${req.url}` });
    const sku = m[1];
    if (sku === 'LENTO') await dormir(1500); // simula un servicio saturado
    if (sku === 'ROTO') return json(503, { detalle: 'Inventario en mantenimiento' });
    if (!(sku in EXISTENCIAS) && sku !== 'LENTO') return json(404, { detalle: `No existe el SKU ${sku}` });
    // Devuelve también el id de correlación que mandó el cliente: así se sigue una petición entre servicios.
    json(200, { sku, disponibles: EXISTENCIAS[sku] ?? 1, requestId: req.headers['x-request-id'] ?? null });
  });
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3113);
  crearInventario().listen(puerto, () => console.log(`inventario escuchando en http://localhost:${puerto}`));
}
```

```javascript
// Los dos clientes traducen CUALQUIER fallo de la llamada a este error, con un tipo que el resto del
// servicio entiende sin saber si por debajo hay fetch o axios.
export class ErrorDeInventario extends Error {
  constructor(tipo, mensaje, opciones) {
    super(mensaje, opciones);
    this.name = 'ErrorDeInventario';
    this.tipo = tipo; // 'NO_ENCONTRADO' | 'TIEMPO_AGOTADO' | 'NO_DISPONIBLE'
  }
}
```

```javascript
// Módulo 18 · F113 · Cliente REST con fetch (nativo en Node.js 26: no se instala nada).
// Requisitos: Node.js 26.13.1 LTS.
import { randomUUID } from 'node:crypto';
import { ErrorDeInventario } from './errores.js';

export function clienteFetch(baseUrl, { timeoutMs = 1000 } = {}) {
  return {
    async existencias(sku) {
      let res;
      try {
        res = await fetch(new URL(`/existencias/${encodeURIComponent(sku)}`, baseUrl), {
          headers: { accept: 'application/json', 'x-request-id': randomUUID() },
          // fetch NO tiene timeout por defecto: sin esta línea, una llamada colgada espera indefinidamente.
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        // Aquí solo llegan fallos de RED o el timeout: fetch no rechaza por un 404 o un 500.
        if (error.name === 'TimeoutError') throw new ErrorDeInventario('TIEMPO_AGOTADO', `inventario no respondió en ${timeoutMs} ms`, { cause: error });
        throw new ErrorDeInventario('NO_DISPONIBLE', `no se pudo conectar con inventario: ${error.cause?.code ?? error.message}`, { cause: error });
      }
      // fetch resuelve con cualquier código HTTP: hay que mirar res.ok (true solo para 200–299).
      if (res.status === 404) throw new ErrorDeInventario('NO_ENCONTRADO', `inventario no conoce el SKU ${sku}`);
      if (!res.ok) throw new ErrorDeInventario('NO_DISPONIBLE', `inventario respondió ${res.status}`);
      return res.json();
    },
  };
}
```

```javascript
// Módulo 18 · F113 · Cliente REST con Axios.
// Requisitos: Node.js 26.13.1 LTS y axios 1.21.1 (package.json del laboratorio).
import axios from 'axios';
import { randomUUID } from 'node:crypto';
import { ErrorDeInventario } from './errores.js';

export function clienteAxios(baseUrl, { timeoutMs = 1000 } = {}) {
  // Una instancia por servicio destino: URL base, timeout y cabeceras se configuran UNA vez.
  const http = axios.create({ baseURL: baseUrl, timeout: timeoutMs, headers: { accept: 'application/json' } });

  // Interceptor de petición: se ejecuta antes de cada llamada (correlación, autenticación…).
  http.interceptors.request.use((config) => {
    config.headers.set('x-request-id', randomUUID());
    return config;
  });

  // Interceptor de respuesta: axios SÍ rechaza con cualquier código fuera de 2xx; aquí se traduce.
  http.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      if (error.response?.status === 404) throw new ErrorDeInventario('NO_ENCONTRADO', 'inventario no conoce ese SKU', { cause: error });
      if (error.response) throw new ErrorDeInventario('NO_DISPONIBLE', `inventario respondió ${error.response.status}`, { cause: error });
      if (error.code === 'ECONNABORTED') throw new ErrorDeInventario('TIEMPO_AGOTADO', `inventario no respondió en ${timeoutMs} ms`, { cause: error });
      throw new ErrorDeInventario('NO_DISPONIBLE', `no se pudo conectar con inventario: ${error.code}`, { cause: error });
    },
  );

  return {
    async existencias(sku) {
      const { data } = await http.get(`/existencias/${encodeURIComponent(sku)}`); // data ya viene como objeto
      return data;
    },
  };
}
```

```javascript
// Módulo 18 · F113 · Las mismas cinco llamadas con fetch y con axios.
// Ejecuta: node f113-rest/servicio-inventario.js   y, en otra terminal,   node f113-rest/main.js
import { clienteAxios } from './cliente-axios.js';
import { clienteFetch } from './cliente-fetch.js';

const base = process.env.INVENTARIO_URL ?? 'http://localhost:3113';
const clientes = { fetch: clienteFetch(base, { timeoutMs: 500 }), axios: clienteAxios(base, { timeoutMs: 500 }) };

for (const [nombre, cliente] of Object.entries(clientes)) {
  for (const sku of ['TEC-1', 'NO-HAY', 'ROTO', 'LENTO']) {
    try {
      const { disponibles } = await cliente.existencias(sku);
      console.log(`${nombre.padEnd(5)} ${sku.padEnd(6)} → ${disponibles} disponibles`);
    } catch (error) {
      console.log(`${nombre.padEnd(5)} ${sku.padEnd(6)} → ${error.tipo}: ${error.message}`);
    }
  }
}
// Servicio apagado: un puerto donde no escucha nadie.
for (const cliente of [clienteFetch('http://localhost:39113', { timeoutMs: 500 }), clienteAxios('http://localhost:39113', { timeoutMs: 500 })]) {
  await cliente.existencias('TEC-1').catch((error) => console.log(`apagado      → ${error.tipo}: ${error.message}`));
}
```

</details>

### gRPC con @grpc/grpc-js

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Definir un contrato en Protocol Buffers, implementar con @grpc/grpc-js un servidor y un cliente Node con una llamada unaria y un streaming de servidor, y aplicar deadlines y códigos de estado gRPC; lo compruebas cuando node --test f114-grpc/inventario.test.js pasa 6 de 6.

#### ► LA IDEA EN UNA FRASE
**Definir un contrato en Protocol Buffers, implementar con @grpc/grpc-js un servidor y un cliente Node con una llamada unaria y un streaming de servidor, y aplicar deadlines y códigos de estado gRPC; lo compruebas cuando node --test f114-grpc/inventario.test.js pasa 6 de 6.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en grpc con @grpc/grpc-js como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant P as pedidos (cliente gRPC)
    participant I as inventario (servidor gRPC)
    Note over P,I: ambos cargan inventario.proto (el contrato)
    P->>I: ConsultarExistencias({sku:"TEC-1"}) · deadline +1 s
    I-->>P: Existencias{sku, disponibles:12, bodega_origen} · status OK (0)
    P->>I: SeguirExistencias({sku:"TEC-1"}) · deadline +5 s
    I-->>P: Existencias{12}
    I-->>P: Existencias{11}
    I-->>P: Existencias{10}
    I-->>P: fin del stream · status OK (0)
    P->>I: ConsultarExistencias({sku:"NO-HAY"})
    I-->>P: status NOT_FOUND (5) "No existe el SKU NO-HAY"
    P->>I: ConsultarExistencias({sku:"LENTO"}) · deadline +300 ms
    Note over P: vence el plazo
    P--xI: cancelación
    Note over P: status DEADLINE_EXCEEDED (4)
```

1. **gRPC** es otra forma de que un servicio llame a otro. En lugar de pensar en «rutas y verbos» (REST), piensas en
2. Antes de programar, los dos equipos escriben un **contrato** en un archivo `.proto`: qué funciones hay y qué datos
3. Los datos no viajan como texto JSON sino en un formato **binario** compacto llamado **Protocol Buffers**: ocupa
4. Permite **streaming**: una llamada puede devolver muchas respuestas a lo largo del tiempo.
5. **`@grpc/grpc-js`** es la librería oficial para usar gRPC en Node, escrita en JavaScript puro.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| gRPC con @grpc/grpc-js se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar gRPC con @grpc/grpc-js | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Tratar el .proto como un JSON flexible: reutilizar números, un mensaje «comodín» y cero deadlines:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: grpc con @grpc/grpc-js funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **gRPC** es otra forma de que un servicio llame a otro. En lugar de pensar en «rutas y verbos» (REST), piensas en
- Antes de programar, los dos equipos escriben un **contrato** en un archivo `.proto`: qué funciones hay y qué datos
- Los datos no viajan como texto JSON sino en un formato **binario** compacto llamado **Protocol Buffers**: ocupa
- Permite **streaming**: una llamada puede devolver muchas respuestas a lo largo del tiempo.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve grpc con @grpc/grpc-js en tu contexto?
2. ¿Cómo sabrías que grpc con @grpc/grpc-js no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar grpc con @grpc/grpc-js?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **@grpc/grpc-js 1.14.7** y **@grpc/proto-loader 0.8.1** (dependencias del
`package.json` del laboratorio).

`f114-grpc/inventario.proto`:

```protobuf
// Módulo 18 · F114 · El CONTRATO: se escribe primero y lo comparten cliente y servidor.
syntax = "proto3";

package academia.inventario.v1;

service Inventario {
  // Unaria: una petición, una respuesta (como una llamada REST).
  rpc ConsultarExistencias (ConsultaRequest) returns (Existencias);
  // Streaming de servidor: una petición, varias respuestas a lo largo del tiempo.
  rpc SeguirExistencias (ConsultaRequest) returns (stream Existencias);
}

message ConsultaRequest {
  string sku = 1; // el número (1) identifica el campo en el cable: NUNCA se reutiliza ni se cambia
}

message Existencias {
  string sku = 1;
  int32 disponibles = 2;
  string bodega_origen = 3; // snake_case en el .proto → bodegaOrigen en JavaScript
}
```

`f114-grpc/contrato.js`:

```javascript
// Módulo 18 · F114 · Carga el .proto en tiempo de ejecución (sin generar código).
// Requisitos: @grpc/grpc-js 1.14.7 y @grpc/proto-loader 0.8.1.
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'node:path';

const definicion = protoLoader.loadSync(join(import.meta.dirname, 'inventario.proto'), {
  keepCase: false, // bodega_origen → bodegaOrigen
  longs: String, // int64 como texto (un number de JS pierde precisión por encima de 2^53)
  defaults: true, // los campos sin valor llegan con su valor por defecto (0, "", false)
});

export const { Inventario } = grpc.loadPackageDefinition(definicion).academia.inventario.v1;
export { grpc };
```

`f114-grpc/servidor.js`:

```javascript
// Módulo 18 · F114 · Servidor gRPC del servicio «inventario».
// Requisitos: Node.js 26.13.1 LTS, @grpc/grpc-js 1.14.7 y @grpc/proto-loader 0.8.1. Ejecuta: node f114-grpc/servidor.js
import { setTimeout as dormir } from 'node:timers/promises';
import { grpc, Inventario } from './contrato.js';

const EXISTENCIAS = { 'TEC-1': 12, 'MOU-2': 0 };

const implementacion = {
  // Unaria: (call, callback). call.request trae el mensaje ya convertido a objeto.
  async ConsultarExistencias(call, callback) {
    const { sku } = call.request;
    if (sku === 'LENTO') await dormir(1500);
    if (!(sku in EXISTENCIAS) && sku !== 'LENTO') {
      // Los errores viajan como un CÓDIGO de estado gRPC + detalle (no hay 404: hay NOT_FOUND).
      return callback({ code: grpc.status.NOT_FOUND, details: `No existe el SKU ${sku}` });
    }
    callback(null, { sku, disponibles: EXISTENCIAS[sku] ?? 1, bodegaOrigen: 'BOG-1' });
  },

  // Streaming de servidor: se escribe varias veces en call y se cierra con call.end().
  async SeguirExistencias(call) {
    const { sku } = call.request;
    let disponibles = EXISTENCIAS[sku] ?? 0;
    for (let i = 0; i < 3 && !call.cancelled; i++) {
      call.write({ sku, disponibles, bodegaOrigen: 'BOG-1' });
      disponibles -= 1; // simula ventas
      await dormir(100);
    }
    call.end();
  },
};

export async function iniciarServidor(puerto = 0) {
  const servidor = new grpc.Server();
  servidor.addService(Inventario.service, implementacion);
  // createInsecure(): sin TLS, solo para desarrollo local. En producción: createSsl() o mTLS de la malla.
  const puertoReal = await new Promise((ok, mal) =>
    servidor.bindAsync(`127.0.0.1:${puerto}`, grpc.ServerCredentials.createInsecure(), (error, p) => (error ? mal(error) : ok(p))),
  );
  return { puerto: puertoReal, detener: () => new Promise((ok) => servidor.tryShutdown(ok)) };
}

if (import.meta.main) {
  const { puerto } = await iniciarServidor(Number(process.env.PORT ?? 50114));
  console.log(`inventario gRPC escuchando en 127.0.0.1:${puerto}`);
}
```

`f114-grpc/cliente.js`:

```javascript
// Módulo 18 · F114 · Cliente gRPC con deadline en cada llamada.
// Requisitos: Node.js 26.13.1 LTS, @grpc/grpc-js 1.14.7 y @grpc/proto-loader 0.8.1. Ejecuta: node f114-grpc/cliente.js
import { grpc, Inventario } from './contrato.js';

export function crearCliente(direccion) {
  const stub = new Inventario(direccion, grpc.credentials.createInsecure());
  return {
    // Unaria envuelta en una promesa. El deadline es un instante absoluto: «responde antes de…».
    consultar(sku, { plazoMs = 1000 } = {}) {
      return new Promise((ok, mal) => {
        stub.ConsultarExistencias({ sku }, { deadline: Date.now() + plazoMs }, (error, respuesta) => (error ? mal(error) : ok(respuesta)));
      });
    },
    // Streaming: el stream de lectura es un iterable asíncrono.
    async *seguir(sku, { plazoMs = 5000 } = {}) {
      yield* stub.SeguirExistencias({ sku }, { deadline: Date.now() + plazoMs });
    },
    cerrar: () => stub.close(),
  };
}

if (import.meta.main) {
  const cliente = crearCliente(process.env.INVENTARIO_GRPC ?? '127.0.0.1:50114');
  console.log('unaria   →', await cliente.consultar('TEC-1'));
  for await (const e of cliente.seguir('TEC-1')) console.log('stream   →', e.disponibles);
  for (const [sku, plazoMs] of [['NO-HAY', 1000], ['LENTO', 300]]) {
    await cliente.consultar(sku, { plazoMs }).catch((error) => console.log(`${sku.padEnd(8)} → code=${error.code} (${grpc.status[error.code]}) details="${error.details}"`));
  }
  cliente.cerrar();
}
```

</details>

### GraphQL con Apollo Server

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir con Apollo Server una API GraphQL que componga datos de dos servicios (pedidos y clientes) con esquema, resolvers y errores tipados, y eliminar el problema N+1 con DataLoader midiendo las llamadas antes y después; lo compruebas cuando node --test f115-graphql/esquema.te…

#### ► LA IDEA EN UNA FRASE
**Construir con Apollo Server una API GraphQL que componga datos de dos servicios (pedidos y clientes) con esquema, resolvers y errores tipados, y eliminar el problema N+1 con DataLoader midiendo las llamadas antes y después; lo compruebas cuando node --test f115-graphql/esquema.test.js pasa 7 de 7 y n-mas-1.js muestra 3 llamadas frente a 1.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en graphql con apollo server como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    C["cliente (web, móvil)"] -- "POST /  { pedidos { id cliente { nombre } } }" --> A["Apollo Server"]
    A --> V{"valida contra<br/>el esquema"}
    V -- "inválida" --> E["400 · errors[]<br/>GRAPHQL_VALIDATION_FAILED"]
    V -- "válida" --> Q["Query.pedidos"]
    Q -- "1 llamada" --> SP["servicio pedidos"]
    Q --> F["Pedido.cliente × 3"]
    F -- "load(C-1), load(C-2), load(C-1)" --> DL["DataLoader<br/>(por petición)"]
    DL -- "1 llamada: buscarVarios([C-1, C-2])" --> SC["servicio clientes"]
    F --> R["200 · { data: … }<br/>con la forma de la consulta"]
```

1. Con REST, el servidor decide qué datos trae cada dirección. Si la pantalla de tu aplicación necesita un pedido y el
2. **GraphQL** le da la vuelta: el **cliente escribe una consulta** que describe exactamente lo que quiere, y el
3. Lo que se puede pedir está descrito en un **esquema**: una lista de tipos (`Pedido`, `Cliente`) con sus campos.
4. Para cada campo hay una pequeña función, el **resolver**, que sabe de dónde sacar ese dato (de un microservicio, de
5. **Apollo Server** es una librería de Node para montar ese servidor.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| GraphQL con Apollo Server se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar GraphQL con Apollo Server | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El esquema como espejo de las tablas, sin límites ni paginación:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: graphql con apollo server funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Con REST, el servidor decide qué datos trae cada dirección. Si la pantalla de tu aplicación necesita un pedido y el
- **GraphQL** le da la vuelta: el **cliente escribe una consulta** que describe exactamente lo que quiere, y el
- Lo que se puede pedir está descrito en un **esquema**: una lista de tipos (`Pedido`, `Cliente`) con sus campos.
- Para cada campo hay una pequeña función, el **resolver**, que sabe de dónde sacar ese dato (de un microservicio, de

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve graphql con apollo server en tu contexto?
2. ¿Cómo sabrías que graphql con apollo server no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar graphql con apollo server?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **@apollo/server 5.5.2**, **graphql 16.15.0** (Apollo Server 5 exige
`graphql ^16.11.0`) y **dataloader 2.2.3** (dependencias del `package.json` del laboratorio).

`f115-graphql/datos.js` (hace de los dos servicios de detrás y cuenta las llamadas):

```javascript
// Módulo 18 · F115 · Los «servicios» que hay detrás del grafo. En un sistema real serían llamadas REST o gRPC
// a pedidos y a clientes; aquí son funciones en memoria que CUENTAN cuántas veces las llaman.
const PEDIDOS = [
  { id: 'P-1', clienteId: 'C-1', total: 240000 },
  { id: 'P-2', clienteId: 'C-2', total: 50000 },
  { id: 'P-3', clienteId: 'C-1', total: 99000 },
];
const CLIENTES = { 'C-1': { id: 'C-1', nombre: 'Ana', email: 'ana@correo.co' }, 'C-2': { id: 'C-2', nombre: 'Luis', email: 'luis@correo.co' } };

export function crearServicios() {
  const llamadas = { pedidos: 0, clientes: 0 };
  return {
    llamadas,
    pedidos: {
      async listar() { llamadas.pedidos += 1; return PEDIDOS; },
      async buscar(id) { llamadas.pedidos += 1; return PEDIDOS.find((p) => p.id === id) ?? null; },
      async crear(clienteId, total) {
        llamadas.pedidos += 1;
        const pedido = { id: `P-${PEDIDOS.length + 1}`, clienteId, total };
        return pedido; // no se guarda: los tests siguen siendo repetibles
      },
    },
    clientes: {
      async buscar(id) { llamadas.clientes += 1; return CLIENTES[id] ?? null; }, // 1 llamada por cliente
      async buscarVarios(ids) { llamadas.clientes += 1; return ids.map((id) => CLIENTES[id] ?? null); }, // 1 llamada por lote
    },
  };
}
```

`f115-graphql/esquema.js`:

```javascript
// Módulo 18 · F115 · GraphQL con Apollo Server: esquema (el contrato) y resolvers (cómo se obtiene cada campo).
// Requisitos: Node.js 26.13.1 LTS, @apollo/server 5.5.2, graphql 16.15.0 y dataloader 2.2.3.
import { ApolloServer } from '@apollo/server';
import DataLoader from 'dataloader';
import { GraphQLError } from 'graphql';

// SDL: el contrato tipado. «!» significa «nunca es null».
export const typeDefs = `#graphql
  type Cliente {
    id: ID!
    nombre: String!
    email: String!
  }

  type Pedido {
    id: ID!
    total: Int!
    cliente: Cliente!
  }

  type Query {
    pedidos: [Pedido!]!
    pedido(id: ID!): Pedido
  }

  type Mutation {
    crearPedido(clienteId: ID!, total: Int!): Pedido!
  }
`;

export const resolvers = {
  Query: {
    // (padre, argumentos, contexto). El contexto se crea por petición y trae los servicios.
    pedidos: (_padre, _args, { servicios }) => servicios.pedidos.listar(),
    pedido: (_padre, { id }, { servicios }) => servicios.pedidos.buscar(id),
  },
  Mutation: {
    crearPedido: async (_padre, { clienteId, total }, { servicios, cargadores }) => {
      if (total <= 0) {
        throw new GraphQLError('El total debe ser mayor que cero', { extensions: { code: 'BAD_USER_INPUT', campo: 'total' } });
      }
      if (!(await cargadores.cliente.load(clienteId))) {
        throw new GraphQLError(`No existe el cliente ${clienteId}`, { extensions: { code: 'NOT_FOUND' } });
      }
      return servicios.pedidos.crear(clienteId, total);
    },
  },
  Pedido: {
    // Resolver de CAMPO: solo se ejecuta si la consulta pide «cliente». Con el cargador (DataLoader), todas las
    // peticiones de cliente de un mismo «tick» se juntan en UNA llamada al servicio de clientes.
    cliente: (pedido, _args, { cargadores }) => cargadores.cliente.load(pedido.clienteId),
  },
};

// Versión ingenua del mismo resolver: una llamada al servicio de clientes POR CADA pedido (problema N+1).
export const resolversIngenuos = {
  ...resolvers,
  Pedido: { cliente: (pedido, _args, { servicios }) => servicios.clientes.buscar(pedido.clienteId) },
};

// El contexto se construye EN CADA PETICIÓN: los DataLoader guardan caché y no deben compartirse entre usuarios.
export function crearContexto(servicios) {
  return {
    servicios,
    cargadores: { cliente: new DataLoader((ids) => servicios.clientes.buscarVarios(ids)) },
  };
}

export function crearServidor({ ingenuo = false } = {}) {
  return new ApolloServer({
    typeDefs,
    resolvers: ingenuo ? resolversIngenuos : resolvers,
    // Por defecto Apollo añade la pila (stacktrace) a cada error salvo con NODE_ENV=production.
    // Aquí se apaga siempre: una pila le cuenta al cliente rutas y librerías internas.
    includeStacktraceInErrorResponses: false,
  });
}
```

`f115-graphql/main.js`:

```javascript
// Módulo 18 · F115 · Arranca el servidor GraphQL sobre HTTP. Ejecuta: node f115-graphql/main.js
import { startStandaloneServer } from '@apollo/server/standalone';
import { crearServicios } from './datos.js';
import { crearContexto, crearServidor } from './esquema.js';

const servicios = crearServicios(); // en un servicio real: los clientes REST/gRPC de las fichas anteriores
const { url } = await startStandaloneServer(crearServidor(), {
  listen: { host: '127.0.0.1', port: Number(process.env.PORT ?? 4115) },
  context: async () => crearContexto(servicios),
});
console.log(`GraphQL listo en ${url}`);
```

`f115-graphql/n-mas-1.js`:

```javascript
// Módulo 18 · F115 · Mide el problema N+1: la MISMA consulta con resolvers ingenuos y con DataLoader.
// Ejecuta: node f115-graphql/n-mas-1.js
import { crearServicios } from './datos.js';
import { crearContexto, crearServidor } from './esquema.js';

const query = '{ pedidos { id total cliente { nombre } } }';
for (const ingenuo of [true, false]) {
  const servicios = crearServicios();
  const servidor = crearServidor({ ingenuo });
  const { body } = await servidor.executeOperation({ query }, { contextValue: crearContexto(servicios) });
  const pedidos = body.singleResult.data.pedidos.length;
  console.log(`${ingenuo ? 'ingenuo   ' : 'DataLoader'} → ${pedidos} pedidos · llamadas a pedidos: ${servicios.llamadas.pedidos} · llamadas a clientes: ${servicios.llamadas.clientes}`);
  await servidor.stop();
}
```

</details>

### KafkaJS, amqplib

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar en Node un productor y un consumidor de eventos con KafkaJS (clave de partición, grupo de consumidores) y un publicador y un consumidor con amqplib (exchange *topic*, confirmaciones del broker, *ack* manual), y hacer idempotente al consumidor; lo compruebas cuando nod…

#### ► LA IDEA EN UNA FRASE
**Implementar en Node un productor y un consumidor de eventos con KafkaJS (clave de partición, grupo de consumidores) y un publicador y un consumidor con amqplib (exchange *topic*, confirmaciones del broker, *ack* manual), y hacer idempotente al consumidor; lo compruebas cuando node --test f116-kafka-rabbit/evento.test.js pasa 4 de 4 y, con los brokers arriba, kafka.infra.js (2 tests) y rabbit.infra.js (3 tests) pasan.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en kafkajs, amqplib como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph RabbitMQ
        PUB["publicador<br/>(amqplib)"] -- "publish(exchange, 'pedido.creado')<br/>+ confirm" --> EX{{"exchange 'pedidos.eventos'<br/>tipo topic"}}
        EX -- "binding 'pedido.creado'" --> Q1[("cola facturacion.pedidos-creados")]
        EX -. "sin binding: pedido.pagado se descarta" .-> X["✗"]
        Q1 -- "entrega" --> CON["consumidor"]
        CON -- "ack / nack(requeue)" --> Q1
    end
    subgraph Kafka
        PRO["productor<br/>(KafkaJS)"] -- "send(key = pedidoId)" --> TP["topic pedidos.eventos"]
        TP --> P0["partición 0: P-1 creado | P-1 pagado | P-1 enviado"]
        TP --> P2["partición 2: P-3 creado"]
        P0 --> G1["grupo 'facturacion'<br/>offset propio"]
        P2 --> G1
        P0 --> G2["grupo 'analitica'<br/>offset propio"]
        P2 --> G2
    end
```

1. En las fichas anteriores un servicio **preguntaba y esperaba**. Aquí un servicio **deja un mensaje** («se creó el
2. Entre el que envía y los que reciben hay un programa intermediario, el **broker**, que guarda los mensajes. Si el
3. **RabbitMQ** es un broker de **colas**: reparte cada mensaje a quien debe tramitarlo y lo borra cuando está hecho.
4. **Kafka** es un **registro (log) de eventos**: los guarda en orden y no los borra al leerlos; muchos lectores pueden
5. Para hablar con ellos desde Node se usan librerías cliente: **amqplib** (RabbitMQ) y **KafkaJS** (Kafka).

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| KafkaJS, amqplib se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar KafkaJS, amqplib | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Confirmar antes de procesar y usar el broker como si fuera una llamada remota:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: kafkajs, amqplib funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- En las fichas anteriores un servicio **preguntaba y esperaba**. Aquí un servicio **deja un mensaje** («se creó el
- Entre el que envía y los que reciben hay un programa intermediario, el **broker**, que guarda los mensajes. Si el
- **RabbitMQ** es un broker de **colas**: reparte cada mensaje a quien debe tramitarlo y lo borra cuando está hecho.
- **Kafka** es un **registro (log) de eventos**: los guarda en orden y no los borra al leerlos; muchos lectores pueden

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve kafkajs, amqplib en tu contexto?
2. ¿Cómo sabrías que kafkajs, amqplib no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar kafkajs, amqplib?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Levanta los brokers (la primera vez descarga las imágenes) y espera a que estén sanos:
   ```bash
   docker compose up -d --wait
   ```
2. **RabbitMQ.** Arranca el consumidor (crea la cola y su binding) y, en otra terminal, publica tres eventos:
   ```bash
   node f116-kafka-rabbit/rabbit-consumidor.js      # terminal 1
   node f116-kafka-rabbit/rabbit-publicador.js      # terminal 2
   ```
3. **Rompe el sistema a propósito:** detén el consumidor (Ctrl+C), publica otra vez y vuelve a arrancarlo: los
   mensajes lo estaban esperando en la cola durable.
   ```bash
   node f116-kafka-rabbit/rabbit-publicador.js
   docker compose exec rabbitmq rabbitmqctl -q list_queues name messages
   node f116-kafka-rabbit/rabbit-consumidor.js
   ```
4. **Kafka.** Publica cuatro eventos y léelos con dos grupos distintos:
   ```bash
   node f116-kafka-rabbit/kafka-productor.js
   node f116-kafka-rabbit/kafka-consumidor.js                    # Ctrl+C cuando deje de imprimir
   GRUPO=analitica node f116-kafka-rabbit/kafka-consumidor.js    # otro grupo: los vuelve a recibir todos
   ```
5. Limpia: `docker compose down -v`.

**Output esperado** (paso 2, terminal 1 y terminal 2; salida real en macOS con RabbitMQ 4.4.1):

```text
facturacion esperando mensajes en facturacion.pedidos-creados…
facturacion ← pedido.creado (P-1)
facturacion ← pedido.creado (P-2)
```

```text
pedidos.eventos ← pedido.creado (P-1) confirmado por el broker
pedidos.eventos ← pedido.pagado (P-1) confirmado por el broker
pedidos.eventos ← pedido.creado (P-2) confirmado por el broker
```

**Output esperado** (paso 3, salida real: la cola guarda 2 mensajes mientras el consumidor está apagado y los entrega
en cuanto vuelve, incluso antes de que imprima su línea de espera):

```text
facturacion.pedidos-creados	2
```

```text
facturacion ← pedido.creado (P-1)
facturacion ← pedido.creado (P-2)
facturacion esperando mensajes en facturacion.pedidos-creados…
```

**Output esperado** (paso 4; salida real en macOS con Node.js 26.13.1, kafkajs 2.2.4 y Kafka 4.4.0. Primero el
productor y después el consumidor del grupo `facturacion`: los eventos de P-1 salen siempre en orden y en la misma
partición; la línea de P-3 puede aparecer antes, entre medias o después, porque está en otra partición. El grupo
`analitica` imprime las mismas cuatro líneas. El número entre paréntesis es el PID y el número negativo cambia en
cada ejecución; las tres primeras líneas son el aviso que explica la sección 12):

```text
(node:77250) TimeoutNegativeWarning: -1795149271251 is a negative number.
Timeout duration was set to 1.
(Use `node --trace-warnings ...` to show where the warning was created)
pedidos.eventos ← pedido.creado  clave=P-1 partición=0 offset=0
pedidos.eventos ← pedido.creado  clave=P-3 partición=2 offset=0
pedidos.eventos ← pedido.pagado  clave=P-1 partición=0 offset=1
pedidos.eventos ← pedido.enviado clave=P-1 partición=0 offset=2
```

```text
(node:77254) TimeoutNegativeWarning: -1795149271473 is a negative number.
Timeout duration was set to 1.
(Use `node --trace-warnings ...` to show where the warning was created)
facturacion esperando eventos…
partición=0 offset=0 clave=P-1 pedido.creado → procesado
partición=0 offset=1 clave=P-1 pedido.pagado → procesado
partición=0 offset=2 clave=P-1 pedido.enviado → procesado
partición=2 offset=0 clave=P-3 pedido.creado → procesado
```

**Captura comentada:** en RabbitMQ se publicaron **tres** eventos y a facturación llegaron **dos**: `pedido.pagado`
fue confirmado por el broker, pero ningún binding lo pedía y el exchange lo descartó (confirmado no significa
«alguien lo recibió»). En la consola de RabbitMQ (`http://localhost:15672` → Queues) ves la cola con «Ready: 2» en el
paso 3. En Kafka, la partición la decide el hash de la clave: con 3 particiones, `P-1` cae en la 0 y `P-3` en la 2;
el consumidor tarda unos segundos en imprimir la primera línea porque antes se une al grupo. Que `analitica` reciba
todo otra vez es la diferencia esencial con una cola: el log sigue ahí. Al cortar el consumidor con Ctrl+C, kafkajs
puede escribir una o dos líneas `ERROR` más (en la corrida real: `[Connection] Connection error: write after end` y
`read ECONNRESET`): son peticiones que estaban en vuelo mientras se cerraba la conexión, no eventos perdidos.

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **kafkajs 2.2.4**, **amqplib 2.4.0**; brokers **Apache Kafka 4.4.0** y **RabbitMQ
4.4.1** del `docker-compose.yml` que está al inicio del módulo.

`f116-kafka-rabbit/evento.js` (común a los dos brokers):

```javascript
// Módulo 18 · F116 · El «sobre» común de los eventos y un consumidor idempotente.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). Lo usan los ejemplos de Kafka y de RabbitMQ.
import { randomUUID } from 'node:crypto';

// Todo evento lleva un id único (para deduplicar), un tipo en pasado y la fecha en que ocurrió.
export function crearEvento(tipo, datos) {
  return { id: randomUUID(), tipo, ocurridoEn: new Date().toISOString(), datos };
}

export const serializar = (evento) => Buffer.from(JSON.stringify(evento));

export function deserializar(buffer) {
  const evento = JSON.parse(buffer.toString());
  if (typeof evento.id !== 'string' || typeof evento.tipo !== 'string') throw new Error('evento sin id o sin tipo');
  return evento;
}

// Los brokers entregan «al menos una vez»: tras un fallo o un rebalanceo el mismo mensaje puede llegar dos
// veces. Este envoltorio recuerda los id ya procesados y descarta las repeticiones.
// (En producción «vistos» vive en Redis o en la base de datos: Módulo 22.)
export function soloUnaVez(manejador, vistos = new Set()) {
  return async (evento) => {
    if (vistos.has(evento.id)) return 'duplicado';
    await manejador(evento); // si lanza, NO se marca como visto: el broker lo reentregará
    vistos.add(evento.id);
    return 'procesado';
  };
}
```

`f116-kafka-rabbit/kafka.js`:

```javascript
// Módulo 18 · F116 · KafkaJS: productor y consumidor de eventos de pedidos.
// Requisitos: Node.js 26.13.1 LTS, kafkajs 2.2.4 y Kafka 4.4.0 (docker-compose.yml del laboratorio).
import { Kafka, logLevel } from 'kafkajs';
import { deserializar, serializar } from './evento.js';

export const TOPIC = 'pedidos.eventos';

export function crearKafka({ brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','), clientId = 'pedidos' } = {}) {
  return new Kafka({ clientId, brokers, logLevel: logLevel.ERROR, retry: { retries: 3 } });
}

// Crea el topic con 3 particiones si no existe (en producción lo crea la plataforma, no el servicio).
export async function asegurarTopic(kafka, topic = TOPIC, particiones = 3) {
  const admin = kafka.admin();
  await admin.connect();
  try {
    return await admin.createTopics({ topics: [{ topic, numPartitions: particiones, replicationFactor: 1 }], waitForLeaders: true });
  } finally {
    await admin.disconnect();
  }
}

export async function crearProductor(kafka) {
  // idempotent: el broker descarta los duplicados que provocan los reintentos del productor.
  // KafkaJS exige con idempotent que maxInFlightRequests sea 1 (y acks = -1, todas las réplicas).
  const productor = kafka.producer({ idempotent: true, maxInFlightRequests: 1 });
  await productor.connect();
  return {
    // La CLAVE decide la partición: todos los eventos del mismo pedido van a la misma y conservan su orden.
    async publicar(evento, topic = TOPIC) {
      const [resultado] = await productor.send({
        topic,
        acks: -1,
        messages: [{ key: evento.datos.pedidoId, value: serializar(evento), headers: { tipo: evento.tipo } }],
      });
      return { particion: resultado.partition, offset: resultado.baseOffset };
    },
    cerrar: () => productor.disconnect(),
  };
}

// Consume desde el principio con un grupo: las instancias del mismo grupo se reparten las particiones.
export async function consumir(kafka, { grupo, topic = TOPIC, alRecibir }) {
  const consumidor = kafka.consumer({ groupId: grupo });
  await consumidor.connect();
  await consumidor.subscribe({ topics: [topic], fromBeginning: true });
  await consumidor.run({
    // KafkaJS confirma (commit) el offset DESPUÉS de que esta función termina sin error: «al menos una vez».
    // Si lanza, no hay commit y el mensaje se vuelve a entregar.
    eachMessage: async ({ partition, message }) => {
      await alRecibir(deserializar(message.value), { particion: partition, offset: message.offset, clave: message.key?.toString() });
    },
  });
  return { cerrar: () => consumidor.disconnect() };
}
```

`f116-kafka-rabbit/kafka-productor.js`:

```javascript
// Módulo 18 · F116 · Ejecuta (con docker compose arriba): node f116-kafka-rabbit/kafka-productor.js
import { crearEvento } from './evento.js';
import { asegurarTopic, crearKafka, crearProductor, TOPIC } from './kafka.js';

const kafka = crearKafka();
await asegurarTopic(kafka);
const productor = await crearProductor(kafka);
for (const [tipo, pedidoId] of [['pedido.creado', 'P-1'], ['pedido.creado', 'P-3'], ['pedido.pagado', 'P-1'], ['pedido.enviado', 'P-1']]) {
  const { particion, offset } = await productor.publicar(crearEvento(tipo, { pedidoId }));
  console.log(`${TOPIC} ← ${tipo.padEnd(14)} clave=${pedidoId} partición=${particion} offset=${offset}`);
}
await productor.cerrar();
```

`f116-kafka-rabbit/kafka-consumidor.js`:

```javascript
// Módulo 18 · F116 · Ejecuta: node f116-kafka-rabbit/kafka-consumidor.js   (Ctrl+C para salir)
import { soloUnaVez } from './evento.js';
import { consumir, crearKafka } from './kafka.js';

const facturar = soloUnaVez(async (evento) => { /* aquí iría el trabajo real */ });
const consumidor = await consumir(crearKafka({ clientId: 'facturacion' }), {
  grupo: process.env.GRUPO ?? 'facturacion',
  alRecibir: async (evento, { particion, offset, clave }) => {
    console.log(`partición=${particion} offset=${offset} clave=${clave} ${evento.tipo} → ${await facturar(evento)}`);
  },
});
console.log('facturacion esperando eventos…');
for (const senal of ['SIGINT', 'SIGTERM']) process.on(senal, async () => { await consumidor.cerrar(); process.exit(0); });
```

`f116-kafka-rabbit/rabbit.js`:

```javascript
// Módulo 18 · F116 · amqplib: publicador con confirmaciones y consumidor con ack manual sobre RabbitMQ.
// Requisitos: Node.js 26.13.1 LTS, amqplib 2.4.0 y RabbitMQ 4.4.1 (docker-compose.yml del laboratorio).
import amqplib from 'amqplib';
import { deserializar, serializar } from './evento.js';

export const EXCHANGE = 'pedidos.eventos';
export const URL_AMQP = process.env.AMQP_URL ?? 'amqp://academia:academia@localhost:5672';

// Topología: exchange «pedidos.eventos» (topic) → cola de cada consumidor, enlazada por patrón de routing key.
export async function declararCola(canal, cola, patron, exchange = EXCHANGE) {
  await canal.assertExchange(exchange, 'topic', { durable: true });
  await canal.assertQueue(cola, { durable: true }); // durable: la cola sobrevive a un reinicio del broker
  await canal.bindQueue(cola, exchange, patron);
}

export async function crearPublicador({ url = URL_AMQP, exchange = EXCHANGE } = {}) {
  const conexion = await amqplib.connect(url);
  // Canal con «publisher confirms»: el broker confirma cada mensaje que aceptó.
  const canal = await conexion.createConfirmChannel();
  await canal.assertExchange(exchange, 'topic', { durable: true });
  return {
    // La routing key es el tipo del evento («pedido.creado»): el exchange decide a qué colas llega.
    async publicar(evento) {
      canal.publish(exchange, evento.tipo, serializar(evento), {
        persistent: true, // el mensaje se escribe en disco
        messageId: evento.id,
        contentType: 'application/json',
      });
      await canal.waitForConfirms(); // resuelve cuando RabbitMQ lo aceptó; rechaza si lo descartó
    },
    async cerrar() { await canal.close(); await conexion.close(); },
  };
}

export async function consumir({ url = URL_AMQP, exchange = EXCHANGE, cola, patron, alRecibir, prefetch = 10 }) {
  const conexion = await amqplib.connect(url);
  const canal = await conexion.createChannel();
  await declararCola(canal, cola, patron, exchange);
  await canal.prefetch(prefetch); // como máximo N mensajes sin confirmar a la vez por consumidor
  await canal.consume(cola, async (mensaje) => {
    if (mensaje === null) return; // el broker canceló al consumidor
    try {
      await alRecibir(deserializar(mensaje.content), { reentregado: mensaje.fields.redelivered, routingKey: mensaje.fields.routingKey });
      canal.ack(mensaje); // «listo»: RabbitMQ lo borra de la cola
    } catch (error) {
      // requeue solo la primera vez; si ya era una reentrega se descarta (o va a la DLQ: Módulo 22).
      canal.nack(mensaje, false, !mensaje.fields.redelivered);
    }
  }, { noAck: false }); // ack MANUAL: sin esto el mensaje se da por entregado al enviarlo
  return { async cerrar() { await canal.close(); await conexion.close(); } };
}
```

`f116-kafka-rabbit/rabbit-publicador.js`:

```javascript
// Módulo 18 · F116 · Ejecuta (con docker compose arriba): node f116-kafka-rabbit/rabbit-publicador.js
import { crearEvento } from './evento.js';
import { crearPublicador, EXCHANGE } from './rabbit.js';

const publicador = await crearPublicador();
for (const [tipo, pedidoId] of [['pedido.creado', 'P-1'], ['pedido.pagado', 'P-1'], ['pedido.creado', 'P-2']]) {
  await publicador.publicar(crearEvento(tipo, { pedidoId }));
  console.log(`${EXCHANGE} ← ${tipo} (${pedidoId}) confirmado por el broker`);
}
await publicador.cerrar();
```

`f116-kafka-rabbit/rabbit-consumidor.js`:

```javascript
// Módulo 18 · F116 · Ejecuta: node f116-kafka-rabbit/rabbit-consumidor.js   (Ctrl+C para salir)
// Arráncalo ANTES que el publicador la primera vez: la cola se crea aquí y un exchange sin colas descarta lo que recibe.
import { consumir } from './rabbit.js';

const consumidor = await consumir({
  cola: 'facturacion.pedidos-creados',
  patron: 'pedido.creado', // solo le interesan los pedidos creados
  alRecibir: async (evento, { reentregado }) => {
    console.log(`facturacion ← ${evento.tipo} (${evento.datos.pedidoId})${reentregado ? ' [reentregado]' : ''}`);
  },
});
console.log('facturacion esperando mensajes en facturacion.pedidos-creados…');
for (const senal of ['SIGINT', 'SIGTERM']) process.on(senal, async () => { await consumidor.cerrar(); process.exit(0); });
```

#### Verificación
```bash
node --test --test-reporter=spec f116-kafka-rabbit/evento.test.js     # sin brokers
docker compose up -d --wait                                            # con brokers:
node --test --test-reporter=spec f116-kafka-rabbit/rabbit.infra.js f116-kafka-rabbit/kafka.infra.js
```

Salida real de `evento.test.js` y de `rabbit.infra.js` (este, en macOS contra RabbitMQ 4.4.1):

```text
✔ el sobre lleva id único, tipo y fecha, y sobrevive al viaje como bytes (2.919696ms)
✔ un mensaje que no es un evento se rechaza al deserializar (0.52276ms)
✔ consumidor idempotente: la reentrega del mismo evento no repite el efecto (0.271552ms)
✔ si el manejador falla, el evento NO queda marcado y el reintento lo procesa (0.329549ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

```text
✔ el exchange topic enruta por tipo: la cola solo recibe pedido.creado (235.750625ms)
✔ si el manejador falla, el mensaje se reentrega (redelivered) y no se pierde (35.627ms)
✔ la cola durable guarda los mensajes mientras el consumidor está apagado (9.63025ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

Y la de `kafka.infra.js` contra Kafka 4.4.0 recién arrancado (macOS, Node.js 26.13.1). Las dos líneas `ERROR` salen
porque el broker acababa de arrancar y aún cargaba sus coordinadores internos; kafkajs reintenta solo y los tests
pasan. Con el broker ya caliente no aparecen. Cada test tarda unos 8 s porque crea su topic y espera a unirse al
grupo:

```text
(node:77033) TimeoutNegativeWarning: -1795149254154 is a negative number.
Timeout duration was set to 1.
(Use `node --trace-warnings ...` to show where the warning was created)
{"level":"ERROR","timestamp":"2026-11-20T04:34:14.311Z","logger":"kafkajs","message":"[Connection] Response InitProducerId(key: 22, version: 1)","broker":"localhost:9092","clientId":"test","error":"The coordinator is loading and hence can't process requests for this group","correlationId":2,"size":20}
{"level":"ERROR","timestamp":"2026-11-20T04:34:14.651Z","logger":"kafkajs","message":"[Connection] Response GroupCoordinator(key: 10, version: 2)","broker":"localhost:9092","clientId":"test","error":"The group coordinator is not available","correlationId":2,"size":55}
✔ la misma clave va siempre a la misma partición y conserva el orden (8914.082875ms)
✔ otro grupo de consumidores vuelve a leer TODO el topic (el log no se borra al consumir) (8035.887666ms)
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

`f116-kafka-rabbit/evento.test.js`:

```javascript
// Módulo 18 · F116 · Ejecuta: node --test f116-kafka-rabbit/evento.test.js   (no necesita brokers)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearEvento, deserializar, serializar, soloUnaVez } from './evento.js';

test('el sobre lleva id único, tipo y fecha, y sobrevive al viaje como bytes', () => {
  const evento = crearEvento('pedido.creado', { pedidoId: 'P-1', total: 240000 });
  assert.match(evento.id, /^[0-9a-f-]{36}$/);
  assert.deepEqual(deserializar(serializar(evento)), evento);
  assert.notEqual(crearEvento('pedido.creado', {}).id, evento.id);
});

test('un mensaje que no es un evento se rechaza al deserializar', () => {
  assert.throws(() => deserializar(Buffer.from('{"hola":1}')), /evento sin id o sin tipo/);
  assert.throws(() => deserializar(Buffer.from('no es json')), SyntaxError);
});

test('consumidor idempotente: la reentrega del mismo evento no repite el efecto', async () => {
  const facturas = [];
  const manejar = soloUnaVez(async (e) => { facturas.push(e.datos.pedidoId); });
  const evento = crearEvento('pedido.creado', { pedidoId: 'P-1' });
  assert.equal(await manejar(evento), 'procesado');
  assert.equal(await manejar(evento), 'duplicado'); // reentrega del broker
  assert.deepEqual(facturas, ['P-1']);
});

test('si el manejador falla, el evento NO queda marcado y el reintento lo procesa', async () => {
  let intentos = 0;
  const manejar = soloUnaVez(async () => { if (++intentos === 1) throw new Error('base de datos caída'); });
  const evento = crearEvento('pedido.creado', { pedidoId: 'P-2' });
  await assert.rejects(manejar(evento), /base de datos caída/);
  assert.equal(await manejar(evento), 'procesado');
});
```

`f116-kafka-rabbit/rabbit.infra.js`:

```javascript
// Módulo 18 · F116 · Test contra RabbitMQ real. Ejecuta: docker compose up -d --wait && node --test f116-kafka-rabbit/rabbit.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import amqplib from 'amqplib';
import { crearEvento } from './evento.js';
import { consumir, crearPublicador, URL_AMQP } from './rabbit.js';

// Exchange y cola propios del test: no se mezclan con los del laboratorio.
const exchange = `test.pedidos.${process.pid}`;
const cola = `test.facturacion.${process.pid}`;
let publicador;
before(async () => { publicador = await crearPublicador({ exchange }); });
after(async () => {
  await publicador.cerrar();
  const conexion = await amqplib.connect(URL_AMQP);
  const canal = await conexion.createChannel();
  await canal.deleteQueue(cola);
  await canal.deleteExchange(exchange);
  await conexion.close();
});

async function esperar(condicion, ms = 5000) {
  const fin = Date.now() + ms;
  while (!condicion()) {
    if (Date.now() > fin) throw new Error('tiempo de espera agotado');
    await dormir(20);
  }
}

test('el exchange topic enruta por tipo: la cola solo recibe pedido.creado', async () => {
  const recibidos = [];
  const consumidor = await consumir({ exchange, cola, patron: 'pedido.creado', alRecibir: async (e) => { recibidos.push(`${e.tipo}:${e.datos.pedidoId}`); } });
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-1' }));
  await publicador.publicar(crearEvento('pedido.pagado', { pedidoId: 'P-1' }));
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-2' }));
  await esperar(() => recibidos.length === 2);
  await dormir(200); // margen: si pedido.pagado fuera a llegar, llegaría aquí
  assert.deepEqual(recibidos, ['pedido.creado:P-1', 'pedido.creado:P-2']);
  await consumidor.cerrar();
});

test('si el manejador falla, el mensaje se reentrega (redelivered) y no se pierde', async () => {
  const intentos = [];
  const consumidor = await consumir({
    exchange, cola, patron: 'pedido.creado',
    alRecibir: async (e, { reentregado }) => {
      intentos.push(reentregado);
      if (!reentregado) throw new Error('fallo transitorio');
    },
  });
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-3' }));
  await esperar(() => intentos.length === 2);
  assert.deepEqual(intentos, [false, true]);
  await consumidor.cerrar();
});

test('la cola durable guarda los mensajes mientras el consumidor está apagado', async () => {
  await publicador.publicar(crearEvento('pedido.creado', { pedidoId: 'P-4' })); // nadie escucha ahora
  const recibidos = [];
  const consumidor = await consumir({ exchange, cola, patron: 'pedido.creado', alRecibir: async (e) => { recibidos.push(e.datos.pedidoId); } });
  await esperar(() => recibidos.length === 1);
  assert.deepEqual(recibidos, ['P-4']);
  await consumidor.cerrar();
});
```

`f116-kafka-rabbit/kafka.infra.js`:

```javascript
// Módulo 18 · F116 · Test contra Kafka real. Ejecuta: docker compose up -d --wait && node --test f116-kafka-rabbit/kafka.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { crearEvento } from './evento.js';
import { asegurarTopic, consumir, crearKafka, crearProductor } from './kafka.js';

const topic = `test.pedidos.${process.pid}`;
const kafka = crearKafka({ clientId: 'test' });
let productor;
before(async () => {
  await asegurarTopic(kafka, topic, 3);
  productor = await crearProductor(kafka);
});
after(async () => {
  await productor.cerrar();
  const admin = kafka.admin();
  await admin.connect();
  await admin.deleteTopics({ topics: [topic] });
  await admin.disconnect();
});

async function esperar(condicion, ms = 30000) {
  const fin = Date.now() + ms;
  while (!condicion()) {
    if (Date.now() > fin) throw new Error('tiempo de espera agotado');
    await dormir(50);
  }
}

test('la misma clave va siempre a la misma partición y conserva el orden', async () => {
  const particiones = new Set();
  for (const tipo of ['pedido.creado', 'pedido.pagado', 'pedido.enviado']) {
    particiones.add((await productor.publicar(crearEvento(tipo, { pedidoId: 'P-1' }), topic)).particion);
  }
  assert.equal(particiones.size, 1);

  const recibidos = [];
  const consumidor = await consumir(kafka, { grupo: `g1-${process.pid}`, topic, alRecibir: async (e) => { recibidos.push(e.tipo); } });
  await esperar(() => recibidos.length === 3);
  assert.deepEqual(recibidos, ['pedido.creado', 'pedido.pagado', 'pedido.enviado']);
  await consumidor.cerrar();
});

test('otro grupo de consumidores vuelve a leer TODO el topic (el log no se borra al consumir)', async () => {
  const recibidos = [];
  const consumidor = await consumir(kafka, { grupo: `g2-${process.pid}`, topic, alRecibir: async (e) => { recibidos.push(e.tipo); } });
  await esperar(() => recibidos.length === 3);
  assert.equal(recibidos.length, 3);
  await consumidor.cerrar();
});
```

**Pregunta de comprobación:** arrancas **dos** instancias de `kafka-consumidor.js` con el mismo `GRUPO` y publicas
los cuatro eventos. ¿Puede una instancia recibir `pedido.pagado` de P-1 y la otra `pedido.creado` de P-1? ¿Y con dos
instancias de `rabbit-consumidor.js` sobre la misma cola? (Respuesta: en Kafka no: los tres eventos de P-1 están en
la misma partición y una partición se asigna a una sola instancia del grupo, así que los recibe la misma y en orden.
En RabbitMQ sí: la cola reparte mensaje a mensaje entre sus consumidores; si el orden por pedido importa, necesitas
un solo consumidor por cola u otra estrategia.)

</details>

### NATS

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usar NATS desde Node para publicar y suscribirse con comodines, repartir carga con un grupo de cola y hacer petición/respuesta, y explicar qué garantía de entrega ofrece NATS core frente a Kafka y RabbitMQ; lo compruebas cuando, con NATS arriba, node --test f117-nats/nats.infra.j…

#### ► LA IDEA EN UNA FRASE
**Usar NATS desde Node para publicar y suscribirse con comodines, repartir carga con un grupo de cola y hacer petición/respuesta, y explicar qué garantía de entrega ofrece NATS core frente a Kafka y RabbitMQ; lo compruebas cuando, con NATS arriba, node --test f117-nats/nats.infra.js pasa 6 de 6.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en nats como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    PUB["pedidos<br/>publish('pedidos.creado')"] --> N(("NATS Server<br/>:4222"))
    N -- "pedidos.*" --> AUD["auditoria<br/>(recibe todos)"]
    N -- "pedidos.creado · queue 'facturacion'" --> FA["facturacion-A"]
    N -. "o bien" .-> FB["facturacion-B"]
    REQ["pedidos<br/>request('inventario.consultar')"] -- "reply: _INBOX.x" --> N
    N --> INV["inventario<br/>msg.respond()"]
    INV -- "publish(_INBOX.x)" --> N --> REQ
    NR["request('pagos.cobrar')"] --> N
    N -- "sin suscriptores:<br/>no responders (inmediato)" --> NR
```

1. **NATS** es otro sistema de mensajería, pensado para ser **muy simple y muy rápido**.
2. Los mensajes se envían a un **subject**: un nombre con puntos, como `pedidos.creado`. No hay que crearlo antes.
3. Quien quiera recibirlos se **suscribe** a ese nombre, o a un patrón (`pedidos.*`).
4. En su forma básica (NATS «core») **no guarda nada**: entrega el mensaje a quien esté escuchando en ese instante.
5. También sirve para **preguntar y recibir respuesta** entre servicios sin que uno conozca la dirección del otro:

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
Eventos de negocio críticos por NATS core, «porque es rápido»:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: nats funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **NATS** es otro sistema de mensajería, pensado para ser **muy simple y muy rápido**.
- Los mensajes se envían a un **subject**: un nombre con puntos, como `pedidos.creado`. No hay que crearlo antes.
- Quien quiera recibirlos se **suscribe** a ese nombre, o a un patrón (`pedidos.*`).
- En su forma básica (NATS «core») **no guarda nada**: entrega el mensaje a quien esté escuchando en ese instante.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve nats en tu contexto?
2. ¿Cómo sabrías que nats no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar nats?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    PUB["pedidos<br/>publish('pedidos.creado')"] --> N(("NATS Server<br/>:4222"))
    N -- "pedidos.*" --> AUD["auditoria<br/>(recibe todos)"]
    N -- "pedidos.creado · queue 'facturacion'" --> FA["facturacion-A"]
    N -. "o bien" .-> FB["facturacion-B"]
    REQ["pedidos<br/>request('inventario.consultar')"] -- "reply: _INBOX.x" --> N
    N --> INV["inventario<br/>msg.respond()"]
    INV -- "publish(_INBOX.x)" --> N --> REQ
    NR["request('pagos.cobrar')"] --> N
    N -- "sin suscriptores:<br/>no responders (inmediato)" --> NR
```

```javascript
// Módulo 18 · F117 · NATS: publicar/suscribir, grupos de cola y petición/respuesta.
// Requisitos: Node.js 26.13.1 LTS, @nats-io/transport-node 3.5.0 y NATS Server 2.15.3 (docker-compose.yml).
import { connect } from '@nats-io/transport-node';

export const URL_NATS = process.env.NATS_URL ?? 'nats://localhost:4222';

export function conectar(nombre, servidores = URL_NATS) {
  // name aparece en el monitoreo del servidor (/connz); el cliente reconecta solo si se cae la conexión.
  return connect({ servers: servidores, name: nombre });
}

// PUBLICAR: se envía a un «subject» (un texto con puntos). No hay cola ni topic que crear antes.
export function publicar(nc, subject, dato) {
  nc.publish(subject, JSON.stringify(dato));
}

// SUSCRIBIR: recibe todo lo que coincida. «*» vale por UN tramo y «>» por uno o más al final.
// Con `grupo`, las suscripciones del mismo grupo se reparten los mensajes (cada mensaje, a una sola).
export function suscribir(nc, subject, alRecibir, { grupo } = {}) {
  return nc.subscribe(subject, {
    queue: grupo,
    callback: (error, msg) => {
      if (error) return console.error(`suscripción ${subject}: ${error.message}`);
      alRecibir(msg.json(), msg.subject);
    },
  });
}

// RESPONDER: un servicio atiende peticiones en un subject. msg.respond() contesta al buzón temporal del que pregunta.
export function responder(nc, subject, manejador, { grupo } = {}) {
  return nc.subscribe(subject, {
    queue: grupo,
    callback: async (_error, msg) => msg.respond(JSON.stringify(await manejador(msg.json()))),
  });
}

// PEDIR: publica y espera UNA respuesta. Sin nadie escuchando falla al instante (no espera al timeout).
export async function pedir(nc, subject, dato, { timeoutMs = 1000 } = {}) {
  const respuesta = await nc.request(subject, JSON.stringify(dato), { timeout: timeoutMs });
  return respuesta.json();
}
```

```javascript
// Módulo 18 · F117 · Ejecuta (con docker compose arriba): node f117-nats/demo.js
import { setTimeout as dormir } from 'node:timers/promises';
import { conectar, pedir, publicar, responder, suscribir } from './nats.js';

const nc = await conectar('demo');
console.log(`conectado a ${nc.getServer()}`);

// 1) Publicar/suscribir con comodines: «auditoria» escucha todo lo de pedidos.
suscribir(nc, 'pedidos.*', (dato, subject) => console.log(`auditoria   ← ${subject} ${JSON.stringify(dato)}`));

// 2) Grupo de cola: dos «workers» de facturación se reparten los pedidos creados.
for (const id of ['A', 'B']) {
  suscribir(nc, 'pedidos.creado', (dato) => console.log(`facturacion-${id} ← ${dato.pedidoId}`), { grupo: 'facturacion' });
}

// 3) Petición/respuesta: «inventario» contesta consultas.
responder(nc, 'inventario.consultar', ({ sku }) => ({ sku, disponibles: sku === 'TEC-1' ? 12 : 0 }));

await nc.flush(); // espera a que el servidor haya registrado las suscripciones
for (const pedidoId of ['P-1', 'P-2', 'P-3', 'P-4']) publicar(nc, 'pedidos.creado', { pedidoId });
publicar(nc, 'pedidos.cancelado', { pedidoId: 'P-2' });
await dormir(200);

console.log('respuesta   ←', JSON.stringify(await pedir(nc, 'inventario.consultar', { sku: 'TEC-1' })));
await pedir(nc, 'pagos.cobrar', { pedidoId: 'P-1' }).catch((error) => console.log(`pagos.cobrar → ${error.name}: ${error.message}`));

await nc.drain(); // procesa lo pendiente, cancela las suscripciones y cierra
```

```bash
   docker compose up -d --wait nats
   curl -s localhost:8222/healthz; echo
   ```

```bash
   node f117-nats/demo.js
   ```

```bash
   docker compose stop nats
   node f117-nats/demo.js 2>&1 | grep -E '^ConnectionError|\[cause\]'
   docker compose start nats
   ```

</details>

### Sync vs async

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Comparar con un experimento el mismo flujo implementado de forma síncrona y asíncrona, midiendo latencia y comportamiento ante la caída de una dependencia, y decidir con criterios explícitos qué interacciones de un diseño deben ser síncronas y cuáles asíncronas; lo compruebas cua…

#### ► LA IDEA EN UNA FRASE
**Comparar con un experimento el mismo flujo implementado de forma síncrona y asíncrona, midiendo latencia y comportamiento ante la caída de una dependencia, y decidir con criterios explícitos qué interacciones de un diseño deben ser síncronas y cuáles asíncronas; lo compruebas cuando node --test f118-sync-async/comparar.test.js pasa 5 de 5 y justificas la tabla de decisión para un caso nuevo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sync vs async como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    subgraph SYNC["Síncrono: el cliente espera la cadena entera"]
        C1["cliente"] -- "POST /pedidos" --> PD1["pedidos"]
        PD1 -- "1 · cobrar (50 ms)" --> PG1["pagos"]
        PD1 -- "2 · notificar (200 ms)" --> NT1["notificaciones"]
        PD1 -- "201 tras ~250 ms<br/>503 si CUALQUIERA falla" --> C1
    end
    subgraph ASYNC["Híbrido: síncrono lo necesario, asíncrono lo demás"]
        C2["cliente"] -- "POST /pedidos" --> PD2["pedidos"]
        PD2 -- "1 · cobrar (50 ms)" --> PG2["pagos"]
        PD2 -- "2 · publicar pedido.creado" --> Q[("cola / broker")]
        PD2 -- "201 tras ~50 ms" --> C2
        Q -- "cuando pueda" --> NT2["notificaciones"]
    end
```

1. **Síncrono:** preguntas y **te quedas esperando** la respuesta. Como una llamada de teléfono.
2. **Asíncrono:** dejas un mensaje y **sigues**; la otra parte lo atiende cuando puede. Como un mensaje de texto.
3. Ninguna es «mejor». Cada una sirve para cosas distintas:
4. Si **necesitas la respuesta para continuar** («¿se pudo cobrar?»), tienes que esperar: síncrono.
5. Si solo estás **avisando de algo que ya pasó** («se creó el pedido, envíen el correo»), no hay por qué esperar:

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sync vs async se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sync vs async | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La cadena síncrona profunda (el «monolito distribuido» en tiempo de ejecución):

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sync vs async funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **Síncrono:** preguntas y **te quedas esperando** la respuesta. Como una llamada de teléfono.
- **Asíncrono:** dejas un mensaje y **sigues**; la otra parte lo atiende cuando puede. Como un mensaje de texto.
- Ninguna es «mejor». Cada una sirve para cosas distintas:
- Si **necesitas la respuesta para continuar** («¿se pudo cobrar?»), tienes que esperar: síncrono.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sync vs async en tu contexto?
2. ¿Cómo sabrías que sync vs async no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sync vs async?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    subgraph SYNC["Síncrono: el cliente espera la cadena entera"]
        C1["cliente"] -- "POST /pedidos" --> PD1["pedidos"]
        PD1 -- "1 · cobrar (50 ms)" --> PG1["pagos"]
        PD1 -- "2 · notificar (200 ms)" --> NT1["notificaciones"]
        PD1 -- "201 tras ~250 ms<br/>503 si CUALQUIERA falla" --> C1
    end
    subgraph ASYNC["Híbrido: síncrono lo necesario, asíncrono lo demás"]
        C2["cliente"] -- "POST /pedidos" --> PD2["pedidos"]
        PD2 -- "1 · cobrar (50 ms)" --> PG2["pagos"]
        PD2 -- "2 · publicar pedido.creado" --> Q[("cola / broker")]
        PD2 -- "201 tras ~50 ms" --> C2
        Q -- "cuando pueda" --> NT2["notificaciones"]
    end
```

```javascript
// Módulo 18 · F118 · Sync vs async: el MISMO flujo (crear pedido → cobrar → notificar) con las dos formas de comunicar.
// Requisitos: Node.js 26.13.1 LTS (sin dependencias). La cola en memoria hace aquí el papel del broker
// (RabbitMQ, Kafka o NATS de las fichas anteriores) para que el experimento corra sin infraestructura.
import { createServer } from 'node:http';
import { setTimeout as dormir } from 'node:timers/promises';

// Un servicio HTTP de mentira: tarda `latenciaMs` y se puede «apagar» (responde 503).
export async function servicio(nombre, latenciaMs) {
  const estado = { nombre, caido: false, atendidas: 0 };
  const servidor = createServer(async (_req, res) => {
    await dormir(latenciaMs);
    if (estado.caido) return res.writeHead(503).end();
    estado.atendidas += 1;
    res.writeHead(200).end('ok');
  });
  await new Promise((ok) => servidor.listen(0, ok));
  estado.url = `http://localhost:${servidor.address().port}`;
  estado.cerrar = () => { servidor.closeAllConnections(); servidor.close(); };
  return estado;
}

async function llamar(destino) {
  const res = await fetch(destino.url, { method: 'POST', signal: AbortSignal.timeout(2000) });
  if (!res.ok) throw new Error(`${destino.nombre} respondió ${res.status}`);
}

// SÍNCRONO: pedidos espera a pagos y a notificaciones antes de contestar al cliente.
export function pedidosSincrono({ pagos, notificaciones }) {
  return async function crearPedido(pedidoId) {
    const inicio = performance.now();
    try {
      await llamar(pagos); // necesito la respuesta para decidir → tiene sentido esperar
      await llamar(notificaciones); // NO la necesito para decidir → aquí esperar es acoplamiento gratuito
      return { status: 201, pedidoId, ms: Math.round(performance.now() - inicio) };
    } catch (error) {
      return { status: 503, pedidoId, ms: Math.round(performance.now() - inicio), error: error.message };
    }
  };
}

// La «cola»: guarda los mensajes hasta que el consumidor los procesa con éxito (reintenta si falla).
export function cola() {
  const pendientes = [];
  return {
    pendientes,
    publicar: (mensaje) => { pendientes.push(mensaje); },
    // Procesa lo que haya; lo que falle se queda en la cola para el próximo intento.
    async procesar(manejador) {
      let procesados = 0;
      while (pendientes.length > 0) {
        try { await manejador(pendientes[0]); } catch { break; }
        pendientes.shift();
        procesados += 1;
      }
      return procesados;
    },
  };
}

// ASÍNCRONO (híbrido): el cobro sigue siendo síncrono (se necesita el resultado); la notificación se
// convierte en un evento que se publica y se procesa después. El cliente recibe la respuesta sin esperarla.
export function pedidosAsincrono({ pagos, eventos }) {
  return async function crearPedido(pedidoId) {
    const inicio = performance.now();
    try {
      await llamar(pagos);
      eventos.publicar({ tipo: 'pedido.creado', pedidoId });
      return { status: 201, pedidoId, ms: Math.round(performance.now() - inicio) };
    } catch (error) {
      return { status: 503, pedidoId, ms: Math.round(performance.now() - inicio), error: error.message };
    }
  };
}

export const notificar = (notificaciones) => () => llamar(notificaciones);
```

```javascript
// Módulo 18 · F118 · Ejecuta: node f118-sync-async/comparar.js
import { cola, notificar, pedidosAsincrono, pedidosSincrono, servicio } from './servicios.js';

const pagos = await servicio('pagos', 50);
const notificaciones = await servicio('notificaciones', 200);
// Calentamiento: la primera conexión HTTP tarda más y falsearía la comparación.
for (const s of [pagos, notificaciones]) { await fetch(s.url, { method: 'POST' }); s.atendidas = 0; }
const eventos = cola();
const sincrono = pedidosSincrono({ pagos, notificaciones });
const asincrono = pedidosAsincrono({ pagos, eventos });
const linea = (modo, r) => console.log(`${modo.padEnd(9)} ${r.pedidoId} → ${r.status} en ~${Math.round(r.ms / 50) * 50} ms${r.error ? ` (${r.error})` : ''}`);

console.log('1) Todo sano');
linea('síncrono', await sincrono('P-1'));
linea('asíncrono', await asincrono('P-2'));
console.log(`   cola: ${eventos.pendientes.length} pendiente(s) → el worker procesa ${await eventos.procesar(notificar(notificaciones))}`);

console.log('2) notificaciones caído');
notificaciones.caido = true;
linea('síncrono', await sincrono('P-3'));
linea('asíncrono', await asincrono('P-4'));
console.log(`   cola: ${eventos.pendientes.length} pendiente(s) → el worker procesa ${await eventos.procesar(notificar(notificaciones))} (sigue caído)`);

console.log('3) notificaciones vuelve');
notificaciones.caido = false;
console.log(`   cola: ${eventos.pendientes.length} pendiente(s) → el worker procesa ${await eventos.procesar(notificar(notificaciones))}`);
console.log(`   notificaciones enviadas en total: ${notificaciones.atendidas}`);

console.log('4) pagos caído (dependencia que SÍ se necesita para decidir)');
pagos.caido = true;
linea('síncrono', await sincrono('P-5'));
linea('asíncrono', await asincrono('P-6'));

pagos.cerrar();
notificaciones.cerrar();
```

```bash
   node f118-sync-async/comparar.js
   ```

```text
1) Todo sano
síncrono  P-1 → 201 en ~250 ms
asíncrono P-2 → 201 en ~50 ms
   cola: 1 pendiente(s) → el worker procesa 1
2) notificaciones caído
síncrono  P-3 → 503 en ~250 ms (notificaciones respondió 503)
asíncrono P-4 → 201 en ~50 ms
   cola: 1 pendiente(s) → el worker procesa 0 (sigue caído)
3) notificaciones vuelve
   cola: 1 pendiente(s) → el worker procesa 1
   notificaciones enviadas en total: 3
4) pagos caído (dependencia que SÍ se necesita para decidir)
síncrono  P-5 → 503 en ~50 ms (pagos respondió 503)
asíncrono P-6 → 503 en ~50 ms (pagos respondió 503)
```

```text
síncrono  P-1 → 201 en ~1050 ms
asíncrono P-2 → 201 en ~50 ms
síncrono  P-3 → 503 en ~1050 ms (notificaciones respondió 503)
```

</details>
