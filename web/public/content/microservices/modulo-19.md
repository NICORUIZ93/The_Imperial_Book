# Módulo 15 · Persistencia

**Fase 2 · Node.js de cero a experto** (semana 4 de 12). **Duración:** 10 h (4 temas de 2 h y 2 h de laboratorio
integrador). **Dificultad:** 3 de 5. **Dependencias:** Módulo 13 (promesas, `async/await`, módulos ES) y Módulo 14
(Express); de la Fase 0, Docker básico (Módulo 0.5) y variables de entorno (Módulo 0.4). No necesita la Fase 1: todo lo
de bases de datos se explica aquí desde cero. **Herramientas:** **Node.js 26.13.1 LTS**, **mongoose 9.12.2** (driver
`mongodb` 7.x), **prisma** y **@prisma/client 7.10.1** con **@prisma/adapter-pg 7.10.1**, **sequelize 6.37.8**,
**pg 8.23.1**, **express 5.3.0**, **tsx 4.23.15**, **TypeScript 6.0.3**; **MongoDB 9.0.8** y **PostgreSQL 18.7** con
Docker Compose..

Hasta ahora tus servicios guardaban los datos en variables: al reiniciar, se perdían. **Persistir** es escribir los
datos en un sistema que los conserva cuando el proceso muere. En este módulo aprendes las dos familias que más vas a
encontrar en microservicios Node.js (documentos con MongoDB y tablas con PostgreSQL), la regla que hace que un
microservicio sea de verdad independiente (cada servicio es dueño de su base) y las dos piezas que más incidentes
causan en producción: el pool de conexiones y las transacciones.

```mermaid
flowchart LR
    subgraph MODELOS["Dos formas de guardar"]
      T1["1 · MongoDB + Mongoose<br/>(documentos)"]
      T2["2 · PostgreSQL + Prisma/Sequelize<br/>(tablas y relaciones)"]
    end
    subgraph ARQ["La regla de arquitectura"]
      T3["3 · Database-per-service"]
    end
    subgraph PROD["Lo que falla en producción"]
      T4["4 · Connection pooling<br/>y transacciones"]
    end
    T1 --> T2 --> T3 --> T4
```

**Texto alternativo:** mapa del módulo en tres bloques conectados en orden. «Dos formas de guardar» contiene el tema 1
(MongoDB + Mongoose, documentos) y el tema 2 (PostgreSQL + Prisma/Sequelize, tablas y relaciones). «La regla de
arquitectura» contiene el tema 3 (Database-per-service). «Lo que falla en producción» contiene el tema 4 (connection
pooling y transacciones). Una flecha recorre los cuatro temas del 1 al 4.

**Cómo usar el laboratorio.** Necesitas Node 26 (`nvm install 26 && nvm use 26`) y Docker Desktop encendido:

```bash
los comandos de verificación indicados     # docker compose up + npm ci + prisma generate + tests + programas → «RESULTADO: OK»
```

Para trabajar ficha por ficha, deja las bases arriba y ejecuta las órdenes **desde
`modulo-19`**:

```bash
docker compose up -d --wait   # MongoDB 9.0.8 en localhost:27019 y PostgreSQL 18.7 en localhost:5519
npm ci                        # instala exactamente lo que fija package-lock.json
# ... las fichas ...
docker compose down           # al terminar: borra los contenedores y sus datos
```

El `docker-compose.yml` del laboratorio (los puertos 27019 y 5519 evitan chocar con un MongoDB o un PostgreSQL que ya
tengas instalado):

```yaml
# Módulo 15 (modulo-19) · Persistencia en Node.js
# Arranca:   docker compose up -d --wait     (espera a que los dos healthchecks estén "healthy")
# Detén:     docker compose down              (los datos se pierden: no hay volúmenes, el laboratorio es repetible)
# Puertos del anfitrión poco comunes (27019 y 5519) para no chocar con un MongoDB o PostgreSQL que ya tengas.
services:
  mongo:
    image: mongo:9.0.8
    ports: ["27019:27017"]
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
      interval: 2s
      timeout: 5s
      retries: 30
  postgres:
    image: postgres:18.7
    environment:
      POSTGRES_USER: tienda
      POSTGRES_PASSWORD: tienda
      POSTGRES_DB: tienda
    ports: ["5519:5432"]
    volumes:
      - ./initdb/01-bases.sql:/docker-entrypoint-initdb.d/01-bases.sql:ro
    healthcheck:
      # inventario_db es la ÚLTIMA base que crea initdb: si responde por TCP, la inicialización terminó.
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U tienda -d inventario_db"]
      interval: 2s
      timeout: 3s
      retries: 30
```

`initdb/01-bases.sql` crea las bases de cada ficha la primera vez que arranca PostgreSQL:

```sql
-- Módulo 15 (modulo-19) · Se ejecuta UNA vez, como el superusuario «tienda», al crear el contenedor de PostgreSQL.
-- F102 y F104 usan una base propia cada una; F103 crea DOS bases con DOS usuarios que no pueden cruzarse.
CREATE DATABASE f102;
CREATE DATABASE f104;

CREATE ROLE pedidos_app    LOGIN PASSWORD 'pedidos';
CREATE ROLE inventario_app LOGIN PASSWORD 'inventario';
CREATE DATABASE pedidos_db    OWNER pedidos_app;
CREATE DATABASE inventario_db OWNER inventario_app;
-- Por defecto cualquier rol puede conectarse a cualquier base (privilegio CONNECT de PUBLIC). Lo quitamos:
REVOKE CONNECT ON DATABASE pedidos_db    FROM PUBLIC;
REVOKE CONNECT ON DATABASE inventario_db FROM PUBLIC;
```

El `package.json`, compartido por las cuatro fichas (`package-lock.json` fija el árbol completo):

```json
{
  "name": "modulo-15-persistencia-node",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 15 (Fase 2): Persistencia con MongoDB + Mongoose, PostgreSQL + Prisma/Sequelize, database-per-service, pool y transacciones.",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "generate": "prisma generate --schema f102-prisma-sequelize/prisma/schema.prisma",
    "test": "node --test --test-concurrency=1"
  },
  "dependencies": {
    "@prisma/adapter-pg": "7.10.1",
    "@prisma/client": "7.10.1",
    "express": "5.3.0",
    "mongoose": "9.12.2",
    "pg": "8.23.1",
    "sequelize": "6.37.8"
  },
  "devDependencies": {
    "@types/node": "26.6.6",
    "prisma": "7.10.1",
    "tsx": "4.23.15",
    "typescript": "6.0.3"
  }
}
```

Y `config.js`, el único lugar donde están las direcciones de las bases:

```javascript
// Módulo 15 · Direcciones de las bases del laboratorio (las de docker-compose.yml).
// Cambia el destino sin tocar código:  PG_HOST=otro PG_PORT=5432 MONGO_URL=mongodb://otro:27017/tienda node ...
const host = process.env.PG_HOST ?? 'localhost';
const port = process.env.PG_PORT ?? '5519';

// pgUrl('f102') → postgresql://tienda:tienda@localhost:5519/f102
export function pgUrl(base, usuario = 'tienda', clave = 'tienda') {
  return `postgresql://${usuario}:${clave}@${host}:${port}/${base}`;
}

export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27019/tienda';
```

---


### MongoDB + Mongoose

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Modelar un producto como documento con un esquema de Mongoose, ejecutar altas, consultas con filtro, orden y proyección, y una actualización atómica, y diagnosticar los errores de validación, de clave duplicada y de conexión; lo compruebas cuando node --test f101-mongoose/*.test.…

#### ► LA IDEA EN UNA FRASE
**Modelar un producto como documento con un esquema de Mongoose, ejecutar altas, consultas con filtro, orden y proyección, y una actualización atómica, y diagnosticar los errores de validación, de clave duplicada y de conexión; lo compruebas cuando node --test f101-mongoose/*.test.js pasa 8 de 8 y explicas por qué cinco compras simultáneas de un producto con 3 unidades dejan el stock en 0 y no en −2.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en mongodb + mongoose como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    APP["Tu código<br/>crear(), porEtiqueta()"] --> MODELO["Modelo Producto<br/>(mongoose.model)"]
    MODELO --> ESQUEMA{"Esquema:<br/>¿tipos, required, min?"}
    ESQUEMA -- "no cumple" --> ERR["ValidationError<br/>(no sale de tu proceso)"]
    ESQUEMA -- "cumple" --> POOL["Driver mongodb<br/>pool de conexiones"]
    POOL -- "BSON por TCP 27017" --> MONGO[("MongoDB<br/>base tienda")]
    MONGO --> COL["Colección productos<br/>{ _id, sku, nombre, precio,<br/>etiquetas[], proveedor{} }"]
    MONGO --> IDX["Índices: _id · sku (único) ·<br/>etiquetas+precio"]
```

1. Una **base de datos** es un programa aparte cuyo trabajo es guardar datos en disco y devolverlos cuando se los
2. **MongoDB** guarda **documentos**: objetos parecidos a JSON, con campos, listas y objetos dentro de objetos. Los
3. Cada documento recibe un identificador único, **`_id`**, que MongoDB genera solo.
4. MongoDB no obliga a que los documentos tengan la misma forma. **Mongoose** es una librería de Node que añade esa
5. Un **modelo** es el esquema más las operaciones: `Producto.create(...)` guarda, `Producto.find(...)` busca.

#### ► LO QUE PUEDE SALIR MAL
| Mensaje | Qué significa | Arreglo |
|---|---|---|
| `buffering timed out after …ms` | Nadie llamó a `mongoose.connect()` (o no se esperó, o se conectó **otra** instancia de mongoose). Mongoose guardó la consulta en una cola esperando una conexión que nunca llegó. | `await mongoose.connect(url)` **antes** de aceptar peticiones. En producción, `mongoose.set('bufferCommands', false)` para que falle al instante. |
| `MongooseServerSelectionError: connect ECONNREFUSED host:puerto` | Sí intentó conectar, pero en esa dirección no hay MongoDB: contenedor apagado, puerto equivocado, o `localhost` usado *dentro* de un contenedor (ahí el host es el nombre del servicio: `mongo`). | `docker compose ps`, revisa la URL y el puerto publicado (`27019` fuera, `27017` dentro de la red de Compose). |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar MongoDB + Mongoose | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El arreglo que crece sin límite (*unbounded array*): embeber dentro de un documento algo que no deja de crecer.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: mongodb + mongoose funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una **base de datos** es un programa aparte cuyo trabajo es guardar datos en disco y devolverlos cuando se los
- **MongoDB** guarda **documentos**: objetos parecidos a JSON, con campos, listas y objetos dentro de objetos. Los
- Cada documento recibe un identificador único, **`_id`**, que MongoDB genera solo.
- MongoDB no obliga a que los documentos tengan la misma forma. **Mongoose** es una librería de Node que añade esa

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve mongodb + mongoose en tu contexto?
2. ¿Cómo sabrías que mongodb + mongoose no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar mongodb + mongoose?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Levanta las bases e instala las dependencias (una vez para todo el módulo):
   ```bash
   docker compose up -d --wait
   npm ci
   ```
2. Ejecuta la demo:
   ```bash
   node f101-mongoose/demo.js
   ```
3. Mira los documentos tal como los guardó MongoDB, con la consola `mongosh` que trae el contenedor:
   ```bash
   docker compose exec mongo mongosh tienda --quiet --eval "db.productos.find({}, { _id: 0, sku: 1, stock: 1, 'proveedor.pais': 1 }).toArray()"
   ```
4. Rompe el sistema a propósito: apaga MongoDB y vuelve a ejecutar la demo; después enciéndelo.
   ```bash
   docker compose stop mongo
   node f101-mongoose/demo.js
   docker compose start mongo
   ```

**Output esperado** (paso 2, salida real con Node 26.13.1, mongoose 9.12.2 y `mongo:9.0.8` en Docker):

```text
Conectado a tienda · estado 1
Documentos: 3
Oficina hasta 200000: [
  { sku: 'MOU-001', nombre: 'Mouse óptico', precio: 50000 },
  { sku: 'TEC-001', nombre: 'Teclado mecánico', precio: 120000 }
]
Venta de 2 mouse → stock 0
Otra venta de 1 mouse → null
ValidationError → nombre, precio
MongoServerError 11000 → clave duplicada {"sku":"TEC-001"}
Desconectado · estado 0
```

**Output esperado** (paso 3): tres documentos, con el `sku` en mayúsculas aunque lo escribiste en minúsculas, el stock
del mouse en 0 y el país `CO` que nadie envió para los dos primeros:

```text
[
  { sku: 'TEC-001', stock: 5, proveedor: { pais: 'CO' } },
  { sku: 'MOU-001', stock: 0, proveedor: { pais: 'CO' } },
  { sku: 'SIL-001', stock: 1, proveedor: { pais: 'PE' } }
]
```

**Output esperado** (paso 4): tras unos 3 segundos (el `serverSelectionTimeoutMS` de la demo) el proceso termina con
un `MongooseServerSelectionError` cuyo mensaje empieza por `connect ECONNREFUSED` y el puerto 27019, y código de
salida 1.

**Captura comentada:** «estado 1» es `connected` y «estado 0» es `disconnected`. La consulta devolvió solo los tres
campos pedidos, ordenados por precio, y dejó fuera la silla (800 000 > 200 000). La segunda venta devolvió `null`: el
filtro `stock >= 1` no encontró documento, así que no descontó nada. Los dos errores finales son distintos:
`ValidationError` lo produjo **Mongoose en tu proceso**; `MongoServerError 11000` lo produjo **MongoDB** al chocar
con el índice único.

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **mongoose 9.12.2**, **MongoDB 9.0.8** (`mongo:9.0.8` en Docker Compose). Usa el
`package.json`, el `docker-compose.yml` y el `config.js` del inicio del módulo.

`modelo.js`:

```javascript
// Módulo 15 · F101 · MongoDB + Mongoose: el ESQUEMA y el MODELO de un producto del catálogo.
// Requisitos: Node.js 26.13.1 LTS, mongoose 9.12.2 (trae el driver mongodb 7.x). MongoDB 9.0.8 con Docker Compose.
import mongoose from 'mongoose';

const { Schema } = mongoose;

// El esquema es el «formulario» que Mongoose exige ANTES de enviar nada a MongoDB (MongoDB por sí solo no exige forma).
const productoSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true }, // unique crea un ÍNDICE único
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], minlength: 3 },
    precio: { type: Number, required: true, min: [0, 'El precio no puede ser negativo'] },
    stock: { type: Number, default: 0, min: 0 },
    etiquetas: { type: [String], default: [] },
    // Documento EMBEBIDO: vive dentro del producto, se lee y se escribe con él (no hay JOIN).
    proveedor: {
      nombre: { type: String, required: true },
      pais: { type: String, default: 'CO' },
    },
  },
  {
    timestamps: true, // añade createdAt y updatedAt
    strict: 'throw', // un campo que no está en el esquema es un ERROR (por defecto se descarta en silencio)
  },
);

// Índice compuesto para la consulta más frecuente del catálogo: «productos con esta etiqueta, del más barato al más caro».
productoSchema.index({ etiquetas: 1, precio: 1 });

// Propiedad virtual: se calcula al leer, no se guarda.
productoSchema.virtual('agotado').get(function () {
  return this.stock === 0;
});

export const Producto = mongoose.model('Producto', productoSchema); // colección «productos»
```

`repositorio.js`:

```javascript
// Módulo 15 · F101 · Operaciones del catálogo. Cada función es UNA operación atómica de MongoDB.
import { Producto } from './modelo.js';

export async function crear(datos) {
  const producto = await Producto.create(datos); // valida con el esquema y hace insertOne
  return producto.toObject();
}

// lean() devuelve objetos planos (sin la «envoltura» de Mongoose): más rápido y suficiente para responder JSON.
export function porEtiqueta(etiqueta, precioMaximo = Infinity) {
  return Producto.find({ etiquetas: etiqueta, precio: { $lte: precioMaximo } })
    .sort({ precio: 1 })
    .select('sku nombre precio -_id')
    .lean();
}

// Descuenta stock SIN leer primero: el filtro (stock >= cantidad) y el cambio ($inc) viajan en la misma operación,
// así dos compras simultáneas no pueden dejar el stock en negativo. Devuelve null si no alcanzó.
export function descontarStock(sku, cantidad) {
  return Producto.findOneAndUpdate(
    { sku, stock: { $gte: cantidad } },
    { $inc: { stock: -cantidad } },
    { returnDocument: 'after', runValidators: true },
  ).lean();
}

export function vaciar() {
  return Producto.deleteMany({});
}
```

`demo.js`:

```javascript
// Ejecuta: node f101-mongoose/demo.js   (desde modulo-19, con `docker compose up -d --wait`)
import mongoose from 'mongoose';
import { MONGO_URL } from '../config.js';
import { Producto } from './modelo.js';
import { crear, porEtiqueta, descontarStock, vaciar } from './repositorio.js';

await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 3000, maxPoolSize: 10 });
console.log('Conectado a', mongoose.connection.name, '· estado', mongoose.connection.readyState);
await Producto.init(); // espera a que los índices (sku único, etiquetas+precio) estén creados
await vaciar();

await crear({ sku: 'tec-001', nombre: 'Teclado mecánico', precio: 120000, stock: 5, etiquetas: ['oficina', 'gamer'], proveedor: { nombre: 'Andina' } });
await crear({ sku: 'mou-001', nombre: 'Mouse óptico', precio: 50000, stock: 2, etiquetas: ['oficina'], proveedor: { nombre: 'Andina' } });
await crear({ sku: 'sil-001', nombre: 'Silla ergonómica', precio: 800000, stock: 1, etiquetas: ['oficina'], proveedor: { nombre: 'Sur', pais: 'PE' } });
console.log('Documentos:', await Producto.countDocuments());

console.log('Oficina hasta 200000:', await porEtiqueta('oficina', 200000));

const trasVenta = await descontarStock('MOU-001', 2);
console.log('Venta de 2 mouse → stock', trasVenta.stock);
console.log('Otra venta de 1 mouse →', await descontarStock('MOU-001', 1));

try {
  await crear({ sku: 'x', nombre: 'TV', precio: -1, proveedor: { nombre: 'Sur' } });
} catch (error) {
  console.log(error.name, '→', Object.keys(error.errors).sort().join(', '));
}
try {
  await crear({ sku: 'tec-001', nombre: 'Teclado repetido', precio: 1, proveedor: { nombre: 'Sur' } });
} catch (error) {
  console.log(error.name, error.code, '→ clave duplicada', JSON.stringify(error.keyValue));
}

await mongoose.disconnect();
console.log('Desconectado · estado', mongoose.connection.readyState);
```

#### Verificación
Dos archivos de test. El primero no necesita base de datos:

```bash
node --test --test-reporter=spec f101-mongoose/modelo.test.js
```

Salida real (Node 26.13.1, mongoose 9.12.2; los milisegundos cambian):

```text
✔ un producto válido pasa la validación y recibe valores por defecto (9.540048ms)
✔ los errores de validación llegan agrupados por campo (1.404453ms)
✔ un texto donde va un número produce un CastError (1.482891ms)
✔ strict: 'throw' rechaza campos que no están en el esquema (0.876968ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

`f101-mongoose/modelo.test.js`:

```javascript
// Verificación F101 (parte 1, SIN base de datos): node --test f101-mongoose/modelo.test.js
// La validación de Mongoose ocurre en tu proceso, antes de hablar con MongoDB: por eso estos tests no necesitan Docker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Producto } from './modelo.js';

// validate() devuelve una promesa que se rechaza con ValidationError; aquí la convertimos en «el error o undefined».
const errorDe = (documento) => documento.validate().then(() => undefined, (error) => error);

const valido = { sku: ' tec-001 ', nombre: 'Teclado', precio: 120000, proveedor: { nombre: 'Andina' } };

test('un producto válido pasa la validación y recibe valores por defecto', async () => {
  const p = new Producto(valido);
  assert.equal(await errorDe(p), undefined);
  assert.equal(p.sku, 'TEC-001'); // trim + uppercase
  assert.equal(p.stock, 0);
  assert.deepEqual(p.etiquetas.toObject(), []);
  assert.equal(p.proveedor.pais, 'CO');
  assert.equal(p.agotado, true); // virtual
});

test('los errores de validación llegan agrupados por campo', async () => {
  const error = await errorDe(new Producto({ nombre: 'TV', precio: -1 }));
  assert.equal(error.name, 'ValidationError');
  assert.deepEqual(Object.keys(error.errors).sort(), ['nombre', 'precio', 'proveedor.nombre', 'sku']);
  assert.equal(error.errors.precio.message, 'El precio no puede ser negativo');
  assert.equal(error.errors.nombre.kind, 'minlength');
});

test('un texto donde va un número produce un CastError', async () => {
  const error = await errorDe(new Producto({ ...valido, precio: 'gratis' }));
  assert.equal(error.errors.precio.name, 'CastError');
});

test("strict: 'throw' rechaza campos que no están en el esquema", () => {
  assert.throws(() => new Producto({ ...valido, esAdmin: true }), { name: 'StrictModeError' });
});
```

El segundo habla con MongoDB (si MongoDB está apagado, los cuatro tests aparecen como omitidos con `# sin MongoDB`):

```bash
node --test --test-reporter=spec f101-mongoose/repositorio.test.js
```

Salida real con las bases arriba (MongoDB 9.0.8; los milisegundos cambian):

```text
✔ crear guarda el documento con _id y fechas (41.201375ms)
✔ porEtiqueta filtra, ordena por precio y proyecta solo tres campos (6.946958ms)
✔ el índice único rechaza un sku repetido con el código 11000 (3.092ms)
✔ descontarStock es atómico: 5 compras simultáneas de 1 unidad con stock 3 → solo 3 lo logran (7.285166ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

`f101-mongoose/repositorio.test.js`:

```javascript
// Verificación F101 (parte 2, CON MongoDB): node --test f101-mongoose/repositorio.test.js
// Necesita `docker compose up -d --wait`. Si MongoDB no responde, los tests se marcan como omitidos (skip);
// con EXIGIR_INFRA=1 (lo pone los comandos de verificación indicados) la falta de MongoDB es un fallo.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MONGO_URL } from '../config.js';
import { Producto } from './modelo.js';
import { crear, porEtiqueta, descontarStock, vaciar } from './repositorio.js';

let disponible = true;
before(async () => {
  try {
    // Base aparte para no pisar los datos de la demo.
    await mongoose.connect(MONGO_URL, { dbName: 'tienda_test', serverSelectionTimeoutMS: 2000 });
    await Producto.init();
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`MongoDB no disponible (${error.name}): tests omitidos`);
  }
});
beforeEach(async () => { if (disponible) await vaciar(); });
after(() => mongoose.disconnect());

const teclado = { sku: 'tec-001', nombre: 'Teclado', precio: 120000, stock: 3, etiquetas: ['oficina'], proveedor: { nombre: 'Andina' } };

test('crear guarda el documento con _id y fechas', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  const p = await crear(teclado);
  assert.ok(mongoose.isValidObjectId(p._id));
  assert.ok(p.createdAt instanceof Date);
  assert.equal(await Producto.countDocuments(), 1);
});

test('porEtiqueta filtra, ordena por precio y proyecta solo tres campos', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  await crear(teclado);
  await crear({ ...teclado, sku: 'mou-001', nombre: 'Mouse', precio: 50000 });
  await crear({ ...teclado, sku: 'sil-001', nombre: 'Silla', precio: 800000 });
  assert.deepEqual(await porEtiqueta('oficina', 200000), [
    { sku: 'MOU-001', nombre: 'Mouse', precio: 50000 },
    { sku: 'TEC-001', nombre: 'Teclado', precio: 120000 },
  ]);
});

test('el índice único rechaza un sku repetido con el código 11000', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  await crear(teclado);
  await assert.rejects(crear(teclado), { code: 11000 });
});

test('descontarStock es atómico: 5 compras simultáneas de 1 unidad con stock 3 → solo 3 lo logran', async (t) => {
  if (!disponible) return t.skip('sin MongoDB');
  await crear(teclado);
  const resultados = await Promise.all([1, 2, 3, 4, 5].map(() => descontarStock('TEC-001', 1)));
  assert.equal(resultados.filter((r) => r !== null).length, 3);
  assert.equal((await Producto.findOne({ sku: 'TEC-001' }).lean()).stock, 0);
});
```

**Pregunta de comprobación:** si `descontarStock` hiciera primero `findOne` para leer el stock y después `updateOne`
para restarlo, ¿qué pasaría con las cinco compras simultáneas del último test? (Respuesta: las cinco leerían
`stock = 3` antes de que ninguna escribiera, las cinco pasarían la comprobación y el stock terminaría en −2: una
*condición de carrera*. Con filtro y `$inc` en la misma operación, MongoDB las atiende de una en una sobre ese
documento.)

</details>

### PostgreSQL + Prisma/Sequelize

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar el mismo repositorio (crear un cliente con sus pedidos en una transacción, leerlos con una relación, sumar el total) con Sequelize y con Prisma sobre las mismas tablas de PostgreSQL, y comparar ambos ORM; lo compruebas cuando los 3 tests de sequelize.test.js y los 3 d…

#### ► LA IDEA EN UNA FRASE
**Implementar el mismo repositorio (crear un cliente con sus pedidos en una transacción, leerlos con una relación, sumar el total) con Sequelize y con Prisma sobre las mismas tablas de PostgreSQL, y comparar ambos ORM; lo compruebas cuando los 3 tests de sequelize.test.js y los 3 de prisma.test.ts pasan y sabes detectar un problema N+1 contando consultas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en postgresql + prisma/sequelize como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    subgraph NODE["Tu servicio Node.js"]
      REPO_S["sequelize-repo.js<br/>modelos definidos en JS"]
      REPO_P["prisma-repo.ts<br/>cliente generado desde schema.prisma"]
      PG1["driver pg (pool de Sequelize)"]
      PG2["driver pg (PrismaPg, adaptador)"]
      REPO_S --> PG1
      REPO_P --> PG2
    end
    PG1 -- "SQL por TCP 5432" --> DB[("PostgreSQL · base f102")]
    PG2 -- "SQL por TCP 5432" --> DB
    DB --> C["clientes<br/>id PK · nombre · email UNIQUE"]
    DB --> P["pedidos<br/>id PK · total CHECK > 0 · estado ·<br/>creado_en · cliente_id FK"]
    P -- "cliente_id → clientes.id" --> C
```

1. **PostgreSQL** es una base de datos **relacional**: guarda los datos en **tablas** con columnas fijas y filas.
2. **SQL** es el lenguaje para hablarle: `SELECT` lee, `INSERT` añade, `UPDATE` cambia, `DELETE` borra.
3. Una **clave primaria** (`id`) identifica cada fila. Una **clave foránea** (`cliente_id`) apunta a la fila de otra
4. Una **restricción** es una regla que la base hace cumplir pase lo que pase: `NOT NULL` (obligatorio), `UNIQUE` (sin
5. Un **JOIN** combina filas de dos tablas: «dame los pedidos junto con el nombre de su cliente».

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| PostgreSQL + Prisma/Sequelize se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar PostgreSQL + Prisma/Sequelize | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
sync() en producción (el esquema lo decide la aplicación al arrancar):

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: postgresql + prisma/sequelize funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **PostgreSQL** es una base de datos **relacional**: guarda los datos en **tablas** con columnas fijas y filas.
- **SQL** es el lenguaje para hablarle: `SELECT` lee, `INSERT` añade, `UPDATE` cambia, `DELETE` borra.
- Una **clave primaria** (`id`) identifica cada fila. Una **clave foránea** (`cliente_id`) apunta a la fila de otra
- Una **restricción** es una regla que la base hace cumplir pase lo que pase: `NOT NULL` (obligatorio), `UNIQUE` (sin

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve postgresql + prisma/sequelize en tu contexto?
2. ¿Cómo sabrías que postgresql + prisma/sequelize no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar postgresql + prisma/sequelize?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Con las bases arriba (`docker compose up -d --wait`) y `npm ci` hecho, ejecuta la demo de Sequelize:
   ```bash
   node f102-prisma-sequelize/sequelize-demo.js
   ```
2. Genera el cliente de Prisma y ejecuta su demo:
   ```bash
   npm run generate
   node --import tsx f102-prisma-sequelize/prisma-demo.ts
   ```
3. Mira las tablas con `psql` dentro del contenedor: los dos ORM escribieron en las mismas.
   ```bash
   docker compose exec postgres psql -U tienda -d f102 -c "SELECT c.nombre, p.total, p.estado FROM pedidos p JOIN clientes c ON c.id = p.cliente_id ORDER BY p.id"
   ```
4. Cuenta consultas: el problema N+1 y su arreglo.
   ```bash
   node f102-prisma-sequelize/n-mas-1.js
   ```

**Output esperado** (paso 1, salida real con Node 26.13.1 y sequelize 6.37.8):

```text
Cliente creado con id 1
Pedidos de Ana: {"nombre":"Ana","pedidos":[{"total":120000,"estado":"CREADO"},{"total":50000,"estado":"CREADO"}]}
Total vendido: 170000
Transacción deshecha: SequelizeDatabaseError
¿Existe Luis? null
Email repetido: SequelizeUniqueConstraintError
```

**Output esperado** (paso 2, salida real con Prisma 7.10.1 contra PostgreSQL 18.7; los milisegundos cambian).
Primero `npm run generate`:

```text
> modulo-15-persistencia-node@1.0.0 generate
> prisma generate --schema f102-prisma-sequelize/prisma/schema.prisma

Prisma schema loaded from f102-prisma-sequelize/prisma/schema.prisma.

✔ Generated Prisma Client (7.10.1) to ./f102-prisma-sequelize/generated in 11ms
```

Y la demo imprime las mismas tres primeras líneas y el mismo `¿Existe Luis? null`; solo cambian los nombres de los
errores:

```text
Cliente creado con id 1
Pedidos de Ana: {"nombre":"Ana","pedidos":[{"total":120000,"estado":"CREADO"},{"total":50000,"estado":"CREADO"}]}
Total vendido: 170000
Transacción deshecha
¿Existe Luis? null
Email repetido: código P2002
```

**Output esperado** (paso 3):

```text
 nombre | total  | estado
--------+--------+--------
 Ana    | 120000 | CREADO
 Ana    |  50000 | CREADO
(2 rows)
```

**Output esperado** (paso 4, salida real):

```text
N+1: 4 consultas para 3 clientes
  SELECT "id", "total", "estado", "creado_en" AS "creadoEn", "cliente_id" AS "clienteId" FROM "pedidos" AS "Pedido" WHERE "Pedido"."cliente_id" = 1;
include: 1 consulta para 3 clientes con 6 pedidos
```

**Captura comentada:** la transacción de Luis insertó al cliente y su primer pedido, el segundo violó
`CHECK (total > 0)` y el `ROLLBACK` borró todo: por eso «¿Existe Luis?» es `null` y el paso 3 solo muestra a Ana. En
el paso 4, la línea que empieza por `SELECT` es la consulta que se repite una vez por cliente: con 3 clientes son 4
consultas; con 1 000 serían 1 001.

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **sequelize 6.37.8**, **prisma** y **@prisma/client 7.10.1**,
**@prisma/adapter-pg 7.10.1**, **pg 8.23.1**, **tsx 4.23.15**, **PostgreSQL 18.7** (`postgres:18.7`). Usa el
`package.json`, el `docker-compose.yml` y el `config.js` del inicio del módulo.

`001-esquema.sql`:

```sql
-- Módulo 15 · F102 · Esquema relacional que usan los DOS ORM (Prisma y Sequelize leen y escriben estas mismas tablas).
-- Lo aplica:  node f102-prisma-sequelize/preparar.js   (borra y vuelve a crear: el laboratorio es repetible)
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS clientes;

CREATE TABLE clientes (
  id     INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE
);

CREATE TABLE pedidos (
  id         INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  total      INTEGER NOT NULL CHECK (total > 0),
  estado     TEXT NOT NULL DEFAULT 'CREADO',
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
  cliente_id INTEGER NOT NULL REFERENCES clientes (id)
);
CREATE INDEX pedidos_cliente_idx ON pedidos (cliente_id);
```

`preparar.js`:

```javascript
// Módulo 15 · F102 · Aplica sql/001-esquema.sql en la base f102 con el driver pg (no necesitas tener psql instalado).
// Ejecuta: node f102-prisma-sequelize/preparar.js
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { pgUrl } from '../config.js';

export async function prepararEsquema() {
  const sql = await readFile(new URL('./sql/001-esquema.sql', import.meta.url), 'utf8');
  const cliente = new pg.Client({ connectionString: pgUrl('f102') });
  await cliente.connect();
  try {
    await cliente.query(sql); // varias sentencias separadas por ; en una sola llamada
  } finally {
    await cliente.end();
  }
}

if (import.meta.main) {
  await prepararEsquema();
  console.log('Esquema aplicado en f102: tablas clientes y pedidos');
}
```

**Con Sequelize** — `f102-prisma-sequelize/sequelize-repo.js`:

```javascript
// Módulo 15 · F102 · PostgreSQL con Sequelize 6.37.8 (ORM clásico: los modelos se definen en JavaScript).
// Requisitos: Node.js 26.13.1 LTS, sequelize 6.37.8, pg 8.23.1. PostgreSQL 18.7 con Docker Compose.
import { Sequelize, DataTypes } from 'sequelize';
import { pgUrl } from '../config.js';

export function conectar({ logging = false } = {}) {
  // Sequelize abre su propio pool de conexiones (aquí, máximo 5).
  const sequelize = new Sequelize(pgUrl('f102'), { logging, pool: { max: 5, idle: 10000 } });

  // Cada modelo dice a qué tabla y columnas corresponde. timestamps: false → no busca createdAt/updatedAt.
  const Cliente = sequelize.define('Cliente', {
    nombre: { type: DataTypes.TEXT, allowNull: false },
    email: { type: DataTypes.TEXT, allowNull: false, unique: true },
  }, { tableName: 'clientes', timestamps: false });

  const Pedido = sequelize.define('Pedido', {
    total: { type: DataTypes.INTEGER, allowNull: false },
    estado: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'CREADO' },
    creadoEn: { type: DataTypes.DATE, field: 'creado_en', defaultValue: DataTypes.NOW },
    clienteId: { type: DataTypes.INTEGER, field: 'cliente_id', allowNull: false },
  }, { tableName: 'pedidos', timestamps: false });

  // La relación 1 → N: un cliente tiene muchos pedidos.
  Cliente.hasMany(Pedido, { as: 'pedidos', foreignKey: 'clienteId' });
  Pedido.belongsTo(Cliente, { as: 'cliente', foreignKey: 'clienteId' });

  return { sequelize, Cliente, Pedido };
}

// Crea el cliente y sus pedidos en UNA transacción: o se guardan todos o ninguno.
export function crearClienteConPedidos({ sequelize, Cliente, Pedido }, { nombre, email }, totales) {
  return sequelize.transaction(async (transaction) => {
    const cliente = await Cliente.create({ nombre, email }, { transaction });
    for (const total of totales) {
      await Pedido.create({ total, clienteId: cliente.id }, { transaction });
    }
    return cliente.id;
  }); // si el callback lanza, Sequelize hace ROLLBACK; si termina bien, COMMIT
}

// include = JOIN: trae el cliente y sus pedidos en UNA consulta.
export async function pedidosDe({ Cliente }, email) {
  const cliente = await Cliente.findOne({
    where: { email },
    include: { association: 'pedidos', attributes: ['total', 'estado'] },
    order: [['pedidos', 'id', 'ASC']],
  });
  if (!cliente) return null;
  const { nombre, pedidos } = cliente.toJSON();
  return { nombre, pedidos };
}

export async function totalVendido({ Pedido }) {
  return (await Pedido.sum('total')) ?? 0;
}
```

`f102-prisma-sequelize/sequelize-demo.js`:

```javascript
// Ejecuta: node f102-prisma-sequelize/sequelize-demo.js   (desde modulo-19)
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './sequelize-repo.js';

await prepararEsquema();
const db = conectar();

const id = await crearClienteConPedidos(db, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
console.log('Cliente creado con id', id);
console.log('Pedidos de Ana:', JSON.stringify(await pedidosDe(db, 'ana@correo.co')));
console.log('Total vendido:', await totalVendido(db));

try {
  // El segundo pedido viola CHECK (total > 0): la transacción entera se deshace, Luis tampoco queda guardado.
  await crearClienteConPedidos(db, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]);
} catch (error) {
  console.log('Transacción deshecha:', error.name);
}
console.log('¿Existe Luis?', await pedidosDe(db, 'luis@correo.co'));

try {
  await crearClienteConPedidos(db, { nombre: 'Otra Ana', email: 'ana@correo.co' }, []);
} catch (error) {
  console.log('Email repetido:', error.name);
}

await db.sequelize.close();
```

**Con Prisma** — `f102-prisma-sequelize/prisma/schema.prisma`:

```prisma
// Módulo 15 · F102 · Esquema de Prisma 7.10.1: describe las MISMAS tablas que crea sql/001-esquema.sql.
// Genera el cliente con:  npm run generate   (escribe TypeScript en f102-prisma-sequelize/generated/)
generator client {
  provider = "prisma-client" // generador de Prisma 7: cliente en TypeScript, sin motor de consultas en Rust
  output   = "../generated"  // obligatorio en Prisma 7: el cliente ya no se escribe dentro de node_modules
}

datasource db {
  provider = "postgresql" // la URL ya no va aquí: se la das al adaptador (PrismaPg) al crear el cliente
}

model Cliente {
  id      Int      @id @default(autoincrement())
  nombre  String
  email   String   @unique
  pedidos Pedido[]

  @@map("clientes")
}

model Pedido {
  id        Int      @id @default(autoincrement())
  total     Int
  estado    String   @default("CREADO")
  creadoEn  DateTime @default(now()) @map("creado_en") @db.Timestamptz(6)
  clienteId Int      @map("cliente_id")
  cliente   Cliente  @relation(fields: [clienteId], references: [id])

  @@index([clienteId], map: "pedidos_cliente_idx")
  @@map("pedidos")
}
```

`f102-prisma-sequelize/prisma-repo.ts`:

```typescript
// Módulo 15 · F102 · PostgreSQL con Prisma 7.10.1 (ORM con esquema declarativo y cliente generado con tipos).
// Requisitos: Node.js 26.13.1 LTS, prisma y @prisma/client 7.10.1, @prisma/adapter-pg 7.10.1, pg 8.23.1, tsx 4.23.15.
// Antes de ejecutar:  npm run generate   (crea ./generated a partir de prisma/schema.prisma)
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.ts';
import { pgUrl } from '../config.js';

export function conectar(): PrismaClient {
  // Prisma 7 habla con PostgreSQL a través del driver pg: el adaptador crea un pg.Pool con estas opciones.
  const adapter = new PrismaPg({ connectionString: pgUrl('f102'), max: 5 });
  return new PrismaClient({ adapter });
}

// Transacción interactiva: `tx` es un cliente atado a UNA conexión con BEGIN abierto.
export function crearClienteConPedidos(prisma: PrismaClient, datos: { nombre: string; email: string }, totales: number[]): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.create({ data: datos });
    for (const total of totales) {
      await tx.pedido.create({ data: { total, clienteId: cliente.id } });
    }
    return cliente.id;
  }); // si el callback lanza → ROLLBACK; si termina → COMMIT
}

// select anidado: Prisma trae el cliente y sus pedidos y devuelve EXACTAMENTE la forma pedida (con tipos).
export function pedidosDe(prisma: PrismaClient, email: string) {
  return prisma.cliente.findUnique({
    where: { email },
    select: { nombre: true, pedidos: { select: { total: true, estado: true }, orderBy: { id: 'asc' } } },
  });
}

export async function totalVendido(prisma: PrismaClient): Promise<number> {
  const resultado = await prisma.pedido.aggregate({ _sum: { total: true } });
  return resultado._sum.total ?? 0;
}
```

`f102-prisma-sequelize/prisma-demo.ts`:

```typescript
// Ejecuta: npm run generate && npx tsx f102-prisma-sequelize/prisma-demo.ts   (desde modulo-19)
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './prisma-repo.ts';

await prepararEsquema();
const prisma = conectar();

const id = await crearClienteConPedidos(prisma, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
console.log('Cliente creado con id', id);
console.log('Pedidos de Ana:', JSON.stringify(await pedidosDe(prisma, 'ana@correo.co')));
console.log('Total vendido:', await totalVendido(prisma));

try {
  // El segundo pedido viola CHECK (total > 0): la transacción entera se deshace, Luis tampoco queda guardado.
  await crearClienteConPedidos(prisma, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]);
} catch {
  console.log('Transacción deshecha');
}
console.log('¿Existe Luis?', await pedidosDe(prisma, 'luis@correo.co'));

try {
  await crearClienteConPedidos(prisma, { nombre: 'Otra Ana', email: 'ana@correo.co' }, []);
} catch (error) {
  console.log('Email repetido: código', (error as { code?: string }).code);
}

await prisma.$disconnect();
```

#### Verificación
```bash
node --test --test-reporter=spec f102-prisma-sequelize/sequelize.test.js
npm run generate && node --import tsx --test --test-reporter=spec f102-prisma-sequelize/prisma.test.ts
```

Salida real de la primera orden (los milisegundos cambian):

```text
✔ guarda un cliente con sus pedidos y los lee con un JOIN (160.940385ms)
✔ si un pedido falla, la transacción deshace también el cliente (20.895742ms)
✔ el email repetido produce SequelizeUniqueConstraintError (13.052976ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

Salida real de la segunda (Prisma 7.10.1 contra PostgreSQL 18.7):

```text
✔ guarda un cliente con sus pedidos y los lee con la forma pedida (90.024208ms)
✔ si un pedido falla, $transaction deshace también el cliente (18.36575ms)
✔ el email repetido produce el error P2002 (restricción única) (7.43975ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

`f102-prisma-sequelize/sequelize.test.js`:

```javascript
// Verificación F102 (Sequelize): node --test f102-prisma-sequelize/sequelize.test.js   (necesita PostgreSQL)
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './sequelize-repo.js';

let db;
let disponible = true;
before(async () => {
  try {
    await prepararEsquema();
    db = conectar();
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`PostgreSQL no disponible (${error.code ?? error.name}): tests omitidos`);
  }
});
beforeEach(async () => { if (disponible) await db.sequelize.query('TRUNCATE pedidos, clientes RESTART IDENTITY'); });
after(async () => { if (db) await db.sequelize.close(); });

test('guarda un cliente con sus pedidos y los lee con un JOIN', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await crearClienteConPedidos(db, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
  assert.deepEqual(await pedidosDe(db, 'ana@correo.co'), {
    nombre: 'Ana',
    pedidos: [{ total: 120000, estado: 'CREADO' }, { total: 50000, estado: 'CREADO' }],
  });
  assert.equal(await totalVendido(db), 170000);
});

test('si un pedido falla, la transacción deshace también el cliente', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await assert.rejects(crearClienteConPedidos(db, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]), { name: 'SequelizeDatabaseError' });
  assert.equal(await pedidosDe(db, 'luis@correo.co'), null);
  assert.equal(await totalVendido(db), 0);
});

test('el email repetido produce SequelizeUniqueConstraintError', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await crearClienteConPedidos(db, { nombre: 'Ana', email: 'ana@correo.co' }, []);
  await assert.rejects(crearClienteConPedidos(db, { nombre: 'Otra', email: 'ana@correo.co' }, []), { name: 'SequelizeUniqueConstraintError' });
});
```

`f102-prisma-sequelize/prisma.test.ts`:

```typescript
// Verificación F102 (Prisma): npm run generate && node --import tsx --test f102-prisma-sequelize/prisma.test.ts
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './prisma-repo.ts';

const prisma = conectar();
before(() => prepararEsquema());
beforeEach(() => prisma.$executeRawUnsafe('TRUNCATE pedidos, clientes RESTART IDENTITY'));
after(() => prisma.$disconnect());

test('guarda un cliente con sus pedidos y los lee con la forma pedida', async () => {
  await crearClienteConPedidos(prisma, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
  assert.deepEqual(await pedidosDe(prisma, 'ana@correo.co'), {
    nombre: 'Ana',
    pedidos: [{ total: 120000, estado: 'CREADO' }, { total: 50000, estado: 'CREADO' }],
  });
  assert.equal(await totalVendido(prisma), 170000);
});

test('si un pedido falla, $transaction deshace también el cliente', async () => {
  await assert.rejects(crearClienteConPedidos(prisma, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]));
  assert.equal(await pedidosDe(prisma, 'luis@correo.co'), null);
  assert.equal(await totalVendido(prisma), 0);
});

test('el email repetido produce el error P2002 (restricción única)', async () => {
  await crearClienteConPedidos(prisma, { nombre: 'Ana', email: 'ana@correo.co' }, []);
  await assert.rejects(crearClienteConPedidos(prisma, { nombre: 'Otra', email: 'ana@correo.co' }, []), { code: 'P2002' });
});
```

**Pregunta de comprobación:** en `crearClienteConPedidos` de Sequelize, ¿qué pasa si olvidas `{ transaction }` en
`Pedido.create`? (Respuesta: ese `INSERT` sale por **otra** conexión del pool, fuera de la transacción. Como el
cliente todavía no está confirmado, esa otra conexión no lo ve y la clave foránea falla con `SequelizeForeignKeyConstraintError`; y en casos sin clave
foránea, el dato quedaría guardado aunque la transacción haga `ROLLBACK`.)

</details>

### Database-per-service

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir dos servicios Node.js, pedidos e inventario, cada uno con su base y su usuario de PostgreSQL, demostrar que ninguno puede leer la base del otro y sustituir el JOIN entre servicios por una llamada a la API del dueño del dato; lo compruebas cuando node --test f103-databas…

#### ► LA IDEA EN UNA FRASE
**Construir dos servicios Node.js, pedidos e inventario, cada uno con su base y su usuario de PostgreSQL, demostrar que ninguno puede leer la base del otro y sustituir el JOIN entre servicios por una llamada a la API del dueño del dato; lo compruebas cuando node --test f103-database-per-service/aislamiento.test.js pasa 4 de 4 y puedes explicar qué se pierde y qué se gana frente a una base compartida.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en database-per-service como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    CLI["Cliente"] -- "POST /pedidos" --> PED["Servicio pedidos<br/>(Express)"]
    PED -- "POST /reservas<br/>HTTP + timeout" --> INV["Servicio inventario<br/>(Express)"]
    PED -- "usuario pedidos_app" --> DBP[("pedidos_db<br/>tabla pedidos")]
    INV -- "usuario inventario_app" --> DBI[("inventario_db<br/>tabla stock")]
    PED -. "✘ permission denied<br/>for database inventario_db" .-> DBI
```

1. **Database-per-service** es una regla: **cada microservicio es el único dueño de sus datos**. Ningún otro servicio
2. Si pedidos necesita un dato de inventario, **se lo pide a inventario por su API** (o escucha los eventos que
3. «Su base» no significa por fuerza otro servidor: pueden ser dos bases dentro del mismo PostgreSQL, como en el
4. ¿Por qué? Porque si dos servicios comparten tablas, no puedes cambiar una tabla sin coordinar a dos equipos, ni

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Database-per-service se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Database-per-service | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Base de datos compartida como punto de integración (*shared database* / *integration database*): varios servicios leen y escriben las mismas tablas.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: database-per-service funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **Database-per-service** es una regla: **cada microservicio es el único dueño de sus datos**. Ningún otro servicio
- Si pedidos necesita un dato de inventario, **se lo pide a inventario por su API** (o escucha los eventos que
- «Su base» no significa por fuerza otro servidor: pueden ser dos bases dentro del mismo PostgreSQL, como en el
- ¿Por qué? Porque si dos servicios comparten tablas, no puedes cambiar una tabla sin coordinar a dos equipos, ni

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve database-per-service en tu contexto?
2. ¿Cómo sabrías que database-per-service no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar database-per-service?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    CLI["Cliente"] -- "POST /pedidos" --> PED["Servicio pedidos<br/>(Express)"]
    PED -- "POST /reservas<br/>HTTP + timeout" --> INV["Servicio inventario<br/>(Express)"]
    PED -- "usuario pedidos_app" --> DBP[("pedidos_db<br/>tabla pedidos")]
    INV -- "usuario inventario_app" --> DBI[("inventario_db<br/>tabla stock")]
    PED -. "✘ permission denied<br/>for database inventario_db" .-> DBI
```

```javascript
// Módulo 15 · F103 · Database-per-service: el servicio INVENTARIO es el único dueño de la base inventario_db.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, pg 8.23.1. PostgreSQL 18.7 con Docker Compose.
import express from 'express';
import pg from 'pg';
import { pgUrl } from '../config.js';

export async function crearInventario() {
  // Usuario propio: inventario_app solo puede entrar a inventario_db (ver initdb/01-bases.sql).
  const pool = new pg.Pool({ connectionString: pgUrl('inventario_db', 'inventario_app', 'inventario'), max: 5 });
  await pool.query(`
    DROP TABLE IF EXISTS stock;
    CREATE TABLE stock (sku TEXT PRIMARY KEY, disponible INTEGER NOT NULL CHECK (disponible >= 0));
    INSERT INTO stock VALUES ('TEC-001', 3), ('MOU-001', 0);
  `);

  const app = express();
  app.use(express.json());

  // La API es el ÚNICO camino para que otro servicio conozca o cambie el stock.
  app.get('/stock/:sku', async (req, res) => {
    const { rows } = await pool.query('SELECT sku, disponible FROM stock WHERE sku = $1', [req.params.sku]);
    if (rows.length === 0) return res.status(404).json({ error: 'SKU desconocido' });
    res.json(rows[0]);
  });

  app.post('/reservas', async (req, res) => {
    const { sku, cantidad } = req.body;
    // Descuento atómico: la condición y el cambio van en la misma sentencia.
    const { rows } = await pool.query(
      'UPDATE stock SET disponible = disponible - $2 WHERE sku = $1 AND disponible >= $2 RETURNING disponible',
      [sku, cantidad],
    );
    if (rows.length === 0) return res.status(409).json({ error: 'Stock insuficiente' });
    res.status(201).json({ sku, reservado: cantidad, disponible: rows[0].disponible });
  });

  return { app, pool };
}
```

```javascript
// Módulo 15 · F103 · Database-per-service: el servicio PEDIDOS es dueño de pedidos_db y NO conoce las tablas de inventario.
import express from 'express';
import pg from 'pg';
import { pgUrl } from '../config.js';

export async function crearPedidos({ inventarioUrl }) {
  const pool = new pg.Pool({ connectionString: pgUrl('pedidos_db', 'pedidos_app', 'pedidos'), max: 5 });
  await pool.query(`
    DROP TABLE IF EXISTS pedidos;
    CREATE TABLE pedidos (
      id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      sku      TEXT NOT NULL,          -- referencia LÓGICA al producto: no hay FOREIGN KEY hacia otra base
      cantidad INTEGER NOT NULL,
      estado   TEXT NOT NULL
    );
  `);

  const app = express();
  app.use(express.json());

  app.post('/pedidos', async (req, res) => {
    const { sku, cantidad } = req.body;
    // En lugar de un JOIN o un UPDATE sobre la tabla ajena, PEDIMOS la reserva por la API del dueño del dato.
    const respuesta = await fetch(`${inventarioUrl}/reservas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sku, cantidad }),
      signal: AbortSignal.timeout(2000), // nunca llames a otro servicio sin timeout
    });
    const estado = respuesta.status === 201 ? 'CONFIRMADO' : 'RECHAZADO';
    const { rows } = await pool.query(
      'INSERT INTO pedidos (sku, cantidad, estado) VALUES ($1, $2, $3) RETURNING id, sku, cantidad, estado',
      [sku, cantidad, estado],
    );
    res.status(estado === 'CONFIRMADO' ? 201 : 409).json(rows[0]);
  });

  app.get('/pedidos/:id', async (req, res) => {
    const { rows } = await pool.query('SELECT id, sku, cantidad, estado FROM pedidos WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido desconocido' });
    res.json(rows[0]);
  });

  return { app, pool };
}
```

```javascript
// Módulo 15 · F103 · Levanta los dos servicios en puertos libres (puerto 0) y devuelve sus URL y una función para apagarlos.
import { once } from 'node:events';
import { crearInventario } from './inventario.js';
import { crearPedidos } from './pedidos.js';

async function escuchar(app, puerto) {
  const servidor = app.listen(puerto);
  await once(servidor, 'listening');
  return servidor;
}

export async function arrancar({ puertoInventario = 0, puertoPedidos = 0 } = {}) {
  const inventario = await crearInventario();
  const sInventario = await escuchar(inventario.app, puertoInventario);
  const inventarioUrl = `http://localhost:${sInventario.address().port}`;

  const pedidos = await crearPedidos({ inventarioUrl });
  const sPedidos = await escuchar(pedidos.app, puertoPedidos);
  const pedidosUrl = `http://localhost:${sPedidos.address().port}`;

  async function apagar() {
    sPedidos.close();
    sInventario.close();
    await pedidos.pool.end();
    await inventario.pool.end();
  }
  return { inventarioUrl, pedidosUrl, apagar };
}

// node f103-database-per-service/arrancar.js  → deja los servicios en 3103 (pedidos) y 3203 (inventario) para usar curl
if (import.meta.main) {
  const { pedidosUrl, inventarioUrl } = await arrancar({ puertoPedidos: 3103, puertoInventario: 3203 });
  console.log(`pedidos en ${pedidosUrl} (base pedidos_db) · inventario en ${inventarioUrl} (base inventario_db) · Ctrl+C para salir`);
}
```

```javascript
// Ejecuta: node f103-database-per-service/demo.js   (desde modulo-19)
import pg from 'pg';
import { pgUrl } from '../config.js';
import { arrancar } from './arrancar.js';

const { pedidosUrl, inventarioUrl, apagar } = await arrancar();
const pedir = async (sku, cantidad) => {
  const r = await fetch(`${pedidosUrl}/pedidos`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sku, cantidad }) });
  return `${r.status} ${JSON.stringify(await r.json())}`;
};

console.log('Pedido de 2 teclados →', await pedir('TEC-001', 2));
console.log('Pedido de 2 teclados →', await pedir('TEC-001', 2));
console.log('Stock según inventario →', JSON.stringify(await (await fetch(`${inventarioUrl}/stock/TEC-001`)).json()));

// ¿Y si pedidos intenta «atajar» entrando a la base de inventario con SU usuario?
const intruso = new pg.Client({ connectionString: pgUrl('inventario_db', 'pedidos_app', 'pedidos') });
try {
  await intruso.connect();
  console.log('ALERTA: pedidos_app pudo entrar a inventario_db');
  await intruso.end();
} catch (error) {
  console.log('pedidos_app → inventario_db:', error.message);
}

await apagar();
```

```bash
   node f103-database-per-service/demo.js
   ```

</details>

### Connection pooling y transacciones

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Configurar un pool de conexiones y medir cómo su tamaño cambia la latencia de 20 consultas simultáneas, implementar una transferencia con BEGIN/COMMIT/ROLLBACK que nunca deja el dinero a medias y diagnosticar una fuga de conexiones; lo compruebas cuando node --test f104-pool-tran…

#### ► LA IDEA EN UNA FRASE
**Configurar un pool de conexiones y medir cómo su tamaño cambia la latencia de 20 consultas simultáneas, implementar una transferencia con BEGIN/COMMIT/ROLLBACK que nunca deja el dinero a medias y diagnosticar una fuga de conexiones; lo compruebas cuando node --test f104-pool-transacciones/pool.test.js pasa 5 de 5 y predices cuánto tardará el lote con max = 10.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
**El pool:** dibuja una **parada de taxis** frente a un hotel. Hay **5 taxis** con el motor encendido (conexiones ya
abiertas). Un huésped (una consulta) sube al primero libre, hace su viaje y el taxi **vuelve a la parada**. Si llegan
20 huéspedes a la vez, 5 salen y **15 hacen fila**; nadie fabrica un coche nuevo por cada viaje (abrir una conexión
cuesta: saludo de red, autenticación y un proceso nuevo en PostgreSQL). Un cartel en la fila dice «espera máxima:
2 s» (`connectionTimeoutMillis`). El desastre: un huésped que **se lleva el taxi a su casa y no lo devuelve** (olvidó
`release()`); cuando lo han hecho cinco, la parada está vacía y la fila no avanza nunca.

**La transacción:** dibuja un **cajero haciendo una transferencia** con dos libretas abiertas. Saca 30 de la libreta
de Ana y los apunta en la de Luis, pero escribe **a lápiz**. Solo al final pasa todo a tinta de una vez (`COMMIT`).
Si a mitad se va la luz o algo no cuadra, borra el lápiz (`ROLLBACK`) y las dos libretas quedan como estaban. Nunca
existe el momento «el dinero salió de Ana y no llegó a Luis».

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant A as App (transferir)
    participant P as Pool (max 5)
    participant C as Conexión nº 3
    participant DB as PostgreSQL
    A->>P: pool.connect()
    P-->>A: client (conexión nº 3, prestada)
    A->>C: BEGIN
    C->>DB: BEGIN
    A->>C: UPDATE cuentas SET saldo = saldo - 30 (ana)
    A->>C: UPDATE cuentas SET saldo = saldo + 30 (luis)
    alt todo bien
      A->>C: COMMIT
      C->>DB: los dos cambios se hacen visibles a la vez
    else algún paso falla
      A->>C: ROLLBACK
      C->>DB: ningún cambio queda
    end
    A->>P: client.release() (en finally)
    Note over P: la conexión nº 3 vuelve a estar libre
```

1. Una **conexión** es una línea abierta entre tu servicio y la base de datos. Abrirla tarda y la base solo admite un
2. Un **pool** es un grupo de conexiones que se abren una vez y se **reutilizan**: cada consulta toma una prestada y
3. Si todas están ocupadas, las consultas nuevas **esperan en fila**.
4. Una **transacción** agrupa varias operaciones para que se comporten como una sola: **o se hacen todas, o no se hace
5. `BEGIN` empieza la transacción, `COMMIT` la confirma y `ROLLBACK` la deshace.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Connection pooling y transacciones se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Connection pooling y transacciones | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
«Transacción» con pool.query (y su primo: abrir una conexión nueva por petición). Cada pool.query puede usar una conexión distinta, y las sentencias de dos peticiones simultáneas se entremezclan. f104-pool-transacciones/anti-patron.js lanza dos peticiones a la vez: la 1 debe fallar (Eva no existe) y la 2 debe mover 20 de Luis a Ana.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: connection pooling y transacciones funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una **conexión** es una línea abierta entre tu servicio y la base de datos. Abrirla tarda y la base solo admite un
- Un **pool** es un grupo de conexiones que se abren una vez y se **reutilizan**: cada consulta toma una prestada y
- Si todas están ocupadas, las consultas nuevas **esperan en fila**.
- Una **transacción** agrupa varias operaciones para que se comporten como una sola: **o se hacen todas, o no se hace

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve connection pooling y transacciones en tu contexto?
2. ¿Cómo sabrías que connection pooling y transacciones no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar connection pooling y transacciones?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS**, **pg 8.23.1**, **PostgreSQL 18.7**. Usa el `package.json`, el
`docker-compose.yml` y el `config.js` del inicio del módulo.

`pool.js`:

```javascript
// Módulo 15 · F104 · Connection pooling con pg 8.23.1: un grupo de conexiones abiertas que se prestan y se devuelven.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1. PostgreSQL 18.7 con Docker Compose.
import pg from 'pg';
import { pgUrl } from '../config.js';

export function crearPool(opciones = {}) {
  const pool = new pg.Pool({
    connectionString: pgUrl('f104'),
    max: 5, // máximo de conexiones abiertas a la vez (por defecto 10)
    idleTimeoutMillis: 10000, // cierra las que lleven 10 s sin uso
    connectionTimeoutMillis: 2000, // si en 2 s nadie devuelve una conexión, error (por defecto espera para siempre)
    ...opciones,
  });
  // Una conexión ociosa puede romperse (reinicio de la base, red): sin este manejador, el evento 'error' tumba el proceso.
  pool.on('error', (error) => console.error('Conexión ociosa perdida:', error.message));
  return pool;
}

// Lanza `consultas` consultas de 100 ms a la vez y mide cuánto tarda el lote y cuántas llegaron a hacer fila.
export async function medir(max, consultas = 20) {
  const pool = crearPool({ max });
  let enFila = 0;
  const inicio = performance.now();
  const lote = Array.from({ length: consultas }, () => pool.query('SELECT pg_sleep(0.1)'));
  enFila = pool.waitingCount; // peticiones esperando a que se libere una conexión
  await Promise.all(lote);
  const ms = performance.now() - inicio;
  const abiertas = pool.totalCount;
  await pool.end();
  return { max, ms, enFila, abiertas };
}
```

`cuentas.js`:

```javascript
// Módulo 15 · F104 · Transacciones con pg: BEGIN … COMMIT / ROLLBACK sobre UNA conexión prestada del pool.

export async function preparar(pool) {
  await pool.query(`
    DROP TABLE IF EXISTS cuentas;
    CREATE TABLE cuentas (id TEXT PRIMARY KEY, saldo INTEGER NOT NULL CHECK (saldo >= 0));
    INSERT INTO cuentas VALUES ('ana', 100), ('luis', 50);
  `);
}

export async function saldos(pool) {
  const { rows } = await pool.query('SELECT id, saldo FROM cuentas ORDER BY id');
  return Object.fromEntries(rows.map((f) => [f.id, f.saldo]));
}

// BIEN: pedimos UNA conexión (client) y todas las sentencias de la transacción viajan por ella.
export async function transferir(pool, origen, destino, monto) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, origen]);
    const abono = await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, destino]);
    if (abono.rowCount === 0) throw new Error(`La cuenta ${destino} no existe`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK'); // deshace TODO lo hecho desde BEGIN
    throw error;
  } finally {
    client.release(); // SIEMPRE devuelve la conexión, haya ido bien o mal
  }
}

// MAL (anti-patrón): pool.query() toma una conexión cualquiera para CADA sentencia.
// BEGIN, los UPDATE y el COMMIT/ROLLBACK pueden mezclarse con los de otra petición.
export async function transferirMal(pool, origen, destino, monto) {
  try {
    await pool.query('BEGIN');
    await pool.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, origen]);
    const abono = await pool.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, destino]);
    if (abono.rowCount === 0) throw new Error(`La cuenta ${destino} no existe`);
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}
```

`demo.js`:

```javascript
// Ejecuta: node f104-pool-transacciones/demo.js   (desde modulo-19)
import { crearPool, medir } from './pool.js';
import { preparar, saldos, transferir } from './cuentas.js';

console.log('— Pool: 20 consultas de 100 ms a la vez —');
for (const max of [1, 5, 20]) {
  const { ms, enFila, abiertas } = await medir(max);
  console.log(`max=${String(max).padEnd(2)} → ${Math.round(ms / 100) * 100} ms aprox. · en fila al empezar: ${enFila} · conexiones abiertas: ${abiertas}`);
}

console.log('— Transacciones —');
const pool = crearPool();
await preparar(pool);
console.log('Inicio:', await saldos(pool));

await transferir(pool, 'ana', 'luis', 30);
console.log('Ana → Luis 30 (COMMIT):', await saldos(pool));

try {
  await transferir(pool, 'ana', 'luis', 500); // Ana no tiene 500: CHECK (saldo >= 0) falla
} catch (error) {
  console.log('Ana → Luis 500:', error.message);
}
try {
  await transferir(pool, 'ana', 'eva', 10); // Eva no existe: ya se había descontado a Ana
} catch (error) {
  console.log('Ana → Eva 10:', error.message);
}
console.log('Tras los dos ROLLBACK:', await saldos(pool));
console.log(`Pool: total=${pool.totalCount} libres=${pool.idleCount} en fila=${pool.waitingCount}`);
await pool.end();
```

</details>
