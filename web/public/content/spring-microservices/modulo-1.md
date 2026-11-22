# Módulo 1 · Spring Web, datos y migraciones

Un microservicio Spring expone contratos HTTP, valida entrada, traduce errores, persiste datos y evoluciona su esquema. Este módulo cubre la base web + datos con enfoque de contrato, consistencia y operabilidad.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Spring Boot 3.5.0 (referencia), Jackson/H2 jars disponibles localmente en `/tmp` en smokes anteriores. Los ejemplos mínimos usan Java/Jackson/H2 donde es factible; Spring MVC/JPA/Flyway/Liquibase se verifican por contrato y se marcan con **Nota de verificación** cuando falta infraestructura.

## Aprende construyendo

### Tema 1: Spring MVC: DispatcherServlet, Controllers y validación · Intermedio · 180 min

Caso guía: endpoint `POST /orders` que recibe JSON, valida y responde DTO.

#### DispatcherServlet y controller

**Definición formal.** `DispatcherServlet` es el front controller de Spring MVC: recibe requests, las enruta a handlers, aplica conversión/validación y resuelve la respuesta. Un `@RestController` expone endpoints HTTP.

**Cuándo usarlo / cuándo no.** Úsalo para APIs HTTP request-response. No pongas lógica de negocio compleja en controllers.

**Ejemplo mínimo enfocado (ejecutable: routing/validación simple).**

```bash
mkdir -p sm1-mvc
cd sm1-mvc
```

Crea el archivo `Mvc.java`:

```java
import java.util.*;
record OrderReq(String sku, Integer qty) {}
public class Mvc {
  static int handle(OrderReq r) {
    if (r.sku() == null || r.sku().isBlank()) return 400;
    if (r.qty() == null || r.qty() <= 0) return 400;
    return 201;
  }
  public static void main(String[] args) {
    System.out.println(handle(new OrderReq("A1", 1)));
    System.out.println(handle(new OrderReq("", 1)));
  }
}
```

```bash
javac Mvc.java
java Mvc
```

**Caso de uso real.** `@PostMapping` con `@Valid @RequestBody`.

**Error común.** Confiar en validación del cliente.

**Síntoma.** datos inválidos en DB. **Causa.** falta Bean Validation en backend. **Corrección.** `@NotBlank`, `@Min`, `@Valid`, ProblemDetail. **Señal observable.** 500/constraint violations inesperadas.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `201`, `400`. **Nota de verificación:** Spring MVC real requiere app Boot; validar con MockMvc/WebTestClient.

### Tema 2: DTOs, @JsonProperty y Jackson · Intermedio · 120 min

Caso guía: separar contrato JSON del modelo interno.

#### DTO y serialización

**Definición formal.** Un DTO es un objeto de transferencia para entrada/salida. Jackson serializa/deserializa JSON; `@JsonProperty` controla nombres/campos.

**Cuándo usarlo / cuándo no.** Úsalo en bordes HTTP. No expongas entidades JPA directamente.

**Ejemplo mínimo enfocado (ejecutable con Jackson si jar disponible; fallback Java puro).**

```bash
mkdir -p sm1-dto
cd sm1-dto
```

Crea el archivo `Dto.java`:

```java
record OrderResponse(String orderId, int qty) {}
public class Dto {
  public static void main(String[] args) {
    var r = new OrderResponse("o1", 2);
    System.out.println(r.orderId());
    System.out.println(r.qty());
  }
}
```

```bash
javac Dto.java
java Dto
```

**Caso de uso real.** `@JsonProperty("order_id")` para compatibilidad de contrato.

**Error común.** Exponer entidad JPA.

**Síntoma.** lazy loading en serialización, leaks de campos internos. **Causa.** acoplar contrato a persistencia. **Corrección.** DTOs explícitos. **Señal observable.** `LazyInitializationException` o JSON con campos sensibles.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `o1`, `2`. **Nota de verificación:** Jackson `@JsonProperty` real requiere dependencia Jackson; comportamiento verificado conceptualmente.

### Tema 3: Manejo global de excepciones (@ControllerAdvice) · Intermedio · 120 min

Caso guía: devolver errores consistentes con ProblemDetail.

#### Error handling global

**Definición formal.** `@ControllerAdvice` centraliza manejo de excepciones en MVC. ProblemDetail (RFC 9457) estandariza respuestas de error.

**Cuándo usarlo / cuándo no.** Úsalo para errores consistentes. No expongas stack traces internos al cliente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm1-err
cd sm1-err
```

Crea el archivo `Err.java`:

```java
import java.util.*;
public class Err {
  static Map<String,Object> problem(int status, String detail) {
    return Map.of("status", status, "detail", detail);
  }
  public static void main(String[] args) {
    var p = problem(400, "sku is required");
    System.out.println(p.get("status"));
    System.out.println(p.get("detail"));
  }
}
```

```bash
javac Err.java
java Err
```

**Caso de uso real.** `@ExceptionHandler(MethodArgumentNotValidException.class)` devuelve 400 con campos.

**Error común.** Devolver 200 con error en body.

**Síntoma.** clientes no pueden manejar fallos correctamente. **Causa.** contrato HTTP incorrecto. **Corrección.** códigos HTTP semánticos + ProblemDetail. **Señal observable.** métricas 2xx altas con fallos de negocio.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `400`, `sku is required`.

### Tema 4: Spring Data JPA, Hibernate, entidades, relaciones y transacciones · Avanzado · 240 min

Caso guía: persistir pedido con líneas en transacción.

#### JPA y transacciones

**Definición formal.** JPA es especificación ORM; Hibernate es implementación común. `@Transactional` delimita una unidad de trabajo atómica con reglas de propagación/aislamiento.

**Cuándo usarlo / cuándo no.** Úsalo para modelos relacionales con invariantes. No ignores N+1, lazy loading ni límites de transacción.

**Ejemplo mínimo enfocado (ejecutable: lógica transaccional simulada).**

```bash
mkdir -p sm1-tx
cd sm1-tx
```

Crea el archivo `Tx.java`:

```java
import java.util.*;
class Db { List<String> orders = new ArrayList<>(); }
public class Tx {
  static void create(Db db, boolean fail) {
    db.orders.add("order");
    if (fail) throw new RuntimeException("boom");
    db.orders.add("line");
  }
  public static void main(String[] args) {
    Db db = new Db();
    try { create(db, true); } catch (Exception e) {}
    System.out.println(db.orders.size()); // simulación sin rollback real
    System.out.println("use-transactional");
  }
}
```

```bash
javac Tx.java
java Tx
```

**Caso de uso real.** `@Transactional` en servicio de aplicación.

**Error común.** N+1 queries.

**Síntoma.** latencia alta al listar entidades con relaciones. **Causa.** lazy load por elemento. **Corrección.** fetch join, EntityGraph, DTO projection. **Señal observable.** muchas queries en logs SQL.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `1`, `use-transactional`. **Nota de verificación:** JPA/Hibernate real requiere Spring Data + DB; el ejemplo muestra por qué se necesita transacción real.

### Tema 5: Criteria API y Specifications · Avanzado · 180 min

Caso guía: filtrar pedidos por estado, fecha y cliente sin concatenar SQL.

#### Consultas dinámicas seguras

**Definición formal.** Criteria API construye queries tipadas programáticamente. Spring Data Specifications compone predicados reutilizables.

**Cuándo usarlo / cuándo no.** Úsalo para filtros dinámicos. No concatenes strings SQL con input de usuario.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm1-spec
cd sm1-spec
```

Crea el archivo `Spec.java`:

```java
import java.util.*; import java.util.function.*; import java.util.stream.*;
record Order(String status, String customer) {}
public class Spec {
  public static void main(String[] args) {
    var orders = List.of(new Order("NEW","a"), new Order("PAID","a"), new Order("NEW","b"));
    Predicate<Order> statusNew = o -> o.status().equals("NEW");
    Predicate<Order> customerA = o -> o.customer().equals("a");
    var r = orders.stream().filter(statusNew.and(customerA)).toList();
    System.out.println(r.size());
  }
}
```

```bash
javac Spec.java
java Spec
```

**Caso de uso real.** `Specification.where(byStatus).and(byCustomer)`.

**Error común.** Concatenar JPQL/SQL con input.

**Síntoma.** inyección o queries rotas. **Causa.** input no parametrizado. **Corrección.** Criteria/Specifications/bind params. **Señal observable.** hallazgos SAST o errores por comillas.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `1`.

### Tema 6: Flyway/Liquibase · Intermedio · 120 min

Caso guía: versionar esquema de DB.

#### Migraciones

**Definición formal.** Flyway y Liquibase versionan cambios de esquema como migraciones aplicadas ordenadamente. Una migración aplicada debe ser inmutable.

**Cuándo usarlo / cuándo no.** Úsalo siempre en DB compartida/evolutiva. No edites migraciones ya aplicadas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm1-mig
cd sm1-mig
```

Crea el archivo `Mig.java`:

```java
import java.util.*;
public class Mig {
  public static void main(String[] args) {
    List<String> applied = new ArrayList<>();
    applied.add("V1__init.sql");
    applied.add("V2__add_status.sql");
    System.out.println(applied.size());
    System.out.println(applied.get(1));
  }
}
```

```bash
javac Mig.java
java Mig
```

**Caso de uso real.** Flyway en startup de Spring Boot.

**Error común.** Editar migración aplicada.

**Síntoma.** checksum mismatch, arranque falla. **Causa.** historial inmutable alterado. **Corrección.** nueva migración correctiva. **Señal observable.** error Flyway checksum.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `2`, `V2__add_status.sql`. **Nota de verificación:** Flyway/Liquibase real requiere DB; comando típico con Spring Boot al iniciar.

### Tema 7: PostgreSQL y MySQL · Intermedio · 120 min

Caso guía: elegir DB relacional por capacidades operativas.

#### Diferencias prácticas

**Definición formal.** PostgreSQL y MySQL son RDBMS. Ambos soportan SQL, transacciones e índices; difieren en features, tipos, MVCC, extensiones y comportamiento operativo.

**Cuándo usarlo / cuándo no.** Elige por requisitos reales: tipos JSON, extensiones, replicación, tooling, equipo. No elijas por moda.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm1-db
cd sm1-db
```

Crea el archivo `DbChoice.java`:

```java
public class DbChoice {
  static String pick(boolean needsExtensions, boolean teamKnowsMysql) {
    if (needsExtensions) return "postgres";
    if (teamKnowsMysql) return "mysql-or-postgres";
    return "evaluate";
  }
  public static void main(String[] args) {
    System.out.println(pick(true, false));
    System.out.println(pick(false, true));
  }
}
```

```bash
javac DbChoice.java
java DbChoice
```

**Caso de uso real.** Postgres por JSONB/extensiones; MySQL por compatibilidad operativa existente.

**Error común.** Usar features propietarias sin portabilidad consciente.

**Síntoma.** migración difícil entre proveedores. **Causa.** acoplamiento a dialecto. **Corrección.** documentar decisión y abstraer donde valga la pena. **Señal observable.** SQL no portable en tests multi-DB.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `postgres`, `mysql-or-postgres`. **Nota de verificación:** conexión real a Postgres/MySQL no ejecutada aquí.

## Cierre

El borde HTTP y la persistencia son la superficie más atacada y más frágil de un microservicio. Contratos claros, validación, errores consistentes, transacciones y migraciones versionadas evitan deuda operativa temprana.

## Checklist

- Controllers delgados, validación en backend.
- DTOs en borde, no entidades JPA expuestas.
- Errores HTTP consistentes con ProblemDetail.
- Transacciones y consultas seguras.
- Migraciones inmutables y DB elegida por trade-offs.
