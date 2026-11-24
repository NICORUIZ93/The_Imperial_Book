# Módulo 25 · Performance y escalabilidad en Node

Escalar microservicios Node requiere entender dónde está el cuello: CPU, event loop, memoria, I/O, DB, red o dependencia externa. Este módulo cubre caching, profiling, memory leaks, clustering/escalado horizontal, backpressure end-to-end y load leveling.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Se ejecutan ejemplos de cache, profiling básico, leak pattern, backpressure y queue leveling. Herramientas de carga/cluster productivo se incluyen con **Nota de verificación**.

## Aprende construyendo

### Tema 1: Caching layers y invalidación · Intermedio · 120 min

Caso guía: reducir latencia de catálogo sin servir datos stale incorrectos.

#### Capas de cache

**Definición formal.** Cache almacena resultados para reutilizarlos. Puede estar en cliente, CDN, gateway, app, Redis o DB. La invalidación define cuándo un valor deja de ser válido.

**Para qué sirve.** Bajar latencia y carga en dependencias.

**Cuándo usarlo / cuándo no.** Úsalo en lecturas frecuentes y tolerantes a staleness controlado. No caches datos críticos sin estrategia de invalidación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm14-cache
cd nm14-cache
```

Crea el archivo `cache.mjs`:

```js
const cache = new Map();
function get(key, loader) {
  if (cache.has(key)) return { source: 'cache', value: cache.get(key) };
  const value = loader();
  cache.set(key, value);
  return { source: 'load', value };
}
console.log(get('p1', () => 100).source);
console.log(get('p1', () => 100).source);
```

```bash
node cache.mjs
```

**Caso de uso real.** Redis cache-aside con TTL.

**Error común.** Cache sin invalidación.

**Síntoma.** datos viejos. **Causa.** no hay TTL/evento de invalidación. **Corrección.** TTL, invalidación por evento, versionado de keys. **Señal observable.** usuarios ven precio/stock desactualizado.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `load`, `cache`.

### Tema 2: Profiling y event loop delay · Avanzado · 120 min

Caso guía: endpoint lento por CPU en el event loop.

#### Profiling

**Definición formal.** Profiling mide dónde gasta tiempo/CPU/memoria un proceso. En Node, `perf_hooks` permite medir event loop delay y timers.

**Para qué sirve.** Encontrar cuellos reales antes de optimizar.

**Cuándo usarlo / cuándo no.** Úsalo ante latencia alta/CPU alta. No optimices sin medir.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm14-prof
cd nm14-prof
```

Crea el archivo `prof.mjs`:

```js
import { performance } from 'node:perf_hooks';
const t0 = performance.now();
let sum = 0;
for (let i = 0; i < 1_000_00; i++) sum += i;
const ms = performance.now() - t0;
console.log(sum > 0);
console.log(ms >= 0);
```

```bash
node prof.mjs
```

**Caso de uso real.** `clinic flame`, `node --prof`, event loop delay en APM.

**Error común.** Optimizar por intuición.

**Síntoma.** cambios sin mejora. **Causa.** no medir hot path. **Corrección.** profiling, benchmark, carga. **Señal observable.** p95 igual tras “optimización”.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `true`.

### Tema 3: Memory leaks y heap · Avanzado · 120 min

Caso guía: proceso Node crece hasta OOMKilled.

#### Memory leak

**Definición formal.** Un memory leak ocurre cuando objetos ya no necesarios permanecen referenciados y no pueden ser recolectados por GC.

**Para qué sirve.** Detectar patrones que degradan procesos long-running.

**Cuándo usarlo / cuándo no.** Revisa siempre listeners, caches sin límite, mapas globales.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm14-mem
cd nm14-mem
```

Crea el archivo `leak.mjs`:

```js
const cache = new Map();
function add(id) { cache.set(id, { id, payload: 'x'.repeat(100) }); }
for (let i = 0; i < 1000; i++) add(i);
console.log(cache.size);
console.log(cache.has(999));
```

```bash
node leak.mjs
```

**Caso de uso real.** cache sin TTL/max size, listeners no removidos.

**Error común.** Map global como cache ilimitado.

**Síntoma.** RSS crece hasta OOM. **Causa.** referencias retenidas. **Corrección.** TTL, LRU, weak refs cuando aplique, remover listeners. **Señal observable.** heap usada crece en escalera.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `1000`, `true`. El ejemplo muestra retención; en producción se usaría límite/LRU.

### Tema 4: Escalado horizontal, clustering y load leveling · Avanzado · 120 min

Caso guía: absorber picos sin bloquear el event loop.

#### Escalado y colas

**Definición formal.** Escalado horizontal agrega instancias; clustering usa múltiples procesos. Load leveling usa una cola/buffer para suavizar picos.

**Para qué sirve.** Aumentar capacidad y proteger el sistema ante bursts.

**Cuándo usarlo / cuándo no.** Horizontal para stateless; colas para picos asincrónicos. No escales horizontalmente si el estado es local no compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm14-scale
cd nm14-scale
```

Crea el archivo `queue.mjs`:

```js
const queue = [];
function enqueue(job) { queue.push(job); return queue.length; }
function drain(max) { return queue.splice(0, max).length; }
enqueue('a'); enqueue('b'); enqueue('c');
console.log(drain(2));
console.log(queue.length);
```

```bash
node queue.mjs
```

**Caso de uso real.** BullMQ/SQS/RabbitMQ para trabajos; HPA para réplicas HTTP.

**Error común.** Escalar pods con estado en memoria.

**Síntoma.** comportamiento inconsistente entre requests. **Causa.** sesión/cache local. **Corrección.** externalizar estado (Redis/DB) o sticky sessions con cuidado. **Señal observable.** usuario ve datos distintos por réplica.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `2`, `1`.

## Cierre

Performance en Node es principalmente control de espera, CPU en event loop, memoria y cuellos externos. Escalar sin medir solo mueve el cuello de botella.

## Checklist

- Cache con TTL/invalidation.
- Profiling antes de optimizar.
- Sin caches globales ilimitadas.
- Estado compartido externalizado para escalar horizontalmente.
- Backpressure/load leveling en picos.
