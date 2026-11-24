# Módulo 2: Backend: envíos, asignación e idempotencia


## Aprende construyendo


### Tema 1: Contratos HTTP y autorización · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 1: Contratos HTTP y autorización dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y JavaScript con Node.js (track Node).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[POST /envios/:id/asignar] --> B[Verificar firma del JWT]
  B -->|firma invalida| E1[401 No autenticado]
  B -->|firma valida| C{claim role es operador?}
  C -->|no| E2[403 Rol insuficiente]
  C -->|si| D[Asignar conductor al envio]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir -p rutaflow-labs/tema-1-contratos-http-y-autorizacion
cd rutaflow-labs/tema-1-contratos-http-y-autorizacion
```

```yaml
paths:
  /envios/{id}/asignar:
    post:
      summary: Asigna un conductor a un envío
      security:
        - bearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                conductorId: { type: string, example: cond-09 }
      responses:
        '200': { description: Envío asignado }
        '401': { description: Token ausente o inválido }
        '403': { description: Rol insuficiente (se requiere operador) }
```

```javascript
// Simula un token YA verificado por el middleware de autenticación (firma validada).
function tokenVerificado(role) {
  return { sub: 'usr-204', role };
}

// Caso de uso: solo "operador" puede asignar un conductor a un envío.
function asignarConductor({ envioId, conductorId, claims }) {
  if (claims.role !== 'operador') {
    const error = new Error(`rol insuficiente: ${claims.role}`);
    error.status = 403;
    throw error;
  }
  return { envioId, conductorId, estado: 'asignado' };
}

const claims = tokenVerificado('operador'); // sale del JWT verificado, no del body
const resultado = asignarConductor({ envioId: 'RF-4471', conductorId: 'cond-09', claims });
console.log(JSON.stringify(resultado));
```

```javascript
function asignarConductorInseguro({ envioId, conductorId, body }) {
  if (body.role !== 'operador') {
    const error = new Error(`rol insuficiente: ${body.role}`);
    error.status = 403;
    throw error;
  }
  return { envioId, conductorId, estado: 'asignado' };
}

// El atacante no tiene el rol operador en su JWT (su claim real es "repartidor"),
// pero puede escribir lo que quiera en el body de su propia petición.
const resultado = asignarConductorInseguro({
  envioId: 'RF-4471',
  conductorId: 'cond-09',
  body: { role: 'operador' },
});
console.log(JSON.stringify(resultado));
```

</details>

### Tema 2: Casos de uso y transacciones · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 2: Casos de uso y transacciones dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y JavaScript con Node.js (track Node).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[asignarConductor] --> B[BEGIN transaccion]
  B --> C[UPDATE envios: estado=asignado]
  C --> D[UPDATE conductores: capacidad -1]
  D --> E{ambas escrituras ok?}
  E -->|si| F[COMMIT]
  E -->|no| G[ROLLBACK: nada se guarda]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[asignarConductor] --> B[BEGIN transaccion]
  B --> C[UPDATE envios: estado=asignado]
  C --> D[UPDATE conductores: capacidad -1]
  D --> E{ambas escrituras ok?}
  E -->|si| F[COMMIT]
  E -->|no| G[ROLLBACK: nada se guarda]
```

```bash
mkdir -p rutaflow-labs/tema-2-casos-de-uso-y-transacciones
cd rutaflow-labs/tema-2-casos-de-uso-y-transacciones
```

```javascript
// Simulación en memoria de dos "tablas" para poder ejecutar el demo sin una base real.
const envios = { 'RF-4471': { estado: 'pendiente', conductorId: null } };
const conductores = { 'cond-09': { capacidadDisponible: 3 } };

// Versión SIN transacción: dos escrituras independientes.
function asignarConductorSinTransaccion(envioId, conductorId, simularCaidaDeRed) {
  envios[envioId].conductorId = conductorId;
  envios[envioId].estado = 'asignado'; // escritura 1: ya quedó guardada
  if (simularCaidaDeRed) {
    throw new Error('conexion perdida antes de descontar capacidad');
  }
  conductores[conductorId].capacidadDisponible -= 1; // escritura 2: no se ejecuta si hubo caída
}

asignarConductorSinTransaccion('RF-4471', 'cond-09', false);
console.log(JSON.stringify({ envio: envios['RF-4471'], conductor: conductores['cond-09'] }));
```

```javascript
const envios2 = { 'RF-4471': { estado: 'pendiente', conductorId: null } };
const conductores2 = { 'cond-09': { capacidadDisponible: 3 } };

try {
  asignarConductorSinTransaccion.call(null, 'RF-4471', 'cond-09', true);
} catch (e) {
  console.log('Error capturado:', e.message);
}
console.log(JSON.stringify({ envio: envios['RF-4471'], conductor: conductores['cond-09'] }));
```

```javascript
function asignarConductorConTransaccion(envioId, conductorId, simularCaidaDeRed) {
  const envioPrevio = { ...envios[envioId] };
  const conductorPrevio = { ...conductores[conductorId] };
  try {
    envios[envioId].conductorId = conductorId;
    envios[envioId].estado = 'asignado';
    if (simularCaidaDeRed) {
      throw new Error('conexion perdida antes de descontar capacidad');
    }
    conductores[conductorId].capacidadDisponible -= 1;
  } catch (error) {
    envios[envioId] = envioPrevio; // ROLLBACK
    conductores[conductorId] = conductorPrevio; // ROLLBACK
    throw error;
  }
}
```

</details>

### Tema 3: Outbox, colas y observabilidad · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 3: Outbox, colas y observabilidad dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y el SQL con PostgreSQL del Módulo 1 (contenedor rutaflow-pg).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[confirmarEntrega] --> B[BEGIN transaccion]
  B --> C[UPDATE envios: estado=entregado]
  C --> D[INSERT outbox: EnvioEntregado]
  D --> E[COMMIT]
  E --> F[Relay lee outbox]
  F --> G[Publica a la cola]
  G --> H[Marca fila como publicada]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[confirmarEntrega] --> B[BEGIN transaccion]
  B --> C[UPDATE envios: estado=entregado]
  C --> D[INSERT outbox: EnvioEntregado]
  D --> E[COMMIT]
  E --> F[Relay lee outbox]
  F --> G[Publica a la cola]
  G --> H[Marca fila como publicada]
```

```bash
mkdir -p rutaflow-labs/tema-3-outbox-colas-y-observabilidad
cd rutaflow-labs/tema-3-outbox-colas-y-observabilidad
```

```sql
DROP TABLE IF EXISTS cola, outbox, envios;
CREATE TABLE envios (id TEXT PRIMARY KEY, estado TEXT NOT NULL);
CREATE TABLE outbox (
  id BIGSERIAL PRIMARY KEY,
  envio_id TEXT NOT NULL REFERENCES envios(id),
  tipo TEXT NOT NULL,
  publicado BOOLEAN NOT NULL DEFAULT false
);
-- "cola" hace las veces del broker (RabbitMQ, Kafka) para poder observarlo con SELECT.
CREATE TABLE cola (outbox_id BIGINT PRIMARY KEY, envio_id TEXT NOT NULL, tipo TEXT NOT NULL);
INSERT INTO envios VALUES ('RF-4471', 'pendiente');
```

```sql
-- El cambio de dominio y el evento se confirman juntos o no se confirma ninguno.
BEGIN;
UPDATE envios SET estado = 'entregado' WHERE id = 'RF-4471';
INSERT INTO outbox (envio_id, tipo) VALUES ('RF-4471', 'EnvioEntregado');
COMMIT;
-- Aquí termina el proceso de la API: no publica nada en la cola.
```

```sql
-- Proceso aparte: publica lo pendiente del outbox y lo marca como publicado.
WITH pendientes AS (
  UPDATE outbox SET publicado = true WHERE NOT publicado
  RETURNING id, envio_id, tipo
)
INSERT INTO cola (outbox_id, envio_id, tipo)
SELECT id, envio_id, tipo FROM pendientes
ON CONFLICT (outbox_id) DO NOTHING;
```

```bash
DB="postgresql://postgres:rutaflow@localhost:5432/postgres"
psql "$DB" -v ON_ERROR_STOP=1 -q -f esquema.sql
psql "$DB" -v ON_ERROR_STOP=1 -f confirmar.sql
psql "$DB" -c "SELECT * FROM outbox" -c "SELECT count(*) AS en_cola FROM cola"
psql "$DB" -v ON_ERROR_STOP=1 -f relay.sql
psql "$DB" -v ON_ERROR_STOP=1 -f relay.sql
psql "$DB" -c "SELECT * FROM cola" -c "SELECT id, publicado FROM outbox"
```

</details>

### Tema 4: Evolución de contratos: aceptar una versión nueva sin romper clientes anteriores · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar definirás una frontera compatible entre dos versiones de un comando de creación de envío y rechazarás datos ambiguos. Prerrequisitos: objetos JavaScript, módulos, pruebas y el dominio de envíos. Node 24 o superior. Ejemplo independiente desde una carpeta vacía.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir contrato-envio
cd contrato-envio
```

```javascript
export function adaptar(body) {
  if (!body || ![1, 2].includes(body.version)) throw new Error('Versión no soportada');
  if (!Number.isSafeInteger(body.distanciaMetros) || body.distanciaMetros <= 0) {
    throw new Error('distanciaMetros debe ser un entero positivo');
  }
  if (body.version === 2 && body.referencia !== undefined &&
      (typeof body.referencia !== 'string' || body.referencia.length > 80)) {
    throw new Error('Referencia inválida');
  }
  return { distanciaMetros: body.distanciaMetros,
    referencia: body.version === 2 ? (body.referencia ?? '') : '' };
}
```

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptar } from './contrato.mjs';
test('v1 y v2 conservan unidades y significado', () => {
  assert.deepEqual(adaptar({ version: 1, distanciaMetros: 1200 }),
    adaptar({ version: 2, distanciaMetros: 1200 }));
});
test('no adivina valores ni versiones', () => {
  assert.throws(() => adaptar({ version: 3, distanciaMetros: 1200 }));
  assert.throws(() => adaptar({ version: 1, distanciaMetros: '1.2 km' }));
  assert.throws(() => adaptar({ version: 2, distanciaMetros: 0 }));
});
```

```bash
node --test contrato.test.mjs
```

</details>
