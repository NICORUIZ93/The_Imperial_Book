# Módulo 13 · Node.js moderno

**Entorno de referencia (2026-05-22):** Node.js v24.18.0. Se verifican ES6+, async/await, event loop, worker threads, streams/backpressure y shutdown con Node.

## Aprende construyendo

### Tema 1: ES6+: async/await, Promises, destructuring, modules · Intermedio · 120 min

#### Promises y async/await

**Definición formal.** Una Promise representa un valor eventual; `async/await` es sintaxis sobre Promises para flujo asíncrono legible.

**Para qué sirve.** Manejo de I/O asíncrono.

**Cuándo usarlo y cuándo no.** Úsalo en I/O; maneja errores con try/catch.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "async function main(){ const v=await Promise.resolve(42); console.log(v)} main()"
```

**Caso de uso real.** Llamada HTTP async.

**Error común.** Olvidar `await` o no manejar rechazo. Corrección: try/catch y lint.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `42`.

#### Destructuring y modules

**Definición formal.** Destructuring extrae valores de objetos/arrays; módulos ES permiten importar/exportar.

**Para qué sirve.** Código claro y composición.

**Cuándo usarlo y cuándo no.** Úsalo para claridad; no destructures en exceso.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const o={a:1,b:2}; const {a}=o; console.log(a)"
```

**Caso de uso real.** Extraer campos de config.

**Error común.** Destructurar undefined. Corrección: defaults.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `1`.

### Tema 2: TypeScript: tipos, interfaces, generics, strict mode · Intermedio · 120 min

#### Tipado estático en TS

**Definición formal.** TypeScript añade tipos estáticos sobre JavaScript, verificados en compilación.

**Para qué sirve.** Detecta errores antes de runtime.

**Cuándo usarlo y cuándo no.** Úsalo en bases medianas/grandes. No uses `any` como escape habitual.

**Ejemplo mínimo enfocado (ejecutable con tsc si disponible).**

```bash
mkdir -p /tmp/ms17-ts && cd /tmp/ms17-ts
cat > main.ts << 'TS'
interface User { id: number; name: string }
function greet(u: User): string { return `hi ${u.name}` }
console.log(greet({id:1,name:'Ada'}))
TS
npx -p typescript tsc --strict --target es2022 --module nodenext --moduleResolution nodenext main.ts && node main.js
```

**Caso de uso real.** DTOs tipados.

**Error común.** `any` ocultando bugs. Corrección: `strict`, `unknown`.

**Verificación (tsc 7.0.2, Node 24.18.0, 2026-05-22).** Salida: `hi Ada`.

#### Generics

**Definición formal.** Parámetros de tipo que permiten reutilizar código con seguridad de tipos.

**Para qué sirve.** APIs reutilizables.

**Cuándo usarlo y cuándo no.** Úsalo en colecciones/wrappers. No sobrecomplicar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms17-g && cd /tmp/ms17-g
cat > g.ts << 'TS'
function id<T>(v:T):T{return v}
console.log(id<number>(7))
TS
npx -p typescript tsc --strict --target es2022 --module nodenext --moduleResolution nodenext g.ts && node g.js
```

**Caso de uso real.** `Result<T,E>`.

**Error común.** Generics innecesarios. Corrección: YAGNI.

**Verificación (2026-05-22).** Salida: `7`.

### Tema 3: Event Loop: fases, microtasks, macrotasks · Avanzado · 120 min

#### Event loop

**Definición formal.** Mecanismo que procesa callbacks/tareas en fases, con microtasks (Promises) con prioridad antes de continuar.

**Para qué sirve.** Entender orden de ejecución async.

**Cuándo usarlo y cuándo no.** Conocerlo para evitar bloquearlo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "setTimeout(()=>console.log('timeout'),0); Promise.resolve().then(()=>console.log('micro')); console.log('sync')"
```

**Caso de uso real.** Debug de orden async.

**Error común.** CPU pesada en event loop. Corrección: worker thread.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `sync`, `micro`, `timeout`.

### Tema 4: perf_hooks y clinic.js · Avanzado · 90 min

#### perf_hooks

**Definición formal.** API de Node.js para medir rendimiento (timing, histogramas, performance observers).

**Para qué sirve.** Medir latencia y cuellos.

**Cuándo usarlo y cuándo no.** Úsalo para medir; no optimices a ciegas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const {performance}=require('node:perf_hooks'); const t=performance.now(); for(let i=0;i<1e6;i++); console.log(performance.now()>t)"
```

**Caso de uso real.** Medir handler.

**Error común.** Microbenchmarks irrelevantes. Corrección: medir en carga realista.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`. **Nota:** clinic.js requiere instalación global/tooling.

### Tema 5: Worker Threads vs Child Processes · Avanzado · 120 min

#### Worker Threads

**Definición formal.** Hilos dentro del mismo proceso Node.js que comparten memoria opcional (SharedArrayBuffer) y se comunican por mensajes.

**Para qué sirve.** CPU-bound sin bloquear event loop.

**Cuándo usarlo y cuándo no.** Úsalo para CPU intensiva. No para I/O normal.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms17-w && cd /tmp/ms17-w
cat > w.mjs << 'JS'
import {Worker,isMainThread,parentPort} from 'node:worker_threads';
if(isMainThread){ const w=new Worker(new URL('./w.mjs',import.meta.url)); w.on('message',m=>console.log(m)); }
else { parentPort.postMessage(21*2); }
JS
node w.mjs
```

**Caso de uso real.** Compresión/imagen.

**Error común.** Usar workers para I/O ya no bloqueante. Corrección: usar async I/O.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `42`.

#### Child Processes

**Definición formal.** Procesos separados iniciados desde Node (`spawn/fork/exec`) con aislamiento de memoria.

**Para qué sirve.** Ejecutar comandos o aislar fallos.

**Cuándo usarlo y cuándo no.** Úsalo para CLIs o aislamiento fuerte. Mayor overhead que worker.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "require('node:child_process').execFileSync('node',['-e','console.log(1)'],{encoding:'utf8'}).trim() && console.log('ok')"
```

**Caso de uso real.** Invocar herramienta externa.

**Error común.** Inyección de comandos con `exec`. Corrección: `execFile/spawn` con args.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `ok`.

### Tema 6: Backpressure en Streams · Avanzado · 90 min

#### Backpressure

**Definición formal.** Mecanismo por el cual un consumidor lento señala al productor que reduzca/pausa el envío.

**Para qué sirve.** Evita OOM y congestión.

**Cuándo usarlo y cuándo no.** Siempre en streams grandes.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "import('node:stream').then(({Readable,Writable})=>{ let i=0; const r=new Readable({read(){ this.push(i<3?String(i++):null); }}); const w=new Writable({write(c,_,cb){ console.log(c.toString()); cb(); }}); r.pipe(w); })"
```

**Caso de uso real.** Pipe de archivo a HTTP.

**Error común.** Ignorar retorno `false` de `write()`. Corrección: esperar `drain`.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `0`, `1`, `2`.

### Tema 7: Graceful shutdown · Intermedio · 90 min

#### Graceful shutdown

**Definición formal.** Procedimiento de apagado que deja de aceptar trabajo nuevo, completa o drena trabajo en curso y libera recursos.

**Para qué sirve.** Evita pérdida de requests en deploys.

**Cuándo usarlo y cuándo no.** Siempre en servicios. Definir timeout máximo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "process.on('SIGTERM',()=>{ console.log('closing'); process.exit(0); }); console.log('ready'); process.emit('SIGTERM')"
```

**Caso de uso real.** Kubernetes envía SIGTERM.

**Error común.** Salir inmediatamente. Corrección: cerrar server, drenar conexiones, timeout.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `ready`, `closing`.

## Cierre del módulo

Node.js moderno combina asincronía, tipado con TS, y primitivas de concurrencia/streaming. Conocer el event loop y el shutdown ordenado evita fallos en producción.
