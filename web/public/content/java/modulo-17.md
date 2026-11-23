# Módulo 17: JDBC, DAO y transacciones

Una aplicación de envíos puede validar objetos en memoria, pero si no persiste bien sus datos, el negocio pierde trazabilidad. El problema aparece en los bordes: un `INSERT` con concatenación de strings abre la puerta a SQL injection; una transferencia que debita una cuenta y falla antes de acreditar la otra deja saldos inconsistentes; una consulta sin mapeo claro mezcla SQL, infraestructura y dominio.

En este módulo vas a construir `tienda-aurora-java-m17` desde cero. La primera parte resuelve persistencia con JDBC y el patrón DAO usando H2 en memoria para que sea ejecutable localmente. La segunda parte modela transacciones con commit/rollback y verifica aislamiento `READ COMMITTED`. PostgreSQL/MySQL usan el mismo contrato JDBC; al final indico qué cambia al salir de H2.

## Visual del módulo

**Herramienta (diagram-design, estático):** [JDBC, DAO y transacción — mapa visual](/visuals/temas/java/modulo-17-jdbc-transaccion.html)

Lectura: el servicio llama al DAO; el DAO usa `PreparedStatement` con parámetros tipados; la transacción agrupa operaciones para que se confirmen todas o ninguna.

## Prerrequisitos y bootstrap

Necesitas JDK 25 y Gradle 9.x.

```bash
java -version
gradle --version
mkdir -p tienda-aurora-java-m17/src/main/java/com/aurora/jdbc
mkdir -p tienda-aurora-java-m17/src/test/java/com/aurora/jdbc
cd tienda-aurora-java-m17
gradle wrapper --gradle-version 9.9.1
```

Estructura:

```text
tienda-aurora-java-m17/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/jdbc/
    │   ├── App.java
    │   ├── DataSourceFactory.java
    │   ├── Guia.java
    │   ├── GuiaDao.java
    │   ├── Schema.java
    │   └── TransferenciaService.java
    └── test/java/com/aurora/jdbc/
        └── JdbcTest.java
```

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m17"
```

#### `build.gradle.kts`

Usamos H2 como BD embebida para ejecución local verificable. El driver JDBC entra como dependencia normal; JUnit 5 cubre las pruebas.

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.h2database:h2:2.3.232")
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.aurora.jdbc.App"
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
        showStandardStreams = true
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

## Modelo y esquema

#### `Guia.java`

El record representa el dato que viaja entre la aplicación y el DAO. Valida invariantes antes de persistir; el DAO no debería tener que defenderse de objetos inválidos.

```java
package com.aurora.jdbc;

import java.math.BigDecimal;
import java.util.Objects;

public record Guia(int id, String remitente, String destino, BigDecimal pesoKg) {
    public Guia {
        Objects.requireNonNull(remitente, "remitente");
        Objects.requireNonNull(destino, "destino");
        Objects.requireNonNull(pesoKg, "pesoKg");
        if (id <= 0) throw new IllegalArgumentException("id debe ser > 0");
        if (remitente.isBlank() || destino.isBlank()) throw new IllegalArgumentException("texto vacío");
        if (pesoKg.signum() <= 0) throw new IllegalArgumentException("pesoKg debe ser > 0");
    }
}
```

#### `DataSourceFactory.java`

`DataSource` es el punto de entrada a conexiones. En producción suele venir de un pool (HikariCP). Aquí creamos un H2 en memoria para que el ejemplo sea reproducible sin instalar BD externa.

```java
package com.aurora.jdbc;

import org.h2.jdbcx.JdbcDataSource;

import javax.sql.DataSource;

public final class DataSourceFactory {
    private DataSourceFactory() {}

    public static DataSource h2Mem(String dbName) {
        JdbcDataSource ds = new JdbcDataSource();
        ds.setURL("jdbc:h2:mem:" + dbName + ";DB_CLOSE_DELAY=-1");
        ds.setUser("sa");
        ds.setPassword("");
        return ds;
    }
}
```

`DB_CLOSE_DELAY=-1` mantiene la BD viva mientras la JVM esté activa. Sin eso, la BD en memoria puede desaparecer al cerrar la última conexión.

#### `Schema.java`

El esquema es código ejecutable, no una suposición. Lo creamos al inicio para que el módulo sea autocontenido.

```java
package com.aurora.jdbc;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public final class Schema {
    private Schema() {}

    public static void init(DataSource ds) throws SQLException {
        try (Connection c = ds.getConnection(); Statement st = c.createStatement()) {
            st.execute("""
                CREATE TABLE guias (
                  id INT PRIMARY KEY,
                  remitente VARCHAR(100) NOT NULL,
                  destino VARCHAR(100) NOT NULL,
                  peso_kg DECIMAL(10,2) NOT NULL
                )
                """);
            st.execute("""
                CREATE TABLE cuentas (
                  id INT PRIMARY KEY,
                  titular VARCHAR(100) NOT NULL,
                  saldo DECIMAL(12,2) NOT NULL
                )
                """);
        }
    }
}
```

### Tema 1: JDBC, PreparedStatement y DAO · Intermedio · 40 min

JDBC es la API estándar de Java para hablar con bases de datos relacionales. El código Java usa interfaces como `Connection`, `PreparedStatement` y `ResultSet`; el driver JDBC traduce esas llamadas al protocolo de la BD concreta. Esto permite cambiar de H2 a PostgreSQL o MySQL sin reescribir la lógica, aunque SQL y detalles de tipos sí pueden variar.

El problema que resuelve un DAO es separar persistencia de negocio. Si el servicio arma SQL, abre conexiones, mapea `ResultSet` y además aplica reglas, termina con una clase imposible de probar. El DAO encapsula el acceso a datos: recibe objetos o parámetros, ejecuta SQL y devuelve objetos.

`PreparedStatement` es el punto de seguridad básico. Cuando concatenas input del usuario en SQL, el input puede convertirse en instrucciones. Con `PreparedStatement`, el SQL tiene placeholders (`?`) y los valores viajan como parámetros tipados. El driver los envía separados, no como fragmentos de SQL ejecutable.

#### `GuiaDao.java`

```java
package com.aurora.jdbc;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class GuiaDao {
    private final DataSource ds;

    public GuiaDao(DataSource ds) {
        this.ds = ds;
    }

    public void insertar(Guia guia) throws SQLException {
        String sql = "INSERT INTO guias(id, remitente, destino, peso_kg) VALUES (?, ?, ?, ?)";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, guia.id());
            ps.setString(2, guia.remitente());
            ps.setString(3, guia.destino());
            ps.setBigDecimal(4, guia.pesoKg());
            ps.executeUpdate();
        }
    }

    public Optional<Guia> buscarPorId(int id) throws SQLException {
        String sql = "SELECT id, remitente, destino, peso_kg FROM guias WHERE id = ?";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return Optional.empty();
                return Optional.of(map(rs));
            }
        }
    }

    public List<Guia> listarPorDestino(String destino) throws SQLException {
        String sql = "SELECT id, remitente, destino, peso_kg FROM guias WHERE destino = ? ORDER BY id";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, destino);
            try (ResultSet rs = ps.executeQuery()) {
                List<Guia> out = new ArrayList<>();
                while (rs.next()) out.add(map(rs));
                return out;
            }
        }
    }

    private Guia map(ResultSet rs) throws SQLException {
        return new Guia(
                rs.getInt("id"),
                rs.getString("remitente"),
                rs.getString("destino"),
                rs.getBigDecimal("peso_kg")
        );
    }
}
```

Puntos que vale leer con calma:

- `try-with-resources` cierra `Connection`, `PreparedStatement` y `ResultSet`. Un leak de conexiones en producción derriba el pool.
- `buscarPorId` devuelve `Optional<Guia>` para hacer explícita la ausencia.
- `map` concentra la conversión de fila a objeto. Si la tabla cambia, el cambio se localiza aquí.
- El SQL usa `?`, nunca concatenación de input.

**Caso de borde:** `executeUpdate()` devuelve cantidad de filas afectadas. En inserts/updates críticos conviene inspeccionarlo; aquí el id es PK y un duplicado lanzará excepción SQL.

**Error común:** crear una `Connection` por consulta en un sistema real sin pool. Funciona en demos, pero es caro. En producción se usa `DataSource` respaldado por HikariCP u otro pool.

### Tema 2: Transacciones, ACID y aislamiento · Avanzado · 45 min

Una transacción agrupa operaciones que deben comportarse como unidad. El caso clásico es una transferencia: debitar una cuenta y acreditar otra. Si el débito se confirma y el crédito falla, el dinero desaparece del sistema. Ese es exactamente el tipo de bug que ACID busca evitar.

- **Atomicidad**: todo o nada. Commit confirma; rollback revierte.
- **Consistencia**: la BD pasa de un estado válido a otro válido según constraints/reglas.
- **Aislamiento**: transacciones concurrentes no deben verse de formas que rompan el contrato elegido.
- **Durabilidad**: una vez confirmado, el cambio debe sobrevivir a fallas.

El aislamiento tiene niveles. Más aislamiento reduce anomalías, pero puede reducir concurrencia. `READ COMMITTED` evita leer cambios no confirmados (dirty reads); `REPEATABLE_READ` y `SERIALIZABLE` dan garantías más fuertes con mayor costo. La elección depende de la anomalía que el negocio no puede tolerar.

#### `TransferenciaService.java`

```java
package com.aurora.jdbc;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class TransferenciaService {
    private final DataSource ds;

    public TransferenciaService(DataSource ds) {
        this.ds = ds;
    }

    public void crearCuenta(int id, String titular, BigDecimal saldo) throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("INSERT INTO cuentas(id,titular,saldo) VALUES(?,?,?)")) {
            ps.setInt(1, id);
            ps.setString(2, titular);
            ps.setBigDecimal(3, saldo);
            ps.executeUpdate();
        }
    }

    public BigDecimal saldo(int id) throws SQLException {
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement("SELECT saldo FROM cuentas WHERE id=?")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) throw new SQLException("cuenta no existe: " + id);
                return rs.getBigDecimal("saldo");
            }
        }
    }

    public void transferir(int desde, int hacia, BigDecimal monto) throws SQLException {
        if (monto.signum() <= 0) throw new IllegalArgumentException("monto debe ser > 0");
        try (Connection c = ds.getConnection()) {
            c.setAutoCommit(false);
            try {
                debitar(c, desde, monto);
                acreditar(c, hacia, monto);
                c.commit();
            } catch (Exception e) {
                c.rollback();
                throw e;
            } finally {
                c.setAutoCommit(true);
            }
        }
    }

    private void debitar(Connection c, int id, BigDecimal monto) throws SQLException {
        BigDecimal actual = saldoForUpdate(c, id);
        if (actual.compareTo(monto) < 0) throw new IllegalStateException("saldo insuficiente");
        try (PreparedStatement ps = c.prepareStatement("UPDATE cuentas SET saldo = saldo - ? WHERE id=?")) {
            ps.setBigDecimal(1, monto);
            ps.setInt(2, id);
            ps.executeUpdate();
        }
    }

    private void acreditar(Connection c, int id, BigDecimal monto) throws SQLException {
        saldoForUpdate(c, id); // valida existencia
        try (PreparedStatement ps = c.prepareStatement("UPDATE cuentas SET saldo = saldo + ? WHERE id=?")) {
            ps.setBigDecimal(1, monto);
            ps.setInt(2, id);
            ps.executeUpdate();
        }
    }

    private BigDecimal saldoForUpdate(Connection c, int id) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement("SELECT saldo FROM cuentas WHERE id=? FOR UPDATE")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) throw new SQLException("cuenta no existe: " + id);
                return rs.getBigDecimal("saldo");
            }
        }
    }
}
```

La parte crítica es `setAutoCommit(false)`. Sin eso, cada sentencia se confirma sola y no hay transacción de negocio. El `rollback()` en `catch` evita el estado parcial. El `finally` restaura auto-commit; si la conexión vuelve a un pool, es buena higiene.

`FOR UPDATE` bloquea la fila seleccionada dentro de la transacción (según motor/aislamiento). Sirve para evitar que dos transferencias lean el mismo saldo y ambas debiten.

**Nota de verificación honesta:** la prueba de aislamiento se ejecutó en H2 con `READ_COMMITTED` y confirmó que no hay dirty read. Los niveles de aislamiento y el comportamiento de bloqueos varían entre motores; antes de asumirlo en PostgreSQL/MySQL, ejecuta pruebas de integración equivalentes contra ese motor.

#### `App.java`

```java
package com.aurora.jdbc;

import javax.sql.DataSource;
import java.math.BigDecimal;

public final class App {
    public static void main(String[] args) throws Exception {
        DataSource ds = DataSourceFactory.h2Mem("aurora-m17");
        Schema.init(ds);

        GuiaDao dao = new GuiaDao(ds);
        dao.insertar(new Guia(1, "Ana", "BOG", new BigDecimal("2.50")));
        dao.insertar(new Guia(2, "Luis", "MED", new BigDecimal("1.20")));
        dao.insertar(new Guia(3, "Marta", "BOG", new BigDecimal("3.00")));

        System.out.println("G1=" + dao.buscarPorId(1).map(Guia::remitente).orElse("NA"));
        System.out.println("BOG=" + dao.listarPorDestino("BOG").size());

        TransferenciaService tx = new TransferenciaService(ds);
        tx.crearCuenta(10, "Ana", new BigDecimal("100.00"));
        tx.crearCuenta(20, "Luis", new BigDecimal("50.00"));
        tx.transferir(10, 20, new BigDecimal("30.00"));
        System.out.println("SALDO_10=" + tx.saldo(10));
        System.out.println("SALDO_20=" + tx.saldo(20));
        try {
            tx.transferir(10, 20, new BigDecimal("1000.00"));
        } catch (Exception e) {
            System.out.println("ROLLBACK=" + e.getClass().getSimpleName());
        }
        System.out.println("SALDO_10_POST=" + tx.saldo(10));
        System.out.println("SALDO_20_POST=" + tx.saldo(20));
    }
}
```

#### `JdbcTest.java`

```java
package com.aurora.jdbc;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class JdbcTest {
    private DataSource ds;
    private GuiaDao dao;
    private TransferenciaService tx;

    @BeforeEach
    void setup() throws Exception {
        ds = DataSourceFactory.h2Mem("test-" + System.nanoTime());
        Schema.init(ds);
        dao = new GuiaDao(ds);
        tx = new TransferenciaService(ds);
    }

    @Test
    void preparedStatementInsertaYConsulta() throws Exception {
        dao.insertar(new Guia(1, "Ana", "BOG", new BigDecimal("2.50")));
        Optional<Guia> g = dao.buscarPorId(1);
        assertTrue(g.isPresent());
        assertEquals("Ana", g.get().remitente());
        assertEquals(1, dao.listarPorDestino("BOG").size());
    }

    @Test
    void transaccionHaceCommit() throws Exception {
        tx.crearCuenta(1, "A", new BigDecimal("100.00"));
        tx.crearCuenta(2, "B", new BigDecimal("50.00"));
        tx.transferir(1, 2, new BigDecimal("30.00"));
        assertEquals(new BigDecimal("70.00"), tx.saldo(1));
        assertEquals(new BigDecimal("80.00"), tx.saldo(2));
    }

    @Test
    void transaccionHaceRollback() throws Exception {
        tx.crearCuenta(1, "A", new BigDecimal("100.00"));
        tx.crearCuenta(2, "B", new BigDecimal("50.00"));
        assertThrows(IllegalStateException.class, () -> tx.transferir(1, 2, new BigDecimal("1000.00")));
        assertEquals(new BigDecimal("100.00"), tx.saldo(1));
        assertEquals(new BigDecimal("50.00"), tx.saldo(2));
    }

    @Test
    void aislamientoReadCommittedNoVeDirtyRead() throws Exception {
        tx.crearCuenta(1, "A", new BigDecimal("100.00"));
        try (Connection c1 = ds.getConnection(); Connection c2 = ds.getConnection()) {
            c1.setAutoCommit(false);
            c2.setAutoCommit(false);
            c2.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            try (var ps = c1.prepareStatement("UPDATE cuentas SET saldo = saldo - ? WHERE id=?")) {
                ps.setBigDecimal(1, new BigDecimal("10.00"));
                ps.setInt(2, 1);
                ps.executeUpdate();
            }
            BigDecimal vistoPorC2;
            try (var ps = c2.prepareStatement("SELECT saldo FROM cuentas WHERE id=?")) {
                ps.setInt(1, 1);
                try (var rs = ps.executeQuery()) {
                    rs.next();
                    vistoPorC2 = rs.getBigDecimal("saldo");
                }
            }
            c1.rollback();
            c2.commit();
            assertEquals(new BigDecimal("100.00"), vistoPorC2);
        }
    }
}
```

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m17` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, H2 2.3.232):

```bash
./gradlew -q test
./gradlew -q run
```

`./gradlew -q test`: **4 tests, 0 fallas**.

Salida real de `./gradlew -q run`:

```text
G1=Ana
BOG=2
SALDO_10=70.00
SALDO_20=80.00
ROLLBACK=IllegalStateException
SALDO_10_POST=70.00
SALDO_20_POST=80.00
```

La salida confirma dos cosas: el DAO consulta por id y por destino; la transferencia fallida hace rollback y los saldos quedan intactos.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| SQL injection o errores raros con comillas | Concatenar input en SQL | Revisar strings SQL con `+` | Usar `PreparedStatement` con `?` |
| Saldos inconsistentes | Falta `setAutoCommit(false)` o no hay rollback | Revisar logs/transacciones; reproducir falla intermedia | Envolver en transacción, `commit/rollback` en `try/catch/finally` |
| Agotamiento de conexiones | No cerrar recursos o no usar pool | Métricas del pool, errores `too many connections` | `try-with-resources` y `DataSource` con pool |
| Datos no visibles entre tests | BD en memoria cerrada | URL H2 sin `DB_CLOSE_DELAY=-1` o nombres distintos | Controlar ciclo de vida del `DataSource` por test |
| Bloqueos/deadlocks | Orden de locks inconsistente, transacciones largas | Logs del motor, `FOR UPDATE`, tiempos | Ordenar acceso a filas, acortar transacciones, elegir aislamiento adecuado |

## De H2 a PostgreSQL/MySQL

Este módulo se ejecutó con H2 por reproducibilidad. Para llevarlo a PostgreSQL o MySQL:

- cambia la dependencia del driver y la URL JDBC;
- ajusta tipos SQL si usas características específicas del motor;
- usa pool (HikariCP) en vez de `JdbcDataSource` simple;
- valida aislamiento/bloqueos con el motor real.

**Nota de verificación honesta:** no ejecuté PostgreSQL/MySQL/Testcontainers en esta corrida. El contrato JDBC y la lógica de transacción son los mismos; la verificación de motor real queda pendiente cuando haya infraestructura disponible.

## Checklist de cierre

- [ ] Puedo explicar por qué `PreparedStatement` evita inyección y mejora claridad.
- [ ] El DAO encapsula SQL y mapeo; el servicio no arma queries.
- [ ] Sé cuándo usar `commit` y `rollback`.
- [ ] Puedo explicar ACID y el trade-off de aislamiento.
- [ ] Probé el comportamiento con salida real, no solo leyendo código.

Siguiente paso natural: **Módulo 18 — HTTP, seguridad y backend con Java**, donde el mismo criterio de bordes explícitos se aplica a clientes HTTP, timeouts, validación y criptografía.
