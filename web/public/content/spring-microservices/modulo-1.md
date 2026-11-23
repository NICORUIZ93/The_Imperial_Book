# Módulo 1 · Web, datos y migraciones en Tienda Aurora

Un microservicio Spring expone contratos HTTP, valida entrada, traduce errores, persiste datos y evoluciona su esquema. Este módulo cubre la base web + datos con enfoque de contrato, consistencia y operabilidad, usando Tienda Aurora como proyecto integrador.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los smokes ejecutan validación, serialización, error mapping, transacciones simuladas, filtros tipados y migraciones en Java puro. Spring MVC/JPA/Flyway/Liquibase/Hibernate requieren dependencias/infra; se incluyen notas de verificación honestas.

### Tema 1: Spring MVC y DispatcherServlet · Intermedio · 180 min

## Spring MVC: DispatcherServlet y validación

`POST /orders` recibe JSON del frontend. El equipo confía en que el cliente valida. Un día llega `{"sku":"", "qty":0}` y el servicio lo acepta, persiste basura y luego falla en billing. El síntoma no es el 500 posterior; es que la validación estaba en el lugar equivocado.

`DispatcherServlet` es como el recepcionista de un hotel: recibe toda petición, la clasifica, la envía al departamento correcto y entrega la respuesta. El controller es el departamento: orquesta, pero no hace el trabajo de negocio. La validación es el filtro de entrada: si el dato no cumple el contrato, no entra al hotel.

```java
public class MvcValidationSmoke {
    record OrderReq(String sku, Integer qty) {}

    static int handle(OrderReq r) {
        if (r.sku() == null || r.sku().isBlank()) return 400;
        if (r.qty() == null || r.qty() <= 0) return 400;
        return 201;
    }

    public static void main(String[] args) {
        System.out.println("valid=" + handle(new OrderReq("A1", 1)));
        System.out.println("empty-sku=" + handle(new OrderReq("", 1)));
        System.out.println("zero-qty=" + handle(new OrderReq("A1", 0)));
    }
}
```

```bash
javac MvcValidationSmoke.java
java MvcValidationSmoke
```

Salida esperada:

```text
valid=201
empty-sku=400
zero-qty=400
```

En Spring Boot, el controller es delgado y la validación es declarativa:

```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest req) {
        OrderResponse created = service.create(req);
        return ResponseEntity.status(201).body(created);
    }
}
```

El error más común es confiar en validación del cliente. El síntoma son datos inválidos en DB. La causa es falta de Bean Validation en backend. La corrección es `@NotBlank`, `@Min`, `@Valid`, ProblemDetail.

### Tema 2: DTOs, Jackson y validación · Intermedio · 120 min

## DTOs y Jackson: separar contrato de persistencia

El equipo expone la entidad JPA `Order` directamente en la API. Al agregar una columna interna `internalNotes`, el JSON cambia y rompe clientes. Peor: la serialización lazy dispara queries y expone datos sensibles.

Un DTO es como el menú de un restaurante: muestra lo que el cliente puede pedir, no la cocina completa. La entidad JPA es la cocina. Jackson es el mesero que traduce entre menú y cocina. Si dejas que el cliente entre a la cocina, se rompe todo.

```java
public class DtoSmoke {
    record OrderRequest(String sku, int qty) {}
    record OrderResponse(String orderId, String sku, int qty) {}

    static OrderResponse toResponse(String orderId, OrderRequest req) {
        return new OrderResponse(orderId, req.sku(), req.qty());
    }

    public static void main(String[] args) {
        OrderRequest req = new OrderRequest("A1", 2);
        OrderResponse resp = toResponse("o-1", req);
        System.out.println("order-id=" + resp.orderId());
        System.out.println("sku-qty=" + resp.sku() + ":" + resp.qty());
    }
}
```

```bash
javac DtoSmoke.java
java DtoSmoke
```

Salida esperada:

```text
order-id=o-1
sku-qty=A1:2
```

El DTO de respuesta tiene su propia forma (`order_id`, no `id` interno). La entidad JPA puede tener campos que nunca llegan al JSON. El error más común es exponer entidad JPA: el síntoma es lazy loading en serialización, leaks de campos internos.

### Tema 3: Manejo global de excepciones · Intermedio · 120 min

## Manejo global de excepciones con ProblemDetail

Cada controller maneja sus propios try/catch y devuelve formatos distintos: uno devuelve `{"error":"bad"}`, otro devuelve stack trace, otro devuelve 200 con `{"success":false}`. Los clientes no saben cómo interpretar fallos.

Un manejador global de excepciones es como la recepción de emergencias de un hospital: sin importar qué departamento falló, el paciente recibe una respuesta estandarizada. ProblemDetail (RFC 9457) es ese formato estándar.

```java
import java.util.*;

public class ProblemDetailSmoke {
    static Map<String, Object> problem(int status, String title, String detail) {
        return Map.of("status", status, "title", title, "detail", detail);
    }

    static Map<String, Object> mapException(Exception e) {
        if (e instanceof IllegalArgumentException) return problem(400, "Bad Request", e.getMessage());
        if (e instanceof NoSuchElementException) return problem(404, "Not Found", e.getMessage());
        return problem(500, "Internal Server Error", "unexpected error");
    }

    public static void main(String[] args) {
        System.out.println("validation=" + mapException(new IllegalArgumentException("sku is required")).get("status"));
        System.out.println("not-found=" + mapException(new NoSuchElementException("order not found")).get("title"));
    }
}
```

```bash
javac ProblemDetailSmoke.java
java ProblemDetailSmoke
```

Salida esperada:

```text
validation=400
not-found=Not Found
```

En Spring, `@ControllerAdvice` + `@ExceptionHandler` centraliza y ProblemDetail estandariza. El error más común es devolver 200 con error en body: clientes no pueden manejar fallos.

### Tema 4: Spring Data JPA, Hibernate y transacciones · Avanzado · 240 min

## JPA, transacciones y el problema N+1

El equipo crea un pedido con 5 líneas. A mitad del proceso, falla la inserción de la línea 3. Sin transacción, quedan 2 líneas huérfanas. Al listar pedidos, Hibernate dispara 1 query por pedido + 1 por cada línea (N+1). La API tarda 4 segundos para 50 pedidos.

Una transacción es como una operación de cirugía: o se completa entera o se revierte. `@Transactional` es el quirófano: define los límites de la operación. JPA gestiona el ciclo de vida de las entidades como un médico gestiona el estado del paciente.

```java
import java.util.*;

public class TransactionSmoke {
    static class Db {
        final List<String> orders = new ArrayList<>();
        final List<String> lines = new ArrayList<>();
    }

    static void createOrder(Db db, boolean fail) {
        db.orders.add("order-1");
        db.lines.add("line-1");
        if (fail) throw new RuntimeException("boom");
        db.lines.add("line-2");
    }

    static int withoutTransaction(Db db) {
        try { createOrder(db, true); } catch (Exception ignored) {}
        return db.orders.size() + db.lines.size();
    }

    public static void main(String[] args) {
        Db db = new Db();
        System.out.println("orphan-state=" + withoutTransaction(db));
        System.out.println("use-@Transactional");
    }
}
```

```bash
javac TransactionSmoke.java
java TransactionSmoke
```

Salida esperada:

```text
orphan-state=2
use-@Transactional
```

El smoke muestra el problema sin transacción: estado huérfano (1 order + 1 line). `@Transactional` hace rollback automático ante `RuntimeException`. El N+1 es el bug más común: se detecta habilitando logs SQL y observando ráfagas de queries repetidas.

### Tema 5: Criteria/Specifications · Avanzado · 180 min

## Criteria y Specifications: filtros dinámicos sin concatenar SQL

El equipo construye queries dinámicas concatenando strings: `WHERE status = '` + status + `'`. Un input con comilla rompe la query. Un input malicioso inyecta SQL.

Criteria API es como armar una query con bloques de Lego tipados: cada predicado es una pieza que se combina con `and/or`. No concatenas texto; compones objetos.

```java
import java.util.*;
import java.util.function.*;

public class CriteriaSmoke {
    record Order(String status, String customer) {}

    public static void main(String[] args) {
        var orders = List.of(new Order("NEW", "a"), new Order("PAID", "a"), new Order("NEW", "b"));
        Predicate<Order> statusNew = o -> "NEW".equals(o.status());
        Predicate<Order> customerA = o -> "a".equals(o.customer());
        var result = orders.stream().filter(statusNew.and(customerA)).toList();
        System.out.println("filtered-count=" + result.size());
        System.out.println("first=" + result.get(0).status() + ":" + result.get(0).customer());
    }
}
```

```bash
javac CriteriaSmoke.java
java CriteriaSmoke
```

Salida esperada:

```text
filtered-count=1
first=NEW:a
```

El error más común es concatenar SQL/JPQL con input. El síntoma es inyección o queries rotas. La causa es input no parametrizado. La corrección es Criteria/Specifications/bind params.

### Tema 6: Flyway/Liquibase · Intermedio · 120 min

## Flyway: migraciones inmutables

Un desarrollador edita `V1__init.sql` para "corregir" una columna. El checksum de Flyway no coincide y la app no arranca en producción. Otro entorno ya aplicó la migración; el historial es ahora inconsistente.

Las migraciones son como el libro de bitácora de un barco: cada entrada se escribe una vez, en orden, y no se borra. Si te equivocas, escribes una nueva entrada que corrige la anterior.

```java
import java.util.*;

public class MigrationSmoke {
    record Migration(String version, String checksum) {}

    static boolean apply(List<Migration> applied, Migration next) {
        for (Migration m : applied) {
            if (m.version().equals(next.version())) {
                return m.checksum().equals(next.checksum());
            }
        }
        applied.add(next);
        return true;
    }

    public static void main(String[] args) {
        List<Migration> applied = new ArrayList<>();
        System.out.println("first-apply=" + apply(applied, new Migration("V1", "abc")));
        System.out.println("retry-same=" + apply(applied, new Migration("V1", "abc")));
        System.out.println("tampered=" + apply(applied, new Migration("V1", "xyz")));
        System.out.println("new-migration=" + apply(applied, new Migration("V2", "def")));
        System.out.println("total=" + applied.size());
    }
}
```

```bash
javac MigrationSmoke.java
java MigrationSmoke
```

Salida esperada:

```text
first-apply=true
retry-same=true
tampered=false
new-migration=true
total=2
```

El error más común es editar migración aplicada. El síntoma es checksum mismatch, arranque falla. La causa es historial inmutable alterado. La corrección es nueva migración correctiva.

### Tema 7: PostgreSQL y MySQL · Intermedio · 120 min

## PostgreSQL vs MySQL: elegir por requisitos

El equipo elige MySQL "porque todos lo conocen". Luego necesita JSONB, extensiones geoespaciales y full-text avanzado. Migrar a PostgreSQL a mitad del proyecto cuesta semanas. La elección de DB no fue por requisitos, fue por inercia.

Elegir una base de datos es como elegir vehículo: un sedán sirve para la mayoría, pero si necesitas transportar carga pesada, no compras un sedán y luego le agregas un remolque.

```java
public class DbChoiceSmoke {
    static String pick(boolean needsJsonb, boolean needsExtensions, boolean teamMysqlExpertise) {
        if (needsJsonb || needsExtensions) return "postgres";
        if (teamMysqlExpertise && !needsJsonb) return "mysql-or-postgres";
        return "evaluate-with-poc";
    }

    public static void main(String[] args) {
        System.out.println("needs-jsonb=" + pick(true, false, false));
        System.out.println("mysql-expert=" + pick(false, false, true));
    }
}
```

```bash
javac DbChoiceSmoke.java
java DbChoiceSmoke
```

Salida esperada:

```text
needs-jsonb=postgres
mysql-expert=mysql-or-postgres
```

El error más común es usar features propietarias sin portabilidad consciente. La causa es acoplamiento a dialecto. La corrección es documentar decisión (ADR) y abstraer donde valga.

## Cierre

El borde HTTP y la persistencia son la superficie más atacada y más frágil de un microservicio de Tienda Aurora. Contratos claros, validación, errores consistentes, transacciones, migraciones versionadas y elección consciente de DB evitan deuda operativa temprana. Gradle coordina el build multi-módulo con dependencias explícitas por servicio.

## Checklist

- Controllers delgados, validación en backend.
- DTOs en borde, no entidades JPA expuestas.
- Errores HTTP consistentes con ProblemDetail.
- Transacciones y consultas seguras (sin N+1).
- Migraciones inmutables y DB elegida por trade-offs.
- Verificación honesta cuando falta infraestructura.
