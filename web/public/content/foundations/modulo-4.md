# Módulo 4: Modelado de datos, SQL y persistencia


## Aprende construyendo

### Tema 1: Del mundo real al modelo relacional

#### Paso 1 · Objetivo y preparación
Al finalizar vas a modelar las tareas de Fundamentos como una tabla `tareas` relacionada por clave foránea con una tabla `categorias`, y vas a comprobar en SQLite si esa relación protege o no la integridad al borrar una categoría. **Prerrequisitos:** Python 3 (incluye el módulo `sqlite3`), terminal y editor. Comprueba `python3 -c "import sqlite3; print(sqlite3.sqlite_version)"`.

#### Paso 2 · Contexto y caso real
El proyecto integrador Fundamentos (el gestor de tareas por terminal) hasta ahora guarda cada tarea como una línea de texto o un JSON plano. A partir de este módulo esas tareas pasan a vivir en una base SQLite: cada tarea necesita una categoría (trabajo, personal, urgente) y esa categoría no puede quedar duplicada en cada fila sin arriesgarse a inconsistencias como "trabajo" y "Trabajo" conviviendo como si fueran cosas distintas.

#### Paso 3 · Teoría, modelo mental y analogía
Modelar relacionalmente significa decidir primero qué hechos existen como entidades independientes (una tarea, una categoría) y qué hechos son solo atributos de esas entidades (el texto de la tarea, el nombre de la categoría). Una clave primaria identifica una fila sin ambigüedad; una clave foránea declara que un valor de una tabla debe corresponder a una fila existente en otra. La cardinalidad describe cuántas filas de un lado se relacionan con cuántas del otro: una categoría tiene muchas tareas, pero cada tarea pertenece a una sola categoría (relación uno a muchos). La analogía: una categoría es como una carpeta física y cada tarea es un papel dentro de ella con el número de esa carpeta escrito en la esquina — el papel no repite el nombre completo de la carpeta, solo su número, y ese número debería corresponder siempre a una carpeta que realmente existe.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía y crea `src/schema.sql`:
```bash
mkdir -p fundamentos-sqlite/src
cd fundamentos-sqlite
```
```sql
CREATE TABLE categorias(
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);
CREATE TABLE tareas(
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id)
);
INSERT INTO categorias(nombre) VALUES ('trabajo'), ('personal');
INSERT INTO tareas(titulo, categoria_id) VALUES ('Pagar factura', 1), ('Comprar pan', 2);
DELETE FROM categorias WHERE nombre='trabajo';
SELECT * FROM tareas;
```

**Ejecuta el ejemplo** (carga el schema en una base SQLite real y observa el resultado):

```bash
sqlite3 tareas.db < src/schema.sql
```
**Resultado esperado:** la fila de "Pagar factura" sigue existiendo con `categoria_id=1`, aunque esa categoría ya no está en `categorias` — quedó huérfana. **Fallo deliberado:** a diferencia de PostgreSQL, SQLite NO activa las claves foráneas por defecto; aunque declaraste `REFERENCES categorias(id)`, el `DELETE` anterior se ejecutó sin ningún error. Repetí el experimento agregando `PRAGMA foreign_keys = ON;` como primera línea del script, antes del `DELETE`: ahora SQLite lo rechaza con `FOREIGN KEY constraint failed`, porque todavía existe una tarea que referencia esa categoría.

#### Paso 5 · Práctica guiada
Pista: volvé a crear la tabla `tareas` pero con `categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE`, activá `PRAGMA foreign_keys = ON;` y borrá la misma categoría. Resultado esperado: la tarea desaparece junto con la categoría, en vez de bloquear el `DELETE` o quedar huérfana; anotá los tres comportamientos (sin `PRAGMA`, con `PRAGMA` sin `CASCADE`, con `PRAGMA` y `CASCADE`) en una línea cada uno.

#### Paso 6 · Práctica independiente
Agregá una tabla `etiquetas` relacionada con `tareas` mediante una tabla intermedia `tarea_etiqueta` (relación muchos a muchos), dibujá el diagrama entidad-relación completo de categorías/tareas/etiquetas, y documentá qué pasa si borrás una etiqueta que todavía tiene tareas asociadas.

#### Paso 7 · Cierre y evidencia
Entregá el esquema `categorias`/`tareas`, los tres comportamientos del Paso 5 (sin `PRAGMA`, con `PRAGMA`, con `CASCADE`) y el diseño de `etiquetas` del Paso 6. Como siguiente paso, en el Tema 2 vas a escribir las consultas SQL (`INSERT`, `SELECT`, `JOIN`) sobre este mismo esquema. Errores comunes: asumir que declarar `REFERENCES` ya protege la integridad sin activar `PRAGMA foreign_keys`; confundir una relación uno-a-muchos con una muchos-a-muchos. Fuentes oficiales: https://www.sqlite.org/foreignkeys.html y https://www.sqlite.org/lang_createtable.html.
**¿Por qué es importante?** Porque una clave foránea declarada pero no verificada da una falsa sensación de seguridad: el esquema "se ve" correcto, pero la base permite exactamente lo que la relación debería impedir.
**Evidencia de aprendizaje:** entregá el esquema `categorias`/`tareas`, la fila huérfana sin `PRAGMA`, el rechazo con `PRAGMA` y el `CASCADE` del Paso 5.
**Escenario:** Tu base de RutaFlow crece a 50 000 entregas activas. Un conductor deja la empresa y alguien ejecuta `DELETE FROM conductor WHERE id=123`. El sistema debe decidir: ¿eliminar automáticamente sus entregas asignadas o rechazar la eliminación?

**Tu tarea:**
1. Diseña dos esquemas: uno con `FOREIGN KEY...CASCADE` y otro con `NO ACTION`.
2. Explica el impacto de cada decisión en auditoría, recuperación y reglas de negocio.
3. ¿Qué garantías ofrece `NO ACTION` que `CASCADE` no da?
4. Propón cuándo es seguro `CASCADE` (pista: diferencia entre datos técnicos y datos de negocio).

[SOLUCIÓN PLEGADA]
> `CASCADE` es para relaciones puramente técnicas (órdenes → líneas de orden: la línea no existe sin orden). `NO ACTION` para datos de negocio (conductor → entregas: la entrega sigue existiendo como hecho histórico, solo el propietario cambia). Auditoría exige registro explícito del cambio, no eliminación silenciosa.

**Conceptos clave:** entidad, atributo, fila, tabla, clave primaria, clave foránea, relación, cardinalidad, restricción y normalización.

Persistir no significa “guardar un objeto como sea”. Primero se modela qué hechos existen y qué reglas deben permanecer verdaderas. En un inventario hay productos, categorías y movimientos. Un producto tiene SKU único; un movimiento pertenece a un producto y registra cantidad, tipo y fecha.

```sql
CREATE TABLE categorias (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE productos (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria_id INTEGER,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

`PRIMARY KEY` identifica una fila. `UNIQUE` impide SKU repetido. `NOT NULL` exige dato. `CHECK` expresa una regla cerca del dato. La clave foránea declara que una categoría referenciada debe existir. Estas restricciones no reemplazan mensajes amigables en la aplicación; protegen la base incluso si otro proceso escribe.

Guardar el nombre de categoría repetido en cada producto produce inconsistencias: “Periféricos” y “perifericos” podrían representar lo mismo. Separar la entidad y referenciarla reduce repetición. Normalizar no significa fragmentar todo: busca representar cada hecho en un lugar coherente, evaluando después necesidades de lectura.

El diagrama entidad-relación se diseña antes del `CREATE TABLE`. Anota cardinalidad: una categoría tiene muchos productos; un producto puede tener muchos movimientos. Decide si una relación es obligatoria y qué debe ocurrir al eliminar.

**Diagrama interactivo:** [Esquema entidad-relación del gestor: tablas, claves y cardinalidad](/visuals/temas/foundations/modulo-4-tema-1-erd.html) — modelo explorable con temas claro/oscuro, cada columna física con su tipo y las claves foráneas resaltadas.

**Analogía:** una clave primaria es el número de documento; una foránea es escribir ese número en otro expediente para enlazarlo sin copiar a la persona completa.

**¿Por qué es importante?** Un mal modelo obliga a corregir datos duplicados y reglas contradictorias. La integridad declarativa convierte requisitos en garantías verificables.

**Casos de uso reales:** pedidos/clientes, cursos/estudiantes, cuentas/movimientos, productos/categorías y usuarios/roles.

**Diagrama:**

```mermaid
erDiagram
    CATEGORIA ||--o{ PRODUCTO : clasifica
    PRODUCTO ||--o{ MOVIMIENTO : registra
    CATEGORIA { int id PK }
    PRODUCTO { int id PK int categoria_id FK string sku UK }
    MOVIMIENTO { int id PK int producto_id FK }
```


#### Profundización · Diseño: normalizar una tabla de tareas con categoría repetida

**Escenario real:** Alguien implementó la tabla de tareas sin separar la categoría en su propia tabla:
```sql
CREATE TABLE tareas_mal_disenadas(
  id INTEGER PRIMARY KEY,
  titulo TEXT,
  categoria_nombre TEXT,
  categoria_color TEXT
);
```
Con 500 tareas de la categoría "trabajo", cambiar el color asignado a esa categoría implica actualizar 500 filas.

**Tu tarea (sin mirar solución):**
1. Identificá qué datos se repiten innecesariamente en `tareas_mal_disenadas`.
2. Diseñá las dos tablas normalizadas (`categorias` y `tareas`) que eliminan esa repetición.
3. Escribí el `UPDATE` que, en el diseño malo, tendría que tocar las 500 filas para cambiar el color; compará con el `UPDATE` equivalente en el diseño normalizado.
4. ¿Qué pasa si una fila de `tareas_mal_disenadas` guarda "trabajo" y otra "Trabajo "? ¿El modelo normalizado evita ese tipo de inconsistencia?

**Escribe tu respuesta:**
```
Datos repetidos en el diseño malo: _________
Tablas normalizadas: categorias(_________), tareas(_________)
UPDATE en diseño malo: afecta _________ filas
UPDATE en diseño normalizado: afecta _________ fila(s)
¿El modelo normalizado evita nombres inconsistentes? _________ (¿por qué?)
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Datos repetidos:** `categoria_nombre` y `categoria_color` se repiten en cada tarea de la misma categoría.
>
> **Normalizado:** `categorias(id, nombre, color)` y `tareas(id, titulo, categoria_id REFERENCES categorias(id))`.
>
> **UPDATE diseño malo:** `UPDATE tareas_mal_disenadas SET categoria_color='azul' WHERE categoria_nombre='trabajo'` afecta las 500 filas.
>
> **UPDATE normalizado:** `UPDATE categorias SET color='azul' WHERE nombre='trabajo'` afecta 1 fila; las 500 tareas heredan el cambio a través de la relación, sin tocarlas.
>
> **Nombres inconsistentes:** En parte. `UNIQUE` en `categorias.nombre` impide dos filas idénticas "trabajo", pero "trabajo" y "Trabajo " (con mayúscula o espacio) siguen siendo valores distintos para SQLite — normalizar la tabla evita la duplicación masiva, no sustituye la validación del texto de entrada.

</details>
### Tema 2: SQL para definir, escribir, consultar y relacionar

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir las sentencias SQL (`CREATE TABLE`, `INSERT`, `SELECT` con `JOIN`) sobre el esquema `tareas`/`categorias` del Tema 1, y vas a provocar y corregir una inyección SQL real construyendo una consulta con texto concatenado en vez de parámetros. **Prerrequisitos:** Tema 1 de este módulo; Python 3 con `sqlite3` (viene incluido en la librería estándar).

#### Paso 2 · Contexto y caso real
El proyecto integrador Fundamentos necesita un comando `tarea listar --categoria trabajo` que filtre las tareas por el nombre de categoría escrito por quien usa el CLI. Si ese filtro se arma concatenando el texto ingresado directamente dentro del SQL, cualquiera puede escribir algo como `trabajo' OR '1'='1` y ver tareas de todas las categorías, no solo la suya.

#### Paso 3 · Teoría, modelo mental y analogía
SQL se divide en DDL (`CREATE`, `ALTER`, `DROP`: define estructura) y DML (`INSERT`, `SELECT`, `UPDATE`, `DELETE`: opera sobre datos). Es un lenguaje declarativo: describís qué filas querés, no el algoritmo para encontrarlas — el motor decide cómo recorrer las tablas. Un `JOIN` combina filas de dos tablas según una condición de igualdad entre claves; sin esa condición, el resultado mezclaría cada fila de una tabla con cada fila de la otra. La analogía: pedís un reporte a alguien que conoce el archivo completo ("dame las tareas de la categoría trabajo, ordenadas por título") en vez de explicarle paso a paso cómo revisar cada carpeta — describís el qué, el motor decide el cómo.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía y crea `src/consultas.py`:
```bash
mkdir -p fundamentos-sql/src
cd fundamentos-sql
```
```python
import sqlite3

# Base nueva en memoria por ejecución: permite repetir y corregir sin borrar archivos.

conexion = sqlite3.connect(":memory:")
conexion.execute("CREATE TABLE categorias(id INTEGER PRIMARY KEY, nombre TEXT NOT NULL UNIQUE)")
conexion.execute("CREATE TABLE tareas(id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, categoria_id INTEGER NOT NULL REFERENCES categorias(id))")
conexion.execute("INSERT INTO categorias(nombre) VALUES ('trabajo'), ('personal')")
conexion.execute("INSERT INTO tareas(titulo, categoria_id) VALUES ('Pagar factura', 1), ('Comprar pan', 2)")
conexion.commit()

def listar_por_categoria_insegura(nombre_categoria):
    consulta = "SELECT t.titulo FROM tareas t JOIN categorias c ON c.id = t.categoria_id WHERE c.nombre = '" + nombre_categoria + "'"
    return conexion.execute(consulta).fetchall()

print(listar_por_categoria_insegura("trabajo"))
print(listar_por_categoria_insegura("trabajo' OR '1'='1"))
```
```bash
python3 src/consultas.py
```
**Salida esperada:** `listar_por_categoria_insegura("trabajo")` devuelve solo `[('Pagar factura',)]`. **Fallo deliberado:** la segunda llamada, con `"trabajo' OR '1'='1"`, devuelve TODAS las tareas (`[('Pagar factura',), ('Comprar pan',)]`) de cualquier categoría, porque el texto concatenado convirtió el `WHERE` en `c.nombre = 'trabajo' OR '1'='1'`, verdadero para cada fila. Corregilo reemplazando el cuerpo de la función por `conexion.execute("SELECT t.titulo FROM tareas t JOIN categorias c ON c.id = t.categoria_id WHERE c.nombre = ?", (nombre_categoria,)).fetchall()`: con el mismo texto malicioso como argumento, ahora devuelve una lista vacía porque SQLite lo trata como un valor literal, no como código SQL.

#### Paso 5 · Práctica guiada
Pista: escribí una función equivalente que busque por `titulo` con `LIKE` (por ejemplo, tareas que contengan "factura"), primero concatenando texto y después parametrizada con `?`. Probá qué pasa si alguien busca `%' OR '1'='1' --` en la versión insegura, y confirmá que la versión parametrizada trata ese mismo texto como literal.

#### Paso 6 · Práctica independiente
Escribí un `UPDATE` parametrizado que cambie el `titulo` de una tarea por `id`, un `DELETE` parametrizado que borre las tareas de una categoría dada, y una consulta con `GROUP BY categoria_id` que cuente, usando `JOIN`, cuántas tareas tiene cada categoría.

#### Paso 7 · Cierre y evidencia
Entregá las dos versiones (insegura y parametrizada) del Paso 4, la variante con `LIKE` del Paso 5, y el `UPDATE`/`DELETE`/`GROUP BY` del Paso 6. Como siguiente paso, en el Tema 3 vas a crear un índice sobre esta misma tabla `tareas` y vas a medir con `EXPLAIN QUERY PLAN` si realmente acelera las consultas. Errores comunes: concatenar entrada de usuario en SQL aunque la base sea local; asumir que un `JOIN` siempre encuentra una fila coincidente del otro lado. Fuentes oficiales: https://www.sqlite.org/lang.html y https://docs.python.org/es/3/library/sqlite3.html.
**¿Por qué es importante?** Porque cualquier entrada que llega desde afuera (un argumento de CLI, un formulario) puede contener texto diseñado para alterar tu consulta; parametrizar no es un detalle de estilo, es lo que separa código de dato.
**Evidencia de aprendizaje:** entregá la inyección reproducida con texto concatenado, la misma entrada neutralizada con parámetros, y las consultas `UPDATE`/`DELETE`/`GROUP BY` del Paso 6.

**Cuándo NO usar:** No uses `LEFT JOIN` si ambas tablas son obligatorias por requisito de negocio. No indexas todas las columnas; indexa solo las que filtras frecuentemente. No escribas SQL concatenado aunque sea una herramienta local: es inseguro y difícil de mantener.

#### Profundización · Diseño: Consulta óptima para reporte de entregas por estado

**Escenario real:** El CLI Fundamentos genera un reporte: "todas las entregas completadas en las últimas 24 horas". Escribes una consulta con `LEFT JOIN` pero descubres que demora 8 segundos en 100k registros.

**Tu tarea (sin mirar solución):**

1. **Columnas a indexar:** ¿Qué columna indexarías primero: `guia`, `estado` o `created_at`?
2. **Complejidad:** Diseña una consulta que filtre solo entregas 'ENTREGADA'. Sin índice, ¿complejidad O(?)? Con índice en `estado`, ¿cómo mejora?
3. **Idempotencia:** ¿Qué sucede si ejecutas `SELECT * FROM entrega WHERE created_at > DATE('now','-1 day')`? ¿Es la consulta idempotente (mismo resultado cada vez)?
4. **Verificación:** Propón una versión con `EXPLAIN QUERY PLAN` que verifique si usa índice.

**Escribe tu respuesta:**
```
Índice a crear: _________ (¿Por qué esa columna primero?)
Complejidad sin índice: O(_)
Complejidad con índice (estado): O(_)
¿Es idempotente? _________ (¿Por qué?)
EXPLAIN QUERY PLAN output debe mostrar: _________
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Respuesta esperada:**
>
> **Índice:** `(estado, created_at)` compuesto. Filtra por estado (más selectivo) luego por fecha.
>
> **Complejidad:** Sin índice O(n), con índice O(log n + k) donde k es resultado.
>
> **Idempotencia:** No exactamente. `DATE('now','-1 day')` cambia cada día. Mejor: usar timestamp fijo o rango: `created_at BETWEEN '2026-10-05' AND '2026-10-06'`.
>
> **EXPLAIN:** Debe mostrar `SEARCH entrega USING INDEX idx_estado_fecha` en lugar de `SCAN TABLE entrega`.

</details>

**Conceptos clave:** DDL, DML, SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY, GROUP BY, agregación, JOIN y parámetro.

SQL es declarativo: expresas el resultado, no el recorrido exacto. DDL define estructura; DML consulta y modifica datos.

```sql
INSERT INTO categorias(nombre) VALUES ('Periféricos');

INSERT INTO productos(sku, nombre, stock, categoria_id)
VALUES ('A-10', 'Teclado', 4, 1);

SELECT p.sku, p.nombre, p.stock, c.nombre AS categoria
FROM productos AS p
LEFT JOIN categorias AS c ON c.id = p.categoria_id
WHERE p.stock < 5
ORDER BY p.stock ASC;
```

Lee la consulta en capas: `FROM` establece filas; `JOIN` combina por relación; `WHERE` filtra; `SELECT` elige columnas; `ORDER BY` ordena. `LEFT JOIN` conserva productos sin categoría; `INNER JOIN` los excluiría. La elección expresa una regla de negocio.

Agregaciones resumen:

```sql
SELECT c.nombre, COUNT(p.id) AS productos, SUM(p.stock) AS unidades
FROM categorias c
LEFT JOIN productos p ON p.categoria_id = c.id
GROUP BY c.id, c.nombre
ORDER BY unidades DESC;
```

Nunca construyas SQL concatenando entrada:

```python
# Incorrecto: permite alterar la consulta
cursor.execute("SELECT * FROM productos WHERE sku = '" + sku + "'")

# Correcto: el driver separa código y dato
cursor.execute("SELECT * FROM productos WHERE sku = ?", (sku,))
```

La parametrización previene inyección y maneja escaping/tipos. No es opcional aunque la herramienta sea local.

**Analogía:** SQL se parece a pedir un reporte indicando columnas, fuentes y condiciones; el motor decide cómo recorrer archivadores.

**¿Por qué es importante?** ORMs terminan generando SQL. Comprenderlo permite detectar N+1, filtros incorrectos, pérdida de filas y vulnerabilidades.

**Casos de uso reales:** reportes, paneles, búsquedas, conciliaciones y APIs CRUD.

**Diagrama:**

```mermaid
flowchart LR
    FROM["FROM / JOIN"] --> WHERE["WHERE"] --> GROUP["GROUP BY"]
    GROUP --> HAVING["HAVING"] --> SELECT["SELECT"] --> ORDER["ORDER BY"] --> LIMIT["LIMIT"]
```

### Tema 3: Índices, restricciones y planes de consulta

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear un índice sobre la tabla `tareas` y vas a comparar, con `EXPLAIN QUERY PLAN`, el plan de consulta antes y después de crearlo — confirmando en tu propia terminal la diferencia entre un `SCAN` (recorre toda la tabla) y un `SEARCH` (usa el índice). **Prerrequisitos:** Temas 1 y 2 de este módulo; `sqlite3` disponible como CLI o desde Python.

#### Paso 2 · Contexto y caso real
El comando `tarea listar --estado pendiente` del proyecto integrador Fundamentos filtra por estado cada vez que se ejecuta. Con 10 tareas no importa cómo lo resuelva SQLite, pero el mismo filtro sobre 200 000 tareas acumuladas durante meses obliga al motor a revisar fila por fila si no existe ninguna estructura que le diga dónde buscar directamente.

#### Paso 3 · Teoría, modelo mental y analogía
Un índice es una estructura auxiliar ordenada que SQLite mantiene junto a la tabla para localizar filas por el valor de una columna sin recorrerlas todas. `EXPLAIN QUERY PLAN` muestra, sin ejecutar realmente la consulta sobre los datos, qué estrategia usaría el motor: `SCAN TABLE` significa "voy a revisar cada fila una por una"; `SEARCH TABLE ... USING INDEX` significa "voy directo a las filas que coinciden". Un índice no es gratis: ocupa espacio en disco y SQLite debe actualizarlo en cada `INSERT`/`UPDATE`/`DELETE` sobre esa columna, no solo en cada lectura. La analogía: buscar un apellido en una guía telefónica ordenada alfabéticamente (índice) es muy distinto de buscarlo en una pila de fichas sueltas sin orden (`SCAN`) — pero si alguien agrega una ficha nueva, mantener la guía ordenada cuesta más trabajo que agregar la ficha al final de la pila.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/indice.sql` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

Parte de la base `tareas.db` del Tema 1 y crea `src/indice.sql`:
```bash
cd fundamentos-sqlite
```
```sql
ALTER TABLE tareas ADD COLUMN estado TEXT NOT NULL DEFAULT 'pendiente';
UPDATE tareas SET estado='completada' WHERE id=1;

EXPLAIN QUERY PLAN SELECT titulo FROM tareas WHERE estado='pendiente';

CREATE INDEX idx_tareas_estado ON tareas(estado);

EXPLAIN QUERY PLAN SELECT titulo FROM tareas WHERE estado='pendiente';
```
```bash
sqlite3 tareas.db < src/indice.sql
```
**Resultado esperado:** el primer `EXPLAIN QUERY PLAN` muestra `SCAN tareas`; el segundo, después de crear el índice, muestra `SEARCH tareas USING INDEX idx_tareas_estado (estado=?)`. **Fallo deliberado:** ejecutá de nuevo `CREATE INDEX idx_tareas_estado ON tareas(estado);` sin borrar el anterior; SQLite responde `index idx_tareas_estado already exists` y la migración se detiene ahí. Corregilo con `CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);`, que no falla si el índice ya fue creado por una ejecución anterior de la misma migración.

#### Paso 5 · Práctica guiada
Pista: repetí el experimento filtrando por dos columnas (`WHERE estado='pendiente' AND categoria_id=1`): con el índice simple en `estado`, mirá en el `EXPLAIN QUERY PLAN` si SQLite igual necesita revisar filas de más; después creá un índice compuesto `CREATE INDEX idx_tareas_estado_categoria ON tareas(estado, categoria_id);` y compará el plan otra vez.

#### Paso 6 · Práctica independiente
Generá 5 000 tareas de prueba con un bucle en Python, medí el tiempo de la consulta por `estado` antes y después del índice con el módulo `time`, y documentá si la diferencia es perceptible con ese volumen o si recién se nota con más datos.

#### Paso 7 · Cierre y evidencia
Entregá los dos `EXPLAIN QUERY PLAN` (antes/después del índice) del Paso 4, el índice compuesto del Paso 5, y la medición de tiempo del Paso 6. Como siguiente paso, en el Tema 4 vas a envolver varias operaciones sobre estas mismas tablas dentro de una transacción para que un fallo a mitad de camino no deje la base a medio actualizar. Errores comunes: crear un índice por columna sin medir si realmente se usa; crear el mismo índice dos veces en una migración sin `IF NOT EXISTS`; medir con pocos datos y concluir que el índice "no sirve". Fuentes oficiales: https://www.sqlite.org/eqp.html y https://www.sqlite.org/lang_createindex.html.
**¿Por qué es importante?** Porque un índice mal elegido (o la ausencia de uno) es la causa más común de que una consulta que funcionaba bien con pocos datos se vuelva inutilizable cuando el proyecto crece — y `EXPLAIN QUERY PLAN` es la única forma de confirmarlo en vez de adivinarlo.
**Evidencia de aprendizaje:** entregá los dos planes de consulta, el índice compuesto y la medición con datos generados.

**Cuándo NO usar:** No crees índice en una columna con solo 2 valores (booleano). No indexas todas las columnas; solo las que filtran frecuentemente. No indexas una columna que rara vez se consulta porque ralentiza INSERT.

#### Profundización · Diseño: Plan de consulta cuando el índice no acelera

**Escenario real:** Fundamentos guarda 500k tareas. Escribes `SELECT * FROM tarea WHERE urgente=1 AND prioridad>5`. Sin índice: 2 segundos. Creas índice en `urgente` pero sigue demorando 2 segundos.

**Tu tarea (sin mirar solución):**

1. **Selectividad:** ¿Por qué `CREATE INDEX idx_urgente ON tarea(urgente)` no acelera si el predicado es `urgente=1 AND prioridad>5`?
2. **Índice compuesto:** Diseña un índice que acelere ambas condiciones. ¿Importa el orden de columnas?
3. **Verificación:** Ejecuta `EXPLAIN QUERY PLAN` antes y después. ¿Cómo cambia el plan?
4. **Trade-off:** ¿Cuándo un índice hace más lento un INSERT? ¿A partir de cuántos índices?

**Escribe tu respuesta:**

```
Selectividad de urgente=1: _________ (¿qué % de tareas?)
Índice compuesto propuesto: _________ (columnas y orden)
¿Importa el orden? _________ (¿Por qué?)
EXPLAIN antes: _________
EXPLAIN después: _________
Número de índices que ralentiza INSERT: _________
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Respuesta esperada:**
>
> **Selectividad:** Indexar solo `urgente` filtra ~50% de filas. Luego debe recorrer todas para verificar `prioridad>5` (O(n)).
>
> **Índice compuesto:** `(urgente, prioridad)`. Sí, el orden importa: primero columna más selectiva o que usas en igualdad.
>
> **Plan:** Antes: `SCAN TABLE tarea`. Después: `SEARCH tarea USING INDEX idx_urgente_prioridad`.
>
> **Trade-off:** Cada índice ralentiza INSERT/UPDATE. 2-3 índices = negligible; 10+ = significante. Balance con frecuencia de consulta.

</details>

**Conceptos clave:** índice, escaneo, búsqueda, selectividad, índice compuesto, plan de consulta, coste de escritura y constraint.

Un índice mantiene una estructura auxiliar ordenada para localizar filas sin recorrer toda la tabla. No es gratuito: ocupa espacio y debe actualizarse en cada escritura.

```sql
CREATE INDEX idx_productos_categoria_stock
ON productos(categoria_id, stock);

EXPLAIN QUERY PLAN
SELECT * FROM productos
WHERE categoria_id = 2 AND stock < 5;
```

Un índice compuesto sigue el orden de columnas. Puede ayudar a consultas que filtran por `categoria_id` y luego `stock`; no necesariamente a una consulta solo por `stock`. La selectividad importa: indexar un booleano con dos valores quizá no reduzca suficiente trabajo.

Genera miles de filas, consulta antes y después del índice y observa `EXPLAIN QUERY PLAN`. No midas únicamente milisegundos: un conjunto pequeño puede caber en memoria y ocultar diferencia. Busca evidencia de `SCAN` frente a `SEARCH`, repite y registra entorno.

Las restricciones también afectan diseño: `UNIQUE` suele respaldarse con índice; claves foráneas requieren habilitación en SQLite mediante `PRAGMA foreign_keys = ON`. Comprueba que una inserción inválida falla; no asumas que la declaración se aplica sin verificar configuración.

Demasiados índices ralentizan `INSERT/UPDATE/DELETE`. Define consultas críticas primero, mide y elimina índices redundantes. Un índice no corrige seleccionar todas las columnas, paginación ilimitada o un modelo incoherente.

**Analogía:** un índice de libro acelera encontrar un tema, pero ocupa páginas y debe actualizarse si cambia el contenido. Crear un índice para cada palabra haría costosa la edición.

**¿Por qué es importante?** Rendimiento de datos depende más de modelo, consultas e índices que de microoptimizar código de aplicación.

**Casos de uso reales:** búsqueda por email, pedidos por cliente/fecha, logs por servicio/tiempo y catálogo por categoría/precio.

**Diagrama:**

```mermaid
flowchart LR
    subgraph SCAN["Sin índice"]
      S1["fila 1"] --> S2["fila 2"] --> SN["fila N"]
    end
    subgraph SEARCH["Con índice"]
      ROOT["raíz"] --> BRANCH["rama"] --> RANGE["rango de filas"]
    end
```

### Tema 4: Transacciones, concurrencia y elección SQL/NoSQL

#### Paso 1 · Objetivo y preparación
Al finalizar vas a envolver dos actualizaciones relacionadas (marcar una tarea como completada y registrar ese cambio en un historial) dentro de una transacción, y vas a comprobar que un fallo simulado a mitad de camino deja la base exactamente como estaba antes — ni a medias, ni corrupta. **Prerrequisitos:** Temas 1 a 3 de este módulo.

#### Paso 2 · Contexto y caso real
El proyecto integrador Fundamentos necesita que marcar una tarea como completada también deje un registro en una tabla `historial` (qué tarea, qué acción). Son dos sentencias SQL separadas: si la segunda falla justo después de que la primera ya se ejecutó —por ejemplo porque el disco se llenó o el proceso se interrumpió—, la tarea queda marcada como completada pero sin ningún rastro en el historial, un estado que ninguna de las dos operaciones por sí sola produciría.

#### Paso 3 · Teoría, modelo mental y analogía
Una transacción agrupa varias sentencias SQL como si fueran una sola unidad indivisible: o se aplican todas (`COMMIT`), o no se aplica ninguna (`ROLLBACK`). Esa garantía se resume en ACID: atomicidad (todo o nada), consistencia (las reglas declaradas — `CHECK`, `UNIQUE`, claves foráneas — se siguen cumpliendo), aislamiento (una transacción no ve resultados a medio terminar de otra) y durabilidad (lo confirmado con `COMMIT` sobrevive incluso a un corte de luz). Elegir SQL o NoSQL no es una cuestión de moda: depende de si tus datos necesitan esas garantías fuertes entre entidades relacionadas (pagos, reservas, un historial de cambios) o si cada registro es independiente y puede vivir sin relaciones estrictas (una sesión de caché, un documento con forma variable). La analogía: una transacción es una transferencia bancaria firmada ante un notario — o se completan todos los pasos del contrato, o el notario rompe el papel entero; no existe un mundo donde el dinero salió de una cuenta pero el contrato quedó "a medias".

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/transaccion.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

Parte de la base `tareas.db` de los Temas anteriores y crea `src/transaccion.py`:
```bash
cd fundamentos-sqlite
```
```python
import sqlite3

conexion = sqlite3.connect("tareas.db")
conexion.execute("CREATE TABLE historial(id INTEGER PRIMARY KEY, tarea_id INTEGER NOT NULL, accion TEXT NOT NULL)")
conexion.commit()

def completar_con_transaccion(tarea_id, simular_fallo=False):
    try:
        conexion.execute("BEGIN")
        conexion.execute("UPDATE tareas SET estado='completada' WHERE id=?", (tarea_id,))
        if simular_fallo:
            raise RuntimeError("fallo simulado: el disco se llenó")
        conexion.execute("INSERT INTO historial(tarea_id, accion) VALUES (?, 'completada')", (tarea_id,))
        conexion.commit()
    except Exception as error:
        conexion.rollback()
        print("Revertido:", error)

completar_con_transaccion(2, simular_fallo=True)
print(conexion.execute("SELECT id, estado FROM tareas WHERE id=2").fetchone())
print(conexion.execute("SELECT * FROM historial WHERE tarea_id=2").fetchall())
```
```bash
python3 src/transaccion.py
```
**Resultado esperado:** después del `ROLLBACK`, la tarea 2 sigue con su estado original (no quedó "completada") y `historial` no tiene ninguna fila para esa tarea — el `UPDATE` que sí llegó a ejecutarse se revirtió por completo. **Fallo deliberado:** quitá el `BEGIN`/`try`/`rollback` y ejecutá las mismas dos sentencias sueltas, cada una con su propio `commit()` inmediato, con la excepción simulada entre medio: ahora la tarea 2 QUEDA marcada como "completada" (ese `UPDATE` ya se confirmó solo) pero `historial` sigue vacío para esa tarea — una inconsistencia que ningún `ROLLBACK` puede deshacer porque nunca hubo una transacción que agrupara ambos cambios.

#### Paso 5 · Práctica guiada
Pista: repetí `completar_con_transaccion` con `simular_fallo=False` para confirmar el camino feliz: la tarea queda completada Y aparece en `historial` en el mismo `COMMIT`. Después agregá una tercera operación dentro de la misma transacción (por ejemplo, decrementar un contador de "tareas pendientes" en otra tabla) y confirmá que un fallo en esa tercera operación también revierte las dos anteriores.

#### Paso 6 · Práctica independiente
Documentá una comparación de una línea cada caso: qué pasaría con este mismo escenario (completar tarea + historial) en una base de documentos sin transacciones multi-documento, y en qué casos esa falta de garantías sería aceptable para Fundamentos y en cuáles no.

#### Paso 7 · Cierre y evidencia
Entregá el camino feliz y el `ROLLBACK` del Paso 4, la transacción de tres pasos del Paso 5, y la comparación SQL/NoSQL del Paso 6. Con esto cerrás el Módulo 4; como siguiente paso, en el Módulo 5 (Testing, depuración, Git y CI) vas a escribir tests automatizados y usar Git/CI para que estos mismos cambios de esquema y consultas queden verificados antes de integrarse. Errores comunes: olvidar `BEGIN` y asumir que dos `execute()` consecutivos ya son atómicos; dejar transacciones abiertas por mucho tiempo bloqueando otras escrituras; elegir NoSQL únicamente para evitar diseñar un esquema. Fuentes oficiales: https://www.sqlite.org/lang_transaction.html y https://www.sqlite.org/atomiccommit.html.
**¿Por qué es importante?** Porque un fallo a mitad de camino no es un caso raro de laboratorio: un proceso puede interrumpirse por cualquier motivo, y sin transacción la base queda en un estado que ninguna de tus validaciones anticipó.
**Evidencia de aprendizaje:** entregá el camino feliz, el `ROLLBACK` reproducido, la transacción de tres pasos y la comparación SQL/NoSQL.

**Cuándo NO usar:** No uses NoSQL para datos relacionales complejos sin reinventar restricciones. No mantengas transacciones largas (> 1s); fragmenta en operaciones más pequeñas. No assumes `READ COMMITTED` es suficiente para operaciones críticas sin entender race conditions.

#### Profundización · Diseño: Transacción vs no-transacción en Fundamentos

**Escenario real:** Fundamentos guarda una tarea nueva: escribe `INSERT INTO tarea(id, titulo)` y luego `INSERT INTO etiqueta(tarea_id, tag)`. La conexión de red falla entre ambas operaciones.

**Tu tarea (sin mirar solución):**

1. **Sin transacción:** ¿Cuál es el estado de la BD? (Tarea existe pero sin etiqueta).
2. **Consistencia:** ¿Cómo lo llamas? ¿Cada entidad por separado es válida pero el par está inconsistente?
3. **Con transacción:** Escribe `BEGIN; ... COMMIT;` que agrupe ambas inserciones.
4. **Recuperación:** ¿Qué significa `ROLLBACK`? ¿Cuándo y cómo lo ejecutarías?

**Escribe tu respuesta:**

```
Sin transacción: tarea se crea _________ (¿sí/no?), etiqueta se crea _________ 
Estado inconsistente: _________ (nombre del problema)
Transacción: BEGIN; _________ ; COMMIT;
Si error entre INSERT: ejecutas _________ y el resultado es _________
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Respuesta esperada:**
>
> **Sin transacción:** Sí se crea tarea, no se crea etiqueta. Estado: inconsistencia; tarea huérfana.
>
> **Nombre:** Anomalía de durabilidad o inconsistencia parcial.
>
> **Transacción:** 
> ```sql
> BEGIN;
> INSERT INTO tarea(id, titulo) VALUES (?, ?);
> INSERT INTO etiqueta(tarea_id, tag) VALUES (?, ?);
> COMMIT;
> ```
>
> **Si error:** `ROLLBACK` y ninguna operación persiste. Tarea y etiqueta quedan inexistentes (atomicidad).

</details>

**Conceptos clave:** transacción, ACID, atomicidad, consistencia, aislamiento, durabilidad, commit, rollback, concurrencia, documento y patrón de acceso.

Una transacción agrupa operaciones como unidad. Transferir stock entre ubicaciones requiere restar y sumar; si solo ocurre una, el sistema queda inconsistente.

```python
import sqlite3

def mover_stock(conexion, origen, destino, cantidad):
    try:
        conexion.execute("BEGIN")
        conexion.execute(
            "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?",
            (cantidad, origen, cantidad),
        )
        if conexion.total_changes == 0:
            raise ValueError("Stock insuficiente")
        conexion.execute(
            "UPDATE productos SET stock = stock + ? WHERE id = ?",
            (cantidad, destino),
        )
        conexion.commit()
    except Exception:
        conexion.rollback()
        raise
```

Atomicidad significa todo o nada. Consistencia conserva reglas. Aislamiento controla interferencia entre transacciones concurrentes. Durabilidad conserva un commit confirmado. Los niveles y detalles varían por motor; “ACID” no elimina la necesidad de conocer bloqueos y concurrencia.

NoSQL agrupa varias familias: documentos, clave-valor, columnas y grafos. Elegir NoSQL no significa “sin esquema”; el esquema se desplaza a aplicación/validación. Decide por patrones de acceso, volumen, relaciones, consistencia, latencia y operación. Un catálogo con documentos variables puede encajar en documentos; transferencias financieras relacionales exigen garantías fuertes; sesiones efímeras pueden usar clave-valor; relaciones profundas pueden justificar grafo.

Evita la falsa oposición. Sistemas reales combinan una fuente relacional con caché, búsqueda o eventos. Cada duplicación requiere estrategia de sincronización.

**Analogía:** una transacción es una mudanza registrada: no se acepta que el objeto salga del origen sin entrar al destino. SQL/NoSQL son tipos de archivo elegidos por preguntas y garantías, no equipos rivales.

**¿Por qué es importante?** Fallos parciales y concurrencia producen corrupción silenciosa. Elegir persistencia por moda crea costes operativos y modelos forzados.

**Casos de uso reales:** pagos, reservas, inventario, perfiles flexibles, caché de sesiones y redes sociales.

**Diagrama:**

```mermaid
flowchart LR
    BEGIN["BEGIN"] --> SUB["restar origen"] --> ADD["sumar destino"] --> COMMIT["COMMIT"]
    SUB -. "fallo" .-> ROLLBACK["ROLLBACK"]
    ADD -. "fallo" .-> ROLLBACK
```

### Tema 5: SQL avanzado: subconsultas, vistas, triggers y funciones de ventana

#### Paso 1 · Objetivo y preparación
Al finalizar podrás escribir subconsultas en WHERE, SELECT y FROM, guardar consultas como vistas, automatizar reglas con triggers y ordenar dentro de grupos con funciones de ventana. Prerrequisitos: Temas 2 y 3 de este módulo.

#### Paso 2 · Contexto y caso real
RutaFlow necesita un tablero por mensajero, la efectividad por zona y una auditoría de cada cambio de estado que nadie pueda olvidar registrar. Es el caso real de casi todo sistema con base de datos: la lógica que debe cumplirse siempre, sin importar qué aplicación escriba en la tabla, vive cerca de los datos.

#### Paso 3 · Teoría, modelo mental y analogía
Una **subconsulta** es un `SELECT` dentro de otro: en `WHERE` filtra contra un valor calculado, en `SELECT` calcula una columna (si depende de la fila exterior es **correlacionada**) y en `FROM` actúa como tabla temporal. Una **vista** es una consulta guardada con nombre. Un **trigger** se ejecuta solo, antes o después de un `INSERT`, `UPDATE` o `DELETE`. Una **función de ventana** (`RANK() OVER (PARTITION BY ...)`) calcula sobre un grupo sin colapsar las filas como hace `GROUP BY`.

Los **procedimientos almacenados** son programas guardados en el motor (`CREATE PROCEDURE` en PostgreSQL, MySQL u Oracle con PL/SQL). SQLite no los tiene; allí esa lógica vive en la aplicación o en triggers.

**Analogía:** una vista es un atajo guardado en el escritorio; un trigger es la alarma de una puerta, que suena sin que nadie tenga que acordarse de activarla.

**Diagrama:**

```mermaid
flowchart LR
    U[UPDATE estado] --> B{trigger BEFORE no_revertir}
    B -- entregada --> X[ABORT]
    B -- ok --> W[se escribe la fila]
    W --> A[trigger AFTER auditar_estado]
    A --> T[(auditoria)]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir sql-avanzado && cd sql-avanzado
```

Crea `sql_avanzado.py`:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE mensajero (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, zona TEXT NOT NULL);
CREATE TABLE entrega (
  id INTEGER PRIMARY KEY,
  mensajero_id INTEGER NOT NULL REFERENCES mensajero(id),
  kilos REAL NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'entregada', 'fallida'))
);
CREATE TABLE auditoria (entrega_id INTEGER, antes TEXT, despues TEXT);

INSERT INTO mensajero VALUES (1, 'Ana', 'Norte'), (2, 'Beto', 'Sur'), (3, 'Caro', 'Norte');
INSERT INTO entrega VALUES
  (10, 1, 2.0, 'entregada'), (11, 1, 8.5, 'entregada'), (12, 2, 1.0, 'fallida'),
  (13, 2, 3.0, 'entregada'), (14, 3, 12.0, 'pendiente'), (15, 3, 4.0, 'entregada');

-- Vista: una consulta guardada con nombre, se consulta como si fuera una tabla
CREATE VIEW resumen_mensajero AS
SELECT m.nombre, m.zona, COUNT(e.id) AS total,
       SUM(e.estado = 'entregada') AS entregadas
FROM mensajero m LEFT JOIN entrega e ON e.mensajero_id = m.id
GROUP BY m.id;

-- Trigger de auditoría: se ejecuta solo, después de cada cambio de estado
CREATE TRIGGER auditar_estado AFTER UPDATE OF estado ON entrega
BEGIN
  INSERT INTO auditoria VALUES (OLD.id, OLD.estado, NEW.estado);
END;

-- Trigger de regla de negocio: una entrega entregada no vuelve atrás
CREATE TRIGGER no_revertir BEFORE UPDATE OF estado ON entrega
WHEN OLD.estado = 'entregada'
BEGIN
  SELECT RAISE(ABORT, 'una entrega entregada no puede cambiar de estado');
END;
""")

def mostrar(titulo, sql):
    print(f"-- {titulo}")
    for fila in db.execute(sql):
        print("  ", fila)

mostrar("Subconsulta en WHERE: entregas más pesadas que el promedio",
        "SELECT id, kilos FROM entrega WHERE kilos > (SELECT AVG(kilos) FROM entrega)")
mostrar("Subconsulta correlacionada en SELECT: entregas por mensajero",
        "SELECT nombre, (SELECT COUNT(*) FROM entrega e WHERE e.mensajero_id = m.id) FROM mensajero m")
mostrar("Subconsulta en FROM: zonas con efectividad",
        """SELECT zona, ROUND(100.0 * SUM(entregadas) / SUM(total)) AS efectividad
           FROM (SELECT * FROM resumen_mensajero) GROUP BY zona""")
mostrar("Función de ventana: ranking de kilos dentro de cada mensajero",
        """SELECT mensajero_id, id, kilos,
                  RANK() OVER (PARTITION BY mensajero_id ORDER BY kilos DESC) AS puesto
           FROM entrega""")

db.execute("UPDATE entrega SET estado = 'entregada' WHERE id = 14")
mostrar("Auditoría generada por el trigger", "SELECT * FROM auditoria")
try:
    db.execute("UPDATE entrega SET estado = 'fallida' WHERE id = 10")
except sqlite3.IntegrityError as error:
    print("Rechazado por trigger:", error)
```

**Ejecuta el ejemplo:**

```bash
python3 sql_avanzado.py
```

**Resultado esperado:**

```text
-- Subconsulta en WHERE: entregas más pesadas que el promedio
   (11, 8.5)
   (14, 12.0)
-- Subconsulta correlacionada en SELECT: entregas por mensajero
   ('Ana', 2)
   ('Beto', 2)
   ('Caro', 2)
-- Subconsulta en FROM: zonas con efectividad
   ('Norte', 75.0)
   ('Sur', 50.0)
-- Función de ventana: ranking de kilos dentro de cada mensajero
   (1, 11, 8.5, 1)
   (1, 10, 2.0, 2)
   (2, 13, 3.0, 1)
   (2, 12, 1.0, 2)
   (3, 14, 12.0, 1)
   (3, 15, 4.0, 2)
-- Auditoría generada por el trigger
   (14, 'pendiente', 'entregada')
Rechazado por trigger: una entrega entregada no puede cambiar de estado
```

El `UPDATE` de la entrega 14 pasó y quedó auditado sin que el programa insertara nada en `auditoria`. El segundo `UPDATE` lo detuvo el trigger `no_revertir`.

**Fallo deliberado:** Borra la línea `WHEN OLD.estado = 'entregada'` del trigger `no_revertir`. Ahora **todo** cambio de estado se rechaza y el programa termina con `sqlite3.IntegrityError: una entrega entregada no puede cambiar de estado` en el `UPDATE` de la entrega 14, que era válido. Un trigger sin condición aplica a todas las filas: lee la condición antes de crearlo.

#### Paso 5 · Práctica guiada
Crea la vista `entregas_fallidas` con el nombre del mensajero y consúltala. **Pista:** es un `CREATE VIEW ... AS SELECT` con un `JOIN` entre `entrega` y `mensajero` y un `WHERE estado = 'fallida'`.

#### Paso 6 · Práctica independiente
Escribe la misma consulta de efectividad por zona sin subconsulta (solo con `JOIN` y `GROUP BY`) y compara el plan con `EXPLAIN QUERY PLAN`.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque reportes, auditorías y reglas de integridad son trabajo diario de backend, y las funciones de ventana aparecen en casi toda entrevista de SQL.
**Fuente oficial:** [SQLite: CREATE TRIGGER](https://www.sqlite.org/lang_createtrigger.html), [SQLite: Window Functions](https://www.sqlite.org/windowfunctions.html), [PostgreSQL: CREATE PROCEDURE](https://www.postgresql.org/docs/current/sql-createprocedure.html).
**Conceptos clave:** subconsulta, subconsulta correlacionada, vista, trigger BEFORE y AFTER, RAISE, función de ventana, procedimiento almacenado.
**Cuándo no usarlo:** no metas toda la lógica de negocio en triggers: son invisibles para quien lee el código de la aplicación y difíciles de probar. Úsalos para auditoría e invariantes que deben cumplirse siempre.

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** agrega una tabla de auditoría de tareas alimentada por un trigger y una vista con las tareas vencidas por responsable.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** crear un trigger `BEFORE UPDATE` sin una condición `WHEN`, lo que lo aplica a todas las filas en vez de solo a las que debían rechazarse (el fallo deliberado al borrar `WHEN OLD.estado = 'entregada'`); y meter en triggers lógica de negocio tan compleja que nadie que lea el código de la aplicación puede saber que existe.

### Tema 6: Procedimientos almacenados, funciones y cursores con PL/pgSQL

#### Paso 1 · Objetivo y preparación
Al finalizar podrás escribir funciones y procedimientos almacenados en PL/pgSQL, recorrer resultados con un cursor, lanzar y capturar excepciones, y distinguir cuándo usar `SELECT` (funciones) y `CALL` (procedimientos). Prerrequisito: Tema 5 de este módulo.

#### Paso 2 · Contexto y caso real
El cierre diario de RutaFlow resume las entregas por mensajero. Hacerlo desde la aplicación significaba traer miles de filas por la red. Los libros de Oracle PL/SQL de la biblioteca enseñan el caso real de los bancos y operadores logísticos: procesos por lotes que viven en la base de datos, junto a los datos.

#### Paso 3 · Teoría, modelo mental y analogía
**PL/pgSQL** (equivalente de PL/SQL de Oracle) agrega variables, condiciones, bucles y manejo de errores a SQL. Una **función** (`CREATE FUNCTION ... RETURNS`) devuelve un valor y se usa dentro de consultas. Un **procedimiento** (`CREATE PROCEDURE`, PostgreSQL 11+) no devuelve valor, se invoca con `CALL` y puede controlar transacciones. Un **cursor** recorre un resultado fila a fila; el `FOR fila IN cursor LOOP` lo abre y lo cierra solo. `RAISE EXCEPTION` aborta con un mensaje y `EXCEPTION WHEN ...` lo captura. En Oracle, además, los subprogramas se agrupan en **paquetes** (especificación y cuerpo).

**Analogía:** el procedimiento es una receta guardada en la cocina del restaurante: el mesero no trae los ingredientes a la mesa, pide el plato por su nombre.

**Diagrama:**

```mermaid
flowchart LR
    S[SELECT tarifa kilos] --> F[función: devuelve valor]
    C[CALL cerrar_dia] --> P[procedimiento]
    P --> K[cursor por mensajero]
    K --> I[INSERT en cierre_diario]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir plpgsql && cd plpgsql
```

Crea `plpgsql.sql`:

```sql
-- Esquema mínimo de RutaFlow
DROP TABLE IF EXISTS entrega, cierre_diario;
CREATE TABLE entrega (
  id serial PRIMARY KEY,
  guia text UNIQUE NOT NULL,
  mensajero text NOT NULL,
  kilos numeric(6,2) NOT NULL CHECK (kilos > 0),
  estado text NOT NULL DEFAULT 'pendiente'
);
CREATE TABLE cierre_diario (mensajero text PRIMARY KEY, entregadas int, kilos numeric(8,2));
INSERT INTO entrega (guia, mensajero, kilos, estado) VALUES
  ('BO-1', 'ana', 2.5, 'entregada'), ('BO-2', 'ana', 4, 'pendiente'),
  ('BO-3', 'beto', 1, 'entregada'), ('BO-4', 'beto', 7.25, 'entregada');

-- FUNCIÓN: devuelve un valor y se usa dentro de un SELECT
CREATE OR REPLACE FUNCTION tarifa(p_kilos numeric) RETURNS integer
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF p_kilos <= 0 THEN
    RAISE EXCEPTION 'kilos debe ser positivo: %', p_kilos;
  END IF;
  RETURN 5000 + ceil(p_kilos) * 1200;
END $$;

-- PROCEDIMIENTO: ejecuta un proceso con un CURSOR y maneja errores por fila
CREATE OR REPLACE PROCEDURE cerrar_dia()
LANGUAGE plpgsql AS $$
DECLARE
  fila record;
  c_mensajeros CURSOR FOR
    SELECT mensajero, count(*) AS n, sum(kilos) AS k
    FROM entrega WHERE estado = 'entregada' GROUP BY mensajero ORDER BY mensajero;
BEGIN
  DELETE FROM cierre_diario;
  FOR fila IN c_mensajeros LOOP                       -- el FOR abre, recorre y cierra el cursor
    INSERT INTO cierre_diario VALUES (fila.mensajero, fila.n, fila.k);
    RAISE NOTICE 'cierre de %: % entregas, % kg', fila.mensajero, fila.n, fila.k;
  END LOOP;
END $$;

SELECT guia, kilos, tarifa(kilos) AS tarifa FROM entrega ORDER BY guia;
CALL cerrar_dia();
SELECT * FROM cierre_diario ORDER BY mensajero;

-- Manejo de excepciones dentro de un bloque anónimo
DO $$
BEGIN
  PERFORM tarifa(0);
EXCEPTION WHEN raise_exception THEN
  RAISE NOTICE 'error controlado: %', SQLERRM;
END $$;
```

**Ejecuta el ejemplo:**

```bash
docker run -d --name pg-academia -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:17
docker cp plpgsql.sql pg-academia:/tmp/
docker exec pg-academia psql -U postgres -q -X -f /tmp/plpgsql.sql
```

**Resultado esperado:**

```text
psql:plpgsql.sql:2: NOTICE:  table "entrega" does not exist, skipping
psql:plpgsql.sql:2: NOTICE:  table "cierre_diario" does not exist, skipping
 guia | kilos | tarifa 
------+-------+--------
 BO-1 |  2.50 |   8600
 BO-2 |  4.00 |   9800
 BO-3 |  1.00 |   6200
 BO-4 |  7.25 |  14600
(4 rows)

psql:plpgsql.sql:42: NOTICE:  cierre de ana: 1 entregas, 2.50 kg
psql:plpgsql.sql:42: NOTICE:  cierre de beto: 2 entregas, 8.25 kg
 mensajero | entregadas | kilos 
-----------+------------+-------
 ana       |          1 |  2.50
 beto      |          2 |  8.25
(2 rows)

psql:plpgsql.sql:51: NOTICE:  error controlado: kilos debe ser positivo: 0
```

Los dos primeros avisos solo aparecen la primera vez, porque las tablas aún no existían. Con `docker rm -f pg-academia` borras el contenedor al terminar.

**Fallo deliberado:** Ejecuta `docker exec pg-academia psql -U postgres -c "SELECT cerrar_dia();"`. PostgreSQL responde `ERROR:  cerrar_dia() is a procedure` con la pista de usar `CALL`. Funciones y procedimientos no son intercambiables: elige según si necesitas un valor o ejecutar un proceso.

#### Paso 5 · Práctica guiada
Crea la función `efectividad(p_mensajero text) RETURNS numeric` que devuelva el porcentaje de entregas exitosas y úsala en un `SELECT` por mensajero. **Pista:** usa `SELECT count(*) FILTER (WHERE estado = 'entregada') * 100.0 / count(*) INTO resultado FROM entrega WHERE mensajero = p_mensajero;` y protege la división cuando no haya entregas.

#### Paso 6 · Práctica independiente
Reescribe `cerrar_dia` sin cursor, con un solo `INSERT ... SELECT`, y compara legibilidad y rendimiento con `EXPLAIN ANALYZE` sobre 100 000 filas generadas con `generate_series`.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque muchos sistemas empresariales (bancos, ERP, Oracle) concentran su lógica en procedimientos, y vas a mantenerlos o migrarlos.
**Fuente oficial:** [PostgreSQL: PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html), [PostgreSQL: CREATE PROCEDURE](https://www.postgresql.org/docs/current/sql-createprocedure.html).
**Conceptos clave:** PL/pgSQL, PL/SQL, función, procedimiento, `CALL`, cursor, `RAISE`, `EXCEPTION WHEN`, paquete de Oracle.
**Cuándo no usarlo:** no pongas reglas de negocio complejas que cambian a menudo en la base de datos: son difíciles de versionar, probar y desplegar. Úsalos para procesos cercanos a los datos y por lotes.

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** calcula el cierre diario de tareas por responsable con un procedimiento y compáralo con la versión en Python.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** invocar un procedimiento con `SELECT cerrar_dia()` en vez de `CALL cerrar_dia()` (el fallo deliberado), confundiendo procedimientos con funciones; y usar un cursor y un bucle `FOR` para algo que un solo `INSERT ... SELECT` resolvería con menos código y mejor rendimiento.
### Tema 7: De SQL a Excel: reportes con tablas y fórmulas vivas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás generar desde una consulta SQL un archivo Excel con encabezados, una tabla con filtros, fórmulas que Excel recalcula y formato de porcentaje, y verificar el archivo leyéndolo de nuevo. Prerrequisitos: Temas 2 y 5 de este módulo.

#### Paso 2 · Contexto y caso real
Las áreas de operación y finanzas de RutaFlow viven en Excel: piden cada lunes el resumen por zona y lo copiaban a mano desde la base de datos. El libro *Excel y SQL de la mano* de la biblioteca trata este caso real: SQL agrupa y filtra, y Excel presenta y permite seguir analizando.

#### Paso 3 · Teoría, modelo mental y analogía
La regla es **dividir el trabajo**: la base de datos agrega (`GROUP BY`) y la hoja de cálculo presenta. `openpyxl` escribe archivos `.xlsx`: cada celda puede tener un valor o una **fórmula** (texto que empieza con `=`) que Excel calcula al abrir; una **tabla de Excel** (`Table`) agrega filtros y estilo y se puede referenciar por nombre. `openpyxl` **no calcula** fórmulas: al leer con `data_only=True` solo verás valores que Excel haya guardado.

**Analogía:** SQL es la cocina que prepara el plato; Excel es el plato servido en la mesa, donde cada comensal puede agregar sal a su gusto.

**Diagrama:**

```mermaid
flowchart LR
    D[(SQLite)] --> Q[consulta GROUP BY]
    Q --> W[openpyxl]
    W --> X[reporte-entregas.xlsx]
    X --> F[fórmulas y filtros en Excel]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir sql-excel && cd sql-excel
```

Crea `reporte_excel.py`:

```python
import sqlite3
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font
from openpyxl.worksheet.table import Table, TableStyleInfo

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE entrega (guia TEXT, zona TEXT, mensajero TEXT, kilos REAL, estado TEXT);
INSERT INTO entrega VALUES
 ('BO-1','Norte','Ana',2.5,'entregada'), ('BO-2','Norte','Ana',4,'fallida'),
 ('BO-3','Sur','Beto',1,'entregada'),    ('BO-4','Sur','Beto',7.25,'entregada'),
 ('BO-5','Norte','Caro',3,'entregada');
""")

# SQL hace el trabajo pesado (agrupar); Excel presenta, filtra y calcula sobre el resultado
consulta = """
SELECT zona, COUNT(*) AS envios,
       SUM(estado = 'entregada') AS entregadas,
       ROUND(SUM(kilos), 2) AS kilos
FROM entrega GROUP BY zona ORDER BY zona
"""
cursor = db.execute(consulta)
columnas = [c[0] for c in cursor.description]
filas = cursor.fetchall()

libro = Workbook()
hoja = libro.active
hoja.title = "Resumen por zona"
hoja.append(columnas + ["efectividad"])
for i, fila in enumerate(filas, start=2):
    hoja.append(list(fila) + [f"=C{i}/B{i}"])        # fórmula viva: Excel la recalcula
    hoja[f"E{i}"].number_format = "0%"
for celda in hoja[1]:
    celda.font = Font(bold=True)
total = len(filas) + 2
hoja[f"A{total}"] = "Total"
hoja[f"B{total}"] = f"=SUM(B2:B{total - 1})"
tabla = Table(displayName="ResumenZonas", ref=f"A1:E{total - 1}")
tabla.tableStyleInfo = TableStyleInfo(name="TableStyleMedium9", showRowStripes=True)
hoja.add_table(tabla)                                # tabla de Excel: filtros y estilo
libro.save("reporte-entregas.xlsx")

# Verificación: volver a leer el archivo generado
leido = load_workbook("reporte-entregas.xlsx")["Resumen por zona"]
for fila in leido.iter_rows(values_only=True):
    print(fila)
```

**Ejecuta el ejemplo:**

```bash
pip install openpyxl
python3 reporte_excel.py
```

**Resultado esperado:**

```text
('zona', 'envios', 'entregadas', 'kilos', 'efectividad')
('Norte', 3, 2, 9.5, '=C2/B2')
('Sur', 2, 2, 8.25, '=C3/B3')
('Total', '=SUM(B2:B3)', None, None, None)
```

Las celdas de efectividad y total muestran la fórmula porque `openpyxl` no la calcula; al abrir el archivo en Excel o LibreOffice verás 67 %, 100 % y el total 5.

**Fallo deliberado:** Cambia `displayName="ResumenZonas"` por `displayName="Resumen Zonas"`. El programa termina con `ValueError: Table names cannot have spaces`: los nombres de tabla de Excel siguen reglas de identificadores. Otra trampa frecuente: leer con `load_workbook(..., data_only=True)` devuelve `None` en las celdas con fórmula si el archivo nunca se abrió en Excel.

#### Paso 5 · Práctica guiada
Agrega una segunda hoja `Detalle` con todas las entregas, una fila por guía, y congela la fila de encabezados. **Pista:** crea la hoja con `libro.create_sheet("Detalle")`, vuelca `SELECT * FROM entrega` y usa `hoja.freeze_panes = "A2"`.

#### Paso 6 · Práctica independiente
Haz el camino inverso: lee un Excel de pedidos con columnas `guia`, `zona` y `kilos`, valida cada fila e insértala en SQLite, reportando las filas rechazadas.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque conectar datos con las herramientas que usa el negocio ahorra horas de trabajo manual y elimina errores de copiado.
**Fuente oficial:** [openpyxl documentation](https://openpyxl.readthedocs.io/en/stable/), [openpyxl: Worksheet Tables](https://openpyxl.readthedocs.io/en/stable/worksheet_tables.html).
**Conceptos clave:** agregar en SQL y presentar en Excel, `openpyxl`, fórmula, tabla de Excel, `number_format`, `data_only`.
**Cuándo no usarlo:** si el reporte necesita actualizarse solo cada hora o lo usan muchas personas, un tablero conectado a la base de datos es mejor que archivos que se envían por correo.

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** exporta cada semana las tareas por responsable a un Excel con filtros y porcentaje de cumplimiento.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** nombrar una tabla de Excel con espacios (como `displayName="Resumen Zonas"`), lo que falla con `ValueError: Table names cannot have spaces` porque sigue reglas de identificador; y asumir que `openpyxl` calculó las fórmulas al leer el archivo, cuando en realidad devuelve el texto de la fórmula (o `None` con `data_only=True`) hasta que alguien lo abrió en Excel.

## Construcción guiada del capítulo

### Proyecto 4: migrar el inventario JSON a SQLite

Copia el Proyecto 2 a una rama nueva. Conserva el JSON como fuente de migración, no como almacenamiento principal.

1. Diseña `modelo.md` con entidades, cardinalidades y reglas.
2. Crea `migrations/001_initial.sql` con categorías, productos y movimientos.
3. Escribe `migrate.py` que crea la base y registra versión aplicada.
4. Importa JSON dentro de una transacción; un dato inválido debe revertir todo.
5. Implementa repositorio con SQL parametrizado.
6. Añade reportes de bajo stock y unidades por categoría mediante JOIN/agregación.
7. Genera 10 000 productos, compara plan antes/después de índices.
8. Prueba SKU duplicado, categoría inexistente, stock negativo y rollback.
9. Documenta backup y restauración de `inventario.db`.
10. Escribe ADR: “Por qué SQLite y no documentos para esta etapa”.

**Verificación:** ejecutar migraciones dos veces no destruye datos; restricciones fallan donde corresponde; importación parcial se revierte; consultas no concatenan entrada; planes e índices están documentados.

**Errores comunes y soluciones**

- Crear tablas desde código sin versión: usa migraciones revisables.
- Concatenar entrada: parametriza siempre.
- Suponer foreign keys activas: habilita y prueba.
- Abrir una conexión por cada fila: agrupa trabajo en transacciones.
- Elegir NoSQL por evitar modelado: empieza por patrones y garantías.
