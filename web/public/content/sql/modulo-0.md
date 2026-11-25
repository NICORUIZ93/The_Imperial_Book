# Módulo 0: Modelado de datos, SQL y persistencia

> **Requisitos de este curso:** [Fundamentos](/curso/foundations). Lo que esos cursos enseñan aquí se usa sin volver a explicarlo; si algo no te suena, vuelve a su capítulo antes de seguir.

**Entorno comprobado para esta edición (2026-11-24):** OpenJDK 25.0.5.1 con el controlador JDBC `sqlite-jdbc` 3.41.2.2, que trae SQLite 3.41.2, en Linux x86_64. El Tema 6 se ejecutó con `psql` contra PostgreSQL 16.15. El Tema 7 escribe el `.xlsx` solo con el JDK y usa LibreOffice 24.2.7 para recalcular fórmulas. Todas las salidas son literales de esas ejecuciones. Los comandos `docker` del Tema 6 no se ejecutaron en este entorno: el mismo archivo SQL se ejecutó con `psql` sobre un servidor local.

**Al terminar este módulo podrás:**
- modelar entidades y relaciones, y crear el esquema desde un archivo de migración;
- consultar con `SELECT` y `JOIN` usando parámetros;
- proteger los datos con restricciones y transacciones;
- medir el efecto de un índice;
- llevar una consulta SQL a un reporte de Excel.

**Qué necesitas saber antes:** de Fundamentos, el Módulo 1 (variables, métodos, records, excepciones con
`try`/`catch`), el Módulo 2 (listas, mapas y el inventario CSV del Proyecto 2) y el primer contacto con JDBC y H2 del Módulo 4, Tema 2. El curso de Java (Módulo 17) profundiza en JDBC.

**Prepara el entorno una vez.** Java habla con SQLite mediante un controlador JDBC: un archivo `.jar` que se pasa en el
*classpath*. Descarga `sqlite-jdbc-3.41.2.2.jar` desde Maven Central
(`https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.41.2.2/`) a `~/herramientas`, crea la carpeta de práctica
y define un alias para no repetir la orden larga. La opción `--enable-native-access` evita el aviso que Java 25
imprime porque el controlador carga la biblioteca nativa de SQLite:

```bash
mkdir -p ~/labs/sql && cd ~/labs/sql
alias javasql='java --enable-native-access=ALL-UNNAMED -cp ~/herramientas/sqlite-jdbc-3.41.2.2.jar'
```

Todos los programas del módulo viven en `~/labs/sql` y usan `Bd.java`, una clase pequeña con las operaciones JDBC
que se repiten: abrir la base, ejecutar un script, ejecutar una sentencia con parámetros y leer filas. Escríbela
primero:

```java
// Bd.java — utilidades JDBC compartidas por los programas del módulo
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

class Bd {
    static Connection abrir(String archivo) throws SQLException {   // ":memory:" = base en memoria
        return DriverManager.getConnection("jdbc:sqlite:" + archivo);
    }

    static void script(Connection conexion, String sql) throws SQLException {
        try (var sentencia = conexion.createStatement()) {
            sentencia.executeUpdate(sql);                             // admite varias sentencias separadas por ;
        }
    }

    static PreparedStatement preparar(Connection conexion, String sql, Object... parametros) throws SQLException {
        PreparedStatement sentencia = conexion.prepareStatement(sql);
        for (int i = 0; i < parametros.length; i++) {
            sentencia.setObject(i + 1, parametros[i]);               // cada ? recibe su valor por separado
        }
        return sentencia;
    }

    static int ejecutar(Connection conexion, String sql, Object... parametros) throws SQLException {
        try (var sentencia = preparar(conexion, sql, parametros)) {
            return sentencia.executeUpdate();                         // filas afectadas
        }
    }

    static Object valor(Connection conexion, String sql, Object... parametros) throws SQLException {
        try (var sentencia = preparar(conexion, sql, parametros); ResultSet resultado = sentencia.executeQuery()) {
            return resultado.next() ? resultado.getObject(1) : null;  // primera columna de la primera fila
        }
    }

    static List<String> filas(Connection conexion, String sql, Object... parametros) throws SQLException {
        List<String> filas = new ArrayList<>();
        try (var sentencia = preparar(conexion, sql, parametros); ResultSet resultado = sentencia.executeQuery()) {
            int columnas = resultado.getMetaData().getColumnCount();
            while (resultado.next()) {
                StringJoiner fila = new StringJoiner(", ", "(", ")");
                for (int c = 1; c <= columnas; c++) {
                    fila.add(String.valueOf(resultado.getObject(c)));
                }
                filas.add(fila.toString());
            }
        }
        return filas;
    }

    static String error(SQLException error) {                         // el mensaje de SQLite, sin el código
        String texto = error.getMessage();
        int inicio = texto.indexOf(" (");
        return inicio < 0 ? texto : texto.substring(inicio + 2, texto.length() - 1);
    }
}
```

- `abrir` usa la URL `jdbc:sqlite:` seguida del archivo; `:memory:` crea una base que vive solo en la memoria.
- `preparar` crea un `PreparedStatement` y entrega cada valor a su `?` con `setObject`: es la consulta parametrizada.
- `filas` devuelve cada fila como texto entre paréntesis, por ejemplo `(1, trabajo)`; un `NULL` sale como `null`.
- `error` quita el código del controlador (`[SQLITE_CONSTRAINT_FOREIGNKEY] …`) y deja el mensaje de SQLite.
- Como `Bd.java` está en la misma carpeta, `javasql Programa.java` la encuentra sola.

## Aprende construyendo


### Tema 1: Del mundo real al modelo relacional · Intermedio · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- identificar entidades, atributos y relaciones en una situación de RutaFlow;
- traducir ese modelo a tablas con clave primaria y clave foránea en SQLite;
- comprobar si la base protege la integridad referencial al borrar un dato;
- explicar con una medición por qué un modelo normalizado evita datos contradictorios.

**Conceptos clave:** persistencia, base de datos relacional, SQL, conexión, entidad, atributo, relación, tabla, fila, columna, clave primaria, clave foránea, integridad referencial, normalización

#### El problema
El equipo de RutaFlow guarda sus tareas en un archivo de texto. Cada tarea repite el nombre y el color de su categoría.
Ayer alguien escribió «Trabajo» con mayúscula y el reporte mostró dos categorías distintas. Hoy borraron una
categoría y nadie supo qué pasó con sus tareas. ¿Cómo se organiza un dato para que exista en un solo lugar y nadie
pueda dejarlo huérfano?

#### Glosario del tema

**persistencia**
- **Definición técnica:** propiedad de un dato de sobrevivir al proceso que lo creó, porque quedó escrito en un almacenamiento no volátil (disco).
- **En palabras sencillas:** que el dato siga ahí mañana, aunque cierres el programa o apagues el computador.
- **Dónde se rompe la comparación:** escribir en disco no basta; si el programa falla a mitad de una escritura, el dato puede quedar a medias (Tema 4).
- **Ejemplo:** ejecutas el esquema de `Modelo.java` sobre `rutaflow.db`, cierras el programa y en otra ejecución `SELECT COUNT(*) FROM tareas` devuelve `[(2)]`.
- **Error típico:** usar `Bd.abrir(":memory:")` y esperar encontrar los datos después: esa base vive solo en la memoria del proceso.

**base de datos relacional**
- **Definición técnica:** sistema que guarda los datos en tablas relacionadas por valores comunes y los consulta con SQL. SQLite es una que vive en un archivo.
- **En palabras sencillas:** un archivador con cajones (tablas) donde cada ficha puede apuntar a fichas de otro cajón.
- **Dónde se rompe la comparación:** el archivador no te impide guardar basura; la base sí puede rechazarla si declaras reglas.
- **Ejemplo:** `SELECT name FROM sqlite_master WHERE type = 'table'` sobre la base de `Modelo.java` devuelve `[(categorias), (tareas)]`.
- **Error típico:** tratar la base como una hoja de cálculo y meter todo en una sola tabla gigante.

**SQL**
- **Definición técnica:** lenguaje declarativo estándar para definir estructuras (`CREATE TABLE`), modificar datos (`INSERT`, `UPDATE`, `DELETE`) y consultarlos (`SELECT`).
- **En palabras sencillas:** el idioma en el que le pides cosas a la base: dices qué quieres, no cómo buscarlo.
- **Dónde se rompe la comparación:** cada motor tiene su dialecto; SQLite y PostgreSQL comparten la base del idioma pero no todos los detalles.
- **Ejemplo:** `SELECT * FROM categorias` devuelve `[(1, trabajo), (2, personal)]`.
- **Error típico:** escribir mal el nombre de una tabla: `SELECT * FROM tarea` produce `SQLiteException: [SQLITE_ERROR] SQL error or missing database (no such table: tarea)`.

**conexión**
- **Definición técnica:** objeto `java.sql.Connection` que abre un archivo de base de datos (o una base en memoria) y ejecuta sentencias SQL sobre él; en este módulo lo crea `Bd.abrir`.
- **En palabras sencillas:** la línea telefónica abierta entre tu programa y la base; por ella mandas SQL y recibes filas.
- **Dónde se rompe la comparación:** una llamada se corta sola al colgar; una conexión debe cerrarse con `close()` o se queda abierta.
- **Ejemplo:** `Bd.valor(Bd.abrir(":memory:"), "PRAGMA foreign_keys")` devuelve `0`: las claves foráneas vienen apagadas en cada conexión nueva.
- **Error típico:** conectarse a `jdbc:sqlite:rutaflow.db` desde otra carpeta: SQLite crea un archivo vacío nuevo en vez de avisar.

**entidad**
- **Definición técnica:** cosa del dominio con identidad propia sobre la que el sistema guarda información; en el modelo relacional se representa con una tabla.
- **En palabras sencillas:** un sustantivo importante del negocio: tarea, categoría, mensajero, envío.
- **Dónde se rompe la comparación:** no todo sustantivo es entidad; «color» es una característica de la categoría, no una entidad.
- **Ejemplo:** la entidad Categoría vive en la tabla `categorias`; `SELECT COUNT(*) FROM categorias` devuelve `[(2)]`.
- **Error típico:** crear una tabla por cada valor posible (`tareas_trabajo`, `tareas_personal`) en vez de una entidad con un atributo.

**atributo**
- **Definición técnica:** propiedad de una entidad que tiene un nombre y un tipo de dato; en la tabla se convierte en una columna.
- **En palabras sencillas:** un dato que describe a la entidad: el título de una tarea, el nombre de una categoría.
- **Dónde se rompe la comparación:** un atributo guarda un solo valor; una lista de valores pide otra tabla.
- **Ejemplo:** `SELECT nombre FROM categorias` devuelve `[(trabajo), (personal)]`.
- **Error típico:** guardar varias cosas en un atributo, como `"azul,urgente"`, y luego no poder filtrar por una de ellas.

**relación**
- **Definición técnica:** asociación entre entidades con una cardinalidad, por ejemplo uno a muchos: una categoría agrupa muchas tareas y cada tarea tiene una categoría.
- **En palabras sencillas:** cómo se conectan las cosas: «esta tarea es de esta categoría».
- **Dónde se rompe la comparación:** en la base la relación no es una flecha: es un número guardado en una columna de la tabla «muchos».
- **Ejemplo:** `SELECT titulo FROM tareas WHERE categoria_id = 1` devuelve `[(Pagar factura)]`, las tareas de la categoría 1.
- **Error típico:** poner la referencia en el lado equivocado: una columna `tarea_id` en `categorias` solo admite una tarea por categoría.

**tabla**
- **Definición técnica:** estructura con un nombre y un conjunto fijo de columnas tipadas que almacena filas; se crea con `CREATE TABLE`.
- **En palabras sencillas:** una cuadrícula con encabezados fijos; cada renglón es un registro.
- **Dónde se rompe la comparación:** a diferencia de una hoja de cálculo, las filas no tienen un orden garantizado si no lo pides.
- **Ejemplo:** `SELECT name, type FROM pragma_table_info('tareas')` devuelve `[(id, INTEGER), (titulo, TEXT), (categoria_id, INTEGER)]`.
- **Error típico:** crear dos veces la misma tabla: `table categorias already exists`; usa `CREATE TABLE IF NOT EXISTS` si el script se repite.

**fila**
- **Definición técnica:** registro de una tabla con un valor por cada columna; en JDBC se recorre con un `ResultSet`, una fila a la vez.
- **En palabras sencillas:** un renglón de la cuadrícula: una tarea concreta con todos sus datos.
- **Dónde se rompe la comparación:** una fila no se identifica por su posición, sino por su clave primaria.
- **Ejemplo:** `SELECT * FROM tareas WHERE id = 2` devuelve `[(2, Comprar pan, 2)]`.
- **Error típico:** confiar en «la tercera fila»: tras borrar o reordenar, la tercera ya es otra.

**columna**
- **Definición técnica:** atributo de una tabla con un nombre, un tipo declarado y reglas opcionales, presente en todas sus filas.
- **En palabras sencillas:** un encabezado de la cuadrícula y todos los valores que hay debajo.
- **Dónde se rompe la comparación:** SQLite admite que guardes texto en una columna `INTEGER` si no declaras `STRICT`; otros motores lo rechazan.
- **Ejemplo:** `SELECT titulo FROM tareas` devuelve `[(Pagar factura), (Comprar pan)]`.
- **Error típico:** pedir una columna que no existe: `no such column: estatus`.

**clave primaria (PRIMARY KEY)**
- **Definición técnica:** columna (o conjunto de columnas) cuyo valor identifica de forma única cada fila y no puede repetirse.
- **En palabras sencillas:** la cédula de la fila: dos filas nunca tienen la misma.
- **Dónde se rompe la comparación:** la cédula la asigna el Estado; aquí, si no das un `id`, SQLite asigna el siguiente libre.
- **Ejemplo:** tras `INSERT INTO categorias(nombre) VALUES ('bodega')`, `SELECT last_insert_rowid()` devuelve `[(3)]`.
- **Error típico:** repetir un `id` a mano: `INSERT INTO categorias(id, nombre) VALUES (1, 'otra')` produce `UNIQUE constraint failed: categorias.id`.

**clave foránea (FOREIGN KEY)**
- **Definición técnica:** columna que guarda la clave primaria de otra tabla y declara con `REFERENCES` que ese valor debe existir allí.
- **En palabras sencillas:** una nota que dice «esta tarea pertenece a la categoría número 1», con la promesa de que la 1 existe.
- **Dónde se rompe la comparación:** en SQLite la promesa solo se cumple si activas `PRAGMA foreign_keys = ON` en cada conexión.
- **Ejemplo:** con las claves activas, `INSERT INTO tareas(titulo, categoria_id) VALUES ('Llamar cliente', 99)` produce `FOREIGN KEY constraint failed`.
- **Error típico:** declarar `REFERENCES` y suponer que ya protege: sin el `PRAGMA`, SQLite acepta el 99 sin quejarse.

**integridad referencial**
- **Definición técnica:** garantía de que toda clave foránea apunta a una fila que existe; el motor la verifica al insertar, actualizar o borrar.
- **En palabras sencillas:** ninguna tarea queda señalando una categoría que ya no existe.
- **Dónde se rompe la comparación:** la base no adivina qué querías; rechaza el borrado, salvo que declares otra acción como `ON DELETE CASCADE`.
- **Ejemplo:** tras borrar la categoría 1 sin claves activas, `PRAGMA foreign_key_check` devuelve `[(tareas, 1, categorias, 0)]`: la tarea 1 quedó huérfana.
- **Error típico:** descubrir los huérfanos meses después, cuando un reporte cuenta tareas sin categoría.

**normalización**
- **Definición técnica:** proceso de diseño que reparte los atributos en tablas. Cada hecho se guarda una vez y depende solo de la clave de su tabla.
- **En palabras sencillas:** no copiar el mismo dato en muchos lugares; guardarlo una vez y apuntar a él.
- **Dónde se rompe la comparación:** normalizar no es partir todo en mil tablas; un reporte que solo se lee puede repetir datos a propósito.
- **Ejemplo:** cambiar el color de «trabajo» en `categorias` afecta `1` fila; en la tabla repetida afecta `2` y deja una fila vieja.
- **Error típico:** repetir texto escrito a mano («trabajo» y «Trabajo») y obtener dos categorías donde había una.

#### ► CÓMO FUNCIONA
Modelar es pasar de palabras a tablas en tres pasos. Primero subrayas los **sustantivos** que importan: son las
entidades. Después anotas qué dato describe a cada una: son los atributos. Al final, para cada par de entidades,
preguntas «¿cuántos de un lado van con uno del otro?»: esa es la relación.

Una relación uno a muchos se guarda poniendo una **clave foránea en la tabla del lado «muchos»**. En el
inventario de la bodega de RutaFlow, una categoría clasifica muchos productos y cada producto registra muchos
movimientos de entrada o salida:

```mermaid
erDiagram
    CATEGORIA ||--o{ PRODUCTO : clasifica
    PRODUCTO ||--o{ MOVIMIENTO : registra
    CATEGORIA { int id PK }
    PRODUCTO { int id PK int categoria_id FK string sku UK }
    MOVIMIENTO { int id PK int producto_id FK }
```

Lee el diagrama así: `||` significa «exactamente uno» y `o{` significa «cero o muchos». `PK` marca la clave
primaria, `FK` la foránea y `UK` un valor único. En este tema usas `CREATE TABLE`, `INSERT` y `SELECT *` de forma
básica; el Tema 2 las explica a fondo.

#### Problema resuelto 1.1
Modela las tareas de RutaFlow con dos tablas relacionadas. Luego comprueba qué pasa al borrar una categoría que
todavía tiene tareas, con las claves foráneas apagadas y encendidas.

**Razonamiento:**
1. Entidades: Categoría y Tarea. Relación: una categoría tiene muchas tareas; cada tarea tiene una categoría.
2. La clave foránea va en `tareas` (el lado «muchos»): columna `categoria_id` que referencia `categorias(id)`.
3. Para comparar, ejecuta el mismo borrado dos veces: una sin `PRAGMA foreign_keys = ON` y otra con él.
4. Si la base protege la integridad, el segundo borrado debe fallar con una `SQLException`.

```java
// Modelo.java — categorías y tareas de RutaFlow con clave foránea
import java.sql.Connection;
import java.sql.SQLException;

static final String ESQUEMA = """
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
        """;

void probarBorrado(boolean activarClaves) throws SQLException {
    try (Connection conexion = Bd.abrir(":memory:")) {
        if (activarClaves) {
            Bd.script(conexion, "PRAGMA foreign_keys = ON");
        }
        Bd.script(conexion, ESQUEMA);
        IO.println("foreign_keys = " + Bd.valor(conexion, "PRAGMA foreign_keys"));
        try {
            Bd.ejecutar(conexion, "DELETE FROM categorias WHERE nombre = 'trabajo'");
            IO.println("  borrado aceptado; categorías: " + Bd.filas(conexion, "SELECT * FROM categorias"));
            IO.println("  tareas: " + Bd.filas(conexion, "SELECT * FROM tareas"));
        } catch (SQLException error) {
            IO.println("  borrado rechazado: " + Bd.error(error));
        }
    }
}

void main() throws SQLException {
    probarBorrado(false);
    probarBorrado(true);
}
```

```text
$ javasql Modelo.java
foreign_keys = 0
  borrado aceptado; categorías: [(2, personal)]
  tareas: [(1, Pagar factura, 1), (2, Comprar pan, 2)]
foreign_keys = 1
  borrado rechazado: FOREIGN KEY constraint failed
```

**Explicación por partes.**
- Líneas 5–8: la tabla `categorias` con su clave primaria `id` y un `nombre` que no puede faltar ni repetirse.
- Línea 12: `categoria_id` es la clave foránea; `REFERENCES categorias(id)` declara a qué apunta.
- Líneas 14–15: dos categorías y dos tareas; la tarea «Pagar factura» apunta a la categoría 1.
- Líneas 19–23: una base en memoria nueva por cada prueba (el `try` con recursos la cierra); el `PRAGMA` se activa antes de crear las tablas.
- Líneas 26–32: si SQLite rechaza el borrado, `executeUpdate` lanza `SQLException` y se imprime su mensaje.
- Primera prueba: el borrado se acepta y la tarea 1 sigue apuntando a una categoría 1 que ya no existe.
- Segunda prueba: con el `PRAGMA`, SQLite rechaza el borrado y la integridad se conserva.

> **Error común.** Declarar `REFERENCES` y creer que ya estás protegido. En SQLite las claves foráneas vienen
> apagadas: `PRAGMA foreign_keys` devuelve `0` y el borrado deja huérfanos sin ningún mensaje. Ejecuta
> `PRAGMA foreign_keys = ON` justo después de abrir cada conexión.

> **Buena práctica.** Nombra las tablas en plural (`tareas`) y las claves foráneas como `<entidad>_id`
> (`categoria_id`). Quien lee el esquema entiende la relación sin abrir el diagrama.

#### Problema resuelto 1.2
Compara un diseño que repite el nombre y el color de la categoría en cada tarea con uno normalizado. Cambia el
color de «trabajo» a morado en ambos y cuenta cuántas filas toca cada `UPDATE`.

**Razonamiento:**
1. En el diseño repetido, el color de «trabajo» vive en cada tarea de esa categoría.
2. En el normalizado, vive una sola vez en `categorias`; las tareas solo guardan el número.
3. `executeUpdate` devuelve cuántas filas cambió la sentencia (`Bd.ejecutar` lo entrega): esa es la medición.

```java
// Normalizar.java — el mismo dato repetido contra el dato en un solo lugar
import java.sql.Connection;
import java.sql.SQLException;

void main() throws SQLException {
    try (Connection conexion = Bd.abrir(":memory:")) {
        Bd.script(conexion, """
                CREATE TABLE tareas_mal_disenadas(
                  id INTEGER PRIMARY KEY,
                  titulo TEXT,
                  categoria_nombre TEXT,
                  categoria_color TEXT
                );
                INSERT INTO tareas_mal_disenadas(titulo, categoria_nombre, categoria_color) VALUES
                  ('Pagar factura', 'trabajo', 'azul'),
                  ('Revisar ruta', 'trabajo', 'azul'),
                  ('Cargar camión', 'Trabajo', 'azul'),
                  ('Comprar pan', 'personal', 'verde');

                CREATE TABLE categorias(id INTEGER PRIMARY KEY, nombre TEXT NOT NULL UNIQUE, color TEXT NOT NULL);
                CREATE TABLE tareas(
                  id INTEGER PRIMARY KEY,
                  titulo TEXT NOT NULL,
                  categoria_id INTEGER NOT NULL REFERENCES categorias(id)
                );
                INSERT INTO categorias(nombre, color) VALUES ('trabajo', 'azul'), ('personal', 'verde');
                INSERT INTO tareas(titulo, categoria_id) VALUES
                  ('Pagar factura', 1), ('Revisar ruta', 1), ('Cargar camión', 1), ('Comprar pan', 2);
                """);

        int malo = Bd.ejecutar(conexion,
                "UPDATE tareas_mal_disenadas SET categoria_color = 'morado' WHERE categoria_nombre = 'trabajo'");
        IO.println("diseño repetido: filas cambiadas = " + malo);
        IO.println(Bd.filas(conexion, "SELECT titulo, categoria_nombre, categoria_color FROM tareas_mal_disenadas"));

        int bueno = Bd.ejecutar(conexion, "UPDATE categorias SET color = 'morado' WHERE nombre = 'trabajo'");
        IO.println("diseño normalizado: filas cambiadas = " + bueno);
        IO.println(Bd.filas(conexion, "SELECT * FROM categorias"));
    }
}
```

```text
$ javasql Normalizar.java
diseño repetido: filas cambiadas = 2
[(Pagar factura, trabajo, morado), (Revisar ruta, trabajo, morado), (Cargar camión, Trabajo, azul), (Comprar pan, personal, verde)]
diseño normalizado: filas cambiadas = 1
[(1, trabajo, morado), (2, personal, verde)]
```

**Explicación por partes.**
- Líneas 8–17: el diseño repetido; observa la línea 16, donde alguien escribió «Trabajo» con mayúscula.
- Líneas 19–27: el diseño normalizado; el color aparece una sola vez, en la línea 25.
- Líneas 30–33: el `UPDATE` cambia 2 filas y deja «Cargar camión» en azul: la base ahora se contradice.
- Líneas 35–37: el mismo cambio en el diseño normalizado toca 1 fila y todas las tareas lo ven.

> **Prevenir errores.** Si un `UPDATE` tiene que tocar muchas filas para cambiar **un** hecho, el modelo repite
> datos. Antes de crear una columna de texto, pregúntate si ese texto describe a otra entidad.

#### Checkpoint 1.1
En `Modelo.java`, con las claves activas, ¿qué pasa si en lugar de borrar «trabajo» borras «personal»?

Respuesta: también se rechaza con `FOREIGN KEY constraint failed`, porque la tarea «Comprar pan» apunta a la
categoría 2. Solo se puede borrar una categoría sin tareas.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Entra en la carpeta del módulo, que ya tiene `Bd.java`:

```bash
cd ~/labs/sql
```

#### Paso 2 · Dibuja el modelo
Escribe en papel las entidades Categoría, Producto y Movimiento, sus atributos y las dos relaciones uno a muchos.
Compáralo con el diagrama de «Cómo funciona».

#### Paso 3 · Comprueba la integridad
Guarda `Modelo.java`, ejecútalo con `javasql Modelo.java` y confirma las dos líneas `foreign_keys`. La
segunda prueba debe terminar con `borrado rechazado: FOREIGN KEY constraint failed`.

#### Paso 4 · Agrega los movimientos
Añade al esquema una tabla `movimientos(id, producto_id, cantidad)` con `producto_id` como clave foránea hacia
`productos(id)`. Con las claves activas, inserta un movimiento del producto 99. Debes ver
`FOREIGN KEY constraint failed`.

#### Paso 5 · Mide la normalización
Ejecuta `Normalizar.java` y anota los dos valores de `filas cambiadas`. Deben ser `2` y `1`.

#### Resumen
- La **persistencia** mantiene los datos después de cerrar el programa; una **base de datos relacional** los guarda en tablas.
- Una **entidad** se vuelve **tabla**; cada **atributo**, **columna**; cada registro, **fila**.
- La **clave primaria** identifica cada fila; la **clave foránea** guarda la clave de otra tabla y expresa la **relación**.
- La **integridad referencial** impide huérfanos, pero en SQLite exige `PRAGMA foreign_keys = ON` en cada **conexión**.
- La **normalización** guarda cada hecho una vez; se mide contando las filas que toca un `UPDATE`.

#### Ejercicio verificable 1
Básico. Crea `mensajeros(id, nombre)` y `envios(id, guia, mensajero_id)` con clave foránea. Inserta un mensajero y
dos envíos. Con las claves activas, inserta un envío con `mensajero_id = 7`.

Respuesta esperada: `SQLiteException: [SQLITE_CONSTRAINT_FOREIGNKEY] A foreign key constraint failed (FOREIGN KEY constraint failed)`.
La clave foránea va en `envios`, el lado «muchos» de la relación.

#### Ejercicio verificable 2
Intermedio. En `Normalizar.java`, cambia el filtro del primer `UPDATE` por `WHERE lower(categoria_nombre) = 'trabajo'`.
¿Cuántas filas cambian ahora?

Respuesta esperada: `3`. `lower` convierte «Trabajo» a minúsculas y la fila olvidada entra en el cambio. Es un
parche: el diseño normalizado no necesita ese truco.

#### Ejercicio verificable 3
Reto. En una base sin claves activas, borra la categoría 1 de `Modelo.java` y ejecuta
`Bd.filas(conexion, "PRAGMA foreign_key_check")`. Explica cada valor de la fila que devuelve.

Respuesta esperada: `[(tareas, 1, categorias, 0)]`. Significa: en la tabla `tareas`, la fila con `id` 1 apunta
a `categorias` y rompe la clave foránea número 0 de esa tabla.

#### En el trabajo
Antes de escribir una sola línea de un backend, los equipos dibujan el modelo entidad-relación y lo revisan con
quien conoce el negocio. Un error de modelo es caro: cambiar dónde vive un dato con millones de filas exige una
migración. Por eso las empresas activan las claves foráneas desde el primer día y ejecutan `foreign_key_check`
antes de cada migración importante.

</details>

### Tema 2: SQL para definir, escribir, consultar y relacionar · Intermedio · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- crear un esquema desde un archivo de migración y aplicarlo una sola vez;
- insertar filas y consultarlas con `SELECT`, `WHERE` y `ORDER BY`;
- combinar tablas con `JOIN` y `LEFT JOIN` y resumirlas con `GROUP BY`;
- provocar una inyección SQL real y corregirla con una consulta parametrizada.

**Conceptos clave:** CREATE TABLE, INSERT, SELECT, WHERE, ORDER BY, JOIN, LEFT JOIN, GROUP BY, función de agregado, ResultSet, consulta parametrizada, inyección SQL, migración

#### El problema
La jefa de bodega de RutaFlow pide cada lunes dos datos. Primero, qué productos tienen menos de 5 unidades, con su
categoría. Segundo, cuántas unidades hay por categoría. Además, la pantalla de búsqueda recibe el SKU que escribe
cualquier usuario. ¿Cómo se piden esos datos a la base y cómo se evita que un texto malicioso cambie la consulta?

#### Glosario del tema

**CREATE TABLE**
- **Definición técnica:** sentencia DDL (lenguaje de definición de datos) que crea una tabla con sus columnas, tipos y restricciones.
- **En palabras sencillas:** la orden que dibuja la cuadrícula vacía con sus encabezados y sus reglas.
- **Dónde se rompe la comparación:** el dibujo queda guardado en la base; puedes leerlo después en `sqlite_master`.
- **Ejemplo:** `SELECT sql FROM sqlite_master WHERE name = 'categorias'` devuelve el texto `CREATE TABLE categorias (...)` que la creó.
- **Error típico:** ejecutar el script dos veces: la segunda falla con `table categorias already exists`.

**INSERT**
- **Definición técnica:** sentencia DML (manipulación de datos) que agrega filas a una tabla; las columnas omitidas toman su `DEFAULT` o `NULL`.
- **En palabras sencillas:** escribir un renglón nuevo en la cuadrícula.
- **Dónde se rompe la comparación:** un renglón en papel siempre entra; la base lo rechaza si rompe una regla.
- **Ejemplo:** `INSERT INTO productos(sku, nombre) VALUES ('H-30', 'Martillo')` agrega 1 fila y `stock` queda en `0` por su `DEFAULT`.
- **Error típico:** repetir un SKU: `UNIQUE constraint failed: productos.sku`.

**SELECT**
- **Definición técnica:** sentencia que lee datos y devuelve un conjunto de filas con las columnas pedidas, sin modificar la tabla.
- **En palabras sencillas:** la pregunta que le haces a la base; la respuesta es una tabla nueva y temporal.
- **Dónde se rompe la comparación:** sin `ORDER BY` el orden de la respuesta no está garantizado, aunque hoy salga ordenada.
- **Ejemplo:** `SELECT sku, nombre FROM productos` devuelve `[(A-10, Teclado), (A-11, Mouse), (E-20, Caja mediana), (E-21, Cinta), (S-99, Muestra)]`.
- **Error típico:** dejar una comilla sin cerrar: `WHERE nombre = 'Teclado` produce `unrecognized token: "'Teclado"`.

**WHERE**
- **Definición técnica:** cláusula que filtra las filas y conserva solo las que hacen verdadera una condición.
- **En palabras sencillas:** el colador: deja pasar las filas que cumplen la regla.
- **Dónde se rompe la comparación:** un colador no compara tipos; SQLite compara `stock = 'cuatro'` sin error y devuelve `[]`.
- **Ejemplo:** `SELECT sku FROM productos WHERE stock < 5 AND categoria_id = 1` devuelve `[(A-10)]`.
- **Error típico:** comparar con `= NULL`; para buscar vacíos se usa `IS NULL`.

**ORDER BY**
- **Definición técnica:** cláusula que ordena el resultado por una o más expresiones, ascendente (`ASC`, por defecto) o descendente (`DESC`).
- **En palabras sencillas:** pedir la respuesta ordenada, de menor a mayor o al revés.
- **Dónde se rompe la comparación:** los `NULL` también se ordenan: en SQLite van primero con `ASC` y al final con `DESC`.
- **Ejemplo:** `SELECT sku, stock FROM productos ORDER BY stock DESC LIMIT 2` devuelve `[(E-21, 40), (A-11, 12)]`.
- **Error típico:** ordenar números guardados como texto: `'12'` queda antes que `'4'`.

**JOIN (INNER JOIN)**
- **Definición técnica:** operación que combina filas de dos tablas cuando cumplen la condición `ON`; las filas sin pareja se descartan.
- **En palabras sencillas:** juntar cada producto con su categoría usando el número que comparten.
- **Dónde se rompe la comparación:** si un producto no tiene categoría, desaparece del resultado sin aviso.
- **Ejemplo:** `SELECT p.sku FROM productos p JOIN categorias c ON c.id = p.categoria_id` devuelve 4 filas; `S-99` no sale porque no tiene categoría.
- **Error típico:** usar `id` sin prefijo cuando ambas tablas lo tienen: `ambiguous column name: id`.

**LEFT JOIN**
- **Definición técnica:** combinación que conserva todas las filas de la tabla izquierda y rellena con `NULL` las columnas de la derecha cuando no hay pareja.
- **En palabras sencillas:** juntar productos con categorías sin perder los productos huérfanos.
- **Dónde se rompe la comparación:** un `WHERE` sobre la tabla derecha puede volver a esconder las filas con `NULL`.
- **Ejemplo:** `SELECT p.sku FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id WHERE c.id IS NULL` devuelve `[(S-99)]`.
- **Error típico:** filtrar `WHERE c.nombre <> 'Empaque'`: devuelve `[(A-10), (A-11)]` y pierde `S-99`, porque `NULL <> 'Empaque'` no es verdadero.

**GROUP BY**
- **Definición técnica:** cláusula que reúne las filas con el mismo valor en las columnas indicadas y produce una fila por grupo.
- **En palabras sencillas:** hacer montoncitos por categoría y luego contar o sumar cada montón.
- **Dónde se rompe la comparación:** los productos sin categoría forman su propio montón, con clave `NULL`.
- **Ejemplo:** `SELECT categoria_id, COUNT(*) FROM productos GROUP BY categoria_id` devuelve `[(null, 1), (1, 2), (2, 2)]`.
- **Error típico:** pedir una columna que no está agrupada (`sku`); SQLite no falla y devuelve un valor cualquiera del grupo.

**función de agregado**
- **Definición técnica:** función que recibe muchas filas y devuelve un solo valor: `COUNT`, `SUM`, `MIN`, `MAX`, `AVG`.
- **En palabras sencillas:** la calculadora que resume un montón en un número.
- **Dónde se rompe la comparación:** ignora los `NULL`: `COUNT(categoria_id)` no cuenta productos sin categoría.
- **Ejemplo:** `SELECT COUNT(*), SUM(stock), MIN(stock), MAX(stock), AVG(stock) FROM productos` devuelve `[(5, 60, 1, 40, 12.0)]`.
- **Error típico:** esperar `0` de un `SUM` sin filas: devuelve `NULL` (`null` en Java), como pasa con «Herramientas».

**ResultSet**
- **Definición técnica:** objeto de JDBC que entrega las filas de una consulta de una en una; `next()` avanza a la siguiente fila y devuelve `false` cuando no quedan.
- **En palabras sencillas:** un dedo que recorre el resultado fila por fila.
- **Dónde se rompe la comparación:** solo avanza: lo que ya pasó no se vuelve a leer sin ejecutar otra vez la consulta.
- **Ejemplo:** sobre `SELECT sku FROM productos`, dos `next()` seguidos dejan `getString(1)` en `A-10` y luego en `A-11`.
- **Error típico:** leer una columna sin llamar antes a `next()`: el `ResultSet` todavía no está sobre ninguna fila.

**consulta parametrizada**
- **Definición técnica:** sentencia con marcadores `?` cuyos valores se envían aparte; el motor nunca interpreta esos valores como código SQL.
- **En palabras sencillas:** un formulario con casillas: el usuario llena la casilla, pero no puede reescribir el formulario.
- **Dónde se rompe la comparación:** los marcadores sirven para valores, no para nombres de tablas o columnas.
- **Ejemplo:** `Bd.filas(conexion, "SELECT nombre FROM productos WHERE sku = ?", "E-21")` devuelve `[(Cinta)]`.
- **Error típico:** olvidar asignar el parámetro: el controlador deja el `?` en `NULL`, la consulta devuelve cero filas y no hay ningún error que avise.

**inyección SQL**
- **Definición técnica:** vulnerabilidad en la que un dato del usuario, unido como texto a la sentencia, cambia su estructura y su significado.
- **En palabras sencillas:** el usuario escribe en la casilla un pedazo de orden y la base le obedece.
- **Dónde se rompe la comparación:** no hace falta un «hacker»: un apellido con apóstrofo como O'Brien ya rompe la consulta concatenada.
- **Ejemplo:** con `sku = "x' OR '1'='1"`, la consulta concatenada devuelve todos los productos en vez de ninguno.
- **Error típico:** «limpiar» comillas a mano; la única defensa fiable es la consulta parametrizada.

**migración**
- **Definición técnica:** archivo versionado con las sentencias que llevan el esquema de una versión a la siguiente; se aplica una sola vez y queda registrado.
- **En palabras sencillas:** la receta numerada de cambios de la base: la 001 crea las tablas, la 002 agrega una columna.
- **Dónde se rompe la comparación:** una receta se puede repetir; una migración repetida falla o duplica datos, por eso se registra su versión.
- **Ejemplo:** tras aplicar `migracion_001.sql`, `PRAGMA user_version` devuelve `1` y la segunda ejecución de `Aplicar.java` la salta.
- **Error típico:** editar una migración ya aplicada en otro equipo; se escribe una migración nueva.

#### ► CÓMO FUNCIONA
Escribes `SELECT` primero, pero el motor no lo ejecuta primero. Lógicamente, la base arma las filas con `FROM` y
`JOIN`, las filtra con `WHERE` y las agrupa con `GROUP BY`. Después filtra grupos con `HAVING`, calcula las
columnas de `SELECT` y al final ordena y recorta:

```mermaid
flowchart LR
    FROM["FROM / JOIN"] --> WHERE["WHERE"] --> GROUP["GROUP BY"]
    GROUP --> HAVING["HAVING"] --> SELECT["SELECT"] --> ORDER["ORDER BY"] --> LIMIT["LIMIT"]
```

Ese orden explica dos reglas. Un alias creado en `SELECT` (como `unidades`) sirve en `ORDER BY`, pero no en
`WHERE`. Y un filtro sobre un total (`SUM(...) > 10`) va en `HAVING`, porque en `WHERE` los grupos aún no existen.

#### Problema resuelto 2.1
Responde las dos preguntas de la jefa de bodega sobre un inventario con tres categorías y cinco productos. Uno de
ellos, `S-99`, no tiene categoría.

**Razonamiento:**
1. Stock bajo: filtrar `stock < 5` y traer el nombre de la categoría con un `JOIN`.
2. Para no perder `S-99`, el `JOIN` debe ser `LEFT JOIN`; se muestra también el `JOIN` simple para comparar.
3. Unidades por categoría: partir de `categorias`, unir sus productos, agrupar por categoría y sumar `stock`.

```java
// Consultas.java — inventario de la bodega de RutaFlow
import java.sql.Connection;
import java.sql.SQLException;

Connection conexion;

void mostrar(String titulo, String sql) throws SQLException {
    IO.println("-- " + titulo);
    for (String fila : Bd.filas(conexion, sql)) {
        IO.println("   " + fila);
    }
}

void main() throws SQLException {
    conexion = Bd.abrir(":memory:");
    Bd.script(conexion, """
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
            INSERT INTO categorias(nombre) VALUES ('Periféricos'), ('Empaque'), ('Herramientas');
            INSERT INTO productos(sku, nombre, stock, categoria_id) VALUES
              ('A-10', 'Teclado', 4, 1),
              ('A-11', 'Mouse', 12, 1),
              ('E-20', 'Caja mediana', 3, 2),
              ('E-21', 'Cinta', 40, 2),
              ('S-99', 'Muestra', 1, NULL);
            """);

    mostrar("Stock bajo con su categoría (LEFT JOIN)", """
            SELECT p.sku, p.nombre, p.stock, c.nombre AS categoria
            FROM productos AS p
            LEFT JOIN categorias AS c ON c.id = p.categoria_id
            WHERE p.stock < 5
            ORDER BY p.stock ASC""");

    mostrar("Stock bajo solo con categoría (JOIN)", """
            SELECT p.sku, c.nombre
            FROM productos AS p
            JOIN categorias AS c ON c.id = p.categoria_id
            WHERE p.stock < 5
            ORDER BY p.sku""");

    mostrar("Unidades por categoría (GROUP BY)", """
            SELECT c.nombre, COUNT(p.id) AS productos, SUM(p.stock) AS unidades
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id
            GROUP BY c.id, c.nombre
            ORDER BY unidades DESC""");
    conexion.close();
}
```

```text
$ javasql Consultas.java
-- Stock bajo con su categoría (LEFT JOIN)
   (S-99, Muestra, 1, null)
   (E-20, Caja mediana, 3, Empaque)
   (A-10, Teclado, 4, Periféricos)
-- Stock bajo solo con categoría (JOIN)
   (A-10, Periféricos)
   (E-20, Empaque)
-- Unidades por categoría (GROUP BY)
   (Empaque, 2, 43)
   (Periféricos, 2, 16)
   (Herramientas, 0, null)
```

**Explicación por partes.**
- Líneas 7–12: `mostrar` ejecuta la consulta con `Bd.filas` y recorre todas sus filas.
- Líneas 16–29: el esquema de la bodega; la línea 24 da `stock` por defecto 0 y prohíbe negativos.
- Líneas 30–36: los datos de prueba; la línea 36 inserta `S-99` con `categoria_id` en `NULL`.
- Líneas 39–44: `LEFT JOIN` conserva `S-99` con categoría `null`; `ORDER BY` pone primero el stock más bajo.
- Líneas 46–51: el `JOIN` simple descarta `S-99`: solo salen dos productos.
- Líneas 53–58: «Herramientas» no tiene productos: `COUNT` da `0` y `SUM` da `null`, que `DESC` deja al final.

> **Error común.** Escribir `SELECT id, nombre FROM productos p JOIN categorias c ON c.id = p.categoria_id`.
> SQLite responde `ambiguous column name: id` (dentro de una `SQLiteException`), porque las dos tablas tienen `id`.
> Prefija cada columna con su alias: `p.id`, `c.nombre`.

> **Buena práctica.** Da un alias corto a cada tabla (`productos AS p`) y escribe cada cláusula en su propia
> línea. Una consulta de reporte se lee como un párrafo y se revisa cláusula por cláusula.

#### Problema resuelto 2.2
La búsqueda por SKU recibe el texto `x' OR '1'='1`. Compara la consulta armada con `+` y la parametrizada.

**Razonamiento:**
1. Con `+`, el texto del usuario se pega dentro de las comillas y cierra la comilla antes de tiempo.
2. La sentencia resultante es `... WHERE sku = 'x' OR '1'='1'`, y `'1'='1'` siempre es verdadero.
3. Con `?`, el texto completo es un valor: se busca un SKU que se llame literalmente así.

```java
// Inyeccion.java — texto concatenado contra consulta parametrizada
import java.sql.Connection;
import java.sql.SQLException;

void main() throws SQLException {
    try (Connection conexion = Bd.abrir(":memory:")) {
        Bd.script(conexion, "CREATE TABLE productos (sku TEXT, nombre TEXT)");
        Bd.ejecutar(conexion, "INSERT INTO productos VALUES (?, ?)", "A-1", "lápiz");
        Bd.ejecutar(conexion, "INSERT INTO productos VALUES (?, ?)", "B-2", "regla");
        String sku = "x' OR '1'='1";  // entrada maliciosa escrita en un formulario

        // Incorrecto: el texto del usuario se vuelve parte del SQL
        IO.println("concatenando: " + Bd.filas(conexion, "SELECT * FROM productos WHERE sku = '" + sku + "'"));

        // Correcto: el controlador envía el SQL y el dato por separado
        IO.println("parametrizado: " + Bd.filas(conexion, "SELECT * FROM productos WHERE sku = ?", sku));
    }
}
```

```text
$ javasql Inyeccion.java
concatenando: [(A-1, lápiz), (B-2, regla)]
parametrizado: []
```

**Explicación por partes.**
- Líneas 8–9: los dos `INSERT` también son parametrizados: cada valor va a su `?`.
- Línea 13: la concatenación con `+` entrega toda la tabla a quien no conocía ningún SKU.
- Línea 16: el marcador `?` recibe el texto completo como valor y devuelve `[]`: ningún producto tiene ese SKU.

> **Error común.** Crear el `PreparedStatement` y olvidar el `setObject` (o `setString`). No hay excepción: el
> controlador deja el `?` en `NULL`, `sku = NULL` nunca es verdadero y la búsqueda devuelve `[]` aunque el SKU exista.
> Cuenta los `?` de la sentencia y los valores que pasas.

> **Prevenir errores.** Busca en tu proyecto `executeQuery(` o `executeUpdate(` con un `+` dentro. Cada coincidencia
> con datos externos es una inyección esperando un usuario creativo.

#### Checkpoint 2.1
En el Problema resuelto 2.1, ¿qué devuelve la tercera consulta si cambias `LEFT JOIN` por `JOIN`?

Respuesta: desaparece la fila de «Herramientas», porque no tiene productos con los que emparejarse. Quedan
`('Empaque', 2, 43)` y `('Periféricos', 2, 16)`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Trabaja en la carpeta del módulo:

```bash
cd ~/labs/sql
```

#### Paso 2 · Escribe la migración
Guarda el esquema en un archivo versionado. `PRAGMA user_version` es un número que SQLite guarda en la base: lo
usarás como versión del esquema.

```sql
-- migracion_001.sql — esquema inicial del inventario
CREATE TABLE categorias (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);
CREATE TABLE productos (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria_id INTEGER REFERENCES categorias(id)
);
PRAGMA user_version = 1;
```

#### Paso 3 · Aplica la migración una sola vez
El programa lee la versión, aplica el archivo si hace falta y lista las tablas. Ejecútalo dos veces:

```java
// Aplicar.java — aplica la migración 001 a inventario.db una sola vez
import java.sql.Connection;
import java.sql.SQLException;

void main() throws Exception {
    try (Connection conexion = Bd.abrir("inventario.db")) {
        int version = (Integer) Bd.valor(conexion, "PRAGMA user_version");
        if (version >= 1) {
            IO.println("migración 001 ya aplicada; versión " + version);
        } else {
            Bd.script(conexion, Files.readString(Path.of("migracion_001.sql")));
            IO.println("migración 001 aplicada; versión " + Bd.valor(conexion, "PRAGMA user_version"));
        }
        IO.println("tablas: " + Bd.filas(conexion, "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"));
    }
}
```

```text
$ javasql Aplicar.java
migración 001 aplicada; versión 1
tablas: [(categorias), (productos)]
$ javasql Aplicar.java
migración 001 ya aplicada; versión 1
tablas: [(categorias), (productos)]
```

La segunda ejecución no vuelve a crear las tablas: por eso no aparece `table categorias already exists`.

#### Paso 4 · Consulta y defiende la búsqueda
Ejecuta `Consultas.java` e `Inyeccion.java` y compara tus salidas con las de los problemas resueltos. Luego cambia la
línea 13 de `Inyeccion.java` por una consulta parametrizada y confirma que la salida `concatenando:` queda en `[]`.

#### Resumen
- `CREATE TABLE` define la estructura; `INSERT` agrega filas; una **migración** versionada aplica esos cambios una sola vez.
- `SELECT` lee; `WHERE` filtra filas; `ORDER BY` ordena; el motor los evalúa en un orden lógico distinto al escrito.
- `JOIN` descarta filas sin pareja; `LEFT JOIN` las conserva con `NULL`.
- `GROUP BY` forma grupos y cada **función de agregado** resume un grupo en un valor.
- Un **ResultSet** entrega las filas una a una con `next()`.
- La **consulta parametrizada** (`?` más `setObject`) es la defensa contra la **inyección SQL**.

#### Ejercicio verificable 1
Básico. Sobre la base de `Consultas.java`, pide los dos productos con más stock, de mayor a menor.

Respuesta esperada: `SELECT sku, stock FROM productos ORDER BY stock DESC LIMIT 2` devuelve `[(E-21, 40), (A-11, 12)]`.

#### Ejercicio verificable 2
Intermedio. Escribe una consulta que liste los productos sin categoría usando `LEFT JOIN`.

Respuesta esperada: `SELECT p.sku FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id WHERE c.id IS NULL`
devuelve `[(S-99)]`.

#### Ejercicio verificable 3
Reto. Escribe una búsqueda por parte del nombre que reciba el texto del usuario de forma segura. Pruébala con
`"ca"`.

Respuesta esperada: `Bd.filas(conexion, "SELECT sku, nombre FROM productos WHERE nombre LIKE ? ORDER BY sku", "%" + texto + "%")`
con `texto = "ca"` devuelve `[(E-20, Caja mediana)]`. Los `%` van dentro del valor, nunca pegados al SQL.

#### En el trabajo
En un backend, cada pantalla de listado es un `SELECT` con `JOIN` y cada formulario termina en un `INSERT`
parametrizado. Las migraciones viven en el repositorio junto al código y una herramienta (Flyway, Liquibase)
las aplica en orden en cada ambiente. La inyección SQL sigue en el OWASP Top 10: los revisores de código
rechazan cualquier sentencia armada con texto concatenado.

</details>

### Tema 3: Índices, restricciones y planes de consulta · Intermedio · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- declarar restricciones `NOT NULL`, `UNIQUE`, `CHECK` y `DEFAULT` y leer el error literal de cada una;
- crear un índice y comprobar con `EXPLAIN QUERY PLAN` el paso de `SCAN` a `SEARCH`;
- elegir el orden de las columnas de un índice compuesto según las consultas;
- medir el costo que cada índice agrega a las escrituras.

**Conceptos clave:** restricción, NOT NULL, UNIQUE, CHECK, DEFAULT, índice, EXPLAIN QUERY PLAN, SCAN y SEARCH, índice compuesto, selectividad

#### El problema
La tabla de tareas de RutaFlow ya tiene 10 000 filas y la pantalla «pendientes» tarda cada día más. Al mismo
tiempo, alguien cargó un producto sin nombre y otro con stock negativo. ¿Cómo se consigue que la base rechace los
datos imposibles y que encuentre rápido las 100 tareas pendientes entre 10 000?

#### Glosario del tema

**restricción**
- **Definición técnica:** regla declarada en el esquema que el motor verifica en cada `INSERT` y `UPDATE`; si se viola, la sentencia falla con `IntegrityError`.
- **En palabras sencillas:** un portero en la puerta de la tabla que revisa cada dato antes de dejarlo entrar.
- **Dónde se rompe la comparación:** el portero solo revisa lo que le dijiste; las reglas no declaradas no existen para él.
- **Ejemplo:** en `Restricciones.java`, tres intentos inválidos fallan y `SELECT * FROM productos` sigue devolviendo solo `[(1, A-10, Teclado, 0)]`.
- **Error típico:** validar solo en Java; otro programa que escriba en la misma base se salta esa validación.

**NOT NULL**
- **Definición técnica:** restricción de columna que prohíbe el valor `NULL` (ausencia de valor).
- **En palabras sencillas:** «este dato es obligatorio».
- **Dónde se rompe la comparación:** un texto vacío `''` no es `NULL`; `NOT NULL` lo deja pasar.
- **Ejemplo:** `INSERT INTO productos(sku) VALUES ('A-11')` produce `NOT NULL constraint failed: productos.nombre`.
- **Error típico:** agregar después una columna obligatoria sin valor por defecto: `Cannot add a NOT NULL column with default value NULL`.

**UNIQUE**
- **Definición técnica:** restricción que impide que dos filas tengan el mismo valor en una columna o combinación de columnas; el motor crea un índice para comprobarla.
- **En palabras sencillas:** «no puede haber dos iguales».
- **Dónde se rompe la comparación:** distingue mayúsculas (`'a@x.co'` y `'A@x.co'` entran ambos) y admite varios `NULL`.
- **Ejemplo:** repetir `'A-10'` produce `UNIQUE constraint failed: productos.sku`.
- **Error típico:** comprobar en Java si el SKU existe y luego insertarlo: dos usuarios a la vez pasan la comprobación.

**CHECK**
- **Definición técnica:** restricción con una condición booleana que cada fila debe cumplir.
- **En palabras sencillas:** una regla de negocio escrita dentro de la tabla, como «el stock no baja de cero».
- **Dónde se rompe la comparación:** si la condición da `NULL`, el `CHECK` la acepta; combínalo con `NOT NULL`.
- **Ejemplo:** `UPDATE productos SET stock = -3 WHERE sku = 'A-10'` produce `CHECK constraint failed: stock >= 0`.
- **Error típico:** declarar `CHECK (stock >= 0)` sin `NOT NULL`: un `INSERT` con `stock` en `NULL` se acepta.

**DEFAULT**
- **Definición técnica:** valor que el motor asigna a una columna cuando el `INSERT` no la menciona.
- **En palabras sencillas:** el valor de fábrica que se usa si no dices nada.
- **Dónde se rompe la comparación:** si escribes `NULL` a propósito, el `DEFAULT` no se aplica.
- **Ejemplo:** `INSERT INTO productos(sku, nombre) VALUES ('A-10', 'Teclado')` guarda `stock` en `0`.
- **Error típico:** usar `DEFAULT` para tapar un dato que debía ser obligatorio.

**índice**
- **Definición técnica:** estructura auxiliar ordenada (un árbol B en SQLite) que asocia valores de una o más columnas con la ubicación de sus filas.
- **En palabras sencillas:** el índice alfabético al final de un libro: vas directo a la página sin leerlo entero.
- **Dónde se rompe la comparación:** el libro no cambia; la tabla sí, y cada cambio obliga a actualizar el índice.
- **Ejemplo:** tras `CREATE INDEX idx_tareas_estado ON tareas(estado)`, `SELECT name, tbl_name FROM sqlite_master WHERE type = 'index'` devuelve `[(idx_tareas_estado, tareas)]`.
- **Error típico:** crearlo dos veces: `index idx_tareas_estado already exists`; usa `CREATE INDEX IF NOT EXISTS` en migraciones.

**EXPLAIN QUERY PLAN**
- **Definición técnica:** prefijo que hace que SQLite no ejecute la consulta y devuelva, en cambio, el plan que usaría para resolverla.
- **En palabras sencillas:** preguntarle a la base «¿cómo vas a buscar esto?» antes de que lo busque.
- **Dónde se rompe la comparación:** el plan describe la estrategia, no mide el tiempo; para medir hay que ejecutar.
- **Ejemplo:** `EXPLAIN QUERY PLAN SELECT titulo FROM tareas WHERE id = 7` devuelve `SEARCH tareas USING INTEGER PRIMARY KEY (rowid=?)` en su cuarta columna, `detail`.
- **Error típico:** imprimir la fila completa, `(2, 0, 0, SEARCH …)`, en vez de leer solo la columna `detail`, que es la que trae el texto del plan.

**SCAN y SEARCH**
- **Definición técnica:** `SCAN` significa recorrer todas las filas de la tabla. `SEARCH` significa llegar a las filas pedidas por un índice o por la clave primaria.
- **En palabras sencillas:** leer el libro entero contra ir al índice y saltar a la página.
- **Dónde se rompe la comparación:** en tablas pequeñas un `SCAN` es tan rápido que no importa.
- **Ejemplo:** `WHERE lower(estado) = 'pendiente'` da `SCAN tareas` aunque exista `idx_tareas_estado`, porque el índice guarda `estado`, no `lower(estado)`.
- **Error típico:** crear el índice y no comprobar el plan: una función sobre la columna lo deja sin uso.

**índice compuesto**
- **Definición técnica:** índice sobre varias columnas, ordenado primero por la primera, luego por la segunda dentro de cada valor de la primera, y así sucesivamente.
- **En palabras sencillas:** una guía telefónica: ordenada por apellido y, dentro de cada apellido, por nombre.
- **Dónde se rompe la comparación:** buscar solo por nombre en la guía obliga a leerla entera; igual pasa con la segunda columna.
- **Ejemplo:** con `(categoria_id, stock)`, `WHERE categoria_id = 2 AND stock < 5` usa el índice, pero `WHERE stock < 5` da `SCAN productos`.
- **Error típico:** elegir el orden de las columnas al azar en vez de mirar qué filtran las consultas reales.

**selectividad**
- **Definición técnica:** proporción de filas que devuelve un filtro; un filtro muy selectivo devuelve una fracción pequeña de la tabla.
- **En palabras sencillas:** cuánto descarta el colador: cuanto menos deja pasar, más ayuda el índice.
- **Dónde se rompe la comparación:** la selectividad depende del valor buscado: «pendiente» es raro y «completada» es casi todo.
- **Ejemplo:** `SELECT estado, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tareas) FROM tareas GROUP BY estado` devuelve `[(completada, 99.0), (pendiente, 1.0)]`.
- **Error típico:** indexar una columna con dos valores repartidos a medias: el índice casi nunca ahorra lecturas.

#### ► CÓMO FUNCIONA
Sin índice, para encontrar las tareas pendientes la base lee las 10 000 filas una por una. Con un índice sobre
`estado`, baja por un árbol ordenado desde la raíz hasta el rango donde empiezan las pendientes y solo lee esas
filas:

```mermaid
flowchart LR
    subgraph SCAN["Sin índice"]
      S1["fila 1"] --> S2["fila 2"] --> SN["fila N"]
    end
    subgraph SEARCH["Con índice"]
      ROOT["raíz"] --> BRANCH["rama"] --> RANGE["rango de filas"]
    end
```

El índice no es gratis. Ocupa espacio y cada `INSERT`, `UPDATE` o `DELETE` debe actualizarlo. Las restricciones
`UNIQUE` y `PRIMARY KEY` crean su propio índice automático: por eso buscar por SKU ya es un `SEARCH`.

#### Problema resuelto 3.1
Declara las reglas del producto en la tabla e intenta tres cargas inválidas: sin nombre, con SKU repetido y con
stock negativo.

**Razonamiento:**
1. Cada regla de negocio se traduce en una restricción: nombre obligatorio, SKU único, stock no negativo.
2. Cada intento va en su propio `try` para ver el mensaje exacto de cada violación.
3. Al final se consulta la tabla: solo debe quedar la fila válida.

```java
// Restricciones.java — la base rechaza datos que rompen las reglas
import java.sql.Connection;
import java.sql.SQLException;

void main() throws SQLException {
    try (Connection conexion = Bd.abrir(":memory:")) {
        Bd.script(conexion, """
                CREATE TABLE productos (
                  id INTEGER PRIMARY KEY,
                  sku TEXT NOT NULL UNIQUE,
                  nombre TEXT NOT NULL,
                  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
                )""");
        Bd.ejecutar(conexion, "INSERT INTO productos(sku, nombre) VALUES ('A-10', 'Teclado')");

        Map<String, String> intentos = new LinkedHashMap<>();
        intentos.put("sin nombre", "INSERT INTO productos(sku) VALUES ('A-11')");
        intentos.put("sku repetido", "INSERT INTO productos(sku, nombre) VALUES ('A-10', 'Otro teclado')");
        intentos.put("stock negativo", "UPDATE productos SET stock = -3 WHERE sku = 'A-10'");
        for (var intento : intentos.entrySet()) {
            try {
                Bd.ejecutar(conexion, intento.getValue());
                IO.println(intento.getKey() + ": aceptado");
            } catch (SQLException error) {
                IO.println(intento.getKey() + ": rechazado -> " + Bd.error(error));
            }
        }
        IO.println("filas guardadas: " + Bd.filas(conexion, "SELECT * FROM productos"));
    }
}
```

```text
$ javasql Restricciones.java
sin nombre: rechazado -> NOT NULL constraint failed: productos.nombre
sku repetido: rechazado -> UNIQUE constraint failed: productos.sku
stock negativo: rechazado -> CHECK constraint failed: stock >= 0
filas guardadas: [(1, A-10, Teclado, 0)]
```

**Explicación por partes.**
- Líneas 10–12: cada restricción se escribe junto a su columna; la línea 12 combina `NOT NULL`, `DEFAULT` y `CHECK`.
- Línea 14: el primer producto no menciona `stock`, así que el `DEFAULT` lo deja en `0`.
- Líneas 16–19: un `LinkedHashMap` guarda cada motivo con la sentencia que lo provoca, en orden.
- Líneas 20–27: cada mensaje dice qué restricción falló y en qué columna, sin que escribas un solo `if`.

> **Error común.** Confiar en `CHECK` para datos ausentes. `INSERT INTO p(sku, stock) VALUES ('A-2', NULL)` en una
> tabla con `CHECK (stock >= 0)` y sin `NOT NULL` se acepta y guarda `null`. La comparación con `NULL` da `NULL`, y
> `CHECK` solo rechaza lo que da falso.

> **Buena práctica.** Declara las reglas en la base **y** valida en el programa. La base es la última línea de
> defensa; el programa da mensajes amables al usuario.

#### Problema resuelto 3.2
Mide cómo cambia el plan de la consulta de tareas pendientes al crear un índice sobre `estado`.

**Razonamiento:**
1. Crear 10 000 tareas donde solo 1 de cada 100 está pendiente: un filtro muy selectivo.
2. Pedir el plan con `EXPLAIN QUERY PLAN` antes y después del índice y leer su columna `detail`.
3. Insertar las 10 000 filas en lote (`addBatch`) dentro de una sola transacción: fila por fila con autocommit, cada
   `INSERT` sería una escritura a disco.
4. `ANALYZE` guarda estadísticas de la tabla para que el planificador decida con datos.

```java
// Indice.java — plan de consulta antes y después de crear un índice
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

Connection conexion;

void mostrarPlan(String etiqueta) throws SQLException {
    IO.println(etiqueta);
    try (var plan = Bd.preparar(conexion, "EXPLAIN QUERY PLAN SELECT titulo FROM tareas WHERE estado = ?", "pendiente");
         ResultSet pasos = plan.executeQuery()) {
        while (pasos.next()) {
            IO.println("  " + pasos.getString("detail"));   // la columna con el texto del paso
        }
    }
}

void main() throws SQLException {
    conexion = Bd.abrir(":memory:");
    Bd.script(conexion, "CREATE TABLE tareas (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, estado TEXT NOT NULL)");
    conexion.setAutoCommit(false);                            // 10 000 INSERT en una sola transacción
    try (var insertar = conexion.prepareStatement("INSERT INTO tareas(titulo, estado) VALUES (?, ?)")) {
        for (int numero = 0; numero < 10_000; numero++) {
            insertar.setString(1, "Tarea " + numero);
            insertar.setString(2, numero % 100 == 0 ? "pendiente" : "completada");
            insertar.addBatch();
        }
        insertar.executeBatch();
    }
    conexion.commit();
    conexion.setAutoCommit(true);

    mostrarPlan("Antes del índice:");
    Bd.script(conexion, "CREATE INDEX idx_tareas_estado ON tareas(estado)");
    Bd.script(conexion, "ANALYZE");
    mostrarPlan("Después del índice:");
    IO.println("pendientes: " + Bd.valor(conexion, "SELECT COUNT(*) FROM tareas WHERE estado = 'pendiente'") + " de 10000");
    conexion.close();
}
```

```text
$ javasql Indice.java
Antes del índice:
  SCAN tareas
Después del índice:
  SEARCH tareas USING INDEX idx_tareas_estado (estado=?)
pendientes: 100 de 10000
```

**Explicación por partes.**
- Líneas 8–16: `mostrarPlan` imprime la columna `detail` de cada paso del plan.
- Líneas 21–31: `setAutoCommit(false)` abre una transacción; `addBatch` acumula los 10 000 `INSERT` y `executeBatch`
  los envía juntos. Cada número múltiplo de 100 es «pendiente».
- Línea 33: sin índice, el plan es `SCAN tareas`: lectura completa.
- Líneas 34–36: con el índice, el plan es `SEARCH ... USING INDEX idx_tareas_estado (estado=?)`.
- Línea 37: el filtro devuelve 100 filas de 10 000, una selectividad del 1 %.

Ahora comprueba el orden de un índice compuesto con cuatro consultas:

```java
// Compuesto.java — el orden de las columnas en un índice compuesto
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

String primerPaso(Connection conexion, String sql) throws SQLException {
    try (var plan = conexion.createStatement(); ResultSet pasos = plan.executeQuery("EXPLAIN QUERY PLAN " + sql)) {
        pasos.next();
        return pasos.getString("detail");
    }
}

void main() throws SQLException {
    try (Connection conexion = Bd.abrir(":memory:")) {
        Bd.script(conexion, """
                CREATE TABLE productos (
                  id INTEGER PRIMARY KEY,
                  sku TEXT NOT NULL UNIQUE,
                  stock INTEGER NOT NULL,
                  categoria_id INTEGER NOT NULL
                );
                CREATE INDEX idx_productos_categoria_stock ON productos(categoria_id, stock);
                """);
        List<String> consultas = List.of(
                "SELECT sku FROM productos WHERE categoria_id = 2 AND stock < 5",
                "SELECT sku FROM productos WHERE categoria_id = 2",
                "SELECT sku FROM productos WHERE stock < 5",
                "SELECT stock FROM productos WHERE sku = 'A-10'");
        for (String sql : consultas) {
            IO.println(sql);
            IO.println("  -> " + primerPaso(conexion, sql));
        }
    }
}
```

```text
$ javasql Compuesto.java
SELECT sku FROM productos WHERE categoria_id = 2 AND stock < 5
  -> SEARCH productos USING INDEX idx_productos_categoria_stock (categoria_id=? AND stock<?)
SELECT sku FROM productos WHERE categoria_id = 2
  -> SEARCH productos USING INDEX idx_productos_categoria_stock (categoria_id=?)
SELECT sku FROM productos WHERE stock < 5
  -> SCAN productos
SELECT stock FROM productos WHERE sku = 'A-10'
  -> SEARCH productos USING INDEX sqlite_autoindex_productos_1 (sku=?)
```

La tercera consulta filtra solo por `stock`, la segunda columna del índice: el plan vuelve a `SCAN`. La cuarta usa
`sqlite_autoindex_productos_1`, el índice que SQLite creó solo por el `UNIQUE` de `sku`.

Cada índice se actualiza en cada escritura. Este programa inserta 200 000 filas con 0, 1 y 3 índices y mide el
tiempo. Antes hace una medición de calentamiento que no muestra, para que la primera cifra no incluya el arranque de
Java:

```java
// CostoIndices.java — cada índice extra se actualiza en cada INSERT
import java.sql.Connection;
import java.sql.SQLException;

double medirInsercion(int cantidadIndices) throws SQLException {
    try (Connection conexion = Bd.abrir(":memory:")) {
        Bd.script(conexion, "CREATE TABLE envios (id INTEGER PRIMARY KEY, guia TEXT, zona TEXT, kilos REAL)");
        for (String columna : List.of("guia", "zona", "kilos").subList(0, cantidadIndices)) {
            Bd.script(conexion, "CREATE INDEX idx_" + columna + " ON envios(" + columna + ")");
        }
        conexion.setAutoCommit(false);
        long inicio = System.nanoTime();
        try (var insertar = conexion.prepareStatement("INSERT INTO envios(guia, zona, kilos) VALUES (?, ?, ?)")) {
            for (int n = 0; n < 200_000; n++) {
                insertar.setString(1, "RF-" + n);
                insertar.setString(2, "Z" + n % 7);
                insertar.setDouble(3, n % 30 + 0.5);
                insertar.addBatch();
            }
            insertar.executeBatch();
        }
        conexion.commit();
        return (System.nanoTime() - inicio) / 1e9;
    }
}

void main() throws SQLException {
    medirInsercion(0);                                   // calentamiento: no se mide
    for (int indices : List.of(0, 1, 3)) {
        IO.println(String.format(Locale.ROOT, "%d índices: %.2f s para 200000 filas", indices, medirInsercion(indices)));
    }
}
```

```text
$ javasql CostoIndices.java
0 índices: 0.29 s para 200000 filas
1 índices: 0.34 s para 200000 filas
3 índices: 0.72 s para 200000 filas
```

> **Rendimiento.** En esta ejecución, tres índices llevaron la inserción de 0.29 s a 0.72 s. Tus números
> cambiarán según la máquina, pero la proporción se repite: crea solo los índices que alguna consulta usa.

#### Checkpoint 3.1
En `Indice.java`, ¿qué plan obtienes si la consulta fuera `WHERE titulo = 'Tarea 5'`?

Respuesta: `SCAN tareas`. El índice está sobre `estado`, no sobre `titulo`; para esa búsqueda haría falta
`CREATE INDEX idx_tareas_titulo ON tareas(titulo)`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Trabaja en la carpeta del módulo:

```bash
cd ~/labs/sql
```

#### Paso 2 · Provoca cada restricción
Guarda y ejecuta `Restricciones.java`. Debes ver tres líneas `rechazado` con los mensajes `NOT NULL`, `UNIQUE` y
`CHECK`, y una sola fila guardada.

#### Paso 3 · Compara los planes
Guarda `Indice.java` y ejecútalo con `javasql Indice.java`. Confirma el paso de `SCAN tareas` a
`SEARCH tareas USING INDEX idx_tareas_estado (estado=?)`.

#### Paso 4 · Prueba el orden del índice compuesto
Ejecuta `Compuesto.java`. Después agrega `CREATE INDEX idx_productos_stock ON productos(stock);` al final del script y
vuelve a ejecutarlo: la tercera consulta debe cambiar a `SEARCH`.

#### Paso 5 · Mide el costo
Ejecuta `CostoIndices.java` dos veces y anota los tiempos. Comprueba que el orden se mantiene: 0 índices es lo más
rápido y 3 índices lo más lento.

#### Resumen
- Una **restricción** hace que la base rechace datos inválidos con una `SQLException` y un mensaje literal.
- `NOT NULL` exige valor; `UNIQUE` prohíbe repetidos; `CHECK` exige una condición; `DEFAULT` rellena lo omitido.
- Un **índice** acelera búsquedas y cuesta en escrituras y espacio.
- `EXPLAIN QUERY PLAN` muestra si la consulta hace **SCAN** (todo) o **SEARCH** (por índice).
- En un **índice compuesto** importa el orden: sirve para filtrar por la primera columna, sola o con las siguientes.
- La **selectividad** indica cuánto ayuda un índice: cuanto menos filas devuelve el filtro, mejor.

#### Ejercicio verificable 1
Básico. Sobre la tabla de `Restricciones.java`, intenta `INSERT INTO productos(sku, nombre, stock) VALUES ('A-12', 'Mouse', -1)`.

Respuesta esperada: `SQLiteException: [SQLITE_CONSTRAINT_CHECK] A CHECK constraint failed (CHECK constraint failed: stock >= 0)`.

#### Ejercicio verificable 2
Intermedio. En una tabla `tareas` vacía con la estructura de `Indice.java`, pide el plan de
`SELECT estado FROM tareas WHERE titulo = 'Tarea 5'`, crea `idx_tareas_titulo` y pídelo otra vez.

Respuesta esperada: primero `SCAN tareas`; después `SEARCH tareas USING INDEX idx_tareas_titulo (titulo=?)`.

#### Ejercicio verificable 3
Reto. En `Compuesto.java`, logra que `WHERE stock < 5` use un índice sin borrar el compuesto. ¿Qué plan obtienes?

Respuesta esperada: con `CREATE INDEX idx_productos_stock ON productos(stock)`, el plan es
`SEARCH productos USING INDEX idx_productos_stock (stock<?)`. Ahora cada escritura actualiza un índice más.

#### En el trabajo
En una empresa, la consulta lenta se diagnostica con el plan, no con intuición: `EXPLAIN` en SQLite, `EXPLAIN
ANALYZE` en PostgreSQL. Los equipos revisan los índices en cada migración y borran los que ninguna consulta usa,
porque frenan las escrituras. Las restricciones evitan los incidentes más caros: datos imposibles que ya se
facturaron o se despacharon.

</details>

### Tema 4: Transacciones, concurrencia y elección SQL/NoSQL · Intermedio · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- agrupar varias escrituras en una transacción con `BEGIN`, `COMMIT` y `ROLLBACK`;
- demostrar que un fallo a mitad de camino deja la base exactamente como estaba;
- reproducir el error `database is locked` cuando dos conexiones escriben a la vez;
- decidir con criterios concretos cuándo un dato va en tablas y cuándo en un documento.

**Conceptos clave:** transacción, BEGIN, COMMIT, ROLLBACK, atomicidad, ACID, modo autocommit, concurrencia, bloqueo, NoSQL

#### El problema
RutaFlow traslada mercancía entre la bodega Norte y la Sur. Un traslado son dos escrituras: restar en el origen y
sumar en el destino. Si el programa falla entre las dos, desaparecen unidades. Y si dos cajeros mueven el mismo
producto a la vez, ¿quién gana? Necesitas que las dos escrituras ocurran juntas o no ocurran.

#### Glosario del tema

**transacción**
- **Definición técnica:** unidad de trabajo formada por una o más sentencias que la base aplica completa o descarta completa.
- **En palabras sencillas:** un paquete de cambios con la regla «todo o nada».
- **Dónde se rompe la comparación:** mientras no confirmas, los otros usuarios siguen viendo los datos viejos.
- **Ejemplo:** en `MoverStock.java`, el traslado fallido hacia el destino 99 deja `[(1, Norte, 6), (2, Sur, 4)]`, igual que antes.
- **Error típico:** hacer cada `UPDATE` por separado: si el segundo falla, el primero ya quedó guardado.

**BEGIN**
- **Definición técnica:** sentencia que abre una transacción explícita; los cambios siguientes quedan pendientes hasta `COMMIT` o `ROLLBACK`.
- **En palabras sencillas:** «a partir de aquí, nada es definitivo».
- **Dónde se rompe la comparación:** no se pueden anidar: dentro de una transacción no puedes abrir otra.
- **Ejemplo:** en SQL se escribe `BEGIN`; en JDBC, `conexion.setAutoCommit(false)` abre la transacción por ti.
- **Error típico:** ejecutar `BEGIN` dos veces: `cannot start a transaction within a transaction`.

**COMMIT**
- **Definición técnica:** sentencia que confirma la transacción: sus cambios se vuelven permanentes y visibles para las demás conexiones.
- **En palabras sencillas:** firmar el paquete de cambios.
- **Dónde se rompe la comparación:** una firma se puede impugnar; un `COMMIT` no se deshace, solo se corrige con otra transacción.
- **Ejemplo:** `BEGIN`, `UPDATE productos SET stock = 8 WHERE id = 2`, `COMMIT` y luego `SELECT stock FROM productos WHERE id = 2` devuelve `[(8)]`.
- **Error típico:** `COMMIT` sin transacción abierta: `cannot commit - no transaction is active`.

**ROLLBACK**
- **Definición técnica:** sentencia que descarta todos los cambios de la transacción abierta y devuelve la base al estado anterior a `BEGIN`.
- **En palabras sencillas:** romper el paquete sin abrirlo.
- **Dónde se rompe la comparación:** solo deshace lo que hizo la base; un correo enviado desde Java ya salió.
- **Ejemplo:** `BEGIN`, `UPDATE productos SET stock = 0 WHERE id = 1` muestra `0`; tras `ROLLBACK` vuelve a `7`.
- **Error típico:** atrapar la excepción y no ejecutar `ROLLBACK`: la transacción queda abierta y bloquea a los demás.

**atomicidad**
- **Definición técnica:** propiedad por la cual una transacción no puede quedar aplicada en parte: o se ven todos sus efectos o ninguno.
- **En palabras sencillas:** el traslado no se puede partir en dos mitades.
- **Dónde se rompe la comparación:** «átomo» suena a indivisible; por dentro la transacción sí tiene pasos, pero nadie ve los intermedios.
- **Ejemplo:** sin transacción, restar 3 en Norte y sumar en el destino 99 (`0` filas afectadas) deja el stock total en `7`. Se perdieron 3 unidades.
- **Error típico:** comprobar el resultado solo al final; el daño ya ocurrió en el primer `UPDATE`.

**ACID**
- **Definición técnica:** las cuatro garantías de una transacción: Atomicidad, Consistencia (respeta las restricciones), Aislamiento (no ve trabajo a medias) y Durabilidad (lo confirmado sobrevive a un corte).
- **En palabras sencillas:** la promesa completa de la base: todo o nada, sin romper reglas, sin mirar a medias, sin olvidar.
- **Dónde se rompe la comparación:** el aislamiento tiene niveles; no todos los motores aíslan igual por defecto.
- **Ejemplo:** consistencia: `UPDATE productos SET stock = stock - 100 WHERE id = 1` produce `CHECK constraint failed: stock >= 0`; durabilidad: tras `COMMIT`, cerrar y reabrir `d.db`, `SELECT COUNT(*)` devuelve `[(1)]`.
- **Error típico:** creer que ACID protege la lógica del programa; si restas mal, la base guarda fielmente un dato malo.

**modo autocommit**
- **Definición técnica:** modo de una conexión JDBC, activo por defecto, en el que cada sentencia se confirma sola; `setAutoCommit(false)` lo apaga para agrupar sentencias en una transacción.
- **En palabras sencillas:** cada envío sale solo, salvo que pidas armar un paquete.
- **Dónde se rompe la comparación:** volver a `setAutoCommit(true)` con una transacción abierta la confirma sin preguntar.
- **Ejemplo:** una conexión JDBC nueva está en autocommit: `conexion.getAutoCommit()` devuelve `true` y cada sentencia se confirma sola.
- **Error típico:** llamar `conexion.commit()` en ese modo: el controlador responde `database in auto-commit mode`.

**concurrencia**
- **Definición técnica:** situación en la que varias conexiones o procesos acceden a los mismos datos en intervalos de tiempo que se solapan.
- **En palabras sencillas:** dos cajeros tocando el mismo producto al mismo tiempo.
- **Dónde se rompe la comparación:** «al mismo tiempo» no exige dos procesadores; basta con que una transacción empiece antes de que otra termine.
- **Ejemplo:** en `Bloqueo.java`, B lee `10` mientras A ya restó 3 pero aún no confirma.
- **Error típico:** probar solo con un usuario y descubrir los choques en producción.

**bloqueo**
- **Definición técnica:** mecanismo con el que el motor reserva un recurso para una transacción; SQLite permite un solo escritor a la vez en todo el archivo.
- **En palabras sencillas:** el turno para escribir: mientras A lo tiene, B espera o recibe un «ocupado».
- **Dónde se rompe la comparación:** PostgreSQL bloquea filas, no el archivo entero: dos escritores en filas distintas no se estorban.
- **Ejemplo:** con `PRAGMA busy_timeout = 0`, el `UPDATE` de B mientras A tiene el turno produce `database is locked`.
- **Error típico:** dejar una transacción abierta mientras esperas al usuario; todos los demás escritores se quedan sin turno.

**NoSQL**
- **Definición técnica:** familia de bases que no usan el modelo de tablas relacionadas; la más común guarda documentos JSON completos y anidados (MongoDB, Firestore).
- **En palabras sencillas:** guardar la ficha entera del pedido en una sola carpeta, en vez de repartirla en cajones relacionados.
- **Dónde se rompe la comparación:** «sin SQL» no significa sin reglas ni sin transacciones; significa que las reglas y uniones las defines de otra forma.
- **Ejemplo:** SQLite puede guardar un documento JSON: `SELECT json_extract(doc, '$.cliente.ciudad'), json_array_length(doc, '$.paquetes') FROM envios_doc` devuelve `[(Bogotá, 2)]`.
- **Error típico:** elegir NoSQL «porque escala» para datos muy relacionados como inventario y movimientos, y reimplementar los `JOIN` a mano.

#### ► CÓMO FUNCIONA
Una transacción tiene un solo camino feliz y una salida de emergencia en cada paso. Si cualquier paso falla, el
programa ejecuta `ROLLBACK` y la base vuelve al estado de `BEGIN`:

```mermaid
flowchart LR
    BEGIN["BEGIN"] --> SUB["restar origen"] --> ADD["sumar destino"] --> COMMIT["COMMIT"]
    SUB -. "fallo" .-> ROLLBACK["ROLLBACK"]
    ADD -. "fallo" .-> ROLLBACK
```

Para elegir entre SQL y NoSQL, pregunta cómo se **consultan** los datos. Si combinas entidades (productos con
movimientos, envíos con mensajeros) y necesitas reglas entre ellas, usa tablas. Si siempre lees y escribes la ficha
completa y su forma cambia mucho, un documento es razonable. Muchos sistemas combinan ambos.

#### Problema resuelto 4.1
Traslada stock entre bodegas de forma atómica. Un traslado a un destino inexistente debe dejar las dos bodegas
intactas.

**Razonamiento:**
1. Validar antes de tocar la base: cantidad positiva y bodegas distintas.
2. Abrir la transacción con `setAutoCommit(false)`; restar en el origen solo si alcanza el stock (`AND stock >= ?`).
3. Las filas afectadas dicen si cada `UPDATE` encontró su fila; si no, lanzar `IllegalArgumentException`.
4. Cualquier excepción ejecuta `rollback()` y se vuelve a lanzar para que quien llamó se entere.

```java
// MoverStock.java — traslado entre bodegas: todo o nada
import java.sql.Connection;
import java.sql.SQLException;

Connection conexion;

void moverStock(int origen, int destino, int cantidad) throws SQLException {
    if (cantidad <= 0) {
        throw new IllegalArgumentException("La cantidad debe ser positiva");
    }
    if (origen == destino) {
        throw new IllegalArgumentException("El origen y el destino deben ser distintos");
    }
    conexion.setAutoCommit(false);                               // BEGIN: desde aquí, nada queda guardado solo
    try {
        int filasOrigen = Bd.ejecutar(conexion,
                "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?", cantidad, origen, cantidad);
        if (filasOrigen != 1) {
            throw new IllegalArgumentException("El origen no existe o no tiene stock suficiente");
        }
        int filasDestino = Bd.ejecutar(conexion,
                "UPDATE productos SET stock = stock + ? WHERE id = ?", cantidad, destino);
        if (filasDestino != 1) {
            throw new IllegalArgumentException("El destino no existe");
        }
        conexion.commit();                                       // COMMIT
    } catch (SQLException | RuntimeException error) {
        conexion.rollback();                                     // ROLLBACK
        throw error;
    } finally {
        conexion.setAutoCommit(true);
    }
}

void mostrar(String etiqueta) throws SQLException {
    IO.println(etiqueta + Bd.filas(conexion, "SELECT id, bodega, stock FROM productos"));
}

void main() throws SQLException {
    conexion = Bd.abrir(":memory:");
    Bd.script(conexion, """
            CREATE TABLE productos (id INTEGER PRIMARY KEY, bodega TEXT NOT NULL, stock INTEGER NOT NULL CHECK (stock >= 0));
            INSERT INTO productos VALUES (1, 'Norte', 10), (2, 'Sur', 0);
            """);
    mostrar("inicio:       ");
    moverStock(1, 2, 4);
    mostrar("mueve 4:      ");
    try {
        moverStock(1, 99, 3);
    } catch (IllegalArgumentException error) {
        IO.println("fallo: " + error.getMessage());
    }
    mostrar("tras fallo:   ");
    conexion.close();
}
```

```text
$ javasql MoverStock.java
inicio:       [(1, Norte, 10), (2, Sur, 0)]
mueve 4:      [(1, Norte, 6), (2, Sur, 4)]
fallo: El destino no existe
tras fallo:   [(1, Norte, 6), (2, Sur, 4)]
```

**Explicación por partes.**
- Líneas 8–13: las validaciones que no necesitan la base se hacen antes de abrir la transacción.
- Línea 14: `setAutoCommit(false)` es el `BEGIN` de JDBC: desde aquí nada se guarda hasta `commit()`.
- Líneas 16–20: el `UPDATE` del origen solo afecta la fila si hay stock suficiente; si no, devuelve `0` filas.
- Líneas 21–25: el destino 99 no existe; `0` filas y se lanza `IllegalArgumentException`.
- Líneas 27–29: `rollback()` deshace la resta de la línea 16 y `throw` reenvía el error.
- Líneas 30–32: `finally` devuelve la conexión al modo autocommit, pase lo que pase.
- Salida: tras el fallo, Norte sigue en 6 y Sur en 4; no se perdió ninguna unidad.

> **Error común.** Llamar `commit()` o `rollback()` cuando la conexión está en autocommit. El controlador responde
> `database in auto-commit mode`; en SQL directo, `COMMIT` sin `BEGIN` da `cannot commit - no transaction is active`.
> Suele pasar cuando el `setAutoCommit(false)` quedó dentro de un `if` que no se ejecutó.

> **Buena práctica.** Usa las filas afectadas que devuelve `executeUpdate` para comprobar que cada escritura tocó las filas que esperabas. Un `UPDATE`
> que no encuentra su fila no es un error para SQL: devuelve `0` filas en silencio.

#### Problema resuelto 4.2
Dos conexiones (dos cajeros) intentan descontar stock del mismo producto a la vez. Observa qué ve y qué puede hacer
la segunda mientras la primera no confirma.

**Razonamiento:**
1. Las dos conexiones abren el mismo archivo; `PRAGMA busy_timeout = 0` hace que no esperen el turno.
2. A abre `BEGIN IMMEDIATE`, que pide el turno de escritura desde el inicio, y resta 3.
3. B intenta restar 5: debe fallar. B intenta leer: debe ver el valor confirmado, no el de A.
4. Cuando A confirma, B ya puede escribir.

```java
// Bloqueo.java — dos conexiones quieren escribir a la vez
import java.sql.Connection;
import java.sql.SQLException;

void main() throws Exception {
    Files.deleteIfExists(Path.of("bodega.db"));
    try (Connection cajaA = Bd.abrir("bodega.db"); Connection cajaB = Bd.abrir("bodega.db")) {
        Bd.script(cajaA, "PRAGMA busy_timeout = 0");             // no esperar el turno
        Bd.script(cajaB, "PRAGMA busy_timeout = 0");
        Bd.script(cajaA, "CREATE TABLE productos (id INTEGER PRIMARY KEY, stock INTEGER NOT NULL)");
        Bd.script(cajaA, "INSERT INTO productos VALUES (1, 10)");

        Bd.script(cajaA, "BEGIN IMMEDIATE");                     // A toma el permiso de escritura
        Bd.script(cajaA, "UPDATE productos SET stock = stock - 3 WHERE id = 1");
        try {
            Bd.script(cajaB, "UPDATE productos SET stock = stock - 5 WHERE id = 1");
        } catch (SQLException error) {
            IO.println("B no pudo escribir: " + Bd.error(error));
        }
        IO.println("B lee mientras A no confirma: " + Bd.valor(cajaB, "SELECT stock FROM productos"));

        Bd.script(cajaA, "COMMIT");                              // A libera el permiso
        Bd.script(cajaB, "UPDATE productos SET stock = stock - 5 WHERE id = 1");
        IO.println("stock final: " + Bd.valor(cajaB, "SELECT stock FROM productos"));
    }
}
```

```text
$ javasql Bloqueo.java
B no pudo escribir: database is locked
B lee mientras A no confirma: 10
stock final: 2
```

**Explicación por partes.**
- Línea 7: dos conexiones al mismo archivo; en memoria no compartirían datos.
- Líneas 8–9: `busy_timeout` es cuántos milisegundos espera una conexión el turno de escritura antes de rendirse.
- Línea 13: `BEGIN IMMEDIATE`, escrito como SQL, toma el turno de escritura antes del primer cambio.
- Líneas 15–19: B no consigue el turno y recibe `database is locked` al instante.
- Línea 20: B lee `10`, el último valor confirmado: el cambio de A está aislado.
- Líneas 22–24: tras el `COMMIT` de A, B resta 5: 10 − 3 − 5 = 2.

> **Prevenir errores.** En un programa real deja un `busy_timeout` de unos segundos (el controlador usa 3000 ms por
> defecto) y transacciones cortas. Nunca esperes una respuesta del usuario con una transacción abierta.

#### Checkpoint 4.1
En `MoverStock.java`, ¿qué pasaría si borras la línea 28 (`rollback()`) pero dejas el `throw`?

Respuesta: la resta del origen queda pendiente, y el `setAutoCommit(true)` del `finally` la **confirma**: según JDBC,
volver al modo autocommit confirma la transacción abierta. La salida termina en `tras fallo:   [(1, Norte, 3), (2, Sur, 4)]`:
se perdieron 3 unidades sin ningún error.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Trabaja en la carpeta del módulo:

```bash
cd ~/labs/sql
```

#### Paso 2 · Completa una tarea con su historial
Marcar una tarea como completada y registrar el cambio en el historial deben ocurrir juntos. Guarda este programa,
que simula un fallo entre las dos escrituras:

```java
// Historial.java — completar una tarea y registrarla en el historial, juntos
import java.sql.Connection;
import java.sql.SQLException;

Connection conexion;

void completarConTransaccion(int tareaId, boolean simularFallo) throws SQLException {
    conexion.setAutoCommit(false);
    try {
        Bd.ejecutar(conexion, "UPDATE tareas SET estado = 'completada' WHERE id = ?", tareaId);
        if (simularFallo) {
            throw new IllegalStateException("fallo simulado: el disco se llenó");
        }
        Bd.ejecutar(conexion, "INSERT INTO historial(tarea_id, accion) VALUES (?, 'completada')", tareaId);
        conexion.commit();
        IO.println("Confirmado");
    } catch (SQLException | RuntimeException error) {
        conexion.rollback();
        IO.println("Revertido: " + error.getMessage());
    } finally {
        conexion.setAutoCommit(true);
    }
}

void main() throws SQLException {
    conexion = Bd.abrir("tareas.db");
    Bd.script(conexion, """
            CREATE TABLE IF NOT EXISTS tareas(id INTEGER PRIMARY KEY, titulo TEXT, estado TEXT NOT NULL DEFAULT 'pendiente');
            CREATE TABLE IF NOT EXISTS historial(id INTEGER PRIMARY KEY, tarea_id INTEGER NOT NULL, accion TEXT NOT NULL);
            INSERT OR IGNORE INTO tareas(id, titulo, estado) VALUES (2, 'enviar pedido', 'pendiente');
            """);
    completarConTransaccion(2, true);
    IO.println(Bd.filas(conexion, "SELECT id, estado FROM tareas WHERE id = 2"));
    IO.println(Bd.filas(conexion, "SELECT * FROM historial WHERE tarea_id = 2"));
    completarConTransaccion(2, false);
    IO.println(Bd.filas(conexion, "SELECT id, estado FROM tareas WHERE id = 2"));
    IO.println(Bd.filas(conexion, "SELECT * FROM historial WHERE tarea_id = 2"));
    conexion.close();
}
```

```text
$ javasql Historial.java
Revertido: fallo simulado: el disco se llenó
[(2, pendiente)]
[]
Confirmado
[(2, completada)]
[(1, 2, completada)]
```

Con el fallo simulado, la tarea sigue `pendiente` y el historial está vacío. Sin fallo, ambos cambios aparecen
juntos. Como la base vive en `tareas.db`, borra ese archivo antes de repetir la prueba.

#### Paso 3 · Rompe la atomicidad a propósito
En `MoverStock.java`, comenta las líneas 14, 26 y 28 (`setAutoCommit(false)`, `commit()` y `rollback()`). Ejecuta y
suma el stock tras el traslado fallido al destino 99: el total baja de 10 a 7 (Norte 3, Sur 4).

#### Paso 4 · Reproduce el bloqueo
Ejecuta `Bloqueo.java`. Luego cambia `busy_timeout = 0` por `busy_timeout = 2000` en la línea 9. La escritura de B
esperará unos 2 segundos y mostrará el mismo `database is locked`, porque A no suelta el turno a tiempo.

#### Resumen
- Una **transacción** agrupa sentencias con la regla todo o nada.
- `BEGIN` la abre; `COMMIT` confirma; `ROLLBACK` descarta y vuelve al estado inicial. En JDBC: `setAutoCommit(false)`, `commit()` y `rollback()`.
- La **atomicidad** es la A de **ACID**, junto con consistencia, aislamiento y durabilidad.
- En **modo autocommit** cada sentencia se confirma sola; para agrupar, se apaga mientras dura la transacción.
- En **concurrencia**, SQLite da el **bloqueo** de escritura a un solo escritor; los demás ven `database is locked`.
- **NoSQL** sirve para documentos que se leen completos; los datos muy relacionados van en tablas.

#### Ejercicio verificable 1
Básico. En `MoverStock.java`, intenta mover 50 unidades de la bodega 2 a la 1. ¿Qué mensaje sale y cómo queda la
tabla?

Respuesta esperada: `El origen no existe o no tiene stock suficiente`. La tabla sigue en
`[(1, Norte, 6), (2, Sur, 4)]`, porque el `UPDATE` con `AND stock >= ?` no tocó ninguna fila.

#### Ejercicio verificable 2
Intermedio. En una conexión recién abierta, ejecuta `Bd.script(conexion, "COMMIT")` sin haber abierto nada, y después
`conexion.commit()`. ¿Qué error ves en cada caso?

Respuesta esperada: el primero, `cannot commit - no transaction is active` (lo dice SQLite); el segundo,
`database in auto-commit mode` (lo dice el controlador JDBC antes de llegar a SQLite).

#### Ejercicio verificable 3
Reto. Guarda en una tabla `envios_doc(id, doc)` el documento
`{"guia": "RF-7", "paquetes": [{"kilos": 2.5}, {"kilos": 1.0}], "cliente": {"ciudad": "Bogotá"}}` como texto, con
una consulta parametrizada. Obtén la ciudad y el número de paquetes con SQL.

Respuesta esperada: `SELECT json_extract(doc, '$.cliente.ciudad'), json_array_length(doc, '$.paquetes') FROM envios_doc`
devuelve `[(Bogotá, 2)]`. Para sumar kilos de muchos envíos, unas tablas `envios` y `paquetes` serían más simples.

#### En el trabajo
Los pagos, los traslados de inventario y los cambios de estado con auditoría siempre van en una transacción. En los
frameworks se declara con una anotación o un bloque (`@Transactional` en Spring, `try` con `commit` y `rollback` en JDBC). Los
equipos registran en un ADR por qué eligieron SQL o NoSQL para cada dato, con las consultas reales como argumento.

</details>

### Tema 5: SQL avanzado: subconsultas, vistas, triggers y funciones de ventana · Intermedio · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- escribir subconsultas en `WHERE`, en `SELECT` y en `FROM`, y distinguir una correlacionada;
- guardar una consulta como vista y consultarla como si fuera una tabla;
- automatizar una auditoría y una regla de negocio con triggers;
- ordenar dentro de grupos sin perder filas con funciones de ventana.

**Conceptos clave:** subconsulta, subconsulta correlacionada, tabla derivada, vista, trigger, OLD y NEW, RAISE, función de ventana, PARTITION BY, RANK

#### El problema
La coordinación de RutaFlow pide cuatro cosas. Quiere las entregas más pesadas que el promedio y la efectividad por
zona. También la entrega más pesada de cada mensajero y un registro automático de cada cambio de estado. Además, una entrega ya
entregada no debe volver atrás, la cambie quien la cambie. Con `SELECT`, `JOIN` y `GROUP BY` solos no alcanza.

#### Glosario del tema

**subconsulta**
- **Definición técnica:** `SELECT` escrito entre paréntesis dentro de otra sentencia; su resultado se usa como un valor, una lista o una tabla.
- **En palabras sencillas:** una pregunta dentro de otra pregunta: primero averiguas el promedio y luego comparas con él.
- **Dónde se rompe la comparación:** el motor no siempre la ejecuta «primero»; puede reescribirla como un `JOIN`.
- **Ejemplo:** `SELECT nombre FROM mensajero WHERE id IN (SELECT mensajero_id FROM entrega WHERE estado = 'fallida')` devuelve `[(Beto)]`.
- **Error típico:** usar `=` con una subconsulta que devuelve varias filas; SQLite no falla y toma solo la primera (`[(Ana)]` en vez de tres mensajeros).

**subconsulta correlacionada**
- **Definición técnica:** subconsulta que usa columnas de la consulta exterior, por lo que se evalúa una vez por cada fila exterior.
- **En palabras sencillas:** por cada mensajero, una pregunta pequeña sobre sus propias entregas.
- **Dónde se rompe la comparación:** parece un ciclo `for` de Java, pero el motor puede optimizarla; aun así, en tablas grandes suele ser más lenta que un `GROUP BY`.
- **Ejemplo:** `SELECT nombre, (SELECT MAX(kilos) FROM entrega e WHERE e.mensajero_id = m.id) FROM mensajero m ORDER BY nombre` devuelve `[(Ana, 8.5), (Beto, 3.0), (Caro, 12.0)]`.
- **Error típico:** olvidar el alias exterior (`m.id`) y comparar la columna consigo misma: la subconsulta deja de depender de cada fila.

**tabla derivada**
- **Definición técnica:** subconsulta escrita en el `FROM`; su resultado actúa como una tabla temporal para la consulta exterior.
- **En palabras sencillas:** un borrador intermedio sobre el que haces una segunda cuenta.
- **Dónde se rompe la comparación:** el borrador no se guarda; desaparece al terminar la consulta.
- **Ejemplo:** `SELECT zona, SUM(total) FROM (SELECT * FROM resumen_mensajero) GROUP BY zona ORDER BY zona` devuelve `[(Norte, 4), (Sur, 2)]`.
- **Error típico:** filtrar un agregado con `WHERE` en vez de `HAVING`: `HAVING COUNT(*) > 1 AND kilos > 100` no falla, pero devuelve `[]`.

**vista**
- **Definición técnica:** consulta guardada con nombre en el esquema (`CREATE VIEW`); se consulta como una tabla y se recalcula en cada uso.
- **En palabras sencillas:** un atajo con nombre para una consulta larga que usas a menudo.
- **Dónde se rompe la comparación:** no guarda filas propias: si cambian las entregas, la vista cambia sola.
- **Ejemplo:** `SELECT * FROM resumen_mensajero ORDER BY nombre` devuelve `[(Ana, Norte, 2, 2), (Beto, Sur, 2, 1), (Caro, Norte, 2, 1)]`.
- **Error típico:** escribir en ella: `INSERT INTO resumen_mensajero ...` produce `cannot modify resumen_mensajero because it is a view`.

**trigger**
- **Definición técnica:** bloque de sentencias que el motor ejecuta automáticamente antes (`BEFORE`) o después (`AFTER`) de un `INSERT`, `UPDATE` o `DELETE` sobre una tabla.
- **En palabras sencillas:** una alarma programada: «cada vez que cambie el estado, anótalo».
- **Dónde se rompe la comparación:** se dispara aunque el valor no cambie: `UPDATE ... SET estado = estado` también lo activa.
- **Ejemplo:** `SELECT name, tbl_name FROM sqlite_master WHERE type = 'trigger'` devuelve `[(auditar_estado, entrega)]` en una base con ese trigger.
- **Error típico:** auditar sin filtro: con solo `auditar_estado`, `UPDATE entrega SET estado = estado` guarda `(10, entregada, entregada)` y `(14, pendiente, pendiente)`.

**OLD y NEW**
- **Definición técnica:** dentro de un trigger de fila, `OLD` es la fila antes del cambio y `NEW` la fila después. `INSERT` solo tiene `NEW`; `DELETE`, solo `OLD`.
- **En palabras sencillas:** la foto de antes y la foto de después de la fila que se modificó.
- **Dónde se rompe la comparación:** en un trigger `BEFORE`, la foto `NEW` todavía no está guardada en la tabla.
- **Ejemplo:** tras `UPDATE entrega SET estado = 'entregada' WHERE id = 14`, la auditoría guarda `(14, pendiente, entregada)`: `OLD.estado` y `NEW.estado`.
- **Error típico:** usar `OLD` en un trigger de `INSERT`, donde no hay fila anterior.

**RAISE**
- **Definición técnica:** función de SQLite usable en triggers; `RAISE(ABORT, 'mensaje')` cancela la sentencia en curso y devuelve ese mensaje como error.
- **En palabras sencillas:** el trigger dice «no» y explica por qué.
- **Dónde se rompe la comparación:** `ABORT` deshace solo la sentencia actual; las anteriores de la transacción siguen pendientes.
- **Ejemplo:** `UPDATE entrega SET estado = 'fallida' WHERE id = 10` produce `SQLiteException: [SQLITE_CONSTRAINT_TRIGGER] A RAISE function within a trigger fired causing the SQL statement to abort (una entrega entregada no puede cambiar de estado)`.
- **Error típico:** escribir la regla solo en Java; un script de mantenimiento con SQL directo se la salta.

**función de ventana**
- **Definición técnica:** función que calcula un valor para cada fila mirando un conjunto de filas relacionadas (la ventana), definido con `OVER (...)`, sin agruparlas en una sola.
- **En palabras sencillas:** cada fila conserva su lugar y recibe un dato sobre su grupo, como «eres la segunda más pesada».
- **Dónde se rompe la comparación:** a diferencia de `GROUP BY`, no reduce filas: salen tantas como entraron.
- **Ejemplo:** `SELECT id, kilos, SUM(kilos) OVER (ORDER BY id) FROM entrega` da un acumulado que termina en `(15, 4.0, 30.5)`.
- **Error típico:** usarla en `WHERE`: `misuse of window function RANK()`; se calcula en una tabla derivada y se filtra afuera.

**PARTITION BY**
- **Definición técnica:** parte de `OVER` que divide las filas en grupos independientes; la función de ventana se reinicia en cada grupo.
- **En palabras sencillas:** hacer la cuenta por separado para cada mensajero.
- **Dónde se rompe la comparación:** parece `GROUP BY`, pero las filas no se juntan.
- **Ejemplo:** `ROUND(AVG(kilos) OVER (PARTITION BY mensajero_id), 2)` pone `5.25` en las dos entregas de Ana.
- **Error típico:** olvidarlo: el ranking se calcula sobre todas las entregas y no por mensajero.

**RANK**
- **Definición técnica:** función de ventana que numera las filas según el `ORDER BY` de su ventana; las filas empatadas reciben el mismo puesto y el siguiente salta.
- **En palabras sencillas:** el podio: dos empatados en primer lugar y el siguiente queda tercero.
- **Dónde se rompe la comparación:** `ROW_NUMBER()` nunca empata; desempata de forma arbitraria.
- **Ejemplo:** con dos entregas de 8.5 kg de Ana, `RANK()` da `1, 1, 3` y `ROW_NUMBER()` da `1, 2, 3`.
- **Error típico:** usar `RANK() = 1` para «una sola fila por grupo» y recibir dos cuando hay empate.

#### ► CÓMO FUNCIONA
Las subconsultas y las vistas reorganizan **preguntas**. Los triggers reaccionan a **cambios**. Este es el camino de
un `UPDATE` sobre el estado de una entrega con los dos triggers del Problema resuelto 5.2:

```mermaid
flowchart LR
    U[UPDATE estado] --> B{trigger BEFORE no_revertir}
    B -- entregada --> X[ABORT]
    B -- ok --> W[se escribe la fila]
    W --> A[trigger AFTER auditar_estado]
    A --> T[(auditoria)]
```

Las funciones de ventana se calculan después de `WHERE` y `GROUP BY` y antes de `ORDER BY`. Por eso no se pueden
filtrar en `WHERE`: cuando el `WHERE` corre, todavía no existen.

#### Problema resuelto 5.1
Con tres mensajeros y seis entregas, responde tres preguntas. ¿Qué entregas superan el peso promedio? ¿Cuál es la
efectividad por zona? ¿Cómo se ordenan los kilos dentro de cada mensajero?

**Razonamiento:**
1. El promedio es un solo valor: subconsulta en `WHERE`.
2. Contar entregas por mensajero sin `GROUP BY`: subconsulta correlacionada en `SELECT`.
3. La efectividad por zona reutiliza un resumen por mensajero: vista más tabla derivada.
4. «La más pesada de cada uno» sin perder filas: `RANK()` con `PARTITION BY`.

```java
// ConsultasAvanzadas.java — subconsultas, vista y función de ventana
import java.sql.Connection;
import java.sql.SQLException;

Connection db;

void mostrar(String titulo, String sql) throws SQLException {
    IO.println("-- " + titulo);
    for (String fila : Bd.filas(db, sql)) {
        IO.println("   " + fila);
    }
}

void main() throws SQLException {
    db = Bd.abrir(":memory:");
    Bd.script(db, """
            CREATE TABLE mensajero (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, zona TEXT NOT NULL);
            CREATE TABLE entrega (
              id INTEGER PRIMARY KEY,
              mensajero_id INTEGER NOT NULL REFERENCES mensajero(id),
              kilos REAL NOT NULL,
              estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'entregada', 'fallida'))
            );
            INSERT INTO mensajero VALUES (1, 'Ana', 'Norte'), (2, 'Beto', 'Sur'), (3, 'Caro', 'Norte');
            INSERT INTO entrega VALUES
              (10, 1, 2.0, 'entregada'), (11, 1, 8.5, 'entregada'), (12, 2, 1.0, 'fallida'),
              (13, 2, 3.0, 'entregada'), (14, 3, 12.0, 'pendiente'), (15, 3, 4.0, 'entregada');

            -- Vista: una consulta guardada con nombre, se consulta como si fuera una tabla
            CREATE VIEW resumen_mensajero AS
            SELECT m.nombre, m.zona, COUNT(e.id) AS total,
                   SUM(e.estado = 'entregada') AS entregadas
            FROM mensajero m LEFT JOIN entrega e ON e.mensajero_id = m.id
            GROUP BY m.id, m.nombre, m.zona;
            """);

    mostrar("Subconsulta en WHERE: entregas más pesadas que el promedio",
            "SELECT id, kilos FROM entrega WHERE kilos > (SELECT AVG(kilos) FROM entrega) ORDER BY id");
    mostrar("Subconsulta correlacionada en SELECT: entregas por mensajero",
            "SELECT nombre, (SELECT COUNT(*) FROM entrega e WHERE e.mensajero_id = m.id) FROM mensajero m ORDER BY nombre");
    mostrar("Subconsulta en FROM sobre la vista: efectividad por zona", """
            SELECT zona, ROUND(100.0 * SUM(entregadas) / SUM(total)) AS efectividad
            FROM (SELECT * FROM resumen_mensajero) GROUP BY zona ORDER BY zona""");
    mostrar("Función de ventana: ranking de kilos dentro de cada mensajero", """
            SELECT mensajero_id, id, kilos,
                   RANK() OVER (PARTITION BY mensajero_id ORDER BY kilos DESC) AS puesto
            FROM entrega ORDER BY mensajero_id, puesto""");
    db.close();
}
```

```text
$ javasql ConsultasAvanzadas.java
-- Subconsulta en WHERE: entregas más pesadas que el promedio
   (11, 8.5)
   (14, 12.0)
-- Subconsulta correlacionada en SELECT: entregas por mensajero
   (Ana, 2)
   (Beto, 2)
   (Caro, 2)
-- Subconsulta en FROM sobre la vista: efectividad por zona
   (Norte, 75.0)
   (Sur, 50.0)
-- Función de ventana: ranking de kilos dentro de cada mensajero
   (1, 11, 8.5, 1)
   (1, 10, 2.0, 2)
   (2, 13, 3.0, 1)
   (2, 12, 1.0, 2)
   (3, 14, 12.0, 1)
   (3, 15, 4.0, 2)
```

**Explicación por partes.**
- Línea 22: `CHECK ... IN (...)` limita el estado a tres valores (ficha de `CHECK` en el Tema 3).
- Líneas 30–34: la vista; `SUM(e.estado = 'entregada')` suma 1 por cada comparación verdadera.
- Línea 38: el promedio es 5.08 kg; solo las entregas 11 y 14 lo superan.
- Línea 40: `m.id` viene de la consulta exterior; la subconsulta se evalúa por cada mensajero.
- Líneas 41–43: Norte tiene 3 de 4 entregadas (75 %); Sur, 1 de 2 (50 %).
- Líneas 44–47: el puesto se reinicia en 1 para cada `mensajero_id`.

> **Error común.** Filtrar con una función de ventana en `WHERE`:
> `SELECT id FROM entrega WHERE RANK() OVER (ORDER BY kilos) = 1` produce
> `misuse of window function RANK()` (dentro de una `SQLiteException`). Calcula el ranking en una tabla derivada y filtra en
> la consulta exterior.

> **Buena práctica.** Pon nombre a las vistas por lo que responden (`resumen_mensajero`), no por cómo se calculan.
> Así el reporte no cambia cuando optimizas la consulta interna.

#### Problema resuelto 5.2
Registra cada cambio de estado en una tabla de auditoría y prohíbe que una entrega `entregada` cambie de estado.

**Razonamiento:**
1. La auditoría ocurre **después** del cambio y necesita el antes y el después: trigger `AFTER` con `OLD` y `NEW`.
2. La prohibición debe actuar **antes** de escribir: trigger `BEFORE` con `WHEN OLD.estado = 'entregada'`.
3. `RAISE(ABORT, ...)` cancela la sentencia con un mensaje claro.

```java
// Triggers.java — reglas que la base ejecuta sola en cada cambio
import java.sql.Connection;
import java.sql.SQLException;

void main() throws SQLException {
    try (Connection db = Bd.abrir(":memory:")) {
        Bd.script(db, """
                CREATE TABLE entrega (
                  id INTEGER PRIMARY KEY,
                  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'entregada', 'fallida'))
                );
                CREATE TABLE auditoria (entrega_id INTEGER, antes TEXT, despues TEXT);
                INSERT INTO entrega VALUES (10, 'entregada'), (14, 'pendiente');

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
                """);

        Bd.ejecutar(db, "UPDATE entrega SET estado = 'entregada' WHERE id = 14");
        IO.println("auditoría: " + Bd.filas(db, "SELECT * FROM auditoria"));
        try {
            Bd.ejecutar(db, "UPDATE entrega SET estado = 'fallida' WHERE id = 10");
        } catch (SQLException error) {
            IO.println("rechazado por trigger: " + Bd.error(error));
        }
        IO.println("estados: " + Bd.filas(db, "SELECT * FROM entrega ORDER BY id"));
    }
}
```

```text
$ javasql Triggers.java
auditoría: [(14, pendiente, entregada)]
rechazado por trigger: una entrega entregada no puede cambiar de estado
estados: [(10, entregada), (14, entregada)]
```

**Explicación por partes.**
- Líneas 16–19: el trigger de auditoría copia el `id`, el estado anterior y el nuevo. El controlador envía todo el
  script junto, así que los `;` de dentro de `BEGIN … END` no lo cortan.
- Líneas 22–26: `WHEN` hace que el trigger solo actúe si la fila ya estaba entregada.
- Línea 29: la entrega 14 pasa de pendiente a entregada y la auditoría lo registra sola.
- Líneas 31–35: la entrega 10 ya estaba entregada: `RAISE` cancela el cambio con una `SQLException` que trae el mensaje.
- Línea 36: la entrega 10 sigue `entregada`; el `ABORT` deshizo la sentencia.

> **Prevenir errores.** Agrega `WHEN OLD.estado <> NEW.estado` al trigger de auditoría. Así un `UPDATE` que no
> cambia el valor no llena la tabla con filas inútiles.

#### Checkpoint 5.1
En `Triggers.java`, después de rechazar el cambio de la entrega 10, ¿cuántas filas tiene `auditoria`?

Respuesta: una sola, `(14, pendiente, entregada)`. El trigger `BEFORE` canceló la sentencia antes de escribir,
así que el trigger `AFTER` nunca se disparó.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Trabaja en la carpeta del módulo:

```bash
cd ~/labs/sql
```

#### Paso 2 · Ejecuta las consultas
Guarda `ConsultasAvanzadas.java` y ejecútalo con `javasql ConsultasAvanzadas.java`. Compara cada bloque con la salida
del Problema resuelto 5.1.

#### Paso 3 · Agrega los triggers
Guarda `Triggers.java` y ejecútalo. Confirma la línea `rechazado por trigger` y que la entrega 10 sigue `entregada`.

#### Paso 4 · Afina la auditoría
Agrega `WHEN OLD.estado <> NEW.estado` al trigger `auditar_estado`. Antes de la línea 29, ejecuta
`Bd.ejecutar(db, "UPDATE entrega SET estado = estado WHERE id = 14")`. La auditoría debe terminar con una sola fila.

#### Resumen
- Una **subconsulta** responde una pregunta intermedia; la **subconsulta correlacionada** se evalúa por cada fila exterior.
- Una **tabla derivada** es una subconsulta en `FROM`; una **vista** es una consulta guardada con nombre.
- Un **trigger** se ejecuta solo ante un cambio; usa **OLD y NEW** para ver la fila antes y después.
- `RAISE(ABORT, ...)` cancela la sentencia y convierte una regla de negocio en un error de la base.
- Una **función de ventana** calcula sobre un grupo sin juntar filas; **PARTITION BY** define el grupo y **RANK** numera con empates.

#### Ejercicio verificable 1
Básico. Lista los mensajeros que tienen al menos una entrega `fallida`, con una subconsulta.

Respuesta esperada: `SELECT nombre FROM mensajero WHERE id IN (SELECT mensajero_id FROM entrega WHERE estado = 'fallida')`
devuelve `[(Beto)]`.

#### Ejercicio verificable 2
Intermedio. Calcula el acumulado de kilos de todas las entregas ordenadas por `id`. ¿Cuál es el último valor?

Respuesta esperada: `SELECT id, kilos, SUM(kilos) OVER (ORDER BY id) FROM entrega` termina en `(15, 4.0, 30.5)`.

#### Ejercicio verificable 3
Reto. Sin el trigger `no_revertir`, crea `auditar_estado` con `WHEN OLD.estado <> NEW.estado`. Ejecuta
`UPDATE entrega SET estado = estado` y luego cambia la entrega 14 a `fallida`.

Respuesta esperada: tras el primer `UPDATE`, `auditoria` sigue en `[]`. Tras el segundo, contiene
`[(14, pendiente, fallida)]`.

#### En el trabajo
Los reportes de operación se construyen sobre vistas que el equipo de datos mantiene. Las funciones de ventana
responden preguntas típicas de negocio: «el último estado de cada envío», «el mejor mensajero de cada zona». Los
triggers de auditoría son comunes en sistemas regulados. La lógica de negocio compleja, en cambio, suele vivir en la
aplicación, donde se prueba con más facilidad.

</details>

### Tema 6: Procedimientos almacenados, funciones y cursores con PL/pgSQL · Intermedio · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- escribir una función en PL/pgSQL y usarla dentro de un `SELECT`;
- escribir un procedimiento y ejecutarlo con `CALL`, y explicar por qué no se usa `SELECT`;
- recorrer un resultado fila por fila con un cursor implícito (`FOR`) y uno explícito (`OPEN`, `FETCH`, `CLOSE`);
- lanzar una excepción con `RAISE EXCEPTION` y capturarla con `EXCEPTION WHEN`.

**Conceptos clave:** PostgreSQL, PL/pgSQL, función almacenada, procedimiento almacenado, CALL, cursor explícito, RAISE NOTICE y RAISE EXCEPTION, bloque DO, EXCEPTION WHEN, PERFORM

#### El problema
RutaFlow migró sus entregas a PostgreSQL. La tarifa se calcula en tres aplicaciones distintas y cada una redondea
los kilos a su manera. Además, cada noche alguien ejecuta a mano el cierre del día por mensajero. ¿Cómo se guarda
la regla de la tarifa y el proceso de cierre **dentro** de la base, para que todos usen la misma versión?

#### Glosario del tema

**PostgreSQL**
- **Definición técnica:** sistema gestor de bases de datos relacional de código abierto que funciona como servidor: los programas se conectan a él por red.
- **En palabras sencillas:** una base como SQLite, pero que vive en su propio programa y atiende a muchos clientes a la vez.
- **Dónde se rompe la comparación:** SQLite es un archivo que abre tu programa; PostgreSQL es un servicio que hay que instalar, arrancar y al que hay que autenticarse.
- **Ejemplo:** `SELECT version();` devolvió `PostgreSQL 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1) on x86_64-pc-linux-gnu, ...` en el servidor usado para este tema.
- **Error típico:** pegar SQL de SQLite sin revisar el dialecto: tipos como `serial` o `numeric(6,2)` y comillas dobles se comportan distinto.

**PL/pgSQL**
- **Definición técnica:** lenguaje procedimental de PostgreSQL que añade variables, condiciones (`IF`), ciclos (`LOOP`, `FOR`) y manejo de errores al SQL.
- **En palabras sencillas:** SQL con las herramientas de un lenguaje de programación, ejecutándose dentro del servidor.
- **Dónde se rompe la comparación:** no es Java: no corre en tu programa sino dentro del servidor, la asignación es `:=` y el cuerpo va entre `$$`.
- **Ejemplo:** `SELECT tarifa(2.1) AS t1, tarifa(3) AS t2;` devuelve `8600 | 8600`, porque `ceil` redondea 2.1 hacia 3.
- **Error típico:** usar `%` en `RAISE` sin pasar el valor: `too few parameters specified for RAISE`.

**función almacenada**
- **Definición técnica:** rutina guardada en la base con `CREATE FUNCTION` que recibe parámetros, devuelve un valor y se invoca dentro de una expresión SQL.
- **En palabras sencillas:** una fórmula con nombre que vive en la base y cualquiera puede usar en sus consultas.
- **Dónde se rompe la comparación:** no puede confirmar ni deshacer transacciones; corre dentro de la transacción de quien la llama.
- **Ejemplo:** en `SELECT guia, kilos, tarifa(kilos) FROM entrega`, la fila de `BO-4` (7.25 kg) muestra `14600`.
- **Error típico:** pasarle un texto: `SELECT tarifa('dos')` produce `invalid input syntax for type numeric: "dos"`.

**procedimiento almacenado**
- **Definición técnica:** rutina guardada con `CREATE PROCEDURE` que ejecuta un proceso, no devuelve un valor en una expresión y se invoca con `CALL`.
- **En palabras sencillas:** un botón con nombre que dispara una tarea completa, como el cierre del día.
- **Dónde se rompe la comparación:** a diferencia de la función, sí puede ejecutar `COMMIT` dentro de su cuerpo en PostgreSQL 11 o superior.
- **Ejemplo:** `SELECT proname, prokind FROM pg_proc WHERE proname IN ('tarifa', 'cerrar_dia')` devuelve `cerrar_dia | p` y `tarifa | f`.
- **Error típico:** llamarlo con `SELECT cerrar_dia();`: `ERROR:  cerrar_dia() is a procedure` con la pista `To call a procedure, use CALL.`.

**CALL**
- **Definición técnica:** sentencia SQL que ejecuta un procedimiento almacenado con sus argumentos.
- **En palabras sencillas:** apretar el botón del procedimiento.
- **Dónde se rompe la comparación:** no sirve para funciones, aunque las dos parezcan «rutinas».
- **Ejemplo:** `CALL cerrar_dia();` llena `cierre_diario` y muestra un aviso por cada mensajero.
- **Error típico:** `CALL tarifa(2);` produce `ERROR:  tarifa(integer) is not a procedure` con la pista `To call a function, use SELECT.`.

**cursor explícito (PL/pgSQL)**
- **Definición técnica:** variable que representa una consulta abierta en el servidor; se abre con `OPEN`, entrega filas con `FETCH` y se libera con `CLOSE`.
- **En palabras sencillas:** un marcapáginas sobre el resultado: lees un renglón, avanzas, y al final lo guardas.
- **Dónde se rompe la comparación:** el `FOR fila IN cursor LOOP` hace el `OPEN`, los `FETCH` y el `CLOSE` por ti.
- **Ejemplo:** en `cursor_explicito.sql`, dos `FETCH` entregan `BO-2` y `BO-5`, y el total por cobrar es `16000`.
- **Error típico:** hacer `FETCH` sin `OPEN`: `cursor variable "c_guias" is null`.

**RAISE NOTICE y RAISE EXCEPTION**
- **Definición técnica:** `RAISE NOTICE` envía un mensaje informativo al cliente y sigue; `RAISE EXCEPTION` lanza un error que aborta la sentencia, salvo que se capture.
- **En palabras sencillas:** `NOTICE` es un `print`; `EXCEPTION` es un `raise ValueError`.
- **Dónde se rompe la comparación:** un `NOTICE` no se guarda en ninguna tabla: si nadie lo lee, se pierde.
- **Ejemplo:** `SELECT tarifa(-1);` produce `ERROR:  kilos debe ser positivo: -1` y la línea `CONTEXT:  PL/pgSQL function tarifa(numeric) line 4 at RAISE`.
- **Error típico:** usar `RAISE NOTICE` para un dato inválido: el proceso sigue y guarda un resultado malo.

**bloque DO**
- **Definición técnica:** sentencia que ejecuta un bloque anónimo de PL/pgSQL una sola vez, sin guardarlo en la base.
- **En palabras sencillas:** un borrador de procedimiento que se usa y se tira.
- **Dónde se rompe la comparación:** no recibe parámetros ni devuelve resultados; solo actúa y emite avisos.
- **Ejemplo:** `DO $$ BEGIN RAISE NOTICE 'hola desde un bloque DO: %', 2 + 3; END $$;` muestra `NOTICE:  hola desde un bloque DO: 5`.
- **Error típico:** escribir `SELECT tarifa(2);` dentro del bloque: `query has no destination for result data`.

**EXCEPTION WHEN**
- **Definición técnica:** sección de un bloque PL/pgSQL que captura errores por nombre de condición (`division_by_zero`, `raise_exception`) y ejecuta un manejador.
- **En palabras sencillas:** el `except` de PL/pgSQL.
- **Dónde se rompe la comparación:** al entrar al manejador, PostgreSQL deshace todo lo que hizo el bloque antes del error.
- **Ejemplo:** `DO $$ BEGIN PERFORM 1 / 0; EXCEPTION WHEN division_by_zero THEN RAISE NOTICE 'capturado: %', SQLERRM; END $$;` muestra `NOTICE:  capturado: division by zero`.
- **Error típico:** capturar `OTHERS` y no hacer nada: el error desaparece sin dejar rastro.

**PERFORM**
- **Definición técnica:** sentencia PL/pgSQL que ejecuta una consulta y descarta su resultado.
- **En palabras sencillas:** «hazlo, no me importa la respuesta».
- **Dónde se rompe la comparación:** fuera de PL/pgSQL no existe; en SQL normal escribes `SELECT`.
- **Ejemplo:** `PERFORM tarifa(0);` dentro del `DO` de `plpgsql.sql` termina en `NOTICE:  error controlado: kilos debe ser positivo: 0`.
- **Error típico:** usar `SELECT` sin `INTO`; PostgreSQL responde con la pista `If you want to discard the results of a SELECT, use PERFORM instead.`.

#### ► CÓMO FUNCIONA
Una función responde: se usa donde va un valor, como una columna de un `SELECT`. Un procedimiento actúa: se
ejecuta solo, con `CALL`, y puede recorrer datos y escribir en otras tablas.

```mermaid
flowchart LR
    S[SELECT tarifa kilos] --> F[función: devuelve valor]
    C[CALL cerrar_dia] --> P[procedimiento]
    P --> K[cursor por mensajero]
    K --> I[INSERT en cierre_diario]
```

Para recorrer filas, PL/pgSQL usa un cursor. La forma corta es `FOR fila IN cursor LOOP`. La forma larga (`OPEN`,
`FETCH`, `EXIT WHEN NOT FOUND`, `CLOSE`) te da control para detenerte antes o combinar dos cursores.

#### Problema resuelto 6.1
Guarda en PostgreSQL la tarifa (5000 más 1200 por cada kilo o fracción) y el cierre diario por mensajero. Prueba
también que un peso de 0 kg produce un error que se puede capturar.

**Razonamiento:**
1. La tarifa devuelve un número y se usa por fila: es una función. `ceil` cuenta la fracción como kilo completo.
2. El cierre recorre mensajeros y escribe en `cierre_diario`: es un procedimiento con un cursor.
3. Un peso no positivo es un dato imposible: `RAISE EXCEPTION`. Un bloque `DO` demuestra cómo capturarlo.

Arranca un servidor PostgreSQL 16 desechable con Docker y ejecuta el archivo:

```bash
mkdir plpgsql && cd plpgsql
docker run -d --rm --name pg-fundamentos-m4 -e POSTGRES_PASSWORD=dev -p 127.0.0.1:5432:5432 postgres:16
until docker exec pg-fundamentos-m4 pg_isready -U postgres; do sleep 1; done
docker exec -i pg-fundamentos-m4 psql -U postgres -q -X < plpgsql.sql
```

```sql
-- plpgsql.sql — tarifa y cierre diario de RutaFlow en PostgreSQL
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

-- PROCEDIMIENTO: recorre un CURSOR y guarda el cierre de cada mensajero
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

```text
$ psql -U postgres -q -X < plpgsql.sql
NOTICE:  table "entrega" does not exist, skipping
NOTICE:  table "cierre_diario" does not exist, skipping
 guia | kilos | tarifa 
------+-------+--------
 BO-1 |  2.50 |   8600
 BO-2 |  4.00 |   9800
 BO-3 |  1.00 |   6200
 BO-4 |  7.25 |  14600
(4 rows)

NOTICE:  cierre de ana: 1 entregas, 2.50 kg
NOTICE:  cierre de beto: 2 entregas, 8.25 kg
 mensajero | entregadas | kilos 
-----------+------------+-------
 ana       |          1 |  2.50
 beto      |          2 |  8.25
(2 rows)

NOTICE:  error controlado: kilos debe ser positivo: 0
```

**Explicación por partes.**
- Línea 2: el `DROP ... IF EXISTS` permite repetir el script; la primera vez avisa que las tablas no existían.
- Líneas 16–23: la función; `IMMUTABLE` declara que el mismo peso siempre da la misma tarifa.
- Línea 22: `ceil(2.5)` es 3, así que `BO-1` cuesta 5000 + 3 × 1200 = 8600.
- Líneas 30–32: el cursor declara la consulta de entregadas agrupadas por mensajero.
- Líneas 35–38: el `FOR` abre el cursor, inserta una fila por mensajero, emite un aviso y cierra el cursor.
- Líneas 46–51: `PERFORM` llama la función con 0; `EXCEPTION WHEN raise_exception` captura el error y `SQLERRM` trae su mensaje.

> **Error común.** Llamar un procedimiento como si fuera función. `SELECT cerrar_dia();` produce
> `ERROR:  cerrar_dia() is a procedure` y la pista `HINT:  To call a procedure, use CALL.`. Lee siempre la línea
> `HINT`: PostgreSQL te dice la corrección.

> **Buena práctica.** Prefija los parámetros (`p_kilos`) y las variables (`v_total`). Si un parámetro se llama igual
> que una columna, PostgreSQL no sabe a cuál te refieres y la consulta falla por ambigüedad.

#### Problema resuelto 6.2
Calcula el total por cobrar de las entregas pendientes, recorriéndolas una por una con un cursor explícito.

**Razonamiento:**
1. Asegurar una segunda entrega pendiente (`BO-5`) sin fallar si ya existe: `ON CONFLICT (guia) DO NOTHING`.
2. Declarar el cursor sobre las pendientes, abrirlo y pedir filas con `FETCH` hasta que `FOUND` sea falso.
3. Acumular la tarifa de cada entrega y cerrar el cursor al final.

```sql
-- cursor_explicito.sql — recorrer guías una por una con OPEN, FETCH y CLOSE
INSERT INTO entrega (guia, mensajero, kilos) VALUES ('BO-5', 'beto', 0.4)
ON CONFLICT (guia) DO NOTHING;

DO $$
DECLARE
  c_guias CURSOR FOR SELECT guia, kilos FROM entrega WHERE estado = 'pendiente' ORDER BY guia;
  v_guia text;
  v_kilos numeric;
  v_total integer := 0;
BEGIN
  OPEN c_guias;
  LOOP
    FETCH c_guias INTO v_guia, v_kilos;
    EXIT WHEN NOT FOUND;                       -- FOUND es falso cuando ya no hay filas
    v_total := v_total + tarifa(v_kilos);
    RAISE NOTICE 'pendiente %: % kg', v_guia, v_kilos;
  END LOOP;
  CLOSE c_guias;
  RAISE NOTICE 'total por cobrar: %', v_total;
END $$;
```

```text
$ psql -U postgres -q -X < cursor_explicito.sql
NOTICE:  pendiente BO-2: 4.00 kg
NOTICE:  pendiente BO-5: 0.40 kg
NOTICE:  total por cobrar: 16000
```

**Explicación por partes.**
- Líneas 2–3: `ON CONFLICT` hace que el script se pueda repetir sin `duplicate key`.
- Línea 7: el cursor se declara, pero todavía no consulta nada.
- Líneas 12–15: `OPEN` ejecuta la consulta; cada `FETCH` llena dos variables; `EXIT WHEN NOT FOUND` termina el ciclo.
- Línea 16: la función del Problema resuelto 6.1 se reutiliza: 9800 + 6200 = 16000.
- Línea 19: `CLOSE` libera el cursor en el servidor.

> **Prevenir errores.** Escribe `EXIT WHEN NOT FOUND` justo después de cada `FETCH`. Sin esa línea, el `LOOP` nunca
> termina y la sesión queda ocupada hasta que la canceles.

#### Checkpoint 6.1
¿Qué tarifa devuelve `tarifa(0.4)` y por qué?

Respuesta: `6200`. `ceil(0.4)` es 1, así que la tarifa es 5000 + 1 × 1200. Es la tarifa de `BO-5` en el Problema
resuelto 6.2.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Arranca el servidor
Ejecuta los comandos `docker` del Problema resuelto 6.1. `pg_isready` debe terminar con `accepting connections`.

#### Paso 2 · Crea la función y el procedimiento
Guarda `plpgsql.sql` y ejecútalo con `docker exec -i pg-fundamentos-m4 psql -U postgres -q -X < plpgsql.sql`. Compara
la tabla de tarifas y el cierre con la salida del problema resuelto.

#### Paso 3 · Recorre con un cursor explícito
Guarda `cursor_explicito.sql` y ejecútalo con el mismo comando. Ejecútalo dos veces: el total sigue en `16000`.

#### Paso 4 · Provoca los errores
Ejecuta `SELECT cerrar_dia();` y `CALL tarifa(2);` dentro de `psql` y lee las líneas `HINT`. Al terminar, detén el
servidor con `docker stop pg-fundamentos-m4`.

#### Resumen
- **PostgreSQL** es un servidor relacional; **PL/pgSQL** agrega variables, ciclos y manejo de errores al SQL.
- Una **función almacenada** devuelve un valor y se usa en `SELECT`; un **procedimiento almacenado** ejecuta un proceso con **CALL**.
- Un **cursor explícito** se abre, se lee con `FETCH` y se cierra; `FOR ... IN cursor LOOP` hace esos pasos por ti.
- **RAISE NOTICE y RAISE EXCEPTION** informan o detienen; **EXCEPTION WHEN** captura el error por su nombre.
- Un **bloque DO** ejecuta PL/pgSQL una vez; **PERFORM** ejecuta una consulta y descarta su resultado.

#### Ejercicio verificable 1
Básico. ¿Qué devuelve `SELECT tarifa(10);`?

Respuesta esperada: `17000`. Son 5000 + 10 × 1200; `ceil(10)` es 10.

#### Ejercicio verificable 2
Intermedio. Ejecuta `CALL tarifa(2);`. Copia el error y la pista exactos.

Respuesta esperada: `ERROR:  tarifa(integer) is not a procedure` y `HINT:  To call a function, use SELECT.`.

#### Ejercicio verificable 3
Reto. Después de `plpgsql.sql`, marca `BO-2` como entregada y vuelve a ejecutar el cierre. ¿Qué filas tiene
`cierre_diario`?

Respuesta esperada: con `UPDATE entrega SET estado = 'entregada' WHERE guia = 'BO-2';` y `CALL cerrar_dia();`, la
tabla queda en `ana | 2 | 6.50` y `beto | 2 | 8.25`. El `DELETE` de la línea 34 evita duplicar filas.

#### En el trabajo
Bancos, aseguradoras y operadores logísticos guardan en la base las reglas que varias aplicaciones deben compartir,
como una tarifa o un cierre contable. Los procedimientos se ejecutan desde tareas programadas o desde el backend con
`CALL`. El costo es que esa lógica se prueba y se versiona aparte del código. Por eso los equipos la guardan en
migraciones y la cubren con pruebas.

</details>

### Tema 7: De SQL a Excel: reportes con tablas y fórmulas vivas · Intermedio · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- convertir el resultado de una consulta SQL en una hoja de Excel con encabezados tomados de `ResultSetMetaData`;
- escribir fórmulas que Excel recalcula y darles formato de porcentaje;
- crear una tabla de Excel con filtros y estilo;
- verificar el archivo generado leyéndolo de nuevo, distinguiendo fórmulas de valores calculados.

**Conceptos clave:** formato .xlsx, libro y hoja, celda, ResultSetMetaData, fórmula viva, formato numérico, tabla de Excel, valor calculado

#### El problema
La gerencia de RutaFlow no abre bases de datos: abre Excel. Cada lunes alguien copia a mano el resumen por zona y
escribe los porcentajes con la calculadora. Si un número de la base cambia, el porcentaje queda viejo. ¿Cómo se
genera el archivo directamente desde SQL, con fórmulas que se actualicen solas?

#### Glosario del tema

**formato .xlsx**
- **Definición técnica:** formato Office Open XML de Excel: un archivo ZIP que contiene varios archivos XML (el libro, cada hoja, los estilos, las tablas) y otros que los relacionan.
- **En palabras sencillas:** una carpeta comprimida con fichas de texto; Excel las lee y arma la hoja.
- **Dónde se rompe la comparación:** el ZIP debe tener exactamente las partes y relaciones esperadas; si falta una, Excel ofrece «reparar» el archivo.
- **Ejemplo:** `unzip -l reporte-entregas.xlsx` lista `xl/workbook.xml`, `xl/worksheets/sheet1.xml`, `xl/styles.xml` y `xl/tables/table1.xml`.
- **Error típico:** escribir un `<` o un `&` de los datos sin escapar dentro del XML: el archivo queda corrupto. `celda` los convierte en `&lt;` y `&amp;`.

**libro y hoja**
- **Definición técnica:** el libro (`xl/workbook.xml`) es el archivo completo y nombra sus hojas; cada hoja (`xl/worksheets/sheet1.xml`) guarda filas y celdas.
- **En palabras sencillas:** el cuaderno y sus páginas.
- **Dónde se rompe la comparación:** una hoja vacía sigue siendo una parte del ZIP que hay que declarar.
- **Ejemplo:** `<sheet name="Resumen por zona" sheetId="1" r:id="rId1"/>` le da nombre a la única hoja del reporte.
- **Error típico:** agregar `sheet2.xml` al ZIP y olvidar declararlo en el libro, en sus relaciones y en `[Content_Types].xml`: Excel no lo ve.

**celda**
- **Definición técnica:** elemento `<c r="B2">` de una fila (`<row r="2">`); guarda un número en `<v>`, un texto en `<is><t>` o una fórmula en `<f>`.
- **En palabras sencillas:** la casilla de la cuadrícula, con su dirección de columna y fila.
- **Dónde se rompe la comparación:** en Excel las filas empiezan en 1, no en 0 como los índices de una lista de Java.
- **Ejemplo:** `celda("B2", 3, 0)` produce `<c r="B2"><v>3</v></c>`.
- **Error típico:** escribir los datos desde la fila 1 y pisar los encabezados.

**ResultSetMetaData**
- **Definición técnica:** objeto de JDBC que describe las columnas de un resultado: cuántas son, su nombre o alias (`getColumnLabel`) y su tipo.
- **En palabras sencillas:** la fila de títulos que viene con la respuesta de la base.
- **Dónde se rompe la comparación:** describe columnas, no datos: no dice cuántas filas habrá.
- **Ejemplo:** para `SELECT 1 AS uno, 'x' AS letra`, `getColumnLabel(1)` y `getColumnLabel(2)` devuelven `uno` y `letra`.
- **Error típico:** escribir los encabezados a mano y olvidarse de cambiarlos cuando cambia la consulta.

**fórmula viva**
- **Definición técnica:** celda que guarda una expresión (`<f>C2/B2</f>`) en lugar de un valor; la aplicación de hojas de cálculo la evalúa al abrir el archivo y cada vez que cambian sus celdas de origen.
- **En palabras sencillas:** una casilla que hace la cuenta sola.
- **Dónde se rompe la comparación:** quien genera el archivo no la calcula; el valor aparece cuando Excel o LibreOffice la evalúan.
- **Ejemplo:** la celda E2 guarda `C2/B2` y, recién generada, no tiene valor: `Verificar.java` muestra `=C2/B2 -> null`.
- **Error típico:** calcular el porcentaje en Java y escribir el número: el reporte deja de ser vivo.

**formato numérico**
- **Definición técnica:** regla de presentación de una celda definida en `xl/styles.xml`; el formato integrado 9 es `0%`.
- **En palabras sencillas:** el disfraz con que se muestra el número, sin cambiarlo.
- **Dónde se rompe la comparación:** el valor sigue siendo `0.666…`; solo cambia cómo se ve (`67%`).
- **Ejemplo:** el estilo 1 de `ReporteExcel.java` es `<xf numFmtId="9" applyNumberFormat="1"/>`, y la columna E lo usa.
- **Error típico:** multiplicar por 100 y además aplicar `0%`: Excel muestra `6667%`.

**tabla de Excel**
- **Definición técnica:** rango con nombre (`xl/tables/table1.xml`) que agrega encabezados con filtro, estilo de bandas y referencias por nombre de columna.
- **En palabras sencillas:** convertir un rango suelto en un listado con flechas de filtro.
- **Dónde se rompe la comparación:** el rango no crece solo desde el programa; si agregas filas, debes ampliar `ref`.
- **Ejemplo:** el reporte declara `ResumenZonas` con `ref="A1:E3"`, y LibreOffice la conserva al guardar.
- **Error típico:** usar espacios en el nombre; `ReporteExcel.java` lo rechaza antes de escribir: `IllegalArgumentException: nombre de tabla inválido: 'Resumen Zonas'`.

**valor calculado**
- **Definición técnica:** resultado de una fórmula que la aplicación guarda en `<v>` junto a la fórmula al grabar el archivo, para mostrarlo sin recalcular.
- **En palabras sencillas:** la respuesta de la cuenta, escrita al lado de la cuenta.
- **Dónde se rompe la comparación:** un archivo recién generado por un programa no la trae; solo después de abrirlo y guardarlo en Excel o LibreOffice.
- **Ejemplo:** tras recalcular con LibreOffice, `Verificar.java` muestra `E2 =C2/B2 -> 0.666666666666667`.
- **Error típico:** dar por verificado un reporte leyendo un archivo recién creado: los `null` no prueban nada.

#### ► CÓMO FUNCIONA
El trabajo se reparte. **SQL agrupa y cuenta**, porque lo hace mejor y más rápido. **Excel presenta, filtra y
recalcula**, porque es donde trabaja quien lee el reporte. Java solo une las dos partes, escribiendo el `.xlsx` con
`java.util.zip`, sin bibliotecas externas:

```mermaid
flowchart LR
    D[(SQLite)] --> Q[consulta GROUP BY]
    Q --> W[ZipOutputStream]
    W --> X[reporte-entregas.xlsx]
    X --> F[fórmulas y filtros en Excel]
```

Una fórmula escrita por el programa viaja como texto dentro del `.xlsx`. Excel o LibreOffice la calculan al abrir el
archivo. Por eso la verificación tiene dos niveles: leer las fórmulas y, si quieres los números, recalcular.

#### Problema resuelto 7.1
Genera `reporte-entregas.xlsx` con el resumen por zona: envíos, entregadas, kilos y efectividad como fórmula, más
una fila de total y una tabla con filtros.

**Razonamiento:**
1. La consulta agrupa por zona; `ResultSetMetaData` da los encabezados sin escribirlos a mano.
2. Los datos empiezan en la fila 2; la efectividad de la fila `r` es `=C{r}/B{r}`, con formato `0%`.
3. La tabla de Excel cubre encabezados y datos; el total va debajo, fuera de la tabla.
4. El `.xlsx` es un ZIP: `ZipOutputStream` escribe sus ocho partes XML. En un proyecto grande se usa una biblioteca
   como Apache POI; aquí se arma a mano para ver qué hay dentro.
5. Para verificar, `Verificar.java` (Problema resuelto 7.2) vuelve a abrir el archivo y muestra cada celda.

```java
// ReporteExcel.java — de una consulta SQL a un Excel con fórmulas vivas, solo con el JDK
import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

static final String TABLA = "ResumenZonas";

String celda(String ref, Object valor, int estilo) {        // estilo 0 normal, 1 porcentaje, 2 negrita
    String s = estilo == 0 ? "" : " s=\"" + estilo + "\"";
    if (valor instanceof Number numero) {
        return "<c r=\"" + ref + "\"" + s + "><v>" + numero + "</v></c>";
    }
    String texto = String.valueOf(valor).replace("&", "&amp;").replace("<", "&lt;");
    if (texto.startsWith("=")) {                               // fórmula viva: Excel la recalcula
        return "<c r=\"" + ref + "\"" + s + "><f>" + texto.substring(1) + "</f></c>";
    }
    return "<c r=\"" + ref + "\" t=\"inlineStr\"" + s + "><is><t>" + texto + "</t></is></c>";
}

void agregar(ZipOutputStream zip, String nombre, String xml) throws IOException {
    zip.putNextEntry(new ZipEntry(nombre));
    zip.write(("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + xml).getBytes(StandardCharsets.UTF_8));
    zip.closeEntry();
}

void main() throws Exception {
    if (!TABLA.matches("[A-Za-z_][A-Za-z0-9_]*")) {
        throw new IllegalArgumentException("nombre de tabla inválido: '" + TABLA + "' (sin espacios ni signos)");
    }
    List<String> encabezados = new ArrayList<>();
    List<List<Object>> filas = new ArrayList<>();
    try (Connection db = Bd.abrir(":memory:")) {
        Bd.script(db, """
                CREATE TABLE entrega (guia TEXT, zona TEXT, mensajero TEXT, kilos REAL, estado TEXT);
                INSERT INTO entrega VALUES
                 ('BO-1','Norte','Ana',2.5,'entregada'), ('BO-2','Norte','Ana',4,'fallida'),
                 ('BO-3','Sur','Beto',1,'entregada'),    ('BO-4','Sur','Beto',7.25,'entregada'),
                 ('BO-5','Norte','Caro',3,'entregada');
                """);
        // SQL hace el trabajo pesado (agrupar); Excel presenta, filtra y calcula sobre el resultado
        String consulta = """
                SELECT zona, COUNT(*) AS envios,
                       SUM(estado = 'entregada') AS entregadas,
                       ROUND(SUM(kilos), 2) AS kilos
                FROM entrega GROUP BY zona ORDER BY zona""";
        try (var sentencia = db.createStatement(); ResultSet resultado = sentencia.executeQuery(consulta)) {
            var meta = resultado.getMetaData();                      // describe las columnas del resultado
            for (int c = 1; c <= meta.getColumnCount(); c++) {
                encabezados.add(meta.getColumnLabel(c));
            }
            while (resultado.next()) {
                List<Object> fila = new ArrayList<>();
                for (int c = 1; c <= meta.getColumnCount(); c++) {
                    fila.add(resultado.getObject(c));
                }
                filas.add(fila);
            }
        }
    }

    StringBuilder hoja = new StringBuilder("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\""
            + " xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"><sheetData>");
    hoja.append("<row r=\"1\">");
    String columnas = "ABCDE";
    encabezados.add("efectividad");
    for (int c = 0; c < encabezados.size(); c++) {
        hoja.append(celda(columnas.charAt(c) + "1", encabezados.get(c), 2));
    }
    hoja.append("</row>");
    for (int i = 0; i < filas.size(); i++) {
        int r = i + 2;                                            // los datos empiezan en la fila 2
        hoja.append("<row r=\"").append(r).append("\">");
        for (int c = 0; c < filas.get(i).size(); c++) {
            hoja.append(celda(columnas.charAt(c) + "" + r, filas.get(i).get(c), 0));
        }
        hoja.append(celda("E" + r, "=C" + r + "/B" + r, 1)).append("</row>");
    }
    int total = filas.size() + 2;
    hoja.append("<row r=\"").append(total).append("\">").append(celda("A" + total, "Total", 2))
            .append(celda("B" + total, "=SUM(B2:B" + (total - 1) + ")", 0)).append("</row>");
    hoja.append("</sheetData><tableParts count=\"1\"><tablePart r:id=\"rId1\"/></tableParts></worksheet>");

    String rango = "A1:E" + (total - 1);
    StringBuilder tabla = new StringBuilder("<table xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\""
            + " id=\"1\" name=\"" + TABLA + "\" displayName=\"" + TABLA + "\" ref=\"" + rango + "\">"
            + "<autoFilter ref=\"" + rango + "\"/><tableColumns count=\"5\">");
    for (int c = 0; c < 5; c++) {
        tabla.append("<tableColumn id=\"").append(c + 1).append("\" name=\"").append(encabezados.get(c)).append("\"/>");
    }
    tabla.append("</tableColumns><tableStyleInfo name=\"TableStyleMedium9\" showRowStripes=\"1\"/></table>");

    try (var zip = new ZipOutputStream(new FileOutputStream("reporte-entregas.xlsx"))) {
        agregar(zip, "[Content_Types].xml", """
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\
                <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\
                <Default Extension="xml" ContentType="application/xml"/>\
                <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\
                <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\
                <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>\
                <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>\
                </Types>""");
        agregar(zip, "_rels/.rels", """
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\
                </Relationships>""");
        agregar(zip, "xl/workbook.xml", """
                <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" \
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\
                <sheets><sheet name="Resumen por zona" sheetId="1" r:id="rId1"/></sheets></workbook>""");
        agregar(zip, "xl/_rels/workbook.xml.rels", """
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>\
                <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\
                </Relationships>""");
        agregar(zip, "xl/styles.xml", """
                <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\
                <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>\
                <fills count="1"><fill><patternFill patternType="none"/></fill></fills>\
                <borders count="1"><border/></borders>\
                <cellStyleXfs count="1"><xf/></cellStyleXfs>\
                <cellXfs count="3"><xf/><xf numFmtId="9" applyNumberFormat="1"/><xf fontId="1" applyFont="1"/></cellXfs>\
                </styleSheet>""");
        agregar(zip, "xl/worksheets/sheet1.xml", hoja.toString());
        agregar(zip, "xl/worksheets/_rels/sheet1.xml.rels", """
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/>\
                </Relationships>""");
        agregar(zip, "xl/tables/table1.xml", tabla.toString());
    }
    IO.println("reporte-entregas.xlsx: " + filas.size() + " zonas, tabla " + TABLA + " en " + rango + ", total en la fila " + total);
}
```

```text
$ javasql ReporteExcel.java
reporte-entregas.xlsx: 2 zonas, tabla ResumenZonas en A1:E3, total en la fila 4
```

**Explicación por partes.**
- Líneas 10–20: `celda` escribe un número en `<v>`, una fórmula (texto que empieza con `=`) en `<f>` y un texto en
  `<is><t>`, escapando `&` y `<`.
- Líneas 22–26: `agregar` mete cada parte XML en el ZIP.
- Líneas 28–30: el nombre de la tabla se valida antes de escribir nada.
- Líneas 43–47: `SUM(estado = 'entregada')` cuenta entregadas; `ROUND(..., 2)` deja dos decimales en kilos.
- Líneas 48–60: `getMetaData()` da los nombres de las columnas, y cada fila se copia a una lista.
- Líneas 72–79: los datos empiezan en la fila 2; cada fila agrega su fórmula de efectividad con el estilo 1 (`0%`).
- Líneas 80–83: el total queda en la fila 4 con `=SUM(B2:B3)`.
- Líneas 85–92: la tabla `ResumenZonas` cubre `A1:E3` y activa los filtros con `<autoFilter>`.
- Líneas 94–131: las partes del ZIP. `[Content_Types].xml` declara el tipo de cada parte y los `.rels` las conectan;
  `styles.xml` define los tres estilos (normal, porcentaje y negrita).

> **Error común.** Nombrar la tabla con espacios. Excel no los acepta en el nombre de una tabla; con
> `TABLA = "Resumen Zonas"`, el programa se detiene con
> `IllegalArgumentException: nombre de tabla inválido: 'Resumen Zonas' (sin espacios ni signos)` antes de escribir el
> archivo. Usa nombres en *PascalCase* (`ResumenZonas`) o con guion bajo.

> **Buena práctica.** Deja que SQL agregue y que Excel solo calcule proporciones simples sobre esas filas. Si
> mueves el `GROUP BY` a Excel, el archivo pesa más y la lógica queda repartida en dos lugares.

#### Problema resuelto 7.2
Comprueba que las fórmulas producen los números esperados. Lee el archivo antes y después de recalcularlo con
LibreOffice en modo sin ventana.

**Razonamiento:**
1. `Verificar.java` abre el ZIP con `ZipFile`, busca cada `<c>` de la hoja y muestra la fórmula (`<f>`) y el valor
   (`<v>`). LibreOffice guarda los textos en una lista compartida (`xl/sharedStrings.xml`); el programa la usa.
2. Recién generado, el archivo no tiene valores calculados: se espera `null` en las fórmulas.
3. LibreOffice puede abrirlo, recalcular y guardarlo de nuevo con `--convert-to xlsx`.
4. Después, Norte debe dar 2/3 ≈ 0.667, Sur 1 y el total 5.

```java
// Verificar.java — muestra cada celda de un .xlsx: la fórmula guardada y, si existe, el valor calculado
import java.util.regex.Pattern;
import java.util.zip.ZipFile;

static final Pattern CELDA = Pattern.compile("<c r=\"([A-Z]+\\d+)\"([^>]*?)(/>|>(.*?)</c>)");

String parte(ZipFile zip, String nombre) throws IOException {
    var entrada = zip.getEntry(nombre);
    return entrada == null ? "" : new String(zip.getInputStream(entrada).readAllBytes(), StandardCharsets.UTF_8);
}

String grupo(String regex, String texto) {
    var m = Pattern.compile(regex, Pattern.DOTALL).matcher(texto);
    return m.find() ? m.group(1) : null;
}

void main(String[] args) throws IOException {
    try (ZipFile zip = new ZipFile(args[0])) {
        List<String> compartidas = Pattern.compile("<si>(.*?)</si>", Pattern.DOTALL)   // textos compartidos
                .matcher(parte(zip, "xl/sharedStrings.xml")).results()
                .map(m -> m.group(1).replaceAll("<[^>]+>", "")).toList();
        var celdas = CELDA.matcher(parte(zip, "xl/worksheets/sheet1.xml"));
        while (celdas.find()) {
            String atributos = celdas.group(2);
            String contenido = celdas.group(4) == null ? "" : celdas.group(4);
            String formula = grupo("<f[^>]*>(.*?)</f>", contenido);
            String valor = grupo("<v>(.*?)</v>", contenido);
            if (atributos.contains("t=\"s\"") && valor != null) {
                valor = compartidas.get(Integer.parseInt(valor));
            } else if (atributos.contains("inlineStr")) {
                valor = grupo("<t>(.*?)</t>", contenido);
            }
            if (formula != null || valor != null) {
                IO.println(celdas.group(1) + " " + (formula != null ? "=" + formula + " -> " + valor : valor));
            }
        }
    }
}
```

```text
$ java Verificar.java reporte-entregas.xlsx
A1 zona
B1 envios
C1 entregadas
D1 kilos
E1 efectividad
A2 Norte
B2 3
C2 2
D2 9.5
E2 =C2/B2 -> null
A3 Sur
B3 2
C3 2
D3 8.25
E3 =C3/B3 -> null
A4 Total
B4 =SUM(B2:B3) -> null
$ soffice --headless --convert-to xlsx --outdir calculado reporte-entregas.xlsx > /dev/null
$ java Verificar.java calculado/reporte-entregas.xlsx
A1 zona
B1 envios
C1 entregadas
D1 kilos
E1 efectividad
A2 Norte
B2 3
C2 2
D2 9.5
E2 =C2/B2 -> 0.666666666666667
A3 Sur
B3 2
C3 2
D3 8.25
E3 =C3/B3 -> 1
A4 Total
B4 =SUM(B2:B3) -> 5
```

**Explicación por partes.**
- Línea 5: la expresión captura la dirección de la celda, sus atributos y su contenido.
- Líneas 7–10: `parte` lee una entrada del ZIP como texto, o `""` si no existe.
- Líneas 19–21: los textos compartidos se leen una vez, en orden.
- Línea 26: `<f[^>]*>` acepta atributos, porque LibreOffice escribe `<f aca="false">`.
- Primera ejecución: las fórmulas de efectividad y el total están en `null`; nadie los calculó aún.
- Segunda ejecución: LibreOffice calculó `0.666666666666667` para Norte, `1` para Sur y `5` en el total.
- No necesita el controlador de SQLite: se ejecuta con `java` a secas.

> **Prevenir errores.** Si no tienes LibreOffice, abre el archivo en Excel y revisa la columna E. Nunca entregues un
> reporte verificado solo leyendo el archivo recién creado: los `null` no prueban nada.

#### Checkpoint 7.1
Si en la base cambias `BO-2` a `entregada` y vuelves a ejecutar `ReporteExcel.java`, ¿qué muestra Excel en la
efectividad de Norte?

Respuesta: `100%`. La consulta devuelve 3 entregadas de 3 envíos, y la fórmula `=C2/B2` da 1, que el formato `0%`
muestra como `100%`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara el entorno
Trabaja en `~/labs/sql`. No hace falta instalar nada: el `.xlsx` se escribe con el JDK. Para el Paso 4 necesitas
LibreOffice (`soffice --version`).

#### Paso 2 · Genera el reporte
Guarda `ReporteExcel.java` y ejecútalo. Después mira dentro del archivo con `unzip -l reporte-entregas.xlsx`: debe listar ocho partes.

#### Paso 3 · Abre el archivo
Abre `reporte-entregas.xlsx` en Excel o LibreOffice. Comprueba que los encabezados tienen flechas de filtro y que
la efectividad se ve como `67%` y `100%`.

#### Paso 4 · Verifica los valores
Guarda `Verificar.java` y ejecútalo antes y después de recalcular, como en el Problema resuelto 7.2.

#### Resumen
- El **formato .xlsx** es un ZIP de partes XML; un **libro** contiene **hojas** y cada hoja, **celdas**.
- **ResultSetMetaData** entrega los nombres de las columnas de la consulta.
- Una **fórmula viva** se guarda como texto que empieza con `=` y la calcula la aplicación de hojas de cálculo.
- El **formato numérico** cambia cómo se ve un valor, no el valor.
- Una **tabla de Excel** agrega filtros y estilo a un rango con nombre.
- El **valor calculado** solo existe después de que Excel o LibreOffice evalúan la fórmula y guardan el archivo.

#### Ejercicio verificable 1
Básico. Agrega una columna F `kilos_promedio` con la fórmula `=D{r}/B{r}` en cada fila de datos (amplía `columnas` a
`"ABCDEF"` y agrega el encabezado). ¿Qué valor muestra
LibreOffice para Norte?

Respuesta esperada: `3.16666666666667` (9.5 kg entre 3 envíos). En el archivo, la celda F2 guarda el texto `=D2/B2`.

#### Ejercicio verificable 2
Intermedio. Cambia `TABLA = "ResumenZonas"` por `TABLA = "Resumen Zonas"` y ejecuta el programa.

Respuesta esperada: `IllegalArgumentException: nombre de tabla inválido: 'Resumen Zonas' (sin espacios ni signos)`.
El archivo no se escribe, porque la validación ocurre antes de abrir el ZIP.

#### Ejercicio verificable 3
Reto. Agrega una hoja `Detalle` con todas las entregas ordenadas por guía, con los encabezados tomados de
`ResultSetMetaData`.

Respuesta esperada: cuatro cambios. Una parte nueva `xl/worksheets/sheet2.xml` con 6 filas (un encabezado y cinco
entregas); `<sheet name="Detalle" sheetId="2" r:id="rId3"/>` en `workbook.xml`; la relación `rId3` en
`xl/_rels/workbook.xml.rels`; y su `<Override>` en `[Content_Types].xml`. Al abrirlo, LibreOffice muestra las pestañas
`Resumen por zona` y `Detalle`.

#### En el trabajo
Muchas áreas de una empresa viven en Excel: finanzas, operaciones, comercial. Un reporte generado desde SQL con
fórmulas vivas evita las copias a mano y sus errores. En producción, estos scripts corren en una tarea programada y
envían el archivo por correo o lo dejan en una carpeta compartida. Para tableros interactivos se usan herramientas
de BI, pero el Excel generado sigue siendo el formato que todos abren.

</details>

### Proyecto 4: migrar el inventario CSV a SQLite

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

En el Proyecto 2 (Módulo 2 de Fundamentos) guardaste el inventario de la bodega en `inventario.csv`. Ahora lo pasas a la base relacional de este módulo:
categorías y productos en tablas separadas, restricciones que rechazan datos inválidos y una sola transacción. Si
un producto falla, no se migra ninguno.

**Criterios de aceptación:**
- el esquema tiene `categorias` y `productos` con clave primaria, clave foránea, `UNIQUE` y `CHECK`;
- todos los `INSERT` son consultas parametrizadas;
- un SKU repetido cancela la migración completa y la base queda con 0 productos;
- con datos válidos, el número de productos en la base es igual al número de líneas de datos del CSV.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara los datos
Crea `inventario.csv` con el formato del Proyecto 2 más una columna de categoría, y con un SKU repetido a propósito
en la última línea:

```text
sku;nombre;stock;categoria
A-10;Teclado;4;Periféricos
A-11;Mouse;12;Periféricos
E-20;Caja mediana;3;Empaque
E-20;Caja grande;7;Empaque
```

#### Paso 2 · Escribe la migración
El programa crea el esquema, activa las claves foráneas y migra dentro de una transacción. La categoría se busca con
una subconsulta en el mismo `INSERT`:

```java
// MigrarCsv.java — pasa inventario.csv a inventario.db en una sola transacción
import java.sql.Connection;
import java.sql.SQLException;

void main() throws Exception {
    List<String> lineas = Files.readAllLines(Path.of("inventario.csv"));
    Files.deleteIfExists(Path.of("inventario.db"));
    try (Connection conexion = Bd.abrir("inventario.db")) {
        Bd.script(conexion, "PRAGMA foreign_keys = ON");
        Bd.script(conexion, """
                CREATE TABLE categorias (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL UNIQUE);
                CREATE TABLE productos (
                  id INTEGER PRIMARY KEY,
                  sku TEXT NOT NULL UNIQUE,
                  nombre TEXT NOT NULL,
                  stock INTEGER NOT NULL CHECK (stock >= 0),
                  categoria_id INTEGER NOT NULL REFERENCES categorias(id)
                );
                """);

        List<String> productos = lineas.subList(1, lineas.size());   // sin la cabecera
        String actual = "";
        conexion.setAutoCommit(false);
        try {
            for (String linea : productos) {
                String[] c = linea.split(";");                         // sku;nombre;stock;categoria
                actual = c[0];
                Bd.ejecutar(conexion, "INSERT OR IGNORE INTO categorias(nombre) VALUES (?)", c[3]);
                Bd.ejecutar(conexion, """
                        INSERT INTO productos(sku, nombre, stock, categoria_id)
                        VALUES (?, ?, ?, (SELECT id FROM categorias WHERE nombre = ?))""",
                        c[0], c[1], Integer.parseInt(c[2]), c[3]);
            }
            conexion.commit();
            IO.println("migrados: " + productos.size());
        } catch (SQLException error) {
            conexion.rollback();
            IO.println("migración cancelada: " + Bd.error(error) + " | producto: " + actual);
        }
        conexion.setAutoCommit(true);
        IO.println("productos en la base: " + Bd.valor(conexion, "SELECT COUNT(*) FROM productos"));
    }
}
```

```text
$ javasql MigrarCsv.java
migración cancelada: UNIQUE constraint failed: productos.sku | producto: E-20
productos en la base: 0
$ sed -i '$d' inventario.csv
$ javasql MigrarCsv.java
migrados: 3
productos en la base: 3
```

La primera ejecución encuentra `E-20` repetido, ejecuta `rollback()` y deja 0 productos, aunque los tres primeros ya
se habían insertado dentro de la transacción. `sed -i '$d'` borra la última línea del archivo; la segunda ejecución
migra los 3.

#### Paso 3 · Consulta el resultado
Con la base migrada, aplica las consultas del Tema 2: stock bajo con `LEFT JOIN` y unidades por categoría. Después
genera el reporte del Tema 7 a partir de estas tablas.

</details>
