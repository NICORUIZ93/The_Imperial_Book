# Módulo 8: Patrones asíncronos avanzados

## Aprende construyendo

### Tema 1: Worker Threads para trabajo CPU-bound · Intermedio · 45 min

**Prerrequisito:** Node.js LTS, módulos ES y manejo básico de la terminal.

**Al terminar podrás:** ejecutar un cálculo intensivo en un Worker Thread, comprobar que un temporizador del hilo principal sigue respondiendo y limitar la cantidad de cálculos simultáneos.

#### Aprende

**Por qué importa:** un cálculo síncrono pesado monopoliza el hilo principal y retrasa timers, solicitudes HTTP y demás trabajo JavaScript. Un Worker Thread permite mover ese cómputo a otro hilo. No es una optimización para I/O: consultas de red o de base de datos ya usan las operaciones no bloqueantes de Node y no necesitan un Worker.

**Explicación específica:** cada Worker tiene su propia instancia de V8, su Event Loop y memoria aislada por defecto. El hilo principal entrega datos iniciales con `workerData` y se comunica después mediante `postMessage` y eventos `message`. Los valores se copian o transfieren; las variables globales no se comparten mágicamente. `SharedArrayBuffer` es un mecanismo explícito para casos avanzados, no el comportamiento predeterminado.

Crear Workers tiene coste y cada cálculo activo consume CPU. En un servidor se usa un pool acotado o un límite de concurrencia, no un Worker nuevo e ilimitado por petición. También se escuchan `message` y `error`, se valida la entrada y se termina o reutiliza cada Worker de forma deliberada.

**Analogía:** la oficina principal entrega un cálculo pesado a un especialista con un taller separado. Intercambian pedidos y resultados por mensajería; el especialista no puede modificar directamente los archivos de la oficina. Contratar más especialistas que puestos disponibles no acelera el trabajo y puede saturar el taller.

**Conceptos clave:**

- CPU-bound frente a I/O-bound: solo el primero justifica normalmente un Worker Thread.
- `workerData`, `parentPort`, `postMessage` y aislamiento de memoria.
- Concurrencia acotada, escucha de errores y finalización del Worker.
- El hilo principal coordina; no debe esperar el resultado con un bucle bloqueante.

#### Practica

Empieza en una carpeta vacía. No copies archivos de otros temas ni uses ejemplos del repositorio:

```bash
mkdir practica-worker
cd practica-worker
mkdir src
```

Crea manualmente `package.json`:

```json
{
  "name": "practica-worker",
  "private": true,
  "type": "module"
}
```

Crea `src/calcular.js` con este contenido:

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

Ejecuta:

```bash
node src/calcular.js
```

**Resultado esperado:** aparecen varios mensajes `el hilo principal responde` antes de `{ ok: true, valor: 9227465 }`. Los latidos no tienen un número exacto obligatorio; lo relevante es que continúan durante el cálculo.

**Fallo deliberado y corrección:** cambia `workerData` a `{ n: -1 }` y ejecuta de nuevo. El resultado será `{ ok: false, error: "n debe ser un entero entre 0 y 40" }`: mover código a otro hilo no valida la entrada. Corrige el valor a `35` y añade en la rama principal una validación que rechace valores fuera de rango antes de construir el Worker; conserva también la validación interna como defensa.

**Práctica guiada:** modifica únicamente `src/calcular.js` para recibir `{ a: 20, b: 25 }` en `workerData`, validar ambos enteros y devolver `fibonacci(a) + fibonacci(b)`. El resultado esperado es `81790`. Después cambia `b` por `2.5` y comprueba que el error identifica la entrada inválida; restaura los valores válidos.

**Ejercicio independiente:** crea `src/servidor.js`, sin importar archivos de otros temas, con un servidor HTTP en `127.0.0.1:3000`. Debe aceptar `/calcular?n=35`, ejecutar Fibonacci en un Worker y responder también `/salud`. Implementa una cola interna y un semáforo que permita como máximo dos Workers activos; las demás peticiones deben esperar. Termina cada Worker en `finally` y devuelve un error HTTP controlado si `n` no es válido. Ejecuta varias peticiones de cálculo y una de salud en paralelo: `/salud` debe seguir respondiendo y el contador de Workers activos nunca debe superar dos.

#### Aplica

**Transferencia al proyecto integrador «API operativa de entregas»:** mueve el cálculo pesado de asignación de rutas a un pool acotado de Workers. Mantén las consultas de disponibilidad fuera de ese pool porque son I/O. Define respuesta de error y plazo máximo para que un cálculo fallido no deje una petición pendiente.

**Checklist de salida:**

- [ ] Explicas por qué Fibonacci es CPU-bound y una consulta a PostgreSQL no se beneficia de un Worker Thread.
- [ ] El cálculo devuelve `9227465` para `n = 35` y los timers principales siguen apareciendo.
- [ ] Una entrada inválida produce un diagnóstico controlado, no una recursión sin límite.
- [ ] El servidor independiente nunca tiene más de dos Workers activos y cierra los que termina.
- [ ] Escuchas tanto el resultado como el evento `error`.

**Errores comunes:** usar Workers para I/O simple; crear uno por petición sin límite; asumir memoria global compartida; enviar objetos enormes sin medir el coste de copia; omitir `error` o `terminate`.

**Fuentes oficiales:** [Worker Threads](https://nodejs.org/api/worker_threads.html) y [no bloquear el Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop).

### Tema 2: Cluster module y balanceo entre procesos · Intermedio · 45 min

**Prerrequisito:** Node.js LTS, HTTP básico y comprensión de procesos y puertos locales.

**Al terminar podrás:** iniciar dos procesos con `cluster`, identificar qué PID atiende cada respuesta y demostrar que su estado en memoria no se comparte.

#### Aprende

**Por qué importa:** un solo proceso ejecuta JavaScript principal en un hilo y no aprovecha por sí solo todos los núcleos para ese código. `cluster` permite varios procesos de la misma aplicación escuchando un puerto común. Esto añade capacidad y aislamiento, pero también exige externalizar estado, controlar reinicios y medir el resultado.

**Explicación específica:** el proceso primario usa `cluster.fork()` y cada worker ejecuta una copia independiente de la aplicación, con su propia memoria y Event Loop. Una variable global o una sesión guardada en un objeto no es visible en otro worker. Redis, una base de datos u otro almacén compartido son necesarios cuando el estado debe ser común.

Node puede distribuir conexiones entre workers, pero no garantiza que cada petición alterne PID ni que el throughput crezca linealmente con el número de procesos. La carga, el número real de núcleos, I/O, el sistema operativo y la coordinación influyen. Empieza con pocos workers, mide y evita crear más procesos de los que la máquina puede sostener.

**Analogía:** son varias sucursales con personal e inventario propios y un repartidor central de clientes. Si una sucursal anota algo en su libreta, las demás no lo ven; necesitan un registro central. Abrir el doble de sucursales no garantiza el doble de ventas si la calle, el repartidor o el almacén ya son el cuello de botella.

**Conceptos clave:**

- `cluster.isPrimary`, `cluster.fork()` y procesos con memoria aislada.
- `os.availableParallelism()` como referencia, no como orden de usar todos los núcleos.
- Balanceo de conexiones sin garantía de throughput lineal.
- Estado compartido externo, cierre ordenado y reinicios acotados.

#### Practica

Empieza en una carpeta vacía y crea todos los archivos localmente:

```bash
mkdir practica-cluster
cd practica-cluster
mkdir src
```

Crea `package.json`:

```json
{
  "name": "practica-cluster",
  "private": true,
  "type": "module"
}
```

Crea `src/server.js`:

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

Ejecuta en una terminal:

```bash
node src/server.js
```

En otra terminal, desde la misma carpeta, realiza varias peticiones:

```bash
for i in {1..8}; do curl -s http://127.0.0.1:3000/; done
```

**Resultado esperado:** cada respuesta incluye `pid` y un contador. Normalmente aparecerá más de un PID, aunque el balanceador no promete una secuencia exacta. El contador puede repetir valores entre PIDs: cada proceso tiene su propia variable `atendidas`.

**Fallo deliberado y corrección:** interpreta inicialmente `atendidas` como total global y contrasta la suma esperada con las respuestas. El diagnóstico es memoria aislada, no pérdida aleatoria de peticiones. Corrige el diseño moviendo el contador a un almacén compartido si realmente debe ser global; no intentes sincronizarlo leyendo variables de otro proceso.

**Práctica guiada:** en la rama primaria de `src/server.js`, sustituye el reinicio ausente por una política de máximo tres reemplazos por minuto. Guarda las marcas de tiempo de los reinicios, descarta las que tengan más de 60 segundos y solo ejecuta `cluster.fork()` si quedan menos de tres. Registra un error y no reinicies cuando se alcance el límite: un fallo permanente de arranque no debe crear un bucle infinito.

Para probar una salida de forma acotada, usa exclusivamente uno de los PID que tu propio primario acaba de imprimir como `Worker local listo`:

```bash
kill -TERM PID_IMPRESO_POR_TU_PRIMARIO
```

Sustituye el texto por ese número, verifica que corresponde a esta práctica y no uses el PID del primario ni un PID de otro servicio. Observa el evento `exit` y el único reemplazo. Detén la práctica con `Ctrl+C` en su terminal.

**Ejercicio independiente:** crea `src/carga.js` que envíe 100 peticiones con `fetch`, con concurrencia máxima de 10, y mida duración total y latencias. Modifica `src/server.js` para leer `WORKERS` con valores `1` o `2`, manteniendo siempre el límite de dos. Ejecuta por separado `WORKERS=1 node src/server.js` y `WORKERS=2 node src/server.js`, y lanza `node src/carga.js` contra cada configuración. Entrega una tabla con PIDs, duración y latencia; interpreta los datos sin afirmar que dos procesos deben duplicar el throughput.

#### Aplica

**Transferencia al proyecto integrador «API operativa de entregas»:** ejecuta dos procesos de la API y alterna peticiones entre ellos. Comprueba que autorización, sesiones y estado de entregas no dependan de memoria local. Añade cierre ordenado y una política de reemplazo limitada antes de medir capacidad.

**Checklist de salida:**

- [ ] Las respuestas identifican el PID del proceso que las atendió.
- [ ] Demuestras con `atendidas` que la memoria no se comparte entre workers.
- [ ] El número de procesos está limitado y su beneficio se evalúa con mediciones.
- [ ] Los reinicios tienen un límite verificable y no forman un bucle infinito.
- [ ] Una terminación de prueba usa solo el PID local identificado en la salida del primario.

**Errores comunes:** guardar sesiones solo en memoria; crear un proceso por núcleo sin medir; esperar throughput lineal; confundir procesos con threads; reiniciar indefinidamente; matar procesos sin verificar que pertenecen a la práctica.

**Fuentes oficiales:** [`cluster`](https://nodejs.org/api/cluster.html) y [`os.availableParallelism`](https://nodejs.org/api/os.html#osavailableparallelism).

### Tema 3: Colas de trabajo con BullMQ · Intermedio · 50 min

**Prerrequisito:** Node.js LTS, Docker, Redis básico y funciones asíncronas.

**Al terminar podrás:** publicar un trabajo con identificador estable, observar un reintento con backoff y cerrar productor y consumidor sin dejar conexiones abiertas.

#### Aprende

**Por qué importa:** generar una etiqueta o enviar una notificación puede ser lento o fallar temporalmente. Encolar separa la respuesta HTTP del procesamiento, limita la concurrencia del consumidor y hace visibles los reintentos. Para una consulta rápida, en cambio, la cola añade latencia e infraestructura sin beneficio.

**Explicación específica:** el productor añade jobs a una cola de BullMQ; Redis conserva su estado y un Worker los procesa. `attempts` acota los intentos y `backoff` separa los reintentos. `jobId` evita insertar dos jobs con el mismo identificador mientras ese job existe y se conserva. La concurrencia del Worker debe ser explícita y ajustada a CPU, memoria y límites del servicio dependiente.

Un reintento puede repetir un efecto que ya ocurrió si la confirmación se perdió. Por eso el consumidor debe ser idempotente. Ni `jobId` ni una marca temporal en Redis vuelven durable por sí solos un correo enviado, un cobro o una escritura externa: la garantía debe apoyarse en una restricción única, un registro transaccional o el mecanismo idempotente del proveedor. Cierra `Worker`, `Queue` y eventos asociados al terminar.

**Analogía:** es una bandeja numerada de trabajos. Si el operador pierde momentáneamente una herramienta, vuelve a intentar la misma orden después de esperar. El número evita dos fichas iguales en la bandeja, pero el almacén de destino todavía necesita impedir que se fabrique dos veces el mismo pedido.

**Conceptos clave:**

- Productor, cola, consumidor y estado en Redis.
- `attempts`, backoff, `jobId` y concurrencia acotada.
- Reintentos ante fallos transitorios e idempotencia del efecto.
- Cierre ordenado y conservación de jobs para poder diagnosticar su estado.

#### Practica

Comienza en una carpeta vacía. Usa un contenedor propio y una versión fijada de Redis:

```bash
mkdir practica-bullmq
cd practica-bullmq
mkdir src
docker run --name redis-practica-bullmq -p 127.0.0.1:6379:6379 -d redis:7.2.5-alpine
```

Crea manualmente `package.json`:

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

Instala la dependencia declarada:

```bash
npm install
```

Crea `src/cola.js`:

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

Ejecuta:

```bash
node src/cola.js
```

**Resultado esperado:** el primer intento falla, BullMQ espera y reintenta; después aparece un evento de completado. Los tres identificadores impresos son `etiqueta-RF-100`, y el segundo `add` no inicia otro procesamiento.

**Fallo deliberado y corrección:** el primer intento ya es el fallo controlado. Si eliminaras `attempts` o intercalaras un `catch` vacío, el fallo quedaría perdido o sin diagnóstico. Conserva el lanzamiento del error, el límite de tres intentos, el backoff y el evento `failed`; esos elementos corrigen el fallo transitorio sin ocultarlo.

**Práctica guiada:** cambia el procesador para que falle siempre con `Error("proveedor no disponible")`. Ejecuta y registra tres intentos fallidos, no un bucle infinito. Corrige después el procesador para fallar solo cuando `job.attemptsMade === 0`, como en el ejemplo inicial, y verifica nuevamente la finalización. Cierra el script en ambos casos mediante el bloque `finally`.

**Ejercicio independiente:** crea `src/productor.js` y `src/consumidor.js` desde cero. El productor debe aceptar una guía por argumento, publicar con `jobId` derivado de esa guía y cerrar su `Queue`. El consumidor debe usar concurrencia dos, tres intentos con backoff y cierre ante `SIGINT`/`SIGTERM`. Simula un proveedor que registra guías procesadas y demuestra que repetir la publicación no repite el efecto local. Después explica por qué ese `Set` no sobrevive a un reinicio y qué restricción única necesitaría el almacén real.

Al terminar toda la práctica, elimina únicamente el contenedor creado aquí:

```bash
docker rm -f redis-practica-bullmq
```

#### Aplica

**Transferencia al proyecto integrador «API operativa de entregas»:** el endpoint de etiquetas debe responder con un identificador de trabajo y dejar la generación a un consumidor separado. Limita concurrencia y reintentos, registra el fallo definitivo y protege el efecto con una clave única durable en el sistema que lo ejecuta.

**Checklist de salida:**

- [ ] Redis usa una versión fijada y la conexión apunta a loopback.
- [ ] El primer fallo se reintenta y el job termina en un intento posterior.
- [ ] Publicar dos veces `etiqueta-RF-100` no crea dos procesamientos en la demostración.
- [ ] Un fallo permanente se detiene después del número configurado de intentos.
- [ ] `Worker` y `Queue` se cierran incluso cuando hay un error.
- [ ] Distingues deduplicación del job de idempotencia durable del efecto externo.

**Errores comunes:** no cerrar consumidores; concurrencia ilimitada; reintentos infinitos; ocultar errores en un `catch` vacío; confiar solo en Redis para un efecto externo crítico; eliminar jobs completados cuando el `jobId` aún se necesita para deduplicar.

**Fuentes oficiales:** [BullMQ](https://docs.bullmq.io/), [Redis](https://redis.io/docs/latest/) y [reintentos](https://docs.bullmq.io/guide/retrying-failing-jobs).

### Tema 4: PM2, memory leaks y heap snapshots · Intermedio · 50 min

**Prerrequisito:** Node.js LTS, procesos locales y Chrome DevTools para la inspección visual.

**Al terminar podrás:** reproducir una retención creciente de objetos JavaScript, comparar dos heap snapshots y aplicar una corrección que acote las referencias retenidas.

#### Aprende

**Por qué importa:** una API puede degradarse durante horas porque conserva referencias de solicitudes ya terminadas. Reiniciar con PM2 recupera temporalmente el servicio, pero no elimina la causa. Medir y comparar snapshots permite localizar qué objetos permanecen vivos.

**Explicación específica:** el garbage collector libera objetos inalcanzables; una fuga aparece cuando una referencia viva mantiene objetos que ya no se necesitan. `process.memoryUsage()` ofrece señales distintas: RSS es memoria residente del proceso, `heapUsed` es memoria usada en el heap de V8 y `external` representa memoria externa asociada, por ejemplo a ciertos `Buffer`. RSS no equivale a heap, y `heapUsed` puede subir y bajar con el GC.

`Buffer.alloc()` incrementa principalmente memoria externa para buffers grandes; no debe usarse como prueba simple de que `heapUsed` crece. Para estudiar el heap, retén objetos JavaScript. Un heap snapshot captura ese heap en un instante; comparar dos snapshots bajo una carga repetible ayuda a identificar clases y referencias que crecen. `--max-old-space-size` cambia un límite de V8, no corrige una fuga.

PM2 aporta arranque, logs y reinicio en despliegues sin orquestador. Un orquestador de contenedores puede asumir esas funciones. En ambos casos, un reinicio por memoria es una medida operativa, no un diagnóstico ni una reparación.

**Analogía:** PM2 es un supervisor que vuelve a encender una máquina detenida. El snapshot es una fotografía del almacén: comparar dos fotos muestra qué cajas se acumulan. Ampliar el almacén o vaciarlo cada noche no explica por qué siguen llegando cajas que nadie retira.

**Conceptos clave:**

- Referencias vivas, garbage collection y comparación de snapshots.
- RSS, `heapUsed` y `external` como métricas diferentes.
- Inspector ligado a `127.0.0.1`, nunca expuesto a toda la red durante la práctica.
- PM2 como supervisor; `--max-old-space-size` como límite, no como corrección.

#### Practica

Empieza en una carpeta vacía:

```bash
mkdir practica-memoria
cd practica-memoria
mkdir src
```

Crea `package.json`:

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

Instala la dependencia de desarrollo:

```bash
npm install
```

Crea `src/leak.js` con objetos JavaScript, no con buffers como sustituto de una prueba de heap:

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

Ejecuta el inspector únicamente en loopback:

```bash
node --inspect=127.0.0.1:9229 src/leak.js
```

Abre `chrome://inspect`, conecta el objetivo Node local y en **Memory** toma un snapshot A. Espera varios intervalos y toma otro B; compara los objetos retenidos. Detén el proceso con `Ctrl+C` en su terminal cuando termines.

**Resultado esperado:** `objetos` crece sin límite y el segundo snapshot conserva muchas más instancias. `heapUsedMB` puede mostrar dientes de sierra por el GC, así que no exijas crecimiento monótono en cada línea. RSS, heap y external no tienen que coincidir.

**Fallo deliberado y corrección:** la fuga deliberada es el arreglo global que conserva cada solicitud. Crea una copia corregida llamada `src/cache-limitada.js` con el mismo instrumento de métricas, pero después de cada inserción elimina las referencias más antiguas para que `retenidos.length` nunca supere 200. Ejecuta esa versión con inspector loopback y toma dos snapshots bajo el mismo ritmo: la cantidad retenida debe estabilizarse alrededor del límite, aunque las métricas sigan fluctuando.

**Práctica guiada:** en ambos archivos, etiqueta cada objeto con `solicitud` y localiza en DevTools qué arreglo lo retiene. Documenta el número de objetos y la comparación A/B antes y después de limitar la colección. No captures snapshots de un servicio productivo ni abras el inspector en `0.0.0.0`.

**Ejercicio independiente:** crea manualmente `ecosystem.config.cjs`:

```js
module.exports = {
  apps: [{ name: "memoria-academia", script: "src/cache-limitada.js", instances: 1 }],
};
```

Arranca y observa la versión corregida con:

```bash
npx pm2 start ecosystem.config.cjs
npx pm2 logs memoria-academia
```

Comprueba con otra ejecución local que `node --max-old-space-size=256 src/leak.js` cambia el margen del heap pero no detiene el crecimiento de `objetos`. Finalmente añade a `src/cache-limitada.js` una medición separada con `Buffer.alloc(1024 * 1024)` y explica qué métrica externa cambia, sin presentarla como evidencia de fuga de `heapUsed`. Detén y elimina solo esta aplicación de PM2:

```bash
npx pm2 stop memoria-academia
npx pm2 delete memoria-academia
```

#### Aplica

**Transferencia al proyecto integrador «API operativa de entregas»:** aplica una carga repetible al servicio, captura snapshots antes y después y busca referencias de peticiones terminadas. Corrige la retención y repite exactamente la carga. Usa PM2 o el orquestador para disponibilidad, pero conserva la evidencia de memoria para resolver la causa.

**Checklist de salida:**

- [ ] El ejemplo de fuga retiene objetos JavaScript y muestra crecimiento entre snapshots.
- [ ] La versión corregida limita las referencias a 200 bajo la misma carga.
- [ ] Explicas RSS, `heapUsed` y `external` sin tratarlos como equivalentes.
- [ ] `Buffer.alloc` se analiza como memoria externa, no como prueba simple de heap creciente.
- [ ] El inspector está limitado a `127.0.0.1` y los procesos de prueba se detienen.
- [ ] PM2 y `--max-old-space-size` no se presentan como correcciones de la fuga.

**Errores comunes:** medir solo RSS; esperar que `heapUsed` suba en cada lectura; confundir memoria de buffers con heap; tomar snapshots en producción sin plan; exponer el inspector; usar cachés sin límite; reiniciar sin corregir referencias.

**Fuentes oficiales:** [diagnóstico de memoria Node](https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot), [inspector](https://nodejs.org/api/inspector.html) y [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/).

### Tema 5: Redis para caché, idempotencia y Pub/Sub · Intermedio · 50 min

**Prerrequisito:** Node.js LTS, Docker, operaciones asíncronas y conceptos básicos de Redis.

**Al terminar podrás:** implementar una lectura cache-aside con TTL, comprobar una reserva atómica con `SET NX EX` y demostrar que Pub/Sub pierde mensajes cuando no hay suscriptores conectados.

#### Aprende

**Por qué importa:** una consulta repetida puede sobrecargar la fuente oficial y un comando repetido puede duplicar un efecto. Redis ayuda con caché temporal y coordinación atómica, pero cada patrón ofrece garantías distintas. Pub/Sub sirve para notificaciones en vivo, no como cola durable.

**Explicación específica:** en cache-aside se consulta Redis, se acude a la fuente oficial ante un fallo de caché y se guarda la copia con TTL. Después de una escritura se invalida la entrada relacionada. La base de datos sigue siendo el registro oficial; una caída de Redis debe tener una política explícita.

`SET clave valor NX EX segundos` combina en una operación atómica la creación solo si no existe y una expiración. Es útil para reservar un identificador y evitar ejecuciones concurrentes idénticas durante ese plazo. Sin embargo, esa marca no vuelve durable por sí sola un cobro, correo u otro efecto externo: el efecto necesita idempotencia durable en su sistema de destino o un diseño transaccional apropiado. La expiración también implica que una marca temporal no es un historial permanente.

Pub/Sub entrega a los suscriptores conectados en ese momento. Si se desconecta el suscriptor, no recupera después los mensajes publicados. Para trabajo recuperable se requiere una cola, Redis Streams u otro mecanismo con persistencia y seguimiento de consumo.

**Analogía:** la caché es una pizarra con una copia temporal del horario; el registro oficial está en otro lugar. `SET NX EX` es un sello temporal que solo se coloca una vez durante su vigencia. Pub/Sub es un anuncio por altavoz: quien no estaba presente no lo escucha después.

**Conceptos clave:**

- Cache-aside, TTL e invalidación después de modificar la fuente oficial.
- Reserva atómica con `NX` y expiración con `EX`.
- Idempotencia durable del efecto como responsabilidad adicional.
- Pub/Sub efímero frente a colas o Streams recuperables.

#### Practica

Empieza en una carpeta vacía y crea un Redis local con versión fijada:

```bash
mkdir practica-redis
cd practica-redis
mkdir src
docker run --name redis-practica-patrones -p 127.0.0.1:6379:6379 -d redis:7.2.5-alpine
```

Crea `package.json`:

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

Instala la dependencia:

```bash
npm install
```

Crea `src/app.js`:

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

Ejecuta:

```bash
node src/app.js
```

**Resultado esperado:** ambas lecturas contienen la tarifa, `llamadasAlRepositorio` es `1`, la primera reserva devuelve `OK` y la segunda `null`.

**Fallo deliberado y corrección:** elimina temporalmente `NX: true` de las dos reservas y ejecuta de nuevo. Ambas devuelven `OK`, por lo que la segunda sobrescribe la primera en lugar de rechazar el duplicado. Restaura `NX: true` en ambas llamadas y conserva `EX`; comprueba otra vez `OK` y `null`. Para un efecto externo, añade además una restricción única durable en el sistema destino.

**Práctica guiada:** cambia el TTL de `delivery:RF-100` a `EX: 2`. En `src/app.js`, lee la clave inmediatamente, espera con `await new Promise((resolve) => setTimeout(resolve, 2100))` y vuelve a leerla. El primer valor debe existir y el segundo ser `null`; la siguiente llamada a `findDeliveryCached` debe incrementar el repositorio. Después añade una función que borre `delivery:RF-100` con `del`, actualiza el valor del repositorio y verifica que la lectura posterior obtiene el estado nuevo.

**Ejercicio independiente:** crea `src/pubsub.js` desde cero:

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

Ejecuta `node src/pubsub.js`. Debes recibir solo `conectado` y la segunda publicación debe informar cero receptores. Explica por qué reconectar no recuperaría `desconectado` y qué mecanismo durable elegirías para una confirmación contable.

Al finalizar, elimina solo el contenedor de esta práctica:

```bash
docker rm -f redis-practica-patrones
```

#### Aplica

**Transferencia al proyecto integrador «API operativa de entregas»:** cachea lecturas de rutas con TTL e invalidación, reserva confirmaciones con una clave idempotente y publica cambios de panel por Pub/Sub solo cuando perder una actualización sea aceptable. Documenta la garantía durable contra efectos duplicados en la base o proveedor que realmente ejecuta el efecto.

**Checklist de salida:**

- [ ] Dos lecturas consecutivas producen una sola llamada al repositorio.
- [ ] La entrada expira y la invalidación obliga a leer el estado actualizado.
- [ ] Dos reservas con la misma clave devuelven `OK` y `null` al usar `NX EX`.
- [ ] La prueba sin `NX` muestra el fallo y la corrección restaura el comportamiento atómico.
- [ ] Pub/Sub no entrega al suscriptor desconectado y no se presenta como cola durable.
- [ ] Los clientes se cierran y la idempotencia externa no depende únicamente de una marca temporal en Redis.

**Errores comunes:** cachear sin TTL; no invalidar después de escribir; omitir `NX`; guardar secretos en URLs; no cerrar clientes; tratar Redis como única fuente de verdad sin estrategia adecuada; usar Pub/Sub para pagos o contabilidad.

**Fuentes oficiales:** [node-redis](https://github.com/redis/node-redis), [`SET` options](https://redis.io/docs/latest/commands/set/), [Pub/Sub](https://redis.io/docs/latest/develop/pubsub/) y [Redis para Node.js](https://redis.io/docs/latest/develop/clients/nodejs/).

## Laboratorio práctico

Construye una API de asignación y etiquetas desde una carpeta vacía. El laboratorio no reutiliza archivos de los temas ni ejemplos del repositorio. Comprobarás CPU fuera del hilo principal, dos procesos con memoria aislada, concurrencia acotada y una cola con reintentos.

**Al terminar podrás:** mientras dos procesos atienden HTTP, una petición de cálculo se ejecuta en un Worker Thread sin impedir `/salud`; otra petición encola una etiqueta cuyo primer intento falla y cuyo segundo se completa.

**Prerrequisitos:** Node.js LTS, Docker y tres terminales.

### 1. Crea el proyecto y Redis

```bash
mkdir laboratorio-despachos
cd laboratorio-despachos
mkdir src
docker run --name redis-laboratorio-despachos -p 127.0.0.1:6379:6379 -d redis:7.2.5-alpine
```

Crea manualmente `package.json`:

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

Ejecuta `npm install`.

### 2. Implementa el cálculo CPU-bound

Crea `src/asignacion.js`:

```js
import { parentPort, workerData } from "node:worker_threads";

let puntuacion = workerData.semilla;
for (let i = 0; i < 8_000_000; i += 1) {
  puntuacion = (puntuacion * 31 + i) % 1_000_000_007;
}
parentPort.postMessage({ guia: workerData.guia, puntuacion });
```

El bucle es carga CPU-bound deliberada; no contiene I/O.

### 3. Implementa cluster, límite de Workers y productor

Crea `src/api.js`:

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

Hay como máximo dos Workers CPU activos por proceso; con dos procesos el máximo total es cuatro. Cada proceso tiene `activos` y `esperando` propios: cluster no comparte esa memoria.

### 4. Implementa el consumidor con reintento y cierre

Crea `src/trabajador-etiquetas.js`:

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

El `Set` solo evita duplicados dentro de esta ejecución. En producción, el efecto externo necesita una clave única durable; el reintento de BullMQ no la sustituye.

### 5. Ejecuta y observa

En la primera terminal, desde `laboratorio-despachos`:

```bash
node src/api.js
```

En la segunda terminal, desde la misma carpeta:

```bash
node src/trabajador-etiquetas.js
```

En la tercera terminal, lanza una petición de salud y otra de cálculo al mismo tiempo:

```bash
curl -s http://127.0.0.1:3000/salud &
curl -s 'http://127.0.0.1:3000/asignar?guia=RF-200' &
wait
```

**Resultado esperado:** `/salud` responde mientras se calcula la asignación. Repite varias peticiones y registra los PID; no exijas una alternancia exacta ni un aumento lineal de throughput.

Compara una generación síncrona con el encolado:

```bash
time curl -s 'http://127.0.0.1:3000/etiqueta-sincrona?guia=RF-201'
time curl -s 'http://127.0.0.1:3000/etiqueta?guia=RF-202'
```

**Resultado esperado:** la ruta síncrona espera sus 300 ms de trabajo; la ruta de cola responde después de registrar el job, sin esperar el procesamiento. En la segunda terminal, `laboratorio:RF-202` falla una vez y después se completa. Publica otra vez la misma guía y verifica que el `jobId` conservado evita un job nuevo. Mide tus propios tiempos en lugar de asumir una proporción fija.

### 6. Verificación y cierre

- [ ] `/salud` responde durante `/asignar`.
- [ ] `workersCpuActivos` nunca supera dos en el proceso consultado.
- [ ] Las respuestas muestran que los procesos de cluster tienen PID y contadores independientes.
- [ ] `/etiqueta` responde antes de que el consumidor complete su trabajo.
- [ ] El fallo deliberado produce un número limitado de reintentos y luego completa.
- [ ] La duplicación por `jobId` no se confunde con idempotencia durable del efecto externo.
- [ ] No se afirma que dos procesos dupliquen automáticamente el throughput.

Detén el consumidor y la API con `Ctrl+C` en sus propias terminales. Elimina únicamente el contenedor creado por este laboratorio:

```bash
docker rm -f redis-laboratorio-despachos
```
