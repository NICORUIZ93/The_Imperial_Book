# Módulo 17: JDBC, DAO y transacciones

**Proyecto del módulo:** dos proyectos Maven creados desde carpetas vacías para consultar envíos y liquidar cobros con H2. Escribirás cada DAO, configuración y prueba; cada tema tiene su propio proyecto y no reutiliza archivos del anterior.

## Aprende construyendo

La meta es comprender qué automatiza después un ORM: separar valores del SQL, acotar el acceso a datos y confirmar varias escrituras como una sola unidad. La seguridad de una consulta y la consistencia de una operación de negocio son propiedades distintas y necesitan pruebas distintas.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** inserta una referencia, consúltala con `PreparedStatement` y comprueba por separado los casos encontrado, ausente y dato hostil.
- **Caso RutaFlow:** liquida un envío registrando su cobro y cambiando su estado en la misma transacción. Un fallo intermedio no puede dejar un cobro parcial; una clave de idempotencia evita duplicar la operación al reintentar una solicitud.

### Tema 1: JDBC, PreparedStatement y DAO · Intermedio · 1 h

#### Aprende

**Prerrequisito:** JDK 27, Maven 3.9 o superior, clases, excepciones y SQL básico. Comprueba `java --version` y `mvn --version`.

**Al terminar podrás:** crear un DAO con `DataSource` y `PreparedStatement`, insertar y consultar registros, y demostrar con una prueba que una referencia hostil se trata como un valor y no como SQL.

JDBC es la API estándar de Java para ejecutar SQL. `DataSource` proporciona conexiones, normalmente mediante un pool; `PreparedStatement` conserva fija la estructura de la sentencia y enlaza los valores por posición. El DAO encapsula SQL y mapeo para que el servicio no tenga que conocer `Connection` ni `ResultSet`.

**¿Por qué es importante?** Porque concatenar datos introducidos por usuarios permite cambiar el significado de una consulta. Además, repetir SQL y mapeo en varios servicios produce reglas de acceso inconsistentes y dificulta probarlas.

**Analogía:** un `PreparedStatement` es un formulario con preguntas impresas y casillas vacías: puedes escribir cualquier respuesta en una casilla, pero no reescribir las preguntas. El DAO es la ventanilla que conoce ese formulario para que el resto de la aplicación no lo improvise.

Los parámetros protegen valores, no identificadores. No puedes enlazar con `?` un nombre de tabla, una columna o la dirección `ASC`/`DESC`; cuando el usuario elige un orden, traduce su opción mediante una lista permitida. Un DAO también debe tener consultas reconocibles: evita una clase genérica con operaciones vagas que oculten accesos muy diferentes.

**Cuándo no usarlo:** no construyas una capa DAO manual para ocultar CRUD estándar sin reglas propias; en ese caso, Spring Data puede reducir repetición. Conserva JDBC explícito cuando necesites controlar SQL, mapeo o transacciones con precisión.

#### Practica

Crea una carpeta vacía y todos los archivos del primer proyecto:

```bash
mkdir ejemplo-jdbc-dao
cd ejemplo-jdbc-dao
mkdir -p src/main/java/academia/envios src/test/java/academia/envios
```

Escribe `pom.xml` sin usar un generador:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia</groupId>
  <artifactId>jdbc-dao</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>27</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>com.h2database</groupId><artifactId>h2</artifactId><version>2.3.232</version><scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>5.11.4</version><scope>test</scope>
    </dependency>
  </dependencies>
  <build><plugins><plugin>
    <groupId>org.apache.maven.plugins</groupId><artifactId>maven-surefire-plugin</artifactId><version>3.5.2</version>
  </plugin></plugins></build>
</project>
```

Crea `src/main/java/academia/envios/EnvioDao.java`:

```java
package academia.envios;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import javax.sql.DataSource;

public final class EnvioDao {
    private final DataSource dataSource;

    public EnvioDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void crear(String referencia, String estado) throws SQLException {
        String sql = "insert into envio(referencia, estado) values (?, ?)";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, referencia);
            statement.setString(2, estado);
            int filas = statement.executeUpdate();
            if (filas != 1) {
                throw new SQLException("Se esperaba insertar una fila, filas=" + filas);
            }
        }
    }

    public Optional<String> buscarEstado(String referencia) throws SQLException {
        String sql = "select estado from envio where referencia = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, referencia);
            try (ResultSet result = statement.executeQuery()) {
                return result.next()
                    ? Optional.of(result.getString("estado"))
                    : Optional.empty();
            }
        }
    }
}
```

Crea `src/test/java/academia/envios/EnvioDaoTest.java`:

```java
package academia.envios;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EnvioDaoTest {
    private EnvioDao dao;

    @BeforeEach
    void preparar() throws SQLException {
        JdbcDataSource dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:envios;DB_CLOSE_DELAY=-1");
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("drop all objects");
            statement.execute("create table envio("
                + "referencia varchar(40) primary key, estado varchar(20) not null)");
        }
        dao = new EnvioDao(dataSource);
    }

    @Test
    void encuentraUnaReferenciaExistente() throws SQLException {
        dao.crear("ENV-1", "EN_PREPARACION");
        assertEquals(Optional.of("EN_PREPARACION"), dao.buscarEstado("ENV-1"));
    }

    @Test
    void distingueAusenteDeDatoHostil() throws SQLException {
        dao.crear("ENV-1", "EN_PREPARACION");
        assertEquals(Optional.empty(), dao.buscarEstado("ENV-404"));
        assertEquals(Optional.empty(), dao.buscarEstado("' OR '1'='1"));
    }

    @Test
    void laClaveDuplicadaNoPasaDesapercibida() throws SQLException {
        dao.crear("ENV-1", "EN_PREPARACION");
        assertThrows(SQLException.class, () -> dao.crear("ENV-1", "LIQUIDADO"));
    }
}
```

Ejecuta desde la raíz del proyecto:

```bash
mvn clean test
```

**Resultado esperado:** tres pruebas en verde y `BUILD SUCCESS`. La referencia `' OR '1'='1` no coincide con ninguna fila y devuelve `Optional.empty()`; no obtiene el estado de `ENV-1`.

**Fallo deliberado:** cambia temporalmente la consulta de `buscarEstado` por `"select estado from envio where referencia = '" + referencia + "'"`, elimina `statement.setString(1, referencia)` y repite las pruebas. El dato hostil altera la condición y el test de ausencia falla. **Corrección:** restaura el marcador `?` y el enlace del parámetro, y vuelve a ejecutar hasta recuperar las tres pruebas en verde.

#### Aplica

Agrega una búsqueda paginada con límite máximo y orden por `fecha_creacion` o `referencia`. Define una lista permitida que convierta la opción externa al identificador SQL; rechaza cualquier otra columna. Añade pruebas para tamaño excesivo, columna desconocida y dos páginas sin duplicados.

Como ejercicio independiente, extrae el mapeo de una fila a un método privado solo cuando dos consultas reales devuelvan el mismo objeto `Envio`. Incorpora ese record con validación de referencia y estado, sin crear un DAO genérico.

**Checklist de salida**

- [ ] El proyecto Maven y sus tres archivos se escribieron desde una carpeta vacía.
- [ ] Todos los valores variables se enlazan mediante `PreparedStatement`.
- [ ] `crear` comprueba que exactamente una fila fue insertada.
- [ ] Las pruebas distinguen encontrado, ausente, hostil y clave duplicada.
- [ ] La consulta concatenada reproduce el fallo y la versión parametrizada lo corrige.
- [ ] El orden dinámico procede de una lista permitida, no de SQL proporcionado por el usuario.

**Proyecto integrador:** crea en RutaFlow un DAO para consultar reportes de envíos con parámetros y orden permitido; conserva las pruebas de dato hostil y ausencia antes de sustituir el acceso manual por un ORM.

**Errores comunes:** concatenar valores, intentar parametrizar identificadores con `?`, ignorar el resultado de `executeUpdate()` y crear un DAO genérico que esconda consultas diferentes.

Fuentes oficiales: [PreparedStatement, JDK 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html), [DataSource, JDK 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/javax/sql/DataSource.html) y [H2 Database](https://h2database.com/html/main.html).

### Tema 2: Transacciones, ACID y aislamiento · Avanzado · 1 h 15 min

#### Aprende

**Prerrequisito:** JDK 27, Maven y comprensión de `DataSource`, `PreparedStatement` y excepciones. Este tema empieza en otra carpeta vacía y vuelve a escribir el DAO necesario.

**Al terminar podrás:** confirmar o revertir juntas dos escrituras relacionadas, probar un fallo intermedio y explicar qué invariante protege la transacción frente a concurrencia y reintentos.

Una transacción agrupa operaciones bajo propiedades ACID: atomicidad, consistencia, aislamiento y durabilidad. JDBC suele comenzar con autocommit; `setAutoCommit(false)` delimita la unidad y `commit()` o `rollback()` determina su resultado. Todas las operaciones de esa unidad deben usar la misma conexión.

**¿Por qué es importante?** Porque liquidar un envío exige registrar el cobro y cambiar el estado. Si el proceso falla entre ambas escrituras, una base con cobro y sin liquidación deja a la contabilidad y al seguimiento en desacuerdo.

**Analogía:** una transacción es un recibo de caja con varias líneas: o se entrega el recibo completo o se anula entero. El aislamiento es la cortina que impide que otra caja use una versión a medias del recibo.

El aislamiento define qué cambios concurrentes puede observar una transacción, pero no elimina por sí solo toda actualización perdida. Un bloqueo optimista con `version` detecta que otra operación modificó la fila entre lectura y escritura. Una restricción `UNIQUE` sobre una clave de idempotencia complementa la transacción cuando una solicitud puede repetirse.

**Cuándo no usarlo:** no mantengas una transacción abierta durante llamadas HTTP ni asumas que `SERIALIZABLE` es siempre necesario. Coordinar una base local con otros servicios requiere patrones como outbox o saga, no una transacción JDBC más larga.

#### Practica

Crea el segundo proyecto desde una carpeta vacía:

```bash
mkdir ejemplo-jdbc-transacciones
cd ejemplo-jdbc-transacciones
mkdir -p src/main/java/academia/envios src/test/java/academia/envios
```

Escribe `pom.xml` sin reutilizar el proyecto anterior:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia</groupId>
  <artifactId>jdbc-transacciones</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>27</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>com.h2database</groupId><artifactId>h2</artifactId><version>2.3.232</version><scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>5.11.4</version><scope>test</scope>
    </dependency>
  </dependencies>
  <build><plugins><plugin>
    <groupId>org.apache.maven.plugins</groupId><artifactId>maven-surefire-plugin</artifactId><version>3.5.2</version>
  </plugin></plugins></build>
</project>
```

Crea `src/main/java/academia/envios/LiquidacionDao.java`:

```java
package academia.envios;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import javax.sql.DataSource;

public final class LiquidacionDao {
    private final DataSource dataSource;

    public LiquidacionDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void liquidar(String referencia, BigDecimal importe) throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                insertarCobro(connection, referencia, importe);
                actualizarEstado(connection, referencia, "LIQUIDADO");
                connection.commit();
            } catch (SQLException error) {
                connection.rollback();
                throw error;
            }
        }
    }

    private void insertarCobro(Connection connection, String referencia, BigDecimal importe)
            throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "insert into cobro(referencia, importe) values (?, ?)")) {
            statement.setString(1, referencia);
            statement.setBigDecimal(2, importe);
            statement.executeUpdate();
        }
    }

    private void actualizarEstado(Connection connection, String referencia, String estado)
            throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "update envio set estado = ? where referencia = ?")) {
            statement.setString(1, estado);
            statement.setString(2, referencia);
            if (statement.executeUpdate() != 1) {
                throw new SQLException("El envío no existe o ya no es actualizable");
            }
        }
    }
}
```

Crea `src/test/java/academia/envios/LiquidacionDaoTest.java`:

```java
package academia.envios;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LiquidacionDaoTest {
    private JdbcDataSource dataSource;
    private LiquidacionDao dao;

    @BeforeEach
    void preparar() throws SQLException {
        dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:liquidaciones;DB_CLOSE_DELAY=-1");
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("drop all objects");
            statement.execute("create table envio("
                + "referencia varchar(40) primary key, estado varchar(20) not null)");
            statement.execute("create table cobro("
                + "id bigint generated by default as identity primary key,"
                + "referencia varchar(40) not null, importe decimal(12,2) not null)");
            statement.execute("insert into envio(referencia, estado) values "
                + "('ENV-1', 'EN_PREPARACION')");
        }
        dao = new LiquidacionDao(dataSource);
    }

    @Test
    void confirmaCobroYEstadoJuntos() throws SQLException {
        dao.liquidar("ENV-1", new BigDecimal("12.50"));
        assertEquals(1, entero("select count(*) from cobro where referencia = 'ENV-1'"));
        assertEquals("LIQUIDADO", texto(
            "select estado from envio where referencia = 'ENV-1'"));
    }

    @Test
    void revierteElCobroCuandoFallaLaActualizacion() throws SQLException {
        assertThrows(SQLException.class,
            () -> dao.liquidar("ENV-404", new BigDecimal("12.50")));
        assertEquals(0, entero("select count(*) from cobro"));
    }

    private int entero(String sql) throws SQLException {
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             var result = statement.executeQuery()) {
            result.next();
            return result.getInt(1);
        }
    }

    private String texto(String sql) throws SQLException {
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             var result = statement.executeQuery()) {
            result.next();
            return result.getString(1);
        }
    }
}
```

Ejecuta:

```bash
mvn clean test
```

**Resultado esperado:** dos pruebas en verde. La liquidación válida deja un cobro y el estado `LIQUIDADO`; la referencia inexistente inserta primero el cobro, falla porque el `UPDATE` afecta cero filas y el `rollback` deja la tabla `cobro` vacía.

**Fallo deliberado:** conserva la prueba de referencia inexistente, pero cambia temporalmente `insertarCobro(connection, referencia, importe)` para abrir otra conexión desde `dataSource` con autocommit. El rollback de la conexión original ya no puede deshacer ese cobro y la segunda prueba falla. **Corrección:** vuelve a pasar la misma conexión transaccional a ambos métodos y repite la prueba.

#### Aplica

Añade `operation_id varchar(80)` a `cobro` con restricción `UNIQUE` y haz que `liquidar` reciba esa clave. Ejecuta dos solicitudes con el mismo identificador y comprueba que no puede existir un segundo cobro; define cómo la capa superior distingue un reintento ya aplicado de un conflicto real.

Como ejercicio independiente, crea otro proyecto para transferir saldo entre dos cuentas. Valida importe positivo y saldo suficiente, descuenta y acredita en una transacción y prueba cuenta inexistente, fondos insuficientes y fallo entre escrituras. Después reproduce una actualización perdida con dos conexiones y corrígela con una columna `version` y `UPDATE ... WHERE version = ?`.

**Checklist de salida**

- [ ] El proyecto de transacciones se creó por separado desde una carpeta vacía.
- [ ] Las dos escrituras comparten una conexión con autocommit desactivado.
- [ ] El camino válido confirma cobro y estado; el fallo revierte ambos.
- [ ] La prueba con dos conexiones demuestra por qué una unidad no puede dividirse.
- [ ] La clave de idempotencia impide duplicar cobros al reintentar.
- [ ] El bloqueo optimista y el nivel de aislamiento se justifican con un caso concurrente.

**Proyecto integrador:** implementa la liquidación de RutaFlow con `operation_id` único, cobro y cambio de estado atómicos. Adjunta las pruebas de rollback y reintento antes de aceptar la operación como recuperable.

**Errores comunes:** usar conexiones distintas dentro de una unidad, omitir la prueba de fallo, mantener la transacción durante una llamada HTTP y suponer que una restricción única sustituye al rollback.

Fuentes oficiales: [Connection, JDK 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html), [Transaction Isolation, H2](https://h2database.com/html/advanced.html#transaction_isolation) y [Jakarta Persistence](https://jakarta.ee/specifications/persistence/).

## Construcción guiada del capítulo

| Evidencia | Proyecto independiente | Orden y resultado |
|---|---|---|
| Consulta parametrizada | `ejemplo-jdbc-dao` | `mvn clean test`: encontrado, ausente, hostil y duplicado; la concatenación falla y se corrige |
| Escritura atómica | `ejemplo-jdbc-transacciones` | `mvn clean test`: cobro y estado se confirman juntos; una referencia inválida revierte el cobro |
| Reintento seguro | Extensión de liquidación | Dos solicitudes con una `operation_id` producen como máximo un cobro |
