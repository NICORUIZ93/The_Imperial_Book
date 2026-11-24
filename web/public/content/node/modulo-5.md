# Módulo 5: Bases de datos — drivers y ORMs

## Aprende construyendo

Cada tema es un proyecto independiente que comienza en una carpeta vacía. Escribe manualmente los archivos fuente y de configuración indicados; no copies proyectos prefabricados ni reutilices archivos o bases de datos de otros temas. `npm init -y` crea el `package.json`, que después editas para declarar ESM. Las migraciones y el cliente de Prisma sí se generan con sus comandos, pero siempre a partir del schema que escribiste en este tema.


### Tema 1: PostgreSQL desde Node con el driver puro · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// SEGURO: el parámetro permanece separado del SQL.
const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
// PELIGROSO: interpolar email en el string cambiaría la estructura ejecutable.
```

```bash
docker --version
docker compose version
```

```bash
mkdir ejemplo-pg-driver
cd ejemplo-pg-driver
npm init -y
npm install pg
mkdir src sql
```

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: academia
      POSTGRES_PASSWORD: academia_local
      POSTGRES_DB: ejemplo_pg
    ports:
      - "5433:5432"
    volumes:
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL
);

INSERT INTO clientes (email, nombre)
VALUES ('ana@example.test', 'Ana');
```

```text
DATABASE_URL=postgresql://academia:academia_local@127.0.0.1:5433/ejemplo_pg
```

</details>

### Tema 2: Prisma — schema, migraciones y queries tipadas · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
const tarea = await prisma.tarea.create({
  data: { titulo: "Aprender Prisma", usuarioId: 1 },
});
```

```bash
mkdir ejemplo-prisma-sqlite
cd ejemplo-prisma-sqlite
npm init -y
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
npm install --save-dev prisma @types/better-sqlite3 tsx
mkdir src prisma
```

```text
DATABASE_URL="file:./dev.db"
```

```text
.env
node_modules/
generated/
```

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Tarea {
  id         Int      @id @default(autoincrement())
  titulo     String
  completada Boolean  @default(false)
  creadaEn   DateTime @default(now())

  @@index([completada])
}
```

</details>

### Tema 3: Pool de conexiones y transacciones · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
await prisma.$transaction(async (tx) => {
  const producto = await tx.producto.findUnique({ where: { id } });
  if (producto.stock < 1) throw new Error("Sin stock");
  // Si otra operación cambia stock después de findUnique, este valor puede estar obsoleto.
  await tx.producto.update({ where: { id }, data: { stock: producto.stock - 1 } });
  await tx.pedido.create({ data: { productoId: id } });
});
```

```bash
mkdir ejemplo-pool-transaccion
cd ejemplo-pool-transaccion
npm init -y
npm install pg
mkdir src sql
```

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: academia
      POSTGRES_PASSWORD: academia_local
      POSTGRES_DB: tienda
    ports:
      - "5434:5432"
    volumes:
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

```sql
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0)
);

INSERT INTO productos (nombre, stock) VALUES ('Cuaderno', 1);
```

```js
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, // Límite consciente para el laboratorio; no es un número universal.
});

async function crearPedido(productoId, cantidad) {
  const cliente = await pool.connect(); // Una misma conexión para toda la transacción.

  try {
    await cliente.query("BEGIN");

    const descuento = await cliente.query(
      `UPDATE productos
       SET stock = stock - $1
       WHERE id = $2 AND stock >= $1
       RETURNING id, stock`,
      [cantidad, productoId],
    );

    if (descuento.rowCount === 0) throw new Error("Stock insuficiente o producto inexistente");

    const pedido = await cliente.query(
      "INSERT INTO pedidos (producto_id, cantidad) VALUES ($1, $2) RETURNING id, producto_id, cantidad",
      [productoId, cantidad],
    );

    await cliente.query("COMMIT");
    return pedido.rows[0];
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release(); // Devuelve la conexión al pool; no la destruye.
  }
}

try {
  console.log("Pool máximo:", pool.options.max);
  console.log("Pedido creado:", await crearPedido(1, 1));
} catch (error) {
  console.error("Pedido rechazado:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
```

```bash
docker compose up -d
export DATABASE_URL='postgresql://academia:academia_local@127.0.0.1:5434/tienda'
node src/crear-pedido.js
```

</details>

### Tema 4: MongoDB con Mongoose y otras alternativas de ORM · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
});
const Tarea = mongoose.model("Tarea", tareaSchema);
const tareas = await Tarea.find().populate("usuario");
```

```bash
mkdir ejemplo-mongoose
cd ejemplo-mongoose
npm init -y
npm install mongoose
mkdir src
docker run --name mongo-academia -p 27017:27017 -d mongo:7
```

```js
import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
});
const Cliente = mongoose.model("Cliente", clienteSchema);

await mongoose.connect("mongodb://127.0.0.1:27017/academia");
try {
  await Cliente.deleteMany({});
  const cliente = await Cliente.create({ nombre: "Ana", email: "ANA@ejemplo.test" });
  const encontrado = await Cliente.findById(cliente.id).lean();
  console.log({ id: encontrado._id.toString(), email: encontrado.email });
} finally {
  await mongoose.disconnect();
}
```

```bash
node src/app.js
```

```bash
docker rm -f mongo-academia
```

</details>
