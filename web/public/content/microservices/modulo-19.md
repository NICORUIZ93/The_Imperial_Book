# Módulo 19 · Anti-patrones y cuándo NO usar microservicios

**Fase 3 · Nivel maestro: arquitectura avanzada** (media semana; semana 4 de 8). **Duración:** 6 h (4 temas de unos
75 min y 1 h de laboratorio integrador). **Dificultad:** 4 de 5. **Dependencias:** Módulo 24 (gobernanza: ADRs y
fitness functions en producción) y Módulo 25 (sagas, compensaciones e idempotencia); ayudan el Módulo 29 (Ley de
Conway y carga cognitiva) y el Módulo 5 (monolito frente a microservicios, bounded contexts). **Herramientas:**
**Node.js 26.13.1 LTS**, **pg 8.23.1** y **PostgreSQL 18.7** (solo la ficha 3). 
PostgreSQL responde; los comandos de verificación indicados levanta PostgreSQL y lo exige todo).

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
npm ci
docker compose up -d --wait         # PostgreSQL 18.7 :5432 (academia/academia) para la ficha 3
  # tests + demos + errores comunes de las 4 fichas → «RESULTADO: OK»
docker compose down -v
```

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
los comandos de verificación indicados. **Lo que no se pudo ejecutar aquí** (sin acceso a Docker Hub): los comandos de verificación indicados con la
imagen `postgres:18.7`; el `docker-compose.yml` se validó con `docker compose config -q` y el comando para el Mac está
en `verificacion/microservicios/pendiente.md`.

---


### Monolito distribuido

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Reconocer un monolito distribuido por sus síntomas (despliegue en bloque, base de datos compartida, cadenas síncronas y librerías de modelos compartidas), demostrar con servicios HTTP reales sus dos consecuencias (fallo en cascada y ruptura silenciosa al desplegar uno solo) y cal…

#### ► LA IDEA EN UNA FRASE
**Reconocer un monolito distribuido por sus síntomas (despliegue en bloque, base de datos compartida, cadenas síncronas y librerías de modelos compartidas), demostrar con servicios HTTP reales sus dos consecuencias (fallo en cascada y ruptura silenciosa al desplegar uno solo) y calcular su disponibilidad compuesta.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en monolito distribuido como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un **monolito** es un programa grande que se despliega de una vez. Un **monolito distribuido** es ese mismo
2. Señales: para cambiar una cosa hay que desplegar varios servicios **a la vez**; si uno se cae, se caen todos;
3. Tiene lo malo de los dos mundos: la red, la latencia y la complejidad de los microservicios, y el acoplamiento del

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Monolito distribuido se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Monolito distribuido | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La «release train» de microservicios: todos los servicios se versionan y despliegan juntos cada dos semanas con una lista de compatibilidad, porque ninguno funciona con la versión anterior de los otros.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: monolito distribuido funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un **monolito** es un programa grande que se despliega de una vez. Un **monolito distribuido** es ese mismo
- Señales: para cambiar una cosa hay que desplegar varios servicios **a la vez**; si uno se cae, se caen todos;
- Tiene lo malo de los dos mundos: la red, la latencia y la complejidad de los microservicios, y el acoplamiento del

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve monolito distribuido en tu contexto?
2. ¿Cómo sabrías que monolito distribuido no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar monolito distribuido?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Sobre-descomposición

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Medir el coste de partir un cálculo en nanoservicios (llamadas de red y latencia) frente a hacerlo en un proceso, calcular la granularidad de un sistema a partir de su historial de cambios (servicios por persona y servicios que siempre cambian juntos) y decidir cuándo fusionar se…

#### ► LA IDEA EN UNA FRASE
**Medir el coste de partir un cálculo en nanoservicios (llamadas de red y latencia) frente a hacerlo en un proceso, calcular la granularidad de un sistema a partir de su historial de cambios (servicios por persona y servicios que siempre cambian juntos) y decidir cuándo fusionar servicios o no usar microservicios.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sobre-descomposición como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. **Sobre-descomponer** es partir un sistema en **demasiados** servicios pequeños.
2. Cada servicio nuevo añade cosas que hay que cuidar: un despliegue, una red, un registro de errores, una alerta.
3. Si casi siempre que cambias un servicio tienes que cambiar otro, **en realidad son uno solo** partido en dos.
4. La pregunta clave no es «¿se puede separar?» (casi todo se puede), sino «¿**ganamos** algo separándolo?».

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sobre-descomposición se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sobre-descomposición | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Nanoservicios / microservicios por entidad: un servicio por tabla, cada uno con su CRUD, y la lógica de negocio repartida en un orquestador que los llama a todos.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sobre-descomposición funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **Sobre-descomponer** es partir un sistema en **demasiados** servicios pequeños.
- Cada servicio nuevo añade cosas que hay que cuidar: un despliegue, una red, un registro de errores, una alerta.
- Si casi siempre que cambias un servicio tienes que cambiar otro, **en realidad son uno solo** partido en dos.
- La pregunta clave no es «¿se puede separar?» (casi todo se puede), sino «¿**ganamos** algo separándolo?».

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sobre-descomposición en tu contexto?
2. ¿Cómo sabrías que sobre-descomposición no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sobre-descomposición?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Sagas innecesarias

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Comparar en PostgreSQL la misma operación (reservar stock, crear pedido y sumar puntos) hecha con una transacción local y con una saga, observar lo que la saga añade (estado intermedio visible, código de compensación y nuevos modos de fallo) y decidir cuándo una saga está justifi…

#### ► LA IDEA EN UNA FRASE
**Comparar en PostgreSQL la misma operación (reservar stock, crear pedido y sumar puntos) hecha con una transacción local y con una saga, observar lo que la saga añade (estado intermedio visible, código de compensación y nuevos modos de fallo) y decidir cuándo una saga está justificada.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sagas innecesarias como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Una **saga** es una forma de hacer una operación de varios pasos cuando los pasos están en **sistemas distintos**
2. Una **transacción** de base de datos hace lo mismo **sola**: o se guardan todos los cambios o ninguno.
3. Si todos los datos están en **la misma base de datos** y los maneja **el mismo servicio**, una transacción es más

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sagas innecesarias se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sagas innecesarias | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La saga por defecto: cualquier operación de más de un paso se modela como saga con orquestador, aunque los pasos compartan base de datos.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sagas innecesarias funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una **saga** es una forma de hacer una operación de varios pasos cuando los pasos están en **sistemas distintos**
- Una **transacción** de base de datos hace lo mismo **sola**: o se guardan todos los cambios o ninguno.
- Si todos los datos están en **la misma base de datos** y los maneja **el mismo servicio**, una transacción es más

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sagas innecesarias en tu contexto?
2. ¿Cómo sabrías que sagas innecesarias no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sagas innecesarias?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Fitness functions

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Escribir fitness functions que se ejecutan como tests en cada build y detectan los anti-patrones de este módulo antes de que lleguen a producción (acceso a internos de otro servicio, ciclos entre servicios y un presupuesto de latencia), hacer que rompan el pipeline con código de…

#### ► LA IDEA EN UNA FRASE
**Escribir fitness functions que se ejecutan como tests en cada build y detectan los anti-patrones de este módulo antes de que lleguen a producción (acceso a internos de otro servicio, ciclos entre servicios y un presupuesto de latencia), hacer que rompan el pipeline con código de salida distinto de 0 y evitar que midan mal.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en fitness functions como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Una **fitness function** es una **comprobación automática** de que la arquitectura sigue cumpliendo una regla que
2. Se escribe **como un test** y se ejecuta **siempre**, en cada cambio. Si la regla se rompe, el cambio no entra.
3. Así las decisiones de arquitectura no dependen de que alguien se acuerde de revisarlas.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Fitness functions se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Fitness functions | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La arquitectura en una wiki: las reglas están escritas en un documento que nadie vuelve a leer y no hay nada que las compruebe; la arquitectura real diverge del diagrama en silencio.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: fitness functions funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una **fitness function** es una **comprobación automática** de que la arquitectura sigue cumpliendo una regla que
- Se escribe **como un test** y se ejecuta **siempre**, en cada cambio. Si la regla se rompe, el cambio no entra.
- Así las decisiones de arquitectura no dependen de que alguien se acuerde de revisarlas.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve fitness functions en tu contexto?
2. ¿Cómo sabrías que fitness functions no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar fitness functions?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>
