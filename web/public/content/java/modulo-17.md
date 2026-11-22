# Módulo 17: JDBC

Antes de ORMs, y debajo de ellos, está JDBC: la API estándar de Java para hablar con bases de datos relacionales. Entender JDBC te ayuda a depurar JPA/Hibernate, escribir consultas críticas y razonar sobre transacciones, conexiones y SQL con precisión.

## Setup ejecutable del módulo

### Opción A — H2 en memoria (rápida, sin Docker)

1. Crea carpeta y descarga H2 jar (una sola vez):

```bash
mkdir -p ~/academia-java/jdbc-lab
cd ~/academia-java/jdbc-lab
curl -L -o h2.jar https://repo1.maven.org/maven2/com/h2database/h2/2.3.232/h2-2.3.232.jar
```

2. Guarda los `.java` en esta carpeta.
3. Compila y ejecuta incluyendo H2 en el classpath:

```bash
javac -cp ".:h2.jar" GuiaDaoJdbc.java DemoJdbc.java
java -cp ".:h2.jar" DemoJdbc
```

> En Windows usa `;` en vez de `:` en classpath.

### Opción B — PostgreSQL con Docker (entorno real)

```bash
docker run --name academia-jdbc-pg -e POSTGRES_PASSWORD=academia -e POSTGRES_USER=academia -e POSTGRES_DB=academia -p 5432:5432 -d postgres:16-alpine
```

Descarga driver:

```bash
curl -L -o postgresql.jar https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.4/postgresql-42.7.4.jar
```

URL JDBC:

```text
jdbc:postgresql://localhost:5432/academia  user=academia password=academia
```

Compila/ejecuta:

```bash
javac -cp ".:postgresql.jar" *.java
java -cp ".:postgresql.jar" DemoJdbcPg
```

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Ejecutar consultas seguras con `PreparedStatement` y el patrón DAO |
| 2 | Controlar transacciones, commit/rollback y niveles de aislamiento |

## Aprende construyendo

### Tema 1: JDBC, PreparedStatement y DAO · Intermedio · 40 min

**Caso guía**

Necesitas guardar y consultar guías en una base SQL. Si concatenas strings para armar SQL, abres la puerta a inyección SQL y errores de escape. Necesitas consultas parametrizadas y una capa de acceso a datos clara.

**Fundamento técnico y modelo mental**

**Definición formal.** JDBC (Java Database Connectivity) es la API estándar (`java.sql`) para conectar aplicaciones Java con bases de datos relacionales. `Connection` representa una sesión con la BD; `PreparedStatement` representa una sentencia SQL precompilada/parametrizada; `ResultSet` representa un cursor sobre filas resultado. DAO (Data Access Object) es un patrón que encapsula acceso a persistencia detrás de una interfaz.

**Contrato / invariantes / reglas.** Las conexiones, statements y result sets son recursos que deben cerrarse (`try-with-resources`). Los parámetros de usuario deben pasarse con `PreparedStatement.setX(...)`, nunca concatenados en el SQL. `ResultSet` se recorre normalmente de forma forward-only por defecto; leer columnas por nombre o índice depende del contrato de la consulta. JDBC lanza `SQLException` (checked) por errores de acceso a datos; el código debe manejar o traducir con contexto. El DAO no debe filtrar detalles de UI; expone operaciones del dominio de persistencia.

**Modelo mental.** `PreparedStatement` es un formulario con casillas: el SQL es la plantilla, los datos son valores que van en casillas, no texto pegado al formulario.

**Implementación desde cero**

Archivo: `GuiaDaoJdbc.java`

```java
import java.sql.*;
import java.util.*;

public class GuiaDaoJdbc {
    private final String url;
    private final String user;
    private final String password;

    public GuiaDaoJdbc(String url, String user, String password) {
        this.url = url; this.user = user; this.password = password;
    }

    private Connection open() throws SQLException {
        return (user == null) ? DriverManager.getConnection(url)
                              : DriverManager.getConnection(url, user, password);
    }

    public void crearTabla() throws SQLException {
        String sql = "CREATE TABLE IF NOT EXISTS guias (id INT PRIMARY KEY, numero VARCHAR(40) NOT NULL)";
        try (Connection con = open(); Statement st = con.createStatement()) {
            st.execute(sql);
        }
    }

    public void insertar(int id, String numero) throws SQLException {
        String sql = "INSERT INTO guias(id, numero) VALUES (?, ?)";
        try (Connection con = open(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.setString(2, numero);
            ps.executeUpdate();
        }
    }

    public List<String> listarNumeros() throws SQLException {
        String sql = "SELECT numero FROM guias ORDER BY id";
        List<String> out = new ArrayList<>();
        try (Connection con = open();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) out.add(rs.getString("numero"));
        }
        return out;
    }
}
```

Archivo: `DemoJdbc.java` (H2, ejecutable)

```java
public class DemoJdbc {
    public static void main(String[] args) throws Exception {
        GuiaDaoJdbc dao = new GuiaDaoJdbc("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1", "sa", "");
        dao.crearTabla();
        dao.insertar(1, "G-1");
        dao.insertar(2, "G-2");
        System.out.println(dao.listarNumeros());
    }
}
```

Archivo: `DemoJdbcPg.java` (PostgreSQL Docker, opcional)

```java
public class DemoJdbcPg {
    public static void main(String[] args) throws Exception {
        GuiaDaoJdbc dao = new GuiaDaoJdbc("jdbc:postgresql://localhost:5432/academia", "academia", "academia");
        dao.crearTabla();
        dao.insertar(1, "G-1");
        dao.insertar(2, "G-2");
        System.out.println(dao.listarNumeros());
    }
}
```

**Desglose del código**

- `DriverManager.getConnection` obtiene la conexión (requiere driver JDBC en classpath).
- `PreparedStatement` usa `?` como placeholders; `setInt/setString` enlaza valores con tipo.
- `try-with-resources` cierra `Connection`, `PreparedStatement` y `ResultSet` aunque haya excepción.
- `executeUpdate` para DML; `executeQuery` para SELECT.
- El DAO recibe URL/credenciales, permitiendo cambiar de H2 a PostgreSQL sin cambiar lógica SQL.

**Ejecución y salida real**

H2 (desde `~/academia-java/jdbc-lab`):

```bash
javac -cp ".:h2.jar" GuiaDaoJdbc.java DemoJdbc.java
java -cp ".:h2.jar" DemoJdbc
```

Salida esperada:

```text
[G-1, G-2]
```

PostgreSQL Docker:

```bash
docker run --name academia-jdbc-pg -e POSTGRES_PASSWORD=academia -e POSTGRES_USER=academia -e POSTGRES_DB=academia -p 5432:5432 -d postgres:16-alpine
javac -cp ".:postgresql.jar" GuiaDaoJdbc.java DemoJdbcPg.java
java -cp ".:postgresql.jar" DemoJdbcPg
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Inyección SQL | Concatenaste input en el SQL | Usa `PreparedStatement` con parámetros |
| Fuga de conexiones | No cerraste recursos | Usa try-with-resources |
| `No suitable driver` | Driver no está en classpath | Agrega `h2.jar` o `postgresql.jar` al `-cp` |
| `Connection refused` en Postgres | Contenedor no levantado/puerto | Verifica `docker ps` y puerto 5432 |

**Verificación rápida**

Compila solo el DAO: `javac GuiaDaoJdbc.java` compila con JDK (incluye `java.sql`). Ejecuta `DemoJdbc` y confirma `[G-1, G-2]`.

### Tema 2: Transacciones, ACID y aislamiento · Avanzado · 45 min

**Caso guía**

Debes debitar saldo y registrar un movimiento. Si el segundo paso falla, el primero debe revertirse. Además, dos procesos concurrentes no deben corromper el saldo.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *transacción* es una unidad lógica de trabajo que la base de datos trata como atómica. ACID describe propiedades deseadas: Atomicidad, Consistencia, Aislamiento y Durabilidad. El *nivel de aislamiento* define qué anomalías de concurrencia son posibles (dirty read, non-repeatable read, phantom read).

**Contrato / invariantes / reglas.** En JDBC, `setAutoCommit(false)` inicia control manual; `commit()` confirma; `rollback()` revierte. Si ocurre excepción, se debe hacer rollback en `catch/finally` según el flujo. El nivel de aislamiento se configura con `Connection.setTransactionIsolation(...)`; mayor aislamiento reduce anomalías pero aumenta contención/bloqueos. La atomicidad es del límite transaccional, no de cada sentencia aislada. Los recursos deben cerrarse incluso ante rollback.

**Modelo mental.** Una transacción es un “todo o nada”: o se aplican todos los asientos del libro contable, o no se aplica ninguno.

**Implementación desde cero**

Archivo: `TransferenciaJdbc.java`

```java
import java.sql.*;

public class TransferenciaJdbc {
    private final String url; private final String user; private final String pass;
    public TransferenciaJdbc(String url, String user, String pass) { this.url = url; this.user = user; this.pass = pass; }
    private Connection open() throws SQLException { return DriverManager.getConnection(url, user, pass); }

    public void init() throws SQLException {
        try (Connection con = open(); Statement st = con.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS cuentas (id INT PRIMARY KEY, saldo INT NOT NULL)");
            st.execute("MERGE INTO cuentas KEY(id) VALUES (1,100)");
            st.execute("MERGE INTO cuentas KEY(id) VALUES (2,100)");
        }
    }

    public void transferir(int desde, int hacia, int monto) throws SQLException {
        String debitar = "UPDATE cuentas SET saldo = saldo - ? WHERE id = ?";
        String acreditar = "UPDATE cuentas SET saldo = saldo + ? WHERE id = ?";
        try (Connection con = open()) {
            con.setAutoCommit(false);
            con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            try (PreparedStatement ps1 = con.prepareStatement(debitar);
                 PreparedStatement ps2 = con.prepareStatement(acreditar)) {
                ps1.setInt(1, monto); ps1.setInt(2, desde); ps1.executeUpdate();
                if (monto < 0) throw new IllegalArgumentException("monto negativo");
                ps2.setInt(1, monto); ps2.setInt(2, hacia); ps2.executeUpdate();
                con.commit();
            } catch (Exception e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public int saldo(int id) throws SQLException {
        try (Connection con = open(); PreparedStatement ps = con.prepareStatement("SELECT saldo FROM cuentas WHERE id=?")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) { rs.next(); return rs.getInt(1); }
        }
    }
}
```

Archivo: `DemoTx.java`

```java
public class DemoTx {
    public static void main(String[] args) throws Exception {
        TransferenciaJdbc tx = new TransferenciaJdbc("jdbc:h2:mem:tx;DB_CLOSE_DELAY=-1", "sa", "");
        tx.init();
        tx.transferir(1, 2, 30);
        System.out.println(tx.saldo(1) + "," + tx.saldo(2));
        try { tx.transferir(1, 2, -5); } catch (Exception e) { System.out.println("rollback"); }
        System.out.println(tx.saldo(1) + "," + tx.saldo(2));
    }
}
```

**Desglose del código**

- `setAutoCommit(false)` desactiva commit automático por sentencia.
- Ambas actualizaciones se ejecutan en la misma transacción.
- El error forzado provoca `rollback()`.
- `commit()` confirma solo si todo salió bien.
- `saldo()` permite verificar el estado real en la BD.

**Ejecución y salida real**

```bash
javac -cp ".:h2.jar" TransferenciaJdbc.java DemoTx.java
java -cp ".:h2.jar" DemoTx
```

Salida esperada:

```text
70,130
rollback
70,130
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Datos parcialmente actualizados | Falta transacción/rollback | Usa `setAutoCommit(false)` + commit/rollback |
| Deadlock | Orden de locks inconsistente | Ordena accesos y acorta transacciones |
| Anomalías de lectura | Aislamiento demasiado bajo | Sube aislamiento solo si el caso lo requiere |

**Verificación rápida**

La segunda línea debe ser `rollback` y la tercera debe repetir `70,130`, demostrando atomicidad.

## Cierre del módulo

JDBC es la base de la persistencia relacional en Java. Saber usar `PreparedStatement`, DAO, transacciones y aislamiento te da control fino y te ayuda a entender lo que ORMs hacen por debajo. El siguiente módulo sube al stack web con Spring Boot.
