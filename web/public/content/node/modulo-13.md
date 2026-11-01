# Módulo 13: TypeScript, contratos e integraciones confiables

Una API puede compilar, pasar pruebas y aun romper consumidores o duplicar cobros. La red entrega bytes, no objetos TypeScript; los clientes reintentan cuando desconocen el resultado; una publicación puede separarse accidentalmente del cambio en base. Este módulo convierte esas incertidumbres en contratos e invariantes comprobables.

## Aprende construyendo

Cada tema comienza en una carpeta vacía y constituye un proyecto independiente. Escribe manualmente todos los archivos indicados: no copies ni abras ejemplos de la academia y no reutilices archivos de otros temas. Las pruebas de concurrencia son locales y acotadas; no necesitan credenciales reales, servicios externos, CI ni despliegues.

### Tema 1: Tipos estáticos dentro, datos desconocidos en la frontera · Intermedio · 90 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, JavaScript básico y conocimiento elemental de TypeScript. Comprueba `node --version`; no necesitas una base de datos ni un framework HTTP.

**Al terminar podrás:** validar como `unknown` el body de `POST /envios`, obtener un DTO tipado con zod, demostrar que `strict` y un cast no validan datos de red y traducir mediante una unión discriminada todos los resultados esperados de un caso de uso.

**Por qué importa:** la app del conductor puede enviar un número donde RutaFlow espera una guía, aunque el frontend TypeScript declare lo contrario. Si la API confía en `as CreateEnvioInput`, el dato inválido llega al dominio y el fallo aparece lejos de su causa.

TypeScript comprueba el programa durante el desarrollo y sus tipos se borran al compilar. `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` mejoran las comprobaciones internas, pero ninguno inspecciona los bytes que llegan por HTTP, una cola, un archivo o una variable de entorno. El valor correcto en esa frontera es `unknown`.

Un parser de runtime sí examina el valor. zod permite declarar forma, longitud y formato, rechazar claves no previstas con `.strict()` e inferir el tipo TypeScript desde la misma definición. Valida una vez en la frontera y pasa el DTO resultante al caso de uso; repetir el mismo parseo en cada función interna añade trabajo sin mejorar la garantía.

```text
bytes/JSON -> unknown -> schema runtime -> DTO válido -> caso de uso
                         |
                         +-> 400 con errores de entrada
```

Validar la forma no sustituye las reglas de negocio. «Guía con formato `RF-` y dígitos» pertenece a la entrada; «el plan no puede superar veinte envíos activos» necesita consultar estado y pertenece al caso de uso. Mantén separados DTO HTTP, comando de dominio y entidad persistente.

Una unión discriminada representa resultados esperados sin convertirlos todos en excepciones. Un `switch` exhaustivo obliga a revisar el mapeo HTTP cuando se agrega una variante. Los branded types pueden evitar mezclar `EnvioId` y `ActorId`, pero también deben construirse después de validar.

**Analogía:** TypeScript revisa los planos dentro de una fábrica; el parser inspecciona el cargamento en el muelle. La analogía tiene un límite: un parser puede validar estructura, pero no demuestra por sí solo autorización, cupos ni consistencia con la base de datos.

#### Practica

Desde una carpeta vacía, crea el directorio y entra en él:

```bash
mkdir frontera-envios
cd frontera-envios
mkdir src
```

Crea manualmente `package.json`:

```json
{
  "name": "frontera-envios",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "tsx --test src/frontera.test.ts",
    "check": "npm run typecheck && npm test"
  }
}
```

Crea `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

Instala las dependencias declarando su uso en el proyecto:

```bash
npm install zod
npm install --save-dev typescript tsx @types/node
```

Crea `src/frontera.ts`:

```typescript
import { z } from "zod";

export const CreateEnvioInput = z.object({
  guia: z.string().regex(/^RF-\d+$/),
  direccion: z.string().trim().min(1).max(200),
}).strict();

export type CreateEnvioInput = z.infer<typeof CreateEnvioInput>;

export function parseCreateEnvio(value: unknown): CreateEnvioInput {
  return CreateEnvioInput.parse(value);
}

export type CrearEnvioResultado =
  | { kind: "creado"; envio: { id: string; guia: string } }
  | { kind: "guia-duplicada"; envio: { id: string; guia: string } }
  | { kind: "cupo-excedido"; limite: number };

export function toHttp(result: CrearEnvioResultado): { status: number; body: unknown } {
  switch (result.kind) {
    case "creado":
      return { status: 201, body: result.envio };
    case "guia-duplicada":
      return { status: 200, body: result.envio };
    case "cupo-excedido":
      return { status: 409, body: { limite: result.limite } };
    default:
      return assertNever(result);
  }
}

function assertNever(value: never): never {
  throw new Error(`Resultado no contemplado: ${JSON.stringify(value)}`);
}
```

Crea `src/frontera.test.ts`:

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { parseCreateEnvio, toHttp } from "./frontera.js";

test("convierte unknown válido en el DTO inferido", () => {
  const entrada: unknown = { guia: "RF-4471", direccion: "  Calle 10  " };
  assert.deepEqual(parseCreateEnvio(entrada), {
    guia: "RF-4471",
    direccion: "Calle 10",
  });
});

test("rechaza tipos y formatos inválidos antes del dominio", () => {
  assert.throws(() => parseCreateEnvio({ guia: 123, direccion: null }));
  assert.throws(() => parseCreateEnvio({ guia: "XX", direccion: "Calle 10" }));
});

test("rechaza propiedades no declaradas y agota los resultados", () => {
  assert.throws(() => parseCreateEnvio({
    guia: "RF-4471",
    direccion: "Calle 10",
    interno: true,
  }));
  assert.deepEqual(toHttp({ kind: "cupo-excedido", limite: 20 }), {
    status: 409,
    body: { limite: 20 },
  });
});
```

Ejecuta la comprobación completa:

```bash
npm run check
```

**Resultado esperado:** TypeScript termina sin errores y `node:test`, mediante `tsx`, reporta tres pruebas superadas. La primera entrada queda recortada; los números, `null`, guías mal formadas y propiedades adicionales se rechazan.

**Fallo deliberado y corrección:** sustituye temporalmente el cuerpo de `parseCreateEnvio` por `return value as CreateEnvioInput;`. Ejecuta otra vez `npm run check`: el typecheck sigue pasando, pero dos pruebas fallan porque el cast devuelve valores inválidos sin examinarlos. Restaura `return CreateEnvioInput.parse(value);` y comprueba que vuelven a pasar las tres pruebas. La evidencia importante es que `strict` no convirtió el cast en una validación de red.

**Práctica guiada:** añade una función `parseCreateEnvioSeguro(value: unknown)` basada en `safeParse`. Debe devolver `{ ok: true, data }` o `{ ok: false, problem }`, donde `problem` tenga `status: 400`, `title: "Entrada inválida"` y una lista de errores de campos sin incluir el body completo. Prueba un objeto válido y otro con dos campos incorrectos.

**Ejercicio independiente:** agrega a la entrada una `prioridad` opcional limitada a `normal` o `urgente` y una cuarta variante `direccion-invalida` en `CrearEnvioResultado`. Mapea esa variante a `422` en `toHttp`; elimina después una rama del `switch` para observar el error de exhaustividad y restáurala. Entrega pruebas para ambas prioridades y explica por qué una prioridad desconocida es un error de entrada, no una regla de cupos.

#### Aplica

En una API propia de entregas, define una única frontera para `POST /envios`: body como `unknown`, parser explícito, DTO inferido y caso de uso sin casts sobre datos externos. Configura y valida también las variables de entorno. Como evidencia, conserva una petición válida, una inválida con `400` y una regla de negocio con `409`; sus diferencias deben poder explicarse sin mirar la implementación.

**Checklist de salida**

- [ ] Creaste manualmente el proyecto, la configuración estricta, el parser y sus pruebas.
- [ ] El body entra como `unknown` y solo se vuelve DTO después de parsear.
- [ ] El fallo deliberado demostró que `strict` y `as Tipo` no validan la red.
- [ ] Las claves desconocidas y los valores con tipos incorrectos se rechazan.
- [ ] El `switch` cubre todas las variantes y falla al omitir una.
- [ ] Distingues validación estructural, autorización y reglas de negocio.
- [ ] No propagaste `any`, `@ts-ignore` ni non-null assertions para ocultar errores.

**Cuándo no repetirlo:** no vuelvas a aplicar el mismo schema en cada capa interna. Cada frontera nueva sí necesita su propia validación, incluidos mensajes antiguos y respuestas de proveedores.

```mermaid
flowchart LR
  Raw[Body recibido como unknown] --> Parse[Parser de runtime]
  Parse -->|inválido| Bad[400 con errores seguros]
  Parse -->|válido| DTO[DTO tipado]
  DTO --> UseCase[Regla de aplicación]
  UseCase --> Result[Resultado de dominio]
```

**Proyecto real:** integra una frontera validada en una API propia de entregas: body externo como `unknown`, parser en un solo punto y regla de negocio que recibe únicamente el DTO validado. Conserva como evidencia una petición aceptada, otra rechazada y una regla que falla después de validar la forma.

**Fuentes oficiales:** [zod](https://zod.dev/) y [TypeScript: uso de `unknown` en variables `catch`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#using-unknown-in-catch-variables).

### Tema 2: Un contrato HTTP es comportamiento, no solo documentación · Avanzado · 90 min

#### Aprende

**Prerrequisitos:** HTTP JSON, módulos ESM, `fetch` y pruebas básicas con Node. Este proyecto no usa el parser ni ningún archivo del ejercicio anterior.

**Al terminar podrás:** especificar el comportamiento observable de `POST /envios`, escribir pruebas de proveedor contra un servidor real y ejecutar expectativas mínimas registradas por un consumidor, incluidos estados, cabeceras, cuerpos y Problem Details.

**Por qué importa:** una app móvil puede depender de `201`, del campo `guia` y del estado `creado`, mientras un socio solo necesita `id`. Un cambio que parece correcto dentro del repositorio del proveedor puede romper cualquiera de esas expectativas si nadie las ejecuta contra la API real.

El contrato HTTP es lo que un consumidor puede observar: método, ruta, cabeceras, request, status, content type, cuerpo, errores y significado. Una descripción OpenAPI puede representar gran parte de ese contrato, pero el documento no ejecuta la aplicación ni demuestra que ambos coincidan.

Las **pruebas de proveedor** parten de las promesas del servicio y envían requests reales a una instancia local. Comprueban, por ejemplo, que una creación devuelve `201` y que una entrada inválida devuelve `400` con `application/problem+json`. No bastan para conocer todos los usos externos.

Las **pruebas dirigidas por consumidor** registran ejemplos mínimos que cada consumidor necesita. El proveedor ejecuta esos ejemplos como parte de sus pruebas. Así, «la app móvil necesita `guia` y `estado`» se convierte en evidencia ejecutable y no en una conversación olvidada. Estas pruebas no sustituyen pruebas funcionales, seguridad ni acuerdos sobre semántica.

RFC 9457 define Problem Details para errores HTTP. Una respuesta consistente puede incluir `type`, `title`, `status`, `detail` e `instance`, sin exponer stack traces. El status también debe coincidir con el campo `status` del cuerpo.

Agregar un campo opcional suele ser compatible, pero no siempre: un parser estricto puede rechazarlo. Cambiar el significado de `estado`, la precisión de un importe o un valor de enum puede romper sin cambiar el tipo. La compatibilidad es una propiedad observada entre proveedor y consumidores, no una lista universal.

**Analogía:** el contrato de un enchufe incluye forma y voltaje. El dibujo ayuda, pero solo una prueba con ambos extremos demuestra que funcionan juntos; cambiar el voltaje sin cambiar la forma es especialmente peligroso porque parece compatible.

#### Practica

Crea un proyecto nuevo, sin abrir proyectos de otros temas:

```bash
mkdir comportamiento-envios
cd comportamiento-envios
mkdir src test contracts
```

Crea `package.json`:

```json
{
  "name": "comportamiento-envios",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test test/*.test.js"
  }
}
```

Crea `test/server-harness.js` para compartir el servidor efímero y su cierre entre las pruebas del proveedor y del consumidor:

```javascript
import { once } from "node:events";
import { createApp } from "../src/server.js";

export async function startTestServer() {
  const server = createApp();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    await once(server, "close");
    throw new Error("El servidor de pruebas no obtuvo una dirección TCP");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      server.close();
      await once(server, "close");
    },
  };
}
```

Crea `src/server.js`:

```javascript
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

function responder(res, status, body, problem = false) {
  res.writeHead(status, {
    "Content-Type": problem
      ? "application/problem+json; charset=utf-8"
      : "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

function problema(res, status, title, detail) {
  responder(res, status, {
    type: "about:blank",
    title,
    status,
    detail,
    instance: "/envios",
  }, true);
}

export function createApp() {
  const envios = new Map();

  return createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/envios") {
      return problema(res, 404, "Ruta no encontrada", "La operación solicitada no existe");
    }

    let raw = "";
    for await (const chunk of req) raw += chunk;

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return problema(res, 400, "Entrada inválida", "El body debe ser JSON válido");
    }

    if (!body || typeof body !== "object" || Array.isArray(body) ||
        typeof body.guia !== "string" || !/^RF-\d+$/.test(body.guia)) {
      return problema(res, 400, "Entrada inválida", "guia debe tener formato RF-<dígitos>");
    }

    if (envios.has(body.guia)) {
      return problema(res, 409, "Guía duplicada", "Ya existe un envío con esa guía");
    }

    const envio = { id: randomUUID(), guia: body.guia, estado: "creado" };
    envios.set(envio.guia, envio);
    return responder(res, 201, envio);
  });
}
```

Crea `test/provider.test.js`:

```javascript
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./server-harness.js";

let testServer;

before(async () => {
  testServer = await startTestServer();
});

after(async () => {
  if (testServer) await testServer.close();
});

test("el proveedor crea con 201 y JSON observable", async () => {
  const response = await fetch(`${testServer.baseUrl}/envios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guia: "RF-100" }),
  });
  assert.equal(response.status, 201);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  const body = await response.json();
  assert.equal(typeof body.id, "string");
  assert.equal(body.guia, "RF-100");
  assert.equal(body.estado, "creado");
});

test("el proveedor devuelve Problem Details en una entrada inválida", async () => {
  const response = await fetch(`${testServer.baseUrl}/envios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guia: 100 }),
  });
  assert.equal(response.status, 400);
  assert.match(response.headers.get("content-type"), /^application\/problem\+json/);
  const body = await response.json();
  assert.equal(body.status, 400);
  assert.equal(body.title, "Entrada inválida");
  assert.equal(body.instance, "/envios");
});
```

Crea `contracts/movil.contract.json`, escrito desde la perspectiva de la app móvil:

```json
{
  "consumer": "app-movil",
  "cases": [
    {
      "name": "crear envío visible para el conductor",
      "request": { "guia": "RF-700" },
      "expected": {
        "status": 201,
        "contentType": "application/json",
        "requiredFields": ["id"],
        "body": { "guia": "RF-700", "estado": "creado" }
      }
    },
    {
      "name": "mostrar una entrada inválida sin interpretar HTML",
      "request": { "guia": "incorrecta" },
      "expected": {
        "status": 400,
        "contentType": "application/problem+json",
        "requiredFields": ["detail"],
        "body": { "title": "Entrada inválida", "status": 400 }
      }
    }
  ]
}
```

Crea `test/movil.contract.test.js`:

```javascript
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { startTestServer } from "./server-harness.js";

const contract = JSON.parse(await readFile(
  new URL("../contracts/movil.contract.json", import.meta.url),
  "utf8",
));

let testServer;

before(async () => {
  testServer = await startTestServer();
});

after(async () => {
  if (testServer) await testServer.close();
});

test("el proveedor satisface los ejemplos mínimos de la app móvil", async () => {
  for (const example of contract.cases) {
    const response = await fetch(`${testServer.baseUrl}/envios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(example.request),
    });
    assert.equal(response.status, example.expected.status, example.name);
    assert.match(
      response.headers.get("content-type"),
      new RegExp(`^${example.expected.contentType.replace("+", "\\+")}`),
      example.name,
    );
    const body = await response.json();
    for (const field of example.expected.requiredFields) {
      assert.equal(typeof body[field], "string", `${example.name}: ${field}`);
    }
    for (const [field, value] of Object.entries(example.expected.body)) {
      assert.equal(body[field], value, `${example.name}: ${field}`);
    }
  }
});
```

Ejecuta:

```bash
npm test
```

**Resultado esperado:** tres pruebas superadas: dos expresan promesas del proveedor y una ejecuta los dos ejemplos del consumidor. Los servidores usan puertos efímeros locales y se cierran al terminar.

**Fallo deliberado y corrección:** cambia únicamente el `201` de creación en `src/server.js` por `200`. El servidor sigue funcionando, pero la prueba válida del proveedor y el contrato de la app móvil fallan; la prueba de error continúa verde. Restaura `201` y repite `npm test`. Después cambia `estado: "creado"` por `estado: "pendiente"`: observa que también rompe una expectativa semántica aunque el tipo siga siendo `string`; restaura el valor.

**Práctica guiada:** añade al contrato móvil el caso de guía duplicada. Primero crea `RF-700` dentro del propio ejemplo y después repite la petición. Exige `409`, `application/problem+json` y `title: "Guía duplicada"`; conserva el aislamiento entre pruebas para que no dependan del orden de otros archivos.

**Ejercicio independiente:** crea `contracts/almacen.contract.json` y su prueba. El almacén solo necesita `id` y `guia`, y debe ignorar campos adicionales. Demuestra que eliminar `id` rompe ese contrato, mientras añadir un campo `nota` no lo rompe. Explica por qué este resultado no prueba que todos los demás consumidores toleren `nota`.

#### Aplica

Para una operación real de creación de entregas, escribe una matriz con método, request, status, content type, campos imprescindibles, errores y significado. Añade pruebas del proveedor y un archivo de expectativas por consumidor conocido. La evidencia debe incluir una divergencia de status y otra de semántica corregidas; un documento que describe `201` mientras la API devuelve `200` no es un contrato verificado.

**Checklist de salida**

- [ ] Creaste un servidor y contratos nuevos, sin dependencias de otros ejercicios.
- [ ] Las pruebas del proveedor envían requests HTTP reales a un puerto local.
- [ ] Las expectativas del consumidor son mínimas, explícitas y ejecutables por el proveedor.
- [ ] Éxito y error comprueban status, content type y campos relevantes.
- [ ] Problem Details no expone stack traces y mantiene `status` coherente.
- [ ] Los fallos deliberados cubrieron una divergencia de status y una de significado.
- [ ] No confundiste «un consumidor lo tolera» con compatibilidad universal.

**Gestión de cambios:** intenta primero evolución aditiva y conversación con consumidores. Para un cambio incompatible justificado, define versión, deprecación, telemetría de uso, alternativa y retiro comprobado; nunca reutilices un campo con otro significado.

```mermaid
flowchart LR
  Consumer[Expectativas del consumidor] --> Request[Request de prueba]
  Request --> API[Servidor local real]
  API --> Response[Status, headers y body]
  Response --> Compare[Comparar comportamiento]
  Compare -->|cambio incompatible| Fail[Prueba falla antes de liberar]
```

**Cuándo añadir pruebas dirigidas por consumidor:** aportan valor cuando consumidores independientes dependen de partes distintas del contrato y el proveedor puede ejecutar sus expectativas. Para un cliente interno que siempre se despliega junto al servidor, una prueba de integración compartida puede ser más simple. Ninguna de las dos reemplaza autorización ni pruebas de carga.

**Proyecto integrador:** en la API de entregas conserva las expectativas reales de la app móvil y de un socio como fixtures versionados; ejecuta ambos contra el servidor local y revisa una falla de compatibilidad antes de aprobar cambios.

**Fuentes oficiales:** [OpenAPI Specification](https://swagger.io/specification/) y [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457).

### Tema 3: Reintentar sin duplicar el efecto · Avanzado · 120 min

#### Aprende

**Prerrequisitos:** SQL básico, transacciones, `async`/`await` y Docker con Docker Compose. El ejercicio usa una base PostgreSQL desechable en `127.0.0.1`; no reutiliza esquemas ni datos de otros proyectos.

**Al terminar podrás:** implementar idempotencia atómica con clave, actor, operación y hash del request; devolver respuestas repetidas estables; probar veinte requests concurrentes locales; y demostrar que transactional outbox entrega al menos una vez y requiere deduplicación en el consumidor.

**Por qué importa:** si PostgreSQL confirma un envío pero la respuesta se pierde, la app ve un timeout y reintenta. Un `POST` normal crea otro envío. La recuperación no debe convertir un resultado ambiguo en un cobro, pedido o envío duplicado.

Una clave de idempotencia identifica la **misma intención** durante los reintentos. Su identidad no es solo el texto de la cabecera: la restricción única debe incluir `actor_id`, `operation` y `key`. El `request_hash` vincula esa intención a un payload normalizado; reutilizar la clave con otro contenido devuelve `409`, no ejecuta una operación diferente bajo la identidad anterior.

«Buscar la clave y, si no existe, insertar» no es atómico: dos requests pueden observar ausencia antes de que cualquiera confirme. La reserva de la clave, el cambio de negocio, la respuesta registrada y el evento outbox deben quedar dentro de una transacción, con una restricción única como última defensa. Un reintento completado recupera exactamente el mismo status y body; una operación todavía en proceso puede responder `409` o `425` según la política definida.

```text
POST + actor A + operación crear + clave K + hash H
  -> transacción [reserva única + envío + respuesta + outbox E]
  -> reintento A/crear/K/H recupera la misma respuesta
  -> reintento A/crear/K/H2 recibe 409
```

Guardar el envío y publicar el evento en pasos independientes crea una doble escritura. Transactional outbox guarda ambos en el mismo commit. Un relay publica pendientes y puede caer después de publicar pero antes de marcar: el siguiente intento publicará otra vez. Por eso la garantía es **at-least-once**, no «exactamente una entrega». El consumidor debe guardar `event_id` junto a su efecto en otra transacción.

La retención de claves debe cubrir la ventana real de reintento. Borrar evidencia demasiado pronto vuelve posible el duplicado. Los `GET` de solo lectura o un `PUT` de reemplazo naturalmente idempotente no necesitan automáticamente esta maquinaria.

**Analogía:** una transferencia tiene un número de operación. Repetir la consulta con ese número recupera el comprobante; generar un número nuevo ordena otra transferencia. La analogía no elimina la necesidad de una restricción única y una transacción reales.

#### Practica

Crea el proyecto desde cero:

```bash
mkdir idempotencia-envios
cd idempotencia-envios
mkdir -p src/db test
```

Crea `package.json`:

```json
{
  "name": "idempotencia-envios",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test test/idempotencia.test.js"
  }
}
```

Instala el driver:

```bash
npm install pg
```

Crea `compose.yaml` con una base local y credenciales exclusivamente de laboratorio:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rutaflow
      POSTGRES_PASSWORD: laboratorio-local
      POSTGRES_DB: rutaflow
    ports:
      - "127.0.0.1:55432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rutaflow -d rutaflow"]
      interval: 1s
      timeout: 3s
      retries: 20
```

Crea `src/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS envios (
  id uuid PRIMARY KEY,
  actor_id text NOT NULL,
  guia text NOT NULL,
  direccion text NOT NULL
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  actor_id text NOT NULL,
  operation text NOT NULL,
  key text NOT NULL,
  request_hash text NOT NULL,
  status text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (actor_id, operation, key)
);

CREATE TABLE IF NOT EXISTS outbox (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  payload jsonb NOT NULL,
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS eventos_consumidos (
  event_id uuid PRIMARY KEY,
  envio_id uuid NOT NULL,
  procesado_at timestamptz NOT NULL DEFAULT now()
);
```

Crea `src/servicio.js`:

```javascript
import { createHash, randomUUID } from "node:crypto";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ??
    "postgres://rutaflow:laboratorio-local@127.0.0.1:55432/rutaflow",
  max: 10,
});

const OPERATION = "create-envio";

export async function crearEnvio({ actorId, key, payload }) {
  const normalized = { guia: payload.guia, direccion: payload.direccion };
  const requestHash = createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const reserved = await client.query(
      `INSERT INTO idempotency_keys
         (actor_id, operation, key, request_hash, status)
       VALUES ($1, $2, $3, $4, 'processing')
       ON CONFLICT DO NOTHING
       RETURNING key`,
      [actorId, OPERATION, key, requestHash],
    );

    if (reserved.rowCount === 0) {
      const saved = await client.query(
        `SELECT request_hash, status, response_status, response_body
         FROM idempotency_keys
         WHERE actor_id = $1 AND operation = $2 AND key = $3`,
        [actorId, OPERATION, key],
      );
      const previous = saved.rows[0];

      if (previous.request_hash !== requestHash) {
        await client.query("ROLLBACK");
        return {
          status: 409,
          body: { title: "La clave ya se usó con otro payload", status: 409 },
        };
      }
      if (previous.status !== "completed") {
        await client.query("ROLLBACK");
        return { status: 409, body: { title: "Operación en proceso", status: 409 } };
      }

      await client.query("COMMIT");
      return { status: previous.response_status, body: previous.response_body };
    }

    const id = randomUUID();
    const eventId = randomUUID();
    const response = {
      status: 201,
      body: { envio: { id, ...normalized } },
    };

    await client.query(
      "INSERT INTO envios(id, actor_id, guia, direccion) VALUES ($1, $2, $3, $4)",
      [id, actorId, normalized.guia, normalized.direccion],
    );
    await client.query(
      `INSERT INTO outbox(event_id, event_type, aggregate_id, payload)
       VALUES ($1, 'envio-creado', $2, $3::jsonb)`,
      [eventId, id, JSON.stringify(response.body.envio)],
    );
    await client.query(
      `UPDATE idempotency_keys
       SET status = 'completed', response_status = $4, response_body = $5::jsonb
       WHERE actor_id = $1 AND operation = $2 AND key = $3`,
      [actorId, OPERATION, key, response.status, JSON.stringify(response.body)],
    );
    await client.query("COMMIT");
    return response;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function relayOnce(publish) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const pending = await client.query(
      `SELECT event_id, event_type, aggregate_id, payload
       FROM outbox
       WHERE published_at IS NULL
       ORDER BY event_id
       FOR UPDATE SKIP LOCKED
       LIMIT 1`,
    );
    if (pending.rowCount === 0) {
      await client.query("COMMIT");
      return false;
    }

    const event = pending.rows[0];
    await publish({
      eventId: event.event_id,
      type: event.event_type,
      envioId: event.aggregate_id,
      payload: event.payload,
    });
    await client.query(
      "UPDATE outbox SET published_at = now() WHERE event_id = $1",
      [event.event_id],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function consumir(event) {
  const result = await pool.query(
    `INSERT INTO eventos_consumidos(event_id, envio_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING event_id`,
    [event.eventId, event.envioId],
  );
  return result.rowCount === 1;
}
```

Crea `test/idempotencia.test.js`:

```javascript
import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { consumir, crearEnvio, pool, relayOnce } from "../src/servicio.js";

beforeEach(async () => {
  await pool.query("TRUNCATE eventos_consumidos, outbox, idempotency_keys, envios");
});

after(async () => {
  await pool.end();
});

test("20 reintentos locales concurrentes producen un efecto y respuestas estables", async () => {
  const request = {
    actorId: "actor-1",
    key: "intento-unico-1",
    payload: { guia: "RF-20", direccion: "Calle 20" },
  };
  const responses = await Promise.all(
    Array.from({ length: 20 }, () => crearEnvio(request)),
  );

  for (const response of responses) assert.deepEqual(response, responses[0]);
  assert.equal(responses[0].status, 201);
  assert.equal(Number((await pool.query("SELECT count(*) FROM envios")).rows[0].count), 1);
  assert.equal(Number((await pool.query("SELECT count(*) FROM outbox")).rows[0].count), 1);
});

test("la misma clave con otro hash devuelve 409 sin otro envío", async () => {
  const base = { actorId: "actor-1", key: "intento-unico-2" };
  await crearEnvio({ ...base, payload: { guia: "RF-21", direccion: "Calle 21" } });
  const conflict = await crearEnvio({
    ...base,
    payload: { guia: "RF-999", direccion: "Otra dirección" },
  });
  assert.equal(conflict.status, 409);
  assert.equal(Number((await pool.query("SELECT count(*) FROM envios")).rows[0].count), 1);
});

test("outbox reenvía tras una caída y el consumidor deduplica", async () => {
  await crearEnvio({
    actorId: "actor-1",
    key: "intento-unico-3",
    payload: { guia: "RF-22", direccion: "Calle 22" },
  });
  const deliveries = [];

  await assert.rejects(relayOnce(async event => {
    deliveries.push(event);
    throw new Error("caída local después de publicar y antes de marcar");
  }));
  assert.equal(await relayOnce(async event => deliveries.push(event)), true);

  assert.equal(deliveries.length, 2);
  assert.equal(deliveries[0].eventId, deliveries[1].eventId);
  assert.equal(await consumir(deliveries[0]), true);
  assert.equal(await consumir(deliveries[1]), false);
  assert.equal(Number((await pool.query("SELECT count(*) FROM eventos_consumidos")).rows[0].count), 1);
});
```

Arranca PostgreSQL, espera su healthcheck, crea el esquema y ejecuta las pruebas:

```bash
docker compose up -d
docker compose exec -T postgres psql -U rutaflow -d rutaflow < src/db/schema.sql
npm test
```

Al terminar, detén y elimina los recursos locales del laboratorio:

```bash
docker compose down -v
```

**Resultado esperado:** tres pruebas superadas. Los veinte responses tienen el mismo `201`, `id` y body; existe un solo envío y un evento. El relay entrega dos veces el mismo `eventId` tras la caída simulada, pero `eventos_consumidos` contiene una sola fila. El experimento se limita a veinte solicitudes locales y un pool de diez conexiones; no es un benchmark ni una prueba de carga contra terceros.

**Fallo deliberado y corrección:** en el primer `INSERT INTO idempotency_keys`, elimina temporalmente `ON CONFLICT DO NOTHING`. Repite `npm test`: la restricción única sigue impidiendo claves duplicadas, pero requests concurrentes terminan con errores de unicidad en lugar de recuperar una respuesta estable. Restaura la cláusula. No elimines la primary key para «arreglar» esos errores: sin ella, una variante no atómica de buscar-e-insertar sí podría crear efectos duplicados.

**Práctica guiada:** añade una prueba en la que dos actores distintos usan la misma clave y el mismo payload. Deben crearse dos envíos, uno por actor, porque la identidad incluye `actor_id`. Después repite la misma clave con otra operación registrada explícitamente en la tabla y explica por qué `operation` también forma parte de la unicidad.

**Ejercicio independiente:** apaga y vuelve a arrancar el proceso Node sin borrar el volumen, repite una clave completada y demuestra que recupera el mismo response. Añade una consulta de expiración que solo seleccione claves anteriores a una ventana documentada; no la ejecutes como borrado automático hasta justificar que ningún cliente puede reintentar después de ese plazo.

#### Aplica

En una operación propia de cobro o creación de envío, formula el invariante: «para actor, operación y clave, existe un solo efecto y una respuesta repetible». Conserva la restricción SQL, la transacción, el hash normalizado, las consultas de conteo y la prueba local concurrente. Añade outbox en el mismo commit y una deduplicación de consumidor demostrada con una caída entre publicación y marca.

**Checklist de salida**

- [ ] La unicidad contiene actor, operación y clave; el payload queda vinculado por hash.
- [ ] Reserva, efecto, respuesta y outbox comparten una transacción.
- [ ] Veinte reintentos locales devuelven exactamente la misma respuesta y un solo efecto.
- [ ] Reutilizar la clave con otro payload devuelve `409` sin aplicar otro cambio.
- [ ] La caída del relay produce una reentrega observable del mismo `event_id`.
- [ ] El consumidor registra `event_id` y aplica una sola vez su efecto.
- [ ] El experimento es local, acotado y no se presenta como garantía de carga o de «exactly once» universal.
- [ ] Existe una política de retención alineada con la ventana de reintento.

```mermaid
flowchart TD
  Request[Request con clave estable] --> Reserve[Reservar actor, operación y clave]
  Reserve --> Tx[Transacción única]
  Tx -->|clave nueva| Effect[Aplicar efecto y guardar respuesta]
  Tx -->|misma clave y mismo hash| Replay[Repetir respuesta almacenada]
  Tx -->|misma clave y hash distinto| Conflict[Responder 409]
  Effect --> Commit[Commit antes de responder]
```

**Cuándo usar idempotencia:** úsala cuando un cliente puede reintentar después de perder una respuesta y repetir el efecto sería costoso, como cobrar o crear una entrega. No garantiza «exactly once» en cualquier sistema: delimita la clave, su duración y el efecto atómico; para publicar a otro sistema necesitas además un mecanismo recuperable como outbox y deduplicación del consumidor.

**Proyecto real:** en el servicio de cobro de la API de entregas guarda clave, hash de request, efecto y respuesta en una transacción. Prueba retry idéntico, misma clave con payload diferente y caída después del commit antes de que llegue la respuesta.

**Fuentes oficiales:** [Stripe: idempotent requests](https://docs.stripe.com/idempotency) y [node-postgres: transactions](https://node-postgres.com/features/transactions).

### Tema 4: Webhooks verificables y recuperación por reconciliación · Avanzado · 100 min

#### Aprende

**Prerrequisitos:** buffers, HMAC conceptual, JSON y pruebas con Node. El proyecto es nuevo y no utiliza la base, las claves ni los eventos del ejercicio anterior.

**Al terminar podrás:** firmar y verificar webhooks sobre bytes crudos con timestamp y versión, rechazar cuerpos alterados, firmas de longitud inválida, mensajes antiguos y replays, y reparar una entrega ausente mediante reconciliación.

**Por qué importa:** cualquiera que conozca la URL de un webhook podría simular un cobro si el receptor no autentica el contenido. Incluso un evento auténtico puede llegar dos veces o no llegar; una integración confiable necesita verificación, deduplicación y recuperación, no solo HTTPS.

El receptor debe conservar los **bytes exactos** recibidos y verificarlos antes de parsear JSON. En este esquema se firma `v1.<timestamp>.<rawBody>` con HMAC-SHA256. Firmar JSON reserializado cambia la entrada cuando varían espacios, orden o representación numérica. TLS protege el transporte; la firma autentica contenido, pero no lo cifra.

`timingSafeEqual` compara buffers en tiempo constante, pero exige igual longitud. Hay que validar el formato hexadecimal y comprobar la longitud antes de llamarlo. Un `===` entre strings puede producir el mismo booleano en pruebas funcionales y aun filtrar información por diferencias de temporización.

El timestamp firmado permite aplicar una ventana, por ejemplo cinco minutos, y limitar replays antiguos. Un `deliveryId` único detecta reenvíos dentro de la ventana de retención. La ventana de reloj y la deduplicación se complementan: ninguna sustituye a la otra. Para rotar secretos, acepta temporalmente la versión actual y la anterior sin registrar los secretos.

El emisor registra cada delivery, respuesta y próximo intento. Reintenta timeouts, errores transitorios y `429` respetando `Retry-After`, con backoff exponencial, jitter y un presupuesto máximo. No reintenta indefinidamente un `400`. Limita concurrencia por destino para no amplificar una caída. El receptor persiste antes de confirmar y procesa de forma idempotente.

Los reintentos no bastan: una reconciliación periódica compara la fuente de verdad con las entregas o proyecciones y repara ausencias. Una DLQ necesita dueño, alerta y runbook; acumular mensajes no equivale a recuperarlos. Un replay administrativo debe quedar autorizado y auditado.

**Analogía:** una entrega certificada tiene sello, fecha, número, intentos y un libro maestro. El sello autentica el sobre; el libro permite descubrir que un destinatario nunca lo recibió. Ninguno de los dos mecanismos reemplaza al otro.

#### Practica

Crea una carpeta y archivos nuevos:

```bash
mkdir webhooks-cobros
cd webhooks-cobros
mkdir src test
```

Crea `package.json`:

```json
{
  "name": "webhooks-cobros",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test test/webhook.test.js"
  }
}
```

Crea `src/webhook.js`:

```javascript
import { createHmac, timingSafeEqual } from "node:crypto";

export function firmar(rawBody, timestamp, secret) {
  return createHmac("sha256", secret)
    .update(`v1.${timestamp}.`)
    .update(rawBody)
    .digest("hex");
}

export function verificar({
  rawBody,
  timestamp,
  signature,
  deliveryId,
  secret,
  nowSeconds,
  procesados,
}) {
  const expected = createHmac("sha256", secret)
    .update(`v1.${timestamp}.`)
    .update(rawBody)
    .digest();

  if (!/^(?:[0-9a-f]{2})+$/i.test(signature)) {
    return { ok: false, reason: "signature" };
  }
  const received = Buffer.from(signature, "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return { ok: false, reason: "signature" };
  }

  const eventTime = Number(timestamp);
  if (!Number.isInteger(eventTime) || Math.abs(nowSeconds - eventTime) > 300) {
    return { ok: false, reason: "timestamp" };
  }
  if (typeof deliveryId !== "string" || deliveryId.length === 0) {
    return { ok: false, reason: "delivery" };
  }
  if (procesados.has(deliveryId)) {
    return { ok: false, reason: "replay" };
  }

  procesados.add(deliveryId);
  return { ok: true, reason: "accepted" };
}

export function reconciliar({ fuente, procesados, aplicar }) {
  const reparados = [];
  for (const event of fuente) {
    if (!procesados.has(event.id)) {
      aplicar(event);
      procesados.add(event.id);
      reparados.push(event.id);
    }
  }
  return reparados;
}
```

Crea `test/webhook.test.js`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { firmar, reconciliar, verificar } from "../src/webhook.js";

const secret = "secreto-local-de-prueba";
const nowSeconds = 1_760_000_300;
const timestamp = "1760000000";
const rawBody = Buffer.from('{ "id": "evt_1", "monto": 1500 }');

function entrada(overrides = {}) {
  return {
    rawBody,
    timestamp,
    signature: firmar(rawBody, timestamp, secret),
    deliveryId: "delivery-1",
    secret,
    nowSeconds,
    procesados: new Set(),
    ...overrides,
  };
}

test("acepta los bytes firmados y rechaza un body reserializado o alterado", () => {
  assert.deepEqual(verificar(entrada()), { ok: true, reason: "accepted" });

  const reserializado = Buffer.from(JSON.stringify(JSON.parse(rawBody.toString("utf8"))));
  assert.equal(verificar(entrada({ rawBody: reserializado })).reason, "signature");

  const alterado = Buffer.from(rawBody.toString("utf8").replace("1500", "1"));
  assert.equal(verificar(entrada({ rawBody: alterado })).reason, "signature");
});

test("rechaza un timestamp fuera de ventana aunque su HMAC sea válido", () => {
  const oldTimestamp = String(nowSeconds - 301);
  const result = verificar(entrada({
    timestamp: oldTimestamp,
    signature: firmar(rawBody, oldTimestamp, secret),
  }));
  assert.deepEqual(result, { ok: false, reason: "timestamp" });
});

test("rechaza un replay después de una entrega válida", () => {
  const procesados = new Set();
  assert.equal(verificar(entrada({ procesados })).ok, true);
  assert.deepEqual(verificar(entrada({ procesados })), { ok: false, reason: "replay" });
});

test("comprueba longitud y no lanza con una firma corta o no hexadecimal", () => {
  assert.doesNotThrow(() => verificar(entrada({ signature: "00" })));
  assert.equal(verificar(entrada({ signature: "00" })).reason, "signature");
  assert.equal(verificar(entrada({ signature: "zz" })).reason, "signature");
});

test("la reconciliación repara solo la fuente ausente", () => {
  const procesados = new Set(["evt_1"]);
  const aplicados = [];
  const reparados = reconciliar({
    fuente: [{ id: "evt_1", monto: 1500 }, { id: "evt_2", monto: 2000 }],
    procesados,
    aplicar: event => aplicados.push(event.id),
  });
  assert.deepEqual(reparados, ["evt_2"]);
  assert.deepEqual(aplicados, ["evt_2"]);
  assert.deepEqual([...procesados].sort(), ["evt_1", "evt_2"]);
});
```

Ejecuta:

```bash
npm test
```

**Resultado esperado:** cinco pruebas superadas. El cuerpo original es válido; reserializarlo, alterar un byte, envejecer el timestamp, repetir el delivery o cambiar la longitud de la firma produce un rechazo controlado. La reconciliación aplica únicamente `evt_2`.

**Fallo deliberado y corrección:** en `verificar`, reemplaza temporalmente `.update(rawBody)` por `.update(JSON.stringify(JSON.parse(rawBody.toString("utf8"))))`. La primera prueba falla incluso con la firma legítima porque el cuerpo original contiene espacios. Restaura `.update(rawBody)` y repite las pruebas. El proveedor y el receptor deben firmar los mismos bytes; la corrección no consiste en normalizar cada uno por su cuenta.

**Práctica guiada:** sustituye la comparación segura por `received.toString("hex") === signature` después de la comprobación de longitud. Las pruebas funcionales seguirán verdes, lo que demuestra que no miden el canal lateral de temporización. Restaura `timingSafeEqual(received, expected)`, conserva la validación de longitud y registra en una nota por qué una salida booleana correcta no acredita una comparación segura.

**Ejercicio independiente:** crea manualmente `src/politica-reintentos.js` y `test/politica-reintentos.test.js`. Implementa una función pura que reciba un resultado (`400`, `429` con `Retry-After`, timeout o `503`), intento y aleatorio inyectado. Debe no reintentar `400`, respetar `Retry-After`, acotar backoff con jitter y devolver un destino DLQ al agotar cinco intentos. Prueba cada rama sin red ni esperas reales y añade un runbook con responsable, inspección y replay auditado.

#### Aplica

En un receptor propio de confirmación de cobros, captura el body crudo antes de cualquier middleware JSON. Registra versión de firma, timestamp, delivery ID y resultado sin guardar secretos. Demuestra por separado autenticidad, ventana temporal, replay y reconciliación de un evento perdido; ambos caminos de entrega deben converger al mismo estado sin duplicar el cobro aplicado.

**Checklist de salida**

- [ ] HMAC cubre versión, timestamp y los bytes crudos exactos.
- [ ] La verificación ocurre antes de parsear o aplicar el evento.
- [ ] `timingSafeEqual` solo se llama después de validar formato e igual longitud.
- [ ] Un timestamp antiguo y un replay tienen diagnósticos y pruebas propios.
- [ ] El cuerpo alterado y el cuerpo reserializado se rechazan.
- [ ] La reconciliación compara fuente y proyección y repara solo ausencias.
- [ ] La política de reintento distingue permanente, rate limit y transitorio.
- [ ] DLQ y replay tienen responsable, autorización, auditoría y procedimiento.

```mermaid
flowchart LR
  Bytes[Bytes crudos y headers] --> Verify[Verificar firma, versión y ventana]
  Verify -->|inválido| Reject[Rechazar sin aplicar]
  Verify -->|válido| Dedup[Deduplicar delivery]
  Dedup --> Apply[Aplicar evento una sola vez]
  Source[Fuente autoritativa] --> Reconcile[Reconciliar proyección]
  Reconcile --> Repair[Reparar evento ausente]
```

**Proyecto real:** conecta un proveedor de pagos simulado con la API de entregas: conserva el body crudo, registra deliveries procesados y añade una tarea local de reconciliación que detecta un evento omitido. Documenta qué operaciones requieren autorización para reproducir un mensaje.

**Fuentes oficiales:** [Node.js: `crypto.timingSafeEqual`](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b) y [GitHub: validating webhook deliveries](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries).

### Tema 5: OpenAPI como contrato ejecutable · Avanzado · 100 min

#### Aprende

**Prerrequisitos:** YAML, JSON Schema básico, HTTP y pruebas con `fetch`. Este proyecto parte de otra carpeta vacía; no reutiliza el servidor ni los contratos de comportamiento anteriores.

**Al terminar podrás:** escribir un documento OpenAPI 3.1 completo para una consulta de entregas, ejecutar lint, validar responses reales contra sus schemas y conservar una comprobación local de compatibilidad para las expectativas declaradas de un consumidor.

**Por qué importa:** web, Flutter y socios externos pueden generar clientes a partir del mismo archivo. Cambiar `trackingCode` por `tracking_code` puede romperlos aunque el lint siga verde. OpenAPI se vuelve útil cuando el documento es sintácticamente válido, la implementación lo cumple y los cambios se comparan con expectativas previas.

OpenAPI describe operaciones, parámetros, seguridad, cuerpos, respuestas y schemas. `operationId` da una identidad estable a la operación; `schema` define forma y restricciones; las respuestas de error evitan que cada cliente improvise. Swagger UI puede presentar el documento, pero una interfaz visual no es validación.

Un contrato ejecutable necesita tres controles distintos:

1. **Lint:** detecta documentos inválidos o problemas de estructura OpenAPI.
2. **Pruebas de implementación:** comparan responses reales con los schemas y content types publicados.
3. **Compatibilidad:** compara la versión nueva con expectativas anteriores o de consumidores. Un documento distinto puede seguir siendo lint-valid y aun ser incompatible.

La dirección del dato importa. En una respuesta, retirar un campo usado, cambiar su tipo o agregar un valor de enum puede romper un consumidor exhaustivo. En un request, exigir de pronto un campo nuevo suele ser incompatible. Añadir un campo opcional de respuesta solo es compatible si los consumidores toleran propiedades desconocidas; `additionalProperties: false` muestra que no todos lo hacen. No existe una regla universal separada de esos consumidores.

El comprobador de compatibilidad de esta práctica es deliberadamente limitado: conserva campos de respuesta que un consumidor declaró y exige estabilidad del enum `status`. No sustituye una herramienta completa de diff ni pruebas con todos los clientes.

**Analogía:** OpenAPI es el plano firmado de un edificio. Swagger UI es una vista del plano; el lint revisa que el plano esté bien formado, las pruebas inspeccionan la construcción y la comparación de versiones pregunta si una reforma bloquea una puerta que alguien ya usa.

#### Practica

Crea el proyecto independiente:

```bash
mkdir openapi-entregas
cd openapi-entregas
mkdir src test contracts
```

Crea `package.json`:

```json
{
  "name": "openapi-entregas",
  "private": true,
  "type": "module",
  "scripts": {
    "lint": "redocly lint src/openapi.yaml",
    "test": "node --test test/*.test.js",
    "check": "npm run lint && npm test"
  }
}
```

Instala las herramientas:

```bash
npm install ajv ajv-formats yaml
npm install --save-dev @redocly/cli
```

Crea `src/openapi.yaml`:

```yaml
openapi: 3.1.0
info:
  title: Delivery API
  version: 1.0.0
paths:
  /deliveries/{id}:
    get:
      operationId: getDelivery
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Entrega encontrada
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Delivery"
        "404":
          description: Entrega inexistente
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/Problem"
components:
  schemas:
    Delivery:
      type: object
      additionalProperties: false
      required: [id, trackingCode, status]
      properties:
        id:
          type: string
          format: uuid
        trackingCode:
          type: string
          minLength: 6
        status:
          type: string
          enum: [created, assigned, in_transit, delivered]
    Problem:
      type: object
      additionalProperties: false
      required: [type, title, status, detail, instance]
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
```

Crea `src/server.js`:

```javascript
import { createServer } from "node:http";

const delivery = Object.freeze({
  id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  trackingCode: "RF-9000",
  status: "created",
});

function responder(res, status, body, contentType) {
  res.writeHead(status, { "Content-Type": `${contentType}; charset=utf-8` });
  res.end(JSON.stringify(body));
}

export function createApp() {
  return createServer((req, res) => {
    const match = req.method === "GET" && req.url?.match(/^\/deliveries\/([^/]+)$/);
    if (!match) {
      return responder(res, 404, {
        type: "about:blank",
        title: "Entrega inexistente",
        status: 404,
        detail: "No existe la entrega solicitada",
        instance: req.url ?? "/deliveries",
      }, "application/problem+json");
    }

    if (match[1] !== delivery.id) {
      return responder(res, 404, {
        type: "about:blank",
        title: "Entrega inexistente",
        status: 404,
        detail: "No existe la entrega solicitada",
        instance: req.url,
      }, "application/problem+json");
    }

    return responder(res, 200, delivery, "application/json");
  });
}
```

Crea `test/openapi.test.js`:

```javascript
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import YAML from "yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { createApp } from "../src/server.js";

const document = YAML.parse(await readFile(
  new URL("../src/openapi.yaml", import.meta.url),
  "utf8",
));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateDelivery = ajv.compile(document.components.schemas.Delivery);
const validateProblem = ajv.compile(document.components.schemas.Problem);

let server;
let baseUrl;

before(async () => {
  server = createApp();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await once(server, "close");
});

test("el 200 real cumple Delivery y su content type", async () => {
  const id = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
  const response = await fetch(`${baseUrl}/deliveries/${id}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  const body = await response.json();
  assert.equal(validateDelivery(body), true, JSON.stringify(validateDelivery.errors));
});

test("el 404 real cumple Problem", async () => {
  const id = "00000000-0000-4000-8000-000000000000";
  const response = await fetch(`${baseUrl}/deliveries/${id}`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type"), /^application\/problem\+json/);
  const body = await response.json();
  assert.equal(validateProblem(body), true, JSON.stringify(validateProblem.errors));
});
```

Crea `contracts/consumidor-base.json`:

```json
{
  "consumer": "portal-de-seguimiento",
  "operationId": "getDelivery",
  "successStatus": "200",
  "requiredFields": ["id", "trackingCode", "status"],
  "knownFields": ["id", "trackingCode", "status"],
  "statusEnum": ["created", "assigned", "in_transit", "delivered"]
}
```

Crea `test/compatibilidad.test.js`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import YAML from "yaml";

const document = YAML.parse(await readFile(
  new URL("../src/openapi.yaml", import.meta.url),
  "utf8",
));
const baseline = JSON.parse(await readFile(
  new URL("../contracts/consumidor-base.json", import.meta.url),
  "utf8",
));

test("conserva la respuesta que el portal declaró consumir", () => {
  const operation = document.paths["/deliveries/{id}"].get;
  assert.equal(operation.operationId, baseline.operationId);
  const response = operation.responses[baseline.successStatus];
  assert.ok(response, "desapareció el status usado por el consumidor");
  assert.ok(operation.responses["404"], "desapareció el error documentado");
  assert.equal(response.content["application/json"].schema.$ref, "#/components/schemas/Delivery");

  const schema = document.components.schemas.Delivery;
  for (const field of baseline.requiredFields) {
    assert.ok(schema.required.includes(field), `${field} dejó de ser requerido`);
  }
  for (const field of baseline.knownFields) {
    assert.ok(schema.properties[field], `${field} desapareció o fue renombrado`);
  }
  assert.deepEqual(
    schema.properties.status.enum,
    baseline.statusEnum,
    "el enum observable cambió y requiere revisar consumidores exhaustivos",
  );
});
```

Ejecuta los tres controles locales:

```bash
npm run check
```

**Resultado esperado:** Redocly no reporta errores de lint y Node reporta tres pruebas superadas: dos responses reales válidas y una comparación con la línea base del portal. Este comando local no afirma que se haya ejecutado CI ni que la API se haya desplegado.

**Fallo deliberado y corrección:** en `src/openapi.yaml`, renombra temporalmente `trackingCode` a `tracking_code` tanto en `required` como en `properties`, sin tocar el servidor. El lint puede seguir aceptando el documento, pero `compatibilidad.test.js` falla porque el campo consumido desapareció. Restaura el nombre. Después añade una propiedad `interno` al JSON del servidor sin declararla: la prueba del `200` falla porque `additionalProperties: false`; retírala y vuelve a ejecutar `npm run check`.

**Práctica guiada:** añade un ejemplo completo de `Delivery` dentro del schema y valida ese ejemplo con Ajv en una prueba nueva. Incluye un `404` de ejemplo y comprueba también que ninguno tenga propiedades internas. El objetivo es que ejemplos, documento e implementación no evolucionen por caminos separados.

**Ejercicio independiente:** documenta e implementa `POST /deliveries` en este mismo proyecto, con `201`, `400`, `409`, Problem Details y cabecera `Idempotency-Key`. Añade pruebas reales para cada respuesta. Clasifica por escrito estos cambios: eliminar `trackingCode`, hacer obligatorio un nuevo campo de request, añadir un valor a `status`, añadir una propiedad opcional de respuesta y corregir una descripción. Justifica la dirección del dato y qué consumidor podría romperse en cada caso.

#### Aplica

Para una consulta pública de entregas, versiona el archivo OpenAPI junto con la implementación y conserva tres evidencias locales: lint, responses válidas y compatibilidad con una línea base de consumidor. No generes un SDK hasta que esas comprobaciones pasen. Si ya generas schemas desde una única fuente de verdad, evita mantener una segunda descripción manual divergente.

**Checklist de salida**

- [ ] Creaste OpenAPI, servidor, pruebas y línea base desde una carpeta vacía.
- [ ] `operationId`, parámetros, content types, éxito y errores están declarados.
- [ ] El lint y las pruebas de responses son controles separados.
- [ ] Ajv valida el JSON real y los formatos usados por el schema.
- [ ] La prueba de compatibilidad conserva campos y enum observados por un consumidor.
- [ ] El fallo deliberado demostró que lint-valid no significa compatible.
- [ ] Distingues cambios de request y response y no prometes compatibilidad universal.
- [ ] No expones campos internos por reutilizar directamente una entidad de persistencia.

**Cuándo no añadirlo:** para un endpoint interno con un solo consumidor que cambia y se despliega junto con el servidor, un contrato formal puede aportar menos que una prueba compartida. El coste cambia cuando existen consumidores independientes o versiones móviles antiguas.

```mermaid
flowchart LR
  Contract[OpenAPI versionado] --> Lint[Lint del documento]
  Server[Servidor local] --> Traffic[Requests y responses reales]
  Contract --> Schema[Validar tráfico con schemas]
  Traffic --> Schema
  Consumer[Baseline de consumidor] --> Diff[Comparación de compatibilidad]
  Schema --> Gate[Gate de release]
  Diff --> Gate
```

**Proyecto real:** versiona el contrato de la API de entregas junto con la implementación, valida responses reales y conserva una baseline del cliente móvil. Si un cambio rompe un campo o enum usado, detén la publicación hasta acordar migración y evidencia de consumidores.

**Fuentes oficiales:** [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0.html), [OpenAPI Specification, versión vigente](https://spec.openapis.org/oas/latest.html) y [Redocly CLI](https://redocly.com/docs/cli/).

## Laboratorio práctico

### Proyecto: API contractual con efectos recuperables

Construye desde una carpeta vacía `rutaflow-confiable/`, sin copiar archivos de los proyectos anteriores ni de ejemplos de la academia. La vertical será «crear una tarea de entrega y notificarla». Usa Node.js LTS, TypeScript estricto, zod, PostgreSQL local, Redocly y `node:test`; todos los requests, webhooks, consumidores y experimentos concurrentes se ejecutan localmente. No uses credenciales reales ni endpoints de terceros.

Crea manualmente esta estructura y completa cada archivo con la responsabilidad indicada:

```text
rutaflow-confiable/
├── compose.yaml
├── package.json
├── tsconfig.json
├── contracts/
│   ├── openapi.yaml
│   ├── consumidor-movil.json
│   └── consumidor-base.json
├── src/
│   ├── config.ts
│   ├── server.ts
│   ├── schemas.ts
│   ├── application.ts
│   ├── db/
│   │   ├── schema.sql
│   │   └── idempotencia.ts
│   ├── outbox.ts
│   ├── webhook.ts
│   ├── reconciliacion.ts
│   └── reintentos.ts
├── test/
│   ├── frontera.test.ts
│   ├── proveedor.test.ts
│   ├── consumidor.test.ts
│   ├── openapi.test.ts
│   ├── compatibilidad.test.ts
│   ├── idempotencia.test.ts
│   ├── outbox.test.ts
│   ├── webhook.test.ts
│   └── reconciliacion.test.ts
└── RUNBOOK.md
```

**Contenido y construcción por hitos**

1. **Base estricta y configuración.** En `tsconfig.json` activa `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. En `config.ts` parsea `process.env` como `unknown`, exige `DATABASE_URL` y un secreto de laboratorio, y no imprimas secretos. En `schemas.ts` separa `CreateTaskInput`, comando de aplicación y entidad persistente. No uses `any`, `@ts-ignore` ni non-null assertions.
2. **Frontera HTTP.** En `server.ts` implementa `POST /tareas` y `GET /tareas/:id`. Conserva el body crudo para poder validarlo, parsea JSON como `unknown` y aplica el schema antes del caso de uso. Devuelve `201`, `400`, `404`, `409` y Problem Details coherentes.
3. **Comportamiento proveedor/consumidor.** En `consumidor-movil.json` registra los campos mínimos de la app. En `proveedor.test.ts` comprueba las promesas generales; en `consumidor.test.ts` ejecuta los ejemplos móviles. Incluye una prueba semántica del estado inicial `creada`, no solo su tipo.
4. **OpenAPI ejecutable.** En `openapi.yaml` documenta requests, responses, autenticación de laboratorio, rate limit y Problem Details. En `openapi.test.ts` valida responses reales. En `consumidor-base.json` guarda campos y enums usados; en `compatibilidad.test.ts` impide retirarlos o cambiarlos sin revisión. Declara los límites de ese comprobador.
5. **Idempotencia atómica.** En `schema.sql` crea tareas, claves, outbox y eventos consumidos. La primary key de idempotencia será `(actor_id, operation, key)`; guarda `request_hash`, status y response completos. En `idempotencia.ts`, reserva clave, crea tarea, registra respuesta y escribe outbox en una sola transacción. Un hash distinto devuelve `409`.
6. **Outbox recuperable.** En `outbox.ts`, implementa un relay que seleccione un pendiente con lock, publique a un consumidor local inyectado y después marque. Si falla antes de marcar, la transacción vuelve atrás y permite reentrega. El consumidor deduplica por `event_id` junto a su efecto.
7. **Webhook y reconciliación.** En `webhook.ts`, firma `v1.<timestamp>.<rawBody>`, comprueba longitud antes de `timingSafeEqual`, aplica una ventana de cinco minutos y deduplica delivery IDs. En `reconciliacion.ts`, compara la fuente local con la proyección y repara ausencias. En `reintentos.ts`, clasifica `400`, `429`, timeout y `503` con presupuesto máximo y DLQ.
8. **Operación escrita.** En `RUNBOOK.md` documenta invariantes, estados de idempotencia y outbox, métricas, rotación de secreto, retención, alertas, dueño de DLQ, replay administrativo autorizado y auditoría. Incluye comandos de recuperación y criterios para no reintentar indefinidamente.

En `package.json` define manualmente scripts equivalentes a:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint:openapi": "redocly lint contracts/openapi.yaml",
    "test": "tsx --test test/*.test.ts",
    "check": "npm run typecheck && npm run lint:openapi && npm test"
  }
}
```

Arranca únicamente la infraestructura local, aplica el schema y ejecuta la verificación:

```bash
docker compose up -d
docker compose exec -T postgres psql -U rutaflow -d rutaflow < src/db/schema.sql
npm run check
```

**Resultado esperado:** typecheck y lint terminan sin errores; todas las pruebas locales pasan. Las consultas SQL muestran una tarea, un evento outbox y un efecto consumido para una misma intención. Repetir la petición devuelve el mismo status y body. Este resultado esperado describe lo que debes observar al ejecutarlo; no afirma que el laboratorio ya se haya ejecutado, integrado en CI o desplegado.

**Fallo deliberado y corrección:** ejecuta veinte requests locales concurrentes con la misma clave, actor, operación y payload. Después inyecta una caída del relay inmediatamente después de publicar y antes de marcar. Deben observarse dos entregas del mismo `event_id`, una tarea y un solo efecto consumido. Si aparecen dos tareas, detén el experimento y revisa unicidad y transacción; si aparecen dos efectos, revisa deduplicación. Restaura el relay normal y repite la comprobación con el límite de veinte requests.

**Práctica guiada:** firma un webhook local con un body que contiene espacios significativos. Verifica el original, uno reserializado, uno con timestamp de seis minutos de antigüedad, una firma hexadecimal corta y un replay. Corrige cada rechazo por la causa apropiada —bytes, ventana, formato o deduplicación— sin desactivar todos los controles para aceptar el evento.

**Ejercicio independiente:** elimina de la proyección local una notificación que sí existe en la fuente. Ejecuta reconciliación y demuestra que repara solo esa ausencia. Después propón un cambio OpenAPI compatible para el consumidor móvil y otro incompatible, ejecuta la comparación y documenta qué evidencia adicional necesitarías antes de una migración o retiro.

**Criterios de aceptación observables**

- [ ] Todos los archivos del laboratorio fueron creados manualmente en un proyecto nuevo.
- [ ] TypeScript estricto no se usa como sustituto de validación runtime.
- [ ] Requests, responses, errores y semántica tienen pruebas de proveedor y consumidor.
- [ ] OpenAPI pasa lint, valida tráfico real y conserva expectativas de compatibilidad declaradas.
- [ ] La clave incluye actor, operación y hash; veinte reintentos producen un solo efecto y respuestas estables.
- [ ] Outbox demuestra at-least-once y el consumidor demuestra deduplicación.
- [ ] El webhook valida bytes crudos, timestamp, replay, longitud y comparación segura.
- [ ] Reconciliación y replay administrativo recuperan ausencias con auditoría.
- [ ] Los experimentos son locales y acotados; no hay afirmaciones de CI, despliegue ni «exactly once» universal.
- [ ] Otra persona puede seguir el runbook y explicar qué evidencia falta para una revisión pedagógica o profesional.

**Errores comunes y soluciones:** parsea en lugar de usar `as Tipo`; ejecuta contratos en lugar de solo publicar documentación; coordina clave, efecto, respuesta y outbox en una transacción; firma bytes crudos en lugar de JSON reserializado; clasifica reintentos y asigna un procedimiento real a la DLQ.

**Referencia general del runtime:** [documentación oficial de Node.js](https://nodejs.org/api/).

## Atlas completo de temas oficiales

Este atlas sirve para localizar áreas de la plataforma, no sustituye las cinco prácticas del módulo ni afirma que cada tema sea una lección independiente. El baseline consultado el 1 de noviembre de 2026 es **Node.js 24 LTS y Node.js 26 LTS**; las versiones admitidas pueden cambiar y deben comprobarse antes de fijar una versión de producción. La nota de lanzamiento de Node.js 26 documenta que **Temporal** quedó habilitado por defecto en esa versión.

| Área | Temas |
|---|---|
| Runtime | event loop; timers; microtasks; EventEmitter; buffers; streams; backpressure; ESM y CommonJS |
| Sistema | filesystem; paths y URLs; procesos; señales; child_process; worker_threads; cluster; permission model |
| Red | HTTP/HTTPS; HTTP/2; DNS; TCP/UDP; TLS; proxies; timeouts; Web APIs compatibles |
| Datos | SQLite; serialización; compresión; crypto; blobs; variables de entorno; configuración validada |
| Calidad | node:test; mocks; coverage; benchmarks; diagnostics_channel; AsyncLocalStorage; inspector; heap snapshots |
| Producción | TypeScript; package exports; semver; seguridad de dependencias; graceful shutdown; observabilidad; idempotencia |

**Fuentes primarias:** [documentación de la API de Node.js](https://nodejs.org/api/), [calendario y estado de las versiones](https://nodejs.org/en/about/previous-releases), [anuncio de Node.js 26.0.0 y Temporal](https://nodejs.org/en/blog/release/v26.0.0).
