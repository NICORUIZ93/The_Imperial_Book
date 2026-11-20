# Módulo 15 · Persistencia

**Fase 2 · Node.js de cero a experto** (semana 4 de 12). **Duración:** 10 h (4 temas de 2 h y 2 h de laboratorio
integrador). **Dificultad:** 3 de 5. **Dependencias:** Módulo 13 (promesas, `async/await`, módulos ES) y Módulo 14
(Express); de la Fase 0, Docker básico (Módulo 0.5) y variables de entorno (Módulo 0.4). No necesita la Fase 1: todo lo
de bases de datos se explica aquí desde cero. **Herramientas:** **Node.js 26.13.1 LTS**, **mongoose 9.12.2** (driver
`mongodb` 7.x), **prisma** y **@prisma/client 7.10.1** con **@prisma/adapter-pg 7.10.1**, **sequelize 6.37.8**,
**pg 8.23.1**, **express 5.3.0**, **tsx 4.23.15**, **TypeScript 6.0.3**; **MongoDB 9.0.8** y **PostgreSQL 18.7** con
Docker Compose. **Laboratorio:** `examples/microservicios/modulo-19/` (una carpeta por tema;
`./verificar.sh --compose` levanta las bases, ejecuta los tests y cada programa, y guarda los logs en `logs/`).

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
cd examples/microservicios/modulo-19
./verificar.sh --compose     # docker compose up + npm ci + prisma generate + tests + programas → «RESULTADO: OK»
```

Para trabajar ficha por ficha, deja las bases arriba y ejecuta las órdenes **desde
`examples/microservicios/modulo-19`**:

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

#### 1. UBICACIÓN

Módulo 15, Lección 1 de 4 · Fase 2 · Laboratorio `examples/microservicios/modulo-19/f101-mongoose/`.

#### 2. PRERREQUISITOS

- Objetos y arreglos de JavaScript, JSON (Módulo 0.4) y `async/await` con `try/catch` (Módulo 13).
- Levantar contenedores con `docker compose up` (Módulo 0.5).
- `docker compose up -d --wait` y `npm ci` hechos en `examples/microservicios/modulo-19`.

#### 3. OBJETIVO DE APRENDIZAJE

**Modelar** un producto como documento con un esquema de Mongoose, **ejecutar** altas, consultas con filtro, orden y
proyección, y una actualización atómica, y **diagnosticar** los errores de validación, de clave duplicada y de
conexión; lo compruebas cuando `node --test f101-mongoose/*.test.js` pasa 8 de 8 y explicas por qué cinco compras simultáneas
de un producto con 3 unidades dejan el stock en 0 y no en −2.

#### 4. ANALOGÍA VISUAL

Dibuja un **archivador de carpetas colgantes**. Cada carpeta es un **documento**: dentro lleva *todo* lo de un
producto en hojas grapadas (su nombre, su precio, una lista de etiquetas adhesivas y, en una sub-carpeta interior, los
datos de su proveedor). Para saber todo de un producto sacas **una** carpeta; no vas a otros cajones a buscar piezas.
Un cajón entero es una **colección** («productos»), y el mueble es la **base de datos**. Las carpetas no tienen por
qué ser iguales: MongoDB acepta cualquiera. Por eso en la puerta del archivo hay una **recepcionista con un
formulario** (Mongoose): revisa cada carpeta antes de dejarla entrar («falta el nombre», «el precio no puede ser
negativo») y la devuelve si no cumple. En el lateral del cajón, unas **pestañas de colores ordenadas** (los índices)
permiten encontrar una carpeta por su código sin abrirlas todas; una pestaña con candado (índice único) impide que
entren dos carpetas con el mismo código.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de flujo de izquierda a derecha. Tu código llama al modelo Producto; el modelo pasa
los datos por el esquema, que pregunta si cumplen tipos, campos obligatorios y mínimos. Si no cumplen, se produce un
ValidationError que no sale de tu proceso. Si cumplen, el driver mongodb los envía en formato BSON por TCP (puerto
27017) usando su pool de conexiones hasta MongoDB, base «tienda». Allí están la colección «productos» (documentos con
_id, sku, nombre, precio, un arreglo de etiquetas y un proveedor embebido) y sus índices: _id, sku único y el
compuesto etiquetas más precio.

#### 6. EXPLICACIÓN NIVEL 0

- Una **base de datos** es un programa aparte cuyo trabajo es guardar datos en disco y devolverlos cuando se los
  piden. Tu servicio le habla por la red, igual que un cliente le habla a tu API.
- **MongoDB** guarda **documentos**: objetos parecidos a JSON, con campos, listas y objetos dentro de objetos. Los
  documentos de un mismo tipo viven en una **colección**.
- Cada documento recibe un identificador único, **`_id`**, que MongoDB genera solo.
- MongoDB no obliga a que los documentos tengan la misma forma. **Mongoose** es una librería de Node que añade esa
  disciplina: defines un **esquema** (qué campos hay, de qué tipo, cuáles son obligatorios) y Mongoose rechaza lo que
  no cumple.
- Un **modelo** es el esquema más las operaciones: `Producto.create(...)` guarda, `Producto.find(...)` busca.
- Un **índice** es como el índice alfabético de un libro: permite encontrar sin leerlo todo. Sin índice, MongoDB
  revisa todos los documentos de la colección.

#### 7. EXPLICACIÓN INTERMEDIA

- **Conexión.** `mongoose.connect(url)` abre un **pool** de conexiones (por defecto hasta 100; en el laboratorio,
  `maxPoolSize: 10`) y se llama **una vez** al arrancar el servicio. La URL tiene la forma
  `mongodb://host:puerto/base`.
- **Esquema.** Cada campo declara su tipo y sus validadores (`required`, `min`, `minlength`, `enum`, `match`) y
  transformaciones (`trim`, `uppercase`, `default`). `timestamps: true` añade `createdAt` y `updatedAt`. Con
  `strict: 'throw'` un campo desconocido es un error; por defecto (`strict: true`) Mongoose lo **descarta en
  silencio**.
- **La validación ocurre en tu proceso**, antes de enviar nada. Por eso `modelo.test.js` no necesita MongoDB.
  Atención: en las actualizaciones (`updateOne`, `findOneAndUpdate`) los validadores **no** corren salvo que pases
  `runValidators: true`.
- **Consultas.** `find(filtro)` devuelve una consulta encadenable: `.sort()`, `.select()` (proyección: qué campos
  traer), `.limit()`. Los operadores empiezan por `$`: `$lte`, `$gte`, `$in`, `$inc`. Un filtro sobre un campo
  arreglo (`{ etiquetas: 'oficina' }`) significa «el arreglo contiene ese valor».
- **`lean()`** devuelve objetos planos en lugar de documentos de Mongoose (que traen métodos, seguimiento de cambios
  y virtuales). Para responder JSON en una API de lectura es más rápido y gasta menos memoria.
- **Atomicidad.** Una operación sobre **un** documento es atómica. `findOneAndUpdate({ sku, stock: { $gte: n } },
  { $inc: { stock: -n } })` comprueba y descuenta en un solo paso dentro del servidor: no hay ventana entre «leer el
  stock» y «escribirlo» en la que otra petición se cuele.
- **Índices.** `unique: true` en el esquema crea un índice único; una segunda inserción con el mismo valor falla con
  el código **E11000**. Mongoose crea los índices al arrancar (`autoIndex`); `await Producto.init()` espera a que
  terminen. En producción es habitual desactivar `autoIndex` y crearlos con una migración, porque construir un índice
  sobre una colección grande consume recursos.

#### 8. EXPLICACIÓN MAESTRA

- **Embeber o referenciar** es *la* decisión de diseño en MongoDB. **Embebe** lo que se lee junto, pertenece al
  documento y tiene tamaño acotado (el proveedor del producto, las líneas de un pedido). **Referencia** (guardas el
  `_id` del otro documento) lo que crece sin límite, se comparte entre muchos o se actualiza por separado (las reseñas
  de un producto popular). Un documento no puede pasar de **16 MB** y cada escritura reescribe el documento: un arreglo
  que crece sin tope degrada todo (ver el anti-patrón).
- **Alternativas y trade-offs.**
  1. *Driver `mongodb` sin Mongoose*: menos capas y más rendimiento, pero la validación y los tipos corren por tu
     cuenta (o con la validación JSON Schema del propio servidor).
  2. *PostgreSQL con columnas `jsonb`*: documentos flexibles **y** JOIN y transacciones multi-fila de siempre. Si tus
     datos son sobre todo relacionales con alguna parte variable, suele ser mejor opción.
  3. *Mongoose*: productividad, validación y middleware a cambio de sobrecarga por documento (mitigable con `lean()`)
     y de «magia» que hay que conocer (buffering, casting).
- **Transacciones multi-documento** existen (`session.withTransaction`), pero requieren un *replica set* y cuestan
  más que en una base relacional. Si tu modelo necesita transacciones entre colecciones a diario, probablemente está
  pidiendo tablas. Lo habitual es diseñar el documento para que la operación crítica toque **uno solo**.
- **Consistencia de lectura.** En un replica set, leer de un secundario (`readPreference: 'secondary'`) puede devolver
  datos atrasados. Para leer lo que acabas de escribir, lee del primario o usa `readConcern: 'majority'` con
  `writeConcern: { w: 'majority' }` (más latencia, sin pérdida de escrituras confirmadas si cae el primario).
- **Cuándo NO usar MongoDB:** informes con muchos JOIN y agregaciones entre entidades, dinero con invariantes entre
  varias filas (saldos, inventario contable), o cuando «no tener esquema» es la única razón: el esquema existe
  siempre, o lo valida la base o lo sufre tu código.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **mongoose 9.12.2**, **MongoDB 9.0.8** (`mongo:9.0.8` en Docker Compose). Usa el
`package.json`, el `docker-compose.yml` y el `config.js` del inicio del módulo.

`examples/microservicios/modulo-19/f101-mongoose/modelo.js`:

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

`examples/microservicios/modulo-19/f101-mongoose/repositorio.js`:

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

`examples/microservicios/modulo-19/f101-mongoose/demo.js`:

```javascript
// Ejecuta: node f101-mongoose/demo.js   (desde examples/microservicios/modulo-19, con `docker compose up -d --wait`)
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

#### 10. MINI-LABORATORIO

1. Levanta las bases e instala las dependencias (una vez para todo el módulo):
   ```bash
   cd examples/microservicios/modulo-19
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

#### 11. VERIFICACIÓN

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
// con EXIGIR_INFRA=1 (lo pone ./verificar.sh --compose) la falta de MongoDB es un fallo.
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

#### 12. ERROR COMÚN

**Síntoma:** la API se queda «pensando» 10 segundos en la primera consulta y luego falla, aunque el código de la
consulta está bien. `f101-mongoose/error-buffering.js` lo reproduce sin necesidad de MongoDB:

```javascript
// ERROR COMÚN F101: consultar sin haber conectado (o con la URL equivocada).
// Ejecuta: node f101-mongoose/error-buffering.js   (no necesita MongoDB: justamente falla porque no hay conexión)
import mongoose from 'mongoose';
import { Producto } from './modelo.js';

mongoose.set('bufferTimeoutMS', 2000); // por defecto son 10000 ms; lo bajamos para no esperar tanto

// 1) Nadie llamó a mongoose.connect(): Mongoose guarda la consulta en una cola («buffering») esperando la conexión.
try {
  await Producto.find();
} catch (error) {
  console.log('1)', error.name + ':', error.message);
}

// 2) La URL apunta a un puerto donde no hay MongoDB.
try {
  await mongoose.connect('mongodb://localhost:27999/tienda', { serverSelectionTimeoutMS: 1500 });
} catch (error) {
  console.log('2)', error.name + ':', error.message);
}
await mongoose.disconnect();
```

**Cómo se ve** (salida real de `node f101-mongoose/error-buffering.js`, Node 26.13.1 en macOS):

```text
1) MongooseError: Operation `productos.find()` buffering timed out after 2000ms
2) MongooseServerSelectionError: connect ECONNREFUSED ::1:27999, connect ECONNREFUSED 127.0.0.1:27999
```

En macOS `localhost` resuelve a la dirección IPv6 `::1` y a la IPv4 `127.0.0.1`, Node prueba las dos y el mensaje
junta ambos intentos fallidos. En un Linux donde `localhost` solo resuelve a IPv4 verás únicamente
`connect ECONNREFUSED 127.0.0.1:27999`. Es el mismo error.

**Diagnóstico visual:** son dos mensajes distintos para dos causas distintas.

| Mensaje | Qué significa | Arreglo |
|---|---|---|
| `buffering timed out after …ms` | Nadie llamó a `mongoose.connect()` (o no se esperó, o se conectó **otra** instancia de mongoose). Mongoose guardó la consulta en una cola esperando una conexión que nunca llegó. | `await mongoose.connect(url)` **antes** de aceptar peticiones. En producción, `mongoose.set('bufferCommands', false)` para que falle al instante. |
| `MongooseServerSelectionError: connect ECONNREFUSED host:puerto` | Sí intentó conectar, pero en esa dirección no hay MongoDB: contenedor apagado, puerto equivocado, o `localhost` usado *dentro* de un contenedor (ahí el host es el nombre del servicio: `mongo`). | `docker compose ps`, revisa la URL y el puerto publicado (`27019` fuera, `27017` dentro de la red de Compose). |

Otro clásico: actualizar con `updateOne({ sku }, { precio: -5 })` y descubrir que el precio negativo se guardó. Los
validadores del esquema no corren en las actualizaciones a menos que pases `{ runValidators: true }`, como hace
`descontarStock`.

#### 13. PREGUNTA DE ENTREVISTA

«En MongoDB, ¿cuándo embebes un documento dentro de otro y cuándo guardas una referencia? Dame un ejemplo de cada
uno.»

**Respuesta modelo:** embebo cuando los datos se leen juntos, pertenecen al documento padre y su cantidad está
acotada: las líneas de un pedido o la dirección de envío copiada en el momento de la compra. Así una lectura trae todo
y la escritura del pedido es atómica porque toca un solo documento. Referencio cuando el hijo crece sin límite, se
consulta por separado o lo comparten muchos padres: las reseñas de un producto, o el cliente de un pedido (guardo
`clienteId` y, si necesito mostrar el nombre, copio también el nombre como dato histórico). Los límites que me
obligan a decidir son el máximo de 16 MB por documento, que cada cambio reescribe el documento y que no hay JOIN
barato: `$lookup` existe, pero si lo uso en cada consulta mi modelo es relacional y debería estar en PostgreSQL.

#### 14. ANTI-PATRÓN RELACIONADO

**El arreglo que crece sin límite** (*unbounded array*): embeber dentro de un documento algo que no deja de crecer.

```javascript
// ❌ Cada reseña nueva agranda el documento del producto. Con 50 000 reseñas, leer el precio trae megabytes,
//    cada $push reescribe el documento y un día se alcanza el límite de 16 MB: «BSONObjectTooLarge».
const productoSchema = new Schema({
  sku: String,
  precio: Number,
  resenas: [{ autor: String, texto: String, estrellas: Number, fecha: Date }],
});

// ✅ Colección aparte con referencia e índice; en el producto solo el resumen, que tiene tamaño fijo.
const resenaSchema = new Schema({
  productoId: { type: Schema.Types.ObjectId, ref: 'Producto', index: true },
  autor: String, texto: String, estrellas: Number,
}, { timestamps: true });
const productoSchema2 = new Schema({ sku: String, precio: Number, resenas: { total: Number, promedio: Number } });
```

**Cómo se ve en producción:** la latencia de *leer un producto* sube semana a semana aunque nadie tocó el código, el
tamaño medio de documento de la colección (`db.productos.stats().avgObjSize`) crece sin parar y los productos más
populares son los más lentos. La regla: embebe lo que tiene un máximo conocido; lo demás, a su propia colección.

---

### PostgreSQL + Prisma/Sequelize

#### 1. UBICACIÓN

Módulo 15, Lección 2 de 4 · Fase 2 · Laboratorio `examples/microservicios/modulo-19/f102-prisma-sequelize/`.

#### 2. PRERREQUISITOS

- Ficha anterior (qué es una base de datos, conexión, índice único).
- Clases y objetos de JavaScript; leer tipos básicos de TypeScript (Módulo 13).
- `docker compose up -d --wait` y `npm ci` hechos en `examples/microservicios/modulo-19`.

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** el mismo repositorio (crear un cliente con sus pedidos en una transacción, leerlos con una relación,
sumar el total) con **Sequelize** y con **Prisma** sobre las mismas tablas de PostgreSQL, y **comparar** ambos ORM;
lo compruebas cuando los 3 tests de `sequelize.test.js` y los 3 de `prisma.test.ts` pasan y sabes detectar un
problema N+1 contando consultas.

#### 4. ANALOGÍA VISUAL

Dibuja una **oficina con dos libros de contabilidad** en un mismo escritorio: el libro «clientes» y el libro
«pedidos». Cada libro es una **tabla**: todas sus páginas tienen las mismas columnas impresas (nadie puede escribir
«azul» en la columna «total»). Cada renglón del libro de pedidos lleva anotado el **número de renglón del cliente** al
que pertenece (la *clave foránea*): un hilo rojo une el pedido con su cliente, y el contador jefe (PostgreSQL) se
niega a anotar un pedido cuyo hilo no llegue a ningún cliente. Tú no escribes en los libros: le hablas a un
**intérprete** (el ORM) en tu idioma, JavaScript, y él lo traduce al idioma del contador, SQL. Hay dos intérpretes en
la sala. **Sequelize** es el veterano: le describes los libros de palabra, en JavaScript, y traduce sobre la marcha.
**Prisma** trabaja con un **plano firmado** (`schema.prisma`): antes de empezar imprime un diccionario a medida (el
cliente generado) y, si le pides una columna que no está en el plano, te corrige *antes* de que hables.

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama en dos niveles. Arriba, dentro de «Tu servicio Node.js», hay dos repositorios:
sequelize-repo.js, con modelos definidos en JavaScript, y prisma-repo.ts, que usa un cliente generado desde
schema.prisma. Cada uno habla con PostgreSQL mediante el driver pg: Sequelize con su propio pool y Prisma a través del
adaptador PrismaPg. Abajo, ambos envían SQL por TCP al puerto 5432 de la base f102, que contiene la tabla clientes (id
como clave primaria, nombre y email único) y la tabla pedidos (id, total con una restricción mayor que cero, estado,
creado_en y cliente_id). Una flecha indica que pedidos.cliente_id es clave foránea hacia clientes.id.

#### 6. EXPLICACIÓN NIVEL 0

- **PostgreSQL** es una base de datos **relacional**: guarda los datos en **tablas** con columnas fijas y filas.
- **SQL** es el lenguaje para hablarle: `SELECT` lee, `INSERT` añade, `UPDATE` cambia, `DELETE` borra.
- Una **clave primaria** (`id`) identifica cada fila. Una **clave foránea** (`cliente_id`) apunta a la fila de otra
  tabla: así se relacionan un pedido y su cliente sin repetir los datos del cliente en cada pedido.
- Una **restricción** es una regla que la base hace cumplir pase lo que pase: `NOT NULL` (obligatorio), `UNIQUE` (sin
  repetidos), `CHECK (total > 0)`.
- Un **JOIN** combina filas de dos tablas: «dame los pedidos junto con el nombre de su cliente».
- Un **ORM** (*Object-Relational Mapper*) es una librería que te deja trabajar con objetos (`cliente.pedidos`) y
  escribe el SQL por ti. **Sequelize** y **Prisma** son los dos más usados en Node.js.

#### 7. EXPLICACIÓN INTERMEDIA

- **El esquema se crea con SQL versionado.** En el laboratorio, `sql/001-esquema.sql` es la fuente de verdad y
  `preparar.js` la aplica con el driver `pg`. Los dos ORM solo *describen* esas tablas. En un proyecto real ese
  archivo es una **migración** numerada que se aplica una sola vez por entorno: con Prisma, `prisma migrate dev` la
  genera a partir de los cambios de `schema.prisma` y `prisma migrate deploy` la aplica en producción; con Sequelize,
  `sequelize-cli db:migrate`. Nunca dejes que la aplicación cree tablas al arrancar en producción
  (`sequelize.sync()`): dos instancias arrancando a la vez o un cambio destructivo te dejan sin datos.
- **Sequelize 6** define modelos en tiempo de ejecución con `sequelize.define(nombre, columnas, opciones)`. `field`
  asigna el nombre real de la columna (`creadoEn` ↔ `creado_en`), `hasMany`/`belongsTo` declaran la relación e
  `include` pide el JOIN. Abre su propio pool (`pool: { max: 5 }`).
- **Prisma 7** parte de `schema.prisma`. `prisma generate` escribe un cliente **TypeScript** en la carpeta `output`
  (obligatoria desde Prisma 7; ya no se genera dentro de `node_modules`). El cliente ya no trae un motor en Rust: se
  conecta a través de un **adaptador de driver**, aquí `PrismaPg` sobre `pg`, que recibe la cadena de conexión.
  `@map` y `@@map` enlazan nombres de modelo con columnas y tablas reales.
- **Ejecutar TypeScript.** El cliente generado es TypeScript, así que los archivos de Prisma del laboratorio se
  ejecutan con **tsx** (`node --import tsx archivo.ts`), como hace la guía de inicio de Prisma.
- **Transacciones.** `sequelize.transaction(async (t) => …)` y `prisma.$transaction(async (tx) => …)` hacen lo mismo:
  `BEGIN`, tu función, y `COMMIT` si termina o `ROLLBACK` si lanza. En Sequelize debes pasar `{ transaction }` a cada
  operación; en Prisma usas el cliente `tx` que recibes.
- **Errores.** Sequelize lanza clases con nombre (`SequelizeUniqueConstraintError`, `SequelizeDatabaseError`); Prisma
  lanza errores con **código**: `P2002` es «restricción única violada».
- **Consultas parametrizadas.** Ambos ORM envían los valores separados del texto SQL (`$1`, `$2`): así evitan la
  inyección de SQL. Si escribes SQL a mano, hazlo igual: `pool.query('… WHERE email = $1', [email])`, nunca
  concatenando cadenas.

#### 8. EXPLICACIÓN MAESTRA

| Criterio | Sequelize 6 | Prisma 7 | SQL directo con `pg` |
|---|---|---|---|
| Dónde vive el modelo | Código JavaScript | `schema.prisma` + cliente generado | En la base y en tu cabeza |
| Tipos en TypeScript | Parciales, manuales | Exactos, generados (incluido el resultado de cada `select`) | Los escribes tú |
| Paso de build | Ninguno | `prisma generate` en cada cambio y en CI | Ninguno |
| SQL complejo (CTE, ventanas) | `sequelize.query` | `$queryRaw` (o TypedSQL) | Natural |
| Control del SQL emitido | Medio (`logging` lo muestra) | Medio | Total |
| Riesgo típico | Olvidar `{ transaction }`; N+1 | Olvidar `generate`; cliente desfasado del esquema | Mapeo manual y repetitivo |

- **Trade-off de fondo:** un ORM te ahorra el 90 % del SQL aburrido y te esconde el 10 % que importa. Activa siempre
  el registro de consultas en desarrollo y revisa las que salen de los endpoints calientes.
- **Alternativas:** *query builders* como Kysely o Knex (SQL con tipos, sin objetos mágicos), Drizzle (esquema en
  TypeScript, muy cercano a SQL) y TypeORM (decoradores, habitual con NestJS). Para servicios pequeños con pocas
  consultas, `pg` solo es una opción seria: es lo que usan las fichas 3 y 4.
- **Elección práctica:** proyecto nuevo en TypeScript → Prisma (los tipos generados eliminan una clase entera de
  errores). Base de código JavaScript existente, o necesidad de *hooks* y modelos dinámicos → Sequelize. Muchas
  consultas analíticas → query builder o SQL.
- **Cuándo NO usar un ORM:** cargas masivas (usa `COPY`), informes con agregaciones pesadas, o cuando el equipo no
  sabe SQL: el ORM no sustituye entender índices, planes de ejecución (`EXPLAIN ANALYZE`) y bloqueos.
- **Cuándo NO usar PostgreSQL:** casi nunca es mala elección por defecto; plantéate otra cosa para búsquedas de texto
  a gran escala (un motor de búsqueda), series temporales masivas o caché efímera (Redis, Módulo 19).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **sequelize 6.37.8**, **prisma** y **@prisma/client 7.10.1**,
**@prisma/adapter-pg 7.10.1**, **pg 8.23.1**, **tsx 4.23.15**, **PostgreSQL 18.7** (`postgres:18.7`). Usa el
`package.json`, el `docker-compose.yml` y el `config.js` del inicio del módulo.

`examples/microservicios/modulo-19/f102-prisma-sequelize/sql/001-esquema.sql`:

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

`examples/microservicios/modulo-19/f102-prisma-sequelize/preparar.js`:

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
// Ejecuta: node f102-prisma-sequelize/sequelize-demo.js   (desde examples/microservicios/modulo-19)
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
// Ejecuta: npm run generate && npx tsx f102-prisma-sequelize/prisma-demo.ts   (desde examples/microservicios/modulo-19)
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

#### 10. MINI-LABORATORIO

1. Con las bases arriba (`docker compose up -d --wait`) y `npm ci` hecho, ejecuta la demo de Sequelize:
   ```bash
   cd examples/microservicios/modulo-19
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

#### 11. VERIFICACIÓN

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

#### 12. ERROR COMÚN

**Síntoma 1 (rendimiento):** un listado que en desarrollo va bien tarda segundos en producción. Es el **problema
N+1**: una consulta para la lista y una más por cada elemento. `f102-prisma-sequelize/n-mas-1.js` lo hace visible
contando las consultas con la opción `logging`:

```javascript
// ERROR COMÚN F102: el problema N+1. Ejecuta: node f102-prisma-sequelize/n-mas-1.js
// Cuenta las consultas SQL que emite Sequelize para listar 3 clientes con sus pedidos, mal y bien.
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos } from './sequelize-repo.js';

await prepararEsquema();
let consultas = [];
const db = conectar({ logging: (sql) => consultas.push(sql.replace('Executing (default): ', '')) });
for (const nombre of ['Ana', 'Luis', 'Eva']) {
  await crearClienteConPedidos(db, { nombre, email: `${nombre.toLowerCase()}@correo.co` }, [10000, 20000]);
}

// MAL: 1 consulta para los clientes + 1 consulta POR CADA cliente para sus pedidos.
consultas = [];
const clientes = await db.Cliente.findAll({ order: [['id', 'ASC']] });
for (const cliente of clientes) {
  const pedidos = await db.Pedido.findAll({ where: { clienteId: cliente.id } });
  cliente.cantidad = pedidos.length;
}
console.log(`N+1: ${consultas.length} consultas para ${clientes.length} clientes`);
console.log('  ' + consultas[1]);

// BIEN: una sola consulta con JOIN (include).
consultas = [];
const conPedidos = await db.Cliente.findAll({ include: 'pedidos', order: [['id', 'ASC']] });
console.log(`include: ${consultas.length} consulta para ${conPedidos.length} clientes con ${conPedidos.flatMap((c) => c.pedidos).length} pedidos`);

await db.sequelize.close();
```

**Cómo se ve:** la salida real del paso 4 del laboratorio (`N+1: 4 consultas para 3 clientes`). **Diagnóstico
visual:** en el log de SQL aparece la **misma consulta repetida** cambiando solo el número del `WHERE`; en una traza
(Módulo 21) es una escalera de barras idénticas contra la base. **Arreglo:** pide la relación en la misma consulta
(`include` en Sequelize; `include` o `select` anidado en Prisma) o, si son muchos, una segunda consulta con
`WHERE cliente_id IN (…)`.

**Síntoma 2 (Prisma):** el servicio no arranca en un clon recién hecho o en CI. Salida real al ejecutar
`node --import tsx f102-prisma-sequelize/prisma-demo.ts` sin haber generado el cliente:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/modulo-19/f102-prisma-sequelize/generated/client.ts' imported from …/modulo-19/f102-prisma-sequelize/prisma-repo.ts
```

**Diagnóstico:** la carpeta `generated/` no se sube al repositorio (está en `.gitignore`): se produce con
`prisma generate`. **Arreglo:** ejecuta `npm run generate` después de `npm ci` y después de cada cambio en
`schema.prisma`, y añádelo al build de CI y al Dockerfile.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué es el problema N+1 en un ORM, cómo lo detectas y cómo lo resuelves?»

**Respuesta modelo:** ocurre cuando cargo una lista con una consulta y después, al recorrerla, el código lanza una
consulta más por cada elemento para traer una relación: N+1 viajes a la base en lugar de 1 o 2. Lo detecto activando
el log de SQL del ORM en desarrollo, contando consultas en un test (afirmo que el endpoint emite como máximo 2) o
viendo en las trazas una ráfaga de consultas idénticas. Lo resuelvo pidiendo la relación en la misma operación
(`include`, que genera un JOIN) o con carga por lotes (`WHERE id IN (…)`, el patrón DataLoader en GraphQL). Vigilo el
caso contrario: un `include` de varias relaciones de muchos elementos multiplica filas en el JOIN; ahí prefiero dos
consultas separadas y paginar.

#### 14. ANTI-PATRÓN RELACIONADO

**`sync()` en producción (el esquema lo decide la aplicación al arrancar):**

```javascript
// ❌ La app modifica las tablas cada vez que arranca. `alter: true` puede borrar columnas con datos;
//    con 3 réplicas arrancando a la vez, las tres intentan alterar la misma tabla.
await sequelize.sync({ alter: true });
app.listen(3000);

// ✅ El esquema cambia con migraciones versionadas, revisadas en un pull request y aplicadas UNA vez
//    por el pipeline de despliegue, antes de arrancar la nueva versión:
//      sql/001-esquema.sql, sql/002-agrega-telefono.sql ...   (o prisma migrate deploy / sequelize-cli db:migrate)
```

**Cómo se ve:** nadie puede decir qué versión del esquema tiene cada entorno, los arranques tardan cada vez más
(compara tablas en cada inicio) y un día un despliegue renombra un campo del modelo y la columna antigua, con sus
datos, desaparece. El equivalente en Prisma es usar `prisma db push` contra producción en lugar de
`prisma migrate deploy`.

---

### Database-per-service

#### 1. UBICACIÓN

Módulo 15, Lección 3 de 4 · Fase 2 · Laboratorio `examples/microservicios/modulo-19/f103-database-per-service/`.

#### 2. PRERREQUISITOS

- Ficha anterior (tablas, claves foráneas, JOIN) y una API con Express (Módulo 14).
- `fetch` con `async/await` (Módulo 13) y códigos de estado HTTP (Módulo 0.4).
- `docker compose up -d --wait` y `npm ci` hechos en `examples/microservicios/modulo-19`.

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** dos servicios Node.js, pedidos e inventario, cada uno con su base y su usuario de PostgreSQL,
**demostrar** que ninguno puede leer la base del otro y **sustituir** el JOIN entre servicios por una llamada a la API
del dueño del dato; lo compruebas cuando `node --test f103-database-per-service/aislamiento.test.js` pasa 4 de 4 y
puedes explicar qué se pierde y qué se gana frente a una base compartida.

#### 4. ANALOGÍA VISUAL

Dibuja un **edificio de apartamentos**. Cada apartamento (un microservicio) tiene **su propia nevera** (su base de
datos) y **su propia llave**. Si el vecino del 2.º quiere saber si en el 3.º hay leche, **toca el timbre y pregunta**
(llama a la API); no entra con una copia de la llave a abrir la nevera ajena. Al lado, dibuja la alternativa: un
**piso compartido de estudiantes con una sola nevera**. Parece más cómodo, hasta que alguien reorganiza los estantes
(cambia una tabla) y nadie encuentra lo suyo, o alguien deja la puerta abierta toda la noche (una consulta pesada) y
se estropea la comida de todos. En el edificio, cada quien reorganiza su nevera cuando quiere; el precio es que para
preparar una receta con ingredientes de dos apartamentos hay que **coordinarse por el timbre**.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    CLI["Cliente"] -- "POST /pedidos" --> PED["Servicio pedidos<br/>(Express)"]
    PED -- "POST /reservas<br/>HTTP + timeout" --> INV["Servicio inventario<br/>(Express)"]
    PED -- "usuario pedidos_app" --> DBP[("pedidos_db<br/>tabla pedidos")]
    INV -- "usuario inventario_app" --> DBI[("inventario_db<br/>tabla stock")]
    PED -. "✘ permission denied<br/>for database inventario_db" .-> DBI
```

**Texto alternativo:** diagrama de izquierda a derecha. Un cliente envía POST /pedidos al servicio pedidos. El
servicio pedidos llama por HTTP, con timeout, a POST /reservas del servicio inventario. Cada servicio tiene una flecha
sólida hacia su propia base: pedidos usa el usuario pedidos_app sobre pedidos_db (tabla pedidos) e inventario usa el
usuario inventario_app sobre inventario_db (tabla stock). Una flecha punteada con una equis va del servicio pedidos a
inventario_db con el texto «permission denied for database inventario_db»: ese camino está prohibido.

#### 6. EXPLICACIÓN NIVEL 0

- **Database-per-service** es una regla: **cada microservicio es el único dueño de sus datos**. Ningún otro servicio
  lee ni escribe en sus tablas.
- Si pedidos necesita un dato de inventario, **se lo pide a inventario por su API** (o escucha los eventos que
  inventario publica, Módulo 22).
- «Su base» no significa por fuerza otro servidor: pueden ser dos bases dentro del mismo PostgreSQL, como en el
  laboratorio. Lo que importa es que haya una **frontera que se hace cumplir**: usuarios distintos, sin permisos
  cruzados.
- ¿Por qué? Porque si dos servicios comparten tablas, no puedes cambiar una tabla sin coordinar a dos equipos, ni
  desplegar uno sin probar el otro: dejan de ser independientes, que era la razón de separarlos.

#### 7. EXPLICACIÓN INTERMEDIA

- **Niveles de aislamiento físico**, de menos a más:
  1. *Esquema por servicio* en la misma base (`pedidos.*`, `inventario.*`) con roles separados.
  2. *Base por servicio* en el mismo servidor (lo del laboratorio): además impide los JOIN, porque PostgreSQL no
     permite consultas entre bases.
  3. *Servidor por servicio*: aísla también CPU, memoria, copias de seguridad y versiones; es lo más caro.
- **Hacer cumplir la frontera.** En PostgreSQL cualquier rol puede conectarse a cualquier base por defecto. Por eso
  `initdb/01-bases.sql` hace `REVOKE CONNECT ON DATABASE … FROM PUBLIC`: solo el dueño de cada base entra. Una regla
  que solo vive en un documento se rompe el primer día de prisa.
- **Sin clave foránea entre servicios.** `pedidos.sku` es una referencia **lógica**: la base no puede comprobar que
  ese SKU exista en inventario. La integridad pasa a ser responsabilidad de la aplicación (se valida llamando a la
  API en el momento de crear el pedido).
- **Sin JOIN entre servicios.** Las alternativas son: *composición por API* (el que necesita ambos datos llama a los
  dos servicios y combina en memoria), *copia local* de los campos que necesitas, actualizada por eventos, o una
  *vista de lectura* dedicada (CQRS, Módulo 22).
- **Sin transacción entre servicios.** «Reservar stock y guardar el pedido» ya no es un `BEGIN … COMMIT`. En el
  laboratorio, si la reserva tuvo éxito y el `INSERT` del pedido falla, queda stock reservado sin pedido: hay que
  compensar (liberar la reserva). Eso es una **saga** (Módulos 22 y 25).

#### 8. EXPLICACIÓN MAESTRA

| | Base compartida | Database-per-service |
|---|---|---|
| Cambiar una tabla | Coordinar a todos los que la leen | Decisión de un solo equipo |
| Consultas entre entidades | JOIN: trivial y rápido | Composición por API, copias o vistas |
| Consistencia | ACID inmediata | Eventual entre servicios; sagas |
| Fallos | Una consulta pesada afecta a todos | Aislados por servicio |
| Tecnología | La misma para todos | Cada servicio elige (documentos, relacional…) |
| Operación | 1 base que cuidar | N bases: copias, parches, monitoreo, costo |

- **El costo real** no es la base extra: es todo lo que antes hacía el motor gratis y ahora programas tú:
  consistencia eventual, idempotencia, compensaciones, informes que cruzan datos.
- **Alternativas:**
  1. *Monolito modular con una base y esquemas por módulo*: fronteras de propiedad claras sin pagar la distribución.
     Para un equipo pequeño suele ser la respuesta correcta.
  2. *Base compartida solo de lectura* (réplica o vistas publicadas como contrato): alivia informes, pero las vistas
     pasan a ser una API que hay que versionar.
  3. *Database-per-service con eventos* (outbox + mensajería, Módulo 25): máxima autonomía, máxima complejidad.
- **Informes y analítica:** no se resuelven consultando N bases en caliente; se exportan los datos de cada servicio
  (eventos o CDC) a un almacén analítico.
- **Cuándo NO usarlo:** si tus «servicios» necesitan transacciones entre sí en casi todas las operaciones, o la
  mayoría de tus pantallas necesita JOIN entre sus datos, las fronteras están mal trazadas: esos datos pertenecen al
  mismo servicio. Y si tienes un solo equipo y un solo producto pequeño, una base bien organizada es más barata y más
  segura.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** (`fetch` nativo), **express 5.3.0**, **pg 8.23.1**, **PostgreSQL 18.7**. Las dos
bases y los dos usuarios los crea `initdb/01-bases.sql` (inicio del módulo).

`examples/microservicios/modulo-19/f103-database-per-service/inventario.js`:

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

`examples/microservicios/modulo-19/f103-database-per-service/pedidos.js`:

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

`examples/microservicios/modulo-19/f103-database-per-service/arrancar.js`:

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

`examples/microservicios/modulo-19/f103-database-per-service/demo.js`:

```javascript
// Ejecuta: node f103-database-per-service/demo.js   (desde examples/microservicios/modulo-19)
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

#### 10. MINI-LABORATORIO

1. Con las bases arriba y `npm ci` hecho, ejecuta la demo:
   ```bash
   cd examples/microservicios/modulo-19
   node f103-database-per-service/demo.js
   ```
2. Ahora a mano. En una terminal deja los dos servicios encendidos:
   ```bash
   node f103-database-per-service/arrancar.js
   ```
   y en otra crea un pedido y consulta el stock en el servicio que es su dueño:
   ```bash
   curl -s -X POST localhost:3103/pedidos -H 'content-type: application/json' -d '{"sku":"TEC-001","cantidad":1}'
   curl -s localhost:3203/stock/TEC-001
   ```
3. Intenta saltarte la frontera con el usuario de pedidos:
   ```bash
   docker compose exec postgres psql "postgresql://pedidos_app:pedidos@127.0.0.1/inventario_db" -c "SELECT * FROM stock"
   ```
4. Intenta el JOIN «de toda la vida» entre las dos bases:
   ```bash
   node f103-database-per-service/error-join.js
   ```

**Output esperado** (paso 1, salida real):

```text
Pedido de 2 teclados → 201 {"id":1,"sku":"TEC-001","cantidad":2,"estado":"CONFIRMADO"}
Pedido de 2 teclados → 409 {"id":2,"sku":"TEC-001","cantidad":2,"estado":"RECHAZADO"}
Stock según inventario → {"sku":"TEC-001","disponible":1}
pedidos_app → inventario_db: permission denied for database "inventario_db"
```

**Output esperado** (paso 2; `arrancar.js` vuelve a crear las tablas, así que el stock empieza otra vez en 3):

```text
{"id":1,"sku":"TEC-001","cantidad":1,"estado":"CONFIRMADO"}
{"sku":"TEC-001","disponible":2}
```

**Output esperado** (paso 3, mensaje real de PostgreSQL):

```text
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "inventario_db"
DETAIL:  User does not have CONNECT privilege.
```

**Output esperado** (paso 4, salida real):

```text
ERROR 0A000: cross-database references are not implemented: "inventario_db.public.stock"
```

**Captura comentada:** el segundo pedido de la demo pide 2 teclados cuando queda 1: inventario responde 409 y pedidos
lo guarda como `RECHAZADO` en **su** base; el stock no cambia. Las líneas de los pasos 3 y 4 son la frontera
funcionando: la primera la pone el `REVOKE CONNECT`; la segunda, el propio PostgreSQL, que no hace consultas entre
bases.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f103-database-per-service/aislamiento.test.js
```

Salida real con PostgreSQL 18.7 (los milisegundos cambian):

```text
✔ un pedido se confirma reservando stock por la API de inventario (68.555208ms)
✔ sin stock, inventario responde 409 y pedidos guarda el pedido como RECHAZADO (2.7685ms)
✔ el usuario de pedidos NO puede conectarse a la base de inventario (ni al revés) (9.052708ms)
✔ cada base contiene solo las tablas de su servicio (16.99925ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

`f103-database-per-service/aislamiento.test.js`:

```javascript
// Verificación F103: node --test f103-database-per-service/aislamiento.test.js   (necesita PostgreSQL)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { pgUrl } from '../config.js';
import { arrancar } from './arrancar.js';

let servicios;
let disponible = true;
before(async () => {
  try {
    servicios = await arrancar();
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`PostgreSQL no disponible (${error.code ?? error.name}): tests omitidos`);
  }
});
after(() => servicios?.apagar());

const post = (url, cuerpo) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });

test('un pedido se confirma reservando stock por la API de inventario', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const r = await post(`${servicios.pedidosUrl}/pedidos`, { sku: 'TEC-001', cantidad: 2 });
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { id: 1, sku: 'TEC-001', cantidad: 2, estado: 'CONFIRMADO' });
  const stock = await (await fetch(`${servicios.inventarioUrl}/stock/TEC-001`)).json();
  assert.deepEqual(stock, { sku: 'TEC-001', disponible: 1 });
});

test('sin stock, inventario responde 409 y pedidos guarda el pedido como RECHAZADO', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const r = await post(`${servicios.pedidosUrl}/pedidos`, { sku: 'MOU-001', cantidad: 1 });
  assert.equal(r.status, 409);
  assert.equal((await r.json()).estado, 'RECHAZADO');
});

test('el usuario de pedidos NO puede conectarse a la base de inventario (ni al revés)', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  for (const [base, usuario, clave] of [['inventario_db', 'pedidos_app', 'pedidos'], ['pedidos_db', 'inventario_app', 'inventario']]) {
    const cliente = new pg.Client({ connectionString: pgUrl(base, usuario, clave) });
    await assert.rejects(cliente.connect(), { code: '42501' }); // insufficient_privilege
  }
});

test('cada base contiene solo las tablas de su servicio', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const tablas = async (base, usuario, clave) => {
    const cliente = new pg.Client({ connectionString: pgUrl(base, usuario, clave) });
    await cliente.connect();
    const { rows } = await cliente.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1");
    await cliente.end();
    return rows.map((f) => f.tablename);
  };
  assert.deepEqual(await tablas('pedidos_db', 'pedidos_app', 'pedidos'), ['pedidos']);
  assert.deepEqual(await tablas('inventario_db', 'inventario_app', 'inventario'), ['stock']);
});
```

**Pregunta de comprobación:** el equipo de inventario quiere renombrar la columna `disponible` a `unidades`. ¿Qué
tiene que cambiar el equipo de pedidos? (Respuesta: nada, mientras la API `/stock` y `/reservas` siga respondiendo el
mismo JSON. La tabla es un detalle interno de inventario; el contrato es la API. Con una base compartida, el cambio
habría roto las consultas de pedidos. En el Módulo 16 ese contrato se prueba con Pact.)

#### 12. ERROR COMÚN

**Síntoma:** alguien necesita «solo un dato» del otro servicio y escribe el JOIN de siempre.
`f103-database-per-service/error-join.js`:

```javascript
// ERROR COMÚN F103: intentar un JOIN entre las bases de dos servicios. Ejecuta: node f103-database-per-service/error-join.js
import pg from 'pg';
import { pgUrl } from '../config.js';

const cliente = new pg.Client({ connectionString: pgUrl('pedidos_db', 'pedidos_app', 'pedidos') });
await cliente.connect();
try {
  await cliente.query('SELECT p.id, s.disponible FROM pedidos p JOIN inventario_db.public.stock s ON s.sku = p.sku');
} catch (error) {
  console.log(`${error.severity} ${error.code}: ${error.message}`);
}
await cliente.end();
```

**Cómo se ve** (salida real, PostgreSQL):

```text
ERROR 0A000: cross-database references are not implemented: "inventario_db.public.stock"
```

**Diagnóstico visual:** el código `0A000` es *feature_not_supported*: PostgreSQL no cruza bases en una consulta. Si
en lugar de eso ves `permission denied for database "…"` (código `42501`), llegaste hasta la puerta pero tu usuario
no tiene la llave. Ambos mensajes dicen lo mismo: **ese dato no es tuyo**. **Arreglo:** pide el dato por la API del
dueño (como hace `pedidos.js` con `/reservas`) o, si lo lees muy a menudo, guarda una copia local de los campos que
necesitas y actualízala con los eventos que publique el dueño.

El «arreglo» equivocado es pedir al administrador que dé permisos al usuario de pedidos sobre la base de inventario,
o montar un `postgres_fdw`/`dblink` para simular el JOIN: funciona hoy y convierte los dos servicios en un monolito
distribuido mañana.

#### 13. PREGUNTA DE ENTREVISTA

«Con una base por servicio, ¿cómo muestras una pantalla que necesita datos de pedidos y de inventario a la vez?»

**Respuesta modelo:** depende de la frecuencia y de cuánta frescura necesite. Opción 1, *composición por API*: un
BFF o el propio servicio llama a los dos servicios (en paralelo, con timeout) y combina en memoria; es simple y
siempre fresco, pero suma latencias y falla si falla uno, así que defino qué muestro degradado. Opción 2, *copia
local*: pedidos guarda los campos de inventario que necesita y los actualiza al recibir eventos; la lectura es
local y rápida, a cambio de consistencia eventual. Opción 3, para listados y búsquedas pesadas, una *vista
materializada* alimentada por eventos de ambos (CQRS). Lo que no hago es un JOIN entre bases ni dar a un servicio
credenciales de la base de otro. Y si descubro que casi todas las pantallas necesitan ese cruce, cuestiono la
frontera: quizá son un solo servicio.

#### 14. ANTI-PATRÓN RELACIONADO

**Base de datos compartida como punto de integración** (*shared database* / *integration database*): varios
servicios leen y escriben las mismas tablas.

```mermaid
flowchart LR
    A["pedidos"] --> DB[("una sola base<br/>tablas de todos")]
    B["inventario"] --> DB
    C["facturación"] --> DB
    D["informes"] --> DB
```

**Texto alternativo:** cuatro servicios (pedidos, inventario, facturación e informes) apuntan con flechas a una única
base de datos que contiene las tablas de todos.

```javascript
// ❌ En el servicio de pedidos: escribe directamente en la tabla de otro equipo.
await pool.query('UPDATE inventario.stock SET disponible = disponible - $1 WHERE sku = $2', [cantidad, sku]);
```

**Cómo se ve:** un `ALTER TABLE` necesita una reunión con cuatro equipos; los despliegues se hacen «todos juntos un
sábado»; nadie sabe quién escribe una columna; una consulta de informes bloquea la tabla y tumba las ventas. Tienes
los costos de los microservicios (red, despliegues, monitoreo) y el acoplamiento del monolito: un **monolito
distribuido** (Módulo 30).

---

### Connection pooling y transacciones

#### 1. UBICACIÓN

Módulo 15, Lección 4 de 4 · Fase 2 · Laboratorio `examples/microservicios/modulo-19/f104-pool-transacciones/`.

#### 2. PRERREQUISITOS

- Fichas 2 y 3 (SQL básico, driver `pg`, restricciones `CHECK`).
- `Promise.all`, `Promise.allSettled` y `try/catch/finally` (Módulo 13).
- `docker compose up -d --wait` y `npm ci` hechos en `examples/microservicios/modulo-19`.

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** un pool de conexiones y **medir** cómo su tamaño cambia la latencia de 20 consultas simultáneas,
**implementar** una transferencia con `BEGIN/COMMIT/ROLLBACK` que nunca deja el dinero a medias y **diagnosticar** una
fuga de conexiones; lo compruebas cuando `node --test f104-pool-transacciones/pool.test.js` pasa 5 de 5 y predices
cuánto tardará el lote con `max = 10`.

#### 4. ANALOGÍA VISUAL

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

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** diagrama de secuencia con cuatro participantes: la aplicación, el pool con un máximo de 5
conexiones, la conexión número 3 y PostgreSQL. La aplicación pide una conexión al pool y recibe la número 3 en
préstamo. Por esa misma conexión envía BEGIN, un UPDATE que resta 30 a Ana y otro que suma 30 a Luis. Si todo va
bien, envía COMMIT y los dos cambios se hacen visibles a la vez; si algún paso falla, envía ROLLBACK y no queda
ningún cambio. Al final, en el bloque finally, la aplicación llama a client.release() y la conexión vuelve a estar
libre en el pool.

#### 6. EXPLICACIÓN NIVEL 0

- Una **conexión** es una línea abierta entre tu servicio y la base de datos. Abrirla tarda y la base solo admite un
  número limitado.
- Un **pool** es un grupo de conexiones que se abren una vez y se **reutilizan**: cada consulta toma una prestada y
  la devuelve.
- Si todas están ocupadas, las consultas nuevas **esperan en fila**.
- Una **transacción** agrupa varias operaciones para que se comporten como una sola: **o se hacen todas, o no se hace
  ninguna**.
- `BEGIN` empieza la transacción, `COMMIT` la confirma y `ROLLBACK` la deshace.

#### 7. EXPLICACIÓN INTERMEDIA

- **`pg.Pool`**: `max` (10 por defecto) es el tope de conexiones; `idleTimeoutMillis` cierra las ociosas;
  `connectionTimeoutMillis` es cuánto espera una petición en la fila antes de fallar (por defecto 0: **para
  siempre**). El pool informa de su estado con `totalCount` (abiertas), `idleCount` (libres) y `waitingCount` (en
  fila): expón esos tres números como métricas.
- **`pool.query(sql)`** toma una conexión, ejecuta **una** sentencia y la devuelve sola. Es lo correcto para
  consultas sueltas.
- **`pool.connect()`** te presta una conexión (`client`) hasta que llames a `client.release()`. Es **obligatorio**
  para transacciones: `BEGIN`, las sentencias y `COMMIT` deben viajar por la **misma** conexión, porque la
  transacción es estado de esa conexión.
- **El patrón** es siempre el mismo: `connect` → `try { BEGIN … COMMIT } catch { ROLLBACK; throw } finally
  { release }`. El `finally` garantiza la devolución también cuando hay error.
- **ACID** es lo que promete una transacción: **A**tomicidad (todo o nada), **C**onsistencia (las restricciones se
  cumplen al terminar), a**I**slamiento (las transacciones simultáneas no ven los pasos intermedios de las otras) y
  **D**urabilidad (tras el `COMMIT`, el dato sobrevive a un corte de luz).
- **Niveles de aislamiento.** PostgreSQL usa `READ COMMITTED` por defecto: cada sentencia ve lo confirmado hasta ese
  instante. Para «leer y luego decidir» sobre la misma fila necesitas bloquearla con `SELECT … FOR UPDATE`, o hacer la
  comprobación dentro del propio `UPDATE` (`WHERE saldo >= $1`), o subir a `SERIALIZABLE` y reintentar cuando la base
  aborte por conflicto.
- **Con ORM** el mecanismo es el mismo: `sequelize.transaction(cb)` y `prisma.$transaction(cb)` (ficha 2) piden una
  conexión al pool, ejecutan `BEGIN`, y hacen `COMMIT` o `ROLLBACK` según termine tu función.

#### 8. EXPLICACIÓN MAESTRA

- **Dimensionar el pool.** El límite real está en la base: PostgreSQL acepta `max_connections` (100 por defecto) y
  cada conexión es un proceso con memoria propia. La cuenta que importa es **réplicas del servicio × `max` del pool ≤
  conexiones que la base te reserva**. Con 10 réplicas y `max: 20` ya pides 200. Un pool más grande **no** es más
  rápido: pasado el punto en que la base tiene CPU y disco ocupados, más conexiones solo añaden cambios de contexto y
  bloqueos. Empieza pequeño (5–10 por réplica), mide `waitingCount` y la latencia, y sube solo con evidencia.
- **Alternativas cuando hay muchas réplicas o funciones serverless:**
  1. *Pooler externo* (PgBouncer, o el proxy gestionado de tu nube): miles de conexiones de cliente sobre pocas
     conexiones reales. En modo «transacción» no admite estado de sesión (por ejemplo, sentencias preparadas con
     nombre o `SET` de sesión): hay que conocer esa limitación.
  2. *Menos réplicas más grandes*: menos pools que sumar.
  3. *Cola de trabajo* delante de las escrituras pesadas: limita la concurrencia por diseño.
- **Transacciones cortas.** Mientras una transacción está abierta retiene una conexión y bloqueos sobre las filas que
  tocó. **Nunca** llames a otro servicio por HTTP con una transacción abierta: si ese servicio tarda 5 s, tu conexión
  y tus bloqueos duran 5 s y el pool se vacía. Primero la llamada, después la transacción (o al revés), nunca dentro.
- **Interbloqueos (deadlocks).** Dos transacciones que bloquean las mismas filas en orden inverso se esperan
  mutuamente; PostgreSQL aborta una con el código `40P01`. Se evitan bloqueando siempre en el mismo orden (por
  ejemplo, por `id` ascendente) y se toleran reintentando la transacción abortada.
- **Bloqueo pesimista vs optimista.** Pesimista: `SELECT … FOR UPDATE` (nadie más toca la fila hasta tu `COMMIT`);
  simple, pero encola. Optimista: una columna `version` y `UPDATE … WHERE id = $1 AND version = $2`; si afecta 0 filas,
  alguien se adelantó y reintentas; mejor cuando los conflictos son raros.
- **Cuándo NO usar una transacción:** para lecturas sueltas (cada sentencia ya es atómica), para procesos largos
  (lotes de horas: trabaja por trozos, cada uno con su transacción) y entre servicios distintos: una transacción de
  base de datos no cruza la frontera de un servicio (ficha 3); ahí se usan sagas (Módulos 22 y 25).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **pg 8.23.1**, **PostgreSQL 18.7**. Usa el `package.json`, el
`docker-compose.yml` y el `config.js` del inicio del módulo.

`examples/microservicios/modulo-19/f104-pool-transacciones/pool.js`:

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

`examples/microservicios/modulo-19/f104-pool-transacciones/cuentas.js`:

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

`examples/microservicios/modulo-19/f104-pool-transacciones/demo.js`:

```javascript
// Ejecuta: node f104-pool-transacciones/demo.js   (desde examples/microservicios/modulo-19)
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

#### 10. MINI-LABORATORIO

1. Con las bases arriba y `npm ci` hecho, ejecuta la demo:
   ```bash
   cd examples/microservicios/modulo-19
   node f104-pool-transacciones/demo.js
   ```
2. Provoca una fuga de conexiones (el error común de esta ficha):
   ```bash
   node f104-pool-transacciones/fuga.js
   ```
3. Compara una «transacción» mal hecha con `pool.query` y una bien hecha con `client`:
   ```bash
   node f104-pool-transacciones/anti-patron.js
   ```
4. Mientras repites el paso 1, mira desde PostgreSQL cuántas conexiones abre el laboratorio:
   ```bash
   docker compose exec postgres psql -U tienda -d f104 -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'f104'"
   ```

**Output esperado** (paso 1, salida real con Node 26.13.1, pg 8.23.1 y PostgreSQL 18.7 en Docker; los tiempos pueden
variar ±100 ms):

```text
— Pool: 20 consultas de 100 ms a la vez —
max=1  → 2100 ms aprox. · en fila al empezar: 19 · conexiones abiertas: 1
max=5  → 400 ms aprox. · en fila al empezar: 15 · conexiones abiertas: 5
max=20 → 100 ms aprox. · en fila al empezar: 0 · conexiones abiertas: 20
— Transacciones —
Inicio: { ana: 100, luis: 50 }
Ana → Luis 30 (COMMIT): { ana: 70, luis: 80 }
Ana → Luis 500: new row for relation "cuentas" violates check constraint "cuentas_saldo_check"
Ana → Eva 10: La cuenta eva no existe
Tras los dos ROLLBACK: { ana: 70, luis: 80 }
Pool: total=1 libres=1 en fila=0
```

**Output esperado** (paso 2, salida real):

```text
petición 1: ok · total=1 libres=0 en fila=0
petición 2: ok · total=2 libres=0 en fila=0
petición 3: ok · total=3 libres=0 en fila=0
petición 4: Error: timeout exceeded when trying to connect · total=3 libres=0
```

**Output esperado** (paso 3, salida real):

```text
pool.query (MAL): petición 1 rejected · petición 2 fulfilled · saldos { ana: 100, luis: 50 }
client del pool (BIEN): petición 1 rejected · petición 2 fulfilled · saldos { ana: 120, luis: 30 }
```

**Output esperado** (paso 4): un número entre 1 y 21 según el instante (la conexión del propio `psql` cuenta como
una), nunca más que el `max` del pool que esté midiendo la demo más uno.

**Captura comentada:** con `max=1` las 20 consultas van de una en una (20 × 100 ms); con `max=5`, en 4 tandas; con
`max=20`, todas a la vez. Abrir 20 conexiones nuevas también cuesta: en el Mac con PostgreSQL 18.7 el total se
quedó en unos 100 ms, pero en una máquina más lenta o con la base en otra red verás 200 ms o más por ese coste. En las
transacciones, «Ana → Eva 10» es el caso interesante: a Ana **ya se le habían descontado** 10 cuando el código
descubrió que Eva no existe, y el `ROLLBACK` se los devolvió. La última línea muestra que tras 3 transacciones
secuenciales el pool solo necesitó abrir 1 conexión y que quedó libre.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f104-pool-transacciones/pool.test.js
```

Salida real con PostgreSQL 18.7 (los milisegundos cambian):

```text
✔ con max=5, 20 consultas de 100 ms tardan unas 4 tandas y nunca hay más de 5 conexiones (444.4955ms)
✔ una transferencia válida hace COMMIT de los dos UPDATE (10.982792ms)
✔ si el saldo quedaría negativo, ROLLBACK deja todo como estaba (5.571833ms)
✔ si falla el segundo paso, el primero también se deshace (7.41375ms)
✔ después de 50 transferencias (la mitad fallidas) no queda ninguna conexión prestada (36.165917ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

`f104-pool-transacciones/pool.test.js`:

```javascript
// Verificación F104: node --test f104-pool-transacciones/pool.test.js   (necesita PostgreSQL)
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearPool, medir } from './pool.js';
import { preparar, saldos, transferir } from './cuentas.js';

let pool;
let disponible = true;
before(async () => {
  pool = crearPool();
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    if (process.env.EXIGIR_INFRA) throw error;
    disponible = false;
    console.log(`PostgreSQL no disponible (${error.code ?? error.name}): tests omitidos`);
  }
});
beforeEach(async () => { if (disponible) await preparar(pool); });
after(() => pool.end());

test('con max=5, 20 consultas de 100 ms tardan unas 4 tandas y nunca hay más de 5 conexiones', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const { ms, enFila, abiertas } = await medir(5);
  assert.equal(abiertas, 5);
  assert.equal(enFila, 15);
  assert.ok(ms >= 380 && ms < 1500, `tardó ${ms} ms`);
});

test('una transferencia válida hace COMMIT de los dos UPDATE', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await transferir(pool, 'ana', 'luis', 30);
  assert.deepEqual(await saldos(pool), { ana: 70, luis: 80 });
});

test('si el saldo quedaría negativo, ROLLBACK deja todo como estaba', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await assert.rejects(transferir(pool, 'ana', 'luis', 500), { code: '23514' }); // check_violation
  assert.deepEqual(await saldos(pool), { ana: 100, luis: 50 });
});

test('si falla el segundo paso, el primero también se deshace', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  await assert.rejects(transferir(pool, 'ana', 'eva', 10), { message: 'La cuenta eva no existe' });
  assert.deepEqual(await saldos(pool), { ana: 100, luis: 50 });
});

test('después de 50 transferencias (la mitad fallidas) no queda ninguna conexión prestada', async (t) => {
  if (!disponible) return t.skip('sin PostgreSQL');
  const lote = Array.from({ length: 50 }, (_, i) => transferir(pool, 'ana', i % 2 ? 'luis' : 'eva', 1));
  const resultados = await Promise.allSettled(lote);
  assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 25);
  assert.deepEqual(await saldos(pool), { ana: 75, luis: 75 });
  assert.equal(pool.idleCount, pool.totalCount); // todas devueltas
  assert.equal(pool.waitingCount, 0);
});
```

**Pregunta de comprobación:** ¿cuánto tardarían las 20 consultas de 100 ms con `max: 10`? ¿Y cuántas harían fila?
(Respuesta: 2 tandas de 10 → unos 200 ms, más lo que cueste abrir las conexiones; 10 en fila al empezar. Compruébalo
añadiendo `10` a la lista `[1, 5, 20]` de `demo.js`.)

#### 12. ERROR COMÚN

**Síntoma:** el servicio funciona un rato después de cada reinicio y luego todas las peticiones que tocan la base
fallan o se quedan colgadas, aunque PostgreSQL está sano. `f104-pool-transacciones/fuga.js`:

```javascript
// ERROR COMÚN F104: olvidar client.release(). Ejecuta: node f104-pool-transacciones/fuga.js
import { crearPool } from './pool.js';

const pool = crearPool({ max: 3, connectionTimeoutMillis: 1000 });

async function contarSinDevolver() {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT 1 AS n');
  return rows[0].n; // falta client.release(): la conexión queda «prestada» para siempre
}

for (let peticion = 1; peticion <= 4; peticion++) {
  try {
    await contarSinDevolver();
    console.log(`petición ${peticion}: ok · total=${pool.totalCount} libres=${pool.idleCount} en fila=${pool.waitingCount}`);
  } catch (error) {
    console.log(`petición ${peticion}: ${error.name}: ${error.message} · total=${pool.totalCount} libres=${pool.idleCount}`);
  }
}
process.exit(0); // pool.end() esperaría para siempre a las 3 conexiones que nunca se devolvieron
```

**Cómo se ve** (salida real del paso 2): `libres=0` desde la primera petición y, cuando `total` alcanza `max`,

```text
petición 4: Error: timeout exceeded when trying to connect · total=3 libres=0
```

**Diagnóstico visual:** en una gráfica, `totalCount` sube en escalera hasta `max` y se queda plana, `idleCount`
está clavado en 0 y `waitingCount` crece: es la parada de taxis vacía. Desde la base se ve con
`SELECT state, count(*) FROM pg_stat_activity GROUP BY state`: muchas conexiones en `idle` (o, peor, `idle in
transaction` si además faltó el `COMMIT`/`ROLLBACK`) que nadie usa. Sin `connectionTimeoutMillis` no verías ni el
error: las peticiones esperarían para siempre. **Arreglo:** todo `pool.connect()` lleva su `client.release()` en un
`finally`; para consultas sueltas usa `pool.query()`, que devuelve la conexión sola.

Otro mensaje de la misma familia, cuando la suma de pools de todas tus réplicas supera lo que la base admite
(mensaje real de PostgreSQL 16 al agotar las conexiones para usuarios normales, código `53300`):

```text
remaining connection slots are reserved for roles with the SUPERUSER attribute
```

#### 13. PREGUNTA DE ENTREVISTA

«Tu servicio Node.js corre con 12 réplicas y empieza a fallar con *too many connections* en PostgreSQL. ¿Qué revisas
y qué cambias?»

**Respuesta modelo:** primero hago la cuenta: réplicas × `max` del pool, más las conexiones de otros servicios,
migraciones y herramientas, frente al `max_connections` de la base. Con 12 réplicas y el `max` por defecto de 10 ya
son 120 contra un límite típico de 100. Después miro si el pool está bien usado: `waitingCount` e `idleCount`,
conexiones `idle in transaction` en `pg_stat_activity` (transacciones que no se cierran, fugas por falta de
`release()` en un `finally`) y llamadas HTTP hechas con una transacción abierta. Con eso corregido, bajo el `max` por
réplica al valor que de verdad necesita (suele bastar con 5) y pongo `connectionTimeoutMillis` para fallar rápido.
Si el número de réplicas va a seguir creciendo, pongo un pooler como PgBouncer delante. Subir `max_connections` es
lo último: cada conexión cuesta memoria en el servidor y más conexiones no dan más rendimiento.

#### 14. ANTI-PATRÓN RELACIONADO

**«Transacción» con `pool.query`** (y su primo: abrir una conexión nueva por petición). Cada `pool.query` puede
usar una conexión distinta, y las sentencias de dos peticiones simultáneas se entremezclan.
`f104-pool-transacciones/anti-patron.js` lanza dos peticiones a la vez: la 1 debe fallar (Eva no existe) y la 2 debe
mover 20 de Luis a Ana.

```javascript
// ANTI-PATRÓN F104: «transacción» con pool.query(). Ejecuta: node f104-pool-transacciones/anti-patron.js
// Dos peticiones a la vez: la 1 debe fallar (Eva no existe) y la 2 debe mover 20 de Luis a Ana.
import { crearPool } from './pool.js';
import { preparar, saldos, transferir, transferirMal } from './cuentas.js';

for (const [nombre, fn] of [['pool.query (MAL)', transferirMal], ['client del pool (BIEN)', transferir]]) {
  const pool = crearPool({ max: 1 }); // una sola conexión: el caso más simple para ver el problema
  await preparar(pool);
  const [r1, r2] = await Promise.allSettled([fn(pool, 'ana', 'eva', 10), fn(pool, 'luis', 'ana', 20)]);
  console.log(`${nombre}: petición 1 ${r1.status} · petición 2 ${r2.status} · saldos`, await saldos(pool));
  await pool.end();
}
```

**Cómo se ve** (salida real del paso 3):

```text
pool.query (MAL): petición 1 rejected · petición 2 fulfilled · saldos { ana: 100, luis: 50 }
client del pool (BIEN): petición 1 rejected · petición 2 fulfilled · saldos { ana: 120, luis: 30 }
```

En la versión MAL, la petición 2 respondió «ok» **y su dinero no se movió**: el `ROLLBACK` de la petición 1 viajó por
la misma conexión y deshizo también los `UPDATE` de la 2, porque para PostgreSQL todo era una sola transacción. Con
más conexiones en el pool el resultado es peor todavía: depende de qué conexión le toque a cada sentencia, así que el
error aparece «a veces». La versión BIEN (función `transferir` de `cuentas.js`) da a cada petición su propia conexión
de principio a fin.

El primo, `new pg.Client()` + `connect()` + `end()` en cada petición, no corrompe datos pero paga el costo de abrir
una conexión cada vez y no tiene tope: bajo carga abre cientos y derriba la base. Un pool por proceso, creado al
arrancar.
