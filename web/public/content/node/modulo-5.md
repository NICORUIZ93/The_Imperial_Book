# Módulo 5: Bases de datos — drivers y ORMs


## Aprende construyendo

### Tema 1: PostgreSQL desde Node con el driver puro

**Conceptos clave:** consultas parametrizadas, driver `pg`, SQL directo.

Conectar directamente a PostgreSQL usando el driver `pg` (sin ningún ORM intermedio) expone la interacción más cercana posible al motor de base de datos real: se escriben consultas SQL directamente como strings, y el driver las ejecuta devolviendo los resultados en un formato estructurado de filas y columnas. Esta cercanía tiene ventajas concretas: control total sobre exactamente qué SQL se ejecuta (relevante para optimizar consultas complejas donde la abstracción de un ORM podría generar SQL subóptimo), y ausencia de cualquier capa adicional de traducción entre el modelo de objetos de la aplicación y las tablas relacionales de la base de datos.

Es crítico usar siempre consultas parametrizadas (`pool.query("SELECT * FROM usuarios WHERE email = $1", [email])`, donde `$1` es un marcador de posición que el driver sustituye de forma segura) en vez de concatenar directamente valores de entrada del usuario dentro del string SQL, precisamente porque la concatenación directa abre la puerta a inyección SQL (un ataque donde un valor de entrada malicioso altera la estructura misma de la consulta SQL ejecutada, tema que se profundizará en el Módulo 10). El driver `pg` escapa automáticamente los valores pasados como parámetros, neutralizando este riesgo sin que el desarrollador necesite implementar manualmente ningún escape de caracteres especiales.

Trabajar con el driver puro es apropiado cuando se necesita control preciso sobre consultas complejas, cuando el equipo tiene fuerte experiencia en SQL, o en contextos de rendimiento extremadamente crítico donde cualquier overhead de abstracción de un ORM es indeseable; para la mayoría de aplicaciones con operaciones CRUD relativamente estándar, un ORM como Prisma (Tema 2) reduce considerablemente la cantidad de código repetitivo necesario, a cambio de renunciar a parte de ese control directo sobre el SQL exacto generado.

**Analogía:** usar el driver `pg` puro es como cocinar directamente con ingredientes crudos siguiendo tu propia receta exacta, con control total sobre cada paso; usar un ORM es como usar un robot de cocina programable que automatiza los pasos más comunes según instrucciones de alto nivel, a cambio de menos control directo sobre cada detalle específico del proceso.

**¿Por qué es importante?** Entender el driver puro y las consultas parametrizadas es la base indispensable para entender qué hace un ORM automáticamente por debajo, y las consultas parametrizadas son la defensa fundamental contra inyección SQL, sin importar si finalmente se usa un ORM o el driver directamente.

**Código del ejemplo:**

```js
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// SEGURO: parámetros, el driver escapa automáticamente
const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
// PELIGROSO: concatenación directa, vulnerable a inyección SQL
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás levantar PostgreSQL localmente, conectarlo con `pg` y ejecutar una consulta parametrizada. **Prerrequisitos:** Node LTS, npm y Docker Desktop o Docker Engine funcionando. Este ejemplo independiente comienza desde una carpeta vacía.

Verifica Docker antes de crear archivos:

```bash
docker --version
docker compose version
```

`--version` es la bandera que confirma qué versión de Docker está instalada, sin arrancar ningún contenedor todavía. Si alguno falla, instala Docker Desktop en Windows/macOS o Docker Engine con el plugin Compose en Linux y vuelve a abrir la terminal. No continúes usando `sudo npm install`: los permisos de npm y Docker son problemas separados.

#### Paso 2 · Contexto y caso real

Una API de clientes necesita buscar un correo sin permitir que el texto enviado por un usuario cambie la estructura de SQL. Usarás una base local desechable para aprender conexión y parámetros sin depender de una cuenta externa.

#### Paso 3 · Teoría y analogía aplicada

SQL es la instrucción y un parámetro es el valor colocado en una ranura separada. Concatenar ambos equivale a permitir que alguien escriba sobre el formulario de la base; `$1` mantiene la estructura de la consulta bajo control del programa y deja el valor al driver.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto e instala el driver:

```bash
mkdir ejemplo-pg-driver
cd ejemplo-pg-driver
npm init -y
npm install pg
mkdir src sql
```

Añade `"type": "module"` a `package.json`. Crea `compose.yaml`:

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

Crea `.env` —es local y no debe subirse a Git— con una sola línea:

```text
DATABASE_URL=postgresql://academia:academia_local@127.0.0.1:5433/ejemplo_pg
```

Crea `src/buscar-cliente.js`:

```js
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Define DATABASE_URL antes de ejecutar");

const pool = new pg.Pool({ connectionString });

try {
  const email = process.argv[2] ?? "ana@example.test";

  // $1 separa el SQL del valor; no concatena texto controlado por la persona usuaria.
  const { rows } = await pool.query(
    "SELECT id, email, nombre FROM clientes WHERE email = $1",
    [email],
  );

  console.log(rows[0] ?? "Cliente no encontrado");
} finally {
  // Cierra conexiones para que un script CLI termine de forma limpia.
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

```bash
docker compose up -d
$env:DATABASE_URL='postgresql://academia:academia_local@127.0.0.1:5433/ejemplo_pg'; node src/buscar-cliente.js
```

**Resultado esperado:** Docker muestra el contenedor iniciado y el script imprime el objeto de Ana con `id`, `email` y `nombre`.

**Fallo deliberado y diagnóstico:** ejecuta `node src/buscar-cliente.js "' OR '1'='1"` con la variable ya definida. El resultado correcto es `Cliente no encontrado`, no todos los clientes. El parámetro sigue siendo un valor. Si ves `ECONNREFUSED`, Docker/PostgreSQL no está listo: ejecuta `docker compose ps` y `docker compose logs postgres`, no cambies el SQL.

Al terminar el laboratorio, detén y elimina el contenedor y volumen local:

```bash
docker compose down -v
```

#### Paso 5 · Práctica guiada

Inserta un segundo cliente usando `INSERT ... VALUES ($1, $2) RETURNING id, email`. **Pista:** usa `pool.query` con arreglo de parámetros y prueba después buscar el correo insertado.

#### Paso 6 · Práctica independiente

Crea `src/registrar-cliente.js` que valide email no vacío antes de insertarlo y maneje una violación de unicidad sin revelar SQL interno. Entrega una inserción válida y una duplicada, con sus salidas y el código SQL de PostgreSQL solo en el log local.

#### Paso 7 · Cierre y conexión

Ya puedes iniciar una base local, abrir un pool y hacer consultas parametrizadas. El siguiente tema usará Prisma y migraciones en un proyecto nuevo; no reutilizará esta carpeta ni sus datos.

Consultar con parámetros posicionales (`$1`, `$2`) en vez de concatenar SQL es exactamente el hábito que exige el proyecto integrador de este track (API productiva, Módulo 12), donde cada endpoint que lee o escribe datos reales debe tratar la entrada del cliente como valor, nunca como código SQL.

**Cuándo no usarlo:** el driver `pg` puro obliga a escribir y mantener manualmente cada consulta SQL y su mapeo a objetos; para un esquema con muchas tablas y relaciones, un ORM tipado como Prisma (Tema 2) reduce ese trabajo repetitivo a costa de una capa de abstracción adicional — usa el driver puro cuando necesitas control total sobre el SQL exacto o solo tienes una o dos consultas simples.

**Errores comunes:** concatenar entrada en SQL; olvidar `pool.end` en un script; subir `.env`; confundir puerto del host `5433` con puerto interno `5432`; reiniciar el contenedor esperando que vuelva a ejecutar `init.sql` sin recrear el volumen.

**Fuentes oficiales:** [node-postgres](https://node-postgres.com/), [queries parametrizadas de `pg`](https://node-postgres.com/features/queries), [imagen oficial de PostgreSQL](https://hub.docker.com/_/postgres) y [PostgreSQL: SQL injection](https://www.postgresql.org/docs/current/sql-syntax-lexical.html).

### Tema 2: Prisma — schema, migraciones y queries tipadas

**Conceptos clave:** `schema.prisma`, migraciones versionadas, cliente generado y tipado.

#### Cómo leer `@id`, `@default`, `@relation` y `@@index`

En el lenguaje de esquema de Prisma, `@` introduce un **atributo de campo**: modifica el contrato del campo escrito inmediatamente a su izquierda. `id Int @id @default(autoincrement())` declara que `id` forma la clave primaria y que su valor predeterminado lo genera la base de datos. `@relation(fields: [usuarioId], references: [id])` conecta el campo de relación de Prisma con la clave foránea escalar `usuarioId` y con la columna referenciada del otro modelo.

`@@` introduce un **atributo de bloque** y afecta al modelo completo. Por ejemplo, `@@index([usuarioId, completada])` solicita un índice compuesto y `@@unique([transportadoraId, numeroGuia])` expresa una unicidad de negocio entre varios campos. No son decoradores de TypeScript ni código que Node ejecute: el motor de Prisma analiza el schema, la migración traduce esos contratos a SQL y el cliente generado refleja después el modelo resultante.

**Límite:** un atributo no sustituye el diseño de datos. Añadir índices a todas las columnas aumenta almacenamiento y coste de escritura; una relación sin una política explícita de borrado puede producir registros huérfanos o eliminaciones inesperadas. Antes de migrar, revisa el SQL generado y prueba tanto la inserción válida como la violación de clave o unicidad.

Prisma es un ORM moderno para Node y TypeScript que centraliza la definición del modelo de datos en un único archivo declarativo (`schema.prisma`), describiendo cada tabla como un modelo con sus campos, tipos y relaciones (`model Tarea { id Int @id @default(autoincrement()) titulo String usuario Usuario @relation(...) }`), a partir del cual Prisma genera automáticamente tanto las migraciones SQL necesarias para crear o modificar las tablas reales en la base de datos, como un cliente JavaScript/TypeScript completamente tipado que refleja exactamente esa estructura de datos declarada.

`prisma migrate dev --name descripcion` genera un archivo de migración SQL versionado (committeado al control de versiones junto con el resto del código) que captura exactamente qué cambios de esquema se aplicaron y en qué orden, y aplica esa migración inmediatamente contra la base de datos de desarrollo configurada. Este enfoque de migraciones versionadas resuelve un problema real de coordinación en equipo: cualquier colaborador que aplique las migraciones en el mismo orden reproducirá exactamente la misma estructura de base de datos, sin depender de que cada persona modifique manualmente y de forma no sincronizada la estructura de tablas de forma directa e independiente.

El cliente generado por Prisma expone métodos tipados como `prisma.tarea.create({data: {...}})` y `prisma.tarea.findMany({where: {...}, include: {usuario: true}})`, donde el propio compilador de TypeScript verifica en tiempo de compilación que los campos usados en `data` o `where` efectivamente existen en el modelo `Tarea` declarado en el schema, capturando errores de tipeo o de campos inexistentes antes de que el código siquiera se ejecute, una ventaja considerable de seguridad de tipos que el SQL crudo del Tema 1 no ofrece de forma nativa (donde un error de nombre de columna solo se descubre al ejecutar la consulta y recibir un error de la base de datos).

**Analogía:** Prisma es como un arquitecto que, a partir de un único plano central del edificio (`schema.prisma`), genera automáticamente tanto las órdenes de construcción exactas para los contratistas (las migraciones SQL) como un manual de uso preciso y verificado del edificio terminado (el cliente tipado), garantizando que ambos siempre reflejen exactamente la misma estructura declarada en el plano original.

**¿Por qué es importante?** Prisma reduce considerablemente el código repetitivo de acceso a datos y aporta seguridad de tipos verificada en tiempo de compilación, a cambio de una capa de abstracción que, en casos de consultas extremadamente complejas u optimización crítica, puede requerir recurrir a SQL crudo complementario.

**Configuración del ejemplo:**

```prisma
model Tarea {
  id         Int      @id @default(autoincrement())
  titulo     String
  completada Boolean  @default(false)
  usuario    Usuario  @relation(fields: [usuarioId], references: [id])
  usuarioId  Int
}
```
```bash
npx prisma migrate dev --name agregar_tareas
```
```js
const tarea = await prisma.tarea.create({ data: { titulo: "Aprender Prisma", usuarioId: 1 } });
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás declarar un modelo Prisma, crear una migración y consultar una base SQLite local con el cliente generado. **Prerrequisitos:** Node LTS y npm. Este ejemplo independiente comienza desde una carpeta vacía; SQLite evita requerir Docker para aprender el ciclo de migraciones.

#### Paso 2 · Contexto y caso real

Un equipo necesita que el esquema de datos viaje con el código y pueda reconstruirse en otra máquina. En lugar de crear tablas manualmente en cada ambiente, Prisma genera migraciones versionables a partir de un contrato declarativo.

#### Paso 3 · Teoría y analogía aplicada

`schema.prisma` es el plano; una migración es la orden de construcción que queda registrada; el cliente generado es la interfaz que consulta el edificio construido. `@id` define identidad, `@default` genera valores, `@relation` conecta modelos y `@@index` acelera patrones de consulta, pero ningún atributo reemplaza validar reglas de negocio o revisar el SQL generado.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto y las dependencias actuales de Prisma con SQLite:

```bash
mkdir ejemplo-prisma-sqlite
cd ejemplo-prisma-sqlite
npm init -y
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
npm install --save-dev prisma @types/better-sqlite3
npx prisma init --datasource-provider sqlite --output ../generated/prisma
mkdir src
```

`--datasource-provider` es la bandera que fija con qué motor de base de datos trabaja Prisma (aquí, `sqlite`), y `--output` es la bandera que fija dónde generar el cliente. El comando crea `.env`, `prisma/schema.prisma` y `prisma.config.ts`. En `.env`, conserva la URL local:

```text
DATABASE_URL="file:./dev.db"
```

Reemplaza `prisma/schema.prisma` por:

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

`@id` identifica cada fila; `autoincrement()` deja el número al motor; `@default(false)` evita valores indefinidos; `@@index` declara un índice para búsquedas frecuentes por estado. Crea y aplica la migración, luego genera explícitamente el cliente:

```bash
npx prisma migrate dev --name crear_tareas
npx prisma generate
```

Crea `src/usar-prisma.js`:

```js
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
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

El adapter conecta el cliente de Prisma 7 con SQLite; `findMany` consulta el modelo, no una tabla escrita como string; `$disconnect` libera recursos al terminar el script. Ejecuta:

```bash
node src/usar-prisma.js
```

**Resultado esperado:** se crea `prisma/dev.db`, aparece una carpeta `prisma/migrations` con SQL versionado y la consola muestra la tarea creada dentro de `pendientes`.

**Fallo deliberado y diagnóstico:** cambia temporalmente `titulo` por `tituloInexistente` en `data` y ejecuta. El cliente generado informa que el campo no existe. El diagnóstico demuestra que el contrato del schema y el cliente están sincronizados; restaura el campo. Después borra manualmente `prisma/dev.db` y ejecuta el script: el error indica que debes aplicar las migraciones, no crear tablas a mano.

#### Paso 5 · Práctica guiada

Añade `prioridad String @default("media")` al modelo y ejecuta otra migración con un nombre descriptivo. **Pista:** usa `npx prisma migrate dev --name agregar_prioridad` y luego `npx prisma generate`; inspecciona el SQL antes de ejecutar el script.

#### Paso 6 · Práctica independiente

Crea un modelo `Etiqueta` y una relación muchos-a-muchos con `Tarea`. Inserta una tarea con etiqueta en una sola operación y entrega la salida de una consulta que incluya las etiquetas. Explica qué atributo describe cada lado de la relación y qué migración produjo ese cambio.

#### Paso 7 · Cierre y conexión

Ya puedes distinguir schema, migración y cliente generado. El siguiente tema estudiará pools y transacciones en un ejemplo nuevo; no reutilizará esta base SQLite ni asumirá que una transacción elimina todas las condiciones de carrera por sí sola.

**Errores comunes:** editar la base manualmente sin migración; olvidar `prisma generate` después de cambios en Prisma 7; subir `.env` si contiene secretos; usar `migrate dev` en producción; añadir índices sin medir la consulta que los necesita.

**Fuentes oficiales:** [quickstart Prisma con SQLite](https://www.prisma.io/docs/prisma-orm/quickstart/sqlite), [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate), [`migrate dev`](https://docs.prisma.io/docs/cli/migrate/dev) y [SQLite connector](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/sqlite).

**Transferencia al proyecto integrador «API operativa de entregas»:** Modela entregas y eventos con migraciones versionadas. Aplica la migración a una base de prueba anterior y verifica que conserva guías existentes y restricciones de unicidad.

### Tema 3: Pool de conexiones y transacciones

**Conceptos clave:** reutilización de conexiones, atomicidad, `$transaction`.

Abrir una nueva conexión de red hacia PostgreSQL para cada petición HTTP individual es costoso (el proceso de establecer una conexión de base de datos, incluyendo autenticación, tiene una latencia no despreciable) y no escala: un servidor con suficiente tráfico concurrente rápidamente agotaría el número máximo de conexiones simultáneas que PostgreSQL permite, un límite configurado explícitamente en el propio servidor de base de datos por razones de estabilidad y de gestión de recursos del servidor. Un pool de conexiones mantiene un número fijo y limitado de conexiones ya establecidas y reutilizables, entregando una conexión disponible del pool a cada consulta entrante y devolviéndola al pool (en vez de cerrarla) una vez que la consulta termina, amortizando el coste de establecer conexiones entre muchas peticiones sucesivas.

Tanto el driver `pg` puro como Prisma gestionan un pool de conexiones automáticamente por debajo, sin que el desarrollador necesite implementar manualmente la lógica de gestión del pool; sin embargo, entender que existe y que tiene un límite configurable de tamaño es relevante para dimensionar correctamente una aplicación bajo carga real (un pool demasiado pequeño para el volumen de tráfico real crea un cuello de botella donde las peticiones esperan a que se libere una conexión disponible del pool).

Una transacción agrupa múltiples operaciones de base de datos en una unidad atómica: o todas las operaciones dentro de la transacción se aplican exitosamente, o ninguna se aplica en absoluto (si cualquier paso falla, todo se revierte automáticamente), previniendo estados inconsistentes de datos. El ejemplo clásico es descontar stock de un producto al crear un pedido: sin una transacción, dos peticiones concurrentes podrían ambas leer el mismo stock disponible antes de que ninguna lo actualice, resultando en que ambas descuenten stock exitosamente aunque el stock combinado descontado exceda lo realmente disponible, una condición de carrera con consecuencias reales de negocio. `prisma.$transaction(async (tx) => {...})` agrupa las operaciones internas (usando `tx` en vez de `prisma` directamente para cada operación dentro del bloque) de forma que, si cualquier paso lanza un error (por ejemplo, verificando explícitamente que el stock disponible es suficiente antes de descontarlo), toda la transacción completa se revierte automáticamente, evitando el estado inconsistente.

**Analogía:** un pool de conexiones es como una flota compartida de vehículos de una empresa: en vez de que cada empleado compre y mantenga su propio vehículo (abrir una conexión nueva cada vez), todos comparten un número fijo de vehículos disponibles, tomando uno prestado cuando lo necesitan y devolviéndolo al finalizar. Una transacción es como una operación bancaria de transferencia entre dos cuentas: o el dinero sale de una cuenta Y entra en la otra completamente, o la operación entera se cancela sin ningún cambio parcial, nunca dejando el dinero "a medio camino" entre ambas cuentas.

**¿Por qué es importante?** El pool de conexiones es indispensable para que una aplicación escale bajo tráfico real sin agotar los límites de conexión de la base de datos; las transacciones son la herramienta correcta y necesaria para prevenir condiciones de carrera al modificar datos compartidos concurrentemente.

**Código del ejemplo:**

```js
await prisma.$transaction(async (tx) => {
  const producto = await tx.producto.findUnique({ where: { id } });
  if (producto.stock < 1) throw new Error("Sin stock"); // revierte TODO si falla
  await tx.producto.update({ where: { id }, data: { stock: producto.stock - 1 } });
  await tx.pedido.create({ data: { productoId: id } });
});
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás usar un pool de PostgreSQL y ejecutar una transacción que confirme o revierta varios cambios juntos. **Prerrequisitos:** Node LTS, npm y Docker funcionando. Este ejemplo independiente comienza desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una tienda debe descontar inventario y registrar pedido como una sola decisión. Si crea el pedido y falla al descontar el stock, sus datos contradicen la realidad. El pool reutiliza conexiones; la transacción conserva consistencia de la operación completa.

#### Paso 3 · Teoría y analogía aplicada

Un pool es una pequeña flota de conexiones: se toman prestadas y se devuelven al terminar. Una transacción es una transferencia bancaria: `BEGIN` abre la operación, `COMMIT` la confirma y `ROLLBACK` deshace todo si una regla falla. Una transacción no reemplaza el diseño de concurrencia: en este caso el `UPDATE ... WHERE stock > 0` protege el descuento directamente en SQL.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto e instala el driver:

```bash
mkdir ejemplo-pool-transaccion
cd ejemplo-pool-transaccion
npm init -y
npm install pg
mkdir src sql
```

Añade `"type": "module"` a `package.json`. Crea `compose.yaml`:

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
  const cliente = await pool.connect(); // Reservamos una misma conexión para toda la transacción.

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

```bash
docker compose up -d
$env:DATABASE_URL='postgresql://academia:academia_local@127.0.0.1:5434/tienda'; node src/crear-pedido.js
```

**Resultado esperado:** se crea un pedido con `id: 1` y el producto queda con stock `0`. `cliente.release()` devuelve la conexión al pool y `pool.end()` permite cerrar el script.

**Fallo deliberado y diagnóstico:** ejecuta el script una segunda vez sin recrear la base. El `UPDATE` no devuelve filas porque el stock ya es `0`; el código ejecuta `ROLLBACK` y no crea un segundo pedido. Compruébalo con:

```bash
docker compose exec postgres psql -U academia -d tienda -c "SELECT stock FROM productos; SELECT count(*) AS pedidos FROM pedidos;"
```

La salida debe mostrar stock `0` y un único pedido. No “soluciones” el fallo aumentando stock en el código: es una regla de negocio que la base y la transacción protegen.

Al finalizar, elimina el entorno local:

```bash
docker compose down -v
```

#### Paso 5 · Práctica guiada

Intenta pedir cantidad `2` con stock inicial `1`. **Pista:** recrea el volumen, ejecuta una sola vez con cantidad 2 y verifica que no exista ningún pedido; cambia solo el argumento de `crearPedido`.

#### Paso 6 · Práctica independiente

Agrega una tabla `movimientos_inventario` e inserta un movimiento dentro de la misma transacción. Provoca un `CHECK` inválido en el movimiento y entrega la prueba de que ni stock, ni pedido, ni movimiento quedaron modificados.

#### Paso 7 · Cierre y conexión

Ya puedes elegir un pool con liberación explícita y diseñar una operación atómica. El siguiente tema comparará MongoDB y Mongoose en un ejemplo nuevo, con un modelo de documentos separado del modelo relacional.

**Errores comunes:** usar `pool.query` para cada paso de una transacción y terminar en conexiones distintas; olvidar `release`; llamar `COMMIT` después de un error; confiar solo en una lectura previa de stock; confundir pool grande con mayor rendimiento garantizado.

**Fuentes oficiales:** [node-postgres pools](https://node-postgres.com/features/pooling), [node-postgres transactions](https://node-postgres.com/features/transactions), [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html) y [`UPDATE`](https://www.postgresql.org/docs/current/sql-update.html).

**Transferencia al proyecto integrador «API operativa de entregas»:** Confirma entrega y registra evento dentro de una transacción. Provoca un fallo entre ambas escrituras y verifica rollback completo, además de liberación de la conexión al pool.

### Tema 4: MongoDB con Mongoose y otras alternativas de ORM

**Conceptos clave:** documentos frente a tablas relacionales, Schemas de Mongoose, population.

MongoDB, una base de datos orientada a documentos (en contraste con el modelo relacional de tablas de PostgreSQL), almacena datos como documentos JSON flexibles en vez de filas con un esquema rígido predefinido de columnas. Mongoose es la biblioteca predominante para trabajar con MongoDB desde Node, permitiendo definir Schemas que, a diferencia de la flexibilidad nativa de MongoDB, imponen una estructura y validación consistente sobre los documentos de una colección desde el lado de la aplicación, junto con Models (la representación de una colección específica con su Schema aplicado) que exponen métodos similares en espíritu a los de Prisma para crear, consultar y actualizar documentos.

"Population" en Mongoose resuelve el equivalente a una relación entre tablas en el mundo de documentos: cuando un documento almacena solo la referencia (id) a otro documento relacionado (en vez de anidarlo completo), `population` reemplaza automáticamente esa referencia por el documento completo correspondiente al consultar, de forma similar en espíritu al `include` de Prisma visto en el Tema 2, aunque con consideraciones de rendimiento distintas propias del modelo de documentos de MongoDB frente al modelo relacional.

Sequelize y TypeORM son alternativas de ORM para bases de datos relacionales que preceden a Prisma en adopción histórica, ambas con un enfoque más tradicional basado en clases de modelo (más cercano al patrón Active Record de otros ecosistemas) en vez del enfoque de schema declarativo centralizado y generación de cliente que caracteriza a Prisma. La elección entre estas alternativas, en la práctica actual de proyectos nuevos, favorece considerablemente a Prisma por su experiencia de desarrollo con tipos verificados y su tooling de migraciones, aunque proyectos legados existentes con Sequelize o TypeORM ya establecidos raramente justifican una migración completa solo para adoptar la alternativa más reciente.

**Analogía:** una base de datos relacional (PostgreSQL) es como un archivador con formularios idénticos y estructurados para cada categoría de información, donde cada campo tiene un lugar fijo predefinido; una base de datos de documentos (MongoDB) es como una colección de notas individuales, cada una potencialmente con una estructura ligeramente distinta, agrupadas por tema pero sin exigir uniformidad estricta entre ellas salvo que se imponga explícitamente (como hace un Schema de Mongoose).

**¿Por qué es importante?** Elegir entre un modelo relacional y uno de documentos depende de la naturaleza de los datos y las consultas de la aplicación; conocer Mongoose y las alternativas de ORM relacional amplía el panorama de herramientas disponibles más allá de Prisma para tomar esa decisión con criterio informado.

**Código del ejemplo:**

```js
const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
});
const Tarea = mongoose.model("Tarea", tareaSchema);
const tareas = await Tarea.find().populate("usuario"); // reemplaza la referencia por el documento completo
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás levantar una colección MongoDB local, validar documentos con Mongoose y decidir cuándo referenciar o anidar datos. **Prerrequisitos:** Node LTS y Docker Desktop; este ejemplo comienza en una carpeta vacía.

#### Paso 2 · Contexto y caso real

Un catálogo de paquetes puede tener atributos opcionales que cambian por tipo de envío, mientras que auditoría y pagos suelen requerir relaciones estrictas. Comparar documento flexible y tabla relacional evita elegir MongoDB solo por moda.

#### Paso 3 · Teoría y analogía aplicada

MongoDB guarda documentos agrupados en colecciones; Mongoose añade un esquema, validadores y modelos en la aplicación. `populate` resuelve referencias con otra consulta: es cómodo, pero no equivale automáticamente a un join barato. La analogía de notas flexibles solo es útil si aun así defines reglas de calidad.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el ejemplo y levanta una base local:

```bash
mkdir ejemplo-mongoose
cd ejemplo-mongoose
npm init -y
npm install mongoose
mkdir src
docker run --name mongo-academia -p 27017:27017 -d mongo:7
```

Añade `"type": "module"` y crea `src/app.js`:

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

`required` valida presencia, `trim` normaliza espacios, `lowercase` normaliza el email y `lean()` devuelve un objeto simple para lectura. Desde la raíz ejecuta:

```bash
node src/app.js
```

**Resultado esperado:** imprime el identificador generado y `email: 'ana@ejemplo.test'`.

**Fallo deliberado y diagnóstico:** cambia el email por una cadena vacía. Mongoose lanza un `ValidationError` antes de guardar; el diagnóstico es una regla de documento incumplida. Detén el contenedor al terminar con `docker rm -f mongo-academia`.

#### Paso 5 · Práctica guiada

Añade `tipo` con valores `estandar` o `fragil` mediante un `enum`. **Pista:** intenta primero un valor permitido y después `urgente`; conserva el mensaje de validación.

#### Paso 6 · Práctica independiente

Crea `Direccion` y referencia su `_id` desde `Cliente`; consulta con `.populate("direccion")`. Entrega el documento antes y después de poblarlo, y explica el coste de una consulta adicional.

#### Paso 7 · Cierre y conexión

Ya puedes crear documentos validados y razonar sobre referencias. El siguiente módulo expondrá persistencia detrás de una API, empezando también desde una carpeta nueva.

**Errores comunes:** confiar en `unique` como validador síncrono; abrir una conexión por documento; olvidar `disconnect`; usar `populate` sin medir; guardar secretos de conexión en el código.

**Fuentes oficiales:** [Mongoose schemas](https://mongoosejs.com/docs/guide.html), [validación](https://mongoosejs.com/docs/validation.html), [`populate`](https://mongoosejs.com/docs/populate.html) y [MongoDB documentos](https://www.mongodb.com/docs/manual/core/document/).

---

**Transferencia al proyecto integrador «API operativa de entregas»:** Compara el modelo documental de evidencia con sus consultas reales. Prueba una actualización concurrente y explica cómo se conserva la consistencia requerida antes de sustituir una base relacional por conveniencia.

## Laboratorio práctico

**Objetivo del laboratorio:** conectar una API Express a PostgreSQL usando Prisma, con migraciones versionadas, y demostrar la necesidad de transacciones ante una condición de carrera real.

**Requisitos previos:** Docker instalado, Módulos 0-4 completados.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Levantar PostgreSQL en Docker | `docker run -d -e POSTGRES_PASSWORD=... postgres` | Conecta con el driver `pg` puro y ejecuta `SELECT 1` |
| 2 | Instalar Prisma y definir un modelo | Ver Tema 2 | `npx prisma migrate dev` para crear la tabla |
| 3 | Usar el cliente generado desde Express | Crear, listar, actualizar tareas | Conecta con las rutas del Módulo 4 |
| 4 | Provocar una condición de carrera intencional | Dos requests simultáneas descontando el mismo stock | Sin transacción, observa el stock final incorrecto |
| 5 | Corregir con `$transaction` | Ver Tema 3 | Verifica que el stock final ahora es correcto |
| 6 | Comparar la misma consulta en tres formas | SQL crudo, driver `pg`, Prisma | Compara legibilidad y seguridad de tipos |

**Verificación:** el laboratorio se considera exitoso si la condición de carrera del paso 4 se reproduce de forma medible sin transacción, y si la corrección del paso 5 elimina completamente el estado inconsistente, verificado con múltiples ejecuciones concurrentes reales.

**Errores comunes y soluciones**

- **Concatenar directamente valores de entrada en SQL crudo.** Usa siempre consultas parametrizadas (`$1`, `$2`), nunca concatenación directa de strings de entrada del usuario.
- **Olvidar committear los archivos de migración generados por Prisma.** Las migraciones deben versionarse junto con el código para que el equipo completo reproduzca la misma estructura de base de datos.
- **Modificar datos compartidos sin transacción cuando hay concurrencia real.** Si dos operaciones pueden competir por el mismo recurso, envuélvelas en una transacción explícita.

---
