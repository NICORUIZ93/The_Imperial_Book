# Módulo 30 · Anti-patrones y cuándo NO usar microservicios

**Fase 3 · Nivel maestro: arquitectura avanzada** (media semana; semana 4 de 8). **Duración:** 6 h (4 temas de unos
75 min y 1 h de laboratorio integrador). **Dificultad:** 4 de 5. **Dependencias:** Módulo 24 (gobernanza: ADRs y
fitness functions en producción) y Módulo 25 (sagas, compensaciones e idempotencia); ayudan el Módulo 29 (Ley de
Conway y carga cognitiva) y el Módulo 5 (monolito frente a microservicios, bounded contexts). **Herramientas:**
**Node.js 26.13.1 LTS**, **pg 8.23.1** y **PostgreSQL 18.7** (solo la ficha 3). **Laboratorio:**
`examples/microservicios/modulo-34/` (`./verificar.sh` ejecuta 18 tests y los scripts de las cuatro fichas, la 3 si
PostgreSQL responde; `./verificar.sh --compose` levanta PostgreSQL y lo exige todo).

Has pasado treinta módulos aprendiendo a construir microservicios. Este módulo trata de **no construirlos cuando no
toca** y de reconocer cuándo lo que tienes ya no es una arquitectura de microservicios, sino sus costes sin sus
beneficios. Vas a levantar un **monolito distribuido** real y verlo caer en cascada, a medir cuánto cuesta partir un
cálculo en **nanoservicios**, a comparar en PostgreSQL una **saga innecesaria** con una transacción de diez líneas y a
escribir **fitness functions** que detienen el build cuando la arquitectura empieza a degradarse. Al final de cada
ficha hay una pregunta que conviene hacerse antes de cualquier diseño: ¿esto necesita red?

```mermaid
flowchart LR
    T1["1 · Monolito<br/>distribuido"] --> T4["4 · Fitness<br/>functions"]
    T2["2 · Sobre-<br/>descomposición"] --> T4
    T3["3 · Sagas<br/>innecesarias"] --> T4
    T2 -. "cuántos servicios" .-> T1
    T3 -. "frontera mal puesta" .-> T2
```

**Texto alternativo:** mapa del módulo. Los tres anti-patrones, monolito distribuido (tema 1), sobre-descomposición
(tema 2) y sagas innecesarias (tema 3), llevan al tema 4, fitness functions, que los detecta de forma automática.
Flechas punteadas: la sobre-descomposición produce monolitos distribuidos y una saga innecesaria suele revelar una
frontera mal puesta entre servicios, es decir, sobre-descomposición.

**Cómo usar el laboratorio.** Con Node 26 y Docker:

```bash
cd examples/microservicios/modulo-34
npm ci
docker compose up -d --wait         # PostgreSQL 18.7 :5432 (academia/academia) para la ficha 3
./verificar.sh --compose            # tests + demos + errores comunes de las 4 fichas → «RESULTADO: OK»
docker compose down -v
```

Todas las órdenes de las fichas se ejecutan **desde `examples/microservicios/modulo-34`**. Las fichas 1, 2 y 4
levantan sus propios servidores HTTP con `node:http` en puertos libres y no necesitan Docker.

`package.json` del laboratorio (con `package-lock.json` que fija el árbol completo):

```json
{
  "name": "modulo-30-anti-patrones-cuando-no-usar-microservicios",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 30 (Fase 3): Anti-patrones y cuándo NO usar microservicios (monolito distribuido, sobre-descomposición, sagas innecesarias frente a una transacción local, fitness functions).",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "test": "node --test --test-concurrency=1 'f17*/*.test.js'"
  },
  "dependencies": {
    "pg": "8.23.1"
  }
}
```

`docker-compose.yml`:

```yaml
# Módulo 30 (modulo-34) · Anti-patrones y cuándo NO usar microservicios: PostgreSQL 18.7 para F175.
# Arranca:  docker compose up -d --wait   (espera al healthcheck)
#   PostgreSQL :5432 (academia/academia, base academia) → F175 (sagas innecesarias frente a una transacción local)
# F173, F174 y F176 no necesitan infraestructura (levantan sus propios servidores HTTP con node:http).
# Detén:    docker compose down -v
# Si otro módulo ocupa el puerto 5432 (p. ej. modulo-29), haz antes «docker compose down» allí.
name: modulo-34
services:
  postgres:
    image: postgres:18.7
    environment:
      POSTGRES_USER: academia
      POSTGRES_PASSWORD: academia
      POSTGRES_DB: academia
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "academia", "-d", "academia"]
      interval: 2s
      timeout: 3s
      retries: 30
```

`comun/http.js` (lo usan las fichas 1 y 2):

```javascript
// Módulo 30 · Utilidades HTTP (node:http) para levantar servicios de ejemplo en puertos libres.
// Requisitos: Node.js 26.13.1 LTS.
import { createServer } from 'node:http';

// Arranca un servicio en 127.0.0.1 y un puerto libre. `manejar(req)` devuelve { estado, cuerpo }.
export async function servicio(nombre, manejar) {
  const servidor = createServer(async (req, res) => {
    let r;
    try {
      r = await manejar(req);
    } catch (error) {
      r = { estado: 502, cuerpo: { error: `${nombre}: ${error.message}` } };
    }
    res.writeHead(r.estado, { 'content-type': 'application/json' }).end(JSON.stringify(r.cuerpo));
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  return {
    nombre,
    url: `http://127.0.0.1:${servidor.address().port}`,
    cerrar: () => new Promise((ok) => { servidor.closeAllConnections(); servidor.close(ok); }),
  };
}

// GET con timeout: lanza un Error con la causa legible (ECONNREFUSED, timeout, HTTP 5xx).
export async function obtener(url, { timeoutMs = 1000 } = {}) {
  let r;
  try {
    r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    throw new Error(`${new URL(url).pathname} → ${error.cause?.code ?? error.name}`);
  }
  const cuerpo = await r.json();
  if (!r.ok) throw new Error(cuerpo.error ?? `HTTP ${r.status}`);
  return cuerpo;
}

// Lee el cuerpo JSON de una petición entrante.
export async function leerJson(req) {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  return texto ? JSON.parse(texto) : {};
}

// POST JSON con timeout; devuelve el cuerpo de la respuesta (lanza si no es 2xx).
export async function enviar(url, cuerpo, { timeoutMs = 1000 } = {}) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`);
  return json;
}
```

`comun/config.js`:

```javascript
// Módulo 30 · Dirección de PostgreSQL del laboratorio (la de docker-compose.yml). Solo la usa F175.
// Cambia el destino sin tocar código:  PG_URL=postgres://... node ...
export const PG_URL = process.env.PG_URL ?? 'postgres://academia:academia@localhost:5432/academia';
```

**Lo que se ejecutó al escribir este módulo** (Node 26.13.1, PostgreSQL 16.15 local): las cuatro fichas completas con
`./verificar.sh`. **Lo que no se pudo ejecutar aquí** (sin acceso a Docker Hub): `./verificar.sh --compose` con la
imagen `postgres:18.7`; el `docker-compose.yml` se validó con `docker compose config -q` y el comando para el Mac está
en `verificacion/microservicios/pendiente.md`.

---

### Monolito distribuido

#### 1. UBICACIÓN

Módulo 30, Lección 1 de 4 · Fase 3 · Laboratorio `examples/microservicios/modulo-34/f173-monolito-distribuido/`.

#### 2. PRERREQUISITOS

- Monolito frente a microservicios y database-per-service (Módulo 5, fichas 1 y 6).
- Timeouts en cascada y presupuesto de latencia (Módulo 8, ficha 2, o Módulo 19, ficha 4).
- Ley de Conway (Módulo 29, ficha 1).

#### 3. OBJETIVO DE APRENDIZAJE

**Reconocer** un monolito distribuido por sus síntomas (despliegue en bloque, base de datos compartida, cadenas
síncronas y librerías de modelos compartidas), **demostrar** con servicios HTTP reales sus dos consecuencias (fallo en
cascada y ruptura silenciosa al desplegar uno solo) y **calcular** su disponibilidad compuesta. Lo compruebas cuando
`monolito.test.js` pasa 5 de 5 y sabes explicar por qué el diagnóstico de la demo dice «monolito distribuido».

#### 4. ANALOGÍA VISUAL

Dibuja **una cadena de luces de Navidad antigua**, de las que se conectan en serie: si una bombilla se funde, se
apaga toda la tira. Alguien decidió «modernizarla» y cortó la tira en cuatro trozos con enchufes entre ellos, pero
los trozos **siguen conectados en serie**: ahora hay más enchufes que pueden fallar, cada trozo necesita su propio
transformador, y si un trozo se apaga, se apaga todo igual. Encima, si cambias el voltaje de un trozo, tienes que
cambiar los cuatro **a la vez**. Eso es un monolito distribuido: los costes de separar sin la independencia que
justificaba hacerlo.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    C["cliente"] -->|"GET /pedidos/simular"| P["pedidos"]
    P -->|"GET /stock/sku (síncrono)"| I["inventario"]
    P -->|"GET /precios/sku (síncrono)"| PR["precios"]
    PR -->|"GET /impuestos/sku (síncrono)"| IM["impuestos"]
    P -.- BD[("BD tienda<br/>(compartida)")]
    I -.- BD
    L["librería tienda-modelos<br/>(DTO compartido)"] -.- P
    L -.- I
    L -.- PR
```

**Texto alternativo:** el cliente llama a pedidos, que llama de forma síncrona a inventario y a precios; precios a su
vez llama de forma síncrona a impuestos. Pedidos e inventario comparten la base de datos tienda, y pedidos,
inventario y precios usan la misma librería de modelos tienda-modelos. Si cualquiera de los cuatro falla, la petición
del cliente falla.

#### 6. EXPLICACIÓN NIVEL 0

- Un **monolito** es un programa grande que se despliega de una vez. Un **monolito distribuido** es ese mismo
  programa partido en trozos que se ejecutan por separado… pero que **no pueden vivir separados**.
- Señales: para cambiar una cosa hay que desplegar varios servicios **a la vez**; si uno se cae, se caen todos;
  varios servicios leen y escriben **la misma base de datos**.
- Tiene lo malo de los dos mundos: la red, la latencia y la complejidad de los microservicios, y el acoplamiento del
  monolito.

#### 7. EXPLICACIÓN INTERMEDIA

- **Síntomas medibles** (`diagnosticar()`):
  1. **Base de datos compartida:** dos servicios escriben las mismas tablas; un cambio de esquema rompe a ambos.
  2. **Despliegue en bloque:** más de la mitad de los despliegues llevan varios servicios a la vez.
  3. **Cadena síncrona profunda:** una petición atraviesa dos o más saltos HTTP antes de responder.
  4. **Librería de modelos compartida:** los servicios comparten clases de dominio (no solo utilidades); actualizarla
     obliga a desplegarlos juntos.
- **Fallo en cascada:** en la demo, cerrar `impuestos` (a dos saltos de `pedidos`) hace que `pedidos` responda 502
  con `precios: /impuestos/TEC-1 → ECONNREFUSED`. Ningún servicio «tiene la culpa», pero el sistema entero falla.
- **Disponibilidad compuesta:** si una petición necesita a todos los servicios, la disponibilidad es el **producto**:
  4 servicios al 99,5 % dan 98,01 %, unas 14 horas de caída al mes en lugar de 3,6.
- **Ruptura silenciosa:** `precios` v2 renombra `precio` a `valor`. `pedidos` (aún v1) no lanza error: calcula `NaN`,
  que en JSON se serializa como `null`, y responde `200` con `"total": null`. Solo «funciona» si se despliegan juntos.

#### 8. EXPLICACIÓN MAESTRA

- **Cómo se llega aquí.** Casi nunca por decisión: se parte un monolito por **capas** o por **entidades** en vez de
  por bounded contexts, se mantiene la base de datos «de momento» y se comunica todo por HTTP síncrono porque es lo
  conocido. Cada paso parece razonable; el resultado no lo es.
- **Salidas, de menor a mayor esfuerzo:** (1) **volver a juntar** los servicios que siempre se despliegan juntos en
  un monolito modular (Spring Modulith en el Módulo 5, o módulos de Node con fitness functions, ficha 4): es la opción
  más barata y a menudo la correcta; (2) **separar los datos** con database-per-service y outbox (Módulo 25);
  (3) **cambiar llamadas síncronas por eventos** con Event-Carried State Transfer (Módulo 26) para que la caída de
  `impuestos` no tumbe `pedidos`; (4) **contratos compatibles** (expandir y contraer, contract testing con Pact del
  Módulo 3 o 16) para desplegar cada servicio por separado.
- **Trade-offs:** volver al monolito modular pierde el escalado independiente y el aislamiento de fallos (que de
  todas formas no tenías); separar datos e introducir eventos trae consistencia eventual, que hay que diseñar.
- **Cuándo NO preocuparse:** dos servicios que se despliegan juntos alguna vez por una funcionalidad grande no son un
  monolito distribuido; el indicador es la **tendencia** (más del 50 % de los despliegues en bloque durante meses).
- **Lo que no arregla nada:** poner un circuit breaker delante de cada llamada. Evita que los hilos se bloqueen, pero
  la petición sigue sin poder completarse sin el servicio caído.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, sin dependencias de npm (`node:http` y `fetch` nativo; `comun/http.js` arriba).

`f173-monolito-distribuido/sistema.js`:

```javascript
// Módulo 30 · F173 · Un «monolito distribuido» de verdad: cuatro servicios HTTP (node:http) que solo funcionan juntos.
// pedidos → inventario, pedidos → precios → impuestos, todo síncrono y con el mismo DTO (campo `precio`).
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.
import { obtener, servicio } from '../comun/http.js';

// versionPrecios: 1 (campo `precio`), 2 (solo `valor`) o 'compatible' (los dos).
export async function crearSistema({ versionPrecios = 1 } = {}) {
  const impuestos = await servicio('impuestos', async () => ({ estado: 200, cuerpo: { iva: 0.19 } }));
  const precios = await servicio('precios', async (req) => {
    const sku = req.url.split('/').pop();
    const { iva } = await obtener(`${impuestos.url}/impuestos/${sku}`);
    const base = 100;
    const valor = base * (1 + iva);
    // v2 renombra `precio` → `valor`: un cambio «interno» que rompe a quien comparte el DTO.
    // 'compatible' = expandir y contraer: publica los dos campos hasta que ningún consumidor lea `precio`.
    const cuerpo = { 1: { sku, precio: valor }, 2: { sku, valor }, compatible: { sku, valor, precio: valor } }[versionPrecios];
    return { estado: 200, cuerpo };
  });
  const inventario = await servicio('inventario', async () => ({ estado: 200, cuerpo: { disponible: 5 } }));
  const pedidos = await servicio('pedidos', async (req) => {
    const url = new URL(req.url, 'http://x');
    const sku = url.searchParams.get('sku');
    const cantidad = Number(url.searchParams.get('cantidad'));
    const { disponible } = await obtener(`${inventario.url}/stock/${sku}`);
    if (disponible < cantidad) return { estado: 409, cuerpo: { error: 'sin stock' } };
    const { precio } = await obtener(`${precios.url}/precios/${sku}`);
    return { estado: 200, cuerpo: { sku, cantidad, total: precio * cantidad } }; // NaN → null en JSON
  });
  const todos = { pedidos, inventario, precios, impuestos };
  return { ...todos, cerrar: () => Promise.all(Object.values(todos).map((s) => s.cerrar())) };
}

// Disponibilidad de una petición que necesita a TODOS los servicios de la cadena: el producto de cada una.
export const disponibilidadCompuesta = (lista) => lista.reduce((p, a) => p * a, 1);

// Síntomas de monolito distribuido a partir de una descripción del sistema.
export function diagnosticar({ servicios, despliegues }) {
  const sintomas = [];
  const porBd = new Map();
  for (const s of servicios) porBd.set(s.bd, [...(porBd.get(s.bd) ?? []), s.nombre]);
  for (const [bd, nombres] of porBd) if (nombres.length > 1) sintomas.push(`base de datos compartida «${bd}»: ${nombres.join(', ')}`);
  const juntos = despliegues.filter((d) => d.length > 1).length;
  if (juntos / despliegues.length > 0.5)
    sintomas.push(`despliegue en bloque: ${juntos}/${despliegues.length} despliegues llevan varios servicios a la vez`);
  const profundidad = (nombre, visto = new Set()) => {
    if (visto.has(nombre)) return Infinity; // ciclo de llamadas síncronas
    const s = servicios.find((x) => x.nombre === nombre);
    const hijos = s?.llama ?? [];
    return hijos.length ? 1 + Math.max(...hijos.map((h) => profundidad(h, new Set([...visto, nombre])))) : 0;
  };
  const maxima = Math.max(...servicios.map((s) => profundidad(s.nombre)));
  if (maxima > 1) sintomas.push(`cadena síncrona de profundidad ${maxima === Infinity ? '∞ (ciclo)' : maxima}`);
  const libs = new Map();
  for (const s of servicios) for (const l of s.libreriasDeDominio ?? []) libs.set(l, [...(libs.get(l) ?? []), s.nombre]);
  for (const [l, nombres] of libs) if (nombres.length > 1) sintomas.push(`librería de modelos compartida «${l}»: ${nombres.join(', ')}`);
  return { sintomas, veredicto: sintomas.length >= 2 ? 'monolito distribuido' : 'servicios independientes' };
}
```

`f173-monolito-distribuido/demo.js`:

```javascript
// Módulo 30 · F173 · Ejecuta: node f173-monolito-distribuido/demo.js
import { obtener } from '../comun/http.js';
import { crearSistema, diagnosticar, disponibilidadCompuesta } from './sistema.js';

const s = await crearSistema();
const pedir = () => obtener(`${s.pedidos.url}/pedidos/simular?sku=TEC-1&cantidad=2`).then(
  (r) => `200 ${JSON.stringify(r)}`, (e) => `error: ${e.message}`);
console.log(`1. Los 4 servicios arriba      → ${await pedir()}`);
await s.impuestos.cerrar(); // se cae el servicio más «pequeño» y lejano
console.log(`2. Cae impuestos (a 2 saltos)  → ${await pedir()}`);
await s.cerrar();

const a = disponibilidadCompuesta([0.995, 0.995, 0.995, 0.995]);
console.log(`3. Disponibilidad: 4 servicios al 99,5 % en cadena → ${(a * 100).toFixed(2)} % (≈ ${Math.round((1 - a) * 30 * 24)} h caídas al mes)`);

const d = diagnosticar({
  servicios: [
    { nombre: 'pedidos', bd: 'tienda', llama: ['inventario', 'precios'], libreriasDeDominio: ['tienda-modelos'] },
    { nombre: 'inventario', bd: 'tienda', llama: [], libreriasDeDominio: ['tienda-modelos'] },
    { nombre: 'precios', bd: 'precios', llama: ['impuestos'], libreriasDeDominio: ['tienda-modelos'] },
    { nombre: 'impuestos', bd: 'impuestos', llama: [] },
  ],
  despliegues: [['pedidos', 'precios'], ['pedidos', 'inventario', 'precios'], ['impuestos'], ['pedidos', 'precios']],
});
console.log(`4. Diagnóstico: ${d.veredicto}`);
for (const x of d.sintomas) console.log(`   - ${x}`);
```

#### 10. MINI-LABORATORIO

1. Levanta los cuatro servicios, tumba el más lejano, calcula la disponibilidad y pasa el diagnóstico:

```bash
node f173-monolito-distribuido/demo.js
```

**Output esperado** (real):

```text
1. Los 4 servicios arriba      → 200 {"sku":"TEC-1","cantidad":2,"total":238}
2. Cae impuestos (a 2 saltos)  → error: pedidos: precios: /impuestos/TEC-1 → ECONNREFUSED
3. Disponibilidad: 4 servicios al 99,5 % en cadena → 98.01 % (≈ 14 h caídas al mes)
4. Diagnóstico: monolito distribuido
   - base de datos compartida «tienda»: pedidos, inventario
   - despliegue en bloque: 3/4 despliegues llevan varios servicios a la vez
   - cadena síncrona de profundidad 2
   - librería de modelos compartida «tienda-modelos»: pedidos, inventario, precios
```

2. En `demo.js`, cambia el diagnóstico para que `inventario` tenga su propia base (`bd: 'inventario'`), ninguno use
   `tienda-modelos` y cada despliegue lleve un solo servicio. **Output esperado:** `4. Diagnóstico: servicios
   independientes` con un único síntoma, `cadena síncrona de profundidad 2`. **Captura comentada:** queda la cadena;
   para quitarla, `precios` necesitaría una réplica del IVA alimentada por eventos (Módulo 26, ficha 4).

3. Repite el cálculo de disponibilidad con 8 servicios al 99,9 % (`disponibilidadCompuesta(Array(8).fill(0.999))`).
   **Output esperado:** `0.992…`, unas 5,7 horas de caída al mes. **Captura comentada:** más servicios en la cadena
   empeoran la disponibilidad aunque cada uno sea muy fiable.

#### 11. VERIFICACIÓN

Tests con servidores HTTP reales (`f173-monolito-distribuido/monolito.test.js`):

```javascript
// Módulo 30 · F173 · Tests con servidores HTTP reales. Ejecuta: node --test f173-monolito-distribuido/monolito.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { obtener } from '../comun/http.js';
import { crearSistema, diagnosticar, disponibilidadCompuesta } from './sistema.js';

const ruta = '/pedidos/simular?sku=TEC-1&cantidad=2';

test('con los 4 servicios arriba el pedido se calcula', async () => {
  const s = await crearSistema();
  assert.deepEqual(await obtener(s.pedidos.url + ruta), { sku: 'TEC-1', cantidad: 2, total: 238 });
  await s.cerrar();
});

test('la caída de un servicio a dos saltos tumba a pedidos (fallo en cascada)', async () => {
  const s = await crearSistema();
  await s.impuestos.cerrar();
  await assert.rejects(obtener(s.pedidos.url + ruta), /precios: \/impuestos\/TEC-1 → ECONNREFUSED/);
  await s.cerrar();
});

test('renombrar un campo en precios rompe en silencio a pedidos (despliegue en bloque)', async () => {
  const s = await crearSistema({ versionPrecios: 2 });
  assert.equal((await obtener(s.pedidos.url + ruta)).total, null);
  await s.cerrar();
});

test('la disponibilidad en cadena es el producto', () => {
  assert.equal(disponibilidadCompuesta([0.99, 0.99]).toFixed(4), '0.9801');
});

test('el diagnóstico distingue monolito distribuido de servicios independientes', () => {
  const malo = diagnosticar({ servicios: [{ nombre: 'a', bd: 'x', llama: ['b'] }, { nombre: 'b', bd: 'x', llama: [] }], despliegues: [['a', 'b']] });
  assert.equal(malo.veredicto, 'monolito distribuido');
  const bueno = diagnosticar({ servicios: [{ nombre: 'a', bd: 'a', llama: [] }, { nombre: 'b', bd: 'b', llama: [] }], despliegues: [['a'], ['b']] });
  assert.deepEqual(bueno, { sintomas: [], veredicto: 'servicios independientes' });
});
```

```bash
node --test --test-reporter=spec f173-monolito-distribuido/monolito.test.js
```

**Output esperado** (real): `ℹ tests 5` y `ℹ pass 5`.

**Pregunta de comprobación:** si `pedidos` pusiera un timeout de 100 ms y un fallback «precio no disponible», ¿dejaría
de ser un monolito distribuido? (No del todo: evitaría que el fallo cuelgue a `pedidos`, pero seguiría sin poder vender
con `precios` caído y seguiría compartiendo base de datos y DTOs. Los síntomas estructurales siguen ahí.)

#### 12. ERROR COMÚN

**Síntoma:** tras desplegar solo `precios`, los pedidos salen con total vacío o cero, sin ningún error en los logs.
**Causa:** el DTO compartido cambió (`precio` → `valor`) y el consumidor, aún en la versión anterior, lee un campo que
ya no existe.

```javascript
// Módulo 30 · F173 · Error común: desplegar UN servicio que comparte el DTO con otros.
// precios v2 renombra `precio` → `valor`; pedidos (aún en v1) no falla: devuelve total null y sigue. Solo «funciona»
// si se despliegan juntos, que es justo lo que define a un monolito distribuido. Ejecuta: node f173-monolito-distribuido/error-comun.js
import { obtener } from '../comun/http.js';
import { crearSistema } from './sistema.js';

const ruta = '/pedidos/simular?sku=TEC-1&cantidad=2';
const mal = await crearSistema({ versionPrecios: 2 });
console.log(`MAL  → precios v2 + pedidos v1: ${JSON.stringify(await obtener(mal.pedidos.url + ruta))}`);
await mal.cerrar();

// Arreglo: cambio compatible (expandir y contraer): v2 publica `valor` Y `precio` hasta que nadie lea `precio`.
const bien = await crearSistema({ versionPrecios: 'compatible' });
console.log(`BIEN → contrato compatible (expandir y contraer): ${JSON.stringify(await obtener(bien.pedidos.url + ruta))}`);
await bien.cerrar();
```

Salida real de `node f173-monolito-distribuido/error-comun.js`:

```text
MAL  → precios v2 + pedidos v1: {"sku":"TEC-1","cantidad":2,"total":null}
BIEN → contrato compatible (expandir y contraer): {"sku":"TEC-1","cantidad":2,"total":238}
```

**Diagnóstico visual:** en el panel de negocio (Módulo 21), el importe medio por pedido cae a cero justo en la marca
del despliegue de `precios`, mientras la tasa de errores HTTP sigue plana. **Arreglo:** cambios de contrato en dos
pasos (expandir: publicar `valor` y `precio`; contraer: quitar `precio` cuando ningún consumidor lo lea), con un test
de contrato que falle en el build del productor, y validación de la respuesta en el consumidor (un `total` `null` es
un error, no un 200).

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué es un monolito distribuido y cómo lo detectas y lo arreglas?**

**Respuesta modelo:** es un sistema partido en servicios que se despliegan por separado pero no pueden funcionar ni
cambiar por separado: tiene la latencia, los fallos de red y la complejidad operativa de los microservicios y el
acoplamiento de un monolito. Lo detecto por síntomas medibles: la mayoría de los despliegues llevan varios servicios a
la vez, varios servicios comparten base de datos o una librería de modelos de dominio, y las peticiones atraviesan
cadenas síncronas, de modo que la caída de un servicio lejano tumba a los demás y la disponibilidad es el producto de
todas. Para arreglarlo, la opción más barata suele ser juntar los servicios que siempre cambian juntos en un monolito
modular; si de verdad necesitan ser independientes, separo los datos con database-per-service y outbox, cambio
llamadas síncronas por eventos que llevan el estado y uso contratos compatibles con tests de contrato para desplegar
cada uno solo.

#### 14. ANTI-PATRÓN RELACIONADO

**La «release train» de microservicios**: todos los servicios se versionan y despliegan juntos cada dos semanas con
una lista de compatibilidad, porque ninguno funciona con la versión anterior de los otros.

```mermaid
flowchart LR
    R["release 2026.11<br/>(todos juntos)"] --> A["pedidos 4.2"]
    R --> B["inventario 4.2"]
    R --> C["precios 4.2"]
    R --> D["impuestos 4.2"]
    A -. "incompatible con" .-> C2["precios 4.1"]
```

**Texto alternativo:** una release única llamada 2026.11 despliega a la vez pedidos, inventario, precios e impuestos,
todos en la versión 4.2; una flecha punteada indica que pedidos 4.2 es incompatible con precios 4.1, por eso nadie
puede desplegarse solo.

---

### Sobre-descomposición

#### 1. UBICACIÓN

Módulo 30, Lección 2 de 4 · Fase 3 · Laboratorio `examples/microservicios/modulo-34/f174-sobre-descomposicion/`.

#### 2. PRERREQUISITOS

- Monolito distribuido (ficha 1).
- DDD: agregados y bounded contexts (Módulo 5, ficha 2).
- Carga cognitiva y dimensionamiento de equipos (Módulo 29, fichas 3 y 4).
- `perf_hooks` para medir tiempos (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Medir** el coste de partir un cálculo en nanoservicios (llamadas de red y latencia) frente a hacerlo en un proceso,
**calcular** la granularidad de un sistema a partir de su historial de cambios (servicios por persona y servicios que
siempre cambian juntos) y **decidir** cuándo fusionar servicios o no usar microservicios. Lo compruebas cuando
`nano.test.js` pasa 4 de 4 y resuelves el ejercicio de decisión del laboratorio.

#### 4. ANALOGÍA VISUAL

Dibuja **una cocina de restaurante** donde cada paso de una receta lo hace una persona distinta **en una habitación
distinta**: una pela, otra corta, otra sazona, otra cocina. Entre habitaciones hay una ventanilla y un mensajero que
lleva el plato. Para un solo plato hay cuatro viajes de mensajero, cuatro esperas en la ventanilla y, si el mensajero
se tropieza, el plato no llega. Al lado, dibuja la cocina normal: **una mesa larga** donde el mismo equipo hace los
cuatro pasos pasándose el plato con la mano. Las dos cocinas preparan exactamente el mismo plato.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant O as orquestador
    participant S as subtotal-svc
    participant D as descuento-svc
    participant I as impuesto-svc
    participant E as envio-svc
    O->>S: POST /subtotal (pedido)
    S-->>O: + subtotal
    O->>D: POST /descuento
    D-->>O: + descuento
    O->>I: POST /impuesto
    I-->>O: + iva
    O->>E: POST /envio
    E-->>O: + envio
    Note over O: total = subtotal − descuento + iva + envío<br/>4 llamadas HTTP · en proceso serían 0
```

**Texto alternativo:** diagrama de secuencia. Un orquestador envía el pedido por POST a cuatro nanoservicios en orden:
subtotal, descuento, impuesto y envío; cada uno devuelve el pedido con un campo más. Al final el orquestador calcula
el total. Son cuatro llamadas HTTP por pedido; el mismo cálculo en un proceso no hace ninguna.

#### 6. EXPLICACIÓN NIVEL 0

- **Sobre-descomponer** es partir un sistema en **demasiados** servicios pequeños.
- Cada servicio nuevo añade cosas que hay que cuidar: un despliegue, una red, un registro de errores, una alerta.
- Si casi siempre que cambias un servicio tienes que cambiar otro, **en realidad son uno solo** partido en dos.
- La pregunta clave no es «¿se puede separar?» (casi todo se puede), sino «¿**ganamos** algo separándolo?».

#### 7. EXPLICACIÓN INTERMEDIA

- **Coste de red medido.** El mismo cálculo da `total=224910` en los dos modos, pero los nanoservicios hacen **4
  llamadas HTTP** por pedido. En la máquina de autoría, la mediana pasó de unos microsegundos en proceso a unos 2 ms
  con nanoservicios en `localhost` (miles de veces más lento). Con red real entre máquinas, cada salto suma además
  la latencia de la red y la serialización, y cada uno puede fallar.
- **Granularidad desde el historial** (`granularidad()`):
  - **servicios por persona**: con 6 servicios y 4 personas, 1,5 servicios por persona, cada uno con su pipeline,
    alertas y guardia;
  - **porcentaje de cambios multiservicio**: el 83 % de las funcionalidades de la demo tocan varios servicios;
  - **candidatos a fusionar**: pares que cambian juntos en el 80 % o más de las veces en que cambia el menos
    frecuente (con al menos 2 apariciones, para no sacar conclusiones de un solo cambio).
- **Granularidad sana:** un servicio por **bounded context** o, como mucho, por **agregado** que tenga un ciclo de
  cambio propio, con un tamaño que el equipo dueño pueda entender (carga cognitiva, Módulo 29).

#### 8. EXPLICACIÓN MAESTRA

- **Por qué pasa.** Reglas como «un servicio por entidad», «un servicio por tabla» o «los servicios deben ser
  pequeños» sustituyen el criterio. También la Ley de Conway al revés: muchos servicios para pocos equipos, porque se
  diseñó para la organización que habrá «algún día».
- **Costes ocultos:** cada servicio paga su observability tax y su infraestructura (Módulo 28), sus dependencias y
  parches de seguridad, sus migraciones de base de datos y su versión de contrato. Con 4 personas y 12 servicios, el
  equipo pasa más tiempo manteniendo plumbing que entregando funcionalidades.
- **Alternativas:** (1) **monolito modular**: los módulos tienen fronteras (fitness functions de la ficha 4) y se
  despliegan juntos, sin red entre ellos; (2) **fusionar** los pares que cambian juntos en un servicio por agregado o
  por contexto; (3) **librería** en lugar de servicio para lógica pura sin estado propio (como el cálculo de
  impuestos de la demo), versionada con cuidado para no crear el DTO compartido de la ficha 1.
- **Cuándo SÍ partir aunque sea pequeño:** cuando hay una razón concreta: escalado muy distinto (un procesador de
  imágenes que necesita GPU), aislamiento de fallos o de seguridad (pagos con PCI DSS), un ciclo de despliegue
  distinto o un equipo distinto que es dueño de verdad.
- **Cuándo NO usar microservicios en absoluto:** un equipo pequeño, un producto que aún busca su mercado, un dominio
  poco claro o sin necesidades de escalado independiente. Ahí el ejercicio del laboratorio tiene una respuesta clara.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, sin dependencias de npm (`node:http`, `node:perf_hooks`, `fetch`).

`f174-sobre-descomposicion/nano.js`:

```javascript
// Módulo 30 · F174 · Sobre-descomposición: el mismo cálculo de un pedido como funciones en un proceso y como
// cuatro «nanoservicios» HTTP (uno por paso), y una métrica de granularidad a partir del historial de cambios.
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.
import { performance } from 'node:perf_hooks';
import { enviar, leerJson, servicio } from '../comun/http.js';

// Los cuatro pasos del cálculo (pesos colombianos, enteros).
export const pasos = {
  subtotal: (p) => ({ ...p, subtotal: p.lineas.reduce((s, l) => s + l.precio * l.cantidad, 0) }),
  descuento: (p) => ({ ...p, descuento: p.subtotal >= 200000 ? Math.round(p.subtotal * 0.1) : 0 }),
  impuesto: (p) => ({ ...p, iva: Math.round((p.subtotal - p.descuento) * 0.19) }),
  envio: (p) => ({ ...p, envio: p.subtotal >= 150000 ? 0 : 12000 }),
};
const total = (p) => ({ ...p, total: p.subtotal - p.descuento + p.iva + p.envio });

// Opción A: un módulo, cuatro funciones, cero red.
export const totalEnProceso = (pedido) => total(pasos.envio(pasos.impuesto(pasos.descuento(pasos.subtotal(pedido)))));

// Opción B: un servicio HTTP por paso y un orquestador que los llama en orden.
export async function crearNanoservicios() {
  let llamadas = 0;
  const svcs = {};
  for (const [nombre, fn] of Object.entries(pasos))
    svcs[nombre] = await servicio(nombre, async (req) => { llamadas += 1; return { estado: 200, cuerpo: fn(await leerJson(req)) }; });
  return {
    get llamadas() { return llamadas; },
    async total(pedido) {
      let p = pedido;
      for (const nombre of Object.keys(pasos)) p = await enviar(`${svcs[nombre].url}/${nombre}`, p);
      return total(p);
    },
    cerrar: () => Promise.all(Object.values(svcs).map((s) => s.cerrar())),
  };
}

// Mediana (p50) en milisegundos de `n` ejecuciones de fn.
export async function p50(fn, n = 200) {
  const tiempos = [];
  for (let i = 0; i < n; i++) {
    const t = performance.now();
    await fn();
    tiempos.push(performance.now() - t);
  }
  return tiempos.sort((a, b) => a - b)[Math.floor(n / 2)];
}

// Granularidad: servicios por persona y pares de servicios que casi siempre cambian juntos (candidatos a fusionar).
// `cambios` es una lista de funcionalidades entregadas, cada una con los servicios que tocó.
// Solo se compara un par si los dos servicios aparecen al menos `minimo` veces (con 1 cambio no hay patrón).
export function granularidad({ servicios, desarrolladores, cambios: lista }, { umbral = 0.8, minimo = 2 } = {}) {
  const cambios = lista.map((c) => [...new Set(c)]); // un servicio cuenta una vez por cambio
  const multi = cambios.filter((c) => c.length > 1).length;
  const veces = new Map(servicios.map((s) => [s, 0]));
  for (const c of cambios) for (const s of c) veces.set(s, veces.get(s) + 1);
  const fusionar = [];
  for (let i = 0; i < servicios.length; i++)
    for (let j = i + 1; j < servicios.length; j++) {
      const [a, b] = [servicios[i], servicios[j]];
      const juntos = cambios.filter((c) => c.includes(a) && c.includes(b)).length;
      const base = Math.min(veces.get(a), veces.get(b));
      if (base >= minimo && juntos / base >= umbral) fusionar.push(`${a}+${b}`);
    }
  return {
    serviciosPorPersona: Math.round((servicios.length / desarrolladores) * 10) / 10,
    cambiosMultiServicio: `${Math.round((100 * multi) / cambios.length)} %`,
    fusionar,
  };
}
```

`f174-sobre-descomposicion/demo.js`:

```javascript
// Módulo 30 · F174 · Ejecuta: node f174-sobre-descomposicion/demo.js
// Los tiempos dependen de tu máquina; lo que no cambia es el número de llamadas y el orden de magnitud.
import { crearNanoservicios, granularidad, p50, totalEnProceso } from './nano.js';

const pedido = { id: 'P-1', lineas: [{ sku: 'TEC-1', precio: 120000, cantidad: 1 }, { sku: 'MOU-1', precio: 45000, cantidad: 2 }] };
const nano = await crearNanoservicios();
const a = totalEnProceso(pedido);
const b = await nano.total(pedido);
console.log(`Mismo resultado: en proceso total=${a.total} · nanoservicios total=${b.total} (${nano.llamadas} llamadas HTTP)`);
const tLocal = await p50(async () => totalEnProceso(pedido));
const tNano = await p50(() => nano.total(pedido));
console.log(`p50 en proceso: ${tLocal.toFixed(4)} ms · p50 nanoservicios: ${tNano.toFixed(2)} ms · ≈${Math.round(tNano / tLocal)} veces más lento`);
await nano.cerrar();

const g = granularidad({
  servicios: ['clientes', 'direcciones', 'pedidos', 'lineas-pedido', 'pagos', 'notificaciones'],
  desarrolladores: 4,
  cambios: [['clientes', 'direcciones'], ['pedidos', 'lineas-pedido'], ['pedidos', 'lineas-pedido', 'pagos'],
    ['clientes', 'direcciones', 'pedidos'], ['notificaciones'], ['pedidos', 'lineas-pedido']],
});
console.log(`Granularidad: ${g.serviciosPorPersona} servicios por persona · ${g.cambiosMultiServicio} de los cambios tocan varios servicios · fusionar: ${g.fusionar.join(', ')}`);
```

#### 10. MINI-LABORATORIO

1. Compara el cálculo en proceso con los nanoservicios y analiza la granularidad de la tienda:

```bash
node f174-sobre-descomposicion/demo.js
```

**Output esperado** (real; los tiempos de la segunda línea dependen de tu máquina, pero el orden de magnitud no: en
proceso, milésimas de milisegundo; con nanoservicios, milisegundos):

```text
Mismo resultado: en proceso total=224910 · nanoservicios total=224910 (4 llamadas HTTP)
p50 en proceso: 0.0010 ms · p50 nanoservicios: 2.38 ms · ≈2432 veces más lento
Granularidad: 1.5 servicios por persona · 83 % de los cambios tocan varios servicios · fusionar: clientes+direcciones, pedidos+lineas-pedido
```

2. Fusiona en la demo los pares que propone (`clientes` con `direcciones` y `pedidos` con `lineas-pedido`: cambia
   esos nombres en `servicios` y en `cambios`) y vuelve a ejecutar. **Output esperado:** 4 servicios, `1 servicios por
   persona` y el porcentaje de cambios multiservicio baja de 83 % a 33 %.

3. **Ejercicio de decisión (Respuesta correcta: no usar microservicios).** «Huerta Viva» es una tienda en línea de
   productos agrícolas con **4 desarrolladores**, un solo producto que lanzó hace tres meses, unos 300 pedidos al día
   y un dominio que cambia cada semana según lo que aprenden de los clientes. El líder técnico propone 12
   microservicios (clientes, direcciones, productos, precios, inventario, carrito, pedidos, líneas de pedido, pagos,
   envíos, notificaciones y reseñas) con Kafka y Kubernetes. ¿Qué arquitectura recomiendas? Escribe tu respuesta y
   su razonamiento antes de leer la solución.

   **Respuesta correcta: no usar microservicios.** Razonamiento:
   - **Equipo:** 4 personas son un solo equipo (Módulo 29): 12 servicios son 3 por persona, cada uno con su
     pipeline, alertas y guardia. Toda la capacidad se iría en operar plumbing.
   - **Dominio inestable:** las fronteras entre contextos aún no se conocen; con el dominio cambiando cada semana,
     casi todas las funcionalidades tocarían varios servicios (el 83 % de la demo, o más) y obligarían a cambiar
     contratos sin parar.
   - **Carga:** 300 pedidos al día los atiende con holgura un solo proceso con PostgreSQL; no hay ninguna parte con
     necesidades de escalado distintas.
   - **Coste:** Kafka y Kubernetes multiplican la infraestructura y la observabilidad (Módulo 28) sin un beneficio
     que lo compense.
   - **Recomendación:** un **monolito modular** con módulos por contexto (catálogo, compra, envíos), una base de datos
     con esquemas por módulo y fitness functions (ficha 4) que impidan que un módulo use los internos de otro. Así,
     si el negocio crece y aparece un segundo equipo o un módulo con necesidades distintas, se extrae ese módulo con
     el Strangler Fig (Módulo 31) sin rediseñar todo. Deja esta decisión en un ADR (Módulo 24) con las condiciones
     que harían revisarla.

#### 11. VERIFICACIÓN

Tests con servidores HTTP reales (`f174-sobre-descomposicion/nano.test.js`):

```javascript
// Módulo 30 · F174 · Tests con servidores HTTP reales. Ejecuta: node --test f174-sobre-descomposicion/nano.test.js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearNanoservicios, granularidad, p50, totalEnProceso } from './nano.js';

const pedido = { id: 'P-1', lineas: [{ sku: 'TEC-1', precio: 120000, cantidad: 1 }, { sku: 'MOU-1', precio: 45000, cantidad: 2 }] };

test('el cálculo en proceso da el total esperado', () => {
  // subtotal 210000 · descuento 21000 · IVA 35910 · envío 0 → 224910
  assert.equal(totalEnProceso(pedido).total, 224910);
});

test('los nanoservicios dan el mismo total con 4 llamadas HTTP por pedido', async () => {
  const nano = await crearNanoservicios();
  assert.equal((await nano.total(pedido)).total, 224910);
  assert.equal(nano.llamadas, 4);
  await nano.cerrar();
});

test('la red cuesta: los nanoservicios son al menos 10 veces más lentos', async () => {
  const nano = await crearNanoservicios();
  const local = await p50(async () => totalEnProceso(pedido), 50);
  const remoto = await p50(() => nano.total(pedido), 50);
  await nano.cerrar();
  assert.ok(remoto > local * 10, `local ${local} ms, remoto ${remoto} ms`);
});

test('granularidad: servicios que siempre cambian juntos son candidatos a fusionar', () => {
  const g = granularidad({ servicios: ['a', 'b', 'c'], desarrolladores: 2, cambios: [['a', 'b'], ['a', 'b'], ['c']] });
  assert.deepEqual(g, { serviciosPorPersona: 1.5, cambiosMultiServicio: '67 %', fusionar: ['a+b'] });
});
```

```bash
node --test --test-reporter=spec f174-sobre-descomposicion/nano.test.js
```

**Output esperado** (real): `ℹ tests 4` y `ℹ pass 4`.

**Pregunta de comprobación:** el test de latencia exige «al menos 10 veces más lento», no un número exacto de
milisegundos. ¿Por qué? (Porque el tiempo absoluto depende de la máquina y de la carga del momento; la relación entre
una llamada en proceso y cuatro llamadas HTTP es estable en cualquier máquina y es lo que importa para decidir.)

#### 12. ERROR COMÚN

**Síntoma:** cada funcionalidad del área de clientes necesita tres PRs en tres repositorios y tres despliegues
coordinados. **Causa:** se creó un microservicio por entidad (clientes, direcciones, teléfonos) cuando las tres forman
un solo agregado, `Cliente`, que cambia junto.

```javascript
// Módulo 30 · F174 · Error común: un microservicio por entidad (clientes, direcciones, teléfonos…).
// Las entidades de un mismo agregado cambian juntas: cada funcionalidad toca 2 o 3 servicios y 2 o 3 despliegues.
// Ejecuta: node f174-sobre-descomposicion/error-comun.js
import { granularidad } from './nano.js';

const cambios = [ // las últimas 5 funcionalidades del área de clientes
  ['clientes-svc', 'direcciones-svc'], ['clientes-svc', 'telefonos-svc'], ['clientes-svc', 'direcciones-svc', 'telefonos-svc'],
  ['direcciones-svc', 'clientes-svc'], ['clientes-svc', 'telefonos-svc'],
];
const mal = granularidad({ servicios: ['clientes-svc', 'direcciones-svc', 'telefonos-svc'], desarrolladores: 3, cambios });
console.log(`MAL  → un servicio por entidad: ${mal.cambiosMultiServicio} de los cambios tocan varios servicios · fusionar: ${mal.fusionar.join(', ')}`);

const juntos = cambios.map(() => ['clientes-svc']); // el agregado Cliente en un solo servicio
const bien = granularidad({ servicios: ['clientes-svc'], desarrolladores: 3, cambios: juntos });
console.log(`BIEN → un servicio por agregado: ${bien.cambiosMultiServicio} de los cambios tocan varios servicios`);
```

Salida real de `node f174-sobre-descomposicion/error-comun.js`:

```text
MAL  → un servicio por entidad: 100 % de los cambios tocan varios servicios · fusionar: clientes-svc+direcciones-svc, clientes-svc+telefonos-svc
BIEN → un servicio por agregado: 0 % de los cambios tocan varios servicios
```

**Diagnóstico visual:** una matriz de servicios × servicios con el número de funcionalidades que los cambiaron juntos
(sacada de los PRs enlazados a cada historia): los bloques oscuros fuera de la diagonal son los servicios que en
realidad son uno. **Arreglo:** fusionar por agregado o por bounded context; las entidades de un agregado comparten
transacción y ciclo de cambio, y deben vivir en el mismo servicio.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo sabes si un sistema tiene demasiados microservicios y qué haces?**

**Respuesta modelo:** lo mido. Miro cuántos servicios hay por persona del equipo, qué porcentaje de funcionalidades
obliga a cambiar y desplegar varios servicios, y qué pares de servicios cambian juntos casi siempre; también la
latencia y el número de saltos de red de las peticiones más comunes. Si cada persona mantiene varios servicios, la
mayoría de los cambios tocan varios y hay pares que siempre cambian juntos, el sistema está sobre-descompuesto. Lo
arreglo fusionando esos pares en servicios por agregado o por bounded context, o, si el equipo es pequeño y el dominio
aún cambia mucho, volviendo a un monolito modular con fronteras vigiladas por fitness functions. Solo separo algo
pequeño si hay una razón concreta: escalado distinto, aislamiento de fallos o de seguridad, un ciclo de despliegue
propio o un equipo dueño distinto.

#### 14. ANTI-PATRÓN RELACIONADO

**Nanoservicios / microservicios por entidad**: un servicio por tabla, cada uno con su CRUD, y la lógica de negocio
repartida en un orquestador que los llama a todos.

```mermaid
flowchart LR
    O["orquestador<br/>(toda la lógica)"] --> C["clientes-svc<br/>(CRUD)"]
    O --> D["direcciones-svc<br/>(CRUD)"]
    O --> T["telefonos-svc<br/>(CRUD)"]
    O --> P["preferencias-svc<br/>(CRUD)"]
```

**Texto alternativo:** un orquestador que contiene toda la lógica de negocio llama a cuatro servicios CRUD, uno por
entidad: clientes, direcciones, teléfonos y preferencias. Los servicios no tienen comportamiento propio: son tablas
detrás de HTTP.

---

### Sagas innecesarias

#### 1. UBICACIÓN

Módulo 30, Lección 3 de 4 · Fase 3 · Laboratorio `examples/microservicios/modulo-34/f175-sagas-innecesarias/`.

#### 2. PRERREQUISITOS

- Transacciones y `BEGIN … COMMIT` en PostgreSQL (Módulo 15, ficha 4, o Módulo 2, ficha 4).
- Sagas coreografiadas y compensaciones idempotentes (Módulo 22, fichas 3 y 4) y sagas orquestadas con Temporal
  (Módulo 25, ficha 2).
- Sobre-descomposición (ficha 2).

#### 3. OBJETIVO DE APRENDIZAJE

**Comparar** en PostgreSQL la misma operación (reservar stock, crear pedido y sumar puntos) hecha con una transacción
local y con una saga, **observar** lo que la saga añade (estado intermedio visible, código de compensación y nuevos
modos de fallo) y **decidir** cuándo una saga está justificada. Lo compruebas cuando `sagas.test.js` pasa 5 de 5 y
sabes explicar en qué condición concreta pondrías una saga.

#### 4. ANALOGÍA VISUAL

Dibuja **una compra en una sola tienda**: pones en el mostrador la leche, el pan y el queso, pagas una vez y te los
llevas; si la tarjeta falla, la cajera **no te cobra nada y todo vuelve a la estantería** de golpe. Ahora dibuja la
misma compra **como si fueran tres tiendas**, aunque estén en el mismo mostrador: pagas la leche, pagas el pan, y al
pagar el queso la tarjeta falla; tienes que **ir a devolver** el pan y luego la leche, rellenar dos hojas de
devolución y esperar. Mientras tanto, otro cliente vio la estantería sin leche. Y si te vas antes de devolver el pan,
nadie lo devuelve.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TB
    subgraph TX["Transacción local (un servicio, una BD)"]
        direction LR
        B["BEGIN"] --> R1["UPDATE stock"] --> R2["INSERT pedido"] --> R3["UPDATE puntos ✘"] --> RB["ROLLBACK<br/>stock=10 · 0 pedidos"]
    end
    subgraph SG["Saga (pasos confirmados por separado)"]
        direction LR
        S1["reservar stock ✔<br/>(commit)"] --> S2["crear pedido ✔<br/>(commit)"] --> S3["sumar puntos ✘"]
        S3 --> C2["compensar: cancelar pedido"] --> C1["compensar: liberar stock"]
        S2 -. "otro usuario ve<br/>stock=8 · pendiente" .-> V["lectura concurrente"]
    end
```

**Texto alternativo:** arriba, la transacción local: BEGIN, UPDATE del stock, INSERT del pedido y UPDATE de puntos
que falla; el ROLLBACK deja stock 10 y ningún pedido. Abajo, la saga: reservar stock y crear pedido se confirman por
separado, sumar puntos falla y se compensa en orden inverso, primero cancelando el pedido y después liberando el
stock. Entre medias, una lectura concurrente ve stock 8 y un pedido pendiente.

#### 6. EXPLICACIÓN NIVEL 0

- Una **saga** es una forma de hacer una operación de varios pasos cuando los pasos están en **sistemas distintos**
  que no pueden confirmar juntos: si un paso falla, se **deshacen a mano** los anteriores.
- Una **transacción** de base de datos hace lo mismo **sola**: o se guardan todos los cambios o ninguno.
- Si todos los datos están en **la misma base de datos** y los maneja **el mismo servicio**, una transacción es más
  sencilla y más segura. Una saga ahí es complicarse sin necesidad.

#### 7. EXPLICACIÓN INTERMEDIA

- **Transacción local** (`comprarConTransaccion`): `BEGIN`, tres sentencias y `COMMIT`; si `sumarPuntos` falla
  (`cliente beto bloqueado`), `ROLLBACK` deja **exactamente** el estado anterior: `stock=10`, sin pedidos. Ningún
  otro usuario vio nada intermedio (aislamiento *read committed* de PostgreSQL).
- **Saga** (`comprarConSaga`): cada paso confirma solo. Lo que cambia:
  1. **Estado intermedio visible:** entre pasos, otro usuario ve `stock=8` y un pedido `pendiente` (la «I» de ACID
     se pierde; en la jerga de sagas, falta aislamiento).
  2. **Rastro:** tras compensar queda un pedido `cancelado` que hay que tratar en informes y en la interfaz.
  3. **Nuevos fallos:** si el proceso muere a mitad de la compensación, el stock queda reservado para siempre
     (`stock=8` con el pedido cancelado) hasta que alguien lo detecte. Por eso las sagas reales usan un orquestador
     duradero (Temporal, Módulo 25) que reintenta… y entonces la compensación tiene que ser idempotente (error común).
- **La regla:** una saga solo tiene sentido cuando los pasos están en **fronteras transaccionales distintas** que no
  puedes juntar: servicios con bases de datos propias por una buena razón, o un sistema externo (una pasarela de
  pago, una API de un transportista).

#### 8. EXPLICACIÓN MAESTRA

- **Por qué aparecen sagas innecesarias.** Casi siempre por sobre-descomposición (ficha 2): stock, pedido y puntos se
  pusieron en tres servicios, así que una operación que era una transacción se convirtió en un problema distribuido.
  Otras veces por moda: «usamos sagas porque somos microservicios», aunque los datos vivan en la misma base.
- **La pregunta correcta antes de diseñar una saga:** ¿estos pasos **deben** estar en servicios distintos? Si la
  respuesta es «no» (mismo equipo, mismo ciclo de cambio, mismo agregado o contexto), júntalos y usa una transacción.
  Si es «sí», la saga es el precio de esa independencia y hay que pagarlo bien: orquestador duradero, compensaciones
  idempotentes, estados semánticos (`pendiente`) y contramedidas para la falta de aislamiento.
- **Alternativas a una saga:** (1) **transacción local** en un servicio que contiene a todos los participantes;
  (2) **outbox** (Módulo 25): una transacción local guarda el cambio y el evento, y los demás servicios reaccionan sin
  necesidad de compensar (consistencia eventual sin pasos que deshacer); (3) **reservas con caducidad** (el stock se
  libera solo pasado un tiempo), que reducen la necesidad de compensar a mano; (4) **rediseñar el proceso** para que
  el paso que puede fallar vaya primero (validar al cliente antes de reservar).
- **Lo que NO es la alternativa:** Two-Phase Commit entre servicios (Módulo 25, ficha 5): bloquea y acopla más que la
  saga.
- **Cuándo una saga SÍ está justificada:** hay un sistema externo (cobrar en una pasarela no admite `ROLLBACK`),
  servicios con dueños y bases distintos por razones reales, o procesos largos (horas o días) en los que no puedes
  tener una transacción abierta.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **pg 8.23.1** y **PostgreSQL 18.7** (`docker-compose.yml` del laboratorio; con
PostgreSQL 14 o posterior funciona igual).

`f175-sagas-innecesarias/tienda.js`:

```javascript
// Módulo 30 · F175 · Sagas innecesarias: stock, pedido y puntos de fidelidad viven en el MISMO servicio y la MISMA
// base de datos. Lo comparamos hecho con una transacción local (BEGIN … COMMIT) y con una saga con compensaciones.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1 y PostgreSQL (18.7 en docker-compose.yml; sirve 14 o posterior).
import pg from 'pg';
import { PG_URL } from '../comun/config.js';

export const crearPool = (url = PG_URL) => new pg.Pool({ connectionString: url, max: 5 });

export async function preparar(pool) {
  await pool.query(`
    DROP TABLE IF EXISTS f175_pedidos, f175_stock, f175_clientes;
    CREATE TABLE f175_stock (sku text PRIMARY KEY, disponible int NOT NULL CHECK (disponible >= 0));
    CREATE TABLE f175_pedidos (id text PRIMARY KEY, sku text NOT NULL, cantidad int NOT NULL, estado text NOT NULL);
    CREATE TABLE f175_clientes (id text PRIMARY KEY, puntos int NOT NULL DEFAULT 0, bloqueado boolean NOT NULL DEFAULT false);
    INSERT INTO f175_stock VALUES ('TEC-1', 10);
    INSERT INTO f175_clientes (id, bloqueado) VALUES ('ana', false), ('beto', true);`);
}

export async function estado(pool) {
  const { rows: [s] } = await pool.query("SELECT disponible FROM f175_stock WHERE sku = 'TEC-1'");
  const { rows } = await pool.query('SELECT estado, count(*)::int AS n FROM f175_pedidos GROUP BY estado ORDER BY estado');
  return { stock: s.disponible, pedidos: Object.fromEntries(rows.map((r) => [r.estado, r.n])) };
}

// Los tres pasos, escritos para recibir cualquier cliente SQL (una conexión dentro de una transacción o el pool).
async function reservarStock(db, { sku, cantidad }) {
  const r = await db.query('UPDATE f175_stock SET disponible = disponible - $2 WHERE sku = $1 AND disponible >= $2', [sku, cantidad]);
  if (r.rowCount === 0) throw new Error('sin stock');
}
async function crearPedido(db, { id, sku, cantidad }, estadoInicial) {
  await db.query('INSERT INTO f175_pedidos VALUES ($1, $2, $3, $4)', [id, sku, cantidad, estadoInicial]);
}
async function sumarPuntos(db, { cliente, cantidad }) {
  const r = await db.query('UPDATE f175_clientes SET puntos = puntos + $2 WHERE id = $1 AND NOT bloqueado', [cliente, cantidad * 10]);
  if (r.rowCount === 0) throw new Error(`cliente ${cliente} bloqueado`);
}

// OPCIÓN A · Transacción local: todo o nada, sin estados intermedios visibles y sin código de compensación.
export async function comprarConTransaccion(pool, pedido) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await reservarStock(c, pedido);
    await crearPedido(c, pedido, 'confirmado');
    await sumarPuntos(c, pedido);
    await c.query('COMMIT');
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally {
    c.release();
  }
}

// OPCIÓN B · Saga: cada paso confirma por separado; si uno falla, se compensan los anteriores en orden inverso.
// `observar` se llama entre pasos (para ver lo que vería otro usuario); `fallarCompensacion` simula una caída a mitad.
export async function comprarConSaga(pool, pedido, { observar = async () => {}, fallarCompensacion = false } = {}) {
  await reservarStock(pool, pedido);
  await crearPedido(pool, pedido, 'pendiente');
  await observar();
  try {
    await sumarPuntos(pool, pedido);
    await pool.query("UPDATE f175_pedidos SET estado = 'confirmado' WHERE id = $1", [pedido.id]);
  } catch (error) {
    await compensar(pool, pedido, { fallarCompensacion });
    throw error;
  }
}

// Compensación idempotente: solo libera el stock si ESTA llamada movió el pedido de «pendiente» a «cancelado».
export async function compensar(pool, pedido, { fallarCompensacion = false, idempotente = true } = {}) {
  const r = idempotente
    ? await pool.query("UPDATE f175_pedidos SET estado = 'cancelado' WHERE id = $1 AND estado = 'pendiente'", [pedido.id])
    : await pool.query("UPDATE f175_pedidos SET estado = 'cancelado' WHERE id = $1", [pedido.id]);
  if (fallarCompensacion) throw new Error('el proceso murió antes de liberar el stock');
  if (r.rowCount === 1)
    await pool.query('UPDATE f175_stock SET disponible = disponible + $2 WHERE sku = $1', [pedido.sku, pedido.cantidad]);
}
```

`f175-sagas-innecesarias/demo.js`:

```javascript
// Módulo 30 · F175 · Ejecuta (con PostgreSQL arriba): node f175-sagas-innecesarias/demo.js
// beto está bloqueado: el tercer paso (sumar puntos) falla siempre. ¿Qué queda en la base de datos?
import { comprarConSaga, comprarConTransaccion, crearPool, estado, preparar } from './tienda.js';

const pool = crearPool();
const pedido = { id: 'P-1', sku: 'TEC-1', cantidad: 2, cliente: 'beto' };
const fmt = (e) => `stock=${e.stock} · pedidos=${JSON.stringify(e.pedidos)}`;

await preparar(pool);
await comprarConTransaccion(pool, pedido).catch(async (e) => console.log(`Transacción: falla «${e.message}» → ${fmt(await estado(pool))}`));

await preparar(pool);
await comprarConSaga(pool, pedido, {
  observar: async () => console.log(`Saga, a mitad (lo que ve otro usuario): ${fmt(await estado(pool))}`),
}).catch(async (e) => console.log(`Saga: falla «${e.message}» y compensa → ${fmt(await estado(pool))}`));

await preparar(pool);
await comprarConSaga(pool, pedido, { fallarCompensacion: true })
  .catch(async (e) => console.log(`Saga con caída al compensar («${e.message}») → ${fmt(await estado(pool))}`));
await pool.end();
```

#### 10. MINI-LABORATORIO

1. Levanta PostgreSQL y compara las tres ejecuciones (transacción, saga y saga con caída al compensar):

```bash
docker compose up -d --wait
node f175-sagas-innecesarias/demo.js
```

**Output esperado** (real, con PostgreSQL 16.15 en el entorno de autoría; con 18.7 es el mismo):

```text
Transacción: falla «cliente beto bloqueado» → stock=10 · pedidos={}
Saga, a mitad (lo que ve otro usuario): stock=8 · pedidos={"pendiente":1}
Saga: falla «cliente beto bloqueado» y compensa → stock=10 · pedidos={"cancelado":1}
Saga con caída al compensar («el proceso murió antes de liberar el stock») → stock=8 · pedidos={"cancelado":1}
```

2. Mira las tablas después de la última ejecución:

```bash
docker compose exec postgres psql -U academia -d academia -c "SELECT * FROM f175_pedidos" -c "SELECT * FROM f175_stock"
```

**Output esperado:** el pedido `P-1` con `estado = cancelado` y `TEC-1` con `disponible = 8`. **Captura comentada:**
dos unidades «reservadas» por un pedido cancelado; nadie las venderá hasta que un proceso de conciliación las libere.

3. Cuenta el código: en `tienda.js`, la opción A son 15 líneas y no tiene función de compensación; la opción B
   necesita `comprarConSaga` y `compensar`, un estado `pendiente` y su gestión. **Captura comentada:** una tabla con
   «líneas», «estados posibles del pedido» y «formas de fallar» para cada opción.

#### 11. VERIFICACIÓN

Tests con PostgreSQL real (`f175-sagas-innecesarias/sagas.test.js`):

```javascript
// Módulo 30 · F175 · Tests con PostgreSQL real. Ejecuta: node --test f175-sagas-innecesarias/sagas.test.js
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { comprarConSaga, comprarConTransaccion, compensar, crearPool, estado, preparar } from './tienda.js';

const pool = crearPool();
after(() => pool.end());
beforeEach(() => preparar(pool));
const pedido = (cliente) => ({ id: 'P-1', sku: 'TEC-1', cantidad: 2, cliente });

test('transacción: si el último paso falla, no queda NADA (ni stock reservado ni pedido)', async () => {
  await assert.rejects(comprarConTransaccion(pool, pedido('beto')), /cliente beto bloqueado/);
  assert.deepEqual(await estado(pool), { stock: 10, pedidos: {} });
});

test('transacción: el camino feliz confirma los tres cambios a la vez', async () => {
  await comprarConTransaccion(pool, pedido('ana'));
  assert.deepEqual(await estado(pool), { stock: 8, pedidos: { confirmado: 1 } });
});

test('saga: otro usuario ve el estado intermedio y queda un pedido cancelado', async () => {
  let intermedio;
  await assert.rejects(comprarConSaga(pool, pedido('beto'), { observar: async () => { intermedio = await estado(pool); } }));
  assert.deepEqual(intermedio, { stock: 8, pedidos: { pendiente: 1 } });
  assert.deepEqual(await estado(pool), { stock: 10, pedidos: { cancelado: 1 } });
});

test('saga: si el proceso muere al compensar, el stock queda perdido', async () => {
  await assert.rejects(comprarConSaga(pool, pedido('beto'), { fallarCompensacion: true }));
  assert.deepEqual(await estado(pool), { stock: 8, pedidos: { cancelado: 1 } });
});

test('compensación idempotente: repetirla no devuelve el stock dos veces', async () => {
  await assert.rejects(comprarConSaga(pool, pedido('beto')));
  await compensar(pool, pedido('beto')); // reintento tras un timeout
  assert.equal((await estado(pool)).stock, 10);
});
```

```bash
node --test --test-reporter=spec f175-sagas-innecesarias/sagas.test.js
```

**Output esperado** (real): `ℹ tests 5` y `ℹ pass 5`.

**Pregunta de comprobación:** el negocio pide además cobrar en una pasarela de pago externa dentro de la misma compra.
¿Sigue sobrando la saga? (Para stock, pedido y puntos, sí: van juntos en una transacción. Pero el cobro externo no
admite `ROLLBACK`, así que la operación completa pasa a ser una saga de **dos** pasos: transacción local, cobro y,
si el cobro falla, una compensación local. La saga se ajusta a la frontera real, no a cada tabla.)

#### 12. ERROR COMÚN

**Síntoma:** el inventario muestra más unidades de las que hay en el almacén, siempre después de picos de errores en
el pago. **Causa:** la compensación «liberar stock» no es idempotente; el orquestador no recibe la respuesta (timeout)
y la reintenta, y el stock se suma dos veces.

```javascript
// Módulo 30 · F175 · Error común: compensación no idempotente. El orquestador no recibe respuesta (timeout) y la
// reintenta: el stock se libera dos veces y aparecen unidades que no existen. Ejecuta: node f175-sagas-innecesarias/error-comun.js
import { comprarConSaga, compensar, crearPool, estado, preparar } from './tienda.js';

const pool = crearPool();
const pedido = { id: 'P-1', sku: 'TEC-1', cantidad: 2, cliente: 'beto' };
for (const idempotente of [false, true]) {
  await preparar(pool);
  await comprarConSaga(pool, pedido).catch(() => {}); // falla en «sumar puntos» y compensa una vez
  await compensar(pool, pedido, { idempotente }); // el reintento
  const { stock } = await estado(pool);
  console.log(`${idempotente ? 'BIEN → compensación idempotente' : 'MAL  → compensación repetida  '}: stock = ${stock} (había 10)`);
}
await pool.end();
```

Salida real de `node f175-sagas-innecesarias/error-comun.js`:

```text
MAL  → compensación repetida  : stock = 12 (había 10)
BIEN → compensación idempotente: stock = 10 (había 10)
```

**Diagnóstico visual:** compara cada noche el stock del sistema con el inventario físico (o con la suma de
movimientos): las diferencias positivas coinciden con los reintentos de compensación en los logs del orquestador.
**Arreglo:** compensación condicionada a una transición de estado (`UPDATE … SET estado = 'cancelado' WHERE estado =
'pendiente'` y solo liberar si cambió una fila), o una tabla de compensaciones aplicadas con clave única. Y, antes que
nada, preguntarse si la saga hace falta.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cuándo NO usarías una saga?**

**Respuesta modelo:** cuando todos los pasos viven en la misma frontera transaccional: el mismo servicio y la misma
base de datos. Ahí una transacción local da atomicidad y aislamiento gratis, mientras que una saga expone estados
intermedios a otros usuarios, deja rastros como pedidos cancelados, exige compensaciones idempotentes y añade fallos
nuevos, como un proceso que muere a mitad de la compensación y deja stock reservado. Si veo una saga entre tablas de
un mismo equipo, lo primero que sospecho es sobre-descomposición y propongo juntar esos pasos. Uso saga solo cuando
hay una frontera real que no puedo juntar: un sistema externo como una pasarela de pago, servicios con bases propias
por razones de negocio o procesos largos. Y entonces la hago bien: orquestador duradero, estados semánticos y
compensaciones idempotentes. Tampoco la sustituyo por 2PC entre servicios.

#### 14. ANTI-PATRÓN RELACIONADO

**La saga por defecto**: cualquier operación de más de un paso se modela como saga con orquestador, aunque los pasos
compartan base de datos.

```mermaid
flowchart LR
    O["orquestador de sagas"] --> A["paso: UPDATE stock<br/>(BD tienda)"]
    O --> B["paso: INSERT pedido<br/>(BD tienda)"]
    O --> C["paso: UPDATE puntos<br/>(BD tienda)"]
    A -.-> BD[("una sola BD")]
    B -.-> BD
    C -.-> BD
```

**Texto alternativo:** un orquestador de sagas coordina tres pasos, actualizar stock, insertar pedido y actualizar
puntos, y los tres escriben en la misma base de datos tienda: una transacción haría lo mismo sin orquestador.

---

### Fitness functions

#### 1. UBICACIÓN

Módulo 30, Lección 4 de 4 · Fase 3 · Laboratorio `examples/microservicios/modulo-34/f176-fitness-functions/`.

#### 2. PRERREQUISITOS

- Fitness functions en producción (Módulo 24, ficha 4): allí se evalúan con métricas reales; aquí, en el build.
- ArchUnit (Módulo 3, ficha 4), su equivalente en Java.
- Los tres anti-patrones de este módulo (fichas 1 a 3).
- `node:test` y expresiones regulares (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Escribir** fitness functions que se ejecutan como tests en cada build y detectan los anti-patrones de este módulo
antes de que lleguen a producción (acceso a internos de otro servicio, ciclos entre servicios y un presupuesto de
latencia), **hacer** que rompan el pipeline con código de salida distinto de 0 y **evitar** que midan mal. Lo
compruebas cuando `fitness.test.js` pasa 4 de 4 y `demo.js` termina con código 1 sobre `ejemplo-roto`.

#### 4. ANALOGÍA VISUAL

Dibuja **el detector de metales de un aeropuerto**. No pregunta a cada pasajero si lleva algo prohibido ni confía en
que el reglamento esté colgado en la pared: **todos pasan por el arco**, cada vez, y si pita, no embarcas. Las reglas
son objetivas (metal sí o no) y la comprobación es automática. Pero un arco **mal calibrado** que no detecta la
cerámica da una falsa sensación de seguridad: peor que no tener arco, porque nadie revisa a mano.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    PR["pull request"] --> CI["pipeline de CI"]
    CI --> T["tests unitarios"]
    CI --> FF1["FF1: ningún import de<br/>servicios/otro/ fuera de api/"]
    CI --> FF2["FF2: sin ciclos<br/>entre servicios"]
    CI --> FF3["FF3: p95 ≤ presupuesto"]
    FF1 & FF2 & FF3 --> G{"¿todas<br/>pasan?"}
    G -->|"sí"| M["merge y despliegue"]
    G -->|"no (código 1)"| X["build roto:<br/>se discute o se corrige"]
```

**Texto alternativo:** un pull request entra en el pipeline de CI, que ejecuta los tests unitarios y tres fitness
functions: FF1, ningún import de otro servicio fuera de su carpeta api; FF2, sin ciclos entre servicios; FF3, el p95
dentro del presupuesto. Si todas pasan, se hace merge y despliegue; si alguna falla, el build termina con código 1 y
el cambio se corrige o se discute.

#### 6. EXPLICACIÓN NIVEL 0

- Una **fitness function** es una **comprobación automática** de que la arquitectura sigue cumpliendo una regla que
  decidimos, por ejemplo «el servicio de pedidos no puede tocar las tablas de pagos».
- Se escribe **como un test** y se ejecuta **siempre**, en cada cambio. Si la regla se rompe, el cambio no entra.
- Así las decisiones de arquitectura no dependen de que alguien se acuerde de revisarlas.

#### 7. EXPLICACIÓN INTERMEDIA

- **Definición.** El Technology Radar de Thoughtworks la recoge así: «An architectural fitness function, as defined in
  Building Evolutionary Architectures, provides an objective integrity assessment of some architectural
  characteristics», y puede incluir criterios de verificación existentes como tests unitarios, métricas o monitores.
- **FF1 · acoplamiento** (`sinInternosAjenos`): un archivo de `servicios/A/` solo puede importar de `servicios/B/` lo
  que está en `servicios/B/api/`. Detecta el camino hacia el monolito distribuido (ficha 1): cuando un servicio usa
  los internos de otro, ya no pueden cambiar por separado.
- **FF2 · ciclos** (`ciclosEntreServicios`): si `pedidos` depende de `pagos` y `pagos` de `pedidos`, ninguno se
  puede desplegar ni razonar por separado. `ejemplo-roto` tiene `pagos → pedidos → pagos`.
- **FF3 · presupuesto de latencia** (`presupuestoLatencia`): el p95 de `n` peticiones reales debe caber en el
  presupuesto. En el build se ejecuta contra el servicio arrancado en el pipeline; en producción, con métricas
  (Módulo 24).
- **Romper el build:** `demo.js` termina con `process.exitCode = 1` si hay violaciones; en CI eso detiene el
  pipeline, igual que un test que falla.

#### 8. EXPLICACIÓN MAESTRA

- **Clasificación útil:** **atómicas** (una característica, como los imports) o **holísticas** (varias a la vez, como
  latencia bajo carga); **disparadas** (en cada build) o **continuas** (en producción, Módulo 24); **estáticas**
  (analizan el código) o **dinámicas** (ejecutan el sistema). Este módulo cubre estáticas disparadas (FF1, FF2) y una
  dinámica disparada (FF3).
- **Cómo elegir qué vigilar:** cada fitness function debería salir de una decisión escrita (un ADR, Módulo 24) o de
  un anti-patrón que ya te ha pasado. Una por cada riesgo de este módulo es un buen comienzo: imports a internos
  (monolito distribuido), servicios que cambian siempre juntos (sobre-descomposición, con el análisis de la ficha 2
  sobre el historial) y número de pasos de una saga entre servicios con la misma base de datos (sagas innecesarias).
- **Alternativas y herramientas:** (1) **ArchUnit 1.5.1** en Java (Módulo 3), con reglas como
  `noClasses().that().resideInAPackage("..pedidos..").should().dependOnClassesThat().resideInAPackage("..pagos.interno..")`;
  (2) **dependency-cruiser 18.8.0** en Node (npm, consultado el 2026-11-20; acepta Node `^22||^24||>=26`), que lee
  los imports con un parser real en lugar de expresiones regulares y genera grafos; (3) **Spring Modulith**
  (Módulo 5), que verifica módulos en un monolito modular; (4) tests a medida como los de este laboratorio, sin
  dependencias, cuando la regla es específica de tu sistema.
- **Trade-offs:** una expresión regular es simple y rápida pero puede no ver formas de importar (error común); un
  parser es exacto pero añade una dependencia que mantener. Un presupuesto de latencia en el build es ruidoso en
  máquinas compartidas: mide percentiles con suficientes muestras y deja margen, o llévalo a producción.
- **Cuándo NO escribir una fitness function:** para una regla que nadie ha decidido (primero el ADR) o que no puedes
  medir de forma objetiva. Una regla que «solo avisa» y nunca rompe el build se ignora en dos semanas.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, sin dependencias de npm (`node:fs`, `node:path`, `node:perf_hooks`, `fetch`).

`f176-fitness-functions/fitness.js`:

```javascript
// Módulo 30 · F176 · Fitness functions: comprobaciones automáticas y objetivas de una característica de la arquitectura
// que se ejecutan en cada build (como cualquier test) y fallan si la arquitectura se degrada.
//  1. Acoplamiento: un servicio solo puede importar la carpeta api/ de otro, nunca sus internos.
//  2. Ciclos: no hay dependencias circulares entre servicios.
//  3. Latencia: el p95 de un endpoint real cabe en su presupuesto.
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { performance } from 'node:perf_hooks';

// Todas las formas de importar en Node: import/export … from, import('…') dinámico y require('…').
const COMPLETA = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)['"]([^'"]+)['"]/gm;
// Versión ingenua (error común): solo ve «… from '…'».
export const INGENUA = /\bfrom\s*['"]([^'"]+)['"]/gm;

// Grafo de importaciones relativas: { 'servicios/pedidos/index.js': ['servicios/pagos/api/cliente.js', …] }.
export function grafoDeImportaciones(raiz, patron = COMPLETA) {
  const grafo = {};
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const ruta = join(dir, e.name);
      if (e.isDirectory()) recorrer(ruta);
      else if (e.name.endsWith('.js')) {
        const origen = relative(raiz, ruta);
        const codigo = readFileSync(ruta, 'utf8');
        grafo[origen] = [...codigo.matchAll(new RegExp(patron.source, patron.flags))]
          .map((m) => m[1])
          .filter((m) => m.startsWith('.'))
          .map((m) => normalize(join(dirname(origen), m)));
      }
    }
  };
  recorrer(raiz);
  return grafo;
}

const servicioDe = (ruta) => ruta.match(/^servicios\/([^/]+)\//)?.[1];

// Fitness function 1: nadie importa los internos de otro servicio (solo servicios/<otro>/api/).
export function sinInternosAjenos(grafo) {
  const violaciones = [];
  for (const [origen, destinos] of Object.entries(grafo))
    for (const destino of destinos) {
      const [a, b] = [servicioDe(origen), servicioDe(destino)];
      if (a && b && a !== b && !destino.startsWith(`servicios/${b}/api/`)) violaciones.push(`${origen} → ${destino}`);
    }
  return violaciones;
}

// Fitness function 2: el grafo de servicios no tiene ciclos. Devuelve los ciclos encontrados («a → b → a»).
export function ciclosEntreServicios(grafo) {
  const aristas = new Map();
  for (const [origen, destinos] of Object.entries(grafo))
    for (const destino of destinos) {
      const [a, b] = [servicioDe(origen), servicioDe(destino)];
      if (a && b && a !== b) aristas.set(a, new Set([...(aristas.get(a) ?? []), b]));
    }
  const ciclos = new Set();
  const visitar = (nodo, camino) => {
    if (camino.includes(nodo)) {
      const ciclo = camino.slice(camino.indexOf(nodo));
      const inicio = ciclo.indexOf([...ciclo].sort()[0]); // forma canónica: empieza por el menor
      ciclos.add([...ciclo.slice(inicio), ...ciclo.slice(0, inicio), ciclo[inicio]].join(' → '));
      return;
    }
    for (const sig of aristas.get(nodo) ?? []) visitar(sig, [...camino, nodo]);
  };
  for (const nodo of aristas.keys()) visitar(nodo, []);
  return [...ciclos];
}

// Fitness function 3: p95 de `n` peticiones reales a `url` frente al presupuesto.
export async function presupuestoLatencia(url, { n = 50, p95MaxMs }) {
  const tiempos = [];
  for (let i = 0; i < n; i++) {
    const t = performance.now();
    const r = await fetch(url);
    await r.arrayBuffer();
    tiempos.push(performance.now() - t);
  }
  tiempos.sort((a, b) => a - b);
  const p95 = tiempos[Math.ceil(0.95 * n) - 1];
  return { p95: Math.round(p95 * 10) / 10, p95MaxMs, cumple: p95 <= p95MaxMs };
}
```

Los dos proyectos de ejemplo. `ejemplo-ok/servicios/pedidos/index.js` usa solo la API de pagos:

```javascript
// pedidos usa SOLO la API pública de pagos.
import { cotizar } from '../pagos/api/cliente.js';
export const cerrarPedido = (total) => cotizar(total);
```

`ejemplo-roto/servicios/pedidos/index.js` se salta la API:

```javascript
// pedidos se salta la API y lee la tarifa interna de pagos.
import { comision } from '../pagos/interno/tarifas.js';
import { cotizar } from '../pagos/api/cliente.js';
export const cerrarPedido = (total) => ({ ...cotizar(total), comisionDirecta: comision(total) });
```

`ejemplo-roto/servicios/pagos/api/cliente.js` crea un ciclo:

```javascript
// pagos ahora importa algo de pedidos → ciclo pedidos ↔ pagos.
import { comision } from '../interno/tarifas.js';
import { cerrarPedido } from '../../pedidos/index.js';
export const cotizar = (valor) => ({ valor, comision: comision(valor) });
export const reintentar = (total) => cerrarPedido(total);
```

`ejemplo-roto/servicios/envios/index.js` lee un interno con `import()` dinámico:

```javascript
// envios también lee la tarifa interna, pero con import() dinámico (más difícil de ver).
export async function costoEnvio(valor) {
  const { comision } = await import('../pagos/interno/tarifas.js');
  return 12000 + comision(valor);
}
```

(`servicios/pagos/interno/tarifas.js` y `servicios/pagos/api/cliente.js` de `ejemplo-ok` están en el laboratorio:
una función `comision` y un `cotizar` que la usa.)

`f176-fitness-functions/demo.js`:

```javascript
// Módulo 30 · F176 · Ejecuta: node f176-fitness-functions/demo.js
// Pasa las fitness functions 1 y 2 sobre los dos proyectos de ejemplo y termina con código 1 si alguno falla
// (como lo haría en el pipeline de CI).
import { join } from 'node:path';
import { ciclosEntreServicios, grafoDeImportaciones, sinInternosAjenos } from './fitness.js';

let fallos = 0;
for (const proyecto of ['ejemplo-ok', 'ejemplo-roto']) {
  const grafo = grafoDeImportaciones(join(import.meta.dirname, proyecto));
  const internos = sinInternosAjenos(grafo);
  const ciclos = ciclosEntreServicios(grafo);
  console.log(`${proyecto}: FF1 internos ajenos=${internos.length} · FF2 ciclos=${ciclos.length}`);
  for (const v of [...internos, ...ciclos.map((c) => `ciclo ${c}`)]) console.log(`   ✘ ${v}`);
  fallos += internos.length + ciclos.length;
}
console.log(fallos ? `${fallos} violaciones: el build se detiene` : 'arquitectura en forma');
process.exitCode = fallos ? 1 : 0;
```

#### 10. MINI-LABORATORIO

1. Pasa las fitness functions a los dos proyectos y mira el código de salida:

```bash
node f176-fitness-functions/demo.js; echo "código de salida: $?"
```

**Output esperado** (real):

```text
ejemplo-ok: FF1 internos ajenos=0 · FF2 ciclos=0
ejemplo-roto: FF1 internos ajenos=3 · FF2 ciclos=1
   ✘ servicios/envios/index.js → servicios/pagos/interno/tarifas.js
   ✘ servicios/pagos/api/cliente.js → servicios/pedidos/index.js
   ✘ servicios/pedidos/index.js → servicios/pagos/interno/tarifas.js
   ✘ ciclo pagos → pedidos → pagos
4 violaciones: el build se detiene
código de salida: 1
```

2. Arregla `ejemplo-roto`: en `servicios/pedidos/index.js` usa `cotizar(total).comision` en lugar de importar
   `tarifas.js`; en `servicios/envios/index.js` importa `cotizar` de `../pagos/api/cliente.js` y usa `cotizar(valor).comision`; y quita de `pagos/api/cliente.js`
   el import de pedidos y la función `reintentar`. **Output esperado:** `ejemplo-roto: FF1 internos ajenos=0 · FF2
   ciclos=0`, `arquitectura en forma` y código de salida 0.

3. Conéctalo a CI: en el workflow de GitHub Actions del Módulo 23, añade un paso
   `run: node --test f176-fitness-functions/` después de los tests unitarios. **Captura comentada:** un PR con el
   check en rojo por `FF1` y, tras el arreglo, en verde.

#### 11. VERIFICACIÓN

Tests (`f176-fitness-functions/fitness.test.js`):

```javascript
// Módulo 30 · F176 · Las fitness functions como tests: se ejecutan en cada build y la rompen si la arquitectura se degrada.
// Ejecuta: node --test f176-fitness-functions/fitness.test.js
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { ciclosEntreServicios, grafoDeImportaciones, presupuestoLatencia, sinInternosAjenos } from './fitness.js';

const aqui = import.meta.dirname;
const ok = grafoDeImportaciones(join(aqui, 'ejemplo-ok'));
const roto = grafoDeImportaciones(join(aqui, 'ejemplo-roto'));

test('FF1 · ejemplo-ok: ningún servicio importa internos de otro', () => {
  assert.deepEqual(sinInternosAjenos(ok), []);
});

test('FF1 · ejemplo-roto: detecta los tres accesos indebidos (dos estáticos y uno dinámico)', () => {
  assert.deepEqual(sinInternosAjenos(roto).sort(), [
    'servicios/envios/index.js → servicios/pagos/interno/tarifas.js', // import() dinámico
    'servicios/pagos/api/cliente.js → servicios/pedidos/index.js', // pedidos no tiene api/: todo es interno
    'servicios/pedidos/index.js → servicios/pagos/interno/tarifas.js',
  ]);
});

test('FF2 · ciclos: ninguno en ejemplo-ok; pagos ↔ pedidos en ejemplo-roto', () => {
  assert.deepEqual(ciclosEntreServicios(ok), []);
  assert.deepEqual(ciclosEntreServicios(roto), ['pagos → pedidos → pagos']);
});

test('FF3 · presupuesto de latencia: p95 ≤ 50 ms cumple; un endpoint de 80 ms no', async () => {
  const servidor = (retardo) => new Promise((listo) => {
    const s = createServer(async (_req, res) => { await dormir(retardo); res.end('{}'); });
    s.listen(0, '127.0.0.1', () => listo(s));
  });
  const [rapido, lento] = await Promise.all([servidor(0), servidor(80)]);
  const url = (s) => `http://127.0.0.1:${s.address().port}/`;
  assert.equal((await presupuestoLatencia(url(rapido), { n: 40, p95MaxMs: 50 })).cumple, true);
  assert.equal((await presupuestoLatencia(url(lento), { n: 10, p95MaxMs: 50 })).cumple, false);
  for (const s of [rapido, lento]) { s.closeAllConnections(); s.close(); }
});
```

```bash
node --test --test-reporter=spec f176-fitness-functions/fitness.test.js
```

**Output esperado** (real): `ℹ tests 4` y `ℹ pass 4`.

**Pregunta de comprobación:** ¿por qué `pagos/api/cliente.js → pedidos/index.js` cuenta como acceso a internos si
`index.js` parece la «puerta de entrada» de pedidos? (Porque la regla define como pública **solo** la carpeta `api/`;
`pedidos` no tiene `api/`, así que todo lo suyo es interno. La fitness function aplica la regla que se decidió, no la
que parece razonable en cada caso; si la regla es mala, se cambia en el ADR y en el test.)

#### 12. ERROR COMÚN

**Síntoma:** la fitness function de acoplamiento lleva meses en verde, pero en una revisión aparece un servicio que
lee los internos de otro. **Causa:** la función mide mal: su expresión regular solo reconoce `import … from '…'` y no
ve `import()` dinámico ni `require()`.

```javascript
// Módulo 30 · F176 · Error común: una fitness function que da verde falso porque mide mal.
// La versión ingenua solo reconoce «import … from '…'» y no ve el import() dinámico de envios.
// Ejecuta: node f176-fitness-functions/error-comun.js
import { join } from 'node:path';
import { grafoDeImportaciones, INGENUA, sinInternosAjenos } from './fitness.js';

const raiz = join(import.meta.dirname, 'ejemplo-roto');
const mal = sinInternosAjenos(grafoDeImportaciones(raiz, INGENUA));
const bien = sinInternosAjenos(grafoDeImportaciones(raiz));
const perdidas = bien.filter((v) => !mal.includes(v));
console.log(`MAL  → regex ingenua: ${mal.length} violaciones · no ve: ${perdidas.join('; ')}`);
console.log(`BIEN → todas las formas de importar: ${bien.length} violaciones`);
```

Salida real de `node f176-fitness-functions/error-comun.js`:

```text
MAL  → regex ingenua: 2 violaciones · no ve: servicios/envios/index.js → servicios/pagos/interno/tarifas.js
BIEN → todas las formas de importar: 3 violaciones
```

**Diagnóstico visual:** añade a la suite un **caso negativo** por cada forma de violar la regla (un proyecto
`ejemplo-roto` con import estático, dinámico y `require`) y comprueba que la fitness function los detecta todos: si
alguna fila de la tabla «forma de violar → detectada» queda en «no», la función da verdes falsos. **Arreglo:**
reconocer todas las formas de importar (o usar un parser real como dependency-cruiser) y mantener `ejemplo-roto` como
test de la propia fitness function.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué es una fitness function y cómo evitarías con ellas que un sistema de microservicios se degrade?**

**Respuesta modelo:** es una comprobación automática y objetiva de una característica de la arquitectura, que se
ejecuta como un test, en cada build o de forma continua en producción. Para evitar la degradación, convierto cada
decisión importante o cada anti-patrón conocido en una: que ningún servicio importe los internos de otro ni acceda a
su base de datos, que no haya ciclos entre servicios, que el p95 de los endpoints críticos quepa en su presupuesto y,
en producción, métricas como el número de dependencias síncronas. Las ejecuto en el pipeline y rompen el build con
código distinto de cero, porque una regla que solo avisa se ignora. Pruebo la propia fitness function con un ejemplo
que la viola para asegurarme de que no da verdes falsos, y vinculo cada una a un ADR, para que cambiar la regla sea
una decisión explícita y no un desvío silencioso. En Java uso ArchUnit; en Node, dependency-cruiser o tests a medida.

#### 14. ANTI-PATRÓN RELACIONADO

**La arquitectura en una wiki**: las reglas están escritas en un documento que nadie vuelve a leer y no hay nada que
las compruebe; la arquitectura real diverge del diagrama en silencio.

```mermaid
flowchart LR
    W["wiki: «pedidos no usa<br/>internos de pagos»"] -. "nadie lo comprueba" .-> C["código"]
    C --> D["pedidos importa<br/>pagos/interno"]
    D --> M["monolito distribuido<br/>descubierto meses después"]
```

**Texto alternativo:** una página de wiki dice que pedidos no usa los internos de pagos, pero una línea punteada
indica que nadie lo comprueba contra el código; en el código, pedidos importa pagos/interno, y eso lleva a un
monolito distribuido que se descubre meses después.
