# Módulo 5: Bases de datos — drivers y ORMs

## Aprende construyendo

Cada tema es un proyecto independiente que comienza en una carpeta vacía. Escribe manualmente los archivos fuente y de configuración indicados; no copies proyectos prefabricados ni reutilices archivos o bases de datos de otros temas. `npm init -y` crea el `package.json`, que después editas para declarar ESM. Las migraciones y el cliente de Prisma sí se generan con sus comandos, pero siempre a partir del schema que escribiste en este tema.

### Tema 1: PostgreSQL desde Node con el driver puro · Básico · 90 min

#### Aprende

**Prerrequisitos:** Node LTS, npm, JavaScript ESM básico y Docker Desktop o Docker Engine funcionando. Este proyecto no necesita archivos de otros temas.

**Al terminar podrás:** levantar PostgreSQL localmente, conectarlo con `pg`, ejecutar consultas parametrizadas y diagnosticar separadamente un valor buscado, un dato duplicado y un fallo de conexión.

**Por qué importa:** una API de clientes debe buscar un correo sin permitir que el texto enviado por una persona cambie la estructura de SQL. Comprender el driver puro muestra qué ejecuta realmente la base y qué trabajo automatiza después un ORM; los parámetros siguen siendo la defensa fundamental contra inyección SQL en ambos caminos.

**Conceptos clave:** consultas parametrizadas, driver `pg`, SQL directo y pool de conexiones.

Conectar directamente a PostgreSQL usando el driver `pg`, sin ningún ORM intermedio, expone la interacción más cercana al motor: escribes SQL como strings y el driver devuelve filas y columnas estructuradas. Esta cercanía da control total sobre el SQL ejecutado, útil para optimizar consultas complejas, y evita una capa adicional de traducción entre objetos de aplicación y tablas relacionales.

Usa siempre consultas parametrizadas, como `pool.query("SELECT * FROM usuarios WHERE email = $1", [email])`. El marcador `$1` mantiene separados el SQL y el valor; concatenar entrada de usuario en el string permite que un valor malicioso altere la estructura de la consulta. El driver transmite los parámetros sin que tengas que implementar escapes manuales de caracteres especiales.

El driver puro es apropiado cuando necesitas control preciso, el equipo domina SQL o quieres evitar abstracción en una consulta crítica. Para CRUD estándar, un ORM como Prisma reduce código repetitivo a cambio de ceder parte del control directo sobre el SQL generado.

**Analogía:** usar `pg` es cocinar con ingredientes crudos y una receta exacta; un ORM es un robot que automatiza pasos comunes con instrucciones de alto nivel. SQL es la instrucción y cada parámetro ocupa una ranura separada: concatenar ambos equivale a permitir que alguien escriba sobre el formulario de la base.

El patrón esencial es:

```js
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// SEGURO: el parámetro permanece separado del SQL.
const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
// PELIGROSO: interpolar email en el string cambiaría la estructura ejecutable.
```

#### Practica

Verifica Docker antes de crear archivos:

```bash
docker --version
docker compose version
```

Estas banderas confirman la instalación sin arrancar contenedores. Si alguna falla, instala Docker Desktop en Windows/macOS o Docker Engine con el plugin Compose en Linux y vuelve a abrir la terminal. No uses `sudo npm install`: los permisos de npm y Docker son problemas separados.

Desde una carpeta vacía crea el proyecto e instala el driver:

```bash
mkdir ejemplo-pg-driver
cd ejemplo-pg-driver
npm init -y
npm install pg
mkdir src sql
```

Añade `"type": "module"` al nivel raíz de `package.json`. Crea manualmente `compose.yaml`:

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

Crea `sql/init.sql`:

```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL
);

INSERT INTO clientes (email, nombre)
VALUES ('ana@example.test', 'Ana');
```

Crea `.env`, que es local y no debe subirse a Git:

```text
DATABASE_URL=postgresql://academia:academia_local@127.0.0.1:5433/ejemplo_pg
```

Crea también `.gitignore`:

```text
.env
node_modules/
```

Crea `src/buscar-cliente.js`:

```js
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Define DATABASE_URL antes de ejecutar");

const pool = new pg.Pool({ connectionString });

try {
  const email = process.argv[2] ?? "ana@example.test";

  // $1 separa el SQL del valor controlado por la persona usuaria.
  const { rows } = await pool.query(
    "SELECT id, email, nombre FROM clientes WHERE email = $1",
    [email],
  );

  console.log(rows[0] ?? "Cliente no encontrado");
} finally {
  // Cierra conexiones para que el script CLI termine limpiamente.
  await pool.end();
}
```

Levanta la base y ejecuta el script. En macOS/Linux carga la variable así:

```bash
docker compose up -d
export DATABASE_URL='postgresql://academia:academia_local@127.0.0.1:5433/ejemplo_pg'
node src/buscar-cliente.js
```

En Windows PowerShell usa:

```powershell
docker compose up -d
$env:DATABASE_URL='postgresql://academia:academia_local@127.0.0.1:5433/ejemplo_pg'; node src/buscar-cliente.js
```

**Resultado esperado:** Docker muestra el contenedor iniciado y el script imprime el objeto de Ana con `id`, `email` y `nombre`.

**Fallo deliberado y corrección:** ejecuta `node src/buscar-cliente.js "' OR '1'='1"` con la variable ya definida. El resultado correcto es `Cliente no encontrado`, no todos los clientes: el parámetro sigue siendo un valor. No sustituyas la consulta por concatenación para “hacer que aparezca” un resultado; conserva `$1` y compara el comportamiento.

**Práctica guiada:** inserta un segundo cliente usando `INSERT ... VALUES ($1, $2) RETURNING id, email`. Usa `pool.query` con un arreglo de parámetros y prueba después buscar el correo insertado. Comprueba que el valor devuelto procede de la fila creada.

Al terminar todos los ejercicios del tema, detén y elimina el contenedor y el volumen local:

```bash
docker compose down -v
```

#### Aplica

**Ejercicio independiente:** crea `src/registrar-cliente.js` en este mismo proyecto. Valida que el email no esté vacío antes de insertarlo y maneja una violación de unicidad sin revelar SQL interno. Entrega una inserción válida y una duplicada, con sus salidas; conserva el código de error SQL de PostgreSQL solo en el log local.

En el **[proyecto integrador «API operativa de entregas»](#laboratorio-práctico)**, cada endpoint que lea o escriba datos reales debe tratar la entrada del cliente como valor, nunca como código SQL. Usa parámetros posicionales `$1`, `$2` tanto al consultar como al registrar.

**Checklist de salida**

- [ ] Creaste el proyecto, el SQL y la configuración desde una carpeta vacía.
- [ ] La búsqueda usa `$1` y un arreglo de parámetros, sin concatenar entrada.
- [ ] La entrada que parece SQL devuelve `Cliente no encontrado`.
- [ ] El script cierra el pool con `pool.end()` incluso cuando hay un error.
- [ ] La inserción devuelve la fila creada y el duplicado tiene un diagnóstico controlado.
- [ ] `.env` está excluido de Git y distingues el puerto del host `5433` del interno `5432`.

**Si falla.** Si ves `ECONNREFUSED`, PostgreSQL todavía no está disponible o el puerto no corresponde: ejecuta `docker compose ps` y `docker compose logs postgres`; no cambies el SQL. Si esperas que `init.sql` vuelva a ejecutarse tras reiniciar, recrea el entorno con `docker compose down -v` y `docker compose up -d`: la inicialización no se repite sobre datos ya inicializados.

**Cuándo no usarlo:** el driver puro obliga a mantener manualmente consultas y mapeo a objetos. Para muchas tablas y relaciones, Prisma reduce ese trabajo repetitivo a costa de una abstracción; conserva `pg` cuando necesites control total del SQL o tengas solo unas pocas consultas simples.

**Errores comunes:** concatenar entrada en SQL, olvidar `pool.end`, subir `.env`, confundir puertos y esperar que un reinicio ejecute nuevamente `init.sql` sin recrear el volumen.

**Fuentes oficiales:** [node-postgres](https://node-postgres.com/), [queries parametrizadas de `pg`](https://node-postgres.com/features/queries), [imagen oficial de PostgreSQL](https://hub.docker.com/_/postgres) y [PostgreSQL: sintaxis SQL](https://www.postgresql.org/docs/current/sql-syntax-lexical.html).

### Tema 2: Prisma — schema, migraciones y queries tipadas · Intermedio · 90 min

#### Aprende

**Prerrequisitos:** Node LTS, npm, ESM y conceptos básicos de tablas, claves y relaciones. Este proyecto usa SQLite y no reutiliza la base, el contenedor ni los archivos del Tema 1.

**Al terminar podrás:** declarar un modelo Prisma, crear y revisar una migración versionada, generar el cliente y consultar una base SQLite local mediante ese contrato.

**Por qué importa:** un equipo necesita que el esquema viaje con el código y pueda reconstruirse en otra máquina. Si cada persona modifica tablas a mano, los ambientes divergen; las migraciones ordenadas y el cliente generado conectan el diseño de datos con cambios reproducibles y consultas verificables.

**Conceptos clave:** `schema.prisma`, migraciones versionadas, cliente generado y tipado.

Prisma centraliza el modelo en `schema.prisma`: cada modelo describe campos, tipos y relaciones. A partir de ese contrato, Prisma genera migraciones SQL para crear o modificar tablas y un cliente JavaScript/TypeScript que refleja la estructura declarada.

En el lenguaje de schema, `@` introduce un **atributo de campo**. `id Int @id @default(autoincrement())` declara la clave primaria y un valor generado por la base. `@relation(fields: [usuarioId], references: [id])` conecta el campo de relación con la clave foránea escalar `usuarioId` y con la columna referenciada.

`@@` introduce un **atributo de bloque** que afecta al modelo completo. `@@index([usuarioId, completada])` solicita un índice compuesto y `@@unique([transportadoraId, numeroGuia])` expresa una unicidad de negocio entre campos. No son decoradores de TypeScript ni código que Node ejecute: Prisma analiza el schema, la migración traduce sus contratos a SQL y el cliente refleja el modelo resultante.

`prisma migrate dev --name descripcion` genera una migración SQL versionada y la aplica a la base de desarrollo configurada. Los archivos de migración se versionan con el código para que otra persona aplique los mismos cambios en el mismo orden, en vez de alterar tablas manualmente.

El cliente expone métodos como `prisma.tarea.create({ data: {...} })` y `prisma.tarea.findMany({ where: {...}, include: { usuario: true } })`. En TypeScript, el compilador comprueba que los campos de `data` o `where` existan antes de ejecutar; con SQL crudo, un nombre de columna incorrecto suele descubrirse al recibir el error de la base.

**Analogía:** Prisma es un arquitecto que, desde un plano central, genera las órdenes de construcción —las migraciones— y un manual verificado del edificio terminado —el cliente tipado— para que ambos reflejen el mismo diseño.

**Límite:** un atributo no sustituye el diseño de datos. Indexar todas las columnas aumenta almacenamiento y coste de escritura; una relación sin política explícita de borrado puede producir registros huérfanos o eliminaciones inesperadas. Revisa el SQL y prueba tanto una inserción válida como una violación de clave o unicidad. En consultas muy complejas u optimización crítica puede ser necesario complementar el ORM con SQL crudo.

La operación de aplicación conserva esta forma:

```js
const tarea = await prisma.tarea.create({
  data: { titulo: "Aprender Prisma", usuarioId: 1 },
});
```

#### Practica

Desde una carpeta vacía crea el proyecto y sus dependencias:

```bash
mkdir ejemplo-prisma-sqlite
cd ejemplo-prisma-sqlite
npm init -y
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
npm install --save-dev prisma @types/better-sqlite3 tsx
mkdir src prisma
```

Añade `"type": "module"` a `package.json`. No ejecutes un generador de proyecto: crea manualmente `.env`, `prisma.config.ts`, `prisma/schema.prisma`, `tsconfig.json` y los archivos de `src` que se indican. Prisma solo generará la migración y el cliente derivados de tu schema.

Crea `.env`:

```text
DATABASE_URL="file:./dev.db"
```

Crea `.gitignore`:

```text
.env
node_modules/
generated/
```

Crea `prisma.config.ts` para que el CLI localice el schema, las migraciones y la URL:

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

Crea `prisma/schema.prisma`:

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

`@id` identifica cada fila; `autoincrement()` deja el número al motor; `@default(false)` evita valores indefinidos y `@@index` declara un índice para búsquedas por estado. Crea `tsconfig.json` para ejecutar el ejemplo TypeScript como ESM:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```

Crea y aplica la migración; después genera explícitamente el cliente:

```bash
npx prisma migrate dev --name crear_tareas
npx prisma generate
```

Crea `src/usar-prisma.ts`:

```ts
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

try {
  const tarea = await prisma.tarea.create({
    data: { titulo: "Entender migraciones" },
  });

  const pendientes = await prisma.tarea.findMany({
    where: { completada: false },
    orderBy: { id: "asc" },
  });

  console.log({ creada: tarea, pendientes });
} finally {
  await prisma.$disconnect();
}
```

El adapter conecta el cliente de Prisma 7 con SQLite; `findMany` consulta el modelo, no una tabla escrita como string; `$disconnect` libera recursos. `tsx` ejecuta el archivo TypeScript y el cliente generado sin convertir el ejemplo a otro framework. Ejecuta:

```bash
npx tsx src/usar-prisma.ts
```

**Resultado esperado:** se crea `prisma/dev.db`, aparece `prisma/migrations` con SQL versionado y la consola muestra la tarea creada dentro de `pendientes`.

**Fallo deliberado y corrección:** cambia temporalmente `titulo` por `tituloInexistente` en `data` y ejecuta. El cliente informa que el campo no existe: schema y cliente están sincronizados. Restaura el campo. Después detén el script, borra manualmente `prisma/dev.db` y vuelve a ejecutar: el error indica que faltan las tablas. Recupera el estado aplicando las migraciones con `npx prisma migrate dev`; no crees tablas a mano.

**Práctica guiada:** añade `prioridad String @default("media")` al modelo y ejecuta `npx prisma migrate dev --name agregar_prioridad`; después ejecuta `npx prisma generate`. Inspecciona el SQL generado antes de volver al script y crea una tarea que use la prioridad predeterminada.

#### Aplica

**Ejercicio independiente:** crea un modelo `Etiqueta` y una relación muchos-a-muchos con `Tarea`. Inserta una tarea con etiqueta en una sola operación y entrega la salida de una consulta que incluya las etiquetas. Explica qué atributo describe cada lado de la relación y qué migración produjo el cambio.

En el **[proyecto integrador «API operativa de entregas»](#laboratorio-práctico)**, modela entregas y eventos con migraciones versionadas. Aplica la migración a una base local de prueba que ya contenga guías y verifica que conserva los datos existentes y las restricciones de unicidad.

**Checklist de salida**

- [ ] Escribiste manualmente schema, configuración y programa en un proyecto nuevo.
- [ ] Distingues `@id`, `@default`, `@relation`, `@@index` y `@@unique`.
- [ ] La migración quedó en `prisma/migrations` y su SQL fue revisado.
- [ ] Regeneraste el cliente después de cambiar el schema.
- [ ] El programa crea y consulta tareas mediante el cliente y cierra con `$disconnect`.
- [ ] El ejercicio de etiquetas demuestra la relación mediante una consulta con `include`.

**Si falla.** Si el campo no existe, compara `data` con el schema y restaura el nombre correcto. Si falta una tabla después de borrar la base, aplica las migraciones; si el cliente no refleja un campo recién añadido, ejecuta `npx prisma generate`. No uses `migrate dev` como comando de despliegue en producción ni edites la base para ocultar una migración pendiente.

**Errores comunes:** editar la base sin migración, olvidar `prisma generate` después de cambios en Prisma 7, subir `.env` con secretos, usar `migrate dev` en producción y añadir índices sin medir la consulta que los necesita.

**Fuentes oficiales:** [quickstart Prisma con SQLite](https://www.prisma.io/docs/prisma-orm/quickstart/sqlite), [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate), [`migrate dev`](https://docs.prisma.io/docs/cli/migrate/dev) y [SQLite connector](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/sqlite).

### Tema 3: Pool de conexiones y transacciones · Intermedio · 90 min

#### Aprende

**Prerrequisitos:** Node LTS, npm, Docker, consultas parametrizadas y SQL básico. El proyecto comienza en una carpeta vacía y no usa la base de los temas anteriores.

**Al terminar podrás:** limitar y liberar conexiones de un pool, ejecutar varias escrituras en una transacción y combinar atomicidad con una actualización condicional que proteja el stock.

**Por qué importa:** una tienda debe descontar inventario y registrar el pedido como una sola decisión. Un pool evita agotar PostgreSQL con conexiones nuevas por petición; una transacción evita cambios parciales, mientras que el predicado `stock >= $1` impide descontar un valor que otra operación ya modificó.

**Conceptos clave:** reutilización de conexiones, atomicidad, aislamiento, actualización condicional y `$transaction`.

Abrir una conexión de red para cada petición HTTP añade el coste de establecimiento y autenticación, y puede agotar el máximo de conexiones que PostgreSQL permite para preservar estabilidad. Un pool mantiene un número limitado de conexiones establecidas, presta una disponible y la reutiliza al terminar en vez de cerrarla.

Tanto `pg` como Prisma gestionan pools sin que implementes esa lógica desde cero. Aun así, el tamaño importa: un pool pequeño puede hacer esperar peticiones y uno grande no garantiza más rendimiento, porque desplaza la presión al servidor de base de datos.

Una transacción agrupa operaciones en una unidad atómica: si un paso falla, se revierten los cambios de esa transacción. **Atomicidad no significa que desaparezcan todas las condiciones de carrera.** Dos transacciones pueden leer el mismo stock antes de que ninguna actualice; para ese caso hacen falta una estrategia de concurrencia, como una actualización condicional, bloqueos o un nivel de aislamiento apropiado. La transacción sigue siendo necesaria para confirmar o revertir juntos el descuento y el pedido.

Este patrón de Prisma agrupa escrituras, pero la lectura seguida de una actualización basada en el valor leído **no basta por sí sola** para proteger stock concurrente:

```js
await prisma.$transaction(async (tx) => {
  const producto = await tx.producto.findUnique({ where: { id } });
  if (producto.stock < 1) throw new Error("Sin stock");
  // Si otra operación cambia stock después de findUnique, este valor puede estar obsoleto.
  await tx.producto.update({ where: { id }, data: { stock: producto.stock - 1 } });
  await tx.pedido.create({ data: { productoId: id } });
});
```

Dentro de `$transaction` debes usar `tx`, no el cliente global, para que todas las operaciones pertenezcan a la misma transacción. La demostración de este tema usa `pg` y traslada la comprobación de stock al predicado atómico del `UPDATE`; así la base decide si el descuento todavía es válido.

**Analogía:** un pool es una flota compartida de vehículos que se toman prestados y se devuelven. Una transacción es una transferencia entre cuentas: o se completan ambos movimientos o no queda dinero “a medio camino”. Esa atomicidad no impide por sí sola que dos personas intenten comprar la última unidad; la regla de disponibilidad debe aplicarse también al momento de actualizar.

#### Practica

Desde una carpeta vacía crea el proyecto e instala el driver:

```bash
mkdir ejemplo-pool-transaccion
cd ejemplo-pool-transaccion
npm init -y
npm install pg
mkdir src sql
```

Añade `"type": "module"` a `package.json`. Crea manualmente `compose.yaml`:

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

Crea `sql/init.sql`:

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

Crea `src/crear-pedido.js`:

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

Levanta PostgreSQL y ejecuta. En macOS/Linux:

```bash
docker compose up -d
export DATABASE_URL='postgresql://academia:academia_local@127.0.0.1:5434/tienda'
node src/crear-pedido.js
```

En Windows PowerShell:

```powershell
docker compose up -d
$env:DATABASE_URL='postgresql://academia:academia_local@127.0.0.1:5434/tienda'; node src/crear-pedido.js
```

**Resultado esperado:** se crea un pedido con `id: 1` y el producto queda con stock `0`. `cliente.release()` devuelve la conexión al pool y `pool.end()` permite cerrar el script.

**Fallo deliberado y corrección:** ejecuta el script una segunda vez sin recrear la base. El `UPDATE` no devuelve filas porque el stock ya es `0`; el código ejecuta `ROLLBACK` y no crea un segundo pedido. Compruébalo con:

```bash
docker compose exec postgres psql -U academia -d tienda -c "SELECT stock FROM productos; SELECT count(*) AS pedidos FROM pedidos;"
```

La salida debe mostrar stock `0` y un único pedido. No aumentes stock en el código para ocultar el rechazo: la restricción de negocio y el predicado SQL están funcionando. Conserva ese `UPDATE`; cambiarlo por una lectura seguida de escritura eliminaría la protección ante cambios concurrentes.

**Práctica guiada:** intenta pedir cantidad `2` con stock inicial `1`. Recrea el volumen, cambia solo el argumento de `crearPedido` y ejecuta una vez. Verifica que no exista ningún pedido y que el stock siga siendo `1`; restaura después el argumento `1` si continuarás experimentando.

Al finalizar, elimina el entorno local:

```bash
docker compose down -v
```

#### Aplica

**Ejercicio independiente:** agrega una tabla `movimientos_inventario` e inserta un movimiento dentro de la misma transacción. En la base local desechable, provoca un `CHECK` inválido en el movimiento y entrega la prueba de que ni stock, ni pedido, ni movimiento quedaron modificados. Corrige el dato y demuestra después que las tres escrituras se confirman juntas.

En el **[proyecto integrador «API operativa de entregas»](#laboratorio-práctico)**, confirma la entrega y registra su evento dentro de una transacción. Provoca un fallo determinista entre ambas escrituras en el entorno local, verifica el rollback completo y comprueba que la conexión vuelve al pool. No presentes esa prueba de atomicidad como evidencia de ausencia de condiciones de carrera.

**Checklist de salida**

- [ ] El pool tiene un límite explícito y cierras sus recursos al terminar.
- [ ] Todos los pasos de la transacción usan el mismo cliente reservado.
- [ ] `cliente.release()` está en `finally` y se ejecuta tanto al confirmar como al fallar.
- [ ] El `UPDATE` comprueba stock en SQL en vez de confiar solo en una lectura previa.
- [ ] El segundo pedido se rechaza sin cambiar stock ni insertar otra fila.
- [ ] El fallo del movimiento demuestra rollback de todas las escrituras.

**Si falla.** Si una parte de la transacción usa `pool.query` y otra `cliente.query`, puede terminar en conexiones distintas: ejecuta todos los pasos con el mismo `cliente`. Si el script no termina, revisa `release` y `pool.end`; si el stock no cambia y no hay pedido, inspecciona `rowCount` antes de intentar otro `COMMIT`.

**Errores comunes:** usar conexiones distintas dentro de una transacción, olvidar `release`, llamar `COMMIT` después de un error, confiar solo en una lectura previa de stock, afirmar que atomicidad equivale a aislamiento total y confundir un pool grande con rendimiento garantizado.

**Fuentes oficiales:** [node-postgres pools](https://node-postgres.com/features/pooling), [node-postgres transactions](https://node-postgres.com/features/transactions), [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html) y [`UPDATE`](https://www.postgresql.org/docs/current/sql-update.html).

### Tema 4: MongoDB con Mongoose y otras alternativas de ORM · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node LTS, npm, Docker Desktop o Docker Engine, objetos JavaScript y promesas. El proyecto comienza en una carpeta vacía y no comparte archivos ni servicios con los otros temas.

**Al terminar podrás:** levantar una base MongoDB local, validar documentos con Mongoose, resolver una referencia con `populate` y justificar cuándo referenciar, anidar o conservar un modelo relacional.

**Por qué importa:** un catálogo de paquetes puede tener atributos opcionales según el tipo de envío, mientras auditoría y pagos suelen requerir relaciones estrictas. Elegir documentos o tablas según datos y consultas evita adoptar MongoDB por moda o sustituir integridad relacional por conveniencia.

**Conceptos clave:** documentos frente a tablas relacionales, Schemas de Mongoose, modelos, validación y population.

MongoDB es una base orientada a documentos: almacena documentos BSON, representados habitualmente con sintaxis similar a JSON, agrupados en colecciones en vez de filas con columnas relacionales. Mongoose permite definir Schemas que imponen estructura y validación desde la aplicación, y Models que representan colecciones y exponen métodos para crear, consultar y actualizar documentos.

La flexibilidad del documento no elimina la necesidad de reglas de calidad. `required`, `trim`, `lowercase` y `enum` expresan contratos de aplicación; además, una propiedad `unique` de Mongoose crea un índice y no debe tratarse como un validador síncrono.

“Population” resuelve referencias entre documentos. Cuando un documento guarda el identificador de otro, `populate` lo sustituye por el documento relacionado al consultar, en espíritu similar al `include` de Prisma, pero con otra consulta y consideraciones de rendimiento propias. No equivale automáticamente a un join barato.

Sequelize y TypeORM son alternativas relacionales anteriores a Prisma en adopción histórica, con enfoques más tradicionales basados en modelos y clases, cercanos a Active Record, frente al schema central y cliente generado de Prisma. En proyectos nuevos puede favorecerse Prisma por sus tipos y migraciones; un sistema estable con Sequelize o TypeORM raramente justifica una migración completa solo por adoptar la alternativa más reciente.

**Analogía:** PostgreSQL es un archivador con formularios idénticos y campos predefinidos; MongoDB es una colección de notas agrupadas por tema cuya estructura puede variar. Un Schema de Mongoose vuelve explícitas las reglas que esas notas deben cumplir.

El patrón de referencia y consulta es:

```js
const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
});
const Tarea = mongoose.model("Tarea", tareaSchema);
const tareas = await Tarea.find().populate("usuario");
```

#### Practica

Desde una carpeta vacía crea el ejemplo y levanta una base local desechable:

```bash
mkdir ejemplo-mongoose
cd ejemplo-mongoose
npm init -y
npm install mongoose
mkdir src
docker run --name mongo-academia -p 27017:27017 -d mongo:7
```

Añade `"type": "module"` a `package.json` y crea manualmente `src/app.js`:

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

`required` valida presencia, `trim` normaliza espacios, `lowercase` normaliza el email y `lean()` devuelve un objeto simple para lectura. `deleteMany({})` solo limpia la colección de esta base local de práctica. Desde la raíz ejecuta:

```bash
node src/app.js
```

**Resultado esperado:** imprime el identificador generado y `email: 'ana@ejemplo.test'`.

**Fallo deliberado y corrección:** cambia el email por una cadena vacía y ejecuta. Mongoose lanza un `ValidationError` antes de guardar porque el documento incumple una regla. Restaura `ANA@ejemplo.test`, verifica nuevamente la normalización y conserva el contenedor para las prácticas siguientes.

**Práctica guiada:** añade `tipo` con valores `estandar` o `fragil` mediante un `enum`. Prueba primero un valor permitido y después `urgente`; conserva el mensaje de validación y restaura un valor válido antes de continuar.

Al terminar todos los ejercicios, detén y elimina el contenedor local:

```bash
docker rm -f mongo-academia
```

#### Aplica

**Ejercicio independiente:** crea un modelo `Direccion` y referencia su `_id` desde `Cliente`; consulta con `.populate("direccion")`. Entrega el documento antes y después de poblarlo y explica el coste de la consulta adicional. Compara esa solución con anidar la dirección según las consultas que necesita el catálogo.

En el **[proyecto integrador «API operativa de entregas»](#laboratorio-práctico)**, compara el modelo documental de evidencia con sus consultas reales. Explica qué reglas de consistencia necesitarías si dos procesos actualizaran el mismo documento antes de sustituir una base relacional; no uses una ejecución concurrente sin controles como demostración de seguridad.

**Checklist de salida**

- [ ] Creaste el proyecto y el schema desde cero, sin archivos de otros temas.
- [ ] El documento válido normaliza email y espacios como declara el schema.
- [ ] El email vacío produce `ValidationError` y corregiste el dato.
- [ ] El `enum` acepta los dos valores definidos y rechaza `urgente`.
- [ ] El ejercicio muestra la referencia antes y después de `populate`.
- [ ] Cerraste Mongoose y eliminaste el contenedor local al terminar.

**Si falla.** Si la conexión es rechazada, comprueba que `mongo-academia` siga activo y que el puerto local sea `27017`. Si un valor permitido también falla, revisa que el `enum` y el dato tengan exactamente los mismos strings. Si `populate` devuelve `null`, verifica que el `_id` referenciado exista y que `ref` nombre el modelo correcto; no lo confundas con un fallo de validación.

**Errores comunes:** confiar en `unique` como validador síncrono, abrir una conexión por documento, olvidar `disconnect`, usar `populate` sin medir, guardar secretos de conexión en el código y confundir flexibilidad con ausencia de diseño.

**Fuentes oficiales:** [Mongoose schemas](https://mongoosejs.com/docs/guide.html), [validación](https://mongoosejs.com/docs/validation.html), [`populate`](https://mongoosejs.com/docs/populate.html) y [MongoDB documentos](https://www.mongodb.com/docs/manual/core/document/).

## Laboratorio práctico

**Objetivo del laboratorio:** construir el cierre del **proyecto integrador «API operativa de entregas»** conectando una API Express a PostgreSQL mediante Prisma, con migraciones versionadas y una prueba local determinista de atomicidad. El ejercicio no busca provocar condiciones de carrera reales ni demostrar que una transacción las elimina por sí sola.

**Requisitos previos:** Docker instalado y Módulos 0–4 completados. Comienza desde una carpeta vacía llamada `lab-api-entregas`, ejecuta `npm init -y` y escribe manualmente `compose.yaml`, `prisma/schema.prisma`, `prisma.config.ts`, `.env`, `.gitignore` y los archivos de `src`. No copies el proyecto de ningún tema ni reutilices sus contenedores, volúmenes o migraciones; instala en este proyecto las dependencias que declares en su `package.json`.

| Paso | Acción | Comando/Código | Resultado observable |
|---|---|---|---|
| 1 | Levantar PostgreSQL local | `docker compose up -d` con credenciales solo de laboratorio en tu propio `compose.yaml`; conecta con `pg` y ejecuta `SELECT 1` | Una consulta mínima confirma conectividad antes de crear la API. |
| 2 | Definir y migrar el modelo | Escribe los modelos `Tarea`, `Producto` y `Pedido`; ejecuta `npx prisma migrate dev --name iniciar_laboratorio` y `npx prisma generate` | La migración queda versionada y crea tablas y restricciones. |
| 3 | Usar el cliente desde Express | Implementa manualmente rutas para crear, listar y actualizar tareas con el cliente generado | Las rutas responden desde esta API nueva, sin importar rutas del Módulo 4. |
| 4 | Reproducir un cambio parcial sin concurrencia | En un script local, descuenta stock y después inserta un pedido con `cantidad = 0` que viole su `CHECK`, todavía sin transacción | El descuento queda aplicado aunque el pedido falla; una sola ejecución basta, sin requests simultáneas. |
| 5 | Corregir la atomicidad | Restaura los datos locales, agrupa ambas escrituras con `$transaction`, usa `tx` y conserva un `UPDATE ... WHERE stock >= cantidad` parametrizado | Al repetir el mismo fallo, stock y pedidos vuelven al estado inicial; con datos válidos, ambos cambios se confirman. |
| 6 | Comparar una misma consulta | Implementa una lectura equivalente con SQL crudo, driver `pg` y Prisma | Compara legibilidad, control del SQL y seguridad de tipos sin concatenar valores en ninguna variante. |

**Verificación:** conserva las salidas de `SELECT 1`, las migraciones, las respuestas CRUD y los estados antes y después del fallo. El paso 4 debe mostrar el cambio parcial y el paso 5 el rollback completo en esta base local desechable. La actualización condicional documenta la regla de stock, pero esta práctica de atomicidad no certifica aislamiento ni ausencia de condiciones de carrera bajo carga concurrente.

**Errores comunes y soluciones**

- **Concatenar directamente valores de entrada en SQL crudo.** Usa siempre consultas parametrizadas (`$1`, `$2`), nunca concatenación directa de strings de entrada del usuario.
- **Olvidar versionar los archivos de migración generados por Prisma.** Las migraciones deben acompañar al código para que el equipo reproduzca la misma estructura de base de datos.
- **Confiar solo en una transacción para modificar datos compartidos.** La transacción aporta atomicidad; para concurrencia, diseña además actualizaciones condicionales, bloqueos o aislamiento según la operación y pruébalos en un entorno controlado.
- **Reutilizar datos de otro laboratorio.** Usa el contenedor y volumen propios de este proyecto y elimina el entorno local al terminar con `docker compose down -v`.

La evidencia de cierre son los archivos creados, las migraciones, las respuestas y las trazas de rollback; una marca de finalización no sustituye esa comprobación.
