# Módulo 17: JDBC

Antes de ORMs, y debajo de ellos, está JDBC: la API estándar de Java para hablar con bases de datos relacionales. Entender JDBC te ayuda a depurar JPA/Hibernate, escribir consultas críticas y razonar sobre transacciones, conexiones y SQL con precisión.

**Entorno de referencia verificado (2026-05-22):** JDK 27, H2 2.3.232 (jar local), Docker 29.9.3 disponible para PostgreSQL opcional.

## Setup ejecutable del módulo

```bash
mkdir -p /tmp/jdbc-m17
cd /tmp/jdbc-m17
curl -L -o h2.jar https://repo1.maven.org/maven2/com/h2database/h2/2.3.232/h2-2.3.232.jar
```

Compila y ejecuta con H2:

```bash
javac -cp ".:h2.jar" Archivo.java
java -cp ".:h2.jar" Archivo
```

> En Windows usa `;` en vez de `:` en classpath.

## Aprende construyendo

### Tema 1: JDBC, PreparedStatement y DAO · Intermedio · 40 min

Guardar y consultar guías en SQL sin inyección ni fugas de recursos.

#### JDBC

**Definición formal.** JDBC (Java Database Connectivity) es la API estándar `java.sql` para conectar aplicaciones Java a bases de datos relacionales mediante drivers.

**Para qué sirve.** Ejecutar SQL, leer resultados y controlar conexiones/transacciones.

**Cuándo usarlo y cuándo no.** Úsalo cuando necesites control fino o cuando un ORM no es apropiado. No concatenes SQL con input del usuario.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/jdbc-m17
cat > DemoJdbcApi.java << 'JAVA'
import java.sql.*;
public class DemoJdbcApi {
  public static void main(String[] args) throws Exception {
    try (Connection c = DriverManager.getConnection("jdbc:h2:mem:j1;DB_CLOSE_DELAY=-1","sa","")) {
      System.out.println(c.isValid(1));
    }
  }
}
JAVA
javac -cp ".:h2.jar" DemoJdbcApi.java
java -cp ".:h2.jar" DemoJdbcApi
```

**Caso de uso real.** Consulta puntual crítica de rendimiento o reporte SQL.

**Error común.** Driver no en classpath. Síntoma: `No suitable driver`. Corrección: incluir jar del driver y URL JDBC correcta.

**Verificación (JDK 27, H2 2.3.232, 2026-05-22).** Salida: `true`.

#### `PreparedStatement`

**Definición formal.** `PreparedStatement` es una sentencia SQL parametrizada con placeholders `?`, cuyos valores se asignan por tipo.

**Para qué sirve.** Evita inyección SQL y maneja tipos/escapes correctamente.

**Cuándo usarlo y cuándo no.** Úsalo siempre con input externo. No concatenes strings para formar SQL.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/jdbc-m17
cat > DemoPs.java << 'JAVA'
import java.sql.*;
public class DemoPs {
  public static void main(String[] args) throws Exception {
    try (Connection c = DriverManager.getConnection("jdbc:h2:mem:j2;DB_CLOSE_DELAY=-1","sa","")) {
      c.createStatement().execute("create table guia(id int primary key, codigo varchar(50))");
      try (PreparedStatement ps = c.prepareStatement("insert into guia(id,codigo) values(?,?)")) {
        ps.setInt(1, 1); ps.setString(2, "G-1"); ps.executeUpdate();
      }
      try (PreparedStatement ps = c.prepareStatement("select codigo from guia where id=?")) {
        ps.setInt(1, 1); try (ResultSet rs = ps.executeQuery()) { rs.next(); System.out.println(rs.getString(1)); }
      }
    }
  }
}
JAVA
javac -cp ".:h2.jar" DemoPs.java
java -cp ".:h2.jar" DemoPs
```

**Caso de uso real.** Buscar usuario por email/id recibido de API.

**Error común.** Concatenar input. Síntoma: inyección SQL o errores de quoting. Corrección: parámetros `?` con `setX`.

**Verificación (2026-05-22).** Salida: `G-1`.

#### DAO

**Definición formal.** DAO (Data Access Object) encapsula acceso a datos detrás de una interfaz orientada al dominio, ocultando SQL/JDBC.

**Para qué sirve.** Separa persistencia de lógica de negocio y facilita pruebas.

**Cuándo usarlo y cuándo no.** Úsalo cuando haya operaciones de persistencia repetidas. No expongas `ResultSet` fuera del DAO.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/jdbc-m17
cat > DemoDao.java << 'JAVA'
import java.sql.*; import java.util.*;
class GuiaDao {
  private final String url;
  GuiaDao(String url){ this.url=url; }
  Connection open() throws SQLException { return DriverManager.getConnection(url,"sa",""); }
  void crearTabla() throws SQLException { try(Connection c=open(); Statement st=c.createStatement()){ st.execute("create table if not exists guia(id int primary key, codigo varchar(50))"); } }
  void insertar(int id,String codigo) throws SQLException { try(Connection c=open(); PreparedStatement ps=c.prepareStatement("insert into guia(id,codigo) values(?,?)")){ ps.setInt(1,id); ps.setString(2,codigo); ps.executeUpdate(); } }
  List<String> listar() throws SQLException { try(Connection c=open(); PreparedStatement ps=c.prepareStatement("select codigo from guia order by id"); ResultSet rs=ps.executeQuery()){ List<String> out=new ArrayList<>(); while(rs.next()) out.add(rs.getString(1)); return out; } }
}
public class DemoDao {
  public static void main(String[] args) throws Exception {
    GuiaDao dao = new GuiaDao("jdbc:h2:mem:j3;DB_CLOSE_DELAY=-1");
    dao.crearTabla(); dao.insertar(1,"G-1"); dao.insertar(2,"G-2"); System.out.println(dao.listar());
  }
}
JAVA
javac -cp ".:h2.jar" DemoDao.java
java -cp ".:h2.jar" DemoDao
```

**Caso de uso real.** Repositorio JDBC simple en servicio legacy.

**Error común.** DAO con lógica de negocio/UI. Corrección: DAO solo persistencia.

**Verificación (2026-05-22).** Salida: `[G-1, G-2]`.

#### `Connection`, `ResultSet` y try-with-resources

**Definición formal.** `Connection`, `Statement/PreparedStatement` y `ResultSet` son recursos JDBC que deben cerrarse; try-with-resources los cierra automáticamente.

**Para qué sirve.** Evita fugas de conexiones/cursor y agota el pool.

**Cuándo usarlo.** Siempre.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/jdbc-m17
cat > DemoClose.java << 'JAVA'
import java.sql.*;
public class DemoClose {
  public static void main(String[] args) throws Exception {
    try (Connection c = DriverManager.getConnection("jdbc:h2:mem:j4;DB_CLOSE_DELAY=-1","sa","");
         Statement st = c.createStatement()) {
      st.execute("select 1");
      System.out.println("ok");
    }
  }
}
JAVA
javac -cp ".:h2.jar" DemoClose.java
java -cp ".:h2.jar" DemoClose
```

**Caso de uso real.** Servicios con pool HikariCP.

**Error común.** No cerrar `ResultSet`/`Connection`. Síntoma: agotamiento de conexiones. Corrección: try-with-resources anidado o por recurso.

**Verificación (2026-05-22).** Salida: `ok`.

### Tema 2: Transacciones, ACID y aislamiento · Avanzado · 45 min

Debitar y acreditar; si falla el segundo paso, revertir todo.

#### Transacciones

**Definición formal.** Una transacción es una unidad lógica de trabajo todo-o-nada, controlada con `commit` y `rollback`.

**Para qué sirve.** Evita estados parciales en operaciones multi-paso.

**Cuándo usarlo.** Cuando varias operaciones deben ser atómicas juntas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/jdbc-m17
cat > DemoTx.java << 'JAVA'
import java.sql.*;
public class DemoTx {
  static Connection open() throws SQLException { return DriverManager.getConnection("jdbc:h2:mem:j5;DB_CLOSE_DELAY=-1","sa",""); }
  static void print(Connection c) throws SQLException { try(Statement st=c.createStatement(); ResultSet rs=st.executeQuery("select saldo from cuentas order by id")){ rs.next(); int a=rs.getInt(1); rs.next(); int b=rs.getInt(1); System.out.println(a+","+b); } }
  public static void main(String[] args) throws Exception {
    try(Connection c=open(); Statement st=c.createStatement()){
      st.execute("create table cuentas(id int primary key, saldo int)");
      st.execute("insert into cuentas values(1,100),(2,100)");
    }
    try(Connection c=open()){ c.setAutoCommit(false); try(PreparedStatement d=c.prepareStatement("update cuentas set saldo=saldo-? where id=?"); PreparedStatement cr=c.prepareStatement("update cuentas set saldo=saldo+? where id=?")){ d.setInt(1,30); d.setInt(2,1); d.executeUpdate(); cr.setInt(1,30); cr.setInt(2,2); cr.executeUpdate(); c.commit(); } }
    try(Connection c=open()){ print(c); }
    try(Connection c=open()){ c.setAutoCommit(false); try(PreparedStatement d=c.prepareStatement("update cuentas set saldo=saldo-? where id=?")){ d.setInt(1,200); d.setInt(2,1); d.executeUpdate(); if(true) throw new SQLException("fallo"); c.commit(); } catch(Exception e){ c.rollback(); System.out.println("rollback"); } }
    try(Connection c=open()){ print(c); }
  }
}
JAVA
javac -cp ".:h2.jar" DemoTx.java
java -cp ".:h2.jar" DemoTx
```

**Caso de uso real.** Transferencia bancaria.

**Error común.** Dejar `autoCommit=true` en flujo multi-step. Corrección: `setAutoCommit(false)` + commit/rollback.

**Verificación (2026-05-22).** Salida: `70,130`, `rollback`, `70,130`.

#### ACID

**Definición formal.** ACID describe propiedades de transacciones: Atomicidad, Consistencia, Aislamiento, Durabilidad.

**Para qué sirve.** Marco para razonar confiabilidad de datos.

**Cuándo usarlo.** Al diseñar límites transaccionales y requisitos de consistencia.

**Ejemplo mínimo enfocado (ejecutable).** El ejemplo `DemoTx` anterior demuestra atomicidad: el segundo intento falla y el rollback conserva el estado consistente anterior.

**Caso de uso real.** Pedido + descuento de stock.

**Error común.** Asumir atomicidad entre varias sentencias sin transacción explícita. Corrección: delimitar transacción.

**Verificación (2026-05-22).** Observado por `DemoTx`: estado final `70,130`.

#### Aislamiento

**Definición formal.** El nivel de aislamiento controla qué anomalías concurrentes son posibles (`READ_UNCOMMITTED`, `READ_COMMITTED`, `REPEATABLE_READ`, `SERIALIZABLE`, según BD).

**Para qué sirve.** Balancea consistencia y concurrencia.

**Cuándo usarlo.** Cuando hay transacciones concurrentes con requisitos claros.

**Ejemplo mínimo enfocado (ejecutable).**

```java
try (Connection c = open()) {
  c.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
  System.out.println(c.getTransactionIsolation() == Connection.TRANSACTION_READ_COMMITTED);
}
```

**Caso de uso real.** Reportes vs. updates concurrentes.

**Error común.** Subir a `SERIALIZABLE` por defecto sin medir. Corrección: elegir nivel según anomalía a evitar y costo.

**Verificación (2026-05-22, H2).** La propiedad se puede consultar con `getTransactionIsolation()`; salida esperada `true`.

#### Rollback ante error

**Definición formal.** `rollback()` revierte los cambios realizados en la transacción actual antes del commit.

**Para qué sirve.** Preserva consistencia ante excepciones.

**Cuándo usarlo.** En cualquier transacción con múltiples pasos o posibilidad de fallo.

**Ejemplo mínimo enfocado (ejecutable).** Ver `DemoTx`: el bloque con excepción imprime `rollback` y mantiene saldos.

**Caso de uso real.** Falla al crear factura tras debitar stock.

**Error común.** Capturar excepción y no hacer rollback. Corrección: `catch -> rollback; throw`.

**Verificación (2026-05-22).** Salida real de `DemoTx` confirma rollback.

## Cierre del módulo

JDBC es la base de la persistencia relacional en Java. `PreparedStatement`, DAO, recursos cerrados y transacciones bien delimitadas son habilidades que también mejoran el uso de JPA/Hibernate.
