# Plan curricular verificable: Bases de datos con Java (JDBC) de cero a experto

Estado: diseño curricular aprobado para implementación progresiva. **No es todavía
un track publicado ni acredita lecciones terminadas.** Cada módulo se publicará
cuando sus temas cumplan el contrato de profundidad, ejecución y revisión humana
(mapa de subtemas, explicación individual, evidencia ejecutada en JDK 27).

## Motivo del curso separado

En el track Java, JDBC aparece corto y por encima: Módulo 17 tiene solo 2 temas
(`JDBC, PreparedStatement y DAO`; `Transacciones, ACID y aislamiento`). JPA/
Hibernate (M16) está aparte y asume que ya entiendes qué hay debajo. Pero JDBC es
la base de **todo** acceso a datos en Java —incluidos JPA, Spring Data y los
drivers— y da para un curso completo: el modelo `Driver`/`Connection`/`Statement`/
`ResultSet`, pooling, batch, metadata, RowSet, niveles de aislamiento y anomalías,
savepoints, SQL injection a fondo, streaming de resultados grandes, tipos
(`BLOB`/`CLOB`/fechas/`NULL`), y operación en producción (timeouts, reintentos,
fugas de conexión). Core Java II le dedica un capítulo propio (§5.1–5.10).

Este curso enseña el **acceso a datos relacional desde Java como disciplina**:
cómo hablar con una base de datos sin fugas, sin inyección, con transacciones
correctas y con rendimiento, entendiendo qué hace realmente el framework (JPA/
Spring Data) que lo envuelve.

## Frontera con los tracks Java y Spring Boot

- El track Java conserva la introducción a JDBC (M17) para su proyecto.
- El track Spring Boot conserva Spring Data/JPA como abstracción de aplicación.
- Este curso desarrolla JDBC y el modelo relacional **de cero a experto** como
  fundamento común: lo que JPA y Spring Data usan por debajo.
- Quien no tenga Java básico o nociones de SQL vuelve al tema exacto (Java M0–M3,
  Fundamentos de SQL), no recibe un resumen superficial aquí.

**Prerrequisitos del curso:** Java hasta excepciones y try-with-resources
(Java M0–M3); SQL básico (SELECT/INSERT/UPDATE/DELETE, claves); una base de datos
local (PostgreSQL en Docker) y JDK 27.

**Proyecto progresivo:** `rutaflow-datos`, el acceso a datos de RutaFlow: guías,
conductores, liquidaciones y eventos de tracking. Empieza con una conexión manual
y una consulta, y evoluciona hasta un DAO con pool, transacciones correctas,
batch, paginación por streaming y migraciones versionadas.

## Secuencia completa

### Módulo 0 · El modelo de JDBC y la primera conexión
- qué es un driver JDBC y cómo lo carga el `DriverManager`/`DataSource`;
- `Connection` como recurso: abrir, usar, **cerrar** (try-with-resources);
- URL de conexión, credenciales fuera del código, y por qué una conexión es cara;
- levantar PostgreSQL local en Docker para los ejemplos;
- evidencia: conectar, ejecutar `SELECT 1`, leer el resultado y cerrar sin fugas.

### Módulo 1 · Consultas: Statement, PreparedStatement y ResultSet
- `Statement` frente a `PreparedStatement` y por qué el segundo es la norma;
- parámetros posicionales, tipos y `setNull`;
- recorrer un `ResultSet`, tipos de columna y mapeo a objetos;
- `executeQuery`/`executeUpdate`/`execute` y qué devuelve cada uno;
- evidencia: insertar y consultar guías con `PreparedStatement`, mapeando a un record.

### Módulo 2 · SQL injection a fondo
- cómo nace una inyección al concatenar SQL con entrada del usuario;
- `PreparedStatement` como defensa real (el parámetro nunca es código);
- qué NO protege (nombres de tabla/columna dinámicos, `LIKE`, `IN` variable);
- allowlist para identificadores dinámicos; cuidado con `ORDER BY` por columna;
- evidencia: reproducir una inyección con `Statement` y neutralizarla con `PreparedStatement` y una allowlist.

### Módulo 3 · El patrón DAO y el mapeo objeto-relacional a mano
- separar acceso a datos (DAO) del dominio y del caso de uso;
- mapeo fila↔objeto explícito; por qué JPA automatiza esto;
- manejo de `NULL` del lado SQL frente a `Optional` del lado Java;
- `RowMapper` propio reutilizable;
- evidencia: un `GuiaDao` con CRUD completo y pruebas contra la base local.

### Módulo 4 · Transacciones, ACID y commit/rollback
- `setAutoCommit(false)`, `commit`, `rollback`;
- atomicidad: varias operaciones como una unidad;
- la transacción como recurso: cerrar y revertir ante excepción;
- el error de dejar `autoCommit` activo en una operación compuesta;
- evidencia: una transferencia (debitar + acreditar) que revierte íntegra ante un fallo.

### Módulo 5 · Niveles de aislamiento y anomalías de concurrencia
- dirty read, non-repeatable read, phantom read;
- los cuatro niveles (READ UNCOMMITTED → SERIALIZABLE) y qué previene cada uno;
- el costo de aislar: bloqueo y contención;
- `setTransactionIsolation` y el comportamiento real en PostgreSQL;
- evidencia: reproducir un non-repeatable read con dos conexiones y eliminarlo subiendo el nivel.

### Módulo 6 · Savepoints y transacciones anidadas lógicas
- `Savepoint`, rollback parcial a un punto;
- cuándo un savepoint frente a dividir la transacción;
- el límite: una transacción sigue siendo una, el savepoint no es anidamiento real;
- evidencia: procesar un lote donde una fila inválida revierte solo su parte con un savepoint.

### Módulo 7 · Pooling de conexiones
- por qué abrir una conexión por petición no escala;
- un pool (HikariCP): tamaño, timeout de adquisición, fugas;
- `DataSource` frente a `DriverManager`;
- detectar una fuga de conexión (connection leak) y el leak detection;
- evidencia: medir la diferencia entre abrir conexión por operación y usar un pool, y provocar/diagnosticar una fuga.

### Módulo 8 · Batch y operaciones masivas
- `addBatch`/`executeBatch` y por qué reduce round-trips;
- tamaño de lote y `rewriteBatchedStatements`;
- recuperar claves generadas (`getGeneratedKeys`);
- evidencia: insertar 100 000 filas con y sin batch y comparar el tiempo con una medición honesta.

### Módulo 9 · Resultados grandes: streaming, fetch size y paginación
- `setFetchSize` y el cursor del lado servidor (evitar cargar todo en memoria);
- paginación por keyset frente a `OFFSET` y por qué keyset escala;
- `ResultSet` scrollable y updatable: cuándo sirven y cuándo no;
- evidencia: recorrer un millón de filas sin agotar memoria y paginar por keyset.

### Módulo 10 · Tipos de datos: fechas, decimales, BLOB/CLOB y NULL
- mapear `java.time` ↔ tipos SQL de fecha/hora con zona;
- `BigDecimal` para dinero (no `double`), escala y redondeo del lado SQL;
- `BLOB`/`CLOB` y streaming de binarios grandes;
- `NULL` SQL frente a `null`/`Optional` Java; `wasNull`;
- evidencia: persistir y leer una liquidación con dinero exacto, una fecha con zona y un archivo binario.

### Módulo 11 · Metadata y RowSet
- `DatabaseMetaData` y `ResultSetMetaData`: inspeccionar esquema y columnas;
- `RowSet` (CachedRowSet) desconectado y cuándo usarlo;
- generar mapeos o validaciones a partir de la metadata;
- evidencia: listar columnas y tipos de una tabla y validar un INSERT contra el esquema real.

### Módulo 12 · Operación en producción
- timeouts de consulta (`setQueryTimeout`), cancelación y reintentos idempotentes;
- traducción de `SQLException` (SQLState, código del vendor) a errores de dominio;
- logging de SQL sin filtrar datos sensibles; observabilidad del pool;
- evidencia: una consulta que vence su timeout, se diagnostica por SQLState y se reintenta solo si es seguro.

### Módulo 13 · Migraciones de esquema versionadas
- por qué el esquema es código: migraciones versionadas (Flyway/Liquibase);
- orden, idempotencia y rollback de migraciones;
- datos de prueba y entornos reproducibles;
- evidencia: versionar el esquema de RutaFlow con migraciones y recrear la base desde cero de forma reproducible.

### Módulo 14 · De JDBC a JPA: qué automatiza el framework
- qué hace Spring Data/JPA por debajo con JDBC (conexión, mapeo, transacción);
- el problema N+1 visto desde JDBC (lo que JPA puede esconder);
- cuándo bajar a JDBC/SQL nativo dentro de una app JPA;
- evidencia: la misma consulta en JDBC puro y en JPA, comparando el SQL real emitido.

### Módulo 15 · Proyecto integrador: capa de datos profesional de RutaFlow
- `rutaflow-datos` completo: DAO con pool, transacciones y aislamiento correctos,
  batch, paginación por keyset, tipos exactos, metadata, timeouts y reintentos,
  migraciones versionadas y pruebas de integración reproducibles contra PostgreSQL.

## Método y puerta de calidad

Cada tema se construye desde cero contra un PostgreSQL local (Docker), con
archivos, comandos, salida real ejecutada (JDBC/JDK 27, driver PostgreSQL fijado),
un fallo deliberado con diagnóstico (fuga de conexión, inyección, anomalía de
aislamiento) y una práctica de transferencia al proyecto. Las APIs y el
comportamiento se contrastan con la especificación JDBC, la documentación del
driver PostgreSQL y Core Java II §5. Ningún tema se declara completo sin mapa de
subtemas, explicación individual y revisión humana; la deuda del trinquete no
puede aumentar. Enfoque defensivo: la inyección se enseña para prevenirla en
sistemas propios, no para atacar.
