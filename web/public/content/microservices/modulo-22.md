# Módulo 18 · Comunicación

**Fase 2 · Node.js de cero a experto** (semana 7 de 12). **Duración:** 14 h (6 temas de 2 h y 2 h de laboratorio
integrador). **Dificultad:** 2 de 5 en REST, 3 de 5 en gRPC, GraphQL y mensajería, 4 de 5 en decidir entre síncrono y
asíncrono. **Dependencias:** Módulo 17 (estructura, configuración, descubrimiento), Módulo 14 (API REST) y Módulo 13
(promesas, `async/await`, streams). **Herramientas:** **Node.js 26.13.1 LTS**, **axios 1.21.1**, **@grpc/grpc-js
1.14.7** + **@grpc/proto-loader 0.8.1**, **@apollo/server 5.5.2** + **graphql 16.15.0** + **dataloader 2.2.3**,
**kafkajs 2.2.4**, **amqplib 2.4.0**, **@nats-io/transport-node 3.5.0**; brokers **Apache Kafka 4.4.0**, **RabbitMQ
4.4.1** y **NATS Server 2.15.3** (Docker Compose). **Laboratorio:** `modulo-22`
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

#### 1. UBICACIÓN

Módulo 18, Lección 1 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- HTTP: métodos, códigos de estado y JSON (Módulo 0.4); una API REST en Node (Módulo 14).
- Promesas, `async/await` y `try/catch` (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** un cliente REST entre servicios con `fetch` y otro con Axios que tengan timeout, id de correlación y
traducción de errores a un tipo propio, y **distinguir** cómo trata cada uno un 404, un 503, una respuesta lenta y un
servicio apagado; lo compruebas cuando `node --test f113-rest/clientes.test.js` pasa 10 de 10.

#### 4. ANALOGÍA VISUAL

Dibuja **dos formas de pedir un documento en una ventanilla** de una oficina pública. A la izquierda, **vas tú**
(`fetch`): llevas tu formulario, esperas en la fila **sin reloj** (nadie te dice cuándo rendirte: tienes que traer tu
propio cronómetro), y el funcionario **siempre te entrega un sobre**; a veces dentro viene el documento y a veces una
hoja que dice «no existe» o «sistema caído». Si no abres el sobre y miras el **sello de la esquina** (verde = 2xx),
te vas a casa creyendo que tienes el documento. Solo vuelves con las manos vacías si la oficina estaba cerrada o tu
cronómetro sonó. A la derecha, **mandas a un gestor** (Axios): le das una vez la dirección de la oficina, el tiempo
máximo que puede esperar y tus datos (la instancia configurada); él añade a cada trámite una **etiqueta con número de
seguimiento** (interceptor), abre el sobre por ti y, si el sello no es verde, **te avisa de inmediato** como un
problema, con el sobre adjunto. El resultado final es el mismo; cambia cuánto haces tú a mano.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** pedidos llama a inventario con GET /existencias/TEC-1, una cabecera x-request-id y un timeout.
Hay cuatro resultados. Con 200 y JSON, fetch resuelve con res.ok en true y axios resuelve con data ya convertido en
objeto. Con 404 o 503, fetch también resuelve pero con res.ok en false, mientras axios rechaza con error.response.
Si no llega nada a tiempo, fetch rechaza con TimeoutError y axios con el código ECONNABORTED. Si la conexión es
rechazada, fetch rechaza con un TypeError cuyo cause trae el código y axios rechaza con el código ECONNREFUSED. Los
dos clientes traducen esos casos al mismo ErrorDeInventario con los tipos NO_ENCONTRADO, NO_DISPONIBLE o
TIEMPO_AGOTADO.

#### 6. EXPLICACIÓN NIVEL 0

- Cuando un servicio necesita un dato de otro, lo más directo es **preguntarle por HTTP**, igual que tu navegador le
  pregunta a una página web. A ese estilo de API se le llama **REST**.
- El que pregunta es el **cliente** y el que responde, el **servidor**. Un microservicio suele ser las dos cosas:
  servidor para unos y cliente de otros.
- En Node hay dos herramientas habituales para hacer de cliente: **`fetch`**, que ya viene con Node, y **Axios**, una
  librería que se instala y trae más comodidades.
- Preguntar por la red puede salir mal de formas que no existen dentro de un programa: el otro tarda demasiado, está
  apagado, o responde «no lo tengo». Un buen cliente **prevé las cuatro situaciones** y nunca espera para siempre.

#### 7. EXPLICACIÓN INTERMEDIA

- **`fetch(url, opciones)`** devuelve una promesa de `Response`. Resuelve con **cualquier** código HTTP: hay que
  mirar `res.ok` (true para 200–299) o `res.status`. Solo rechaza por fallo de red, por abortar o por timeout. El
  cuerpo se lee aparte: `await res.json()`.
- **`fetch` no tiene timeout por defecto.** Se pone con `signal: AbortSignal.timeout(ms)`, que rechaza con un error
  de nombre `TimeoutError`.
- **Axios**: `axios.create({ baseURL, timeout, headers })` crea una instancia por servicio destino. Convierte el JSON
  solo (`respuesta.data`), **rechaza** con cualquier código fuera de 2xx (`error.response.status`) y distingue por
  `error.code`: `ECONNABORTED` (timeout) o `ECONNREFUSED` (nadie escucha).
- **Interceptores de Axios:** funciones que se ejecutan en cada petición o respuesta. Aquí añaden `x-request-id` y
  traducen los errores en un solo lugar.
- **Id de correlación:** una cabecera (`x-request-id`) que viaja de servicio en servicio para poder seguir una
  petición en los logs (el Módulo 21 lo estandariza con `traceparent`).
- **Traducir errores:** el resto del servicio no debe saber si debajo hay fetch o Axios. Los dos clientes lanzan
  `ErrorDeInventario` con `tipo` (`NO_ENCONTRADO`, `TIEMPO_AGOTADO`, `NO_DISPONIBLE`) y guardan el original en `cause`.
- **Un 404 y un 503 no significan lo mismo:** «no existe» es una respuesta de negocio válida; «no disponible» es un
  fallo que quizá merezca reintento (Módulo 19). Mezclarlos produce decisiones equivocadas.
- **`encodeURIComponent`** en cualquier dato que pongas en la ruta: un SKU con `/` o `?` cambiaría la URL.

#### 8. EXPLICACIÓN MAESTRA

- **fetch vs Axios vs otros.**
  1. **`fetch`** (nativo, implementado por undici): cero dependencias, estándar web (mismo código en navegador, Deno,
     Bun, workers), streaming del cuerpo. Tienes que escribir tú el timeout, la comprobación de `res.ok` y cualquier
     «interceptor» (una función que envuelva a `fetch`).
  2. **Axios**: instancia configurable, interceptores, conversión de JSON, rechazo por estado. Es una dependencia más
     (con su historial de avisos de seguridad que hay que seguir) y en Node usa el módulo `http` clásico, no undici.
  3. **undici directamente** (`request`, `Pool`, `Agent`): el máximo rendimiento y control del pool de conexiones.
  4. **Clientes generados desde OpenAPI** (Módulo 14): tipos y rutas salen del contrato; cambian cuando cambia el
     contrato, no cuando alguien se acuerda.
- **El timeout es parte del contrato.** Sin él, una dependencia lenta retiene tus conexiones y tu memoria hasta que tú
  también dejas de responder: así se propaga una caída. El valor sale del presupuesto de latencia de quien te llama a
  ti (Módulo 19), no de un número redondo.
- **Reintentar no es gratis:** solo para operaciones idempotentes (GET, PUT, DELETE, o POST con clave de
  idempotencia), con espera creciente y tope. Un reintento automático de un POST de cobro duplica cobros.
- **Conexiones:** `fetch` en Node reutiliza conexiones (keep-alive) con el pool global de undici; en Axios hay que
  pasar un `http.Agent({ keepAlive: true })` propio si quieres ajustar el pool. Con mucho tráfico entre dos servicios,
  abrir una conexión TCP+TLS por petición domina la latencia.
- **REST entre servicios vs alternativas:** REST es universal y se depura con `curl`, pero su contrato es débil si no
  hay OpenAPI y JSON es voluminoso. gRPC (ficha 2) da contrato estricto y streaming; la mensajería (fichas 4 y 5)
  quita el acoplamiento temporal.
- **Cuándo NO usar una llamada REST:** cuando no necesitas la respuesta para contestar a tu cliente (usa un evento),
  cuando encadenarías tres o más llamadas en serie para una sola petición (la disponibilidad se multiplica a la baja:
  ficha 6), o para transferir grandes volúmenes en tiempo real.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** (`fetch` nativo) y **axios 1.21.1** (dependencia del `package.json` del
laboratorio).

`f113-rest/servicio-inventario.js` (el servidor al que llaman los dos clientes):

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

`f113-rest/errores.js`:

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

`f113-rest/cliente-fetch.js`:

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

`f113-rest/cliente-axios.js`:

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

`f113-rest/main.js`:

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

#### 10. MINI-LABORATORIO

1. Instala las dependencias fijadas (una sola vez para todo el módulo) y arranca el servicio de inventario:
   ```bash
   npm ci
   node f113-rest/servicio-inventario.js
   ```
2. En otra terminal, mira primero las respuestas crudas con `curl` y después lanza los dos clientes:
   ```bash
   curl -s -w ' [%{http_code}]\n' localhost:3113/existencias/TEC-1 -H 'x-request-id: demo-1'
   curl -s -w ' [%{http_code}]\n' localhost:3113/existencias/ROTO
   node f113-rest/main.js
   ```
3. **Rompe el sistema a propósito:** detén el servicio de inventario (Ctrl+C) y repite `node f113-rest/main.js`.

**Output esperado** (paso 2, salida real):

```text
{"sku":"TEC-1","disponibles":12,"requestId":"demo-1"} [200]
{"detalle":"Inventario en mantenimiento"} [503]
fetch TEC-1  → 12 disponibles
fetch NO-HAY → NO_ENCONTRADO: inventario no conoce el SKU NO-HAY
fetch ROTO   → NO_DISPONIBLE: inventario respondió 503
fetch LENTO  → TIEMPO_AGOTADO: inventario no respondió en 500 ms
axios TEC-1  → 12 disponibles
axios NO-HAY → NO_ENCONTRADO: inventario no conoce ese SKU
axios ROTO   → NO_DISPONIBLE: inventario respondió 503
axios LENTO  → TIEMPO_AGOTADO: inventario no respondió en 500 ms
apagado      → NO_DISPONIBLE: no se pudo conectar con inventario: ECONNREFUSED
apagado      → NO_DISPONIBLE: no se pudo conectar con inventario: ECONNREFUSED
```

**Output esperado** (paso 3, con inventario detenido: las ocho llamadas fallan igual y enseguida):

```text
fetch TEC-1  → NO_DISPONIBLE: no se pudo conectar con inventario: ECONNREFUSED
```

**Captura comentada:** las ocho primeras líneas son idénticas por pares: los dos clientes cumplen el mismo contrato
aunque por dentro `fetch` haya **resuelto** el 503 y Axios lo haya **rechazado**. Las líneas `LENTO` tardan medio
segundo, no el segundo y medio que tarda el servidor: el timeout corta la espera. Las dos últimas llaman a un puerto
donde no escucha nadie (39113) para mostrar el fallo de conexión sin apagar nada.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f113-rest/clientes.test.js
```

Salida real:

```text
▶ cliente con fetch
  ✔ 200 → devuelve el JSON ya convertido y envía x-request-id (18.780938ms)
  ✔ 404 → NO_ENCONTRADO (8.5829ms)
  ✔ 503 → NO_DISPONIBLE (1.605619ms)
  ✔ respuesta lenta → TIEMPO_AGOTADO sin esperar los 1500 ms (203.063842ms)
  ✔ servicio apagado → NO_DISPONIBLE con ECONNREFUSED (7.964276ms)
✔ cliente con fetch (243.82255ms)
▶ cliente con axios
  ✔ 200 → devuelve el JSON ya convertido y envía x-request-id (12.14613ms)
  ✔ 404 → NO_ENCONTRADO (3.412432ms)
  ✔ 503 → NO_DISPONIBLE (2.195156ms)
  ✔ respuesta lenta → TIEMPO_AGOTADO sin esperar los 1500 ms (203.241732ms)
  ✔ servicio apagado → NO_DISPONIBLE con ECONNREFUSED (3.018716ms)
✔ cliente con axios (224.658929ms)
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

`f113-rest/clientes.test.js` (los mismos cinco tests se ejecutan contra los dos clientes):

```javascript
// Módulo 18 · F113 · Ejecuta: node --test f113-rest/clientes.test.js
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { clienteAxios } from './cliente-axios.js';
import { clienteFetch } from './cliente-fetch.js';
import { crearInventario } from './servicio-inventario.js';

const servidor = crearInventario();
let base;
let apagado; // URL de un puerto donde ya no escucha nadie
before(async () => {
  await new Promise((ok) => servidor.listen(0, ok));
  base = `http://localhost:${servidor.address().port}`;
  const temporal = crearInventario();
  await new Promise((ok) => temporal.listen(0, ok));
  apagado = `http://localhost:${temporal.address().port}`;
  await new Promise((ok) => temporal.close(ok));
});
after(() => { servidor.closeAllConnections(); servidor.close(); });

// El MISMO contrato para los dos clientes: quien los usa no distingue cuál hay debajo.
for (const [nombre, crear] of [['fetch', clienteFetch], ['axios', clienteAxios]]) {
  describe(`cliente con ${nombre}`, () => {
    test('200 → devuelve el JSON ya convertido y envía x-request-id', async () => {
      const dato = await crear(base).existencias('TEC-1');
      assert.equal(dato.disponibles, 12);
      assert.match(dato.requestId, /^[0-9a-f-]{36}$/);
    });
    test('404 → NO_ENCONTRADO', async () => {
      await assert.rejects(crear(base).existencias('NO-HAY'), { name: 'ErrorDeInventario', tipo: 'NO_ENCONTRADO' });
    });
    test('503 → NO_DISPONIBLE', async () => {
      await assert.rejects(crear(base).existencias('ROTO'), { tipo: 'NO_DISPONIBLE', message: 'inventario respondió 503' });
    });
    test('respuesta lenta → TIEMPO_AGOTADO sin esperar los 1500 ms', async () => {
      const inicio = performance.now();
      await assert.rejects(crear(base, { timeoutMs: 200 }).existencias('LENTO'), { tipo: 'TIEMPO_AGOTADO' });
      assert.ok(performance.now() - inicio < 1000);
    });
    test('servicio apagado → NO_DISPONIBLE con ECONNREFUSED', async () => {
      await assert.rejects(crear(apagado).existencias('TEC-1'), { tipo: 'NO_DISPONIBLE', message: /ECONNREFUSED/ });
    });
  });
}
```

**Pregunta de comprobación:** quitas la línea `signal: AbortSignal.timeout(timeoutMs)` de `cliente-fetch.js`. ¿Qué
test falla y qué le pasaría a tu servicio en producción si inventario se quedara colgado? (Respuesta: falla «respuesta
lenta → TIEMPO_AGOTADO», porque la llamada resuelve con 200 a los 1500 ms. En producción cada petición a tu servicio
esperaría sin límite: se acumulan conexiones abiertas y memoria hasta que tu servicio deja de responder también.)

#### 12. ERROR COMÚN

**Síntoma:** tu servicio toma decisiones con datos que no existen, o falla con `Cannot read properties of undefined`
lejos de la llamada HTTP. Causa: tratar a `fetch` como si lanzara una excepción con un 404 o un 503.
`f113-rest/error-comun.js`:

```javascript
// Módulo 18 · F113 · ERROR COMÚN: creer que fetch lanza una excepción cuando el servidor responde 404 o 503.
// Ejecuta (con el servicio arrancado): node f113-rest/error-comun.js
const base = process.env.INVENTARIO_URL ?? 'http://localhost:3113';

try {
  const res = await fetch(`${base}/existencias/ROTO`); // el servidor responde 503
  const { disponibles } = await res.json(); // …y aquí nadie miró res.ok
  console.log('disponibles:', disponibles);
  if (disponibles > 0) console.log('hay existencias');
  else console.log('SIN existencias → se rechaza el pedido (¡pero inventario solo estaba en mantenimiento!)');
} catch (error) {
  console.log('nunca llega aquí con un 503:', error.message);
}
```

**Cómo se ve** (`node f113-rest/error-comun.js` con el servicio arrancado, salida real):

```text
disponibles: undefined
SIN existencias → se rechaza el pedido (¡pero inventario solo estaba en mantenimiento!)
```

**Diagnóstico visual:** un `undefined` donde esperabas un número, justo después de un `await res.json()`, es la
señal: el JSON que llegó es el **cuerpo del error** (`{"detalle":"Inventario en mantenimiento"}`), no el dato. El
`catch` no se ejecutó porque para `fetch` un 503 es una respuesta entregada con éxito. Añade temporalmente
`console.log(res.status)` y lo verás. **Arreglo:** comprueba `res.ok` (o `res.status`) **antes** de leer el cuerpo y
lanza tu propio error, como hace `cliente-fetch.js`; mejor aún, que ninguna ruta llame a `fetch` directamente, sino
al cliente del servicio.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué diferencias hay entre `fetch` y Axios para llamar a otro servicio, y qué no puede faltar en ese cliente?»

**Respuesta modelo:** `fetch` es nativo y estándar, pero es de bajo nivel: resuelve con cualquier código HTTP (hay
que mirar `res.ok`), no tiene timeout salvo que pases un `AbortSignal` y el JSON se lee aparte. Axios es una librería
que da una instancia configurada por servicio, interceptores, conversión automática y rechaza si el estado no es 2xx.
Elija lo que elija, el cliente de un servicio necesita: timeout explícito en cada llamada; distinción entre «no
existe», «falló» y «tardó», traducidos a errores de mi dominio para no filtrar la librería al resto del código;
propagación del id de correlación o del contexto de traza; reutilización de conexiones; y, encima, las políticas de
resiliencia (reintentos solo de operaciones idempotentes, circuit breaker). Lo encapsulo en un módulo por servicio
destino para que el resto del código llame a `inventario.existencias(sku)` y no a HTTP.

#### 14. ANTI-PATRÓN RELACIONADO

**Llamadas HTTP crudas repartidas por el código, sin timeout y con la URL concatenada:**

```javascript
// ❌ en un handler cualquiera de pedidos
const r = await fetch('http://10.0.3.7:3113/existencias/' + req.body.sku);   // IP fija, SKU sin codificar, sin timeout
const inv = await r.json();                                                   // sin mirar r.ok
if (inv.disponibles > 0) { /* … */ }

// ❌ y en otro archivo, la misma llamada con axios y otras reglas
const { data } = await axios.get(`${process.env.INV}/existencias/${sku}`).catch(() => ({ data: {} })); // se traga el error
```

Se ve así: cuando inventario cambia una ruta hay que buscarla en veinte archivos; una dependencia lenta deja colgadas
las peticiones de pedidos sin un solo error en el log; y un `catch(() => ({}))` convierte una caída de inventario en
«no hay existencias» para todos los clientes.

---

### gRPC con @grpc/grpc-js

#### 1. UBICACIÓN

Módulo 18, Lección 2 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- Un cliente REST con timeout y errores traducidos (ficha anterior).
- Iteración asíncrona (`for await`) y streams (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Definir** un contrato en Protocol Buffers, **implementar** con `@grpc/grpc-js` un servidor y un cliente Node con una
llamada unaria y un streaming de servidor, y **aplicar** deadlines y códigos de estado gRPC; lo compruebas cuando
`node --test f114-grpc/inventario.test.js` pasa 6 de 6.

#### 4. ANALOGÍA VISUAL

Dibuja **dos empresas que intercambian pedidos**. Arriba, la forma «REST con JSON»: se envían **cartas escritas a
mano**, cada una con su estilo; el que la recibe la lee entera, interpreta la letra y a veces descubre que falta un
dato. Abajo, la forma «gRPC»: antes de empezar, las dos empresas **firman un formulario oficial numerado** (el archivo
`.proto`): casilla 1 = código de producto, casilla 2 = cantidad, casilla 3 = bodega. A partir de ahí no se mandan
cartas: se mandan **tiras perforadas compactas** donde solo viaja «casilla 1: TEC-1» (binario: pequeño y rápido de
leer por una máquina), por una **línea telefónica directa que queda abierta** (HTTP/2). Por esa misma línea, una
empresa puede hacer una pregunta y recibir **una respuesta**, o pedir «avísame cada vez que cambie el inventario» y
recibir **un goteo de respuestas** (streaming). En cada llamada, quien pregunta dice **«necesito la respuesta antes
de las 10:30:05»** (deadline): pasada esa hora, cuelga, y el otro lado puede dejar de trabajar. Y si algo falla, no
hay excusas en prosa: hay una **lista cerrada de códigos** («5: no existe», «4: se acabó el plazo», «14: no
disponible»).

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de secuencia entre pedidos, cliente gRPC, e inventario, servidor gRPC; ambos cargan
el mismo archivo inventario.proto. Primero una llamada unaria ConsultarExistencias con deadline de un segundo que
devuelve un mensaje Existencias y estado OK. Después una llamada SeguirExistencias con streaming de servidor: llegan
tres mensajes (12, 11, 10) y el fin del stream con estado OK. Una consulta por un SKU inexistente devuelve el estado
NOT_FOUND, código 5. Una consulta lenta con deadline de 300 milisegundos vence: el cliente cancela la llamada y
recibe DEADLINE_EXCEEDED, código 4.

#### 6. EXPLICACIÓN NIVEL 0

- **gRPC** es otra forma de que un servicio llame a otro. En lugar de pensar en «rutas y verbos» (REST), piensas en
  **llamar a una función que vive en otra máquina**: `inventario.ConsultarExistencias({ sku })`.
- Antes de programar, los dos equipos escriben un **contrato** en un archivo `.proto`: qué funciones hay y qué datos
  entran y salen de cada una, con su tipo. Ese archivo es la fuente de verdad.
- Los datos no viajan como texto JSON sino en un formato **binario** compacto llamado **Protocol Buffers**: ocupa
  menos y se procesa más rápido, pero no se lee a simple vista.
- Permite **streaming**: una llamada puede devolver muchas respuestas a lo largo del tiempo.
- **`@grpc/grpc-js`** es la librería oficial para usar gRPC en Node, escrita en JavaScript puro.

#### 7. EXPLICACIÓN INTERMEDIA

- **El `.proto`:** `service` con sus `rpc` y `message` con campos **numerados**. El número, no el nombre, identifica
  el campo en el cable: nunca se cambia ni se reutiliza. Añadir un campo nuevo con un número nuevo es compatible.
- **Dos formas de usarlo en Node:** carga dinámica con `@grpc/proto-loader` (esta ficha: lee el `.proto` al arrancar)
  o generación de código y tipos con `protoc`/`buf` (mejor con TypeScript y equipos grandes).
- **Opciones de carga:** `keepCase: false` convierte `bodega_origen` en `bodegaOrigen`; `longs: String` evita perder
  precisión con `int64`; `defaults: true` rellena los campos ausentes con su valor por defecto. En proto3 un `0` o un
  `""` **no viajan**: el receptor no distingue «0» de «no enviado».
- **Servidor:** `new grpc.Server()`, `addService(Servicio.service, implementación)` y `bindAsync(dirección,
  credenciales, cb)`. Un método unario recibe `(call, callback)`; uno con streaming de servidor recibe `call` y usa
  `call.write()` y `call.end()`.
- **Cliente (stub):** `new Inventario(dirección, credenciales)`. La llamada unaria usa callback (se envuelve en una
  promesa); la de streaming devuelve un stream legible que se recorre con `for await`.
- **Deadline:** un instante absoluto por llamada (`{ deadline: Date.now() + 1000 }`). Al vencer, el cliente recibe
  `DEADLINE_EXCEEDED` y el servidor ve `call.cancelled`. **Por defecto no hay deadline**: la llamada espera sin límite.
- **Códigos de estado:** `OK (0)`, `INVALID_ARGUMENT (3)`, `DEADLINE_EXCEEDED (4)`, `NOT_FOUND (5)`,
  `UNAVAILABLE (14)`… El servidor responde un error con `callback({ code, details })`.
- **Transporte:** HTTP/2, una conexión de larga vida con muchas llamadas multiplexadas. `createInsecure()` es sin
  TLS, solo para desarrollo.

#### 8. EXPLICACIÓN MAESTRA

- **gRPC vs REST vs mensajería.**
  1. **gRPC**: contrato estricto y evolutivo, binario eficiente, streaming en los dos sentidos, deadlines y
     cancelación propagados. Cuesta herramientas (no hay `curl`: usas `grpcurl` o reflexión), los navegadores no lo
     hablan directamente (gRPC-Web o un gateway) y los balanceadores deben entender HTTP/2.
  2. **REST + OpenAPI**: universal, legible, cacheable por HTTP, ideal hacia fuera (clientes externos, navegador).
     Contrato más laxo y sin streaming estándar.
  3. **Mensajería** (fichas 4 y 5): cuando no necesitas la respuesta ahora.
  La elección frecuente: gRPC **entre servicios internos** con mucho tráfico o streaming, REST o GraphQL en el borde.
- **Balanceo:** una conexión HTTP/2 vive mucho tiempo, así que un balanceador de capa 4 (o el `Service` de Kubernetes)
  manda **todas** las llamadas de un cliente al mismo servidor. Soluciones: balanceo en el cliente (`dns:///` con la
  política `round_robin` de grpc-js contra un servicio *headless*), un proxy de capa 7 (Envoy) o un service mesh.
- **Evolución del contrato:** añade campos, no cambies números ni tipos, marca `reserved` lo que elimines, versiona el
  paquete (`academia.inventario.v1`). Herramientas como `buf breaking` lo comprueban en la integración continua.
- **Propaga el deadline:** si a pedidos le quedan 400 ms de su propio plazo, su llamada a inventario no debe dar
  1 s. El deadline restante viaja hacia abajo en la cadena; así nadie trabaja para una respuesta que ya nadie espera.
- **`@grpc/grpc-js` vs alternativas en Node:** `grpc` (el paquete nativo en C++) está retirado; ConnectRPC
  (`@connectrpc/connect`) habla gRPC, gRPC-Web y su propio protocolo sobre HTTP/1.1 con tipos generados; NestJS trae un
  transporte gRPC que envuelve grpc-js.
- **Cuándo NO usar gRPC:** APIs públicas para terceros o navegadores, equipos sin disciplina de contrato (el `.proto`
  compartido se vuelve un punto de fricción), o cuando el depurado con herramientas HTTP corrientes pesa más que la
  eficiencia.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Arranca el servidor gRPC:
   ```bash
   node f114-grpc/servidor.js
   ```
2. En otra terminal, ejecuta el cliente (una llamada unaria, un stream, un error de negocio y un deadline vencido):
   ```bash
   node f114-grpc/cliente.js
   ```
3. **Rompe el sistema a propósito:** detén el servidor (Ctrl+C) y repite el cliente:
   ```bash
   node f114-grpc/cliente.js 2>&1 | grep -E '^Error|code:|details:'
   ```

**Output esperado** (paso 1):

```text
inventario gRPC escuchando en 127.0.0.1:50114
```

**Output esperado** (paso 2, salida real; los milisegundos de la última línea varían un poco):

```text
unaria   → { sku: 'TEC-1', disponibles: 12, bodegaOrigen: 'BOG-1' }
stream   → 12
stream   → 11
stream   → 10
NO-HAY   → code=5 (NOT_FOUND) details="No existe el SKU NO-HAY"
LENTO    → code=4 (DEADLINE_EXCEEDED) details="Deadline exceeded after 0.301s,LB pick: 0.001s,remote_addr=127.0.0.1:50114"
```

El detalle de `DEADLINE_EXCEEDED` lo arma grpc-js con lo que midió en esa llamada: en la corrida del Mac salió
`details="Deadline exceeded after 0.300s,remote_addr=127.0.0.1:50114"`, sin el tramo `LB pick`. Lo que no cambia es
el código, `4 (DEADLINE_EXCEEDED)`.

**Output esperado** (paso 3, salida real con @grpc/grpc-js 1.14.7):

```text
Error: 14 UNAVAILABLE: No connection established. Last error: Error: connect ECONNREFUSED 127.0.0.1:50114. Resolution note: 
  code: 14,
  details: 'No connection established. Last error: Error: connect ECONNREFUSED 127.0.0.1:50114. Resolution note: ',
```

**Captura comentada:** `bodegaOrigen` llegó en camelCase aunque el `.proto` dice `bodega_origen` (`keepCase: false`).
Los tres `stream →` llegan separados por 100 ms: es **una** llamada que sigue abierta. El detalle del deadline dice
cuánto esperó el cliente (`0.301s`) y a quién (`remote_addr`): el cliente dejó de esperar a los 300 ms aunque el
servidor siguió «trabajando» hasta los 1500 ms. Y los errores no son códigos HTTP: `5`, `4` y `14` son códigos gRPC.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f114-grpc/inventario.test.js
```

Salida real:

```text
✔ llamada unaria: los campos snake_case del .proto llegan en camelCase (20.804263ms)
✔ un valor por defecto (0) llega aunque no viaje por el cable (2.012105ms)
✔ error de negocio → código NOT_FOUND (2.97079ms)
✔ deadline: el cliente deja de esperar y recibe DEADLINE_EXCEEDED (202.60455ms)
✔ streaming de servidor: llegan 3 mensajes en orden (309.705959ms)
✔ servidor apagado → UNAVAILABLE (5.085598ms)
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

`f114-grpc/inventario.test.js` (arranca el servidor en un puerto libre y lo llama con el cliente real):

```javascript
// Módulo 18 · F114 · Ejecuta: node --test f114-grpc/inventario.test.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { crearCliente } from './cliente.js';
import { grpc } from './contrato.js';
import { iniciarServidor } from './servidor.js';

let servidor;
let cliente;
before(async () => {
  servidor = await iniciarServidor(0);
  cliente = crearCliente(`127.0.0.1:${servidor.puerto}`);
});
after(async () => { cliente.cerrar(); await servidor.detener(); });

test('llamada unaria: los campos snake_case del .proto llegan en camelCase', async () => {
  assert.deepEqual(await cliente.consultar('TEC-1'), { sku: 'TEC-1', disponibles: 12, bodegaOrigen: 'BOG-1' });
});

test('un valor por defecto (0) llega aunque no viaje por el cable', async () => {
  assert.equal((await cliente.consultar('MOU-2')).disponibles, 0);
});

test('error de negocio → código NOT_FOUND', async () => {
  await assert.rejects(cliente.consultar('NO-HAY'), { code: grpc.status.NOT_FOUND, details: 'No existe el SKU NO-HAY' });
});

test('deadline: el cliente deja de esperar y recibe DEADLINE_EXCEEDED', async () => {
  const inicio = performance.now();
  await assert.rejects(cliente.consultar('LENTO', { plazoMs: 200 }), { code: grpc.status.DEADLINE_EXCEEDED });
  assert.ok(performance.now() - inicio < 1000);
});

test('streaming de servidor: llegan 3 mensajes en orden', async () => {
  const recibidos = [];
  for await (const e of cliente.seguir('TEC-1')) recibidos.push(e.disponibles);
  assert.deepEqual(recibidos, [12, 11, 10]);
});

test('servidor apagado → UNAVAILABLE', async () => {
  const sinServidor = crearCliente('127.0.0.1:1');
  await assert.rejects(sinServidor.consultar('TEC-1', { plazoMs: 2000 }), { code: grpc.status.UNAVAILABLE });
  sinServidor.cerrar();
});
```

**Pregunta de comprobación:** un compañero cambia en el `.proto` `int32 disponibles = 2;` por `int32 disponibles =
4;` «para ordenar los campos» y solo redespliega el servidor. ¿Qué ve un cliente antiguo? (Respuesta: `disponibles:
0`, sin ningún error. El cliente busca el campo número 2, que ya no llega, y aplica el valor por defecto; el campo 4
lo ignora por desconocido. Por eso los números de campo no se cambian nunca.)

#### 12. ERROR COMÚN

**Síntoma:** llamadas que se quedan colgadas mucho tiempo y terminan con `14 UNAVAILABLE`, o que no terminan nunca.
Dos causas que suelen ir juntas: la dirección del servidor está mal (o el servidor no está) y la llamada **no lleva
deadline**, así que el cliente sigue intentando conectar en segundo plano sin avisar.

```javascript
// ❌ sin deadline: si inventario no responde, esta promesa puede no resolverse nunca
stub.ConsultarExistencias({ sku }, (error, respuesta) => { /* … */ });
```

**Cómo se ve** (`node f114-grpc/cliente.js` con el servidor apagado, salida real, recortada):

```text
Error: 14 UNAVAILABLE: No connection established. Last error: Error: connect ECONNREFUSED 127.0.0.1:50114. Resolution note: 
    at callErrorFromStatus (…/node_modules/@grpc/grpc-js/build/src/call.js:32:19)
    …
for call at
    at ServiceClientImpl.makeUnaryRequest (…/node_modules/@grpc/grpc-js/build/src/client.js:161:32)
    …
    at Object.consultar (file:///…/f114-grpc/cliente.js:10:14) {
  code: 14,
  details: 'No connection established. Last error: Error: connect ECONNREFUSED 127.0.0.1:50114. Resolution note: ',
  metadata: Metadata { internalRepr: Map(0) {}, options: {} }
}
```

**Diagnóstico visual:** lee el mensaje de izquierda a derecha: `14 UNAVAILABLE` (no hubo conversación), `Last error:`
con el fallo de red real y **la dirección exacta** a la que intentó conectar. La sección `for call at` señala la
línea de **tu** código que hizo la llamada. Si la dirección es correcta, comprueba desde esa misma máquina que el
puerto responde (`nc -vz 127.0.0.1 50114`) y que no estás mezclando un cliente sin TLS con un servidor con TLS.
**Arreglo:** deadline en **todas** las llamadas (aquí el cliente lo pone por defecto en 1 s) y trata `UNAVAILABLE`
como un fallo reintentable y `DEADLINE_EXCEEDED` como «no sé si se ejecutó».

#### 13. PREGUNTA DE ENTREVISTA

«¿Cuándo elegirías gRPC en lugar de REST entre microservicios y qué problemas trae?»

**Respuesta modelo:** elijo gRPC para comunicación interna con mucho tráfico, baja latencia o streaming, y cuando
quiero un contrato estricto: el `.proto` define servicios y mensajes tipados, de él se generan cliente y servidor en
cualquier lenguaje, y Protocol Buffers sobre HTTP/2 es más compacto y multiplexa llamadas en una conexión. Además
trae deadlines y cancelación que se propagan por la cadena. Los costos: no es legible ni depurable con herramientas
HTTP corrientes, los navegadores necesitan gRPC-Web o un gateway, el balanceo requiere capa 7 o balanceo en el
cliente porque las conexiones son de larga vida, y la evolución del contrato exige disciplina (no cambiar números de
campo, solo añadir). Para APIs públicas o equipos externos prefiero REST con OpenAPI; para trabajo que no necesita
respuesta inmediata, mensajería.

#### 14. ANTI-PATRÓN RELACIONADO

**Tratar el `.proto` como un JSON flexible: reutilizar números, un mensaje «comodín» y cero deadlines:**

```protobuf
// ❌ el mismo mensaje para todo, con un campo de texto que lleva JSON dentro
message Peticion { string accion = 1; string datos_json = 2; }
message Respuesta { string resultado_json = 1; }
service Inventario { rpc Ejecutar (Peticion) returns (Respuesta); }

// ❌ y, meses después, un campo eliminado cuyo número se reutiliza con otro tipo
message Existencias {
  string sku = 1;
  string bodega_origen = 2;   // antes: int32 disponibles = 2;
}
```

Se ve así: el contrato ya no dice nada (todo es «un texto»), así que los errores de formato aparecen en producción
y no al compilar; un cliente antiguo interpreta los bytes de `bodega_origen` como un número y muestra existencias
absurdas o falla al decodificar; y un servidor lento deja a todos sus clientes esperando sin límite.

---

### GraphQL con Apollo Server

#### 1. UBICACIÓN

Módulo 18, Lección 3 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- Clientes REST y gRPC entre servicios (fichas 1 y 2): los resolvers de GraphQL los usan por debajo.
- Promesas y `Promise.all` (Módulo 13); DTOs y validación de entrada (Módulo 14).

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** con Apollo Server una API GraphQL que componga datos de dos servicios (pedidos y clientes) con esquema,
resolvers y errores tipados, y **eliminar** el problema N+1 con DataLoader midiendo las llamadas antes y después; lo
compruebas cuando `node --test f115-graphql/esquema.test.js` pasa 7 de 7 y `n-mas-1.js` muestra 3 llamadas frente a 1.

#### 4. ANALOGÍA VISUAL

Dibuja **dos restaurantes**. En el de la izquierda (REST) solo hay **menús fijos**: el «menú pedido» trae siempre los
mismos doce platos aunque solo quieras la sopa, y si además quieres el postre del «menú cliente» tienes que hacer
**otra fila** en otra ventanilla. En el de la derecha (GraphQL) hay **un solo mostrador** y una **carta con todos los
ingredientes y cómo se relacionan** (el esquema). Tú entregas **una comanda escrita por ti** que dice exactamente:
«del pedido P-1 quiero el total, y de su cliente solo el nombre». Detrás del mostrador hay un **jefe de cocina**
(el servidor GraphQL) que no cocina: reparte la comanda entre **estaciones** (los resolvers), cada una especialista
en un ingrediente y conectada por una ventanilla a su propia **bodega** (un microservicio). Te devuelven **una sola
bandeja** con la forma exacta de tu comanda. Añade al dibujo un detalle: un **ayudante con una bandeja grande**
(DataLoader) que, en vez de ir a la bodega de clientes una vez por cada pedido de la lista, **espera un instante,
junta todos los encargos y hace un solo viaje**.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** el cliente envía por POST una consulta que pide los pedidos con su id y el nombre de su
cliente. Apollo Server la valida contra el esquema: si es inválida responde 400 con una lista errors y el código
GRAPHQL_VALIDATION_FAILED; si es válida ejecuta el resolver Query.pedidos, que hace una llamada al servicio de
pedidos, y después el resolver Pedido.cliente una vez por cada uno de los tres pedidos. Esos tres resolvers piden sus
clientes a un DataLoader creado para esa petición, que junta los identificadores, elimina el repetido y hace una sola
llamada buscarVarios al servicio de clientes. La respuesta es un 200 con data en la misma forma que la consulta.

#### 6. EXPLICACIÓN NIVEL 0

- Con REST, el servidor decide qué datos trae cada dirección. Si la pantalla de tu aplicación necesita un pedido y el
  nombre de su cliente, hace dos llamadas y recibe muchos datos que no usa.
- **GraphQL** le da la vuelta: el **cliente escribe una consulta** que describe exactamente lo que quiere, y el
  servidor responde con esa forma exacta, en un solo viaje.
- Lo que se puede pedir está descrito en un **esquema**: una lista de tipos (`Pedido`, `Cliente`) con sus campos.
- Para cada campo hay una pequeña función, el **resolver**, que sabe de dónde sacar ese dato (de un microservicio, de
  una base de datos).
- **Apollo Server** es una librería de Node para montar ese servidor.
- En microservicios se usa sobre todo en el **borde**: una capa que ofrece una sola API a las aplicaciones y por
  detrás habla con muchos servicios.

#### 7. EXPLICACIÓN INTERMEDIA

- **Esquema (SDL):** `type`, campos con tipo, `!` para «no nulo», `[Pedido!]!` para listas. Tres tipos raíz: `Query`
  (lecturas), `Mutation` (escrituras) y `Subscription` (tiempo real).
- **Resolvers:** `(padre, argumentos, contexto, info)`. Los de `Query` arrancan; los de **campo** (`Pedido.cliente`)
  reciben como `padre` el objeto ya resuelto y solo se ejecutan **si la consulta pide ese campo**.
- **Contexto:** objeto creado **por petición** (función `context`), donde van los clientes de otros servicios, el
  usuario autenticado y los DataLoader.
- **Transporte:** una sola URL, normalmente `POST` con `{ query, variables }`. La respuesta es `{ data, errors }`.
  Una consulta que no cumple el esquema se rechaza con **400** antes de ejecutar nada; un error **dentro** de un
  resolver devuelve **200** con `errors` y, si el campo era no nulo, `data: null` hacia arriba.
- **Errores tipados:** `new GraphQLError(mensaje, { extensions: { code } })`. El cliente decide por
  `extensions.code`, no por el texto.
- **Problema N+1:** una lista de N pedidos dispara N llamadas al resolver `cliente`. **DataLoader** agrupa todos los
  `load(id)` de un mismo *tick* en una llamada por lote (`buscarVarios(ids)`), elimina repetidos y guarda caché
  durante la petición.
- **Apollo Server 5:** `new ApolloServer({ typeDefs, resolvers })`, `startStandaloneServer(server, { listen,
  context })` para arrancar sobre HTTP y `server.executeOperation()` para probar sin red. Añade la pila de cada error
  a la respuesta salvo con `NODE_ENV=production`; aquí se apaga con `includeStacktraceInErrorResponses: false`.
- **Variables:** los valores van en `variables`, no pegados al texto de la consulta (igual que las consultas
  parametrizadas en SQL).

#### 8. EXPLICACIÓN MAESTRA

- **Dónde encaja.** GraphQL brilla como **API de borde / BFF**: muchas pantallas distintas, clientes móviles con mala
  red, un grafo de datos repartido en varios servicios. **Entre microservicios internos** casi nunca compensa: ahí el
  consumidor es conocido y un contrato fijo (gRPC, REST) es más simple y más eficiente.
- **Alternativas y trade-offs.**
  1. **REST + BFF a medida**: un endpoint por pantalla; simple y cacheable por HTTP, pero cada pantalla nueva es
     trabajo de backend.
  2. **GraphQL monolítico en el borde** (esta ficha): un servidor compone todos los servicios; fácil de empezar, y un
     equipo acaba siendo dueño de un esquema que conoce todos los dominios.
  3. **GraphQL federado** (Apollo Federation, GraphQL Mesh): cada servicio publica su parte del grafo y un *router*
     las une; escala con los equipos y añade infraestructura y gobierno de esquema.
  4. **tRPC / RPC tipado**: tipos de extremo a extremo sin esquema aparte; solo si cliente y servidor son TypeScript.
- **Lo que GraphQL te quita:** la caché HTTP por URL (todo es `POST /`; hay que recurrir a *persisted queries* o caché
  en el cliente), los códigos de estado como señal (un 200 puede traer errores: tus alertas deben mirar `errors`) y
  el control del costo: el cliente puede pedir consultas muy profundas o listas dentro de listas. En producción:
  límite de profundidad y de complejidad, paginación obligatoria, timeouts por resolver y, para APIs públicas,
  lista cerrada de consultas permitidas.
- **Autorización por campo**, no por endpoint: cada resolver sensible comprueba permisos (o una directiva lo hace).
- **Introspección:** útil en desarrollo (el cliente descubre el esquema); en una API pública se suele desactivar para
  no regalar el mapa completo.
- **Apollo Server vs alternativas en Node:** GraphQL Yoga (ligero, estándares web), Mercurius (sobre Fastify),
  `@nestjs/graphql` (envuelve Apollo o Mercurius con decoradores). La especificación de ejecución la implementa en
  todos el paquete `graphql`.
- **Cuándo NO usar GraphQL:** un solo cliente con necesidades estables, APIs de máquina a máquina, subida y descarga
  de archivos, o equipos que no pueden asumir el trabajo de proteger y observar el grafo.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Arranca el servidor GraphQL:
   ```bash
   node f115-graphql/main.js
   ```
2. En otra terminal, envía una consulta con campos anidados, una inválida y una mutación que rompe una regla:
   ```bash
   Q() { curl -s -w ' [%{http_code}]\n' localhost:4115/ -H 'content-type: application/json' -d "$1"; }
   Q '{"query":"{ pedido(id: \"P-1\") { id total cliente { nombre } } }"}'
   Q '{"query":"{ pedido(id: \"P-1\") { nombre } }"}'
   Q '{"query":"mutation { crearPedido(clienteId: \"C-1\", total: 0) { id } }"}'
   ```
3. Mide el problema N+1 con y sin DataLoader:
   ```bash
   node f115-graphql/n-mas-1.js
   ```
4. Abre `http://127.0.0.1:4115/` en el navegador: Apollo muestra una página que enlaza a Apollo Sandbox, un editor
   para explorar el esquema y lanzar consultas (necesita conexión a internet).

**Output esperado** (paso 1):

```text
GraphQL listo en http://127.0.0.1:4115/
```

**Output esperado** (paso 2, salida real; `curl` pone el código HTTP en una línea aparte porque la respuesta termina
en salto de línea):

```text
{"data":{"pedido":{"id":"P-1","total":240000,"cliente":{"nombre":"Ana"}}}}
 [200]
{"errors":[{"message":"Cannot query field \"nombre\" on type \"Pedido\".","locations":[{"line":1,"column":23}],"extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}}]}
 [400]
{"errors":[{"message":"El total debe ser mayor que cero","locations":[{"line":1,"column":12}],"path":["crearPedido"],"extensions":{"code":"BAD_USER_INPUT","campo":"total"}}],"data":null}
 [200]
```

**Output esperado** (paso 3, salida real):

```text
ingenuo    → 3 pedidos · llamadas a pedidos: 1 · llamadas a clientes: 3
DataLoader → 3 pedidos · llamadas a pedidos: 1 · llamadas a clientes: 1
```

**Captura comentada:** la primera respuesta tiene **la misma forma** que la consulta y nada más (no viene `email`).
La segunda es un **400**: la consulta no pasó la validación y ningún resolver se ejecutó; `locations` dice la línea y
la columna del campo equivocado. La tercera es un **200 con `errors`**: el error ocurrió dentro de un resolver;
`path` dice en qué campo y `extensions.code` es lo que debe mirar el cliente. En el paso 3, con 3 pedidos la versión
ingenua hace 3 llamadas a clientes; con 300 pedidos haría 300, y DataLoader seguiría haciendo 1.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f115-graphql/esquema.test.js
```

Salida real:

```text
✔ el cliente pide solo los campos que necesita (45.240953ms)
✔ una sola consulta trae el pedido Y su cliente (dos servicios, un viaje) (10.6146ms)
✔ si no pides «cliente», su resolver no se ejecuta (4.300926ms)
✔ N+1: resolvers ingenuos llaman a clientes una vez por pedido; DataLoader, una sola (8.456405ms)
✔ una consulta que no cumple el esquema se rechaza ANTES de ejecutar nada (4.910941ms)
✔ un error de negocio viaja en «errors» con su código en extensions (4.37876ms)
✔ mutación válida (4.207219ms)
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

`f115-graphql/esquema.test.js`:

```javascript
// Módulo 18 · F115 · Ejecuta: node --test f115-graphql/esquema.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearServicios } from './datos.js';
import { crearContexto, crearServidor } from './esquema.js';

// executeOperation ejecuta la operación sin abrir un puerto: ideal para tests.
async function ejecutar(query, { variables, ingenuo = false } = {}) {
  const servicios = crearServicios();
  const servidor = crearServidor({ ingenuo });
  const { body } = await servidor.executeOperation({ query, variables }, { contextValue: crearContexto(servicios) });
  await servidor.stop();
  // El resultado usa objetos sin prototipo; pasarlo por JSON deja objetos normales, como los vería un cliente HTTP.
  return { ...JSON.parse(JSON.stringify(body.singleResult)), llamadas: servicios.llamadas };
}

test('el cliente pide solo los campos que necesita', async () => {
  const { data, errors } = await ejecutar('{ pedido(id: "P-1") { total } }');
  assert.equal(errors, undefined);
  assert.deepEqual(data, { pedido: { total: 240000 } });
});

test('una sola consulta trae el pedido Y su cliente (dos servicios, un viaje)', async () => {
  const { data, llamadas } = await ejecutar('query($id: ID!) { pedido(id: $id) { id cliente { nombre email } } }', { variables: { id: 'P-2' } });
  assert.deepEqual(data, { pedido: { id: 'P-2', cliente: { nombre: 'Luis', email: 'luis@correo.co' } } });
  assert.deepEqual(llamadas, { pedidos: 1, clientes: 1 });
});

test('si no pides «cliente», su resolver no se ejecuta', async () => {
  const { llamadas } = await ejecutar('{ pedidos { id total } }');
  assert.equal(llamadas.clientes, 0);
});

test('N+1: resolvers ingenuos llaman a clientes una vez por pedido; DataLoader, una sola', async () => {
  const query = '{ pedidos { id cliente { nombre } } }';
  assert.equal((await ejecutar(query, { ingenuo: true })).llamadas.clientes, 3);
  assert.equal((await ejecutar(query)).llamadas.clientes, 1);
});

test('una consulta que no cumple el esquema se rechaza ANTES de ejecutar nada', async () => {
  const { data, errors, llamadas } = await ejecutar('{ pedido(id: "P-1") { nombre } }');
  assert.equal(data, undefined);
  assert.equal(errors[0].message, 'Cannot query field "nombre" on type "Pedido".');
  assert.equal(errors[0].extensions.code, 'GRAPHQL_VALIDATION_FAILED');
  assert.deepEqual(llamadas, { pedidos: 0, clientes: 0 });
});

test('un error de negocio viaja en «errors» con su código en extensions', async () => {
  const { data, errors } = await ejecutar('mutation { crearPedido(clienteId: "C-1", total: 0) { id } }');
  assert.equal(data, null);
  assert.equal(errors[0].message, 'El total debe ser mayor que cero');
  assert.deepEqual(errors[0].extensions, { code: 'BAD_USER_INPUT', campo: 'total' });
});

test('mutación válida', async () => {
  const { data } = await ejecutar('mutation { crearPedido(clienteId: "C-2", total: 1000) { id cliente { nombre } } }');
  assert.deepEqual(data, { crearPedido: { id: 'P-4', cliente: { nombre: 'Luis' } } });
});
```

**Pregunta de comprobación:** en la lista hay 3 pedidos, pero dos son del mismo cliente (C-1). ¿Cuántos
identificadores recibe `buscarVarios` en la versión con DataLoader y por qué importa crear el DataLoader en cada
petición? (Respuesta: dos, `['C-1', 'C-2']`: DataLoader elimina repetidos y guarda en caché cada clave. Esa caché no
caduca: si el DataLoader se creara una sola vez al arrancar, un usuario vería datos cargados para otro y los cambios
en clientes no se reflejarían nunca.)

#### 12. ERROR COMÚN

**Síntoma:** el front-end muestra pantallas a medias sin ningún aviso, y tu panel de monitoreo dice «0 % de errores
HTTP». Causa: el cliente (y las alertas) asumen que **200 significa éxito**. En GraphQL, un error dentro de un
resolver llega con **HTTP 200** y el detalle en `errors`.

```javascript
// ❌ cliente que solo mira el código HTTP
const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ query }) });
if (!res.ok) throw new Error('falló');           // no se cumple: es un 200
const { data } = await res.json();
mostrar(data.crearPedido.id);                     // TypeError: data es null
```

**Cómo se ve** la respuesta (salida real del laboratorio, paso 2):

```text
{"errors":[{"message":"El total debe ser mayor que cero","locations":[{"line":1,"column":12}],"path":["crearPedido"],"extensions":{"code":"BAD_USER_INPUT","campo":"total"}}],"data":null}
 [200]
```

Y si el cliente envía una consulta que el esquema no admite (un campo renombrado en el servidor, por ejemplo), el
mensaje real es:

```text
Cannot query field "nombre" on type "Pedido".
```

**Diagnóstico visual:** en la pestaña de red del navegador la petición sale en verde (200); abre el cuerpo y busca la
clave `errors`. `path` te dice qué campo falló y `extensions.code` de qué tipo es. **Arreglo:** el cliente comprueba
siempre `errors` además de `res.ok` (las librerías cliente de GraphQL lo hacen); el servidor registra y cuenta como
métrica cada error de resolver por `extensions.code`; y los cambios de esquema que rompen consultas existentes se
detectan antes de desplegar comparando el esquema nuevo con las consultas en uso.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué es el problema N+1 en GraphQL y cómo lo resuelves? ¿Usarías GraphQL entre microservicios?»

**Respuesta modelo:** GraphQL ejecuta un resolver por campo. Si pido una lista de N pedidos y, para cada uno, su
cliente, el resolver `cliente` se ejecuta N veces y hace N llamadas al servicio de clientes, más la llamada inicial:
N+1. Se resuelve con DataLoader: en cada petición creo un cargador por tipo de dato; los resolvers llaman a
`load(id)`, y el cargador junta todas las claves pedidas en el mismo *tick*, elimina repetidas y hace una sola
llamada por lote a un endpoint que acepte varios identificadores. Tiene que crearse por petición, porque guarda caché.
Sobre lo segundo: GraphQL lo pongo en el borde, como API para aplicaciones con necesidades de datos variadas, donde
el cliente elige campos y ahorra viajes. Entre servicios internos prefiero contratos fijos (gRPC o REST) o eventos:
el consumidor es conocido, no necesito flexibilidad de consulta y evito el costo de proteger el grafo (límites de
profundidad y complejidad, autorización por campo, caché más difícil).

#### 14. ANTI-PATRÓN RELACIONADO

**El esquema como espejo de las tablas, sin límites ni paginación:**

```graphql
# ❌ todo se relaciona con todo, las listas no tienen límite y los campos son las columnas de la base de datos
type Cliente { id: ID!  password_hash: String!  pedidos: [Pedido!]! }
type Pedido  { id: ID!  cliente_id: ID!  cliente: Cliente!  lineas: [Linea!]! }
type Query   { clientes: [Cliente!]! }
```

```graphql
# …y cualquiera puede enviar esto
{ clientes { pedidos { cliente { pedidos { cliente { pedidos { lineas { id } } } } } } } }
```

Se ve así: una sola petición de un cliente curioso (o malicioso) genera miles de llamadas a los servicios de detrás y
tumba el borde; el esquema expone `password_hash` porque «estaba en la tabla»; y cualquier cambio en la base de datos
rompe a los clientes. El esquema es un **contrato pensado para quien consume**, con paginación, límites de profundidad
y solo los campos que deben verse.

---

### KafkaJS, amqplib

#### 1. UBICACIÓN

Módulo 18, Lección 4 de 6 · Fase 2
RabbitMQ en `docker-compose.yml`).

#### 2. PRERREQUISITOS

- Comunicación síncrona y sus fallos (fichas 1 a 3): timeout, servicio apagado.
- `Buffer`, JSON y `async/await` (Módulo 13); Docker Compose (Módulo 0.5).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** en Node un productor y un consumidor de eventos con KafkaJS (clave de partición, grupo de
consumidores) y un publicador y un consumidor con amqplib (exchange *topic*, confirmaciones del broker, *ack* manual),
y **hacer idempotente** al consumidor; lo compruebas cuando `node --test f116-kafka-rabbit/evento.test.js` pasa 4 de
4 y, con los brokers arriba, `kafka.infra.js` (2 tests) y `rabbit.infra.js` (3 tests) pasan.

#### 4. ANALOGÍA VISUAL

Dibuja, lado a lado, **dos formas de repartir avisos en una empresa**. A la izquierda, **RabbitMQ: una oficina de
correos interna**. Quien envía entrega la carta en la **ventanilla de clasificación** (el *exchange*) con una
etiqueta («pedido.creado»). El clasificador mira la etiqueta y unas **reglas pegadas en la pared** (los *bindings*) y
mete una copia en cada **casillero** que corresponda (las colas): el de Facturación, el de Bodega. Cada equipo saca
cartas de **su** casillero; cuando termina de tramitar una, **firma el recibo** (*ack*) y la carta se destruye. Si
no firma, la carta vuelve al casillero. A la derecha, **Kafka: un libro de actas en un atril**, o mejor, **tres
libros** (tres particiones). Quien escribe **añade una línea al final** de uno de los libros; cuál, lo decide el
número de pedido (la clave), de modo que todo lo del pedido P-1 queda en el mismo libro y en orden. **Nadie arranca
páginas**: cada equipo lector (grupo de consumidores) tiene su propio **marcapáginas** (*offset*) y avanza a su
ritmo; un equipo nuevo puede empezar a leer desde la primera página, semanas después. En los dos dibujos, añade un
**sello con número de serie** en cada aviso: sirve para reconocer el que llega repetido.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** dos subdiagramas. En RabbitMQ, el publicador con amqplib publica en el exchange
pedidos.eventos, de tipo topic, con la routing key pedido.creado y espera la confirmación del broker; el exchange
entrega una copia a la cola facturacion.pedidos-creados porque existe un binding con ese patrón, y descarta
pedido.pagado porque ninguna cola lo pidió; la cola entrega al consumidor, que responde con ack o con nack para
reencolar. En Kafka, el productor con KafkaJS envía al topic pedidos.eventos con la clave pedidoId; los tres eventos
de P-1 quedan en orden en la partición 0 y el de P-3 en la partición 2; el grupo de consumidores facturacion y el
grupo analitica leen las mismas particiones, cada uno con su propio offset.

#### 6. EXPLICACIÓN NIVEL 0

- En las fichas anteriores un servicio **preguntaba y esperaba**. Aquí un servicio **deja un mensaje** («se creó el
  pedido P-1») y sigue con lo suyo; otros servicios lo leerán cuando puedan. Eso es comunicación **asíncrona**.
- Entre el que envía y los que reciben hay un programa intermediario, el **broker**, que guarda los mensajes. Si el
  receptor está apagado, el mensaje lo espera.
- **RabbitMQ** es un broker de **colas**: reparte cada mensaje a quien debe tramitarlo y lo borra cuando está hecho.
- **Kafka** es un **registro (log) de eventos**: los guarda en orden y no los borra al leerlos; muchos lectores pueden
  leer lo mismo, cada uno a su ritmo.
- Para hablar con ellos desde Node se usan librerías cliente: **amqplib** (RabbitMQ) y **KafkaJS** (Kafka).
- Un **evento** es un hecho que ya ocurrió, en pasado: `pedido.creado`. Quien lo publica no sabe ni le importa quién
  lo lee.

#### 7. EXPLICACIÓN INTERMEDIA

- **El sobre del evento** (`evento.js`): `id` único, `tipo`, `ocurridoEn` y `datos`. Se serializa a JSON en un
  `Buffer` (los brokers transportan bytes).
- **RabbitMQ con amqplib.** Conexión → **canal**. Se publica a un **exchange** con una *routing key*; el exchange
  (aquí de tipo `topic`) copia el mensaje a las colas cuyo *binding* coincida (`pedido.creado`, `pedido.*`, `#`).
  `durable: true` (la cola sobrevive al reinicio del broker) + `persistent: true` (el mensaje va a disco).
  - **Publisher confirms:** `createConfirmChannel()` y `waitForConfirms()`: sabes que el broker aceptó el mensaje.
  - **Consumo:** `consume(cola, fn, { noAck: false })`, `prefetch(n)` limita los mensajes en vuelo, `ack(msg)` lo
    da por hecho y `nack(msg, false, requeue)` lo devuelve o lo descarta. `msg.fields.redelivered` indica reentrega.
- **Kafka con KafkaJS.** Un **topic** se divide en **particiones**; cada mensaje tiene un **offset** dentro de la
  suya. La **clave** decide la partición (hash): misma clave → misma partición → orden garantizado para esa clave.
  - **Productor:** `producer.send({ topic, acks: -1, messages: [{ key, value }] })`; con `idempotent: true` el broker
    descarta los duplicados de los reintentos del propio productor.
  - **Consumidor:** `kafka.consumer({ groupId })`, `subscribe`, `run({ eachMessage })`. Las instancias del mismo
    grupo **se reparten** las particiones; grupos distintos reciben **todo** cada uno. El offset se confirma después
    de que `eachMessage` termina sin error.
- **Entrega «al menos una vez»:** en los dos brokers, tras un fallo el mensaje puede llegar **repetido**. El
  consumidor debe ser **idempotente**: `soloUnaVez()` recuerda los `id` procesados (en producción, en Redis o en la
  base de datos, Módulo 22).
- **Diferencia clave:** en RabbitMQ un mensaje confirmado **desaparece**; en Kafka **permanece** (según la retención
  del topic) y un grupo nuevo puede releerlo desde el principio.
- **Brokers del laboratorio:** Kafka 4.4.0 en modo KRaft (sin ZooKeeper) en `localhost:9092` y RabbitMQ 4.4.1 en
  `localhost:5672` (consola en `http://localhost:15672`, usuario y clave `academia`).

#### 8. EXPLICACIÓN MAESTRA

- **KafkaJS está sin mantenimiento: úsalo sabiendo lo que eliges.** La última versión publicada en npm es la 2.2.4,
  del **2023-02-27** (`https://registry.npmjs.org/kafkajs`, campo `time`; `https://github.com/tulios/kafkajs/releases`);
  desde entonces no hay correcciones de errores ni de seguridad, ni soporte de lo que Kafka ha añadido después. Kafka
  4.0 retiró las versiones antiguas del protocolo (KIP-896) y estrenó un protocolo nuevo de grupos de consumidores
  (KIP-848) que KafkaJS no implementa. El curso lo enseña porque el temario lo pide y porque lo encontrarás en muchos
  proyectos existentes. En la corrida real del laboratorio (macOS, Node.js 26.13.1, Kafka 4.4.0 en modo KRaft)
  KafkaJS 2.2.4 **sí funcionó**: `admin.createTopics`, el productor idempotente y los consumidores con el protocolo
  clásico de grupos pasaron los tests y la demo. Pero ya no está limpio: con Node 26 imprime un aviso
  `TimeoutNegativeWarning` que nadie va a corregir en una versión publicada (sección 12). Para un servicio nuevo
  evalúa primero las alternativas:
  1. **`@confluentinc/kafka-javascript`** (1.11.0, publicada el 2026-10-07): el cliente oficial de Confluent, con
     soporte comercial. Envuelve **librdkafka** (C), así que trae un binario nativo por plataforma, y ofrece una API
     **compatible con KafkaJS** (`require('@confluentinc/kafka-javascript').KafkaJS`) pensada para migrar: el código
     de `kafka.js` de esta ficha cambia sobre todo en la importación y en algunos nombres de configuración.
  2. **`@platformatic/kafka`**: cliente moderno en JavaScript puro (sin binarios nativos), con otra API.
  3. **`node-rdkafka`**: el envoltorio histórico de librdkafka, de API más baja.
  Trade-off: JavaScript puro (instalación trivial, depuración sencilla) frente a librdkafka (rendimiento, funciones al
  día, dependencia nativa que complica imágenes Alpine o ARM).
- **Kafka vs RabbitMQ.** RabbitMQ: enrutamiento flexible (exchanges), colas de trabajo, *ack* por mensaje, prioridades,
  TTL y *dead-lettering* nativos; el broker es «listo» y el consumidor simple. Kafka: log particionado y replicado,
  retención y relectura, orden por clave, mucho rendimiento; el broker es «simple» y la complejidad (offsets,
  rebalanceos, particiones) recae en el cliente. Regla práctica: **tareas** que alguien debe ejecutar una vez →
  cola (RabbitMQ); **hechos** que varios sistemas consumen y que quieres poder reprocesar → log (Kafka).
- **amqplib** está mantenida (2.4.0, 2026-11-16) e implementa AMQP 0-9-1. Históricamente no reconectaba sola; la
  línea actual añade recuperación opcional (`connect(url, { recovery })`), y la alternativa clásica es
  `amqp-connection-manager`. RabbitMQ 4 también habla AMQP 1.0 (cliente `rhea`) y ofrece *streams*, un log al estilo
  de Kafka.
- **Garantías reales.** «Exactamente una vez» de extremo a extremo no te la da ningún cliente: se construye con
  entrega al menos una vez + consumidor idempotente (o transacciones de Kafka dentro de Kafka, Módulo 25). El productor
  idempotente evita duplicados **del productor**, no los del consumidor.
- **Orden y paralelismo se pelean.** En Kafka el orden es por partición: más particiones dan más paralelismo y menos
  orden global. En RabbitMQ, varios consumidores en una cola o un `nack` con *requeue* rompen el orden.
- **Publicar y guardar en la base de datos no es atómico:** si guardas el pedido y el `publish` falla, el evento se
  pierde. La solución (patrón Outbox) está en el Módulo 25.
- **Cuándo NO usar un broker:** cuando necesitas la respuesta para contestar al usuario (ficha 6), cuando el sistema
  cabe en un monolito modular con eventos en memoria, o cuando el equipo no puede operar el broker ni pagar uno
  gestionado. Y no despliegues Kafka para 50 mensajes al día: una cola en RabbitMQ o en la propia base de datos basta.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

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

#### 11. VERIFICACIÓN

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

#### 12. ERROR COMÚN

**Síntoma (RabbitMQ):** el servicio arranca en tu máquina, pero en el entorno compartido muere al declarar la
topología con `406 PRECONDITION_FAILED`. Causa: el exchange o la cola **ya existe con otros atributos** (otro tipo,
`durable` distinto, otros argumentos); otro equipo, o una versión anterior de tu servicio, lo declaró diferente.
`f116-kafka-rabbit/error-comun.js`:

```javascript
// Módulo 18 · F116 · ERROR COMÚN: declarar un exchange (o una cola) que ya existe con OTROS atributos.
// Ejecuta (con RabbitMQ arriba): node f116-kafka-rabbit/error-comun.js
import amqplib from 'amqplib';
import { URL_AMQP } from './rabbit.js';

const conexion = await amqplib.connect(URL_AMQP);
const canal = await conexion.createChannel();
canal.on('error', (error) => console.log('evento «error» del canal →', error.message));
await canal.assertExchange('demo.error-comun', 'direct', { durable: true }); // el equipo A lo declaró «direct»
try {
  await canal.assertExchange('demo.error-comun', 'topic', { durable: true }); // el equipo B lo quiere «topic»
} catch (error) {
  console.log('assertExchange rechazó   →', error.message);
}
// El broker CERRÓ el canal: cualquier operación posterior sobre él también falla.
await canal.checkExchange('demo.error-comun').catch((error) => console.log('el canal quedó inservible →', error.message));

const limpio = await conexion.createChannel(); // hace falta un canal nuevo
await limpio.deleteExchange('demo.error-comun');
await conexion.close();
```

**Cómo se ve** (`node f116-kafka-rabbit/error-comun.js`, salida real con amqplib 2.4.0 y RabbitMQ 4.4.1):

```text
evento «error» del canal → Channel closed by server: 406 (PRECONDITION-FAILED) with message "PRECONDITION_FAILED - inequivalent arg 'type' for exchange 'demo.error-comun' in vhost '/': received 'topic' but current is 'direct'"
assertExchange rechazó   → Operation failed: ExchangeDeclare; 406 (PRECONDITION-FAILED) with message "PRECONDITION_FAILED - inequivalent arg 'type' for exchange 'demo.error-comun' in vhost '/': received 'topic' but current is 'direct'"
el canal quedó inservible → Channel closed
```

**Diagnóstico visual:** el mensaje lo dice todo si lo lees despacio: `inequivalent arg 'type'` (qué atributo),
`for exchange 'demo.error-comun'` (de qué objeto), `received 'topic' but current is 'direct'` (lo que pediste y lo
que hay). Compáralo con la consola de RabbitMQ (Exchanges → columna *Type*). La tercera línea es la trampa: el broker
**cierra el canal entero**, y todo lo que hagas después por él falla con `Channel closed`. **Arreglo:** un solo dueño
por exchange y por cola (quien lo declara), nombres con prefijo del equipo o dominio (`pedidos.eventos`), y cambios
de atributos mediante un nombre nuevo o una migración explícita, no editando el `assert`.

**Síntoma (Kafka):** el cliente no conecta. **Cómo se ve** (`node f116-kafka-rabbit/kafka-productor.js` sin broker,
salida real con kafkajs 2.2.4, recortada):

```text
{"level":"ERROR","timestamp":"2026-11-20T04:01:37.549Z","logger":"kafkajs","message":"[Connection] Connection error: connect ECONNREFUSED 127.0.0.1:9092","broker":"localhost:9092","clientId":"pedidos","stack":"Error: connect ECONNREFUSED 127.0.0.1:9092\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:2083:16)"}
{"level":"ERROR","timestamp":"2026-11-20T04:01:37.551Z","logger":"kafkajs","message":"[BrokerPool] Failed to connect to seed broker, trying another broker from the list: Connection error: connect ECONNREFUSED 127.0.0.1:9092","retryCount":0,"retryTime":265}
…
KafkaJSNonRetriableError
  Caused by: KafkaJSConnectionError: Connection error: connect ECONNREFUSED 127.0.0.1:9092
  name: 'KafkaJSNumberOfRetriesExceeded',
  retryCount: 3,
```

Mira el campo `broker` de cada línea. Si es el que configuraste (`localhost:9092`), el broker no está arriba o no es
alcanzable. Si es **otro** nombre que tú no escribiste (un nombre interno de contenedor), el primer contacto funcionó
y el fallo viene de la dirección que el broker **anuncia** (`advertised.listeners`): el cliente recibe esa dirección
en los metadatos y la usa para todo lo demás.

**Síntoma (Kafka con Node 24 o posterior):** todo funciona, pero cada proceso que usa kafkajs empieza con un aviso
que asusta. **Cómo se ve** (salida real de `node f116-kafka-rabbit/kafka-productor.js` en macOS con Node.js 26.13.1 y
kafkajs 2.2.4):

```text
(node:77250) TimeoutNegativeWarning: -1795149271251 is a negative number.
Timeout duration was set to 1.
(Use `node --trace-warnings ...` to show where the warning was created)
```

**Diagnóstico:** el aviso es de Node, no de Kafka. Node avisa cuando alguien llama a `setTimeout` con un retraso
negativo y lo cambia por 1 ms. En kafkajs 2.2.4 la llamada está en `scheduleCheckPendingRequests()` de
`node_modules/kafkajs/src/network/requestQueue/index.js`: calcula `scheduleAt = this.throttledUntil - Date.now()`, y
`throttledUntil` vale `-1` mientras el broker no ha pedido frenar (`this.throttledUntil = -1` en el constructor). El
resultado es «menos la hora actual en milisegundos»: por eso el número es enorme y cambia en cada ejecución
(`-1795149271251` es −1 − `Date.now()` del 2026-11-20 a las 04:34:31 UTC). Con Node 22.23.5 el mismo `setTimeout` no
imprime nada; con Node 24 y 26 sí. Es el issue
[tulios/kafkajs#1751](https://github.com/tulios/kafkajs/issues/1751) («TimeoutNegativeWarning emitted when running on
Node 24.0.1», abierto desde 2025-05-16), con dos *pull requests* de arreglo (#1755 y #1768) sin fusionar: como
kafkajs no publica versiones desde 2023, no llegará una 2.2.5 que lo corrija. Es **inofensivo**: esperar 1 ms en lugar
de un número negativo es lo que el código quería. **Arreglo:** no lo tapes con `--no-warnings`, que esconde también los
avisos útiles. Si te molesta, silencia solo ese tipo con
`node --disable-warning=TimeoutNegativeWarning f116-kafka-rabbit/kafka-productor.js` (o en `NODE_OPTIONS`); y si el
servicio es nuevo, este aviso es otra razón para elegir un cliente mantenido (sección 8).

#### 13. PREGUNTA DE ENTREVISTA

«¿En qué se diferencian Kafka y RabbitMQ, y cómo garantizas que un mensaje no se procese dos veces?»

**Respuesta modelo:** RabbitMQ es un broker de colas: el productor publica en un exchange que enruta a colas según
bindings, cada mensaje se entrega a un consumidor de la cola y se borra cuando este confirma con ack; es ideal para
repartir tareas y para enrutamiento flexible. Kafka es un log distribuido: los mensajes se añaden a particiones de un
topic y permanecen según la retención; cada grupo de consumidores lleva su offset, así que varios sistemas leen lo
mismo y se puede reprocesar; el orden se garantiza por partición, que se elige con la clave. Sobre los duplicados: no
puedo garantizar que no **lleguen** dos veces, porque ambos entregan al menos una vez (un consumidor puede procesar y
caerse antes del ack o del commit). Lo que garantizo es que procesarlo dos veces **no cambie el resultado**:
consumidor idempotente, con un id único por evento y un registro de ids procesados guardado en la misma transacción
que el efecto, o con operaciones naturalmente idempotentes. Y confirmo (ack o commit) solo después de procesar.

#### 14. ANTI-PATRÓN RELACIONADO

**Confirmar antes de procesar y usar el broker como si fuera una llamada remota:**

```javascript
// ❌ RabbitMQ: ack automático. Si el proceso muere a mitad de «facturar», el mensaje ya no existe.
canal.consume('facturacion', async (m) => { await facturar(JSON.parse(m.content)); }, { noAck: true });

// ❌ Kafka: se traga el error para «no bloquear la partición»; el offset avanza y el evento se pierde en silencio.
eachMessage: async ({ message }) => { try { await facturar(JSON.parse(message.value)); } catch { /* nada */ } }

// ❌ Petición/respuesta síncrona montada sobre colas: publica y BLOQUEA al usuario esperando otra cola de respuesta.
await canal.sendToQueue('pagos.cobrar', cuerpo, { replyTo: 'respuestas', correlationId });
const respuesta = await esperarEn('respuestas', correlationId, 30_000);
```

Se ve así: facturas que faltan sin ningún error en el log (el mensaje se confirmó antes de procesarse o el error se
ignoró), y pantallas que tardan 30 segundos cuando pagos va lento, con toda la complejidad de un broker y ninguna de
sus ventajas: sigue habiendo acoplamiento temporal, solo que ahora más difícil de depurar.

---

### NATS

#### 1. UBICACIÓN

Módulo 18, Lección 5 de 6 · Fase 2
`docker-compose.yml`).

#### 2. PRERREQUISITOS

- Mensajería con Kafka y RabbitMQ: publicar, consumir, grupos (ficha anterior).
- Petición/respuesta con timeout (fichas 1 y 2).

#### 3. OBJETIVO DE APRENDIZAJE

**Usar** NATS desde Node para publicar y suscribirse con comodines, repartir carga con un grupo de cola y hacer
petición/respuesta, y **explicar** qué garantía de entrega ofrece NATS core frente a Kafka y RabbitMQ; lo compruebas
cuando, con NATS arriba, `node --test f117-nats/nats.infra.js` pasa 6 de 6.

#### 4. ANALOGÍA VISUAL

Dibuja una **red de radioaficionados** en una ciudad. Cada mensaje se emite en una **frecuencia con nombre**
(el *subject*): «pedidos.creado», «pedidos.cancelado». **No hay que reservar la frecuencia** ni avisar a nadie:
quien quiera emitir, emite; quien quiera oír, sintoniza. Un oyente puede sintonizar **una banda entera** con un
comodín: «pedidos.*». La regla de la radio es dura: **si nadie está escuchando en ese momento, el mensaje se pierde
en el aire**; no hay contestador. En una esquina del dibujo, **dos repartidores con el mismo chaleco** («grupo
facturación») comparten un walkie: cada aviso lo atiende **solo uno** de los dos, el que esté libre (grupo de cola).
En otra esquina, alguien pregunta por radio «¿hay existencias de TEC-1? Respondedme al **canal privado 7**»: el que
sabe contesta por ese canal privado (petición/respuesta con un buzón temporal). Y si pregunta por una frecuencia
donde **no hay nadie**, la centralita le dice al instante «nadie a la escucha», sin hacerle esperar. La centralita
es un **único aparato pequeño** en el centro del dibujo: el servidor NATS.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** en el centro, el servidor NATS en el puerto 4222. El servicio pedidos publica en el subject
pedidos.creado. NATS lo entrega a auditoria, suscrita a pedidos.* y que recibe todos los mensajes, y a uno solo de
los dos miembros del grupo de cola facturacion (facturacion-A o facturacion-B). Aparte, pedidos hace una petición a
inventario.consultar indicando un buzón de respuesta _INBOX; inventario responde publicando en ese buzón y NATS se lo
entrega a pedidos. Por último, una petición a pagos.cobrar, donde no hay suscriptores, recibe al instante el aviso
«no responders».

#### 6. EXPLICACIÓN NIVEL 0

- **NATS** es otro sistema de mensajería, pensado para ser **muy simple y muy rápido**.
- Los mensajes se envían a un **subject**: un nombre con puntos, como `pedidos.creado`. No hay que crearlo antes.
- Quien quiera recibirlos se **suscribe** a ese nombre, o a un patrón (`pedidos.*`).
- En su forma básica (NATS «core») **no guarda nada**: entrega el mensaje a quien esté escuchando en ese instante.
  Si no hay nadie, se pierde. A cambio es rapidísimo y casi no hay nada que configurar.
- También sirve para **preguntar y recibir respuesta** entre servicios sin que uno conozca la dirección del otro:
  solo el subject.
- Si necesitas que los mensajes se guarden, NATS tiene un componente opcional llamado **JetStream** (lo verás en el
  Módulo 26).

#### 7. EXPLICACIÓN INTERMEDIA

- **Subjects:** tramos separados por puntos. Comodines solo al suscribirse: `*` vale por **un** tramo
  (`pedidos.*` recibe `pedidos.creado`, no `pedidos.creado.urgente`) y `>` por **uno o más** al final (`pedidos.>`).
- **Publicar/suscribir:** `nc.publish(subject, datos)` y `nc.subscribe(subject, { callback })`. Cada suscriptor
  recibe su copia (*fan-out*). La carga es texto o bytes; `msg.json()` y `msg.string()` la leen.
- **Grupo de cola** (*queue group*): `subscribe(subject, { queue: 'facturacion' })`. Entre los suscriptores con el
  mismo nombre de grupo, cada mensaje va a **uno solo**, elegido por el servidor. Escalas añadiendo instancias, sin
  configurar nada en el servidor.
- **Petición/respuesta:** `nc.request(subject, datos, { timeout })` publica con un subject de respuesta temporal
  (`_INBOX.…`) y espera un mensaje ahí; el que responde llama a `msg.respond()`. Con un grupo de cola en los que
  responden, tienes balanceo de carga sin Service Discovery.
- **«No responders»:** si **nadie** está suscrito al subject, el servidor lo dice al instante y `request` rechaza con
  `no responders`, sin esperar al timeout. Si hay un suscriptor pero no contesta, se agota el tiempo (`TimeoutError`).
- **Entrega «como mucho una vez»:** NATS core no guarda ni reintenta. Mensaje publicado sin suscriptores, o con el
  suscriptor caído, es mensaje perdido. No hay ack.
- **Cliente Node actual:** `@nats-io/transport-node` 3.5.0 (`import { connect } from '@nats-io/transport-node'`). El
  paquete `nats` anterior está marcado en npm como movido a este. `nc.flush()` espera a que el servidor haya
  procesado lo enviado; `nc.drain()` cierra con orden (procesa lo pendiente y se desuscribe).
- **Servidor:** un binario de pocos megabytes; puerto 4222 para clientes y, con `-m 8222`, un monitor HTTP
  (`/healthz`, `/connz`, `/subsz`).

#### 8. EXPLICACIÓN MAESTRA

- **NATS core vs JetStream vs Kafka vs RabbitMQ.**
  1. **NATS core**: como mucho una vez, sin persistencia, latencia mínima, operación trivial. Para señales que
     caducan rápido (telemetría, invalidación de caché, descubrimiento, petición/respuesta interna).
  2. **NATS JetStream**: añade *streams* persistentes, consumidores con ack, relectura y deduplicación; compite con
     Kafka y RabbitMQ con menos piezas, y con un ecosistema más pequeño (conectores, herramientas, personas con
     experiencia).
  3. **Kafka**: el estándar para flujos de eventos a gran escala y retención larga, con el costo operativo más alto.
  4. **RabbitMQ**: enrutamiento rico y colas de trabajo con garantías por mensaje.
- **Petición/respuesta sobre NATS frente a REST/gRPC.** Ganas desacoplo de ubicación (no hay direcciones ni registro:
  el subject es la dirección), balanceo con grupos de cola y la señal inmediata de «no responders». Pierdes el
  contrato explícito (no hay OpenAPI ni `.proto` salvo que lo impongas tú), las herramientas HTTP y los proxies de
  capa 7. Sigue siendo comunicación **síncrona** en lo que importa: el que pide espera y depende de que el otro esté
  vivo (ficha 6).
- **El diseño de subjects es tu API.** Jerarquías claras (`<dominio>.<entidad>.<hecho>`), sin datos de alta
  cardinalidad innecesarios, y permisos por subject en el servidor: un comodín `>` en una suscripción da acceso a
  **todo**, y también convierte a ese suscriptor en «oyente» de cualquier petición, lo que cambia un «no responders»
  inmediato por un timeout (lo verás en el error común).
- **Consumidores lentos:** si un suscriptor no da abasto, el servidor acumula hasta un límite y después **lo
  desconecta** (*slow consumer*) para proteger al resto. En NATS core la contrapresión es problema del cliente.
- **Cuándo NO usar NATS core:** para cualquier mensaje que no pueda perderse (un pedido, un pago, una orden de
  envío). Ahí: JetStream, Kafka o RabbitMQ. Usar NATS core «porque en las pruebas nunca se perdió nada» es el error
  clásico: se pierde justo durante un despliegue o una caída.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **@nats-io/transport-node 3.5.0** y **NATS Server 2.15.3** (imagen
`nats:2.15.3-alpine` del `docker-compose.yml` que está al inicio del módulo).

`f117-nats/nats.js`:

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

`f117-nats/demo.js`:

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

#### 10. MINI-LABORATORIO

1. Levanta NATS (si ya tienes arriba el `docker compose` de la ficha anterior, ya está) y comprueba su salud:
   ```bash
   docker compose up -d --wait nats
   curl -s localhost:8222/healthz; echo
   ```
2. Ejecuta la demostración (pub/sub con comodín, grupo de cola, petición/respuesta y petición sin oyentes):
   ```bash
   node f117-nats/demo.js
   ```
3. **Rompe el sistema a propósito:** apaga NATS e intenta conectar:
   ```bash
   docker compose stop nats
   node f117-nats/demo.js 2>&1 | grep -E '^ConnectionError|\[cause\]'
   docker compose start nats
   ```

**Output esperado** (paso 1):

```text
{"status":"ok"}
```

**Output esperado** (paso 2, salida real en macOS con NATS 2.15.3; **el reparto entre `facturacion-A` y `facturacion-B` cambia en cada
ejecución**, lo fijo es que cada pedido aparece una sola vez en facturación):

```text
conectado a localhost:4222
auditoria   ← pedidos.creado {"pedidoId":"P-1"}
facturacion-A ← P-1
auditoria   ← pedidos.creado {"pedidoId":"P-2"}
facturacion-A ← P-2
auditoria   ← pedidos.creado {"pedidoId":"P-3"}
facturacion-B ← P-3
auditoria   ← pedidos.creado {"pedidoId":"P-4"}
facturacion-A ← P-4
auditoria   ← pedidos.cancelado {"pedidoId":"P-2"}
respuesta   ← {"sku":"TEC-1","disponibles":12}
pagos.cobrar → RequestError: no responders: 'pagos.cobrar'
```

**Output esperado** (paso 3, salida real con @nats-io/transport-node 3.5.0):

```text
ConnectionError: connection refused
  [cause]: Error: connect ECONNREFUSED 127.0.0.1:4222
```

**Captura comentada:** `auditoria` (suscrita a `pedidos.*`, sin grupo) recibió los **cinco** mensajes, incluido
`pedidos.cancelado`. Las dos suscripciones del grupo `facturacion` recibieron entre las dos **cuatro**, una por
pedido creado. La respuesta de inventario llegó sin que el que pregunta supiera dónde vive inventario. Y
`pagos.cobrar` falló **al instante** con `no responders`: no hubo que esperar el segundo del timeout. En ningún
momento creaste un topic, una cola ni un exchange.

#### 11. VERIFICACIÓN

```bash
docker compose up -d --wait nats
node --test --test-reporter=spec f117-nats/nats.infra.js
```

Salida real:

```text
✔ comodines: «*» cubre un tramo y «>» todos los que siguen (111.892219ms)
✔ grupo de cola: cada mensaje lo recibe UN solo miembro; sin grupo, todos (106.408851ms)
✔ petición/respuesta (7.566708ms)
✔ petición sin nadie que responda: falla enseguida con «no responders» (2.537894ms)
✔ petición con un oyente que nunca responde: se agota el tiempo (TimeoutError) (302.295088ms)
✔ NATS core no guarda mensajes: lo publicado sin suscriptores se pierde (102.470391ms)
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

`f117-nats/nats.infra.js`:

```javascript
// Módulo 18 · F117 · Test contra NATS real. Ejecuta: docker compose up -d --wait && node --test f117-nats/nats.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { conectar, pedir, publicar, responder, suscribir } from './nats.js';

const p = `test${process.pid}`; // prefijo propio para no mezclarse con otros clientes del servidor
let nc;
before(async () => { nc = await conectar('test'); });
after(async () => { await nc.drain(); });

test('comodines: «*» cubre un tramo y «>» todos los que siguen', async () => {
  const uno = [];
  const todos = [];
  const s1 = suscribir(nc, `${p}.pedidos.*`, (_d, subject) => uno.push(subject.replace(`${p}.`, '')));
  const s2 = suscribir(nc, `${p}.>`, (_d, subject) => todos.push(subject.replace(`${p}.`, '')));
  await nc.flush();
  publicar(nc, `${p}.pedidos.creado`, {});
  publicar(nc, `${p}.pedidos.creado.urgente`, {});
  publicar(nc, `${p}.pagos.aprobado`, {});
  await nc.flush();
  await dormir(100);
  assert.deepEqual(uno, ['pedidos.creado']);
  assert.deepEqual(todos, ['pedidos.creado', 'pedidos.creado.urgente', 'pagos.aprobado']);
  s1.unsubscribe(); // si «>» siguiera activa, contaría como oyente de CUALQUIER subject de los tests siguientes
  s2.unsubscribe();
});

test('grupo de cola: cada mensaje lo recibe UN solo miembro; sin grupo, todos', async () => {
  const porWorker = { A: 0, B: 0 };
  let auditoria = 0;
  suscribir(nc, `${p}.tareas`, () => { porWorker.A += 1; }, { grupo: 'workers' });
  suscribir(nc, `${p}.tareas`, () => { porWorker.B += 1; }, { grupo: 'workers' });
  suscribir(nc, `${p}.tareas`, () => { auditoria += 1; });
  await nc.flush();
  for (let i = 0; i < 20; i++) publicar(nc, `${p}.tareas`, { i });
  await nc.flush();
  await dormir(100);
  assert.equal(porWorker.A + porWorker.B, 20);
  assert.equal(auditoria, 20);
});

test('petición/respuesta', async () => {
  responder(nc, `${p}.inventario.consultar`, ({ sku }) => ({ sku, disponibles: 12 }));
  await nc.flush();
  assert.deepEqual(await pedir(nc, `${p}.inventario.consultar`, { sku: 'TEC-1' }), { sku: 'TEC-1', disponibles: 12 });
});

test('petición sin nadie que responda: falla enseguida con «no responders»', async () => {
  const inicio = performance.now();
  await assert.rejects(pedir(nc, `${p}.nadie.escucha`, {}, { timeoutMs: 2000 }), { name: 'RequestError', message: /no responders/ });
  assert.ok(performance.now() - inicio < 1000);
});

test('petición con un oyente que nunca responde: se agota el tiempo (TimeoutError)', async () => {
  const mudo = suscribir(nc, `${p}.mudo`, () => {}); // escucha, pero no llama a respond()
  await nc.flush();
  await assert.rejects(pedir(nc, `${p}.mudo`, {}, { timeoutMs: 300 }), { name: 'TimeoutError' });
  mudo.unsubscribe();
});

test('NATS core no guarda mensajes: lo publicado sin suscriptores se pierde', async () => {
  publicar(nc, `${p}.avisos`, { n: 1 }); // nadie escucha todavía
  await nc.flush();
  const recibidos = [];
  suscribir(nc, `${p}.avisos`, (d) => recibidos.push(d.n));
  await nc.flush();
  publicar(nc, `${p}.avisos`, { n: 2 });
  await nc.flush();
  await dormir(100);
  assert.deepEqual(recibidos, [2]);
});
```

**Pregunta de comprobación:** el servicio de facturación se reinicia durante 5 segundos por un despliegue y en ese
intervalo se publican 30 `pedidos.creado` en NATS core. ¿Cuántos procesa facturación al volver, y qué cambiarías?
(Respuesta: ninguno de esos 30. NATS core no guarda mensajes para suscriptores ausentes, como demuestra el último
test. Para no perderlos hace falta persistencia: un *stream* de JetStream con un consumidor durable, o Kafka o
RabbitMQ.)

#### 12. ERROR COMÚN

**Síntoma:** una petición a un servicio que **está caído** tarda el timeout completo en fallar (2 s, 5 s…) en lugar
de fallar al instante, y el error es `TimeoutError` en vez de `no responders`. Causa: alguien dejó una suscripción
con comodín amplio (`>` o `servicio.>`), típicamente un registrador de auditoría o un test: para NATS **sí hay un
oyente** de ese subject, así que no avisa; simplemente nadie responde.

```javascript
suscribir(nc, '>', (dato, subject) => registrar(subject, dato)); // auditoría «de todo»
await pedir(nc, 'pagos.cobrar', { pedidoId: 'P-1' }, { timeoutMs: 2000 }); // pagos está caído
```

**Cómo se ve** (salida real con @nats-io/transport-node 3.5.0; arriba, sin el comodín; abajo, con él):

```text
pagos.cobrar → RequestError: no responders: 'pagos.cobrar'
```

```text
TimeoutError: timeout
    at timeout (file:///…/node_modules/@nats-io/nats-core/lib/esm/util.js:112:31)
    at new RequestOne (file:///…/node_modules/@nats-io/nats-core/lib/esm/request.js:251:22)
```

**Diagnóstico visual:** mira el **nombre** del error y **cuánto tardó**. `no responders` inmediato significa «nadie
suscrito»; `TimeoutError` tras el plazo completo significa «alguien escucha, nadie contesta». Para ver quién escucha,
abre `http://localhost:8222/connz?subs=1`: lista cada conexión con su `name` y sus suscripciones; busca los `>`.
**Arreglo:** suscripciones de auditoría acotadas a subjects de **eventos** (`pedidos.*`), separadas de los subjects
de petición/respuesta (por ejemplo, con un prefijo `rpc.`), y permisos por subject en el servidor. Este mismo
tropiezo apareció al escribir los tests de esta ficha: por eso el primero cancela sus suscripciones al terminar.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué garantías de entrega ofrece NATS y cuándo lo elegirías frente a Kafka o RabbitMQ?»

**Respuesta modelo:** NATS core ofrece entrega como mucho una vez: el servidor reenvía cada mensaje a los
suscriptores conectados en ese momento y no guarda nada; si no hay suscriptor o está caído, el mensaje se pierde.
A cambio es muy rápido y simple: subjects jerárquicos con comodines, grupos de cola para repartir carga y
petición/respuesta nativa con aviso inmediato cuando no hay nadie que responda. Lo elijo para comunicación interna
de baja latencia donde perder un mensaje es aceptable o donde quien pide reintenta: petición/respuesta entre
servicios, señales de control, telemetría, invalidación de cachés. Si necesito durabilidad, relectura o ack, activo
JetStream, que añade streams persistentes y consumidores durables sobre el mismo servidor, o voy a Kafka (flujos de
eventos a gran escala, retención larga, ecosistema de conectores) o a RabbitMQ (enrutamiento complejo, colas de
trabajo). La decisión sale de la garantía que exige el mensaje, no de la herramienta que esté de moda.

#### 14. ANTI-PATRÓN RELACIONADO

**Eventos de negocio críticos por NATS core, «porque es rápido»:**

```javascript
// ❌ el pedido se guarda y el evento se «lanza al aire»: si facturación está reiniciándose, nunca se entera
await repositorio.guardar(pedido);
nc.publish('pedidos.creado', JSON.stringify({ pedidoId: pedido.id }));   // sin persistencia, sin ack, sin reintento

// ❌ y el consumidor, sin grupo de cola: con 3 instancias, cada pedido se factura 3 veces
nc.subscribe('pedidos.creado', { callback: (_e, m) => facturar(m.json()) });
```

Se ve así: cada pocos despliegues aparecen pedidos sin factura que nadie puede explicar (no hay log de error: no
hubo error, el mensaje simplemente no tenía oyente); y, al escalar facturación a tres instancias, facturas
triplicadas. Para hechos que no pueden perderse: un stream persistente con ack; para repartir trabajo entre
instancias: un grupo de cola (o un consumidor durable).

---

### Sync vs async

#### 1. UBICACIÓN

Módulo 18, Lección 6 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- Las cinco fichas anteriores: REST, gRPC y GraphQL (síncronos); Kafka, RabbitMQ y NATS (asíncronos).
- Timeouts y códigos 201/202/503 (Módulo 0.4 y ficha 1).

#### 3. OBJETIVO DE APRENDIZAJE

**Comparar** con un experimento el mismo flujo implementado de forma síncrona y asíncrona, midiendo latencia y
comportamiento ante la caída de una dependencia, y **decidir** con criterios explícitos qué interacciones de un
diseño deben ser síncronas y cuáles asíncronas; lo compruebas cuando `node --test f118-sync-async/comparar.test.js`
pasa 5 de 5 y justificas la tabla de decisión para un caso nuevo.

#### 4. ANALOGÍA VISUAL

Dibuja **dos formas de pedir comida**. Arriba, **una llamada telefónica** al restaurante (síncrono): tú preguntas,
te quedas **con el teléfono en la oreja** mientras el empleado consulta a la cocina, que a su vez **llama** al
repartidor para ver si está libre. Tres personas en fila, cada una esperando a la siguiente; tu espera es **la suma
de todas**, y si el repartidor no contesta, **todos** se quedan colgados y tú te quedas sin respuesta. A cambio,
cuando cuelgas **sabes** si hay pedido o no. Abajo, **un mensaje por una aplicación** (asíncrono): escribes el
pedido, recibes al instante un «✓ recibido» y **sigues con tu vida**; el mensaje espera en una **bandeja** hasta que
alguien del restaurante lo lee. Si el repartidor está ocupado, el aviso para él se queda en **su** bandeja y lo verá
al volver; nada se bloquea. A cambio, cuando sueltas el móvil **todavía no sabes** si llegará la comida: te lo dirán
después con otro mensaje, y tienes que estar preparado para que el mismo aviso te llegue dos veces. Entre los dos
dibujos, una **balanza**: en un platillo «respuesta inmediata y certeza»; en el otro, «independencia y aguante».

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** dos diagramas. Arriba, el flujo síncrono: el cliente envía POST /pedidos a pedidos; pedidos
llama a pagos para cobrar (50 milisegundos) y después a notificaciones (200 milisegundos), y solo entonces responde
201 al cliente, tras unos 250 milisegundos; si cualquiera de los dos falla, responde 503. Abajo, el flujo híbrido:
pedidos llama a pagos de forma síncrona (50 milisegundos), publica el evento pedido.creado en una cola o broker y
responde 201 al cliente tras unos 50 milisegundos; notificaciones lee el evento de la cola cuando puede.

#### 6. EXPLICACIÓN NIVEL 0

- **Síncrono:** preguntas y **te quedas esperando** la respuesta. Como una llamada de teléfono.
- **Asíncrono:** dejas un mensaje y **sigues**; la otra parte lo atiende cuando puede. Como un mensaje de texto.
- Ninguna es «mejor». Cada una sirve para cosas distintas:
  - Si **necesitas la respuesta para continuar** («¿se pudo cobrar?»), tienes que esperar: síncrono.
  - Si solo estás **avisando de algo que ya pasó** («se creó el pedido, envíen el correo»), no hay por qué esperar:
    asíncrono.
- Lo síncrono es más **fácil de entender**, pero ata a los servicios: si uno va lento o se cae, arrastra a los que
  lo esperan.
- Lo asíncrono hace al sistema más **resistente**, pero más difícil de seguir: las cosas ocurren «un poco después».

#### 7. EXPLICACIÓN INTERMEDIA

- **Acoplamiento temporal:** en una llamada síncrona los dos servicios deben estar **vivos a la vez**. Con una cola
  en medio, basta con que el broker esté vivo; el consumidor puede estar caído y ponerse al día después.
- **Latencia:** en una cadena síncrona el cliente espera la **suma** (50 + 200 = 250 ms en el laboratorio). En el
  híbrido espera solo lo imprescindible (50 ms).
- **Disponibilidad:** si cada servicio está disponible el 99,9 % del tiempo y una petición necesita **tres** en
  cadena síncrona, la disponibilidad conjunta es 0,999³ ≈ 99,7 %: de unos 43 minutos de caída al mes pasas a unas
  2 horas y 10 minutos. Cada dependencia síncrona resta.
- **Consistencia:** lo síncrono permite responder con el resultado final; lo asíncrono introduce **consistencia
  eventual**: durante un rato, el pedido existe y el correo aún no se envió. La interfaz y el negocio deben
  aceptarlo (201 con el pedido creado, o 202 «aceptado, en proceso»).
- **Fallos parciales:** en el flujo síncrono del laboratorio, si notificaciones falla **después** de cobrar, el
  cliente recibe 503 con el cobro hecho. Eso hay que compensarlo (Módulo 22: sagas) o evitarlo no encadenando.
- **Lo asíncrono no elimina dependencias necesarias:** si **necesitas** el resultado del cobro para aceptar el
  pedido, mover el cobro a una cola no lo arregla; cambia el contrato con el usuario («pedido pendiente de pago»).
- **Estilos intermedios:** petición/respuesta asíncrona (202 + consulta de estado o *webhook*), petición/respuesta
  sobre mensajería (NATS: sigue siendo síncrona para quien espera) y eventos puros.
- **Costo de lo asíncrono:** un broker que operar, consumidores idempotentes, orden no garantizado, trazas
  distribuidas imprescindibles para seguir un flujo (Módulo 21) y errores que aparecen lejos de quien los causó.

#### 8. EXPLICACIÓN MAESTRA

- **Criterios de decisión** (aplica la pregunta de arriba abajo; la primera que se cumpla manda):

  | Pregunta | Si la respuesta es sí | Ejemplo |
  |---|---|---|
  | ¿Necesito el resultado para contestar a quien me llamó? | Síncrono (REST/gRPC) con timeout y plan B | validar stock, autorizar un pago |
  | ¿Es una consulta de lectura para pintar una pantalla? | Síncrono, o mejor una copia local alimentada por eventos | catálogo, perfil |
  | ¿Solo informo de un hecho ya ocurrido? | Evento asíncrono (Kafka/RabbitMQ) | `pedido.creado` → correo, analítica |
  | ¿Es trabajo largo o que puede reintentarse? | Cola de trabajo + 202 y consulta de estado | generar una factura PDF, exportar |
  | ¿Hay varios interesados, hoy o mañana? | Evento (publicar/suscribir) | puntos de fidelidad, antifraude |
  | ¿El orden o la relectura importan? | Log con clave (Kafka) | movimientos de una cuenta |

- **Alternativas arquitectónicas y su trade-off.**
  1. **Orquestación síncrona** (un servicio llama a los demás): flujo legible en un solo sitio; disponibilidad y
     latencia acopladas.
  2. **Coreografía por eventos** (cada servicio reacciona a eventos): servicios independientes y extensibles; el
     flujo completo no está escrito en ningún lugar y se entiende solo con trazas.
  3. **Híbrido** (lo de esta ficha): síncrono en el camino crítico mínimo, eventos para lo demás. Es lo más habitual.
  4. **Replicar datos por eventos** para no llamar: pedidos guarda una copia de los precios que publica catálogo;
     lecturas locales, a cambio de datos ligeramente desfasados y de mantener la copia.
- **Señales de alarma en un diseño:** más de dos saltos síncronos para atender una petición; un servicio que no puede
  arrancar ni responder nada si otro está caído; llamadas síncronas dentro de un bucle; «eventos» que en realidad son
  órdenes con respuesta esperada (`pagos.cobrar-y-avisame`): eso es una llamada disfrazada.
- **No conviertas todo en asíncrono.** Un flujo que el usuario percibe como una sola acción y que necesita una
  respuesta definitiva (iniciar sesión, comprobar un cupón) se vuelve peor con colas: más latencia percibida, estados
  intermedios que explicar y más piezas que fallar.
- **Cuándo NO aplica esta discusión:** dentro de un mismo proceso. Si dos módulos viven en el mismo servicio, una
  llamada a función es síncrona, transaccional y gratis; partirlos en dos servicios para después unirlos con una cola
  es crear el problema que esta ficha enseña a mitigar.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, sin dependencias (`fetch` y `node:http` nativos). La cola en memoria representa
al broker de las fichas 4 y 5 para que el experimento se pueda ejecutar sin infraestructura.

`f118-sync-async/servicios.js`:

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

`f118-sync-async/comparar.js`:

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

#### 10. MINI-LABORATORIO

1. Ejecuta el experimento completo (arranca los servicios simulados, los tumba y los recupera):
   ```bash
   node f118-sync-async/comparar.js
   ```
2. Cambia la latencia de notificaciones de 200 a 1000 ms (`servicio('notificaciones', 1000)` en `comparar.js`),
   vuelve a ejecutar y fíjate en qué líneas cambian. Deshaz el cambio al terminar.
3. Aplica la tabla de criterios de la explicación maestra a este flujo y anota qué interacción dejarías síncrona y
   cuál no, antes de leer la captura comentada.

**Output esperado** (paso 1, salida real; los tiempos se redondean a múltiplos de 50 ms):

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

**Output esperado** (paso 2: solo cambian los tiempos del flujo síncrono cuando notificaciones participa; el
asíncrono no se entera):

```text
síncrono  P-1 → 201 en ~1050 ms
asíncrono P-2 → 201 en ~50 ms
síncrono  P-3 → 503 en ~1050 ms (notificaciones respondió 503)
```

**Captura comentada:** (1) con todo sano, el cliente síncrono espera 250 ms (50 + 200) y el asíncrono 50. (2) Con
notificaciones caído, el flujo síncrono **rechaza el pedido** aunque el cobro ya se hizo, y encima tarda 250 ms en
decirlo; el asíncrono acepta el pedido y el evento se queda en la cola (el worker lo intenta, falla y **no lo
pierde**). (3) Cuando notificaciones vuelve, el worker vacía la cola: se enviaron 3 notificaciones en total (P-1,
P-2 y P-4); la de P-3 no existe porque ese pedido se rechazó. (4) Con pagos caído fallan **los dos**: el cobro es
una dependencia necesaria para decidir, y ninguna cola cambia eso.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f118-sync-async/comparar.test.js
```

Salida real:

```text
✔ síncrono: la latencia del cliente es la SUMA de la cadena (194.69821ms)
✔ asíncrono: el cliente no espera a notificaciones (24.877339ms)
✔ síncrono: si cae notificaciones, falla el pedido (aunque el cobro ya se hizo) (176.398039ms)
✔ asíncrono: si cae notificaciones, el pedido se crea y el evento espera en la cola (328.593565ms)
✔ lo asíncrono no arregla una dependencia que necesitas para decidir: sin pagos no hay pedido (25.391929ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

`f118-sync-async/comparar.test.js`:

```javascript
// Módulo 18 · F118 · Ejecuta: node --test f118-sync-async/comparar.test.js
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { cola, notificar, pedidosAsincrono, pedidosSincrono, servicio } from './servicios.js';

let pagos;
let notificaciones;
before(async () => { pagos = await servicio('pagos', 20); notificaciones = await servicio('notificaciones', 150); });
beforeEach(() => { pagos.caido = false; notificaciones.caido = false; notificaciones.atendidas = 0; });
after(() => { pagos.cerrar(); notificaciones.cerrar(); });

test('síncrono: la latencia del cliente es la SUMA de la cadena', async () => {
  const r = await pedidosSincrono({ pagos, notificaciones })('P-1');
  assert.equal(r.status, 201);
  assert.ok(r.ms >= 170, `tardó ${r.ms} ms`); // 20 + 150
});

test('asíncrono: el cliente no espera a notificaciones', async () => {
  const eventos = cola();
  const r = await pedidosAsincrono({ pagos, eventos })('P-1');
  assert.equal(r.status, 201);
  assert.ok(r.ms < 150, `tardó ${r.ms} ms`);
  assert.equal(eventos.pendientes.length, 1);
});

test('síncrono: si cae notificaciones, falla el pedido (aunque el cobro ya se hizo)', async () => {
  notificaciones.caido = true;
  const atendidasAntes = pagos.atendidas;
  const r = await pedidosSincrono({ pagos, notificaciones })('P-2');
  assert.equal(r.status, 503);
  assert.equal(r.error, 'notificaciones respondió 503');
  assert.equal(pagos.atendidas, atendidasAntes + 1); // ¡cobrado y sin pedido!: inconsistencia
});

test('asíncrono: si cae notificaciones, el pedido se crea y el evento espera en la cola', async () => {
  notificaciones.caido = true;
  const eventos = cola();
  assert.equal((await pedidosAsincrono({ pagos, eventos })('P-3')).status, 201);
  assert.equal(await eventos.procesar(notificar(notificaciones)), 0); // el worker falla y NO pierde el mensaje
  assert.equal(eventos.pendientes.length, 1);
  notificaciones.caido = false; // se recupera
  assert.equal(await eventos.procesar(notificar(notificaciones)), 1);
  assert.equal(notificaciones.atendidas, 1);
  assert.equal(eventos.pendientes.length, 0);
});

test('lo asíncrono no arregla una dependencia que necesitas para decidir: sin pagos no hay pedido', async () => {
  pagos.caido = true;
  const eventos = cola();
  assert.equal((await pedidosAsincrono({ pagos, eventos })('P-4')).status, 503);
  assert.equal(eventos.pendientes.length, 0); // no se anuncia un pedido que no existe
});
```

**Pregunta de comprobación:** producto pide que, al crear un pedido, se sumen puntos de fidelidad al cliente
llamando al servicio de puntos. ¿Síncrono o asíncrono, y qué le dices a producto que cambia para el usuario?
(Respuesta: asíncrono, con el evento `pedido.creado` que ya existe: los puntos no se necesitan para aceptar el
pedido, y así una caída de puntos no impide vender. Lo que cambia: los puntos aparecen unos segundos después, no en
la misma respuesta; la pantalla debe decir «tus puntos se sumarán en breve».)

#### 12. ERROR COMÚN

**Síntoma:** «pasamos a eventos y el sistema sigue cayéndose en cadena». Causa: el **consumidor** del evento, o el
propio flujo, sigue haciendo llamadas síncronas a servicios que no necesita, o se dejó síncrono justo el paso que no
hacía falta. En el laboratorio es el flujo síncrono con notificaciones caído.

**Cómo se ve** (salida real de `comparar.js`, punto 2):

```text
síncrono  P-3 → 503 en ~250 ms (notificaciones respondió 503)
```

Y en el test, el daño colateral (salida real de `comparar.test.js`):

```text
✔ síncrono: si cae notificaciones, falla el pedido (aunque el cobro ya se hizo)
```

**Diagnóstico visual:** dibuja la petición como una fila de cajas unidas por flechas y marca en rojo cada flecha en
la que el de la izquierda **espera** al de la derecha. Si al tachar una caja que «solo avisa» (correo, analítica,
puntos) la fila entera queda en rojo, esa flecha sobra. En las trazas distribuidas se ve como un tramo (*span*) de
`notificaciones` **dentro** del tramo de `POST /pedidos`, y en las métricas como una tasa de 5xx de pedidos que sube
y baja al compás de la de notificaciones. **Arreglo:** esa interacción pasa a ser un evento publicado después del
paso crítico; el cliente recibe su respuesta sin esperarla y el consumidor reintenta por su cuenta.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo decides si la comunicación entre dos microservicios debe ser síncrona o asíncrona?»

**Respuesta modelo:** empiezo por una pregunta: ¿necesito la respuesta del otro servicio para poder contestar a
quien me llamó? Si sí (una validación, una autorización de pago), es síncrona, con timeout, reintentos acotados y un
comportamiento definido si falla. Si solo estoy comunicando un hecho que ya ocurrió, o encargando trabajo que puede
hacerse después, es asíncrona: publico un evento o encolo una tarea y respondo ya. Los criterios que peso:
acoplamiento temporal (en síncrono los dos deben estar vivos a la vez y la disponibilidad se multiplica a la baja),
latencia (el cliente espera la suma de la cadena), consistencia (asíncrono implica consistencia eventual y la
experiencia de usuario debe aceptarla), número de interesados (varios consumidores apuntan a eventos) y costo
operativo (broker, idempotencia, trazas). En la práctica el resultado es híbrido: el mínimo camino crítico síncrono
y el resto por eventos. Y vigilo dos trampas: encadenar llamadas síncronas en profundidad, y disfrazar de evento lo
que en realidad es una petición con respuesta esperada.

#### 14. ANTI-PATRÓN RELACIONADO

**La cadena síncrona profunda (el «monolito distribuido» en tiempo de ejecución):**

```mermaid
flowchart LR
    U["usuario"] --> G["gateway"] --> P["pedidos"] --> I["inventario"] --> PR["precios"] --> PM["promociones"]
    P --> PG["pagos"] --> AF["antifraude"] --> CL["clientes"]
    P --> NT["notificaciones"] --> PL["plantillas"]
```

**Texto alternativo:** el usuario llama al gateway, que llama a pedidos. Pedidos llama en serie a inventario, que
llama a precios, que llama a promociones; a pagos, que llama a antifraude, que llama a clientes; y a notificaciones,
que llama a plantillas. Nueve servicios encadenados de forma síncrona para una sola petición.

```javascript
// ❌ cada servicio espera al siguiente; nadie puede contestar si falla cualquiera de los nueve
const stock = await inventario.reservar(pedido);        // → precios → promociones
const cobro = await pagos.cobrar(pedido);               // → antifraude → clientes
await notificaciones.enviar(pedido);                    // → plantillas
```

Se ve así: la latencia de crear un pedido es la suma de nueve servicios; con un 99,9 % de disponibilidad cada uno, el
conjunto baja a 0,999⁹ ≈ 99,1 % (unas 6 horas y media de caída al mes); un despliegue de `plantillas` provoca errores
al **comprar**; y los equipos ya no pueden desplegar por separado sin coordinarse. Tienes los costos de los
microservicios y las ataduras de un monolito.
