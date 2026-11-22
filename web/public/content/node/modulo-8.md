# Módulo 8: Patrones asíncronos avanzados

## Aprende construyendo


### Tema 1: Worker Threads para trabajo CPU-bound · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por worker threads para trabajo cpu-bound con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender worker threads para trabajo cpu-bound te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en worker threads para trabajo cpu-bound como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que worker threads para trabajo cpu-bound resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Worker Threads para trabajo CPU-bound se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Worker Threads para trabajo CPU-bound | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses worker threads para trabajo cpu-bound por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: worker threads para trabajo cpu-bound funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Worker Threads para trabajo CPU-bound existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve worker threads para trabajo cpu-bound en tu contexto?
2. ¿Cómo sabrías que worker threads para trabajo cpu-bound no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar worker threads para trabajo cpu-bound?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir practica-worker
cd practica-worker
mkdir src
```

```json
{
  "name": "practica-worker",
  "private": true,
  "type": "module"
}
```

```js
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

function fibonacci(n) {
  if (!Number.isInteger(n) || n < 0 || n > 40) {
    throw new RangeError("n debe ser un entero entre 0 y 40");
  }
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

if (!isMainThread) {
  try {
    parentPort.postMessage({ ok: true, valor: fibonacci(workerData.n) });
  } catch (error) {
    parentPort.postMessage({ ok: false, error: error.message });
  }
} else {
  const worker = new Worker(new URL(import.meta.url), {
    workerData: { n: 35 },
  });
  const latido = setInterval(() => console.log("el hilo principal responde"), 40);

  worker.once("message", async (resultado) => {
    clearInterval(latido);
    console.log(resultado);
    await worker.terminate();
  });
  worker.once("error", async (error) => {
    clearInterval(latido);
    console.error("Worker falló:", error.message);
    await worker.terminate();
  });
}
```

```bash
node src/calcular.js
```

</details>

### Tema 2: Cluster module y balanceo entre procesos · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por cluster module y balanceo entre procesos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender cluster module y balanceo entre procesos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en cluster module y balanceo entre procesos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que cluster module y balanceo entre procesos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Cluster module y balanceo entre procesos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Cluster module y balanceo entre procesos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses cluster module y balanceo entre procesos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: cluster module y balanceo entre procesos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cluster module y balanceo entre procesos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve cluster module y balanceo entre procesos en tu contexto?
2. ¿Cómo sabrías que cluster module y balanceo entre procesos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar cluster module y balanceo entre procesos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir practica-cluster
cd practica-cluster
mkdir src
```

```json
{
  "name": "practica-cluster",
  "private": true,
  "type": "module"
}
```

```js
import cluster from "node:cluster";
import http from "node:http";
import os from "node:os";

const cantidad = Math.min(2, os.availableParallelism());

if (cluster.isPrimary) {
  console.log(`Primario ${process.pid}: iniciará ${cantidad} workers`);
  cluster.on("online", (worker) => {
    console.log(`Worker local listo: PID ${worker.process.pid}`);
  });
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} terminó`, { code, signal });
  });
  for (let i = 0; i < cantidad; i += 1) cluster.fork();
} else {
  let atendidas = 0;
  const server = http.createServer((_req, res) => {
    atendidas += 1;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ pid: process.pid, atendidas }) + "\n");
  });
  server.listen(3000, "127.0.0.1");
  process.on("SIGTERM", () => server.close(() => process.exit(0)));
}
```

```bash
node src/server.js
```

```bash
for i in {1..8}; do curl -s http://127.0.0.1:3000/; done
```

```bash
kill -TERM PID_IMPRESO_POR_TU_PRIMARIO
```

</details>

### Tema 3: Redis para caché, idempotencia y Pub/Sub · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por redis para caché, idempotencia y pub/sub con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender redis para caché, idempotencia y pub/sub te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en redis para caché, idempotencia y pub/sub como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que redis para caché, idempotencia y pub/sub resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Redis para caché, idempotencia y Pub/Sub se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Redis para caché, idempotencia y Pub/Sub | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses redis para caché, idempotencia y pub/sub por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: redis para caché, idempotencia y pub/sub funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Redis para caché, idempotencia y Pub/Sub existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve redis para caché, idempotencia y pub/sub en tu contexto?
2. ¿Cómo sabrías que redis para caché, idempotencia y pub/sub no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar redis para caché, idempotencia y pub/sub?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir practica-redis
cd practica-redis
mkdir src
docker run --name redis-practica-patrones -p 127.0.0.1:6379:6379 -d redis:7.2.5-alpine
```

```json
{
  "name": "practica-redis",
  "private": true,
  "type": "module",
  "dependencies": {
    "redis": "^4.7.0"
  }
}
```

```bash
npm install
```

```js
import { createClient } from "redis";

const redis = createClient({ url: "redis://127.0.0.1:6379" });
redis.on("error", (error) => console.error("redis_error", error.message));
await redis.connect();

const repository = {
  calls: 0,
  async findById(id) {
    this.calls += 1;
    return { id, tarifa: 12500 };
  },
};

async function findDeliveryCached(id) {
  const key = `delivery:${id}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const delivery = await repository.findById(id);
  if (delivery) await redis.set(key, JSON.stringify(delivery), { EX: 30 });
  return delivery;
}

try {
  const primeraLectura = await findDeliveryCached("RF-100");
  const segundaLectura = await findDeliveryCached("RF-100");
  const primeraReserva = await redis.set("orden:RF-100", "procesada", { NX: true, EX: 3600 });
  const segundaReserva = await redis.set("orden:RF-100", "procesada", { NX: true, EX: 3600 });
  console.log({ primeraLectura, segundaLectura, llamadasAlRepositorio: repository.calls });
  console.log({ primeraReserva, segundaReserva });
} finally {
  await redis.quit();
}
```

```bash
node src/app.js
```

```js
import { createClient } from "redis";
import { setTimeout as delay } from "node:timers/promises";

const publisher = createClient({ url: "redis://127.0.0.1:6379" });
const subscriber = publisher.duplicate();
publisher.on("error", (error) => console.error("publisher_error", error.message));
subscriber.on("error", (error) => console.error("subscriber_error", error.message));
await Promise.all([publisher.connect(), subscriber.connect()]);

const recibidos = [];
await subscriber.subscribe("delivery.changed", (message) => recibidos.push(message));
await publisher.publish("delivery.changed", "conectado");
await delay(50);
await subscriber.quit();
const receptoresAusentes = await publisher.publish("delivery.changed", "desconectado");
console.log({ recibidos, receptoresAusentes });
await publisher.quit();
```

</details>

### Tema 4: Colas de trabajo con BullMQ · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por colas de trabajo con bullmq con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender colas de trabajo con bullmq te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en colas de trabajo con bullmq como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que colas de trabajo con bullmq resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Colas de trabajo con BullMQ se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Colas de trabajo con BullMQ | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses colas de trabajo con bullmq por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: colas de trabajo con bullmq funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Colas de trabajo con BullMQ existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve colas de trabajo con bullmq en tu contexto?
2. ¿Cómo sabrías que colas de trabajo con bullmq no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar colas de trabajo con bullmq?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir practica-bullmq
cd practica-bullmq
mkdir src
docker run --name redis-practica-bullmq -p 127.0.0.1:6379:6379 -d redis:7.2.5-alpine
```

```json
{
  "name": "practica-bullmq",
  "private": true,
  "type": "module",
  "dependencies": {
    "bullmq": "^5.0.0"
  }
}
```

```bash
npm install
```

```js
import { Queue, Worker } from "bullmq";

const connection = { host: "127.0.0.1", port: 6379 };
const queue = new Queue("etiquetas", { connection });
const efectosLocales = new Set();

const worker = new Worker(
  "etiquetas",
  async (job) => {
    console.log(`intento=${job.attemptsMade + 1} guia=${job.data.guia}`);
    if (job.attemptsMade === 0) throw new Error("fallo transitorio simulado");
    if (efectosLocales.has(job.data.guia)) return { duplicado: true };
    efectosLocales.add(job.data.guia);
    return { guia: job.data.guia };
  },
  { connection, concurrency: 2 },
);

worker.on("failed", (job, error) => {
  console.log(`falló job=${job?.id}: ${error.message}`);
});
worker.on("error", (error) => console.error("worker_error", error.message));

let timeout;
const completado = new Promise((resolve, reject) => {
  worker.once("completed", (job) => resolve(job.id));
  timeout = setTimeout(() => reject(new Error("tiempo de espera agotado")), 10000);
});

try {
  const opciones = {
    jobId: "etiqueta-RF-100",
    attempts: 3,
    backoff: { type: "exponential", delay: 100 },
  };
  const original = await queue.add("generar", { guia: "RF-100" }, opciones);
  const idCompletado = await completado;
  const duplicado = await queue.add("generar", { guia: "RF-100" }, opciones);
  console.log({ original: original.id, idCompletado, duplicado: duplicado.id });
} finally {
  clearTimeout(timeout);
  await worker.close();
  await queue.close();
}
```

```bash
node src/cola.js
```

```bash
docker rm -f redis-practica-bullmq
```

</details>

### Tema 5: PM2, memory leaks y heap snapshots · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por pm2, memory leaks y heap snapshots con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender pm2, memory leaks y heap snapshots te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pm2, memory leaks y heap snapshots como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pm2, memory leaks y heap snapshots resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| PM2, memory leaks y heap snapshots se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar PM2, memory leaks y heap snapshots | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pm2, memory leaks y heap snapshots por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pm2, memory leaks y heap snapshots funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- PM2, memory leaks y heap snapshots existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pm2, memory leaks y heap snapshots en tu contexto?
2. ¿Cómo sabrías que pm2, memory leaks y heap snapshots no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pm2, memory leaks y heap snapshots?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir practica-memoria
cd practica-memoria
mkdir src
```

```json
{
  "name": "practica-memoria",
  "private": true,
  "type": "module",
  "devDependencies": {
    "pm2": "^5.4.3"
  }
}
```

```bash
npm install
```

```js
const retenidos = [];
let solicitud = 0;

setInterval(() => {
  for (let i = 0; i < 100; i += 1) {
    solicitud += 1;
    retenidos.push({ solicitud, payload: "x".repeat(1024) });
  }
  const { rss, heapUsed, external } = process.memoryUsage();
  const mb = (bytes) => Math.round(bytes / 1024 / 1024);
  console.log({ objetos: retenidos.length, rssMB: mb(rss), heapUsedMB: mb(heapUsed), externalMB: mb(external) });
}, 500);
```

```bash
node --inspect=127.0.0.1:9229 src/leak.js
```

```js
module.exports = {
  apps: [{ name: "memoria-academia", script: "src/cache-limitada.js", instances: 1 }],
};
```

</details>

### 1. Crea el proyecto y Redis

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por 1. crea el proyecto y redis con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender 1. crea el proyecto y redis te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en 1. crea el proyecto y redis como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que 1. crea el proyecto y redis resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 1. Crea el proyecto y Redis se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar 1. Crea el proyecto y Redis | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses 1. crea el proyecto y redis por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: 1. crea el proyecto y redis funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- 1. Crea el proyecto y Redis existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve 1. crea el proyecto y redis en tu contexto?
2. ¿Cómo sabrías que 1. crea el proyecto y redis no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar 1. crea el proyecto y redis?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir laboratorio-despachos
cd laboratorio-despachos
mkdir src
docker run --name redis-laboratorio-despachos -p 127.0.0.1:6379:6379 -d redis:7.2.5-alpine
```

```json
{
  "name": "laboratorio-despachos",
  "private": true,
  "type": "module",
  "dependencies": {
    "bullmq": "^5.0.0"
  }
}
```

</details>

### 2. Implementa el cálculo CPU-bound

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por 2. implementa el cálculo cpu-bound con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender 2. implementa el cálculo cpu-bound te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en 2. implementa el cálculo cpu-bound como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que 2. implementa el cálculo cpu-bound resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 2. Implementa el cálculo CPU-bound se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar 2. Implementa el cálculo CPU-bound | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses 2. implementa el cálculo cpu-bound por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: 2. implementa el cálculo cpu-bound funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- 2. Implementa el cálculo CPU-bound existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve 2. implementa el cálculo cpu-bound en tu contexto?
2. ¿Cómo sabrías que 2. implementa el cálculo cpu-bound no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar 2. implementa el cálculo cpu-bound?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
import { parentPort, workerData } from "node:worker_threads";

let puntuacion = workerData.semilla;
for (let i = 0; i < 8_000_000; i += 1) {
  puntuacion = (puntuacion * 31 + i) % 1_000_000_007;
}
parentPort.postMessage({ guia: workerData.guia, puntuacion });
```

</details>

### 3. Implementa cluster, límite de Workers y productor

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por 3. implementa cluster, límite de workers y productor con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender 3. implementa cluster, límite de workers y productor te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en 3. implementa cluster, límite de workers y productor como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que 3. implementa cluster, límite de workers y productor resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 3. Implementa cluster, límite de Workers y productor se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar 3. Implementa cluster, límite de Workers y productor | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses 3. implementa cluster, límite de workers y productor por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: 3. implementa cluster, límite de workers y productor funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- 3. Implementa cluster, límite de Workers y productor existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve 3. implementa cluster, límite de workers y productor en tu contexto?
2. ¿Cómo sabrías que 3. implementa cluster, límite de workers y productor no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar 3. implementa cluster, límite de workers y productor?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
import cluster from "node:cluster";
import http from "node:http";
import os from "node:os";
import { Worker } from "node:worker_threads";
import { setTimeout as delay } from "node:timers/promises";
import { Queue } from "bullmq";

const cantidad = Math.min(2, os.availableParallelism());

if (cluster.isPrimary) {
  cluster.on("online", (worker) => console.log(`API PID ${worker.process.pid}`));
  cluster.on("exit", (worker) => console.log(`Terminó API PID ${worker.process.pid}`));
  for (let i = 0; i < cantidad; i += 1) cluster.fork();
} else {
  const cola = new Queue("laboratorio-etiquetas", {
    connection: { host: "127.0.0.1", port: 6379 },
  });
  let activos = 0;
  const esperando = [];

  async function conCupo(tarea) {
    if (activos >= 2) await new Promise((resolve) => esperando.push(resolve));
    activos += 1;
    try {
      return await tarea();
    } finally {
      activos -= 1;
      esperando.shift()?.();
    }
  }

  async function asignar(guia) {
    return conCupo(async () => {
      const worker = new Worker(new URL("./asignacion.js", import.meta.url), {
        workerData: { guia, semilla: 42 },
      });
      try {
        return await new Promise((resolve, reject) => {
          worker.once("message", resolve);
          worker.once("error", reject);
        });
      } finally {
        await worker.terminate();
      }
    });
  }

  function responder(res, status, cuerpo) {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(cuerpo) + "\n");
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const guia = url.searchParams.get("guia") ?? "RF-100";
    try {
      if (url.pathname === "/salud") {
        responder(res, 200, { ok: true, pid: process.pid, workersCpuActivos: activos });
      } else if (url.pathname === "/asignar") {
        responder(res, 200, { ...(await asignar(guia)), pid: process.pid });
      } else if (url.pathname === "/etiqueta") {
        const job = await cola.add("generar", { guia }, {
          jobId: `laboratorio-${guia}`,
          attempts: 3,
          backoff: { type: "exponential", delay: 100 },
        });
        responder(res, 202, { encolado: job.id, pid: process.pid });
      } else if (url.pathname === "/etiqueta-sincrona") {
        await delay(300);
        responder(res, 200, { generada: guia, pid: process.pid });
      } else {
        responder(res, 404, { error: "ruta no encontrada" });
      }
    } catch (error) {
      responder(res, 500, { error: error.message });
    }
  });

  server.listen(3000, "127.0.0.1", () => console.log(`Escuchando PID ${process.pid}`));
  process.on("SIGTERM", async () => {
    await cola.close();
    server.close(() => process.exit(0));
  });
}
```

</details>

### 4. Implementa el consumidor con reintento y cierre

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por 4. implementa el consumidor con reintento y cierre con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender 4. implementa el consumidor con reintento y cierre te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en 4. implementa el consumidor con reintento y cierre como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que 4. implementa el consumidor con reintento y cierre resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 4. Implementa el consumidor con reintento y cierre se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar 4. Implementa el consumidor con reintento y cierre | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses 4. implementa el consumidor con reintento y cierre por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: 4. implementa el consumidor con reintento y cierre funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- 4. Implementa el consumidor con reintento y cierre existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve 4. implementa el consumidor con reintento y cierre en tu contexto?
2. ¿Cómo sabrías que 4. implementa el consumidor con reintento y cierre no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar 4. implementa el consumidor con reintento y cierre?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
import { Worker } from "bullmq";
import { setTimeout as delay } from "node:timers/promises";

const efectosLocales = new Set();
const worker = new Worker(
  "laboratorio-etiquetas",
  async (job) => {
    if (job.attemptsMade === 0) throw new Error("fallo deliberado del primer intento");
    if (efectosLocales.has(job.data.guia)) return { duplicado: true };
    await delay(300);
    efectosLocales.add(job.data.guia);
    return { etiqueta: job.data.guia };
  },
  { connection: { host: "127.0.0.1", port: 6379 }, concurrency: 2 },
);

worker.on("failed", (job, error) => console.log(`Falló ${job?.id}: ${error.message}`));
worker.on("completed", (job) => console.log(`Completado ${job.id}`));
worker.on("error", (error) => console.error(error.message));

async function cerrar() {
  await worker.close();
  process.exit(0);
}
process.on("SIGINT", cerrar);
process.on("SIGTERM", cerrar);
```

</details>

### 5. Ejecuta y observa

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por 5. ejecuta y observa con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender 5. ejecuta y observa te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en 5. ejecuta y observa como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que 5. ejecuta y observa resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 5. Ejecuta y observa se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar 5. Ejecuta y observa | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses 5. ejecuta y observa por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: 5. ejecuta y observa funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- 5. Ejecuta y observa existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve 5. ejecuta y observa en tu contexto?
2. ¿Cómo sabrías que 5. ejecuta y observa no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar 5. ejecuta y observa?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
node src/api.js
```

```bash
node src/trabajador-etiquetas.js
```

```bash
curl -s http://127.0.0.1:3000/salud &
curl -s 'http://127.0.0.1:3000/asignar?guia=RF-200' &
wait
```

```bash
time curl -s 'http://127.0.0.1:3000/etiqueta-sincrona?guia=RF-201'
time curl -s 'http://127.0.0.1:3000/etiqueta?guia=RF-202'
```

</details>

### 6. Verificación y cierre

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por 6. verificación y cierre con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender 6. verificación y cierre te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en 6. verificación y cierre como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que 6. verificación y cierre resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 6. Verificación y cierre se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar 6. Verificación y cierre | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses 6. verificación y cierre por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: 6. verificación y cierre funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- 6. Verificación y cierre existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve 6. verificación y cierre en tu contexto?
2. ¿Cómo sabrías que 6. verificación y cierre no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar 6. verificación y cierre?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
docker rm -f redis-laboratorio-despachos
```

</details>
