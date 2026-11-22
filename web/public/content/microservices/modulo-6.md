# Módulo 2 · APIs REST y persistencia

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Node.js v24.18.0, Docker 29.9.3. Conceptos de contrato/validación/mapeo/errores se verifican con Java/Node puro. Componentes Spring MVC, Spring Data JPA, Hibernate, Flyway, Liquibase, PostgreSQL y MySQL se documentan con ejemplos mínimos y **Nota de verificación** cuando requieren contexto de framework, motor de BD o herramientas externas no ejecutadas en esta pasada.

Este módulo cubre el ciclo completo de una API con persistencia: recepción HTTP, validación, DTOs/serialización, manejo global de errores, JPA/transacciones, consultas dinámicas y migraciones en bases relacionales.

## Aprende construyendo

### Tema 1: Spring MVC: DispatcherServlet, Controllers, Validación · Intermedio · 180 min

Caso guía: exponer `POST /productos` con validación y respuestas HTTP correctas.

#### DispatcherServlet y ciclo request-response

**Definición formal.** `DispatcherServlet` es el front controller de Spring MVC; recibe la petición HTTP, la enruta al handler apropiado mediante `HandlerMapping`, invoca el controlador vía `HandlerAdapter`, aplica conversión/validación y resuelve la respuesta.

**Para qué sirve.** Centraliza el enrutamiento y la infraestructura web, permitiendo controladores enfocados en lógica HTTP.

**Cuándo usarlo y cuándo no.** Úsalo en APIs MVC/basadas en Servlet. No lo uses para entenderlo como "magia": saber el flujo ayuda a depurar 404, 415, 400, 500.

**Ejemplo mínimo enfocado (ejecutable, simulación del enrutamiento).**

```bash
mkdir -p /tmp/ms6-route && cd /tmp/ms6-route
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  static String dispatch(String method, String path) {
    if (method.equals("POST") && path.equals("/productos")) return "201";
    if (method.equals("GET") && path.equals("/productos/1")) return "200";
    return "404";
  }
  public static void main(String[] args){
    System.out.println(dispatch("POST","/productos"));
    System.out.println(dispatch("GET","/x"));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Spring mapea `@PostMapping("/productos")` a un método de controlador.

**Error común.** Esperar 404 de negocio donde corresponde 200 con cuerpo vacío o 404 real por ruta inexistente. Síntoma: contrato inconsistente. Corrección: definir semántica de rutas y códigos.

**Verificación (JDK 27, 2026-05-22).** Salida: `201`, `404`. **Nota:** DispatcherServlet real requiere aplicación Spring Boot con MockMvc o servidor.

#### Controller y ResponseEntity

**Definición formal.** Un `@RestController` expone métodos handler mapeados por anotaciones HTTP; `ResponseEntity<T>` permite controlar status, headers y body.

**Para qué sirve.** Expresar contrato HTTP explícito.

**Cuándo usarlo y cuándo no.** Usa `ResponseEntity` cuando necesites status/headers específicos. Para respuestas simples, retornar el body puede bastar.

**Ejemplo mínimo enfocado (ejecutable, contrato HTTP simulado).**

```bash
mkdir -p /tmp/ms6-resp && cd /tmp/ms6-resp
cat > Main.java << 'JAVA'
record Producto(long id, String nombre) {}
record Resp(int status, String location, Producto body) {}
public class Main {
  static Resp crear(String nombre){ var p=new Producto(1,nombre); return new Resp(201, "/productos/"+p.id(), p); }
  public static void main(String[] args){ var r=crear("Teclado"); System.out.println(r.status()+" "+r.location()+" "+r.body().nombre()); }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `POST` retorna `201 Created` con `Location: /productos/1`.

**Error común.** Devolver 200 en creación. Síntoma: clientes no distinguen creación de consulta. Corrección: usar 201 + Location.

**Verificación (JDK 27, 2026-05-22).** Salida: `201 /productos/1 Teclado`.

#### Bean Validation

**Definición formal.** Bean Validation (Jakarta Validation) declara restricciones sobre campos (`@NotBlank`, `@Size`, `@Min`) evaluadas por un validador; en Spring MVC se activa con `@Valid`.

**Para qué sirve.** Rechazar entradas inválidas en el borde de la API.

**Cuándo usarlo y cuándo no.** Úsalo para validaciones sintácticas/de formato/rango. No lo uses para reglas que requieren estado externo de BD sin contexto adecuado.

**Ejemplo mínimo enfocado (ejecutable, validación manual equivalente).**

```bash
mkdir -p /tmp/ms6-val && cd /tmp/ms6-val
cat > Main.java << 'JAVA'
record CrearProducto(String nombre, Integer precio) {}
public class Main {
  static String validar(CrearProducto c){
    if (c.nombre()==null || c.nombre().isBlank()) return "400:nombre";
    if (c.precio()==null || c.precio() < 0) return "400:precio";
    return "201";
  }
  public static void main(String[] args){
    System.out.println(validar(new CrearProducto("", 10)));
    System.out.println(validar(new CrearProducto("Teclado", 100)));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `@NotBlank String nombre`, `@Positive Integer precio`.

**Error común.** Validar solo en UI. Síntoma: datos inválidos entran por API directa. Corrección: validar en servidor.

**Verificación (JDK 27, 2026-05-22).** Salida: `400:nombre`, `201`. **Nota:** integración `@Valid`/MockMvc requiere Spring Boot.

### Tema 2: DTOs, @JsonProperty, Jackson · Intermedio · 120 min

Caso guía: separar contrato externo de entidad interna y controlar nombres JSON.

#### DTO

**Definición formal.** Un Data Transfer Object (DTO) es un objeto diseñado para transportar datos entre capas/procesos, sin lógica de negocio ni identidad de persistencia.

**Para qué sirve.** Estabiliza contrato API y evita exponer entidades JPA.

**Cuándo usarlo y cuándo no.** Úsalo en bordes de entrada/salida. No reutilices entidades JPA como contrato público.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms6-dto && cd /tmp/ms6-dto
cat > Main.java << 'JAVA'
class ProductoEntity { long id; String nombre; String secretoInterno; ProductoEntity(long id,String n,String s){this.id=id;this.nombre=n;this.secretoInterno=s;} }
record ProductoResponse(long id, String nombre) {}
public class Main {
  static ProductoResponse toResponse(ProductoEntity e){ return new ProductoResponse(e.id, e.nombre); }
  public static void main(String[] args){ var r=toResponse(new ProductoEntity(1,"Teclado","x")); System.out.println(r); }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Respuesta API sin campos internos.

**Error común.** Exponer entidad con lazy relations. Síntoma: `LazyInitializationException` o fuga de datos. Corrección: DTO/mapping explícito.

**Verificación (JDK 27, 2026-05-22).** Salida: `ProductoResponse[id=1, nombre=Teclado]`.

#### @JsonProperty / Jackson mapping

**Definición formal.** Jackson serializa/deserializa JSON a objetos Java; `@JsonProperty` define el nombre JSON de una propiedad.

**Para qué sirve.** Controlar contrato JSON sin forzar nombres internos Java.

**Cuándo usarlo y cuándo no.** Úsalo para compatibilidad de contrato. No mezcles convenciones inconsistente sin documentar.

**Ejemplo mínimo enfocado (ejecutable, simulación de mapeo).**

```bash
mkdir -p /tmp/ms6-json && cd /tmp/ms6-json
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  static Map<String,Object> toJson(long id, String nombreProducto){
    return Map.of("id", id, "nombre_producto", nombreProducto); // simula @JsonProperty("nombre_producto")
  }
  public static void main(String[] args){ System.out.println(toJson(1,"Teclado")); }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `@JsonProperty("nombre_producto") String nombreProducto`.

**Error común.** Cambiar nombre JSON sin versionar. Síntoma: clientes rompen. Corrección: compatibilidad/versionado de contrato.

**Verificación (JDK 27, 2026-05-22).** Salida contiene `nombre_producto=Teclado`. **Nota:** serialización Jackson real requiere dependencia Jackson/Spring Boot.

### Tema 3: Manejo global de excepciones (@ControllerAdvice) · Intermedio · 120 min

Caso guía: devolver errores consistentes con ProblemDetail.

#### @ControllerAdvice / @ExceptionHandler

**Definición formal.** `@ControllerAdvice` permite definir manejo transversal de excepciones/controladores; `@ExceptionHandler` mapea una excepción a una respuesta HTTP.

**Para qué sirve.** Centraliza formato de error y evita try/catch repetido.

**Cuándo usarlo y cuándo no.** Úsalo para errores esperables y mapping consistente. No ocultes excepciones inesperadas sin log/correlación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms6-err && cd /tmp/ms6-err
cat > Main.java << 'JAVA'
class NotFound extends RuntimeException { NotFound(String m){super(m);} }
record Problem(int status, String title, String detail) {}
public class Main {
  static Problem handle(Exception e){
    if (e instanceof NotFound nf) return new Problem(404,"Not Found",nf.getMessage());
    return new Problem(500,"Internal Server Error","unexpected");
  }
  public static void main(String[] args){
    System.out.println(handle(new NotFound("producto 7")));
    System.out.println(handle(new RuntimeException("boom")));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Mapear `EntityNotFoundException` a 404 ProblemDetail.

**Error común.** Devolver stack trace al cliente. Síntoma: fuga de información sensible. Corrección: mensaje seguro, log interno con correlation id.

**Verificación (JDK 27, 2026-05-22).** Salida: `Problem[status=404, title=Not Found, detail=producto 7]` y `Problem[status=500, ...]`.

#### ProblemDetail

**Definición formal.** ProblemDetail (RFC 9457) es un formato estándar para errores HTTP con campos como `type`, `title`, `status`, `detail`, `instance`.

**Para qué sirve.** Contrato de error interoperable y depurable.

**Cuándo usarlo y cuándo no.** Úsalo en APIs públicas/internas. No inventes formatos ad hoc por endpoint.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms6-pd && cd /tmp/ms6-pd
cat > Main.java << 'JAVA'
public class Main {
  static String problem(int status,String title,String detail){
    return "{\"type\":\"about:blank\",\"status\":"+status+",\"title\":\""+title+"\",\"detail\":\""+detail+"\"}";
  }
  public static void main(String[] args){ System.out.println(problem(400,"Bad Request","nombre vacío")); }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Spring 6+ `ProblemDetail`/`ErrorResponse`.

**Error común.** Usar 500 para errores de validación. Corrección: 400/422 según contrato, 404 para no encontrado.

**Verificación (JDK 27, 2026-05-22).** Salida JSON con `status:400`.


### Tema 4: Spring Data JPA, Hibernate, entidades, relaciones, transacciones · Avanzado · 240 min

Caso guía: persistir un pedido con ítems y consistencia transaccional.

#### Entidad JPA

**Definición formal.** Una entidad JPA es un objeto Java mapeado a una tabla relacional mediante metadatos (`@Entity`, `@Id`, `@Column`), gestionado por un EntityManager.

**Para qué sirve.** Modelar persistencia relacional orientada a objetos.

**Cuándo usarlo y cuándo no.** Úsalo en dominios relacionales con ORM. No lo expongas directamente en la API; evita entidades gigantes sin límites.

**Ejemplo mínimo enfocado (esqueleto JPA).**

```java
@Entity
@Table(name = "productos")
public class ProductoEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false)
  private String nombre;
}
```

**Caso de uso real.** Tabla `productos` mapeada a entidad.

**Error común.** Usar `EAGER` en relaciones por defecto. Síntoma: N+1/rendimiento pobre. Corrección: `LAZY` y fetch planificado.

**Verificación.** **Nota de verificación:** requiere Spring Data JPA/Hibernate y base de datos. Validar con `@DataJpaTest` o aplicación Boot + DB.

#### Relaciones y cascadas

**Definición formal.** JPA modela relaciones (`@OneToMany`, `@ManyToOne`, etc.) con dirección, propietario, fetch y cascada.

**Para qué sirve.** Representar asociaciones relacionales.

**Cuándo usarlo y cuándo no.** Modela solo relaciones necesarias. No uses cascadas agresivas sin entender el ciclo de vida.

**Ejemplo mínimo enfocado (esqueleto).**

```java
@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ItemEntity> items = new ArrayList<>();
```

**Caso de uso real.** Pedido con líneas de pedido.

**Error común.** Olvidar lado propietario/mappedBy. Síntoma: tabla join extra o updates inesperados. Corrección: definir owner y sincronizar ambos lados.

**Verificación.** **Nota de verificación:** requiere Hibernate + DB; validar SQL generado y comportamiento de cascada con tests de integración.

#### Transacción

**Definición formal.** Una transacción delimita una unidad atómica de trabajo que se confirma (commit) o revierte (rollback) completa.

**Para qué sirve.** Garantiza consistencia ante fallos parciales.

**Cuándo usarlo y cuándo no.** Úsala en casos de uso que modifican estado. No hagas transacciones largas con llamadas remotas dentro.

**Ejemplo mínimo enfocado (ejecutable, simulación atómica).**

```bash
mkdir -p /tmp/ms6-tx && cd /tmp/ms6-tx
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  static void transfer(Map<String,Integer> db, String from,String to,int amt){
    int a=db.get(from); int b=db.get(to);
    if (a < amt) throw new RuntimeException("saldo");
    db.put(from,a-amt); db.put(to,b+amt); // commit lógico
  }
  public static void main(String[] args){
    var db=new HashMap<>(Map.of("A",100,"B",50));
    try { transfer(db,"A","B",30); System.out.println(db.get("A")+":"+db.get("B")); } catch(Exception e){ System.out.println("rollback"); }
    try { transfer(db,"A","B",1000); } catch(Exception e){ System.out.println("rollback"); }
    System.out.println(db.get("A")+":"+db.get("B"));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `@Transactional` en servicio que crea pedido e ítems.

**Error común.** Self-invocation de método `@Transactional` en la misma clase. Síntoma: transacción no aplica. Corrección: llamar vía proxy bean separado o configurar adecuadamente.

**Verificación (JDK 27, 2026-05-22).** Salida: `70:80`, `rollback`, `70:80`. **Nota:** comportamiento `@Transactional` real requiere proxy Spring.

### Tema 5: Criteria API y Specifications · Avanzado · 180 min

Caso guía: filtrar productos por nombre opcional y precio máximo.

#### Criteria API

**Definición formal.** Criteria API de JPA permite construir consultas tipadas y dinámicas programáticamente mediante objetos `CriteriaBuilder`, `CriteriaQuery` y `Predicate`.

**Para qué sirve.** Consultas dinámicas sin concatenar strings JPQL.

**Cuándo usarlo y cuándo no.** Úsala cuando los filtros son opcionales/combinables. Para consultas fijas simples, JPQL/nombre de método puede ser más claro.

**Ejemplo mínimo enfocado (ejecutable, simulación de predicados).**

```bash
mkdir -p /tmp/ms6-crit && cd /tmp/ms6-crit
cat > Main.java << 'JAVA'
import java.util.*; import java.util.stream.*;
record P(String nombre,int precio){}
public class Main {
  public static void main(String[] args){
    var data=List.of(new P("Teclado",100), new P("Mouse",50), new P("Monitor",900));
    String nombre="Mo"; Integer max=600; // filtros opcionales
    var out=data.stream().filter(p -> nombre==null || p.nombre().contains(nombre))
      .filter(p -> max==null || p.precio()<=max).map(P::nombre).toList();
    System.out.println(out);
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Búsqueda con filtros opcionales en catálogo.

**Error común.** Construir JPQL por concatenación. Síntoma: inyección JPQL/bugs. Corrección: Criteria/parameters.

**Verificación (JDK 27, 2026-05-22).** Salida: `[Mouse]`. **Nota:** Criteria JPA real requiere EntityManager y metamodelo.

#### Specifications (Spring Data)

**Definición formal.** `Specification<T>` es una abstracción de Spring Data JPA que encapsula un predicado reutilizable para consultas Criteria.

**Para qué sirve.** Componer filtros dinámicos legibles y reutilizables.

**Cuándo usarlo y cuándo no.** Úsalo con Spring Data JPA para búsquedas combinables. No lo uses si Query Methods resuelven el caso fijo.

**Ejemplo mínimo enfocado (esqueleto).**

```java
public static Specification<ProductoEntity> nombreContiene(String q) {
  return (root, query, cb) -> q == null ? null : cb.like(root.get("nombre"), "%" + q + "%");
}
```

**Caso de uso real.** `repo.findAll(nombreContiene(q).and(precioMax(max)))`.

**Error común.** No manejar filtros null. Síntoma: `NullPointerException` o predicado inválido. Corrección: retornar `null`/predicate opcional.

**Verificación.** **Nota de verificación:** requiere Spring Data JPA + DB; validar con `@DataJpaTest`.

### Tema 6: Flyway/Liquibase · Intermedio · 120 min

Caso guía: versionar el esquema de base de datos.

#### Migración versionada

**Definición formal.** Una migración de esquema es un cambio versionado y ordenado aplicado a la base de datos para evolucionar su estructura/datos de forma reproducible.

**Para qué sirve.** Evita drift de esquema entre entornos.

**Cuándo usarlo y cuándo no.** Úsala siempre en DB compartidas. No edites migraciones ya aplicadas en entornos compartidos.

**Ejemplo mínimo enfocado (ejecutable con sqlite para concepto SQL).**

```bash
mkdir -p /tmp/ms6-mig && cd /tmp/ms6-mig
cat > V1__create.sql << 'SQL'
CREATE TABLE productos(id INTEGER PRIMARY KEY, nombre TEXT NOT NULL);
SQL
python3 - <<'PY'
import sqlite3
db=sqlite3.connect(':memory:')
db.executescript(open('V1__create.sql').read())
db.execute("INSERT INTO productos(id,nombre) VALUES(1,'Teclado')")
print(db.execute('SELECT nombre FROM productos').fetchone()[0])
PY
```

**Caso de uso real.** Flyway aplica `V1__...sql` al arrancar.

**Error común.** Cambiar una migración aplicada. Síntoma: checksum mismatch. Corrección: crear nueva migración correctiva.

**Verificación (sqlite3/Python, 2026-05-22).** Salida: `Teclado`. **Nota:** Flyway/Liquibase real requiere herramienta y DB objetivo; se verifica el SQL base.

#### Flyway vs Liquibase

**Definición formal.** Flyway y Liquibase son herramientas de migración de BD; Flyway suele usar SQL/versionado simple, Liquibase soporta changelogs en SQL/XML/YAML/JSON y capacidades adicionales de diff/rollback.

**Para qué sirve.** Elegir herramienta según necesidades de control, formato y gobernanza.

**Cuándo usarlo y cuándo no.** Flyway para simplicidad SQL-first; Liquibase para necesidades avanzadas de changelog/abstracción. No mezcles ambas en el mismo esquema sin estrategia clara.

**Ejemplo mínimo enfocado (changelog Liquibase ilustrativo).**

```yaml
databaseChangeLog:
  - changeSet:
      id: 1
      author: team
      changes:
        - createTable:
            tableName: productos
            columns:
              - column: {name: id, type: bigint}
```

**Caso de uso real.** Pipeline CI aplica migraciones antes de desplegar app.

**Error común.** No probar migraciones en copia realista. Corrección: CI con DB real/Testcontainers.

**Verificación.** **Nota de verificación:** requiere Flyway/Liquibase CLI o integración Spring Boot + DB.

### Tema 7: PostgreSQL y MySQL · Intermedio · 120 min

Caso guía: elegir y operar una base relacional con diferencias prácticas.

#### PostgreSQL

**Definición formal.** PostgreSQL es un sistema relacional objeto-relacional open source con fuerte cumplimiento SQL, extensibilidad, tipos ricos, transacciones y concurrencia MVCC.

**Para qué sirve.** Persistencia relacional robusta para muchas cargas de microservicios.

**Cuándo usarlo y cuándo no.** Úsalo cuando necesites SQL avanzado, integridad, extensiones. No lo elijas por defecto sin considerar operación/equipo.

**Ejemplo mínimo enfocado (Docker, ejecutable con daemon).**

```bash
docker run --rm -e POSTGRES_PASSWORD=postgres postgres:16-alpine psql -U postgres -c "SELECT 1;"
```

**Caso de uso real.** Base principal de servicio con JSONB, índices, constraints.

**Error común.** No configurar pool/conexiones. Síntoma: agotamiento de conexiones. Corrección: HikariCP sizing, pgbouncer si aplica.

**Verificación.** **Nota de verificación:** ejecutable con Docker daemon y red para bajar imagen. Si no se ejecuta aquí, validar localmente con comando anterior; salida esperada incluye `1`.

#### MySQL

**Definición formal.** MySQL es un RDBMS relacional ampliamente usado; InnoDB provee transacciones ACID, claves foráneas y row-level locking.

**Para qué sirve.** Persistencia relacional para aplicaciones web/servicios con ecosistema maduro.

**Cuándo usarlo y cuándo no.** Úsalo si tu stack/operación lo estandariza. Considera diferencias de SQL/modos/funciones respecto a PostgreSQL.

**Ejemplo mínimo enfocado (Docker, ejecutable con daemon).**

```bash
docker run --rm -e MYSQL_ROOT_PASSWORD=root mysql:8.4 mysql -uroot -proot -e "SELECT 1;"
```

**Caso de uso real.** DB relacional existente en organización.

**Error común.** Asumir compatibilidad total con PostgreSQL. Síntoma: SQL o comportamiento diferente. Corrección: probar migraciones/queries en motor objetivo.

**Verificación.** **Nota de verificación:** ejecutable con Docker daemon. Salida esperada incluye `1`.

## Cierre del módulo

Una API robusta no solo expone endpoints: valida entrada, separa contrato de persistencia, maneja errores con formato estándar y evoluciona el esquema con migraciones. JPA/Hibernate y las DB relacionales agregan poder, pero exigen entender transacciones, fetch, SQL real y operación.
