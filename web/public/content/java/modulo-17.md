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

**Caso guía**: guardar/consultar guías en SQL sin inyección ni fugas de recursos.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| JDBC | API estándar `java.sql` para BD relacionales. | Conectar, ejecutar SQL, leer resultados. | Driver en classpath, cerrar recursos. | `No suitable driver`. |
| `PreparedStatement` | Sentencia parametrizada con `?`. | Seguridad y tipos correctos. | Nunca concatenar input en SQL. | Inyección SQL. |
| DAO | Objeto que encapsula acceso a datos. | Separar persistencia de dominio/UI. | API orientada a dominio, no a UI. | DAO que devuelve `ResultSet`. |
| `Connection/ResultSet` recursos | Objetos que deben cerrarse. | Evitar fugas. | try-with-resources. | Fuga de conexiones. |

**Implementación desde cero** (ver setup H2/Postgres arriba)

`GuiaDaoJdbc.java` (métodos clave):
```java
String sql = "INSERT INTO guias(id, numero) VALUES (?, ?)";
try (Connection con = open(); PreparedStatement ps = con.prepareStatement(sql)) {
  ps.setInt(1, id); ps.setString(2, numero); ps.executeUpdate();
}
```
`DemoJdbc.java`:
```java
public class DemoJdbc { public static void main(String[] args) throws Exception {
  GuiaDaoJdbc dao = new GuiaDaoJdbc("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1", "sa", "");
  dao.crearTabla(); dao.insertar(1, "G-1"); dao.insertar(2, "G-2"); System.out.println(dao.listarNumeros());
}}
```
**Ejecución real** (H2): `javac -cp ".:h2.jar" GuiaDaoJdbc.java DemoJdbc.java && java -cp ".:h2.jar" DemoJdbc` → `[G-1, G-2]`. **Verificación**: repite con Postgres Docker usando mismo DAO y URL/driver distintos.


### Tema 2: Transacciones, ACID y aislamiento · Avanzado · 45 min

**Caso guía**: debitar y acreditar; si falla el segundo paso, revertir todo.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Transacciones | Unidad lógica todo-o-nada. | Consistencia en operaciones múltiples. | `setAutoCommit(false)`, `commit/rollback`. | Auto-commit en flujo multi-step. |
| ACID | Atomicidad, Consistencia, Aislamiento, Durabilidad. | Propiedades de confiabilidad. | Diseñar límites transaccionales. | Asumir atomicidad entre sentencias separadas sin tx. |
| Aislamiento | Nivel que controla anomalías concurrentes. | Balance consistencia/contención. | Elegir nivel (`READ_COMMITTED`, etc.) conscientemente. | Usar nivel alto por defecto sin medir. |
| Rollback ante error | Revertir cambios al fallar. | No dejar estado parcial. | `catch` → `rollback`; `finally` cerrar. | Tragar excepción tras fallo parcial. |

**Implementación desde cero** (H2, en jdbc-lab)

`TransferenciaJdbc.java` (extracto):
```java
try (Connection con = open()) {
  con.setAutoCommit(false);
  con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
  try (PreparedStatement ps1 = con.prepareStatement("UPDATE cuentas SET saldo = saldo - ? WHERE id=?");
       PreparedStatement ps2 = con.prepareStatement("UPDATE cuentas SET saldo = saldo + ? WHERE id=?")) {
    ps1.setInt(1, monto); ps1.setInt(2, desde); ps1.executeUpdate();
    if (monto > 100) throw new SQLException("monto inválido");
    ps2.setInt(1, monto); ps2.setInt(2, hacia); ps2.executeUpdate();
    con.commit();
  } catch (Exception e) { con.rollback(); throw e; }
}
```

**Ejecución real**:
```bash
javac -cp ".:h2.jar" TransferenciaJdbc.java DemoTx.java
java -cp ".:h2.jar" DemoTx
```
**Salida real esperada**:
```text
70,130
rollback
70,130
```
**Verificación**: el segundo intento falla y los saldos quedan iguales (rollback).


## Cierre del módulo

JDBC es la base de la persistencia relacional en Java. Saber usar `PreparedStatement`, DAO, transacciones y aislamiento te da control fino y te ayuda a entender lo que ORMs hacen por debajo. El siguiente módulo sube al stack web con Spring Boot.
