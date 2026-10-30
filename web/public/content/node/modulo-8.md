# Módulo 8: Patrones asíncronos avanzados


## Aprende construyendo

### Tema 1: Worker Threads para trabajo CPU-bound

#### Paso 1 · Objetivo y preparación

Al finalizar podrás mover un cálculo CPU-bound fuera del hilo principal. **Prerrequisitos:** Node LTS y módulos ES; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API que calcula rutas o genera un informe puede bloquear todas las solicitudes mientras procesa. Un Worker conserva receptivo el servidor.

#### Paso 3 · Teoría y analogía aplicada

El hilo principal coordina; un Worker ejecuta JavaScript en otro hilo con memoria aislada. Es como entregar una tarea pesada a otro especialista y recibir un resultado por mensajería, no compartir variables mágicamente.

Ya separas I/O de CPU. El siguiente tema distribuirá procesos completos con `cluster` desde otra carpeta.

**Errores comunes:** crear un Worker por petición sin límite; compartir estado como si fuera global; olvidar escuchar `error`; enviar objetos enormes; usar Worker para I/O simple.

**Fuentes oficiales:** [Worker Threads](https://nodejs.org/api/worker_threads.html) y [no bloquear el Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop).

**Evidencia de aprendizaje:** entrega la salida del Worker, un input rechazado y la comparación de tiempos.

**Conceptos clave:** hilo separado con su propia instancia de V8, `workerData`, paso de mensajes.

Un Worker Thread de Node ejecuta JavaScript en un hilo genuinamente separado, cada uno con su propia instancia completa de V8 (a diferencia de los Web Workers del navegador estudiados en el Módulo 10 del track de JavaScript, que comparten conceptualmente el mismo principio de aislamiento pero en un contexto distinto), permitiendo ejecutar cómputo intensivo de CPU (procesar una imagen grande, realizar cálculos matemáticos pesados, comprimir datos) sin bloquear el Event Loop del hilo principal, que permanece libre para seguir atendiendo otras peticiones concurrentes de la aplicación mientras el Worker procesa en paralelo.

Crear un Worker (`new Worker("./procesar-imagen.js", { workerData: {...} })`) le pasa datos iniciales mediante `workerData`, y la comunicación posterior entre el hilo principal y el Worker ocurre mediante paso de mensajes asíncronos (`worker.postMessage()` para enviar, el evento `message` para recibir), exactamente el mismo modelo de comunicación que los Web Workers del navegador, reflejando que ambos comparten el mismo principio fundamental: sin memoria compartida por defecto entre hilos (salvo mediante `SharedArrayBuffer` para casos avanzados específicos que requieren compartir memoria explícitamente), cada hilo opera de forma aislada, comunicándose exclusivamente mediante mensajes serializables.

Identificar correctamente qué trabajo es genuinamente CPU-bound (y por tanto candidato apropiado para un Worker Thread) frente a I/O-bound (que ya se beneficia del modelo no bloqueante nativo de Node sin necesitar ningún Worker adicional, como se estudió en el Módulo 0) es la decisión de diseño central: mover trabajo de I/O (como una consulta a base de datos) a un Worker Thread no aporta ningún beneficio real, porque ese trabajo ya no bloquea el hilo principal en absoluto gracias a libuv; los Worker Threads solo aportan valor real para cómputo síncrono y pesado que, de otro modo, monopolizaría el único hilo de JavaScript disponible durante toda su ejecución.

**Analogía:** un Worker Thread es como contratar temporalmente a un especialista externo con su propio taller completo y separado para realizar una tarea de manufactura pesada específica, comunicándose con la oficina principal únicamente mediante pedidos y entregas formales (mensajes), sin que el especialista tenga acceso directo a los archivos internos de la oficina principal, y sin que su trabajo pesado interrumpa la atención normal a los clientes que la oficina principal sigue recibiendo mientras tanto.

**¿Por qué es importante?** Los Worker Threads son la herramienta correcta y específica para cómputo pesado CPU-bound que, de otro modo, bloquearía perceptiblemente el Event Loop principal, sin aportar ningún beneficio para trabajo I/O-bound que Node ya maneja de forma no bloqueante de forma nativa.

**Código del ejemplo:**

```js
import { Worker } from "node:worker_threads";
const worker = new Worker("./procesar-imagen.js", { workerData: { ruta: "foto.png" } });
worker.on("message", (resultado) => console.log("listo:", resultado));
// El event loop principal NUNCA se bloquea; el trabajo pesado corre en otro hilo
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Mueve un cálculo pesado de asignación a un Worker y mantén consultas ligeras disponibles. Prueba fallo del Worker y plazo agotado con una respuesta controlada al cliente.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-worker
cd ejemplo-worker
npm init -y
mkdir src
```

Crea `src/calcular.js`:

```js
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
function fibonacci(n) { return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2); }
if (!isMainThread) parentPort.postMessage(fibonacci(workerData.n));
else {
  const worker = new Worker(new URL(import.meta.url), { workerData: { n: 35 } });
  worker.on("message", (resultado) => console.log({ resultado }));
  worker.on("error", (error) => console.error("Worker falló:", error.message));
}
```

Ejecuta `node src/calcular.js`. **Resultado esperado:** `{ resultado: 9227465 }`. **Fallo deliberado y diagnóstico:** pasa `n: -1`; la función devuelve un valor inválido, demostrando que el Worker no reemplaza validación de entrada.

#### Paso 5 · Práctica guiada

Envía dos números al Worker y valida que sean enteros positivos. **Pista:** usa `workerData` como entrada inmutable.

#### Paso 6 · Práctica independiente

Mide un cálculo en el hilo principal y otro en Worker, entregando duración y capacidad de atender un timer durante el trabajo.

#### Paso 7 · Cierre y conexión

### Tema 2: Cluster module y balanceo entre procesos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás iniciar procesos Worker y repartir conexiones HTTP. **Prerrequisitos:** Node LTS y HTTP básico; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Un servidor necesita aprovechar varios núcleos y aislar un fallo de proceso. `cluster` permite varios procesos escuchando el mismo puerto, con complejidad operativa adicional.

#### Paso 3 · Teoría y analogía aplicada

El proceso primario coordina; cada worker tiene memoria y event loop propios. Es un equipo de ventanillas: una caída no comparte variables con las demás, y el balanceo debe observarse.

Ya entiendes memoria aislada y balanceo básico. El siguiente tema usará una cola para desacoplar trabajos.

**Errores comunes:** compartir estado en memoria; multiplicar workers sin medir; no cerrar conexiones; reiniciar fallos infinitamente; confundir cluster con threads.

**Fuentes oficiales:** [`cluster`](https://nodejs.org/api/cluster.html) y [`os.availableParallelism`](https://nodejs.org/api/os.html#osavailableparallelism).

**Evidencia de aprendizaje:** entrega la salida con PIDs de dos respuestas y el diagnóstico de un worker detenido.

**Conceptos clave:** un proceso por núcleo, memoria aislada, balanceo automático de conexiones.

El módulo `cluster` permite bifurcar múltiples procesos Node completamente independientes (cada uno ejecutando una copia idéntica de la aplicación), típicamente uno por núcleo de CPU disponible (`os.availableParallelism()`), aprovechando así todos los núcleos del servidor, algo que un único proceso Node de un solo hilo no puede hacer por sí solo (recordando que el hilo único de JavaScript de un proceso Node individual, por diseño, solo puede aprovechar un núcleo de CPU a la vez para ejecutar código JavaScript, aunque libuv internamente use un pool de hilos para I/O). El proceso primario (`cluster.isPrimary`) bifurca los procesos trabajadores con `cluster.fork()`, y cada proceso trabajador ejecuta de forma independiente la aplicación completa (por ejemplo, arrancando su propia instancia del servidor Express).

A diferencia de los Worker Threads del Tema 1, cada proceso de `cluster` tiene memoria completamente aislada del sistema operativo (son procesos genuinamente separados, no hilos dentro del mismo proceso), lo que significa que no pueden compartir estado en memoria directamente entre sí (una variable global en un proceso trabajador no es visible para otro proceso trabajador distinto): cualquier estado que necesite compartirse entre los procesos trabajadores del cluster (como una sesión de usuario, o una caché compartida) debe externalizarse hacia un almacén compartido accesible por todos, como Redis, en vez de asumir que el estado en memoria de un proceso trabajador es accesible desde otro.

Node balancea automáticamente las conexiones entrantes entre los procesos trabajadores del cluster (típicamente mediante un algoritmo round-robin en la mayoría de sistemas operativos), permitiendo que una aplicación aproveche efectivamente todos los núcleos de CPU disponibles del servidor para atender tráfico concurrente, multiplicando la capacidad de throughput total del servidor de forma proporcional (aproximadamente) al número de núcleos disponibles, especialmente beneficioso quando la carga incluye trabajo de cómputo real además de I/O puro.

**Analogía:** el cluster module es como abrir múltiples sucursales idénticas de la misma tienda, cada una con su propio personal y su propio inventario completamente independiente, con un sistema central que dirige automáticamente a cada cliente entrante hacia una sucursal disponible; a diferencia de un Worker Thread (como un especialista dentro de la misma sucursal), estas sucursales no comparten directamente su inventario interno entre sí, requiriendo un almacén central compartido si necesitan coordinar información entre ellas.

**¿Por qué es importante?** El módulo cluster permite que una aplicación Node aproveche todos los núcleos de CPU de un servidor, multiplicando su capacidad de throughput, a costa de requerir externalizar cualquier estado compartido hacia un almacén accesible por todos los procesos, dado el aislamiento completo de memoria entre ellos.

**Código del ejemplo:**

```js
import cluster from "node:cluster";
import { availableParallelism } from "node:os";

if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) cluster.fork(); // un proceso por núcleo
} else {
  arrancarServidorExpress(); // cada worker corre su propia copia, con memoria AISLADA
}
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Ejecuta dos procesos de API y verifica que no dependen de una sesión almacenada solo en memoria. Una petición atendida por otro proceso debe conservar autorización y estado consistente.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-cluster
cd ejemplo-cluster
npm init -y
mkdir src
```

Crea `src/server.js`:

```js
import cluster from "node:cluster";
import http from "node:http";
import os from "node:os";
if (cluster.isPrimary) {
  const cantidad = Math.min(2, os.availableParallelism());
  for (let i = 0; i < cantidad; i += 1) cluster.fork();
  console.log(`Primary ${process.pid}: ${cantidad} workers`);
} else {
  http.createServer((_req, res) => res.end(`worker=${process.pid}\n`)).listen(3000);
}
```

Ejecuta `node src/server.js` y realiza varias peticiones con `curl`. **Resultado esperado:** responde más de un PID. **Fallo deliberado y diagnóstico:** mata un worker; el primario detecta su salida, pero las solicitudes en curso de ese proceso se pierden: necesitas supervisión y reintentos.

#### Paso 5 · Práctica guiada

Registra `cluster.on("exit")` y crea un reemplazo limitado. **Pista:** evita un bucle infinito si el código falla al iniciar.

#### Paso 6 · Práctica independiente

Compara una instancia y dos workers bajo carga ligera; entrega PIDs y latencia, sin afirmar que más procesos siempre es mejor.

#### Paso 7 · Cierre y conexión

### Tema 3: Colas de trabajo con BullMQ

#### Paso 1 · Objetivo y preparación

Al finalizar podrás publicar y consumir un trabajo con reintento. **Prerrequisitos:** Node LTS, Docker y Redis; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Generar una etiqueta o enviar una notificación no debe mantener abierta la petición HTTP. Una cola permite responder pronto y procesar después. **¿Por qué es importante?** Sin una cola, un pico de trabajo agota el proceso que atiende HTTP; con ella, el fallo se reintenta y se mide en lugar de perderse en una petición que ya respondió.

#### Paso 3 · Teoría y analogía aplicada

Productor publica, worker consume y Redis conserva el estado. Es una bandeja numerada: si un operador falla, el trabajo puede reintentarse sin duplicar el efecto.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-bullmq
cd ejemplo-bullmq
npm init -y
npm install bullmq
mkdir src
docker run --name redis-academia -p 6379:6379 -d redis:7-alpine
```

Crea `src/cola.js`:

```js
import { Queue, Worker } from "bullmq";
const connection = { host: "127.0.0.1", port: 6379 };
const queue = new Queue("etiquetas", { connection });
const worker = new Worker("etiquetas", async (job) => {
  console.log("procesando", job.id, job.data.guia);
}, { connection });
await queue.add("generar", { guia: "RF-100" }, { attempts: 2 });
await new Promise((resolve) => worker.on("completed", resolve));
await worker.close(); await queue.close();
console.log("trabajo completado");
```

Ejecuta `node src/cola.js`. **Resultado esperado:** procesamiento y completado. **Fallo deliberado y diagnóstico:** detén Redis antes de ejecutar; aparece un error de conexión, no una etiqueta “completada”. Elimina con `docker rm -f redis-academia`.

#### Paso 5 · Práctica guiada

Haz que el worker falle una vez y reintente. **Pista:** cuenta intentos por `job.attemptsMade`.

#### Paso 6 · Práctica independiente

Añade idempotencia por `jobId` y entrega evidencia de que publicar dos veces no duplica el efecto.

#### Paso 7 · Cierre y conexión

Ya desacoplas solicitudes y trabajos lentos. El siguiente tema observará procesos y memoria.

Encolar el trabajo lento en vez de ejecutarlo en el mismo request es el mismo patrón que necesitará el proyecto integrador (API productiva, Módulo 12) para tareas como enviar una notificación o generar un reporte: el endpoint responde de inmediato y un worker separado procesa el job a su propio ritmo.

**Cuándo no usarlo:** para una operación que ya es rápida (una consulta simple a la base de datos), agregar una cola introduce latencia adicional (el viaje a Redis) y una pieza de infraestructura más para operar sin ningún beneficio real; resérvala para trabajo genuinamente lento o que deba sobrevivir a un reinicio del proceso que lo encoló.

**Errores comunes:** no cerrar workers; repetir efectos sin idempotencia; usar Redis sin persistencia para datos críticos; ocultar fallos en un catch vacío.

**Fuentes oficiales:** [BullMQ](https://docs.bullmq.io/), [Redis](https://redis.io/docs/latest/) y [reintentos](https://docs.bullmq.io/guide/retrying-failing-jobs).

**Evidencia de aprendizaje:** entrega la salida de éxito, conexión fallida y reintento.

### Tema 4: PM2, memory leaks y heap snapshots

#### Paso 1 · Objetivo y preparación

Al finalizar podrás observar crecimiento de heap y obtener un snapshot. **Prerrequisitos:** Node LTS, Chrome DevTools opcional y una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API que retiene arrays por cada solicitud se degrada lentamente. Reiniciar el proceso oculta el síntoma; medir heap permite encontrar la referencia retenida.

#### Paso 3 · Teoría y analogía aplicada

El garbage collector libera objetos sin referencias. Una fuga conserva referencias vivas innecesarias, como guardar todas las cajas entregadas en una bodega “temporal”.

Ya puedes observar una fuga en vez de reiniciar a ciegas. El siguiente tema usará Redis para caché e idempotencia.

**Errores comunes:** medir solo RSS; tomar snapshots en producción sin plan; cachear sin límite; confundir Buffer externo con heap; reiniciar sin corregir.

**Fuentes oficiales:** [diagnóstico de memoria Node](https://nodejs.org/en/learn/diagnostics/memory/using-heap-snapshot), [inspector](https://nodejs.org/api/inspector.html) y [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/).

**Evidencia de aprendizaje:** entrega dos salidas de memoria y la explicación de la referencia retenida.

**Conceptos clave:** gestión de procesos, `--max-old-space-size`, snapshots de heap.

PM2 es un gestor de procesos para aplicaciones Node que, en un modelo de despliegue previo a la adopción generalizada de contenedores y orquestadores, proporcionaba reinicio automático ante fallos, logs centralizados y su propia forma de clustering integrado directamente sobre un servidor. En un mundo con Docker y Kubernetes (estudiados en el track DevOps), muchas de estas responsabilidades las asume el propio orquestador (`restart: always` en Kubernetes reemplaza gran parte de lo que PM2 gestionaba antes directamente sobre el sistema operativo), aunque PM2 sigue siendo relevante en despliegues que no usan contenedores, o como herramienta de desarrollo local para gestionar múltiples procesos fácilmente.

`--max-old-space-size` es un flag de V8 (accesible mediante `node --max-old-space-size=4096 script.js`) que ajusta el límite de memoria asignado a la "generación vieja" del heap (el modelo de recolección generacional estudiado en el Módulo 5 del track de JavaScript), relevante para procesos Node que necesitan manejar volúmenes de datos considerables en memoria y que, sin este ajuste, podrían alcanzar el límite por defecto de V8 y fallar con un error de memoria agotada, incluso en un servidor con considerablemente más RAM física disponible de la que V8 usaría por defecto sin este ajuste explícito.

Un heap snapshot captura el estado completo de la memoria del heap de un proceso Node en un momento específico, permitiendo inspeccionar exactamente qué objetos están ocupando memoria y, comparando dos snapshots tomados en momentos distintos durante la ejecución normal de la aplicación, identificar objetos que crecen de forma sostenida y sospechosa en cantidad entre ambos snapshots (una señal característica de una fuga de memoria, el mismo concepto de "referencias mantenidas innecesariamente vivas" estudiado en el Módulo 5 del track de JavaScript, ahora aplicado al diagnóstico específico de un proceso de servidor Node de larga duración). Herramientas como Chrome DevTools (conectadas vía `--inspect`, Módulo 7) permiten tomar y comparar heap snapshots directamente sobre un proceso Node en ejecución, sin necesidad de herramientas adicionales especializadas más allá de las ya disponibles en el navegador.

**Analogía:** PM2 es como un supervisor de turno que reinicia automáticamente una máquina que se detiene inesperadamente; un heap snapshot es como una fotografía detallada del inventario completo de un almacén en un momento específico, y comparar dos fotografías tomadas en momentos distintos revela qué categorías de artículos se están acumulando sospechosamente sin ser retirados nunca, una señal de que algo en el proceso de gestión del almacén no está liberando correctamente el espacio que ya no necesita.

**¿Por qué es importante?** Entender PM2 en contraste con las responsabilidades que asume un orquestador de contenedores, y saber usar heap snapshots para diagnosticar fugas de memoria reales en un proceso Node de larga duración, son habilidades operativas esenciales para mantener aplicaciones Node saludables en producción.

**Prueba en terminal:**

```bash
node --max-old-space-size=4096 servidor.js   # ajusta el límite de memoria de V8
# Chrome DevTools (--inspect) → pestaña Memory → tomar snapshot A → esperar → snapshot B
# comparar A vs B: ¿qué tipo de objeto creció sospechosamente entre ambos?
```

---

**Transferencia al proyecto integrador «API operativa de entregas»:** Obtén snapshots del servicio antes y después de una carga repetible. Localiza referencias retenidas de peticiones terminadas y demuestra con la misma carga que la corrección reduce el crecimiento.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-memory-leak
cd ejemplo-memory-leak
npm init -y
mkdir src
```

Crea `src/leak.js`:

```js
const retenidos = [];
setInterval(() => {
  retenidos.push(Buffer.alloc(1024 * 100));
  const { heapUsed } = process.memoryUsage();
  console.log(`objetos=${retenidos.length} heap=${Math.round(heapUsed / 1024)}KB`);
}, 100);
```

Ejecuta `node --inspect=0.0.0.0:9229 src/leak.js` y observa memoria. **Resultado esperado:** la cantidad retenida crece. **Fallo deliberado y diagnóstico:** comenta la referencia `retenidos`; el heap deja de crecer de la misma forma. Detén con `Ctrl+C`.

#### Paso 5 · Práctica guiada

Captura un snapshot con `node --heapsnapshot-signal=SIGUSR2` en macOS/Linux. **Pista:** realiza la captura solo en un proceso de prueba.

#### Paso 6 · Práctica independiente

Reescribe el ejemplo con una caché de tamaño limitado y entrega una comparación antes/después.

#### Paso 7 · Cierre y conexión

### Tema 5: Redis para caché, idempotencia y Pub/Sub

#### Paso 1 · Objetivo y preparación

Al finalizar podrás guardar una respuesta temporal y rechazar un mensaje duplicado. **Prerrequisitos:** Node LTS, Docker y Redis; ejemplo desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una consulta de tarifas repetida puede saturar un servicio externo; una orden duplicada puede cobrar dos veces. Caché e idempotencia resuelven problemas distintos.

#### Paso 3 · Teoría y analogía aplicada

TTL expira datos; una clave idempotente registra que un comando ya fue procesado. Pub/Sub notifica en vivo pero no es una cola durable. Son notas con caducidad, recibos únicos y anuncios separados.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-redis
cd ejemplo-redis
npm init -y
npm install redis
mkdir src
docker run --name redis-demo -p 6379:6379 -d redis:7-alpine
```

Crea `src/app.js`:

```js
import { createClient } from "redis";
const redis = createClient({ url: "redis://127.0.0.1:6379" });
await redis.connect();
await redis.set("tarifa:co", "12500", { EX: 30 });
const primera = await redis.set("orden:RF-100", "procesada", { NX: true, EX: 3600 });
const segunda = await redis.set("orden:RF-100", "procesada", { NX: true, EX: 3600 });
console.log({ tarifa: await redis.get("tarifa:co"), primera, segunda });
await redis.quit();
```

Ejecuta `node src/app.js`. **Resultado esperado:** primera operación `OK`, segunda `null`. **Fallo deliberado y diagnóstico:** elimina `NX: true`; ambas escrituras devuelven `OK`, demostrando el riesgo de duplicación. Detén con `docker rm -f redis-demo`.

#### Paso 5 · Práctica guiada

Añade TTL de 2 segundos y comprueba que la tarifa desaparece. **Pista:** mide el valor antes y después de esperar.

#### Paso 6 · Práctica independiente

Publica un evento con Pub/Sub y documenta qué ocurre si el suscriptor está desconectado; no lo presentes como persistencia.

#### Paso 7 · Cierre y conexión

Ya distingues caché, idempotencia y notificación. El siguiente módulo abordará observabilidad desde una carpeta nueva.

**Errores comunes:** cachear sin TTL; usar `SET` sin NX para comandos únicos; confundir Pub/Sub con cola durable; no cerrar cliente; guardar secretos en URL.

**Fuentes oficiales:** [node-redis](https://github.com/redis/node-redis), [`SET` options](https://redis.io/docs/latest/commands/set/) y [Pub/Sub](https://redis.io/docs/latest/develop/pubsub/).

**Evidencia de aprendizaje:** entrega la salida `OK/null`, la expiración y una prueba de evento perdido.

**Objetivo:** reducir lecturas repetidas de entregas, impedir comandos duplicados y comunicar cambios efímeros entre procesos con Redis.

**¿Por qué es importante?** Redis mantiene datos en memoria y ofrece operaciones atómicas. Eso lo hace útil como caché y coordinador de claves de idempotencia, pero no convierte Pub/Sub en una cola durable: un suscriptor desconectado pierde los mensajes. Elegir correctamente cada uso evita datos obsoletos y falsas garantías de entrega.

**Contexto:** miles de conductores consultan el mismo detalle de ruta, mientras la confirmación de una entrega puede repetirse por mala señal. La caché reduce carga sobre PostgreSQL; una clave atómica evita aplicar dos veces el mismo evento; Pub/Sub actualiza paneles en vivo cuando perder una notificación temporal es aceptable.

**Analogía:** la caché es una pizarra con una copia temporal del horario. La base de datos sigue siendo el registro oficial. `SET NX` es un sello que solo puede colocarse una vez, y Pub/Sub es un anuncio por altavoz: quien no estaba presente no lo escucha.

**Conceptos clave**

- Cache-aside: consultar Redis, acudir a la base ante un fallo de caché y guardar con TTL.
- Invalidación: después de modificar la fuente oficial, borrar la copia relacionada.
- `SET key value NX EX seconds` combina exclusión y expiración de forma atómica.
- Pub/Sub entrega a suscriptores conectados; Streams o una cola sirven para procesamiento recuperable.

**Demostración guiada:** crea `demo-api/packages/api/src/infrastructure/redis-delivery-cache.js`.

```js
import { createClient } from 'redis';

export const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', (error) => console.error({ error }, 'redis_error'));

export async function findDeliveryCached(id, repository) {
  const key = `delivery:${id}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const delivery = await repository.findById(id);
  if (delivery) await redis.set(key, JSON.stringify(delivery), { EX: 60 });
  return delivery;
}

export async function reserveCommand(commandId) {
  const result = await redis.set(`command:${commandId}`, 'processing', {
    NX: true,
    EX: 300,
  });
  return result === 'OK';
}

export async function invalidateDelivery(id) {
  await redis.del(`delivery:${id}`);
  await redis.publish('delivery.changed', JSON.stringify({ id }));
}
```

Ejecuta desde `demo-api/packages/api`:

```bash
docker run --name demo-redis -p 6379:6379 redis:7-alpine
npm install redis
REDIS_URL='redis://localhost:6379' npm test -- redis-cache
```

**Resultado esperado:** la primera consulta llama al repositorio y la segunda usa Redis; después de invalidar vuelve a consultar. Dos reservas con el mismo `commandId` producen `true` y `false`, nunca dos `true`.

**Práctica guiada:** añade un contador al repositorio falso y verifica que dos lecturas consecutivas solo lo incrementan una vez. Actualiza la entrega, ejecuta `invalidateDelivery` y comprueba que la siguiente lectura refleja el nuevo estado.

**Pista:** prueba comportamiento, no detalles internos: observa llamadas al repositorio, resultado retornado y expiración. Usa claves con prefijos estables.

**Práctica independiente:** crea un suscriptor para `delivery.changed`, desconéctalo durante una publicación y documenta la pérdida. Repite el caso con Redis Streams y explica por qué el segundo puede recuperarse.

**Errores comunes**

1. Tratar Redis como única fuente de verdad sin estrategia de persistencia.
2. Usar Pub/Sub para pagos o contabilidad: no conserva mensajes para consumidores ausentes.
3. Crear claves sin TTL: acumulan memoria indefinidamente.
4. Actualizar la base sin invalidar la caché: entrega información obsoleta.

**Cierre:** aprendiste tres capacidades distintas de Redis y sus límites. El siguiente paso es medir si la caché realmente mejora latencia y observar el flujo completo con métricas y trazas. Recurso oficial: [Redis para Node.js](https://redis.io/docs/latest/develop/clients/nodejs/).

---

**Transferencia al proyecto integrador «API operativa de entregas»:** Distingue caché de lectura y registro de idempotencia de confirmaciones. Prueba expiración, caída de Redis y reintento; documenta dónde se conserva la garantía durable de no duplicar efectos.

## Laboratorio práctico

**Objetivo del laboratorio:** mover trabajo CPU-bound a un Worker Thread, aprovechar múltiples núcleos con cluster, y desacoplar trabajo pesado con una cola BullMQ.

**Requisitos previos:** Docker (para Redis), Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Identificar una tarea CPU-bound | Ej. procesar una imagen grande | Muévela a un `worker_thread` |
| 2 | Verificar que el event loop principal no se bloquea | Petición concurrente mientras el worker procesa | Confirma que la API sigue respondiendo normalmente |
| 3 | Configurar cluster | Ver Tema 2 | Un proceso por núcleo, verifica el balanceo de requests |
| 4 | Levantar Redis y configurar BullMQ | `docker run redis`, `new Queue(...)` | Encola un job de "enviar email" |
| 5 | Configurar reintentos con backoff | Ver Tema 3 | Simula un fallo del servicio de email y verifica los reintentos |
| 6 | Medir la diferencia de latencia | Endpoint que encola vs uno que procesa síncronamente | Compara los tiempos de respuesta reales |

**Verificación:** el laboratorio se considera exitoso si el endpoint que usa la cola responde considerablemente más rápido que el equivalente síncrono, y si los reintentos con backoff se ejecutan correctamente ante un fallo simulado del servicio externo.

**Errores comunes y soluciones**

- **Mover trabajo I/O-bound (como una consulta a base de datos) a un Worker Thread.** Esto no aporta ningún beneficio real; Node ya maneja I/O de forma no bloqueante de forma nativa.
- **Asumir que el estado en memoria se comparte entre procesos de cluster.** Cada proceso tiene memoria aislada; externaliza cualquier estado compartido hacia Redis u otro almacén accesible por todos.
- **No limitar el número de reintentos en una cola de trabajo.** Sin un límite (`attempts`), un job que falla permanentemente podría reintentarse indefinidamente sin ningún beneficio real.

---
