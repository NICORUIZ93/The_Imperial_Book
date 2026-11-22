# Módulo 0.1 · Qué es un programa, un servidor y una API

**Entorno de referencia (2026-05-22):** Node.js v24.18.0, npm 11.x, macOS. Los ejemplos usan solo módulos estándar de Node (`node:http`, `node:test`, `node:assert/strict`) salvo que se indique lo contrario.

Este módulo establece el modelo mental mínimo para todo el track: un programa ejecuta instrucciones y termina; un servidor es un programa que permanece escuchando; una API es el contrato que define qué pedidos acepta ese servidor y cómo responde.

## Aprende construyendo

### Tema 1: Qué es un programa · Básico · 120 min

Caso guía: calcular el total de una lista de compras y decidir si alcanza el dinero disponible.

#### Programa

**Definición formal.** Un programa es una especificación ejecutable de instrucciones que transforma datos de entrada/estado en un resultado observable, siguiendo la semántica del runtime.

**Para qué sirve.** Automatiza cálculos y reglas repetibles.

**Cuándo usarlo y cuándo no.** Úsalo cuando la regla sea clara y verificable. No codifiques antes de definir entrada, salida y criterio de corrección.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-prog && cd /tmp/ms0-prog
cat > programa.mjs << 'JS'
const total = [4500, 12000, 3500].reduce((a, b) => a + b, 0);
console.log(total);
JS
node programa.mjs
```

**Caso de uso real.** Script de validación, job batch, CLI de migración.

**Error común.** Mezclar datos, lógica y salida sin estructura. Síntoma: difícil probar. Corrección: extraer funciones puras y probarlas.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `20000`.

#### Función pura y resultado observable

**Definición formal.** Una función pura devuelve el mismo resultado para los mismos argumentos y no produce efectos secundarios observables; la salida observable es el valor retornado, log, archivo o respuesta.

**Para qué sirve.** Facilita pruebas y razonamiento.

**Cuándo usarlo.** En reglas de negocio/calculo. Efectos secundarios (I/O) van al borde.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-fn && cd /tmp/ms0-fn
cat > calc.mjs << 'JS'
export function calcularTotal(items) { return items.reduce((a, i) => a + i.precio, 0); }
if (import.meta.main) console.log(calcularTotal([{precio: 4500},{precio: 12000},{precio: 3500}]));
JS
node calc.mjs
```

**Caso de uso real.** Cálculo de total de carrito.

**Error común.** Leer estado global mutable dentro del cálculo. Corrección: pasar datos por parámetro.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `20000`.

#### Código de salida de proceso

**Definición formal.** El exit code es el entero que un proceso devuelve al sistema operativo al terminar; `0` indica éxito por convención, distinto de `0` indica error.

**Para qué sirve.** Permite a shells, CI y orquestadores detectar fallos.

**Cuándo usarlo.** En scripts/CLI/jobs. No termines con `0` si hubo error.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-exit && cd /tmp/ms0-exit
node -e "process.exit(0)"; echo $?
node -e "process.exit(2)"; echo $?
```

**Caso de uso real.** CI falla si un script retorna no-cero.

**Error común.** Capturar error y no propagar código de salida. Corrección: `process.exitCode = 1` o relanzar.

**Verificación (2026-05-22).** Salidas: `0` y `2`.

### Tema 2: Qué es un servidor · Básico · 120 min

Caso guía: mantener un proceso escuchando pedidos HTTP y responder cada vez.

#### Servidor HTTP

**Definición formal.** Un servidor HTTP es un proceso que escucha en una dirección IP y puerto, acepta conexiones, interpreta requests HTTP y emite responses.

**Para qué sirve.** Permite que otros procesos/clientes soliciten operaciones por red.

**Cuándo usarlo.** Cuando necesitas atender múltiples pedidos a lo largo del tiempo. No uses servidor para una tarea puntual que termina.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-srv && cd /tmp/ms0-srv
cat > server.mjs << 'JS'
import http from 'node:http';
const server = http.createServer((req, res) => { res.writeHead(200, {'Content-Type':'text/plain'}); res.end('ok'); });
server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const r = await fetch(`http://127.0.0.1:${port}/`);
  console.log(r.status, await r.text());
  server.close();
});
JS
node server.mjs
```

**Caso de uso real.** API backend, gateway, webhook receiver.

**Error común.** Asumir que el servidor termina solo. Síntoma: proceso “colgado”. Corrección: es el comportamiento esperado; detener con señal/`close()`.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200 ok`.

#### Puerto y `EADDRINUSE`

**Definición formal.** Un puerto TCP es un endpoint lógico numerado (0-65535) dentro de un host; `EADDRINUSE` indica que el puerto ya está en uso.

**Para qué sirve.** Permite múltiples servicios en el mismo host.

**Cuándo usarlo.** Asigna puertos por configuración. En tests, usa puerto `0` para obtener uno libre.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-port && cd /tmp/ms0-port
cat > port.mjs << 'JS'
import http from 'node:http';
const a = http.createServer((_,r)=>r.end('a'));
a.listen(0,'127.0.0.1', () => {
  const port = a.address().port;
  const b = http.createServer((_,r)=>r.end('b'));
  b.on('error', e => { console.log(e.code); a.close(); b.close(); });
  b.listen(port,'127.0.0.1');
});
JS
node port.mjs
```

**Caso de uso real.** Dos servicios intentando usar 3000.

**Error común.** Dejar proceso anterior corriendo. Corrección: detener proceso o cambiar puerto.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `EADDRINUSE`.

#### Estado en memoria y persistencia

**Definición formal.** El estado en memoria vive en el espacio del proceso; se pierde al reiniciar. La persistencia lo guarda en un medio externo (BD, archivo, cola).

**Para qué sirve.** Distinguir caché temporal de datos durables.

**Cuándo usarlo.** Memoria para datos efímeros; persistencia para datos que deben sobrevivir reinicios.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-state && cd /tmp/ms0-state
cat > state.mjs << 'JS'
let count = 0;
count++;
console.log(count);
JS
node state.mjs
node state.mjs
```

**Caso de uso real.** Contador en memoria se reinicia; pedido en BD permanece.

**Error común.** Guardar datos críticos solo en memoria. Corrección: persistir en BD y definir estrategia de recuperación.

**Verificación (2026-05-22).** Dos ejecuciones imprimen `1` y `1` (estado no persiste entre procesos).

### Tema 3: Qué es una API · Básico · 120 min

Caso guía: exponer operaciones de menú y pedidos con contrato HTTP claro.

#### API y contrato

**Definición formal.** Una API (Application Programming Interface) es un contrato que define operaciones disponibles, entradas, salidas, errores y semántica. En HTTP/REST, ese contrato se expresa con métodos, rutas, códigos de estado y formatos.

**Para qué sirve.** Permite que clientes y servidores evolucionen con expectativas claras.

**Cuándo usarlo.** Siempre que un sistema sea consumido por otro. No expongas detalles internos como contrato accidental.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-api && cd /tmp/ms0-api
cat > api.mjs << 'JS'
import http from 'node:http';
const menu = [{id:1,nombre:'Arroz',precio:4500}];
const server = http.createServer((req,res) => {
  if (req.method==='GET' && req.url==='/api/menu') { res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify(menu)); }
  res.writeHead(404,{'Content-Type':'application/json'}); res.end(JSON.stringify({error:'not_found'}));
});
server.listen(0,'127.0.0.1', async () => {
  const p=server.address().port;
  const r=await fetch(`http://127.0.0.1:${p}/api/menu`);
  console.log(r.status);
  console.log(await r.text());
  server.close();
});
JS
node api.mjs
```

**Caso de uso real.** Frontend consumiendo `/api/orders`.

**Error común.** Cambiar forma de respuesta sin versionar/avisar. Corrección: contrato explícito y compatibilidad.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200` y `[{"id":1,"nombre":"Arroz","precio":4500}]`.

#### Métodos HTTP y códigos de estado

**Definición formal.** El método HTTP indica intención (`GET` leer, `POST` crear, etc.); el código de estado indica resultado (`200` OK, `201` creado, `400` input inválido, `404` no encontrado).

**Para qué sirve.** Semántica uniforme para clientes, cachés y observabilidad.

**Cuándo usarlo.** Siempre en APIs HTTP. No uses `200` con error de negocio oculto.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-status && cd /tmp/ms0-status
cat > status.mjs << 'JS'
import http from 'node:http';
const server = http.createServer(async (req,res) => {
  if (req.method==='POST' && req.url==='/api/pedidos') {
    let body=''; for await (const c of req) body+=c;
    const data = JSON.parse(body||'{}');
    if (!data.platoId) { res.writeHead(400,{'Content-Type':'application/json'}); return res.end(JSON.stringify({error:'platoId requerido'})); }
    res.writeHead(201,{'Content-Type':'application/json'}); return res.end(JSON.stringify({id:1,platoId:data.platoId}));
  }
  res.writeHead(404); res.end();
});
server.listen(0,'127.0.0.1', async () => {
  const b=`http://127.0.0.1:${server.address().port}`;
  let r=await fetch(`${b}/api/pedidos`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  console.log(r.status);
  r=await fetch(`${b}/api/pedidos`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"platoId":1}'});
  console.log(r.status);
  server.close();
});
JS
node status.mjs
```

**Caso de uso real.** Validación de input y creación de recurso.

**Error común.** Responder `200` con `{error:...}`. Corrección: usar código 4xx/5xx apropiado.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `400` y `201`.

#### Contrato público vs implementación interna

**Definición formal.** El contrato público es lo que el cliente puede depender; la implementación interna son detalles que pueden cambiar sin romper contrato.

**Para qué sirve.** Permite evolucionar internamente sin romper consumidores.

**Cuándo usarlo.** Diseña API por capacidad, no por estructura de BD.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms0-contract && cd /tmp/ms0-contract
cat > contract.mjs << 'JS'
const dbRow = { user_id: 1, full_name: 'Ada', password_hash: 'x' };
function toPublic(row){ return { id: row.user_id, name: row.full_name }; }
console.log(JSON.stringify(toPublic(dbRow)));
JS
node contract.mjs
```

**Caso de uso real.** No exponer `password_hash` ni nombres de columnas.

**Error común.** Serializar entidad/row de BD directamente. Corrección: DTO/respuesta explícita.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{"id":1,"name":"Ada"}`.

## Cierre del módulo

Un programa transforma datos y termina; un servidor mantiene disponibilidad para atender pedidos; una API define el contrato de esos pedidos. En microservicios, cada servicio será un programa-servidor con una API explícita y verificable.
