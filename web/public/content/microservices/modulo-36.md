# Módulo 32 · Proyecto Final y Comité de Arquitectura

**Fase 3 · Nivel maestro: arquitectura avanzada** (semanas 7 y 8 de 8). **Duración:** 2 semanas (unas 30 h: 7 temas
de 1,5 a 2 h y el resto para tu propia versión del proyecto y la defensa). **Dificultad:** 5 de 5. **Dependencias:**
todo el curso; en especial Módulos 6/18 (comunicación), 7/17 (gateway), 8/19 (resiliencia), 24 (ADR y C4), 25 (sagas
con Temporal e idempotencia), 28 (costo) y 31 (migración). **Herramientas:** pista Node.js con **Node.js 26.13.1
LTS**, Express **5.3.0**, Temporal TypeScript SDK **1.26.0**, ioredis **6.0.0** y Gatling JS **3.16.101**; pista
Spring Boot con **JDK 25**, Spring Boot **4.1.3**, Spring Cloud Gateway **5.0.4** (tren 2025.1.4), Temporal Java SDK
**1.41.1** y Gatling **3.16.1** con el plugin `io.gatling.gradle` **3.16.0**; la pista Spring se construye con **Gradle 9.9.2**; infraestructura: Redis **8.10.2** (Docker
Compose) y Temporal Server **1.32.1** (`temporal server start-dev`). **Laboratorio:** `modulo-36`
(los comandos de verificación indicados ejecuta 26 tests, los scripts de las siete fichas, Redis real, Gatling a 60 reservas/s y las demos
JDK de la pista Spring; `--compose` añade Redis con Docker y los tests de `spring/` con Gradle).

Este es el examen final del curso, y no es un examen de memoria: es **un sistema que funciona, que se rompe a
propósito y que defiendes ante un comité**. Construyes un **sistema de reservas con pago externo** con una **saga
orquestada por Temporal**, detrás de un **API Gateway con rate limiting**; lo sometes a un **test de carga con
Gatling**; recibes una **restricción sobrevenida** (el proveedor de pagos limita a 20 peticiones/s) que rompe tu
diseño; lo **rediseñas y lo documentas en un ADR** con su fitness function ejecutable; y lo **defiendes ante el
Architecture Review Board** con la rúbrica del curso. Como pide el prompt del curso, el sistema existe **dos veces, por
separado**: una pista **Node.js** completa (la que se ejecuta entera en los comandos de verificación indicados) y una pista **Spring Boot**
con el mismo contrato, la misma saga y el mismo límite.

```mermaid
flowchart LR
    T1["1 · Sistema de reservas<br/>con pago externo"] --> T2["2 · Saga orquestada<br/>con Temporal"]
    T1 --> T3["3 · API Gateway<br/>con rate limiting"]
    T2 --> T4["4 · Test de carga<br/>con Gatling"]
    T3 --> T4
    T4 --> T5["5 · Restricción<br/>sobrevenida"]
    T5 --> T6["6 · Rediseño<br/>en un ADR"]
    T6 --> T7["7 · Defensa ante el<br/>Comité (ARB)"]
    T6 -. "fitness function" .-> T4
```

**Texto alternativo:** mapa del proyecto final. El sistema de reservas con pago externo (tema 1) se apoya en la saga
orquestada con Temporal (tema 2) y en el API Gateway con rate limiting (tema 3). Los dos llevan al test de carga con
Gatling (tema 4), que mide el impacto de la restricción sobrevenida (tema 5). La restricción obliga a un rediseño
documentado en un ADR (tema 6), cuya fitness function vuelve, con una flecha punteada, a la medición del tema 4. Todo
termina en la defensa ante el Comité de Arquitectura (tema 7).

**Qué se ejecutó aquí y qué queda para tu Mac.** Se ejecutó todo lo de la pista Node.js con Node 26.13.1: los 26
tests, las demos, Gatling JS 3.16.101 (motor 3.16.1, con el JDK 21 de este entorno) a 60 reservas/s durante 25 s, y
el limitador contra un **Redis 7.0.15 local** (no 8.10.2). También las demos `spring/jdk/*.java` con Java 21. **No** se
pudo ejecutar aquí: el servidor de Temporal (la descarga de `temporal.download` está bloqueada; el workflow sí se
comprobó con el empaquetador de Temporal, `bundleWorkflowCode`), los tests de la pista Spring con Gradle (Maven Central
bloqueado) ni Docker. Esos bloques están completos y anotados en `verificacion/microservicios/pendiente.md`, y el texto
lo indica en cada ficha.

**Cómo usar el laboratorio.**

```bash
npm ci
  # pista Node + Redis local (si hay) + Gatling (si hay Java) + jdk/ → «RESULTADO: OK»
los comandos de verificación indicados    # además Redis con Docker Compose y (cd spring && ./gradlew test)
```

`README.md` tiene el enunciado, el diagrama C4 y el
mapa de carpetas.

`package.json` (pista Node.js):

```json
{
  "name": "modulo-32-proyecto-final",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 32 (Fase 3): Proyecto final. Sistema de reservas con pago externo, saga orquestada con Temporal, API Gateway con rate limiting, test de carga con Gatling, restricción sobrevenida, ADR y defensa ante el Comité de Arquitectura.",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "test": "node --test --test-concurrency=1 'f18*/*.test.js'",
    "gatling": "gatling run --sources-folder f184-carga-gatling/src --resources-folder f184-carga-gatling/resources --results-folder logs/gatling --non-interactive"
  },
  "dependencies": {
    "@temporalio/activity": "1.26.0",
    "@temporalio/client": "1.26.0",
    "@temporalio/worker": "1.26.0",
    "@temporalio/workflow": "1.26.0",
    "express": "5.3.0",
    "ioredis": "6.0.0"
  },
  "devDependencies": {
    "@gatling.io/cli": "3.16.101",
    "@gatling.io/core": "3.16.101",
    "@gatling.io/http": "3.16.101",
    "@temporalio/testing": "1.26.0"
  }
}
```

`docker-compose.yml` (Redis para el limitador compartido; Temporal va con su CLI):

```yaml
# Módulo 32 (modulo-36) · Proyecto final: Redis 8.10.2 para el limitador compartido del gateway (F183).
# Arranca:  docker compose up -d --wait      Detén: docker compose down -v
# Temporal no va aquí: usa el CLI (`temporal server start-dev`, UI en http://localhost:8233) o deja que
# f182-saga-temporal/temporal.infra.js descargue y arranque el servidor de desarrollo (TestWorkflowEnvironment.createLocal).
name: modulo-36
services:
  redis:
    image: redis:8.10.2
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 2s
      timeout: 3s
      retries: 30
```

## Enunciado y rúbrica del proyecto

**Enunciado.** Una ticketera vende entradas para conciertos. Cada reserva bloquea una plaza, cobra con un **proveedor
de pagos externo** (HTTP con `Idempotency-Key`; 402 si la tarjeta no paga) y confirma. Si algo falla a mitad, se
deshace lo hecho. El tráfico entra por un gateway con límite por cliente. Objetivos: **picos de 60 reservas/s**, **p99
< 300 ms** y **< 1 % de errores** en la API, **0 reservas cobradas sin plaza** y **0 plazas bloqueadas sin cobro**. A
mitad del proyecto, el proveedor anuncia un límite de **20 peticiones/s**.

**Qué entregas** (lo comprueba `node f187-defensa-arb/entregables.js`): README con diagrama C4 de contenedores; la saga
con sus tests; el gateway con su test; la simulación de Gatling con aserciones; la medición antes/después de la
restricción; al menos 2 ADR con fitness function ejecutable; la estimación de costo con precios reales (`COSTO.md`); y
la pista Spring Boot.

**Rúbrica del Comité** (la de `docs/microservicios/07-plantillas.md`, sección 7.2; ejecutable en
`f187-defensa-arb/puntuar.js`). Cada criterio se puntúa de 1 a 4. **Aprueba quien obtiene ≥ 2.8 de media ponderada y
ningún criterio en 1.**

| # | Criterio | Peso | 3 · Competente | 4 · Maestro |
|---|---|---|---|---|
| 1 | Descomposición y límites | 15 % | contextos coherentes, cada servicio con su base de datos | justifica cada límite con el dominio y el equipo; identifica qué **no** separar |
| 2 | Consistencia y saga | 15 % | saga orquestada en Temporal con compensaciones probadas | demuestra en vivo un fallo a mitad de saga y la recuperación; explica por qué no 2PC |
| 3 | Resiliencia | 10 % | circuit breaker, retry con jitter y fallback probados | presupuesto de latencia de extremo a extremo y degradación medida |
| 4 | Seguridad | 10 % | OAuth2/OIDC con scopes, secretos en Vault, imágenes escaneadas | Zero-Trust: mTLS y token exchange justificados |
| 5 | Observabilidad | 10 % | trazas, logs estructurados y dashboard | alertas sobre p99 y SLO, y diagnóstico de un incidente con la traza |
| 6 | Rendimiento y carga | 10 % | Gatling con objetivo de p99 y throughput, resultados explicados | identifica el cuello de botella y muestra el antes/después |
| 7 | Restricción sobrevenida y ADR | 15 % | ADR con 2+ alternativas y trade-offs | ADR con fitness function y condición de revisión; el rediseño se mide |
| 8 | Costo (FinOps) | 5 % | estimación con precios reales y right-sizing | compara contenedores y serverless con break-even calculado |
| 9 | Comunicación y defensa | 10 % | diagramas C4 claros y respuestas razonadas | reconoce límites del diseño y propone alternativas sin ponerse a la defensiva |

Los niveles 1 y 2 de cada criterio están en la plantilla. Este laboratorio cubre de serie los criterios 1, 2, 6, 7 y 8;
para 3, 4 y 5 integra en tu versión lo de los Módulos 8/19 (Resilience4j u opossum delante del proveedor), 9/20/27
(OAuth2 en el gateway, la clave del proveedor en Vault, mTLS) y 10/21 (OpenTelemetry con la traza de la saga).

---

### Sistema de reservas con pago externo

#### 1. UBICACIÓN

Módulo 32, Lección 1 de 7 · Fase 3 · 2 h
`spring/pagos-externo/` + `spring/reservas/`.

#### 2. PRERREQUISITOS

- APIs REST con Express (Módulo 14) o Spring MVC (Módulo 2); códigos 202, 400, 402, 404 y 429.
- Idempotencia (Módulos 22 y 25) y bounded contexts (Módulo 5).

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** un servicio de reservas que acepta la petición con **202 Accepted**, delega el cobro en un proveedor
externo a través de una saga y es **idempotente** ante reintentos del cliente, y **demostrar** con tests que un POST
repetido no cobra dos veces. Lo compruebas cuando `node --test f181-sistema-reservas/reservas.test.js` pasa 4 de 4.

#### 4. ANALOGÍA VISUAL

La **taquilla de un teatro con datáfono de otro banco**. Dibuja la ventanilla: la taquillera te da un **resguardo
numerado** al momento («su reserva R-a1 está en trámite»), aparta una butaca con un cartelito, y pasa tu tarjeta por un
datáfono que es **del banco**, no del teatro: a veces tarda, a veces dice «denegada». Si la tarjeta falla, quita el
cartelito de la butaca. Si vuelves a la ventanilla con el **mismo resguardo**, te dice cómo va tu reserva; no te hace
otra ni te cobra otra vez.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant C as Cliente
    participant R as Servicio de reservas
    participant O as Orquestador (Temporal)
    participant I as Inventario
    participant P as Proveedor de pagos (externo)
    C->>R: POST /reservas + Idempotency-Key a1
    R-->>C: 202 Accepted, Location /reservas/R-a1 (PENDIENTE)
    R->>O: iniciar saga R-a1
    O->>I: reservarPlaza
    O->>P: POST /cobros (Idempotency-Key cobro-R-a1)
    P-->>O: 201 APROBADO | 402 RECHAZADO | 429
    O->>R: confirmar o cancelar
    C->>R: GET /reservas/R-a1
    R-->>C: 200 CONFIRMADA
```

**Texto alternativo:** diagrama de secuencia con cinco participantes. El cliente envía POST /reservas con la cabecera
Idempotency-Key a1; el servicio de reservas responde enseguida 202 Accepted con Location /reservas/R-a1 y estado
PENDIENTE, y pide al orquestador que inicie la saga. El orquestador reserva la plaza en el inventario y llama al
proveedor de pagos externo con la clave cobro-R-a1; el proveedor responde 201 aprobado, 402 rechazado o 429. El
orquestador confirma o cancela en el servicio de reservas. Después, el cliente consulta GET /reservas/R-a1 y recibe 200
con el estado CONFIRMADA.

#### 6. EXPLICACIÓN NIVEL 0

- Reservar parece una sola acción, pero son **tres**: apartar la plaza, cobrar y confirmar. Y el cobro lo hace **otra
  empresa**, que no controlas.
- Por eso el sistema no te hace esperar: te da un **número de reserva** al momento y sigue trabajando por detrás.
- Si algo falla (la tarjeta no paga, el evento se cancela), el sistema **deshace** lo que ya había hecho.
- Si pulsas «Reservar» dos veces, el sistema reconoce que es la misma compra gracias a una **clave** que envía la app,
  y no te cobra dos veces.

#### 7. EXPLICACIÓN INTERMEDIA

- **202 Accepted + Location**: la petición se aceptó y se procesa en segundo plano; el cliente consulta el recurso
  `/reservas/{id}` (o recibe un webhook o un evento). La latencia de la API no depende del proveedor externo.
- **Idempotency-Key del cliente**: la app genera una clave por intento de compra; el servicio la usa como identificador
  de la reserva. Un POST repetido devuelve la misma reserva. Hacia el proveedor se usan claves derivadas
  (`cobro-R-a1`, `reembolso-R-a1`), así que los reintentos internos tampoco cobran dos veces.
- **Contrato del proveedor**: 201 aprobado, 402 rechazado (no se reintenta), 429 con `Retry-After` y 5xx (se
  reintentan con backoff).
- **Composición** (`montaje.js`): proveedor, inventario, repositorio, actividades y orquestador se inyectan. Los tests
  usan el orquestador local; la versión entregable, Temporal (F182).

#### 8. EXPLICACIÓN MAESTRA

| Forma de responder al cliente | A favor | En contra | Cuándo |
|---|---|---|---|
| **Síncrona** (esperar al cobro y responder 201) | el cliente sabe el resultado al momento | la latencia y los fallos del proveedor llegan al usuario; hilos ocupados esperando | proveedor rápido y fiable, poco tráfico |
| **202 + consulta del estado** (este proyecto) | API rápida y estable; la saga sigue aunque el cliente se vaya | el cliente debe consultar; estados intermedios en la interfaz | pagos, reservas, todo lo que toca a terceros |
| **202 + webhook o evento** | sin consultas repetidas | el cliente necesita un endpoint o una conexión (SSE, WebSocket) | integraciones entre empresas, apps con notificaciones |

- **Límites del sistema:** reservas, inventario y pagos son contextos distintos (Módulo 5); aquí reservas e inventario
  viven en el mismo proceso por sencillez. En tu versión, decide con el criterio 1 de la rúbrica si inventario merece su
  propio servicio y base de datos o si es un módulo de reservas: con un solo equipo y cambios siempre conjuntos, la
  respuesta madura es **no separarlo** (Módulo 31, F180).
- **Dinero:** importes en enteros (céntimos) y moneda explícita en producción; aquí el importe es un entero de euros.
- **Cuándo NO** usar todo esto: una web de reservas de un restaurante con 50 reservas al día y un único equipo es un
  monolito con una tabla y una llamada al TPV; ni saga ni gateway.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **Express 5.3.0**, `@temporalio/activity` 1.26.0 (solo `ApplicationFailure`).

El proveedor de pagos externo simulado (`f181-sistema-reservas/proveedor-pagos.js`):

```javascript
// Módulo 32 · F181 · Simulador del PROVEEDOR DE PAGOS EXTERNO (no es nuestro: no podemos cambiar su código ni su límite).
// POST /cobros     {reservaId, importe, tarjeta}  + cabecera Idempotency-Key  -> 201 APROBADO | 402 RECHAZADO | 429
// POST /reembolsos {cobroId}                      + cabecera Idempotency-Key  -> 201 REEMBOLSADO
// Opciones: limiteRps (la «restricción sobrevenida» de F185: 429 con Retry-After), latenciaMs.
// Ejecuta solo: node f181-sistema-reservas/proveedor-pagos.js   (puerto 8090; LIMITE_RPS=20 para activar el límite)
import { pathToFileURL } from 'node:url';
import { http, json, leerCuerpo } from '../comun/http.js';
import { espera } from '../comun/estadistica.js';

export function crearProveedor({ limiteRps = Infinity, latenciaMs = 5 } = {}) {
  const stats = { peticiones: 0, cobros: 0, reembolsos: 0, rechazados429: 0, porSegundo: new Map() };
  const porClave = new Map(); // Idempotency-Key -> respuesta ya dada (se repite tal cual, sin cobrar dos veces)
  let ventana = 0; let enVentana = 0;
  const servidor = http.createServer(async (req, res) => {
    stats.peticiones++;
    const ahora = Math.floor(Date.now() / 1000);
    if (ahora !== ventana) { ventana = ahora; enVentana = 0; }
    if (++enVentana > limiteRps) { // ventana fija de 1 s, como anuncian muchos proveedores
      stats.rechazados429++;
      return json(res, 429, { error: `límite de ${limiteRps} peticiones/s superado` }, { 'retry-after': '1' });
    }
    stats.porSegundo.set(ahora, (stats.porSegundo.get(ahora) ?? 0) + 1);
    const cuerpo = JSON.parse((await leerCuerpo(req)) || '{}');
    await espera(latenciaMs);
    const clave = req.headers['idempotency-key'];
    if (clave && porClave.has(`${req.url}:${clave}`)) { const [e, c] = porClave.get(`${req.url}:${clave}`); return json(res, e, c); }
    let estado; let respuesta;
    if (req.url === '/cobros') {
      if (cuerpo.tarjeta === '4000-RECHAZAR') { estado = 402; respuesta = { estado: 'RECHAZADO', motivo: 'fondos insuficientes' }; }
      else { stats.cobros++; estado = 201; respuesta = { cobroId: `CB-${cuerpo.reservaId}`, estado: 'APROBADO', importe: cuerpo.importe }; }
    } else if (req.url === '/reembolsos') {
      stats.reembolsos++; estado = 201; respuesta = { cobroId: cuerpo.cobroId, estado: 'REEMBOLSADO' };
    } else { return json(res, 404, { error: 'no existe' }); }
    if (clave) porClave.set(`${req.url}:${clave}`, [estado, respuesta]);
    json(res, estado, respuesta);
  });
  return { servidor, stats };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { servidor } = crearProveedor({ limiteRps: Number(process.env.LIMITE_RPS ?? Infinity) });
  servidor.listen(Number(process.env.PORT ?? 8090), () => console.log(`proveedor de pagos en :${servidor.address().port}`));
}
```

El inventario (`f181-sistema-reservas/inventario.js`) y el repositorio (`f181-sistema-reservas/repositorio.js`):

```javascript
// Módulo 32 · F181 · Inventario de plazas por evento (en memoria; en el proyecto real, PostgreSQL con su propia base).
// Las dos operaciones son idempotentes por reservaId: repetirlas (reintentos de Temporal) no cambia el resultado.
export class SinPlazas extends Error { constructor(eventoId) { super(`sin plazas en ${eventoId}`); this.name = 'SinPlazas'; } }

export function crearInventario(aforos) {
  const libres = new Map(Object.entries(aforos));
  const ocupadas = new Map(); // reservaId -> eventoId
  return {
    reservarPlaza({ reservaId, eventoId }) {
      if (ocupadas.has(reservaId)) return { reservaId, repetida: true };
      if (!libres.has(eventoId) || libres.get(eventoId) < 1) throw new SinPlazas(eventoId);
      libres.set(eventoId, libres.get(eventoId) - 1); ocupadas.set(reservaId, eventoId);
      return { reservaId, repetida: false };
    },
    liberarPlaza({ reservaId }) {
      const eventoId = ocupadas.get(reservaId);
      if (!eventoId) return { reservaId, liberada: false }; // ya liberada (o nunca reservada): no hace nada
      ocupadas.delete(reservaId); libres.set(eventoId, libres.get(eventoId) + 1);
      return { reservaId, liberada: true };
    },
    libres: (eventoId) => libres.get(eventoId),
  };
}
```

```javascript
// Módulo 32 · F181 · Repositorio de reservas (en memoria; en el proyecto real, PostgreSQL del servicio de reservas).
export function crearRepositorio() {
  const reservas = new Map();
  return {
    crear(r) { if (!reservas.has(r.reservaId)) reservas.set(r.reservaId, { ...r, estado: 'PENDIENTE', creada: Date.now() }); return reservas.get(r.reservaId); },
    actualizar(id, cambios) { reservas.set(id, { ...reservas.get(id), ...cambios, actualizada: Date.now() }); },
    obtener: (id) => reservas.get(id),
    todas: () => [...reservas.values()],
  };
}
```

El servicio de reservas (`f181-sistema-reservas/servicio-reservas.js`):

```javascript
// Módulo 32 · F181 · Servicio de reservas (API REST con Express 5.3.0 sobre Node.js 26.13.1 LTS).
// POST /reservas  -> 202 Accepted + Location: la saga (pago externo incluido) sigue en segundo plano.
// GET  /reservas/:id -> estado actual (PENDIENTE, CONFIRMADA o CANCELADA).
// El orquestador se inyecta: el local (orquestador-local.js) para desarrollo y tests, o Temporal (orquestador-temporal.js).
import express from 'express';
import { pathToFileURL } from 'node:url';

export function crearServicioReservas({ repo, orquestador }) {
  const app = express();
  app.use(express.json());
  let secuencia = 0;
  app.post('/reservas', (req, res) => {
    const { eventoId, clienteId, importe, tarjeta } = req.body ?? {};
    if (!eventoId || !clienteId || !(importe > 0) || !tarjeta) {
      return res.status(400).json({ error: 'faltan eventoId, clienteId, importe (> 0) o tarjeta' });
    }
    // Idempotency-Key del cliente: el mismo POST repetido devuelve la misma reserva (no crea otra ni cobra dos veces).
    const reservaId = req.get('idempotency-key') ? `R-${req.get('idempotency-key')}` : `R-${++secuencia}`;
    const existente = repo.obtener(reservaId);
    if (existente) return res.status(202).location(`/reservas/${reservaId}`).json(existente);
    const reserva = repo.crear({ reservaId, eventoId, clienteId, importe, tarjeta });
    orquestador.iniciar({ reservaId, eventoId, clienteId, importe, tarjeta, ...(req.body.fallarAlConfirmar ? { fallarAlConfirmar: true } : {}) })
      .catch((e) => repo.actualizar(reservaId, { estado: 'CANCELADA', motivo: `saga interrumpida: ${e.message}` }));
    res.status(202).location(`/reservas/${reservaId}`).json(reserva);
  });
  app.get('/reservas/:id', (req, res) => {
    const r = repo.obtener(req.params.id);
    return r ? res.json(r) : res.status(404).json({ error: `no existe ${req.params.id}` });
  });
  app.get('/salud', (_req, res) => res.json({ estado: 'UP' }));
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Arranque «de verdad»: node f181-sistema-reservas/servicio-reservas.js  (ORQUESTADOR=temporal para usar Temporal)
  const { crearRepositorio } = await import('./repositorio.js');
  const repo = crearRepositorio();
  let orquestador;
  if (process.env.ORQUESTADOR === 'temporal') {
    const { crearOrquestadorTemporal } = await import('../f182-saga-temporal/orquestador-temporal.js');
    orquestador = await crearOrquestadorTemporal();
    const iniciar = orquestador.iniciar;
    orquestador.iniciar = async (r) => { const res = await iniciar(r); repo.actualizar(r.reservaId, res.estado === 'CONFIRMADA' ? { estado: res.estado } : { estado: res.estado, motivo: res.motivo }); return res; };
  } else {
    const { crearOrquestadorLocal } = await import('../f182-saga-temporal/orquestador-local.js');
    const { crearActividades } = await import('../f182-saga-temporal/actividades.js');
    const { crearInventario } = await import('./inventario.js');
    orquestador = crearOrquestadorLocal(crearActividades({ inventario: crearInventario({ 'concierto-1': 500 }), repo,
      pagosUrl: process.env.PAGOS_URL ?? 'http://localhost:8090' }));
  }
  const puerto = Number(process.env.PORT ?? 8081);
  crearServicioReservas({ repo, orquestador }).listen(puerto, () => console.log(`reservas en :${puerto} (orquestador ${process.env.ORQUESTADOR ?? 'local'})`));
}
```

El montaje del sistema en un proceso (`f181-sistema-reservas/montaje.js`), que usan la demo, los tests y F184/F185:

```javascript
// Módulo 32 · F181 · Monta el sistema completo en un proceso (puertos libres): proveedor de pagos externo, servicio de
// reservas con el orquestador local y, si se pide, el gateway (F183). Lo usan la demo, los tests y F184/F185.
import { cerrar, escuchar } from '../comun/http.js';
import { crearProveedor } from './proveedor-pagos.js';
import { crearInventario } from './inventario.js';
import { crearRepositorio } from './repositorio.js';
import { crearServicioReservas } from './servicio-reservas.js';
import { crearActividades } from '../f182-saga-temporal/actividades.js';
import { crearOrquestadorLocal } from '../f182-saga-temporal/orquestador-local.js';

export async function montarSistema({ aforo = 500, proveedor = {}, politica = {}, envolverActividades = (a) => a } = {}) {
  const prov = crearProveedor(proveedor);
  const pagosUrl = await escuchar(prov.servidor);
  const repo = crearRepositorio();
  const inventario = crearInventario({ 'concierto-1': aforo });
  const actividades = envolverActividades(crearActividades({ inventario, repo, pagosUrl }));
  const app = crearServicioReservas({ repo, orquestador: crearOrquestadorLocal(actividades, politica) });
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise((ok) => servidor.once('listening', ok));
  const reservasUrl = `http://127.0.0.1:${servidor.address().port}`;
  return { reservasUrl, pagosUrl, repo, inventario, stats: prov.stats,
    cerrar: async () => { servidor.closeAllConnections?.(); await Promise.all([cerrar(servidor), cerrar(prov.servidor)]); } };
}

// Espera a que una reserva salga de PENDIENTE (la saga corre en segundo plano).
export async function esperarFinal(url, id, maxMs = 30_000) {
  const fin = Date.now() + maxMs;
  for (;;) {
    const r = await (await fetch(`${url}/reservas/${id}`)).json();
    if (r.estado !== 'PENDIENTE' || Date.now() > fin) return r;
    await new Promise((ok) => setTimeout(ok, 20));
  }
}
```

**Pista Spring Boot** (Spring Boot 4.1.3, JDK 25; tests y arranque pendientes en el Mac). El proveedor simulado con el
mismo contrato (`spring/pagos-externo/src/main/java/academia/pagos/PagosExternoApp.java`):

```java
package academia.pagos;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * Módulo 32 · F181 · Simulador del proveedor de pagos EXTERNO (mismo contrato que proveedor-pagos.js de la pista Node):
 * POST /cobros y POST /reembolsos con cabecera Idempotency-Key; 402 si la tarjeta es 4000-RECHAZAR; 429 con
 * Retry-After: 1 si se supera pagos.limite-rps en el segundo en curso.
 */
@SpringBootApplication
@RestController
public class PagosExternoApp {

    record Cobro(String reservaId, int importe, String tarjeta) { }
    record Reembolso(String cobroId) { }

    private final Map<String, ResponseEntity<Map<String, Object>>> porClave = new ConcurrentHashMap<>();
    private final int limiteRps;
    private long ventana;
    private int enVentana;

    PagosExternoApp(@Value("${pagos.limite-rps}") int limiteRps) {
        this.limiteRps = limiteRps;
    }

    public static void main(String[] args) {
        SpringApplication.run(PagosExternoApp.class, args);
    }

    /** Ventana fija de 1 segundo, como anuncian muchos proveedores. */
    private synchronized boolean dentroDelLimite() {
        long ahora = System.currentTimeMillis() / 1000;
        if (ahora != ventana) {
            ventana = ahora;
            enVentana = 0;
        }
        return ++enVentana <= limiteRps;
    }

    @PostMapping("/cobros")
    ResponseEntity<Map<String, Object>> cobrar(@RequestHeader("Idempotency-Key") String clave, @RequestBody Cobro c) {
        if (!dentroDelLimite()) {
            return ResponseEntity.status(429).header("Retry-After", "1")
                    .body(Map.of("error", "límite de " + limiteRps + " peticiones/s superado"));
        }
        // computeIfAbsent: la misma Idempotency-Key devuelve la misma respuesta y no cobra dos veces.
        return porClave.computeIfAbsent("cobro:" + clave, k -> "4000-RECHAZAR".equals(c.tarjeta())
                ? ResponseEntity.status(402).body(Map.of("estado", "RECHAZADO", "motivo", "fondos insuficientes"))
                : ResponseEntity.status(201).body(Map.of("cobroId", "CB-" + c.reservaId(), "estado", "APROBADO", "importe", c.importe())));
    }

    @PostMapping("/reembolsos")
    ResponseEntity<Map<String, Object>> reembolsar(@RequestHeader("Idempotency-Key") String clave, @RequestBody Reembolso r) {
        if (!dentroDelLimite()) {
            return ResponseEntity.status(429).header("Retry-After", "1").body(Map.of("error", "límite superado"));
        }
        return porClave.computeIfAbsent("reembolso:" + clave,
                k -> ResponseEntity.status(201).body(Map.of("cobroId", r.cobroId(), "estado", "REEMBOLSADO")));
    }
}
```

Y el controlador de reservas, que inicia el workflow de Temporal y responde 202
(`spring/reservas/src/main/java/academia/reservas/ReservasController.java`):

```java
package academia.reservas;

import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/** Módulo 32 · F181 · API de reservas: POST responde 202 y la saga sigue en Temporal; GET da el estado. */
@RestController
class ReservasController {

    record NuevaReserva(String eventoId, String clienteId, int importe, String tarjeta) { }

    private final WorkflowClient temporal;
    private final Map<String, Map<String, Object>> estados = new ConcurrentHashMap<>();

    ReservasController(WorkflowClient temporal) {
        this.temporal = temporal;
    }

    @PostMapping("/reservas")
    ResponseEntity<Map<String, Object>> crear(@RequestHeader("Idempotency-Key") String clave, @RequestBody NuevaReserva n) {
        String id = "R-" + clave;
        if (estados.containsKey(id)) return ResponseEntity.accepted().location(URI.create("/reservas/" + id)).body(estados.get(id));
        estados.put(id, Map.of("reservaId", id, "estado", "PENDIENTE"));
        // workflowId = reservaId: Temporal no arranca dos sagas para la misma reserva aunque el POST se repita.
        ReservaWorkflow saga = temporal.newWorkflowStub(ReservaWorkflow.class,
                WorkflowOptions.newBuilder().setTaskQueue("reservas").setWorkflowId("reserva-" + id).build());
        WorkflowClient.execute(saga::reservar, new Reserva(id, n.eventoId(), n.clienteId(), n.importe(), n.tarjeta(), false))
                .thenAccept(r -> estados.put(id, r.motivo() == null ? Map.of("reservaId", id, "estado", r.estado())
                        : Map.of("reservaId", id, "estado", r.estado(), "motivo", r.motivo())));
        return ResponseEntity.accepted().location(URI.create("/reservas/" + id)).body(estados.get(id));
    }

    @GetMapping("/reservas/{id}")
    ResponseEntity<Map<String, Object>> ver(@PathVariable String id) {
        var e = estados.get(id);
        return e == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(e);
    }
}
```

#### 10. MINI-LABORATORIO

1. Ejecuta la demo (aforo de 2 plazas para ver también el caso «sin plazas»):

```bash
node f181-sistema-reservas/demo.js
```

   **Output esperado:**

```text
pago aprobado                             POST 202 /reservas/R-a1 -> CONFIRMADA
mismo POST repetido (Idempotency-Key a1)  POST 202 /reservas/R-a1 -> CONFIRMADA
tarjeta rechazada                         POST 202 /reservas/R-b2 -> CANCELADA (tarjeta rechazada: fondos insuficientes)
falla la confirmación                     POST 202 /reservas/R-c3 -> CANCELADA (el organizador canceló el evento)
otra reserva                              POST 202 /reservas/R-d4 -> CONFIRMADA
sin plazas (aforo 2)                      POST 202 /reservas/R-e5 -> CANCELADA (sin plazas en concierto-1)
proveedor: 3 cobros, 1 reembolso(s) · plazas libres: 0
```

   **Captura comentada:** las seis peticiones responden **202** al momento; el resultado llega después. El POST
   repetido con la clave `a1` devuelve la misma reserva. La tarjeta rechazada libera la plaza; la confirmación fallida
   reembolsa y libera; con el aforo agotado, la saga se cancela antes de tocar al proveedor. Resultado: 3 cobros, 1
   reembolso y 0 plazas libres (R-a1 y R-d4).

2. Arranca las piezas por separado y prueba con `curl`:

```bash
node f181-sistema-reservas/proveedor-pagos.js &                       # :8090
node f181-sistema-reservas/servicio-reservas.js &                     # :8081 (orquestador local)
curl -si localhost:8081/reservas -H 'content-type: application/json' -H 'idempotency-key: x1' \
  -d '{"eventoId":"concierto-1","clienteId":"C-1","importe":80,"tarjeta":"4242-OK"}' | head -1
curl -s localhost:8081/reservas/R-x1
```

   **Output esperado:** `HTTP/1.1 202 Accepted` y, en la consulta, un JSON con `"estado":"CONFIRMADA"`. Para la pista
   Spring, desde `spring/`, `./gradlew:pagos-externo:bootRun` y `./gradlew:reservas:bootRun`
   (necesita Temporal: F182) en los mismos puertos.

   > **Build con Gradle (equivalencia Maven).** La pista Spring (`spring/`) se construye con Gradle 9.9.2, Kotlin DSL y
   > catálogo de versiones, por el wrapper `spring/gradlew`: `./mvnw test` → `./gradlew test` ·
   > `./mvnw -f reservas/pom.xml spring-boot:run` → `./gradlew:reservas:bootRun` · `./mvnw -f carga/pom.xml gatling:test`
   > → `./gradlew:carga:gatlingRun` · `target/` → `build/`. El `settings.gradle.kts` y el catálogo están en F184.

#### 11. VERIFICACIÓN

Test que debes ejecutar (`f181-sistema-reservas/reservas.test.js`):

```javascript
// Módulo 32 · F181 · tests del sistema de reservas: node --test f181-sistema-reservas/reservas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esperarFinal, montarSistema } from './montaje.js';

const post = (url, cuerpo, clave) => fetch(`${url}/reservas`, { method: 'POST', body: JSON.stringify(cuerpo),
  headers: { 'content-type': 'application/json', ...(clave ? { 'idempotency-key': clave } : {}) } });
const base = { eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' };

test('POST /reservas responde 202 con Location y la reserva acaba CONFIRMADA', async () => {
  const s = await montarSistema();
  try {
    const r = await post(s.reservasUrl, base, 'k1');
    assert.equal(r.status, 202);
    assert.equal(r.headers.get('location'), '/reservas/R-k1');
    assert.equal((await r.json()).estado, 'PENDIENTE');
    assert.equal((await esperarFinal(s.reservasUrl, 'R-k1')).estado, 'CONFIRMADA');
  } finally { await s.cerrar(); }
});

test('validación: sin importe positivo responde 400', async () => {
  const s = await montarSistema();
  try { assert.equal((await post(s.reservasUrl, { ...base, importe: 0 })).status, 400); } finally { await s.cerrar(); }
});

test('el mismo POST con la misma Idempotency-Key no cobra dos veces', async () => {
  const s = await montarSistema();
  try {
    await post(s.reservasUrl, base, 'k2'); await post(s.reservasUrl, base, 'k2');
    await esperarFinal(s.reservasUrl, 'R-k2');
    assert.equal(s.stats.cobros, 1);
  } finally { await s.cerrar(); }
});

test('GET de una reserva que no existe: 404', async () => {
  const s = await montarSistema();
  try { assert.equal((await fetch(`${s.reservasUrl}/reservas/R-nada`)).status, 404); } finally { await s.cerrar(); }
});
```

```bash
node --test f181-sistema-reservas/reservas.test.js
```

```text
✔ POST /reservas responde 202 con Location y la reserva acaba CONFIRMADA
✔ validación: sin importe positivo responde 400
✔ el mismo POST con la misma Idempotency-Key no cobra dos veces
✔ GET de una reserva que no existe: 404
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

**Pregunta de comprobación:** ¿por qué el servicio responde 202 y no 201? (Porque cuando responde aún no sabe si la
reserva existirá: el cobro puede fallar. 201 afirma que el recurso ya está creado; 202 dice «aceptado, en proceso».)

#### 12. ERROR COMÚN

**Síntoma:** un cliente reclama dos cargos por la misma entrada; en la base hay dos reservas idénticas con un segundo
de diferencia. **Causa:** la app reintentó el POST tras un corte de red **sin** `Idempotency-Key`.
`f181-sistema-reservas/error-comun.js`:

```javascript
// Módulo 32 · F181 · ERROR COMÚN: el cliente reintenta el POST (se le cortó la conexión, pulsó dos veces) SIN
// Idempotency-Key. El servidor no puede saber que es la misma compra: dos reservas y dos cobros.
// Ejecuta: node f181-sistema-reservas/error-comun.js
import { esperarFinal, montarSistema } from './montaje.js';

const s = await montarSistema();
const cuerpo = JSON.stringify({ eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' });
for (const conClave of [false, true]) {
  const antes = s.stats.cobros;
  const ids = [];
  for (let i = 0; i < 2; i++) { // el mismo POST, dos veces
    const r = await fetch(`${s.reservasUrl}/reservas`, { method: 'POST', body: cuerpo,
      headers: { 'content-type': 'application/json', ...(conClave ? { 'idempotency-key': 'compra-77' } : {}) } });
    ids.push((await r.json()).reservaId);
  }
  for (const id of ids) await esperarFinal(s.reservasUrl, id);
  console.log(`${conClave ? 'con Idempotency-Key' : 'sin Idempotency-Key'}: reservas ${[...new Set(ids)].join(', ')} · cobros al cliente: ${s.stats.cobros - antes}`);
}
await s.cerrar();
```

Salida real de `node f181-sistema-reservas/error-comun.js`:

```text
sin Idempotency-Key: reservas R-1, R-2 · cobros al cliente: 2
con Idempotency-Key: reservas R-compra-77 · cobros al cliente: 1
```

**Diagnóstico visual:** en los logs del gateway, dos POST del mismo cliente con el mismo cuerpo y milisegundos de
diferencia, y en el panel del proveedor dos cobros con importes iguales. **Arreglo:** la app genera la clave por
intento de compra; el servicio la exige (o la deduce) y la propaga como clave hacia el proveedor.

#### 13. PREGUNTA DE ENTREVISTA

**Diseña la API de reservas de una ticketera que cobra con un proveedor de pagos externo. ¿Qué devuelve el POST y cómo
evitas cobros duplicados?**

**Respuesta modelo:** el POST valida la entrada, crea la reserva en estado PENDIENTE y responde **202 Accepted** con
`Location: /reservas/{id}`; la saga (plaza, cobro, confirmación) sigue en segundo plano y el cliente consulta el estado
o recibe un webhook. Así la latencia y los fallos del proveedor no llegan a la API. Contra duplicados exijo una
**Idempotency-Key** por intento de compra: la uso como identificador de la reserva y como `workflowId` en Temporal, de
modo que un POST repetido devuelve la misma reserva y no arranca otra saga. Hacia el proveedor envío claves derivadas
(`cobro-{id}`, `reembolso-{id}`), así que los reintentos internos tampoco duplican cargos. Distingo errores: 402 no se
reintenta y compensa; 429 y 5xx se reintentan con backoff. Y una conciliación diaria contra el extracto del proveedor
detecta lo que se escape.

#### 14. ANTI-PATRÓN RELACIONADO

**Cobro dentro de la petición HTTP sin idempotencia:** el controlador llama al proveedor, espera, y si el proveedor
tarda más que el timeout del cliente, este reintenta y se cobra dos veces; si el proceso cae entre el cobro y el
`INSERT`, el dinero queda cobrado sin reserva.

```javascript
// MAL: todo síncrono, sin clave, sin compensación.
app.post('/reservas', async (req, res) => {
  await fetch(`${PAGOS}/cobros`, { method: 'POST', body: JSON.stringify(req.body) }); // ¿y si tarda 30 s?
  db.insert(req.body);                                                                // ¿y si el proceso cae antes?
  res.status(201).end();
});
// BIEN: 202 + Idempotency-Key + saga durable (servicio-reservas.js y F182).
```

En un diagrama de secuencia se ve como una flecha larguísima del cliente al proveedor, atravesando el servicio, sin
ninguna caja que guarde el estado.

---

### Saga orquestada con Temporal.io

#### 1. UBICACIÓN

Módulo 32, Lección 2 de 7 · Fase 3 · 2 h
`spring/reservas/`.

#### 2. PRERREQUISITOS

- Sagas orquestadas con Temporal y compensaciones (Módulo 25, F153) y por qué no 2PC (Módulo 25, F156).
- Reintentos con backoff y errores no reintentables (Módulos 8 y 19).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** la saga de reservas como un workflow de Temporal (pista Node y pista Spring) con compensaciones en
orden inverso, errores no reintentables y una cola separada para el cobro, y **verificar** las compensaciones y el
determinismo del workflow con tests. Lo compruebas cuando `node --test f182-saga-temporal/saga.test.js
f182-saga-temporal/bundle.test.js` pasa 7 de 7 (y, en el Mac, `temporal.infra.js` 3 de 3 y `ReservaWorkflowTest` 3 de 3).

#### 4. ANALOGÍA VISUAL

El **director de una obra con su libreto anotado**. Dibuja al director (el workflow) en una mesa con un libreto donde
cada escena cumplida queda tachada con tinta (el historial de Temporal). Los actores (las actividades) salen a escena
cuando él los llama; si uno se equivoca, lo repiten (reintentos). Si a mitad de función cae el telón por un apagón, el
director vuelve, abre el libreto y sigue **desde la última escena tachada**, no desde el principio. Y si la función se
cancela, recorre el libreto **hacia atrás** desmontando lo montado: primero devuelve el dinero de las entradas, luego
libera el escenario.

#### 5. DIAGRAMA TÉCNICO

```mermaid
stateDiagram-v2
    [*] --> ReservarPlaza
    ReservarPlaza --> Cobrar: ok (compensación: liberarPlaza)
    ReservarPlaza --> Cancelada: SinPlazas (no reintentable)
    Cobrar --> Confirmar: ok (compensación: reembolsar)
    Cobrar --> Compensar: PagoRechazado 402 (no reintentable)
    Cobrar --> Cobrar: 429 / 5xx (reintento con backoff, cola «cobros»)
    Confirmar --> Confirmada: ok
    Confirmar --> Compensar: EventoCerrado
    Compensar --> Cancelada: reembolsar → liberarPlaza (orden inverso)
    Confirmada --> [*]
    Cancelada --> [*]
```

**Texto alternativo:** diagrama de estados de la saga. Empieza en reservar plaza; si va bien pasa a cobrar y registra
la compensación liberar plaza; si no hay plazas termina cancelada sin reintentar. Cobrar puede ir bien y pasar a
confirmar registrando la compensación reembolsar; con un 402 de tarjeta rechazada pasa a compensar sin reintentar; con
429 o 5xx se reintenta a sí mismo con backoff en la cola cobros. Confirmar termina en confirmada o, si el evento se
cerró, pasa a compensar. Compensar ejecuta reembolsar y después liberar plaza, en orden inverso, y termina en cancelada.

#### 6. EXPLICACIÓN NIVEL 0

- Una **saga** es una lista de pasos con su «deshacer» apuntado al lado de cada uno.
- **Temporal** es un programa que hace de director: lleva la cuenta de qué pasos se hicieron y, si algo se cae (incluso
  el ordenador), **sigue donde lo dejó**.
- El código del director debe ser **predecible** (sin llamar a internet ni mirar la hora); el trabajo «real» lo hacen
  los **actores** (actividades), que sí pueden fallar y repetirse.
- Si un paso falla de verdad, el director **deshace** los anteriores, del último al primero.

#### 7. EXPLICACIÓN INTERMEDIA

- **Workflow** (`workflows.js` / `ReservaWorkflowImpl.java`): código determinista que Temporal **reproduce** desde el
  historial tras una caída. Por eso el workflow de Node corre en un sandbox que prohíbe importar módulos con efectos (lo
  ves en el error común) y el de Java usa `Workflow.*` en lugar de hilos o relojes propios.
- **Actividades** (`actividades.js` / `ReservaActividadesImpl.java`): llaman al inventario y al proveedor. Son
  **idempotentes** porque Temporal puede ejecutarlas más de una vez.
- **Errores no reintentables:** `ApplicationFailure.nonRetryable(…, 'PagoRechazado')` en Node; en Java, el nombre de la
  clase de la excepción en `setDoNotRetry(…)`. Un 402 no mejora reintentando.
- **Dos colas de tareas:** `reservas` (workflow y actividades propias) y `cobros` (solo el proveedor). Separar el cobro
  permite limitar su ritmo (F185) con `maxTaskQueueActivitiesPerSecond` en el worker de esa cola, sin frenar lo demás.
- **Tiempos:** `startToCloseTimeout` de 10 s por intento; para el cobro, `scheduleToCloseTimeout` de 10 minutos en total
  (cola + reintentos) y `maximumAttempts: 0` (sin límite de intentos dentro de ese tiempo).
- **La misma saga en dos sitios** (pista Node): `saga.js` no importa nada, así que corre igual en el sandbox de Temporal
  y en el orquestador local de los tests y de F184/F185, que reintenta con backoff pero **no es durable**.

#### 8. EXPLICACIÓN MAESTRA

| Cómo coordinar la reserva | A favor | En contra | Cuándo |
|---|---|---|---|
| **Saga orquestada con Temporal** (este proyecto) | estado durable, reintentos y timeouts declarativos, historial visible en la UI, versiones del workflow | operar Temporal (o pagar Temporal Cloud); reglas de determinismo | flujos con dinero, pasos largos o esperas humanas |
| **Saga coreografiada** (eventos en RabbitMQ/Kafka, Módulos 11 y 22) | sin componente central | el flujo queda repartido; difícil saber en qué paso va una reserva | flujos cortos entre equipos autónomos |
| **Orquestador casero** (tabla de estados + cron) | sin dependencias nuevas | reinventas reintentos, timeouts y recuperación tras caídas | un solo paso remoto y poco volumen |
| **2PC / XA** | atomicidad «de libro» | el proveedor externo no participa; bloqueos (Módulo 25) | nunca con terceros |

- **Compensación ≠ rollback:** un reembolso es una operación nueva, visible para el cliente (le llega un abono). Diseña
  la experiencia: «Tu pago se ha devuelto», no «aquí no ha pasado nada».
- **Compensaciones que fallan:** se reintentan sin límite de intentos (son idempotentes); si una no puede completarse en
  horas, la saga debe avisar a una persona, no darse por buena.
- **Cuándo NO** usar Temporal: si no hay nada que compensar (un solo paso remoto) o si el equipo no puede operarlo y no
  puede pagar la versión gestionada. Un outbox con reintentos (Módulo 25) puede bastar.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, `@temporalio/workflow`, `@temporalio/worker`, `@temporalio/client` y
`@temporalio/activity` **1.26.0** (npm, 2026-11-17), Temporal Server **1.32.1**. Pista Spring: `io.temporal:temporal-sdk`
y `temporal-testing` **1.41.1** (Maven Central, 2026-11-16).

La saga, sin imports (`f182-saga-temporal/saga.js`):

```javascript
// Módulo 32 · F182 · La saga de una reserva: reservar plaza -> cobrar (proveedor externo) -> confirmar.
// Si un paso falla, deshace los anteriores en orden inverso. Sin imports: corre igual dentro del sandbox determinista
// de un workflow de Temporal (workflows.js) y en el orquestador local o en los tests (orquestador-local.js).
export async function sagaReserva(reserva, act) {
  const compensaciones = []; // pila: la última en entrar es la primera en deshacerse
  const hechos = [];
  try {
    await act.reservarPlaza(reserva);
    hechos.push('reservarPlaza');
    compensaciones.push(['liberarPlaza', () => act.liberarPlaza(reserva)]);

    const { cobroId } = await act.cobrar(reserva);
    hechos.push('cobrar');
    compensaciones.push(['reembolsar', () => act.reembolsar({ reservaId: reserva.reservaId, cobroId })]);

    await act.confirmar({ ...reserva, cobroId });
    hechos.push('confirmar');
    return { reservaId: reserva.reservaId, estado: 'CONFIRMADA', hechos, compensadas: [] };
  } catch (error) {
    // En Temporal el fallo de una actividad llega envuelto (ActivityFailure); el motivo real va en error.cause.
    const motivo = error.cause?.message ?? error.message;
    const compensadas = [];
    for (const [nombre, deshacer] of compensaciones.reverse()) {
      await deshacer(); // las compensaciones son idempotentes y se reintentan hasta que salen bien
      compensadas.push(nombre);
    }
    await act.cancelar({ ...reserva, motivo });
    return { reservaId: reserva.reservaId, estado: 'CANCELADA', motivo, hechos, compensadas };
  }
}
```

Las actividades (`f182-saga-temporal/actividades.js`):

```javascript
// Módulo 32 · F182 · Actividades de la saga: el código que toca el mundo (inventario, proveedor de pagos, repositorio).
// Temporal las reintenta según la política del workflow; por eso TODAS son idempotentes (Idempotency-Key = reservaId).
// Versiones: Node.js 26.13.1 LTS, @temporalio/activity 1.26.0 (solo para ApplicationFailure).
import { ApplicationFailure } from '@temporalio/activity';
import { SinPlazas } from '../f181-sistema-reservas/inventario.js';

export function crearActividades({ inventario, repo, pagosUrl }) {
  async function llamar(ruta, clave, cuerpo) {
    const r = await fetch(`${pagosUrl}${ruta}`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': clave }, body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(5_000), // nunca esperar al proveedor sin límite
    });
    return { estado: r.status, cuerpo: await r.json(), reintentarEn: r.headers.get('retry-after') };
  }
  return {
    async reservarPlaza(r) {
      try { return inventario.reservarPlaza(r); }
      catch (e) { if (e instanceof SinPlazas) throw ApplicationFailure.nonRetryable(e.message, 'SinPlazas'); throw e; }
    },
    async liberarPlaza(r) { return inventario.liberarPlaza(r); },
    async cobrar(r) {
      const { estado, cuerpo, reintentarEn } = await llamar('/cobros', `cobro-${r.reservaId}`, { reservaId: r.reservaId, importe: r.importe, tarjeta: r.tarjeta });
      if (estado === 201) return { cobroId: cuerpo.cobroId };
      if (estado === 402) throw ApplicationFailure.nonRetryable(`tarjeta rechazada: ${cuerpo.motivo}`, 'PagoRechazado');
      // 429 y 5xx: reintentable (Temporal aplica backoff exponencial). El mensaje lleva el Retry-After para diagnosticar.
      throw ApplicationFailure.retryable(`proveedor respondió ${estado}${reintentarEn ? ` (Retry-After: ${reintentarEn} s)` : ''}`, `Http${estado}`);
    },
    async reembolsar({ reservaId, cobroId }) {
      const { estado } = await llamar('/reembolsos', `reembolso-${reservaId}`, { cobroId });
      if (estado !== 201) throw ApplicationFailure.retryable(`reembolso respondió ${estado}`, `Http${estado}`);
      return { cobroId };
    },
    async confirmar(r) {
      if (r.fallarAlConfirmar) throw ApplicationFailure.nonRetryable('el organizador canceló el evento', 'EventoCerrado'); // para probar la compensación doble
      repo.actualizar(r.reservaId, { estado: 'CONFIRMADA', cobroId: r.cobroId });
    },
    async cancelar(r) { repo.actualizar(r.reservaId, { estado: 'CANCELADA', motivo: r.motivo }); },
  };
}
```

El workflow (`f182-saga-temporal/workflows.js`):

```javascript
// Módulo 32 · F182 · Workflow de Temporal para la saga de reservas.
// Versiones: Node.js 26.13.1 LTS, @temporalio/workflow 1.26.0, Temporal Server 1.32.1 (o `temporal server start-dev`).
// Corre en el sandbox determinista de Temporal: sin red, sin disco, sin imports de Node. Solo orquesta; el trabajo real
// lo hacen las actividades (actividades.js), que Temporal reintenta y cuyo resultado guarda en el historial.
import { proxyActivities } from '@temporalio/workflow';
import { sagaReserva } from './saga.js';

const reintentos = { initialInterval: '200 milliseconds', backoffCoefficient: 2, maximumInterval: '5 seconds', maximumAttempts: 8,
  nonRetryableErrorTypes: ['SinPlazas', 'PagoRechazado', 'EventoCerrado'] };

// Actividades propias: cola «reservas».
const act = proxyActivities({ startToCloseTimeout: '10 seconds', retry: reintentos });
// El cobro va a su propia cola, «cobros», para poder limitar su ritmo sin frenar lo demás (ADR-0007, F185/F186).
// scheduleToCloseTimeout: tiempo total que aceptamos esperar al cobro, contando la cola y los reintentos.
const pagos = proxyActivities({ taskQueue: 'cobros', startToCloseTimeout: '10 seconds', scheduleToCloseTimeout: '10 minutes',
  retry: { ...reintentos, maximumAttempts: 0 } }); // 0 = sin límite de intentos: manda scheduleToCloseTimeout

export async function reservaWorkflow(reserva) {
  // Nombradas una a una: proxyActivities devuelve un Proxy sin claves propias, así que «{ ...act }» copia un objeto
  // VACÍO y la saga falla con «act.cancelar is not a function» (visto con el servidor real de Temporal en el Mac).
  const { reservarPlaza, liberarPlaza, confirmar, cancelar } = act;
  return sagaReserva(reserva, { reservarPlaza, liberarPlaza, confirmar, cancelar, cobrar: pagos.cobrar, reembolsar: pagos.reembolsar });
}
```

Los workers (`f182-saga-temporal/worker.js`) y el cliente (`f182-saga-temporal/iniciar.js`):

```javascript
// Módulo 32 · F182 · Workers de Temporal: uno para la cola «reservas» (workflows + actividades propias) y otro para la
// cola «cobros» (solo el proveedor de pagos). Ejecuta con `temporal server start-dev` en marcha:
//   node f182-saga-temporal/worker.js            (sin límite de cobros: el diseño ANTES de la restricción)
//   COBROS_POR_SEGUNDO=18 node f182-saga-temporal/worker.js   (el diseño del ADR-0007: 18 cobros/s en toda la cola)
// Versiones: @temporalio/worker 1.26.0, Temporal Server 1.32.1. Necesita el proveedor (node f181-sistema-reservas/proveedor-pagos.js).
import { NativeConnection, Worker } from '@temporalio/worker';
import { crearActividades } from './actividades.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';
import { crearRepositorio } from '../f181-sistema-reservas/repositorio.js';

const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' });
const actividades = crearActividades({ inventario: crearInventario({ 'concierto-1': 500 }), repo: crearRepositorio(),
  pagosUrl: process.env.PAGOS_URL ?? 'http://localhost:8090' });
const limite = process.env.COBROS_POR_SEGUNDO ? Number(process.env.COBROS_POR_SEGUNDO) : undefined;

const reservas = await Worker.create({ connection, taskQueue: 'reservas',
  workflowsPath: new URL('./workflows.js', import.meta.url).pathname, activities: actividades });
const cobros = await Worker.create({ connection, taskQueue: 'cobros',
  activities: { cobrar: actividades.cobrar, reembolsar: actividades.reembolsar },
  // Límite aplicado por el SERVIDOR a toda la cola, sumando todos los workers (no por proceso): ver F183, error común.
  ...(limite ? { maxTaskQueueActivitiesPerSecond: limite } : {}) });
console.log(`workers en «reservas» y «cobros»${limite ? ` (cobros limitados a ${limite}/s)` : ''}. Ctrl+C para salir`);
await Promise.all([reservas.run(), cobros.run()]);
```

```javascript
// Módulo 32 · F182 · Cliente de Temporal: inicia la saga de 3 reservas y espera su resultado.
// Ejecuta (servidor, proveedor y worker en marcha): node f182-saga-temporal/iniciar.js
import { Client, Connection } from '@temporalio/client';

const client = new Client({ connection: await Connection.connect({ address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233' }) });
const reservas = [
  { reservaId: 'R-1', eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' },
  { reservaId: 'R-2', eventoId: 'concierto-1', clienteId: 'C-2', importe: 80, tarjeta: '4000-RECHAZAR' },
  { reservaId: 'R-3', eventoId: 'concierto-1', clienteId: 'C-3', importe: 80, tarjeta: '4242-OK', fallarAlConfirmar: true },
];
for (const r of reservas) {
  // workflowId = reservaId: si el cliente reintenta el POST, Temporal no arranca una segunda saga para la misma reserva.
  const resultado = await client.workflow.execute('reservaWorkflow', { taskQueue: 'reservas', workflowId: `reserva-${r.reservaId}`, args: [r] });
  console.log(JSON.stringify(resultado));
}
```

El orquestador local para desarrollo y tests (`f182-saga-temporal/orquestador-local.js`):

```javascript
// Módulo 32 · F182 · Orquestador LOCAL: ejecuta la misma saga (saga.js) y las mismas actividades sin servidor de Temporal,
// con una política de reintentos parecida a la del workflow (backoff exponencial, errores no reintentables).
// Sirve para desarrollar y para los tests; NO es durable: si el proceso muere a mitad, la saga se pierde. En el
// proyecto entregable usa orquestador-temporal.js (Temporal guarda cada paso y retoma tras una caída).
import { sagaReserva } from './saga.js';
import { espera } from '../comun/estadistica.js';

export function conReintentos(actividades, { intentos = 8, inicialMs = 200, coeficiente = 2, maximoMs = 5_000, alReintentar } = {}) {
  const envueltas = {};
  for (const [nombre, fn] of Object.entries(actividades)) {
    envueltas[nombre] = async (...args) => {
      for (let intento = 1, pausa = inicialMs; ; intento++, pausa = Math.min(pausa * coeficiente, maximoMs)) {
        try { return await fn(...args); }
        catch (e) {
          if (e.nonRetryable || intento >= intentos) throw e;
          alReintentar?.(nombre, intento, e);
          await espera(pausa);
        }
      }
    };
  }
  return envueltas;
}

export function crearOrquestadorLocal(actividades, politica) {
  const act = conReintentos(actividades, politica);
  return { iniciar: (reserva) => sagaReserva(reserva, act) };
}
```

**Pista Spring Boot**: el workflow con `io.temporal.workflow.Saga`
(`spring/reservas/src/main/java/academia/reservas/ReservaWorkflowImpl.java`):

```java
package academia.reservas;

import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.failure.ActivityFailure;
import io.temporal.failure.TemporalFailure;
import io.temporal.workflow.Saga;
import io.temporal.workflow.Workflow;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Módulo 32 · F182 · La saga: reservar plaza -> cobrar (cola «cobros») -> confirmar; si algo falla, compensa en orden
 * inverso. Código determinista: nada de red, reloj del sistema ni aleatorios aquí (eso va en las actividades).
 */
public class ReservaWorkflowImpl implements ReservaWorkflow {

    private static final RetryOptions REINTENTOS = RetryOptions.newBuilder()
            .setInitialInterval(Duration.ofMillis(200)).setBackoffCoefficient(2).setMaximumInterval(Duration.ofSeconds(5))
            .setMaximumAttempts(8).setDoNotRetry("academia.reservas.SinPlazas", "academia.reservas.PagoRechazado", "academia.reservas.EventoCerrado")
            .build();

    private final ReservaActividades act = Workflow.newActivityStub(ReservaActividades.class,
            ActivityOptions.newBuilder().setStartToCloseTimeout(Duration.ofSeconds(10)).setRetryOptions(REINTENTOS).build());

    // El cobro va a su propia cola para limitar su ritmo sin frenar lo demás (ADR-0002). Sin límite de intentos:
    // manda el ScheduleToCloseTimeout (10 minutos en total, contando la espera en la cola).
    private final ReservaActividades pagos = Workflow.newActivityStub(ReservaActividades.class,
            ActivityOptions.newBuilder().setTaskQueue("cobros").setStartToCloseTimeout(Duration.ofSeconds(10))
                    .setScheduleToCloseTimeout(Duration.ofMinutes(10))
                    .setRetryOptions(RetryOptions.newBuilder(REINTENTOS).setMaximumAttempts(0).build()).build());

    @Override
    public ResultadoSaga reservar(Reserva r) {
        Saga saga = new Saga(new Saga.Options.Builder().setParallelCompensation(false).build());
        List<String> compensadas = new ArrayList<>();
        try {
            act.reservarPlaza(r);
            saga.addCompensation(() -> { act.liberarPlaza(r); compensadas.add("liberarPlaza"); });
            String cobroId = pagos.cobrar(r);
            saga.addCompensation(() -> { pagos.reembolsar(r.reservaId(), cobroId); compensadas.add("reembolsar"); });
            act.confirmar(r, cobroId);
            return new ResultadoSaga(r.reservaId(), "CONFIRMADA", null, List.of());
        } catch (ActivityFailure e) {
            // El motivo real va en la causa (ApplicationFailure); getOriginalMessage() es el texto de la excepción original.
            String motivo = e.getCause() instanceof TemporalFailure causa ? causa.getOriginalMessage() : e.getMessage();
            saga.compensate(); // orden inverso: la última compensación registrada se ejecuta primero
            act.cancelar(r, motivo);
            return new ResultadoSaga(r.reservaId(), "CANCELADA", motivo, compensadas);
        }
    }
}
```

Los workers con el límite de la cola de cobros (`spring/reservas/src/main/java/academia/reservas/TemporalConfig.java`):

```java
package academia.reservas;

import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.serviceclient.WorkflowServiceStubsOptions;
import io.temporal.worker.Worker;
import io.temporal.worker.WorkerFactory;
import io.temporal.worker.WorkerOptions;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Módulo 32 · F182 · Conexión con Temporal y los dos workers: «reservas» (workflow + actividades propias) y «cobros»
 * (solo el proveedor), con el límite del ADR-0002 aplicado por el servidor a toda la cola.
 */
@Configuration
class TemporalConfig {

    @Bean(destroyMethod = "shutdown")
    WorkflowServiceStubs servicio(@Value("${temporal.direccion}") String direccion) {
        return WorkflowServiceStubs.newServiceStubs(WorkflowServiceStubsOptions.newBuilder().setTarget(direccion).build());
    }

    @Bean
    WorkflowClient cliente(WorkflowServiceStubs servicio) {
        return WorkflowClient.newInstance(servicio);
    }

    @Bean
    ReservaActividadesImpl actividades(RestClient.Builder http, @Value("${pagos.url}") String pagosUrl) {
        return new ReservaActividadesImpl(http.baseUrl(pagosUrl).build(), Map.of("concierto-1", 500));
    }

    @Bean(destroyMethod = "shutdown")
    WorkerFactory workers(WorkflowClient cliente, ReservaActividadesImpl actividades,
                          @Value("${reservas.cobros-por-segundo}") double cobrosPorSegundo) {
        WorkerFactory fabrica = WorkerFactory.newInstance(cliente);
        Worker reservas = fabrica.newWorker("reservas");
        reservas.registerWorkflowImplementationTypes(ReservaWorkflowImpl.class);
        reservas.registerActivitiesImplementations(actividades);
        WorkerOptions.Builder opciones = WorkerOptions.newBuilder();
        if (cobrosPorSegundo > 0) opciones.setMaxTaskQueueActivitiesPerSecond(cobrosPorSegundo);
        Worker cobros = fabrica.newWorker("cobros", opciones.build());
        cobros.registerActivitiesImplementations(actividades);
        fabrica.start();
        return fabrica;
    }
}
```

#### 10. MINI-LABORATORIO

1. Comprueba, sin servidor, que el workflow es apto para el sandbox de Temporal y que la saga compensa bien:

```bash
node --test f182-saga-temporal/saga.test.js f182-saga-temporal/bundle.test.js
```

   **Output esperado:**

```text
✔ workflows.js se empaqueta para el sandbox de Temporal
✔ workflow-mal.js (importa las actividades) se rechaza
✔ camino feliz: plaza reservada, cobro aprobado y reserva confirmada
✔ tarjeta rechazada (402, no reintentable): se libera la plaza y no se cobra nada
✔ falla el último paso: reembolso y liberación, en orden inverso
✔ sin plazas: la saga termina CANCELADA sin tocar al proveedor
✔ un 429 del proveedor se reintenta con backoff hasta cobrar, y nunca se cobra dos veces
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

   **Captura comentada:** el test del 429 tarda unos 2,6 s: con el proveedor a 1 petición/s, tres cobros necesitan tres
   segundos distintos y el backoff los va colocando; al final hay exactamente 3 cobros, ninguno duplicado.

2. **Con Temporal de verdad (en tu Mac; aquí no se pudo descargar el servidor).** Con el CLI de Temporal instalado
   (`brew install temporal`), en cuatro terminales:

```bash
temporal server start-dev                                   # 1: servidor + UI en http://localhost:8233
node f181-sistema-reservas/proveedor-pagos.js               # 2: proveedor en :8090
node f182-saga-temporal/worker.js                           # 3: workers «reservas» y «cobros»
node f182-saga-temporal/iniciar.js                          # 4: tres reservas
```

   **Output esperado** (terminal 4, deducido del código y de los tests, pendiente de ver en el Mac):

```text
{"reservaId":"R-1","estado":"CONFIRMADA","hechos":["reservarPlaza","cobrar","confirmar"],"compensadas":[]}
{"reservaId":"R-2","estado":"CANCELADA","motivo":"tarjeta rechazada: fondos insuficientes","hechos":["reservarPlaza"],"compensadas":["liberarPlaza"]}
{"reservaId":"R-3","estado":"CANCELADA","motivo":"el organizador canceló el evento","hechos":["reservarPlaza","cobrar"],"compensadas":["reembolsar","liberarPlaza"]}
```

   **Captura descrita:** en la UI (`http://localhost:8233`), el workflow `reserva-R-3` muestra en su historial
   `ActivityTaskCompleted` para `reservarPlaza` y `cobrar`, `ActivityTaskFailed` para `confirmar` y después las
   actividades `reembolsar` (en la cola `cobros`), `liberarPlaza` y `cancelar`. **Rompe algo:** para el worker
   (Ctrl+C) con el proveedor parado, lanza `iniciar.js`, arranca el proveedor y luego el worker: la saga continúa donde
   estaba.

3. Pista Spring (Mac): `cd spring &&./gradlew:reservas:test` ejecuta `ReservaWorkflowTest` con el servidor
   de Temporal **en memoria** de `temporal-testing` (sin Docker ni CLI).

#### 11. VERIFICACIÓN

El test de la saga (`f182-saga-temporal/saga.test.js`):

```javascript
// Módulo 32 · F182 · tests de la saga (sin servidor de Temporal): node --test f182-saga-temporal/saga.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sagaReserva } from './saga.js';
import { crearActividades } from './actividades.js';
import { conReintentos } from './orquestador-local.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';
import { crearRepositorio } from '../f181-sistema-reservas/repositorio.js';
import { crearProveedor } from '../f181-sistema-reservas/proveedor-pagos.js';
import { cerrar, escuchar } from '../comun/http.js';

async function montar(opciones = {}, aforo = 1) {
  const { servidor, stats } = crearProveedor(opciones);
  const pagosUrl = await escuchar(servidor);
  const inventario = crearInventario({ 'concierto-1': aforo });
  const repo = crearRepositorio();
  const act = conReintentos(crearActividades({ inventario, repo, pagosUrl }), { inicialMs: 10, intentos: 20 });
  return { act, inventario, repo, stats, cerrar: () => cerrar(servidor) };
}
const reserva = (id, extra = {}) => ({ reservaId: id, eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK', ...extra });

test('camino feliz: plaza reservada, cobro aprobado y reserva confirmada', async () => {
  const m = await montar();
  try {
    const r = await sagaReserva(reserva('R-1'), m.act);
    assert.deepEqual([r.estado, r.hechos], ['CONFIRMADA', ['reservarPlaza', 'cobrar', 'confirmar']]);
    assert.equal(m.inventario.libres('concierto-1'), 0);
    assert.equal(m.repo.obtener('R-1').cobroId, 'CB-R-1');
  } finally { await m.cerrar(); }
});

test('tarjeta rechazada (402, no reintentable): se libera la plaza y no se cobra nada', async () => {
  const m = await montar();
  try {
    const r = await sagaReserva(reserva('R-2', { tarjeta: '4000-RECHAZAR' }), m.act);
    assert.deepEqual([r.estado, r.compensadas], ['CANCELADA', ['liberarPlaza']]);
    assert.match(r.motivo, /tarjeta rechazada/);
    assert.equal(m.inventario.libres('concierto-1'), 1);
    assert.equal(m.stats.peticiones, 1); // el 402 no se reintenta
  } finally { await m.cerrar(); }
});

test('falla el último paso: reembolso y liberación, en orden inverso', async () => {
  const m = await montar();
  try {
    const r = await sagaReserva(reserva('R-3', { fallarAlConfirmar: true }), m.act);
    assert.deepEqual(r.compensadas, ['reembolsar', 'liberarPlaza']);
    assert.deepEqual([m.stats.cobros, m.stats.reembolsos], [1, 1]);
  } finally { await m.cerrar(); }
});

test('sin plazas: la saga termina CANCELADA sin tocar al proveedor', async () => {
  const m = await montar();
  try {
    await sagaReserva(reserva('R-4'), m.act);
    const r = await sagaReserva(reserva('R-5'), m.act);
    assert.deepEqual([r.estado, r.motivo, r.compensadas], ['CANCELADA', 'sin plazas en concierto-1', []]);
  } finally { await m.cerrar(); }
});

test('un 429 del proveedor se reintenta con backoff hasta cobrar, y nunca se cobra dos veces', async () => {
  const m = await montar({ limiteRps: 1 }, 3);
  try {
    const rs = await Promise.all(['R-6', 'R-7', 'R-8'].map((id) => sagaReserva(reserva(id), m.act)));
    assert.deepEqual(rs.map((r) => r.estado), ['CONFIRMADA', 'CONFIRMADA', 'CONFIRMADA']);
    assert.ok(m.stats.rechazados429 >= 2, `429 recibidos: ${m.stats.rechazados429}`);
    assert.equal(m.stats.cobros, 3);
  } finally { await m.cerrar(); }
});
```

El test del empaquetado (`f182-saga-temporal/bundle.test.js`):

```javascript
// Módulo 32 · F182 · test sin servidor: el workflow pasa el empaquetador de Temporal (el mismo que usa Worker.create),
// que rechaza imports no deterministas. node --test f182-saga-temporal/bundle.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bundleWorkflowCode } from '@temporalio/worker';

const silencio = { info() {}, warn() {}, debug() {}, trace() {}, error() {}, log() {} };
const ruta = (f) => new URL(f, import.meta.url).pathname;

test('workflows.js se empaqueta para el sandbox de Temporal', { timeout: 120_000 }, async () => {
  const { code } = await bundleWorkflowCode({ workflowsPath: ruta('./workflows.js'), logger: silencio });
  assert.ok(code.includes('reservaWorkflow'));
});

test('workflow-mal.js (importa las actividades) se rechaza', { timeout: 120_000 }, async () => {
  await assert.rejects(bundleWorkflowCode({ workflowsPath: ruta('./workflow-mal.js'), logger: silencio }),
    /importing the following disallowed modules:\s+- '@temporalio\/activity'/);
});
```

Con un servidor real (`f182-saga-temporal/temporal.infra.js`, pendiente en el Mac:
`node --test f182-saga-temporal/temporal.infra.js` descarga el servidor de desarrollo, o usa
`TEMPORAL_ADDRESS=localhost:7233` con `temporal server start-dev`; espera `pass 3`):

```javascript
// Módulo 32 · F182 · Tests con un servidor Temporal de verdad (no corre en `npm test`).
// Por defecto descarga y arranca el servidor de desarrollo del CLI (TestWorkflowEnvironment.createLocal); con
// TEMPORAL_ADDRESS=host:7233 usa uno que ya tengas en marcha. Ejecuta: node --test f182-saga-temporal/temporal.infra.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';
import { crearActividades } from './actividades.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';
import { crearRepositorio } from '../f181-sistema-reservas/repositorio.js';
import { crearProveedor } from '../f181-sistema-reservas/proveedor-pagos.js';
import { cerrar, escuchar } from '../comun/http.js';

let env; let workers = []; let enMarcha; let proveedor; let stats;
before(async () => {
  Runtime.install({ logger: new DefaultLogger('WARN') });
  ({ servidor: proveedor, stats } = crearProveedor());
  const pagosUrl = await escuchar(proveedor);
  env = process.env.TEMPORAL_ADDRESS
    ? await TestWorkflowEnvironment.createFromExistingServer({ address: process.env.TEMPORAL_ADDRESS })
    : await TestWorkflowEnvironment.createLocal();
  const act = crearActividades({ inventario: crearInventario({ 'concierto-1': 10 }), repo: crearRepositorio(), pagosUrl });
  workers = [
    await Worker.create({ connection: env.nativeConnection, taskQueue: 'reservas', workflowsPath: new URL('./workflows.js', import.meta.url).pathname, activities: act }),
    await Worker.create({ connection: env.nativeConnection, taskQueue: 'cobros', activities: { cobrar: act.cobrar, reembolsar: act.reembolsar } }),
  ];
  enMarcha = Promise.all(workers.map((w) => w.run()));
}, { timeout: 180_000 });
after(async () => { workers.forEach((w) => w.shutdown()); await enMarcha; await env?.teardown(); await cerrar(proveedor); });

const correr = (r) => env.client.workflow.execute('reservaWorkflow', { taskQueue: 'reservas', workflowId: `reserva-${r.reservaId}-${Date.now()}`, args: [r] });
const base = { eventoId: 'concierto-1', clienteId: 'C-1', importe: 80, tarjeta: '4242-OK' };

test('Temporal: camino feliz', { timeout: 90_000 }, async () => {
  assert.equal((await correr({ ...base, reservaId: 'T-1' })).estado, 'CONFIRMADA');
});
test('Temporal: tarjeta rechazada -> CANCELADA con la plaza liberada', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, reservaId: 'T-2', tarjeta: '4000-RECHAZAR' });
  assert.deepEqual([r.estado, r.compensadas], ['CANCELADA', ['liberarPlaza']]);
  assert.match(r.motivo, /tarjeta rechazada/);
});
test('Temporal: falla confirmar -> reembolsar y liberar', { timeout: 90_000 }, async () => {
  const r = await correr({ ...base, reservaId: 'T-3', fallarAlConfirmar: true });
  assert.deepEqual(r.compensadas, ['reembolsar', 'liberarPlaza']);
  assert.ok(stats.reembolsos >= 1);
});
```

Pista Spring (`spring/reservas/src/test/java/academia/reservas/ReservaWorkflowTest.java`, pendiente en el Mac; espera
3 líneas `PASSED` y `BUILD SUCCESSFUL`):

```java
package academia.reservas;

import static org.assertj.core.api.Assertions.assertThat;

import io.temporal.client.WorkflowOptions;
import io.temporal.testing.TestWorkflowEnvironment;
import io.temporal.worker.Worker;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Módulo 32 · F182 · La saga con el servidor de Temporal EN MEMORIA (temporal-testing 1.41.1): sin Docker ni CLI.
 * Las actividades son falsas y anotan lo que se llama, para comprobar el orden de las compensaciones.
 */
class ReservaWorkflowTest {

    /** Actividades falsas: «4000-RECHAZAR» falla el cobro; fallarAlConfirmar falla el último paso. */
    static class Falsas implements ReservaActividades {
        final List<String> llamadas = new CopyOnWriteArrayList<>();
        public void reservarPlaza(Reserva r) { llamadas.add("reservarPlaza"); }
        public void liberarPlaza(Reserva r) { llamadas.add("liberarPlaza"); }
        public String cobrar(Reserva r) {
            llamadas.add("cobrar");
            if ("4000-RECHAZAR".equals(r.tarjeta())) throw new PagoRechazado("fondos insuficientes");
            return "CB-" + r.reservaId();
        }
        public void reembolsar(String reservaId, String cobroId) { llamadas.add("reembolsar"); }
        public void confirmar(Reserva r, String cobroId) {
            llamadas.add("confirmar");
            if (r.fallarAlConfirmar()) throw new EventoCerrado();
        }
        public void cancelar(Reserva r, String motivo) { llamadas.add("cancelar"); }
    }

    private TestWorkflowEnvironment env;
    private final Falsas falsas = new Falsas();

    @BeforeEach
    void arrancar() {
        env = TestWorkflowEnvironment.newInstance();
        Worker reservas = env.newWorker("reservas");
        reservas.registerWorkflowImplementationTypes(ReservaWorkflowImpl.class);
        reservas.registerActivitiesImplementations(falsas);
        env.newWorker("cobros").registerActivitiesImplementations(falsas); // la cola del cobro (ADR-0002)
        env.start();
    }

    @AfterEach
    void parar() {
        env.close();
    }

    private ResultadoSaga reservar(Reserva r) {
        return env.getWorkflowClient().newWorkflowStub(ReservaWorkflow.class,
                WorkflowOptions.newBuilder().setTaskQueue("reservas").setWorkflowId("reserva-" + r.reservaId()).build()).reservar(r);
    }

    @Test
    void caminoFeliz() {
        ResultadoSaga r = reservar(new Reserva("R-1", "concierto-1", "C-1", 80, "4242-OK", false));
        assertThat(r.estado()).isEqualTo("CONFIRMADA");
        assertThat(falsas.llamadas).containsExactly("reservarPlaza", "cobrar", "confirmar");
    }

    @Test
    void tarjetaRechazadaLiberaLaPlazaSinReintentar() {
        ResultadoSaga r = reservar(new Reserva("R-2", "concierto-1", "C-1", 80, "4000-RECHAZAR", false));
        assertThat(r.estado()).isEqualTo("CANCELADA");
        assertThat(r.motivo()).isEqualTo("tarjeta rechazada: fondos insuficientes");
        assertThat(falsas.llamadas).containsExactly("reservarPlaza", "cobrar", "liberarPlaza", "cancelar");
    }

    @Test
    void falloAlConfirmarCompensaEnOrdenInverso() {
        ResultadoSaga r = reservar(new Reserva("R-3", "concierto-1", "C-1", 80, "4242-OK", true));
        assertThat(r.compensadas()).containsExactly("reembolsar", "liberarPlaza");
    }
}
```

**Pregunta de comprobación:** si el worker se cae justo después de que el proveedor aprobó el cobro pero antes de que
Temporal registrara el resultado, ¿se cobra dos veces? (No: Temporal reintenta la actividad `cobrar`, pero llama con la
misma `Idempotency-Key` `cobro-R-…` y el proveedor devuelve la respuesta guardada.)

#### 12. ERROR COMÚN

**Síntoma:** el worker no arranca y el log dice que el workflow importa módulos prohibidos. **Causa:** para «ahorrar
una capa», el workflow llama directamente a las actividades (y con ellas a `fetch` y al proveedor) en lugar de usar
`proxyActivities`. `f182-saga-temporal/workflow-mal.js`:

```javascript
// Módulo 32 · F182 · ERROR COMÚN: llamar al proveedor de pagos DESDE el workflow (importando las actividades como
// funciones normales). El workflow arrastra node:http/fetch y código no determinista al sandbox de Temporal.
import { crearActividades } from './actividades.js';
import { crearInventario } from '../f181-sistema-reservas/inventario.js';

export async function reservaWorkflowMal(reserva) {
  const act = crearActividades({ inventario: crearInventario({}), repo: null, pagosUrl: 'http://localhost:8090' });
  return act.cobrar(reserva); // ¡red dentro del workflow!
}
```

Salida real de `node f182-saga-temporal/error-comun.js` (empaqueta `workflow-mal.js` igual que `Worker.create`):

```text
Your Workflow code (or a library used by your Workflow code) is importing the following disallowed modules:
  - '@temporalio/activity'
```

**Diagnóstico visual:** el mensaje lista el módulo culpable; sigue la cadena de imports desde el workflow hasta él.
**Arreglo:** el workflow solo importa `@temporalio/workflow` y código puro (`saga.js`); las actividades se registran en
el worker y se llaman con `proxyActivities`. En Java, el equivalente es crear `RestClient` o leer `System.currentTimeMillis()`
dentro de `ReservaWorkflowImpl`: no falla al compilar, pero rompe la reproducción (*non-deterministic error*) tras un
reinicio.

#### 13. PREGUNTA DE ENTREVISTA

**¿Por qué orquestar la reserva con Temporal y no con eventos o con una transacción distribuida?**

**Respuesta modelo:** porque la reserva toca un tercero que no participa en transacciones (2PC queda descartado) y
mezcla pasos que pueden tardar o fallar de forma transitoria. Con Temporal el flujo está en un solo sitio, legible como
código; el estado es **durable**, así que una caída del worker no deja reservas a medias; los reintentos con backoff,
los timeouts y los errores no reintentables se declaran; y el historial de cada reserva se ve en la UI, lo que ayuda
en los incidentes. Las actividades son idempotentes (claves hacia el proveedor) y las compensaciones se ejecutan en
orden inverso. El precio es operar Temporal y respetar el determinismo del workflow, que vigilo con un test de
empaquetado en CI. Elegiría coreografía con eventos si fueran dos pasos entre equipos autónomos y sin dinero de por
medio, y un outbox con reintentos si no hubiera nada que compensar.

#### 14. ANTI-PATRÓN RELACIONADO

**Saga sin compensaciones idempotentes:** el reembolso no lleva clave; cuando Temporal lo reintenta tras un timeout, el
cliente recibe dos abonos.

```javascript
// MAL: sin Idempotency-Key, cada reintento es un reembolso nuevo.
async reembolsar({ cobroId }) { await fetch(`${pagosUrl}/reembolsos`, { method: 'POST', body: JSON.stringify({ cobroId }) }); }
// BIEN (actividades.js): clave estable por reserva; el proveedor devuelve la respuesta ya dada.
const { estado } = await llamar('/reembolsos', `reembolso-${reservaId}`, { cobroId });
```

En el historial de Temporal se ve como dos `ActivityTaskStarted` de `reembolsar` y, en el extracto del proveedor, dos
abonos con el mismo importe.

---

### API Gateway con rate limiting

#### 1. UBICACIÓN

Módulo 32, Lección 3 de 7 · Fase 3 · 1,5 h
`spring/gateway/`.

#### 2. PRERREQUISITOS

- API Gateway con Spring Cloud Gateway (Módulo 7) y BFF (Módulo 7).
- Rate limiting con Redis (Módulo 19) y scripts Lua atómicos en Redis (Módulos 4 y 19).

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** un API Gateway que autentica por API key y limita por cliente con un **cubo de fichas** compartido en
Redis, que responde **429 con Retry-After**, y **demostrar** que un limitador en memoria con varias réplicas deja pasar
el triple de lo contratado. Lo compruebas cuando `node --test f183-gateway-rate-limit/gateway.test.js` pasa 3 de 3 y
`limitador-redis.infra.js` 1 de 1 contra Redis.

#### 4. ANALOGÍA VISUAL

El **portero de una discoteca con fichas**. Dibuja la puerta: cada grupo de amigos (cliente) tiene un **cubo** con 100
fichas; entrar cuesta una ficha y un camarero rellena cada cubo a 50 fichas por segundo. Si un grupo llega en tropel,
entra mientras tenga fichas; cuando se le acaban, el portero le dice «vuelve en 1 segundo» (Retry-After). Si la
discoteca abre **tres puertas** y cada portero lleva su propia libreta, el mismo grupo entra el triple: por eso la
libreta buena es **una pizarra común** (Redis) que miran los tres porteros.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    C["Cliente<br/>X-Api-Key"] --> LB["Balanceador"]
    LB --> G1["Gateway réplica 1"]
    LB --> G2["Gateway réplica 2"]
    LB --> G3["Gateway réplica 3"]
    G1 & G2 & G3 -->|"EVALSHA cuboDeFichas<br/>(TIME + HMGET + HSET atómico)"| R[("Redis<br/>cubo:web · cubo:movil")]
    G1 & G2 & G3 -->|"permitido"| S["Servicio de reservas"]
    G1 -.->|"agotado: 429 + Retry-After"| C
```

**Texto alternativo:** diagrama de flujo. El cliente, con su cabecera X-Api-Key, llega a un balanceador que reparte
entre tres réplicas del gateway. Las tres consultan el mismo cubo de fichas en Redis mediante un script Lua atómico que
lee la hora del servidor de Redis, lee y actualiza el cubo del cliente. Si la petición está permitida, la reenvían al
servicio de reservas; si el cubo está agotado, responden al cliente 429 con Retry-After, indicado con una flecha
punteada.

#### 6. EXPLICACIÓN NIVEL 0

- El **gateway** es la puerta única del sistema: comprueba quién eres y te manda al servicio correcto.
- El **rate limiting** pone un tope de peticiones por cliente, para que uno solo no tumbe el sistema para todos.
- Si te pasas, recibes **429** («demasiadas peticiones») y una pista de cuándo volver a intentarlo.
- Si hay varias copias del gateway, todas deben llevar **la misma cuenta**; si no, el tope se multiplica.

#### 7. EXPLICACIÓN INTERMEDIA

- **Cubo de fichas:** `capacidad` (ráfaga) y `tasa` (fichas por segundo). En cada petición: `fichas = min(capacidad,
  fichas + segundos × tasa)`; si hay al menos 1, se gasta y pasa. Es lo que hace `RedisRateLimiter` de Spring Cloud
  Gateway con `replenishRate` (tasa), `burstCapacity` (capacidad) y `requestedTokens` (coste de cada petición).
- **Atomicidad:** leer y escribir el cubo en dos comandos tiene una carrera entre réplicas; el script Lua se ejecuta
  entero en Redis sin interrupciones. Usa `TIME` de Redis, no el reloj de cada réplica, para que la deriva de relojes no
  regale fichas. La clave caduca sola (`PEXPIRE`) cuando el cubo se llenaría de nuevo.
- **Respuesta:** 429 con `Retry-After` en segundos (cabecera de RFC 9110) y `X-RateLimit-Remaining`.
- **Fail-open:** si Redis no responde, este gateway **deja pasar** y lo registra; la alternativa (*fail-closed*,
  rechazar todo) convierte una caída de Redis en una caída total. Decide según el riesgo: para proteger a un tercero
  con límite contractual, quizá prefieras fail-closed.
- **Clave del límite:** la API key (cliente). Por IP castiga a los que comparten NAT; por usuario necesita el token ya
  validado.

#### 8. EXPLICACIÓN MAESTRA

| Algoritmo | A favor | En contra | Cuándo |
|---|---|---|---|
| **Cubo de fichas** (este) | permite ráfagas controladas; dos parámetros intuitivos | estado por cliente | APIs públicas; lo usa Spring Cloud Gateway |
| **Ventana fija** (el proveedor simulado) | trivial: un contador por segundo | permite el doble en el borde entre dos ventanas | límites contractuales simples |
| **Ventana deslizante** (log o contador ponderado) | sin el efecto borde | más memoria o aproximación | cuotas estrictas |
| **Cubo con fuga** (leaky bucket, cola a ritmo fijo) | salida perfectamente uniforme | añade espera en lugar de rechazar | proteger a un tercero: es la cola de cobros de F185 |

| Dónde limitar | A favor | En contra |
|---|---|---|
| **Gateway** (este) | un solo sitio; protege todo lo de detrás | no sabe del coste real de cada operación |
| **Malla de servicios** (Envoy/Istio, Módulo 27) | sin código | configuración compleja; límite global necesita un servicio de cuotas |
| **Servicio** | conoce el coste de cada operación | se repite en cada servicio |

- **Rate limiting no es control de capacidad:** protege de abusos y reparte de forma justa; la capacidad del sistema la
  protegen timeouts, bulkheads y la cola de F185.
- **Cuándo NO** montar Redis para esto: una sola réplica del gateway (el limitador en memoria basta) o un tráfico tan
  bajo que el límite no se alcanza nunca.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **ioredis 6.0.0**, **Redis 8.10.2** (imagen del `docker-compose.yml`). Pista
Spring: **Spring Cloud Gateway 5.0.4** (tren 2025.1.4) con `spring-boot-starter-data-redis-reactive`.

`f183-gateway-rate-limit/limitador.js`:

```javascript
// Módulo 32 · F183 · Rate limiting con «cubo de fichas» (token bucket): cada cliente tiene un cubo de `capacidad` fichas
// que se rellena a `tasa` fichas por segundo; cada petición gasta una. Permite ráfagas cortas y limita la media.
// Dos implementaciones con la misma interfaz:
//   LimitadorMemoria: un Map en el proceso. Solo vale con UNA réplica del gateway (ver error-comun.js).
//   LimitadorRedis:   el cubo vive en Redis y se actualiza con un script Lua atómico: todas las réplicas comparten límite.
// Versiones: Node.js 26.13.1 LTS, ioredis 6.0.0, Redis Open Source 8.10.2 (el script usa TIME: reloj del servidor Redis).

export class LimitadorMemoria {
  #cubos = new Map();
  constructor({ tasa, capacidad, reloj = Date.now }) { Object.assign(this, { tasa, capacidad, reloj }); }
  async permitir(clave) {
    const ahora = this.reloj();
    const c = this.#cubos.get(clave) ?? { fichas: this.capacidad, ultimo: ahora };
    c.fichas = Math.min(this.capacidad, c.fichas + ((ahora - c.ultimo) / 1000) * this.tasa);
    c.ultimo = ahora;
    const permitido = c.fichas >= 1;
    if (permitido) c.fichas -= 1;
    this.#cubos.set(clave, c);
    return { permitido, restantes: Math.floor(c.fichas), reintentarEnMs: permitido ? 0 : Math.ceil(((1 - c.fichas) / this.tasa) * 1000) };
  }
}

// KEYS[1] = cubo del cliente · ARGV = tasa, capacidad. Devuelve {permitido, fichas restantes (texto: Lua->Redis trunca decimales)}.
export const LUA_CUBO = `
local t = redis.call('TIME')
local ahora = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
local tasa, capacidad = tonumber(ARGV[1]), tonumber(ARGV[2])
local d = redis.call('HMGET', KEYS[1], 'fichas', 'ultimo')
local fichas = tonumber(d[1]) or capacidad
local ultimo = tonumber(d[2]) or ahora
fichas = math.min(capacidad, fichas + (ahora - ultimo) / 1000 * tasa)
local permitido = 0
if fichas >= 1 then fichas = fichas - 1; permitido = 1 end
redis.call('HSET', KEYS[1], 'fichas', tostring(fichas), 'ultimo', tostring(ahora))
redis.call('PEXPIRE', KEYS[1], math.ceil(capacidad / tasa * 1000) + 1000)
return {permitido, tostring(fichas)}`;

export class LimitadorRedis {
  constructor({ redis, tasa, capacidad, prefijo = 'cubo:' }) {
    Object.assign(this, { redis, tasa, capacidad, prefijo });
    redis.defineCommand('cuboDeFichas', { numberOfKeys: 1, lua: LUA_CUBO });
  }
  async permitir(clave) {
    const [permitido, fichas] = await this.redis.cuboDeFichas(this.prefijo + clave, this.tasa, this.capacidad);
    const f = Number(fichas);
    return { permitido: permitido === 1, restantes: Math.floor(f), reintentarEnMs: permitido === 1 ? 0 : Math.ceil(((1 - f) / this.tasa) * 1000) };
  }
}
```

`f183-gateway-rate-limit/gateway.js`:

```javascript
// Módulo 32 · F183 · API Gateway del proyecto: autentica la API key, aplica rate limiting por cliente y reenvía al
// servicio de reservas. Respuesta al superar el límite: 429 + Retry-After (segundos, RFC 9110) + X-RateLimit-Remaining.
// Ejecuta: RESERVAS_URL=http://localhost:8081 [REDIS_URL=redis://localhost:6379] node f183-gateway-rate-limit/gateway.js
import { pathToFileURL } from 'node:url';
import { http, json } from '../comun/http.js';
import { LimitadorMemoria, LimitadorRedis } from './limitador.js';

export const CLIENTES = { 'clave-web': 'web', 'clave-movil': 'movil', 'clave-socio': 'socio' };

export function crearGateway({ reservasUrl, limitador, clientes = CLIENTES }) {
  const destino = new URL(reservasUrl);
  return http.createServer(async (req, res) => {
    if (req.url === '/salud') return json(res, 200, { estado: 'UP' });
    const cliente = clientes[req.headers['x-api-key']];
    if (!cliente) return json(res, 401, { error: 'falta X-Api-Key o no es válida' });
    let decision;
    try { decision = await limitador.permitir(cliente); }
    catch { decision = { permitido: true, restantes: -1 }; } // Redis caído: se deja pasar (fail-open) y se alerta
    if (!decision.permitido) {
      return json(res, 429, { error: `límite de peticiones superado para «${cliente}»` },
        { 'retry-after': String(Math.max(1, Math.ceil(decision.reintentarEnMs / 1000))), 'x-ratelimit-remaining': '0' });
    }
    if (!req.url.startsWith('/reservas')) return json(res, 404, { error: 'ruta no publicada en el gateway' });
    const salida = http.request({ host: destino.hostname, port: destino.port, method: req.method, path: req.url,
      headers: { ...req.headers, 'x-cliente': cliente }, timeout: 3_000 }, (r) => {
      res.writeHead(r.statusCode, { ...r.headers, 'x-ratelimit-remaining': String(decision.restantes) }); r.pipe(res);
    });
    salida.on('timeout', () => salida.destroy(new Error('timeout de 3 s')));
    salida.on('error', (e) => { if (!res.headersSent) json(res, 502, { error: `reservas: ${e.message}` }); });
    req.pipe(salida);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opciones = { tasa: Number(process.env.TASA ?? 20), capacidad: Number(process.env.CAPACIDAD ?? 40) };
  let limitador = new LimitadorMemoria(opciones);
  if (process.env.REDIS_URL) { const { Redis } = await import('ioredis'); limitador = new LimitadorRedis({ redis: new Redis(process.env.REDIS_URL), ...opciones }); }
  const g = crearGateway({ reservasUrl: process.env.RESERVAS_URL ?? 'http://localhost:8081', limitador });
  g.listen(Number(process.env.PORT ?? 8080), () => console.log(`gateway en :${g.address().port} · ${limitador.constructor.name} ${opciones.tasa}/s, ráfaga ${opciones.capacidad}`));
}
```

**Pista Spring Boot** (pendiente en el Mac): `spring/gateway/src/main/resources/application.yml`, con las propiedades
de la documentación del filtro `RequestRateLimiter` (docs.spring.io, Spring Cloud Gateway Server WebFlux):

```yaml
server:
  port: 8080
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: 6379
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: reservas
              uri: ${RESERVAS_URL:http://localhost:8081}
              predicates:
                - Path=/reservas/**, /reservas
              filters:
                - name: RequestRateLimiter
                  args:
                    redis-rate-limiter.replenishRate: 50    # fichas por segundo (media permitida por cliente)
                    redis-rate-limiter.burstCapacity: 100   # tamaño del cubo (ráfaga máxima)
                    redis-rate-limiter.requestedTokens: 1   # fichas que gasta cada petición
                    key-resolver: "#{@apiKeyResolver}"
```

Y el `KeyResolver` por API key (`spring/gateway/src/main/java/academia/gateway/GatewayApp.java`):

```java
package academia.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import reactor.core.publisher.Mono;

/** Módulo 32 · F183 · Gateway: el límite se cuenta por API key (cabecera X-Api-Key), en Redis, para todas las réplicas. */
@SpringBootApplication
public class GatewayApp {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApp.class, args);
    }

    /** Clave del cubo de fichas: la API key. Sin cabecera -> clave vacía -> el filtro rechaza (deny-empty-key). */
    @Bean
    KeyResolver apiKeyResolver() {
        return exchange -> Mono.justOrEmpty(exchange.getRequest().getHeaders().getFirst("X-Api-Key"));
    }
}
```

La mecánica del cubo en JDK puro (`spring/jdk/CuboDeFichas.java`), ejecutable sin Gradle:

```java
// Módulo 32 · F183 · Cubo de fichas (token bucket) en Java puro (JDK 25), con reloj simulado: la misma cuenta que hace
// el RedisRateLimiter de Spring Cloud Gateway con replenishRate y burstCapacity. Ejecuta: java spring/jdk/CuboDeFichas.java
public class CuboDeFichas {
    private final double tasa;
    private final double capacidad;
    private double fichas;
    private long ultimoMs;

    CuboDeFichas(double tasa, double capacidad) {
        this.tasa = tasa;
        this.capacidad = capacidad;
        this.fichas = capacidad;
    }

    boolean permitir(long ahoraMs) {
        fichas = Math.min(capacidad, fichas + (ahoraMs - ultimoMs) / 1000.0 * tasa);
        ultimoMs = ahoraMs;
        if (fichas >= 1) { fichas -= 1; return true; }
        return false;
    }

    public static void main(String[] args) {
        CuboDeFichas cubo = new CuboDeFichas(2, 10); // replenishRate 2, burstCapacity 10
        int aceptadas = 0;
        for (int i = 0; i < 11; i++) if (cubo.permitir(0)) aceptadas++;
        System.out.println("ráfaga en t=0 s: " + aceptadas + " de 11 aceptadas");
        System.out.println("t=1 s: " + cubo.permitir(1000) + ", " + cubo.permitir(1000) + ", " + cubo.permitir(1000));
    }
}
```

#### 10. MINI-LABORATORIO

1. Arranca Redis y comprueba que tres réplicas comparten el límite (con Docker: `docker compose up -d --wait` y
   `REDIS_URL=redis://localhost:6379`; aquí se usó un `redis-server` local en el puerto 16379):

```bash
docker compose up -d --wait
REDIS_URL=redis://localhost:6379 node f183-gateway-rate-limit/error-comun.js
```

   **Output esperado:**

```text
3 réplicas con LimitadorMemoria: 30 de 100 aceptadas (contrato: 10)
3 réplicas con LimitadorRedis:   10 de 100 aceptadas (contrato: 10)
```

   **Captura comentada:** con la ráfaga de 100 peticiones repartidas en round-robin, cada réplica en memoria acepta su
   propio cubo de 10 (30 en total); con el cubo en Redis, las tres aceptan 10 entre todas, que es lo contratado.

2. El cubo en Java puro:

```bash
java spring/jdk/CuboDeFichas.java
```

   **Output esperado:**

```text
ráfaga en t=0 s: 10 de 11 aceptadas
t=1 s: true, true, false
```

3. Mira el cubo en Redis mientras pruebas: `redis-cli HGETALL cubo:web` muestra `fichas` y `ultimo` (milisegundos del
   reloj de Redis), y `redis-cli PTTL cubo:web` cuánto le queda para caducar.

#### 11. VERIFICACIÓN

Tests del gateway (`f183-gateway-rate-limit/gateway.test.js`):

```javascript
// Módulo 32 · F183 · tests del gateway y del cubo de fichas: node --test f183-gateway-rate-limit/gateway.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LimitadorMemoria } from './limitador.js';
import { crearGateway } from './gateway.js';
import { cerrar, escuchar } from '../comun/http.js';
import { montarSistema } from '../f181-sistema-reservas/montaje.js';

test('cubo de fichas: ráfaga de 10, luego 2 por segundo (reloj simulado)', async () => {
  let ahora = 0;
  const l = new LimitadorMemoria({ tasa: 2, capacidad: 10, reloj: () => ahora });
  const r = []; for (let i = 0; i < 11; i++) r.push((await l.permitir('web')).permitido);
  assert.deepEqual([r.filter(Boolean).length, r[10]], [10, false]);
  assert.equal((await l.permitir('web')).reintentarEnMs, 500);
  ahora = 1000; // 1 s después: 2 fichas nuevas
  assert.deepEqual([(await l.permitir('web')).permitido, (await l.permitir('web')).permitido, (await l.permitir('web')).permitido], [true, true, false]);
  assert.equal((await l.permitir('movil')).permitido, true, 'cada cliente tiene su propio cubo');
});

test('gateway: 401 sin API key, 429 con Retry-After al agotar el cubo y reenvío a reservas', async () => {
  const s = await montarSistema();
  const g = crearGateway({ reservasUrl: s.reservasUrl, limitador: new LimitadorMemoria({ tasa: 1, capacidad: 3 }) });
  const url = await escuchar(g);
  try {
    assert.equal((await fetch(`${url}/reservas/R-1`)).status, 401);
    const estados = [];
    let ultima;
    for (let i = 0; i < 5; i++) { ultima = await fetch(`${url}/reservas/R-1`, { headers: { 'x-api-key': 'clave-web' } }); estados.push(ultima.status); }
    assert.deepEqual(estados, [404, 404, 404, 429, 429]); // 404 = llegó a reservas (R-1 no existe); 429 = lo paró el gateway
    assert.equal(ultima.headers.get('retry-after'), '1');
    assert.equal(ultima.headers.get('x-ratelimit-remaining'), '0');
  } finally { await cerrar(g); await s.cerrar(); }
});

test('gateway: si el limitador falla (Redis caído) deja pasar en lugar de tumbar el servicio', async () => {
  const s = await montarSistema();
  const g = crearGateway({ reservasUrl: s.reservasUrl, limitador: { permitir: async () => { throw new Error('ECONNREFUSED'); } } });
  const url = await escuchar(g);
  try { assert.equal((await fetch(`${url}/reservas/R-1`, { headers: { 'x-api-key': 'clave-web' } })).status, 404); }
  finally { await cerrar(g); await s.cerrar(); }
});
```

```bash
node --test f183-gateway-rate-limit/gateway.test.js
```

```text
✔ cubo de fichas: ráfaga de 10, luego 2 por segundo (reloj simulado)
✔ gateway: 401 sin API key, 429 con Retry-After al agotar el cubo y reenvío a reservas
✔ gateway: si el limitador falla (Redis caído) deja pasar en lugar de tumbar el servicio
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

Con Redis real (`f183-gateway-rate-limit/limitador-redis.infra.js`):

```javascript
// Módulo 32 · F183 · test con Redis de verdad: tres «réplicas» comparten el cubo. Necesita REDIS_URL.
// REDIS_URL=redis://localhost:6379 node --test f183-gateway-rate-limit/limitador-redis.infra.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Redis } from 'ioredis';
import { LimitadorRedis } from './limitador.js';

test('LimitadorRedis: 3 réplicas aceptan en total la capacidad del cubo (10 de 30)', { skip: !process.env.REDIS_URL && 'sin REDIS_URL' }, async () => {
  const clientes = [1, 2, 3].map(() => new Redis(process.env.REDIS_URL));
  try {
    await clientes[0].del('test-infra:web');
    const replicas = clientes.map((redis) => new LimitadorRedis({ redis, tasa: 0.1, capacidad: 10, prefijo: 'test-infra:' }));
    const decisiones = await Promise.all(Array.from({ length: 30 }, (_, i) => replicas[i % 3].permitir('web')));
    assert.equal(decisiones.filter((d) => d.permitido).length, 10);
    assert.ok(await clientes[0].pttl('test-infra:web') > 0, 'la clave caduca sola');
  } finally { await Promise.all(clientes.map((c) => c.quit())); }
});
```

```bash
REDIS_URL=redis://localhost:6379 node --test f183-gateway-rate-limit/limitador-redis.infra.js
```

```text
✔ LimitadorRedis: 3 réplicas aceptan en total la capacidad del cubo (10 de 30)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

**Pregunta de comprobación:** con `replenishRate: 50` y `burstCapacity: 100`, ¿cuántas peticiones puede hacer un
cliente en el primer segundo tras estar un rato callado? (Hasta 150: las 100 del cubo lleno más las 50 que se reponen
durante ese segundo.)

#### 12. ERROR COMÚN

**Síntoma:** el contrato con un socio dice «10 peticiones de ráfaga», pero en producción le pasan 30 y el proveedor de
detrás se satura. En local, con una réplica, todo cuadraba. **Causa:** limitador en memoria con **tres réplicas** del
gateway. `f183-gateway-rate-limit/error-comun.js`:

```javascript
// Módulo 32 · F183 · ERROR COMÚN: limitador en memoria con 3 réplicas del gateway detrás de un balanceador.
// Cada réplica tiene su propio cubo: el cliente consigue 3 veces el límite contratado.
// Ejecuta: node f183-gateway-rate-limit/error-comun.js            (solo memoria)
//          REDIS_URL=redis://localhost:6379 node f183-gateway-rate-limit/error-comun.js   (compara con Redis)
import { LimitadorMemoria, LimitadorRedis } from './limitador.js';

async function rafaga(replicas, peticiones = 100) { // reparto round-robin, como un balanceador
  let aceptadas = 0;
  for (let i = 0; i < peticiones; i++) if ((await replicas[i % replicas.length].permitir('web')).permitido) aceptadas++;
  return aceptadas;
}
const opciones = { tasa: 1, capacidad: 10 }; // contrato: ráfaga de 10 peticiones
const memoria = [1, 2, 3].map(() => new LimitadorMemoria(opciones));
console.log(`3 réplicas con LimitadorMemoria: ${await rafaga(memoria)} de 100 aceptadas (contrato: 10)`);
if (process.env.REDIS_URL) {
  const { Redis } = await import('ioredis');
  const clientes = [1, 2, 3].map(() => new Redis(process.env.REDIS_URL));
  await clientes[0].del('error-comun:web');
  const compartido = clientes.map((redis) => new LimitadorRedis({ redis, ...opciones, prefijo: 'error-comun:' }));
  console.log(`3 réplicas con LimitadorRedis:   ${await rafaga(compartido)} de 100 aceptadas (contrato: 10)`);
  await Promise.all(clientes.map((c) => c.quit()));
} else {
  console.log('(sin REDIS_URL: se omite la comparación con LimitadorRedis)');
}
```

Salida real de `node f183-gateway-rate-limit/error-comun.js` (sin Redis):

```text
3 réplicas con LimitadorMemoria: 30 de 100 aceptadas (contrato: 10)
(sin REDIS_URL: se omite la comparación con LimitadorRedis)
```

**Diagnóstico visual:** en el panel de métricas del gateway, las peticiones aceptadas por cliente **escalan con el
número de réplicas** (sube el HPA, sube el límite efectivo). **Arreglo:** el cubo en Redis (`LimitadorRedis`, o
`RedisRateLimiter` en Spring Cloud Gateway); en Temporal, el equivalente es `maxTaskQueueActivitiesPerSecond`, que
aplica el servidor a toda la cola, frente a `maxActivitiesPerSecond`, que es por worker.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo implementarías rate limiting por cliente en un gateway con varias réplicas detrás de un balanceador?**

**Respuesta modelo:** con un cubo de fichas por cliente (capacidad de ráfaga y tasa de reposición) guardado en un
almacén compartido, normalmente Redis, y actualizado con un script Lua atómico que usa la hora del propio Redis para
evitar carreras y deriva de relojes; la clave caduca sola. La clave del cubo es la identidad del cliente (API key o el
`sub` del token ya validado), no la IP. Al superar el límite respondo 429 con `Retry-After` y cabeceras de cuota. Decido
explícitamente qué pasa si Redis cae: fail-open con alerta para no convertir una caída de Redis en una total, o
fail-closed si el límite protege a un tercero con contrato. En Spring Cloud Gateway es el filtro `RequestRateLimiter`
con `RedisRateLimiter` y un `KeyResolver`. Y no confundo rate limiting con capacidad: para proteger un recurso lento
uso colas y bulkheads.

#### 14. ANTI-PATRÓN RELACIONADO

**Rate limiting como «arreglo» de un problema de capacidad:** el proveedor de pagos acepta 20 peticiones/s y se pone
el gateway a 20 reservas/s. Funciona, pero en cada pico se rechaza a clientes que querían pagar (es la opción B del
ADR-0002, descartada en F186).

```yaml
# MAL: el límite del tercero se traslada a los clientes y se pierden ventas en cada pico.
redis-rate-limiter.replenishRate: 20
# BIEN: el gateway limita abusos por cliente (50/s); el ritmo hacia el tercero lo pone la cola de cobros (F185).
redis-rate-limiter.replenishRate: 50
```

En un diagrama se ve como un embudo en la **entrada** del sistema cuando el estrechamiento está en la **salida**.

---

### Test de carga con Gatling

#### 1. UBICACIÓN

Módulo 32, Lección 4 de 7 · Fase 3 · 2 h
`spring/carga/`.

#### 2. PRERREQUISITOS

- Percentiles y SLO (Módulos 10 y 21); presupuesto de latencia (Módulo 8).
- Java 17 o superior instalado (Gatling corre en la JVM, también la versión JavaScript).

#### 3. OBJETIVO DE APRENDIZAJE

**Escribir** una simulación de Gatling de **modelo abierto** con aserciones de SLO (p99 < 300 ms y < 1 % de errores),
**ejecutarla** a 60 reservas/s contra el sistema y **explicar** sus resultados, incluido por qué un test en verde
puede esconder ventas perdidas. Lo compruebas cuando `node --test f184-carga-gatling/carga.test.js` pasa 1 de 1.

#### 4. ANALOGÍA VISUAL

El **simulacro de la puerta de un estadio**. Dibuja una máquina que suelta aficionados a la entrada a un ritmo fijo,
60 por segundo, **lleguen o no los de delante** (modelo abierto: así llega la gente de verdad). Junto a cada torno, un
cronómetro anota cuánto tarda cada uno en pasar, y un marcador grande enseña el p99 y los que se quedaron fuera. Arriba,
dos bombillas: «p99 < 300 ms» y «fallos < 1 %». Si alguna se pone roja, el simulacro **no se aprueba**.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    I["Inyección abierta<br/>rampa 1→60 usuarios/s (5 s)<br/>60 usuarios/s (20 s)"] --> U["Usuario virtual<br/>feed: X-Api-Key en rueda"]
    U --> P["POST /reservas<br/>check 202 · guarda reservaId"]
    P --> G["GET /reservas/#{reservaId}<br/>check 200"]
    G --> M["Métricas: p50 · p95 · p99<br/>OK / KO por petición"]
    M --> A{"Aserciones<br/>p99 < 300 ms<br/>fallos < 1 %"}
    A -->|"cumple"| V["código 0"]
    A -->|"no cumple"| X["código 2: CI en rojo"]
```

**Texto alternativo:** diagrama de flujo. La inyección abierta sube de 1 a 60 usuarios por segundo en 5 segundos y
mantiene 60 por segundo durante 20 segundos. Cada usuario virtual toma una API key de una lista en rueda, hace POST
/reservas comprobando el estado 202 y guardando el identificador, y luego GET de esa reserva comprobando 200. Gatling
calcula percentiles y peticiones correctas e incorrectas y evalúa las aserciones: p99 por debajo de 300 milisegundos y
fallos por debajo del 1 por ciento. Si se cumplen, sale con código 0; si no, con código 2 y la integración continua se
pone en rojo.

#### 6. EXPLICACIÓN NIVEL 0

- Un **test de carga** simula a muchísima gente usando el sistema a la vez, para saber si aguanta **antes** de que
  llegue la gente de verdad.
- **Gatling** es la herramienta que fabrica esa gente falsa, cronometra cada respuesta y hace un informe.
- No basta con «la media»: interesa cuánto tarda el 1 % más lento (**p99**), porque son clientes reales esperando.
- Y el test debe decir **sí o no** solo: si no cumple el objetivo, falla, igual que un test normal.

#### 7. EXPLICACIÓN INTERMEDIA

- **Modelo abierto** (`injectOpen`, `constantUsersPerSec`): llegan N usuarios nuevos por segundo pase lo que pase. Es
  como llega el tráfico de internet. El **modelo cerrado** (`injectClosed`, `constantConcurrentUsers`) mantiene N
  usuarios en bucle: si el sistema se frena, llegan menos peticiones y el test **esconde** la lentitud.
- **Feeder** (`arrayFeeder(...).circular()`): reparte las API keys en rueda; `#{apiKey}` las inserta en la petición.
- **Checks:** `status().is(202)` marca KO cualquier otra respuesta; `jsonPath('$.reservaId').saveAs('reservaId')`
  encadena la consulta.
- **Aserciones:** `global().responseTime().percentile(99).lt(300)` y `global().failedRequests().percent().lt(1.0)`.
  Si fallan, Gatling termina con código 2, y CI lo trata como un test roto.
- **Parámetros:** `getParameter('tasa', '60')` permite `npx gatling run … tasa=60 segundos=20` sin tocar el código.
- **Gatling JS:** el paquete `@gatling.io/cli` empaqueta la simulación con esbuild y la ejecuta en la JVM; la primera
  vez descarga su bundle a `~/.gatling`. La pista Spring usa el DSL de Java con el plugin de Gradle `io.gatling.gradle` (simulaciones en `src/gatling/java`).

#### 8. EXPLICACIÓN MAESTRA

| Herramienta | A favor | En contra | Cuándo |
|---|---|---|---|
| **Gatling** (Java, Scala, JS/TS) | modelo abierto de primera clase; aserciones; informe HTML; corre en CI | JVM; curva del DSL | este curso: simulaciones versionadas junto al código |
| **k6** (JavaScript, Go) | binario único; muy ligero | otro DSL; extensiones para protocolos | equipos JS sin JVM |
| **JMeter** | interfaz gráfica; muchos plugins | XML difícil de revisar en un PR; modelo cerrado por defecto | equipos de QA con planes existentes |
| **wrk / autocannon** | una línea en la terminal | sin escenarios ni aserciones | una prueba rápida de un endpoint |

- **Qué mide este test:** la **API** (POST 202 + GET). El cobro va en segundo plano, así que sus fallos **no aparecen**
  en Gatling: hay que mirar también las métricas de negocio (reservas confirmadas y canceladas) del sistema. Es la
  lección de F185.
- **Generador como cuello de botella:** si la máquina de Gatling se queda sin CPU, mides el generador. Vigila su CPU y
  reparte la carga en varias máquinas para cifras altas.
- **Datos realistas:** reservas a un solo concierto y una sola tarjeta crean puntos calientes artificiales (o los
  esconden). Usa feeders con datos de producción anonimizados.
- **Cuándo NO** basta un test de carga: para picos de verdad (rebajas, venta de entradas) haz también un test de
  **resistencia** (horas) y de **estrés** (subir hasta romper) para conocer el límite y cómo falla.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Gatling JS 3.16.101** (`@gatling.io/cli`, `@gatling.io/core`, `@gatling.io/http`, npm 2026-11-17; motor
Gatling 3.16.1) con **Java 17 o superior** (aquí se ejecutó con OpenJDK 21.0.13; el curso fija JDK 25). Pista Spring:
**Gatling 3.16.1** (`io.gatling.highcharts:gatling-charts-highcharts`) y el plugin **`io.gatling.gradle` 3.16.0** (Maven
Central y plugins.gradle.org, consultados el 2026-11-20).

`f184-carga-gatling/src/reservas.gatling.js`:

```javascript
// Módulo 32 · F184 · Test de carga del sistema de reservas con Gatling JS 3.16.101 (motor Gatling 3.16.1).
// Modelo ABIERTO: llegan `tasa` reservas por segundo, pase lo que pase con las anteriores (como en la vida real).
// Ejecuta (con el sistema en marcha: node f184-carga-gatling/arrancar-sistema.js):
//   npx gatling run --sources-folder f184-carga-gatling/src --results-folder logs/gatling --simulation reservas tasa=60 segundos=20
import { arrayFeeder, constantUsersPerSec, getParameter, global, jsonPath, rampUsersPerSec, scenario, simulation, StringBody } from '@gatling.io/core';
import { http, status } from '@gatling.io/http';

export default simulation((setUp) => {
  const url = getParameter('url', 'http://localhost:8080');          // el gateway (F183)
  const tasa = parseInt(getParameter('tasa', '60'));                  // reservas por segundo en el pico
  const segundos = parseInt(getParameter('segundos', '20'));
  // Clientes del gateway, en rueda: la carga se reparte como en producción. claves=1 reproduce el error común (F184).
  const claves = parseInt(getParameter('claves', '3'));
  const clientes = arrayFeeder([{ apiKey: 'clave-web' }, { apiKey: 'clave-movil' }, { apiKey: 'clave-socio' }].slice(0, claves)).circular();

  const protocolo = http.baseUrl(url).acceptHeader('application/json').contentTypeHeader('application/json');

  const reservar = scenario('Reservar una entrada')
    .feed(clientes)
    .exec(
      http('POST /reservas').post('/reservas').header('X-Api-Key', '#{apiKey}')
        .body(StringBody('{"eventoId":"concierto-1","clienteId":"#{apiKey}","importe":80,"tarjeta":"4242-OK"}'))
        .check(status().is(202), jsonPath('$.reservaId').saveAs('reservaId')),
      http('GET /reservas/{id}').get('/reservas/#{reservaId}').header('X-Api-Key', '#{apiKey}').check(status().is(200)),
    );

  setUp(reservar.injectOpen(rampUsersPerSec(1).to(tasa).during(5), constantUsersPerSec(tasa).during(segundos)))
    .protocols(protocolo)
    // El objetivo del proyecto (SLO de la API): p99 < 300 ms y menos del 1 % de errores. Si no se cumple, Gatling sale con error.
    .assertions(global().responseTime().percentile(99).lt(300), global().failedRequests().percent().lt(1.0));
});
```

El sistema para la carga (`f184-carga-gatling/arrancar-sistema.js`):

```javascript
// Módulo 32 · F184 · Arranca el sistema completo para el test de carga, en puertos fijos:
//   proveedor de pagos y reservas en puertos libres · gateway :8080 (50 peticiones/s por cliente, ráfaga de 100)
// LIMITE_RPS=20 activa la restricción sobrevenida del proveedor (F185). Al recibir SIGINT/SIGTERM imprime el resumen.
// Ejecuta: [LIMITE_RPS=20] [COBROS_POR_SEGUNDO=18] node f184-carga-gatling/arrancar-sistema.js
import { montarSistema } from '../f181-sistema-reservas/montaje.js';
import { crearGateway } from '../f183-gateway-rate-limit/gateway.js';
import { LimitadorMemoria } from '../f183-gateway-rate-limit/limitador.js';
import { limitarCobros } from '../f185-restriccion-sobrevenida/cola-cobros.js';

const limiteRps = process.env.LIMITE_RPS ? Number(process.env.LIMITE_RPS) : Infinity;
const cobrosPorSegundo = process.env.COBROS_POR_SEGUNDO ? Number(process.env.COBROS_POR_SEGUNDO) : 0;
const s = await montarSistema({ aforo: 1_000_000, proveedor: { limiteRps },
  envolverActividades: cobrosPorSegundo ? (a) => limitarCobros(a, cobrosPorSegundo) : (a) => a,
  politica: { intentos: 3, inicialMs: 100 } });
const gateway = crearGateway({ reservasUrl: s.reservasUrl, limitador: new LimitadorMemoria({ tasa: Number(process.env.TASA_GATEWAY ?? 50), capacidad: 100 }) });
gateway.listen(Number(process.env.PORT ?? 8080), '127.0.0.1', () =>
  console.log(`sistema listo: gateway :${gateway.address().port} · proveedor ${limiteRps === Infinity ? 'sin límite' : `limitado a ${limiteRps}/s`}${cobrosPorSegundo ? ` · cobros a ${cobrosPorSegundo}/s` : ''}`));

function resumen() {
  const t = s.repo.todas();
  const n = (e) => t.filter((r) => r.estado === e).length;
  console.log(`resumen: ${t.length} reservas · ${n('CONFIRMADA')} CONFIRMADA · ${n('CANCELADA')} CANCELADA · ${n('PENDIENTE')} PENDIENTE · 429 del proveedor: ${s.stats.rechazados429}`);
  process.exit(0);
}
process.on('SIGINT', resumen);
process.on('SIGTERM', resumen);
```

**Pista Spring Boot** (pendiente en el Mac): `spring/carga/build.gradle.kts`:

```kotlin
// Test de carga del proyecto con Gatling 3.16.1 (Java DSL) y el plugin de Gatling para Gradle 3.16.0
// (plugins.gradle.org/plugin/io.gatling.gradle, consultado el 2026-11-20).
// Ejecuta con el sistema en marcha: ./gradlew :carga:gatlingRun
// El plugin busca las simulaciones en src/gatling/java (en Maven estaban en src/test/java).
plugins {
    java
    alias(libs.plugins.gatling)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

gatling {
    // El plugin trae Gatling 3.16.0 por defecto; se fija la misma 3.16.1 que usaba el build de Maven
    gatlingVersion = libs.versions.gatling.get()
}

// La simulación se elige en la TAREA, no en la extensión: GatlingRunTask expone
// getSimulationClassName/setSimulationClassName (javap sobre gatling-gradle-plugin-3.16.0.jar).
// Equivale a <simulationClass> del POM de Maven.
tasks.named<io.gatling.gradle.GatlingRunTask>("gatlingRun") {
    simulationClassName = "academia.carga.ReservasSimulation"
}
```

> **Build con Gradle (y su equivalencia en Maven).** Este laboratorio se construye con **Gradle 9.9.2** y Kotlin DSL
> mediante el wrapper `./gradlew` (no instalas Gradle). `settings.gradle.kts` lista los subproyectos (en Maven,
> `<modules>` del POM agregador), cada carpeta tiene su `build.gradle.kts` (su `pom.xml`) y
> `gradle/libs.versions.toml` es el **catálogo de versiones** (las `<properties>` y el `dependencyManagement`): por eso
> las dependencias se escriben `libs.…`. Equivalencias: `./mvnw test` → `./gradlew test` ·
> `./mvnw package -DskipTests` → `./gradlew bootJar` · `./mvnw spring-boot:run` → `./gradlew bootRun` ·
> `-Dtest=Clase` → `--tests Clase` · `target/` → `build/` (el jar queda en `build/libs/`). Gradle escribe una línea
> `PASSED` por test y termina con `BUILD SUCCESSFUL` (Maven: `Tests run: N` y `BUILD SUCCESS`).

`modulo-36/spring/settings.gradle.kts`:

```kotlin
// Módulo 32 (modulo-36) · Proyecto final, versión Spring Boot (Fase 1). Build multi-proyecto: "./gradlew test"
// ejecuta los tests. La simulación de Gatling (carga/) no tiene tests: se lanza aparte con
// "./gradlew :carga:gatlingRun" porque necesita el sistema en marcha.
// Cada carpeta tiene su propio build.gradle.kts; las versiones viven en gradle/libs.versions.toml
// (catálogo "libs"). Equivale al POM agregador con <modules> de Maven.
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}
// Sin esto, un alumno sin JDK 25 instalado ve el build morir en la configuración, antes de cualquier test.
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "modulo-36-proyecto-final"

include(
    "pagos-externo",
    "reservas",
    "gateway",
    "carga",
)
```

`modulo-36/spring/gradle/libs.versions.toml`:

```toml
# Módulo 32 (modulo-36)
# Catálogo de versiones del laboratorio: una sola fuente para plugins y librerías.
# Las librerías SIN versión las fija el BOM de Spring Boot (spring-boot-dependencies) o el BOM que importe el proyecto.

[versions]
# Gatling 3.16.1 (Maven Central, consultado el 2026-11-20) y su plugin de Gradle 3.16.0 (plugins.gradle.org)
gatling = "3.16.1"
plugin-gatling = "3.16.0"
spring-boot = "4.1.3"
spring-cloud = "2025.1.4"
# Última versión en Maven Central (maven-metadata.xml consultado el 2026-11-20: 1.41.1 del 2026-11-16)
temporal = "1.41.1"

[libraries]
spring-boot-starter-webmvc = { module = "org.springframework.boot:spring-boot-starter-webmvc" }
spring-boot-starter-restclient = { module = "org.springframework.boot:spring-boot-starter-restclient" }
temporal-sdk = { module = "io.temporal:temporal-sdk", version.ref = "temporal" }
temporal-testing = { module = "io.temporal:temporal-testing", version.ref = "temporal" }
spring-boot-starter-test = { module = "org.springframework.boot:spring-boot-starter-test" }
junit-platform-launcher = { module = "org.junit.platform:junit-platform-launcher" }
spring-cloud-starter-gateway-server-webflux = { module = "org.springframework.cloud:spring-cloud-starter-gateway-server-webflux" }
spring-boot-starter-data-redis-reactive = { module = "org.springframework.boot:spring-boot-starter-data-redis-reactive" }

[plugins]
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
spring-dependency-management = { id = "io.spring.dependency-management", version = "1.1.7" }
gatling = { id = "io.gatling.gradle", version.ref = "plugin-gatling" }
```

`spring/carga/src/test/java/academia/carga/ReservasSimulation.java`:

```java
package academia.carga;

import static io.gatling.javaapi.core.CoreDsl.StringBody;
import static io.gatling.javaapi.core.CoreDsl.constantUsersPerSec;
import static io.gatling.javaapi.core.CoreDsl.global;
import static io.gatling.javaapi.core.CoreDsl.jsonPath;
import static io.gatling.javaapi.core.CoreDsl.listFeeder;
import static io.gatling.javaapi.core.CoreDsl.rampUsersPerSec;
import static io.gatling.javaapi.core.CoreDsl.scenario;
import static io.gatling.javaapi.http.HttpDsl.http;
import static io.gatling.javaapi.http.HttpDsl.status;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.gatling.javaapi.http.HttpProtocolBuilder;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Módulo 32 · F184 · La misma simulación que f184-carga-gatling/src/reservas.gatling.js, con el DSL de Java:
 * modelo abierto (rampa de 1 a 60 reservas/s en 5 s y 60/s durante 20 s) y aserciones del SLO de la API.
 */
public class ReservasSimulation extends Simulation {

    private static final String URL = System.getProperty("url", "http://localhost:8080");
    private static final int TASA = Integer.getInteger("tasa", 60);
    private static final int SEGUNDOS = Integer.getInteger("segundos", 20);

    private final HttpProtocolBuilder protocolo = http.baseUrl(URL)
            .acceptHeader("application/json").contentTypeHeader("application/json");

    private final ScenarioBuilder reservar = scenario("Reservar una entrada")
            .feed(listFeeder(List.<Map<String, Object>>of(
                    Map.of("apiKey", "clave-web"), Map.of("apiKey", "clave-movil"), Map.of("apiKey", "clave-socio"))).circular())
            .exec(session -> session.set("clave", UUID.randomUUID().toString()))
            .exec(http("POST /reservas").post("/reservas")
                    .header("X-Api-Key", "#{apiKey}").header("Idempotency-Key", "#{clave}")
                    .body(StringBody("{\"eventoId\":\"concierto-1\",\"clienteId\":\"#{apiKey}\",\"importe\":80,\"tarjeta\":\"4242-OK\"}"))
                    .check(status().is(202), jsonPath("$.reservaId").saveAs("reservaId")))
            .exec(http("GET /reservas/{id}").get("/reservas/#{reservaId}").header("X-Api-Key", "#{apiKey}")
                    .check(status().is(200)));

    {
        setUp(reservar.injectOpen(rampUsersPerSec(1).to(TASA).during(5), constantUsersPerSec(TASA).during(SEGUNDOS)))
                .protocols(protocolo)
                .assertions(global().responseTime().percentile(99).lt(300), global().failedRequests().percent().lt(1.0));
    }
}
```

#### 10. MINI-LABORATORIO

1. Arranca el sistema y lanza la simulación a 60 reservas/s:

```bash
node f184-carga-gatling/arrancar-sistema.js &
npx gatling run --sources-folder f184-carga-gatling/src --results-folder logs/gatling --simulation reservas tasa=60 segundos=20
kill %1
```

   **Output esperado** (bloque final de Gatling y resumen del sistema al pararlo; los milisegundos variarán con tu
   máquina):

```text
---- Global Information -------------------------------------------------------------|---Total---|-----OK----|----KO----
> request count                                                                      |     2,704 |     2,704 |         -
> min response time (ms)                                                             |         0 |         0 |         -
> max response time (ms)                                                             |       103 |       103 |         -
> mean response time (ms)                                                            |         2 |         2 |         -
> response time std deviation (ms)                                                   |         2 |         2 |         -
> response time 50th percentile (ms)                                                 |         1 |         1 |         -
> response time 75th percentile (ms)                                                 |         2 |         2 |         -
> response time 95th percentile (ms)                                                 |         4 |         4 |         -
> response time 99th percentile (ms)                                                 |         7 |         7 |         -
> mean throughput (rps)                                                              |    108.16 |    108.16 |         -
---- Response Time Distribution ----------------------------------------------------------------------------------------
> OK: t < 800 ms                                                                                          2,704   (100%)
> OK: 800 ms <= t < 1200 ms                                                                                   0     (0%)
> OK: t >= 1200 ms                                                                                            0     (0%)
> KO                                                                                                          0     (0%)
========================================================================================================================
Global: 99th percentile of response time is less than 300.0 : true (actual : 7.0)
Global: percentage of failed events is less than 1.0 : true (actual : 0.0)
sistema listo: gateway :18080 · proveedor sin límite
resumen: 1352 reservas · 1352 CONFIRMADA · 0 CANCELADA · 0 PENDIENTE · 429 del proveedor: 0
```

   **Captura comentada:** 1352 usuarios (152 en la rampa y 1200 a 60/s) hacen 2704 peticiones, todas OK, con p99 de
   7 ms: el SLO de la API se cumple con mucho margen y Gatling sale con código 0. El informe HTML queda en
   `logs/gatling/<simulación>/index.html` (gráfico de respuestas por segundo y de percentiles en el tiempo).

2. Pista Spring (Mac), con el gateway de Spring en:8080: `cd spring &&./gradlew:carga:gatlingRun`. Espera
   el mismo bloque «Global Information» y las dos líneas `Global: …: true`.

#### 11. VERIFICACIÓN

Test que debes ejecutar (`f184-carga-gatling/carga.test.js`), que corre una versión corta de la simulación contra el
sistema montado en un puerto libre:

```javascript
// Módulo 32 · F184 · test: corre la simulación de Gatling (corta: 20 reservas/s durante 3 s) contra el sistema y exige
// que se cumplan sus aserciones (p99 < 300 ms y < 1 % de errores). Necesita Java 17+ (Gatling JS descarga su bundle la
// primera vez en ~/.gatling). node --test f184-carga-gatling/carga.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { montarSistema } from '../f181-sistema-reservas/montaje.js';
import { crearGateway } from '../f183-gateway-rate-limit/gateway.js';
import { LimitadorMemoria } from '../f183-gateway-rate-limit/limitador.js';
import { cerrar, escuchar } from '../comun/http.js';

let hayJava = true;
try { execFileSync('java', ['-version'], { stdio: 'ignore' }); } catch { hayJava = false; }

function gatling(args) {
  return new Promise((ok) => {
    const p = spawn(process.execPath, ['node_modules/@gatling.io/cli/target/index.js', 'run', '--sources-folder', 'f184-carga-gatling/src',
      '--results-folder', 'logs/gatling', '--non-interactive', '--simulation', 'reservas', ...args], { cwd: new URL('..', import.meta.url).pathname });
    let salida = '';
    p.stdout.on('data', (d) => { salida += d; }); p.stderr.on('data', (d) => { salida += d; });
    p.on('close', (codigo) => ok({ codigo, salida }));
  });
}

test('Gatling: 20 reservas/s durante 3 s cumplen el SLO de la API', { skip: !hayJava && 'falta Java (https://adoptium.net)', timeout: 300_000 }, async () => {
  const s = await montarSistema({ aforo: 10_000 });
  const g = crearGateway({ reservasUrl: s.reservasUrl, limitador: new LimitadorMemoria({ tasa: 50, capacidad: 100 }) });
  const url = await escuchar(g);
  try {
    const { codigo, salida } = await gatling([`url=${url}`, 'tasa=20', 'segundos=3']);
    assert.match(salida, /percentage of failed events is less than 1\.0 : true/);
    assert.equal(codigo, 0, salida.slice(-2000));
    assert.equal(s.repo.todas().filter((r) => r.estado === 'CONFIRMADA').length, s.repo.todas().length);
  } finally { await cerrar(g); await s.cerrar(); }
});
```

```bash
node --test f184-carga-gatling/carga.test.js
```

```text
✔ Gatling: 20 reservas/s durante 3 s cumplen el SLO de la API
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

**Pregunta de comprobación:** si cambias `injectOpen(constantUsersPerSec(60)...)` por un modelo cerrado con 10
usuarios concurrentes y el servidor tarda 1 s por respuesta, ¿cuántas peticiones por segundo recibe? (Unas 10, no 60:
el modelo cerrado se frena con el sistema y te hace creer que aguanta.)

#### 12. ERROR COMÚN

**Síntoma:** el test de carga da casi un 48 % de errores y el equipo concluye que el sistema no aguanta 60 reservas/s.
**Causa:** toda la carga va con **una sola API key**, y el gateway limita a 50 peticiones/s por cliente: Gatling está
midiendo el limitador. `f184-carga-gatling/error-comun.sh` (la misma simulación con `claves=1`):

```bash
#!/usr/bin/env bash
# Módulo 32 · F184 · ERROR COMÚN: lanzar toda la carga con UNA sola API key. El gateway (50 peticiones/s por cliente)
# rechaza con 429 y Gatling mide el limitador, no el sistema. Ejecuta: ./f184-carga-gatling/error-comun.sh
cd "$(dirname "$0")/.." || exit 1
node f184-carga-gatling/arrancar-sistema.js & pid=$!
sleep 1
npx gatling run --sources-folder f184-carga-gatling/src --results-folder logs/gatling --non-interactive \
  --simulation reservas tasa=60 segundos=20 claves=1 2>&1 | sed -n '/Global Information/,$p' | grep -E "request count|found 429|percentage of failed"
kill "$pid"
```

Salida real (bloque final de Gatling):

```text
---- Global Information -------------------------------------------------------------|---Total---|-----OK----|----KO----
> request count                                                                      |     2,485 |     1,298 |     1,187
> min response time (ms)                                                             |         0 |         0 |         0
> max response time (ms)                                                             |        86 |        86 |         9
> mean response time (ms)                                                            |         2 |         2 |         1
> response time std deviation (ms)                                                   |         2 |         3 |         1
> response time 50th percentile (ms)                                                 |         1 |         2 |         1
> response time 75th percentile (ms)                                                 |         2 |         2 |         1
> response time 95th percentile (ms)                                                 |         4 |         5 |         2
> response time 99th percentile (ms)                                                 |         6 |         8 |         4
> mean throughput (rps)                                                              |      99.4 |     51.92 |     47.48
---- Response Time Distribution ----------------------------------------------------------------------------------------
> OK: t < 800 ms                                                                                          1,298 (52.23%)
> OK: 800 ms <= t < 1200 ms                                                                                   0     (0%)
> OK: t >= 1200 ms                                                                                            0     (0%)
> KO                                                                                                      1,187 (47.77%)
---- Errors ------------------------------------------------------------------------------------------------------------
> status.find.is(200), found 429                                                                            968 (68.85%)
> status.find.is(202), found 429                                                                            219 (15.58%)
> GET /reservas/{id}: No attribute named 'reservaId' is defined                                             219 (15.58%)
========================================================================================================================
Global: 99th percentile of response time is less than 300.0 : true (actual : 6.0)
Global: percentage of failed events is less than 1.0 : false (actual : 47.76659959758551)
```

**Diagnóstico visual:** en el informe de Gatling, el gráfico de errores muestra solo `found 429` y el de respuestas por
segundo se aplana en unas 50 OK/s: un techo exacto y redondo es un limitador, no un sistema saturado (que degrada poco
a poco y sube la latencia). **Arreglo:** varias API keys en el feeder, o una clave de pruebas con su propia cuota.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo diseñas un test de carga que sirva para decidir si un sistema está listo para un pico?**

**Respuesta modelo:** empiezo por el objetivo: tráfico esperado del pico (aquí 60 reservas/s) y SLO (p99 < 300 ms, < 1 %
de errores). Uso **modelo abierto** con una rampa y una meseta, porque el tráfico de internet no espera a que el sistema
responda; el modelo cerrado esconde la saturación. Escribo la simulación como código (Gatling) con **aserciones** que
hacen fallar el CI, datos realistas (varios clientes, eventos y tarjetas) y un entorno parecido a producción. Además de
la latencia de la API, miro métricas de negocio y de los recursos (reservas confirmadas, colas, CPU, conexiones),
porque una API asíncrona puede responder rápido mientras el trabajo de fondo falla. Vigilo que el generador no sea el
cuello de botella, y completo con un test de estrés hasta romper y uno de resistencia de varias horas.

#### 14. ANTI-PATRÓN RELACIONADO

**Test de carga sin aserciones (o «a ojo»):** se ejecuta, se mira la gráfica, «parece que va bien» y se olvida. Nadie
detecta que la semana siguiente el p99 se triplicó.

```javascript
// MAL: sin aserciones; Gatling termina con código 0 aunque falle el 50 %.
setUp(reservar.injectOpen(constantUsersPerSec(60).during(20))).protocols(protocolo);
// BIEN: el SLO es parte del test y el CI se pone en rojo si no se cumple.
setUp(...).assertions(global().responseTime().percentile(99).lt(300), global().failedRequests().percent().lt(1.0));
```

En el pipeline se ve como un paso de «carga» siempre verde, aunque el informe HTML que nadie abre esté lleno de rojo.

---

### Restricción sobrevenida

#### 1. UBICACIÓN

Módulo 32, Lección 5 de 7 · Fase 3 · 1,5 h.

#### 2. PRERREQUISITOS

- Las fichas F181–F184 de este módulo.
- Backpressure y colas (Módulos 13 y 22); reintentos con jitter (Módulo 19).

#### 3. OBJETIVO DE APRENDIZAJE

**Medir** el impacto de una restricción externa nueva (el proveedor de pagos limita a 20 peticiones/s) con el pico de
60 reservas/s, **rediseñar** el cobro como una cola a ritmo fijo y **demostrar** con números que el rediseño elimina los
429 y las ventas perdidas. Lo compruebas cuando `node --test f185-restriccion-sobrevenida/restriccion.test.js` pasa 3
de 3.

#### 4. ANALOGÍA VISUAL

El **puente que pasa a un solo carril**. Dibuja una autopista de tres carriles (60 coches por segundo) que desemboca en
un puente donde ahora, por obras, solo caben 20 coches por segundo. Antes de la obra, los coches llegaban en tropel; con
el puente estrecho, dos de cada tres chocan contra la barrera (429) y se dan la vuelta (reserva cancelada). La solución
no es cerrar la autopista: es poner un **aparcamiento antes del puente** con un semáforo que deja pasar 18 coches por
segundo. Nadie choca; algunos esperan un poco más.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TB
    subgraph ANTES["Antes: cobro inmediato"]
        A1["60 reservas/s"] --> A2["cobrar en cuanto llega<br/>3 intentos, backoff 100 ms"]
        A2 -->|"≤ 20/s"| A3["Proveedor: 201"]
        A2 -->|"resto"| A4["429 → CANCELADA<br/>~60 % de ventas perdidas"]
    end
    subgraph DESPUES["Después (ADR-0002): cola de cobros"]
        D1["60 reservas/s<br/>202 PENDIENTE"] --> D2[("cola «cobros»")]
        D2 -->|"18 cobros/s"| D3["Proveedor: 201<br/>0 respuestas 429"]
        D3 --> D4["CONFIRMADA<br/>p99 hasta el cobro ~11,6 s"]
    end
```

**Texto alternativo:** dos diagramas de flujo apilados. Antes, con cobro inmediato: llegan 60 reservas por segundo y
cada una intenta cobrar en cuanto llega, con 3 intentos y backoff de 100 milisegundos; hasta 20 por segundo reciben 201
del proveedor y el resto recibe 429 y acaba cancelada, con alrededor del 60 por ciento de ventas perdidas. Después, con
el ADR-0002: las 60 reservas por segundo reciben 202 en estado pendiente y entran en la cola de cobros, que se despacha
a 18 cobros por segundo; el proveedor responde 201 sin ningún 429 y las reservas acaban confirmadas, con un p99 desde la
reserva hasta el cobro de unos 11,6 segundos.

#### 6. EXPLICACIÓN NIVEL 0

- En los proyectos reales, las reglas **cambian a mitad**: un proveedor pone un límite, llega una ley, se recorta el
  presupuesto. Saber reaccionar es parte del oficio.
- Primero se **mide** cuánto daño hace el cambio, con el mismo test de carga de antes.
- Después se buscan **varias soluciones**, se comparan y se elige una, explicando lo que se gana y lo que se pierde.
- Y se vuelve a medir para **demostrar** que funciona.

#### 7. EXPLICACIÓN INTERMEDIA

- **La restricción:** el proveedor simulado aplica una ventana fija de 1 s: a partir de la petición 21 de cada segundo
  responde **429** con `Retry-After: 1`.
- **Escenario** (`escenario.js`): 60 reservas/s durante 5 s (300 reservas), modelo abierto, contra el sistema de F181
  con el proveedor limitado. Mide reservas confirmadas y canceladas, 429, el máximo de cobros en un segundo y el p99
  desde la reserva hasta el cobro.
- **Antes:** el cobro sale en cuanto llega la reserva, con 3 intentos y backoff de 100 ms. Los reintentos se agotan en
  menos de 1 s, dentro de la misma ventana saturada.
- **Después:** `cola-cobros.js` despacha los cobros (y reembolsos) en orden de llegada a **18/s**, un 10 % por debajo
  del límite. En Temporal, lo mismo es la cola `cobros` con `maxTaskQueueActivitiesPerSecond: 18` (F182, `worker.js` y
  `TemporalConfig.java`), que aplica el servidor a la suma de workers.
- **Gatling sigue en verde:** con la restricción, la API responde 202 en milisegundos; las pérdidas solo se ven en el
  resumen de negocio del sistema. Por eso la fitness function de F186 mide reservas canceladas, no solo latencia.

#### 8. EXPLICACIÓN MAESTRA

Las tres opciones del ADR-0002, con sus números:

| Opción | Resultado medido o esperado | Trade-off |
|---|---|---|
| **A. Cola de cobros a 18/s** | 300 de 300 confirmadas, 0 respuestas 429, p99 hasta el cobro de unos 11,6 s en el pico de 5 s | «pago en proceso» visible; la cola crece si el pico es largo (1352 reservas tardarían unos 75 s) |
| **B. Gateway a 20 reservas/s** | se rechazan con 429 en el gateway las 40/s que sobran: las mismas ventas perdidas, antes | sencillo, pero traslada el problema al cliente |
| **C. Plan superior del proveedor** | depende del nuevo límite | costo fijo mensual; no elimina el límite |

- **Reintentos no son la solución:** reintentar más rápido dentro de la misma ventana solo multiplica las peticiones
  (error común). Si reintentas, respeta `Retry-After` y añade jitter.
- **Combinar:** A + un circuit breaker delante del proveedor (Módulos 8/19) para no insistir si el proveedor cae del
  todo, y + una alerta de profundidad de cola.
- **Límite de la cola:** con un pico sostenido por encima de 18/s, la cola crece sin parar. Hay que decidir qué pasa
  entonces: rechazar nuevas reservas con un mensaje claro (control de admisión) o subir el límite contratado (C). Ese
  umbral va en «Cuándo revisar esta decisión» del ADR.
- **Cuándo NO** encolar: si el negocio exige saber el resultado del pago antes de responder (por ejemplo, un TPV
  físico). Entonces la opción es C o limitar la entrada (B) con un mensaje honesto.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, Express 5.3.0 (el sistema de F181), sin servidor externo.

`f185-restriccion-sobrevenida/cola-cobros.js`:

```javascript
// Módulo 32 · F185 · El rediseño del ADR-0007 en el orquestador local: los cobros salen de la ruta síncrona y se
// despachan a un ritmo fijo (por defecto 18/s, por debajo del límite de 20/s del proveedor), en orden de llegada.
// Es el equivalente local de la cola «cobros» de Temporal con maxTaskQueueActivitiesPerSecond: 18 (f182/worker.js).
export function limitarCobros(actividades, porSegundo = 18) {
  const hueco = 1000 / porSegundo;
  let siguiente = 0; // instante (ms) en que sale el próximo cobro
  const turno = () => {
    const ahora = Date.now();
    siguiente = Math.max(siguiente, ahora);
    const espera = siguiente - ahora;
    siguiente += hueco;
    return new Promise((ok) => setTimeout(ok, espera));
  };
  return {
    ...actividades,
    async cobrar(r) { await turno(); return actividades.cobrar(r); },
    async reembolsar(r) { await turno(); return actividades.reembolsar(r); }, // también cuenta contra el límite
  };
}
```

`f185-restriccion-sobrevenida/escenario.js`:

```javascript
// Módulo 32 · F185 · Escenario de la restricción sobrevenida: llegan `tasa` reservas/s durante `segundos` (modelo
// abierto, como el pico que midió Gatling) contra un proveedor limitado a `limiteRps`. Devuelve qué pasó.
import { montarSistema } from '../f181-sistema-reservas/montaje.js';
import { limitarCobros } from './cola-cobros.js';
import { espera, percentil } from '../comun/estadistica.js';

export async function correr({ tasa = 60, segundos = 5, limiteRps = 20, cobrosPorSegundo = 0, politica = { intentos: 3, inicialMs: 100 } } = {}) {
  const s = await montarSistema({ aforo: 1_000_000, proveedor: { limiteRps, latenciaMs: 5 }, politica,
    envolverActividades: cobrosPorSegundo ? (a) => limitarCobros(a, cobrosPorSegundo) : (a) => a });
  const total = tasa * segundos;
  const inicio = Date.now();
  const envios = [];
  for (let i = 0; i < total; i++) {
    await espera(Math.max(0, inicio + (i * 1000) / tasa - Date.now()));
    envios.push(fetch(`${s.reservasUrl}/reservas`, { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': `p${i}` },
      body: JSON.stringify({ eventoId: 'concierto-1', clienteId: `C-${i}`, importe: 80, tarjeta: '4242-OK' }) }).then((r) => r.status));
  }
  const respuestasHttp = await Promise.all(envios);
  while (s.repo.todas().some((r) => r.estado === 'PENDIENTE') && Date.now() - inicio < 120_000) await espera(50);
  const reservas = s.repo.todas();
  const confirmadas = reservas.filter((r) => r.estado === 'CONFIRMADA');
  const resultado = {
    reservas: reservas.length,
    http202: respuestasHttp.filter((e) => e === 202).length,
    confirmadas: confirmadas.length,
    canceladas: reservas.filter((r) => r.estado === 'CANCELADA').length,
    rechazados429: s.stats.rechazados429,
    peticionesProveedor: s.stats.peticiones,
    maxCobrosEnUnSegundo: Math.max(0, ...s.stats.porSegundo.values()),
    p99HastaCobroS: percentil(confirmadas.map((r) => (r.actualizada - r.creada) / 1000), 99),
  };
  await s.cerrar();
  return resultado;
}

export function imprimir(titulo, r) {
  console.log(titulo);
  console.log(`  reservas recibidas (HTTP 202):   ${r.http202} de ${r.reservas}`);
  console.log(`  CONFIRMADAS / CANCELADAS:        ${r.confirmadas} / ${r.canceladas} (${((r.canceladas / r.reservas) * 100).toFixed(1)} % de ventas perdidas)`);
  console.log(`  peticiones al proveedor:         ${r.peticionesProveedor} · respondidas con 429: ${r.rechazados429}`);
  console.log(`  máximo de cobros en un segundo:  ${r.maxCobrosEnUnSegundo}`);
  console.log(`  p99 desde la reserva al cobro:   ${r.p99HastaCobroS.toFixed(1)} s`);
}
```

`antes.js` y `despues.js`:

```javascript
// Módulo 32 · F185 · ANTES: el proveedor anuncia 20 peticiones/s y el sistema sigue cobrando en cuanto llega la reserva.
// Pico de 60 reservas/s durante 5 s (el pico que midió Gatling). Ejecuta: node f185-restriccion-sobrevenida/antes.js
import { correr, imprimir } from './escenario.js';
imprimir('ANTES · cobro inmediato, 3 intentos con backoff de 100 ms:', await correr({ tasa: 60, segundos: 5, limiteRps: 20 }));
```

```javascript
// Módulo 32 · F185 · DESPUÉS (ADR-0007): los cobros salen por una cola a 18/s. Mismo pico de 60 reservas/s durante 5 s.
// Ejecuta: node f185-restriccion-sobrevenida/despues.js
import { correr, imprimir } from './escenario.js';
imprimir('DESPUÉS · cola de cobros a 18/s:', await correr({ tasa: 60, segundos: 5, limiteRps: 20, cobrosPorSegundo: 18 }));
```

#### 10. MINI-LABORATORIO

1. Mide el daño con el diseño actual:

```bash
node f185-restriccion-sobrevenida/antes.js
```

   **Output esperado** (los números exactos varían en ±2 reservas según cómo caigan los segundos del reloj):

```text
ANTES · cobro inmediato, 3 intentos con backoff de 100 ms:
  reservas recibidas (HTTP 202):   300 de 300
  CONFIRMADAS / CANCELADAS:        120 / 180 (60.0 % de ventas perdidas)
  peticiones al proveedor:         741 · respondidas con 429: 621
  máximo de cobros en un segundo:  20
  p99 desde la reserva al cobro:   0.3 s
```

2. Aplica el rediseño y vuelve a medir:

```bash
node f185-restriccion-sobrevenida/despues.js
```

   **Output esperado:**

```text
DESPUÉS · cola de cobros a 18/s:
  reservas recibidas (HTTP 202):   300 de 300
  CONFIRMADAS / CANCELADAS:        300 / 0 (0.0 % de ventas perdidas)
  peticiones al proveedor:         300 · respondidas con 429: 0
  máximo de cobros en un segundo:  18
  p99 desde la reserva al cobro:   11.5 s
```

   **Captura comentada:** antes, el proveedor solo acepta 20 cobros por segundo y los reintentos rápidos acaban en 429:
   se pierde alrededor del 60 % de las ventas y el proveedor recibe más del doble de peticiones que reservas. Después,
   cada reserva se cobra una sola vez, nunca más de 18 en un segundo, y la última del pico tarda unos 11,6 s en cobrarse.

3. La restricción **vista desde Gatling** (lo hace los comandos de verificación indicados): el mismo test de F184 con `LIMITE_RPS=20`:

```bash
LIMITE_RPS=20 node f184-carga-gatling/arrancar-sistema.js &
npx gatling run --sources-folder f184-carga-gatling/src --results-folder logs/gatling --simulation reservas tasa=60 segundos=20
kill %1
```

   **Output esperado** (líneas clave):

```text
> response time 99th percentile (ms)                                                 |         7 |         7 |         -
Global: 99th percentile of response time is less than 300.0 : true (actual : 7.0)
Global: 99th percentile of response time is less than 300.0 : true (actual : 7.0)
Global: percentage of failed events is less than 1.0 : true (actual : 0.0)
sistema listo: gateway :18080 · proveedor limitado a 20/s
resumen: 1352 reservas · 493 CONFIRMADA · 859 CANCELADA · 0 PENDIENTE · 429 del proveedor: 3019
```

   **Captura comentada:** Gatling aprueba (p99 de 7 ms, 0 % de errores en la API) mientras se cancelan **859 de 1352
   reservas** (63,5 %). Un test de carga que solo mira la API no habría visto el problema.

#### 11. VERIFICACIÓN

Test que debes ejecutar (`f185-restriccion-sobrevenida/restriccion.test.js`, escenario reducido para que tarde unos
segundos):

```javascript
// Módulo 32 · F185 · tests (escenario reducido: 30 reservas/s durante 2 s, proveedor a 10/s):
// node --test f185-restriccion-sobrevenida/restriccion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correr } from './escenario.js';
import { limitarCobros } from './cola-cobros.js';

test('la cola de cobros despacha a ritmo fijo y en orden de llegada', async () => {
  const marcas = [];
  const act = limitarCobros({ cobrar: async (r) => { marcas.push([r.id, Date.now()]); return {}; }, reembolsar: async () => ({}) }, 20);
  await Promise.all([1, 2, 3, 4, 5].map((id) => act.cobrar({ id })));
  assert.deepEqual(marcas.map(([id]) => id), [1, 2, 3, 4, 5]);
  const total = marcas.at(-1)[1] - marcas[0][1];
  assert.ok(total >= 190 && total < 400, `5 cobros a 20/s tardan ~200 ms (${total} ms)`);
});

test('ANTES: con cobro inmediato el proveedor responde 429 y se pierden ventas', { timeout: 60_000 }, async () => {
  const r = await correr({ tasa: 30, segundos: 2, limiteRps: 10 });
  assert.ok(r.rechazados429 > 0);
  assert.ok(r.canceladas > 0, `canceladas: ${r.canceladas}`);
});

test('DESPUÉS: con la cola a 9/s no hay ningún 429 y todas se confirman', { timeout: 60_000 }, async () => {
  const r = await correr({ tasa: 30, segundos: 2, limiteRps: 10, cobrosPorSegundo: 9 });
  assert.deepEqual([r.rechazados429, r.canceladas, r.confirmadas], [0, 0, 60]);
  assert.ok(r.maxCobrosEnUnSegundo <= 10);
});
```

```bash
node --test f185-restriccion-sobrevenida/restriccion.test.js
```

```text
✔ la cola de cobros despacha a ritmo fijo y en orden de llegada
✔ ANTES: con cobro inmediato el proveedor responde 429 y se pierden ventas
✔ DESPUÉS: con la cola a 9/s no hay ningún 429 y todas se confirman
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

**Pregunta de comprobación:** con la cola a 18/s, ¿cuánto tardaría en cobrarse la última reserva de un pico de 60
reservas/s durante **un minuto**? (3600 reservas / 18 por segundo = 200 s desde el inicio del pico, unos 140 s después
de que acabe. Por eso el ADR pide una alerta por profundidad de cola.)

#### 12. ERROR COMÚN

**Síntoma:** tras ver los 429, alguien sube los reintentos a 10 sin espera «para que acaben entrando». Las
cancelaciones no bajan y el proveedor amenaza con bloquear la cuenta por abuso. **Causa:** tormenta de reintentos:
reintentar inmediatamente dentro de la misma ventana saturada solo añade peticiones. `f185-restriccion-sobrevenida/error-comun.js`:

```javascript
// Módulo 32 · F185 · ERROR COMÚN: «arreglar» los 429 subiendo los reintentos sin backoff (y sin mirar Retry-After).
// Más intentos inmediatos = tormenta de reintentos: el proveedor recibe muchas más peticiones y sigue rechazando.
// Ejecuta: node f185-restriccion-sobrevenida/error-comun.js
import { correr, imprimir } from './escenario.js';
imprimir('ERROR · 10 intentos inmediatos, sin backoff:', await correr({ tasa: 60, segundos: 5, limiteRps: 20,
  politica: { intentos: 10, inicialMs: 0, coeficiente: 1 } }));
```

Salida real de `node f185-restriccion-sobrevenida/error-comun.js`:

```text
ERROR · 10 intentos inmediatos, sin backoff:
  reservas recibidas (HTTP 202):   300 de 300
  CONFIRMADAS / CANCELADAS:        100 / 200 (66.7 % de ventas perdidas)
  peticiones al proveedor:         2107 · respondidas con 429: 2007
  máximo de cobros en un segundo:  20
  p99 desde la reserva al cobro:   0.0 s
```

**Diagnóstico visual:** en el panel del cliente HTTP hacia el proveedor, las peticiones por segundo **multiplican** las
reservas por segundo y la proporción de 429 sube; un pico así es la firma de una tormenta de reintentos. **Arreglo:**
respetar `Retry-After`, backoff exponencial con jitter y, sobre todo, la cola a ritmo fijo de este rediseño.

#### 13. PREGUNTA DE ENTREVISTA

**A mitad del proyecto, el proveedor de pagos anuncia un límite de 20 peticiones/s y tus picos son de 60 reservas/s.
¿Qué haces?**

**Respuesta modelo:** primero mido el impacto con el test de carga del pico y con métricas de negocio, no solo de la
API: con cobro inmediato se perdía alrededor del 60 % de las ventas del pico. Después planteo al menos tres opciones con
sus números: encolar los cobros y despacharlos a un ritmo por debajo del límite (18/s); limitar la entrada en el
gateway a 20 reservas/s; o contratar un plan superior. Elijo la cola, porque no pierde ventas y la saga en Temporal ya
es asíncrona: el cobro va a su propia cola con `maxTaskQueueActivitiesPerSecond`, los 429 se reintentan con backoff y
la interfaz muestra «pago en proceso». Lo documento en un ADR con su fitness function (0 respuestas 429, 0 canceladas y
p99 hasta el cobro por debajo de 60 s) y una condición de revisión (profundidad de cola), y vuelvo a medir para
demostrarlo: 300 de 300 confirmadas en el pico.

#### 14. ANTI-PATRÓN RELACIONADO

**Rediseño sin medición:** se cambia el código «porque seguro que ahora va mejor», sin el antes ni el después. Cuando
el Comité pregunta «¿cuánto mejoró?», no hay respuesta.

```text
MAL:   «Hemos metido una cola para los pagos.»
BIEN:  «Antes: 120/300 confirmadas, más de 600 respuestas 429. Después: 300/300, 0 respuestas 429, p99 hasta el cobro ≈ 11,6 s.
        Fitness function en CI: f186-adr/fitness.test.js.»
```

En un ADR se ve como un «Contexto» sin un solo número.

---

### Rediseño documentado en ADR

#### 1. UBICACIÓN

Módulo 32, Lección 6 de 7 · Fase 3 · 1,5 h.

#### 2. PRERREQUISITOS

- ADRs y fitness functions (Módulo 24) y la plantilla de `docs/microservicios/07-plantillas.md` (sección 7.1).
- La medición de F185.

#### 3. OBJETIVO DE APRENDIZAJE

**Redactar** el ADR del rediseño con contexto medido, tres opciones con trade-offs, consecuencias negativas aceptadas,
fitness function **ejecutable** y condición de revisión, y **validarlo** automáticamente. Lo compruebas cuando
`node --test f186-adr/fitness.test.js` pasa 3 de 3.

#### 4. ANALOGÍA VISUAL

El **acta de una obra con el cambio de planos firmado**. Dibuja una carpeta de obra: el plano original del puente con
un sello rojo «reemplazado por el plano 2», y el plano 2 con una hoja grapada que dice: por qué se cambió (el puente
pasó a un carril, con las medidas del aforo), qué otras dos soluciones se estudiaron y por qué no, qué empeora (los
coches esperan en el aparcamiento) y **un sensor** en la entrada del puente que avisará si algún día pasan más de 20
coches por segundo.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    M["Medición F185<br/>antes: ~60 % perdidas"] --> C["Contexto con números"]
    C --> O["Opciones A, B, C<br/>a favor · en contra · coste"]
    O --> D["Decisión: A"]
    D --> CS["Consecuencias<br/>positivas · negativas · riesgos"]
    D --> FF["Fitness function<br/>fitness.test.js en CI"]
    D --> RV["Cuándo revisar<br/>cola > 2000 · límite sube"]
    FF -->|"falla"| RV
    V["validar-adr.js"] -.-> C & O & CS & FF & RV
```

**Texto alternativo:** diagrama de flujo. La medición de F185, con alrededor del 60 por ciento de ventas perdidas,
alimenta el contexto con números; de ahí salen las opciones A, B y C con lo que tienen a favor, en contra y su coste,
que llevan a la decisión A. La decisión produce las consecuencias positivas, negativas y riesgos, la fitness function
que se ejecuta en CI y la condición de revisión (cola por encima de 2000 o subida del límite); si la fitness function
falla, se dispara la revisión. Un validador automático comprueba, con líneas punteadas, el contexto, las opciones, las
consecuencias, la fitness function y la condición de revisión.

#### 6. EXPLICACIÓN NIVEL 0

- Un **ADR** es una hoja que explica **una decisión** de diseño: qué problema había, qué opciones se miraron, qué se
  eligió y qué se pierde.
- Sirve para que, dentro de un año, nadie tenga que adivinar «¿por qué hicieron esto así?».
- Un buen ADR tiene **números**, no opiniones, y dice cómo se comprobará que la decisión sigue siendo buena.
- Aquí, además, un programa revisa que el ADR tenga todas sus partes.

#### 7. EXPLICACIÓN INTERMEDIA

- **Estructura** (plantilla del curso, basada en el ADR de Michael Nygard): título en presente con la decisión,
  estado, fecha, decisores, contexto, opciones consideradas (tabla), decisión, consecuencias (positivas, negativas,
  riesgos), fitness function y cuándo revisar.
- **Estado:** un ADR no se edita para cambiar de opinión: se escribe otro que lo **reemplaza** y se marca el antiguo.
  Aquí el ADR-0002 reemplaza la parte de cobro inmediato del ADR-0001.
- **Fitness function ejecutable:** la del ADR-0002 es `fitness.test.js`, que corre el escenario reducido y exige 0
  respuestas 429, 0 canceladas y p99 hasta el cobro < 60 s. Va en CI: si alguien vuelve a cobrar en línea, el build se
  rompe.
- **Validador** (`validar-adr.js`): comprueba título, estado, fecha, las seis secciones, números en el contexto, al
  menos tres opciones y consecuencias negativas.

#### 8. EXPLICACIÓN MAESTRA

| Formato | A favor | En contra | Cuándo |
|---|---|---|---|
| **Nygard + fitness function** (este curso) | corto; obliga a medir y a revisar | hay que mantener la fitness function | decisiones de arquitectura con impacto |
| **MADR** (Markdown Any Decision Records) | plantilla detallada con «drivers» y pros/contras por opción | más largo | equipos que comparan muchas opciones |
| **RFC / design doc** | discusión amplia antes de decidir | pesado; la decisión final se pierde en el documento | cambios grandes entre varios equipos |

- **Dónde viven:** junto al código (`docs/adr/` o, aquí, `f186-adr/adr/`), revisados en el mismo PR que el cambio.
- **Granularidad:** un ADR por decisión. «Usamos Temporal» y «cobramos por cola a 18/s» son dos decisiones con ciclos
  de vida distintos.
- **Cuándo NO** escribir un ADR: decisiones reversibles en minutos y de alcance local (el nombre de una variable, una
  librería de utilidades). El ADR es para lo caro de deshacer.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, sin dependencias para el validador; la fitness function usa el sistema de F181.

El ADR del rediseño (`f186-adr/adr/0002-cobro-asincrono-por-limite-del-proveedor.md`):

```markdown
# ADR-0002: Pasamos el cobro a una cola a 18 cobros/s porque el proveedor de pagos limita a 20 peticiones/s

- **Estado:** Aceptado (reemplaza la parte de cobro inmediato del ADR-0001)
- **Fecha:** 2026-11-20
- **Decisores:** equipo de reservas
- **Módulos o servicios afectados:** reservas (workflow y workers), gateway, interfaz de usuario

## Contexto

Restricción sobrevenida: el proveedor de pagos limita a **20 peticiones/s** por cliente y responde **429** con
`Retry-After: 1`. El test de carga con Gatling (60 reservas/s durante 20 s, 1352 reservas) sigue en verde para la API
(p99 de 10 ms, 0 % de errores), pero el resumen del sistema muestra **859 de 1352 reservas canceladas (63,5 %)** y
3027 respuestas 429 del proveedor. Con el pico de 5 s de `f185-restriccion-sobrevenida/antes.js` se pierden unas 180 de
300 ventas (60 %).

## Opciones consideradas

| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. Cola de cobros a 18/s (cola «cobros» de Temporal con `maxTaskQueueActivitiesPerSecond: 18`) | absorbe el pico sin perder ventas; 0 respuestas 429; reintentos durables | la reserva queda «pago en proceso» hasta 11,6 s en p99 con un pico de 5 s | 1 worker más |
| B. Rate limiting en el gateway a 20 reservas/s | sencillo; ya existe el gateway | rechaza clientes en los picos: pierde las mismas ventas, solo que antes | ninguno |
| C. Contratar el plan superior del proveedor | sin cambios de código | coste mensual fijo; sube el límite pero no lo elimina | según contrato |

## Decisión

Opción A: el cobro sale de la ruta síncrona a la cola «cobros», despachada a 18 cobros/s (un 10 % por debajo del
límite, para dejar sitio a los reembolsos y a la deriva de reloj).

## Consecuencias

- **Positivas:** 300 de 300 reservas confirmadas en el pico de 5 s, 0 respuestas 429, como mucho 18 cobros en un segundo.
- **Negativas (trade-off aceptado):** la interfaz muestra «Pago en proceso»; un pico largo hace crecer la cola
  (1352 reservas en 25 s tardan unos 75 s en cobrarse).
- **Riesgos y mitigación:** cola creciente si el pico dura mucho → alerta por profundidad de cola; el `scheduleToCloseTimeout`
  de 10 minutos cancela y compensa una reserva que no se pudo cobrar.

## Fitness function

`node --test f186-adr/fitness.test.js` en CI: con el proveedor limitado, 0 respuestas 429, 0 reservas canceladas y p99
desde la reserva hasta el cobro por debajo de 60 s. En producción: alerta si la cola de cobros supera 2000 tareas o si el
p99 hasta el cobro supera 60 s.

## Cuándo revisar esta decisión

Si el proveedor sube el límite por encima del pico medido, si el negocio exige confirmación de pago inmediata o si la
cola supera 2000 tareas más de una vez al mes.
```

El validador (`f186-adr/validar-adr.js`):

```javascript
// Módulo 32 · F186 · Valida que un ADR tiene lo que exige el curso (plantilla de docs/microservicios/07-plantillas.md):
// estado y fecha, contexto CON NÚMEROS, al menos 3 opciones (la elegida + 2 alternativas) con trade-offs, decisión,
// consecuencias negativas, fitness function y condición de revisión.
// Uso: node f186-adr/validar-adr.js f186-adr/adr/*.md
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SECCIONES = ['Contexto', 'Opciones consideradas', 'Decisión', 'Consecuencias', 'Fitness function', 'Cuándo revisar esta decisión'];

export function validarAdr(texto) {
  const faltas = [];
  if (!/^# ADR-\d{4}: .+/m.test(texto)) faltas.push('título «# ADR-NNNN: decisión en una frase»');
  for (const campo of ['Estado', 'Fecha']) if (!new RegExp(`\\*\\*${campo}:\\*\\* \\S`).test(texto)) faltas.push(`campo ${campo}`);
  const seccion = (n) => (texto.split(new RegExp(`^## ${n}\\s*$`, 'm'))[1] ?? '').split(/^## /m)[0];
  for (const s of SECCIONES) if (!new RegExp(`^## ${s}\\s*$`, 'm').test(texto)) faltas.push(`sección «${s}»`);
  if (!/\d/.test(seccion('Contexto'))) faltas.push('números en el contexto (carga, latencia, límite, coste)');
  const opciones = seccion('Opciones consideradas').split('\n').filter((l) => /^\| [A-Z]\. /.test(l));
  if (opciones.length < 3) faltas.push(`3 opciones o más (hay ${opciones.length}): la elegida y 2 alternativas`);
  if (!/Negativas/.test(seccion('Consecuencias'))) faltas.push('consecuencias negativas (el trade-off aceptado)');
  return faltas;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let mal = 0;
  for (const ruta of process.argv.slice(2)) {
    const faltas = validarAdr(readFileSync(ruta, 'utf8'));
    console.log(faltas.length ? `✘ ${ruta}: falta ${faltas.join('; ')}` : `✔ ${ruta}`);
    if (faltas.length) mal++;
  }
  process.exitCode = mal ? 1 : 0;
}
```

#### 10. MINI-LABORATORIO

1. Valida los dos ADR del proyecto:

```bash
node f186-adr/validar-adr.js f186-adr/adr/*.md
```

   **Output esperado:**

```text
✔ f186-adr/adr/0001-saga-de-reservas-con-temporal.md
✔ f186-adr/adr/0002-cobro-asincrono-por-limite-del-proveedor.md
```

2. Escribe tu ADR-0003 para otra decisión del proyecto (por ejemplo, «fail-open del limitador si Redis cae», F183) en
   `f186-adr/adr/0003-….md` y pásale el validador hasta que salga con ✔. El test «todos los ADR del proyecto cumplen la
   plantilla» lo incluirá solo.

#### 11. VERIFICACIÓN

Test que debes ejecutar (`f186-adr/fitness.test.js`):

```javascript
// Módulo 32 · F186 · La fitness function del ADR-0002, ejecutable, y la validación de los ADR del proyecto.
// node --test f186-adr/fitness.test.js   (escenario reducido: 30 reservas/s durante 3 s, proveedor a 10/s, cola a 9/s)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { correr } from '../f185-restriccion-sobrevenida/escenario.js';
import { validarAdr } from './validar-adr.js';

test('fitness function del ADR-0002: 0 respuestas 429, 0 canceladas y p99 hasta el cobro < 60 s', { timeout: 120_000 }, async () => {
  const r = await correr({ tasa: 30, segundos: 3, limiteRps: 10, cobrosPorSegundo: 9 });
  assert.equal(r.rechazados429, 0);
  assert.equal(r.canceladas, 0);
  assert.ok(r.p99HastaCobroS < 60, `p99 ${r.p99HastaCobroS} s`);
});

test('todos los ADR del proyecto cumplen la plantilla', () => {
  const dir = new URL('./adr/', import.meta.url);
  const adrs = readdirSync(dir).filter((f) => f.endsWith('.md'));
  assert.ok(adrs.length >= 2);
  for (const f of adrs) assert.deepEqual(validarAdr(readFileSync(new URL(f, dir), 'utf8')), [], f);
});

test('un ADR sin números ni alternativas no pasa', () => {
  assert.equal(validarAdr(readFileSync(new URL('./adr-mal.md', import.meta.url), 'utf8')).length, 12);
});
```

```bash
node --test f186-adr/fitness.test.js
```

```text
✔ fitness function del ADR-0002: 0 respuestas 429, 0 canceladas y p99 hasta el cobro < 60 s
✔ todos los ADR del proyecto cumplen la plantilla
✔ un ADR sin números ni alternativas no pasa
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

**Pregunta de comprobación:** el proveedor sube su límite a 100 peticiones/s. ¿Qué haces con el ADR-0002? (Se cumple
su condición de revisión: escribes un ADR nuevo que decida si mantener la cola, subir su ritmo o volver al cobro
inmediato, y marcas el 0002 como «Reemplazado por ADR-000N». No se borra.)

#### 12. ERROR COMÚN

**Síntoma:** en la defensa, el Comité pregunta por qué se eligió la cola y nadie lo recuerda; el ADR solo dice «vamos a
meter una cola para los pagos». **Causa:** ADR sin contexto medido, sin alternativas y sin consecuencias.
`f186-adr/adr-mal.md`:

```markdown
# ADR: cambiar los pagos

Vamos a meter una cola para los pagos porque el proveedor da errores. Lo hace Ana esta semana.
```

Salida real de `node f186-adr/validar-adr.js f186-adr/adr-mal.md`:

```text
✘ f186-adr/adr-mal.md: falta título «# ADR-NNNN: decisión en una frase»; campo Estado; campo Fecha; sección «Contexto»; sección «Opciones consideradas»; sección «Decisión»; sección «Consecuencias»; sección «Fitness function»; sección «Cuándo revisar esta decisión»; números en el contexto (carga, latencia, límite, coste); 3 opciones o más (hay 0): la elegida y 2 alternativas; consecuencias negativas (el trade-off aceptado)
```

**Diagnóstico visual:** lee el ADR buscando cifras y la palabra «Negativas»: si no hay ninguna, es un anuncio, no una
decisión. **Arreglo:** la plantilla de `07-plantillas.md` y `validar-adr.js` como paso del CI sobre `adr/*.md`.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué debe tener un ADR para que sirva de algo dentro de un año?**

**Respuesta modelo:** la decisión en una frase en el título, el estado (y si reemplaza a otro), fecha y decisores; un
contexto con las fuerzas y **números** (carga, límites, costes, SLO) que la motivaron; al menos dos alternativas reales
con lo que tienen a favor, en contra y su coste; la decisión ligada al contexto; las consecuencias, sobre todo las
**negativas** que aceptamos; una **fitness function** que compruebe automáticamente que la decisión se sigue cumpliendo
(un test en CI o una alerta), y la **condición concreta** que obliga a revisarla. Vive junto al código y se revisa en el
mismo PR. Si cambia la decisión, no se edita: se escribe otro ADR que lo reemplaza.

#### 14. ANTI-PATRÓN RELACIONADO

**ADR escrito a posteriori para justificar:** se decide en un pasillo, se implementa y luego alguien escribe un ADR con
una sola opción y «alternativas» de paja para cumplir el trámite.

```markdown
| Opción | A favor | En contra |
|---|---|---|
| A. La que ya hicimos | todo | nada |
| B. No hacer nada | — | todo |
```

En el historial de Git se ve como un ADR añadido **semanas después** del commit que implementa la decisión.

---

### Defensa ante Architecture Review Board

#### 1. UBICACIÓN

Módulo 32, Lección 7 de 7 · Fase 3 · 2 h de preparación + 40 min de defensa · Laboratorio
`f187-defensa-arb`.

#### 2. PRERREQUISITOS

- Todo el proyecto (F181–F186) y la estimación de costo (`node costo.js`, método del Módulo 28).
- Modelo C4 (Módulo 24) y la rúbrica de `docs/microservicios/07-plantillas.md` (sección 7.2).

#### 3. OBJETIVO DE APRENDIZAJE

**Defender** el diseño del proyecto ante un comité en 20 minutos de presentación y 20 de preguntas, **justificar** cada
decisión con datos (carga, costo, ADR) y **reconocer** los límites del diseño; y **calcular** la nota con la rúbrica
ponderada. Lo compruebas cuando `node --test f187-defensa-arb/defensa.test.js` pasa 5 de 5 y tu evaluación supera 2.8
sin ningún 1.

#### 4. ANALOGÍA VISUAL

La **defensa de un proyecto de arquitectura ante el ayuntamiento**. Dibuja una sala con una mesa larga y tres personas
(la arquitecta jefa, la responsable de mantenimiento, el de presupuestos), cada una con la misma hoja de criterios y una
columna de notas del 1 al 4. Delante, el estudiante con la maqueta (el sistema funcionando), los planos (C4), el acta
del cambio de planos (ADR) y la factura estimada. En la pared, una regla escrita: «se aprueba con 2.8 de media y
ninguna nota en 1». Un detalle: una de las preguntas de la mesa es «¿qué parte de este edificio **no** hacía falta?».

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TB
    E["entregables.js<br/>8 comprobaciones"] -->|"listo para la defensa"| P["Presentación 20 min<br/>C4 · demo en vivo · carga · ADR · costo"]
    P --> Q["Preguntas 20 min"]
    Q --> N["Notas 1-4 por criterio<br/>(3 evaluadores, consenso)"]
    N --> PU["puntuar.js<br/>Σ peso × nota"]
    PU --> R{"≥ 2.80 y ningún 1"}
    R -->|"sí"| AP["APROBADO"]
    R -->|"no"| RE["REPETIR DEFENSA<br/>con los motivos"]
```

**Texto alternativo:** diagrama de flujo de arriba abajo. La lista de entregables, con 8 comprobaciones, debe decir
listo para la defensa antes de la presentación de 20 minutos, que incluye el diagrama C4, una demo en vivo, la carga,
el ADR y el costo. Siguen 20 minutos de preguntas. Tres evaluadores ponen por consenso una nota de 1 a 4 por criterio, y
el programa de puntuación suma peso por nota. Si el total es al menos 2,80 y no hay ningún 1, el resultado es aprobado;
si no, repetir la defensa con los motivos.

#### 6. EXPLICACIÓN NIVEL 0

- Al final, cuentas tu sistema a un grupo de personas expertas que van a hacerte preguntas difíciles.
- No te piden que sea perfecto: te piden que **sepas por qué** está hecho así y **qué le falta**.
- Te ponen nota en nueve aspectos, cada uno con su peso. Para aprobar necesitas una buena media **y** no suspender
  ninguno del todo.
- La mejor preparación es tener todo funcionando y los números a mano.

#### 7. EXPLICACIÓN INTERMEDIA

- **Antes:** `node f187-defensa-arb/entregables.js` debe decir `listo para la defensa` (C4 en el README, saga y tests,
  gateway y test, Gatling con aserciones, antes/después, 2+ ADR con fitness function, `COSTO.md`, pista Spring).
- **Guion de 20 minutos:** contexto y requisitos (2 min); C4 de contenedores y por qué esos límites (4); demo en vivo de
  una saga que falla a mitad y compensa (4); Gatling y la restricción con su antes/después (4); ADR-0002 (3); costo
  (`COSTO.md`) y qué **no** separaste (3).
- **Preguntas típicas** (plantilla 7.2): ¿qué pasa si el proveedor tarda 30 s?; ¿qué servicio fusionarías si el equipo
  se reduce a la mitad?; ¿cuánto cuesta tu sistema al mes y cómo lo bajarías un 30 %?; ¿qué parte **no** debería ser un
  microservicio?
- **Puntuación:** `puntuar.js` multiplica cada nota por su peso, suma y aplica las dos reglas. Una nota fuera de 1–4 es
  un error, no un cero silencioso.

#### 8. EXPLICACIÓN MAESTRA

| Cómo se revisa una arquitectura | A favor | En contra | Cuándo |
|---|---|---|---|
| **Comité con rúbrica** (este) | criterios explícitos y comparables; detecta huecos | puede volverse un trámite o un cuello de botella | hitos grandes: salida a producción, cambios de plataforma |
| **ATAM ligero** (Módulo 24) | parte de escenarios de calidad y trade-offs | requiere preparación | decisiones con atributos en conflicto (latencia frente a costo) |
| **Revisión asíncrona de ADR en PR** | rápida; deja rastro | menos profundidad | el día a día |
| **Fitness functions en CI** | continua y automática | solo comprueba lo que se puede medir | siempre, como complemento |

- **Cómo responder bien:** con datos del proyecto («p99 de 7 ms a 60 reservas/s»; «196,79 USD al mes, 0,1968 USD por
  cada 1000 reservas»), reconociendo límites («el orquestador local no es durable; por eso entregamos Temporal») y
  proponiendo alternativas sin ponerse a la defensiva (criterio 9).
- **Qué no separar:** una respuesta madura señala, por ejemplo, que inventario y reservas cambian juntos y los mantiene
  un solo equipo, así que podrían ser un único servicio con dos módulos (Módulo 31, F180).
- **Cuándo NO** montar un comité: equipos pequeños con decisiones reversibles; ahí basta la revisión de ADR en el PR.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, sin dependencias.

La rúbrica (`f187-defensa-arb/rubrica.json`):

```json
{
  "fuente": "docs/microservicios/07-plantillas.md, sección 7.2 (Rúbrica del Comité de Arquitectura)",
  "aprueba": { "mediaMinima": 2.8, "ningunCriterioEn": 1 },
  "criterios": [
    { "id": 1, "nombre": "Descomposición y límites", "peso": 0.15 },
    { "id": 2, "nombre": "Consistencia y saga", "peso": 0.15 },
    { "id": 3, "nombre": "Resiliencia", "peso": 0.10 },
    { "id": 4, "nombre": "Seguridad", "peso": 0.10 },
    { "id": 5, "nombre": "Observabilidad", "peso": 0.10 },
    { "id": 6, "nombre": "Rendimiento y carga", "peso": 0.10 },
    { "id": 7, "nombre": "Restricción sobrevenida y ADR", "peso": 0.15 },
    { "id": 8, "nombre": "Costo (FinOps)", "peso": 0.05 },
    { "id": 9, "nombre": "Comunicación y defensa", "peso": 0.10 }
  ]
}
```

La hoja de puntuación (`f187-defensa-arb/puntuar.js`):

```javascript
// Módulo 32 · F187 · Hoja de puntuación del Comité de Arquitectura (Architecture Review Board), ejecutable.
// Aprueba con media ponderada >= 2.8 Y ningún criterio en 1 (rúbrica 7.2 de docs/microservicios/07-plantillas.md).
// Uso: node f187-defensa-arb/puntuar.js f187-defensa-arb/evaluacion-ejemplo.json
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const rubrica = JSON.parse(readFileSync(new URL('./rubrica.json', import.meta.url)));

export function puntuar(notas) {
  const filas = rubrica.criterios.map((c) => {
    const nota = notas[c.id];
    if (![1, 2, 3, 4].includes(nota)) throw new Error(`criterio ${c.id} (${c.nombre}): nota ${nota} fuera de 1-4`);
    return { ...c, nota, ponderado: c.peso * nota };
  });
  const total = Math.round(filas.reduce((s, f) => s + f.ponderado, 0) * 100) / 100;
  const enUno = filas.filter((f) => f.nota === rubrica.aprueba.ningunCriterioEn).map((f) => f.nombre);
  const aprueba = total >= rubrica.aprueba.mediaMinima && enUno.length === 0;
  return { filas, total, enUno, aprueba };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ev = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const r = puntuar(ev.notas);
  console.log(`Estudiante: ${ev.estudiante} · ${ev.fecha} · evaluadores: ${ev.evaluadores.join(', ')}`);
  for (const f of r.filas) console.log(`${String(f.id)} ${f.nombre.padEnd(31)} ${f.peso.toFixed(2)}   ${f.nota}   ${f.ponderado.toFixed(2)}`);
  console.log(`Total: ${r.total.toFixed(2)} (aprueba con >= 2.80 y ningún 1)`);
  console.log(r.aprueba ? 'Recomendación: APROBADO'
    : `Recomendación: REPETIR DEFENSA · ${r.total < 2.8 ? `media ${r.total.toFixed(2)} < 2.80` : ''}${r.enUno.length ? `criterio en 1: ${r.enUno.join(', ')}` : ''}`);
}
```

La lista de entregables (`f187-defensa-arb/entregables.js`):

```javascript
// Módulo 32 · F187 · Lista de comprobación ANTES de la defensa: ¿el proyecto tiene todo lo que pide el Comité?
// Revisa el propio laboratorio (o la carpeta que pases). Uso: node f187-defensa-arb/entregables.js [carpeta]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export function revisar(raiz) {
  const leer = (r) => (existsSync(join(raiz, r)) ? readFileSync(join(raiz, r), 'utf8') : '');
  const hay = (r) => existsSync(join(raiz, r));
  return [
    ['Diagrama C4 (contexto y contenedores) en el README', /```mermaid[\s\S]*C4/.test(leer('README.md'))],
    ['Saga con compensaciones y sus tests', hay('f182-saga-temporal/workflows.js') && hay('f182-saga-temporal/saga.test.js')],
    ['Gateway con rate limiting y su test', hay('f183-gateway-rate-limit/limitador.js') && hay('f183-gateway-rate-limit/gateway.test.js')],
    ['Simulación de Gatling con aserciones (SLO)', /assertions\(/.test(leer('f184-carga-gatling/src/reservas.gatling.js'))],
    ['Medición antes/después de la restricción', hay('f185-restriccion-sobrevenida/antes.js') && hay('f185-restriccion-sobrevenida/despues.js')],
    ['2 ADR o más, con fitness function ejecutable', hay('f186-adr/adr') && readdirSync(join(raiz, 'f186-adr/adr')).length >= 2 && hay('f186-adr/fitness.test.js')],
    ['Estimación de costo con precios reales', /USD/.test(leer('COSTO.md'))],
    ['Versión Spring Boot (Fase 1) del sistema', hay('spring/settings.gradle.kts')],
  ];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const filas = revisar(process.argv[2] ?? new URL('..', import.meta.url).pathname);
  for (const [que, ok] of filas) console.log(`${ok ? '✔' : '✘'} ${que}`);
  const faltan = filas.filter(([, ok]) => !ok).length;
  console.log(faltan ? `faltan ${faltan} entregable(s): no pidas fecha de defensa todavía` : 'listo para la defensa');
}
```

La estimación de costo (`costo.js`, método y precios del Módulo 28):

```javascript
// Módulo 32 · Estimación de costo mensual del proyecto en AWS (ECS sobre Fargate), con el método del Módulo 28.
// Ejecuta: node costo.js   (escribe también COSTO.md, que el Comité revisa en el criterio 8)
import { writeFileSync } from 'node:fs';
import { HORAS_MES, PRECIOS, p } from './comun/precios.js';

const SEG = HORAS_MES * 3600;
const reservasMes = 1_000_000;
const tareas = [ // [contenedor, tareas, vCPU, GB]
  ['gateway', 2, 0.5, 1], ['reservas (API)', 2, 0.5, 1], ['worker «reservas»', 2, 0.5, 1], ['worker «cobros»', 1, 0.25, 0.5],
  ['Temporal (autoalojado, sin su base de datos)', 1, 1, 2], ['Redis (limitador)', 1, 0.25, 0.5],
];
const partidas = tareas.map(([n, t, v, g]) => [n, t * SEG * (v * p('fargateVcpuSegundo') + g * p('fargateGbSegundo'))]);
partidas.push(['NAT gateway (1, horas)', HORAS_MES * p('natHora')]);
partidas.push(['NAT gateway (GB al proveedor: 2 KB por cobro)', (reservasMes * 2 * 1024) / 1024 ** 3 * p('natGb')]);
partidas.push(['logs (12 líneas de 300 B por reserva)', (reservasMes * 12 * 300) / 1024 ** 3 * p('logsIngestaGb')]);
const total = partidas.reduce((s, [, v]) => s + v, 0);
const lineas = partidas.map(([n, v]) => `| ${n} | ${v.toFixed(2)} |`);
const md = `# Costo estimado del proyecto (generado por \`node costo.js\`)

Supuestos: ${reservasMes.toLocaleString('en-US')} reservas al mes, ECS sobre Fargate en US East (N. Virginia), ${HORAS_MES} h/mes,
sin descuentos. Precios (USD) de \`comun/precios.js\`, consultados el 2026-11-19 y el 2026-11-20:
${Object.values(PRECIOS).map((x) => `- ${x.usd} · ${x.fuente}`).join('\n')}

| Partida | USD/mes |
|---|---|
${lineas.join('\n')}
| **TOTAL** | **${total.toFixed(2)}** |

Costo unitario: **${(total / (reservasMes / 1000)).toFixed(4)} USD por cada 1000 reservas**. No incluye la base de datos de
Temporal ni la de reservas (PostgreSQL), ni el balanceador: añádelos con los precios de su página antes de la defensa.
`;
writeFileSync(new URL('./COSTO.md', import.meta.url), md);
console.log(md);
```

#### 10. MINI-LABORATORIO

1. Comprueba que el proyecto está listo:

```bash
node f187-defensa-arb/entregables.js
```

   **Output esperado:**

```text
✔ Diagrama C4 (contexto y contenedores) en el README
✔ Saga con compensaciones y sus tests
✔ Gateway con rate limiting y su test
✔ Simulación de Gatling con aserciones (SLO)
✔ Medición antes/después de la restricción
✔ 2 ADR o más, con fitness function ejecutable
✔ Estimación de costo con precios reales
✔ Versión Spring Boot (Fase 1) del sistema
listo para la defensa
```

2. Calcula el costo que presentarás (criterio 8):

```bash
node costo.js
```

   **Output esperado** (la tabla; el comando escribe también `COSTO.md`):

```text
| Partida | USD/mes |
|---|---|
| gateway | 36.04 |
| reservas (API) | 36.04 |
| worker «reservas» | 36.04 |
| worker «cobros» | 9.01 |
| Temporal (autoalojado, sin su base de datos) | 36.04 |
| Redis (limitador) | 9.01 |
| NAT gateway (1, horas) | 32.85 |
| NAT gateway (GB al proveedor: 2 KB por cobro) | 0.09 |
| logs (12 líneas de 300 B por reserva) | 1.68 |
| **TOTAL** | **196.79** |

Costo unitario: **0.1968 USD por cada 1000 reservas**. No incluye la base de datos de
```

3. Ensaya la defensa con alguien que haga de Comité (o graba los 20 minutos y evalúate). Rellena una copia de
   `evaluacion-ejemplo.json` con las notas y puntúa:

```bash
node f187-defensa-arb/puntuar.js f187-defensa-arb/evaluacion-ejemplo.json
```

   **Output esperado:**

```text
Estudiante: Estudiante de ejemplo · 2026-11-20 · evaluadores: arquitecta principal, SRE, producto
1 Descomposición y límites        0.15   3   0.45
2 Consistencia y saga             0.15   4   0.60
3 Resiliencia                     0.10   3   0.30
4 Seguridad                       0.10   2   0.20
5 Observabilidad                  0.10   3   0.30
6 Rendimiento y carga             0.10   4   0.40
7 Restricción sobrevenida y ADR   0.15   4   0.60
8 Costo (FinOps)                  0.05   3   0.15
9 Comunicación y defensa          0.10   3   0.30
Total: 3.30 (aprueba con >= 2.80 y ningún 1)
Recomendación: APROBADO
```

   **Captura comentada:** la seguridad sale con 2 porque el laboratorio base no trae OAuth2 ni Vault: es el criterio
   que más sube si integras lo de los Módulos 9, 20 y 27.

#### 11. VERIFICACIÓN

Test que debes ejecutar (`f187-defensa-arb/defensa.test.js`):

```javascript
// Módulo 32 · F187 · tests: node --test f187-defensa-arb/defensa.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { puntuar } from './puntuar.js';
import { revisar } from './entregables.js';

const leer = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url)));

test('los pesos de la rúbrica suman 1', () => {
  const suma = leer('./rubrica.json').criterios.reduce((s, c) => s + c.peso, 0);
  assert.equal(Math.round(suma * 100) / 100, 1);
});

test('la evaluación de ejemplo aprueba con 3.30', () => {
  const r = puntuar(leer('./evaluacion-ejemplo.json').notas);
  assert.deepEqual([r.total, r.aprueba], [3.3, true]);
});

test('una media alta NO aprueba si un criterio está en 1', () => {
  const r = puntuar(leer('./evaluacion-con-un-1.json').notas);
  assert.equal(r.total, 3.7);
  assert.deepEqual([r.aprueba, r.enUno], [false, ['Seguridad']]);
});

test('una nota fuera de 1-4 es un error, no un 0 silencioso', () => {
  assert.throws(() => puntuar({ 1: 5 }), /fuera de 1-4/);
});

test('este laboratorio tiene todos los entregables que pide el Comité', () => {
  const faltan = revisar(new URL('..', import.meta.url).pathname).filter(([, ok]) => !ok).map(([q]) => q);
  assert.deepEqual(faltan, []);
});
```

```bash
node --test f187-defensa-arb/defensa.test.js
```

```text
✔ los pesos de la rúbrica suman 1
✔ la evaluación de ejemplo aprueba con 3.30
✔ una media alta NO aprueba si un criterio está en 1
✔ una nota fuera de 1-4 es un error, no un 0 silencioso
✔ este laboratorio tiene todos los entregables que pide el Comité
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

**Pregunta de comprobación:** con todas las notas en 3 salvo Costo (FinOps) en 1, ¿apruebas? (No: la media sería 2,90,
pero hay un criterio en 1. Un solo punto ciego grave basta para repetir.)

#### 12. ERROR COMÚN

**Síntoma:** el estudiante sale de la defensa convencido de que aprobó «porque la media era un 3,7», y el acta dice
«repetir defensa». **Causa:** olvidar la segunda regla de la rúbrica: **ningún criterio en 1**. Aquí, la clave del
proveedor de pagos estaba escrita en el código (seguridad = 1). `f187-defensa-arb/evaluacion-con-un-1.json`:

```json
{ "estudiante": "Defensa con un criterio en 1", "fecha": "2026-11-20", "evaluadores": ["arquitecta principal", "SRE", "producto"],
  "notas": { "1": 4, "2": 4, "3": 4, "4": 1, "5": 4, "6": 4, "7": 4, "8": 4, "9": 4 },
  "preguntaConMasDudas": "¿Dónde guardas la clave del proveedor de pagos?" }
```

Salida real de `node f187-defensa-arb/puntuar.js f187-defensa-arb/evaluacion-con-un-1.json`:

```text
Estudiante: Defensa con un criterio en 1 · 2026-11-20 · evaluadores: arquitecta principal, SRE, producto
1 Descomposición y límites        0.15   4   0.60
2 Consistencia y saga             0.15   4   0.60
3 Resiliencia                     0.10   4   0.40
4 Seguridad                       0.10   1   0.10
5 Observabilidad                  0.10   4   0.40
6 Rendimiento y carga             0.10   4   0.40
7 Restricción sobrevenida y ADR   0.15   4   0.60
8 Costo (FinOps)                  0.05   4   0.20
9 Comunicación y defensa          0.10   4   0.40
Total: 3.70 (aprueba con >= 2.80 y ningún 1)
Recomendación: REPETIR DEFENSA · criterio en 1: Seguridad
```

**Diagnóstico visual:** en la hoja de puntuación, busca la columna de notas antes de mirar el total: un 1 aislado entre
cuatros es la señal. **Arreglo:** revisar los nueve criterios con la tabla de niveles antes de la defensa y cerrar
cualquier hueco de nivel 1 (secretos fuera del código, timeouts, alguna traza…).

#### 13. PREGUNTA DE ENTREVISTA

**En la defensa, el Comité te pregunta: «¿Qué parte de tu sistema no debería ser un microservicio?». ¿Qué respondes?**

**Respuesta modelo:** respondo con los criterios del curso, no por intuición. Inventario y reservas cambian siempre
juntos, los mantiene el mismo equipo y no escalan distinto: en mi diseño son un solo servicio con dos módulos y una
sola base, y separarlos solo añadiría una llamada de red y una saga más. El gateway y el worker de cobros sí están
separados por motivos medibles: el gateway escala con el tráfico de entrada y el worker de cobros tiene un ritmo
impuesto por el proveedor (ADR-0002). El simulador del proveedor es un sistema externo. Si el equipo se redujera a la
mitad, fusionaría el worker de reservas con la API, porque ya comparten código y despliegue. Y añado el costo: 196,79
USD al mes para 1 000 000 de reservas, del que casi una sexta parte es el NAT gateway, que es lo primero que revisaría
para bajarlo un 30 %.

#### 14. ANTI-PATRÓN RELACIONADO

**Defensa de diapositivas:** veinte transparencias con logotipos de tecnologías y ningún sistema funcionando, ni un
número medido, ni una decisión con alternativas. El Comité no puede evaluar lo que no ve.

```text
MAL:   «Usamos Kafka, Kubernetes, Istio, Temporal y GraphQL.»  (lista de tecnologías)
BIEN:  «Esta reserva falla al confirmar; mirad en la UI de Temporal cómo reembolsa y libera la plaza.
        Con el proveedor a 20/s perdíamos el 60 %; con la cola, 0. Cuesta 0,1968 USD por cada 1000 reservas.»
```

En la hoja de puntuación se ve como notas de 1 y 2 en «Rendimiento y carga» y en «Restricción sobrevenida y ADR».
