# Módulo 17: JDBC

Antes de ORMs, y debajo de ellos, está JDBC: la API estándar de Java para hablar con bases de datos relacionales. Entender JDBC te ayuda a depurar JPA/Hibernate, escribir consultas críticas y razonar sobre transacciones, conexiones y SQL con precisión.

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

```java
import java.sql.*;
import java.util.*;

public class GuiaDaoJdbc {
    private final String url;

    public GuiaDaoJdbc(String url) { this.url = url; }

    public void crearTabla() throws SQLException {
        String sql = "CREATE TABLE IF NOT EXISTS guias (id INT PRIMARY KEY, numero VARCHAR(40) NOT NULL)";
        try (Connection con = DriverManager.getConnection(url);
             Statement st = con.createStatement()) {
            st.execute(sql);
        }
    }

    public void insertar(int id, String numero) throws SQLException {
        String sql = "INSERT INTO guias(id, numero) VALUES (?, ?)";
        try (Connection con = DriverManager.getConnection(url);
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.setString(2, numero);
            ps.executeUpdate();
        }
    }

    public List<String> listarNumeros() throws SQLException {
        String sql = "SELECT numero FROM guias ORDER BY id";
        List<String> out = new ArrayList<>();
        try (Connection con = DriverManager.getConnection(url);
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                out.add(rs.getString("numero"));
            }
        }
        return out;
    }
}
```

**Desglose del código**

- `DriverManager.getConnection` obtiene la conexión (requiere driver JDBC en classpath).
- `PreparedStatement` usa `?` como placeholders; `setInt/setString` enlaza valores con tipo.
- `try-with-resources` cierra `Connection`, `PreparedStatement` y `ResultSet` aunque haya excepción.
- `executeUpdate` para DML; `executeQuery` para SELECT.

**Ejecución y salida real**

> **Nota:** requiere un driver JDBC (p. ej. H2) y URL válida. El código compila con JDK porque `java.sql` está en la plataforma.

Ejemplo con H2 en memoria:

```java
public class DemoJdbc {
    public static void main(String[] args) throws Exception {
        GuiaDaoJdbc dao = new GuiaDaoJdbc("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1");
        dao.crearTabla();
        dao.insertar(1, "G-1");
        dao.insertar(2, "G-2");
        System.out.println(dao.listarNumeros());
    }
}
```

Salida esperada:

```text
[G-1, G-2]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Inyección SQL | Concatenaste input en el SQL | Usa `PreparedStatement` con parámetros |
| Fuga de conexiones | No cerraste recursos | Usa try-with-resources |
| `SQLException: No suitable driver` | Driver no está en classpath | Agrega el driver JDBC |

**Verificación rápida**

Compila el DAO: `javac GuiaDaoJdbc.java` debe compilar (JDK incluye `java.sql`). Para ejecutarlo, agrega un driver JDBC.

### Tema 2: Transacciones, ACID y aislamiento · Avanzado · 45 min

**Caso guía**

Debes debitar saldo y registrar un movimiento. Si el segundo paso falla, el primero debe revertirse. Además, dos procesos concurrentes no deben corromper el saldo.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *transacción* es una unidad lógica de trabajo que la base de datos trata como atómica. ACID describe propiedades deseadas: Atomicidad, Consistencia, Aislamiento y Durabilidad. El *nivel de aislamiento* define qué anomalías de concurrencia son posibles (dirty read, non-repeatable read, phantom read).

**Contrato / invariantes / reglas.** En JDBC, `setAutoCommit(false)` inicia control manual; `commit()` confirma; `rollback()` revierte. Si ocurre excepción, se debe hacer rollback en `catch/finally` según el flujo. El nivel de aislamiento se configura con `Connection.setTransactionIsolation(...)`; mayor aislamiento reduce anomalías pero aumenta contención/bloqueos. La atomicidad es del límite transaccional, no de cada sentencia aislada. Los recursos deben cerrarse incluso ante rollback.

**Modelo mental.** Una transacción es un “todo o nada”: o se aplican todos los asientos del libro contable, o no se aplica ninguno.

**Implementación desde cero**

```java
import java.sql.*;

public class TransferenciaJdbc {
    private final String url;
    public TransferenciaJdbc(String url) { this.url = url; }

    public void transferir(int desde, int hacia, int monto) throws SQLException {
        String debitar = "UPDATE cuentas SET saldo = saldo - ? WHERE id = ?";
        String acreditar = "UPDATE cuentas SET saldo = saldo + ? WHERE id = ?";

        try (Connection con = DriverManager.getConnection(url)) {
            con.setAutoCommit(false);
            con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            try (PreparedStatement ps1 = con.prepareStatement(debitar);
                 PreparedStatement ps2 = con.prepareStatement(acreditar)) {
                ps1.setInt(1, monto); ps1.setInt(2, desde);
                ps1.executeUpdate();

                ps2.setInt(1, monto); ps2.setInt(2, hacia);
                ps2.executeUpdate();

                con.commit();
            } catch (SQLException | RuntimeException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }
}
```

**Desglose del código**

- `setAutoCommit(false)` desactiva commit automático por sentencia.
- Ambas actualizaciones se ejecutan en la misma transacción.
- Cualquier excepción provoca `rollback()`.
- `commit()` confirma solo si todo salió bien.
- El nivel de aislamiento se elige según el caso; `READ_COMMITTED` es un default común en muchas BDs.

**Ejecución y salida real**

> **Nota:** requiere driver JDBC y tabla `cuentas(id INT, saldo INT)`.

Salida esperada: si ambas actualizaciones funcionan, los saldos cambian; si falla la segunda, el saldo del primero vuelve al estado previo.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Datos parcialmente actualizados | Falta transacción/rollback | Usa `setAutoCommit(false)` + commit/rollback |
| Deadlock | Orden de locks inconsistente | Ordena accesos y acorta transacciones |
| Anomalías de lectura | Aislamiento demasiado bajo | Sube aislamiento solo si el caso lo requiere |

**Verificación rápida**

```bash
javac GuiaDaoJdbc.java TransferenciaJdbc.java
```

Ambos deben compilar con JDK estándar. Prueba la transferencia contra H2/PostgreSQL para verificar commit y rollback.

## Cierre del módulo

JDBC es la base de la persistencia relacional en Java. Saber usar `PreparedStatement`, DAO, transacciones y aislamiento te da control fino y te ayuda a entender lo que ORMs hacen por debajo. El siguiente módulo sube al stack web con Spring Boot.
