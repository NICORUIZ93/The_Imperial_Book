# Módulo 13: TypeScript, contratos e integraciones confiables

Una API puede compilar, pasar pruebas y aun romper consumidores o duplicar cobros. La red entrega bytes, no objetos TypeScript; los clientes reintentan cuando desconocen el resultado; una publicación puede separarse accidentalmente del cambio en base. Este módulo convierte esas incertidumbres en contratos e invariantes comprobables.


## Aprende construyendo

### Tema 1: Tipos estáticos dentro, datos desconocidos en la frontera

#### Paso 1 · Objetivo y preparación
Al finalizar vas a validar el body de `POST /envios` con un schema de zod en el borde de la API de RutaFlow, confirmando que un cast de TypeScript nunca sustituye esa validación real. Prerrequisitos: Módulo 5 completo.

#### Paso 2 · Contexto y caso real
El body de una petición HTTP llega como `unknown` en tiempo de ejecución, sin importar cuán estricto sea el tipo declarado en el código — TypeScript se elimina al compilar, y un `req.body as CreateEnvioInput` no transforma ni valida nada, solo le ordena al compilador confiar.

#### Paso 3 · Teoría, modelo mental y analogía
Los datos de HTTP, variables de entorno y colas empiezan como `unknown` y deben cruzar un parser explícito antes de convertirse en un tipo del dominio — TypeScript revisa el plano dentro de la fábrica, pero el muelle de recepción necesita inspeccionar cada cargamento igual.

#### Paso 4 · Demostración guiada desde cero

Crea `src/schemas/create-envio.ts` en tu proyecto Node y ejecuta npm para validar. El parser con zod de forma explícita valida en tiempo de ejecución:

```typescript
import { z } from 'zod';

const CreateEnvioInput = z.object({
  guia: z.string().regex(/^RF-\d+$/),
  direccion: z.string().trim().min(1).max(200),
}).strict();

function parseCreateEnvio(value: unknown) {
  return CreateEnvioInput.parse(value);
}
```

**Ejecuta el ejemplo** (monta el proyecto Node y córrelo):

```bash
npm init -y && npm install
node index.js
```
Para las pruebas: `npm test`.

Resultado esperado: llamar a `parseCreateEnvio({ guia: 'RF-4471', direccion: 'Calle 10' })` devuelve el objeto tipado; llamar con `{ guia: 'XX', direccion: '' }` lanza un error de zod detallando qué campo falló, antes de que ese dato toque ninguna lógica de negocio real. Prueba ejecutando `npm test` con este parser.

#### Paso 5 · Práctica guiada
Pista: reemplazá `CreateEnvioInput.parse(value)` por `value as CreateEnvioInput` directamente en el handler — ese es el fallo deliberado: enviá un body `{ guia: 123, direccion: null }`; el cast compila sin error, y el código sigue ejecutándose con `guia` siendo un número y `direccion` siendo `null`, un comportamiento incorrecto silencioso en vez de un rechazo explícito con `400`.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `CreateEnvioInput.parse(value)`, y agregá una unión discriminada (`CrearEnvioResultado`) que modele explícitamente los casos `creado`, `guia-duplicada` y `direccion-invalida`, con un `switch` exhaustivo que el compilador verifique.

#### Paso 7 · Cierre y evidencia
Entregá el parser con zod del Paso 4, el cast silencioso que oculta datos corruptos del Paso 5, y la unión discriminada exhaustiva del Paso 6; explicá por qué un cast de TypeScript nunca reemplaza la validación en tiempo de ejecución que un parser real sí hace. Siguiente paso: estudia por qué un contrato HTTP es comportamiento, no solo documentación. Errores comunes: usar `any` o un cast amplio para "resolver" un error de tipos sin validar realmente, confiar en que el frontend ya validó el mismo dato, y no distinguir entre un error de formato y una regla de negocio. Fuentes oficiales: https://zod.dev/ y https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#using-unknown-in-catch-variables.

**¿Por qué es importante?** Muchas APIs "tipadas" fallan con datos reales porque el compilador nunca observó el JSON, la configuración o la respuesta externa que efectivamente llega en producción.
**Conceptos clave:** TypeScript, strict, unknown, any, narrowing, discriminated union, branded type, Result, exhaustividad, validación runtime, DTO, dominio y frontera.

TypeScript comprueba el programa durante desarrollo y luego se elimina. Un cast `body as CreateTask` no transforma ni valida el JSON: solo ordena al compilador confiar. Los datos de HTTP, variables de entorno, base sin tipar y colas empiezan como `unknown` y deben cruzar un parser explícito.

```typescript
import { z } from 'zod';

const CreateTaskInput = z.object({
  title: z.string().trim().min(1).max(120),
  dueAt: z.string().datetime({ offset: true }).optional(),
}).strict();

type CreateTaskInput = z.infer<typeof CreateTaskInput>;

function parseCreateTask(value: unknown): CreateTaskInput {
  return CreateTaskInput.parse(value);
}
```

Validar forma no completa reglas de dominio. “Título requerido” pertenece a entrada; “no crear más de N tareas activas para el plan” requiere estado y vive en un caso de uso. Separa DTO, comando de dominio y entidad persistente para no acoplar cada capa a Prisma.

Uniones discriminadas modelan resultados esperables sin usar excepciones para todo:

```typescript
type CreateResult =
  | { kind: 'created'; task: Task }
  | { kind: 'quota-exceeded'; limit: number }
  | { kind: 'duplicate'; task: Task };

function toHttp(result: CreateResult): HttpResponse {
  switch (result.kind) {
    case 'created': return { status: 201, body: result.task };
    case 'quota-exceeded': return { status: 409, body: { limit: result.limit } };
    case 'duplicate': return { status: 200, body: result.task };
    default: return assertNever(result);
  }
}
```

La exhaustividad hace visible un nuevo estado al compilar. Tipos de marca pueden impedir mezclar `TaskId` y `UserId`, pero deben crearse tras validar. Evita `any`, `!` y casts amplios: silencian precisamente la evidencia buscada.

**Analogía:** TypeScript revisa el plano dentro de la fábrica. El muelle de recepción aún necesita inspeccionar cada cargamento; una etiqueta escrita por el proveedor no garantiza su contenido.

**¿Por qué es importante?** porque muchas APIs “tipadas” fallan con datos reales al confiar en JSON, configuración o respuestas externas que el compilador nunca observó.

**Casos de uso reales:** body HTTP, claims JWT, configuración, eventos antiguos, respuesta de proveedor, migración de esquema y campos opcionales.

**Diagrama:**

```text
bytes/JSON -> unknown -> schema runtime -> DTO válido -> caso de uso -> dominio
                         error 400                         resultado exhaustivo
TypeScript protege dentro de la frontera; el parser protege la frontera
```

```mermaid
flowchart LR
    A[Request HTTP: unknown] --> B{Schema zod .parse}
    B -->|válido| C[DTO tipado del dominio]
    B -->|inválido| D[400 con detalle de campo]
    C --> E[Caso de uso]
```

**Cuándo NO conviene validar con zod en cada capa:** si un valor ya fue validado y convertido a un tipo del dominio en la frontera (Paso 4), volver a parsearlo con el mismo schema en cada función interna que lo recibe es redundante — el límite correcto es validar una sola vez en el borde (HTTP, cola, proceso externo) y confiar en el tipo del dominio de ahí en adelante, no repetir el parseo en cada capa intermedia.

En el proyecto integrador RutaFlow (`src/schemas/create-envio.ts`), este parser es exactamente el punto único de validación para `POST /envios`: todo el resto del backend de RutaFlow confía en el tipo `CreateEnvioInput` ya validado, sin volver a parsear ese mismo dato en el caso de uso ni en el repositorio.

### Tema 2: Un contrato HTTP es comportamiento, no solo documentación

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir el contrato OpenAPI de `POST /envios` de RutaFlow, incluyendo la respuesta de error con Problem Details, y a verificarlo contra la implementación real. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
El equipo de frontend de RutaFlow generó un cliente a partir de un documento OpenAPI escrito hace meses — nadie confirmó todavía que ese documento sigue describiendo lo que la API realmente devuelve hoy.

#### Paso 3 · Teoría, modelo mental y analogía
OpenAPI describe rutas, cuerpos y respuestas, pero debe verificarse contra la aplicación real; un documento desactualizado es más peligroso que no tener documento, porque induce confianza falsa.

#### Paso 4 · Demostración guiada desde cero

Crea `docs/openapi.yaml` en la raíz de tu proyecto Node y ejecuta npm para ejecutar pruebas de contrato:

```yaml
/envios:
  post:
    operationId: crearEnvio
    requestBody:
      required: true
      content:
        application/json:
          schema: { $ref: '#/components/schemas/CreateEnvioInput' }
    responses:
      '201': { description: Creado }
      '400':
        description: Entrada inválida
        content:
          application/problem+json:
            schema: { $ref: '#/components/schemas/Problem' }
```

**Ejecuta el ejemplo** (monta el proyecto Node y córrelo):

```bash
npm init -y && npm install
node index.js
```
Para las pruebas: `npm test`.

Resultado esperado: un test de contrato que envía requests reales contra la API y compara la respuesta contra este documento pasa en verde mientras ambos coincidan — y falla explícitamente en CI en cuanto alguien cambia la forma real de la respuesta sin actualizar el documento. Ejecuta `npm run test:contract` para validar.

#### Paso 5 · Práctica guiada
Pista: cambiá la implementación real para que `POST /envios` devuelva `200` en vez de `201` al crear exitosamente, sin actualizar el documento OpenAPI — ese es el fallo deliberado: el documento sigue "describiendo" `201`, un SDK generado a partir de él puede manejar incorrectamente la respuesta real `200`, y nadie lo nota hasta que un cliente específico falla en producción.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 agregando una prueba de contrato en CI que contraste la respuesta real contra el OpenAPI en cada build, confirmando que ahora esa divergencia rompe el build inmediatamente.

#### Paso 7 · Cierre y evidencia
Entregá el contrato OpenAPI del Paso 4, la divergencia silenciosa entre código real y documento del Paso 5, y la prueba de contrato en CI del Paso 6; explicá por qué "escribir el documento" no es suficiente sin un mecanismo que lo verifique continuamente contra el comportamiento real. Siguiente paso: estudia cómo reintentar sin duplicar el efecto. Errores comunes: generar OpenAPI y nunca verificarlo contra tráfico real, cambiar el comportamiento de un endpoint sin actualizar su contrato, y reutilizar un campo existente con un significado nuevo en vez de agregar uno nuevo. Fuentes oficiales: https://swagger.io/specification/ y https://www.rfc-editor.org/rfc/rfc9457.

**¿Por qué es importante?** Equipos despliegan independientemente; sin un contrato ejecutable y verificado, un cambio local "verde" puede romper aplicaciones que no están en el mismo repositorio.
**Conceptos clave:** OpenAPI, schema, operación, status, content type, Problem Details, versionado, compatibilidad hacia atrás, consumer, provider, contract test, deprecación y sunset.

OpenAPI describe rutas, parámetros, seguridad, cuerpos y respuestas. Puede escribirse primero o generarse desde una fuente común, pero debe verificarse contra la aplicación. Un documento desactualizado es más peligroso que no tenerlo porque induce confianza falsa.

Define cada respuesta relevante, incluidos errores. RFC Problem Details ofrece una forma consistente sin exponer stack:

```yaml
/tasks:
  post:
    operationId: createTask
    requestBody:
      required: true
      content:
        application/json:
          schema: { $ref: '#/components/schemas/CreateTask' }
    responses:
      '201': { description: Creada }
      '400':
        description: Entrada inválida
        content:
          application/problem+json:
            schema: { $ref: '#/components/schemas/Problem' }
```

Agregar un campo opcional suele ser compatible, pero no siempre: un consumidor con parser estricto puede rechazarlo. Cambiar orden, precisión, significado o enum puede romper sin cambiar tipo. La compatibilidad es propiedad observada entre proveedor y consumidores, no una lista universal.

Las pruebas del proveedor verifican que sus respuestas cumplen OpenAPI. Las pruebas dirigidas por consumidor registran ejemplos mínimos que cada consumidor necesita y el proveedor los ejecuta en CI. Ninguna sustituye pruebas funcionales ni conversación sobre semántica.

Versiona solo ante cambios incompatibles justificados. Primero intenta evolución aditiva, período de deprecación, telemetría de uso y comunicación. Nunca reutilices un campo con significado nuevo. Publica fecha de retiro y alternativa, y comprueba que los clientes migraron.

**Analogía:** el contrato de un enchufe especifica forma y voltaje. Un dibujo bonito que no coincide con la pared no ayuda; cambiar voltaje sin cambiar forma es aún peor porque parece compatible.

**¿Por qué es importante?** porque equipos despliegan independientemente. Sin contrato ejecutable, un cambio local “verde” puede romper aplicaciones que no están en el mismo repositorio.

**Casos de uso reales:** SDK generado, app móvil con versiones antiguas, API pública, integración interna, gateway, deprecación de campo y formato uniforme de errores.

**Diagrama:**

```text
OpenAPI -> valida request/response del proveedor
    |
    `-> genera ejemplos/cliente
consumidor -> expectativas mínimas -> contract tests -> CI proveedor
telemetría de uso -> deprecación -> sunset comprobado
```

```mermaid
flowchart TD
    A[docs/openapi.yaml] --> B[Contract test: request real]
    B --> C{Respuesta coincide con el contrato?}
    C -->|Sí| D[Build pasa]
    C -->|No| E[Build falla en CI antes de desplegar]
```

**Cuándo NO conviene escribir OpenAPI a mano:** si el equipo ya genera el schema automáticamente desde los tipos TypeScript o desde zod (como el `CreateEnvioInput` del Tema 1), mantener un `openapi.yaml` escrito y actualizado manualmente en paralelo introduce el mismo riesgo de divergencia que este tema busca prevenir — el límite correcto es generar el contrato desde una única fuente de verdad, nunca mantener dos descripciones manuales del mismo endpoint.

En el proyecto integrador RutaFlow (`docs/openapi.yaml`), este contrato describe exactamente `POST /envios`, y el test de contrato en CI lo verifica contra la implementación real en cada build, antes de que el frontend de RutaFlow consuma un SDK generado a partir de un documento que podría estar desactualizado.

### Tema 3: Reintentar sin duplicar el efecto

#### Paso 1 · Objetivo y preparación
Al finalizar vas a implementar una clave de idempotencia para `POST /envios` de RutaFlow, confirmando que reintentar la misma petición tras un timeout no crea un segundo envío duplicado. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Si el servidor crea el envío en la base de datos pero la respuesta se pierde en la red, el cliente (la app del conductor) ve un timeout y, razonablemente, reintenta — sin una clave de idempotencia, ese reintento crea un segundo envío idéntico.

#### Paso 3 · Teoría, modelo mental y analogía
Una clave de idempotencia identifica la misma intención a través de reintentos, vinculada al actor, la operación y un hash del payload; la comprobación y el efecto deben ser atómicos dentro de la misma transacción.

#### Paso 4 · Demostración guiada desde cero

Crea `src/db/idempotency.sql` en tu proyecto Node y ejecuta la transacción sobre tu base de datos:

```sql
BEGIN;
INSERT INTO idempotency_keys(owner_id, operation, key, request_hash, status)
VALUES ($1, 'create-envio', $2, $3, 'processing')
ON CONFLICT DO NOTHING;
-- solo el propietario que insertó ejecuta el cambio
INSERT INTO envios(id, owner_id, guia, direccion) VALUES ($4, $1, $5, $6);
UPDATE idempotency_keys
SET status = 'completed', response_status = 201, resource_id = $4
WHERE owner_id = $1 AND operation = 'create-envio' AND key = $2;
COMMIT;
```

**Ejecuta el ejemplo** (monta el proyecto Node y córrelo):

```bash
npm init -y && npm install
node index.js
```
Para las pruebas: `npm test`.

Resultado esperado: enviar la misma petición de creación de envío dos veces con la misma clave de idempotencia produce un único envío real en la base de datos; la segunda llamada recibe la misma respuesta `201` registrada la primera vez.

#### Paso 5 · Práctica guiada
Pista: implementá la verificación como "buscar la clave, y si no existe, insertar el envío" en dos pasos separados, sin `ON CONFLICT` ni transacción — ese es el fallo deliberado: lanzá dos requests en paralelo con la misma clave; ambos "buscan" antes de que ninguno haya insertado todavía, ambos concluyen que la clave no existe, y ambos insertan el envío, produciendo dos registros duplicados.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo la verificación e inserción a una única transacción con restricción única, y repetí la prueba de dos requests en paralelo, confirmando que ahora solo uno de los dos efectivamente crea el envío.

#### Paso 7 · Cierre y evidencia
Entregá la transacción atómica del Paso 4, la condición de carrera provocada en el Paso 5, y la corrección verificada en paralelo del Paso 6; explicá por qué "buscar y luego insertar" en dos pasos separados nunca es seguro ante requests concurrentes, sin importar cuán rápido parezca en pruebas secuenciales. Siguiente paso: estudia webhooks verificables y recuperación por reconciliación. Errores comunes: verificar y efectuar el cambio en pasos no atómicos, reintentar con una clave nueva en vez de reutilizar la original, y no definir una expiración razonable para las claves de idempotencia. Fuentes oficiales: https://docs.stripe.com/idempotency y https://node-postgres.com/features/transactions.

**¿Por qué es importante?** Timeout y reentrega son normales en sistemas distribuidos; sin identidad estable y atomicidad, las técnicas de recuperación producen corrupción precisamente durante los fallos que debían resolver.
**Conceptos clave:** timeout, resultado ambiguo, idempotency key, unicidad, transacción, lock, atomicidad, deduplicación, outbox, relay, at-least-once e invariante.

Si el servidor confirma en PostgreSQL y la respuesta se pierde, el cliente ve timeout. Repetir una creación normal produce otra tarea. Una clave de idempotencia identifica la **misma intención** a través de reintentos. Debe vincularse al actor, operación y hash del payload; reutilizarla con datos distintos devuelve conflicto.

La comprobación y el efecto deben ser atómicos. “Buscar clave, luego insertar” tiene carrera entre requests. Usa restricción única y transacción:

```sql
BEGIN;
INSERT INTO idempotency_keys(owner_id, operation, key, request_hash, status)
VALUES ($1, 'create-task', $2, $3, 'processing')
ON CONFLICT DO NOTHING;
-- solo el propietario que insertó ejecuta el cambio
INSERT INTO tasks(id, owner_id, title) VALUES ($4, $1, $5);
UPDATE idempotency_keys
SET status = 'completed', response_status = 201, resource_id = $4
WHERE owner_id = $1 AND operation = 'create-task' AND key = $2;
COMMIT;
```

Una implementación real debe distinguir quién insertó, esperar o responder `409/425` a una operación en progreso y devolver la respuesta registrada al completar. Define expiración según ventana de reintento sin borrar evidencia demasiado pronto.

Actualizar base y publicar evento en pasos independientes crea doble escritura. Transactional outbox guarda evento y tarea en la misma transacción. Un relay publica pendientes y puede caer antes de marcarlos; por eso entrega al menos una vez. El consumidor guarda `event_id` junto a su efecto en otra transacción y convierte duplicación en el mismo resultado observable.

“Exactly once” del broker suele cubrir una frontera limitada. La garantía útil es: para cada identificador aceptado, el invariante de negocio cambia una vez. Demuéstralo con requests paralelos, caída tras commit y reejecución del relay.

**Analogía:** una transferencia tiene número de operación. Si la pantalla se congela, consultar o repetir ese número recupera el resultado; crear otro número ordena una segunda transferencia.

**¿Por qué es importante?** porque timeout y reentrega son normales. Sin identidad y atomicidad, las técnicas de recuperación producen corrupción precisamente durante fallos.

**Casos de uso reales:** pagos, creación de pedidos, imports, consumo de colas, jobs reintentados, comandos móviles y publicación de eventos.

**Diagrama:**

```text
POST + key K -> transacción [dedupe K + tarea + outbox E]
                                      |
                                  relay publica E (quizá dos veces)
                                      |
                         consumidor [dedupe E + efecto]
```

```mermaid
sequenceDiagram
    participant Cliente
    participant API
    participant DB as PostgreSQL
    Cliente->>API: POST /envios (key K)
    API->>DB: INSERT idempotency_keys ON CONFLICT DO NOTHING
    alt K es nueva
        DB-->>API: insertada
        API->>DB: INSERT envío (misma transacción)
        API-->>Cliente: 201 Creado
    else K ya existe
        DB-->>API: conflicto (ya procesada)
        API-->>Cliente: misma respuesta 201 registrada antes
    end
```

**Cuándo NO conviene una clave de idempotencia:** en operaciones de solo lectura (`GET`) o en operaciones que ya son naturalmente idempotentes por diseño (`PUT` que reemplaza el recurso completo con el mismo valor), agregar una tabla de claves de idempotencia es trabajo innecesario — el límite correcto es aplicarla únicamente a operaciones que crean o mutan estado de forma no repetible (`POST` que crea un recurso nuevo, cobros, envíos).

En el proyecto integrador RutaFlow (`src/db/idempotency.sql`), esta tabla protege específicamente `POST /envios`: la app del conductor reintenta automáticamente ante cualquier timeout de red, y sin esta clave cada reintento generaría un envío físico duplicado en el almacén.

### Tema 4: Webhooks verificables y recuperación por reconciliación

#### Paso 1 · Objetivo y preparación
Al finalizar vas a verificar la firma HMAC de un webhook entrante de un proveedor de pagos hacia RutaFlow, confirmando autenticidad sobre los bytes exactos antes de parsear el cuerpo. Prerrequisitos: Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
RutaFlow recibe webhooks de un proveedor de pagos cuando se confirma el cobro de una entrega — cualquiera que conozca la URL del webhook podría enviar un POST falso simulando un cobro exitoso, si el endpoint no verifica que ese request realmente proviene del proveedor.

#### Paso 3 · Teoría, modelo mental y analogía
Firmar versión, timestamp y cuerpo con HMAC y comparar en tiempo constante autentica el contenido exacto; no comparar JSON reserializado evita falsos negativos por diferencias de espacios u orden.

#### Paso 4 · Demostración guiada desde cero

Crea `src/webhooks/signature-verify.ts` en tu proyecto Node para manejar verificación de firmas:

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

function validSignature(raw: Buffer, timestamp: string, receivedHex: string, secret: string) {
  const expected = createHmac('sha256', secret)
    .update(`v1.${timestamp}.`)
    .update(raw)
    .digest();
  const received = Buffer.from(receivedHex, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
```

**Ejecuta el ejemplo** (monta el proyecto Node y córrelo):

```bash
npm init -y && npm install
node index.js
```
Para las pruebas: `npm test`.

Resultado esperado: un webhook con la firma correcta (calculada por el proveedor real con el secreto compartido) pasa la verificación; un POST falso sin conocer el secreto falla la comparación y se rechaza antes de procesar ningún cambio de estado.

#### Paso 5 · Práctica guiada
Pista: cambiá `timingSafeEqual(received, expected)` por una comparación directa `received.toString('hex') === receivedHex` de strings — ese es el fallo deliberado: una comparación de strings normal retorna más rápido en cuanto encuentra el primer carácter distinto, filtrando por temporización cuántos caracteres iniciales coinciden, una vulnerabilidad de timing attack que permitiría reconstruir la firma correcta byte por byte midiendo tiempos de respuesta.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `timingSafeEqual`, y agregá el rechazo de timestamps fuera de una ventana razonable (5 minutos) para prevenir ataques de replay con una firma válida pero capturada previamente.

#### Paso 7 · Cierre y evidencia
Entregá la verificación HMAC del Paso 4, la vulnerabilidad de timing attack del Paso 5, y el rechazo de timestamps antiguos del Paso 6; explicá por qué una comparación de strings normal filtra información por temporización, y por qué `timingSafeEqual` existe específicamente para evitar ese canal lateral. Siguiente paso: cerrá el módulo integrando validación, contratos, idempotencia y webhooks en la API completa de RutaFlow. Errores comunes: comparar firmas con el operador `===` normal en vez de una comparación en tiempo constante, no rechazar timestamps fuera de ventana, y reintentar indefinidamente un webhook que responde `400`. Fuentes oficiales: https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b y https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries.

**¿Por qué es importante?** Las integraciones vía webhook viven fuera de tu despliegue y control; una garantía profesional incluye autenticidad verificable, no solo HTTPS en tránsito.
**Conceptos clave:** webhook, firma HMAC, secreto, timestamp, replay, payload crudo, delivery ID, retry, backoff, jitter, DLQ, circuit breaker, reconciliación y estado fuente.

Un webhook es una petición saliente que cruza otra organización y fallará. El receptor necesita comprobar autenticidad sobre los bytes exactos antes de parsear. Firma versión, timestamp y cuerpo con HMAC y compara en tiempo constante. Rechaza timestamps fuera de ventana y delivery IDs ya procesados.

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

function validSignature(raw: Buffer, timestamp: string, receivedHex: string, secret: string) {
  const expected = createHmac('sha256', secret)
    .update(`v1.${timestamp}.`)
    .update(raw)
    .digest();
  const received = Buffer.from(receivedHex, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
```

No compares JSON reserializado: espacios y orden pueden cambiar. Rota secretos aceptando temporalmente versión actual y anterior; identifica la versión sin enviar el secreto. TLS sigue siendo obligatorio: la firma autentica contenido, no oculta datos.

El emisor registra cada delivery, respuesta y próximo intento. Reintenta errores transitorios y 429 respetando `Retry-After`, con backoff y jitter; no reintenta indefinidamente un 400. Limita concurrencia por destino para evitar amplificar una caída. El receptor responde rápido después de persistir y procesa en background de forma idempotente.

Los reintentos no bastan. Una tarea periódica de reconciliación compara la fuente de verdad con proyecciones o entregas y repara ausencias. Proporciona endpoint para consultar recurso y replay administrativo auditado. La DLQ requiere dueño, alerta y runbook; acumular eventos no es recuperación.

**Analogía:** la entrega certificada tiene sello verificable, número, intentos registrados y un libro maestro para comprobar después qué destinatarios no recibieron. El mensajero no improvisa una entrega infinita.

**¿Por qué es importante?** porque las integraciones viven fuera de tu despliegue y control. Una garantía profesional incluye autenticidad, duplicación, retraso, caída prolongada y reparación posterior.

**Casos de uso reales:** proveedor de pagos, GitHub webhooks, notificaciones de pedidos, sincronización CRM, callbacks de procesamiento y exportaciones.

**Diagrama:**

```text
outbox -> delivery persistido -> HTTP firmado -> receptor dedupe + ACK
              | fallo             |
              `-> retry/jitter ----´
reconciliador compara fuente/proyección -> replay auditado
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Recibe un webhook con firma comprobable y registra su identificador antes de aplicar efectos. Reenvíalo y ejecuta reconciliación de un evento perdido; ambos caminos deben converger al mismo estado.

## Revisión oficial de plataforma — julio de 2026

### Línea LTS, línea Current y APIs del runtime

Producción debe partir de una línea **LTS**: hoy conviven **Node.js 24 LTS** (en mantenimiento) y **Node.js 26 LTS** (Active LTS desde octubre de 2026, soporte hasta abril de 2029). Node 26 habilita `Temporal` por defecto y actualiza V8, Undici y deprecaciones; que ya sea LTS no justifica migrar sin probar dependencias, imágenes, rendimiento y observabilidad. Distingue API estable, experimental y retirada leyendo notas de la versión mayor y cada release de seguridad. El soporte nativo de TypeScript no reemplaza comprobación de tipos ni todas las transformaciones de un compilador.

**Aplicación al proyecto:** ejecuta contratos y benchmarks en una matriz 24/26, prueba fechas con Temporal, convierte deprecaciones en fallo controlado de CI y conserva Node 24 como runtime de despliegue hasta aprobar la evidencia.


## Laboratorio práctico

### Proyecto: API contractual con efectos recuperables

Evoluciona una vertical del proyecto final —crear tarea y notificarla— sin reescribir todo simultáneamente.

1. Activa `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. Elimina `any`, `@ts-ignore` y non-null assertions de la vertical.
2. Valida configuración y cada entrada externa como `unknown`. Separa schema HTTP, comando y entidad.
3. Escribe OpenAPI con éxito, validaciones, auth, rate limit y Problem Details.
4. Añade middleware o prueba que contraste requests y responses reales con el contrato.
5. Genera un cliente de prueba y conserva una prueba de consumidor en CI.
6. Implementa `Idempotency-Key` asociada a usuario, operación y hash de request.
7. Lanza 20 requests paralelos con la misma clave y demuestra una sola tarea y respuesta estable.
8. Escribe tarea y evento outbox en una transacción. Mata el relay después de publicar y antes de marcar; demuestra deduplicación.
9. Implementa delivery de webhook con cuerpo crudo, timestamp, firma versionada y secreto rotatable.
10. Simula 429, 400, timeout y caída de una hora; verifica política, límites y DLQ operable.
11. Crea reconciliador y replay administrativo con autorización y audit log.
12. Documenta invariantes, estados, secuencias, métricas y runbook de recuperación.

**Verificación:** CI ejecuta typecheck, lint, tests, contrato, migraciones y escenarios concurrentes. Conserva consultas que prueben unicidad, evento no perdido y efecto único. Otra persona debe reproducir fallos y recuperación desde un clon limpio sin credenciales reales.

**Errores comunes y soluciones**

- Usar `as Tipo` sobre `req.body`: parsea `unknown`; el cast no genera validación.
- Generar OpenAPI sin verificarlo: contrasta tráfico real en CI y rompe el build ante divergencia.
- Guardar clave después del efecto: clave, cambio y respuesta se coordinan en una transacción.
- Publicar directamente después del commit: registra outbox dentro del commit y publica recuperablemente.
- Firmar JSON reserializado: conserva bytes crudos y orden canónico de componentes firmados.
- Reintentar cada 4xx: clasifica permanente, rate limit y transitorio; respeta presupuesto.
- DLQ sin procedimiento: alerta, inspecciona, corrige y reproduce con auditoría.




## Ampliación: contratos con OpenAPI

### Tema 5: OpenAPI como contrato ejecutable

#### Paso 1 · Objetivo y preparación
Al finalizar podrás validar un contrato OpenAPI desde cero. Prerrequisitos: Node.js LTS, npm y un editor.

#### Paso 2 · Contexto y caso real
En un caso real, una aplicación móvil y un socio externo deben interpretar la misma respuesta de entregas sin romperse entre despliegues.

#### Paso 3 · Teoría, modelo mental y analogía
OpenAPI es un contrato ejecutable: describe entradas, salidas y errores para personas, validadores y clientes. La analogía es un plano firmado que el inspector compara con el edificio.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m13-t5 && cd ejemplo-node-m13-t5
npm init -y
npm install -D @redocly/cli
mkdir src
```
Crea `src/openapi.yaml` con una operación GET y ejecuta `npx redocly lint src/openapi.yaml`.

#### Paso 5 · Práctica guiada
Pista: elimina un campo requerido para provocar un fallo deliberado, lee el diagnóstico y restáuralo. Resultado esperado: el lint termina sin errores.

#### Paso 6 · Práctica independiente
Añade POST, respuesta Problem Details y un ejemplo de consumidor; comprueba compatibilidad al agregar un campo opcional.

#### Paso 7 · Cierre y evidencia
Conserva el contrato, el log y una captura; como siguiente paso conecta el lint al CI. **Evidencia:** entrega la salida correcta, el fallo provocado y una explicación de qué regla de OpenAPI corregiste. Errores comunes: documentación desactualizada, tipos incompatibles, omitir errores y cambiar campos sin deprecación. Fuentes oficiales: https://spec.openapis.org/oas/latest.html y https://redocly.com/docs/cli/.

Este mismo archivo `openapi.yaml`, versionado y validado en CI, es el contrato real que describirá los endpoints del proyecto integrador (API productiva, Módulo 12), permitiendo que un cliente móvil o un socio externo detecte una ruptura de compatibilidad antes de que llegue a producción.

**Cuándo no usarlo:** para un endpoint interno, de un solo consumidor que cambia junto con el servidor en el mismo despliegue, mantener un contrato OpenAPI formal agrega overhead sin beneficio; se vuelve indispensable en cuanto hay más de un consumidor que no se despliega al mismo tiempo que la API.

**Objetivo:** describir la API de entregas en OpenAPI y comprobar automáticamente que ejemplos, solicitudes y respuestas coinciden con la implementación.

**¿Por qué es importante?** Una documentación escrita a mano envejece cuando cambia el código. OpenAPI modela operaciones, parámetros, cuerpos, respuestas y errores en un formato que pueden usar personas y herramientas. El archivo solo se vuelve confiable cuando CI lo valida y las pruebas comparan el contrato con tráfico real.

**Contexto:** web, Flutter y socios externos consumen `POST /deliveries`. Cambiar silenciosamente `trackingCode` por `tracking_code` puede romper varios clientes. Un contrato versionado permite discutir compatibilidad antes de desplegar.

**Analogía:** OpenAPI es el plano firmado de un edificio. Swagger UI es una vista cómoda del plano, pero el inspector —lint y contract tests— verifica que la construcción real lo respete.

**Conceptos clave**

| Concepto | Función | Riesgo si se omite |
|---|---|---|
| `operationId` | Identidad estable para una operación | SDKs difíciles de mantener |
| `schema` | Forma y restricciones de los datos | Clientes interpretan respuestas de forma distinta |
| respuestas de error | Contrato de fallos esperados | Cada consumidor improvisa |
| compatibilidad | Evolución sin retirar campos requeridos | Rupturas en producción |

**Demostración guiada:** crea `demo-api/packages/api/openapi.yaml`.

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
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: Entrega encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Delivery'
        '404':
          description: Entrega inexistente
components:
  schemas:
    Delivery:
      type: object
      additionalProperties: false
      required: [id, trackingCode, status]
      properties:
        id: { type: string, format: uuid }
        trackingCode: { type: string, minLength: 6 }
        status:
          type: string
          enum: [created, assigned, in_transit, delivered]
```

Valida desde `demo-api/packages/api`:

```bash
npx @redocly/cli lint openapi.yaml
npm test -- contract
```

**Resultado esperado:** el lint termina sin errores y la prueba confirma un `200` válido y un `404` documentado. Si la API devuelve una propiedad interna no permitida o elimina `trackingCode`, el contract test debe fallar antes del despliegue.

**Práctica guiada:** añade un ejemplo de respuesta y un test con Supertest que valide el JSON real contra `Delivery`. Rompe intencionalmente el nombre de una propiedad, observa el fallo y restáuralo.

**Pista:** TypeScript comprueba código en compilación, pero el JSON recibido por red sigue siendo `unknown`. Usa un validador compatible con JSON Schema en la frontera.

**Práctica independiente:** documenta `POST /deliveries`, incluidos `400`, `409` y la cabecera `Idempotency-Key`. Clasifica un cambio compatible y uno incompatible, y agrega una regla de CI que impida el segundo sin una nueva versión.

**Errores comunes**

1. Publicar Swagger UI sin validar el documento ni la implementación.
2. Documentar solo respuestas exitosas y dejar los errores a interpretación del cliente.
3. Confundir tipos TypeScript con validación de datos externos.
4. Exponer columnas internas porque el esquema usa directamente la entidad de persistencia.

**Cierre:** el contrato ya es documentación, prueba y frontera de colaboración. El siguiente paso combina OpenAPI, idempotencia y outbox para evolucionar integraciones sin duplicar efectos. Recurso oficial: [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0.html).

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://nodejs.org/api/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 46 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Runtime | `event loop` · `timers` · `microtasks` · `EventEmitter` · `buffers` · `streams` · `backpressure` · `ESM y CommonJS` | API |
| Sistema | `filesystem` · `paths y URLs` · `procesos` · `señales` · `child_process` · `worker_threads` · `cluster` · `permission model` | API |
| Red | `HTTP/HTTPS` · `HTTP/2` · `DNS` · `TCP/UDP` · `TLS` · `proxies` · `timeouts` · `Web APIs compatibles` | API |
| Datos | `SQLite` · `serialización` · `compresión` · `crypto` · `blobs` · `variables de entorno` · `configuración validada` | API |
| Calidad | `node:test` · `mocks` · `coverage` · `benchmarks` · `diagnostics_channel` · `AsyncLocalStorage` · `inspector` · `heap snapshots` | API |
| Producción | `TypeScript` · `package exports` · `semver` · `seguridad de dependencias` · `graceful shutdown` · `observabilidad` · `idempotencia` | API |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->
