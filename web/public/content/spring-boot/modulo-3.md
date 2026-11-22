# Módulo 3: JDBC, JdbcClient y transacciones en Spring Boot

Este módulo cubre acceso a datos relacional con SQL explícito en Spring: `DataSource`, `JdbcTemplate`/`JdbcClient`, DAO, transacciones y rollback. Es la base antes de JPA/ORM.

**Entorno de referencia (2026-05-22):** JDK 27, Maven 3.10.0. Verificaciones SQL puras con H2 donde aplica; integración Spring Boot requiere contexto Boot + datasource.

## Aprende construyendo

### Tema 1: DataSource, JdbcTemplate y DAO · Intermedio · 35 min

Caso guía: consultar envíos con SQL controlado sin exponer detalles JDBC por todo el código.

#### `DataSource`

**Definición formal.** `DataSource` es la abstracción JDBC para obtener conexiones a una base de datos, normalmente con pool.

**Para qué sirve.** Centraliza conexión/configuración y permite pooling.

**Cuándo usarlo.** Siempre que accedas a BD relacional en Java/Spring. No abras `DriverManager` manualmente por request.

**Ejemplo mínimo enfocado (ejecutable con H2).**

```bash
mkdir -p /tmp/sb3-ds && cd /tmp/sb3-ds
cat > /tmp/sb3-ds/DemoDs.java << 'JAVA'
import java.sql.*;
public class DemoDs { public static void main(String[] args) throws Exception {
  try(Connection c=DriverManager.getConnection("jdbc:h2:mem:t;DB_CLOSE_DELAY=-1")){
    c.createStatement().execute("create table envio(id int primary key,codigo varchar(20))");
    c.createStatement().execute("insert into envio values(1,'A1')");
    try(ResultSet rs=c.createStatement().executeQuery("select codigo from envio")){ rs.next(); System.out.println(rs.getString(1)); }
  }
}}
JAVA
javac -cp /tmp/h2.jar -d /tmp/sb3-ds /tmp/sb3-ds/DemoDs.java && java -cp /tmp/sb3-ds:/tmp/h2.jar DemoDs
```

**Caso de uso real.** Pool HikariCP configurado por Spring Boot.

**Error común.** Filtrar credenciales o crear conexiones sin cerrar. Corrección: usar `DataSource` pool y try-with-resources.

**Verificación (2026-05-22, H2 2.3.232 si `/tmp/h2.jar` existe).** Salida esperada: `A1`.

#### `JdbcTemplate` y DAO

**Definición formal.** `JdbcTemplate` es el helper Spring para ejecutar SQL con manejo de recursos y excepciones; DAO encapsula acceso a datos.

**Para qué sirve.** Reducir boilerplate JDBC y aislar SQL.

**Cuándo usarlo.** SQL explícito con Spring. DAO/Repository no debe contener lógica HTTP.

**Ejemplo mínimo enfocado (Spring).**

```java
@Repository
class EnvioDao {
  private final JdbcTemplate jdbc;
  EnvioDao(JdbcTemplate jdbc){ this.jdbc = jdbc; }
  Optional<String> codigo(long id){ return jdbc.query("select codigo from envio where id=?", rs -> rs.next()?Optional.of(rs.getString(1)):Optional.empty(), id); }
}
```

**Caso de uso real.** Consultas reportes con SQL preciso.

**Error común.** Concatenar SQL. Corrección: parámetros `?`.

**Verificación.** **Nota:** requiere contexto Spring con `DataSource` y `JdbcTemplate`.

### Tema 2: `JdbcClient`: la API fluida de Spring para SQL explícito · Intermedio · 35 min

Caso guía: escribir SQL explícito con API más fluida que `JdbcTemplate`.

#### `JdbcClient`

**Definición formal.** API fluida de Spring Framework 6.1+ para ejecutar SQL con binding nombrado/posicional y mapeo.

**Para qué sirve.** Legibilidad y seguridad en consultas SQL.

**Cuándo usarlo.** En proyectos Spring modernos con SQL explícito.

**Ejemplo mínimo enfocado (Spring).**

```java
@Repository
class EnvioDao {
  private final JdbcClient jdbc;
  EnvioDao(JdbcClient jdbc){ this.jdbc = jdbc; }
  Optional<String> codigo(long id){
    return jdbc.sql("select codigo from envio where id=:id").param("id", id).query(String.class).optional();
  }
}
```

**Caso de uso real.** Lecturas/escrituras simples sin ORM.

**Error común.** Usarlo como ORM. Corrección: es SQL explícito; diseña consultas conscientemente.

**Verificación.** **Nota:** requiere Spring Framework 6.1+/Boot 3.2+ y `JdbcClient` bean.

### Tema 3: `@Transactional`, rollback y límites de transacción · Avanzado · 35 min

Caso guía: transferir saldo o crear pedido+items sin estado parcial.

#### `@Transactional`

**Definición formal.** Anotación Spring que delimita una transacción declarativa alrededor de un método/ clase, usualmente vía proxy.

**Para qué sirve.** Garantizar atomicidad y manejo consistente de commit/rollback.

**Cuándo usarlo.** En capa de servicio donde se define el límite de negocio. No en controllers.

**Ejemplo mínimo enfocado (Spring).**

```java
@Service
class PagoService {
  @Transactional
  public void transferir(long from,long to,int monto){ debitar(from,monto); acreditar(to,monto); }
}
```

**Caso de uso real.** Operación financiera/stock.

**Error común.** Self-invocation o método no público (según proxy) impide aplicar transacción. Corrección: llamar bean Spring y método público.

**Verificación.** **Nota:** requiere datasource transaccional y proxy Spring; evidencia con rollback ante excepción.

#### Rollback

**Definición formal.** Reversión de los cambios de una transacción ante fallo según reglas de rollback.

**Para qué sirve.** Preservar consistencia.

**Cuándo usarlo.** Excepciones de negocio/técnicas que deben abortar la unidad de trabajo.

**Ejemplo mínimo enfocado (ejecutable con H2).**

```bash
mkdir -p /tmp/sb3-tx && cd /tmp/sb3-tx
cat > /tmp/sb3-tx/DemoTx.java << 'JAVA'
import java.sql.*;
public class DemoTx { public static void main(String[] args) throws Exception {
  try(Connection c=DriverManager.getConnection("jdbc:h2:mem:tx;DB_CLOSE_DELAY=-1")){
    c.createStatement().execute("create table c(id int primary key,saldo int)");
    c.createStatement().execute("insert into c values(1,100)");
    c.setAutoCommit(false);
    try { c.createStatement().execute("update c set saldo=saldo-30 where id=1"); throw new RuntimeException("fallo"); }
    catch(Exception e){ c.rollback(); }
    try(ResultSet rs=c.createStatement().executeQuery("select saldo from c where id=1")){ rs.next(); System.out.println(rs.getString(1)); }
  }
}}
JAVA
javac -cp /tmp/h2.jar -d /tmp/sb3-tx /tmp/sb3-tx/DemoTx.java && java -cp /tmp/sb3-tx:/tmp/h2.jar DemoTx
```

**Caso de uso real.** Fallo al acreditar revierte débito.

**Error común.** Capturar excepción y no relanzar/marcar rollback. Corrección: permitir rollback o `setRollbackOnly`.

**Verificación (2026-05-22, H2 2.3.232).** Salida: `100`.
